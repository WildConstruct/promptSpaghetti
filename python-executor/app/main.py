"""
Python Executor Service - Main FastAPI Application
Story 8.1.2 - REST API Implementation
"""

import asyncio
import hashlib
import json
import logging
import os
import psutil
import sys
import time
import traceback
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional, Union

from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import PlainTextResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import structlog
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .executor import PythonExecutor
from .security import SecurityValidator
from .auth import verify_jwt_token
from .monitoring import setup_monitoring, setup_tracing, ExecutionMonitor

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Metrics
REQUEST_COUNT = Counter(
    'python_executor_requests_total',
    'Total requests to Python executor',
    ['method', 'endpoint', 'status']
)

EXECUTION_DURATION = Histogram(
    'python_executor_execution_seconds',
    'Time spent executing Python code',
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, float('inf')]
)

ACTIVE_EXECUTIONS = Gauge(
    'python_executor_active_executions',
    'Number of currently running executions'
)

EXECUTION_ERRORS = Counter(
    'python_executor_errors_total',
    'Total execution errors',
    ['error_type', 'error_code']
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

# Security
security = HTTPBearer()

# Request/Response Models
class ExecuteRequest(BaseModel):
    code: str = Field(..., description="Python code to execute. Must define a 'transform' function.")
    input: Union[str, dict, list, int, float, bool] = Field(..., description="Input data to pass to the transform function")
    execution_id: str = Field(..., regex=r'^[a-zA-Z0-9\-_]{1,64}$', description="Unique identifier for this execution request")
    timeout: int = Field(30, ge=1, le=300, description="Maximum execution time in seconds")
    memory_limit: str = Field("128MB", regex=r'^[0-9]+[KMGT]?B$', description="Maximum memory usage")
    allowed_modules: List[str] = Field(["re", "json", "datetime", "math", "random"], description="List of Python modules allowed for import")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context data available during execution")

    @validator('code')
    def validate_code_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Code cannot be empty')
        return v

    @validator('memory_limit')
    def validate_memory_limit(cls, v):
        # Convert memory limit to bytes for validation
        units = {'B': 1, 'KB': 1024, 'MB': 1024**2, 'GB': 1024**3, 'TB': 1024**4}
        try:
            if v[-2:] in units:
                size = int(v[:-2]) * units[v[-2:]]
            elif v[-1:] in ['B']:
                size = int(v[:-1])
            else:
                size = int(v)
            
            if size > 2 * 1024**3:  # 2GB limit
                raise ValueError('Memory limit cannot exceed 2GB')
            if size < 1024**2:  # 1MB minimum
                raise ValueError('Memory limit must be at least 1MB')
        except (ValueError, KeyError):
            raise ValueError('Invalid memory limit format')
        return v


class ExecuteResponse(BaseModel):
    success: bool
    result: Optional[Union[str, dict, list, int, float, bool]] = None
    execution_time: Optional[float] = None
    memory_used: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ErrorDetail(BaseModel):
    type: str
    message: str
    code: str
    line: Optional[int] = None
    traceback: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
    execution_time: Optional[float] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ValidateRequest(BaseModel):
    code: str
    allowed_modules: List[str] = Field(["re", "json", "datetime", "math", "random"])


class ValidateResponse(BaseModel):
    valid: bool
    errors: List[Dict[str, Any]] = Field(default_factory=list)
    warnings: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class HealthResponse(BaseModel):
    status: str
    python_version: str
    active_executions: int
    system_info: Dict[str, float]
    uptime_seconds: int
    checks: Dict[str, Dict[str, Any]] = Field(default_factory=dict)


# Global state
executor = None
security_validator = None
start_time = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    global executor, security_validator
    
    logger.info("python_executor_starting", version="1.0.0")
    
    # Initialize components
    executor = PythonExecutor()
    security_validator = SecurityValidator()
    
    # Setup monitoring
    setup_monitoring(app)
    setup_tracing(app)
    
    logger.info("python_executor_ready")
    
    yield
    
    logger.info("python_executor_shutting_down")
    
    # Cleanup
    if executor:
        await executor.shutdown()


# Create FastAPI app
app = FastAPI(
    title="Python Executor Service",
    description="Secure Python code execution service for prompt-spaghetti node graphs",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://promptspaghetti.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.promptspaghetti.com"]
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Authentication dependency
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token from main application"""
    try:
        payload = verify_jwt_token(credentials.credentials)
        return payload
    except Exception as e:
        logger.warning("authentication_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )


# Middleware for request/response logging and metrics
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration = time.time() - start_time
    
    # Log request
    logger.info(
        "request_completed",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        duration=duration,
        client_ip=get_remote_address(request)
    )
    
    # Update metrics
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=str(response.status_code)
    ).inc()
    
    return response


# API Endpoints

@app.post("/v1/execute", response_model=ExecuteResponse, responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}})
@limiter.limit("10/minute")
async def execute_code(
    request: Request,
    execute_request: ExecuteRequest,
    user: dict = Depends(verify_token)
):
    """Execute Python code in a secure, sandboxed environment"""
    
    ACTIVE_EXECUTIONS.inc()
    start_time = time.time()
    
    try:
        user_id = user.get('user_id', 'unknown')
        
        # Start execution monitoring
        with ExecutionMonitor(execute_request.execution_id, user_id) as monitor:
            logger.info(
                "execution_started",
                execution_id=execute_request.execution_id,
                code_hash=hashlib.md5(execute_request.code.encode()).hexdigest(),
                timeout=execute_request.timeout,
                user_id=user_id,
                allowed_modules=execute_request.allowed_modules
            )
            
            # Validate code security
            validation_result = security_validator.validate_code(
                execute_request.code,
                execute_request.allowed_modules
            )
            
            if not validation_result.valid:
                monitor.record_validation_failure("code_validation_failed")
                
                logger.warning(
                    "code_validation_failed",
                    execution_id=execute_request.execution_id,
                    errors=validation_result.errors
                )
                
                EXECUTION_ERRORS.labels(
                    error_type="ValidationError",
                    error_code="CODE_VALIDATION_FAILED"
                ).inc()
                
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=ErrorResponse(
                        error=ErrorDetail(
                            type="ValidationError",
                            message=f"Code validation failed: {'; '.join(validation_result.errors)}",
                            code="CODE_VALIDATION_FAILED",
                            details={"validation_errors": validation_result.errors}
                        ),
                        execution_time=time.time() - start_time,
                        metadata={"execution_id": execute_request.execution_id}
                    ).dict()
                )
            
            # Execute code
            execution_result = await executor.execute(
                code=execute_request.code,
                input_data=execute_request.input,
                timeout=execute_request.timeout,
                memory_limit=execute_request.memory_limit,
                allowed_modules=execute_request.allowed_modules,
                context=execute_request.context or {}
            )
            
            execution_time = time.time() - start_time
            EXECUTION_DURATION.observe(execution_time)
            
            # Record memory usage in monitoring
            if execution_result.memory_used:
                try:
                    # Parse memory usage string (e.g., "12MB") to bytes
                    memory_str = execution_result.memory_used.replace('MB', '').replace('KB', '').replace('GB', '').replace('B', '')
                    if 'MB' in execution_result.memory_used:
                        memory_bytes = int(float(memory_str)) * 1024 * 1024
                    elif 'KB' in execution_result.memory_used:
                        memory_bytes = int(float(memory_str)) * 1024
                    elif 'GB' in execution_result.memory_used:
                        memory_bytes = int(float(memory_str)) * 1024 * 1024 * 1024
                    else:
                        memory_bytes = int(float(memory_str))
                    monitor.record_memory_usage(memory_bytes)
                except (ValueError, AttributeError):
                    pass
            
            if execution_result.success:
                logger.info(
                    "execution_completed",
                    execution_id=execute_request.execution_id,
                    duration=execution_time,
                    memory_used=execution_result.memory_used,
                    success=True
                )
                
                return ExecuteResponse(
                    success=True,
                    result=execution_result.result,
                    execution_time=execution_time,
                    memory_used=execution_result.memory_used,
                    warnings=execution_result.warnings,
                    metadata={
                        "execution_id": execute_request.execution_id,
                        "python_version": sys.version.split()[0],
                        "modules_imported": execution_result.modules_imported,
                        "cache_hit": execution_result.cache_hit
                    }
                )
            else:
                logger.error(
                    "execution_failed",
                    execution_id=execute_request.execution_id,
                    error_type=execution_result.error_type,
                    error_message=execution_result.error_message,
                    duration=execution_time
                )
                
                EXECUTION_ERRORS.labels(
                    error_type=execution_result.error_type,
                    error_code=execution_result.error_code
                ).inc()
                
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=ErrorResponse(
                        error=ErrorDetail(
                            type=execution_result.error_type,
                            message=execution_result.error_message,
                            code=execution_result.error_code,
                            line=execution_result.error_line,
                            traceback=execution_result.traceback
                        ),
                        execution_time=execution_time,
                        metadata={"execution_id": execute_request.execution_id}
                    ).dict()
                )
    
    except HTTPException:
        raise
    except Exception as e:
        execution_time = time.time() - start_time
        
        logger.error(
            "execution_unexpected_error",
            execution_id=execute_request.execution_id,
            error=str(e),
            traceback=traceback.format_exc(),
            duration=execution_time
        )
        
        EXECUTION_ERRORS.labels(
            error_type="InternalError",
            error_code="INTERNAL_ERROR"
        ).inc()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                error=ErrorDetail(
                    type="InternalError",
                    message="An unexpected error occurred during execution",
                    code="INTERNAL_ERROR"
                ),
                execution_time=execution_time,
                metadata={"execution_id": execute_request.execution_id}
            ).dict()
        )
    
    finally:
        ACTIVE_EXECUTIONS.dec()


@app.post("/v1/validate", response_model=ValidateResponse)
@limiter.limit("30/minute")
async def validate_code(
    request: Request,
    validate_request: ValidateRequest,
    user: dict = Depends(verify_token)
):
    """Validate Python code without execution"""
    
    logger.info(
        "validation_started",
        code_hash=hashlib.md5(validate_request.code.encode()).hexdigest(),
        user_id=user.get('user_id', 'unknown')
    )
    
    try:
        validation_result = security_validator.validate_code(
            validate_request.code,
            validate_request.allowed_modules
        )
        
        # Additional analysis
        complexity_score = security_validator.analyze_complexity(validate_request.code)
        estimated_time = security_validator.estimate_execution_time(validate_request.code)
        imports_detected = security_validator.detect_imports(validate_request.code)
        
        logger.info(
            "validation_completed",
            valid=validation_result.valid,
            complexity_score=complexity_score,
            imports_count=len(imports_detected)
        )
        
        return ValidateResponse(
            valid=validation_result.valid,
            errors=[{"type": "SecurityError", "message": error, "line": None} for error in validation_result.errors],
            warnings=[{"type": "Warning", "message": warning, "line": None} for warning in validation_result.warnings],
            metadata={
                "complexity_score": complexity_score,
                "estimated_execution_time": estimated_time,
                "imports_detected": imports_detected
            }
        )
    
    except Exception as e:
        logger.error("validation_error", error=str(e), traceback=traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Validation service temporarily unavailable"
        )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    
    checks = {}
    
    # Check system resources
    try:
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        checks["memory"] = {
            "healthy": memory.percent < 90,
            "message": f"Memory usage: {memory.percent}%",
            "last_check": time.time()
        }
        
        checks["disk"] = {
            "healthy": disk.percent < 85,
            "message": f"Disk usage: {disk.percent}%",
            "last_check": time.time()
        }
    except Exception as e:
        checks["system"] = {
            "healthy": False,
            "message": f"System check failed: {str(e)}",
            "last_check": time.time()
        }
    
    # Check Python interpreter
    try:
        exec("x = 1 + 1", {})
        checks["python_interpreter"] = {
            "healthy": True,
            "message": "Python interpreter working",
            "last_check": time.time()
        }
    except Exception as e:
        checks["python_interpreter"] = {
            "healthy": False,
            "message": f"Python interpreter error: {str(e)}",
            "last_check": time.time()
        }
    
    # Check executor service
    if executor:
        checks["executor"] = {
            "healthy": True,
            "message": "Executor service available",
            "last_check": time.time()
        }
    else:
        checks["executor"] = {
            "healthy": False,
            "message": "Executor service not initialized",
            "last_check": time.time()
        }
    
    # Overall health
    healthy = all(check.get("healthy", True) for check in checks.values())
    
    # System info
    memory = psutil.virtual_memory()
    cpu_percent = psutil.cpu_percent(interval=1)
    disk = psutil.disk_usage('/')
    
    return HealthResponse(
        status="healthy" if healthy else "unhealthy",
        python_version=sys.version.split()[0],
        active_executions=int(ACTIVE_EXECUTIONS._value.get()),
        system_info={
            "memory_usage_percent": memory.percent,
            "cpu_usage_percent": cpu_percent,
            "disk_usage_percent": disk.percent
        },
        uptime_seconds=int(time.time() - start_time),
        checks=checks
    )


@app.get("/metrics", response_class=PlainTextResponse)
async def get_metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()


# Error handlers
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    response = ErrorResponse(
        error=ErrorDetail(
            type="RateLimitError",
            message="Rate limit exceeded",
            code="RATE_LIMIT_EXCEEDED"
        )
    )
    return JSONResponse(
        status_code=429,
        content=response.dict(),
        headers={"Retry-After": str(exc.retry_after)}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_config={
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                },
            },
            "handlers": {
                "default": {
                    "formatter": "default",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
            },
            "root": {
                "level": "INFO",
                "handlers": ["default"],
            },
        }
    )
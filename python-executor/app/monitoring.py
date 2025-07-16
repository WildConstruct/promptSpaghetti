"""
Monitoring and observability setup for Python Executor Service
Includes Prometheus metrics, OpenTelemetry tracing, and health checks
"""

import time
from typing import Dict, Any, Optional
from contextvars import ContextVar

from fastapi import FastAPI
from prometheus_client import Counter, Histogram, Gauge, Info, generate_latest
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.psutil import PsutilInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource
import structlog

logger = structlog.get_logger()

# Context variable for request tracing
request_id_context: ContextVar[str] = ContextVar('request_id', default='')

# Prometheus Metrics
METRICS = {
    # Request metrics
    'requests_total': Counter(
        'python_executor_requests_total',
        'Total HTTP requests',
        ['method', 'endpoint', 'status_code', 'user_id']
    ),
    
    'request_duration': Histogram(
        'python_executor_request_duration_seconds',
        'HTTP request duration',
        ['method', 'endpoint', 'status_code'],
        buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
    ),
    
    # Execution metrics
    'executions_total': Counter(
        'python_executor_executions_total',
        'Total code executions',
        ['status', 'error_type', 'user_id']
    ),
    
    'execution_duration': Histogram(
        'python_executor_execution_duration_seconds',
        'Code execution duration',
        ['status', 'complexity_level'],
        buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0]
    ),
    
    'active_executions': Gauge(
        'python_executor_active_executions',
        'Currently running executions'
    ),
    
    'execution_memory_usage': Histogram(
        'python_executor_memory_usage_bytes',
        'Memory usage during execution',
        buckets=[1024**2, 5*1024**2, 10*1024**2, 25*1024**2, 50*1024**2, 100*1024**2, 250*1024**2, 500*1024**2]
    ),
    
    # Security metrics
    'validation_failures': Counter(
        'python_executor_validation_failures_total',
        'Failed code validations',
        ['failure_type', 'user_id']
    ),
    
    'security_violations': Counter(
        'python_executor_security_violations_total',
        'Security violations detected',
        ['violation_type', 'user_id']
    ),
    
    # Cache metrics
    'cache_operations': Counter(
        'python_executor_cache_operations_total',
        'Cache operations',
        ['operation', 'result']  # operation: get/set/evict, result: hit/miss/success/failure
    ),
    
    'cache_size': Gauge(
        'python_executor_cache_size_entries',
        'Number of entries in execution cache'
    ),
    
    # System metrics
    'rate_limit_hits': Counter(
        'python_executor_rate_limit_hits_total',
        'Rate limit violations',
        ['endpoint', 'user_id', 'limit_type']
    ),
    
    'auth_failures': Counter(
        'python_executor_auth_failures_total',
        'Authentication failures',
        ['failure_type']
    ),
    
    # Service info
    'service_info': Info(
        'python_executor_service_info',
        'Service information'
    )
}

# OpenTelemetry tracer
tracer = trace.get_tracer(__name__)


def setup_monitoring(app: FastAPI):
    """
    Setup monitoring instrumentation for the FastAPI application
    
    Args:
        app: FastAPI application instance
    """
    
    logger.info("setting_up_monitoring")
    
    # Set service info
    METRICS['service_info'].info({
        'version': '1.0.0',
        'service': 'python-executor',
        'environment': 'development'  # Should come from env var
    })
    
    # Add custom middleware for detailed metrics
    @app.middleware("http")
    async def monitoring_middleware(request, call_next):
        start_time = time.time()
        
        # Generate request ID
        request_id = f"req_{int(time.time() * 1000000)}"
        request_id_context.set(request_id)
        
        # Process request
        response = await call_next(request)
        
        # Calculate metrics
        duration = time.time() - start_time
        
        # Extract user info if available
        user_id = getattr(request.state, 'user_id', 'anonymous')
        
        # Update metrics
        METRICS['requests_total'].labels(
            method=request.method,
            endpoint=request.url.path,
            status_code=response.status_code,
            user_id=user_id
        ).inc()
        
        METRICS['request_duration'].labels(
            method=request.method,
            endpoint=request.url.path,
            status_code=response.status_code
        ).observe(duration)
        
        # Add response headers for observability
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration:.3f}s"
        
        return response
    
    logger.info("monitoring_setup_complete")


def setup_tracing(app: FastAPI):
    """
    Setup OpenTelemetry distributed tracing
    
    Args:
        app: FastAPI application instance
    """
    
    logger.info("setting_up_tracing")
    
    # Configure resource
    resource = Resource.create({
        "service.name": "python-executor",
        "service.version": "1.0.0",
        "service.instance.id": "python-executor-1",
        "deployment.environment": "development"
    })
    
    # Setup tracer provider
    trace.set_tracer_provider(TracerProvider(resource=resource))
    
    # Setup Jaeger exporter (optional - only if Jaeger is available)
    try:
        jaeger_exporter = JaegerExporter(
            agent_host_name="localhost",
            agent_port=6831,
        )
        
        span_processor = BatchSpanProcessor(jaeger_exporter)
        trace.get_tracer_provider().add_span_processor(span_processor)
        
        logger.info("jaeger_tracing_enabled")
    except Exception as e:
        logger.warning("jaeger_setup_failed", error=str(e))
    
    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)
    
    # Instrument HTTP requests
    RequestsInstrumentor().instrument()
    
    # Instrument system metrics
    PsutilInstrumentor().instrument()
    
    logger.info("tracing_setup_complete")


class ExecutionMonitor:
    """Monitors individual code executions with detailed metrics"""
    
    def __init__(self, execution_id: str, user_id: str = 'anonymous'):
        self.execution_id = execution_id
        self.user_id = user_id
        self.start_time = time.time()
        self.span = None
        
        # Increment active executions
        METRICS['active_executions'].inc()
        
        logger.info("execution_monitor_started", execution_id=execution_id)
    
    def __enter__(self):
        """Start monitoring context"""
        # Create tracing span
        self.span = tracer.start_span(
            "code_execution",
            attributes={
                "execution.id": self.execution_id,
                "user.id": self.user_id,
                "request.id": request_id_context.get()
            }
        )
        
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """End monitoring context"""
        duration = time.time() - self.start_time
        
        # Determine execution status
        if exc_type is None:
            status = "success"
            error_type = "none"
        else:
            status = "failure"
            error_type = exc_type.__name__ if exc_type else "unknown"
        
        # Update metrics
        METRICS['executions_total'].labels(
            status=status,
            error_type=error_type,
            user_id=self.user_id
        ).inc()
        
        # Determine complexity level for duration metric
        complexity_level = "low"
        if duration > 1.0:
            complexity_level = "medium"
        if duration > 5.0:
            complexity_level = "high"
        
        METRICS['execution_duration'].labels(
            status=status,
            complexity_level=complexity_level
        ).observe(duration)
        
        # Decrement active executions
        METRICS['active_executions'].dec()
        
        # Update tracing span
        if self.span:
            self.span.set_attribute("execution.duration", duration)
            self.span.set_attribute("execution.status", status)
            
            if exc_type:
                self.span.set_attribute("execution.error_type", error_type)
                self.span.set_attribute("execution.error_message", str(exc_val))
                self.span.record_exception(exc_val)
            
            self.span.end()
        
        logger.info(
            "execution_monitor_completed",
            execution_id=self.execution_id,
            duration=duration,
            status=status,
            error_type=error_type
        )
    
    def record_memory_usage(self, memory_bytes: int):
        """Record memory usage for this execution"""
        METRICS['execution_memory_usage'].observe(memory_bytes)
        
        if self.span:
            self.span.set_attribute("execution.memory_bytes", memory_bytes)
    
    def record_validation_failure(self, failure_type: str):
        """Record a validation failure"""
        METRICS['validation_failures'].labels(
            failure_type=failure_type,
            user_id=self.user_id
        ).inc()
        
        if self.span:
            self.span.set_attribute("validation.failure_type", failure_type)
    
    def record_security_violation(self, violation_type: str):
        """Record a security violation"""
        METRICS['security_violations'].labels(
            violation_type=violation_type,
            user_id=self.user_id
        ).inc()
        
        if self.span:
            self.span.set_attribute("security.violation_type", violation_type)


class CacheMonitor:
    """Monitors cache operations"""
    
    @staticmethod
    def record_cache_operation(operation: str, result: str):
        """
        Record cache operation
        
        Args:
            operation: get, set, evict
            result: hit, miss, success, failure
        """
        METRICS['cache_operations'].labels(
            operation=operation,
            result=result
        ).inc()
    
    @staticmethod
    def update_cache_size(size: int):
        """Update cache size metric"""
        METRICS['cache_size'].set(size)


class SecurityMonitor:
    """Monitors security-related events"""
    
    @staticmethod
    def record_auth_failure(failure_type: str):
        """
        Record authentication failure
        
        Args:
            failure_type: token_expired, token_invalid, token_missing, etc.
        """
        METRICS['auth_failures'].labels(
            failure_type=failure_type
        ).inc()
        
        logger.warning("auth_failure_recorded", failure_type=failure_type)
    
    @staticmethod
    def record_rate_limit_hit(endpoint: str, user_id: str, limit_type: str):
        """
        Record rate limit violation
        
        Args:
            endpoint: API endpoint that was rate limited
            user_id: User who hit the limit
            limit_type: per_minute, per_hour, etc.
        """
        METRICS['rate_limit_hits'].labels(
            endpoint=endpoint,
            user_id=user_id,
            limit_type=limit_type
        ).inc()
        
        logger.warning(
            "rate_limit_hit",
            endpoint=endpoint,
            user_id=user_id,
            limit_type=limit_type
        )


def get_metrics_summary() -> Dict[str, Any]:
    """
    Get a summary of current metrics for health checks
    
    Returns:
        Dict containing metric summaries
    """
    
    try:
        return {
            "active_executions": int(METRICS['active_executions']._value.get()),
            "total_requests": int(METRICS['requests_total']._value.sum()),
            "total_executions": int(METRICS['executions_total']._value.sum()),
            "cache_size": int(METRICS['cache_size']._value.get()),
            "rate_limit_violations": int(METRICS['rate_limit_hits']._value.sum()),
            "auth_failures": int(METRICS['auth_failures']._value.sum())
        }
    except Exception as e:
        logger.error("metrics_summary_error", error=str(e))
        return {"error": "Unable to retrieve metrics"}


def create_custom_span(name: str, attributes: Optional[Dict[str, Any]] = None):
    """
    Create a custom tracing span
    
    Args:
        name: Span name
        attributes: Optional span attributes
        
    Returns:
        OpenTelemetry span context manager
    """
    
    span = tracer.start_span(name)
    
    if attributes:
        for key, value in attributes.items():
            span.set_attribute(key, value)
    
    # Add request context
    request_id = request_id_context.get()
    if request_id:
        span.set_attribute("request.id", request_id)
    
    return span
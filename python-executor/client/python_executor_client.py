"""
Python Executor Client Library
Client for interacting with the Python Executor Service from the main application
"""

import asyncio
import json
import time
import uuid
from typing import Any, Dict, List, Optional, Union
from urllib.parse import urljoin

import httpx
import structlog

logger = structlog.get_logger()


class PythonExecutorError(Exception):
    """Base exception for Python Executor client errors"""
    pass


class ValidationError(PythonExecutorError):
    """Raised when code validation fails"""
    pass


class ExecutionError(PythonExecutorError):
    """Raised when code execution fails"""
    pass


class TimeoutError(PythonExecutorError):
    """Raised when execution times out"""
    pass


class AuthenticationError(PythonExecutorError):
    """Raised when authentication fails"""
    pass


class RateLimitError(PythonExecutorError):
    """Raised when rate limit is exceeded"""
    pass


class ExecutionResult:
    """Result of code execution"""
    
    def __init__(self, response_data: Dict[str, Any]):
        self.success = response_data.get('success', False)
        self.result = response_data.get('result')
        self.execution_time = response_data.get('execution_time')
        self.memory_used = response_data.get('memory_used')
        self.warnings = response_data.get('warnings', [])
        self.metadata = response_data.get('metadata', {})
        
        # Error details (if present)
        error_data = response_data.get('error', {})
        self.error_type = error_data.get('type')
        self.error_message = error_data.get('message')
        self.error_code = error_data.get('code')
        self.error_line = error_data.get('line')
        self.traceback = error_data.get('traceback')
    
    def __repr__(self):
        if self.success:
            return f"ExecutionResult(success=True, result={self.result})"
        else:
            return f"ExecutionResult(success=False, error={self.error_message})"


class ValidationResult:
    """Result of code validation"""
    
    def __init__(self, response_data: Dict[str, Any]):
        self.valid = response_data.get('valid', False)
        self.errors = response_data.get('errors', [])
        self.warnings = response_data.get('warnings', [])
        self.metadata = response_data.get('metadata', {})
    
    def __repr__(self):
        return f"ValidationResult(valid={self.valid}, errors={len(self.errors)}, warnings={len(self.warnings)})"


class PythonExecutorClient:
    """
    Client for interacting with the Python Executor Service
    """
    
    def __init__(
        self,
        base_url: str,
        auth_token: str,
        timeout: int = 60,
        max_retries: int = 3,
        backoff_factor: float = 1.0
    ):
        """
        Initialize Python Executor client
        
        Args:
            base_url: Base URL of the Python Executor Service
            auth_token: JWT authentication token
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts
            backoff_factor: Backoff factor for retries
        """
        
        self.base_url = base_url.rstrip('/')
        self.auth_token = auth_token
        self.timeout = timeout
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor
        
        # HTTP client configuration
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(timeout),
            headers={
                'Authorization': f'Bearer {auth_token}',
                'Content-Type': 'application/json',
                'User-Agent': 'prompt-spaghetti/1.0.0'
            }
        )
        
        logger.info(
            "python_executor_client_initialized",
            base_url=base_url,
            timeout=timeout
        )
    
    async def execute_code(
        self,
        code: str,
        input_data: Any,
        timeout: int = 30,
        memory_limit: str = "128MB",
        allowed_modules: Optional[List[str]] = None,
        context: Optional[Dict[str, Any]] = None,
        execution_id: Optional[str] = None
    ) -> ExecutionResult:
        """
        Execute Python code in the remote executor
        
        Args:
            code: Python code to execute (must define 'transform' function)
            input_data: Data to pass to the transform function
            timeout: Maximum execution time in seconds
            memory_limit: Maximum memory usage (e.g., "128MB")
            allowed_modules: List of allowed Python modules
            context: Additional context data
            execution_id: Unique execution identifier (auto-generated if not provided)
            
        Returns:
            ExecutionResult containing the execution outcome
            
        Raises:
            ValidationError: If code validation fails
            ExecutionError: If code execution fails
            TimeoutError: If execution times out
            AuthenticationError: If authentication fails
            RateLimitError: If rate limit is exceeded
        """
        
        if execution_id is None:
            execution_id = f"exec-{uuid.uuid4().hex[:16]}"
        
        if allowed_modules is None:
            allowed_modules = ["re", "json", "datetime", "math", "random"]
        
        payload = {
            "code": code,
            "input": input_data,
            "execution_id": execution_id,
            "timeout": timeout,
            "memory_limit": memory_limit,
            "allowed_modules": allowed_modules,
            "context": context or {}
        }
        
        logger.info(
            "execution_request_starting",
            execution_id=execution_id,
            timeout=timeout,
            memory_limit=memory_limit
        )
        
        try:
            response_data = await self._make_request(
                "POST",
                "/v1/execute",
                payload
            )
            
            result = ExecutionResult(response_data)
            
            logger.info(
                "execution_request_completed",
                execution_id=execution_id,
                success=result.success,
                execution_time=result.execution_time
            )
            
            if not result.success:
                # Raise appropriate exception based on error type
                if result.error_type == "ValidationError":
                    raise ValidationError(result.error_message)
                elif result.error_type == "TimeoutError":
                    raise TimeoutError(result.error_message)
                else:
                    raise ExecutionError(result.error_message)
            
            return result
            
        except httpx.TimeoutException:
            logger.error("execution_request_timeout", execution_id=execution_id)
            raise TimeoutError(f"Request timed out after {self.timeout}s")
        
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                raise AuthenticationError("Authentication failed")
            elif e.response.status_code == 429:
                raise RateLimitError("Rate limit exceeded")
            else:
                error_data = e.response.json() if e.response.content else {}
                error_msg = error_data.get('error', {}).get('message', str(e))
                raise ExecutionError(f"HTTP {e.response.status_code}: {error_msg}")
    
    async def validate_code(
        self,
        code: str,
        allowed_modules: Optional[List[str]] = None
    ) -> ValidationResult:
        """
        Validate Python code without executing it
        
        Args:
            code: Python code to validate
            allowed_modules: List of allowed modules for validation
            
        Returns:
            ValidationResult containing validation outcome
            
        Raises:
            AuthenticationError: If authentication fails
            RateLimitError: If rate limit is exceeded
        """
        
        if allowed_modules is None:
            allowed_modules = ["re", "json", "datetime", "math", "random"]
        
        payload = {
            "code": code,
            "allowed_modules": allowed_modules
        }
        
        logger.info("validation_request_starting")
        
        try:
            response_data = await self._make_request(
                "POST",
                "/v1/validate",
                payload
            )
            
            result = ValidationResult(response_data)
            
            logger.info(
                "validation_request_completed",
                valid=result.valid,
                errors=len(result.errors),
                warnings=len(result.warnings)
            )
            
            return result
            
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                raise AuthenticationError("Authentication failed")
            elif e.response.status_code == 429:
                raise RateLimitError("Rate limit exceeded")
            else:
                raise PythonExecutorError(f"Validation failed: HTTP {e.response.status_code}")
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Check the health status of the Python Executor Service
        
        Returns:
            Dict containing health status information
            
        Raises:
            PythonExecutorError: If health check fails
        """
        
        try:
            response_data = await self._make_request("GET", "/health")
            
            logger.info(
                "health_check_completed",
                status=response_data.get('status'),
                active_executions=response_data.get('active_executions')
            )
            
            return response_data
            
        except Exception as e:
            logger.error("health_check_failed", error=str(e))
            raise PythonExecutorError(f"Health check failed: {str(e)}")
    
    async def get_metrics(self) -> str:
        """
        Get Prometheus metrics from the executor service
        
        Returns:
            Prometheus metrics as text
            
        Raises:
            PythonExecutorError: If metrics retrieval fails
        """
        
        try:
            response = await self.client.get(f"{self.base_url}/metrics")
            response.raise_for_status()
            
            return response.text
            
        except Exception as e:
            logger.error("metrics_retrieval_failed", error=str(e))
            raise PythonExecutorError(f"Metrics retrieval failed: {str(e)}")
    
    async def _make_request(
        self,
        method: str,
        endpoint: str,
        payload: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make HTTP request with retry logic
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint
            payload: Request payload (for POST requests)
            
        Returns:
            Response data as dictionary
            
        Raises:
            httpx.HTTPStatusError: For HTTP errors
            httpx.TimeoutException: For timeout errors
        """
        
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(self.max_retries + 1):
            try:
                if method.upper() == "GET":
                    response = await self.client.get(url)
                elif method.upper() == "POST":
                    response = await self.client.post(url, json=payload)
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")
                
                response.raise_for_status()
                return response.json()
                
            except httpx.HTTPStatusError as e:
                # Don't retry 4xx errors (except 429)
                if 400 <= e.response.status_code < 500 and e.response.status_code != 429:
                    raise
                
                if attempt == self.max_retries:
                    raise
                
                # Wait before retry
                wait_time = self.backoff_factor * (2 ** attempt)
                logger.warning(
                    "request_retry",
                    attempt=attempt + 1,
                    wait_time=wait_time,
                    status_code=e.response.status_code
                )
                await asyncio.sleep(wait_time)
                
            except (httpx.TimeoutException, httpx.ConnectError) as e:
                if attempt == self.max_retries:
                    raise
                
                # Wait before retry
                wait_time = self.backoff_factor * (2 ** attempt)
                logger.warning(
                    "request_retry",
                    attempt=attempt + 1,
                    wait_time=wait_time,
                    error=str(e)
                )
                await asyncio.sleep(wait_time)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
        logger.info("python_executor_client_closed")
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()


# Factory function for easy client creation
def create_client(
    base_url: str,
    auth_token: str,
    **kwargs
) -> PythonExecutorClient:
    """
    Create a Python Executor client instance
    
    Args:
        base_url: Base URL of the Python Executor Service
        auth_token: JWT authentication token
        **kwargs: Additional client configuration
        
    Returns:
        PythonExecutorClient instance
    """
    
    return PythonExecutorClient(base_url, auth_token, **kwargs)


# Async context manager for client lifecycle
async def executor_client(
    base_url: str,
    auth_token: str,
    **kwargs
):
    """
    Async context manager for Python Executor client
    
    Args:
        base_url: Base URL of the Python Executor Service
        auth_token: JWT authentication token
        **kwargs: Additional client configuration
        
    Yields:
        PythonExecutorClient instance
    """
    
    client = create_client(base_url, auth_token, **kwargs)
    try:
        yield client
    finally:
        await client.close()
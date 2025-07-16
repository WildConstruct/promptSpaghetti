"""
Python Code Executor with RestrictedPython
Secure execution of user-provided Python code in sandboxed environment
"""

import asyncio
import gc
import hashlib
import json
import psutil
import resource
import signal
import sys
import time
import traceback
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set, Union

from RestrictedPython import compile_restricted, safe_globals
import structlog

logger = structlog.get_logger()


@dataclass
class ExecutionResult:
    """Result of code execution"""
    success: bool
    result: Optional[Any] = None
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    error_code: Optional[str] = None
    error_line: Optional[int] = None
    traceback: Optional[str] = None
    execution_time: float = 0.0
    memory_used: str = "0MB"
    warnings: List[str] = None
    modules_imported: List[str] = None
    cache_hit: bool = False
    
    def __post_init__(self):
        if self.warnings is None:
            self.warnings = []
        if self.modules_imported is None:
            self.modules_imported = []


class ExecutionTimeout(Exception):
    """Raised when code execution exceeds timeout"""
    pass


class MemoryLimitExceeded(Exception):
    """Raised when code execution exceeds memory limit"""
    pass


class PythonExecutor:
    """Secure Python code executor with resource monitoring"""
    
    def __init__(self):
        self.cache: Dict[str, ExecutionResult] = {}
        self.active_executions: Set[str] = set()
        self.default_allowed_modules = {
            're', 'json', 'datetime', 'math', 'random', 'string', 'itertools',
            'collections', 'functools', 'operator', 'copy', 'uuid', 'hashlib'
        }
        
        logger.info("python_executor_initialized")
    
    async def execute(
        self,
        code: str,
        input_data: Any,
        timeout: int = 30,
        memory_limit: str = "128MB",
        allowed_modules: List[str] = None,
        context: Dict[str, Any] = None
    ) -> ExecutionResult:
        """
        Execute Python code in a restricted environment
        
        Args:
            code: Python code to execute (must define 'transform' function)
            input_data: Data to pass to the transform function
            timeout: Maximum execution time in seconds
            memory_limit: Maximum memory usage (e.g., "128MB")
            allowed_modules: List of allowed Python modules
            context: Additional context data
            
        Returns:
            ExecutionResult with success status and result/error details
        """
        
        execution_id = hashlib.md5(f"{code}{input_data}".encode()).hexdigest()[:16]
        
        # Check cache first
        cache_key = self._get_cache_key(code, input_data, allowed_modules)
        if cache_key in self.cache:
            logger.info("execution_cache_hit", execution_id=execution_id)
            result = self.cache[cache_key]
            result.cache_hit = True
            return result
        
        start_time = time.time()
        start_memory = self._get_memory_usage()
        
        if allowed_modules is None:
            allowed_modules = list(self.default_allowed_modules)
        
        logger.info(
            "execution_starting",
            execution_id=execution_id,
            timeout=timeout,
            memory_limit=memory_limit,
            allowed_modules=allowed_modules
        )
        
        try:
            self.active_executions.add(execution_id)
            
            # Parse memory limit
            memory_limit_bytes = self._parse_memory_limit(memory_limit)
            
            # Compile code with RestrictedPython
            compiled_code = compile_restricted(code, '<user_script>', 'exec')
            if compiled_code is None:
                return ExecutionResult(
                    success=False,
                    error_type="ValidationError",
                    error_message="Code compilation failed - contains restricted operations",
                    error_code="CODE_COMPILATION_FAILED"
                )
            
            # Create restricted execution environment
            execution_env = self._create_execution_environment(allowed_modules, context or {})
            
            # Execute with timeout and resource monitoring
            result = await self._execute_with_limits(
                compiled_code,
                execution_env,
                input_data,
                timeout,
                memory_limit_bytes,
                execution_id
            )
            
            # Calculate resource usage
            execution_time = time.time() - start_time
            memory_used = self._format_memory_usage(self._get_memory_usage() - start_memory)
            
            # Update result with metrics
            result.execution_time = execution_time
            result.memory_used = memory_used
            result.modules_imported = self._detect_imported_modules(execution_env)
            
            # Cache successful results
            if result.success:
                self.cache[cache_key] = result
                # Limit cache size
                if len(self.cache) > 1000:
                    # Remove oldest entries
                    keys_to_remove = list(self.cache.keys())[:100]
                    for key in keys_to_remove:
                        del self.cache[key]
            
            logger.info(
                "execution_completed",
                execution_id=execution_id,
                success=result.success,
                duration=execution_time,
                memory_used=memory_used
            )
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(
                "execution_error",
                execution_id=execution_id,
                error=str(e),
                traceback=traceback.format_exc(),
                duration=execution_time
            )
            
            return ExecutionResult(
                success=False,
                error_type=type(e).__name__,
                error_message=str(e),
                error_code="EXECUTION_ERROR",
                traceback=traceback.format_exc(),
                execution_time=execution_time
            )
        
        finally:
            self.active_executions.discard(execution_id)
            # Force garbage collection
            gc.collect()
    
    def _get_cache_key(self, code: str, input_data: Any, allowed_modules: List[str]) -> str:
        """Generate cache key for execution"""
        key_data = {
            'code': code,
            'input': json.dumps(input_data, sort_keys=True, default=str),
            'modules': sorted(allowed_modules)
        }
        return hashlib.md5(json.dumps(key_data, sort_keys=True).encode()).hexdigest()
    
    def _parse_memory_limit(self, memory_limit: str) -> int:
        """Parse memory limit string to bytes"""
        units = {'B': 1, 'KB': 1024, 'MB': 1024**2, 'GB': 1024**3}
        
        if memory_limit[-2:] in units:
            return int(memory_limit[:-2]) * units[memory_limit[-2:]]
        elif memory_limit[-1] == 'B':
            return int(memory_limit[:-1])
        else:
            return int(memory_limit)
    
    def _get_memory_usage(self) -> int:
        """Get current memory usage in bytes"""
        process = psutil.Process()
        return process.memory_info().rss
    
    def _format_memory_usage(self, bytes_used: int) -> str:
        """Format memory usage in human-readable format"""
        if bytes_used < 1024:
            return f"{bytes_used}B"
        elif bytes_used < 1024**2:
            return f"{bytes_used // 1024}KB"
        elif bytes_used < 1024**3:
            return f"{bytes_used // 1024**2}MB"
        else:
            return f"{bytes_used // 1024**3}GB"
    
    def _create_execution_environment(self, allowed_modules: List[str], context: Dict[str, Any]) -> Dict[str, Any]:
        """Create restricted execution environment"""
        
        # Start with safe globals
        env = safe_globals.copy()
        
        # Add allowed built-ins
        safe_builtins = {
            'len', 'str', 'int', 'float', 'bool', 'list', 'dict', 'tuple', 'set',
            'min', 'max', 'sum', 'abs', 'round', 'sorted', 'reversed', 'enumerate',
            'zip', 'map', 'filter', 'any', 'all', 'isinstance', 'type', 'hasattr',
            'getattr', 'setattr', 'range', 'print'
        }
        
        env['__builtins__'] = {name: getattr(__builtins__, name) for name in safe_builtins if hasattr(__builtins__, name)}
        
        # Import allowed modules
        for module_name in allowed_modules:
            if module_name in self.default_allowed_modules:
                try:
                    env[module_name] = __import__(module_name)
                except ImportError:
                    logger.warning("module_import_failed", module=module_name)
        
        # Add context data
        env['context'] = context.copy()
        
        # Add input data placeholder
        env['_input_data'] = None
        
        return env
    
    async def _execute_with_limits(
        self,
        compiled_code,
        execution_env: Dict[str, Any],
        input_data: Any,
        timeout: int,
        memory_limit_bytes: int,
        execution_id: str
    ) -> ExecutionResult:
        """Execute code with timeout and memory limits"""
        
        # Set up signal handler for timeout
        def timeout_handler(signum, frame):
            raise ExecutionTimeout(f"Execution exceeded {timeout} seconds")
        
        # Set memory limit (soft limit)
        try:
            resource.setrlimit(resource.RLIMIT_AS, (memory_limit_bytes, memory_limit_bytes * 2))
        except (OSError, ValueError):
            # Memory limiting might not be available on all systems
            logger.warning("memory_limit_not_supported", execution_id=execution_id)
        
        # Set timeout
        old_handler = signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(timeout)
        
        try:
            # Execute the user code to define functions
            exec(compiled_code, execution_env)
            
            # Check if transform function exists
            if 'transform' not in execution_env:
                return ExecutionResult(
                    success=False,
                    error_type="ValidationError",
                    error_message="Code must define a 'transform' function",
                    error_code="MISSING_TRANSFORM_FUNCTION"
                )
            
            transform_func = execution_env['transform']
            
            # Validate transform function
            if not callable(transform_func):
                return ExecutionResult(
                    success=False,
                    error_type="ValidationError",
                    error_message="'transform' must be a callable function",
                    error_code="INVALID_TRANSFORM_FUNCTION"
                )
            
            # Execute transform function
            execution_env['_input_data'] = input_data
            result = transform_func(input_data)
            
            return ExecutionResult(
                success=True,
                result=result
            )
        
        except ExecutionTimeout:
            return ExecutionResult(
                success=False,
                error_type="TimeoutError",
                error_message=f"Execution exceeded {timeout} seconds",
                error_code="EXECUTION_TIMEOUT"
            )
        
        except MemoryError:
            return ExecutionResult(
                success=False,
                error_type="MemoryError",
                error_message=f"Execution exceeded memory limit of {self._format_memory_usage(memory_limit_bytes)}",
                error_code="MEMORY_LIMIT_EXCEEDED"
            )
        
        except Exception as e:
            # Parse error details
            tb = traceback.format_exc()
            error_line = None
            
            # Try to extract line number from traceback
            try:
                for line in tb.split('\n'):
                    if 'line ' in line and '<user_script>' in line:
                        error_line = int(line.split('line ')[1].split(',')[0])
                        break
            except (ValueError, IndexError):
                pass
            
            return ExecutionResult(
                success=False,
                error_type=type(e).__name__,
                error_message=str(e),
                error_code="EXECUTION_FAILED",
                error_line=error_line,
                traceback=tb
            )
        
        finally:
            # Clean up
            signal.alarm(0)
            signal.signal(signal.SIGALRM, old_handler)
            
            # Reset memory limit
            try:
                resource.setrlimit(resource.RLIMIT_AS, (resource.RLIM_INFINITY, resource.RLIM_INFINITY))
            except (OSError, ValueError):
                pass
    
    def _detect_imported_modules(self, execution_env: Dict[str, Any]) -> List[str]:
        """Detect which modules were actually imported during execution"""
        imported = []
        
        for name, value in execution_env.items():
            if hasattr(value, '__name__') and hasattr(value, '__file__'):
                if name in self.default_allowed_modules:
                    imported.append(name)
        
        return imported
    
    async def shutdown(self):
        """Shutdown executor and clean up resources"""
        logger.info("python_executor_shutting_down", active_executions=len(self.active_executions))
        
        # Wait for active executions to complete (with timeout)
        max_wait = 30  # seconds
        start_time = time.time()
        
        while self.active_executions and (time.time() - start_time) < max_wait:
            await asyncio.sleep(0.1)
        
        if self.active_executions:
            logger.warning("executor_shutdown_with_active_executions", count=len(self.active_executions))
        
        # Clear cache
        self.cache.clear()
        
        logger.info("python_executor_shutdown_complete")
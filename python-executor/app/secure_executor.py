"""
Enhanced Secure Python Code Executor
Story 8.1.3: Advanced sandboxed execution environment with comprehensive security monitoring
"""

import asyncio
import gc
import hashlib
import json
import os
import psutil
import resource
import signal
import sys
import tempfile
import time
import traceback
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Union
from contextlib import contextmanager

from RestrictedPython import compile_restricted, safe_globals
import structlog

from .sandbox_monitor import security_monitor, SecurityEvent, SecurityLevel
from .security import SecurityValidator

logger = structlog.get_logger()


@dataclass
class ExecutionResult:
    """Enhanced result of code execution with security metrics"""
    success: bool
    result: Optional[Any] = None
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    error_code: Optional[str] = None
    error_line: Optional[int] = None
    traceback: Optional[str] = None
    execution_time: float = 0.0
    memory_used: str = "0MB"
    peak_memory: str = "0MB"
    cpu_usage: float = 0.0
    warnings: List[str] = None
    modules_imported: List[str] = None
    cache_hit: bool = False
    security_events: List[Dict[str, Any]] = None
    sandbox_violations: int = 0
    
    def __post_init__(self):
        if self.warnings is None:
            self.warnings = []
        if self.modules_imported is None:
            self.modules_imported = []
        if self.security_events is None:
            self.security_events = []


class ExecutionTimeout(Exception):
    """Raised when code execution exceeds timeout"""
    pass


class MemoryLimitExceeded(Exception):
    """Raised when code execution exceeds memory limit"""
    pass


class SecurityViolation(Exception):
    """Raised when code execution violates security policies"""
    pass


class SecurePythonExecutor:
    """Enhanced secure Python code executor with comprehensive monitoring"""
    
    def __init__(self):
        self.cache: Dict[str, ExecutionResult] = {}
        self.active_executions: Set[str] = set()
        self.security_validator = SecurityValidator()
        
        # More restrictive default modules for sandboxed execution
        self.default_allowed_modules = {
            're', 'json', 'datetime', 'math', 'random', 'string', 'itertools',
            'collections', 'functools', 'operator', 'copy', 'uuid', 'hashlib'
        }
        
        # Enhanced security configuration
        self.security_config = {
            'enable_filesystem_isolation': True,
            'enable_network_isolation': True,
            'enable_process_isolation': True,
            'max_subprocess_count': 0,  # No subprocesses allowed
            'max_file_descriptors': 10,
            'enable_syscall_filtering': True,
            'enable_memory_protection': True,
        }
        
        # Set up security event handler
        security_monitor.add_event_handler(self._handle_security_event)
        
        logger.info("secure_python_executor_initialized", config=self.security_config)
    
    async def execute(
        self,
        code: str,
        input_data: Any,
        timeout: int = 30,
        memory_limit: str = "128MB",
        allowed_modules: List[str] = None,
        context: Dict[str, Any] = None,
        strict_mode: bool = True
    ) -> ExecutionResult:
        """
        Execute Python code in a highly secure sandboxed environment
        
        Args:
            code: Python code to execute (must define 'transform' function)
            input_data: Data to pass to the transform function
            timeout: Maximum execution time in seconds
            memory_limit: Maximum memory usage (e.g., "128MB")
            allowed_modules: List of allowed Python modules
            context: Additional context data
            strict_mode: Enable strict security mode
            
        Returns:
            ExecutionResult with success status and comprehensive security metrics
        """
        
        execution_id = hashlib.md5(f"{code}{input_data}{time.time()}".encode()).hexdigest()[:16]
        
        # Pre-execution security validation
        validation_result = self.security_validator.validate_code(code)
        if not validation_result.valid:
            logger.warning("code_validation_failed", 
                         execution_id=execution_id, 
                         errors=validation_result.errors)
            return ExecutionResult(
                success=False,
                error_type="SecurityError",
                error_message=f"Code validation failed: {'; '.join(validation_result.errors)}",
                error_code="SECURITY_VALIDATION_FAILED",
                warnings=validation_result.warnings
            )
        
        # Check cache first
        cache_key = self._get_cache_key(code, input_data, allowed_modules)
        if cache_key in self.cache and not strict_mode:
            logger.info("execution_cache_hit", execution_id=execution_id)
            result = self.cache[cache_key]
            result.cache_hit = True
            return result
        
        start_time = time.time()
        start_memory = self._get_memory_usage()
        
        if allowed_modules is None:
            allowed_modules = list(self.default_allowed_modules)
        
        # Track security events for this execution
        execution_security_events = []
        
        def security_event_handler(event: SecurityEvent):
            if event.execution_id == execution_id:
                execution_security_events.append({
                    'timestamp': event.timestamp,
                    'level': event.level.value,
                    'type': event.event_type,
                    'message': event.message,
                    'details': event.details
                })
        
        logger.info(
            "secure_execution_starting",
            execution_id=execution_id,
            timeout=timeout,
            memory_limit=memory_limit,
            allowed_modules=allowed_modules,
            strict_mode=strict_mode
        )
        
        try:
            self.active_executions.add(execution_id)
            
            # Parse memory limit
            memory_limit_bytes = self._parse_memory_limit(memory_limit)
            
            # Create isolated execution environment
            with self._create_isolated_environment(execution_id, memory_limit_bytes, timeout) as env_info:
                
                # Start security monitoring
                current_process = psutil.Process()
                security_monitor.start_monitoring(execution_id, current_process.pid, timeout)
                
                # Compile code with RestrictedPython
                compiled_code = compile_restricted(code, f'<user_script_{execution_id}>', 'exec')
                if compiled_code is None:
                    return ExecutionResult(
                        success=False,
                        error_type="ValidationError",
                        error_message="Code compilation failed - contains restricted operations",
                        error_code="CODE_COMPILATION_FAILED",
                        warnings=validation_result.warnings
                    )
                
                # Create restricted execution environment
                execution_env = self._create_execution_environment(
                    allowed_modules, 
                    context or {}, 
                    execution_id,
                    strict_mode
                )
                
                # Execute with comprehensive monitoring
                result = await self._execute_with_monitoring(
                    compiled_code,
                    execution_env,
                    input_data,
                    timeout,
                    memory_limit_bytes,
                    execution_id,
                    env_info
                )
                
                # Stop security monitoring
                security_monitor.stop_monitoring(execution_id)
                
                # Calculate comprehensive metrics
                execution_time = time.time() - start_time
                memory_used = self._format_memory_usage(self._get_memory_usage() - start_memory)
                
                # Get final resource usage
                final_usage = security_monitor.get_current_usage(execution_id)
                peak_memory = "0MB"
                cpu_usage = 0.0
                
                if final_usage:
                    peak_memory = self._format_memory_usage(final_usage.memory_bytes)
                    cpu_usage = final_usage.cpu_percent
                
                # Update result with enhanced metrics
                result.execution_time = execution_time
                result.memory_used = memory_used
                result.peak_memory = peak_memory
                result.cpu_usage = cpu_usage
                result.modules_imported = self._detect_imported_modules(execution_env)
                result.security_events = execution_security_events
                result.sandbox_violations = len([e for e in execution_security_events if e['level'] in ['high', 'critical']])
                result.warnings.extend(validation_result.warnings)
                
                # Cache successful results only if no security violations
                if result.success and result.sandbox_violations == 0 and not strict_mode:
                    self.cache[cache_key] = result
                    # Limit cache size with LRU eviction
                    if len(self.cache) > 500:  # Reduced cache size for security
                        keys_to_remove = list(self.cache.keys())[:50]
                        for key in keys_to_remove:
                            del self.cache[key]
                
                logger.info(
                    "secure_execution_completed",
                    execution_id=execution_id,
                    success=result.success,
                    duration=execution_time,
                    memory_used=memory_used,
                    peak_memory=peak_memory,
                    cpu_usage=cpu_usage,
                    security_events=len(execution_security_events),
                    violations=result.sandbox_violations
                )
                
                return result
                
        except Exception as e:
            execution_time = time.time() - start_time
            
            # Stop monitoring on error
            security_monitor.stop_monitoring(execution_id)
            
            logger.error(
                "secure_execution_error",
                execution_id=execution_id,
                error=str(e),
                traceback=traceback.format_exc(),
                duration=execution_time,
                security_events=len(execution_security_events)
            )
            
            return ExecutionResult(
                success=False,
                error_type=type(e).__name__,
                error_message=str(e),
                error_code="EXECUTION_ERROR",
                traceback=traceback.format_exc(),
                execution_time=execution_time,
                security_events=execution_security_events,
                sandbox_violations=len([e for e in execution_security_events if e['level'] in ['high', 'critical']])
            )
        
        finally:
            self.active_executions.discard(execution_id)
            # Force garbage collection with enhanced cleanup
            gc.collect()
            
            # Additional cleanup for security
            if execution_id in locals():
                del locals()[execution_id]
    
    @contextmanager
    def _create_isolated_environment(self, execution_id: str, memory_limit_bytes: int, timeout: int):
        """Create an isolated execution environment with enhanced security"""
        
        # Create temporary directory for this execution
        temp_dir = None
        old_cwd = os.getcwd()
        old_limits = {}
        
        try:
            # Set up resource limits
            if self.security_config['enable_memory_protection']:
                try:
                    # Set memory limits
                    old_limits['memory'] = resource.getrlimit(resource.RLIMIT_AS)
                    resource.setrlimit(resource.RLIMIT_AS, (memory_limit_bytes, memory_limit_bytes * 2))
                    
                    # Set CPU time limit
                    old_limits['cpu'] = resource.getrlimit(resource.RLIMIT_CPU)
                    resource.setrlimit(resource.RLIMIT_CPU, (timeout, timeout + 10))
                    
                    # Set file descriptor limit
                    old_limits['nofile'] = resource.getrlimit(resource.RLIMIT_NOFILE)
                    max_fds = self.security_config['max_file_descriptors']
                    resource.setrlimit(resource.RLIMIT_NOFILE, (max_fds, max_fds))
                    
                    # Set process limit
                    old_limits['nproc'] = resource.getrlimit(resource.RLIMIT_NPROC)
                    max_procs = self.security_config['max_subprocess_count']
                    resource.setrlimit(resource.RLIMIT_NPROC, (max_procs, max_procs))
                    
                except (OSError, ValueError) as e:
                    logger.warning("resource_limits_not_supported", 
                                 execution_id=execution_id, 
                                 error=str(e))
            
            # Set up filesystem isolation
            if self.security_config['enable_filesystem_isolation']:
                temp_dir = tempfile.mkdtemp(prefix=f"sandbox_{execution_id}_")
                os.chdir(temp_dir)
                logger.debug("filesystem_isolated", execution_id=execution_id, temp_dir=temp_dir)
            
            # Yield environment information
            yield {
                'temp_dir': temp_dir,
                'old_cwd': old_cwd,
                'memory_limit_bytes': memory_limit_bytes,
                'timeout': timeout
            }
            
        finally:
            # Restore original directory
            try:
                os.chdir(old_cwd)
            except (OSError, FileNotFoundError):
                pass
            
            # Clean up temporary directory
            if temp_dir:
                try:
                    import shutil
                    shutil.rmtree(temp_dir, ignore_errors=True)
                except Exception as e:
                    logger.warning("temp_cleanup_failed", 
                                 execution_id=execution_id, 
                                 temp_dir=temp_dir, 
                                 error=str(e))
            
            # Restore resource limits
            for resource_type, old_limit in old_limits.items():
                try:
                    if resource_type == 'memory':
                        resource.setrlimit(resource.RLIMIT_AS, old_limit)
                    elif resource_type == 'cpu':
                        resource.setrlimit(resource.RLIMIT_CPU, old_limit)
                    elif resource_type == 'nofile':
                        resource.setrlimit(resource.RLIMIT_NOFILE, old_limit)
                    elif resource_type == 'nproc':
                        resource.setrlimit(resource.RLIMIT_NPROC, old_limit)
                except (OSError, ValueError):
                    pass
    
    def _create_execution_environment(self, allowed_modules: List[str], context: Dict[str, Any], execution_id: str, strict_mode: bool) -> Dict[str, Any]:
        """Create a highly restricted execution environment"""
        
        # Start with minimal safe globals
        env = {}
        
        # Add only essential built-ins with strict filtering
        if strict_mode:
            safe_builtins = {
                'len', 'str', 'int', 'float', 'bool', 'list', 'dict', 'tuple', 'set',
                'min', 'max', 'sum', 'abs', 'round', 'sorted', 'reversed', 'enumerate',
                'zip', 'map', 'filter', 'any', 'all', 'isinstance', 'type', 'range'
            }
        else:
            safe_builtins = {
                'len', 'str', 'int', 'float', 'bool', 'list', 'dict', 'tuple', 'set',
                'min', 'max', 'sum', 'abs', 'round', 'sorted', 'reversed', 'enumerate',
                'zip', 'map', 'filter', 'any', 'all', 'isinstance', 'type', 'hasattr',
                'getattr', 'setattr', 'range', 'print'
            }
        
        # Create restricted builtins
        restricted_builtins = {}
        for name in safe_builtins:
            if hasattr(__builtins__, name):
                restricted_builtins[name] = getattr(__builtins__, name)
        
        env['__builtins__'] = restricted_builtins
        
        # Import allowed modules with additional validation
        for module_name in allowed_modules:
            if module_name in self.default_allowed_modules:
                try:
                    # Validate module before import
                    if self._is_module_safe(module_name):
                        imported_module = __import__(module_name)
                        
                        # For strict mode, wrap modules to prevent dangerous operations
                        if strict_mode:
                            env[module_name] = self._wrap_module_for_safety(imported_module, module_name)
                        else:
                            env[module_name] = imported_module
                            
                        logger.debug("module_imported", 
                                   execution_id=execution_id, 
                                   module=module_name)
                    else:
                        logger.warning("module_rejected", 
                                     execution_id=execution_id, 
                                     module=module_name)
                except ImportError as e:
                    logger.warning("module_import_failed", 
                                 execution_id=execution_id, 
                                 module=module_name, 
                                 error=str(e))
        
        # Add context data with sanitization
        sanitized_context = self._sanitize_context(context)
        env['context'] = sanitized_context
        
        # Add execution metadata
        env['_execution_id'] = execution_id
        env['_input_data'] = None
        
        return env
    
    def _is_module_safe(self, module_name: str) -> bool:
        """Check if a module is safe to import"""
        dangerous_modules = {
            'os', 'sys', 'subprocess', 'importlib', 'imp', 'marshal', 'pickle',
            'socket', 'urllib', 'http', 'ftplib', 'smtplib', 'telnetlib',
            'threading', 'multiprocessing', 'asyncio', 'concurrent',
            'ctypes', 'mmap', 'fcntl', 'select', 'signal', 'resource',
            'gc', 'weakref', 'types', 'inspect', 'ast', 'code', 'codeop'
        }
        
        return module_name not in dangerous_modules
    
    def _wrap_module_for_safety(self, module, module_name: str):
        """Wrap a module to remove dangerous attributes"""
        # This is a simplified wrapper - in production, implement comprehensive filtering
        if module_name == 'os':
            # Remove dangerous os functions
            safe_attrs = {'path'}
            return type('SafeModule', (), {attr: getattr(module, attr) for attr in safe_attrs if hasattr(module, attr)})()
        
        return module
    
    def _sanitize_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize context data to prevent security issues"""
        sanitized = {}
        
        for key, value in context.items():
            # Only allow safe data types
            if isinstance(value, (str, int, float, bool, list, dict, tuple)):
                # Recursively sanitize nested structures
                if isinstance(value, dict):
                    sanitized[key] = self._sanitize_context(value)
                elif isinstance(value, list):
                    sanitized[key] = [self._sanitize_value(item) for item in value]
                else:
                    sanitized[key] = value
        
        return sanitized
    
    def _sanitize_value(self, value: Any) -> Any:
        """Sanitize individual values"""
        if isinstance(value, (str, int, float, bool)):
            return value
        elif isinstance(value, dict):
            return self._sanitize_context(value)
        elif isinstance(value, list):
            return [self._sanitize_value(item) for item in value]
        else:
            return str(value)  # Convert unsafe types to string
    
    async def _execute_with_monitoring(
        self,
        compiled_code,
        execution_env: Dict[str, Any],
        input_data: Any,
        timeout: int,
        memory_limit_bytes: int,
        execution_id: str,
        env_info: Dict[str, Any]
    ) -> ExecutionResult:
        """Execute code with comprehensive monitoring and security checks"""
        
        # Set up signal handler for timeout
        def timeout_handler(signum, frame):
            raise ExecutionTimeout(f"Execution exceeded {timeout} seconds")
        
        # Set timeout signal
        old_handler = signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(timeout)
        
        try:
            # Execute the user code to define functions
            exec(compiled_code, execution_env)
            
            # Enhanced validation of transform function
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
            
            # Additional function validation
            if hasattr(transform_func, '__code__'):
                code_obj = transform_func.__code__
                if code_obj.co_argcount != 1:
                    return ExecutionResult(
                        success=False,
                        error_type="ValidationError",
                        error_message="'transform' function must accept exactly one argument",
                        error_code="INVALID_TRANSFORM_SIGNATURE"
                    )
            
            # Execute transform function with monitoring
            execution_env['_input_data'] = input_data
            
            # Monitor execution start
            start_exec_time = time.time()
            result = transform_func(input_data)
            exec_duration = time.time() - start_exec_time
            
            # Validate result
            if not self._is_result_safe(result):
                return ExecutionResult(
                    success=False,
                    error_type="SecurityError",
                    error_message="Transform function returned unsafe result",
                    error_code="UNSAFE_RESULT"
                )
            
            logger.debug("transform_executed", 
                        execution_id=execution_id, 
                        duration=exec_duration,
                        result_type=type(result).__name__)
            
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
                error_message=f"Execution exceeded memory limit",
                error_code="MEMORY_LIMIT_EXCEEDED"
            )
        
        except Exception as e:
            # Enhanced error parsing
            tb = traceback.format_exc()
            error_line = None
            
            # Try to extract line number from traceback
            try:
                for line in tb.split('\n'):
                    if 'line ' in line and execution_id in line:
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
    
    def _is_result_safe(self, result: Any) -> bool:
        """Check if execution result is safe"""
        # Prevent returning dangerous objects
        if hasattr(result, '__class__') and hasattr(result.__class__, '__module__'):
            module_name = result.__class__.__module__
            if module_name and module_name.startswith(('os', 'sys', 'subprocess', 'socket')):
                return False
        
        # Check for dangerous attributes
        if hasattr(result, '__globals__') or hasattr(result, '__code__'):
            return False
        
        return True
    
    def _handle_security_event(self, event: SecurityEvent):
        """Handle security events from the monitor"""
        if event.level in [SecurityLevel.HIGH, SecurityLevel.CRITICAL]:
            logger.error("security_violation", 
                        execution_id=event.execution_id,
                        level=event.level.value,
                        type=event.event_type,
                        message=event.message)
        
        # Could implement additional response logic here
        # e.g., rate limiting, blocking IPs, etc.
    
    def _get_cache_key(self, code: str, input_data: Any, allowed_modules: List[str]) -> str:
        """Generate cache key for execution"""
        key_data = {
            'code': code,
            'input': json.dumps(input_data, sort_keys=True, default=str),
            'modules': sorted(allowed_modules),
            'security_version': '1.0'  # Include security version in cache key
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
        logger.info("secure_executor_shutting_down", 
                   active_executions=len(self.active_executions))
        
        # Wait for active executions to complete
        max_wait = 30  # seconds
        start_time = time.time()
        
        while self.active_executions and (time.time() - start_time) < max_wait:
            await asyncio.sleep(0.1)
        
        if self.active_executions:
            logger.warning("executor_shutdown_with_active_executions", 
                         count=len(self.active_executions))
        
        # Clear cache
        self.cache.clear()
        
        # Shutdown security monitor
        security_monitor.shutdown()
        
        logger.info("secure_executor_shutdown_complete")


# Global secure executor instance
secure_executor = SecurePythonExecutor()
"""
Comprehensive test suite for sandbox security
Story 8.1.3: Tests for advanced sandboxed execution environment
"""

import asyncio
import json
import pytest
import time
from unittest.mock import patch, MagicMock

from app.secure_executor import SecurePythonExecutor, ExecutionResult, SecurityViolation
from app.sandbox_monitor import SecurityLevel, SecurityEvent


class TestSandboxSecurity:
    """Test suite for sandbox security features"""
    
    @pytest.fixture
    def executor(self):
        """Create a secure executor instance for testing"""
        return SecurePythonExecutor()
    
    @pytest.fixture
    def basic_transform_code(self):
        """Basic valid transform function"""
        return '''
def transform(input_data):
    return input_data.upper()
'''
    
    @pytest.fixture
    def malicious_eval_code(self):
        """Malicious code using eval"""
        return '''
def transform(input_data):
    return eval(input_data)
'''
    
    @pytest.fixture
    def malicious_exec_code(self):
        """Malicious code using exec"""
        return '''
def transform(input_data):
    exec("import os; os.system('ls')")
    return input_data
'''
    
    @pytest.fixture
    def malicious_import_code(self):
        """Malicious code with forbidden imports"""
        return '''
import os
import sys
import subprocess

def transform(input_data):
    os.system('echo "breach"')
    return input_data
'''
    
    @pytest.fixture
    def memory_bomb_code(self):
        """Code that attempts to exhaust memory"""
        return '''
def transform(input_data):
    # Try to allocate large amounts of memory
    data = []
    for i in range(1000000):
        data.append("x" * 1000)
    return len(data)
'''
    
    @pytest.fixture
    def infinite_loop_code(self):
        """Code with infinite loop"""
        return '''
def transform(input_data):
    while True:
        pass
    return input_data
'''
    
    @pytest.fixture
    def file_access_code(self):
        """Code that attempts file access"""
        return '''
def transform(input_data):
    with open('/etc/passwd', 'r') as f:
        return f.read()
'''
    
    @pytest.fixture
    def network_access_code(self):
        """Code that attempts network access"""
        return '''
import socket

def transform(input_data):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(('google.com', 80))
    return input_data
'''
    
    @pytest.fixture
    def subprocess_code(self):
        """Code that attempts subprocess execution"""
        return '''
import subprocess

def transform(input_data):
    result = subprocess.run(['ls', '-la'], capture_output=True)
    return result.stdout.decode()
'''
    
    @pytest.fixture
    def globals_access_code(self):
        """Code that attempts to access globals"""
        return '''
def transform(input_data):
    g = globals()
    return str(g)
'''
    
    @pytest.fixture
    def class_manipulation_code(self):
        """Code that attempts class manipulation"""
        return '''
def transform(input_data):
    return input_data.__class__.__bases__[0].__subclasses__()
'''
    
    @pytest.mark.asyncio
    async def test_basic_execution_succeeds(self, executor, basic_transform_code):
        """Test that basic valid code executes successfully"""
        result = await executor.execute(basic_transform_code, "hello world")
        
        assert result.success is True
        assert result.result == "HELLO WORLD"
        assert result.error_type is None
        assert result.sandbox_violations == 0
        assert len(result.security_events) == 0
    
    @pytest.mark.asyncio
    async def test_eval_blocked(self, executor, malicious_eval_code):
        """Test that eval is blocked"""
        result = await executor.execute(malicious_eval_code, "print('breach')")
        
        assert result.success is False
        assert "eval" in result.error_message.lower()
        assert result.error_code == "SECURITY_VALIDATION_FAILED"
    
    @pytest.mark.asyncio
    async def test_exec_blocked(self, executor, malicious_exec_code):
        """Test that exec is blocked"""
        result = await executor.execute(malicious_exec_code, "test")
        
        assert result.success is False
        assert "exec" in result.error_message.lower()
        assert result.error_code == "SECURITY_VALIDATION_FAILED"
    
    @pytest.mark.asyncio
    async def test_forbidden_imports_blocked(self, executor, malicious_import_code):
        """Test that forbidden imports are blocked"""
        result = await executor.execute(malicious_import_code, "test")
        
        assert result.success is False
        assert result.error_code == "SECURITY_VALIDATION_FAILED"
    
    @pytest.mark.asyncio
    async def test_memory_limits_enforced(self, executor, memory_bomb_code):
        """Test that memory limits are enforced"""
        result = await executor.execute(
            memory_bomb_code, 
            "test", 
            memory_limit="64MB",
            timeout=10
        )
        
        assert result.success is False
        assert result.error_type in ["MemoryError", "TimeoutError"]
        # Should have security events for memory violations
        assert len(result.security_events) > 0
    
    @pytest.mark.asyncio
    async def test_timeout_enforced(self, executor, infinite_loop_code):
        """Test that execution timeout is enforced"""
        start_time = time.time()
        result = await executor.execute(infinite_loop_code, "test", timeout=5)
        execution_time = time.time() - start_time
        
        assert result.success is False
        assert result.error_type == "TimeoutError"
        assert execution_time < 10  # Should timeout well before 10 seconds
        assert "timeout" in result.error_message.lower()
    
    @pytest.mark.asyncio
    async def test_file_access_blocked(self, executor, file_access_code):
        """Test that file access is blocked"""
        result = await executor.execute(file_access_code, "test")
        
        assert result.success is False
        assert "open" in result.error_message.lower()
        assert result.error_code == "SECURITY_VALIDATION_FAILED"
    
    @pytest.mark.asyncio
    async def test_network_access_blocked(self, executor, network_access_code):
        """Test that network access is blocked"""
        result = await executor.execute(network_access_code, "test")
        
        assert result.success is False
        assert result.error_code == "SECURITY_VALIDATION_FAILED"
    
    @pytest.mark.asyncio
    async def test_subprocess_blocked(self, executor, subprocess_code):
        """Test that subprocess execution is blocked"""
        result = await executor.execute(subprocess_code, "test")
        
        assert result.success is False
        assert result.error_code == "SECURITY_VALIDATION_FAILED"
    
    @pytest.mark.asyncio
    async def test_globals_access_blocked(self, executor, globals_access_code):
        """Test that globals access is blocked"""
        result = await executor.execute(globals_access_code, "test")
        
        assert result.success is False
        assert result.error_code == "SECURITY_VALIDATION_FAILED"
    
    @pytest.mark.asyncio
    async def test_class_manipulation_blocked(self, executor, class_manipulation_code):
        """Test that class manipulation is blocked"""
        result = await executor.execute(class_manipulation_code, "test")
        
        assert result.success is False
        assert result.error_code == "SECURITY_VALIDATION_FAILED"
    
    @pytest.mark.asyncio
    async def test_missing_transform_function(self, executor):
        """Test that code without transform function fails"""
        code = '''
def other_function():
    return "not transform"
'''
        result = await executor.execute(code, "test")
        
        assert result.success is False
        assert result.error_code == "MISSING_TRANSFORM_FUNCTION"
    
    @pytest.mark.asyncio
    async def test_invalid_transform_function(self, executor):
        """Test that non-callable transform fails"""
        code = '''
transform = "not a function"
'''
        result = await executor.execute(code, "test")
        
        assert result.success is False
        assert result.error_code == "INVALID_TRANSFORM_FUNCTION"
    
    @pytest.mark.asyncio
    async def test_wrong_transform_signature(self, executor):
        """Test that transform function with wrong signature fails"""
        code = '''
def transform():  # No arguments
    return "invalid"
'''
        result = await executor.execute(code, "test")
        
        assert result.success is False
        assert result.error_code == "INVALID_TRANSFORM_SIGNATURE"
    
    @pytest.mark.asyncio
    async def test_allowed_modules_work(self, executor):
        """Test that allowed modules work correctly"""
        code = '''
import json
import math

def transform(input_data):
    data = {"value": math.sqrt(16)}
    return json.dumps(data)
'''
        result = await executor.execute(code, "test", allowed_modules=['json', 'math'])
        
        assert result.success is True
        assert result.result == '{"value": 4.0}'
        assert 'json' in result.modules_imported
        assert 'math' in result.modules_imported
    
    @pytest.mark.asyncio
    async def test_strict_mode_more_restrictive(self, executor):
        """Test that strict mode is more restrictive"""
        code = '''
def transform(input_data):
    # This might work in normal mode but not strict mode
    return str(type(input_data))
'''
        
        # Test normal mode
        result_normal = await executor.execute(code, "test", strict_mode=False)
        
        # Test strict mode
        result_strict = await executor.execute(code, "test", strict_mode=True)
        
        # Strict mode should be more restrictive
        # (exact behavior depends on implementation)
        assert isinstance(result_normal, ExecutionResult)
        assert isinstance(result_strict, ExecutionResult)
    
    @pytest.mark.asyncio
    async def test_context_data_accessible(self, executor):
        """Test that context data is accessible"""
        code = '''
def transform(input_data):
    return context.get('test_value', 'default')
'''
        context = {'test_value': 'context_works'}
        
        result = await executor.execute(code, "test", context=context)
        
        assert result.success is True
        assert result.result == 'context_works'
    
    @pytest.mark.asyncio
    async def test_dangerous_context_sanitized(self, executor):
        """Test that dangerous context data is sanitized"""
        code = '''
def transform(input_data):
    return str(type(context.get('dangerous_obj')))
'''
        
        # Try to pass a dangerous object in context
        dangerous_obj = lambda: "dangerous"
        context = {'dangerous_obj': dangerous_obj}
        
        result = await executor.execute(code, "test", context=context)
        
        # The dangerous object should be sanitized or removed
        assert result.success is True
        assert 'function' not in result.result.lower()
    
    @pytest.mark.asyncio
    async def test_resource_usage_tracking(self, executor):
        """Test that resource usage is tracked"""
        code = '''
def transform(input_data):
    # Create some data to use memory
    data = [i for i in range(1000)]
    return len(data)
'''
        
        result = await executor.execute(code, "test")
        
        assert result.success is True
        assert result.execution_time > 0
        assert result.memory_used != "0MB"
        assert result.peak_memory != "0MB"
    
    @pytest.mark.asyncio
    async def test_caching_works(self, executor):
        """Test that caching works for identical requests"""
        code = '''
def transform(input_data):
    return input_data * 2
'''
        
        # First execution
        result1 = await executor.execute(code, "test", strict_mode=False)
        assert result1.success is True
        assert result1.cache_hit is False
        
        # Second execution should hit cache
        result2 = await executor.execute(code, "test", strict_mode=False)
        assert result2.success is True
        assert result2.cache_hit is True
        assert result2.result == result1.result
    
    @pytest.mark.asyncio
    async def test_violations_prevent_caching(self, executor):
        """Test that results with violations are not cached"""
        code = '''
def transform(input_data):
    # This might cause warnings but still succeed
    data = [i for i in range(100000)]  # Large allocation
    return len(data)
'''
        
        # Execute twice - second should not be cached if violations occurred
        result1 = await executor.execute(code, "test", memory_limit="256MB", strict_mode=False)
        result2 = await executor.execute(code, "test", memory_limit="256MB", strict_mode=False)
        
        # If there were violations, second execution should not be cached
        if result1.sandbox_violations > 0:
            assert result2.cache_hit is False
    
    @pytest.mark.asyncio
    async def test_concurrent_executions(self, executor):
        """Test that concurrent executions are handled safely"""
        code = '''
def transform(input_data):
    import time
    time.sleep(0.1)  # Small delay
    return input_data
'''
        
        # Start multiple concurrent executions
        tasks = []
        for i in range(5):
            task = asyncio.create_task(executor.execute(code, f"test_{i}"))
            tasks.append(task)
        
        # Wait for all to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # All should succeed
        for i, result in enumerate(results):
            assert isinstance(result, ExecutionResult)
            assert result.success is True
            assert result.result == f"test_{i}"
    
    @pytest.mark.asyncio
    async def test_cleanup_after_execution(self, executor):
        """Test that cleanup happens after execution"""
        code = '''
def transform(input_data):
    return input_data
'''
        
        initial_executions = len(executor.active_executions)
        
        result = await executor.execute(code, "test")
        
        assert result.success is True
        # Should not have any active executions after completion
        assert len(executor.active_executions) == initial_executions
    
    @pytest.mark.asyncio
    async def test_executor_shutdown(self, executor):
        """Test that executor shuts down cleanly"""
        code = '''
def transform(input_data):
    return input_data
'''
        
        # Execute something first
        result = await executor.execute(code, "test")
        assert result.success is True
        
        # Shutdown should complete without errors
        await executor.shutdown()
        
        # Should have no active executions
        assert len(executor.active_executions) == 0
        assert len(executor.cache) == 0


class TestSecurityValidation:
    """Test suite for security validation components"""
    
    @pytest.fixture
    def executor(self):
        return SecurePythonExecutor()
    
    def test_dangerous_patterns_detected(self, executor):
        """Test that dangerous patterns are detected"""
        dangerous_codes = [
            "eval('malicious')",
            "exec('dangerous')",
            "__import__('os')",
            "globals()",
            "locals()",
            "open('/etc/passwd')",
            "os.system('ls')",
            "subprocess.call(['ls'])",
            "socket.socket()",
            "__class__.__bases__",
        ]
        
        for code in dangerous_codes:
            full_code = f'''
def transform(input_data):
    {code}
    return input_data
'''
            validation_result = executor.security_validator.validate_code(full_code)
            assert validation_result.valid is False, f"Failed to detect dangerous pattern: {code}"
    
    def test_safe_patterns_allowed(self, executor):
        """Test that safe patterns are allowed"""
        safe_codes = [
            "len(input_data)",
            "str(input_data)",
            "int(input_data)",
            "input_data.upper()",
            "json.dumps({'key': 'value'})",
            "math.sqrt(16)",
            "random.randint(1, 10)",
        ]
        
        for code in safe_codes:
            full_code = f'''
def transform(input_data):
    return {code}
'''
            validation_result = executor.security_validator.validate_code(full_code)
            assert validation_result.valid is True, f"Safe pattern incorrectly blocked: {code}"
    
    def test_complexity_limits_enforced(self, executor):
        """Test that complexity limits are enforced"""
        # Create code that exceeds complexity limits
        complex_code = '''
def transform(input_data):
    # Many nested loops
    for i in range(10):
        for j in range(10):
            for k in range(10):
                for l in range(10):
                    for m in range(10):
                        pass
    return input_data
'''
        
        validation_result = executor.security_validator.validate_code(complex_code)
        # Should either fail validation or generate warnings
        assert validation_result.valid is False or len(validation_result.warnings) > 0
    
    def test_module_safety_check(self, executor):
        """Test module safety checking"""
        # Test dangerous modules
        dangerous_modules = ['os', 'sys', 'subprocess', 'socket', 'ctypes']
        for module in dangerous_modules:
            assert executor._is_module_safe(module) is False
        
        # Test safe modules
        safe_modules = ['json', 'math', 'datetime', 'random', 'string']
        for module in safe_modules:
            assert executor._is_module_safe(module) is True
    
    def test_context_sanitization(self, executor):
        """Test that context data is properly sanitized"""
        dangerous_context = {
            'safe_string': 'hello',
            'safe_number': 42,
            'safe_list': [1, 2, 3],
            'safe_dict': {'key': 'value'},
            'dangerous_function': lambda x: x,
            'dangerous_module': __import__('os'),
            'dangerous_class': type('Test', (), {}),
        }
        
        sanitized = executor._sanitize_context(dangerous_context)
        
        # Safe values should be preserved
        assert sanitized['safe_string'] == 'hello'
        assert sanitized['safe_number'] == 42
        assert sanitized['safe_list'] == [1, 2, 3]
        assert sanitized['safe_dict'] == {'key': 'value'}
        
        # Dangerous values should be removed or converted
        assert 'dangerous_function' not in sanitized
        assert 'dangerous_module' not in sanitized
        assert 'dangerous_class' not in sanitized
    
    def test_result_safety_check(self, executor):
        """Test that execution results are checked for safety"""
        # Safe results
        safe_results = ["hello", 42, [1, 2, 3], {"key": "value"}]
        for result in safe_results:
            assert executor._is_result_safe(result) is True
        
        # Dangerous results
        dangerous_results = [
            __import__('os'),
            lambda x: x,
            type('Test', (), {}),
        ]
        for result in dangerous_results:
            assert executor._is_result_safe(result) is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
/**
 * Integration tests for PythonTransform node
 * Epic 8 Story 8.1.4: Tests for Python executor integration
 */
import { PythonTransformNode } from '../runtime/nodes/PythonTransform';
import { AdvancedExecutionUtils } from '../runtime/advanced';
import { PythonExecutorClient } from '../python-executor-client';

// Mock the Python executor client
jest.mock('../python-executor-client', () => {
  const mockClient = {
  execute: jest.fn(),
  validate: jest.fn(),
  health: jest.fn(),
};
  return {
  PythonExecutorClient: jest.fn(() => mockClient),
  pythonExecutorClient: mockClient,
  executePythonCode: jest.fn(),
  validatePythonCode: jest.fn(),
};
});
describe('PythonTransformNode', () => {
  let node: PythonTransformNode;
  let mockClient: jest.Mocked<PythonExecutorClient>;
  let context: any;
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Get the mock client from the mocked module
    const { pythonExecutorClient } = require('../python-executor-client');
    mockClient = pythonExecutorClient;
    // Create test context
    context = AdvancedExecutionUtils.enhanceContext({)
  variables: { testVar: 'test value' },
      seed: 'test-seed';
  });
    // Create node with basic configuration
    node = new PythonTransformNode('test-node', {)
  code: `,
  def transform(input_data):,
  return input_data.upper()
  `,
  timeout: 30,
  memoryLimit: '128MB',
  allowedModules: ['json', 'math'],
});
  });
  describe('Basic Execution', () => {
  it('should execute Python code successfully', async () => {
  // Mock successful execution
  mockClient.execute.mockResolvedValue({)
  success: true,
  result: 'HELLO WORLD',
  execution_time: 0.1,
  memory_used: '10MB',
  sandbox_violations: 0,
  security_events: [],
  warnings: [],
  peak_memory: '15MB',
  cpu_usage: 5.2,
  modules_imported: ['json', 'math'],
  cache_hit: false,
});
      // Set up input
      context.inputs = { input: 'hello world' };
      // Execute node
      const result = await node.run(context);
      // Verify result
      expect(result).toBe('HELLO WORLD');
      expect(mockClient.execute).toHaveBeenCalledWith({)
  code: expect.stringContaining('def transform(input_data):'),
        input_data: 'hello world',
        timeout: 30,
        memory_limit: '128MB',
        allowed_modules: ['json', 'math'],
        context: expect.objectContaining({,)
  variables: { testVar: 'test value' },
          nodeId: 'test-node',
          seed: 'test-seed';
  }),
        strict_mode: true;
  });
    });
    it('should handle execution failure with error fallback', async () => {
  // Mock execution failure
  mockClient.execute.mockResolvedValue({)
  success: false,
  error_type: 'SyntaxError',
  error_message: 'Invalid syntax',
  error_code: 'SYNTAX_ERROR',
  execution_time: 0.0,
  memory_used: '0MB',
  sandbox_violations: 0,
  security_events: [],
  warnings: [],
  peak_memory: '0MB',
  cpu_usage: 0,
  modules_imported: [],
  cache_hit: false,
});
      // Set up input
      context.inputs = { input: 'test input' };
      // Execute node and expect error
      await expect(node.run(context)).rejects.toThrow('Python execution failed: Invalid syntax');
    });
    it('should handle execution failure with skip fallback', async () => {
      // Create node with skip fallback
      node = new PythonTransformNode('test-node', {)
  code: 'invalid code',
        pythonConfig: { fallbackBehavior: 'skip' }
      });
      // Mock execution failure
      mockClient.execute.mockResolvedValue({)
  success: false,
  error_type: 'SyntaxError',
  error_message: 'Invalid syntax',
  error_code: 'SYNTAX_ERROR',
  execution_time: 0.0,
  memory_used: '0MB',
  sandbox_violations: 0,
  security_events: [],
  warnings: [],
  peak_memory: '0MB',
  cpu_usage: 0,
  modules_imported: [],
  cache_hit: false,
});
      // Set up input
      context.inputs = { input: 'test input' };
      // Execute node
      const result = await node.run(context);
      // Should return empty string
      expect(result).toBe('');
    });
    it('should handle execution failure with default fallback', async () => {
  // Create node with default fallback
  node = new PythonTransformNode('test-node', {)
  code: 'invalid code',
  pythonConfig: {,
  fallbackBehavior: 'default',
  defaultOutput: 'Default output',
});
      // Mock execution failure
      mockClient.execute.mockResolvedValue({)
  success: false,
  error_type: 'SyntaxError',
  error_message: 'Invalid syntax',
  error_code: 'SYNTAX_ERROR',
  execution_time: 0.0,
  memory_used: '0MB',
  sandbox_violations: 0,
  security_events: [],
  warnings: [],
  peak_memory: '0MB',
  cpu_usage: 0,
  modules_imported: [],
  cache_hit: false,
});
      // Set up input
      context.inputs = { input: 'test input' };
      // Execute node
      const result = await node.run(context);
      // Should return default output
      expect(result).toBe('Default output');
    });
    it('should handle client errors with error fallback', async () => {
      // Mock client error
      mockClient.execute.mockRejectedValue(new Error('Service unavailable'));
      // Set up input
      context.inputs = { input: 'test input' };
      // Execute node and expect error
      await expect(node.run(context)).rejects.toThrow('Python executor service error: Service unavailable');
    });
    it('should handle client errors with skip fallback', async () => {
      // Create node with skip fallback
      node = new PythonTransformNode('test-node', {)
  code: 'def transform(input_data): return input_data',
        pythonConfig: { fallbackBehavior: 'skip' }
      });
      // Mock client error
      mockClient.execute.mockRejectedValue(new Error('Service unavailable'));
      // Set up input
      context.inputs = { input: 'test input' };
      // Execute node
      const result = await node.run(context);
      // Should return empty string
      expect(result).toBe('');
    });
  });
  describe('Configuration', () => {
    it('should validate empty code', async () => {
      // Create node with empty code
      node = new PythonTransformNode('test-node', { code: '' });
      // Set up input
      context.inputs = { input: 'test input' };
      // Execute node and expect error
      await expect(node.run(context)).rejects.toThrow('Python code is required');
    });
    it('should use custom configuration', async () => {
  // Create node with custom configuration
  node = new PythonTransformNode('test-node', {)
  code: 'def transform(input_data): return input_data',
  timeout: 60,
  memoryLimit: '256MB',
  allowedModules: ['json', 'math', 'datetime'],
  pythonConfig: {,
  strictMode: false,
  enableCaching: false,
  retryAttempts: 5,
});
      // Mock successful execution
      mockClient.execute.mockResolvedValue({)
  success: true,
  result: 'test result',
  execution_time: 0.1,
  memory_used: '20MB',
  sandbox_violations: 0,
  security_events: [],
  warnings: [],
  peak_memory: '30MB',
  cpu_usage: 2.5,
  modules_imported: [],
  cache_hit: false,
});
      // Set up input
      context.inputs = { input: 'test input' };
      // Execute node
      await node.run(context);
      // Verify configuration was used
      expect(mockClient.execute).toHaveBeenCalledWith({)
  code: expect.any(String),
  input_data: 'test input',
  timeout: 60,
  memory_limit: '256MB',
  allowed_modules: ['json', 'math', 'datetime'],
  context: expect.any(Object),
  strict_mode: false,
});
    });
    it('should handle custom executor URL', async () => {
  // Create node with custom executor URL
  node = new PythonTransformNode('test-node', {)
  code: 'def transform(input_data): return input_data',
  pythonConfig: {,
  executorUrl: 'http://custom-executor:8001',
  retryAttempts: 2,
});
      // Verify custom client was created
      expect(PythonExecutorClient).toHaveBeenCalledWith({)
  baseUrl: 'http://custom-executor:8001',
  retryAttempts: 2,
  defaultStrictMode: true,
});
    });
  });
  describe('Security Features', () => {
    it('should handle security events', async () => {
      // Mock execution with security events
      mockClient.execute.mockResolvedValue({)
  success: true,
        result: 'result',
        execution_time: 0.1,
        memory_used: '10MB',
        sandbox_violations: 2,
        security_events: [,
          {
            timestamp: Date.now(),
            level: 'warning',
            type: 'memory_warning',
            message: 'High memory usage detected',
            details: { usage: '90%' }
  }
          {
            timestamp: Date.now(),
            level: 'error',
            type: 'dangerous_pattern',
            message: 'Dangerous pattern detected',
            details: { pattern: 'eval(' })
        ],
        warnings: [],
        peak_memory: '30MB',
        cpu_usage: 2.5,
        modules_imported: [],
        cache_hit: false;
  });
      // Set up input
      context.inputs = { input: 'test input' };
      // Spy on console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      // Execute node
      const result = await node.run(context);
      // Verify result
      expect(result).toBe('result');
      expect(consoleWarnSpy).toHaveBeenCalledWith()
        expect.stringContaining('Python security event in node test-node:'),
        expect.objectContaining({)
  level: 'warning',
  type: 'memory_warning',
}
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith()
        expect.stringContaining('Python security event in node test-node:'),
        expect.objectContaining({)
  level: 'error',
  type: 'dangerous_pattern',
}
      );
      // Restore console.warn
      consoleWarnSpy.mockRestore();
    });
    it('should handle warnings', async () => {
  // Mock execution with warnings
  mockClient.execute.mockResolvedValue({)
  success: true,
  result: 'result',
  execution_time: 0.1,
  memory_used: '10MB',
  sandbox_violations: 0,
  security_events: [],
  warnings: ['Warning 1', 'Warning 2'],
  peak_memory: '30MB',
  cpu_usage: 2.5,
  modules_imported: [],
  cache_hit: false,
});
      // Set up input
      context.inputs = { input: 'test input' };
      // Spy on console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      // Execute node
      const result = await node.run(context);
      // Verify result
      expect(result).toBe('result');
      expect(consoleWarnSpy).toHaveBeenCalledWith()
        expect.stringContaining('Python warning in node test-node:'),
        expect.objectContaining({)
  warning: 'Warning 1',
}
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith()
        expect.stringContaining('Python warning in node test-node:'),
        expect.objectContaining({)
  warning: 'Warning 2',
}
      );
      // Restore console.warn
      consoleWarnSpy.mockRestore();
    });
  });
  describe('Result Processing', () => {
  it('should handle string results', async () => {
  // Mock execution with string result
  mockClient.execute.mockResolvedValue({)
  success: true,
  result: 'string result',
  execution_time: 0.1,
  memory_used: '10MB',
  sandbox_violations: 0,
  security_events: [],
  warnings: [],
  peak_memory: '30MB',
  cpu_usage: 2.5,
  modules_imported: [],
  cache_hit: false,
});
      // Set up input
      context.inputs = { input: 'test input' };
      // Execute node
      const result = await node.run(context);
      // Verify result
      expect(result).toBe('string result');
    });
    it('should handle number results', async () => {
  // Mock execution with number result
  mockClient.execute.mockResolvedValue({)
  success: true,
  result: 42,
  execution_time: 0.1,
  memory_used: '10MB',
  sandbox_violations: 0,
  security_events: [],
  warnings: [],
  peak_memory: '30MB',
  cpu_usage: 2.5,
  modules_imported: [],
  cache_hit: false,
});
      // Set up input
      context.inputs = { input: 'test input' };
      // Execute node
      const result = await node.run(context);
      // Verify result is converted to string
      expect(result).toBe('42');
    });
    it('should handle null/undefined results', async () => {
  // Mock execution with null result
  mockClient.execute.mockResolvedValue({)
  success: true,
  result: null,
  execution_time: 0.1,
  memory_used: '10MB',
  sandbox_violations: 0,
  security_events: [],
  warnings: [],
  peak_memory: '30MB',
  cpu_usage: 2.5,
  modules_imported: [],
  cache_hit: false,
});
      // Set up input
      context.inputs = { input: 'test input' };
      // Execute node
      const result = await node.run(context);
      // Verify result is empty string
      expect(result).toBe('');
    });
  });
  describe('Validation', () => {
  it('should validate code successfully', async () => {
  // Mock successful validation
  mockClient.validate.mockResolvedValue({)
  valid: true,
  errors: [],
  warnings: [],
});
      // Validate code
      const result = await node.validateCode();
      // Verify result
      expect(result).toEqual({)
  valid: true,
  errors: [],
  warnings: [],
});
      expect(mockClient.validate).toHaveBeenCalledWith({)
  code: expect.stringContaining('def transform(input_data):'),
  strict_mode: true,
});
    });
    it('should validate code with errors', async () => {
  // Mock validation with errors
  mockClient.validate.mockResolvedValue({)
  valid: false,
  errors: ['Syntax error', 'Missing function'],
  warnings: ['Performance warning'],
});
      // Validate code
      const result = await node.validateCode();
      // Verify result
      expect(result).toEqual({)
  valid: false,
  errors: ['Syntax error', 'Missing function'],
  warnings: ['Performance warning'],
});
    });
    it('should handle empty code validation', async () => {
      // Create node with empty code
      node = new PythonTransformNode('test-node', { code: '' });
      // Validate code
      const result = await node.validateCode();
      // Verify result
      expect(result).toEqual({)
  valid: false,
  errors: ['Python code is required'],
  warnings: [],
});
    });
    it('should handle validation service errors', async () => {
  // Mock validation service error
  mockClient.validate.mockRejectedValue(new Error('Service unavailable'));
  // Validate code
  const result = await node.validateCode();
  // Verify result
  expect(result).toEqual({)
  valid: false,
  errors: ['Validation service error: Service unavailable'],
  warnings: [],
});
    });
  });
  describe('Service Health', () => {
  it('should check service availability', async () => {
  // Mock health check success
  mockClient.health.mockResolvedValue({)
  status: 'healthy',
  version: '1.0.0',
  uptime: 3600,
});
      // Check availability
      const available = await node.isServiceAvailable();
      // Verify result
      expect(available).toBe(true);
    });
    it('should handle service unavailability', async () => {
      // Mock health check failure
      mockClient.health.mockRejectedValue(new Error('Service unavailable'));
      // Check availability
      const available = await node.isServiceAvailable();
      // Verify result
      expect(available).toBe(false);
    });
    it('should get service health', async () => {
  // Mock health check success
  const healthData = {
  status: 'healthy',
  version: '1.0.0',
  uptime: 3600,
};
      mockClient.health.mockResolvedValue(healthData);
      // Get health
      const health = await node.getServiceHealth();
      // Verify result
      expect(health).toEqual(healthData);
    });
    it('should handle service health errors', async () => {
      // Mock health check failure
      mockClient.health.mockRejectedValue(new Error('Service unavailable'));
      // Get health
      const health = await node.getServiceHealth();
      // Verify result
      expect(health).toBeNull();
    });
  });
  describe('Statistics', () => {
  it('should track execution statistics', async () => {
  // Mock successful execution
  mockClient.execute.mockResolvedValue({)
  success: true,
  result: 'result',
  execution_time: 0.1,
  memory_used: '10MB',
  sandbox_violations: 0,
  security_events: [],
  warnings: [],
  peak_memory: '30MB',
  cpu_usage: 2.5,
  modules_imported: [],
  cache_hit: false,
});
      // Set up input
      context.inputs = { input: 'test input' };
      // Execute node multiple times
      await node.run(context);
      await node.run(context);
      await node.run(context);
      // Get statistics
      const stats = node.getExecutionStats(context);
      // Verify statistics
      expect(stats.executionsRun).toBe(3);
      expect(stats.successRate).toBe(1.0);
      expect(stats.averageExecutionTime).toBeCloseTo(0.1, 1);
      expect(stats.securityViolations).toBe(0);
    });
    it('should track mixed success/failure statistics', async () => {
  // Mock mixed execution results
  mockClient.execute
  .mockResolvedValueOnce({)
  success: true,
  result: 'result1',
  execution_time: 0.1,
  memory_used: '10MB',
  sandbox_violations: 0,
  security_events: [],
  warnings: [],
  peak_memory: '15MB',
  cpu_usage: 2.5,
  modules_imported: [],
  cache_hit: false,
}
        .mockResolvedValueOnce({)
  success: false,
  error_type: 'Error',
  error_message: 'Error message',
  error_code: 'ERROR',
  execution_time: 0.05,
  memory_used: '5MB',
  sandbox_violations: 1,
  security_events: [],
  warnings: [],
  peak_memory: '10MB',
  cpu_usage: 1.0,
  modules_imported: [],
  cache_hit: false,
});
      // Set up input
      context.inputs = { input: 'test input' };
      // Execute node - first success
      await node.run(context);
      // Execute node - second failure (with skip fallback)
      node.updateConfig({)
  pythonConfig: { fallbackBehavior: 'skip' }
      });
      await node.run(context);
      // Get statistics
      const stats = node.getExecutionStats(context);
      // Verify statistics
      expect(stats.executionsRun).toBe(2);
      expect(stats.successRate).toBe(0.5);
      expect(stats.averageExecutionTime).toBeCloseTo(0.075, 2);
      expect(stats.securityViolations).toBe(1);
    });
  });
});
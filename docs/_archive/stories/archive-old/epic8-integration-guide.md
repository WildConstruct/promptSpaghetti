# Epic 8.1.4 - Python Executor Integration Guide

**Story 8.1.4 Complete**: Main application integration with Python Executor Service

This guide covers the complete integration of the Python Executor Service with the main prompt-spaghetti application, enabling users to execute Python code within their prompt graphs.

## Overview

The Python Executor integration provides:

- **PythonTransform Node**: New node type for executing Python code
- **TypeScript Client**: Robust client for communicating with Python executor service
- **Inspector UI**: Rich code editor with syntax highlighting and validation
- **Configuration System**: Flexible configuration management
- **Fallback Mechanisms**: Graceful handling of service unavailability
- **Security Integration**: Full security monitoring and validation

## Architecture

### Integration Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Main Application                              │
│                                                                 │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐ │
│  │   PythonTransform│   │   Inspector UI  │   │   Configuration │ │
│  │       Node       │   │     Editor      │   │    Manager      │ │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘ │
│            │                      │                      │       │
│            └──────────────────────┼──────────────────────┘       │
│                                   │                              │
│  ┌─────────────────────────────────┼──────────────────────────┐   │
│  │             TypeScript Client    │                          │   │
│  │  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────┐ │   │
│  │  │   HTTP Client   │   │   Retry Logic   │   │   Fallback  │ │   │
│  │  └─────────────────┘   └─────────────────┘   └─────────────┘ │   │
│  └─────────────────────────────────┼──────────────────────────┘   │
└─────────────────────────────────────┼──────────────────────────────┘
                                      │
                                      │ HTTP/REST API
                                      │
┌─────────────────────────────────────┼──────────────────────────────┐
│                Python Executor Service                          │
│                                                                 │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐ │
│  │   Secure        │   │   Security      │   │   Audit         │ │
│  │   Executor      │   │   Monitor       │   │   Logger        │ │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. PythonTransform Node

**Location**: `packages/core/runtime/nodes/PythonTransform.ts`

The PythonTransform node extends the AdvancedRuntimeNode and provides:

```typescript
interface PythonTransformConfig {
  code: string;
  timeout?: number;
  memoryLimit?: string;
  allowedModules?: string[];
  pythonConfig?: {
    strictMode?: boolean;
    enableCaching?: boolean;
    executorUrl?: string;
    retryAttempts?: number;
    fallbackBehavior?: 'error' | 'skip' | 'default';
    defaultOutput?: string;
  };
}
```

**Key Features**:

- Secure code execution with resource limits
- Comprehensive error handling and fallback mechanisms
- Security event monitoring and logging
- Performance tracking and statistics
- Result validation and type conversion

### 2. TypeScript Client

**Location**: `packages/core/python-executor-client.ts`

The client provides a robust interface to the Python executor service:

```typescript
class PythonExecutorClient {
  async execute(request: PythonExecutionRequest): Promise<PythonExecutionResult>;
  async validate(request: PythonValidationRequest): Promise<PythonValidationResult>;
  async health(): Promise<{ status: string; version: string; uptime: number }>;
  async metrics(): Promise<any>;
}
```

**Key Features**:

- Automatic retry logic with exponential backoff
- Request timeout and cancellation
- Comprehensive error handling
- Metrics collection and monitoring
- Multiple authentication methods

### 3. Inspector UI Editor

**Location**: `packages/core/components/Inspector/editors/PythonTransformEditor.tsx`

Rich editor interface providing:

- **Code Editor**: Syntax-highlighted Python code editor
- **Real-time Validation**: Live code validation with error reporting
- **Module Management**: UI for managing allowed Python modules
- **Resource Configuration**: Controls for memory limits and timeouts
- **Security Settings**: Strict mode, caching, and fallback options
- **Preview**: Configuration preview and code snippets

### 4. Configuration System

**Location**: `packages/core/config/python-executor.ts`

Comprehensive configuration management:

```typescript
interface PythonExecutorConfig {
  serviceUrl: string;
  apiKey?: string;
  timeout: number;
  retryAttempts: number;
  defaultMemoryLimit: string;
  strictMode: boolean;
  enableCaching: boolean;
  allowedModules: string[];
  fallbackBehavior: 'error' | 'skip' | 'default';
  // ... more options
}
```

**Key Features**:

- Environment variable support
- Configuration validation
- Change listeners and notifications
- Environment-specific configurations
- JSON import/export

### 5. Schema Integration

**Location**: `packages/core/graphSchema.ts`

Extended graph schema to support PythonTransform nodes:

```typescript
export const PythonTransformNodeSchema = BaseNode.extend({
  type: z.literal('PythonTransform'),
  code: z.string(),
  timeout: z.number().positive().optional(),
  memoryLimit: z.string().optional(),
  allowedModules: z.array(z.string()).optional(),
  pythonConfig: z
    .object({
      strictMode: z.boolean().optional(),
      enableCaching: z.boolean().optional(),
      executorUrl: z.string().optional(),
      retryAttempts: z.number().min(0).optional(),
      fallbackBehavior: z.enum(['error', 'skip', 'default']).optional(),
      defaultOutput: z.string().optional(),
    })
    .optional(),
});
```

### 6. Engine Integration

**Location**: `server/src/engine.ts`

Extended the execution engine to support PythonTransform nodes:

```typescript
case 'PythonTransform':
  return new PythonTransformNode(node.id, {
    code: node.code,
    timeout: node.timeout,
    memoryLimit: node.memoryLimit,
    allowedModules: node.allowedModules,
    pythonConfig: node.pythonConfig
  });
```

## Usage Examples

### Basic Python Transform

```typescript
// Create a simple Python transform node
const node = new PythonTransformNode('uppercase-transform', {
  code: `
def transform(input_data):
    return input_data.upper()
  `,
  timeout: 30,
  memoryLimit: '128MB',
  allowedModules: ['json', 'math'],
});

// Execute the node
const result = await node.execute(context);
```

### Advanced Configuration

```typescript
// Create a node with advanced configuration
const node = new PythonTransformNode('advanced-transform', {
  code: `
import json
import math

def transform(input_data):
    data = json.loads(input_data)
    processed = {
        'original': data,
        'sqrt_value': math.sqrt(data.get('number', 0)),
        'processed_at': context.get('timestamp')
    }
    return json.dumps(processed)
  `,
  timeout: 60,
  memoryLimit: '256MB',
  allowedModules: ['json', 'math', 'datetime'],
  pythonConfig: {
    strictMode: true,
    enableCaching: true,
    retryAttempts: 3,
    fallbackBehavior: 'default',
    defaultOutput: '{"error": "Processing failed"}',
  },
});
```

### Configuration Management

```typescript
import { pythonExecutorConfig } from './config/python-executor';

// Update configuration
pythonExecutorConfig.update({
  serviceUrl: 'https://python-executor.example.com',
  apiKey: 'your-api-key',
  defaultMemoryLimit: '256MB',
  strictMode: true,
});

// Listen for configuration changes
pythonExecutorConfig.addListener(config => {
  console.log('Configuration updated:', config);
});
```

## Security Considerations

### Code Validation

The integration includes comprehensive security validation:

1. **Pre-execution Validation**: Code is validated before execution
2. **Pattern Detection**: Dangerous patterns are detected and blocked
3. **Module Restrictions**: Only allowed modules can be imported
4. **Resource Limits**: Memory and CPU limits are enforced
5. **Sandbox Isolation**: Code runs in isolated environments

### Security Events

Security events are automatically logged and monitored:

```typescript
// Example security event handling
node.addSecurityEventHandler(event => {
  if (event.level === 'critical') {
    // Alert security team
    alertSecurityTeam(event);
  }

  // Log all events
  auditLogger.log(event);
});
```

## Error Handling

### Fallback Mechanisms

Three fallback behaviors are supported:

1. **Error**: Throw an error (default)
2. **Skip**: Return empty string
3. **Default**: Return predefined default value

```typescript
// Configure fallback behavior
const node = new PythonTransformNode('resilient-transform', {
  code: 'def transform(input_data): return input_data',
  pythonConfig: {
    fallbackBehavior: 'default',
    defaultOutput: 'Processing temporarily unavailable',
  },
});
```

### Retry Logic

Automatic retry with exponential backoff:

```typescript
const client = new PythonExecutorClient({
  retryAttempts: 3,
  retryDelay: 1000, // 1 second base delay
  timeout: 30000, // 30 second timeout
});
```

## Monitoring and Metrics

### Performance Tracking

Built-in performance monitoring:

```typescript
// Get execution statistics
const stats = node.getExecutionStats();
console.log('Execution stats:', {
  executionsRun: stats.executionsRun,
  successRate: stats.successRate,
  averageExecutionTime: stats.averageExecutionTime,
  securityViolations: stats.securityViolations,
});
```

### Health Monitoring

Service health checking:

```typescript
// Check service availability
const available = await node.isServiceAvailable();
if (!available) {
  console.warn('Python executor service is unavailable');
}

// Get detailed health information
const health = await node.getServiceHealth();
console.log('Service health:', health);
```

## Testing

### Unit Tests

Comprehensive test suite covering:

- Basic execution scenarios
- Error handling and fallbacks
- Security validation
- Configuration management
- Performance tracking

**Location**: `packages/core/__tests__/PythonTransform.test.ts`

### Integration Tests

Integration tests validate:

- End-to-end execution flow
- Service communication
- Error scenarios
- Security features

### Example Test

```typescript
describe('PythonTransformNode', () => {
  it('should execute Python code successfully', async () => {
    const node = new PythonTransformNode('test-node', {
      code: 'def transform(input_data): return input_data.upper()',
    });

    const result = await node.execute(context);
    expect(result).toBe('HELLO WORLD');
  });
});
```

## Configuration Examples

### Environment Variables

```bash
# Service connection
PYTHON_EXECUTOR_URL=https://python-executor.example.com
PYTHON_EXECUTOR_API_KEY=your-api-key

# Resource limits
PYTHON_EXECUTOR_DEFAULT_MEMORY_LIMIT=256MB
PYTHON_EXECUTOR_DEFAULT_TIMEOUT=30
PYTHON_EXECUTOR_MAX_MEMORY_LIMIT=1GB
PYTHON_EXECUTOR_MAX_TIMEOUT=300

# Security settings
PYTHON_EXECUTOR_STRICT_MODE=true
PYTHON_EXECUTOR_ENABLE_CACHING=true
PYTHON_EXECUTOR_ALLOWED_MODULES=json,math,datetime,random

# Fallback behavior
PYTHON_EXECUTOR_FALLBACK_BEHAVIOR=skip
PYTHON_EXECUTOR_DEFAULT_OUTPUT=""

# Monitoring
PYTHON_EXECUTOR_ENABLE_METRICS=true
PYTHON_EXECUTOR_ENABLE_TRACING=true
PYTHON_EXECUTOR_ENABLE_AUDIT_LOGS=true
```

### JSON Configuration

```json
{
  "serviceUrl": "https://python-executor.example.com",
  "apiKey": "your-api-key",
  "timeout": 30000,
  "retryAttempts": 3,
  "defaultMemoryLimit": "256MB",
  "strictMode": true,
  "enableCaching": true,
  "allowedModules": ["json", "math", "datetime"],
  "fallbackBehavior": "skip",
  "enableMetrics": true
}
```

## Deployment Considerations

### Production Deployment

1. **Service Discovery**: Configure service URL for production
2. **Authentication**: Set up API keys and authentication
3. **Monitoring**: Enable metrics and logging
4. **Security**: Use strict mode and restricted modules
5. **Fallback**: Configure appropriate fallback behavior

### Development Setup

1. **Local Service**: Run Python executor locally
2. **Debug Mode**: Enable debug logging
3. **Relaxed Security**: Use less restrictive settings for development
4. **Caching**: Enable caching for faster iterations

## Troubleshooting

### Common Issues

1. **Service Unavailable**
   - Check service URL and connectivity
   - Verify API key authentication
   - Check service health endpoint

2. **Execution Timeout**
   - Increase timeout settings
   - Optimize Python code performance
   - Check for infinite loops

3. **Memory Limit Exceeded**
   - Increase memory limit
   - Optimize memory usage in Python code
   - Check for memory leaks

4. **Security Violations**
   - Review dangerous patterns in code
   - Check allowed modules list
   - Verify security settings

### Debug Information

Enable debug logging for detailed troubleshooting:

```typescript
import { pythonExecutorConfig } from './config/python-executor';

pythonExecutorConfig.update({
  enableDebugLogs: true,
  enableMetrics: true,
  enableTracing: true,
});
```

## Summary

The Python Executor integration successfully completes **Story 8.1.4 - Main Application Integration** by providing:

### ✅ **Completed Features**:

1. **PythonTransform Node**: Complete node implementation with advanced features
2. **TypeScript Client**: Robust client with retry logic and error handling
3. **Inspector UI**: Rich editor with syntax highlighting and validation
4. **Configuration System**: Comprehensive configuration management
5. **Schema Integration**: Extended graph schema for Python nodes
6. **Engine Integration**: Full executor engine support
7. **Security Integration**: Complete security monitoring and validation
8. **Fallback Mechanisms**: Graceful handling of service unavailability
9. **Testing Suite**: Comprehensive unit and integration tests
10. **Documentation**: Complete integration guide and examples

### **Key Benefits**:

- **Seamless Integration**: Python executor works seamlessly within prompt graphs
- **Robust Error Handling**: Multiple fallback mechanisms ensure reliability
- **Security-First**: Comprehensive security validation and monitoring
- **Performance Monitoring**: Built-in metrics and performance tracking
- **Developer Experience**: Rich UI and comprehensive documentation
- **Production Ready**: Full configuration management and deployment support

The integration enables users to leverage Python's powerful capabilities within their prompt engineering workflows while maintaining security, reliability, and performance standards.

### **Next Steps**:

With Story 8.1.4 complete, the Python Executor Service is fully integrated with the main application. The next stories in Epic 8 would focus on:

- **Story 8.1.5**: Performance monitoring and optimization
- **Story 8.1.6**: Documentation and examples
- **Story 8.2**: Corrections Manager general availability
- **Story 8.3**: Content Authoring Handbook
- **Story 8.4**: Extension System Architecture

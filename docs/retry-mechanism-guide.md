# Retry Mechanism Implementation Guide

**Epic 17** - Task: E17-1753114396828-35CAE6
**Implementation Date**: 2025-07-22

## Overview

The retry mechanism system provides robust error handling and automatic recovery for critical operations throughout the application. It implements exponential backoff, jitter, circuit breaker patterns, and comprehensive error categorization to improve system reliability.

## Features

### Core Capabilities

- **Exponential Backoff**: Intelligent delay calculation with configurable base delay and maximum delay
- **Jitter**: Random variation to prevent thundering herd problems
- **Circuit Breaker**: Automatic failure detection and service protection
- **Error Classification**: Retryable vs non-retryable error categorization
- **Detailed Logging**: Comprehensive retry attempt tracking and analytics
- **Decorator Support**: Simple decorator-based retry configuration

### Specialized Patterns

- **Database Operations**: Optimized for database timeouts, deadlocks, and connection issues
- **HTTP Operations**: Tailored for API calls with appropriate status code handling
- **File Operations**: Handles file system locking and resource conflicts
- **Log Analysis**: Specific patterns for log processing and analysis operations

## Usage Examples

### Basic Retry with Manual Configuration

```typescript
import { RetryUtils } from '../utils/RetryUtils';

// Simple retry with default settings
const result = await RetryUtils.execute(async () => {
  return await someOperation();
});

// Custom retry configuration
const result = await RetryUtils.execute(
  async () => {
    return await complexOperation();
  },
  {
    maxAttempts: 5,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    jitter: true,
    retryableErrors: [/timeout/i, /connection/i, 500, 503],
    onAttempt: (attempt, error) => {
      console.log(`Attempt ${attempt} failed: ${error.message}`);
    }
  }
);
```

### Database Operations with Decorators

```typescript
import { retryableDatabase } from '../utils/RetryUtils';

class UserService {
  @retryableDatabase({ maxAttempts: 3, baseDelay: 500 })
  async createUser(userData: any): Promise<User> {
    return await this.db.query('INSERT INTO users...', userData);
  }

  @retryableDatabase()
  async updateUser(id: string, updates: any): Promise<void> {
    await this.db.query('UPDATE users SET ... WHERE id = ?', [updates, id]);
  }
}
```

### HTTP Operations with Retry

```typescript
import { RetryUtils, retryableHttp } from '../utils/RetryUtils';

class ExternalAPIService {
  @retryableHttp({
    maxAttempts: 4,
    baseDelay: 1000,
    retryableErrors: [500, 502, 503, 504, 408, 429]
  })
  async callExternalAPI(endpoint: string): Promise<any> {
    const response = await fetch(endpoint);
    if (!response.ok) {
      const error = new Error(
        `HTTP ${response.status}: ${response.statusText}`
      ) as any;
      error.status = response.status;
      throw error;
    }
    return await response.json();
  }
}
```

### Pattern-Based Retry

```typescript
import { RetryPatterns } from '../utils/RetryUtils';

// File operations
const filePath = await RetryPatterns.fileOperation(async () => {
  return await fs.writeFile('/path/to/file', data);
});

// API calls with service identification
const apiData = await RetryPatterns.apiCall(
  () => this.fetchDataFromAPI(),
  'user-service'
);

// Log analysis operations
await RetryPatterns.logAnalysis(async () => {
  return await this.processLogBatch(logs);
});
```

### Circuit Breaker Pattern

```typescript
import { RetryUtils } from '../utils/RetryUtils';

// Circuit breaker prevents cascade failures
const result = await RetryUtils.executeWithCircuitBreaker(
  async () => {
    return await unreliableService.performOperation();
  },
  'unreliable-service-key',
  {
    maxAttempts: 3,
    baseDelay: 1000
  }
);
```

### Detailed Retry Results

```typescript
import { RetryUtils } from '../utils/RetryUtils';

const result = await RetryUtils.executeWithResult(
  async () => {
    return await riskyOperation();
  },
  { maxAttempts: 3 }
);

if (result.success) {
  console.log(
    `Operation succeeded after ${result.attempts} attempts in ${result.totalTime}ms`
  );
  console.log('Result:', result.result);
} else {
  console.error(`Operation failed after ${result.attempts} attempts:`);
  console.error('Final error:', result.error);
  console.error('Retry history:', result.retryHistory);
}
```

## Configuration Options

### RetryOptions Interface

```typescript
interface RetryOptions {
  maxAttempts?: number; // Maximum retry attempts (default: 3)
  baseDelay?: number; // Base delay in milliseconds (default: 1000)
  maxDelay?: number; // Maximum delay in milliseconds (default: 30000)
  backoffFactor?: number; // Exponential backoff multiplier (default: 2)
  jitter?: boolean; // Add random jitter to delays (default: true)
  retryableErrors?: Array<string | number | RegExp>; // Error patterns to retry
  onAttempt?: (attempt: number, error: Error) => void;
  onSuccess?: (attempt: number, result: any) => void;
  onFailure?: (attempts: number, finalError: Error) => void;
}
```

### Default Configurations

#### Database Operations

- **Max Attempts**: 3
- **Base Delay**: 500ms
- **Max Delay**: 5000ms
- **Backoff Factor**: 2
- **Retryable Errors**: Connection issues, timeouts, deadlocks

#### HTTP Operations

- **Max Attempts**: 3
- **Base Delay**: 1000ms
- **Max Delay**: 10000ms
- **Backoff Factor**: 1.5
- **Retryable Errors**: 5xx status codes, timeouts, network errors

#### File Operations

- **Max Attempts**: 3
- **Base Delay**: 100ms
- **Max Delay**: 1000ms
- **Retryable Errors**: File busy, resource unavailable

## Integration Examples

### Log Analysis Service Integration

The LogAnalysisService demonstrates comprehensive retry integration:

```typescript
// Database operations with retry
@retryableDatabase({ maxAttempts: 3, baseDelay: 500 })
async ingestLog(level, source, component, message): Promise<string> {
  // Database insertion with automatic retry on connection issues
}

// Analysis operations with custom retry logic
async startAnalysisSession(sessionId: string): Promise<void> {
  try {
    // Normal processing
  } catch (error) {
    // Retry critical real-time analysis
    if (session.analysis_type === 'real_time') {
      await RetryPatterns.logAnalysis(async () => {
        const rules = await this.getApplicableRules(session);
        await this.processRealTimeLogs(session, rules);
      });
    }
  }
}

// Notification with HTTP retry pattern
private async sendNotification(rule, log): Promise<void> {
  await RetryPatterns.apiCall(async () => {
    // Send notification to external service
  }, 'notification_service');
}
```

### Audit Service Integration

```typescript
@retryableDatabase({ maxAttempts: 3, baseDelay: 300 })
async logEvent(event: AuditEvent): Promise<void> {
  // Audit logging with automatic retry
  // Critical for compliance - must not lose audit events
}
```

## Error Handling

### Error Classification

The retry system automatically classifies errors:

1. **Retryable Errors**:
   - Network timeouts (ETIMEDOUT, ECONNRESET)
   - Server errors (500, 502, 503, 504)
   - Database deadlocks and connection issues
   - File system resource conflicts
   - Rate limiting (429)

2. **Non-Retryable Errors**:
   - Authentication failures (401, 403)
   - Client errors (400, 404)
   - Validation errors
   - Business logic errors

### Custom Error Patterns

```typescript
// Retry only specific error types
{
  retryableErrors: [
    /timeout/i, // Regex pattern
    'ECONNRESET', // String match
    500, // HTTP status code
    /analysis.*failed/i // Custom pattern
  ];
}
```

## Monitoring and Observability

### Retry Metrics

The system provides comprehensive retry analytics:

```typescript
// Enable detailed logging
{
  onAttempt: (attempt, error) => {
    console.warn(`Operation failed (attempt ${attempt}): ${error.message}`);
  },
  onSuccess: (attempt, result) => {
    if (attempt > 1) {
      console.log(`Operation recovered after ${attempt} attempts`);
    }
  },
  onFailure: (attempts, error) => {
    console.error(`Operation failed permanently after ${attempts} attempts: ${error.message}`);
  }
}
```

### Circuit Breaker Monitoring

```typescript
// Circuit breaker states: CLOSED, OPEN, HALF_OPEN
// Automatic state transitions based on failure thresholds
// 60-second timeout for recovery attempts
```

## Best Practices

### 1. Choose Appropriate Retry Counts

- **Critical operations**: 3-5 attempts
- **User-facing operations**: 2-3 attempts
- **Background tasks**: 5-10 attempts

### 2. Use Appropriate Delays

- **Fast operations**: 100-500ms base delay
- **Network operations**: 1000-2000ms base delay
- **Heavy processing**: 2000-5000ms base delay

### 3. Implement Proper Error Classification

```typescript
// Good: Specific error patterns
retryableErrors: [/timeout/i, /connection/i, 500, 503];

// Bad: Retry everything
retryableErrors: []; // This retries ALL errors
```

### 4. Use Circuit Breakers for External Dependencies

```typescript
// Protect against cascading failures
await RetryUtils.executeWithCircuitBreaker(
  () => externalService.call(),
  'external-service-key'
);
```

### 5. Monitor and Alert on Retry Patterns

```typescript
// Log retry attempts for monitoring
onAttempt: (attempt, error) => {
  if (attempt > 1) {
    // Send metrics to monitoring system
    metrics.increment('retry.attempt', { service: 'log-analysis' });
  }
};
```

## Performance Considerations

### Memory Usage

- Retry history is stored per operation
- Circuit breaker states are cached in memory
- Clear completed retry sessions periodically

### Latency Impact

- Exponential backoff increases operation time
- Use appropriate maximum delay limits
- Consider timeout vs retry trade-offs

### Resource Protection

- Circuit breakers prevent resource exhaustion
- Jitter prevents synchronized retry storms
- Rate limiting integration available

## Migration Guide

### Existing Services

1. **Add Import**:

```typescript
import { RetryUtils, retryableDatabase } from '../utils/RetryUtils';
```

2. **Add Decorators to Critical Methods**:

```typescript
@retryableDatabase()
async criticalDatabaseOperation() { ... }
```

3. **Update Error Handling**:

```typescript
// Replace try-catch with retry logic
const result = await RetryUtils.execute(() => operation());
```

### Testing Considerations

```typescript
// Disable retries in tests for faster execution
process.env.DISABLE_RETRIES = 'true';

// Or use minimal retry configuration
{ maxAttempts: 1, baseDelay: 0 }
```

## Troubleshooting

### Common Issues

1. **Infinite Retries**: Check retryableErrors configuration
2. **Too Many Retries**: Reduce maxAttempts for user-facing operations
3. **Circuit Breaker Stuck Open**: Check error classification and thresholds
4. **Performance Impact**: Reduce baseDelay and maxDelay values

### Debug Logging

Enable detailed retry logging:

```typescript
{
  onAttempt: (attempt, error) => {
    console.debug(`Retry attempt ${attempt}: ${error.message}`);
  };
}
```

## Conclusion

The retry mechanism system provides a robust foundation for handling transient failures throughout the application. By implementing proper retry strategies, the system can automatically recover from temporary issues, improve reliability, and provide better user experience.

The system is designed to be:

- **Easy to use**: Simple decorators and utility functions
- **Configurable**: Extensive customization options
- **Observable**: Comprehensive logging and monitoring
- **Efficient**: Optimized delay algorithms and circuit breaker protection

For questions or issues, refer to the RetryDemoService for comprehensive usage examples.

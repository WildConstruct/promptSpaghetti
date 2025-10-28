# Adaptive Throttling Rules Implementation

## Overview

This document describes the implementation of adaptive throttling rules as part of Task E17-1753114397229-D69134. The system provides intelligent request throttling that adapts to system conditions, threat levels, and usage patterns.

## Architecture

### Core Components

1. **AdaptiveThrottlingRulesEngine** - Main throttling engine
2. **AdaptiveThrottlingMiddleware** - Fastify integration middleware
3. **SystemMonitor** - System metrics collection
4. **Rule Configuration System** - Dynamic rule management

### Files Created

- `packages/core/security/AdaptiveThrottlingRules.ts` - Core throttling engine
- `packages/core/security/__tests__/AdaptiveThrottlingRules.test.ts` - Comprehensive tests
- `server/src/middleware/adaptive-throttling.ts` - Fastify middleware integration
- `docs/throttling-rules-implementation.md` - This documentation

## Features

### Throttling Modes

1. **Adaptive Throttling**
   - Adjusts throttling based on system load and threat level
   - Multipliers for different system conditions
   - Considers CPU usage, memory usage, and error rates

2. **Progressive Throttling**
   - Escalates restrictions based on failure patterns
   - Configurable escalation steps
   - Percentage-based blocking at higher levels

3. **Circuit Breaker**
   - Protects against cascading failures
   - States: Closed → Open → Half-Open → Closed
   - Configurable failure thresholds and recovery timeouts

4. **Load Shedding**
   - Drops requests when system load exceeds thresholds
   - Percentage-based request dropping
   - Immediate response with 503 status

5. **Bandwidth Shaping**
   - Token bucket algorithm for rate limiting
   - Configurable refill rates and burst sizes
   - Smooth traffic shaping

### System Condition Assessment

The system continuously monitors and categorizes system conditions:

- **NORMAL** - Low load, minimal errors
- **ELEVATED** - Moderate load increase
- **HIGH_LOAD** - Significant system stress
- **OVERLOAD** - Critical system stress
- **UNDER_ATTACK** - Active attack patterns detected

### Threat Level Integration

Integrates with the existing RateLimitingService threat assessment:

- **LOW** - Normal traffic patterns
- **MEDIUM** - Suspicious activity detected
- **HIGH** - Likely malicious activity
- **CRITICAL** - Active attack in progress

## Configuration

### Basic Rule Configuration

```typescript
const rule: ThrottlingRule = {
  id: 'api-adaptive',
  name: 'API Adaptive Throttling',
  description: 'Adaptive throttling for API endpoints',
  enabled: true,
  priority: 900,
  mode: ThrottlingMode.ADAPTIVE,
  triggerConditions: [
    {
      type: 'endpoint',
      operator: 'contains',
      value: '/api'
    }
  ],
  baseDelay: 100,
  maxDelay: 5000,
  adaptiveMultiplier: 1.5
  // ... other configurations
};
```

### Middleware Configuration

```typescript
const middleware = new AdaptiveThrottlingMiddleware(rateLimitingService, {
  enabled: true,
  skipHealthChecks: true,
  skipStaticAssets: true,
  maxDelayMs: 10000,
  enableMetricsCollection: true,
  systemMetricsInterval: 30000,
  logThrottledRequests: true
});
```

## Default Rules

The system includes several pre-configured rules:

### 1. API Adaptive Throttling

- **Target**: `/api` endpoints
- **Mode**: Adaptive
- **Base Delay**: 100ms
- **Max Delay**: 5000ms
- **Multiplier**: 1.5x

### 2. Authentication Circuit Breaker

- **Target**: Authentication endpoints (`/login`, `/register`, `/auth`)
- **Mode**: Circuit Breaker
- **Failure Threshold**: 5 failures
- **Recovery Timeout**: 5 minutes
- **Half-Open Requests**: 3

### 3. System Load Shedding

- **Trigger**: System load > 85%
- **Mode**: Load Shedding
- **Shed Percentage**: 50%
- **Response**: 503 Service Unavailable

### 4. Preview Bandwidth Shaping

- **Target**: `/preview` endpoints
- **Mode**: Bandwidth Shaping
- **Rate**: 2 requests/second
- **Burst Size**: 10 requests

## Integration with Existing Systems

### Rate Limiting Service Integration

The throttling system integrates with the existing `RateLimitingService`:

```typescript
const engine = new AdaptiveThrottlingRulesEngine(rateLimitingService);
```

### Fastify Integration

```typescript
// Register the plugin
await fastify.register(
  createAdaptiveThrottlingPlugin(rateLimitingService, {
    enabled: true,
    logThrottledRequests: true
  })
);

// Access middleware methods
fastify.adaptiveThrottling.addThrottlingRule(customRule);
```

## Monitoring and Observability

### Statistics Endpoint

```
GET /api/throttling/stats
```

Returns comprehensive statistics:

```json
{
  "engine": {
    "rulesCount": 4,
    "activeRules": 4,
    "circuitBreakers": {
      "auth-circuit-breaker": {
        "state": "closed",
        "failureCount": 0
      }
    },
    "tokenBuckets": {
      "preview-bandwidth": {
        "tokens": 8,
        "capacity": 10
      }
    },
    "systemCondition": "normal",
    "systemMetrics": {
      "cpuUsage": 35.2,
      "memoryUsage": 42.1,
      "errorRate": 1.5
    }
  }
}
```

### Control Endpoints

Enable/disable throttling:

```
POST /api/throttling/enable
{
  "enabled": true
}
```

### Event Emission

The system emits events for monitoring:

- `throttlingApplied` - When throttling is applied
- `circuitBreakerOpened` - When circuit breaker opens
- `circuitBreakerClosed` - When circuit breaker recovers
- `ruleAdded` - When new rule is added
- `metricsUpdated` - When system metrics update

## Testing

The implementation includes comprehensive tests covering:

- Rule management and validation
- All throttling modes
- System condition assessment
- Circuit breaker state transitions
- Token bucket mechanics
- Event emission
- Integration scenarios

### Running Tests

```bash
npm test -- AdaptiveThrottlingRules
```

## Performance Characteristics

### Memory Usage

- Efficient in-memory storage of throttling state
- Automatic cleanup of old data
- Token bucket state is lightweight

### CPU Impact

- Minimal overhead per request
- Efficient condition evaluation
- Optimized rule matching

### Response Time Impact

- Adaptive delays based on system condition
- Circuit breaker provides immediate blocking
- Token bucket provides smooth rate limiting

## Security Considerations

### Threat Assessment

- Multi-factor threat level calculation
- Pattern detection for common attacks
- Integration with existing security systems

### Protection Against Attacks

- DDoS mitigation through load shedding
- Brute force protection via circuit breakers
- Application-layer attack detection

### Fail-Safe Design

- Defaults to allowing requests on errors
- Configurable maximum delays
- Circuit breaker prevents cascading failures

## Operational Guidelines

### Deployment Considerations

- Start with conservative thresholds
- Monitor system impact closely
- Adjust rules based on traffic patterns

### Alerting Recommendations

- Alert on circuit breaker openings
- Monitor system condition changes
- Track throttling application rates

### Maintenance Tasks

- Regular review of throttling effectiveness
- Adjustment of thresholds based on growth
- Clean up of unnecessary rules

## Future Enhancements

### Planned Improvements

1. Machine learning-based threat detection
2. Geographic-based rule conditions
3. Integration with external threat intelligence
4. Advanced analytics and reporting
5. Rule versioning and rollback capabilities

### Integration Opportunities

1. APM (Application Performance Monitoring) integration
2. Logging system integration
3. Metrics collection (Prometheus/Grafana)
4. Alert management systems
5. Configuration management systems

## Troubleshooting

### Common Issues

1. **High False Positive Rate**
   - Adjust threat assessment sensitivity
   - Review condition matching logic
   - Consider user behavior patterns

2. **Performance Impact**
   - Reduce metrics collection frequency
   - Optimize rule matching conditions
   - Review system monitor implementation

3. **Circuit Breaker Not Recovering**
   - Check recovery timeout settings
   - Verify half-open request limits
   - Monitor success/failure recording

### Debugging Tools

1. **Statistics Endpoint** - Real-time system state
2. **Event Logging** - Detailed throttling decisions
3. **Rule Testing** - Isolated rule evaluation
4. **Metrics Dashboard** - System performance trends

## Conclusion

The Adaptive Throttling Rules implementation provides a comprehensive, intelligent throttling system that protects the application while maintaining good user experience. It integrates seamlessly with existing security infrastructure and provides extensive monitoring and control capabilities.

The system is designed to be:

- **Adaptive** - Responds to changing system conditions
- **Intelligent** - Makes decisions based on multiple factors
- **Observable** - Provides comprehensive monitoring
- **Maintainable** - Easy to configure and manage
- **Secure** - Protects against various attack patterns

# Authentication Endpoint Rate Limiting Thresholds

## Overview

This document defines the comprehensive rate limiting strategy and thresholds for authentication endpoints in the MFA system. The implementation provides multi-tier protection with adaptive limits based on threat detection and endpoint sensitivity.

## Rate Limiting Architecture

### Core Components

1. **Multi-Tier Rate Limiting**
   - Per-second limits for burst protection
   - Per-minute limits for sustained protection
   - Per-hour and per-day limits for long-term abuse prevention
   - Adaptive limits based on threat assessment

2. **Backoff Strategies**
   - Exponential backoff for authentication endpoints
   - Fibonacci backoff for MFA verification
   - Linear backoff for password reset requests
   - Configurable maximum delays

3. **Threat Detection**
   - Real-time threat level assessment
   - Geographic and behavioral analysis
   - Adaptive limit adjustments
   - Automated exemption management

## Endpoint-Specific Thresholds

### 1. Login Authentication (`/auth/login`)

**Risk Level**: HIGH
**Category**: Primary authentication endpoint

#### Rate Limits
```yaml
limits:
  per_second: 2 requests
  per_minute: 10 requests
  per_hour: 50 requests
  per_day: 200 requests
```

#### Backoff Strategy
```yaml
strategy: exponential
base_delay: 5 seconds
max_delay: 3600 seconds (1 hour)
multiplier: 2.0
```

#### Threat-Based Adaptive Limits
```yaml
threat_adjustments:
  low: 100% of base limits
  medium: 50% of base limits
  high: 25% of base limits
  critical: 10% of base limits
```

**Rationale**: Login is the primary attack vector. Limits are generous enough for legitimate users but restrictive enough to prevent brute force attacks.

### 2. MFA Verification (`/auth/mfa/verify`)

**Risk Level**: CRITICAL
**Category**: Secondary authentication factor

#### Rate Limits
```yaml
limits:
  per_second: 1 request
  per_minute: 5 requests
  per_hour: 20 requests
  per_day: 100 requests
```

#### Backoff Strategy
```yaml
strategy: fibonacci
base_delay: 10 seconds
max_delay: 1800 seconds (30 minutes)
multiplier: 1.0
```

#### Threat-Based Adaptive Limits
```yaml
threat_adjustments:
  low: 100% of base limits
  medium: 60% of base limits
  high: 30% of base limits
  critical: 10% of base limits
```

**Rationale**: MFA codes are limited (6 digits = 1M combinations). Stricter limits prevent code enumeration while allowing legitimate retry attempts.

### 3. Password Reset (`/auth/password/reset`)

**Risk Level**: HIGH
**Category**: Account recovery endpoint

#### Rate Limits
```yaml
limits:
  per_second: 1 request
  per_minute: 3 requests
  per_hour: 10 requests
  per_day: 25 requests
```

#### Backoff Strategy
```yaml
strategy: linear
base_delay: 60 seconds
max_delay: 3600 seconds (1 hour)
multiplier: 1.5
```

#### Threat-Based Adaptive Limits
```yaml
threat_adjustments:
  low: 100% of base limits
  medium: 70% of base limits
  high: 40% of base limits
  critical: 20% of base limits
```

**Rationale**: Password reset can be abused for account takeover and email bombing. Very restrictive limits prevent abuse while allowing legitimate recovery.

### 4. User Registration (`/auth/register`)

**Risk Level**: MEDIUM
**Category**: Account creation endpoint

#### Rate Limits
```yaml
limits:
  per_second: 1 request
  per_minute: 2 requests
  per_hour: 5 requests
  per_day: 10 requests
```

#### Backoff Strategy
```yaml
strategy: exponential
base_delay: 30 seconds
max_delay: 7200 seconds (2 hours)
multiplier: 3.0
```

#### Threat-Based Adaptive Limits
```yaml
threat_adjustments:
  low: 100% of base limits
  medium: 50% of base limits
  high: 20% of base limits
  critical: 5% of base limits
```

**Rationale**: Registration abuse can create spam accounts and consume resources. Strict limits prevent automated registration while allowing legitimate signups.

## Threat Detection Criteria

### Threat Level Assessment

#### Low Threat (Score: 0-29)
- Normal request patterns
- Successful authentication attempts
- Familiar geographic location
- Consistent user behavior

#### Medium Threat (Score: 30-59)
- Moderate failure rate (3-5 consecutive failures)
- Requests from multiple endpoints
- Slightly elevated request frequency
- New device or location

#### High Threat (Score: 60-79)
- High failure rate (6-10 consecutive failures)
- Rapid requests (>20 in 5 minutes)
- Multiple endpoint attacks
- Suspicious geographic patterns

#### Critical Threat (Score: 80-100)
- Very high failure rate (>10 consecutive failures)
- Extreme request volume (>30 in 5 minutes)
- Known attack patterns
- Confirmed malicious indicators

### Behavioral Indicators

1. **Rapid Requests**: >20 requests in 5 minutes
2. **Multiple Endpoints**: Attacks across >3 different endpoints
3. **Geographic Anomalies**: Requests from suspicious locations
4. **New Device**: Authentication from unrecognized device
5. **Unusual Timing**: Requests outside normal patterns

## Backoff Algorithm Implementations

### Exponential Backoff
```typescript
delay = baseDelay * Math.pow(multiplier, attemptNumber - 1)
```
- Used for: Login, Registration
- Provides rapid escalation for repeated failures
- Effective against automated attacks

### Fibonacci Backoff
```typescript
delay = baseDelay * fibonacci(attemptNumber)
```
- Used for: MFA Verification
- Provides moderate escalation
- Balances security with user experience

### Linear Backoff
```typescript
delay = baseDelay * attemptNumber * multiplier
```
- Used for: Password Reset
- Provides predictable escalation
- Suitable for email-based flows

## Security Considerations

### Protection Against Common Attacks

1. **Brute Force Attacks**
   - Per-second limits prevent rapid attempts
   - Exponential backoff increases delay with failures
   - Account lockout after critical threshold

2. **Credential Stuffing**
   - Per-minute limits restrict batch operations
   - Threat detection identifies suspicious patterns
   - Adaptive limits reduce attack effectiveness

3. **Account Enumeration**
   - Consistent responses regardless of account existence
   - Rate limits apply to all requests equally
   - No information leakage in error messages

4. **Distributed Attacks**
   - Per-IP rate limiting
   - Geographic analysis for VPN/proxy detection
   - Behavioral pattern recognition

### Advanced Protection Features

1. **Adaptive Limits**
   - Real-time threat assessment
   - Dynamic limit adjustments
   - Automatic threat response

2. **Exemption Management**
   - Whitelist for trusted sources
   - Administrative overrides
   - Emergency access procedures

3. **Monitoring and Alerting**
   - Real-time attack detection
   - Security team notifications
   - Automated incident response

## Implementation Guidelines

### Configuration Best Practices

1. **Start Conservative**: Begin with strict limits and gradually relax based on legitimate traffic patterns
2. **Monitor Metrics**: Track legitimate user impact and adjust accordingly
3. **Test Thoroughly**: Validate limits with realistic load testing
4. **Document Changes**: Maintain audit trail of limit modifications

### Integration Requirements

1. **Logging**: All rate limit events must be logged for analysis
2. **Metrics**: Export rate limiting metrics to monitoring systems
3. **Alerting**: Configure alerts for anomalous patterns
4. **Response**: Implement automated response to critical threats

### Performance Considerations

1. **Memory Usage**: Rate limiting data structures must be memory-efficient
2. **Cleanup**: Implement automatic cleanup of expired data
3. **Scalability**: Design for horizontal scaling across multiple instances
4. **Latency**: Rate limit checks must add minimal latency (<1ms)

## Monitoring and Metrics

### Key Performance Indicators

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Legitimate requests blocked | <0.1% | >0.5% |
| Attack requests blocked | >95% | <90% |
| Response time impact | <1ms | >5ms |
| Memory usage | <100MB | >500MB |
| False positive rate | <0.01% | >0.1% |

### Alert Conditions

1. **High Volume Attacks**: >1000 blocked requests/minute
2. **Distributed Attacks**: >50 unique IPs blocked/hour
3. **Critical Threats**: Any threat level critical detected
4. **System Impact**: Rate limiting affecting legitimate users
5. **Configuration Issues**: Exemptions or overrides applied

## Emergency Procedures

### Incident Response

1. **Attack Detection**
   - Automated threat level escalation
   - Security team notification
   - Temporary limit tightening

2. **System Overload**
   - Emergency rate limit activation
   - Traffic prioritization
   - Graceful degradation

3. **False Positive Mitigation**
   - Emergency exemption procedures
   - Rapid limit adjustment
   - User communication protocols

### Recovery Procedures

1. **Post-Incident Analysis**
   - Attack pattern analysis
   - Limit effectiveness review
   - Configuration optimization

2. **Limit Restoration**
   - Gradual limit relaxation
   - Monitoring for recurring issues
   - User impact assessment

## Compliance and Audit

### Regulatory Requirements

1. **Data Protection**: Rate limiting decisions must not leak sensitive information
2. **Availability**: System must maintain availability during attacks
3. **Auditability**: All rate limiting decisions must be auditable
4. **Transparency**: Users must be informed of temporary restrictions

### Documentation Requirements

1. **Decision Log**: Record of all rate limiting decisions
2. **Configuration History**: Audit trail of limit changes
3. **Incident Reports**: Detailed analysis of security events
4. **Performance Reports**: Regular assessment of system effectiveness

## Conclusion

This comprehensive rate limiting strategy provides robust protection against authentication attacks while maintaining optimal user experience. The multi-tier approach with adaptive limits ensures effectiveness against evolving threats while the sophisticated backoff strategies prevent legitimate user lockout.

Key benefits:
- **🛡️ Comprehensive Protection**: Defense against all major attack vectors
- **🎯 Adaptive Response**: Dynamic adjustment to threat landscape
- **⚖️ Balanced Approach**: Security without compromising usability
- **📊 Data-Driven**: Metrics-based optimization and tuning
- **🔄 Automated Response**: Minimal manual intervention required
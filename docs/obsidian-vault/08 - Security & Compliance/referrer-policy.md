# Referrer Policy Security Implementation

## Overview

The Referrer Policy implementation provides comprehensive control over referrer information sent with HTTP requests, enhancing privacy and security by preventing sensitive URL information from being leaked to third-party domains.

## Features

### Core Functionality

- **Dynamic Policy Configuration**: Create and manage multiple referrer policies with different scopes
- **Path-Specific Policies**: Apply different policies based on URL paths and patterns
- **Domain-Specific Policies**: Configure policies for specific domains and subdomains
- **Real-time Validation**: Validate incoming referrer headers against expected policies
- **Violation Detection**: Monitor and log policy violations with detailed analytics

### Security Features

- **Strict Mode**: Block requests with unsafe referrers
- **Downgrade Prevention**: Prevent HTTPS-to-HTTP referrer leakage
- **Origin Blocking**: Block requests from specific origins
- **Emergency Override**: Allow emergency access bypassing normal policies

### Monitoring and Analytics

- **Comprehensive Statistics**: Track policy effectiveness and violation patterns
- **Policy Recommendations**: AI-driven recommendations based on usage patterns
- **Real-time Reporting**: Monitor policy applications and violations
- **Audit Logging**: Complete audit trail of all policy changes and violations

## Configuration

### Environment Variables

```bash
# Enable/disable referrer policy middleware
REFERRER_POLICY_ENABLED=true

# Default policy for all requests
REFERRER_POLICY_DEFAULT=strict-origin-when-cross-origin

# Enable strict mode (blocks unsafe referrers)
REFERRER_POLICY_STRICT_MODE=true

# Enable violation reporting
REFERRER_POLICY_REPORTING=true

# Maximum violation history entries
REFERRER_POLICY_MAX_HISTORY=10000

# Cache timeout for policy configurations (seconds)
REFERRER_POLICY_CACHE_TIMEOUT=3600
```

### Default Policy Configuration

The system automatically creates a default configuration with secure settings:

```typescript
{
  name: 'Default Referrer Policy',
  policy: {
    default: 'strict-origin-when-cross-origin',
    pathSpecific: [
      {
        path: '/admin',
        policy: 'no-referrer',
        exactMatch: false
      },
      {
        path: '/api/auth',
        policy: 'no-referrer',
        exactMatch: false
      },
      {
        path: '/api/payment',
        policy: 'no-referrer',
        exactMatch: false
      }
    ]
  },
  security: {
    strictMode: true,
    preventDowngrade: true,
    logViolations: true,
    blockUnsafeReferrers: true
  }
}
```

## API Endpoints

### Policy Management

#### Create Policy Configuration

```http
POST /api/referrer-policy/configs
Content-Type: application/json

{
  "name": "Custom Policy",
  "description": "Policy for specific use case",
  "enabled": true,
  "priority": 10,
  "policy": {
    "default": "strict-origin",
    "pathSpecific": [
      {
        "path": "/secure",
        "policy": "no-referrer",
        "exactMatch": false
      }
    ]
  },
  "scope": {
    "global": true,
    "sensitiveRoutes": ["/secure"]
  },
  "security": {
    "strictMode": true,
    "blockUnsafeReferrers": true
  }
}
```

#### Update Policy Configuration

```http
PUT /api/referrer-policy/configs/{id}
Content-Type: application/json

{
  "description": "Updated policy description",
  "priority": 15
}
```

#### Get Statistics

```http
GET /api/referrer-policy/statistics?start=2023-01-01&end=2023-12-31&severities=high,critical
```

#### Get Recommendations

```http
GET /api/referrer-policy/recommendations?start=2023-01-01&end=2023-12-31
```

### Response Examples

#### Statistics Response

```json
{
  "timeRange": {
    "start": "2023-01-01T00:00:00.000Z",
    "end": "2023-12-31T23:59:59.999Z"
  },
  "overview": {
    "totalRequests": 50000,
    "policyApplied": 49800,
    "violationsDetected": 45,
    "blockedRequests": 12,
    "averageResponseTime": 15
  },
  "policies": {
    "byValue": {
      "strict-origin-when-cross-origin": 35000,
      "no-referrer": 15000
    },
    "effectiveness": {
      "strict-origin-when-cross-origin": {
        "applied": 35000,
        "violations": 25
      }
    }
  },
  "compliance": {
    "policyCompliance": 99.1,
    "securityScore": 95,
    "privacyScore": 98
  }
}
```

#### Recommendations Response

```json
{
  "recommendations": [
    {
      "path": "/admin",
      "currentPolicy": "origin",
      "recommendedPolicy": "no-referrer",
      "reason": "Sensitive route should not send referrer information",
      "confidence": 95,
      "impact": "high"
    }
  ]
}
```

## Policy Values

### Available Referrer Policies

| Policy                            | Description                                             | Use Case                       |
| --------------------------------- | ------------------------------------------------------- | ------------------------------ |
| `no-referrer`                     | Never send referrer                                     | Highly sensitive pages         |
| `no-referrer-when-downgrade`      | Send referrer except HTTPS→HTTP                         | Default browser behavior       |
| `origin`                          | Send only origin                                        | Balance security/functionality |
| `origin-when-cross-origin`        | Full URL same-origin, origin cross-origin               | Common choice                  |
| `same-origin`                     | Send referrer only to same origin                       | Strict same-origin policy      |
| `strict-origin`                   | Origin only, no HTTPS→HTTP                              | Secure origin-only             |
| `strict-origin-when-cross-origin` | Full URL same-origin, origin cross-origin, no downgrade | Recommended secure default     |
| `unsafe-url`                      | Always send full URL                                    | Generally not recommended      |

### Security Recommendations by Route Type

#### Admin Routes (`/admin/*`)

- **Recommended**: `no-referrer`
- **Reason**: Prevent leakage of admin URLs to external sites

#### Authentication Routes (`/api/auth/*`)

- **Recommended**: `no-referrer`
- **Reason**: Protect authentication flows and sensitive parameters

#### Payment Routes (`/api/payment/*`)

- **Recommended**: `no-referrer`
- **Reason**: Prevent financial information leakage

#### Public Content (`/public/*`, `/content/*`)

- **Recommended**: `strict-origin-when-cross-origin`
- **Reason**: Balance functionality with privacy

#### API Endpoints (`/api/*`)

- **Recommended**: `origin` or `strict-origin`
- **Reason**: Limit information while maintaining functionality

## Implementation Details

### Middleware Flow

1. **Request Interception**: Middleware intercepts all HTTP requests
2. **Policy Resolution**: Determines applicable policy based on URL, method, and scope
3. **Referrer Validation**: Validates incoming referrer header against expected policy
4. **Header Application**: Applies appropriate `Referrer-Policy` header
5. **Violation Handling**: Logs violations and optionally blocks requests
6. **Statistics Update**: Updates metrics and analytics data

### Policy Resolution Priority

1. **Path-Specific Policies**: Exact matches first, then pattern matches
2. **Domain-Specific Policies**: Domain and subdomain matches
3. **Scope-Based Policies**: User role, environment, route type
4. **Default Policy**: Fallback when no specific policy applies

### Caching Strategy

- **Policy Cache**: 1-hour TTL for policy configurations
- **Violation Cache**: In-memory storage with configurable history limit
- **Statistics Cache**: Real-time updates with periodic Redis sync

## Security Considerations

### Attack Vectors Prevented

#### Referrer Leakage

- **Problem**: Sensitive URLs leaked to third-party sites
- **Solution**: Path-specific `no-referrer` policies for sensitive routes

#### Cross-Site Information Disclosure

- **Problem**: Internal URLs exposed through referrer headers
- **Solution**: `strict-origin` policies for cross-origin requests

#### HTTPS Downgrade Attacks

- **Problem**: HTTPS URLs leaked to HTTP sites
- **Solution**: `strict-*` policies prevent HTTPS→HTTP referrer sending

### Compliance Benefits

#### GDPR Compliance

- Prevents accidental sharing of personal data in URLs
- Reduces third-party data exposure
- Enhances user privacy controls

#### Security Standards

- Follows OWASP security guidelines
- Implements defense-in-depth strategy
- Provides comprehensive audit trails

## Monitoring and Alerting

### Key Metrics to Monitor

#### Security Metrics

- **Violation Rate**: Percentage of requests with policy violations
- **Block Rate**: Percentage of requests blocked due to unsafe referrers
- **Critical Violations**: High-severity policy violations requiring attention

#### Performance Metrics

- **Policy Application Time**: Latency introduced by policy processing
- **Cache Hit Rate**: Effectiveness of policy caching
- **Memory Usage**: Memory consumption of violation history

#### Compliance Metrics

- **Policy Coverage**: Percentage of requests covered by explicit policies
- **Configuration Compliance**: Adherence to security best practices
- **Audit Completeness**: Coverage of audit logging

### Alerting Thresholds

```javascript
// Example alerting configuration
const alertingConfig = {
  criticalViolations: {
    threshold: 10, // per hour
    severity: 'critical'
  },
  blockRate: {
    threshold: 5, // percent
    severity: 'warning'
  },
  policyCompliance: {
    threshold: 95, // percent
    severity: 'warning'
  }
};
```

## Best Practices

### Policy Configuration

1. **Start Restrictive**: Begin with strict policies and relax as needed
2. **Test Thoroughly**: Use `reportOnlyMode` to test policies before enforcement
3. **Monitor Continuously**: Set up alerts for policy violations
4. **Regular Reviews**: Review and update policies based on recommendations

### Route-Specific Guidelines

```typescript
// Recommended policy patterns
const policyPatterns = {
  // Administrative interfaces
  admin: 'no-referrer',

  // Authentication flows
  auth: 'no-referrer',

  // Financial transactions
  payment: 'no-referrer',

  // User-generated content
  profile: 'strict-origin-when-cross-origin',

  // Public APIs
  api: 'origin',

  // Static content
  assets: 'no-referrer-when-downgrade'
};
```

### Performance Optimization

1. **Cache Policies**: Use Redis caching for frequently accessed policies
2. **Batch Updates**: Group policy changes to minimize cache invalidation
3. **Async Logging**: Use asynchronous logging for violations to avoid blocking
4. **Trim History**: Regularly clean up old violation history

## Troubleshooting

### Common Issues

#### Policy Not Applied

- **Check**: Policy scope and priority settings
- **Verify**: Request matches policy conditions
- **Debug**: Enable verbose logging to trace policy resolution

#### Blocked Legitimate Requests

- **Review**: Strict mode configuration
- **Check**: Allowed origins list
- **Consider**: Adding temporary exemptions

#### High Violation Rate

- **Analyze**: Violation patterns in statistics
- **Review**: Policy recommendations
- **Adjust**: Policies based on actual usage patterns

### Debug Information

```javascript
// Enable debug logging
process.env.REFERRER_POLICY_DEBUG = 'true';

// Check policy resolution for specific request
GET /api/referrer-policy/debug?url=/admin/users&method=GET
```

## Migration Guide

### From Manual Headers

If currently setting referrer policy headers manually:

1. **Audit Current Implementation**: Document existing header configurations
2. **Create Equivalent Policies**: Use API to create matching policy configurations
3. **Test in Report Mode**: Enable `reportOnlyMode` to verify behavior
4. **Gradual Migration**: Migrate routes incrementally
5. **Remove Manual Headers**: Clean up manual header setting code

### Version Compatibility

- **Breaking Changes**: Policy ID format changed in v2.0
- **Migration Script**: Use provided migration utility for database updates
- **Rollback Plan**: Keep previous configuration as backup

## Future Enhancements

### Planned Features

- **Machine Learning**: AI-powered policy optimization
- **Integration**: Enhanced integration with WAF systems
- **Reporting**: Advanced analytics dashboard
- **Automation**: Automated policy updates based on security intelligence

### API Evolution

- **GraphQL Support**: GraphQL endpoint for complex queries
- **Webhooks**: Real-time violation notifications
- **Bulk Operations**: Batch policy management endpoints

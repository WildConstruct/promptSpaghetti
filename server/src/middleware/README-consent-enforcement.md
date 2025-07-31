# Consent Enforcement System

A comprehensive real-time consent enforcement middleware system that automatically validates user consent preferences before allowing data processing operations, ensuring GDPR, CCPA, and other privacy regulation compliance.

## Overview

The consent enforcement system provides:

- **Real-time consent validation** before API operations
- **Configurable enforcement rules** with different severity levels
- **Cross-service consent propagation** for distributed architectures
- **Cookie and tracking enforcement** with automatic removal of unauthorized cookies
- **Database-level consent validation** with audit trails
- **Comprehensive violation tracking** and reporting
- **Integration with existing consent management** infrastructure

## Architecture

### Core Components

1. **ConsentEnforcementMiddleware**: Main middleware class that validates consent requirements
2. **ConsentEnforcementPlugin**: Fastify plugin for easy server integration
3. **Enforcement Rules Engine**: Configurable rules for different API endpoints and data operations
4. **Cross-Service Propagation**: Notifies other services of consent changes
5. **Cookie & Tracking Enforcement**: Manages browser cookies and tracking scripts based on consent

### Integration with Existing System

This system builds upon the existing consent management infrastructure:

- Uses existing `ConsentBasedDataFilterService` for data filtering
- Integrates with `ConsentCollectionService` for consent status checks
- Works with the existing React-based just-in-time consent system
- Maintains compatibility with the existing consent banner and preferences modal

## Quick Start

### 1. Register the Plugin

```typescript
import consentEnforcementPlugin from './plugins/consent-enforcement-plugin';

// Register with Fastify
await fastify.register(consentEnforcementPlugin, {
  enableStrict: true,
  enableCookieEnforcement: true,
  enableCrossServicePropagation: true,
  exemptPaths: ['/api/public/*'],
});
```

### 2. Use Consent-Aware Endpoints

The middleware automatically enforces consent for configured endpoints:

```typescript
// This endpoint will require ANALYTICS consent
fastify.post('/api/analytics/track', async (request, reply) => {
  // Consent is automatically validated before reaching this handler
  const trackingData = request.body;
  await processAnalytics(trackingData);
  return { success: true };
});
```

### 3. Check Consent Programmatically

```typescript
// Use the decorated utility methods
const hasConsent = await fastify.consentEnforcement.checkConsent('user-123', 'ANALYTICS');

if (hasConsent) {
  // Process analytics data
  await trackUserBehavior(userData);
}
```

## Configuration

### Enforcement Rules

Rules define which consent types are required for specific API endpoints:

```typescript
const rule: ConsentEnforcementRule = {
  id: 'marketing_api_strict',
  name: 'Marketing API Strict Enforcement',
  description: 'Requires marketing consent for all marketing operations',
  paths: ['/api/marketing/*', '/api/campaigns/*'],
  methods: ['POST', 'PUT'],
  requiredConsents: ['MARKETING'],
  dataCategories: ['contact_data', 'preference_data'],
  enforcementLevel: 'strict', // 'strict' | 'permissive' | 'audit_only'
  exemptions: ['admin'], // User roles exempt from this rule
  enabled: true,
};

middleware.addEnforcementRule(rule);
```

### Enforcement Levels

- **strict**: Blocks requests if consent is not granted (403 response)
- **permissive**: Allows requests but adds warning headers
- **audit_only**: Logs violations but does not block requests

### Default Rules

The system comes with pre-configured rules for common scenarios:

1. **Analytics Enforcement**: Requires ANALYTICS consent for `/api/analytics/*`, `/api/events/*`, `/api/metrics/*`
2. **Marketing Enforcement**: Requires MARKETING consent for marketing and campaign endpoints
3. **Personalization Enforcement**: Requires PERSONALIZATION consent for recommendation endpoints
4. **Social Media Enforcement**: Requires SOCIAL_MEDIA consent for sharing endpoints
5. **Data Export Enforcement**: Requires multiple consent types for data export operations

## API Endpoints

### Administrative Endpoints

```http
# Get enforcement statistics
GET /api/admin/consent/enforcement/stats

# Add enforcement rule
POST /api/admin/consent/enforcement/rules
Content-Type: application/json
{
  "id": "custom_rule",
  "name": "Custom Rule",
  "paths": ["/api/custom/*"],
  "methods": ["POST"],
  "requiredConsents": ["ANALYTICS"],
  "enforcementLevel": "strict"
}

# Remove enforcement rule
DELETE /api/admin/consent/enforcement/rules/:ruleId
```

### Consent Propagation

```http
# Propagate consent change to other services
POST /api/consent/propagate
Content-Type: application/json
{
  "userId": "user-123",
  "consentType": "ANALYTICS",
  "granted": true
}
```

## Cross-Service Integration

### Service Notification

When consent changes, the system automatically notifies relevant services:

```typescript
// Services are notified based on consent type
const serviceNotifications = {
  ANALYTICS: ['analytics-service', 'metrics-service'],
  MARKETING: ['email-service', 'campaign-service'],
  SOCIAL_MEDIA: ['social-service', 'sharing-service'],
  PERSONALIZATION: ['recommendation-service'],
};
```

### Custom Service Integration

```typescript
// Add custom service notification logic
middleware.addServiceNotificationHandler('CUSTOM_CONSENT', async (userId, granted) => {
  await customService.updateUserConsent(userId, granted);
});
```

## Cookie and Tracking Enforcement

### Automatic Cookie Management

The system automatically manages browser cookies based on consent:

```typescript
// Tracking cookies that require consent
const trackingCookies = {
  '_ga*': 'ANALYTICS', // Google Analytics
  _fbp: 'MARKETING', // Facebook Pixel
  'utm_*': 'MARKETING', // UTM tracking
  'pixel_*': 'MARKETING', // Custom marketing pixels
};
```

### Cookie Enforcement Features

- **Automatic Removal**: Unauthorized tracking cookies are automatically cleared
- **Security Headers**: Sets appropriate SameSite, Secure, and HttpOnly attributes
- **Script Blocking**: Blocks tracking scripts when consent is not granted
- **Content Security Policy**: Dynamically adjusts CSP based on consent status

## Database Integration

### Database-Level Validation

For critical operations, the system performs database-level consent validation:

```sql
-- Example database schema for consent validation
CREATE TABLE user_consents (
  user_id VARCHAR(255),
  consent_type VARCHAR(50),
  granted BOOLEAN,
  granted_at TIMESTAMP,
  expires_at TIMESTAMP,
  withdrawn BOOLEAN DEFAULT FALSE,
  version VARCHAR(10)
);
```

### Audit Trail

All consent enforcement actions are logged for compliance purposes:

```typescript
interface ConsentViolation {
  id: string;
  timestamp: Date;
  userId: string;
  path: string;
  method: string;
  missingConsents: string[];
  action: 'blocked' | 'allowed_with_warning' | 'audit_logged';
  reason: string;
}
```

## Monitoring and Analytics

### Enforcement Statistics

```typescript
const stats = middleware.getEnforcementStats();
// Returns:
{
  totalRules: 5,
  enabledRules: 4,
  recentViolations: 12,
  violationsByAction: {
    blocked: 8,
    allowed_with_warning: 3,
    audit_logged: 1
  },
  topViolatingUsers: [
    { userId: 'user-123', count: 5 }
  ]
}
```

### Real-Time Monitoring

The system integrates with existing logging and monitoring infrastructure:

- Violations are logged with appropriate risk levels
- Performance metrics are tracked for rule evaluation
- Integration with security event logging system
- Supports custom alerting based on violation patterns

## Error Handling

### Graceful Degradation

The system follows a "fail-open" approach for non-critical errors:

- Service unavailability does not block legitimate requests
- Malformed rules are skipped rather than causing system failures
- Database connectivity issues fall back to in-memory consent checks
- Network failures in cross-service propagation are logged but don't block operations

### Error Recovery

```typescript
// Automatic retry logic for consent service calls
const retryPolicy = {
  maxRetries: 3,
  backoffMs: 1000,
  exponentialBackoff: true,
};
```

## Security Considerations

### Data Protection

- Consent validation occurs before any data processing
- Violation logs do not store sensitive user data
- Database queries use parameterized statements to prevent injection
- Service-to-service communication uses authenticated channels

### Performance Impact

- Rule evaluation is optimized with caching and indexing
- Typical overhead: <5ms per request for rule evaluation
- Database validation is performed asynchronously where possible
- In-memory rule storage for fast lookup

## Testing

### Comprehensive Test Suite

The system includes extensive tests:

- Unit tests for all middleware functions
- Integration tests with Fastify server
- Performance tests for high-throughput scenarios
- Compliance validation tests for major regulations

### Test Coverage

- 95%+ line coverage for middleware core
- End-to-end testing of consent flows
- Load testing for concurrent request handling
- Security testing for bypass attempts

## Compliance

### Regulatory Support

The system supports compliance with:

- **GDPR** (General Data Protection Regulation)
- **CCPA** (California Consumer Privacy Act)
- **PIPEDA** (Personal Information Protection and Electronic Documents Act)
- **LGPD** (Lei Geral de Proteção de Dados)
- **PDPA** (Personal Data Protection Act)

### Audit Support

- Complete audit trail of all consent enforcement decisions
- Evidence collection for compliance demonstrations
- Integration with existing compliance reporting systems
- Support for data subject rights (access, portability, deletion)

## Advanced Usage

### Custom Validation Logic

```typescript
// Add custom consent validation rules
middleware.addCustomValidator('SENSITIVE_DATA', async (context, rule) => {
  // Custom validation logic
  return {
    allowed: await customValidation(context),
    reason: 'Custom validation result',
  };
});
```

### Consent Context Enhancement

```typescript
// Enhance consent context with additional data
middleware.addContextEnhancer(async baseContext => ({
  ...baseContext,
  deviceFingerprint: await getDeviceFingerprint(baseContext.userAgent),
  riskScore: await calculateRiskScore(baseContext),
}));
```

## Migration Guide

### From Manual Consent Checking

If your application currently performs manual consent checks:

1. **Identify Existing Consent Points**: Find all places where consent is manually checked
2. **Configure Enforcement Rules**: Create rules matching your existing consent requirements
3. **Gradual Migration**: Start with 'audit_only' mode to monitor without blocking
4. **Enable Enforcement**: Switch to 'strict' mode for critical endpoints
5. **Remove Manual Checks**: Clean up redundant manual consent validation code

### Integration Checklist

- [ ] Install consent enforcement plugin
- [ ] Configure enforcement rules for your API endpoints
- [ ] Test with 'audit_only' mode first
- [ ] Update client applications to handle consent errors
- [ ] Set up monitoring and alerting
- [ ] Update documentation and training materials

## Troubleshooting

### Common Issues

1. **Rules Not Matching**: Check path patterns and HTTP methods in rule configuration
2. **Performance Issues**: Review rule complexity and consider caching optimizations
3. **False Positives**: Adjust enforcement levels or add appropriate exemptions
4. **Integration Failures**: Verify service dependencies and network connectivity

### Debug Mode

```typescript
// Enable verbose logging for troubleshooting
const middleware = new ConsentEnforcementMiddleware(services, {
  debugMode: true,
  logLevel: 'verbose',
});
```

### Support

For issues or questions:

- Check the comprehensive test suite for usage examples
- Review existing consent management documentation
- Consult security and compliance team for regulatory requirements

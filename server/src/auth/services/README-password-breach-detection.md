# Password Breach Detection System

A privacy-preserving password breach detection system that uses k-anonymity hash-prefix queries to check passwords against known breach databases without exposing the actual password to external services.

## Overview

This system provides:

- **Privacy-Preserving Breach Detection**: Uses k-anonymity with SHA-1 hash prefixes (k=5)
- **HaveIBeenPwned Integration**: Queries the industry-standard Pwned Passwords API
- **Rate Limiting and Caching**: Prevents API abuse and improves performance
- **Comprehensive Audit Logging**: Tracks all breach checks for security monitoring
- **Automatic Integration**: Seamlessly integrated with existing password validation
- **User Notifications**: Automatic breach notification system with security guidance

## Architecture

### Core Components

1. **PasswordBreachService**: Main service for k-anonymity breach checking
2. **BreachNotificationService**: Manages user notifications for detected breaches
3. **UserService Integration**: Automatic breach checking during password validation
4. **Audit Trail**: Complete logging of all breach detection activities

### K-Anonymity Privacy Protection

The system implements k-anonymity (k=5) to protect user privacy:

```
Password: "mypassword123"
↓
SHA-1 Hash: "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0"
↓
Prefix (k=5): "A1B2C" (sent to API)
Suffix: "3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0" (kept private)
```

Only the 5-character prefix is sent to the external API, protecting the actual password from exposure.

## Quick Start

### 1. Service Integration

```typescript
import { PasswordBreachService } from './auth/services/PasswordBreachService';
import { AuditService } from './auth/services/AuditService';
import { RateLimitService } from './auth/services/RateLimitService';

// Initialize services
const auditService = new AuditService(config, db);
const rateLimitService = new RateLimitService(redis);
const breachService = new PasswordBreachService(auditService, rateLimitService);

// Check password breach status
const result = await breachService.checkPasswordBreach('userpassword', 'user-123');
if (result.isBreached) {
  console.log(`Password found in breach databases ${result.occurrenceCount} times`);
}
```

### 2. Automatic Integration

The system automatically integrates with existing authentication flows:

```typescript
// UserService automatically checks for breaches during validation
const userService = new UserService(config, db, audit, breachService);

// Breach detection happens automatically during:
await userService.createUser(registrationData);     // Registration
await userService.resetPassword(token, newPassword); // Password reset
await userService.changePassword(userId, oldPass, newPass); // Password change
```

### 3. Manual Breach Checking

```typescript
// Check password without user context
const result = await breachService.checkPasswordBreach('password123');

// Check with user context for audit logging
const result = await breachService.checkPasswordBreach('password123', 'user-456');

// Check with custom options
const result = await breachService.checkPasswordBreach('password123', 'user-456', {
  skipCache: false,
  timeout: 3000,
  retryAttempts: 2
});
```

## API Reference

### PasswordBreachService

#### `checkPasswordBreach(password, userId?, options?)`

Check if a password has been found in known data breaches.

**Parameters:**
- `password: string` - The password to check
- `userId?: string` - User ID for audit logging and rate limiting
- `options?: BreachCheckOptions` - Check options

**Returns:** `Promise<BreachCheckResult>`

```typescript
interface BreachCheckResult {
  isBreached: boolean;        // True if password found in breach databases
  occurrenceCount: number;    // Number of times password was seen
  source: string;            // Data source (e.g., "HaveIBeenPwned")
  checkedAt: Date;           // When the check was performed
  hashPrefix: string;        // SHA-1 hash prefix used (for debugging)
  cacheHit: boolean;         // Whether result came from cache
  responseTime: number;      // API response time in milliseconds
}
```

#### Utility Methods

```typescript
// Test API connectivity
const connectivityResult = await breachService.testAPIConnectivity();

// Get service statistics
const stats = breachService.getServiceStats();

// Clear cache (for maintenance)
breachService.clearCache();

// Validate hash prefix format
const isValid = breachService.isValidHashPrefix('A1B2C');
```

### BreachNotificationService

#### `createBreachNotification(userId, source, occurrenceCount)`

Create and send a breach notification to a user.

```typescript
const notification = await notificationService.createBreachNotification(
  'user-123',
  'HaveIBeenPwned',
  50000  // Password seen 50,000 times
);
```

#### Notification Management

```typescript
// Get notification statistics
const stats = notificationService.getNotificationStats();

// Mark notification as acknowledged
await notificationService.acknowledgeNotification(notificationId, userId);
```

## Configuration

### Environment Variables

```bash
# API Configuration
BREACH_CHECK_API_URL=https://api.pwnedpasswords.com
BREACH_CHECK_TIMEOUT=5000
BREACH_CHECK_MAX_RETRIES=3

# Caching
BREACH_CHECK_CACHE_TTL=86400000  # 24 hours in milliseconds

# Rate Limiting
BREACH_CHECK_RATE_LIMIT_WINDOW=60  # 1 minute
BREACH_CHECK_RATE_LIMIT_MAX=10     # 10 requests per minute

# Privacy Settings
BREACH_CHECK_K_ANONYMITY=5         # K-anonymity level
BREACH_CHECK_ENABLE_PADDING=true   # Enhanced privacy padding
```

### Service Configuration

```typescript
const breachServiceConfig = {
  apiUrl: 'https://api.pwnedpasswords.com',
  timeout: 5000,
  retryAttempts: 3,
  cacheSettings: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 10000             // Max cached entries
  },
  rateLimiting: {
    window: 60,  // 1 minute
    max: 10      // 10 requests per minute per user
  },
  privacy: {
    anonymityLevel: 5,         // K-anonymity k=5
    enablePadding: true,       // API padding for enhanced privacy
    logHashPrefixes: true      // Whether to log hash prefixes for debugging
  }
};
```

## Security Features

### Privacy Protection

1. **K-Anonymity**: Only 5-character hash prefixes are sent to external APIs
2. **No Password Logging**: Actual passwords are never logged or stored
3. **Secure Hash Generation**: Uses SHA-1 as required by HaveIBeenPwned API
4. **Request Anonymization**: Includes padding headers for enhanced privacy

### Rate Limiting

```typescript
// Default rate limits
const rateLimits = {
  passwordBreachCheck: {
    window: 60,  // 1 minute window
    max: 10      // 10 checks per user per minute
  }
};
```

### Audit Logging

All breach detection activities are logged:

```typescript
// Successful breach check
{
  eventType: 'PASSWORD_BREACH_CHECK',
  userId: 'user-123',
  details: {
    isBreached: false,
    responseTime: 245,
    cacheHit: false,
    hashPrefix: 'A1B2C'
  },
  riskLevel: 'LOW'
}

// Breach detected
{
  eventType: 'PASSWORD_BREACH_CHECK',
  userId: 'user-123',
  details: {
    isBreached: true,
    occurrenceCount: 50000,
    responseTime: 189
  },
  riskLevel: 'HIGH'
}
```

### Error Handling

The system implements comprehensive error handling:

- **Network Failures**: Graceful degradation with retry logic
- **API Rate Limiting**: Automatic retry with exponential backoff
- **Service Unavailability**: Fail-open behavior to avoid blocking users
- **Malformed Responses**: Proper error handling and logging

## Performance Optimization

### Caching Strategy

- **24-hour cache TTL** for breach check results
- **Memory-based caching** with automatic cleanup
- **Cache hit metrics** for monitoring effectiveness
- **Optional cache bypass** for real-time checks

### Response Time Optimization

- **Parallel processing** for multiple password checks
- **Connection pooling** for API requests
- **Timeout management** with configurable limits
- **Exponential backoff** for retries

### Monitoring Metrics

```typescript
const metrics = service.getServiceStats();
console.log({
  cacheSize: metrics.cacheSize,           // Current cache entries
  cacheHitRate: metrics.cacheHitRate,     // Cache effectiveness
  totalChecks: metrics.totalChecks,       // Lifetime breach checks
  averageResponseTime: metrics.averageResponseTime
});
```

## Integration Examples

### Registration Flow

```typescript
async function registerUser(userData: RegisterRequest): Promise<User> {
  try {
    // Password validation automatically includes breach checking
    await validatePassword(userData.password);
    
    const user = await createUser(userData);
    return user;
    
  } catch (error) {
    if (error.message.includes('data breach')) {
      // Handle breach detection
      await logSecurityEvent('registration_blocked_breach', {
        email: userData.email,
        error: error.message
      });
    }
    throw error;
  }
}
```

### Password Reset Flow

```typescript
async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  // Validate token
  const user = await validateResetToken(token);
  
  // Check new password for breaches
  const breachResult = await breachService.checkPasswordBreach(newPassword, user.id);
  
  if (breachResult.isBreached) {
    // Send breach notification
    await notificationService.createBreachNotification(
      user.id,
      'HaveIBeenPwned',
      breachResult.occurrenceCount
    );
    
    throw new Error('Password has been found in data breaches. Please choose a different password.');
  }
  
  // Proceed with password reset
  await updateUserPassword(user.id, newPassword);
}
```

### Batch Password Auditing

```typescript
async function auditUserPasswords(userIds: string[]): Promise<AuditReport> {
  const results = [];
  
  for (const userId of userIds) {
    try {
      // Get user's current password hash for comparison
      const user = await getUserById(userId);
      
      // Note: In real implementation, you'd need stored password or
      // prompt user to check their password
      
      const breachResult = await breachService.checkPasswordBreach(
        userProvidedPassword, // Would need secure way to get this
        userId,
        { skipCache: true } // Always check latest breach data
      );
      
      if (breachResult.isBreached) {
        // Create notification
        await notificationService.createBreachNotification(
          userId,
          'HaveIBeenPwned',
          breachResult.occurrenceCount
        );
        
        results.push({
          userId,
          status: 'BREACHED',
          occurrences: breachResult.occurrenceCount
        });
      } else {
        results.push({
          userId,
          status: 'CLEAN'
        });
      }
      
    } catch (error) {
      results.push({
        userId,
        status: 'ERROR',
        error: error.message
      });
    }
  }
  
  return { results };
}
```

## Notification System

### Email Notifications

The system automatically sends email notifications for password breaches:

```html
<!-- High-severity breach notification -->
<div style="background-color: #dc3545; color: white; padding: 20px;">
  <h1>🚨 Urgent: Your password was found in a major data breach</h1>
</div>

<div style="padding: 20px;">
  <p>We've detected that a password associated with your account has been found 
     in a known data breach. This password has appeared <strong>123,456</strong> 
     times in breach databases.</p>
  
  <div style="background-color: #fff3cd; padding: 15px;">
    <h3>Immediate Action Required</h3>
    <ul>
      <li>Change your password immediately</li>
      <li>Use a unique, strong password</li>
      <li>Enable two-factor authentication</li>
    </ul>
  </div>
</div>
```

### In-App Notifications

```typescript
// In-app notification for breach detection
const notification = {
  type: 'security_alert',
  severity: 'high',
  title: 'Password Security Alert',
  message: 'A password associated with your account was found in a data breach.',
  actions: [
    { label: 'Change Password', action: 'redirect:/settings/password' },
    { label: 'Learn More', action: 'modal:security-tips' }
  ]
};
```

## Testing

### Unit Tests

The system includes comprehensive unit tests covering:

- Hash generation and k-anonymity implementation
- API integration with various response scenarios
- Caching behavior and cache invalidation
- Rate limiting enforcement
- Error handling and edge cases
- Privacy protection verification

### Integration Tests

```typescript
describe('Password Breach Integration', () => {
  it('should integrate with UserService validation', async () => {
    const breachService = new PasswordBreachService(audit, rateLimit);
    const userService = new UserService(config, db, audit, breachService);
    
    // Mock breached password
    mockAPI('password', { breached: true, count: 100000 });
    
    await expect(userService.createUser({
      email: 'test@example.com',
      password: 'password'
    })).rejects.toThrow('data breach');
  });
});
```

### Load Testing

Performance testing ensures the system can handle high-volume scenarios:

```javascript
// Load test configuration
const loadTest = {
  concurrent_users: 100,
  requests_per_user: 10,
  duration: '5m',
  scenarios: {
    breach_check: {
      weight: 70,
      action: 'check_password_breach'
    },
    cache_hit: {
      weight: 30,
      action: 'check_cached_password'
    }
  }
};
```

## Monitoring and Alerting

### Key Metrics

- **Breach Detection Rate**: Percentage of passwords found in breaches
- **API Response Time**: Average time for breach checks
- **Cache Hit Rate**: Effectiveness of caching strategy
- **Rate Limit Violations**: Users hitting rate limits
- **Error Rate**: Failed breach check attempts

### Alerting Rules

```yaml
# High breach detection rate alert
breach_detection_rate_high:
  condition: breach_rate > 15%
  window: 1h
  severity: warning
  description: "Unusually high password breach detection rate"

# API performance alert
api_response_time_high:
  condition: avg(response_time) > 5000ms
  window: 5m
  severity: critical
  description: "HaveIBeenPwned API response time degraded"
```

### Dashboard Metrics

```typescript
const metrics = {
  totalChecks: 15234,
  breachedPasswords: 1087,
  cacheHitRate: 0.73,
  averageResponseTime: 245,
  topBreachedPasswords: [
    { password_hash_prefix: 'A1B2C', count: 50 },
    { password_hash_prefix: 'D3E4F', count: 32 }
  ]
};
```

## Compliance and Regulatory

### GDPR Compliance

- **Data Minimization**: Only necessary hash prefixes are transmitted
- **Privacy by Design**: K-anonymity built into the architecture
- **Audit Trails**: Complete logging for compliance demonstration
- **User Rights**: Users can request breach check history

### Security Standards

- **OWASP Guidelines**: Follows OWASP password security recommendations
- **NIST Compliance**: Aligns with NIST password guidelines
- **Industry Standards**: Uses industry-standard HaveIBeenPwned API

### Documentation and Evidence

The system maintains comprehensive documentation for compliance:

- Architecture diagrams showing privacy protection
- Data flow documentation for security reviews
- Audit trail samples for compliance teams
- Performance metrics for operational transparency

## Troubleshooting

### Common Issues

1. **High API Response Times**
   - Check HaveIBeenPwned API status
   - Verify network connectivity
   - Consider increasing timeout values

2. **Cache Performance Issues**
   - Monitor cache hit rates
   - Adjust TTL values if needed
   - Consider cache size limits

3. **Rate Limiting Problems**
   - Review rate limit configuration
   - Check for unusual usage patterns
   - Consider user-specific limits

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
const breachService = new PasswordBreachService(audit, rateLimit, {
  debugMode: true,
  logLevel: 'verbose'
});
```

### Health Checks

```typescript
// API connectivity check
const healthCheck = await breachService.testAPIConnectivity();
console.log('API Health:', healthCheck);

// Service statistics
const stats = breachService.getServiceStats();
console.log('Service Stats:', stats);
```

## Future Enhancements

### Planned Features

1. **Multi-Source Breach Detection**: Integration with additional breach databases
2. **Real-time Breach Monitoring**: Continuous monitoring for new breaches
3. **Password Strength Scoring**: Integration with breach frequency for scoring
4. **Enterprise Features**: Bulk checking and advanced reporting
5. **ML-Based Detection**: Machine learning for pattern-based detection

### Performance Improvements

1. **Distributed Caching**: Redis-based caching for multi-instance deployments
2. **Async Processing**: Background breach checking for better UX
3. **Connection Pooling**: HTTP/2 connection pooling for better performance
4. **Regional APIs**: Use of regional HaveIBeenPwned endpoints

This system provides enterprise-grade password breach detection with strong privacy protections and comprehensive security monitoring.
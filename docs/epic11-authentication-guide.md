# Epic 11 - Authentication & User Management Guide

## Overview

Epic 11 implements a comprehensive authentication and user management system for PromptScape with enterprise-grade security features, OWASP compliance, and scalable architecture.

## Architecture

### Core Components

1. **AuthenticationService** - Main orchestration service
2. **UserService** - User account management with Argon2id password hashing
3. **TokenService** - JWT token generation/validation with RS256
4. **AuditService** - Security audit logging and compliance
5. **RateLimitService** - Redis-based rate limiting with sliding window
6. **DatabaseService** - PostgreSQL database operations
7. **RedisService** - Session management and caching

### Security Features

- **Password Security**: Argon2id hashing with secure parameters
- **JWT Tokens**: RS256 asymmetric encryption with short-lived access tokens
- **Rate Limiting**: Sliding window algorithm with IP and user-based limits
- **Account Lockout**: Automatic lockout after failed login attempts
- **Audit Logging**: Comprehensive security event tracking
- **OWASP Compliance**: Following security best practices

## Quick Start

### 1. Environment Setup

```bash
# Generate JWT keys and environment template
cd server/src/auth
ts-node setup.ts setup

# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 2. Required Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=promptscape
DB_USER=postgres
DB_PASSWORD=your-password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-64-character-secret-key
```

### 3. Database Setup

```sql
-- Create database
CREATE DATABASE promptscape;

-- The schema will be automatically initialized on first run
```

### 4. Start Server

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "displayName": "John Doe",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "emailVerified": false,
    "createdAt": "2025-01-17T12:00:00Z",
    "roles": ["user"],
    "permissions": ["graphs:create:own", "graphs:read:own"]
  },
  "emailVerificationRequired": true
}
```

#### POST /auth/login
Authenticate user and get tokens.

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": false,
  "deviceInfo": {
    "browser": "Chrome",
    "os": "macOS"
  }
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "emailVerified": true,
    "lastLoginAt": "2025-01-17T12:00:00Z",
    "roles": ["user"],
    "permissions": ["graphs:create:own"]
  },
  "expiresAt": "2025-01-17T12:15:00Z"
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

#### POST /auth/logout
Logout and revoke tokens.

Headers: `Authorization: Bearer <access_token>`

### Password Management

#### POST /auth/password-reset/request
Request password reset email.

```json
{
  "email": "user@example.com"
}
```

#### POST /auth/password-reset/confirm
Confirm password reset with token.

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

#### POST /auth/change-password
Change password for authenticated user.

```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

### User Profile

#### GET /auth/me
Get current user profile.

Headers: `Authorization: Bearer <access_token>`

#### POST /auth/verify-email
Verify email address with token.

```json
{
  "token": "verification-token-from-email"
}
```

## Rate Limiting

The system implements comprehensive rate limiting:

| Endpoint | Window | Limit | 
|----------|--------|-------|
| Login | 1 minute | 5 attempts |
| Register | 1 minute | 3 attempts |
| Password Reset | 5 minutes | 3 attempts |
| Password Change | 5 minutes | 3 attempts |
| General API | 1 minute | 100 requests |

## JWT Token Structure

### Access Token (15 minutes)
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "roles": ["user", "admin"],
  "permissions": ["graphs:create:own", "users:read:org"],
  "organizationId": "org-id",
  "teamIds": ["team-1", "team-2"],
  "iat": 1642425600,
  "exp": 1642426500,
  "iss": "promptscape-auth",
  "aud": "promptscape-api"
}
```

### Refresh Token (7 days)
```json
{
  "sub": "user-id",
  "type": "refresh",
  "iat": 1642425600,
  "exp": 1643030400,
  "iss": "promptscape-auth",
  "aud": "promptscape-api"
}
```

## Role-Based Access Control (RBAC)

### Default Roles

1. **super_admin** - Full system access
2. **admin** - Organization management
3. **user** - Standard user access
4. **viewer** - Read-only access

### Permission Format

Permissions follow the pattern: `resource:action:scope`

Examples:
- `graphs:create:own` - Create own graphs
- `users:read:organization` - Read users in organization
- `teams:update:team` - Update team data

### Scopes

- **global** - System-wide access
- **organization** - Organization-level access
- **team** - Team-level access
- **own** - Personal resources only

## Security Considerations

### Password Policy

- Minimum 12 characters
- Must contain uppercase, lowercase, numbers, and symbols
- Cannot be common passwords
- Hashed with Argon2id (OWASP recommended)

### Account Security

- Account lockout after 5 failed attempts (30 minutes)
- Session management with device tracking
- Audit logging for all security events
- Token revocation capabilities

### Production Security

1. **Environment Variables**
   - Use strong JWT secrets (64+ characters)
   - Enable SSL/TLS for database connections
   - Use Redis AUTH in production

2. **Database Security**
   - Connection pooling with limits
   - Prepared statements for SQL injection prevention
   - Row-level security (RLS) enabled

3. **API Security**
   - CORS configuration for allowed origins
   - Security headers (CSP, HSTS, etc.)
   - Request validation with Zod schemas

## Monitoring & Observability

### Health Checks

```bash
GET /auth/health
```

Response:
```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "redis": true
  }
}
```

### Audit Logs

All security events are logged:
- Login attempts (success/failure)
- Password changes/resets
- Account lockouts
- Permission changes
- Suspicious activities

### Metrics

Monitor these key metrics:
- Login success/failure rates
- Token issuance/validation rates
- Rate limit violations
- Account lockout events
- Database/Redis response times

## Troubleshooting

### Common Issues

1. **JWT Key Errors**
   ```bash
   # Regenerate keys
   ts-node src/auth/setup.ts setup
   ```

2. **Database Connection**
   ```bash
   # Check PostgreSQL status
   pg_isready -h localhost -p 5432
   ```

3. **Redis Connection**
   ```bash
   # Test Redis connectivity
   redis-cli ping
   ```

4. **Rate Limiting Issues**
   ```bash
   # Check Redis keys
   redis-cli keys "auth:rate_limit:*"
   ```

### Debug Mode

Set environment variables for debugging:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

## Migration Guide

### From Existing Systems

1. **User Migration**
   - Export users from existing system
   - Hash passwords with Argon2id
   - Import with proper role assignments

2. **Session Migration**
   - Existing sessions will be invalidated
   - Users need to re-authenticate
   - Consider gradual rollout

3. **API Integration**
   - Update client applications
   - Add JWT token handling
   - Implement proper error handling

## Development

### Running Tests

```bash
# Run authentication tests
npm test -- auth

# Run with coverage
npm test -- --coverage auth
```

### Adding New Endpoints

1. Add route to `auth/routes.ts`
2. Implement business logic in services
3. Add validation schemas
4. Write comprehensive tests
5. Update documentation

### Extending RBAC

1. Define new roles in database
2. Add permissions to role
3. Update permission checking logic
4. Test with different user contexts

## Security Audit Checklist

- [ ] Strong password policy enforced
- [ ] Rate limiting configured properly
- [ ] JWT keys using RS256 algorithm
- [ ] Audit logging enabled
- [ ] HTTPS enforced in production
- [ ] Database connections secured
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] Input validation with Zod
- [ ] Error messages don't leak information

## Support

For issues or questions:
1. Check troubleshooting section
2. Review audit logs for security events
3. Monitor health check endpoints
4. Check database/Redis connectivity
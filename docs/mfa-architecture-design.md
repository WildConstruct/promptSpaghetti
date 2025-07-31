# Multi-Factor Authentication (MFA) Architecture Design

**Task ID**: T-1752989143997-198  
**Created**: 2025-07-20  
**Author**: Dev-Agent Security Specialist

## Executive Summary

This document outlines the comprehensive Multi-Factor Authentication (MFA) architecture for the PromptScape authentication system. The design implements industry-standard security practices with support for TOTP authenticators, SMS verification, email verification, and backup recovery codes.

## Current System Analysis

### Existing Authentication Infrastructure

- **Primary Authentication**: Email/password with comprehensive validation
- **Session Management**: JWT tokens with HTTP-only cookies and refresh tokens
- **Security Features**: Rate limiting, account lockout, device fingerprinting, geolocation tracking
- **Database**: PostgreSQL with Redis for session storage
- **Frontend**: React with TypeScript and Zod validation

### Integration Points

- `AuthenticationService` - Main orchestration service
- `UserService` - User management and validation
- `TokenService` - JWT and session token management
- `AuditService` - Security event logging
- `RateLimitService` - Brute force protection

## MFA Architecture Overview

### Design Principles

1. **Security First**: Industry-standard algorithms (TOTP RFC 6238, secure random generation)
2. **User Experience**: Progressive enhancement, graceful fallbacks
3. **Scalability**: Stateless verification, Redis caching for performance
4. **Compliance**: NIST SP 800-63B guidelines, SOC2 Type II requirements
5. **Recovery**: Multiple backup methods, secure account recovery

### Supported MFA Methods

#### 1. Time-based One-Time Password (TOTP)

- **Primary method** - RFC 6238 compliant
- **Apps**: Google Authenticator, Authy, 1Password, Bitwarden
- **Algorithm**: HMAC-SHA1 with 30-second windows
- **Backup**: Recovery codes automatically generated

#### 2. SMS Verification

- **Secondary method** - For users without smartphone apps
- **Provider**: Twilio/AWS SNS integration
- **Code Format**: 6-digit numeric, 5-minute expiry
- **Security**: Rate limiting, carrier fraud detection

#### 3. Email Verification

- **Tertiary method** - Fallback for SMS issues
- **Template**: Secure HTML with verification codes
- **Delivery**: Transactional email service (SendGrid/SES)
- **Security**: DKIM/SPF validation, link expiry

#### 4. Recovery Codes

- **Emergency access** - One-time use backup codes
- **Generation**: Cryptographically secure random (10 codes)
- **Format**: 8-character alphanumeric codes
- **Storage**: Hashed with bcrypt, marked when used

## Data Model Design

### MFA Configuration Table

```sql
CREATE TABLE mfa_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    primary_method VARCHAR(20), -- 'totp', 'sms', 'email'
    backup_methods TEXT[], -- array of enabled backup methods
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id)
);
```

### TOTP Secrets Table

```sql
CREATE TABLE mfa_totp_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    secret_key_hash VARCHAR(255) NOT NULL, -- encrypted TOTP secret
    backup_codes_hash TEXT[], -- hashed recovery codes
    backup_codes_used BOOLEAN[] DEFAULT array_fill(false, ARRAY[10]),
    qr_code_shown BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id)
);
```

### SMS/Email Verification Table

```sql
CREATE TABLE mfa_verification_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method VARCHAR(20) NOT NULL, -- 'sms', 'email'
    destination VARCHAR(255) NOT NULL, -- phone number or email
    code_hash VARCHAR(255) NOT NULL,
    attempts_remaining INTEGER DEFAULT 3,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    INDEX(user_id, method, expires_at),
    INDEX(expires_at) -- for cleanup job
);
```

### MFA Audit Log Table

```sql
CREATE TABLE mfa_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'enabled', 'disabled', 'verified', 'failed', 'recovery_used'
    method VARCHAR(20), -- which MFA method was used
    ip_address INET,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    INDEX(user_id, created_at),
    INDEX(action, created_at),
    INDEX(ip_address, created_at)
);
```

## Service Architecture

### MFAService (Core Orchestrator)

```typescript
interface MFAService {
  // Enrollment
  initiateEnrollment(userId: string, method: MFAMethod): Promise<EnrollmentResponse>;
  confirmEnrollment(userId: string, token: string, code: string): Promise<boolean>;

  // Verification
  verifyMFA(userId: string, code: string, method?: MFAMethod): Promise<VerificationResult>;

  // Management
  disableMFA(userId: string, confirmationCode: string): Promise<boolean>;
  generateRecoveryCodes(userId: string): Promise<string[]>;

  // Status
  getMFAStatus(userId: string): Promise<MFAStatus>;
}
```

### TOTPService (Authenticator App Support)

```typescript
interface TOTPService {
  generateSecret(): Promise<{ secret: string; qrCodeUrl: string }>;
  verifyTOTP(secret: string, token: string, window?: number): Promise<boolean>;
  generateQRCode(secret: string, userEmail: string): Promise<string>;
}
```

### SMSService (Phone Verification)

```typescript
interface SMSService {
  sendVerificationCode(phoneNumber: string, code: string): Promise<boolean>;
  verifyPhoneNumber(phoneNumber: string): Promise<boolean>;
  formatPhoneNumber(phone: string, country?: string): Promise<string>;
}
```

### EmailMFAService (Email Verification)

```typescript
interface EmailMFAService {
  sendVerificationCode(email: string, code: string): Promise<boolean>;
  verifyEmailCode(userId: string, code: string): Promise<boolean>;
}
```

## Authentication Flow Enhancements

### Standard Login Flow (No MFA)

1. User submits email/password
2. System validates credentials
3. **NEW**: Check if MFA is enabled for user
4. If MFA disabled → Generate session token, redirect to dashboard
5. If MFA enabled → Generate MFA challenge token, redirect to MFA verification

### MFA-Enhanced Login Flow

1. User submits email/password (first factor)
2. System validates credentials successfully
3. System checks user's MFA configuration
4. Generate MFA challenge session (5-minute expiry)
5. Present MFA verification UI with available methods
6. User selects method and submits verification code
7. System verifies second factor
8. On success → Generate full session token, redirect to dashboard
9. On failure → Increment attempt counter, potential lockout

### MFA Challenge Session

```typescript
interface MFAChallenge {
  token: string; // Short-lived challenge token (5 minutes)
  userId: string;
  availableMethods: MFAMethod[];
  attemptsRemaining: number;
  createdAt: Date;
  expiresAt: Date;
}
```

## Enrollment Process Design

### TOTP Enrollment Flow

1. User navigates to security settings
2. System generates TOTP secret and QR code
3. User scans QR code with authenticator app
4. System displays setup verification form
5. User enters TOTP code from app
6. System verifies code and marks TOTP as enabled
7. System generates and displays recovery codes
8. User confirms they've saved recovery codes

### SMS Enrollment Flow

1. User enters phone number
2. System validates phone number format
3. System sends verification SMS
4. User enters received code
5. System verifies code and enables SMS MFA
6. System generates recovery codes as backup

### Email Enrollment Flow

1. System uses user's primary email
2. System sends verification email
3. User enters received code
4. System verifies code and enables email MFA
5. System generates recovery codes as backup

## Security Considerations

### TOTP Security

- **Secret Generation**: Cryptographically secure random 160-bit secrets
- **Algorithm**: HMAC-SHA1 (RFC 6238 standard)
- **Time Window**: 30-second periods with ±1 window tolerance
- **Replay Protection**: Store last successful timestamp
- **Secret Storage**: Encrypted at rest with application key

### SMS Security

- **Rate Limiting**: Max 3 codes per phone number per hour
- **Code Format**: 6-digit numeric, cryptographically random
- **Expiry**: 5-minute code lifetime
- **Carrier Security**: International SMS fraud detection
- **Backup**: Always require recovery codes as SMS backup

### Email Security

- **Rate Limiting**: Max 3 codes per email per hour
- **Code Format**: 6-digit alphanumeric, high entropy
- **Template Security**: No executable content, text+HTML
- **Delivery**: SPF/DKIM authenticated sending domain
- **Link Security**: No clickable links, code-only verification

### Recovery Code Security

- **Generation**: 10 codes, 8 characters each, base32 encoded
- **Entropy**: 40 bits per code (cryptographically secure)
- **Storage**: Individual bcrypt hashing (cost factor 12)
- **Usage**: One-time use, mark as consumed immediately
- **Display**: Show once during generation, require re-authentication to view

## Implementation Timeline

### Phase 1: Core Infrastructure (Week 1-2)

- [ ] MFA database schema migration
- [ ] Base MFA service architecture
- [ ] TOTP service implementation
- [ ] Recovery code system

### Phase 2: SMS/Email Methods (Week 3)

- [ ] SMS service integration (Twilio)
- [ ] Email MFA service
- [ ] Rate limiting for verification codes
- [ ] Audit logging implementation

### Phase 3: Frontend Integration (Week 4)

- [ ] MFA enrollment UI components
- [ ] Login flow modifications
- [ ] Security settings dashboard
- [ ] Mobile-responsive design

### Phase 4: Testing & Security (Week 5-6)

- [ ] Comprehensive unit tests
- [ ] Integration tests
- [ ] Security penetration testing
- [ ] Performance testing

## API Endpoints Design

### Enrollment Endpoints

```
POST /api/auth/mfa/enroll/totp          - Start TOTP enrollment
POST /api/auth/mfa/enroll/totp/confirm  - Confirm TOTP setup
POST /api/auth/mfa/enroll/sms           - Start SMS enrollment
POST /api/auth/mfa/enroll/email         - Start email enrollment
```

### Verification Endpoints

```
POST /api/auth/mfa/verify              - Verify MFA code during login
POST /api/auth/mfa/verify/recovery     - Use recovery code
```

### Management Endpoints

```
GET  /api/auth/mfa/status              - Get user's MFA status
POST /api/auth/mfa/disable             - Disable MFA (with confirmation)
POST /api/auth/mfa/recovery/generate   - Generate new recovery codes
GET  /api/auth/mfa/recovery/codes      - View recovery codes (re-auth required)
```

## Error Handling & User Experience

### Error Scenarios

1. **Invalid TOTP Code**: Clear error message, remaining attempts
2. **Expired SMS Code**: Option to resend, rate limiting message
3. **All Recovery Codes Used**: Admin contact information
4. **Device Lost**: Account recovery process documentation
5. **Network Issues**: Offline fallback instructions

### User Education

- **Setup Guides**: Step-by-step instructions for each MFA method
- **Best Practices**: Secure backup storage recommendations
- **Troubleshooting**: Common issues and solutions
- **Recovery Process**: Clear instructions for account recovery

## Monitoring & Metrics

### Key Metrics

- MFA enrollment rate by method
- Verification success/failure rates
- Account lockout incidents
- Recovery code usage patterns
- Performance metrics (verification time)

### Alerting

- Unusual MFA failure patterns
- Bulk account lockouts
- SMS/Email delivery failures
- High verification latency

## Compliance & Standards

### Standards Compliance

- **NIST SP 800-63B**: Digital Identity Guidelines
- **RFC 6238**: TOTP Algorithm
- **FIDO Alliance**: Future WebAuthn integration path
- **OWASP**: Authentication security best practices

### Privacy Considerations

- Phone numbers encrypted at rest
- MFA preferences in privacy policy
- User control over method selection
- Data retention policies for audit logs

## Future Enhancements

### Phase 2 Features

- **WebAuthn/FIDO2**: Hardware security keys
- **Push Notifications**: App-based approvals
- **Biometric Integration**: Fingerprint/face recognition
- **Risk-Based Authentication**: Conditional MFA based on login context

### Integration Opportunities

- **SSO Providers**: SAML/OIDC MFA delegation
- **Enterprise**: Active Directory integration
- **Mobile**: Native app deep linking
- **API**: Programmatic MFA for service accounts

## Conclusion

This MFA architecture provides a robust, scalable, and user-friendly multi-factor authentication system that significantly enhances the security posture of the PromptScape platform while maintaining excellent user experience. The phased implementation approach allows for iterative testing and refinement while delivering immediate security value.

The design follows industry best practices and compliance standards while providing flexibility for future enhancements and integration with emerging authentication technologies.

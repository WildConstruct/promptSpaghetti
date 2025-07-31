# Email-Based Verification Options Research

## Overview

This document outlines email-based verification options for multi-factor authentication (MFA) implementation as part of Epic 19: Authentication Enhancement & Security Hardening.

## Email Verification Methods

### 1. One-Time Password (OTP) via Email

**Description**: Send a temporary numeric/alphanumeric code to user's email address for verification.

**Implementation Options**:

- **6-digit numeric codes** (123456) - Most user-friendly
- **8-character alphanumeric** (A1B2C3D4) - More secure
- **UUID-based tokens** - Maximum security but poor UX

**Advantages**:

- Familiar to users
- No additional app installation required
- Works on any device with email access
- Cost-effective (no SMS fees)

**Disadvantages**:

- Depends on email delivery reliability
- Vulnerable to email compromise
- Slower than SMS (email delivery delays)
- Users may not check email immediately

### 2. Magic Links

**Description**: Send a unique, time-limited URL that automatically authenticates the user when clicked.

**Implementation Variants**:

- **Simple verification links** - Click to verify identity
- **Session establishment links** - Click to login directly
- **Challenge-response links** - Click to complete specific action

**Advantages**:

- Excellent user experience (one-click authentication)
- No code memorization required
- Can embed context/metadata in URL
- Works well on mobile devices

**Disadvantages**:

- Link interception risks
- Email client preview may trigger links accidentally
- Difficult to use across different devices
- URL manipulation attacks possible

### 3. Email Challenge-Response

**Description**: Send a challenge question or task that user must complete via email reply.

**Implementation Types**:

- **Simple confirmation** - Reply with "CONFIRM" or "YES"
- **Challenge questions** - Answer security question via email
- **Encrypted responses** - Reply with decrypted code

**Advantages**:

- Verifies email account control
- Can incorporate knowledge-based authentication
- Difficult to automate attacks

**Disadvantages**:

- Poor user experience
- Complex implementation
- Email threading issues
- Not suitable for real-time scenarios

## Technical Implementation Considerations

### Email Service Providers

1. **Transactional Email Services**:
   - SendGrid - Reliable, good analytics
   - Mailgun - Developer-friendly API
   - Amazon SES - Cost-effective, integrates with AWS
   - Postmark - High deliverability focus

2. **Enterprise Email**:
   - Microsoft Graph API (Office 365)
   - Google Workspace APIs
   - Direct SMTP (limited scalability)

### Security Requirements

- **Code Generation**: Use cryptographically secure random number generators
- **Expiration**: 5-15 minute timeouts for codes/links
- **Rate Limiting**: Prevent email flooding attacks
- **Replay Protection**: Single-use codes/links only
- **Encryption**: Encrypt sensitive data in email templates

### Deliverability Optimization

- **SPF/DKIM/DMARC** records properly configured
- **Dedicated IP addresses** for high-volume senders
- **Template optimization** to avoid spam filters
- **Bounce handling** and list hygiene
- **Reputation monitoring** and feedback loops

## Recommended Approach

### Primary: OTP via Email

- Generate 6-digit numeric codes using `crypto.randomInt(100000, 999999)`
- 10-minute expiration window
- Maximum 3 attempts per 15-minute period
- Store codes hashed in database with salt

### Secondary: Magic Links (Fallback)

- Generate cryptographically secure tokens (32+ bytes)
- 5-minute expiration for high-security actions
- Include HMAC signature to prevent tampering
- Log all access attempts for audit trail

### Implementation Timeline

1. **Phase 1**: Basic OTP email delivery system
2. **Phase 2**: Template customization and branding
3. **Phase 3**: Magic link fallback implementation
4. **Phase 4**: Advanced features (conditional challenges, risk-based timing)

## Integration Points

### Frontend Components

- Email input field with validation
- OTP entry interface (6-digit input boxes)
- Resend functionality with cooldown timer
- Alternative method switching (email ↔ SMS ↔ TOTP)

### Backend Services

- Email template rendering engine
- Code generation and validation service
- Rate limiting middleware
- Audit logging for all verification attempts

### Database Schema

```sql
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  email_address TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  method ENUM('otp', 'magic_link', 'challenge'),
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);
```

## Security Considerations Document Reference

See Task T-1752989143997-830 for detailed security analysis of each verification method.

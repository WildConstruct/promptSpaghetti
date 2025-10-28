# MFA Enrollment Flow Design

## Overview

This document defines the comprehensive Multi-Factor Authentication (MFA) enrollment flow design for Epic 19: Authentication Enhancement & Security Hardening. The design prioritizes user experience while maintaining security best practices.

## Enrollment Flow Architecture

### High-Level User Journey

```
User Account → MFA Setup Prompt → Method Selection → Verification → Backup Setup → Completion
     ↓              ↓                ↓              ↓            ↓            ↓
  Login/Reg → Motivation/Benefits → Choose Primary → Verify → Recovery → Success
```

### Flow Entry Points

1. **Mandatory Enrollment** - Required for new accounts or policy changes
2. **Optional Enrollment** - User-initiated from security settings
3. **Recovery Enrollment** - Adding backup methods after account recovery
4. **Administrative Enrollment** - IT-initiated for enterprise accounts

## Detailed Enrollment Flows

### 1. Initial MFA Setup Flow

#### Step 1: Enrollment Trigger

```typescript
interface EnrollmentTrigger {
  triggerType: 'mandatory' | 'optional' | 'recovery' | 'admin';
  userId: string;
  policyRequirement?: PolicyRequirement;
  sessionContext: SessionContext;
}

interface PolicyRequirement {
  minimumMethods: number;
  allowedMethods: AuthMethod[];
  deadline?: Date;
  gracePeriodDays?: number;
}
```

#### Step 2: Educational Introduction

```html
<!-- MFA Introduction Screen -->
<div class="mfa-intro">
  <h2>Secure Your Account with Two-Factor Authentication</h2>

  <div class="benefits-grid">
    <div class="benefit">
      <icon>🔒</icon>
      <h3>Enhanced Security</h3>
      <p>Protect against password breaches and unauthorized access</p>
    </div>

    <div class="benefit">
      <icon>📱</icon>
      <h3>Multiple Options</h3>
      <p>Choose from authenticator apps, SMS, email, or hardware keys</p>
    </div>

    <div class="benefit">
      <icon>⚡</icon>
      <h3>Quick Access</h3>
      <p>Fast verification keeps you secure without slowing you down</p>
    </div>
  </div>

  <div class="time-estimate">
    <icon>⏱️</icon>
    <span>Setup takes 2-3 minutes</span>
  </div>
</div>
```

#### Step 3: Method Selection Interface

```typescript
interface MethodOption {
  methodType: AuthMethod;
  displayName: string;
  description: string;
  securityLevel: 'High' | 'Medium' | 'Basic';
  setupDifficulty: 'Easy' | 'Medium' | 'Advanced';
  requirements: string[];
  recommended: boolean;
}

const methodOptions: MethodOption[] = [
  {
    methodType: 'totp',
    displayName: 'Authenticator App',
    description: 'Use an app like Google Authenticator or Authy',
    securityLevel: 'High',
    setupDifficulty: 'Easy',
    requirements: ['Smartphone', 'Authenticator app'],
    recommended: true
  },
  {
    methodType: 'email',
    displayName: 'Email Codes',
    description: 'Receive verification codes via email',
    securityLevel: 'Medium',
    setupDifficulty: 'Easy',
    requirements: ['Email access'],
    recommended: false
  },
  {
    methodType: 'sms',
    displayName: 'Text Messages',
    description: 'Receive codes via SMS',
    securityLevel: 'Medium',
    setupDifficulty: 'Easy',
    requirements: ['Mobile phone'],
    recommended: false
  },
  {
    methodType: 'hardware',
    displayName: 'Hardware Key',
    description: 'Use a physical security key',
    securityLevel: 'High',
    setupDifficulty: 'Advanced',
    requirements: ['Hardware security key'],
    recommended: false
  }
];
```

### 2. Method-Specific Enrollment Flows

#### TOTP Authenticator App Enrollment

```typescript
interface TOTPEnrollmentFlow {
  steps: [
    'app_download',
    'qr_code_display',
    'manual_entry_fallback',
    'verification_test',
    'backup_codes_generation'
  ];
}
```

**Step-by-Step TOTP Flow:**

1. **App Download Guidance**

```html
<div class="app-download-step">
  <h3>Install an Authenticator App</h3>
  <p>Choose one of these recommended apps:</p>

  <div class="app-recommendations">
    <div class="app-option">
      <img src="google-auth-icon.svg" alt="Google Authenticator" />
      <h4>Google Authenticator</h4>
      <div class="download-links">
        <a href="#" class="ios-link">iOS</a>
        <a href="#" class="android-link">Android</a>
      </div>
    </div>

    <div class="app-option">
      <img src="authy-icon.svg" alt="Authy" />
      <h4>Authy</h4>
      <div class="download-links">
        <a href="#" class="ios-link">iOS</a>
        <a href="#" class="android-link">Android</a>
      </div>
    </div>
  </div>

  <button class="continue-btn">I've installed an app</button>
</div>
```

2. **QR Code Display**

```typescript
interface QRCodeSetup {
  qrCodeSVG: string;
  manualEntryCode: string;
  accountName: string;
  issuer: string;
}

class TOTPEnrollment {
  async generateQRCode(userId: string): Promise<QRCodeSetup> {
    const secret = this.generateTOTPSecret();
    const accountName = await this.getUserEmail(userId);
    const issuer = 'PromptScape';

    const otpAuthURL = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

    const qrCodeSVG = await this.generateQRCodeSVG(otpAuthURL);

    return {
      qrCodeSVG,
      manualEntryCode: this.formatSecretForDisplay(secret),
      accountName,
      issuer
    };
  }
}
```

3. **Manual Entry Fallback**

```html
<div class="manual-entry-section">
  <details>
    <summary>Can't scan QR code? Enter manually</summary>
    <div class="manual-entry-content">
      <p>Account: user@example.com</p>
      <p>Key: <code class="secret-key">JBSW Y3DP EHPK 3PXP</code></p>
      <button class="copy-btn" onclick="copyToClipboard('.secret-key')">
        Copy Key
      </button>
    </div>
  </details>
</div>
```

4. **Verification Test**

```html
<div class="verification-step">
  <h3>Test Your Setup</h3>
  <p>Enter the 6-digit code from your authenticator app:</p>

  <div class="code-input-group">
    <input type="text" maxlength="1" class="code-digit" />
    <input type="text" maxlength="1" class="code-digit" />
    <input type="text" maxlength="1" class="code-digit" />
    <input type="text" maxlength="1" class="code-digit" />
    <input type="text" maxlength="1" class="code-digit" />
    <input type="text" maxlength="1" class="code-digit" />
  </div>

  <div class="verification-feedback">
    <div class="error-message" style="display: none;">
      Code incorrect. Please try again.
    </div>
    <div class="success-message" style="display: none;">
      Perfect! Your authenticator is working correctly.
    </div>
  </div>

  <button class="verify-btn">Verify Code</button>
</div>
```

#### Email Enrollment Flow

```typescript
class EmailEnrollment {
  async enrollEmail(
    userId: string,
    emailAddress: string
  ): Promise<EnrollmentResult> {
    // Validate email format
    if (!this.isValidEmail(emailAddress)) {
      throw new Error('Invalid email format');
    }

    // Check if email is different from login email
    const loginEmail = await this.getUserLoginEmail(userId);
    if (emailAddress === loginEmail) {
      throw new Error('Recovery email must be different from login email');
    }

    // Send verification email
    const verificationCode = this.generateVerificationCode();
    await this.sendVerificationEmail(emailAddress, verificationCode);

    // Store pending verification
    await this.storePendingVerification(userId, emailAddress, verificationCode);

    return {
      status: 'pending_verification',
      message: 'Verification email sent'
    };
  }
}
```

#### SMS Enrollment Flow

```typescript
class SMSEnrollment {
  async enrollSMS(
    userId: string,
    phoneNumber: string
  ): Promise<EnrollmentResult> {
    // Validate and format phone number
    const formattedNumber = this.formatPhoneNumber(phoneNumber);

    // Check carrier and validate number
    const carrierInfo = await this.validatePhoneNumber(formattedNumber);
    if (!carrierInfo.valid) {
      throw new Error('Invalid phone number');
    }

    // Send verification SMS
    const verificationCode = this.generateSMSCode();
    await this.sendVerificationSMS(formattedNumber, verificationCode);

    return {
      status: 'pending_verification',
      message: 'Verification code sent via SMS'
    };
  }
}
```

### 3. Backup Method Enrollment

#### Backup Codes Generation

```html
<div class="backup-codes-step">
  <h3>Save Your Backup Codes</h3>
  <p class="warning">
    <icon>⚠️</icon>
    These codes will only be shown once. Save them in a secure location.
  </p>

  <div class="backup-codes-grid">
    <code>A1B2-C3D4</code>
    <code>E5F6-G7H8</code>
    <code>I9J0-K1L2</code>
    <code>M3N4-O5P6</code>
    <code>Q7R8-S9T0</code>
    <code>U1V2-W3X4</code>
    <code>Y5Z6-A7B8</code>
    <code>C9D0-E1F2</code>
    <code>G3H4-I5J6</code>
    <code>K7L8-M9N0</code>
  </div>

  <div class="backup-actions">
    <button class="download-btn">
      <icon>💾</icon>
      Download as Text File
    </button>
    <button class="print-btn">
      <icon>🖨️</icon>
      Print Codes
    </button>
    <button class="copy-btn">
      <icon>📋</icon>
      Copy All Codes
    </button>
  </div>

  <div class="confirmation">
    <label>
      <input type="checkbox" required />
      I have saved these backup codes in a secure location
    </label>
  </div>
</div>
```

### 4. Progressive Enrollment Strategy

#### Enrollment Phases

```typescript
interface EnrollmentPhase {
  phase: 'primary' | 'backup' | 'recovery' | 'complete';
  required: boolean;
  canSkip: boolean;
  deadline?: Date;
}

const enrollmentPhases: EnrollmentPhase[] = [
  {
    phase: 'primary',
    required: true,
    canSkip: false
  },
  {
    phase: 'backup',
    required: false,
    canSkip: true,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  {
    phase: 'recovery',
    required: false,
    canSkip: true
  }
];
```

#### Skip and Reminder Logic

```typescript
class EnrollmentReminder {
  async scheduleReminders(
    userId: string,
    phase: EnrollmentPhase
  ): Promise<void> {
    if (!phase.canSkip) return;

    const reminders = [
      { days: 1, message: "Don't forget to set up backup authentication" },
      { days: 3, message: 'Secure your account with backup methods' },
      { days: 6, message: 'Final reminder: Complete your MFA setup' }
    ];

    for (const reminder of reminders) {
      await this.scheduleEmail(userId, reminder.message, reminder.days);
    }
  }
}
```

### 5. User Experience Enhancements

#### Progress Indicator

```html
<div class="enrollment-progress">
  <div class="progress-bar">
    <div class="progress-fill" style="width: 60%"></div>
  </div>

  <div class="progress-steps">
    <div class="step completed">
      <div class="step-number">1</div>
      <div class="step-label">Choose Method</div>
    </div>
    <div class="step active">
      <div class="step-number">2</div>
      <div class="step-label">Setup</div>
    </div>
    <div class="step">
      <div class="step-number">3</div>
      <div class="step-label">Verify</div>
    </div>
    <div class="step">
      <div class="step-number">4</div>
      <div class="step-label">Backup</div>
    </div>
    <div class="step">
      <div class="step-number">5</div>
      <div class="step-label">Complete</div>
    </div>
  </div>
</div>
```

#### Error Handling and Recovery

```typescript
interface EnrollmentError {
  code: string;
  message: string;
  recoveryActions: RecoveryAction[];
}

interface RecoveryAction {
  label: string;
  action: () => void;
  primary: boolean;
}

const errorHandlers = {
  INVALID_CODE: {
    code: 'INVALID_CODE',
    message: 'The code you entered is incorrect.',
    recoveryActions: [
      { label: 'Try Again', action: () => retryVerification(), primary: true },
      { label: 'Resend Code', action: () => resendCode(), primary: false },
      {
        label: 'Use Different Method',
        action: () => switchMethod(),
        primary: false
      }
    ]
  },

  CODE_EXPIRED: {
    code: 'CODE_EXPIRED',
    message: 'This code has expired. Please request a new one.',
    recoveryActions: [
      { label: 'Get New Code', action: () => generateNewCode(), primary: true },
      {
        label: 'Try Different Method',
        action: () => switchMethod(),
        primary: false
      }
    ]
  },

  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    message: 'Too many attempts. Please wait before trying again.',
    recoveryActions: [
      { label: 'Wait and Retry', action: () => showWaitTimer(), primary: true },
      {
        label: 'Contact Support',
        action: () => contactSupport(),
        primary: false
      }
    ]
  }
};
```

#### Help and Support Integration

```html
<div class="enrollment-help">
  <div class="help-trigger">
    <button class="help-btn">
      <icon>❓</icon>
      Need Help?
    </button>
  </div>

  <div class="help-panel" style="display: none;">
    <h4>Common Issues</h4>
    <div class="help-items">
      <div class="help-item">
        <strong>Can't scan QR code?</strong>
        <p>Try using the manual entry option below the QR code.</p>
      </div>
      <div class="help-item">
        <strong>Code not working?</strong>
        <p>Check your device's time settings and try again.</p>
      </div>
      <div class="help-item">
        <strong>Lost your phone?</strong>
        <p>Use backup codes or contact support for assistance.</p>
      </div>
    </div>

    <div class="support-contact">
      <button class="contact-support-btn">Contact Support</button>
    </div>
  </div>
</div>
```

### 6. Mobile and Responsive Design

#### Mobile-First Approach

```css
/* Mobile-optimized QR code display */
.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.qr-code {
  width: min(280px, 80vw);
  height: min(280px, 80vw);
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
}

/* Touch-friendly code input */
.code-digit {
  width: 48px;
  height: 56px;
  font-size: 24px;
  text-align: center;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  margin: 0 4px;
}

/* Responsive method selection */
.method-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .method-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .method-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 7. Analytics and Optimization

#### Enrollment Metrics

```typescript
interface EnrollmentMetrics {
  startedEnrollments: number;
  completedEnrollments: number;
  abandonmentRate: number;
  averageCompletionTime: number;
  methodPopularity: Record<AuthMethod, number>;
  dropOffPoints: Record<string, number>;
}

class EnrollmentAnalytics {
  async trackEnrollmentEvent(
    userId: string,
    event: EnrollmentEvent
  ): Promise<void> {
    const eventData = {
      userId,
      event: event.type,
      step: event.step,
      method: event.method,
      timestamp: new Date(),
      metadata: event.metadata
    };

    await this.analyticsService.track('mfa_enrollment', eventData);
  }
}
```

#### A/B Testing Framework

```typescript
interface EnrollmentVariant {
  name: string;
  description: string;
  config: EnrollmentConfig;
  weight: number; // percentage of users
}

const enrollmentVariants: EnrollmentVariant[] = [
  {
    name: 'standard',
    description: 'Standard enrollment flow',
    config: { showBenefits: true, progressIndicator: true },
    weight: 50
  },
  {
    name: 'simplified',
    description: 'Simplified single-page enrollment',
    config: { showBenefits: false, progressIndicator: false },
    weight: 50
  }
];
```

### 8. Accessibility Considerations

#### Screen Reader Support

```html
<!-- Accessible method selection -->
<fieldset class="method-selection">
  <legend>Choose your preferred authentication method</legend>

  <div
    class="method-options"
    role="radiogroup"
    aria-labelledby="method-selection-heading"
  >
    <label class="method-option" for="totp-method">
      <input
        type="radio"
        id="totp-method"
        name="auth-method"
        value="totp"
        aria-describedby="totp-description"
      />
      <div class="method-content">
        <h3>Authenticator App</h3>
        <p id="totp-description">
          Most secure option using an app on your phone
        </p>
      </div>
    </label>
  </div>
</fieldset>

<!-- Accessible code input -->
<div class="code-input-group" role="group" aria-labelledby="code-input-label">
  <label id="code-input-label">Enter 6-digit verification code</label>
  <div class="code-digits">
    <input type="text" maxlength="1" aria-label="Digit 1" />
    <input type="text" maxlength="1" aria-label="Digit 2" />
    <!-- ... -->
  </div>
</div>
```

#### Keyboard Navigation

```typescript
class KeyboardNavigation {
  setupCodeInputNavigation(): void {
    const codeInputs = document.querySelectorAll('.code-digit');

    codeInputs.forEach((input, index) => {
      input.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && input.value === '' && index > 0) {
          codeInputs[index - 1].focus();
        } else if (e.key >= '0' && e.key <= '9') {
          input.value = e.key;
          if (index < codeInputs.length - 1) {
            codeInputs[index + 1].focus();
          }
          e.preventDefault();
        }
      });
    });
  }
}
```

### 9. Security Considerations

#### Enrollment Session Security

```typescript
class EnrollmentSecurity {
  async createSecureEnrollmentSession(
    userId: string
  ): Promise<EnrollmentSession> {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const session: EnrollmentSession = {
      sessionId: sessionToken,
      userId,
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      currentStep: 'method_selection',
      verificationAttempts: 0,
      ipAddress: this.getCurrentIP(),
      userAgent: this.getUserAgent()
    };

    await this.redis.setex(
      `enrollment_session:${sessionToken}`,
      1800, // 30 minutes
      JSON.stringify(session)
    );

    return session;
  }
}
```

#### Rate Limiting During Enrollment

```typescript
const enrollmentRateLimits = {
  codeGeneration: { maxAttempts: 5, windowMinutes: 60 },
  codeVerification: { maxAttempts: 5, windowMinutes: 15 },
  methodSwitching: { maxAttempts: 10, windowMinutes: 60 }
};
```

This comprehensive enrollment flow design ensures a smooth, secure, and accessible experience for users setting up MFA while maintaining security best practices and providing flexibility for different user needs and technical capabilities.

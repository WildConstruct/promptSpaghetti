# MFA Status Indicators and UI Components Design

## Overview

This document defines the comprehensive UI components and status indicators for Multi-Factor Authentication (MFA) as part of Epic 19: Authentication Enhancement & Security Hardening. The design system ensures consistent, accessible, and intuitive user experiences across all MFA interactions.

## Design System Foundations

### Color Palette

```css
:root {
  /* Security Status Colors */
  --security-high: #10b981; /* Green - High security */
  --security-medium: #f59e0b; /* Amber - Medium security */
  --security-low: #ef4444; /* Red - Low security */
  --security-warning: #f97316; /* Orange - Warning */

  /* MFA Method Colors */
  --method-active: #3b82f6; /* Blue - Active method */
  --method-pending: #6b7280; /* Gray - Pending setup */
  --method-disabled: #d1d5db; /* Light gray - Disabled */

  /* Interactive States */
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --secondary: #64748b;
  --success: #059669;
  --error: #dc2626;
  --warning: #d97706;
}
```

### Typography Scale

```css
.text-heading-1 {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.25;
}
.text-heading-2 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.33;
}
.text-heading-3 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
}
.text-body {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
}
.text-small {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.43;
}
.text-caption {
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.33;
}
```

### Spacing System

```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
}
```

## Core UI Components

### 1. Security Status Badge

```typescript
interface SecurityStatusProps {
  level: 'high' | 'medium' | 'low';
  methodCount: number;
  showDetails?: boolean;
}

const SecurityStatusBadge: React.FC<SecurityStatusProps> = ({ level, methodCount, showDetails }) => {
  const statusConfig = {
    high: {
      color: 'var(--security-high)',
      icon: '🔒',
      label: 'Highly Secure',
      description: 'Multiple strong authentication methods enabled'
    },
    medium: {
      color: 'var(--security-medium)',
      icon: '⚠️',
      label: 'Moderately Secure',
      description: 'Consider adding additional authentication methods'
    },
    low: {
      color: 'var(--security-low)',
      icon: '🔓',
      label: 'Low Security',
      description: 'Please enable multi-factor authentication'
    }
  };

  return (
    <div className={`security-badge security-badge--${level}`}>
      <div className="security-badge__icon">{statusConfig[level].icon}</div>
      <div className="security-badge__content">
        <div className="security-badge__label">{statusConfig[level].label}</div>
        {showDetails && (
          <div className="security-badge__details">
            <div className="method-count">{methodCount} method{methodCount !== 1 ? 's' : ''}</div>
            <div className="description">{statusConfig[level].description}</div>
          </div>
        )}
      </div>
    </div>
  );
};
```

```css
.security-badge {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: 8px;
  border: 1px solid transparent;
  background: var(--bg-subtle);
}

.security-badge--high {
  border-color: var(--security-high);
  background: rgba(16, 185, 129, 0.1);
}

.security-badge--medium {
  border-color: var(--security-medium);
  background: rgba(245, 158, 11, 0.1);
}

.security-badge--low {
  border-color: var(--security-low);
  background: rgba(239, 68, 68, 0.1);
}

.security-badge__icon {
  font-size: 1.25rem;
  line-height: 1;
}

.security-badge__label {
  font-weight: 600;
  color: var(--text-primary);
}

.security-badge__details .method-count {
  font-size: var(--text-small);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.security-badge__details .description {
  font-size: var(--text-small);
  color: var(--text-secondary);
  margin-top: var(--space-2);
}
```

### 2. MFA Method Card

```typescript
interface MFAMethodProps {
  method: {
    id: string;
    type: 'totp' | 'email' | 'sms' | 'hardware';
    label: string;
    identifier: string;
    status: 'active' | 'pending' | 'disabled';
    lastUsed?: Date;
    isDefault: boolean;
  };
  onEdit: (methodId: string) => void;
  onRemove: (methodId: string) => void;
  onSetDefault: (methodId: string) => void;
}

const MFAMethodCard: React.FC<MFAMethodProps> = ({ method, onEdit, onRemove, onSetDefault }) => {
  const methodIcons = {
    totp: '📱',
    email: '📧',
    sms: '💬',
    hardware: '🔑'
  };

  const statusLabels = {
    active: 'Active',
    pending: 'Setup Required',
    disabled: 'Disabled'
  };

  return (
    <div className={`mfa-method-card mfa-method-card--${method.status}`}>
      <div className="mfa-method-card__header">
        <div className="method-icon">{methodIcons[method.type]}</div>
        <div className="method-info">
          <div className="method-label">
            {method.label}
            {method.isDefault && <span className="default-badge">Default</span>}
          </div>
          <div className="method-identifier">{method.identifier}</div>
        </div>
        <div className="method-status">
          <StatusIndicator status={method.status} />
        </div>
      </div>

      <div className="mfa-method-card__body">
        {method.lastUsed && (
          <div className="last-used">
            Last used: {formatRelativeTime(method.lastUsed)}
          </div>
        )}

        <div className="method-actions">
          <button
            className="btn btn--secondary btn--small"
            onClick={() => onEdit(method.id)}
          >
            Edit
          </button>

          {!method.isDefault && method.status === 'active' && (
            <button
              className="btn btn--secondary btn--small"
              onClick={() => onSetDefault(method.id)}
            >
              Set as Default
            </button>
          )}

          <button
            className="btn btn--danger btn--small"
            onClick={() => onRemove(method.id)}
            disabled={method.isDefault}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
```

```css
.mfa-method-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: var(--space-5);
  background: white;
  transition: all 0.2s ease;
}

.mfa-method-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mfa-method-card--pending {
  border-color: var(--method-pending);
  background: rgba(107, 114, 128, 0.05);
}

.mfa-method-card--disabled {
  opacity: 0.6;
  border-color: var(--method-disabled);
}

.mfa-method-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.method-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-subtle);
  border-radius: 8px;
}

.method-info {
  flex: 1;
}

.method-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 600;
  color: var(--text-primary);
}

.default-badge {
  font-size: var(--text-caption);
  font-weight: 500;
  color: var(--primary);
  background: rgba(37, 99, 235, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.method-identifier {
  font-size: var(--text-small);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.last-used {
  font-size: var(--text-small);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.method-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
```

### 3. Status Indicator Component

```typescript
interface StatusIndicatorProps {
  status: 'active' | 'pending' | 'disabled' | 'error' | 'loading';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'medium',
  showLabel = true
}) => {
  const statusConfig = {
    active: { color: 'var(--success)', label: 'Active', icon: '●' },
    pending: { color: 'var(--warning)', label: 'Pending', icon: '●' },
    disabled: { color: 'var(--method-disabled)', label: 'Disabled', icon: '●' },
    error: { color: 'var(--error)', label: 'Error', icon: '●' },
    loading: { color: 'var(--secondary)', label: 'Loading', icon: '⏳' }
  };

  return (
    <div className={`status-indicator status-indicator--${size}`}>
      <span
        className="status-indicator__dot"
        style={{ color: statusConfig[status].color }}
      >
        {statusConfig[status].icon}
      </span>
      {showLabel && (
        <span className="status-indicator__label">
          {statusConfig[status].label}
        </span>
      )}
    </div>
  );
};
```

### 4. MFA Setup Progress

```typescript
interface SetupProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    label: string;
    description: string;
    completed: boolean;
  }>;
}

const MFASetupProgress: React.FC<SetupProgressProps> = ({
  currentStep,
  totalSteps,
  steps
}) => {
  return (
    <div className="mfa-setup-progress">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      <div className="progress-steps">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`progress-step ${
              index < currentStep ? 'completed' :
              index === currentStep ? 'active' : 'pending'
            }`}
          >
            <div className="step-indicator">
              {index < currentStep ? (
                <span className="step-check">✓</span>
              ) : (
                <span className="step-number">{index + 1}</span>
              )}
            </div>
            <div className="step-content">
              <div className="step-label">{step.label}</div>
              <div className="step-description">{step.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 5. Verification Code Input

```typescript
interface CodeInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
  error?: string;
  loading?: boolean;
}

const VerificationCodeInput: React.FC<CodeInputProps> = ({
  length,
  value,
  onChange,
  onComplete,
  error,
  loading
}) => {
  const inputs = useRef<HTMLInputElement[]>([]);

  const handleInputChange = (index: number, inputValue: string) => {
    if (!/^\d*$/.test(inputValue)) return; // Only digits

    const newValue = value.split('');
    newValue[index] = inputValue;
    const updatedValue = newValue.join('');

    onChange(updatedValue);

    // Auto-focus next input
    if (inputValue && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    // Check if complete
    if (updatedValue.length === length) {
      onComplete(updatedValue);
    }
  };

  return (
    <div className="verification-code-input">
      <div className={`code-inputs ${error ? 'code-inputs--error' : ''}`}>
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={el => inputs.current[index] = el!}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !value[index] && index > 0) {
                inputs.current[index - 1]?.focus();
              }
            }}
            className="code-input"
            disabled={loading}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {error && (
        <div className="code-input-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
        </div>
      )}

      {loading && (
        <div className="code-input-loading">
          <span className="loading-spinner">⏳</span>
          <span>Verifying...</span>
        </div>
      )}
    </div>
  );
};
```

```css
.verification-code-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.code-inputs {
  display: flex;
  gap: var(--space-2);
}

.code-inputs--error .code-input {
  border-color: var(--error);
}

.code-input {
  width: 48px;
  height: 56px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  background: white;
  transition: border-color 0.2s ease;
}

.code-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.code-input:disabled {
  background: var(--bg-subtle);
  color: var(--text-secondary);
}

.code-input-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--error);
  font-size: var(--text-small);
}

.code-input-loading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  font-size: var(--text-small);
}
```

### 6. Security Dashboard Summary

```typescript
interface SecuritySummaryProps {
  user: {
    mfaEnabled: boolean;
    methodsCount: number;
    lastLogin: Date;
    riskScore: number;
  };
  onEnableMFA: () => void;
  onManageMethods: () => void;
}

const SecurityDashboardSummary: React.FC<SecuritySummaryProps> = ({
  user,
  onEnableMFA,
  onManageMethods
}) => {
  const securityLevel = user.mfaEnabled ?
    (user.methodsCount >= 2 ? 'high' : 'medium') : 'low';

  const riskLevel = user.riskScore < 30 ? 'low' :
                   user.riskScore < 70 ? 'medium' : 'high';

  return (
    <div className="security-dashboard-summary">
      <div className="summary-header">
        <h2>Account Security</h2>
        <SecurityStatusBadge
          level={securityLevel}
          methodCount={user.methodsCount}
          showDetails
        />
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-icon">🔐</div>
          <div className="card-content">
            <div className="card-label">Multi-Factor Authentication</div>
            <div className="card-value">
              {user.mfaEnabled ? `${user.methodsCount} method${user.methodsCount !== 1 ? 's' : ''}` : 'Disabled'}
            </div>
            <div className="card-action">
              {user.mfaEnabled ? (
                <button className="btn btn--secondary" onClick={onManageMethods}>
                  Manage Methods
                </button>
              ) : (
                <button className="btn btn--primary" onClick={onEnableMFA}>
                  Enable MFA
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <div className="card-label">Risk Level</div>
            <div className="card-value">
              <span className={`risk-indicator risk-indicator--${riskLevel}`}>
                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
              </span>
            </div>
            <div className="card-description">
              Based on login patterns and security settings
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">🕐</div>
          <div className="card-content">
            <div className="card-label">Last Login</div>
            <div className="card-value">
              {formatRelativeTime(user.lastLogin)}
            </div>
            <div className="card-description">
              From trusted device
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 7. Method Selection Interface

```typescript
interface MethodSelectionProps {
  availableMethods: AuthMethod[];
  onMethodSelect: (method: AuthMethod) => void;
  recommendations?: string[];
}

const MethodSelectionGrid: React.FC<MethodSelectionProps> = ({
  availableMethods,
  onMethodSelect,
  recommendations = []
}) => {
  const methodDetails = {
    totp: {
      name: 'Authenticator App',
      description: 'Generate codes using an app on your phone',
      icon: '📱',
      securityLevel: 'High',
      setupTime: '2-3 minutes',
      requirements: ['Smartphone', 'Authenticator app']
    },
    email: {
      name: 'Email Codes',
      description: 'Receive verification codes via email',
      icon: '📧',
      securityLevel: 'Medium',
      setupTime: '1 minute',
      requirements: ['Email access']
    },
    sms: {
      name: 'SMS Codes',
      description: 'Receive codes via text message',
      icon: '💬',
      securityLevel: 'Medium',
      setupTime: '1 minute',
      requirements: ['Mobile phone']
    },
    hardware: {
      name: 'Hardware Key',
      description: 'Use a physical security key',
      icon: '🔑',
      securityLevel: 'Very High',
      setupTime: '2-5 minutes',
      requirements: ['Hardware security key']
    }
  };

  return (
    <div className="method-selection-grid">
      {availableMethods.map(method => {
        const details = methodDetails[method];
        const isRecommended = recommendations.includes(method);

        return (
          <button
            key={method}
            className={`method-selection-card ${isRecommended ? 'recommended' : ''}`}
            onClick={() => onMethodSelect(method)}
          >
            {isRecommended && (
              <div className="recommendation-badge">Recommended</div>
            )}

            <div className="method-icon">{details.icon}</div>

            <div className="method-content">
              <h3 className="method-name">{details.name}</h3>
              <p className="method-description">{details.description}</p>

              <div className="method-meta">
                <div className="security-level">
                  <span className="meta-label">Security:</span>
                  <span className={`security-badge security-badge--${details.securityLevel.toLowerCase().replace(' ', '-')}`}>
                    {details.securityLevel}
                  </span>
                </div>

                <div className="setup-time">
                  <span className="meta-label">Setup time:</span>
                  <span>{details.setupTime}</span>
                </div>
              </div>

              <div className="requirements">
                <span className="meta-label">Requires:</span>
                <ul className="requirements-list">
                  {details.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
```

### 8. Responsive Design Patterns

#### Mobile Adaptations

```css
/* Mobile-first responsive design */
.mfa-method-card {
  padding: var(--space-4);
}

.method-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.method-actions .btn {
  width: 100%;
  justify-content: center;
}

@media (min-width: 768px) {
  .mfa-method-card {
    padding: var(--space-5);
  }

  .method-actions {
    flex-direction: row;
    gap: var(--space-3);
  }

  .method-actions .btn {
    width: auto;
  }
}

/* Touch-friendly targets */
.method-selection-card {
  min-height: 120px;
  padding: var(--space-5);
  touch-action: manipulation;
}

.code-input {
  min-height: 56px;
  font-size: 1.25rem;
}

@media (max-width: 640px) {
  .code-inputs {
    gap: var(--space-1);
  }

  .code-input {
    width: 40px;
    height: 48px;
    font-size: 1.125rem;
  }
}
```

### 9. Accessibility Features

#### ARIA Labels and Descriptions

```typescript
const AccessibleMFAMethodCard = ({ method, ...props }) => {
  return (
    <div
      className="mfa-method-card"
      role="article"
      aria-labelledby={`method-${method.id}-label`}
      aria-describedby={`method-${method.id}-description`}
    >
      <h3 id={`method-${method.id}-label`}>
        {method.label} - {method.status}
      </h3>

      <div id={`method-${method.id}-description`}>
        {method.type} authentication method for {method.identifier}
        {method.lastUsed && `. Last used ${formatRelativeTime(method.lastUsed)}`}
      </div>

      <div role="group" aria-label="Method actions">
        <button aria-describedby={`method-${method.id}-edit-help`}>
          Edit
        </button>
        <div id={`method-${method.id}-edit-help`} className="sr-only">
          Edit settings for this authentication method
        </div>
      </div>
    </div>
  );
};
```

#### Screen Reader Optimizations

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus indicators */
.method-selection-card:focus,
.code-input:focus,
.btn:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .security-badge--high {
    border-width: 2px;
  }

  .status-indicator__dot {
    font-weight: bold;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 10. Interactive States and Animations

#### Loading States

```css
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

/* Skeleton loading for method cards */
.method-card-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

#### Micro-interactions

```css
/* Button press feedback */
.btn:active {
  transform: translateY(1px);
}

/* Card hover effects */
.mfa-method-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.mfa-method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Code input success animation */
.code-input--success {
  animation: success-flash 0.6s ease;
}

@keyframes success-flash {
  0% {
    border-color: var(--border-color);
  }
  50% {
    border-color: var(--success);
    background: rgba(5, 150, 105, 0.1);
  }
  100% {
    border-color: var(--success);
  }
}
```

### 11. Dark Mode Support

```css
:root[data-theme='dark'] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --bg-subtle: #3a3a3a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --border-color: #404040;
}

[data-theme='dark'] .mfa-method-card {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme='dark'] .code-input {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] .security-badge--high {
  background: rgba(16, 185, 129, 0.2);
}
```

This comprehensive UI component design system provides a consistent, accessible, and user-friendly interface for all MFA interactions while maintaining security best practices and supporting diverse user needs across different devices and accessibility requirements.

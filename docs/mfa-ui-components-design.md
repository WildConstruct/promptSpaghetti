# MFA Status Indicators and UI Components Design

**Task ID**: T-1752989143997-135  
**Created**: 2025-01-20  
**Author**: Epic18-QA-Agent

## Executive Summary

This document defines the comprehensive UI component library and status indicators for Multi-Factor Authentication (MFA) features in the PromptScape authentication system. The design establishes consistent visual patterns, interaction behaviors, and accessibility standards for all MFA-related user interface elements.

## Design System Integration

### Brand Alignment

- **Primary Colors**: Consistent with PromptScape brand palette
- **Security Colors**: Distinct palette for security-related actions
- **Typography**: System fonts with clear hierarchy
- **Iconography**: Consistent icon library with security-focused additions
- **Animation**: Subtle, purposeful animations that enhance usability

### Component Architecture

```typescript
interface MFADesignSystem {
  tokens: {
    colors: MFAColorPalette;
    spacing: SpacingScale;
    typography: TypographyScale;
    borders: BorderTokens;
    shadows: ShadowTokens;
    animations: AnimationTokens;
  };

  components: {
    indicators: StatusIndicatorComponents;
    inputs: MFAInputComponents;
    displays: InformationDisplayComponents;
    actions: ActionComponents;
    feedback: FeedbackComponents;
  };

  patterns: {
    layouts: MFALayoutPatterns;
    flows: InteractionFlows;
    states: ComponentStates;
  };
}
```

## Color Palette and Visual Language

### MFA-Specific Color System

```typescript
interface MFAColorPalette {
  security: {
    // Success states
    secure: '#10B981'; // Green-500 - MFA enabled, verified
    verified: '#059669'; // Green-600 - Recently verified
    protected: '#047857'; // Green-700 - High security state

    // Warning states
    attention: '#F59E0B'; // Amber-500 - Needs attention
    expiring: '#D97706'; // Amber-600 - Code/session expiring
    caution: '#B45309'; // Amber-700 - Reduced security

    // Error states
    error: '#EF4444'; // Red-500 - Failed verification
    blocked: '#DC2626'; // Red-600 - Account locked
    critical: '#B91C1C'; // Red-700 - Security breach

    // Neutral states
    disabled: '#6B7280'; // Gray-500 - MFA not enabled
    pending: '#8B5CF6'; // Purple-500 - Setup in progress
    inactive: '#9CA3AF'; // Gray-400 - Inactive method
  };

  method: {
    totp: '#3B82F6'; // Blue-500 - Authenticator apps
    sms: '#10B981'; // Green-500 - SMS verification
    email: '#8B5CF6'; // Purple-500 - Email verification
    recovery: '#F59E0B'; // Amber-500 - Recovery codes
    backup: '#6B7280'; // Gray-500 - Backup methods
  };

  interaction: {
    primary: '#2563EB'; // Blue-600 - Primary actions
    secondary: '#4B5563'; // Gray-600 - Secondary actions
    destructive: '#DC2626'; // Red-600 - Dangerous actions
    focus: '#3B82F6'; // Blue-500 - Focus states
    hover: '#1E40AF'; // Blue-700 - Hover states
  };
}
```

### Icon System

```typescript
interface MFAIconLibrary {
  security: {
    shield: 'shield-check'; // General security
    mfa: 'smartphone'; // MFA general
    totp: 'mobile'; // TOTP/Authenticator
    sms: 'message-circle'; // SMS verification
    email: 'mail'; // Email verification
    recovery: 'key'; // Recovery codes
    backup: 'copy'; // Backup methods
  };

  status: {
    enabled: 'check-circle'; // MFA enabled
    disabled: 'x-circle'; // MFA disabled
    verified: 'check-circle-2'; // Recently verified
    pending: 'clock'; // Verification pending
    expired: 'alert-circle'; // Session/code expired
    locked: 'lock'; // Account locked
    warning: 'alert-triangle'; // Attention needed
  };

  actions: {
    setup: 'plus-circle'; // Setup MFA
    verify: 'shield-check'; // Verify code
    refresh: 'refresh-cw'; // Refresh/resend
    edit: 'edit-2'; // Edit settings
    delete: 'trash-2'; // Remove method
    view: 'eye'; // View codes
    copy: 'copy'; // Copy code
  };
}
```

## Core Status Indicator Components

### 1. MFA Enable Status Badge

```typescript
interface MFAStatusBadge {
  props: {
    status: 'enabled' | 'disabled' | 'required' | 'pending';
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'compact' | 'detailed';
    showIcon?: boolean;
    clickable?: boolean;
  };

  states: {
    enabled: {
      icon: 'shield-check';
      color: 'security.secure';
      text: 'Protected';
      description: 'Two-factor authentication is active';
    };
    disabled: {
      icon: 'shield-x';
      color: 'security.disabled';
      text: 'Not Protected';
      description: 'Two-factor authentication is disabled';
    };
    required: {
      icon: 'alert-triangle';
      color: 'security.attention';
      text: 'Required';
      description: 'Two-factor authentication must be enabled';
    };
    pending: {
      icon: 'clock';
      color: 'security.pending';
      text: 'Setup in Progress';
      description: 'Two-factor authentication setup is incomplete';
    };
  };
}
```

**React Component Implementation:**

```tsx
interface MFAStatusBadgeProps {
  status: 'enabled' | 'disabled' | 'required' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
  showIcon?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export const MFAStatusBadge: React.FC<MFAStatusBadgeProps> = ({
  status,
  size = 'md',
  variant = 'default',
  showIcon = true,
  clickable = false,
  onClick,
}) => {
  const config = getMFAStatusConfig(status);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium',
        'transition-colors duration-200',
        {
          'cursor-pointer hover:opacity-80': clickable,
          'px-2 py-1 text-xs': size === 'sm',
          'px-4 py-2 text-base': size === 'lg',
        },
        getStatusColorClasses(status)
      )}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {showIcon && (
        <Icon name={config.icon} className={cn('h-4 w-4', { 'h-3 w-3': size === 'sm', 'h-5 w-5': size === 'lg' })} />
      )}

      <span>{config.text}</span>

      {variant === 'detailed' && <span className="text-xs opacity-75">{config.description}</span>}
    </div>
  );
};
```

### 2. Method Status Indicators

```typescript
interface MethodStatusIndicator {
  props: {
    method: 'totp' | 'sms' | 'email' | 'recovery';
    status: 'active' | 'inactive' | 'verified' | 'failed' | 'expired';
    lastUsed?: Date;
    showLastUsed?: boolean;
    compact?: boolean;
  };

  variants: {
    active: {
      appearance: 'solid';
      color: 'method[method]';
      icon: 'check-circle';
      pulse: false;
    };
    verified: {
      appearance: 'solid';
      color: 'security.verified';
      icon: 'check-circle-2';
      pulse: true;
      duration: 3000; // Show for 3 seconds
    };
    failed: {
      appearance: 'solid';
      color: 'security.error';
      icon: 'x-circle';
      shake: true;
    };
    expired: {
      appearance: 'outline';
      color: 'security.attention';
      icon: 'clock';
      pulse: false;
    };
    inactive: {
      appearance: 'ghost';
      color: 'security.inactive';
      icon: 'circle';
      pulse: false;
    };
  };
}
```

### 3. Verification Code Input Component

```typescript
interface VerificationCodeInput {
  props: {
    length: number; // 6 for TOTP, 4-8 for SMS
    type: 'numeric' | 'alphanumeric';
    autoFocus?: boolean;
    autoSubmit?: boolean;
    disabled?: boolean;
    error?: string;
    loading?: boolean;
    onComplete: (code: string) => void;
    onResend?: () => void;
  };

  features: {
    autoAdvance: boolean; // Move to next input on digit entry
    backspaceManagement: boolean; // Handle backspace across inputs
    pasteHandling: boolean; // Handle pasted codes
    accessibility: boolean; // Screen reader support
    mobileOptimization: boolean; // Numeric keyboard on mobile
  };
}
```

**React Component Implementation:**

```tsx
export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  length = 6,
  type = 'numeric',
  autoFocus = true,
  autoSubmit = true,
  disabled = false,
  error,
  loading = false,
  onComplete,
  onResend,
}) => {
  const [values, setValues] = useState<string[]>(new Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    if (disabled || loading) return;

    // Validate input based on type
    const sanitizedValue =
      type === 'numeric' ? value.replace(/[^0-9]/g, '') : value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (sanitizedValue.length <= 1) {
      const newValues = [...values];
      newValues[index] = sanitizedValue;
      setValues(newValues);

      // Auto-advance to next input
      if (sanitizedValue && index < length - 1) {
        setActiveIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when complete
      if (autoSubmit && newValues.every(v => v) && newValues.join('').length === length) {
        onComplete(newValues.join(''));
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    const sanitizedData =
      type === 'numeric' ? pastedData.replace(/[^0-9]/g, '') : pastedData.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    const newValues = sanitizedData.split('').slice(0, length);
    while (newValues.length < length) {
      newValues.push('');
    }

    setValues(newValues);

    if (autoSubmit && newValues.every(v => v)) {
      onComplete(newValues.join(''));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={el => (inputRefs.current[index] = el)}
            type={type === 'numeric' ? 'tel' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            pattern={type === 'numeric' ? '[0-9]*' : '[a-zA-Z0-9]*'}
            maxLength={1}
            value={values[index]}
            disabled={disabled || loading}
            autoFocus={autoFocus && index === 0}
            className={cn(
              'h-12 w-10 text-center text-lg font-semibold border-2 rounded-lg',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              {
                'border-gray-300': !error,
                'border-red-500': error,
                'bg-gray-50': disabled,
                'cursor-not-allowed': disabled || loading,
              }
            )}
            onChange={e => handleInputChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setActiveIndex(index)}
            aria-label={`Verification code digit ${index + 1}`}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center justify-center gap-2 text-sm text-red-600">
          <Icon name="alert-circle" className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {onResend && (
        <div className="text-center">
          <button
            type="button"
            onClick={onResend}
            disabled={disabled || loading}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            Didn't receive a code? Resend
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};
```

### 4. MFA Method Selection Card

```typescript
interface MFAMethodCard {
  props: {
    method: 'totp' | 'sms' | 'email';
    title: string;
    description: string;
    recommended?: boolean;
    enabled?: boolean;
    configured?: boolean;
    lastUsed?: Date;
    onSelect?: () => void;
    onConfigure?: () => void;
    onDisable?: () => void;
    variant?: 'selection' | 'management' | 'compact';
  };

  states: {
    default: 'border-gray-200 hover:border-gray-300';
    selected: 'border-blue-500 bg-blue-50';
    recommended: 'border-green-500 bg-green-50';
    configured: 'border-green-200 bg-green-25';
    disabled: 'border-gray-100 bg-gray-50 opacity-60';
  };
}
```

**React Component Implementation:**

```tsx
export const MFAMethodCard: React.FC<MFAMethodCardProps> = ({
  method,
  title,
  description,
  recommended = false,
  enabled = false,
  configured = false,
  lastUsed,
  onSelect,
  onConfigure,
  onDisable,
  variant = 'selection',
}) => {
  const methodConfig = getMFAMethodConfig(method);

  return (
    <div
      className={cn('relative rounded-lg border-2 p-4 transition-all duration-200', 'cursor-pointer hover:shadow-md', {
        'border-gray-200 hover:border-gray-300': !enabled && !recommended,
        'border-blue-500 bg-blue-50': enabled,
        'border-green-500 bg-green-50': recommended,
        'border-green-200': configured,
      })}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect?.()}
    >
      {recommended && (
        <div className="absolute -top-2 left-4">
          <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">Recommended</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 rounded-full p-2', `bg-${methodConfig.color}-100`)}>
          <Icon name={methodConfig.icon} className={cn('h-6 w-6', `text-${methodConfig.color}-600`)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {configured && <MFAStatusBadge status="enabled" size="sm" />}
          </div>

          <p className="text-sm text-gray-600 mt-1">{description}</p>

          {lastUsed && variant === 'management' && (
            <p className="text-xs text-gray-500 mt-2">Last used: {formatRelativeTime(lastUsed)}</p>
          )}

          {variant === 'management' && (
            <div className="flex gap-2 mt-3">
              {!configured ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    onConfigure?.();
                  }}
                >
                  <Icon name="plus" className="h-4 w-4 mr-1" />
                  Set Up
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    onDisable?.();
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Icon name="trash-2" className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>

        {variant === 'selection' && (
          <div className="flex-shrink-0">
            <div
              className={cn('w-5 h-5 rounded-full border-2 transition-colors', {
                'border-gray-300': !enabled,
                'border-blue-500 bg-blue-500': enabled,
              })}
            >
              {enabled && <Icon name="check" className="h-3 w-3 text-white m-0.5" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 5. Security Level Indicator

```typescript
interface SecurityLevelIndicator {
  props: {
    level: 'basic' | 'standard' | 'high' | 'maximum';
    showDetails?: boolean;
    compact?: boolean;
  };

  levels: {
    basic: {
      score: 1;
      color: 'security.attention';
      description: 'Password only';
      recommendation: 'Enable two-factor authentication';
    };
    standard: {
      score: 2;
      color: 'security.secure';
      description: 'Password + one 2FA method';
      recommendation: 'Add a backup authentication method';
    };
    high: {
      score: 3;
      color: 'security.verified';
      description: 'Password + multiple 2FA methods';
      recommendation: 'Consider hardware security keys';
    };
    maximum: {
      score: 4;
      color: 'security.protected';
      description: 'Password + 2FA + hardware keys';
      recommendation: 'Excellent security posture';
    };
  };
}
```

### 6. Recovery Codes Display Component

```typescript
interface RecoveryCodesDisplay {
  props: {
    codes: string[];
    usedCodes?: number[];
    showUsed?: boolean;
    allowCopy?: boolean;
    allowDownload?: boolean;
    onCodeUsed?: (codeIndex: number) => void;
    variant?: 'grid' | 'list' | 'compact';
  };

  features: {
    codeObfuscation: boolean; // Hide codes until interaction
    copyIndividual: boolean; // Copy individual codes
    copyAll: boolean; // Copy all unused codes
    downloadTxt: boolean; // Download as text file
    printFriendly: boolean; // Print-optimized view
    usageTracking: boolean; // Visual indication of used codes
  };
}
```

## Specialized UI Components

### 7. MFA Setup Progress Indicator

```tsx
interface MFASetupProgress {
  steps: [
    { id: 'method'; title: 'Choose Method'; completed: boolean },
    { id: 'configure'; title: 'Configure'; completed: boolean },
    { id: 'verify'; title: 'Verify'; completed: boolean },
    { id: 'backup'; title: 'Save Backup Codes'; completed: boolean },
  ];
  currentStep: string;
  allowJump?: boolean;
}

export const MFASetupProgress: React.FC<MFASetupProgressProps> = ({ steps, currentStep, allowJump = false }) => {
  return (
    <nav aria-label="MFA setup progress">
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isPast = steps.findIndex(s => s.id === currentStep) > index;
          const isAccessible = allowJump || isPast || isActive;

          return (
            <li key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                  'transition-colors duration-200',
                  {
                    'bg-blue-600 text-white': isActive,
                    'bg-green-600 text-white': step.completed,
                    'bg-gray-200 text-gray-600': !isActive && !step.completed,
                    'cursor-pointer hover:bg-blue-100': isAccessible,
                  }
                )}
                role={isAccessible ? 'button' : undefined}
                tabIndex={isAccessible ? 0 : undefined}
              >
                {step.completed ? <Icon name="check" className="h-4 w-4" /> : <span>{index + 1}</span>}
              </div>

              <span
                className={cn('ml-2 text-sm font-medium', {
                  'text-blue-600': isActive,
                  'text-green-600': step.completed,
                  'text-gray-500': !isActive && !step.completed,
                })}
              >
                {step.title}
              </span>

              {index < steps.length - 1 && (
                <div className="w-16 h-0.5 mx-4 bg-gray-200">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      step.completed ? 'bg-green-600 w-full' : 'bg-transparent w-0'
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
```

### 8. QR Code Display Component

```tsx
interface QRCodeDisplayProps {
  qrCodeUrl: string;
  manualEntryCode: string;
  expiresAt: Date;
  onRefresh: () => void;
  showManualEntry?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCodeUrl,
  manualEntryCode,
  expiresAt,
  onRefresh,
  showManualEntry = false,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showManual, setShowManual] = useState(showManualEntry);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, expiresAt.getTime() - Date.now());
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Timer */}
      <div className="text-center">
        <div
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
            timeRemaining < 120000 // Less than 2 minutes
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          )}
        >
          <Icon name="clock" className="h-4 w-4" />
          <span>Expires in {formatTime(timeRemaining)}</span>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="relative">
          <img
            src={qrCodeUrl}
            alt="QR code for authenticator app setup"
            className="w-64 h-64 border border-gray-200 rounded-lg"
          />

          {timeRemaining === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <Button onClick={onRefresh} variant="outline" className="bg-white">
                <Icon name="refresh-cw" className="h-4 w-4 mr-2" />
                Get New Code
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Toggle */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowManual(!showManual)}
          className="text-sm text-blue-600 hover:text-blue-700 underline"
        >
          {showManual ? 'Hide manual entry code' : "Can't scan? Enter code manually"}
        </button>
      </div>

      {/* Manual Entry Code */}
      {showManual && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Manual Entry Code</h4>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
              {manualEntryCode.match(/.{1,4}/g)?.join(' ')}
            </code>
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(manualEntryCode)}>
              <Icon name="copy" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 9. MFA Login Challenge Component

```tsx
interface MFALoginChallengeProps {
  availableMethods: Array<{
    id: string;
    type: 'totp' | 'sms' | 'email';
    title: string;
    description: string;
    primary?: boolean;
  }>;
  selectedMethod: string;
  onMethodChange: (methodId: string) => void;
  onVerify: (code: string) => void;
  onResend?: () => void;
  error?: string;
  loading?: boolean;
}

export const MFALoginChallenge: React.FC<MFALoginChallengeProps> = ({
  availableMethods,
  selectedMethod,
  onMethodChange,
  onVerify,
  onResend,
  error,
  loading = false,
}) => {
  const currentMethod = availableMethods.find(m => m.id === selectedMethod);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Icon name="shield-check" className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
        <p className="text-sm text-gray-600 mt-1">Enter your verification code to continue</p>
      </div>

      {/* Method Selection */}
      {availableMethods.length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Verification method</label>
          <div className="grid gap-2">
            {availableMethods.map(method => (
              <label
                key={method.id}
                className={cn(
                  'flex items-center gap-3 p-3 border rounded-lg cursor-pointer',
                  'transition-colors duration-200',
                  {
                    'border-blue-500 bg-blue-50': method.id === selectedMethod,
                    'border-gray-200 hover:border-gray-300': method.id !== selectedMethod,
                  }
                )}
              >
                <input
                  type="radio"
                  name="mfa-method"
                  value={method.id}
                  checked={method.id === selectedMethod}
                  onChange={e => onMethodChange(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={cn('w-4 h-4 rounded-full border-2 transition-colors', {
                    'border-blue-500 bg-blue-500': method.id === selectedMethod,
                    'border-gray-300': method.id !== selectedMethod,
                  })}
                >
                  {method.id === selectedMethod && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{method.title}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Verification Input */}
      <div className="space-y-4">
        {currentMethod && (
          <VerificationCodeInput
            length={currentMethod.type === 'totp' ? 6 : 6}
            type={currentMethod.type === 'totp' ? 'numeric' : 'numeric'}
            onComplete={onVerify}
            onResend={currentMethod.type !== 'totp' ? onResend : undefined}
            error={error}
            loading={loading}
            autoFocus
            autoSubmit
          />
        )}
      </div>

      {/* Help Links */}
      <div className="text-center space-y-2">
        <button type="button" className="text-sm text-blue-600 hover:text-blue-700 underline">
          Use a recovery code instead
        </button>
        <div className="text-xs text-gray-500">
          Having trouble?{' '}
          <a href="/support" className="underline">
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
};
```

## State Management and Data Flow

### Component State Types

```typescript
interface MFAComponentStates {
  // Global MFA state
  mfaEnabled: boolean;
  primaryMethod: 'totp' | 'sms' | 'email' | null;
  backupMethods: string[];
  recoveryCodes: {
    total: number;
    remaining: number;
  };

  // UI state
  showingSetup: boolean;
  setupStep: 'method' | 'configure' | 'verify' | 'backup';
  selectedMethod: string;
  verificationInProgress: boolean;

  // Error states
  setupError: string | null;
  verificationError: string | null;
  networkError: boolean;

  // Loading states
  loading: boolean;
  submitting: boolean;
  resending: boolean;
}
```

### Context Provider Pattern

```tsx
interface MFAContextValue {
  state: MFAComponentStates;
  actions: {
    startSetup: (method: string) => Promise<void>;
    verifySetup: (code: string) => Promise<void>;
    completeSetup: () => Promise<void>;
    cancelSetup: () => void;

    verifyLogin: (code: string) => Promise<void>;
    resendCode: () => Promise<void>;
    switchMethod: (method: string) => void;

    updateSettings: (settings: Partial<MFASettings>) => Promise<void>;
    regenerateRecoveryCodes: () => Promise<void>;
    downloadRecoveryCodes: () => void;
  };

  utils: {
    formatMethod: (method: string) => string;
    getMethodIcon: (method: string) => string;
    getSecurityLevel: () => 'basic' | 'standard' | 'high' | 'maximum';
    isMethodConfigured: (method: string) => boolean;
  };
}

export const MFAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MFAComponentStates>(initialState);

  const actions = useMemo(
    () => ({
      startSetup: async (method: string) => {
        setState(prev => ({ ...prev, loading: true, setupError: null }));
        try {
          const response = await mfaService.startSetup(method);
          setState(prev => ({
            ...prev,
            showingSetup: true,
            setupStep: 'configure',
            selectedMethod: method,
            loading: false,
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            setupError: error.message,
            loading: false,
          }));
        }
      },

      // ... other actions
    }),
    []
  );

  const value = useMemo(
    () => ({
      state,
      actions,
      utils: {
        formatMethod: (method: string) => methodLabels[method] || method,
        getMethodIcon: (method: string) => methodIcons[method] || 'circle',
        getSecurityLevel: () => calculateSecurityLevel(state),
        isMethodConfigured: (method: string) => state.primaryMethod === method || state.backupMethods.includes(method),
      },
    }),
    [state, actions]
  );

  return <MFAContext.Provider value={value}>{children}</MFAContext.Provider>;
};
```

## Responsive Design Patterns

### Breakpoint Strategy

```typescript
interface MFAResponsiveBreakpoints {
  mobile: '320px - 767px'; // Single column, simplified UI
  tablet: '768px - 1023px'; // Two column where appropriate
  desktop: '1024px+'; // Full featured UI
}

interface ResponsivePatterns {
  methodSelection: {
    mobile: 'vertical-stack';
    tablet: 'two-column-grid';
    desktop: 'three-column-grid';
  };

  setupFlow: {
    mobile: 'full-screen-modal';
    tablet: 'centered-modal';
    desktop: 'sidebar-modal';
  };

  statusDisplays: {
    mobile: 'compact-badges';
    tablet: 'detailed-cards';
    desktop: 'expanded-cards';
  };
}
```

### Mobile-First Component Adaptations

```tsx
export const ResponsiveMFAMethodCard = ({ method, ...props }) => {
  const { isMobile, isTablet } = useBreakpoints();

  if (isMobile) {
    return (
      <div className="w-full p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <Icon name={method.icon} className="h-8 w-8" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{method.title}</h3>
            <p className="text-sm text-gray-600 truncate">{method.description}</p>
          </div>
          <MFAStatusBadge status={method.status} size="sm" />
        </div>
      </div>
    );
  }

  return <MFAMethodCard method={method} {...props} />;
};
```

## Accessibility Implementation

### ARIA Labels and Roles

```typescript
interface MFAAccessibilityAttributes {
  landmarks: {
    main: 'main';
    navigation: 'navigation';
    complementary: 'complementary';
    banner: 'banner';
  };

  labels: {
    mfaStatus: 'Multi-factor authentication status';
    methodSelection: 'Choose authentication method';
    codeInput: 'Enter verification code';
    setupProgress: 'MFA setup progress';
  };

  descriptions: {
    totp: 'Time-based one-time password from authenticator app';
    sms: 'Verification code sent via text message';
    email: 'Verification code sent via email';
    recovery: 'Single-use backup code';
  };

  announcements: {
    setupStarted: 'MFA setup has started';
    codeVerified: 'Verification successful';
    errorOccurred: 'An error occurred: {error}';
    methodChanged: 'Authentication method changed to {method}';
  };
}
```

### Screen Reader Optimizations

```tsx
export const AccessibleMFAComponent = () => {
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  return (
    <div role="main" aria-labelledby="mfa-title">
      <h1 id="mfa-title" className="sr-only">
        Multi-Factor Authentication Settings
      </h1>

      {/* Live region for dynamic announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="mfa-announcements" />

      {/* Component content */}
    </div>
  );
};
```

## Performance Optimizations

### Component Loading Strategy

```typescript
interface MFAPerformanceStrategy {
  lazyLoading: {
    setupModal: 'React.lazy(() => import("./MFASetupModal"))';
    qrCodeGenerator: 'Dynamic import on demand';
    recoveryCodesDisplay: 'Load when needed';
  };

  caching: {
    methodConfiguration: 'React.useMemo';
    statusCalculations: 'Memoized selectors';
    iconComponents: 'Pre-loaded sprite';
  };

  bundleSplitting: {
    core: 'Status indicators and basic components';
    setup: 'Setup flow components';
    management: 'Settings and management UI';
  };
}
```

### Optimized Asset Loading

```typescript
interface MFAAssetOptimization {
  icons: {
    format: 'SVG sprite';
    loading: 'Preload critical icons';
    fallback: 'Text labels for failed loads';
  };

  qrCodes: {
    generation: 'Server-side with caching';
    delivery: 'Base64 data URLs';
    optimization: 'Minimal redundancy';
  };

  animations: {
    preference: 'Respect prefers-reduced-motion';
    implementation: 'CSS transforms only';
    fallback: 'Instant state changes';
  };
}
```

## Testing Strategy

### Component Testing Requirements

```typescript
interface MFAComponentTests {
  unit: {
    statusBadge: [
      'renders_correct_status',
      'shows_appropriate_colors',
      'handles_click_events',
      'supports_keyboard_navigation',
    ];

    codeInput: [
      'accepts_valid_codes',
      'rejects_invalid_characters',
      'handles_paste_events',
      'manages_focus_correctly',
      'triggers_completion_callback',
    ];

    methodCard: [
      'displays_method_information',
      'shows_configuration_status',
      'handles_selection_events',
      'supports_accessibility_features',
    ];
  };

  integration: {
    setupFlow: ['completes_totp_setup', 'handles_setup_errors', 'validates_user_input', 'maintains_session_state'];

    loginChallenge: [
      'verifies_valid_codes',
      'handles_expired_codes',
      'switches_between_methods',
      'provides_error_feedback',
    ];
  };

  accessibility: {
    screenReader: [
      'announces_status_changes',
      'provides_element_descriptions',
      'maintains_focus_management',
      'supports_keyboard_navigation',
    ];

    visuallyImpaired: [
      'high_contrast_support',
      'zoom_compatibility',
      'text_scaling_support',
      'color_independent_information',
    ];
  };
}
```

### Visual Regression Testing

```typescript
interface MFAVisualTests {
  scenarios: [
    'mfa_disabled_state',
    'mfa_enabled_with_totp',
    'mfa_setup_in_progress',
    'verification_code_input',
    'error_states_display',
    'mobile_responsive_layout',
    'dark_mode_compatibility',
  ];

  browsers: ['Chrome', 'Firefox', 'Safari', 'Edge'];
  devices: ['Desktop', 'Tablet', 'Mobile'];
  themes: ['Light', 'Dark', 'High Contrast'];
}
```

## Implementation Roadmap

### Phase 1: Core Components (Week 1)

- [ ] MFA Status Badge
- [ ] Method Status Indicators
- [ ] Basic Method Selection Cards
- [ ] Verification Code Input
- [ ] Error State Components

### Phase 2: Advanced Components (Week 2)

- [ ] QR Code Display Component
- [ ] Recovery Codes Display
- [ ] Security Level Indicator
- [ ] Setup Progress Indicator
- [ ] Login Challenge Component

### Phase 3: Integration and Polish (Week 3)

- [ ] Context Provider Implementation
- [ ] Responsive Design Refinements
- [ ] Accessibility Enhancements
- [ ] Performance Optimizations
- [ ] Animation and Micro-interactions

### Phase 4: Testing and Documentation (Week 4)

- [ ] Component Testing Suite
- [ ] Visual Regression Tests
- [ ] Accessibility Audits
- [ ] Storybook Documentation
- [ ] Usage Guidelines

## Conclusion

This comprehensive UI component design provides a complete visual language and interaction pattern library for Multi-Factor Authentication features. The components are designed to be accessible, performant, and consistent with modern design standards while maintaining security-focused user experience principles.

The modular architecture allows for flexible implementation and easy maintenance, while the detailed specifications ensure consistent behavior across all MFA-related interfaces in the PromptScape application.

# Visual Password Strength Indicator

## Overview

The Password Strength Indicator provides real-time visual feedback for password strength as users type. It integrates seamlessly with the Password Complexity Validator to provide comprehensive security feedback and user guidance.

## Features

- **Real-time validation** with debounced updates
- **Visual strength meter** with color-coded progress bar
- **Detailed rule breakdown** showing which requirements are met
- **Intelligent suggestions** for password improvement
- **Entropy and crack time estimates** for security awareness
- **Compact and full display modes** for different UI contexts
- **Theme support** (light, dark, auto-detection)
- **Accessibility compliant** with ARIA labels and semantic markup
- **Customizable configuration** supporting different validation rules

## Basic Usage

### Simple Implementation

```tsx
import { PasswordStrengthIndicator } from '@promptscape/core/components/PasswordStrengthIndicator';

function PasswordForm() {
  const [password, setPassword] = useState('');

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Enter your password"
      />

      <PasswordStrengthIndicator
        password={password}
        showDetails={true}
        showSuggestions={true}
      />
    </div>
  );
}
```

### Advanced Implementation with Context

```tsx
import {
  PasswordStrengthIndicator,
  PasswordComplexityValidator
} from '@promptscape/core/auth';

function AdvancedPasswordForm() {
  const [password, setPassword] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  // Custom validator with strict rules
  const validator = useMemo(
    () => new PasswordComplexityValidator({ mode: 'strict' }),
    []
  );

  // User context for personal information checking
  const userContext = {
    username: 'johndoe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    organizationName: 'Acme Corp'
  };

  const handleValidationChange = result => {
    setValidationResult(result);
    console.log('Password strength:', result.strength);
    console.log('Security score:', result.score);
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="Enter a strong password"
        />
      </div>

      <PasswordStrengthIndicator
        password={password}
        context={userContext}
        validator={validator}
        showDetails={true}
        showSuggestions={true}
        showCrackTime={true}
        showEntropy={true}
        onValidationChange={handleValidationChange}
        theme="auto"
      />

      {validationResult && (
        <div className="text-sm text-gray-600">
          Password meets {validationResult.passedRules} of{' '}
          {validationResult.totalRules} requirements
        </div>
      )}
    </div>
  );
}
```

## Component Props

### PasswordStrengthIndicator Props

| Prop                 | Type                                         | Default                             | Description                              |
| -------------------- | -------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| `password`           | `string`                                     | **required**                        | The password to validate                 |
| `context`            | `PasswordValidationContext`                  | `undefined`                         | User context for personalized validation |
| `validator`          | `PasswordComplexityValidator`                | `new PasswordComplexityValidator()` | Custom validator instance                |
| `showDetails`        | `boolean`                                    | `true`                              | Show detailed rule breakdown             |
| `showSuggestions`    | `boolean`                                    | `true`                              | Show improvement suggestions             |
| `showCrackTime`      | `boolean`                                    | `false`                             | Show estimated crack times               |
| `showEntropy`        | `boolean`                                    | `false`                             | Show password entropy                    |
| `compact`            | `boolean`                                    | `false`                             | Use compact display mode                 |
| `theme`              | `'light' \| 'dark' \| 'auto'`                | `'auto'`                            | Visual theme                             |
| `className`          | `string`                                     | `''`                                | Additional CSS classes                   |
| `onValidationChange` | `(result: PasswordValidationResult) => void` | `undefined`                         | Validation result callback               |
| `debounceMs`         | `number`                                     | `300`                               | Validation debounce delay                |

### PasswordValidationContext

```typescript
interface PasswordValidationContext {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  previousPasswords?: string[];
  commonPasswords?: string[];
  personalInfo?: string[];
  organizationName?: string;
  userRole?: string;
  locale?: string;
}
```

## Display Modes

### Full Mode (Default)

Shows complete password analysis with:

- Visual strength meter with color coding
- Detailed rule breakdown with pass/fail indicators
- Improvement suggestions
- Error and warning messages
- Optional entropy and crack time estimates

```tsx
<PasswordStrengthIndicator
  password={password}
  showDetails={true}
  showSuggestions={true}
  showCrackTime={true}
  showEntropy={true}
/>
```

### Compact Mode

Minimalist display for tight UI spaces:

- Small progress bar
- Strength label only
- No detailed breakdown

```tsx
<PasswordStrengthIndicator password={password} compact={true} />
```

## Customization

### Custom Validator Configuration

```tsx
import { PasswordComplexityValidator } from '@promptscape/core/auth';

// Strict enterprise policy
const strictValidator = new PasswordComplexityValidator({
  mode: 'strict',
  minimumScore: 85,
  rules: [
    PasswordRules.minLength(12),
    PasswordRules.requireUppercase(2),
    PasswordRules.requireLowercase(2),
    PasswordRules.requireDigits(2),
    PasswordRules.requireSpecialChars(2),
    PasswordRules.noPersonalInfo(),
    PasswordRules.notInHistory(10),
    PasswordRules.minimumEntropy(60)
  ]
});

// Lenient consumer policy
const lenientValidator = new PasswordComplexityValidator({
  mode: 'lenient',
  minimumScore: 50,
  rules: [
    PasswordRules.minLength(6),
    PasswordRules.requireUppercase(1),
    PasswordRules.requireLowercase(1),
    PasswordRules.requireDigits(1)
  ]
});
```

### Custom Styling

```css
/* Custom theme colors */
.password-strength-indicator {
  --strength-very-weak: #dc2626;
  --strength-weak: #ea580c;
  --strength-fair: #d97706;
  --strength-good: #65a30d;
  --strength-strong: #16a34a;
  --strength-very-strong: #059669;
}

/* Dark theme overrides */
.dark .password-strength-indicator {
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --background: #1f2937;
  --border: #374151;
}

/* Compact styling */
.password-strength-indicator.compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
```

## Hook Usage

### usePasswordStrength Hook

For advanced use cases where you need direct access to validation results:

```tsx
import { usePasswordStrength } from '@promptscape/core/components/PasswordStrengthIndicator';

function CustomPasswordField() {
  const [password, setPassword] = useState('');

  const {
    result,
    isValidating,
    isValid,
    score,
    strength,
    suggestions,
    errors
  } = usePasswordStrength(password);

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className={`border ${isValid ? 'border-green-500' : 'border-red-500'}`}
      />

      <div className="mt-2">
        {isValidating && <span>Checking...</span>}
        {!isValidating && (
          <>
            <div>Strength: {strength}</div>
            <div>Score: {score}/100</div>
            {errors.length > 0 && (
              <div className="text-red-600">
                {errors.map(error => (
                  <div key={error}>{error}</div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

## Visual Design

### Strength Colors

The component uses a graduated color scheme to indicate password strength:

| Strength    | Score Range | Color                   | Description           |
| ----------- | ----------- | ----------------------- | --------------------- |
| Very Weak   | 0-19        | `#dc2626` (Red 600)     | Easily crackable      |
| Weak        | 20-39       | `#ea580c` (Orange 600)  | Vulnerable to attacks |
| Fair        | 40-59       | `#d97706` (Amber 600)   | Some resistance       |
| Good        | 60-79       | `#65a30d` (Lime 600)    | Reasonably secure     |
| Strong      | 80-89       | `#16a34a` (Green 600)   | Very secure           |
| Very Strong | 90-100      | `#059669` (Emerald 600) | Extremely secure      |

### Progress Bar

- Animated transitions for smooth visual feedback
- Minimum 5% width for visibility even with very weak passwords
- Rounded corners for modern appearance
- Height adapts to compact vs. full mode

### Rule Status Indicators

- ✅ Green dot for passed rules
- ❌ Red dot for failed rules
- Score displayed for each rule (0-10 scale)
- Clear, actionable messaging

## Accessibility

### ARIA Support

The component includes comprehensive accessibility features:

```tsx
// Automatic ARIA labeling
<div
  role="progressbar"
  aria-label="Password strength"
  aria-valuenow={score}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext={`${strength} password, ${score} out of 100`}
>
  {/* Progress bar */}
</div>

// Screen reader announcements
<div aria-live="polite" aria-atomic="true">
  {validationResult && (
    <span className="sr-only">
      Password strength updated: {validationResult.strength}
    </span>
  )}
</div>
```

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators are clearly visible
- Tab order follows logical flow

### Color Accessibility

- High contrast ratios meeting WCAG 2.1 AA standards
- Text labels accompany color coding
- Pattern/shape differentiation beyond color

## Performance Optimization

### Debouncing

Validation is debounced to prevent excessive API calls:

```tsx
// Default 300ms debounce
<PasswordStrengthIndicator password={password} />

// Custom debounce timing
<PasswordStrengthIndicator
  password={password}
  debounceMs={500} // 500ms delay
/>

// Immediate validation (no debounce)
<PasswordStrengthIndicator
  password={password}
  debounceMs={0}
/>
```

### Memoization

The component uses React.memo and useMemo for optimal performance:

```tsx
// Validator is memoized
const validator = useMemo(
  () => new PasswordComplexityValidator(config),
  [config]
);

// Theme detection is memoized
const theme = useMemo(() => detectTheme(), []);

// Results are cached until password changes
const { result } = useDebounedValidation(
  password,
  validator,
  context,
  debounceMs
);
```

### Lazy Loading

For large applications, you can lazy load the component:

```tsx
import { lazy, Suspense } from 'react';

const PasswordStrengthIndicator = lazy(
  () => import('@promptscape/core/components/PasswordStrengthIndicator')
);

function LazyPasswordForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PasswordStrengthIndicator password={password} />
    </Suspense>
  );
}
```

## Integration Examples

### React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';
import { PasswordStrengthIndicator } from '@promptscape/core/components/PasswordStrengthIndicator';

function RegistrationForm() {
  const { control, watch, handleSubmit } = useForm();
  const password = watch('password', '');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="password"
        control={control}
        rules={{
          validate: async value => {
            const validator = new PasswordComplexityValidator();
            const result = await validator.validatePassword(value);
            return (
              result.valid || 'Password does not meet security requirements'
            );
          }
        }}
        render={({ field, fieldState: { error } }) => (
          <div>
            <input {...field} type="password" placeholder="Enter password" />

            <PasswordStrengthIndicator
              password={field.value || ''}
              showDetails={true}
              showSuggestions={true}
            />

            {error && <span className="text-red-600">{error.message}</span>}
          </div>
        )}
      />
    </form>
  );
}
```

### Formik Integration

```tsx
import { Formik, Field, Form } from 'formik';
import { PasswordStrengthIndicator } from '@promptscape/core/components/PasswordStrengthIndicator';

function FormikPasswordForm() {
  const validatePassword = async password => {
    const validator = new PasswordComplexityValidator();
    const result = await validator.validatePassword(password);
    return result.valid ? undefined : 'Password is too weak';
  };

  return (
    <Formik initialValues={{ password: '' }} onSubmit={handleSubmit}>
      {({ values }) => (
        <Form>
          <Field name="password" type="password" validate={validatePassword} />

          <PasswordStrengthIndicator
            password={values.password}
            showDetails={true}
            showSuggestions={true}
          />
        </Form>
      )}
    </Formik>
  );
}
```

### Server-Side Validation

```tsx
import { PasswordComplexityValidator } from '@promptscape/core/auth';

// API endpoint for password validation
app.post('/api/validate-password', async (req, res) => {
  const { password, context } = req.body;

  const validator = new PasswordComplexityValidator({
    mode: 'strict',
    minimumScore: 80
  });

  try {
    const result = await validator.validatePassword(password, context);

    res.json({
      valid: result.valid,
      score: result.score,
      strength: result.strength,
      suggestions: result.suggestions,
      errors: result.errors
    });
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

// Client-side integration
function RemoteValidationIndicator({ password }) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!password) return;

    const validateRemotely = async () => {
      const response = await fetch('/api/validate-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const result = await response.json();
      setResult(result);
    };

    const timeoutId = setTimeout(validateRemotely, 500);
    return () => clearTimeout(timeoutId);
  }, [password]);

  if (!result) return <div>Validating...</div>;

  return (
    <div>
      <div>Strength: {result.strength}</div>
      <div>Score: {result.score}/100</div>
      {result.suggestions.map(suggestion => (
        <div key={suggestion}>• {suggestion}</div>
      ))}
    </div>
  );
}
```

## Testing

### Unit Tests

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { PasswordStrengthIndicator } from '@promptscape/core/components/PasswordStrengthIndicator';
import { PasswordComplexityValidator } from '@promptscape/core/auth';

test('shows strength indicator for valid password', async () => {
  render(
    <PasswordStrengthIndicator
      password="StrongPassword123!"
      showDetails={true}
    />
  );

  await waitFor(() => {
    expect(screen.getByText('Password Strength')).toBeInTheDocument();
    expect(screen.getByText(/strong/i)).toBeInTheDocument();
  });
});

test('shows suggestions for weak password', async () => {
  render(<PasswordStrengthIndicator password="weak" showSuggestions={true} />);

  await waitFor(() => {
    expect(screen.getByText('Suggestions')).toBeInTheDocument();
  });
});
```

### Integration Tests

```tsx
test('integrates with custom validator', async () => {
  const customValidator = new PasswordComplexityValidator({
    mode: 'strict',
    minimumScore: 90
  });

  render(
    <PasswordStrengthIndicator
      password="TestPassword123!"
      validator={customValidator}
    />
  );

  await waitFor(() => {
    expect(screen.getByText('Password Strength')).toBeInTheDocument();
  });
});
```

## Best Practices

### 1. User Experience

- **Immediate feedback**: Show strength indicator as soon as user starts typing
- **Progressive disclosure**: Start with basic meter, reveal details on focus/interaction
- **Positive reinforcement**: Celebrate when requirements are met
- **Clear guidance**: Provide specific, actionable suggestions

### 2. Performance

- **Debounce validation**: Prevent excessive validation calls during rapid typing
- **Lazy load**: Load component only when needed
- **Memoize expensive operations**: Cache validator instances and results
- **Optimize re-renders**: Use React.memo and useMemo appropriately

### 3. Security

- **Client-side validation only**: Never rely solely on client-side validation
- **Server-side verification**: Always validate passwords on the server
- **Secure transmission**: Use HTTPS for all password-related communications
- **No password storage**: Never log or store passwords in validation components

### 4. Accessibility

- **Screen reader support**: Provide meaningful ARIA labels and live regions
- **Keyboard navigation**: Ensure all functionality is keyboard accessible
- **High contrast**: Use colors that meet WCAG guidelines
- **Text alternatives**: Don't rely solely on color to convey information

### 5. Internationalization

- **Localizable messages**: Support multiple languages for error messages and suggestions
- **Cultural considerations**: Adapt validation rules for different regions
- **Unicode support**: Handle international characters correctly

## Troubleshooting

### Common Issues

#### 1. Component Not Updating

```tsx
// Problem: Validator not responding to password changes
<PasswordStrengthIndicator password={password} />;

// Solution: Check if password prop is actually changing
console.log('Password changed:', password);

// Ensure debouncing isn't too aggressive
<PasswordStrengthIndicator password={password} debounceMs={100} />;
```

#### 2. Performance Issues

```tsx
// Problem: Slow validation
// Solution: Use memoized validator
const validator = useMemo(() => new PasswordComplexityValidator(), []);

<PasswordStrengthIndicator
  password={password}
  validator={validator}
  debounceMs={500} // Increase debounce time
/>;
```

#### 3. Styling Issues

```tsx
// Problem: Component not matching app theme
// Solution: Use CSS custom properties
<div
  style={{
    '--strength-good': '#22c55e',
    '--strength-strong': '#16a34a'
  }}
>
  <PasswordStrengthIndicator password={password} />
</div>
```

#### 4. Validation Context Not Working

```tsx
// Problem: Personal information not detected
// Solution: Ensure context is properly structured
const context = {
  username: user.username?.toLowerCase(),
  email: user.email?.toLowerCase(),
  firstName: user.firstName?.toLowerCase(),
  lastName: user.lastName?.toLowerCase()
};

<PasswordStrengthIndicator password={password} context={context} />;
```

This comprehensive password strength indicator provides a robust, accessible, and user-friendly way to guide users toward creating secure passwords while maintaining excellent performance and customization options.

# Signup Error Debugging & Fix Guide

## Issue

Users receiving "An error occurred. Please try again" when attempting to sign up.

## Root Causes Identified

### 1. Missing Supabase Configuration (Most Likely)

The application needs these environment variables:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Quick Check:**

```javascript
// In browser console:
console.log('Supabase enabled:', !!window.supabase);
```

### 2. Better Error Visibility Needed

The current error handling is too generic. The actual error is being swallowed.

## Immediate Fixes

### Fix 1: Add Detailed Error Logging (Temporary)

In `packages/core/components/auth/SignupForm.tsx`, modify the catch block:

```typescript
} catch (err) {
  console.error('Signup error details:', err);  // Add this line
  setError(getAuthErrorMessage(err));
  setIsLoading(false);
}
```

### Fix 2: Better Error Messages

In `packages/core/hooks/useAuthValidation.ts`, update the error mapping:

```typescript
const errorMap: Record<string, string> = {
  'Invalid login credentials': 'Email or password is incorrect',
  'Email not confirmed': 'Please check your email to confirm your account',
  'User already registered': 'An account with this email already exists',
  'Password should be at least 6 characters': 'Password is too short',
  'Authentication service is not available':
    'Signup is temporarily unavailable. Please try again later.',
  // Add more specific mappings
  'Database error': 'Unable to create account. Please try again.',
  'Network request failed':
    'Connection error. Please check your internet connection.'
};
```

### Fix 3: Add Fallback for Missing Supabase

In `packages/core/components/auth/SignupForm.tsx`, add better handling:

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  if (!isFormValid) {
    email.onBlur();
    password.onBlur();
    confirmPassword.onBlur();
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    if (!supabase) {
      // More user-friendly message
      setError('Account creation is temporarily unavailable. Please try again later or contact support.');
      setIsLoading(false);
      return;
    }
    // ... rest of the code
```

## Testing Checklist

1. [ ] Check environment variables are set
2. [ ] Verify Supabase project is active
3. [ ] Check Supabase dashboard for:
   - Email templates configured
   - Auth settings (confirm email enabled?)
   - Rate limiting settings
   - Allowed redirect URLs
4. [ ] Test with different email formats
5. [ ] Check browser console for CORS errors
6. [ ] Verify password meets all requirements

## Long-term Solutions

### 1. Add Development Mode Bypass

For local development without Supabase:

```typescript
// In development, show a clear message
if (process.env.NODE_ENV === 'development' && !supabase) {
  return (
    <div>
      <p>Authentication is not configured for local development.</p>
      <p>Set up Supabase or use mock authentication.</p>
    </div>
  );
}
```

### 2. Implement Mock Authentication

Create a mock auth service for development:

```typescript
class MockAuthService {
  async signUp(email: string, password: string) {
    // Simulate signup
    return {
      user: { id: 'mock-user', email },
      error: null
    };
  }
}
```

### 3. Add Telemetry

Track signup attempts and errors:

```typescript
// Track signup attempts
analytics.track('signup_attempted', {
  timestamp: new Date(),
  hasSupabase: !!supabase
});

// Track errors
analytics.track('signup_error', {
  error: err.message,
  code: err.code
});
```

## User Communication

Until fixed, add a banner or notification:

```jsx
{
  !supabase && (
    <div className="alert alert-info">
      Account creation is currently in beta. Please email support@example.com
      for early access.
    </div>
  );
}
```

## Verification Steps

1. Add `.env.local` file with:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

2. Restart the development server

3. Check browser console for any remaining errors

4. Try signup with test email

## Common Supabase Issues

- **Email confirmation required**: Check Supabase Auth settings
- **Rate limiting**: Default is 4 signups per hour per IP
- **CORS**: Add your domain to allowed URLs in Supabase
- **Email templates**: Ensure confirmation email template exists
- **Password policy**: Default minimum is 6 characters

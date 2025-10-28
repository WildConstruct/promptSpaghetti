# Authentication Store - Usage Examples

## Quick Start Guide

### 1. Basic Login Form

```typescript
import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear any previous errors

    const success = await login(email, password, rememberMe);

    if (success) {
      console.log('Login successful!');
      // Navigation handled automatically by routing system
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <label>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Remember me
      </label>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### 2. Registration Form

```typescript
import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const { register, isLoading, error } = useAuthStore();
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    const success = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName
    });

    if (success) {
      alert('Registration successful! Please check your email to verify your account.');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit}>
      {displayError && (
        <div className="error-message">
          {displayError}
        </div>
      )}

      <input
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="text"
        value={formData.firstName}
        onChange={(e) => handleChange('firstName', e.target.value)}
        placeholder="First Name"
        required
      />

      <input
        type="text"
        value={formData.lastName}
        onChange={(e) => handleChange('lastName', e.target.value)}
        placeholder="Last Name"
        required
      />

      <input
        type="password"
        value={formData.password}
        onChange={(e) => handleChange('password', e.target.value)}
        placeholder="Password"
        required
      />

      <input
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => handleChange('confirmPassword', e.target.value)}
        placeholder="Confirm Password"
        required
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}
```

### 3. User Profile Display

```typescript
import React from 'react';
import { useAuthStore } from '../stores/authStore';

function UserProfile() {
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <div>Please log in to view your profile.</div>;
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const handleUpdateProfile = async () => {
    const firstName = prompt('Enter new first name:', user.firstName);
    if (firstName && firstName !== user.firstName) {
      updateUser({ firstName });
      // Note: This updates local state immediately
      // For server sync, you'd need additional API call
    }
  };

  return (
    <div className="user-profile">
      <h2>Welcome, {user.firstName} {user.lastName}</h2>

      <div className="profile-info">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Email Verified:</strong> {user.isEmailVerified ? 'Yes' : 'No'}</p>
        <p><strong>Roles:</strong> {user.roles?.join(', ') || 'User'}</p>
      </div>

      <div className="profile-actions">
        <button onClick={handleUpdateProfile}>
          Update Profile
        </button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
}
```

### 4. OAuth Login Buttons

```typescript
import React from 'react';
import { useAuthStore } from '../stores/authStore';

function OAuthButtons() {
  const { oauthLogin, isLoading, error } = useAuthStore();

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      const { url } = await oauthLogin(provider, window.location.pathname);
      // Redirect to OAuth provider
      window.location.href = url;
    } catch (error) {
      console.error(`${provider} login failed:`, error);
    }
  };

  return (
    <div className="oauth-buttons">
      <p>Or sign in with:</p>

      <button
        onClick={() => handleOAuthLogin('google')}
        disabled={isLoading}
        className="oauth-button google"
      >
        {isLoading ? 'Connecting...' : 'Continue with Google'}
      </button>

      <button
        onClick={() => handleOAuthLogin('github')}
        disabled={isLoading}
        className="oauth-button github"
      >
        {isLoading ? 'Connecting...' : 'Continue with GitHub'}
      </button>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}
```

### 5. Protected Route Component

```typescript
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    checkAuthStatus,
    setReturnUrl
  } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Check authentication status on mount
    if (!isAuthenticated && !isLoading) {
      checkAuthStatus();
    }
  }, [isAuthenticated, isLoading, checkAuthStatus]);

  useEffect(() => {
    // Set return URL if not authenticated
    if (!isAuthenticated && location.pathname !== redirectTo) {
      setReturnUrl(location.pathname + location.search);
    }
  }, [isAuthenticated, location.pathname, location.search, redirectTo, setReturnUrl]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div>Checking authentication...</div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
}

// Usage in App.tsx
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
```

### 6. Authentication Status Hook

```typescript
import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';

function useAuthStatus() {
  const { isAuthenticated, user, checkAuthStatus } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      await checkAuthStatus();
      if (mounted) {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [checkAuthStatus]);

  return {
    isAuthenticated,
    user,
    isInitialized,
    isLoading: !isInitialized
  };
}

// Usage in components
function MyComponent() {
  const { isAuthenticated, user, isLoading } = useAuthStatus();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Hello, {user?.firstName}!</div>;
}
```

### 7. Automatic Token Refresh Setup

```typescript
import React, { useEffect } from 'react';
import { setupTokenRefresh } from '../stores/authStore';

function App() {
  useEffect(() => {
    // Setup automatic token refresh
    const cleanup = setupTokenRefresh();

    // Cleanup on unmount
    return cleanup;
  }, []);

  return (
    <div className="app">
      {/* Your app content */}
    </div>
  );
}
```

### 8. Making Authenticated API Calls

```typescript
import { authenticatedFetch, getAuthHeaders } from '../stores/authStore';

// Using the utility function (recommended)
async function fetchUserData() {
  try {
    const response = await authenticatedFetch('/api/user/profile');

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

// Manual approach with headers
async function updateUserProfile(profileData: any) {
  try {
    const headers = getAuthHeaders();

    const response = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers,
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}
```

### 9. Conditional Rendering Based on Auth State

```typescript
import React from 'react';
import { useAuthStore } from '../stores/authStore';

function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="app-header">
      <div className="logo">MyApp</div>

      <nav>
        {isAuthenticated ? (
          <div className="auth-nav">
            <span>Welcome, {user?.firstName}</span>
            <button onClick={() => logout()}>
              Logout
            </button>
          </div>
        ) : (
          <div className="guest-nav">
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </div>
        )}
      </nav>
    </header>
  );
}
```

### 10. Error Handling and User Feedback

```typescript
import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

function AuthErrorHandler() {
  const { error, clearError } = useAuthStore();

  useEffect(() => {
    if (error) {
      // Show error to user (could use a toast library)
      console.error('Authentication error:', error);

      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        clearError();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) {
    return null;
  }

  return (
    <div className="auth-error-banner">
      <span>{error}</span>
      <button onClick={clearError}>×</button>
    </div>
  );
}

// Usage in App.tsx
function App() {
  return (
    <div className="app">
      <AuthErrorHandler />
      {/* Rest of your app */}
    </div>
  );
}
```

## Best Practices

### 1. Always Handle Loading States

```typescript
const { isLoading } = useAuthStore();

if (isLoading) {
  return <LoadingSpinner />;
}
```

### 2. Check Authentication Before Protected Operations

```typescript
const { isAuthenticated } = useAuthStore();

const handleProtectedAction = () => {
  if (!isAuthenticated) {
    // Redirect to login or show error
    return;
  }

  // Perform protected action
};
```

### 3. Clear Errors Appropriately

```typescript
const { error, clearError } = useAuthStore();

useEffect(() => {
  // Clear errors when leaving the page
  return () => {
    if (error) {
      clearError();
    }
  };
}, [error, clearError]);
```

### 4. Use Return URLs for Better UX

```typescript
const { setReturnUrl } = useAuthStore();

const handleLoginRedirect = () => {
  setReturnUrl(window.location.pathname);
  navigate('/login');
};
```

### 5. Handle Token Expiration Gracefully

The store automatically handles token refresh, but you can also listen for auth state changes:

```typescript
useEffect(() => {
  const unsubscribe = useAuthStore.subscribe(
    state => state.isAuthenticated,
    isAuthenticated => {
      if (!isAuthenticated) {
        // Handle logout
        navigate('/login');
      }
    }
  );

  return unsubscribe;
}, [navigate]);
```

This comprehensive set of examples should cover most common authentication use cases in your application!

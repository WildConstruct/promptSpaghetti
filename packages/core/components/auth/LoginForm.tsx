/**
 * Login form component
 */

import React, { useState, FormEvent } from 'react';
import {
  useEmailValidation,
  usePasswordValidation,
  getAuthErrorMessage
} from '../../hooks/useAuthValidation';
import { FormField } from '../shared/FormField';

interface LoginFormProps {
  onSuccess: (user: any) => void;
  onForgotPassword: () => void;
}

export function LoginForm({ onSuccess, onForgotPassword }: LoginFormProps) {
  const email = useEmailValidation();
  const password = usePasswordValidation(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = email.isValid && password.isValid;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      email.onBlur();
      password.onBlur();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual Supabase auth call
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email: email.value,
      //   password: password.value
      // });

      // Simulated auth call for now
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (
            email.value === 'test@example.com' &&
            password.value === 'Test1234'
          ) {
            resolve({ user: { email: email.value, id: '123' } });
          } else {
            reject(new Error('Invalid login credentials'));
          }
        }, 1000);
      });

      setShowSuccessMessage(true);
      setTimeout(() => {
        onSuccess({ email: email.value });
      }, 500);
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '6px',
            color: '#721c24',
            fontSize: '14px'
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div
          style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '6px',
            color: '#155724',
            fontSize: '14px'
          }}
          role="status"
        >
          ✓ Login successful! Redirecting...
        </div>
      )}

      {/* Email Field */}
      <FormField
        label="Email"
        type="email"
        value={email.value}
        onChange={email.onChange}
        onBlur={email.onBlur}
        error={email.error}
        disabled={isLoading}
        autoComplete="email"
        required
        placeholder="you@example.com"
      />

      {/* Password Field */}
      <FormField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password.value}
        onChange={password.onChange}
        onBlur={password.onBlur}
        error={password.error}
        disabled={isLoading}
        autoComplete="current-password"
        required
        placeholder="••••••••"
        showPasswordToggle
        onTogglePassword={() => setShowPassword(!showPassword)}
      />

      {/* Forgot Password Link */}
      <div
        style={{
          textAlign: 'right',
          marginBottom: '20px'
        }}
      >
        <button
          type="button"
          onClick={onForgotPassword}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            fontSize: '14px',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0
          }}
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        style={{
          width: '100%',
          padding: '12px 20px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: isFormValid && !isLoading ? '#007bff' : '#e9ecef',
          color: isFormValid && !isLoading ? 'white' : '#6c757d',
          fontSize: '16px',
          fontWeight: '500',
          cursor: isFormValid && !isLoading ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseEnter={e => {
          if (isFormValid && !isLoading) {
            e.currentTarget.style.backgroundColor = '#0056b3';
          }
        }}
        onMouseLeave={e => {
          if (isFormValid && !isLoading) {
            e.currentTarget.style.backgroundColor = '#007bff';
          }
        }}
      >
        {isLoading ? (
          <>
            <span
              style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid #6c757d',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            Logging in...
          </>
        ) : (
          'Log In'
        )}
      </button>

      {/* CSS for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}

/**
 * Login form component
 */

import React, { useState, FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  useEmailValidation,
  usePasswordValidation,
  getAuthErrorMessage
} from '../../hooks/useAuthValidation';
import { FormField } from '../shared/FormField';
import { getSupabase } from '../../utils/supabaseClient';

interface LoginFormProps {
  onSuccess: (user: User) => void;
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
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Authentication service is not available');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Login failed - no user returned');
      }

      setShowSuccessMessage(true);
      setTimeout(() => {
        onSuccess(data.user);
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
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            color: '#f87171',
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
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '6px',
            color: '#4ade80',
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
            color: '#60a5fa',
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
          backgroundColor: isFormValid && !isLoading ? '#2563eb' : '#333',
          color: isFormValid && !isLoading ? 'white' : '#666',
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
            e.currentTarget.style.backgroundColor = '#1d4ed8';
          }
        }}
        onMouseLeave={e => {
          if (isFormValid && !isLoading) {
            e.currentTarget.style.backgroundColor = '#2563eb';
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
                border: '2px solid #999',
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

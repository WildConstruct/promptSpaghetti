/**
 * Signup form component with password strength indicator
 */

import React, { useState, FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  useEmailValidation,
  usePasswordValidation,
  useConfirmPasswordValidation,
  getAuthErrorMessage
} from '../../hooks/useAuthValidation';
import { FormField } from '../shared/FormField';
import { PasswordStrengthIndicator } from '../shared/PasswordStrengthIndicator';
import { supabase } from '../../utils/supabaseClient';

interface SignupFormProps {
  onSuccess: (user: User) => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const email = useEmailValidation();
  const password = usePasswordValidation(true); // true = signup mode (stricter validation)
  const confirmPassword = useConfirmPasswordValidation(password.value);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const isFormValid =
    email.isValid &&
    password.isValid &&
    confirmPassword.isValid &&
    agreedToTerms;

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
        throw new Error('Authentication service is not available');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        throw error;
      }

      const user = data.user;

      if (!user) {
        throw new Error('Signup failed - no user returned');
      }

      setShowSuccessMessage(true);

      // Note: Supabase may require email confirmation
      // The user object will be returned but session might not be active until confirmed
      setTimeout(() => {
        onSuccess(user);
      }, 1500);
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
          ✓ Account created! Check your email to verify your account.
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
        type={password.showPassword ? 'text' : 'password'}
        value={password.value}
        onChange={password.onChange}
        onBlur={password.onBlur}
        error={password.error}
        disabled={isLoading}
        autoComplete="new-password"
        required
        placeholder="••••••••"
        showPasswordToggle
        onTogglePassword={password.toggleShowPassword}
      />

      {/* Password Strength Indicator */}
      {password.value && (
        <PasswordStrengthIndicator
          strength={password.strength}
          requirements={password.requirements}
        />
      )}

      {/* Confirm Password Field */}
      <FormField
        label="Confirm Password"
        type={password.showPassword ? 'text' : 'password'}
        value={confirmPassword.value}
        onChange={confirmPassword.onChange}
        onBlur={confirmPassword.onBlur}
        error={confirmPassword.error}
        disabled={isLoading}
        autoComplete="new-password"
        required
        placeholder="••••••••"
      />

      {/* Terms Agreement */}
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}
      >
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={e => setAgreedToTerms(e.target.checked)}
          disabled={isLoading}
          style={{
            marginTop: '4px',
            cursor: 'pointer'
          }}
        />
        <label
          htmlFor="terms"
          style={{
            fontSize: '14px',
            color: '#e0e0e0',
            cursor: 'pointer',
            lineHeight: '1.5'
          }}
        >
          I agree to the{' '}
          <a
            href="#"
            onClick={e => e.preventDefault()}
            style={{
              color: '#60a5fa',
              textDecoration: 'underline'
            }}
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="#"
            onClick={e => e.preventDefault()}
            style={{
              color: '#60a5fa',
              textDecoration: 'underline'
            }}
          >
            Privacy Policy
          </a>
        </label>
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
          backgroundColor: isFormValid && !isLoading ? '#10b981' : '#333',
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
            e.currentTarget.style.backgroundColor = '#059669';
          }
        }}
        onMouseLeave={e => {
          if (isFormValid && !isLoading) {
            e.currentTarget.style.backgroundColor = '#10b981';
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
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Info Text */}
      <p
        style={{
          marginTop: '16px',
          fontSize: '12px',
          color: '#6c757d',
          textAlign: 'center',
          lineHeight: '1.5'
        }}
      >
        By signing up, you&apos;ll get access to save your graphs, collaborate with
        others, and use advanced features.
      </p>
    </form>
  );
}

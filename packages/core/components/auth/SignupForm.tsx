/**
 * Signup form component with password strength indicator
 */

import React, { useState, FormEvent } from 'react';
import {
  useEmailValidation,
  usePasswordValidation,
  useConfirmPasswordValidation,
  getAuthErrorMessage
} from '../../hooks/useAuthValidation';
import { FormField } from '../shared/FormField';
import { PasswordStrengthIndicator } from '../shared/PasswordStrengthIndicator';

interface SignupFormProps {
  onSuccess: (user: any) => void;
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
      // TODO: Replace with actual Supabase auth call
      // const { data, error } = await supabase.auth.signUp({
      //   email: email.value,
      //   password: password.value
      // });

      // Simulated auth call for now
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email.value.includes('@')) {
            resolve({ user: { email: email.value, id: '123' } });
          } else {
            reject(new Error('Invalid email format'));
          }
        }, 1000);
      });

      setShowSuccessMessage(true);
      setTimeout(() => {
        onSuccess({ email: email.value });
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
            color: '#495057',
            cursor: 'pointer',
            lineHeight: '1.5'
          }}
        >
          I agree to the{' '}
          <a
            href="#"
            onClick={e => e.preventDefault()}
            style={{
              color: '#007bff',
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
              color: '#007bff',
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
          backgroundColor: isFormValid && !isLoading ? '#28a745' : '#e9ecef',
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
            e.currentTarget.style.backgroundColor = '#218838';
          }
        }}
        onMouseLeave={e => {
          if (isFormValid && !isLoading) {
            e.currentTarget.style.backgroundColor = '#28a745';
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
        By signing up, you'll get access to save your graphs, collaborate with
        others, and use advanced features.
      </p>
    </form>
  );
}

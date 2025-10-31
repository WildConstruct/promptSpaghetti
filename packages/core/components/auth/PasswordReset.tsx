/**
 * Password reset form component
 */

import React, { useState, FormEvent } from 'react';
import {
  useEmailValidation,
  getAuthErrorMessage
} from '../../hooks/useAuthValidation';
import { FormField } from '../shared/FormField';
import { supabase } from '../../utils/supabaseClient';

interface PasswordResetProps {
  onBack: () => void;
}

export function PasswordReset({ onBack }: PasswordResetProps) {
  const email = useEmailValidation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.isValid) {
      email.onBlur();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Authentication service is not available');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div
          style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}
        >
          📧
        </div>

        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#e0e0e0'
          }}
        >
          Check Your Email
        </h3>

        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            color: '#999',
            lineHeight: '1.5'
          }}
        >
          We&apos;ve sent a password reset link to
          <br />
          <strong>{email.value}</strong>
        </p>

        <div
          style={{
            padding: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            color: '#60a5fa',
            fontSize: '13px',
            textAlign: 'left',
            marginBottom: '24px'
          }}
        >
          <strong>Didn&apos;t receive the email?</strong>
          <ul
            style={{
              margin: '8px 0 0 0',
              paddingLeft: '20px'
            }}
          >
            <li>Check your spam folder</li>
            <li>Make sure you entered the correct email</li>
            <li>Wait a few minutes and try again</li>
          </ul>
        </div>

        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: '1px solid #2563eb',
            backgroundColor: 'transparent',
            color: '#60a5fa',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#60a5fa';
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p
        style={{
          margin: '0 0 20px 0',
          fontSize: '14px',
          color: '#999',
          lineHeight: '1.5'
        }}
      >
        Enter your email address and we&apos;ll send you a link to reset your
        password.
      </p>

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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!email.isValid || isLoading}
        style={{
          width: '100%',
          padding: '12px 20px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: email.isValid && !isLoading ? '#2563eb' : '#333',
          color: email.isValid && !isLoading ? 'white' : '#666',
          fontSize: '16px',
          fontWeight: '500',
          cursor: email.isValid && !isLoading ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}
        onMouseEnter={e => {
          if (email.isValid && !isLoading) {
            e.currentTarget.style.backgroundColor = '#1d4ed8';
          }
        }}
        onMouseLeave={e => {
          if (email.isValid && !isLoading) {
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
            Sending...
          </>
        ) : (
          'Send Reset Link'
        )}
      </button>
    </form>
  );
}

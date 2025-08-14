/**
 * Reusable form field component
 */

import React from 'react';

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
}

export function FormField({
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  autoComplete,
  required = false,
  placeholder,
  showPasswordToggle = false,
  onTogglePassword
}: FormFieldProps) {
  const inputId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;

  return (
    <div style={{ marginBottom: '20px' }}>
      <label
        htmlFor={inputId}
        style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#e0e0e0'
        }}
      >
        {label}
        {required && (
          <span
            style={{
              color: '#f87171',
              marginLeft: '4px'
            }}
            aria-label="required"
          >
            *
          </span>
        )}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          style={{
            width: '100%',
            padding: showPasswordToggle ? '10px 40px 10px 12px' : '10px 12px',
            fontSize: '15px',
            border: `1px solid ${error ? '#f87171' : '#444'}`,
            borderRadius: '6px',
            backgroundColor: disabled ? '#2a2a2a' : '#1a1a1a',
            color: '#e0e0e0',
            transition:
              'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
            outline: 'none',
            boxSizing: 'border-box'
          }}
          onFocus={e => {
            if (!error) {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.boxShadow =
                '0 0 0 0.2rem rgba(37, 99, 235, 0.25)';
            }
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = error ? '#f87171' : '#444';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />

        {/* Password Toggle Button */}
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            disabled={disabled}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#999',
              cursor: disabled ? 'not-allowed' : 'pointer',
              padding: '4px',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label={type === 'password' ? 'Show password' : 'Hide password'}
          >
            {type === 'password' ? '👁' : '👁‍🗨'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          id={errorId}
          style={{
            marginTop: '4px',
            fontSize: '13px',
            color: '#f87171'
          }}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}

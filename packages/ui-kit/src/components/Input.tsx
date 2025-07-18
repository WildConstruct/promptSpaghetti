/**
 * Cross-platform Input component
 */

import React, { forwardRef, useState, useCallback } from 'react';
import { InputProps } from '../types';
import { useTheme } from '../hooks';
import { cn, createInputStyles, createSizeStyles, generateId } from '../utils';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      placeholder,
      value,
      defaultValue,
      size = 'md',
      disabled = false,
      readOnly = false,
      error,
      label,
      hint,
      required = false,
      leftIcon,
      rightIcon,
      onChange,
      onBlur,
      onFocus,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value || defaultValue || '');
    
    const inputId = generateId('input');
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    const inputStyles = {
      ...createInputStyles(theme, error, disabled),
      ...createSizeStyles(size, theme, 'input'),
      ...(leftIcon && { paddingLeft: `${theme.spacing.xl}px` }),
      ...(rightIcon && { paddingRight: `${theme.spacing.xl}px` }),
      ...style
    };

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
    }, [onChange]);

    const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.();
    }, [onFocus]);

    const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.();
    }, [onBlur]);

    const currentValue = value !== undefined ? value : internalValue;

    return (
      <div className={cn('ui-input-container', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="ui-input-label"
            style={{
              display: 'block',
              marginBottom: `${theme.spacing.xs}px`,
              fontSize: `${theme.typography.fontSize.sm}px`,
              fontWeight: theme.typography.fontWeight.medium,
              color: error ? theme.colors.error : theme.colors.text,
              fontFamily: theme.typography.fontFamily
            }}
          >
            {label}
            {required && (
              <span
                className="ui-input-required"
                style={{
                  color: theme.colors.error,
                  marginLeft: `${theme.spacing.xs / 2}px`
                }}
              >
                *
              </span>
            )}
          </label>
        )}
        
        <div
          className="ui-input-wrapper"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {leftIcon && (
            <div
              className="ui-input-icon-left"
              style={{
                position: 'absolute',
                left: `${theme.spacing.sm}px`,
                display: 'flex',
                alignItems: 'center',
                color: disabled ? theme.colors.textSecondary : theme.colors.textSecondary,
                pointerEvents: 'none',
                zIndex: 1
              }}
            >
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={type}
            placeholder={placeholder}
            value={currentValue}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="ui-input"
            style={inputStyles}
            data-testid={testId}
            aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
            aria-invalid={!!error}
            {...props}
          />
          
          {rightIcon && (
            <div
              className="ui-input-icon-right"
              style={{
                position: 'absolute',
                right: `${theme.spacing.sm}px`,
                display: 'flex',
                alignItems: 'center',
                color: disabled ? theme.colors.textSecondary : theme.colors.textSecondary,
                pointerEvents: 'none',
                zIndex: 1
              }}
            >
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <div
            id={errorId}
            className="ui-input-error"
            style={{
              marginTop: `${theme.spacing.xs}px`,
              fontSize: `${theme.typography.fontSize.sm}px`,
              color: theme.colors.error,
              fontFamily: theme.typography.fontFamily
            }}
          >
            {error}
          </div>
        )}
        
        {hint && !error && (
          <div
            id={hintId}
            className="ui-input-hint"
            style={{
              marginTop: `${theme.spacing.xs}px`,
              fontSize: `${theme.typography.fontSize.sm}px`,
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontFamily
            }}
          >
            {hint}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// TextArea variant
export const TextArea = forwardRef<HTMLTextAreaElement, InputProps & { rows?: number; resize?: boolean }>(
  (
    {
      placeholder,
      value,
      defaultValue,
      size = 'md',
      disabled = false,
      readOnly = false,
      error,
      label,
      hint,
      required = false,
      onChange,
      onBlur,
      onFocus,
      className,
      style,
      testId,
      rows = 4,
      resize = true,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const [internalValue, setInternalValue] = useState(value || defaultValue || '');
    
    const inputId = generateId('textarea');
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    const textareaStyles = {
      ...createInputStyles(theme, error, disabled),
      ...createSizeStyles(size, theme, 'input'),
      minHeight: `${rows * 1.5}em`,
      resize: resize ? 'vertical' : 'none',
      lineHeight: theme.typography.lineHeight.normal,
      ...style
    };

    const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
    }, [onChange]);

    const currentValue = value !== undefined ? value : internalValue;

    return (
      <div className={cn('ui-textarea-container', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="ui-textarea-label"
            style={{
              display: 'block',
              marginBottom: `${theme.spacing.xs}px`,
              fontSize: `${theme.typography.fontSize.sm}px`,
              fontWeight: theme.typography.fontWeight.medium,
              color: error ? theme.colors.error : theme.colors.text,
              fontFamily: theme.typography.fontFamily
            }}
          >
            {label}
            {required && (
              <span
                className="ui-textarea-required"
                style={{
                  color: theme.colors.error,
                  marginLeft: `${theme.spacing.xs / 2}px`
                }}
              >
                *
              </span>
            )}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={inputId}
          placeholder={placeholder}
          value={currentValue}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          rows={rows}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="ui-textarea"
          style={textareaStyles}
          data-testid={testId}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          aria-invalid={!!error}
          {...props as any}
        />
        
        {error && (
          <div
            id={errorId}
            className="ui-textarea-error"
            style={{
              marginTop: `${theme.spacing.xs}px`,
              fontSize: `${theme.typography.fontSize.sm}px`,
              color: theme.colors.error,
              fontFamily: theme.typography.fontFamily
            }}
          >
            {error}
          </div>
        )}
        
        {hint && !error && (
          <div
            id={hintId}
            className="ui-textarea-hint"
            style={{
              marginTop: `${theme.spacing.xs}px`,
              fontSize: `${theme.typography.fontSize.sm}px`,
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontFamily
            }}
          >
            {hint}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
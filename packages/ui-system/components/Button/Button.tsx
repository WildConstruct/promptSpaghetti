/**
 * Button Component - Epic 16 Design System Foundation
 * Standardized button component with variants for sharing UI
 */

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { colors } from '../../tokens/colors';

// Button variant types
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// Style configurations
const buttonStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: '500',
    textDecoration: 'none',
    border: '1px solid',
    borderRadius: '0.375rem', // 6px
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    userSelect: 'none' as const,
    position: 'relative' as const,
    gap: '0.5rem',
    
    // Focus styles
    '&:focus-visible': {
      outline: '2px solid',
      outlineOffset: '2px'
    },
    
    // Disabled styles
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.6
    }
  },
  
  variants: {
    primary: {
      backgroundColor: colors.component.button.primary.background,
      color: colors.component.button.primary.text,
      borderColor: colors.component.button.primary.border,
      
      '&:hover:not(:disabled)': {
        backgroundColor: colors.component.button.primary.backgroundHover
      },
      
      '&:active:not(:disabled)': {
        backgroundColor: colors.component.button.primary.backgroundActive
      },
      
      '&:focus-visible': {
        outlineColor: colors.component.button.primary.borderFocus
      }
    },
    
    secondary: {
      backgroundColor: colors.component.button.secondary.background,
      color: colors.component.button.secondary.text,
      borderColor: colors.component.button.secondary.border,
      
      '&:hover:not(:disabled)': {
        backgroundColor: colors.component.button.secondary.backgroundHover,
        borderColor: colors.component.button.secondary.borderHover
      },
      
      '&:active:not(:disabled)': {
        backgroundColor: colors.component.button.secondary.backgroundActive
      },
      
      '&:focus-visible': {
        outlineColor: colors.component.button.secondary.borderFocus
      }
    },
    
    ghost: {
      backgroundColor: colors.component.button.ghost.background,
      color: colors.component.button.ghost.text,
      borderColor: colors.component.button.ghost.border,
      
      '&:hover:not(:disabled)': {
        backgroundColor: colors.component.button.ghost.backgroundHover
      },
      
      '&:active:not(:disabled)': {
        backgroundColor: colors.component.button.ghost.backgroundActive
      },
      
      '&:focus-visible': {
        outlineColor: colors.component.button.ghost.borderFocus
      }
    },
    
    destructive: {
      backgroundColor: colors.component.button.destructive.background,
      color: colors.component.button.destructive.text,
      borderColor: colors.component.button.destructive.border,
      
      '&:hover:not(:disabled)': {
        backgroundColor: colors.component.button.destructive.backgroundHover
      },
      
      '&:active:not(:disabled)': {
        backgroundColor: colors.component.button.destructive.backgroundActive
      },
      
      '&:focus-visible': {
        outlineColor: colors.component.button.destructive.borderFocus
      }
    }
  },
  
  sizes: {
    sm: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25rem', // 20px
      padding: '0.5rem 0.75rem', // 8px 12px
      minHeight: '2rem' // 32px
    },
    
    md: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25rem', // 20px
      padding: '0.625rem 1rem', // 10px 16px
      minHeight: '2.5rem' // 40px
    },
    
    lg: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5rem', // 24px
      padding: '0.75rem 1.5rem', // 12px 24px
      minHeight: '3rem' // 48px
    }
  }
} as const;

// Loading spinner component
const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  const spinnerSize = size === 'sm' ? '16' : size === 'md' ? '20' : '24';
  
  return (
    <svg
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: 'spin 1s linear infinite'
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="32"
        style={{
          animation: 'dash 1.5s ease-in-out infinite'
        }}
      />
    </svg>
  );
};

// Convert CSS-in-JS to inline styles
const createInlineStyles = (
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  loading: boolean,
  disabled: boolean
): React.CSSProperties => {
  const variantStyles = buttonStyles.variants[variant];
  const sizeStyles = buttonStyles.sizes[size];
  
  return {
    ...buttonStyles.base,
    ...variantStyles,
    ...sizeStyles,
    width: fullWidth ? '100%' : 'auto',
    opacity: loading || disabled ? 0.6 : 1,
    pointerEvents: loading || disabled ? 'none' : 'auto'
  } as React.CSSProperties;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled = false,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const inlineStyles = createInlineStyles(
      variant,
      size,
      fullWidth,
      loading,
      disabled
    );
    
    return (
      <>
        {/* Add keyframe animations to document head if not already present */}
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            
            @keyframes dash {
              0% {
                stroke-dasharray: 1, 150;
                stroke-dashoffset: 0;
              }
              50% {
                stroke-dasharray: 90, 150;
                stroke-dashoffset: -35;
              }
              100% {
                stroke-dasharray: 90, 150;
                stroke-dashoffset: -124;
              }
            }
          `}
        </style>
        
        <button
          ref={ref}
          disabled={disabled || loading}
          className={`ui-button ${className}`}
          style={{
            ...inlineStyles,
            ...style
          }}
          {...props}
        >
          {loading ? (
            <>
              <LoadingSpinner size={size} />
              <span style={{ opacity: 0.7 }}>Loading...</span>
            </>
          ) : (
            <>
              {leftIcon && <span className="ui-button-left-icon">{leftIcon}</span>}
              <span className="ui-button-text">{children}</span>
              {rightIcon && <span className="ui-button-right-icon">{rightIcon}</span>}
            </>
          )}
        </button>
      </>
    );
  }
);

Button.displayName = 'Button';

// Button group component for related actions
export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'normal',
  fullWidth = false,
  className = '',
  style
}) => {
  const groupStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    gap: spacing === 'tight' ? '0.25rem' : spacing === 'normal' ? '0.5rem' : '1rem',
    width: fullWidth ? '100%' : 'auto',
    alignItems: orientation === 'horizontal' ? 'center' : 'stretch'
  };
  
  return (
    <div
      className={`ui-button-group ${className}`}
      style={{
        ...groupStyles,
        ...style
      }}
    >
      {children}
    </div>
  );
};

// Icon button for actions with only icons
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', ...props }, ref) => {
    const iconButtonStyles: React.CSSProperties = {
      padding: size === 'sm' ? '0.5rem' : size === 'md' ? '0.625rem' : '0.75rem',
      minWidth: size === 'sm' ? '2rem' : size === 'md' ? '2.5rem' : '3rem',
      aspectRatio: '1'
    };
    
    return (
      <Button
        ref={ref}
        size={size}
        style={iconButtonStyles}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Export types for external use
export type { ButtonVariant, ButtonSize };
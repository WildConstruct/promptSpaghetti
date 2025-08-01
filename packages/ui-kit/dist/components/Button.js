import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Cross-platform Button component
 */
import { forwardRef } from 'react';
import { useTheme } from '../hooks';
import { cn, createButtonVariantStyles, createSizeStyles } from '../utils';
export const Button = forwardRef(({ children, variant = 'primary', size = 'md', disabled = false, loading = false, fullWidth = false, leftIcon, rightIcon, onClick, type = 'button', className, style, testId, ...props }, ref) => {
    const theme = useTheme();
    const baseStyles = {
        ...createButtonVariantStyles(variant, theme),
        ...createSizeStyles(size, theme, 'button'),
        ...(fullWidth && { width: '100%' }),
        ...(loading && {
            cursor: 'not-allowed',
            opacity: 0.7,
        }),
        ...style,
    };
    const handleClick = () => {
        if (!disabled && !loading && onClick) {
            onClick();
        }
    };
    return (_jsxs("button", { ref: ref, type: type, disabled: disabled || loading, onClick: handleClick, className: cn('ui-button', className), style: baseStyles, "data-testid": testId, "aria-disabled": disabled || loading, ...props, children: [leftIcon && (_jsx("span", { className: "ui-button-icon-left", style: {
                    marginRight: children ? `${theme.spacing.xs}px` : 0,
                    display: 'flex',
                    alignItems: 'center',
                }, children: leftIcon })), loading ? (_jsxs("span", { className: "ui-button-loading", style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${theme.spacing.xs}px`,
                }, children: [_jsx(LoadingSpinner, { size: size }), children && _jsx("span", { children: children })] })) : (children), rightIcon && !loading && (_jsx("span", { className: "ui-button-icon-right", style: {
                    marginLeft: children ? `${theme.spacing.xs}px` : 0,
                    display: 'flex',
                    alignItems: 'center',
                }, children: rightIcon }))] }));
});
Button.displayName = 'Button';
// Simple loading spinner component
const LoadingSpinner = ({ size }) => {
    const theme = useTheme();
    const sizeMap = {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
    };
    const spinnerSize = sizeMap[size] || 16;
    return (_jsx("div", { className: "ui-loading-spinner", style: {
            width: `${spinnerSize}px`,
            height: `${spinnerSize}px`,
            border: '2px solid transparent',
            borderTopColor: 'currentColor',
            borderRadius: '50%',
            animation: 'ui-spin 0.8s linear infinite',
        } }));
};
// CSS animation styles (would typically be in a CSS file)
export const buttonAnimationStyles = `
  @keyframes ui-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .ui-button {
    position: relative;
    overflow: hidden;
  }
  
  .ui-button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
  }
  
  .ui-button:active::before {
    width: 300px;
    height: 300px;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .ui-button::before {
      transition: none;
    }
    
    .ui-loading-spinner {
      animation: none;
    }
  }
`;
//# sourceMappingURL=Button.js.map
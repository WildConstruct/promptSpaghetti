import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Cross-platform Input component
 */
import { forwardRef, useState, useCallback } from 'react';
import { useTheme } from '../hooks';
import { cn, createInputStyles, createSizeStyles, generateId } from '../utils';
export const Input = forwardRef(({ type = 'text', placeholder, value, defaultValue, size = 'md', disabled = false, readOnly = false, error, label, hint, required = false, leftIcon, rightIcon, onChange, onBlur, onFocus, className, style, testId, ...props }, ref) => {
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
        ...style,
    };
    const handleChange = useCallback((event) => {
        const newValue = event.target.value;
        setInternalValue(newValue);
        onChange?.(newValue);
    }, [onChange]);
    const handleFocus = useCallback((event) => {
        setIsFocused(true);
        onFocus?.();
    }, [onFocus]);
    const handleBlur = useCallback((event) => {
        setIsFocused(false);
        onBlur?.();
    }, [onBlur]);
    const currentValue = value !== undefined ? value : internalValue;
    return (_jsxs("div", { className: cn('ui-input-container', className), children: [label && (_jsxs("label", { htmlFor: inputId, className: "ui-input-label", style: {
                    display: 'block',
                    marginBottom: `${theme.spacing.xs}px`,
                    fontSize: `${theme.typography.fontSize.sm}px`,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: error ? theme.colors.error : theme.colors.text,
                    fontFamily: theme.typography.fontFamily,
                }, children: [label, required && (_jsx("span", { className: "ui-input-required", style: {
                            color: theme.colors.error,
                            marginLeft: `${theme.spacing.xs / 2}px`,
                        }, children: "*" }))] })), _jsxs("div", { className: "ui-input-wrapper", style: {
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                }, children: [leftIcon && (_jsx("div", { className: "ui-input-icon-left", style: {
                            position: 'absolute',
                            left: `${theme.spacing.sm}px`,
                            display: 'flex',
                            alignItems: 'center',
                            color: disabled ? theme.colors.textSecondary : theme.colors.textSecondary,
                            pointerEvents: 'none',
                            zIndex: 1,
                        }, children: leftIcon })), _jsx("input", { ref: ref, id: inputId, type: type, placeholder: placeholder, value: currentValue, disabled: disabled, readOnly: readOnly, required: required, onChange: handleChange, onFocus: handleFocus, onBlur: handleBlur, className: "ui-input", style: inputStyles, "data-testid": testId, "aria-describedby": [errorId, hintId].filter(Boolean).join(' ') || undefined, "aria-invalid": !!error, ...props }), rightIcon && (_jsx("div", { className: "ui-input-icon-right", style: {
                            position: 'absolute',
                            right: `${theme.spacing.sm}px`,
                            display: 'flex',
                            alignItems: 'center',
                            color: disabled ? theme.colors.textSecondary : theme.colors.textSecondary,
                            pointerEvents: 'none',
                            zIndex: 1,
                        }, children: rightIcon }))] }), error && (_jsx("div", { id: errorId, className: "ui-input-error", style: {
                    marginTop: `${theme.spacing.xs}px`,
                    fontSize: `${theme.typography.fontSize.sm}px`,
                    color: theme.colors.error,
                    fontFamily: theme.typography.fontFamily,
                }, children: error })), hint && !error && (_jsx("div", { id: hintId, className: "ui-input-hint", style: {
                    marginTop: `${theme.spacing.xs}px`,
                    fontSize: `${theme.typography.fontSize.sm}px`,
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamily,
                }, children: hint }))] }));
});
Input.displayName = 'Input';
// TextArea variant
export const TextArea = forwardRef(({ placeholder, value, defaultValue, size = 'md', disabled = false, readOnly = false, error, label, hint, required = false, onChange, onBlur, onFocus, className, style, testId, rows = 4, resize = true, ...props }, ref) => {
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
        ...style,
    };
    const handleChange = useCallback((event) => {
        const newValue = event.target.value;
        setInternalValue(newValue);
        onChange?.(newValue);
    }, [onChange]);
    const currentValue = value !== undefined ? value : internalValue;
    return (_jsxs("div", { className: cn('ui-textarea-container', className), children: [label && (_jsxs("label", { htmlFor: inputId, className: "ui-textarea-label", style: {
                    display: 'block',
                    marginBottom: `${theme.spacing.xs}px`,
                    fontSize: `${theme.typography.fontSize.sm}px`,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: error ? theme.colors.error : theme.colors.text,
                    fontFamily: theme.typography.fontFamily,
                }, children: [label, required && (_jsx("span", { className: "ui-textarea-required", style: {
                            color: theme.colors.error,
                            marginLeft: `${theme.spacing.xs / 2}px`,
                        }, children: "*" }))] })), _jsx("textarea", { ref: ref, id: inputId, placeholder: placeholder, value: currentValue, disabled: disabled, readOnly: readOnly, required: required, rows: rows, onChange: handleChange, onFocus: onFocus, onBlur: onBlur, className: "ui-textarea", style: textareaStyles, "data-testid": testId, "aria-describedby": [errorId, hintId].filter(Boolean).join(' ') || undefined, "aria-invalid": !!error, ...props }), error && (_jsx("div", { id: errorId, className: "ui-textarea-error", style: {
                    marginTop: `${theme.spacing.xs}px`,
                    fontSize: `${theme.typography.fontSize.sm}px`,
                    color: theme.colors.error,
                    fontFamily: theme.typography.fontFamily,
                }, children: error })), hint && !error && (_jsx("div", { id: hintId, className: "ui-textarea-hint", style: {
                    marginTop: `${theme.spacing.xs}px`,
                    fontSize: `${theme.typography.fontSize.sm}px`,
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamily,
                }, children: hint }))] }));
});
TextArea.displayName = 'TextArea';
//# sourceMappingURL=Input.js.map
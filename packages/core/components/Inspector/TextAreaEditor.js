import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
export const TextAreaEditor = ({ label, value, fieldKey, error, onChange, placeholder, disabled = false, rows = 4, maxLength, minLength, autoResize = false, showWordCount = false, }) => {
    const [localValue, setLocalValue] = React.useState(String(value ?? ""));
    const [isFocused, setIsFocused] = React.useState(false);
    const textareaRef = React.useRef(null);
    // Update local value when external value changes
    React.useEffect(() => {
        setLocalValue(String(value ?? ""));
    }, [value]);
    // Auto-resize functionality
    React.useEffect(() => {
        if (autoResize && textareaRef.current) {
            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [localValue, autoResize]);
    const handleChange = (newValue) => {
        setLocalValue(newValue);
        onChange(newValue);
    };
    const getWordCount = (text) => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };
    const inputId = `field-${fieldKey}`;
    const textareaStyle = {
        width: "100%",
        padding: 8,
        border: error
            ? "1px solid #f56565"
            : isFocused
                ? "1px solid #4299e1"
                : "1px solid #4a5568",
        borderRadius: 4,
        background: "#2d3748",
        color: "#e2e8f0",
        fontSize: 13,
        fontFamily: "system-ui, -apple-system, sans-serif",
        outline: "none",
        transition: "border-color 0.2s ease",
        resize: autoResize ? 'none' : 'vertical',
        minHeight: autoResize ? `${rows * 1.5}em` : undefined,
    };
    const labelStyle = {
        display: "block",
        fontWeight: 500,
        marginBottom: 4,
        color: "#e2e8f0",
        fontSize: 12,
        letterSpacing: "0.025em",
    };
    const wordCount = getWordCount(localValue);
    const charCount = localValue.length;
    return (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("label", { htmlFor: inputId, style: labelStyle, children: [label, error && (_jsx("span", { style: { color: "#f56565", marginLeft: 4, fontSize: 10 }, children: "*" }))] }), _jsx("textarea", { ref: textareaRef, id: inputId, value: localValue, onChange: (e) => handleChange(e.target.value), onFocus: () => setIsFocused(true), onBlur: () => setIsFocused(false), placeholder: placeholder || `Enter ${label.toLowerCase()}...`, disabled: disabled, rows: autoResize ? undefined : rows, maxLength: maxLength, minLength: minLength, style: textareaStyle }), error && (_jsx("div", { style: {
                    color: "#f56565",
                    fontSize: 11,
                    marginTop: 4,
                    fontWeight: 400,
                }, children: error })), _jsxs("div", { style: {
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 2,
                    fontSize: 10,
                    color: "#a0aec0",
                }, children: [showWordCount && (_jsxs("span", { children: [wordCount, " word", wordCount !== 1 ? 's' : ''] })), maxLength && (_jsxs("span", { style: { marginLeft: 'auto' }, children: [charCount, " / ", maxLength] }))] })] }));
};

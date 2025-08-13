import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Web-specific Input implementation
 */
import { useRef } from 'react';
import { Input, TextArea } from '../../components/Input';
import { usePlatformAdapter } from '../usePlatformAdapter';
export const WebInput = ({ autoComplete = 'off', spellCheck = true, autoCapitalize = 'sentences', autoCorrect = true, pattern, minLength, maxLength, onKeyDown, ...props }) => {
    const adapter = usePlatformAdapter();
    const inputRef = useRef(null);
    const handleKeyDown = (e) => {
        // Web-specific keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'a':
                    // Select all - let browser handle this
                    break;
                case 'z':
                    // Undo - let browser handle this
                    break;
                case 'y':
                    // Redo - let browser handle this
                    break;
            }
        }
        // Call original onKeyDown handler
        onKeyDown?.(e);
    };
    return (_jsx(Input, { ...props, ref: inputRef, onKeyDown: handleKeyDown, 
        // Web-specific attributes
        autoComplete: autoComplete, spellCheck: spellCheck, autoCapitalize: autoCapitalize, autoCorrect: autoCorrect ? 'on' : 'off', pattern: pattern, minLength: minLength, maxLength: maxLength, style: {
            ...props.style,
            // Web-specific styling
            WebkitTapHighlightColor: 'transparent',
            WebkitAppearance: 'none',
        } }));
};
export const WebTextArea = ({ autoComplete = 'off', spellCheck = true, autoCapitalize = 'sentences', autoCorrect = true, minLength, maxLength, wrap = 'soft', onKeyDown, ...props }) => {
    const textAreaRef = useRef(null);
    const handleKeyDown = (e) => {
        // Web-specific keyboard shortcuts for text areas
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Enter':
                    // Ctrl+Enter for submit in some contexts
                    e.preventDefault();
                    // Could trigger onSubmit callback if provided
                    break;
            }
        }
        // Tab handling for code editing
        if (e.key === 'Tab' && props.hint?.includes('code')) {
            e.preventDefault();
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;
            if (e.shiftKey) {
                // Remove indentation
                const beforeCursor = value.substring(0, start);
                const afterCursor = value.substring(end);
                const lines = beforeCursor.split('\n');
                const currentLine = lines[lines.length - 1];
                if (currentLine.startsWith('  ')) {
                    lines[lines.length - 1] = currentLine.substring(2);
                    const newValue = lines.join('\n') + afterCursor;
                    textarea.value = newValue;
                    textarea.setSelectionRange(start - 2, end - 2);
                    props.onChange?.(newValue);
                }
            }
            else {
                // Add indentation
                const newValue = value.substring(0, start) + '  ' + value.substring(end);
                textarea.value = newValue;
                textarea.setSelectionRange(start + 2, end + 2);
                props.onChange?.(newValue);
            }
            return;
        }
        onKeyDown?.(e);
    };
    return (_jsx(TextArea, { ...props, ref: textAreaRef, onKeyDown: handleKeyDown, 
        // Web-specific attributes
        autoComplete: autoComplete, spellCheck: spellCheck, autoCapitalize: autoCapitalize, autoCorrect: autoCorrect ? 'on' : 'off', minLength: minLength, maxLength: maxLength, wrap: wrap, style: {
            ...props.style,
            // Web-specific styling
            WebkitTapHighlightColor: 'transparent',
            WebkitAppearance: 'none',
            resize: 'vertical',
        } }));
};
//# sourceMappingURL=WebInput.js.map
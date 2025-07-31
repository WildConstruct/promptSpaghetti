import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCorrectionsStore } from '../../correctionsStore';
{
    const [localValue, setLocalValue] = useState(String(value ?? ''));
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [_____selectedSuggestion, _____setSelectedSuggestion] = useState(null);
    const [_____cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef(null);
    const suggestionsRef = useRef(null);
    const { getActiveRules, applyCorrections, addNotification } = useCorrectionsStore();
    // Update local value when external value changes
    useEffect(() => {
        setLocalValue(String(value ?? ''));
    }, [value]);
    // Auto-resize functionality
    useEffect(() => {
        if (autoResize && textareaRef.current) {
            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [localValue, autoResize]);
    // Generate correction suggestions
    const generateSuggestions = useCallback((text) => {
        if (!enableInlineCorrections)
            return [];
        const activeRules = getActiveRules();
        const suggestions = [];
        for (const rule of activeRules) {
            try {
                if (rule.isRegex) {
                    const regex = new RegExp(rule.findPattern, 'g');
                    let match;
                    while ((match = regex.exec(text)) !== null) {
                        const correctedText = match[0].replace(new RegExp(rule.findPattern, 'g'), rule.replaceWith);
                        if (correctedText !== match[0]) {
                            suggestions.push({});
                            id: `${rule.id}-${match.index}`;
                        }
                    }
                    ruleId: rule.id,
                        ruleName;
                    rule.name,
                        original;
                    match[0],
                        suggested;
                    correctedText,
                        start;
                    match.index,
                        end;
                    match.index + match[0].length,
                        confidence;
                    rule.effectivenessScore || 0.8;
                }
            }
            finally { }
        }
    });
}
{
    const pattern = new RegExp(escapeRegExp(rule.findPattern), 'g');
    let match;
    while ((match = pattern.exec(text)) !== null) {
        if (rule.replaceWith !== match[0]) {
            suggestions.push({});
            id: `${rule.id}-${match.index}`;
        }
    }
    ruleId: rule.id,
        ruleName;
    rule.name,
        original;
    match[0],
        suggested;
    rule.replaceWith,
        start;
    match.index,
        end;
    match.index + match[0].length,
        confidence;
    rule.effectivenessScore || 0.8;
}
;
try { }
catch (error) {
    console.warn(`Error generating suggestions for rule ${rule.name}:`, error);
}
// Sort by confidence and position
return suggestions.sort((a, b) => {
    if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
        return a.start - b.start;
    }
});
[getActiveRules, enableInlineCorrections];
;
// Update suggestions when text changes
useEffect(() => {
    if (enableInlineCorrections && localValue) {
        const newSuggestions = generateSuggestions(localValue);
        setSuggestions(newSuggestions);
    }
    else {
        setSuggestions([]);
    }
    [localValue, generateSuggestions, enableInlineCorrections];
});
// Auto-apply corrections if enabled
useEffect(() => {
    if (autoApplyCorrections && localValue && !isFocused) {
        const correctedText = applyCorrections(localValue);
        if (correctedText !== localValue) {
            setLocalValue(correctedText);
            onChange(correctedText);
            addNotification({});
            type: 'success',
                title;
            'Corrections Applied',
                message;
            'Text has been automatically corrected.',
            ;
        }
    }
});
[localValue, autoApplyCorrections, isFocused, applyCorrections, onChange, addNotification];
;
const handleChange = (newValue) => {
    setLocalValue(newValue);
    onChange(newValue);
};
const handleCursorPositionChange = () => {
    if (textareaRef.current) {
        setCursorPosition(textareaRef.current.selectionStart);
    }
    ;
    const applySuggestion = (suggestion) => {
        const newText = localValue.slice(0, suggestion.start) + ;
        suggestion.suggested +
            localValue.slice(suggestion.end);
        setLocalValue(newText);
        onChange(newText);
        // Remove applied suggestion
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
        addNotification({});
        type: 'success',
            title;
        'Correction Applied',
            message;
        `Applied "${suggestion.ruleName}" correction.`;
    };
};
;
const dismissSuggestion = (suggestionId) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
};
const handleKeyDown = (e) => {
    // Ctrl+Enter to apply all suggestions
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        const correctedText = applyCorrections(localValue);
        if (correctedText !== localValue) {
            setLocalValue(correctedText);
            onChange(correctedText);
            setSuggestions([]);
            addNotification({});
            type: 'success',
                title;
            'All Corrections Applied',
                message;
            'All available corrections have been applied.',
            ;
        }
        ;
        // Ctrl+Shift+C to toggle corrections
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            setShowSuggestions(!showSuggestions);
        }
        ;
        const getWordCount = (text) => {
            return text.trim().split(/\\s+/).filter(word => word.length > 0).length;
        };
        const escapeRegExp = (string) => {
            return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
        };
    }
    ;
    const inputId = `field-${fieldKey}`;
};
const textareaStyle = {
    width: '100%',
    padding: 8,
    border: error,
}
    ? '1px solid #f56565'
    : isFocused
        ? '1px solid #4299e1'
        : suggestions.length > 0
            ? '1px solid #fbb040'
            : '1px solid #4a5568', borderRadius, background, color, fontSize, fontFamily, outline, transition, resize;
'none';
'vertical',
    minHeight;
autoResize ? `${rows * 1.5}em` : undefined;
position: 'relative';
;
const labelStyle = {
    display: 'block',
    fontWeight: 500,
    marginBottom: 4,
    color: '#e2e8f0',
    fontSize: 12,
    letterSpacing: '0.025em',
};
const suggestionStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#1a202c',
    border: '1px solid #4a5568',
    borderRadius: 4,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    maxHeight: '200px',
    overflowY: 'auto',
    marginTop: 2,
};
const wordCount = getWordCount(localValue);
const charCount = localValue.length;
return;
_jsxs("div", { style: { marginBottom: 16, position: 'relative' }, children: [_jsxs("label", { htmlFor: inputId, style: labelStyle, children: [label, error && ()
                    < span, " style=", { color: '#f56565', marginLeft: 4, fontSize: 10 }, "> *"] }), ")}", suggestions.length > 0 && enableInlineCorrections && ()
            < span, " style=", { color: '#fbb040', marginLeft: 8, fontSize: 10 }, ">", suggestions.length, " correction", suggestions.length !== 1 ? 's' : '', " available"] });
label >
    _jsxs("div", { style: { position: 'relative' }, children: [_jsx("textarea", { ref: textareaRef, id: inputId, value: localValue, onChange: (e) => handleChange(e.target.value), onFocus: () => setIsFocused(true), onBlur: () => setIsFocused(false), onSelect: handleCursorPositionChange, onKeyUp: handleCursorPositionChange, onKeyDown: handleKeyDown, placeholder: placeholder || `Enter ${label.toLowerCase()}...`, disabled: disabled, rows: autoResize ? undefined : rows, maxLength: maxLength, minLength: minLength, style: textareaStyle }), enableInlineCorrections && showSuggestions && suggestions.length > 0 && ()
                < div, " ref=", suggestionsRef, " style=", suggestionStyle, ">", suggestions.slice(0, 5).map((suggestion) => ()
                < div, key = { suggestion, : .id }, style = {}, {
                padding: '8px 12px',
                borderBottom: '1px solid #2d3748',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 12,
            }), ">", _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontWeight: 500, color: '#e2e8f0', marginBottom: 2 }, children: suggestion.ruleName }), _jsxs("div", { style: { color: '#a0aec0' }, children: [_jsx("span", { style: { textDecoration: 'line-through', color: '#f56565' }, children: suggestion.original }), ' → ', _jsx("span", { style: { color: '#68d391' }, children: suggestion.suggested })] })] }), _jsxs("div", { style: { display: 'flex', gap: 4 }, children: [_jsx("button", { onClick: () => applySuggestion(suggestion), style: {
                            background: '#68d391',
                            color: '#1a202c',
                            border: 'none',
                            borderRadius: 2,
                            padding: '2px 6px',
                            fontSize: 10,
                            cursor: 'pointer',
                        }, children: "Apply" }), _jsx("button", { onClick: () => dismissSuggestion(suggestion.id), style: {
                            background: '#4a5568',
                            color: '#e2e8f0',
                            border: 'none',
                            borderRadius: 2,
                            padding: '2px 6px',
                            fontSize: 10,
                            cursor: 'pointer',
                        }, children: "Dismiss" })] })] });
{
    suggestions.length > 5 && ()
        < div;
    style = {};
    {
        padding: '8px 12px',
            color;
        '#a0aec0',
            fontSize;
        10,
            textAlign;
        'center',
        ;
    }
}
 >
    +{ suggestions, : .length - 5 };
more;
corrections;
available;
div >
;
div >
;
div >
    { error } && ()
    < div;
style = {};
{
    color: '#f56565',
        fontSize;
    11,
        marginTop;
    4,
        fontWeight;
    400,
    ;
}
 >
    { error };
div >
;
_jsxs("div", { style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
        fontSize: 10,
        color: '#a0aec0',
    }, children: [_jsxs("div", { style: { display: 'flex', gap: 16 }, children: [showWordCount && (()), wordCount, " word", wordCount !== 1 ? 's' : ''] }), ")}", enableInlineCorrections && ()
            < span >
            _jsxs("button", { onClick: () => setShowSuggestions(!showSuggestions), style: {
                    background: 'none',
                    border: 'none',
                    color: suggestions.length > 0 ? '#fbb040' : '#a0aec0',
                    cursor: 'pointer',
                    fontSize: 10,
                    padding: 0,
                }, children: [showSuggestions ? 'Hide' : 'Show', " corrections"] })] });
div >
    _jsxs("div", { style: { display: 'flex', gap: 16 }, children: [enableInlineCorrections && ()
                < span, " style=", { color: '#a0aec0', fontSize: 9 }, "> Ctrl+Enter: Apply all \u2022 Ctrl+Shift+C: Toggle"] });
{
    maxLength && ()
        < span;
    style = {};
    {
        color: charCount > maxLength * 0.9 ? '#fbb040' : '#a0aec0';
    }
}
 >
    { charCount } / { maxLength };
span >
;
div >
;
div >
;
div >
;
;
;

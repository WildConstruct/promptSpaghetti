import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from 'react';
import { parseTemplate, getVariableSuggestions, getPreviewWithSamples, setTemplateContext, trackVariableUsage, VARIABLE_CATEGORIES } from '../../utils/templateParser';
import { useTemplatePreview } from '../../hooks/useTemplatePreview';
export const TemplateEditor = ({ value, onChange, onVariablesChange, variableValues = {}, nodeType, existingVariables = [], placeholder = 'Enter your template...', disabled = false, showPreview = false, showRealTimePreview = false, autoComplete = true, showCategoryFilters = false, maxSuggestions = 10, className = '' }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [currentSuggestion, setCurrentSuggestion] = useState('');
    const [suggestionIndex, setSuggestionIndex] = useState(-1);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [suggestionScrollIndex, setSuggestionScrollIndex] = useState(0);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const suggestionItemRefs = useRef([]);
    // Set template context for contextual suggestions
    useEffect(() => {
        if (nodeType || existingVariables.length > 0) {
            setTemplateContext(nodeType, existingVariables);
        }
    }, [nodeType, existingVariables]);
    // Parse template and get results
    const parseResult = useMemo(() => parseTemplate(value), [value]);
    const previewResult = useMemo(() => getPreviewWithSamples(value), [value]);
    // Real-time preview integration
    const { variants: realTimeVariants, isGenerating, error: previewError, extractedVariables, hasTemplateErrors, templateErrors, forcePreview, refreshVariant } = useTemplatePreview(value, variableValues, {
        maxVariants: 3,
        debounceMs: 200,
        autoRefresh: showRealTimePreview,
        showVariableSubstitution: true,
        errorOnUndefinedVariables: false
    });
    // Get variable suggestions based on cursor position with enhanced filtering
    const suggestions = useMemo(() => {
        if (!autoComplete || !showSuggestions)
            return [];
        // Find if cursor is inside a variable being typed
        const beforeCursor = value.slice(0, cursorPosition);
        const match = beforeCursor.match(/{([^{}]*)$/);
        if (match) {
            const partialVariable = match[1];
            let allSuggestions = getVariableSuggestions(partialVariable, nodeType, true);
            // Filter by selected category
            if (selectedCategory !== 'all') {
                allSuggestions = allSuggestions.filter(s => s.category === selectedCategory);
            }
            // Limit number of suggestions
            allSuggestions = allSuggestions.slice(0, maxSuggestions);
            // Update refs array length
            suggestionItemRefs.current = allSuggestions.map((_, index) => suggestionItemRefs.current[index] || null);
            return allSuggestions;
        }
        return [];
    }, [value, cursorPosition, autoComplete, showSuggestions, selectedCategory, maxSuggestions, nodeType]);
    // Update variables when they change
    useEffect(() => {
        if (onVariablesChange) {
            const validVariables = parseResult.variables.filter(v => v.isValid);
            const variableNames = validVariables.map(v => v.name);
            onVariablesChange(variableNames, validVariables);
        }
    }, [parseResult.variables, onVariablesChange]);
    // Handle input change
    const handleChange = (e) => {
        const newValue = e.target.value;
        onChange(newValue);
        setCursorPosition(e.target.selectionStart);
        // Show suggestions if typing a variable
        const beforeCursor = newValue.slice(0, e.target.selectionStart);
        const isTypingVariable = beforeCursor.includes('{') && !beforeCursor.match(/{[^{}]*}$/);
        setShowSuggestions(isTypingVariable);
        setSuggestionIndex(-1);
    };
    // Scroll selected suggestion into view
    const scrollToSuggestion = (index) => {
        if (suggestionItemRefs.current[index]) {
            suggestionItemRefs.current[index]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    };
    // Handle enhanced key navigation for suggestions
    const handleKeyDown = (e) => {
        if (showSuggestions && suggestions.length > 0) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSuggestionIndex(prev => {
                        const newIndex = prev < suggestions.length - 1 ? prev + 1 : 0;
                        scrollToSuggestion(newIndex);
                        return newIndex;
                    });
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSuggestionIndex(prev => {
                        const newIndex = prev > 0 ? prev - 1 : suggestions.length - 1;
                        scrollToSuggestion(newIndex);
                        return newIndex;
                    });
                    break;
                case 'PageDown':
                    e.preventDefault();
                    setSuggestionIndex(prev => {
                        const newIndex = Math.min(prev + 5, suggestions.length - 1);
                        scrollToSuggestion(newIndex);
                        return newIndex;
                    });
                    break;
                case 'PageUp':
                    e.preventDefault();
                    setSuggestionIndex(prev => {
                        const newIndex = Math.max(prev - 5, 0);
                        scrollToSuggestion(newIndex);
                        return newIndex;
                    });
                    break;
                case 'Home':
                    e.preventDefault();
                    setSuggestionIndex(0);
                    scrollToSuggestion(0);
                    break;
                case 'End':
                    e.preventDefault();
                    const lastIndex = suggestions.length - 1;
                    setSuggestionIndex(lastIndex);
                    scrollToSuggestion(lastIndex);
                    break;
                case 'Enter':
                case 'Tab':
                    e.preventDefault();
                    if (suggestionIndex >= 0) {
                        applySuggestion(suggestions[suggestionIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setShowSuggestions(false);
                    setSuggestionIndex(-1);
                    inputRef.current?.focus();
                    break;
                // Quick filter by category using number keys
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        const categoryIndex = parseInt(e.key) - 1;
                        if (categoryIndex < VARIABLE_CATEGORIES.length) {
                            setSelectedCategory(VARIABLE_CATEGORIES[categoryIndex]);
                            setSuggestionIndex(0);
                        }
                    }
                    break;
                case '0':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        setSelectedCategory('all');
                        setSuggestionIndex(0);
                    }
                    break;
            }
        }
    };
    // Apply selected suggestion
    const applySuggestion = (suggestion) => {
        if (!inputRef.current)
            return;
        const beforeCursor = value.slice(0, cursorPosition);
        const afterCursor = value.slice(cursorPosition);
        const match = beforeCursor.match(/{([^{}]*)$/);
        if (match) {
            const variableStart = beforeCursor.lastIndexOf('{');
            const newValue = beforeCursor.slice(0, variableStart) +
                `{${suggestion.name}}` +
                afterCursor;
            onChange(newValue);
            // Track variable usage for user history
            trackVariableUsage(suggestion.name);
            setShowSuggestions(false);
            setSuggestionIndex(-1);
            // Set cursor after the inserted variable
            setTimeout(() => {
                if (inputRef.current) {
                    const newPosition = variableStart + suggestion.name.length + 2;
                    inputRef.current.setSelectionRange(newPosition, newPosition);
                    setCursorPosition(newPosition);
                    inputRef.current.focus();
                }
            }, 0);
        }
    };
    // Render highlighted text (for display purposes)
    const renderHighlightedTemplate = () => {
        if (!value)
            return placeholder;
        let result = value;
        let offset = 0;
        // Add highlighting spans around variables
        for (const variable of parseResult.variables) {
            const className = variable.isValid ? 'template-variable' : 'template-variable-error';
            const before = result.slice(0, variable.startIndex + offset);
            const after = result.slice(variable.endIndex + offset);
            const highlightedVar = `<span class="${className}">${variable.placeholder}</span>`;
            result = before + highlightedVar + after;
            offset += highlightedVar.length - variable.placeholder.length;
        }
        return result;
    };
    return (_jsxs("div", { className: `template-editor ${className}`, style: { position: 'relative' }, children: [_jsxs("div", { style: { position: 'relative' }, children: [_jsx("textarea", { ref: inputRef, value: value, onChange: handleChange, onKeyDown: handleKeyDown, onFocus: () => setIsFocused(true), onBlur: () => {
                            // Delay hiding suggestions to allow clicks
                            setTimeout(() => {
                                setIsFocused(false);
                                setShowSuggestions(false);
                            }, 100);
                        }, onSelect: (e) => setCursorPosition(e.currentTarget.selectionStart), placeholder: placeholder, disabled: disabled, style: {
                            width: '100%',
                            minHeight: 80,
                            padding: 12,
                            border: parseResult.isValid ?
                                (isFocused ? '2px solid #4299e1' : '1px solid #4a5568') :
                                '2px solid #e53e3e',
                            borderRadius: 6,
                            background: '#2d3748',
                            color: '#e2e8f0',
                            fontSize: 14,
                            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                            resize: 'vertical',
                            outline: 'none',
                            lineHeight: 1.4
                        } }), parseResult.variables.length > 0 && (_jsx("div", { style: {
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            right: 12,
                            bottom: 12,
                            pointerEvents: 'none',
                            color: 'transparent',
                            fontSize: 14,
                            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                            lineHeight: 1.4,
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word'
                        }, dangerouslySetInnerHTML: { __html: renderHighlightedTemplate() } }))] }), showSuggestions && suggestions.length > 0 && (_jsx("div", { ref: suggestionsRef, style: {
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    maxHeight: 200,
                    overflowY: 'auto',
                    background: '#2d3748',
                    border: '1px solid #4a5568',
                    borderRadius: 6,
                    marginTop: 4,
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }, children: suggestions.map((suggestion, index) => (_jsxs("div", { onClick: () => applySuggestion(suggestion), style: {
                        padding: '8px 12px',
                        cursor: 'pointer',
                        background: index === suggestionIndex ? '#4a5568' : 'transparent',
                        borderBottom: index < suggestions.length - 1 ? '1px solid #4a5568' : 'none'
                    }, onMouseEnter: () => setSuggestionIndex(index), children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                                color: '#e2e8f0',
                                                fontWeight: 500,
                                                fontSize: 14,
                                                fontFamily: 'Monaco, Consolas, monospace'
                                            }, children: suggestion.name }), _jsx("div", { style: {
                                                color: '#a0aec0',
                                                fontSize: 12,
                                                marginTop: 2
                                            }, children: suggestion.description })] }), _jsx("div", { style: {
                                        background: getCategoryColor(suggestion.category),
                                        color: 'white',
                                        fontSize: 10,
                                        padding: '2px 6px',
                                        borderRadius: 3,
                                        fontWeight: 500
                                    }, children: suggestion.category })] }), _jsxs("div", { style: {
                                marginTop: 4,
                                fontSize: 11,
                                color: '#6b7280',
                                fontStyle: 'italic'
                            }, children: ["e.g., ", suggestion.examples[0]] })] }, suggestion.name))) })), parseResult.errors.length > 0 && (_jsx("div", { style: { marginTop: 8 }, children: parseResult.errors.map((error, index) => (_jsxs("div", { style: {
                        color: error.severity === 'error' ? '#f56565' : '#ed8936',
                        fontSize: 12,
                        marginBottom: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                    }, children: [_jsx("span", { children: error.severity === 'error' ? '❌' : '⚠️' }), error.message] }, index))) })), showPreview && parseResult.isValid && parseResult.variables.length > 0 && (_jsxs("div", { style: {
                    marginTop: 12,
                    padding: 12,
                    background: '#1a202c',
                    border: '1px solid #4a5568',
                    borderRadius: 6
                }, children: [_jsx("div", { style: {
                            fontSize: 11,
                            color: '#a0aec0',
                            marginBottom: 6,
                            fontWeight: 500
                        }, children: "Preview with sample values:" }), _jsxs("div", { style: {
                            color: '#e2e8f0',
                            fontSize: 13,
                            fontStyle: 'italic',
                            lineHeight: 1.4
                        }, children: ["\"", previewResult.preview, "\""] }), _jsxs("div", { style: { marginTop: 8, fontSize: 10, color: '#6b7280' }, children: ["Variables: ", Object.entries(previewResult.usedSamples)
                                .map(([name, value]) => `{${name}} = "${value}"`)
                                .join(', ')] })] })), showRealTimePreview && value.trim() && (_jsxs("div", { style: {
                    marginTop: 12,
                    padding: 12,
                    background: '#1a202c',
                    border: hasTemplateErrors ? '1px solid #e53e3e' : '1px solid #4a5568',
                    borderRadius: 6
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 8
                        }, children: [_jsx("div", { style: {
                                    fontSize: 11,
                                    color: '#a0aec0',
                                    fontWeight: 500
                                }, children: "Real-time Preview:" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [isGenerating && (_jsx("div", { style: {
                                            width: 12,
                                            height: 12,
                                            border: '2px solid #4a5568',
                                            borderTop: '2px solid #4299e1',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        } })), _jsx("button", { onClick: () => forcePreview(), disabled: isGenerating || hasTemplateErrors, style: {
                                            fontSize: 10,
                                            padding: '4px 8px',
                                            background: '#4299e1',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                                            opacity: isGenerating || hasTemplateErrors ? 0.5 : 1
                                        }, children: "Refresh" })] })] }), hasTemplateErrors && templateErrors.length > 0 && (_jsx("div", { style: { marginBottom: 8 }, children: templateErrors.map((error, index) => (_jsxs("div", { style: {
                                color: '#f56565',
                                fontSize: 11,
                                marginBottom: 4,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                            }, children: [_jsx("span", { children: "\u274C" }), error.message] }, index))) })), previewError && (_jsxs("div", { style: {
                            color: '#f56565',
                            fontSize: 11,
                            marginBottom: 8,
                            padding: 8,
                            background: 'rgba(245, 101, 101, 0.1)',
                            borderRadius: 4,
                            border: '1px solid rgba(245, 101, 101, 0.3)'
                        }, children: [_jsx("strong", { children: "Preview Error:" }), " ", previewError] })), !hasTemplateErrors && !previewError && realTimeVariants.length > 0 && (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: realTimeVariants.map((variant, index) => (_jsxs("div", { style: {
                                padding: 8,
                                background: '#2d3748',
                                borderRadius: 4,
                                border: '1px solid #4a5568'
                            }, children: [_jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: 4
                                    }, children: [_jsxs("span", { style: {
                                                fontSize: 10,
                                                color: '#a0aec0',
                                                fontWeight: 500
                                            }, children: ["Variant ", index + 1] }), _jsx("button", { onClick: () => refreshVariant(variant.id), style: {
                                                fontSize: 9,
                                                padding: '2px 6px',
                                                background: 'transparent',
                                                color: '#a0aec0',
                                                border: '1px solid #4a5568',
                                                borderRadius: 3,
                                                cursor: 'pointer'
                                            }, title: "Generate new variation", children: "\uD83D\uDD04" })] }), _jsxs("div", { style: {
                                        color: '#e2e8f0',
                                        fontSize: 12,
                                        lineHeight: 1.4,
                                        marginBottom: 6
                                    }, children: ["\"", variant.result, "\""] }), Object.keys(variant.substitutions).length > 0 && (_jsx("div", { style: {
                                        fontSize: 9,
                                        color: '#6b7280',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 6
                                    }, children: Object.entries(variant.substitutions).map(([name, value]) => (_jsxs("span", { style: {
                                            background: 'rgba(66, 153, 225, 0.2)',
                                            color: '#63b3ed',
                                            padding: '2px 4px',
                                            borderRadius: 2,
                                            fontSize: 9
                                        }, children: [name, "=\"", value, "\""] }, name))) }))] }, variant.id))) })), !hasTemplateErrors && !previewError && !isGenerating && realTimeVariants.length === 0 && (_jsx("div", { style: {
                            color: '#a0aec0',
                            fontSize: 11,
                            fontStyle: 'italic',
                            textAlign: 'center',
                            padding: 16
                        }, children: "No previews generated yet. Try adding some variables to your template." }))] })), _jsx("style", { jsx: true, children: `
        .template-variable {
          background: rgba(66, 153, 225, 0.2);
          color: #63b3ed;
          padding: 1px 2px;
          border-radius: 2px;
          font-weight: 500;
        }
        
        .template-variable-error {
          background: rgba(245, 101, 101, 0.2);
          color: #f56565;
          padding: 1px 2px;
          border-radius: 2px;
          font-weight: 500;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      ` })] }));
};
// Helper function to get category colors
const getCategoryColor = (category) => {
    const colors = {
        character: '#9f7aea', // purple
        setting: '#4fd1c7', // teal
        action: '#f6ad55', // orange
        mood: '#fc8181', // red
        object: '#68d391', // green
        custom: '#a0aec0' // gray
    };
    return colors[category] || colors.custom;
};

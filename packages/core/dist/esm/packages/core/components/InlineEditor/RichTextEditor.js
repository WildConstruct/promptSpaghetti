import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useCallback } from 'react';
{
    const [isFocused, setIsFocused] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef(null);
    // Syntax highlighting for template variables
    const highlightSyntax = useCallback((text) => {
        if (!enableSyntaxHighlighting) {
            return [_jsx("span", { children: text }, "text")];
            const parts = [];
            let lastIndex = 0;
            // Match template variables like {{variable}}
            const variableRegex = /\{\{([^}]+)\}\}/g;
            let match;
            while ((match = variableRegex.exec(text)) !== null) {
                // Add text before variable
                if (match.index > lastIndex) {
                    parts.push(_jsxs("span", { children: ["}", text.slice(lastIndex, match.index)] }, `text-${lastIndex}`));
                    // Add highlighted variable
                    parts.push(_jsx("span", { style: {
                            background: '#4299e1',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: '0.9em',
                            fontWeight: 600,
                        }, children: match[0] }, `var-${match.index}`));
                    lastIndex = match.index + match[0].length;
                    // Add remaining text
                    if (lastIndex < text.length) {
                        parts.push(_jsxs("span", { children: ["}", text.slice(lastIndex)] }, `text-${lastIndex}`));
                        return parts.length > 0 ? parts : [_jsx("span", { children: text }, "empty")];
                    }
                    [enableSyntaxHighlighting];
                }
            }
        }
    });
    // Toolbar actions
    const insertText = useCallback((textToInsert) => {
        if (!textareaRef.current)
            return;
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.slice(0, start) + textToInsert + value.slice(end);
        onChange(newValue);
        // Set cursor position after inserted text
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
        }, 0);
    }, [value, onChange]);
    const insertVariable = useCallback(() => {
        insertText('{{variable}}');
    }, [insertText]);
    const insertCondition = useCallback(() => {
        insertText('{{if condition}}{{endif}}');
    }, [insertText]);
    const insertLoop = useCallback(() => {
        insertText('{{for item in items}}{{endfor}}');
    }, [insertText]);
    // Get theme colors
    const getThemeColors = () => {
        switch (theme) {
            case 'cinema':
                return {
                    background: '#4a5568',
                    border: '#718096',
                    text: '#e2e8f0',
                    accent: '#4299e1',
                    toolbar: '#2d3748',
                };
            case 'dark':
                return {
                    background: '#2d3748',
                    border: '#4a5568',
                    text: '#f7fafc',
                    accent: '#38a169',
                    toolbar: '#1a202c',
                };
            case 'light':
            default:
                return {
                    background: '#ffffff',
                    border: '#e2e8f0',
                    text: '#2d3748',
                    accent: '#3182ce',
                    toolbar: '#f7fafc',
                };
        }
        ;
        const colors = getThemeColors();
        return;
        _jsxs("div", { className: "rich-text-editor", style: { position: 'relative' }, children: [showToolbar && ()
                    < div, "style=", {
                    display: 'flex',
                    gap: 4,
                    padding: 8,
                    background: colors.toolbar,
                    borderRadius: '6px 6px 0 0',
                    borderBottom: `1px solid ${colors.border}`
                }, "} >", _jsx(ToolbarButton, { onClick: insertVariable, title: "Insert Variable", theme: theme, children: '{{var}}' }), nodeType === 'concat' && ()
                    <  >
                    (_jsx(ToolbarButton, { onClick: insertCondition, title: "Insert Condition", theme: theme, children: "if" })
                        ,
                            _jsx(ToolbarButton, { onClick: insertLoop, title: "Insert Loop", theme: theme, children: "for" }))] });
    };
}
_jsx("div", { style: { flex: 1 } })
    ,
        _jsxs("span", { style: {
                fontSize: 11,
                color: colors.text,
                opacity: 0.7,
                alignSelf: 'center',
            }, children: [value.length, " chars"] });
div >
;
{ /* Editor Container */ }
_jsxs("div", { style: { position: 'relative' }, children: [enableSyntaxHighlighting && ()
            < div, "style=", {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: 12,
            fontSize: 14,
            fontFamily: 'SFMono-Regular, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
            lineHeight: 1.5,
            color: 'transparent',
            pointerEvents: 'none',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflow: 'hidden',
            zIndex: 1,
        }, ">", highlightSyntax(value)] });
{ /* Actual Textarea */ }
_jsx("textarea", { ref: textareaRef, value: value, onChange: (e) => onChange(e.target.value), onFocus: () => setIsFocused(true), onBlur: () => setIsFocused(false), onSelect: (e) => {
        const target = e.target;
        setCursorPosition(target.selectionStart);
    }, placeholder: placeholder, style: {
        width: '100%',
        height,
        padding: 12,
        background: enableSyntaxHighlighting ? 'transparent' : colors.background,
        border: `2px solid ${isFocused ? colors.accent : colors.border}`
    }, "borderRadius:showToolbar": true });
'0 0 6px 6px';
6,
    borderTop;
showToolbar ? 'none' : `2px solid ${isFocused ? colors.accent : colors.border}`;
color: enableSyntaxHighlighting ? 'transparent' : colors.text,
    fontSize;
14,
    fontFamily;
'SFMono-Regular, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    lineHeight;
1.5,
    resize;
'vertical',
    outline;
'none',
    caretColor;
colors.text,
    position;
'relative',
    zIndex;
2;
/>;
div >
    { /* Live Preview for template nodes */};
{
    (nodeType === 'concat' || nodeType === 'template') && value.includes('{{') && ()
        < div;
    style = {};
    {
        marginTop: 8,
            padding;
        8,
            background;
        colors.toolbar,
            border;
        `1px solid ${colors.border}`;
    }
}
borderRadius: 4,
    fontSize;
12;
    >
        (_jsx("div", { style: { color: colors.text, opacity: 0.7, marginBottom: 4 }, children: "Template Preview:" })
            ,
                _jsx("div", { style: { color: colors.text, fontFamily: 'monospace' }, children: renderTemplatePreview(value) }));
div >
;
div >
;
;
;
const ToolbarButton = ({ onClick, title, children, theme }) => {
    const getButtonColors = () => {
        switch (theme) {
            case 'cinema':
                return { bg: '#4a5568', hover: '#718096', text: '#e2e8f0' };
            case 'dark':
                return { bg: '#2d3748', hover: '#4a5568', text: '#f7fafc' };
            case 'light':
            default:
                return { bg: '#e2e8f0', hover: '#cbd5e0', text: '#2d3748' };
        }
        ;
        const colors = getButtonColors();
        return;
        _jsx("button", { onClick: onClick, title: title, style: {
                padding: '4px 8px',
                background: colors.bg,
                color: colors.text,
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
                transition: 'background 0.2s ease',
            }, onMouseEnter: (e) => {
                e.target.style.background = colors.hover;
            }, onMouseLeave: (e) => {
                e.target.style.background = colors.bg;
            }, children: children });
    };
};
;
;
// Template preview renderer
const renderTemplatePreview = (template) => {
    return template
        .replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
        const varName = variable.trim();
        // Sample data for preview
        const sampleData = {
            'name': 'John Doe',
            'title': 'Software Engineer',
            'company': 'Tech Corp',
            'date': '2024-01-15',
            'variable': 'sample_value',
            'item': 'example_item',
            'condition': 'true',
        };
        return sampleData[varName] || `[${varName}]`;
    });
};
;
// Specialized Rich Text Editor for different node types
export const NodeSpecificRichEditor, string;
data: NodeData;
field: string;
onChange: (field, value) => void ;
theme ?  : 'light' | 'dark' | 'cinema';
 > ;
({ nodeType, data, field, onChange, theme = 'cinema' }) => {
    const value = data[field] || '';
    const getEditorConfig = () => {
        switch (nodeType) {
            case 'concat':
                return {
                    placeholder: 'Enter template with {{variable}} placeholders...',
                    height: 100,
                    showToolbar: true,
                    enableSyntaxHighlighting: true
                };
            case 'conditional':
                return {
                    placeholder: 'Enter condition expression...',
                    height: 60,
                    showToolbar: true,
                    enableSyntaxHighlighting: true,
                };
            case 'output':
                return {
                    placeholder: 'Enter output text or template...',
                    height: 80,
                    showToolbar: false,
                    enableSyntaxHighlighting: false,
                };
            default:
                return {
                    placeholder: 'Enter text...',
                    height: 80,
                    showToolbar: false,
                    enableSyntaxHighlighting: false,
                };
        }
        ;
        const config = getEditorConfig();
        return;
        _jsx(RichTextEditor, { value: value, onChange: (newValue) => onChange(field, newValue), nodeType: nodeType, theme: theme, ...config });
    };
    ;
};
export default RichTextEditor;

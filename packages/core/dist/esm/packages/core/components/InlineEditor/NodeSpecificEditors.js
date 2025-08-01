import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { NodeSpecificRichEditor } from './RichTextEditor';
{
    const choices = data.choices || [];
    const [draggedIndex, setDraggedIndex] = useState(null);
    const addChoice = useCallback(() => {
        const newChoices = [...choices, { text: 'New choice', weight: 1 }];
        onChange('choices', newChoices);
    }, [choices, onChange]);
    const updateChoice = useCallback((index, field, value) => {
        const newChoices = [...choices];
        newChoices[index] = { ...newChoices[index], [field]: value };
        onChange('choices', newChoices);
    }, [choices, onChange]);
    const removeChoice = useCallback((index) => {
        const newChoices = choices.filter((_, i) => i !== index);
        onChange('choices', newChoices);
    }, [choices, onChange]);
    const reorderChoices = useCallback((fromIndex, toIndex) => {
        const newChoices = [...choices];
        const [movedChoice] = newChoices.splice(fromIndex, 1);
        newChoices.splice(toIndex, 0, movedChoice);
        onChange('choices', newChoices);
    }, [choices, onChange]);
    // Normalize weights to 100%
    const normalizeWeights = useCallback(() => {
        const totalWeight = choices.reduce((sum, choice) => sum + (choice.weight || 0), 0);
        if (totalWeight === 0)
            return;
        const normalizedChoices = choices.map(choice => ({}), ...choice, weight, Math.round((choice.weight / totalWeight) * 100));
    });
    onChange('choices', normalizedChoices);
}
[choices, onChange];
;
const getThemeColors = () => {
    switch (theme) {
        case 'cinema':
            return {
                background: '#4a5568',
                border: '#718096',
                text: '#e2e8f0',
                accent: '#4299e1',
                success: '#38a169',
                danger: '#e53e3e',
            };
        case 'dark':
            return {
                background: '#2d3748',
                border: '#4a5568',
                text: '#f7fafc',
                accent: '#38a169',
                success: '#48bb78',
                danger: '#f56565',
            };
        case 'light':
        default:
            return {
                background: '#ffffff',
                border: '#e2e8f0',
                text: '#2d3748',
                accent: '#3182ce',
                success: '#38a169',
                danger: '#e53e3e',
            };
    }
    ;
    const colors = getThemeColors();
    return;
    _jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                }, children: [_jsx("label", { style: { fontSize: 14, color: colors.text, fontWeight: 600 }, children: "Weighted Choices" }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: normalizeWeights, style: {
                                    padding: '4px 8px',
                                    background: colors.accent,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: 11,
                                    fontWeight: 600,
                                }, title: "Normalize weights to 100%", children: "Normalize" }), _jsx("button", { onClick: addChoice, style: {
                                    padding: '4px 8px',
                                    background: colors.success,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: 11,
                                    fontWeight: 600,
                                }, children: "+ Add Choice" })] })] }), _jsxs("div", { style: { maxHeight: 200, overflowY: 'auto', marginBottom: 8 }, children: [choices.map((choice, index) => ()
                        < div, key = { index }, draggable, onDragStart = {}()), " => setDraggedIndex(index)} onDragOver=", (e) => e.preventDefault(), "onDrop=", () => {
                        if (draggedIndex !== null && draggedIndex !== index) {
                            reorderChoices(draggedIndex, index);
                            setDraggedIndex(null);
                        }
                    }, "style=", {
                        display: 'flex',
                        gap: 8,
                        marginBottom: 8,
                        alignItems: 'center',
                        padding: 8,
                        background: draggedIndex === index ? colors.accent + '20' : colors.background,
                        border: `1px solid ${colors.border}`
                    }, ", borderRadius: 6, cursor: 'move'; }} >", _jsx("div", { style: {
                            width: 8,
                            height: 16,
                            background: colors.border,
                            borderRadius: 2,
                            cursor: 'grab',
                        } }), _jsx("input", { type: "text", value: choice.text, onChange: (e) => updateChoice(index, 'text', e.target.value), style: {
                            flex: 1,
                            padding: 8,
                            background: colors.background,
                            border: `1px solid ${colors.border}`
                        } }), ", borderRadius: 4, color: colors.text, fontSize: 13; }} placeholder=\"Choice text\" />", _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 4 }, children: [_jsx("input", { type: "range", min: "0", max: "100", value: choice.weight, onChange: (e) => updateChoice(index, 'weight', parseInt(e.target.value)), style: { width: 80 } }), _jsx("input", { type: "number", value: choice.weight, onChange: (e) => updateChoice(index, 'weight', parseInt(e.target.value)), style: {
                                    width: 50,
                                    padding: 4,
                                    background: colors.background,
                                    border: `1px solid ${colors.border}`
                                } }), ", borderRadius: 4, color: colors.text, fontSize: 12, textAlign: 'center'; }} min=\"0\" />", _jsx("span", { style: { fontSize: 12, color: colors.text, opacity: 0.7 }, children: "%" })] }), _jsx("button", { onClick: () => removeChoice(index), style: {
                            background: colors.danger,
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                            padding: '4px 8px',
                            fontWeight: 600,
                        }, title: "Remove choice", children: "\u00D7" })] }), "))}"] });
    { /* Weight Distribution Visualization */ }
    {
        choices.length > 0 && ()
            < div;
        style = {};
        {
            marginTop: 12;
        }
    }
     >
        (_jsx("div", { style: { fontSize: 12, color: colors.text, marginBottom: 4 }, children: "Weight Distribution:" })
            ,
                _jsxs("div", { style: {
                        display: 'flex',
                        height: 6,
                        borderRadius: 3,
                        overflow: 'hidden',
                        background: colors.border,
                    }, children: [choices.map((choice, index) => {
                            const totalWeight = choices.reduce((sum, c) => sum + (c.weight || 0), 0);
                            const percentage = totalWeight > 0 ? (choice.weight / totalWeight) * 100 : 0;
                            return;
                            _jsx("div", { style: {
                                    width: `${percentage}%`
                                } }, index),
                                background;
                        }), ": `hsl($", (index * 137.5) % 360, ", 70%, 60%)`} }, minWidth: percentage > 0 ? 2 : 0; }} title=", `${choice.text}: ${choice.weight} (${percentage.toFixed(1)}%)`, "/> ); })}"] }));
};
div >
;
{
    errors.choices && ()
        < span;
    style = {};
    {
        color: colors.danger, fontSize;
        12, marginTop;
        4;
    }
}
 >
    { errors, : .choices };
span >
;
div >
;
;
;
// Concat Node Editor with template preview
export const ConcatEditor = ({
    data,
    onChange,
    errors,
    theme = 'cinema'
});
{
    const [previewMode, setPreviewMode] = useState('edit');
    return;
    _jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                }, children: [_jsx("label", { style: { fontSize: 14, fontWeight: 600 }, children: "Template" }), _jsxs("div", { style: { display: 'flex', background: '#2d3748', borderRadius: 4, padding: 2 }, children: [_jsx("button", { onClick: () => setPreviewMode('edit'), style: {
                                    padding: '4px 8px',
                                    background: previewMode === 'edit' ? '#4299e1' : 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    fontSize: 11,
                                }, children: "Edit" }), _jsx("button", { onClick: () => setPreviewMode('preview'), style: {
                                    padding: '4px 8px',
                                    background: previewMode === 'preview' ? '#4299e1' : 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    fontSize: 11,
                                }, children: "Preview" })] })] }), previewMode === 'edit' ? ()
                < NodeSpecificRichEditor
                :
            , "nodeType=\"concat\" data=", data, "field=\"template\" onChange=", onChange, "theme=", theme, "/> ) : ()", _jsx("div", { style: {
                    padding: 12,
                    background: '#4a5568',
                    border: '1px solid #718096',
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'monospace',
                    minHeight: 100,
                    color: '#e2e8f0',
                }, children: data.template || 'No template configured' }), ")}", errors.template && ()
                < span, " style=", { color: '#e53e3e', fontSize: 12, marginTop: 4 }, ">", errors.template] });
}
div >
;
;
;
// Variable Node Editor with scope indicators
export const VariableEditor = ({
    data,
    onChange,
    errors,
    theme = 'cinema'
});
{
    const [variableScope, setVariableScope] = useState('local');
    return;
    _jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                }, children: [_jsx("label", { style: { fontSize: 14, fontWeight: 600 }, children: "Variable Configuration" }), _jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [_jsx("span", { style: { fontSize: 12, opacity: 0.7 }, children: "Scope:" }), _jsxs("select", { value: variableScope, onChange: (e) => setVariableScope(e.target.value), style: {
                                    padding: '4px 8px',
                                    background: '#4a5568',
                                    border: '1px solid #718096',
                                    borderRadius: 4,
                                    color: 'white',
                                    fontSize: 12,
                                }, children: [_jsx("option", { value: "local", children: "Local" }), _jsx("option", { value: "global", children: "Global" })] })] })] }), _jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: {
                            display: 'block',
                            marginBottom: 4,
                            fontSize: 12,
                            fontWeight: 500,
                        }, children: "Variable Name" }), _jsx("input", { type: "text", value: data.variableName || '', onChange: (e) => onChange('variableName', e.target.value), style: {
                            width: '100%',
                            padding: 8,
                            background: '#4a5568',
                            border: errors.variableName ? '1px solid #e53e3e' : '1px solid #718096',
                            borderRadius: 4,
                            color: 'white',
                            fontSize: 14,
                        }, placeholder: "Enter variable name (e.g., userName, itemCount)" }), errors.variableName && ()
                        < span, " style=", { color: '#e53e3e', fontSize: 12, marginTop: 4 }, ">", errors.variableName] }), ")}"] })
        ,
            _jsxs("div", { children: [_jsx("label", { style: {
                            display: 'block',
                            marginBottom: 4,
                            fontSize: 12,
                            fontWeight: 500,
                        }, children: "Default Value (Optional)" }), _jsx("input", { type: "text", value: data.defaultValue || '', onChange: (e) => onChange('defaultValue', e.target.value), style: {
                            width: '100%',
                            padding: 8,
                            background: '#4a5568',
                            border: '1px solid #718096',
                            borderRadius: 4,
                            color: 'white',
                            fontSize: 14,
                        }, placeholder: "Enter default value" })] });
    { /* Variable Usage Hint */ }
    _jsxs("div", { style: {
            marginTop: 12,
            padding: 8,
            background: '#2d3748',
            border: '1px solid #4299e1',
            borderRadius: 4,
            fontSize: 12,
        }, children: [_jsx("div", { style: { color: '#4299e1', fontWeight: 600, marginBottom: 4 }, children: "Usage:" }), _jsx("div", { style: { color: '#a0aec0', fontFamily: 'monospace' }, children: `{{${data.variableName || 'variableName'}}}` })] });
    div >
    ;
    ;
}
;
// Conditional Node Editor with visual logic builder
export const ConditionalEditor = ({
    data,
    onChange,
    errors,
    theme = 'cinema'
});
{
    const [conditionMode, setConditionMode] = useState('simple');
    const commonConditions = [
        { label: 'Variable exists', value: '{{variable}} != null' },
        { label: 'Variable equals', value: '{{variable}} == "value"' },
        { label: 'Variable contains', value: '{{variable}}.includes("text")' },
        { label: 'Number comparison', value: '{{number}} > 0' },
        { label: 'Multiple conditions', value: '{{var1}} && {{var2}}' }
    ];
    return;
    _jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                }, children: [_jsx("label", { style: { fontSize: 14, fontWeight: 600 }, children: "Condition Logic" }), _jsxs("div", { style: { display: 'flex', background: '#2d3748', borderRadius: 4, padding: 2 }, children: [_jsx("button", { onClick: () => setConditionMode('simple'), style: {
                                    padding: '4px 8px',
                                    background: conditionMode === 'simple' ? '#4299e1' : 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    fontSize: 11,
                                }, children: "Simple" }), _jsx("button", { onClick: () => setConditionMode('advanced'), style: {
                                    padding: '4px 8px',
                                    background: conditionMode === 'advanced' ? '#4299e1' : 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    fontSize: 11,
                                }, children: "Advanced" })] })] }), conditionMode === 'simple' ? ()
                < div >
                (_jsx("label", { style: {
                        display: 'block',
                        marginBottom: 4,
                        fontSize: 12,
                        fontWeight: 500,
                    }, children: "Choose a template:" })
                    ,
                        _jsxs("select", { onChange: (e) => onChange('condition', e.target.value), style: {
                                width: '100%',
                                padding: 8,
                                background: '#4a5568',
                                border: '1px solid #718096',
                                borderRadius: 4,
                                color: 'white',
                                fontSize: 13,
                                marginBottom: 8,
                            }, children: [_jsx("option", { value: "", children: "Select a condition template..." }), commonConditions.map((cond, index) => ()
                                    < option, key = { index }, value = { cond, : .value } >
                                    { cond, : .label })] }))
                :
            , "))}"] });
    div >
    ;
    null;
}
_jsx(NodeSpecificRichEditor, { nodeType: "conditional", data: data, field: "condition", onChange: onChange, theme: theme });
{ /* Condition Testing */ }
_jsxs("div", { style: {
        marginTop: 12,
        padding: 8,
        background: '#2d3748',
        border: '1px solid #718096',
        borderRadius: 4,
    }, children: [_jsx("div", { style: { fontSize: 12, fontWeight: 600, marginBottom: 4 }, children: "Test Condition:" }), _jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [_jsx("button", { style: {
                        padding: '4px 8px',
                        background: '#38a169',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 11,
                    }, children: "Validate" }), _jsx("span", { style: { fontSize: 12, color: '#a0aec0' }, children: "Test with sample data" })] })] });
{
    errors.condition && ()
        < span;
    style = {};
    {
        color: '#e53e3e', fontSize;
        12, marginTop;
        4;
    }
}
 >
    { errors, : .condition };
span >
;
div >
;
;
;
// Output Node Editor with formatting preview
export const OutputEditor = ({
    data,
    onChange,
    errors,
    theme = 'cinema'
});
{
    const formats = [
        { value: 'text', label: 'Plain Text' },
        { value: 'json', label: 'JSON' },
        { value: 'markdown', label: 'Markdown' },
        { value: 'html', label: 'HTML' },
        { value: 'csv', label: 'CSV' }
    ];
    return;
    _jsx("div", { children: _jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: {
                        display: 'block',
                        marginBottom: 4,
                        fontSize: 12,
                        fontWeight: 500,
                    }, children: "Output Format" }), _jsx("select", { value: data.format || 'text', onChange: (e) => onChange('format', e.target.value), style: {
                        width: '100%',
                        padding: 8,
                        background: '#4a5568',
                        border: '1px solid #718096',
                        borderRadius: 4,
                        color: 'white',
                        fontSize: 14,
                    }, children: formats.map(format => ()
                        < option, key = { format, : .value }, value = { format, : .value } >
                        { format, : .label }) }), "))}"] }) })
        ,
            _jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("label", { style: {
                            display: 'block',
                            marginBottom: 4,
                            fontSize: 12,
                            fontWeight: 500,
                        }, children: "Output Template" }), _jsx(NodeSpecificRichEditor, { nodeType: "output", data: data, field: "outputTemplate", onChange: onChange, theme: theme })] });
    { /* Format-specific options */ }
    {
        data.format === 'json' && ()
            < div;
        style = {};
        {
            marginBottom: 12;
        }
    }
     >
        _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("input", { type: "checkbox", checked: data.prettyPrint || false, onChange: (e) => onChange('prettyPrint', e.target.checked) }), _jsx("span", { style: { fontSize: 12 }, children: "Pretty print JSON" })] });
    div >
    ;
}
{ /* Export Options */ }
_jsxs("div", { style: {
        marginTop: 12,
        padding: 8,
        background: '#2d3748',
        border: '1px solid #718096',
        borderRadius: 4,
    }, children: [_jsx("div", { style: { fontSize: 12, fontWeight: 600, marginBottom: 8 }, children: "Export Options:" }), _jsxs("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: [_jsx("button", { style: {
                        padding: '4px 8px',
                        background: '#4299e1',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 11,
                    }, children: "Save to File" }), _jsx("button", { style: {
                        padding: '4px 8px',
                        background: '#38a169',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 11,
                    }, children: "Copy to Clipboard" })] })] });
div >
;
;
;
export { NodeSpecificRichEditor };

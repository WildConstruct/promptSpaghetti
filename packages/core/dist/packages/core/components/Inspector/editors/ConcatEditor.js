import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextFieldEditor } from '../TextFieldEditor';
import { EnhancedTextAreaEditor } from '../EnhancedTextAreaEditor';
import { SelectEditor } from '../SelectEditor';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';
import { TemplateEditor } from '../TemplateEditor';
{ /* BASIC LEVEL: Essential concatenation settings */ }
_jsxs(ProgressiveDisclosureSection, { title: "Essential Settings", level: "basic", description: "Core concatenation configuration", defaultExpanded: true, priority: "critical", fieldName: "template", children: [wrapNameHelp()
            < TextFieldEditor, "label=\"Concatenation Name\" value=", label, "fieldKey=\"label\" zodType=", null, "onChange=", (value) => handleFieldChange('label', value), "placeholder=\"Enter a name for this concatenation...\" /> )}", wrapTemplateHelp()
            < div, " style=", { marginBottom: 16 }, ">", _jsx("label", { style: {
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: '#e2e8f0',
                marginBottom: 6,
            }, children: "Output Template (Optional)" }), _jsx(TemplateEditor, { value: template, onChange: (value) => handleFieldChange('template', value), onVariablesChange: (variables, extractedVariables) => {
                handleFieldChange('extractedVariables', extractedVariables || []);
            }, placeholder: "Use a template like 'Combining {input1} and {input2}' for more control...", showPreview: true, showRealTimePreview: true, autoComplete: true, nodeType: "concat" }), _jsx("div", { style: {
                fontSize: 10,
                color: '#a0aec0',
                marginTop: 4,
            }, children: "If specified, uses template instead of simple concatenation. Variables become input ports." })] });
ProgressiveDisclosureSection >
    { /* ADVANCED LEVEL: Concatenation behavior settings */}
    < ProgressiveDisclosureSection;
title = "Concatenation Settings";
level = "advanced";
description = "Control how inputs are joined together";
defaultExpanded = { false:  };
priority = "important";
fieldName = "joinMode"
    >
        {}
    < SelectEditor;
label = "Join Mode";
value = { joinMode };
fieldKey = "joinMode";
options = { JOIN_MODES };
zodType = { null:  };
onChange = {}(value);
handleFieldChange('joinMode', value);
/>;
{
    (joinMode === 'first-n' || joinMode === 'last-n') && ()
        < TextFieldEditor;
    label = "Limit Count";
    value = { limitCount };
    fieldKey = "limitCount";
    type = "number";
    zodType = { null:  };
    onChange = {}(value);
    handleFieldChange('limitCount', value);
}
placeholder = "Number of inputs to include..."
    /  >
;
_jsx(SelectEditor, { label: "Separator", value: separatorMode, fieldKey: "separatorMode", options: SEPARATOR_PRESETS, zodType: null, onChange: handleSeparatorChange });
{
    separatorMode === 'custom' && ()
        < TextFieldEditor;
    label = "Custom Separator";
    value = { customSeparator };
    fieldKey = "customSeparator";
    zodType = { null:  };
    onChange = { handleCustomSeparatorChange };
    placeholder = "Enter custom separator..."
        /  >
    ;
}
_jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("label", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: '#e2e8f0',
                cursor: 'pointer',
                marginBottom: 8,
            }, children: [_jsx("input", { type: "checkbox", checked: trimInputs, onChange: (e) => handleFieldChange('trimInputs', e.target.checked), style: {
                        width: 14,
                        height: 14,
                        cursor: 'pointer',
                    } }), "Trim input whitespace"] }), _jsxs("label", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: '#e2e8f0',
                cursor: 'pointer',
            }, children: [_jsx("input", { type: "checkbox", checked: preserveOrder, onChange: (e) => handleFieldChange('preserveOrder', e.target.checked), style: {
                        width: 14,
                        height: 14,
                        cursor: 'pointer',
                    } }), "Preserve input order"] })] });
ProgressiveDisclosureSection >
    { /* ADVANCED LEVEL: Text wrapping options */}
    < ProgressiveDisclosureSection;
title = "Text Wrapping";
level = "advanced";
description = "Add prefix and suffix text around the concatenated result";
defaultExpanded = { false:  };
priority = "standard";
fieldName = "prefix"
    >
        (_jsx(EnhancedTextAreaEditor, { label: "Prefix", value: prefix, fieldKey: "prefix", zodType: null, onChange: (value) => handleFieldChange('prefix', value), placeholder: "Text to add before concatenated result...", rows: 2, enableInlineCorrections: true, showCorrectionHighlights: true })
            ,
                _jsx(EnhancedTextAreaEditor, { label: "Suffix", value: suffix, fieldKey: "suffix", zodType: null, onChange: (value) => handleFieldChange('suffix', value), placeholder: "Text to add after concatenated result...", rows: 2, enableInlineCorrections: true, showCorrectionHighlights: true }));
ProgressiveDisclosureSection >
    { /* DEBUG LEVEL: Configuration preview and debugging */}
    < ProgressiveDisclosureSection;
title = "Configuration Preview";
level = "debug";
description = "Preview concatenation configuration and debug information";
defaultExpanded = { false:  };
priority = "standard";
fieldName = "preview"
    >
        _jsxs("div", { style: {
                background: '#1a202c',
                border: '1px solid #4a5568',
                borderRadius: 4,
                padding: 12,
                fontSize: 12,
                color: '#e2e8f0',
            }, children: [_jsx("div", { style: { marginBottom: 8, fontWeight: 500 }, children: "Concatenation Configuration:" }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: '#a0aec0' }, children: "Mode:" }), " ", JOIN_MODES.find(m => m.value === joinMode)?.label] }), (joinMode === 'first-n' || joinMode === 'last-n') && ()
                    < div, " style=", { marginBottom: 4 }, ">", _jsx("span", { style: { color: '#a0aec0' }, children: "Limit:" }), " ", limitCount, " inputs"] });
_jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: '#a0aec0' }, children: "Separator:" }), " ", getDisplaySeparator()] })
    ,
        _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: '#a0aec0' }, children: "Options:" }), ' ', [
                    trimInputs && 'Trim inputs',
                    preserveOrder && 'Preserve order'
                ].filter(Boolean).join(', ') || 'None'] })
            ,
                _jsxs("div", { style: {
                        marginTop: 12,
                        padding: 8,
                        background: 'rgba(66, 153, 225, 0.1)',
                        borderRadius: 2,
                    }, children: [_jsx("div", { style: { color: '#a0aec0', fontSize: 10, marginBottom: 4 }, children: "Example with inputs [\"Hello\", \"World\", \"!\"]:" }), _jsxs("div", { style: { fontFamily: 'monospace', fontSize: 11 }, children: [prefix, "Hello", separatorMode === 'custom' ? customSeparator : separator, "World", separatorMode === 'custom' ? customSeparator : separator, "!", suffix] })] });
{
    (prefix || suffix) && ()
        < div;
    style = {};
    {
        marginTop: 8,
            fontSize;
        10,
            color;
        '#a0aec0',
            fontStyle;
        'italic',
        ;
    }
}
 >
        * Prefix;
and;
suffix;
are;
applied;
to;
the;
final;
concatenated;
result;
div >
;
div >
;
ProgressiveDisclosureSection >
;
div >
;
;
;
export default ConcatEditor;

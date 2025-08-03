import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextFieldEditor } from '../TextFieldEditor';
import { SelectEditor } from '../SelectEditor';
import { TemplateEditor } from '../TemplateEditor';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';
from;
'../../help';
;
// Contextual help for template editor
const { wrapWithHelp: wrapTemplateHelp } = useContextualHelp({});
id: 'variable-template-field';
title: 'Value Template';
description: 'Define what value to store using templates. Use {variable} syntax to reference other stored values.';
category: 'basic';
trigger: 'hover';
position: 'top';
showOnDisclosureLevel: ['basic', 'advanced', 'debug'];
examples: ['Character: {character_name}', '{mood} character in {location}'];
relatedFeatures: ['variable-system', 'template-engine'];
priority: 'medium';
;
return;
_jsxs("div", { className: "variable-editor", children: [_jsxs(ProgressiveDisclosureSection, { title: "Variable Settings", level: "basic", description: isSetVariable ? 'Define what value to store' : 'Retrieve stored values', defaultExpanded: true, priority: "critical", fieldName: isSetVariable ? 'value' : 'variableName', children: [wrapVariableNameHelp()
                    < TextFieldEditor, "label=", isSetVariable ? 'Store As' : 'Retrieve Variable', "value=", variableName || label, "fieldKey=", isSetVariable ? 'label' : 'variableName', "zodType=", null, "onChange=", (value) => handleFieldChange(isSetVariable ? 'label' : 'variableName', value), "placeholder=", isSetVariable ? 'Name for this stored value...' : 'Variable name to retrieve...', "/> )}", isSetVariable && wrapTemplateHelp()
                    < div, " style=", { marginBottom: 16 }, ">", _jsx("label", { style: {
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#e2e8f0',
                        marginBottom: 6
                    }, children: "Value Template" }), _jsx(TemplateEditor, { value: template || value, onChange: (val) => {
                        handleFieldChange('template', val);
                        handleFieldChange('value', val); // Maintain backward compatibility
                    }, onVariablesChange: (variables, extractedVariables) => {
                        handleFieldChange('extractedVariables', extractedVariables || []);
                        // Apply automatic type inference from the first variable (simplified)
                        if (extractedVariables && extractedVariables.length > 0) {
                            const firstVar = extractedVariables[0];
                            if (firstVar.inferredType && firstVar.inferredType !== 'auto') {
                                handleFieldChange('variableType', firstVar.inferredType);
                                if (firstVar.defaultValue && !defaultValue) {
                                    handleFieldChange('defaultValue', firstVar.defaultValue);
                                }
                            }
                            placeholder = "Enter value template... Use {variable} syntax for dynamic content.";
                            showPreview = { true:  };
                            autoComplete = { true:  };
                            nodeType = "setVariable"
                                /  >
                                _jsxs("div", { style: {
                                        fontSize: 10,
                                        color: '#a0aec0',
                                        marginTop: 4
                                    }, children: ["Use natural language with ", '{variable}', " syntax. Variables become input ports."] });
                            { /* Show type inference information (backward compatible) */ }
                            {
                                nodeData.extractedVariables?.length > 0 && ()
                                    < div;
                                style = {};
                                {
                                    fontSize: 10;
                                    color: '#4299e1';
                                    marginTop: 6;
                                    padding: 6;
                                    background: 'rgba(66, 153, 225, 0.1)';
                                    borderRadius: 4;
                                    border: '1px solid rgba(66, 153, 225, 0.3)';
                                }
                            }
                             >
                                _jsx("strong", { children: "\uD83E\uDD16 Auto-detected:" });
                            {
                                ' ';
                            }
                            {
                                nodeData.extractedVariables?.map((v, idx) => ()
                                    < span, key = { v, : .name || `var_${idx}` } > );
                            }
                            {
                                v.name || 'variable';
                            }
                            ({ v, : .inferredType || 'auto' });
                            {
                                v.defaultValue && ` = "${v.defaultValue}"`;
                            }
                            {
                                idx < nodeData.extractedVariables.length - 1 ? ', ' : '';
                            }
                        }
                    } })] }), ")) || 'No variables detected'}"] });
div >
;
{
    isGetVariable && ()
        < div;
    style = {};
    {
        fontSize: 12;
        color: '#a0aec0';
        padding: 12;
        background: 'rgba(66, 153, 225, 0.1)';
        borderRadius: 6;
        border: '1px solid rgba(66, 153, 225, 0.3)';
    }
}
 >
    _jsx("strong", { children: "\uD83D\uDCA1 Simplified Workflow:" });
Variables;
are;
automatically;
managed;
by;
templates.
;
This;
node;
retrieves;
values;
stored;
by;
template - based;
nodes.
;
div >
;
ProgressiveDisclosureSection >
    { /* ADVANCED LEVEL: Technical settings (debug mode only) */};
{
    debugMode && ()
        < ProgressiveDisclosureSection;
    title = "Advanced Settings";
    level = "advanced";
    description = "Technical configuration for developers";
    defaultExpanded = { false:  };
    priority = "optional";
    fieldName = "variableType"
        >
            (_jsx(TextFieldEditor, { label: "Technical Variable Name", value: variableName, fieldKey: "variableName", zodType: null, onChange: (value) => handleFieldChange('variableName', value), placeholder: "Internal variable identifier..." })
                ,
                    _jsx(SelectEditor, { label: "Variable Type", value: variableType, fieldKey: "variableType", options: VARIABLE_TYPES, zodType: null, onChange: (value) => handleFieldChange('variableType', value) }));
    {
        isSetVariable && ()
            <  >
            (_jsx("div", { style: { marginBottom: 16 }, children: _jsxs("label", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        color: '#e2e8f0',
                        cursor: 'pointer'
                    }, children: [_jsx("input", { type: "checkbox", checked: allowOverwrite, onChange: (e) => handleFieldChange('allowOverwrite', e.target.checked), style: {
                                width: 14,
                                height: 14,
                                cursor: 'pointer'
                            } }), "Allow overwriting existing variable"] }) })
                ,
                    _jsx(SelectEditor, { label: "Scope", value: scope, fieldKey: "scope", options: SCOPE_OPTIONS, zodType: null, onChange: (value) => handleFieldChange('scope', value) }));
         >
        ;
    }
    {
        isGetVariable && ()
            <  >
            (_jsx("div", { style: { marginBottom: 16 }, children: _jsxs("label", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        color: '#e2e8f0',
                        cursor: 'pointer'
                    }, children: [_jsx("input", { type: "checkbox", checked: required, onChange: (e) => handleFieldChange('required', e.target.checked), style: {
                                width: 14,
                                height: 14,
                                cursor: 'pointer'
                            } }), "Variable is required"] }) })
                ,
                    _jsx(TextFieldEditor, { label: "Default Value", value: defaultValue, fieldKey: "defaultValue", zodType: null, onChange: (value) => handleFieldChange('defaultValue', value), placeholder: "Fallback value if variable not found..." }));
         >
        ;
    }
    ProgressiveDisclosureSection >
    ;
}
div >
;
;
;
export default VariableEditor;

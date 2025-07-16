import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { TextFieldEditor } from "../TextFieldEditor";
import { TextAreaEditor } from "../TextAreaEditor";
import { SelectEditor } from "../SelectEditor";
import { CollapsibleSection } from "../CollapsibleSection";
const VARIABLE_TYPES = [
    { value: "string", label: "Text (String)" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Boolean (true/false)" },
    { value: "array", label: "Array/List" },
    { value: "object", label: "Object/JSON" },
    { value: "auto", label: "Auto-detect type" },
];
const SCOPE_OPTIONS = [
    { value: "global", label: "Global (entire execution)" },
    { value: "local", label: "Local (current branch)" },
    { value: "session", label: "Session (persistent)" },
];
export const VariableEditor = (props) => {
    const { nodeData, onChange, nodeType } = props;
    // Variable specific fields
    const label = nodeData.label || "";
    const variableName = nodeData.variableName || "";
    const variableType = nodeData.variableType || "auto";
    const defaultValue = nodeData.defaultValue || "";
    const scope = nodeData.scope || "global";
    const persistent = nodeData.persistent ?? false;
    const value = nodeData.value || ""; // For SetVariable
    const allowOverwrite = nodeData.allowOverwrite ?? true; // For SetVariable
    const required = nodeData.required ?? false; // For GetVariable
    // State for collapsible sections
    const [basicPropsCollapsed, setBasicPropsCollapsed] = useState(false);
    const [setVarCollapsed, setSetVarCollapsed] = useState(false);
    const [getVarCollapsed, setGetVarCollapsed] = useState(false);
    const [scopeCollapsed, setScopeCollapsed] = useState(true);
    const [typeInfoCollapsed, setTypeInfoCollapsed] = useState(true);
    const [previewCollapsed, setPreviewCollapsed] = useState(true);
    const handleFieldChange = (field, value) => {
        onChange({ [field]: value });
    };
    const isSetVariable = nodeType === 'SetVariable';
    const isGetVariable = nodeType === 'GetVariable';
    return (_jsxs("div", { className: "variable-editor", children: [_jsxs(CollapsibleSection, { title: "Basic Properties", collapsed: basicPropsCollapsed, onToggle: () => setBasicPropsCollapsed(!basicPropsCollapsed), children: [_jsx(TextFieldEditor, { label: "Label", value: label, fieldKey: "label", zodType: null, onChange: (value) => handleFieldChange("label", value), placeholder: `Enter ${nodeType.toLowerCase()} label...` }), _jsx(TextFieldEditor, { label: "Variable Name", value: variableName, fieldKey: "variableName", zodType: null, onChange: (value) => handleFieldChange("variableName", value), placeholder: "Enter variable name (e.g., userInput, counter)..." }), _jsx(SelectEditor, { label: "Variable Type", value: variableType, fieldKey: "variableType", options: VARIABLE_TYPES, zodType: null, onChange: (value) => handleFieldChange("variableType", value) })] }), isSetVariable && (_jsxs(CollapsibleSection, { title: "Set Variable Configuration", collapsed: setVarCollapsed, onToggle: () => setSetVarCollapsed(!setVarCollapsed), children: [_jsx(TextAreaEditor, { label: "Value", value: value, fieldKey: "value", zodType: null, onChange: (value) => handleFieldChange("value", value), placeholder: "Enter the value to set for this variable...", rows: 3, showWordCount: true }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("label", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 12,
                                    color: "#e2e8f0",
                                    cursor: "pointer",
                                }, children: [_jsx("input", { type: "checkbox", checked: allowOverwrite, onChange: (e) => handleFieldChange("allowOverwrite", e.target.checked), style: {
                                            width: 14,
                                            height: 14,
                                            cursor: "pointer",
                                        } }), "Allow overwriting existing variable"] }), _jsx("div", { style: {
                                    fontSize: 10,
                                    color: "#a0aec0",
                                    marginTop: 2,
                                    marginLeft: 22,
                                }, children: "If unchecked, setting an existing variable will fail" })] })] })), isGetVariable && (_jsxs(CollapsibleSection, { title: "Get Variable Configuration", collapsed: getVarCollapsed, onToggle: () => setGetVarCollapsed(!getVarCollapsed), children: [_jsx(TextAreaEditor, { label: "Default Value", value: defaultValue, fieldKey: "defaultValue", zodType: null, onChange: (value) => handleFieldChange("defaultValue", value), placeholder: "Value to use if variable doesn't exist (optional)...", rows: 2 }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("label", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 12,
                                    color: "#e2e8f0",
                                    cursor: "pointer",
                                }, children: [_jsx("input", { type: "checkbox", checked: required, onChange: (e) => handleFieldChange("required", e.target.checked), style: {
                                            width: 14,
                                            height: 14,
                                            cursor: "pointer",
                                        } }), "Variable is required"] }), _jsx("div", { style: {
                                    fontSize: 10,
                                    color: "#a0aec0",
                                    marginTop: 2,
                                    marginLeft: 22,
                                }, children: "If checked, execution will fail if variable doesn't exist and no default is provided" })] })] })), _jsxs(CollapsibleSection, { title: "Scope & Persistence", collapsed: scopeCollapsed, onToggle: () => setScopeCollapsed(!scopeCollapsed), children: [_jsx(SelectEditor, { label: "Scope", value: scope, fieldKey: "scope", options: SCOPE_OPTIONS, zodType: null, onChange: (value) => handleFieldChange("scope", value) }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("label", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 12,
                                    color: "#e2e8f0",
                                    cursor: "pointer",
                                }, children: [_jsx("input", { type: "checkbox", checked: persistent, onChange: (e) => handleFieldChange("persistent", e.target.checked), style: {
                                            width: 14,
                                            height: 14,
                                            cursor: "pointer",
                                        } }), "Persistent across sessions"] }), _jsx("div", { style: {
                                    fontSize: 10,
                                    color: "#a0aec0",
                                    marginTop: 2,
                                    marginLeft: 22,
                                }, children: "Variable will be saved and restored between executions" })] })] }), variableType !== "auto" && (_jsx(CollapsibleSection, { title: "Type Information", collapsed: typeInfoCollapsed, onToggle: () => setTypeInfoCollapsed(!typeInfoCollapsed), children: _jsxs("div", { style: {
                        background: "#1a202c",
                        border: "1px solid #4a5568",
                        borderRadius: 4,
                        padding: 12,
                        fontSize: 11,
                        color: "#e2e8f0",
                        lineHeight: 1.4,
                    }, children: [_jsxs("div", { style: { fontWeight: 500, marginBottom: 8 }, children: [VARIABLE_TYPES.find(t => t.value === variableType)?.label, " Format:"] }), variableType === "string" && (_jsxs("div", { children: [_jsx("div", { children: "\u2022 Any text value" }), _jsx("div", { children: "\u2022 Example: \"Hello World\"" })] })), variableType === "number" && (_jsxs("div", { children: [_jsx("div", { children: "\u2022 Numeric values (integer or decimal)" }), _jsx("div", { children: "\u2022 Examples: 42, 3.14, -10" })] })), variableType === "boolean" && (_jsxs("div", { children: [_jsx("div", { children: "\u2022 true or false values" }), _jsx("div", { children: "\u2022 Examples: true, false" }), _jsx("div", { children: "\u2022 Also accepts: yes/no, 1/0" })] })), variableType === "array" && (_jsxs("div", { children: [_jsx("div", { children: "\u2022 JSON array format" }), _jsx("div", { children: "\u2022 Examples: [\"item1\", \"item2\"], [1, 2, 3]" })] })), variableType === "object" && (_jsxs("div", { children: [_jsx("div", { children: "\u2022 JSON object format" }), _jsxs("div", { children: ["\u2022 Example: ", "{", "\"name\": \"John\", \"age\": 30", "}"] })] }))] }) })), _jsx(CollapsibleSection, { title: "Preview", collapsed: previewCollapsed, onToggle: () => setPreviewCollapsed(!previewCollapsed), children: _jsxs("div", { style: {
                        background: "#1a202c",
                        border: "1px solid #4a5568",
                        borderRadius: 4,
                        padding: 12,
                        fontSize: 12,
                        color: "#e2e8f0",
                    }, children: [_jsxs("div", { style: { marginBottom: 8, fontWeight: 500 }, children: [isSetVariable ? "Set Variable" : "Get Variable", " Configuration:"] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Variable:" }), " ", variableName || "〈not set〉"] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Type:" }), " ", VARIABLE_TYPES.find(t => t.value === variableType)?.label] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Scope:" }), " ", SCOPE_OPTIONS.find(s => s.value === scope)?.label] }), isSetVariable && (_jsxs(_Fragment, { children: [_jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Allow Overwrite:" }), " ", allowOverwrite ? "Yes" : "No"] }), value && (_jsxs("div", { style: {
                                        marginTop: 8,
                                        padding: 8,
                                        background: "rgba(66, 153, 225, 0.1)",
                                        borderRadius: 2,
                                    }, children: [_jsx("div", { style: { color: "#a0aec0", fontSize: 10, marginBottom: 4 }, children: "Value to set:" }), _jsx("div", { style: { fontFamily: "monospace", fontSize: 11 }, children: value })] }))] })), isGetVariable && (_jsxs(_Fragment, { children: [_jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Required:" }), " ", required ? "Yes" : "No"] }), defaultValue && (_jsxs("div", { style: {
                                        marginTop: 8,
                                        padding: 8,
                                        background: "rgba(66, 153, 225, 0.1)",
                                        borderRadius: 2,
                                    }, children: [_jsx("div", { style: { color: "#a0aec0", fontSize: 10, marginBottom: 4 }, children: "Default value:" }), _jsx("div", { style: { fontFamily: "monospace", fontSize: 11 }, children: defaultValue })] }))] })), _jsx("div", { style: { marginTop: 8, fontSize: 10, color: "#a0aec0" }, children: persistent && "• Persistent across sessions" })] }) })] }));
};

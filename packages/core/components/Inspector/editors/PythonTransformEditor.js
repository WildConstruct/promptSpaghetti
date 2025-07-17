import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import { TextFieldEditor } from "../TextFieldEditor";
import { TextAreaEditor } from "../TextAreaEditor";
import { SelectEditor } from "../SelectEditor";
import { CollapsibleSection } from "../CollapsibleSection";
const MEMORY_LIMIT_OPTIONS = [
    { value: "64MB", label: "64MB" },
    { value: "128MB", label: "128MB" },
    { value: "256MB", label: "256MB" },
    { value: "512MB", label: "512MB" },
    { value: "1GB", label: "1GB" },
];
const TIMEOUT_OPTIONS = [
    { value: "5", label: "5 seconds" },
    { value: "10", label: "10 seconds" },
    { value: "30", label: "30 seconds" },
    { value: "60", label: "1 minute" },
    { value: "300", label: "5 minutes" },
];
const FALLBACK_BEHAVIOR_OPTIONS = [
    { value: "error", label: "Throw Error" },
    { value: "skip", label: "Skip (Empty Output)" },
    { value: "default", label: "Use Default Value" },
];
const COMMON_MODULES = [
    'json', 'math', 'datetime', 'random', 'string', 'itertools',
    'collections', 'functools', 'operator', 'copy', 'uuid', 'hashlib',
    're', 'base64', 'urllib.parse'
];
export const PythonTransformEditor = (props) => {
    const { nodeData, onChange } = props;
    // Python specific fields
    const code = nodeData.code || `def transform(input_data):\n    # Your Python code here\n    return input_data`;
    const timeout = nodeData.timeout || 30;
    const memoryLimit = nodeData.memoryLimit || "128MB";
    const allowedModules = nodeData.allowedModules || ['json', 'math', 'datetime'];
    const pythonConfig = nodeData.pythonConfig || {};
    const strictMode = pythonConfig.strictMode ?? true;
    const enableCaching = pythonConfig.enableCaching ?? true;
    const executorUrl = pythonConfig.executorUrl || "";
    const retryAttempts = pythonConfig.retryAttempts || 3;
    const fallbackBehavior = pythonConfig.fallbackBehavior || "error";
    const defaultOutput = pythonConfig.defaultOutput || "";
    // State for collapsible sections
    const [codeEditorCollapsed, setCodeEditorCollapsed] = useState(false);
    const [resourcesCollapsed, setResourcesCollapsed] = useState(false);
    const [modulesCollapsed, setModulesCollapsed] = useState(true);
    const [advancedCollapsed, setAdvancedCollapsed] = useState(true);
    const [previewCollapsed, setPreviewCollapsed] = useState(true);
    // State for validation
    const [codeValidation, setCodeValidation] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const handleFieldChange = (field, value) => {
        onChange({ [field]: value });
    };
    const handlePythonConfigChange = (field, value) => {
        onChange({
            pythonConfig: {
                ...pythonConfig,
                [field]: value
            }
        });
    };
    const handleModuleToggle = (module) => {
        const newModules = allowedModules.includes(module)
            ? allowedModules.filter(m => m !== module)
            : [...allowedModules, module];
        onChange({ allowedModules: newModules });
    };
    const addCustomModule = () => {
        const moduleName = prompt("Enter module name:");
        if (moduleName && !allowedModules.includes(moduleName)) {
            onChange({ allowedModules: [...allowedModules, moduleName] });
        }
    };
    const removeModule = (module) => {
        onChange({ allowedModules: allowedModules.filter(m => m !== module) });
    };
    // Validate code on change (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (code.trim()) {
                validateCode();
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [code]);
    const validateCode = async () => {
        setIsValidating(true);
        try {
            // In a real implementation, this would call the Python executor's validate endpoint
            // For now, we'll do basic validation
            const errors = [];
            const warnings = [];
            // Check for required transform function
            if (!code.includes('def transform(')) {
                errors.push('Code must define a transform function');
            }
            // Check for dangerous patterns
            const dangerousPatterns = [
                'eval(', 'exec(', '__import__', 'open(', 'file(',
                'subprocess', 'os.system', 'socket.', 'urllib.'
            ];
            for (const pattern of dangerousPatterns) {
                if (code.includes(pattern)) {
                    warnings.push(`Potentially dangerous pattern detected: ${pattern}`);
                }
            }
            // Check for infinite loops
            if (code.includes('while True:')) {
                warnings.push('Potential infinite loop detected');
            }
            setCodeValidation({
                valid: errors.length === 0,
                errors,
                warnings
            });
        }
        catch (error) {
            setCodeValidation({
                valid: false,
                errors: ['Validation service unavailable'],
                warnings: []
            });
        }
        finally {
            setIsValidating(false);
        }
    };
    const getCodeEditorStyles = () => {
        const baseStyles = {
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: 12,
            lineHeight: 1.4,
            padding: 12,
            border: "1px solid #4a5568",
            borderRadius: 4,
            background: "#1a202c",
            color: "#e2e8f0",
            resize: "vertical",
            minHeight: 200,
            maxHeight: 400,
        };
        if (codeValidation && !codeValidation.valid) {
            return { ...baseStyles, borderColor: "#e53e3e" };
        }
        return baseStyles;
    };
    return (_jsxs("div", { className: "python-transform-editor", children: [_jsx(CollapsibleSection, { title: "Python Code", collapsed: codeEditorCollapsed, onToggle: () => setCodeEditorCollapsed(!codeEditorCollapsed), children: _jsxs("div", { style: { marginBottom: 8 }, children: [_jsxs("div", { style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 8,
                            }, children: [_jsx("label", { style: {
                                        fontWeight: 500,
                                        color: "#e2e8f0",
                                        fontSize: 12,
                                    }, children: "Transform Function" }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [isValidating && (_jsx("span", { style: { fontSize: 10, color: "#4299e1" }, children: "Validating..." })), _jsx("button", { onClick: validateCode, disabled: isValidating, style: {
                                                padding: "4px 8px",
                                                fontSize: 10,
                                                background: "#4299e1",
                                                border: "none",
                                                borderRadius: 2,
                                                color: "white",
                                                cursor: "pointer",
                                                opacity: isValidating ? 0.5 : 1,
                                            }, children: "Validate" })] })] }), _jsx("textarea", { value: code, onChange: (e) => handleFieldChange("code", e.target.value), placeholder: "def transform(input_data):\\n    # Your Python code here\\n    return input_data", style: getCodeEditorStyles() }), codeValidation && (_jsxs("div", { style: { marginTop: 8 }, children: [codeValidation.errors.length > 0 && (_jsxs("div", { style: {
                                        background: "rgba(229, 62, 62, 0.1)",
                                        border: "1px solid #e53e3e",
                                        borderRadius: 4,
                                        padding: 8,
                                        marginBottom: 8,
                                    }, children: [_jsx("div", { style: { color: "#e53e3e", fontSize: 10, fontWeight: 500, marginBottom: 4 }, children: "Validation Errors:" }), codeValidation.errors.map((error, index) => (_jsxs("div", { style: { color: "#e53e3e", fontSize: 10 }, children: ["\u2022 ", error] }, index)))] })), codeValidation.warnings.length > 0 && (_jsxs("div", { style: {
                                        background: "rgba(237, 137, 54, 0.1)",
                                        border: "1px solid #ed8936",
                                        borderRadius: 4,
                                        padding: 8,
                                        marginBottom: 8,
                                    }, children: [_jsx("div", { style: { color: "#ed8936", fontSize: 10, fontWeight: 500, marginBottom: 4 }, children: "Validation Warnings:" }), codeValidation.warnings.map((warning, index) => (_jsxs("div", { style: { color: "#ed8936", fontSize: 10 }, children: ["\u2022 ", warning] }, index)))] })), codeValidation.valid && codeValidation.errors.length === 0 && (_jsx("div", { style: {
                                        background: "rgba(56, 178, 172, 0.1)",
                                        border: "1px solid #38b2ac",
                                        borderRadius: 4,
                                        padding: 8,
                                        marginBottom: 8,
                                    }, children: _jsx("div", { style: { color: "#38b2ac", fontSize: 10, fontWeight: 500 }, children: "\u2713 Code validation passed" }) }))] })), _jsxs("div", { style: {
                                fontSize: 10,
                                color: "#a0aec0",
                                lineHeight: 1.4,
                            }, children: [_jsx("strong", { children: "Requirements:" }), _jsx("br", {}), "\u2022 Must define a ", _jsx("code", { children: "transform(input_data)" }), " function", _jsx("br", {}), "\u2022 Function should return a string or value that can be converted to string", _jsx("br", {}), "\u2022 Use ", _jsx("code", { children: "input_data" }), " parameter to access the input from connected nodes", _jsx("br", {}), "\u2022 Access context variables via ", _jsx("code", { children: "context['variable_name']" })] })] }) }), _jsxs(CollapsibleSection, { title: "Resource Limits", collapsed: resourcesCollapsed, onToggle: () => setResourcesCollapsed(!resourcesCollapsed), children: [_jsx(SelectEditor, { label: "Memory Limit", value: memoryLimit, fieldKey: "memoryLimit", options: MEMORY_LIMIT_OPTIONS, zodType: null, onChange: (value) => handleFieldChange("memoryLimit", value) }), _jsx(SelectEditor, { label: "Timeout", value: timeout.toString(), fieldKey: "timeout", options: TIMEOUT_OPTIONS, zodType: null, onChange: (value) => handleFieldChange("timeout", parseInt(value)) }), _jsx("div", { style: {
                            fontSize: 10,
                            color: "#a0aec0",
                            lineHeight: 1.4,
                            marginTop: 8,
                        }, children: "Resource limits help prevent runaway code from consuming excessive system resources. Set appropriate limits based on your expected processing requirements." })] }), _jsx(CollapsibleSection, { title: "Allowed Modules", collapsed: modulesCollapsed, onToggle: () => setModulesCollapsed(!modulesCollapsed), children: _jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs("div", { style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 8,
                            }, children: [_jsx("label", { style: {
                                        fontWeight: 500,
                                        color: "#e2e8f0",
                                        fontSize: 12,
                                    }, children: "Available Modules" }), _jsx("button", { onClick: addCustomModule, style: {
                                        padding: "4px 8px",
                                        fontSize: 10,
                                        background: "#4299e1",
                                        border: "none",
                                        borderRadius: 2,
                                        color: "white",
                                        cursor: "pointer",
                                    }, children: "+ Custom" })] }), _jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("div", { style: { fontSize: 10, color: "#a0aec0", marginBottom: 8 }, children: "Common Modules:" }), _jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 }, children: COMMON_MODULES.map((module) => (_jsx("button", { onClick: () => handleModuleToggle(module), style: {
                                            padding: "2px 6px",
                                            fontSize: 10,
                                            background: allowedModules.includes(module) ? "#4299e1" : "#4a5568",
                                            border: "none",
                                            borderRadius: 2,
                                            color: "white",
                                            cursor: "pointer",
                                            opacity: allowedModules.includes(module) ? 1 : 0.7,
                                        }, children: module }, module))) })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 10, color: "#a0aec0", marginBottom: 8 }, children: "Currently Allowed:" }), _jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 }, children: allowedModules.map((module) => (_jsxs("div", { style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4,
                                            padding: "2px 6px",
                                            background: "#2d3748",
                                            border: "1px solid #4a5568",
                                            borderRadius: 2,
                                            fontSize: 10,
                                            color: "#e2e8f0",
                                        }, children: [module, _jsx("button", { onClick: () => removeModule(module), style: {
                                                    background: "none",
                                                    border: "none",
                                                    color: "#e53e3e",
                                                    cursor: "pointer",
                                                    fontSize: 10,
                                                    padding: 0,
                                                    width: 12,
                                                    height: 12,
                                                }, children: "\u2715" })] }, module))) })] })] }) }), _jsxs(CollapsibleSection, { title: "Advanced Settings", collapsed: advancedCollapsed, onToggle: () => setAdvancedCollapsed(!advancedCollapsed), children: [_jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("label", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 12,
                                    color: "#e2e8f0",
                                    cursor: "pointer",
                                }, children: [_jsx("input", { type: "checkbox", checked: strictMode, onChange: (e) => handlePythonConfigChange("strictMode", e.target.checked), style: {
                                            width: 14,
                                            height: 14,
                                            cursor: "pointer",
                                        } }), "Strict Mode"] }), _jsx("div", { style: {
                                    fontSize: 10,
                                    color: "#a0aec0",
                                    marginTop: 2,
                                    marginLeft: 22,
                                }, children: "Enable additional security restrictions and validation" })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("label", { style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 12,
                                    color: "#e2e8f0",
                                    cursor: "pointer",
                                }, children: [_jsx("input", { type: "checkbox", checked: enableCaching, onChange: (e) => handlePythonConfigChange("enableCaching", e.target.checked), style: {
                                            width: 14,
                                            height: 14,
                                            cursor: "pointer",
                                        } }), "Enable Caching"] }), _jsx("div", { style: {
                                    fontSize: 10,
                                    color: "#a0aec0",
                                    marginTop: 2,
                                    marginLeft: 22,
                                }, children: "Cache execution results for identical inputs to improve performance" })] }), _jsx(TextFieldEditor, { label: "Executor URL (Optional)", value: executorUrl, fieldKey: "executorUrl", zodType: null, onChange: (value) => handlePythonConfigChange("executorUrl", value), placeholder: "http://localhost:8001" }), _jsx(TextFieldEditor, { label: "Retry Attempts", value: retryAttempts.toString(), fieldKey: "retryAttempts", zodType: null, onChange: (value) => handlePythonConfigChange("retryAttempts", parseInt(value) || 0), placeholder: "3" }), _jsx(SelectEditor, { label: "Fallback Behavior", value: fallbackBehavior, fieldKey: "fallbackBehavior", options: FALLBACK_BEHAVIOR_OPTIONS, zodType: null, onChange: (value) => handlePythonConfigChange("fallbackBehavior", value) }), fallbackBehavior === 'default' && (_jsx(TextAreaEditor, { label: "Default Output", value: defaultOutput, fieldKey: "defaultOutput", zodType: null, onChange: (value) => handlePythonConfigChange("defaultOutput", value), placeholder: "Enter default output to use when execution fails...", rows: 3 }))] }), _jsx(CollapsibleSection, { title: "Configuration Preview", collapsed: previewCollapsed, onToggle: () => setPreviewCollapsed(!previewCollapsed), children: _jsxs("div", { style: {
                        background: "#1a202c",
                        border: "1px solid #4a5568",
                        borderRadius: 4,
                        padding: 12,
                        fontSize: 12,
                        color: "#e2e8f0",
                    }, children: [_jsx("div", { style: { marginBottom: 8, fontWeight: 500 }, children: "Python Execution Configuration:" }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Memory Limit:" }), " ", memoryLimit] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Timeout:" }), " ", timeout, " seconds"] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Modules:" }), " ", allowedModules.join(", ")] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Strict Mode:" }), " ", strictMode ? "Enabled" : "Disabled"] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Caching:" }), " ", enableCaching ? "Enabled" : "Disabled"] }), _jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Fallback:" }), " ", fallbackBehavior] }), executorUrl && (_jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("span", { style: { color: "#a0aec0" }, children: "Custom Executor:" }), " ", executorUrl] })), _jsxs("div", { style: {
                                marginTop: 8,
                                padding: 8,
                                background: "rgba(66, 153, 225, 0.1)",
                                borderRadius: 2,
                            }, children: [_jsx("div", { style: { color: "#a0aec0", fontSize: 10, marginBottom: 4 }, children: "Code Preview:" }), _jsxs("div", { style: {
                                        fontFamily: "monospace",
                                        fontSize: 9,
                                        maxHeight: 100,
                                        overflow: "auto",
                                        whiteSpace: "pre-wrap"
                                    }, children: [code.slice(0, 200), code.length > 200 ? "..." : ""] })] })] }) })] }));
};

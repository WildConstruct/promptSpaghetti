import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextFieldEditor } from '../TextFieldEditor';
import { TextAreaEditor } from '../TextAreaEditor';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';
/**
 * Epic 8.4 - Conditional Editor with Progressive Disclosure
 *
 * Three-tier disclosure system:
 * - Basic: Node name, default output, and simple conditional branches
 * - Advanced: Branch management and conditional logic controls
 * - Debug: Technical settings, strict mode, variable access controls
 */
export const ConditionalEditor = (props) => {
    const { nodeData, onChange } = props;
    // Conditional specific fields
    const branches = nodeData.branches || [];
    const defaultOutput = nodeData.defaultOutput || '';
    const name = nodeData.name || nodeData.label || 'Conditional';
    const allowVariableAccess = nodeData.allowVariableAccess ?? true;
    const strictMode = nodeData.strictMode ?? false;
    // No manual collapse state needed - managed by ProgressiveDisclosureSection
    const handleBranchesChange = (newBranches) => {
        onChange({ branches: newBranches });
    };
    const handleAddBranch = () => {
        const newBranch = {
            condition: '',
            output: '',
            label: `Branch ${branches.length + 1}`
        };
        handleBranchesChange([...branches, newBranch]);
    };
    const handleRemoveBranch = (index) => {
        const newBranches = branches.filter((_, i) => i !== index);
        handleBranchesChange(newBranches);
    };
    const handleUpdateBranch = (index, field, value) => {
        const newBranches = [...branches];
        newBranches[index] = { ...newBranches[index], [field]: value };
        handleBranchesChange(newBranches);
    };
    const handleNameChange = (value) => {
        onChange({ name: value, label: value });
    };
    const handleDefaultOutputChange = (value) => {
        onChange({ defaultOutput: value });
    };
    const handleAllowVariableAccessChange = (value) => {
        onChange({ allowVariableAccess: Boolean(value) });
    };
    const handleStrictModeChange = (value) => {
        onChange({ strictMode: Boolean(value) });
    };
    return (_jsxs("div", { className: "conditional-editor", children: [_jsxs(ProgressiveDisclosureSection, { title: "Essential Settings", level: "basic", description: "Core conditional logic for smart storytelling", defaultExpanded: true, priority: "critical", fieldName: "name", children: [_jsx("div", { style: { marginBottom: 16 }, children: _jsx(TextFieldEditor, { label: "Decision Name", value: name, fieldKey: "name", zodType: null, onChange: handleNameChange, placeholder: "e.g., Character Response, Plot Branch, Scene Choice" }) }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx(TextAreaEditor, { label: "Default Response", value: defaultOutput, fieldKey: "defaultOutput", zodType: null, onChange: handleDefaultOutputChange, placeholder: "What should happen when no specific conditions are met...", rows: 2 }), _jsx("div", { style: {
                                    fontSize: 10,
                                    color: '#a0aec0',
                                    marginTop: 4
                                }, children: "This will be used when none of your conditions match" })] })] }), _jsxs(ProgressiveDisclosureSection, { title: "Conditional Logic", level: "advanced", description: "Define conditions that trigger different responses", defaultExpanded: false, priority: "important", fieldName: "branches", children: [_jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 8
                                }, children: [_jsx("label", { style: {
                                            fontWeight: 500,
                                            color: '#e2e8f0',
                                            fontSize: 12
                                        }, children: "Conditional Logic" }), _jsx("button", { onClick: handleAddBranch, style: {
                                            padding: '4px 8px',
                                            fontSize: 10,
                                            background: '#4299e1',
                                            border: 'none',
                                            borderRadius: 2,
                                            color: '#fff',
                                            cursor: 'pointer'
                                        }, children: "Add Branch" })] }), branches.length === 0 ? (_jsx("div", { style: {
                                    background: '#2d3748',
                                    border: '1px solid #4a5568',
                                    borderRadius: 4,
                                    padding: 16,
                                    textAlign: 'center',
                                    color: '#a0aec0',
                                    fontSize: 12,
                                    fontStyle: 'italic'
                                }, children: "No conditional branches. Add a branch to start building logic." })) : (_jsx("div", { style: {
                                    background: '#2d3748',
                                    border: '1px solid #4a5568',
                                    borderRadius: 4,
                                    padding: 8
                                }, children: branches.map((branch, index) => (_jsxs("div", { style: {
                                        background: '#1a202c',
                                        border: '1px solid #4a5568',
                                        borderRadius: 4,
                                        padding: 12,
                                        marginBottom: index < branches.length - 1 ? 8 : 0
                                    }, children: [_jsxs("div", { style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: 8
                                            }, children: [_jsx("input", { type: "text", value: branch.label || `Branch ${index + 1}`, onChange: (e) => handleUpdateBranch(index, 'label', e.target.value), style: {
                                                        background: '#2d3748',
                                                        border: '1px solid #4a5568',
                                                        borderRadius: 2,
                                                        padding: '2px 6px',
                                                        color: '#e2e8f0',
                                                        fontSize: 11,
                                                        fontWeight: 500,
                                                        flex: 1,
                                                        marginRight: 8
                                                    }, placeholder: `Branch ${index + 1}` }), _jsx("button", { onClick: () => handleRemoveBranch(index), style: {
                                                        background: '#e53e3e',
                                                        border: 'none',
                                                        borderRadius: 2,
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                        padding: '2px 6px',
                                                        fontSize: 10
                                                    }, children: "Remove" })] }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("label", { style: {
                                                        display: 'block',
                                                        fontSize: 10,
                                                        color: '#a0aec0',
                                                        marginBottom: 4
                                                    }, children: "Condition Expression" }), _jsx("input", { type: "text", value: branch.condition, onChange: (e) => handleUpdateBranch(index, 'condition', e.target.value), style: {
                                                        width: '100%',
                                                        padding: 4,
                                                        border: '1px solid #4a5568',
                                                        borderRadius: 2,
                                                        background: '#2d3748',
                                                        color: '#e2e8f0',
                                                        fontSize: 11,
                                                        fontFamily: 'monospace'
                                                    }, placeholder: "e.g., variable > 5, hasVariable('debug'), startsWith(text, 'hello')" })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                        display: 'block',
                                                        fontSize: 10,
                                                        color: '#a0aec0',
                                                        marginBottom: 4
                                                    }, children: "Output Value" }), _jsx("textarea", { value: branch.output, onChange: (e) => handleUpdateBranch(index, 'output', e.target.value), rows: 2, style: {
                                                        width: '100%',
                                                        padding: 4,
                                                        border: '1px solid #4a5568',
                                                        borderRadius: 2,
                                                        background: '#2d3748',
                                                        color: '#e2e8f0',
                                                        fontSize: 11,
                                                        resize: 'vertical',
                                                        minHeight: 32
                                                    }, placeholder: "Output when condition is true..." })] })] }, index))) }))] }), _jsxs("div", { style: {
                            background: '#1a202c',
                            border: '1px solid #4a5568',
                            borderRadius: 4,
                            padding: 8,
                            marginTop: 12
                        }, children: [_jsx("div", { style: {
                                    fontSize: 11,
                                    fontWeight: 500,
                                    color: '#e2e8f0',
                                    marginBottom: 4
                                }, children: "Available Expression Functions:" }), _jsxs("div", { style: {
                                    fontSize: 10,
                                    color: '#a0aec0',
                                    fontFamily: 'monospace',
                                    lineHeight: 1.4
                                }, children: ["\u2022 Variable access: variable, hasVariable('name'), getVariable('name', 'default')", _jsx("br", {}), "\u2022 Comparisons: ===, !==, >, <, >=, <=, &&, ||, !", _jsx("br", {}), "\u2022 Strings: startsWith(str, 'prefix'), includes(str, 'substring'), isEmpty(str)", _jsx("br", {}), "\u2022 Arrays: includes(arr, item), length(arr)", _jsx("br", {}), "\u2022 Math: +, -, *, /, %, Math.min, Math.max, Math.abs", _jsx("br", {}), "\u2022 Regex: matches(str, 'pattern')"] })] })] }), _jsxs(ProgressiveDisclosureSection, { title: "Technical Settings & Preview", level: "debug", description: "Advanced expression controls and execution preview", defaultExpanded: false, priority: "supplementary", fieldName: "settings", children: [_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("div", { style: {
                                    fontSize: 11,
                                    fontWeight: 500,
                                    color: '#e2e8f0',
                                    marginBottom: 8
                                }, children: "Expression Engine Settings:" }), _jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs("label", { style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: 12,
                                            color: '#e2e8f0',
                                            cursor: 'pointer'
                                        }, children: [_jsx("input", { type: "checkbox", checked: allowVariableAccess, onChange: (e) => handleAllowVariableAccessChange(e.target.checked), style: { marginRight: 8 } }), "Allow Variable Access"] }), _jsx("div", { style: {
                                            fontSize: 10,
                                            color: '#a0aec0',
                                            marginTop: 2,
                                            marginLeft: 20
                                        }, children: "Enable access to execution context variables in expressions" })] }), _jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs("label", { style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: 12,
                                            color: '#e2e8f0',
                                            cursor: 'pointer'
                                        }, children: [_jsx("input", { type: "checkbox", checked: strictMode, onChange: (e) => handleStrictModeChange(e.target.checked), style: { marginRight: 8 } }), "Strict Mode"] }), _jsx("div", { style: {
                                            fontSize: 10,
                                            color: '#a0aec0',
                                            marginTop: 2,
                                            marginLeft: 20
                                        }, children: "Throw errors on expression evaluation failures (otherwise treats as false)" })] })] }), _jsxs("div", { style: {
                            background: '#1a202c',
                            border: '1px solid #4a5568',
                            borderRadius: 4,
                            padding: 8,
                            marginBottom: 16
                        }, children: [_jsx("div", { style: {
                                    fontSize: 11,
                                    fontWeight: 500,
                                    color: '#e2e8f0',
                                    marginBottom: 4
                                }, children: "Node Configuration:" }), _jsxs("div", { style: { fontSize: 10, color: '#a0aec0', lineHeight: 1.4 }, children: [_jsxs("div", { children: ["Node ID: ", props.nodeId] }), _jsx("div", { children: "Type: Conditional" }), _jsxs("div", { children: ["Branches: ", branches.length] }), _jsxs("div", { children: ["Variable Access: ", allowVariableAccess ? 'Enabled' : 'Disabled'] }), _jsxs("div", { children: ["Strict Mode: ", strictMode ? 'Enabled' : 'Disabled'] })] })] }), _jsx("div", { style: {
                            background: '#1a202c',
                            border: '1px solid #4a5568',
                            borderRadius: 4,
                            padding: 12,
                            fontSize: 12,
                            color: '#e2e8f0'
                        }, children: branches.length === 0 ? (_jsx("div", { style: { color: '#a0aec0', fontStyle: 'italic' }, children: "Add conditional branches to see logic preview" })) : (_jsxs("div", { children: [_jsx("div", { style: { marginBottom: 8, fontWeight: 500 }, children: "Execution Logic:" }), branches.map((branch, index) => (_jsxs("div", { style: {
                                        marginBottom: 6,
                                        padding: '4px 8px',
                                        background: 'rgba(66, 153, 225, 0.1)',
                                        borderRadius: 2,
                                        borderLeft: '3px solid #4299e1'
                                    }, children: [_jsxs("div", { style: { fontWeight: 500, marginBottom: 2 }, children: [index === 0 ? 'IF' : 'ELSE IF', " ", branch.label || `Branch ${index + 1}`, ":"] }), _jsx("div", { style: {
                                                fontFamily: 'monospace',
                                                fontSize: 10,
                                                color: '#90cdf4',
                                                marginBottom: 2
                                            }, children: branch.condition || 'No condition' }), _jsxs("div", { style: { fontSize: 10, color: '#a0aec0' }, children: ["\u2192 \"", branch.output || 'No output', "\""] })] }, index))), defaultOutput && (_jsxs("div", { style: {
                                        marginTop: 8,
                                        padding: '4px 8px',
                                        background: 'rgba(237, 137, 54, 0.1)',
                                        borderRadius: 2,
                                        borderLeft: '3px solid #ed8936'
                                    }, children: [_jsx("div", { style: { fontWeight: 500, marginBottom: 2 }, children: "ELSE (Default):" }), _jsxs("div", { style: { fontSize: 10, color: '#a0aec0' }, children: ["\u2192 \"", defaultOutput, "\""] })] }))] })) })] })] }));
};

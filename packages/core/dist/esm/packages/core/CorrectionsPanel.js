import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { useCorrectionsStore, DEFAULT_CORRECTION_RULES } from useCorrectionsEnabled;
from;
'./correctionsStore';
export const { rules };
addRule;
updateRule;
deleteRule;
toggleRule;
clearAllRules;
applyCorrections
    = useCorrectionsStore();
const [editingRule, setEditingRule] = useState(null);
const [newRule, setNewRule] = useState({});
name: '';
description: '';
findPattern: '';
replaceWith: '';
isRegex: false;
isActive: true;
priority: rules.length;
;
const [testText, setTestText] = useState('');
const handleAddRule = useCallback(() => {
    if (newRule.name.trim() && newRule.findPattern.trim()) {
        addRule(newRule);
        setNewRule({});
        name: '';
        description: '';
        findPattern: '';
        replaceWith: '';
        isRegex: false;
        isActive: true;
        priority: rules.length;
    }
});
[newRule, addRule, rules.length];
;
const handleUpdateRule = useCallback((rule) => {
    updateRule(rule.id, rule);
    setEditingRule(null);
}, [updateRule]);
const handleDeleteRule = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this correction rule?')) {
        deleteRule(id);
    }
    [deleteRule];
});
const handleLoadDefaults = useCallback(() => {
    if (window.confirm('This will add default correction rules. Continue?')) {
        DEFAULT_CORRECTION_RULES.forEach(rule => addRule(rule));
    }
    [addRule];
});
const handleTestCorrections = useCallback(() => { return applyCorrections(testText); }, [testText, applyCorrections]);
if (!isOpen)
    return null;
// Don't render if corrections are not enabled
if (!isEnabled)
    return null;
return;
_jsxs("div", { style: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '400px',
        background: '#23272f',
        color: '#fff',
        borderLeft: '1px solid #444',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    }, "data-testid": "corrections-panel", children: [_jsxs("div", { style: {
                padding: '16px',
                borderBottom: '1px solid #444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }, children: [_jsx("h2", { style: { margin: 0, fontSize: '18px' }, children: "Corrections Manager" }), _jsx("button", { onClick: onClose, style: {
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '20px',
                        cursor: 'pointer',
                        padding: '4px 8px'
                    }, "aria-label": "Close corrections panel", children: "\u00D7" })] }), _jsxs("div", { style: { flex: 1, overflow: 'auto', padding: '16px' }, children: [_jsxs("div", { style: { marginBottom: '24px' }, children: [_jsx("h3", { style: { fontSize: '16px', marginBottom: '8px' }, children: "Test Corrections" }), _jsx("textarea", { value: testText, onChange: (e) => setTestText(e.target.value), placeholder: "Enter text to test corrections...", style: {
                                width: '100%',
                                minHeight: '60px',
                                padding: '8px',
                                background: '#2a2e37',
                                color: '#fff',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                resize: 'vertical'
                            } }), testText && ()
                            < div, " style=", { marginTop: '8px' }, ">", _jsx("strong", { children: "Result:" }), _jsx("div", { style: {
                                padding: '8px',
                                background: '#1e2228',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                marginTop: '4px',
                                fontSize: '14px'
                            }, children: handleTestCorrections() })] }), ")}"] }), _jsx("div", { style: { marginBottom: '24px' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }, children: [_jsxs("h3", { style: { fontSize: '16px', margin: 0 }, children: ["Correction Rules (", rules.length, ")"] }), _jsx("div", { children: _jsx("button", { onClick: handleLoadDefaults, style: {
                                background: '#4a5568',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                marginRight: '8px'
                            }
                                >
                                    Load, Defaults: true }) }), _jsx("button", { onClick: clearAllRules, style: {
                            background: '#e53e3e',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }, children: "Clear All" })] }) }), rules.map((rule) => ()
            < div, key = { rule, : .id }, style = {}, {
            background: '#2a2e37',
            border: '1px solid #444',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '8px'
        }), ">", _jsxs("div", { style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [_jsx("input", { type: "checkbox", checked: rule.isActive, onChange: () => toggleRule(rule.id), style: { marginRight: '8px' } }), _jsx("strong", { style: { fontSize: '14px' }, children: rule.name }), rule.isRegex && ()
                            < span, " style=", {
                            background: '#4a5568',
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: '2px',
                            fontSize: '10px',
                            marginLeft: '8px'
                        }, "> REGEX"] }), ")}"] }), _jsxs("div", { children: [_jsx("button", { onClick: () => setEditingRule(rule), style: {
                        background: 'none',
                        border: 'none',
                        color: '#63b3ed',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginRight: '8px'
                    }, children: "Edit" }), _jsx("button", { onClick: () => handleDeleteRule(rule.id), style: {
                        background: 'none',
                        border: 'none',
                        color: '#e53e3e',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }, children: "Delete" })] })] });
{
    rule.description && ()
        < p;
    style = {};
    {
        fontSize: '12px', color;
        '#a0aec0', margin;
        '4px 0';
    }
}
 >
    { rule, : .description };
p >
;
_jsxs("div", { style: { fontSize: '12px', color: '#68d391' }, children: ["Find: ", _jsx("code", { style: { background: '#1e2228', padding: '2px 4px' }, children: rule.findPattern })] })
    ,
        _jsxs("div", { style: { fontSize: '12px', color: '#63b3ed' }, children: ["Replace: ", _jsx("code", { style: { background: '#1e2228', padding: '2px 4px' }, children: rule.replaceWith })] });
div >
;
div >
    { /* Add New Rule */}
    < div;
style = {};
{
    marginBottom: '24px';
}
 >
    (_jsx("h3", { style: { fontSize: '16px', marginBottom: '16px' }, children: "Add New Rule" })
        ,
            _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: _jsx("input", { type: "text", value: newRule.name, onChange: (e) => setNewRule(prev => ({ ...prev, name: e.target.value })), placeholder: "Rule name", style: {
                        padding: '8px',
                        background: '#2a2e37',
                        color: '#fff',
                        border: '1px solid #444',
                        borderRadius: '4px'
                    }
                        /  >
                        _jsx("input", { type: "text", value: newRule.description, onChange: (e) => setNewRule(prev => ({ ...prev, description: e.target.value })), placeholder: "Description (optional)", style: {
                                padding: '8px',
                                background: '#2a2e37',
                                color: '#fff',
                                border: '1px solid #444',
                                borderRadius: '4px'
                            }
                                /  >
                                _jsx("input", { type: "text", value: newRule.findPattern, onChange: (e) => setNewRule(prev => ({ ...prev, findPattern: e.target.value })), placeholder: "Find pattern", style: {
                                        padding: '8px',
                                        background: '#2a2e37',
                                        color: '#fff',
                                        border: '1px solid #444',
                                        borderRadius: '4px'
                                    }
                                        /  >
                                        _jsx("input", { type: "text", value: newRule.replaceWith, onChange: (e) => setNewRule(prev => ({ ...prev, replaceWith: e.target.value })), placeholder: "Replace with", style: {
                                                padding: '8px',
                                                background: '#2a2e37',
                                                color: '#fff',
                                                border: '1px solid #444',
                                                borderRadius: '4px'
                                            }
                                                /  >
                                                (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: newRule.isRegex, onChange: (e) => setNewRule(prev => ({ ...prev, isRegex: e.target.checked })), style: { marginRight: '4px' } }), "Use regex"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: newRule.isActive, onChange: (e) => setNewRule(prev => ({ ...prev, isActive: e.target.checked })), style: { marginRight: '4px' } }), "Active"] })] })
                                                    ,
                                                        _jsx("button", { onClick: handleAddRule, disabled: !newRule.name.trim() || !newRule.findPattern.trim(), style: {
                                                                background: newRule.name.trim() && newRule.findPattern.trim() ? '#38a169' : '#4a5568',
                                                                color: '#fff',
                                                                border: 'none',
                                                                padding: '8px 16px',
                                                                borderRadius: '4px',
                                                                cursor: newRule.name.trim() && newRule.findPattern.trim() ? 'pointer' : 'not-allowed'
                                                            }
                                                                >
                                                                    Add, Rule: true })) }) }) }) }) }));
div >
;
div >
;
div >
    { /* Edit Rule Modal */};
{
    editingRule && ()
        < div;
    style = {};
    {
        position: 'fixed';
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 'rgba(0, 0, 0, 0.8)';
        display: 'flex';
        alignItems: 'center';
        justifyContent: 'center';
        zIndex: 1001;
    }
}
    >
        _jsx("div", { style: {
                background: '#23272f',
                padding: '24px',
                borderRadius: '8px',
                width: '400px',
                maxWidth: '90vw'
            }
                >
                    (_jsx("h3", { style: { marginBottom: '16px' }, children: "Edit Rule" })
                        ,
                            _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: _jsx("input", { type: "text", value: editingRule.name, onChange: (e) => setEditingRule(prev => prev ? ({ ...prev, name: e.target.value }) : null), placeholder: "Rule name", style: {
                                        padding: '8px',
                                        background: '#2a2e37',
                                        color: '#fff',
                                        border: '1px solid #444',
                                        borderRadius: '4px'
                                    }
                                        /  >
                                        _jsx("input", { type: "text", value: editingRule.description || '', onChange: (e) => setEditingRule(prev => prev ? ({ ...prev, description: e.target.value }) : null), placeholder: "Description (optional)", style: {
                                                padding: '8px',
                                                background: '#2a2e37',
                                                color: '#fff',
                                                border: '1px solid #444',
                                                borderRadius: '4px'
                                            }
                                                /  >
                                                _jsx("input", { type: "text", value: editingRule.findPattern, onChange: (e) => setEditingRule(prev => prev ? ({ ...prev, findPattern: e.target.value }) : null), placeholder: "Find pattern", style: {
                                                        padding: '8px',
                                                        background: '#2a2e37',
                                                        color: '#fff',
                                                        border: '1px solid #444',
                                                        borderRadius: '4px'
                                                    }
                                                        /  >
                                                        _jsx("input", { type: "text", value: editingRule.replaceWith, onChange: (e) => setEditingRule(prev => prev ? ({ ...prev, replaceWith: e.target.value }) : null), placeholder: "Replace with", style: {
                                                                padding: '8px',
                                                                background: '#2a2e37',
                                                                color: '#fff',
                                                                border: '1px solid #444',
                                                                borderRadius: '4px'
                                                            }
                                                                /  >
                                                                (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: editingRule.isRegex, onChange: (e) => setEditingRule(prev => prev ? ({ ...prev, isRegex: e.target.checked }) : null), style: { marginRight: '4px' } }), "Use regex"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '14px' }, children: [_jsx("input", { type: "checkbox", checked: editingRule.isActive, onChange: (e) => setEditingRule(prev => prev ? ({ ...prev, isActive: e.target.checked }) : null), style: { marginRight: '4px' } }), "Active"] })] })
                                                                    ,
                                                                        _jsxs("div", { style: { display: 'flex', gap: '8px', marginTop: '16px' }, children: [_jsx("button", { onClick: () => handleUpdateRule(editingRule), style: {
                                                                                        background: '#38a169',
                                                                                        color: '#fff',
                                                                                        border: 'none',
                                                                                        padding: '8px 16px',
                                                                                        borderRadius: '4px',
                                                                                        cursor: 'pointer',
                                                                                        flex: 1
                                                                                    }, children: "Save" }), _jsx("button", { onClick: () => setEditingRule(null), style: {
                                                                                        background: '#4a5568',
                                                                                        color: '#fff',
                                                                                        border: 'none',
                                                                                        padding: '8px 16px',
                                                                                        borderRadius: '4px',
                                                                                        cursor: 'pointer',
                                                                                        flex: 1
                                                                                    }, children: "Cancel" })] })) }) }) }) }) })), div: true });
div >
;
;
;

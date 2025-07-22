import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useMemo } from 'react';
import { useCorrectionsStore, DEFAULT_CORRECTION_RULES } from '../correctionsStore';
export const MobileCorrectionsPanel = ({ isOpen, onClose }) => {
    const { rules, addRule, updateRule, deleteRule, toggleRule, clearAllRules, applyCorrections } = useCorrectionsStore();
    const [activeTab, setActiveTab] = useState('rules');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRule, setSelectedRule] = useState(null);
    const [testText, setTestText] = useState('');
    const [newRule, setNewRule] = useState({
        name: '',
        description: '',
        findPattern: '',
        replaceWith: '',
        isRegex: false,
        isActive: true,
        priority: rules.length
    });
    // Filter rules based on search
    const filteredRules = useMemo(() => {
        if (!searchQuery)
            return rules;
        const query = searchQuery.toLowerCase();
        return rules.filter(rule => rule.name.toLowerCase().includes(query) ||
            rule.description?.toLowerCase().includes(query) ||
            rule.findPattern.toLowerCase().includes(query) ||
            rule.replaceWith.toLowerCase().includes(query));
    }, [rules, searchQuery]);
    const handleAddRule = useCallback(() => {
        if (newRule.name.trim() && newRule.findPattern.trim()) {
            addRule(newRule);
            setNewRule({
                name: '',
                description: '',
                findPattern: '',
                replaceWith: '',
                isRegex: false,
                isActive: true,
                priority: rules.length
            });
            setActiveTab('rules');
        }
    }, [newRule, addRule, rules.length]);
    const handleUpdateRule = useCallback((rule) => {
        updateRule(rule.id, rule);
        setSelectedRule(null);
    }, [updateRule]);
    const handleDeleteRule = useCallback((id) => {
        if (window.confirm('Delete this rule?')) {
            deleteRule(id);
            setSelectedRule(null);
        }
    }, [deleteRule]);
    const handleTestCorrections = useCallback(() => {
        return applyCorrections(testText);
    }, [testText, applyCorrections]);
    if (!isOpen)
        return null;
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#23272f',
            color: '#fff',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
        }, children: [_jsxs("div", { style: {
                    padding: '16px',
                    borderBottom: '1px solid #444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#1e2228'
                }, children: [_jsx("h2", { style: { margin: 0, fontSize: '18px', fontWeight: 600 }, children: "Corrections" }), _jsx("button", { onClick: onClose, style: {
                            background: 'none',
                            border: 'none',
                            color: '#a0aec0',
                            cursor: 'pointer',
                            fontSize: '20px',
                            padding: '4px 8px'
                        }, children: "\u00D7" })] }), _jsx("div", { style: {
                    display: 'flex',
                    borderBottom: '1px solid #444',
                    background: '#1e2228'
                }, children: [
                    { id: 'rules', label: 'Rules', count: filteredRules.length },
                    { id: 'test', label: 'Test' },
                    { id: 'add', label: 'Add' },
                    { id: 'settings', label: 'Settings' }
                ].map(tab => (_jsxs("button", { onClick: () => setActiveTab(tab.id), style: {
                        flex: 1,
                        padding: '12px 8px',
                        background: activeTab === tab.id ? '#2a2e37' : 'transparent',
                        color: activeTab === tab.id ? '#63b3ed' : '#a0aec0',
                        border: 'none',
                        borderBottom: activeTab === tab.id ? '2px solid #63b3ed' : '2px solid transparent',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.2s ease'
                    }, children: [tab.label, tab.count !== undefined && (_jsx("span", { style: {
                                marginLeft: '4px',
                                padding: '2px 6px',
                                background: '#4a5568',
                                borderRadius: '10px',
                                fontSize: '11px'
                            }, children: tab.count }))] }, tab.id))) }), _jsxs("div", { style: { flex: 1, overflow: 'auto' }, children: [activeTab === 'rules' && (_jsxs("div", { style: { padding: '16px' }, children: [_jsx("div", { style: { marginBottom: '16px' }, children: _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search rules...", style: {
                                        width: '100%',
                                        padding: '12px',
                                        background: '#2a2e37',
                                        color: '#fff',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        fontSize: '16px'
                                    } }) }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: filteredRules.map((rule) => (_jsxs("div", { style: {
                                        background: '#2a2e37',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        padding: '16px'
                                    }, children: [_jsxs("div", { style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: '8px'
                                            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", checked: rule.isActive, onChange: () => toggleRule(rule.id), style: { transform: 'scale(1.2)' } }), _jsx("strong", { style: { fontSize: '16px' }, children: rule.name }), rule.isRegex && (_jsx("span", { style: {
                                                                background: '#4a5568',
                                                                color: '#fff',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                fontSize: '10px'
                                                            }, children: "REGEX" }))] }), _jsx("button", { onClick: () => setSelectedRule(rule), style: {
                                                        background: 'none',
                                                        border: '1px solid #63b3ed',
                                                        color: '#63b3ed',
                                                        padding: '6px 12px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }, children: "Edit" })] }), rule.description && (_jsx("p", { style: {
                                                fontSize: '14px',
                                                color: '#a0aec0',
                                                margin: '0 0 8px 0'
                                            }, children: rule.description })), _jsxs("div", { style: {
                                                background: '#1e2228',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                marginBottom: '4px'
                                            }, children: [_jsxs("div", { style: { color: '#68d391', marginBottom: '2px' }, children: ["Find: ", _jsx("code", { children: rule.findPattern })] }), _jsxs("div", { style: { color: '#63b3ed' }, children: ["Replace: ", _jsx("code", { children: rule.replaceWith })] })] })] }, rule.id))) }), filteredRules.length === 0 && (_jsxs("div", { style: {
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#a0aec0'
                                }, children: [_jsx("p", { children: "No rules found." }), searchQuery && (_jsx("p", { style: { fontSize: '14px' }, children: "Try adjusting your search." }))] })), _jsxs("div", { style: {
                                    position: 'fixed',
                                    bottom: '16px',
                                    left: '16px',
                                    right: '16px',
                                    display: 'flex',
                                    gap: '8px'
                                }, children: [_jsx("button", { onClick: () => {
                                            if (window.confirm('Add default rules?')) {
                                                DEFAULT_CORRECTION_RULES.forEach(rule => addRule(rule));
                                            }
                                        }, style: {
                                            flex: 1,
                                            padding: '12px',
                                            background: '#4a5568',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 500
                                        }, children: "Load Defaults" }), _jsx("button", { onClick: () => {
                                            if (window.confirm('Clear all rules?')) {
                                                clearAllRules();
                                            }
                                        }, style: {
                                            flex: 1,
                                            padding: '12px',
                                            background: '#e53e3e',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 500
                                        }, children: "Clear All" })] })] })), activeTab === 'test' && (_jsxs("div", { style: { padding: '16px' }, children: [_jsx("h3", { style: { fontSize: '18px', marginBottom: '16px' }, children: "Test Corrections" }), _jsx("textarea", { value: testText, onChange: (e) => setTestText(e.target.value), placeholder: "Enter text to test corrections...", style: {
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '12px',
                                    background: '#2a2e37',
                                    color: '#fff',
                                    border: '1px solid #444',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    resize: 'vertical'
                                } }), testText && (_jsxs("div", { style: { marginTop: '16px' }, children: [_jsx("strong", { style: { fontSize: '16px', color: '#a0aec0' }, children: "Result:" }), _jsx("div", { style: {
                                            padding: '12px',
                                            background: '#1e2228',
                                            border: '1px solid #444',
                                            borderRadius: '8px',
                                            marginTop: '8px',
                                            fontSize: '16px',
                                            lineHeight: '1.5',
                                            wordBreak: 'break-word'
                                        }, children: handleTestCorrections() })] }))] })), activeTab === 'add' && (_jsxs("div", { style: { padding: '16px' }, children: [_jsx("h3", { style: { fontSize: '18px', marginBottom: '16px' }, children: "Add New Rule" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsx("input", { type: "text", value: newRule.name, onChange: (e) => setNewRule(prev => ({ ...prev, name: e.target.value })), placeholder: "Rule name", style: {
                                            padding: '12px',
                                            background: '#2a2e37',
                                            color: '#fff',
                                            border: '1px solid #444',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        } }), _jsx("input", { type: "text", value: newRule.description, onChange: (e) => setNewRule(prev => ({ ...prev, description: e.target.value })), placeholder: "Description (optional)", style: {
                                            padding: '12px',
                                            background: '#2a2e37',
                                            color: '#fff',
                                            border: '1px solid #444',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        } }), _jsx("input", { type: "text", value: newRule.findPattern, onChange: (e) => setNewRule(prev => ({ ...prev, findPattern: e.target.value })), placeholder: "Find pattern", style: {
                                            padding: '12px',
                                            background: '#2a2e37',
                                            color: '#fff',
                                            border: '1px solid #444',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        } }), _jsx("input", { type: "text", value: newRule.replaceWith, onChange: (e) => setNewRule(prev => ({ ...prev, replaceWith: e.target.value })), placeholder: "Replace with", style: {
                                            padding: '12px',
                                            background: '#2a2e37',
                                            color: '#fff',
                                            border: '1px solid #444',
                                            borderRadius: '8px',
                                            fontSize: '16px'
                                        } }), _jsxs("div", { style: { display: 'flex', gap: '16px', padding: '8px 0' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '16px' }, children: [_jsx("input", { type: "checkbox", checked: newRule.isRegex, onChange: (e) => setNewRule(prev => ({ ...prev, isRegex: e.target.checked })), style: { marginRight: '8px', transform: 'scale(1.2)' } }), "Use regex"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '16px' }, children: [_jsx("input", { type: "checkbox", checked: newRule.isActive, onChange: (e) => setNewRule(prev => ({ ...prev, isActive: e.target.checked })), style: { marginRight: '8px', transform: 'scale(1.2)' } }), "Active"] })] }), _jsx("button", { onClick: handleAddRule, disabled: !newRule.name.trim() || !newRule.findPattern.trim(), style: {
                                            padding: '12px 16px',
                                            background: newRule.name.trim() && newRule.findPattern.trim() ? '#38a169' : '#4a5568',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: newRule.name.trim() && newRule.findPattern.trim() ? 'pointer' : 'not-allowed',
                                            fontSize: '16px',
                                            fontWeight: 500,
                                            marginTop: '8px'
                                        }, children: "Add Rule" })] })] })), activeTab === 'settings' && (_jsxs("div", { style: { padding: '16px' }, children: [_jsx("h3", { style: { fontSize: '18px', marginBottom: '16px' }, children: "Settings" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { style: {
                                            background: '#2a2e37',
                                            padding: '16px',
                                            borderRadius: '8px',
                                            border: '1px solid #444'
                                        }, children: [_jsx("h4", { style: { fontSize: '16px', marginBottom: '8px' }, children: "Statistics" }), _jsxs("p", { style: { fontSize: '14px', color: '#a0aec0', marginBottom: '8px' }, children: ["Total rules: ", rules.length] }), _jsxs("p", { style: { fontSize: '14px', color: '#a0aec0', marginBottom: '8px' }, children: ["Active rules: ", rules.filter(r => r.isActive).length] }), _jsxs("p", { style: { fontSize: '14px', color: '#a0aec0' }, children: ["Regex rules: ", rules.filter(r => r.isRegex).length] })] }), _jsxs("div", { style: {
                                            background: '#2a2e37',
                                            padding: '16px',
                                            borderRadius: '8px',
                                            border: '1px solid #444'
                                        }, children: [_jsx("h4", { style: { fontSize: '16px', marginBottom: '8px' }, children: "Export/Import" }), _jsx("p", { style: { fontSize: '14px', color: '#a0aec0', marginBottom: '12px' }, children: "Back up your rules or import from another device." }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: () => {
                                                            // TODO: Implement export functionality
                                                            alert('Export functionality coming soon!');
                                                        }, style: {
                                                            flex: 1,
                                                            padding: '10px',
                                                            background: '#63b3ed',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px'
                                                        }, children: "Export" }), _jsx("button", { onClick: () => {
                                                            // TODO: Implement import functionality
                                                            alert('Import functionality coming soon!');
                                                        }, style: {
                                                            flex: 1,
                                                            padding: '10px',
                                                            background: '#9f7aea',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px'
                                                        }, children: "Import" })] })] })] })] }))] }), selectedRule && (_jsx("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001,
                    padding: '20px'
                }, children: _jsxs("div", { style: {
                        background: '#23272f',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '100%',
                        maxWidth: '400px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }, children: [_jsx("h3", { style: { margin: 0, fontSize: '18px' }, children: "Edit Rule" }), _jsx("button", { onClick: () => setSelectedRule(null), style: {
                                        background: 'none',
                                        border: 'none',
                                        color: '#a0aec0',
                                        cursor: 'pointer',
                                        fontSize: '20px'
                                    }, children: "\u00D7" })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsx("input", { type: "text", value: selectedRule.name, onChange: (e) => setSelectedRule(prev => prev ? ({ ...prev, name: e.target.value }) : null), placeholder: "Rule name", style: {
                                        padding: '12px',
                                        background: '#2a2e37',
                                        color: '#fff',
                                        border: '1px solid #444',
                                        borderRadius: '6px',
                                        fontSize: '16px'
                                    } }), _jsx("input", { type: "text", value: selectedRule.description || '', onChange: (e) => setSelectedRule(prev => prev ? ({ ...prev, description: e.target.value }) : null), placeholder: "Description (optional)", style: {
                                        padding: '12px',
                                        background: '#2a2e37',
                                        color: '#fff',
                                        border: '1px solid #444',
                                        borderRadius: '6px',
                                        fontSize: '16px'
                                    } }), _jsx("input", { type: "text", value: selectedRule.findPattern, onChange: (e) => setSelectedRule(prev => prev ? ({ ...prev, findPattern: e.target.value }) : null), placeholder: "Find pattern", style: {
                                        padding: '12px',
                                        background: '#2a2e37',
                                        color: '#fff',
                                        border: '1px solid #444',
                                        borderRadius: '6px',
                                        fontSize: '16px'
                                    } }), _jsx("input", { type: "text", value: selectedRule.replaceWith, onChange: (e) => setSelectedRule(prev => prev ? ({ ...prev, replaceWith: e.target.value }) : null), placeholder: "Replace with", style: {
                                        padding: '12px',
                                        background: '#2a2e37',
                                        color: '#fff',
                                        border: '1px solid #444',
                                        borderRadius: '6px',
                                        fontSize: '16px'
                                    } }), _jsxs("div", { style: { display: 'flex', gap: '16px', padding: '8px 0' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '16px' }, children: [_jsx("input", { type: "checkbox", checked: selectedRule.isRegex, onChange: (e) => setSelectedRule(prev => prev ? ({ ...prev, isRegex: e.target.checked }) : null), style: { marginRight: '8px', transform: 'scale(1.2)' } }), "Use regex"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', fontSize: '16px' }, children: [_jsx("input", { type: "checkbox", checked: selectedRule.isActive, onChange: (e) => setSelectedRule(prev => prev ? ({ ...prev, isActive: e.target.checked }) : null), style: { marginRight: '8px', transform: 'scale(1.2)' } }), "Active"] })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginTop: '16px' }, children: [_jsx("button", { onClick: () => handleUpdateRule(selectedRule), style: {
                                                flex: 1,
                                                padding: '12px',
                                                background: '#38a169',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                fontWeight: 500
                                            }, children: "Save" }), _jsx("button", { onClick: () => handleDeleteRule(selectedRule.id), style: {
                                                flex: 1,
                                                padding: '12px',
                                                background: '#e53e3e',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                fontWeight: 500
                                            }, children: "Delete" })] })] })] }) }))] }));
};

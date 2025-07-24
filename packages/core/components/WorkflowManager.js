import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useCorrectionsStore } from '../correctionsStore.js';
export const WorkflowManager = ({ isOpen, onClose }) => {
    const { rules, getDraftRules, getPublishedRules, approveRule, deprecateRule, suggestRule, updateRule, deleteRule } = useCorrectionsStore();
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedRules, setSelectedRules] = useState(new Set());
    const [_____showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [showDeprecationDialog, setShowDeprecationDialog] = useState(false);
    const [_____showSuggestionDialog, _____setShowSuggestionDialog] = useState(false);
    const [currentRule, setCurrentRule] = useState(null);
    const [_____approvalComment, setApprovalComment] = useState('');
    const [deprecationReason, setDeprecationReason] = useState('');
    // Categorize rules by status
    const rulesByStatus = useMemo(() => {
        const pending = rules.filter(rule => rule.status === 'draft');
        const published = rules.filter(rule => rule.status === 'published');
        const deprecated = rules.filter(rule => rule.status === 'deprecated');
        const suggestions = rules.filter(rule => rule.suggestedBy && rule.status === 'draft');
        return { pending, published, deprecated, suggestions };
    }, [rules]);
    const handleApprove = (ruleId) => {
        approveRule(ruleId, 'system'); // In real app, would use actual user ID
        setShowApprovalDialog(false);
        setCurrentRule(null);
        setApprovalComment('');
    };
    const handleBulkApprove = () => {
        selectedRules.forEach(ruleId => {
            approveRule(ruleId, 'system');
        });
        setSelectedRules(new Set());
    };
    const handleDeprecate = (ruleId, reason) => {
        deprecateRule(ruleId, reason);
        setShowDeprecationDialog(false);
        setCurrentRule(null);
        setDeprecationReason('');
    };
    const handleBulkDeprecate = () => {
        const reason = prompt('Enter deprecation reason:');
        if (reason) {
            selectedRules.forEach(ruleId => {
                deprecateRule(ruleId, reason);
            });
            setSelectedRules(new Set());
        }
    };
    const toggleRuleSelection = (ruleId) => {
        const newSelected = new Set(selectedRules);
        if (newSelected.has(ruleId)) {
            newSelected.delete(ruleId);
        }
        else {
            newSelected.add(ruleId);
        }
        setSelectedRules(newSelected);
    };
    const selectAllRules = (ruleList) => {
        const allIds = new Set(ruleList.map(rule => rule.id));
        setSelectedRules(allIds);
    };
    const clearSelection = () => {
        setSelectedRules(new Set());
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'draft':
                return '#fbb040';
            case 'published':
                return '#68d391';
            case 'deprecated':
                return '#e53e3e';
            default:
                return '#a0aec0';
        }
    };
    const getStatusBadge = (rule) => (_jsx("span", { style: {
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '10px',
            fontWeight: 500,
            background: getStatusColor(rule.status),
            color: '#1a202c'
        }, children: rule.status.toUpperCase() }));
    const renderRuleCard = (rule) => (_jsx("div", { style: {
            background: '#2a2e37',
            border: '1px solid #4a5568',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '8px'
        }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }, children: [_jsx("input", { type: "checkbox", checked: selectedRules.has(rule.id), onChange: () => toggleRuleSelection(rule.id), style: { cursor: 'pointer' } }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }, children: [_jsx("span", { style: { fontWeight: 600, color: '#e2e8f0' }, children: rule.name }), getStatusBadge(rule), rule.suggestedBy && (_jsxs("span", { style: {
                                        fontSize: '10px',
                                        color: '#a0aec0',
                                        fontStyle: 'italic'
                                    }, children: ["Suggested by ", rule.suggestedBy] }))] }), rule.description && (_jsx("div", { style: { fontSize: '12px', color: '#a0aec0', marginBottom: '4px' }, children: rule.description })), _jsxs("div", { style: { fontSize: '11px', color: '#a0aec0', display: 'flex', gap: '16px' }, children: [_jsxs("span", { children: ["Created: ", rule.createdAt.toLocaleDateString()] }), _jsxs("span", { children: ["Updated: ", rule.updatedAt.toLocaleDateString()] }), rule.usageCount !== undefined && (_jsxs("span", { children: ["Used: ", rule.usageCount, " times"] })), rule.lastUsedAt && (_jsxs("span", { children: ["Last used: ", rule.lastUsedAt.toLocaleDateString()] }))] }), rule.suggestionReason && (_jsxs("div", { style: {
                                fontSize: '11px',
                                color: '#fbb040',
                                marginTop: '4px',
                                fontStyle: 'italic'
                            }, children: ["Suggestion: ", rule.suggestionReason] })), rule.deprecationReason && (_jsxs("div", { style: {
                                fontSize: '11px',
                                color: '#e53e3e',
                                marginTop: '4px'
                            }, children: ["Deprecated: ", rule.deprecationReason] }))] }), _jsxs("div", { style: { display: 'flex', gap: '4px' }, children: [rule.status === 'draft' && (_jsx("button", { onClick: () => handleApprove(rule.id), style: {
                                background: '#68d391',
                                color: '#1a202c',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                cursor: 'pointer'
                            }, children: "Approve" })), rule.status === 'published' && (_jsx("button", { onClick: () => {
                                setCurrentRule(rule);
                                setShowDeprecationDialog(true);
                            }, style: {
                                background: '#e53e3e',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                cursor: 'pointer'
                            }, children: "Deprecate" })), _jsx("button", { onClick: () => deleteRule(rule.id), style: {
                                background: '#4a5568',
                                color: '#e2e8f0',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                cursor: 'pointer'
                            }, children: "Delete" })] })] }) }, rule.id));
    const renderTabContent = () => {
        const currentRules = rulesByStatus[activeTab];
        if (currentRules.length === 0) {
            return (_jsxs("div", { style: {
                    textAlign: 'center',
                    padding: '40px',
                    color: '#a0aec0'
                }, children: ["No ", activeTab, " rules found."] }));
        }
        return (_jsxs("div", { children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                        padding: '8px 0',
                        borderBottom: '1px solid #4a5568'
                    }, children: [_jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("button", { onClick: () => selectAllRules(currentRules), style: {
                                        background: 'none',
                                        border: '1px solid #4a5568',
                                        color: '#e2e8f0',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        cursor: 'pointer'
                                    }, children: "Select All" }), _jsx("button", { onClick: clearSelection, style: {
                                        background: 'none',
                                        border: '1px solid #4a5568',
                                        color: '#e2e8f0',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        cursor: 'pointer'
                                    }, children: "Clear" }), selectedRules.size > 0 && (_jsxs("span", { style: { fontSize: '11px', color: '#a0aec0' }, children: [selectedRules.size, " selected"] }))] }), selectedRules.size > 0 && (_jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [activeTab === 'pending' && (_jsx("button", { onClick: handleBulkApprove, style: {
                                        background: '#68d391',
                                        color: '#1a202c',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        cursor: 'pointer'
                                    }, children: "Approve Selected" })), activeTab === 'published' && (_jsx("button", { onClick: handleBulkDeprecate, style: {
                                        background: '#e53e3e',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        cursor: 'pointer'
                                    }, children: "Deprecate Selected" }))] }))] }), _jsx("div", { style: { maxHeight: '400px', overflowY: 'auto' }, children: currentRules.map(renderRuleCard) })] }));
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
        }, children: _jsxs("div", { style: {
                background: '#23272f',
                padding: '24px',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '90vh',
                overflow: 'auto',
                color: '#fff'
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px'
                    }, children: [_jsx("h2", { style: { margin: 0, fontSize: '20px', fontWeight: 600 }, children: "Workflow Manager" }), _jsx("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                color: '#a0aec0',
                                cursor: 'pointer',
                                fontSize: '20px',
                                padding: '4px 8px'
                            }, children: "\u00D7" })] }), _jsx("div", { style: {
                        display: 'flex',
                        borderBottom: '1px solid #4a5568',
                        marginBottom: '24px'
                    }, children: ['pending', 'published', 'deprecated', 'suggestions'].map(tab => (_jsxs("button", { onClick: () => setActiveTab(tab), style: {
                            background: 'none',
                            border: 'none',
                            color: activeTab === tab ? '#63b3ed' : '#a0aec0',
                            padding: '12px 16px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            borderBottom: activeTab === tab ? '2px solid #63b3ed' : '2px solid transparent',
                            textTransform: 'capitalize'
                        }, children: [tab, " (", rulesByStatus[tab].length, ")"] }, tab))) }), renderTabContent(), showDeprecationDialog && currentRule && (_jsx("div", { style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1002
                    }, children: _jsxs("div", { style: {
                            background: '#2a2e37',
                            padding: '24px',
                            borderRadius: '8px',
                            width: '400px',
                            maxWidth: '90vw'
                        }, children: [_jsxs("h3", { style: { margin: '0 0 16px 0', fontSize: '16px' }, children: ["Deprecate Rule: ", currentRule.name] }), _jsx("textarea", { value: deprecationReason, onChange: (e) => setDeprecationReason(e.target.value), placeholder: "Enter reason for deprecation...", style: {
                                    width: '100%',
                                    height: '80px',
                                    padding: '8px',
                                    background: '#1a202c',
                                    color: '#e2e8f0',
                                    border: '1px solid #4a5568',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                } }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }, children: [_jsx("button", { onClick: () => {
                                            setShowDeprecationDialog(false);
                                            setCurrentRule(null);
                                            setDeprecationReason('');
                                        }, style: {
                                            background: '#4a5568',
                                            color: '#e2e8f0',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '8px 16px',
                                            fontSize: '14px',
                                            cursor: 'pointer'
                                        }, children: "Cancel" }), _jsx("button", { onClick: () => handleDeprecate(currentRule.id, deprecationReason), disabled: !deprecationReason.trim(), style: {
                                            background: deprecationReason.trim() ? '#e53e3e' : '#4a5568',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '8px 16px',
                                            fontSize: '14px',
                                            cursor: deprecationReason.trim() ? 'pointer' : 'not-allowed'
                                        }, children: "Deprecate" })] })] }) }))] }) }));
};

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Alert Rule Builder Component
 *
 * Advanced visual interface for creating and managing security alert rules.
 * Provides drag-and-drop rule building, condition chaining, and action configuration.
 */
import { useState } from 'react';
import { SecurityEventType, SecurityEventSeverity } from '../../security/SecurityEventLoggingPolicies';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Textarea } from '../ui/Textarea';
import './AlertRuleBuilder.css';
const AVAILABLE_FIELDS = [
    { value: 'event_type', label: 'Event Type', type: 'enum' },
    { value: 'severity', label: 'Severity', type: 'enum' },
    { value: 'source_ip', label: 'Source IP', type: 'string' },
    { value: 'user_id', label: 'User ID', type: 'string' },
    { value: 'threat_level', label: 'Threat Level', type: 'number' },
    { value: 'confidence_score', label: 'Confidence Score', type: 'number' },
    { value: 'system_component', label: 'System Component', type: 'string' },
    { value: 'tags', label: 'Tags', type: 'array' },
    { value: 'request_count', label: 'Request Count', type: 'number' },
    { value: 'failed_attempts', label: 'Failed Attempts', type: 'number' },
    { value: 'data_volume', label: 'Data Volume', type: 'number' },
    { value: 'response_time', label: 'Response Time', type: 'number' }
];
const OPERATORS_BY_TYPE = {
    string: ['eq', 'ne', 'contains', 'regex'],
    number: ['eq', 'ne', 'gt', 'lt', 'gte', 'lte'],
    enum: ['eq', 'ne', 'in', 'not_in'],
    array: ['contains', 'in', 'not_in']
};
const ACTION_TYPES = [
    {
        type: 'notification',
        name: 'Send Notification',
        description: 'Send alert notification to configured channels',
        icon: '📢'
    },
    {
        type: 'containment',
        name: 'Automated Containment',
        description: 'Automatically block IPs, lock accounts, or isolate systems',
        icon: '🛡️'
    },
    {
        type: 'escalation',
        name: 'Escalate Alert',
        description: 'Escalate to security team or management',
        icon: '🚨'
    },
    {
        type: 'logging',
        name: 'Enhanced Logging',
        description: 'Capture additional forensic data',
        icon: '📝'
    },
    {
        type: 'webhook',
        name: 'Webhook Call',
        description: 'Call external webhook with alert data',
        icon: '🔗'
    }
];
/**
 * Main Alert Rule Builder Component
 */
export const AlertRuleBuilder = ({ alertRules, onRulesChange }) => {
    const [_____selectedRule, setSelectedRule] = useState(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);
    const [editingRule, setEditingRule] = useState(null);
    const handleCreateRule = () => {
        const newRule = {
            id: crypto.randomUUID(),
            name: 'New Alert Rule',
            description: '',
            enabled: true,
            event_types: [],
            severity_threshold: SecurityEventSeverity.MEDIUM,
            conditions: [],
            actions: [],
            notification_channels: [],
            created_at: new Date(),
            updated_at: new Date()
        };
        setEditingRule(newRule);
        setShowCreateDialog(true);
    };
    const handleSaveRule = (rule) => {
        const isNew = !alertRules.find(r => r.id === rule.id);
        const updatedRule = { ...rule, updated_at: new Date() };
        if (isNew) {
            onRulesChange([...alertRules, updatedRule]);
        }
        else {
            onRulesChange(alertRules.map(r => r.id === rule.id ? updatedRule : r));
        }
        setEditingRule(null);
        setShowCreateDialog(false);
    };
    const handleDeleteRule = (ruleId) => {
        onRulesChange(alertRules.filter(r => r.id !== ruleId));
        setShowDeleteDialog(null);
    };
    const handleToggleRule = (ruleId) => {
        onRulesChange(alertRules.map(rule => rule.id === ruleId
            ? { ...rule, enabled: !rule.enabled, updated_at: new Date() }
            : rule));
    };
    return (_jsxs("div", { className: "alert-rule-builder", children: [_jsxs("div", { className: "builder-header", children: [_jsxs("div", { className: "header-content", children: [_jsx("h2", { children: "Security Alert Rules" }), _jsx("p", { children: "Create and manage automated security alert rules with custom conditions and actions" })] }), _jsx(Button, { variant: "primary", onClick: handleCreateRule, children: "Create Alert Rule" })] }), _jsx("div", { className: "rules-overview", children: _jsxs("div", { className: "overview-stats", children: [_jsxs("div", { className: "stat-card", children: [_jsx("span", { className: "stat-value", children: alertRules.length }), _jsx("span", { className: "stat-label", children: "Total Rules" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("span", { className: "stat-value", children: alertRules.filter(r => r.enabled).length }), _jsx("span", { className: "stat-label", children: "Active Rules" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("span", { className: "stat-value", children: alertRules.reduce((sum, r) => sum + r.actions.length, 0) }), _jsx("span", { className: "stat-label", children: "Total Actions" })] })] }) }), _jsx("div", { className: "rules-grid", children: alertRules.map(rule => (_jsx(RuleCard, { rule: rule, onEdit: () => {
                        setEditingRule({ ...rule });
                        setShowCreateDialog(true);
                    }, onToggle: () => handleToggleRule(rule.id), onDelete: () => setShowDeleteDialog(rule.id), onSelect: () => setSelectedRule(rule) }, rule.id))) }), alertRules.length === 0 && (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-icon", children: "\uD83D\uDEA8" }), _jsx("h3", { children: "No Alert Rules Configured" }), _jsx("p", { children: "Create your first security alert rule to start automated threat detection and response." }), _jsx(Button, { variant: "primary", onClick: handleCreateRule, children: "Create First Rule" })] })), showCreateDialog && editingRule && (_jsx(RuleEditDialog, { rule: editingRule, open: showCreateDialog, onClose: () => {
                    setShowCreateDialog(false);
                    setEditingRule(null);
                }, onSave: handleSaveRule })), showDeleteDialog && (_jsx(Dialog, { open: !!showDeleteDialog, onOpenChange: () => setShowDeleteDialog(null), title: "Delete Alert Rule", description: "Are you sure you want to delete this alert rule? This action cannot be undone.", children: _jsxs("div", { className: "dialog-actions", children: [_jsx(Button, { variant: "outline", onClick: () => setShowDeleteDialog(null), children: "Cancel" }), _jsx(Button, { variant: "destructive", onClick: () => handleDeleteRule(showDeleteDialog), children: "Delete Rule" })] }) }))] }));
};
/**
 * Individual Alert Rule Card Component
 */
const RuleCard = ({ rule, onEdit, onToggle, onDelete, _____onSelect }) => {
    return (_jsxs(Card, { className: `rule-card ${!rule.enabled ? 'disabled' : ''}`, children: [_jsxs("div", { className: "rule-header", children: [_jsxs("div", { className: "rule-info", children: [_jsx("h3", { className: "rule-name", children: rule.name }), _jsx("p", { className: "rule-description", children: rule.description || 'No description' })] }), _jsx("div", { className: "rule-status", children: _jsx(Badge, { variant: rule.enabled ? 'success' : 'secondary', children: rule.enabled ? 'Active' : 'Disabled' }) })] }), _jsxs("div", { className: "rule-details", children: [_jsxs("div", { className: "detail-row", children: [_jsx("span", { className: "detail-label", children: "Event Types:" }), _jsx("span", { className: "detail-value", children: rule.event_types.length > 0
                                    ? `${rule.event_types.length} types`
                                    : 'All types' })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { className: "detail-label", children: "Severity:" }), _jsxs("span", { className: "detail-value", children: [rule.severity_threshold.toUpperCase(), " and above"] })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { className: "detail-label", children: "Conditions:" }), _jsxs("span", { className: "detail-value", children: [rule.conditions.length, " conditions"] })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { className: "detail-label", children: "Actions:" }), _jsxs("span", { className: "detail-value", children: [rule.actions.length, " actions"] })] })] }), _jsxs("div", { className: "rule-actions", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: onEdit, children: "Edit" }), _jsx(Button, { variant: rule.enabled ? 'outline' : 'secondary', size: "sm", onClick: onToggle, children: rule.enabled ? 'Disable' : 'Enable' }), _jsx(Button, { variant: "outline", size: "sm", onClick: onDelete, children: "Delete" })] })] }));
};
/**
 * Rule Edit Dialog Component
 */
const RuleEditDialog = ({ rule, open, onClose, onSave }) => {
    const [editedRule, setEditedRule] = useState({ ...rule });
    const [activeTab, setActiveTab] = useState('basic');
    const [errors, setErrors] = useState([]);
    const handleSave = () => {
        const validationErrors = validateRule(editedRule);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors([]);
        onSave(editedRule);
    };
    const updateRule = (updates) => {
        setEditedRule(prev => ({ ...prev, ...updates }));
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onClose, title: rule.id ? 'Edit Alert Rule' : 'Create Alert Rule', className: "rule-edit-dialog", children: _jsxs("div", { className: "dialog-content", children: [errors.length > 0 && (_jsxs(Alert, { variant: "error", className: "mb-4", children: [_jsx("strong", { children: "Validation Errors:" }), _jsx("ul", { children: errors.map((error, index) => (_jsx("li", { children: error }, index))) })] })), _jsxs("div", { className: "edit-tabs", children: [_jsx("div", { className: "tabs-list", children: ['basic', 'conditions', 'actions', 'notifications'].map(tab => (_jsx("button", { className: `tab-trigger ${activeTab === tab ? 'active' : ''}`, onClick: () => setActiveTab(tab), children: tab.charAt(0).toUpperCase() + tab.slice(1) }, tab))) }), _jsxs("div", { className: "tab-content", children: [activeTab === 'basic' && (_jsx(BasicRuleSettings, { rule: editedRule, onUpdate: updateRule })), activeTab === 'conditions' && (_jsx(ConditionBuilder, { rule: editedRule, onUpdate: updateRule })), activeTab === 'actions' && (_jsx(ActionBuilder, { rule: editedRule, onUpdate: updateRule })), activeTab === 'notifications' && (_jsx(NotificationSettings, { rule: editedRule, onUpdate: updateRule }))] })] }), _jsxs("div", { className: "dialog-actions", children: [_jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleSave, children: "Save Rule" })] })] }) }));
};
/**
 * Basic Rule Settings Tab
 */
const BasicRuleSettings = ({ rule, onUpdate }) => {
    return (_jsxs("div", { className: "basic-settings", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "ruleName", children: "Rule Name" }), _jsx(Input, { id: "ruleName", value: rule.name, onChange: (e) => onUpdate({ name: e.target.value }), placeholder: "Enter rule name" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "ruleDescription", children: "Description" }), _jsx(Textarea, { id: "ruleDescription", value: rule.description, onChange: (e) => onUpdate({ description: e.target.value }), placeholder: "Describe what this rule detects and why it's important", rows: 3 })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "severityThreshold", children: "Minimum Severity" }), _jsx(Select, { id: "severityThreshold", value: rule.severity_threshold, onValueChange: (value) => onUpdate({ severity_threshold: value }), children: Object.values(SecurityEventSeverity).map(severity => (_jsx("option", { value: severity, children: severity.toUpperCase() }, severity))) })] }), _jsx("div", { className: "form-group", children: _jsxs("label", { children: [_jsx(Checkbox, { checked: rule.enabled, onChange: (checked) => onUpdate({ enabled: checked }) }), "Enable this rule"] }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Event Types to Monitor" }), _jsx("div", { className: "event-types-selector", children: Object.values(SecurityEventType).map(eventType => (_jsxs("label", { className: "event-type-checkbox", children: [_jsx(Checkbox, { checked: rule.event_types.includes(eventType), onChange: (checked) => {
                                        const updatedTypes = checked
                                            ? [...rule.event_types, eventType]
                                            : rule.event_types.filter(t => t !== eventType);
                                        onUpdate({ event_types: updatedTypes });
                                    } }), eventType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())] }, eventType))) })] })] }));
};
/**
 * Condition Builder Tab
 */
const ConditionBuilder = ({ rule, onUpdate }) => {
    const addCondition = () => {
        const newCondition = {
            id: crypto.randomUUID(),
            field: 'threat_level',
            operator: 'gte',
            value: 5,
            logic_operator: rule.conditions.length > 0 ? 'and' : undefined
        };
        onUpdate({ conditions: [...rule.conditions, newCondition] });
    };
    const updateCondition = (id, updates) => {
        const updatedConditions = rule.conditions.map(condition => condition.id === id ? { ...condition, ...updates } : condition);
        onUpdate({ conditions: updatedConditions });
    };
    const removeCondition = (id) => {
        onUpdate({ conditions: rule.conditions.filter(c => c.id !== id) });
    };
    return (_jsxs("div", { className: "condition-builder", children: [_jsxs("div", { className: "builder-header", children: [_jsx("p", { children: "Define conditions that must be met to trigger this alert rule." }), _jsx(Button, { variant: "outline", onClick: addCondition, children: "Add Condition" })] }), rule.conditions.map((condition, index) => (_jsxs("div", { className: "condition-item", children: [index > 0 && (_jsx("div", { className: "logic-operator", children: _jsxs(Select, { value: condition.logic_operator || 'and', onValueChange: (value) => updateCondition(condition.id, { logic_operator: value }), children: [_jsx("option", { value: "and", children: "AND" }), _jsx("option", { value: "or", children: "OR" })] }) })), _jsxs("div", { className: "condition-config", children: [_jsx(Select, { value: condition.field, onValueChange: (value) => updateCondition(condition.id, { field: value }), children: AVAILABLE_FIELDS.map(field => (_jsx("option", { value: field.value, children: field.label }, field.value))) }), _jsx(Select, { value: condition.operator, onValueChange: (value) => updateCondition(condition.id, { operator: value }), children: getOperatorsForField(condition.field).map(op => (_jsx("option", { value: op, children: getOperatorLabel(op) }, op))) }), _jsx(Input, { value: condition.value, onChange: (e) => updateCondition(condition.id, { value: e.target.value }), placeholder: "Value" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => removeCondition(condition.id), children: "Remove" })] })] }, condition.id))), rule.conditions.length === 0 && (_jsx("div", { className: "empty-conditions", children: _jsx("p", { children: "No conditions defined. Add conditions to specify when this rule should trigger." }) }))] }));
};
/**
 * Action Builder Tab
 */
const ActionBuilder = ({ rule, onUpdate }) => {
    const addAction = (actionType) => {
        const newAction = {
            id: crypto.randomUUID(),
            type: actionType,
            name: ACTION_TYPES.find(t => t.type === actionType)?.name || actionType,
            config: {},
            enabled: true
        };
        onUpdate({ actions: [...rule.actions, newAction] });
    };
    const updateAction = (id, updates) => {
        const updatedActions = rule.actions.map(action => action.id === id ? { ...action, ...updates } : action);
        onUpdate({ actions: updatedActions });
    };
    const removeAction = (id) => {
        onUpdate({ actions: rule.actions.filter(a => a.id !== id) });
    };
    return (_jsxs("div", { className: "action-builder", children: [_jsxs("div", { className: "builder-header", children: [_jsx("p", { children: "Configure actions to take when this alert rule is triggered." }), _jsx("div", { className: "action-types", children: ACTION_TYPES.map(actionType => (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => addAction(actionType.type), children: [actionType.icon, " ", actionType.name] }, actionType.type))) })] }), _jsx("div", { className: "actions-list", children: rule.actions.map(action => (_jsxs(Card, { className: "action-card", children: [_jsxs("div", { className: "action-header", children: [_jsxs("div", { className: "action-info", children: [_jsx("span", { className: "action-icon", children: ACTION_TYPES.find(t => t.type === action.type)?.icon }), _jsx("span", { className: "action-name", children: action.name }), _jsx(Badge, { variant: action.enabled ? 'success' : 'secondary', children: action.enabled ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "action-controls", children: [_jsx(Checkbox, { checked: action.enabled, onChange: (checked) => updateAction(action.id, { enabled: checked }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => removeAction(action.id), children: "Remove" })] })] }), _jsx("div", { className: "action-config", children: _jsx(ActionConfigForm, { action: action, onUpdate: (updates) => updateAction(action.id, updates) }) })] }, action.id))) }), rule.actions.length === 0 && (_jsx("div", { className: "empty-actions", children: _jsx("p", { children: "No actions defined. Add actions to specify what should happen when this rule triggers." }) }))] }));
};
/**
 * Action Configuration Form
 */
const ActionConfigForm = ({ action, onUpdate }) => {
    const updateConfig = (key, value) => {
        onUpdate({
            config: { ...action.config, [key]: value }
        });
    };
    switch (action.type) {
        case 'notification':
            return (_jsx("div", { className: "config-form", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Message Template" }), _jsx(Textarea, { value: action.config.message_template || '', onChange: (e) => updateConfig('message_template', e.target.value), placeholder: "Alert: {event_type} detected from {source_ip}" })] }) }));
        case 'containment':
            return (_jsx("div", { className: "config-form", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Containment Actions" }), _jsxs("div", { className: "checkbox-group", children: [_jsxs("label", { children: [_jsx(Checkbox, { checked: action.config.block_ip || false, onChange: (checked) => updateConfig('block_ip', checked) }), "Block Source IP"] }), _jsxs("label", { children: [_jsx(Checkbox, { checked: action.config.lock_account || false, onChange: (checked) => updateConfig('lock_account', checked) }), "Lock User Account"] }), _jsxs("label", { children: [_jsx(Checkbox, { checked: action.config.isolate_system || false, onChange: (checked) => updateConfig('isolate_system', checked) }), "Isolate System"] })] })] }) }));
        case 'webhook':
            return (_jsxs("div", { className: "config-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Webhook URL" }), _jsx(Input, { value: action.config.webhook_url || '', onChange: (e) => updateConfig('webhook_url', e.target.value), placeholder: "https://api.example.com/alerts" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "HTTP Method" }), _jsxs(Select, { value: action.config.method || 'POST', onValueChange: (value) => updateConfig('method', value), children: [_jsx("option", { value: "POST", children: "POST" }), _jsx("option", { value: "PUT", children: "PUT" }), _jsx("option", { value: "PATCH", children: "PATCH" })] })] })] }));
        default:
            return null;
    }
};
/**
 * Notification Settings Tab
 */
const NotificationSettings = ({ _____rule, _____onUpdate }) => {
    return (_jsxs("div", { className: "notification-settings", children: [_jsx("p", { children: "Configure notification channels for this alert rule." }), _jsx("div", { className: "placeholder-content", children: _jsx("p", { children: "Notification channel configuration will be implemented based on the existing notification system." }) })] }));
};
// Utility functions
function validateRule(rule) {
    const errors = [];
    if (!rule.name.trim()) {
        errors.push('Rule name is required');
    }
    if (rule.conditions.length === 0) {
        errors.push('At least one condition must be defined');
    }
    if (rule.actions.length === 0) {
        errors.push('At least one action must be defined');
    }
    return errors;
}
function getOperatorsForField(field) {
    const fieldType = AVAILABLE_FIELDS.find(f => f.value === field)?.type || 'string';
    return OPERATORS_BY_TYPE[fieldType] || [];
}
function getOperatorLabel(operator) {
    const labels = {
        eq: 'equals',
        ne: 'not equals',
        gt: 'greater than',
        lt: 'less than',
        gte: 'greater than or equal',
        lte: 'less than or equal',
        contains: 'contains',
        regex: 'matches regex',
        in: 'is in',
        not_in: 'is not in'
    };
    return labels[operator] || operator;
}
export default AlertRuleBuilder;

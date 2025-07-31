import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Security Event Logging Configuration Panel
 *
 * Comprehensive UI for configuring security event logging policies, destinations,
 * alert rules, and compliance framework settings. Builds on existing PromptScape
 * UI patterns and integrates with the security event policy engine.
 */
import { useState, useCallback } from 'react';
import { ComplianceFramework, securityEventPolicyEngine } from '../../security/SecurityEventLoggingPolicies';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Tabs } from '../ui/Tabs';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { AlertRuleBuilder } from './AlertRuleBuilder';
import './SecurityEventLoggingConfigPanel.css';
const loadConfiguration = async () => {
    setLoading(true);
    try {
        // Load current security logging configuration
        // In a real implementation, this would fetch from an API
        const currentConfig = await fetchSecurityLoggingConfig();
        setConfig(currentConfig);
    }
    catch (error) {
        setErrors(['Failed to load security logging configuration']);
    }
    finally {
        setLoading(false);
    }
    ;
    const loadPolicies = () => {
        try {
            const currentPolicies = securityEventPolicyEngine.getPolicies();
            setPolicies(currentPolicies);
        }
        catch (error) {
            setErrors(prev => [...prev, 'Failed to load security policies']);
        }
        ;
        const handleConfigChange = useCallback((updates) => {
            setConfig(prev => ({ ...prev, ...updates }));
            setHasUnsavedChanges(true);
        }, []);
        const handleSaveConfiguration = async () => {
            setLoading(true);
            setErrors([]);
            try {
                // Validate configuration
                const validationErrors = validateConfiguration(config);
                if (validationErrors.length > 0) {
                    setErrors(validationErrors);
                    return;
                    // Save configuration
                    await saveSecurityLoggingConfig(config);
                    setHasUnsavedChanges(false);
                    // Show success message
                    // In a real implementation, this would show a toast notification
                    console.log('Security logging configuration saved successfully');
                }
                try { }
                catch (error) {
                    setErrors(['Failed to save configuration: ' + (error instanceof Error ? error.message : 'Unknown error')]);
                }
                finally {
                    setLoading(false);
                }
                ;
                const handleTestConfiguration = async () => {
                    setLoading(true);
                    try {
                        const testResults = await testSecurityLoggingConfig(config);
                        // Show test results in a dialog or notification
                        console.log('Configuration test results:', testResults);
                    }
                    catch (error) {
                        setErrors(['Configuration test failed: ' + (error instanceof Error ? error.message : 'Unknown error')]);
                    }
                    finally {
                        setLoading(false);
                    }
                    ;
                    const renderOverviewTab = () => ();
                    ;
                    _jsxs("div", { className: "config-overview", children: [_jsxs("div", { className: "overview-header", children: [_jsx("h2", { children: "Security Event Logging Overview" }), _jsx("p", { children: "Configure comprehensive security event logging, monitoring, and compliance reporting" })] }), _jsxs(Card, { className: "status-card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h3", { children: "System Status" }), _jsx(Badge, { variant: config.enabled ? 'success' : 'error', children: config.enabled ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "status-grid", children: [_jsxs("div", { className: "status-item", children: [_jsx("span", { className: "label", children: "Active Destinations" }), _jsx("span", { className: "value", children: config.destinations.filter(d => d.enabled).length })] }), _jsxs("div", { className: "status-item", children: [_jsx("span", { className: "label", children: "Monitored Event Types" }), _jsx("span", { className: "value", children: config.event_types.length })] }), _jsxs("div", { className: "status-item", children: [_jsx("span", { className: "label", children: "Active Alert Rules" }), _jsx("span", { className: "value", children: config.alert_rules.filter(r => r.enabled).length })] }), _jsxs("div", { className: "status-item", children: [_jsx("span", { className: "label", children: "Compliance Frameworks" }), _jsx("span", { className: "value", children: config.compliance_settings.frameworks.length })] })] })] }), _jsxs(Card, { className: "quick-actions", children: [_jsx("h3", { children: "Quick Actions" }), _jsxs("div", { className: "action-buttons", children: [_jsx(Button, { variant: "primary", onClick: () => setActiveTab('destinations'), children: "Configure Destinations" }), _jsx(Button, { variant: "secondary", onClick: () => setActiveTab('alerts'), children: "Manage Alert Rules" }), _jsx(Button, { variant: "secondary", onClick: () => setActiveTab('compliance'), children: "Compliance Settings" }), _jsx(Button, { variant: "outline", onClick: handleTestConfiguration, disabled: loading, children: "Test Configuration" })] })] }), _jsxs(Card, { className: "policies-card", children: [_jsx("h3", { children: "Security Event Policies" }), _jsx("div", { className: "policies-grid", children: policies.map(policy => ()
                                            < div, key = { policy, : .policy_id }, className = "policy-item" >
                                            (_jsxs("div", { className: "policy-header", children: [_jsx("span", { className: "policy-name", children: policy.policy_name }), _jsx(Badge, { variant: policy.enabled ? 'success' : 'warning', children: policy.enabled ? 'Active' : 'Disabled' })] })
                                                ,
                                                    _jsxs("div", { className: "policy-details", children: [_jsxs("span", { children: ["Event Types: ", policy.event_types.length] }), _jsxs("span", { children: ["Min Severity: ", policy.severity_threshold] }), _jsxs("span", { children: ["Compliance: ", policy.compliance_mapping.frameworks.join(', ')] })] }))) }), "))}"] })] });
                };
            }
            finally {
            }
        };
    };
};
Card >
;
div >
;
;
const renderDestinationsTab = () => ();
;
_jsx(LogDestinationManager, { destinations: config.destinations, onDestinationsChange: (destinations) => handleConfigChange({ destinations }) });
;
const renderEventTypesTab = () => ();
;
_jsx(EventTypeSelector, { selectedTypes: config.event_types, onSelectionChange: (event_types) => handleConfigChange({ event_types }) });
;
const renderAlertsTab = () => ();
;
_jsx(AlertRuleBuilder, { alertRules: config.alert_rules, onRulesChange: (alert_rules) => handleConfigChange({ alert_rules }) });
;
const renderRetentionTab = () => ();
;
_jsx(RetentionPolicyEditor, { policies: config.retention_policies, onPoliciesChange: (retention_policies) => handleConfigChange({ retention_policies }) });
;
const renderPerformanceTab = () => ();
;
_jsx(PerformanceSettingsPanel, { settings: config.performance_settings, onSettingsChange: (performance_settings) => handleConfigChange({ performance_settings }) });
;
const renderComplianceTab = () => ();
;
_jsx(ComplianceFrameworkSettings, { settings: config.compliance_settings, onSettingsChange: (compliance_settings) => handleConfigChange({ compliance_settings }) });
;
return;
_jsx("div", { className: "security-logging-config", children: _jsxs("div", { className: "config-header", children: [_jsxs("div", { className: "header-content", children: [_jsx("h1", { children: "\uD83D\uDEE1\uFE0F Security Event Logging Configuration" }), _jsx("p", { children: "Manage security event logging, monitoring, and compliance settings" })] }), _jsxs("div", { className: "header-actions", children: [hasUnsavedChanges && ()
                        < Badge, " variant=\"warning\">Unsaved Changes"] }), ")}", _jsx(Button, { variant: "outline", onClick: () => loadConfiguration(), disabled: loading, children: "Refresh" }), _jsx(Button, { variant: "primary", onClick: handleSaveConfiguration, disabled: loading || !hasUnsavedChanges, children: loading ? 'Saving...' : 'Save Configuration' })] }) });
{
    errors.length > 0 && ()
        < Alert;
    variant = "error";
    className = "config-errors" >
        (_jsx("strong", { children: "Configuration Errors:" })
            ,
                _jsx("ul", { children: errors.map((error, index) => ()
                        < li, key = { index } > { error }) }));
}
ul >
;
Alert >
;
_jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "config-tabs", children: [_jsxs("div", { className: "tabs-list", children: [_jsx("button", { className: `tab-trigger ${activeTab === 'overview' ? 'active' : ''}`, onClick: () => setActiveTab('overview'), children: "Overview" }), _jsx("button", { className: `tab-trigger ${activeTab === 'destinations' ? 'active' : ''}`, onClick: () => setActiveTab('destinations'), children: "Destinations" }), _jsx("button", { className: `tab-trigger ${activeTab === 'events' ? 'active' : ''}`, onClick: () => setActiveTab('events'), children: "Event Types" }), _jsx("button", { className: `tab-trigger ${activeTab === 'alerts' ? 'active' : ''}`, onClick: () => setActiveTab('alerts'), children: "Alert Rules" }), _jsx("button", { className: `tab-trigger ${activeTab === 'retention' ? 'active' : ''}`, onClick: () => setActiveTab('retention'), children: "Retention" }), _jsx("button", { className: `tab-trigger ${activeTab === 'performance' ? 'active' : ''}`, onClick: () => setActiveTab('performance'), children: "Performance" }), _jsx("button", { className: `tab-trigger ${activeTab === 'compliance' ? 'active' : ''}`, onClick: () => setActiveTab('compliance'), children: "Compliance" })] }), _jsxs("div", { className: "tab-content", children: [activeTab === 'overview' && renderOverviewTab(), activeTab === 'destinations' && renderDestinationsTab(), activeTab === 'events' && renderEventTypesTab(), activeTab === 'alerts' && renderAlertsTab(), activeTab === 'retention' && renderRetentionTab(), activeTab === 'performance' && renderPerformanceTab(), activeTab === 'compliance' && renderComplianceTab()] })] });
{
    showConfirmDialog && ()
        < Dialog;
    open = { showConfirmDialog };
    onOpenChange = { setShowConfirmDialog };
    title = "Unsaved Changes";
    description = "You have unsaved changes. Are you sure you want to leave this page?"
        >
            _jsxs("div", { className: "dialog-actions", children: [_jsx(Button, { variant: "outline", onClick: () => setShowConfirmDialog(false), children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: () => {
                            setShowConfirmDialog(false);
                            setHasUnsavedChanges(false);
                        }, children: "Discard Changes" })] });
    Dialog >
    ;
}
div >
;
;
;
// Component for managing logging destinations
const LogDestinationManager, LoggingDestination;
onDestinationsChange: (destinations) => void ;
 > ;
({ destinations, onDestinationsChange }) => {
    const [_editingDestination, setEditingDestination] = useState(null);
    const [_showAddDialog, setShowAddDialog] = useState(false);
    const _handleAddDestination = (newDestination) => {
        onDestinationsChange([...destinations, newDestination]);
        setShowAddDialog(false);
    };
    const _handleUpdateDestination = (updated) => {
        const updatedDestinations = destinations.map(dest => );
        ;
        dest.id === updated.id ? updated : dest;
        ;
        onDestinationsChange(updatedDestinations);
        setEditingDestination(null);
    };
    const handleDeleteDestination = (id) => {
        const filtered = destinations.filter(dest => dest.id !== id);
        onDestinationsChange(filtered);
    };
    return;
    _jsxs("div", { className: "destination-manager", children: [_jsxs("div", { className: "manager-header", children: [_jsx("h2", { children: "Logging Destinations" }), _jsx("p", { children: "Configure where security events are sent for storage and processing" }), _jsx(Button, { variant: "primary", onClick: () => setShowAddDialog(true), children: "Add Destination" })] }), _jsx("div", { className: "destinations-grid", children: destinations.map(destination => ()
                    < Card, key = { destination, : .id }, className = "destination-card" >
                    (_jsxs("div", { className: "destination-header", children: [_jsxs("div", { className: "destination-info", children: [_jsx("h3", { children: destination.name }), _jsx(Badge, { variant: destination.type === 'siem' ? 'info' : 'default', children: destination.type.toUpperCase() }), _jsx(Badge, { variant: destination.enabled ? 'success' : 'error', children: destination.enabled ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "destination-actions", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setEditingDestination(destination), children: "Edit" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleDeleteDestination(destination.id), children: "Delete" })] })] })
                        ,
                            _jsxs("div", { className: "destination-details", children: [_jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "label", children: "Endpoint:" }), _jsx("span", { className: "value", children: destination.endpoint })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "label", children: "Format:" }), _jsx("span", { className: "value", children: destination.format.toUpperCase() })] }), destination.batch_size && ()
                                        < div, " className=\"detail-item\">", _jsx("span", { className: "label", children: "Batch Size:" }), _jsx("span", { className: "value", children: destination.batch_size })] }))) })] });
};
div >
    { destinations, : .length === 0 && ()
            < div, className = "empty-state" >
            (_jsx("h3", { children: "No Destinations Configured" })
                ,
                    _jsx("p", { children: "Add your first logging destination to start collecting security events." })
                        ,
                            _jsx(Button, { variant: "primary", onClick: () => setShowAddDialog(true), children: "Add First Destination" })),
        div } >
;
div >
;
;
;
// Component for selecting event types to monitor
const EventTypeSelector, SecurityEventType;
onSelectionChange: (types) => void ;
 > ;
({ selectedTypes, onSelectionChange }) => {
    const eventTypeCategories = {
        'Application Security': [
            SecurityEventType.AUTHENTICATION_FAILURE,
            SecurityEventType.AUTHORIZATION_VIOLATION,
            SecurityEventType.CODE_INJECTION_ATTEMPT,
            SecurityEventType.INPUT_VALIDATION_FAILURE,
            SecurityEventType.SESSION_ANOMALY,
            SecurityEventType.FILE_UPLOAD_VIOLATION,
            SecurityEventType.API_ABUSE_DETECTED,
            SecurityEventType.PRIVILEGE_ESCALATION
        ],
        'Network Security': [
            SecurityEventType.NETWORK_INTRUSION_ATTEMPT,
            SecurityEventType.FIREWALL_VIOLATION,
            SecurityEventType.DDOS_ATTACK_DETECTED,
            SecurityEventType.VPN_ACCESS_ANOMALY,
            SecurityEventType.DNS_QUERY_ANOMALY,
            SecurityEventType.NETWORK_SEGMENTATION_BREACH
        ],
        'Compliance Events': [
            SecurityEventType.SOX_ITGC_VIOLATION,
            SecurityEventType.GDPR_DATA_SUBJECT_REQUEST,
            SecurityEventType.CCPA_CONSUMER_REQUEST,
            SecurityEventType.CHANGE_MANAGEMENT_VIOLATION,
            SecurityEventType.SEGREGATION_DUTIES_VIOLATION
        ],
        'Advanced Threats': [
            SecurityEventType.BEHAVIORAL_ANOMALY,
            SecurityEventType.INSIDER_THREAT_INDICATOR,
            SecurityEventType.IOC_DETECTION,
            SecurityEventType.THREAT_INTELLIGENCE_ALERT
        ]
    };
    const handleTypeToggle = (eventType) => {
        const isSelected = selectedTypes.includes(eventType);
        if (isSelected) {
            onSelectionChange(selectedTypes.filter(type => type !== eventType));
        }
        else {
            onSelectionChange([...selectedTypes, eventType]);
        }
        ;
        const handleCategoryToggle = (category) => {
            const categoryTypes = eventTypeCategories[category];
            const allSelected = categoryTypes.every(type => selectedTypes.includes(type));
            if (allSelected) {
                // Deselect all in category
                onSelectionChange(selectedTypes.filter(type => !categoryTypes.includes(type)));
            }
            else {
                // Select all in category
                const newTypes = [...selectedTypes];
                categoryTypes.forEach(type => { });
                if (!newTypes.includes(type)) {
                    newTypes.push(type);
                }
                ;
                onSelectionChange(newTypes);
            }
            ;
            return;
            _jsxs("div", { className: "event-type-selector", children: [_jsxs("div", { className: "selector-header", children: [_jsx("h2", { children: "Security Event Types" }), _jsx("p", { children: "Select which types of security events to monitor and log" }), _jsx("div", { className: "selection-summary", children: _jsxs(Badge, { variant: "info", children: [selectedTypes.length, " of ", Object.values(SecurityEventType).length, " types selected"] }) })] }), Object.entries(eventTypeCategories).map(([category, types]) => {
                        const selectedCount = types.filter(type => selectedTypes.includes(type)).length;
                        const allSelected = selectedCount === types.length;
                        return;
                        _jsxs(Card, { className: "category-card", children: [_jsxs("div", { className: "category-header", children: [_jsx(Checkbox, { checked: allSelected, indeterminate: selectedCount > 0 && selectedCount < types.length, onChange: () => handleCategoryToggle(category) }), _jsx("h3", { children: category }), _jsxs(Badge, { variant: selectedCount > 0 ? 'success' : 'default', children: [selectedCount, "/", types.length] })] }), _jsx("div", { className: "event-types-grid", children: types.map(eventType => ()
                                        < div, key = { eventType }, className = "event-type-item" >
                                        (_jsx(Checkbox, { checked: selectedTypes.includes(eventType), onChange: () => handleTypeToggle(eventType) })
                                            ,
                                                _jsx("span", { className: "event-type-name", children: eventType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) }))) }), "))}"] }, category);
                    })] });
        };
    };
    ;
};
div >
;
;
;
/**
 * Retention Policy Editor Component
 */
const RetentionPolicyEditor, RetentionPolicy;
onPoliciesChange: (policies) => void ;
 > ;
({ policies, onPoliciesChange }) => {
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const addPolicy = () => {
        const newPolicy = {
            framework: ComplianceFramework.GDPR,
            retention_days: 365,
            encryption_required: true,
            archive_after_days: 90,
        };
        setEditingPolicy(newPolicy);
        setShowAddDialog(true);
    };
    const savePolicy = (policy) => {
        const existingIndex = policies.findIndex(p => p.framework === policy.framework);
        if (existingIndex >= 0) {
            const updatedPolicies = [...policies];
            updatedPolicies[existingIndex] = policy;
            onPoliciesChange(updatedPolicies);
        }
        else {
            onPoliciesChange([...policies, policy]);
            setEditingPolicy(null);
            setShowAddDialog(false);
        }
        ;
        const deletePolicy = (framework) => {
            onPoliciesChange(policies.filter(p => p.framework !== framework));
        };
        return;
        _jsxs("div", { className: "retention-policy-editor", children: [_jsxs("div", { className: "editor-header", children: [_jsx("h2", { children: "Data Retention Policies" }), _jsx("p", { children: "Configure compliance-based retention policies for security event data" }), _jsx(Button, { variant: "primary", onClick: addPolicy, children: "Add Retention Policy" })] }), _jsx("div", { className: "policies-grid", children: policies.map(policy => ()
                        < Card, key = { policy, : .framework }, className = "policy-card" >
                        (_jsxs("div", { className: "policy-header", children: [_jsx("h3", { children: policy.framework }), _jsxs(Badge, { variant: "info", children: [policy.retention_days, " days"] })] })
                            ,
                                _jsxs("div", { className: "policy-details", children: [_jsxs("div", { className: "detail-row", children: [_jsx("span", { className: "label", children: "Retention Period:" }), _jsxs("span", { className: "value", children: [policy.retention_days, " days"] })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { className: "label", children: "Encryption Required:" }), _jsx("span", { className: "value", children: policy.encryption_required ? 'Yes' : 'No' })] }), policy.archive_after_days && ()
                                            < div, " className=\"detail-row\">", _jsx("span", { className: "label", children: "Archive After:" }), _jsxs("span", { className: "value", children: [policy.archive_after_days, " days"] })] }))) }), _jsxs("div", { className: "policy-actions", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                setEditingPolicy(policy);
                                setShowAddDialog(true);
                            }, children: "Edit" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => deletePolicy(policy.framework), children: "Delete" })] })] });
    };
};
div >
    { policies, : .length === 0 && ()
            < div, className = "empty-state" >
            (_jsx("h3", { children: "No Retention Policies Configured" })
                ,
                    _jsx("p", { children: "Add retention policies to ensure compliance with regulatory requirements." })
                        ,
                            _jsx(Button, { variant: "primary", onClick: addPolicy, children: "Add First Policy" })),
        div } >
;
{
    showAddDialog && editingPolicy && ()
        < Dialog;
    open = { showAddDialog };
    onOpenChange = {}();
    {
        setShowAddDialog(false);
        setEditingPolicy(null);
    }
}
title = "Configure Retention Policy"
    >
        _jsxs("div", { className: "dialog-content", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Compliance Framework" }), _jsx(Select, { value: editingPolicy.framework, onValueChange: (value) => setEditingPolicy(prev => ({ ...prev, framework: value }))
                                >
                                    { Object, : .values(ComplianceFramework).map(framework => ()
                                            < option, key = { framework }, value = { framework } >
                                            { framework }) } })] }), "))}"] });
div >
    (_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Retention Period (days)" }), _jsx(Input, { type: "number", value: editingPolicy.retention_days, onChange: (e) => setEditingPolicy(prev => ({ ...prev, retention_days: parseInt(e.target.value) }))
                    /  >
             })] })
        ,
            _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Archive After (days)" }), _jsx(Input, { type: "number", value: editingPolicy.archive_after_days || '', onChange: (e) => setEditingPolicy(prev => ({ ...prev, archive_after_days: parseInt(e.target.value) || undefined }))
                            /  >
                     })] })
                ,
                    _jsx("div", { className: "form-group", children: _jsx("label", { children: _jsx(Checkbox, { checked: editingPolicy.encryption_required, onChange: (checked) => setEditingPolicy(prev => ({ ...prev, encryption_required: checked }))
                                    /  >
                                    Encryption, Required: true }) }) })
                        ,
                            _jsxs("div", { className: "dialog-actions", children: [_jsx(Button, { variant: "outline", onClick: () => setShowAddDialog(false), children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: () => savePolicy(editingPolicy), children: "Save Policy" })] }));
div >
;
Dialog >
;
div >
;
;
;
/**
 * Performance Settings Panel Component
 */
const PerformanceSettingsPanel, PerformanceSettings;
onSettingsChange: (settings) => void ;
 > ;
({ settings, onSettingsChange }) => {
    const updateSetting = (key, value) => {
        onSettingsChange({ ...settings, [key]: value });
    };
    return;
    _jsxs("div", { className: "performance-settings", children: [_jsxs("div", { className: "settings-header", children: [_jsx("h2", { children: "Performance Settings" }), _jsx("p", { children: "Configure batch processing, queuing, and performance optimization settings" })] }), _jsxs("div", { className: "settings-sections", children: [_jsxs(Card, { className: "settings-section", children: [_jsx("h3", { children: "Batch Processing" }), _jsx("div", { className: "form-group", children: _jsxs("label", { children: [_jsx(Checkbox, { checked: settings.batch_processing_enabled, onChange: (checked) => updateSetting('batch_processing_enabled', checked) }), "Enable Batch Processing"] }) }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Batch Size" }), _jsx(Input, { type: "number", value: settings.batch_size, onChange: (e) => updateSetting('batch_size', parseInt(e.target.value)), disabled: !settings.batch_processing_enabled })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Batch Interval (ms)" }), _jsx(Input, { type: "number", value: settings.batch_interval_ms, onChange: (e) => updateSetting('batch_interval_ms', parseInt(e.target.value)), disabled: !settings.batch_processing_enabled })] })] })] }), _jsxs(Card, { className: "settings-section", children: [_jsx("h3", { children: "Queue Management" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Queue Size Limit" }), _jsx(Input, { type: "number", value: settings.queue_size_limit, onChange: (e) => updateSetting('queue_size_limit', parseInt(e.target.value)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Rate Limit (per minute)" }), _jsx(Input, { type: "number", value: settings.rate_limit_per_minute, onChange: (e) => updateSetting('rate_limit_per_minute', parseInt(e.target.value)) })] })] }), _jsxs(Card, { className: "settings-section", children: [_jsx("h3", { children: "Circuit Breaker" }), _jsx("div", { className: "form-group", children: _jsxs("label", { children: [_jsx(Checkbox, { checked: settings.circuit_breaker_enabled, onChange: (checked) => updateSetting('circuit_breaker_enabled', checked) }), "Enable Circuit Breaker"] }) }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Failure Threshold" }), _jsx(Input, { type: "number", value: settings.circuit_breaker_threshold, onChange: (e) => updateSetting('circuit_breaker_threshold', parseInt(e.target.value)), disabled: !settings.circuit_breaker_enabled })] })] }), _jsxs(Card, { className: "settings-section", children: [_jsx("h3", { children: "Performance Monitoring" }), _jsxs("div", { className: "metrics-grid", children: [_jsxs("div", { className: "metric-card", children: [_jsx("span", { className: "metric-label", children: "Current Queue Size" }), _jsx("span", { className: "metric-value", children: "0" })] }), _jsxs("div", { className: "metric-card", children: [_jsx("span", { className: "metric-label", children: "Processing Rate" }), _jsx("span", { className: "metric-value", children: "0/min" })] }), _jsxs("div", { className: "metric-card", children: [_jsx("span", { className: "metric-label", children: "Circuit Breaker Status" }), _jsx(Badge, { variant: settings.circuit_breaker_enabled ? 'success' : 'secondary', children: settings.circuit_breaker_enabled ? 'Active' : 'Inactive' })] })] })] })] })] });
    ;
};
/**
 * Compliance Framework Settings Component
 */
const ComplianceFrameworkSettings, ComplianceSettings;
onSettingsChange: (settings) => void ;
 > ;
({ settings, onSettingsChange }) => {
    const updateFrameworks = (framework, enabled) => {
        const updatedFrameworks = enabled;
    };
    [...settings.frameworks, framework];
    settings.frameworks.filter(f => f !== framework);
    onSettingsChange({ ...settings, frameworks: updatedFrameworks });
};
const updateValidationRule = (index, updates) => {
    const updatedRules = [...settings.validation_rules];
    updatedRules[index] = { ...updatedRules[index], ...updates };
    onSettingsChange({ ...settings, validation_rules: updatedRules });
};
const addValidationRule = () => {
    const newRule = {
        framework: ComplianceFramework.GDPR,
        field: 'user_id',
        required: true,
    };
    onSettingsChange({});
};
settings,
    validation_rules;
[...settings.validation_rules, newRule],
;
;
;
const removeValidationRule = (index) => {
    const updatedRules = settings.validation_rules.filter((_, i) => i !== index);
    onSettingsChange({ ...settings, validation_rules: updatedRules });
};
return;
_jsxs("div", { className: "compliance-settings", children: [_jsxs("div", { className: "settings-header", children: [_jsx("h2", { children: "Compliance Framework Settings" }), _jsx("p", { children: "Configure regulatory compliance frameworks and validation rules" })] }), _jsx("div", { className: "settings-sections", children: _jsxs(Card, { className: "settings-section", children: [_jsx("h3", { children: "Enabled Frameworks" }), _jsx("div", { className: "frameworks-grid", children: Object.values(ComplianceFramework).map(framework => ()
                            < label, key = { framework }, className = "framework-checkbox" >
                            (_jsx(Checkbox, { checked: settings.frameworks.includes(framework), onChange: (checked) => updateFrameworks(framework, checked) })
                                ,
                                    _jsxs("div", { className: "framework-info", children: [_jsx("span", { className: "framework-name", children: framework }), _jsx("span", { className: "framework-description", children: getFrameworkDescription(framework) })] }))) }), "))}"] }) })] })
    ,
        _jsxs(Card, { className: "settings-section", children: [_jsx("h3", { children: "General Settings" }), _jsx("div", { className: "form-group", children: _jsx("label", { children: _jsx(Checkbox, { checked: settings.automated_reporting, onChange: (checked) => onSettingsChange({ ...settings, automated_reporting: checked })
                                /  >
                                Enable, Automated: true, Compliance: true, Reporting: true }) }) }), _jsx("div", { className: "form-group", children: _jsx("label", { children: _jsx(Checkbox, { checked: settings.external_notifications, onChange: (checked) => onSettingsChange({ ...settings, external_notifications: checked })
                                /  >
                                Enable, External: true, Compliance: true, Notifications: true }) }) })] })
            ,
                _jsxs(Card, { className: "settings-section", children: [_jsx("h3", { children: "Validation Rules" }), _jsx("p", { children: "Define field validation rules for compliance frameworks" }), _jsx(Button, { variant: "outline", onClick: addValidationRule, className: "mb-4", children: "Add Validation Rule" }), _jsxs("div", { className: "validation-rules", children: [settings.validation_rules.map((rule, index) => ()
                                    < div, key = { index }, className = "validation-rule" >
                                    _jsx("div", { className: "rule-config", children: _jsx(Select, { value: rule.framework, onValueChange: (value) => updateValidationRule(index, { framework: value })
                                                >
                                                    { Object, : .values(ComplianceFramework).map(framework => ()
                                                            < option, key = { framework }, value = { framework } >
                                                            { framework }) } }) })), ")}"] }), _jsx(Input, { value: rule.field, onChange: (e) => updateValidationRule(index, { field: e.target.value }), placeholder: "Field name" }), _jsxs("label", { children: [_jsx(Checkbox, { checked: rule.required, onChange: (checked) => updateValidationRule(index, { required: checked }) }), "Required"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => removeValidationRule(index), children: "Remove" })] });
{
    rule.pattern && ()
        < Input;
    value = { rule, : .pattern };
    onChange = {}(e);
    updateValidationRule(index, { pattern: e.target.value });
}
placeholder = "Validation pattern (regex)"
    /  >
;
div >
;
div >
    { settings, : .validation_rules.length === 0 && ()
            < div, className = "empty-validation-rules" >
            _jsx("p", { children: "No validation rules configured. Add rules to enforce compliance requirements." }),
        div } >
;
Card >
;
div >
;
div >
;
;
;
// Helper function for framework descriptions
function getFrameworkDescription(framework) {
    const descriptions = {
        [ComplianceFramework.GDPR]: 'General Data Protection Regulation (EU)',
        [ComplianceFramework.CCPA]: 'California Consumer Privacy Act',
        [ComplianceFramework.SOX]: 'Sarbanes-Oxley Act',
        [ComplianceFramework.HIPAA]: 'Health Insurance Portability and Accountability Act',
        [ComplianceFramework.ISO27001]: 'ISO 27001 Information Security Management',
        [ComplianceFramework.PCI_DSS]: 'Payment Card Industry Data Security Standard',
        [ComplianceFramework.NIST]: 'NIST Cybersecurity Framework',
        [ComplianceFramework.FERPA]: 'Family Educational Rights and Privacy Act',
        [ComplianceFramework.GLBA]: 'Gramm-Leach-Bliley Act',
        [ComplianceFramework.FEDRAMP]: 'Federal Risk and Authorization Management Program',
    };
    return descriptions[framework] || framework;
    // Utility functions (would be replaced with actual API calls)
    async function fetchSecurityLoggingConfig() {
        // Simulate API call
        return {
            enabled: true,
            destinations: [,
                {
                    id: '1',
                    name: 'Primary Database',
                    type: 'database',
                    endpoint: 'postgresql://localhost:5432/security_logs',
                    enabled: true,
                    format: 'json',
                    batch_size: 100,
                    flush_interval: 30000,
                },
                {
                    id: '2',
                    name: 'SIEM Integration',
                    type: 'siem',
                    endpoint: 'https://siem.company.com/api/events',
                    enabled: true,
                    format: 'cef',
                    credentials: { api_key: '***' }
                }
            ],
            event_types: [,
                SecurityEventType.AUTHENTICATION_FAILURE,
                SecurityEventType.CODE_INJECTION_ATTEMPT,
                SecurityEventType.NETWORK_INTRUSION_ATTEMPT
            ],
            alert_rules: [],
            retention_policies: [],
            performance_settings: {
                batch_processing_enabled: true,
                batch_size: 100,
                batch_interval_ms: 60000,
                queue_size_limit: 10000,
                circuit_breaker_enabled: true,
                circuit_breaker_threshold: 100,
                rate_limit_per_minute: 1000,
            },
            compliance_settings: {
                frameworks: [ComplianceFramework.SOX, ComplianceFramework.GDPR],
                automated_reporting: true,
                external_notifications: true,
                validation_rules: [],
            },
            function: saveSecurityLoggingConfig(config, SecurityLoggingConfig), void:  > {
                // Simulate API call
                await: new Promise(resolve => setTimeout(resolve, 1000)),
                console, : .log('Saved configuration:', config),
                function: testSecurityLoggingConfig(_config, SecurityLoggingConfig), Promise() {
                    // Simulate configuration test
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return {
                        success: true,
                        tests: [,
                            { name: 'Database Connection', status: 'pass' },
                            { name: 'SIEM Integration', status: 'pass' },
                            { name: 'Event Processing', status: 'pass' }
                        ]
                    };
                    function validateConfiguration(config) {
                        const errors = [];
                        if (config.destinations.length === 0) {
                            errors.push('At least one logging destination must be configured');
                            if (config.event_types.length === 0) {
                                errors.push('At least one event type must be selected for monitoring');
                                // Add more validation rules as needed
                                return errors;
                                export default SecurityEventLoggingConfigPanel;
                            }
                        }
                    }
                }
            }
        };
    }
}

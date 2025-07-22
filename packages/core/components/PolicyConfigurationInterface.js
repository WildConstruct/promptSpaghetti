import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Policy Configuration Interface - Epic 19
 *
 * Comprehensive React interface for policy authoring, management, versioning,
 * and deployment configuration.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { z } from 'zod';
// Validation schemas
const PolicyFormSchema = z.object({
    policyType: z.enum(['PRIVACY_POLICY',
        'TERMS_OF_SERVICE',
        'COOKIE_POLICY',
        'DATA_PROCESSING_AGREEMENT',
        'CONSENT_POLICY',
        'RETENTION_POLICY',
        'SECURITY_POLICY',
        'ACCEPTABLE_USE_POLICY',
        'GDPR_POLICY',
        'CCPA_POLICY',
        'CUSTOM']),
    title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
    jurisdiction: z.array(z.string()).min(1, 'At least one jurisdiction is required'),
    complianceFrameworks: z.array(z.string()),
    audience: z.array(z.string()).min(1, 'At least one audience is required')
});
export const PolicyConfigurationInterface = ({ onPolicyCreate, onPolicyUpdate, onPolicyDeploy, initialPolicy, mode = 'create', complianceFrameworks = ['GDPR', 'CCPA', 'SOX', 'HIPAA', 'PCI-DSS'], jurisdictions = ['US', 'EU', 'UK', 'CA', 'AU'], templates = [] }) => {
    // State management
    const [currentTab, setCurrentTab] = useState('basic');
    const [formData, setFormData] = useState({
        policyType: 'PRIVACY_POLICY',
        title: '',
        description: '',
        jurisdiction: [],
        complianceFrameworks: [],
        audience: [],
        templateId: '',
        variables: {},
        customizations: []
    });
    const [deploymentConfig, setDeploymentConfig] = useState({
        environment: 'STAGING',
        channels: [],
        rolloutType: 'IMMEDIATE',
        phases: [],
        notifications: {
            enabled: true,
            channels: ['EMAIL'],
            template: 'default',
            immediate: true
        }
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    // Initialize form with initial policy data
    useEffect(() => {
        if (initialPolicy && mode !== 'create') {
            setFormData({
                policyType: initialPolicy.policyType,
                title: initialPolicy.title,
                description: initialPolicy.description,
                jurisdiction: initialPolicy.jurisdiction,
                complianceFrameworks: initialPolicy.complianceFrameworks,
                audience: initialPolicy.audience,
                templateId: initialPolicy.templateId || '',
                variables: initialPolicy.variables || {},
                customizations: initialPolicy.customizations || []
            });
        }
    }, [initialPolicy, mode]);
    // Template selection handling
    const handleTemplateSelect = useCallback((templateId) => {
        const template = templates.find(t => t.templateId === templateId);
        if (template) {
            setSelectedTemplate(template);
            setFormData(prev => ({
                ...prev,
                templateId,
                policyType: template.policyType,
                complianceFrameworks: [template.framework],
                variables: template.variables.reduce((acc, variable) => ({
                    ...acc,
                    [variable.name]: variable.defaultValue || ''
                }), {})
            }));
        }
    }, [templates]);
    // Form validation
    const validateForm = useCallback(() => {
        try {
            PolicyFormSchema.parse(formData);
            setErrors({});
            return true;
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors = {};
                error.errors.forEach(err => {
                    if (err.path) {
                        newErrors[err.path.join('.')] = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    }, [formData]);
    // Form submission handlers
    const handleCreate = useCallback(async () => {
        if (!validateForm())
            return;
        setIsLoading(true);
        try {
            const policyData = {
                ...formData,
                templateId: selectedTemplate?.templateId
            };
            if (onPolicyCreate) {
                await onPolicyCreate(policyData);
            }
        }
        catch (error) {
            console.error('Error creating policy:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, [formData, selectedTemplate, validateForm, onPolicyCreate]);
    const handleUpdate = useCallback(async () => {
        if (!validateForm())
            return;
        setIsLoading(true);
        try {
            const updateData = {
                policyId: initialPolicy?.policyId,
                version: initialPolicy?.version,
                changes: [
                    {
                        changeId: `CHG-${Date.now()}`,
                        type: 'CONTENT',
                        location: 'general',
                        description: 'Policy configuration updated via interface',
                        impact: 'MEDIUM',
                        requiresReacceptance: true,
                        newValue: formData
                    }
                ],
                description: 'Updated policy configuration',
                impact: 'MEDIUM',
                requiresApproval: true,
                notificationRequired: true
            };
            if (onPolicyUpdate) {
                await onPolicyUpdate(updateData);
            }
        }
        catch (error) {
            console.error('Error updating policy:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, [formData, initialPolicy, validateForm, onPolicyUpdate]);
    const handleDeploy = useCallback(async () => {
        if (!initialPolicy?.policyId)
            return;
        setIsLoading(true);
        try {
            const deploymentData = {
                policyId: initialPolicy.policyId,
                version: initialPolicy.version,
                environment: deploymentConfig.environment,
                channels: deploymentConfig.channels,
                rolloutStrategy: {
                    type: deploymentConfig.rolloutType,
                    phases: deploymentConfig.phases.map(phase => ({
                        ...phase,
                        startDate: new Date(),
                        successCriteria: [],
                        dependencies: []
                    })),
                    rollbackCriteria: [],
                    monitoringPeriod: 24
                },
                notificationSettings: {
                    enabled: deploymentConfig.notifications.enabled,
                    channels: deploymentConfig.notifications.channels.map(channel => ({
                        type: channel,
                        configuration: {},
                        enabled: true
                    })),
                    audiences: formData.audience,
                    template: deploymentConfig.notifications.template,
                    scheduling: {
                        immediate: deploymentConfig.notifications.immediate,
                        scheduled: deploymentConfig.notifications.scheduled
                    }
                }
            };
            if (onPolicyDeploy) {
                await onPolicyDeploy(deploymentData);
            }
        }
        catch (error) {
            console.error('Error deploying policy:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, [deploymentConfig, initialPolicy, formData.audience, onPolicyDeploy]);
    // Computed values
    const availableTemplates = useMemo(() => {
        return templates.filter(template => formData.complianceFrameworks.length === 0 ||
            formData.complianceFrameworks.includes(template.framework));
    }, [templates, formData.complianceFrameworks]);
    const isFormValid = useMemo(() => {
        return Object.keys(errors).length === 0 && formData.title && formData.description &&
            formData.jurisdiction.length > 0 && formData.audience.length > 0;
    }, [errors, formData]);
    // Helper functions for form inputs
    const updateFormField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);
    const addCustomization = useCallback(() => {
        const newCustomization = {
            customizationId: `CUST-${Date.now()}`,
            type: 'CONTENT',
            target: '',
            value: '',
            priority: 1,
            enabled: true
        };
        setFormData(prev => ({
            ...prev,
            customizations: [...prev.customizations, newCustomization]
        }));
    }, []);
    const updateCustomization = useCallback((index, field, value) => {
        setFormData(prev => ({
            ...prev,
            customizations: prev.customizations.map((cust, i) => i === index ? { ...cust, [field]: value } : cust)
        }));
    }, []);
    const removeCustomization = useCallback((index) => {
        setFormData(prev => ({
            ...prev,
            customizations: prev.customizations.filter((_, i) => i !== index)
        }));
    }, []);
    return (_jsxs("div", { className: "policy-configuration-interface", children: [_jsxs("div", { className: "policy-config-header", children: [_jsx("h2", { className: "policy-config-title", children: mode === 'create' ? 'Create New Policy' :
                            mode === 'edit' ? 'Edit Policy' : 'View Policy' }), initialPolicy && (_jsxs("div", { className: "policy-info", children: [_jsxs("span", { className: "policy-id", children: ["ID: ", initialPolicy.policyId] }), _jsxs("span", { className: "policy-version", children: ["Version: ", initialPolicy.version] }), _jsx("span", { className: `policy-status status-${initialPolicy.status?.toLowerCase()}`, children: initialPolicy.status })] }))] }), _jsxs("div", { className: "policy-config-tabs", children: [_jsx("button", { className: `tab-button ${currentTab === 'basic' ? 'active' : ''}`, onClick: () => setCurrentTab('basic'), children: "Basic Information" }), _jsx("button", { className: `tab-button ${currentTab === 'content' ? 'active' : ''}`, onClick: () => setCurrentTab('content'), children: "Content & Templates" }), _jsx("button", { className: `tab-button ${currentTab === 'compliance' ? 'active' : ''}`, onClick: () => setCurrentTab('compliance'), children: "Compliance & Frameworks" }), _jsx("button", { className: `tab-button ${currentTab === 'deployment' ? 'active' : ''}`, onClick: () => setCurrentTab('deployment'), disabled: mode === 'create', children: "Deployment" }), _jsx("button", { className: `tab-button ${currentTab === 'preview' ? 'active' : ''}`, onClick: () => setCurrentTab('preview'), children: "Preview" })] }), _jsxs("div", { className: "policy-config-content", children: [currentTab === 'basic' && (_jsxs("div", { className: "config-section", children: [_jsx("h3", { children: "Basic Information" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "policyType", children: "Policy Type *" }), _jsxs("select", { id: "policyType", value: formData.policyType, onChange: (e) => updateFormField('policyType', e.target.value), disabled: mode === 'view', children: [_jsx("option", { value: "PRIVACY_POLICY", children: "Privacy Policy" }), _jsx("option", { value: "TERMS_OF_SERVICE", children: "Terms of Service" }), _jsx("option", { value: "COOKIE_POLICY", children: "Cookie Policy" }), _jsx("option", { value: "DATA_PROCESSING_AGREEMENT", children: "Data Processing Agreement" }), _jsx("option", { value: "CONSENT_POLICY", children: "Consent Policy" }), _jsx("option", { value: "RETENTION_POLICY", children: "Retention Policy" }), _jsx("option", { value: "SECURITY_POLICY", children: "Security Policy" }), _jsx("option", { value: "ACCEPTABLE_USE_POLICY", children: "Acceptable Use Policy" }), _jsx("option", { value: "GDPR_POLICY", children: "GDPR Policy" }), _jsx("option", { value: "CCPA_POLICY", children: "CCPA Policy" }), _jsx("option", { value: "CUSTOM", children: "Custom Policy" })] }), errors.policyType && _jsx("div", { className: "error-message", children: errors.policyType })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "title", children: "Title *" }), _jsx("input", { type: "text", id: "title", value: formData.title, onChange: (e) => updateFormField('title', e.target.value), placeholder: "Enter policy title", disabled: mode === 'view' }), errors.title && _jsx("div", { className: "error-message", children: errors.title })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "description", children: "Description *" }), _jsx("textarea", { id: "description", value: formData.description, onChange: (e) => updateFormField('description', e.target.value), placeholder: "Enter policy description", rows: 4, disabled: mode === 'view' }), errors.description && _jsx("div", { className: "error-message", children: errors.description })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Jurisdiction *" }), _jsx("div", { className: "checkbox-group", children: jurisdictions.map(jurisdiction => (_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: formData.jurisdiction.includes(jurisdiction), onChange: (e) => {
                                                        if (e.target.checked) {
                                                            updateFormField('jurisdiction', [...formData.jurisdiction, jurisdiction]);
                                                        }
                                                        else {
                                                            updateFormField('jurisdiction', formData.jurisdiction.filter(j => j !== jurisdiction));
                                                        }
                                                    }, disabled: mode === 'view' }), jurisdiction] }, jurisdiction))) }), errors.jurisdiction && _jsx("div", { className: "error-message", children: errors.jurisdiction })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Target Audience *" }), _jsx("div", { className: "checkbox-group", children: ['all-users', 'customers', 'employees', 'partners', 'vendors'].map(audience => (_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: formData.audience.includes(audience), onChange: (e) => {
                                                        if (e.target.checked) {
                                                            updateFormField('audience', [...formData.audience, audience]);
                                                        }
                                                        else {
                                                            updateFormField('audience', formData.audience.filter(a => a !== audience));
                                                        }
                                                    }, disabled: mode === 'view' }), audience.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())] }, audience))) }), errors.audience && _jsx("div", { className: "error-message", children: errors.audience })] })] })), currentTab === 'content' && (_jsxs("div", { className: "config-section", children: [_jsx("h3", { children: "Content & Templates" }), templates.length > 0 && (_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "template", children: "Use Template" }), _jsxs("select", { id: "template", value: formData.templateId || '', onChange: (e) => handleTemplateSelect(e.target.value), disabled: mode === 'view', children: [_jsx("option", { value: "", children: "No template (start from scratch)" }), availableTemplates.map(template => (_jsxs("option", { value: template.templateId, children: [template.name, " (", template.framework, ")"] }, template.templateId)))] })] })), selectedTemplate && (_jsxs("div", { className: "template-variables", children: [_jsx("h4", { children: "Template Variables" }), selectedTemplate.variables.map(variable => (_jsxs("div", { className: "form-group", children: [_jsxs("label", { htmlFor: variable.name, children: [variable.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), variable.required && ' *'] }), variable.description && (_jsx("div", { className: "help-text", children: variable.description })), variable.type === 'BOOLEAN' ? (_jsx("input", { type: "checkbox", id: variable.name, checked: formData.variables[variable.name] || false, onChange: (e) => updateFormField('variables', {
                                                    ...formData.variables,
                                                    [variable.name]: e.target.checked
                                                }), disabled: mode === 'view' })) : variable.type === 'DATE' ? (_jsx("input", { type: "date", id: variable.name, value: formData.variables[variable.name] || '', onChange: (e) => updateFormField('variables', {
                                                    ...formData.variables,
                                                    [variable.name]: e.target.value
                                                }), disabled: mode === 'view' })) : variable.type === 'NUMBER' ? (_jsx("input", { type: "number", id: variable.name, value: formData.variables[variable.name] || '', onChange: (e) => updateFormField('variables', {
                                                    ...formData.variables,
                                                    [variable.name]: e.target.value
                                                }), disabled: mode === 'view' })) : (_jsx("input", { type: variable.type === 'EMAIL' ? 'email' : 'text', id: variable.name, value: formData.variables[variable.name] || '', onChange: (e) => updateFormField('variables', {
                                                    ...formData.variables,
                                                    [variable.name]: e.target.value
                                                }), disabled: mode === 'view' }))] }, variable.name)))] })), _jsxs("div", { className: "customizations-section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h4", { children: "Customizations" }), mode !== 'view' && (_jsx("button", { type: "button", onClick: addCustomization, className: "add-button", children: "Add Customization" }))] }), formData.customizations.map((customization, index) => (_jsxs("div", { className: "customization-item", children: [_jsxs("div", { className: "customization-header", children: [_jsxs("span", { children: ["Customization ", index + 1] }), mode !== 'view' && (_jsx("button", { type: "button", onClick: () => removeCustomization(index), className: "remove-button", children: "Remove" }))] }), _jsxs("div", { className: "customization-fields", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Type" }), _jsxs("select", { value: customization.type, onChange: (e) => updateCustomization(index, 'type', e.target.value), disabled: mode === 'view', children: [_jsx("option", { value: "BRANDING", children: "Branding" }), _jsx("option", { value: "CONTENT", children: "Content" }), _jsx("option", { value: "STRUCTURE", children: "Structure" }), _jsx("option", { value: "VARIABLES", children: "Variables" }), _jsx("option", { value: "STYLING", children: "Styling" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Target" }), _jsx("input", { type: "text", value: customization.target, onChange: (e) => updateCustomization(index, 'target', e.target.value), placeholder: "e.g., section.introduction, header.logo", disabled: mode === 'view' })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Value" }), _jsx("textarea", { value: customization.value, onChange: (e) => updateCustomization(index, 'value', e.target.value), placeholder: "Customization value", rows: 2, disabled: mode === 'view' })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Priority" }), _jsx("input", { type: "number", value: customization.priority, onChange: (e) => updateCustomization(index, 'priority', parseInt(e.target.value)), min: "1", max: "10", disabled: mode === 'view' })] }), _jsx("div", { className: "form-group", children: _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: customization.enabled, onChange: (e) => updateCustomization(index, 'enabled', e.target.checked), disabled: mode === 'view' }), "Enabled"] }) })] })] }, customization.customizationId)))] })] })), currentTab === 'compliance' && (_jsxs("div", { className: "config-section", children: [_jsx("h3", { children: "Compliance & Frameworks" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Compliance Frameworks" }), _jsx("div", { className: "checkbox-group", children: complianceFrameworks.map(framework => (_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: formData.complianceFrameworks.includes(framework), onChange: (e) => {
                                                        if (e.target.checked) {
                                                            updateFormField('complianceFrameworks', [...formData.complianceFrameworks, framework]);
                                                        }
                                                        else {
                                                            updateFormField('complianceFrameworks', formData.complianceFrameworks.filter(f => f !== framework));
                                                        }
                                                    }, disabled: mode === 'view' }), framework] }, framework))) })] }), formData.complianceFrameworks.length > 0 && (_jsxs("div", { className: "compliance-info", children: [_jsx("h4", { children: "Framework Requirements" }), formData.complianceFrameworks.map(framework => (_jsxs("div", { className: "framework-requirements", children: [_jsx("h5", { children: framework }), _jsxs("ul", { children: [framework === 'GDPR' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2713 Clear legal basis for processing" }), _jsx("li", { children: "\u2713 Data subject rights section" }), _jsx("li", { children: "\u2713 Contact information for DPO" }), _jsx("li", { children: "\u2713 Data transfer safeguards" })] })), framework === 'CCPA' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2713 Categories of personal information" }), _jsx("li", { children: "\u2713 Right to know and delete" }), _jsx("li", { children: "\u2713 Non-discrimination clause" }), _jsx("li", { children: "\u2713 Contact information for requests" })] })), framework === 'HIPAA' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2713 Protected health information usage" }), _jsx("li", { children: "\u2713 Patient rights section" }), _jsx("li", { children: "\u2713 Security safeguards description" }), _jsx("li", { children: "\u2713 Breach notification procedures" })] }))] })] }, framework)))] }))] })), currentTab === 'deployment' && mode !== 'create' && (_jsxs("div", { className: "config-section", children: [_jsx("h3", { children: "Deployment Configuration" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "environment", children: "Environment" }), _jsxs("select", { id: "environment", value: deploymentConfig.environment, onChange: (e) => setDeploymentConfig(prev => ({
                                            ...prev,
                                            environment: e.target.value
                                        })), disabled: mode === 'view', children: [_jsx("option", { value: "STAGING", children: "Staging" }), _jsx("option", { value: "PRODUCTION", children: "Production" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "rolloutType", children: "Rollout Strategy" }), _jsxs("select", { id: "rolloutType", value: deploymentConfig.rolloutType, onChange: (e) => setDeploymentConfig(prev => ({
                                            ...prev,
                                            rolloutType: e.target.value
                                        })), disabled: mode === 'view', children: [_jsx("option", { value: "IMMEDIATE", children: "Immediate" }), _jsx("option", { value: "PHASED", children: "Phased" }), _jsx("option", { value: "CANARY", children: "Canary" }), _jsx("option", { value: "BLUE_GREEN", children: "Blue-Green" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Deployment Channels" }), _jsx("div", { className: "checkbox-group", children: ['web', 'mobile', 'email', 'api'].map(channel => (_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: deploymentConfig.channels.includes(channel), onChange: (e) => {
                                                        if (e.target.checked) {
                                                            setDeploymentConfig(prev => ({
                                                                ...prev,
                                                                channels: [...prev.channels, channel]
                                                            }));
                                                        }
                                                        else {
                                                            setDeploymentConfig(prev => ({
                                                                ...prev,
                                                                channels: prev.channels.filter(c => c !== channel)
                                                            }));
                                                        }
                                                    }, disabled: mode === 'view' }), channel.toUpperCase()] }, channel))) })] }), _jsxs("div", { className: "notification-settings", children: [_jsx("h4", { children: "Notification Settings" }), _jsx("div", { className: "form-group", children: _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: deploymentConfig.notifications.enabled, onChange: (e) => setDeploymentConfig(prev => ({
                                                        ...prev,
                                                        notifications: { ...prev.notifications, enabled: e.target.checked }
                                                    })), disabled: mode === 'view' }), "Enable Notifications"] }) }), deploymentConfig.notifications.enabled && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Notification Channels" }), _jsx("div", { className: "checkbox-group", children: ['EMAIL', 'SMS', 'IN_APP', 'PUSH'].map(channel => (_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: deploymentConfig.notifications.channels.includes(channel), onChange: (e) => {
                                                                        if (e.target.checked) {
                                                                            setDeploymentConfig(prev => ({
                                                                                ...prev,
                                                                                notifications: {
                                                                                    ...prev.notifications,
                                                                                    channels: [...prev.notifications.channels, channel]
                                                                                }
                                                                            }));
                                                                        }
                                                                        else {
                                                                            setDeploymentConfig(prev => ({
                                                                                ...prev,
                                                                                notifications: {
                                                                                    ...prev.notifications,
                                                                                    channels: prev.notifications.channels.filter(c => c !== channel)
                                                                                }
                                                                            }));
                                                                        }
                                                                    }, disabled: mode === 'view' }), channel] }, channel))) })] }), _jsx("div", { className: "form-group", children: _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: deploymentConfig.notifications.immediate, onChange: (e) => setDeploymentConfig(prev => ({
                                                                ...prev,
                                                                notifications: { ...prev.notifications, immediate: e.target.checked }
                                                            })), disabled: mode === 'view' }), "Send Immediately"] }) }), !deploymentConfig.notifications.immediate && (_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "scheduledDate", children: "Scheduled Date" }), _jsx("input", { type: "datetime-local", id: "scheduledDate", value: deploymentConfig.notifications.scheduled?.toISOString().slice(0, 16) || '', onChange: (e) => setDeploymentConfig(prev => ({
                                                            ...prev,
                                                            notifications: {
                                                                ...prev.notifications,
                                                                scheduled: new Date(e.target.value)
                                                            }
                                                        })), disabled: mode === 'view' })] }))] }))] })] })), currentTab === 'preview' && (_jsxs("div", { className: "config-section", children: [_jsx("h3", { children: "Configuration Preview" }), _jsxs("div", { className: "preview-content", children: [_jsxs("div", { className: "preview-section", children: [_jsx("h4", { children: "Basic Information" }), _jsxs("dl", { children: [_jsx("dt", { children: "Policy Type:" }), _jsx("dd", { children: formData.policyType.replace(/_/g, ' ') }), _jsx("dt", { children: "Title:" }), _jsx("dd", { children: formData.title || 'Not specified' }), _jsx("dt", { children: "Description:" }), _jsx("dd", { children: formData.description || 'Not specified' }), _jsx("dt", { children: "Jurisdiction:" }), _jsx("dd", { children: formData.jurisdiction.join(', ') || 'Not specified' }), _jsx("dt", { children: "Audience:" }), _jsx("dd", { children: formData.audience.join(', ') || 'Not specified' })] })] }), _jsxs("div", { className: "preview-section", children: [_jsx("h4", { children: "Compliance" }), _jsxs("dl", { children: [_jsx("dt", { children: "Frameworks:" }), _jsx("dd", { children: formData.complianceFrameworks.join(', ') || 'None selected' })] })] }), selectedTemplate && (_jsxs("div", { className: "preview-section", children: [_jsx("h4", { children: "Template" }), _jsxs("dl", { children: [_jsx("dt", { children: "Selected Template:" }), _jsx("dd", { children: selectedTemplate.name }), _jsx("dt", { children: "Framework:" }), _jsx("dd", { children: selectedTemplate.framework }), _jsx("dt", { children: "Variables:" }), _jsx("dd", { children: Object.entries(formData.variables).map(([key, value]) => (_jsxs("div", { children: [key, ": ", value] }, key))) })] })] })), formData.customizations.length > 0 && (_jsxs("div", { className: "preview-section", children: [_jsx("h4", { children: "Customizations" }), formData.customizations.map((cust, index) => (_jsxs("div", { className: "customization-preview", children: [_jsx("strong", { children: cust.type }), " - ", cust.target, ": ", cust.value] }, cust.customizationId)))] })), mode !== 'create' && (_jsxs("div", { className: "preview-section", children: [_jsx("h4", { children: "Deployment Configuration" }), _jsxs("dl", { children: [_jsx("dt", { children: "Environment:" }), _jsx("dd", { children: deploymentConfig.environment }), _jsx("dt", { children: "Rollout Strategy:" }), _jsx("dd", { children: deploymentConfig.rolloutType }), _jsx("dt", { children: "Channels:" }), _jsx("dd", { children: deploymentConfig.channels.join(', ') || 'None selected' }), _jsx("dt", { children: "Notifications:" }), _jsx("dd", { children: deploymentConfig.notifications.enabled ? 'Enabled' : 'Disabled' })] })] }))] })] }))] }), _jsxs("div", { className: "policy-config-actions", children: [mode === 'create' && (_jsx("button", { type: "button", onClick: handleCreate, disabled: !isFormValid || isLoading, className: "primary-button", children: isLoading ? 'Creating...' : 'Create Policy' })), mode === 'edit' && (_jsx("button", { type: "button", onClick: handleUpdate, disabled: !isFormValid || isLoading, className: "primary-button", children: isLoading ? 'Updating...' : 'Update Policy' })), mode !== 'create' && currentTab === 'deployment' && (_jsx("button", { type: "button", onClick: handleDeploy, disabled: isLoading || deploymentConfig.channels.length === 0, className: "deploy-button", children: isLoading ? 'Deploying...' : 'Deploy Policy' })), _jsx("button", { type: "button", className: "secondary-button", children: "Cancel" })] })] }));
};
export default PolicyConfigurationInterface;

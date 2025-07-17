import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Extension Configuration Panel - Epic 8.4 Story 8.4.5
 * Configuration interface for individual extensions
 */
import { useState, useEffect } from 'react';
export const ExtensionConfigurationPanel = ({ extension, onSave, onCancel }) => {
    const [config, setConfig] = useState({});
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    // Mock configuration schema - in a real implementation, this would come from the extension
    const configSchema = [
        {
            key: 'enabled',
            label: 'Enable Extension',
            type: 'boolean',
            description: 'Enable or disable this extension',
            defaultValue: true,
            required: true
        },
        {
            key: 'maxConcurrency',
            label: 'Max Concurrent Operations',
            type: 'number',
            description: 'Maximum number of concurrent operations allowed',
            defaultValue: 5,
            validation: (value) => {
                if (value < 1 || value > 20)
                    return 'Must be between 1 and 20';
                return null;
            }
        },
        {
            key: 'logLevel',
            label: 'Log Level',
            type: 'select',
            description: 'Logging verbosity level',
            defaultValue: 'info',
            options: [
                { label: 'Debug', value: 'debug' },
                { label: 'Info', value: 'info' },
                { label: 'Warning', value: 'warning' },
                { label: 'Error', value: 'error' }
            ]
        },
        {
            key: 'customSettings',
            label: 'Custom Settings',
            type: 'json',
            description: 'Custom JSON configuration for advanced users',
            defaultValue: '{}'
        },
        {
            key: 'allowedDomains',
            label: 'Allowed Domains',
            type: 'array',
            description: 'List of domains this extension can access',
            defaultValue: []
        },
        {
            key: 'cacheTimeout',
            label: 'Cache Timeout (seconds)',
            type: 'number',
            description: 'How long to cache results',
            defaultValue: 300,
            validation: (value) => {
                if (value < 0)
                    return 'Must be non-negative';
                return null;
            }
        },
        {
            key: 'enableAnalytics',
            label: 'Enable Analytics',
            type: 'boolean',
            description: 'Allow anonymous usage analytics',
            defaultValue: false
        }
    ];
    // Initialize config with defaults
    useEffect(() => {
        const initialConfig = {};
        configSchema.forEach(field => {
            initialConfig[field.key] = field.defaultValue;
        });
        setConfig(initialConfig);
    }, []);
    const validateField = (field, value) => {
        if (field.required && (value === undefined || value === null || value === '')) {
            return 'This field is required';
        }
        if (field.validation) {
            return field.validation(value);
        }
        // Type-specific validation
        switch (field.type) {
            case 'number':
                if (isNaN(Number(value))) {
                    return 'Must be a valid number';
                }
                break;
            case 'json':
                try {
                    JSON.parse(value);
                }
                catch {
                    return 'Must be valid JSON';
                }
                break;
        }
        return null;
    };
    const handleFieldChange = (fieldKey, value) => {
        const field = configSchema.find(f => f.key === fieldKey);
        if (!field)
            return;
        const newConfig = { ...config, [fieldKey]: value };
        setConfig(newConfig);
        setIsDirty(true);
        // Validate field
        const error = validateField(field, value);
        const newErrors = { ...errors };
        if (error) {
            newErrors[fieldKey] = error;
        }
        else {
            delete newErrors[fieldKey];
        }
        setErrors(newErrors);
    };
    const handleSave = () => {
        // Validate all fields
        const newErrors = {};
        configSchema.forEach(field => {
            const error = validateField(field, config[field.key]);
            if (error) {
                newErrors[field.key] = error;
            }
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSave(config);
    };
    const handleReset = () => {
        const resetConfig = {};
        configSchema.forEach(field => {
            resetConfig[field.key] = field.defaultValue;
        });
        setConfig(resetConfig);
        setErrors({});
        setIsDirty(false);
    };
    const renderField = (field) => {
        const value = config[field.key];
        const error = errors[field.key];
        return (_jsxs("div", { className: `config-field ${error ? 'error' : ''}`, children: [_jsxs("label", { className: "field-label", children: [field.label, field.required && _jsx("span", { className: "required", children: "*" })] }), field.description && (_jsx("p", { className: "field-description", children: field.description })), _jsxs("div", { className: "field-input", children: [field.type === 'boolean' && (_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: value || false, onChange: (e) => handleFieldChange(field.key, e.target.checked) }), _jsx("span", { className: "checkbox-text", children: value ? 'Enabled' : 'Disabled' })] })), field.type === 'string' && (_jsx("input", { type: "text", className: "text-input", value: value || '', onChange: (e) => handleFieldChange(field.key, e.target.value), placeholder: field.label })), field.type === 'number' && (_jsx("input", { type: "number", className: "number-input", value: value || '', onChange: (e) => handleFieldChange(field.key, parseFloat(e.target.value)), placeholder: field.label })), field.type === 'select' && (_jsx("select", { className: "select-input", value: value || '', onChange: (e) => handleFieldChange(field.key, e.target.value), children: field.options?.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) })), field.type === 'json' && (_jsx("textarea", { className: "json-input", value: value || '{}', onChange: (e) => handleFieldChange(field.key, e.target.value), placeholder: "Enter valid JSON", rows: 6 })), field.type === 'array' && (_jsx("div", { className: "array-input", children: _jsx(ArrayInput, { value: value || [], onChange: (newValue) => handleFieldChange(field.key, newValue), placeholder: "Add item..." }) }))] }), error && (_jsxs("div", { className: "field-error", children: [_jsx("span", { className: "error-icon", children: "\u274C" }), _jsx("span", { className: "error-text", children: error })] }))] }, field.key));
    };
    const generalFields = configSchema.filter(f => ['enabled', 'maxConcurrency', 'logLevel', 'cacheTimeout'].includes(f.key));
    const advancedFields = configSchema.filter(f => ['customSettings', 'allowedDomains'].includes(f.key));
    const securityFields = configSchema.filter(f => ['enableAnalytics'].includes(f.key));
    return (_jsx("div", { className: "extension-config-panel-overlay", children: _jsxs("div", { className: "extension-config-panel", children: [_jsxs("div", { className: "config-header", children: [_jsxs("div", { className: "header-left", children: [_jsxs("h2", { children: ["Configure ", extension.name] }), _jsxs("p", { className: "config-subtitle", children: ["v", extension.version, " by ", extension.author] })] }), _jsx("button", { className: "close-btn", onClick: onCancel, children: "\u2715" })] }), _jsxs("div", { className: "config-tabs", children: [_jsx("button", { className: activeTab === 'general' ? 'active' : '', onClick: () => setActiveTab('general'), children: "General" }), _jsx("button", { className: activeTab === 'advanced' ? 'active' : '', onClick: () => setActiveTab('advanced'), children: "Advanced" }), _jsx("button", { className: activeTab === 'security' ? 'active' : '', onClick: () => setActiveTab('security'), children: "Security" })] }), _jsxs("div", { className: "config-content", children: [activeTab === 'general' && (_jsxs("div", { className: "config-section", children: [_jsx("h3", { children: "General Settings" }), _jsx("div", { className: "config-fields", children: generalFields.map(renderField) })] })), activeTab === 'advanced' && (_jsxs("div", { className: "config-section", children: [_jsx("h3", { children: "Advanced Settings" }), _jsxs("div", { className: "config-warning", children: [_jsx("span", { className: "warning-icon", children: "\u26A0\uFE0F" }), _jsx("span", { children: "Advanced settings should only be modified by experienced users." })] }), _jsx("div", { className: "config-fields", children: advancedFields.map(renderField) })] })), activeTab === 'security' && (_jsxs("div", { className: "config-section", children: [_jsx("h3", { children: "Security & Privacy" }), _jsx("div", { className: "config-fields", children: securityFields.map(renderField) }), _jsxs("div", { className: "security-info", children: [_jsx("h4", { children: "Security Information" }), _jsxs("div", { className: "security-item", children: [_jsx("span", { className: "security-label", children: "Sandboxed:" }), _jsx("span", { className: "security-value", children: extension.security?.sandbox?.enabled ? '✅ Yes' : '❌ No' })] }), _jsxs("div", { className: "security-item", children: [_jsx("span", { className: "security-label", children: "Permissions:" }), _jsx("span", { className: "security-value", children: extension.permissions?.join(', ') || 'None' })] })] })] }))] }), _jsxs("div", { className: "config-footer", children: [_jsx("div", { className: "footer-left", children: _jsx("button", { className: "reset-btn", onClick: handleReset, children: "\uD83D\uDD04 Reset to Defaults" }) }), _jsxs("div", { className: "footer-right", children: [_jsx("button", { className: "cancel-btn", onClick: onCancel, children: "Cancel" }), _jsx("button", { className: "save-btn", onClick: handleSave, disabled: Object.keys(errors).length > 0, children: "Save Configuration" })] })] }), isDirty && (_jsxs("div", { className: "dirty-indicator", children: [_jsx("span", { className: "dirty-icon", children: "\u2022" }), _jsx("span", { children: "Unsaved changes" })] }))] }) }));
};
const ArrayInput = ({ value, onChange, placeholder }) => {
    const [newItem, setNewItem] = useState('');
    const addItem = () => {
        if (newItem.trim() && !value.includes(newItem.trim())) {
            onChange([...value, newItem.trim()]);
            setNewItem('');
        }
    };
    const removeItem = (index) => {
        onChange(value.filter((_, i) => i !== index));
    };
    return (_jsxs("div", { className: "array-input-container", children: [_jsx("div", { className: "array-items", children: value.map((item, index) => (_jsxs("div", { className: "array-item", children: [_jsx("span", { className: "item-text", children: item }), _jsx("button", { className: "remove-item-btn", onClick: () => removeItem(index), title: "Remove item", children: "\u2715" })] }, index))) }), _jsxs("div", { className: "array-input-row", children: [_jsx("input", { type: "text", className: "array-text-input", value: newItem, onChange: (e) => setNewItem(e.target.value), placeholder: placeholder, onKeyPress: (e) => e.key === 'Enter' && addItem() }), _jsx("button", { className: "add-item-btn", onClick: addItem, disabled: !newItem.trim(), children: "Add" })] })] }));
};
export default ExtensionConfigurationPanel;

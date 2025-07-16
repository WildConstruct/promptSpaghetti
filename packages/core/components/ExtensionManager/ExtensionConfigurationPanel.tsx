/**
 * Extension Configuration Panel - Epic 8.4 Story 8.4.5
 * Configuration interface for individual extensions
 */

import React, { useState, useEffect } from 'react';
import { ExtensionManifest } from '../../extensions/ExtensionManifest';

export interface ExtensionConfigurationPanelProps {
  extension: ExtensionManifest;
  onSave: (config: Record<string, any>) => void;
  onCancel: () => void;
}

interface ConfigField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'json' | 'array';
  description?: string;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  required?: boolean;
  validation?: (value: any) => string | null;
}

export const ExtensionConfigurationPanel: React.FC<ExtensionConfigurationPanelProps> = ({
  extension,
  onSave,
  onCancel
}) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'advanced' | 'security'>('general');

  // Mock configuration schema - in a real implementation, this would come from the extension
  const configSchema: ConfigField[] = [
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
        if (value < 1 || value > 20) return 'Must be between 1 and 20';
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
        if (value < 0) return 'Must be non-negative';
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
    const initialConfig: Record<string, any> = {};
    configSchema.forEach(field => {
      initialConfig[field.key] = field.defaultValue;
    });
    setConfig(initialConfig);
  }, []);

  const validateField = (field: ConfigField, value: any): string | null => {
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
        } catch {
          return 'Must be valid JSON';
        }
        break;
    }

    return null;
  };

  const handleFieldChange = (fieldKey: string, value: any) => {
    const field = configSchema.find(f => f.key === fieldKey);
    if (!field) return;

    const newConfig = { ...config, [fieldKey]: value };
    setConfig(newConfig);
    setIsDirty(true);

    // Validate field
    const error = validateField(field, value);
    const newErrors = { ...errors };
    if (error) {
      newErrors[fieldKey] = error;
    } else {
      delete newErrors[fieldKey];
    }
    setErrors(newErrors);
  };

  const handleSave = () => {
    // Validate all fields
    const newErrors: Record<string, string> = {};
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
    const resetConfig: Record<string, any> = {};
    configSchema.forEach(field => {
      resetConfig[field.key] = field.defaultValue;
    });
    setConfig(resetConfig);
    setErrors({});
    setIsDirty(false);
  };

  const renderField = (field: ConfigField) => {
    const value = config[field.key];
    const error = errors[field.key];

    return (
      <div key={field.key} className={`config-field ${error ? 'error' : ''}`}>
        <label className="field-label">
          {field.label}
          {field.required && <span className="required">*</span>}
        </label>
        
        {field.description && (
          <p className="field-description">{field.description}</p>
        )}

        <div className="field-input">
          {field.type === 'boolean' && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              />
              <span className="checkbox-text">
                {value ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          )}

          {field.type === 'string' && (
            <input
              type="text"
              className="text-input"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.label}
            />
          )}

          {field.type === 'number' && (
            <input
              type="number"
              className="number-input"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value))}
              placeholder={field.label}
            />
          )}

          {field.type === 'select' && (
            <select
              className="select-input"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
            >
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {field.type === 'json' && (
            <textarea
              className="json-input"
              value={value || '{}'}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder="Enter valid JSON"
              rows={6}
            />
          )}

          {field.type === 'array' && (
            <div className="array-input">
              <ArrayInput
                value={value || []}
                onChange={(newValue) => handleFieldChange(field.key, newValue)}
                placeholder="Add item..."
              />
            </div>
          )}
        </div>

        {error && (
          <div className="field-error">
            <span className="error-icon">❌</span>
            <span className="error-text">{error}</span>
          </div>
        )}
      </div>
    );
  };

  const generalFields = configSchema.filter(f => 
    ['enabled', 'maxConcurrency', 'logLevel', 'cacheTimeout'].includes(f.key)
  );
  
  const advancedFields = configSchema.filter(f => 
    ['customSettings', 'allowedDomains'].includes(f.key)
  );
  
  const securityFields = configSchema.filter(f => 
    ['enableAnalytics'].includes(f.key)
  );

  return (
    <div className="extension-config-panel-overlay">
      <div className="extension-config-panel">
        <div className="config-header">
          <div className="header-left">
            <h2>Configure {extension.name}</h2>
            <p className="config-subtitle">v{extension.version} by {extension.author}</p>
          </div>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <div className="config-tabs">
          <button 
            className={activeTab === 'general' ? 'active' : ''}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            className={activeTab === 'advanced' ? 'active' : ''}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
          <button 
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        <div className="config-content">
          {activeTab === 'general' && (
            <div className="config-section">
              <h3>General Settings</h3>
              <div className="config-fields">
                {generalFields.map(renderField)}
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="config-section">
              <h3>Advanced Settings</h3>
              <div className="config-warning">
                <span className="warning-icon">⚠️</span>
                <span>Advanced settings should only be modified by experienced users.</span>
              </div>
              <div className="config-fields">
                {advancedFields.map(renderField)}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="config-section">
              <h3>Security & Privacy</h3>
              <div className="config-fields">
                {securityFields.map(renderField)}
              </div>
              
              <div className="security-info">
                <h4>Security Information</h4>
                <div className="security-item">
                  <span className="security-label">Sandboxed:</span>
                  <span className="security-value">
                    {extension.security?.sandbox?.enabled ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="security-item">
                  <span className="security-label">Permissions:</span>
                  <span className="security-value">
                    {extension.permissions?.join(', ') || 'None'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="config-footer">
          <div className="footer-left">
            <button className="reset-btn" onClick={handleReset}>
              🔄 Reset to Defaults
            </button>
          </div>
          <div className="footer-right">
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button 
              className="save-btn"
              onClick={handleSave}
              disabled={Object.keys(errors).length > 0}
            >
              Save Configuration
            </button>
          </div>
        </div>

        {isDirty && (
          <div className="dirty-indicator">
            <span className="dirty-icon">•</span>
            <span>Unsaved changes</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Array input component for handling array values
interface ArrayInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

const ArrayInput: React.FC<ArrayInputProps> = ({ value, onChange, placeholder }) => {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim() && !value.includes(newItem.trim())) {
      onChange([...value, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="array-input-container">
      <div className="array-items">
        {value.map((item, index) => (
          <div key={index} className="array-item">
            <span className="item-text">{item}</span>
            <button 
              className="remove-item-btn"
              onClick={() => removeItem(index)}
              title="Remove item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="array-input-row">
        <input
          type="text"
          className="array-text-input"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
        />
        <button 
          className="add-item-btn"
          onClick={addItem}
          disabled={!newItem.trim()}
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default ExtensionConfigurationPanel;
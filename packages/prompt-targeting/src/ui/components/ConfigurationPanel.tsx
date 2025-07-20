/**
 * Configuration panel UI component
 * Epic 10.2.2 - Configuration System UI Components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ConfigurationManager, GlobalConfig, ConfigValidationResult, ConfigurationPreset } from '../../config/ConfigurationManager';

/**
 * Configuration panel props
 */
export interface ConfigurationPanelProps {
  configManager: ConfigurationManager;
  className?: string;
  onConfigChanged?: (config: GlobalConfig) => void;
  onValidationResult?: (result: ConfigValidationResult) => void;
}

/**
 * Configuration section props
 */
interface ConfigSectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

/**
 * Form field props
 */
interface FormFieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type: 'text' | 'number' | 'select' | 'boolean' | 'range';
  options?: { value: any; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  error?: string;
  warning?: string;
  help?: string;
}

/**
 * Main configuration panel component
 */
export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  configManager,
  className = '',
  onConfigChanged,
  onValidationResult
}) => {
  const [config, setConfig] = useState<GlobalConfig>(configManager.getConfig());
  const [validationResult, setValidationResult] = useState<ConfigValidationResult | null>(null);
  const [presets, setPresets] = useState<ConfigurationPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'general' | 'platforms' | 'pipeline' | 'presets'>('general');
  const [isDirty, setIsDirty] = useState(false);

  // Load initial data
  useEffect(() => {
    setPresets(configManager.listPresets());
    
    // Subscribe to config changes
    const handleConfigChanged = () => {
      const newConfig = configManager.getConfig();
      setConfig(newConfig);
      setIsDirty(false);
      onConfigChanged?.(newConfig);
    };

    const handleValidation = (result: ConfigValidationResult) => {
      setValidationResult(result);
      onValidationResult?.(result);
    };

    configManager.on('config:changed', handleConfigChanged);
    configManager.on('config:validated', handleValidation);
    configManager.on('config:preset:applied', handleConfigChanged);

    return () => {
      configManager.off('config:changed', handleConfigChanged);
      configManager.off('config:validated', handleValidation);
      configManager.off('config:preset:applied', handleConfigChanged);
    };
  }, [configManager, onConfigChanged, onValidationResult]);

  // Update configuration value
  const updateConfig = useCallback((path: string, value: any) => {
    const result = configManager.setConfigValue(path, value);
    setIsDirty(true);
    
    if (!result.valid) {
      console.error('Configuration validation failed:', result.errors);
    }
  }, [configManager]);

  // Apply preset
  const applyPreset = useCallback((presetName: string) => {
    if (!presetName) return;
    
    const result = configManager.applyPreset(presetName);
    if (result.valid) {
      setSelectedPreset(presetName);
      setIsDirty(false);
    }
  }, [configManager]);

  // Save current config as preset
  const saveAsPreset = useCallback((name: string, description: string) => {
    configManager.createPreset(name, description, config, ['custom']);
    setPresets(configManager.listPresets());
  }, [configManager, config]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    configManager.resetToDefaults();
    setSelectedPreset('');
  }, [configManager]);

  // Export configuration
  const exportConfig = useCallback((format: 'json' | 'yaml' = 'json') => {
    const exported = configManager.exportConfig(format);
    const blob = new Blob([exported], { type: format === 'json' ? 'application/json' : 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-targeting-config.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [configManager]);

  return (
    <div className={`configuration-panel ${className}`}>
      {/* Header */}
      <div className="config-header">
        <h2>Prompt Targeting Configuration</h2>
        <div className="config-actions">
          <button onClick={() => exportConfig('json')} className="btn-secondary">
            Export JSON
          </button>
          <button onClick={() => exportConfig('yaml')} className="btn-secondary">
            Export YAML
          </button>
          <button onClick={resetToDefaults} className="btn-warning">
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Validation status */}
      {validationResult && (
        <ValidationStatus result={validationResult} />
      )}

      {/* Dirty state indicator */}
      {isDirty && (
        <div className="dirty-indicator">
          <span className="icon">⚠️</span>
          Configuration has unsaved changes
        </div>
      )}

      {/* Tab navigation */}
      <div className="config-tabs">
        <button 
          className={activeTab === 'general' ? 'active' : ''}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={activeTab === 'platforms' ? 'active' : ''}
          onClick={() => setActiveTab('platforms')}
        >
          Platforms
        </button>
        <button 
          className={activeTab === 'pipeline' ? 'active' : ''}
          onClick={() => setActiveTab('pipeline')}
        >
          Pipeline
        </button>
        <button 
          className={activeTab === 'presets' ? 'active' : ''}
          onClick={() => setActiveTab('presets')}
        >
          Presets
        </button>
      </div>

      {/* Tab content */}
      <div className="config-content">
        {activeTab === 'general' && (
          <GeneralConfigSection config={config} onUpdate={updateConfig} />
        )}
        
        {activeTab === 'platforms' && (
          <PlatformConfigSection config={config} onUpdate={updateConfig} />
        )}
        
        {activeTab === 'pipeline' && (
          <PipelineConfigSection config={config} onUpdate={updateConfig} />
        )}
        
        {activeTab === 'presets' && (
          <PresetsSection
            presets={presets}
            selectedPreset={selectedPreset}
            onApplyPreset={applyPreset}
            onSavePreset={saveAsPreset}
            configManager={configManager}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Validation status component
 */
const ValidationStatus: React.FC<{ result: ConfigValidationResult }> = ({ result }) => {
  if (result.valid && result.warnings.length === 0) {
    return (
      <div className="validation-status success">
        <span className="icon">✅</span>
        Configuration is valid
      </div>
    );
  }

  return (
    <div className="validation-status">
      {result.errors.length > 0 && (
        <div className="validation-errors">
          <h4>❌ Errors:</h4>
          <ul>
            {result.errors.map((error, index) => (
              <li key={index}>
                <strong>{error.path}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {result.warnings.length > 0 && (
        <div className="validation-warnings">
          <h4>⚠️ Warnings:</h4>
          <ul>
            {result.warnings.map((warning, index) => (
              <li key={index}>
                <strong>{warning.path}:</strong> {warning.message}
                {warning.suggestion && <em> ({warning.suggestion})</em>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * General configuration section
 */
const GeneralConfigSection: React.FC<{
  config: GlobalConfig;
  onUpdate: (path: string, value: any) => void;
}> = ({ config, onUpdate }) => {
  return (
    <ConfigSection title="General Settings">
      <FormField
        label="Quality Preference"
        value={config.qualityPreference}
        onChange={(value) => onUpdate('qualityPreference', value)}
        type="range"
        min={0}
        max={1}
        step={0.1}
        help="Higher values prioritize quality over creativity"
      />
      
      <FormField
        label="Style Preference"
        value={config.stylePreference}
        onChange={(value) => onUpdate('stylePreference', value)}
        type="select"
        options={[
          { value: 'default', label: 'Default' },
          { value: 'artistic', label: 'Artistic' },
          { value: 'photorealistic', label: 'Photorealistic' },
          { value: 'minimal', label: 'Minimal' }
        ]}
      />
      
      <FormField
        label="Enable Optimizations"
        value={config.enableOptimizations}
        onChange={(value) => onUpdate('enableOptimizations', value)}
        type="boolean"
        help="Apply platform-specific optimizations during translation"
      />
    </ConfigSection>
  );
};

/**
 * Platform configuration section
 */
const PlatformConfigSection: React.FC<{
  config: GlobalConfig;
  onUpdate: (path: string, value: any) => void;
}> = ({ config, onUpdate }) => {
  return (
    <div>
      <ConfigSection title="OpenAI Configuration" collapsible defaultExpanded>
        <FormField
          label="Model"
          value={config.platformOverrides.openai?.model || 'gpt-4'}
          onChange={(value) => onUpdate('platformOverrides.openai.model', value)}
          type="select"
          options={[
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
            { value: 'gpt-3.5-turbo-16k', label: 'GPT-3.5 Turbo 16K' },
            { value: 'gpt-4', label: 'GPT-4' },
            { value: 'gpt-4-32k', label: 'GPT-4 32K' },
            { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }
          ]}
        />
        
        <FormField
          label="Temperature"
          value={config.platformOverrides.openai?.temperature || 0.7}
          onChange={(value) => onUpdate('platformOverrides.openai.temperature', value)}
          type="range"
          min={0}
          max={2}
          step={0.1}
        />
        
        <FormField
          label="Max Tokens"
          value={config.platformOverrides.openai?.maxTokens || 4096}
          onChange={(value) => onUpdate('platformOverrides.openai.maxTokens', value)}
          type="number"
          min={1}
          max={128000}
        />
      </ConfigSection>

      <ConfigSection title="Midjourney Configuration" collapsible>
        <FormField
          label="Version"
          value={config.platformOverrides.midjourney?.version || '6'}
          onChange={(value) => onUpdate('platformOverrides.midjourney.version', value)}
          type="select"
          options={[
            { value: '5', label: 'Version 5' },
            { value: '5.1', label: 'Version 5.1' },
            { value: '5.2', label: 'Version 5.2' },
            { value: '6', label: 'Version 6' }
          ]}
        />
        
        <FormField
          label="Default Quality"
          value={config.platformOverrides.midjourney?.defaultQuality || 1}
          onChange={(value) => onUpdate('platformOverrides.midjourney.defaultQuality', value)}
          type="range"
          min={0.25}
          max={2}
          step={0.25}
        />
        
        <FormField
          label="Default Stylize"
          value={config.platformOverrides.midjourney?.defaultStylize || 100}
          onChange={(value) => onUpdate('platformOverrides.midjourney.defaultStylize', value)}
          type="range"
          min={0}
          max={1000}
          step={50}
        />
      </ConfigSection>
    </div>
  );
};

/**
 * Pipeline configuration section
 */
const PipelineConfigSection: React.FC<{
  config: GlobalConfig;
  onUpdate: (path: string, value: any) => void;
}> = ({ config, onUpdate }) => {
  return (
    <div>
      <ConfigSection title="Pipeline Settings">
        <FormField
          label="Skip Validation"
          value={config.pipeline.skipValidation}
          onChange={(value) => onUpdate('pipeline.skipValidation', value)}
          type="boolean"
          help="Skip validation stage for faster processing"
        />
        
        <FormField
          label="Skip Optimization"
          value={config.pipeline.skipOptimization}
          onChange={(value) => onUpdate('pipeline.skipOptimization', value)}
          type="boolean"
          help="Skip optimization stage for faster processing"
        />
      </ConfigSection>

      <ConfigSection title="Retry Configuration" collapsible>
        <FormField
          label="Max Attempts"
          value={config.pipeline.retries.maxAttempts}
          onChange={(value) => onUpdate('pipeline.retries.maxAttempts', value)}
          type="number"
          min={1}
          max={10}
        />
        
        <FormField
          label="Backoff (ms)"
          value={config.pipeline.retries.backoffMs}
          onChange={(value) => onUpdate('pipeline.retries.backoffMs', value)}
          type="number"
          min={10}
          max={5000}
        />
      </ConfigSection>

      <ConfigSection title="Monitoring" collapsible>
        <FormField
          label="Enable Timing"
          value={config.monitoring.enableTiming}
          onChange={(value) => onUpdate('monitoring.enableTiming', value)}
          type="boolean"
        />
        
        <FormField
          label="Enable Events"
          value={config.monitoring.enableEvents}
          onChange={(value) => onUpdate('monitoring.enableEvents', value)}
          type="boolean"
        />
        
        <FormField
          label="Enable Logging"
          value={config.monitoring.enableLogging}
          onChange={(value) => onUpdate('monitoring.enableLogging', value)}
          type="boolean"
        />
      </ConfigSection>
    </div>
  );
};

/**
 * Presets section
 */
const PresetsSection: React.FC<{
  presets: ConfigurationPreset[];
  selectedPreset: string;
  onApplyPreset: (name: string) => void;
  onSavePreset: (name: string, description: string) => void;
  configManager: ConfigurationManager;
}> = ({ presets, selectedPreset, onApplyPreset, onSavePreset, configManager }) => {
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      onSavePreset(newPresetName.trim(), newPresetDescription.trim());
      setNewPresetName('');
      setNewPresetDescription('');
      setShowCreateForm(false);
    }
  };

  return (
    <ConfigSection title="Configuration Presets">
      <div className="presets-list">
        <h4>Available Presets:</h4>
        <div className="preset-grid">
          {presets.map((preset) => (
            <div 
              key={preset.name}
              className={`preset-card ${selectedPreset === preset.name ? 'selected' : ''} ${preset.isBuiltIn ? 'built-in' : 'custom'}`}
            >
              <h5>{preset.name}</h5>
              <p>{preset.description}</p>
              <div className="preset-tags">
                {preset.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div className="preset-actions">
                <button 
                  onClick={() => onApplyPreset(preset.name)}
                  className="btn-primary"
                >
                  Apply
                </button>
                {!preset.isBuiltIn && (
                  <button 
                    onClick={() => configManager.deletePreset(preset.name)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="create-preset-section">
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-secondary"
        >
          {showCreateForm ? 'Cancel' : 'Save Current as Preset'}
        </button>

        {showCreateForm && (
          <div className="create-preset-form">
            <FormField
              label="Preset Name"
              value={newPresetName}
              onChange={setNewPresetName}
              type="text"
              placeholder="Enter preset name"
            />
            
            <FormField
              label="Description"
              value={newPresetDescription}
              onChange={setNewPresetDescription}
              type="text"
              placeholder="Describe this preset"
            />
            
            <button 
              onClick={handleSavePreset}
              className="btn-primary"
              disabled={!newPresetName.trim()}
            >
              Save Preset
            </button>
          </div>
        )}
      </div>
    </ConfigSection>
  );
};

/**
 * Reusable configuration section component
 */
const ConfigSection: React.FC<ConfigSectionProps> = ({ 
  title, 
  children, 
  collapsible = false, 
  defaultExpanded = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="config-section">
      <div 
        className={`section-header ${collapsible ? 'clickable' : ''}`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <h3>{title}</h3>
        {collapsible && (
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        )}
      </div>
      
      {isExpanded && (
        <div className="section-content">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Reusable form field component
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  type,
  options,
  min,
  max,
  step,
  placeholder,
  error,
  warning,
  help
}) => {
  const renderInput = () => {
    switch (type) {
    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
      
    case 'number':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
        />
      );
      
    case 'range':
      return (
        <div className="range-input">
          <input
            type="range"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
          />
          <span className="range-value">{value}</span>
        </div>
      );
      
    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
      
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      );
    }
  };

  return (
    <div className={`form-field ${error ? 'error' : ''} ${warning ? 'warning' : ''}`}>
      <label>{label}</label>
      {renderInput()}
      {help && <div className="field-help">{help}</div>}
      {error && <div className="field-error">{error}</div>}
      {warning && <div className="field-warning">{warning}</div>}
    </div>
  );
};
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/**
 * Configuration panel UI component
 * Epic 10.2.2 - Configuration System UI Components
 */
import { useState, useEffect, useCallback } from 'react';
/**
 * Main configuration panel component
 */
export const ConfigurationPanel = ({ configManager, className = '', onConfigChanged, onValidationResult }) => {
  const [config, setConfig] = useState(configManager.getConfig());
  const [validationResult, setValidationResult] = useState(null);
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [activeTab, setActiveTab] = useState('general');
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
    const handleValidation = result => {
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
  const updateConfig = useCallback(
    (path, value) => {
      const result = configManager.setConfigValue(path, value);
      setIsDirty(true);
      if (!result.valid) {
        console.error('Configuration validation failed:', result.errors);
      }
    },
    [configManager]
  );
  // Apply preset
  const applyPreset = useCallback(
    presetName => {
      if (!presetName) return;
      const result = configManager.applyPreset(presetName);
      if (result.valid) {
        setSelectedPreset(presetName);
        setIsDirty(false);
      }
    },
    [configManager]
  );
  // Save current config as preset
  const saveAsPreset = useCallback(
    (name, description) => {
      configManager.createPreset(name, description, config, ['custom']);
      setPresets(configManager.listPresets());
    },
    [configManager, config]
  );
  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    configManager.resetToDefaults();
    setSelectedPreset('');
  }, [configManager]);
  // Export configuration
  const exportConfig = useCallback(
    (format = 'json') => {
      const exported = configManager.exportConfig(format);
      const blob = new Blob([exported], { type: format === 'json' ? 'application/json' : 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-targeting-config.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [configManager]
  );
  return _jsxs('div', {
    className: `configuration-panel ${className}`,
    children: [
      _jsxs('div', {
        className: 'config-header',
        children: [
          _jsx('h2', { children: 'Prompt Targeting Configuration' }),
          _jsxs('div', {
            className: 'config-actions',
            children: [
              _jsx('button', {
                onClick: () => exportConfig('json'),
                className: 'btn-secondary',
                children: 'Export JSON',
              }),
              _jsx('button', {
                onClick: () => exportConfig('yaml'),
                className: 'btn-secondary',
                children: 'Export YAML',
              }),
              _jsx('button', { onClick: resetToDefaults, className: 'btn-warning', children: 'Reset to Defaults' }),
            ],
          }),
        ],
      }),
      validationResult && _jsx(ValidationStatus, { result: validationResult }),
      isDirty &&
        _jsxs('div', {
          className: 'dirty-indicator',
          children: [
            _jsx('span', { className: 'icon', children: '\u26A0\uFE0F' }),
            'Configuration has unsaved changes',
          ],
        }),
      _jsxs('div', {
        className: 'config-tabs',
        children: [
          _jsx('button', {
            className: activeTab === 'general' ? 'active' : '',
            onClick: () => setActiveTab('general'),
            children: 'General',
          }),
          _jsx('button', {
            className: activeTab === 'platforms' ? 'active' : '',
            onClick: () => setActiveTab('platforms'),
            children: 'Platforms',
          }),
          _jsx('button', {
            className: activeTab === 'pipeline' ? 'active' : '',
            onClick: () => setActiveTab('pipeline'),
            children: 'Pipeline',
          }),
          _jsx('button', {
            className: activeTab === 'presets' ? 'active' : '',
            onClick: () => setActiveTab('presets'),
            children: 'Presets',
          }),
        ],
      }),
      _jsxs('div', {
        className: 'config-content',
        children: [
          activeTab === 'general' && _jsx(GeneralConfigSection, { config: config, onUpdate: updateConfig }),
          activeTab === 'platforms' && _jsx(PlatformConfigSection, { config: config, onUpdate: updateConfig }),
          activeTab === 'pipeline' && _jsx(PipelineConfigSection, { config: config, onUpdate: updateConfig }),
          activeTab === 'presets' &&
            _jsx(PresetsSection, {
              presets: presets,
              selectedPreset: selectedPreset,
              onApplyPreset: applyPreset,
              onSavePreset: saveAsPreset,
              configManager: configManager,
            }),
        ],
      }),
    ],
  });
};
/**
 * Validation status component
 */
const ValidationStatus = ({ result }) => {
  if (result.valid && result.warnings.length === 0) {
    return _jsxs('div', {
      className: 'validation-status success',
      children: [_jsx('span', { className: 'icon', children: '\u2705' }), 'Configuration is valid'],
    });
  }
  return _jsxs('div', {
    className: 'validation-status',
    children: [
      result.errors.length > 0 &&
        _jsxs('div', {
          className: 'validation-errors',
          children: [
            _jsx('h4', { children: '\u274C Errors:' }),
            _jsx('ul', {
              children: result.errors.map((error, index) =>
                _jsxs('li', { children: [_jsxs('strong', { children: [error.path, ':'] }), ' ', error.message] }, index)
              ),
            }),
          ],
        }),
      result.warnings.length > 0 &&
        _jsxs('div', {
          className: 'validation-warnings',
          children: [
            _jsx('h4', { children: '\u26A0\uFE0F Warnings:' }),
            _jsx('ul', {
              children: result.warnings.map((warning, index) =>
                _jsxs(
                  'li',
                  {
                    children: [
                      _jsxs('strong', { children: [warning.path, ':'] }),
                      ' ',
                      warning.message,
                      warning.suggestion && _jsxs('em', { children: [' (', warning.suggestion, ')'] }),
                    ],
                  },
                  index
                )
              ),
            }),
          ],
        }),
    ],
  });
};
/**
 * General configuration section
 */
const GeneralConfigSection = ({ config, onUpdate }) => {
  return _jsxs(ConfigSection, {
    title: 'General Settings',
    children: [
      _jsx(FormField, {
        label: 'Quality Preference',
        value: config.qualityPreference,
        onChange: value => onUpdate('qualityPreference', value),
        type: 'range',
        min: 0,
        max: 1,
        step: 0.1,
        help: 'Higher values prioritize quality over creativity',
      }),
      _jsx(FormField, {
        label: 'Style Preference',
        value: config.stylePreference,
        onChange: value => onUpdate('stylePreference', value),
        type: 'select',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'artistic', label: 'Artistic' },
          { value: 'photorealistic', label: 'Photorealistic' },
          { value: 'minimal', label: 'Minimal' },
        ],
      }),
      _jsx(FormField, {
        label: 'Enable Optimizations',
        value: config.enableOptimizations,
        onChange: value => onUpdate('enableOptimizations', value),
        type: 'boolean',
        help: 'Apply platform-specific optimizations during translation',
      }),
    ],
  });
};
/**
 * Platform configuration section
 */
const PlatformConfigSection = ({ config, onUpdate }) => {
  return _jsxs('div', {
    children: [
      _jsxs(ConfigSection, {
        title: 'OpenAI Configuration',
        collapsible: true,
        defaultExpanded: true,
        children: [
          _jsx(FormField, {
            label: 'Model',
            value: config.platformOverrides.openai?.model || 'gpt-4',
            onChange: value => onUpdate('platformOverrides.openai.model', value),
            type: 'select',
            options: [
              { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
              { value: 'gpt-3.5-turbo-16k', label: 'GPT-3.5 Turbo 16K' },
              { value: 'gpt-4', label: 'GPT-4' },
              { value: 'gpt-4-32k', label: 'GPT-4 32K' },
              { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
            ],
          }),
          _jsx(FormField, {
            label: 'Temperature',
            value: config.platformOverrides.openai?.temperature || 0.7,
            onChange: value => onUpdate('platformOverrides.openai.temperature', value),
            type: 'range',
            min: 0,
            max: 2,
            step: 0.1,
          }),
          _jsx(FormField, {
            label: 'Max Tokens',
            value: config.platformOverrides.openai?.maxTokens || 4096,
            onChange: value => onUpdate('platformOverrides.openai.maxTokens', value),
            type: 'number',
            min: 1,
            max: 128000,
          }),
        ],
      }),
      _jsxs(ConfigSection, {
        title: 'Midjourney Configuration',
        collapsible: true,
        children: [
          _jsx(FormField, {
            label: 'Version',
            value: config.platformOverrides.midjourney?.version || '6',
            onChange: value => onUpdate('platformOverrides.midjourney.version', value),
            type: 'select',
            options: [
              { value: '5', label: 'Version 5' },
              { value: '5.1', label: 'Version 5.1' },
              { value: '5.2', label: 'Version 5.2' },
              { value: '6', label: 'Version 6' },
            ],
          }),
          _jsx(FormField, {
            label: 'Default Quality',
            value: config.platformOverrides.midjourney?.defaultQuality || 1,
            onChange: value => onUpdate('platformOverrides.midjourney.defaultQuality', value),
            type: 'range',
            min: 0.25,
            max: 2,
            step: 0.25,
          }),
          _jsx(FormField, {
            label: 'Default Stylize',
            value: config.platformOverrides.midjourney?.defaultStylize || 100,
            onChange: value => onUpdate('platformOverrides.midjourney.defaultStylize', value),
            type: 'range',
            min: 0,
            max: 1000,
            step: 50,
          }),
        ],
      }),
    ],
  });
};
/**
 * Pipeline configuration section
 */
const PipelineConfigSection = ({ config, onUpdate }) => {
  return _jsxs('div', {
    children: [
      _jsxs(ConfigSection, {
        title: 'Pipeline Settings',
        children: [
          _jsx(FormField, {
            label: 'Skip Validation',
            value: config.pipeline.skipValidation,
            onChange: value => onUpdate('pipeline.skipValidation', value),
            type: 'boolean',
            help: 'Skip validation stage for faster processing',
          }),
          _jsx(FormField, {
            label: 'Skip Optimization',
            value: config.pipeline.skipOptimization,
            onChange: value => onUpdate('pipeline.skipOptimization', value),
            type: 'boolean',
            help: 'Skip optimization stage for faster processing',
          }),
        ],
      }),
      _jsxs(ConfigSection, {
        title: 'Retry Configuration',
        collapsible: true,
        children: [
          _jsx(FormField, {
            label: 'Max Attempts',
            value: config.pipeline.retries.maxAttempts,
            onChange: value => onUpdate('pipeline.retries.maxAttempts', value),
            type: 'number',
            min: 1,
            max: 10,
          }),
          _jsx(FormField, {
            label: 'Backoff (ms)',
            value: config.pipeline.retries.backoffMs,
            onChange: value => onUpdate('pipeline.retries.backoffMs', value),
            type: 'number',
            min: 10,
            max: 5000,
          }),
        ],
      }),
      _jsxs(ConfigSection, {
        title: 'Monitoring',
        collapsible: true,
        children: [
          _jsx(FormField, {
            label: 'Enable Timing',
            value: config.monitoring.enableTiming,
            onChange: value => onUpdate('monitoring.enableTiming', value),
            type: 'boolean',
          }),
          _jsx(FormField, {
            label: 'Enable Events',
            value: config.monitoring.enableEvents,
            onChange: value => onUpdate('monitoring.enableEvents', value),
            type: 'boolean',
          }),
          _jsx(FormField, {
            label: 'Enable Logging',
            value: config.monitoring.enableLogging,
            onChange: value => onUpdate('monitoring.enableLogging', value),
            type: 'boolean',
          }),
        ],
      }),
    ],
  });
};
/**
 * Presets section
 */
const PresetsSection = ({ presets, selectedPreset, onApplyPreset, onSavePreset, configManager }) => {
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
  return _jsxs(ConfigSection, {
    title: 'Configuration Presets',
    children: [
      _jsxs('div', {
        className: 'presets-list',
        children: [
          _jsx('h4', { children: 'Available Presets:' }),
          _jsx('div', {
            className: 'preset-grid',
            children: presets.map(preset =>
              _jsxs(
                'div',
                {
                  className: `preset-card ${selectedPreset === preset.name ? 'selected' : ''} ${preset.isBuiltIn ? 'built-in' : 'custom'}`,
                  children: [
                    _jsx('h5', { children: preset.name }),
                    _jsx('p', { children: preset.description }),
                    _jsx('div', {
                      className: 'preset-tags',
                      children: preset.tags.map(tag => _jsx('span', { className: 'tag', children: tag }, tag)),
                    }),
                    _jsxs('div', {
                      className: 'preset-actions',
                      children: [
                        _jsx('button', {
                          onClick: () => onApplyPreset(preset.name),
                          className: 'btn-primary',
                          children: 'Apply',
                        }),
                        !preset.isBuiltIn &&
                          _jsx('button', {
                            onClick: () => configManager.deletePreset(preset.name),
                            className: 'btn-danger',
                            children: 'Delete',
                          }),
                      ],
                    }),
                  ],
                },
                preset.name
              )
            ),
          }),
        ],
      }),
      _jsxs('div', {
        className: 'create-preset-section',
        children: [
          _jsx('button', {
            onClick: () => setShowCreateForm(!showCreateForm),
            className: 'btn-secondary',
            children: showCreateForm ? 'Cancel' : 'Save Current as Preset',
          }),
          showCreateForm &&
            _jsxs('div', {
              className: 'create-preset-form',
              children: [
                _jsx(FormField, {
                  label: 'Preset Name',
                  value: newPresetName,
                  onChange: setNewPresetName,
                  type: 'text',
                  placeholder: 'Enter preset name',
                }),
                _jsx(FormField, {
                  label: 'Description',
                  value: newPresetDescription,
                  onChange: setNewPresetDescription,
                  type: 'text',
                  placeholder: 'Describe this preset',
                }),
                _jsx('button', {
                  onClick: handleSavePreset,
                  className: 'btn-primary',
                  disabled: !newPresetName.trim(),
                  children: 'Save Preset',
                }),
              ],
            }),
        ],
      }),
    ],
  });
};
/**
 * Reusable configuration section component
 */
const ConfigSection = ({ title, children, collapsible = false, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  return _jsxs('div', {
    className: 'config-section',
    children: [
      _jsxs('div', {
        className: `section-header ${collapsible ? 'clickable' : ''}`,
        onClick: collapsible ? () => setIsExpanded(!isExpanded) : undefined,
        children: [
          _jsx('h3', { children: title }),
          collapsible && _jsx('span', { className: 'expand-icon', children: isExpanded ? '▼' : '▶' }),
        ],
      }),
      isExpanded && _jsx('div', { className: 'section-content', children: children }),
    ],
  });
};
/**
 * Reusable form field component
 */
const FormField = ({ label, value, onChange, type, options, min, max, step, placeholder, error, warning, help }) => {
  const renderInput = () => {
    switch (type) {
      case 'boolean':
        return _jsx('input', { type: 'checkbox', checked: value, onChange: e => onChange(e.target.checked) });
      case 'number':
        return _jsx('input', {
          type: 'number',
          value: value,
          onChange: e => onChange(Number(e.target.value)),
          min: min,
          max: max,
          step: step,
          placeholder: placeholder,
        });
      case 'range':
        return _jsxs('div', {
          className: 'range-input',
          children: [
            _jsx('input', {
              type: 'range',
              value: value,
              onChange: e => onChange(Number(e.target.value)),
              min: min,
              max: max,
              step: step,
            }),
            _jsx('span', { className: 'range-value', children: value }),
          ],
        });
      case 'select':
        return _jsx('select', {
          value: value,
          onChange: e => onChange(e.target.value),
          children: options?.map(option =>
            _jsx('option', { value: option.value, children: option.label }, option.value)
          ),
        });
      default:
        return _jsx('input', {
          type: 'text',
          value: value,
          onChange: e => onChange(e.target.value),
          placeholder: placeholder,
        });
    }
  };
  return _jsxs('div', {
    className: `form-field ${error ? 'error' : ''} ${warning ? 'warning' : ''}`,
    children: [
      _jsx('label', { children: label }),
      renderInput(),
      help && _jsx('div', { className: 'field-help', children: help }),
      error && _jsx('div', { className: 'field-error', children: error }),
      warning && _jsx('div', { className: 'field-warning', children: warning }),
    ],
  });
};
//# sourceMappingURL=ConfigurationPanel.js.map

/**
 * Configuration management React hook
 * Epic 10.2.2 - Configuration System UI Components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ConfigurationManager, GlobalConfig, ConfigValidationResult, ConfigurationPreset } from '../../config/ConfigurationManager';

/**
 * Configuration hook return type
 */
export interface UseConfigurationReturn {
  config: GlobalConfig;
  isLoading: boolean;
  isDirty: boolean;
  validationResult: ConfigValidationResult | null;
  presets: ConfigurationPreset[];
  
  // Configuration management
  updateConfig: (updates: Partial<GlobalConfig>) => ConfigValidationResult;
  setConfigValue: (path: string, value: unknown) => ConfigValidationResult;
  getConfigValue: (path: string) => unknown;
  resetToDefaults: () => ConfigValidationResult;
  
  // Preset management
  applyPreset: (name: string) => ConfigValidationResult;
  createPreset: (name: string, description: string, tags?: string[]) => void;
  deletePreset: (name: string) => boolean;
  
  // Import/Export
  exportConfig: (format?: 'json' | 'yaml') => string;
  importConfig: (data: string, format?: 'json' | 'yaml') => ConfigValidationResult;
  
  // Utilities
  validateConfig: () => ConfigValidationResult;
  getConfigSummary: () => ReturnType<ConfigurationManager['getConfigSummary']>;
  getConfigHistory: (limit?: number) => ReturnType<ConfigurationManager['getConfigHistory']>;
}

/**
 * Configuration hook options
 */
export interface UseConfigurationOptions {
  /** Auto-save delay in milliseconds */
  autoSaveDelay?: number;
  /** Enable automatic validation */
  autoValidate?: boolean;
  /** Validation debounce delay */
  validationDelay?: number;
  /** Subscribe to external config changes */
  subscribeToChanges?: boolean;
}

/**
 * React hook for configuration management
 */
export function useConfiguration(
  configManager: ConfigurationManager,
  options: UseConfigurationOptions = {}
): UseConfigurationReturn {
  const {
    autoSaveDelay = 1000,
    autoValidate = true,
    validationDelay = 300,
    subscribeToChanges = true,
  } = options;

  // State
  const [config, setConfig] = useState<GlobalConfig>(configManager.getConfig());
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [validationResult, setValidationResult] = useState<ConfigValidationResult | null>(null);
  const [presets, setPresets] = useState<ConfigurationPreset[]>([]);

  // Refs for debouncing
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const validationTimeoutRef = useRef<NodeJS.Timeout>();
  const lastConfigRef = useRef<GlobalConfig>(config);

  // Load presets
  useEffect(() => {
    setPresets(configManager.listPresets());
  }, [configManager]);

  // Subscribe to configuration changes
  useEffect(() => {
    if (!subscribeToChanges) return;

    const handleConfigChange = () => {
      const newConfig = configManager.getConfig();
      setConfig(newConfig);
      lastConfigRef.current = newConfig;
      setIsDirty(false);
    };

    const handleValidation = (result: ConfigValidationResult) => {
      setValidationResult(result);
    };

    const handlePresetApplied = () => {
      setPresets(configManager.listPresets());
      setIsDirty(false);
    };

    configManager.on('config:changed', handleConfigChange);
    configManager.on('config:validated', handleValidation);
    configManager.on('config:preset:applied', handlePresetApplied);

    return () => {
      configManager.off('config:changed', handleConfigChange);
      configManager.off('config:validated', handleValidation);
      configManager.off('config:preset:applied', handlePresetApplied);
    };
  }, [configManager, subscribeToChanges]);

  // Auto-save effect
  useEffect(() => {
    if (!isDirty || !autoSaveDelay) return;

    autoSaveTimeoutRef.current = setTimeout(() => {
      // Only save if config actually changed
      if (JSON.stringify(config) !== JSON.stringify(lastConfigRef.current)) {
        configManager.updateConfig(config, 'Auto-save');
        lastConfigRef.current = config;
        setIsDirty(false);
      }
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [config, isDirty, autoSaveDelay, configManager]);

  // Auto-validation effect
  useEffect(() => {
    if (!autoValidate || !validationDelay) return;

    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(() => {
      const result = configManager.validateConfig(config);
      setValidationResult(result);
    }, validationDelay);

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [config, autoValidate, validationDelay, configManager]);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<GlobalConfig>): ConfigValidationResult => {
    const result = configManager.updateConfig(updates);
    
    if (result.valid) {
      setConfig(configManager.getConfig());
      setIsDirty(false);
    } else {
      // Keep the invalid config in state for editing
      const mergedConfig = { ...config, ...updates };
      setConfig(mergedConfig);
      setIsDirty(true);
    }
    
    return result;
  }, [configManager, config]);

  // Set specific configuration value
  const setConfigValue = useCallback((path: string, value: unknown): ConfigValidationResult => {
    const result = configManager.setConfigValue(path, value);
    
    if (result.valid) {
      setConfig(configManager.getConfig());
      setIsDirty(false);
    } else {
      // Update local state for immediate UI feedback
      const newConfig = structuredClone(config);
      setNestedValue(newConfig, path, value);
      setConfig(newConfig);
      setIsDirty(true);
    }
    
    return result;
  }, [configManager, config]);

  // Get specific configuration value
  const getConfigValue = useCallback((path: string): unknown => {
    return getNestedValue(config, path);
  }, [config]);

  // Reset to defaults
  const resetToDefaults = useCallback((): ConfigValidationResult => {
    const result = configManager.resetToDefaults();
    setConfig(configManager.getConfig());
    setIsDirty(false);
    return result;
  }, [configManager]);

  // Apply preset
  const applyPreset = useCallback((name: string): ConfigValidationResult => {
    const result = configManager.applyPreset(name);
    
    if (result.valid) {
      setConfig(configManager.getConfig());
      setIsDirty(false);
    }
    
    return result;
  }, [configManager]);

  // Create preset
  const createPreset = useCallback((name: string, description: string, tags: string[] = []): void => {
    configManager.createPreset(name, description, config, tags);
    setPresets(configManager.listPresets());
  }, [configManager, config]);

  // Delete preset
  const deletePreset = useCallback((name: string): boolean => {
    const success = configManager.deletePreset(name);
    if (success) {
      setPresets(configManager.listPresets());
    }
    return success;
  }, [configManager]);

  // Export configuration
  const exportConfig = useCallback((format: 'json' | 'yaml' = 'json'): string => {
    return configManager.exportConfig(format);
  }, [configManager]);

  // Import configuration
  const importConfig = useCallback((data: string, format: 'json' | 'yaml' = 'json'): ConfigValidationResult => {
    setIsLoading(true);
    const result = configManager.importConfig(data, format);
    
    if (result.valid) {
      setConfig(configManager.getConfig());
      setIsDirty(false);
    }
    
    setIsLoading(false);
    return result;
  }, [configManager]);

  // Validate current configuration
  const validateConfig = useCallback((): ConfigValidationResult => {
    const result = configManager.validateConfig(config);
    setValidationResult(result);
    return result;
  }, [configManager, config]);

  // Get configuration summary
  const getConfigSummary = useCallback(() => {
    return configManager.getConfigSummary();
  }, [configManager]);

  // Get configuration history
  const getConfigHistory = useCallback((limit?: number) => {
    return configManager.getConfigHistory(limit);
  }, [configManager]);

  return {
    config,
    isLoading,
    isDirty,
    validationResult,
    presets,
    updateConfig,
    setConfigValue,
    getConfigValue,
    resetToDefaults,
    applyPreset,
    createPreset,
    deletePreset,
    exportConfig,
    importConfig,
    validateConfig,
    getConfigSummary,
    getConfigHistory,
  };
}

/**
 * Set nested value in object by path
 */
function setNestedValue(obj: any, path: string, value: unknown): void {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  
  current[parts[parts.length - 1]] = value;
}

/**
 * Get nested value from object by path
 */
function getNestedValue(obj: any, path: string): unknown {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Configuration context for React components
 */
import React, { createContext, useContext } from 'react';

const ConfigurationContext = createContext<{
  configManager: ConfigurationManager;
  configHook: UseConfigurationReturn;
} | null>(null);

/**
 * Configuration provider component
 */
export const ConfigurationProvider: React.FC<{
  configManager: ConfigurationManager;
  options?: UseConfigurationOptions;
  children: React.ReactNode;
}> = ({ configManager, options, children }) => {
  const configHook = useConfiguration(configManager, options);

  return (
    <ConfigurationContext.Provider value={{ configManager, configHook }}>
      {children}
    </ConfigurationContext.Provider>
  );
};

/**
 * Hook to use configuration context
 */
export function useConfigurationContext(): {
  configManager: ConfigurationManager;
  configHook: UseConfigurationReturn;
} {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfigurationContext must be used within a ConfigurationProvider');
  }
  return context;
}

/**
 * Higher-order component for configuration
 */
export function withConfiguration<P extends object>(
  Component: React.ComponentType<P & { configHook: UseConfigurationReturn }>
) {
  return function WithConfigurationComponent(props: P) {
    const { configHook } = useConfigurationContext();
    return <Component {...props} configHook={configHook} />;
  };
}
// packages/core/settings/SettingsManager.ts
// Settings management system for Epic 7.3 Advanced Settings Modal
import { 
  AdvancedSettings,
  AdvancedSettingsSchema,
  SettingsChangeEvent,
  SettingsValidationResult,
  SettingsExport,
  SeedSettings,
  TemperatureSettings,
  RunCountSettings,
  BatchSettings,
  PerformanceSettings,
  UISettings
} from './types';
/**
 * Settings change listener function type
 */
export type SettingsChangeListener = (event: SettingsChangeEvent) => void;
/**
 * LocalStorage key for settings persistence
 */
const SETTINGS_STORAGE_KEY = 'prompt-spaghetti-advanced-settings';
const SETTINGS_VERSION = '1.0.0';
/**
 * Default settings configuration
 */
const DEFAULT_SETTINGS: AdvancedSettings = {
  seed: {,
    enabled: false,
    history: [],
    autoGenerate: true,
  },
  temperature: {,
    enabled: false,
    value: 1.0,
    showIndicator: true,
    presets: [,
      { name: 'Conservative', value: 0.3, description: 'More predictable results' },
      { name: 'Balanced', value: 1.0, description: 'Standard randomness' },
      { name: 'Creative', value: 1.7, description: 'More varied results' }
    ]
  },
  runCount: {,
    value: 5,
    showPerformanceWarning: true,
    presets: [1, 3, 5, 10, 20]
  },
  batch: {,
    batchSize: 5,
    outputFormat: 'individual',
    namingPattern: 'result-{seed}-{timestamp}',
    includeMetadata: true,
    autoDownload: false,
  },
  performance: {,
    showExecutionTimes: false,
    enableCaching: true,
    showMemoryUsage: false,
    logExecutionSteps: false,
  },
  ui: {,
    theme: 'auto',
    showTooltips: true,
    enableKeyboardShortcuts: true,
    reduceAnimations: false,
    highContrast: false,
  },
  version: SETTINGS_VERSION,
};
/**
 * Singleton settings manager class
 */
export class SettingsManager {
  private static instance: SettingsManager;
  private settings: AdvancedSettings;
  private listeners: Set<SettingsChangeListener> = new Set();
  private autoSaveEnabled = true;
  private debounceTimer: NodeJS.Timeout | null = null;
  private constructor() {
    this.settings = this.loadSettings();
    this.setupBeforeUnloadHandler();
  }
  /**
   * Get singleton instance
   */
  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }
  /**
   * Get current settings
   */
  public getSettings(): AdvancedSettings {
    return { ...this.settings };
  }
  /**
   * Get specific setting value
   */
  public getSetting<K extends keyof AdvancedSettings>(key: K): AdvancedSettings[K] {
    return this.settings[key];
  }
  /**
   * Update settings with validation
   */
  public updateSettings()
    newSettings: Partial<AdvancedSettings>,
    source: 'user' | 'system' | 'import' = 'user'
  ): SettingsValidationResult {
    const previousSettings = { ...this.settings };
    const mergedSettings = { ...this.settings, ...newSettings };
    // Validate merged settings
    const validation = this.validateSettings(mergedSettings);
    if (!validation.valid) {
      return validation;
    }
    // Update settings
    this.settings = mergedSettings;
    this.settings.lastModified = new Date().toISOString();
    // Notify listeners of changes
    Object.keys(newSettings).forEach(key => {)
      const typedKey = key as keyof AdvancedSettings;
      if (newSettings[typedKey] !== previousSettings[typedKey]) {
        this.notifyChange({)
          key,
          value: newSettings[typedKey],
          previousValue: previousSettings[typedKey],
          timestamp: new Date(),
          source
        });
      }
    });
    // Auto-save if enabled
    if (this.autoSaveEnabled && source !== 'import') {
      this.debouncedSave();
    }
    return { valid: true, errors: [], warnings: [] };
  }
  /**
   * Update specific setting
   */
  public updateSetting<K extends keyof AdvancedSettings>()
    key: K, 
    value: AdvancedSettings[K], 
    source: 'user' | 'system' | 'import' = 'user'
  ): SettingsValidationResult {
    return this.updateSettings({ [key]: value } as Partial<AdvancedSettings>, source);
  }
  /**
   * Reset settings to defaults
   */
  public resetSettings(): SettingsValidationResult {
    const previousSettings = { ...this.settings };
    this.settings = { ...DEFAULT_SETTINGS };
    this.settings.lastModified = new Date().toISOString();
    // Notify listeners
    Object.keys(DEFAULT_SETTINGS).forEach(key => {)
      const typedKey = key as keyof AdvancedSettings;
      this.notifyChange({)
        key,
        value: DEFAULT_SETTINGS[typedKey],
        previousValue: previousSettings[typedKey],
        timestamp: new Date(),
        source: 'system',
      });
    });
    this.saveSettings();
    return { valid: true, errors: [], warnings: [] };
  }
  /**
   * Add settings change listener
   */
  public addChangeListener(listener: SettingsChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Remove all listeners
   */
  public clearListeners(): void {
    this.listeners.clear();
  }
  /**
   * Save settings to localStorage
   */
  public saveSettings(): boolean {
    try {
      const settingsData = {
        settings: this.settings,
        timestamp: new Date().toISOString(),
        version: SETTINGS_VERSION,
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsData));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }
  /**
   * Load settings from localStorage
   */
  private loadSettings(): AdvancedSettings {
    try {
      const savedData = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!savedData) {
        return { ...DEFAULT_SETTINGS };
      }
      const parsedData = JSON.parse(savedData);
      const loadedSettings = parsedData.settings || parsedData;
      // Validate loaded settings
      const validation = AdvancedSettingsSchema.safeParse(loadedSettings);
      if (!validation.success) {
        console.warn('Invalid settings loaded, using defaults:', validation.error);
        return { ...DEFAULT_SETTINGS };
      }
      // Merge with defaults to handle missing fields from version upgrades
      return { ...DEFAULT_SETTINGS, ...validation.data };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }
  /**
   * Validate settings object
   */
  private validateSettings(settings: unknown): SettingsValidationResult {
    const validation = AdvancedSettingsSchema.safeParse(settings);
    if (validation.success) {
      return { valid: true, errors: [], warnings: [] };
    }
    const errors = validation.error.errors.map(err => ;)
      `${err.path.join('.')}: ${err.message}`}
    );
    return { valid: false, errors, warnings: [] };
  }
  /**
   * Notify change listeners
   */
  private notifyChange(event: SettingsChangeEvent): void {
    this.listeners.forEach(listener => {)
      try {
        listener(event);
      } catch (error) {
        console.error('Settings change listener error:', error);
      }
    });
  }
  /**
   * Debounced save to avoid excessive localStorage writes
   */
  private debouncedSave(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.saveSettings();
      this.debounceTimer = null;
    }, 1000);
  }
  /**
   * Setup beforeunload handler to save settings
   */
  private setupBeforeUnloadHandler(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
          this.saveSettings();
        }
      });
    }
  }
  /**
   * Export settings for backup/sharing
   */
  public exportSettings(): SettingsExport {
    return {
      settings: this.getSettings(),
      metadata: {,
        exportedAt: new Date().toISOString(),
        version: SETTINGS_VERSION,
        appVersion: '1.0.0' // TODO: Get from package.json
      }
    };
  }
  /**
   * Import settings from export
   */
  public importSettings(exportData: SettingsExport): SettingsValidationResult {
    try {
      // Validate export format
      if (!exportData.settings || !exportData.metadata) {
        return { valid: false, errors: ['Invalid export format'], warnings: [] };
      }
      // Check version compatibility
      const warnings: string[] = [];
      if (exportData.metadata.version !== SETTINGS_VERSION) {
        warnings.push(`Settings version mismatch: expected ${SETTINGS_VERSION}, got ${exportData.metadata.version}`);}
      }
      // Import settings
      const result = this.updateSettings(exportData.settings, 'import');
      result.warnings.push(...warnings);
      return result;
    } catch (error) {
      return { 
        valid: false, 
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`], }
        warnings: [] ,
      };
    }
  }
  /**
   * Get settings for executor integration
   */
  public getExecutorSettings() {
    return {
      seed: this.settings.seed.enabled ? this.settings.seed.value : undefined,
      temperature: this.settings.temperature.enabled ? this.settings.temperature.value : undefined,
      runCount: this.settings.runCount.value,
      batchSize: this.settings.batch.batchSize,
      enableCaching: this.settings.performance.enableCaching,
      logExecutionSteps: this.settings.performance.logExecutionSteps,
      showExecutionTimes: this.settings.performance.showExecutionTimes,
      showMemoryUsage: this.settings.performance.showMemoryUsage,
      outputFormat: this.settings.batch.outputFormat,
      includeMetadata: this.settings.batch.includeMetadata,
      autoDownload: this.settings.batch.autoDownload,
      namingPattern: this.settings.batch.namingPattern,
    };
  }
  /**
   * Get UI-specific settings for interface customization
   */
  public getUISettings() {
    return {
      theme: this.settings.ui.theme,
      showTooltips: this.settings.ui.showTooltips,
      enableKeyboardShortcuts: this.settings.ui.enableKeyboardShortcuts,
      reduceAnimations: this.settings.ui.reduceAnimations,
      highContrast: this.settings.ui.highContrast,
    };
  }
  /**
   * Check if performance monitoring is enabled
   */
  public isPerformanceMonitoringEnabled(): boolean {
    return this.settings.performance.showExecutionTimes || 
           this.settings.performance.showMemoryUsage ||
           this.settings.performance.logExecutionSteps;
  }
  /**
   * Get performance monitoring configuration
   */
  public getPerformanceConfig() {
    return {
      monitoring: this.isPerformanceMonitoringEnabled(),
      executionTimes: this.settings.performance.showExecutionTimes,
      memoryUsage: this.settings.performance.showMemoryUsage,
      detailedLogging: this.settings.performance.logExecutionSteps,
      caching: this.settings.performance.enableCaching,
    };
  }
  /**
   * Add seed to history
   */
  public addSeedToHistory(seed: number): void {
    const currentHistory = [...this.settings.seed.history];
    // Remove if already exists
    const existingIndex = currentHistory.indexOf(seed);
    if (existingIndex !== -1) {
      currentHistory.splice(existingIndex, 1);
    }
    // Add to beginning
    currentHistory.unshift(seed);
    // Keep only last 10
    const newHistory = currentHistory.slice(0, 10);
    this.updateSetting('seed', {)
      ...this.settings.seed,
      history: newHistory,
    }, 'system');
  }
  /**
   * Generate random seed
   */
  public generateRandomSeed(): number {
    const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    this.addSeedToHistory(seed);
    return seed;
  }
  /**
   * Enable/disable auto-save
   */
  public setAutoSave(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
  }
}

// Export singleton instance getter
export const getSettingsManager = () => SettingsManager.getInstance();
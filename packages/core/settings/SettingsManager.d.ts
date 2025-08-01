import { AdvancedSettings, SettingsChangeEvent, SettingsValidationResult, SettingsExport } from './types';
/**
 * Settings change listener function type
 */
export type SettingsChangeListener = (event: SettingsChangeEvent) => void;
/**
 * Singleton settings manager class
 */
export declare class SettingsManager { private static instance;
    private settings;
    private listeners;
    private autoSaveEnabled;
    private debounceTimer;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): SettingsManager;
    /**
     * Get current settings
     */
    getSettings(): AdvancedSettings;
    /**
     * Get specific setting value
     */
    getSetting<K extends keyof AdvancedSettings>(key: K): AdvancedSettings[K];
    /**
     * Update settings with validation
     */
    updateSettings();
      newSettings: Partial<AdvancedSettings>
      source?: 'user' | 'system' | 'import'
    ): SettingsValidationResult;
    /**
     * Update specific setting
     */
    updateSetting<K extends keyof AdvancedSettings>(key: K)
      value: AdvancedSettings[K] }
      source?: 'user' | 'system' | 'import'): SettingsValidationResult;
    /**
     * Reset settings to defaults
     */
    resetSettings(): SettingsValidationResult;
    /**
     * Add settings change listener
     */
    addChangeListener(listener: SettingsChangeListener): () => void;
    /**
     * Remove all listeners
     */
    clearListeners(): void;
    /**
     * Save settings to localStorage
     */
    saveSettings(): boolean;
    /**
     * Load settings from localStorage
     */
    private loadSettings;
    /**
     * Validate settings object
     */
    private validateSettings;
    /**
     * Notify change listeners
     */
    private notifyChange;
    /**
     * Debounced save to avoid excessive localStorage writes
     */
    private debouncedSave;
    /**
     * Setup beforeunload handler to save settings
     */
    private setupBeforeUnloadHandler;
    /**
     * Export settings for backup/sharing
     */
    exportSettings(): SettingsExport;
    /**
     * Import settings from export
     */
    importSettings(exportData: SettingsExport): SettingsValidationResult;
    /**
     * Get settings for executor integration
     */
    getExecutorSettings(): { seed: number | undefined;
        temperature: number | undefined;
        runCount: number;
        batchSize: number;
        enableCaching: boolean;
        logExecutionSteps: boolean;
        showExecutionTimes: boolean;
        showMemoryUsage: boolean;
        outputFormat: "json" | "csv" | "individual" | "combined";
        includeMetadata: boolean;
        autoDownload: boolean;
        namingPattern: string };
    /**
     * Get UI-specific settings for interface customization
     */
    getUISettings(): { theme: "auto" | "light" | "dark";
        showTooltips: boolean;
        enableKeyboardShortcuts: boolean;
        reduceAnimations: boolean;
        highContrast: boolean };
    /**
     * Check if performance monitoring is enabled
     */
    isPerformanceMonitoringEnabled(): boolean;
    /**
     * Get performance monitoring configuration
     */
    getPerformanceConfig(): { monitoring: boolean;
        executionTimes: boolean;
        memoryUsage: boolean;
        detailedLogging: boolean;
        caching: boolean };
    /**
     * Add seed to history
     */
    addSeedToHistory(seed: number): void;
    /**
     * Generate random seed
     */
    generateRandomSeed(): number;
    /**
     * Enable/disable auto-save
     */
    setAutoSave(enabled: boolean): void;

export declare //# sourceMappingURL=SettingsManager.d.ts.map
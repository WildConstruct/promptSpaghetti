import { AdvancedSettings, SettingsChangeEvent } from './types';
/**
 * Settings change listener function type
 */
export type SettingsChangeListener = (event: SettingsChangeEvent) => void;
/**
 * Singleton settings manager class
 */
export declare class SettingsManager {
    private static instance;
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
    updateSettings(): any;
}
//# sourceMappingURL=SettingsManager.d.ts.map
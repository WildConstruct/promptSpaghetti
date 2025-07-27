import { RandomizerParameters, ParameterPreset, ValidationResult } from './parameter-schema';
export interface ParameterHistory {
    id: string;
    parameters: RandomizerParameters;
    timestamp: string;
    success: boolean;
    generationTime?: number;
    errorCount?: number;
}
export interface ParameterManagerOptions {
    enableHistory: boolean;
    maxHistorySize: number;
    autoSave: boolean;
    storageKey: string;
}
/**
 * Manages randomizer parameters, presets, and history
 */
export declare class ParameterManager {
    private presets;
    private history;
    private options;
    constructor(options?: Partial<ParameterManagerOptions>);
    /**
     * Load default presets
     */
    private loadDefaultPresets;
    /**
     * Load from localStorage if available
     */
    private loadFromStorage;
    /**
     * Save to localStorage if available
     */
    private saveToStorage;
    /**
     * Validate parameters
     */
    validateParameters(parameters: Partial<RandomizerParameters>): ValidationResult;
    /**
     * Get parameter suggestions
     */
    getSuggestions(parameters: Partial<RandomizerParameters>): {
        nodeCount?: number;
        nodeTypes?: string[];
        temperature?: number;
        focusAreas?: string[];
    };
    /**
     * Create complete parameters with defaults
     */
    createCompleteParameters(partial: Partial<RandomizerParameters>): RandomizerParameters;
    /**
     * Get all presets
     */
    getPresets(): ParameterPreset[];
    /**
     * Get presets by category
     */
    getPresetsByCategory(): Record<string, ParameterPreset[]>;
    /**
     * Get preset by ID
     */
    getPreset(id: string): ParameterPreset | undefined;
    /**
     * Create new preset from parameters
     */
    createPreset(name: string, description: string, category: string, parameters: RandomizerParameters, tags?: string[]): ParameterPreset;
    /**
     * Update existing preset
     */
    updatePreset(id: string, updates: Partial<Omit<ParameterPreset, 'id' | 'createdAt'>>): boolean;
    /**
     * Delete preset
     */
    deletePreset(id: string): boolean;
    /**
     * Get parameter history
     */
    getHistory(): ParameterHistory[];
    /**
     * Add to history
     */
    addToHistory(parameters: RandomizerParameters, success: boolean, generationTime?: number, errorCount?: number): void;
    /**
     * Clear history
     */
    clearHistory(): void;
    /**
     * Get history statistics
     */
    getHistoryStats(): {
        totalGenerations: number;
        successRate: number;
        averageGenerationTime: number;
        mostUsedComplexity: string;
        mostUsedProvider: string;
        popularNodeTypes: Array<{
            nodeType: string;
            count: number;
        }>;
    };
    /**
     * Find similar parameters in history
     */
    findSimilarInHistory(parameters: Partial<RandomizerParameters>): ParameterHistory[];
    /**
     * Export parameters and presets
     */
    exportData(): {
        presets: ParameterPreset[];
        history: ParameterHistory[];
        exported: string;
    };
    /**
     * Import parameters and presets
     */
    importData(data: {
        presets?: ParameterPreset[];
        history?: ParameterHistory[];
    }): {
        presetsImported: number;
        historyImported: number;
        errors: string[];
    };
    /**
     * Generate unique ID
     */
    private generateId;
}
//# sourceMappingURL=parameter-manager.d.ts.map
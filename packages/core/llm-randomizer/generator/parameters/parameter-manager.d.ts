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
export declare class ParameterManager {
    private presets;
    private history;
    private options;
    constructor(options?: Partial<ParameterManagerOptions>);
    private loadDefaultPresets;
    private loadFromStorage;
    private saveToStorage;
    validateParameters(parameters: Partial<RandomizerParameters>): ValidationResult;
    getSuggestions(parameters: Partial<RandomizerParameters>): {
        nodeCount?: number;
        nodeTypes?: string[];
        temperature?: number;
        focusAreas?: string[];
    };
    createCompleteParameters(partial: Partial<RandomizerParameters>): RandomizerParameters;
    getPresets(): ParameterPreset[];
    getPresetsByCategory(): Record<string, ParameterPreset[]>;
    getPreset(id: string): ParameterPreset | undefined;
    createPreset(name: string, description: string, category: string, parameters: RandomizerParameters, tags?: string[]): ParameterPreset;
    updatePreset(id: string, updates: Partial<Omit<ParameterPreset, 'id' | 'createdAt'>>): boolean;
    deletePreset(id: string): boolean;
    getHistory(): ParameterHistory[];
    addToHistory(parameters: RandomizerParameters, success: boolean, generationTime?: number, errorCount?: number): void;
    clearHistory(): void;
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
    findSimilarInHistory(parameters: Partial<RandomizerParameters>): ParameterHistory[];
    exportData(): {
        presets: ParameterPreset[];
        history: ParameterHistory[];
        exported: string;
    };
    importData(data: {
        presets?: ParameterPreset[];
        history?: ParameterHistory[];
    }): {
        presetsImported: number;
        historyImported: number;
        errors: string[];
    };
    private generateId;
}
//# sourceMappingURL=parameter-manager.d.ts.map
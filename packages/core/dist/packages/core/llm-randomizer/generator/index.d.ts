import { z } from 'zod';
import { ParameterManager, ParameterManagerOptions } from './parameters/parameter-manager';
import { RandomizerWorkflow, WorkflowResult } from './workflow/randomizer-workflow';
import { ComplexityLevel, LLMProvider, RandomizerParameters } from './parameters/parameter-schema';
type ComplexityLevelType = z.infer<typeof ComplexityLevel>;
type LLMProviderType = z.infer<typeof LLMProvider>;
export { RandomizerParameters, ParameterPreset, ValidationResult, ComplexityLevel, StylePreference, LLMProvider, NodeTypePreference, RandomizerParametersSchema, ParameterPresetSchema, ValidationResultSchema, ParameterValidator, defaultPresets } from './parameters/parameter-schema';
export { ParameterManager, ParameterHistory, ParameterManagerOptions } from './parameters/parameter-manager';
export { RandomizerWorkflow, WorkflowOptions, WorkflowResult, WorkflowError, WorkflowWarning } from './workflow/randomizer-workflow';
/**
 * Complete randomizer system factory
 */
export declare class RandomizerSystem {
    private parameterManager;
    private workflow;
    constructor(options?: Partial<ParameterManagerOptions>);
    /**
     * Get parameter manager
     */
    getParameterManager(): ParameterManager;
    /**
     * Get workflow
     */
    getWorkflow(): RandomizerWorkflow;
    /**
     * Quick generation with minimal setup
     */
    quickGenerate(purpose: string, complexity?: ComplexityLevelType, provider?: LLMProviderType): Promise<WorkflowResult>;
    /**
     * Generate with preset
     */
    generateWithPreset(presetId: string, overrides?: Partial<RandomizerParameters>): Promise<WorkflowResult>;
    /**
     * Generate multiple variations
     */
    generateVariations(parameters: RandomizerParameters, count?: number): Promise<WorkflowResult[]>;
    /**
     * Get generation history with statistics
     */
    getHistory(): {
        entries: import("./parameters/parameter-manager").ParameterHistory[];
        stats: {
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
    };
    /**
     * Export all data
     */
    exportData(): {
        presets: import("./parameters/parameter-schema").ParameterPreset[];
        history: import("./parameters/parameter-manager").ParameterHistory[];
        exported: string;
    };
    /**
     * Import data
     */
    importData(data: unknown): {
        presetsImported: number;
        historyImported: number;
        errors: string[];
    };
}
//# sourceMappingURL=index.d.ts.map
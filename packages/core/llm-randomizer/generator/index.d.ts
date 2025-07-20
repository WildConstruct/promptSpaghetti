export { RandomizerParameters, ParameterPreset, ValidationResult, ComplexityLevel, StylePreference, LLMProvider, NodeTypePreference, RandomizerParametersSchema, ParameterPresetSchema, ValidationResultSchema, ParameterValidator, defaultPresets } from './parameters/parameter-schema';
export { ParameterManager, ParameterHistory, ParameterManagerOptions } from './parameters/parameter-manager';
export { RandomizerPanel } from './ui/RandomizerPanel';
export { GraphPreview } from './preview/GraphPreview';
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
    quickGenerate(purpose: string, complexity?: ComplexityLevel, provider?: LLMProvider): Promise<WorkflowResult>;
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
        entries: any;
        stats: any;
    };
    /**
     * Export all data
     */
    exportData(): any;
    /**
     * Import data
     */
    importData(data: any): any;
}
//# sourceMappingURL=index.d.ts.map
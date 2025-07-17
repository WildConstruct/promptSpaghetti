export { RandomizerParameters, ParameterPreset, ValidationResult, ComplexityLevel, StylePreference, LLMProvider, NodeTypePreference, RandomizerParametersSchema, ParameterPresetSchema, ValidationResultSchema, ParameterValidator, defaultPresets } from './parameters/parameter-schema';
export { ParameterManager, ParameterHistory, ParameterManagerOptions } from './parameters/parameter-manager';
export { RandomizerPanel } from './ui/RandomizerPanel';
export { GraphPreview } from './preview/GraphPreview';
export { RandomizerWorkflow, WorkflowOptions, WorkflowResult, WorkflowError, WorkflowWarning } from './workflow/randomizer-workflow';
export declare class RandomizerSystem {
    private parameterManager;
    private workflow;
    constructor(options?: Partial<ParameterManagerOptions>);
    getParameterManager(): ParameterManager;
    getWorkflow(): RandomizerWorkflow;
    quickGenerate(purpose: string, complexity?: ComplexityLevel, provider?: LLMProvider): Promise<WorkflowResult>;
    generateWithPreset(presetId: string, overrides?: Partial<RandomizerParameters>): Promise<WorkflowResult>;
    generateVariations(parameters: RandomizerParameters, count?: number): Promise<WorkflowResult[]>;
    getHistory(): {
        entries: any;
        stats: any;
    };
    exportData(): any;
    importData(data: any): any;
}
//# sourceMappingURL=index.d.ts.map
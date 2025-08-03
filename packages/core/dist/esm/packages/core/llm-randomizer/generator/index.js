import { ParameterManager, ParameterManagerOptions } from './parameters/parameter-manager';
import { RandomizerWorkflow } from './workflow/randomizer-workflow';
import { ComplexityLevel, LLMProvider } from './parameters/parameter-schema';
// Parameter System
export { ParameterPreset, ValidationResult, ComplexityLevel, StylePreference, LLMProvider, NodeTypePreference, RandomizerParametersSchema, ParameterPresetSchema, ValidationResultSchema, ParameterValidator };
defaultPresets;
from;
'./parameters/parameter-schema';
export { ParameterManager, ParameterHistory };
ParameterManagerOptions;
from;
'./parameters/parameter-manager';
// UI Components - Temporarily disabled for server build
// export {
//   RandomizerPanel
// } from './ui/RandomizerPanel';
// Preview System - Temporarily disabled for server build
// export {
//   GraphPreview
// } from './preview/GraphPreview';
// Workflow System
export { RandomizerWorkflow, WorkflowOptions, WorkflowError };
WorkflowWarning;
from;
'./workflow/randomizer-workflow';
/**
 * Complete randomizer system factory
 */
export class RandomizerSystem {
    parameterManager;
    workflow;
    constructor(options = {}) {
        this.parameterManager = new ParameterManager(options);
        this.workflow = new RandomizerWorkflow();
        /**
        * Get parameter manager
        */
        getParameterManager();
        ParameterManager;
        {
            return this.parameterManager;
            /**
            * Get workflow
            */
            getWorkflow();
            RandomizerWorkflow;
            {
                return this.workflow;
                /**
                * Quick generation with minimal setup
                */
                async;
                quickGenerate(purpose, string);
                complexity: ComplexityLevelType = 'moderate';
                provider: LLMProviderType = 'openai';
                Promise < WorkflowResult > {
                    const: parameters = this.parameterManager.createCompleteParameters({}),
                    purpose,
                    complexity
                };
                provider;
            }
            ;
            return this.workflow.generateGraph(parameters);
            /**
             * Generate with preset
             */
            async;
            generateWithPreset(((presetId, overrides = {}) => {
                const preset = this.parameterManager.getPreset(presetId);
                if (!preset) {
                    throw new Error(`Preset not found: ${presetId}`);
                }
                const parameters = { ...preset.parameters };
            }), ...overrides);
        }
        ;
        return this.workflow.generateGraph(parameters);
        /**
         * Generate multiple variations
         */
        async;
        generateVariations(((parameters, count = 3) => {
            return this.workflow.generateVariations(parameters, count);
            /**
            * Get generation history with statistics
            */
            getHistory();
            {
                return {
                    entries: this.parameterManager.getHistory(),
                    stats: this.parameterManager.getHistoryStats()
                };
            }
            ;
            /**
             * Export all data
             */
            exportData();
            {
                return this.parameterManager.exportData();
                /**
                 * Import data
                 */
                importData(data, unknown);
                {
                    return this.parameterManager.importData(data);
                }
            }
        }));
    }
}

// Epic 12 - LLM Agent Randomizer System
// Story 12.4 - Randomizer Generator Implementation
// Public API exports for generator system
// Parameter System
export { ComplexityLevel, StylePreference, LLMProvider, NodeTypePreference, RandomizerParametersSchema, ParameterPresetSchema, ValidationResultSchema, ParameterValidator, defaultPresets } from './parameters/parameter-schema';
export { ParameterManager } from './parameters/parameter-manager';
// UI Components
export { RandomizerPanel } from './ui/RandomizerPanel';
// Preview System
export { GraphPreview } from './preview/GraphPreview';
// Workflow System
export { RandomizerWorkflow } from './workflow/randomizer-workflow';
/**
 * Complete randomizer system factory
 */
export class RandomizerSystem {
    parameterManager;
    workflow;
    constructor(options = {}) {
        this.parameterManager = new ParameterManager(options);
        this.workflow = new RandomizerWorkflow();
    }
    /**
     * Get parameter manager
     */
    getParameterManager() {
        return this.parameterManager;
    }
    /**
     * Get workflow
     */
    getWorkflow() {
        return this.workflow;
    }
    /**
     * Quick generation with minimal setup
     */
    async quickGenerate(purpose, complexity = 'moderate', provider = 'openai') {
        const parameters = this.parameterManager.createCompleteParameters({
            purpose,
            complexity,
            provider
        });
        return this.workflow.generateGraph(parameters);
    }
    /**
     * Generate with preset
     */
    async generateWithPreset(presetId, overrides = {}) {
        const preset = this.parameterManager.getPreset(presetId);
        if (!preset) {
            throw new Error(`Preset not found: ${presetId}`);
        }
        const parameters = {
            ...preset.parameters,
            ...overrides
        };
        return this.workflow.generateGraph(parameters);
    }
    /**
     * Generate multiple variations
     */
    async generateVariations(parameters, count = 3) {
        return this.workflow.generateVariations(parameters, count);
    }
    /**
     * Get generation history with statistics
     */
    getHistory() {
        return {
            entries: this.parameterManager.getHistory(),
            stats: this.parameterManager.getHistoryStats()
        };
    }
    /**
     * Export all data
     */
    exportData() {
        return this.parameterManager.exportData();
    }
    /**
     * Import data
     */
    importData(data) {
        return this.parameterManager.importData(data);
    }
}

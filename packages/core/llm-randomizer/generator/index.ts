// Epic 12 - LLM Agent Randomizer System
// Story 12.4 - Randomizer Generator Implementation
// Public API exports for generator system
import { z } from 'zod';
import { ParameterManager, ParameterManagerOptions } from './parameters/parameter-manager';
import { RandomizerWorkflow, WorkflowResult } from './workflow/randomizer-workflow';
import { ComplexityLevel, LLMProvider, RandomizerParameters } from './parameters/parameter-schema';

// Type inference for Zod enums
type ComplexityLevelType = z.infer<typeof ComplexityLevel>;
type LLMProviderType = z.infer<typeof LLMProvider>;

// Parameter System
export {
  RandomizerParameters,
  ParameterPreset,
  ValidationResult,
  ComplexityLevel,
  StylePreference,
  LLMProvider,
  NodeTypePreference,
  RandomizerParametersSchema,
  ParameterPresetSchema,
  ValidationResultSchema,
  ParameterValidator,
  defaultPresets
} from './parameters/parameter-schema';

export {
  ParameterManager,
  ParameterHistory,
  ParameterManagerOptions
} from './parameters/parameter-manager';

// UI Components - Temporarily disabled for server build
// export {
//   RandomizerPanel
// } from './ui/RandomizerPanel';

// Preview System - Temporarily disabled for server build
// export {
//   GraphPreview
// } from './preview/GraphPreview';

// Workflow System
export {
  RandomizerWorkflow,
  WorkflowOptions,
  WorkflowResult,
  WorkflowError,
  WorkflowWarning
} from './workflow/randomizer-workflow';
/**
 * Complete randomizer system factory
 */
export class RandomizerSystem {
  private parameterManager: ParameterManager;
  private workflow: RandomizerWorkflow;
  constructor(options: Partial<ParameterManagerOptions> = {}) {
  this.parameterManager = new ParameterManager(options);
  this.workflow = new RandomizerWorkflow();
  /**
  * Get parameter manager
  */
  getParameterManager(): ParameterManager {,
  return this.parameterManager;
  /**
  * Get workflow
  */
  getWorkflow(): RandomizerWorkflow {,
  return this.workflow;
  /**
  * Quick generation with minimal setup
  */
  async quickGenerate(purpose: string,)
  complexity: ComplexityLevelType = 'moderate',
  provider: LLMProviderType = 'openai'): Promise<WorkflowResult> {,
  const parameters = this.parameterManager.createCompleteParameters({)
  purpose,
  complexity,
  provider
});
    return this.workflow.generateGraph(parameters);
  /**
   * Generate with preset
   */
  async generateWithPreset(()
    presetId: string,
    overrides: Partial<RandomizerParameters> = {}
  ): Promise<WorkflowResult> {
    const preset = this.parameterManager.getPreset(presetId);
    if (!preset) {
      throw new Error(`Preset not found: ${presetId}`);}
    const parameters = {
      ...preset.parameters,
      ...overrides
    };
    return this.workflow.generateGraph(parameters);
  /**
   * Generate multiple variations
   */
  async generateVariations(()
    parameters: RandomizerParameters,
    count: number = 3,
  ): Promise<WorkflowResult> {
  return this.workflow.generateVariations(parameters, count);
  /**
  * Get generation history with statistics
  */
  getHistory() {
  return {
  entries: this.parameterManager.getHistory(),
  stats: this.parameterManager.getHistoryStats(),
};
  /**
   * Export all data
   */
  exportData() {
    return this.parameterManager.exportData();
  /**
   * Import data
   */
  importData(data: unknown) {
    return this.parameterManager.importData(data);
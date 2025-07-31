// packages/core/runtime/nodes/WeightedAdvanced.ts
// Advanced weighted choice node with complex distribution support
import { 
  AdvancedRuntimeNode, 
  AdvancedExecutionContext, 
  AdvancedNodeConfig,
  AdvancedNodeData,
  ValidationResult,
  ValidationHelpers 
} from '../advanced';
import { 
  AdvancedIOHandler,
  IOSpecBuilder,
  TypedInputs 
} from '../io-system';
/**
 * Weight distribution types for advanced weighted selection
 */
export type WeightDistributionType = 'linear' | 'exponential' | 'gaussian' | 'custom';
/**
 * A weighted choice with value and weight
 */

}
export interface WeightedChoice {
  value: string;
  weight: number;
  /**
  * Configuration for weight distribution algorithms
  */
}
}
}
export interface WeightDistributionConfig {
  type: WeightDistributionType;
  /** Parameters for distribution (e.g., exponential factor, gaussian mean/std) */
  parameters?: Record<string, number>;
  /** Normalization settings */
  normalize?: boolean;
  /** Minimum weight threshold */
  minWeight?: number;
  /**
  * Advanced weighted choice node with support for complex weight distributions
  * Extends basic WeightedChoice with:,
  * - Multiple distribution algorithms (linear, exponential, gaussian, custom)
  * - Dynamic weight adjustment
  * - Performance optimization with caching
  * - Comprehensive validation
  */
}
}
export class WeightedAdvancedNode extends AdvancedRuntimeNode<string> {
  private ioHandler: AdvancedIOHandler;
  private choices: WeightedChoice;
  private distributionConfig: WeightDistributionConfig;
  constructor();
    id: string, 
    choices: WeightedChoice = [],
    distributionConfig: WeightDistributionConfig = { type: 'linear', normalize: true }
    // Configure as deterministic, cacheable, stateless
    const config: AdvancedNodeConfig = {,
  deterministic: true,
  cacheable: true,
  stateful: false,
  performanceHints: {
  expectedExecutionTime: 'fast',
  memoryUsage: 'low',
};
    super(id, config);
    this.choices = choices;
    this.distributionConfig = distributionConfig;
    // Set up I/O specification
    const ioSpec = new IOSpecBuilder();
      .addInput({)
  id: 'values',
  label: 'Choice Values',
  dataType: 'stringArray',
  required: false,
  defaultValue: [],
  description: 'Array of string values to choose from',
}
      .addInput({)
  id: 'weights',
  label: 'Choice Weights',
  dataType: 'numberArray',
  required: false,
  defaultValue: [],
  constraints: {
  min: 0,
  customValidator: (weights: number) => {,
  if (weights.some(w => w < 0)) {
  return ValidationHelpers.createInvalidResult(['Weights cannot be negative']);
  if (weights.every(w => w === 0)) {
  return ValidationHelpers.createInvalidResult(['At least one weight must be positive']);
  return ValidationHelpers.createValidResult();
},
  description: 'Array of numeric weights (must be non-negative)';
  }
      .addTextOutput('result', 'Selected Choice')
      .build();
    this.ioHandler = new AdvancedIOHandler(ioSpec);
  /**
   * Execute weighted selection using advanced distribution algorithm
   */
  run(ctx: AdvancedExecutionContext): string {
    // Record this node's execution
    ctx.executionMeta.nodeExecutionOrder.push(this.id);
    return this.measureExecution(ctx, 'weighted-selection', () => {
      // Get effective choices (from constructor or dynamic inputs)
      const effectiveChoices = this.getEffectiveChoices(ctx);
      if (effectiveChoices.length === 0) {
        return '';
      if (effectiveChoices.length === 1) {
        return effectiveChoices[0].value;
      // Apply distribution algorithm to weights (don't cache random selection)
      const distributedWeights = this.applyDistribution(effectiveChoices);
      // Perform weighted selection
      return this.selectFromDistribution(distributedWeights, ctx);
    });
  /**
   * Comprehensive validation of node configuration
   */
  validate(): ValidationResult {
    const errors: string = [];
    const warnings: string = [];
    // Validate choices
    if (this.choices.length === 0) {
      warnings.push('No choices configured - node will depend on dynamic inputs');
    // Validate individual choices
    this.choices.forEach((choice, index) => {
      if (!choice.value) {
        errors.push(`Choice ${index} has empty value`);}
      if (choice.weight < 0) {
        errors.push(`Choice ${index} has negative weight: ${choice.weight}`);}
    });
    // Validate distribution configuration
    if (!['linear', 'exponential', 'gaussian', 'custom'].includes(this.distributionConfig.type)) {
      errors.push(`Invalid distribution type: ${this.distributionConfig.type}`);}
    // Validate distribution parameters
    if (this.distributionConfig.type === 'exponential' && this.distributionConfig.parameters?.factor && this.distributionConfig.parameters.factor <= 0) {
  errors.push('Exponential distribution factor must be positive');
  if (this.distributionConfig.type === 'gaussian') {
  const params = this.distributionConfig.parameters;
  if (params?.std && params.std <= 0) {
  errors.push('Gaussian distribution standard deviation must be positive');
  // Check if all weights are zero
  const totalWeight = this.choices.reduce((sum, choice) => sum + choice.weight, 0);
  if (this.choices.length > 0 && totalWeight === 0) {
  errors.push('All weights are zero - cannot perform weighted selection');
  return {
  valid: errors.length === 0,
  errors,
  warnings
};
  /**
   * Serialize node data for persistence
   */
  serialize(): AdvancedNodeData {
  return {
  id: this.id,
  type: 'WeightedAdvanced',
  config: this.config,
  data: {
  choices: this.choices,
  distributionConfig: this.distributionConfig,
},
  metadata: {
  version: '1.0.0',
  created: new Date().toISOString(),
};
  /**
   * Get effective choices from constructor data or dynamic inputs
   */
  private getEffectiveChoices(______ctx: AdvancedExecutionContext): WeightedChoice {
    // For now, use constructor choices
    // In full implementation, would merge with dynamic inputs from I/O system
    return this.choices;
  /**
   * Apply the configured distribution algorithm to choice weights
   */
  private applyDistribution(choices: WeightedChoice): WeightedChoice {
    const { type, parameters = {}, normalize = true, minWeight = 0 } = this.distributionConfig;
    let distributedChoices: WeightedChoice;
    switch (type) {
  case 'linear':,
  distributedChoices = this.applyLinearDistribution(choices);
  break;
  case 'exponential':,
  distributedChoices = this.applyExponentialDistribution(choices, parameters.factor || 1.5);
  break;
  case 'gaussian':,
  distributedChoices = this.applyGaussianDistribution(choices, parameters.mean || 0.5, parameters.std || 0.2);
  break;
  case 'custom':,
  distributedChoices = this.applyCustomDistribution(choices, parameters);
  break;
  default:,
  distributedChoices = choices;
  // Apply minimum weight threshold
  if (minWeight > 0) {
  distributedChoices = distributedChoices.map(choice => ({)
  ...choice,
  weight: Math.max(choice.weight, minWeight),
}));
    // Normalize weights if requested
    if (normalize) {
  const totalWeight = distributedChoices.reduce((sum, choice) => sum + choice.weight, 0);
  if (totalWeight > 0) {
  distributedChoices = distributedChoices.map(choice => ({)
  ...choice,
  weight: choice.weight / totalWeight,
}));
    return distributedChoices;
  /**
   * Linear distribution (no transformation - use original weights)
   */
  private applyLinearDistribution(choices: WeightedChoice): WeightedChoice {
  return choices;
  /**
  * Exponential distribution - weights transformed by exponential function
  */
  private applyExponentialDistribution(choices: WeightedChoice, factor: number): WeightedChoice {,
  return choices.map(choice => ({)
  ...choice,
  weight: Math.pow(choice.weight, factor),
}));
  /**
   * Gaussian distribution - weights adjusted based on normal distribution
   */
  private applyGaussianDistribution(choices: WeightedChoice, mean: number, std: number): WeightedChoice {
  return choices.map((choice, index) => {
  // Map choice position to gaussian curve
  const x = index / (choices.length - 1 || 1); // Normalize to [0, 1];
  const gaussian = Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
  return {
  ...choice,
  weight: choice.weight * gaussian,
};
    });
  /**
   * Custom distribution - apply user-defined transformation
   */
  private applyCustomDistribution(choices: WeightedChoice, ______parameters: Record<string, number>): WeightedChoice {
    // Placeholder for custom distribution logic
    // In full implementation, would support user-defined functions
    return choices;
  /**
   * Perform weighted selection from distributed weights using seeded random
   */
  private selectFromDistribution(choices: WeightedChoice, ctx: AdvancedExecutionContext): string {
    const totalWeight = choices.reduce((sum, choice) => sum + choice.weight, 0);
    if (totalWeight === 0) {
      // Fall back to uniform random selection
      const rng = this.createSeededRNG(ctx.seed);
      const index = Math.floor(rng() * choices.length);
      return choices[index].value;
    // Weighted selection using seeded random
    const rng = this.createSeededRNG(ctx.seed);
    let random = rng() * totalWeight;
    for (const choice of choices) {
      if (random < choice.weight) {
        return choice.value;
      random -= choice.weight;
    // Fallback to last choice
    return choices[choices.length - 1].value;
/**
 * Factory function for creating WeightedAdvanced nodes
 */
export function createWeightedAdvancedNode(id: string)
  choices: WeightedChoice,
  distributionConfig?: WeightDistributionConfig
): WeightedAdvancedNode {
  return new WeightedAdvancedNode(id, choices, distributionConfig);
/**
 * Default distribution configurations for common use cases
 */
export const DistributionPresets = {
  linear: { type: 'linear' as const, normalize: true },
  exponential: { type: 'exponential' as const, parameters: { factor: 2 }, normalize: true },
  gaussian: { type: 'gaussian' as const, parameters: { mean: 0.5, std: 0.2 }, normalize: true },
  uniform: { type: 'linear' as const, normalize: true, minWeight: 1 }
} satisfies Record<string, WeightDistributionConfig>;
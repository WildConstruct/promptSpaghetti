/**
 * WeightedChoice Framework Node
 * Epic 18 - Implement Node Framework (E18-1753114562067-331CC8)
 * 
 * Framework-integrated WeightedChoice node with enhanced lifecycle and monitoring
 */
import { FrameworkNode, NodeDefinition } from '../NodeFramework';
import { AdvancedNodeConfig, AdvancedExecutionContext } from '../../runtime/advanced';
import { IOPortDefinition } from '../../runtime/io-system';

}
export interface WeightedChoiceData {
  choices: string;
  weights: number;
  normalizeWeights?: boolean;
  seedOverride?: string;
  /**
  * Framework-integrated WeightedChoice node
  */
}
}
export class WeightedChoiceFrameworkNode extends FrameworkNode {
  private data: WeightedChoiceData;
  private normalizedWeights: number = [];
  private totalWeight = 0;
  constructor(id: string, config: AdvancedNodeConfig, data: WeightedChoiceData) {
    super(id, config, data);
    this.data = { normalizeWeights: true, ...data };
  getType(): string {
  return 'WeightedChoice';
  getDefinition(): Partial<NodeDefinition> {,
  return {
  type: 'WeightedChoice',
  displayName: 'Weighted Choice',
  description: 'Randomly selects from a list of choices based on assigned weights',
  category: 'basic',
  version: '2.0.0',
  defaultConfig: {
  deterministic: true,
  cacheable: true,
  stateful: false,
  performanceHints: {
  expectedExecutionTime: 'fast',
  memoryUsage: 'low',
},
  ports: {
  inputs: [,
  {
  id: 'choices',
  label: 'Choices',
  dataType: 'stringArray',
  required: true,
  description: 'Array of choice options',
}
          {
  id: 'weights',
  label: 'Weights',
  dataType: 'numberArray',
  required: false,
  description: 'Relative weights for each choice',
  defaultValue: []] as IOPortDefinition,
  outputs: [,
  {
  id: 'result',
  label: 'Selected Choice',
  dataType: 'string',
  required: true,
  description: 'The randomly selected choice',
}
          {
  id: 'index',
  label: 'Choice Index',
  dataType: 'number',
  required: false,
  description: 'Index of the selected choice'] as IOPortDefinition;
  },
  metadata: {
  author: 'Framework Team',
  tags: ['random', 'choice', 'weighted', 'selection'],
  deprecated: false,
  experimental: false,
};
  protected async onInitialize(): Promise<void> {

  // Validate and normalize the data
  this.validateChoicesAndWeights();
  this.calculateNormalizedWeights();
  // Set up performance monitoring if enabled
  if (this.config.performanceHints?.expectedExecutionTime === 'fast') {
  // Enable lightweight monitoring
  this.framework?.emit('node_performance_hint', {)
  nodeId: this.id,
  hint: 'fast_execution',
});
  protected async executeNode(context: AdvancedExecutionContext): Promise<any> {

  const startTime = performance.now();
  try {
  // Use seeded random if deterministic mode is enabled
  const random = this.config.deterministic ? ;
  context.prng() :,
  Math.random();
  // Perform weighted selection
  const selectedIndex = this.selectWeightedIndex(random);
  const selectedChoice = this.data.choices[selectedIndex];
  // Update internal metrics
  this.updatePerformanceMetrics(performance.now() - startTime);
  return {
  result: selectedChoice,
  index: selectedIndex,
  weight: this.data.weights[selectedIndex] || 1,
  normalizedWeight: this.normalizedWeights[selectedIndex],
  totalWeight: this.totalWeight,
};
    } catch (error) {
      throw new Error(`WeightedChoice execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);}
  protected async onDestroy(): Promise<void> {

    // Clean up any resources
    this.normalizedWeights = [];
    this.totalWeight = 0;
  protected getData(): WeightedChoiceData {
    return { ...this.data };
  /**
   * Update node data (framework-specific method)
   */
  updateData(newData: Partial<WeightedChoiceData>): void {
    this.data = { ...this.data, ...newData };
    // Recalculate normalized weights if choices or weights changed
    if (newData.choices || newData.weights || newData.normalizeWeights !== undefined) {
  this.validateChoicesAndWeights();
  this.calculateNormalizedWeights();
  /**
  * Get current choice statistics
  */
  getChoiceStatistics(): {
  totalChoices: number;
  totalWeight: number;
  averageWeight: number;
  choiceDistribution: Array<{
  choice: string;
  weight: number;
  normalizedWeight: number;
  percentage: number;
}>;
    const choiceDistribution = this.data.choices.map((choice, index) => {
      const weight = this.data.weights[index] || 1;
      const normalizedWeight = this.normalizedWeights[index];
      const percentage = normalizedWeight * 100;
      return {
        choice,
        weight,
        normalizedWeight,
        percentage
      };
    });
    return {
  totalChoices: this.data.choices.length,
  totalWeight: this.totalWeight,
  averageWeight: this.totalWeight / this.data.choices.length,
  choiceDistribution
};
  /**
   * Simulate multiple selections for testing
   */
  simulate(iterations: number, seed?: number): {
  results: Record<string, number>;
  percentages: Record<string, number>;
  expectedVsActual: Array<{
  choice: string;
  expected: number;
  actual: number;
  deviation: number;
}>;
    const results: Record<string, number> = {};
    const random = seed ? this.createSeededRandom(seed) : Math.random;
    // Initialize result counts
    this.data.choices.forEach(choice => {)
  results[choice] = 0;
    });
    // Perform simulations
    for (let i = 0; i < iterations; i++) {
      const selectedIndex = this.selectWeightedIndex(random());
      const selectedChoice = this.data.choices[selectedIndex];
      results[selectedChoice]++;
    // Calculate percentages
    const percentages: Record<string, number> = {};
    Object.entries(results).forEach(([choice, count]) => {
      percentages[choice] = (count / iterations) * 100;
    });
    // Compare expected vs actual
    const expectedVsActual = this.data.choices.map((choice, index) => {
      const expected = this.normalizedWeights[index] * 100;
      const actual = percentages[choice] || 0;
      const deviation = Math.abs(expected - actual);
      return {
        choice,
        expected,
        actual,
        deviation
      };
    });
    return {
      results,
      percentages,
      expectedVsActual
    };
  // Private helper methods
  private validateChoicesAndWeights(): void {
  if (!Array.isArray(this.data.choices) || this.data.choices.length === 0) {
  throw new Error('WeightedChoice requires a non-empty choices array');
  if (this.data.weights) {
  if (!Array.isArray(this.data.weights)) {
  throw new Error('Weights must be an array');
  if (this.data.weights.length !== this.data.choices.length) {
  throw new Error('Weights array must match choices array length');
  if (this.data.weights.some(w => typeof w !== 'number' || w < 0)) {
  throw new Error('All weights must be non-negative numbers');
  private calculateNormalizedWeights(): void {,
  // Use provided weights or default to 1 for each choice
  const weights = this.data.weights || this.data.choices.map(() => 1);
  this.totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (this.totalWeight === 0) {
  throw new Error('Total weight cannot be zero');
  if (this.data.normalizeWeights ?? true) {
  this.normalizedWeights = weights.map(weight => weight / this.totalWeight);
} else {
  this.normalizedWeights = [...weights];
  private selectWeightedIndex(random: number): number {,
  let cumulativeWeight = 0;
  for (let i = 0; i < this.normalizedWeights.length; i++) {
  cumulativeWeight += this.normalizedWeights[i];
  if (random <= cumulativeWeight) {
  return i;
  // Fallback to last index (should not happen with proper normalization)
  return this.data.choices.length - 1;
  private createSeededRandom(seed: number): () => number {,
  // Simple seeded random number generator for simulation
  let state = seed;
  return () => {
  state = (state * 1664525 + 1013904223) % 4294967296;
  return state / 4294967296;
};
  private updatePerformanceMetrics(executionTime: number): void {
  // Update node-specific performance metrics
  const metrics = this.getMetrics();
  metrics.memoryUsage = this.estimateMemoryUsage();
  this.framework?.emit('node_performance_update', {)
  nodeId: this.id,
  nodeType: this.getType(),
  executionTime,
  memoryUsage: metrics.memoryUsage,
});
  private estimateMemoryUsage(): number {
    // Rough estimate of memory usage in bytes
    const choicesMemory = this.data.choices.reduce((sum, choice) => sum + choice.length * 2, 0); // UTF-16;
    const weightsMemory = this.normalizedWeights.length * 8; // 64-bit floats;
    const overhead = 1024; // Object overhead;
    return choicesMemory + weightsMemory + overhead;

export default WeightedChoiceFrameworkNode;
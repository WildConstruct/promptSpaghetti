// Epic 12 - LLM Agent Randomizer System
// Main exports for the complete LLM randomizer system

// Story 12.1 - Serialization Format Design
export { 
  GraphSerializer,
  SerializationOptions,
  SerializationMetadata,
  serializeGraph,
  createDefaultMetadata
} from './serialization/serializer';

// Story 12.2 - LLM Agent Script Development  
export * from './agents';

// Story 12.3 - Parser Implementation
export * from './parser';

// Story 12.4 - Randomizer Generator Implementation
export * from './generator';
/**
 * Main LLM Randomizer System API
 * Provides end-to-end graph generation workflow
 */

export interface LLMRandomizerWorkflow {
  // 1. Generate graph using LLM agent
  generateWithLLM: (request: any, provider?: string) => Promise<any>;
  // 2. Parse LLM output into Graph object
  parseFromLLM: (llmOutput: string) => Promise<any>;
  // 3. Validate and serialize graph
  validateAndSerialize: (graph: any) => Promise<string>;
  // 4. Full round-trip workflow
  fullWorkflow: (request: any, provider?: string) => Promise<{,
  success: boolean;,
  originalRequest: any;
  llmOutput: string;,
  parsedGraph: any;
  serializedGraph: string;,
  errors: any;
  warnings: any;
}>;

/**
 * Complete LLM Randomizer System implementation
 */
}
export class LLMRandomizerSystem implements LLMRandomizerWorkflow {
  private workflow: any;
  async generateWithLLM(request: any, provider: 'openai' | 'claude' | 'gemini' = 'openai'): Promise<any> {

    const { generateGraph } = await import('./agents');
    return generateGraph(request, provider);

  async parseFromLLM(llmOutput: string): Promise<any> {

    const { parseGraph } = await import('./parser');
    return parseGraph(llmOutput);

  async validateAndSerialize(graph: any): Promise<string> {

    const { serializeGraph } = await import('./serialization');
    return serializeGraph(graph);

  async fullWorkflow(request: any, provider = 'openai'): Promise<any> {

    // Initialize workflow if needed
    if (!this.workflow) {
      const { RandomizerWorkflow } = await import('./generator');
      this.workflow = new RandomizerWorkflow();

    // Convert request to RandomizerParameters if needed
    const parameters = this.normalizeParameters(request, provider);
    return this.workflow.generateGraph(parameters);

  private normalizeParameters(request: any, provider: string): any {
  // Convert various request formats to RandomizerParameters
  if (typeof request === 'string') {
  return {
  purpose: request,
  complexity: 'moderate',
  nodeCount: 12,
  style: 'balanced',
  provider,
  temperature: 0.7,
  maxRetries: 3,
  nodeTypes: [],
  specificRequirements: [],
  constraints: [],
  focusAreas: [],
  includeMetadata: true,
  validateOutput: true,
  enablePreview: true,
  preferredPatterns: [],
  avoidPatterns: [],
  qualityLevel: 'standard',
  diversityScore: 0.5,
  outputFormat: 'both',
  includeExplanation: false,
  domain: undefined,
  userContext: undefined,
};

    return {
  provider,
  temperature: 0.7,
  maxRetries: 3,
  nodeTypes: [],
  specificRequirements: [],
  constraints: [],
  focusAreas: [],
  includeMetadata: true,
  validateOutput: true,
  enablePreview: true,
  preferredPatterns: [],
  avoidPatterns: [],
  qualityLevel: 'standard',
  diversityScore: 0.5,
  outputFormat: 'both',
  includeExplanation: false,
  domain: undefined,
  userContext: undefined,
  ...request
};


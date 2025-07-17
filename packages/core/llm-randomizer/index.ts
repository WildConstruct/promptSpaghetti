// Epic 12 - LLM Agent Randomizer System
// Main exports for the complete LLM randomizer system

// Story 12.1 - Serialization Format Design
export * from './serialization';

// Story 12.2 - LLM Agent Script Development  
export * from './agents';

// Story 12.3 - Parser Implementation
export * from './parser';

// Story 12.4 - Randomizer Generator (to be implemented)
// export * from './generator';

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
  fullWorkflow: (request: any, provider?: string) => Promise<{
    success: boolean;
    originalRequest: any;
    llmOutput: string;
    parsedGraph: any;
    serializedGraph: string;
    errors: any[];
    warnings: any[];
  }>;
}

/**
 * Complete LLM Randomizer System implementation
 */
export class LLMRandomizerSystem implements LLMRandomizerWorkflow {
  async generateWithLLM(request: any, provider = 'openai'): Promise<any> {
    // Implementation will be added in Story 12.4
    throw new Error('Not implemented yet - Story 12.4');
  }

  async parseFromLLM(llmOutput: string): Promise<any> {
    // Use parser from Story 12.3
    const { parseGraph } = await import('./parser');
    return parseGraph(llmOutput);
  }

  async validateAndSerialize(graph: any): Promise<string> {
    // Use serializer from Story 12.1
    const { serializeGraph } = await import('./serialization');
    return serializeGraph(graph);
  }

  async fullWorkflow(request: any, provider = 'openai'): Promise<any> {
    // Implementation will be completed in Story 12.4
    throw new Error('Full workflow not implemented yet - Story 12.4');
  }
}
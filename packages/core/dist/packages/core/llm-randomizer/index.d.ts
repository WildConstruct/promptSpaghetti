export { GraphSerializer, SerializationOptions, SerializationMetadata, serializeGraph, createDefaultMetadata } from './serialization/serializer';
export * from './agents';
export * from './parser';
export * from './generator';
/**
 * Main LLM Randomizer System API
 * Provides end-to-end graph generation workflow
 */
export interface LLMRandomizerWorkflow {
    generateWithLLM: (request: any, provider?: string) => Promise<any>;
    parseFromLLM: (llmOutput: string) => Promise<any>;
    validateAndSerialize: (graph: any) => Promise<string>;
    fullWorkflow: (request: any, provider?: string) => Promise<{}, success>;
    boolean: any;
    originalRequest: any;
    llmOutput: string;
    parsedGraph: any;
    serializedGraph: string;
    errors: any;
    warnings: any;
}
export declare class LLMRandomizerSystem implements LLMRandomizerWorkflow {
    private workflow;
    generateWithLLM(request: any, provider?: 'openai' | 'claude' | 'gemini'): Promise<any>;
}
//# sourceMappingURL=index.d.ts.map
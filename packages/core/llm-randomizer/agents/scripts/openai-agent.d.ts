export interface OpenAIAgentConfig {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    seed?: number;
    useJsonMode: boolean;
    maxRetries: number;
    retryTemperatureReduction: number;
}
export interface GraphGenerationRequest {
    purpose: string;
    complexity: 'simple' | 'moderate' | 'complex';
    nodeCount: number;
    nodeTypes: string[];
    specificRequirements?: string[];
    focusAreas?: string[];
    style?: 'creative' | 'logical' | 'balanced';
    domain?: string;
}
export interface GenerationResult {
    success: boolean;
    graph?: string;
    errors?: string[];
    warnings?: string[];
    attempts: number;
    metadata: {
        model: string;
        temperature: number;
        tokenCount: number;
        generationTime: number;
    };
}
export declare class OpenAIGraphAgent {
    private config;
    private baseSystemPrompt;
    constructor(config: OpenAIAgentConfig);
    /**
     * Generate a graph based on the request parameters
     */
    generateGraph(request: GraphGenerationRequest): Promise<GenerationResult>;
    /**
     * Build the system prompt for OpenAI
     */
    private buildSystemPrompt;
    /**
     * Build user prompt based on request
     */
    private buildUserPrompt;
    /**
     * Call OpenAI API with error handling
     */
    private callOpenAI;
    /**
     * Extract graph content from response
     */
    private extractGraphContent;
    /**
     * Generate mock response for development/testing
     */
    private generateMockResponse;
}
/**
 * Default configuration for OpenAI agent
 */
export declare const defaultOpenAIConfig: OpenAIAgentConfig;
/**
 * Utility function to create and use OpenAI agent
 */
export declare function generateGraphWithOpenAI(
  request: GraphGenerationRequest,
  config?: Partial<OpenAIAgentConfig>
): Promise<GenerationResult>;
//# sourceMappingURL=openai-agent.d.ts.map
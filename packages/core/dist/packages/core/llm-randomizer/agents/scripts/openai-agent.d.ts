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
    nodeTypes: string;
    specificRequirements?: string;
    focusAreas?: string;
    style?: 'creative' | 'logical' | 'balanced';
    domain?: string;
}
export interface GenerationResult {
    success: boolean;
    graph?: string;
    errors?: string;
    warnings?: string;
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
     * Call OpenAI API with error handling
     */
    private callOpenAI;
    boolean: any;
    content?: string;
    error?: string;
    tokenCount?: number;
}
//# sourceMappingURL=openai-agent.d.ts.map
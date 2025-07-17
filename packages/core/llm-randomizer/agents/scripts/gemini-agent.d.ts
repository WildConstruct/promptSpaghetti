export interface GeminiAgentConfig {
    apiKey: string;
    model: string;
    temperature: number;
    maxOutputTokens: number;
    maxRetries: number;
    retryTemperatureReduction: number;
    useStructuredOutput: boolean;
    safetySettings?: Array<{
        category: string;
        threshold: string;
    }>;
    stopSequences?: string[];
}
export interface GeminiGenerationRequest {
    purpose: string;
    complexity: 'simple' | 'moderate' | 'complex';
    nodeCount: number;
    nodeTypes: string[];
    specificRequirements?: string[];
    focusAreas?: string[];
    style?: 'creative' | 'logical' | 'balanced';
    domain?: string;
    constraints?: string[];
    examples?: string[];
}
export interface GeminiGenerationResult {
    success: boolean;
    graph?: string;
    errors?: string[];
    warnings?: string[];
    attempts: number;
    safetyRatings?: Array<{
        category: string;
        probability: string;
    }>;
    metadata: {
        model: string;
        temperature: number;
        tokenCount: number;
        generationTime: number;
    };
}
export declare class GeminiGraphAgent {
    private config;
    private basePrompt;
    constructor(config: GeminiAgentConfig);
    generateGraph(request: GeminiGenerationRequest): Promise<GeminiGenerationResult>;
    private buildGeminiPrompt;
    private buildRequestPrompt;
    private extractGraphFromResponse;
    private callGemini;
    private generateGeminiMockResponse;
}
export declare const defaultGeminiConfig: GeminiAgentConfig;
export declare function generateGraphWithGemini(request: GeminiGenerationRequest, config?: Partial<GeminiAgentConfig>): Promise<GeminiGenerationResult>;
//# sourceMappingURL=gemini-agent.d.ts.map
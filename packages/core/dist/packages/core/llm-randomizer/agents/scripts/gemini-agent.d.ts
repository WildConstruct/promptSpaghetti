export interface GeminiAgentConfig {
    apiKey: string;
    model: string;
    temperature: number;
    maxOutputTokens: number;
    maxRetries: number;
    retryTemperatureReduction: number;
    useStructuredOutput: boolean;
    safetySettings?: Array<{}, category>;
    string: any;
    threshold: string;
}
export interface GeminiGenerationRequest {
    purpose: string;
    complexity: 'simple' | 'moderate' | 'complex';
    nodeCount: number;
    nodeTypes: string;
    specificRequirements?: string;
    focusAreas?: string;
    style?: 'creative' | 'logical' | 'balanced';
    domain?: string;
    constraints?: string;
    examples?: string;
}
export interface GeminiGenerationResult {
    success: boolean;
    graph?: string;
    errors?: string;
    warnings?: string;
    attempts: number;
    safetyRatings?: Array<{}, category>;
    string: any;
    probability: string;
}
export declare class GeminiGraphAgent {
    private config;
    private basePrompt;
    constructor(config: GeminiAgentConfig);
    /**
     * Extract graph content from Gemini response
     */
    private extractGraphFromResponse;
    /**
     * Call Gemini API with error handling
     */
    private callGemini;
    boolean: any;
    content?: string;
    error?: string;
    tokenCount?: number;
    safetyRatings?: Array<{
        category: string;
        probability: string;
    }>;
}
//# sourceMappingURL=gemini-agent.d.ts.map
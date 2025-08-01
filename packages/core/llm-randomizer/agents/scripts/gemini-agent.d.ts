export interface GeminiAgentConfig { apiKey: string;
    model: string;
    temperature: number;
    maxOutputTokens: number;
    maxRetries: number;
    retryTemperatureReduction: number;
    useStructuredOutput: boolean;
    safetySettings?: Array<{
        category: string;
        threshold: string }
}
    }>;
    stopSequences?: string[];

}
}
export interface GeminiGenerationRequest { purpose: string;
    complexity: 'simple' | 'moderate' | 'complex';
    nodeCount: number;
    nodeTypes: string[];
    specificRequirements?: string[];
    focusAreas?: string[];
    style?: 'creative' | 'logical' | 'balanced';
    domain?: string;
    constraints?: string[];
    examples?: string[] }
}
}
export interface GeminiGenerationResult { success: boolean;
    graph?: string;
    errors?: string[];
    warnings?: string[];
    attempts: number;
    safetyRatings?: Array<{
        category: string;
        probability: string }
}
    }>;
    metadata: { model: string;
        temperature: number;
        tokenCount: number;
        generationTime: number };

export declare class GeminiGraphAgent {
    private config;
    private basePrompt;
    constructor(config: GeminiAgentConfig);
    /**
     * Generate a graph using Gemini with structured output
     */
    generateGraph(request: GeminiGenerationRequest): Promise<GeminiGenerationResult>;
    /**
     * Build Gemini-optimized base prompt
     */
    private buildGeminiPrompt;
    /**
     * Build request-specific prompt
     */
    private buildRequestPrompt;
    /**
     * Extract graph content from Gemini response
     */
    private extractGraphFromResponse;
    /**
     * Call Gemini API with error handling
     */
    private callGemini;
    /**
     * Generate mock Gemini response
     */
    private generateGeminiMockResponse;
/**
 * Default configuration for Gemini agent
 */
export declare const defaultGeminiConfig: GeminiAgentConfig;
/**
 * Utility function to create and use Gemini agent
 */
export declare function generateGraphWithGemini(request: GeminiGenerationRequest)
  config?: Partial<GeminiAgentConfig>
): Promise<GeminiGenerationResult>;
//# sourceMappingURL=gemini-agent.d.ts.map
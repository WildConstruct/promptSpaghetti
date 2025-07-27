export interface AnthropicAgentConfig {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    maxRetries: number;
    retryTemperatureReduction: number;
    useXmlFormatting: boolean;
    stopSequences?: string[];
}
export interface ClaudeGenerationRequest {
    purpose: string;
    complexity: 'simple' | 'moderate' | 'complex';
    nodeCount: number;
    nodeTypes: string[];
    specificRequirements?: string[];
    focusAreas?: string[];
    style?: 'creative' | 'logical' | 'balanced';
    domain?: string;
    userContext?: string;
}
export interface ClaudeGenerationResult {
    success: boolean;
    graph?: string;
    errors?: string[];
    warnings?: string[];
    attempts: number;
    reasoning?: string;
    metadata: {
        model: string;
        temperature: number;
        tokenCount: number;
        generationTime: number;
    };
}
export declare class AnthropicGraphAgent {
    private config;
    private baseSystemPrompt;
    constructor(config: AnthropicAgentConfig);
    /**
     * Generate a graph using Claude with XML formatting
     */
    generateGraph(request: ClaudeGenerationRequest): Promise<ClaudeGenerationResult>;
    /**
     * Build Claude-optimized system prompt with XML formatting
     */
    private buildClaudeSystemPrompt;
    /**
     * Build Claude-specific user prompt with XML structure
     */
    private buildClaudeUserPrompt;
    /**
     * Parse Claude's XML-formatted response
     */
    private parseClaudeResponse;
    /**
     * Call Anthropic API with error handling
     */
    private callAnthropic;
    /**
     * Generate mock Claude response with reasoning
     */
    private generateClaudeMockResponse;
}
/**
 * Default configuration for Anthropic agent
 */
export declare const defaultAnthropicConfig: AnthropicAgentConfig;
/**
 * Utility function to create and use Anthropic agent
 */
export declare function generateGraphWithClaude(request: ClaudeGenerationRequest, config?: Partial<AnthropicAgentConfig>): Promise<ClaudeGenerationResult>;
//# sourceMappingURL=anthropic-agent.d.ts.map
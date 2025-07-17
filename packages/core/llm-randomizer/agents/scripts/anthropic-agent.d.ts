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
    generateGraph(request: ClaudeGenerationRequest): Promise<ClaudeGenerationResult>;
    private buildClaudeSystemPrompt;
    private buildClaudeUserPrompt;
    private parseClaudeResponse;
    private callAnthropic;
    private generateClaudeMockResponse;
}
export declare const defaultAnthropicConfig: AnthropicAgentConfig;
export declare function generateGraphWithClaude(request: ClaudeGenerationRequest, config?: Partial<AnthropicAgentConfig>): Promise<ClaudeGenerationResult>;
//# sourceMappingURL=anthropic-agent.d.ts.map
export { OpenAIGraphAgent, OpenAIAgentConfig, GraphGenerationRequest, GenerationResult, defaultOpenAIConfig, generateGraphWithOpenAI } from './scripts/openai-agent';
export { AnthropicGraphAgent, AnthropicAgentConfig, ClaudeGenerationRequest, ClaudeGenerationResult, defaultAnthropicConfig, generateGraphWithClaude } from './scripts/anthropic-agent';
export { GeminiGraphAgent, GeminiAgentConfig, GeminiGenerationRequest, GeminiGenerationResult, defaultGeminiConfig, generateGraphWithGemini } from './scripts/gemini-agent';
export { CrossModelTester, CrossModelTestResult, testCases, runCrossModelTests, generateTestReport } from './examples/cross-model-examples';
export type AnyAgentConfig = OpenAIAgentConfig | AnthropicAgentConfig | GeminiAgentConfig;
export type AnyGenerationRequest = GraphGenerationRequest | ClaudeGenerationRequest | GeminiGenerationRequest;
export type AnyGenerationResult = GenerationResult | ClaudeGenerationResult | GeminiGenerationResult;
export interface UniversalAgentRequest {
    purpose: string;
    complexity: 'simple' | 'moderate' | 'complex';
    nodeCount: number;
    nodeTypes?: string[];
    specificRequirements?: string[];
    focusAreas?: string[];
    style?: 'creative' | 'logical' | 'balanced';
    domain?: string;
    userContext?: string;
    constraints?: string[];
    examples?: string[];
}
export declare function generateGraph(request: UniversalAgentRequest, provider?: 'openai' | 'claude' | 'gemini', config?: Partial<AnyAgentConfig>): Promise<AnyGenerationResult>;
//# sourceMappingURL=index.d.ts.map
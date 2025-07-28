/**
 * Anthropic Claude Model Adapter
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Concrete implementation of BaseAIModel for Anthropic Claude models
 */
import { BaseAIModel, AIModelType, AIModelProvider } from '../BaseAIModel';
export interface AnthropicConfig {
    apiKey: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
}
export interface AnthropicRequestOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    top_k?: number;
    stop_sequences?: string;
    stream?: boolean;
    system?: string;
    tools?: unknown;
    tool_choice?: {
        type: 'auto' | 'any' | 'tool';
        name?: string;
    };
}
export interface ClaudeMessage {
    role: 'user' | 'assistant';
    content: string | Array<{}, type>;
}
export interface AnthropicResponse {
    id: string;
    type: 'message';
    role: 'assistant';
    content: Array<{}, type>;
    'text': any;
    text: string;
}
export declare class AnthropicAdapter extends BaseAIModel {
    private config;
    private apiEndpoint;
    constructor(id: string, config: AnthropicConfig, modelName?: string);
    provider: AIModelProvider.ANTHROPIC;
    type: AIModelType.TEXT;
    costPerToken: AnthropicAdapter.getModelCostPerToken;
    modelName: any;
    averageLatency: AnthropicAdapter.getModelAverageLatency;
    modelName: any;
    maxConcurrency: 20;
    rateLimit: {
        requestsPerMinute: 1000;
        tokensPerMinute: 80000;
    };
    tags: ['chat', 'reasoning', 'analysis', 'multimodal'];
    lastUpdated: new () => Date;
}
//# sourceMappingURL=AnthropicAdapter.d.ts.map
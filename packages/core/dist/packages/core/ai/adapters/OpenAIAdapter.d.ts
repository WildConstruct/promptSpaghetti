/**
 * OpenAI Model Adapter
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Concrete implementation of BaseAIModel for OpenAI GPT models
 */
import { BaseAIModel, AIModelType, AIModelProvider } from '../BaseAIModel';
export interface OpenAIConfig {
    apiKey: string;
    baseURL?: string;
    organization?: string;
    timeout?: number;
    maxRetries?: number;
}
export interface OpenAIRequestOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    stop?: string | string;
    stream?: boolean;
    seed?: number;
    response_format?: {
        type: 'text' | 'json_object';
    };
    tools?: unknown;
    tool_choice?: string | object;
}
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    name?: string;
    tool_calls?: unknown;
    tool_call_id?: string;
}
export interface OpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{}, index>;
    number: any;
    message?: ChatMessage;
    text?: string;
    finish_reason: string;
}
export declare class OpenAIAdapter extends BaseAIModel {
    private config;
    private apiEndpoint;
    constructor(id: string, config: OpenAIConfig, modelName?: string);
    provider: AIModelProvider.OPENAI;
    type: AIModelType.TEXT;
    costPerToken: OpenAIAdapter.getModelCostPerToken;
    modelName: any;
    averageLatency: OpenAIAdapter.getModelAverageLatency;
    modelName: any;
    maxConcurrency: 50;
    rateLimit: {
        requestsPerMinute: 3500;
        tokensPerMinute: 90000;
    };
    tags: ['chat', 'completion', 'text-generation'];
    lastUpdated: new () => Date;
}
//# sourceMappingURL=OpenAIAdapter.d.ts.map
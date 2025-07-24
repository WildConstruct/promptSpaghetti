/**
 * OpenAI Model Adapter
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Concrete implementation of BaseAIModel for OpenAI GPT models
 */
import { BaseAIModel, CostEstimate } from '../BaseAIModel';
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
    stop?: string | string[];
    stream?: boolean;
    seed?: number;
    response_format?: {
        type: 'text' | 'json_object';
    };
    tools?: any[];
    tool_choice?: string | object;
}
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    name?: string;
    tool_calls?: any[];
    tool_call_id?: string;
}
export interface OpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message?: ChatMessage;
        text?: string;
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export declare class OpenAIAdapter extends BaseAIModel {
    private config;
    private apiEndpoint;
    constructor(id: string, config: OpenAIConfig, modelName?: string);
    initialize(): Promise<void>;
    process(input: any, options?: OpenAIRequestOptions): Promise<any>;
    cleanup(): Promise<void>;
    estimate(input: any, options?: OpenAIRequestOptions): Promise<CostEstimate>;
    static getModelCostPerToken(modelName: string): number;
    static getModelMaxTokens(modelName: string): number;
    static getModelAverageLatency(modelName: string): number;
    private _testConnection;
    private _makeRequest;
    private _convertToMessages;
    private _extractContent;
    private _estimateTokenCount;
    protected _performHealthCheck(): Promise<void>;
}
export default OpenAIAdapter;
//# sourceMappingURL=OpenAIAdapter.d.ts.map
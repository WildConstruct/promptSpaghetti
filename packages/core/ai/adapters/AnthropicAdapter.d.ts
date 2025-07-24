/**
 * Anthropic Claude Model Adapter
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Concrete implementation of BaseAIModel for Anthropic Claude models
 */
import { BaseAIModel, CostEstimate } from '../BaseAIModel';
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
    stop_sequences?: string[];
    stream?: boolean;
    system?: string;
    tools?: any[];
    tool_choice?: {
        type: 'auto' | 'any' | 'tool';
        name?: string;
    };
}
export interface ClaudeMessage {
    role: 'user' | 'assistant';
    content: string | Array<{
        type: 'text' | 'image';
        text?: string;
        source?: {
            type: 'base64';
            media_type: string;
            data: string;
        };
    }>;
}
export interface AnthropicResponse {
    id: string;
    type: 'message';
    role: 'assistant';
    content: Array<{
        type: 'text';
        text: string;
    }>;
    model: string;
    stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';
    stop_sequence?: string;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}
export declare class AnthropicAdapter extends BaseAIModel {
    private config;
    private apiEndpoint;
    constructor(id: string, config: AnthropicConfig, modelName?: string);
    initialize(): Promise<void>;
    process(input: any, options?: AnthropicRequestOptions): Promise<any>;
    cleanup(): Promise<void>;
    estimate(input: any, options?: AnthropicRequestOptions): Promise<CostEstimate>;
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
export default AnthropicAdapter;
//# sourceMappingURL=AnthropicAdapter.d.ts.map
/**
 * Local Model Adapter
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Adapter for locally hosted AI models (Ollama, local inference servers)
 */
import { BaseAIModel, AIModelType, AIModelProvider } from '../BaseAIModel';
export interface LocalModelConfig {
    endpoint: string;
    modelName: string;
    timeout?: number;
    maxRetries?: number;
    warmupOnInit?: boolean;
    modelType?: 'ollama' | 'huggingface' | 'custom';
    authToken?: string;
}
export interface LocalRequestOptions {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    top_k?: number;
    stop?: string;
    stream?: boolean;
    seed?: number;
    repeat_penalty?: number;
    context_length?: number;
    system_prompt?: string;
}
export interface OllamaMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface LocalModelResponse {
    model: string;
    created_at: string;
    message?: {
        role: string;
        content: string;
    };
    response?: string;
    done: boolean;
    context?: number;
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
}
export declare class LocalModelAdapter extends BaseAIModel {
    private config;
    private modelInfo;
    constructor(id: string, config: LocalModelConfig);
    provider: AIModelProvider.LOCAL;
    type: AIModelType.TEXT;
    costPerToken: 0;
    averageLatency: 2000;
    maxConcurrency: 5;
    rateLimit: {
        requestsPerMinute: 60;
        tokensPerMinute: 50000;
    };
    tags: ['local', 'open-source', config.modelType];
}
//# sourceMappingURL=LocalModelAdapter.d.ts.map
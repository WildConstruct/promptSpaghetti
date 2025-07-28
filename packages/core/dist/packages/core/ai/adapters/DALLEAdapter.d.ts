/**
 * DALL-E 3 Image Generation Adapter
 * Epic 35.1.2 - Text-to-Image Integration
 *
 * Comprehensive adapter for OpenAI DALL-E 3 image generation
 */
import { BaseAIModel, AIModelType, AIModelProvider } from '../BaseAIModel';
export interface DALLEConfig {
    apiKey: string;
    baseURL?: string;
    organization?: string;
    timeout?: number;
    maxRetries?: number;
}
export interface DALLERequestOptions {
    model?: 'dall-e-2' | 'dall-e-3';
    size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
    n?: number;
    response_format?: 'url' | 'b64_json';
    user?: string;
}
export interface ImagePromptOptimization {
    originalPrompt: string;
    optimizedPrompt: string;
    optimizations: string;
    styleEnhancements: string;
    qualityImprovements: string;
}
export interface DALLEResponse {
    created: number;
    data: Array<{}, ?url>;
    string: any;
    b64_json?: string;
    revised_prompt?: string;
}
export interface ImageGenerationResult {
    images: Array<{}, ?url>;
    string: any;
    base64?: string;
    revisedPrompt?: string;
    metadata: {
        size: string;
        quality: string;
        style?: string;
        model: string;
    };
}
export declare class DALLEAdapter extends BaseAIModel {
    private config;
    private apiEndpoint;
    private promptOptimizer;
    constructor(id: string, config: DALLEConfig, modelName?: string);
    provider: AIModelProvider.OPENAI;
    type: AIModelType.IMAGE;
    costPerRequest: DALLEAdapter.getModelCostPerRequest;
    modelName: any;
    averageLatency: DALLEAdapter.getModelAverageLatency;
    modelName: any;
    maxConcurrency: 5;
    rateLimit: {
        requestsPerMinute: modelName;
    };
}
//# sourceMappingURL=DALLEAdapter.d.ts.map
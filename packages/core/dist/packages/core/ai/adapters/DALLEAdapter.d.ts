/**
 * DALL-E 3 Image Generation Adapter
 * Epic 35.1.2 - Text-to-Image Integration
 *
 * Comprehensive adapter for OpenAI DALL-E 3 image generation
 */
import { BaseAIModel, CostEstimate } from '../BaseAIModel';
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
    optimizations: string[];
    styleEnhancements: string[];
    qualityImprovements: string[];
}
export interface DALLEResponse {
    created: number;
    data: Array<{
        url?: string;
        b64_json?: string;
        revised_prompt?: string;
    }>;
}
export interface ImageGenerationResult {
    images: Array<{
        url?: string;
        base64?: string;
        revisedPrompt?: string;
        metadata: {
            size: string;
            quality: string;
            style?: string;
            model: string;
        };
    }>;
    originalPrompt: string;
    optimizedPrompt?: string;
    usage: {
        promptTokens: number;
        totalCost: number;
    };
    generationTime: number;
}
export declare class DALLEAdapter extends BaseAIModel {
    private config;
    private apiEndpoint;
    private promptOptimizer;
    constructor(id: string, config: DALLEConfig, modelName?: string);
    initialize(): Promise<void>;
    process(input: unknown, options?: DALLERequestOptions): Promise<ImageGenerationResult>;
    cleanup(): Promise<void>;
    estimate(input: unknown, options?: DALLERequestOptions): Promise<CostEstimate>;
    generateVariations(imageUrl: string, options?: Partial<DALLERequestOptions>): Promise<ImageGenerationResult>;
    editImage(
      imageUrl: string,
      maskUrl: string,
      prompt: string,
      options?: Partial<DALLERequestOptions>
    ): Promise<ImageGenerationResult>;
    static getModelCostPerRequest(modelName: string): number;
    static getModelAverageLatency(modelName: string): number;
    private _testConnection;
    private _makeRequest;
    private _extractPrompt;
    private _validateParameters;
    private _processImageResponse;
    protected _performHealthCheck(): Promise<void>;
}
export default DALLEAdapter;
//# sourceMappingURL=DALLEAdapter.d.ts.map
/**
 * Stable Diffusion Image Generation Adapter
 * Epic 35.1.2 - Text-to-Image Integration
 *
 * Adapter for Stable Diffusion models (local and hosted)
 */
import { BaseAIModel, CostEstimate } from '../BaseAIModel';

}
export interface StableDiffusionConfig {
    endpoint: string;
    apiType: 'automatic1111' | 'comfyui' | 'stability-ai' | 'replicate' | 'custom';
    apiKey?: string;
    timeout?: number;
    maxRetries?: number;
    defaultModel?: string;

}
export interface StableDiffusionRequestOptions {
    prompt: string;
    negative_prompt?: string;
    sampler_name?: string;
    scheduler?: string;
    steps?: number;
    cfg_scale?: number;
    seed?: number;
    width?: number;
    height?: number;
    batch_size?: number;
    n_iter?: number;
    model?: string;
    style_preset?: string;
    denoising_strength?: number;
    init_image?: string;
    mask?: string;
    inpaint_full_res?: boolean;
    lora_models?: Array<{
        name: string;
        strength: number;
}
    }>;
    controlnet?: Array<{
        model: string;
        image: string;
        strength: number;
        guidance_start?: number;
        guidance_end?: number;
    }>;
    restore_faces?: boolean;
    tiling?: boolean;
    enable_hr?: boolean;
    hr_scale?: number;
    hr_upscaler?: string;
    hr_second_pass_steps?: number;
    hr_resize_x?: number;
    hr_resize_y?: number;

}
export interface StableDiffusionResponse {
    images: string[];
    parameters: Record<string, any>;
    info: string;

}
export interface StableDiffusionGenerationResult {
    images: Array<{
        base64: string;
        url?: string;
        seed: number;
        metadata: {
            model: string;
            sampler: string;
            steps: number;
            cfg_scale: number;
            size: string;
}
        };
    }>;
    originalPrompt: string;
    negativePrompt?: string;
    parameters: Record<string, any>;
    generationTime: number;
    usage: {
        computeUnits: number;
        estimatedCost: number;
    };

}
export interface ModelInfo {
    name: string;
    filename: string;
    type: 'checkpoint' | 'lora' | 'controlnet' | 'embedding' | 'vae';
    size?: number;
    description?: string;
    tags?: string[];

export declare class StableDiffusionAdapter extends BaseAIModel {
    private config;
    private availableModels;
    private availableSamplers;
    constructor(id: string, config: StableDiffusionConfig);
    initialize(): Promise<void>;
    process(input: any, options?: StableDiffusionRequestOptions): Promise<StableDiffusionGenerationResult>;
    cleanup(): Promise<void>;
    estimate(input: any, options?: StableDiffusionRequestOptions): Promise<CostEstimate>;
    getAvailableModels(): Promise<ModelInfo[]>;
    getAvailableSamplers(): Promise<string[]>;
    switchModel(modelName: string): Promise<void>;
    img2img(initImage: string, prompt: string, options?: Partial<StableDiffusionRequestOptions>): Promise<StableDiffusionGenerationResult>;
    inpaint(initImage: string, mask: string, prompt: string, options?: Partial<StableDiffusionRequestOptions>): Promise<StableDiffusionGenerationResult>;
    upscale(image: string, upscaler?: string, scale?: number): Promise<StableDiffusionGenerationResult>;
    static getEstimatedCost(apiType: string): number;
    static getEstimatedLatency(apiType: string): number;
    private _testConnection;
    private _buildHeaders;
    private _makeRequest;
    private _loadAvailableModels;
    private _loadAvailableSamplers;
    private _extractPrompt;
    private _processOptions;
    private _generateImages;
    private _buildAutomatic1111Payload;
    private _buildStabilityAIPayload;
    private _buildGenericPayload;
    private _processGenerationResponse;
    private _extractSeedFromResponse;
    protected _performHealthCheck(): Promise<void>;

export default StableDiffusionAdapter;
//# sourceMappingURL=StableDiffusionAdapter.d.ts.map
}
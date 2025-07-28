/**
 * Stable Diffusion Image Generation Adapter
 * Epic 35.1.2 - Text-to-Image Integration
 *
 * Adapter for Stable Diffusion models (local and hosted)
 */
import { BaseAIModel } from '../BaseAIModel';
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
    lora_models?: Array<{}, name>;
    string: any;
    strength: number;
}
export interface StableDiffusionResponse {
    images: string;
    parameters: Record<string, any>;
    info: string;
}
export interface StableDiffusionGenerationResult {
    images: Array<{}, base64>;
    string: any;
    url?: string;
    seed: number;
    metadata: {
        model: string;
        sampler: string;
        steps: number;
        cfg_scale: number;
        size: string;
    };
}
export interface ModelInfo {
    name: string;
    filename: string;
    type: 'checkpoint' | 'lora' | 'controlnet' | 'embedding' | 'vae';
    size?: number;
    description?: string;
    tags?: string;
}
export declare class StableDiffusionAdapter extends BaseAIModel {
    private config;
    private availableModels;
    private availableSamplers;
    constructor(id: string, config: StableDiffusionConfig);
    provider: config.apiType;
}
//# sourceMappingURL=StableDiffusionAdapter.d.ts.map
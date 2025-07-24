/**
 * Stable Video Diffusion Adapter
 * Epic 35.1.4 - Video Generation Integration
 *
 * Adapter for Stable Video Diffusion models (SVD and SVD-XT)
 */
import { BaseAIModel, CostEstimate } from '../BaseAIModel';
export interface StableVideoConfig {
    endpoint: string;
    apiType: 'stability-ai' | 'automatic1111' | 'comfyui' | 'custom';
    apiKey?: string;
    timeout?: number;
    maxRetries?: number;
    defaultModel?: string;
}
export interface StableVideoRequestOptions {
    image: string;
    model?: 'svd' | 'svd-xt' | 'svd-img2vid' | 'svd-xt-1-1';
    motion_bucket_id?: number;
    cond_aug?: number;
    num_frames?: number;
    fps?: number;
    width?: number;
    height?: number;
    seed?: number;
    steps?: number;
    cfg_scale?: number;
    noise_aug_strength?: number;
    scheduler?: string;
    decode_chunk_size?: number;
    enhance_motion?: boolean;
    temporal_consistency?: boolean;
    interpolate_frames?: boolean;
    upscale_video?: boolean;
    remove_watermark?: boolean;
    loop_video?: boolean;
}
export interface StableVideoGenerationResult {
    video: {
        frames: string[];
        url?: string;
        data?: ArrayBuffer;
        format: string;
        duration: number;
        resolution: {
            width: number;
            height: number;
        };
        fps: number;
        frame_count: number;
        size: number;
    };
    metadata: {
        model: string;
        input_image: string;
        motion_bucket_id: number;
        cond_aug: number;
        seed: number;
        steps: number;
        cfg_scale: number;
        generation_time: number;
        memory_usage?: number;
    };
    usage: {
        compute_units: number;
        estimated_cost: number;
        processing_time: number;
    };
}
export interface SVDModelInfo {
    name: string;
    type: 'svd' | 'svd-xt';
    max_frames: number;
    resolution: string;
    description: string;
    memory_requirements: string;
}
export declare class StableVideoAdapter extends BaseAIModel {
    private config;
    private availableModels;
    constructor(id: string, config: StableVideoConfig);
    initialize(): Promise<void>;
    process(input: any, options?: StableVideoRequestOptions): Promise<StableVideoGenerationResult>;
    cleanup(): Promise<void>;
    estimate(input: any, options?: StableVideoRequestOptions): Promise<CostEstimate>;
    generateImageToVideo(imageData: string, motionIntensity?: number, numFrames?: number, options?: Partial<StableVideoRequestOptions>): Promise<StableVideoGenerationResult>;
    generateVideoLoop(imageData: string, options?: Partial<StableVideoRequestOptions>): Promise<StableVideoGenerationResult>;
    generateHighQualityVideo(imageData: string, options?: Partial<StableVideoRequestOptions>): Promise<StableVideoGenerationResult>;
    getAvailableModels(): Promise<SVDModelInfo[]>;
    switchModel(modelName: string): Promise<void>;
    interpolateFrames(frames: string[]): Promise<string[]>;
    enhanceVideoQuality(frames: string[], upscaleFactor?: number): Promise<string[]>;
    static getEstimatedCost(apiType: string): number;
    static getEstimatedLatency(apiType: string): number;
    static getSupportedModels(): SVDModelInfo[];
    private _initializeModels;
    private _testConnection;
    private _buildHeaders;
    private _loadAvailableModels;
    private _extractImage;
    private _validateImage;
    private _processOptions;
    private _generateVideo;
    private _buildAutomatic1111Payload;
    private _buildStabilityAIPayload;
    private _buildGenericPayload;
    private _processVideoResult;
    private _makeRequest;
    private _calculateComputeUnits;
    private _estimateVideoSize;
    private _interpolateFrame;
    private _upscaleFrame;
    protected _performHealthCheck(): Promise<void>;
}
export default StableVideoAdapter;
//# sourceMappingURL=StableVideoAdapter.d.ts.map
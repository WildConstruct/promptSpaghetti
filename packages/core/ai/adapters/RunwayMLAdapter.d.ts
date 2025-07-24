/**
 * RunwayML Video Generation Adapter
 * Epic 35.1.4 - Video Generation Integration
 *
 * Adapter for RunwayML Gen-2 and Gen-3 video generation models
 */
import { BaseAIModel, CostEstimate } from '../BaseAIModel';
export interface RunwayMLConfig {
    apiKey: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
}
export interface RunwayMLRequestOptions {
    text_prompt: string;
    image_prompt?: string;
    model?: 'gen2' | 'gen3' | 'gen3-turbo';
    duration?: number;
    resolution?: '1280x768' | '768x1280' | '1024x576' | '576x1024' | '960x640' | '640x960';
    motion?: number;
    seed?: number;
    interpolate?: boolean;
    upscale?: boolean;
    watermark?: boolean;
    mode?: 'text_to_video' | 'image_to_video' | 'video_to_video';
    init_video?: string;
    motion_vector?: string;
    style_preset?: 'cinematic' | 'anime' | 'photorealistic' | 'abstract' | 'documentary';
    camera_motion?: 'static' | 'pan_left' | 'pan_right' | 'tilt_up' | 'tilt_down' | 'zoom_in' | 'zoom_out' | 'dolly_forward' | 'dolly_backward';
    enhance_prompt?: boolean;
    negative_prompt?: string;
}
export interface RunwayMLGenerationResult {
    video: {
        url?: string;
        data?: ArrayBuffer;
        format: string;
        duration: number;
        resolution: {
            width: number;
            height: number;
        };
        fps: number;
        size: number;
    };
    metadata: {
        model: string;
        prompt: string;
        negative_prompt?: string;
        generation_id: string;
        seed?: number;
        motion: number;
        camera_motion?: string;
        style_preset?: string;
        generation_time: number;
        status: 'completed' | 'processing' | 'failed';
    };
    usage: {
        credits_consumed: number;
        cost: number;
        processing_time: number;
    };
}
export interface RunwayMLTask {
    id: string;
    status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
    progress?: number;
    failure_code?: string;
    failure_reason?: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    output?: string[];
}
export declare class RunwayMLAdapter extends BaseAIModel {
    private config;
    private availableModels;
    constructor(id: string, config: RunwayMLConfig);
    initialize(): Promise<void>;
    process(input: any, options?: RunwayMLRequestOptions): Promise<RunwayMLGenerationResult>;
    cleanup(): Promise<void>;
    estimate(input: any, options?: RunwayMLRequestOptions): Promise<CostEstimate>;
    generateTextToVideo(prompt: string, duration?: number, options?: Partial<RunwayMLRequestOptions>): Promise<RunwayMLGenerationResult>;
    generateImageToVideo(prompt: string, imageData: string, duration?: number, options?: Partial<RunwayMLRequestOptions>): Promise<RunwayMLGenerationResult>;
    generateVideoToVideo(prompt: string, videoData: string, options?: Partial<RunwayMLRequestOptions>): Promise<RunwayMLGenerationResult>;
    getTaskStatus(taskId: string): Promise<RunwayMLTask>;
    cancelTask(taskId: string): Promise<void>;
    getAvailableModels(): Promise<string[]>;
    static getModelCredits(model: string, duration: number): number;
    static getSupportedResolutions(): string[];
    static getSupportedDurations(): number[];
    private _testConnection;
    private _extractPrompt;
    private _processOptions;
    private _createGenerationTask;
    private _pollTaskCompletion;
    private _processGenerationResult;
    private _makeRequest;
    private _calculateCredits;
    protected _performHealthCheck(): Promise<void>;
}
export default RunwayMLAdapter;
//# sourceMappingURL=RunwayMLAdapter.d.ts.map
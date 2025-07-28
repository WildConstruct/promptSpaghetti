/**
 * Midjourney Image Generation Adapter
 * Epic 35.1.2 - Text-to-Image Integration
 *
 * Adapter for Midjourney image generation via unofficial API
 */
import { BaseAIModel } from '../BaseAIModel';
export interface MidjourneyConfig {
    apiKey?: string;
    serverUrl: string;
    timeout?: number;
    maxRetries?: number;
    pollInterval?: number;
    maxPollAttempts?: number;
}
export interface MidjourneyRequestOptions {
    version?: 'v5' | 'v5.1' | 'v5.2' | 'v6';
    aspectRatio?: '1:1' | '2:3' | '3:2' | '4:5' | '5:4' | '9:16' | '16:9';
    stylize?: number;
    chaos?: number;
    quality?: number;
    seed?: number;
    style?: 'raw' | 'default';
    model?: 'midjourney' | 'niji';
    noText?: boolean;
    tile?: boolean;
    weird?: number;
    stop?: number;
}
export interface MidjourneyJobStatus {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    imageUrl?: string;
    thumbnailUrl?: string;
    prompt: string;
    originalPrompt: string;
    revisedPrompt?: string;
    createdAt: Date;
    completedAt?: Date;
    error?: string;
    metadata?: {
        version: string;
        aspectRatio: string;
        stylize: number;
        chaos: number;
        quality: number;
        seed?: number;
    };
}
export interface MidjourneyResponse {
    success: boolean;
    jobId: string;
    status: 'submitted' | 'in-progress' | 'completed' | 'failed';
    message?: string;
    result?: {
        imageUrl: string;
        thumbnailUrl?: string;
        upscaledImages?: string;
        variations?: string;
        prompt: string;
        seed?: number;
    };
    error?: string;
}
export interface MidjourneyGenerationResult {
    jobId: string;
    status: 'completed' | 'failed';
    images: Array<{}, url>;
    string: any;
    thumbnailUrl?: string;
    type: 'main' | 'upscaled' | 'variation';
    index?: number;
}
export declare class MidjourneyAdapter extends BaseAIModel {
    private config;
    private promptTemplater;
    private activeJobs;
    constructor(id: string, config: MidjourneyConfig);
}
//# sourceMappingURL=MidjourneyAdapter.d.ts.map
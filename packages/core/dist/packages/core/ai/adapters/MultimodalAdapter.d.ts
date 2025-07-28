/**
 * Multimodal AI Adapter
 * Epic 35.1.5 - Cross-Modal Intelligence
 *
 * Unified adapter for multimodal AI models that can process and understand multiple content types
 */
import { BaseAIModel } from '../BaseAIModel';
export interface MultimodalConfig {
    provider: 'openai' | 'anthropic' | 'google' | 'custom';
    apiKey: string;
    baseURL?: string;
    model?: string;
    timeout?: number;
    maxRetries?: number;
}
export interface MultimodalInput {
    type: 'text' | 'image' | 'audio' | 'video';
    content: string | ArrayBuffer | File | Blob;
    metadata?: {
        role?: 'user' | 'assistant' | 'system';
        mime_type?: string;
        duration?: number;
        resolution?: {
            width: number;
            height: number;
        };
        description?: string;
    };
}
export interface MultimodalRequestOptions {
    inputs: MultimodalInput;
    task?: 'understand' | 'describe' | 'analyze' | 'transform' | 'generate' | 'compare' | 'summarize';
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    vision_detail?: 'low' | 'high' | 'auto';
    audio_format?: 'transcript' | 'description' | 'analysis';
    video_sampling?: 'uniform' | 'keyframes' | 'motion_based';
    frames_per_second?: number;
    cross_reference?: boolean;
    context_fusion?: boolean;
    output_modality?: 'text' | 'structured' | 'multimodal';
    extract_entities?: boolean;
    detect_emotions?: boolean;
    identify_objects?: boolean;
    transcribe_speech?: boolean;
    analyze_sentiment?: boolean;
}
export interface MultimodalAnalysis {
    content_type: string;
    confidence: number;
    detected_elements: Array<{}, type>;
}
export interface MultimodalUnderstandingResult {
    understanding: {
        summary: string;
        key_insights: string;
        content_analysis: MultimodalAnalysis;
        cross_modal_connections: Array<{}, modalities>;
        string: any;
        connection_type: 'temporal' | 'semantic' | 'causal' | 'spatial';
        description: string;
        confidence: number;
    };
}
export declare class MultimodalAdapter extends BaseAIModel {
    private config;
    private supportedModalities;
    constructor(id: string, config: MultimodalConfig);
    private _processProviderResponse;
    inputs: MultimodalInput;
    options: Omit<MultimodalRequestOptions, 'inputs'>;
    MultimodalUnderstandingResult: any;
}
//# sourceMappingURL=MultimodalAdapter.d.ts.map
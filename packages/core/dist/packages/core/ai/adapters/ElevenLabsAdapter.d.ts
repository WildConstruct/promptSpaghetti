/**
 * ElevenLabs Voice Synthesis Adapter
 * Epic 35.1.3 - Speech and Audio Integration
 *
 * Adapter for ElevenLabs AI voice synthesis with custom voice training and cloning
 */
import { BaseAIModel } from '../BaseAIModel';
export interface ElevenLabsConfig {
    apiKey: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
}
export interface ElevenLabsRequestOptions {
    text: string;
    voice_id?: string;
    model_id?: string;
    voice_settings?: {
        stability: number;
        similarity_boost: number;
        style?: number;
        use_speaker_boost?: boolean;
    };
    output_format?: 'mp3_22050_32' | 'mp3_44100_32' | 'mp3_44100_64' | 'mp3_44100_96' | 'mp3_44100_128' | 'mp3_44100_192' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100' | 'ulaw_8000';
    optimize_streaming_latency?: number;
    pronunciation_dictionary?: Record<string, string>;
    seed?: number;
    previous_text?: string;
    next_text?: string;
    custom_voice?: {
        name: string;
        description?: string;
        labels?: Record<string, string>;
    };
}
export interface ElevenLabsGenerationResult {
    audio: {
        data: ArrayBuffer;
        format: string;
        duration: number;
        sample_rate: number;
        channels: number;
        bit_depth: number;
    };
    metadata: {
        voice_id: string;
        voice_name: string;
        model_id: string;
        text_length: number;
        audio_length: number;
        voice_settings: unknown;
        generation_time: number;
        request_id?: string;
    };
    usage: {
        characters: number;
        cost: number;
        quota_remaining?: number;
    };
}
export interface ElevenLabsVoice {
    voice_id: string;
    name: string;
    samples?: Array<{}, sample_id>;
    string: any;
    file_name: string;
    mime_type: string;
    size_bytes: number;
    hash: string;
}
export interface ElevenLabsModel {
    model_id: string;
    name: string;
    can_be_finetuned: boolean;
    can_do_text_to_speech: boolean;
    can_do_voice_conversion: boolean;
    can_use_style: boolean;
    can_use_speaker_boost: boolean;
    serves_pro_voices: boolean;
    token_cost_factor: number;
    description: string;
    requires_alpha_access: boolean;
    max_characters_request_free_user: number;
    max_characters_request_subscribed_user: number;
    languages: Array<{}, language_id>;
    string: any;
    name: string;
}
export declare class ElevenLabsAdapter extends BaseAIModel {
    private config;
    private availableVoices;
    private availableModels;
    private quotaInfo;
    constructor(id: string, config: ElevenLabsConfig);
}
//# sourceMappingURL=ElevenLabsAdapter.d.ts.map
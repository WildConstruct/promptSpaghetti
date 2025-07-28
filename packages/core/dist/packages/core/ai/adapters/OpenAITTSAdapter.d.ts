/**
 * OpenAI Text-to-Speech (TTS) Adapter
 * Epic 35.1.3 - Speech and Audio Integration
 *
 * Adapter for OpenAI's TTS models with voice selection and SSML support
 */
import { BaseAIModel } from '../BaseAIModel';
export interface OpenAITTSConfig {
    apiKey: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
    organization?: string;
}
export interface TTSRequestOptions {
    text: string;
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    model?: 'tts-1' | 'tts-1-hd';
    response_format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
    speed?: number;
    voice_settings?: {
        stability?: number;
        similarity_boost?: number;
        style?: number;
        use_speaker_boost?: boolean;
    };
    use_ssml?: boolean;
    pronunciation_dictionary?: Record<string, string>;
    chunk_length_s?: number;
    normalize_audio?: boolean;
}
export interface TTSGenerationResult {
    audio: {
        data: ArrayBuffer | string;
        format: string;
        duration: number;
        sample_rate: number;
        channels: number;
        bitrate?: number;
    };
    metadata: {
        voice: string;
        model: string;
        text_length: number;
        audio_length: number;
        speed: number;
        response_format: string;
        generation_time: number;
    };
    usage: {
        characters: number;
        cost: number;
    };
}
export interface VoiceInfo {
    id: string;
    name: string;
    description: string;
    gender: 'male' | 'female' | 'neutral';
    accent?: string;
    age?: 'young' | 'middle' | 'old';
    style?: string;
    preview_url?: string;
}
export declare class OpenAITTSAdapter extends BaseAIModel {
    private config;
    private availableVoices;
    constructor(id: string, config: OpenAITTSConfig, model?: string);
    catch(error: any): void;
    private _extractText;
    private _processOptions;
    text?: string;
    Required<Pick>(): any;
}
//# sourceMappingURL=OpenAITTSAdapter.d.ts.map
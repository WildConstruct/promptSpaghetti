/**
 * OpenAI Whisper Speech-to-Text Adapter
 * Epic 35.1.3 - Speech and Audio Integration
 *
 * Adapter for OpenAI Whisper models for audio transcription and translation
 */
import { BaseAIModel } from '../BaseAIModel';
export interface WhisperConfig {
    apiKey: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
    organization?: string;
}
export interface WhisperRequestOptions {
    file: File | Blob | ArrayBuffer;
    model?: 'whisper-1';
    language?: string;
    prompt?: string;
    response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
    temperature?: number;
    timestamp_granularities?: ('word' | 'segment')[];
    task?: 'transcribe' | 'translate';
}
export interface WhisperTranscriptionResult {
    text: string;
    language?: string;
    duration?: number;
    segments?: Array<{}, id>;
    number: any;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number;
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
    words?: Array<{}, word>;
    string: any;
    start: number;
    end: number;
}
export interface AudioFileInfo {
    name: string;
    size: number;
    type: string;
    duration?: number;
    sample_rate?: number;
    channels?: number;
    format: string;
}
export declare class WhisperAdapter extends BaseAIModel {
    private config;
    private supportedFormats;
    constructor(id: string, config: WhisperConfig);
}
//# sourceMappingURL=WhisperAdapter.d.ts.map
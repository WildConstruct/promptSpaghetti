/**
 * OpenAI Whisper Speech-to-Text Adapter
 * Epic 35.1.3 - Speech and Audio Integration
 *
 * Adapter for OpenAI Whisper models for audio transcription and translation
 */
import { BaseAIModel, CostEstimate } from '../BaseAIModel';
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
    segments?: Array<{
        id: number;
        seek: number;
        start: number;
        end: number;
        text: string;
        tokens: number[];
        temperature: number;
        avg_logprob: number;
        compression_ratio: number;
        no_speech_prob: number;
        words?: Array<{
            word: string;
            start: number;
            end: number;
        }>;
    }>;
    words?: Array<{
        word: string;
        start: number;
        end: number;
    }>;
    metadata: {
        model: string;
        task: string;
        language: string;
        duration: number;
        processing_time: number;
        confidence_score?: number;
    };
    usage: {
        audio_duration: number;
        cost: number;
    };
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
    initialize(): Promise<void>;
    process(input: File | Blob | ArrayBuffer | {
        file?: File | Blob | ArrayBuffer;
        audio?: File | Blob | ArrayBuffer;
        data?: File | Blob | ArrayBuffer;
    }, options?: WhisperRequestOptions): Promise<WhisperTranscriptionResult>;
    cleanup(): Promise<void>;
    estimate(input: File | Blob | ArrayBuffer | {
        file?: File | Blob | ArrayBuffer;
        audio?: File | Blob | ArrayBuffer;
        data?: File | Blob | ArrayBuffer;
    }, options?: WhisperRequestOptions): Promise<CostEstimate>;
    transcribeFile(file: File, language?: string, options?: Partial<WhisperRequestOptions>): Promise<WhisperTranscriptionResult>;
    translateToEnglish(file: File, options?: Partial<WhisperRequestOptions>): Promise<WhisperTranscriptionResult>;
    transcribeWithTimestamps(file: File, granularity?: 'word' | 'segment' | 'both', options?: Partial<WhisperRequestOptions>): Promise<WhisperTranscriptionResult>;
    batchTranscribe(files: File[], options?: WhisperRequestOptions): Promise<WhisperTranscriptionResult[]>;
    getSupportedLanguages(): Promise<string[]>;
    getAudioInfo(file: File | Blob): Promise<AudioFileInfo>;
    static getSupportedFormats(): string[];
    static getMaxFileSize(): number;
    static getLanguageName(code: string): string;
    private _testConnection;
    private _createTestAudioBlob;
    private _extractAudioFile;
    private _validateAudioFile;
    private _processOptions;
    private _transcribeAudio;
    private _getAudioDuration;
    private _estimateDurationFromSize;
    private _getFormatFromMimeType;
    private _calculateConfidenceScore;
    private _calculateCost;
    protected _performHealthCheck(): Promise<void>;
}
export default WhisperAdapter;
//# sourceMappingURL=WhisperAdapter.d.ts.map
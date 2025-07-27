/**
 * ElevenLabs Voice Synthesis Adapter
 * Epic 35.1.3 - Speech and Audio Integration
 *
 * Adapter for ElevenLabs AI voice synthesis with custom voice training and cloning
 */
import { BaseAIModel, CostEstimate } from '../BaseAIModel';
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
    samples?: Array<{
        sample_id: string;
        file_name: string;
        mime_type: string;
        size_bytes: number;
        hash: string;
    }>;
    category: 'premade' | 'cloned' | 'generated' | 'professional';
    fine_tuning: {
        is_allowed_to_fine_tune: boolean;
        finetuning_requested: boolean;
        finetuning_state: string;
        verification_attempts: Array<{
            text: string;
            date_unix: number;
            accepted: boolean;
            similarity: number;
            levenshtein_distance: number;
            recording: {
                recording_id: string;
                mime_type: string;
                size_bytes: number;
                upload_date_unix: number;
            };
        }>;
        verification_failures: string[];
        verification_attempts_count: number;
        slice_ids: string[];
        manual_verification: {
            extra_text: string;
            request_time_unix: number;
            files: Array<{
                file_id: string;
                file_name: string;
                mime_type: string;
                size_bytes: number;
                upload_date_unix: number;
            }>;
        };
    };
    labels: Record<string, string>;
    description: string;
    preview_url: string;
    available_for_tiers: string[];
    settings?: {
        stability: number;
        similarity_boost: number;
        style?: number;
        use_speaker_boost?: boolean;
    };
    sharing?: {
        status: string;
        history_item_sample_id?: string;
        original_voice_id?: string;
        public_owner_id?: string;
        liked_by_count: number;
        cloned_by_count: number;
        name: string;
        description: string;
        labels: Record<string, string>;
        review_status: string;
        review_message?: string;
        enabled_in_library: boolean;
    };
    high_quality_base_model_ids: string[];
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
    languages: Array<{
        language_id: string;
        name: string;
    }>;
}
export declare class ElevenLabsAdapter extends BaseAIModel {
    private config;
    private availableVoices;
    private availableModels;
    private quotaInfo;
    constructor(id: string, config: ElevenLabsConfig);
    initialize(): Promise<void>;
    process(input: unknown, options?: ElevenLabsRequestOptions): Promise<ElevenLabsGenerationResult>;
    cleanup(): Promise<void>;
    estimate(input: any, options?: ElevenLabsRequestOptions): Promise<CostEstimate>;
    getAvailableVoices(): Promise<ElevenLabsVoice[]>;
    getAvailableModels(): Promise<ElevenLabsModel[]>;
    getQuotaInfo(): Promise<any>;
    createCustomVoice(name: string, audioFiles: File[], description?: string, labels?: Record<string, string>): Promise<ElevenLabsVoice>;
    cloneVoice(name: string, audioSample: File, description?: string): Promise<ElevenLabsVoice>;
    deleteVoice(voiceId: string): Promise<void>;
    getVoiceSettings(voiceId: string): Promise<any>;
    updateVoiceSettings(voiceId: string, settings: any): Promise<void>;
    generateWithStream(text: string, voiceId: string, options?: Partial<ElevenLabsRequestOptions>): Promise<ReadableStream>;
    static getDefaultVoiceSettings(): {
        stability: number;
        similarity_boost: number;
        style: number;
        use_speaker_boost: boolean;
    };
    static optimizeVoiceSettings(voiceCategory: string): any;
    private _testConnection;
    private _loadAvailableVoices;
    private _loadAvailableModels;
    private _loadQuotaInfo;
    private _checkQuota;
    private _extractText;
    private _processOptions;
    private _generateSpeech;
    private _getVoiceInfo;
    private _makeRequest;
    private _estimateAudioDuration;
    private _getSampleRate;
    private _getBitDepth;
    private _calculateCost;
    protected _performHealthCheck(): Promise<void>;
}
export default ElevenLabsAdapter;
//# sourceMappingURL=ElevenLabsAdapter.d.ts.map
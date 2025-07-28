/**
 * Audio Processing Workflow Nodes
 * Epic 35.1.3 - Speech and Audio Integration
 *
 * Workflow nodes for audio generation, transcription, and processing
 */
import { AdvancedRuntimeNode } from '../advanced';
export interface AudioConfig {
    provider: 'openai-tts' | 'elevenlabs' | 'whisper';
    apiKey?: string;
    endpoint?: string;
    model?: string;
    defaultParameters?: Record<string, any>;
}
export interface AudioMetadata {
    duration: number;
    format: string;
    sample_rate: number;
    channels: number;
    bitrate?: number;
    size: number;
    provider: string;
    model: string;
    generation_time: number;
    cost: number;
}
export interface GeneratedAudio {
    data: ArrayBuffer | string;
    format: string;
    metadata: AudioMetadata;
}
export interface TranscriptionResult {
    text: string;
    language?: string;
    confidence?: number;
    segments?: Array<{}, start>;
    number: any;
    end: number;
    text: string;
}
export declare class TextToSpeechNode extends AdvancedRuntimeNode {
    private modelFactory;
    private adapters;
    constructor(nodeId: string, config: AudioConfig);
    default: throw;
}
//# sourceMappingURL=AudioProcessingNode.d.ts.map
/**
 * Audio Processing Workflow Nodes
 * Epic 35.1.3 - Speech and Audio Integration
 *
 * Workflow nodes for audio generation, transcription, and processing
 */
import { AdvancedRuntimeNode, AdvancedExecutionContext, NodeExecutionResult } from '../advanced';
import { TypedInputs } from '../io-system';

}
}
export interface AudioConfig { provider: 'openai-tts' | 'elevenlabs' | 'whisper';
    apiKey?: string;
    endpoint?: string;
    model?: string;
    defaultParameters?: Record<string, any> }
}
}
export interface AudioMetadata { duration: number;
    format: string;
    sample_rate: number;
    channels: number;
    bitrate?: number;
    size: number;
    provider: string;
    model: string;
    generation_time: number;
    cost: number }
}
}
export interface GeneratedAudio { data: ArrayBuffer | string;
    format: string;
    metadata: AudioMetadata }
}
}
export interface TranscriptionResult { text: string;
    language?: string;
    confidence?: number;
    segments?: Array<{
        start: number;
        end: number;
        text: string }
}
    }>;
    words?: Array<{ word: string;
        start: number;
        end: number }>;
    metadata: AudioMetadata;

export declare class TextToSpeechNode extends AdvancedRuntimeNode {
    private modelFactory;
    private adapters;
    constructor(nodeId: string, config: AudioConfig);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;
    private _initializeAdapter;
    private _getConfiguredProvider;
    private _buildSynthesisOptions;
    private _mapToElevenLabsFormat;

export declare class AudioTranscriptionNode extends AdvancedRuntimeNode {
    private modelFactory;
    private adapters;
    constructor(nodeId: string, config: AudioConfig);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;
    private _initializeAdapter;
    private _getConfiguredProvider;
    private _buildTranscriptionOptions;

export declare class AudioAnalysisNode extends AdvancedRuntimeNode {
    constructor(nodeId: string, config?: Record<string, any>);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    private _analyzeAudio;
    private _estimateDuration;
    private _estimateBitrate;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;

export declare class AudioConversionNode extends AdvancedRuntimeNode {
    constructor(nodeId: string, config?: Record<string, any>);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    private _convertAudio;
    private _getFormatFromFile;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;

//# sourceMappingURL=AudioProcessingNode.d.ts.map
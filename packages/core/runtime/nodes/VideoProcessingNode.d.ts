/**
 * Video Processing Workflow Nodes
 * Epic 35.1.4 - Video Generation Integration
 *
 * Workflow nodes for video generation, processing, and analysis
 */
import { AdvancedRuntimeNode, AdvancedExecutionContext, NodeExecutionResult } from '../advanced';
import { TypedInputs } from '../io-system';

}
export interface VideoConfig {
    provider: 'runwayml' | 'stable-video' | 'pika-labs';
    apiKey?: string;
    endpoint?: string;
    model?: string;
    defaultParameters?: Record<string, any>;

}
export interface VideoMetadata {
    duration: number;
    format: string;
    resolution: {
        width: number;
        height: number;
}
    };
    fps: number;
    frame_count: number;
    size: number;
    provider: string;
    model: string;
    generation_time: number;
    cost: number;
    codec?: string;
    bitrate?: number;

}
export interface GeneratedVideo {
    url?: string;
    data?: ArrayBuffer;
    frames?: string[];
    format: string;
    metadata: VideoMetadata;

export declare class VideoGenerationNode extends AdvancedRuntimeNode {
    private modelFactory;
    private adapters;
    constructor(nodeId: string, config: VideoConfig);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;
    private _initializeAdapter;
    private _getConfiguredProvider;
    private _buildGenerationOptions;

export declare class VideoToVideoNode extends AdvancedRuntimeNode {
    private modelFactory;
    private adapters;
    constructor(nodeId: string, config: VideoConfig);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    private _initializeAdapter;
    private _getConfiguredProvider;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;

export declare class VideoAnalysisNode extends AdvancedRuntimeNode {
    constructor(nodeId: string, config?: Record<string, any>);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    private _analyzeVideo;
    private _estimateDuration;
    private _estimateResolution;
    private _guessCodec;
    private _estimateBitrate;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;

export declare class VideoEnhancementNode extends AdvancedRuntimeNode {
    constructor(nodeId: string, config?: Record<string, any>);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    private _enhanceVideo;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;

export declare class VideoCompositionNode extends AdvancedRuntimeNode {
    constructor(nodeId: string, config?: Record<string, any>);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    private _composeVideos;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;

//# sourceMappingURL=VideoProcessingNode.d.ts.map
}
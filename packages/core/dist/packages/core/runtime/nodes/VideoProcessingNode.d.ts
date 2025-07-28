/**
 * Video Processing Workflow Nodes
 * Epic 35.1.4 - Video Generation Integration
 *
 * Workflow nodes for video generation, processing, and analysis
 */
import { AdvancedRuntimeNode } from '../advanced';
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
    frames?: string;
    format: string;
    metadata: VideoMetadata;
}
export declare class VideoGenerationNode extends AdvancedRuntimeNode {
    private modelFactory;
    private adapters;
    constructor(nodeId: string, config: VideoConfig);
    default: throw;
}
//# sourceMappingURL=VideoProcessingNode.d.ts.map
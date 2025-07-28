/**
 * Image Generation Workflow Nodes
 * Epic 35.1.2 - Text-to-Image Integration
 *
 * Workflow nodes for image generation and processing
 */
import { AdvancedRuntimeNode } from '../advanced';
export interface ImageGenerationConfig {
    provider: 'dalle' | 'midjourney' | 'stable-diffusion';
    model?: string;
    apiKey?: string;
    endpoint?: string;
    defaultParameters?: Record<string, any>;
}
export interface ImageMetadata {
    width: number;
    height: number;
    format: string;
    model: string;
    provider: string;
    generationTime: number;
    cost: number;
    seed?: number;
    prompt: string;
    negativePrompt?: string;
}
export interface GeneratedImage {
    url?: string;
    base64?: string;
    metadata: ImageMetadata;
}
export declare class ImageGenerationNode extends AdvancedRuntimeNode {
    private modelFactory;
    private adapters;
    constructor(nodeId: string, config: ImageGenerationConfig);
}
//# sourceMappingURL=ImageGenerationNode.d.ts.map
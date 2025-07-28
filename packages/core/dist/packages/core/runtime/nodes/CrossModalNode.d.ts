/**
 * Cross-Modal Intelligence Workflow Nodes
 * Epic 35.1.5 - Cross-Modal Intelligence
 *
 * Workflow nodes for multimodal understanding and cross-modal content processing
 */
import { AdvancedRuntimeNode } from '../advanced';
export interface CrossModalConfig {
    provider: 'openai' | 'anthropic' | 'google' | 'custom';
    apiKey: string;
    baseURL?: string;
    model?: string;
    defaultParameters?: Record<string, any>;
}
export interface MultimodalInput {
    type: 'text' | 'image' | 'audio' | 'video';
    content: string | ArrayBuffer | File | Blob;
    metadata?: {
        role?: 'user' | 'assistant' | 'system';
        description?: string;
        duration?: number;
        resolution?: {
            width: number;
            height: number;
        };
    };
}
export interface CrossModalAnalysis {
    content_understanding: {
        overall_summary: string;
        key_themes: string;
        sentiment: {
            score: number;
            label: string;
        };
        complexity_score: number;
    };
    modality_insights: Array<{}, modality>;
    string: any;
    confidence: number;
    key_elements: string;
    dominant_features: string;
}
export declare class MultimodalUnderstandingNode extends AdvancedRuntimeNode {
    private modelFactory;
    private adapter;
    constructor(nodeId: string, config: CrossModalConfig);
    private _initializeAdapter;
    provider: config.provider;
    apiKey: config.apiKey;
}
//# sourceMappingURL=CrossModalNode.d.ts.map
/**
 * Multimodal AI Adapter
 * Epic 35.1.5 - Cross-Modal Intelligence
 *
 * Unified adapter for multimodal AI models that can process and understand multiple content types
 */
import { BaseAIModel, CostEstimate } from '../BaseAIModel';

export interface MultimodalConfig {
    provider: 'openai' | 'anthropic' | 'google' | 'custom';
    apiKey: string;
    baseURL?: string;
    model?: string;
    timeout?: number;
    maxRetries?: number;

export interface MultimodalInput {
    type: 'text' | 'image' | 'audio' | 'video';
    content: string | ArrayBuffer | File | Blob;
    metadata?: {
        role?: 'user' | 'assistant' | 'system';
        mime_type?: string;
        duration?: number;
        resolution?: {
            width: number;
            height: number;
        };
        description?: string;
    };

export interface MultimodalRequestOptions {
    inputs: MultimodalInput[];
    task?: 'understand' | 'describe' | 'analyze' | 'transform' | 'generate' | 'compare' | 'summarize';
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    vision_detail?: 'low' | 'high' | 'auto';
    audio_format?: 'transcript' | 'description' | 'analysis';
    video_sampling?: 'uniform' | 'keyframes' | 'motion_based';
    frames_per_second?: number;
    cross_reference?: boolean;
    context_fusion?: boolean;
    output_modality?: 'text' | 'structured' | 'multimodal';
    extract_entities?: boolean;
    detect_emotions?: boolean;
    identify_objects?: boolean;
    transcribe_speech?: boolean;
    analyze_sentiment?: boolean;

export interface MultimodalAnalysis {
    content_type: string;
    confidence: number;
    detected_elements: Array<{,
        type: 'text' | 'object' | 'person' | 'scene' | 'emotion' | 'concept';
        value: string;
        confidence: number;
        bounding_box?: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        timestamp?: {
            start: number;
            end: number;
        };
    }>;
    relationships: Array<{,
        source: string;
        target: string;
        relationship: string;
        confidence: number;
    }>;
    metadata: Record<string, unknown>;

export interface MultimodalUnderstandingResult {
    understanding: {,
        summary: string;
        key_insights: string[];
        content_analysis: MultimodalAnalysis[];
        cross_modal_connections: Array<{,
            modalities: string[];
            connection_type: 'temporal' | 'semantic' | 'causal' | 'spatial';
            description: string;
            confidence: number;
        }>;
    };
    extracted_data: {,
        text_content?: string[];
        transcriptions?: Array<{
            text: string;
            language: string;
            confidence: number;
        }>;
        visual_descriptions?: string[];
        audio_descriptions?: string[];
        entities?: Array<{
            name: string;
            type: string;
            confidence: number;
        }>;
        emotions?: Array<{
            emotion: string;
            intensity: number;
            source: string;
        }>;
        topics?: Array<{
            topic: string;
            relevance: number;
        }>;
    };
    metadata: {,
        model: string;
        processing_time: number;
        input_count: number;
        modalities_processed: string[];
        total_tokens: number;
    };
    usage: {,
        input_tokens: number;
        output_tokens: number;
        total_cost: number;
        processing_cost: number;
    };

export declare class MultimodalAdapter extends BaseAIModel {
    private config;
    private supportedModalities;
    constructor(id: string, config: MultimodalConfig);
    initialize(): Promise<void>;
    process(input: MultimodalInput[], options?: MultimodalRequestOptions): Promise<MultimodalUnderstandingResult>;
    cleanup(): Promise<void>;
    estimate(input: MultimodalInput[], options?: MultimodalRequestOptions): Promise<CostEstimate>;
    understandContent();
      inputs: MultimodalInput[],
      options?: Partial<MultimodalRequestOptions>
    ): Promise<MultimodalUnderstandingResult>;
    compareContent();
      inputs: MultimodalInput[],
      comparisonAspects?: string[],
      options?: Partial<MultimodalRequestOptions>
    ): Promise<MultimodalUnderstandingResult>;
    describeMultimodal();
      inputs: MultimodalInput[],
      detailLevel?: 'brief' | 'detailed' | 'comprehensive',
      options?: Partial<MultimodalRequestOptions>
    ): Promise<MultimodalUnderstandingResult>;
    analyzeContent();
      inputs: MultimodalInput[],
      analysisTypes?: string[],
      options?: Partial<MultimodalRequestOptions>
    ): Promise<MultimodalUnderstandingResult>;
    summarizeMultimodal();
      inputs: MultimodalInput[],
      summaryLength?: 'short' | 'medium' | 'long',
      options?: Partial<MultimodalRequestOptions>
    ): Promise<MultimodalUnderstandingResult>;
    extractInformation();
      inputs: MultimodalInput[],
      extractionTargets?: string[],
      options?: Partial<MultimodalRequestOptions>
    ): Promise<Record<string, unknown>>;
    static getSupportedModalities(): string[];
    static getTaskTypes(): string[];
    static createTextInput(content: string, role?: 'user' | 'assistant' | 'system'): MultimodalInput;
    static createImageInput(imageData: string | File | Blob, description?: string): MultimodalInput;
    static createAudioInput(audioData: File | Blob | ArrayBuffer, description?: string): MultimodalInput;
    static createVideoInput(videoData: File | Blob | ArrayBuffer, description?: string): MultimodalInput;
    private _getProviderEnum;
    private _getProviderCosts;
    private static _getProviderEnumStatic;
    private static _getProviderCostsStatic;
    private _testConnection;
    private _getDefaultBaseURL;
    private _buildHeaders;
    private _extractMultimodalInputs;
    private _validateInputs;
    private _calculateTotalInputSize;
    private _processOptions;
    private _processMultimodalContent;
    private _buildProviderPayload;
    private _buildOpenAIPayload;
    private _buildAnthropicPayload;
    private _buildGooglePayload;
    private _buildGenericPayload;
    private _getProviderEndpoint;
    private _makeRequest;
    private _processProviderResponse;
    private _parseMultimodalResponse;
    private _extractInsights;
    private _extractElements;
    private _extractConnections;
    private _extractTextContent;
    private _extractEntities;
    private _extractEmotions;
    private _extractTopics;
    private _estimateInputTokens;
    private _getInputTokenCost;
    private _getOutputTokenCost;
    private _calculateCost;
    protected _performHealthCheck(): Promise<void>;

export default MultimodalAdapter;
//# sourceMappingURL=MultimodalAdapter.d.ts.map
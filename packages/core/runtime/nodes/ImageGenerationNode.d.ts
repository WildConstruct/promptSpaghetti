/**
 * Image Generation Workflow Nodes
 * Epic 35.1.2 - Text-to-Image Integration
 *
 * Workflow nodes for image generation and processing
 */
import { AdvancedRuntimeNode, AdvancedExecutionContext, NodeExecutionResult } from '../advanced';
import { TypedInputs } from '../io-system';

export interface ImageGenerationConfig {
    provider: 'dalle' | 'midjourney' | 'stable-diffusion';
    model?: string;
    apiKey?: string;
    endpoint?: string;
    defaultParameters?: Record<string, any>;


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


export interface GeneratedImage {
    url?: string;
    base64?: string;
    metadata: ImageMetadata;

export declare class ImageGenerationNode extends AdvancedRuntimeNode {
    private modelFactory;
    private adapters;
    constructor(nodeId: string, config: ImageGenerationConfig);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;
    private _initializeAdapter;
    private _getConfiguredProvider;
    private _buildGenerationOptions;
    private _calculateAspectRatio;
    private _mapStyleToStylize;

export declare class ImageVariationNode extends AdvancedRuntimeNode {
    private modelFactory;
    constructor(nodeId: string, config: ImageGenerationConfig);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;

export declare class ImageUpscaleNode extends AdvancedRuntimeNode {
    constructor(nodeId: string, config?: Record<string, any>);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;

export declare class ImageEditNode extends AdvancedRuntimeNode {
    constructor(nodeId: string, config?: Record<string, any>);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;

//# sourceMappingURL=ImageGenerationNode.d.ts.map
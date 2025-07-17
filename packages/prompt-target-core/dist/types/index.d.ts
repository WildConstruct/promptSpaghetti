export type Platform = 'openai-gpt' | 'openai-dalle' | 'midjourney' | 'stable-diffusion' | 'claude' | 'custom';
export type NodeType = 'text' | 'image' | 'style' | 'parameter' | 'conditional' | 'weighted' | 'concat' | 'output' | 'custom';
export type EdgeType = 'default' | 'conditional' | 'weighted';
export interface Position {
    x: number;
    y: number;
}
export interface PromptGraph {
    id: string;
    nodes: PromptNode[];
    edges: PromptEdge[];
    metadata: GraphMetadata;
    version: string;
}
export interface PromptNode {
    id: string;
    type: NodeType;
    data: NodeData;
    position: Position;
    metadata?: NodeMetadata;
}
export interface PromptEdge {
    id: string;
    source: string;
    target: string;
    type?: EdgeType;
    data?: EdgeData;
}
export interface NodeData {
    label?: string;
    content?: string;
    parameters?: Record<string, any>;
    [key: string]: any;
}
export interface EdgeData {
    weight?: number;
    condition?: string;
    [key: string]: any;
}
export interface GraphMetadata {
    name?: string;
    description?: string;
    tags?: string[];
    created: Date;
    modified: Date;
    author?: string;
    version: string;
}
export interface NodeMetadata {
    created: Date;
    modified: Date;
    [key: string]: any;
}
export interface ModelAdaptor {
    readonly id: string;
    readonly version: string;
    readonly platform: Platform;
    readonly name: string;
    readonly description: string;
    capabilities(): Promise<Capabilities>;
    validate(graph: PromptGraph): Promise<ValidationResult[]>;
    transform(graph: PromptGraph, options?: TransformOptions): Promise<TargetPrompt>;
    estimateQuality(graph: PromptGraph): Promise<QualityScore>;
}
export interface Capabilities {
    supportedNodeTypes: NodeType[];
    parameters: ParameterSpec[];
    limitations: Limitation[];
    features: Feature[];
    maxNodes?: number;
    maxPromptLength?: number;
    supportedFormats: string[];
}
export interface ParameterSpec {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'enum';
    required: boolean;
    default?: any;
    min?: number;
    max?: number;
    options?: string[];
    description: string;
}
export interface Limitation {
    type: 'node_count' | 'prompt_length' | 'feature' | 'parameter' | 'format';
    description: string;
    severity: 'error' | 'warning' | 'info';
    impact: string;
}
export interface Feature {
    name: string;
    supported: boolean;
    description: string;
    alternatives?: string[];
}
export interface ValidationResult {
    id: string;
    type: 'error' | 'warning' | 'info';
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    description?: string;
    nodeId?: string;
    edgeId?: string;
    suggestions?: Suggestion[];
    autoFixable: boolean;
}
export interface Suggestion {
    type: 'fix' | 'alternative' | 'workaround';
    description: string;
    action?: AutoFixAction;
}
export interface AutoFixAction {
    type: 'node_modify' | 'node_remove' | 'edge_modify' | 'edge_remove' | 'parameter_adjust';
    targetId: string;
    changes: Record<string, any>;
}
export interface TransformOptions {
    optimize?: boolean;
    preserveMetadata?: boolean;
    targetQuality?: 'fast' | 'balanced' | 'high';
    fallbackStrategy?: 'ignore' | 'approximate' | 'error';
    customParams?: Record<string, any>;
}
export interface TargetPrompt {
    platform: Platform;
    content: string | object;
    parameters: Record<string, any>;
    metadata: TargetMetadata;
    format: string;
}
export interface TargetMetadata {
    originalGraphId: string;
    translationId: string;
    timestamp: Date;
    adaptorVersion: string;
    quality: QualityScore;
    warnings: ValidationResult[];
    transformations: TransformationLog[];
    apiParameters?: Record<string, any>;
}
export interface TransformationLog {
    step: string;
    sourceNodeId?: string;
    action: string;
    details?: Record<string, any>;
}
export interface QualityScore {
    overall: number;
    fidelity: number;
    compatibility: number;
    performance: number;
    completeness: number;
    breakdown: QualityBreakdown;
}
export interface QualityBreakdown {
    nodeTranslation: number;
    parameterMapping: number;
    featureSupport: number;
    semanticPreservation: number;
    syntaxValidity: number;
}
export interface TranslationRequest {
    graph: PromptGraph;
    targetPlatform: Platform;
    options?: TransformOptions;
    requestId?: string;
}
export interface TranslationResponse {
    requestId: string;
    success: boolean;
    targetPrompt?: TargetPrompt;
    quality?: QualityScore;
    validationResults: ValidationResult[];
    error?: TranslationError;
    timing: TranslationTiming;
}
export interface TranslationError {
    code: string;
    message: string;
    details?: Record<string, any>;
    recoverable: boolean;
    suggestions?: string[];
}
export interface TranslationTiming {
    total: number;
    validation: number;
    transformation: number;
    postProcessing: number;
}
export interface CacheEntry {
    key: string;
    value: TargetPrompt;
    quality: QualityScore;
    timestamp: Date;
    ttl: number;
    adaptorVersion: string;
}
export interface AdaptorConfig {
    id: string;
    enabled: boolean;
    priority: number;
    parameters: Record<string, any>;
    rateLimit?: RateLimit;
    timeout?: number;
}
export interface RateLimit {
    requests: number;
    window: number;
    burst?: number;
}
export interface PluginManifest {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
    platform: Platform;
    entrypoint: string;
    dependencies?: string[];
    permissions?: string[];
    signature?: string;
}
export interface PluginContext {
    logger: Logger;
    cache: CacheInterface;
    metrics: MetricsInterface;
    config: Record<string, any>;
}
export interface Logger {
    debug(message: string, meta?: Record<string, any>): void;
    info(message: string, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    error(message: string, meta?: Record<string, any>): void;
}
export interface CacheInterface {
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
}
export interface MetricsInterface {
    counter(name: string, value?: number, tags?: Record<string, string>): void;
    gauge(name: string, value: number, tags?: Record<string, string>): void;
    histogram(name: string, value: number, tags?: Record<string, string>): void;
    timer(name: string): {
        end(): void;
    };
}
export interface PromptTargetingEvent {
    type: string;
    timestamp: Date;
    data: Record<string, any>;
    source: string;
    traceId?: string;
}
export type TranslationStartedEvent = PromptTargetingEvent & {
    type: 'translation.started';
    data: {
        requestId: string;
        graphId: string;
        targetPlatform: Platform;
    };
};
export type TranslationCompletedEvent = PromptTargetingEvent & {
    type: 'translation.completed';
    data: {
        requestId: string;
        success: boolean;
        quality?: QualityScore;
        duration: number;
    };
};
export type AdaptorLoadedEvent = PromptTargetingEvent & {
    type: 'adaptor.loaded';
    data: {
        adaptorId: string;
        version: string;
        platform: Platform;
    };
};
export declare class PromptTargetingError extends Error {
    code: string;
    details?: Record<string, any> | undefined;
    recoverable: boolean;
    constructor(message: string, code: string, details?: Record<string, any> | undefined, recoverable?: boolean);
}
export declare class ValidationError extends PromptTargetingError {
    validationResults: ValidationResult[];
    constructor(message: string, validationResults: ValidationResult[]);
}
export declare class TransformationError extends PromptTargetingError {
    nodeId?: string | undefined;
    step?: string | undefined;
    constructor(message: string, nodeId?: string | undefined, step?: string | undefined);
}
export declare class AdaptorError extends PromptTargetingError {
    adaptorId: string;
    constructor(message: string, adaptorId: string);
}
export declare class TranslationError extends PromptTargetingError {
    constructor(message: string, code: string, details?: Record<string, any>, recoverable?: boolean);
}

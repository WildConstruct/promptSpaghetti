/**
 * Base AI Model Interface and Abstract Implementation
 * Epic 35.1.1 - Multi-Model Infrastructure
 *
 * Unified interface for all AI model types with standardized methods
 */
export declare enum AIModelType {
    TEXT = "text",
    IMAGE = "image",
    AUDIO = "audio",
    VIDEO = "video",
    MULTIMODAL = "multimodal"
}
export declare enum AIModelProvider {
    OPENAI = "openai",
    ANTHROPIC = "anthropic",
    HUGGINGFACE = "huggingface",
    STABILITY_AI = "stability_ai",
    ELEVENLABS = "elevenlabs",
    RUNWAYML = "runwayml",
    MIDJOURNEY = "midjourney",
    PIKA_LABS = "pika_labs",
    SORA = "sora",
    LOCAL = "local",
    CUSTOM = "custom"
}
export declare enum AIModelStatus {
    INITIALIZING = "initializing",
    READY = "ready",
    BUSY = "busy",
    ERROR = "error",
    OFFLINE = "offline",
    MAINTENANCE = "maintenance"
}
export interface ModelCapabilities {
    inputTypes: string[];
    outputTypes: string[];
    maxInputSize?: number;
    maxOutputSize?: number;
    supportsBatch?: boolean;
    supportsStreaming?: boolean;
    supportsAsync?: boolean;
    customParameters?: Record<string, any>;
}
export interface ModelMetadata {
    name: string;
    version: string;
    description: string;
    provider: AIModelProvider;
    type: AIModelType;
    costPerRequest?: number;
    costPerToken?: number;
    averageLatency?: number;
    maxConcurrency?: number;
    rateLimit?: {
        requestsPerMinute: number;
        tokensPerMinute?: number;
    };
    tags?: string[];
    lastUpdated: Date;
}
export interface CostEstimate {
    estimatedCost: number;
    currency: string;
    breakdown?: {
        inputCost: number;
        outputCost: number;
        processingCost: number;
    };
    confidence: number;
}
export interface HealthStatus {
    status: AIModelStatus;
    uptime: number;
    lastCheck: Date;
    responseTime?: number;
    errorRate?: number;
    concurrentRequests?: number;
    details?: {
        memoryUsage?: number;
        cpuUsage?: number;
        diskSpace?: number;
        networkLatency?: number;
    };
    issues?: string[];
}
export interface AIRequest {
    id: string;
    input: any;
    options?: Record<string, any>;
    metadata?: {
        userId?: string;
        sessionId?: string;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        timeout?: number;
        retryCount?: number;
    };
    createdAt: Date;
}
export interface AIResponse {
    id: string;
    requestId: string;
    output: any;
    metadata?: {
        processingTime: number;
        cost?: CostEstimate;
        modelUsed: string;
        tokensUsed?: {
            input: number;
            output: number;
        };
        quality?: number;
    };
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    completedAt: Date;
}
export declare abstract class BaseAIModel {
    protected _id: string;
    protected _metadata: ModelMetadata;
    protected _capabilities: ModelCapabilities;
    protected _status: AIModelStatus;
    protected _healthStats: HealthStatus;
    protected _requestQueue: AIRequest[];
    protected _activeRequests: Set<string>;
    protected _lastActivity: Date;
    constructor(id: string, metadata: ModelMetadata, capabilities: ModelCapabilities);
    get id(): string;
    get metadata(): ModelMetadata;
    get capabilities(): ModelCapabilities;
    get status(): AIModelStatus;
    abstract initialize(): Promise<void>;
    abstract process(input: any, options?: any): Promise<any>;
    abstract cleanup(): Promise<void>;
    estimate(input: any, options?: any): Promise<CostEstimate>;
    health(): Promise<HealthStatus>;
    executeRequest(request: AIRequest): Promise<AIResponse>;
    executeBatch(requests: AIRequest[]): Promise<AIResponse[]>;
    updateConfiguration(config: Partial<ModelMetadata>): void;
    updateCapabilities(capabilities: Partial<ModelCapabilities>): void;
    protected _validateRequest(request: AIRequest): Promise<void>;
    protected _calculateInputSize(input: any): number;
    protected _detectInputType(input: any): string;
    protected _calculateTokenCost(input: any, options?: any): number;
    protected _assessOutputQuality(output: any): Promise<number>;
    protected _performHealthCheck(): Promise<void>;
    protected _processBatch(requests: AIRequest[]): Promise<AIResponse[]>;
}
export interface AIModelFactory {
    createModel(config: ModelConfiguration): Promise<BaseAIModel>;
    getSupportedTypes(): AIModelType[];
    getDefaultConfiguration(type: AIModelType): ModelConfiguration;
}
export interface ModelConfiguration {
    id: string;
    type: AIModelType;
    provider: AIModelProvider;
    endpoint?: string;
    apiKey?: string;
    modelName?: string;
    parameters?: Record<string, any>;
    capabilities?: Partial<ModelCapabilities>;
    metadata?: Partial<ModelMetadata>;
}
export declare class ModelInitializationError extends Error {
    constructor(modelId: string, cause: string);
}
export declare class ModelProcessingError extends Error {
    constructor(modelId: string, cause: string);
}
export declare class ModelUnavailableError extends Error {
    constructor(modelId: string);
}
export { BaseAIModel as default, AIModelType, AIModelProvider, AIModelStatus, ModelCapabilities, ModelMetadata, CostEstimate, HealthStatus, AIRequest, AIResponse, AIModelFactory, ModelConfiguration };
//# sourceMappingURL=BaseAIModel.d.ts.map
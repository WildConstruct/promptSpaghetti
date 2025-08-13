import { PluginContext, ValidationResult, PromptGraph, TargetPrompt } from '../types/index.js';
/**
 * Lifecycle hooks for adaptor initialization, validation, and cleanup
 */
export interface AdaptorLifecycle {
    /**
     * Initialize the adaptor with context and configuration
     */
    initialize(context: PluginContext): Promise<void>;
    /**
     * Validate adaptor health and connectivity
     */
    healthCheck(): Promise<AdaptorHealthStatus>;
    /**
     * Pre-processing hook before validation
     */
    beforeValidate?(graph: PromptGraph): Promise<PromptGraph>;
    /**
     * Post-processing hook after validation
     */
    afterValidate?(graph: PromptGraph, results: ValidationResult[]): Promise<ValidationResult[]>;
    /**
     * Pre-processing hook before transformation
     */
    beforeTransform?(graph: PromptGraph): Promise<PromptGraph>;
    /**
     * Post-processing hook after transformation
     */
    afterTransform?(graph: PromptGraph, result: TargetPrompt): Promise<TargetPrompt>;
    /**
     * Cleanup resources and connections
     */
    destroy(): Promise<void>;
    /**
     * Handle configuration changes at runtime
     */
    onConfigurationChange?(newConfig: Record<string, any>): Promise<void>;
    /**
     * Handle capability refresh requests
     */
    onCapabilityRefresh?(): Promise<void>;
}
/**
 * Health status information for an adaptor
 */
export interface AdaptorHealthStatus {
    healthy: boolean;
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    lastChecked: Date;
    details: AdaptorHealthDetails;
    metrics: AdaptorHealthMetrics;
}
export interface AdaptorHealthDetails {
    connectivity: {
        reachable: boolean;
        latency?: number;
        lastSuccessfulConnection?: Date;
        errorMessage?: string;
    };
    capabilities: {
        available: boolean;
        lastUpdated?: Date;
        errorMessage?: string;
    };
    configuration: {
        valid: boolean;
        errorMessage?: string;
    };
    dependencies: AdaptorDependencyStatus[];
}
export interface AdaptorDependencyStatus {
    name: string;
    type: 'api' | 'service' | 'library' | 'configuration';
    status: 'available' | 'unavailable' | 'degraded';
    version?: string;
    errorMessage?: string;
}
export interface AdaptorHealthMetrics {
    uptime: number;
    requestCount: number;
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
    lastError?: {
        timestamp: Date;
        message: string;
        type: string;
    };
}
/**
 * Pipeline stage interface for modular processing
 */
export interface PipelineStage<TInput, TOutput> {
    readonly name: string;
    readonly order: number;
    readonly required: boolean;
    canHandle(input: TInput): boolean;
    process(input: TInput, context: ProcessingContext): Promise<TOutput>;
    onError?(error: Error, input: TInput, context: ProcessingContext): Promise<TOutput | void>;
}
export interface ProcessingContext {
    adaptorId: string;
    requestId: string;
    startTime: Date;
    metadata: Record<string, any>;
    logger: any;
    metrics: any;
    config: Record<string, any>;
}
/**
 * Validation pipeline stage
 */
export interface ValidationPipelineStage extends PipelineStage<PromptGraph, ValidationResult[]> {
    readonly validationType: 'structural' | 'semantic' | 'platform' | 'performance' | 'security';
}
/**
 * Transformation pipeline stage
 */
export interface TransformationPipelineStage extends PipelineStage<PromptGraph, PartialTargetPrompt> {
    readonly transformationType: 'preprocessing' | 'core' | 'postprocessing' | 'optimization';
}
export interface PartialTargetPrompt {
    content?: string | object;
    parameters?: Record<string, any>;
    metadata?: Record<string, any>;
    format?: string;
}
/**
 * Enhanced adaptor registry for lifecycle management
 */
export declare class AdaptorRegistry {
    private logger;
    private metrics;
    private healthCheckIntervalMs;
    private adaptors;
    private healthStatuses;
    private healthCheckInterval?;
    constructor(logger: any, metrics: any, healthCheckIntervalMs?: number);
    /**
     * Register an adaptor with lifecycle management
     */
    register(id: string, adaptor: AdaptorLifecycle, context: PluginContext): Promise<void>;
    /**
     * Unregister an adaptor and cleanup resources
     */
    unregister(id: string): Promise<void>;
    /**
     * Get all registered adaptors
     */
    getAdaptors(): Map<string, AdaptorLifecycle>;
    /**
     * Get health status for all adaptors
     */
    getHealthStatuses(): Map<string, AdaptorHealthStatus>;
    /**
     * Get health status for specific adaptor
     */
    getHealthStatus(adaptorId: string): AdaptorHealthStatus | undefined;
    /**
     * Force health check for all adaptors
     */
    checkHealth(): Promise<Map<string, AdaptorHealthStatus>>;
    /**
     * Start periodic health checking
     */
    private startHealthChecking;
    /**
     * Stop periodic health checking
     */
    private stopHealthChecking;
    /**
     * Cleanup all adaptors and stop health checking
     */
    destroy(): Promise<void>;
}

import { ModelAdaptor, Platform, Capabilities, PromptGraph, ValidationResult, TargetPrompt, TransformOptions, QualityScore, PluginContext, Logger, CacheInterface, MetricsInterface } from '../types/index.js';
import { AdaptorLifecycle, AdaptorHealthStatus, AdaptorHealthDetails, AdaptorHealthMetrics, ValidationPipelineStage, TransformationPipelineStage } from './AdaptorLifecycle.js';
/**
 * Enhanced base adaptor with lifecycle management and pipeline processing
 */
export declare abstract class EnhancedBaseAdaptor implements ModelAdaptor, AdaptorLifecycle {
    readonly id: string;
    readonly version: string;
    readonly platform: Platform;
    readonly name: string;
    readonly description: string;
    protected logger: Logger;
    protected cache: CacheInterface;
    protected metrics: MetricsInterface;
    protected config: Record<string, any>;
    protected initialized: boolean;
    protected destroyed: boolean;
    protected initializeTime?: Date;
    protected lastHealthCheck?: Date;
    protected healthMetrics: AdaptorHealthMetrics;
    protected validationPipeline: ValidationPipelineStage[];
    protected transformationPipeline: TransformationPipelineStage[];
    constructor(id: string, version: string, platform: Platform, name: string, description: string, context?: PluginContext);
    abstract capabilities(): Promise<Capabilities>;
    protected abstract doValidate(graph: PromptGraph): Promise<ValidationResult[]>;
    protected abstract doTransform(graph: PromptGraph, options?: TransformOptions): Promise<TargetPrompt>;
    protected onInitialize?(): Promise<void>;
    protected onDestroy?(): Promise<void>;
    protected onHealthCheck?(): Promise<Partial<AdaptorHealthDetails>>;
    /**
     * Initialize the adaptor with context and configuration
     */
    initialize(context: PluginContext): Promise<void>;
    /**
     * Validate adaptor health and connectivity
     */
    healthCheck(): Promise<AdaptorHealthStatus>;
    /**
     * Enhanced validation with pipeline processing
     */
    validate(graph: PromptGraph): Promise<ValidationResult[]>;
    /**
     * Enhanced transformation with pipeline processing
     */
    transform(graph: PromptGraph, options?: TransformOptions): Promise<TargetPrompt>;
    /**
     * Estimates the quality of transformation for a given graph
     */
    estimateQuality(graph: PromptGraph): Promise<QualityScore>;
    /**
     * Cleanup resources and connections
     */
    destroy(): Promise<void>;
    /**
     * Handle configuration changes at runtime
     */
    onConfigurationChange(newConfig: Record<string, any>): Promise<void>;
    /**
     * Setup default validation and transformation pipelines
     */
    protected setupDefaultPipelines(): void;
    /**
     * Add a validation pipeline stage
     */
    protected addValidationStage(stage: ValidationPipelineStage): void;
    /**
     * Add a transformation pipeline stage
     */
    protected addTransformationStage(stage: TransformationPipelineStage): void;
    /**
     * Validate current configuration
     */
    protected validateConfiguration(): boolean;
    /**
     * Check adaptor dependencies
     */
    protected checkDependencies(): Promise<any[]>;
    /**
     * Update success metrics
     */
    protected updateSuccessMetrics(duration: number): void;
    /**
     * Update error metrics
     */
    protected updateErrorMetrics(duration: number, error: Error): void;
    protected generateCacheKey(graph: PromptGraph, options?: TransformOptions): string;
    protected hashObject(obj: any): string;
    protected getCacheTTL(): number;
    protected calculateQualityScore(graph: PromptGraph, capabilities: Capabilities, validationResults: ValidationResult[]): QualityScore;
    protected createValidationResult(id: string, type: 'error' | 'warning' | 'info', severity: 'critical' | 'high' | 'medium' | 'low', message: string, options?: {
        description?: string;
        nodeId?: string;
        edgeId?: string;
        autoFixable?: boolean;
        suggestions?: Array<{
            type: string;
            description: string;
        }>;
    }): ValidationResult;
}

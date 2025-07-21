/**
 * Advanced base adaptor with enhanced pipeline and lifecycle management
 * Epic 10.2.1 - Enhanced ModelAdaptor Base Class
 */
import { ValidationResult, PlatformPrompt, AdaptorConfig, TranslationContext } from '../types';
import { BaseAdaptor } from './BaseAdaptor';
import { EventEmitter } from 'events';
/**
 * Pipeline stage result interface
 */
export interface PipelineStageResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: Error;
    metadata?: Record<string, unknown>;
    duration?: number;
}
/**
 * Pipeline stage interface
 */
export interface PipelineStage<TInput = unknown, TOutput = unknown> {
    name: string;
    execute(input: TInput, context: TranslationContext): Promise<PipelineStageResult<TOutput>>;
    shouldSkip?(input: TInput, context: TranslationContext): Promise<boolean>;
    onError?(error: Error, input: TInput, context: TranslationContext): Promise<PipelineStageResult<TOutput>>;
}
/**
 * Enhanced adaptor events
 */
export interface AdvancedAdaptorEvents {
    'pipeline:start': (context: TranslationContext) => void;
    'pipeline:stage': (stage: string, result: PipelineStageResult, context: TranslationContext) => void;
    'pipeline:complete': (result: PlatformPrompt, context: TranslationContext) => void;
    'pipeline:error': (error: Error, context: TranslationContext) => void;
    'validation:start': (graph: any, context: TranslationContext) => void;
    'validation:complete': (result: ValidationResult, context: TranslationContext) => void;
    'optimization:applied': (optimization: string, context: TranslationContext) => void;
}
/**
 * Advanced configuration interface
 */
export interface AdvancedAdaptorConfig extends AdaptorConfig {
    /** Pipeline configuration */
    pipeline?: {
        /** Skip validation stage */
        skipValidation?: boolean;
        /** Skip optimization stage */
        skipOptimization?: boolean;
        /** Custom stage timeouts */
        stageTimeouts?: Record<string, number>;
        /** Retry configuration */
        retries?: {
            maxAttempts?: number;
            backoffMs?: number;
            retryableErrors?: string[];
        };
    };
    /** Performance monitoring */
    monitoring?: {
        /** Enable detailed timing */
        enableTiming?: boolean;
        /** Enable memory tracking */
        enableMemoryTracking?: boolean;
        /** Enable event emission */
        enableEvents?: boolean;
    };
}
/**
 * Enhanced base adaptor with advanced pipeline and lifecycle management
 */
export declare abstract class AdvancedBaseAdaptor extends BaseAdaptor {
    protected eventEmitter: EventEmitter;
    protected pipeline: PipelineStage[];
    protected stats: {
        translations: number;
        validations: number;
        errors: number;
        totalDuration: number;
        avgDuration: number;
    };
    constructor();
    /**
     * Enhanced transform with full pipeline execution
     */
    transform(graph: any, config?: AdvancedAdaptorConfig): Promise<PlatformPrompt>;
    /**
     * Enhanced validation with detailed reporting
     */
    validate(graph: any, config?: AdvancedAdaptorConfig): Promise<ValidationResult>;
    /**
     * Initialize the translation pipeline
     */
    protected initializePipeline(): void;
    /**
     * Create preprocessing pipeline stage
     */
    protected createPreprocessingStage(): PipelineStage;
    /**
     * Create validation pipeline stage
     */
    protected createValidationStage(): PipelineStage;
    /**
     * Create optimization pipeline stage
     */
    protected createOptimizationStage(): PipelineStage;
    /**
     * Create transformation pipeline stage
     */
    protected createTransformationStage(): PipelineStage;
    /**
     * Create postprocessing pipeline stage
     */
    protected createPostprocessingStage(): PipelineStage;
    /**
     * Create translation context
     */
    protected createTranslationContext(graph: any, config?: AdvancedAdaptorConfig): TranslationContext;
    /**
     * Execute a pipeline stage with error handling and retries
     */
    protected executeStage(stage: PipelineStage, data: any, context: TranslationContext): Promise<PipelineStageResult>;
    /**
     * Check if stage should be skipped
     */
    protected shouldSkipStage(stage: PipelineStage, data: any, context: TranslationContext): Promise<boolean>;
    /**
     * Check if error is retryable
     */
    protected isRetryableError(error: Error, context: TranslationContext): boolean;
    /**
     * Delay utility for retries
     */
    protected delay(ms: number): Promise<void>;
    /**
     * Finalize translation result with metadata
     */
    protected finalizeTranslation(result: PlatformPrompt, context: TranslationContext): Promise<PlatformPrompt>;
    /**
     * Advanced graph structure validation
     */
    protected validateGraphStructure(graph: any): Promise<ValidationResult>;
    /**
     * Validate platform-specific constraints
     */
    protected validatePlatformConstraints(graph: any, config?: AdvancedAdaptorConfig): Promise<ValidationResult>;
    /**
     * Validate content quality and coherence
     */
    protected validateContentQuality(graph: any, config?: AdvancedAdaptorConfig): Promise<ValidationResult>;
    /**
     * Validate performance impact
     */
    protected validatePerformanceImpact(graph: any, config?: AdvancedAdaptorConfig): Promise<ValidationResult>;
    /**
     * Preprocess graph before translation
     */
    protected preprocessGraph(graph: any, context: TranslationContext): Promise<any>;
    /**
     * Apply optimizations to the graph
     */
    protected applyOptimizations(graph: any, context: TranslationContext): Promise<string[]>;
    /**
     * Postprocess translation result
     */
    protected postprocessResult(result: any, context: TranslationContext): Promise<any>;
    /**
     * Emit event if monitoring is enabled
     */
    protected emitEvent(event: string, ...args: any[]): void;
    /**
     * Update performance statistics
     */
    protected updateStats(duration: number, isError: boolean): void;
    /**
     * Get adaptor statistics
     */
    getStatistics(): typeof this.stats;
    /**
     * Add event listener
     */
    on(event: string, listener: (...args: any[]) => void): void;
    /**
     * Remove event listener
     */
    off(event: string, listener: (...args: any[]) => void): void;
    protected abstract isValidGraphStructure(graph: any): boolean;
    protected abstract hasCycles(graph: any): boolean;
    protected abstract hasIncoherentContent(content: string): boolean;
    protected abstract estimateComplexity(graph: any): number;
    protected abstract normalizeGraphStructure(graph: any): any;
    protected abstract applyPreprocessingOptimizations(graph: any, context: TranslationContext): Promise<any>;
    protected abstract canOptimizeContent(graph: any): boolean;
    protected abstract canOptimizeStructure(graph: any): boolean;
    protected abstract applyPostprocessingFilters(result: any, context: TranslationContext): any;
    protected abstract validateFinalResult(result: any): boolean;
}
//# sourceMappingURL=AdvancedBaseAdaptor.d.ts.map
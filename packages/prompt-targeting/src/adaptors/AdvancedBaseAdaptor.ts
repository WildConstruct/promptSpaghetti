/**
 * Advanced base adaptor with enhanced pipeline and lifecycle management
 * Epic 10.2.1 - Enhanced ModelAdaptor Base Class
 */

import {
  ModelAdaptor,
  PlatformCapabilities,
  ValidationResult,
  PlatformPrompt,
  AdaptorConfig,
  TranslationContext,
  AdaptorError,
  ValidationException,
  TranslationError
} from '../types';
import { BaseAdaptor } from './BaseAdaptor';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

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
export abstract class AdvancedBaseAdaptor extends BaseAdaptor {
  protected eventEmitter: EventEmitter;
  protected pipeline: PipelineStage[];
  protected advancedConfig: AdvancedAdaptorConfig = {};
  protected stats: {
    translations: number;
    validations: number;
    errors: number;
    totalDuration: number;
    avgDuration: number;
  };

  constructor() {
    super();
    this.eventEmitter = new EventEmitter();
    this.pipeline = [];
    this.stats = {
      translations: 0,
      validations: 0,
      errors: 0,
      totalDuration: 0,
      avgDuration: 0
    };
    this.initializePipeline();
  }

  /**
   * Enhanced transform with full pipeline execution
   */
  public async transform(graph: any, config?: AdvancedAdaptorConfig): Promise<PlatformPrompt> {
    this.advancedConfig = config || {};
    const context = this.createTranslationContext(graph, config);
    const startTime = Date.now();

    try {
      this.emitEvent('pipeline:start', context);
      
      // Execute pipeline stages
      let currentData = graph;
      for (const stage of this.pipeline) {
        if (await this.shouldSkipStage(stage, currentData, context)) {
          continue;
        }

        const stageResult = await this.executeStage(stage, currentData, context);
        
        this.emitEvent('pipeline:stage', stage.name, stageResult, context);
        
        if (!stageResult.success) {
          throw new TranslationError(
            `Pipeline stage '${stage.name}' failed: ${stageResult.error?.message}`,
            this.platforms[0],
            'PIPELINE_STAGE_FAILED',
            { stage: stage.name, error: stageResult.error }
          );
        }

        currentData = stageResult.data || currentData;
      }

      // Finalize result
      const result = await this.finalizeTranslation(currentData as PlatformPrompt, context);
      
      // Update statistics
      const duration = Date.now() - startTime;
      this.updateStats(duration, false);

      this.emitEvent('pipeline:complete', result, context);
      
      return result;
    } catch (error) {
      this.updateStats(Date.now() - startTime, true);
      this.emitEvent('pipeline:error', error as Error, context);
      throw error;
    }
  }

  /**
   * Enhanced validation with detailed reporting
   */
  public async validate(graph: any, config?: AdvancedAdaptorConfig): Promise<ValidationResult> {
    const context = this.createTranslationContext(graph, config);
    const startTime = Date.now();

    try {
      this.emitEvent('validation:start', graph, context);
      
      // Multi-stage validation
      const validationStages = [
        () => this.validateGraphStructure(graph),
        () => this.validatePlatformConstraints(graph, config),
        () => this.validateContentQuality(graph, config),
        () => this.validatePerformanceImpact(graph, config)
      ];

      const results: ValidationResult[] = [];
      
      for (const stage of validationStages) {
        try {
          const result = await stage();
          results.push(result);
        } catch (error) {
          results.push({
            valid: false,
            errors: [{
              code: 'VALIDATION_STAGE_ERROR',
              message: `Validation stage failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              severity: 'error'
            }],
            warnings: [],
            compatibilityScore: 0
          });
        }
      }

      // Combine validation results
      const finalResult = this.combineValidationResults(...results);
      
      // Update statistics
      this.stats.validations++;
      
      this.emitEvent('validation:complete', finalResult, context);
      
      return finalResult;
    } catch (error) {
      this.stats.errors++;
      throw new ValidationException(
        `Enhanced validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [],
        'ENHANCED_VALIDATION_FAILED'
      );
    }
  }

  /**
   * Initialize the translation pipeline
   */
  protected initializePipeline(): void {
    this.pipeline = [
      this.createPreprocessingStage(),
      this.createValidationStage(),
      this.createOptimizationStage(),
      this.createTransformationStage(),
      this.createPostprocessingStage()
    ];
  }

  /**
   * Create preprocessing pipeline stage
   */
  protected createPreprocessingStage(): PipelineStage {
    return {
      name: 'preprocessing',
      execute: async (graph: any, context: TranslationContext) => {
        const startTime = Date.now();
        try {
          const preprocessed = await this.preprocessGraph(graph, context);
          return {
            success: true,
            data: preprocessed,
            duration: Date.now() - startTime
          };
        } catch (error) {
          return {
            success: false,
            error: error as Error,
            duration: Date.now() - startTime
          };
        }
      }
    };
  }

  /**
   * Create validation pipeline stage
   */
  protected createValidationStage(): PipelineStage {
    return {
      name: 'validation',
      execute: async (graph: any, context: TranslationContext) => {
        const startTime = Date.now();
        try {
          const validation = await this.performPlatformValidation(graph, context.config);
          
          if (!validation.valid) {
            return {
              success: false,
              error: new ValidationException('Graph validation failed', validation.errors),
              data: validation,
              duration: Date.now() - startTime
            };
          }

          return {
            success: true,
            data: { graph, validation },
            duration: Date.now() - startTime
          };
        } catch (error) {
          return {
            success: false,
            error: error as Error,
            duration: Date.now() - startTime
          };
        }
      },
      shouldSkip: async (graph: any, context: TranslationContext) => {
        return context.config?.pipeline?.skipValidation === true;
      }
    };
  }

  /**
   * Create optimization pipeline stage
   */
  protected createOptimizationStage(): PipelineStage {
    return {
      name: 'optimization',
      execute: async (data: any, context: TranslationContext) => {
        const startTime = Date.now();
        try {
          const { graph } = data;
          const optimizations = await this.applyOptimizations(graph, context);
          
          // Emit optimization events
          optimizations.forEach(opt => {
            this.emitEvent('optimization:applied', opt, context);
          });

          return {
            success: true,
            data: { ...data, optimizations },
            duration: Date.now() - startTime
          };
        } catch (error) {
          return {
            success: false,
            error: error as Error,
            duration: Date.now() - startTime
          };
        }
      },
      shouldSkip: async (data: any, context: TranslationContext) => {
        return context.config?.pipeline?.skipOptimization === true;
      }
    };
  }

  /**
   * Create transformation pipeline stage
   */
  protected createTransformationStage(): PipelineStage {
    return {
      name: 'transformation',
      execute: async (data: any, context: TranslationContext) => {
        const startTime = Date.now();
        try {
          const { graph } = data;
          const result = await this.performTransformation(graph, context.config);
          
          return {
            success: true,
            data: result,
            duration: Date.now() - startTime
          };
        } catch (error) {
          return {
            success: false,
            error: error as Error,
            duration: Date.now() - startTime
          };
        }
      }
    };
  }

  /**
   * Create postprocessing pipeline stage
   */
  protected createPostprocessingStage(): PipelineStage {
    return {
      name: 'postprocessing',
      execute: async (result: any, context: TranslationContext) => {
        const startTime = Date.now();
        try {
          const postprocessed = await this.postprocessResult(result, context);
          return {
            success: true,
            data: postprocessed,
            duration: Date.now() - startTime
          };
        } catch (error) {
          return {
            success: false,
            error: error as Error,
            duration: Date.now() - startTime
          };
        }
      }
    };
  }

  /**
   * Create translation context
   */
  protected createTranslationContext(graph: any, config?: AdvancedAdaptorConfig): TranslationContext {
    return {
      sourceGraph: graph,
      targetPlatform: this.platforms[0],
      config: config || {},
      metadata: {
        startTime: new Date(),
        sessionId: uuidv4(),
        adaptorId: this.id,
        adaptorVersion: this.version
      }
    };
  }

  /**
   * Execute a pipeline stage with error handling and retries
   */
  protected async executeStage(
    stage: PipelineStage,
    data: any,
    context: TranslationContext
  ): Promise<PipelineStageResult> {
    const retries = context.config?.pipeline?.retries;
    const maxAttempts = (typeof retries === 'object' && retries !== null) ? (retries.maxAttempts || 1) : (typeof retries === 'number' ? retries : 1);
    const backoffMs = (typeof retries === 'object' && retries !== null) ? (retries.backoffMs || 100) : 100;
    
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await stage.execute(data, context);
        
        if (result.success) {
          return result;
        }
        
        lastError = result.error;
        
        // Check if error is retryable
        if (attempt < maxAttempts && result.error && this.isRetryableError(result.error, context)) {
          await this.delay(backoffMs * attempt);
          continue;
        }
        
        // Handle error through stage error handler
        if (stage.onError) {
          return await stage.onError(result.error!, data, context);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxAttempts && this.isRetryableError(error as Error, context)) {
          await this.delay(backoffMs * attempt);
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError || new Error(`Stage ${stage.name} failed after ${maxAttempts} attempts`);
  }

  /**
   * Check if stage should be skipped
   */
  protected async shouldSkipStage(
    stage: PipelineStage,
    data: any,
    context: TranslationContext
  ): Promise<boolean> {
    if (stage.shouldSkip) {
      return await stage.shouldSkip(data, context);
    }
    return false;
  }

  /**
   * Check if error is retryable
   */
  protected isRetryableError(error: Error, context: TranslationContext): boolean {
    const retries = context.config?.pipeline?.retries;
    const retryableErrors = (typeof retries === 'object' && retries !== null) ? (retries.retryableErrors || [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'RATE_LIMIT_ERROR'
    ]) : [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'RATE_LIMIT_ERROR'
    ];
    
    return retryableErrors.some((code: string) => error.message.includes(code));
  }

  /**
   * Delay utility for retries
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Finalize translation result with metadata
   */
  protected async finalizeTranslation(
    result: PlatformPrompt,
    context: TranslationContext
  ): Promise<PlatformPrompt> {
    const sourceHash = this.generateGraphHash(context.sourceGraph);
    const optimizations = await this.getAppliedOptimizations(context.sourceGraph, context.config);
    
    return {
      ...result,
      metadata: {
        ...result.metadata,
        sourceHash,
        timestamp: new Date(),
        qualityScore: result.metadata?.qualityScore || 0.8,
        optimizations,
        pipeline: {
          stages: this.pipeline.map(stage => stage.name),
          version: this.version
        }
      }
    };
  }

  /**
   * Advanced graph structure validation
   */
  protected async validateGraphStructure(graph: any): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Deep structure validation
    if (!this.isValidGraphStructure(graph)) {
      errors.push({
        code: 'INVALID_GRAPH_STRUCTURE',
        message: 'Graph structure is invalid or corrupted',
        severity: 'error'
      });
    }

    // Cycle detection
    if (this.hasCycles(graph)) {
      errors.push({
        code: 'GRAPH_HAS_CYCLES',
        message: 'Graph contains cycles which may cause infinite loops',
        severity: 'error'
      });
    }

    // Performance warnings
    if (graph.nodes && graph.nodes.length > 100) {
      warnings.push({
        code: 'LARGE_GRAPH',
        message: 'Graph is very large and may impact performance',
        optimization: 'Consider breaking into smaller subgraphs'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      compatibilityScore: errors.length === 0 ? 0.9 : 0.3
    };
  }

  /**
   * Validate platform-specific constraints
   */
  protected async validatePlatformConstraints(
    graph: any,
    config?: AdvancedAdaptorConfig
  ): Promise<ValidationResult> {
    // Delegate to existing platform validation
    return this.performPlatformValidation(graph, config);
  }

  /**
   * Validate content quality and coherence
   */
  protected async validateContentQuality(
    graph: any,
    config?: AdvancedAdaptorConfig
  ): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    const textContent = this.extractTextContent(graph);
    
    // Content length validation
    if (textContent.length === 0) {
      warnings.push({
        code: 'EMPTY_CONTENT',
        message: 'Graph produces no text content',
        optimization: 'Add content nodes to generate meaningful output'
      });
    }

    // Content coherence check (basic)
    if (this.hasIncoherentContent(textContent)) {
      warnings.push({
        code: 'INCOHERENT_CONTENT',
        message: 'Content may be incoherent or contradictory',
        optimization: 'Review node connections and content flow'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      compatibilityScore: 0.8
    };
  }

  /**
   * Validate performance impact
   */
  protected async validatePerformanceImpact(
    graph: any,
    config?: AdvancedAdaptorConfig
  ): Promise<ValidationResult> {
    const warnings: any[] = [];

    // Estimate processing complexity
    const complexity = this.estimateComplexity(graph);
    
    if (complexity > 100) {
      warnings.push({
        code: 'HIGH_COMPLEXITY',
        message: 'Graph has high processing complexity',
        optimization: 'Simplify graph structure or use caching'
      });
    }

    return {
      valid: true,
      errors: [],
      warnings,
      compatibilityScore: complexity > 100 ? 0.7 : 0.9
    };
  }

  /**
   * Preprocess graph before translation
   */
  protected async preprocessGraph(graph: any, context: TranslationContext): Promise<any> {
    // Normalize node structure
    const normalized = this.normalizeGraphStructure(graph);
    
    // Apply preprocessing optimizations
    const optimized = await this.applyPreprocessingOptimizations(normalized, context);
    
    return optimized;
  }

  /**
   * Apply optimizations to the graph
   */
  protected async applyOptimizations(graph: any, context: TranslationContext): Promise<string[]> {
    const optimizations: string[] = [];
    
    // Content optimization
    if (this.canOptimizeContent(graph)) {
      optimizations.push('content-optimization');
    }
    
    // Structure optimization
    if (this.canOptimizeStructure(graph)) {
      optimizations.push('structure-optimization');
    }
    
    // Platform-specific optimizations
    const platformOpts = await this.getPlatformOptimizations(graph, context.config);
    optimizations.push(...platformOpts);
    
    return optimizations;
  }

  /**
   * Postprocess translation result
   */
  protected async postprocessResult(result: any, context: TranslationContext): Promise<any> {
    // Apply post-processing filters
    const filtered = this.applyPostprocessingFilters(result, context);
    
    // Validate final result
    const isValid = this.validateFinalResult(filtered);
    if (!isValid) {
      throw new TranslationError(
        'Postprocessing validation failed',
        context.targetPlatform,
        'POSTPROCESSING_VALIDATION_FAILED'
      );
    }
    
    return filtered;
  }

  /**
   * Emit event if monitoring is enabled
   */
  protected emitEvent(event: string, ...args: any[]): void {
    if (this.advancedConfig.monitoring?.enableEvents !== false) {
      this.eventEmitter.emit(event, ...args);
    }
  }

  /**
   * Update performance statistics
   */
  protected updateStats(duration: number, isError: boolean): void {
    if (isError) {
      this.stats.errors++;
    } else {
      this.stats.translations++;
    }
    
    this.stats.totalDuration += duration;
    this.stats.avgDuration = this.stats.totalDuration / (this.stats.translations + this.stats.errors);
  }

  /**
   * Get adaptor statistics
   */
  public getStatistics(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Add event listener
   */
  public on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  public off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }

  // Abstract methods for subclasses to implement
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
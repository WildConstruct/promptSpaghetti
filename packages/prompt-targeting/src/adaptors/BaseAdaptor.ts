/**
 * Base adaptor implementation for platform-specific prompt translation
 * Epic 10.1.2 - Common Interface Definition
 */

import {
  ModelAdaptor,
  PlatformCapabilities,
  ValidationResult,
  PlatformPrompt,
  AdaptorConfig,
  AdaptorError,
  ValidationException,
  TranslationError
} from '../types';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Abstract base class for all platform adaptors
 * Provides common functionality and enforces interface compliance
 */
export abstract class BaseAdaptor implements ModelAdaptor {
  public abstract readonly id: string;
  public abstract readonly version: string;
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly platforms: string[];

  protected initialized: boolean = false;
  protected config: Record<string, unknown> = {};
  protected logger: Console = console;

  /**
   * Initialize the adaptor with configuration
   */
  public async initialize(config: Record<string, unknown> = {}): Promise<void> {
    try {
      this.config = { ...this.getDefaultConfig(), ...config };
      await this.onInitialize();
      this.initialized = true;
      this.logger.log(`Adaptor ${this.id} v${this.version} initialized successfully`);
    } catch (error) {
      throw new AdaptorError(
        `Failed to initialize adaptor ${this.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.id,
        'INITIALIZATION_ERROR',
        { config, error }
      );
    }
  }

  /**
   * Clean up adaptor resources
   */
  public async cleanup(): Promise<void> {
    try {
      await this.onCleanup();
      this.initialized = false;
      this.logger.log(`Adaptor ${this.id} cleaned up successfully`);
    } catch (error) {
      this.logger.error(`Error cleaning up adaptor ${this.id}:`, error);
    }
  }

  /**
   * Get platform capabilities
   */
  public abstract capabilities(): Promise<PlatformCapabilities>;

  /**
   * Validate a prompt graph for this platform
   */
  public async validate(graph: any, config?: AdaptorConfig): Promise<ValidationResult> {
    this.ensureInitialized();
    
    try {
      // Base validation checks
      const baseValidation = await this.performBaseValidation(graph, config);
      
      // Platform-specific validation
      const platformValidation = await this.performPlatformValidation(graph, config);
      
      // Combine results
      return this.combineValidationResults(baseValidation, platformValidation);
    } catch (error) {
      throw new ValidationException(
        `Validation failed for adaptor ${this.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [],
        'VALIDATION_FAILED'
      );
    }
  }

  /**
   * Transform a prompt graph to platform-specific format
   */
  public async transform(graph: any, config?: AdaptorConfig): Promise<PlatformPrompt> {
    this.ensureInitialized();
    
    try {
      // Validate first
      const validation = await this.validate(graph, config);
      if (!validation.valid) {
        throw new ValidationException(
          'Graph validation failed before transformation',
          validation.errors,
          'PRE_TRANSFORM_VALIDATION_FAILED'
        );
      }

      // Perform transformation
      const startTime = Date.now();
      const result = await this.performTransformation(graph, config);
      const transformTime = Date.now() - startTime;

      // Add metadata
      const sourceHash = this.generateGraphHash(graph);
      const platformPrompt: PlatformPrompt = {
        ...result,
        metadata: {
          sourceHash,
          timestamp: new Date(),
          qualityScore: validation.compatibilityScore,
          optimizations: await this.getAppliedOptimizations(graph, config),
          transformTime
        }
      };

      this.logger.log(`Transform completed for ${this.id} in ${transformTime}ms`);
      return platformPrompt;
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new TranslationError(
        `Transformation failed for adaptor ${this.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.platforms[0],
        'TRANSFORMATION_FAILED',
        { graph, config, error }
      );
    }
  }

  /**
   * Get default configuration for this adaptor
   */
  protected getDefaultConfig(): Record<string, unknown> {
    return {
      enableOptimizations: true,
      qualityPreference: 0.7,
      stylePreference: 'default'
    };
  }

  /**
   * Lifecycle hook for initialization
   */
  protected async onInitialize(): Promise<void> {
    // Override in subclasses
  }

  /**
   * Lifecycle hook for cleanup
   */
  protected async onCleanup(): Promise<void> {
    // Override in subclasses
  }

  /**
   * Platform-specific validation implementation
   */
  protected abstract performPlatformValidation(
    graph: any,
    config?: AdaptorConfig
  ): Promise<ValidationResult>;

  /**
   * Platform-specific transformation implementation
   */
  protected abstract performTransformation(
    graph: any,
    config?: AdaptorConfig
  ): Promise<Omit<PlatformPrompt, 'metadata'>>;

  /**
   * Base validation checks common to all platforms
   */
  protected async performBaseValidation(
    graph: any,
    config?: AdaptorConfig
  ): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Check if graph exists and has basic structure
    if (!graph) {
      errors.push({
        code: 'MISSING_GRAPH',
        message: 'No graph provided for validation',
        severity: 'error' as const
      });
      return { valid: false, errors, warnings, compatibilityScore: 0 };
    }

    // Check for required graph properties
    if (!graph.nodes || !Array.isArray(graph.nodes)) {
      errors.push({
        code: 'INVALID_GRAPH_STRUCTURE',
        message: 'Graph must contain a nodes array',
        severity: 'error' as const
      });
    }

    if (!graph.edges || !Array.isArray(graph.edges)) {
      errors.push({
        code: 'INVALID_GRAPH_STRUCTURE',
        message: 'Graph must contain an edges array',
        severity: 'error' as const
      });
    }

    // Check for empty graph
    if (graph.nodes && graph.nodes.length === 0) {
      warnings.push({
        code: 'EMPTY_GRAPH',
        message: 'Graph contains no nodes',
        optimization: 'Add content nodes to generate meaningful output'
      });
    }

    // Calculate base compatibility score
    const errorWeight = 0.5;
    const warningWeight = 0.1;
    const maxScore = 1.0;
    
    const errorPenalty = errors.length * errorWeight;
    const warningPenalty = warnings.length * warningWeight;
    const compatibilityScore = Math.max(0, maxScore - errorPenalty - warningPenalty);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      compatibilityScore
    };
  }

  /**
   * Combine multiple validation results
   */
  protected combineValidationResults(...results: ValidationResult[]): ValidationResult {
    const allErrors = results.flatMap(r => r.errors);
    const allWarnings = results.flatMap(r => r.warnings);
    const avgCompatibilityScore = results.reduce((sum, r) => sum + r.compatibilityScore, 0) / results.length;

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      compatibilityScore: avgCompatibilityScore
    };
  }

  /**
   * Generate a hash for the source graph
   */
  protected generateGraphHash(graph: any): string {
    const graphString = JSON.stringify(graph, Object.keys(graph).sort());
    return createHash('sha256').update(graphString).digest('hex').substring(0, 16);
  }

  /**
   * Get list of optimizations applied during transformation
   */
  protected async getAppliedOptimizations(
    graph: any,
    config?: AdaptorConfig
  ): Promise<string[]> {
    const optimizations: string[] = [];
    
    if (config?.enableOptimizations !== false) {
      optimizations.push('parameter-normalization');
      
      // Add platform-specific optimizations
      const platformOptimizations = await this.getPlatformOptimizations(graph, config);
      optimizations.push(...platformOptimizations);
    }

    return optimizations;
  }

  /**
   * Get platform-specific optimizations (override in subclasses)
   */
  protected async getPlatformOptimizations(
    graph: any,
    config?: AdaptorConfig
  ): Promise<string[]> {
    return [];
  }

  /**
   * Ensure adaptor is initialized before operations
   */
  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new AdaptorError(
        `Adaptor ${this.id} must be initialized before use`,
        this.id,
        'NOT_INITIALIZED'
      );
    }
  }

  /**
   * Normalize parameter value to platform range
   */
  protected normalizeParameter(
    value: number,
    sourceRange: [number, number],
    targetRange: [number, number]
  ): number {
    const [sourceMin, sourceMax] = sourceRange;
    const [targetMin, targetMax] = targetRange;
    
    // Clamp to source range
    const clampedValue = Math.max(sourceMin, Math.min(sourceMax, value));
    
    // Normalize to 0-1
    const normalized = (clampedValue - sourceMin) / (sourceMax - sourceMin);
    
    // Scale to target range
    return targetMin + normalized * (targetMax - targetMin);
  }

  /**
   * Extract text content from graph nodes
   */
  protected extractTextContent(graph: any): string {
    if (!graph.nodes || !Array.isArray(graph.nodes)) {
      return '';
    }

    return graph.nodes
      .filter((node: any) => node.data?.text || node.data?.content)
      .map((node: any) => node.data.text || node.data.content)
      .join(' ')
      .trim();
  }

  /**
   * Extract style information from graph
   */
  protected extractStyleInfo(graph: any): Record<string, unknown> {
    const style: Record<string, unknown> = {};
    
    if (!graph.nodes || !Array.isArray(graph.nodes)) {
      return style;
    }

    // Look for style-related nodes
    graph.nodes.forEach((node: any) => {
      if (node.type === 'style' || node.data?.style) {
        Object.assign(style, node.data.style || {});
      }
    });

    return style;
  }

  /**
   * Create a session ID for tracking
   */
  protected createSessionId(): string {
    return uuidv4();
  }

  /**
   * Log performance metrics
   */
  protected logPerformance(operation: string, startTime: number, metadata?: Record<string, unknown>): void {
    const duration = Date.now() - startTime;
    this.logger.log(`[${this.id}] ${operation} completed in ${duration}ms`, metadata);
  }
}
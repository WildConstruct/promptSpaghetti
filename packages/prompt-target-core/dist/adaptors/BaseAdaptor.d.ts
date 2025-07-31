import {
  ModelAdaptor,
  Platform,
  Capabilities,
  PromptGraph,
  ValidationResult,
  TargetPrompt,
  TransformOptions,
  QualityScore,
  PluginContext,
  Logger,
  CacheInterface,
  MetricsInterface,
} from '../types/index.js';
/**
 * Abstract base class for all model adaptors.
 * Provides common functionality and enforces the adaptor interface.
 */
export declare abstract class BaseAdaptor implements ModelAdaptor {
  readonly id: string;
  readonly version: string;
  readonly platform: Platform;
  readonly name: string;
  readonly description: string;
  protected logger: Logger;
  protected cache: CacheInterface;
  protected metrics: MetricsInterface;
  protected config: Record<string, any>;
  constructor(
    id: string,
    version: string,
    platform: Platform,
    name: string,
    description: string,
    context: PluginContext
  );
  abstract capabilities(): Promise<Capabilities>;
  protected abstract doTransform(graph: PromptGraph, options?: TransformOptions): Promise<TargetPrompt>;
  protected abstract doValidate(graph: PromptGraph): Promise<ValidationResult[]>;
  /**
   * Validates a prompt graph for compatibility with this adaptor
   */
  validate(graph: PromptGraph): Promise<ValidationResult[]>;
  /**
   * Transforms a prompt graph into platform-specific format
   */
  transform(graph: PromptGraph, options?: TransformOptions): Promise<TargetPrompt>;
  /**
   * Estimates the quality of transformation for a given graph
   */
  estimateQuality(graph: PromptGraph): Promise<QualityScore>;
  /**
   * Basic structural validation common to all adaptors
   */
  protected validateStructure(graph: PromptGraph): Promise<ValidationResult[]>;
  /**
   * Calculate quality score based on graph, capabilities, and validation results
   */
  protected calculateQualityScore(
    graph: PromptGraph,
    capabilities: Capabilities,
    validationResults: ValidationResult[]
  ): QualityScore;
  /**
   * Generate cache key for a graph and options combination
   */
  protected generateCacheKey(graph: PromptGraph, options?: TransformOptions): string;
  /**
   * Simple object hashing for cache keys
   */
  protected hashObject(obj: any): string;
  /**
   * Get cache TTL for this adaptor's results
   */
  protected getCacheTTL(): number;
  /**
   * Helper to create validation results
   */
  protected createValidationResult(
    id: string,
    type: 'error' | 'warning' | 'info',
    severity: 'critical' | 'high' | 'medium' | 'low',
    message: string,
    options?: {
      description?: string;
      nodeId?: string;
      edgeId?: string;
      autoFixable?: boolean;
      suggestions?: Array<{
        type: 'fix' | 'alternative' | 'workaround';
        description: string;
      }>;
    }
  ): ValidationResult;
}

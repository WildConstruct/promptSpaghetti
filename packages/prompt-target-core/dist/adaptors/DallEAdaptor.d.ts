import {
  Capabilities,
  PromptGraph,
  ValidationResult,
  TargetPrompt,
  TransformOptions,
  PluginContext,
} from '../types/index.js';
import { BaseAdaptor } from './BaseAdaptor.js';
/**
 * DALL-E adaptor for text-to-image prompt translation
 * Supports DALL-E 3 and DALL-E 2 API parameters
 */
export declare class DallEAdaptor extends BaseAdaptor {
  private readonly supportedSizes;
  private readonly supportedQualities;
  private readonly supportedStyles;
  private readonly supportedModels;
  constructor(context: PluginContext);
  capabilities(): Promise<Capabilities>;
  protected doValidate(graph: PromptGraph): Promise<ValidationResult[]>;
  protected doTransform(graph: PromptGraph, options?: TransformOptions): Promise<TargetPrompt>;
  /**
   * Process the graph to extract content and build prompt
   */
  private processGraph;
  /**
   * Process a single node and its dependencies
   */
  private processNode;
  /**
   * Optimize prompt for DALL-E
   */
  private optimizeForDallE;
  /**
   * Check for potential content policy issues
   */
  private checkContentPolicy;
  /**
   * Build API parameters for OpenAI DALL-E API
   */
  private buildApiParameters;
  /**
   * Estimate prompt length
   */
  private estimatePromptLength;
  /**
   * Extract parameters from graph nodes
   */
  private extractParameters;
  /**
   * Select weighted option (simplified implementation)
   */
  private selectWeightedOption;
  /**
   * Generate a unique translation ID
   */
  private generateTranslationId;
  /**
   * Validate parameter value against specification
   */
  private validateParameter;
  /**
   * Normalize parameter value according to specification
   */
  private normalizeParameter;
}

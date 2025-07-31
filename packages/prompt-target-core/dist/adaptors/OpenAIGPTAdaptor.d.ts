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
 * OpenAI GPT adaptor for text-to-text prompt translation
 * Supports GPT-3.5 and GPT-4 models with chat completion format
 */
export declare class OpenAIGPTAdaptor extends BaseAdaptor {
  constructor(context: PluginContext);
  capabilities(): Promise<Capabilities>;
  protected doValidate(graph: PromptGraph): Promise<ValidationResult[]>;
  protected doTransform(graph: PromptGraph, options?: TransformOptions): Promise<TargetPrompt>;
  /**
   * Process the graph to extract content and build messages
   */
  private processGraph;
  /**
   * Process a single node and its dependencies
   */
  private processNode;
  /**
   * Extract parameters from graph nodes
   */
  private extractParameters;
  /**
   * Validate a parameter value against its specification
   */
  private validateParameter;
  /**
   * Normalize parameter value according to its specification
   */
  private normalizeParameter;
  /**
   * Generate a unique translation ID
   */
  private generateTranslationId;
}

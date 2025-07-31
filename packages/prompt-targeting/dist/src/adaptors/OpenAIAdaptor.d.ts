/**
 * OpenAI GPT adaptor implementation
 * Epic 10.1.3 - Mapping Strategy Development
 */
import { TextToTextAdaptor, PlatformCapabilities, ValidationResult, PlatformPrompt, AdaptorConfig } from '../types';
import { BaseAdaptor } from './BaseAdaptor';
/**
 * OpenAI-specific configuration
 */
export interface OpenAIConfig {
  /** API key for OpenAI */
  apiKey?: string;
  /** Model to use (gpt-3.5-turbo, gpt-4, etc.) */
  model?: string;
  /** Organization ID */
  organization?: string;
  /** Base URL for API requests */
  baseURL?: string;
}
/**
 * OpenAI adaptor for text-to-text generation
 */
export declare class OpenAIAdaptor extends BaseAdaptor implements TextToTextAdaptor {
  readonly id = 'openai-gpt';
  readonly version = '1.0.0';
  readonly name = 'OpenAI GPT';
  readonly description = 'OpenAI GPT models for text generation';
  readonly platforms: string[];
  private openaiConfig;
  /**
   * Initialize with OpenAI-specific configuration
   */
  protected onInitialize(): Promise<void>;
  /**
   * Get platform capabilities
   */
  capabilities(): Promise<PlatformCapabilities>;
  /**
   * Get text generation specific capabilities
   */
  textCapabilities(): Promise<{
    maxContextLength: number;
    supportsChatFormat: boolean;
    supportsSystemMessages: boolean;
    supportsFunctionCalling: boolean;
    temperatureRange: [number, number];
    topPRange: [number, number];
  }>;
  /**
   * Platform-specific validation
   */
  protected performPlatformValidation(graph: any, config?: AdaptorConfig): Promise<ValidationResult>;
  /**
   * Transform graph to OpenAI format
   */
  protected performTransformation(graph: any, config?: AdaptorConfig): Promise<Omit<PlatformPrompt, 'metadata'>>;
  /**
   * Build OpenAI-specific prompt from graph
   */
  private buildOpenAIPrompt;
  /**
   * Build OpenAI API parameters
   */
  private buildOpenAIParameters;
  /**
   * Get model-specific capabilities
   */
  private getModelCapabilities;
  /**
   * Estimate token count for text (rough approximation)
   */
  private estimateTokenCount;
  /**
   * Detect image-related content in graph
   */
  private detectImageContent;
  /**
   * Detect features not supported by OpenAI models
   */
  private detectUnsupportedFeatures;
  /**
   * Get platform-specific optimizations
   */
  protected getPlatformOptimizations(graph: any, config?: AdaptorConfig): Promise<string[]>;
}
//# sourceMappingURL=OpenAIAdaptor.d.ts.map

/**
 * Midjourney adaptor implementation
 * Epic 10.1.3 - Mapping Strategy Development
 */
import { TextToImageAdaptor, PlatformCapabilities, ValidationResult, PlatformPrompt, AdaptorConfig } from '../types';
import { BaseAdaptor } from './BaseAdaptor';
/**
 * Midjourney-specific configuration
 */
export interface MidjourneyConfig {
  /** Midjourney version to target */
  version?: string;
  /** Default aspect ratio */
  defaultAspectRatio?: string;
  /** Default quality setting */
  defaultQuality?: number;
  /** Default stylize setting */
  defaultStylize?: number;
}
/**
 * Midjourney adaptor for text-to-image generation
 */
export declare class MidjourneyAdaptor extends BaseAdaptor implements TextToImageAdaptor {
  readonly id = 'midjourney-v6';
  readonly version = '1.0.0';
  readonly name = 'Midjourney';
  readonly description = 'Midjourney AI image generation';
  readonly platforms: string[];
  private midjourneyConfig;
  /**
   * Initialize with Midjourney-specific configuration
   */
  protected onInitialize(): Promise<void>;
  /**
   * Get platform capabilities
   */
  capabilities(): Promise<PlatformCapabilities>;
  /**
   * Get image generation specific capabilities
   */
  imageCapabilities(): Promise<{
    maxPromptLength: number;
    supportedDimensions: string[];
    supportedFormats: string[];
    supportsNegativePrompts: boolean;
    supportsStyleTransfer: boolean;
    qualityRange: [number, number];
    guidanceRange: [number, number];
  }>;
  /**
   * Platform-specific validation
   */
  protected performPlatformValidation(graph: any, config?: AdaptorConfig): Promise<ValidationResult>;
  /**
   * Transform graph to Midjourney format
   */
  protected performTransformation(graph: any, config?: AdaptorConfig): Promise<Omit<PlatformPrompt, 'metadata'>>;
  /**
   * Build Midjourney-specific prompt from graph
   */
  private buildMidjourneyPrompt;
  /**
   * Map generic style terms to Midjourney-specific descriptions
   */
  private mapStyleToMidjourney;
  /**
   * Build negative prompt from graph
   */
  private buildNegativePrompt;
  /**
   * Build Midjourney parameters
   */
  private buildMidjourneyParameters;
  /**
   * Build parameter string for Midjourney command
   */
  private buildParameterString;
  /**
   * Extract aspect ratio from graph or config
   */
  private extractAspectRatio;
  /**
   * Normalize aspect ratio to Midjourney format
   */
  private normalizeAspectRatio;
  /**
   * Validate aspect ratio format
   */
  private isValidAspectRatio;
  /**
   * Detect if content is primarily text-focused
   */
  private detectTextOnlyContent;
  /**
   * Validate Midjourney-specific syntax
   */
  private validateMidjourneyTax;
  /**
   * Get platform-specific optimizations
   */
  protected getPlatformOptimizations(graph: any, config?: AdaptorConfig): Promise<string[]>;
}
//# sourceMappingURL=MidjourneyAdaptor.d.ts.map

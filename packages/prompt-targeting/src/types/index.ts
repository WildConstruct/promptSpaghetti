/**
 * Core types and interfaces for the Prompt Targeting System
 * Epic 10 - Cross-platform prompt translation
 */

import { z } from 'zod';

// Re-export Graph type from core package as PromptGraph
export type { Graph as PromptGraph } from '@promptscape/core/graphSchema';

/**
 * Platform-specific capabilities and constraints
 */
export interface PlatformCapabilities {
  /** Unique platform identifier */
  platform: string;
  /** Platform version */
  version: string;
  /** Maximum input tokens/characters */
  maxTokens?: number;
  /** Supported aspect ratios for image generation */
  supportedAspectRatios?: string[];
  /** Parameter ranges for platform-specific settings */
  parameterRanges: Record<string, [number, number]>;
  /** Available features */
  features: string[];
  /** Style customization support */
  styleSupport: boolean;
  /** Negative prompt support (for image generation) */
  negativePromptSupport: boolean;
  /** Custom parameter support */
  customParameters?: Record<string, unknown>;
}

/**
 * Validation result for prompt translation
 */
export interface ValidationResult {
  /** Validation success status */
  valid: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
  /** Overall compatibility score (0-1) */
  compatibilityScore: number;
}

/**
 * Validation error details
 */
export interface ValidationError {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Severity level */
  severity: 'error' | 'warning' | 'info';
  /** Source location in the graph */
  source?: {
    nodeId?: string;
    property?: string;
  };
  /** Suggested fix */
  suggestion?: string;
}

/**
 * Validation warning details
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;
  /** Human-readable warning message */
  message: string;
  /** Source location */
  source?: {
    nodeId?: string;
    property?: string;
  };
  /** Optimization suggestion */
  optimization?: string;
}

/**
 * Platform-specific prompt representation
 */
export interface PlatformPrompt {
  /** Target platform identifier */
  platform: string;
  /** Generated prompt text */
  prompt: string;
  /** Negative prompt (for image generation) */
  negativePrompt?: string;
  /** Platform-specific parameters */
  parameters: Record<string, unknown>;
  /** Metadata about the translation */
  metadata: {
    /** Source graph hash */
    sourceHash: string;
    /** Translation timestamp */
    timestamp: Date;
    /** Translation quality score */
    qualityScore: number;
    /** Applied optimizations */
    optimizations: string[];
    /** Pipeline information */
    pipeline?: {
      stages: string[];
      version: string;
    };
    /** Additional metadata */
    enableEvents?: boolean;
    enableTiming?: boolean;
    aspect?: string;
    transformTime?: number;
  };
}

/**
 * Adaptor configuration options
 */
export interface AdaptorConfig {
  /** Quality preference (0-1, higher = more quality-focused) */
  qualityPreference?: number;
  /** Style preference */
  stylePreference?: 'default' | 'artistic' | 'photorealistic' | 'minimal';
  /** Platform-specific overrides */
  platformOverrides?: Record<string, unknown>;
  /** Enable optimizations */
  enableOptimizations?: boolean;
  /** Custom parameter mappings */
  customMappings?: Record<string, unknown>;
  /** Pipeline configuration */
  pipeline?: {
    skipValidation?: boolean;
    skipOptimization?: boolean;
    stages?: string[];
    stageTimeouts?: Record<string, number>;
    retries?: number | {
      maxAttempts?: number;
      backoffMs?: number;
      retryableErrors?: string[];
    };
  };
}

/**
 * Translation context for maintaining state
 */
export interface TranslationContext {
  /** Source graph being translated */
  sourceGraph: any; // PromptGraph from core
  /** Target platform */
  targetPlatform: string;
  /** Translation configuration */
  config: AdaptorConfig;
  /** Previous translation results (for caching) */
  cache?: Map<string, PlatformPrompt>;
  /** Execution metadata */
  metadata: {
    startTime: Date;
    userId?: string;
    sessionId?: string;
    adaptorId?: string;
    adaptorVersion?: string;
  };
}

/**
 * Base interface for all platform adaptors
 */
export interface ModelAdaptor {
  /** Unique adaptor identifier */
  readonly id: string;
  /** Adaptor version (semver) */
  readonly version: string;
  /** Human-readable name */
  readonly name: string;
  /** Description of the adaptor */
  readonly description: string;
  /** Supported platform(s) */
  readonly platforms: string[];

  /**
   * Get platform capabilities
   */
  capabilities(): Promise<PlatformCapabilities>;

  /**
   * Validate a prompt graph for this platform
   */
  validate(graph: any, config?: AdaptorConfig): Promise<ValidationResult>;

  /**
   * Transform a prompt graph to platform-specific format
   */
  transform(graph: any, config?: AdaptorConfig): Promise<PlatformPrompt>;

  /**
   * Initialize the adaptor (load models, connect to APIs, etc.)
   */
  initialize?(config?: Record<string, unknown>): Promise<void>;

  /**
   * Clean up resources
   */
  cleanup?(): Promise<void>;
}

/**
 * Text-to-text specific adaptor interface
 */
export interface TextToTextAdaptor extends ModelAdaptor {
  /** Text generation specific capabilities */
  textCapabilities(): Promise<{
    maxContextLength: number;
    supportsChatFormat: boolean;
    supportsSystemMessages: boolean;
    supportsFunctionCalling: boolean;
    temperatureRange: [number, number];
    topPRange: [number, number];
  }>;
}

/**
 * Text-to-image specific adaptor interface
 */
export interface TextToImageAdaptor extends ModelAdaptor {
  /** Image generation specific capabilities */
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
   * Generate preview image (low resolution/quality)
   */
  generatePreview?(prompt: PlatformPrompt): Promise<{
    url: string;
    width: number;
    height: number;
    metadata: Record<string, unknown>;
  }>;
}

/**
 * Adaptor registry for discovery and management
 */
export interface AdaptorRegistry {
  /**
   * Register an adaptor
   */
  register(adaptor: ModelAdaptor): Promise<void>;

  /**
   * Unregister an adaptor
   */
  unregister(adaptorId: string): Promise<void>;

  /**
   * Get adaptor by ID
   */
  get(adaptorId: string): ModelAdaptor | undefined;

  /**
   * List all registered adaptors
   */
  list(): ModelAdaptor[];

  /**
   * Find adaptors by platform
   */
  findByPlatform(platform: string): ModelAdaptor[];

  /**
   * Find adaptors by capability
   */
  findByCapability(capability: string): ModelAdaptor[];
}

/**
 * Mapping engine for core translation logic
 */
export interface MappingEngine {
  /**
   * Execute translation pipeline
   */
  translate(
    graph: any,
    targetPlatform: string,
    config?: AdaptorConfig
  ): Promise<PlatformPrompt>;

  /**
   * Batch translate to multiple platforms
   */
  translateBatch(
    graph: any,
    targetPlatforms: string[],
    config?: AdaptorConfig
  ): Promise<Record<string, PlatformPrompt>>;

  /**
   * Validate translation without executing
   */
  validateTranslation(
    graph: any,
    targetPlatform: string,
    config?: AdaptorConfig
  ): Promise<ValidationResult>;
}

/**
 * Cache interface for translation results
 */
export interface TranslationCache {
  /**
   * Get cached translation result
   */
  get(key: string): Promise<PlatformPrompt | null>;

  /**
   * Cache translation result
   */
  set(key: string, value: PlatformPrompt, ttl?: number): Promise<void>;

  /**
   * Check if key exists in cache
   */
  has(key: string): Promise<boolean>;

  /**
   * Remove cached translation
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all cached translations
   */
  clear(): Promise<void>;

  /**
   * Get cache statistics
   */
  stats(): Promise<{
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
  }>;
}

/**
 * Zod schemas for runtime validation
 */
export 
export 
export 
export 
/**
 * Error classes for prompt targeting system
 */
export class PromptTargetingError extends Error {
  constructor(
    message: string,
    public code: string,
    public platform?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PromptTargetingError';
  }
}

export class AdaptorError extends PromptTargetingError {
  constructor(
    message: string,
    public adaptorId: string,
    code: string = 'ADAPTOR_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message, code, undefined, details);
    this.name = 'AdaptorError';
  }
}

export class ValidationException extends PromptTargetingError {
  constructor(
    message: string,
    public validationErrors: ValidationError[],
    code: string = 'VALIDATION_ERROR'
  ) {
    super(message, code);
    this.name = 'ValidationException';
  }
}

export class TranslationError extends PromptTargetingError {
  constructor(
    message: string,
    platform: string,
    code: string = 'TRANSLATION_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message, code, platform, details);
    this.name = 'TranslationError';
  }
}
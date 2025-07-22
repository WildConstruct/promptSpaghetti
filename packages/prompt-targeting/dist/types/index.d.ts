/**
 * Core types and interfaces for the Prompt Targeting System
 * Epic 10 - Cross-platform prompt translation
 */
import { z } from 'zod';
export type { PromptGraph } from '../../../core/types';
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
}
/**
 * Translation context for maintaining state
 */
export interface TranslationContext {
    /** Source graph being translated */
    sourceGraph: any;
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
    translate(graph: any, targetPlatform: string, config?: AdaptorConfig): Promise<PlatformPrompt>;
    /**
     * Batch translate to multiple platforms
     */
    translateBatch(graph: any, targetPlatforms: string[], config?: AdaptorConfig): Promise<Record<string, PlatformPrompt>>;
    /**
     * Validate translation without executing
     */
    validateTranslation(graph: any, targetPlatform: string, config?: AdaptorConfig): Promise<ValidationResult>;
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
export declare const PlatformCapabilitiesSchema: z.ZodObject<{
    platform: z.ZodString;
    version: z.ZodString;
    maxTokens: z.ZodOptional<z.ZodNumber>;
    supportedAspectRatios: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    parameterRanges: z.ZodRecord<z.ZodString, z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    features: z.ZodArray<z.ZodString, "many">;
    styleSupport: z.ZodBoolean;
    negativePromptSupport: z.ZodBoolean;
    customParameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    version: string;
    platform: string;
    parameterRanges: Record<string, [number, number]>;
    features: string[];
    styleSupport: boolean;
    negativePromptSupport: boolean;
    maxTokens?: number | undefined;
    supportedAspectRatios?: string[] | undefined;
    customParameters?: Record<string, unknown> | undefined;
}, {
    version: string;
    platform: string;
    parameterRanges: Record<string, [number, number]>;
    features: string[];
    styleSupport: boolean;
    negativePromptSupport: boolean;
    maxTokens?: number | undefined;
    supportedAspectRatios?: string[] | undefined;
    customParameters?: Record<string, unknown> | undefined;
}>;
export declare const ValidationResultSchema: z.ZodObject<{
    valid: z.ZodBoolean;
    errors: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        severity: z.ZodEnum<["error", "warning", "info"]>;
        source: z.ZodOptional<z.ZodObject<{
            nodeId: z.ZodOptional<z.ZodString>;
            property: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            nodeId?: string | undefined;
            property?: string | undefined;
        }, {
            nodeId?: string | undefined;
            property?: string | undefined;
        }>>;
        suggestion: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        severity: "warning" | "error" | "info";
        source?: {
            nodeId?: string | undefined;
            property?: string | undefined;
        } | undefined;
        suggestion?: string | undefined;
    }, {
        code: string;
        message: string;
        severity: "warning" | "error" | "info";
        source?: {
            nodeId?: string | undefined;
            property?: string | undefined;
        } | undefined;
        suggestion?: string | undefined;
    }>, "many">;
    warnings: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        source: z.ZodOptional<z.ZodObject<{
            nodeId: z.ZodOptional<z.ZodString>;
            property: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            nodeId?: string | undefined;
            property?: string | undefined;
        }, {
            nodeId?: string | undefined;
            property?: string | undefined;
        }>>;
        optimization: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        optimization?: string | undefined;
        source?: {
            nodeId?: string | undefined;
            property?: string | undefined;
        } | undefined;
    }, {
        code: string;
        message: string;
        optimization?: string | undefined;
        source?: {
            nodeId?: string | undefined;
            property?: string | undefined;
        } | undefined;
    }>, "many">;
    compatibilityScore: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    valid: boolean;
    errors: {
        code: string;
        message: string;
        severity: "warning" | "error" | "info";
        source?: {
            nodeId?: string | undefined;
            property?: string | undefined;
        } | undefined;
        suggestion?: string | undefined;
    }[];
    warnings: {
        code: string;
        message: string;
        optimization?: string | undefined;
        source?: {
            nodeId?: string | undefined;
            property?: string | undefined;
        } | undefined;
    }[];
    compatibilityScore: number;
}, {
    valid: boolean;
    errors: {
        code: string;
        message: string;
        severity: "warning" | "error" | "info";
        source?: {
            nodeId?: string | undefined;
            property?: string | undefined;
        } | undefined;
        suggestion?: string | undefined;
    }[];
    warnings: {
        code: string;
        message: string;
        optimization?: string | undefined;
        source?: {
            nodeId?: string | undefined;
            property?: string | undefined;
        } | undefined;
    }[];
    compatibilityScore: number;
}>;
export declare const PlatformPromptSchema: z.ZodObject<{
    platform: z.ZodString;
    prompt: z.ZodString;
    negativePrompt: z.ZodOptional<z.ZodString>;
    parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    metadata: z.ZodObject<{
        sourceHash: z.ZodString;
        timestamp: z.ZodDate;
        qualityScore: z.ZodNumber;
        optimizations: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        timestamp: Date;
        sourceHash: string;
        qualityScore: number;
        optimizations: string[];
    }, {
        timestamp: Date;
        sourceHash: string;
        qualityScore: number;
        optimizations: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    metadata: {
        timestamp: Date;
        sourceHash: string;
        qualityScore: number;
        optimizations: string[];
    };
    platform: string;
    parameters: Record<string, unknown>;
    negativePrompt?: string | undefined;
}, {
    prompt: string;
    metadata: {
        timestamp: Date;
        sourceHash: string;
        qualityScore: number;
        optimizations: string[];
    };
    platform: string;
    parameters: Record<string, unknown>;
    negativePrompt?: string | undefined;
}>;
export declare const AdaptorConfigSchema: z.ZodObject<{
    qualityPreference: z.ZodOptional<z.ZodNumber>;
    stylePreference: z.ZodOptional<z.ZodEnum<["default", "artistic", "photorealistic", "minimal"]>>;
    platformOverrides: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    enableOptimizations: z.ZodOptional<z.ZodBoolean>;
    customMappings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    qualityPreference?: number | undefined;
    stylePreference?: "minimal" | "default" | "artistic" | "photorealistic" | undefined;
    platformOverrides?: Record<string, unknown> | undefined;
    enableOptimizations?: boolean | undefined;
    customMappings?: Record<string, unknown> | undefined;
}, {
    qualityPreference?: number | undefined;
    stylePreference?: "minimal" | "default" | "artistic" | "photorealistic" | undefined;
    platformOverrides?: Record<string, unknown> | undefined;
    enableOptimizations?: boolean | undefined;
    customMappings?: Record<string, unknown> | undefined;
}>;
/**
 * Error classes for prompt targeting system
 */
export declare class PromptTargetingError extends Error {
    code: string;
    platform?: string | undefined;
    details?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, platform?: string | undefined, details?: Record<string, unknown> | undefined);
}
export declare class AdaptorError extends PromptTargetingError {
    adaptorId: string;
    constructor(message: string, adaptorId: string, code?: string, details?: Record<string, unknown>);
}
export declare class ValidationError extends PromptTargetingError {
    validationErrors: ValidationError[];
    constructor(message: string, validationErrors: ValidationError[], code?: string);
}
export declare class TranslationError extends PromptTargetingError {
    constructor(message: string, platform: string, code?: string, details?: Record<string, unknown>);
}
//# sourceMappingURL=index.d.ts.map
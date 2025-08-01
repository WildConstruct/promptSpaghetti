/**
 * Configuration management system for prompt targeting
 * Epic 10.2.2 - Configuration System with Schema and UI Components
 */
import { z } from 'zod';
import { EventEmitter } from 'events';
/**
 * Platform-specific configuration schemas
 */
export declare const OpenAIConfigSchema: z.ZodObject<{
    apiKey: z.ZodOptional<z.ZodString>;
    model: z.ZodDefault<z.ZodEnum<["gpt-3.5-turbo", "gpt-3.5-turbo-16k", "gpt-4", "gpt-4-32k", "gpt-4-turbo"]>>;
    organization: z.ZodOptional<z.ZodString>;
    baseURL: z.ZodOptional<z.ZodString>;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    topP: z.ZodDefault<z.ZodNumber>;
    frequencyPenalty: z.ZodDefault<z.ZodNumber>;
    presencePenalty: z.ZodDefault<z.ZodNumber>;
    stopSequences: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    maxTokens: number;
    temperature: number;
    model: "gpt-4" | "gpt-4-32k" | "gpt-4-turbo" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k";
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    stopSequences: string[];
    apiKey?: string | undefined;
    organization?: string | undefined;
    baseURL?: string | undefined;
}, {
    maxTokens?: number | undefined;
    temperature?: number | undefined;
    model?: "gpt-4" | "gpt-4-32k" | "gpt-4-turbo" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | undefined;
    apiKey?: string | undefined;
    organization?: string | undefined;
    baseURL?: string | undefined;
    topP?: number | undefined;
    frequencyPenalty?: number | undefined;
    presencePenalty?: number | undefined;
    stopSequences?: string[] | undefined;
}>;
export declare const MidjourneyConfigSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodEnum<["5", "5.1", "5.2", "6"]>>;
    defaultAspectRatio: z.ZodDefault<z.ZodString>;
    defaultQuality: z.ZodDefault<z.ZodNumber>;
    defaultStylize: z.ZodDefault<z.ZodNumber>;
    defaultChaos: z.ZodDefault<z.ZodNumber>;
    enableUpscaling: z.ZodDefault<z.ZodBoolean>;
    enableVariations: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    version: "5" | "6" | "5.1" | "5.2";
    defaultAspectRatio: string;
    defaultQuality: number;
    defaultStylize: number;
    defaultChaos: number;
    enableUpscaling: boolean;
    enableVariations: boolean;
}, {
    version?: "5" | "6" | "5.1" | "5.2" | undefined;
    defaultAspectRatio?: string | undefined;
    defaultQuality?: number | undefined;
    defaultStylize?: number | undefined;
    defaultChaos?: number | undefined;
    enableUpscaling?: boolean | undefined;
    enableVariations?: boolean | undefined;
}>;
export declare const DALLEConfigSchema: z.ZodObject<{
    model: z.ZodDefault<z.ZodEnum<["dall-e-2", "dall-e-3"]>>;
    size: z.ZodDefault<z.ZodEnum<["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"]>>;
    quality: z.ZodDefault<z.ZodEnum<["standard", "hd"]>>;
    style: z.ZodDefault<z.ZodEnum<["vivid", "natural"]>>;
    n: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    size: "1024x1024" | "256x256" | "512x512" | "1792x1024" | "1024x1792";
    style: "vivid" | "natural";
    model: "dall-e-2" | "dall-e-3";
    quality: "standard" | "hd";
    n: number;
}, {
    size?: "1024x1024" | "256x256" | "512x512" | "1792x1024" | "1024x1792" | undefined;
    style?: "vivid" | "natural" | undefined;
    model?: "dall-e-2" | "dall-e-3" | undefined;
    quality?: "standard" | "hd" | undefined;
    n?: number | undefined;
}>;
/**
 * Global configuration schema
 */
export declare const GlobalConfigSchema: z.ZodObject<{
    qualityPreference: z.ZodDefault<z.ZodNumber>;
    stylePreference: z.ZodDefault<z.ZodEnum<["default", "artistic", "photorealistic", "minimal"]>>;
    enableOptimizations: z.ZodDefault<z.ZodBoolean>;
    platformOverrides: z.ZodDefault<z.ZodObject<{
        openai: z.ZodOptional<z.ZodObject<{
            apiKey: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            model: z.ZodOptional<z.ZodDefault<z.ZodEnum<["gpt-3.5-turbo", "gpt-3.5-turbo-16k", "gpt-4", "gpt-4-32k", "gpt-4-turbo"]>>>;
            organization: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            baseURL: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            temperature: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
            maxTokens: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
            topP: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
            frequencyPenalty: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
            presencePenalty: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
            stopSequences: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
        }, "strip", z.ZodTypeAny, {
            maxTokens?: number | undefined;
            temperature?: number | undefined;
            model?: "gpt-4" | "gpt-4-32k" | "gpt-4-turbo" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | undefined;
            apiKey?: string | undefined;
            organization?: string | undefined;
            baseURL?: string | undefined;
            topP?: number | undefined;
            frequencyPenalty?: number | undefined;
            presencePenalty?: number | undefined;
            stopSequences?: string[] | undefined;
        }, {
            maxTokens?: number | undefined;
            temperature?: number | undefined;
            model?: "gpt-4" | "gpt-4-32k" | "gpt-4-turbo" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | undefined;
            apiKey?: string | undefined;
            organization?: string | undefined;
            baseURL?: string | undefined;
            topP?: number | undefined;
            frequencyPenalty?: number | undefined;
            presencePenalty?: number | undefined;
            stopSequences?: string[] | undefined;
        }>>;
        midjourney: z.ZodOptional<z.ZodObject<{
            version: z.ZodOptional<z.ZodDefault<z.ZodEnum<["5", "5.1", "5.2", "6"]>>>;
            defaultAspectRatio: z.ZodOptional<z.ZodDefault<z.ZodString>>;
            defaultQuality: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
            defaultStylize: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
            defaultChaos: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
            enableUpscaling: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            enableVariations: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            version?: "5" | "6" | "5.1" | "5.2" | undefined;
            defaultAspectRatio?: string | undefined;
            defaultQuality?: number | undefined;
            defaultStylize?: number | undefined;
            defaultChaos?: number | undefined;
            enableUpscaling?: boolean | undefined;
            enableVariations?: boolean | undefined;
        }, {
            version?: "5" | "6" | "5.1" | "5.2" | undefined;
            defaultAspectRatio?: string | undefined;
            defaultQuality?: number | undefined;
            defaultStylize?: number | undefined;
            defaultChaos?: number | undefined;
            enableUpscaling?: boolean | undefined;
            enableVariations?: boolean | undefined;
        }>>;
        dalle: z.ZodOptional<z.ZodObject<{
            model: z.ZodOptional<z.ZodDefault<z.ZodEnum<["dall-e-2", "dall-e-3"]>>>;
            size: z.ZodOptional<z.ZodDefault<z.ZodEnum<["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"]>>>;
            quality: z.ZodOptional<z.ZodDefault<z.ZodEnum<["standard", "hd"]>>>;
            style: z.ZodOptional<z.ZodDefault<z.ZodEnum<["vivid", "natural"]>>>;
            n: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            size?: "1024x1024" | "256x256" | "512x512" | "1792x1024" | "1024x1792" | undefined;
            style?: "vivid" | "natural" | undefined;
            model?: "dall-e-2" | "dall-e-3" | undefined;
            quality?: "standard" | "hd" | undefined;
            n?: number | undefined;
        }, {
            size?: "1024x1024" | "256x256" | "512x512" | "1792x1024" | "1024x1792" | undefined;
            style?: "vivid" | "natural" | undefined;
            model?: "dall-e-2" | "dall-e-3" | undefined;
            quality?: "standard" | "hd" | undefined;
            n?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        openai?: {
            maxTokens?: number | undefined;
            temperature?: number | undefined;
            model?: "gpt-4" | "gpt-4-32k" | "gpt-4-turbo" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | undefined;
            apiKey?: string | undefined;
            organization?: string | undefined;
            baseURL?: string | undefined;
            topP?: number | undefined;
            frequencyPenalty?: number | undefined;
            presencePenalty?: number | undefined;
            stopSequences?: string[] | undefined;
        } | undefined;
        midjourney?: {
            version?: "5" | "6" | "5.1" | "5.2" | undefined;
            defaultAspectRatio?: string | undefined;
            defaultQuality?: number | undefined;
            defaultStylize?: number | undefined;
            defaultChaos?: number | undefined;
            enableUpscaling?: boolean | undefined;
            enableVariations?: boolean | undefined;
        } | undefined;
        dalle?: {
            size?: "1024x1024" | "256x256" | "512x512" | "1792x1024" | "1024x1792" | undefined;
            style?: "vivid" | "natural" | undefined;
            model?: "dall-e-2" | "dall-e-3" | undefined;
            quality?: "standard" | "hd" | undefined;
            n?: number | undefined;
        } | undefined;
    }, {
        openai?: {
            maxTokens?: number | undefined;
            temperature?: number | undefined;
            model?: "gpt-4" | "gpt-4-32k" | "gpt-4-turbo" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | undefined;
            apiKey?: string | undefined;
            organization?: string | undefined;
            baseURL?: string | undefined;
            topP?: number | undefined;
            frequencyPenalty?: number | undefined;
            presencePenalty?: number | undefined;
            stopSequences?: string[] | undefined;
        } | undefined;
        midjourney?: {
            version?: "5" | "6" | "5.1" | "5.2" | undefined;
            defaultAspectRatio?: string | undefined;
            defaultQuality?: number | undefined;
            defaultStylize?: number | undefined;
            defaultChaos?: number | undefined;
            enableUpscaling?: boolean | undefined;
            enableVariations?: boolean | undefined;
        } | undefined;
        dalle?: {
            size?: "1024x1024" | "256x256" | "512x512" | "1792x1024" | "1024x1792" | undefined;
            style?: "vivid" | "natural" | undefined;
            model?: "dall-e-2" | "dall-e-3" | undefined;
            quality?: "standard" | "hd" | undefined;
            n?: number | undefined;
        } | undefined;
    }>>;
    pipeline: z.ZodDefault<z.ZodObject<{
        skipValidation: z.ZodDefault<z.ZodBoolean>;
        skipOptimization: z.ZodDefault<z.ZodBoolean>;
        stageTimeouts: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        retries: z.ZodDefault<z.ZodObject<{
            maxAttempts: z.ZodDefault<z.ZodNumber>;
            backoffMs: z.ZodDefault<z.ZodNumber>;
            retryableErrors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            maxAttempts: number;
            backoffMs: number;
            retryableErrors: string[];
        }, {
            maxAttempts?: number | undefined;
            backoffMs?: number | undefined;
            retryableErrors?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        skipValidation: boolean;
        skipOptimization: boolean;
        stageTimeouts: Record<string, number>;
        retries: {
            maxAttempts: number;
            backoffMs: number;
            retryableErrors: string[];
        };
    }, {
        skipValidation?: boolean | undefined;
        skipOptimization?: boolean | undefined;
        stageTimeouts?: Record<string, number> | undefined;
        retries?: {
            maxAttempts?: number | undefined;
            backoffMs?: number | undefined;
            retryableErrors?: string[] | undefined;
        } | undefined;
    }>>;
    monitoring: z.ZodDefault<z.ZodObject<{
        enableTiming: z.ZodDefault<z.ZodBoolean>;
        enableMemoryTracking: z.ZodDefault<z.ZodBoolean>;
        enableEvents: z.ZodDefault<z.ZodBoolean>;
        enableLogging: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enableLogging: boolean;
        enableTiming: boolean;
        enableMemoryTracking: boolean;
        enableEvents: boolean;
    }, {
        enableLogging?: boolean | undefined;
        enableTiming?: boolean | undefined;
        enableMemoryTracking?: boolean | undefined;
        enableEvents?: boolean | undefined;
    }>>;
    customMappings: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    enableOptimizations: boolean;
    qualityPreference: number;
    stylePreference: "default" | "artistic" | "photorealistic" | "minimal";
    platformOverrides: {
        openai?: {
            maxTokens?: number | undefined;
            temperature?: number | undefined;
            model?: "gpt-4" | "gpt-4-32k" | "gpt-4-turbo" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | undefined;
            apiKey?: string | undefined;
            organization?: string | undefined;
            baseURL?: string | undefined;
            topP?: number | undefined;
            frequencyPenalty?: number | undefined;
            presencePenalty?: number | undefined;
            stopSequences?: string[] | undefined;
        } | undefined;
        midjourney?: {
            version?: "5" | "6" | "5.1" | "5.2" | undefined;
            defaultAspectRatio?: string | undefined;
            defaultQuality?: number | undefined;
            defaultStylize?: number | undefined;
            defaultChaos?: number | undefined;
            enableUpscaling?: boolean | undefined;
            enableVariations?: boolean | undefined;
        } | undefined;
        dalle?: {
            size?: "1024x1024" | "256x256" | "512x512" | "1792x1024" | "1024x1792" | undefined;
            style?: "vivid" | "natural" | undefined;
            model?: "dall-e-2" | "dall-e-3" | undefined;
            quality?: "standard" | "hd" | undefined;
            n?: number | undefined;
        } | undefined;
    };
    pipeline: {
        skipValidation: boolean;
        skipOptimization: boolean;
        stageTimeouts: Record<string, number>;
        retries: {
            maxAttempts: number;
            backoffMs: number;
            retryableErrors: string[];
        };
    };
    monitoring: {
        enableLogging: boolean;
        enableTiming: boolean;
        enableMemoryTracking: boolean;
        enableEvents: boolean;
    };
    customMappings: Record<string, unknown>;
}, {
    enableOptimizations?: boolean | undefined;
    qualityPreference?: number | undefined;
    stylePreference?: "default" | "artistic" | "photorealistic" | "minimal" | undefined;
    platformOverrides?: {
        openai?: {
            maxTokens?: number | undefined;
            temperature?: number | undefined;
            model?: "gpt-4" | "gpt-4-32k" | "gpt-4-turbo" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | undefined;
            apiKey?: string | undefined;
            organization?: string | undefined;
            baseURL?: string | undefined;
            topP?: number | undefined;
            frequencyPenalty?: number | undefined;
            presencePenalty?: number | undefined;
            stopSequences?: string[] | undefined;
        } | undefined;
        midjourney?: {
            version?: "5" | "6" | "5.1" | "5.2" | undefined;
            defaultAspectRatio?: string | undefined;
            defaultQuality?: number | undefined;
            defaultStylize?: number | undefined;
            defaultChaos?: number | undefined;
            enableUpscaling?: boolean | undefined;
            enableVariations?: boolean | undefined;
        } | undefined;
        dalle?: {
            size?: "1024x1024" | "256x256" | "512x512" | "1792x1024" | "1024x1792" | undefined;
            style?: "vivid" | "natural" | undefined;
            model?: "dall-e-2" | "dall-e-3" | undefined;
            quality?: "standard" | "hd" | undefined;
            n?: number | undefined;
        } | undefined;
    } | undefined;
    pipeline?: {
        skipValidation?: boolean | undefined;
        skipOptimization?: boolean | undefined;
        stageTimeouts?: Record<string, number> | undefined;
        retries?: {
            maxAttempts?: number | undefined;
            backoffMs?: number | undefined;
            retryableErrors?: string[] | undefined;
        } | undefined;
    } | undefined;
    monitoring?: {
        enableLogging?: boolean | undefined;
        enableTiming?: boolean | undefined;
        enableMemoryTracking?: boolean | undefined;
        enableEvents?: boolean | undefined;
    } | undefined;
    customMappings?: Record<string, unknown> | undefined;
}>;
export type OpenAIConfig = z.infer<typeof OpenAIConfigSchema>;
export type MidjourneyConfig = z.infer<typeof MidjourneyConfigSchema>;
export type DALLEConfig = z.infer<typeof DALLEConfigSchema>;
export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;
/**
 * Configuration preset interface
 */
export interface ConfigurationPreset {
    name: string;
    description: string;
    config: GlobalConfig;
    tags: string[];
    isBuiltIn: boolean;
    created: Date;
    updated: Date;
}
/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
    valid: boolean;
    errors: {
        path: string;
        message: string;
        code: string;
    }[];
    warnings: {
        path: string;
        message: string;
        suggestion: string;
    }[];
}
/**
 * Configuration events
 */
export interface ConfigurationEvents {
    'config:changed': (path: string, newValue: unknown, oldValue: unknown) => void;
    'config:preset:applied': (presetName: string, config: GlobalConfig) => void;
    'config:validated': (result: ConfigValidationResult) => void;
    'config:exported': (format: string, config: GlobalConfig) => void;
    'config:imported': (source: string, config: GlobalConfig) => void;
}
/**
 * Comprehensive configuration manager
 */
export declare class ConfigurationManager extends EventEmitter {
    private config;
    private presets;
    private configHistory;
    private logger;
    constructor(initialConfig?: Partial<GlobalConfig>);
    /**
     * Get current configuration
     */
    getConfig(): GlobalConfig;
    /**
     * Update configuration with validation
     */
    updateConfig(updates: Partial<GlobalConfig>, reason?: string): ConfigValidationResult;
    /**
     * Set specific configuration value
     */
    setConfigValue(path: string, value: unknown): ConfigValidationResult;
    /**
     * Get specific configuration value
     */
    getConfigValue(path: string): unknown;
    /**
     * Validate configuration
     */
    validateConfig(config?: unknown): ConfigValidationResult;
    /**
     * Create configuration preset
     */
    createPreset(name: string, description: string, config?: Partial<GlobalConfig>, tags?: string[]): void;
    /**
     * Apply configuration preset
     */
    applyPreset(name: string): ConfigValidationResult;
    /**
     * List available presets
     */
    listPresets(tags?: string[]): ConfigurationPreset[];
    /**
     * Delete preset
     */
    deletePreset(name: string): boolean;
    /**
     * Export configuration
     */
    exportConfig(format?: 'json' | 'yaml'): string;
    /**
     * Import configuration
     */
    importConfig(data: string, format?: 'json' | 'yaml'): ConfigValidationResult;
    /**
     * Get configuration history
     */
    getConfigHistory(limit?: number): Array<{
        timestamp: Date;
        reason: string;
    }>;
    /**
     * Reset to default configuration
     */
    resetToDefaults(): ConfigValidationResult;
    /**
     * Get configuration summary for UI
     */
    getConfigSummary(): {
        platforms: string[];
        qualityLevel: string;
        optimizationsEnabled: boolean;
        presetCount: number;
        lastUpdated: Date | null;
    };
    /**
     * Initialize built-in presets
     */
    private initializeBuiltInPresets;
    /**
     * Merge configurations deeply
     */
    private mergeConfigs;
    /**
     * Merge objects recursively
     */
    private mergeObjects;
    /**
     * Create nested update object from path
     */
    private createNestedUpdate;
    /**
     * Get nested value from object
     */
    private getNestedValue;
    /**
     * Perform business logic validation
     */
    private performBusinessValidation;
    /**
     * Emit configuration change events
     */
    private emitConfigChanges;
    /**
     * Get configuration changes between two configs
     */
    private getConfigChanges;
    /**
     * Simple config to YAML conversion
     */
    private configToYaml;
    /**
     * Simple YAML to config conversion
     */
    private yamlToConfig;
    /**
     * Parse YAML value to appropriate type
     */
    private parseYamlValue;
}
//# sourceMappingURL=ConfigurationManager.d.ts.map
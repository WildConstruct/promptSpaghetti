import { z } from 'zod';
import { Platform } from '../types/index.js';
/**
 * Comprehensive configuration management system for adaptors
 */
export declare class ConfigurationManager {
    private logger;
    private cache;
    private configurations;
    private presets;
    private schemas;
    private changeListeners;
    constructor(logger: any, cache: any);
    /**
     * Register configuration schema for an adaptor
     */
    registerSchema(adaptorId: string, schema: z.ZodSchema, metadata?: SchemaMetadata): void;
    /**
     * Set configuration for an adaptor with validation
     */
    setConfiguration(adaptorId: string, config: Record<string, any>, options?: SetConfigurationOptions): Promise<void>;
    /**
     * Get configuration for an adaptor
     */
    getConfiguration(adaptorId: string, environment?: string): AdaptorConfiguration | undefined;
    /**
     * Get configuration value with type safety
     */
    getConfigurationValue<T = any>(adaptorId: string, path: string, defaultValue?: T): T | undefined;
    /**
     * Update specific configuration values
     */
    updateConfiguration(adaptorId: string, updates: Record<string, any>, options?: UpdateConfigurationOptions): Promise<void>;
    /**
     * Create configuration preset
     */
    createPreset(preset: ConfigurationPreset): void;
    /**
     * Apply configuration preset to an adaptor
     */
    applyPreset(adaptorId: string, presetId: string, overrides?: Record<string, any>): Promise<void>;
    /**
     * Import configuration from various formats
     */
    importConfiguration(data: string | object, format: ConfigurationFormat, options?: ImportOptions): Promise<ImportResult>;
    /**
     * Export configurations in various formats
     */
    exportConfiguration(adaptorIds?: string[], format?: ConfigurationFormat, options?: ExportOptions): string;
    /**
     * Validate configuration against schema
     */
    validateConfiguration(adaptorId: string, config: Record<string, any>): ValidationResult;
    /**
     * Get configuration differences between environments
     */
    getConfigurationDiff(adaptorId: string, fromEnvironment: string, toEnvironment: string): ConfigurationDiff;
    /**
     * Add configuration change listener
     */
    addChangeListener(listener: ConfigurationChangeListener): void;
    /**
     * Remove configuration change listener
     */
    removeChangeListener(listener: ConfigurationChangeListener): void;
    /**
     * Get available presets
     */
    getPresets(platform?: Platform): ConfigurationPreset[];
    /**
     * Get configuration history (simplified implementation)
     */
    getConfigurationHistory(adaptorId: string): ConfigurationHistoryEntry[];
    private setupDefaultSchemas;
    private applyInheritanceAndOverrides;
    private mergeConfiguration;
    private cacheConfiguration;
    private notifyConfigurationChange;
    private getNestedValue;
    private incrementVersion;
    private validatePreset;
    private parseEnvironmentVariables;
    private parseEnvironmentValue;
    private importSingleConfiguration;
    private getConfigurationsForExport;
    private exportAsEnvironmentVariables;
    private flattenObjectToEnvVars;
    private getEnvironmentOverrides;
}
export interface AdaptorConfiguration {
    adaptorId: string;
    config: Record<string, any>;
    metadata: ConfigurationMetadata;
    inheritance?: InheritanceInfo;
}
export interface ConfigurationMetadata {
    version: string;
    createdAt: Date;
    updatedAt: Date;
    source: string;
    environment: string;
}
export interface InheritanceInfo {
    parentId: string;
    overrides: Record<string, any>;
}
export interface ConfigurationPreset {
    id: string;
    name: string;
    description: string;
    platforms: Platform[];
    configuration: Record<string, any>;
    version?: string;
    environment?: string;
    tags?: string[];
}
export interface SetConfigurationOptions {
    version?: string;
    environment?: string;
    source?: string;
    inherit?: {
        parentId: string;
        overrides?: Record<string, any>;
    };
}
export interface UpdateConfigurationOptions {
    mergeStrategy?: 'shallow' | 'deep';
    source?: string;
}
export interface SchemaMetadata {
    title?: string;
    description?: string;
    version?: string;
    deprecated?: boolean;
}
export type ConfigurationFormat = 'json' | 'yaml' | 'env';
export interface ImportOptions {
    environment?: string;
    overwrite?: boolean;
    validateOnly?: boolean;
}
export interface ExportOptions {
    environment?: string;
    includeMetadata?: boolean;
    pretty?: boolean;
    singleAdaptor?: boolean;
}
export interface ImportResult {
    success: boolean;
    imported: number;
    failed: number;
    errors: Array<{
        adaptorId: string;
        error: string;
    }>;
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export interface ConfigurationDiff {
    adaptorId: string;
    fromEnvironment: string;
    toEnvironment: string;
    differences: Array<{
        path: string;
        fromValue: any;
        toValue: any;
        type: 'added' | 'removed' | 'changed';
    }>;
    summary: string;
}
export interface ConfigurationHistoryEntry {
    version: string;
    timestamp: Date;
    changes: string[];
    author: string;
}
export interface ConfigurationChangeEvent {
    adaptorId: string;
    oldConfiguration?: AdaptorConfiguration;
    newConfiguration: AdaptorConfiguration;
    timestamp: Date;
    source: string;
}
export type ConfigurationChangeListener = (event: ConfigurationChangeEvent) => Promise<void>;
export declare class ConfigurationError extends Error {
    code: string;
    details?: Record<string, any> | undefined;
    constructor(message: string, code: string, details?: Record<string, any> | undefined);
}

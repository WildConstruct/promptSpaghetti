/**
 * Core mapping engine for prompt transformation
 * Epic 10.1.3 - Mapping Strategy Development
 */
import { MappingEngine, PlatformPrompt, AdaptorConfig, ValidationResult, AdaptorRegistry, TranslationCache } from '../types';
/**
 * Configuration for the mapping engine
 */
export interface MappingEngineConfig {
    /** Enable caching of translation results */
    enableCaching?: boolean;
    /** Cache TTL in seconds */
    cacheTTL?: number;
    /** Maximum concurrent translations */
    maxConcurrency?: number;
    /** Timeout for individual translations (ms) */
    translationTimeout?: number;
    /** Enable detailed logging */
    enableLogging?: boolean;
}
/**
 * Implementation of the core mapping engine
 */
export declare class DefaultMappingEngine implements MappingEngine {
    private registry;
    private cache?;
    private config;
    private logger;
    private activeTranslations;
    constructor(registry: AdaptorRegistry, cache?: TranslationCache, config?: MappingEngineConfig);
    /**
     * Execute translation pipeline for a single platform
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
    /**
     * Execute the actual translation with timeout and error handling
     */
    private executeTranslation;
    /**
     * Find the best adaptor for a given platform
     */
    private findBestAdaptor;
    /**
     * Generate cache key for translation result
     */
    private generateCacheKey;
    /**
     * Validate translation result format
     */
    private validateTranslationResult;
    /**
     * Execute a promise with timeout
     */
    private withTimeout;
    /**
     * Split array into chunks of specified size
     */
    private chunkArray;
    /**
     * Log message if logging is enabled
     */
    private log;
    /**
     * Log error if logging is enabled
     */
    private logError;
    /**
     * Log performance metrics
     */
    private logPerformance;
    /**
     * Get engine statistics
     */
    getStatistics(): {
        activeTranslations: number;
        cacheEnabled: boolean;
        cacheStats?: any;
        configuration: MappingEngineConfig;
    };
    /**
     * Update engine configuration
     */
    updateConfiguration(newConfig: Partial<MappingEngineConfig>): void;
}
//# sourceMappingURL=MappingEngine.d.ts.map
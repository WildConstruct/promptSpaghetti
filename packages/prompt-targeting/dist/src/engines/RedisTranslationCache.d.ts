/**
 * Redis-based translation cache implementation
 * Epic 10.1.5 - Performance Considerations
 */
import { TranslationCache, PlatformPrompt } from '../types';
/**
 * Configuration for Redis translation cache
 */
export interface RedisCacheConfig {
    /** Redis connection URL */
    url?: string;
    /** Redis host */
    host?: string;
    /** Redis port */
    port?: number;
    /** Redis password */
    password?: string;
    /** Redis database number */
    database?: number;
    /** Key prefix for cache entries */
    keyPrefix?: string;
    /** Default TTL in seconds */
    defaultTTL?: number;
    /** Enable compression for large values */
    enableCompression?: boolean;
    /** Maximum value size before compression (bytes) */
    compressionThreshold?: number;
}
/**
 * Redis-based implementation of translation cache
 */
export declare class RedisTranslationCache implements TranslationCache {
    private client;
    private config;
    private connected;
    private metrics;
    private logger;
    constructor(config?: RedisCacheConfig);
    /**
     * Initialize Redis connection
     */
    connect(): Promise<void>;
    /**
     * Close Redis connection
     */
    disconnect(): Promise<void>;
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
    /**
     * Get detailed cache statistics
     */
    getDetailedStats(): Promise<{
        hits: number;
        misses: number;
        sets: number;
        deletes: number;
        errors: number;
        size: number;
        hitRate: number;
        connected: boolean;
        memoryUsage?: number;
        keyspaceHits?: number;
        keyspaceMisses?: number;
    }>;
    /**
     * Set cache expiration for a key
     */
    expire(key: string, ttl: number): Promise<void>;
    /**
     * Get time to live for a key
     */
    ttl(key: string): Promise<number>;
    /**
     * Build full Redis key with prefix
     */
    private buildKey;
    /**
     * Serialize value for storage
     */
    private serializeValue;
    /**
     * Deserialize value from storage
     */
    private deserializeValue;
    /**
     * Setup Redis event handlers
     */
    private setupEventHandlers;
    /**
     * Health check for cache
     */
    healthCheck(): Promise<{
        healthy: boolean;
        connected: boolean;
        latency?: number;
        error?: string;
    }>;
}
//# sourceMappingURL=RedisTranslationCache.d.ts.map
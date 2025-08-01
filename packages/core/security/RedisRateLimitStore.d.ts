/**
 * Redis Rate Limit Store Implementation
 * Task: T-1752989143997-617 - Add Redis or similar backend for limit tracking
 * Epic 19: Authentication Enhancement & Security Hardening
 */
import { RateLimitStore, RateLimitData } from './RateLimiter';

}
}
export interface RedisClient { get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: {)
        EX?: number;
        PX?: number }
}
    }): Promise<string | null>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    pexpire(key: string, milliseconds: number): Promise<number>;
    ttl(key: string): Promise<number>;
    del(key: string): Promise<number>;
    eval(script: string, keys: string[], args: string[]): Promise<unknown>;
    ping(): Promise<string>;
    quit(): Promise<string>;
    scanStream(options?: { )
        match?: string;
        count?: number }): AsyncIterable<string[]>;

}
}
export interface RedisRateLimitConfig { keyPrefix?: string;
    client: RedisClient;
    enableScripting?: boolean;
    connectionTimeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    fallbackToMemory?: boolean;

export declare class RedisRateLimitStore implements RateLimitStore {
    private config;
    private client;
    private fallbackStore?;
    private isRedisAvailable;
    private connectionCheckInterval?;
    private keyPrefix;
    constructor(config: RedisRateLimitConfig);
    /**
     * Get rate limit data for a key
     */
    get(key: string): Promise<RateLimitData | null>;
    /**
     * Set rate limit data for a key
     */
    set(key: string, data: RateLimitData, ttlMs: number): Promise<void>;
    /**
     * Atomically increment counter and return current count
     */
    increment(key: string, windowMs: number): Promise<{
        hits: number;
        resetTime: Date }
}
    }>;
    /**
     * Reset rate limit for a key
     */
    reset(key: string): Promise<void>;
    /**
     * Cleanup expired keys
     */
    cleanup(): Promise<void>;
    /**
     * Get statistics about the store
     */
    getStats(): Promise<{ redisAvailable: boolean;
        totalKeys: number;
        fallbackKeys: number }>;
    /**
     * Close connections and cleanup
     */
    close(): Promise<void>;
    private incrementFallback;
    private cleanupManually;
    private executeWithRetry;
    private handleRedisError;
    private startConnectionMonitoring;

export declare class RedisConnectionFactory { /**
     * Create Redis client for different environments
     */
    static createClient(_config: {)
        host?: string;
        port?: number;
        password?: string;
        db?: number;
        tls?: boolean;
        url?: string;
        maxRetriesPerRequest?: number;
        retryDelayOnFailover?: number }): Promise<RedisClient>;
    /**
     * Create Redis cluster client
     */
    static createClusterClient(_config: { )
        nodes: Array<{
            host: string;
            port: number }>;
        password?: string;
        maxRetriesPerRequest?: number;
    }): Promise<RedisClient>;

export declare class MockRedisClient implements RedisClient { private data;
    private expiries;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: {)
        EX?: number;
        PX?: number }): Promise<string | null>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    pexpire(key: string, milliseconds: number): Promise<number>;
    ttl(key: string): Promise<number>;
    del(key: string): Promise<number>;
    eval(script: string, keys: string[], args: string[]): Promise<unknown>;
    ping(): Promise<string>;
    quit(): Promise<string>;
    scanStream(options?: { )
        match?: string;
        count?: number }): AsyncIterable<string[]>;
    private checkExpiry;
    clear(): void;
    size(): number;

export default RedisRateLimitStore;
//# sourceMappingURL=RedisRateLimitStore.d.ts.map
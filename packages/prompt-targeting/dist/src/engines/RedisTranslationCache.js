/**
 * Redis-based translation cache implementation
 * Epic 10.1.5 - Performance Considerations
 */
import { createClient } from 'redis';
/**
 * Redis-based implementation of translation cache
 */
export class RedisTranslationCache {
    client;
    config;
    connected = false;
    stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0
    };
    logger = console;
    constructor(config = {}) {
        this.config = {
            url: config.url || process.env.REDIS_URL || 'redis://localhost:6379',
            host: config.host || 'localhost',
            port: config.port || 6379,
            password: config.password || process.env.REDIS_PASSWORD,
            database: config.database || 0,
            keyPrefix: config.keyPrefix || 'prompt-targeting:',
            defaultTTL: config.defaultTTL || 3600,
            enableCompression: config.enableCompression || true,
            compressionThreshold: config.compressionThreshold || 1024
        };
        this.client = createClient({
            url: this.config.url,
            password: this.config.password,
            database: this.config.database
        });
        this.setupEventHandlers();
    }
    /**
     * Initialize Redis connection
     */
    async connect() {
        try {
            await this.client.connect();
            this.connected = true;
            this.logger.log('Redis translation cache connected');
        }
        catch (error) {
            this.logger.error('Failed to connect to Redis:', error);
            throw error;
        }
    }
    /**
     * Close Redis connection
     */
    async disconnect() {
        try {
            await this.client.disconnect();
            this.connected = false;
            this.logger.log('Redis translation cache disconnected');
        }
        catch (error) {
            this.logger.error('Error disconnecting from Redis:', error);
        }
    }
    /**
     * Get cached translation result
     */
    async get(key) {
        if (!this.connected) {
            this.stats.misses++;
            return null;
        }
        try {
            const fullKey = this.buildKey(key);
            const value = await this.client.get(fullKey);
            if (value === null) {
                this.stats.misses++;
                return null;
            }
            this.stats.hits++;
            const parsed = await this.deserializeValue(value);
            this.logger.log(`Cache hit for key: ${key}`);
            return parsed;
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }
    /**
     * Cache translation result
     */
    async set(key, value, ttl) {
        if (!this.connected) {
            return;
        }
        try {
            const fullKey = this.buildKey(key);
            const serialized = await this.serializeValue(value);
            const expiration = ttl || this.config.defaultTTL;
            await this.client.setEx(fullKey, expiration, serialized);
            this.stats.sets++;
            this.logger.log(`Cached translation for key: ${key} (TTL: ${expiration}s)`);
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error(`Cache set error for key ${key}:`, error);
        }
    }
    /**
     * Check if key exists in cache
     */
    async has(key) {
        if (!this.connected) {
            return false;
        }
        try {
            const fullKey = this.buildKey(key);
            const exists = await this.client.exists(fullKey);
            return exists === 1;
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error(`Cache exists check error for key ${key}:`, error);
            return false;
        }
    }
    /**
     * Remove cached translation
     */
    async delete(key) {
        if (!this.connected) {
            return;
        }
        try {
            const fullKey = this.buildKey(key);
            await this.client.del(fullKey);
            this.stats.deletes++;
            this.logger.log(`Deleted cache entry for key: ${key}`);
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error(`Cache delete error for key ${key}:`, error);
        }
    }
    /**
     * Clear all cached translations
     */
    async clear() {
        if (!this.connected) {
            return;
        }
        try {
            const pattern = this.buildKey('*');
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
                this.logger.log(`Cleared ${keys.length} cache entries`);
            }
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Cache clear error:', error);
        }
    }
    /**
     * Get cache statistics
     */
    async stats() {
        let size = 0;
        if (this.connected) {
            try {
                const pattern = this.buildKey('*');
                const keys = await this.client.keys(pattern);
                size = keys.length;
            }
            catch (error) {
                this.logger.error('Error getting cache size:', error);
            }
        }
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            size,
            hitRate
        };
    }
    /**
     * Get detailed cache statistics
     */
    async getDetailedStats() {
        const basicStats = await this.stats();
        let redisInfo = {};
        if (this.connected) {
            try {
                const info = await this.client.info('memory');
                const keyspaceInfo = await this.client.info('keyspace');
                // Parse memory usage
                const memoryMatch = info.match(/used_memory:(\d+)/);
                const memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : undefined;
                // Parse keyspace stats
                const hitsMatch = keyspaceInfo.match(/keyspace_hits:(\d+)/);
                const missesMatch = keyspaceInfo.match(/keyspace_misses:(\d+)/);
                redisInfo = {
                    memoryUsage,
                    keyspaceHits: hitsMatch ? parseInt(hitsMatch[1]) : undefined,
                    keyspaceMisses: missesMatch ? parseInt(missesMatch[1]) : undefined
                };
            }
            catch (error) {
                this.logger.error('Error getting Redis info:', error);
            }
        }
        return {
            ...basicStats,
            sets: this.stats.sets,
            deletes: this.stats.deletes,
            errors: this.stats.errors,
            connected: this.connected,
            ...redisInfo
        };
    }
    /**
     * Set cache expiration for a key
     */
    async expire(key, ttl) {
        if (!this.connected) {
            return;
        }
        try {
            const fullKey = this.buildKey(key);
            await this.client.expire(fullKey, ttl);
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error(`Cache expire error for key ${key}:`, error);
        }
    }
    /**
     * Get time to live for a key
     */
    async ttl(key) {
        if (!this.connected) {
            return -1;
        }
        try {
            const fullKey = this.buildKey(key);
            return await this.client.ttl(fullKey);
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error(`Cache TTL error for key ${key}:`, error);
            return -1;
        }
    }
    /**
     * Build full Redis key with prefix
     */
    buildKey(key) {
        return `${this.config.keyPrefix}${key}`;
    }
    /**
     * Serialize value for storage
     */
    async serializeValue(value) {
        const json = JSON.stringify(value);
        // Apply compression if enabled and value is large enough
        if (this.config.enableCompression && json.length > this.config.compressionThreshold) {
            // For now, just return JSON - compression can be added later
            // TODO: Implement compression using zlib
            return json;
        }
        return json;
    }
    /**
     * Deserialize value from storage
     */
    async deserializeValue(value) {
        // For now, just parse JSON - decompression can be added later
        // TODO: Implement decompression using zlib
        return JSON.parse(value);
    }
    /**
     * Setup Redis event handlers
     */
    setupEventHandlers() {
        this.client.on('error', (error) => {
            this.logger.error('Redis client error:', error);
            this.connected = false;
        });
        this.client.on('connect', () => {
            this.logger.log('Redis client connected');
            this.connected = true;
        });
        this.client.on('disconnect', () => {
            this.logger.log('Redis client disconnected');
            this.connected = false;
        });
        this.client.on('reconnecting', () => {
            this.logger.log('Redis client reconnecting');
        });
    }
    /**
     * Health check for cache
     */
    async healthCheck() {
        if (!this.connected) {
            return {
                healthy: false,
                connected: false,
                error: 'Not connected to Redis'
            };
        }
        try {
            const start = Date.now();
            await this.client.ping();
            const latency = Date.now() - start;
            return {
                healthy: true,
                connected: true,
                latency
            };
        }
        catch (error) {
            return {
                healthy: false,
                connected: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
//# sourceMappingURL=RedisTranslationCache.js.map
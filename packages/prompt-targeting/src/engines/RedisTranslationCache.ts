/**
 * Redis-based translation cache implementation
 * Epic 10.1.5 - Performance Considerations
 */

import { TranslationCache, PlatformPrompt } from '../types';
import { createClient, RedisClientType } from 'redis';

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
export class RedisTranslationCache implements TranslationCache {
  private client: RedisClientType;
  private config: Required<RedisCacheConfig>;
  private connected: boolean = false;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0
  };
  private logger: Console = console;

  constructor(config: RedisCacheConfig = {}) {
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
  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.connected = true;
      this.logger.log('Redis translation cache connected');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Close Redis connection
   */
  public async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      this.connected = false;
      this.logger.log('Redis translation cache disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from Redis:', error);
    }
  }

  /**
   * Get cached translation result
   */
  public async get(key: string): Promise<PlatformPrompt | null> {
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
    } catch (error) {
      this.stats.errors++;
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Cache translation result
   */
  public async set(key: string, value: PlatformPrompt, ttl?: number): Promise<void> {
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
    } catch (error) {
      this.stats.errors++;
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Check if key exists in cache
   */
  public async has(key: string): Promise<boolean> {
    if (!this.connected) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key);
      const exists = await this.client.exists(fullKey);
      return exists === 1;
    } catch (error) {
      this.stats.errors++;
      this.logger.error(`Cache exists check error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Remove cached translation
   */
  public async delete(key: string): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      const fullKey = this.buildKey(key);
      await this.client.del(fullKey);
      
      this.stats.deletes++;
      this.logger.log(`Deleted cache entry for key: ${key}`);
    } catch (error) {
      this.stats.errors++;
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Clear all cached translations
   */
  public async clear(): Promise<void> {
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
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  public async stats(): Promise<{
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
  }> {
    let size = 0;
    
    if (this.connected) {
      try {
        const pattern = this.buildKey('*');
        const keys = await this.client.keys(pattern);
        size = keys.length;
      } catch (error) {
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
  public async getDetailedStats(): Promise<{
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
  }> {
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
      } catch (error) {
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
  public async expire(key: string, ttl: number): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      const fullKey = this.buildKey(key);
      await this.client.expire(fullKey, ttl);
    } catch (error) {
      this.stats.errors++;
      this.logger.error(`Cache expire error for key ${key}:`, error);
    }
  }

  /**
   * Get time to live for a key
   */
  public async ttl(key: string): Promise<number> {
    if (!this.connected) {
      return -1;
    }

    try {
      const fullKey = this.buildKey(key);
      return await this.client.ttl(fullKey);
    } catch (error) {
      this.stats.errors++;
      this.logger.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Build full Redis key with prefix
   */
  private buildKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  /**
   * Serialize value for storage
   */
  private async serializeValue(value: PlatformPrompt): Promise<string> {
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
  private async deserializeValue(value: string): Promise<PlatformPrompt> {
    // For now, just parse JSON - decompression can be added later
    // TODO: Implement decompression using zlib
    return JSON.parse(value);
  }

  /**
   * Setup Redis event handlers
   */
  private setupEventHandlers(): void {
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
  public async healthCheck(): Promise<{
    healthy: boolean;
    connected: boolean;
    latency?: number;
    error?: string;
  }> {
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
    } catch (error) {
      return {
        healthy: false,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
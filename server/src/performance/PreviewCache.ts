/**
 * Preview Result Caching System
 * 
 * Addresses critical performance bottleneck where identical graph+seed combinations
 * execute the full graph on every request instead of returning cached results.
 * 
 * Key optimizations:
 * - LRU cache with TTL for preview results
 * - Content-based cache keys for identical graphs
 * - Request deduplication for concurrent identical requests
 * - Configurable cache size and TTL based on environment
 */

import { Graph } from '../../../../packages/core/graphSchema';
import crypto from 'crypto';

export interface PreviewResult {
  seed: number;
  output: string;
}

export interface CachedPreviewResult {
  results: PreviewResult[];
  timestamp: number;
  ttl: number;
  executionTimeMs: number;
}

export interface PreviewCacheConfig {
  maxCacheSize: number;
  defaultTtlMs: number;
  enableDeduplication: boolean;
  enableMetrics: boolean;
}

export interface PreviewCacheMetrics {
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  totalRequests: number;
  averageExecutionTime: number;
  cacheSize: number;
  deduplicationHits: number;
}

/**
 * LRU Cache implementation with TTL support
 */
class LRUCache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number; ttl: number; accessCount: number }>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access info for LRU
    entry.accessCount++;
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: K, value: V, ttlMs: number): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttlMs,
      accessCount: 1
    });
  }

  size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
  }

  // Remove expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Request deduplication to prevent concurrent identical requests
 */
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<PreviewResult[]>>();

  async deduplicate<T>(key: string, executor: () => Promise<T>): Promise<T> {
    // Check if there's already a pending request for this key
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Create new promise for this request
    const promise = executor().finally(() => {
      // Remove from pending requests when done
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise as Promise<PreviewResult[]>);
    return promise;
  }

  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

/**
 * Main preview caching service
 */
export class PreviewCache {
  private cache: LRUCache<string, CachedPreviewResult>;
  private deduplicator: RequestDeduplicator;
  private config: PreviewCacheConfig;
  private metrics: PreviewCacheMetrics;

  constructor(config: Partial<PreviewCacheConfig> = {}) {
    this.config = {
      maxCacheSize: config.maxCacheSize || 1000,
      defaultTtlMs: config.defaultTtlMs || 5 * 60 * 1000, // 5 minutes
      enableDeduplication: config.enableDeduplication ?? true,
      enableMetrics: config.enableMetrics ?? true
    };

    this.cache = new LRUCache(this.config.maxCacheSize);
    this.deduplicator = new RequestDeduplicator();
    
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageExecutionTime: 0,
      cacheSize: 0,
      deduplicationHits: 0
    };

    // Periodic cleanup of expired entries
    setInterval(() => this.cache.cleanup(), 60000); // Every minute
  }

  /**
   * Generate cache key from graph content and parameters
   */
  private generateCacheKey(graph: Graph, runs: number, seedStart: number): string {
    // Create deterministic hash of graph structure
    const graphContent = JSON.stringify({
      nodes: graph.nodes.sort((a, b) => a.id.localeCompare(b.id)),
      edges: graph.edges?.sort((a, b) => a.id.localeCompare(b.id)) || [],
      seed: graph.seed
    });

    const hash = crypto.createHash('sha256');
    hash.update(graphContent);
    hash.update(`${runs}:${seedStart}`);
    
    return hash.digest('hex');
  }

  /**
   * Get cached preview results or execute if not found
   */
  async getCachedPreview(
    graph: Graph,
    runs: number,
    seedStart: number,
    executor: () => Promise<PreviewResult[]>
  ): Promise<PreviewResult[]> {
    const cacheKey = this.generateCacheKey(graph, runs, seedStart);
    
    if (this.config.enableMetrics) {
      this.metrics.totalRequests++;
    }

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      if (this.config.enableMetrics) {
        this.metrics.cacheHits++;
        this.updateMetrics();
      }
      return cached.results;
    }

    // Cache miss - execute with optional deduplication
    if (this.config.enableMetrics) {
      this.metrics.cacheMisses++;
    }

    if (this.config.enableDeduplication) {
      return this.deduplicator.deduplicate(cacheKey, async () => {
        const startTime = Date.now();
        const results = await executor();
        const executionTime = Date.now() - startTime;

        // Cache the results
        this.cache.set(cacheKey, {
          results,
          timestamp: Date.now(),
          ttl: this.config.defaultTtlMs,
          executionTimeMs: executionTime
        }, this.config.defaultTtlMs);

        if (this.config.enableMetrics) {
          this.updateMetrics();
        }

        return results;
      });
    } else {
      const startTime = Date.now();
      const results = await executor();
      const executionTime = Date.now() - startTime;

      // Cache the results
      this.cache.set(cacheKey, {
        results,
        timestamp: Date.now(),
        ttl: this.config.defaultTtlMs,
        executionTimeMs: executionTime
      }, this.config.defaultTtlMs);

      if (this.config.enableMetrics) {
        this.updateMetrics();
      }

      return results;
    }
  }

  /**
   * Update cache metrics
   */
  private updateMetrics(): void {
    this.metrics.hitRate = this.metrics.totalRequests > 0 
      ? this.metrics.cacheHits / this.metrics.totalRequests 
      : 0;
    this.metrics.cacheSize = this.cache.size();
    this.metrics.deduplicationHits = this.deduplicator.getPendingCount();
  }

  /**
   * Get cache performance metrics
   */
  getMetrics(): PreviewCacheMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.cache.clear();
    if (this.config.enableMetrics) {
      this.metrics = {
        cacheHits: 0,
        cacheMisses: 0,
        hitRate: 0,
        totalRequests: 0,
        averageExecutionTime: 0,
        cacheSize: 0,
        deduplicationHits: 0
      };
    }
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<PreviewCacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get cache configuration
   */
  getConfig(): PreviewCacheConfig {
    return { ...this.config };
  }
}

// Global cache instance
let globalPreviewCache: PreviewCache | null = null;

/**
 * Get or create global preview cache instance
 */
export function getPreviewCache(): PreviewCache {
  if (!globalPreviewCache) {
    const config: Partial<PreviewCacheConfig> = {
      maxCacheSize: parseInt(process.env.PREVIEW_CACHE_SIZE || '1000'),
      defaultTtlMs: parseInt(process.env.PREVIEW_CACHE_TTL_MS || '300000'), // 5 minutes
      enableDeduplication: process.env.PREVIEW_CACHE_DEDUPLICATION !== 'false',
      enableMetrics: process.env.PREVIEW_CACHE_METRICS !== 'false'
    };

    globalPreviewCache = new PreviewCache(config);
  }

  return globalPreviewCache;
}

/**
 * Reset global cache (useful for testing)
 */
export function resetPreviewCache(): void {
  globalPreviewCache = null;
}
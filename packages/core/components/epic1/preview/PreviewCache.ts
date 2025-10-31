/**
 * Epic 1 - Preview Caching System
 *
 * Stores and retrieves preview results to avoid redundant executions.
 * Uses graph hash and seed values as cache keys.
 */

import { ExecutionResult } from '../../../runtime/nodes/epic1/Epic1ExecutionEngine';
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';

export interface CacheEntry {
  hash: string;
  seeds: number[];
  results: ExecutionResult[];
  timestamp: number;
  hits: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

export class PreviewCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private maxAge: number; // milliseconds
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    hitRate: 0
  };

  constructor(maxSize: number = 100, maxAgeMinutes: number = 30) {
    this.maxSize = maxSize;
    this.maxAge = maxAgeMinutes * 60 * 1000;
  }

  /**
   * Generate a cache key from nodes, edges, and seeds
   */
  private generateKey(
    nodes: ReactFlowNode[],
    edges: ReactFlowEdge[],
    seeds: number[]
  ): string {
    const graphHash = this.hashGraph(nodes, edges);
    const seedsKey = seeds.join(',');
    return `${graphHash}-${seedsKey}`;
  }

  /**
   * Create a deterministic hash of the graph structure
   */
  private hashGraph(nodes: ReactFlowNode[], edges: ReactFlowEdge[]): string {
    // Sort nodes and edges for consistent hashing
    const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
    const sortedEdges = [...edges].sort((a, b) => a.id.localeCompare(b.id));

    // Create a string representation of the graph
    const nodeStr = sortedNodes
      .map(n => `${n.id}:${n.type}:${JSON.stringify(n.data)}`)
      .join('|');

    const edgeStr = sortedEdges.map(e => `${e.source}->${e.target}`).join('|');

    // Simple hash function (djb2)
    let hash = 5381;
    const str = `${nodeStr}::${edgeStr}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) + hash + str.charCodeAt(i);
    }

    return hash.toString(36);
  }

  /**
   * Get cached results if available and fresh
   */
  get(
    nodes: ReactFlowNode[],
    edges: ReactFlowEdge[],
    seeds: number[]
  ): ExecutionResult[] | null {
    const key = this.generateKey(nodes, edges, seeds);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if cache entry is expired
    const age = Date.now() - entry.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      this.updateHitRate();
      return null;
    }

    // Valid cache hit
    entry.hits++;
    this.stats.hits++;
    this.updateHitRate();

    // Move to end (LRU behavior)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.results;
  }

  /**
   * Store results in cache
   */
  set(
    nodes: ReactFlowNode[],
    edges: ReactFlowEdge[],
    seeds: number[],
    results: ExecutionResult[]
  ): void {
    const key = this.generateKey(nodes, edges, seeds);

    // Check if we need to evict old entries
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    const entry: CacheEntry = {
      hash: this.hashGraph(nodes, edges),
      seeds,
      results,
      timestamp: Date.now(),
      hits: 0
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
  }

  /**
   * Evict the least recently used entry
   */
  private evictOldest(): void {
    // Map maintains insertion order, so first entry is oldest
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
      this.stats.evictions++;
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.stats.evictions++;
    });

    this.stats.size = this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Check if a specific graph configuration is cached
   */
  has(
    nodes: ReactFlowNode[],
    edges: ReactFlowEdge[],
    seeds: number[]
  ): boolean {
    const key = this.generateKey(nodes, edges, seeds);
    const entry = this.cache.get(key);

    if (!entry) {return false;}

    // Check if expired
    const age = Date.now() - entry.timestamp;
    return age <= this.maxAge;
  }

  /**
   * Get the age of a cache entry in milliseconds
   */
  getAge(
    nodes: ReactFlowNode[],
    edges: ReactFlowEdge[],
    seeds: number[]
  ): number | null {
    const key = this.generateKey(nodes, edges, seeds);
    const entry = this.cache.get(key);

    if (!entry) {return null;}

    return Date.now() - entry.timestamp;
  }

  /**
   * Get cache size information
   */
  getSizeInfo(): { current: number; max: number; percentage: number } {
    return {
      current: this.cache.size,
      max: this.maxSize,
      percentage: (this.cache.size / this.maxSize) * 100
    };
  }

  /**
   * Export cache for persistence (optional)
   */
  export(): string {
    const entries: CacheEntry[] = Array.from(this.cache.values());
    return JSON.stringify({
      entries,
      stats: this.stats,
      maxSize: this.maxSize,
      maxAge: this.maxAge
    });
  }

  /**
   * Import cache from persistence (optional)
   */
  import(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.cache.clear();

      // Reconstruct cache with proper key generation
      if (parsed.entries?.length) {
        // We can't reconstruct the original key without nodes/edges
        // This is primarily for debugging/inspection
        console.warn(
          'Cache import requires nodes/edges for proper key generation'
        );
      }

      this.stats = parsed.stats;
      this.maxSize = parsed.maxSize;
      this.maxAge = parsed.maxAge;
    } catch (error) {
      console.error('Failed to import cache:', error);
    }
  }
}

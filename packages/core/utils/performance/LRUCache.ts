/**
 * LRU (Least Recently Used) Cache implementation
 * Part of Story 0.1: Performance Infrastructure
 */

export interface CacheOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  onEvict?: (key: string, value: any) => void;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

export class LRUCache<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private defaultTTL?: number;
  private onEvict?: (key: string, value: T) => void;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    sets: 0
  };

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 500;
    this.defaultTTL = options.ttl;
    this.onEvict = options.onEvict;
    this.cache = new Map();
  }

  /**
   * Get a value from the cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check if entry has expired
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: T, options?: { ttl?: number }): void {
    // Remove old entry if exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      const evictedEntry = this.cache.get(firstKey);
      
      if (evictedEntry && this.onEvict) {
        this.onEvict(firstKey, evictedEntry.value);
      }
      
      this.cache.delete(firstKey);
      this.stats.evictions++;
    }

    // Add new entry
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: options?.ttl || this.defaultTTL
    };

    this.cache.set(key, entry);
    this.stats.sets++;
  }

  /**
   * Check if a key exists in the cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    // Check expiration
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current size of the cache
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
    
    return {
      ...this.stats,
      hitRate: (hitRate * 100).toFixed(2) + '%',
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      sets: 0
    };
  }

  /**
   * Get all keys in the cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Invalidate entries matching a pattern
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let invalidated = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    return invalidated;
  }
}
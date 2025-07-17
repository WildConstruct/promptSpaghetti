import { CacheInterface } from '../types/index.js';

/**
 * Simple in-memory cache implementation
 */
export class MemoryCache implements CacheInterface {
  private cache = new Map<string, { value: any; expiry: number }>();
  private defaultTTL = 3600; // 1 hour in seconds

  async get(key: string): Promise<any> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const ttlSeconds = ttl || this.defaultTTL;
    const expiry = Date.now() + (ttlSeconds * 1000);
    
    this.cache.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    // Clean up expired entries first
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
    
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * No-op cache for testing or when caching is disabled
 */
export class NoOpCache implements CacheInterface {
  async get(): Promise<any> {
    return null;
  }

  async set(): Promise<void> {
    // Do nothing
  }

  async del(): Promise<void> {
    // Do nothing
  }

  async exists(): Promise<boolean> {
    return false;
  }
}
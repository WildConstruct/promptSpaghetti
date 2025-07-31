import { CacheInterface } from '../types/index.js';
/**
 * Simple in-memory cache implementation
 */
export declare class MemoryCache implements CacheInterface {
  private cache;
  private defaultTTL;
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  /**
   * Clear all cache entries
   */
  clear(): void;
  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
  };
}
/**
 * No-op cache for testing or when caching is disabled
 */
export declare class NoOpCache implements CacheInterface {
  get(): Promise<any>;
  set(): Promise<void>;
  del(): Promise<void>;
  exists(): Promise<boolean>;
}

/**
 * Simple in-memory cache implementation
 */
export class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 3600; // 1 hour in seconds
  }
  async get(key) {
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
  async set(key, value, ttl) {
    const ttlSeconds = ttl || this.defaultTTL;
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiry });
  }
  async del(key) {
    this.cache.delete(key);
  }
  async exists(key) {
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
  clear() {
    this.cache.clear();
  }
  /**
   * Get cache statistics
   */
  getStats() {
    // Clean up expired entries first
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
/**
 * No-op cache for testing or when caching is disabled
 */
export class NoOpCache {
  async get() {
    return null;
  }
  async set() {
    // Do nothing
  }
  async del() {
    // Do nothing
  }
  async exists() {
    return false;
  }
}

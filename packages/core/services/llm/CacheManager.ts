// LRU Cache Manager for LLM Responses

import { CacheEntry, LLMRequest, LLMResponse } from './types';

// Browser-compatible hash function
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private maxEntries: number;
  private defaultTTL: number;

  constructor(maxEntries: number = 100, defaultTTL: number = 15 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.defaultTTL = defaultTTL;
  }

  private generateKey(request: LLMRequest, model: string): string {
    const keyData = {
      prompt: request.prompt,
      context: request.context,
      model,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
      responseFormat: request.responseFormat,
      taskType: request.taskType
    };

    return simpleHash(JSON.stringify(keyData));
  }

  get(request: LLMRequest, model: string): LLMResponse | null {
    if (request.skipCache) {
      return null;
    }

    const key = this.generateKey(request, model);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return {
      ...entry.response,
      cached: true
    };
  }

  set(
    request: LLMRequest,
    model: string,
    response: LLMResponse,
    ttl?: number
  ): void {
    const key = this.generateKey(request, model);

    // Enforce max entries with LRU eviction
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    // Different TTL based on task type
    let cacheTTL = ttl || this.defaultTTL;
    if (request.taskType === 'metadata') {
      cacheTTL = 60 * 60 * 1000; // 60 minutes for metadata
    } else if (request.taskType === 'suggestion') {
      cacheTTL = 15 * 60 * 1000; // 15 minutes for suggestions
    }

    const entry: CacheEntry = {
      key,
      response,
      timestamp: Date.now(),
      ttl: cacheTTL
    };

    this.cache.set(key, entry);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxEntries,
      hitRate: 0 // Would need to track hits/misses for this
    };
  }

  // Export cache for persistence (development mode)
  export(): string {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      entry
    }));
    return JSON.stringify(entries);
  }

  // Import cache from persistence
  import(data: string): void {
    try {
      const entries = JSON.parse(data);
      this.cache.clear();

      for (const { key, entry } of entries) {
        this.cache.set(key, entry);
      }

      // Clean up expired entries after import
      this.cleanup();
    } catch (error) {
      console.error('Failed to import cache:', error);
    }
  }
}

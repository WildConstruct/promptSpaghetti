/**
 * Multi-Level Cache implementation
 * L1: Memory (Hot) - LRU Cache
 * L2: Session Storage (Warm)
 * L3: IndexedDB (Cold/Persistent)
 * Part of Story 0.1: Performance Infrastructure
 */

import { LRUCache } from './LRUCache';

export interface MultiLevelCacheOptions {
  l1Size?: number;
  l1TTL?: number;
  dbName?: string;
  storeName?: string;
}

export class MultiLevelCache<T = unknown> {
  private static instance: MultiLevelCache<unknown>;
  private l1Cache: LRUCache<T>;
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private constructor(options: MultiLevelCacheOptions = {}) {
    // L1: Memory cache
    this.l1Cache = new LRUCache({
      maxSize: options.l1Size || 500,
      ttl: options.l1TTL || 60000, // 1 minute default
      onEvict: (key, value) => {
        // When evicted from L1, promote to L2
        this.setL2(key, value);
      }
    });

    // L3: IndexedDB configuration
    this.dbName = options.dbName || 'PerformanceCache';
    this.storeName = options.storeName || 'cache';

    // Initialize IndexedDB
    this.initPromise = this.initDB();
  }

  /**
   * Get singleton instance
   */
  static getInstance(options?: MultiLevelCacheOptions): MultiLevelCache {
    if (!MultiLevelCache.instance) {
      MultiLevelCache.instance = new MultiLevelCache(options);
    }
    return MultiLevelCache.instance;
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not available');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'key'
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Get value from cache (tries all levels)
   */
  async get(key: string): Promise<T | undefined> {
    // Try L1 (Memory)
    const l1Value = this.l1Cache.get(key);
    if (l1Value !== undefined) {
      return l1Value;
    }

    // Try L2 (Session Storage)
    const l2Value = this.getL2(key);
    if (l2Value !== undefined) {
      // Promote to L1
      this.l1Cache.set(key, l2Value);
      return l2Value as T;
    }

    // Try L3 (IndexedDB)
    const l3Value = await this.getL3(key);
    if (l3Value !== undefined) {
      // Promote to L1 and L2
      this.l1Cache.set(key, l3Value);
      this.setL2(key, l3Value);
      return l3Value as T;
    }

    return undefined;
  }

  /**
   * Set value in cache
   */
  async set(
    key: string,
    value: T,
    options?: { ttl?: number }
  ): Promise<void> {
    // Always set in L1
    this.l1Cache.set(key, value, options);

    // Also set in L3 for persistence
    await this.setL3(key, value);
  }

  /**
   * Delete from all cache levels
   */
  async delete(key: string): Promise<void> {
    this.l1Cache.delete(key);
    this.deleteL2(key);
    await this.deleteL3(key);
  }

  /**
   * Clear all cache levels
   */
  async clear(): Promise<void> {
    this.l1Cache.clear();
    this.clearL2();
    await this.clearL3();
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    let invalidated = 0;

    // Invalidate L1
    invalidated += this.l1Cache.invalidatePattern(pattern);

    // Invalidate L2
    invalidated += this.invalidateL2Pattern(pattern);

    // Invalidate L3
    invalidated += await this.invalidateL3Pattern(pattern);

    return invalidated;
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const l1Stats = this.l1Cache.getStats();
    const l2Size = this.getL2Size();
    const l3Size = await this.getL3Size();

    return {
      l1: l1Stats,
      l2: { size: l2Size },
      l3: { size: l3Size },
      totalSize: l1Stats.size + l2Size + l3Size
    };
  }

  // L2 (Session Storage) operations
  private getL2(key: string): T | undefined {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return undefined;
    }

    try {
      const item = sessionStorage.getItem(`cache:${key}`);
      if (!item) {return undefined;}

      const parsed = JSON.parse(item);

      // Check expiration
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        sessionStorage.removeItem(`cache:${key}`);
        return undefined;
      }

      return parsed.value;
    } catch (e) {
      console.error('L2 cache get error:', e);
      return undefined;
    }
  }

  private setL2(key: string, value: T): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl: 300000 // 5 minutes in L2
      };
      sessionStorage.setItem(`cache:${key}`, JSON.stringify(item));
    } catch (e) {
      // Storage quota exceeded, clear old entries
      if (e instanceof DOMException && e.code === 22) {
        this.clearOldL2Entries();
        try {
          sessionStorage.setItem(
            `cache:${key}`,
            JSON.stringify({ value, timestamp: Date.now() })
          );
        } catch (e2) {
          console.error('L2 cache set error after clearing:', e2);
        }
      }
    }
  }

  private deleteL2(key: string): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(`cache:${key}`);
    }
  }

  private clearL2(): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('cache:')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  private getL2Size(): number {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return 0;
    }

    return Object.keys(sessionStorage).filter(key => key.startsWith('cache:'))
      .length;
  }

  private invalidateL2Pattern(pattern: string): number {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return 0;
    }

    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let invalidated = 0;

    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('cache:')) {
        const cacheKey = key.substring(6);
        if (regex.test(cacheKey)) {
          sessionStorage.removeItem(key);
          invalidated++;
        }
      }
    });

    return invalidated;
  }

  private clearOldL2Entries(): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    const entries: Array<{ key: string; timestamp: number }> = [];

    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('cache:')) {
        try {
          const item = JSON.parse(sessionStorage.getItem(key) || '{}');
          entries.push({ key, timestamp: item.timestamp || 0 });
        } catch {
          // Invalid entry, remove it
          sessionStorage.removeItem(key);
        }
      }
    });

    // Sort by timestamp and remove oldest 25%
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.floor(entries.length * 0.25);

    for (let i = 0; i < toRemove; i++) {
      sessionStorage.removeItem(entries[i].key);
    }
  }

  // L3 (IndexedDB) operations
  private async getL3(key: string): Promise<T | undefined> {
    if (!this.db) {
      await this.initPromise;
      if (!this.db) {
        return undefined;
      }
    }

    // At this point, this.db is guaranteed to exist
    const db = this.db;
    
    return new Promise(resolve => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(undefined);
          return;
        }

        // Check expiration
        if (result.ttl && Date.now() - result.timestamp > result.ttl) {
          // Delete expired entry
          this.deleteL3(key);
          resolve(undefined);
          return;
        }

        resolve(result.value);
      };

      request.onerror = () => {
        console.error('L3 cache get error:', request.error);
        resolve(undefined);
      };
    });
  }

  private async setL3(key: string, value: T): Promise<void> {
    if (!this.db) {
      await this.initPromise;
      if (!this.db) {
        return;
      }
    }

    // At this point, this.db is guaranteed to exist
    const db = this.db;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const data = {
        key,
        value,
        timestamp: Date.now(),
        ttl: 3600000 // 1 hour in L3
      };

      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('L3 cache set error:', request.error);
        reject(request.error);
      };
    });
  }

  private async deleteL3(key: string): Promise<void> {
    if (!this.db) {
      await this.initPromise;
      if (!this.db) {
        return;
      }
    }

    // At this point, this.db is guaranteed to exist
    const db = this.db;
    
    return new Promise(resolve => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('L3 cache delete error:', request.error);
        resolve();
      };
    });
  }

  private async clearL3(): Promise<void> {
    if (!this.db) {
      await this.initPromise;
      if (!this.db) {
        return;
      }
    }

    // At this point, this.db is guaranteed to exist
    const db = this.db;
    
    return new Promise(resolve => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('L3 cache clear error:', request.error);
        resolve();
      };
    });
  }

  private async getL3Size(): Promise<number> {
    if (!this.db) {
      await this.initPromise;
      if (!this.db) {
        return 0;
      }
    }

    // At this point, this.db is guaranteed to exist
    const db = this.db;
    
    return new Promise(resolve => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error('L3 cache count error:', request.error);
        resolve(0);
      };
    });
  }

  private async invalidateL3Pattern(pattern: string): Promise<number> {
    if (!this.db) {
      await this.initPromise;
      if (!this.db) {
        return 0;
      }
    }

    // At this point, this.db is guaranteed to exist
    const db = this.db;
    
    return new Promise(resolve => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      let invalidated = 0;

      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.openCursor();

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          if (regex.test(cursor.value.key)) {
            cursor.delete();
            invalidated++;
          }
          cursor.continue();
        } else {
          resolve(invalidated);
        }
      };

      request.onerror = () => {
        console.error('L3 pattern invalidation error:', request.error);
        resolve(invalidated);
      };
    });
  }
}

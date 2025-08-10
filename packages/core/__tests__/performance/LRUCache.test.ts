/**
 * Tests for LRU Cache
 * Story 0.1: Performance Infrastructure
 */

import { LRUCache } from '../../utils/performance/LRUCache';

describe('LRUCache', () => {
  let cache: LRUCache<string>;

  beforeEach(() => {
    cache = new LRUCache({ maxSize: 3 });
  });

  describe('Basic Operations', () => {
    test('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    test('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    test('should delete keys', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    test('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.size).toBe(0);
    });
  });

  describe('LRU Eviction', () => {
    test('should evict least recently used item when at capacity', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4'); // Should evict key1

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });

    test('should update LRU order on get', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Access key1 to make it most recently used
      cache.get('key1');

      cache.set('key4', 'value4'); // Should evict key2, not key1

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });

    test('should call eviction callback', () => {
      const onEvict = jest.fn();
      cache = new LRUCache({ maxSize: 2, onEvict });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3'); // Should evict key1

      expect(onEvict).toHaveBeenCalledWith('key1', 'value1');
    });
  });

  describe('TTL Support', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should expire entries after TTL', () => {
      cache.set('key1', 'value1', { ttl: 1000 });

      expect(cache.get('key1')).toBe('value1');

      jest.advanceTimersByTime(1001);

      expect(cache.get('key1')).toBeUndefined();
    });

    test('should use default TTL if configured', () => {
      cache = new LRUCache({ maxSize: 3, ttl: 500 });
      cache.set('key1', 'value1');

      expect(cache.get('key1')).toBe('value1');

      jest.advanceTimersByTime(501);

      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('Statistics', () => {
    test('should track cache hits and misses', () => {
      cache.set('key1', 'value1');

      cache.get('key1'); // Hit
      cache.get('key2'); // Miss
      cache.get('key1'); // Hit
      cache.get('key3'); // Miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe('50.00%');
    });

    test('should track evictions', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4'); // Evicts key1
      cache.set('key5', 'value5'); // Evicts key2

      const stats = cache.getStats();
      expect(stats.evictions).toBe(2);
    });

    test('should reset statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key2');

      cache.resetStats();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.sets).toBe(0);
    });
  });

  describe('Pattern Invalidation', () => {
    test('should invalidate entries matching pattern', () => {
      cache.set('user:1', 'data1');
      cache.set('user:2', 'data2');
      cache.set('post:1', 'data3');
      cache.set('post:2', 'data4');

      const invalidated = cache.invalidatePattern('user:*');

      expect(invalidated).toBe(2);
      expect(cache.get('user:1')).toBeUndefined();
      expect(cache.get('user:2')).toBeUndefined();
      expect(cache.get('post:1')).toBe('data3');
      expect(cache.get('post:2')).toBe('data4');
    });

    test('should handle complex patterns', () => {
      cache.set('cache:user:1', 'data1');
      cache.set('cache:post:1', 'data2');
      cache.set('temp:user:1', 'data3');

      const invalidated = cache.invalidatePattern('cache:*');

      expect(invalidated).toBe(2);
      expect(cache.get('cache:user:1')).toBeUndefined();
      expect(cache.get('cache:post:1')).toBeUndefined();
      expect(cache.get('temp:user:1')).toBe('data3');
    });
  });

  describe('Performance', () => {
    test('should handle large number of operations efficiently', () => {
      const largeCache = new LRUCache({ maxSize: 1000 });
      const start = performance.now();

      // Add 1000 items
      for (let i = 0; i < 1000; i++) {
        largeCache.set(`key${i}`, `value${i}`);
      }

      // Access all items
      for (let i = 0; i < 1000; i++) {
        largeCache.get(`key${i}`);
      }

      const duration = performance.now() - start;

      // Should complete in reasonable time (< 100ms)
      expect(duration).toBeLessThan(100);

      const stats = largeCache.getStats();
      expect(stats.hits).toBe(1000);
      expect(stats.sets).toBe(1000);
    });
  });
});

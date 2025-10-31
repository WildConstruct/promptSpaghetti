/**
 * Tests for PreviewCache
 */

import { PreviewCache } from '../PreviewCache';

describe('PreviewCache', () => {
  let cache;

  const mockNodes = [
    { id: 'node1', type: 'textBlock', data: { text: 'Hello' } },
    { id: 'node2', type: 'output', data: { label: 'out' } }
  ];

  const mockEdges = [{ id: 'edge1', source: 'node1', target: 'node2' }];

  const mockSeeds = [1234, 5678];

  const mockResults = [
    { output: 'Result 1', stats: { totalDuration: 10 } },
    { output: 'Result 2', stats: { totalDuration: 15 } }
  ];

  beforeEach(() => {
    cache = new PreviewCache(10, 30); // Small cache for testing
  });

  describe('cache operations', () => {
    it('should return null for cache miss', () => {
      const result = cache.get(mockNodes, mockEdges, mockSeeds);
      expect(result).toBeNull();

      const stats = cache.getStats();
      expect(stats.misses).toBe(1);
      expect(stats.hits).toBe(0);
      expect(stats.hitRate).toBe(0);
    });

    it('should store and retrieve results', () => {
      cache.set(mockNodes, mockEdges, mockSeeds, mockResults);

      const retrieved = cache.get(mockNodes, mockEdges, mockSeeds);
      expect(retrieved).toEqual(mockResults);

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(1);
    });

    it('should handle different seeds as different cache entries', () => {
      const seeds1 = [1111, 2222];
      const seeds2 = [3333, 4444];
      const results1 = [{ output: 'A', stats: {} }];
      const results2 = [{ output: 'B', stats: {} }];

      cache.set(mockNodes, mockEdges, seeds1, results1);
      cache.set(mockNodes, mockEdges, seeds2, results2);

      expect(cache.get(mockNodes, mockEdges, seeds1)).toEqual(results1);
      expect(cache.get(mockNodes, mockEdges, seeds2)).toEqual(results2);

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
    });

    it('should handle different graph structures as different entries', () => {
      const nodes2 = [
        { id: 'node1', type: 'textBlock', data: { text: 'World' } }
      ];

      cache.set(mockNodes, mockEdges, mockSeeds, mockResults);

      // Different nodes should result in cache miss
      expect(cache.get(nodes2, mockEdges, mockSeeds)).toBeNull();
    });
  });

  describe('cache eviction', () => {
    it('should evict oldest entry when cache is full', () => {
      // Fill cache to capacity
      for (let i = 0; i < 10; i++) {
        const seeds = [i];
        const results = [{ output: `Result ${i}`, stats: {} }];
        cache.set(mockNodes, mockEdges, seeds, results);
      }

      expect(cache.getStats().size).toBe(10);

      // Add one more - should evict the first
      const newSeeds = [999];
      const newResults = [{ output: 'New', stats: {} }];
      cache.set(mockNodes, mockEdges, newSeeds, newResults);

      expect(cache.getStats().size).toBe(10);
      expect(cache.getStats().evictions).toBe(1);

      // First entry should be gone
      expect(cache.get(mockNodes, mockEdges, [0])).toBeNull();

      // New entry should exist
      expect(cache.get(mockNodes, mockEdges, newSeeds)).toEqual(newResults);
    });

    it('should clear expired entries', () => {
      // Create cache with very short expiry (1ms)
      const shortCache = new PreviewCache(10, 0.000017); // ~1ms in minutes

      shortCache.set(mockNodes, mockEdges, mockSeeds, mockResults);
      expect(shortCache.get(mockNodes, mockEdges, mockSeeds)).toEqual(
        mockResults
      );

      // Wait for expiry
      setTimeout(() => {
        expect(shortCache.get(mockNodes, mockEdges, mockSeeds)).toBeNull();
        expect(shortCache.getStats().evictions).toBe(1);
      }, 5);
    });
  });

  describe('cache management', () => {
    it('should clear all entries', () => {
      cache.set(mockNodes, mockEdges, mockSeeds, mockResults);
      cache.set(mockNodes, mockEdges, [999], mockResults);

      expect(cache.getStats().size).toBe(2);

      cache.clear();

      expect(cache.getStats().size).toBe(0);
      expect(cache.get(mockNodes, mockEdges, mockSeeds)).toBeNull();
    });

    it('should check if entry exists', () => {
      expect(cache.has(mockNodes, mockEdges, mockSeeds)).toBe(false);

      cache.set(mockNodes, mockEdges, mockSeeds, mockResults);

      expect(cache.has(mockNodes, mockEdges, mockSeeds)).toBe(true);
    });

    it('should get entry age', () => {
      expect(cache.getAge(mockNodes, mockEdges, mockSeeds)).toBeNull();

      cache.set(mockNodes, mockEdges, mockSeeds, mockResults);

      const age = cache.getAge(mockNodes, mockEdges, mockSeeds);
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(100); // Should be very recent
    });

    it('should provide size information', () => {
      const sizeInfo = cache.getSizeInfo();
      expect(sizeInfo.current).toBe(0);
      expect(sizeInfo.max).toBe(10);
      expect(sizeInfo.percentage).toBe(0);

      cache.set(mockNodes, mockEdges, mockSeeds, mockResults);

      const newSizeInfo = cache.getSizeInfo();
      expect(newSizeInfo.current).toBe(1);
      expect(newSizeInfo.percentage).toBe(10);
    });
  });

  describe('cache statistics', () => {
    it('should track hit rate correctly', () => {
      // Miss
      cache.get(mockNodes, mockEdges, mockSeeds);
      expect(cache.getStats().hitRate).toBe(0);

      // Store
      cache.set(mockNodes, mockEdges, mockSeeds, mockResults);

      // Hit
      cache.get(mockNodes, mockEdges, mockSeeds);
      expect(cache.getStats().hitRate).toBe(0.5); // 1 hit, 1 miss

      // Another hit
      cache.get(mockNodes, mockEdges, mockSeeds);
      expect(cache.getStats().hitRate).toBeCloseTo(0.667, 2); // 2 hits, 1 miss
    });

    it('should update stats on operations', () => {
      const initialStats = cache.getStats();
      expect(initialStats).toEqual({
        hits: 0,
        misses: 0,
        evictions: 0,
        size: 0,
        hitRate: 0
      });

      // Operations
      cache.set(mockNodes, mockEdges, mockSeeds, mockResults);
      cache.get(mockNodes, mockEdges, mockSeeds); // hit
      cache.get(mockNodes, mockEdges, [9999]); // miss

      const finalStats = cache.getStats();
      expect(finalStats.hits).toBe(1);
      expect(finalStats.misses).toBe(1);
      expect(finalStats.size).toBe(1);
    });
  });

  describe('deterministic hashing', () => {
    it('should generate same hash for same graph', () => {
      const seeds1 = [1234];
      const seeds2 = [1234];

      cache.set(mockNodes, mockEdges, seeds1, mockResults);

      // Same structure should hit cache
      const result = cache.get(mockNodes, mockEdges, seeds2);
      expect(result).toEqual(mockResults);
      expect(cache.getStats().hits).toBe(1);
    });

    it('should handle node order changes', () => {
      const nodes1 = [
        { id: 'a', type: 'text', data: { value: '1' } },
        { id: 'b', type: 'text', data: { value: '2' } }
      ];

      const nodes2 = [
        { id: 'b', type: 'text', data: { value: '2' } },
        { id: 'a', type: 'text', data: { value: '1' } }
      ];

      cache.set(nodes1, [], mockSeeds, mockResults);

      // Different order but same content should still hit
      const result = cache.get(nodes2, [], mockSeeds);
      expect(result).toEqual(mockResults);
    });
  });
});

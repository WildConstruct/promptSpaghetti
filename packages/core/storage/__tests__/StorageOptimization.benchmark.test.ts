/**
 * Storage Optimization Benchmarks
 * Demonstrates performance improvements from optimized storage system
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { Node, Edge } from 'reactflow';
import { OptimizedGraphStorage } from '../OptimizedGraphStorage';
import { ExecutionCache } from '../ExecutionCache';
import { OptimizedSerializer } from '../OptimizedSerializer';
describe('Storage Optimization Benchmarks', () => {
  let largeGraphNodes: Node;
  let largeGraphEdges: Edge;
  beforeEach(() => {
    // Generate large test graph (1000 nodes, 2000 edges)
    largeGraphNodes = [];
    largeGraphEdges = [];
    for (let i = 0; i < 1000; i++) {
      largeGraphNodes.push({)
  id: `node-${i}`}
},
  type: 'WeightedChoice',
        position: { x: (i % 50) * 100, y: Math.floor(i / 50) * 100 },
        data: {
  label: `Node ${i}`}
},
  type: 'WeightedChoice',
          options: [`Option A ${i}`, `Option B ${i}`, `Option C ${i}`]}
},
  weights: [0.5, 0.3, 0.2]
      });
    // Create realistic edge connections
    for (let i = 0; i < 999; i++) {
      largeGraphEdges.push({)
  id: `edge-${i}-${i+1}`}
},
  source: `node-${i}`}
},
  target: `node-${i+1}`}
},
  type: 'default'
  });
      // Add some branching connections
      if (i % 10 === 0 && i + 10 < 1000) {
        largeGraphEdges.push({)
  id: `edge-branch-${i}-${i+10}`}
},
  source: `node-${i}`}
},
  target: `node-${i+10}`}
},
  type: 'default'
  });
  });
  describe('Node Lookup Performance', () => {
    it('should demonstrate O(1) vs O(n) lookup performance', () => {
      const arrayBasedTime = measureTime(() => {
        // Simulate old array-based approach
        for (let i = 0; i < 1000; i++) {
          const nodeId = `node-${Math.floor(Math.random() * 1000)}`;}
          const found = largeGraphNodes.find(n => n.id === nodeId);
          expect(found).toBeDefined();
      });
      const mapBasedTime = measureTime(() => {
        // Test optimized Map-based approach
        const storage = new OptimizedGraphStorage(largeGraphNodes, largeGraphEdges);
        for (let i = 0; i < 1000; i++) {
          const nodeId = `node-${Math.floor(Math.random() * 1000)}`;}
          const found = storage.getNode(nodeId);
          expect(found).toBeDefined();
      });
      console.log(`Array-based lookup: ${arrayBasedTime}ms`);}
      console.log(`Map-based lookup: ${mapBasedTime}ms`);}
      console.log(`Performance improvement: ${Math.round(arrayBasedTime / mapBasedTime)}x faster`);}
      // Map-based should be significantly faster
      expect(mapBasedTime).toBeLessThan(arrayBasedTime);
    });
    it('should demonstrate efficient node filtering by type', () => {
      const storage = new OptimizedGraphStorage(largeGraphNodes, largeGraphEdges);
      const indexedTime = measureTime(() => {
        for (let i = 0; i < 100; i++) {
          const weightedNodes = storage.getNodesByType('WeightedChoice');
          expect(weightedNodes.length).toBe(1000);
      });
      const manualFilterTime = measureTime(() => {
        for (let i = 0; i < 100; i++) {
          const weightedNodes = largeGraphNodes.filter(n => n.type === 'WeightedChoice');
          expect(weightedNodes.length).toBe(1000);
      });
      console.log(`Indexed type lookup: ${indexedTime}ms`);}
      console.log(`Manual filter: ${manualFilterTime}ms`);}
      console.log(`Type filtering improvement: ${Math.round(manualFilterTime / indexedTime)}x faster`);}
      expect(indexedTime).toBeLessThan(manualFilterTime);
    });
  });
  describe('Memory Usage Optimization', () => {
  it('should demonstrate memory efficiency of hybrid storage', () => {
  const storage = new OptimizedGraphStorage(largeGraphNodes, largeGraphEdges);
  const stats = storage.getStats();
  console.log('Optimized storage stats:', {,)
  nodeCount: stats.nodeCount,
  edgeCount: stats.edgeCount,
  estimatedMemoryMB: Math.round(stats.memoryUsage.estimatedBytes / 1024 / 1024),
  connectivity: stats.connectivityStats,
});
      // Should efficiently handle large graphs
      expect(stats.nodeCount).toBe(1000);
      expect(stats.edgeCount).toBe(1999); // 999 sequential + 100 branch edges
      expect(stats.memoryUsage.estimatedBytes).toBeGreaterThan(0);
    });
    it('should demonstrate storage compression benefits', async () => {
      const storage = new OptimizedGraphStorage(largeGraphNodes, largeGraphEdges);
      // Test regular format
      const regularFormat = storage.toCompressedFormat();
      const regularSize = JSON.stringify(regularFormat).length;
      // Should use compressed format for large graphs
      if (typeof regularFormat === 'object' && 'compressed' in regularFormat) {
        const compressionRatio = regularFormat.metadata.compression_ratio;
        console.log(`Compression achieved: ${Math.round((1 - compressionRatio) * 100)}% size reduction`);}
        expect(compressionRatio).toBeLessThan(1);
      console.log(`Storage format size: ${Math.round(regularSize / 1024)}KB`);}
    });
  });
  describe('Serialization Performance', () => {
  it('should demonstrate serialization optimization', async () => {
  const testData = {
  metadata: {
  name: 'Large Test Graph',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  fileFormatVersion: '2.0.0',
},
  graph: { nodes: largeGraphNodes, edges: largeGraphEdges },
        settings: {}
      };
      // Test pretty-printed serialization (old way)
      const prettyTime = measureTime(() => {
        const pretty = JSON.stringify(testData, null, 2);
        return pretty;
      });
      // Test compact serialization (optimized)
      const compactTime = measureTime(() => {
        const compact = JSON.stringify(testData);
        return compact;
      });
      // Test advanced serialization
      const serializer = new OptimizedSerializer();
      const advancedTime = await measureTimeAsync(async () => {
        return await serializer.serialize(testData as any, { format: 'json', prettyPrint: false });
      });
      console.log(`Pretty-printed serialization: ${prettyTime}ms`);}
      console.log(`Compact serialization: ${compactTime}ms`);}
      console.log(`Advanced serialization: ${advancedTime}ms`);}
      const prettySize = JSON.stringify(testData, null, 2).length;
      const compactSize = JSON.stringify(testData).length;
      const spaceSaved = Math.round((1 - compactSize / prettySize) * 100);
      console.log(`Space saved by removing pretty-printing: ${spaceSaved}%`);}
      expect(compactTime).toBeLessThan(prettyTime);
      expect(compactSize).toBeLessThan(prettySize);
    });
  });
  describe('Execution Cache Performance', () => {
    it('should demonstrate execution cache benefits', async () => {
      const cache = ExecutionCache.getInstance();
      cache.clearAll(); // Start fresh
      // First execution - cache miss
      const firstExecutionTime = await measureTimeAsync(async () => {
        const { storage, isFromCache } = await cache.getOptimizedGraph()
          largeGraphNodes, 
          largeGraphEdges, 
          'test-graph-1'
        );
        expect(isFromCache).toBe(false);
        return storage;
      });
      // Second execution - cache hit
      const secondExecutionTime = await measureTimeAsync(async () => {
        const { storage, isFromCache } = await cache.getOptimizedGraph()
          largeGraphNodes, 
          largeGraphEdges, 
          'test-graph-1'
        );
        expect(isFromCache).toBe(true);
        return storage;
      });
      console.log(`First execution (cache miss): ${firstExecutionTime}ms`);}
      console.log(`Second execution (cache hit): ${secondExecutionTime}ms`);}
      console.log(`Cache speedup: ${Math.round(firstExecutionTime / secondExecutionTime)}x faster`);}
      const metrics = cache.getMetrics();
      console.log('Cache metrics:', metrics);
      expect(secondExecutionTime).toBeLessThan(firstExecutionTime);
      expect(metrics.cacheHits).toBeGreaterThan(0);
    });
  });
  describe('Complex Graph Operations', () => {
    it('should handle bulk operations efficiently', () => {
      const storage = new OptimizedGraphStorage(largeGraphNodes, largeGraphEdges);
      const bulkUpdateTime = measureTime(() => {
        // Update 100 nodes at once
        for (let i = 0; i < 100; i++) {
          const updates = {
            data: {
  label: `Updated Node ${i}`}
},
  timestamp: Date.now();
  };
          storage.updateNode(`node-${i}`, updates);}
      });
      console.log(`Bulk update of 100 nodes: ${bulkUpdateTime}ms`);}
      console.log(`Average per node: ${Math.round(bulkUpdateTime / 100 * 1000)}µs`);}
      // Should be fast enough for real-time updates
      expect(bulkUpdateTime).toBeLessThan(100); // Should complete in <100ms
    });
    it('should efficiently find node connections', () => {
      const storage = new OptimizedGraphStorage(largeGraphNodes, largeGraphEdges);
      const connectionTime = measureTime(() => {
        for (let i = 0; i < 100; i++) {
          const nodeId = `node-${Math.floor(Math.random() * 1000)}`;}
          const incoming = storage.getIncomingEdges(nodeId);
          const outgoing = storage.getOutgoingEdges(nodeId);
          // Should find connections instantly
          expect(incoming).toBeDefined();
          expect(outgoing).toBeDefined();
      });
      console.log(`Connection lookup for 100 nodes: ${connectionTime}ms`);}
      expect(connectionTime).toBeLessThan(50); // Should be very fast
    });
  });
  describe('Memory Management', () => {
    it('should demonstrate garbage collection benefits', () => {
      const cache = ExecutionCache.getInstance();
      const initialStats = cache.getSizeStats();
      // Create multiple graph caches
      const promises = Array.from({ length: 10 }, async (_, i) => {
        const testNodes = largeGraphNodes.slice(0, 100); // Smaller graphs;
        const testEdges = largeGraphEdges.slice(0, 100);
        return cache.getOptimizedGraph(testNodes, testEdges, `temp-graph-${i}`);}
      });
      Promise.all(promises).then(() => {
  const midStats = cache.getSizeStats();
  // Trigger cleanup
  cache.cleanupIfNeeded();
  const finalStats = cache.getSizeStats();
  console.log('Memory management stats:', {,)
  initial: initialStats,
  mid: midStats,
  final: finalStats,
});
        // Should manage memory efficiently
        expect(finalStats.estimatedMemoryMB).toBeLessThan(midStats.estimatedMemoryMB * 2);
      });
    });
  });
});

// Utility functions
function measureTime(fn: () => any): number {
  const start = performance.now();
  fn();
  return Math.round(performance.now() - start);
async function measureTimeAsync(fn: () => Promise<any>): Promise<number> {
  const start = performance.now();
  await fn();
  return Math.round(performance.now() - start);
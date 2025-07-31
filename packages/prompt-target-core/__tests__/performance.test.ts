import { MappingEngine, OpenAIGPTAdaptor, MidjourneyAdaptor } from '../src/index';
import { ConsoleLogger, MemoryCache, MemoryMetrics } from '../src/utils/index';
describe('Performance Benchmarks', () => {
  let engine: MappingEngine;
  let logger: ConsoleLogger;
  let cache: MemoryCache;
  let metrics: MemoryMetrics;
  beforeEach(() => {
    logger = new ConsoleLogger('Benchmark');
    cache = new MemoryCache();
    metrics = new MemoryMetrics();
    engine = new MappingEngine(logger, cache, metrics);
    const context = { logger, cache, metrics, config: {} };
    engine.registerAdaptor('openai-gpt', new OpenAIGPTAdaptor(context));
    engine.registerAdaptor('midjourney', new MidjourneyAdaptor(context));
  });
  describe('Translation Performance', () => {
    it('should handle simple graphs within 100ms', async () => {
      const graph = createSimpleGraph();
      const request = {
        graph,
        targetPlatform: 'openai-gpt',
      };
      const start = performance.now();
      const response = await engine.translate(request);
      const duration = performance.now() - start;
      expect(response.success).toBe(true);
      expect(duration).toBeLessThan(100);
    });
    it('should handle medium graphs within 300ms', async () => {
      const graph = createMediumGraph();
      const request = {
        graph,
        targetPlatform: 'midjourney',
      };
      const start = performance.now();
      const response = await engine.translate(request);
      const duration = performance.now() - start;
      expect(response.success).toBe(true);
      expect(duration).toBeLessThan(300);
    });
    it('should handle large graphs within 500ms', async () => {
      const graph = createLargeGraph();
      const request = {
        graph,
        targetPlatform: 'openai-gpt',
      };
      const start = performance.now();
      const response = await engine.translate(request);
      const duration = performance.now() - start;
      expect(response.success).toBe(true);
      expect(duration).toBeLessThan(500);
    });
  });
  describe('Cache Performance', () => {
    it('should achieve 80%+ cache hit rate with repeated requests', async () => {
      const graphs = [
        createSimpleGraph(),
        createMediumGraph(),
        createSimpleGraph(), // Repeat
        createMediumGraph(), // Repeat
      ];
      const requests = graphs.map(graph => ({
        graph,
        targetPlatform: 'openai-gpt',
      }));
      // First round - populate cache
      await Promise.all(requests.map(req => engine.translate(req)));
      // Second round - should hit cache
      const start = performance.now();
      await Promise.all(requests.map(req => engine.translate(req)));
      const duration = performance.now() - start;
      // Should be much faster due to caching
      expect(duration).toBeLessThan(100); // Very fast due to cache hits
      const cacheStats = cache.getStats();
      expect(cacheStats.size).toBeGreaterThan(0);
    });
    it('should handle cache misses gracefully', async () => {
      // Create many unique graphs to test cache performance
      const graphs = Array.from({ length: 20 }, (_, i) => createVariableGraph(i));
      const requests = graphs.map(graph => ({
        graph,
        targetPlatform: 'openai-gpt',
      }));
      const start = performance.now();
      const responses = await Promise.all(requests.map(req => engine.translate(req)));
      const duration = performance.now() - start;
      // All should succeed
      expect(responses.every(r => r.success)).toBe(true);
      // Average time per translation should be reasonable
      const avgTime = duration / requests.length;
      expect(avgTime).toBeLessThan(200);
    });
  });
  describe('Concurrency Performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const requests = Array.from({ length: concurrentRequests }, (_, i) => ({
        graph: createVariableGraph(i),
        targetPlatform: i % 2 === 0 ? 'openai-gpt' : 'midjourney',
      }));
      const start = performance.now();
      const responses = await Promise.all(requests.map(req => engine.translate(req)));
      const duration = performance.now() - start;
      // All should succeed
      expect(responses.every(r => r.success)).toBe(true);
      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000);
      // Should benefit from parallel processing
      const avgTime = duration / concurrentRequests;
      expect(avgTime).toBeLessThan(300);
    });
    it('should maintain performance under load', async () => {
      const loadTestDuration = 1000; // 1 second
      const requestInterval = 50; // 50ms between requests
      const startTime = performance.now();
      const responses = [];
      while (performance.now() - startTime < loadTestDuration) {
        const request = {
          graph: createSimpleGraph(),
          targetPlatform: 'openai-gpt',
        };
        const response = await engine.translate(request);
        responses.push(response);
        // Wait before next request
        await new Promise(resolve => setTimeout(resolve, requestInterval));
      }
      // Should handle multiple requests successfully
      expect(responses.length).toBeGreaterThan(5);
      expect(responses.every(r => r.success)).toBe(true);
      // Calculate throughput
      const actualDuration = performance.now() - startTime;
      const throughput = (responses.length / actualDuration) * 1000; // req/sec
      expect(throughput).toBeGreaterThan(10); // Should handle >10 req/sec
    });
  });
  describe('Memory Performance', () => {
    it('should not leak memory with repeated operations', async () => {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      const initialMemory = process.memoryUsage();
      const iterations = 100;
      for (let i = 0; i < iterations; i++) {
        const request = {
          graph: createVariableGraph(i),
          targetPlatform: 'openai-gpt',
        };
        await engine.translate(request);
        // Occasionally check memory
        if (i % 20 === 0 && global.gc) {
          global.gc();
        }
      }
      // Force final garbage collection
      if (global.gc) {
        global.gc();
      }
      const finalMemory = process.memoryUsage();
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      // Memory growth should be reasonable (less than 50MB)
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    });
    it('should manage cache memory efficiently', async () => {
      const initialCacheSize = cache.getStats().size;
      // Fill cache with many translations
      const requests = Array.from({ length: 50 }, (_, i) => ({
        graph: createVariableGraph(i),
        targetPlatform: 'openai-gpt',
      }));
      await Promise.all(requests.map(req => engine.translate(req)));
      const finalCacheSize = cache.getStats().size;
      const cacheGrowth = finalCacheSize - initialCacheSize;
      // Cache should grow but not excessively
      expect(cacheGrowth).toBeGreaterThan(0);
      expect(cacheGrowth).toBeLessThan(100); // Reasonable cache growth
    });
  });
  describe('Stress Testing', () => {
    it('should handle rapid-fire requests', async () => {
      const rapidRequests = 50;
      const requests = [];
      const start = performance.now();
      // Fire all requests simultaneously
      for (let i = 0; i < rapidRequests; i++) {
        const request = {
          graph: createSimpleGraph(),
          targetPlatform: 'openai-gpt',
        };
        requests.push(engine.translate(request));
      }
      const responses = await Promise.all(requests);
      const duration = performance.now() - start;
      // All should succeed
      expect(responses.every(r => r.success)).toBe(true);
      // Should complete within reasonable time
      expect(duration).toBeLessThan(3000);
      // Calculate throughput
      const throughput = (rapidRequests / duration) * 1000;
      expect(throughput).toBeGreaterThan(20); // Should handle >20 req/sec
    });
  });
});
// Helper functions to create test graphs
function createSimpleGraph() {
  return {
    id: `simple-${Date.now()}-${Math.random()}`,
    version: '1.0',
    nodes: [
      {
        id: 'node1',
        type: 'text',
        data: { content: 'Simple test prompt' },
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
    metadata: {
      created: new Date(),
      modified: new Date(),
      version: '1.0',
    },
  };
}
function createMediumGraph() {
  const nodeCount = 8;
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `node${i}`,
    type: i % 3 === 0 ? 'text' : i % 3 === 1 ? 'style' : 'concat',
    data: {
      content: `Content for node ${i}`,
      style: i % 3 === 1 ? 'artistic style' : undefined,
    },
    position: { x: i * 100, y: 0 },
  }));
  const edges = Array.from({ length: nodeCount - 1 }, (_, i) => ({
    id: `edge${i}`,
    source: `node${i}`,
    target: `node${i + 1}`,
  }));
  return {
    id: `medium-${Date.now()}-${Math.random()}`,
    version: '1.0',
    nodes,
    edges,
    metadata: {
      created: new Date(),
      modified: new Date(),
      version: '1.0',
    },
  };
}
function createLargeGraph() {
  const nodeCount = 25;
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `node${i}`,
    type: ['text', 'style', 'concat', 'conditional', 'weighted'][i % 5],
    data: {
      content: `Complex content for node ${i} with detailed description`,
      style: i % 5 === 1 ? 'detailed artistic style with modifiers' : undefined,
      parameters: i % 5 === 0 ? { temperature: 0.7, max_tokens: 500 } : undefined,
    },
    position: { x: (i % 5) * 150, y: Math.floor(i / 5) * 100 },
  }));
  // Create more complex edge structure
  const edges = [];
  for (let i = 0; i < nodeCount - 1; i++) {
    edges.push({
      id: `edge${i}`,
      source: `node${i}`,
      target: `node${i + 1}`,
    });
    // Add some branching edges
    if (i % 3 === 0 && i + 5 < nodeCount) {
      edges.push({
        id: `branch${i}`,
        source: `node${i}`,
        target: `node${i + 5}`,
      });
    }
  }
  return {
    id: `large-${Date.now()}-${Math.random()}`,
    version: '1.0',
    nodes,
    edges,
    metadata: {
      created: new Date(),
      modified: new Date(),
      version: '1.0',
    },
  };
}
function createVariableGraph(seed) {
  const nodeCount = 3 + (seed % 5); // 3-7 nodes
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `var_node${seed}_${i}`,
    type: 'text',
    data: { content: `Variable content ${seed}-${i}` },
    position: { x: i * 100, y: 0 },
  }));
  const edges = Array.from({ length: nodeCount - 1 }, (_, i) => ({
    id: `var_edge${seed}_${i}`,
    source: `var_node${seed}_${i}`,
    target: `var_node${seed}_${i + 1}`,
  }));
  return {
    id: `variable-${seed}-${Date.now()}`,
    version: '1.0',
    nodes,
    edges,
    metadata: {
      created: new Date(),
      modified: new Date(),
      version: '1.0',
    },
  };
}

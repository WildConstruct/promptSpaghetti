/**
 * Node Validation Service Tests
 * Epic 18 - Add Node Validation Testing
 */
import { NodeValidationService } from '../NodeValidationService';
import { AdvancedNodeData } from '../../runtime/advanced';
describe('NodeValidationService', () => {
  let service: NodeValidationService;
  beforeEach(() => {
    service = new NodeValidationService({)
      enableCaching: true,
      enableMonitoring: true,
      cacheExpirationMs: 1000 // 1 second for testing,
    });
  });
  afterEach(() => {
    service.removeAllListeners();
  });
  describe('Single Node Validation', () => {
    it('should validate a node and return result', async () => {
      const nodeData: AdvancedNodeData = {
        id: 'test-node-1',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: true,
          stateful: false,
        },
        data: {,
          choices: ['Option A', 'Option B'],
          weights: [1, 1]
        }
      };
      const result = await service.validateNode(nodeData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.security.passed).toBe(true);
    });
    it('should cache validation results', async () => {
      const nodeData: AdvancedNodeData = {
        id: 'cached-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: true,
          stateful: false,
        },
        data: {,
          choices: ['A', 'B'],
          weights: [1, 1]
        }
      };
      // First validation - should not be cached
      const result1 = await service.validateNode(nodeData);
      // Second validation - should be from cache
      const result2 = await service.validateNode(nodeData);
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
      expect(result1).toEqual(result2);
    });
    it('should emit validation events', async () => {
      const events: any[] = [];
      service.on('validation_complete', (data) => events.push(data));
      const nodeData: AdvancedNodeData = {
        id: 'event-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: true,
          stateful: false,
        },
        data: {,
          choices: ['A'],
          weights: [1],
        }
      };
      await service.validateNode(nodeData);
      expect(events).toHaveLength(1);
      expect(events[0].nodeId).toBe('event-node');
      expect(events[0].nodeType).toBe('WeightedChoice');
      expect(events[0].valid).toBe(true);
      expect(typeof events[0].duration).toBe('number');
    });
    it('should handle validation errors gracefully', async () => {
      const errorEvents: any[] = [];
      service.on('validation_error', (data) => errorEvents.push(data));
      // Create invalid node data that will cause validation error
      const invalidNodeData = null as any;
      const result = await service.validateNode(invalidNodeData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(errorEvents).toHaveLength(1);
    });
  });
  describe('Batch Node Validation', () => {
    it('should validate multiple nodes', async () => {
      const nodes: AdvancedNodeData[] = [
        {
          id: 'batch-node-1',
          type: 'WeightedChoice',
          config: { deterministic: true, cacheable: true, stateful: false },
          data: { choices: ['A'], weights: [1] }
        },
        {
          id: 'batch-node-2',
          type: 'WeightedChoice',
          config: { deterministic: true, cacheable: true, stateful: false },
          data: { choices: ['B'], weights: [1] }
        },
        {
          id: 'batch-node-3',
          type: 'Conditional',
          config: { deterministic: true, cacheable: false, stateful: false },
          data: { condition: 'eval("dangerous")' }
        }
      ];
      const results = await service.validateNodeBatch(nodes);
      expect(results).toHaveLength(3);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(true);
      expect(results[2].valid).toBe(false); // Dangerous eval
      expect(results[2].security.passed).toBe(false);
    });
    it('should emit batch validation events', async () => {
      const startEvents: any[] = [];
      const progressEvents: any[] = [];
      const completeEvents: any[] = [];
      service.on('batch_validation_start', (data) => startEvents.push(data));
      service.on('batch_validation_progress', (data) => progressEvents.push(data));
      service.on('batch_validation_complete', (data) => completeEvents.push(data));
      const nodes: AdvancedNodeData[] = [
        {
          id: 'batch-1',
          type: 'WeightedChoice',
          config: { deterministic: true, cacheable: true, stateful: false },
          data: { choices: ['A'], weights: [1] }
        },
        {
          id: 'batch-2',
          type: 'WeightedChoice',
          config: { deterministic: true, cacheable: true, stateful: false },
          data: { choices: ['B'], weights: [1] }
        }
      ];
      await service.validateNodeBatch(nodes);
      expect(startEvents).toHaveLength(1);
      expect(startEvents[0].totalNodes).toBe(2);
      expect(completeEvents).toHaveLength(1);
      expect(completeEvents[0].totalNodes).toBe(2);
      expect(completeEvents[0].validNodes).toBe(2);
      expect(completeEvents[0].invalidNodes).toBe(0);
    });
    it('should handle empty batch', async () => {
      const results = await service.validateNodeBatch([]);
      expect(results).toHaveLength(0);
    });
    it('should respect batch size configuration', async () => {
      const smallBatchService = new NodeValidationService({)
        batchSize: 1 // Process one at a time,
      });
      const progressEvents: any[] = [];
      smallBatchService.on('batch_validation_progress', (data) => progressEvents.push(data));
      const nodes: AdvancedNodeData[] = [
        {
          id: 'small-1',
          type: 'WeightedChoice',
          config: { deterministic: true, cacheable: true, stateful: false },
          data: { choices: ['A'], weights: [1] }
        },
        {
          id: 'small-2',
          type: 'WeightedChoice',
          config: { deterministic: true, cacheable: true, stateful: false },
          data: { choices: ['B'], weights: [1] }
        }
      ];
      await smallBatchService.validateNodeBatch(nodes);
      // Should have 2 progress events (one per batch)
      expect(progressEvents).toHaveLength(2);
      expect(progressEvents[0].completedBatches).toBe(1);
      expect(progressEvents[1].completedBatches).toBe(2);
    });
  });
  describe('Streaming Validation', () => {
    it('should validate nodes with streaming results', async () => {
      const nodes: AdvancedNodeData[] = [
        {
          id: 'stream-1',
          type: 'WeightedChoice',
          config: { deterministic: true, cacheable: true, stateful: false },
          data: { choices: ['A'], weights: [1] }
        },
        {
          id: 'stream-2',
          type: 'WeightedChoice',
          config: { deterministic: true, cacheable: true, stateful: false },
          data: { choices: ['B'], weights: [1] }
        }
      ];
      const results: any[] = [];
      for await (const result of service.validateNodeStream(nodes)) {
        results.push(result);
      }
      expect(results).toHaveLength(2);
      expect(results[0].index).toBe(0);
      expect(results[0].node.id).toBe('stream-1');
      expect(results[0].result.valid).toBe(true);
      expect(results[1].index).toBe(1);
      expect(results[1].node.id).toBe('stream-2');
      expect(results[1].result.valid).toBe(true);
    });
  });
  describe('Metrics and Monitoring', () => {
    it('should track validation metrics', async () => {
      const nodeData: AdvancedNodeData = {
        id: 'metrics-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: true,
          stateful: false,
        },
        data: {,
          choices: ['A', 'B'],
          weights: [1, 1]
        }
      };
      // Perform some validations
      await service.validateNode(nodeData);
      await service.validateNode(nodeData); // Should be cached
      const metrics = service.getMetrics();
      expect(metrics.totalValidations).toBeGreaterThan(0);
      expect(metrics.successfulValidations).toBeGreaterThan(0);
      expect(metrics.averageValidationTime).toBeGreaterThan(0);
    });
    it('should track security threats in metrics', async () => {
      const dangerousNode: AdvancedNodeData = {
        id: 'dangerous-node',
        type: 'Conditional',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: false,
        },
        data: {,
          condition: 'eval("malicious")',
        }
      };
      await service.validateNode(dangerousNode);
      const metrics = service.getMetrics();
      expect(metrics.securityThreatsDetected).toBeGreaterThan(0);
      expect(metrics.failedValidations).toBeGreaterThan(0);
    });
  });
  describe('Cache Management', () => {
    it('should provide cache statistics', async () => {
      const nodeData: AdvancedNodeData = {
        id: 'cache-stats-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: true,
          stateful: false,
        },
        data: {,
          choices: ['A'],
          weights: [1],
        }
      };
      await service.validateNode(nodeData);
      const stats = service.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(typeof stats.hitRate).toBe('number');
      expect(typeof stats.oldestEntry).toBe('number');
      expect(typeof stats.newestEntry).toBe('number');
    });
    it('should clear cache on demand', async () => {
      const nodeData: AdvancedNodeData = {
        id: 'clear-cache-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: true,
          stateful: false,
        },
        data: {,
          choices: ['A'],
          weights: [1],
        }
      };
      await service.validateNode(nodeData);
      let stats = service.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      const clearEvents: any[] = [];
      service.on('cache_cleared', (data) => clearEvents.push(data));
      service.clearCache();
      stats = service.getCacheStats();
      expect(stats.size).toBe(0);
      expect(clearEvents).toHaveLength(1);
    });
    it('should automatically expire cache entries', async () => {
      const shortCacheService = new NodeValidationService({)
        cacheExpirationMs: 100 // 100ms expiration,
      });
      const nodeData: AdvancedNodeData = {
        id: 'expire-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: true,
          stateful: false,
        },
        data: {,
          choices: ['A'],
          weights: [1],
        }
      };
      await shortCacheService.validateNode(nodeData);
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      const cleanupEvents: any[] = [];
      shortCacheService.on('cache_cleanup', (data) => cleanupEvents.push(data));
      // Trigger cleanup manually (normally happens on interval)
      shortCacheService['cleanupCache']();
      expect(cleanupEvents).toHaveLength(1);
      expect(cleanupEvents[0].expiredEntries).toBeGreaterThan(0);
    });
  });
  describe('Configuration Updates', () => {
    it('should allow runtime configuration updates', () => {
      const configEvents: any[] = [];
      service.on('config_updated', (data) => configEvents.push(data));
      service.updateConfig({)
        strictTypeValidation: false,
        maxMemoryUsage: 100 * 1024 * 1024 // 100MB,
      });
      expect(configEvents).toHaveLength(1);
      expect(configEvents[0].newConfig.strictTypeValidation).toBe(false);
      expect(configEvents[0].newConfig.maxMemoryUsage).toBe(100 * 1024 * 1024);
    });
    it('should respect updated configuration in validation', async () => {
      // Update config to disable security validation
      service.updateConfig({)
        securityValidation: false,
      });
      const dangerousNode: AdvancedNodeData = {
        id: 'config-test-node',
        type: 'Conditional',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: false,
        },
        data: {,
          condition: 'eval("should be blocked but isn\'t")',
        }
      };
      const result = await service.validateNode(dangerousNode);
      // Should pass because security validation is disabled
      expect(result.security.passed).toBe(true);
      expect(result.security.threats).toHaveLength(0);
    });
  });
  describe('Validation Reports', () => {
    it('should generate comprehensive validation report', async () => {
      const nodes: AdvancedNodeData[] = [
        {
          id: 'report-node-1',
          type: 'WeightedChoice',
          config: { deterministic: true, cacheable: true, stateful: false },
          data: { choices: ['A'], weights: [1] }
        },
        {
          id: 'report-node-2',
          type: 'Conditional',
          config: { deterministic: true, cacheable: false, stateful: false },
          data: { condition: 'eval("dangerous")' }
        }
      ];
      const results = await service.validateNodeBatch(nodes);
      const report = service.exportValidationReport(nodes, results);
      expect(typeof report).toBe('string');
      const parsed = JSON.parse(report);
      expect(parsed.summary.totalNodes).toBe(2);
      expect(parsed.summary.validNodes).toBe(1);
      expect(parsed.summary.invalidNodes).toBe(1);
      expect(parsed.summary.securityThreats).toBeGreaterThan(0);
      expect(parsed.results).toHaveLength(2);
      expect(parsed.metrics).toBeDefined();
    });
  });
  describe('Error Handling', () => {
    it('should handle validation framework errors', async () => {
      // Mock a validation framework that throws
      const errorService = new NodeValidationService();
      // Simulate framework error by passing invalid data
      const invalidData = { invalid: 'data' } as any;
      const result = await errorService.validateNode(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    it('should handle batch validation errors gracefully', async () => {
      const mixedNodes: any[] = [
        {
          id: 'valid-node',
          type: 'WeightedChoice',
          config: { deterministic: true, cacheable: true, stateful: false },
          data: { choices: ['A'], weights: [1] }
        },
        { invalid: 'node data' }, // Invalid node
        {
          id: 'another-valid-node',
          type: 'WeightedChoice',
          config: { deterministic: true, cacheable: true, stateful: false },
          data: { choices: ['B'], weights: [1] }
        }
      ];
      const results = await service.validateNodeBatch(mixedNodes);
      expect(results).toHaveLength(3);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(false); // Invalid node
      expect(results[2].valid).toBe(true);
    });
  });
});
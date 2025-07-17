import { MappingEngine } from '../src/engine/MappingEngine.js';
import { OpenAIGPTAdaptor } from '../src/adaptors/OpenAIGPTAdaptor.js';
import { MidjourneyAdaptor } from '../src/adaptors/MidjourneyAdaptor.js';
import { 
  PromptGraph, 
  TranslationRequest, 
  Platform,
  TranslationError 
} from '../src/types/index.js';
import { ConsoleLogger, MemoryCache, MemoryMetrics } from '../src/utils/index.js';

describe('MappingEngine', () => {
  let engine: MappingEngine;
  let gptAdaptor: OpenAIGPTAdaptor;
  let midjourneyAdaptor: MidjourneyAdaptor;
  let logger: ConsoleLogger;
  let cache: MemoryCache;
  let metrics: MemoryMetrics;

  beforeEach(() => {
    logger = new ConsoleLogger('Test');
    cache = new MemoryCache();
    metrics = new MemoryMetrics();
    engine = new MappingEngine(logger, cache, metrics);

    const context = {
      logger,
      cache,
      metrics,
      config: {}
    };

    gptAdaptor = new OpenAIGPTAdaptor(context);
    midjourneyAdaptor = new MidjourneyAdaptor(context);
  });

  describe('adaptor management', () => {
    it('should register and unregister adaptors', () => {
      expect(engine.getRegisteredPlatforms()).toHaveLength(0);
      
      engine.registerAdaptor('openai-gpt', gptAdaptor);
      expect(engine.getRegisteredPlatforms()).toContain('openai-gpt');
      expect(engine.isPlatformSupported('openai-gpt')).toBe(true);
      
      engine.registerAdaptor('midjourney', midjourneyAdaptor);
      expect(engine.getRegisteredPlatforms()).toHaveLength(2);
      
      engine.unregisterAdaptor('openai-gpt');
      expect(engine.getRegisteredPlatforms()).not.toContain('openai-gpt');
      expect(engine.isPlatformSupported('openai-gpt')).toBe(false);
    });

    it('should get specific adaptors', () => {
      engine.registerAdaptor('openai-gpt', gptAdaptor);
      
      const retrievedAdaptor = engine.getAdaptor('openai-gpt');
      expect(retrievedAdaptor).toBe(gptAdaptor);
      
      const missingAdaptor = engine.getAdaptor('nonexistent' as Platform);
      expect(missingAdaptor).toBeUndefined();
    });
  });

  describe('translation', () => {
    beforeEach(() => {
      engine.registerAdaptor('openai-gpt', gptAdaptor);
      engine.registerAdaptor('midjourney', midjourneyAdaptor);
    });

    it('should translate simple graphs successfully', async () => {
      const graph: PromptGraph = {
        id: 'simple-graph',
        version: '1.0',
        nodes: [
          {
            id: 'text-node',
            type: 'text',
            data: { content: 'Write a story about robots' },
            position: { x: 0, y: 0 }
          }
        ],
        edges: [],
        metadata: {
          created: new Date(),
          modified: new Date(),
          version: '1.0'
        }
      };

      const request: TranslationRequest = {
        graph,
        targetPlatform: 'openai-gpt'
      };

      const response = await engine.translate(request);
      
      expect(response.success).toBe(true);
      expect(response.targetPrompt).toBeDefined();
      expect(response.targetPrompt?.platform).toBe('openai-gpt');
      expect(response.quality).toBeDefined();
      expect(response.timing).toBeDefined();
      expect(response.timing.total).toBeGreaterThan(0);
    });

    it('should handle complex graphs with multiple nodes', async () => {
      const graph: PromptGraph = {
        id: 'complex-graph',
        version: '1.0',
        nodes: [
          {
            id: 'subject',
            type: 'text',
            data: { content: 'A magical forest' },
            position: { x: 0, y: 0 }
          },
          {
            id: 'style',
            type: 'style',
            data: { style: 'fantasy art, detailed' },
            position: { x: 100, y: 0 }
          },
          {
            id: 'concat',
            type: 'concat',
            data: { label: 'Combine' },
            position: { x: 200, y: 0 }
          }
        ],
        edges: [
          { id: 'e1', source: 'subject', target: 'concat' },
          { id: 'e2', source: 'style', target: 'concat' }
        ],
        metadata: {
          created: new Date(),
          modified: new Date(),
          version: '1.0'
        }
      };

      const request: TranslationRequest = {
        graph,
        targetPlatform: 'midjourney'
      };

      const response = await engine.translate(request);
      
      expect(response.success).toBe(true);
      expect(response.targetPrompt?.format).toBe('midjourney_prompt');
      expect(typeof response.targetPrompt?.content).toBe('string');
      
      const promptContent = response.targetPrompt?.content as string;
      expect(promptContent).toContain('magical forest');
      expect(promptContent).toContain('fantasy art');
    });

    it('should fail for unsupported platforms', async () => {
      const graph: PromptGraph = {
        id: 'test-graph',
        version: '1.0',
        nodes: [
          {
            id: 'node',
            type: 'text',
            data: { content: 'Test' },
            position: { x: 0, y: 0 }
          }
        ],
        edges: [],
        metadata: {
          created: new Date(),
          modified: new Date(),
          version: '1.0'
        }
      };

      const request: TranslationRequest = {
        graph,
        targetPlatform: 'unsupported-platform' as Platform
      };

      const response = await engine.translate(request);
      
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe('ADAPTOR_NOT_FOUND');
    });

    it('should validate requests and reject invalid graphs', async () => {
      const invalidGraph: PromptGraph = {
        id: 'invalid',
        version: '1.0',
        nodes: [],
        edges: [],
        metadata: {
          created: new Date(),
          modified: new Date(),
          version: '1.0'
        }
      };

      const request: TranslationRequest = {
        graph: invalidGraph,
        targetPlatform: 'openai-gpt'
      };

      const response = await engine.translate(request);
      
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('INVALID_GRAPH');
    });

    it('should handle invalid edge references', async () => {
      const graphWithInvalidEdges: PromptGraph = {
        id: 'invalid-edges',
        version: '1.0',
        nodes: [
          {
            id: 'valid-node',
            type: 'text',
            data: { content: 'Valid content' },
            position: { x: 0, y: 0 }
          }
        ],
        edges: [
          { id: 'bad-edge', source: 'valid-node', target: 'nonexistent-node' }
        ],
        metadata: {
          created: new Date(),
          modified: new Date(),
          version: '1.0'
        }
      };

      const request: TranslationRequest = {
        graph: graphWithInvalidEdges,
        targetPlatform: 'openai-gpt'
      };

      const response = await engine.translate(request);
      
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('INVALID_GRAPH');
      expect(response.error?.details?.targetId).toBe('nonexistent-node');
    });
  });

  describe('caching', () => {
    beforeEach(() => {
      engine.registerAdaptor('openai-gpt', gptAdaptor);
    });

    it('should cache translation results', async () => {
      const graph: PromptGraph = {
        id: 'cache-test',
        version: '1.0',
        nodes: [
          {
            id: 'node',
            type: 'text',
            data: { content: 'Cache test content' },
            position: { x: 0, y: 0 }
          }
        ],
        edges: [],
        metadata: {
          created: new Date(),
          modified: new Date(),
          version: '1.0'
        }
      };

      const request: TranslationRequest = {
        graph,
        targetPlatform: 'openai-gpt'
      };

      // First translation - should miss cache
      const response1 = await engine.translate(request);
      expect(response1.success).toBe(true);
      
      // Second translation - should hit cache
      const response2 = await engine.translate(request);
      expect(response2.success).toBe(true);
      
      // Both should have the same translation ID (from cache)
      expect(response1.targetPrompt?.metadata.translationId)
        .toBe(response2.targetPrompt?.metadata.translationId);
      
      // Second request should be faster (from cache)
      expect(response2.timing.total).toBeLessThanOrEqual(response1.timing.total);
    });

    it('should generate different cache keys for different options', async () => {
      const graph: PromptGraph = {
        id: 'options-test',
        version: '1.0',
        nodes: [
          {
            id: 'node',
            type: 'text',
            data: { content: 'Options test' },
            position: { x: 0, y: 0 }
          }
        ],
        edges: [],
        metadata: {
          created: new Date(),
          modified: new Date(),
          version: '1.0'
        }
      };

      const request1: TranslationRequest = {
        graph,
        targetPlatform: 'openai-gpt',
        options: { optimize: true }
      };

      const request2: TranslationRequest = {
        graph,
        targetPlatform: 'openai-gpt',
        options: { optimize: false }
      };

      const response1 = await engine.translate(request1);
      const response2 = await engine.translate(request2);
      
      expect(response1.success).toBe(true);
      expect(response2.success).toBe(true);
      
      // Should have different translation IDs (different cache entries)
      expect(response1.targetPrompt?.metadata.translationId)
        .not.toBe(response2.targetPrompt?.metadata.translationId);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      engine.registerAdaptor('openai-gpt', gptAdaptor);
    });

    it('should handle adaptor errors gracefully', async () => {
      // Create a mock adaptor that throws an error
      const errorAdaptor = {
        ...gptAdaptor,
        transform: jest.fn().mockRejectedValue(new Error('Adaptor error'))
      };

      engine.registerAdaptor('error-platform' as Platform, errorAdaptor as any);

      const graph: PromptGraph = {
        id: 'error-test',
        version: '1.0',
        nodes: [
          {
            id: 'node',
            type: 'text',
            data: { content: 'Error test' },
            position: { x: 0, y: 0 }
          }
        ],
        edges: [],
        metadata: {
          created: new Date(),
          modified: new Date(),
          version: '1.0'
        }
      };

      const request: TranslationRequest = {
        graph,
        targetPlatform: 'error-platform' as Platform
      };

      const response = await engine.translate(request);
      
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.timing.total).toBeGreaterThan(0);
    });

    it('should handle cache errors gracefully', async () => {
      // Mock cache to throw errors
      const errorCache = {
        get: jest.fn().mockRejectedValue(new Error('Cache error')),
        set: jest.fn().mockRejectedValue(new Error('Cache error')),
        del: jest.fn(),
        exists: jest.fn()
      };

      const errorEngine = new MappingEngine(logger, errorCache as any, metrics);
      errorEngine.registerAdaptor('openai-gpt', gptAdaptor);

      const graph: PromptGraph = {
        id: 'cache-error-test',
        version: '1.0',
        nodes: [
          {
            id: 'node',
            type: 'text',
            data: { content: 'Cache error test' },
            position: { x: 0, y: 0 }
          }
        ],
        edges: [],
        metadata: {
          created: new Date(),
          modified: new Date(),
          version: '1.0'
        }
      };

      const request: TranslationRequest = {
        graph,
        targetPlatform: 'openai-gpt'
      };

      // Should still succeed despite cache errors
      const response = await errorEngine.translate(request);
      expect(response.success).toBe(true);
    });
  });

  describe('statistics', () => {
    it('should provide engine statistics', () => {
      engine.registerAdaptor('openai-gpt', gptAdaptor);
      engine.registerAdaptor('midjourney', midjourneyAdaptor);

      const stats = engine.getStats();
      
      expect(stats.registeredAdaptors).toBe(2);
      expect(stats.supportedPlatforms).toContain('openai-gpt');
      expect(stats.supportedPlatforms).toContain('midjourney');
      expect(stats.adaptorInfo).toHaveLength(2);
      
      const gptInfo = stats.adaptorInfo.find(info => info.platform === 'openai-gpt');
      expect(gptInfo).toBeDefined();
      expect(gptInfo?.id).toBe('openai-gpt');
      expect(gptInfo?.version).toBe('1.0.0');
    });
  });

  describe('performance', () => {
    beforeEach(() => {
      engine.registerAdaptor('openai-gpt', gptAdaptor);
    });

    it('should complete translations within reasonable time', async () => {
      const graph: PromptGraph = {
        id: 'performance-test',
        version: '1.0',
        nodes: Array.from({ length: 10 }, (_, i) => ({
          id: `node-${i}`,
          type: 'text' as const,
          data: { content: `Content ${i}` },
          position: { x: i * 50, y: 0 }
        })),
        edges: Array.from({ length: 9 }, (_, i) => ({
          id: `edge-${i}`,
          source: `node-${i}`,
          target: `node-${i + 1}`
        })),
        metadata: {
          created: new Date(),
          modified: new Date(),
          version: '1.0'
        }
      };

      const request: TranslationRequest = {
        graph,
        targetPlatform: 'openai-gpt'
      };

      const startTime = Date.now();
      const response = await engine.translate(request);
      const duration = Date.now() - startTime;

      expect(response.success).toBe(true);
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});
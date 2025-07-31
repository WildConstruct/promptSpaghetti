/**
 * Integration tests for prompt targeting system
 * Epic 10.1.4 - Multi-Platform Validation
 */

import { createBasicPromptTargetingSystem, OpenAIAdaptor, MidjourneyAdaptor } from '../index';

describe('Prompt Targeting System Integration', () => {
  let system: any;
  let openaiAdaptor: OpenAIAdaptor;
  let midjourneyAdaptor: MidjourneyAdaptor;

  beforeEach(async () => {
    // Create system without cache for testing
    system = createBasicPromptTargetingSystem();

    // Create adaptors
    openaiAdaptor = new OpenAIAdaptor();
    midjourneyAdaptor = new MidjourneyAdaptor();

    // Initialize adaptors with test config
    await openaiAdaptor.initialize({
      openai: {
        apiKey: 'test-key',
        model: 'gpt-3.5-turbo',
      },
    });

    await midjourneyAdaptor.initialize({
      midjourney: {
        version: '6',
        defaultAspectRatio: '1:1',
      },
    });

    // Register adaptors
    await system.registry.register(openaiAdaptor);
    await system.registry.register(midjourneyAdaptor);
  });

  afterEach(async () => {
    await openaiAdaptor.cleanup();
    await midjourneyAdaptor.cleanup();
  });

  describe('Adaptor Registration', () => {
    test('should register adaptors successfully', () => {
      const adaptors = system.registry.list();
      expect(adaptors).toHaveLength(2);

      const openai = system.registry.get('openai-gpt');
      const midjourney = system.registry.get('midjourney-v6');

      expect(openai).toBeDefined();
      expect(midjourney).toBeDefined();
    });

    test('should find adaptors by platform', () => {
      const openaiAdaptors = system.registry.findByPlatform('openai');
      const midjourneyAdaptors = system.registry.findByPlatform('midjourney');

      expect(openaiAdaptors).toHaveLength(1);
      expect(midjourneyAdaptors).toHaveLength(1);

      expect(openaiAdaptors[0].id).toBe('openai-gpt');
      expect(midjourneyAdaptors[0].id).toBe('midjourney-v6');
    });
  });

  describe('Text-to-Text Translation (OpenAI)', () => {
    const sampleGraph = {
      nodes: [
        {
          id: '1',
          type: 'output',
          data: {
            text: 'Write a creative story about a robot discovering emotions.',
          },
        },
      ],
      edges: [],
    };

    test('should validate OpenAI graph successfully', async () => {
      const result = await system.engine.validateTranslation(sampleGraph, 'openai');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.compatibilityScore).toBeGreaterThan(0.8);
    });

    test('should transform graph to OpenAI format', async () => {
      const result = await system.engine.translate(sampleGraph, 'openai', {
        qualityPreference: 0.8,
        enableOptimizations: true,
      });

      expect(result.platform).toBe('openai');
      expect(result.prompt).toContain('robot discovering emotions');
      expect(result.parameters.model).toBe('gpt-3.5-turbo');
      expect(result.parameters.temperature).toBeLessThan(0.5); // High quality = low temperature
      expect(result.metadata.sourceHash).toBeDefined();
      expect(result.metadata.qualityScore).toBeGreaterThan(0.8);
    });
  });

  describe('Text-to-Image Translation (Midjourney)', () => {
    const sampleGraph = {
      nodes: [
        {
          id: '1',
          type: 'subject',
          data: {
            text: 'A majestic dragon flying over a mountain range',
          },
        },
        {
          id: '2',
          type: 'style',
          data: {
            style: 'fantasy',
          },
        },
      ],
      edges: [
        {
          id: 'e1',
          source: '1',
          target: '2',
        },
      ],
    };

    test('should validate Midjourney graph successfully', async () => {
      const result = await system.engine.validateTranslation(sampleGraph, 'midjourney');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.compatibilityScore).toBeGreaterThan(0.8);
    });

    test('should transform graph to Midjourney format', async () => {
      const result = await system.engine.translate(sampleGraph, 'midjourney', {
        qualityPreference: 0.9,
        stylePreference: 'artistic',
      });

      expect(result.platform).toBe('midjourney');
      expect(result.prompt).toContain('/imagine prompt:');
      expect(result.prompt).toContain('dragon flying over a mountain');
      expect(result.prompt).toContain('fantasy, magical, ethereal');
      expect(result.parameters.quality).toBeGreaterThan(1);
      expect(result.parameters.stylize).toBe(250); // Artistic style
      expect(result.metadata.sourceHash).toBeDefined();
    });

    test('should handle aspect ratio parameters', async () => {
      const graphWithAspectRatio = {
        ...sampleGraph,
        nodes: [
          ...sampleGraph.nodes,
          {
            id: '3',
            type: 'aspectRatio',
            data: {
              aspectRatio: 'landscape',
            },
          },
        ],
      };

      const result = await system.engine.translate(graphWithAspectRatio, 'midjourney');

      expect(result.prompt).toContain('--ar 16:9');
      expect(result.parameters.aspect).toBe('16:9');
    });
  });

  describe('Batch Translation', () => {
    const sampleGraph = {
      nodes: [
        {
          id: '1',
          type: 'output',
          data: {
            text: 'A creative prompt that works for both text and image generation',
          },
        },
      ],
      edges: [],
    };

    test('should translate to multiple platforms', async () => {
      const results = await system.engine.translateBatch(sampleGraph, ['openai', 'midjourney']);

      expect(Object.keys(results)).toHaveLength(2);
      expect(results.openai).toBeDefined();
      expect(results.midjourney).toBeDefined();

      expect(results.openai.platform).toBe('openai');
      expect(results.midjourney.platform).toBe('midjourney');

      // Should have different formats
      expect(results.openai.prompt).not.toContain('/imagine');
      expect(results.midjourney.prompt).toContain('/imagine');
    });
  });

  describe('Validation Edge Cases', () => {
    test('should handle empty graph', async () => {
      const emptyGraph = { nodes: [], edges: [] };

      const openaiResult = await system.engine.validateTranslation(emptyGraph, 'openai');
      const midjourneyResult = await system.engine.validateTranslation(emptyGraph, 'midjourney');

      expect(openaiResult.warnings.some(w => w.code === 'EMPTY_GRAPH')).toBe(true);
      expect(midjourneyResult.warnings.some(w => w.code === 'EMPTY_GRAPH')).toBe(true);
    });

    test('should handle unsupported platform', async () => {
      const sampleGraph = {
        nodes: [{ id: '1', type: 'output', data: { text: 'test' } }],
        edges: [],
      };

      const result = await system.engine.validateTranslation(sampleGraph, 'unknown-platform');

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'NO_ADAPTOR_FOUND')).toBe(true);
    });

    test('should detect content mismatch warnings', async () => {
      const textOnlyGraph = {
        nodes: [
          {
            id: '1',
            type: 'output',
            data: {
              text: 'Write a detailed article about economic policy',
            },
          },
        ],
        edges: [],
      };

      const midjourneyResult = await system.engine.validateTranslation(textOnlyGraph, 'midjourney');

      expect(midjourneyResult.warnings.some(w => w.code === 'TEXT_ONLY_CONTENT')).toBe(true);
    });
  });

  describe('Performance and Caching', () => {
    test('should track translation performance', async () => {
      const sampleGraph = {
        nodes: [{ id: '1', type: 'output', data: { text: 'test prompt' } }],
        edges: [],
      };

      const startTime = Date.now();
      const result = await system.engine.translate(sampleGraph, 'openai');
      const endTime = Date.now();

      expect(result.metadata.timestamp).toBeDefined();
      expect(result.metadata.qualityScore).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should be fast without actual API calls
    });
  });
});

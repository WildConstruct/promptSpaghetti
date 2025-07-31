/**
 * Tests for enhanced adaptor framework
 * Epic 10.2.1 - Enhanced ModelAdaptor Base Class Testing
 */

import { AdaptorTestFramework, EnhancedOpenAIAdaptor, AdvancedBaseAdaptor, AdvancedAdaptorConfig } from '../index';

describe('Enhanced Adaptor Framework', () => {
  let testFramework: AdaptorTestFramework;
  let enhancedOpenAI: EnhancedOpenAIAdaptor;

  beforeEach(() => {
    testFramework = new AdaptorTestFramework();
    enhancedOpenAI = new EnhancedOpenAIAdaptor();
  });

  afterEach(async () => {
    await enhancedOpenAI.cleanup();
  });

  describe('Enhanced OpenAI Adaptor', () => {
    test('should complete comprehensive test suite', async () => {
      const testCases = testFramework.createOpenAITestCases();

      const results = await testFramework.runTestSuite({
        name: 'Enhanced OpenAI Adaptor Test Suite',
        adaptor: enhancedOpenAI,
        testCases,
        setup: async () => {
          await enhancedOpenAI.initialize({
            openai: {
              apiKey: 'test-key',
              model: 'gpt-4',
            },
            monitoring: {
              enableTiming: true,
              enableEvents: true,
            },
          });
        },
      });

      expect(results.passedTests).toBeGreaterThan(results.failedTests);
      expect(results.summary.validationTests).toBeGreaterThan(0);
      expect(results.summary.translationTests).toBeGreaterThan(0);
    });

    test('should handle advanced pipeline configuration', async () => {
      await enhancedOpenAI.initialize({
        openai: { apiKey: 'test-key', model: 'gpt-4' },
      });

      const config: AdvancedAdaptorConfig = {
        qualityPreference: 0.9,
        pipeline: {
          skipValidation: false,
          skipOptimization: false,
          retries: {
            maxAttempts: 3,
            backoffMs: 100,
          },
        },
        monitoring: {
          enableTiming: true,
          enableMemoryTracking: true,
          enableEvents: true,
        },
      };

      const graph = {
        nodes: [
          { id: '1', type: 'system', data: { text: 'You are a creative writing assistant' } },
          { id: '2', type: 'user', data: { text: 'Write a story about time travel' } },
        ],
        edges: [{ id: 'e1', source: '1', target: '2' }],
      };

      const result = await enhancedOpenAI.transform(graph, config);

      expect(result.platform).toBe('openai');
      expect(result.metadata.pipeline).toBeDefined();
      expect(result.metadata.pipeline.adaptorId).toBe('enhanced-openai-gpt');
      expect(result.metadata.optimizations).toBeInstanceOf(Array);
    });

    test('should emit pipeline events', async () => {
      await enhancedOpenAI.initialize({
        openai: { apiKey: 'test-key' },
        monitoring: { enableEvents: true },
      });

      const events: string[] = [];

      enhancedOpenAI.on('pipeline:start', () => events.push('start'));
      enhancedOpenAI.on('pipeline:stage', (stage: string) => events.push(`stage:${stage}`));
      enhancedOpenAI.on('pipeline:complete', () => events.push('complete'));
      enhancedOpenAI.on('validation:start', () => events.push('validation:start'));
      enhancedOpenAI.on('validation:complete', () => events.push('validation:complete'));

      const graph = {
        nodes: [{ id: '1', type: 'output', data: { text: 'Test prompt' } }],
        edges: [],
      };

      await enhancedOpenAI.transform(graph);

      expect(events).toContain('start');
      expect(events).toContain('complete');
      expect(events.some(e => e.startsWith('stage:'))).toBe(true);
    });

    test('should track performance statistics', async () => {
      await enhancedOpenAI.initialize({
        openai: { apiKey: 'test-key' },
      });

      const graph = {
        nodes: [{ id: '1', type: 'output', data: { text: 'Test' } }],
        edges: [],
      };

      // Perform multiple operations
      await enhancedOpenAI.validate(graph);
      await enhancedOpenAI.transform(graph);
      await enhancedOpenAI.transform(graph);

      const stats = enhancedOpenAI.getStatistics();

      expect(stats.translations).toBe(2);
      expect(stats.validations).toBe(1);
      expect(stats.errors).toBe(0);
      expect(stats.totalDuration).toBeGreaterThan(0);
      expect(stats.avgDuration).toBeGreaterThan(0);
    });

    test('should handle complex conversation flows', async () => {
      await enhancedOpenAI.initialize({
        openai: { apiKey: 'test-key', model: 'gpt-4' },
      });

      const conversationGraph = {
        nodes: [
          {
            id: '1',
            type: 'system',
            data: { text: 'You are a helpful assistant specialized in creative writing' },
          },
          {
            id: '2',
            type: 'user',
            data: { text: 'I want to write a science fiction story' },
          },
          {
            id: '3',
            type: 'assistant',
            data: { text: 'Great! What kind of sci-fi are you interested in?' },
          },
          {
            id: '4',
            type: 'user',
            data: { text: 'Something about AI and consciousness' },
          },
        ],
        edges: [
          { id: 'e1', source: '1', target: '2' },
          { id: 'e2', source: '2', target: '3' },
          { id: 'e3', source: '3', target: '4' },
        ],
      };

      const result = await enhancedOpenAI.transform(conversationGraph, {
        qualityPreference: 0.8,
        stylePreference: 'default',
      });

      expect(result.parameters.messages).toBeDefined();
      expect(result.parameters.system).toContain('creative writing');
      expect(result.parameters.temperature).toBeLessThan(0.5); // High quality
    });

    test('should optimize based on content analysis', async () => {
      await enhancedOpenAI.initialize({
        openai: { apiKey: 'test-key' },
      });

      const creativeGraph = {
        nodes: [
          {
            id: '1',
            type: 'output',
            data: { text: 'Write a creative story about magical creatures in an enchanted forest' },
          },
        ],
        edges: [],
      };

      const analyticalGraph = {
        nodes: [
          {
            id: '1',
            type: 'output',
            data: { text: 'Analyze the economic impact of renewable energy adoption' },
          },
        ],
        edges: [],
      };

      const creativeResult = await enhancedOpenAI.transform(creativeGraph);
      const analyticalResult = await enhancedOpenAI.transform(analyticalGraph);

      // Creative content should have higher temperature
      expect(creativeResult.parameters.temperature).toBeGreaterThan(analyticalResult.parameters.temperature);
    });
  });

  describe('Advanced Base Adaptor Features', () => {
    test('should handle pipeline retries', async () => {
      // Create a mock adaptor that fails initially
      class FailingMockAdaptor extends AdvancedBaseAdaptor {
        public readonly id = 'failing-mock';
        public readonly version = '1.0.0';
        public readonly name = 'Failing Mock';
        public readonly description = 'Mock adaptor for testing retries';
        public readonly platforms = ['mock'];

        private attempts = 0;

        async capabilities() {
          return {
            platform: 'mock',
            version: '1.0.0',
            features: ['test'],
            styleSupport: false,
            negativePromptSupport: false,
            parameterRanges: {},
          };
        }

        protected async performPlatformValidation() {
          return { valid: true, errors: [], warnings: [], compatibilityScore: 1.0 };
        }

        protected async performTransformation(graph: any): Promise<any> {
          this.attempts++;
          if (this.attempts < 3) {
            throw new Error('NETWORK_ERROR: Simulated failure');
          }
          return {
            platform: 'mock',
            prompt: 'success',
            parameters: {},
          };
        }

        // Abstract method implementations
        protected isValidGraphStructure() {
          return true;
        }
        protected hasCycles() {
          return false;
        }
        protected hasIncoherentContent() {
          return false;
        }
        protected estimateComplexity() {
          return 1;
        }
        protected normalizeGraphStructure(graph: any) {
          return graph;
        }
        protected async applyPreprocessingOptimizations(graph: any) {
          return graph;
        }
        protected canOptimizeContent() {
          return false;
        }
        protected canOptimizeStructure() {
          return false;
        }
        protected applyPostprocessingFilters(result: any) {
          return result;
        }
        protected validateFinalResult() {
          return true;
        }
      }

      const failingAdaptor = new FailingMockAdaptor();
      await failingAdaptor.initialize();

      const graph = {
        nodes: [{ id: '1', type: 'output', data: { text: 'test' } }],
        edges: [],
      };

      const config: AdvancedAdaptorConfig = {
        pipeline: {
          retries: {
            maxAttempts: 3,
            backoffMs: 10,
            retryableErrors: ['NETWORK_ERROR'],
          },
        },
      };

      // Should succeed after retries
      const result = await failingAdaptor.transform(graph, config);
      expect(result.prompt).toBe('success');

      await failingAdaptor.cleanup();
    });

    test('should skip pipeline stages when configured', async () => {
      await enhancedOpenAI.initialize({
        openai: { apiKey: 'test-key' },
      });

      const events: string[] = [];
      enhancedOpenAI.on('pipeline:stage', (stage: string) => events.push(stage));

      const graph = {
        nodes: [{ id: '1', type: 'output', data: { text: 'test' } }],
        edges: [],
      };

      await enhancedOpenAI.transform(graph, {
        pipeline: {
          skipValidation: true,
          skipOptimization: true,
        },
      });

      expect(events).not.toContain('validation');
      expect(events).not.toContain('optimization');
      expect(events).toContain('preprocessing');
      expect(events).toContain('transformation');
    });
  });

  describe('Test Framework Features', () => {
    test('should generate performance reports', async () => {
      const testCases = [
        {
          name: 'Fast Test',
          description: 'Quick test',
          graph: { nodes: [{ id: '1', type: 'output', data: { text: 'fast' } }], edges: [] },
          shouldTranslate: true,
        },
        {
          name: 'Slow Test',
          description: 'Slower test with complex graph',
          graph: {
            nodes: Array.from({ length: 20 }, (_, i) => ({
              id: `node-${i}`,
              type: 'text',
              data: { text: `Content ${i}` },
            })),
            edges: [],
          },
          shouldTranslate: true,
        },
      ];

      const results = await testFramework.runTestSuite({
        name: 'Performance Test Suite',
        adaptor: enhancedOpenAI,
        testCases,
        setup: async () => {
          await enhancedOpenAI.initialize({
            openai: { apiKey: 'test-key' },
          });
        },
      });

      const performanceReport = testFramework.generatePerformanceReport([results]);

      expect(performanceReport.averageDuration).toBeGreaterThan(0);
      expect(performanceReport.slowestTest).toBeDefined();
      expect(performanceReport.fastestTest).toBeDefined();
      expect(performanceReport.performanceScore).toBeGreaterThan(0);
    });

    test('should create standard test cases', () => {
      const standardTests = testFramework.createStandardTestCases();

      expect(standardTests.length).toBeGreaterThan(5);
      expect(standardTests.some(t => t.name.includes('Empty Graph'))).toBe(true);
      expect(standardTests.some(t => t.name.includes('Simple Text'))).toBe(true);
      expect(standardTests.some(t => t.name.includes('Performance'))).toBe(true);
    });

    test('should create platform-specific test cases', () => {
      const openaiTests = testFramework.createOpenAITestCases();
      const midjourneyTests = testFramework.createMidjourneyTestCases();

      expect(openaiTests.some(t => t.name.includes('System Message'))).toBe(true);
      expect(openaiTests.some(t => t.name.includes('Function Calling'))).toBe(true);

      expect(midjourneyTests.some(t => t.name.includes('Style Parameter'))).toBe(true);
      expect(midjourneyTests.some(t => t.name.includes('Aspect Ratio'))).toBe(true);
    });
  });
});

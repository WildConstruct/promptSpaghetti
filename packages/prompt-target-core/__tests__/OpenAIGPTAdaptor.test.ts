import { OpenAIGPTAdaptor } from '../src/adaptors/OpenAIGPTAdaptor.js';
import { ConsoleLogger, MemoryCache, MemoryMetrics } from '../src/utils/index.js';
describe('OpenAIGPTAdaptor', () => {
  let adaptor;
  let context;
  beforeEach(() => {
    context = {
      logger: new ConsoleLogger('Test'),
      cache: new MemoryCache(),
      metrics: new MemoryMetrics(),
      config: {},
    };
    adaptor = new OpenAIGPTAdaptor(context);
  });
  describe('capabilities', () => {
    it('should return valid capabilities', async () => {
      const capabilities = await adaptor.capabilities();
      expect(capabilities).toHaveProperty('supportedNodeTypes');
      expect(capabilities).toHaveProperty('parameters');
      expect(capabilities).toHaveProperty('limitations');
      expect(capabilities).toHaveProperty('features');
      expect(capabilities.supportedNodeTypes).toContain('text');
    });
  });
  describe('validate', () => {
    it('should validate a simple text graph', async () => {
      const graph = {
        id: 'test-graph',
        version: '1.0',
        nodes: [
          {
            id: 'node1',
            type: 'text',
            data: { content: 'Hello world' },
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
        metadata: {
          name: 'Test Graph',
          created: new Date(),
          modified: new Date(),
          version: '1.0',
        },
      };
      const results = await adaptor.validate(graph);
      expect(Array.isArray(results)).toBe(true);
      // Should have no critical errors for a simple valid graph
      const criticalErrors = results.filter(r => r.type === 'error' && r.severity === 'critical');
      expect(criticalErrors.length).toBe(0);
    });
    it('should detect unsupported image nodes', async () => {
      const graph = {
        id: 'test-graph',
        version: '1.0',
        nodes: [
          {
            id: 'node1',
            type: 'image',
            data: { content: 'image.jpg' },
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
        metadata: {
          name: 'Test Graph',
          created: new Date(),
          modified: new Date(),
          version: '1.0',
        },
      };
      const results = await adaptor.validate(graph);
      const imageWarnings = results.filter(r => r.message.includes('Image node not supported'));
      expect(imageWarnings.length).toBeGreaterThan(0);
    });
    it('should reject empty graphs', async () => {
      const graph = {
        id: 'empty-graph',
        version: '1.0',
        nodes: [],
        edges: [],
        metadata: {
          name: 'Empty Graph',
          created: new Date(),
          modified: new Date(),
          version: '1.0',
        },
      };
      const results = await adaptor.validate(graph);
      const emptyGraphErrors = results.filter(r => r.id === 'empty-graph');
      expect(emptyGraphErrors.length).toBeGreaterThan(0);
      expect(emptyGraphErrors[0].type).toBe('error');
      expect(emptyGraphErrors[0].severity).toBe('critical');
    });
  });
  describe('transform', () => {
    it('should transform a simple text graph', async () => {
      const graph = {
        id: 'test-graph',
        version: '1.0',
        nodes: [
          {
            id: 'node1',
            type: 'text',
            data: { content: 'Write a story about robots' },
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
        metadata: {
          name: 'Test Graph',
          created: new Date(),
          modified: new Date(),
          version: '1.0',
        },
      };
      const result = await adaptor.transform(graph);
      expect(result).toHaveProperty('platform', 'openai-gpt');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('format', 'chat_completion');
      expect(result).toHaveProperty('metadata');
      // Check that content has the expected structure
      const content = result.content;
      expect(content).toHaveProperty('messages');
      expect(Array.isArray(content.messages)).toBe(true);
      expect(content.messages.length).toBeGreaterThan(0);
      // Should have system and user messages
      const userMessage = content.messages.find(m => m.role === 'user');
      expect(userMessage).toBeDefined();
      expect(userMessage.content).toContain('robots');
    });
    it('should include default parameters', async () => {
      const graph = {
        id: 'test-graph',
        version: '1.0',
        nodes: [
          {
            id: 'node1',
            type: 'text',
            data: { content: 'Test prompt' },
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
        metadata: {
          name: 'Test Graph',
          created: new Date(),
          modified: new Date(),
          version: '1.0',
        },
      };
      const result = await adaptor.transform(graph);
      expect(result.parameters).toHaveProperty('temperature');
      expect(result.parameters).toHaveProperty('max_tokens');
      expect(result.parameters).toHaveProperty('model');
      // Check default values
      expect(result.parameters.temperature).toBe(0.7);
      expect(result.parameters.max_tokens).toBe(1000);
      expect(result.parameters.model).toBe('gpt-3.5-turbo');
    });
  });
  describe('estimateQuality', () => {
    it('should return a quality score', async () => {
      const graph = {
        id: 'test-graph',
        version: '1.0',
        nodes: [
          {
            id: 'node1',
            type: 'text',
            data: { content: 'Test prompt' },
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
        metadata: {
          name: 'Test Graph',
          created: new Date(),
          modified: new Date(),
          version: '1.0',
        },
      };
      const quality = await adaptor.estimateQuality(graph);
      expect(quality).toHaveProperty('overall');
      expect(quality).toHaveProperty('fidelity');
      expect(quality).toHaveProperty('compatibility');
      expect(quality).toHaveProperty('performance');
      expect(quality).toHaveProperty('completeness');
      expect(quality).toHaveProperty('breakdown');
      // Scores should be between 0 and 100
      expect(quality.overall).toBeGreaterThanOrEqual(0);
      expect(quality.overall).toBeLessThanOrEqual(100);
    });
  });
});

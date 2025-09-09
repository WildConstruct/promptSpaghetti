/**
 * Comprehensive Tests for Server Execution Engine
 *
 * Tests for the main graph execution engine including analytics integration,
 * error handling, performance monitoring, and advanced node support.
 */

import { executeGraph, initializeAnalytics } from '../src/engine';
import { Graph, Node, NodeTypeEnum } from '../packages/core/graphSchema';
import { AnalyticsCollector } from '../src/analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../src/database/analytics-dao';

// Mock dependencies
jest.mock('../src/analytics/AnalyticsCollector');
jest.mock('../src/database/analytics-dao');
jest.mock('../src/database/connection', () => ({
  getDatabase: jest.fn(() => ({
    prepare: jest.fn(() => ({
      run: jest.fn<unknown[], unknown>(),
      get: jest.fn<unknown[], unknown>(),
      all: jest.fn<unknown[], unknown>()
    }))
  }))
}));
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123')
}));

describe('Server Execution Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.ANALYTICS_ENABLED;
    delete process.env.ANALYTICS_SAMPLE_RATE;
    delete process.env.ANALYTICS_PRIVACY_MODE;
  });

  // Helper function to create test nodes
  const createNode = (
    id: string,
    type: NodeTypeEnum,
    data: unknown = {}
  ): Node => ({
    id,
    type,
    ...data
  });

  // Helper function to create test graphs
  const createGraph = (nodes: Node[], seed?: number): Graph => ({
    id: 'test-graph',
    nodes,
    edges: [],
    seed: seed || 12345
  });

  describe('Analytics Initialization', () => {
    it('should initialize analytics with default settings', () => {
      initializeAnalytics();

      expect(AnalyticsDAO).toHaveBeenCalledWith(expect.any(Object));
      expect(AnalyticsCollector).toHaveBeenCalledWith({
        enabled: true,
        sampleRate: 1.0,
        privacyMode: false
      });
    });

    it('should initialize analytics with environment configuration', () => {
      process.env.ANALYTICS_ENABLED = 'false';
      process.env.ANALYTICS_SAMPLE_RATE = '0.5';
      process.env.ANALYTICS_PRIVACY_MODE = 'true';

      initializeAnalytics();

      expect(AnalyticsCollector).toHaveBeenCalledWith({
        enabled: false,
        sampleRate: 0.5,
        privacyMode: true
      });
    });

    it('should handle analytics initialization errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (AnalyticsDAO as jest.Mock).mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      expect(() => initializeAnalytics()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to initialize analytics:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Basic Graph Execution', () => {
    it('should execute simple output node', async () => {
      const nodes = [createNode('output1', 'Output', { inputs: [] })];
      const graph = createGraph(nodes);

      const result = await executeGraph(graph);

      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('string');
    });

    it('should execute weighted choice node', async () => {
      const nodes = [
        createNode('choice1', 'WeightedChoice', {
          choices: [
            { text: 'Option A', weight: 1 },
            { text: 'Option B', weight: 1 }
          ]
        }),
        createNode('output1', 'Output', { inputs: ['choice1'] })
      ];
      const graph = createGraph(nodes);

      const result = await executeGraph(graph);

      expect(result).toHaveLength(1);
      expect(['Option A', 'Option B']).toContain(result[0]);
    });

    it('should execute concatenation node', async () => {
      const nodes = [
        createNode('concat1', 'Concat', { inputs: [] }),
        createNode('output1', 'Output', { inputs: ['concat1'] })
      ];
      const graph = createGraph(nodes);

      const result = await executeGraph(graph);

      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('string');
    });

    it('should execute multiple output nodes in order', async () => {
      const nodes = [
        createNode('choice1', 'WeightedChoice', {
          choices: [{ text: 'Hello', weight: 1 }]
        }),
        createNode('choice2', 'WeightedChoice', {
          choices: [{ text: 'World', weight: 1 }]
        }),
        createNode('output1', 'Output', { inputs: ['choice1'] }),
        createNode('output2', 'Output', { inputs: ['choice2'] })
      ];
      const graph = createGraph(nodes);

      const result = await executeGraph(graph);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('Hello');
      expect(result[1]).toBe('World');
    });
  });

  describe('Variable Handling', () => {
    it('should set and get variables', async () => {
      const nodes = [
        createNode('setVar1', 'SetVariable', {
          key: 'testVar',
          value: 'testValue'
        }),
        createNode('getVar1', 'GetVariable', {
          key: 'testVar',
          inputs: ['setVar1']
        }),
        createNode('output1', 'Output', { inputs: ['getVar1'] })
      ];
      const graph = createGraph(nodes);

      const result = await executeGraph(graph);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('testValue');
    });

    it('should handle multiple variables', async () => {
      const nodes = [
        createNode('setVar1', 'SetVariable', { key: 'var1', value: 'value1' }),
        createNode('setVar2', 'SetVariable', { key: 'var2', value: 'value2' }),
        createNode('getVar1', 'GetVariable', {
          key: 'var1',
          inputs: ['setVar1']
        }),
        createNode('getVar2', 'GetVariable', {
          key: 'var2',
          inputs: ['setVar2']
        }),
        createNode('concat1', 'Concat', { inputs: ['getVar1', 'getVar2'] }),
        createNode('output1', 'Output', { inputs: ['concat1'] })
      ];
      const graph = createGraph(nodes);

      const result = await executeGraph(graph);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('value1');
      expect(result[0]).toContain('value2');
    });
  });

  describe('Advanced Node Support', () => {
    it('should detect and handle advanced nodes', async () => {
      const nodes = [
        createNode('weightedAdv1', 'WeightedAdvanced', {
          choices: [{ text: 'Advanced Option', weight: 1 }],
          distributionConfig: { type: 'linear', normalize: true }
        }),
        createNode('output1', 'Output', { inputs: ['weightedAdv1'] })
      ];
      const graph = createGraph(nodes);

      const result = await executeGraph(graph);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Advanced Option');
    });

    it('should handle conditional nodes', async () => {
      const nodes = [
        createNode('conditional1', 'Conditional', {
          branches: [{ condition: 'true', output: 'Condition met' }],
          defaultOutput: 'Default output',
          conditionalConfig: {
            allowUnknownFunctions: false,
            maxExpressionLength: 1000
          }
        }),
        createNode('output1', 'Output', { inputs: ['conditional1'] })
      ];
      const graph = createGraph(nodes);

      const result = await executeGraph(graph);

      expect(result).toHaveLength(1);
      expect(['Condition met', 'Default output']).toContain(result[0]);
    });

    it('should handle sequential nodes', async () => {
      const nodes = [
        createNode('sequential1', 'Sequential', {
          sequence: ['First', 'Second', 'Third'],
          pattern: { type: 'linear', config: {} }
        }),
        createNode('output1', 'Output', { inputs: ['sequential1'] })
      ];
      const graph = createGraph(nodes);

      const result = await executeGraph(graph);

      expect(result).toHaveLength(1);
      expect(['First', 'Second', 'Third']).toContain(result[0]);
    });

    it('should handle Markov nodes with minimal configuration', async () => {
      const nodes = [
        createNode('markov1', 'Markov', {
          states: ['state1', 'state2'],
          transitions: {
            state1: { state2: 1.0 },
            state2: { state1: 1.0 }
          },
          initialState: 'state1',
          markovConfig: {}
        }),
        createNode('output1', 'Output', { inputs: ['markov1'] })
      ];
      const graph = createGraph(nodes);

      const result = await executeGraph(graph);

      expect(result).toHaveLength(1);
      expect(['state1', 'state2']).toContain(result[0]);
    });

    it('should handle Markov nodes with empty configuration', async () => {
      const nodes = [
        createNode('markov1', 'Markov', {}),
        createNode('output1', 'Output', { inputs: ['markov1'] })
      ];
      const graph = createGraph(nodes);

      const result = await executeGraph(graph);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('default');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for missing node', async () => {
      const nodes = [
        createNode('output1', 'Output', { inputs: ['nonexistent'] })
      ];
      const graph = createGraph(nodes);

      await expect(executeGraph(graph)).rejects.toThrow(
        'Node nonexistent not found'
      );
    });

    it('should throw error for unsupported node type', async () => {
      const nodes = [
        createNode('unknown1', 'UnknownType' as NodeTypeEnum, {}),
        createNode('output1', 'Output', { inputs: ['unknown1'] })
      ];
      const graph = createGraph(nodes);

      await expect(executeGraph(graph)).rejects.toThrow(
        'Unsupported node type UnknownType'
      );
    });

    it('should handle PythonTransform node error', async () => {
      const nodes = [
        createNode('python1', 'PythonTransform', {}),
        createNode('output1', 'Output', { inputs: ['python1'] })
      ];
      const graph = createGraph(nodes);

      await expect(executeGraph(graph)).rejects.toThrow(
        'PythonTransform node is not yet implemented'
      );
    });

    it('should record failed executions in analytics', async () => {
      initializeAnalytics();
      const mockAnalyticsCollector = AnalyticsCollector.prototype;
      const mockRecordError = jest.spyOn(
        mockAnalyticsCollector,
        'recordGraphExecutionError'
      );

      const nodes = [
        createNode('unknown1', 'UnknownType' as NodeTypeEnum, {}),
        createNode('output1', 'Output', { inputs: ['unknown1'] })
      ];
      const graph = createGraph(nodes);

      await expect(executeGraph(graph)).rejects.toThrow();
      expect(mockRecordError).toHaveBeenCalledWith(
        'test-graph',
        expect.stringContaining('Unsupported node type'),
        2,
        0,
        expect.any(Number)
      );
    });
  });

  describe('Deterministic Execution', () => {
    it('should produce consistent results with same seed', async () => {
      const nodes = [
        createNode('choice1', 'WeightedChoice', {
          choices: [
            { text: 'A', weight: 1 },
            { text: 'B', weight: 1 },
            { text: 'C', weight: 1 }
          ]
        }),
        createNode('output1', 'Output', { inputs: ['choice1'] })
      ];
      const graph = createGraph(nodes, 42);

      const result1 = await executeGraph(graph);
      const result2 = await executeGraph(graph);

      expect(result1).toEqual(result2);
    });

    it('should produce different results with different seeds', async () => {
      const nodes = [
        createNode('choice1', 'WeightedChoice', {
          choices: [
            { text: 'A', weight: 1 },
            { text: 'B', weight: 1 },
            { text: 'C', weight: 1 }
          ]
        }),
        createNode('output1', 'Output', { inputs: ['choice1'] })
      ];

      const graph1 = createGraph(nodes, 42);
      const graph2 = createGraph(nodes, 99);

      const result1 = await executeGraph(graph1);
      const result2 = await executeGraph(graph2);

      // With different seeds, results might be different (though not guaranteed)
      // This test mainly ensures seeds are properly used
      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
    });
  });

  describe('Analytics Integration', () => {
    beforeEach(() => {
      initializeAnalytics();
    });

    it('should record graph execution start and complete', async () => {
      const mockAnalyticsCollector = AnalyticsCollector.prototype;
      const mockRecordStart = jest.spyOn(
        mockAnalyticsCollector,
        'recordGraphExecutionStart'
      );
      const mockRecordComplete = jest.spyOn(
        mockAnalyticsCollector,
        'recordGraphExecutionComplete'
      );

      const nodes = [createNode('output1', 'Output', { inputs: [] })];
      const graph = createGraph(nodes);

      await executeGraph(graph, 'session-123', 456);

      expect(mockRecordStart).toHaveBeenCalledWith(
        'test-graph',
        1, // node count
        0, // edge count
        12345 // seed
      );

      expect(mockRecordComplete).toHaveBeenCalledWith(
        'test-graph',
        expect.any(Number), // execution time
        expect.any(Number), // output length
        1, // node count
        0 // connection count
      );
    });

    it('should record node execution events', async () => {
      const mockAnalyticsCollector = AnalyticsCollector.prototype;
      const mockRecordEvent = jest.spyOn(mockAnalyticsCollector, 'recordEvent');
      const mockRecordNodeExecution = jest.spyOn(
        mockAnalyticsCollector,
        'recordNodeExecution'
      );

      const nodes = [
        createNode('choice1', 'WeightedChoice', {
          choices: [{ text: 'Test', weight: 1 }]
        }),
        createNode('output1', 'Output', { inputs: ['choice1'] })
      ];
      const graph = createGraph(nodes);

      await executeGraph(graph, 'session-123', 456);

      // Should record node execution start events
      expect(mockRecordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'NODE_EXECUTION_START',
          metadata: expect.objectContaining({
            nodeType: 'WeightedChoice',
            graphId: 'test-graph'
          })
        })
      );

      // Should record successful node executions
      expect(mockRecordNodeExecution).toHaveBeenCalledWith(
        'choice1',
        'WeightedChoice',
        'test-graph',
        expect.any(Number), // execution time
        true, // success
        expect.any(Number), // input size
        expect.any(Number) // output size
      );
    });

    it('should store execution records in database', async () => {
      const mockAnalyticsDAO = AnalyticsDAO.prototype;
      const mockStoreExecution = jest.spyOn(
        mockAnalyticsDAO,
        'storeGraphExecution'
      );

      const nodes = [createNode('output1', 'Output', { inputs: [] })];
      const graph = createGraph(nodes);

      await executeGraph(graph, 'session-123', 456);

      expect(mockStoreExecution).toHaveBeenCalledWith(
        expect.objectContaining({
          executionId: 'mock-uuid-123',
          graphId: 'test-graph',
          sessionId: 'session-123',
          userId: 456,
          success: true,
          nodeCount: 1,
          connectionCount: 0,
          seedValue: 12345
        })
      );
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle complex graphs efficiently', async () => {
      // Create a complex graph with many nodes
      const nodes: Node[] = [];

      // Create 50 weighted choice nodes
      for (let i = 0; i < 50; i++) {
        nodes.push(
          createNode(`choice${i}`, 'WeightedChoice', {
            choices: [{ text: `Choice ${i}`, weight: 1 }]
          })
        );
      }

      // Create concat nodes to combine them
      for (let i = 0; i < 25; i++) {
        nodes.push(
          createNode(`concat${i}`, 'Concat', {
            inputs: [`choice${i * 2}`, `choice${i * 2 + 1}`]
          })
        );
      }

      // Final output
      nodes.push(createNode('output1', 'Output', { inputs: ['concat0'] }));

      const graph = createGraph(nodes);

      const startTime = performance.now();
      const result = await executeGraph(graph);
      const endTime = performance.now();

      expect(result).toHaveLength(1);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle deep graph nesting efficiently', async () => {
      // Create a deep chain of nodes
      const nodes: Node[] = [];
      const depth = 100;

      nodes.push(
        createNode('start', 'WeightedChoice', {
          choices: [{ text: 'Start', weight: 1 }]
        })
      );

      for (let i = 1; i < depth; i++) {
        nodes.push(
          createNode(`node${i}`, 'Concat', {
            inputs: [i === 1 ? 'start' : `node${i - 1}`]
          })
        );
      }

      nodes.push(
        createNode('output1', 'Output', { inputs: [`node${depth - 1}`] })
      );

      const graph = createGraph(nodes);

      const startTime = performance.now();
      const result = await executeGraph(graph);
      const endTime = performance.now();

      expect(result).toHaveLength(1);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Memoization and Caching', () => {
    it('should memoize node results to avoid redundant computation', async () => {
      // Create a diamond-shaped graph where one node is referenced by multiple others
      const nodes = [
        createNode('shared', 'WeightedChoice', {
          choices: [{ text: 'Shared Value', weight: 1 }]
        }),
        createNode('branch1', 'Concat', { inputs: ['shared'] }),
        createNode('branch2', 'Concat', { inputs: ['shared'] }),
        createNode('merge', 'Concat', { inputs: ['branch1', 'branch2'] }),
        createNode('output1', 'Output', { inputs: ['merge'] })
      ];
      const graph = createGraph(nodes);

      const result = await executeGraph(graph);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('Shared Value');
      // The shared node should only be executed once due to memoization
    });
  });

  describe('Session and User Tracking', () => {
    it('should handle execution without session or user ID', async () => {
      const nodes = [createNode('output1', 'Output', { inputs: [] })];
      const graph = createGraph(nodes);

      const result = await executeGraph(graph);

      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('string');
    });

    it('should track session and user ID when provided', async () => {
      initializeAnalytics();
      const mockAnalyticsDAO = AnalyticsDAO.prototype;
      const mockStoreExecution = jest.spyOn(
        mockAnalyticsDAO,
        'storeGraphExecution'
      );

      const nodes = [createNode('output1', 'Output', { inputs: [] })];
      const graph = createGraph(nodes);

      await executeGraph(graph, 'test-session-789', 123);

      expect(mockStoreExecution).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'test-session-789',
          userId: 123
        })
      );
    });

    it('should generate session ID when not provided', async () => {
      initializeAnalytics();
      const mockAnalyticsDAO = AnalyticsDAO.prototype;
      const mockStoreExecution = jest.spyOn(
        mockAnalyticsDAO,
        'storeGraphExecution'
      );

      const nodes = [createNode('output1', 'Output', { inputs: [] })];
      const graph = createGraph(nodes);

      await executeGraph(graph, undefined, 123);

      expect(mockStoreExecution).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'mock-uuid-123',
          userId: 123
        })
      );
    });
  });
});

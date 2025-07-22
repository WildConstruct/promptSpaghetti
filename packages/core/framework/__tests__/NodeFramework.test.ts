/**
 * Node Framework Tests
 * Epic 18 - Implement Node Framework Testing
 */

import { NodeFramework, FrameworkNode, NodeDefinition, NodeRegistry } from '../NodeFramework';
import { WeightedChoiceFrameworkNode } from '../nodes/WeightedChoiceFrameworkNode';
import { AdvancedNodeConfig, AdvancedExecutionContext } from '../../runtime/advanced';

// Mock framework node for testing
class TestFrameworkNode extends FrameworkNode {
  private testData: unknown;

  constructor(id: string, config: AdvancedNodeConfig, data: unknown) {
    super(id, config, data);
    this.testData = data;
  }

  getType(): string {
    return 'Test';
  }

  getDefinition(): Partial<NodeDefinition> {
    return {
      type: 'Test',
      displayName: 'Test Node',
      description: 'Node for testing framework functionality',
      category: 'basic',
      version: '1.0.0'
    };
  }

  protected async onInitialize(): Promise<void> {
    // Test initialization
  }

  protected async executeNode(context: AdvancedExecutionContext): Promise<any> {
    return { result: 'test_result', data: this.testData };
  }

  protected async onDestroy(): Promise<void> {
    // Test cleanup
  }

  protected getData(): any {
    return this.testData;
  }
}

describe('NodeFramework', () => {
  let framework: NodeFramework;

  beforeEach(() => {
    framework = new NodeFramework({
      enableValidation: false, // Disable for faster testing
      enableMonitoring: true,
      maxNodesInMemory: 10
    });

    // Register test node type
    framework.registry.registerNode({
      type: 'Test',
      displayName: 'Test Node',
      description: 'Test node for framework testing',
      category: 'basic',
      version: '1.0.0',
      nodeClass: TestFrameworkNode,
      defaultConfig: {
        deterministic: true,
        cacheable: false,
        stateful: false
      },
      ports: { inputs: [], outputs: [] },
      metadata: {
        tags: ['test'],
        deprecated: false,
        experimental: true
      }
    });
  });

  afterEach(async () => {
    await framework.shutdown();
  });

  describe('Node Creation and Management', () => {
    it('should create a node successfully', async () => {
      const node = await framework.createNode('Test', 'test-node-1', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, { testValue: 'hello' });

      expect(node).toBeDefined();
      expect(node.id).toBe('test-node-1');
      expect(node.getType()).toBe('Test');
    });

    it('should retrieve created nodes', async () => {
      await framework.createNode('Test', 'test-node-1', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {});

      const node = framework.getNode('test-node-1');
      expect(node).toBeDefined();
      expect(node!.id).toBe('test-node-1');
    });

    it('should destroy nodes properly', async () => {
      await framework.createNode('Test', 'test-node-1', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {});

      expect(framework.getNode('test-node-1')).toBeDefined();

      await framework.destroyNode('test-node-1');

      expect(framework.getNode('test-node-1')).toBeUndefined();
    });

    it('should enforce memory limits', async () => {
      // Create nodes up to the limit
      for (let i = 0; i < 10; i++) {
        await framework.createNode('Test', `test-node-${i}`, {
          deterministic: true,
          cacheable: false,
          stateful: false
        }, {});
      }

      // Attempting to create one more should fail
      await expect(framework.createNode('Test', 'test-node-overflow', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {})).rejects.toThrow('Maximum number of nodes in memory exceeded');
    });

    it('should emit node lifecycle events', async () => {
      const events: any[] = [];
      
      framework.on('node_created', (data) => events.push({ type: 'created', ...data }));
      framework.on('node_initialized', (data) => events.push({ type: 'initialized', ...data }));
      framework.on('node_destroyed', (data) => events.push({ type: 'destroyed', ...data }));

      const node = await framework.createNode('Test', 'event-test', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {});

      await framework.destroyNode('event-test');

      expect(events).toHaveLength(3);
      expect(events[0].type).toBe('initialized');
      expect(events[1].type).toBe('created');
      expect(events[2].type).toBe('destroyed');
    });
  });

  describe('Node Execution', () => {
    it('should execute nodes and return results', async () => {
      const node = await framework.createNode('Test', 'exec-test', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, { testValue: 'execution_test' });

      const context: AdvancedExecutionContext = {
        variables: new Map(),
        nodeStates: new Map(),
        evaluationDepth: 0,
        cache: new Map(),
        executionMeta: {
          startTime: Date.now(),
          executionId: 'test-exec',
          nodeExecutionOrder: []
        },
        prng: () => 0.5, // Mock PRNG
        seed: 12345
      };

      const result = await node.execute(context);

      expect(result.result).toBe('test_result');
      expect(result.data.testValue).toBe('execution_test');
    });

    it('should execute nodes in batch', async () => {
      
      
      const context: AdvancedExecutionContext = {
        variables: new Map(),
        nodeStates: new Map(),
        evaluationDepth: 0,
        cache: new Map(),
        executionMeta: {
          startTime: Date.now(),
          executionId: 'batch-exec',
          nodeExecutionOrder: []
        },
        prng: () => 0.5,
        seed: 12345
      };

      const results = await framework.executeNodeBatch(['batch-1', 'batch-2'], context);

      expect(results).toHaveLength(2);
      expect(results[0].data.value).toBe(1);
      expect(results[1].data.value).toBe(2);
    });

    it('should emit execution events', async () => {
      const events: any[] = [];
      framework.on('node_executed', (data) => events.push(data));

      const node = await framework.createNode('Test', 'event-exec', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {});

      const context: AdvancedExecutionContext = {
        variables: new Map(),
        nodeStates: new Map(),
        evaluationDepth: 0,
        cache: new Map(),
        executionMeta: {
          startTime: Date.now(),
          executionId: 'event-exec',
          nodeExecutionOrder: []
        },
        prng: () => 0.5,
        seed: 12345
      };

      await node.execute(context);

      expect(events).toHaveLength(1);
      expect(events[0].nodeId).toBe('event-exec');
      expect(events[0].success).toBe(true);
      expect(typeof events[0].executionTime).toBe('number');
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should execute global lifecycle hooks', async () => {
      const hookCalls: string[] = [];

      framework.registerLifecycleHooks('*', {
        beforeInit: async () => hookCalls.push('global_before_init'),
        afterInit: async () => hookCalls.push('global_after_init'),
        beforeExecute: async () => hookCalls.push('global_before_execute'),
        afterExecute: async () => hookCalls.push('global_after_execute')
      });

      const node = await framework.createNode('Test', 'hook-test', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {});

      const context: AdvancedExecutionContext = {
        variables: new Map(),
        nodeStates: new Map(),
        evaluationDepth: 0,
        cache: new Map(),
        executionMeta: {
          startTime: Date.now(),
          executionId: 'hook-exec',
          nodeExecutionOrder: []
        },
        prng: () => 0.5,
        seed: 12345
      };

      await node.execute(context);

      expect(hookCalls).toContain('global_before_init');
      expect(hookCalls).toContain('global_after_init');
      expect(hookCalls).toContain('global_before_execute');
      expect(hookCalls).toContain('global_after_execute');
    });

    it('should execute type-specific lifecycle hooks', async () => {
      const hookCalls: string[] = [];

      framework.registerLifecycleHooks('Test', {
        beforeInit: async () => hookCalls.push('test_before_init'),
        afterInit: async () => hookCalls.push('test_after_init')
      });

      await framework.createNode('Test', 'type-hook-test', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {});

      expect(hookCalls).toContain('test_before_init');
      expect(hookCalls).toContain('test_after_init');
    });
  });

  describe('Metrics and Monitoring', () => {
    it('should track framework metrics', async () => {
      // Create some nodes
      await framework.createNode('Test', 'metrics-1', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {});

      await framework.createNode('Test', 'metrics-2', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {});

      const metrics = framework.getMetrics();

      expect(metrics.totalNodes).toBeGreaterThan(0);
      expect(metrics.activeNodes).toBe(2);
      expect(metrics.registeredTypes).toBeGreaterThan(0);
    });

    it('should track node metrics', async () => {
      const node = await framework.createNode('Test', 'node-metrics', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {});

      const context: AdvancedExecutionContext = {
        variables: new Map(),
        nodeStates: new Map(),
        evaluationDepth: 0,
        cache: new Map(),
        executionMeta: {
          startTime: Date.now(),
          executionId: 'metrics-exec',
          nodeExecutionOrder: []
        },
        prng: () => 0.5,
        seed: 12345
      };

      await node.execute(context);
      await node.execute(context); // Execute twice

      const nodeMetrics = node.getMetrics();

      expect(nodeMetrics.executionCount).toBe(2);
      expect(nodeMetrics.averageExecutionTime).toBeGreaterThan(0);
      expect(nodeMetrics.totalExecutionTime).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle node creation errors', async () => {
      await expect(framework.createNode('NonExistentType', 'error-test', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {})).rejects.toThrow('Unknown node type: NonExistentType');
    });

    it('should handle node destruction errors', async () => {
      await expect(framework.destroyNode('non-existent-node')).rejects.toThrow('not found');
    });
  });

  describe('Framework Shutdown', () => {
    it('should shutdown gracefully', async () => {
      const shutdownEvents: any[] = [];
      framework.on('framework_shutdown', () => shutdownEvents.push('shutdown'));

      // Create some nodes
      await framework.createNode('Test', 'shutdown-1', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {});

      await framework.createNode('Test', 'shutdown-2', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {});

      await framework.shutdown();

      expect(shutdownEvents).toHaveLength(1);
      expect(framework.getNode('shutdown-1')).toBeUndefined();
      expect(framework.getNode('shutdown-2')).toBeUndefined();
    });
  });
});

describe('NodeRegistry', () => {
  let registry: NodeRegistry;

  beforeEach(() => {
    registry = new NodeRegistry();
  });

  describe('Node Type Registration', () => {
    it('should register node types successfully', () => {
      const definition: NodeDefinition = {
        type: 'TestNode',
        displayName: 'Test Node',
        description: 'A test node',
        category: 'basic',
        version: '1.0.0',
        nodeClass: TestFrameworkNode,
        defaultConfig: {
          deterministic: true,
          cacheable: false,
          stateful: false
        },
        ports: { inputs: [], outputs: [] },
        metadata: {
          tags: ['test'],
          deprecated: false,
          experimental: false
        }
      };

      registry.registerNode(definition);

      const retrieved = registry.getDefinition('TestNode');
      expect(retrieved).toBeDefined();
      expect(retrieved!.displayName).toBe('Test Node');
    });

    it('should prevent duplicate registration', () => {
      const definition: NodeDefinition = {
        type: 'DuplicateTest',
        displayName: 'Duplicate Test',
        description: 'A test for duplicates',
        category: 'basic',
        version: '1.0.0',
        nodeClass: TestFrameworkNode,
        defaultConfig: {
          deterministic: true,
          cacheable: false,
          stateful: false
        },
        ports: { inputs: [], outputs: [] },
        metadata: {
          tags: ['test'],
          deprecated: false,
          experimental: false
        }
      };

      registry.registerNode(definition);

      expect(() => {
        registry.registerNode(definition);
      }).toThrow("Node type 'DuplicateTest' is already registered");
    });

    it('should unregister node types', () => {
      const definition: NodeDefinition = {
        type: 'UnregisterTest',
        displayName: 'Unregister Test',
        description: 'A test for unregistration',
        category: 'basic',
        version: '1.0.0',
        nodeClass: TestFrameworkNode,
        defaultConfig: {
          deterministic: true,
          cacheable: false,
          stateful: false
        },
        ports: { inputs: [], outputs: [] },
        metadata: {
          tags: ['test'],
          deprecated: false,
          experimental: false
        }
      };

      registry.registerNode(definition);
      expect(registry.getDefinition('UnregisterTest')).toBeDefined();

      registry.unregisterNode('UnregisterTest');
      expect(registry.getDefinition('UnregisterTest')).toBeUndefined();
    });
  });

  describe('Node Creation', () => {
    beforeEach(() => {
      registry.registerNode({
        type: 'CreationTest',
        displayName: 'Creation Test',
        description: 'A test for node creation',
        category: 'basic',
        version: '1.0.0',
        nodeClass: TestFrameworkNode,
        defaultConfig: {
          deterministic: true,
          cacheable: false,
          stateful: false
        },
        ports: { inputs: [], outputs: [] },
        metadata: {
          tags: ['test'],
          deprecated: false,
          experimental: false
        }
      });
    });

    it('should create node instances', () => {
      const node = registry.createNode('CreationTest', 'test-instance', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, { testData: 'value' });

      expect(node).toBeDefined();
      expect(node.id).toBe('test-instance');
      expect(node.getType()).toBe('CreationTest');
    });

    it('should merge default and provided config', () => {
      const definition = registry.getDefinition('CreationTest')!;
      definition.defaultConfig.cacheable = true;

      const node = registry.createNode('CreationTest', 'merge-test', {
        deterministic: false,
        cacheable: false,
        stateful: false
      }, {});

      expect(node.config.deterministic).toBe(false); // Overridden
      expect(node.config.cacheable).toBe(false); // Overridden
      expect(node.config.stateful).toBe(false); // From provided config
    });
  });

  describe('Type Aliases', () => {
    beforeEach(() => {
      registry.registerNode({
        type: 'AliasTest',
        displayName: 'Alias Test',
        description: 'A test for aliases',
        category: 'basic',
        version: '1.0.0',
        nodeClass: TestFrameworkNode,
        defaultConfig: {
          deterministic: true,
          cacheable: false,
          stateful: false
        },
        ports: { inputs: [], outputs: [] },
        metadata: {
          tags: ['test'],
          deprecated: false,
          experimental: false
        }
      });
    });

    it('should register and resolve aliases', () => {
      registry.registerAlias('AT', 'AliasTest');

      const node = registry.createNode('AT', 'alias-instance', {
        deterministic: true,
        cacheable: false,
        stateful: false
      }, {});

      expect(node.getType()).toBe('AliasTest');
    });

    it('should prevent aliases for non-existent types', () => {
      expect(() => {
        registry.registerAlias('BadAlias', 'NonExistentType');
      }).toThrow('Cannot create alias for unregistered type: NonExistentType');
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(() => {
      registry.registerNode({
        type: 'BasicNode',
        displayName: 'Basic Node',
        description: 'A basic node',
        category: 'basic',
        version: '1.0.0',
        nodeClass: TestFrameworkNode,
        defaultConfig: { deterministic: true, cacheable: false, stateful: false },
        ports: { inputs: [], outputs: [] },
        metadata: {
          tags: ['basic', 'simple'],
          author: 'TestAuthor',
          deprecated: false,
          experimental: false
        }
      });

      registry.registerNode({
        type: 'AdvancedNode',
        displayName: 'Advanced Node',
        description: 'An advanced node',
        category: 'advanced',
        version: '2.0.0',
        nodeClass: TestFrameworkNode,
        defaultConfig: { deterministic: true, cacheable: true, stateful: true },
        ports: { inputs: [], outputs: [] },
        metadata: {
          tags: ['advanced', 'complex'],
          author: 'TestAuthor',
          deprecated: false,
          experimental: true
        }
      });
    });

    it('should get nodes by category', () => {
      const basicNodes = registry.getNodesByCategory('basic');
      const advancedNodes = registry.getNodesByCategory('advanced');

      expect(basicNodes).toHaveLength(1);
      expect(basicNodes[0].type).toBe('BasicNode');
      expect(advancedNodes).toHaveLength(1);
      expect(advancedNodes[0].type).toBe('AdvancedNode');
    });

    it('should search nodes by criteria', () => {
      const experimentalNodes = registry.searchNodes({ experimental: true });
      const basicTaggedNodes = registry.searchNodes({ tags: ['basic'] });
      const authorNodes = registry.searchNodes({ author: 'TestAuthor' });

      expect(experimentalNodes).toHaveLength(1);
      expect(experimentalNodes[0].type).toBe('AdvancedNode');
      
      expect(basicTaggedNodes).toHaveLength(1);
      expect(basicTaggedNodes[0].type).toBe('BasicNode');
      
      expect(authorNodes).toHaveLength(2);
    });

    it('should return all registered types', () => {
      const types = registry.getRegisteredTypes();
      expect(types).toContain('BasicNode');
      expect(types).toContain('AdvancedNode');
      expect(types).toHaveLength(2);
    });
  });
});
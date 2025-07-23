/**
 * Advanced Graph Generator for Comprehensive Testing
 * 
 * Generates complex graph structures for testing scenarios including:
 * - Performance stress testing with large node counts
 * - Security validation with malicious configurations
 * - Edge case validation with boundary conditions
 * - Advanced node combinations and configurations
 * 
 * Task: E18-1753114562159-0BC5A0
 */

import { Graph, Node, Edge, NodeTypeEnum } from '../../packages/core/graphSchema';
import seedrandom from 'seedrandom';

export interface GraphGenerationOptions {
  nodeCount: number;
  complexity: 'simple' | 'validation' | 'performance' | 'security' | 'edge-case';
  nodeTypes?: NodeTypeEnum[];
  includeAdvancedNodes?: boolean;
  memoryIntensive?: boolean;
  seed?: number;
  connectionDensity?: number; // 0-1, how connected the graph should be
  maxDepth?: number; // Maximum depth for nested structures
}

export interface GraphScenario {
  name: string;
  description: string;
  graph: Graph;
  expectedBehavior: 'success' | 'error' | 'performance';
  expectedOutput?: string[];
  performanceThresholds?: {
    maxExecutionTimeMs: number;
    maxMemoryUsageMB: number;
  };
}

export class AdvancedGraphGenerator {
  private rng: seedrandom.PRNG;

  constructor(seed: number = 12345) {
    this.rng = seedrandom(seed.toString());
  }

  /**
   * Generate a graph based on specific scenario requirements
   */
  generateComplexScenario(options: GraphGenerationOptions): GraphScenario {
    const { complexity } = options;

    switch (complexity) {
    case 'simple':
      return this.generateSimpleScenario(options);
    case 'validation':
      return this.generateValidationScenario(options);
    case 'performance':
      return this.generatePerformanceScenario(options);
    case 'security':
      return this.generateSecurityScenario(options);
    case 'edge-case':
      return this.generateEdgeCaseScenario(options);
    default:
      throw new Error(`Unknown complexity type: ${complexity}`);
    }
  }

  /**
   * Generate simple, well-formed graphs for basic testing
   */
  private generateSimpleScenario(options: GraphGenerationOptions): GraphScenario {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeCount = Math.min(options.nodeCount, 10); // Keep simple scenarios small

    // Create a linear chain of weighted choices
    for (let i = 0; i < nodeCount - 1; i++) {
      nodes.push({
        id: `choice${i}`,
        type: 'WeightedChoice',
        choices: [
          { text: `Option ${i}A`, weight: this.rng() * 5 },
          { text: `Option ${i}B`, weight: this.rng() * 5 }
        ]
      });

      if (i > 0) {
        edges.push({
          id: `e${i}`,
          source: `choice${i - 1}`,
          target: `choice${i}`
        });
      }
    }

    // Add final output node
    nodes.push({
      id: 'output1',
      type: 'Output',
      inputs: nodeCount > 1 ? [`choice${nodeCount - 2}`] : []
    });

    edges.push({
      id: `e${nodeCount}`,
      source: nodeCount > 1 ? `choice${nodeCount - 2}` : 'choice0',
      target: 'output1'
    });

    return {
      name: 'simple-linear-chain',
      description: `Simple linear chain with ${nodeCount} nodes`,
      graph: {
        id: `simple-graph-${Date.now()}`,
        seed: options.seed || 12345,
        nodes,
        edges
      },
      expectedBehavior: 'success',
      performanceThresholds: {
        maxExecutionTimeMs: 100,
        maxMemoryUsageMB: 10
      }
    };
  }

  /**
   * Generate graphs for validation testing (malformed, edge cases)
   */
  private generateValidationScenario(options: GraphGenerationOptions): GraphScenario {
    const scenarios = [
      () => this.generateSelfLoopGraph(),
      () => this.generateDisconnectedGraph(),
      () => this.generateCircularDependencyGraph(),
      () => this.generateMissingInputGraph(),
      () => this.generateDuplicateEdgeGraph()
    ];

    const scenario = scenarios[Math.floor(this.rng() * scenarios.length)]();
    return {
      name: `validation-${scenario.type}`,
      description: scenario.description,
      graph: scenario.graph,
      expectedBehavior: 'error'
    };
  }

  /**
   * Generate large graphs for performance testing
   */
  private generatePerformanceScenario(options: GraphGenerationOptions): GraphScenario {
    const nodeCount = Math.max(options.nodeCount, 100);
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create a complex branching structure
    const layerSizes = this.calculateLayerSizes(nodeCount);
    let nodeIndex = 0;

    for (let layer = 0; layer < layerSizes.length; layer++) {
      const layerSize = layerSizes[layer];
      
      for (let i = 0; i < layerSize; i++) {
        const nodeId = `node_${layer}_${i}`;
        
        if (layer === layerSizes.length - 1) {
          // Final layer - output nodes
          nodes.push({
            id: nodeId,
            type: 'Output',
            inputs: layer > 0 ? [`node_${layer - 1}_${i % layerSizes[layer - 1]}`] : []
          });
        } else if (options.includeAdvancedNodes && this.rng() < 0.3) {
          // 30% chance of advanced nodes
          nodes.push(this.generateRandomAdvancedNode(nodeId));
        } else {
          // Regular weighted choice nodes
          const choiceCount = options.memoryIntensive ? 50 : 10;
          nodes.push({
            id: nodeId,
            type: 'WeightedChoice',
            choices: Array.from({ length: choiceCount }, (_, idx) => ({
              text: `Choice ${nodeId}_${idx}`,
              weight: this.rng() * 10
            }))
          });
        }

        // Connect to previous layer
        if (layer > 0) {
          const prevLayerSize = layerSizes[layer - 1];
          const connectionsPerNode = Math.min(3, prevLayerSize);
          
          for (let j = 0; j < connectionsPerNode; j++) {
            const sourceIdx = (i + j) % prevLayerSize;
            edges.push({
              id: `edge_${layer}_${i}_${j}`,
              source: `node_${layer - 1}_${sourceIdx}`,
              target: nodeId
            });
          }
        }

        nodeIndex++;
      }
    }

    return {
      name: 'performance-stress-test',
      description: `High-performance graph with ${nodeCount} nodes`,
      graph: {
        id: `perf-graph-${Date.now()}`,
        seed: options.seed || 42,
        nodes,
        edges
      },
      expectedBehavior: 'performance',
      performanceThresholds: {
        maxExecutionTimeMs: nodeCount < 500 ? 1000 : 3000,
        maxMemoryUsageMB: Math.max(50, nodeCount * 0.1)
      }
    };
  }

  /**
   * Generate graphs with security vulnerabilities for testing
   */
  private generateSecurityScenario(options: GraphGenerationOptions): GraphScenario {
    const securityTests = [
      () => this.generateMaliciousExpressionGraph(),
      () => this.generatePrototypePollutionGraph(),
      () => this.generateCodeInjectionGraph(),
      () => this.generateResourceExhaustionGraph()
    ];

    const scenario = securityTests[Math.floor(this.rng() * securityTests.length)]();
    return {
      name: `security-${scenario.type}`,
      description: scenario.description,
      graph: scenario.graph,
      expectedBehavior: 'error'
    };
  }

  /**
   * Generate edge case graphs for boundary testing
   */
  private generateEdgeCaseScenario(options: GraphGenerationOptions): GraphScenario {
    const edgeCases = [
      () => this.generateEmptyGraph(),
      () => this.generateSingleNodeGraph(),
      () => this.generateLargeWeightGraph(),
      () => this.generateZeroWeightGraph(),
      () => this.generateDeepNestingGraph(options.maxDepth || 20)
    ];

    const scenario = edgeCases[Math.floor(this.rng() * edgeCases.length)]();
    return {
      name: `edge-case-${scenario.type}`,
      description: scenario.description,
      graph: scenario.graph,
      expectedBehavior: scenario.expectedBehavior || 'success'
    };
  }

  /**
   * Calculate layer sizes for branching graph structure
   */
  private calculateLayerSizes(totalNodes: number): number[] {
    const layers: number[] = [];
    let remaining = totalNodes;
    let layerIndex = 0;

    while (remaining > 0) {
      if (layerIndex === 0) {
        // Input layer - fewer nodes
        const layerSize = Math.min(remaining, Math.ceil(totalNodes * 0.1));
        layers.push(layerSize);
        remaining -= layerSize;
      } else if (remaining < totalNodes * 0.1) {
        // Final layer - output nodes
        layers.push(remaining);
        remaining = 0;
      } else {
        // Middle layers - most nodes
        const layerSize = Math.min(remaining, Math.ceil(totalNodes * 0.3));
        layers.push(layerSize);
        remaining -= layerSize;
      }
      layerIndex++;
    }

    return layers;
  }

  /**
   * Generate a random advanced node for performance testing
   */
  private generateRandomAdvancedNode(nodeId: string): Node {
    const advancedTypes: NodeTypeEnum[] = ['WeightedAdvanced', 'Conditional', 'Sequential', 'Markov'];
    const type = advancedTypes[Math.floor(this.rng() * advancedTypes.length)];

    switch (type) {
    case 'WeightedAdvanced':
      return {
        id: nodeId,
        type: 'WeightedAdvanced',
        choices: Array.from({ length: 20 }, (_, i) => ({
          text: `Advanced ${nodeId}_${i}`,
          weight: this.rng() * 10
        })),
        distributionConfig: {
          type: 'exponential',
          normalize: true,
          temperature: 1.0 + this.rng() * 2.0
        }
      };

    case 'Sequential':
      return {
        id: nodeId,
        type: 'Sequential',
        sequence: Array.from({ length: 30 }, (_, i) => `Item ${nodeId}_${i}`),
        pattern: {
          type: 'weighted',
          config: {
            weights: Array.from({ length: 30 }, () => this.rng())
          }
        }
      };

    case 'Markov':
      const states = ['alpha', 'beta', 'gamma', 'delta'];
      const transitions: Record<string, Record<string, number>> = {};
        
      for (const state of states) {
        transitions[state] = {};
        let remaining = 1.0;
          
        for (let i = 0; i < states.length - 1; i++) {
          const prob = this.rng() * remaining;
          transitions[state][states[i]] = prob;
          remaining -= prob;
        }
        transitions[state][states[states.length - 1]] = remaining;
      }

      return {
        id: nodeId,
        type: 'Markov',
        states,
        transitions,
        initialState: states[0],
        markovConfig: {
          maxSteps: 10,
          terminationConditions: [states[states.length - 1]]
        }
      };

    default:
      return {
        id: nodeId,
        type: 'Conditional',
        branches: [
          { condition: 'true', output: `Conditional ${nodeId} met` }
        ],
        defaultOutput: `Conditional ${nodeId} default`
      };
    }
  }

  // Validation scenario generators
  private generateSelfLoopGraph() {
    return {
      type: 'self-loop',
      description: 'Graph with self-referencing edges',
      graph: {
        id: 'self-loop-test',
        seed: 12345,
        nodes: [
          { id: 'node1', type: 'WeightedChoice' as const, choices: [{ text: 'Self', weight: 1 }] },
          { id: 'output1', type: 'Output' as const, inputs: ['node1'] }
        ],
        edges: [
          { id: 'e1', source: 'node1', target: 'node1' }, // Self-loop
          { id: 'e2', source: 'node1', target: 'output1' }
        ]
      }
    };
  }

  private generateDisconnectedGraph() {
    return {
      type: 'disconnected',
      description: 'Graph with disconnected components',
      graph: {
        id: 'disconnected-test',
        seed: 12345,
        nodes: [
          { id: 'isolated1', type: 'WeightedChoice' as const, choices: [{ text: 'Isolated', weight: 1 }] },
          { id: 'isolated2', type: 'WeightedChoice' as const, choices: [{ text: 'Also isolated', weight: 1 }] },
          { id: 'output1', type: 'Output' as const, inputs: ['connected1'] },
          { id: 'connected1', type: 'WeightedChoice' as const, choices: [{ text: 'Connected', weight: 1 }] }
        ],
        edges: [
          { id: 'e1', source: 'connected1', target: 'output1' }
          // isolated1 and isolated2 have no connections
        ]
      }
    };
  }

  private generateCircularDependencyGraph() {
    return {
      type: 'circular-dependency',
      description: 'Graph with circular dependencies',
      graph: {
        id: 'circular-test',
        seed: 12345,
        nodes: [
          { id: 'node1', type: 'Concat' as const, inputs: ['node2'] },
          { id: 'node2', type: 'Concat' as const, inputs: ['node3'] },
          { id: 'node3', type: 'Concat' as const, inputs: ['node1'] }, // Creates cycle
          { id: 'output1', type: 'Output' as const, inputs: ['node1'] }
        ],
        edges: [
          { id: 'e1', source: 'node2', target: 'node1' },
          { id: 'e2', source: 'node3', target: 'node2' },
          { id: 'e3', source: 'node1', target: 'node3' }, // Creates cycle
          { id: 'e4', source: 'node1', target: 'output1' }
        ]
      }
    };
  }

  private generateMissingInputGraph() {
    return {
      type: 'missing-input',
      description: 'Graph with references to non-existent nodes',
      graph: {
        id: 'missing-input-test',
        seed: 12345,
        nodes: [
          { id: 'output1', type: 'Output' as const, inputs: ['nonexistent'] }
        ],
        edges: []
      }
    };
  }

  private generateDuplicateEdgeGraph() {
    return {
      type: 'duplicate-edges',
      description: 'Graph with duplicate edges between same nodes',
      graph: {
        id: 'duplicate-edge-test',
        seed: 12345,
        nodes: [
          { id: 'node1', type: 'WeightedChoice' as const, choices: [{ text: 'Source', weight: 1 }] },
          { id: 'output1', type: 'Output' as const, inputs: ['node1'] }
        ],
        edges: [
          { id: 'e1', source: 'node1', target: 'output1' },
          { id: 'e2', source: 'node1', target: 'output1' } // Duplicate
        ]
      }
    };
  }

  // Security scenario generators  
  private generateMaliciousExpressionGraph() {
    return {
      type: 'malicious-expression',
      description: 'Graph with dangerous expression evaluation',
      graph: {
        id: 'malicious-expr-test',
        seed: 12345,
        nodes: [
          {
            id: 'conditional1',
            type: 'Conditional' as const,
            branches: [
              { condition: 'eval("process.exit(1)")', output: 'Malicious executed' }
            ],
            defaultOutput: 'Safe'
          },
          { id: 'output1', type: 'Output' as const, inputs: ['conditional1'] }
        ],
        edges: [
          { id: 'e1', source: 'conditional1', target: 'output1' }
        ]
      }
    };
  }

  private generatePrototypePollutionGraph() {
    return {
      type: 'prototype-pollution',
      description: 'Graph attempting prototype pollution',
      graph: {
        id: 'prototype-pollution-test',
        seed: 12345,
        nodes: [
          { id: 'setVar1', type: 'SetVariable' as const, key: '__proto__', value: '{"isEvil": true}' },
          { id: 'getVar1', type: 'GetVariable' as const, key: '__proto__', inputs: ['setVar1'] },
          { id: 'output1', type: 'Output' as const, inputs: ['getVar1'] }
        ],
        edges: [
          { id: 'e1', source: 'setVar1', target: 'getVar1' },
          { id: 'e2', source: 'getVar1', target: 'output1' }
        ]
      }
    };
  }

  private generateCodeInjectionGraph() {
    return {
      type: 'code-injection',
      description: 'Graph with code injection attempts',
      graph: {
        id: 'code-injection-test',
        seed: 12345,
        nodes: [
          {
            id: 'conditional1',
            type: 'Conditional' as const,
            branches: [
              { condition: 'Function("return process")().exit(1)', output: 'Injection succeeded' }
            ],
            defaultOutput: 'Safe'
          },
          { id: 'output1', type: 'Output' as const, inputs: ['conditional1'] }
        ],
        edges: [
          { id: 'e1', source: 'conditional1', target: 'output1' }
        ]
      }
    };
  }

  private generateResourceExhaustionGraph() {
    return {
      type: 'resource-exhaustion',
      description: 'Graph designed to exhaust system resources',
      graph: {
        id: 'resource-exhaustion-test',
        seed: 12345,
        nodes: [
          {
            id: 'conditional1',
            type: 'Conditional' as const,
            branches: [
              { condition: 'while(true) { /* infinite loop */ }', output: 'Loop completed' }
            ],
            defaultOutput: 'Safe'
          },
          { id: 'output1', type: 'Output' as const, inputs: ['conditional1'] }
        ],
        edges: [
          { id: 'e1', source: 'conditional1', target: 'output1' }
        ]
      }
    };
  }

  // Edge case scenario generators
  private generateEmptyGraph() {
    return {
      type: 'empty',
      description: 'Completely empty graph',
      graph: {
        id: 'empty-test',
        seed: 12345,
        nodes: [],
        edges: []
      },
      expectedBehavior: 'success' as const
    };
  }

  private generateSingleNodeGraph() {
    return {
      type: 'single-node',
      description: 'Graph with only one output node',
      graph: {
        id: 'single-node-test',
        seed: 12345,
        nodes: [
          { id: 'output1', type: 'Output' as const, inputs: [] }
        ],
        edges: []
      },
      expectedBehavior: 'success' as const
    };
  }

  private generateLargeWeightGraph() {
    return {
      type: 'large-weights',
      description: 'Graph with extremely large weight values',
      graph: {
        id: 'large-weights-test',
        seed: 12345,
        nodes: [
          {
            id: 'choice1',
            type: 'WeightedChoice' as const,
            choices: [
              { text: 'Huge weight', weight: Number.MAX_SAFE_INTEGER },
              { text: 'Normal weight', weight: 1 }
            ]
          },
          { id: 'output1', type: 'Output' as const, inputs: ['choice1'] }
        ],
        edges: [
          { id: 'e1', source: 'choice1', target: 'output1' }
        ]
      },
      expectedBehavior: 'success' as const
    };
  }

  private generateZeroWeightGraph() {
    return {
      type: 'zero-weights',
      description: 'Graph with all zero weights',
      graph: {
        id: 'zero-weights-test',
        seed: 12345,
        nodes: [
          {
            id: 'choice1',
            type: 'WeightedChoice' as const,
            choices: [
              { text: 'Zero A', weight: 0 },
              { text: 'Zero B', weight: 0 }
            ]
          },
          { id: 'output1', type: 'Output' as const, inputs: ['choice1'] }
        ],
        edges: [
          { id: 'e1', source: 'choice1', target: 'output1' }
        ]
      },
      expectedBehavior: 'success' as const
    };
  }

  private generateDeepNestingGraph(maxDepth: number) {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create a deep chain of concat nodes
    for (let i = 0; i < maxDepth; i++) {
      if (i === 0) {
        nodes.push({
          id: `depth${i}`,
          type: 'WeightedChoice',
          choices: [{ text: `Depth ${i}`, weight: 1 }]
        });
      } else if (i === maxDepth - 1) {
        nodes.push({
          id: `depth${i}`,
          type: 'Output',
          inputs: [`depth${i - 1}`]
        });
        edges.push({
          id: `e${i}`,
          source: `depth${i - 1}`,
          target: `depth${i}`
        });
      } else {
        nodes.push({
          id: `depth${i}`,
          type: 'Concat',
          inputs: [`depth${i - 1}`]
        });
        edges.push({
          id: `e${i}`,
          source: `depth${i - 1}`,
          target: `depth${i}`
        });
      }
    }

    return {
      type: 'deep-nesting',
      description: `Graph with ${maxDepth} levels of nesting`,
      graph: {
        id: 'deep-nesting-test',
        seed: 12345,
        nodes,
        edges
      },
      expectedBehavior: 'success' as const
    };
  }

  /**
   * Generate a collection of predefined test scenarios
   */
  generateTestSuite(): GraphScenario[] {
    return [
      this.generateComplexScenario({ nodeCount: 5, complexity: 'simple' }),
      this.generateComplexScenario({ nodeCount: 100, complexity: 'performance' }),
      this.generateComplexScenario({ nodeCount: 1000, complexity: 'performance', memoryIntensive: true }),
      this.generateComplexScenario({ nodeCount: 10, complexity: 'validation' }),
      this.generateComplexScenario({ nodeCount: 5, complexity: 'security' }),
      this.generateComplexScenario({ nodeCount: 3, complexity: 'edge-case', maxDepth: 50 }),
      this.generateComplexScenario({ 
        nodeCount: 200, 
        complexity: 'performance', 
        includeAdvancedNodes: true 
      })
    ];
  }
}

/**
 * Batch generation methods for comprehensive testing
 */
export class GraphBatchGenerator {
  private generator: AdvancedGraphGenerator;

  constructor(seed: number = 12345) {
    this.generator = new AdvancedGraphGenerator(seed);
  }

  /**
   * Generate a comprehensive test matrix for regression testing
   */
  generateRegressionMatrix(): GraphScenario[] {
    const scenarios: GraphScenario[] = [];

    // Node count variations
    const nodeCounts = [1, 5, 10, 25, 50, 100, 500];
    
    // Complexity variations
    const complexities: Array<'simple' | 'validation' | 'performance' | 'security' | 'edge-case'> = 
      ['simple', 'validation', 'performance', 'security', 'edge-case'];

    for (const nodeCount of nodeCounts) {
      for (const complexity of complexities) {
        scenarios.push(this.generator.generateComplexScenario({
          nodeCount,
          complexity,
          seed: nodeCount * 1000 + scenarios.length,
          includeAdvancedNodes: nodeCount > 20,
          memoryIntensive: nodeCount > 100
        }));
      }
    }

    return scenarios;
  }

  /**
   * Generate specific performance benchmarking scenarios
   */
  generatePerformanceBenchmarks(): GraphScenario[] {
    return [
      // Small graph baseline
      this.generator.generateComplexScenario({
        nodeCount: 10,
        complexity: 'simple',
        seed: 1001
      }),
      
      // Medium graph with advanced nodes
      this.generator.generateComplexScenario({
        nodeCount: 100,
        complexity: 'performance',
        includeAdvancedNodes: true,
        seed: 1002
      }),
      
      // Large graph stress test
      this.generator.generateComplexScenario({
        nodeCount: 1000,
        complexity: 'performance',
        includeAdvancedNodes: true,
        memoryIntensive: true,
        seed: 1003
      }),
      
      // Deep nesting test
      this.generator.generateComplexScenario({
        nodeCount: 50,
        complexity: 'edge-case',
        maxDepth: 100,
        seed: 1004
      }),
      
      // Connection density test
      this.generator.generateComplexScenario({
        nodeCount: 200,
        complexity: 'performance',
        connectionDensity: 0.8,
        seed: 1005
      })
    ];
  }

  /**
   * Generate security-focused test scenarios
   */
  generateSecurityTestMatrix(): GraphScenario[] {
    const scenarios: GraphScenario[] = [];
    
    // Generate multiple security scenarios with different seeds
    for (let i = 0; i < 10; i++) {
      scenarios.push(this.generator.generateComplexScenario({
        nodeCount: 5 + (i * 2),
        complexity: 'security',
        seed: 2000 + i
      }));
    }
    
    return scenarios;
  }

  /**
   * Generate edge case matrix for boundary testing
   */
  generateEdgeCaseMatrix(): GraphScenario[] {
    const scenarios: GraphScenario[] = [];
    
    // Various edge case configurations
    const edgeConfigs = [
      { nodeCount: 0, maxDepth: 1 },
      { nodeCount: 1, maxDepth: 1 },
      { nodeCount: 2, maxDepth: 5 },
      { nodeCount: 5, maxDepth: 20 },
      { nodeCount: 10, maxDepth: 50 },
      { nodeCount: 3, maxDepth: 100 }
    ];
    
    edgeConfigs.forEach((config, index) => {
      scenarios.push(this.generator.generateComplexScenario({
        nodeCount: config.nodeCount,
        complexity: 'edge-case',
        maxDepth: config.maxDepth,
        seed: 3000 + index
      }));
    });
    
    return scenarios;
  }
}

export default AdvancedGraphGenerator;
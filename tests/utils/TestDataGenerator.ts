/**
 * Test Data Generator - Comprehensive test data creation utilities
 * 
 * Provides deterministic test data generation for various testing scenarios
 * including graph generation, user data, performance data, and edge cases.
 */

import { Graph, Node, GraphEdge } from '../packages/core/graphSchema';
import { User, AuthContext, Permission, UserRole } from '../../server/src/types/auth';

export enum TestScenario {
  SIMPLE_LINEAR = 'simple-linear',
  COMPLEX_BRANCHING = 'complex-branching',
  CIRCULAR_DEPENDENCY = 'circular-dependency',
  DEEP_NESTING = 'deep-nesting',
  MEMORY_INTENSIVE = 'memory-intensive',
  PERFORMANCE_STRESS = 'performance-stress'
}

export enum DataPattern {
  SEQUENTIAL = 'sequential',
  RANDOM = 'random',
  WEIGHTED = 'weighted',
  NESTED = 'nested',
  SPARSE = 'sparse',
  DENSE = 'dense'
}

export interface GraphGenerationOptions {
  nodeCount: number;
  seed: number;
  scenario: TestScenario;
  complexity: 'simple' | 'moderate' | 'complex';
  includeAdvancedNodes: boolean;
}

export interface UserGenerationOptions {
  role: UserRole;
  permissions: Permission[];
  organizationId?: string;
  isVerified: boolean;
  mfaEnabled: boolean;
}

export interface PerformanceDataOptions {
  size: number;
  pattern: DataPattern;
  memoryIntensive: boolean;
  nestedDepth?: number;
}

export class TestDataGenerator {
  private prng: (seed: number) => number;

  constructor() {
    // Deterministic PRNG for consistent test data
    this.prng = this.createSeededRandom();
  }

  private createSeededRandom(): (seed: number) => number {
    return (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
  }

  private random(seed: number, min: number = 0, max: number = 1): number {
    const r = this.prng(seed);
    return min + (r * (max - min));
  }

  private randomInt(seed: number, min: number, max: number): number {
    return Math.floor(this.random(seed, min, max + 1));
  }

  /**
   * Generate test graphs with various scenarios
   */
  generateGraph(options: GraphGenerationOptions): Graph {
    const { nodeCount, seed, scenario, complexity, includeAdvancedNodes } = options;

    switch (scenario) {
    case TestScenario.SIMPLE_LINEAR:
      return this.generateLinearGraph(nodeCount, seed);
      
    case TestScenario.COMPLEX_BRANCHING:
      return this.generateBranchingGraph(nodeCount, seed, complexity);
      
    case TestScenario.CIRCULAR_DEPENDENCY:
      return this.generateCircularGraph(nodeCount, seed);
      
    case TestScenario.DEEP_NESTING:
      return this.generateDeepNestedGraph(nodeCount, seed);
      
    case TestScenario.MEMORY_INTENSIVE:
      return this.generateMemoryIntensiveGraph(nodeCount, seed);
      
    case TestScenario.PERFORMANCE_STRESS:
      return this.generatePerformanceStressGraph(nodeCount, seed, includeAdvancedNodes);
      
    default:
      return this.generateStandardGraph(nodeCount, seed);
    }
  }

  private generateLinearGraph(nodeCount: number, seed: number): Graph {
    const nodes: Node[] = [];
    const edges: GraphEdge[] = [];

    // Create linear chain of nodes
    for (let i = 0; i < nodeCount; i++) {
      const nodeId = `node_${i}`;
      
      if (i === 0) {
        // Start with input node
        nodes.push({
          id: nodeId,
          type: 'SetVariable',
          data: {
            variableName: 'input',
            value: `Test value ${i}`
          },
          position: { x: i * 200, y: 100 }
        });
      } else if (i === nodeCount - 1) {
        // End with output node
        nodes.push({
          id: nodeId,
          type: 'Output',
          data: {},
          position: { x: i * 200, y: 100 }
        });
        edges.push({
          id: `edge_${i-1}_${i}`,
          source: `node_${i-1}`,
          target: nodeId
        });
      } else {
        // Middle nodes - concat or weighted choice
        const nodeType = this.randomInt(seed + i, 0, 1) === 0 ? 'Concat' : 'WeightedChoice';
        
        if (nodeType === 'Concat') {
          nodes.push({
            id: nodeId,
            type: 'Concat',
            data: {
              separator: ' ',
              texts: [`Step ${i}`, '{input}']
            },
            position: { x: i * 200, y: 100 }
          });
        } else {
          nodes.push({
            id: nodeId,
            type: 'WeightedChoice',
            data: {
              choices: [
                { value: `Choice A ${i}`, weight: 1 },
                { value: `Choice B ${i}`, weight: 1 }
              ]
            },
            position: { x: i * 200, y: 100 }
          });
        }
        
        edges.push({
          id: `edge_${i-1}_${i}`,
          source: `node_${i-1}`,
          target: nodeId
        });
      }
    }

    return {
      seed,
      nodes,
      edges: edges as any[]
    };
  }

  private generateBranchingGraph(nodeCount: number, seed: number, complexity: 'simple' | 'moderate' | 'complex'): Graph {
    const nodes: Node[] = [];
    const edges: GraphEdge[] = [];
    
    const branchFactor = complexity === 'simple' ? 2 : complexity === 'moderate' ? 3 : 4;
    let nodeIndex = 0;

    // Root node
    nodes.push({
      id: 'root',
      type: 'SetVariable',
      data: {
        variableName: 'input',
        value: 'Root value'
      },
      position: { x: 400, y: 50 }
    });
    nodeIndex++;

    // Generate branches
    const levels = Math.ceil(Math.log(nodeCount) / Math.log(branchFactor));
    let currentLevelNodes = ['root'];

    for (let level = 1; level < levels && nodeIndex < nodeCount; level++) {
      const nextLevelNodes: string[] = [];
      
      for (const parentId of currentLevelNodes) {
        const childCount = Math.min(branchFactor, nodeCount - nodeIndex);
        
        for (let child = 0; child < childCount && nodeIndex < nodeCount; child++) {
          const childId = `node_${nodeIndex}`;
          
          nodes.push({
            id: childId,
            type: 'WeightedChoice',
            data: {
              choices: [
                { value: `Branch ${level}-${child} A`, weight: this.random(seed + nodeIndex, 1, 5) },
                { value: `Branch ${level}-${child} B`, weight: this.random(seed + nodeIndex + 1, 1, 5) }
              ]
            },
            position: { 
              x: 100 + (child * 200), 
              y: 100 + (level * 150) 
            }
          });

          edges.push({
            id: `edge_${parentId}_${childId}`,
            source: parentId,
            target: childId
          });

          nextLevelNodes.push(childId);
          nodeIndex++;
        }
      }
      
      currentLevelNodes = nextLevelNodes;
    }

    // Add output node
    if (currentLevelNodes.length > 0) {
      nodes.push({
        id: 'output',
        type: 'Output',
        data: {},
        position: { x: 400, y: 100 + (levels * 150) }
      });

      // Connect all leaf nodes to output
      currentLevelNodes.forEach((leafId, index) => {
        edges.push({
          id: `edge_${leafId}_output`,
          source: leafId,
          target: 'output'
        });
      });
    }

    return {
      seed,
      nodes,
      edges: edges as any[]
    };
  }

  private generateCircularGraph(nodeCount: number, seed: number): Graph {
    const nodes: Node[] = [];
    const edges: GraphEdge[] = [];

    // Create circular dependency intentionally for testing
    for (let i = 0; i < nodeCount; i++) {
      const nodeId = `node_${i}`;
      
      nodes.push({
        id: nodeId,
        type: 'Concat',
        data: {
          separator: ' -> ',
          texts: [`Node ${i}`, '{variable}']
        },
        position: { 
          x: 300 + 200 * Math.cos((2 * Math.PI * i) / nodeCount),
          y: 300 + 200 * Math.sin((2 * Math.PI * i) / nodeCount)
        }
      });

      // Connect to next node (creating circular dependency)
      const nextIndex = (i + 1) % nodeCount;
      edges.push({
        id: `edge_${i}_${nextIndex}`,
        source: nodeId,
        target: `node_${nextIndex}`
      });
    }

    return {
      seed,
      nodes,
      edges: edges as any[]
    };
  }

  private generateDeepNestedGraph(nodeCount: number, seed: number): Graph {
    const nodes: Node[] = [];
    const edges: GraphEdge[] = [];

    // Create deeply nested structure
    for (let i = 0; i < nodeCount; i++) {
      const nodeId = `node_${i}`;
      const depth = Math.floor(i / 3); // 3 nodes per level
      
      if (i === 0) {
        nodes.push({
          id: nodeId,
          type: 'SetVariable',
          data: {
            variableName: `var_level_${depth}`,
            value: `Deep value ${depth}`
          },
          position: { x: 100, y: 100 + (depth * 100) }
        });
      } else {
        nodes.push({
          id: nodeId,
          type: 'GetVariable',
          data: {
            variableName: `var_level_${depth - 1}`,
            defaultValue: `Default ${depth}`
          },
          position: { x: 100 + ((i % 3) * 150), y: 100 + (depth * 100) }
        });

        // Connect to previous level
        if (i > 0) {
          const sourceIndex = Math.max(0, i - 3);
          edges.push({
            id: `edge_${sourceIndex}_${i}`,
            source: `node_${sourceIndex}`,
            target: nodeId
          });
        }
      }
    }

    return {
      seed,
      nodes,
      edges: edges as any[]
    };
  }

  private generateMemoryIntensiveGraph(nodeCount: number, seed: number): Graph {
    const nodes: Node[] = [];
    const edges: GraphEdge[] = [];

    // Create memory-intensive scenarios with large data
    for (let i = 0; i < nodeCount; i++) {
      const nodeId = `node_${i}`;
      
      nodes.push({
        id: nodeId,
        type: 'WeightedChoice',
        data: {
          choices: Array.from({ length: 100 }, (_, choiceIndex) => ({
            value: `Large choice ${i}_${choiceIndex} with lots of data: ${new Array(100).fill('X').join('')}`,
            weight: this.random(seed + i + choiceIndex, 0.1, 5.0)
          }))
        },
        position: { x: (i % 10) * 150, y: Math.floor(i / 10) * 200 }
      });

      if (i > 0) {
        edges.push({
          id: `edge_${i-1}_${i}`,
          source: `node_${i-1}`,
          target: nodeId
        });
      }
    }

    return {
      seed,
      nodes,
      edges: edges as any[]
    };
  }

  private generatePerformanceStressGraph(nodeCount: number, seed: number, includeAdvancedNodes: boolean): Graph {
    const nodes: Node[] = [];
    const edges: GraphEdge[] = [];

    // Create performance stress test scenario
    const nodeTypes = ['WeightedChoice', 'Concat', 'SetVariable', 'GetVariable'];
    if (includeAdvancedNodes) {
      nodeTypes.push('Conditional', 'Sequential', 'Markov', 'WeightedAdvanced');
    }

    for (let i = 0; i < nodeCount; i++) {
      const nodeId = `node_${i}`;
      const nodeTypeIndex = this.randomInt(seed + i, 0, nodeTypes.length - 1);
      const nodeType = nodeTypes[nodeTypeIndex];
      
      let nodeData: any = {};
      
      switch (nodeType) {
      case 'WeightedChoice':
        nodeData = {
          choices: Array.from({ length: 20 }, (_, j) => ({
            value: `Stress choice ${i}_${j}`,
            weight: this.random(seed + i + j, 0.1, 10.0)
          }))
        };
        break;
          
      case 'Concat':
        nodeData = {
          separator: ' | ',
          texts: Array.from({ length: 10 }, (_, j) => `Text ${i}_${j}`)
        };
        break;
          
      case 'SetVariable':
        nodeData = {
          variableName: `var_${i}`,
          value: `Complex value ${i} with data: ${new Array(50).fill('DATA').join(' ')}`
        };
        break;
          
      case 'GetVariable':
        nodeData = {
          variableName: `var_${Math.max(0, i - 1)}`,
          defaultValue: `Default for ${i}`
        };
        break;
          
      case 'Conditional':
        nodeData = {
          branches: Array.from({ length: 5 }, (_, j) => ({
            condition: `variable_${i} > ${j * 10}`,
            output: `Condition ${i}_${j} met`,
            label: `Branch ${j}`
          })),
          defaultOutput: `Default for ${i}`
        };
        break;
      }

      nodes.push({
        id: nodeId,
        type: nodeType as any,
        data: nodeData,
        position: { 
          x: (i % 20) * 120, 
          y: Math.floor(i / 20) * 150 
        }
      });

      // Create complex connection patterns
      if (i > 0) {
        const connectionCount = Math.min(3, i);
        for (let conn = 0; conn < connectionCount; conn++) {
          const sourceIndex = i - 1 - conn;
          if (sourceIndex >= 0) {
            edges.push({
              id: `edge_${sourceIndex}_${i}_${conn}`,
              source: `node_${sourceIndex}`,
              target: nodeId
            });
          }
        }
      }
    }

    return {
      seed,
      nodes,
      edges: edges as any[]
    };
  }

  private generateStandardGraph(nodeCount: number, seed: number): Graph {
    // Standard graph with balanced complexity
    return this.generateBranchingGraph(nodeCount, seed, 'moderate');
  }

  /**
   * Generate test user data
   */
  generateUser(options: UserGenerationOptions): User {
    const { role, permissions, organizationId, isVerified, mfaEnabled } = options;
    
    return {
      id: `user_${Date.now()}_${Math.random()}`,
      email: `test.user.${role.toLowerCase()}@example.com`,
      username: `testuser_${role.toLowerCase()}`,
      role,
      permissions,
      organizationId,
      isVerified,
      mfaEnabled,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true
    };
  }

  /**
   * Generate authentication context
   */
  generateAuthContext(user: User): AuthContext {
    return {
      user,
      sessionId: `session_${Date.now()}`,
      accessToken: `access_${Math.random().toString(36)}`,
      refreshToken: `refresh_${Math.random().toString(36)}`,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      permissions: user.permissions,
      organizationId: user.organizationId
    };
  }

  /**
   * Generate large datasets for performance testing
   */
  generateLargeDataset(options: PerformanceDataOptions): any[] {
    const { size, pattern, memoryIntensive, nestedDepth = 3 } = options;
    const dataset: any[] = [];

    for (let i = 0; i < size; i++) {
      let item: any;

      switch (pattern) {
      case DataPattern.SEQUENTIAL:
        item = { id: i, value: `Item ${i}`, index: i };
        break;
          
      case DataPattern.RANDOM:
        item = { 
          id: Math.random(), 
          value: Math.random().toString(36),
          data: memoryIntensive ? new Array(1000).fill('X').join('') : null
        };
        break;
          
      case DataPattern.WEIGHTED:
        item = {
          id: i,
          weight: this.random(i, 0.1, 10.0),
          category: ['A', 'B', 'C'][i % 3],
          priority: this.randomInt(i, 1, 5)
        };
        break;
          
      case DataPattern.NESTED:
        item = this.createNestedObject(i, nestedDepth, memoryIntensive);
        break;
          
      default:
        item = { id: i, value: `Item ${i}` };
      }

      dataset.push(item);
    }

    return dataset;
  }

  private createNestedObject(id: number, depth: number, memoryIntensive: boolean): any {
    if (depth <= 0) {
      return memoryIntensive 
        ? new Array(100).fill(`Deep data ${id}`).join(' ')
        : `Deep value ${id}`;
    }

    return {
      id,
      level: depth,
      data: memoryIntensive ? new Array(50).fill('X').join('') : `Level ${depth}`,
      nested: this.createNestedObject(id, depth - 1, memoryIntensive),
      siblings: Array.from({ length: 3 }, (_, i) => ({
        siblingId: `${id}_${depth}_${i}`,
        value: `Sibling ${i} at depth ${depth}`
      }))
    };
  }

  /**
   * Generate edge case test scenarios
   */
  generateEdgeCaseScenarios(): Record<string, any> {
    return {
      // Empty/null scenarios
      emptyGraph: { seed: 123, nodes: [], edges: [] },
      nullValues: { id: null, value: null, data: null },
      
      // Boundary value scenarios
      maxInteger: Number.MAX_SAFE_INTEGER,
      minInteger: Number.MIN_SAFE_INTEGER,
      veryLargeString: new Array(10000).fill('X').join(''),
      
      // Special character scenarios
      unicodeString: '🎯🔥💡🚀✨🎪🌟⚡🎨🔧',
      specialChars: '!@#$%^&*()[]{}|\\;:\'",.<>?`~',
      sqlInjection: '\'; DROP TABLE users; --',
      xssAttempt: '<script>alert("XSS")</script>',
      
      // Date edge cases
      epochDate: new Date(0),
      futureDate: new Date(2099, 11, 31),
      invalidDate: new Date('invalid'),
      
      // Circular references (for JSON serialization testing)
      circularRef: (() => {
        const obj: any = { id: 'circular' };
        obj.self = obj;
        return obj;
      })()
    };
  }
}

// Export singleton instance
export const testDataGenerator = new TestDataGenerator();
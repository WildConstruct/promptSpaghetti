/**
 * Tests for GraphValidator
 */

import { GraphValidator } from '../validation';
import { GraphDocument, GraphNode, GraphEdge } from '../types';

describe('GraphValidator', () => {
  let validator: GraphValidator;

  beforeEach(() => {
    validator = new GraphValidator();
  });

  describe('Valid Graphs', () => {
    it('should validate a simple valid graph', () => {
      const graph: GraphDocument = {
        id: 'valid-graph',
        nodes: new Map([
          ['output1', {
            id: 'output1',
            type: 'Output',
            data: { text: 'Hello World' }
          }]
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a complex valid graph', () => {
      const graph: GraphDocument = {
        id: 'complex-graph',
        nodes: new Map([
          ['choice1', {
            id: 'choice1',
            type: 'WeightedChoice',
            data: {
              choices: [
                { value: 'Hello', weight: 0.6 },
                { value: 'Hi', weight: 0.4 }
              ]
            }
          }],
          ['concat1', {
            id: 'concat1',
            type: 'Concat',
            data: { template: '{{choice1}} World!' }
          }],
          ['output1', {
            id: 'output1',
            type: 'Output',
            data: { text: '{{concat1}}' }
          }]
        ]),
        edges: new Map([
          ['edge1', {
            id: 'edge1',
            source: 'choice1',
            target: 'concat1'
          }],
          ['edge2', {
            id: 'edge2',
            source: 'concat1',
            target: 'output1'
          }]
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Structure Validation', () => {
    it('should detect missing graph ID', () => {
      const graph = {
        nodes: new Map(),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      } as any;

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'MALFORMED_GRAPH' && e.message.includes('valid string ID'))).toBe(true);
    });

    it('should detect missing nodes Map', () => {
      const graph = {
        id: 'test-graph',
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      } as any;

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'MALFORMED_GRAPH' && e.message.includes('nodes Map'))).toBe(true);
    });

    it('should detect missing edges Map', () => {
      const graph = {
        id: 'test-graph',
        nodes: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      } as any;

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'MALFORMED_GRAPH' && e.message.includes('edges Map'))).toBe(true);
    });

    it('should detect missing metadata', () => {
      const graph = {
        id: 'test-graph',
        nodes: new Map(),
        edges: new Map()
      } as any;

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'MALFORMED_GRAPH' && e.message.includes('metadata object'))).toBe(true);
    });
  });

  describe('Node Validation', () => {
    it('should detect node ID mismatches', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['node1', {
            id: 'different-id', // Mismatch!
            type: 'Output',
            data: { text: 'Hello' }
          }]
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'INVALID_DATA' && e.message.includes('Node ID mismatch'))).toBe(true);
    });

    it('should detect invalid node types', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['node1', {
            id: 'node1',
            type: 'InvalidNodeType' as any,
            data: {}
          }]
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'INVALID_NODE_TYPE')).toBe(true);
    });

    it('should validate WeightedChoice node data', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['choice1', {
            id: 'choice1',
            type: 'WeightedChoice',
            data: {
              choices: [
                { value: 'Option A', weight: -1 } // Invalid negative weight
              ]
            }
          }]
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'INVALID_DATA' && e.message.includes('non-negative number weight'))).toBe(true);
    });

    it('should validate SetVariable node data', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['setVar1', {
            id: 'setVar1',
            type: 'SetVariable',
            data: {} // Missing key
          }]
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'INVALID_DATA' && e.message.includes('string key'))).toBe(true);
    });

    it('should validate GetVariable node data', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['getVar1', {
            id: 'getVar1',
            type: 'GetVariable',
            data: { key: 123 } // Invalid key type
          }]
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'INVALID_DATA' && e.message.includes('string key'))).toBe(true);
    });

    it('should validate Include node data', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['include1', {
            id: 'include1',
            type: 'Include',
            data: { name: null } // Invalid name
          }]
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'INVALID_DATA' && e.message.includes('string name'))).toBe(true);
    });

    it('should validate node inputs array', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['node1', {
            id: 'node1',
            type: 'Output',
            data: { text: 'Hello' },
            inputs: 'not-an-array' as any
          }]
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'INVALID_DATA' && e.message.includes('inputs must be an array'))).toBe(true);
    });

    it('should detect references to non-existent input nodes', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['node1', {
            id: 'node1',
            type: 'Output',
            data: { text: 'Hello' },
            inputs: ['nonexistent-node']
          }]
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'MISSING_NODE' && e.message.includes('non-existent input node'))).toBe(true);
    });
  });

  describe('Edge Validation', () => {
    it('should detect edge ID mismatches', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['node1', { id: 'node1', type: 'Output', data: {} }],
          ['node2', { id: 'node2', type: 'Concat', data: {} }]
        ]),
        edges: new Map([
          ['edge1', {
            id: 'different-id', // Mismatch!
            source: 'node2',
            target: 'node1'
          }]
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'INVALID_DATA' && e.message.includes('Edge ID mismatch'))).toBe(true);
    });

    it('should detect edges with non-existent source nodes', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['node1', { id: 'node1', type: 'Output', data: {} }]
        ]),
        edges: new Map([
          ['edge1', {
            id: 'edge1',
            source: 'nonexistent',
            target: 'node1'
          }]
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'MISSING_NODE' && e.message.includes('non-existent source node'))).toBe(true);
    });

    it('should detect edges with non-existent target nodes', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['node1', { id: 'node1', type: 'Output', data: {} }]
        ]),
        edges: new Map([
          ['edge1', {
            id: 'edge1',
            source: 'node1',
            target: 'nonexistent'
          }]
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'MISSING_NODE' && e.message.includes('non-existent target node'))).toBe(true);
    });

    it('should detect self-loops', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['node1', { id: 'node1', type: 'Output', data: {} }]
        ]),
        edges: new Map([
          ['edge1', {
            id: 'edge1',
            source: 'node1',
            target: 'node1' // Self-loop!
          }]
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'INVALID_EDGE' && e.message.includes('self-loop'))).toBe(true);
    });
  });

  describe('Cycle Detection', () => {
    it('should detect simple cycles', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['node1', { id: 'node1', type: 'Output', data: {} }],
          ['node2', { id: 'node2', type: 'Concat', data: {} }],
          ['node3', { id: 'node3', type: 'WeightedChoice', data: { choices: [] } }]
        ]),
        edges: new Map([
          ['edge1', { id: 'edge1', source: 'node1', target: 'node2' }],
          ['edge2', { id: 'edge2', source: 'node2', target: 'node3' }],
          ['edge3', { id: 'edge3', source: 'node3', target: 'node1' }] // Creates cycle
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'CYCLE_DETECTED')).toBe(true);
    });

    it('should not detect cycles in DAGs', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['node1', { id: 'node1', type: 'WeightedChoice', data: { choices: [] } }],
          ['node2', { id: 'node2', type: 'Concat', data: {} }],
          ['node3', { id: 'node3', type: 'Output', data: {} }]
        ]),
        edges: new Map([
          ['edge1', { id: 'edge1', source: 'node1', target: 'node2' }],
          ['edge2', { id: 'edge2', source: 'node2', target: 'node3' }]
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.type === 'CYCLE_DETECTED')).toHaveLength(0);
    });
  });

  describe('Performance Analysis', () => {
    it('should warn about large graphs', () => {
      const nodes = new Map<string, GraphNode>();
      
      // Create more than 100 nodes
      for (let i = 0; i < 105; i++) {
        nodes.set(`node${i}`, {
          id: `node${i}`,
          type: 'Output',
          data: { text: `Node ${i}` }
        });
      }

      const graph: GraphDocument = {
        id: 'large-graph',
        nodes,
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.warnings.some(w => w.type === 'PERFORMANCE_CONCERN' && w.message.includes('Large graph'))).toBe(true);
    });

    it('should warn about high edge-to-node ratios', () => {
      const nodes = new Map<string, GraphNode>();
      const edges = new Map<string, GraphEdge>();

      // Create 10 nodes
      for (let i = 0; i < 10; i++) {
        nodes.set(`node${i}`, {
          id: `node${i}`,
          type: 'Output',
          data: { text: `Node ${i}` }
        });
      }

      // Create 25 edges (ratio > 2:1)
      for (let i = 0; i < 25; i++) {
        const sourceIdx = i % 10;
        const targetIdx = (i + 1) % 10;
        if (sourceIdx !== targetIdx) {
          edges.set(`edge${i}`, {
            id: `edge${i}`,
            source: `node${sourceIdx}`,
            target: `node${targetIdx}`
          });
        }
      }

      const graph: GraphDocument = {
        id: 'high-ratio-graph',
        nodes,
        edges,
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.warnings.some(w => w.type === 'PERFORMANCE_CONCERN' && w.message.includes('High edge-to-node ratio'))).toBe(true);
    });
  });

  describe('Connectivity Analysis', () => {
    it('should warn about disconnected nodes', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['connected1', { id: 'connected1', type: 'WeightedChoice', data: { choices: [] } }],
          ['connected2', { id: 'connected2', type: 'Output', data: {} }],
          ['disconnected', { id: 'disconnected', type: 'Output', data: {} }] // No edges
        ]),
        edges: new Map([
          ['edge1', { id: 'edge1', source: 'connected1', target: 'connected2' }]
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.warnings.some(w => w.type === 'DISCONNECTED_NODE' && w.message.includes('completely disconnected'))).toBe(true);
    });

    it('should warn when graph has no Output nodes', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['node1', { id: 'node1', type: 'WeightedChoice', data: { choices: [] } }],
          ['node2', { id: 'node2', type: 'Concat', data: {} }]
        ]),
        edges: new Map([
          ['edge1', { id: 'edge1', source: 'node1', target: 'node2' }]
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = validator.validate(graph);
      
      expect(result.warnings.some(w => w.type === 'DISCONNECTED_NODE' && w.message.includes('no Output nodes'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation exceptions gracefully', () => {
      const malformedGraph = null as any;

      const result = validator.validate(malformedGraph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'MALFORMED_GRAPH' && e.message.includes('Validation failed'))).toBe(true);
    });

    it('should handle graphs with corrupted data', () => {
      const graph = {
        id: 'corrupted',
        nodes: 'not-a-map',
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      } as any;

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Comprehensive Validation', () => {
    it('should provide detailed validation results for complex invalid graphs', () => {
      const graph: GraphDocument = {
        id: '', // Invalid empty ID
        nodes: new Map([
          ['node1', {
            id: 'wrong-id', // ID mismatch
            type: 'InvalidType' as any, // Invalid type
            data: {}
          }],
          ['node2', {
            id: 'node2',
            type: 'WeightedChoice',
            data: {
              choices: 'not-an-array' // Invalid choices
            }
          }]
        ]),
        edges: new Map([
          ['edge1', {
            id: 'edge1',
            source: 'node1',
            target: 'nonexistent' // Missing target
          }],
          ['edge2', {
            id: 'edge2',
            source: 'node2',
            target: 'node2' // Self-loop
          }]
        ]),
        metadata: null as any // Invalid metadata
      };

      const result = validator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
      
      // Should detect multiple types of errors
      const errorTypes = result.errors.map(e => e.type);
      expect(errorTypes).toContain('MALFORMED_GRAPH');
      expect(errorTypes).toContain('INVALID_DATA');
      expect(errorTypes).toContain('INVALID_NODE_TYPE');
      expect(errorTypes).toContain('MISSING_NODE');
      expect(errorTypes).toContain('INVALID_EDGE');
    });
  });
});
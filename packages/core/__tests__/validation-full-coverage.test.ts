import { validateConnection, ValidationError } from '../validation';
import { Edge, Node } from 'reactflow';

describe('Validation Module - Full Coverage (95% target)', () => {
  // Mock nodes for testing
  const mockNodes: Node[] = [
    { id: 'node1', position: { x: 0, y: 0 }, data: {} },
    { id: 'node2', position: { x: 100, y: 0 }, data: {} },
    { id: 'node3', position: { x: 200, y: 0 }, data: {} },
    { id: 'node4', position: { x: 300, y: 0 }, data: {} }
  ];

  describe('validateConnection - Basic Functionality', () => {
    it('should return empty array for valid connections', () => {
      const validEdges: Edge[] = [
        { id: 'e1', source: 'node1', target: 'node2', type: 'default' },
        { id: 'e2', source: 'node2', target: 'node3', type: 'default' },
        { id: 'e3', source: 'node3', target: 'node4', type: 'default' }
      ];

      const errors = validateConnection(validEdges, mockNodes);
      expect(errors).toEqual([]);
    });

    it('should detect self-loops', () => {
      const selfLoopEdges: Edge[] = [
        { id: 'e1', source: 'node1', target: 'node1', type: 'default' },
        { id: 'e2', source: 'node2', target: 'node2', type: 'default' }
      ];

      const errors = validateConnection(selfLoopEdges, mockNodes);
      expect(errors).toHaveLength(2);
      expect(errors[0]).toEqual({
        edgeId: 'e1',
        message: 'Edge is a self-loop'
      });
      expect(errors[1]).toEqual({
        edgeId: 'e2',
        message: 'Edge is a self-loop'
      });
    });

    it('should detect duplicate edges', () => {
      const duplicateEdges: Edge[] = [
        { id: 'e1', source: 'node1', target: 'node2', type: 'default' },
        { id: 'e2', source: 'node1', target: 'node2', type: 'default' },
        { id: 'e3', source: 'node1', target: 'node2', type: 'default' }
      ];

      const errors = validateConnection(duplicateEdges, mockNodes);
      expect(errors).toHaveLength(2); // First is valid, second and third are duplicates
      expect(errors[0]).toEqual({
        edgeId: 'e2',
        message: 'Duplicate edge'
      });
      expect(errors[1]).toEqual({
        edgeId: 'e3',
        message: 'Duplicate edge'
      });
    });
  });

  describe('validateConnection - Edge Cases', () => {
    it('should handle empty edges array', () => {
      const errors = validateConnection([], mockNodes);
      expect(errors).toEqual([]);
    });

    it('should handle empty nodes array', () => {
      const edges: Edge[] = [
        { id: 'e1', source: 'node1', target: 'node2', type: 'default' }
      ];
      const errors = validateConnection(edges, []);
      expect(errors).toEqual([]); // Validation doesn't check node existence
    });

    it('should handle both empty arrays', () => {
      const errors = validateConnection([], []);
      expect(errors).toEqual([]);
    });

    it('should handle edges with missing properties', () => {
      const malformedEdges: Edge[] = [
        { id: 'e1', source: '', target: 'node2', type: 'default' },
        { id: 'e2', source: 'node1', target: '', type: 'default' },
        { id: 'e3', source: '', target: '', type: 'default' }
      ];

      const errors = validateConnection(malformedEdges, mockNodes);
      expect(errors).toHaveLength(1); // Only e3 is a self-loop ('' === '')
      expect(errors[0]).toEqual({
        edgeId: 'e3',
        message: 'Edge is a self-loop'
      });
    });

    it('should handle null/undefined edge properties gracefully', () => {
      const edgesWithNull: Edge[] = [
        { id: 'e1', source: null as any, target: 'node2', type: 'default' },
        { id: 'e2', source: 'node1', target: null as any, type: 'default' },
        { id: 'e3', source: undefined as any, target: undefined as any, type: 'default' }
      ];

      const errors = validateConnection(edgesWithNull, mockNodes);
      expect(errors).toHaveLength(1); // undefined === undefined is a self-loop
      expect(errors[0]).toEqual({
        edgeId: 'e3',
        message: 'Edge is a self-loop'
      });
    });
  });

  describe('validateConnection - Complex Scenarios', () => {
    it('should detect both self-loops and duplicates in same set', () => {
      const complexEdges: Edge[] = [
        { id: 'e1', source: 'node1', target: 'node2', type: 'default' },
        { id: 'e2', source: 'node1', target: 'node2', type: 'default' }, // duplicate
        { id: 'e3', source: 'node2', target: 'node2', type: 'default' }, // self-loop
        { id: 'e4', source: 'node3', target: 'node3', type: 'default' }, // self-loop
        { id: 'e5', source: 'node1', target: 'node2', type: 'default' }  // duplicate
      ];

      const errors = validateConnection(complexEdges, mockNodes);
      expect(errors).toHaveLength(4);
      
      // Check specific errors
      const selfLoopErrors = errors.filter(e => e.message === 'Edge is a self-loop');
      const duplicateErrors = errors.filter(e => e.message === 'Duplicate edge');
      
      expect(selfLoopErrors).toHaveLength(2);
      expect(duplicateErrors).toHaveLength(2);
    });

    it('should handle edges with special characters in IDs', () => {
      const specialEdges: Edge[] = [
        { id: 'e-1!@#$', source: 'node-1!', target: 'node-2@', type: 'default' },
        { id: 'e-2%^&*', source: 'node-1!', target: 'node-2@', type: 'default' }
      ];

      const errors = validateConnection(specialEdges, mockNodes);
      expect(errors).toHaveLength(1); // Second is duplicate
      expect(errors[0].edgeId).toBe('e-2%^&*');
    });

    it('should handle very long edge arrays efficiently', () => {
      const largeEdges: Edge[] = [];
      // Create 1000 unique edges
      for (let i = 0; i < 1000; i++) {
        largeEdges.push({
          id: `e${i}`,
          source: `node${i}`,
          target: `node${i + 1}`,
          type: 'default'
        });
      }

      const start = Date.now();
      const errors = validateConnection(largeEdges, mockNodes);
      const duration = Date.now() - start;

      expect(errors).toEqual([]);
      expect(duration).toBeLessThan(100); // Should be fast
    });

    it('should preserve order of error detection', () => {
      const orderedEdges: Edge[] = [
        { id: 'e1', source: 'A', target: 'A', type: 'default' }, // self-loop
        { id: 'e2', source: 'B', target: 'C', type: 'default' },
        { id: 'e3', source: 'B', target: 'C', type: 'default' }, // duplicate
        { id: 'e4', source: 'D', target: 'D', type: 'default' }, // self-loop
        { id: 'e5', source: 'B', target: 'C', type: 'default' }  // duplicate
      ];

      const errors = validateConnection(orderedEdges, mockNodes);
      expect(errors).toHaveLength(4);
      expect(errors[0].edgeId).toBe('e1');
      expect(errors[1].edgeId).toBe('e3');
      expect(errors[2].edgeId).toBe('e4');
      expect(errors[3].edgeId).toBe('e5');
    });
  });

  describe('validateConnection - Type Safety', () => {
    it('should handle edges with additional properties', () => {
      interface ExtendedEdge extends Edge {
        customProp?: string;
        weight?: number;
      }

      const extendedEdges: ExtendedEdge[] = [
        { 
          id: 'e1', 
          source: 'node1', 
          target: 'node2', 
          type: 'default',
          customProp: 'test',
          weight: 0.5
        }
      ];

      const errors = validateConnection(extendedEdges, mockNodes);
      expect(errors).toEqual([]);
    });

    it('should handle different edge types', () => {
      const typedEdges: Edge[] = [
        { id: 'e1', source: 'node1', target: 'node2', type: 'default' },
        { id: 'e2', source: 'node2', target: 'node3', type: 'smoothstep' },
        { id: 'e3', source: 'node3', target: 'node4', type: 'step' },
        { id: 'e4', source: 'node1', target: 'node4', type: 'straight' }
      ];

      const errors = validateConnection(typedEdges, mockNodes);
      expect(errors).toEqual([]);
    });
  });

  describe('ValidationError Interface', () => {
    it('should correctly type validation errors', () => {
      const error: ValidationError = {
        edgeId: 'test-id',
        message: 'test message'
      };

      expect(error.edgeId).toBe('test-id');
      expect(error.message).toBe('test message');
    });

    it('should handle errors with extended properties', () => {
      interface ExtendedValidationError extends ValidationError {
        severity?: 'warning' | 'error';
        timestamp?: number;
      }

      const extendedError: ExtendedValidationError = {
        edgeId: 'test-id',
        message: 'test message',
        severity: 'error',
        timestamp: Date.now()
      };

      expect(extendedError.severity).toBe('error');
      expect(extendedError.timestamp).toBeDefined();
    });
  });

  describe('Integration with React Flow', () => {
    it('should work with React Flow edge data structures', () => {
      const reactFlowEdges: Edge[] = [
        {
          id: 'e1-2',
          source: '1',
          target: '2',
          type: 'default',
          animated: true,
          style: { stroke: '#fff' }
        },
        {
          id: 'e2-3',
          source: '2',
          target: '3',
          type: 'smoothstep',
          label: 'Edge Label',
          labelStyle: { fill: '#000' }
        }
      ];

      const errors = validateConnection(reactFlowEdges, mockNodes);
      expect(errors).toEqual([]);
    });

    it('should work with React Flow node data structures', () => {
      const reactFlowNodes: Node[] = [
        {
          id: '1',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' },
          type: 'input',
          style: { background: '#fff' }
        },
        {
          id: '2',
          position: { x: 100, y: 100 },
          data: { label: 'Node 2' },
          type: 'default',
          selected: true
        }
      ];

      const edges: Edge[] = [
        { id: 'e1', source: '1', target: '2', type: 'default' }
      ];

      const errors = validateConnection(edges, reactFlowNodes);
      expect(errors).toEqual([]);
    });
  });
});
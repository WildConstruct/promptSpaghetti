// server/src/__tests__/graphValidator.test.ts
import { validateGraph } from '../graphValidator';

describe('Graph Validator', () => {
  describe('Structure validation', () => {
    it('should validate valid graph structure', () => {
      const graph = {
        nodes: [
          {
            id: 'output1',
            type: 'Output',
            inputs: ['concat1']
          },
          {
            id: 'concat1',
            type: 'Concat'
          }
        ]
      };
      
      const result = validateGraph(graph);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch empty graph', () => {
      const graph = { nodes: [] };
      
      const result = validateGraph(graph);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe('INVALID_STRUCTURE');
    });

    it('should catch missing node IDs', () => {
      const graph = {
        nodes: [
          {
            id: '',
            type: 'Output'
          }
        ]
      };
      
      const result = validateGraph(graph);
      expect(result.valid).toBe(false);
      const idError = result.errors.find(e => e.message.includes('ID'));
      expect(idError).toBeDefined();
    });

    it('should catch missing node types', () => {
      const graph = {
        nodes: [
          {
            id: 'output1',
            type: ''
          }
        ]
      };
      
      const result = validateGraph(graph);
      expect(result.valid).toBe(false);
      const typeError = result.errors.find(e => e.message.includes('type'));
      expect(typeError).toBeDefined();
    });
  });

  describe('Node reference validation', () => {
    it('should catch references to non-existent nodes', () => {
      const graph = {
        nodes: [
          {
            id: 'output1',
            type: 'Output',
            inputs: ['doesNotExist']
          }
        ]
      };
      
      const result = validateGraph(graph);
      expect(result.valid).toBe(false);
      const refError = result.errors.find(e => e.code === 'MISSING_NODE_REFERENCE');
      expect(refError).toBeDefined();
      expect(refError?.message).toContain('doesNotExist');
    });
  });

  describe('Cycle detection', () => {
    it('should detect simple cycles', () => {
      const graph = {
        nodes: [
          {
            id: 'node1',
            type: 'Concat',
            inputs: ['node2']
          },
          {
            id: 'node2',
            type: 'Concat',
            inputs: ['node1']
          }
        ]
      };
      
      const result = validateGraph(graph);
      expect(result.valid).toBe(false);
      const cycleError = result.errors.find(e => e.code === 'CYCLE_DETECTED');
      expect(cycleError).toBeDefined();
    });

    it('should detect complex cycles', () => {
      const graph = {
        nodes: [
          {
            id: 'node1',
            type: 'Concat',
            inputs: ['node2']
          },
          {
            id: 'node2',
            type: 'Concat',
            inputs: ['node3']
          },
          {
            id: 'node3',
            type: 'Concat',
            inputs: ['node1']
          }
        ]
      };
      
      const result = validateGraph(graph);
      expect(result.valid).toBe(false);
      const cycleError = result.errors.find(e => e.code === 'CYCLE_DETECTED');
      expect(cycleError).toBeDefined();
    });
  });

  describe('Output node validation', () => {
    it('should ensure graph has at least one Output node', () => {
      const graph = {
        nodes: [
          {
            id: 'concat1',
            type: 'Concat'
          }
        ]
      };
      
      const result = validateGraph(graph);
      expect(result.valid).toBe(false);
      const outputError = result.errors.find(e => e.code === 'NO_OUTPUT_NODES');
      expect(outputError).toBeDefined();
    });
  });

  describe('Node configuration validation', () => {
    it('should validate WeightedChoice nodes', () => {
      const graph = {
        nodes: [
          {
            id: 'output1',
            type: 'Output',
            inputs: ['choice1']
          },
          {
            id: 'choice1',
            type: 'WeightedChoice'
            // Missing choices array
          }
        ]
      };
      
      const result = validateGraph(graph);
      expect(result.valid).toBe(false);
      const configError = result.errors.find(e => e.code === 'INVALID_WEIGHTEDCHOICE_CONFIG');
      expect(configError).toBeDefined();
    });

    it('should validate WeightedChoice with invalid choices', () => {
      const graph = {
        nodes: [
          {
            id: 'output1',
            type: 'Output',
            inputs: ['choice1']
          },
          {
            id: 'choice1',
            type: 'WeightedChoice',
            choices: [
              { value: 'Option 1', weight: 0 } // Invalid weight (must be positive)
            ]
          }
        ]
      };
      
      const result = validateGraph(graph);
      expect(result.valid).toBe(false);
      const configError = result.errors.find(e => e.code === 'INVALID_WEIGHTEDCHOICE_CONFIG');
      expect(configError).toBeDefined();
    });

    it('should validate Variable nodes', () => {
      const graph = {
        nodes: [
          {
            id: 'output1',
            type: 'Output',
            inputs: ['var1']
          },
          {
            id: 'var1',
            type: 'GetVariable'
            // Missing key property
          }
        ]
      };
      
      const result = validateGraph(graph);
      expect(result.valid).toBe(false);
      const configError = result.errors.find(e => e.code === 'INVALID_VARIABLE_CONFIG');
      expect(configError).toBeDefined();
    });
  });

  describe('Multi-error handling', () => {
    it('should return multiple errors for invalid variable node', () => {
      const graph = {
        nodes: [
          {
            id: 'var1',
            type: 'GetVariable',
            inputs: ['doesNotExist']
            // Missing key property
          }
        ]
      };
      
      const result = validateGraph(graph);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3); // At least 3 errors: missing reference, no output, missing key property
    });
    
    it('should return multiple errors when there are multiple issues', () => {
      // Graph with multiple issues: missing output, cycle, invalid refs
      const result = validateGraph({
        nodes: [
          // Cycle between node1 and node2
          { id: 'node1', type: 'Concat', inputs: ['node2'] },
          { id: 'node2', type: 'Concat', inputs: ['node1'] },
          // Reference to non-existent node3
          { id: 'node4', type: 'Concat', inputs: ['node3'] },
        ]
      });

      expect(result.valid).toBe(false);
      // Should have at least 3 errors: cycle, missing ref, no output
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
      
      // Check for specific error codes
      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain('CYCLE_DETECTED');
      expect(errorCodes).toContain('MISSING_NODE_REFERENCE');
      expect(errorCodes).toContain('NO_OUTPUT_NODES');
    });
  });
  
  describe('Edge cases', () => {
    it('should handle null or undefined graphs gracefully', () => {
      // @ts-ignore - intentionally passing invalid type for testing
      const result = validateGraph(null);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_STRUCTURE');
      
      // @ts-ignore - intentionally passing invalid type for testing
      const result2 = validateGraph(undefined);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0].code).toBe('INVALID_STRUCTURE');
    });
    
    it('should handle malformed graph objects', () => {
      // @ts-ignore - intentionally passing invalid type for testing
      const result = validateGraph({ notNodes: [] });
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_STRUCTURE');
    });
  });
  
  describe('Additional node type validation', () => {
    it('should reject invalid Include nodes', () => {
      // Test missing templateId in Include node
      const invalidResult = validateGraph({
        nodes: [
          // @ts-ignore - intentionally missing required field
          { id: 'include1', type: 'Include', inputs: [] },
          { id: 'output1', type: 'Output', inputs: ['include1'] }
        ]
      });
      expect(invalidResult.valid).toBe(false);
      // Don't test for a specific error code as it could change
      expect(invalidResult.errors.some(e => e.nodeId === 'include1')).toBe(true);
    });
    
    it('should validate GetVariable and SetVariable nodes', () => {
      // Valid graph with variable operations
      const result = validateGraph({
        nodes: [
          { id: 'set1', type: 'SetVariable', key: 'testVar', inputs: [] },
          { id: 'get1', type: 'GetVariable', key: 'testVar' },
          { id: 'output1', type: 'Output', inputs: ['get1'] }
        ]
      });
      expect(result.valid).toBe(true);
      
      // Invalid - missing key in GetVariable
      const invalidResult = validateGraph({
        nodes: [
          { id: 'set1', type: 'SetVariable', key: 'testVar', inputs: [] },
          // @ts-ignore - intentionally missing required field
          { id: 'get1', type: 'GetVariable' },
          { id: 'output1', type: 'Output', inputs: ['get1'] }
        ]
      });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors[0].code).toBe('INVALID_VARIABLE_CONFIG');
      expect(invalidResult.errors[0].nodeId).toBe('get1');
    });
  });
});

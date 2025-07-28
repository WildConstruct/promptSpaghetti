/**
 * Node Validation Framework Tests
 * Epic 18 - Add Node Validation Testing
 */
import { NodeValidationFramework, NodeValidationUtils, SecurityThreat } from '../NodeValidationFramework';
import { AdvancedNodeData } from '../../runtime/advanced';
describe('NodeValidationFramework', () => {
  let validator: NodeValidationFramework;
  beforeEach(() => {
    validator = new NodeValidationFramework();
  });
  describe('Basic Node Validation', () => {
    it('should validate a valid simple node', () => {
      const nodeData: AdvancedNodeData = {
        id: 'test-node-1',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: true,
          stateful: false,
        },
        data: {,
          choices: ['Option A', 'Option B', 'Option C'],
          weights: [1, 2, 1]
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.security.passed).toBe(true);
      expect(result.performance.passed).toBe(true);
      expect(result.typeSafety.passed).toBe(true);
      expect(result.schema.passed).toBe(true);
    });
    it('should reject node with missing required fields', () => {
      const nodeData: unknown = {
        // Missing id, type, config
        data: {}
      };
      const result = validator.validateNode(nodeData);
      expect(result.valid).toBe(false);
      expect(result.schema.passed).toBe(false);
      expect(result.schema.schemaErrors.length).toBeGreaterThan(0);
    });
    it('should reject node with invalid config structure', () => {
      const nodeData: AdvancedNodeData = {
        id: 'test-node-1',
        type: 'WeightedChoice',
        config: {,
          deterministic: 'invalid' as any,
          cacheable: true,
          stateful: false,
        },
        data: {}
      };
      const result = validator.validateNode(nodeData);
      expect(result.valid).toBe(false);
      expect(result.schema.passed).toBe(false);
    });
  });
  describe('Security Validation', () => {
    it('should detect eval usage security threat', () => {
      const nodeData: AdvancedNodeData = {
        id: 'dangerous-node',
        type: 'Conditional',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: false,
        },
        data: {,
          condition: 'eval("malicious code")',
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.valid).toBe(false);
      expect(result.security.passed).toBe(false);
      expect(result.security.threats).toHaveLength(1);
      expect(result.security.threats[0].type).toBe('eval');
      expect(result.security.threats[0].severity).toBe('critical');
      expect(result.security.riskLevel).toBe('critical');
    });
    it('should detect Function constructor threat', () => {
      const nodeData: AdvancedNodeData = {
        id: 'dangerous-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: false,
        },
        data: {,
          choices: ['new Function("return alert(1)")()'],
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.security.passed).toBe(false);
      expect(result.security.threats.some(t => t.type === 'eval')).toBe(true);
    });
    it('should detect prototype pollution threat', () => {
      const nodeData: AdvancedNodeData = {
        id: 'dangerous-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: false,
        },
        data: {,
          choices: ['__proto__.isAdmin = true'],
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.security.passed).toBe(false);
      expect(result.security.threats.some(t => t.type === 'prototype_pollution')).toBe(true);
    });
    it('should detect template injection threat', () => {
      const nodeData: AdvancedNodeData = {
        id: 'dangerous-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: false,
        },
        data: {,
          template: 'Hello ${user.input}'}
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.security.threats.some(t => t.type === 'injection')).toBe(true);
    });
    it('should validate Python transform security', () => {
      const nodeData: AdvancedNodeData = {
        id: 'python-node',
        type: 'PythonTransform',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: false,
        },
        data: {,
          code: 'exec("import os; os.system(\'rm -rf /\')")'
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.security.passed).toBe(false);
      expect(result.security.threats.some(t => t.type === 'injection')).toBe(true);
      expect(result.security.riskLevel).toBe('high');
    });
    it('should allow safe code in Python transform', () => {
      const nodeData: AdvancedNodeData = {
        id: 'safe-python-node',
        type: 'PythonTransform',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: false,
        },
        data: {,
          code: 'result = input.upper()',
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.security.passed).toBe(true);
      expect(result.security.threats).toHaveLength(0);
    });
  });
  describe('Performance Validation', () => {
    it('should detect potential infinite loop in Sequential node', () => {
      const nodeData: AdvancedNodeData = {
        id: 'infinite-node',
        type: 'Sequential',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: true,
        },
        data: {,
          pattern: 'cyclical',
          items: [] // Empty items array causes infinite loop,
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.performance.passed).toBe(false);
      expect(result.performance.issues.some(issue => issue.type === 'infinite_loop')).toBe(true);
      expect(result.performance.issues[0].severity).toBe('high');
    });
    it('should detect Markov node with no exit conditions', () => {
      const nodeData: AdvancedNodeData = {
        id: 'stuck-markov',
        type: 'Markov',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: true,
        },
        data: {,
          transitionMatrix: {,
            'state1': {}, // No transitions - will get stuck
            'state2': { 'state1': 0.5, 'state2': 0.5 }
          }
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.performance.passed).toBe(false);
      expect(result.performance.issues.some(issue => issue.type === 'infinite_loop')).toBe(true);
    });
    it('should estimate memory usage correctly', () => {
      const nodeData: AdvancedNodeData = {
        id: 'large-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: true,
          stateful: false,
        },
        data: {,
          choices: new Array(1000).fill('Large choice option with lots of text'),
          weights: new Array(1000).fill(1),
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.performance.estimatedMemoryUsage).toBeGreaterThan(0);
      expect(result.performance.estimatedExecutionTime).toBeGreaterThan(0);
    });
    it('should flag excessive memory usage', () => {
      // Create validator with low memory limit
      const strictValidator = new NodeValidationFramework({)
        maxMemoryUsage: 1000 // 1KB limit,
      });
      const nodeData: AdvancedNodeData = {
        id: 'memory-heavy-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: true,
          stateful: false,
        },
        data: {,
          choices: new Array(1000).fill('Very large choice with lots of data'),
          weights: new Array(1000).fill(1),
        }
      };
      const result = strictValidator.validateNode(nodeData);
      expect(result.performance.passed).toBe(false);
      expect(result.performance.issues.some(issue => issue.type === 'memory')).toBe(true);
    });
  });
  describe('Type Safety Validation', () => {
    it('should validate basic type safety', () => {
      const nodeData: AdvancedNodeData = {
        id: 'typed-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: true,
          stateful: false,
        },
        data: {,
          choices: ['A', 'B', 'C'], // Correct string array
          weights: [1, 2, 3] // Correct number array
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.typeSafety.passed).toBe(true);
      expect(result.typeSafety.compatibility).toBe('full');
    });
  });
  describe('Configuration Options', () => {
    it('should respect disabled security validation', () => {
      const permissiveValidator = new NodeValidationFramework({)
        securityValidation: false,
      });
      const nodeData: AdvancedNodeData = {
        id: 'dangerous-node',
        type: 'Conditional',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: false,
        },
        data: {,
          condition: 'eval("malicious code")',
        }
      };
      const result = permissiveValidator.validateNode(nodeData);
      // Should pass because security validation is disabled
      expect(result.security.passed).toBe(true);
      expect(result.security.threats).toHaveLength(0);
    });
    it('should respect disabled performance validation', () => {
      const performancelessValidator = new NodeValidationFramework({)
        performanceValidation: false,
      });
      const nodeData: AdvancedNodeData = {
        id: 'infinite-node',
        type: 'Sequential',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: true,
        },
        data: {,
          pattern: 'cyclical',
          items: [],
        }
      };
      const result = performancelessValidator.validateNode(nodeData);
      expect(result.performance.passed).toBe(true);
      expect(result.performance.issues).toHaveLength(0);
    });
  });
  describe('Complex Nested Validation', () => {
    it('should scan nested objects for security threats', () => {
      const nodeData: AdvancedNodeData = {
        id: 'nested-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: false,
        },
        data: {,
          choices: ['Safe choice'],
          metadata: {,
            description: 'eval("nested threat")',
            tags: ['safe', '__proto__.danger = true']
          }
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.security.passed).toBe(false);
      expect(result.security.threats.length).toBeGreaterThanOrEqual(2);
      expect(result.security.threats.some(t => t.type === 'eval')).toBe(true);
      expect(result.security.threats.some(t => t.type === 'prototype_pollution')).toBe(true);
    });
    it('should handle arrays in nested validation', () => {
      const nodeData: AdvancedNodeData = {
        id: 'array-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: false,
        },
        data: {,
          choices: [,
            'Safe choice',
            'eval("danger in array")',
            'Another safe choice'
          ]
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.security.passed).toBe(false);
      expect(result.security.threats.some(t => t.location.includes('[1]'))).toBe(true);
    });
  });
});
describe('NodeValidationUtils', () => {
  describe('validateUserInput', () => {
    it('should detect threats in user input', () => {
      const threats = NodeValidationUtils.validateUserInput('eval("alert(1)")');
      expect(threats).toHaveLength(1);
      expect(threats[0].type).toBe('eval');
      expect(threats[0].severity).toBe('critical');
    });
    it('should return empty array for safe input', () => {
      const threats = NodeValidationUtils.validateUserInput('Hello, world!');
      expect(threats).toHaveLength(0);
    });
  });
  describe('estimateNodePerformance', () => {
    it('should estimate performance metrics', () => {
      const nodeData: AdvancedNodeData = {
        id: 'test-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: true,
          stateful: false,
        },
        data: {,
          choices: ['A', 'B', 'C'],
          weights: [1, 2, 3]
        }
      };
      const estimate = NodeValidationUtils.estimateNodePerformance(nodeData);
      expect(estimate.memory).toBeGreaterThan(0);
      expect(estimate.time).toBeGreaterThan(0);
    });
  });
  describe('validateNodeBatch', () => {
    it('should validate multiple nodes', () => {
      const nodes: AdvancedNodeData[] = [
        {
          id: 'node1',
          type: 'WeightedChoice',
          config: { deterministic: true, cacheable: true, stateful: false },
          data: { choices: ['A'], weights: [1] }
        },
        {
          id: 'node2',
          type: 'Conditional',
          config: { deterministic: true, cacheable: false, stateful: false },
          data: { condition: 'eval("dangerous")' }
        }
      ];
      const results = NodeValidationUtils.validateNodeBatch(nodes);
      expect(results).toHaveLength(2);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(false);
      expect(results[1].security.passed).toBe(false);
    });
    it('should handle empty array', () => {
      const results = NodeValidationUtils.validateNodeBatch([]);
      expect(results).toHaveLength(0);
    });
  });
});
describe('Security Threat Detection Patterns', () => {
  let validator: NodeValidationFramework;
  beforeEach(() => {
    validator = new NodeValidationFramework();
  });
  const dangerousPatterns = [;
    { pattern: 'eval("code")', expectedType: 'eval', description: 'eval usage' },
    { pattern: 'new Function("code")', expectedType: 'eval', description: 'Function constructor' },
    { pattern: '__proto__.prop = value', expectedType: 'prototype_pollution', description: 'prototype pollution' },
    { pattern: '${user.input}', expectedType: 'injection', description: 'template injection' },}
    { pattern: 'setTimeout("code", 100)', expectedType: 'unsafe_function', description: 'dangerous function' }
  ];
  dangerousPatterns.forEach(({ pattern, expectedType, description }) => {
    it(`should detect ${description}`, () => {}
      const nodeData: AdvancedNodeData = {
        id: 'test-node',
        type: 'WeightedChoice',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: false,
        },
        data: {,
          choices: [pattern],
        }
      };
      const result = validator.validateNode(nodeData);
      expect(result.security.passed).toBe(false);
      expect(result.security.threats.some(t => t.type === expectedType)).toBe(true);
    });
  });
});
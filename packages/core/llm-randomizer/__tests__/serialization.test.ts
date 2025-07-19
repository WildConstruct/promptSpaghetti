// Epic 12 - LLM Agent Randomizer System
// Story 12.1 - Serialization Format Design
// Comprehensive test cases for format validation and serialization

import { GraphSerializer, SerializationMetadata } from '../serialization/serializer.js';
import { FormatValidator, validateFormat, isValidFormat } from '../serialization/validator.js';
import { Graph, Node } from '../../graphSchema.js';

describe('Epic 12 - LLM Serialization Format', () => {
  describe('GraphSerializer', () => {
    describe('Basic Serialization', () => {
      test('should serialize simple weighted choice graph', () => {
        const graph: Graph = {
          nodes: [
            {
              id: 'choice1',
              type: 'WeightedChoice',
              choices: [
                { value: 'Hello', weight: 0.6 },
                { value: 'Hi', weight: 0.4 }
              ]
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['choice1']
            }
          ]
        };

        const result = GraphSerializer.serialize(graph);
        
        expect(result).toContain('version: 1.0.0');
        expect(result).toContain('---NODES---');
        expect(result).toContain('choice1:');
        expect(result).toContain('type: WeightedChoice');
        expect(result).toContain('---EDGES---');
        expect(result).toContain('choice1 -> output1');
        expect(result).toContain('---END---');
      });

      test('should include metadata when provided', () => {
        const graph: Graph = {
          nodes: [
            { id: 'test', type: 'Output' }
          ]
        };

        const metadata: SerializationMetadata = {
          name: 'Test Graph',
          description: 'A test graph',
          author: 'test-agent',
          created: '2025-07-17T12:00:00Z'
        };

        const result = GraphSerializer.serialize(graph, metadata);
        
        expect(result).toContain('name: "Test Graph"');
        expect(result).toContain('description: "A test graph"');
        expect(result).toContain('author: "test-agent"');
        expect(result).toContain('created: 2025-07-17T12:00:00Z');
      });

      test('should include checksum by default', () => {
        const graph: Graph = {
          nodes: [{ id: 'test', type: 'Output' }]
        };

        const result = GraphSerializer.serialize(graph);
        expect(result).toMatch(/checksum: [a-f0-9]{16}/);
      });

      test('should support compact format', () => {
        const graph: Graph = {
          nodes: [
            {
              id: 'test',
              type: 'WeightedChoice',
              choices: [{ value: 'test', weight: 1 }]
            }
          ]
        };

        const result = GraphSerializer.serialize(graph, undefined, { compactFormat: true });
        
        // Should have no extra indentation
        expect(result).toContain('type: WeightedChoice');
        expect(result).not.toContain('  type: WeightedChoice');
      });
    });

    describe('Advanced Node Serialization', () => {
      test('should serialize WeightedAdvanced node', () => {
        const graph: Graph = {
          nodes: [
            {
              id: 'advanced1',
              type: 'WeightedAdvanced',
              choices: [{ value: 'Option A', weight: 2.5 }],
              distributionConfig: {
                type: 'exponential',
                parameters: { decay: 0.5 },
                normalize: true
              }
            }
          ]
        };

        const result = GraphSerializer.serialize(graph);
        
        expect(result).toContain('type: WeightedAdvanced');
        expect(result).toContain('choices:');
        expect(result).toContain('distribution:');
        expect(result).toContain('type: "exponential"');
      });

      test('should serialize Conditional node', () => {
        const graph: Graph = {
          nodes: [
            {
              id: 'conditional1',
              type: 'Conditional',
              branches: [
                {
                  condition: 'variable == "test"',
                  output: 'Match',
                  label: 'test_check'
                }
              ],
              defaultOutput: 'No match',
              conditionalConfig: {
                allowVariableAccess: true,
                strictMode: false
              }
            }
          ]
        };

        const result = GraphSerializer.serialize(graph);
        
        expect(result).toContain('type: Conditional');
        expect(result).toContain('branches:');
        expect(result).toContain('default: "No match"');
        expect(result).toContain('config:');
      });

      test('should serialize Sequential node', () => {
        const graph: Graph = {
          nodes: [
            {
              id: 'seq1',
              type: 'Sequential',
              sequence: ['First', 'Second', 'Third'],
              pattern: {
                type: 'cyclical',
                config: {
                  allowRepeats: false
                }
              }
            }
          ]
        };

        const result = GraphSerializer.serialize(graph);
        
        expect(result).toContain('type: Sequential');
        expect(result).toContain('sequence: ["First", "Second", "Third"]');
        expect(result).toContain('pattern:');
      });

      test('should serialize Markov node', () => {
        const graph: Graph = {
          nodes: [
            {
              id: 'markov1',
              type: 'Markov',
              states: {
                start: {
                  transitions: { middle: 0.7, end: 0.3 }
                },
                middle: {
                  transitions: { end: 1.0 }
                },
                end: {}
              },
              initialState: 'start'
            } as any // Type assertion for test
          ]
        };

        const result = GraphSerializer.serialize(graph);
        
        expect(result).toContain('type: Markov');
        expect(result).toContain('states:');
        expect(result).toContain('initial: "start"');
      });

      test('should serialize PythonTransform node', () => {
        const graph: Graph = {
          nodes: [
            {
              id: 'python1',
              type: 'PythonTransform',
              code: 'def transform(input_data):\n    return input_data.upper()',
              timeout: 30,
              memoryLimit: '512MB',
              allowedModules: ['re', 'json']
            } as any // Type assertion for test
          ]
        };

        const result = GraphSerializer.serialize(graph);
        
        expect(result).toContain('type: PythonTransform');
        expect(result).toContain('code: |');
        expect(result).toContain('timeout: 30');
      });
    });

    describe('Error Handling', () => {
      test('should throw on empty graph', () => {
        const graph: Graph = { nodes: [] };
        
        expect(() => {
          GraphSerializer.serialize(graph);
        }).toThrow('Graph must contain at least one node');
      });

      test('should throw on duplicate node IDs', () => {
        const graph: Graph = {
          nodes: [
            { id: 'duplicate', type: 'Output' },
            { id: 'duplicate', type: 'Concat' }
          ]
        };
        
        expect(() => {
          GraphSerializer.serialize(graph);
        }).toThrow('Graph contains duplicate node IDs');
      });

      test('should throw on invalid node references', () => {
        const graph: Graph = {
          nodes: [
            {
              id: 'node1',
              type: 'Concat',
              inputs: ['nonexistent']
            }
          ]
        };
        
        expect(() => {
          GraphSerializer.serialize(graph);
        }).toThrow('references non-existent input');
      });

      test('should detect cycles', () => {
        const graph: Graph = {
          nodes: [
            { id: 'node1', type: 'Concat', inputs: ['node2'] },
            { id: 'node2', type: 'Concat', inputs: ['node1'] }
          ]
        };
        
        expect(() => {
          GraphSerializer.serialize(graph);
        }).toThrow('Cycle detected');
      });
    });
  });

  describe('FormatValidator', () => {
    describe('Valid Format Validation', () => {
      test('should validate minimal valid format', () => {
        const content = `version: 1.0.0

---NODES---
test_node:
  type: Output

---END---`;

        const result = validateFormat(content);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      test('should validate complex graph', () => {
        const content = `version: 1.0.0
checksum: abc123
metadata:
  name: "Test Graph"
  author: "claude"

---NODES---
choice1:
  type: WeightedChoice
  props:
    choices:
      - value: "Hello"
        weight: 0.6
      - value: "Hi"
        weight: 0.4

concat1:
  type: Concat
  inputs: ["choice1", "name_var"]

name_var:
  type: GetVariable
  props:
    key: "user_name"

output1:
  type: Output
  inputs: ["concat1"]

---EDGES---
choice1 -> concat1
name_var -> concat1
concat1 -> output1

---END---`;

        const result = validateFormat(content);
        expect(result.isValid).toBe(true);
        expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
      });
    });

    describe('Error Detection', () => {
      test('should detect missing version', () => {
        const content = `---NODES---
test:
  type: Output
---END---`;

        const result = validateFormat(content);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.message.includes('Missing required version'))).toBe(true);
      });

      test('should detect unsupported version', () => {
        const content = `version: 2.0.0
---NODES---
test:
  type: Output
---END---`;

        const result = validateFormat(content);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.message.includes('Unsupported version'))).toBe(true);
      });

      test('should detect invalid node type', () => {
        const content = `version: 1.0.0
---NODES---
test:
  type: InvalidType
---END---`;

        const result = validateFormat(content);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.message.includes('invalid type'))).toBe(true);
      });

      test('should detect missing required properties', () => {
        const content = `version: 1.0.0
---NODES---
choice1:
  type: WeightedChoice
---END---`;

        const result = validateFormat(content);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.message.includes('missing required choices'))).toBe(true);
      });

      test('should detect cycles', () => {
        const content = `version: 1.0.0
---NODES---
node1:
  type: Concat
  inputs: ["node2"]
node2:
  type: Concat
  inputs: ["node1"]
---END---`;

        const result = validateFormat(content);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.message.includes('Cycle detected'))).toBe(true);
      });

      test('should detect invalid node references', () => {
        const content = `version: 1.0.0
---NODES---
node1:
  type: Concat
  inputs: ["nonexistent"]
---END---`;

        const result = validateFormat(content);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.message.includes('non-existent input'))).toBe(true);
      });

      test('should detect duplicate node IDs', () => {
        const content = `version: 1.0.0
---NODES---
duplicate:
  type: Output
duplicate:
  type: Concat
---END---`;

        const result = validateFormat(content);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.message.includes('Duplicate node ID'))).toBe(true);
      });
    });

    describe('Warning Generation', () => {
      test('should warn about isolated nodes', () => {
        const content = `version: 1.0.0
---NODES---
connected:
  type: Output
  inputs: ["source"]
source:
  type: WeightedChoice
  props:
    choices:
      - value: "test"
        weight: 1
isolated:
  type: Concat
---END---`;

        const result = validateFormat(content);
        expect(result.warnings.some(w => w.message.includes('isolated'))).toBe(true);
      });

      test('should warn about missing output nodes', () => {
        const content = `version: 1.0.0
---NODES---
node1:
  type: Concat
---END---`;

        const result = validateFormat(content);
        expect(result.warnings.some(w => w.message.includes('no Output nodes'))).toBe(true);
      });

      test('should warn about unreachable nodes', () => {
        const content = `version: 1.0.0
---NODES---
root:
  type: WeightedChoice
  props:
    choices:
      - value: "test"
        weight: 1
connected:
  type: Output
  inputs: ["root"]
unreachable:
  type: Concat
  inputs: ["also_unreachable"]
also_unreachable:
  type: GetVariable
  props:
    key: "test"
---END---`;

        const result = validateFormat(content);
        expect(result.warnings.some(w => w.message.includes('unreachable'))).toBe(true);
      });
    });

    describe('Utility Functions', () => {
      test('isValidFormat should return boolean', () => {
        const validContent = `version: 1.0.0
---NODES---
test:
  type: Output
---END---`;

        const invalidContent = `invalid format`;

        expect(isValidFormat(validContent)).toBe(true);
        expect(isValidFormat(invalidContent)).toBe(false);
      });
    });
  });

  describe('Round-trip Conversion', () => {
    test('should serialize and validate complex graph', () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'greeting_choice',
            type: 'WeightedChoice',
            choices: [
              { value: 'Hello', weight: 0.4 },
              { value: 'Hi', weight: 0.3 },
              { value: 'Greetings', weight: 0.3 }
            ]
          },
          {
            id: 'name_var',
            type: 'GetVariable',
            key: 'user_name'
          },
          {
            id: 'greeting_concat',
            type: 'Concat',
            inputs: ['greeting_choice', 'name_var']
          },
          {
            id: 'final_output',
            type: 'Output',
            inputs: ['greeting_concat']
          }
        ]
      };

      const metadata: SerializationMetadata = {
        name: 'Greeting Generator',
        description: 'Generates personalized greetings',
        author: 'claude-agent'
      };

      const serialized = GraphSerializer.serialize(graph, metadata);
      const validation = validateFormat(serialized);

      expect(validation.isValid).toBe(true);
      expect(validation.errors.filter(e => e.severity === 'error')).toHaveLength(0);
      expect(serialized).toContain('name: "Greeting Generator"');
    });
  });
});
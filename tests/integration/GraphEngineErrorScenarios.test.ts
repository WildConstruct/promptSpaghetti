/**
 * Graph Engine Error Scenarios Tests
 * Tests error conditions specific to graph execution and processing
 */

import { jest } from '@jest/globals';
import { GraphEngine } from '../../packages/graph-core/src/engine';
import { Graph } from '../../packages/core/graphSchema';
import { executeGraph } from '../../server/src/engine';
import { TestEnvironmentManager, PerformanceTestingUtils } from '../utils/TestingUtilities';

describe('Graph Engine Error Scenarios', () => {
  let testEnv: any;
  let engine: GraphEngine;

  beforeEach(async () => {
    testEnv = await TestEnvironmentManager.createEnvironment('graph-engine-errors', {
      seed: 'engine-error-test',
      timeout: 10000
    });
    engine = new GraphEngine();
  });

  afterEach(async () => {
    await TestEnvironmentManager.cleanupAll();
  });

  describe('Execution Error Scenarios', () => {
    describe('Node Processing Errors', () => {
      it('should handle WeightedChoice node with invalid weights', async () => {
        const invalidWeightGraph: Graph = {
          nodes: [
            {
              id: 'choice1',
              type: 'WeightedChoice',
              inputs: [],
              data: {
                choices: [
                  { value: 'Option A', weight: -1 }, // Negative weight
                  { value: 'Option B', weight: 'invalid' as any }, // Non-numeric weight
                  { value: 'Option C', weight: Infinity } // Infinite weight
                ]
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['choice1'],
              data: { template: '{{choice1}}' }
            }
          ]
        };

        await expect(engine.execute(invalidWeightGraph, 'test-seed'))
          .rejects.toThrow(/invalid.*weight/i);
      });

      it('should handle WeightedChoice node with zero total weight', async () => {
        const zeroWeightGraph: Graph = {
          nodes: [
            {
              id: 'choice1',
              type: 'WeightedChoice',
              inputs: [],
              data: {
                choices: [
                  { value: 'Option A', weight: 0 },
                  { value: 'Option B', weight: 0 },
                  { value: 'Option C', weight: 0 }
                ]
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['choice1'],
              data: { template: '{{choice1}}' }
            }
          ]
        };

        await expect(engine.execute(zeroWeightGraph, 'test-seed'))
          .rejects.toThrow(/zero.*weight/i);
      });

      it('should handle Output node with malformed templates', async () => {
        const malformedTemplateGraph: Graph = {
          nodes: [
            {
              id: 'choice1',
              type: 'WeightedChoice',
              inputs: [],
              data: {
                choices: [{ value: 'Test Value', weight: 1 }]
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['choice1'],
              data: { 
                template: '{{unclosed_bracket' // Missing closing bracket
              }
            }
          ]
        };

        await expect(engine.execute(malformedTemplateGraph, 'test-seed'))
          .rejects.toThrow(/template.*syntax/i);
      });

      it('should handle Variable nodes with type mismatches', async () => {
        const typeMismatchGraph: Graph = {
          nodes: [
            {
              id: 'set-var',
              type: 'SetVariable',
              inputs: [],
              data: { 
                name: 'testVar',
                value: 42 // Number
              }
            },
            {
              id: 'get-var',
              type: 'GetVariable',
              inputs: ['set-var'],
              data: { 
                name: 'testVar',
                expectedType: 'string' // Expecting string but getting number
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['get-var'],
              data: { template: '{{get-var}}' }
            }
          ]
        };

        // Should handle gracefully with type coercion or error
        const result = await engine.execute(typeMismatchGraph, 'test-seed');
        
        // Either succeeds with coercion or throws type error
        if (!result.success) {
          expect(result.error?.message).toMatch(/type.*mismatch/i);
        }
      });
    });

    describe('Advanced Node Error Scenarios', () => {
      it('should handle Conditional node with invalid expressions', async () => {
        const invalidExpressionGraph: Graph = {
          nodes: [
            {
              id: 'conditional1',
              type: 'Conditional',
              inputs: [],
              data: {
                condition: 'invalid javascript syntax !!!', // Invalid JS
                trueValue: 'True branch',
                falseValue: 'False branch'
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['conditional1'],
              data: { template: '{{conditional1}}' }
            }
          ]
        };

        await expect(engine.execute(invalidExpressionGraph, 'test-seed'))
          .rejects.toThrow(/expression.*error/i);
      });

      it('should handle Sequential node with invalid pattern configuration', async () => {
        const invalidSequentialGraph: Graph = {
          nodes: [
            {
              id: 'sequential1',
              type: 'Sequential',
              inputs: [],
              data: {
                items: ['A', 'B', 'C'],
                pattern: 'invalid-pattern' as any, // Invalid pattern type
                currentIndex: 0
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['sequential1'],
              data: { template: '{{sequential1}}' }
            }
          ]
        };

        await expect(engine.execute(invalidSequentialGraph, 'test-seed'))
          .rejects.toThrow(/invalid.*pattern/i);
      });

      it('should handle Markov node with invalid transition matrix', async () => {
        const invalidMarkovGraph: Graph = {
          nodes: [
            {
              id: 'markov1',
              type: 'Markov',
              inputs: [],
              data: {
                states: ['A', 'B', 'C'],
                transitionMatrix: [
                  [0.5, 0.3], // Row doesn't sum to 1 and wrong length
                  [0.2, 0.8, 0.1], // Row sums > 1
                  [0.4, 0.6, 0.2] // Row sums > 1
                ],
                currentState: 'A'
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['markov1'],
              data: { template: '{{markov1}}' }
            }
          ]
        };

        await expect(engine.execute(invalidMarkovGraph, 'test-seed'))
          .rejects.toThrow(/transition.*matrix/i);
      });

      it('should handle WeightedAdvanced node with invalid distribution', async () => {
        const invalidDistributionGraph: Graph = {
          nodes: [
            {
              id: 'weighted-adv1',
              type: 'WeightedAdvanced',
              inputs: [],
              data: {
                choices: [
                  { value: 'A', weight: 1 },
                  { value: 'B', weight: 1 }
                ],
                distribution: 'invalid-distribution' as any, // Invalid distribution type
                parameters: {}
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['weighted-adv1'],
              data: { template: '{{weighted-adv1}}' }
            }
          ]
        };

        await expect(engine.execute(invalidDistributionGraph, 'test-seed'))
          .rejects.toThrow(/distribution.*type/i);
      });
    });
  });

  describe('Graph Validation Error Scenarios', () => {
    describe('Structural Validation Errors', () => {
      it('should detect and handle self-referencing nodes', async () => {
        const selfRefGraph: Graph = {
          nodes: [
            {
              id: 'node1',
              type: 'Output',
              inputs: ['node1'], // Self-reference
              data: { template: '{{node1}}' }
            }
          ]
        };

        await expect(engine.execute(selfRefGraph, 'test-seed'))
          .rejects.toThrow(/self.*reference|circular/i);
      });

      it('should detect complex circular dependencies', async () => {
        const circularGraph: Graph = {
          nodes: [
            {
              id: 'nodeA',
              type: 'WeightedChoice',
              inputs: ['nodeC'], // Depends on C
              data: { choices: [{ value: 'A', weight: 1 }] }
            },
            {
              id: 'nodeB',
              type: 'WeightedChoice',
              inputs: ['nodeA'], // Depends on A
              data: { choices: [{ value: 'B', weight: 1 }] }
            },
            {
              id: 'nodeC',
              type: 'Output',
              inputs: ['nodeB'], // Depends on B, creating A->C->B->A cycle
              data: { template: '{{nodeB}}' }
            }
          ]
        };

        await expect(engine.execute(circularGraph, 'test-seed'))
          .rejects.toThrow(/circular.*dependency/i);
      });

      it('should handle orphaned nodes', async () => {
        const orphanedGraph: Graph = {
          nodes: [
            {
              id: 'connected1',
              type: 'WeightedChoice',
              inputs: [],
              data: { choices: [{ value: 'Connected', weight: 1 }] }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['connected1'],
              data: { template: '{{connected1}}' }
            },
            {
              id: 'orphan1',
              type: 'WeightedChoice',
              inputs: [],
              data: { choices: [{ value: 'Orphaned', weight: 1 }] }
            }
          ]
        };

        // Should execute successfully but warn about orphaned nodes
        const result = await engine.execute(orphanedGraph, 'test-seed');
        expect(result.warnings).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/orphan.*node/i)
          ])
        );
      });

      it('should handle disconnected graph components', async () => {
        const disconnectedGraph: Graph = {
          nodes: [
            // Component 1
            {
              id: 'comp1-choice',
              type: 'WeightedChoice',
              inputs: [],
              data: { choices: [{ value: 'Component 1', weight: 1 }] }
            },
            {
              id: 'comp1-output',
              type: 'Output',
              inputs: ['comp1-choice'],
              data: { template: '{{comp1-choice}}' }
            },
            // Component 2 (disconnected)
            {
              id: 'comp2-choice',
              type: 'WeightedChoice',
              inputs: [],
              data: { choices: [{ value: 'Component 2', weight: 1 }] }
            },
            {
              id: 'comp2-output',
              type: 'Output',
              inputs: ['comp2-choice'],
              data: { template: '{{comp2-choice}}' }
            }
          ]
        };

        // Should execute but only return outputs from reachable components
        const result = await engine.execute(disconnectedGraph, 'test-seed');
        
        if (result.success) {
          expect(result.warnings).toEqual(
            expect.arrayContaining([
              expect.stringMatching(/disconnected.*component/i)
            ])
          );
        } else {
          expect(result.error?.message).toMatch(/disconnected.*graph/i);
        }
      });
    });

    describe('Data Integrity Errors', () => {
      it('should handle node data corruption during execution', async () => {
        const corruptingGraph: Graph = {
          nodes: [
            {
              id: 'normal-node',
              type: 'WeightedChoice',
              inputs: [],
              data: { choices: [{ value: 'Normal', weight: 1 }] }
            },
            {
              id: 'corrupting-node',
              type: 'WeightedChoice',
              inputs: ['normal-node'],
              data: null as any // Corrupted data
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['corrupting-node'],
              data: { template: '{{corrupting-node}}' }
            }
          ]
        };

        await expect(engine.execute(corruptingGraph, 'test-seed'))
          .rejects.toThrow(/null.*data|corrupted/i);
      });

      it('should handle variable scope violations', async () => {
        const scopeViolationGraph: Graph = {
          nodes: [
            {
              id: 'get-undefined-var',
              type: 'GetVariable',
              inputs: [],
              data: { 
                name: 'undefinedVariable' // Variable never set
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['get-undefined-var'],
              data: { template: '{{get-undefined-var}}' }
            }
          ]
        };

        await expect(engine.execute(scopeViolationGraph, 'test-seed'))
          .rejects.toThrow(/undefined.*variable/i);
      });
    });
  });

  describe('Performance and Resource Error Scenarios', () => {
    describe('Memory and CPU Limits', () => {
      it('should handle execution timeout', async () => {
        // Create a graph that would run indefinitely
        const infiniteLoopGraph: Graph = {
          nodes: [
            {
              id: 'loop-node',
              type: 'WeightedChoice',
              inputs: [],
              data: {
                choices: Array(1000000).fill().map((_, i) => ({ 
                  value: `Option ${i}`, 
                  weight: 1 
                }))
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['loop-node'],
              data: { template: '{{loop-node}}' }
            }
          ]
        };

        // Measure execution time and enforce timeout
        const measurement = await PerformanceTestingUtils.measureExecution(
          async () => {
            try {
              const result = await Promise.race([
                engine.execute(infiniteLoopGraph, 'test-seed'),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Execution timeout')), 5000)
                )
              ]);
              return result;
            } catch (error) {
              throw error;
            }
          }
        );

        // Should either complete quickly or timeout
        if (measurement.executionTime > 5000) {
          throw new Error('Execution took too long - possible infinite loop');
        }
      });

      it('should handle excessive recursion in node dependencies', async () => {
        // Create a graph with deep dependency chain
        const deepDependencyGraph: Graph = {
          nodes: []
        };

        // Create chain: node0 -> node1 -> node2 -> ... -> node999
        for (let i = 0; i < 1000; i++) {
          deepDependencyGraph.nodes.push({
            id: `node${i}`,
            type: 'WeightedChoice',
            inputs: i > 0 ? [`node${i-1}`] : [],
            data: { choices: [{ value: `Value ${i}`, weight: 1 }] }
          });
        }

        deepDependencyGraph.nodes.push({
          id: 'final-output',
          type: 'Output',
          inputs: ['node999'],
          data: { template: '{{node999}}' }
        });

        await expect(engine.execute(deepDependencyGraph, 'test-seed'))
          .rejects.toThrow(/stack.*overflow|recursion.*limit/i);
      });
    });

    describe('Concurrency Error Scenarios', () => {
      it('should handle concurrent execution attempts on same graph', async () => {
        const sharedGraph: Graph = {
          nodes: [
            {
              id: 'shared-node',
              type: 'WeightedChoice',
              inputs: [],
              data: { choices: [{ value: 'Shared Value', weight: 1 }] }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['shared-node'],
              data: { template: '{{shared-node}}' }
            }
          ]
        };

        // Execute same graph concurrently with different seeds
        const promises = [
          engine.execute(sharedGraph, 'seed1'),
          engine.execute(sharedGraph, 'seed2'),
          engine.execute(sharedGraph, 'seed3'),
          engine.execute(sharedGraph, 'seed4'),
          engine.execute(sharedGraph, 'seed5')
        ];

        const results = await Promise.allSettled(promises);
        
        // All executions should complete without interfering with each other
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            fail(`Concurrent execution ${index} failed: ${result.reason}`);
          } else {
            expect(result.value.success).toBe(true);
          }
        });
      });

      it('should handle state modification during execution', async () => {
        const statefulGraph: Graph = {
          nodes: [
            {
              id: 'sequential-node',
              type: 'Sequential',
              inputs: [],
              data: {
                items: ['A', 'B', 'C', 'D', 'E'],
                pattern: 'linear',
                currentIndex: 0
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['sequential-node'],
              data: { template: '{{sequential-node}}' }
            }
          ]
        };

        // Start execution
        const execution1 = engine.execute(statefulGraph, 'seed1');
        
        // Modify graph state during execution (simulate concurrent modification)
        setTimeout(() => {
          if (statefulGraph.nodes[0].data) {
            (statefulGraph.nodes[0].data as any).currentIndex = 999;
          }
        }, 50);

        const result = await execution1;
        
        // Execution should either succeed with original state or detect state change
        if (!result.success) {
          expect(result.error?.message).toMatch(/state.*modified|concurrent.*access/i);
        }
      });
    });
  });

  describe('Edge Case Error Scenarios', () => {
    describe('Boundary Condition Errors', () => {
      it('should handle empty graph', async () => {
        const emptyGraph: Graph = {
          nodes: []
        };

        const result = await engine.execute(emptyGraph, 'test-seed');
        
        if (result.success) {
          expect(result.outputs).toEqual([]);
        } else {
          expect(result.error?.message).toMatch(/empty.*graph/i);
        }
      });

      it('should handle graph with no output nodes', async () => {
        const noOutputGraph: Graph = {
          nodes: [
            {
              id: 'choice1',
              type: 'WeightedChoice',
              inputs: [],
              data: { choices: [{ value: 'No Output', weight: 1 }] }
            },
            {
              id: 'set-var',
              type: 'SetVariable',
              inputs: ['choice1'],
              data: { name: 'testVar', value: '{{choice1}}' }
            }
          ]
        };

        const result = await engine.execute(noOutputGraph, 'test-seed');
        
        if (result.success) {
          expect(result.outputs).toEqual([]);
          expect(result.warnings).toEqual(
            expect.arrayContaining([
              expect.stringMatching(/no.*output.*node/i)
            ])
          );
        } else {
          expect(result.error?.message).toMatch(/no.*output/i);
        }
      });

      it('should handle extremely large seed values', async () => {
        const simpleGraph: Graph = {
          nodes: [
            {
              id: 'choice1',
              type: 'WeightedChoice',
              inputs: [],
              data: { choices: [{ value: 'Test', weight: 1 }] }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['choice1'],
              data: { template: '{{choice1}}' }
            }
          ]
        };

        const extremeSeeds = [
          Number.MAX_SAFE_INTEGER.toString(),
          Number.MAX_VALUE.toString(),
          'extremely-long-seed-' + 'x'.repeat(1000000)
        ];

        for (const seed of extremeSeeds) {
          try {
            const result = await engine.execute(simpleGraph, seed);
            expect(result.success).toBe(true);
          } catch (error) {
            // Should handle gracefully
            expect(error.message).toMatch(/seed.*too.*large|invalid.*seed/i);
          }
        }
      });
    });

    describe('Type System Edge Cases', () => {
      it('should handle mixed data types in WeightedChoice', async () => {
        const mixedTypeGraph: Graph = {
          nodes: [
            {
              id: 'mixed-choice',
              type: 'WeightedChoice',
              inputs: [],
              data: {
                choices: [
                  { value: 'string', weight: 1 },
                  { value: 42, weight: 1 },
                  { value: true, weight: 1 },
                  { value: null, weight: 1 },
                  { value: { obj: 'value' }, weight: 1 },
                  { value: [1, 2, 3], weight: 1 }
                ]
              }
            },
            {
              id: 'output1',
              type: 'Output',
              inputs: ['mixed-choice'],
              data: { template: '{{mixed-choice}}' }
            }
          ]
        };

        // Should handle mixed types or throw type error
        try {
          const result = await engine.execute(mixedTypeGraph, 'test-seed');
          expect(result.success).toBe(true);
          expect(typeof result.outputs[0]).toBeDefined();
        } catch (error) {
          expect(error.message).toMatch(/type.*mismatch|mixed.*types/i);
        }
      });
    });
  });
});
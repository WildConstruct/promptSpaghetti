// server/src/__tests__/api-advanced.test.ts
// Integration tests for Epic 7 advanced nodes via API

import { generatePreviewOutputs } from '../index';
import { Graph } from '../../../../packages/core/graphSchema';

describe('API Advanced Node Integration', () => {
  describe('WeightedAdvanced via Preview API', () => {
    test('should generate preview outputs for WeightedAdvanced nodes', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'weighted-advanced-1',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'Epic', weight: 3 },
              { value: 'Legendary', weight: 2 },
              { value: 'Mythic', weight: 1 }
            ],
            distributionConfig: {
              type: 'exponential',
              parameters: { factor: 1.5 },
              normalize: true
            }
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['weighted-advanced-1']
          }
        ],
        seed: 1000
      };

      const results = await generatePreviewOutputs(graph, 5, 1);

      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result.seed).toBe(1 + index);
        expect(['Epic', 'Legendary', 'Mythic']).toContain(result.output);
      });
    });

    test('should handle multiple WeightedAdvanced nodes in preview', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'rarity',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'Common', weight: 50 },
              { value: 'Rare', weight: 10 },
              { value: 'Epic', weight: 1 }
            ],
            distributionConfig: {
              type: 'linear'
            }
          },
          {
            id: 'type',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'Sword', weight: 3 },
              { value: 'Shield', weight: 2 },
              { value: 'Bow', weight: 1 }
            ],
            distributionConfig: {
              type: 'gaussian',
              parameters: { mean: 0.5, std: 0.3 }
            }
          },
          {
            id: 'loot-name',
            type: 'Concat',
            inputs: ['rarity', 'type']
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['loot-name']
          }
        ],
        seed: 2000
      };

      const results = await generatePreviewOutputs(graph, 3, 10);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.seed).toBe(10 + index);
        // Should be concatenation of rarity + type
        expect(result.output).toMatch(/^(Common|Rare|Epic)(Sword|Shield|Bow)$/);
      });
    });

    test('should work with mixed basic and advanced nodes', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'basic-choice',
            type: 'WeightedChoice',
            choices: [
              { value: 'Fire', weight: 1 },
              { value: 'Ice', weight: 1 },
              { value: 'Lightning', weight: 1 }
            ]
          },
          {
            id: 'advanced-choice',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'Spell', weight: 5 },
              { value: 'Enchantment', weight: 3 },
              { value: 'Curse', weight: 1 }
            ],
            distributionConfig: {
              type: 'exponential',
              parameters: { factor: 2 }
            }
          },
          {
            id: 'magic-combo',
            type: 'Concat',
            inputs: ['basic-choice', 'advanced-choice']
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['magic-combo']
          }
        ],
        seed: 3000
      };

      const results = await generatePreviewOutputs(graph, 4, 20);

      expect(results).toHaveLength(4);
      results.forEach((result, index) => {
        expect(result.seed).toBe(20 + index);
        expect(result.output).toMatch(/^(Fire|Ice|Lightning)(Spell|Enchantment|Curse)$/);
      });
    });

    test('should handle linear distribution', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'test-linear',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'A', weight: 3 },
              { value: 'B', weight: 2 },
              { value: 'C', weight: 1 }
            ],
            distributionConfig: {
              type: 'linear',
              normalize: true
            }
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['test-linear']
          }
        ],
        seed: 4000
      };

      const results = await generatePreviewOutputs(graph, 10, 1);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(['A', 'B', 'C']).toContain(result.output);
      });
    });

    test('should handle exponential distribution', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'test-exponential',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'A', weight: 3 },
              { value: 'B', weight: 2 },
              { value: 'C', weight: 1 }
            ],
            distributionConfig: {
              type: 'exponential',
              parameters: { factor: 1.2 },
              normalize: true
            }
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['test-exponential']
          }
        ],
        seed: 4001
      };

      const results = await generatePreviewOutputs(graph, 10, 1);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(['A', 'B', 'C']).toContain(result.output);
      });
    });

    test('should maintain deterministic behavior across API calls', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'deterministic-test',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'Alpha', weight: 2 },
              { value: 'Beta', weight: 2 },
              { value: 'Gamma', weight: 2 }
            ],
            distributionConfig: {
              type: 'linear'
            }
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['deterministic-test']
          }
        ],
        seed: 5000
      };

      // Run the same graph multiple times
      const results1 = await generatePreviewOutputs(graph, 5, 100);
      const results2 = await generatePreviewOutputs(graph, 5, 100);

      expect(results1).toEqual(results2);
    });

    test('should handle empty or default WeightedAdvanced configuration', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'empty-weighted',
            type: 'WeightedAdvanced'
            // No choices or distributionConfig
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['empty-weighted']
          }
        ],
        seed: 6000
      };

      const results = await generatePreviewOutputs(graph, 2, 1);

      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result.output).toBe(''); // Empty choices should return empty string
      });
    });
  });

  describe('Performance with Advanced Nodes', () => {
    test('should handle large graphs with multiple advanced nodes efficiently', async () => {
      // Create a graph with multiple advanced nodes
      const nodes = [];
      
      // Add 5 WeightedAdvanced nodes
      for (let i = 0; i < 5; i++) {
        nodes.push({
          id: `weighted-${i}`,
          type: 'WeightedAdvanced' as const,
          choices: [
            { value: `Choice${i}A`, weight: 3 },
            { value: `Choice${i}B`, weight: 2 },
            { value: `Choice${i}C`, weight: 1 }
          ],
          distributionConfig: {
            type: 'exponential' as const,
            parameters: { factor: 1.1 + (i * 0.1) }
          }
        });
      }

      // Add output that uses first weighted node
      nodes.push({
        id: 'output-1',
        type: 'Output' as const,
        inputs: ['weighted-0']
      });

      const graph: Graph = {
        nodes,
        seed: 7000
      };

      const startTime = performance.now();
      const results = await generatePreviewOutputs(graph, 10, 1);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(executionTime).toBeLessThan(200); // Should complete in <200ms
      
      results.forEach(result => {
        expect(result.output).toMatch(/^Choice0[ABC]$/);
      });
    });
  });
});
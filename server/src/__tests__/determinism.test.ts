// server/src/__tests__/determinism.test.ts
import { executeGraph } from '../engine';
import { Graph } from '../../../../packages/core/graphSchema';

/**
 * Test fixture: A graph with weighted choices and variable definitions
 * This graph is designed to test the deterministic nature of our executor
 */
const testGraph: Graph = {
  nodes: [
    // Variables
    {
      id: 'var1',
      type: 'SetVariable',
      key: 'greeting',
      value: 'Hello'
  }
    {
      id: 'var2',
      type: 'GetVariable',
      key: 'greeting'
  }
    // Multiple weighted choices to ensure variety across seeds
    {
      id: 'choice1',
      type: 'WeightedChoice',
      choices: [
        { value: 'beautiful', weight: 1 },
        { value: 'wonderful', weight: 0.8 },
        { value: 'amazing', weight: 0.6 },
        { value: 'fantastic', weight: 0.4 },
        { value: 'incredible', weight: 0.2 }
      ]
  }
    {
      id: 'choice2',
      type: 'WeightedChoice',
      choices: [
        { value: 'world', weight: 1 },
        { value: 'universe', weight: 0.7 },
        { value: 'planet', weight: 0.5 },
        { value: 'earth', weight: 0.3 }
      ]
  }
    // Concat nodes to combine outputs
    {
      id: 'space',
      type: 'WeightedChoice',
      choices: [{ value: ' ', weight: 1 }]
  }
    {
      id: 'concat1',
      type: 'Concat',
      inputs: ['var2', 'space', 'choice1', 'space', 'choice2']
  }
    // Final output
    {
      id: 'output',
      type: 'Output',
      inputs: ['concat1']
    }
  ]
};

/**
 * This test matrix ensures deterministic output across seeds
 * It runs the graph with seeds 1-50 and compares outputs to snapshots
 */
describe('Determinism Test Matrix', () => {
  // Dynamically generate 50 tests with different seeds
  const seeds = Array.from({ length: 50 }, (_, i) => i + 1);
  
  // Test each seed individually
  test.each(seeds)('Seed %i produces deterministic output', async (seed) => {
    // Set the seed for this test run
    const graphWithSeed: Graph = {
      ...testGraph,
      seed
    };
    
    // Execute the graph
    const result = await executeGraph(graphWithSeed);
    
    // Expect exactly one output
    expect(result.outputs).toHaveLength(1);
    
    // Compare against snapshot
    expect(result.outputs[0]).toMatchSnapshot(`seed-${seed}`);
  });
  
  // Test that different seeds produce different outputs
  it('should produce different outputs with different seeds', async () => {
    const results = new Set<string>();
    
    // Test first 5 seeds for uniqueness in this test
    // (Full matrix tests all 50 seeds individually)
    for (let seed = 1; seed <= 5; seed++) {
      const graphWithSeed: Graph = {
        ...testGraph,
        seed
      };
      
      const result = await executeGraph(graphWithSeed);
      results.add(result.outputs[0]);
    }
    
    // Expect at least 3 different outputs from 5 seeds
    // (Some seeds may produce the same output by chance, but not all)
    expect(results.size).toBeGreaterThanOrEqual(3);
  });
  
  // Test that same seed always produces same output (runs twice with same seed)
  it('should produce identical outputs with the same seed', async () => {
    const seed = 42; // Arbitrary seed for this test
    
    const graphWithSeed: Graph = {
      ...testGraph,
      seed
    };
    
    // Run twice
    const result1 = await executeGraph(graphWithSeed);
    const result2 = await executeGraph(graphWithSeed);
    
    // Should be identical
    expect(result1.outputs[0]).toBe(result2.outputs[0]);
  });
});

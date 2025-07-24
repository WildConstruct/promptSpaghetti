// server/src/__tests__/markov-engine.test.ts
// Test Markov node integration with the engine

import { executeGraph } from '../engine';
import type { Graph } from '../../../../packages/core/graphSchema';

describe('Markov Node Engine Integration', () => {
  test('should execute Markov node with simple toggle', async () => {
    const graph: Graph = {
      nodes: [
        {
          id: 'markov1',
          type: 'Markov',
          states: ['on', 'off'],
          transitions: {
            on: { off: 1.0 },
            off: { on: 1.0 }
          },
          initialState: 'on',
          inputs: []
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['markov1']
        }
      ],
      seed: 12345
    };

    const results = await executeGraph(graph);
    expect(results.outputs).toEqual(['on']); // First execution returns initial state
  });

  test('should execute Markov node with probabilistic transitions', async () => {
    const graph: Graph = {
      nodes: [
        {
          id: 'markov1',
          type: 'Markov',
          states: ['A', 'B', 'C'],
          transitions: {
            A: { B: 0.6, C: 0.4 },
            B: { A: 0.3, C: 0.7 },
            C: { A: 0.5, B: 0.5 }
          },
          initialState: 'A',
          markovConfig: {
            maxTransitions: 10,
            detectLoops: false
          },
          inputs: []
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['markov1']
        }
      ],
      seed: 12345
    };

    const results = await executeGraph(graph);
    expect(results.outputs).toHaveLength(1);
    expect(['A', 'B', 'C']).toContain(results.outputs[0]);
  });

  test('should handle Markov node with termination conditions', async () => {
    const graph: Graph = {
      nodes: [
        {
          id: 'markov1',
          type: 'Markov',
          states: ['running', 'stopped'],
          transitions: {
            running: { running: 0.8, stopped: 0.2 },
            stopped: { stopped: 1.0 }
          },
          initialState: 'running',
          markovConfig: {
            terminationStates: ['stopped'],
            maxTransitions: 5
          },
          inputs: []
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['markov1']
        }
      ],
      seed: 12345
    };

    const results = await executeGraph(graph);
    expect(results.outputs).toEqual(['running']);
  });

  test('should handle Markov node with default configuration', async () => {
    const graph: Graph = {
      nodes: [
        {
          id: 'markov1',
          type: 'Markov',
          inputs: []
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['markov1']
        }
      ],
      seed: 12345
    };

    const results = await executeGraph(graph);
    expect(results.outputs).toEqual(['default']); // Empty states get default configuration
  });

  test('should execute multiple Markov nodes independently', async () => {
    const graph: Graph = {
      nodes: [
        {
          id: 'markov1',
          type: 'Markov',
          states: ['first1', 'first2'],
          transitions: {
            first1: { first2: 1.0 },
            first2: { first1: 1.0 }
          },
          initialState: 'first1',
          inputs: []
        },
        {
          id: 'markov2',
          type: 'Markov',
          states: ['second1', 'second2'],
          transitions: {
            second1: { second2: 1.0 },
            second2: { second1: 1.0 }
          },
          initialState: 'second1',
          inputs: []
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['markov1']
        },
        {
          id: 'output2',
          type: 'Output',
          inputs: ['markov2']
        }
      ],
      seed: 12345
    };

    const results = await executeGraph(graph);
    expect(results.outputs).toEqual(['first1', 'second1']);
  });

  test('should handle complex Markov chain with absorbing states', async () => {
    const graph: Graph = {
      nodes: [
        {
          id: 'markov1',
          type: 'Markov',
          states: ['start', 'process', 'success', 'failure'],
          transitions: {
            start: { process: 1.0 },
            process: { success: 0.7, failure: 0.2, process: 0.1 },
            success: { success: 1.0 }, // Absorbing
            failure: { failure: 1.0 }  // Absorbing
          },
          initialState: 'start',
          markovConfig: {
            terminationStates: ['success', 'failure'],
            maxTransitions: 20
          },
          inputs: []
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['markov1']
        }
      ],
      seed: 12345
    };

    const results = await executeGraph(graph);
    expect(results.outputs).toEqual(['start']);
  });

  test('should produce deterministic results with same seed', async () => {
    const createGraph = (): Graph => ({
      nodes: [
        {
          id: 'markov1',
          type: 'Markov',
          states: ['random1', 'random2', 'random3'],
          transitions: {
            random1: { random2: 0.4, random3: 0.6 },
            random2: { random1: 0.3, random3: 0.7 },
            random3: { random1: 0.8, random2: 0.2 }
          },
          initialState: 'random1',
          inputs: []
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['markov1']
        }
      ],
      seed: 98765
    });

    const results1 = await executeGraph(createGraph());
    const results2 = await executeGraph(createGraph());
    
    expect(results1.outputs).toEqual(results2.outputs);
  });

  test('should handle Markov node in complex graph', async () => {
    const graph: Graph = {
      nodes: [
        {
          id: 'choice1',
          type: 'WeightedChoice',
          choices: [
            { value: 'path1', weight: 1 },
            { value: 'path2', weight: 1 }
          ],
          inputs: []
        },
        {
          id: 'markov1',
          type: 'Markov',
          states: ['step1', 'step2', 'final'],
          transitions: {
            step1: { step2: 0.8, final: 0.2 },
            step2: { final: 1.0 },
            final: { final: 1.0 }
          },
          initialState: 'step1',
          inputs: []
        },
        {
          id: 'concat1',
          type: 'Concat',
          inputs: ['choice1', 'markov1']
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['concat1']
        }
      ],
      seed: 12345
    };

    const results = await executeGraph(graph);
    expect(results.outputs).toHaveLength(1);
    expect(results.outputs[0]).toMatch(/^(path1|path2)step1$/);
  });
});
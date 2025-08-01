// server/src/__tests__/sequential-engine.test.ts
// Test Sequential node integration with the engine

import { executeGraph } from '../engine';
import type { Graph } from '../../../../packages/core/graphSchema';

describe('Sequential Node Engine Integration', () => {
  test('should execute Sequential node with linear pattern', async () => {
    const graph: Graph = {
      nodes: [
        {
          id: 'seq1',
          type: 'Sequential',
          sequence: ['first', 'second', 'third'],
          pattern: {
            type: 'linear',
            config: {}

          inputs: []

        {
          id: 'output1', 
          type: 'Output',
          inputs: ['seq1']

      ],
      seed: 12345
    };

    const results = await executeGraph(graph);
    expect(results.outputs).toEqual(['first']);
  });

  test('should execute Sequential node with cyclical pattern', async () => {
    const graph: Graph = {
      nodes: [
        {
          id: 'seq1',
          type: 'Sequential',
          sequence: ['A', 'B', 'C'],
          pattern: {
            type: 'cyclical',
            config: {}

          inputs: []

        {
          id: 'output1',
          type: 'Output', 
          inputs: ['seq1']

      ],
      seed: 12345
    };

    const results = await executeGraph(graph);
    expect(results.outputs).toEqual(['A']);
  });

  test('should execute Sequential node with weighted pattern', async () => {
    const graph: Graph = {
      nodes: [
        {
          id: 'seq1',
          type: 'Sequential',
          sequence: ['heavy', 'light'],
          pattern: {
            type: 'weighted',
            config: {
              weights: [10, 1]


          inputs: []

        {
          id: 'output1',
          type: 'Output',
          inputs: ['seq1']

      ],
      seed: 12345
    };

    const results = await executeGraph(graph);
    expect(results.outputs).toHaveLength(1);
    expect(['heavy', 'light']).toContain(results.outputs[0]);
  });

  test('should handle Sequential node with default configuration', async () => {
    const graph: Graph = {
      nodes: [
        {
          id: 'seq1',
          type: 'Sequential',
          inputs: []

        {
          id: 'output1',
          type: 'Output',
          inputs: ['seq1']

      ],
      seed: 12345
    };

    const results = await executeGraph(graph);
    expect(results.outputs).toEqual(['']); // Empty sequence returns empty string
  });

  test('should execute multiple Sequential nodes independently', async () => {
    const graph: Graph = {
      nodes: [
        {
          id: 'seq1',
          type: 'Sequential',
          sequence: ['first1', 'first2'],
          pattern: { type: 'linear', config: {} },
          inputs: []

        {
          id: 'seq2', 
          type: 'Sequential',
          sequence: ['second1', 'second2'],
          pattern: { type: 'linear', config: {} },
          inputs: []

        {
          id: 'output1',
          type: 'Output',
          inputs: ['seq1']

        {
          id: 'output2',
          type: 'Output', 
          inputs: ['seq2']

      ],
      seed: 12345
    };

    const results = await executeGraph(graph);
    expect(results.outputs).toEqual(['first1', 'second1']);
  });
});
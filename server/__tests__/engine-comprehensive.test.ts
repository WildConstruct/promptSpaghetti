import { executeGraph, initializeAnalytics } from '../src/engine-basic';
import type { Graph, Node } from '../../packages/core/graphSchema';

const asGraph = (nodes: Node[], seed = 1234): Graph => ({
  nodes,
  seed
});

describe('engine-basic comprehensive behavior', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.restoreAllMocks();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('initializes analytics without throwing', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    expect(() => initializeAnalytics()).not.toThrow();
    expect(logSpy).toHaveBeenCalledWith('Analytics initialized (basic mode)');
  });

  it('returns deterministic output for identical seed', async () => {
    const graph = asGraph([
      {
        id: 'w1',
        type: 'WeightedChoice',
        choices: [
          { value: 'Alpha', weight: 1 },
          { value: 'Beta', weight: 1 }
        ]
      } as Node,
      { id: 'o1', type: 'Output', inputs: ['w1'] } as Node
    ]);

    const first = await executeGraph(graph);
    const second = await executeGraph(graph);

    expect(first.outputs).toEqual(second.outputs);
    expect(first.outputs).toHaveLength(1);
  });

  it('supports SetVariable -> GetVariable flow', async () => {
    const graph = asGraph([
      {
        id: 'set1',
        type: 'SetVariable',
        key: 'tone',
        value: 'cinematic'
      } as Node,
      {
        id: 'get1',
        type: 'GetVariable',
        key: 'tone',
        inputs: ['set1']
      } as Node,
      { id: 'out1', type: 'Output', inputs: ['get1'] } as Node
    ]);

    const result = await executeGraph(graph);
    expect(result.outputs).toEqual(['cinematic']);
  });

  it('concatenates input node outputs', async () => {
    const graph = asGraph([
      {
        id: 'w1',
        type: 'WeightedChoice',
        choices: [{ value: 'Hello', weight: 1 }]
      } as Node,
      {
        id: 'w2',
        type: 'WeightedChoice',
        choices: [{ value: 'World', weight: 1 }]
      } as Node,
      { id: 'c1', type: 'Concat', inputs: ['w1', 'w2'] } as Node,
      { id: 'out1', type: 'Output', inputs: ['c1'] } as Node
    ]);

    const result = await executeGraph(graph);
    expect(result.outputs).toEqual(['HelloWorld']);
  });

  it('returns include node name for Include nodes', async () => {
    const graph = asGraph([
      { id: 'i1', type: 'Include', name: 'preset:hero' } as Node,
      { id: 'out1', type: 'Output', inputs: ['i1'] } as Node
    ]);

    const result = await executeGraph(graph);
    expect(result.outputs).toEqual(['preset:hero']);
  });

  it('handles unsupported node types as empty string', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const graph = asGraph([
      { id: 'x1', type: 'Markov' } as unknown as Node,
      { id: 'out1', type: 'Output', inputs: ['x1'] } as Node
    ]);

    const result = await executeGraph(graph);
    expect(result.outputs).toEqual(['']);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns fallback message when graph has no output nodes', async () => {
    const graph = asGraph([
      {
        id: 'w1',
        type: 'WeightedChoice',
        choices: [{ value: 'OnlyChoice', weight: 1 }]
      } as Node
    ]);

    const result = await executeGraph(graph);
    expect(result.outputs).toEqual(['Graph has no output nodes']);
  });

  it('captures missing upstream node errors in output payload', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const graph = asGraph([
      { id: 'out1', type: 'Output', inputs: ['missing-node'] } as Node
    ]);

    const result = await executeGraph(graph);
    expect(result.outputs[0]).toContain('Error: Node missing-node not found');
    expect(errorSpy).toHaveBeenCalled();
  });
});

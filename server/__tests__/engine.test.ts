// server/__tests__/engine.test.ts
import { executeGraph } from '../src/engine';
import { Graph } from '../../packages/core/graphSchema';

describe('executeGraph deterministic behaviour', () => {
  const buildGraph = (seed: number): Graph =>
    ({
      seed,
      nodes: [
        {
          id: 'wc1',
          type: 'WeightedChoice',
          choices: [
            { value: 'Alpha', weight: 1 },
            { value: 'Beta', weight: 1 },
          ],
          inputs: [],
        },
        {
          id: 'out1',
          type: 'Output',
          inputs: ['wc1'],
        },
      ],
    }) as any;

  it('returns identical output for identical seed', async () => {
    const g = buildGraph(1234);
    const first = await executeGraph(g);
    const second = await executeGraph(g);
    expect(second).toEqual(first);
  });

  it('completes execution under 500ms for small graph', async () => {
    const g = buildGraph(42);
    const start = Date.now();
    await executeGraph(g);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(500);
  });
});

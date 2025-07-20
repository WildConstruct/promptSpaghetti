import { executeGraph } from '../../../../server/src/engine';
import { Graph } from '../../graphSchema';

const sampleGraph: Graph = {
  seed: 42,
  nodes: [
    {
      id: 'wc1',
      type: 'WeightedChoice',
      choices: [
        { value: 'A', weight: 1 },
        { value: 'B', weight: 1 }
      ]
    },
    {
      id: 'out1',
      type: 'Output',
      inputs: ['wc1']
    }
  ]
};

describe('executeGraph determinism', () => {
  it('returns identical output for same seed', async () => {
    const out1 = await executeGraph(sampleGraph);
    const out2 = await executeGraph(sampleGraph);
    expect(out1).toEqual(out2);
  });

  it('returns different output for different seed (probabilistic)', async () => {
    const g1 = { ...sampleGraph, seed: 1 };
    const g2 = { ...sampleGraph, seed: 999 };
    const out1 = await executeGraph(g1);
    const out2 = await executeGraph(g2);
    // They might still match by chance, but with small choice set probability is low; run multiple times
    // Instead verify RNG respect: at least one of ten runs differs
    let differs = false;
    for (let i = 0; i < 10; i++) {
      g1.seed = i;
      g2.seed = i + 1000;
      if ((await executeGraph(g1))[0] !== (await executeGraph(g2))[0]) {
        differs = true;
        break;
      }
    }
    expect(differs).toBeTruthy();
  });
});

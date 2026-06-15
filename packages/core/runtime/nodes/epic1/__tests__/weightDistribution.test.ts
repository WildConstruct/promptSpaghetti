import { applyWeightDistribution } from '../weightDistribution';
import { WeightedChoiceNode } from '../WeightedChoiceNode';
import { nodeDataToRuntimeNode } from '../../../../components/epic1/nodes/nodeFactory';
import type { WeightedOption } from '../../../../types/epic1';

const opts = (...weights: number[]): WeightedOption[] =>
  weights.map((weight, i) => ({ id: `o${i}`, text: `t${i}`, weight }));

describe('applyWeightDistribution (pure helper)', () => {
  test('absent / linear is the identity (same reference)', () => {
    const o = opts(1, 2, 3);
    expect(applyWeightDistribution(o)).toBe(o);
    expect(applyWeightDistribution(o, { type: 'linear' })).toBe(o);
  });

  test('exponential factor 2 squares weights', () => {
    const r = applyWeightDistribution(opts(1, 2, 3), {
      type: 'exponential',
      parameters: { factor: 2 }
    });
    expect(r.map(o => o.weight)).toEqual([1, 4, 9]);
  });

  test('exponential factor < 1 flattens toward uniform', () => {
    const r = applyWeightDistribution(opts(1, 4), {
      type: 'exponential',
      parameters: { factor: 0.5 }
    });
    expect(r.map(o => o.weight)).toEqual([1, 2]);
  });

  test('gaussian boosts the middle option and suppresses the ends', () => {
    const r = applyWeightDistribution(opts(1, 1, 1), { type: 'gaussian' });
    expect(r[1].weight).toBeGreaterThan(r[0].weight);
    expect(r[1].weight).toBeGreaterThan(r[2].weight);
  });

  test('minWeight floors transformed weights', () => {
    const r = applyWeightDistribution(opts(1, 2), {
      type: 'exponential',
      parameters: { factor: 3 },
      minWeight: 5
    });
    expect(r.every(o => o.weight >= 5)).toBe(true);
  });

  test('preserves id / text / order', () => {
    const r = applyWeightDistribution(opts(1, 2, 3), { type: 'exponential' });
    expect(r.map(o => o.id)).toEqual(['o0', 'o1', 'o2']);
    expect(r.map(o => o.text)).toEqual(['t0', 't1', 't2']);
  });
});

describe('WeightedChoiceNode distribution integration', () => {
  const buildOptions = (): WeightedOption[] => [
    { id: 'a', text: 'A', weight: 1 },
    { id: 'b', text: 'B', weight: 9 }
  ];

  const counts = async (node: WeightedChoiceNode, draws: number) => {
    const out: Record<string, number> = {};
    for (let i = 0; i < draws; i++) {
      const r = await node.run({ seed: `seed-${i}` } as never);
      out[r] = (out[r] || 0) + 1;
    }
    return out;
  };

  test('linear distribution is byte-identical to no distribution, per seed', async () => {
    const none = new WeightedChoiceNode('w', buildOptions());
    const linear = new WeightedChoiceNode('w', buildOptions(), {
      distribution: { type: 'linear' }
    });
    for (let i = 0; i < 50; i++) {
      const seed = `s${i}`;
      const a = await none.run({ seed } as never);
      const b = await linear.run({ seed } as never);
      expect(a).toBe(b);
    }
  });

  test('exponential concentrates selection on the heavier option', async () => {
    const linear = new WeightedChoiceNode('w', buildOptions());
    const exponential = new WeightedChoiceNode('w', buildOptions(), {
      distribution: { type: 'exponential', parameters: { factor: 2 } }
    });
    const cl = await counts(linear, 300);
    const ce = await counts(exponential, 300);
    // 1:9 -> 1:81 under factor 2, so the heavy option should win at least as often.
    expect(ce['B'] || 0).toBeGreaterThanOrEqual(cl['B'] || 0);
  });
});

describe('live nodeFactory wiring (ReactFlow data -> engine node)', () => {
  const flowNode = (data: Record<string, unknown>) =>
    ({ id: 'w', type: 'weightedChoice', position: { x: 0, y: 0 }, data } as never);
  const options = [
    { id: 'a', text: 'A', weight: 1 },
    { id: 'b', text: 'B', weight: 9 }
  ];

  test('threads node.data.distribution into the runtime node', () => {
    const node = nodeDataToRuntimeNode(
      flowNode({ options, distribution: { type: 'exponential', parameters: { factor: 2 } } })
    ) as WeightedChoiceNode;
    expect(node).toBeTruthy();
    expect(node.getDistribution()).toEqual({
      type: 'exponential',
      parameters: { factor: 2 }
    });
  });

  test('leaves distribution undefined when absent (backward compatible)', () => {
    const node = nodeDataToRuntimeNode(flowNode({ options })) as WeightedChoiceNode;
    expect(node.getDistribution()).toBeUndefined();
  });
});

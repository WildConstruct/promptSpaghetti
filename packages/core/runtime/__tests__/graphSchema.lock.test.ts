/**
 * Schema-lock guard: the canonical graph schema must accept exactly the executable
 * node vocabulary and reject the retired advanced/Python tier. Keeps the schema
 * from silently re-diverging from what the engine can actually run.
 */
import { GraphSchema, NodeTypeEnum } from '../../graphSchema';

const RETIRED = [
  'WeightedAdvanced',
  'Conditional',
  'Sequential',
  'Markov',
  'PythonTransform'
];

describe('graph schema lock', () => {
  it('enumerates exactly the executable node types', () => {
    expect([...NodeTypeEnum.options].sort()).toEqual(
      ['Concat', 'GetVariable', 'Include', 'Output', 'SetVariable', 'WeightedChoice'].sort()
    );
  });

  it('accepts a graph of core node types', () => {
    const result = GraphSchema.safeParse({
      nodes: [
        { id: 'w', type: 'WeightedChoice', choices: [{ value: 'a', weight: 1 }] },
        { id: 'c', type: 'Concat', inputs: ['w'] },
        { id: 'o', type: 'Output', inputs: ['c'] }
      ],
      seed: 1
    });
    expect(result.success).toBe(true);
  });

  it.each(RETIRED)('rejects retired node type %s', type => {
    const result = GraphSchema.safeParse({ nodes: [{ id: 'x', type }] });
    expect(result.success).toBe(false);
  });
});

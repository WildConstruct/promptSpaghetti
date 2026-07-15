/**
 * Schema-lock guard for graphSchema.ts NodeTypeEnum.
 *
 * This locks the *current* GraphSchema surface (including Include / Set / Get).
 * It is NOT the Epic1 executable set (TextBlock | WeightedChoice | Concat |
 * Variable | Output). See docs/schema-epic1-vocabulary-inventory.md.
 *
 * Also rejects the retired advanced/Python tier so it cannot re-enter GraphSchema
 * without an intentional test change.
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
  it('enumerates the current GraphSchema node types (not Epic1 executable set)', () => {
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

import { WeightedChoiceNode, type WeightedOption } from '../../runtime/nodes/epic1/WeightedChoiceNode';
import type { ExecutionContext } from '../../runtime/types';

const baseContext: ExecutionContext = {
  seed: 'test-seed',
  variables: {}
};

describe('WeightedChoiceNode', () => {
  it('returns deterministic results for a given seed', async () => {
    const options: WeightedOption[] = [
      { id: 'a', text: 'Alpha', weight: 1 },
      { id: 'b', text: 'Beta', weight: 3 },
      { id: 'c', text: 'Gamma', weight: 6 }
    ];

    const nodeA = new WeightedChoiceNode('choice-1', options);
    const nodeB = new WeightedChoiceNode('choice-1', options);

    const result1 = await nodeA.run(baseContext);
    const result2 = await nodeB.run(baseContext);

    expect(result1).toBe(result2);
    expect(['Alpha', 'Beta', 'Gamma']).toContain(result1);
  });

  it('falls back gracefully when all weights are zero', async () => {
    const options: WeightedOption[] = [
      { id: 'a', text: 'Alpha', weight: 0 },
      { id: 'b', text: 'Beta', weight: 0 }
    ];
    const node = new WeightedChoiceNode('zero-case', options);

    // Should choose the first option when all weights are zero
    const result = await node.run(baseContext);
    expect(result).toBe('Alpha');
  });

  it('validates option structure and reports errors', async () => {
    const node = new WeightedChoiceNode('validator');
    const invalidOptions = [
      { id: 'dup', text: 'First', weight: 10 },
      { id: 'dup', text: 'Duplicate weight', weight: 5 },
      // Intentionally malformed entry
      null as unknown as WeightedOption
    ];

    const validation = await (node as any).validateValue(invalidOptions);

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        'Duplicate option id: dup',
        expect.stringContaining('Option 3 is invalid')
      ])
    );
  });

  it('enforces minimum option requirement', async () => {
    const node = new WeightedChoiceNode('minimum', [], { minOptions: 2 });
    const validation = await (node as any).validateValue([
      { id: 'only', text: 'Only option', weight: 1 }
    ]);

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('At least 2 options are required');
  });
});


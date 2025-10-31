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

  it('initializes default options when none are provided', async () => {
    const node = new WeightedChoiceNode('empty', []);
    const result = await node.run(baseContext);
    expect(['Option 1', 'Option 2']).toContain(result);
  });

  it('returns the only available option without random selection', async () => {
    const node = new WeightedChoiceNode('single', [
      { id: 'only', text: 'Solo pick', weight: 5 }
    ]);
    const result = await node.run(baseContext);
    expect(result).toBe('Solo pick');
  });

  it('supports adding and removing options with constraints', () => {
    const node = new WeightedChoiceNode('options');
    const newId = node.addOption('Extra', 25);
    expect(node.getCurrentValue().some(opt => opt.id === newId)).toBe(true);

    expect(() => node.addOption('Blocked', 10)).not.toThrow();

    const restrictive = new WeightedChoiceNode(
      'no-add',
      [],
      { allowAddRemove: false }
    );
    expect(() => restrictive.addOption('Nope')).toThrow('Adding options is not allowed');

    const limited = new WeightedChoiceNode(
      'limited',
      [
        { id: 'a', text: 'A', weight: 50 },
        { id: 'b', text: 'B', weight: 50 }
      ],
      { minOptions: 2 }
    );
    expect(() => limited.removeOption('a')).toThrow('Minimum 2 options required');
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

  it('rejects non-array values during validation', async () => {
    const node = new WeightedChoiceNode('type-check');
    const validation = await (node as any).validateValue('not-an-array');
    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual([
      'Value must be an array of options'
    ]);
  });

  it('requires at least one option to have non-zero weight', async () => {
    const node = new WeightedChoiceNode('non-zero-check');
    const validation = await (node as any).validateValue([
      { id: 'a', text: 'Zero', weight: 0 }
    ]);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      'At least one option must have a non-zero weight'
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

  it('updates options while editing and commits changes', async () => {
    const node = new WeightedChoiceNode('editing');
    const data = (node as any).data;

    node.startEdit();
    const original = node.getCurrentValue()[0];
    node.updateOptionText(original.id, 'Updated');
    node.updateOptionWeight(original.id, 75);
    node.updateOptionColor(original.id, '#ff00ff');
    await Promise.resolve();

    const inEdit = node.getCurrentValue()[0];
    expect(inEdit.text).toBe('Updated');
    expect(inEdit.weight).toBe(75);
    expect(inEdit.color).toBe('#ff00ff');
    expect(data.value[0].text).toBe('Option 1');

    await node.commitEdit();
    expect(node.getCurrentValue()[0].text).toBe('Updated');
    expect((node as any).data.value[0].color).toBe('#ff00ff');
  });

  it('adds and removes options while editing', async () => {
    const node = new WeightedChoiceNode('edit-add');
    node.startEdit();

    const addedId = node.addOption('Temp', 10);
    await Promise.resolve();
    expect(node.getCurrentValue().some(opt => opt.id === addedId)).toBe(true);

    node.removeOption(addedId);
    await Promise.resolve();
    expect(node.getCurrentValue().some(opt => opt.id === addedId)).toBe(false);

    await node.commitEdit();
  });

  it('throws when updating weight with negative value', () => {
    const node = new WeightedChoiceNode('negative');
    const first = node.getCurrentValue()[0];
    expect(() => node.updateOptionWeight(first.id, -1)).toThrow(
      'Weight must be non-negative'
    );
  });

  it('calculates weight percentages and normalizes weights', () => {
    const node = new WeightedChoiceNode('percentages', [
      { id: 'a', text: 'A', weight: 0 },
      { id: 'b', text: 'B', weight: 0 }
    ]);

    let percentages = node.getWeightPercentages();
    expect([...percentages.values()]).toEqual([0, 0]);

    node.normalizeWeights();
    expect(node.getCurrentValue().map(opt => opt.weight)).toEqual([50, 50]);

    node.updateOptionWeight('a', 30);
    node.updateOptionWeight('b', 70);
    percentages = node.getWeightPercentages();
    expect(percentages.get('b')).toBeCloseTo(70);

    node.normalizeWeights();
    const normalized = node.getCurrentValue();
    const total = normalized.reduce((sum, opt) => sum + opt.weight, 0);
    expect(total).toBeCloseTo(100);
  });

  it('serializes with metadata and exposes configuration safely', () => {
    const node = new WeightedChoiceNode(
      'serialize',
      [
        { id: 'a', text: 'A', weight: 40 },
        { id: 'b', text: 'B', weight: 60 }
      ],
      { allowAddRemove: false, showPercentages: false }
    );

    const config = node.getWeightedConfig();
    expect(config.allowAddRemove).toBe(false);
    config.allowAddRemove = true;
    expect((node as any).config.allowAddRemove).toBe(false);

    const serialized = node.serialize();
    expect(serialized.metadata.optionCount).toBe(2);
    expect(serialized.metadata.totalWeight).toBe(100);
    expect(serialized.metadata.percentages).toEqual({
      a: 40,
      b: 60
    });
  });

  it('clones option values to avoid accidental mutation', () => {
    const options: WeightedOption[] = [
      { id: 'a', text: 'Alpha', weight: 2 }
    ];
    const node = new WeightedChoiceNode('clone', options);
    const clone = (node as any).cloneValue(options) as WeightedOption[];
    expect(clone).not.toBe(options);
    clone[0].text = 'Changed';
    expect(options[0].text).toBe('Alpha');
  });

  it('reports node type for registry integration', () => {
    const node = new WeightedChoiceNode('type');
    expect(node.getNodeType()).toBe('WeightedChoice');
  });
});

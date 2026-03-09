import {
  mergeGeneratedChoicesIntoOptions,
  normalizeWeightedOptions,
  type WeightedOption
} from '../EnhancedBranchingNode';

describe('EnhancedBranchingNode helpers', () => {
  it('normalizes weights to an exact total of 100', () => {
    const options: WeightedOption[] = [
      { text: 'A', weight: 1 },
      { text: 'B', weight: 1 },
      { text: 'C', weight: 1 }
    ];

    const result = normalizeWeightedOptions(options);
    const total = result.reduce((sum, option) => sum + option.weight, 0);

    expect(total).toBe(100);
  });

  it('fills blank rows using generated weights instead of preserving default blank weights', () => {
    const options: WeightedOption[] = [
      { text: 'Existing', weight: 50, hasBranch: false },
      { text: '', weight: 50, hasBranch: false },
      { text: '', weight: 50, hasBranch: false }
    ];

    const result = mergeGeneratedChoicesIntoOptions(options, [
      { text: 'Fresh one', weight: 8 },
      { text: 'Fresh two', weight: 2 }
    ]);

    expect(result[1]).toMatchObject({ text: 'Fresh one' });
    expect(result[2]).toMatchObject({ text: 'Fresh two' });
    expect(result[1]?.weight).not.toBe(50);
    expect(result[2]?.weight).not.toBe(50);
    expect(result.reduce((sum, option) => sum + option.weight, 0)).toBe(100);
  });

  it('skips generated duplicates against existing and repeated generated choices', () => {
    const options: WeightedOption[] = [
      { text: 'Run', weight: 50, hasBranch: false },
      { text: '', weight: 50, hasBranch: false }
    ];

    const result = mergeGeneratedChoicesIntoOptions(options, [
      { text: 'run', weight: 8 },
      { text: 'Hide', weight: 6 },
      { text: 'hide', weight: 4 }
    ]);

    expect(result.map(option => option.text)).toEqual(['Run', 'Hide']);
  });
});

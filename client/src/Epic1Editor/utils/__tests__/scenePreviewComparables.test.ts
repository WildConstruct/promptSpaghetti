import {
  getSurfaceBiasedComparableLabel,
  getSurfaceBiasedComparablePool
} from '../scenePreviewComparables';

describe('scenePreviewComparables', () => {
  const summary = {
    bootstrapGroupId: 'bootstrap-group-1',
    bootstrapMode: 'prop-variation',
    assetIds: ['prop-1'],
    analysisSources: [],
    preferredComparableRefs: [
      {
        id: 'comp-1',
        label: 'rusted venue chair'
      },
      {
        id: 'comp-2',
        label: 'neon wall sign'
      },
      {
        id: 'comp-3',
        label: 'painted wall mural'
      }
    ],
    forceSynthesisKeys: [],
    lockedTraitKeys: ['world_style'],
    variableTraitKeys: ['damage_pattern'],
    notes: undefined
  };

  it('biases wall comparables toward wall-like families', () => {
    expect(getSurfaceBiasedComparablePool(summary, 'wall')).toEqual([
      'neon wall sign',
      'painted wall mural'
    ]);
    expect(getSurfaceBiasedComparableLabel(summary, 'wall', 0)).toBe(
      'neon wall sign'
    );
  });

  it('biases floor comparables toward floor-like families', () => {
    expect(getSurfaceBiasedComparablePool(summary, 'floor')).toEqual([
      'rusted venue chair',
      'neon wall sign'
    ]);
    expect(getSurfaceBiasedComparableLabel(summary, 'floor', 0)).toBe(
      'rusted venue chair'
    );
  });
});

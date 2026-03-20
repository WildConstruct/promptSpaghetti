import type { Node } from 'reactflow';
import { getImageBootstrapSelectionSummary } from '../imageBootstrapSelection';

describe('getImageBootstrapSelectionSummary', () => {
  it('returns null when no selected bootstrap nodes exist', () => {
    const result = getImageBootstrapSelectionSummary([
      {
        id: 'n1',
        type: 'textBlock',
        position: { x: 0, y: 0 },
        selected: true,
        data: { label: 'Regular node' }
      } as Node
    ]);

    expect(result).toBeNull();
  });

  it('aggregates selected bootstrap metadata from the inserted group', () => {
    const result = getImageBootstrapSelectionSummary([
      {
        id: 'box-1',
        type: 'enhancedBoundingBox',
        position: { x: 0, y: 0 },
        selected: true,
        data: {
          bootstrapInserted: true,
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [
            {
              assetId: 'prop-1',
              fixtureId: 'hero-prop-venue',
              selectionMode: 'heuristic'
            }
          ],
          preferredComparableRefs: [
            {
              id: 'comp-1',
              label: 'similar prop',
              origin: 'comparable',
              score: 0.72,
              sourceRef: 'library-prop-7',
              reasonCodes: ['fixture-comparable']
            }
          ],
          forceSynthesisKeys: ['damage_pattern'],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Prefer the rusted venue prop family'
        }
      } as Node,
      {
        id: 'choice-1',
        type: 'weightedChoice',
        position: { x: 40, y: 80 },
        selected: true,
        data: {
          bootstrapInserted: true,
          bootstrapGroupId: 'bootstrap-group-1',
          assetIds: ['prop-1', 'prop-2'],
          preferredComparableRefs: [
            {
              id: 'comp-1',
              label: 'similar prop'
            },
            {
              id: 'comp-2',
              label: 'backup prop'
            }
          ],
          forceSynthesisKeys: ['damage_pattern', 'silhouette'],
          variableTraitKeys: ['damage_pattern', 'silhouette']
        }
      } as Node
    ]);

    expect(result).toEqual({
      bootstrapGroupId: 'bootstrap-group-1',
      bootstrapMode: 'prop-variation',
      assetIds: ['prop-1', 'prop-2'],
      analysisSources: [
        {
          assetId: 'prop-1',
          fixtureId: 'hero-prop-venue',
          selectionMode: 'heuristic'
        }
      ],
      preferredComparableRefs: [
        {
          id: 'comp-1',
          label: 'similar prop',
          origin: 'comparable',
          score: 0.72,
          sourceRef: 'library-prop-7',
          reasonCodes: ['fixture-comparable']
        },
        {
          id: 'comp-2',
          label: 'backup prop'
        }
      ],
      forceSynthesisKeys: ['damage_pattern', 'silhouette'],
      lockedTraitKeys: ['world_style'],
      variableTraitKeys: ['damage_pattern', 'silhouette'],
      notes: 'Prefer the rusted venue prop family'
    });
  });
});

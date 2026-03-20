import { applyImageBootstrapSignalsToAssets } from '../imageBootstrapAssetSignals';

describe('applyImageBootstrapSignalsToAssets', () => {
  it('persists explicit fixture selections and preferred comparable refs onto matching assets', () => {
    const result = applyImageBootstrapSignalsToAssets(
      [
        {
          id: 'prop-1',
          kind: 'reference-still',
          role: 'hero-prop',
          storage: {
            provider: 'local',
            uri: 'file://prop-1.png',
            contentType: 'image/png'
          },
          provenance: {
            source: 'upload'
          }
        },
        {
          id: 'prop-2',
          kind: 'reference-still',
          role: 'backup-prop',
          storage: {
            provider: 'local',
            uri: 'file://prop-2.png',
            contentType: 'image/png'
          },
          provenance: {
            source: 'upload'
          },
          metadata: {
            notes: 'keep existing metadata'
          }
        }
      ],
      {
        reviewId: 'review-1',
        bootstrapMode: 'prop-variation',
        analyses: [
          {
            assetId: 'prop-1',
            subjectKind: 'prop',
            bootstrapMode: 'prop-variation',
            analysisSource: {
              fixtureId: 'hero-prop-venue',
              selectionMode: 'explicit'
            },
            subjects: [],
            regions: [],
            lockedTraits: [],
            variableTraits: [],
            variationAxes: [],
            segmentationFindings: [],
            modelFindings: [],
            comparableSearchTerms: [],
            confidence: 0.88
          }
        ],
        exactMatches: [],
        comparableMatches: [
          {
            id: 'comp-1',
            origin: 'comparable',
            kind: 'asset',
            label: 'rusted venue prop fragment',
            score: 0.77,
            sourceRef: 'fixture://rusted-venue-prop-fragment',
            reasonCodes: ['fixture-comparable']
          }
        ],
        uncertainTraits: [],
        guidance: {
          bootstrapMode: 'prop-variation',
          primarySubjectId: undefined,
          excludedRegionIds: [],
          lockedTraitKeys: [],
          variableTraitKeys: [],
          rejectedTraitKeys: [],
          addedLockedTraits: [],
          addedVariableTraits: [],
          explicitFixtureSelections: [
            {
              assetId: 'prop-1',
              fixtureId: 'hero-prop-venue'
            }
          ],
          preferredComparableMatchIds: ['comp-1'],
          forceSynthesisKeys: []
        }
      }
    );

    expect(result[0]?.metadata).toMatchObject({
      imageBootstrapFixture: 'hero-prop-venue',
      imageBootstrapFixtureSelectionMode: 'explicit',
      imageBootstrapBootstrapMode: 'prop-variation',
      imageBootstrapPreferredComparableRefs: [
        {
          id: 'comp-1',
          label: 'rusted venue prop fragment',
          origin: 'comparable',
          score: 0.77,
          sourceRef: 'fixture://rusted-venue-prop-fragment'
        }
      ]
    });
    expect(result[1]?.metadata).toMatchObject({
      notes: 'keep existing metadata'
    });
  });

  it('does not overwrite an existing explicit fixture with a heuristic-only analysis', () => {
    const result = applyImageBootstrapSignalsToAssets(
      [
        {
          id: 'crowd-1',
          kind: 'reference-still',
          role: 'crowd-extra',
          storage: {
            provider: 'local',
            uri: 'file://crowd.png',
            contentType: 'image/png'
          },
          provenance: {
            source: 'upload'
          },
          metadata: {
            imageBootstrapFixture: 'punk-crowd-extra'
          }
        }
      ],
      {
        reviewId: 'review-2',
        bootstrapMode: 'crowd-archetype-expansion',
        analyses: [
          {
            assetId: 'crowd-1',
            subjectKind: 'person',
            bootstrapMode: 'crowd-archetype-expansion',
            analysisSource: {
              fixtureId: 'punk-crowd-extra',
              selectionMode: 'heuristic'
            },
            subjects: [],
            regions: [],
            lockedTraits: [],
            variableTraits: [],
            variationAxes: [],
            segmentationFindings: [],
            modelFindings: [],
            comparableSearchTerms: [],
            confidence: 0.72
          }
        ],
        exactMatches: [],
        comparableMatches: [],
        uncertainTraits: []
      }
    );

    expect(result[0]?.metadata).toMatchObject({
      imageBootstrapFixture: 'punk-crowd-extra',
      imageBootstrapFixtureSelectionMode: 'heuristic',
      imageBootstrapBootstrapMode: 'crowd-archetype-expansion'
    });
  });
});

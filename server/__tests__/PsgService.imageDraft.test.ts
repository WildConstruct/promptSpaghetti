import { PsgService } from '../src/services/PsgService';

describe('PsgService image draft graph', () => {
  const service = new PsgService();

  it('carries preferred comparable refs and synthesis guidance into the drafted fragment', () => {
    const result = service.draftGraphFromImages(
      {
        version: 'psg/1',
        kind: 'fragment',
        metadata: { name: 'Working Graph' },
        assets: [
          {
            id: 'prop-1',
            kind: 'reference-still',
            role: 'hero-prop',
            storage: {
              provider: 'local',
              uri: 'file://hero-prop.png',
              contentType: 'image/png'
            },
            provenance: {
              source: 'upload'
            }
          }
        ],
        fragment: {
          version: '1.0.0',
          name: 'Working Graph',
          nodes: [{ id: 'n1', type: 'TextBlock', x: 0, y: 0, value: 'seed' }],
          edges: []
        }
      },
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
              selectionMode: 'heuristic'
            },
            subjects: [],
            regions: [],
            lockedTraits: [
              {
                key: 'world_style',
                value: 'weathered stage prop',
                classification: 'locked',
                confidence: 0.9,
                provenance: ['human'],
                evidence: [],
                conflicts: []
              }
            ],
            variableTraits: [
              {
                key: 'damage_pattern',
                value: 'surface wear',
                classification: 'variable',
                confidence: 0.86,
                provenance: ['human'],
                evidence: [],
                conflicts: []
              }
            ],
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
            label: 'similar prop',
            score: 0.72,
            reasonCodes: ['role-similarity'],
            sourceRef: 'library-prop-7'
          },
          {
            id: 'comp-2',
            origin: 'comparable',
            kind: 'asset',
            label: 'backup prop',
            score: 0.63,
            reasonCodes: ['style-similarity'],
            sourceRef: 'library-prop-8'
          }
        ],
        uncertainTraits: [],
        guidance: {
          bootstrapMode: 'prop-variation',
          primarySubjectId: '',
          excludedRegionIds: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          rejectedTraitKeys: [],
          addedLockedTraits: [],
          addedVariableTraits: [],
          preferredComparableMatchIds: ['comp-1'],
          forceSynthesisKeys: ['damage_pattern'],
          notes: 'Prefer the rusted venue prop family'
        }
      }
    );

    expect(result.draftFragment.metadata).toMatchObject({
      imageBootstrap: {
        bootstrapMode: 'prop-variation',
        reviewId: 'review-1',
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
            sourceRef: 'library-prop-7'
          }
        ],
        forceSynthesisKeys: ['damage_pattern'],
        lockedTraitKeys: ['world_style'],
        variableTraitKeys: ['damage_pattern'],
        notes: 'Prefer the rusted venue prop family',
        assetIds: ['prop-1']
      }
    });

    expect(result.draftFragment.nodes[0]).toMatchObject({
      type: 'TextBlock',
      data: {
        analysisSources: [
          expect.objectContaining({
            fixtureId: 'hero-prop-venue'
          })
        ],
        preferredComparableRefs: [
          expect.objectContaining({
            id: 'comp-1'
          })
        ],
        forceSynthesisKeys: ['damage_pattern']
      }
    });
    expect(result.draftFragment.nodes[1]).toMatchObject({
      type: 'WeightedChoice',
      data: {
        analysisSources: [
          expect.objectContaining({
            fixtureId: 'hero-prop-venue'
          })
        ],
        preferredComparableRefs: [
          expect.objectContaining({
            id: 'comp-1'
          })
        ]
      },
      options: [
        expect.objectContaining({
          label: 'damage_pattern',
          text: 'surface wear',
          meta: expect.objectContaining({
            traitKey: 'damage_pattern',
            forceSynthesis: true,
            preferredComparableRefs: [
              expect.objectContaining({
                id: 'comp-1'
              })
            ]
          })
        })
      ]
    });
  });
});

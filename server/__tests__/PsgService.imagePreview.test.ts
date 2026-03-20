import { PsgService } from '../src/services/PsgService';

describe('PsgService image preview', () => {
  const service = new PsgService();
  const originalKreaApiToken = process.env.KREA_API_TOKEN;

  beforeEach(() => {
    delete process.env.KREA_API_TOKEN;
  });

  afterAll(() => {
    if (originalKreaApiToken) {
      process.env.KREA_API_TOKEN = originalKreaApiToken;
    } else {
      delete process.env.KREA_API_TOKEN;
    }
  });

  it('builds deterministic preview results behind a preview backend abstraction', async () => {
    const result = await service.previewImages(
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
              selectionMode: 'explicit'
            },
            subjects: [],
            regions: [],
            lockedTraits: [
              {
                key: 'world_style',
                value: 'rusted venue prop family',
                classification: 'locked',
                confidence: 0.91,
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
            confidence: 0.9
          }
        ],
        exactMatches: [],
        comparableMatches: [
          {
            id: 'comp-1',
            origin: 'comparable',
            kind: 'asset',
            label: 'rusted venue prop fragment',
            score: 0.79,
            reasonCodes: ['fixture-comparable'],
            sourceRef: 'fixture://rusted-venue-prop-fragment'
          }
        ],
        uncertainTraits: [],
        guidance: {
          bootstrapMode: 'prop-variation',
          excludedRegionIds: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          rejectedTraitKeys: [],
          addedLockedTraits: [],
          addedVariableTraits: [],
          preferredComparableMatchIds: ['comp-1'],
          forceSynthesisKeys: ['damage_pattern'],
          notes: 'Keep the venue wear family'
        }
      },
      {
        count: 2,
        seed: 7001,
        includePromptBlueprint: true
      }
    );

    expect(result.preview).toMatchObject({
      backend: {
        id: 'mock-image-preview',
        mode: 'mock',
        label: 'Mock Image Preview',
        profile: 'bootstrap',
        model: 'bootstrap-deterministic-v1',
        supportedModels: ['bootstrap-deterministic-v1', 'bootstrap-fast-v1']
      },
      count: 2,
      seed: 7001,
      promptBlueprint:
        'locked:world_style | vary:damage_pattern | synth:damage_pattern | refs:rusted venue prop fragment | notes:Keep the venue wear family',
      results: [
        expect.objectContaining({
          id: 'preview-1',
          seed: 7001,
          imageUrl:
            'mock://image-preview/mock-image-preview/bootstrap-deterministic-v1/7001',
          prompt:
            'locked:world_style | vary:damage_pattern | synth:damage_pattern | refs:rusted venue prop fragment | notes:Keep the venue wear family | placement:isolated-prop | render:standard | family:rusted venue prop fragment | sample:1',
          metadata: {
            assetIds: ['prop-1'],
            preferredComparableLabels: ['rusted venue prop fragment'],
            lockedTraitKeys: ['world_style'],
            variableTraitKeys: ['damage_pattern'],
            forceSynthesisKeys: ['damage_pattern'],
            guidanceNotes: 'Keep the venue wear family'
          }
        }),
        expect.objectContaining({
          id: 'preview-2',
          seed: 7002
        })
      ]
    });
    expect(result.issues).toEqual([]);
  });

  it('builds scene-oriented previews with richer comparable-family context', async () => {
    const result = await service.previewImages(
      {
        version: 'psg/1',
        kind: 'fragment',
        metadata: { name: 'Working Graph' },
        assets: [],
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
            subjects: [],
            regions: [],
            lockedTraits: [],
            variableTraits: [],
            variationAxes: [],
            segmentationFindings: [],
            modelFindings: [],
            comparableSearchTerms: [],
            confidence: 0.9
          }
        ],
        exactMatches: [],
        comparableMatches: [
          {
            id: 'comp-1',
            origin: 'comparable',
            kind: 'asset',
            label: 'neon wall sign',
            score: 0.8
          },
          {
            id: 'comp-2',
            origin: 'comparable',
            kind: 'asset',
            label: 'rusted venue chair',
            score: 0.76
          }
        ],
        uncertainTraits: [],
        guidance: {
          bootstrapMode: 'prop-variation',
          excludedRegionIds: [],
          lockedTraitKeys: [],
          variableTraitKeys: [],
          rejectedTraitKeys: [],
          addedLockedTraits: [],
          addedVariableTraits: [],
          preferredComparableMatchIds: ['comp-1', 'comp-2'],
          forceSynthesisKeys: [],
          notes: 'Favor scene-friendly props'
        }
      },
      {
        count: 2,
        backendId: 'mock-scene-preview',
        model: 'scene-comprehension-v1',
        includePromptBlueprint: true
      }
    );

    expect(result.preview.backend).toMatchObject({
      id: 'mock-scene-preview',
      profile: 'scene',
      model: 'scene-comprehension-v1'
    });
    expect(result.preview.promptBlueprint).toBe(
      'locked:world | vary:details | refs:neon wall sign/rusted venue chair | notes:Favor scene-friendly props'
    );
    expect(result.preview.results[0]).toMatchObject({
      imageUrl:
        'mock://image-preview/mock-scene-preview/scene-comprehension-v1/1001',
      prompt:
        'locked:world | vary:details | refs:neon wall sign/rusted venue chair | notes:Favor scene-friendly props | placement:scene-fit | render:standard | family:neon wall sign/rusted venue chair | sample:1',
      metadata: {
        preferredComparableLabels: ['neon wall sign', 'rusted venue chair'],
        guidanceNotes: 'Favor scene-friendly props'
      }
    });
    expect(result.preview.results[1]).toMatchObject({
      metadata: {
        preferredComparableLabels: ['rusted venue chair', 'neon wall sign']
      }
    });
  });

  it('falls back to a known backend and model when the request is unsupported', async () => {
    const result = await service.previewImages(
      {
        version: 'psg/1',
        kind: 'fragment',
        metadata: { name: 'Working Graph' },
        assets: [],
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
            subjects: [],
            regions: [],
            lockedTraits: [],
            variableTraits: [],
            variationAxes: [],
            segmentationFindings: [],
            modelFindings: [],
            comparableSearchTerms: [],
            confidence: 0.9
          }
        ],
        exactMatches: [],
        comparableMatches: [],
        uncertainTraits: []
      },
      {
        count: 1,
        backendId: 'unknown-backend',
        model: 'unknown-model'
      }
    );

    expect(result.preview.backend).toEqual({
      id: 'mock-image-preview',
      mode: 'mock',
      label: 'Mock Image Preview',
      profile: 'bootstrap',
      model: 'bootstrap-deterministic-v1',
      supportedModels: ['bootstrap-deterministic-v1', 'bootstrap-fast-v1']
    });
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'UNKNOWN_PREVIEW_BACKEND' }),
        expect.objectContaining({ code: 'UNSUPPORTED_PREVIEW_MODEL' })
      ])
    );
  });

  it('falls back to mock preview when the Krea backend is selected without configuration', async () => {
    const result = await service.previewImages(
      {
        version: 'psg/1',
        kind: 'fragment',
        metadata: { name: 'Working Graph' },
        assets: [],
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
            subjects: [],
            regions: [],
            lockedTraits: [],
            variableTraits: [],
            variationAxes: [],
            segmentationFindings: [],
            modelFindings: [],
            comparableSearchTerms: [],
            confidence: 0.9
          }
        ],
        exactMatches: [],
        comparableMatches: [],
        uncertainTraits: []
      },
      {
        count: 1,
        backendId: 'krea-flux-dev',
        model: 'flux-1-dev'
      }
    );

    expect(result.preview.backend.id).toBe('mock-image-preview');
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'UNKNOWN_PREVIEW_BACKEND' })
      ])
    );
  });
});

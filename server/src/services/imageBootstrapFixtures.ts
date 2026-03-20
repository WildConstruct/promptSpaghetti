import {
  PsgImageAnalysisRecordSchema,
  type PsgAssetRef,
  type PsgComparableMatch,
  type PsgDetectedRegion,
  type PsgDetectedSubject,
  type PsgImageAnalysisRecord
} from '../../../packages/core/services/psg/contracts';

export type SegmentationStageResult = {
  subjectKind: PsgImageAnalysisRecord['subjectKind'];
  bootstrapMode: NonNullable<PsgImageAnalysisRecord['bootstrapMode']>;
  subjects: PsgDetectedSubject[];
  regions: PsgDetectedRegion[];
  findings: string[];
};

export type MultimodalStageResult = {
  findings: string[];
  lockedTraitHints: string[];
  variableTraitHints: string[];
  comparableSearchTerms: string[];
};

export type ImageBootstrapFixture = {
  id: string;
  matches: (asset: PsgAssetRef, userIntent?: string) => boolean;
  buildAnalysis: (asset: PsgAssetRef) => PsgImageAnalysisRecord;
  buildComparableMatches: (
    asset: PsgAssetRef
  ) => {
    exact: PsgComparableMatch;
    comparable: PsgComparableMatch;
  };
};

function readExplicitFixtureId(asset: PsgAssetRef): string | undefined {
  const metadata = asset.metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return undefined;
  }

  const candidate = (metadata as Record<string, unknown>).imageBootstrapFixture;
  return typeof candidate === 'string' && candidate.trim().length > 0
    ? candidate.trim()
    : undefined;
}

export function inferBootstrapModeFromAssetRole(role?: string) {
  const normalized = role?.toLowerCase() || '';
  if (
    normalized.includes('crowd') ||
    normalized.includes('extra') ||
    normalized.includes('background-person')
  ) {
    return 'crowd-archetype-expansion' as const;
  }
  if (normalized.includes('prop')) {
    return 'prop-variation' as const;
  }
  if (normalized.includes('set') || normalized.includes('environment')) {
    return 'set-dressing-variation' as const;
  }
  return 'character-variation' as const;
}

export function inferSubjectKind(
  bootstrapMode: NonNullable<PsgImageAnalysisRecord['bootstrapMode']>
) {
  switch (bootstrapMode) {
    case 'prop-variation':
      return 'prop' as const;
    case 'set-dressing-variation':
      return 'environment' as const;
    default:
      return 'person' as const;
  }
}

const HERO_PROP_FIXTURE: ImageBootstrapFixture = {
  id: 'hero-prop-venue',
  matches: (asset, userIntent) =>
    (asset.role || '').toLowerCase().includes('hero-prop') &&
    (userIntent || '').toLowerCase().includes('prop variations'),
  buildAnalysis: asset =>
    PsgImageAnalysisRecordSchema.parse({
      assetId: asset.id,
      subjectKind: 'prop',
      bootstrapMode: 'prop-variation',
      subjects: [
        {
          id: `${asset.id}-subject-1`,
          subjectKind: 'prop',
          label: 'hero-prop',
          confidence: 0.88,
          primary: true,
          regionIds: [`${asset.id}-region-1`, `${asset.id}-region-2`],
          tags: ['prop', 'venue', 'weathered']
        }
      ],
      regions: [
        {
          id: `${asset.id}-region-1`,
          label: 'primary silhouette',
          kind: 'subject',
          confidence: 0.9,
          tags: ['silhouette', 'hero-prop']
        },
        {
          id: `${asset.id}-region-2`,
          label: 'surface wear',
          kind: 'part',
          confidence: 0.83,
          tags: ['wear', 'damage']
        }
      ],
      lockedTraits: [
        {
          key: 'world_style',
          value: 'rusted venue prop family',
          classification: 'locked',
          confidence: 0.84,
          provenance: ['multimodal-model', 'retrieval'],
          evidence: [
            {
              source: 'multimodal-model',
              score: 0.82,
              summary: 'Model identifies a rusted venue prop family'
            },
            {
              source: 'retrieval',
              score: 0.76,
              summary: 'Comparable prop fragments share venue-wear cues'
            }
          ],
          conflicts: []
        }
      ],
      variableTraits: [
        {
          key: 'damage_pattern',
          value: 'surface wear',
          classification: 'variable',
          confidence: 0.79,
          provenance: ['segmentation', 'multimodal-model'],
          evidence: [
            {
              source: 'segmentation',
              score: 0.74,
              summary: 'Detected concentrated wear on exposed edges'
            },
            {
              source: 'multimodal-model',
              score: 0.78,
              summary: 'Model suggests varied damage patterning'
            }
          ],
          conflicts: []
        },
        {
          key: 'label_variant',
          value: 'faded venue sticker',
          classification: 'variable',
          confidence: 0.74,
          provenance: ['multimodal-model', 'heuristic'],
          evidence: [
            {
              source: 'multimodal-model',
              score: 0.72,
              summary: 'Model suggests label/sticker treatment as a variation axis'
            },
            {
              source: 'heuristic',
              score: 0.68,
              summary: 'Prop-role heuristic favors label variation'
            }
          ],
          conflicts: []
        }
      ],
      variationAxes: [
        {
          id: `${asset.id}-axis-damage`,
          label: 'damage_pattern',
          kind: 'variable',
          values: ['surface wear', 'chipped corners', 'scrape banding'],
          confidence: 0.79,
          sourceIds: [asset.id]
        },
        {
          id: `${asset.id}-axis-label`,
          label: 'label_variant',
          kind: 'variable',
          values: ['faded venue sticker', 'painted inventory code', 'taped note'],
          confidence: 0.74,
          sourceIds: [asset.id]
        }
      ],
      segmentationFindings: [
        'subject:hero-prop',
        'region:primary silhouette',
        'region:surface wear'
      ],
      modelFindings: [
        'semantic:weathered venue prop',
        'style:rusted venue prop family',
        'variation:damage pattern and label treatment'
      ],
      comparableSearchTerms: [
        'weathered venue prop',
        'rusted stage prop',
        'faded label prop'
      ],
      confidence: 0.79
    }),
  buildComparableMatches: asset => ({
    exact: {
      id: `exact-${asset.id}`,
      origin: 'exact',
      kind: 'asset',
      label: 'hero-prop source image',
      score: 0.93,
      reasonCodes: ['fixture-source', 'role-match'],
      sourceRef: asset.id
    },
    comparable: {
      id: `comp-${asset.id}-venue`,
      origin: 'comparable',
      kind: 'asset',
      label: 'rusted venue prop fragment',
      score: 0.78,
      reasonCodes: ['fixture-comparable', 'style-similarity', 'prop-wear-match'],
      sourceRef: 'fixture://rusted-venue-prop-fragment'
    }
  })
};

const PUNK_CROWD_FIXTURE: ImageBootstrapFixture = {
  id: 'punk-crowd-extra',
  matches: (asset, userIntent) => {
    const normalizedRole = (asset.role || '').toLowerCase();
    const normalizedIntent = (userIntent || '').toLowerCase();
    return (
      (normalizedRole.includes('crowd-extra') ||
        normalizedRole.includes('background-person')) &&
      (normalizedIntent.includes('crowd') || normalizedIntent.includes('punk'))
    );
  },
  buildAnalysis: asset =>
    PsgImageAnalysisRecordSchema.parse({
      assetId: asset.id,
      subjectKind: 'person',
      bootstrapMode: 'crowd-archetype-expansion',
      subjects: [
        {
          id: `${asset.id}-subject-1`,
          subjectKind: 'person',
          label: 'punk crowd extra',
          confidence: 0.9,
          primary: true,
          regionIds: [`${asset.id}-region-1`, `${asset.id}-region-2`],
          tags: ['person', 'crowd', 'punk']
        }
      ],
      regions: [
        {
          id: `${asset.id}-region-1`,
          label: 'body silhouette',
          kind: 'subject',
          confidence: 0.89,
          tags: ['silhouette', 'standing']
        },
        {
          id: `${asset.id}-region-2`,
          label: 'jacket and patches',
          kind: 'part',
          confidence: 0.82,
          tags: ['wardrobe', 'jacket', 'patches']
        }
      ],
      lockedTraits: [
        {
          key: 'world_style',
          value: 'sweaty underground punk venue',
          classification: 'locked',
          confidence: 0.86,
          provenance: ['multimodal-model', 'retrieval'],
          evidence: [
            {
              source: 'multimodal-model',
              score: 0.84,
              summary: 'Model identifies an underground punk venue crowd'
            },
            {
              source: 'retrieval',
              score: 0.79,
              summary: 'Comparable crowd fragments share the same venue energy'
            }
          ],
          conflicts: []
        }
      ],
      variableTraits: [
        {
          key: 'pose_energy',
          value: 'shoulder-to-shoulder sway',
          classification: 'variable',
          confidence: 0.8,
          provenance: ['segmentation', 'multimodal-model'],
          evidence: [
            {
              source: 'segmentation',
              score: 0.76,
              summary: 'Detected standing crowd silhouette with lateral motion'
            },
            {
              source: 'multimodal-model',
              score: 0.79,
              summary: 'Model suggests energetic crowd pose variation'
            }
          ],
          conflicts: []
        },
        {
          key: 'wardrobe_variation',
          value: 'patched leather and denim mix',
          classification: 'variable',
          confidence: 0.77,
          provenance: ['multimodal-model', 'heuristic'],
          evidence: [
            {
              source: 'multimodal-model',
              score: 0.75,
              summary: 'Model identifies jacket and patch variation as the main axis'
            },
            {
              source: 'heuristic',
              score: 0.7,
              summary: 'Crowd-extra heuristic favors wardrobe variation'
            }
          ],
          conflicts: []
        }
      ],
      variationAxes: [
        {
          id: `${asset.id}-axis-pose`,
          label: 'pose_energy',
          kind: 'variable',
          values: ['shoulder-to-shoulder sway', 'arms up', 'leaning shout'],
          confidence: 0.8,
          sourceIds: [asset.id]
        },
        {
          id: `${asset.id}-axis-wardrobe`,
          label: 'wardrobe_variation',
          kind: 'variable',
          values: ['patched leather and denim mix', 'band tee and chains', 'studded vest'],
          confidence: 0.77,
          sourceIds: [asset.id]
        }
      ],
      segmentationFindings: [
        'subject:punk crowd extra',
        'region:body silhouette',
        'region:jacket and patches'
      ],
      modelFindings: [
        'semantic:punk show attendee',
        'style:sweaty underground punk venue',
        'variation:pose energy and wardrobe variation'
      ],
      comparableSearchTerms: [
        'punk crowd extra',
        'underground venue attendee',
        'patched jacket crowd'
      ],
      confidence: 0.81
    }),
  buildComparableMatches: asset => ({
    exact: {
      id: `exact-${asset.id}`,
      origin: 'exact',
      kind: 'asset',
      label: 'crowd extra source image',
      score: 0.92,
      reasonCodes: ['fixture-source', 'role-match'],
      sourceRef: asset.id
    },
    comparable: {
      id: `comp-${asset.id}-punk`,
      origin: 'comparable',
      kind: 'crowd-archetype',
      label: 'punk crowd archetype fragment',
      score: 0.81,
      reasonCodes: ['fixture-comparable', 'crowd-energy-match', 'style-similarity'],
      sourceRef: 'fixture://punk-crowd-archetype-fragment'
    }
  })
};

const FIXTURES: ImageBootstrapFixture[] = [HERO_PROP_FIXTURE, PUNK_CROWD_FIXTURE];

export function listImageBootstrapFixtureIds(): string[] {
  return FIXTURES.map(fixture => fixture.id);
}

export function resolveImageBootstrapFixture(
  asset: PsgAssetRef,
  userIntent?: string
): { fixture?: ImageBootstrapFixture; selectionMode?: 'explicit' | 'heuristic' } {
  const explicitFixtureId = readExplicitFixtureId(asset);
  if (explicitFixtureId) {
    return {
      fixture: FIXTURES.find(fixture => fixture.id === explicitFixtureId),
      selectionMode: 'explicit'
    };
  }

  const heuristicFixture = FIXTURES.find(fixture => fixture.matches(asset, userIntent));
  return {
    fixture: heuristicFixture,
    selectionMode: heuristicFixture ? 'heuristic' : undefined
  };
}

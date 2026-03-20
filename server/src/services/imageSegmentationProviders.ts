import type { PsgAssetRef } from '../../../packages/core/services/psg/contracts';
import {
  inferBootstrapModeFromAssetRole,
  inferSubjectKind,
  type SegmentationStageResult
} from './imageBootstrapFixtures';

type ReplicatePredictionResponse = {
  id?: string;
  status?: string;
  output?: unknown;
  error?: unknown;
  urls?: {
    get?: string;
  };
};

function resolveSegmentationImageUrl(asset: PsgAssetRef): string | null {
  const metadata = asset.metadata;
  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    const record = metadata as Record<string, unknown>;
    const candidate =
      typeof record.publicImageUrl === 'string'
        ? record.publicImageUrl
        : typeof record.publicUrl === 'string'
          ? record.publicUrl
          : typeof record.vendorImageUrl === 'string'
            ? record.vendorImageUrl
            : null;

    if (candidate && (candidate.startsWith('http://') || candidate.startsWith('https://'))) {
      return candidate;
    }
  }

  return asset.storage.uri.startsWith('http://') || asset.storage.uri.startsWith('https://')
    ? asset.storage.uri
    : null;
}

function buildFallbackSegmentation(
  asset: PsgAssetRef,
  providerFindings: string[] = []
): SegmentationStageResult {
  const bootstrapMode = inferBootstrapModeFromAssetRole(asset.role);
  const subjectKind = inferSubjectKind(bootstrapMode);
  const roleLabel = asset.role || 'reference';
  const segmentationImageUrl = resolveSegmentationImageUrl(asset);

  return {
    subjectKind,
    bootstrapMode,
    subjects: [
      {
        id: `${asset.id}-subject-1`,
        subjectKind,
        label: roleLabel,
        confidence: segmentationImageUrl ? 0.74 : 0.72,
        primary: true,
        regionIds: [`${asset.id}-region-1`],
        tags: [roleLabel]
      }
    ],
    regions: [
      {
        id: `${asset.id}-region-1`,
        label: roleLabel,
        kind: 'subject',
        confidence: segmentationImageUrl ? 0.83 : 0.81,
        tags: [roleLabel]
      }
    ],
    findings: [
      `subject:${roleLabel}`,
      `bootstrap:${bootstrapMode}`,
      ...providerFindings,
      segmentationImageUrl
        ? 'segmentation-provider:fallback-public-image'
        : 'segmentation-provider:fallback-no-public-image'
    ]
  };
}

function inferRegionKindFromLabel(label?: string): 'subject' | 'part' | 'background' | 'material' | 'unknown' {
  const normalized = (label || '').toLowerCase();
  if (
    normalized.includes('background') ||
    normalized.includes('backdrop') ||
    normalized.includes('wall') ||
    normalized.includes('floor')
  ) {
    return 'background';
  }
  if (
    normalized.includes('material') ||
    normalized.includes('fabric') ||
    normalized.includes('metal') ||
    normalized.includes('wood') ||
    normalized.includes('glass')
  ) {
    return 'material';
  }
  if (
    normalized.includes('part') ||
    normalized.includes('detail') ||
    normalized.includes('label') ||
    normalized.includes('surface') ||
    normalized.includes('wear') ||
    normalized.includes('handle') ||
    normalized.includes('edge')
  ) {
    return 'part';
  }
  if (normalized.length > 0) {
    return 'subject';
  }
  return 'unknown';
}

function coerceFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeReplicateBBox(
  raw: Record<string, unknown>
): { x: number; y: number; width: number; height: number } | undefined {
  const bbox =
    raw.bbox && typeof raw.bbox === 'object' && !Array.isArray(raw.bbox)
      ? (raw.bbox as Record<string, unknown>)
      : raw.box && typeof raw.box === 'object' && !Array.isArray(raw.box)
        ? (raw.box as Record<string, unknown>)
        : raw.bounds && typeof raw.bounds === 'object' && !Array.isArray(raw.bounds)
          ? (raw.bounds as Record<string, unknown>)
          : null;

  const x =
    coerceFiniteNumber(raw.x) ??
    coerceFiniteNumber(raw.left) ??
    coerceFiniteNumber(bbox?.x) ??
    coerceFiniteNumber(bbox?.left) ??
    0;
  const y =
    coerceFiniteNumber(raw.y) ??
    coerceFiniteNumber(raw.top) ??
    coerceFiniteNumber(bbox?.y) ??
    coerceFiniteNumber(bbox?.top) ??
    0;
  const width =
    coerceFiniteNumber(raw.width) ??
    (coerceFiniteNumber(raw.xmax) !== null && coerceFiniteNumber(raw.xmin) !== null
      ? Math.abs((coerceFiniteNumber(raw.xmax) || 0) - (coerceFiniteNumber(raw.xmin) || 0))
      : null) ??
    coerceFiniteNumber(bbox?.width) ??
    (coerceFiniteNumber(bbox?.xmax) !== null && coerceFiniteNumber(bbox?.xmin) !== null
      ? Math.abs((coerceFiniteNumber(bbox?.xmax) || 0) - (coerceFiniteNumber(bbox?.xmin) || 0))
      : null);
  const height =
    coerceFiniteNumber(raw.height) ??
    (coerceFiniteNumber(raw.ymax) !== null && coerceFiniteNumber(raw.ymin) !== null
      ? Math.abs((coerceFiniteNumber(raw.ymax) || 0) - (coerceFiniteNumber(raw.ymin) || 0))
      : null) ??
    coerceFiniteNumber(bbox?.height) ??
    (coerceFiniteNumber(bbox?.ymax) !== null && coerceFiniteNumber(bbox?.ymin) !== null
      ? Math.abs((coerceFiniteNumber(bbox?.ymax) || 0) - (coerceFiniteNumber(bbox?.ymin) || 0))
      : null);

  if (width && width > 0 && height && height > 0) {
    return { x: Math.max(0, x), y: Math.max(0, y), width, height };
  }

  return undefined;
}

function extractReplicateCandidates(output: unknown): Record<string, unknown>[] {
  if (Array.isArray(output)) {
    return output.filter(
      item => !!item && typeof item === 'object' && !Array.isArray(item)
    ) as Record<string, unknown>[];
  }

  if (!output || typeof output !== 'object' || Array.isArray(output)) {
    return [];
  }

  const record = output as Record<string, unknown>;
  const nested =
    (Array.isArray(record.predictions) && record.predictions) ||
    (Array.isArray(record.detections) && record.detections) ||
    (Array.isArray(record.regions) && record.regions) ||
    (Array.isArray(record.boxes) && record.boxes) ||
    (Array.isArray(record.output) && record.output) ||
    [];

  return nested.filter(
    item => !!item && typeof item === 'object' && !Array.isArray(item)
  ) as Record<string, unknown>[];
}

function parseReplicateSegmentationOutput(
  asset: PsgAssetRef,
  output: unknown
): SegmentationStageResult | null {
  const bootstrapMode = inferBootstrapModeFromAssetRole(asset.role);
  const subjectKind = inferSubjectKind(bootstrapMode);
  const roleLabel = asset.role || 'reference';
  const candidates = extractReplicateCandidates(output);
  const outputRecord =
    output && typeof output === 'object' && !Array.isArray(output)
      ? (output as Record<string, unknown>)
      : null;

  if (candidates.length === 0 && outputRecord) {
    const combinedMask =
      typeof outputRecord.combined_mask === 'string'
        ? outputRecord.combined_mask
        : typeof outputRecord.mask === 'string'
          ? outputRecord.mask
          : null;

    if (combinedMask) {
      return {
        subjectKind,
        bootstrapMode,
        subjects: [
          {
            id: `${asset.id}-subject-1`,
            subjectKind,
            label: roleLabel,
            confidence: 0.84,
            primary: true,
            regionIds: [`${asset.id}-region-1`],
            tags: [roleLabel, 'combined-mask']
          }
        ],
        regions: [
          {
            id: `${asset.id}-region-1`,
            label: roleLabel,
            kind: 'subject',
            confidence: 0.84,
            tags: ['combined-mask', roleLabel]
          }
        ],
        findings: [
          `subject:${roleLabel}`,
          `bootstrap:${bootstrapMode}`,
          'segmentation-provider:replicate',
          'segmentation-output:combined-mask'
        ]
      };
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const regions = candidates
    .slice(0, 3)
    .map((candidate, index) => {
      const label =
        typeof candidate.label === 'string'
          ? candidate.label
          : typeof candidate.class === 'string'
            ? candidate.class
            : typeof candidate.category === 'string'
              ? candidate.category
              : undefined;
      const confidence =
        coerceFiniteNumber(candidate.confidence) ??
        coerceFiniteNumber(candidate.score) ??
        coerceFiniteNumber(candidate.probability) ??
        undefined;

      return {
        id: `${asset.id}-region-${index + 1}`,
        label,
        kind: inferRegionKindFromLabel(label),
        bbox: normalizeReplicateBBox(candidate),
        confidence,
        tags: [label, typeof candidate.tag === 'string' ? candidate.tag : null].filter(
          (value): value is string => Boolean(value)
        )
      };
    })
    .filter(region => region.label || region.bbox || region.confidence !== undefined);

  if (regions.length === 0) {
    return null;
  }

  return {
    subjectKind,
    bootstrapMode,
    subjects: [
      {
        id: `${asset.id}-subject-1`,
        subjectKind,
        label: roleLabel,
        confidence:
          regions.reduce((max, region) => Math.max(max, region.confidence || 0), 0) || 0.76,
        primary: true,
        regionIds: regions.map(region => region.id),
        tags: [roleLabel]
      }
    ],
    regions,
    findings: [
      `subject:${roleLabel}`,
      `bootstrap:${bootstrapMode}`,
      'segmentation-provider:replicate',
      `segmentation-regions:${regions.length}`
    ]
  };
}

async function createReplicatePrediction(
  imageUrl: string
): Promise<ReplicatePredictionResponse> {
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    throw new Error('Replicate API token is not configured.');
  }

  const baseUrl = (process.env.REPLICATE_BASE_URL || 'https://api.replicate.com/v1').replace(
    /\/$/,
    ''
  );
  const modelVersion =
    process.env.REPLICATE_SEGMENTATION_VERSION?.trim() ||
    'fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83';
  const model = process.env.REPLICATE_SEGMENTATION_MODEL?.trim();
  const imageInputKey = process.env.REPLICATE_SEGMENTATION_IMAGE_INPUT_KEY?.trim() || 'image';
  const input = {
    [imageInputKey]: imageUrl
  };

  const url = model
    ? `${baseUrl}/models/${model}/predictions`
    : `${baseUrl}/predictions`;
  const body = model ? { input } : { version: modelVersion, input };

  if (!model && !modelVersion) {
    throw new Error('Replicate segmentation model is not configured.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const prediction = (await response.json()) as ReplicatePredictionResponse;

  if (!response.ok) {
    throw new Error(
      typeof prediction.error === 'string'
        ? prediction.error
        : 'Failed to create Replicate segmentation prediction.'
    );
  }

  return prediction;
}

async function pollReplicatePrediction(
  prediction: ReplicatePredictionResponse
): Promise<ReplicatePredictionResponse> {
  if (prediction.status === 'succeeded' || prediction.output !== undefined) {
    return prediction;
  }

  const token = process.env.REPLICATE_API_TOKEN?.trim();
  const baseUrl = (process.env.REPLICATE_BASE_URL || 'https://api.replicate.com/v1').replace(
    /\/$/,
    ''
  );
  const attempts = Number.parseInt(
    process.env.REPLICATE_SEGMENTATION_POLL_ATTEMPTS || '20',
    10
  );
  const intervalMs = Number.parseInt(
    process.env.REPLICATE_SEGMENTATION_POLL_INTERVAL_MS || '1500',
    10
  );
  const pollUrl = prediction.urls?.get || (prediction.id ? `${baseUrl}/predictions/${prediction.id}` : null);

  if (!token || !pollUrl) {
    throw new Error('Replicate prediction polling is not configured.');
  }

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await fetch(pollUrl, {
      headers: {
        Authorization: `Token ${token}`
      }
    });
    const next = (await response.json()) as ReplicatePredictionResponse;

    if (!response.ok) {
      throw new Error(
        typeof next.error === 'string'
          ? next.error
          : 'Failed to poll Replicate segmentation prediction.'
      );
    }

    if (next.status === 'succeeded') {
      return next;
    }

    if (next.status === 'failed' || next.status === 'canceled') {
      throw new Error(
        typeof next.error === 'string'
          ? next.error
          : `Replicate segmentation prediction ${next.status}.`
      );
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Replicate segmentation prediction timed out.');
}

export function generateSegmentationStage(asset: PsgAssetRef): SegmentationStageResult {
  return buildFallbackSegmentation(asset);
}

export async function generateSegmentationStageAsync(
  asset: PsgAssetRef
): Promise<SegmentationStageResult> {
  const segmentationImageUrl = resolveSegmentationImageUrl(asset);
  if (!segmentationImageUrl) {
    return buildFallbackSegmentation(asset, [
      'segmentation-provider:replicate-no-public-image'
    ]);
  }

  if (!process.env.REPLICATE_API_TOKEN?.trim()) {
    return buildFallbackSegmentation(asset, [
      'segmentation-provider:replicate-not-configured'
    ]);
  }

  try {
    const prediction = await createReplicatePrediction(segmentationImageUrl);
    const completedPrediction = await pollReplicatePrediction(prediction);
    const parsed = parseReplicateSegmentationOutput(asset, completedPrediction.output);

    if (!parsed) {
      return buildFallbackSegmentation(asset, [
        'segmentation-provider:replicate-empty-output'
      ]);
    }

    return parsed;
  } catch (error) {
    return buildFallbackSegmentation(asset, [
      'segmentation-provider:replicate-error',
      `segmentation-provider:replicate-message:${error instanceof Error ? error.message : 'unknown'}`
    ]);
  }
}

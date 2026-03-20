import type {
  PsgDocument,
  PsgImagePreviewRequestBody,
  PsgImagePreviewResponse,
  PsgReviewCheckpoint,
  PsgValidationIssue
} from '../../../packages/core/services/psg/contracts';
import type { ResolvedPreviewBackend } from './imagePreviewBackends';

export type PreviewGenerationContext = {
  document: PsgDocument;
  checkpoint: PsgReviewCheckpoint;
  request: PsgImagePreviewRequestBody;
  resolvedBackend: ResolvedPreviewBackend;
};

function buildWarning(code: string, message: string): PsgValidationIssue {
  return {
    code,
    message,
    severity: 'warning',
    path: 'preview'
  };
}

function buildPreviewPromptBlueprint(checkpoint: PsgReviewCheckpoint): string {
  const locked =
    checkpoint.guidance?.lockedTraitKeys.length
      ? checkpoint.guidance.lockedTraitKeys
      : checkpoint.analyses.flatMap(analysis =>
          analysis.lockedTraits.map(trait => trait.key)
        );
  const variable =
    checkpoint.guidance?.variableTraitKeys.length
      ? checkpoint.guidance.variableTraitKeys
      : checkpoint.analyses.flatMap(analysis =>
          analysis.variableTraits.map(trait => trait.key)
        );
  const forceSynthesis = checkpoint.guidance?.forceSynthesisKeys || [];
  const preferredComparableLabels = checkpoint.comparableMatches
    .filter(match =>
      (checkpoint.guidance?.preferredComparableMatchIds || []).includes(match.id)
    )
    .map(match => match.label)
    .slice(0, 2);
  const notes = checkpoint.guidance?.notes?.trim();

  return [
    `locked:${locked.join(',') || 'world'}`,
    `vary:${variable.join(',') || 'details'}`,
    forceSynthesis.length > 0 ? `synth:${forceSynthesis.join(',')}` : null,
    preferredComparableLabels.length > 0
      ? `refs:${preferredComparableLabels.join('/')}`
      : null,
    notes ? `notes:${notes}` : null
  ]
    .filter(Boolean)
    .join(' | ');
}

function buildPreviewResultComparableLabels(params: {
  preferredComparableLabels: string[];
  fallbackComparableLabels: string[];
  index: number;
  profile?: 'bootstrap' | 'scene';
}): string[] {
  const source =
    params.preferredComparableLabels.length > 0
      ? params.preferredComparableLabels
      : params.fallbackComparableLabels;

  if (source.length === 0) {
    return [];
  }

  if (params.profile !== 'scene') {
    return [source[params.index % source.length]];
  }

  const primary = source[params.index % source.length];
  const secondary =
    source.length > 1 ? source[(params.index + 1) % source.length] : undefined;

  return [primary, secondary].filter(
    (label, index, list): label is string => Boolean(label) && list.indexOf(label) === index
  );
}

function buildPreviewResultPrompt(params: {
  promptBlueprint: string;
  index: number;
  profile?: 'bootstrap' | 'scene';
  model?: string;
  comparableLabels: string[];
}): string {
  const modeHint =
    params.profile === 'scene'
      ? 'placement:scene-fit'
      : 'placement:isolated-prop';
  const speedHint = params.model?.includes('fast') ? 'render:fast' : 'render:standard';
  const familyHint = params.comparableLabels.length
    ? `family:${params.comparableLabels.join('/')}`
    : 'family:derived';

  return [
    params.promptBlueprint,
    modeHint,
    speedHint,
    familyHint,
    `sample:${params.index + 1}`
  ].join(' | ');
}

function buildMockPreviewPayload(
  context: PreviewGenerationContext
): PsgImagePreviewResponse['preview'] {
  const { checkpoint, request, resolvedBackend } = context;
  const backend = resolvedBackend.backend;
  const promptBlueprint = buildPreviewPromptBlueprint(checkpoint);
  const preferredComparableLabels = checkpoint.comparableMatches
    .filter(match =>
      (checkpoint.guidance?.preferredComparableMatchIds || []).includes(match.id)
    )
    .map(match => match.label);
  const fallbackComparableLabels = checkpoint.comparableMatches.map(match => match.label);
  const assetIds = checkpoint.analyses.map(analysis => analysis.assetId);
  const lockedTraitKeys = checkpoint.guidance?.lockedTraitKeys || [];
  const variableTraitKeys = checkpoint.guidance?.variableTraitKeys || [];
  const forceSynthesisKeys = checkpoint.guidance?.forceSynthesisKeys || [];
  const guidanceNotes = checkpoint.guidance?.notes || '';
  const baseSeed = request.seed ?? 1001;

  return {
    backend,
    count: request.count,
    seed: request.seed,
    promptBlueprint: request.includePromptBlueprint ? promptBlueprint : undefined,
    results: Array.from({ length: request.count }, (_, index) => {
      const seed = baseSeed + index;
      const resultComparableLabels = buildPreviewResultComparableLabels({
        preferredComparableLabels,
        fallbackComparableLabels,
        index,
        profile: backend.profile
      });
      return {
        id: `preview-${index + 1}`,
        seed,
        prompt: buildPreviewResultPrompt({
          promptBlueprint,
          index,
          profile: backend.profile,
          model: backend.model,
          comparableLabels: resultComparableLabels
        }),
        imageUrl: `mock://image-preview/${backend.id}/${backend.model || 'default'}/${seed}`,
        width: resolvedBackend.width,
        height: resolvedBackend.height,
        metadata: {
          assetIds,
          preferredComparableLabels: resultComparableLabels,
          lockedTraitKeys,
          variableTraitKeys,
          forceSynthesisKeys,
          guidanceNotes
        }
      };
    })
  };
}

function resolveKreaModelPath(model?: string): string {
  switch (model) {
    case 'nano-banana-pro':
      return 'bfl/nano-banana-pro';
    case 'seedream-4':
      return 'bfl/seedream-4';
    case 'flux-1-dev':
    default:
      return 'bfl/flux-1-dev';
  }
}

async function createKreaJob(
  payload: unknown,
  token: string,
  model?: string
): Promise<string> {
  const baseUrl = process.env.KREA_BASE_URL || 'https://api.krea.ai';
  const response = await fetch(
    `${baseUrl}/generate/image/${resolveKreaModelPath(model)}`,
    {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
    }
  );
  const body = (await response.json()) as { job_id?: string; error?: unknown };
  if (!response.ok || !body.job_id) {
    throw new Error(
      typeof body.error === 'string' ? body.error : 'Failed to create Krea preview job'
    );
  }
  return body.job_id;
}

async function pollKreaJob(jobId: string, token: string): Promise<string[]> {
  const baseUrl = process.env.KREA_BASE_URL || 'https://api.krea.ai';
  const attempts = Number.parseInt(process.env.KREA_POLL_ATTEMPTS || '20', 10);
  const intervalMs = Number.parseInt(process.env.KREA_POLL_INTERVAL_MS || '2000', 10);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await fetch(`${baseUrl}/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const body = (await response.json()) as {
      status?: string;
      error?: unknown;
      result?: { urls?: string[] };
    };

    if (!response.ok) {
      throw new Error(
        typeof body.error === 'string' ? body.error : 'Failed to poll Krea preview job'
      );
    }

    if (body.status === 'completed') {
      return body.result?.urls || [];
    }

    if (body.status === 'failed') {
      throw new Error(
        typeof body.error === 'string' ? body.error : 'Krea preview job failed'
      );
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Krea preview job timed out');
}

function buildKreaPayload(context: PreviewGenerationContext) {
  const { document, checkpoint, request, resolvedBackend } = context;
  const promptBlueprint = buildPreviewPromptBlueprint(checkpoint);
  const assetIds = checkpoint.analyses.map(analysis => analysis.assetId);
  const imageUrls = document.assets
    .filter(asset => assetIds.includes(asset.id))
    .map(asset => {
      const publicImageUrl =
        typeof asset.metadata?.publicImageUrl === 'string'
          ? asset.metadata.publicImageUrl
          : typeof asset.metadata?.publicUrl === 'string'
            ? asset.metadata.publicUrl
            : typeof asset.metadata?.vendorImageUrl === 'string'
              ? asset.metadata.vendorImageUrl
              : undefined;
      const candidate = publicImageUrl || asset.storage.uri;
      return candidate.startsWith('http://') || candidate.startsWith('https://')
        ? candidate
        : null;
    })
    .filter((uri): uri is string => Boolean(uri));

  return {
    prompt: promptBlueprint,
    width: resolvedBackend.width,
    height: resolvedBackend.height,
    steps: Number.parseInt(process.env.KREA_DEFAULT_STEPS || '28', 10),
    seed: request.seed,
    strength: Number.parseFloat(process.env.KREA_DEFAULT_STRENGTH || '0.75'),
    imageUrls,
    negative_prompt:
      process.env.KREA_NEGATIVE_PROMPT ||
      'blurry, deformed, extra limbs, watermark',
    guidance_scale: Number.parseFloat(process.env.KREA_GUIDANCE_SCALE || '7.5'),
    styleImages: [],
    relaxedModeAccess: false
  };
}

async function buildKreaPreviewPayload(
  context: PreviewGenerationContext
): Promise<{ preview: PsgImagePreviewResponse['preview']; issues: PsgValidationIssue[] }> {
  const token = process.env.KREA_API_TOKEN?.trim();
  if (!token) {
    return {
      preview: buildMockPreviewPayload(context),
      issues: [
        buildWarning(
          'KREA_NOT_CONFIGURED',
          'Krea preview backend is not configured. Falling back to mock preview.'
        )
      ]
    };
  }

  const payload = buildKreaPayload(context);
  const issues: PsgValidationIssue[] = [];
  if (payload.imageUrls.length === 0) {
    issues.push(
      buildWarning(
        'KREA_NO_PUBLIC_IMAGE_URLS',
        'No public image URLs were available for Krea conditioning. Continuing with prompt-only generation.'
      )
    );
  }

  const jobId = await createKreaJob(payload, token, context.resolvedBackend.backend.model);
  const urls = await pollKreaJob(jobId, token);
  const mockPreview = buildMockPreviewPayload(context);

  return {
    preview: {
      ...mockPreview,
      results: mockPreview.results.map((result, index) => ({
        ...result,
        imageUrl: urls[index] || result.imageUrl
      }))
    },
    issues
  };
}

export async function generatePreviewPayload(
  context: PreviewGenerationContext
): Promise<{ preview: PsgImagePreviewResponse['preview']; issues: PsgValidationIssue[] }> {
  if (context.resolvedBackend.backend.mode === 'vendor') {
    return buildKreaPreviewPayload(context);
  }

  return {
    preview: buildMockPreviewPayload(context),
    issues: []
  };
}

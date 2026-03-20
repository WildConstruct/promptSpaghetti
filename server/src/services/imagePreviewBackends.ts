import type {
  PsgImagePreviewRequestBody,
  PsgPreviewBackend,
  PsgValidationIssue
} from '../../../packages/core/services/psg/contracts';

type PreviewBackendCatalogEntry = {
  id: string;
  mode: 'mock' | 'vendor';
  label: string;
  profile: 'bootstrap' | 'scene';
  defaultModel: string;
  supportedModels: string[];
  width: number;
  height: number;
};

export type ResolvedPreviewBackend = {
  backend: PsgPreviewBackend;
  width: number;
  height: number;
  issues: PsgValidationIssue[];
};

function buildPreviewBackendCatalog(): PreviewBackendCatalogEntry[] {
  const catalog: PreviewBackendCatalogEntry[] = [
    {
      id: 'mock-image-preview',
      mode: 'mock',
      label: 'Mock Image Preview',
      profile: 'bootstrap',
      defaultModel: 'bootstrap-deterministic-v1',
      supportedModels: ['bootstrap-deterministic-v1', 'bootstrap-fast-v1'],
      width: 512,
      height: 512
    },
    {
      id: 'mock-scene-preview',
      mode: 'mock',
      label: 'Mock Scene Preview',
      profile: 'scene',
      defaultModel: 'scene-comprehension-v1',
      supportedModels: ['scene-comprehension-v1'],
      width: 768,
      height: 768
    }
  ];

  if (process.env.KREA_API_TOKEN?.trim()) {
    catalog.push({
      id: 'krea-flux-dev',
      mode: 'vendor',
      label: 'Krea Flux Dev',
      profile: 'bootstrap',
      defaultModel: 'flux-1-dev',
      supportedModels: ['flux-1-dev', 'nano-banana-pro', 'seedream-4'],
      width: 512,
      height: 350
    });
  }

  return catalog;
}

function buildWarning(code: string, message: string): PsgValidationIssue {
  return {
    code,
    message,
    severity: 'warning',
    path: 'request'
  };
}

export function listPreviewBackends(): PsgPreviewBackend[] {
  return buildPreviewBackendCatalog().map(entry => ({
    id: entry.id,
    mode: entry.mode,
    label: entry.label,
    profile: entry.profile,
    model: entry.defaultModel,
    supportedModels: entry.supportedModels
  }));
}

export function resolvePreviewBackend(
  request: PsgImagePreviewRequestBody
): ResolvedPreviewBackend {
  const issues: PsgValidationIssue[] = [];
  const catalog = buildPreviewBackendCatalog();
  const fallback = catalog[0];
  const selected =
    catalog.find(entry => entry.id === request.backendId) || fallback;

  if (request.backendId && selected.id !== request.backendId) {
    issues.push(
      buildWarning(
        'UNKNOWN_PREVIEW_BACKEND',
        `Unknown preview backend "${request.backendId}". Falling back to "${fallback.id}".`
      )
    );
  }

  const resolvedModel =
    request.model && selected.supportedModels.includes(request.model)
      ? request.model
      : selected.defaultModel;

  if (request.model && resolvedModel !== request.model) {
    issues.push(
      buildWarning(
        'UNSUPPORTED_PREVIEW_MODEL',
        `Preview model "${request.model}" is not supported by "${selected.id}". Falling back to "${resolvedModel}".`
      )
    );
  }

  return {
    backend: {
      id: selected.id,
      mode: selected.mode,
      label: selected.label,
      profile: selected.profile,
      model: resolvedModel,
      supportedModels: selected.supportedModels
    },
    width: selected.width,
    height: selected.height,
    issues
  };
}

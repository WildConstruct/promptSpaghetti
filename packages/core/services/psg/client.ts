import {
  PsgAssembleSceneResponseSchema,
  PsgCapabilitiesResponseSchema,
  PsgDeriveAssetResponseSchema,
  PsgExpandCrowdResponseSchema,
  PsgExportComfyResponseSchema,
  PsgImageAnalyzeResponseSchema,
  PsgImageDraftGraphResponseSchema,
  PsgImagePreviewResponseSchema,
  PsgImageGenerateBatchResponseSchema,
  PsgImageRegisterBatchResponseSchema,
  PsgImageReviewResponseSchema,
  PsgNormalizeResponseSchema,
  PsgRegisterAssetsResponseSchema,
  PsgValidateResponseSchema,
  type PsgAssetRef,
  type PsgAssembleSceneResponse,
  type PsgCapabilitiesResponse,
  type PsgDeriveAssetResponse,
  type PsgExpandCrowdResponse,
  type PsgExportComfyResponse,
  type PsgGenerationBatchRequest,
  type PsgImageAnalyzeResponse,
  type PsgImageDraftGraphResponse,
  type PsgImagePreviewRequestBody,
  type PsgImagePreviewResponse,
  type PsgImageGenerateBatchResponse,
  type PsgImageRegisterBatchResponse,
  type PsgImageReviewResponse,
  type PsgReviewCheckpoint,
  type PsgReviewGuidance,
  type PsgNormalizeResponse,
  type PsgRegisterAssetsResponse,
  type PsgValidateResponse
} from './contracts';

type RequestInitLike = RequestInit & {
  headers?: Record<string, string>;
};

function resolveDefaultBaseUrl(): string {
  const globalBag = globalThis as typeof globalThis & {
    __PROMPTSCAPE_API_BASE_URL__?: unknown;
  };
  const candidate = globalBag.__PROMPTSCAPE_API_BASE_URL__;
  return typeof candidate === 'string' ? candidate : '';
}

function resolveDefaultAuthToken(): string | undefined {
  const globalBag = globalThis as typeof globalThis & {
    __PROMPTSCAPE_AUTH_TOKEN__?: unknown;
  };
  const candidate = globalBag.__PROMPTSCAPE_AUTH_TOKEN__;
  return typeof candidate === 'string' && candidate.length > 0
    ? candidate
    : undefined;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export class ApiPsgClient {
  private readonly baseUrl: string;
  private readonly authToken?: string;

  constructor(baseUrl?: string, authToken?: string) {
    this.baseUrl = baseUrl ?? resolveDefaultBaseUrl();
    this.authToken = authToken ?? resolveDefaultAuthToken();
  }

  async getCapabilities(): Promise<PsgCapabilitiesResponse> {
    const response = await fetch(`${this.baseUrl}/api/psg/capabilities`, {
      headers: this.authToken
        ? {
            Authorization: `Bearer ${this.authToken}`
          }
        : undefined
    });
    const payload = await readJson(response);
    if (!response.ok) {
      throw new Error('Failed to load PSG capabilities');
    }
    return PsgCapabilitiesResponseSchema.parse(payload);
  }

  async validate(document: unknown): Promise<PsgValidateResponse> {
    return this.post('/api/psg/validate', { document }, PsgValidateResponseSchema);
  }

  async normalize(document: unknown): Promise<PsgNormalizeResponse> {
    return this.post(
      '/api/psg/normalize',
      { document },
      PsgNormalizeResponseSchema
    );
  }

  async expandCrowd(document: unknown): Promise<PsgExpandCrowdResponse> {
    return this.post(
      '/api/psg/expand-crowd',
      { document },
      PsgExpandCrowdResponseSchema
    );
  }

  async registerAssets(
    document: unknown,
    assets: PsgAssetRef[]
  ): Promise<PsgRegisterAssetsResponse> {
    return this.post(
      '/api/psg/assets/register',
      { document, assets },
      PsgRegisterAssetsResponseSchema
    );
  }

  async deriveAsset(
    document: unknown,
    asset: PsgAssetRef
  ): Promise<PsgDeriveAssetResponse> {
    return this.post(
      '/api/psg/assets/derive',
      { document, asset },
      PsgDeriveAssetResponseSchema
    );
  }

  async assembleScene(document: unknown): Promise<PsgAssembleSceneResponse> {
    return this.post(
      '/api/psg/scene/assemble',
      { document },
      PsgAssembleSceneResponseSchema
    );
  }

  async exportComfy(document: unknown): Promise<PsgExportComfyResponse> {
    return this.post(
      '/api/psg/export/comfy',
      { document },
      PsgExportComfyResponseSchema
    );
  }

  async registerImageBatch(
    document: unknown,
    assets: PsgAssetRef[]
  ): Promise<PsgImageRegisterBatchResponse> {
    return this.post(
      '/api/psg/images/register-batch',
      { document, assets },
      PsgImageRegisterBatchResponseSchema
    );
  }

  async analyzeImages(
    document: unknown,
    assetIds: string[],
    userIntent?: string
  ): Promise<PsgImageAnalyzeResponse> {
    return this.post(
      '/api/psg/images/analyze',
      { document, assetIds, userIntent },
      PsgImageAnalyzeResponseSchema
    );
  }

  async reviewImages(
    document: unknown,
    checkpoint: PsgReviewCheckpoint,
    guidance: PsgReviewGuidance
  ): Promise<PsgImageReviewResponse> {
    return this.post(
      '/api/psg/images/review',
      { document, checkpoint, guidance },
      PsgImageReviewResponseSchema
    );
  }

  async draftImageGraph(
    document: unknown,
    checkpoint: PsgReviewCheckpoint
  ): Promise<PsgImageDraftGraphResponse> {
    return this.post(
      '/api/psg/images/draft-graph',
      { document, checkpoint },
      PsgImageDraftGraphResponseSchema
    );
  }

  async previewImages(
    document: unknown,
    checkpoint: PsgReviewCheckpoint,
    request: PsgImagePreviewRequestBody
  ): Promise<PsgImagePreviewResponse> {
    return this.post(
      '/api/psg/images/preview',
      { document, checkpoint, request },
      PsgImagePreviewResponseSchema
    );
  }

  async generateImageBatch(
    document: unknown,
    checkpoint: PsgReviewCheckpoint,
    request: PsgGenerationBatchRequest
  ): Promise<PsgImageGenerateBatchResponse> {
    return this.post(
      '/api/psg/images/generate-batch',
      { document, checkpoint, request },
      PsgImageGenerateBatchResponseSchema
    );
  }

  private async post<T>(
    path: string,
    body: unknown,
    schema: { parse(value: unknown): T },
    init: RequestInitLike = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken
          ? {
              Authorization: `Bearer ${this.authToken}`
            }
          : {}),
        ...init.headers
      },
      body: JSON.stringify(body),
      ...init
    });

    const payload = await readJson(response);
    if (!response.ok) {
      const message =
        payload && typeof payload === 'object' && 'error' in payload
          ? String((payload as { error?: unknown }).error || 'Request failed')
          : 'Request failed';
      throw new Error(message);
    }

    return schema.parse(payload);
  }
}

import {
  PsgAssembleSceneResponseSchema,
  PsgCapabilitiesResponseSchema,
  PsgDeriveAssetResponseSchema,
  PsgExpandCrowdResponseSchema,
  PsgExportComfyResponseSchema,
  PsgNormalizeResponseSchema,
  PsgRegisterAssetsResponseSchema,
  PsgValidateResponseSchema,
  type PsgAssetRef,
  type PsgAssembleSceneResponse,
  type PsgCapabilitiesResponse,
  type PsgDeriveAssetResponse,
  type PsgExpandCrowdResponse,
  type PsgExportComfyResponse,
  type PsgNormalizeResponse,
  type PsgRegisterAssetsResponse,
  type PsgValidateResponse
} from './contracts';
import {
  getJsonErrorMessage,
  readJsonResponse
} from '../http';

type RequestInitLike = RequestInit & {
  headers?: Record<string, string>;
};

export class ApiPsgClient {
  constructor(private readonly baseUrl = '') {}

  async getCapabilities(): Promise<PsgCapabilitiesResponse> {
    const response = await fetch(`${this.baseUrl}/api/psg/capabilities`);
    const payload = await readJsonResponse(response);
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
        ...init.headers
      },
      body: JSON.stringify(body),
      ...init
    });

    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(getJsonErrorMessage(payload));
    }

    return schema.parse(payload);
  }
}

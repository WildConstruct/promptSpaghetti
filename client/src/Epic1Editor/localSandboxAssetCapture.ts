import type {
  LocalImageBatchResponse,
  LocalImageRuntimeStatus
} from '@promptscape/core/services/localImage';
import type {
  PsgAssetRef,
  PsgSceneAssemblyPlan
} from '@promptscape/core/services/psg';
import type { DerivedSandboxRequest } from './localSandboxPromptDerivation';

export interface LocalSandboxBatchManifest {
  runId: string;
  outputDir: string;
  manifestPath: string;
  prompt: string;
  provider: string;
  count: number;
  seeds: number[];
}

export interface LocalSandboxCapturePayload {
  manifest: LocalSandboxBatchManifest;
  assets: PsgAssetRef[];
  scene: PsgSceneAssemblyPlan;
}

interface BuildLocalSandboxCapturePayloadOptions {
  result: LocalImageBatchResponse;
  runtimeStatus: LocalImageRuntimeStatus | null;
  derivedRequest: DerivedSandboxRequest | null;
  existingScene: PsgSceneAssemblyPlan | null;
}

function createEmptyScene(): PsgSceneAssemblyPlan {
  return {
    stillAssetIds: [],
    motionAssetIds: [],
    placements: [],
    crowdMembers: [],
    renderTargets: []
  };
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}

export function buildLocalSandboxCapturePayload({
  result,
  runtimeStatus,
  derivedRequest,
  existingScene
}: BuildLocalSandboxCapturePayloadOptions): LocalSandboxCapturePayload {
  const generatedAt = new Date().toISOString();
  const manifest: LocalSandboxBatchManifest = {
    runId: result.runId,
    outputDir: result.outputDir,
    manifestPath: result.manifestPath,
    prompt: result.prompt,
    provider: result.provider,
    count: result.count,
    seeds: result.items.map(item => item.seed)
  };

  const assets: PsgAssetRef[] = result.items.map(item => ({
    id: `${result.runId}-seed-${item.seed}`,
    kind: 'render-output',
    role: `Local sandbox render ${item.index + 1}`,
    storage: {
      provider: 'local',
      uri: `local-image://${result.runId}/${item.filename}`,
      contentType: 'image/png'
    },
    provenance: {
      source: 'generated',
      vendor: 'Comfy',
      model: runtimeStatus?.checkpoint,
      workflowId: result.runId,
      generatedAt
    },
    tags: uniqueStrings(
      [
        'local-sandbox',
        derivedRequest?.isCanonicalTreeFlow ? 'tree-demo' : 'graph-derived'
      ].filter(Boolean) as string[]
    ),
    metadata: {
      index: item.index,
      seed: item.seed,
      prompt: item.prompt,
      fileName: item.filename,
      outputPath: item.outputPath,
      localPreviewUrl: item.downloadUrl,
      localSandboxRunId: result.runId,
      localSandboxManifestPath: result.manifestPath,
      localSandboxProvider: result.provider,
      localSandboxDerivedSource: derivedRequest?.sourceLabel,
      localSandboxDerivedSummary: derivedRequest?.variationSummaries || []
    }
  }));

  const currentScene = existingScene || createEmptyScene();
  const scene: PsgSceneAssemblyPlan = {
    ...currentScene,
    stillAssetIds: uniqueStrings([
      ...currentScene.stillAssetIds,
      ...assets.map(asset => asset.id)
    ])
  };

  return {
    manifest,
    assets,
    scene
  };
}

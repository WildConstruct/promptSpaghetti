import { buildLocalSandboxCapturePayload } from '../localSandboxAssetCapture';
import type { LocalImageBatchResponse } from '@promptscape/core/services/localImage';
import type { PsgSceneAssemblyPlan } from '@promptscape/core/services/psg';
import type { DerivedSandboxRequest } from '../localSandboxPromptDerivation';

describe('buildLocalSandboxCapturePayload', () => {
  it('converts a local sandbox batch into PSG asset refs and still-asset scene ids', () => {
    const result: LocalImageBatchResponse = {
      ok: true,
      provider: 'comfy-local',
      runId: 'tree-run',
      outputDir: 'C:/tmp/tree-run',
      manifestPath: 'C:/tmp/tree-run/manifest.json',
      prompt: 'oak tree archetype',
      count: 2,
      items: [
        {
          index: 0,
          seed: 1200,
          prompt: 'oak tree archetype',
          provider: 'comfy-local',
          filename: '01-seed-1200.png',
          outputPath: 'C:/tmp/tree-run/01-seed-1200.png',
          downloadUrl: '/api/local-image/files/tree-run/01-seed-1200.png'
        },
        {
          index: 1,
          seed: 1201,
          prompt: 'oak tree archetype',
          provider: 'comfy-local',
          filename: '02-seed-1201.png',
          outputPath: 'C:/tmp/tree-run/02-seed-1201.png',
          downloadUrl: '/api/local-image/files/tree-run/02-seed-1201.png'
        }
      ]
    };
    const derivedRequest: DerivedSandboxRequest = {
      status: 'ready',
      sourceLabel: 'Supported v1 tree archetype flow',
      sourceDescription: 'ready',
      prompt: 'oak tree archetype',
      negativePrompt: 'blurry',
      count: 20,
      startSeed: 1200,
      labelPrefix: 'tree-family-demo',
      basePrompt: 'oak tree archetype',
      variationSummaries: ['silhouette: broad | narrow'],
      missingReasons: [],
      isCanonicalTreeFlow: true
    };
    const existingScene: PsgSceneAssemblyPlan = {
      stillAssetIds: ['existing-still'],
      motionAssetIds: [],
      placements: [],
      crowdMembers: [],
      renderTargets: []
    };

    const capture = buildLocalSandboxCapturePayload({
      result,
      runtimeStatus: {
        ok: true,
        provider: 'comfy-local',
        available: true,
        checkpoint: 'sd_xl_base_1.0.safetensors',
        defaultCount: 20,
        maxCount: 20
      },
      derivedRequest,
      existingScene
    });

    expect(capture.manifest).toMatchObject({
      runId: 'tree-run',
      manifestPath: 'C:/tmp/tree-run/manifest.json',
      seeds: [1200, 1201]
    });
    expect(capture.assets).toHaveLength(2);
    expect(capture.assets[0]).toMatchObject({
      kind: 'render-output',
      storage: {
        provider: 'local',
        uri: 'local-image://tree-run/01-seed-1200.png'
      },
      metadata: expect.objectContaining({
        localPreviewUrl: '/api/local-image/files/tree-run/01-seed-1200.png',
        localSandboxManifestPath: 'C:/tmp/tree-run/manifest.json'
      })
    });
    expect(capture.scene.stillAssetIds).toEqual(
      expect.arrayContaining([
        'existing-still',
        'tree-run-seed-1200',
        'tree-run-seed-1201'
      ])
    );
  });
});

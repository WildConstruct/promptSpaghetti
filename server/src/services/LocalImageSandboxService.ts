import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import {
  LOCAL_IMAGE_DEFAULT_COUNT,
  LOCAL_IMAGE_MAX_COUNT,
  LOCAL_IMAGE_PINNED_CHECKPOINT,
  type LocalImageCheckpointStatus,
  LocalImageBatchRequestSchema,
  type LocalImageBatchItem,
  type LocalImageBatchRequest,
  type LocalImageBatchResponse,
  type LocalImageRuntimeStatus
} from '../../../packages/core/services/localImage/contracts';
import {
  parseBoolean,
  readEnvNumber,
  readEnvVar
} from '../../../packages/core/utils/env';

type ComfyPromptResponse = {
  prompt_id: string;
};

type ComfyHistoryImage = {
  filename: string;
  subfolder: string;
  type: string;
};

type ComfyHistoryNodeOutput = {
  images?: ComfyHistoryImage[];
};

type ComfyHistoryResponse = Record<
  string,
  {
    outputs?: Record<string, ComfyHistoryNodeOutput>;
  }
>;

type FetchLike = typeof fetch;

export interface LocalImageSandboxServiceDeps {
  fetchImpl?: FetchLike;
  now?: () => number;
}

type GenerationResult = {
  filename: string;
  outputPath: string;
  downloadUrl: string;
};

type LocalImageRuntimeConfig = {
  enabled: boolean;
  apiUrl: string;
  outputDir: string;
  checkpoint: string;
};

type LocalImageComfySettings = {
  steps: number;
  cfg: number;
  sampler: string;
  scheduler: string;
  timeoutMs: number;
  pollMs: number;
  negativePrompt: string;
  width: number;
  height: number;
};

const DEFAULT_WIDTH = 1024;
const DEFAULT_HEIGHT = 1024;
const DEFAULT_NEGATIVE_PROMPT = '';
const DEFAULT_STEPS = 4;
const DEFAULT_CFG = 1;
const DEFAULT_SAMPLER = 'euler';
const DEFAULT_SCHEDULER = 'normal';
const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_POLL_MS = 1_500;
const DEFAULT_STATUS_TIMEOUT_MS = 5_000;

type RuntimeProbeResult = {
  runtimeReachable: boolean;
  checkpointStatus: LocalImageCheckpointStatus;
  availableCheckpoints: string[];
  lastError?: string;
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sanitizePathSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'local-image-batch';
}

export class LocalImageSandboxService {
  private readonly fetchImpl: FetchLike;
  private readonly now: () => number;

  constructor(deps: LocalImageSandboxServiceDeps = {}) {
    this.fetchImpl = deps.fetchImpl ?? fetch;
    this.now = deps.now ?? Date.now;
  }

  private getRuntimeConfig(): LocalImageRuntimeConfig {
    return {
      enabled: parseBoolean(readEnvVar('ENABLE_LOCAL_IMAGE_SANDBOX'), false),
      apiUrl: readEnvVar('LOCAL_IMAGE_COMFY_API_URL') || 'http://127.0.0.1:8188',
      outputDir: path.resolve(
        process.cwd(),
        readEnvVar('LOCAL_IMAGE_OUTPUT_DIR') || '.local-output/local-image-sandbox'
      ),
      checkpoint:
        readEnvVar('LOCAL_IMAGE_COMFY_CHECKPOINT') || LOCAL_IMAGE_PINNED_CHECKPOINT
    };
  }

  private getComfySettings(): LocalImageComfySettings {
    return {
      steps: readEnvNumber('LOCAL_IMAGE_COMFY_STEPS', DEFAULT_STEPS),
      cfg: readEnvNumber('LOCAL_IMAGE_COMFY_CFG', DEFAULT_CFG),
      sampler: readEnvVar('LOCAL_IMAGE_COMFY_SAMPLER') || DEFAULT_SAMPLER,
      scheduler: readEnvVar('LOCAL_IMAGE_COMFY_SCHEDULER') || DEFAULT_SCHEDULER,
      timeoutMs: readEnvNumber('LOCAL_IMAGE_COMFY_TIMEOUT_MS', DEFAULT_TIMEOUT_MS),
      pollMs: readEnvNumber('LOCAL_IMAGE_COMFY_POLL_MS', DEFAULT_POLL_MS),
      negativePrompt: DEFAULT_NEGATIVE_PROMPT,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT
    };
  }

  async getStatus(): Promise<LocalImageRuntimeStatus> {
    const config = this.getRuntimeConfig();
    const outputDirWritable = await this.ensureOutputDirWritable(config.outputDir);

    if (!config.enabled) {
      return {
        ok: true,
        provider: 'comfy-local',
        available: false,
        reason:
          'Local sandbox generation is disabled. Set ENABLE_LOCAL_IMAGE_SANDBOX=true to enable it.',
        apiUrl: config.apiUrl,
        outputDir: config.outputDir,
        checkpoint: config.checkpoint,
        checkpointStatus: 'unknown',
        runtimeReachable: false,
        outputDirWritable,
        defaultCount: LOCAL_IMAGE_DEFAULT_COUNT,
        maxCount: LOCAL_IMAGE_MAX_COUNT
      };
    }

    if (!outputDirWritable) {
      return {
        ok: true,
        provider: 'comfy-local',
        available: false,
        reason:
          `Local sandbox generation output folder is not writable: ${config.outputDir}.`,
        apiUrl: config.apiUrl,
        outputDir: config.outputDir,
        checkpoint: config.checkpoint,
        checkpointStatus: 'unknown',
        runtimeReachable: false,
        outputDirWritable,
        lastError: `Failed to prepare output directory: ${config.outputDir}`,
        defaultCount: LOCAL_IMAGE_DEFAULT_COUNT,
        maxCount: LOCAL_IMAGE_MAX_COUNT
      };
    }

    const runtimeProbe = await this.probeComfyRuntime(
      config.apiUrl,
      config.checkpoint
    );

    if (!runtimeProbe.runtimeReachable) {
      return {
        ok: true,
        provider: 'comfy-local',
        available: false,
        reason:
          `Local Comfy runtime is unreachable at ${config.apiUrl}. Start the supported local runtime before generating.`,
        apiUrl: config.apiUrl,
        outputDir: config.outputDir,
        checkpoint: config.checkpoint,
        checkpointStatus: runtimeProbe.checkpointStatus,
        runtimeReachable: false,
        outputDirWritable,
        lastError: runtimeProbe.lastError,
        defaultCount: LOCAL_IMAGE_DEFAULT_COUNT,
        maxCount: LOCAL_IMAGE_MAX_COUNT
      };
    }

    if (runtimeProbe.checkpointStatus !== 'ready') {
      const checkpointReason =
        runtimeProbe.checkpointStatus === 'mismatch'
          ? `Local Comfy runtime is reachable, but the pinned checkpoint "${config.checkpoint}" is not available. Found: ${runtimeProbe.availableCheckpoints.slice(0, 5).join(', ')}.`
          : `Local Comfy runtime is reachable, but the pinned checkpoint "${config.checkpoint}" is missing.`;

      return {
        ok: true,
        provider: 'comfy-local',
        available: false,
        reason: checkpointReason,
        apiUrl: config.apiUrl,
        outputDir: config.outputDir,
        checkpoint: config.checkpoint,
        checkpointStatus: runtimeProbe.checkpointStatus,
        runtimeReachable: true,
        outputDirWritable,
        lastError: runtimeProbe.lastError,
        defaultCount: LOCAL_IMAGE_DEFAULT_COUNT,
        maxCount: LOCAL_IMAGE_MAX_COUNT
      };
    }

    return {
      ok: true,
      provider: 'comfy-local',
      available: true,
      apiUrl: config.apiUrl,
      outputDir: config.outputDir,
      checkpoint: config.checkpoint,
      checkpointStatus: 'ready',
      runtimeReachable: true,
      outputDirWritable,
      defaultCount: LOCAL_IMAGE_DEFAULT_COUNT,
      maxCount: LOCAL_IMAGE_MAX_COUNT
    };
  }

  async generateBatch(
    request: LocalImageBatchRequest
  ): Promise<LocalImageBatchResponse> {
    const status = await this.getStatus();
    if (!status.available) {
      throw new Error(
        status.reason ||
          'Local sandbox generation is not available in this runtime.'
      );
    }

    const parsed = LocalImageBatchRequestSchema.parse({
      count: LOCAL_IMAGE_DEFAULT_COUNT,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      ...request
    });
    const runtimeConfig = this.getRuntimeConfig();
    const comfySettings = this.getComfySettings();
    const runId = `local-image-${sanitizePathSegment(
      parsed.labelPrefix || 'tree-batch'
    )}-${this.now()}-${randomUUID().slice(0, 8)}`;
    const runOutputDir = path.join(runtimeConfig.outputDir, runId);
    await mkdir(runOutputDir, { recursive: true });

    const items: LocalImageBatchItem[] = [];
    const startSeed =
      typeof parsed.startSeed === 'number'
        ? parsed.startSeed
        : Math.floor(this.now() / 1000);

    for (let index = 0; index < parsed.count; index += 1) {
      const seed = startSeed + index;
      const result = await this.generateSingle({
        request: parsed,
        runId,
        runOutputDir,
        index,
        seed,
        runtimeConfig,
        comfySettings
      });
      items.push({
        index,
        seed,
        prompt: parsed.prompt,
        provider: 'comfy-local',
        filename: result.filename,
        outputPath: result.outputPath,
        downloadUrl: result.downloadUrl
      });
    }

    const response: LocalImageBatchResponse = {
      ok: true,
      provider: 'comfy-local',
      runId,
      outputDir: runOutputDir,
      manifestPath: path.join(runOutputDir, 'manifest.json'),
      prompt: parsed.prompt,
      count: parsed.count,
      items
    };

    await writeFile(
      path.join(runOutputDir, 'manifest.json'),
      JSON.stringify(response, null, 2),
      'utf8'
    );

    return response;
  }

  async readGeneratedFile(runId: string, filename: string): Promise<Buffer> {
    const filePath = path.join(this.getRuntimeConfig().outputDir, runId, filename);
    return readFile(filePath);
  }

  private async ensureOutputDirWritable(outputDir: string) {
    try {
      await mkdir(outputDir, { recursive: true });
      return true;
    } catch {
      return false;
    }
  }

  private async fetchJson(url: string, timeoutMs = DEFAULT_STATUS_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  private async probeComfyRuntime(
    apiUrl: string,
    checkpoint: string
  ): Promise<RuntimeProbeResult> {
    try {
      await this.fetchJson(`${apiUrl}/system_stats`);
    } catch (error) {
      return {
        runtimeReachable: false,
        checkpointStatus: 'unknown',
        availableCheckpoints: [],
        lastError: error instanceof Error ? error.message : 'Runtime probe failed'
      };
    }

    try {
      const payload = await this.fetchJson(
        `${apiUrl}/object_info/CheckpointLoaderSimple`
      );
      const availableCheckpoints = this.extractCheckpointNames(payload);
      const checkpointStatus: LocalImageCheckpointStatus =
        availableCheckpoints.includes(checkpoint)
          ? 'ready'
          : availableCheckpoints.length > 0
            ? 'mismatch'
            : 'missing';

      return {
        runtimeReachable: true,
        checkpointStatus,
        availableCheckpoints
      };
    } catch (error) {
      return {
        runtimeReachable: true,
        checkpointStatus: 'unknown',
        availableCheckpoints: [],
        lastError:
          error instanceof Error
            ? error.message
            : 'Checkpoint compatibility probe failed'
      };
    }
  }

  private extractCheckpointNames(payload: unknown): string[] {
    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const asRecord = payload as Record<string, unknown>;
    const candidatePaths = [
      asRecord.input,
      asRecord.CheckpointLoaderSimple,
      asRecord.CheckpointLoaderSimple &&
      typeof asRecord.CheckpointLoaderSimple === 'object'
        ? (asRecord.CheckpointLoaderSimple as Record<string, unknown>).input
        : null
    ];

    for (const candidate of candidatePaths) {
      if (!candidate || typeof candidate !== 'object') {
        continue;
      }

      const required = (candidate as Record<string, unknown>).required;
      if (!required || typeof required !== 'object') {
        continue;
      }

      const checkpointField = (required as Record<string, unknown>).ckpt_name;
      if (!Array.isArray(checkpointField) || checkpointField.length === 0) {
        continue;
      }

      const names = checkpointField[0];
      if (Array.isArray(names)) {
        return names.filter((entry): entry is string => typeof entry === 'string');
      }
    }

    return [];
  }

  private async generateSingle({
    request,
    runId,
    runOutputDir,
    index,
    seed,
    runtimeConfig,
    comfySettings
  }: {
    request: LocalImageBatchRequest;
    runId: string;
    runOutputDir: string;
    index: number;
    seed: number;
    runtimeConfig: LocalImageRuntimeConfig;
    comfySettings: LocalImageComfySettings;
  }): Promise<GenerationResult> {
    const promptPayload = this.buildComfyPromptPayload({
      request,
      runId,
      index,
      seed,
      runtimeConfig,
      comfySettings
    });

    const promptResponse = await this.fetchImpl(`${runtimeConfig.apiUrl}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(promptPayload)
    });

    if (!promptResponse.ok) {
      throw new Error(
        `Local Comfy runtime rejected the batch request with ${promptResponse.status}.`
      );
    }

    const promptResult =
      (await promptResponse.json()) as ComfyPromptResponse;
    if (!promptResult.prompt_id) {
      throw new Error('Local Comfy runtime did not return a prompt id.');
    }

    const imageRef = await this.waitForGeneratedImage(
      runtimeConfig.apiUrl,
      comfySettings,
      promptResult.prompt_id
    );
    const imageResponse = await this.fetchImpl(
      `${runtimeConfig.apiUrl}/view?filename=${encodeURIComponent(
        imageRef.filename
      )}&subfolder=${encodeURIComponent(
        imageRef.subfolder || ''
      )}&type=${encodeURIComponent(imageRef.type || 'output')}`
    );

    if (!imageResponse.ok) {
      throw new Error(
        `Local Comfy runtime did not return generated image data for ${imageRef.filename}.`
      );
    }

    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const extension = path.extname(imageRef.filename) || '.png';
    const filename = `${String(index + 1).padStart(2, '0')}-seed-${seed}${extension}`;
    const outputPath = path.join(runOutputDir, filename);
    await writeFile(outputPath, buffer);

    return {
      filename,
      outputPath,
      downloadUrl: `/api/local-image/files/${encodeURIComponent(
        runId
      )}/${encodeURIComponent(filename)}`
    };
  }

  private buildComfyPromptPayload({
    request,
    runId,
    index,
    seed,
    runtimeConfig,
    comfySettings
  }: {
    request: LocalImageBatchRequest;
    runId: string;
    index: number;
    seed: number;
    runtimeConfig: LocalImageRuntimeConfig;
    comfySettings: LocalImageComfySettings;
  }) {
    const filenamePrefix = `${sanitizePathSegment(
      request.labelPrefix || 'tree-batch'
    )}-${index + 1}`;

    return {
      client_id: runId,
      prompt: {
        '4': {
          inputs: {
            ckpt_name: runtimeConfig.checkpoint
          },
          class_type: 'CheckpointLoaderSimple'
        },
        '5': {
          inputs: {
            width: request.width || comfySettings.width,
            height: request.height || comfySettings.height,
            batch_size: 1
          },
          class_type: 'EmptyLatentImage'
        },
        '6': {
          inputs: {
            text: request.prompt,
            clip: ['4', 1]
          },
          class_type: 'CLIPTextEncode'
        },
        '7': {
          inputs: {
            text: request.negativePrompt || comfySettings.negativePrompt,
            clip: ['4', 1]
          },
          class_type: 'CLIPTextEncode'
        },
        '3': {
          inputs: {
            seed,
            steps: comfySettings.steps,
            cfg: comfySettings.cfg,
            sampler_name: comfySettings.sampler,
            scheduler: comfySettings.scheduler,
            denoise: 1,
            model: ['4', 0],
            positive: ['6', 0],
            negative: ['7', 0],
            latent_image: ['5', 0]
          },
          class_type: 'KSampler'
        },
        '8': {
          inputs: {
            samples: ['3', 0],
            vae: ['4', 2]
          },
          class_type: 'VAEDecode'
        },
        '9': {
          inputs: {
            filename_prefix: filenamePrefix,
            images: ['8', 0]
          },
          class_type: 'SaveImage'
        }
      }
    };
  }

  private async waitForGeneratedImage(
    apiUrl: string,
    comfySettings: LocalImageComfySettings,
    promptId: string
  ) {
    const deadline = this.now() + comfySettings.timeoutMs;

    while (this.now() < deadline) {
      const historyResponse = await this.fetchImpl(`${apiUrl}/history/${promptId}`);
      if (historyResponse.ok) {
        const history = (await historyResponse.json()) as ComfyHistoryResponse;
        const run = history[promptId];
        const image = run
          ? Object.values(run.outputs || {})
              .flatMap(output => output.images || [])
              .find(candidate => candidate.filename)
          : null;

        if (image) {
          return image;
        }
      }

      await sleep(comfySettings.pollMs);
    }

    throw new Error(
      'Local Comfy runtime timed out before returning generated images.'
    );
  }
}

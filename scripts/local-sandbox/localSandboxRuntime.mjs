import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { randomUUID } from 'node:crypto';

import {
  LOCAL_SANDBOX_DEFAULT_API_URL,
  LOCAL_SANDBOX_DEFAULT_COUNT,
  LOCAL_SANDBOX_DEFAULT_OUTPUT_DIR,
  LOCAL_SANDBOX_DEFAULT_START_SEED,
  LOCAL_SANDBOX_ENV_FILES,
  LOCAL_SANDBOX_PINNED_CHECKPOINT,
  LOCAL_SANDBOX_PROBE_NEGATIVE_PROMPT,
  LOCAL_SANDBOX_PROBE_PROMPT,
  LOCAL_SANDBOX_STATUS_TIMEOUT_MS,
  LOCAL_SANDBOX_TEMPLATE_PATH
} from './localSandbox.config.mjs';

function readEnvBoolean(value, fallback) {
  if (!value) {
    return fallback;
  }

  switch (value.trim().toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'on':
      return true;
    case '0':
    case 'false':
    case 'no':
    case 'off':
      return false;
    default:
      return fallback;
  }
}

function sanitizePathSegment(value) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'local-sandbox'
  );
}

function applyEnvContents(contents) {
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

export async function loadLocalSandboxEnv(cwd = process.cwd()) {
  for (const relativePath of LOCAL_SANDBOX_ENV_FILES) {
    const absolutePath = path.resolve(cwd, relativePath);
    try {
      const contents = await readFile(absolutePath, 'utf8');
      applyEnvContents(contents);
    } catch {}
  }
}

function getFetchTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timer);
    }
  };
}

async function fetchJson(url, timeoutMs = LOCAL_SANDBOX_STATUS_TIMEOUT_MS) {
  const { signal, cleanup } = getFetchTimeoutSignal(timeoutMs);
  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    return await response.json();
  } finally {
    cleanup();
  }
}

function extractCheckpointNames(payload) {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const asRecord = payload;
  const candidateInputs = [
    asRecord.input,
    asRecord.CheckpointLoaderSimple,
    asRecord.CheckpointLoaderSimple &&
    typeof asRecord.CheckpointLoaderSimple === 'object'
      ? asRecord.CheckpointLoaderSimple.input
      : null
  ];

  for (const candidate of candidateInputs) {
    if (!candidate || typeof candidate !== 'object') {
      continue;
    }

    const required = candidate.required;
    if (!required || typeof required !== 'object') {
      continue;
    }

    const checkpointField = required.ckpt_name;
    if (!Array.isArray(checkpointField) || checkpointField.length === 0) {
      continue;
    }

    const names = checkpointField[0];
    if (Array.isArray(names)) {
      return names.filter(entry => typeof entry === 'string');
    }
  }

  return [];
}

function buildProbeWorkflow({ checkpoint, seed, filenamePrefix }) {
  return {
    client_id: `local-sandbox-probe-${randomUUID().slice(0, 8)}`,
    prompt: {
      '4': {
        inputs: {
          ckpt_name: checkpoint
        },
        class_type: 'CheckpointLoaderSimple'
      },
      '5': {
        inputs: {
          width: 768,
          height: 768,
          batch_size: 1
        },
        class_type: 'EmptyLatentImage'
      },
      '6': {
        inputs: {
          text: LOCAL_SANDBOX_PROBE_PROMPT,
          clip: ['4', 1]
        },
        class_type: 'CLIPTextEncode'
      },
      '7': {
        inputs: {
          text: LOCAL_SANDBOX_PROBE_NEGATIVE_PROMPT,
          clip: ['4', 1]
        },
        class_type: 'CLIPTextEncode'
      },
      '3': {
        inputs: {
          seed,
          steps: 20,
          cfg: 7,
          sampler_name: 'euler',
          scheduler: 'normal',
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

async function waitForProbeImage(apiUrl, promptId, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const history = await fetchJson(`${apiUrl}/history/${promptId}`);
    const run = history[promptId];
    const image = run
      ? Object.values(run.outputs || {})
          .flatMap(output => output.images || [])
          .find(candidate => candidate.filename)
      : null;

    if (image) {
      return image;
    }

    await new Promise(resolve => setTimeout(resolve, 1_500));
  }

  throw new Error('Timed out waiting for the local Comfy probe image.');
}

export function getLocalSandboxConfig(cwd = process.cwd()) {
  const apiUrl =
    process.env.LOCAL_IMAGE_COMFY_API_URL || LOCAL_SANDBOX_DEFAULT_API_URL;
  const checkpoint =
    process.env.LOCAL_IMAGE_COMFY_CHECKPOINT || LOCAL_SANDBOX_PINNED_CHECKPOINT;
  const outputDir = path.resolve(
    cwd,
    process.env.LOCAL_IMAGE_OUTPUT_DIR || LOCAL_SANDBOX_DEFAULT_OUTPUT_DIR
  );

  return {
    cwd,
    enabled: readEnvBoolean(process.env.ENABLE_LOCAL_IMAGE_SANDBOX, false),
    apiUrl,
    checkpoint,
    outputDir
  };
}

export async function runLocalSandboxPreflight(cwd = process.cwd()) {
  await loadLocalSandboxEnv(cwd);
  const config = getLocalSandboxConfig(cwd);
  let outputDirWritable = false;

  try {
    await mkdir(config.outputDir, { recursive: true });
    outputDirWritable = true;
  } catch {}

  if (!config.enabled) {
    return {
      ...config,
      available: false,
      runtimeReachable: false,
      checkpointStatus: 'unknown',
      outputDirWritable,
      reason:
        'Local sandbox generation is disabled. Set ENABLE_LOCAL_IMAGE_SANDBOX=true in a local sandbox env file.',
      templatePath: path.resolve(cwd, LOCAL_SANDBOX_TEMPLATE_PATH)
    };
  }

  if (!outputDirWritable) {
    return {
      ...config,
      available: false,
      runtimeReachable: false,
      checkpointStatus: 'unknown',
      outputDirWritable,
      reason: `Local sandbox output directory is not writable: ${config.outputDir}`,
      templatePath: path.resolve(cwd, LOCAL_SANDBOX_TEMPLATE_PATH)
    };
  }

  let runtimeReachable = false;
  let availableCheckpoints = [];
  let checkpointStatus = 'unknown';
  let lastError;

  try {
    await fetchJson(`${config.apiUrl}/system_stats`);
    runtimeReachable = true;
  } catch (error) {
    lastError = error instanceof Error ? error.message : 'Runtime probe failed';
  }

  if (!runtimeReachable) {
    return {
      ...config,
      available: false,
      runtimeReachable,
      checkpointStatus,
      availableCheckpoints,
      outputDirWritable,
      lastError,
      reason: `Local Comfy runtime is unreachable at ${config.apiUrl}.`,
      templatePath: path.resolve(cwd, LOCAL_SANDBOX_TEMPLATE_PATH)
    };
  }

  try {
    const objectInfo = await fetchJson(
      `${config.apiUrl}/object_info/CheckpointLoaderSimple`
    );
    availableCheckpoints = extractCheckpointNames(objectInfo);
    checkpointStatus = availableCheckpoints.includes(config.checkpoint)
      ? 'ready'
      : availableCheckpoints.length > 0
        ? 'mismatch'
        : 'missing';
  } catch (error) {
    lastError = error instanceof Error ? error.message : 'Checkpoint probe failed';
  }

  const available = checkpointStatus === 'ready';
  const reason = available
    ? 'Local sandbox runtime is ready for the pinned tree demo.'
    : checkpointStatus === 'mismatch'
      ? `Pinned checkpoint "${config.checkpoint}" was not found. Available checkpoints: ${availableCheckpoints.slice(0, 5).join(', ')}.`
      : checkpointStatus === 'missing'
        ? `Pinned checkpoint "${config.checkpoint}" was not found in the local Comfy runtime.`
        : 'Local Comfy runtime is reachable, but checkpoint compatibility could not be verified.';

  return {
    ...config,
    available,
    runtimeReachable,
    checkpointStatus,
    availableCheckpoints,
    outputDirWritable,
    lastError,
    reason,
    templatePath: path.resolve(cwd, LOCAL_SANDBOX_TEMPLATE_PATH)
  };
}

export function formatPreflightSummary(result) {
  const lines = [
    'Local sandbox runtime preflight',
    `- Enabled: ${result.enabled}`,
    `- API URL: ${result.apiUrl}`,
    `- Output dir: ${result.outputDir}`,
    `- Output dir writable: ${result.outputDirWritable}`,
    `- Runtime reachable: ${result.runtimeReachable}`,
    `- Pinned checkpoint: ${result.checkpoint}`,
    `- Checkpoint status: ${result.checkpointStatus}`,
    `- Ready: ${result.available}`,
    `- Reason: ${result.reason}`
  ];

  if (result.availableCheckpoints?.length) {
    lines.push(
      `- Available checkpoints: ${result.availableCheckpoints.slice(0, 8).join(', ')}`
    );
  }

  if (result.lastError) {
    lines.push(`- Last error: ${result.lastError}`);
  }

  lines.push(`- Env template: ${result.templatePath}`);
  return lines.join('\n');
}

export async function runLiveProbe(cwd = process.cwd()) {
  const preflight = await runLocalSandboxPreflight(cwd);

  if (!preflight.available) {
    const error = new Error(preflight.reason);
    error.preflight = preflight;
    throw error;
  }

  const seed = LOCAL_SANDBOX_DEFAULT_START_SEED;
  const filenamePrefix = `${sanitizePathSegment('tree-demo-probe')}-${seed}`;
  const promptResponse = await fetch(`${preflight.apiUrl}/prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      buildProbeWorkflow({
        checkpoint: preflight.checkpoint,
        seed,
        filenamePrefix
      })
    )
  });

  if (!promptResponse.ok) {
    throw new Error(
      `Live probe request failed with ${promptResponse.status} at ${preflight.apiUrl}/prompt.`
    );
  }

  const promptPayload = await promptResponse.json();
  const promptId = promptPayload.prompt_id;

  if (!promptId) {
    throw new Error('Live probe did not receive a prompt id from the local runtime.');
  }

  const imageRef = await waitForProbeImage(preflight.apiUrl, promptId);
  const imageResponse = await fetch(
    `${preflight.apiUrl}/view?filename=${encodeURIComponent(
      imageRef.filename
    )}&subfolder=${encodeURIComponent(
      imageRef.subfolder || ''
    )}&type=${encodeURIComponent(imageRef.type || 'output')}`
  );

  if (!imageResponse.ok) {
    throw new Error(
      `Live probe image download failed with ${imageResponse.status}.`
    );
  }

  const probeDir = path.join(preflight.outputDir, 'live-probe');
  await mkdir(probeDir, { recursive: true });
  const extension = path.extname(imageRef.filename) || '.png';
  const outputPath = path.join(
    probeDir,
    `tree-demo-probe-seed-${seed}${extension}`
  );
  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  await writeFile(outputPath, buffer);

  return {
    ...preflight,
    probeSeed: seed,
    probePrompt: LOCAL_SANDBOX_PROBE_PROMPT,
    probeOutputPath: outputPath
  };
}

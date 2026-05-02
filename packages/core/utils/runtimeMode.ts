import type {
  LLMCapability,
  LLMStatusResponse
} from '../services/llm';
import type {
  PsgCapabilitiesResponse
} from '../services/psg';
import type { LocalImageRuntimeStatus } from '../services/localImage';
import {
  parseBoolean,
  readEnvVar
} from './env';
import { getSupabaseConfig } from './supabaseFeature';

type PsgOperation = PsgCapabilitiesResponse['operations'][number];

export const LOCAL_PSG_OPERATIONS: PsgOperation[] = [
  'validate',
  'normalize',
  'export-comfy'
];

export const HOSTED_PSG_UPGRADE_OPERATIONS: PsgOperation[] = ['expand-crowd'];

export type RuntimeMode = 'local' | 'cloud';
export type LLMAccessMode = 'offline' | 'local-byo' | 'cloud';
export type PsgAccessMode = 'offline' | 'local' | 'cloud';
export type LocalImageAccessMode = 'offline' | 'local';
export type SubscriptionState = 'unknown' | 'inactive' | 'active';

export interface RuntimeFeatureFlags {
  authEnabled: boolean;
  authRequired: boolean;
  supabaseEnabled: boolean;
  cloudLlmEnabled: boolean;
  localLlmEnabled: boolean;
  cloudPsgEnabled: boolean;
  localPsgEnabled: boolean;
  subscriptionsEnabled: boolean;
  subscriptionRequiredForCloud: boolean;
}

export interface RuntimeModeInput {
  flags: RuntimeFeatureFlags;
  isAuthenticated: boolean;
  hasSupabase: boolean;
  hasCloudSubscription: boolean;
  llmStatus?: Pick<
    LLMStatusResponse,
    'available' | 'provider' | 'defaultModel' | 'capabilities'
  > | null;
  psgCapabilities?: Pick<
    PsgCapabilitiesResponse,
    'supportedKinds' | 'operations' | 'exportTargets'
  > | null;
  localImageStatus?: Pick<
    LocalImageRuntimeStatus,
    | 'available'
    | 'provider'
    | 'reason'
    | 'outputDir'
    | 'apiUrl'
    | 'checkpoint'
    | 'checkpointStatus'
    | 'runtimeReachable'
    | 'outputDirWritable'
    | 'lastError'
    | 'defaultCount'
    | 'maxCount'
  > | null;
}

export interface RuntimeModeStatus {
  mode: RuntimeMode;
  auth: {
    enabled: boolean;
    required: boolean;
    isAuthenticated: boolean;
  };
  subscription: {
    enabled: boolean;
    requiredForCloud: boolean;
    state: SubscriptionState;
  };
  supabase: {
    enabled: boolean;
    configured: boolean;
    cloudSyncAvailable: boolean;
  };
  llm: {
    accessMode: LLMAccessMode;
    available: boolean;
    provider?: string;
    defaultModel?: string | null;
    capabilities: LLMCapability[];
    usesProxy: boolean;
  };
  psg: {
    accessMode: PsgAccessMode;
    available: boolean;
    supportedKinds: PsgCapabilitiesResponse['supportedKinds'];
    operations: PsgCapabilitiesResponse['operations'];
    exportTargets: PsgCapabilitiesResponse['exportTargets'];
    usesProxy: boolean;
    cloudAvailable: boolean;
    localAvailable: boolean;
    localOperations: PsgOperation[];
    hostedUpgradeOperations: PsgOperation[];
  };
  localImage: {
    accessMode: LocalImageAccessMode;
    available: boolean;
    provider?: string;
    reason?: string;
    outputDir?: string;
    apiUrl?: string;
    checkpoint?: string;
    checkpointStatus?: LocalImageRuntimeStatus['checkpointStatus'];
    runtimeReachable?: boolean;
    outputDirWritable?: boolean;
    lastError?: string;
    defaultCount?: number;
    maxCount?: number;
  };
}

export function getRuntimeFeatureFlags(): RuntimeFeatureFlags {
  const supabaseConfig = getSupabaseConfig();

  return {
    authEnabled: parseBoolean(
      readEnvVar('NEXT_PUBLIC_FEATURE_AUTH') ?? readEnvVar('VITE_FEATURE_AUTH'),
      false
    ),
    authRequired: parseBoolean(
      readEnvVar('NEXT_PUBLIC_REQUIRE_AUTH') ?? readEnvVar('VITE_REQUIRE_AUTH'),
      false
    ),
    supabaseEnabled: supabaseConfig.enabledByFlag,
    cloudLlmEnabled: parseBoolean(
      readEnvVar('NEXT_PUBLIC_FEATURE_CLOUD_LLM') ??
        readEnvVar('VITE_FEATURE_CLOUD_LLM') ??
        readEnvVar('FEATURE_CLOUD_LLM'),
      true
    ),
    localLlmEnabled: parseBoolean(
      readEnvVar('NEXT_PUBLIC_FEATURE_LOCAL_LLM') ??
        readEnvVar('VITE_FEATURE_LOCAL_LLM') ??
        readEnvVar('FEATURE_LOCAL_LLM'),
      true
    ),
    cloudPsgEnabled: parseBoolean(
      readEnvVar('NEXT_PUBLIC_FEATURE_CLOUD_PSG') ??
        readEnvVar('VITE_FEATURE_CLOUD_PSG') ??
        readEnvVar('FEATURE_CLOUD_PSG'),
      true
    ),
    localPsgEnabled: parseBoolean(
      readEnvVar('NEXT_PUBLIC_FEATURE_LOCAL_PSG') ??
        readEnvVar('VITE_FEATURE_LOCAL_PSG') ??
        readEnvVar('FEATURE_LOCAL_PSG'),
      true
    ),
    subscriptionsEnabled: parseBoolean(
      readEnvVar('NEXT_PUBLIC_FEATURE_SUBSCRIPTIONS') ??
        readEnvVar('VITE_FEATURE_SUBSCRIPTIONS') ??
        readEnvVar('FEATURE_SUBSCRIPTIONS'),
      false
    ),
    subscriptionRequiredForCloud: parseBoolean(
      readEnvVar('NEXT_PUBLIC_REQUIRE_SUBSCRIPTION_FOR_CLOUD') ??
        readEnvVar('VITE_REQUIRE_SUBSCRIPTION_FOR_CLOUD') ??
        readEnvVar('REQUIRE_SUBSCRIPTION_FOR_CLOUD'),
      false
    )
  };
}

export function resolveRuntimeModeStatus(
  input: RuntimeModeInput
): RuntimeModeStatus {
  const {
    flags,
    isAuthenticated,
    hasSupabase,
    hasCloudSubscription,
    llmStatus,
    psgCapabilities,
    localImageStatus
  } = input;

  const cloudAccessAllowed =
    (!flags.authRequired || isAuthenticated) &&
    (!flags.subscriptionRequiredForCloud || hasCloudSubscription);

  const cloudLlmAllowed =
    flags.cloudLlmEnabled &&
    cloudAccessAllowed;

  const cloudPsgAllowed =
    flags.cloudPsgEnabled &&
    cloudAccessAllowed;

  const mode: RuntimeMode =
    flags.supabaseEnabled &&
    hasSupabase &&
    (cloudLlmAllowed || cloudPsgAllowed)
      ? 'cloud'
      : 'local';

  const accessMode: LLMAccessMode = cloudLlmAllowed
    ? 'cloud'
    : flags.localLlmEnabled
      ? 'local-byo'
      : 'offline';

  const psgAccessMode: PsgAccessMode = cloudPsgAllowed
    ? 'cloud'
    : flags.localPsgEnabled
      ? 'local'
      : 'offline';

  const capabilities = Array.isArray(llmStatus?.capabilities)
    ? [...llmStatus.capabilities]
    : [];
  const psgKinds = Array.isArray(psgCapabilities?.supportedKinds)
    ? [...psgCapabilities.supportedKinds]
    : [];
  const remotePsgOperations = Array.isArray(psgCapabilities?.operations)
    ? [...psgCapabilities.operations]
    : [];
  const psgOperations =
    psgAccessMode === 'cloud'
      ? remotePsgOperations
      : flags.localPsgEnabled
        ? [...LOCAL_PSG_OPERATIONS]
        : [];
  const psgExportTargets: PsgCapabilitiesResponse['exportTargets'] = Array.isArray(
    psgCapabilities?.exportTargets
  )
    ? [...psgCapabilities.exportTargets]
    : psgAccessMode === 'local'
      ? (['comfy'] as PsgCapabilitiesResponse['exportTargets'])
      : [];
  const localOperations = flags.localPsgEnabled
    ? [...LOCAL_PSG_OPERATIONS]
    : [];
  const hostedUpgradeOperations = remotePsgOperations.filter(operation =>
    HOSTED_PSG_UPGRADE_OPERATIONS.includes(operation)
  );
  const localImageAccessMode: LocalImageAccessMode =
    localImageStatus?.available ? 'local' : 'offline';

  return {
    mode,
    auth: {
      enabled: flags.authEnabled,
      required: flags.authRequired,
      isAuthenticated
    },
    subscription: {
      enabled: flags.subscriptionsEnabled,
      requiredForCloud: flags.subscriptionRequiredForCloud,
      state: flags.subscriptionsEnabled
        ? hasCloudSubscription
          ? 'active'
          : 'inactive'
        : 'unknown'
    },
    supabase: {
      enabled: flags.supabaseEnabled,
      configured: hasSupabase,
      cloudSyncAvailable: mode === 'cloud' && hasSupabase
    },
    llm: {
      accessMode,
      available:
        accessMode === 'cloud'
          ? Boolean(llmStatus?.available)
          : accessMode === 'local-byo',
      provider: llmStatus?.provider,
      defaultModel: llmStatus?.defaultModel,
      capabilities,
      usesProxy: accessMode === 'cloud'
    },
    psg: {
      accessMode: psgAccessMode,
      available:
        psgAccessMode === 'cloud'
          ? psgOperations.length > 0
          : psgAccessMode === 'local',
      supportedKinds: psgKinds,
      operations: psgOperations,
      exportTargets: psgExportTargets,
      usesProxy: psgAccessMode === 'cloud',
      cloudAvailable: cloudPsgAllowed && psgOperations.length > 0,
      localAvailable: flags.localPsgEnabled,
      localOperations,
      hostedUpgradeOperations
    },
    localImage: {
      accessMode: localImageAccessMode,
      available: Boolean(localImageStatus?.available),
      provider: localImageStatus?.provider,
      reason: localImageStatus?.reason,
      outputDir: localImageStatus?.outputDir,
      apiUrl: localImageStatus?.apiUrl,
      checkpoint: localImageStatus?.checkpoint,
      checkpointStatus: localImageStatus?.checkpointStatus,
      runtimeReachable: localImageStatus?.runtimeReachable,
      outputDirWritable: localImageStatus?.outputDirWritable,
      lastError: localImageStatus?.lastError,
      defaultCount: localImageStatus?.defaultCount,
      maxCount: localImageStatus?.maxCount
    }
  };
}

import { useEffect, useMemo, useState } from 'react';
import { ApiLLMClient, type LLMStatusResponse } from '../services/llm';
import {
  ApiPsgClient,
  type PsgCapabilitiesResponse
} from '../services/psg';
import {
  ApiLocalImageClient,
  type LocalImageRuntimeStatus
} from '../services/localImage';
import { useAuth } from '../providers/AuthUserProvider';
import { getSupabase } from '../utils/supabaseClient';
import {
  getRuntimeFeatureFlags,
  resolveRuntimeModeStatus,
  type RuntimeModeStatus
} from '../utils/runtimeMode';

interface UseRuntimeModeOptions {
  subscriptionActive?: boolean;
}

const RUNTIME_STATUS_REFRESH_MS = 15_000;

export function useRuntimeMode(
  options: UseRuntimeModeOptions = {}
): RuntimeModeStatus & {
  loading: boolean;
  llmStatus: LLMStatusResponse | null;
  psgCapabilities: PsgCapabilitiesResponse | null;
  localImageStatus: LocalImageRuntimeStatus | null;
} {
  const auth = useAuth();
  const [llmStatus, setLlmStatus] = useState<LLMStatusResponse | null>(null);
  const [psgCapabilities, setPsgCapabilities] =
    useState<PsgCapabilitiesResponse | null>(null);
  const [localImageStatus, setLocalImageStatus] =
    useState<LocalImageRuntimeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const llmClient = new ApiLLMClient();
    const psgClient = new ApiPsgClient();
    const localImageClient = new ApiLocalImageClient();

    const refreshStatus = () => {
      Promise.allSettled([
        llmClient.getStatus(),
        psgClient.getCapabilities(),
        localImageClient.getStatus()
      ])
        .then(([llmResult, psgResult, localImageResult]) => {
          if (!cancelled) {
            setLlmStatus(
              llmResult.status === 'fulfilled' ? llmResult.value : null
            );
            setPsgCapabilities(
              psgResult.status === 'fulfilled' ? psgResult.value : null
            );
            setLocalImageStatus(
              localImageResult.status === 'fulfilled'
                ? localImageResult.value
                : null
            );
            setLoading(false);
          }
        });
    };

    refreshStatus();

    const intervalId = window.setInterval(() => {
      refreshStatus();
    }, RUNTIME_STATUS_REFRESH_MS);

    const handleFocus = () => {
      refreshStatus();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  return useMemo(() => {
    const flags = getRuntimeFeatureFlags();
    const status = resolveRuntimeModeStatus({
      flags,
      isAuthenticated: auth.isAuthenticated,
      hasSupabase: Boolean(getSupabase()),
      hasCloudSubscription: options.subscriptionActive === true,
      llmStatus,
      psgCapabilities,
      localImageStatus
    });

    return {
      ...status,
      loading,
      llmStatus,
      psgCapabilities,
      localImageStatus
    };
  }, [
    auth.isAuthenticated,
    llmStatus,
    localImageStatus,
    loading,
    options.subscriptionActive,
    psgCapabilities
  ]);
}

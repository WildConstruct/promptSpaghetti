import { useEffect, useMemo, useState } from 'react';
import { ApiLLMClient, type LLMStatusResponse } from '../services/llm';
import {
  ApiPsgClient,
  type PsgCapabilitiesResponse
} from '../services/psg';
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

export function useRuntimeMode(
  options: UseRuntimeModeOptions = {}
): RuntimeModeStatus & {
  loading: boolean;
  llmStatus: LLMStatusResponse | null;
  psgCapabilities: PsgCapabilitiesResponse | null;
} {
  const auth = useAuth();
  const [llmStatus, setLlmStatus] = useState<LLMStatusResponse | null>(null);
  const [psgCapabilities, setPsgCapabilities] =
    useState<PsgCapabilitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const llmClient = new ApiLLMClient();
    const psgClient = new ApiPsgClient();

    Promise.allSettled([llmClient.getStatus(), psgClient.getCapabilities()])
      .then(([llmResult, psgResult]) => {
        if (!cancelled) {
          setLlmStatus(
            llmResult.status === 'fulfilled' ? llmResult.value : null
          );
          setPsgCapabilities(
            psgResult.status === 'fulfilled' ? psgResult.value : null
          );
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLlmStatus(null);
          setPsgCapabilities(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
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
      psgCapabilities
    });

    return {
      ...status,
      loading,
      llmStatus,
      psgCapabilities
    };
  }, [
    auth.isAuthenticated,
    llmStatus,
    loading,
    options.subscriptionActive,
    psgCapabilities
  ]);
}

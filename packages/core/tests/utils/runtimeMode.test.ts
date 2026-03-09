import {
  getRuntimeFeatureFlags,
  resolveRuntimeModeStatus,
  type RuntimeFeatureFlags
} from '../../utils/runtimeMode';

function clearRuntimeEnv() {
  [
    'NEXT_PUBLIC_FEATURE_AUTH',
    'VITE_FEATURE_AUTH',
    'NEXT_PUBLIC_REQUIRE_AUTH',
    'VITE_REQUIRE_AUTH',
    'NEXT_PUBLIC_FEATURE_CLOUD_LLM',
    'VITE_FEATURE_CLOUD_LLM',
    'FEATURE_CLOUD_LLM',
    'NEXT_PUBLIC_FEATURE_LOCAL_LLM',
    'VITE_FEATURE_LOCAL_LLM',
    'FEATURE_LOCAL_LLM',
    'NEXT_PUBLIC_FEATURE_CLOUD_PSG',
    'VITE_FEATURE_CLOUD_PSG',
    'FEATURE_CLOUD_PSG',
    'NEXT_PUBLIC_FEATURE_LOCAL_PSG',
    'VITE_FEATURE_LOCAL_PSG',
    'FEATURE_LOCAL_PSG',
    'NEXT_PUBLIC_FEATURE_SUBSCRIPTIONS',
    'VITE_FEATURE_SUBSCRIPTIONS',
    'FEATURE_SUBSCRIPTIONS',
    'NEXT_PUBLIC_REQUIRE_SUBSCRIPTION_FOR_CLOUD',
    'VITE_REQUIRE_SUBSCRIPTION_FOR_CLOUD',
    'REQUIRE_SUBSCRIPTION_FOR_CLOUD',
    'NEXT_PUBLIC_FEATURE_SUPABASE',
    'VITE_FEATURE_SUPABASE',
    'FEATURE_SUPABASE',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ].forEach(key => {
    delete process.env[key];
  });
}

describe('runtimeMode', () => {
  beforeEach(() => {
    clearRuntimeEnv();
  });

  it('derives sensible default feature flags for a local-first setup', () => {
    const flags = getRuntimeFeatureFlags();

    expect(flags.authEnabled).toBe(false);
    expect(flags.cloudLlmEnabled).toBe(true);
    expect(flags.localLlmEnabled).toBe(true);
    expect(flags.cloudPsgEnabled).toBe(true);
    expect(flags.localPsgEnabled).toBe(true);
    expect(flags.subscriptionsEnabled).toBe(false);
  });

  it('resolves cloud mode only when cloud prerequisites are met', () => {
    const flags: RuntimeFeatureFlags = {
      authEnabled: true,
      authRequired: true,
      supabaseEnabled: true,
      cloudLlmEnabled: true,
      localLlmEnabled: true,
      cloudPsgEnabled: true,
      localPsgEnabled: true,
      subscriptionsEnabled: true,
      subscriptionRequiredForCloud: true
    };

    const result = resolveRuntimeModeStatus({
      flags,
      isAuthenticated: true,
      hasSupabase: true,
      hasCloudSubscription: true,
      llmStatus: {
        available: true,
        provider: 'openrouter',
        defaultModel: 'openai/gpt-4o-mini',
        capabilities: ['getStatus', 'complete']
      },
      psgCapabilities: {
        supportedKinds: ['fragment', 'crowd-plan'],
        operations: ['validate', 'normalize', 'expand-crowd', 'export-comfy'],
        exportTargets: ['comfy']
      }
    });

    expect(result.mode).toBe('cloud');
    expect(result.supabase.cloudSyncAvailable).toBe(true);
    expect(result.llm.accessMode).toBe('cloud');
    expect(result.llm.usesProxy).toBe(true);
    expect(result.psg.accessMode).toBe('cloud');
    expect(result.psg.operations).toContain('export-comfy');
    expect(result.psg.usesProxy).toBe(true);
  });

  it('falls back to local-byo mode when cloud access is not allowed', () => {
    const flags: RuntimeFeatureFlags = {
      authEnabled: true,
      authRequired: true,
      supabaseEnabled: true,
      cloudLlmEnabled: true,
      localLlmEnabled: true,
      cloudPsgEnabled: true,
      localPsgEnabled: true,
      subscriptionsEnabled: true,
      subscriptionRequiredForCloud: true
    };

    const result = resolveRuntimeModeStatus({
      flags,
      isAuthenticated: false,
      hasSupabase: false,
      hasCloudSubscription: false,
      llmStatus: null
    });

    expect(result.mode).toBe('local');
    expect(result.llm.accessMode).toBe('local-byo');
    expect(result.llm.available).toBe(true);
    expect(result.psg.accessMode).toBe('local');
    expect(result.psg.available).toBe(true);
    expect(result.subscription.state).toBe('inactive');
  });

  it('falls back to offline mode when neither cloud nor local llm is enabled', () => {
    const flags: RuntimeFeatureFlags = {
      authEnabled: false,
      authRequired: false,
      supabaseEnabled: false,
      cloudLlmEnabled: false,
      localLlmEnabled: false,
      cloudPsgEnabled: false,
      localPsgEnabled: false,
      subscriptionsEnabled: false,
      subscriptionRequiredForCloud: false
    };

    const result = resolveRuntimeModeStatus({
      flags,
      isAuthenticated: false,
      hasSupabase: false,
      hasCloudSubscription: false,
      llmStatus: null
    });

    expect(result.mode).toBe('local');
    expect(result.llm.accessMode).toBe('offline');
    expect(result.llm.available).toBe(false);
    expect(result.psg.accessMode).toBe('offline');
    expect(result.psg.available).toBe(false);
  });
});

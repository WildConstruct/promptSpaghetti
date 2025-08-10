import { getSupabaseConfig, isSupabaseEnabled, isSupabaseFeatureFlagEnabled, hasSupabaseEnv } from '../utils/supabaseFeature';

describe('supabaseFeature', () => {
  const envBackup = { ...process.env };

  afterEach(() => {
    process.env = { ...envBackup };
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('disabled when env missing regardless of flag default (flag defaults to true)', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_FEATURE_SUPABASE;
    delete process.env.VITE_FEATURE_SUPABASE;

    const cfg = getSupabaseConfig();
    expect(cfg.enabledByFlag).toBe(true);
    expect(cfg.hasEnv).toBe(false);
    expect(cfg.enabled).toBe(false);
    expect(isSupabaseFeatureFlagEnabled()).toBe(true);
    expect(hasSupabaseEnv()).toBe(false);
    expect(isSupabaseEnabled()).toBe(false);
  });

  test('enabled when flag on and env present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    process.env.NEXT_PUBLIC_FEATURE_SUPABASE = '1';

    const cfg = getSupabaseConfig();
    expect(cfg.enabledByFlag).toBe(true);
    expect(cfg.hasEnv).toBe(true);
    expect(cfg.enabled).toBe(true);
    expect(isSupabaseEnabled()).toBe(true);
  });

  test('disabled by flag even if env present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    process.env.NEXT_PUBLIC_FEATURE_SUPABASE = '0';

    const cfg = getSupabaseConfig();
    expect(cfg.enabledByFlag).toBe(false);
    expect(cfg.hasEnv).toBe(true);
    expect(cfg.enabled).toBe(false);
  });
});

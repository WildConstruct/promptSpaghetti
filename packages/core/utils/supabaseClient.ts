import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './supabaseFeature';

const { url, anonKey, enabledByFlag, hasEnv, enabled, meta } = getSupabaseConfig();

// Minimal, safe diagnostic log (no secrets)
try {
  // eslint-disable-next-line no-console
  console.log('[supabase] env', {
    enabledByFlag,
    hasEnv,
    enabled,
    urlKey: meta?.urlKey,
    anonKeyKey: meta?.anonKeyKey,
    flagKey: meta?.flagKey,
    urlLen: url ? url.length : 0,
    anonKeyLen: anonKey ? anonKey.length : 0
  });
} catch {}

let warned = false;
const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';
const isCI = process.env.CI === 'true';

// Warn only in local dev when the feature flag is ON but env is missing
if (
  !enabled &&
  enabledByFlag &&
  !hasEnv &&
  !isProd &&
  !isTest &&
  !isCI &&
  !warned
) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] URL/key missing; storage features are disabled.');
  warned = true;
}

export const supabase: SupabaseClient | null = enabled
  ? createClient(url, anonKey)
  : null;

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './supabaseFeature';

let _client: SupabaseClient | null | undefined;
let _diagnosed = false;
let warned = false;
const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';
const isCI = process.env.CI === 'true';

export function getSupabase(): SupabaseClient | null {
  if (_client !== undefined) { return _client; }
  const { url, anonKey, enabledByFlag, hasEnv, enabled, meta } = getSupabaseConfig();

  if (!_diagnosed) {
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
    _diagnosed = true;
  }

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

  if (enabled) {
    _client = createClient(url, anonKey);
    return _client;
  }

  // Fallback: try global env shim bag
  try {
    const bag = (globalThis as unknown as { __env__?: Record<string, unknown> }).__env__;
    const fbUrl = (bag?.['VITE_SUPABASE_URL'] as string) || '';
    const fbKey = (bag?.['VITE_SUPABASE_ANON_KEY'] as string) || '';
    if (fbUrl && fbKey) {
      // eslint-disable-next-line no-console
      console.log('[supabase] using fallback from globalThis.__env__');
      _client = createClient(fbUrl, fbKey);
      return _client;
    }
  } catch {}

  _client = null;
  return _client;
}

export type { SupabaseClient };

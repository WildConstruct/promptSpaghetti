import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './supabaseFeature';
let _client;
let _diagnosed = false;
let warned = false;
const env = typeof process !== 'undefined' && typeof process.env !== 'undefined'
    ? process.env
    : {};
const isTest = env.NODE_ENV === 'test';
const isProd = env.NODE_ENV === 'production';
const isCI = env.CI === 'true';
export function getSupabase() {
    if (_client !== undefined) {
        return _client;
    }
    const { url, anonKey, enabledByFlag, hasEnv, enabled, meta } = getSupabaseConfig();
    if (!_diagnosed && !isTest && !isCI) {
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
        }
        catch {
            // Ignore diagnostic logging failures.
        }
        _diagnosed = true;
    }
    if (!enabled &&
        enabledByFlag &&
        !hasEnv &&
        !isProd &&
        !isTest &&
        !isCI &&
        !warned) {
        // eslint-disable-next-line no-console
        console.warn('[supabase] URL/key missing; storage features are disabled.');
        warned = true;
    }
    if (enabled) {
        _client = createClient(url, anonKey);
        return _client;
    }
    try {
        const bag = globalThis
            .__env__;
        const fbUrl = bag?.['VITE_SUPABASE_URL'] || '';
        const fbKey = bag?.['VITE_SUPABASE_ANON_KEY'] || '';
        if (fbUrl && fbKey) {
            // eslint-disable-next-line no-console
            console.log('[supabase] using fallback from globalThis.__env__');
            _client = createClient(fbUrl, fbKey);
            return _client;
        }
    }
    catch {
        // Ignore global env shim lookup failures.
    }
    _client = null;
    return _client;
}
export const supabase = getSupabase();

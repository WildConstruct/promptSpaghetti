"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.getSupabase = getSupabase;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseFeature_1 = require("./supabaseFeature");
let _client;
let _diagnosed = false;
let warned = false;
const env = typeof process !== 'undefined' && typeof process.env !== 'undefined'
    ? process.env
    : {};
const isTest = env.NODE_ENV === 'test';
const isProd = env.NODE_ENV === 'production';
const isCI = env.CI === 'true';
function getSupabase() {
    if (_client !== undefined) {
        return _client;
    }
    const { url, anonKey, enabledByFlag, hasEnv, enabled, meta } = (0, supabaseFeature_1.getSupabaseConfig)();
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
        _client = (0, supabase_js_1.createClient)(url, anonKey);
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
            _client = (0, supabase_js_1.createClient)(fbUrl, fbKey);
            return _client;
        }
    }
    catch {
        // Ignore global env shim lookup failures.
    }
    _client = null;
    return _client;
}
exports.supabase = getSupabase();

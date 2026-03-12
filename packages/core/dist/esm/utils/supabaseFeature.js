/* Supabase feature gating utilities */
function getEnvVar(key) {
    // Prefer process.env in Node/test/CI. Fallback to import.meta.env in browser builds.
    if (typeof process !== 'undefined' &&
        typeof process.env !== 'undefined' &&
        Object.prototype.hasOwnProperty.call(process.env, key)) {
        return process.env[key];
    }
    // Try to read from global import.meta.env and also from a global env bag
    const meta = globalThis.import?.meta;
    const metaEnv = meta?.env;
    if (metaEnv && Object.prototype.hasOwnProperty.call(metaEnv, key)) {
        const val = metaEnv[key];
        return typeof val === 'string'
            ? val
            : val !== null
                ? String(val)
                : undefined;
    }
    const globalEnv = globalThis.__env__;
    if (globalEnv && Object.prototype.hasOwnProperty.call(globalEnv, key)) {
        const val = globalEnv[key];
        return typeof val === 'string'
            ? val
            : val !== null
                ? String(val)
                : undefined;
    }
    return undefined;
}
function parseBoolean(value, fallback = true) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    const s = String(value).toLowerCase().trim();
    if (['1', 'true', 'yes', 'on', 'enabled'].includes(s)) {
        return true;
    }
    if (['0', 'false', 'no', 'off', 'disabled'].includes(s)) {
        return false;
    }
    return fallback;
}
export function getSupabaseConfig() {
    const URL_KEYS = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'VITE_SUPABASE_URL',
        'SUPABASE_URL',
        'PUBLIC_SUPABASE_URL'
    ];
    const ANON_KEYS = [
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'VITE_SUPABASE_ANON_KEY',
        'SUPABASE_ANON_KEY',
        'PUBLIC_SUPABASE_ANON_KEY'
    ];
    const FLAG_KEYS = [
        'NEXT_PUBLIC_FEATURE_SUPABASE',
        'VITE_FEATURE_SUPABASE',
        'FEATURE_SUPABASE'
    ];
    function pickFirst(keys) {
        for (const k of keys) {
            const v = getEnvVar(k);
            if (v && String(v).trim() !== '') {
                return { key: k, value: String(v) };
            }
        }
        return { key: 'none', value: '' };
    }
    const urlPick = pickFirst(URL_KEYS);
    const anonPick = pickFirst(ANON_KEYS);
    const flagPick = pickFirst(FLAG_KEYS);
    const url = urlPick.value;
    const anonKey = anonPick.value;
    const flagRaw = flagPick.value;
    const enabledByFlag = parseBoolean(flagRaw, true);
    const hasEnv = Boolean(url && anonKey);
    const enabled = enabledByFlag && hasEnv;
    const meta = {
        urlKey: urlPick.key,
        anonKeyKey: anonPick.key,
        flagKey: flagPick.key,
        urlLen: url ? url.length : 0,
        anonKeyLen: anonKey ? anonKey.length : 0
    };
    return {
        url,
        anonKey,
        flagRaw,
        enabledByFlag,
        hasEnv,
        enabled,
        meta
    };
}
export function hasSupabaseEnv() {
    return getSupabaseConfig().hasEnv;
}
export function isSupabaseFeatureFlagEnabled() {
    return getSupabaseConfig().enabledByFlag;
}
export function isSupabaseEnabled() {
    return getSupabaseConfig().enabled;
}
// Convenience for UI props (e.g., enableSupabase)
export function deriveEnableSupabaseProp() {
    return isSupabaseEnabled();
}

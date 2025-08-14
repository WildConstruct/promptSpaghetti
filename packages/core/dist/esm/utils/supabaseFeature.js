/* Supabase feature gating utilities */
function getEnvVar(key) {
    // Prefer process.env in Node/test/CI. Fallback to import.meta.env in browser builds.
    if (typeof process !== 'undefined' &&
        typeof process.env !== 'undefined' &&
        Object.prototype.hasOwnProperty.call(process.env, key)) {
        return process.env[key];
    }
    // Try to read from global import.meta.env (when bundled for browser environments)
    const meta = globalThis.import?.meta;
    const metaEnv = meta?.env ??
        globalThis.__env__;
    if (metaEnv && Object.prototype.hasOwnProperty.call(metaEnv, key)) {
        const val = metaEnv[key];
        return typeof val === 'string'
            ? val
            : val != null
                ? String(val)
                : undefined;
    }
    return undefined;
}
function parseBoolean(value, fallback = true) {
    if (value === undefined || value === null || value === '')
        return fallback;
    if (typeof value === 'boolean')
        return value;
    const s = String(value).toLowerCase().trim();
    if (['1', 'true', 'yes', 'on', 'enabled'].includes(s))
        return true;
    if (['0', 'false', 'no', 'off', 'disabled'].includes(s))
        return false;
    return fallback;
}
export function getSupabaseConfig() {
    const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL') ||
        getEnvVar('VITE_SUPABASE_URL') ||
        '';
    const anonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
        getEnvVar('VITE_SUPABASE_ANON_KEY') ||
        '';
    const flagRaw = getEnvVar('NEXT_PUBLIC_FEATURE_SUPABASE') ??
        getEnvVar('VITE_FEATURE_SUPABASE');
    const enabledByFlag = parseBoolean(flagRaw, true);
    const hasEnv = Boolean(url && anonKey);
    const enabled = enabledByFlag && hasEnv;
    return { url, anonKey, flagRaw, enabledByFlag, hasEnv, enabled };
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

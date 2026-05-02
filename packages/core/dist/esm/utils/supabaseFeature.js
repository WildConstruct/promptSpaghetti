/* Supabase feature gating utilities */
import { parseBoolean, readEnvVar } from './env';
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
            const v = readEnvVar(k);
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

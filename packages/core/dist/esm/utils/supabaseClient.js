import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './supabaseFeature';
const { url, anonKey, enabledByFlag, hasEnv, enabled } = getSupabaseConfig();
let warned = false;
const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';
const isCI = process.env.CI === 'true';
// Warn only in local dev when the feature flag is ON but env is missing
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
export const supabase = enabled
    ? createClient(url, anonKey)
    : null;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseFeature_1 = require("./supabaseFeature");
const { url, anonKey, enabledByFlag, hasEnv, enabled } = (0, supabaseFeature_1.getSupabaseConfig)();
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
exports.supabase = enabled
    ? (0, supabase_js_1.createClient)(url, anonKey)
    : null;

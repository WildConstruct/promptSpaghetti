/* Supabase feature gating utilities */

function getEnvVar(key: string): string | undefined {
  // Prefer process.env in Node/test/CI. Fallback to import.meta.env in browser builds.
  if (
    typeof process !== 'undefined' &&
    typeof process.env !== 'undefined' &&
    Object.prototype.hasOwnProperty.call(process.env, key)
  ) {
    return (process.env as Record<string, string | undefined>)[key];
  }
  try {
    const im: any = (import.meta as unknown) as { env?: Record<string, unknown> };
    if (im && im.env && Object.prototype.hasOwnProperty.call(im.env, key)) {
      const val = im.env[key];
      return typeof val === 'string' ? val : val != null ? String(val) : undefined;
    }
  } catch {}
  // Try to read from global import.meta.env (when bundled for browser environments)
  const meta = (
    globalThis as unknown as {
      import?: { meta?: { env?: Record<string, unknown> } };
      __env__?: Record<string, unknown>;
    }
  ).import?.meta;
  const metaEnv =
    meta?.env ??
    (globalThis as unknown as { __env__?: Record<string, unknown> }).__env__;
  if (metaEnv && Object.prototype.hasOwnProperty.call(metaEnv, key)) {
    const val = metaEnv[key];
    return typeof val === 'string'
      ? val
      : val !== null
        ? String(val)
        : undefined;
  }
  return undefined;
}

function parseBoolean(value: unknown, fallback = true): boolean {
  if (value === undefined || value === null || value === '') {return fallback;}
  if (typeof value === 'boolean') {return value;}
  const s = String(value).toLowerCase().trim();
  if (['1', 'true', 'yes', 'on', 'enabled'].includes(s)) {return true;}
  if (['0', 'false', 'no', 'off', 'disabled'].includes(s)) {return false;}
  return fallback;
}

export function getSupabaseConfig() {
  // Resolve URL from supported prefixes
  const urlNext = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const urlVite = getEnvVar('VITE_SUPABASE_URL');
  const url = urlNext || urlVite || '';

  // Resolve anon key from supported prefixes
  const anonKeyNext = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const anonKeyVite = getEnvVar('VITE_SUPABASE_ANON_KEY');
  const anonKey = anonKeyNext || anonKeyVite || '';

  // Resolve feature flag from supported prefixes
  const flagNext = getEnvVar('NEXT_PUBLIC_FEATURE_SUPABASE');
  const flagVite = getEnvVar('VITE_FEATURE_SUPABASE');
  const flagRaw = flagNext ?? flagVite;

  const enabledByFlag = parseBoolean(flagRaw, true);
  const hasEnv = Boolean(url && anonKey);
  const enabled = enabledByFlag && hasEnv;

  // Provide non-sensitive meta for diagnostics
  const meta = {
    urlSource: urlNext ? 'NEXT_PUBLIC' : urlVite ? 'VITE' : 'none',
    anonKeySource: anonKeyNext ? 'NEXT_PUBLIC' : anonKeyVite ? 'VITE' : 'none',
    flagSource: flagNext != null ? 'NEXT_PUBLIC' : flagVite != null ? 'VITE' : 'none',
    urlLen: url ? url.length : 0,
    anonKeyLen: anonKey ? anonKey.length : 0
  } as const;

  return { url, anonKey, flagRaw, enabledByFlag, hasEnv, enabled, meta } as const;
}

export function hasSupabaseEnv(): boolean {
  return getSupabaseConfig().hasEnv;
}

export function isSupabaseFeatureFlagEnabled(): boolean {
  return getSupabaseConfig().enabledByFlag;
}

export function isSupabaseEnabled(): boolean {
  return getSupabaseConfig().enabled;
}

// Convenience for UI props (e.g., enableSupabase)
export function deriveEnableSupabaseProp(): boolean {
  return isSupabaseEnabled();
}

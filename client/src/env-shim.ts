declare global {
  // eslint-disable-next-line no-var
  var __env__: Record<string, unknown> | undefined;
}

(function initEnv() {
  try {
    const env = (import.meta as unknown as { env?: Record<string, unknown> }).env || {};
    const bag: Record<string, unknown> = {
      VITE_SUPABASE_URL: (env as any).VITE_SUPABASE_URL || '',
      VITE_SUPABASE_ANON_KEY: (env as any).VITE_SUPABASE_ANON_KEY || '',
      VITE_FEATURE_SUPABASE: (env as any).VITE_FEATURE_SUPABASE ?? '1',
      NEXT_PUBLIC_SUPABASE_URL: (env as any).NEXT_PUBLIC_SUPABASE_URL || '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: (env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      NEXT_PUBLIC_FEATURE_SUPABASE: (env as any).NEXT_PUBLIC_FEATURE_SUPABASE ?? ''
    };
    (globalThis as any).__env__ = bag;
    // Minimal presence log; no secrets
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('[env-shim] presence', {
        VITE_SUPABASE_URL: Boolean(bag.VITE_SUPABASE_URL),
        VITE_SUPABASE_ANON_KEY: Boolean(bag.VITE_SUPABASE_ANON_KEY)
      });
    }
  } catch {
    // noop
  }
})();
export {};

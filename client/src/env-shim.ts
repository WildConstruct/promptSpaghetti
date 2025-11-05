declare global {
  // eslint-disable-next-line no-var
  var __env__: Record<string, unknown> | undefined;
}

(function initEnv() {
  try {
    // Use static references so Vite inlines the values at build time
    const SB_URL = import.meta.env.VITE_SUPABASE_URL;
    const SB_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const SB_FLAG = import.meta.env.VITE_FEATURE_SUPABASE;

    const bag: Record<string, unknown> = {
      VITE_SUPABASE_URL: SB_URL || '',
      VITE_SUPABASE_ANON_KEY: SB_ANON || '',
      VITE_FEATURE_SUPABASE: SB_FLAG ?? '1'
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

describe('supabaseClient gating', () => {
  const envBackup = { ...process.env };
  const origWarn = console.warn;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...envBackup };
  });

  afterEach(() => {
    process.env = { ...envBackup };
    console.warn = origWarn;
  });

  test('exports null when env missing (flag default on)', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_FEATURE_SUPABASE;

    const { supabase } = await import('../utils/supabaseClient');
    expect(supabase).toBeNull();
  });

  test('exports client when env present and flag enabled', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    process.env.NEXT_PUBLIC_FEATURE_SUPABASE = '1';

    const { supabase } = await import('../utils/supabaseClient');
    expect(supabase).not.toBeNull();
    // has method
    // @ts-expect-error runtime check only
    expect(typeof supabase.from).toBe('function');
  });

  test('suppresses warnings in test/CI', async () => {
    process.env.NODE_ENV = 'test';
    process.env.CI = 'true';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    await import('../utils/supabaseClient');
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

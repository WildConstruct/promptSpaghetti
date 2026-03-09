import { renderHook, waitFor } from '@testing-library/react';
import { useRuntimeMode } from '../useRuntimeMode';

jest.mock('../../providers/AuthUserProvider', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  }))
}));

jest.mock('../../utils/supabaseClient', () => ({
  getSupabase: jest.fn(() => null)
}));

describe('useRuntimeMode', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('combines auth, llm, and supabase state into one runtime status object', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.endsWith('/api/llm/status')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              available: true,
              mode: 'live',
              provider: 'openrouter',
              defaultModel: 'openai/gpt-4o-mini',
              capabilities: ['getStatus', 'complete', 'draftGraphFromPrompt']
            })
          });
        }

        if (url.endsWith('/api/psg/capabilities')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              ok: true,
              version: 'psg/1',
              supportedKinds: ['fragment', 'crowd-plan'],
              operations: [
                'validate',
                'normalize',
                'expand-crowd',
                'export-comfy'
              ],
              exportTargets: ['comfy']
            })
          });
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      }) as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useRuntimeMode({ subscriptionActive: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.mode).toBe('local');
    expect(result.current.llm.accessMode).toBe('cloud');
    expect(result.current.llm.capabilities).toContain('complete');
    expect(result.current.psg.accessMode).toBe('cloud');
    expect(result.current.psg.exportTargets).toContain('comfy');
    expect(result.current.subscription.state).toBe('unknown');
  });
});

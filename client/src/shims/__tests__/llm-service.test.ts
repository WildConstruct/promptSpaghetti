/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { LLMService } from '../llm-service';

describe('LLMService browser adapter', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });
  afterEach(() => {
    (global as any).fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('posts to /api/llm/complete and returns JSON', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, completion: 'Hello', model: 'stub' })
    });

    const svc = new LLMService({});
    const res = await svc.complete({ prompt: 'Hi' });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/llm/complete',
      expect.objectContaining({ method: 'POST' })
    );
    expect(res).toEqual({ success: true, completion: 'Hello', model: 'stub' });
  });

  it('throws on non-OK response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    });
    const svc = new LLMService({});
    await expect(svc.complete({ prompt: 'Hi' })).rejects.toThrow(
      'LLM endpoint error'
    );
  });

  it('posts draftGraphFromPrompt requests to the agent draft endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        summary: 'Created a deterministic draft.',
        operations: [],
        notes: [],
        fallback: true
      })
    });

    const svc = new LLMService({});
    const res = await svc.draftGraphFromPrompt('hero portrait, cinematic', {
      mode: 'draft',
      options: { maxNewNodes: 6 }
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/agent/draft-graph',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          prompt: 'hero portrait, cinematic',
          mode: 'draft',
          options: { maxNewNodes: 6 }
        })
      })
    );
    expect(res).toEqual({
      ok: true,
      summary: 'Created a deterministic draft.',
      operations: [],
      notes: [],
      fallback: true
    });
  });
});

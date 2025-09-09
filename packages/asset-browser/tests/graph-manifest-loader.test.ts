import { loadServerGraphs } from '../src/services/GraphManifestLoader';

describe('GraphManifestLoader', () => {
  afterEach(() => {
    // @ts-expect-error: reset stubbed global.fetch between tests
    global.fetch = undefined;
  });

  it('returns list when fetch succeeds with array', async () => {
    // @ts-expect-error: assign test stub to global.fetch
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => [
        {
          filename: 'a.psg',
          title: 'A',
          updatedAt: new Date().toISOString(),
          tags: []
        }
      ]
    }));
    const list = await loadServerGraphs('');
    expect(Array.isArray(list)).toBe(true);
    expect(list[0].filename).toBe('a.psg');
  });

  it('returns empty when payload is not array', async () => {
    // @ts-expect-error: assign test stub to global.fetch
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({}) }));
    const list = await loadServerGraphs('');
    expect(list).toEqual([]);
  });

  it('throws when fetch fails', async () => {
    // @ts-expect-error: assign test stub to global.fetch
    global.fetch = jest.fn(async () => ({ ok: false, status: 404 }));
    await expect(loadServerGraphs('')).rejects.toThrow(/Failed to load/);
  });
});

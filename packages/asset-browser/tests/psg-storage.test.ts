import path from 'path';

describe('core/utils/psgStorage via asset-browser test runner', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('gracefully handles null supabase client', async () => {
    jest.doMock('@promptscape/core/utils/supabaseClient', () => ({
      supabase: null
    }));
    const { listUserGraphs, getUserGraph, putUserGraph } = await import(
      '@promptscape/core/utils/psgStorage'
    );

    const list = await listUserGraphs('u');
    expect(list.ok).toBe(false);
    if (!list.ok) expect(list.error.message).toMatch(/not configured/i);

    const get = await getUserGraph('u', 'g.psg');
    expect(get.ok).toBe(false);

    const put = await putUserGraph('u', 'g.psg', '{}');
    expect(put.ok).toBe(false);
  });

  test('listUserGraphs uses prefix and filters .psg', async () => {
    const listMock = jest.fn().mockResolvedValue({
      data: [{ name: 'a.psg' }, { name: 'b.txt' }],
      error: null
    });
    const fromMock = jest.fn(() => ({ list: listMock }));
    jest.doMock('@promptscape/core/utils/supabaseClient', () => ({
      supabase: { storage: { from: fromMock } }
    }));
    const { listUserGraphs } = await import(
      '@promptscape/core/utils/psgStorage'
    );
    const res = await listUserGraphs('me');

    expect(fromMock).toHaveBeenCalledWith('graphs');
    expect(listMock).toHaveBeenCalledWith(
      'users/me/graphs/',
      expect.objectContaining({ limit: 100 })
    );

    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data).toEqual([{ name: 'a.psg' }]);
  });

  test('getUserGraph downloads and returns text', async () => {
    const payload = JSON.stringify({ ok: true });
    const downloadMock = jest
      .fn()
      .mockResolvedValue({ data: { text: async () => payload }, error: null });
    const fromMock = jest.fn(() => ({ download: downloadMock }));
    jest.doMock('@promptscape/core/utils/supabaseClient', () => ({
      supabase: { storage: { from: fromMock } }
    }));
    const { getUserGraph } = await import('@promptscape/core/utils/psgStorage');

    const res = await getUserGraph('me', 'g.psg');
    expect(fromMock).toHaveBeenCalledWith('graphs');
    expect(downloadMock).toHaveBeenCalledWith('users/me/graphs/g.psg');
    expect(res.ok).toBe(true);
    if (res.ok) expect(JSON.parse(res.data)).toEqual({ ok: true });
  });

  test('putUserGraph uploads with application/json and upsert true', async () => {
    const uploadMock = jest.fn().mockResolvedValue({ data: null, error: null });
    const fromMock = jest.fn(() => ({ upload: uploadMock }));
    jest.doMock('@promptscape/core/utils/supabaseClient', () => ({
      supabase: { storage: { from: fromMock } }
    }));
    const { putUserGraph } = await import('@promptscape/core/utils/psgStorage');

    const payload = JSON.stringify({ nodes: [], edges: [] });
    const res = await putUserGraph('me', 'n.psg', payload);

    expect(fromMock).toHaveBeenCalledWith('graphs');
    const args = uploadMock.mock.calls[0];
    expect(args[0]).toBe('users/me/graphs/n.psg');
    const sentBlob: Blob = args[1];
    const opts = args[2];
    expect(opts).toEqual(
      expect.objectContaining({ upsert: true, contentType: 'application/json' })
    );

    const text = await new Promise<string>(resolve => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result || ''));
      fr.readAsText(sentBlob);
    });
    expect(text).toBe(payload);

    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.path).toBe('users/me/graphs/n.psg');
  });
});

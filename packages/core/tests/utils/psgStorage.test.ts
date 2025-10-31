const supabaseHolder: { supabase: any } = { supabase: null };

jest.mock('../../utils/supabaseClient', () => supabaseHolder);

import { listUserGraphs, getUserGraph, putUserGraph } from '../../utils/psgStorage';

const textEncoder = new TextEncoder();

describe('psgStorage', () => {
  let listMock: jest.Mock;
  let downloadMock: jest.Mock;
  let uploadMock: jest.Mock;
  let fromMock: jest.Mock;
  let originalResponse: typeof global.Response | undefined;
  let originalFileReader: typeof global.FileReader | undefined;

  beforeEach(() => {
    listMock = jest.fn();
    downloadMock = jest.fn();
    uploadMock = jest.fn();
    fromMock = jest.fn(() => ({
      list: listMock,
      download: downloadMock,
      upload: uploadMock
    }));

    supabaseHolder.supabase = {
      storage: {
        from: fromMock
      }
    };

    originalResponse = global.Response;
    originalFileReader = global.FileReader;
  });

  afterEach(() => {
    supabaseHolder.supabase = null;
    if (originalResponse) {
      global.Response = originalResponse;
    } else {
      delete (global as Record<string, unknown>).Response;
    }
    if (originalFileReader) {
      global.FileReader = originalFileReader;
    } else {
      delete (global as Record<string, unknown>).FileReader;
    }
    jest.clearAllMocks();
  });

  it('returns error when supabase is not configured', async () => {
    supabaseHolder.supabase = null;

    const listResult = await listUserGraphs('user-x');
    expect(listResult).toEqual({
      ok: false,
      error: { message: 'Supabase not configured' }
    });

    const getResult = await getUserGraph('user-x', 'graph.psg');
    expect(getResult.ok).toBe(false);

    const putResult = await putUserGraph('user-x', 'graph.psg', '{}');
    expect(putResult.ok).toBe(false);
  });

  it('lists user graphs and filters extensions', async () => {
    listMock.mockResolvedValue({
      data: [
        { name: 'alpha.psg' },
        { name: 'beta.txt' },
        { name: 'gamma.psg' }
      ],
      error: null
    });

    const result = await listUserGraphs('user-1');

    expect(fromMock).toHaveBeenCalledWith('graphs');
    expect(result).toEqual({
      ok: true,
      data: [{ name: 'alpha.psg' }, { name: 'gamma.psg' }]
    });
  });

  it('returns storage error when listing fails', async () => {
    listMock.mockResolvedValue({
      data: null,
      error: { message: 'boom' }
    });

    const result = await listUserGraphs('user-2');
    expect(result).toEqual({ ok: false, error: { message: 'boom' } });
  });

  it('downloads graphs using text() shortcut', async () => {
    const value = { text: jest.fn(async () => 'from-text-method') };
    downloadMock.mockResolvedValue({ data: value, error: null });

    const result = await getUserGraph('user-3', 'graph.psg');

    expect(downloadMock).toHaveBeenCalled();
    expect(result).toEqual({ ok: true, data: 'from-text-method' });
  });

  it('decodes graphs via arrayBuffer', async () => {
    const buffer = textEncoder.encode('buffer-data').buffer;
    const value = {
      arrayBuffer: jest.fn(async () => buffer)
    };
    downloadMock.mockResolvedValue({ data: value, error: null });

    const result = await getUserGraph('user-4', 'graph.psg');

    expect(result).toEqual({ ok: true, data: 'buffer-data' });
  });

  it('falls back to Response wrapper when available', async () => {
    class ResponseStub {
      private input: unknown;
      constructor(input: unknown) {
        this.input = input;
      }
      async text() {
        return `response:${String(this.input)}`;
      }
    }
    global.Response = ResponseStub as unknown as typeof global.Response;

    downloadMock.mockResolvedValue({ data: 12345, error: null });

    const result = await getUserGraph('user-5', 'graph.psg');
    expect(result).toEqual({ ok: true, data: 'response:12345' });
  });

  it('uses FileReader fallback when Response is unavailable', async () => {
    global.Response = undefined as unknown as typeof global.Response;
    expect(typeof global.Response).toBe('undefined');

    class FileReaderStub {
      result: string | ArrayBuffer | null = null;
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
      readAsText(): void {
        this.result = 'payload';
        this.onload?.({ target: this } as unknown as ProgressEvent<FileReader>);
      }
    }

    global.FileReader = FileReaderStub as unknown as typeof global.FileReader;

    const fakeBlob = { label: 'payload' };
    downloadMock.mockResolvedValue({
      data: fakeBlob,
      error: null
    });

    const result = await getUserGraph('user-6', 'graph.psg');
    expect(result).toEqual({ ok: true, data: 'payload' });
  });

  it('returns string representations for primitive blobs', async () => {
    downloadMock.mockResolvedValue({ data: 'plain-text', error: null });
    const stringResult = await getUserGraph('user-7', 'graph.psg');
    expect(stringResult).toEqual({ ok: true, data: 'plain-text' });

    delete (global as Record<string, unknown>).Response;
    delete (global as Record<string, unknown>).FileReader;

    const typedArray = new window.Uint8Array([97, 98, 99]);
    downloadMock.mockResolvedValue({ data: typedArray, error: null });
    const uintResult = await getUserGraph('user-7', 'graph.psg');
    expect(uintResult).toEqual({ ok: true, data: 'abc' });

    const buffer = new window.ArrayBuffer(6);
    new Uint8Array(buffer).set(textEncoder.encode('buffer'));
    downloadMock.mockResolvedValue({
      data: buffer,
      error: null
    });
    const bufferResult = await getUserGraph('user-7', 'graph.psg');
    expect(bufferResult).toEqual({ ok: true, data: 'buffer' });

    downloadMock.mockResolvedValue({ data: { unexpected: true }, error: null });
    const fallbackResult = await getUserGraph('user-7', 'graph.psg');
    expect(fallbackResult).toEqual({ ok: true, data: '[object Object]' });
  });

  it('falls back to empty string when FileReader returns null', async () => {
    global.Response = undefined as unknown as typeof global.Response;
    expect(typeof global.Response).toBe('undefined');

    class FileReaderNullStub {
      result: string | ArrayBuffer | null = null;
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
      readAsText(): void {
        this.result = null;
        this.onload?.({ target: this } as unknown as ProgressEvent<FileReader>);
      }
    }

    global.FileReader = FileReaderNullStub as unknown as typeof global.FileReader;

    const fakeBlob = { marker: 'null' };
    downloadMock.mockResolvedValue({
      data: fakeBlob,
      error: null
    });

    const result = await getUserGraph('user-8', 'graph.psg');
    expect(result).toEqual({ ok: true, data: '' });
  });

  it('surfaces FileReader errors when no error payload is provided', async () => {
    global.Response = undefined as unknown as typeof global.Response;
    expect(typeof global.Response).toBe('undefined');

    class FileReaderErrorStub {
      result: string | ArrayBuffer | null = null;
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
      readAsText(): void {
        this.onerror?.({ target: null } as unknown as ProgressEvent<FileReader>);
      }
    }

    global.FileReader = FileReaderErrorStub as unknown as typeof global.FileReader;

    const fakeBlob = { marker: 'error' };
    downloadMock.mockResolvedValue({
      data: fakeBlob,
      error: null
    });

    await expect(getUserGraph('user-9', 'graph.psg')).rejects.toThrow(
      'FileReader error'
    );
  });

  it('surfaces FileReader errors with provided error payload', async () => {
    global.Response = undefined as unknown as typeof global.Response;
    expect(typeof global.Response).toBe('undefined');

    class FileReaderErrorPayloadStub {
      result: string | ArrayBuffer | null = null;
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
      readAsText(): void {
        const error = new Error('reader failed');
        this.onerror?.({
          target: { error }
        } as unknown as ProgressEvent<FileReader>);
      }
    }

    global.FileReader = FileReaderErrorPayloadStub as unknown as typeof global.FileReader;

    const fakeBlob = { marker: 'error-payload' };
    downloadMock.mockResolvedValue({
      data: fakeBlob,
      error: null
    });

    await expect(getUserGraph('user-10', 'graph.psg')).rejects.toThrow(
      'reader failed'
    );
  });

  it('propagates download errors', async () => {
    downloadMock.mockResolvedValue({ data: null, error: { message: 'nope' } });
    const result = await getUserGraph('user-8', 'graph.psg');

    expect(result).toEqual({ ok: false, error: { message: 'nope' } });
  });

  it('uploads graphs with upsert flag', async () => {
    uploadMock.mockResolvedValue({ error: null });

    const result = await putUserGraph('user-9', 'graph.psg', '{"a":1}');

    expect(uploadMock).toHaveBeenCalledWith(
      'users/user-9/graphs/graph.psg',
      expect.any(Blob),
      expect.objectContaining({
        upsert: true,
        contentType: 'application/json'
      })
    );
    expect(result).toEqual({
      ok: true,
      data: { path: 'users/user-9/graphs/graph.psg' }
    });
  });

  it('reports upload errors cleanly', async () => {
    uploadMock.mockResolvedValue({ error: { message: 'fail' } });

    const result = await putUserGraph('user-10', 'broken.psg', '{}');
    expect(result).toEqual({ ok: false, error: { message: 'fail' } });
  });
});

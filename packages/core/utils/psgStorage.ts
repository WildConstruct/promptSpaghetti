import { getSupabase } from './supabaseClient';

const BUCKET = 'graphs';
const pathPrefix = (userId: string) => `users/${userId}/graphs/` as const;
const objectPath = (userId: string, name: string) =>
  `${pathPrefix(userId)}${name}`;

export type StorageError = { message: string; code?: string };
export type StorageResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: StorageError };

/**
 * GlobalThis extensions for browser APIs
 */
interface ExtendedGlobalThis {
  Response?: new (input: unknown) => { text(): Promise<string> };
  FileReader?: new () => {
    result: string | null | ArrayBuffer;
    onload: ((event: ProgressEvent<FileReader>) => void) | null;
    onerror: ((event: ProgressEvent<FileReader>) => void) | null;
    readAsText(blob: Blob): void;
  };
}

export async function listUserGraphs(
  userId: string
): Promise<StorageResult<{ name: string }[]>> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, error: { message: 'Supabase not configured' } };
  }
  const prefix = pathPrefix(userId);
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
    limit: 100,
    sortBy: { column: 'name', order: 'asc' }
  });
  if (error) {
    return { ok: false, error: { message: error.message } };
  }
  const files = (data || [])
    .filter((x: { name: string }) => x.name.endsWith('.psg'))
    .map((x: { name: string }) => ({ name: x.name }));
  return { ok: true, data: files };
}

export async function getUserGraph(
  userId: string,
  name: string
): Promise<StorageResult<string>> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, error: { message: 'Supabase not configured' } };
  }
  const path = objectPath(userId, name);
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) {
    return { ok: false, error: { message: error.message } };
  }
  const value: unknown = data;
  // Decode blob-like, buffers, or strings without relying on global Response
  let text: string;
  const hasMethod = <T extends string>(
    obj: unknown,
    name: T
  ): obj is { [K in T]: (...args: unknown[]) => unknown } =>
    typeof obj === 'object' &&
    obj !== null &&
    name in obj &&
    typeof (obj as Record<string, unknown>)[name] === 'function';
  if (hasMethod(value, 'text')) {
    text = (await value.text()) as unknown as string;
  } else if (hasMethod(value, 'arrayBuffer')) {
    const buf = (await value.arrayBuffer()) as unknown as ArrayBuffer;
    text = new TextDecoder().decode(buf);
  } else {
    const ResponseCtor = (globalThis as ExtendedGlobalThis).Response;
    if (typeof ResponseCtor !== 'undefined') {
      text = await new ResponseCtor(value).text();
    } else {
      const FileReaderCtor = (globalThis as ExtendedGlobalThis).FileReader;
      if (typeof FileReaderCtor !== 'undefined') {
        text = await new Promise<string>((resolve, reject) => {
          try {
            const fr = new FileReaderCtor();
            fr.onload = () => resolve(String(fr.result ?? ''));
            fr.onerror = event => {
              const reader = event.target as FileReader | null;
              reject(reader?.error ?? new Error('FileReader error'));
            };
            fr.readAsText(value as Blob);
          } catch {
            resolve(String(value));
          }
        });
      } else if (typeof value === 'string') {
        text = value;
      } else if (value instanceof Uint8Array) {
        text = new TextDecoder().decode(value);
      } else if (value instanceof ArrayBuffer) {
        text = new TextDecoder().decode(new Uint8Array(value));
      } else {
        text = String(value);
      }
    }
  }
  return { ok: true, data: text };
}

export async function putUserGraph(
  userId: string,
  name: string,
  content: string
): Promise<StorageResult<{ path: string }>> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, error: { message: 'Supabase not configured' } };
  }
  const path = objectPath(userId, name);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, new Blob([content], { type: 'application/json' }), {
      upsert: true,
      contentType: 'application/json'
    });
  if (error) {
    return { ok: false, error: { message: error.message } };
  }
  return { ok: true, data: { path } };
}

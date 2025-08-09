import { supabase } from './supabaseClient';

const BUCKET = 'graphs';
const pathPrefix = (userId: string) => `users/${userId}/graphs/` as const;
const objectPath = (userId: string, name: string) =>
  `${pathPrefix(userId)}${name}`;

export type StorageError = { message: string; code?: string };
export type StorageResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: StorageError };

export async function listUserGraphs(
  userId: string
): Promise<StorageResult<{ name: string }[]>> {
  if (!supabase)
    return { ok: false, error: { message: 'Supabase not configured' } };
  const prefix = pathPrefix(userId);
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
    limit: 100,
    sortBy: { column: 'name', order: 'asc' }
  });
  if (error) return { ok: false, error: { message: error.message } };
  const files = (data || [])
    .filter((x: { name: string }) => x.name.endsWith('.psg'))
    .map((x: { name: string }) => ({ name: x.name }));
  return { ok: true, data: files };
}

export async function getUserGraph(
  userId: string,
  name: string
): Promise<StorageResult<string>> {
  if (!supabase)
    return { ok: false, error: { message: 'Supabase not configured' } };
  const path = objectPath(userId, name);
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) return { ok: false, error: { message: error.message } };
  const text = await data.text();
  return { ok: true, data: text };
}

export async function putUserGraph(
  userId: string,
  name: string,
  content: string
): Promise<StorageResult<{ path: string }>> {
  if (!supabase)
    return { ok: false, error: { message: 'Supabase not configured' } };
  const path = objectPath(userId, name);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, new Blob([content], { type: 'application/json' }), {
      upsert: true,
      contentType: 'application/json'
    });
  if (error) return { ok: false, error: { message: error.message } };
  return { ok: true, data: { path } };
}

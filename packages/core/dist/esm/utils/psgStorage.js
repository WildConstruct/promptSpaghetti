import { supabase } from './supabaseClient';
const BUCKET = 'graphs';
const pathPrefix = (userId) => `users/${userId}/graphs/`;
const objectPath = (userId, name) => `${pathPrefix(userId)}${name}`;
export async function listUserGraphs(userId) {
    if (!supabase)
        return { ok: false, error: { message: 'Supabase not configured' } };
    const prefix = pathPrefix(userId);
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
    });
    if (error)
        return { ok: false, error: { message: error.message } };
    const files = (data || [])
        .filter((x) => x.name.endsWith('.psg'))
        .map((x) => ({ name: x.name }));
    return { ok: true, data: files };
}
export async function getUserGraph(userId, name) {
    if (!supabase)
        return { ok: false, error: { message: 'Supabase not configured' } };
    const path = objectPath(userId, name);
    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    if (error)
        return { ok: false, error: { message: error.message } };
    const text = await data.text();
    return { ok: true, data: text };
}
export async function putUserGraph(userId, name, content) {
    if (!supabase)
        return { ok: false, error: { message: 'Supabase not configured' } };
    const path = objectPath(userId, name);
    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, new Blob([content], { type: 'application/json' }), {
        upsert: true,
        contentType: 'application/json'
    });
    if (error)
        return { ok: false, error: { message: error.message } };
    return { ok: true, data: { path } };
}

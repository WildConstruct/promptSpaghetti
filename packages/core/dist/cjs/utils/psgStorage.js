"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUserGraphs = listUserGraphs;
exports.getUserGraph = getUserGraph;
exports.putUserGraph = putUserGraph;
const supabaseClient_1 = require("./supabaseClient");
const BUCKET = 'graphs';
const pathPrefix = (userId) => `users/${userId}/graphs/`;
const objectPath = (userId, name) => `${pathPrefix(userId)}${name}`;
async function listUserGraphs(userId) {
    if (!supabaseClient_1.supabase)
        return { ok: false, error: { message: 'Supabase not configured' } };
    const prefix = pathPrefix(userId);
    const { data, error } = await supabaseClient_1.supabase.storage.from(BUCKET).list(prefix, {
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
async function getUserGraph(userId, name) {
    if (!supabaseClient_1.supabase)
        return { ok: false, error: { message: 'Supabase not configured' } };
    const path = objectPath(userId, name);
    const { data, error } = await supabaseClient_1.supabase.storage.from(BUCKET).download(path);
    if (error)
        return { ok: false, error: { message: error.message } };
    const value = data;
    // Decode blob-like, buffers, or strings without relying on global Response
    let text;
    const hasMethod = (obj, name) => typeof obj === 'object' &&
        obj !== null &&
        name in obj &&
        typeof obj[name] === 'function';
    if (hasMethod(value, 'text')) {
        text = (await value.text());
    }
    else if (hasMethod(value, 'arrayBuffer')) {
        const buf = (await value.arrayBuffer());
        text = new TextDecoder().decode(buf);
    }
    else if (typeof globalThis.Response !== 'undefined') {
        text = await new globalThis.Response(value).text();
    }
    else if (typeof globalThis.FileReader !== 'undefined') {
        text = await new Promise((resolve, reject) => {
            try {
                const fr = new globalThis.FileReader();
                fr.onload = () => resolve(String(fr.result ?? ''));
                fr.onerror = (e) => reject(e);
                fr.readAsText(value);
            }
            catch (e) {
                resolve(String(value));
            }
        });
    }
    else if (typeof value === 'string') {
        text = value;
    }
    else if (value instanceof Uint8Array) {
        text = new TextDecoder().decode(value);
    }
    else if (value instanceof ArrayBuffer) {
        text = new TextDecoder().decode(new Uint8Array(value));
    }
    else {
        text = String(value);
    }
    return { ok: true, data: text };
}
async function putUserGraph(userId, name, content) {
    if (!supabaseClient_1.supabase)
        return { ok: false, error: { message: 'Supabase not configured' } };
    const path = objectPath(userId, name);
    const { error } = await supabaseClient_1.supabase.storage
        .from(BUCKET)
        .upload(path, new Blob([content], { type: 'application/json' }), {
        upsert: true,
        contentType: 'application/json'
    });
    if (error)
        return { ok: false, error: { message: error.message } };
    return { ok: true, data: { path } };
}

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
    const text = await data.text();
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

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUserGraphs = listUserGraphs;
exports.getUserGraph = getUserGraph;
exports.putUserGraph = putUserGraph;
const supabaseClient = __importStar(require("./supabaseClient"));
const BUCKET = 'graphs';
const pathPrefix = (userId) => `users/${userId}/graphs/`;
const objectPath = (userId, name) => `${pathPrefix(userId)}${name}`;
function resolveSupabase() {
    const moduleRef = supabaseClient;
    const getter = moduleRef.getSupabase ?? moduleRef.default?.getSupabase;
    if (typeof getter === 'function') {
        return getter();
    }
    return moduleRef.supabase ?? moduleRef.default?.supabase ?? null;
}
async function listUserGraphs(userId) {
    const supabase = resolveSupabase();
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
        .filter((x) => x.name.endsWith('.psg'))
        .map((x) => ({ name: x.name }));
    return { ok: true, data: files };
}
async function getUserGraph(userId, name) {
    const supabase = resolveSupabase();
    if (!supabase) {
        return { ok: false, error: { message: 'Supabase not configured' } };
    }
    const path = objectPath(userId, name);
    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    if (error) {
        return { ok: false, error: { message: error.message } };
    }
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
    else {
        const ResponseCtor = globalThis.Response;
        if (typeof ResponseCtor !== 'undefined') {
            text = await new ResponseCtor(value).text();
        }
        else {
            const FileReaderCtor = globalThis.FileReader;
            if (typeof FileReaderCtor !== 'undefined') {
                text = await new Promise((resolve, reject) => {
                    try {
                        const fr = new FileReaderCtor();
                        fr.onload = () => resolve(String(fr.result ?? ''));
                        fr.onerror = event => {
                            const reader = event.target;
                            reject(reader?.error ?? new Error('FileReader error'));
                        };
                        fr.readAsText(value);
                    }
                    catch {
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
        }
    }
    return { ok: true, data: text };
}
async function putUserGraph(userId, name, content) {
    const supabase = resolveSupabase();
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

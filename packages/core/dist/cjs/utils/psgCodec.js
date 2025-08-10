"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPsg = readPsg;
exports.writePsg = writePsg;
exports.fromLegacyGraph = fromLegacyGraph;
const zod_1 = require("zod");
const GraphNodeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.string(),
    label: zod_1.z.string().optional(),
    data: zod_1.z.record(zod_1.z.unknown()).optional()
});
const GraphEdgeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    source: zod_1.z.string(),
    target: zod_1.z.string(),
    label: zod_1.z.string().optional(),
    data: zod_1.z.record(zod_1.z.unknown()).optional()
});
const GraphSchema = zod_1.z.object({
    nodes: zod_1.z.array(GraphNodeSchema),
    edges: zod_1.z.array(GraphEdgeSchema),
    layout: zod_1.z.record(zod_1.z.unknown()).optional(),
    settings: zod_1.z.record(zod_1.z.unknown()).optional()
});
const PSGFileSchema = zod_1.z.object({
    version: zod_1.z.string(),
    kind: zod_1.z.literal('graph'),
    meta: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        createdAt: zod_1.z.string(),
        updatedAt: zod_1.z.string(),
        author: zod_1.z
            .object({ id: zod_1.z.string().optional(), name: zod_1.z.string().optional() })
            .optional()
    }),
    graph: GraphSchema,
    extras: zod_1.z
        .object({
        previewUrl: zod_1.z.string().url().optional(),
        thumbSeed: zod_1.z.string().optional()
    })
        .catchall(zod_1.z.unknown())
        .optional()
});
function readPsg(text) {
    const json = JSON.parse(text);
    const parsed = PSGFileSchema.parse(json);
    return parsed;
}
function writePsg(psg) {
    PSGFileSchema.parse(psg);
    return JSON.stringify(psg, null, 2);
}
function fromLegacyGraph(name, graph) {
    const now = new Date().toISOString();
    const psg = {
        version: '1.0',
        kind: 'graph',
        meta: { id: cryptoRandomId(), name, createdAt: now, updatedAt: now },
        graph
    };
    PSGFileSchema.parse(psg);
    return psg;
}
function cryptoRandomId() {
    const c = globalThis.crypto;
    if (c?.randomUUID)
        return c.randomUUID();
    return 'psg_' + Math.random().toString(36).slice(2, 10);
}

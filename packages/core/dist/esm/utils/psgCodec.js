import { z, ZodError } from 'zod';
export var PSGErrorType;
(function (PSGErrorType) {
    PSGErrorType["INVALID_JSON"] = "INVALID_JSON";
    PSGErrorType["INVALID_SCHEMA"] = "INVALID_SCHEMA";
    PSGErrorType["CORRUPTED_DATA"] = "CORRUPTED_DATA";
    PSGErrorType["VERSION_INCOMPATIBLE"] = "VERSION_INCOMPATIBLE";
    PSGErrorType["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
    PSGErrorType["MISSING_REQUIRED_FIELDS"] = "MISSING_REQUIRED_FIELDS";
    PSGErrorType["INVALID_NODE_DATA"] = "INVALID_NODE_DATA";
    PSGErrorType["INVALID_EDGE_DATA"] = "INVALID_EDGE_DATA";
    PSGErrorType["SECURITY_VIOLATION"] = "SECURITY_VIOLATION";
})(PSGErrorType || (PSGErrorType = {}));
export class PSGValidationError extends Error {
    error;
    constructor(error) {
        super(error.message);
        this.error = error;
        this.name = 'PSGValidationError';
    }
}
const GraphNodeSchema = z.object({
    id: z.string(),
    type: z.string(),
    label: z.string().optional(),
    data: z.record(z.unknown()).optional()
});
const GraphEdgeSchema = z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
    data: z.record(z.unknown()).optional()
});
const GraphSchema = z.object({
    nodes: z.array(GraphNodeSchema),
    edges: z.array(GraphEdgeSchema),
    layout: z.record(z.unknown()).optional(),
    settings: z.record(z.unknown()).optional()
});
const PSGFileSchema = z.object({
    version: z.string(),
    kind: z.literal('graph'),
    meta: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        createdAt: z.string(),
        updatedAt: z.string(),
        author: z
            .object({ id: z.string().optional(), name: z.string().optional() })
            .optional()
    }),
    graph: GraphSchema,
    extras: z
        .object({
        previewUrl: z.string().url().optional(),
        thumbSeed: z.string().optional()
    })
        .catchall(z.unknown())
        .optional()
});
// Legacy graph-wrapper PSG codec.
// The active MVP source contract is the flat PSG format in fileFormats/psg.ts.
export function looksLikeLegacyGraphWrapper(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const record = value;
    return (record.kind === 'graph' &&
        typeof record.version === 'string' &&
        !!record.graph &&
        typeof record.graph === 'object');
}
export function readPsg(text, options = {}) {
    const { maxFileSize = 10 * 1024 * 1024, strictValidation = true } = options;
    if (text.length > maxFileSize) {
        throw new PSGValidationError({
            type: PSGErrorType.FILE_TOO_LARGE,
            message: `File size exceeds maximum allowed size of ${maxFileSize} bytes`,
            details: { actualSize: text.length, maxSize: maxFileSize },
            suggestions: ['Reduce the file size or increase the maximum allowed size']
        });
    }
    let json;
    try {
        json = JSON.parse(text);
    }
    catch (e) {
        throw new PSGValidationError({
            type: PSGErrorType.INVALID_JSON,
            message: 'Invalid JSON syntax',
            details: { parseError: e instanceof Error ? e.message : String(e) },
            suggestions: ['Check for syntax errors in your JSON file']
        });
    }
    const securityError = checkSecurityViolations(json);
    if (securityError) {
        throw new PSGValidationError(securityError);
    }
    let parsed;
    try {
        parsed = PSGFileSchema.parse(json);
    }
    catch (e) {
        if (e instanceof ZodError) {
            throw new PSGValidationError(mapZodErrorToPSGError(e));
        }
        throw e;
    }
    if (strictValidation) {
        const consistencyError = checkDataConsistency(parsed);
        if (consistencyError) {
            throw new PSGValidationError(consistencyError);
        }
    }
    return parsed;
}
export function writePsg(psg) {
    PSGFileSchema.parse(psg);
    return JSON.stringify(psg, null, 2);
}
export function fromLegacyGraph(name, graph, options) {
    const nowIso = options?.now ? options.now() : new Date().toISOString();
    const id = options?.idFactory ? options.idFactory() : cryptoRandomId();
    const psg = {
        version: '1.0',
        kind: 'graph',
        meta: { id, name, createdAt: nowIso, updatedAt: nowIso },
        graph
    };
    PSGFileSchema.parse(psg);
    return psg;
}
export function roundTripTest(psg) {
    try {
        const serialized = writePsg(psg);
        const deserialized = readPsg(serialized);
        const normalize = (obj) => JSON.parse(JSON.stringify(obj));
        return (JSON.stringify(normalize(psg)) === JSON.stringify(normalize(deserialized)));
    }
    catch {
        return false;
    }
}
function cryptoRandomId() {
    const c = globalThis.crypto;
    if (c?.randomUUID) {
        return c.randomUUID();
    }
    return 'psg_' + Math.random().toString(36).slice(2, 10);
}
function checkSecurityViolations(obj, path = '') {
    if (!obj || typeof obj !== 'object') {
        return null;
    }
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    const xssPatterns = [/javascript:/i, /<script/i, /eval\(/i];
    const record = obj;
    for (const key of Object.keys(record)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (dangerousKeys.includes(key)) {
            return {
                type: PSGErrorType.SECURITY_VIOLATION,
                message: `Dangerous property detected: "${key}"`,
                details: { path: currentPath },
                suggestions: ['Remove dangerous properties from the file']
            };
        }
        const value = record[key];
        if (typeof value === 'string') {
            for (const pattern of xssPatterns) {
                if (pattern.test(value)) {
                    return {
                        type: PSGErrorType.SECURITY_VIOLATION,
                        message: `Potential XSS pattern detected in "${currentPath}"`,
                        details: { path: currentPath, value },
                        suggestions: ['Remove potentially malicious content']
                    };
                }
            }
        }
        if (typeof value === 'object' && value !== null) {
            const nested = checkSecurityViolations(value, currentPath);
            if (nested) {
                return nested;
            }
        }
    }
    return null;
}
function checkDataConsistency(psg) {
    const nodeIds = new Set(psg.graph.nodes.map(n => n.id));
    const duplicateNodes = psg.graph.nodes.filter((node, index, arr) => arr.findIndex(n => n.id === node.id) !== index);
    if (duplicateNodes.length > 0) {
        return {
            type: PSGErrorType.INVALID_NODE_DATA,
            message: 'Duplicate node IDs detected',
            details: { duplicates: duplicateNodes.map(n => n.id) },
            suggestions: ['Ensure all node IDs are unique']
        };
    }
    for (const edge of psg.graph.edges) {
        if (!nodeIds.has(edge.source)) {
            return {
                type: PSGErrorType.INVALID_EDGE_DATA,
                message: `Edge references non-existent source node: "${edge.source}"`,
                details: { edgeId: edge.id, source: edge.source },
                suggestions: ['Ensure all edge sources reference existing nodes']
            };
        }
        if (!nodeIds.has(edge.target)) {
            return {
                type: PSGErrorType.INVALID_EDGE_DATA,
                message: `Edge references non-existent target node: "${edge.target}"`,
                details: { edgeId: edge.id, target: edge.target },
                suggestions: ['Ensure all edge targets reference existing nodes']
            };
        }
    }
    return null;
}
function mapZodErrorToPSGError(error) {
    const pathErrorMap = {
        'meta.id': 'Graph ID is required',
        'meta.name': 'Graph name is required',
        'meta.createdAt': 'Creation timestamp is required',
        'meta.updatedAt': 'Update timestamp is required',
        'graph.nodes': 'Graph must contain a nodes array',
        'graph.edges': 'Graph must contain an edges array',
        version: 'Version field is required',
        kind: 'Kind must be "graph"'
    };
    const issues = error.issues;
    const paths = issues.map(i => i.path.join('.'));
    for (const [path, message] of Object.entries(pathErrorMap)) {
        if (paths.includes(path)) {
            return {
                type: PSGErrorType.MISSING_REQUIRED_FIELDS,
                message,
                details: { paths, rawErrors: issues },
                suggestions: [`Add the missing "${path}" field to your PSG file`]
            };
        }
    }
    return {
        type: PSGErrorType.INVALID_SCHEMA,
        message: 'Invalid PSG file structure',
        details: { paths, rawErrors: issues },
        suggestions: ['Check that your PSG file matches the required schema']
    };
}

"use strict";
/**
 * PSGLib File Format Implementation
 * Version 1.0.0 with PM requirements for analytics and future-proofing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PSGLibError = exports.PSGLibErrorType = exports.PSGLibFileSchema = exports.PSGLibEdgeSchema = exports.PSGLibNodeSchema = exports.PSGLibMetadataSchema = void 0;
exports.parsePSGLib = parsePSGLib;
exports.serializePSGLib = serializePSGLib;
exports.createPSGLib = createPSGLib;
exports.trackPresetUsage = trackPresetUsage;
exports.regenerateNodeIds = regenerateNodeIds;
const zod_1 = require("zod");
// PSGLib metadata schema with PM requirements
exports.PSGLibMetadataSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    author: zod_1.z.string(),
    version: zod_1.z.string(),
    tags: zod_1.z.array(zod_1.z.string()),
    nodeTypes: zod_1.z.array(zod_1.z.string()),
    thumbnail: zod_1.z.string().optional(),
    lastModified: zod_1.z.string(),
    // PM Requirement: Future-proofing for marketplace
    license: zod_1.z
        .enum(['MIT', 'CC-BY', 'CC-BY-SA', 'CC0', 'proprietary', 'custom'])
        .default('MIT'),
    // PM Requirement: Analytics tracking
    usageStats: zod_1.z
        .object({
        timesUsed: zod_1.z.number().default(0),
        lastUsed: zod_1.z.string().nullable().default(null),
        popularity: zod_1.z.number().default(0)
    })
        .default({
        timesUsed: 0,
        lastUsed: null,
        popularity: 0
    }),
    // PM Requirement: Reserved for future marketplace
    marketplace: zod_1.z
        .object({
        price: zod_1.z.number().nullable().default(null),
        rating: zod_1.z.number().nullable().default(null),
        downloads: zod_1.z.number().default(0)
    })
        .optional()
});
// Node schema (matching PSG format)
exports.PSGLibNodeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.string(),
    position: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number()
    }),
    data: zod_1.z.record(zod_1.z.any()),
    size: zod_1.z
        .object({
        width: zod_1.z.number(),
        height: zod_1.z.number()
    })
        .optional(),
    style: zod_1.z.record(zod_1.z.any()).optional(),
    label: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional()
});
// Edge schema (matching PSG format)
exports.PSGLibEdgeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    source: zod_1.z.string(),
    target: zod_1.z.string(),
    sourceHandle: zod_1.z.string().optional(),
    targetHandle: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    data: zod_1.z.record(zod_1.z.any()).optional()
});
// Complete PSGLib file schema
exports.PSGLibFileSchema = zod_1.z.object({
    fileType: zod_1.z.literal('psglib'),
    formatVersion: zod_1.z.string().regex(/^\d+\.\d+\.\d+$/), // Semantic versioning
    metadata: exports.PSGLibMetadataSchema,
    graph: zod_1.z.object({
        nodes: zod_1.z.array(exports.PSGLibNodeSchema),
        edges: zod_1.z.array(exports.PSGLibEdgeSchema),
        settings: zod_1.z.record(zod_1.z.any()).optional()
    })
});
// Error types for better error handling
var PSGLibErrorType;
(function (PSGLibErrorType) {
    PSGLibErrorType["INVALID_JSON"] = "INVALID_JSON";
    PSGLibErrorType["INVALID_SCHEMA"] = "INVALID_SCHEMA";
    PSGLibErrorType["VERSION_INCOMPATIBLE"] = "VERSION_INCOMPATIBLE";
    PSGLibErrorType["CORRUPTED_DATA"] = "CORRUPTED_DATA";
    PSGLibErrorType["CIRCULAR_DEPENDENCY"] = "CIRCULAR_DEPENDENCY";
})(PSGLibErrorType || (exports.PSGLibErrorType = PSGLibErrorType = {}));
class PSGLibError extends Error {
    constructor(type, message, details) {
        super(message);
        this.type = type;
        this.details = details;
        this.name = 'PSGLibError';
    }
}
exports.PSGLibError = PSGLibError;
/**
 * Parse a PSGLib file from JSON string
 */
function parsePSGLib(jsonString) {
    try {
        // Parse JSON
        let data;
        try {
            data = JSON.parse(jsonString);
        }
        catch (e) {
            throw new PSGLibError(PSGLibErrorType.INVALID_JSON, 'Invalid JSON format', e);
        }
        // Validate schema
        const result = exports.PSGLibFileSchema.safeParse(data);
        if (!result.success) {
            throw new PSGLibError(PSGLibErrorType.INVALID_SCHEMA, 'Invalid PSGLib schema', result.error.errors);
        }
        // Check version compatibility (1.x.x is compatible)
        const version = result.data.formatVersion;
        const majorVersion = parseInt(version.split('.')[0]);
        if (majorVersion !== 1) {
            throw new PSGLibError(PSGLibErrorType.VERSION_INCOMPATIBLE, `Incompatible version ${version}. Expected 1.x.x`, { version });
        }
        // Validate no circular dependencies
        validateNoCycles(result.data.graph.nodes, result.data.graph.edges);
        return result.data;
    }
    catch (error) {
        if (error instanceof PSGLibError) {
            throw error;
        }
        throw new PSGLibError(PSGLibErrorType.CORRUPTED_DATA, 'Failed to parse PSGLib file', error);
    }
}
/**
 * Serialize a PSGLib file to JSON string
 */
function serializePSGLib(psglib, pretty = true) {
    try {
        // Validate before serialization
        const result = exports.PSGLibFileSchema.safeParse(psglib);
        if (!result.success) {
            throw new PSGLibError(PSGLibErrorType.INVALID_SCHEMA, 'Invalid PSGLib data', result.error.errors);
        }
        // Update lastModified
        result.data.metadata.lastModified = new Date().toISOString();
        return JSON.stringify(result.data, null, pretty ? 2 : 0);
    }
    catch (error) {
        if (error instanceof PSGLibError) {
            throw error;
        }
        throw new PSGLibError(PSGLibErrorType.CORRUPTED_DATA, 'Failed to serialize PSGLib file', error);
    }
}
/**
 * Create a new PSGLib file from nodes and edges
 */
function createPSGLib(nodes, edges, metadata) {
    const now = new Date().toISOString();
    // Generate unique ID if not provided
    const id = metadata.id ||
        `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Extract node types from nodes
    const nodeTypes = [...new Set(nodes.map(n => n.type))];
    const fullMetadata = {
        id,
        name: metadata.name || 'Untitled Preset',
        description: metadata.description || '',
        author: metadata.author || 'Unknown',
        version: metadata.version || '1.0.0',
        tags: metadata.tags || [],
        nodeTypes,
        thumbnail: metadata.thumbnail,
        lastModified: now,
        license: metadata.license || 'MIT',
        usageStats: metadata.usageStats || {
            timesUsed: 0,
            lastUsed: null,
            popularity: 0
        },
        marketplace: metadata.marketplace
    };
    return {
        fileType: 'psglib',
        formatVersion: '1.0.0',
        metadata: fullMetadata,
        graph: {
            nodes,
            edges,
            settings: {}
        }
    };
}
/**
 * Validate that the graph has no circular dependencies
 */
function validateNoCycles(nodes, edges) {
    const nodeIds = new Set(nodes.map(n => n.id));
    const adjacency = new Map();
    // Build adjacency list
    for (const edge of edges) {
        if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
            throw new PSGLibError(PSGLibErrorType.CORRUPTED_DATA, 'Edge references non-existent node', { edge });
        }
        if (!adjacency.has(edge.source)) {
            adjacency.set(edge.source, new Set());
        }
        adjacency.get(edge.source).add(edge.target);
    }
    // DFS to detect cycles
    const visited = new Set();
    const recursionStack = new Set();
    function hasCycle(nodeId) {
        visited.add(nodeId);
        recursionStack.add(nodeId);
        const neighbors = adjacency.get(nodeId) || new Set();
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                if (hasCycle(neighbor)) {
                    return true;
                }
            }
            else if (recursionStack.has(neighbor)) {
                return true;
            }
        }
        recursionStack.delete(nodeId);
        return false;
    }
    for (const nodeId of nodeIds) {
        if (!visited.has(nodeId)) {
            if (hasCycle(nodeId)) {
                throw new PSGLibError(PSGLibErrorType.CIRCULAR_DEPENDENCY, 'Graph contains circular dependencies', { nodeId });
            }
        }
    }
}
/**
 * Track preset usage for analytics (PM requirement)
 */
function trackPresetUsage(preset, action) {
    // Update usage stats
    preset.metadata.usageStats.timesUsed++;
    preset.metadata.usageStats.lastUsed = new Date().toISOString();
    // Send analytics event (integrate with analytics service)
    if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.track('preset_usage', {
            preset_id: preset.metadata.id,
            preset_name: preset.metadata.name,
            action,
            timestamp: new Date().toISOString(),
            node_count: preset.graph.nodes.length,
            tags: preset.metadata.tags
        });
    }
}
/**
 * Regenerate node IDs to avoid conflicts on import
 */
function regenerateNodeIds(nodes, edges) {
    const idMap = new Map();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const counter = Math.floor(Math.random() * 100000); // Add extra randomness
    // Generate new IDs for nodes with better uniqueness
    const newNodes = nodes.map((node, index) => {
        // Create a truly unique ID that won't conflict
        const newId = `node-${timestamp}-${random}-${counter}-${index}`;
        idMap.set(node.id, newId);
        return { ...node, id: newId };
    });
    // Update edge references with unique IDs
    const newEdges = edges.map((edge, index) => ({
        ...edge,
        id: `edge-${timestamp}-${random}-${counter}-${index}`,
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target
    }));
    return { nodes: newNodes, edges: newEdges };
}

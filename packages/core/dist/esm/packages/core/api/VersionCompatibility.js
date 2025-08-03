/**
 * API Version Compatibility Layer
 * Ensures backward compatibility during Epic 1 migration
 */
import { z } from 'zod';
/**
 * API compatibility manager
 */
export class APICompatibilityManager {
    static instance;
    endpoints = new Map();
    globalVersion = 'v1';
    static getInstance() {
        if (!this.instance) {
            this.instance = new APICompatibilityManager();
        }
        return this.instance;
    }
    constructor() {
        this.initializeEndpoints();
    }
    /**
     * Initialize endpoint versioning
     */
    initializeEndpoints() {
        // Preview endpoint versioning
        this.registerEndpoint({
            endpoint: '/api/preview',
            defaultVersion: 'v2',
            versions: new Map([
                ['v1', {
                        version: 'v1',
                        deprecated: true,
                        sunsetDate: new Date('2025-10-01'),
                        transformers: {
                            request: this.transformPreviewV1ToV2,
                            response: this.transformPreviewV2ToV1,
                        },
                    }],
                ['v2', {
                        version: 'v2',
                    }],
            ]),
        });
        // Execute endpoint versioning
        this.registerEndpoint({
            endpoint: '/api/execute',
            defaultVersion: 'v2',
            versions: new Map([
                ['v1', {
                        version: 'v1',
                        deprecated: true,
                        sunsetDate: new Date('2025-09-01'),
                        transformers: {
                            request: this.transformExecuteV1ToV2,
                            response: this.transformExecuteV2ToV1,
                        },
                    }],
                ['v2', {
                        version: 'v2',
                    }],
            ]),
        });
        // Graph save endpoint
        this.registerEndpoint({
            endpoint: '/api/graph',
            defaultVersion: 'v2',
            versions: new Map([
                ['v1', {
                        version: 'v1',
                        deprecated: false, // Still supported
                        transformers: {
                            request: this.transformGraphV1ToV2,
                            response: this.transformGraphV2ToV1,
                        },
                    }],
                ['v2', {
                        version: 'v2',
                    }],
            ]),
        });
    }
    /**
     * Register an endpoint with versioning
     */
    registerEndpoint(config) {
        this.endpoints.set(config.endpoint, config);
    }
    /**
     * Get version for request
     */
    getRequestVersion(endpoint, headers) {
        const config = this.endpoints.get(endpoint);
        if (!config) {
            return this.globalVersion;
        }
        // Check header for version
        const requestedVersion = headers['x-api-version'] || headers['api-version'];
        if (requestedVersion && config.versions.has(requestedVersion)) {
            return requestedVersion;
        }
        return config.defaultVersion;
    }
    /**
     * Transform request data for compatibility
     */
    transformRequest(endpoint, version, data) {
        const config = this.endpoints.get(endpoint);
        if (!config)
            return data;
        const versionConfig = config.versions.get(version);
        if (!versionConfig?.transformers?.request)
            return data;
        return versionConfig.transformers.request(data);
    }
    /**
     * Transform response data for compatibility
     */
    transformResponse(endpoint, version, data) {
        const config = this.endpoints.get(endpoint);
        if (!config)
            return data;
        const versionConfig = config.versions.get(version);
        if (!versionConfig?.transformers?.response)
            return data;
        return versionConfig.transformers.response(data);
    }
    /**
     * Check if version is deprecated
     */
    isVersionDeprecated(endpoint, version) {
        const config = this.endpoints.get(endpoint);
        if (!config)
            return { deprecated: false };
        const versionConfig = config.versions.get(version);
        if (!versionConfig)
            return { deprecated: false };
        return {
            deprecated: versionConfig.deprecated || false,
            sunsetDate: versionConfig.sunsetDate,
        };
    }
    // Transform functions for different endpoints
    /**
     * Transform preview v1 to v2
     */
    transformPreviewV1ToV2(data) {
        // v1 format: { graph: {...}, seedCount: 5 }
        // v2 format: { graph: {...}, seeds: [1,2,3,4,5], options: {...} }
        const seedCount = data.seedCount || 5;
        const seeds = Array.from({ length: seedCount }, (_, i) => i + 1);
        return {
            graph: data.graph,
            seeds,
            options: {
                includeMetadata: true,
                maxExecutionTime: 5000,
            },
        };
    }
    /**
     * Transform preview v2 to v1
     */
    transformPreviewV2ToV1(data) {
        // v2 format: { results: [...], metadata: {...} }
        // v1 format: { outputs: [...] }
        return {
            outputs: data.results?.map((r) => r.output) || [],
        };
    }
    /**
     * Transform execute v1 to v2
     */
    transformExecuteV1ToV2(data) {
        // v1 format: { nodes: [...], edges: [...], seed: 123 }
        // v2 format: { graph: { nodes: [...], edges: [...] }, executionOptions: {...} }
        return {
            graph: {
                nodes: data.nodes,
                edges: data.edges,
            },
            executionOptions: {
                seed: data.seed,
                timeout: 10000,
                memoryLimit: 512 * 1024 * 1024, // 512MB
            },
        };
    }
    /**
     * Transform execute v2 to v1
     */
    transformExecuteV2ToV1(data) {
        // v2 format: { result: {...}, performance: {...} }
        // v1 format: { output: "..." }
        return {
            output: data.result?.output || '',
        };
    }
    /**
     * Transform graph v1 to v2
     */
    transformGraphV1ToV2(data) {
        // v1 format: legacy graph structure
        // v2 format: PSG file format
        const nodes = data.nodes?.map((node) => ({
            id: node.id,
            type: node.type,
            data: {
                ...node.data,
                inlineEditing: {
                    enabled: true,
                    editState: 'idle',
                },
            },
            position: node.position,
        })) || [];
        return {
            version: '2.0',
            metadata: {
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                format: 'psg',
            },
            graph: {
                nodes,
                edges: data.edges || [],
            },
            settings: {
                autoSave: true,
                snapToGrid: true,
            },
        };
    }
    /**
     * Transform graph v2 to v1
     */
    transformGraphV2ToV1(data) {
        // v2 format: PSG file format
        // v1 format: legacy graph structure
        return {
            nodes: data.graph?.nodes || [],
            edges: data.graph?.edges || [],
        };
    }
}
/**
 * Express/Fastify middleware for API versioning
 */
export function apiVersioningMiddleware(req, res, next) {
    const manager = APICompatibilityManager.getInstance();
    const endpoint = req.path;
    const version = manager.getRequestVersion(endpoint, req.headers);
    // Store version in request
    req.apiVersion = version;
    // Check deprecation
    const { deprecated, sunsetDate } = manager.isVersionDeprecated(endpoint, version);
    if (deprecated) {
        res.setHeader('X-API-Deprecated', 'true');
        if (sunsetDate) {
            res.setHeader('X-API-Sunset-Date', sunsetDate.toISOString());
        }
        res.setHeader('X-API-Deprecation-Message', `This API version is deprecated. Please migrate to the latest version.`);
    }
    // Transform request if needed
    if (req.body) {
        req.body = manager.transformRequest(endpoint, version, req.body);
    }
    // Hook into response to transform
    const originalSend = res.send;
    res.send = function (data) {
        if (typeof data === 'object') {
            data = manager.transformResponse(endpoint, version, data);
        }
        return originalSend.call(this, data);
    };
    next();
}
/**
 * Schema migration utilities
 */
export class SchemaMigration {
    /**
     * Migrate graph from v1 to v2
     */
    static migrateGraphV1ToV2(v1Graph) {
        const v2Schema = z.object({
            version: z.literal('2.0'),
            metadata: z.object({
                createdAt: z.string(),
                lastModified: z.string(),
                format: z.literal('psg'),
            }),
            graph: z.object({
                nodes: z.array(z.object({
                    id: z.string(),
                    type: z.string(),
                    data: z.record(z.any()),
                    position: z.object({
                        x: z.number(),
                        y: z.number(),
                    }),
                })),
                edges: z.array(z.object({
                    id: z.string(),
                    source: z.string(),
                    target: z.string(),
                    sourceHandle: z.string().optional(),
                    targetHandle: z.string().optional(),
                })),
            }),
            settings: z.object({
                autoSave: z.boolean(),
                snapToGrid: z.boolean(),
            }),
        });
        const migrated = {
            version: '2.0',
            metadata: {
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                format: 'psg',
            },
            graph: {
                nodes: v1Graph.nodes || [],
                edges: v1Graph.edges || [],
            },
            settings: {
                autoSave: true,
                snapToGrid: true,
            },
        };
        // Validate migrated data
        return v2Schema.parse(migrated);
    }
    /**
     * Check if migration is needed
     */
    static needsMigration(data) {
        return !data.version || data.version < '2.0';
    }
}

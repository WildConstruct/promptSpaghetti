"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionPointRegistry = exports.ExtensionPointRegistry = exports.ExtensionPointSchema = exports.ExtensionPointPriority = exports.ExtensionPointLifecycle = exports.ExtensionPointCategory = void 0;
const zod_1 = require("zod");
var ExtensionPointCategory;
(function (ExtensionPointCategory) {
    ExtensionPointCategory["RUNTIME"] = "runtime";
    ExtensionPointCategory["UI"] = "ui";
    ExtensionPointCategory["SCHEMA"] = "schema";
    ExtensionPointCategory["API"] = "api";
    ExtensionPointCategory["STATE"] = "state";
    ExtensionPointCategory["VALIDATION"] = "validation";
    ExtensionPointCategory["VISUALIZATION"] = "visualization";
    ExtensionPointCategory["STORAGE"] = "storage";
})(ExtensionPointCategory || (exports.ExtensionPointCategory = ExtensionPointCategory = {}));
var ExtensionPointLifecycle;
(function (ExtensionPointLifecycle) {
    ExtensionPointLifecycle["EXPERIMENTAL"] = "experimental";
    ExtensionPointLifecycle["STABLE"] = "stable";
    ExtensionPointLifecycle["DEPRECATED"] = "deprecated";
    ExtensionPointLifecycle["REMOVED"] = "removed";
})(ExtensionPointLifecycle || (exports.ExtensionPointLifecycle = ExtensionPointLifecycle = {}));
var ExtensionPointPriority;
(function (ExtensionPointPriority) {
    ExtensionPointPriority["CRITICAL"] = "critical";
    ExtensionPointPriority["HIGH"] = "high";
    ExtensionPointPriority["MEDIUM"] = "medium";
    ExtensionPointPriority["LOW"] = "low";
})(ExtensionPointPriority || (exports.ExtensionPointPriority = ExtensionPointPriority = {}));
exports.ExtensionPointSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    category: zod_1.z.nativeEnum(ExtensionPointCategory),
    priority: zod_1.z.nativeEnum(ExtensionPointPriority),
    lifecycle: zod_1.z.nativeEnum(ExtensionPointLifecycle),
    version: zod_1.z.string(),
    location: zod_1.z.object({
        file: zod_1.z.string(),
        line: zod_1.z.number().optional(),
        function: zod_1.z.string().optional()
    }),
    interfaces: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        parameters: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            type: zod_1.z.string(),
            required: zod_1.z.boolean(),
            description: zod_1.z.string(),
            defaultValue: zod_1.z.any().optional()
        })),
        returnType: zod_1.z.string(),
        examples: zod_1.z.array(zod_1.z.string()).optional()
    })),
    dependencies: zod_1.z.array(zod_1.z.string()).optional(),
    examples: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        code: zod_1.z.string(),
        language: zod_1.z.string()
    })).optional(),
    constraints: zod_1.z.object({
        performance: zod_1.z.object({
            maxExecutionTime: zod_1.z.number().optional(),
            maxMemoryUsage: zod_1.z.number().optional()
        }).optional(),
        security: zod_1.z.object({
            permissions: zod_1.z.array(zod_1.z.string()).optional(),
            sandboxed: zod_1.z.boolean().optional()
        }).optional()
    }).optional(),
    metadata: zod_1.z.object({
        addedIn: zod_1.z.string(),
        deprecatedIn: zod_1.z.string().optional(),
        removedIn: zod_1.z.string().optional(),
        replacedBy: zod_1.z.string().optional()
    })
});
class ExtensionPointRegistry {
    constructor() {
        this.extensionPoints = new Map();
        this.categoryIndex = new Map();
        this.locationIndex = new Map();
        this.initializeRegistry();
    }
    static getInstance() {
        if (!ExtensionPointRegistry.instance) {
            ExtensionPointRegistry.instance = new ExtensionPointRegistry();
        }
        return ExtensionPointRegistry.instance;
    }
    register(extensionPoint) {
        const validated = exports.ExtensionPointSchema.parse(extensionPoint);
        this.extensionPoints.set(validated.id, validated);
        if (!this.categoryIndex.has(validated.category)) {
            this.categoryIndex.set(validated.category, new Set());
        }
        this.categoryIndex.get(validated.category).add(validated.id);
        if (!this.locationIndex.has(validated.location.file)) {
            this.locationIndex.set(validated.location.file, new Set());
        }
        this.locationIndex.get(validated.location.file).add(validated.id);
    }
    get(id) {
        return this.extensionPoints.get(id);
    }
    getAll() {
        return Array.from(this.extensionPoints.values());
    }
    getByCategory(category) {
        const ids = this.categoryIndex.get(category) || new Set();
        return Array.from(ids).map(id => this.extensionPoints.get(id));
    }
    getByPriority(priority) {
        return this.getAll().filter(ep => ep.priority === priority);
    }
    getByLifecycle(lifecycle) {
        return this.getAll().filter(ep => ep.lifecycle === lifecycle);
    }
    getByLocation(file) {
        const ids = this.locationIndex.get(file) || new Set();
        return Array.from(ids).map(id => this.extensionPoints.get(id));
    }
    search(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.getAll().filter(ep => ep.name.toLowerCase().includes(lowercaseQuery) ||
            ep.description.toLowerCase().includes(lowercaseQuery) ||
            ep.id.toLowerCase().includes(lowercaseQuery));
    }
    getStatistics() {
        const stats = {
            total: this.extensionPoints.size,
            byCategory: {},
            byPriority: {},
            byLifecycle: {}
        };
        Object.values(ExtensionPointCategory).forEach(cat => {
            stats.byCategory[cat] = 0;
        });
        Object.values(ExtensionPointPriority).forEach(pri => {
            stats.byPriority[pri] = 0;
        });
        Object.values(ExtensionPointLifecycle).forEach(lc => {
            stats.byLifecycle[lc] = 0;
        });
        this.getAll().forEach(ep => {
            stats.byCategory[ep.category]++;
            stats.byPriority[ep.priority]++;
            stats.byLifecycle[ep.lifecycle]++;
        });
        return stats;
    }
    validateCompatibility(extensionPointId, version) {
        const extensionPoint = this.get(extensionPointId);
        if (!extensionPoint) {
            return {
                compatible: false,
                warnings: [],
                errors: [`Extension point ${extensionPointId} not found`]
            };
        }
        const warnings = [];
        const errors = [];
        if (extensionPoint.lifecycle === ExtensionPointLifecycle.DEPRECATED) {
            warnings.push(`Extension point ${extensionPointId} is deprecated`);
            if (extensionPoint.metadata.replacedBy) {
                warnings.push(`Consider using ${extensionPoint.metadata.replacedBy} instead`);
            }
        }
        if (extensionPoint.lifecycle === ExtensionPointLifecycle.REMOVED) {
            errors.push(`Extension point ${extensionPointId} has been removed`);
        }
        if (extensionPoint.metadata.removedIn && this.compareVersions(version, extensionPoint.metadata.removedIn) >= 0) {
            errors.push(`Extension point ${extensionPointId} is not available in version ${version}`);
        }
        return {
            compatible: errors.length === 0,
            warnings,
            errors
        };
    }
    initializeRegistry() {
        this.register({
            id: 'runtime.node.custom',
            name: 'Custom Runtime Node',
            description: 'Create custom node types with custom execution logic',
            category: ExtensionPointCategory.RUNTIME,
            priority: ExtensionPointPriority.CRITICAL,
            lifecycle: ExtensionPointLifecycle.STABLE,
            version: '1.0.0',
            location: {
                file: 'packages/core/runtime/index.ts',
                line: 12,
                function: 'RuntimeNode'
            },
            interfaces: [{
                    name: 'RuntimeNode',
                    description: 'Base class for all runtime nodes',
                    parameters: [
                        {
                            name: 'id',
                            type: 'string',
                            required: true,
                            description: 'Unique node identifier'
                        }
                    ],
                    returnType: 'TOutput',
                    examples: [
                        'class CustomNode extends RuntimeNode<string> { ... }'
                    ]
                }],
            dependencies: ['runtime.context'],
            examples: [{
                    name: 'Basic Custom Node',
                    description: 'Simple custom node implementation',
                    code: `
class CustomNode extends RuntimeNode<string> {
  constructor(id: string, private customData: string) {
    super(id);
  }

  run(ctx: ExecutionContext): string {
    return this.customData + ' processed';
  }
}`,
                    language: 'typescript'
                }],
            constraints: {
                performance: {
                    maxExecutionTime: 5000,
                    maxMemoryUsage: 100 * 1024 * 1024
                },
                security: {
                    permissions: ['runtime.execute'],
                    sandboxed: true
                }
            },
            metadata: {
                addedIn: '1.0.0'
            }
        });
        this.register({
            id: 'runtime.node.advanced',
            name: 'Advanced Runtime Node',
            description: 'Create advanced nodes with state management and caching',
            category: ExtensionPointCategory.RUNTIME,
            priority: ExtensionPointPriority.HIGH,
            lifecycle: ExtensionPointLifecycle.STABLE,
            version: '1.0.0',
            location: {
                file: 'packages/core/runtime/advanced.ts',
                line: 61,
                function: 'AdvancedRuntimeNode'
            },
            interfaces: [{
                    name: 'AdvancedRuntimeNode',
                    description: 'Advanced base class with state management',
                    parameters: [
                        {
                            name: 'id',
                            type: 'string',
                            required: true,
                            description: 'Unique node identifier'
                        },
                        {
                            name: 'config',
                            type: 'AdvancedNodeConfig',
                            required: true,
                            description: 'Advanced node configuration'
                        }
                    ],
                    returnType: 'TOutput',
                    examples: [
                        'class AdvancedCustomNode extends AdvancedRuntimeNode<string> { ... }'
                    ]
                }],
            dependencies: ['runtime.context.advanced', 'runtime.validation'],
            metadata: {
                addedIn: '1.0.0'
            }
        });
        this.register({
            id: 'ui.inspector.editor',
            name: 'Inspector Node Editor',
            description: 'Create custom editors for node configuration',
            category: ExtensionPointCategory.UI,
            priority: ExtensionPointPriority.HIGH,
            lifecycle: ExtensionPointLifecycle.STABLE,
            version: '1.0.0',
            location: {
                file: 'packages/core/components/Inspector/BaseNodeEditor.tsx',
                line: 1,
                function: 'BaseNodeEditor'
            },
            interfaces: [{
                    name: 'BaseNodeEditor',
                    description: 'Base component for node editors',
                    parameters: [
                        {
                            name: 'node',
                            type: 'any',
                            required: true,
                            description: 'Node data object'
                        },
                        {
                            name: 'onChange',
                            type: '(partial: Record<string, unknown>) => void',
                            required: true,
                            description: 'Change handler function'
                        }
                    ],
                    returnType: 'React.ReactElement',
                    examples: [
                        'export const CustomEditor: React.FC<BaseNodeEditorProps> = (props) => { ... }'
                    ]
                }],
            dependencies: ['ui.inspector.context'],
            metadata: {
                addedIn: '1.0.0'
            }
        });
        this.register({
            id: 'schema.node.validation',
            name: 'Node Schema Validation',
            description: 'Add validation schemas for new node types',
            category: ExtensionPointCategory.SCHEMA,
            priority: ExtensionPointPriority.HIGH,
            lifecycle: ExtensionPointLifecycle.STABLE,
            version: '1.0.0',
            location: {
                file: 'packages/core/graphSchema.ts',
                line: 7,
                function: 'NodeTypeEnum'
            },
            interfaces: [{
                    name: 'NodeSchema',
                    description: 'Zod schema for node validation',
                    parameters: [
                        {
                            name: 'type',
                            type: 'z.literal',
                            required: true,
                            description: 'Node type literal'
                        }
                    ],
                    returnType: 'ZodSchema',
                    examples: [
                        'export const CustomNodeSchema = BaseNode.extend({ ... })'
                    ]
                }],
            dependencies: ['schema.base'],
            metadata: {
                addedIn: '1.0.0'
            }
        });
        this.register({
            id: 'api.endpoint.custom',
            name: 'Custom API Endpoint',
            description: 'Add new API endpoints to the server',
            category: ExtensionPointCategory.API,
            priority: ExtensionPointPriority.MEDIUM,
            lifecycle: ExtensionPointLifecycle.STABLE,
            version: '1.0.0',
            location: {
                file: 'server/src/index.ts',
                line: 1,
                function: 'app'
            },
            interfaces: [{
                    name: 'APIEndpoint',
                    description: 'Fastify route handler',
                    parameters: [
                        {
                            name: 'request',
                            type: 'FastifyRequest',
                            required: true,
                            description: 'HTTP request object'
                        },
                        {
                            name: 'reply',
                            type: 'FastifyReply',
                            required: true,
                            description: 'HTTP reply object'
                        }
                    ],
                    returnType: 'Promise<void>',
                    examples: [
                        'app.post("/api/custom", async (req, reply) => { ... })'
                    ]
                }],
            dependencies: ['api.authentication'],
            metadata: {
                addedIn: '1.0.0'
            }
        });
    }
    compareVersions(version1, version2) {
        const v1parts = version1.split('.').map(Number);
        const v2parts = version2.split('.').map(Number);
        for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            if (v1part < v2part)
                return -1;
            if (v1part > v2part)
                return 1;
        }
        return 0;
    }
}
exports.ExtensionPointRegistry = ExtensionPointRegistry;
exports.extensionPointRegistry = ExtensionPointRegistry.getInstance();
//# sourceMappingURL=ExtensionPointRegistry.js.map
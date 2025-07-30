/**
 * Extension Point Registry - Epic 8.4 Story 8.4.1
 * Central registry for all extension points in the Prompt Spaghetti system
 */
import { z } from 'zod';
// Extension Point Categories
export var ExtensionPointCategory;
(function (ExtensionPointCategory) {
    ExtensionPointCategory["RUNTIME"] = "runtime";
    ExtensionPointCategory["UI"] = "ui";
    ExtensionPointCategory["SCHEMA"] = "schema";
    ExtensionPointCategory["API"] = "api";
    ExtensionPointCategory["STATE"] = "state";
    ExtensionPointCategory["VALIDATION"] = "validation";
    ExtensionPointCategory["VISUALIZATION"] = "visualization";
    ExtensionPointCategory["STORAGE"] = "storage";
})(ExtensionPointCategory || (ExtensionPointCategory = {}));
// Extension Point Lifecycle
export var ExtensionPointLifecycle;
(function (ExtensionPointLifecycle) {
    ExtensionPointLifecycle["EXPERIMENTAL"] = "experimental";
    ExtensionPointLifecycle["STABLE"] = "stable";
    ExtensionPointLifecycle["DEPRECATED"] = "deprecated";
    ExtensionPointLifecycle["REMOVED"] = "removed";
})(ExtensionPointLifecycle || (ExtensionPointLifecycle = {}));
// Extension Point Priority
export var ExtensionPointPriority;
(function (ExtensionPointPriority) {
    ExtensionPointPriority["CRITICAL"] = "critical";
    ExtensionPointPriority["HIGH"] = "high";
    ExtensionPointPriority["MEDIUM"] = "medium";
    ExtensionPointPriority["LOW"] = "low";
})(ExtensionPointPriority || (ExtensionPointPriority = {}));
// Extension Point Definition Schema
export const ExtensionPointSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.nativeEnum(ExtensionPointCategory),
    priority: z.nativeEnum(ExtensionPointPriority),
    lifecycle: z.nativeEnum(ExtensionPointLifecycle),
    version: z.string(),
    location: z.object({
        file: z.string(),
        line: z.number().optional(),
        function: z.string().optional(),
    }),
    interfaces: z.array(z.object({
        name: z.string(),
        description: z.string(),
        parameters: z.array(z.object({
            name: z.string(),
            type: z.string(),
            required: z.boolean(),
            description: z.string(),
            defaultValue: z.any().optional(),
        })),
        returnType: z.string(),
        examples: z.array(z.string()).optional()
    })),
    dependencies: z.array(z.string()).optional(),
    examples: z.array(z.object({
        name: z.string(),
        description: z.string(),
        code: z.string(),
        language: z.string(),
    })).optional(),
    constraints: z.object({
        performance: z.object({
            maxExecutionTime: z.number().optional(),
            maxMemoryUsage: z.number().optional(),
        }).optional(),
        security: z.object({
            permissions: z.array(z.string()).optional(),
            sandboxed: z.boolean().optional(),
        }).optional()
    }).optional(),
    metadata: z.object({
        addedIn: z.string(),
        deprecatedIn: z.string().optional(),
        removedIn: z.string().optional(),
        replacedBy: z.string().optional(),
    })
});
/**
 * Extension Point Registry - manages all extension points
 */
export class ExtensionPointRegistry {
    static instance;
    extensionPoints = new Map();
    categoryIndex = new Map();
    locationIndex = new Map();
    constructor() {
        this.initializeRegistry();
    }
    static getInstance() {
        if (!ExtensionPointRegistry.instance) {
            ExtensionPointRegistry.instance = new ExtensionPointRegistry();
        }
        return ExtensionPointRegistry.instance;
    }
    /**
     * Register an extension point
     */
    register(extensionPoint) {
        // Validate extension point
        const validated = ExtensionPointSchema.parse(extensionPoint);
        // Store in main registry
        this.extensionPoints.set(validated.id, validated);
        // Update category index
        if (!this.categoryIndex.has(validated.category)) {
            this.categoryIndex.set(validated.category, new Set());
        }
        this.categoryIndex.get(validated.category).add(validated.id);
        // Update location index
        if (!this.locationIndex.has(validated.location.file)) {
            this.locationIndex.set(validated.location.file, new Set());
        }
        this.locationIndex.get(validated.location.file).add(validated.id);
    }
    /**
     * Get extension point by ID
     */
    get(id) {
        return this.extensionPoints.get(id);
    }
    /**
     * Get all extension points
     */
    getAll() {
        return Array.from(this.extensionPoints.values());
    }
    /**
     * Get extension points by category
     */
    getByCategory(category) {
        const ids = this.categoryIndex.get(category) || new Set();
        return Array.from(ids).map(id => this.extensionPoints.get(id));
    }
    /**
     * Get extension points by priority
     */
    getByPriority(priority) {
        return this.getAll().filter(ep => ep.priority === priority);
    }
    /**
     * Get extension points by lifecycle status
     */
    getByLifecycle(lifecycle) {
        return this.getAll().filter(ep => ep.lifecycle === lifecycle);
    }
    /**
     * Get extension points by file location
     */
    getByLocation(file) {
        const ids = this.locationIndex.get(file) || new Set();
        return Array.from(ids).map(id => this.extensionPoints.get(id));
    }
    /**
     * Search extension points
     */
    search(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.getAll().filter(ep => ep.name.toLowerCase().includes(lowercaseQuery) ||
            ep.description.toLowerCase().includes(lowercaseQuery) ||
            ep.id.toLowerCase().includes(lowercaseQuery));
    }
    /**
     * Get extension point statistics
     */
    getStatistics() {
        const stats = {
            total: this.extensionPoints.size,
            byCategory: {},
            byPriority: {},
            byLifecycle: {}
        };
        // Initialize counters
        Object.values(ExtensionPointCategory).forEach(cat => {
            stats.byCategory[cat] = 0;
        });
        Object.values(ExtensionPointPriority).forEach(pri => {
            stats.byPriority[pri] = 0;
        });
        Object.values(ExtensionPointLifecycle).forEach(lc => {
            stats.byLifecycle[lc] = 0;
        });
        // Count
        this.getAll().forEach(ep => {
            stats.byCategory[ep.category]++;
            stats.byPriority[ep.priority]++;
            stats.byLifecycle[ep.lifecycle]++;
        });
        return stats;
    }
    /**
     * Validate extension point compatibility
     */
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
        // Check lifecycle status
        if (extensionPoint.lifecycle === ExtensionPointLifecycle.DEPRECATED) {
            warnings.push(`Extension point ${extensionPointId} is deprecated`);
        }
        if (extensionPoint.metadata.replacedBy) {
            warnings.push(`Consider using ${extensionPoint.metadata.replacedBy} instead`);
        }
        if (extensionPoint.lifecycle === ExtensionPointLifecycle.REMOVED) {
            errors.push(`Extension point ${extensionPointId} has been removed`);
        }
        // Check version compatibility
        if (extensionPoint.metadata.removedIn && this.compareVersions(version, extensionPoint.metadata.removedIn) >= 0) {
            errors.push(`Extension point ${extensionPointId} is not available in version ${version}`);
        }
        return {
            compatible: errors.length === 0,
            warnings,
            errors
        };
    }
    /**
     * Initialize the registry with core extension points
     */
    initializeRegistry() {
        // Runtime Extension Points
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
                    code: `class CustomNode extends RuntimeNode<string> {
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
        // UI Extension Points
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
        // Schema Extension Points
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
        // API Extension Points
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
    /**
     * Compare version strings
     */
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
// Export singleton instance
export const extensionPointRegistry = ExtensionPointRegistry.getInstance();

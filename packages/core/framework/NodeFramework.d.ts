/**
 * Node Framework Core
 * Epic 18 - Implement Node Framework (E18-1753114562067-331CC8)
 *
 * Comprehensive node framework with lifecycle management, registry, and extension architecture
 */
import { EventEmitter } from 'events';
import { AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeConfig } from '../runtime/advanced';
import { NodeValidationService, NodeValidationResult } from '../validation';
import { IOPortDefinition } from '../runtime/io-system';

}
export interface NodeDefinition {
    /** Unique node type identifier */
    type: string;
    /** Display name for UI */
    displayName: string;
    /** Node description */
    description: string;
    /** Node category for organization */
    category: 'basic' | 'advanced' | 'utility' | 'integration' | 'custom';
    /** Version of this node definition */
    version: string;
    /** Node class constructor */
    nodeClass: new (id: string, config: AdvancedNodeConfig, data: any) => FrameworkNode;
    /** Default configuration */
    defaultConfig: Partial<AdvancedNodeConfig>;
    /** Input/Output port definitions */
    ports: {
        inputs: IOPortDefinition[];
        outputs: IOPortDefinition[];
}
    };
    /** Node-specific metadata */
    metadata: {
        author?: string;
        tags: string[];
        deprecated?: boolean;
        experimental?: boolean;
        minEngineVersion?: string;
    };

}
export interface NodeLifecycleHooks {
    /** Called before node initialization */
    beforeInit?: (node: FrameworkNode) => Promise<void> | void;
    /** Called after node initialization */
    afterInit?: (node: FrameworkNode) => Promise<void> | void;
    /** Called before node execution */
    beforeExecute?: (node: FrameworkNode, context: AdvancedExecutionContext) => Promise<void> | void;
    /** Called after node execution */
    afterExecute?: (node: FrameworkNode, context: AdvancedExecutionContext, result: any) => Promise<void> | void;
    /** Called when node is destroyed */
    beforeDestroy?: (node: FrameworkNode) => Promise<void> | void;
    /** Called on node validation */
    onValidate?: (node: FrameworkNode, result: NodeValidationResult) => Promise<void> | void;
    /** Called on node errors */
    onError?: (node: FrameworkNode, error: Error) => Promise<void> | void;

}
export interface NodeFrameworkConfig {
    /** Enable automatic validation of nodes */
    enableValidation: boolean;
    /** Enable performance monitoring */
    enableMonitoring: boolean;
    /** Enable lifecycle hooks */
    enableLifecycleHooks: boolean;
    /** Enable extension system */
    enableExtensions: boolean;
    /** Maximum number of nodes in memory */
    maxNodesInMemory: number;
    /** Node cache expiration time */
    nodeCacheExpirationMs: number;
    /** Enable hot reloading of node definitions */
    enableHotReload: boolean;

}
export interface NodeMetrics {
    nodeId: string;
    nodeType: string;
    executionCount: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    lastExecutionTime: number;
    errorCount: number;
    lastError?: Error;
    memoryUsage: number;
    cacheHits: number;
    cacheMisses: number;

}
export interface NodeFrameworkMetrics {
    totalNodes: number;
    activeNodes: number;
    registeredTypes: number;
    totalExecutions: number;
    averageExecutionTime: number;
    errorRate: number;
    memoryUsage: number;
    cacheEfficiency: number;
/**
 * Enhanced node base class with framework integration
 */
export declare abstract class FrameworkNode extends AdvancedRuntimeNode {
    protected framework: NodeFramework | null;
    protected metrics: NodeMetrics;
    protected lifecycleHooks: NodeLifecycleHooks;
    constructor(id: string, config: AdvancedNodeConfig, data: any);
    /**
     * Get node type identifier
     */
    abstract getType(): string;
    /**
     * Get node definition
     */
    abstract getDefinition(): Partial<NodeDefinition>;
    /**
     * Set the framework reference
     */
    setFramework(framework: NodeFramework): void;
    /**
     * Set lifecycle hooks
     */
    setLifecycleHooks(hooks: NodeLifecycleHooks): void;
    /**
     * Initialize node with framework integration
     */
    initialize(): Promise<void>;
    /**
     * Execute node with framework integration
     */
    execute(context: AdvancedExecutionContext): Promise<any>;
    /**
     * Destroy node with framework integration
     */
    destroy(): Promise<void>;
    /**
     * Get node metrics
     */
    getMetrics(): NodeMetrics;
    /**
     * Clone node with new ID
     */
    clone(newId: string): Promise<FrameworkNode>;
    protected abstract onInitialize(): Promise<void>;
    protected abstract executeNode(context: AdvancedExecutionContext): Promise<any>;
    protected abstract onDestroy(): Promise<void>;
    protected abstract getData(): any;
    private validateWithFramework;
    private updateExecutionMetrics;
    private handleError;
/**
 * Node Registry for managing node types and definitions
 */
export declare class NodeRegistry {
    private definitions;
    private instances;
    private aliases;
    /**
     * Register a node type
     */
    registerNode(definition: NodeDefinition): void;
    /**
     * Unregister a node type
     */
    unregisterNode(type: string): void;
    /**
     * Create node instance
     */
    createNode(type: string, id: string, config: AdvancedNodeConfig, data: any): FrameworkNode;
    /**
     * Get node definition
     */
    getDefinition(type: string): NodeDefinition | undefined;
    /**
     * Get all registered types
     */
    getRegisteredTypes(): string[];
    /**
     * Get nodes by category
     */
    getNodesByCategory(category: NodeDefinition['category']): NodeDefinition[];
    /**
     * Register type alias
     */
    registerAlias(alias: string, type: string): void;
    /**
     * Get node instance
     */
    getInstance(id: string): FrameworkNode | undefined;
    /**
     * Remove node instance
     */
    removeInstance(id: string): void;
    /**
     * Search nodes by criteria
     */
    searchNodes(criteria: {)
        category?: NodeDefinition['category'];
        tags?: string[];
        author?: string;
        deprecated?: boolean;
        experimental?: boolean;
}
    }): NodeDefinition[];
    private validateDefinition;
/**
 * Main Node Framework class
 */
export declare class NodeFramework extends EventEmitter {
    readonly config: NodeFrameworkConfig;
    readonly registry: NodeRegistry;
    readonly validationService: NodeValidationService;
    private nodes;
    private lifecycleHooks;
    private extensions;
    private metrics;
    private metricsInterval?;
    constructor(config?: Partial<NodeFrameworkConfig>);
    /**
     * Initialize the framework
     */
    private initialize;
    /**
     * Create a node
     */
    createNode(type: string, id: string, config: AdvancedNodeConfig, data: any): Promise<FrameworkNode>;
    /**
     * Get a node by ID
     */
    getNode(id: string): FrameworkNode | undefined;
    /**
     * Destroy a node
     */
    destroyNode(id: string): Promise<void>;
    /**
     * Register global lifecycle hooks
     */
    registerLifecycleHooks(type: string, hooks: NodeLifecycleHooks): void;
    /**
     * Register framework extension
     */
    registerExtension(extension: NodeFrameworkExtension): void;
    /**
     * Get framework metrics
     */
    getMetrics(): NodeFrameworkMetrics;
    /**
     * Get all active nodes
     */
    getAllNodes(): FrameworkNode[];
    /**
     * Get nodes by type
     */
    getNodesByType(type: string): FrameworkNode[];
    /**
     * Execute multiple nodes in batch
     */
    executeNodeBatch(nodeIds: string[], context: AdvancedExecutionContext): Promise<any[]>;
    /**
     * Shutdown the framework
     */
    shutdown(): Promise<void>;
    private updateMetrics;
/**
 * Extension interface for framework extensibility
 */

}
export interface NodeFrameworkExtension {
    name: string;
    version: string;
    description: string;
    initialize(framework: NodeFramework): Promise<void> | void;
    shutdown(): Promise<void> | void;

export default NodeFramework;
//# sourceMappingURL=NodeFramework.d.ts.map
}
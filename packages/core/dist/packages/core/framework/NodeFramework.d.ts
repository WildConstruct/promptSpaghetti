import { AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeConfig } from '../runtime/advanced';
import { NodeValidationResult } from '../validation';
import { IOPortDefinition } from '../runtime/io-system';
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
        inputs: IOPortDefinition;
        outputs: IOPortDefinition;
    };
    /** Node-specific metadata */
    metadata: {
        author?: string;
        tags: string;
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
}
export declare abstract class FrameworkNode extends AdvancedRuntimeNode {
    protected framework: NodeFramework | null;
    protected metrics: NodeMetrics;
    protected lifecycleHooks: NodeLifecycleHooks;
    constructor(id: string, config: AdvancedNodeConfig, data: any);
}
//# sourceMappingURL=NodeFramework.d.ts.map
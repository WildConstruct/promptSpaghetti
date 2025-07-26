/**
 * Node Factory
 * Epic 18 - Implement Node Framework (E18-1753114562067-331CC8)
 *
 * Factory for creating and managing framework nodes with built-in validation and optimization
 */
import { FrameworkNode, NodeFramework } from './NodeFramework';
import { AdvancedNodeConfig } from '../runtime/advanced';
import { NodeValidationService } from '../validation';
export interface NodeCreationOptions {
    /** Validate node before creation */
    validate?: boolean;
    /** Apply performance optimizations */
    optimize?: boolean;
    /** Custom lifecycle hooks for this node */
    lifecycleHooks?: any;
    /** Additional metadata */
    metadata?: Record<string, any>;
    /** Template to base node on */
    template?: string;
}
export interface NodeTemplate {
    id: string;
    name: string;
    description: string;
    nodeType: string;
    defaultConfig: AdvancedNodeConfig;
    defaultData: any;
    category: string;
    tags: string[];
}
export interface NodeFactoryConfig {
    /** Enable automatic node optimization */
    enableOptimization: boolean;
    /** Enable template system */
    enableTemplates: boolean;
    /** Default validation for all nodes */
    defaultValidation: boolean;
    /** Cache created nodes */
    enableCaching: boolean;
    /** Maximum cache size */
    maxCacheSize: number;
}
/**
 * Node Factory for creating and managing framework nodes
 */
export declare class NodeFactory {
    private framework;
    private validationService;
    private config;
    private templates;
    private nodeCache;
    private creationHistory;
    constructor(
      framework: NodeFramework,
      validationService: NodeValidationService,
      config?: Partial<NodeFactoryConfig>
    );
    /**
     * Create a new node with optional validation and optimization
     */
    createNode(
      type: string,
      id: string,
      config: AdvancedNodeConfig,
      data: any,
      options?: NodeCreationOptions
    ): Promise<FrameworkNode>;
    /**
     * Create node from template
     */
    createFromTemplate(templateId: string, nodeId: string, overrides?: {
        config?: Partial<AdvancedNodeConfig>;
        data?: any;
    }): Promise<FrameworkNode>;
    /**
     * Bulk create multiple nodes
     */
    createNodeBatch(specs: Array<{
        type: string;
        id: string;
        config: AdvancedNodeConfig;
        data: any;
        options?: NodeCreationOptions;
    }>): Promise<FrameworkNode[]>;
    /**
     * Clone an existing node with a new ID
     */
    cloneNode(sourceId: string, newId: string, overrides?: {
        config?: Partial<AdvancedNodeConfig>;
        data?: any;
    }): Promise<FrameworkNode>;
    /**
     * Register a node template
     */
    registerTemplate(template: NodeTemplate): void;
    /**
     * Get available templates
     */
    getTemplates(category?: string): NodeTemplate[];
    /**
     * Get template by ID
     */
    getTemplate(id: string): NodeTemplate | undefined;
    /**
     * Create node with best practices applied
     */
    createOptimizedNode(type: string, id: string, config: AdvancedNodeConfig, data: any): Promise<FrameworkNode>;
    /**
     * Get factory statistics
     */
    getStatistics(): {
        totalCreated: number;
        successfulCreations: number;
        failedCreations: number;
        successRate: number;
        averageCreationTime: number;
        typeDistribution: Record<string, number>;
        recentFailures: Array<{
            nodeType: string;
            nodeId: string;
            error: string;
            timestamp: number;
        }>;
    };
    /**
     * Clear creation history
     */
    clearHistory(): void;
    /**
     * Export templates to JSON
     */
    exportTemplates(): string;
    /**
     * Import templates from JSON
     */
    importTemplates(json: string): void;
    private validateNodeData;
    private optimizeNodeConfig;
    private optimizeNodeData;
    private normalizeTransitionMatrix;
    private validateTemplate;
    private cacheNode;
    private recordCreation;
}
export default NodeFactory;
//# sourceMappingURL=NodeFactory.d.ts.map
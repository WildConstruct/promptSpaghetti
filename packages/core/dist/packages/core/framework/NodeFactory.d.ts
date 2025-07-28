import { AdvancedNodeConfig } from '../runtime/advanced';
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
    tags: string;
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
export declare class NodeFactory {
    private framework;
    private validationService;
    private config;
    private templates;
    private nodeCache;
    private creationHistory;
    number: any;
    nodeType: string;
    nodeId: string;
    success: boolean;
    error?: string;
}
//# sourceMappingURL=NodeFactory.d.ts.map
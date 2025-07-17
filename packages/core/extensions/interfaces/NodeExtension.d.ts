import { z } from 'zod';
import { BaseExtension, ExtensionContext, ExtensionValidationResult } from './ExtensionInterfaces';
import { RuntimeNode, AdvancedRuntimeNode, ExecutionContext, AdvancedExecutionContext } from '../../runtime';
export interface NodeExtension extends BaseExtension {
    readonly extensionType: 'node';
    getNodeDefinitions(): NodeDefinition[];
    getNodeTypes(): NodeDefinition[];
    createNodeInstance(nodeType: string, nodeId: string, config: any): RuntimeNode<any>;
    createNode(nodeType: string, nodeId: string, config: any): RuntimeNode<any>;
    validateNodeConfig(nodeType: string, config: any): ExtensionValidationResult;
    getNodeSchema(nodeType: string): z.ZodSchema<any>;
    onNodeCreated?(node: RuntimeNode<any>): void;
    onNodeExecuted?(node: RuntimeNode<any>, result: any): void;
    onNodeDestroyed?(node: RuntimeNode<any>): void;
    supportsAdvancedNodes(): boolean;
    createAdvancedNodeInstance?(nodeType: string, nodeId: string, config: any): AdvancedRuntimeNode<any>;
}
export interface NodeDefinition {
    id: string;
    name: string;
    category: NodeCategory;
    description: string;
    version: string;
    nodeClass: NodeClass;
    configSchema: z.ZodSchema<any>;
    ui: NodeUIConfiguration;
    runtime: NodeRuntimeConfiguration;
    metadata: NodeMetadata;
    validation?: NodeValidation;
}
export declare enum NodeCategory {
    INPUT = "input",
    OUTPUT = "output",
    TRANSFORM = "transform",
    CONTROL = "control",
    UTILITY = "utility",
    CUSTOM = "custom"
}
export type NodeClass = (new (id: string, config: any) => RuntimeNode<any>) | (new (id: string, config: any) => AdvancedRuntimeNode<any>);
export interface NodeUIConfiguration {
    icon?: string;
    color?: string;
    shape?: 'rectangle' | 'circle' | 'diamond' | 'custom';
    editor?: NodeEditorConfiguration;
    palette?: NodePaletteConfiguration;
    preview?: NodePreviewConfiguration;
}
export interface NodeEditorConfiguration {
    component?: React.ComponentType<NodeEditorProps>;
    autoGenerateForm?: boolean;
    formLayout?: 'vertical' | 'horizontal' | 'grid';
    fields?: Record<string, NodeFieldConfiguration>;
    validation?: NodeEditorValidation;
}
export interface NodeEditorProps {
    node: any;
    config: any;
    onChange: (config: any) => void;
    onValidate?: (result: ExtensionValidationResult) => void;
    context: ExtensionContext;
}
export interface NodeFieldConfiguration {
    type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect' | 'custom';
    label?: string;
    placeholder?: string;
    helpText?: string;
    validation?: z.ZodSchema<any>;
    options?: Array<{
        value: any;
        label: string;
    }>;
    component?: React.ComponentType<any>;
}
export interface NodeEditorValidation {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    showErrors?: boolean;
    customValidation?: (config: any) => ExtensionValidationResult;
}
export interface NodePaletteConfiguration {
    group?: string;
    order?: number;
    visible?: boolean;
    condition?: (context: ExtensionContext) => boolean;
    dragData?: any;
    tooltip?: string;
}
export interface NodePreviewConfiguration {
    component?: React.ComponentType<NodePreviewProps>;
    autoGenerate?: boolean;
    mode?: 'static' | 'dynamic' | 'interactive';
    updateFrequency?: 'onChange' | 'onFocus' | 'manual';
}
export interface NodePreviewProps {
    node: any;
    config: any;
    context: ExtensionContext;
    executionResult?: any;
}
export interface NodeRuntimeConfiguration {
    timeout?: number;
    retries?: number;
    performance?: NodePerformanceHints;
    security?: NodeSecuritySettings;
    caching?: NodeCachingConfiguration;
}
export interface NodePerformanceHints {
    expectedExecutionTime?: 'fast' | 'medium' | 'slow';
    memoryUsage?: 'low' | 'medium' | 'high';
    cpuIntensive?: boolean;
    ioIntensive?: boolean;
}
export interface NodeSecuritySettings {
    sandboxed?: boolean;
    permissions?: string[];
    allowedNetworkAccess?: string[];
    allowedFileAccess?: string[];
    maxMemoryUsage?: number;
    maxExecutionTime?: number;
}
export interface NodeCachingConfiguration {
    enabled?: boolean;
    strategy?: 'lru' | 'ttl' | 'custom';
    maxSize?: number;
    ttl?: number;
    keyGenerator?: (node: any, context: ExecutionContext) => string;
}
export interface NodeMetadata {
    author: string;
    license: string;
    repository?: string;
    documentation?: string;
    examples?: NodeExample[];
    changelog?: string;
    compatibility?: {
        minVersion: string;
        maxVersion?: string;
        deprecatedIn?: string;
        removedIn?: string;
    };
    tags?: string[];
    keywords?: string[];
}
export interface NodeExample {
    name: string;
    description: string;
    config: any;
    expectedOutput?: any;
    code?: string;
}
export interface NodeValidation {
    configValidation?: (config: any) => ExtensionValidationResult;
    runtimeValidation?: (node: RuntimeNode<any>, context: ExecutionContext) => ExtensionValidationResult;
    contextValidation?: (context: ExecutionContext) => ExtensionValidationResult;
    customRules?: NodeValidationRule[];
}
export interface NodeValidationRule {
    name: string;
    description: string;
    validate: (node: any, context: any) => ExtensionValidationResult;
    severity: 'error' | 'warning' | 'info';
}
export interface NodeRegistry {
    register(definition: NodeDefinition): void;
    unregister(nodeId: string): void;
    get(nodeId: string): NodeDefinition | undefined;
    getAll(): NodeDefinition[];
    getByCategory(category: NodeCategory): NodeDefinition[];
    search(query: string): NodeDefinition[];
    filter(predicate: (definition: NodeDefinition) => boolean): NodeDefinition[];
    validate(definition: NodeDefinition): ExtensionValidationResult;
    on(event: 'registered' | 'unregistered' | 'updated', listener: (definition: NodeDefinition) => void): void;
    off(event: 'registered' | 'unregistered' | 'updated', listener: (definition: NodeDefinition) => void): void;
}
export interface NodeFactory {
    create(nodeType: string, nodeId: string, config: any): RuntimeNode<any>;
    createAdvanced(nodeType: string, nodeId: string, config: any): AdvancedRuntimeNode<any>;
    validateConfig(nodeType: string, config: any): ExtensionValidationResult;
    getSchema(nodeType: string): z.ZodSchema<any>;
    supports(nodeType: string): boolean;
    supportsAdvanced(nodeType: string): boolean;
}
export interface NodeExecutionContextExtensions {
    nodeExtensions: Map<string, any>;
    performanceTracking: {
        startTime: number;
        endTime?: number;
        executionTime?: number;
        memoryUsage?: number;
    };
    securityContext: {
        permissions: string[];
        sandboxed: boolean;
        resourceLimits: {
            memory?: number;
            time?: number;
        };
    };
    cachingContext: {
        enabled: boolean;
        cacheKey?: string;
        cacheHit?: boolean;
        cacheSize?: number;
    };
}
export interface ExtendedExecutionContext extends AdvancedExecutionContext {
    extensions: NodeExecutionContextExtensions;
}
export interface NodeExecutionMonitor {
    onExecutionStart(node: RuntimeNode<any>, context: ExtendedExecutionContext): void;
    onExecutionEnd(node: RuntimeNode<any>, context: ExtendedExecutionContext, result: any): void;
    onExecutionError(node: RuntimeNode<any>, context: ExtendedExecutionContext, error: Error): void;
    getMetrics(nodeId: string): NodeExecutionMetrics;
    getAllMetrics(): Map<string, NodeExecutionMetrics>;
    on(event: 'execution' | 'error' | 'performance', listener: (data: any) => void): void;
}
export interface NodeExecutionMetrics {
    nodeId: string;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    minExecutionTime: number;
    maxExecutionTime: number;
    averageMemoryUsage: number;
    lastExecuted: Date;
    lastError?: Error;
}
export declare namespace NodeExtensionHelpers {
    function createNodeDefinition(config: Partial<NodeDefinition>): NodeDefinition;
    function validateNodeDefinition(definition: NodeDefinition): ExtensionValidationResult;
    function createNodeRegistry(): NodeRegistry;
}
//# sourceMappingURL=NodeExtension.d.ts.map
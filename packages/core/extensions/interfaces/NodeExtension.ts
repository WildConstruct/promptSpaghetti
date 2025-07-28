/**
 * Node Extension Interface - Epic 8.4 Story 8.4.2
 * Defines interfaces for extending the runtime node system
 */
import { z } from 'zod';
import { BaseExtension, ExtensionContext, ExtensionValidationResult } from './ExtensionInterfaces';
import { RuntimeNode, AdvancedRuntimeNode, ExecutionContext, AdvancedExecutionContext } from '../../runtime';

// Node Extension Interface
export interface NodeExtension extends BaseExtension {
  readonly extensionType: 'node';
  // Node registration (supporting both legacy and new method names)
  getNodeDefinitions(): NodeDefinition[];
  getNodeTypes(): NodeDefinition[]; // Legacy method name used by engine
  createNodeInstance(nodeType: string, nodeId: string, config: any): RuntimeNode<any>;
  createNode(nodeType: string, nodeId: string, config: any): RuntimeNode<any>; // Legacy method name used by engine
  // Schema validation
  validateNodeConfig(nodeType: string, config: any): ExtensionValidationResult;
  getNodeSchema(nodeType: string): z.ZodSchema<any>;
  // Node lifecycle hooks
  onNodeCreated?(node: RuntimeNode<any>): void;
  onNodeExecuted?(node: RuntimeNode<any>, result: any): void;
  onNodeDestroyed?(node: RuntimeNode<any>): void;
  // Advanced node support
  supportsAdvancedNodes(): boolean;
  createAdvancedNodeInstance?(nodeType: string, nodeId: string, config: any): AdvancedRuntimeNode<any>;
}

// Node Definition
export interface NodeDefinition {
  // Basic metadata
  id: string;
  name: string;
  category: NodeCategory;
  description: string;
  version: string;
  // Node class
  nodeClass: NodeClass;
  // Configuration schema
  configSchema: z.ZodSchema<any>;
  // UI configuration
  ui: NodeUIConfiguration;
  // Runtime configuration
  runtime: NodeRuntimeConfiguration;
  // Metadata
  metadata: NodeMetadata;
  // Validation
  validation?: NodeValidation;
}

// Node Categories
export enum NodeCategory {
  INPUT = 'input',
  OUTPUT = 'output',
  TRANSFORM = 'transform',
  CONTROL = 'control',
  UTILITY = 'utility',
  CUSTOM = 'custom'
}

// Node Class Types
export type NodeClass = 
  | (new (id: string, config: any) => RuntimeNode<any>)
  | (new (id: string, config: any) => AdvancedRuntimeNode<any>);

// Node UI Configuration
export interface NodeUIConfiguration {
  // Visual appearance
  icon?: string;
  color?: string;
  shape?: 'rectangle' | 'circle' | 'diamond' | 'custom';
  // Editor configuration
  editor?: NodeEditorConfiguration;
  // Palette configuration
  palette?: NodePaletteConfiguration;
  // Preview configuration
  preview?: NodePreviewConfiguration;
}

// Node Editor Configuration
export interface NodeEditorConfiguration {
  // Custom editor component
  component?: React.ComponentType<NodeEditorProps>;
  // Form generation
  autoGenerateForm?: boolean;
  formLayout?: 'vertical' | 'horizontal' | 'grid';
  // Field customization
  fields?: Record<string, NodeFieldConfiguration>;
  // Validation
  validation?: NodeEditorValidation;
}

// Node Editor Props
export interface NodeEditorProps {
  node: any;
  config: any;
  onChange: (config: any) => void;
  onValidate?: (result: ExtensionValidationResult) => void;
  context: ExtensionContext;
}

// Node Field Configuration
export interface NodeFieldConfiguration {
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect' | 'custom';
  label?: string;
  placeholder?: string;
  helpText?: string;
  validation?: z.ZodSchema<any>;
  options?: Array<{ value: any; label: string }>;
  component?: React.ComponentType<any>;
}

// Node Editor Validation
export interface NodeEditorValidation {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showErrors?: boolean;
  customValidation?: (config: any) => ExtensionValidationResult;
}

// Node Palette Configuration
export interface NodePaletteConfiguration {
  // Grouping
  group?: string;
  order?: number;
  // Visibility
  visible?: boolean;
  condition?: (context: ExtensionContext) => boolean;
  // Drag and drop
  dragData?: any;
  // Tooltip
  tooltip?: string;
}

// Node Preview Configuration
export interface NodePreviewConfiguration {
  // Preview component
  component?: React.ComponentType<NodePreviewProps>;
  // Auto-generate preview
  autoGenerate?: boolean;
  // Preview mode
  mode?: 'static' | 'dynamic' | 'interactive';
  // Update frequency
  updateFrequency?: 'onChange' | 'onFocus' | 'manual';
}

// Node Preview Props
export interface NodePreviewProps {
  node: any;
  config: any;
  context: ExtensionContext;
  executionResult?: any;
}

// Node Runtime Configuration
export interface NodeRuntimeConfiguration {
  // Execution settings
  timeout?: number;
  retries?: number;
  // Performance hints
  performance?: NodePerformanceHints;
  // Security settings
  security?: NodeSecuritySettings;
  // Caching
  caching?: NodeCachingConfiguration;
}

// Node Performance Hints
export interface NodePerformanceHints {
  expectedExecutionTime?: 'fast' | 'medium' | 'slow';
  memoryUsage?: 'low' | 'medium' | 'high';
  cpuIntensive?: boolean;
  ioIntensive?: boolean;
}

// Node Security Settings
export interface NodeSecuritySettings {
  sandboxed?: boolean;
  permissions?: string[];
  allowedNetworkAccess?: string[];
  allowedFileAccess?: string[];
  maxMemoryUsage?: number;
  maxExecutionTime?: number;
}

// Node Caching Configuration
export interface NodeCachingConfiguration {
  enabled?: boolean;
  strategy?: 'lru' | 'ttl' | 'custom';
  maxSize?: number;
  ttl?: number;
  keyGenerator?: (node: any, context: ExecutionContext) => string;
}

// Node Metadata
export interface NodeMetadata {
  author: string;
  license: string;
  repository?: string;
  documentation?: string;
  examples?: NodeExample[];
  changelog?: string;
  // Compatibility
  compatibility?: {
    minVersion: string;
    maxVersion?: string;
    deprecatedIn?: string;
    removedIn?: string;
  };
  // Tags
  tags?: string[];
  keywords?: string[];
}

// Node Example
export interface NodeExample {
  name: string;
  description: string;
  config: any;
  expectedOutput?: any;
  code?: string;
}

// Node Validation
export interface NodeValidation {
  // Configuration validation
  configValidation?: (config: any) => ExtensionValidationResult;
  // Runtime validation
  runtimeValidation?: (node: RuntimeNode<any>, context: ExecutionContext) => ExtensionValidationResult;
  // Context validation
  contextValidation?: (context: ExecutionContext) => ExtensionValidationResult;
  // Custom validation rules
  customRules?: NodeValidationRule[];
}

// Node Validation Rule
export interface NodeValidationRule {
  name: string;
  description: string;
  validate: (node: any, context: any) => ExtensionValidationResult;
  severity: 'error' | 'warning' | 'info';
}

// Node Registry Interface
export interface NodeRegistry {
  // Registration
  register(definition: NodeDefinition): void;
  unregister(nodeId: string): void;
  // Lookup
  get(nodeId: string): NodeDefinition | undefined;
  getAll(): NodeDefinition[];
  getByCategory(category: NodeCategory): NodeDefinition[];
  // Search
  search(query: string): NodeDefinition[];
  filter(predicate: (definition: NodeDefinition) => boolean): NodeDefinition[];
  // Validation
  validate(definition: NodeDefinition): ExtensionValidationResult;
  // Events
  on(event: 'registered' | 'unregistered' | 'updated', listener: (definition: NodeDefinition) => void): void;
  off(event: 'registered' | 'unregistered' | 'updated', listener: (definition: NodeDefinition) => void): void;
}

// Node Factory Interface
export interface NodeFactory {
  // Creation
  create(nodeType: string, nodeId: string, config: any): RuntimeNode<any>;
  createAdvanced(nodeType: string, nodeId: string, config: any): AdvancedRuntimeNode<any>;
  // Validation
  validateConfig(nodeType: string, config: any): ExtensionValidationResult;
  // Schema access
  getSchema(nodeType: string): z.ZodSchema<any>;
  // Capabilities
  supports(nodeType: string): boolean;
  supportsAdvanced(nodeType: string): boolean;
}

// Node Execution Context Extensions
export interface NodeExecutionContextExtensions {
  // Node-specific extensions
  nodeExtensions: Map<string, any>;
  // Performance tracking
  performanceTracking: {,
    startTime: number;
    endTime?: number;
    executionTime?: number;
    memoryUsage?: number;
  };
  // Security context
  securityContext: {,
    permissions: string[];
    sandboxed: boolean;
    resourceLimits: {,
      memory?: number;
      time?: number;
    };
  };
  // Caching context
  cachingContext: {,
    enabled: boolean;
    cacheKey?: string;
    cacheHit?: boolean;
    cacheSize?: number;
  };
}

// Extended Execution Context
export interface ExtendedExecutionContext extends AdvancedExecutionContext {
  extensions: NodeExecutionContextExtensions;
}

// Node Execution Monitor
export interface NodeExecutionMonitor {
  // Monitoring
  onExecutionStart(node: RuntimeNode<any>, context: ExtendedExecutionContext): void;
  onExecutionEnd(node: RuntimeNode<any>, context: ExtendedExecutionContext, result: any): void;
  onExecutionError(node: RuntimeNode<any>, context: ExtendedExecutionContext, error: Error): void;
  // Metrics
  getMetrics(nodeId: string): NodeExecutionMetrics;
  getAllMetrics(): Map<string, NodeExecutionMetrics>;
  // Events
  on(event: 'execution' | 'error' | 'performance', listener: (data: any) => void): void;
}

// Node Execution Metrics
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

// Node Extension Helper Functions
export namespace NodeExtensionHelpers {
  export function createNodeDefinition(config: Partial<NodeDefinition>): NodeDefinition {
    return {
      id: config.id || 'custom-node',
      name: config.name || 'Custom Node',
      category: config.category || NodeCategory.CUSTOM,
      description: config.description || 'A custom node',
      version: config.version || '1.0.0',
      nodeClass: config.nodeClass || class extends RuntimeNode<unknown> {
        run() { return null; }
      },
      configSchema: config.configSchema || z.object({}),
      ui: config.ui || {},
      runtime: config.runtime || {},
      metadata: config.metadata || {
        author: 'Unknown',
        license: 'MIT',
      },
      ...config
    };
  }
  export function validateNodeDefinition(definition: NodeDefinition): ExtensionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Basic validation
    if (!definition.id) errors.push('Node ID is required');
    if (!definition.name) errors.push('Node name is required');
    if (!definition.nodeClass) errors.push('Node class is required');
    // Schema validation
    try {
      definition.configSchema.parse({});
    } catch (e) {
      warnings.push('Configuration schema validation failed');
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  export function createNodeRegistry(): NodeRegistry {
    const registry = new Map<string, NodeDefinition>();
    const eventEmitter = new EventTarget();
    return {
      register(definition: NodeDefinition) {
        registry.set(definition.id, definition);
        eventEmitter.dispatchEvent(new CustomEvent('registered', { detail: definition }));
      },
      unregister(nodeId: string) {
        const definition = registry.get(nodeId);
        if (definition) {
          registry.delete(nodeId);
          eventEmitter.dispatchEvent(new CustomEvent('unregistered', { detail: definition }));
        }
      },
      get(nodeId: string) {
        return registry.get(nodeId);
      },
      getAll() {
        return Array.from(registry.values());
      },
      getByCategory(category: NodeCategory) {
        return Array.from(registry.values()).filter(def => def.category === category);
      },
      search(query: string) {
        const lowercaseQuery = query.toLowerCase();
        return Array.from(registry.values()).filter(def =>)
          def.name.toLowerCase().includes(lowercaseQuery) ||
          def.description.toLowerCase().includes(lowercaseQuery)
        );
      },
      filter(predicate: (definition: NodeDefinition) => boolean) {
        return Array.from(registry.values()).filter(predicate);
      },
      validate(definition: NodeDefinition) {
        return validateNodeDefinition(definition);
      },
      on(event: string, listener: any) {
        eventEmitter.addEventListener(event, listener);
      },
      off(event: string, listener: any) {
        eventEmitter.removeEventListener(event, listener);
      }
    };
  }
}
/**
 * @fileoverview Core types and interfaces for Custom Node SDK
 * Defines the contract for creating custom nodes and extensions
 */
import type { AdvancedExecutionContext, AdvancedNodeConfig } from '@promptscape/core';
/**
 * Validation result for custom node operations
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation error messages */
  errors: string[];
  /** Validation warning messages */
  warnings: string[];
}
/**
 * Custom node metadata that describes the node's capabilities
 */
export interface CustomNodeMetadata {
  /** Unique node type identifier (e.g., 'my-company.custom-processor') */
  type: string;
  /** Human-readable display name */
  displayName: string;
  /** Brief description of what the node does */
  description: string;
  /** Node category for organization in the palette */
  category: string;
  /** Version of the custom node implementation */
  version: string;
  /** Author information */
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  /** Node icon (emoji or icon name) */
  icon?: string;
  /** Tags for search and discovery */
  tags?: string[];
  /** License information */
  license?: string;
  /** Repository URL */
  repository?: string;
}
/**
 * Input/Output schema definition for custom nodes
 */
export interface NodeIOSchema {
  /** Input specifications */
  inputs: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any';
      required: boolean;
      description?: string;
      default?: any;
      validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        min?: number;
        max?: number;
        enum?: any[];
      };
    }
  >;
  /** Output specifications */
  outputs: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any';
      description?: string;
    }
  >;
}
/**
 * Custom node configuration that extends the advanced node config
 */
export interface CustomNodeConfig extends AdvancedNodeConfig {
  /** Custom node metadata */
  metadata: CustomNodeMetadata;
  /** Input/Output schema */
  schema: NodeIOSchema;
  /** Custom configuration options */
  customOptions?: Record<string, any>;
  /** Security settings */
  security?: {
    /** Whether this node can access the file system */
    allowFileAccess?: boolean;
    /** Whether this node can make network requests */
    allowNetworkAccess?: boolean;
    /** Maximum execution time in milliseconds */
    maxExecutionTime?: number;
    /** Memory limit in bytes */
    memoryLimit?: number;
  };
}
/**
 * Custom node registration information
 */
export interface CustomNodeRegistration {
  /** Node metadata */
  metadata: CustomNodeMetadata;
  /** Node class constructor */
  nodeClass: CustomNodeConstructor;
  /** I/O schema */
  schema: NodeIOSchema;
  /** Default configuration */
  defaultConfig?: Partial<CustomNodeConfig>;
}
/**
 * Constructor type for custom nodes
 */
export type CustomNodeConstructor = new (id: string, config: CustomNodeConfig) => CustomNodeBase;
/**
 * Runtime information passed to custom nodes during execution
 */
export interface CustomNodeRuntime {
  /** Node execution context */
  context: AdvancedExecutionContext;
  /** Input values (validated against schema) */
  inputs: Record<string, any>;
  /** Utility functions */
  utils: {
    /** Generate a deterministic random number */
    random: () => number;
    /** Log a message (respects execution environment) */
    log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any) => void;
    /** Validate data against a schema */
    validate: (data: any, schema: any) => ValidationResult;
    /** Access node state (for stateful nodes) */
    getState: <T = any>() => T | undefined;
    /** Update node state (for stateful nodes) */
    setState: <T = any>(state: T) => void;
  };
}
/**
 * Result returned by custom node execution
 */
export interface CustomNodeResult<T = any> {
  /** Output values */
  outputs: Record<string, T>;
  /** Optional metadata about the execution */
  metadata?: {
    /** Execution time in milliseconds */
    executionTime?: number;
    /** Memory used in bytes */
    memoryUsed?: number;
    /** Custom metrics */
    metrics?: Record<string, number>;
  };
  /** Optional debug information */
  debug?: any;
}
/**
 * Base abstract class that all custom nodes must extend
 */
export declare abstract class CustomNodeBase {
  protected config: CustomNodeConfig;
  protected nodeId: string;
  constructor(id: string, config: CustomNodeConfig);
  /**
   * Get the node's metadata
   */
  getMetadata(): CustomNodeMetadata;
  /**
   * Get the node's I/O schema
   */
  getSchema(): NodeIOSchema;
  /**
   * Validate the node's configuration and schema
   */
  abstract validate(): ValidationResult;
  /**
   * Execute the custom node logic
   * @param runtime Runtime information including context, inputs, and utilities
   * @returns Promise resolving to the node's outputs
   */
  abstract execute(runtime: CustomNodeRuntime): Promise<CustomNodeResult> | CustomNodeResult;
  /**
   * Optional lifecycle hook called before execution
   */
  beforeExecute?(runtime: CustomNodeRuntime): Promise<void> | void;
  /**
   * Optional lifecycle hook called after execution
   */
  afterExecute?(runtime: CustomNodeRuntime, result: CustomNodeResult): Promise<void> | void;
  /**
   * Optional lifecycle hook called when the node is disposed
   */
  dispose?(): Promise<void> | void;
}
/**
 * Extension interface for more advanced custom nodes
 */
export interface AdvancedCustomNode extends CustomNodeBase {
  /** Handle dynamic input changes */
  onInputChanged?(inputName: string, newValue: any, runtime: CustomNodeRuntime): Promise<void> | void;
  /** Handle node configuration changes */
  onConfigChanged?(newConfig: Partial<CustomNodeConfig>): Promise<void> | void;
  /** Provide dynamic validation based on current inputs */
  validateDynamic?(inputs: Record<string, any>): ValidationResult;
  /** Provide suggestions for input values */
  getSuggestions?(inputName: string, partialValue: any): Promise<any[]> | any[];
}
/**
 * Node registry for managing custom node types
 */
export interface CustomNodeRegistry {
  /** Register a new custom node type */
  register(registration: CustomNodeRegistration): void;
  /** Get a registered node type */
  get(nodeType: string): CustomNodeRegistration | undefined;
  /** Get all registered node types */
  getAll(): CustomNodeRegistration[];
  /** Check if a node type is registered */
  has(nodeType: string): boolean;
  /** Unregister a node type */
  unregister(nodeType: string): boolean;
}
/**
 * SDK configuration options
 */
export interface SDKConfig {
  /** Whether to enable debug logging */
  debug?: boolean;
  /** Custom node registry instance */
  registry?: CustomNodeRegistry;
  /** Security settings */
  security?: {
    /** Whether to allow file system access by default */
    defaultAllowFileAccess?: boolean;
    /** Whether to allow network access by default */
    defaultAllowNetworkAccess?: boolean;
    /** Default maximum execution time */
    defaultMaxExecutionTime?: number;
  };
}
//# sourceMappingURL=types.d.ts.map

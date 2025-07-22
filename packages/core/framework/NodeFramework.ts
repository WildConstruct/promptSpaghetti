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
}

/**
 * Enhanced node base class with framework integration
 */
export abstract class FrameworkNode extends AdvancedRuntimeNode {
  protected framework: NodeFramework | null = null;
  protected metrics: NodeMetrics;
  protected lifecycleHooks: NodeLifecycleHooks = {};
  
  constructor(id: string, config: AdvancedNodeConfig, data: any) {
    super(id, config, data);
    
    this.metrics = {
      nodeId: id,
      nodeType: this.getType(),
      executionCount: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0,
      errorCount: 0,
      memoryUsage: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

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
  setFramework(framework: NodeFramework): void {
    this.framework = framework;
  }

  /**
   * Set lifecycle hooks
   */
  setLifecycleHooks(hooks: NodeLifecycleHooks): void {
    this.lifecycleHooks = { ...this.lifecycleHooks, ...hooks };
  }

  /**
   * Initialize node with framework integration
   */
  async initialize(): Promise<void> {
    try {
      await this.lifecycleHooks.beforeInit?.(this);
      
      // Perform node-specific initialization
      await this.onInitialize();
      
      await this.lifecycleHooks.afterInit?.(this);
      
      this.framework?.emit('node_initialized', {
        nodeId: this.id,
        nodeType: this.getType()
      });
    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Execute node with framework integration
   */
  async execute(context: AdvancedExecutionContext): Promise<any> {
    const startTime = Date.now();
    
    try {
      await this.lifecycleHooks.beforeExecute?.(this, context);
      
      // Validate if framework validation is enabled
      if (this.framework?.config.enableValidation) {
        await this.validateWithFramework();
      }
      
      // Execute the node
      const result = await this.executeNode(context);
      
      // Update metrics
      this.updateExecutionMetrics(startTime);
      
      await this.lifecycleHooks.afterExecute?.(this, context, result);
      
      this.framework?.emit('node_executed', {
        nodeId: this.id,
        nodeType: this.getType(),
        executionTime: Date.now() - startTime,
        success: true
      });
      
      return result;
    } catch (error) {
      this.metrics.errorCount++;
      await this.handleError(error as Error);
      
      this.framework?.emit('node_executed', {
        nodeId: this.id,
        nodeType: this.getType(),
        executionTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Destroy node with framework integration
   */
  async destroy(): Promise<void> {
    try {
      await this.lifecycleHooks.beforeDestroy?.(this);
      
      // Perform node-specific cleanup
      await this.onDestroy();
      
      this.framework?.emit('node_destroyed', {
        nodeId: this.id,
        nodeType: this.getType()
      });
    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Get node metrics
   */
  getMetrics(): NodeMetrics {
    return { ...this.metrics };
  }

  /**
   * Clone node with new ID
   */
  async clone(newId: string): Promise<FrameworkNode> {
    const NodeClass = this.constructor as new (id: string, config: AdvancedNodeConfig, data: any) => FrameworkNode;
    const cloned = new NodeClass(newId, this.config, this.getData());
    
    if (this.framework) {
      cloned.setFramework(this.framework);
    }
    
    cloned.setLifecycleHooks(this.lifecycleHooks);
    
    await cloned.initialize();
    
    return cloned;
  }

  // Abstract methods for subclasses to implement
  protected abstract onInitialize(): Promise<void>;
  protected abstract executeNode(context: AdvancedExecutionContext): Promise<any>;
  protected abstract onDestroy(): Promise<void>;
  protected abstract getData(): any;

  // Private helper methods
  private async validateWithFramework(): Promise<void> {
    if (!this.framework?.validationService) return;

    const nodeData = {
      id: this.id,
      type: this.getType(),
      config: this.config,
      data: this.getData()
    };

    const result = await this.framework.validationService.validateNode(nodeData);
    
    await this.lifecycleHooks.onValidate?.(this, result);
    
    if (!result.valid) {
      throw new Error(`Node validation failed: ${result.errors.join(', ')}`);
    }
  }

  private updateExecutionMetrics(startTime: number): void {
    const executionTime = Date.now() - startTime;
    this.metrics.executionCount++;
    this.metrics.totalExecutionTime += executionTime;
    this.metrics.averageExecutionTime = this.metrics.totalExecutionTime / this.metrics.executionCount;
    this.metrics.lastExecutionTime = executionTime;
  }

  private async handleError(error: Error): Promise<void> {
    this.metrics.lastError = error;
    await this.lifecycleHooks.onError?.(this, error);
  }
}

/**
 * Node Registry for managing node types and definitions
 */
export class NodeRegistry {
  private definitions = new Map<string, NodeDefinition>();
  private instances = new Map<string, FrameworkNode>();
  private aliases = new Map<string, string>();

  /**
   * Register a node type
   */
  registerNode(definition: NodeDefinition): void {
    if (this.definitions.has(definition.type)) {
      throw new Error(`Node type '${definition.type}' is already registered`);
    }

    // Validate definition
    this.validateDefinition(definition);
    
    this.definitions.set(definition.type, definition);
  }

  /**
   * Unregister a node type
   */
  unregisterNode(type: string): void {
    this.definitions.delete(type);
    
    // Remove any aliases
    for (const [alias, targetType] of this.aliases) {
      if (targetType === type) {
        this.aliases.delete(alias);
      }
    }
  }

  /**
   * Create node instance
   */
  createNode(type: string, id: string, config: AdvancedNodeConfig, data: any): FrameworkNode {
    const resolvedType = this.aliases.get(type) || type;
    const definition = this.definitions.get(resolvedType);
    
    if (!definition) {
      throw new Error(`Unknown node type: ${type}`);
    }

    const mergedConfig = { ...definition.defaultConfig, ...config };
    const node = new definition.nodeClass(id, mergedConfig, data);
    
    this.instances.set(id, node);
    
    return node;
  }

  /**
   * Get node definition
   */
  getDefinition(type: string): NodeDefinition | undefined {
    const resolvedType = this.aliases.get(type) || type;
    return this.definitions.get(resolvedType);
  }

  /**
   * Get all registered types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.definitions.keys());
  }

  /**
   * Get nodes by category
   */
  getNodesByCategory(category: NodeDefinition['category']): NodeDefinition[] {
    return Array.from(this.definitions.values()).filter(def => def.category === category);
  }

  /**
   * Register type alias
   */
  registerAlias(alias: string, type: string): void {
    if (!this.definitions.has(type)) {
      throw new Error(`Cannot create alias for unregistered type: ${type}`);
    }
    
    this.aliases.set(alias, type);
  }

  /**
   * Get node instance
   */
  getInstance(id: string): FrameworkNode | undefined {
    return this.instances.get(id);
  }

  /**
   * Remove node instance
   */
  removeInstance(id: string): void {
    this.instances.delete(id);
  }

  /**
   * Search nodes by criteria
   */
  searchNodes(criteria: {
    category?: NodeDefinition['category'];
    tags?: string[];
    author?: string;
    deprecated?: boolean;
    experimental?: boolean;
  }): NodeDefinition[] {
    return Array.from(this.definitions.values()).filter(def => {
      if (criteria.category && def.category !== criteria.category) return false;
      if (criteria.author && def.metadata.author !== criteria.author) return false;
      if (criteria.deprecated !== undefined && def.metadata.deprecated !== criteria.deprecated) return false;
      if (criteria.experimental !== undefined && def.metadata.experimental !== criteria.experimental) return false;
      if (criteria.tags && !criteria.tags.every(tag => def.metadata.tags.includes(tag))) return false;
      
      return true;
    });
  }

  private validateDefinition(definition: NodeDefinition): void {
    if (!definition.type || typeof definition.type !== 'string') {
      throw new Error('Node definition must have a valid type string');
    }
    
    if (!definition.nodeClass || typeof definition.nodeClass !== 'function') {
      throw new Error('Node definition must have a valid nodeClass constructor');
    }
    
    if (!definition.displayName || typeof definition.displayName !== 'string') {
      throw new Error('Node definition must have a valid displayName string');
    }
  }
}

/**
 * Main Node Framework class
 */
export class NodeFramework extends EventEmitter {
  public readonly config: NodeFrameworkConfig;
  public readonly registry: NodeRegistry;
  public readonly validationService: NodeValidationService;
  
  private nodes = new Map<string, FrameworkNode>();
  private lifecycleHooks = new Map<string, NodeLifecycleHooks>();
  private extensions = new Map<string, NodeFrameworkExtension>();
  private metrics: NodeFrameworkMetrics;
  private metricsInterval?: NodeJS.Timeout;

  constructor(config: Partial<NodeFrameworkConfig> = {}) {
    super();

    this.config = {
      enableValidation: true,
      enableMonitoring: true,
      enableLifecycleHooks: true,
      enableExtensions: true,
      maxNodesInMemory: 1000,
      nodeCacheExpirationMs: 10 * 60 * 1000, // 10 minutes
      enableHotReload: false,
      ...config
    };

    this.registry = new NodeRegistry();
    this.validationService = new NodeValidationService();
    
    this.metrics = {
      totalNodes: 0,
      activeNodes: 0,
      registeredTypes: 0,
      totalExecutions: 0,
      averageExecutionTime: 0,
      errorRate: 0,
      memoryUsage: 0,
      cacheEfficiency: 0
    };

    this.initialize();
  }

  /**
   * Initialize the framework
   */
  private initialize(): void {
    // Set up monitoring if enabled
    if (this.config.enableMonitoring) {
      this.metricsInterval = setInterval(() => {
        this.updateMetrics();
      }, 5000); // Update every 5 seconds
    }

    // Set up validation service event handlers
    this.validationService.on('validation_complete', (data) => {
      this.emit('validation_complete', data);
    });

    this.validationService.on('validation_error', (data) => {
      this.emit('validation_error', data);
    });
  }

  /**
   * Create a node
   */
  async createNode(type: string, id: string, config: AdvancedNodeConfig, data: any): Promise<FrameworkNode> {
    // Check memory limits
    if (this.nodes.size >= this.config.maxNodesInMemory) {
      throw new Error('Maximum number of nodes in memory exceeded');
    }

    const node = this.registry.createNode(type, id, config, data);
    node.setFramework(this);

    // Apply global lifecycle hooks
    const globalHooks = this.lifecycleHooks.get('*');
    const typeHooks = this.lifecycleHooks.get(type);
    
    if (globalHooks || typeHooks) {
      node.setLifecycleHooks({ ...globalHooks, ...typeHooks });
    }

    await node.initialize();
    
    this.nodes.set(id, node);
    this.metrics.totalNodes++;
    this.metrics.activeNodes++;

    this.emit('node_created', {
      nodeId: id,
      nodeType: type
    });

    return node;
  }

  /**
   * Get a node by ID
   */
  getNode(id: string): FrameworkNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Destroy a node
   */
  async destroyNode(id: string): Promise<void> {
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error(`Node with ID '${id}' not found`);
    }

    await node.destroy();
    this.nodes.delete(id);
    this.registry.removeInstance(id);
    this.metrics.activeNodes--;

    this.emit('node_destroyed', {
      nodeId: id,
      nodeType: node.getType()
    });
  }

  /**
   * Register global lifecycle hooks
   */
  registerLifecycleHooks(type: string, hooks: NodeLifecycleHooks): void {
    this.lifecycleHooks.set(type, { ...this.lifecycleHooks.get(type), ...hooks });
  }

  /**
   * Register framework extension
   */
  registerExtension(extension: NodeFrameworkExtension): void {
    if (!this.config.enableExtensions) {
      throw new Error('Extensions are disabled in framework configuration');
    }

    this.extensions.set(extension.name, extension);
    extension.initialize(this);

    this.emit('extension_registered', {
      extensionName: extension.name,
      version: extension.version
    });
  }

  /**
   * Get framework metrics
   */
  getMetrics(): NodeFrameworkMetrics {
    return { ...this.metrics };
  }

  /**
   * Get all active nodes
   */
  getAllNodes(): FrameworkNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get nodes by type
   */
  getNodesByType(type: string): FrameworkNode[] {
    return Array.from(this.nodes.values()).filter(node => node.getType() === type);
  }

  /**
   * Execute multiple nodes in batch
   */
  async executeNodeBatch(nodeIds: string[], context: AdvancedExecutionContext): Promise<any[]> {
    const results: any[] = [];
    
    for (const nodeId of nodeIds) {
      const node = this.nodes.get(nodeId);
      if (!node) {
        throw new Error(`Node with ID '${nodeId}' not found`);
      }
      
      const result = await node.execute(context);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Shutdown the framework
   */
  async shutdown(): Promise<void> {
    // Clear metrics interval
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    // Destroy all nodes
    const nodeIds = Array.from(this.nodes.keys());
    for (const nodeId of nodeIds) {
      await this.destroyNode(nodeId);
    }

    // Shutdown extensions
    for (const extension of this.extensions.values()) {
      await extension.shutdown();
    }

    this.emit('framework_shutdown');
  }

  private updateMetrics(): void {
    const allNodes = Array.from(this.nodes.values());
    
    this.metrics.activeNodes = allNodes.length;
    this.metrics.registeredTypes = this.registry.getRegisteredTypes().length;
    
    // Calculate aggregated metrics
    let totalExecutions = 0;
    let totalExecutionTime = 0;
    let totalErrors = 0;
    
    allNodes.forEach(node => {
      const nodeMetrics = node.getMetrics();
      totalExecutions += nodeMetrics.executionCount;
      totalExecutionTime += nodeMetrics.totalExecutionTime;
      totalErrors += nodeMetrics.errorCount;
    });
    
    this.metrics.totalExecutions = totalExecutions;
    this.metrics.averageExecutionTime = totalExecutions > 0 ? totalExecutionTime / totalExecutions : 0;
    this.metrics.errorRate = totalExecutions > 0 ? (totalErrors / totalExecutions) * 100 : 0;
  }
}

/**
 * Extension interface for framework extensibility
 */
export interface NodeFrameworkExtension {
  name: string;
  version: string;
  description: string;
  initialize(framework: NodeFramework): Promise<void> | void;
  shutdown(): Promise<void> | void;
}

export default NodeFramework;
/**
 * Node Framework Core
 * Epic 18 - Implement Node Framework (E18-1753114562067-331CC8)
 *
 * Comprehensive node framework with lifecycle management, registry, and extension architecture
 */
import { EventEmitter } from 'events';
import { AdvancedRuntimeNode } from '../runtime/advanced';
import { NodeValidationService } from '../validation';
/**
 * Enhanced node base class with framework integration
 */
export class FrameworkNode extends AdvancedRuntimeNode {
    framework = null;
    metrics;
    lifecycleHooks = {};
    constructor(id, config, data) {
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
     * Set the framework reference
     */
    setFramework(framework) {
        this.framework = framework;
    }
    /**
     * Set lifecycle hooks
     */
    setLifecycleHooks(hooks) {
        this.lifecycleHooks = { ...this.lifecycleHooks, ...hooks };
    }
    /**
     * Initialize node with framework integration
     */
    async initialize() {
        try {
            await this.lifecycleHooks.beforeInit?.(this);
            // Perform node-specific initialization
            await this.onInitialize();
            await this.lifecycleHooks.afterInit?.(this);
            this.framework?.emit('node_initialized', {
                nodeId: this.id,
                nodeType: this.getType()
            });
        }
        catch (error) {
            await this.handleError(error);
            throw error;
        }
    }
    /**
     * Execute node with framework integration
     */
    async execute(context) {
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
        }
        catch (error) {
            this.metrics.errorCount++;
            await this.handleError(error);
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
    async destroy() {
        try {
            await this.lifecycleHooks.beforeDestroy?.(this);
            // Perform node-specific cleanup
            await this.onDestroy();
            this.framework?.emit('node_destroyed', {
                nodeId: this.id,
                nodeType: this.getType()
            });
        }
        catch (error) {
            await this.handleError(error);
            throw error;
        }
    }
    /**
     * Get node metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Clone node with new ID
     */
    async clone(newId) {
        const NodeClass = this.constructor;
        const cloned = new NodeClass(newId, this.config, this.getData());
        if (this.framework) {
            cloned.setFramework(this.framework);
        }
        cloned.setLifecycleHooks(this.lifecycleHooks);
        await cloned.initialize();
        return cloned;
    }
    // Private helper methods
    async validateWithFramework() {
        if (!this.framework?.validationService)
            return;
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
    updateExecutionMetrics(startTime) {
        const executionTime = Date.now() - startTime;
        this.metrics.executionCount++;
        this.metrics.totalExecutionTime += executionTime;
        this.metrics.averageExecutionTime = this.metrics.totalExecutionTime / this.metrics.executionCount;
        this.metrics.lastExecutionTime = executionTime;
    }
    async handleError(error) {
        this.metrics.lastError = error;
        await this.lifecycleHooks.onError?.(this, error);
    }
}
/**
 * Node Registry for managing node types and definitions
 */
export class NodeRegistry {
    definitions = new Map();
    instances = new Map();
    aliases = new Map();
    /**
     * Register a node type
     */
    registerNode(definition) {
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
    unregisterNode(type) {
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
    createNode(type, id, config, data) {
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
    getDefinition(type) {
        const resolvedType = this.aliases.get(type) || type;
        return this.definitions.get(resolvedType);
    }
    /**
     * Get all registered types
     */
    getRegisteredTypes() {
        return Array.from(this.definitions.keys());
    }
    /**
     * Get nodes by category
     */
    getNodesByCategory(category) {
        return Array.from(this.definitions.values()).filter(def => def.category === category);
    }
    /**
     * Register type alias
     */
    registerAlias(alias, type) {
        if (!this.definitions.has(type)) {
            throw new Error(`Cannot create alias for unregistered type: ${type}`);
        }
        this.aliases.set(alias, type);
    }
    /**
     * Get node instance
     */
    getInstance(id) {
        return this.instances.get(id);
    }
    /**
     * Remove node instance
     */
    removeInstance(id) {
        this.instances.delete(id);
    }
    /**
     * Search nodes by criteria
     */
    searchNodes(criteria) {
        return Array.from(this.definitions.values()).filter(def => {
            if (criteria.category && def.category !== criteria.category)
                return false;
            if (criteria.author && def.metadata.author !== criteria.author)
                return false;
            if (criteria.deprecated !== undefined && def.metadata.deprecated !== criteria.deprecated)
                return false;
            if (criteria.experimental !== undefined && def.metadata.experimental !== criteria.experimental)
                return false;
            if (criteria.tags && !criteria.tags.every(tag => def.metadata.tags.includes(tag)))
                return false;
            return true;
        });
    }
    validateDefinition(definition) {
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
    config;
    registry;
    validationService;
    nodes = new Map();
    lifecycleHooks = new Map();
    extensions = new Map();
    metrics;
    metricsInterval;
    constructor(config = {}) {
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
    initialize() {
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
    async createNode(type, id, config, data) {
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
    getNode(id) {
        return this.nodes.get(id);
    }
    /**
     * Destroy a node
     */
    async destroyNode(id) {
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
    registerLifecycleHooks(type, hooks) {
        this.lifecycleHooks.set(type, { ...this.lifecycleHooks.get(type), ...hooks });
    }
    /**
     * Register framework extension
     */
    registerExtension(extension) {
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
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get all active nodes
     */
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
    /**
     * Get nodes by type
     */
    getNodesByType(type) {
        return Array.from(this.nodes.values()).filter(node => node.getType() === type);
    }
    /**
     * Execute multiple nodes in batch
     */
    async executeNodeBatch(nodeIds, context) {
        const results = [];
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
    async shutdown() {
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
    updateMetrics() {
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
export default NodeFramework;

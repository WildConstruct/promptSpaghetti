/**
 * Node Factory
 * Epic 18 - Implement Node Framework (E18-1753114562067-331CC8)
 *
 * Factory for creating and managing framework nodes with built-in validation and optimization
 */
import { FrameworkNode, NodeFramework } from './NodeFramework';
import { NodeValidationService } from '../validation';
export class NodeFactory {
    framework;
    validationService;
    config;
    templates = new Map();
    nodeCache = new Map();
    creationHistory;
    number;
    nodeType;
    nodeId;
    success;
    error;
}
 > ;
[];
constructor();
framework: NodeFramework,
    validationService;
NodeValidationService,
    config;
(Partial) = {};
this.framework = framework;
this.validationService = validationService;
this.config = {
    enableOptimization: true,
    enableTemplates: true,
    defaultValidation: true,
    enableCaching: false, // Nodes are typically unique,
    maxCacheSize: 100,
    ...config
};
/**
 * Create a new node with optional validation and optimization
 */
async;
createNode(type, string),
    id;
string,
    config;
AdvancedNodeConfig,
    data;
any,
    options;
NodeCreationOptions = {};
Promise < FrameworkNode > {
    try: {
        // Apply template if specified
        let, finalConfig = config,
        let, finalData = data,
        if(options) { }, : .template && this.config.enableTemplates
    }
};
{
    const template = this.templates.get(options.template);
    if (template && template.nodeType === type) {
        finalConfig = { ...template.defaultConfig, ...config };
        finalData = { ...template.defaultData, ...data };
        // Validate node before creation if requested
        if ((options.validate ?? this.config.defaultValidation)) {
            await this.validateNodeData(type, id, finalConfig, finalData);
            // Apply optimizations if enabled
            if (options.optimize ?? this.config.enableOptimization) {
                finalConfig = this.optimizeNodeConfig(type, finalConfig);
                finalData = this.optimizeNodeData(type, finalData);
                // Create the node through the framework
                const node = await this.framework.createNode(type, id, finalConfig, finalData);
                // Apply custom lifecycle hooks if provided
                if (options.lifecycleHooks) {
                    node.setLifecycleHooks(options.lifecycleHooks);
                    // Cache the node if caching is enabled
                    if (this.config.enableCaching) {
                        this.cacheNode(id, node);
                        // Record successful creation
                        this.recordCreation(type, id, true);
                        return node;
                    }
                    try { }
                    catch (error) {
                        // Record failed creation
                        this.recordCreation(type, id, false, error instanceof Error ? error.message : 'Unknown error');
                        throw error;
                        /**
                        * Create node from template
                        */
                        async;
                        createFromTemplate(templateId, string),
                            nodeId;
                        string,
                            overrides;
                        {
                            config ?  : Partial;
                            data ?  : any;
                        }
                        { }
                        Promise < FrameworkNode > {
                            const: template = this.templates.get(templateId),
                            if(, template) {
                                throw new Error(`Template '${templateId}' not found`);
                            },
                            const: config = { ...template.defaultConfig, ...overrides.config },
                            const: data = { ...template.defaultData, ...overrides.data },
                            return: this.createNode(template.nodeType, nodeId, config, data, {}),
                            template: templateId,
                            validate: true,
                            optimize: true,
                        };
                        ;
                        /**
                         * Bulk create multiple nodes
                         */
                        async;
                        createNodeBatch(specs, Array < {}),
                            type;
                        string;
                        id: string;
                        config: AdvancedNodeConfig;
                        data: any;
                        options ?  : NodeCreationOptions;
                    }
                     > ;
                    Promise < FrameworkNode > {
                        const: results, FrameworkNode = [],
                        const: errors, Array() { spec: any; error: Error; }
                    } > ;
                    [];
                    // Process in parallel with controlled concurrency
                    const batchSize = 5;
                    for (let i = 0; i < specs.length; i += batchSize) {
                        const batch = specs.slice(i, i + batchSize);
                        const batchPromises = batch.map(async (spec) => {
                            try {
                                const node = await this.createNode();
                            }
                            finally { }
                        });
                        spec.type,
                            spec.id,
                            spec.config,
                            spec.data,
                            spec.options;
                        ;
                        return { success: true, node, spec };
                    }
                    try { }
                    catch (error) {
                        return { success: false, error: error, spec };
                    }
                    ;
                    const batchResults = await Promise.all(batchPromises);
                    for (const result of batchResults) {
                        if (result.success) {
                            results.push(result.node);
                        }
                        else {
                            errors.push({ spec: result.spec, error: result.error });
                            // If there were errors, provide detailed information
                            if (errors.length > 0) {
                                const errorSummary = errors.map(e => `${e.spec.id}: ${e.error.message}`).join('; ');
                            }
                            throw new Error(`Batch creation failed for ${errors.length} node(s): ${errorSummary}`);
                        }
                        return results;
                        /**
                         * Clone an existing node with a new ID
                         */
                        async;
                        cloneNode(sourceId, string, newId, string, overrides ?  : {});
                        config ?  : Partial;
                        data ?  : any;
                    }
                    Promise < FrameworkNode > {
                        const: sourceNode = this.framework.getNode(sourceId),
                        if(, sourceNode) {
                            throw new Error(`Source node '${sourceId}' not found`);
                        }
                        // Get the source node's current configuration and data
                        ,
                        // Get the source node's current configuration and data
                        const: sourceMetrics = sourceNode.getMetrics(),
                        const: definition = sourceNode.getDefinition(),
                        if(, definition) {
                            throw new Error(`Cannot clone node '${sourceId}': definition not available`);
                        }
                        // Create cloned node with overrides
                        ,
                        // Create cloned node with overrides
                        const: clonedNode = await sourceNode.clone(newId),
                        // Apply any overrides (this would require additional methods on FrameworkNode)
                        if(overrides, config) {
                            // Node would need a method to update configuration
                            // clonedNode.updateConfig(overrides.config);
                            this.recordCreation(sourceMetrics.nodeType, newId, true, `Cloned from ${sourceId}`);
                        },
                        return: clonedNode,
                        /**
                         * Register a node template
                         */
                        registerTemplate(template) {
                            if (!this.config.enableTemplates) {
                                throw new Error('Templates are disabled in factory configuration');
                                // Validate template
                                this.validateTemplate(template);
                                this.templates.set(template.id, template);
                                /**
                                 * Get available templates
                                 */
                                getTemplates(category ?  : string);
                                NodeTemplate;
                                {
                                    const templates = Array.from(this.templates.values());
                                    return category ? templates.filter(t => t.category === category) : templates;
                                    /**
                                     * Get template by ID
                                     */
                                    getTemplate(id, string);
                                    NodeTemplate | undefined;
                                    {
                                        return this.templates.get(id);
                                        /**
                                         * Create node with best practices applied
                                         */
                                        async;
                                        createOptimizedNode(type, string),
                                            id;
                                        string,
                                            config;
                                        AdvancedNodeConfig,
                                            data;
                                        any;
                                        Promise < FrameworkNode > {
                                            // Apply comprehensive optimization
                                            return: this.createNode(type, id, config, data, {}),
                                            validate: true,
                                            optimize: true,
                                            lifecycleHooks: {
                                                beforeExecute: async (node, context) => {
                                                    // Add performance monitoring
                                                    console.debug(`Executing node ${node.id} of type ${type}`);
                                                }
                                            },
                                            onError: async (node, error) => {
                                                // Enhanced error logging
                                                console.error(`Node ${node.id} execution failed:`, error);
                                            }
                                        };
                                        ;
                                        /**
                                         * Get factory statistics
                                         */
                                        getStatistics();
                                        {
                                            totalCreated: number;
                                            successfulCreations: number;
                                            failedCreations: number;
                                            successRate: number;
                                            averageCreationTime: number;
                                            typeDistribution: Record;
                                            recentFailures: Array;
                                            const total = this.creationHistory.length;
                                            const successful = this.creationHistory.filter(h => h.success).length;
                                            const failed = total - successful;
                                            const typeDistribution = {};
                                            this.creationHistory.forEach(h => { });
                                            typeDistribution[h.nodeType] = (typeDistribution[h.nodeType] || 0) + 1;
                                        }
                                        ;
                                        const recentFailures = this.creationHistory;
                                    }
                                }
                            }
                        },
                        : 
                            .filter(h => !h.success && h.error)
                            .slice(-10) // Last 10 failures
                            .map(h => ({}), nodeType, h.nodeType, nodeId, h.nodeId, error, h.error, timestamp, h.timestamp)
                    };
                    ;
                    return {
                        totalCreated: total,
                        successfulCreations: successful,
                        failedCreations: failed,
                        successRate: total > 0 ? (successful / total) * 100 : 0,
                        averageCreationTime: 0, // Would need timing data,
                        typeDistribution,
                        recentFailures
                    };
                    /**
                     * Clear creation history
                     */
                    clearHistory();
                    void {
                        this: .creationHistory = [],
                        /**
                        * Export templates to JSON
                        */
                        exportTemplates() {
                            const templates = Array.from(this.templates.values());
                            return JSON.stringify(templates, null, 2);
                            /**
                            * Import templates from JSON
                            */
                            importTemplates(json, string);
                            void {
                                try: {
                                    const: templates, NodeTemplate = JSON.parse(json),
                                    templates, : .forEach(template => { }),
                                    this: .registerTemplate(template)
                                }
                            };
                            try { }
                            catch (error) {
                                throw new Error(`Failed to import templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            }
                            // Private helper methods
                        }
                        // Private helper methods
                        ,
                        id: string,
                        config: AdvancedNodeConfig,
                        data: any, void:  > {
                            const: nodeData = { id, type, config, data },
                            const: result = await this.validationService.validateNode(nodeData),
                            if(, result) { }, : .valid }
                    };
                    {
                        throw new Error(`Node validation failed: ${result.errors.join(', ')}`);
                    }
                    optimizeNodeConfig(type, string, config, AdvancedNodeConfig);
                    AdvancedNodeConfig;
                    {
                        const optimized = { ...config };
                        // Apply type-specific optimizations
                        switch (type) {
                            case 'WeightedChoice':
                                // Enable caching for weighted choices as they're often reused
                                optimized.cacheable = true;
                                break;
                            case 'Sequential':
                                // Sequential nodes are stateful by nature
                                optimized.stateful = true;
                                break;
                            case 'Conditional':
                                // Conditionals should be deterministic for testing
                                optimized.deterministic = true;
                                break;
                                return optimized;
                                optimizeNodeData(type, string, data, any);
                                any;
                                {
                                    const optimized = { ...data };
                                    // Apply type-specific data optimizations
                                    switch (type) {
                                        case 'WeightedChoice':
                                            // Normalize weights if they exist
                                            if (optimized.weights && Array.isArray(optimized.weights)) {
                                                const total = optimized.weights.reduce((sum, w) => sum + w, 0);
                                                if (total > 0) {
                                                    optimized.normalizedWeights = optimized.weights.map((w) => w / total);
                                                    break;
                                                }
                                            }
                                        case 'Markov':
                                            // Pre-calculate transition probabilities
                                            if (optimized.transitionMatrix) {
                                                optimized.normalizedMatrix = this.normalizeTransitionMatrix(optimized.transitionMatrix);
                                                break;
                                                return optimized;
                                                normalizeTransitionMatrix(matrix, Record < string);
                                                Record < string,
                                                    number >>
                                                ;
                                                Record < string, Record < string, number >> {
                                                    const: normalized
                                                } < string, number >> ;
                                                { }
                                                ;
                                                for (const [state, transitions] of Object.entries(matrix)) {
                                                    const total = Object.values(transitions).reduce((sum, weight) => sum + weight, 0);
                                                    if (total > 0) {
                                                        normalized[state] = {};
                                                        for (const [targetState, weight] of Object.entries(transitions)) {
                                                            normalized[state][targetState] = weight / total;
                                                        }
                                                        {
                                                            normalized[state] = transitions;
                                                            return normalized;
                                                            validateTemplate(template, NodeTemplate);
                                                            void {
                                                                if(, template) { }, : .id || typeof template.id !== 'string'
                                                            };
                                                            {
                                                                throw new Error('Template must have a valid id string');
                                                                if (!template.nodeType || typeof template.nodeType !== 'string') {
                                                                    throw new Error('Template must have a valid nodeType string');
                                                                    if (!this.framework.registry.getDefinition(template.nodeType)) {
                                                                        throw new Error(`Template references unknown node type: ${template.nodeType}`);
                                                                    }
                                                                    cacheNode(id, string, node, FrameworkNode);
                                                                    void {
                                                                        : .nodeCache.size >= this.config.maxCacheSize
                                                                    };
                                                                    {
                                                                        // Remove oldest cached node
                                                                        const oldestKey = this.nodeCache.keys().next().value;
                                                                        this.nodeCache.delete(oldestKey);
                                                                        this.nodeCache.set(id, node);
                                                                        recordCreation(type, string, id, string, success, boolean, error ?  : string);
                                                                        void {
                                                                            this: .creationHistory.push({}),
                                                                            timestamp: Date.now(),
                                                                            nodeType: type,
                                                                            nodeId: id,
                                                                            success,
                                                                            error
                                                                        };
                                                                        ;
                                                                        // Keep history size manageable
                                                                        if (this.creationHistory.length > 1000) {
                                                                            this.creationHistory = this.creationHistory.slice(-800); // Keep last 800 entries
                                                                            export default NodeFactory;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                    }
                                }
                        }
                    }
                }
            }
        }
    }
}

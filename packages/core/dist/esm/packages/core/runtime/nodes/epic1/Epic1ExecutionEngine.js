/**
 * Epic 1 Execution Engine
 * Executes graphs of Epic 1 nodes with deterministic behavior
 */
import { Epic1ExecutionContext } from './Epic1ExecutionContext';
import { Epic1NodeType } from './nodeTypes';
import { validateGraph } from './validation';
/**
 * Epic 1 Execution Engine
 * Handles graph traversal and node execution with deterministic behavior
 */
export class Epic1ExecutionEngine {
    graph;
    context;
    results;
    executionOrder;
    outputNodeId = null;
    constructor(graph, seed) {
        this.graph = graph;
        this.context = new Epic1ExecutionContext(seed);
        this.results = new Map();
        this.executionOrder = [];
    }
    /**
     * Execute the entire graph
     */
    async execute() {
        const startTime = Date.now();
        try {
            console.log('[ExecutionEngine] Starting execution with', this.graph.nodes.size, 'nodes');
            // Validate the graph first
            const validation = await validateGraph(this.graph.nodes, this.graph.edges);
            if (!validation.valid) {
                throw new Error(`Graph validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
            }
            // Add warnings from validation
            validation.warnings.forEach(warning => {
                this.context.addWarning(warning.nodeId, warning.message);
            });
            // Find output node(s)
            const outputNodes = Array.from(this.graph.nodes.entries())
                .filter(([_, node]) => node.getNodeType() === Epic1NodeType.Output);
            console.log('[ExecutionEngine] Found output nodes:', outputNodes.map(([id]) => id));
            console.log('[ExecutionEngine] Graph edges:', this.graph.edges.length, 'edges:', this.graph.edges);
            if (outputNodes.length === 0) {
                console.warn('[ExecutionEngine] No output node found in graph - skipping execution');
                throw new Error('No output node found in graph');
            }
            // Use the first output node as the target
            this.outputNodeId = outputNodes[0][0];
            // Build execution order (topological sort)
            this.buildExecutionOrder();
            console.log('[ExecutionEngine] Execution order:', this.executionOrder);
            // Execute nodes in order
            for (const nodeId of this.executionOrder) {
                await this.executeNode(nodeId);
            }
            // Get final output
            const outputResult = this.results.get(this.outputNodeId);
            const finalOutput = outputResult?.output || null;
            console.log('[ExecutionEngine] Final output from node', this.outputNodeId, ':', finalOutput);
            // Finalize stats
            const stats = this.context.finalize();
            return {
                success: stats.errors.length === 0,
                output: finalOutput,
                results: this.results,
                stats: {
                    totalDuration: Date.now() - startTime,
                    nodesExecuted: stats.nodesExecuted,
                    errors: stats.errors,
                    warnings: stats.warnings
                },
                context: this.context
            };
        }
        catch (error) {
            const stats = this.context.finalize();
            return {
                success: false,
                output: null,
                results: this.results,
                stats: {
                    totalDuration: Date.now() - startTime,
                    nodesExecuted: stats.nodesExecuted,
                    errors: [...stats.errors, { nodeId: 'engine', error: error }],
                    warnings: stats.warnings
                },
                context: this.context
            };
        }
    }
    /**
     * Execute a single node
     */
    async executeNode(nodeId) {
        const startTime = Date.now();
        const node = this.graph.nodes.get(nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found`);
        }
        try {
            this.context.incrementDepth();
            this.context.recordNodeExecution(nodeId);
            // Get inputs for this node
            const inputs = this.getNodeInputs(nodeId);
            console.log(`[ExecutionEngine] Executing node ${nodeId} of type ${node.getNodeType()} with ${inputs.length} inputs:`, inputs);
            // Execute based on node type
            let output = null;
            switch (node.getNodeType()) {
                case Epic1NodeType.TextBlock:
                    output = await this.executeTextBlock(node, inputs);
                    break;
                case Epic1NodeType.WeightedChoice:
                    output = await this.executeWeightedChoice(node, inputs);
                    break;
                case Epic1NodeType.Concat:
                    output = await this.executeConcat(node, inputs);
                    break;
                case Epic1NodeType.Variable:
                    output = await this.executeVariable(node, inputs);
                    break;
                case Epic1NodeType.Output:
                    output = await this.executeOutput(node, inputs);
                    break;
                default:
                    throw new Error(`Unknown node type: ${node.getNodeType()}`);
            }
            // Store result
            this.results.set(nodeId, {
                nodeId,
                output,
                duration: Date.now() - startTime
            });
            console.log(`[ExecutionEngine] Node ${nodeId} produced output:`, output);
            this.context.decrementDepth();
        }
        catch (error) {
            this.context.decrementDepth();
            const err = error;
            this.context.addError(nodeId, err);
            this.results.set(nodeId, {
                nodeId,
                output: null,
                duration: Date.now() - startTime,
                error: err
            });
            // Don't propagate error - continue execution
            // This allows partial execution results
        }
    }
    /**
     * Execute a TextBlock node
     */
    async executeTextBlock(node, inputs) {
        const value = node.getCurrentValue();
        // Substitute variables
        const substituted = this.context.substituteVariables(value);
        return substituted;
    }
    /**
     * Execute a WeightedChoice node
     */
    async executeWeightedChoice(node, inputs) {
        const options = node.getData().value;
        if (options.length === 0) {
            return '';
        }
        // Calculate total weight
        const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
        if (totalWeight === 0) {
            return options[0].text; // Fallback to first option
        }
        // Get node-specific PRNG for deterministic selection
        const prng = this.context.getNodePRNG(node.serialize().id);
        const random = prng() * totalWeight;
        // Select based on weight
        let accumulator = 0;
        for (const option of options) {
            accumulator += option.weight;
            if (random <= accumulator) {
                // Substitute variables in the selected text
                return this.context.substituteVariables(option.text);
            }
        }
        // Fallback (shouldn't reach here)
        return options[options.length - 1].text;
    }
    /**
     * Execute a Concat node
     */
    async executeConcat(node, inputs) {
        const config = node.getData().configuration || {};
        const separator = config.separator || ' ';
        const trimInputs = config.trimInputs !== false;
        // Process inputs
        const processedInputs = inputs
            .filter(input => input != null && input !== '') // Remove null/undefined/empty
            .map(input => {
            const str = String(input);
            return trimInputs ? str.trim() : str;
        })
            .filter(str => str.length > 0); // Remove empty after trimming
        return processedInputs.join(separator);
    }
    /**
     * Execute a Variable node
     */
    async executeVariable(node, inputs) {
        const config = node.getData().value;
        const nodeConfig = node.getData().configuration || {};
        const mode = nodeConfig.mode || 'both';
        // Get input value (if any)
        const inputValue = inputs.length > 0 ? inputs[0] : undefined;
        if (mode === 'set' || mode === 'both') {
            // Set the variable
            const valueToSet = inputValue !== undefined ? inputValue : config.defaultValue;
            if (valueToSet !== undefined) {
                this.context.setVariable(config.name, valueToSet);
            }
        }
        if (mode === 'get' || mode === 'both') {
            // Get the variable
            const value = this.context.getVariable(config.name);
            if (value !== undefined) {
                return value;
            }
            else if (config.defaultValue !== undefined) {
                return config.defaultValue;
            }
        }
        // For set mode, pass through the input
        if (mode === 'set') {
            return inputValue;
        }
        return null;
    }
    /**
     * Execute an Output node
     */
    async executeOutput(node, inputs) {
        const input = inputs.length > 0 ? inputs[0] : '';
        console.log('[ExecutionEngine] Output node receiving input:', input, 'from', inputs.length, 'sources');
        // Set the input on the node for display
        node.setInput(input);
        return input;
    }
    /**
     * Get inputs for a node by following incoming edges
     */
    getNodeInputs(nodeId) {
        const inputs = [];
        // Find edges targeting this node
        const incomingEdges = this.graph.edges.filter(edge => edge.target === nodeId);
        // Sort by targetHandle to maintain order (if handles are like 'input0', 'input1', etc.)
        incomingEdges.sort((a, b) => {
            const handleA = a.targetHandle || '0';
            const handleB = b.targetHandle || '0';
            return handleA.localeCompare(handleB);
        });
        // Collect outputs from source nodes
        for (const edge of incomingEdges) {
            const sourceResult = this.results.get(edge.source);
            if (sourceResult && !sourceResult.error) {
                inputs.push(sourceResult.output);
            }
        }
        return inputs;
    }
    /**
     * Build execution order using topological sort
     */
    buildExecutionOrder() {
        const visited = new Set();
        const visiting = new Set();
        const order = [];
        // Build adjacency list
        const adjacency = new Map();
        this.graph.nodes.forEach((_, nodeId) => {
            adjacency.set(nodeId, []);
        });
        this.graph.edges.forEach(edge => {
            const neighbors = adjacency.get(edge.source) || [];
            neighbors.push(edge.target);
            adjacency.set(edge.source, neighbors);
        });
        // DFS for topological sort
        const visit = (nodeId) => {
            if (visited.has(nodeId))
                return;
            if (visiting.has(nodeId)) {
                throw new Error('Cycle detected in graph');
            }
            visiting.add(nodeId);
            // Visit dependencies first
            const dependencies = this.graph.edges
                .filter(edge => edge.target === nodeId)
                .map(edge => edge.source);
            for (const dep of dependencies) {
                visit(dep);
            }
            visiting.delete(nodeId);
            visited.add(nodeId);
            order.push(nodeId);
        };
        // Start from output node
        if (this.outputNodeId) {
            visit(this.outputNodeId);
        }
        // Visit any remaining nodes (disconnected components)
        this.graph.nodes.forEach((_, nodeId) => {
            if (!visited.has(nodeId)) {
                visit(nodeId);
            }
        });
        this.executionOrder = order;
    }
    /**
     * Get the execution context (for inspection/debugging)
     */
    getContext() {
        return this.context;
    }
    /**
     * Get the execution order (for inspection/debugging)
     */
    getExecutionOrder() {
        return [...this.executionOrder];
    }
}

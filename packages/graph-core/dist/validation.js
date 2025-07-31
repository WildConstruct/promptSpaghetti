/**
 * Graph validation utilities
 * Enhanced validation with cycle detection and comprehensive error reporting
 */
export class GraphValidator {
    /**
     * Validate a complete graph document
     */
    validate(graph) {
        const errors = [];
        const warnings = [];
        try {
            // Basic structure validation
            this.validateStructure(graph, errors);
            // Node validation
            this.validateNodes(graph, errors, warnings);
            // Edge validation
            this.validateEdges(graph, errors);
            // Cycle detection
            this.detectCycles(graph, errors);
            // Performance analysis
            this.analyzePerformance(graph, warnings);
            // Connectivity analysis
            this.analyzeConnectivity(graph, warnings);
        }
        catch (error) {
            errors.push({
                type: 'MALFORMED_GRAPH',
                message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
                severity: 'error',
            });
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Validate graph structure
     */
    validateStructure(graph, errors) {
        if (!graph.id || typeof graph.id !== 'string') {
            errors.push({
                type: 'MALFORMED_GRAPH',
                message: 'Graph must have a valid string ID',
                severity: 'error',
            });
        }
        if (!graph.nodes || !(graph.nodes instanceof Map)) {
            errors.push({
                type: 'MALFORMED_GRAPH',
                message: 'Graph must have a nodes Map',
                severity: 'error',
            });
        }
        if (!graph.edges || !(graph.edges instanceof Map)) {
            errors.push({
                type: 'MALFORMED_GRAPH',
                message: 'Graph must have an edges Map',
                severity: 'error',
            });
        }
        if (!graph.metadata || typeof graph.metadata !== 'object') {
            errors.push({
                type: 'MALFORMED_GRAPH',
                message: 'Graph must have metadata object',
                severity: 'error',
            });
        }
    }
    /**
     * Validate individual nodes
     */
    validateNodes(graph, errors, warnings) {
        const validNodeTypes = new Set([
            'WeightedChoice',
            'Concat',
            'Output',
            'Include',
            'SetVariable',
            'GetVariable',
            'WeightedAdvanced',
            'Conditional',
            'Sequential',
            'Markov',
            'PythonTransform',
        ]);
        for (const [nodeId, node] of graph.nodes) {
            // Validate node ID consistency
            if (node.id !== nodeId) {
                errors.push({
                    type: 'INVALID_DATA',
                    message: `Node ID mismatch: map key "${nodeId}" !== node.id "${node.id}"`,
                    nodeId,
                    severity: 'error',
                });
            }
            // Validate node type
            if (!validNodeTypes.has(node.type)) {
                errors.push({
                    type: 'INVALID_NODE_TYPE',
                    message: `Invalid node type: "${node.type}"`,
                    nodeId,
                    severity: 'error',
                });
            }
            // Validate node data based on type
            this.validateNodeData(node, errors);
            // Validate inputs array
            if (node.inputs) {
                if (!Array.isArray(node.inputs)) {
                    errors.push({
                        type: 'INVALID_DATA',
                        message: 'Node inputs must be an array',
                        nodeId,
                        severity: 'error',
                    });
                }
                else {
                    // Check that input nodes exist
                    for (const inputId of node.inputs) {
                        if (!graph.nodes.has(inputId)) {
                            errors.push({
                                type: 'MISSING_NODE',
                                message: `Node "${nodeId}" references non-existent input node "${inputId}"`,
                                nodeId,
                                severity: 'error',
                            });
                        }
                    }
                }
            }
        }
    }
    /**
     * Validate node-specific data
     */
    validateNodeData(node, errors) {
        switch (node.type) {
            case 'WeightedChoice':
                if (!node.data.choices || !Array.isArray(node.data.choices)) {
                    errors.push({
                        type: 'INVALID_DATA',
                        message: 'WeightedChoice node must have choices array',
                        nodeId: node.id,
                        severity: 'error',
                    });
                }
                else {
                    for (const choice of node.data.choices) {
                        if (typeof choice.value !== 'string' || typeof choice.weight !== 'number' || choice.weight < 0) {
                            errors.push({
                                type: 'INVALID_DATA',
                                message: 'WeightedChoice choices must have string value and non-negative number weight',
                                nodeId: node.id,
                                severity: 'error',
                            });
                        }
                    }
                }
                break;
            case 'SetVariable':
                if (!node.data.key || typeof node.data.key !== 'string') {
                    errors.push({
                        type: 'INVALID_DATA',
                        message: 'SetVariable node must have a string key',
                        nodeId: node.id,
                        severity: 'error',
                    });
                }
                break;
            case 'GetVariable':
                if (!node.data.key || typeof node.data.key !== 'string') {
                    errors.push({
                        type: 'INVALID_DATA',
                        message: 'GetVariable node must have a string key',
                        nodeId: node.id,
                        severity: 'error',
                    });
                }
                break;
            case 'Include':
                if (!node.data.name || typeof node.data.name !== 'string') {
                    errors.push({
                        type: 'INVALID_DATA',
                        message: 'Include node must have a string name',
                        nodeId: node.id,
                        severity: 'error',
                    });
                }
                break;
        }
    }
    /**
     * Validate edges
     */
    validateEdges(graph, errors) {
        for (const [edgeId, edge] of graph.edges) {
            // Validate edge ID consistency
            if (edge.id !== edgeId) {
                errors.push({
                    type: 'INVALID_DATA',
                    message: `Edge ID mismatch: map key "${edgeId}" !== edge.id "${edge.id}"`,
                    edgeId,
                    severity: 'error',
                });
            }
            // Validate source and target nodes exist
            if (!graph.nodes.has(edge.source)) {
                errors.push({
                    type: 'MISSING_NODE',
                    message: `Edge "${edgeId}" references non-existent source node "${edge.source}"`,
                    edgeId,
                    severity: 'error',
                });
            }
            if (!graph.nodes.has(edge.target)) {
                errors.push({
                    type: 'MISSING_NODE',
                    message: `Edge "${edgeId}" references non-existent target node "${edge.target}"`,
                    edgeId,
                    severity: 'error',
                });
            }
            // Validate no self-loops
            if (edge.source === edge.target) {
                errors.push({
                    type: 'INVALID_EDGE',
                    message: `Edge "${edgeId}" creates a self-loop on node "${edge.source}"`,
                    edgeId,
                    severity: 'error',
                });
            }
        }
    }
    /**
     * Detect cycles in the graph using DFS
     */
    detectCycles(graph, errors) {
        const visited = new Set();
        const recursionStack = new Set();
        const adjacencyList = this.buildAdjacencyList(graph);
        const dfs = (nodeId, path) => {
            if (recursionStack.has(nodeId)) {
                const cycleStart = path.indexOf(nodeId);
                const cycle = path.slice(cycleStart).concat(nodeId);
                errors.push({
                    type: 'CYCLE_DETECTED',
                    message: `Cycle detected: ${cycle.join(' → ')}`,
                    nodeId,
                    severity: 'error',
                });
                return true;
            }
            if (visited.has(nodeId)) {
                return false;
            }
            visited.add(nodeId);
            recursionStack.add(nodeId);
            path.push(nodeId);
            const neighbors = adjacencyList.get(nodeId) || [];
            for (const neighbor of neighbors) {
                if (dfs(neighbor, [...path])) {
                    return true;
                }
            }
            recursionStack.delete(nodeId);
            return false;
        };
        for (const nodeId of graph.nodes.keys()) {
            if (!visited.has(nodeId)) {
                dfs(nodeId, []);
            }
        }
    }
    /**
     * Analyze performance concerns
     */
    analyzePerformance(graph, warnings) {
        const nodeCount = graph.nodes.size;
        const edgeCount = graph.edges.size;
        // Large graph warning
        if (nodeCount > 100) {
            warnings.push({
                type: 'PERFORMANCE_CONCERN',
                message: `Large graph with ${nodeCount} nodes may impact performance`,
                suggestion: 'Consider breaking into smaller sub-graphs',
            });
        }
        // High connectivity warning
        if (edgeCount > nodeCount * 2) {
            warnings.push({
                type: 'PERFORMANCE_CONCERN',
                message: `High edge-to-node ratio (${edgeCount}:${nodeCount}) may impact performance`,
                suggestion: 'Review graph structure for optimization opportunities',
            });
        }
        // Check for very deep chains
        const chains = this.findLongestChains(graph);
        for (const chain of chains) {
            if (chain.length > 20) {
                warnings.push({
                    type: 'PERFORMANCE_CONCERN',
                    message: `Very deep execution chain (${chain.length} nodes)`,
                    nodeId: chain[0],
                    suggestion: 'Consider breaking long chains for better performance',
                });
            }
        }
    }
    /**
     * Analyze graph connectivity
     */
    analyzeConnectivity(graph, warnings) {
        const adjacencyList = this.buildAdjacencyList(graph);
        const incomingEdges = new Map();
        // Count incoming edges
        for (const neighbors of adjacencyList.values()) {
            for (const neighbor of neighbors) {
                incomingEdges.set(neighbor, (incomingEdges.get(neighbor) || 0) + 1);
            }
        }
        // Find disconnected nodes
        for (const nodeId of graph.nodes.keys()) {
            const hasOutgoing = adjacencyList.has(nodeId) && adjacencyList.get(nodeId).length > 0;
            const hasIncoming = incomingEdges.has(nodeId);
            if (!hasOutgoing && !hasIncoming) {
                warnings.push({
                    type: 'DISCONNECTED_NODE',
                    message: `Node "${nodeId}" is completely disconnected`,
                    nodeId,
                    suggestion: 'Connect node to the graph or remove if unused',
                });
            }
        }
        // Check for Output nodes
        const outputNodes = Array.from(graph.nodes.values()).filter(node => node.type === 'Output');
        if (outputNodes.length === 0) {
            warnings.push({
                type: 'DISCONNECTED_NODE',
                message: 'Graph has no Output nodes',
                suggestion: 'Add at least one Output node to generate results',
            });
        }
    }
    /**
     * Build adjacency list from graph
     */
    buildAdjacencyList(graph) {
        const adjacencyList = new Map();
        // Initialize with all nodes
        for (const nodeId of graph.nodes.keys()) {
            adjacencyList.set(nodeId, []);
        }
        // Add edges
        for (const edge of graph.edges.values()) {
            const sourceNeighbors = adjacencyList.get(edge.source) || [];
            sourceNeighbors.push(edge.target);
            adjacencyList.set(edge.source, sourceNeighbors);
        }
        return adjacencyList;
    }
    /**
     * Find longest execution chains for performance analysis
     */
    findLongestChains(graph) {
        const adjacencyList = this.buildAdjacencyList(graph);
        const chains = [];
        const dfs = (nodeId, currentChain, visited) => {
            if (visited.has(nodeId))
                return;
            visited.add(nodeId);
            currentChain.push(nodeId);
            const neighbors = adjacencyList.get(nodeId) || [];
            if (neighbors.length === 0) {
                // End of chain
                if (currentChain.length > 1) {
                    chains.push([...currentChain]);
                }
            }
            else {
                for (const neighbor of neighbors) {
                    dfs(neighbor, [...currentChain], new Set(visited));
                }
            }
        };
        // Start DFS from nodes with no incoming edges
        const hasIncoming = new Set();
        for (const neighbors of adjacencyList.values()) {
            neighbors.forEach(neighbor => hasIncoming.add(neighbor));
        }
        for (const nodeId of graph.nodes.keys()) {
            if (!hasIncoming.has(nodeId)) {
                dfs(nodeId, [], new Set());
            }
        }
        return chains.sort((a, b) => b.length - a.length);
    }
}
//# sourceMappingURL=validation.js.map
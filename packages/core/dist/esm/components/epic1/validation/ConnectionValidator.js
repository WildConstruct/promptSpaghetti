/**
 * Epic 1 Connection Validator
 * Defines and enforces connection rules between different node types
 */
export class ConnectionValidator {
    rules = [
        // Output nodes cannot have outgoing connections
        {
            sourceType: 'output',
            targetType: [],
            errorMessage: 'Output nodes cannot have outgoing connections',
        },
        // Variables can only connect to appropriate nodes
        {
            sourceType: 'getVariable',
            targetType: ['concat', 'output', 'setVariable', 'weightedChoice'],
            errorMessage: 'Variable getters can only connect to processing nodes',
        },
        // Set variables need input
        {
            sourceType: ['textBlock', 'weightedChoice', 'concat', 'getVariable'],
            targetType: 'setVariable',
        },
        // Concat accepts multiple inputs
        {
            sourceType: ['textBlock', 'weightedChoice', 'getVariable', 'concat'],
            targetType: 'concat',
        },
        // WeightedChoice can receive context
        {
            sourceType: ['textBlock', 'getVariable'],
            targetType: 'weightedChoice',
            errorMessage: 'WeightedChoice can only receive text or variable inputs',
        },
        // Output accepts processed results
        {
            sourceType: ['textBlock', 'weightedChoice', 'concat', 'getVariable'],
            targetType: 'output',
        },
    ];
    /**
     * Validate a potential connection
     */
    validateConnection(connection, nodes, edges) {
        if (!connection.source || !connection.target) {
            return { isValid: false, error: 'Invalid connection' };
        }
        // Prevent self-connections
        if (connection.source === connection.target) {
            return { isValid: false, error: 'Cannot connect node to itself' };
        }
        const sourceNode = nodes.find(n => n.id === connection.source);
        const targetNode = nodes.find(n => n.id === connection.target);
        if (!sourceNode || !targetNode) {
            return { isValid: false, error: 'Node not found' };
        }
        // Check if connection would create a cycle
        if (this.wouldCreateCycle(connection, nodes, edges)) {
            return { isValid: false, error: 'Connection would create a cycle' };
        }
        // Check if target already has an incoming connection (except for concat nodes)
        const targetType = targetNode.type || 'default';
        if (targetType !== 'concat' && targetType !== 'enhancedBranching') {
            const hasIncomingConnection = edges.some(e => e.target === connection.target &&
                e.targetHandle === connection.targetHandle);
            if (hasIncomingConnection) {
                // Note: The connection will be replaced automatically in onConnect handler
                // We allow this for better UX
                return { isValid: true };
            }
        }
        // Check against rules
        const validationResult = this.checkRules(sourceNode, targetNode, edges);
        return validationResult;
    }
    /**
     * Check if a connection matches defined rules
     */
    checkRules(sourceNode, targetNode, edges) {
        const sourceType = sourceNode.type || 'default';
        const targetType = targetNode.type || 'default';
        // Find applicable rules
        for (const rule of this.rules) {
            const sourceTypes = Array.isArray(rule.sourceType) ? rule.sourceType : [rule.sourceType];
            const targetTypes = Array.isArray(rule.targetType) ? rule.targetType : [rule.targetType];
            // Check if rule applies to source
            if (sourceTypes.includes(sourceType)) {
                // If target types is empty array, no connections allowed
                if (targetTypes.length === 0) {
                    return {
                        isValid: false,
                        error: rule.errorMessage || `${sourceType} cannot have outgoing connections`
                    };
                }
                // Check if target type is allowed
                if (!targetTypes.includes(targetType)) {
                    continue; // This rule doesn't apply to this target
                }
                // Custom validation function
                if (rule.validate) {
                    const isValid = rule.validate(sourceNode, targetNode, edges);
                    if (!isValid) {
                        return {
                            isValid: false,
                            error: rule.errorMessage || `Invalid connection from ${sourceType} to ${targetType}`,
                        };
                    }
                }
                // Rule matches and is valid
                return { isValid: true };
            }
        }
        // No specific rule found - check general compatibility
        return this.checkGeneralCompatibility(sourceType, targetType);
    }
    /**
     * General compatibility check when no specific rules apply
     */
    checkGeneralCompatibility(sourceType, targetType) {
        // Output nodes cannot be sources
        if (sourceType === 'output') {
            return { isValid: false, error: 'Output nodes cannot have outgoing connections' };
        }
        // Default: allow connection
        return { isValid: true };
    }
    /**
     * Check if a connection would create a cycle in the graph
     */
    wouldCreateCycle(connection, nodes, edges) {
        // Create a temporary edge list with the new connection
        const tempEdges = [
            ...edges,
            {
                id: 'temp',
                source: connection.source,
                target: connection.target,
            },
        ];
        // Use DFS to detect cycles
        const visited = new Set();
        const recursionStack = new Set();
        const hasCycle = (nodeId) => {
            visited.add(nodeId);
            recursionStack.add(nodeId);
            // Get all outgoing edges from this node
            const outgoingEdges = tempEdges.filter(e => e.source === nodeId);
            for (const edge of outgoingEdges) {
                if (!visited.has(edge.target)) {
                    if (hasCycle(edge.target)) {
                        return true;
                    }
                }
                else if (recursionStack.has(edge.target)) {
                    return true;
                }
            }
            recursionStack.delete(nodeId);
            return false;
        };
        // Check from all unvisited nodes
        for (const node of nodes) {
            if (!visited.has(node.id) && hasCycle(node.id)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Get valid target node types for a given source node
     */
    getValidTargets(sourceNode) {
        const sourceType = sourceNode.type || 'default';
        const validTargets = new Set();
        for (const rule of this.rules) {
            const sourceTypes = Array.isArray(rule.sourceType) ? rule.sourceType : [rule.sourceType];
            if (sourceTypes.includes(sourceType)) {
                const targetTypes = Array.isArray(rule.targetType) ? rule.targetType : [rule.targetType];
                targetTypes.forEach(t => validTargets.add(t));
            }
        }
        // If no specific rules, allow common targets
        if (validTargets.size === 0 && sourceType !== 'output') {
            ['concat', 'output', 'setVariable'].forEach(t => validTargets.add(t));
        }
        return Array.from(validTargets);
    }
    /**
     * Check if a node can accept more connections
     */
    canAcceptConnection(node, edges, connectionType) {
        const nodeType = node.type || 'default';
        // Special cases
        if (nodeType === 'output' && connectionType === 'source') {
            return false; // Output nodes cannot be sources
        }
        // Check connection limits (if needed)
        // For now, most nodes can accept multiple connections
        return true;
    }
}
// Singleton instance
export const connectionValidator = new ConnectionValidator();

/**
 * Validation utilities for Epic 1 nodes
 * Provides comprehensive validation, error handling, and sanitization
 */
import { Epic1NodeType } from './nodeTypes';
/**
 * Validate a single node
 */
export async function validateNode(node, context = {}) {
    const errors = [];
    const warnings = [];
    const nodeType = node.getNodeType();
    const nodeId = node.serialize().id;
    try {
        // Check if node is in valid state
        const nodeData = node.getData();
        if (!nodeData.isValid) {
            errors.push({
                nodeId,
                nodeType,
                message: nodeData.validationMessage || 'Node is in invalid state',
                severity: 'error'
            });
        }
        // Check for unsaved changes
        if (node.isDirty()) {
            warnings.push({
                nodeId,
                nodeType,
                message: 'Node has unsaved changes',
                severity: 'warning'
            });
        }
        // Get validation errors from edit state
        const editErrors = node.getValidationErrors();
        editErrors.forEach(error => {
            errors.push({
                nodeId,
                nodeType,
                field: 'editBuffer',
                message: error,
                severity: 'error'
            });
        });
        // Type-specific validation
        switch (nodeType) {
            case Epic1NodeType.TextBlock:
                await validateTextBlock(node, errors, warnings);
                break;
            case Epic1NodeType.WeightedChoice:
                await validateWeightedChoice(node, errors, warnings);
                break;
            case Epic1NodeType.Concat:
                await validateConcat(node, errors, warnings, context);
                break;
            case Epic1NodeType.Variable:
                await validateVariable(node, errors, warnings, context);
                break;
            case Epic1NodeType.Output:
                await validateOutput(node, errors, warnings, context);
                break;
        }
    }
    catch (error) {
        errors.push({
            nodeId,
            nodeType,
            message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'error'
        });
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Validate TextBlock node
 */
async function validateTextBlock(node, errors, warnings) {
    const data = node.getData();
    const value = data.value;
    // Check for empty content
    if (value.trim().length === 0) {
        warnings.push({
            nodeId: node.serialize().id,
            nodeType: Epic1NodeType.TextBlock,
            field: 'value',
            message: 'Text block is empty',
            severity: 'warning'
        });
    }
    // Check for unmatched variable syntax
    const variablePattern = /\{\{(\w+)\}\}/g;
    const incompletePattern = /\{\{[^}]*$|\{[^{]|[^}]\}\}/;
    if (incompletePattern.test(value)) {
        errors.push({
            nodeId: node.serialize().id,
            nodeType: Epic1NodeType.TextBlock,
            field: 'value',
            message: 'Incomplete variable syntax detected',
            severity: 'error'
        });
    }
}
/**
 * Validate WeightedChoice node
 */
async function validateWeightedChoice(node, errors, warnings) {
    const data = node.getData();
    const options = data.value;
    // Check for empty options
    if (options.length === 0) {
        errors.push({
            nodeId: node.serialize().id,
            nodeType: Epic1NodeType.WeightedChoice,
            field: 'value',
            message: 'WeightedChoice must have at least one option',
            severity: 'error'
        });
        return;
    }
    // Check for all zero weights
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    if (totalWeight === 0) {
        errors.push({
            nodeId: node.serialize().id,
            nodeType: Epic1NodeType.WeightedChoice,
            field: 'value',
            message: 'At least one option must have a non-zero weight',
            severity: 'error'
        });
    }
    // Check for empty option text
    options.forEach((option, index) => {
        if (option.text.trim().length === 0) {
            warnings.push({
                nodeId: node.serialize().id,
                nodeType: Epic1NodeType.WeightedChoice,
                field: `value[${index}].text`,
                message: `Option ${index + 1} has empty text`,
                severity: 'warning'
            });
        }
    });
    // Check for duplicate option text
    const textCounts = new Map();
    options.forEach(option => {
        const text = option.text.trim();
        textCounts.set(text, (textCounts.get(text) || 0) + 1);
    });
    textCounts.forEach((count, text) => {
        if (count > 1) {
            warnings.push({
                nodeId: node.serialize().id,
                nodeType: Epic1NodeType.WeightedChoice,
                field: 'value',
                message: `Duplicate option text: "${text}"`,
                severity: 'warning'
            });
        }
    });
}
/**
 * Validate Concat node
 */
async function validateConcat(node, errors, warnings, context) {
    const nodeId = node.serialize().id;
    // Check for incoming connections
    if (context.edges) {
        const incomingEdges = context.edges.filter(edge => edge.target === nodeId);
        if (incomingEdges.length === 0) {
            warnings.push({
                nodeId,
                nodeType: Epic1NodeType.Concat,
                message: 'Concat node has no incoming connections',
                severity: 'warning'
            });
        }
        else if (incomingEdges.length === 1) {
            warnings.push({
                nodeId,
                nodeType: Epic1NodeType.Concat,
                message: 'Concat node has only one input (concatenation not needed)',
                severity: 'warning'
            });
        }
    }
}
/**
 * Validate Variable node
 */
async function validateVariable(node, errors, warnings, context) {
    const data = node.getData();
    const config = data.value;
    const nodeId = node.serialize().id;
    // Check for duplicate variable names
    if (context.nodes) {
        const duplicates = [];
        context.nodes.forEach((otherNode, otherId) => {
            if (otherId !== nodeId && otherNode.getNodeType() === Epic1NodeType.Variable) {
                const otherConfig = otherNode.getData().value;
                if (otherConfig.name === config.name) {
                    duplicates.push(otherId);
                }
            }
        });
        if (duplicates.length > 0) {
            warnings.push({
                nodeId,
                nodeType: Epic1NodeType.Variable,
                field: 'name',
                message: `Variable name "${config.name}" is used by multiple nodes`,
                severity: 'warning'
            });
        }
    }
    // Check for reserved variable names
    const reserved = ['__proto__', 'constructor', 'prototype', 'hasOwnProperty'];
    if (reserved.includes(config.name)) {
        errors.push({
            nodeId,
            nodeType: Epic1NodeType.Variable,
            field: 'name',
            message: `Variable name "${config.name}" is reserved`,
            severity: 'error'
        });
    }
}
/**
 * Validate Output node
 */
async function validateOutput(node, errors, warnings, context) {
    const nodeId = node.serialize().id;
    // Check for incoming connections
    if (context.edges) {
        const incomingEdges = context.edges.filter(edge => edge.target === nodeId);
        if (incomingEdges.length === 0) {
            errors.push({
                nodeId,
                nodeType: Epic1NodeType.Output,
                message: 'Output node has no incoming connections',
                severity: 'error'
            });
        }
        else if (incomingEdges.length > 1) {
            errors.push({
                nodeId,
                nodeType: Epic1NodeType.Output,
                message: 'Output node has multiple incoming connections',
                severity: 'error'
            });
        }
    }
    // Check if locked
    const data = node.getData();
    if (!data.isLocked) {
        warnings.push({
            nodeId,
            nodeType: Epic1NodeType.Output,
            message: 'Output node should be locked',
            severity: 'warning'
        });
    }
}
/**
 * Validate an entire graph
 */
export async function validateGraph(nodes, edges) {
    const allErrors = [];
    const allWarnings = [];
    const context = {
        nodes,
        edges,
        deep: true
    };
    // Validate each node
    for (const [nodeId, node] of nodes) {
        const result = await validateNode(node, context);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
    }
    // Graph-level validation
    // Check for orphaned nodes (no connections)
    const connectedNodes = new Set();
    edges.forEach(edge => {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
    });
    nodes.forEach((node, nodeId) => {
        if (!connectedNodes.has(nodeId) && node.getNodeType() !== Epic1NodeType.Output) {
            allWarnings.push({
                nodeId,
                nodeType: node.getNodeType(),
                message: 'Node is not connected to any other nodes',
                severity: 'warning'
            });
        }
    });
    // Check for cycles
    if (hasCycles(nodes, edges)) {
        allErrors.push({
            nodeId: 'graph',
            nodeType: 'graph',
            message: 'Graph contains cycles',
            severity: 'error'
        });
    }
    // Check for multiple output nodes
    const outputNodes = Array.from(nodes.values()).filter(node => node.getNodeType() === Epic1NodeType.Output);
    if (outputNodes.length === 0) {
        allWarnings.push({
            nodeId: 'graph',
            nodeType: 'graph',
            message: 'Graph has no output node',
            severity: 'warning'
        });
    }
    else if (outputNodes.length > 1) {
        allWarnings.push({
            nodeId: 'graph',
            nodeType: 'graph',
            message: 'Graph has multiple output nodes',
            severity: 'warning'
        });
    }
    return {
        valid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings
    };
}
/**
 * Check if graph has cycles using DFS
 */
function hasCycles(nodes, edges) {
    const adjacency = new Map();
    // Build adjacency list
    nodes.forEach((node, nodeId) => {
        adjacency.set(nodeId, []);
    });
    edges.forEach(edge => {
        const neighbors = adjacency.get(edge.source) || [];
        neighbors.push(edge.target);
        adjacency.set(edge.source, neighbors);
    });
    const visited = new Set();
    const recursionStack = new Set();
    function dfs(nodeId) {
        visited.add(nodeId);
        recursionStack.add(nodeId);
        const neighbors = adjacency.get(nodeId) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                if (dfs(neighbor)) {
                    return true;
                }
            }
            else if (recursionStack.has(neighbor)) {
                return true;
            }
        }
        recursionStack.delete(nodeId);
        return false;
    }
    // Check each component
    for (const [nodeId] of nodes) {
        if (!visited.has(nodeId)) {
            if (dfs(nodeId)) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Sanitize a value for safe storage/execution
 */
export function sanitizeValue(value) {
    if (value === null || value === undefined) {
        return value;
    }
    const type = typeof value;
    // Primitives are safe
    if (type === 'string' || type === 'number' || type === 'boolean') {
        return value;
    }
    // Arrays and objects need deep cloning
    if (Array.isArray(value) || type === 'object') {
        try {
            // Use JSON to strip functions and symbols
            return JSON.parse(JSON.stringify(value));
        }
        catch {
            throw new Error('Value contains non-serializable data');
        }
    }
    // Reject functions, symbols, etc
    throw new Error(`Unsafe value type: ${type}`);
}

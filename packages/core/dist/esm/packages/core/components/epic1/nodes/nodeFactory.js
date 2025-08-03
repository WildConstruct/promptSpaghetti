/**
 * Node Factory - Converts React Flow nodes to Epic 1 runtime nodes
 */
import { TextBlockNode } from '../../../runtime/nodes/epic1/TextBlockNode';
import { WeightedChoiceNode } from '../../../runtime/nodes/epic1/WeightedChoiceNode';
import { ConcatNode } from '../../../runtime/nodes/epic1/ConcatNode';
import { VariableNode } from '../../../runtime/nodes/epic1/VariableNode';
import { OutputNode } from '../../../runtime/nodes/epic1/OutputNode';
/**
 * Convert a React Flow node to an Epic 1 runtime node
 */
export function nodeDataToRuntimeNode(flowNode) {
    const { id, type, data } = flowNode;
    console.log('[nodeFactory] Converting node:', { id, type, data });
    try {
        switch (type) {
            case 'textBlock': {
                // TextBlockNode constructor takes (id, text)
                return new TextBlockNode(id, data.text || '');
            }
            case 'weightedChoice': {
                // Parse options from data
                let options = [];
                if (data.options) {
                    // Already parsed
                    options = data.options;
                }
                else if (data.value) {
                    // Try to parse from string
                    try {
                        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                        if (Array.isArray(parsed)) {
                            options = parsed;
                        }
                    }
                    catch (e) {
                        console.warn('Failed to parse weighted choice options:', e);
                        options = [{ text: data.value || '', weight: 1 }];
                    }
                }
                // WeightedChoiceNode constructor takes (id, options)
                return new WeightedChoiceNode(id, options);
            }
            case 'concat': {
                // ConcatNode constructor takes (id, config)
                return new ConcatNode(id, {
                    separator: data.separator || ' ',
                    trimInputs: data.trimInputs !== false
                });
            }
            case 'variable': {
                // Determine mode from data
                let mode = 'both';
                if (data.mode) {
                    mode = data.mode;
                }
                // VariableNode constructor takes (id, name, defaultValue, config)
                return new VariableNode(id, data.variableName || data.name || 'myVar', data.defaultValue || '', { mode });
            }
            case 'output': {
                // OutputNode constructor takes (id, initialValue, config)
                const node = new OutputNode(id, data.label || data.value || 'Output');
                console.log('[nodeFactory] Created output node:', id, 'with label:', data.label || data.value || 'Output');
                return node;
            }
            default:
                console.warn(`Unknown node type: ${type}`);
                return null;
        }
    }
    catch (error) {
        console.error(`Error converting node ${id} of type ${type}:`, error);
        return null;
    }
}
/**
 * Validate that all required nodes are present for execution
 */
export function validateNodesForExecution(nodes) {
    const errors = [];
    // Check for at least one output node
    const hasOutput = nodes.some(node => node.getNodeType() === 'output');
    if (!hasOutput) {
        errors.push('Graph must have at least one Output node');
    }
    // Check for disconnected nodes (this would be better done with edge info)
    if (nodes.length === 0) {
        errors.push('Graph has no nodes');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}

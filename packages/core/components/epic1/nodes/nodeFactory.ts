/**
 * Node Factory - Converts React Flow nodes to Epic 1 runtime nodes
 */

import { Node } from 'reactflow';
import { EditableNodeData } from './index';
import { BaseInlineEditableNode } from '../../../runtime/nodes/epic1/BaseInlineEditableNode';
import { TextBlockNode } from '../../../runtime/nodes/epic1/TextBlockNode';
import { WeightedChoiceNode, WeightedOption } from '../../../runtime/nodes/epic1/WeightedChoiceNode';
import { ConcatNode } from '../../../runtime/nodes/epic1/ConcatNode';
import { VariableNode, VariableMode } from '../../../runtime/nodes/epic1/VariableNode';
import { OutputNode } from '../../../runtime/nodes/epic1/OutputNode';
import { debugLogEpic1 } from '../../../utils/debug';

/**
 * Convert a React Flow node to an Epic 1 runtime node
 */
export function nodeDataToRuntimeNode(flowNode: Node<EditableNodeData>): BaseInlineEditableNode | null {
  const { id, type, data } = flowNode;
  
  debugLogEpic1('[nodeFactory] Converting node:', { id, type, data });

  try {
    switch (type) {
      case 'textBlock': {
        // TextBlockNode constructor takes (id, text)
        return new TextBlockNode(id, data.text || '');
      }

      case 'weightedChoice': {
        // Parse options from data
        let options: WeightedOption[] = [];
        
        if (data.options) {
          // Already parsed
          options = data.options;
        } else if (data.value) {
          // Try to parse from string
          try {
            const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            if (Array.isArray(parsed)) {
              options = parsed;
            }
          } catch (e) {
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
        let mode: VariableMode = 'both';
        if (data.mode) {
          mode = data.mode as VariableMode;
        }

        // VariableNode constructor takes (id, name, defaultValue, config)
        return new VariableNode(
          id,
          data.variableName || data.name || 'myVar',
          data.defaultValue || '',
          { mode }
        );
      }

      case 'output': {
        // OutputNode constructor takes (id, initialValue, config)
        const node = new OutputNode(id, data.label || data.value || 'Output');
        debugLogEpic1('[nodeFactory] Created output node:', id, 'with label:', data.label || data.value || 'Output');
        return node;
      }

      default:
        console.warn(`Unknown node type: ${type}`);
        return null;
    }
  } catch (error) {
    console.error(`Error converting node ${id} of type ${type}:`, error);
    return null;
  }
}

/**
 * Validate that all required nodes are present for execution
 */
export function validateNodesForExecution(nodes: BaseInlineEditableNode[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
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
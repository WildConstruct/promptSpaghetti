/**
 * Node Factory - Converts React Flow nodes to Epic 1 runtime nodes
 */

import { Node } from 'reactflow';
import { EditableNodeData } from './index';
import { BaseInlineEditableNode } from '../../../runtime/nodes/epic1/BaseInlineEditableNode';
import { TextBlockNode } from '../../../runtime/nodes/epic1/TextBlockNode';
import {
  WeightedChoiceNode,
  WeightedOption
} from '../../../runtime/nodes/epic1/WeightedChoiceNode';
import { ConcatNode } from '../../../runtime/nodes/epic1/ConcatNode';
import {
  VariableNode,
  VariableMode
} from '../../../runtime/nodes/epic1/VariableNode';
import { OutputNode } from '../../../runtime/nodes/epic1/OutputNode';
import { debugLogEpic1 } from '../../../utils/debug';

/**
 * Convert a React Flow node to an Epic 1 runtime node
 */
export function nodeDataToRuntimeNode(
  flowNode: Node<EditableNodeData>
): BaseInlineEditableNode | null {
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
          // Check if options is already an array
          if (Array.isArray(data.options)) {
            // Already parsed - ensure all options have ids
            options = data.options.map((opt: any, idx: number) => ({
              id: opt.id || `option-${idx + 1}`,
              text: opt.text || '',
              weight: opt.weight || 1
            }));
          } else if (typeof data.options === 'string') {
            // Try to parse string
            try {
              const parsed = JSON.parse(data.options);
              if (Array.isArray(parsed)) {
                options = parsed.map((opt: any, idx: number) => ({
                  id: opt.id || `option-${idx + 1}`,
                  text: opt.text || '',
                  weight: opt.weight || 1
                }));
              }
            } catch (e) {
              console.warn('Failed to parse options string:', e);
              options = [
                { id: 'option-1', text: 'Option 1', weight: 1 },
                { id: 'option-2', text: 'Option 2', weight: 1 }
              ];
            }
          } else if (typeof data.options === 'object' && data.options.options) {
            // Handle case where data.options is an object with an options property
            const innerOptions = data.options.options;
            if (Array.isArray(innerOptions)) {
              options = innerOptions.map((opt: any, idx: number) => ({
                id: opt.id || `option-${idx + 1}`,
                text: opt.text || '',
                weight: opt.weight || 1,
                hasBranch: opt.hasBranch !== undefined ? opt.hasBranch : false
              }));
            }
          } else {
            console.warn(
              'Unknown options format:',
              typeof data.options,
              data.options
            );
            options = [
              { id: 'option-1', text: 'Option 1', weight: 50 },
              { id: 'option-2', text: 'Option 2', weight: 50 }
            ];
          }
        } else if (data.value) {
          // Try to parse from value field
          try {
            const parsed =
              typeof data.value === 'string'
                ? JSON.parse(data.value)
                : data.value;
            if (Array.isArray(parsed)) {
              options = parsed.map((opt: any, idx: number) => ({
                id: opt.id || `option-${idx + 1}`,
                text: opt.text || '',
                weight: opt.weight || 1
              }));
            } else if (
              parsed &&
              parsed.options &&
              Array.isArray(parsed.options)
            ) {
              options = parsed.options.map((opt: any, idx: number) => ({
                id: opt.id || `option-${idx + 1}`,
                text: opt.text || '',
                weight: opt.weight || 1
              }));
            }
          } catch (e) {
            console.warn('Failed to parse weighted choice value:', e);
            options = [
              { id: 'option-1', text: data.value || 'Option 1', weight: 1 }
            ];
          }
        } else {
          // Default options
          options = [
            { id: 'option-1', text: 'Option 1', weight: 1 },
            { id: 'option-2', text: 'Option 2', weight: 1 }
          ];
        }

        debugLogEpic1(
          '[nodeFactory] Parsed options for WeightedChoice:',
          options
        );
        // WeightedChoiceNode constructor takes (id, options)
        return new WeightedChoiceNode(id, options);
      }

      case 'concat': {
        // ConcatNode constructor takes (id, config)
        // Get separator from value field if it exists (for templates)
        const separator = data.value || data.separator || ' ';
        return new ConcatNode(id, {
          separator: separator,
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
        debugLogEpic1(
          '[nodeFactory] Created output node:',
          id,
          'with label:',
          data.label || data.value || 'Output'
        );
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

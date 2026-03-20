/**
 * Node Factory - Converts React Flow nodes to Epic 1 runtime nodes
 */

import { Node } from 'reactflow';
import type { EditableNodeData } from './BaseEditableNode';
import { BaseInlineEditableNode } from '../../../runtime/nodes/epic1/BaseInlineEditableNode';
import { TextBlockNode } from '../../../runtime/nodes/epic1/TextBlockNode';
import {
  WeightedChoiceNode,
  WeightedOption
} from '../../../runtime/nodes/epic1/WeightedChoiceNode';
import { ConcatNode } from '../../../runtime/nodes/epic1/ConcatNode';
import {
  VariableNode,
  VariableMode,
  VariableConfig,
  VariableNodeConfig
} from '../../../runtime/nodes/epic1/VariableNode';
import { OutputNode } from '../../../runtime/nodes/epic1/OutputNode';
import { debugLogEpic1 } from '../../../utils/debug';

/**
 * Convert a React Flow node to an Epic 1 runtime node
 */
const toWeightedOption = (
  input: Record<string, unknown>,
  index: number
): WeightedOption => {
  const id =
    typeof input.id === 'string' && input.id.trim().length > 0
      ? input.id
      : `option-${index + 1}`;
  const text =
    typeof input.text === 'string'
      ? input.text
      : String(input.text ?? `Option ${index + 1}`);
  const weightCandidate =
    typeof input.weight === 'number'
      ? input.weight
      : Number.parseFloat(String(input.weight ?? '0'));
  const weight = Number.isFinite(weightCandidate) ? weightCandidate : 1;
  const color =
    typeof input.color === 'string' && input.color.trim().length > 0
      ? input.color
      : undefined;
  return { id, text, weight, color };
};

const collectWeightedOptions = (source: unknown): WeightedOption[] => {
  if (!source) {
    return [];
  }
  if (Array.isArray(source)) {
    return source.map((opt, idx) =>
      toWeightedOption((opt ?? {}) as Record<string, unknown>, idx)
    );
  }
  if (typeof source === 'string') {
    try {
      const parsed = JSON.parse(source);
      return collectWeightedOptions(parsed);
    } catch {
      return [];
    }
  }
  if (typeof source === 'object') {
    const record = source as Record<string, unknown>;
    if (Array.isArray(record.options)) {
      return record.options.map((opt, idx) =>
        toWeightedOption((opt ?? {}) as Record<string, unknown>, idx)
      );
    }
  }
  return [];
};

export function nodeDataToRuntimeNode(
  flowNode: Node<EditableNodeData>
): BaseInlineEditableNode | null {
  const { id, type, data } = flowNode;

  debugLogEpic1('[nodeFactory] Converting node:', { id, type, data });

  try {
    switch (type) {
      case 'textBlock': {
        const text =
          typeof data.text === 'string' && data.text.length > 0
            ? data.text
            : typeof data.value === 'string'
              ? data.value
              : '';
        return new TextBlockNode(id, text);
      }

      case 'weightedChoice': {
        const optionSources: unknown[] = [];
        if (data.options !== undefined) {
          optionSources.push(data.options);
        }
        if (data.value !== undefined) {
          optionSources.push(data.value);
        }

        let options: WeightedOption[] = [];
        for (const source of optionSources) {
          options = collectWeightedOptions(source);
          if (options.length > 0) {
            break;
          }
        }

        if (options.length === 0 && optionSources.length > 0) {
          console.warn(
            '[nodeFactory] Unable to parse weighted choice options from sources',
            optionSources
          );
        }

        if (options.length === 0) {
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
        const separatorCandidate = (data as { separator?: unknown }).separator;
        const separator =
          typeof data.value === 'string'
            ? data.value
            : typeof separatorCandidate === 'string'
              ? separatorCandidate
              : ' ';
        return new ConcatNode(id, {
          separator: separator,
          trimInputs: data.trimInputs !== false,
          requireAllInputs: data.requireAllInputs === true
        });
      }

      case 'variable': {
        // Determine mode from data
        let mode: VariableMode = 'both';
        if (data.mode) {
          mode = data.mode as VariableMode;
        }

        // VariableNode constructor takes (id, name, defaultValue, config)
        const variableConfig: VariableConfig = {
          name:
            typeof data.variableName === 'string' &&
            data.variableName.trim().length > 0
              ? data.variableName
              : typeof data.name === 'string' && data.name.trim().length > 0
                ? data.name
                : 'myVar',
          defaultValue:
            typeof data.defaultValue === 'string'
              ? data.defaultValue
              : data.defaultValue !== null && data.defaultValue !== undefined
                ? String(data.defaultValue)
                : '',
          currentValue:
            typeof data.value === 'string'
              ? data.value
              : data.value !== null && data.value !== undefined
                ? String(data.value)
                : typeof data.defaultValue === 'string'
                  ? data.defaultValue
                  : ''
        };

        const nodeConfig: VariableNodeConfig = { mode };

        return new VariableNode(id, variableConfig, nodeConfig);
      }

      case 'output': {
        // OutputNode constructor takes (id, initialValue, config)
        const label =
          typeof data.label === 'string' && data.label.trim().length > 0
            ? data.label
            : typeof data.value === 'string' && data.value.trim().length > 0
              ? data.value
              : 'Output';
        const node = new OutputNode(id, label);
        debugLogEpic1(
          '[nodeFactory] Created output node:',
          id,
          'with label:',
          label
        );
        return node;
      }

      // UI-only nodes that don't need runtime conversion
      case 'boundingBox':
      case 'enhancedBoundingBox':
      case 'postItNote':
      case 'group':
      case 'promptWizard':
        // These are UI-only nodes, no runtime conversion needed
        debugLogEpic1(`[nodeFactory] Skipping UI-only node type: ${type}`);
        return null;

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

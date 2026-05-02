/**
 * Utility functions for applying presets to nodes
 */

import { EditableNodeData } from '../nodes';
import {
  Preset,
  isTextBlockPreset,
  isWeightedChoicePreset,
  isConcatPreset,
  isVariablePreset,
  isOutputPreset,
  WeightedChoicePresetValue,
  TextBlockPresetValue,
  ConcatPresetValue,
  VariablePresetValue,
  OutputPresetValue
} from './types';

/**
 * Apply a preset's values to a node's data
 */
export function applyPresetToNode(
  nodeData: EditableNodeData,
  preset: Preset,
  nodeType: string
): EditableNodeData {
  const updatedData = { ...nodeData };
  const targetType = preset.nodeType || nodeType;

  switch (targetType) {
    case 'textBlock':
      if (isTextBlockPreset(preset)) {
        const text = preset.value.text;
        if (text !== undefined) {
          updatedData.value = text;
          updatedData.text = text;
          updatedData.editBuffer = text;
        }
      }
      break;

    case 'weightedChoice':
      if (isWeightedChoicePreset(preset)) {
        const options = preset.value.options;
        if (Array.isArray(options)) {
          const normalizedOptions = options.map((option, index) => ({
            id: `option-${index + 1}`,
            text: option.text,
            weight: option.weight,
            hasBranch: false
          }));
          updatedData.value = JSON.stringify(options);
          updatedData.options = normalizedOptions;
          updatedData.editBuffer = JSON.stringify(normalizedOptions, null, 2);
        }
      }
      break;

    case 'concat':
      if (isConcatPreset(preset)) {
        const separator = preset.value.separator;
        if (separator !== undefined) {
          updatedData.value = separator;
          updatedData.separator = separator;
          updatedData.editBuffer = separator;
        }
      }
      break;

    case 'variable':
    case 'setVariable':
    case 'getVariable':
      if (isVariablePreset(preset)) {
        const { variableName, operation, value } = preset.value;
        if (variableName) {
          updatedData.value = variableName;
          updatedData.variableName = variableName;
          updatedData.editBuffer = variableName;
        }

        if (operation) {
          updatedData.operation = operation;
        }

        if (value !== undefined && operation === 'set') {
          updatedData.variableValue = value;
        }
      }
      break;

    case 'output':
      if (isOutputPreset(preset)) {
        const label = preset.value.label;
        if (label) {
          updatedData.value = label;
          updatedData.label = label;
          updatedData.editBuffer = label;
        }
      }
      break;
  }

  // Mark as modified from preset
  updatedData.isModifiedFromPreset = true;
  updatedData.originalPresetId = preset.id;
  updatedData.lastModified = new Date();

  return updatedData;
}

/**
 * Check if a node has been modified from its original preset
 */
export function isNodeModifiedFromPreset(nodeData: EditableNodeData): boolean {
  return nodeData.isModifiedFromPreset === true;
}

/**
 * Get the current value from node data based on node type
 */
export function getNodeValue(
  nodeData: EditableNodeData,
  nodeType: string
): unknown {
  switch (nodeType) {
    case 'textBlock':
      return nodeData.text || nodeData.value;

    case 'weightedChoice':
      return (
        nodeData.options || (nodeData.value ? JSON.parse(nodeData.value) : [])
      );

    case 'concat':
      return nodeData.separator || nodeData.value;

    case 'variable':
    case 'setVariable':
    case 'getVariable':
      return nodeData.variableName || nodeData.value;

    case 'output':
      return nodeData.label || nodeData.value;

    default:
      return nodeData.value;
  }
}

/**
 * Create a preset from current node data
 */
export function createPresetFromNode(
  nodeData: EditableNodeData,
  nodeType: string,
  name: string,
  category: string,
  tags: string[] = []
): Preset {
  const value = getNodeValue(nodeData, nodeType);

  let presetValue: unknown;
  switch (nodeType) {
    case 'textBlock':
      presetValue = {
        text: String(value ?? '')
      } satisfies TextBlockPresetValue;
      break;

    case 'weightedChoice':
      presetValue = {
        options: Array.isArray(value)
          ? (value as WeightedChoicePresetValue['options'])
          : []
      } satisfies WeightedChoicePresetValue;
      break;

    case 'concat':
      presetValue = {
        separator: String(value ?? '')
      } satisfies ConcatPresetValue;
      break;

    case 'variable':
    case 'setVariable':
    case 'getVariable':
      presetValue = {
        variableName: String(value ?? ''),
        operation:
          nodeData.operation || (nodeType === 'setVariable' ? 'set' : 'get')
      } as VariablePresetValue;
      if (typeof nodeData.variableValue === 'string') {
        (presetValue as VariablePresetValue).value = nodeData.variableValue;
      }
      break;

    case 'output':
      presetValue = { label: String(value ?? '') } satisfies OutputPresetValue;
      break;

    default:
      presetValue = value;
  }

  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    category,
    tags,
    nodeType,
    value: presetValue,
    metadata: {
      created: new Date(),
      usage: 0,
      author: 'user'
    }
  };
}

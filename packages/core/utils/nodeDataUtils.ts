import {
  NodeData,
  NodeType,
  VariationConfig,
  createNodeData,
  WeightedChoiceNodeData,
  SetVariableNodeData,
  GetVariableNodeData,
  IncludeNodeData,
} from '../types/NodeTypes';

// Legacy function - delegates to new factory system
export const createDefaultNodeData = (type: NodeType): NodeData => {
  const id = `${type}-${Date.now()}`;
  return createNodeData(type, id);
};

// Variation management utilities
export const addVariationToNode = (nodeData: NodeData, variation: string): NodeData => {
  const currentVariations = nodeData.variations || [];
  return {
    ...nodeData,
    variations: [...currentVariations, variation],
  };
};

export const removeVariationFromNode = (nodeData: NodeData, index: number): NodeData => {
  const currentVariations = nodeData.variations || [];
  return {
    ...nodeData,
    variations: currentVariations.filter((_, i) => i !== index),
  };
};

export const updateVariationInNode = (nodeData: NodeData, index: number, newValue: string): NodeData => {
  const currentVariations = nodeData.variations || [];
  const updatedVariations = [...currentVariations];
  updatedVariations[index] = newValue;
  return {
    ...nodeData,
    variations: updatedVariations,
  };
};

export const reorderVariationsInNode = (nodeData: NodeData, fromIndex: number, toIndex: number): NodeData => {
  const currentVariations = nodeData.variations || [];
  const updatedVariations = [...currentVariations];
  const [movedItem] = updatedVariations.splice(fromIndex, 1);
  updatedVariations.splice(toIndex, 0, movedItem);
  return {
    ...nodeData,
    variations: updatedVariations,
  };
};

export const getRandomVariation = (nodeData: NodeData, seed?: number): string => {
  const variations = nodeData.variations || [];
  if (variations.length === 0) return nodeData.label;
  // Use seed for deterministic randomness if provided
  const randomIndex =
    seed !== undefined
      ? Math.floor((Math.abs(seed) + 1) % variations.length)
      : Math.floor(Math.random() * variations.length);
  return variations[randomIndex];
};

export const hasVariations = (nodeData: NodeData): boolean => {
  return Boolean(nodeData.variations && nodeData.variations.length > 0);
};

export const getVariationCount = (nodeData: NodeData): number => {
  return nodeData.variations?.length || 0;
};

// Legacy validation function - uses new validation system
export const validateNodeDataLegacyWrapper = (nodeData: NodeData): { valid: boolean; errors: string } => {
  // Import the new validation function to avoid conflicts
  const { validateNodeData: newValidate } = require('../types/NodeTypes');
  const errors = newValidate(nodeData);
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Legacy validation with old interface for backward compatibility
export const validateNodeDataLegacy = (nodeData: NodeData): { valid: boolean; errors: string } => {
  const errors: string[] = [];
  if (!nodeData.label || nodeData.label.trim() === '') {
    errors.push('Node label is required');
  }
  if (!nodeData.id || nodeData.id.trim() === '') {
    errors.push('Node ID is required');
  }
  // Type-specific validation with new field names
  switch (nodeData.type) {
    case 'WeightedChoice': {
      const wcData = nodeData as WeightedChoiceNodeData;
      if (wcData.choices && wcData.weights && wcData.choices.length !== wcData.weights.length) {
        errors.push('Number of choices must match number of weights');
      }
      if (wcData.weights && wcData.weights.some(w => w <= 0)) {
        errors.push('All weights must be positive numbers');
      }
      break;
    }
    case 'SetVariable': {
      const setVarData = nodeData as SetVariableNodeData;
      if (!setVarData.variableName || setVarData.variableName.trim() === '') {
        errors.push('Variable name is required');
      }
      break;
    }
    case 'GetVariable': {
      const getVarData = nodeData as GetVariableNodeData;
      if (!getVarData.variableName || getVarData.variableName.trim() === '') {
        errors.push('Variable name is required');
      }
      break;
    }
    case 'Include': {
      const includeData = nodeData as IncludeNodeData;
      if (!includeData.name || includeData.name.trim() === '') {
        errors.push('Include name is required');
      }
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const cloneNodeData = (nodeData: NodeData): NodeData => {
  return JSON.parse(JSON.stringify(nodeData));
};

export const mergeNodeData = <T extends NodeData>(original: T, updates: Partial<T>): T => {
  return {
    ...original,
    ...updates,
  } as T;
};

// Migration utilities for upgrading old node data
export const migrateNodeData = (oldNodeData: any): NodeData | null => {
  try {
    // If it's already in the new format, return as-is
    if (oldNodeData.id && oldNodeData.type && oldNodeData.label) {
      return oldNodeData as NodeData;
    }
    // Create new node data from scratch if migration is needed
    const type = oldNodeData.type as NodeType;
    const id = oldNodeData.id || `${type}-${Date.now()}`;
    const label = oldNodeData.label || type;
    const newData = createNodeData(type, id, label);
    // Migrate variations if they exist
    if (oldNodeData.variations) {
      newData.variations = oldNodeData.variations;
    }
    return newData;
  } catch (error) {
    console.warn('Failed to migrate node data:', error);
    return null;
  }
};

import { createNodeData } from '../types/NodeTypes';
// Legacy function - delegates to new factory system
export const createDefaultNodeData = type => {
  const id = `${type}-${Date.now()}`;
  return createNodeData(type, id);
};
// Variation management utilities
export const addVariationToNode = (nodeData, variation) => {
  const currentVariations = nodeData.variations || [];
  return {
    ...nodeData,
    variations: [...currentVariations, variation],
  };
};
export const removeVariationFromNode = (nodeData, index) => {
  const currentVariations = nodeData.variations || [];
  return {
    ...nodeData,
    variations: currentVariations.filter((_, i) => i !== index),
  };
};
export const updateVariationInNode = (nodeData, index, newValue) => {
  const currentVariations = nodeData.variations || [];
  const updatedVariations = [...currentVariations];
  updatedVariations[index] = newValue;
  return {
    ...nodeData,
    variations: updatedVariations,
  };
};
export const reorderVariationsInNode = (nodeData, fromIndex, toIndex) => {
  const currentVariations = nodeData.variations || [];
  const updatedVariations = [...currentVariations];
  const [movedItem] = updatedVariations.splice(fromIndex, 1);
  updatedVariations.splice(toIndex, 0, movedItem);
  return {
    ...nodeData,
    variations: updatedVariations,
  };
};
export const getRandomVariation = (nodeData, seed) => {
  const variations = nodeData.variations || [];
  if (variations.length === 0) return nodeData.label;
  // Use seed for deterministic randomness if provided
  const randomIndex =
    seed !== undefined
      ? Math.floor((Math.abs(seed) + 1) % variations.length)
      : Math.floor(Math.random() * variations.length);
  return variations[randomIndex];
};
export const hasVariations = nodeData => {
  return Boolean(nodeData.variations && nodeData.variations.length > 0);
};
export const getVariationCount = nodeData => {
  return nodeData.variations?.length || 0;
};
// Legacy validation function - uses new validation system
export const validateNodeDataLegacyWrapper = nodeData => {
  // Import the new validation function to avoid conflicts
  const { validateNodeData: newValidate } = require('../types/NodeTypes');
  const errors = newValidate(nodeData);
  return {
    valid: errors.length === 0,
    errors,
  };
};
// Legacy validation with old interface for backward compatibility
export const validateNodeDataLegacy = nodeData => {
  const errors = [];
  if (!nodeData.label || nodeData.label.trim() === '') {
    errors.push('Node label is required');
  }
  if (!nodeData.id || nodeData.id.trim() === '') {
    errors.push('Node ID is required');
  }
  // Type-specific validation with new field names
  switch (nodeData.type) {
    case 'WeightedChoice': {
      const wcData = nodeData;
      if (wcData.choices && wcData.weights && wcData.choices.length !== wcData.weights.length) {
        errors.push('Number of choices must match number of weights');
      }
      if (wcData.weights && wcData.weights.some(w => w <= 0)) {
        errors.push('All weights must be positive numbers');
      }
      break;
    }
    case 'SetVariable': {
      const setVarData = nodeData;
      if (!setVarData.variableName || setVarData.variableName.trim() === '') {
        errors.push('Variable name is required');
      }
      break;
    }
    case 'GetVariable': {
      const getVarData = nodeData;
      if (!getVarData.variableName || getVarData.variableName.trim() === '') {
        errors.push('Variable name is required');
      }
      break;
    }
    case 'Include': {
      const includeData = nodeData;
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
export const cloneNodeData = nodeData => {
  return JSON.parse(JSON.stringify(nodeData));
};
export const mergeNodeData = (original, updates) => {
  return {
    ...original,
    ...updates,
  };
};
// Migration utilities for upgrading old node data
export const migrateNodeData = oldNodeData => {
  try {
    // If it's already in the new format, return as-is
    if (oldNodeData.id && oldNodeData.type && oldNodeData.label) {
      return oldNodeData;
    }
    // Create new node data from scratch if migration is needed
    const type = oldNodeData.type;
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

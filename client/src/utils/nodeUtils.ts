/**
 * Node manipulation utilities
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 */

import { NodeTemplate, OptionConfig, NodeOption } from '../data/nodeTemplates/types';

type Position = { x: number; y: number };

type NodeStatistics = {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  totalOptions: number;
  averageOptions: number;
};

// Position utilities
export const calculateNodePosition = (
  index: number,
  gridWidth: number = 3,
  spacing: Position = { x: 300, y: 200 }
): Position => {
  const row = Math.floor(index / gridWidth);
  const col = index % gridWidth;
  return {
    x: col * spacing.x + 50,
    y: row * spacing.y + 50
  };
};

export const snapToGrid = (
  position: Position,
  gridSize: number = 20
): Position => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
};

// Option utilities
const toOptionArray = (options: OptionConfig): NodeOption[] => [...options];

export const getRandomOption = (options: OptionConfig): NodeOption => {
  if (options.length === 0) {
    throw new Error('Options array cannot be empty');
  }

  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
  if (totalWeight <= 0) {
    return options[0];
  }

  let random = Math.random() * totalWeight;
  for (const option of options) {
    random -= option.weight;
    if (random <= 0) {
      return option;
    }
  }

  return options[options.length - 1];
};

export const getWeightedRandomOptions = (
  options: OptionConfig,
  count: number = 1
): OptionConfig => {
  const selected: NodeOption[] = [];
  const remaining = toOptionArray(options);

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const option = getRandomOption(remaining as OptionConfig);
    selected.push(option);
    const index = remaining.findIndex(opt => opt.value === option.value);
    if (index > -1) {
      remaining.splice(index, 1);
    }
  }

  return selected;
};

export const sortOptionsByWeight = (options: OptionConfig): OptionConfig => {
  return [...options].sort((a, b) => b.weight - a.weight);
};

// Node validation utilities
export const validateNodeData = (node: NodeTemplate): string[] => {
  const errors: string[] = [];

  if (!node.id || typeof node.id !== 'string') {
    errors.push('Node must have a valid string ID');
  }

  if (!['logic', 'transform', 'output'].includes(node.type)) {
    errors.push('Node type must be logic, transform, or output');
  }

  if (
    !node.position ||
    typeof node.position.x !== 'number' ||
    typeof node.position.y !== 'number'
  ) {
    errors.push('Node must have valid position coordinates');
  }

  if (!node.data || !node.data.label || !node.data.description) {
    errors.push('Node data must include label and description');
  }

  if (!Array.isArray(node.data.options)) {
    errors.push('Node data must include options array');
  } else {
    node.data.options.forEach((option, index) => {
      if (!option.label || !option.value) {
        errors.push(`Option ${index} must have label and value`);
      }
      if (typeof option.weight !== 'number' || option.weight < 0) {
        errors.push(`Option ${index} must have a valid positive weight`);
      }
    });
  }

  return errors;
};

export const isValidNode = (node: NodeTemplate): boolean => {
  return validateNodeData(node).length === 0;
};

// Node transformation utilities
export const duplicateNode = (
  node: NodeTemplate,
  offset: Position = { x: 50, y: 50 }
): NodeTemplate => {
  return {
    ...node,
    id: `${node.id}-copy-${Date.now()}`,
    position: {
      x: node.position.x + offset.x,
      y: node.position.y + offset.y
    },
    data: {
      ...node.data,
      options: toOptionArray(node.data.options)
    }
  };
};

export const moveNode = (
  node: NodeTemplate,
  newPosition: Position
): NodeTemplate => {
  return {
    ...node,
    position: { ...newPosition }
  };
};

export const updateNodeOptions = (
  node: NodeTemplate,
  newOptions: OptionConfig
): NodeTemplate => {
  return {
    ...node,
    data: {
      ...node.data,
      options: toOptionArray(newOptions)
    }
  };
};

// Search and filter utilities
export const searchNodes = (
  nodes: NodeTemplate[],
  query: string
): NodeTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return nodes.filter(node => {
    const { label, description, category, options } = node.data;
    return (
      label.toLowerCase().includes(lowercaseQuery) ||
      description.toLowerCase().includes(lowercaseQuery) ||
      category.toLowerCase().includes(lowercaseQuery) ||
      options.some(option =>
        option.label.toLowerCase().includes(lowercaseQuery) ||
        option.value.toLowerCase().includes(lowercaseQuery)
      )
    );
  });
};

export const filterNodesByType = (
  nodes: NodeTemplate[],
  type: 'logic' | 'transform' | 'output'
): NodeTemplate[] => {
  return nodes.filter(node => node.type === type);
};

export const filterNodesByCategory = (
  nodes: NodeTemplate[],
  category: string
): NodeTemplate[] => {
  return nodes.filter(node => node.data.category === category);
};

// Statistics utilities
export const getNodeStatistics = (nodes: NodeTemplate[]): NodeStatistics => {
  const stats: NodeStatistics = {
    total: nodes.length,
    byType: {},
    byCategory: {},
    totalOptions: 0,
    averageOptions: 0
  };

  nodes.forEach(node => {
    stats.byType[node.type] = (stats.byType[node.type] || 0) + 1;
    stats.byCategory[node.data.category] =
      (stats.byCategory[node.data.category] || 0) + 1;
    stats.totalOptions += node.data.options.length;
  });

  stats.averageOptions =
    stats.total > 0 ? stats.totalOptions / stats.total : 0;

  return stats;
};

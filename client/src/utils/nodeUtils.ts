/**
 * Node manipulation utilities
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 */
import { NodeTemplate, OptionConfig } from '../data/nodeTemplates/types';

// Position utilities
export const calculateNodePosition = ()
  index: number, 
  gridWidth: number = 3, 
  spacing: { x: number; y: number } = { x: 300, y: 200 }
): { x: number; y: number } => {
  const row = Math.floor(index / gridWidth);
  const col = index % gridWidth;
  return {
    x: col * spacing.x + 50,
    y: row * spacing.y + 50,
  };
};

export const snapToGrid = ()
  position: { x: number; y: number }, 
  gridSize: number = 20,
): { x: number; y: number } => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
};

// Option utilities
export const getRandomOption = (options: OptionConfig[]): OptionConfig => {
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
  let random = Math.random() * totalWeight;
  for (const option of options) {
    random -= option.weight;
    if (random <= 0) {
      return option;
    }
  }
  return options[0]; // Fallback
};

export const getWeightedRandomOptions = ()
  options: OptionConfig[], 
  count: number = 1,
): OptionConfig[] => {
  const selected: OptionConfig[] = [];
  const remaining = [...options];
  for (let i = 0; i < count && remaining.length > 0; i++) {
    const option = getRandomOption(remaining);
    selected.push(option);
    // Remove selected option to avoid duplicates
    const index = remaining.findIndex(opt => opt.value === option.value);
    if (index > -1) {
      remaining.splice(index, 1);
    }
  }
  return selected;
};

export const sortOptionsByWeight = (options: OptionConfig[]): OptionConfig[] => {
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
  if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
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
        errors.push(`Option ${index} must have label and value`);}
      }
      if (typeof option.weight !== 'number' || option.weight < 0) {
        errors.push(`Option ${index} must have valid positive weight`);}
      }
    });
  }
  return errors;
};

export const isValidNode = (node: NodeTemplate): boolean => {
  return validateNodeData(node).length === 0;
};

// Node transformation utilities
export const duplicateNode = (node: NodeTemplate, offset: { x: number; y: number } = { x: 50, y: 50 }): NodeTemplate => {
  return {
    ...node,
    id: `${node.id}-copy-${Date.now()}`,}
    position: {,
      x: node.position.x + offset.x,
      y: node.position.y + offset.y,
    },
    data: {,
      ...node.data,
      options: [...node.data.options] // Deep copy options array,
    }
  };
};

export const moveNode = (node: NodeTemplate, newPosition: { x: number; y: number }): NodeTemplate => {
  return {
    ...node,
    position: { ...newPosition }
  };
};

export const updateNodeOptions = (node: NodeTemplate, newOptions: OptionConfig[]): NodeTemplate => {
  return {
    ...node,
    data: {,
      ...node.data,
      options: [...newOptions],
    }
  };
};

// Search and filter utilities
export const searchNodes = (nodes: NodeTemplate[], query: string): NodeTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return nodes.filter(node => )
    node.data.label.toLowerCase().includes(lowercaseQuery) ||
    node.data.description.toLowerCase().includes(lowercaseQuery) ||
    node.data.category.toLowerCase().includes(lowercaseQuery) ||
    node.data.options.some(option => )
      option.label.toLowerCase().includes(lowercaseQuery) ||
      option.value.toLowerCase().includes(lowercaseQuery)
  );
};

export const filterNodesByType = (nodes: NodeTemplate[], type: 'logic' | 'transform' | 'output'): NodeTemplate[] => {
  return nodes.filter(node => node.type === type);
};

export const filterNodesByCategory = (nodes: NodeTemplate[], category: string): NodeTemplate[] => {
  return nodes.filter(node => node.data.category === category);
};

// Statistics utilities
export const getNodeStatistics = (nodes: NodeTemplate[]) => {
  const stats = {
    total: nodes.length,
    byType: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    totalOptions: 0,
    averageOptions: 0,
  };
  nodes.forEach(node => {)
    // Count by type
    stats.byType[node.type] = (stats.byType[node.type] || 0) + 1;
    // Count by category
    stats.byCategory[node.data.category] = (stats.byCategory[node.data.category] || 0) + 1;
    // Count options
    stats.totalOptions += node.data.options.length;
  });
  stats.averageOptions = stats.total > 0 ? stats.totalOptions / stats.total : 0;
  return stats;
};
/**
 * Tests for node utility functions
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 */
import {
  calculateNodePosition,
  snapToGrid,
  getRandomOption,
  getWeightedRandomOptions,
  sortOptionsByWeight,
  validateNodeData,
  isValidNode,
  duplicateNode,
  moveNode,
  updateNodeOptions,
  searchNodes,
  filterNodesByType,
  filterNodesByCategory,
  getNodeStatistics
} from '../nodeUtils';
import { NodeTemplate, OptionConfig } from '../../data/nodeTemplates/types';
import { panelArchetypeTemplate, aestheticInfluenceTemplate, wearLevelTemplate } from '../../data/nodeTemplates';
describe('Position Utilities', () => {
  describe('calculateNodePosition', () => {
    test('should calculate grid positions correctly', () => {
      expect(calculateNodePosition(0)).toEqual({ x: 50, y: 50 });
      expect(calculateNodePosition(1)).toEqual({ x: 350, y: 50 });
      expect(calculateNodePosition(2)).toEqual({ x: 650, y: 50 });
      expect(calculateNodePosition(3)).toEqual({ x: 50, y: 250 });
    });
    test('should respect custom grid width and spacing', () => {
      const position = calculateNodePosition(4, 2, { x: 100, y: 150 });
      expect(position).toEqual({ x: 50, y: 350 });
    });
  });
  describe('snapToGrid', () => {
    test('should snap positions to grid', () => {
      expect(snapToGrid({ x: 23, y: 47 })).toEqual({ x: 20, y: 40 });
      expect(snapToGrid({ x: 18, y: 12 })).toEqual({ x: 20, y: 20 });
    });
    test('should respect custom grid size', () => {
      expect(snapToGrid({ x: 23, y: 47 }, 10)).toEqual({ x: 20, y: 50 });
    });
  });
});
describe('Option Utilities', () => {
  const testOptions: OptionConfig = [
    { label: 'Option A', value: 'a', weight: 3 },
    { label: 'Option B', value: 'b', weight: 1 },
    { label: 'Option C', value: 'c', weight: 2 }
  ];
  describe('getRandomOption', () => {
    test('should return an option from the array', () => {
      const option = getRandomOption(testOptions);
      expect(testOptions).toContainEqual(option);
    });
    test('should respect weights (statistical test)', () => {
      // Run many times to test weight distribution
      const counts = { a: 0, b: 0, c: 0 };
      const iterations = 1000;
      for (let i = 0; i < iterations; i++) {
        const option = getRandomOption(testOptions);
        counts[option.value as keyof typeof counts]++;
      // Option A (weight 3) should be selected most often
      // Option B (weight 1) should be selected least often
      expect(counts.a).toBeGreaterThan(counts.b);
      expect(counts.c).toBeGreaterThan(counts.b);
    });
  });
  describe('getWeightedRandomOptions', () => {
    test('should return requested number of options', () => {
      const options = getWeightedRandomOptions(testOptions, 2);
      expect(options).toHaveLength(2);
    });
    test('should not return duplicates', () => {
      const options = getWeightedRandomOptions(testOptions, 3);
      const values = options.map(opt => opt.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
    test('should handle count greater than available options', () => {
      const options = getWeightedRandomOptions(testOptions, 5);
      expect(options).toHaveLength(3); // Max available
    });
  });
  describe('sortOptionsByWeight', () => {
    test('should sort options by weight in descending order', () => {
      const sorted = sortOptionsByWeight(testOptions);
      expect(sorted[0].weight).toBe(3);
      expect(sorted[1].weight).toBe(2);
      expect(sorted[2].weight).toBe(1);
    });
    test('should not mutate original array', () => {
      const original = [...testOptions];
      sortOptionsByWeight(testOptions);
      expect(testOptions).toEqual(original);
    });
  });
});
describe('Node Validation', () => {
  describe('validateNodeData', () => {
    test('should validate correct node data', () => {
      const errors = validateNodeData(panelArchetypeTemplate);
      expect(errors).toHaveLength(0);
    });
    test('should detect missing ID', () => {
      const invalidNode = { ...panelArchetypeTemplate, id: '' };
      const errors = validateNodeData(invalidNode);
      expect(errors).toContain('Node must have a valid string ID');
    });
    test('should detect invalid type', () => {
      const invalidNode = { ...panelArchetypeTemplate, type: 'invalid' as any };
      const errors = validateNodeData(invalidNode);
      expect(errors).toContain('Node type must be logic, transform, or output');
    });
    test('should detect invalid position', () => {
      const invalidNode = { ...panelArchetypeTemplate, position: { x: 'invalid' } as any };
      const errors = validateNodeData(invalidNode);
      expect(errors).toContain('Node must have valid position coordinates');
    });
    test('should detect missing data fields', () => {
      const invalidNode = { 
        ...panelArchetypeTemplate, 
        data: { ...panelArchetypeTemplate.data, label: '' }
      };
      const errors = validateNodeData(invalidNode);
      expect(errors).toContain('Node data must include label and description');
    });
    test('should detect invalid options', () => {
      const invalidNode = { 
        ...panelArchetypeTemplate, 
        data: {,
          ...panelArchetypeTemplate.data, 
          options: [{ label: '', value: 'test', weight: -1 }]
      };
      const errors = validateNodeData(invalidNode);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
  describe('isValidNode', () => {
    test('should return true for valid nodes', () => {
      expect(isValidNode(panelArchetypeTemplate)).toBe(true);
      expect(isValidNode(aestheticInfluenceTemplate)).toBe(true);
    });
    test('should return false for invalid nodes', () => {
      const invalidNode = { ...panelArchetypeTemplate, id: '' };
      expect(isValidNode(invalidNode)).toBe(false);
    });
  });
});
describe('Node Transformation', () => {
  describe('duplicateNode', () => {
    test('should create duplicate with new ID', () => {
      const duplicate = duplicateNode(panelArchetypeTemplate);
      expect(duplicate.id).not.toBe(panelArchetypeTemplate.id);
      expect(duplicate.id).toMatch(/^archetype-2-copy-\d+$/);
      expect(duplicate.data.label).toBe(panelArchetypeTemplate.data.label);
    });
    test('should offset position', () => {
      const duplicate = duplicateNode(panelArchetypeTemplate, { x: 100, y: 200 });
      expect(duplicate.position.x).toBe(panelArchetypeTemplate.position.x + 100);
      expect(duplicate.position.y).toBe(panelArchetypeTemplate.position.y + 200);
    });
    test('should deep copy options', () => {
      const duplicate = duplicateNode(panelArchetypeTemplate);
      expect(duplicate.data.options).toEqual(panelArchetypeTemplate.data.options);
      expect(duplicate.data.options).not.toBe(panelArchetypeTemplate.data.options);
    });
  });
  describe('moveNode', () => {
    test('should update node position', () => {
      const moved = moveNode(panelArchetypeTemplate, { x: 100, y: 200 });
      expect(moved.position).toEqual({ x: 100, y: 200 });
      expect(moved.id).toBe(panelArchetypeTemplate.id);
    });
  });
  describe('updateNodeOptions', () => {
    test('should update node options', () => {
      const newOptions: OptionConfig = [
        { label: 'New Option', value: 'new', weight: 1 }
      ];
      const updated = updateNodeOptions(panelArchetypeTemplate, newOptions);
      expect(updated.data.options).toEqual(newOptions);
      expect(updated.data.options).not.toBe(panelArchetypeTemplate.data.options);
    });
  });
});
describe('Search and Filter', () => {
  const testNodes = [panelArchetypeTemplate, aestheticInfluenceTemplate, wearLevelTemplate];
  describe('searchNodes', () => {
    test('should find nodes by label', () => {
      const results = searchNodes(testNodes, 'Panel');
      expect(results).toContain(panelArchetypeTemplate);
      expect(results).not.toContain(aestheticInfluenceTemplate);
    });
    test('should find nodes by description', () => {
      const results = searchNodes(testNodes, 'Cassette');
      expect(results).toContain(aestheticInfluenceTemplate);
    });
    test('should find nodes by option content', () => {
      const results = searchNodes(testNodes, 'Cockpit');
      expect(results).toContain(panelArchetypeTemplate);
    });
    test('should be case insensitive', () => {
      const results = searchNodes(testNodes, 'panel');
      expect(results.length).toBeGreaterThan(0);
    });
  });
  describe('filterNodesByType', () => {
    test('should filter by logic type', () => {
      const results = filterNodesByType(testNodes, 'logic');
      expect(results).toHaveLength(2);
      expect(results).toContain(panelArchetypeTemplate);
      expect(results).toContain(aestheticInfluenceTemplate);
    });
    test('should filter by transform type', () => {
      const results = filterNodesByType(testNodes, 'transform');
      expect(results).toHaveLength(1);
      expect(results).toContain(wearLevelTemplate);
    });
  });
  describe('filterNodesByCategory', () => {
    test('should filter by category', () => {
      const results = filterNodesByCategory(testNodes, 'logic');
      expect(results).toHaveLength(2);
    });
  });
});
describe('Statistics', () => {
  describe('getNodeStatistics', () => {
    const testNodes = [panelArchetypeTemplate, aestheticInfluenceTemplate, wearLevelTemplate];
    test('should calculate correct statistics', () => {
      const stats = getNodeStatistics(testNodes);
      expect(stats.total).toBe(3);
      expect(stats.byType.logic).toBe(2);
      expect(stats.byType.transform).toBe(1);
      expect(stats.byCategory.logic).toBe(2);
      expect(stats.byCategory.transform).toBe(1);
      expect(stats.totalOptions).toBe(22); // 8 + 8 + 6
      expect(stats.averageOptions).toBeCloseTo(7.33, 2);
    });
    test('should handle empty array', () => {
      const stats = getNodeStatistics([]);
      expect(stats.total).toBe(0);
      expect(stats.averageOptions).toBe(0);
    });
  });
});
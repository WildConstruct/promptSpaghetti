import {
  createDefaultNodeData,
  addVariationToNode,
  removeVariationFromNode,
  updateVariationInNode,
  reorderVariationsInNode,
  getRandomVariation,
  hasVariations,
  getVariationCount,
  validateNodeDataLegacy,
} from '../utils/nodeDataUtils';
import { SubjectNodeData, WeightedChoiceNodeData, ActionNodeData } from '../types/NodeTypes';

describe('nodeDataUtils', () => {
  describe('createDefaultNodeData', () => {
    it('creates default data for Subject node', () => {
      const data = createDefaultNodeData('Subject') as SubjectNodeData;
      expect(data.type).toBe('Subject');
      expect(data.subjects).toEqual(['subject']);
      expect(data.singularForm).toBe('subject');
      expect(data.pluralForm).toBe('subjects');
    });

    it('creates default data for WeightedChoice node', () => {
      const data = createDefaultNodeData('WeightedChoice') as WeightedChoiceNodeData;
      expect(data.type).toBe('WeightedChoice');
      expect(data.weights).toEqual([1]);
      expect(data.options).toEqual(['option']);
    });

    it('creates default data for Action node', () => {
      const data = createDefaultNodeData('Action') as ActionNodeData;
      expect(data.type).toBe('Action');
      expect(data.actions).toEqual(['action']);
      expect(data.tense).toBe('present');
    });
  });

  describe('variation management', () => {
    const mockNode: SubjectNodeData = {
      id: 'test',
      label: 'Test',
      type: 'Subject' as const,
      variations: ['var1', 'var2'],
      subjects: ['test'],
      singularForm: 'test',
      pluralForm: 'tests',
    };

    it('adds variation to node', () => {
      const result = addVariationToNode(mockNode, 'var3');
      expect(result.variations).toEqual(['var1', 'var2', 'var3']);
    });

    it('removes variation from node', () => {
      const result = removeVariationFromNode(mockNode, 1);
      expect(result.variations).toEqual(['var1']);
    });

    it('updates variation in node', () => {
      const result = updateVariationInNode(mockNode, 0, 'updated');
      expect(result.variations).toEqual(['updated', 'var2']);
    });

    it('reorders variations in node', () => {
      const result = reorderVariationsInNode(mockNode, 0, 1);
      expect(result.variations).toEqual(['var2', 'var1']);
    });
  });

  describe('variation utilities', () => {
    const nodeWithVariations: SubjectNodeData = {
      id: 'test',
      label: 'Test',
      type: 'Subject' as const,
      variations: ['apple', 'banana', 'cherry'],
      subjects: ['test'],
      singularForm: 'test',
      pluralForm: 'tests',
    };

    const nodeWithoutVariations: SubjectNodeData = {
      id: 'test',
      label: 'Test',
      type: 'Subject' as const,
      variations: [],
      subjects: ['test'],
      singularForm: 'test',
      pluralForm: 'tests',
    };

    it('detects if node has variations', () => {
      expect(hasVariations(nodeWithVariations)).toBe(true);
      expect(hasVariations(nodeWithoutVariations)).toBe(false);
    });

    it('gets variation count', () => {
      expect(getVariationCount(nodeWithVariations)).toBe(3);
      expect(getVariationCount(nodeWithoutVariations)).toBe(0);
    });

    it('gets random variation with seed', () => {
      // With seed, should be deterministic
      const result1 = getRandomVariation(nodeWithVariations, 0);
      const result2 = getRandomVariation(nodeWithVariations, 0);
      expect(result1).toBe(result2);
      expect(['apple', 'banana', 'cherry']).toContain(result1);
    });

    it('returns label when no variations', () => {
      const result = getRandomVariation(nodeWithoutVariations);
      expect(result).toBe('Test');
    });
  });

  describe('validation', () => {
    it('validates valid node data', () => {
      const validNode: SubjectNodeData = {
        id: 'test',
        label: 'Test Node',
        type: 'Subject' as const,
        variations: ['var1'],
        subjects: ['test'],
        singularForm: 'test',
        pluralForm: 'tests',
      };

      const result = validateNodeDataLegacy(validNode);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('validates invalid node data', () => {
      const invalidNode: SubjectNodeData = {
        id: '',
        label: '',
        type: 'Subject' as const,
        variations: [],
        subjects: ['test'],
        singularForm: 'test',
        pluralForm: 'tests',
      };

      const result = validateNodeDataLegacy(invalidNode);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Node label is required');
      expect(result.errors).toContain('Node ID is required');
    });

    it('validates WeightedChoice specific rules', () => {
      const invalidWeightedChoice = {
        id: 'test',
        label: 'Test',
        type: 'WeightedChoice' as const,
        options: ['a', 'b'],
        weights: [1], // Mismatch with options length
      };

      const result = validateNodeDataLegacy(invalidWeightedChoice);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Number of options must match number of weights');
    });

    it('validates variable names', () => {
      const invalidSetVariable = {
        id: 'test',
        label: 'Test',
        type: 'SetVariable' as const,
        name: '',
        value: 'test',
      };

      const result = validateNodeDataLegacy(invalidSetVariable);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Variable name is required');
    });
  });
});
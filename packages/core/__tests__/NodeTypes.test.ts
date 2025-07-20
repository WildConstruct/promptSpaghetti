import {
  createNodeData,
  createWeightedChoiceNodeData,
  createConcatNodeData,
  serializeForRuntime,
  deserializeFromRuntime,
  validateNodeData,
  isRuntimeNodeType,
  isUINodeType
} from '../types/NodeTypes';

describe('NodeTypes Data Model', () => {
  describe('Factory Functions', () => {
    test('creates WeightedChoice node data correctly', () => {
      const nodeData = createWeightedChoiceNodeData('test-id', 'Test Choice');
      
      expect(nodeData.type).toBe('WeightedChoice');
      expect(nodeData.id).toBe('test-id');
      expect(nodeData.label).toBe('Test Choice');
      expect(nodeData.choices).toEqual([]);
      expect(nodeData.weights).toEqual([]);
      expect(nodeData.category).toBe('general');
    });

    test('creates Concat node data correctly', () => {
      const nodeData = createConcatNodeData('concat-id');
      
      expect(nodeData.type).toBe('Concat');
      expect(nodeData.id).toBe('concat-id');
      expect(nodeData.separator).toBe(' ');
      expect(nodeData.trimInputs).toBe(true);
      expect(nodeData.preserveOrder).toBe(true);
    });

    test('creates node data via dispatcher', () => {
      const choiceNode = createNodeData('WeightedChoice', 'choice-1');
      const concatNode = createNodeData('Concat', 'concat-1');
      
      expect(choiceNode.type).toBe('WeightedChoice');
      expect(concatNode.type).toBe('Concat');
    });
  });

  describe('Type Guards', () => {
    test('identifies runtime node types correctly', () => {
      expect(isRuntimeNodeType('WeightedChoice')).toBe(true);
      expect(isRuntimeNodeType('Concat')).toBe(true);
      expect(isRuntimeNodeType('Subject')).toBe(false);
      expect(isRuntimeNodeType('Action')).toBe(false);
    });

    test('identifies UI node types correctly', () => {
      expect(isUINodeType('Subject')).toBe(true);
      expect(isUINodeType('Action')).toBe(true);
      expect(isUINodeType('WeightedChoice')).toBe(false);
      expect(isUINodeType('Concat')).toBe(false);
    });
  });

  describe('Serialization', () => {
    test('serializes WeightedChoice for runtime', () => {
      const nodeData = createWeightedChoiceNodeData('choice-1');
      nodeData.choices = ['Option A', 'Option B'];
      nodeData.weights = [2, 3];

      const runtime = serializeForRuntime(nodeData);
      
      expect(runtime).toBeTruthy();
      expect(runtime!.type).toBe('WeightedChoice');
      expect(runtime!.choices).toEqual([
        { value: 'Option A', weight: 2 },
        { value: 'Option B', weight: 3 }
      ]);
    });

    test('returns null for UI-only nodes', () => {
      const subjectNode = createNodeData('Subject', 'subject-1');
      const runtime = serializeForRuntime(subjectNode);
      
      expect(runtime).toBeNull();
    });

    test('deserializes from runtime format', () => {
      const runtimeData = {
        id: 'choice-1',
        type: 'WeightedChoice' as const,
        choices: [
          { value: 'A', weight: 1 },
          { value: 'B', weight: 2 }
        ]
      };

      const nodeData = deserializeFromRuntime(runtimeData);
      
      expect(nodeData).toBeTruthy();
      expect(nodeData!.type).toBe('WeightedChoice');
      expect((nodeData as any).choices).toEqual(['A', 'B']);
      expect((nodeData as any).weights).toEqual([1, 2]);
    });
  });

  describe('Validation', () => {
    test('validates required fields', () => {
      const invalidNode = {};
      const errors = validateNodeData(invalidNode);
      
      expect(errors).toContain('Node ID is required');
      expect(errors).toContain('Node type is required');
      expect(errors).toContain('Node label is required');
    });

    test('validates WeightedChoice specifics', () => {
      const invalidChoice = {
        id: 'test',
        type: 'WeightedChoice' as const,
        label: 'Test',
        choices: []
      };
      
      const errors = validateNodeData(invalidChoice);
      expect(errors).toContain('WeightedChoice nodes must have at least one choice');
    });

    test('validates valid node data', () => {
      const validNode = createWeightedChoiceNodeData('test', 'Test');
      validNode.choices = ['A', 'B'];
      validNode.weights = [1, 1];
      
      const errors = validateNodeData(validNode);
      expect(errors).toHaveLength(0);
    });
  });
});
/**
 * Comprehensive tests for WeightedChoiceNode
 */

import { WeightedChoiceNode, WeightedOption } from '../WeightedChoiceNode';
import { Epic1NodeType } from '../index';

describe('WeightedChoiceNode', () => {
  describe('Basic functionality', () => {
    it('should create with initial options', () => {
      const options: WeightedOption[] = [
        { id: 'opt1', text: 'Option 1', weight: 50 },
        { id: 'opt2', text: 'Option 2', weight: 30 },
        { id: 'opt3', text: 'Option 3', weight: 20 }
      ];
      
      const node = new WeightedChoiceNode('test-1', options);
      
      expect(node.getNodeType()).toBe(Epic1NodeType.WeightedChoice);
      expect(node.getCurrentValue()).toEqual(options);
      expect(node.getTotalWeight()).toBe(100);
    });

    it('should create with custom configuration', () => {
      const node = new WeightedChoiceNode('test-2', [], {
        minOptions: 3,
        maxOptions: 10,
        defaultWeight: 25
      });
      
      const config = node.getData().configuration;
      expect(config?.minOptions).toBe(3);
      expect(config?.maxOptions).toBe(10);
      expect(config?.defaultWeight).toBe(25);
    });
  });

  describe('Option management', () => {
    it('should add new options', () => {
      const node = new WeightedChoiceNode('test-3', []);
      
      const id1 = node.addOption('First option', 40);
      const id2 = node.addOption('Second option', 60);
      
      expect(node.getCurrentValue()).toHaveLength(2);
      expect(node.getTotalWeight()).toBe(100);
      expect(id1).toMatch(/^opt-/);
      expect(id2).toMatch(/^opt-/);
    });

    it('should remove options', () => {
      const options: WeightedOption[] = [
        { id: 'opt1', text: 'Keep this', weight: 50 },
        { id: 'opt2', text: 'Remove this', weight: 50 }
      ];
      
      const node = new WeightedChoiceNode('test-4', options);
      node.removeOption('opt2');
      
      expect(node.getCurrentValue()).toHaveLength(1);
      expect(node.getCurrentValue()[0].text).toBe('Keep this');
    });

    it('should update option text', () => {
      const node = new WeightedChoiceNode('test-5', [
        { id: 'opt1', text: 'Original', weight: 100 }
      ]);
      
      node.updateOptionText('opt1', 'Updated');
      
      expect(node.getCurrentValue()[0].text).toBe('Updated');
    });

    it('should update option weight', () => {
      const node = new WeightedChoiceNode('test-6', [
        { id: 'opt1', text: 'Option', weight: 50 }
      ]);
      
      node.updateOptionWeight('opt1', 75);
      
      expect(node.getCurrentValue()[0].weight).toBe(75);
    });

    it('should update option color', () => {
      const node = new WeightedChoiceNode('test-7', [
        { id: 'opt1', text: 'Option', weight: 50 }
      ]);
      
      node.updateOptionColor('opt1', '#FF0000');
      
      expect(node.getCurrentValue()[0].color).toBe('#FF0000');
    });
  });

  describe('Weight management', () => {
    it('should normalize weights', () => {
      const node = new WeightedChoiceNode('test-8', [
        { id: 'opt1', text: 'A', weight: 10 },
        { id: 'opt2', text: 'B', weight: 20 },
        { id: 'opt3', text: 'C', weight: 30 }
      ]);
      
      node.normalizeWeights();
      const options = node.getCurrentValue();
      
      // Weights should sum to 100
      const total = options.reduce((sum, opt) => sum + opt.weight, 0);
      expect(Math.round(total)).toBe(100);
      
      // Check proportions are maintained
      expect(Math.round(options[0].weight)).toBe(17); // 10/60 * 100
      expect(Math.round(options[1].weight)).toBe(33); // 20/60 * 100
      expect(Math.round(options[2].weight)).toBe(50); // 30/60 * 100
    });

    it('should calculate weight percentages', () => {
      const node = new WeightedChoiceNode('test-9', [
        { id: 'opt1', text: 'A', weight: 25 },
        { id: 'opt2', text: 'B', weight: 75 }
      ]);
      
      const percentages = node.getWeightPercentages();
      
      expect(percentages.get('opt1')).toBe(25);
      expect(percentages.get('opt2')).toBe(75);
    });

    it('should handle zero total weight', () => {
      const node = new WeightedChoiceNode('test-10', [
        { id: 'opt1', text: 'A', weight: 0 },
        { id: 'opt2', text: 'B', weight: 0 }
      ]);
      
      const percentages = node.getWeightPercentages();
      
      expect(percentages.get('opt1')).toBe(0);
      expect(percentages.get('opt2')).toBe(0);
    });

    it('should distribute weights evenly', () => {
      const node = new WeightedChoiceNode('test-11', [
        { id: 'opt1', text: 'A', weight: 10 },
        { id: 'opt2', text: 'B', weight: 20 },
        { id: 'opt3', text: 'C', weight: 30 },
        { id: 'opt4', text: 'D', weight: 40 }
      ]);
      
      node.distributeEvenly();
      const options = node.getCurrentValue();
      
      options.forEach(opt => {
        expect(opt.weight).toBe(25); // 100/4
      });
    });
  });

  describe('Validation', () => {
    it('should validate minimum options', async () => {
      const node = new WeightedChoiceNode('test-12', [], { minOptions: 2 });
      
      const isValid = await node.validate();
      expect(isValid).toBe(false);
      
      const errors = node.getValidationErrors();
      expect(errors).toContain('Must have at least 2 options');
    });

    it('should validate maximum options', async () => {
      const node = new WeightedChoiceNode('test-13', [], { maxOptions: 2 });
      
      node.addOption('Option 1', 30);
      node.addOption('Option 2', 30);
      node.addOption('Option 3', 40); // Exceeds max
      
      const isValid = await node.validate();
      expect(isValid).toBe(false);
      
      const errors = node.getValidationErrors();
      expect(errors).toContain('Cannot exceed 2 options');
    });

    it('should validate non-zero weights', async () => {
      const node = new WeightedChoiceNode('test-14', [
        { id: 'opt1', text: 'A', weight: 0 },
        { id: 'opt2', text: 'B', weight: 0 }
      ]);
      
      const isValid = await node.validate();
      expect(isValid).toBe(false);
      
      const errors = node.getValidationErrors();
      expect(errors).toContain('At least one option must have a non-zero weight');
    });

    it('should validate empty option text', async () => {
      const node = new WeightedChoiceNode('test-15', [
        { id: 'opt1', text: '', weight: 50 },
        { id: 'opt2', text: 'Valid', weight: 50 }
      ]);
      
      const isValid = await node.validate();
      expect(isValid).toBe(false);
      
      const errors = node.getValidationErrors();
      expect(errors).toContain('Option text cannot be empty');
    });

    it('should detect duplicate option IDs', async () => {
      const node = new WeightedChoiceNode('test-16', [
        { id: 'duplicate', text: 'First', weight: 50 },
        { id: 'duplicate', text: 'Second', weight: 50 }
      ]);
      
      const isValid = await node.validate();
      expect(isValid).toBe(false);
      
      const errors = node.getValidationErrors();
      expect(errors).toContain('Duplicate option ID: duplicate');
    });
  });

  describe('Inline editing', () => {
    it('should handle edit workflow', async () => {
      const initial: WeightedOption[] = [
        { id: 'opt1', text: 'Initial', weight: 100 }
      ];
      
      const node = new WeightedChoiceNode('test-17', initial);
      
      node.startEdit();
      const newOptions: WeightedOption[] = [
        { id: 'opt1', text: 'Updated', weight: 60 },
        { id: 'opt2', text: 'New', weight: 40 }
      ];
      node.updateEditBuffer(newOptions);
      
      expect(node.isDirty()).toBe(true);
      
      await node.commitEdit();
      
      expect(node.getCurrentValue()).toEqual(newOptions);
      expect(node.isEditing()).toBe(false);
    });

    it('should validate edit buffer', async () => {
      const node = new WeightedChoiceNode('test-18', [
        { id: 'opt1', text: 'Valid', weight: 100 }
      ]);
      
      node.startEdit();
      
      // Invalid buffer (all zero weights)
      node.updateEditBuffer([
        { id: 'opt1', text: 'A', weight: 0 },
        { id: 'opt2', text: 'B', weight: 0 }
      ]);
      
      await expect(node.commitEdit()).rejects.toThrow('Validation failed');
    });
  });

  describe('Serialization', () => {
    it('should serialize and restore correctly', () => {
      const options: WeightedOption[] = [
        { id: 'opt1', text: 'Red', weight: 40, color: '#FF0000' },
        { id: 'opt2', text: 'Blue', weight: 60, color: '#0000FF' }
      ];
      
      const node = new WeightedChoiceNode('test-19', options, {
        minOptions: 2,
        maxOptions: 5
      });
      
      const serialized = node.serialize();
      const restored = new WeightedChoiceNode('test-19', []);
      restored.setData(serialized.data);
      
      expect(restored.getCurrentValue()).toEqual(options);
      expect(restored.getData().configuration?.minOptions).toBe(2);
      expect(restored.getData().configuration?.maxOptions).toBe(5);
    });
  });

  describe('Edge cases', () => {
    it('should handle very large weights', () => {
      const node = new WeightedChoiceNode('test-20', [
        { id: 'opt1', text: 'A', weight: 999999 },
        { id: 'opt2', text: 'B', weight: 1 }
      ]);
      
      const percentages = node.getWeightPercentages();
      expect(percentages.get('opt1')).toBeCloseTo(99.9999, 3);
      expect(percentages.get('opt2')).toBeCloseTo(0.0001, 3);
    });

    it('should handle many options', () => {
      const node = new WeightedChoiceNode('test-21', []);
      
      // Add 100 options
      for (let i = 0; i < 100; i++) {
        node.addOption(`Option ${i}`, 1);
      }
      
      expect(node.getCurrentValue()).toHaveLength(100);
      expect(node.getTotalWeight()).toBe(100);
      
      // Distribute evenly
      node.distributeEvenly();
      node.getCurrentValue().forEach(opt => {
        expect(opt.weight).toBe(1);
      });
    });

    it('should handle removing non-existent option', () => {
      const node = new WeightedChoiceNode('test-22', [
        { id: 'exists', text: 'Option', weight: 100 }
      ]);
      
      // Should not throw
      node.removeOption('does-not-exist');
      
      expect(node.getCurrentValue()).toHaveLength(1);
    });

    it('should handle updating non-existent option', () => {
      const node = new WeightedChoiceNode('test-23', [
        { id: 'exists', text: 'Option', weight: 100 }
      ]);
      
      // Should not throw
      node.updateOptionText('does-not-exist', 'New text');
      node.updateOptionWeight('does-not-exist', 50);
      
      // Original should be unchanged
      expect(node.getCurrentValue()[0].text).toBe('Option');
      expect(node.getCurrentValue()[0].weight).toBe(100);
    });
  });

  describe('Statistical analysis', () => {
    it('should calculate option statistics', () => {
      const node = new WeightedChoiceNode('test-24', [
        { id: 'opt1', text: 'Common', weight: 70 },
        { id: 'opt2', text: 'Uncommon', weight: 20 },
        { id: 'opt3', text: 'Rare', weight: 10 }
      ]);
      
      const total = node.getTotalWeight();
      expect(total).toBe(100);
      
      const percentages = node.getWeightPercentages();
      expect(percentages.get('opt1')).toBe(70);
      expect(percentages.get('opt2')).toBe(20);
      expect(percentages.get('opt3')).toBe(10);
    });
  });
});
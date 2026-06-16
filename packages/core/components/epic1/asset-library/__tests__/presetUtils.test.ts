/**
 * Tests for preset utility functions
 */

import {
  applyPresetToNode,
  getNodeValue,
  createPresetFromNode,
  isNodeModifiedFromPreset
} from '../presetUtils';
import { EditableNodeData } from '../../nodes';
import { Preset } from '../types';

describe('presetUtils', () => {
  describe('applyPresetToNode', () => {
    it('applies textBlock preset to node', () => {
      const nodeData: EditableNodeData = {
        value: 'old text',
        nodeType: 'textBlock',
        isEditing: false
      };

      const preset: Preset = {
        id: 'test-preset',
        name: 'Test Preset',
        category: 'test',
        tags: [],
        nodeType: 'textBlock',
        value: { text: 'new text from preset' },
        metadata: {
          created: new Date(),
          usage: 0
        }
      };

      const result = applyPresetToNode(nodeData, preset, 'textBlock');

      expect(result.value).toBe('new text from preset');
      expect(result.text).toBe('new text from preset');
      expect(result.editBuffer).toBe('new text from preset');
      expect(result.isModifiedFromPreset).toBe(true);
      expect(result.originalPresetId).toBe('test-preset');
    });

    it('applies weightedChoice preset to node', () => {
      const nodeData: EditableNodeData = {
        value: '[]',
        nodeType: 'weightedChoice',
        isEditing: false
      };

      const preset: Preset = {
        id: 'weighted-preset',
        name: 'Weighted Preset',
        category: 'test',
        tags: [],
        nodeType: 'weightedChoice',
        value: {
          options: [
            { text: 'option1', weight: 70 },
            { text: 'option2', weight: 30 }
          ]
        },
        metadata: {
          created: new Date(),
          usage: 0
        }
      };

      const result = applyPresetToNode(nodeData, preset, 'weightedChoice');

      expect(result.value).toBe(JSON.stringify(preset.value.options));
      // applyPresetToNode normalizes options with stable ids + hasBranch.
      const normalizedOptions = [
        { id: 'option-1', text: 'option1', weight: 70, hasBranch: false },
        { id: 'option-2', text: 'option2', weight: 30, hasBranch: false }
      ];
      expect(result.options).toEqual(normalizedOptions);
      expect(result.editBuffer).toBe(JSON.stringify(normalizedOptions, null, 2));
    });

    it('applies concat preset to node', () => {
      const nodeData: EditableNodeData = {
        value: ',',
        nodeType: 'concat',
        isEditing: false
      };

      const preset: Preset = {
        id: 'concat-preset',
        name: 'Concat Preset',
        category: 'test',
        tags: [],
        nodeType: 'concat',
        value: { separator: ' and ' },
        metadata: {
          created: new Date(),
          usage: 0
        }
      };

      const result = applyPresetToNode(nodeData, preset, 'concat');

      expect(result.value).toBe(' and ');
      expect(result.separator).toBe(' and ');
      expect(result.editBuffer).toBe(' and ');
    });

    it('applies variable preset to node', () => {
      const nodeData: EditableNodeData = {
        value: 'oldVar',
        nodeType: 'variable',
        isEditing: false
      };

      const preset: Preset = {
        id: 'var-preset',
        name: 'Variable Preset',
        category: 'test',
        tags: [],
        nodeType: 'variable',
        value: {
          variableName: 'character',
          operation: 'set',
          value: 'knight'
        },
        metadata: {
          created: new Date(),
          usage: 0
        }
      };

      const result = applyPresetToNode(nodeData, preset, 'variable');

      expect(result.value).toBe('character');
      expect(result.variableName).toBe('character');
      expect(result.operation).toBe('set');
      expect(result.variableValue).toBe('knight');
    });

    it('applies output preset to node', () => {
      const nodeData: EditableNodeData = {
        value: 'Old Label',
        nodeType: 'output',
        isEditing: false
      };

      const preset: Preset = {
        id: 'output-preset',
        name: 'Output Preset',
        category: 'test',
        tags: [],
        nodeType: 'output',
        value: { label: 'Story Output' },
        metadata: {
          created: new Date(),
          usage: 0
        }
      };

      const result = applyPresetToNode(nodeData, preset, 'output');

      expect(result.value).toBe('Story Output');
      expect(result.label).toBe('Story Output');
      expect(result.editBuffer).toBe('Story Output');
    });

    it('marks node as modified with timestamp', () => {
      const nodeData: EditableNodeData = {
        value: 'test',
        nodeType: 'textBlock',
        isEditing: false
      };

      const preset: Preset = {
        id: 'test-preset',
        name: 'Test',
        category: 'test',
        tags: [],
        nodeType: 'textBlock',
        value: { text: 'modified' },
        metadata: {
          created: new Date(),
          usage: 0
        }
      };

      const beforeTime = new Date();
      const result = applyPresetToNode(nodeData, preset, 'textBlock');
      const afterTime = new Date();

      expect(result.lastModified).toBeDefined();
      if (!result.lastModified) {
        throw new Error('Expected lastModified to be defined');
      }
      expect(result.lastModified.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime()
      );
      expect(result.lastModified.getTime()).toBeLessThanOrEqual(
        afterTime.getTime()
      );
    });
  });

  describe('getNodeValue', () => {
    it('gets value from textBlock node', () => {
      const nodeData: EditableNodeData = {
        value: 'fallback',
        text: 'primary text',
        nodeType: 'textBlock',
        isEditing: false
      };

      const value = getNodeValue(nodeData, 'textBlock');
      expect(value).toBe('primary text');
    });

    it('gets value from weightedChoice node', () => {
      const options = [
        { text: 'opt1', weight: 50 },
        { text: 'opt2', weight: 50 }
      ];
      const nodeData: EditableNodeData = {
        value: JSON.stringify(options),
        options: options,
        nodeType: 'weightedChoice',
        isEditing: false
      };

      const value = getNodeValue(nodeData, 'weightedChoice');
      expect(value).toEqual(options);
    });

    it('parses value from string if options not available', () => {
      const options = [
        { text: 'opt1', weight: 50 },
        { text: 'opt2', weight: 50 }
      ];
      const nodeData: EditableNodeData = {
        value: JSON.stringify(options),
        nodeType: 'weightedChoice',
        isEditing: false
      };

      const value = getNodeValue(nodeData, 'weightedChoice');
      expect(value).toEqual(options);
    });

    it('returns empty array for invalid weightedChoice value', () => {
      const nodeData: EditableNodeData = {
        value: '',
        nodeType: 'weightedChoice',
        isEditing: false
      };

      const value = getNodeValue(nodeData, 'weightedChoice');
      expect(value).toEqual([]);
    });

    it('gets value from concat node', () => {
      const nodeData: EditableNodeData = {
        value: 'fallback',
        separator: ' | ',
        nodeType: 'concat',
        isEditing: false
      };

      const value = getNodeValue(nodeData, 'concat');
      expect(value).toBe(' | ');
    });

    it('gets value from variable node', () => {
      const nodeData: EditableNodeData = {
        value: 'fallback',
        variableName: 'myVariable',
        nodeType: 'variable',
        isEditing: false
      };

      const value = getNodeValue(nodeData, 'variable');
      expect(value).toBe('myVariable');
    });

    it('gets value from output node', () => {
      const nodeData: EditableNodeData = {
        value: 'fallback',
        label: 'Output Label',
        nodeType: 'output',
        isEditing: false
      };

      const value = getNodeValue(nodeData, 'output');
      expect(value).toBe('Output Label');
    });

    it('falls back to value property for unknown types', () => {
      const nodeData: EditableNodeData = {
        value: 'generic value',
        nodeType: 'unknown',
        isEditing: false
      };

      const value = getNodeValue(nodeData, 'unknown');
      expect(value).toBe('generic value');
    });
  });

  describe('createPresetFromNode', () => {
    it('creates preset from textBlock node', () => {
      const nodeData: EditableNodeData = {
        value: 'test text',
        text: 'test text',
        nodeType: 'textBlock',
        isEditing: false
      };

      const preset = createPresetFromNode(
        nodeData,
        'textBlock',
        'My Text Preset',
        'custom',
        ['text', 'custom']
      );

      expect(preset.id).toMatch(/^custom-\d+-\w+$/);
      expect(preset.name).toBe('My Text Preset');
      expect(preset.category).toBe('custom');
      expect(preset.tags).toEqual(['text', 'custom']);
      expect(preset.nodeType).toBe('textBlock');
      expect(preset.value).toEqual({ text: 'test text' });
      expect(preset.metadata.author).toBe('user');
    });

    it('creates preset from weightedChoice node', () => {
      const options = [
        { text: 'A', weight: 60 },
        { text: 'B', weight: 40 }
      ];
      const nodeData: EditableNodeData = {
        value: JSON.stringify(options),
        options: options,
        nodeType: 'weightedChoice',
        isEditing: false
      };

      const preset = createPresetFromNode(
        nodeData,
        'weightedChoice',
        'My Weighted Preset',
        'custom'
      );

      expect(preset.value).toEqual({ options: options });
    });

    it('creates preset from variable node with operation', () => {
      const nodeData: EditableNodeData = {
        value: 'characterName',
        variableName: 'characterName',
        operation: 'set',
        variableValue: 'Aragorn',
        nodeType: 'setVariable',
        isEditing: false
      };

      const preset = createPresetFromNode(
        nodeData,
        'setVariable',
        'Character Name Variable',
        'variables'
      );

      expect(preset.value).toEqual({
        variableName: 'characterName',
        operation: 'set',
        value: 'Aragorn'
      });
    });

    it('generates unique IDs for each preset', () => {
      const nodeData: EditableNodeData = {
        value: 'test',
        nodeType: 'textBlock',
        isEditing: false
      };

      const preset1 = createPresetFromNode(
        nodeData,
        'textBlock',
        'Preset 1',
        'custom'
      );
      const preset2 = createPresetFromNode(
        nodeData,
        'textBlock',
        'Preset 2',
        'custom'
      );

      expect(preset1.id).not.toBe(preset2.id);
    });

    it('sets initial usage to 0', () => {
      const nodeData: EditableNodeData = {
        value: 'test',
        nodeType: 'textBlock',
        isEditing: false
      };

      const preset = createPresetFromNode(
        nodeData,
        'textBlock',
        'Test',
        'custom'
      );
      expect(preset.metadata.usage).toBe(0);
    });
  });

  describe('isNodeModifiedFromPreset', () => {
    it('returns true for modified nodes', () => {
      const nodeData: EditableNodeData = {
        value: 'test',
        nodeType: 'textBlock',
        isEditing: false,
        isModifiedFromPreset: true,
        originalPresetId: 'preset-123'
      };

      expect(isNodeModifiedFromPreset(nodeData)).toBe(true);
    });

    it('returns false for unmodified nodes', () => {
      const nodeData: EditableNodeData = {
        value: 'test',
        nodeType: 'textBlock',
        isEditing: false
      };

      expect(isNodeModifiedFromPreset(nodeData)).toBe(false);
    });

    it('returns false when explicitly set to false', () => {
      const nodeData: EditableNodeData = {
        value: 'test',
        nodeType: 'textBlock',
        isEditing: false,
        isModifiedFromPreset: false
      };

      expect(isNodeModifiedFromPreset(nodeData)).toBe(false);
    });
  });
});

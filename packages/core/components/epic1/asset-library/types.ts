/**
 * Types for Epic 1 Asset Library and Preset System
 */

export interface Preset {
  id: string;
  name: string;
  category: string;
  tags: string[];
  nodeType: string;
  value: any;
  metadata: {
    author?: string;
    created: Date;
    modified?: Date;
    usage: number;
    description?: string;
  };
}

export interface PresetCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  presets: Preset[];
}

export interface AssetLibraryState {
  categories: PresetCategory[];
  searchQuery: string;
  selectedCategory: string | null;
  filteredPresets: Preset[];
  isExpanded: boolean;
}

export interface DraggedPreset {
  preset: Preset;
  sourceCategory: string;
}

// Preset value types for different node types
export interface TextBlockPresetValue {
  text: string;
}

export interface WeightedChoicePresetValue {
  options: Array<{
    text: string;
    weight: number;
  }>;
}

export interface ConcatPresetValue {
  separator: string;
}

export interface VariablePresetValue {
  variableName: string;
  operation: 'set' | 'get';
  value?: string;
}

export interface OutputPresetValue {
  label: string;
}

// Type guards
export function isTextBlockPreset(preset: Preset): preset is Preset & { value: TextBlockPresetValue } {
  return preset.nodeType === 'textBlock';
}

export function isWeightedChoicePreset(preset: Preset): preset is Preset & { value: WeightedChoicePresetValue } {
  return preset.nodeType === 'weightedChoice';
}

export function isConcatPreset(preset: Preset): preset is Preset & { value: ConcatPresetValue } {
  return preset.nodeType === 'concat';
}

export function isVariablePreset(preset: Preset): preset is Preset & { value: VariablePresetValue } {
  return preset.nodeType === 'variable' || preset.nodeType === 'setVariable' || preset.nodeType === 'getVariable';
}

export function isOutputPreset(preset: Preset): preset is Preset & { value: OutputPresetValue } {
  return preset.nodeType === 'output';
}
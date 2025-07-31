// Enhanced data model reflecting actual editor usage patterns
export interface BaseNodeData {
  // Core identification
  id: string;
  label: string;
  
  // Common properties used across editors
  variations?: string[];
  category?: string;
  description?: string;
  tags?: string[];
  
  // Metadata and configuration
  includeMetadata?: boolean;
  transformations?: string[];
  contextHints?: string[];
}
}

// Extended UI-only node types (rich text generation)
}
export interface SubjectNodeData extends BaseNodeData {
  type: 'Subject';
  grammaticalNumber?: 'singular' | 'plural' | 'both';
  grammaticalPerson?: 'first' | 'second' | 'third';
  allowPronouns?: boolean;
  pronouns?: string[];
  baseForm?: string;
}

}
export interface ConnectorNodeData extends BaseNodeData {
  type: 'Connector';
  connectors: string[];
  grammarType?: 'coordinating' | 'subordinating' | 'correlative';
  position?: 'before' | 'after' | 'between'
  }

}
export interface AttributeNodeData extends BaseNodeData {
  type: 'Attribute';
  attributes: string[];
  targetNoun?: string;
  adjectiveType?: 'descriptive' | 'quantitative' | 'demonstrative';
  position?: 'before' | 'after'
  }

}
export interface ActionNodeData extends BaseNodeData {
  type: 'Action';
  actionType?: 'verb' | 'verb_phrase' | 'gerund';
  tense?: 'present' | 'past' | 'future' | 'conditional';
  mood?: 'indicative' | 'imperative' | 'subjunctive';
  requiresObject?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  adverbVariations?: string[];
}

// Core runtime-compatible node types (match graphSchema.ts)
}
export interface WeightedChoiceNodeData extends BaseNodeData {
  type: 'WeightedChoice';
  choices: string[];
  weights: number[];
}

}
export interface ConcatNodeData extends BaseNodeData {
  type: 'Concat';
  separator?: string;
  customSeparator?: string;
  joinMode?: 'space' | 'newline' | 'custom';
  prefix?: string;
  suffix?: string;
  trimInputs?: boolean;
  preserveOrder?: boolean;
  limitCount?: number;
}

}
export interface OutputNodeData extends BaseNodeData {
  type: 'Output';
  template?: string;
  format?: 'text' | 'markdown' | 'json';
  destination?: 'stdout' | 'file' | 'variable'
  }

}
export interface IncludeNodeData extends BaseNodeData {
  type: 'Include';
  name: string; // matches graphSchema
  includeType?: 'bundle' | 'template' | 'component'
  }

}
export interface SetVariableNodeData extends BaseNodeData {
  type: 'SetVariable';
  variableName: string;
  value: string;
  variableType?: 'string' | 'number' | 'boolean' | 'object' | 'auto';
  scope?: 'global' | 'local' | 'session';
  persistent?: boolean;
  allowOverwrite?: boolean;
}

}
export interface GetVariableNodeData extends BaseNodeData {
  type: 'GetVariable';
  variableName: string;
  defaultValue?: string;
  variableType?: 'string' | 'number' | 'boolean' | 'object' | 'auto';
  scope?: 'global' | 'local' | 'session';
  required?: boolean;
}

// Union types
export type NodeData = 
  | SubjectNodeData
  | ConnectorNodeData
  | AttributeNodeData
  | ActionNodeData
  | WeightedChoiceNodeData
  | ConcatNodeData
  | OutputNodeData
  | IncludeNodeData
  | SetVariableNodeData
  | GetVariableNodeData;

export type NodeType = NodeData['type'];

// Runtime-compatible node types (for graph execution)
export type RuntimeNodeType = 'WeightedChoice' | 'Concat' | 'Output' | 'Include' | 'SetVariable' | 'GetVariable';

// UI-only node types (rich text generation)
export type UINodeType = 'Subject' | 'Connector' | 'Attribute' | 'Action';

// Type guards
export function isRuntimeNodeType(type: string): type is RuntimeNodeType {
  return ['WeightedChoice', 'Concat', 'Output', 'Include', 'SetVariable', 'GetVariable'].includes(type);
}

export function isUINodeType(type: string): type is UINodeType {
  return ['Subject', 'Connector', 'Attribute', 'Action'].includes(type);
}

// Node data factory functions
export function createBaseNodeData(id: string, label: string): BaseNodeData {
  return {
    id,
    label,
    variations: [],
    category: 'general',
    description: '',
    tags: [],
    includeMetadata: false,
    transformations: [],
    contextHints: []
  };
}

export function createWeightedChoiceNodeData(id: string, label: string = 'Weighted Choice'): WeightedChoiceNodeData {
  return {
    ...createBaseNodeData(id, label),
    type: 'WeightedChoice',
    choices: [],
    weights: []
  };
}

export function createConcatNodeData(id: string, label: string = 'Concat'): ConcatNodeData {
  return {
    ...createBaseNodeData(id, label),
    type: 'Concat',
    separator: ' ',
    joinMode: 'space',
    trimInputs: true,
    preserveOrder: true
  };
}

export function createOutputNodeData(id: string, label: string = 'Output'): OutputNodeData {
  return {
    ...createBaseNodeData(id, label),
    type: 'Output',
    template: '',
    format: 'text',
    destination: 'stdout'
  };
}

export function createIncludeNodeData(id: string, label: string = 'Include'): IncludeNodeData {
  return {
    ...createBaseNodeData(id, label),
    type: 'Include',
    name: '',
    includeType: 'template'
  };
}

export function createSetVariableNodeData(id: string, label: string = 'Set Variable'): SetVariableNodeData {
  return {
    ...createBaseNodeData(id, label),
    type: 'SetVariable',
    variableName: '',
    value: '',
    variableType: 'auto',
    scope: 'global',
    persistent: false,
    allowOverwrite: true
  };
}

export function createGetVariableNodeData(id: string, label: string = 'Get Variable'): GetVariableNodeData {
  return {
    ...createBaseNodeData(id, label),
    type: 'GetVariable',
    variableName: '',
    defaultValue: '',
    variableType: 'auto',
    scope: 'global',
    required: false
  };
}

export function createSubjectNodeData(id: string, label: string = 'Subject'): SubjectNodeData {
  return {
    ...createBaseNodeData(id, label),
    type: 'Subject',
    grammaticalNumber: 'singular',
    grammaticalPerson: 'third',
    allowPronouns: false,
    pronouns: [],
    baseForm: ''
  };
}

export function createActionNodeData(id: string, label: string = 'Action'): ActionNodeData {
  return {
    ...createBaseNodeData(id, label),
    type: 'Action',
    actionType: 'verb',
    tense: 'present',
    mood: 'indicative',
    requiresObject: false,
    intensity: 'medium',
    adverbVariations: []
  };
}

// Factory function dispatcher
export function createNodeData(type: NodeType, id: string, label?: string): NodeData {
  switch (type) {
  case 'WeightedChoice':
    return createWeightedChoiceNodeData(id, label);
  case 'Concat':
    return createConcatNodeData(id, label);
  case 'Output':
    return createOutputNodeData(id, label);
  case 'Include':
    return createIncludeNodeData(id, label);
  case 'SetVariable':
    return createSetVariableNodeData(id, label);
  case 'GetVariable':
    return createGetVariableNodeData(id, label);
  case 'Subject':
    return createSubjectNodeData(id, label);
  case 'Action':
    return createActionNodeData(id, label);
  case 'Connector':
  case 'Attribute':
  default:
    // Fallback for unimplemented types
    return {
      ...createBaseNodeData(id, label || type),
      type: type as any
    };
  }
}

// Serialization utilities for runtime compatibility
}
export interface RuntimeNodeData {
  id: string;
  type: RuntimeNodeType;
  inputs?: string[];
  [key: string]: any;
}
}

// Convert UI node data to runtime-compatible format
export function serializeForRuntime(nodeData: NodeData): RuntimeNodeData | null {
  if (!isRuntimeNodeType(nodeData.type)) {
    // UI-only nodes cannot be serialized for runtime
    return null;
  }

  const base: RuntimeNodeData = {
    id: nodeData.id,
    type: nodeData.type as RuntimeNodeType
  };

  switch (nodeData.type) {
  case 'WeightedChoice':
    return {
      ...base,
      choices: (nodeData as WeightedChoiceNodeData).choices.map((choice, index) => ({
        value: choice,
        weight: (nodeData as WeightedChoiceNodeData).weights[index] || 1
      }))
    };

  case 'Concat':
    return base; // Concat nodes are handled by the runtime with input connections

  case 'Output':
    return base; // Output nodes are handled by the runtime

  case 'Include':
    return {
      ...base,
      name: (nodeData as IncludeNodeData).name
    };

  case 'SetVariable':
    return {
      ...base,
      key: (nodeData as SetVariableNodeData).variableName,
      value: (nodeData as SetVariableNodeData).value
    };

  case 'GetVariable':
    return {
      ...base,
      key: (nodeData as GetVariableNodeData).variableName
    };

  default:
    return base;
  }
}

// Convert runtime node data back to UI format
export function deserializeFromRuntime(runtimeData: RuntimeNodeData): NodeData | null {
  if (!isRuntimeNodeType(runtimeData.type)) {
    return null;
  }

  const id = runtimeData.id;
  const type = runtimeData.type;

  switch (type) {
  case 'WeightedChoice':
    const choices = (runtimeData.choices || []).map((c: any) => c.value || c);
    const weights = (runtimeData.choices || []).map((c: any) => c.weight || 1);
    return {
      ...createWeightedChoiceNodeData(id),
      choices,
      weights
    };

  case 'Concat':
    return createConcatNodeData(id);

  case 'Output':
    return createOutputNodeData(id);

  case 'Include':
    return {
      ...createIncludeNodeData(id),
      name: runtimeData.name || ''
    };

  case 'SetVariable':
    return {
      ...createSetVariableNodeData(id),
      variableName: runtimeData.key || '',
      value: runtimeData.value || ''
    };

  case 'GetVariable':
    return {
      ...createGetVariableNodeData(id),
      variableName: runtimeData.key || ''
    };

  default:
    return null;
  }
}

// Validation utilities
export function validateNodeData(nodeData: Partial<NodeData>): string[] {
  const errors: string[] = [];

  if (!nodeData.id) {
    errors.push('Node ID is required');
  }

  if (!nodeData.type) {
    errors.push('Node type is required');
  }

  if (!nodeData.label) {
    errors.push('Node label is required');
  }

  // Type-specific validation
  if (nodeData.type === 'WeightedChoice') {
    const data = nodeData as Partial<WeightedChoiceNodeData>;
    if (!data.choices || data.choices.length === 0) {
      errors.push('WeightedChoice nodes must have at least one choice');
    }
    if (data.choices && data.weights && data.choices.length !== data.weights.length) {
      errors.push('WeightedChoice nodes must have matching choices and weights arrays');
    }
  }

  if (nodeData.type === 'Include') {
    const data = nodeData as Partial<IncludeNodeData>;
    if (!data.name) {
      errors.push('Include nodes must have a name');
    }
  }

  if (nodeData.type === 'SetVariable' || nodeData.type === 'GetVariable') {
    const data = nodeData as Partial<SetVariableNodeData | GetVariableNodeData>;
    if (!data.variableName) {
      errors.push(`${nodeData.type} nodes must have a variable name`);
    }
  }

  return errors;
}

}
export interface NodeOperations {
  addVariation: (nodeId: string, variation: string) => void;
  removeVariation: (nodeId: string, variationIndex: number) => void;
  updateVariation: (nodeId: string, variationIndex: number, newValue: string) => void;
  reorderVariations: (nodeId: string, fromIndex: number, toIndex: number) => void;
  updateNodeData: (nodeId: string, updates: Partial<NodeData>) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
}
}

}
export interface VariationConfig {
  id: string;
  text: string;
  weight?: number;
  enabled?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}
}

}
export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  nodeType: NodeType;
  defaultData: Partial<NodeData>;
  category: string;
  tags: string[];
}
}
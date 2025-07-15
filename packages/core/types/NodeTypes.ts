export interface BaseNodeData {
  label: string;
  id: string;
  variations?: string[];
  description?: string;
  tags?: string[];
  category?: string;
}

export interface SubjectNodeData extends BaseNodeData {
  type: "Subject";
  subjects: string[];
  singularForm?: string;
  pluralForm?: string;
  defaultWeight?: number;
}

export interface ConnectorNodeData extends BaseNodeData {
  type: "Connector";
  connectors: string[];
  grammarType?: "coordinating" | "subordinating" | "correlative";
  position?: "before" | "after" | "between";
}

export interface AttributeNodeData extends BaseNodeData {
  type: "Attribute";
  attributes: string[];
  targetNoun?: string;
  adjectiveType?: "descriptive" | "quantitative" | "demonstrative";
  position?: "before" | "after";
}

export interface ActionNodeData extends BaseNodeData {
  type: "Action";
  actions: string[];
  tense?: "present" | "past" | "future";
  voice?: "active" | "passive";
  intensity?: "low" | "medium" | "high";
}

export interface WeightedChoiceNodeData extends BaseNodeData {
  type: "WeightedChoice";
  weights: number[];
  options: string[];
}

export interface ConcatNodeData extends BaseNodeData {
  type: "Concat";
  delimiter: string;
  formatType?: "sentence" | "list" | "paragraph";
}

export interface OutputNodeData extends BaseNodeData {
  type: "Output";
  prompt: string;
  outputFormat?: "text" | "markdown" | "json";
}

export interface IncludeNodeData extends BaseNodeData {
  type: "Include";
  ref: string;
  includeType?: "bundle" | "template" | "component";
}

export interface SetVariableNodeData extends BaseNodeData {
  type: "SetVariable";
  name: string;
  value: string;
  variableType?: "string" | "number" | "boolean" | "object";
}

export interface GetVariableNodeData extends BaseNodeData {
  type: "GetVariable";
  name: string;
  defaultValue?: string;
}

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

export type NodeType = NodeData["type"];

export interface NodeOperations {
  addVariation: (nodeId: string, variation: string) => void;
  removeVariation: (nodeId: string, variationIndex: number) => void;
  updateVariation: (nodeId: string, variationIndex: number, newValue: string) => void;
  reorderVariations: (nodeId: string, fromIndex: number, toIndex: number) => void;
  updateNodeData: (nodeId: string, updates: Partial<NodeData>) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
}

export interface VariationConfig {
  id: string;
  text: string;
  weight?: number;
  enabled?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
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
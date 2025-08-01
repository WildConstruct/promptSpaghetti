export interface BaseNodeData { id: string;
    label: string;
    variations?: string[];
    category?: string;
    description?: string;
    tags?: string[];
    includeMetadata?: boolean;
    transformations?: string[];
    contextHints?: string[] }
}
}
export interface SubjectNodeData extends BaseNodeData { type: 'Subject';
    grammaticalNumber?: 'singular' | 'plural' | 'both';
    grammaticalPerson?: 'first' | 'second' | 'third';
    allowPronouns?: boolean;
    pronouns?: string[];
    baseForm?: string }
}
export interface ConnectorNodeData extends BaseNodeData { type: 'Connector';
    connectors: string[];
    grammarType?: 'coordinating' | 'subordinating' | 'correlative';
    position?: 'before' | 'after' | 'between' }
}
export interface AttributeNodeData extends BaseNodeData { type: 'Attribute';
    attributes: string[];
    targetNoun?: string;
    adjectiveType?: 'descriptive' | 'quantitative' | 'demonstrative';
    position?: 'before' | 'after' }
}
export interface ActionNodeData extends BaseNodeData { type: 'Action';
    actionType?: 'verb' | 'verb_phrase' | 'gerund';
    tense?: 'present' | 'past' | 'future' | 'conditional';
    mood?: 'indicative' | 'imperative' | 'subjunctive';
    requiresObject?: boolean;
    intensity?: 'low' | 'medium' | 'high';
    adverbVariations?: string[] }
}
export interface WeightedChoiceNodeData extends BaseNodeData { type: 'WeightedChoice';
    choices: string[];
    weights: number[] }
}
export interface ConcatNodeData extends BaseNodeData { type: 'Concat';
    separator?: string;
    customSeparator?: string;
    joinMode?: 'space' | 'newline' | 'custom';
    prefix?: string;
    suffix?: string;
    trimInputs?: boolean;
    preserveOrder?: boolean;
    limitCount?: number }
}
export interface OutputNodeData extends BaseNodeData { type: 'Output';
    template?: string;
    format?: 'text' | 'markdown' | 'json';
    destination?: 'stdout' | 'file' | 'variable' }
}
export interface IncludeNodeData extends BaseNodeData { type: 'Include';
    name: string;
    includeType?: 'bundle' | 'template' | 'component' }
}
export interface SetVariableNodeData extends BaseNodeData { type: 'SetVariable';
    variableName: string;
    value: string;
    variableType?: 'string' | 'number' | 'boolean' | 'object' | 'auto';
    scope?: 'global' | 'local' | 'session';
    persistent?: boolean;
    allowOverwrite?: boolean }
}
export interface GetVariableNodeData extends BaseNodeData { type: 'GetVariable';
    variableName: string;
    defaultValue?: string;
    variableType?: 'string' | 'number' | 'boolean' | 'object' | 'auto';
    scope?: 'global' | 'local' | 'session';
    required?: boolean;

export type NodeData = SubjectNodeData | ConnectorNodeData | AttributeNodeData | ActionNodeData | WeightedChoiceNodeData | ConcatNodeData | OutputNodeData | IncludeNodeData | SetVariableNodeData | GetVariableNodeData;
export type NodeType = NodeData['type'];
export type RuntimeNodeType = 'WeightedChoice' | 'Concat' | 'Output' | 'Include' | 'SetVariable' | 'GetVariable';
export type UINodeType = 'Subject' | 'Connector' | 'Attribute' | 'Action';
export declare function isRuntimeNodeType(type: string): type is RuntimeNodeType;
export declare function isUINodeType(type: string): type is UINodeType;
export declare function createBaseNodeData(id: string, label: string): BaseNodeData;
export declare function createWeightedChoiceNodeData(id: string, label?: string): WeightedChoiceNodeData;
export declare function createConcatNodeData(id: string, label?: string): ConcatNodeData;
export declare function createOutputNodeData(id: string, label?: string): OutputNodeData;
export declare function createIncludeNodeData(id: string, label?: string): IncludeNodeData;
export declare function createSetVariableNodeData(id: string, label?: string): SetVariableNodeData;
export declare function createGetVariableNodeData(id: string, label?: string): GetVariableNodeData;
export declare function createSubjectNodeData(id: string, label?: string): SubjectNodeData;
export declare function createActionNodeData(id: string, label?: string): ActionNodeData;
export declare function createNodeData(type: NodeType, id: string, label?: string): NodeData }
}
export interface RuntimeNodeData { id: string;
    type: RuntimeNodeType;
    inputs?: string[];
    [key: string]: any;

export declare function serializeForRuntime(nodeData: NodeData): RuntimeNodeData | null;
export declare function deserializeFromRuntime(runtimeData: RuntimeNodeData): NodeData | null;
export declare function validateNodeData(nodeData: Partial<NodeData>): string[] }
}
}
export interface NodeOperations { addVariation: (nodeId: string, variation: string) => void;
    removeVariation: (nodeId: string, variationIndex: number) => void;
    updateVariation: (nodeId: string, variationIndex: number, newValue: string) => void;
    reorderVariations: (nodeId: string, fromIndex: number, toIndex: number) => void;
    updateNodeData: (nodeId: string, updates: Partial<NodeData>) => void;
    duplicateNode: (nodeId: string) => void;
    deleteNode: (nodeId: string) => void }
}
}
export interface VariationConfig { id: string;
    text: string;
    weight?: number;
    enabled?: boolean;
    tags?: string[];
    metadata?: Record<string, any> }
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


//# sourceMappingURL=NodeTypes.d.ts.map
}
}
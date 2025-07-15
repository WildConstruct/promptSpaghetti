import { NodeData, NodeType, VariationConfig } from "../types/NodeTypes";

export const createDefaultNodeData = (type: NodeType): Partial<NodeData> => {
  const baseData = {
    label: type,
    id: `${type}-${Date.now()}`,
    variations: [],
    description: "",
    tags: [],
    category: "general",
  };

  switch (type) {
    case "Subject":
      return {
        ...baseData,
        type: "Subject",
        subjects: ["subject"],
        singularForm: "subject",
        pluralForm: "subjects",
        defaultWeight: 1,
      };

    case "Connector":
      return {
        ...baseData,
        type: "Connector",
        connectors: ["and"],
        grammarType: "coordinating",
        position: "between",
      };

    case "Attribute":
      return {
        ...baseData,
        type: "Attribute",
        attributes: ["attribute"],
        targetNoun: "",
        adjectiveType: "descriptive",
        position: "before",
      };

    case "Action":
      return {
        ...baseData,
        type: "Action",
        actions: ["action"],
        tense: "present",
        voice: "active",
        intensity: "medium",
      };

    case "WeightedChoice":
      return {
        ...baseData,
        type: "WeightedChoice",
        weights: [1],
        options: ["option"],
      };

    case "Concat":
      return {
        ...baseData,
        type: "Concat",
        delimiter: ", ",
        formatType: "sentence",
      };

    case "Output":
      return {
        ...baseData,
        type: "Output",
        prompt: "",
        outputFormat: "text",
      };

    case "Include":
      return {
        ...baseData,
        type: "Include",
        ref: "",
        includeType: "bundle",
      };

    case "SetVariable":
      return {
        ...baseData,
        type: "SetVariable",
        name: "",
        value: "",
        variableType: "string",
      };

    case "GetVariable":
      return {
        ...baseData,
        type: "GetVariable",
        name: "",
        defaultValue: "",
      };

    default:
      return baseData;
  }
};

export const addVariationToNode = (nodeData: NodeData, variation: string): NodeData => {
  const currentVariations = nodeData.variations || [];
  return {
    ...nodeData,
    variations: [...currentVariations, variation],
  };
};

export const removeVariationFromNode = (nodeData: NodeData, index: number): NodeData => {
  const currentVariations = nodeData.variations || [];
  return {
    ...nodeData,
    variations: currentVariations.filter((_, i) => i !== index),
  };
};

export const updateVariationInNode = (
  nodeData: NodeData,
  index: number,
  newValue: string
): NodeData => {
  const currentVariations = nodeData.variations || [];
  const updatedVariations = [...currentVariations];
  updatedVariations[index] = newValue;
  return {
    ...nodeData,
    variations: updatedVariations,
  };
};

export const reorderVariationsInNode = (
  nodeData: NodeData,
  fromIndex: number,
  toIndex: number
): NodeData => {
  const currentVariations = nodeData.variations || [];
  const updatedVariations = [...currentVariations];
  const [movedItem] = updatedVariations.splice(fromIndex, 1);
  updatedVariations.splice(toIndex, 0, movedItem);
  return {
    ...nodeData,
    variations: updatedVariations,
  };
};

export const getRandomVariation = (nodeData: NodeData, seed?: number): string => {
  const variations = nodeData.variations || [];
  if (variations.length === 0) return nodeData.label;
  
  // Use seed for deterministic randomness if provided
  const randomIndex = seed 
    ? Math.floor((seed % variations.length))
    : Math.floor(Math.random() * variations.length);
  
  return variations[randomIndex];
};

export const hasVariations = (nodeData: NodeData): boolean => {
  return nodeData.variations && nodeData.variations.length > 0;
};

export const getVariationCount = (nodeData: NodeData): number => {
  return nodeData.variations?.length || 0;
};

export const validateNodeData = (nodeData: NodeData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!nodeData.label || nodeData.label.trim() === "") {
    errors.push("Node label is required");
  }
  
  if (!nodeData.id || nodeData.id.trim() === "") {
    errors.push("Node ID is required");
  }
  
  // Type-specific validation
  switch (nodeData.type) {
    case "WeightedChoice":
      if (nodeData.options.length !== nodeData.weights.length) {
        errors.push("Number of options must match number of weights");
      }
      if (nodeData.weights.some(w => w <= 0)) {
        errors.push("All weights must be positive numbers");
      }
      break;
      
    case "SetVariable":
      if (!nodeData.name || nodeData.name.trim() === "") {
        errors.push("Variable name is required");
      }
      break;
      
    case "GetVariable":
      if (!nodeData.name || nodeData.name.trim() === "") {
        errors.push("Variable name is required");
      }
      break;
      
    case "Include":
      if (!nodeData.ref || nodeData.ref.trim() === "") {
        errors.push("Reference is required");
      }
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

export const cloneNodeData = (nodeData: NodeData): NodeData => {
  return JSON.parse(JSON.stringify(nodeData));
};

export const mergeNodeData = (
  original: NodeData,
  updates: Partial<NodeData>
): NodeData => {
  return {
    ...original,
    ...updates,
  };
};
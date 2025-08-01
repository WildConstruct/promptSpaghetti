/**
 * Epic 1 Runtime Nodes with Inline Editing Support
 * 
 * This module exports all the base node classes for Epic 1's MVP implementation.
 * Each node supports inline editing, validation, and serialization as defined
 * in the PSG v2 file format specification.
 */

// Base class
export { 
  BaseInlineEditableNode,
  InlineEditableConfig,
  InlineEditableData,
  type EditState
} from './BaseInlineEditableNode';

// Node implementations
export { 
  TextBlockNode,
  TextBlockConfig
} from './TextBlockNode';

export { 
  WeightedChoiceNode,
  WeightedOption,
  WeightedChoiceValue,
  WeightedChoiceConfig
} from './WeightedChoiceNode';

export { 
  ConcatNode,
  ConcatConfig
} from './ConcatNode';

export { 
  VariableNode,
  VariableConfig,
  VariableNodeConfig,
  VariableMode,
  VariableType
} from './VariableNode';

export { 
  OutputNode
} from './OutputNode';

// Node type enum for consistency
export enum Epic1NodeType {
  TextBlock = 'TextBlock',
  WeightedChoice = 'WeightedChoice',
  Concat = 'Concat',
  Variable = 'Variable',
  Output = 'Output'
}

// Factory function for creating nodes from serialized data
export function createNodeFromData(data: any): BaseInlineEditableNode {
  const { type, id, data: nodeData } = data;
  
  switch (type) {
    case Epic1NodeType.TextBlock:
      const textNode = new TextBlockNode(id, nodeData.value);
      textNode.setData(nodeData);
      return textNode;
      
    case Epic1NodeType.WeightedChoice:
      const weightedNode = new WeightedChoiceNode(id, nodeData.value);
      weightedNode.setData(nodeData);
      return weightedNode;
      
    case Epic1NodeType.Concat:
      const concatNode = new ConcatNode(id, nodeData.value);
      concatNode.setData(nodeData);
      return concatNode;
      
    case Epic1NodeType.Variable:
      const variableNode = new VariableNode(id, nodeData.value);
      variableNode.setData(nodeData);
      return variableNode;
      
    case Epic1NodeType.Output:
      const outputNode = new OutputNode(id, nodeData.value);
      outputNode.setData(nodeData);
      return outputNode;
      
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}

// Type guard functions
export function isTextBlockNode(node: BaseInlineEditableNode): node is TextBlockNode {
  return node.getNodeType() === Epic1NodeType.TextBlock;
}

export function isWeightedChoiceNode(node: BaseInlineEditableNode): node is WeightedChoiceNode {
  return node.getNodeType() === Epic1NodeType.WeightedChoice;
}

export function isConcatNode(node: BaseInlineEditableNode): node is ConcatNode {
  return node.getNodeType() === Epic1NodeType.Concat;
}

export function isVariableNode(node: BaseInlineEditableNode): node is VariableNode {
  return node.getNodeType() === Epic1NodeType.Variable;
}

export function isOutputNode(node: BaseInlineEditableNode): node is OutputNode {
  return node.getNodeType() === Epic1NodeType.Output;
}

// Execution engine exports
export { 
  Epic1ExecutionContext,
  type VariableValue,
  type ExecutionStats
} from './Epic1ExecutionContext';

export { 
  Epic1ExecutionEngine,
  type Epic1Edge,
  type Epic1Graph,
  type NodeExecutionResult,
  type ExecutionResult
} from './Epic1ExecutionEngine';

export {
  GraphBuilder,
  executeWithSeeds,
  compareExecutionResults,
  createGraphFromPSG,
  generatePreview,
  validateDeterminism,
  formatExecutionResult,
  createExampleGraph
} from './executionUtils';

// Validation exports
export {
  validateNode,
  validateGraph,
  sanitizeValue,
  type ValidationError,
  type ValidationResult,
  type ValidationContext
} from './validation';

// Prompt Parser exports
export {
  PromptParser,
  promptParser,
  type PromptSegment,
  type PromptAnalysis,
  type GeneratedNode,
  type NodeMapping
} from './PromptParser';

// Smart Node Positioning exports
export {
  SmartNodePositioner,
  smartNodePositioner,
  type NodePosition,
  type NodeDimensions,
  type LayoutConfig
} from './SmartNodePositioning';
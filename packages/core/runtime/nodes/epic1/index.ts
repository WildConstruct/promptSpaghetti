/**
 * Epic 1 Runtime Nodes with Inline Editing Support
 *
 * This module exports all the base node classes for Epic 1's MVP implementation.
 * Each node supports inline editing, validation, and serialization as defined
 * in the PSG v2 file format specification.
 */

import { Epic1NodeType } from './nodeTypes';
import { TextBlockNode } from './TextBlockNode';
import { WeightedChoiceNode } from './WeightedChoiceNode';
import { ConcatNode } from './ConcatNode';
import { VariableNode } from './VariableNode';
import { OutputNode } from './OutputNode';
import { SubPsgNode } from './SubPsgNode';
import { BaseInlineEditableNode } from './BaseInlineEditableNode';
import { createNodeFromData } from './nodeFactory';

// Base class
export { BaseInlineEditableNode } from './BaseInlineEditableNode';

// Export interfaces explicitly
export type {
  InlineEditableConfig,
  InlineEditableData
} from './BaseInlineEditableNode';

// Re-export EditState from its original location
export type { EditState } from './BaseInlineEditableNode';

// Node implementations
export { TextBlockNode } from './TextBlockNode';

export type { TextBlockConfig } from './TextBlockNode';

export { WeightedChoiceNode } from './WeightedChoiceNode';

export type {
  WeightedOption,
  WeightedChoiceValue,
  WeightedChoiceConfig
} from './WeightedChoiceNode';

export { ConcatNode } from './ConcatNode';

export type { ConcatConfig } from './ConcatNode';

export { VariableNode } from './VariableNode';

export type {
  VariableConfig,
  VariableNodeConfig,
  VariableMode,
  VariableType
} from './VariableNode';

export { OutputNode } from './OutputNode';

export { TemplateNode } from './TemplateNode';

export type { TemplateConfig } from './TemplateNode';

export { SubPsgNode } from './SubPsgNode';

export type { SubPsgConfig } from './SubPsgNode';

// Node type enum (moved to separate file to avoid circular deps)
export { Epic1NodeType } from './nodeTypes';

export { createNodeFromData } from './nodeFactory';

// Type guard functions
export function isTextBlockNode(
  node: BaseInlineEditableNode
): node is TextBlockNode {
  return node.getNodeType() === Epic1NodeType.TextBlock;
}

export function isWeightedChoiceNode(
  node: BaseInlineEditableNode
): node is WeightedChoiceNode {
  return node.getNodeType() === Epic1NodeType.WeightedChoice;
}

export function isConcatNode(node: BaseInlineEditableNode): node is ConcatNode {
  return node.getNodeType() === Epic1NodeType.Concat;
}

export function isVariableNode(
  node: BaseInlineEditableNode
): node is VariableNode {
  return node.getNodeType() === Epic1NodeType.Variable;
}

export function isOutputNode(node: BaseInlineEditableNode): node is OutputNode {
  return node.getNodeType() === Epic1NodeType.Output;
}

export function isTemplateNode(
  node: BaseInlineEditableNode
): node is TemplateNode {
  return node.getNodeType() === Epic1NodeType.Template;
}

export function isSubPsgNode(
  node: BaseInlineEditableNode
): node is SubPsgNode {
  return node.getNodeType() === Epic1NodeType.SubPSG;
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
  type NodeMapping
} from './PromptParser';
export type { GeneratedNode } from './generatedNodeTypes';

// Smart Node Positioning exports
export {
  SmartNodePositioner,
  smartNodePositioner,
  type NodePosition,
  type NodeDimensions,
  type LayoutConfig
} from './SmartNodePositioning';

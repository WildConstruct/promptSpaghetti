import React from 'react';
import { ZodSchema } from 'zod';
// Import all node editors
import { WeightedChoiceEditor } from './editors/WeightedChoiceEditor';
import { ImprovedWeightedChoiceEditor } from './editors/ImprovedWeightedChoiceEditor';
import { ConcatEditor } from './editors/ConcatEditor';
import { OutputEditor } from './editors/OutputEditor';
import { VariableEditor } from './editors/VariableEditor';
import { SubjectEditor } from './editors/SubjectEditor';
import { ActionEditor } from './editors/ActionEditor';
import { PythonTransformEditor } from './editors/PythonTransformEditor';
import { ConditionalEditor } from './editors/ConditionalEditor';
import { SequentialEditor } from './editors/SequentialEditor';
import { MarkovEditor } from './editors/MarkovEditor';
import { WeightedAdvancedEditor } from './editors/WeightedAdvancedEditor';
import { BaseNodeEditor } from './BaseNodeEditor';


interface NodeEditorRouterProps { node: Record<string, unknown>;
  schema: ZodSchema<Record<string, unknown>>;
  onChange: (partial: Record<string, unknown>) => void;
  onGlobalPreviewRequest?: () => void;
  export const NodeEditorRouter: React.FC<NodeEditorRouterProps> = ({);
  node;
  schema;
  onChange }
  onGlobalPreviewRequest


}) => {
  if (!node || !schema) {
    return null;
  const nodeType = node.type || node.data?.nodeType;
  const nodeId = node.id;
  const nodeData = node.data || {};
  // Common props for all editors
  const editorProps = { nodeId,
    nodeData,
    schema }
    onChange
  };
  // Route to appropriate editor based on node type
  switch (nodeType) {
  // Basic Runtime Nodes
  case 'WeightedChoice':
    // Use the improved editor with raw weights and presets
    return <ImprovedWeightedChoiceEditor {...editorProps} onGlobalPreviewRequest={onGlobalPreviewRequest} />;
  case 'Concat':
    return <ConcatEditor {...editorProps} />;
  case 'Output':
    return <OutputEditor {...editorProps} />;
  case 'Include':
    // TODO: Create IncludeEditor
    return <BaseNodeEditor {...editorProps} />;
  case 'SetVariable':
  case 'GetVariable':
    return <VariableEditor {...editorProps} />;
    // UI-Only Nodes
  case 'Subject':
    return <SubjectEditor {...editorProps} />;
  case 'Connector':
    // TODO: Create ConnectorEditor
    return <BaseNodeEditor {...editorProps} />;
  case 'Attribute':
    // TODO: Create AttributeEditor
    return <BaseNodeEditor {...editorProps} />;
  case 'Action':
    return <ActionEditor {...editorProps} />;
    // Advanced Nodes (Epic 7)
  case 'WeightedAdvanced':
    return <WeightedAdvancedEditor {...editorProps} />;
  case 'Conditional':
    return <ConditionalEditor {...editorProps} />;
  case 'Sequential':
    return <SequentialEditor {...editorProps} />;
  case 'Markov':
    return <MarkovEditor {...editorProps} />;
    // Python Node
  case 'PythonTransform':
    return <PythonTransformEditor {...editorProps} />;
    // Default fallback
  default:
    console.warn(`No specific editor found for node type: ${nodeType}`);}
    return <BaseNodeEditor {...editorProps} />;
};
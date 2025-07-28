/**
 * Graph Editor Domain Types
 * REFACTOR-005: Domain-Driven Architecture
 * 
 * Core type definitions for the graph editor domain
 */
import { z } from 'zod';

// Re-export core graph schema types
export * from '../../../graphSchema';

// Graph Editor specific types
export interface GraphEditorState {
  graph: Graph;
  selectedNodeIds: string[];
  draggedNodeId: string | null;
  isExecuting: boolean;
  executionResults: Record<string, any>;
  validationErrors: ValidationError[];
  previewSeeds: number[];
  autosaveEnabled: boolean;
  isDirty: boolean;
}

export interface NodeSelection {
  nodeId: string;
  position: { x: number; y: number };
  isMultiSelect: boolean;
}

export interface GraphOperation {
  type: 'ADD_NODE' | 'REMOVE_NODE' | 'UPDATE_NODE' | 'ADD_EDGE' | 'REMOVE_EDGE' | 'MOVE_NODE';
  payload: any;
  timestamp: number;
  userId?: string;
}

export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  type: 'VALIDATION_ERROR' | 'RUNTIME_ERROR' | 'SCHEMA_ERROR';
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface PreviewConfiguration {
  seeds: number[];
  maxSeeds: number;
  autoRefresh: boolean;
  debounceMs: number;
}

export interface GraphEditorConfig {
  autosave: {,
    enabled: boolean;
    intervalMs: number;
  };
  preview: PreviewConfiguration;
  validation: {,
    realTime: boolean;
    debounceMs: number;
  };
  ui: {,
    showMinimap: boolean;
    showGrid: boolean;
    snapToGrid: boolean;
    gridSize: number;
  };
}

// Event types for domain communication
export interface GraphDomainEvents {
  onGraphModified: (graph: Graph) => void;
  onNodeSelected: (nodeIds: string[]) => void;
  onNodeAdded: (node: Node) => void;
  onNodeRemoved: (nodeId: string) => void;
  onValidationError: (errors: ValidationError[]) => void;
  onExecutionStarted: (graph: Graph, seeds: number[]) => void;
  onExecutionCompleted: (results: Record<string, any>) => void;
}

// Component prop types
export interface GraphEditorProps {
  initialGraph?: Graph;
  config?: Partial<GraphEditorConfig>;
  readOnly?: boolean;
  onGraphChange?: (graph: Graph) => void;
  onSelectionChange?: (nodeIds: string[]) => void;
  className?: string;
}

export interface NodePaletteProps {
  onNodeDragStart: (nodeType: string) => void;
  availableNodes?: string[];
  customNodes?: Record<string, NodeTypeDefinition>;
  collapsed?: boolean;
  className?: string;
}

export interface InspectorProps {
  selectedNodeIds: string[];
  graph: Graph;
  onNodeUpdate: (nodeId: string, updates: Partial<Node>) => void;
  onNodeDelete: (nodeId: string) => void;
  readOnly?: boolean;
  className?: string;
}

export interface CanvasProps {
  graph: Graph;
  selectedNodeIds: string[];
  onNodeSelect: (nodeIds: string[], isMultiSelect: boolean) => void;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeAdd: (nodeType: string, position: { x: number; y: number }) => void;
  onEdgeAdd: (sourceId: string, targetId: string) => void;
  onEdgeRemove: (edgeId: string) => void;
  config: GraphEditorConfig;
  className?: string;
}

// Node type definitions from existing schemas
export interface NodeTypeDefinition {
  type: string;
  label: string;
  description: string;
  icon: string;
  category: 'basic' | 'advanced' | 'utility' | 'custom';
  inputs: IODefinition[];
  outputs: IODefinition[];
  properties: PropertyDefinition[];
}

export interface IODefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
}

export interface PropertyDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'textarea';
  label: string;
  description: string;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: z.ZodSchema;
}

// Re-export types from existing schema files
export type { Graph, Node, Edge } from '../../../graphSchema';
export type { ExecutionContext, RuntimeNode } from '../../../runtime';
export type { AdvancedRuntimeNode, AdvancedExecutionContext } from '../../../runtime/advanced';
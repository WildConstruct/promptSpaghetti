/**
 * Graph Editor Domain Interface
 * REFACTOR-005: Domain-Driven Architecture
 * 
 * Main interface and export for the graph editor domain
 */
import React from 'react';
import {
  GraphEditorState,
  GraphEditorProps,
  NodePaletteProps,
  InspectorProps,
  CanvasProps,
  GraphDomainEvents,
  Graph,
  Node,
  ValidationError,
  GraphEditorConfig
} from './types/GraphTypes';

// Domain service interfaces

export interface IGraphValidationService {
  validateGraph(graph: Graph): Promise<ValidationError>;
  validateNode(node: Node): ValidationError;
  validateConnection(sourceId: string, targetId: string, graph: Graph): ValidationError;
  isValidGraph(graph: Graph): boolean;
}
export interface IGraphOperationsService {
  addNode(graph: Graph, nodeType: string, position: { x: number; y: number }): Graph;
  removeNode(graph: Graph, nodeId: string): Graph;
  updateNode(graph: Graph, nodeId: string, updates: Partial<Node>): Graph;
  addEdge(graph: Graph, sourceId: string, targetId: string): Graph;
  removeEdge(graph: Graph, edgeId: string): Graph;
  moveNode(graph: Graph, nodeId: string, position: { x: number; y: number }): Graph;
  duplicateNode(graph: Graph, nodeId: string): Graph;
  importGraph(graphData: any): Graph;
  exportGraph(graph: Graph): any;
}
export interface IGraphExecutionService {
  executeGraph(graph: Graph, seeds: number): Promise<Record<string, any>>;
  executeNode(node: Node, context: any): Promise<any>;
  previewGraph(graph: Graph, seeds: number): Promise<Record<string, any>>;
  cancelExecution(): void;
  getExecutionStatus(): 'idle' | 'running' | 'completed' | 'error';
}
export interface IGraphStateService {
  getState(): GraphEditorState;
  setState(state: Partial<GraphEditorState>): void;
  subscribe(callback: (state: GraphEditorState) => void): () => void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  saveState(): void;
  loadState(): void;
  // Main domain interface
}
export interface IGraphEditorDomain {
  // React Components
  components: {,
  GraphEditor: React.ComponentType<GraphEditorProps>;,
  NodePalette: React.ComponentType<NodePaletteProps>;
  Inspector: React.ComponentType<InspectorProps>;,
  Canvas: React.ComponentType<CanvasProps>;
};
  // React Hooks
  hooks: {,
  useGraphState: () => GraphEditorState;
  useNodeSelection: () => {,
  selectedNodeIds: string;,
  selectNodes: (nodeIds: string, isMultiSelect?: boolean) => void;
  clearSelection: () => void;,
  isSelected: (nodeId: string) => boolean;
};
    useGraphValidation: () => {,
  errors: ValidationError;
  validateGraph: (graph: Graph) => Promise<ValidationError>;,
  isValid: boolean;
};
    usePreviewSeeds: () => {,
  seeds: number;
  results: Record<string, any>;
  isExecuting: boolean;,
  executePreview: (graph: Graph) => Promise<void>;,
  addSeed: () => void;
  removeSeed: (index: number) => void;
};
    useGraphOperations: () => {,
  addNode: (nodeType: string, position: { x: number; y: number }) => void;
      removeNode: (nodeId: string) => void;,
  updateNode: (nodeId: string, updates: Partial<Node>) => void;,
  addEdge: (sourceId: string, targetId: string) => void;,
  removeEdge: (edgeId: string) => void;,
  moveNode: (nodeId: string, position: { x: number; y: number }) => void;
    };
    useAutosave: () => {,
  isEnabled: boolean;
  isDirty: boolean;,
  lastSaved: Date | null;
  save: () => Promise<void>;,
  toggleAutosave: () => void;
};
  };
  // Domain Services
  services: {,
  validation: IGraphValidationService;
  operations: IGraphOperationsService;,
  execution: IGraphExecutionService;
  state: IGraphStateService;
};
  // Event System
  events: GraphDomainEvents & {,
  subscribe: (event: keyof GraphDomainEvents, callback: Function) => () => void;,
  emit: (event: keyof GraphDomainEvents, ...args: any) => void;
};
  // Configuration
  config: {,
  getConfig: () => GraphEditorConfig;
  updateConfig: (config: Partial<GraphEditorConfig>) => void;,
  resetConfig: () => void;
};
  // Utilities
  utils: {,
  createEmptyGraph: () => Graph;
    cloneGraph: (graph: Graph) => Graph;,
  getNodeById: (graph: Graph, nodeId: string) => Node | undefined;,
  getConnectedNodes: (graph: Graph, nodeId: string) => Node;,
  findNodeByType: (graph: Graph, nodeType: string) => Node;,
  calculateGraphBounds: (graph: Graph) => { width: number; height: number };
  };

// Domain factory function
}
export interface GraphEditorDomainFactory {
  create(config?: Partial<GraphEditorConfig>): IGraphEditorDomain;
  // Event constants for cross-domain communication
}
export const GRAPH_DOMAIN_EVENTS = {
  GRAPH_MODIFIED: 'graph:modified',
  NODE_SELECTED: 'graph:node:selected',
  NODE_ADDED: 'graph:node:added',
  NODE_REMOVED: 'graph:node:removed',
  NODE_UPDATED: 'graph:node:updated',
  EDGE_ADDED: 'graph:edge:added',
  EDGE_REMOVED: 'graph:edge:removed',
  VALIDATION_ERROR: 'graph:validation:error',
  EXECUTION_STARTED: 'graph:execution:started',
  EXECUTION_COMPLETED: 'graph:execution:completed',
  EXECUTION_ERROR: 'graph:execution:error',
  STATE_SAVED: 'graph:state:saved',
  STATE_LOADED: 'graph:state:loaded',
  CONFIG_UPDATED: 'graph:config:updated',
} as const;

export type GraphDomainEventType = typeof GRAPH_DOMAIN_EVENTS[keyof typeof GRAPH_DOMAIN_EVENTS];
/**
 * Graph Editor Domain Store
 * REFACTOR-005: Domain-Driven Architecture
 * 
 * Zustand store for graph editor state management
 */
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  GraphEditorState,
  Graph,
  Node,
  ValidationError,
  GraphEditorConfig,
  GraphOperation
} from '../types/GraphTypes';
import { GRAPH_DOMAIN_EVENTS } from '../GraphEditorDomain';

// Default configuration
const DEFAULT_CONFIG: GraphEditorConfig = {,
  autosave: {,
  enabled: true,
  intervalMs: 5000,
},
  preview: {,
  seeds: [1, 42, 100],
  maxSeeds: 10,
  autoRefresh: true,
  debounceMs: 500,
},
  validation: {,
  realTime: true,
  debounceMs: 300,
},
  ui: {,
  showMinimap: false,
  showGrid: true,
  snapToGrid: true,
  gridSize: 20,
};

// Create empty graph helper
const createEmptyGraph = (): Graph => ({)
  nodes: [],
  edges: [],
});
interface GraphEditorStore extends GraphEditorState {
  // Configuration
  config: GraphEditorConfig;
  // History for undo/redo
  history: GraphOperation;,
  historyIndex: number;
  maxHistorySize: number;
  // Actions
  setGraph: (graph: Graph) => void;,
  updateGraph: (updater: (graph: Graph) => Graph) => void;
  // Node operations
  addNode: (nodeType: string, position: { x: number; y: number }) => void;
  removeNode: (nodeId: string) => void;,
  updateNode: (nodeId: string, updates: Partial<Node>) => void;,
  moveNode: (nodeId: string, position: { x: number; y: number }) => void;
  duplicateNode: (nodeId: string) => void;
  // Edge operations
  addEdge: (sourceId: string, targetId: string) => void;,
  removeEdge: (edgeId: string) => void;
  // Selection management
  selectNodes: (nodeIds: string, isMultiSelect?: boolean) => void;
  clearSelection: () => void;,
  toggleNodeSelection: (nodeId: string) => void;
  // Execution
  setExecuting: (isExecuting: boolean) => void;,
  setExecutionResults: (results: Record<string, any>) => void;
  clearExecutionResults: () => void;
  // Validation
  setValidationErrors: (errors: ValidationError) => void;,
  clearValidationErrors: () => void;
  // Preview seeds
  setPreviewSeeds: (seeds: number) => void;,
  addPreviewSeed: () => void;
  removePreviewSeed: (index: number) => void;
  // State management
  setDirty: (isDirty: boolean) => void;,
  resetState: () => void;
  // Configuration
  updateConfig: (config: Partial<GraphEditorConfig>) => void;,
  resetConfig: () => void;
  // History operations
  addToHistory: (operation: GraphOperation) => void;,
  undo: () => void;
  redo: () => void;,
  canUndo: () => boolean;
  canRedo: () => boolean;,
  clearHistory: () => void;
  // Utilities
  getNodeById: (nodeId: string) => Node | undefined;,
  getSelectedNodes: () => Node;
  isNodeSelected: (nodeId: string) => boolean;

export const useGraphEditorStore = create<GraphEditorStore>()()
  devtools();
    subscribeWithSelector();
      immer((set, get) => ({)
  // Initial state
        graph: createEmptyGraph(),
        selectedNodeIds: [],
        draggedNodeId: null,
        isExecuting: false,
        executionResults: {},
        validationErrors: [],
        previewSeeds: [1, 42, 100],
        autosaveEnabled: true,
        isDirty: false,
        // Configuration
        config: DEFAULT_CONFIG,
        // History
        history: [],
        historyIndex: -1,
        maxHistorySize: 50,
        // Graph operations
        setGraph: (graph: Graph) => set((state) => {,
          state.graph = graph;
          state.isDirty = true;
          state.selectedNodeIds = [];
          state.validationErrors = [];
        }),
        updateGraph: (updater: (graph: Graph) => Graph) => set((state) => {,
          state.graph = updater(state.graph);
          state.isDirty = true;
        }),
        // Node operations
        addNode: (nodeType: string, position: { x: number; y: number }) => set((state) => {
          const nodeId = `${nodeType}-${Date.now()}`;}
          const newNode: Node = {,
  id: nodeId,
            type: nodeType,
            position,
            data: {}
          };
          state.graph.nodes.push(newNode);
          state.selectedNodeIds = [nodeId];
          state.isDirty = true;
          // Add to history
          state.history.push({)
  type: 'ADD_NODE',
            payload: { node: newNode },
            timestamp: Date.now();
  });
        }),
        removeNode: (nodeId: string) => set((state) => {,
          const nodeIndex = state.graph.nodes.findIndex(n => n.id === nodeId);
          if (nodeIndex === -1) return;
          const removedNode = state.graph.nodes[nodeIndex];
          // Remove node
          state.graph.nodes.splice(nodeIndex, 1);
          // Remove connected edges
          state.graph.edges = state.graph.edges.filter()
            edge => edge.source !== nodeId && edge.target !== nodeId
          );
          // Update selection
          state.selectedNodeIds = state.selectedNodeIds.filter(id => id !== nodeId);
          state.isDirty = true;
          // Add to history
          state.history.push({)
  type: 'REMOVE_NODE',
            payload: { node: removedNode },
            timestamp: Date.now();
  });
        }),
        updateNode: (nodeId: string, updates: Partial<Node>) => set((state) => {
          const node = state.graph.nodes.find(n => n.id === nodeId);
          if (!node) return;
          const oldData = { ...node };
          Object.assign(node, updates);
          state.isDirty = true;
          // Add to history
          state.history.push({)
  type: 'UPDATE_NODE',
            payload: { nodeId, oldData, newData: updates },
            timestamp: Date.now();
  });
        }),
        moveNode: (nodeId: string, position: { x: number; y: number }) => set((state) => {
          const node = state.graph.nodes.find(n => n.id === nodeId);
          if (!node) return;
          const oldPosition = { ...node.position };
          node.position = position;
          state.isDirty = true;
          // Add to history
          state.history.push({)
  type: 'MOVE_NODE',
            payload: { nodeId, oldPosition, newPosition: position },
            timestamp: Date.now();
  });
        }),
        duplicateNode: (nodeId: string) => set((state) => {,
          const node = state.graph.nodes.find(n => n.id === nodeId);
          if (!node) return;
          const newNodeId = `${node.type}-${Date.now()}`;}
          const duplicatedNode: Node = {
  ...node,
  id: newNodeId,
  position: {,
  x: node.position.x + 50,
  y: node.position.y + 50,
};
          state.graph.nodes.push(duplicatedNode);
          state.selectedNodeIds = [newNodeId];
          state.isDirty = true;
        }),
        // Edge operations
        addEdge: (sourceId: string, targetId: string) => set((state) => {
          const edgeId = `${sourceId}-${targetId}`;}
          const newEdge = {
  id: edgeId,
  source: sourceId,
  target: targetId,
};
          state.graph.edges.push(newEdge);
          state.isDirty = true;
          // Add to history
          state.history.push({)
  type: 'ADD_EDGE',
            payload: { edge: newEdge },
            timestamp: Date.now();
  });
        }),
        removeEdge: (edgeId: string) => set((state) => {,
          const edgeIndex = state.graph.edges.findIndex(e => e.id === edgeId);
          if (edgeIndex === -1) return;
          const removedEdge = state.graph.edges[edgeIndex];
          state.graph.edges.splice(edgeIndex, 1);
          state.isDirty = true;
          // Add to history
          state.history.push({)
  type: 'REMOVE_EDGE',
            payload: { edge: removedEdge },
            timestamp: Date.now();
  });
        }),
        // Selection management
        selectNodes: (nodeIds: string, isMultiSelect = false) => set((state) => {
  state.selectedNodeIds = isMultiSelect
  ? [...new Set([...state.selectedNodeIds, ...nodeIds])]
  : nodeIds;
}),
        clearSelection: () => set((state) => {,
          state.selectedNodeIds = [];
        }),
        toggleNodeSelection: (nodeId: string) => set((state) => {,
          const isSelected = state.selectedNodeIds.includes(nodeId);
          if (isSelected) {
            state.selectedNodeIds = state.selectedNodeIds.filter(id => id !== nodeId);
          } else {
            state.selectedNodeIds.push(nodeId);
        }),
        // Execution
        setExecuting: (isExecuting: boolean) => set((state) => {,
          state.isExecuting = isExecuting;
        }),
        setExecutionResults: (results: Record<string, any>) => set((state) => {
          state.executionResults = results;
        }),
        clearExecutionResults: () => set((state) => {,
          state.executionResults = {};
        }),
        // Validation
        setValidationErrors: (errors: ValidationError) => set((state) => {,
          state.validationErrors = errors;
        }),
        clearValidationErrors: () => set((state) => {,
          state.validationErrors = [];
        }),
        // Preview seeds
        setPreviewSeeds: (seeds: number) => set((state) => {,
          state.previewSeeds = seeds;
        }),
        addPreviewSeed: () => set((state) => {,
          if (state.previewSeeds.length < state.config.preview.maxSeeds) {
            const newSeed = Math.floor(Math.random() * 10000);
            state.previewSeeds.push(newSeed);
        }),
        removePreviewSeed: (index: number) => set((state) => {,
          if (index >= 0 && index < state.previewSeeds.length) {
            state.previewSeeds.splice(index, 1);
        }),
        // State management
        setDirty: (isDirty: boolean) => set((state) => {,
          state.isDirty = isDirty;
        }),
        resetState: () => set((state) => {,
          state.graph = createEmptyGraph();
          state.selectedNodeIds = [];
          state.draggedNodeId = null;
          state.isExecuting = false;
          state.executionResults = {};
          state.validationErrors = [];
          state.previewSeeds = [1, 42, 100];
          state.isDirty = false;
          state.history = [];
          state.historyIndex = -1;
        }),
        // Configuration
        updateConfig: (config: Partial<GraphEditorConfig>) => set((state) => {,
          state.config = { ...state.config, ...config };
        }),
        resetConfig: () => set((state) => {,
          state.config = DEFAULT_CONFIG;
        }),
        // History operations
        addToHistory: (operation: GraphOperation) => set((state) => {,
          // Remove future history if we're not at the end
          if (state.historyIndex < state.history.length - 1) {
            state.history = state.history.slice(0, state.historyIndex + 1);
          // Add new operation
          state.history.push(operation);
          state.historyIndex = state.history.length - 1;
          // Limit history size
          if (state.history.length > state.maxHistorySize) {
            state.history = state.history.slice(-state.maxHistorySize);
            state.historyIndex = state.history.length - 1;
        }),
        undo: () => set((state) => {,
          if (state.historyIndex >= 0) {
            // Implementation would reverse the operation
            state.historyIndex--;
            state.isDirty = true;
        }),
        redo: () => set((state) => {,
          if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            // Implementation would apply the operation
            state.isDirty = true;
        }),
        canUndo: () => get().historyIndex >= 0,
        canRedo: () => get().historyIndex < get().history.length - 1,
        clearHistory: () => set((state) => {,
          state.history = [];
          state.historyIndex = -1;
        }),
        // Utilities
        getNodeById: (nodeId: string) => {,
          return get().graph.nodes.find(n => n.id === nodeId);
  },
  getSelectedNodes: () => {,
          const state = get();
          return state.graph.nodes.filter(n => state.selectedNodeIds.includes(n.id));
  },
  isNodeSelected: (nodeId: string) => {,
          return get().selectedNodeIds.includes(nodeId);
      })),
      {
  name: 'graph-editor-store',
  version: 1);
  // Selector hooks for performance
  export const useGraphEditorState = () => useGraphEditorStore((state) => ({)
  graph: state.graph,
  selectedNodeIds: state.selectedNodeIds,
  isExecuting: state.isExecuting,
  validationErrors: state.validationErrors,
  isDirty: state.isDirty,
}));

export const useGraphEditorConfig = () => useGraphEditorStore((state) => state.config);

export const useGraphEditorHistory = () => useGraphEditorStore((state) => ({)
  canUndo: state.canUndo(),
  canRedo: state.canRedo(),
  undo: state.undo,
  redo: state.redo,
}));
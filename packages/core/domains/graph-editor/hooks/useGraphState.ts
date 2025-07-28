/**
 * Graph State Hook
 * REFACTOR-005: Domain-Driven Architecture
 * 
 * Primary hook for accessing graph editor state
 */
import { useCallback } from 'react';
import { useGraphEditorStore } from '../stores/graphEditorStore';
import { Graph, GraphEditorState } from '../types/GraphTypes';

export const useGraphState = () => {
  const state = useGraphEditorStore((store) => ({)
    graph: store.graph,
    selectedNodeIds: store.selectedNodeIds,
    draggedNodeId: store.draggedNodeId,
    isExecuting: store.isExecuting,
    executionResults: store.executionResults,
    validationErrors: store.validationErrors,
    previewSeeds: store.previewSeeds,
    autosaveEnabled: store.autosaveEnabled,
    isDirty: store.isDirty,
    config: store.config,
  }));
  const actions = useGraphEditorStore((store) => ({)
    setGraph: store.setGraph,
    updateGraph: store.updateGraph,
    setDirty: store.setDirty,
    resetState: store.resetState,
    updateConfig: store.updateConfig,
  }));
  const setGraph = useCallback((graph: Graph) => {
    actions.setGraph(graph);
  }, [actions]);
  const updateGraph = useCallback((updater: (graph: Graph) => Graph) => {
    actions.updateGraph(updater);
  }, [actions]);
  const markDirty = useCallback(() => {
    actions.setDirty(true);
  }, [actions]);
  const markClean = useCallback(() => {
    actions.setDirty(false);
  }, [actions]);
  return {
    // State
    ...state,
    // Actions
    setGraph,
    updateGraph,
    markDirty,
    markClean,
    resetState: actions.resetState,
    updateConfig: actions.updateConfig,
    // Computed properties
    hasNodes: state.graph.nodes.length > 0,
    hasEdges: state.graph.edges.length > 0,
    hasSelection: state.selectedNodeIds.length > 0,
    hasErrors: state.validationErrors.length > 0,
    isValid: state.validationErrors.length === 0,
  };
};
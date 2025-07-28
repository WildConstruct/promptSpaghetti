/**
 * Graph Operations Hook
 * REFACTOR-005: Domain-Driven Architecture
 * 
 * Hook for performing graph operations (add/remove/update nodes and edges)
 */
import { useCallback } from 'react';
import { useGraphEditorStore } from '../stores/graphEditorStore';
import { Node } from '../types/GraphTypes';

export const useGraphOperations = () => {
  const actions = useGraphEditorStore((state) => ({)
    addNode: state.addNode,
    removeNode: state.removeNode,
    updateNode: state.updateNode,
    moveNode: state.moveNode,
    duplicateNode: state.duplicateNode,
    addEdge: state.addEdge,
    removeEdge: state.removeEdge,
    getNodeById: state.getNodeById,
  }));
  // Node operations
  const addNode = useCallback((nodeType: string, position: { x: number; y: number }) => {
    actions.addNode(nodeType, position);
  }, [actions]);
  const removeNode = useCallback((nodeId: string) => {
    actions.removeNode(nodeId);
  }, [actions]);
  const removeSelectedNodes = useCallback(() => {
    const selectedNodeIds = useGraphEditorStore.getState().selectedNodeIds;
    selectedNodeIds.forEach(nodeId => actions.removeNode(nodeId));
  }, [actions]);
  const updateNode = useCallback((nodeId: string, updates: Partial<Node>) => {
    actions.updateNode(nodeId, updates);
  }, [actions]);
  const updateSelectedNodes = useCallback((updates: Partial<Node>) => {
    const selectedNodeIds = useGraphEditorStore.getState().selectedNodeIds;
    selectedNodeIds.forEach(nodeId => actions.updateNode(nodeId, updates));
  }, [actions]);
  const moveNode = useCallback((nodeId: string, position: { x: number; y: number }) => {
    actions.moveNode(nodeId, position);
  }, [actions]);
  const moveSelectedNodes = useCallback((deltaX: number, deltaY: number) => {
    const state = useGraphEditorStore.getState();
    state.selectedNodeIds.forEach(nodeId => {)
      const node = actions.getNodeById(nodeId);
      if (node) {
        actions.moveNode(nodeId, {)
          x: node.position.x + deltaX,
          y: node.position.y + deltaY,
        });
      }
    });
  }, [actions]);
  const duplicateNode = useCallback((nodeId: string) => {
    actions.duplicateNode(nodeId);
  }, [actions]);
  const duplicateSelectedNodes = useCallback(() => {
    const selectedNodeIds = useGraphEditorStore.getState().selectedNodeIds;
    selectedNodeIds.forEach(nodeId => actions.duplicateNode(nodeId));
  }, [actions]);
  // Edge operations
  const addEdge = useCallback((sourceId: string, targetId: string) => {
    actions.addEdge(sourceId, targetId);
  }, [actions]);
  const removeEdge = useCallback((edgeId: string) => {
    actions.removeEdge(edgeId);
  }, [actions]);
  const removeEdgesBetween = useCallback((sourceId: string, targetId: string) => {
    const state = useGraphEditorStore.getState();
    const edgesToRemove = state.graph.edges.filter(;);
      edge => edge.source === sourceId && edge.target === targetId
    );
    edgesToRemove.forEach(edge => actions.removeEdge(edge.id));
  }, [actions]);
  const removeAllEdgesForNode = useCallback((nodeId: string) => {
    const state = useGraphEditorStore.getState();
    const edgesToRemove = state.graph.edges.filter(;);
      edge => edge.source === nodeId || edge.target === nodeId
    );
    edgesToRemove.forEach(edge => actions.removeEdge(edge.id));
  }, [actions]);
  // Bulk operations
  const deleteSelection = useCallback(() => {
    const state = useGraphEditorStore.getState();
    // Remove edges connected to selected nodes first
    state.selectedNodeIds.forEach(nodeId => {)
      removeAllEdgesForNode(nodeId);
    });
    // Then remove the nodes
    state.selectedNodeIds.forEach(nodeId => {)
      actions.removeNode(nodeId);
    });
  }, [actions, removeAllEdgesForNode]);
  // Utility functions
  const getNodeById = useCallback((nodeId: string) => {
    return actions.getNodeById(nodeId);
  }, [actions]);
  const canConnect = useCallback((sourceId: string, targetId: string): boolean => {
    if (sourceId === targetId) return false;
    const state = useGraphEditorStore.getState();
    const existingEdge = state.graph.edges.find(;);
      edge => edge.source === sourceId && edge.target === targetId
    );
    return !existingEdge;
  }, []);
  const getConnectedNodes = useCallback((nodeId: string) => {
    const state = useGraphEditorStore.getState();
    const connectedNodeIds = new Set<string>();
    state.graph.edges.forEach(edge => {)
      if (edge.source === nodeId) {
        connectedNodeIds.add(edge.target);
      }
      if (edge.target === nodeId) {
        connectedNodeIds.add(edge.source);
      }
    });
    return Array.from(connectedNodeIds)
      .map(id => actions.getNodeById(id))
      .filter(Boolean) as Node[];
  }, [actions]);
  return {
    // Node operations
    addNode,
    removeNode,
    removeSelectedNodes,
    updateNode,
    updateSelectedNodes,
    moveNode,
    moveSelectedNodes,
    duplicateNode,
    duplicateSelectedNodes,
    // Edge operations
    addEdge,
    removeEdge,
    removeEdgesBetween,
    removeAllEdgesForNode,
    // Bulk operations
    deleteSelection,
    // Utilities
    getNodeById,
    canConnect,
    getConnectedNodes
  };
};
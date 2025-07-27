/**
 * Node Selection Hook
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Hook for managing node selection state
 */
import { useCallback } from 'react';
import { useGraphEditorStore } from '../stores/graphEditorStore';
export const useNodeSelection = () => {
    const selectedNodeIds = useGraphEditorStore((state) => state.selectedNodeIds);
    const getSelectedNodes = useGraphEditorStore((state) => state.getSelectedNodes);
    const isNodeSelected = useGraphEditorStore((state) => state.isNodeSelected);
    const actions = useGraphEditorStore((state) => ({
        selectNodes: state.selectNodes,
        clearSelection: state.clearSelection,
        toggleNodeSelection: state.toggleNodeSelection
    }));
    const selectNodes = useCallback((nodeIds, isMultiSelect = false) => {
        actions.selectNodes(nodeIds, isMultiSelect);
    }, [actions]);
    const selectSingleNode = useCallback((nodeId) => {
        actions.selectNodes([nodeId], false);
    }, [actions]);
    const addToSelection = useCallback((nodeIds) => {
        actions.selectNodes(nodeIds, true);
    }, [actions]);
    const toggleSelection = useCallback((nodeId) => {
        actions.toggleNodeSelection(nodeId);
    }, [actions]);
    const clearSelection = useCallback(() => {
        actions.clearSelection();
    }, [actions]);
    const selectAll = useCallback(() => {
        const allNodeIds = useGraphEditorStore.getState().graph.nodes.map(n => n.id);
        actions.selectNodes(allNodeIds, false);
    }, [actions]);
    const getSelectedNodes = useCallback(() => {
        return useGraphEditorStore.getState().getSelectedNodes();
    }, []);
    const isSelected = useCallback((nodeId) => {
        return isNodeSelected(nodeId);
    }, [isNodeSelected]);
    return {
        // State
        selectedNodeIds,
        selectedNodes: getSelectedNodes(),
        hasSelection: selectedNodeIds.length > 0,
        selectionCount: selectedNodeIds.length,
        isMultiSelection: selectedNodeIds.length > 1,
        // Actions
        selectNodes,
        selectSingleNode,
        addToSelection,
        toggleSelection,
        clearSelection,
        selectAll,
        // Utilities
        isSelected,
        getSelectedNodes
    };
};

import { useCallback, useState, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { useToast } from '../../Toast';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

interface EditOperationsConfig {
  currentNodes: Node[];
  currentEdges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onEditorKeyChange: (updater: (prev: number) => number) => void;
  showToast: ReturnType<typeof useToast>['showToast'];
}

export const useEditOperations = ({
  currentNodes,
  currentEdges,
  onNodesChange,
  onEdgesChange,
  onEditorKeyChange,
  showToast
}: EditOperationsConfig) => {
  // Initialize history with current state
  const [history, setHistory] = useState<HistoryState[]>([
    {
      nodes: JSON.parse(JSON.stringify(currentNodes || [])),
      edges: JSON.parse(JSON.stringify(currentEdges || []))
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [clipboard, setClipboard] = useState<HistoryState | null>(null);

  // Track changes to nodes and edges for undo/redo history
  const prevNodesRef = useRef<Node[]>(currentNodes);
  const prevEdgesRef = useRef<Edge[]>(currentEdges);
  const changeTimeoutRef = useRef<NodeJS.Timeout>();
  const isApplyingHistory = useRef(false);

  const addToHistory = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges))
      });
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      isApplyingHistory.current = true;

      // Deep clone to ensure React Flow detects changes
      const restoredNodes = JSON.parse(JSON.stringify(state.nodes));
      const restoredEdges = JSON.parse(JSON.stringify(state.edges));

      // Apply both nodes and edges with their full state including positions
      onNodesChange(restoredNodes);
      onEdgesChange(restoredEdges);
      setHistoryIndex(newIndex);
      onEditorKeyChange(prev => prev + 1);

      // Reset flag after a delay to allow React Flow to process
      setTimeout(() => {
        isApplyingHistory.current = false;
      }, 100);

      showToast('Undo successful', 'success');
    } else {
      showToast('Nothing to undo', 'info');
    }
  }, [
    history,
    historyIndex,
    onNodesChange,
    onEdgesChange,
    onEditorKeyChange,
    showToast
  ]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      isApplyingHistory.current = true;

      // Deep clone to ensure React Flow detects changes
      const restoredNodes = JSON.parse(JSON.stringify(state.nodes));
      const restoredEdges = JSON.parse(JSON.stringify(state.edges));

      // Apply both nodes and edges with their full state including positions
      onNodesChange(restoredNodes);
      onEdgesChange(restoredEdges);
      setHistoryIndex(newIndex);
      onEditorKeyChange(prev => prev + 1);

      // Reset flag after a delay to allow React Flow to process
      setTimeout(() => {
        isApplyingHistory.current = false;
      }, 100);

      showToast('Redo successful', 'success');
    } else {
      showToast('Nothing to redo', 'info');
    }
  }, [
    history,
    historyIndex,
    onNodesChange,
    onEdgesChange,
    onEditorKeyChange,
    showToast
  ]);

  const handleCopy = useCallback(() => {
    const selectedNodes = currentNodes.filter(n => n.selected);

    if (selectedNodes.length === 0) {
      showToast('No nodes selected', 'warning');
      return;
    }

    // Optimize with Set for O(1) lookup
    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
    const selectedEdges = currentEdges.filter(
      e => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
    );

    setClipboard({
      nodes: JSON.parse(JSON.stringify(selectedNodes)),
      edges: JSON.parse(JSON.stringify(selectedEdges))
    });
    showToast(
      `Copied ${selectedNodes.length} node${selectedNodes.length !== 1 ? 's' : ''}`,
      'success'
    );
  }, [currentNodes, currentEdges, showToast]);

  const handlePaste = useCallback(() => {
    if (!clipboard || !clipboard.nodes || clipboard.nodes.length === 0) {
      showToast('Nothing to paste', 'warning');
      return;
    }

    const timestamp = Date.now();
    const offset = 50;
    const idMap = new Map<string, string>();

    const pastedNodes = clipboard.nodes.map(node => {
      const newId = `${node.id}-paste-${timestamp}`;
      idMap.set(node.id, newId);
      return {
        ...node,
        id: newId,
        position: {
          x: (node.position?.x || 100) + offset,
          y: (node.position?.y || 100) + offset
        },
        selected: true
      };
    });

    // Map and filter edges in a single pass
    const pastedEdges: Edge[] = [];
    for (const edge of clipboard.edges) {
      const newSource = idMap.get(edge.source);
      const newTarget = idMap.get(edge.target);

      if (newSource && newTarget) {
        pastedEdges.push({
          ...edge,
          id: `${edge.id}-paste-${timestamp}`,
          source: newSource,
          target: newTarget
        });
      }
    }

    // Deselect existing nodes and add pasted ones
    const allNodes = currentNodes
      .map(n => ({ ...n, selected: false }))
      .concat(pastedNodes);
    const allEdges = [...currentEdges, ...pastedEdges];

    onNodesChange(allNodes);
    onEdgesChange(allEdges);
    onEditorKeyChange(prev => prev + 1);

    setTimeout(() => {
      addToHistory(allNodes, allEdges);
    }, 100);

    showToast(
      `Pasted ${pastedNodes.length} node${pastedNodes.length !== 1 ? 's' : ''}`,
      'success'
    );
  }, [
    clipboard,
    currentNodes,
    currentEdges,
    onNodesChange,
    onEdgesChange,
    onEditorKeyChange,
    addToHistory,
    showToast
  ]);

  useEffect(() => {
    // Skip if we're applying history (undo/redo)
    if (isApplyingHistory.current) {
      prevNodesRef.current = currentNodes;
      prevEdgesRef.current = currentEdges;
      return;
    }

    // Skip if no actual changes
    const nodesChanged =
      JSON.stringify(prevNodesRef.current) !== JSON.stringify(currentNodes);
    const edgesChanged =
      JSON.stringify(prevEdgesRef.current) !== JSON.stringify(currentEdges);

    if (!nodesChanged && !edgesChanged) {
      return;
    }

    // Clear existing timeout
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }

    // Debounce history updates to avoid too many entries
    changeTimeoutRef.current = setTimeout(() => {
      // Don't add to history if we're in the middle of undo/redo
      const currentState = history[historyIndex];
      const isUndoRedo =
        currentState &&
        JSON.stringify(currentState.nodes) === JSON.stringify(currentNodes) &&
        JSON.stringify(currentState.edges) === JSON.stringify(currentEdges);

      if (
        !isUndoRedo &&
        (currentNodes.length > 0 ||
          currentEdges.length > 0 ||
          history.length === 1)
      ) {
        // Include ALL node data including positions and other properties
        addToHistory(currentNodes, currentEdges);
      }

      prevNodesRef.current = currentNodes;
      prevEdgesRef.current = currentEdges;
    }, 500); // 500ms debounce

    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, [currentNodes, currentEdges, addToHistory, history, historyIndex]);

  return {
    history,
    historyIndex,
    addToHistory,
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    hasSelection: currentNodes.some(n => n.selected)
  };
};

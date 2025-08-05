import { useCallback, useState } from 'react';
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
  const [history, setHistory] = useState<HistoryState[]>([{ nodes: [], edges: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [clipboard, setClipboard] = useState<HistoryState | null>(null);

  const addToHistory = useCallback((nodes: Node[], edges: Edge[]) => {
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
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      onNodesChange([...state.nodes]);
      onEdgesChange([...state.edges]);
      setHistoryIndex(newIndex);
      onEditorKeyChange(prev => prev + 1);
    }
  }, [history, historyIndex, onNodesChange, onEdgesChange, onEditorKeyChange]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      onNodesChange([...state.nodes]);
      onEdgesChange([...state.edges]);
      setHistoryIndex(newIndex);
      onEditorKeyChange(prev => prev + 1);
    }
  }, [history, historyIndex, onNodesChange, onEdgesChange, onEditorKeyChange]);

  const handleCopy = useCallback(() => {
    const selectedNodes = currentNodes.filter(n => n.selected);
    
    if (selectedNodes.length === 0) {
      showToast('No nodes selected', 'warning');
      return;
    }
    
    // Optimize with Set for O(1) lookup
    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
    const selectedEdges = currentEdges.filter(e => 
      selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
    );
    
    setClipboard({ 
      nodes: JSON.parse(JSON.stringify(selectedNodes)), 
      edges: JSON.parse(JSON.stringify(selectedEdges))
    });
    showToast(`Copied ${selectedNodes.length} node${selectedNodes.length !== 1 ? 's' : ''}`, 'success');
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
    const allNodes = currentNodes.map(n => ({ ...n, selected: false })).concat(pastedNodes);
    const allEdges = [...currentEdges, ...pastedEdges];
    
    onNodesChange(allNodes);
    onEdgesChange(allEdges);
    onEditorKeyChange(prev => prev + 1);
    
    setTimeout(() => {
      addToHistory(allNodes, allEdges);
    }, 100);
    
    showToast(`Pasted ${pastedNodes.length} node${pastedNodes.length !== 1 ? 's' : ''}`, 'success');
  }, [clipboard, currentNodes, currentEdges, onNodesChange, onEdgesChange, onEditorKeyChange, addToHistory, showToast]);

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
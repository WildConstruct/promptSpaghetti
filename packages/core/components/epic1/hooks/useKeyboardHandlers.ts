import { useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import type { EditableNodeData } from '../nodes';

interface UseKeyboardHandlersProps {
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
  setNodes: (
    nodes:
      | Node<EditableNodeData>[]
      | ((nodes: Node<EditableNodeData>[]) => Node<EditableNodeData>[])
  ) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  onTogglePreview?: () => void;
}

export function useKeyboardHandlers({
  nodes,
  edges,
  setNodes,
  setEdges,
  showToast,
  onTogglePreview
}: UseKeyboardHandlersProps) {
  const handleSave = useCallback(() => {
    const graphData = { nodes, edges };
    localStorage.setItem('epic1-graph', JSON.stringify(graphData));
    showToast('success', 'Graph saved!');
  }, [nodes, edges, showToast]);

  const handleLoad = useCallback(() => {
    const saved = localStorage.getItem('epic1-graph');
    if (saved) {
      const { nodes: loadedNodes, edges: loadedEdges } = JSON.parse(saved);
      setNodes(loadedNodes);
      setEdges(loadedEdges);
      showToast('success', 'Graph loaded!');
    } else {
      showToast('info', 'No saved graph found');
    }
  }, [setNodes, setEdges, showToast]);

  const handleExport = useCallback(() => {
    const graphData = { nodes, edges };
    const blob = new Blob([JSON.stringify(graphData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Graph exported!');
  }, [nodes, edges, showToast]);

  const handleDelete = useCallback(
    (nodesToDelete?: Node[]) => {
      const targetNodes = nodesToDelete || nodes.filter(n => n.selected);

      if (targetNodes.length === 0) {
        return;
      }

      const nodeIds = targetNodes.map(n => n.id);
      setNodes(nds => nds.filter(n => !nodeIds.includes(n.id)));
      setEdges(eds =>
        eds.filter(
          e => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)
        )
      );
      showToast('info', `Deleted ${nodeIds.length} node(s)`);
    },
    [nodes, setNodes, setEdges, showToast]
  );

  const handleDuplicate = useCallback(
    (nodesToDuplicate: Node[]) => {
      const newNodes = nodesToDuplicate.map(node => ({
        ...node,
        id: `${node.id}-copy-${Date.now()}`,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50
        },
        selected: false
      }));
      setNodes(nds => [...nds, ...newNodes]);
      showToast('success', `Duplicated ${newNodes.length} node(s)`);
    },
    [setNodes, showToast]
  );

  const handleSelectAll = useCallback(() => {
    setNodes(nds => nds.map(n => ({ ...n, selected: true })));
  }, [setNodes]);

  // Direct keyboard handler for delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }

        event.preventDefault();
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          handleDelete(selectedNodes);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nodes, handleDelete]);

  return {
    handleSave,
    handleLoad,
    handleExport,
    handleDelete,
    handleDuplicate,
    handleSelectAll,
    keyboardHandlers: {
      onSave: handleSave,
      onLoad: handleLoad,
      onExport: handleExport,
      onDelete: handleDelete,
      onDuplicate: handleDuplicate,
      onSelectAll: handleSelectAll,
      additionalHandlers: onTogglePreview
        ? {
            p: onTogglePreview,
            P: onTogglePreview
          }
        : {}
    }
  };
}

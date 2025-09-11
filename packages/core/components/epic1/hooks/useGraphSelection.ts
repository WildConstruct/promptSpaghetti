import { useCallback, useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';

interface UseGraphSelectionOptions {
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
  onSelectionChange?: (selectedNodes: Node[], selectedEdges: Edge[]) => void;
}

/**
 * Custom hook for managing graph selection state and operations
 */
export function useGraphSelection<NodeData = unknown>(
  nodes: Node<NodeData>[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  options: UseGraphSelectionOptions = {}
) {
  const { showToast, onSelectionChange } = options;

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(
    new Set()
  );
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  // Update selected IDs when nodes/edges change
  useEffect(() => {
    const newSelectedNodeIds = new Set(
      nodes.filter(n => n.selected).map(n => n.id)
    );
    const newSelectedEdgeIds = new Set(
      edges.filter(e => e.selected).map(e => e.id)
    );

    setSelectedNodeIds(newSelectedNodeIds);
    setSelectedEdgeIds(newSelectedEdgeIds);

    // Notify parent of selection changes
    if (onSelectionChange) {
      const selectedNodes = nodes.filter(n => n.selected);
      const selectedEdges = edges.filter(e => e.selected);
      onSelectionChange(selectedNodes, selectedEdges);
    }
  }, [nodes, edges, onSelectionChange]);

  // Select all nodes and edges
  const selectAll = useCallback(() => {
    setNodes(nds => nds.map(n => ({ ...n, selected: true })));
    setEdges(eds => eds.map(e => ({ ...e, selected: true })));
    showToast?.(
      'info',
      `Selected ${nodes.length} nodes and ${edges.length} edges`
    );
  }, [setNodes, setEdges, nodes.length, edges.length, showToast]);

  // Deselect all nodes and edges
  const deselectAll = useCallback(() => {
    setNodes(nds => nds.map(n => ({ ...n, selected: false })));
    setEdges(eds => eds.map(e => ({ ...e, selected: false })));
    setSelectedNodeId(null);
    showToast?.('info', 'Selection cleared');
  }, [setNodes, setEdges, showToast]);

  // Select nodes by IDs
  const selectNodesByIds = useCallback(
    (nodeIds: string[], exclusive = true) => {
      setNodes(nds =>
        nds.map(n => ({
          ...n,
          selected: nodeIds.includes(n.id) || (!exclusive && n.selected)
        }))
      );

      if (nodeIds.length === 1) {
        setSelectedNodeId(nodeIds[0]);
      }

      showToast?.('info', `Selected ${nodeIds.length} nodes`);
    },
    [setNodes, showToast]
  );

  // Select edges by IDs
  const selectEdgesByIds = useCallback(
    (edgeIds: string[], exclusive = true) => {
      setEdges(eds =>
        eds.map(e => ({
          ...e,
          selected: edgeIds.includes(e.id) || (!exclusive && e.selected)
        }))
      );
      showToast?.('info', `Selected ${edgeIds.length} edges`);
    },
    [setEdges, showToast]
  );

  // Toggle node selection
  const toggleNodeSelection = useCallback(
    (nodeId: string) => {
      setNodes(nds =>
        nds.map(n => {
          if (n.id === nodeId) {
            const newSelected = !n.selected;
            if (newSelected) {
              setSelectedNodeId(nodeId);
            } else if (selectedNodeId === nodeId) {
              setSelectedNodeId(null);
            }
            return { ...n, selected: newSelected };
          }
          return n;
        })
      );
    },
    [setNodes, selectedNodeId]
  );

  // Toggle edge selection
  const toggleEdgeSelection = useCallback(
    (edgeId: string) => {
      setEdges(eds =>
        eds.map(e => {
          if (e.id === edgeId) {
            return { ...e, selected: !e.selected };
          }
          return e;
        })
      );
    },
    [setEdges]
  );

  // Select connected nodes
  const selectConnectedNodes = useCallback(
    (nodeId: string, direction: 'all' | 'upstream' | 'downstream' = 'all') => {
      const connectedIds = new Set<string>();
      connectedIds.add(nodeId);

      const traverse = (currentId: string, visited = new Set<string>()) => {
        if (visited.has(currentId)) return;
        visited.add(currentId);

        edges.forEach(edge => {
          if (direction !== 'downstream' && edge.target === currentId) {
            connectedIds.add(edge.source);
            traverse(edge.source, visited);
          }
          if (direction !== 'upstream' && edge.source === currentId) {
            connectedIds.add(edge.target);
            traverse(edge.target, visited);
          }
        });
      };

      traverse(nodeId);

      setNodes(nds =>
        nds.map(n => ({
          ...n,
          selected: connectedIds.has(n.id)
        }))
      );

      showToast?.('info', `Selected ${connectedIds.size} connected nodes`);
    },
    [edges, setNodes, showToast]
  );

  // Invert selection
  const invertSelection = useCallback(() => {
    setNodes(nds => nds.map(n => ({ ...n, selected: !n.selected })));
    setEdges(eds => eds.map(e => ({ ...e, selected: !e.selected })));
    showToast?.('info', 'Selection inverted');
  }, [setNodes, setEdges, showToast]);

  // Select nodes by type
  const selectNodesByType = useCallback(
    (type: string) => {
      const matchingNodes = nodes.filter(n => n.type === type);
      setNodes(nds =>
        nds.map(n => ({
          ...n,
          selected: n.type === type
        }))
      );
      showToast?.('info', `Selected ${matchingNodes.length} ${type} nodes`);
    },
    [nodes, setNodes, showToast]
  );

  // Box selection handlers
  const startBoxSelection = useCallback((x: number, y: number) => {
    setIsSelecting(true);
    setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
  }, []);

  const updateBoxSelection = useCallback(
    (x: number, y: number) => {
      if (!isSelecting || !selectionBox) return;
      setSelectionBox({ ...selectionBox, endX: x, endY: y });
    },
    [isSelecting, selectionBox]
  );

  const endBoxSelection = useCallback(() => {
    if (!isSelecting || !selectionBox) return;

    // Calculate selection bounds
    const minX = Math.min(selectionBox.startX, selectionBox.endX);
    const maxX = Math.max(selectionBox.startX, selectionBox.endX);
    const minY = Math.min(selectionBox.startY, selectionBox.endY);
    const maxY = Math.max(selectionBox.startY, selectionBox.endY);

    // Select nodes within bounds
    setNodes(nds =>
      nds.map(n => {
        const nodeX = n.position.x;
        const nodeY = n.position.y;
        const nodeWidth = n.width || 100;
        const nodeHeight = n.height || 50;

        const inBounds =
          nodeX + nodeWidth >= minX &&
          nodeX <= maxX &&
          nodeY + nodeHeight >= minY &&
          nodeY <= maxY;

        return { ...n, selected: inBounds };
      })
    );

    setIsSelecting(false);
    setSelectionBox(null);
  }, [isSelecting, selectionBox, setNodes]);

  // Get selection info
  const getSelectionInfo = useCallback(() => {
    const selectedNodes = nodes.filter(n => n.selected);
    const selectedEdges = edges.filter(e => e.selected);

    return {
      nodeCount: selectedNodes.length,
      edgeCount: selectedEdges.length,
      nodeTypes: [...new Set(selectedNodes.map(n => n.type))],
      hasSelection: selectedNodes.length > 0 || selectedEdges.length > 0
    };
  }, [nodes, edges]);

  return {
    // State
    selectedNodeId,
    selectedNodeIds,
    selectedEdgeIds,
    isSelecting,
    selectionBox,

    // Selection operations
    selectAll,
    deselectAll,
    selectNodesByIds,
    selectEdgesByIds,
    toggleNodeSelection,
    toggleEdgeSelection,
    selectConnectedNodes,
    invertSelection,
    selectNodesByType,

    // Box selection
    startBoxSelection,
    updateBoxSelection,
    endBoxSelection,

    // Utilities
    getSelectionInfo,
    setSelectedNodeId
  };
}

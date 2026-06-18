import { useCallback, useState } from 'react';
import { Node, Edge, Connection, addEdge, ReactFlowInstance } from 'reactflow';
import {
  createNodeId as sharedCreateNodeId,
  getDefaultNodeData
} from '../utils/nodeDefaults';

interface UseNodeOperationsOptions {
  onNodeSelect?: (nodeId: string | null) => void;
  onNodeCreate?: (node: Node) => void;
  onNodeDelete?: (nodeIds: string[]) => void;
  onEdgeCreate?: (edge: Edge) => void;
  onEdgeDelete?: (edgeIds: string[]) => void;
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

/**
 * Custom hook for managing all node CRUD operations
 */
export function useNodeOperations<NodeData = unknown>(
  nodes: Node<NodeData>[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  reactFlowInstance: ReactFlowInstance | null,
  options: UseNodeOperationsOptions = {}
) {
  const {
    onNodeSelect,
    onNodeCreate,
    onNodeDelete,
    onEdgeCreate,
    onEdgeDelete,
    showToast
  } = options;

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(
    new Set()
  );

  // Generate unique node ID (shared implementation)
  const createNodeId = useCallback(
    (type?: string) => sharedCreateNodeId(type),
    []
  );

  // Handle node data updates (for inline editing)
  const handleNodeEdit = useCallback(
    (nodeId: string, newValue: string) => {
      setNodes(nds =>
        nds.map(node => {
          if (node.id === nodeId) {
            // For concat nodes, try to parse structured config JSON
            const concatExtras: Record<string, unknown> =
              node.type === 'concat'
                ? (() => {
                  try {
                    const parsed = JSON.parse(newValue) as Record<string, unknown>;
                    if (parsed && typeof parsed === 'object' && 'separator' in parsed) {
                      return {
                        separator: String(parsed.separator ?? ''),
                        joinStyle: parsed.joinStyle,
                        dedupe: parsed.dedupe === true
                      };
                    }
                  } catch {
                    // Not JSON — treat as plain separator string (legacy)
                  }
                  return { separator: newValue };
                })()
                : {};

            return {
              ...node,
              data: {
                ...node.data,
                value: node.type === 'concat'
                  ? String(concatExtras.separator ?? newValue)
                  : newValue,
                text: newValue, // For TextBlock nodes
                variableName: newValue, // For Variable nodes
                separator: node.type === 'concat'
                  ? String(concatExtras.separator ?? newValue)
                  : newValue, // For Concat nodes
                label: newValue, // For Output nodes
                ...(node.type === 'concat' ? concatExtras : {}),
                // For WeightedChoice nodes, parse the JSON
                options:
                  node.type === 'weightedChoice'
                    ? (() => {
                      try {
                        return JSON.parse(newValue);
                      } catch {
                        return (node.data as { options?: unknown })?.options;
                      }
                    })()
                    : (node.data as { options?: unknown })?.options
              }
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Create node at position
  const createNode = useCallback(
    (
      type: string,
      position: { x: number; y: number },
      data?: Partial<NodeData>
    ): Node<NodeData> => {
      const nodeId = createNodeId(type);
      const newNode: Node<NodeData> = {
        id: nodeId,
        type,
        position,
        data: {
          ...getDefaultNodeData(type),
          ...data
        } as NodeData
      };

      setNodes(nds => [...nds, newNode]);
      onNodeCreate?.(newNode);
      showToast?.('success', `Created ${type} node`);

      return newNode;
    },
    [createNodeId, setNodes, onNodeCreate, showToast]
  );

  // Add node with animation
  const addNodeWithAnimation = useCallback(
    (node: Node<NodeData>, animate = true) => {
      const enhancedNode = {
        ...node,
        data: {
          ...node.data,
          animated: animate
        }
      };

      setNodes(nds => [...nds, enhancedNode]);
      onNodeCreate?.(enhancedNode);

      // Remove animation after a delay
      if (animate) {
        setTimeout(() => {
          setNodes(nds =>
            nds.map(n =>
              n.id === node.id
                ? { ...n, data: { ...n.data, animated: false } }
                : n
            )
          );
        }, 500);
      }

      return enhancedNode;
    },
    [setNodes, onNodeCreate]
  );

  // Duplicate selected nodes
  const duplicateNodes = useCallback(() => {
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.length === 0) {
      showToast?.('info', 'Select nodes to duplicate');
      return;
    }

    const nodeIdMap = new Map<string, string>();
    const newNodes: Node<NodeData>[] = [];

    // Create duplicates with offset
    selectedNodes.forEach(node => {
      const newId = createNodeId(node.type);
      nodeIdMap.set(node.id, newId);

      newNodes.push({
        ...node,
        id: newId,
        position: {
          x: node.position.x + 100,
          y: node.position.y + 100
        },
        selected: false
      });
    });

    // Duplicate edges between selected nodes
    const newEdges: Edge[] = [];
    edges.forEach(edge => {
      const newSource = nodeIdMap.get(edge.source);
      const newTarget = nodeIdMap.get(edge.target);

      if (newSource && newTarget) {
        newEdges.push({
          ...edge,
          id: `${newSource}-${newTarget}-${Date.now()}`,
          source: newSource,
          target: newTarget
        });
      }
    });

    setNodes(nds => [...nds, ...newNodes]);
    setEdges(eds => [...eds, ...newEdges]);

    showToast?.('success', `Duplicated ${newNodes.length} nodes`);
  }, [nodes, edges, setNodes, setEdges, createNodeId, showToast]);

  // Disconnect node(s): remove every edge touching the given nodes (or the
  // current selection), but keep the nodes themselves. Convention follows
  // node tools' "break all links" (Unreal) / right-click disconnect (n8n).
  const disconnectNodes = useCallback(
    (nodeIds?: string[]) => {
      const targetIds =
        nodeIds && nodeIds.length > 0
          ? nodeIds
          : nodes.filter(n => n.selected).map(n => n.id);
      if (targetIds.length === 0) {
        showToast?.('info', 'Select a node to disconnect');
        return;
      }

      const targetSet = new Set(targetIds);
      const removedEdgeIds: string[] = [];
      setEdges(eds =>
        eds.filter(e => {
          const touches = targetSet.has(e.source) || targetSet.has(e.target);
          if (touches) {
            removedEdgeIds.push(e.id);
          }
          return !touches;
        })
      );

      if (removedEdgeIds.length > 0) {
        onEdgeDelete?.(removedEdgeIds);
        showToast?.(
          'info',
          `Disconnected ${removedEdgeIds.length} link${removedEdgeIds.length === 1 ? '' : 's'}`
        );
      } else {
        showToast?.('info', 'No links to disconnect');
      }
    },
    [nodes, setEdges, onEdgeDelete, showToast]
  );

  // Delete selected nodes
  const deleteSelectedNodes = useCallback(() => {
    const nodesToDelete = nodes.filter(n => n.selected).map(n => n.id);
    if (nodesToDelete.length === 0) { return; }

    setNodes(nds => nds.filter(n => !nodesToDelete.includes(n.id)));
    setEdges(eds =>
      eds.filter(
        e =>
          !nodesToDelete.includes(e.source) && !nodesToDelete.includes(e.target)
      )
    );

    onNodeDelete?.(nodesToDelete);
    showToast?.('info', `Deleted ${nodesToDelete.length} nodes`);
  }, [nodes, setNodes, setEdges, onNodeDelete, showToast]);

  // Handle node selection
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation();
      setSelectedNodeId(node.id);
      onNodeSelect?.(node.id);
    },
    [onNodeSelect]
  );

  // Handle pane click (deselect)
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  // Handle connection creation with single-input constraint
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(eds => {
        // Check if target already has an incoming connection
        const existingIncomingEdge = eds.find(
          e =>
            e.target === params.target && e.targetHandle === params.targetHandle
        );

        let newEdges = eds;
        if (existingIncomingEdge) {
          // Replace the existing incoming connection
          newEdges = eds.filter(e => e.id !== existingIncomingEdge.id);
          showToast?.('info', 'Replaced existing connection');
        }

        // Add the new edge
        const edgeParams = {
          ...params,
          id: `${params.source || 'unknown'}-${params.target || 'unknown'}-${Date.now()}`,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#9ca3af', strokeWidth: 3 }
        };

        const finalEdges = addEdge(edgeParams, newEdges);
        onEdgeCreate?.(edgeParams as Edge);

        return finalEdges;
      });
    },
    [setEdges, onEdgeCreate, showToast]
  );

  // Handle nodes deletion
  const onNodesDelete = useCallback(
    (nodesToDelete: Node[]) => {
      const nodeIds = nodesToDelete.map(n => n.id);
      onNodeDelete?.(nodeIds);
    },
    [onNodeDelete]
  );

  // Handle edges deletion
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      const edgeIds = edgesToDelete.map(e => e.id);
      onEdgeDelete?.(edgeIds);
    },
    [onEdgeDelete]
  );

  // Align selected nodes
  const alignNodes = useCallback(
    (direction: 'horizontal' | 'vertical') => {
      const selectedNodes = nodes.filter(n => n.selected);
      if (selectedNodes.length < 2) {
        showToast?.('info', 'Select at least 2 nodes to align');
        return;
      }

      const firstNode = selectedNodes[0];
      const alignment =
        direction === 'horizontal'
          ? firstNode.position.y
          : firstNode.position.x;

      setNodes(nds =>
        nds.map(node => {
          if (node.selected) {
            return {
              ...node,
              position: {
                x: direction === 'vertical' ? alignment : node.position.x,
                y: direction === 'horizontal' ? alignment : node.position.y
              }
            };
          }
          return node;
        })
      );

      showToast?.('success', `Aligned ${selectedNodes.length} nodes`);
    },
    [nodes, setNodes, showToast]
  );

  // Distribute nodes evenly
  const distributeNodes = useCallback(
    (direction: 'horizontal' | 'vertical') => {
      const selectedNodes = nodes.filter(n => n.selected);
      if (selectedNodes.length < 3) {
        showToast?.('info', 'Select at least 3 nodes to distribute');
        return;
      }

      // Sort nodes by position
      const sorted = [...selectedNodes].sort((a, b) =>
        direction === 'horizontal'
          ? a.position.x - b.position.x
          : a.position.y - b.position.y
      );

      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const gap =
        direction === 'horizontal'
          ? (last.position.x - first.position.x) / (sorted.length - 1)
          : (last.position.y - first.position.y) / (sorted.length - 1);

      setNodes(nds =>
        nds.map(node => {
          const index = sorted.findIndex(n => n.id === node.id);
          if (index > 0 && index < sorted.length - 1) {
            return {
              ...node,
              position: {
                x:
                  direction === 'horizontal'
                    ? first.position.x + gap * index
                    : node.position.x,
                y:
                  direction === 'vertical'
                    ? first.position.y + gap * index
                    : node.position.y
              }
            };
          }
          return node;
        })
      );

      showToast?.('success', `Distributed ${selectedNodes.length} nodes`);
    },
    [nodes, setNodes, showToast]
  );

  return {
    // State
    selectedNodeId,
    selectedNodeIds,
    selectedEdgeIds,

    // Node operations
    createNodeId,
    createNode,
    handleNodeEdit,
    addNodeWithAnimation,
    duplicateNodes,
    disconnectNodes,
    deleteSelectedNodes,
    alignNodes,
    distributeNodes,

    // Selection
    handleNodeClick,
    handlePaneClick,
    setSelectedNodeId,
    setSelectedNodeIds,
    setSelectedEdgeIds,

    // Connection
    onConnect,
    onNodesDelete,
    onEdgesDelete
  };
}

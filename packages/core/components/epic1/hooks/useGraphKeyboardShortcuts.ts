import { useEffect, useCallback, useMemo } from 'react';
import { Node, Edge, ReactFlowInstance } from 'reactflow';
import { createNodeId } from '../utils/nodeDefaults';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
}

interface UseGraphKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts?: KeyboardShortcut[];
}

/**
 * Custom hook for managing keyboard shortcuts in the graph editor
 */
export function useGraphKeyboardShortcuts(
  // Core functions
  undo: () => void,
  redo: () => void,
  deleteSelectedNodes: () => void,
  duplicateNodes: () => void,
  selectAll: () => void,
  deselectAll: () => void,

  // State
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,

  // Utils
  reactFlowInstance: ReactFlowInstance | null,
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void,

  // Options
  options: UseGraphKeyboardShortcutsOptions = {}
) {
  const { enabled = true, shortcuts: customShortcuts = [] } = options;

  // Copy selected nodes to clipboard
  const copySelectedNodes = useCallback(() => {
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.length === 0) {
      showToast?.('info', 'No nodes selected to copy');
      return;
    }

    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
    const relevantEdges = edges.filter(
      e => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
    );

    const clipboardData = {
      nodes: selectedNodes,
      edges: relevantEdges,
      timestamp: Date.now()
    };

    localStorage.setItem('graph-clipboard', JSON.stringify(clipboardData));
    showToast?.('success', `Copied ${selectedNodes.length} nodes`);
  }, [nodes, edges, showToast]);

  // Cut selected nodes
  const cutSelectedNodes = useCallback(() => {
    copySelectedNodes();
    deleteSelectedNodes();
  }, [copySelectedNodes, deleteSelectedNodes]);

  // Paste from clipboard
  const pasteFromClipboard = useCallback(() => {
    const clipboardStr = localStorage.getItem('graph-clipboard');
    if (!clipboardStr) {
      showToast?.('info', 'Clipboard is empty');
      return;
    }

    try {
      const clipboard = JSON.parse(clipboardStr);
      const { nodes: clipNodes, edges: clipEdges } = clipboard;

      // Create ID mapping for pasted nodes
      const idMap = new Map<string, string>();
      const pastedNodes: Node[] = [];

      // Get paste position (center of viewport or mouse position)
      const viewportCenter = reactFlowInstance
        ? reactFlowInstance.getViewport()
        : { x: 0, y: 0, zoom: 1 };

      const centerX =
        window.innerWidth / 2 / viewportCenter.zoom - viewportCenter.x;
      const centerY =
        window.innerHeight / 2 / viewportCenter.zoom - viewportCenter.y;

      // Calculate bounding box of copied nodes
      const minX = Math.min(...clipNodes.map((n: Node) => n.position.x));
      const minY = Math.min(...clipNodes.map((n: Node) => n.position.y));

      // Paste nodes with offset
      clipNodes.forEach((node: Node) => {
        const newId = createNodeId(
          typeof node.type === 'string' ? node.type : undefined
        );
        idMap.set(node.id, newId);

        pastedNodes.push({
          ...node,
          id: newId,
          position: {
            x: centerX + (node.position.x - minX),
            y: centerY + (node.position.y - minY)
          },
          selected: true
        });
      });

      // Paste edges with new IDs
      const pastedEdges: Edge[] = [];
      clipEdges.forEach((edge: Edge) => {
        const newSource = idMap.get(edge.source);
        const newTarget = idMap.get(edge.target);

        if (newSource && newTarget) {
          pastedEdges.push({
            ...edge,
            id: `${newSource}-${newTarget}-${Date.now()}`,
            source: newSource,
            target: newTarget
          });
        }
      });

      // Deselect existing nodes
      setNodes(nds => [
        ...nds.map(n => ({ ...n, selected: false })),
        ...pastedNodes
      ]);
      setEdges(eds => [...eds, ...pastedEdges]);

      showToast?.('success', `Pasted ${pastedNodes.length} nodes`);
    } catch (error) {
      console.error('Failed to paste:', error);
      showToast?.('error', 'Failed to paste from clipboard');
    }
  }, [reactFlowInstance, setNodes, setEdges, showToast]);

  // Save graph
  const saveGraph = useCallback(() => {
    const graphData = {
      nodes,
      edges,
      timestamp: Date.now()
    };

    const blob = new Blob([JSON.stringify(graphData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast?.('success', 'Graph saved to file');
  }, [nodes, edges, showToast]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn();
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut();
  }, [reactFlowInstance]);

  const fitView = useCallback(() => {
    reactFlowInstance?.fitView();
  }, [reactFlowInstance]);

  // Default shortcuts - memoized to avoid re-creating on every render
  const defaultShortcuts: KeyboardShortcut[] = useMemo(
    () => [
      // File operations
      { key: 's', meta: true, action: saveGraph, description: 'Save graph' },

      // Edit operations. Register both Cmd (meta) and Ctrl variants so undo/redo
      // work on macOS and Windows. Redo (with shift) is listed BEFORE undo so
      // Ctrl/Cmd+Shift+Z isn't captured by the no-shift undo entry — modifier
      // matching treats an unset `shift` as "don't care", so order decides.
      { key: 'z', meta: true, shift: true, action: redo, description: 'Redo' },
      { key: 'z', ctrl: true, shift: true, action: redo, description: 'Redo (Windows)' },
      { key: 'y', ctrl: true, action: redo, description: 'Redo (Windows)' },
      { key: 'z', meta: true, action: undo, description: 'Undo' },
      { key: 'z', ctrl: true, action: undo, description: 'Undo (Windows)' },

      // Selection
      { key: 'a', meta: true, action: selectAll, description: 'Select all' },
      {
        key: 'a',
        ctrl: true,
        action: selectAll,
        description: 'Select all (Windows)'
      },
      { key: 'Escape', action: deselectAll, description: 'Deselect all' },

      // Clipboard
      { key: 'c', meta: true, action: copySelectedNodes, description: 'Copy' },
      {
        key: 'c',
        ctrl: true,
        action: copySelectedNodes,
        description: 'Copy (Windows)'
      },
      { key: 'x', meta: true, action: cutSelectedNodes, description: 'Cut' },
      {
        key: 'x',
        ctrl: true,
        action: cutSelectedNodes,
        description: 'Cut (Windows)'
      },
      {
        key: 'v',
        meta: true,
        action: pasteFromClipboard,
        description: 'Paste'
      },
      {
        key: 'v',
        ctrl: true,
        action: pasteFromClipboard,
        description: 'Paste (Windows)'
      },

      // Node operations
      {
        key: 'd',
        meta: true,
        action: duplicateNodes,
        description: 'Duplicate'
      },
      {
        key: 'd',
        ctrl: true,
        action: duplicateNodes,
        description: 'Duplicate (Windows)'
      },
      { key: 'Delete', action: deleteSelectedNodes, description: 'Delete' },
      {
        key: 'Backspace',
        action: deleteSelectedNodes,
        description: 'Delete (Mac)'
      },

      // View controls
      { key: '=', meta: true, action: zoomIn, description: 'Zoom in' },
      { key: '+', meta: true, action: zoomIn, description: 'Zoom in' },
      { key: '-', meta: true, action: zoomOut, description: 'Zoom out' },
      { key: '0', meta: true, action: fitView, description: 'Fit to view' },

      // Custom shortcuts
      ...customShortcuts
    ],
    [
      saveGraph,
      undo,
      redo,
      selectAll,
      deselectAll,
      copySelectedNodes,
      cutSelectedNodes,
      pasteFromClipboard,
      duplicateNodes,
      deleteSelectedNodes,
      zoomIn,
      zoomOut,
      fitView,
      customShortcuts
    ]
  );

  // Handle keyboard events
  useEffect(() => {
    if (!enabled) {return;}

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if typing in input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      // Check each shortcut
      for (const shortcut of defaultShortcuts) {
        const keyMatch =
          event.key === shortcut.key || event.code === shortcut.key;
        const ctrlMatch = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !shortcut.ctrl || true;
        const metaMatch = shortcut.meta
          ? event.metaKey
          : !shortcut.meta || true;
        const shiftMatch = shortcut.shift
          ? event.shiftKey
          : !shortcut.shift || true;
        const altMatch = shortcut.alt ? event.altKey : !shortcut.alt || true;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
            event.stopPropagation();
          }
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, defaultShortcuts]);

  // Return utilities for external use
  return {
    copySelectedNodes,
    cutSelectedNodes,
    pasteFromClipboard,
    saveGraph,
    zoomIn,
    zoomOut,
    fitView,
    shortcuts: defaultShortcuts
  };
}

import { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';

interface HistoryEntry<N = unknown, E = unknown> {
  nodes: Node<N>[];
  edges: Edge<E>[];
  timestamp: number;
}

interface UseGraphHistoryOptions {
  maxHistorySize?: number;
  debounceMs?: number;
}

interface UseGraphHistoryReturn<N = unknown, E = unknown> {
  pushSnapshot: (nodes: Node<N>[], edges: Edge<E>[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historySize: number;
  currentIndex: number;
  clearHistory: () => void;
}

/**
 * Custom hook for managing graph history with undo/redo functionality
 */
export function useGraphHistory<N = unknown, E = unknown>(
  nodes: Node<N>[],
  edges: Edge<E>[],
  setNodes: (nodes: Node<N>[] | ((nodes: Node<N>[]) => Node<N>[])) => void,
  setEdges: (edges: Edge<E>[] | ((edges: Edge<E>[]) => Edge<E>[])) => void,
  options: UseGraphHistoryOptions = {}
): UseGraphHistoryReturn<N, E> {
  const { maxHistorySize = 50, debounceMs = 300 } = options;

  const [history, setHistory] = useState<HistoryEntry<N, E>[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const isInternalUpdateRef = useRef(false);

  // Push a new snapshot to history
  const pushSnapshot = useCallback(
    (nodesSnap: Node<N>[], edgesSnap: Edge<E>[]) => {
      // Skip if this is an internal update from undo/redo
      if (isInternalUpdateRef.current) {
        return;
      }

      // Clear any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the snapshot
      debounceTimerRef.current = setTimeout(() => {
        setHistory(prev => {
          // Remove any history after current index (branching)
          const base = historyIndex >= 0 ? prev.slice(0, historyIndex + 1) : [];
          const entry: HistoryEntry<N, E> = {
            nodes: JSON.parse(JSON.stringify(nodesSnap)), // Deep clone
            edges: JSON.parse(JSON.stringify(edgesSnap)), // Deep clone
            timestamp: Date.now()
          };
          const next = [...base, entry];

          // Limit history size
          if (next.length > maxHistorySize) {
            return next.slice(next.length - maxHistorySize);
          }
          return next;
        });

        setHistoryIndex(() => {
          const newLength = Math.min(history.length + 1, maxHistorySize);
          return newLength - 1;
        });
      }, debounceMs);
    },
    [historyIndex, history.length, maxHistorySize, debounceMs]
  );

  // Undo to previous state
  const undo = useCallback(() => {
    if (historyIndex <= 0 || history.length === 0) {return;}

    isInternalUpdateRef.current = true;
    const targetIndex = historyIndex - 1;
    const target = history[targetIndex];

    setNodes(target.nodes);
    setEdges(target.edges);
    setHistoryIndex(targetIndex);

    // Reset flag after React updates
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo to next state
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) {return;}

    isInternalUpdateRef.current = true;
    const targetIndex = historyIndex + 1;
    const target = history[targetIndex];

    setNodes(target.nodes);
    setEdges(target.edges);
    setHistoryIndex(targetIndex);

    // Reset flag after React updates
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
  }, [history, historyIndex, setNodes, setEdges]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  // Auto-snapshot when nodes/edges change
  useEffect(() => {
    // Skip empty graphs
    if ((nodes?.length || 0) + (edges?.length || 0) === 0) {return;}

    // Skip if this is an internal update
    if (isInternalUpdateRef.current) {return;}

    pushSnapshot(nodes, edges);
  }, [nodes, edges, pushSnapshot]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    pushSnapshot,
    undo,
    redo,
    canUndo: historyIndex > 0 && history.length > 0,
    canRedo: historyIndex < history.length - 1,
    historySize: history.length,
    currentIndex: historyIndex,
    clearHistory
  };
}

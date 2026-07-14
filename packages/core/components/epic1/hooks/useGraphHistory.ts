import { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';

export interface HistoryEntry<N = unknown, E = unknown> {
  nodes: Node<N>[];
  edges: Edge<E>[];
  timestamp: number;
}

export interface HistoryState<N = unknown, E = unknown> {
  entries: HistoryEntry<N, E>[];
  index: number;
}

interface UseGraphHistoryOptions {
  maxHistorySize?: number;
  debounceMs?: number;
}

interface UseGraphHistoryReturn<N = unknown, E = unknown> {
  pushSnapshot: (nodes: Node<N>[], edges: Edge<E>[]) => void;
  /** Immediate snapshot (no debounce) — use before saving a document session. */
  captureSnapshotNow: (nodes: Node<N>[], edges: Edge<E>[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historySize: number;
  currentIndex: number;
  clearHistory: () => void;
  /** Clone the full undo stack for per-document persistence. */
  exportHistory: () => HistoryState<N, E>;
  /**
   * Replace the undo stack (e.g. when switching Nested PSG compositions).
   * Does not apply nodes/edges — caller restores the graph separately.
   */
  importHistory: (snapshot: HistoryState<N, E> | null | undefined) => void;
  /**
   * Suppress auto-snapshots briefly after a document switch so applyGraph
   * does not merge two compositions into one stack.
   */
  suppressSnapshotsFor: (ms: number) => void;
}

/**
 * Undo/redo history for the graph.
 *
 * History entries and the current index are kept in a SINGLE state object and
 * mutated together, so they can never desync (an earlier implementation tracked
 * them as two separate `useState`s updated from stale closures, which made
 * `redo()` a no-op even when `canRedo` was true). `undo`/`redo` read the latest
 * state through a ref rather than a captured closure, and they cancel any
 * pending debounced snapshot so a late snapshot can't truncate the redo stack.
 */
export function useGraphHistory<N = unknown, E = unknown>(
  nodes: Node<N>[],
  edges: Edge<E>[],
  setNodes: (nodes: Node<N>[] | ((nodes: Node<N>[]) => Node<N>[])) => void,
  setEdges: (edges: Edge<E>[] | ((edges: Edge<E>[]) => Edge<E>[])) => void,
  options: UseGraphHistoryOptions = {}
): UseGraphHistoryReturn<N, E> {
  const { maxHistorySize = 50, debounceMs = 300 } = options;

  const [state, setState] = useState<HistoryState<N, E>>({
    entries: [],
    index: -1
  });
  // Mirror of `state` so undo/redo always read the current value, not a closure.
  const stateRef = useRef(state);
  stateRef.current = state;

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isInternalUpdateRef = useRef(false);
  /** Wall-clock until which auto/manual pushSnapshot is ignored. */
  const suppressUntilRef = useRef(0);

  const cancelPendingSnapshot = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = undefined;
    }
  }, []);

  const suppressSnapshotsFor = useCallback(
    (ms: number) => {
      cancelPendingSnapshot();
      suppressUntilRef.current = Date.now() + Math.max(0, ms);
    },
    [cancelPendingSnapshot]
  );

  // Push a new snapshot (debounced) onto the history, dropping any redo-able
  // future and capping the total size.
  const pushSnapshot = useCallback(
    (nodesSnap: Node<N>[], edgesSnap: Edge<E>[]) => {
      if (isInternalUpdateRef.current) {
        return;
      }
      if (Date.now() < suppressUntilRef.current) {
        return;
      }
      cancelPendingSnapshot();
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = undefined;
        // Re-check: an undo/redo may have started after this was scheduled.
        if (isInternalUpdateRef.current) {
          return;
        }
        if (Date.now() < suppressUntilRef.current) {
          return;
        }
        setState(prev => {
          const entry: HistoryEntry<N, E> = {
            nodes: JSON.parse(JSON.stringify(nodesSnap)),
            edges: JSON.parse(JSON.stringify(edgesSnap)),
            timestamp: Date.now()
          };

          // Skip if this is identical to the current entry (avoids piling up
          // no-op history from re-renders that don't change the graph).
          const current = prev.index >= 0 ? prev.entries[prev.index] : null;
          if (
            current &&
            JSON.stringify(current.nodes) === JSON.stringify(entry.nodes) &&
            JSON.stringify(current.edges) === JSON.stringify(entry.edges)
          ) {
            return prev;
          }

          let entries = [...prev.entries.slice(0, prev.index + 1), entry];
          if (entries.length > maxHistorySize) {
            entries = entries.slice(entries.length - maxHistorySize);
          }
          return { entries, index: entries.length - 1 };
        });
      }, debounceMs);
    },
    [cancelPendingSnapshot, maxHistorySize, debounceMs]
  );

  const captureSnapshotNow = useCallback(
    (nodesSnap: Node<N>[], edgesSnap: Edge<E>[]) => {
      if (isInternalUpdateRef.current) {
        return;
      }
      cancelPendingSnapshot();
      setState(prev => {
        const entry: HistoryEntry<N, E> = {
          nodes: JSON.parse(JSON.stringify(nodesSnap)),
          edges: JSON.parse(JSON.stringify(edgesSnap)),
          timestamp: Date.now()
        };
        const current = prev.index >= 0 ? prev.entries[prev.index] : null;
        if (
          current &&
          JSON.stringify(current.nodes) === JSON.stringify(entry.nodes) &&
          JSON.stringify(current.edges) === JSON.stringify(entry.edges)
        ) {
          return prev;
        }
        let entries = [...prev.entries.slice(0, prev.index + 1), entry];
        if (entries.length > maxHistorySize) {
          entries = entries.slice(entries.length - maxHistorySize);
        }
        return { entries, index: entries.length - 1 };
      });
    },
    [cancelPendingSnapshot, maxHistorySize]
  );

  const restoreTo = useCallback(
    (target: HistoryEntry<N, E>, nextIndex: number) => {
      cancelPendingSnapshot();
      isInternalUpdateRef.current = true;
      setNodes(target.nodes);
      setEdges(target.edges);
      setState(prev => ({ ...prev, index: nextIndex }));
      // Release the guard after React has applied the setNodes/setEdges and the
      // auto-snapshot effect has run (and skipped).
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 0);
    },
    [cancelPendingSnapshot, setNodes, setEdges]
  );

  const undo = useCallback(() => {
    const { entries, index } = stateRef.current;
    if (index <= 0 || entries.length === 0) {
      return;
    }
    restoreTo(entries[index - 1], index - 1);
  }, [restoreTo]);

  const redo = useCallback(() => {
    const { entries, index } = stateRef.current;
    if (index >= entries.length - 1) {
      return;
    }
    restoreTo(entries[index + 1], index + 1);
  }, [restoreTo]);

  const clearHistory = useCallback(() => {
    cancelPendingSnapshot();
    setState({ entries: [], index: -1 });
  }, [cancelPendingSnapshot]);

  const exportHistory = useCallback((): HistoryState<N, E> => {
    const { entries, index } = stateRef.current;
    return {
      index,
      entries: entries.map(entry => ({
        timestamp: entry.timestamp,
        nodes: JSON.parse(JSON.stringify(entry.nodes)) as Node<N>[],
        edges: JSON.parse(JSON.stringify(entry.edges)) as Edge<E>[]
      }))
    };
  }, []);

  const importHistory = useCallback(
    (snapshot: HistoryState<N, E> | null | undefined) => {
      cancelPendingSnapshot();
      isInternalUpdateRef.current = true;
      if (!snapshot || !Array.isArray(snapshot.entries) || snapshot.entries.length === 0) {
        setState({ entries: [], index: -1 });
      } else {
        const entries = snapshot.entries.map(entry => ({
          timestamp: entry.timestamp,
          nodes: JSON.parse(JSON.stringify(entry.nodes)) as Node<N>[],
          edges: JSON.parse(JSON.stringify(entry.edges)) as Edge<E>[]
        }));
        const index = Math.max(
          -1,
          Math.min(snapshot.index, entries.length - 1)
        );
        setState({ entries, index });
      }
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 0);
    },
    [cancelPendingSnapshot]
  );

  // Auto-snapshot when nodes/edges change (skipping internal undo/redo writes).
  useEffect(() => {
    if ((nodes?.length || 0) + (edges?.length || 0) === 0) {
      return;
    }
    if (isInternalUpdateRef.current) {
      return;
    }
    if (Date.now() < suppressUntilRef.current) {
      return;
    }
    pushSnapshot(nodes, edges);
  }, [nodes, edges, pushSnapshot]);

  // Cleanup debounce timer on unmount.
  useEffect(() => () => cancelPendingSnapshot(), [cancelPendingSnapshot]);

  return {
    pushSnapshot,
    captureSnapshotNow,
    undo,
    redo,
    canUndo: state.index > 0 && state.entries.length > 0,
    canRedo: state.index < state.entries.length - 1,
    historySize: state.entries.length,
    currentIndex: state.index,
    clearHistory,
    exportHistory,
    importHistory,
    suppressSnapshotsFor
  };
}

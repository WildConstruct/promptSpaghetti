import { useState, useCallback, useEffect, useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import {
  isStorageAvailable,
  STORAGE_KEY
} from '../../../utils/persistenceUtils';
import { debugLogEpic1 } from '../../../utils/debug';

interface PersistenceState {
  nodes: Node[];
  edges: Edge[];
  lastModified: string;
}

interface PersistenceWrapper {
  state: string;
  version: number;
  timestamp: number;
  compressed: boolean;
  size: number;
}

interface UseGraphPersistenceOptions {
  autoSave?: boolean;
  autoSaveDelayMs?: number;
  storageKey?: string;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  onLoadSuccess?: (state: PersistenceState) => void;
  onLoadError?: (error: Error) => void;
}

/**
 * Custom hook for managing graph persistence to localStorage
 */
export function useGraphPersistence<N = unknown, E = unknown>(
  nodes: Node<N>[],
  edges: Edge<E>[],
  options: UseGraphPersistenceOptions = {}
) {
  const {
    autoSave = true,
    autoSaveDelayMs = 2000,
    storageKey = STORAGE_KEY,
    onSaveSuccess,
    onSaveError,
    onLoadSuccess,
    onLoadError
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasRestoredState, setHasRestoredState] = useState(false);

  // Save to localStorage
  const saveToStorage = useCallback(
    (currentNodes: Node<N>[], currentEdges: Edge<E>[]) => {
      if (!isStorageAvailable()) {
        onSaveError?.(new Error('LocalStorage is not available'));
        return false;
      }

      setIsSaving(true);

      try {
        const state: PersistenceState = {
          nodes: currentNodes as Node[],
          edges: currentEdges as Edge[],
          lastModified: new Date().toISOString()
        };

        const stateString = JSON.stringify(state);
        const wrapper: PersistenceWrapper = {
          state: stateString,
          version: 1,
          timestamp: Date.now(),
          compressed: false, // Could add compression here
          size: new Blob([stateString]).size
        };

        localStorage.setItem(storageKey, JSON.stringify(wrapper));
        setLastSaved(new Date());
        onSaveSuccess?.();

        debugLogEpic1(
          `[GraphPersistence] Saved to ${storageKey} (${wrapper.size} bytes)`
        );
        return true;
      } catch (error) {
        console.error('[GraphPersistence] Failed to save:', error);
        onSaveError?.(error as Error);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [storageKey, onSaveSuccess, onSaveError]
  );

  // Load from localStorage
  const loadFromStorage = useCallback((): PersistenceState | null => {
    if (!isStorageAvailable()) {
      onLoadError?.(new Error('LocalStorage is not available'));
      return null;
    }

    setIsLoading(true);

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        return null;
      }

      const wrapper: PersistenceWrapper = JSON.parse(stored);
      const state: PersistenceState = JSON.parse(wrapper.state);

      // Validate the loaded state
      if (!state.nodes || !Array.isArray(state.nodes)) {
        throw new Error('Invalid state: nodes missing or not an array');
      }
      if (!state.edges || !Array.isArray(state.edges)) {
        throw new Error('Invalid state: edges missing or not an array');
      }

      // Clean up duplicate nodes
      const seenIds = new Set<string>();
      const uniqueNodes = state.nodes.filter((node: Node) => {
        if (seenIds.has(node.id)) {
          console.warn(
            `[GraphPersistence] Removing duplicate node: ${node.id}`
          );
          return false;
        }
        seenIds.add(node.id);
        return true;
      });

      // Validate node references in edges
      const nodeIds = new Set(uniqueNodes.map(n => n.id));
      const validEdges = state.edges.filter((edge: Edge) => {
        if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
          console.warn(`[GraphPersistence] Removing invalid edge: ${edge.id}`);
          return false;
        }
        return true;
      });

      const cleanState = {
        ...state,
        nodes: uniqueNodes,
        edges: validEdges
      };

      debugLogEpic1(
        `[GraphPersistence] Loaded from ${storageKey} (${uniqueNodes.length} nodes, ${validEdges.length} edges)`
      );
      onLoadSuccess?.(cleanState);
      setHasRestoredState(true);

      return cleanState;
    } catch (error) {
      console.error('[GraphPersistence] Failed to load:', error);
      onLoadError?.(error as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, onLoadSuccess, onLoadError]);

  // Clear persisted state
  const clearStorage = useCallback(() => {
    if (!isStorageAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(storageKey);
      setLastSaved(null);
      setHasRestoredState(false);
      debugLogEpic1(`[GraphPersistence] Cleared ${storageKey}`);
      return true;
    } catch (error) {
      console.error('[GraphPersistence] Failed to clear:', error);
      return false;
    }
  }, [storageKey]);

  // Debounced auto-save
  const debouncedSave = useMemo(() => {
    let timeoutId: NodeJS.Timeout;

    return (nodes: Node<N>[], edges: Edge<E>[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveToStorage(nodes, edges);
      }, autoSaveDelayMs);
    };
  }, [saveToStorage, autoSaveDelayMs]);

  // Auto-save on changes
  useEffect(() => {
    if (!autoSave) {
      return;
    }
    if (nodes.length === 0 && edges.length === 0) {
      return;
    }

    debouncedSave(nodes, edges);
  }, [nodes, edges, autoSave, debouncedSave]);

  // Load persisted state on mount
  const loadPersistedState = useMemo(() => {
    if (hasRestoredState) {
      return null;
    }
    return loadFromStorage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    isLoading,
    isSaving,
    lastSaved,
    hasRestoredState,
    persistedState: loadPersistedState,

    // Actions
    save: () => saveToStorage(nodes, edges),
    load: loadFromStorage,
    clear: clearStorage,

    // Utils
    getStorageSize: () => {
      try {
        const stored = localStorage.getItem(storageKey);
        return stored ? new Blob([stored]).size : 0;
      } catch {
        return 0;
      }
    }
  };
}

/**
 * Enhanced graphStore with persistence support
 * This wraps the existing graphStore with persistence middleware
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { persistenceStorage, STORAGE_KEY } from './utils/persistenceUtils';
import type { GraphState } from './graphStore';

// Feature flag check
function isPersistenceEnabled(): boolean {
  // Check for Next.js environment variable
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FEATURE_AUTOSAVE !== undefined) {
    return process.env.NEXT_PUBLIC_FEATURE_AUTOSAVE !== 'false';
  }
  
  // Check for Vite environment variable
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FEATURE_AUTOSAVE !== undefined) {
    return import.meta.env.VITE_FEATURE_AUTOSAVE !== 'false';
  }
  
  // Default to enabled
  return true;
}

// Partialize function to select what to persist
function partializeState(state: GraphState) {
  return {
    nodes: state.nodes,
    edges: state.edges,
    // Add viewport if it exists
    ...(state.viewport && { viewport: state.viewport }),
    lastModified: new Date().toISOString()
  };
}

/**
 * Create persisted version of the store
 * This should be imported instead of the regular graphStore when persistence is needed
 */
export function createPersistedGraphStore(baseStore: (set: any, get: any) => GraphState) {
  // If persistence is disabled, return the base store
  if (!isPersistenceEnabled()) {
    return create<GraphState>(baseStore);
  }
  
  // Create store with persistence middleware
  return create<GraphState>()(
    persist(
      baseStore,
      {
        name: STORAGE_KEY,
        storage: createJSONStorage(() => persistenceStorage),
        partialize: partializeState,
        onRehydrateStorage: () => (state) => {
          if (state) {
            console.log('State rehydrated from localStorage');
            // Could dispatch an event here for UI notification
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('graph-state-rehydrated', {
                detail: { 
                  nodeCount: state.nodes?.length || 0,
                  edgeCount: state.edges?.length || 0
                }
              }));
            }
          }
        },
        version: 1, // For future migrations
        migrate: (persistedState: any, version: number) => {
          // Migration logic for future schema changes
          if (version === 0) {
            // Example migration from version 0 to 1
            // persistedState.newField = 'default';
          }
          return persistedState;
        }
      }
    )
  );
}

/**
 * Export a hook to check if persistence is enabled
 */
export function usePersistenceEnabled(): boolean {
  return isPersistenceEnabled();
}

/**
 * Export utility to manually trigger persistence
 */
export function persistCurrentState(store: any): void {
  if (isPersistenceEnabled() && store.persist) {
    store.persist.rehydrate();
  }
}

/**
 * Export utility to clear persisted state
 */
export function clearPersistedGraphState(store: any): void {
  if (store.persist) {
    store.persist.clearStorage();
  }
}
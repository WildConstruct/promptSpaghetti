/**
 * Autosave hook for graph state persistence
 * Provides debounced saving with status tracking and multi-tab conflict detection
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import { useGraphStore } from '../graphStore';
import { persistenceStorage, checkStorageQuota } from '../utils/persistenceUtils';
import { usePersistenceEnabled } from '../graphStorePersisted';
/**
 * Custom debounce implementation
 */
function useDebouncedCallback(callback, delay) {
    const timeoutRef = useRef(null);
    const callbackRef = useRef(callback);
    // Update callback ref when it changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);
    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);
    const debouncedCallback = useCallback((...args) => {
        cancel();
        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay, cancel]);
    // Cleanup on unmount
    useEffect(() => {
        return cancel;
    }, [cancel]);
    return [debouncedCallback, cancel];
}
/**
 * Hook for autosaving graph state with conflict detection
 */
export function useAutosave(options = {}) {
    const { enabled = true, debounceMs = 30000, // 30 seconds default
    useIdleCallback = true, onSave, onError, onConflict } = options;
    const persistenceEnabled = usePersistenceEnabled();
    const graphStore = useGraphStore();
    const [state, setState] = useState({
        status: 'saved',
        lastSaved: null,
        error: null,
        conflictDetected: false,
        remoteVersion: null
    });
    const versionRef = useRef(0);
    const saveInProgressRef = useRef(false);
    // Performance monitoring for large graphs
    const measureSavePerformance = useCallback((startTime, nodeCount) => {
        const duration = performance.now() - startTime;
        // Log warning if save takes too long
        if (duration > 50) {
            console.warn(`Autosave took ${duration.toFixed(2)}ms for ${nodeCount} nodes`);
        }
        // Dispatch performance event for monitoring
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('autosave-performance', {
                detail: { duration, nodeCount }
            }));
        }
    }, []);
    // Save function with performance tracking
    const performSave = useCallback(async () => {
        if (saveInProgressRef.current) {
            return; // Prevent concurrent saves
        }
        saveInProgressRef.current = true;
        const startTime = performance.now();
        setState(prev => ({ ...prev, status: 'saving', error: null }));
        try {
            const currentState = graphStore.getState();
            const nodeCount = currentState.nodes.length;
            // Check if we should use requestIdleCallback for large graphs
            const shouldUseIdleCallback = useIdleCallback && nodeCount > 1000;
            const save = () => {
                try {
                    // Increment version for optimistic locking
                    versionRef.current++;
                    // Add version to state before saving
                    const stateWithVersion = {
                        ...currentState,
                        version: versionRef.current,
                        lastModified: new Date().toISOString()
                    };
                    // Save to localStorage using persistence storage
                    persistenceStorage.setItem('promptgraph:state:v1', JSON.stringify(stateWithVersion));
                    measureSavePerformance(startTime, nodeCount);
                    setState({
                        status: 'saved',
                        lastSaved: new Date(),
                        error: null,
                        conflictDetected: false,
                        remoteVersion: null
                    });
                    onSave?.();
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    // Check if it's a quota error
                    if (errorMessage.includes('QuotaExceeded')) {
                        const quota = checkStorageQuota();
                        setState(prev => ({
                            ...prev,
                            status: 'error',
                            error: `Storage quota exceeded (${Math.round(quota.percentage)}% used)`
                        }));
                        // Dispatch quota exceeded event
                        window.dispatchEvent(new CustomEvent('storage-quota-exceeded', {
                            detail: { quota }
                        }));
                    }
                    else {
                        setState(prev => ({
                            ...prev,
                            status: 'error',
                            error: errorMessage
                        }));
                    }
                    onError?.(error);
                }
                finally {
                    saveInProgressRef.current = false;
                }
            };
            if (shouldUseIdleCallback && 'requestIdleCallback' in window) {
                requestIdleCallback(save, { timeout: 100 });
            }
            else {
                save();
            }
        }
        catch (error) {
            saveInProgressRef.current = false;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setState(prev => ({
                ...prev,
                status: 'error',
                error: errorMessage
            }));
            onError?.(error);
        }
    }, [graphStore, useIdleCallback, onSave, onError, measureSavePerformance]);
    // Debounced save function
    const [debouncedSave, cancelSave] = useDebouncedCallback(performSave, debounceMs);
    // Subscribe to graph changes
    useEffect(() => {
        if (!enabled || !persistenceEnabled) {
            return;
        }
        // Subscribe to store changes
        const unsubscribe = graphStore.subscribe((state) => state, () => {
            setState(prev => ({ ...prev, status: 'unsaved' }));
            debouncedSave();
        });
        return () => {
            unsubscribe();
            cancelSave();
        };
    }, [enabled, persistenceEnabled, graphStore, debouncedSave, cancelSave]);
    // Listen for storage events (multi-tab synchronization)
    useEffect(() => {
        if (!enabled || !persistenceEnabled) {
            return;
        }
        const handleStorageChange = (e) => {
            if (e.key !== 'promptgraph:state:v1') {
                return;
            }
            if (e.newValue) {
                try {
                    const remoteState = JSON.parse(e.newValue);
                    const remoteVersion = remoteState.version || 0;
                    // Check for version conflict
                    if (remoteVersion > versionRef.current) {
                        setState(prev => ({
                            ...prev,
                            conflictDetected: true,
                            remoteVersion
                        }));
                        onConflict?.(versionRef.current, remoteVersion);
                        // Dispatch conflict event
                        window.dispatchEvent(new CustomEvent('storage-conflict', {
                            detail: {
                                localVersion: versionRef.current,
                                remoteVersion
                            }
                        }));
                    }
                }
                catch (error) {
                    console.error('Error parsing remote state:', error);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [enabled, persistenceEnabled, onConflict]);
    // Manual save trigger
    const saveNow = useCallback(async () => {
        cancelSave();
        await performSave();
    }, [cancelSave, performSave]);
    // Resolve conflict by accepting remote changes
    const acceptRemoteChanges = useCallback(() => {
        window.location.reload(); // Simple resolution: reload to get remote state
    }, []);
    // Resolve conflict by keeping local changes
    const keepLocalChanges = useCallback(async () => {
        versionRef.current++; // Increment version to override
        await saveNow();
        setState(prev => ({
            ...prev,
            conflictDetected: false,
            remoteVersion: null
        }));
    }, [saveNow]);
    return {
        ...state,
        saveNow,
        acceptRemoteChanges,
        keepLocalChanges,
        isEnabled: enabled && persistenceEnabled
    };
}

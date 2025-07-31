/**
 * Real-Time State React Hooks
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 2: Real-Time Data Synchronization
 * 
 * React hooks for real-time state management and synchronization
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { StateChange } from '../containers/BaseStateContainer';
import { DomainStateContainer } from '../orchestration/StateOrchestrator';
import { 
  RealTimeStateManager, 
  StateSubscription, 
  SubscriptionFilter, 
  SubscriptionOptions,
  StateMutation,
  ChangeMetadata,
  ConnectionState,
  OptimisticUpdate,
  globalRealTimeManager
} from '../realtime/RealTimeStateManager';

// Hook types

}
export interface UseRealTimeStateOptions {
  autoConnect?: boolean;
  userId?: string;
  sessionId?: string;
  domains?: string;
}
}
}
export interface UseRealTimeStateReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connectionState: ConnectionState;
  latency: number;
  connect: (userId: string, sessionId?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  error: Error | null;
}
}
}
export interface UseStateSubscriptionOptions extends SubscriptionOptions {
  enabled?: boolean;
  suspense?: boolean;
  export interface UseStateSubscriptionReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: number | null;
  subscription: StateSubscription | null;
  export interface UseOptimisticMutationOptions {
  onSuccess?: (data: any, variables: any) => void;
  onError?: (error: Error, variables: any) => void;
  onSettled?: (data: any, error: Error | null, variables: any) => void;
  retry?: number | boolean;
  retryDelay?: number | ((attempt: number) => number);
}
}
}
export interface UseOptimisticMutationReturn<TVariables, TData> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: Error | null;
  data: TData | null;
  reset: () => void;
  optimisticUpdates: OptimisticUpdate;

}
export interface UseDomainStateOptions<T> {
  domain: string;
  selector?: (state: any) => T;
  equalityFn?: (a: T, b: T) => boolean;
  suspense?: boolean;

}
export interface UseDomainStateReturn<T> {
  state: T;
  setState: (updater: (prev: T) => T | Partial<T>) => void;
  isLoading: boolean;
  error: Error | null;
  lastModified: number;

// Main real-time state hook
export function useRealTimeState(options: UseRealTimeStateOptions = {})
): UseRealTimeStateReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>()
  globalRealTimeManager.getConnectionState()
  );
  const [error, setError] = useState<Error | null>(null);
  const manager = useRef(globalRealTimeManager);
  const connect = useCallback(async (userId: string, sessionId?: string) => {,
  try {
  setError(null);
  await manager.current.connect(userId, sessionId);
} catch (err) {
      setError(err as Error);
      throw err;
  }, []);
  const disconnect = useCallback(async () => {
    try {
      setError(null);
      await manager.current.disconnect();
    } catch (err) {
      setError(err as Error);
      throw err;
  }, []);
  useEffect(() => {
    const handleConnectionChange = () => {
      setConnectionState(manager.current.getConnectionState());
    };
    const handleConnectionError = (error: Error) => {
      setError(error);
    };
    manager.current.on('connected', handleConnectionChange);
    manager.current.on('disconnected', handleConnectionChange);
    manager.current.on('connectionError', handleConnectionError);
    manager.current.on('connectionLost', handleConnectionChange);
    // Auto-connect if enabled
    if (options.autoConnect && options.userId) {
      connect(options.userId, options.sessionId).catch(console.error);
    return () => {
      manager.current.off('connected', handleConnectionChange);
      manager.current.off('disconnected', handleConnectionChange);
      manager.current.off('connectionError', handleConnectionError);
      manager.current.off('connectionLost', handleConnectionChange);
    };
  }, [options.autoConnect, options.userId, options.sessionId, connect]);
  return {
  isConnected: connectionState.status === 'connected',
  isConnecting: connectionState.status === 'connecting',
  connectionState,
  latency: connectionState.latency,
  connect,
  disconnect,
  error
};

// State subscription hook
export function useStateSubscription<T = any>(domain: string(
    filters: SubscriptionFilter = [],
    options: UseStateSubscriptionOptions = {}
  ): UseStateSubscriptionReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [subscription, setSubscription] = useState<StateSubscription | null>(null);
  const manager = useRef(globalRealTimeManager);
  const { enabled = true, ...subscriptionOptions } = options;
  const callback = useCallback((change: StateChange<any>, metadata: ChangeMetadata) => {
    try {
      // Update data based on the change
      setData(prevData => {)
  if (change.payload && typeof change.payload === 'object') {
          return { ...prevData, ...change.payload } as T;
        return change.payload as T;
      });
      setLastUpdated(metadata.timestamp);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError(err as Error);
  }, []);
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    const unsubscribe = manager.current.subscribeToStateChanges(;);
      domain,
      callback,
      filters,
      subscriptionOptions
    );
    // Create subscription object for return value
    const sub: StateSubscription = {,
  id: `sub_${Date.now()}`}
}
      domain,
      filters,
      callback,
      options: subscriptionOptions;
  };
    setSubscription(sub);
    return () => {
      unsubscribe();
      setSubscription(null);
    };
  }, [domain, enabled, callback, JSON.stringify(filters), JSON.stringify(subscriptionOptions)]);
  return {
    data,
    isLoading,
    error,
    lastUpdated,
    subscription
  };

// Optimistic mutation hook
export function useOptimisticMutation<TVariables = any, TData = any>()
  domain: string,
  mutationFn: (variables: TVariables) => StateMutation,
  options: UseOptimisticMutationOptions = {}
): UseOptimisticMutationReturn<TVariables, TData> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate>([]);
  const manager = useRef(globalRealTimeManager);
  const retryCount = useRef(0);
  const { onSuccess, onError, onSettled, retry = false, retryDelay = 1000 } = options;
  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
  setIsLoading(true);
  setError(null);
  try {
  const mutation = mutationFn(variables);
  const updateId = await manager.current.optimisticUpdate(domain, mutation);
  // Track the optimistic update
  const pendingUpdates = manager.current.getPendingOptimisticUpdates();
  setOptimisticUpdates(pendingUpdates);
  // Wait for server confirmation or rejection
  return new Promise((resolve, reject) => {
  const handleConfirm = (event: any) => {,
  if (event.updateId === updateId) {
  setIsLoading(false);
  setData(event.data);
  setOptimisticUpdates(prev => prev.filter(u => u.id !== updateId));
  if (onSuccess) onSuccess(event.data, variables);
  if (onSettled) onSettled(event.data, null, variables);
  manager.current.off('optimisticUpdateConfirmed', handleConfirm);
  manager.current.off('optimisticUpdateRejected', handleReject);
  resolve(event.data);
};
        const handleReject = (event: any) => {
  if (event.updateId === updateId) {
  const error = new Error(event.reason || 'Optimistic update rejected');
  setIsLoading(false);
  setError(error);
  setOptimisticUpdates(prev => prev.filter(u => u.id !== updateId));
  if (onError) onError(error, variables);
  if (onSettled) onSettled(null, error, variables);
  manager.current.off('optimisticUpdateConfirmed', handleConfirm);
  manager.current.off('optimisticUpdateRejected', handleReject);
  // Handle retry logic
  if (retry && (typeof retry !== 'number' || retryCount.current < retry)) {
  retryCount.current++;
  const delay = typeof retryDelay === 'function' ;
  ? retryDelay(retryCount.current)
  : retryDelay;
  setTimeout(() => {
  mutate(variables).then(resolve).catch(reject);
}, delay);
            } else {
              reject(error);
        };
        manager.current.on('optimisticUpdateConfirmed', handleConfirm);
        manager.current.on('optimisticUpdateRejected', handleReject);
        // Set a timeout for the optimistic update
        setTimeout(() => {
          handleReject({ updateId, reason: 'Timeout' });
        }, 10000); // 10 second timeout
      });
    } catch (err) {
      setIsLoading(false);
      setError(err as Error);
      if (onError) onError(err as Error, variables);
      if (onSettled) onSettled(null, err as Error, variables);
      throw err;
  }, [domain, mutationFn, onSuccess, onError, onSettled, retry, retryDelay]);
  const mutateAsync = mutate; // Alias for consistency;
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
    setOptimisticUpdates([]);
    retryCount.current = 0;
  }, []);
  return {
    mutate,
    mutateAsync,
    isLoading,
    error,
    data,
    reset,
    optimisticUpdates
  };

// Domain state hook
export function useDomainState<T = any>(options: UseDomainStateOptions<T>): UseDomainStateReturn<T> {
  const { domain, selector, equalityFn, suspense } = options;
  const [state, setState] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastModified, setLastModified] = useState<number>(0);
  const manager = useRef(globalRealTimeManager);
  const prevState = useRef<T | null>(null);
  // Memoized selector function
  const selectorFn = useMemo(() => {
  return selector || ((s: any) => s as T);
}, [selector]);
  // Equality function for preventing unnecessary re-renders
  const isEqual = useMemo(() => {
  return equalityFn || ((a: T, b: T) => {,
  return JSON.stringify(a) === JSON.stringify(b);
});
  }, [equalityFn]);
  const updateState = useCallback((updater: (prev: T) => T | Partial<T>) => {
  // This would trigger a state update through the domain container
  // Implementation depends on how we access the domain container
  console.log('State update requested:', updater);
}, []);
  // Subscribe to domain state changes
  useEffect(() => {
  const handleStateChange = (change: StateChange<any>, metadata: ChangeMetadata) => {,
  try {
  if (change.payload) {
  const newState = selectorFn(change.payload);
  if (!prevState.current || !isEqual(prevState.current, newState)) {
  setState(newState);
  prevState.current = newState;
  setLastModified(metadata.timestamp);
  setIsLoading(false);
  setError(null);
} catch (err) {
        setError(err as Error);
        setIsLoading(false);
    };
    const unsubscribe = manager.current.subscribeToStateChanges(;);
      domain,
      handleStateChange,
      [], // No filters
      { includeOptimistic: true }
    );
    return unsubscribe;
  }, [domain, selectorFn, isEqual]);
  return {
  state: state as T,
  setState: updateState,
  isLoading,
  error,
  lastModified
};

// Connection status hook
export function useConnectionStatus() {
  const [status, setStatus] = useState(globalRealTimeManager.getConnectionState());
  const manager = useRef(globalRealTimeManager);
  useEffect(() => {
    const updateStatus = () => {
      setStatus(manager.current.getConnectionState());
    };
    manager.current.on('connected', updateStatus);
    manager.current.on('disconnected', updateStatus);
    manager.current.on('connectionError', updateStatus);
    manager.current.on('connectionLost', updateStatus);
    return () => {
      manager.current.off('connected', updateStatus);
      manager.current.off('disconnected', updateStatus);
      manager.current.off('connectionError', updateStatus);
      manager.current.off('connectionLost', updateStatus);
    };
  }, []);
  return status;

// Latency monitoring hook
export function useLatency() {
  const [latency, setLatency] = useState(0);
  const manager = useRef(globalRealTimeManager);
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(manager.current.getLatency());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return latency;

// Optimistic updates monitoring hook
export function useOptimisticUpdates(domain?: string) {
  const [updates, setUpdates] = useState<OptimisticUpdate>([]);
  const manager = useRef(globalRealTimeManager);
  useEffect(() => {
  const updateList = () => {
  const allUpdates = manager.current.getPendingOptimisticUpdates();
  const filteredUpdates = domain ;
  ? allUpdates.filter(u => u.domain === domain)
  : allUpdates;
  setUpdates(filteredUpdates);
};
    // Update initially
    updateList();
    // Listen for changes
    manager.current.on('optimisticUpdateApplied', updateList);
    manager.current.on('optimisticUpdateConfirmed', updateList);
    manager.current.on('optimisticUpdateRejected', updateList);
    return () => {
      manager.current.off('optimisticUpdateApplied', updateList);
      manager.current.off('optimisticUpdateConfirmed', updateList);
      manager.current.off('optimisticUpdateRejected', updateList);
    };
  }, [domain]);
  return updates;

// Real-time collaboration hook
export function useCollaboration(domain: string) {
  const [collaborators, setCollaborators] = useState<any>([]);
  const [cursors, setCursors] = useState<Record<string, any>>({});
  // This would integrate with the collaboration features
  // Implementation depends on the specific collaboration requirements
  return {
  collaborators,
  cursors,
  updateCursor: (position: any) => {,
  // Update cursor position
},
  sendPresence: (data: any) => {,
      // Send presence data
  };

// Conflict resolution hook
export function useConflictResolution(domain: string) {
  const [conflicts, setConflicts] = useState<any>([]);
  const manager = useRef(globalRealTimeManager);
  useEffect(() => {
  const handleConflict = (event: any) => {,
  if (event.conflict.domain === domain) {
  setConflicts(prev => [...prev, event.conflict]);
};
    const handleConflictResolved = (event: any) => {
      if (event.conflict.domain === domain) {
        setConflicts(prev => prev.filter(c => c.id !== event.conflict.id));
    };
    manager.current.on('conflictDetected', handleConflict);
    manager.current.on('conflictResolved', handleConflictResolved);
    return () => {
      manager.current.off('conflictDetected', handleConflict);
      manager.current.off('conflictResolved', handleConflictResolved);
    };
  }, [domain]);
  return {
  conflicts,
  resolveConflict: (conflictId: string, resolution: any) => {,
  // Resolve conflict manually
};

// Batch mutation hook
export function useBatchMutation(domain: string) {
  const [batch, setBatch] = useState<StateMutation>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const addToBatch = useCallback((mutation: StateMutation) => {,
  setBatch(prev => [...prev, mutation]);
}, []);
  const clearBatch = useCallback(() => {
    setBatch([]);
  }, []);
  const executeBatch = useCallback(async () => {
    if (batch.length === 0) return;
    setIsExecuting(true);
    try {
      // Execute all mutations in the batch
      await Promise.all()
        batch.map(mutation => )
          globalRealTimeManager.optimisticUpdate(domain, mutation)
      );
      setBatch([]);
    } catch (error) {
      throw error;
    } finally {
      setIsExecuting(false);
  }, [domain, batch]);
  return {
  batch,
  addToBatch,
  clearBatch,
  executeBatch,
  isExecuting,
  batchSize: batch.length,
};
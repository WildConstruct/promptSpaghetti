import { StateSubscription, SubscriptionOptions, ConnectionState, OptimisticUpdate } from '../realtime/RealTimeStateManager';
export interface UseRealTimeStateOptions {
    autoConnect?: boolean;
    userId?: string;
    sessionId?: string;
    domains?: string;
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
export interface UseStateSubscriptionOptions extends SubscriptionOptions {
    enabled?: boolean;
    suspense?: boolean;
}
export interface UseStateSubscriptionReturn<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    lastUpdated: number | null;
    subscription: StateSubscription | null;
}
export interface UseOptimisticMutationOptions {
    onSuccess?: (data: any, variables: any) => void;
    onError?: (error: Error, variables: any) => void;
    onSettled?: (data: any, error: Error | null, variables: any) => void;
    retry?: number | boolean;
    retryDelay?: number | ((attempt: number) => number);
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
}
export declare function useRealTimeState(options?: UseRealTimeStateOptions): any;
export declare function useOptimisticMutation<TVariables = any, TData = any>(): any;
export declare function useDomainState<T = any>(options: UseDomainStateOptions<T>): UseDomainStateReturn<T>;
export declare function useConnectionStatus(): any;
//# sourceMappingURL=useRealTimeState.d.ts.map
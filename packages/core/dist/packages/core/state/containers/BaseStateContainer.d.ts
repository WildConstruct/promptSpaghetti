/**
 * Base State Container
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 *
 * Abstract base class for all domain state containers
 */
import { EventEmitter } from 'events';
export interface StateSubscriber<T> {
    (state: T, prevState: T): void;
}
export interface StateUpdater<T> {
    (prevState: T): T;
}
export interface StateChange<T> {
    id: string;
    timestamp: number;
    type: string;
    payload: Partial<T>;
    userId?: string;
    source: 'local' | 'remote' | 'system';
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
    code: string;
}
export interface ValidationWarning {
    field: string;
    message: string;
    suggestion?: string;
}
export interface StateMiddleware<T> {
    name: string;
    order: number;
    beforeUpdate?: (state: T, change: StateChange<T>) => Promise<T>;
    afterUpdate?: (state: T, prevState: T, change: StateChange<T>) => Promise<void>;
    onError?: (error: Error, state: T, change: StateChange<T>) => void;
}
export interface StateContainerConfig {
    enableValidation: boolean;
    enableHistory: boolean;
    maxHistorySize: number;
    enablePersistence: boolean;
    persistenceKey?: string;
    enableDebug: boolean;
    enableDevTools: boolean;
    enableTimeTravel: boolean;
    enablePerformanceProfiling: boolean;
}
export interface StateSnapshot<T> {
    id: string;
    timestamp: number;
    state: T;
    change?: StateChange<T>;
    metadata?: Record<string, any>;
}
export type UnsubscribeFn = () => void;
export declare abstract class BaseStateContainer<T> extends EventEmitter {
    protected state: T;
    protected subscribers: Set<StateSubscriber<T>>;
    protected middleware: StateMiddleware<T>[];
    protected history: StateSnapshot<T>[];
    protected config: StateContainerConfig;
    protected isUpdating: boolean;
    constructor(config?: Partial<StateContainerConfig>);
    abstract getInitialState(): T;
    abstract validateState(state: T): ValidationResult;
    abstract getDomainName(): string;
    getState(): T;
    setState(updater: StateUpdater<T> | Partial<T>, changeInfo?: Partial<StateChange<T>>): void;
    subscribe(subscriber: StateSubscriber<T>): UnsubscribeFn;
    addMiddleware(middleware: StateMiddleware<T>): void;
    removeMiddleware(name: string): void;
    getHistory(): StateSnapshot<T>[];
    restoreSnapshot(snapshotId: string): void;
    clearHistory(): void;
    protected applyStateUpdate(newState: T, prevState: T, change: StateChange<T>): Promise<void>;
    protected notifySubscribers(state: T, prevState: T): void;
    protected addToHistory(state: T, change?: StateChange<T>): void;
    protected persistState(): Promise<void>;
    protected loadPersistedState(): Promise<void>;
    protected cloneState(state: T): T;
    protected calculateDiff(prevState: T, newState: T): Partial<T>;
    protected generateChangeId(): string;
    protected generateSnapshotId(): string;
    protected profileStateUpdate(newState: T, prevState: T, change: StateChange<T>): Promise<void>;
    protected recordInDevTools(state: T, change: StateChange<T>): Promise<void>;
    enableDevTools(options?: {
        enableTimeTravel?: boolean;
        enableProfiling?: boolean;
        enableValidation?: boolean;
    }): void;
    disableDevTools(): void;
    private initializeDevTools;
    debugState(): void;
    getDevToolsInfo(): Promise<any>;
}
export declare class StateValidationError extends Error {
    errors: ValidationError[];
    constructor(message: string, errors: ValidationError[]);
}
export declare class StateUpdateError extends Error {
    cause?: Error;
    constructor(message: string, cause?: Error);
}
export declare function createStateSelector<T, R>(selector: (state: T) => R, dependencies?: (keyof T)[]): (state: T) => R;
//# sourceMappingURL=BaseStateContainer.d.ts.map
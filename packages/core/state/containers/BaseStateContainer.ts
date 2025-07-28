/**
 * Base State Container
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * 
 * Abstract base class for all domain state containers
 */
import { EventEmitter } from 'events';

// Core state management types

export interface StateSubscriber<T> {
  (state: T, prevState: T): void;
  export interface StateUpdater<T> {
  (prevState: T): T;
  export interface StateChange<T> {
  id: string;,
  timestamp: number;
  type: string;,
  payload: Partial<T>;
  userId?: string;
  source: 'local' | 'remote' | 'system';
  export interface ValidationResult {
  valid: boolean;,
  errors: ValidationError;
  warnings: ValidationWarning;
}
export interface ValidationError {
  field: string;,
  message: string;
  value?: any;
  code: string;
}
export interface ValidationWarning {
  field: string;,
  message: string;
  suggestion?: string;
}
export interface StateMiddleware<T> {
  name: string;,
  order: number;
  beforeUpdate?: (state: T, change: StateChange<T>) => Promise<T>;
  afterUpdate?: (state: T, prevState: T, change: StateChange<T>) => Promise<void>;
  onError?: (error: Error, state: T, change: StateChange<T>) => void;
  export interface StateContainerConfig {
  enableValidation: boolean;,
  enableHistory: boolean;
  maxHistorySize: number;,
  enablePersistence: boolean;
  persistenceKey?: string;
  enableDebug: boolean;,
  enableDevTools: boolean;
  enableTimeTravel: boolean;,
  enablePerformanceProfiling: boolean;
}
export interface StateSnapshot<T> {
  id: string;,
  timestamp: number;
  state: T;
  change?: StateChange<T>;
  metadata?: Record<string, any>;

export type UnsubscribeFn = () => void;

// Abstract base state container
export abstract class BaseStateContainer<T> extends EventEmitter {
  protected state: T;
  protected subscribers = new Set<StateSubscriber<T>>();
  protected middleware: StateMiddleware<T>[] = [];
  protected history: StateSnapshot<T>[] = [];
  protected config: StateContainerConfig;
  protected isUpdating = false;
  constructor(config: Partial<StateContainerConfig> = {}) {
  super();
  this.config = {
  enableValidation: true,
  enableHistory: true,
  maxHistorySize: 100,
  enablePersistence: false,
  enableDebug: false,
  enableDevTools: false,
  enableTimeTravel: false,
  enablePerformanceProfiling: false,
  ...config
};
    this.state = this.getInitialState();
    this.addToHistory(this.state, undefined);
    if (this.config.enablePersistence) {
      this.loadPersistedState();
  // Abstract methods that must be implemented by subclasses
  abstract getInitialState(): T;
  abstract validateState(state: T): ValidationResult;
  abstract getDomainName(): string;
  // Public API methods
  public getState(): T {
    return this.cloneState(this.state);
  public setState(updater: StateUpdater<T> | Partial<T>, changeInfo?: Partial<StateChange<T>>): void {
    if (this.isUpdating) {
      throw new Error('Cannot update state while another update is in progress');
    this.isUpdating = true;
    try {
      const prevState = this.cloneState(this.state);
      const newState = typeof updater === 'function' ;
        ? updater(prevState) 
        : { ...prevState, ...updater };
      const change: StateChange<T> = {,
  id: this.generateChangeId(),
  timestamp: Date.now(),
  type: changeInfo?.type || 'UPDATE',
  payload: this.calculateDiff(prevState, newState),
  userId: changeInfo?.userId,
  source: changeInfo?.source || 'local',
};
      // Profile the state update if performance profiling is enabled
      if (this.config.enablePerformanceProfiling) {
        this.profileStateUpdate(newState, prevState, change);
      } else {
        this.applyStateUpdate(newState, prevState, change);
    } finally {
  this.isUpdating = false;
  public subscribe(subscriber: StateSubscriber<T>): UnsubscribeFn {,
  this.subscribers.add(subscriber);
  // Immediately call subscriber with current state
  subscriber(this.getState(), this.getState());
  return () => {
  this.subscribers.delete(subscriber);
};
  public addMiddleware(middleware: StateMiddleware<T>): void {
    this.middleware.push(middleware);
    this.middleware.sort((a, b) => a.order - b.order);
  public removeMiddleware(name: string): void {
    this.middleware = this.middleware.filter(m => m.name !== name);
  public getHistory(): StateSnapshot<T>[] {
    return [...this.history];
  public restoreSnapshot(snapshotId: string): void {
    const snapshot = this.history.find(s => s.id === snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot with id ${snapshotId} not found`);}
    this.setState(() => snapshot.state, {
  type: 'RESTORE',
  source: 'system',
});
  public clearHistory(): void {
  this.history = [this.history[this.history.length - 1]]; // Keep current state
  // Protected methods for subclass use
  protected async applyStateUpdate(newState: T,)
  prevState: T,
  change: StateChange<T>): Promise<void> {,
  try {
  // Run beforeUpdate middleware
  let processedState = newState;
  for (const middleware of this.middleware) {
  if (middleware.beforeUpdate) {
  processedState = await middleware.beforeUpdate(processedState, change);
  // Validate state if enabled
  if (this.config.enableValidation) {
  const validation = this.validateState(processedState);
  if (!validation.valid) {
  throw new StateValidationError('State validation failed', validation.errors);
  // Update state
  this.state = processedState;
  // Add to history
  if (this.config.enableHistory) {
  this.addToHistory(this.state, change);
  // Record in DevTools if enabled
  if (this.config.enableDevTools) {
  await this.recordInDevTools(this.state, change);
  // Persist state if enabled
  if (this.config.enablePersistence) {
  await this.persistState();
  // Notify subscribers
  this.notifySubscribers(this.state, prevState);
  // Emit domain event
  this.emit('stateChanged', {)
  domain: this.getDomainName(),
  state: this.getState(),
  prevState: this.cloneState(prevState),
  change
});
      // Run afterUpdate middleware
      for (const middleware of this.middleware) {
        if (middleware.afterUpdate) {
          await middleware.afterUpdate(this.state, prevState, change);
    } catch (error) {
  // Run error middleware
  for (const middleware of this.middleware) {
  if (middleware.onError) {
  middleware.onError(error as Error, this.state, change);
  throw error;
  protected notifySubscribers(state: T, prevState: T): void {,
  const currentState = this.getState();
  const previousState = this.cloneState(prevState);
  for (const subscriber of this.subscribers) {
  try {
  subscriber(currentState, previousState);
} catch (error) {
  console.error('Error in state subscriber:', error);
  protected addToHistory(state: T, change?: StateChange<T>): void {,
  const snapshot: StateSnapshot<T> = {,
  id: this.generateSnapshotId(),
  timestamp: Date.now(),
  state: this.cloneState(state),
  change,
  metadata: {,
  historyIndex: this.history.length,
  domain: this.getDomainName(),
};
    this.history.push(snapshot);
    // Limit history size
    if (this.history.length > this.config.maxHistorySize) {
      this.history = this.history.slice(-this.config.maxHistorySize);
  protected async persistState(): Promise<void> {
    try {
      // Import and use the global persistence manager
      const { globalPersistenceManager } = await import('../performance/StatePersistenceManager');
      const stateData = {
  state: this.state,
  timestamp: Date.now(),
  domain: this.getDomainName(),
  version: '1.0',
};
      await globalPersistenceManager.persist()
        this.getDomainName(), 
        stateData, 
        {
  key: this.config.persistenceKey || this.getDomainName(),
  metadata: {,
  historyLength: this.history.length,
  subscriberCount: this.subscribers.size);
} catch (error) {
      console.error('Failed to persist state:', error);
  protected async loadPersistedState(): Promise<void> {
    try {
      // Import and use the global persistence manager
      const { globalPersistenceManager } = await import('../performance/StatePersistenceManager');
      const persistedData = await globalPersistenceManager.load(;);
        this.getDomainName(),
        this.config.persistenceKey || this.getDomainName()
      );
      if (!persistedData || !persistedData.state) return;
      // Validate persisted state
      if (this.config.enableValidation) {
  const validation = this.validateState(persistedData.state);
  if (!validation.valid) {
  console.warn('Persisted state validation failed, using initial state');
  return;
  this.state = persistedData.state;
  this.addToHistory(this.state, {)
  id: this.generateChangeId(),
  timestamp: Date.now(),
  type: 'LOADED',
  payload: persistedData.state,
  source: 'system',
});
      console.log(`Loaded persisted state for ${this.getDomainName()}`);}
    } catch (error) {
      console.error('Failed to load persisted state:', error);
  protected cloneState(state: T): T {
    // Deep clone to prevent mutations
    return JSON.parse(JSON.stringify(state));
  protected calculateDiff(prevState: T, newState: T): Partial<T> {
    // Simple diff calculation - can be enhanced with more sophisticated algorithms
    const diff: Partial<T> = {};
    for (const key in newState) {
      if (newState[key] !== prevState[key]) {
        diff[key] = newState[key];
    return diff;
  protected generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  protected generateSnapshotId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  // DevTools integration
  protected async profileStateUpdate(newState: T,)
    prevState: T,
    change: StateChange<T>): Promise<void> {,
    try {
      // Import and use the global performance profiler
      const { globalPerformanceProfiler } = await import('../devtools/PerformanceProfiler');
      await globalPerformanceProfiler.sampleOperation()
        this.getDomainName(),
        change.type,
        async () => {
          await this.applyStateUpdate(newState, prevState, change);
  }
        {
  changeId: change.id,
  payloadSize: JSON.stringify(change.payload).length,
  stateSize: JSON.stringify(newState).length);
} catch (error) {
      // Fallback to normal update if profiling fails
      console.warn('Performance profiling failed, falling back to normal update:', error);
      await this.applyStateUpdate(newState, prevState, change);
  protected async recordInDevTools(state: T, change: StateChange<T>): Promise<void> {
    try {
      // Record in StateDevTools
      if (this.config.enableDevTools) {
        const { globalStateDevTools } = await import('../devtools/StateDevTools');
        const snapshot: StateSnapshot<T> = {,
  id: this.generateSnapshotId(),
  timestamp: change.timestamp,
  state: this.cloneState(state),
  change,
  metadata: {,
  domain: this.getDomainName(),
  historyIndex: this.history.length,
};
        globalStateDevTools.recordStateChange(snapshot, this.getDomainName());
      // Record in TimeTravel
      if (this.config.enableTimeTravel) {
        const { globalTimeTravel } = await import('../devtools/TimeTravel');
        globalTimeTravel.recordStateChange(change, this.getDomainName(), {
          description: `${change.type} in ${this.getDomainName()}`}
},
  tags: [change.type.toLowerCase(), this.getDomainName()]
        });
    } catch (error) {
  console.warn('DevTools recording failed:', error);
  // DevTools configuration
  public enableDevTools(options: {,)
  enableTimeTravel?: boolean;
  enableProfiling?: boolean;
  enableValidation?: boolean;
} = {}): void {
    this.config.enableDevTools = true;
    this.config.enableTimeTravel = options.enableTimeTravel ?? true;
    this.config.enablePerformanceProfiling = options.enableProfiling ?? true;
    // Start recording if DevTools are enabled
    this.initializeDevTools();
  public disableDevTools(): void {
    this.config.enableDevTools = false;
    this.config.enableTimeTravel = false;
    this.config.enablePerformanceProfiling = false;
  private async initializeDevTools(): Promise<void> {
    try {
      if (this.config.enableDevTools) {
        const { globalStateDevTools } = await import('../devtools/StateDevTools');
        globalStateDevTools.startRecording();
      if (this.config.enableTimeTravel) {
        const { globalTimeTravel } = await import('../devtools/TimeTravel');
        globalTimeTravel.startRecording();
      if (this.config.enablePerformanceProfiling) {
        const { globalPerformanceProfiler } = await import('../devtools/PerformanceProfiler');
        // Start a long-running profile for this domain
        globalPerformanceProfiler.startProfile(`${this.getDomainName()}_continuous`, {},}
  duration: 24 * 60 * 60 * 1000, // 24 hours
          domains: [this.getDomainName()];
  });
    } catch (error) {
      console.warn('Failed to initialize DevTools:', error);
  // Debug utilities
  public debugState(): void {
    if (!this.config.enableDebug) return;
    console.group(`State Debug: ${this.getDomainName()}`);}
    console.log('Current State:', this.getState());
    console.log('History Length:', this.history.length);
    console.log('Subscribers:', this.subscribers.size);
    console.log('Middleware:', this.middleware.map(m => m.name));
    console.log('DevTools Enabled:', this.config.enableDevTools);
    console.log('Time Travel Enabled:', this.config.enableTimeTravel);
    console.log('Performance Profiling Enabled:', this.config.enablePerformanceProfiling);
    console.groupEnd();
  public async getDevToolsInfo(): Promise<any> {
    if (!this.config.enableDevTools) {
      return { devToolsEnabled: false };
    try {
      const devToolsInfo: any = { devToolsEnabled: true };
      if (this.config.enableTimeTravel) {
        const { globalTimeTravel } = await import('../devtools/TimeTravel');
        devToolsInfo.timeTravel = globalTimeTravel.getTimeTravelState();
      if (this.config.enablePerformanceProfiling) {
        const { globalPerformanceProfiler } = await import('../devtools/PerformanceProfiler');
        devToolsInfo.performance = {
  isActive: globalPerformanceProfiler.isProfilingActive(),
  alerts: globalPerformanceProfiler.getAlerts().length,
};
      return devToolsInfo;
    } catch (error) {
      return { devToolsEnabled: true, error: error.message };

// Custom error classes
export class StateValidationError extends Error {
  constructor(message: string, public errors: ValidationError) {,
  super(message);
  this.name = 'StateValidationError';
  export class StateUpdateError extends Error {
  constructor(message: string, public cause?: Error) {,
  super(message);
  this.name = 'StateUpdateError';
  // Utility functions
  export function createStateSelector<T, R>()
  selector: (state: T) => R,
  dependencies?: (keyof T)[]): (state: T) => R {,
  let lastState: T;
  let lastResult: R;
  let lastDependencyValues: any;
  return (state: T): R => {,
  // If no dependencies specified, always recalculate
  if (!dependencies) {
  return selector(state);
  // Check if dependencies have changed
  const currentDependencyValues = dependencies.map(dep => state[dep]);
  if ();
  lastState === state ||
  (lastDependencyValues && )
  currentDependencyValues.every((val, i) => val === lastDependencyValues[i]))
  return lastResult;
  lastState = state;
  lastDependencyValues = currentDependencyValues;
  lastResult = selector(state);
  return lastResult;
};
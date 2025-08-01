/**
 * Base State Container
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 *
 * Abstract base class for all domain state containers
 */
import { EventEmitter } from 'events';
// Abstract base state container
export class BaseStateContainer extends EventEmitter {
    state;
    subscribers = new Set();
    middleware = [];
    history = [];
    config;
    isUpdating = false;
    constructor(config = {}) {
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
            abstract;
            getInitialState();
            T;
            abstract;
            validateState(state, T);
            ValidationResult;
            abstract;
            getDomainName();
            string;
            // Public API methods
        }
        // Public API methods
    }
    // Public API methods
    getState() {
        return this.cloneState(this.state);
    }
    setState(updater, changeInfo) {
        if (this.isUpdating) {
            throw new Error('Cannot update state while another update is in progress');
            this.isUpdating = true;
            try {
                const prevState = this.cloneState(this.state);
                const newState = typeof updater === 'function';
                updater(prevState);
                {
                    prevState, ;
                    updater;
                }
                ;
                const change = {
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
                }
                else {
                    this.applyStateUpdate(newState, prevState, change);
                }
                try { }
                finally {
                    this.isUpdating = false;
                }
            }
            finally {
            }
        }
    }
    subscribe(subscriber) {
        this.subscribers.add(subscriber);
        // Immediately call subscriber with current state
        subscriber(this.getState(), this.getState());
        return () => {
            this.subscribers.delete(subscriber);
        };
    }
    addMiddleware(middleware) {
        this.middleware.push(middleware);
        this.middleware.sort((a, b) => a.order - b.order);
    }
    removeMiddleware(name) {
        this.middleware = this.middleware.filter(m => m.name !== name);
    }
    getHistory() {
        return [...this.history];
    }
    restoreSnapshot(snapshotId) {
        const snapshot = this.history.find(s => s.id === snapshotId);
        if (!snapshot) {
            throw new Error(`Snapshot with id ${snapshotId} not found`);
        }
        this.setState(() => snapshot.state, {
            type: 'RESTORE',
            source: 'system',
        });
    }
    clearHistory() {
        this.history = [this.history[this.history.length - 1]];
        // Protected methods for subclass use
    } // Keep current state
    prevState;
    change;
}
void  > {
    try: {
        // Run beforeUpdate middleware
        let, processedState = newState,
        : .middleware
    } };
{
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
                            this.emit('stateChanged', {});
                            domain: this.getDomainName(),
                                state;
                            this.getState(),
                                prevState;
                            this.cloneState(prevState),
                                change;
                        }
                        ;
                        // Run afterUpdate middleware
                        for (const middleware of this.middleware) {
                            if (middleware.afterUpdate) {
                                await middleware.afterUpdate(this.state, prevState, change);
                            }
                            try { }
                            catch (error) {
                                // Run error middleware
                                for (const middleware of this.middleware) {
                                    if (middleware.onError) {
                                        middleware.onError(error, this.state, change);
                                        throw error;
                                        notifySubscribers(state, T, prevState, T);
                                        void {
                                            const: currentState = this.getState(),
                                            const: previousState = this.cloneState(prevState),
                                            : .subscribers };
                                        {
                                            try {
                                                subscriber(currentState, previousState);
                                            }
                                            catch (error) {
                                                console.error('Error in state subscriber:', error);
                                                addToHistory(state, T, change ?  : StateChange);
                                                void {
                                                    const: snapshot };
                                                {
                                                    id: this.generateSnapshotId(),
                                                        timestamp;
                                                    Date.now(),
                                                        state;
                                                    this.cloneState(state),
                                                        change,
                                                        metadata;
                                                    {
                                                        historyIndex: this.history.length,
                                                            domain;
                                                        this.getDomainName(),
                                                        ;
                                                    }
                                                    ;
                                                    this.history.push(snapshot);
                                                    // Limit history size
                                                    if (this.history.length > this.config.maxHistorySize) {
                                                        this.history = this.history.slice(-this.config.maxHistorySize);
                                                        async;
                                                        persistState();
                                                        Promise < void  > {
                                                            try: {
                                                                // Import and use the global persistence manager
                                                                const: { globalPersistenceManager } = await import('../performance/StatePersistenceManager'),
                                                                const: stateData = {
                                                                    state: this.state,
                                                                    timestamp: Date.now(),
                                                                    domain: this.getDomainName(),
                                                                    version: '1.0',
                                                                },
                                                                await, globalPersistenceManager, : .persist(),
                                                                this: .getDomainName(),
                                                                stateData,
                                                            }
                                                        };
                                                        {
                                                            key: this.config.persistenceKey || this.getDomainName(),
                                                                metadata;
                                                            {
                                                                historyLength: this.history.length,
                                                                    subscriberCount;
                                                                this.subscribers.size;
                                                                ;
                                                            }
                                                            try { }
                                                            catch (error) {
                                                                console.error('Failed to persist state:', error);
                                                                async;
                                                                loadPersistedState();
                                                                Promise < void  > {
                                                                    try: {
                                                                        // Import and use the global persistence manager
                                                                        const: { globalPersistenceManager } = await import('../performance/StatePersistenceManager'),
                                                                        const: persistedData = await globalPersistenceManager.load(),
                                                                        this: .getDomainName(),
                                                                        this: .config.persistenceKey || this.getDomainName(),
                                                                        if(, persistedData) { }
                                                                    } || !persistedData.state, return: ,
                                                                    : .config.enableValidation
                                                                };
                                                                {
                                                                    const validation = this.validateState(persistedData.state);
                                                                    if (!validation.valid) {
                                                                        console.warn('Persisted state validation failed, using initial state');
                                                                        return;
                                                                        this.state = persistedData.state;
                                                                        this.addToHistory(this.state, {});
                                                                        id: this.generateChangeId(),
                                                                            timestamp;
                                                                        Date.now(),
                                                                            type;
                                                                        'LOADED',
                                                                            payload;
                                                                        persistedData.state,
                                                                            source;
                                                                        'system',
                                                                        ;
                                                                    }
                                                                    ;
                                                                    console.log(`Loaded persisted state for ${this.getDomainName()}`);
                                                                }
                                                            }
                                                            try { }
                                                            catch (error) {
                                                                console.error('Failed to load persisted state:', error);
                                                                cloneState(state, T);
                                                                T;
                                                                {
                                                                    // Deep clone to prevent mutations
                                                                    return JSON.parse(JSON.stringify(state));
                                                                    calculateDiff(prevState, T, newState, T);
                                                                    Partial < T > {
                                                                        // Simple diff calculation - can be enhanced with more sophisticated algorithms
                                                                        const: diff
                                                                    };
                                                                    { }
                                                                    ;
                                                                    for (const key in newState) {
                                                                        if (newState[key] !== prevState[key]) {
                                                                            diff[key] = newState[key];
                                                                            return diff;
                                                                            generateChangeId();
                                                                            string;
                                                                            {
                                                                                return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                                                            }
                                                                            generateSnapshotId();
                                                                            string;
                                                                            {
                                                                                return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                                                            }
                                                                            async;
                                                                            profileStateUpdate(newState, T),
                                                                                prevState;
                                                                            T,
                                                                                change;
                                                                            StateChange;
                                                                            Promise < void  > {
                                                                                try: {
                                                                                    // Import and use the global performance profiler
                                                                                    const: { globalPerformanceProfiler } = await import('../devtools/PerformanceProfiler'),
                                                                                    await, globalPerformanceProfiler, : .sampleOperation(),
                                                                                    this: .getDomainName(),
                                                                                    change, : .type,
                                                                                    async() { }
                                                                                } };
                                                                            {
                                                                                await this.applyStateUpdate(newState, prevState, change);
                                                                            }
                                                                            {
                                                                                changeId: change.id,
                                                                                    payloadSize;
                                                                                JSON.stringify(change.payload).length,
                                                                                    stateSize;
                                                                                JSON.stringify(newState).length;
                                                                                ;
                                                                            }
                                                                            try { }
                                                                            catch (error) {
                                                                                // Fallback to normal update if profiling fails
                                                                                console.warn('Performance profiling failed, falling back to normal update:', error);
                                                                                await this.applyStateUpdate(newState, prevState, change);
                                                                                async;
                                                                                recordInDevTools(state, T, change, (StateChange));
                                                                                Promise < void  > {
                                                                                    try: {
                                                                                        : .config.enableDevTools
                                                                                    }
                                                                                };
                                                                                {
                                                                                    const { globalStateDevTools } = await import('../devtools/StateDevTools');
                                                                                    const snapshot = {
                                                                                        id: this.generateSnapshotId(),
                                                                                        timestamp: change.timestamp,
                                                                                        state: this.cloneState(state),
                                                                                        change,
                                                                                        metadata: {
                                                                                            domain: this.getDomainName(),
                                                                                            historyIndex: this.history.length,
                                                                                        },
                                                                                        globalStateDevTools, : .recordStateChange(snapshot, this.getDomainName()),
                                                                                        : .config.enableTimeTravel }, { const: { globalTimeTravel } = await import('../devtools/TimeTravel') };
                                                                                    globalTimeTravel.recordStateChange(change, this.getDomainName(), {
                                                                                        description: `${change.type} in ${this.getDomainName()}`
                                                                                    });
                                                                                }
                                                                                tags: [change.type.toLowerCase(), this.getDomainName()];
                                                                            }
                                                                            ;
                                                                        }
                                                                        try { }
                                                                        catch (error) {
                                                                            console.warn('DevTools recording failed:', error);
                                                                            enableDevTools(options, {}),
                                                                                enableTimeTravel ?  : boolean;
                                                                            enableProfiling ?  : boolean;
                                                                            enableValidation ?  : boolean;
                                                                        }
                                                                        { }
                                                                        void {
                                                                            this: .config.enableDevTools = true,
                                                                            this: .config.enableTimeTravel = options.enableTimeTravel ?? true,
                                                                            this: .config.enablePerformanceProfiling = options.enableProfiling ?? true,
                                                                            // Start recording if DevTools are enabled
                                                                            this: .initializeDevTools(),
                                                                            disableDevTools() {
                                                                                this.config.enableDevTools = false;
                                                                                this.config.enableTimeTravel = false;
                                                                                this.config.enablePerformanceProfiling = false;
                                                                            },
                                                                            async initializeDevTools() {
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
                                                                                                globalPerformanceProfiler.startProfile(`${this.getDomainName()}_continuous`, {});
                                                                                            }
                                                                                            duration: 24 * 60 * 60 * 1000, // 24 hours
                                                                                                domains;
                                                                                            [this.getDomainName()];
                                                                                        }
                                                                                        ;
                                                                                    }
                                                                                    try { }
                                                                                    catch (error) {
                                                                                        console.warn('Failed to initialize DevTools:', error);
                                                                                        // Debug utilities
                                                                                    }
                                                                                    // Debug utilities
                                                                                }
                                                                                // Debug utilities
                                                                                finally {
                                                                                }
                                                                                // Debug utilities
                                                                            }
                                                                            // Debug utilities
                                                                            ,
                                                                            // Debug utilities
                                                                            debugState() {
                                                                                if (!this.config.enableDebug)
                                                                                    return;
                                                                                console.group(`State Debug: ${this.getDomainName()}`);
                                                                            },
                                                                            console, : .log('Current State:', this.getState()),
                                                                            console, : .log('History Length:', this.history.length),
                                                                            console, : .log('Subscribers:', this.subscribers.size),
                                                                            console, : .log('Middleware:', this.middleware.map(m => m.name)),
                                                                            console, : .log('DevTools Enabled:', this.config.enableDevTools),
                                                                            console, : .log('Time Travel Enabled:', this.config.enableTimeTravel),
                                                                            console, : .log('Performance Profiling Enabled:', this.config.enablePerformanceProfiling),
                                                                            console, : .groupEnd(),
                                                                            async getDevToolsInfo() {
                                                                                if (!this.config.enableDevTools) {
                                                                                    return { devToolsEnabled: false };
                                                                                    try {
                                                                                        const devToolsInfo = { devToolsEnabled: true };
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
                                                                                            }
                                                                                            try { }
                                                                                            catch (error) {
                                                                                                return { devToolsEnabled: true, error: error.message };
                                                                                                // Custom error classes
                                                                                                export class StateValidationError extends Error {
                                                                                                    errors;
                                                                                                    constructor(message, errors) {
                                                                                                        super(message);
                                                                                                        this.errors = errors;
                                                                                                        this.name = 'StateValidationError';
                                                                                                        export class StateUpdateError extends Error {
                                                                                                            cause;
                                                                                                            constructor(message, cause) {
                                                                                                                super(message);
                                                                                                                this.cause = cause;
                                                                                                                this.name = 'StateUpdateError';
                                                                                                                selector: (state) => R,
                                                                                                                    dependencies ?  : (keyof);
                                                                                                                T;
                                                                                                                [];
                                                                                                                (state) => R;
                                                                                                                {
                                                                                                                    let lastState;
                                                                                                                    let lastResult;
                                                                                                                    let lastDependencyValues;
                                                                                                                    return (state) => {
                                                                                                                        // If no dependencies specified, always recalculate
                                                                                                                        if (!dependencies) {
                                                                                                                            return selector(state);
                                                                                                                            // Check if dependencies have changed
                                                                                                                            const currentDependencyValues = dependencies.map(dep => state[dep]);
                                                                                                                            if ()
                                                                                                                                ;
                                                                                                                            lastState === state ||
                                                                                                                                (lastDependencyValues && );
                                                                                                                            currentDependencyValues.every((val, i) => val === lastDependencyValues[i]);
                                                                                                                            return lastResult;
                                                                                                                            lastState = state;
                                                                                                                            lastDependencyValues = currentDependencyValues;
                                                                                                                            lastResult = selector(state);
                                                                                                                            return lastResult;
                                                                                                                        }
                                                                                                                        ;
                                                                                                                    };
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    finally { }
                                                                                }
                                                                            }
                                                                        };
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

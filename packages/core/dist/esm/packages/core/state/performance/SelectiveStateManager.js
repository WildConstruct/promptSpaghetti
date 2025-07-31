/**
 * Selective State Manager
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 3: Performance-Optimized State
 *
 * Granular state updates with selective component re-rendering
 */
import { EventEmitter } from 'events';
export class SelectiveStateManager extends EventEmitter {
    stateGraph;
    componentDependencies = new Map();
    selectorCache = new Map();
    performanceMetrics;
    scheduler;
    batchQueue = [];
    isProcessing = false;
    maxCacheSize = 1000;
    cacheTimeout = 5 * 60 * 1000; // 5 minutes
    constructor() {
        super();
        this.stateGraph = {
            nodes: new Map(),
            edges: new Map(),
            rootPaths: new Set(),
            dependencyMap: new Map(),
        };
        this.performanceMetrics = {
            updateLatency: [],
            renderCount: 0,
            skipCount: 0,
            batchCount: 0,
            memoryUsage: 0,
            cacheHitRate: 0,
            selectorExecutionTime: new Map(),
            componentUpdateTime: new Map(),
        };
        this.scheduler = this.createUpdateScheduler();
        this.setupCleanupTimer();
        // Component dependency tracking
        registerComponentDependency();
        componentId: string,
            path;
        string,
            selector ?  : StateSelector,
            priority;
        ComponentDependency['priority'] = 'normal';
        () => void {
            const: dependency, ComponentDependency = {
                componentId,
                path,
                selector,
                priority
            },
            : .componentDependencies.has(componentId) };
        {
            this.componentDependencies.set(componentId, new Set());
            this.componentDependencies.get(componentId).add(dependency);
            // Add to state graph
            this.addNodeToGraph(path);
            this.addComponentSubscription(path, componentId);
            return () => {
                this.unregisterComponentDependency(componentId, path);
            };
            unregisterComponentDependency(componentId, string, path, string);
            void {
                const: dependencies = this.componentDependencies.get(componentId),
                if(dependencies) {
                    const toRemove = Array.from(dependencies).find(dep => dep.path === path);
                    if (toRemove) {
                        dependencies.delete(toRemove);
                        if (dependencies.size === 0) {
                            this.componentDependencies.delete(componentId);
                            this.removeComponentSubscription(path, componentId);
                            unregisterComponent(componentId, string);
                            void {
                                const: dependencies = this.componentDependencies.get(componentId),
                                if(dependencies) {
                                    for (const dep of dependencies) {
                                        this.removeComponentSubscription(dep.path, componentId);
                                        this.componentDependencies.delete(componentId);
                                        // Granular state updates
                                        updateState(path, string, value, any, operation, StatePathUpdate['operation'] = 'set');
                                        void {
                                            const: affectedComponents = this.getDependentComponents(path),
                                            const: update, StatePathUpdate = { path, value, operation },
                                            const: batch, StateUpdateBatch = {
                                                id: this.generateBatchId(),
                                                updates: [update],
                                                priority: this.calculateBatchPriority(affectedComponents),
                                                timestamp: Date.now(),
                                                affectedComponents
                                            },
                                            this: .scheduler.schedule(batch),
                                            batchUpdate(updates) {
                                                const allAffectedComponents = new Set();
                                                updates.forEach(update => { });
                                                const components = this.getDependentComponents(update.path);
                                                components.forEach(comp => allAffectedComponents.add(comp));
                                            },
                                            const: batch, StateUpdateBatch = {
                                                id: this.generateBatchId(),
                                                updates,
                                                priority: this.calculateBatchPriority(allAffectedComponents),
                                                timestamp: Date.now(),
                                                affectedComponents: allAffectedComponents,
                                            },
                                            this: .scheduler.schedule(batch),
                                            selector: (state) => R,
                                            dependencies: (keyof), T, []: ,
                                            options: {
                                                memoize: boolean,
                                                name: string,
                                                maxAge: number
                                            } = {},
                                            StateSelector() {
                                                const { memoize = true, name, maxAge = this.cacheTimeout } = options;
                                                if (!memoize) {
                                                    return selector;
                                                    const memoizedSelector = (state) => {
                                                        const cacheKey = this.generateCacheKey(name || selector.toString(), state, dependencies);
                                                        const cached = this.selectorCache.get(cacheKey);
                                                        // Check cache validity
                                                        if (cached && this.isCacheValid(cached, state, dependencies, maxAge)) {
                                                            cached.hitCount++;
                                                            cached.lastAccess = Date.now();
                                                            this.performanceMetrics.cacheHitRate = this.calculateCacheHitRate();
                                                            return cached.value;
                                                            // Execute selector and cache result
                                                            const startTime = performance.now();
                                                            const result = selector(state);
                                                            const executionTime = performance.now() - startTime;
                                                            // Track selector performance
                                                            if (name) {
                                                                this.performanceMetrics.selectorExecutionTime.set(name, executionTime);
                                                                // Cache the result
                                                                const cacheEntry = {
                                                                    key: cacheKey,
                                                                    value: result,
                                                                    dependencies: dependencies ? dependencies.map(dep => state[dep]) : [state],
                                                                    timestamp: Date.now(),
                                                                    hitCount: 0,
                                                                    lastAccess: Date.now(),
                                                                };
                                                                this.selectorCache.set(cacheKey, cacheEntry);
                                                                this.cleanupCache();
                                                                return result;
                                                            }
                                                            ;
                                                            memoizedSelector.dependencies = dependencies;
                                                            memoizedSelector.memoize = true;
                                                            memoizedSelector.name = name;
                                                            return memoizedSelector;
                                                            // State subscription with automatic cleanup
                                                            subscribe();
                                                            selector: (StateSelector),
                                                                callback;
                                                            (value, prevValue) => void ,
                                                                options;
                                                            {
                                                                componentId ?  : string;
                                                                immediate ?  : boolean;
                                                                equalityFn ?  : (a, b) => boolean;
                                                            }
                                                            { }
                                                        }
                                                    };
                                                    () => void {
                                                        const: { componentId, immediate = true, equalityFn = Object.is } = options,
                                                        const: subscriptionId = this.generateSubscriptionId(),
                                                        let, lastValue: any,
                                                        let, isInitialized = false,
                                                        const: wrappedCallback = (state) => {
                                                            const newValue = selector(state);
                                                            if (!isInitialized) {
                                                                lastValue = newValue;
                                                                isInitialized = true;
                                                                if (immediate) {
                                                                    callback(newValue, undefined);
                                                                    return;
                                                                    if (!equalityFn(newValue, lastValue)) {
                                                                        const prevValue = lastValue;
                                                                        lastValue = newValue;
                                                                        callback(newValue, prevValue);
                                                                    }
                                                                    ;
                                                                    // Register subscription
                                                                    this.on('stateChange', wrappedCallback);
                                                                    // Track component subscription
                                                                    if (componentId && selector.dependencies) {
                                                                        selector.dependencies.forEach(dep => { });
                                                                        this.registerComponentDependency(componentId, String(dep), selector);
                                                                    }
                                                                    ;
                                                                    return () => {
                                                                        this.off('stateChange', wrappedCallback);
                                                                        if (componentId) {
                                                                            this.unregisterComponent(componentId);
                                                                        }
                                                                        ;
                                                                        // Performance optimization methods
                                                                    };
                                                                    // Performance optimization methods
                                                                }
                                                                // Performance optimization methods
                                                            }
                                                            // Performance optimization methods
                                                        }
                                                        // Performance optimization methods
                                                        ,
                                                        // Performance optimization methods
                                                        getDependentComponents(path) {
                                                            const components = new Set();
                                                            // Direct dependencies
                                                            for (const [componentId, dependencies] of this.componentDependencies) {
                                                                for (const dep of dependencies) {
                                                                    if (this.pathMatches(dep.path, path)) {
                                                                        components.add(componentId);
                                                                        // Derived dependencies through state graph
                                                                        const graphNode = this.stateGraph.nodes.get(path);
                                                                        if (graphNode) {
                                                                            graphNode.dependents.forEach(dependentPath => { });
                                                                            const dependentComponents = this.getDependentComponents(dependentPath);
                                                                            dependentComponents.forEach(comp => components.add(comp));
                                                                        }
                                                                        ;
                                                                        return components;
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        calculateBatchPriority(affectedComponents) {
                                                            let maxPriority = 'low';
                                                            for (const componentId of affectedComponents) {
                                                                const dependencies = this.componentDependencies.get(componentId);
                                                                if (dependencies) {
                                                                    for (const dep of dependencies) {
                                                                        if (this.comparePriority(dep.priority, maxPriority) > 0) {
                                                                            maxPriority = dep.priority;
                                                                            return maxPriority;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }((a, b) => {
                                                        const priorities = { low: 0, normal: 1, high: 2, critical: 3 };
                                                        return priorities[a] - priorities[b];
                                                        // State graph management
                                                    }
                                                    // State graph management
                                                    , 
                                                    // State graph management
                                                    private, addNodeToGraph(path, string), void {
                                                        : .stateGraph.nodes.has(path)
                                                    });
                                                    {
                                                        const node = {
                                                            path,
                                                            value: undefined,
                                                            dependencies: new Set(),
                                                            dependents: new Set(),
                                                            lastModified: Date.now(),
                                                            accessCount: 0,
                                                            subscriptions: new Set(),
                                                        };
                                                        this.stateGraph.nodes.set(path, node);
                                                        // Check if this is a root path
                                                        if (!path.includes('.')) {
                                                            this.stateGraph.rootPaths.add(path);
                                                        }
                                                    }
                                                }
                                            },
                                            addComponentSubscription(path, componentId) {
                                                const node = this.stateGraph.nodes.get(path);
                                                if (node) {
                                                    node.subscriptions.add(componentId);
                                                }
                                            },
                                            removeComponentSubscription(path, componentId) {
                                                const node = this.stateGraph.nodes.get(path);
                                                if (node) {
                                                    node.subscriptions.delete(componentId);
                                                    // Update scheduler implementation
                                                }
                                                // Update scheduler implementation
                                            }
                                            // Update scheduler implementation
                                            ,
                                            // Update scheduler implementation
                                            createUpdateScheduler() {
                                                return {
                                                    schedule: (batch) => {
                                                        this.batchQueue.push(batch);
                                                        this.scheduleFlush();
                                                    },
                                                    flush: async () => {
                                                        await this.processBatchQueue();
                                                    },
                                                    clear: () => {
                                                        this.batchQueue = [];
                                                    },
                                                    getQueueSize: () => {
                                                        return this.batchQueue.length;
                                                    },
                                                    getScheduledUpdates: () => {
                                                        return [...this.batchQueue];
                                                    },
                                                    scheduleFlush() {
                                                        if (this.isProcessing)
                                                            return;
                                                        // Use React's scheduler for optimal timing
                                                        if (typeof requestIdleCallback !== 'undefined') {
                                                            requestIdleCallback(() => {
                                                                this.processBatchQueue();
                                                            });
                                                        }
                                                        else {
                                                            // Fallback for environments without requestIdleCallback
                                                            setTimeout(() => {
                                                                this.processBatchQueue();
                                                            }, 0);
                                                        }
                                                    },
                                                    async processBatchQueue() {
                                                        if (this.isProcessing || this.batchQueue.length === 0)
                                                            return;
                                                        this.isProcessing = true;
                                                        const startTime = performance.now();
                                                        try {
                                                            // Sort batches by priority
                                                            this.batchQueue.sort((a, b) => this.comparePriority(b.priority, a.priority));
                                                            // Group batches by affected components to minimize re-renders
                                                            const componentBatches = this.groupBatchesByComponents(this.batchQueue);
                                                            // Process each component group
                                                            for (const [componentId, batches] of componentBatches) {
                                                                await this.processComponentBatches(componentId, batches);
                                                                this.batchQueue = [];
                                                                this.performanceMetrics.batchCount++;
                                                            }
                                                            try { }
                                                            finally {
                                                                this.isProcessing = false;
                                                                const processingTime = performance.now() - startTime;
                                                                this.performanceMetrics.updateLatency.push(processingTime);
                                                                // Keep only recent latency measurements
                                                                if (this.performanceMetrics.updateLatency.length > 100) {
                                                                    this.performanceMetrics.updateLatency = this.performanceMetrics.updateLatency.slice(-50);
                                                                }
                                                            }
                                                        }
                                                        finally {
                                                        }
                                                    },
                                                    groupBatchesByComponents(batches) {
                                                        const groups = new Map();
                                                        batches.forEach(batch => { });
                                                        batch.affectedComponents.forEach(componentId => { });
                                                        if (!groups.has(componentId)) {
                                                            groups.set(componentId, []);
                                                            groups.get(componentId).push(batch);
                                                        }
                                                        ;
                                                    },
                                                    return: groups,
                                                    async processComponentBatches(componentId, batches) {
                                                        const startTime = performance.now();
                                                        try {
                                                            // Check if component should be updated
                                                            if (this.shouldSkipUpdate(componentId, batches)) {
                                                                this.performanceMetrics.skipCount++;
                                                                return;
                                                                // Apply all updates for this component
                                                                const allUpdates = batches.flatMap(batch => batch.updates);
                                                                await this.applyUpdates(allUpdates);
                                                                // Notify component of update
                                                                this.emit('componentUpdate', {});
                                                                componentId,
                                                                    updates;
                                                                allUpdates,
                                                                    timestamp;
                                                                Date.now(),
                                                                ;
                                                            }
                                                            ;
                                                            this.performanceMetrics.renderCount++;
                                                        }
                                                        finally {
                                                            const updateTime = performance.now() - startTime;
                                                            this.performanceMetrics.componentUpdateTime.set(componentId, updateTime);
                                                        }
                                                    },
                                                    shouldSkipUpdate(componentId, batches) {
                                                        // Check if component has been updated recently
                                                        const lastUpdateTime = this.performanceMetrics.componentUpdateTime.get(componentId) || 0;
                                                        const timeSinceLastUpdate = Date.now() - lastUpdateTime;
                                                        // Skip if updated very recently (< 16ms for 60fps)
                                                        if (timeSinceLastUpdate < 16) {
                                                            return true;
                                                            // Check if the updates would actually change the component's derived state
                                                            const dependencies = this.componentDependencies.get(componentId);
                                                            if (!dependencies)
                                                                return true;
                                                            for (const dep of dependencies) {
                                                                if (dep.selector && dep.lastValue !== undefined) {
                                                                    // Would need to compute new value and compare with last value
                                                                    // This is a simplified check
                                                                    const hasRelevantUpdates = batches.some(batch => );
                                                                    ;
                                                                    batch.updates.some(update => this.pathMatches(dep.path, update.path));
                                                                    ;
                                                                    if (hasRelevantUpdates) {
                                                                        return false;
                                                                        return true;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    async applyUpdates(updates) {
                                                        // Apply all updates to the state graph
                                                        updates.forEach(update => { });
                                                        const node = this.stateGraph.nodes.get(update.path);
                                                        if (node) {
                                                            switch (update.operation) {
                                                                case 'set':
                                                                    node.value = update.value;
                                                                    break;
                                                                case 'merge':
                                                                    if (typeof node.value === 'object' && typeof update.value === 'object') {
                                                                        node.value = { ...node.value, ...update.value };
                                                                    }
                                                                    else {
                                                                        node.value = update.value;
                                                                        break;
                                                                    }
                                                                case 'delete':
                                                                    node.value = undefined;
                                                                    break;
                                                                    // Add more operations as needed
                                                                    node.lastModified = Date.now();
                                                                    node.accessCount++;
                                                            }
                                                            ;
                                                            // Invalidate affected caches
                                                            this.invalidateRelatedCaches(updates);
                                                            // Cache management
                                                        }
                                                        // Cache management
                                                    }
                                                    // Cache management
                                                    ,
                                                    selectorName: string,
                                                    state: any,
                                                    dependencies: (keyof), any, []: ,
                                                    string
                                                };
                                                {
                                                    const depValues = dependencies;
                                                    dependencies.map(dep => state[dep]).join('|');
                                                    JSON.stringify(state);
                                                    return `${selectorName}:${this.hashString(depValues)}`;
                                                }
                                            },
                                            cached: (SelectorCache),
                                            state: any,
                                            dependencies: (keyof), any, []: ,
                                            maxAge: number,
                                            boolean
                                        };
                                        {
                                            // Check age
                                            if (maxAge && Date.now() - cached.timestamp > maxAge) {
                                                return false;
                                                // Check dependencies
                                                if (dependencies) {
                                                    const currentDeps = dependencies.map(dep => state[dep]);
                                                    return currentDeps.every((dep, index) => Object.is(dep, cached.dependencies[index]));
                                                    return Object.is(state, cached.dependencies[0]);
                                                }
                                            }
                                        }
                                    }
                                },
                                invalidateRelatedCaches(updates) {
                                    const affectedPaths = new Set(updates.map(u => u.path));
                                    for (const [key, cached] of this.selectorCache) {
                                        // Simple invalidation - could be more sophisticated
                                        if (updates.some(update => key.includes(update.path))) {
                                            this.selectorCache.delete(key);
                                        }
                                    }
                                },
                                cleanupCache() {
                                    if (this.selectorCache.size <= this.maxCacheSize)
                                        return;
                                    // Remove oldest entries
                                    const entries = Array.from(this.selectorCache.entries());
                                },
                                : 
                                    .sort(([a], [b]) => a.lastAccess - b.lastAccess),
                                const: toRemove = entries.slice(0, entries.length - this.maxCacheSize),
                                toRemove, : .forEach(([key]) => this.selectorCache.delete(key)),
                                calculateCacheHitRate() {
                                    const totalHits = Array.from(this.selectorCache.values());
                                },
                                : 
                                    .reduce((sum, cache) => sum + cache.hitCount, 0),
                                const: totalCalls = Array.from(this.selectorCache.values()).length + totalHits,
                                return: totalCalls > 0 ? totalHits / totalCalls : 0,
                                // Utility methods
                                pathMatches(pattern, path) {
                                    // Simple path matching - could be enhanced with glob patterns
                                    return pattern === path || path.startsWith(pattern + '.');
                                },
                                hashString(str) {
                                    let hash = 0;
                                    for (let i = 0; i < str.length; i++) {
                                        const char = str.charCodeAt(i);
                                        hash = ((hash << 5) - hash) + char;
                                        hash = hash & hash; // Convert to 32-bit integer
                                        return hash.toString(36);
                                    }
                                },
                                generateBatchId() {
                                    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                },
                                generateSubscriptionId() {
                                    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                },
                                setupCleanupTimer() {
                                    // Clean up caches and old metrics every minute
                                    setInterval(() => {
                                        this.cleanupCache();
                                        this.cleanupOldMetrics();
                                    }, 60000);
                                },
                                cleanupOldMetrics() {
                                    // Keep only recent performance data
                                    const now = Date.now();
                                    const maxAge = 10 * 60 * 1000; // 10 minutes;
                                    // Clean up old cache entries
                                    for (const [key, cached] of this.selectorCache) {
                                        if (now - cached.lastAccess > maxAge) {
                                            this.selectorCache.delete(key);
                                            // Public API methods
                                            getPerformanceMetrics();
                                            Readonly < PerformanceMetrics > {
                                                return: {
                                                    ...this.performanceMetrics,
                                                    updateLatency: [...this.performanceMetrics.updateLatency],
                                                    selectorExecutionTime: new Map(this.performanceMetrics.selectorExecutionTime),
                                                    componentUpdateTime: new Map(this.performanceMetrics.componentUpdateTime),
                                                },
                                                getStateGraph() {
                                                    return {
                                                        nodes: new Map(this.stateGraph.nodes),
                                                        edges: new Map(this.stateGraph.edges),
                                                        rootPaths: new Set(this.stateGraph.rootPaths),
                                                        dependencyMap: new Map(this.stateGraph.dependencyMap),
                                                    };
                                                    getCacheStats();
                                                    {
                                                        size: number;
                                                        hitRate: number;
                                                        totalHits: number;
                                                        oldestEntry: number;
                                                        newestEntry: number;
                                                        const caches = Array.from(this.selectorCache.values());
                                                        const totalHits = caches.reduce((sum, cache) => sum + cache.hitCount, 0);
                                                        const timestamps = caches.map(cache => cache.timestamp);
                                                        return {
                                                            size: this.selectorCache.size,
                                                            hitRate: this.calculateCacheHitRate(),
                                                            totalHits,
                                                            oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
                                                            newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0,
                                                        };
                                                        // Debug methods
                                                        debugComponentDependencies(componentId ?  : string);
                                                        any;
                                                        {
                                                            if (componentId) {
                                                                return Array.from(this.componentDependencies.get(componentId) || []);
                                                                const result = {};
                                                                for (const [id, deps] of this.componentDependencies) {
                                                                    result[id] = Array.from(deps);
                                                                    return result;
                                                                    debugStateGraph();
                                                                    any;
                                                                    {
                                                                        return {
                                                                            nodeCount: this.stateGraph.nodes.size,
                                                                            edgeCount: this.stateGraph.edges.size,
                                                                            rootPaths: Array.from(this.stateGraph.rootPaths),
                                                                            nodes: Array.from(this.stateGraph.nodes.entries()).map(([path, node]) => ({}), path, subscriptions, node.subscriptions.size, dependencies, node.dependencies.size, dependents, node.dependents.size, lastModified, new Date(node.lastModified).toISOString(), accessCount, node.accessCount)
                                                                        };
                                                                    }
                                                                    ;
                                                                    // Global selective state manager instance
                                                                    export const globalSelectiveStateManager = new SelectiveStateManager();
                                                                }
                                                            }
                                                        }
                                                    }
                                                } };
                                        }
                                    }
                                }
                            };
                        }
                    }
                }
            };
        }
    }
}

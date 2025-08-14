/**
 * PreviewEngine - Manages debounced graph execution for Epic 1
 *
 * Provides intelligent debouncing to prevent excessive executions during rapid edits
 * while maintaining responsive preview updates.
 */
import { Epic1ExecutionEngine } from '../../../runtime/nodes/epic1/Epic1ExecutionEngine';
import { PreviewCache } from './PreviewCache';
export var PreviewState;
(function (PreviewState) {
    PreviewState["IDLE"] = "idle";
    PreviewState["PENDING"] = "pending";
    PreviewState["EXECUTING"] = "executing";
    PreviewState["ERROR"] = "error";
    PreviewState["CACHED"] = "cached";
})(PreviewState || (PreviewState = {}));
/**
 * PreviewEngine - Intelligent debounced graph execution with caching and WebWorker support
 */
export class PreviewEngine {
    debounceDelay;
    maxExecutionTime;
    seeds;
    cache = null;
    workerPool = null;
    workerPoolInitialized = false;
    webWorkerEnabled;
    workerPoolSize;
    debounceTimer = null;
    currentExecution = null;
    executionAbortController = null;
    state = PreviewState.IDLE;
    lastUpdate = null;
    updateCallbacks = new Set();
    // Track current graph for caching
    currentNodes = [];
    currentEdges = [];
    constructor(options = {}) {
        this.debounceDelay = options.debounceDelay ?? 300;
        this.maxExecutionTime = options.maxExecutionTime ?? 5000;
        // Use Pi-based seeds: pi digits starting at different positions
        this.seeds = options.seeds ?? [3141, 5926, 5358, 9793];
        this.webWorkerEnabled = options.enableWebWorker !== false;
        this.workerPoolSize = options.workerPoolSize ?? 4;
        // Initialize cache if enabled
        if (options.enableCache !== false) {
            this.cache = new PreviewCache(options.cacheMaxSize ?? 100, options.cacheMaxAgeMinutes ?? 30);
        }
    }
    /**
     * Initialize worker pool lazily with proper Vite worker import
     */
    async initializeWorkerPool() {
        if (this.workerPoolInitialized ||
            !this.webWorkerEnabled ||
            typeof Worker === 'undefined') {
            return;
        }
        // Temporarily disable WebWorkers completely until we resolve the build issues
        // The Vite worker import syntax is causing problems in multiple environments
        console.log('WebWorkers temporarily disabled - using main thread execution');
        this.webWorkerEnabled = false;
        this.workerPoolInitialized = true;
        return;
    }
    /**
     * Subscribe to preview updates
     */
    subscribe(callback) {
        this.updateCallbacks.add(callback);
        // Send current state immediately
        if (this.lastUpdate) {
            callback(this.lastUpdate);
        }
        // Return unsubscribe function
        return () => {
            this.updateCallbacks.delete(callback);
        };
    }
    /**
     * Update preview with debouncing
     */
    updatePreview(graph, nodes, edges) {
        // Store current graph structure for caching
        this.currentNodes = nodes;
        this.currentEdges = edges;
        // Check cache first
        if (this.cache) {
            const cachedResults = this.cache.get(nodes, edges, this.seeds);
            if (cachedResults) {
                // Found in cache - return immediately
                const stats = this.cache.getStats();
                this.setState(PreviewState.CACHED, cachedResults, undefined, true, {
                    hitRate: stats.hitRate,
                    size: stats.size
                });
                return;
            }
        }
        // Not in cache - proceed with debouncing
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        // Cancel any in-progress execution
        this.cancelCurrentExecution();
        // Update state to pending
        this.setState(PreviewState.PENDING);
        // Set up new debounce timer
        this.debounceTimer = setTimeout(() => {
            this.executeGraph(graph);
        }, this.debounceDelay);
    }
    /**
     * Force immediate preview update (bypasses debouncing)
     */
    async updatePreviewImmediate(graph, nodes, edges) {
        // Store current graph structure for caching
        this.currentNodes = nodes;
        this.currentEdges = edges;
        // Check cache first
        if (this.cache) {
            const cachedResults = this.cache.get(nodes, edges, this.seeds);
            if (cachedResults) {
                // Found in cache - return immediately
                const stats = this.cache.getStats();
                this.setState(PreviewState.CACHED, cachedResults, undefined, true, {
                    hitRate: stats.hitRate,
                    size: stats.size
                });
                return;
            }
        }
        // Cancel any pending debounce
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        // Cancel any in-progress execution
        this.cancelCurrentExecution();
        // Execute immediately
        await this.executeGraph(graph);
    }
    /**
     * Execute graph with multiple seeds
     */
    async executeGraph(graph) {
        // Update state
        this.setState(PreviewState.EXECUTING);
        // Create abort controller for this execution
        this.executionAbortController = new AbortController();
        const signal = this.executionAbortController.signal;
        try {
            let results;
            // Initialize worker pool if needed
            if (this.webWorkerEnabled && !this.workerPoolInitialized) {
                await this.initializeWorkerPool();
            }
            // Use worker pool if available
            if (this.workerPool && !this.workerPool.isTerminated()) {
                try {
                    // Track progress for each seed
                    const progressMap = new Map();
                    results = await this.workerPool.executeMultiple(graph, this.seeds, (index, progress) => {
                        progressMap.set(index, progress);
                        // You could emit progress updates here if needed
                    });
                    // Add worker stats to state update
                    const workerStats = this.workerPool.getStats();
                    this.setState(PreviewState.IDLE, results, undefined, false, this.cache
                        ? {
                            hitRate: this.cache.getStats().hitRate,
                            size: this.cache.getStats().size
                        }
                        : undefined, workerStats);
                }
                catch (workerError) {
                    console.warn('Worker execution failed, falling back to main thread:', workerError);
                    // Fall back to main thread execution
                    results = await this.executeOnMainThread(graph, signal);
                }
            }
            else {
                // Execute on main thread
                results = await this.executeOnMainThread(graph, signal);
            }
            // Check if still not aborted
            if (!signal.aborted) {
                // Store in cache
                if (this.cache) {
                    this.cache.set(this.currentNodes, this.currentEdges, this.seeds, results);
                }
                // Update state with stats if not already done by worker path
                if (!this.workerPool || this.workerPool.isTerminated()) {
                    const cacheStats = this.cache
                        ? {
                            hitRate: this.cache.getStats().hitRate,
                            size: this.cache.getStats().size
                        }
                        : undefined;
                    this.setState(PreviewState.IDLE, results, undefined, false, cacheStats);
                }
            }
        }
        catch (error) {
            // Only update error state if not aborted
            if (!signal.aborted) {
                this.setState(PreviewState.ERROR, undefined, error);
            }
        }
        finally {
            // Clean up
            this.currentExecution = null;
            this.executionAbortController = null;
        }
    }
    /**
     * Execute graph on main thread (fallback)
     */
    async executeOnMainThread(graph, signal) {
        const executionPromises = this.seeds.map(async (seed) => {
            // Check if aborted before starting
            if (signal.aborted) {
                throw new Error('Execution cancelled');
            }
            const engine = new Epic1ExecutionEngine(graph, seed);
            // Execute with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Execution timeout')), this.maxExecutionTime);
            });
            const abortPromise = new Promise((_, reject) => {
                signal.addEventListener('abort', () => reject(new Error('Execution cancelled')));
            });
            return Promise.race([engine.execute(), timeoutPromise, abortPromise]);
        });
        // Store current execution promise
        this.currentExecution = Promise.all(executionPromises);
        return this.currentExecution;
    }
    /**
     * Cancel current execution
     */
    cancelCurrentExecution() {
        if (this.executionAbortController) {
            this.executionAbortController.abort();
            this.executionAbortController = null;
        }
        this.currentExecution = null;
    }
    /**
     * Update state and notify subscribers
     */
    setState(state, results, error, cached, cacheStats, workerStats) {
        this.state = state;
        const update = {
            state,
            results,
            error,
            timestamp: Date.now(),
            cached,
            cacheStats,
            workerStats
        };
        this.lastUpdate = update;
        // Notify all subscribers
        this.updateCallbacks.forEach(callback => {
            try {
                callback(update);
            }
            catch (err) {
                console.error('Error in preview update callback:', err);
            }
        });
    }
    /**
     * Get current state
     */
    getState() {
        return this.state;
    }
    /**
     * Get last update
     */
    getLastUpdate() {
        return this.lastUpdate;
    }
    /**
     * Update seeds
     */
    setSeeds(seeds) {
        this.seeds = seeds;
    }
    /**
     * Get current seeds
     */
    getSeeds() {
        return [...this.seeds];
    }
    /**
     * Update debounce delay
     */
    setDebounceDelay(delay) {
        this.debounceDelay = Math.max(0, delay);
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        if (!this.cache) {
            return { enabled: false };
        }
        return {
            enabled: true,
            stats: this.cache.getStats()
        };
    }
    /**
     * Clear the cache
     */
    clearCache() {
        if (this.cache) {
            this.cache.clear();
        }
    }
    /**
     * Clear expired cache entries
     */
    clearExpiredCache() {
        if (this.cache) {
            this.cache.clearExpired();
        }
    }
    /**
     * Get cache size information
     */
    getCacheSizeInfo() {
        return this.cache ? this.cache.getSizeInfo() : null;
    }
    /**
     * Enable or disable caching
     */
    setCacheEnabled(enabled) {
        if (enabled && !this.cache) {
            this.cache = new PreviewCache();
        }
        else if (!enabled && this.cache) {
            this.cache = null;
        }
    }
    /**
     * Get worker pool statistics
     */
    getWorkerStats() {
        return this.workerPool ? this.workerPool.getStats() : null;
    }
    /**
     * Enable or disable web workers
     */
    setWebWorkerEnabled(enabled) {
        this.webWorkerEnabled = enabled;
        if (!enabled && this.workerPool) {
            this.workerPool.terminate();
            this.workerPool = null;
            this.workerPoolInitialized = false;
        }
    }
    /**
     * Check if web workers are enabled
     */
    isWebWorkerEnabled() {
        return this.workerPool !== null && !this.workerPool.isTerminated();
    }
    /**
     * Clean up resources
     */
    dispose() {
        // Cancel any pending operations
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        this.cancelCurrentExecution();
        // Clear callbacks
        this.updateCallbacks.clear();
        // Clear cache
        if (this.cache) {
            this.cache.clear();
        }
        // Terminate worker pool
        if (this.workerPool) {
            this.workerPool.terminate();
            this.workerPool = null;
        }
    }
}

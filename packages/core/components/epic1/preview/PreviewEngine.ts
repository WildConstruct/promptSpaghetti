/**
 * PreviewEngine - Manages debounced graph execution for Epic 1
 *
 * Provides intelligent debouncing to prevent excessive executions during rapid edits
 * while maintaining responsive preview updates.
 */

import {
  Epic1ExecutionEngine,
  Epic1Graph,
  ExecutionResult
} from '../../../runtime/nodes/epic1/Epic1ExecutionEngine';
import { BaseInlineEditableNode } from '../../../runtime/nodes/epic1/BaseInlineEditableNode';
import { PreviewCache } from './PreviewCache';
import { WorkerPool } from './WorkerPool';
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';

export enum PreviewState {
  IDLE = 'idle',
  PENDING = 'pending',
  EXECUTING = 'executing',
  ERROR = 'error',
  CACHED = 'cached'
}

export interface PreviewOptions {
  debounceDelay?: number;
  maxExecutionTime?: number;
  seeds?: (string | number)[];
  enableCache?: boolean;
  cacheMaxSize?: number;
  cacheMaxAgeMinutes?: number;
  enableWebWorker?: boolean;
  workerPoolSize?: number;
}

export interface PreviewUpdate {
  state: PreviewState;
  results?: ExecutionResult[];
  error?: Error;
  timestamp: number;
  cached?: boolean;
  cacheStats?: {
    hitRate: number;
    size: number;
  };
  workerStats?: {
    totalWorkers: number;
    busyWorkers: number;
    queuedTasks: number;
  };
}

export type PreviewUpdateCallback = (update: PreviewUpdate) => void;

/**
 * PreviewEngine - Intelligent debounced graph execution with caching and WebWorker support
 */
export class PreviewEngine {
  private debounceDelay: number;
  private maxExecutionTime: number;
  private seeds: (string | number)[];
  private cache: PreviewCache | null = null;
  private workerPool: WorkerPool | null = null;
  private workerPoolInitialized = false;
  private webWorkerEnabled: boolean;
  private workerPoolSize: number;

  private debounceTimer: NodeJS.Timeout | null = null;
  private currentExecution: Promise<ExecutionResult[]> | null = null;
  private executionAbortController: AbortController | null = null;

  private state: PreviewState = PreviewState.IDLE;
  private lastUpdate: PreviewUpdate | null = null;
  private updateCallbacks: Set<PreviewUpdateCallback> = new Set();

  // Track current graph for caching
  private currentNodes: ReactFlowNode[] = [];
  private currentEdges: ReactFlowEdge[] = [];

  constructor(options: PreviewOptions = {}) {
    this.debounceDelay = options.debounceDelay ?? 300;
    this.maxExecutionTime = options.maxExecutionTime ?? 5000;
    // Use Pi-based seeds: pi digits starting at different positions
    this.seeds = options.seeds ?? [3141, 5926, 5358, 9793];
    this.webWorkerEnabled = options.enableWebWorker !== false;
    this.workerPoolSize = options.workerPoolSize ?? 4;

    // Initialize cache if enabled
    if (options.enableCache !== false) {
      this.cache = new PreviewCache(
        options.cacheMaxSize ?? 100,
        options.cacheMaxAgeMinutes ?? 30
      );
    }
  }

  /**
   * Initialize worker pool lazily with proper Vite worker import
   */
  private async initializeWorkerPool(): Promise<void> {
    if (
      this.workerPoolInitialized ||
      !this.webWorkerEnabled ||
      typeof Worker === 'undefined'
    ) {
      return;
    }

    // Temporarily disable WebWorkers completely until we resolve the build issues
    // The Vite worker import syntax is causing problems in multiple environments
    console.log(
      'WebWorkers temporarily disabled - using main thread execution'
    );
    this.webWorkerEnabled = false;
    this.workerPoolInitialized = true;
    return;
  }

  /**
   * Subscribe to preview updates
   */
  subscribe(callback: PreviewUpdateCallback): () => void {
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
  updatePreview(
    graph: Epic1Graph,
    nodes: ReactFlowNode[],
    edges: ReactFlowEdge[]
  ): void {
    // Store current graph structure for caching
    this.currentNodes = nodes;
    this.currentEdges = edges;

    // Check cache first
    if (this.cache) {
      const cachedResults = this.cache.get(
        nodes,
        edges,
        this.seeds as number[]
      );
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
  async updatePreviewImmediate(
    graph: Epic1Graph,
    nodes: ReactFlowNode[],
    edges: ReactFlowEdge[]
  ): Promise<void> {
    // Store current graph structure for caching
    this.currentNodes = nodes;
    this.currentEdges = edges;

    // Check cache first
    if (this.cache) {
      const cachedResults = this.cache.get(
        nodes,
        edges,
        this.seeds as number[]
      );
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
  private async executeGraph(graph: Epic1Graph): Promise<void> {
    // Update state
    this.setState(PreviewState.EXECUTING);

    // Create abort controller for this execution
    this.executionAbortController = new AbortController();
    const signal = this.executionAbortController.signal;

    try {
      let results: ExecutionResult[];

      // Initialize worker pool if needed
      if (this.webWorkerEnabled && !this.workerPoolInitialized) {
        await this.initializeWorkerPool();
      }

      // Use worker pool if available
      if (this.workerPool && !this.workerPool.isTerminated()) {
        try {
          // Track progress for each seed
          const progressMap = new Map<number, number>();

          results = await this.workerPool.executeMultiple(
            graph,
            this.seeds,
            (index, progress) => {
              progressMap.set(index, progress);
              // You could emit progress updates here if needed
            }
          );

          // Add worker stats to state update
          const workerStats = this.workerPool.getStats();
          this.setState(
            PreviewState.IDLE,
            results,
            undefined,
            false,
            this.cache
              ? {
                  hitRate: this.cache.getStats().hitRate,
                  size: this.cache.getStats().size
                }
              : undefined,
            workerStats
          );
        } catch (workerError) {
          console.warn(
            'Worker execution failed, falling back to main thread:',
            workerError
          );
          // Fall back to main thread execution
          results = await this.executeOnMainThread(graph, signal);
        }
      } else {
        // Execute on main thread
        results = await this.executeOnMainThread(graph, signal);
      }

      // Check if still not aborted
      if (!signal.aborted) {
        // Store in cache
        if (this.cache) {
          this.cache.set(
            this.currentNodes,
            this.currentEdges,
            this.seeds as number[],
            results
          );
        }

        // Update state with stats if not already done by worker path
        if (!this.workerPool || this.workerPool.isTerminated()) {
          const cacheStats = this.cache
            ? {
                hitRate: this.cache.getStats().hitRate,
                size: this.cache.getStats().size
              }
            : undefined;

          this.setState(
            PreviewState.IDLE,
            results,
            undefined,
            false,
            cacheStats
          );
        }
      }
    } catch (error) {
      // Only update error state if not aborted
      if (!signal.aborted) {
        this.setState(PreviewState.ERROR, undefined, error as Error);
      }
    } finally {
      // Clean up
      this.currentExecution = null;
      this.executionAbortController = null;
    }
  }

  /**
   * Execute graph on main thread (fallback)
   */
  private async executeOnMainThread(
    graph: Epic1Graph,
    signal: AbortSignal
  ): Promise<ExecutionResult[]> {
    const executionPromises = this.seeds.map(async seed => {
      // Check if aborted before starting
      if (signal.aborted) {
        throw new Error('Execution cancelled');
      }

      const engine = new Epic1ExecutionEngine(graph, seed);

      // Execute with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('Execution timeout')),
          this.maxExecutionTime
        );
      });

      const abortPromise = new Promise<never>((_, reject) => {
        signal.addEventListener('abort', () =>
          reject(new Error('Execution cancelled'))
        );
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
  private cancelCurrentExecution(): void {
    if (this.executionAbortController) {
      this.executionAbortController.abort();
      this.executionAbortController = null;
    }
    this.currentExecution = null;
  }

  /**
   * Update state and notify subscribers
   */
  private setState(
    state: PreviewState,
    results?: ExecutionResult[],
    error?: Error,
    cached?: boolean,
    cacheStats?: { hitRate: number; size: number },
    workerStats?: {
      totalWorkers: number;
      busyWorkers: number;
      queuedTasks: number;
    }
  ): void {
    this.state = state;

    const update: PreviewUpdate = {
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
      } catch (err) {
        console.error('Error in preview update callback:', err);
      }
    });
  }

  /**
   * Get current state
   */
  getState(): PreviewState {
    return this.state;
  }

  /**
   * Get last update
   */
  getLastUpdate(): PreviewUpdate | null {
    return this.lastUpdate;
  }

  /**
   * Update seeds
   */
  setSeeds(seeds: (string | number)[]): void {
    this.seeds = seeds;
  }
  
  /**
   * Update seeds (alias for setSeeds)
   */
  updateSeeds(seeds: (string | number)[]): void {
    this.setSeeds(seeds);
  }

  /**
   * Get current seeds
   */
  getSeeds(): (string | number)[] {
    return [...this.seeds];
  }

  /**
   * Update debounce delay
   */
  setDebounceDelay(delay: number): void {
    this.debounceDelay = Math.max(0, delay);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    enabled: boolean;
    stats?: ReturnType<PreviewCache['getStats']>;
  } {
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
  clearCache(): void {
    if (this.cache) {
      this.cache.clear();
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    if (this.cache) {
      this.cache.clearExpired();
    }
  }

  /**
   * Get cache size information
   */
  getCacheSizeInfo(): ReturnType<PreviewCache['getSizeInfo']> | null {
    return this.cache ? this.cache.getSizeInfo() : null;
  }

  /**
   * Enable or disable caching
   */
  setCacheEnabled(enabled: boolean): void {
    if (enabled && !this.cache) {
      this.cache = new PreviewCache();
    } else if (!enabled && this.cache) {
      this.cache = null;
    }
  }

  /**
   * Get worker pool statistics
   */
  getWorkerStats(): ReturnType<WorkerPool['getStats']> | null {
    return this.workerPool ? this.workerPool.getStats() : null;
  }

  /**
   * Enable or disable web workers
   */
  setWebWorkerEnabled(enabled: boolean): void {
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
  isWebWorkerEnabled(): boolean {
    return this.workerPool !== null && !this.workerPool.isTerminated();
  }

  /**
   * Clean up resources
   */
  dispose(): void {
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

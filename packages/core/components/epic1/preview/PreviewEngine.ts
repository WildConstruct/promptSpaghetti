/**
 * PreviewEngine - Manages debounced graph execution for Epic 1
 * 
 * Provides intelligent debouncing to prevent excessive executions during rapid edits
 * while maintaining responsive preview updates.
 */

import { Epic1ExecutionEngine, Epic1Graph, ExecutionResult } from '../../../runtime/nodes/epic1/Epic1ExecutionEngine';
import { BaseInlineEditableNode } from '../../../runtime/nodes/epic1/BaseInlineEditableNode';

export enum PreviewState {
  IDLE = 'idle',
  PENDING = 'pending',
  EXECUTING = 'executing',
  ERROR = 'error'
}

export interface PreviewOptions {
  debounceDelay?: number;
  maxExecutionTime?: number;
  seeds?: (string | number)[];
}

export interface PreviewUpdate {
  state: PreviewState;
  results?: ExecutionResult[];
  error?: Error;
  timestamp: number;
}

export type PreviewUpdateCallback = (update: PreviewUpdate) => void;

/**
 * PreviewEngine - Intelligent debounced graph execution
 */
export class PreviewEngine {
  private debounceDelay: number;
  private maxExecutionTime: number;
  private seeds: (string | number)[];
  
  private debounceTimer: NodeJS.Timeout | null = null;
  private currentExecution: Promise<ExecutionResult[]> | null = null;
  private executionAbortController: AbortController | null = null;
  
  private state: PreviewState = PreviewState.IDLE;
  private lastUpdate: PreviewUpdate | null = null;
  private updateCallbacks: Set<PreviewUpdateCallback> = new Set();

  constructor(options: PreviewOptions = {}) {
    this.debounceDelay = options.debounceDelay ?? 300;
    this.maxExecutionTime = options.maxExecutionTime ?? 5000;
    this.seeds = options.seeds ?? [1234, 5678, 9012];
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
  updatePreview(graph: Epic1Graph): void {
    // Cancel any pending debounce
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
  async updatePreviewImmediate(graph: Epic1Graph): Promise<void> {
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
      // Execute with multiple seeds in parallel
      const executionPromises = this.seeds.map(async (seed) => {
        // Check if aborted before starting
        if (signal.aborted) {
          throw new Error('Execution cancelled');
        }

        const engine = new Epic1ExecutionEngine(graph, seed);
        
        // Execute with timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Execution timeout')), this.maxExecutionTime);
        });

        const abortPromise = new Promise<never>((_, reject) => {
          signal.addEventListener('abort', () => reject(new Error('Execution cancelled')));
        });

        return Promise.race([
          engine.execute(),
          timeoutPromise,
          abortPromise
        ]);
      });

      // Store current execution promise
      this.currentExecution = Promise.all(executionPromises);

      // Wait for all executions to complete
      const results = await this.currentExecution;

      // Check if still not aborted
      if (!signal.aborted) {
        this.setState(PreviewState.IDLE, results);
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
  private setState(state: PreviewState, results?: ExecutionResult[], error?: Error): void {
    this.state = state;
    
    const update: PreviewUpdate = {
      state,
      results,
      error,
      timestamp: Date.now()
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
  }
}
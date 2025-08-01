/**
 * WebWorker for Epic 1 graph execution
 * 
 * Runs graph execution in a separate thread to prevent UI blocking
 * during complex or long-running graph computations.
 */

import { Epic1ExecutionEngine, Epic1Graph, ExecutionResult } from '../../../runtime/nodes/epic1/Epic1ExecutionEngine';

// Message types for worker communication
export interface WorkerRequest {
  type: 'execute';
  id: string;
  graph: Epic1Graph;
  seed: string | number;
}

export interface WorkerResponse {
  type: 'result' | 'error' | 'progress';
  id: string;
  result?: ExecutionResult;
  error?: string;
  progress?: number;
}

// Worker context type assertion
declare const self: DedicatedWorkerGlobalScope;

/**
 * Execute a graph with progress reporting
 */
async function executeGraph(graph: Epic1Graph, seed: string | number): Promise<ExecutionResult> {
  try {
    // Create execution engine
    const engine = new Epic1ExecutionEngine(graph, seed);
    
    // Execute with progress tracking
    let lastProgress = 0;
    const result = await engine.execute((progress) => {
      // Report progress in 10% increments to avoid message flooding
      const roundedProgress = Math.floor(progress * 10) * 10;
      if (roundedProgress > lastProgress) {
        lastProgress = roundedProgress;
        self.postMessage({
          type: 'progress',
          progress: roundedProgress
        });
      }
    });
    
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Handle incoming messages
 */
self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const { type, id, graph, seed } = event.data;
  
  if (type !== 'execute') {
    self.postMessage({
      type: 'error',
      id,
      error: `Unknown message type: ${type}`
    } as WorkerResponse);
    return;
  }
  
  try {
    // Report start
    self.postMessage({
      type: 'progress',
      id,
      progress: 0
    } as WorkerResponse);
    
    // Execute graph
    const result = await executeGraph(graph, seed);
    
    // Send result
    self.postMessage({
      type: 'result',
      id,
      result
    } as WorkerResponse);
    
  } catch (error) {
    // Send error
    self.postMessage({
      type: 'error',
      id,
      error: error instanceof Error ? error.message : 'Unknown execution error'
    } as WorkerResponse);
  }
});

// Prevent default export for worker files
export {};
/**
 * WebWorker for Epic 1 graph execution
 *
 * Runs graph execution in a separate thread to prevent UI blocking
 * during complex or long-running graph computations.
 */

import {
  Epic1ExecutionEngine,
  Epic1Graph,
  ExecutionResult
} from '../../../runtime/nodes/epic1/Epic1ExecutionEngine';

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

type ExecutionWorkerContext = {
  postMessage: (message: WorkerResponse) => void;
  addEventListener: (
    type: 'message',
    handler: (event: { data: WorkerRequest }) => void
  ) => void;
};

const workerContext = self as unknown as ExecutionWorkerContext;

/**
 * Execute a graph with progress reporting
 */
async function executeGraph(
  graph: Epic1Graph,
  seed: string | number
): Promise<ExecutionResult> {
  // Create execution engine
  const engine = new Epic1ExecutionEngine(graph, seed);
  return engine.execute();
}

/**
 * Handle incoming messages
 */
workerContext.addEventListener('message', async (event) => {
  const { type, id, graph, seed } = event.data;

  if (type !== 'execute') {
    workerContext.postMessage({
      type: 'error',
      id,
      error: `Unknown message type: ${type}`
    } as WorkerResponse);
    return;
  }

  try {
    // Report start
    workerContext.postMessage({
      type: 'progress',
      id,
      progress: 0
    } as WorkerResponse);

    // Execute graph
    const result = await executeGraph(graph, seed);

    // Send result
    workerContext.postMessage({
      type: 'result',
      id,
      result
    } as WorkerResponse);
  } catch (error) {
    // Send error
    workerContext.postMessage({
      type: 'error',
      id,
      error: error instanceof Error ? error.message : 'Unknown execution error'
    } as WorkerResponse);
  }
});

// Prevent default export for worker files
export {};

/**
 * WebWorker for Epic 1 graph execution
 *
 * Runs graph execution in a separate thread to prevent UI blocking
 * during complex or long-running graph computations.
 */
import { Epic1ExecutionEngine } from '../../../runtime/nodes/epic1/Epic1ExecutionEngine';
/**
 * Execute a graph with progress reporting
 */
async function executeGraph(graph, seed) {
    try {
        // Create execution engine
        const engine = new Epic1ExecutionEngine(graph, seed);
        // Execute with progress tracking
        let lastProgress = 0;
        const result = await engine.execute(progress => {
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
    }
    catch (error) {
        throw error;
    }
}
/**
 * Handle incoming messages
 */
self.addEventListener('message', async (event) => {
    const { type, id, graph, seed } = event.data;
    if (type !== 'execute') {
        self.postMessage({
            type: 'error',
            id,
            error: `Unknown message type: ${type}`
        });
        return;
    }
    try {
        // Report start
        self.postMessage({
            type: 'progress',
            id,
            progress: 0
        });
        // Execute graph
        const result = await executeGraph(graph, seed);
        // Send result
        self.postMessage({
            type: 'result',
            id,
            result
        });
    }
    catch (error) {
        // Send error
        self.postMessage({
            type: 'error',
            id,
            error: error instanceof Error ? error.message : 'Unknown execution error'
        });
    }
});

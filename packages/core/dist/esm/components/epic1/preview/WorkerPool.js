/**
 * WorkerPool - Manages a pool of WebWorkers for parallel graph execution
 *
 * Provides efficient worker reuse, automatic scaling, and request queuing
 * to maximize performance while preventing resource exhaustion.
 */
export class WorkerPool {
    workers = [];
    taskQueue = [];
    maxWorkers;
    minWorkers;
    workerConstructor;
    terminated = false;
    constructor(workerConstructor, minWorkers = 2, maxWorkers = navigator.hardwareConcurrency || 4) {
        this.workerConstructor = workerConstructor;
        this.minWorkers = Math.max(1, minWorkers);
        this.maxWorkers = Math.max(this.minWorkers, maxWorkers);
        // Initialize minimum workers
        this.initializeWorkers();
    }
    /**
     * Initialize the minimum number of workers
     */
    initializeWorkers() {
        for (let i = 0; i < this.minWorkers; i++) {
            this.createWorker();
        }
    }
    /**
     * Create a new worker and add to pool
     */
    createWorker() {
        const worker = new this.workerConstructor();
        const pooledWorker = {
            worker,
            busy: false
        };
        // Handle worker messages
        worker.addEventListener('message', (event) => {
            this.handleWorkerMessage(pooledWorker, event.data);
        });
        // Handle worker errors
        worker.addEventListener('error', error => {
            this.handleWorkerError(pooledWorker, error);
        });
        this.workers.push(pooledWorker);
        return pooledWorker;
    }
    /**
     * Handle messages from workers
     */
    handleWorkerMessage(pooledWorker, response) {
        const task = pooledWorker.currentTask;
        if (!task)
            return;
        switch (response.type) {
            case 'result':
                if (response.result) {
                    task.resolve(response.result);
                }
                this.releaseWorker(pooledWorker);
                break;
            case 'error':
                task.reject(new Error(response.error || 'Unknown worker error'));
                this.releaseWorker(pooledWorker);
                break;
            case 'progress':
                if (task.onProgress && response.progress !== undefined) {
                    task.onProgress(response.progress);
                }
                break;
        }
    }
    /**
     * Handle worker errors
     */
    handleWorkerError(pooledWorker, error) {
        const task = pooledWorker.currentTask;
        if (task) {
            task.reject(new Error(`Worker error: ${error.message}`));
        }
        // Remove failed worker
        const index = this.workers.indexOf(pooledWorker);
        if (index !== -1) {
            this.workers.splice(index, 1);
            pooledWorker.worker.terminate();
        }
        // Create replacement if below minimum
        if (this.workers.length < this.minWorkers && !this.terminated) {
            this.createWorker();
        }
    }
    /**
     * Release worker and process next task
     */
    releaseWorker(pooledWorker) {
        pooledWorker.busy = false;
        pooledWorker.currentTask = undefined;
        // Process next task in queue
        if (this.taskQueue.length > 0) {
            const nextTask = this.taskQueue.shift();
            if (nextTask) {
                this.assignTask(pooledWorker, nextTask);
            }
        }
    }
    /**
     * Assign task to worker
     */
    assignTask(pooledWorker, task) {
        pooledWorker.busy = true;
        pooledWorker.currentTask = task;
        const request = {
            type: 'execute',
            id: task.id,
            graph: task.graph,
            seed: task.seed
        };
        pooledWorker.worker.postMessage(request);
    }
    /**
     * Execute graph using worker pool
     */
    execute(graph, seed, onProgress) {
        return new Promise((resolve, reject) => {
            if (this.terminated) {
                reject(new Error('WorkerPool has been terminated'));
                return;
            }
            const task = {
                id: `task-${Date.now()}-${Math.random()}`,
                graph,
                seed,
                resolve,
                reject,
                onProgress
            };
            // Find idle worker
            const idleWorker = this.workers.find(w => !w.busy);
            if (idleWorker) {
                // Assign immediately
                this.assignTask(idleWorker, task);
            }
            else if (this.workers.length < this.maxWorkers) {
                // Create new worker if under limit
                const newWorker = this.createWorker();
                this.assignTask(newWorker, task);
            }
            else {
                // Queue task
                this.taskQueue.push(task);
            }
        });
    }
    /**
     * Execute multiple graphs in parallel
     */
    async executeMultiple(graph, seeds, onProgress) {
        const promises = seeds.map((seed, index) => this.execute(graph, seed, onProgress ? progress => onProgress(index, progress) : undefined));
        return Promise.all(promises);
    }
    /**
     * Get pool statistics
     */
    getStats() {
        const busyWorkers = this.workers.filter(w => w.busy).length;
        return {
            totalWorkers: this.workers.length,
            busyWorkers,
            idleWorkers: this.workers.length - busyWorkers,
            queuedTasks: this.taskQueue.length
        };
    }
    /**
     * Terminate all workers
     */
    terminate() {
        this.terminated = true;
        // Reject all queued tasks
        this.taskQueue.forEach(task => {
            task.reject(new Error('WorkerPool terminated'));
        });
        this.taskQueue = [];
        // Terminate all workers
        this.workers.forEach(pooledWorker => {
            if (pooledWorker.currentTask) {
                pooledWorker.currentTask.reject(new Error('WorkerPool terminated'));
            }
            pooledWorker.worker.terminate();
        });
        this.workers = [];
    }
    /**
     * Check if pool is terminated
     */
    isTerminated() {
        return this.terminated;
    }
}

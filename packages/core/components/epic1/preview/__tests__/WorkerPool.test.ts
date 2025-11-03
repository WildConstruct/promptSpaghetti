/**
 * Tests for WorkerPool
 */

type MockWorkerInstance = Worker & {
  triggerMessage: (data: unknown) => void;
  triggerError: (error: ErrorEvent) => void;
};

const MockWorker = jest.fn<MockWorkerInstance, []>(function () {
  const listeners: Record<string, Array<(payload: any) => void>> = {
    message: [],
    error: []
  };

  const worker: Partial<MockWorkerInstance> = {
    postMessage: jest.fn(),
    terminate: jest.fn(),
    addEventListener: jest.fn(
      (type: string, handler: (payload: any) => void) => {
        if (!listeners[type]) {
          listeners[type] = [];
        }
        listeners[type]?.push(handler);
      }
    ),
    removeEventListener: jest.fn(
      (type: string, handler: (payload: any) => void) => {
        const handlers = listeners[type];
        if (!handlers) {
          return;
        }
        const index = handlers.indexOf(handler);
        if (index >= 0) {
          handlers.splice(index, 1);
        }
      }
    ),
    dispatchEvent: jest.fn(),
    triggerMessage: (data: unknown) => {
      [...(listeners.message || [])].forEach(listener => listener({ data }));
    },
    triggerError: (error: ErrorEvent) => {
      [...(listeners.error || [])].forEach(listener => listener(error));
    }
  };

  Object.assign(this, worker);
  return this as MockWorkerInstance;
});

// Ensure any global Worker usage falls back to the mock
global.Worker = MockWorker as unknown as typeof Worker;

import { WorkerPool } from '../WorkerPool';

describe('WorkerPool', () => {
  let pool;
  const workerCtor = MockWorker as unknown as new () => Worker;

  beforeEach(() => {
    jest.clearAllMocks();
    MockWorker.mockClear();
  });

  afterEach(() => {
    if (pool && !pool.isTerminated()) {
      try {
        pool.terminate();
      } catch (error) {
        // Tests intentionally terminate pools mid-task; ignore expected rejections.
      }
    }
    pool = undefined;
  });

  describe('initialization', () => {
    it('should create minimum number of workers', () => {
      pool = new WorkerPool(workerCtor, 2, 4);
      expect(MockWorker).toHaveBeenCalledTimes(2);
    });

    it('should respect max workers configuration', () => {
      pool = new WorkerPool(workerCtor, 1, 3);
      const stats = pool.getStats();
      expect(stats.totalWorkers).toBe(1);
    });
  });

  describe('task execution', () => {
    it('should execute task and return result', async () => {
      pool = new WorkerPool(workerCtor, 1, 2);

      const mockGraph = { nodes: new Map(), edges: [] };
      const mockSeed = 1234;
      const mockResult = { output: 'test result', stats: {} };

      // Start execution
      const promise = pool.execute(mockGraph, mockSeed);

      // Simulate worker response
      setTimeout(() => {
        const worker = MockWorker.mock.instances[0] as MockWorkerInstance;
        worker.triggerMessage({
          type: 'result',
          id: expect.any(String),
          result: mockResult
        });
      }, 10);

      const result = await promise;
      expect(result).toEqual(mockResult);
    });

    it('should handle task errors', async () => {
      pool = new WorkerPool(workerCtor, 1, 2);

      const mockGraph = { nodes: new Map(), edges: [] };
      const promise = pool.execute(mockGraph, 1234);

      // Simulate error response
      setTimeout(() => {
        const worker = MockWorker.mock.instances[0] as MockWorkerInstance;
        worker.triggerMessage({
          type: 'error',
          id: expect.any(String),
          error: 'Execution failed'
        });
      }, 10);

      await expect(promise).rejects.toThrow('Execution failed');
    });

    it('should track progress updates', async () => {
      pool = new WorkerPool(workerCtor, 1, 2);

      const progressUpdates = [];
      const promise = pool.execute(
        { nodes: new Map(), edges: [] },
        1234,
        progress => progressUpdates.push(progress)
      );

      // Simulate progress updates
      setTimeout(() => {
        const worker = MockWorker.mock.instances[0] as MockWorkerInstance;
        worker.triggerMessage({ type: 'progress', progress: 25 });
        worker.triggerMessage({ type: 'progress', progress: 50 });
        worker.triggerMessage({ type: 'progress', progress: 75 });
        worker.triggerMessage({ type: 'result', result: { output: 'done' } });
      }, 10);

      await promise;
      expect(progressUpdates).toEqual([25, 50, 75]);
    });
  });

  describe('worker pool management', () => {
    it('should reuse idle workers', async () => {
      pool = new WorkerPool(workerCtor, 1, 2);

      // First execution
      const promise1 = pool.execute({ nodes: new Map() }, 1);

      // Complete first task
      setTimeout(() => {
        (MockWorker.mock.instances[0] as MockWorkerInstance).triggerMessage({
          type: 'result',
          result: { output: 'result1' }
        });
      }, 10);

      await promise1;

      // Second execution should reuse same worker
      const promise2 = pool.execute({ nodes: new Map() }, 2);

      setTimeout(() => {
        (MockWorker.mock.instances[0] as MockWorkerInstance).triggerMessage({
          type: 'result',
          result: { output: 'result2' }
        });
      }, 10);

      await promise2;

      // Should still only have 1 worker
      expect(MockWorker).toHaveBeenCalledTimes(1);
    });

    it('should create new workers up to max when busy', async () => {
      pool = new WorkerPool(workerCtor, 1, 3);

      // Start 3 tasks simultaneously
      const promises = [
        pool.execute({ nodes: new Map() }, 1),
        pool.execute({ nodes: new Map() }, 2),
        pool.execute({ nodes: new Map() }, 3)
      ];

      // Should create 3 workers (up to max)
      expect(MockWorker).toHaveBeenCalledTimes(3);

      // Complete all tasks
      MockWorker.mock.instances.forEach(
        (worker: MockWorkerInstance, i: number) => {
          setTimeout(() => {
            worker.triggerMessage({
              type: 'result',
              result: { output: `result${i}` }
            });
          }, 10);
        }
      );

      await Promise.all(promises);
    });

    it('should queue tasks when all workers are busy', async () => {
      pool = new WorkerPool(workerCtor, 1, 2);

      // Start 3 tasks (more than max workers)
      const promises = [
        pool.execute({ nodes: new Map() }, 1),
        pool.execute({ nodes: new Map() }, 2),
        pool.execute({ nodes: new Map() }, 3)
      ];

      // Should only create 2 workers (max)
      expect(MockWorker).toHaveBeenCalledTimes(2);

      // Check stats
      const stats = pool.getStats();
      expect(stats.busyWorkers).toBe(2);
      expect(stats.queuedTasks).toBe(1);

      // Complete first task
      setTimeout(() => {
        (MockWorker.mock.instances[0] as MockWorkerInstance).triggerMessage({
          type: 'result',
          result: { output: 'result1' }
        });
      }, 10);

      // Complete remaining tasks
      setTimeout(() => {
        MockWorker.mock.instances.forEach((worker: MockWorkerInstance) => {
          worker.triggerMessage({
            type: 'result',
            result: { output: 'result' }
          });
        });
      }, 20);

      await Promise.all(promises);
    });
  });

  describe('error handling', () => {
    it('should handle worker errors gracefully', async () => {
      pool = new WorkerPool(workerCtor, 2, 4);

      const promise = pool.execute({ nodes: new Map() }, 1234);

      // Simulate worker error
      setTimeout(() => {
        const worker = MockWorker.mock.instances[0] as MockWorkerInstance;
        worker.triggerError(
          new ErrorEvent('error', {
            message: 'Worker crashed'
          })
        );
      }, 10);

      await expect(promise).rejects.toThrow('Worker error: Worker crashed');

      // Should still have minimum workers
      const stats = pool.getStats();
      expect(stats.totalWorkers).toBeGreaterThanOrEqual(2);
    });

    it('should replace failed workers', async () => {
      pool = new WorkerPool(workerCtor, 2, 4);
      const initialWorkerCount = MockWorker.mock.instances.length;

      // Simulate worker failure
      (MockWorker.mock.instances[0] as MockWorkerInstance).triggerError(
        new ErrorEvent('error', { message: 'crashed' })
      );

      // Should create replacement worker
      expect(MockWorker).toHaveBeenCalledTimes(initialWorkerCount + 1);
    });
  });

  describe('parallel execution', () => {
    it('should execute multiple graphs in parallel', async () => {
      pool = new WorkerPool(workerCtor, 2, 4);

      const graph = { nodes: new Map(), edges: [] };
      const seeds = [1, 2, 3, 4];

      const progressMap = new Map();
      const promise = pool.executeMultiple(graph, seeds, (index, progress) => {
        progressMap.set(index, progress);
      });

      // Simulate results for all seeds
      setTimeout(() => {
        MockWorker.mock.instances.forEach(
          (worker: MockWorkerInstance, i: number) => {
            if (i < seeds.length) {
              worker.triggerMessage({
                type: 'result',
                result: { output: `result${i}`, stats: {} }
              });
            }
          }
        );
      }, 10);

      const results = await promise;
      expect(results).toHaveLength(4);
    });
  });

  describe('termination', () => {
    it('should terminate all workers', () => {
      pool = new WorkerPool(workerCtor, 2, 4);
      const workers = MockWorker.mock.instances as MockWorkerInstance[];

      pool.terminate();

      // All workers should be terminated
      workers.forEach((worker: MockWorkerInstance) => {
        expect(worker.terminate).toHaveBeenCalled();
      });

      expect(pool.isTerminated()).toBe(true);
    });

    it('should reject pending tasks on termination', async () => {
      pool = new WorkerPool(workerCtor, 1, 2);

      // Start tasks
      const promises = [
        pool.execute({ nodes: new Map() }, 1),
        pool.execute({ nodes: new Map() }, 2),
        pool.execute({ nodes: new Map() }, 3) // This will be queued
      ];

      // Terminate pool
      pool.terminate();

      // All tasks should be rejected
      await expect(
        Promise.all(promises.map(p => p.catch(e => e.message)))
      ).resolves.toEqual([
        'WorkerPool terminated',
        'WorkerPool terminated',
        'WorkerPool terminated'
      ]);
    });
  });

  describe('statistics', () => {
    it('should provide accurate statistics', async () => {
      pool = new WorkerPool(workerCtor, 2, 4);

      // Initial stats
      let stats = pool.getStats();
      expect(stats).toEqual({
        totalWorkers: 2,
        busyWorkers: 0,
        idleWorkers: 2,
        queuedTasks: 0
      });

      // Start some tasks
      const task1 = pool.execute({ nodes: new Map() }, 1);
      const task2 = pool.execute({ nodes: new Map() }, 2);
      const task3 = pool.execute({ nodes: new Map() }, 3);

      stats = pool.getStats();
      expect(stats.busyWorkers).toBeGreaterThan(0);
      expect(stats.idleWorkers).toBeLessThan(2);

      // Complete tasks to avoid leaking pending work between tests
      const workerA = MockWorker.mock.instances[0] as MockWorkerInstance;
      const workerB = MockWorker.mock.instances[1] as MockWorkerInstance;
      const workerC = MockWorker.mock.instances[2] as MockWorkerInstance;

      workerA.triggerMessage({
        type: 'result',
        result: { output: 'done-1' }
      });
      workerB.triggerMessage({
        type: 'result',
        result: { output: 'done-2' }
      });
      workerC.triggerMessage({
        type: 'result',
        result: { output: 'done-3' }
      });

      await Promise.all([task1, task2, task3]);
    });
  });
});

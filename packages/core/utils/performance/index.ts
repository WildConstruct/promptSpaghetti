/**
 * Performance Infrastructure exports
 * Story 0.1: Performance Infrastructure
 */

export { LRUCache } from './LRUCache';
export { MultiLevelCache } from './MultiLevelCache';
export { WorkerPool } from './WorkerPool';
export { PerformanceMonitor } from './PerformanceMonitor';

export type { CacheOptions } from './LRUCache';
export type { MultiLevelCacheOptions } from './MultiLevelCache';
export type { WorkerTask, WorkerResult } from './WorkerPool';
export type {
  PerformanceMetric,
  PerformanceThreshold,
  PerformanceReport
} from './PerformanceMonitor';

// Singleton instances for easy access
let cache: MultiLevelCache | null = null;
let workerPool: WorkerPool | null = null;
let perfMonitor: PerformanceMonitor | null = null;

/**
 * Initialize the performance infrastructure
 */
export async function initializePerformance(options?: {
  cacheSize?: number;
  maxWorkers?: number;
  workerScriptUrl?: string;
}): Promise<void> {
  // Initialize cache
  cache = MultiLevelCache.getInstance({
    l1Size: options?.cacheSize || 500,
    l1TTL: 60000 // 1 minute
  });

  // Initialize worker pool
  workerPool = WorkerPool.getInstance(options?.maxWorkers);
  await workerPool.initialize(options?.workerScriptUrl);

  // Initialize performance monitor
  perfMonitor = PerformanceMonitor.getInstance();

  // Set default thresholds
  perfMonitor.setThreshold({
    metric: 'render',
    maxValue: 200,
    action: 'warn'
  });

  perfMonitor.setThreshold({
    metric: 'edge:calculation',
    maxValue: 50,
    action: 'warn'
  });

  perfMonitor.setThreshold({
    metric: 'group:operation',
    maxValue: 50,
    action: 'warn'
  });

  console.log('Performance infrastructure initialized');
}

/**
 * Get performance infrastructure instances
 */
export function getPerformanceInfrastructure() {
  if (!cache || !workerPool || !perfMonitor) {
    throw new Error(
      'Performance infrastructure not initialized. Call initializePerformance() first.'
    );
  }

  return {
    cache,
    workerPool,
    perfMonitor
  };
}

/**
 * Cleanup performance infrastructure
 */
export function cleanupPerformance(): void {
  if (workerPool) {
    workerPool.terminate();
  }

  if (cache) {
    cache.clear();
  }

  if (perfMonitor) {
    perfMonitor.stopFPSMonitoring();
    perfMonitor.clear();
  }

  cache = null;
  workerPool = null;
  perfMonitor = null;
}

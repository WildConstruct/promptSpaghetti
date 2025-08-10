/**
 * React hooks for Performance Infrastructure integration
 * Story 0.1: Performance Infrastructure
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getPerformanceInfrastructure,
  initializePerformance,
  PerformanceReport,
  WorkerTask
} from '../utils/performance';

/**
 * Hook to access performance infrastructure
 */
export function usePerformance() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializePerformance();
        setIsInitialized(true);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to initialize performance infrastructure:', err);
      }
    };

    init();
  }, []);

  const infrastructure = isInitialized ? getPerformanceInfrastructure() : null;

  return {
    isInitialized,
    error,
    cache: infrastructure?.cache,
    workerPool: infrastructure?.workerPool,
    perfMonitor: infrastructure?.perfMonitor
  };
}

/**
 * Hook for cached data with automatic invalidation
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number;
    dependencies?: any[];
  }
): {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<T | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { cache } = usePerformance();

  const loadData = useCallback(async () => {
    if (!cache) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try cache first
      const cached = await cache.get<T>(key);
      if (cached !== undefined) {
        setData(cached);
        setIsLoading(false);
        return;
      }

      // Fetch fresh data
      const fresh = await fetcher();
      setData(fresh);

      // Cache the result
      await cache.set(key, fresh, { ttl: options?.ttl });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [cache, key, fetcher, options?.ttl]);

  useEffect(() => {
    loadData();
  }, [loadData, ...(options?.dependencies || [])]);

  const refresh = useCallback(async () => {
    if (cache) {
      await cache.delete(key);
      await loadData();
    }
  }, [cache, key, loadData]);

  return { data, isLoading, error, refresh };
}

/**
 * Hook for executing tasks in worker pool
 */
export function useWorkerTask<T>(
  task: WorkerTask | null,
  options?: {
    autoExecute?: boolean;
    onSuccess?: (result: T) => void;
    onError?: (error: Error) => void;
  }
): {
  result: T | undefined;
  isProcessing: boolean;
  error: Error | null;
  execute: () => Promise<T | undefined>;
} {
  const [result, setResult] = useState<T | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { workerPool } = usePerformance();

  const execute = useCallback(async () => {
    if (!workerPool || !task) return undefined;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await workerPool.execute<T>(task);
      setResult(res);
      options?.onSuccess?.(res);
      return res;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options?.onError?.(error);
      return undefined;
    } finally {
      setIsProcessing(false);
    }
  }, [workerPool, task, options]);

  useEffect(() => {
    if (options?.autoExecute && task) {
      execute();
    }
  }, [execute, task, options?.autoExecute]);

  return { result, isProcessing, error, execute };
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitor(updateInterval: number = 1000): {
  report: PerformanceReport | null;
  fps: number;
  memory: { used: number; percentage: number };
  startMeasure: (name: string) => void;
  endMeasure: (startName: string, endName?: string) => number;
} {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [fps, setFps] = useState(60);
  const [memory, setMemory] = useState({ used: 0, percentage: 0 });
  const { perfMonitor, cache, workerPool } = usePerformance();
  const marksRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!perfMonitor) return;

    const interval = setInterval(async () => {
      // Get cache stats
      const cacheStats = cache ? await cache.getStats() : null;
      const cacheHitRate = cacheStats?.l1.hitRate
        ? parseFloat(cacheStats.l1.hitRate)
        : 0;

      // Get worker stats
      const workerStats = workerPool?.getStats();

      // Generate report
      const newReport = perfMonitor.generateReport(
        { hitRate: cacheHitRate, size: cacheStats?.totalSize || 0 },
        workerStats
      );

      setReport(newReport);
      setFps(newReport.fps.current);
      setMemory({
        used: newReport.memory.used,
        percentage: newReport.memory.percentage
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [perfMonitor, cache, workerPool, updateInterval]);

  const startMeasure = useCallback(
    (name: string) => {
      marksRef.current.set(name, performance.now());
      perfMonitor?.mark(name);
    },
    [perfMonitor]
  );

  const endMeasure = useCallback(
    (startName: string, endName?: string) => {
      const startTime = marksRef.current.get(startName);
      if (!startTime) return 0;

      const duration = performance.now() - startTime;
      const metricName = endName || startName;

      perfMonitor?.record(metricName, duration);
      marksRef.current.delete(startName);

      return duration;
    },
    [perfMonitor]
  );

  return { report, fps, memory, startMeasure, endMeasure };
}

/**
 * Hook for measuring component render performance
 */
export function useRenderPerformance(componentName: string) {
  const { perfMonitor } = usePerformance();
  const renderCount = useRef(0);
  const renderStartRef = useRef<number>(0);

  useEffect(() => {
    renderStartRef.current = performance.now();

    return () => {
      if (perfMonitor && renderStartRef.current) {
        const duration = performance.now() - renderStartRef.current;
        perfMonitor.record(`render:${componentName}`, duration);
        renderCount.current++;
      }
    };
  });

  return {
    renderCount: renderCount.current,
    measure: useCallback(
      (operation: string, fn: () => void) => {
        if (perfMonitor) {
          return perfMonitor.measure(`${componentName}:${operation}`, fn);
        }
        fn();
      },
      [perfMonitor, componentName]
    )
  };
}

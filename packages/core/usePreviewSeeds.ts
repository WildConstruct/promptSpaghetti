import { useCallback, useMemo, useRef, useState } from 'react';

type ExecutionPath = {
  nodeExecutionOrder?: string[];
  steps?: Array<{ id: string; nodeId: string; type?: string }>;
  randomizationPoints?: Array<{ nodeId: string; description?: string }>;
};

type WeightChoice = {
  nodeId: string;
  selectedOption?: string;
  availableOptions?: string[];
  weights?: number[];
  selectionProbability?: number;
};

export interface PreviewResult {
  seed: number;
  output?: string;
  error?: string;
  usedNodeIds?: string[];
  usedEdgeIds?: string[];
  executionTimeMs?: number;
  executionPath?: ExecutionPath;
  weightChoices?: WeightChoice[];
  locked?: boolean;
  lockedAt?: number;
  lockedNote?: string;
}

interface PerformanceStats {
  totalTime: number;
  averageTime: number;
}

export interface VarianceMetrics {
  successRate: number;
  uniqueOutputs: number;
  averageExecutionTime?: number;
}

interface ApiPreviewResult {
  seed: number;
  output?: string;
  error?: string;
  executionTimeMs?: number;
  executionPath?: ExecutionPath;
  weightChoices?: WeightChoice[];
}

const calculateVarianceMetrics = (results: PreviewResult[]): VarianceMetrics => {
  if (results.length === 0) {
    return { successRate: 0, uniqueOutputs: 0 };
  }

  const successful = results.filter(result => !result.error);
  const successRate = successful.length / results.length;

  const uniqueOutputs = new Set(
    successful
      .map(result => result.output)
      .filter((output): output is string => typeof output === 'string')
  ).size;

  const executionTimes = successful
    .map(result => result.executionTimeMs)
    .filter((time): time is number => typeof time === 'number');

  const averageExecutionTime =
    executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) /
        executionTimes.length
      : undefined;

  return {
    successRate,
    uniqueOutputs,
    averageExecutionTime
  };
};

const transformResults = (
  apiResults: ApiPreviewResult[],
  previous: PreviewResult[]
): PreviewResult[] =>
  apiResults.map((result, index) => {
    const previousResult = previous[index];
    const output =
      typeof result.output === 'string' &&
      result.output.startsWith('Error:')
        ? undefined
        : result.output;
    const error =
      typeof result.output === 'string' &&
      result.output.startsWith('Error:')
        ? result.output
        : result.error;

    return {
      seed: result.seed,
      output,
      error,
      executionTimeMs: result.executionTimeMs,
      executionPath: result.executionPath,
      weightChoices: result.weightChoices ?? [],
      usedNodeIds:
        result.executionPath?.nodeExecutionOrder ??
        (output ? [`node_${result.seed}`] : []),
      usedEdgeIds: output ? [`edge_${result.seed}`] : [],
      locked: previousResult?.locked ?? false,
      lockedAt: previousResult?.lockedAt,
      lockedNote: previousResult?.lockedNote
    };
  });

export function usePreviewSeeds() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PreviewResult[]>([]);
  const [aggregateError, setAggregateError] = useState<string | null>(null);
  const [performanceStats, setPerformanceStats] =
    useState<PerformanceStats | null>(null);
  const [varianceMetrics, setVarianceMetrics] =
    useState<VarianceMetrics | null>(null);
  const [regeneratingResults, setRegeneratingResults] = useState<number[]>([]);

  const abortRef = useRef<AbortController | null>(null);
  const lastGraphRef = useRef<unknown>(null);

  const updateVarianceMetrics = useCallback((nextResults: PreviewResult[]) => {
    if (nextResults.length >= 2) {
      setVarianceMetrics(calculateVarianceMetrics(nextResults));
    } else {
      setVarianceMetrics(null);
    }
  }, []);

  const cancelPreview = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, []);

  const fetchPreview = useCallback(
    async (
      graph: unknown,
      runs: number,
      seedStart: number,
      signal: AbortSignal
    ) => {
      const response = await fetch('/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graph, runs, seedStart }),
        signal
      });

      if (!response.ok) {
        const errorPayload = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(
          errorPayload?.error ??
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return response.json() as Promise<{
        results: ApiPreviewResult[];
      }>;
    },
    []
  );

  const runPreview = useCallback(
    async (graph: unknown, options?: { runs?: number; seedStart?: number }) => {
      cancelPreview();

      const controller = new AbortController();
      abortRef.current = controller;
      lastGraphRef.current = graph;

      setLoading(true);
      setError(null);
      setAggregateError(null);
      setPerformanceStats(null);

      const runs = options?.runs ?? 5;
      const seedStart =
        options?.seedStart ?? Math.floor(Math.random() * 10_000);
      const startTime = Date.now();

      try {
        const payload = await fetchPreview(
          graph,
          runs,
          seedStart,
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        const nextResults = transformResults(payload.results, results);
        setResults(nextResults);
        updateVarianceMetrics(nextResults);

        const failureCount = nextResults.filter(result => result.error).length;
        if (failureCount > 0) {
          setAggregateError(
            `${failureCount} of ${nextResults.length} previews failed`
          );
        }

        const totalTime = Date.now() - startTime;
        const executionTimes = nextResults
          .map(result => result.executionTimeMs)
          .filter((time): time is number => typeof time === 'number');

        if (executionTimes.length > 0) {
          const averageTime = Math.round(
            executionTimes.reduce((sum, time) => sum + time, 0) /
              executionTimes.length
          );
          setPerformanceStats({ totalTime, averageTime });
        } else {
          setPerformanceStats({ totalTime, averageTime: totalTime });
        }
      } catch (err) {
        if ((err as { name?: string }).name !== 'AbortError') {
          const message =
            typeof err === 'object' && err && 'message' in err
              ? String((err as { message: unknown }).message)
              : 'Unknown error';
          setError(message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [cancelPreview, fetchPreview, results, updateVarianceMetrics]
  );

  const regenerateResult = useCallback(
    async (seed: number, index: number) => {
      if (!lastGraphRef.current) {
        return;
      }

      if (results[index]?.locked) {
        console.warn('Cannot regenerate a locked result.');
        return;
      }

      setRegeneratingResults(prev => [...prev, index]);

      try {
        const controller = new AbortController();
        const payload = await fetchPreview(
          lastGraphRef.current,
          1,
          seed,
          controller.signal
        );

        if (controller.signal.aborted || payload.results.length === 0) {
          return;
        }

        setResults(prev => {
          const next = [...prev];
          const base = prev[index] ?? ({ seed } as PreviewResult);
          const [replacement] = transformResults(payload.results, [base]);
          if (replacement) {
            next[index] = replacement;
          }
          updateVarianceMetrics(next);
          return next;
        });
      } catch (err) {
        if ((err as { name?: string }).name !== 'AbortError') {
          const message =
            typeof err === 'object' && err && 'message' in err
              ? String((err as { message: unknown }).message)
              : 'Unknown error';
          setError(`Failed to regenerate preview: ${message}`);
        }
      } finally {
        setRegeneratingResults(prev =>
          prev.filter(resultIndex => resultIndex !== index)
        );
      }
    },
    [fetchPreview, results, updateVarianceMetrics]
  );

  const lockResult = useCallback((index: number, note?: string) => {
    setResults(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = {
          ...next[index],
          locked: true,
          lockedAt: Date.now(),
          lockedNote: note
        };
      }
      updateVarianceMetrics(next);
      return next;
    });
  }, [updateVarianceMetrics]);

  const unlockResult = useCallback((index: number) => {
    setResults(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = {
          ...next[index],
          locked: false,
          lockedAt: undefined,
          lockedNote: undefined
        };
      }
      updateVarianceMetrics(next);
      return next;
    });
  }, [updateVarianceMetrics]);

  const lockedResults = useMemo(() => {
    const indexes: number[] = [];
    results.forEach((result, index) => {
      if (result.locked) {
        indexes.push(index);
      }
    });
    return indexes;
  }, [results]);

  return {
    loading,
    error,
    results,
    aggregateError,
    performanceStats,
    varianceMetrics,
    lockedResults,
    regeneratingResults,
    runPreview,
    cancelPreview,
    regenerateResult,
    lockResult,
    unlockResult
  };
}

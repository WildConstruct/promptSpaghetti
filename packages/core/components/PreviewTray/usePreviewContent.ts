import { useState, useEffect, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';

export interface PreviewResult {
  seed: string | number;
  result: string;
  error?: string;
}

export interface UsePreviewContentOptions {
  seeds: (string | number)[];
  nodes: Node[];
  edges: Edge[];
  enabled?: boolean;
  onComplete?: (results: PreviewResult[]) => void;
  onError?: (error: Error) => void;
  maxMemoryMB?: number; // Maximum memory threshold in MB
}

const MAX_MEMORY_MB_DEFAULT = 50;

function estimateMemoryUsage(results: PreviewResult[]): number {
  // Rough estimation of memory usage in bytes
  const jsonString = JSON.stringify(results);
  return new Blob([jsonString]).size / (1024 * 1024); // Convert to MB
}

export function usePreviewContent({
  seeds,
  nodes,
  edges,
  enabled = true,
  onComplete,
  onError,
  maxMemoryMB = MAX_MEMORY_MB_DEFAULT
}: UsePreviewContentOptions) {
  const [results, setResults] = useState<PreviewResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    if (!enabled || isExecuting) return;

    try {
      setIsExecuting(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      const mockResults: PreviewResult[] = seeds.map((seed, index) => ({
        seed,
        result: `Preview result for seed ${seed} - Generated output ${index + 1}`
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!abortControllerRef.current?.signal.aborted) {
        // Check memory usage and trim if necessary
        const memoryUsage = estimateMemoryUsage(mockResults);
        if (memoryUsage > maxMemoryMB) {
          console.warn(
            `Preview results exceed memory threshold (${memoryUsage.toFixed(2)}MB > ${maxMemoryMB}MB). Trimming results.`
          );
          // Keep only the most recent results that fit within the threshold
          const trimmedResults = mockResults.slice(
            -Math.floor(mockResults.length * (maxMemoryMB / memoryUsage))
          );
          setResults(trimmedResults);
          onComplete?.(trimmedResults);
        } else {
          setResults(mockResults);
          onComplete?.(mockResults);
        }
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Preview execution failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsExecuting(false);
      abortControllerRef.current = null;
    }
  }, [
    seeds,
    nodes,
    edges,
    enabled,
    onComplete,
    onError,
    isExecuting,
    maxMemoryMB
  ]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsExecuting(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    isExecuting,
    error,
    execute,
    cancel,
    clear
  };
}

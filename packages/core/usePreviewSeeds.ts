import { useState, useCallback, useRef } from 'react';

interface PreviewResult {
  seed: number;
  output?: string;
  error?: string;
  usedNodeIds?: string[];
  usedEdgeIds?: string[];
  executionTimeMs?: number;
}

export   const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PreviewResult[]>([]);
  const [aggregateError, setAggregateError] = useState<string | null>(null);
  const [performanceStats, setPerformanceStats] = useState<{
    totalTime: number;
    averageTime: number;
  } | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const runPreview = useCallback(async (graph: unknown) => {
    // Cancel any existing run
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    setAggregateError(null);
    setPerformanceStats(null);
    
    const startTime = Date.now();
    
    try {
      // Call the real preview API endpoint
      const response = await fetch('/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          graph,
          runs: 5,
          seedStart: Math.floor(Math.random() * 10000)
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (controller.signal.aborted) {
        return; // Skip state updates if cancelled
      }

      // Transform API results to frontend format
      const perSeedResults: PreviewResult[] = data.results.map((result: any) => ({
        seed: result.seed,
        output: result.output?.startsWith('Error:') ? undefined : result.output,
        error: result.output?.startsWith('Error:') ? result.output : undefined,
        executionTimeMs: result.executionTimeMs,
        // Add mock node/edge tracking for now
        usedNodeIds: result.output && !result.output.startsWith('Error:') ? [`node_${result.seed}`] : [],
        usedEdgeIds: result.output && !result.output.startsWith('Error:') ? [`edge_${result.seed}`] : []
      }));

      setResults(perSeedResults);
      
      const failed = perSeedResults.filter((r) => r.error).length;
      if (failed > 0) {
        setAggregateError(`${failed} of ${perSeedResults.length} previews failed`);
      }

      // Calculate performance stats
      const totalTime = Date.now() - startTime;
      const executionTimes = perSeedResults
        .map(r => r.executionTimeMs)
        .filter((t): t is number => typeof t === 'number');
      
      if (executionTimes.length > 0) {
        const averageTime = Math.round(executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length);
        setPerformanceStats({
          totalTime,
          averageTime
        });
        
        // Log performance for Epic 8.5 monitoring
        console.log(`Preview performance: ${totalTime}ms total, ${averageTime}ms avg execution`);
      }
      
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setError(err?.message ?? 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelPreview = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
    setResults([]);
    setPerformanceStats(null);
  }, []);

  return { 
    loading, 
    error, 
    results, 
    runPreview, 
    cancelPreview, 
    performanceStats,
    aggregateError 
  };
};

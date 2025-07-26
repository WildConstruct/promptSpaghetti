import { useState, useCallback, useRef } from 'react';
import { ExecutionPathAnalyzer } from './execution/ExecutionTracker';
import { varianceAnalysisService } from './services/VarianceAnalysisService';
export function usePreviewSeeds() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const [aggregateError, setAggregateError] = useState(null);
    const [performanceStats, setPerformanceStats] = useState(null);
    // Epic 8.5 Task 3: Individual result management state
    const [lockedResults, setLockedResults] = useState([]);
    const [regeneratingResults, setRegeneratingResults] = useState([]);
    // Epic 8.5 Task 5: Creative variance analysis state
    const [varianceMetrics, setVarianceMetrics] = useState(null);
    const abortRef = useRef(null);
    const lastGraphRef = useRef(null);
    // Update variance metrics whenever results change
    const updateVarianceMetrics = useCallback((newResults) => {
        if (newResults.length >= 2) {
            const metrics = varianceAnalysisService.analyzeVariance(newResults);
            setVarianceMetrics(metrics);
        }
        else {
            setVarianceMetrics(null);
        }
    }, []);
    const runPreview = useCallback(async (graph, specificSeed, resultIndex) => {
        // Store the graph for regeneration purposes
        lastGraphRef.current = graph;
        // Handle selective regeneration
        if (typeof resultIndex === 'number' && specificSeed) {
            return await regenerateSpecificResult(graph, specificSeed, resultIndex);
        }
        // Cancel any existing run
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setError(null);
        setAggregateError(null);
        setPerformanceStats(null);
        // Clear regenerating state for full regeneration
        setRegeneratingResults([]);
        const startTime = Date.now();
        try {
            // Call the real preview API endpoint
            const response = await fetch('/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    graph,
                    runs: 5,
                    seedStart: Math.floor(Math.random() * 10000)
                }),
                signal: controller.signal
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (controller.signal.aborted) {
                return; // Skip state updates if cancelled
            }
            // Transform API results to frontend format with execution path data
            const perSeedResults = data.results.map((result, index) => ({
                seed: result.seed,
                output: result.output?.startsWith('Error:') ? undefined : result.output,
                error: result.output?.startsWith('Error:') ? result.output : undefined,
                executionTimeMs: result.executionTimeMs,
                // Epic 8.5 Task 2: Capture execution path data from server
                executionPath: result.executionPath,
                weightChoices: result.weightChoices || [],
                // Extract node/edge tracking from execution path
                usedNodeIds: result.executionPath ? result.executionPath.nodeExecutionOrder :
                    (result.output && !result.output.startsWith('Error:') ? [`node_${result.seed}`] : []),
                usedEdgeIds: result.executionPath ? [] : // Will be computed from execution path if needed
                    (result.output && !result.output.startsWith('Error:') ? [`edge_${result.seed}`] : []),
                // Generate debug info for visualization
                debugInfo: result.executionPath ? generateDebugInfo(result.executionPath) : undefined,
                // Epic 8.5 Task 3: Preserve locked state during regeneration
                locked: results[index]?.locked || false,
                lockedAt: results[index]?.lockedAt,
                lockedNote: results[index]?.lockedNote
            }));
            setResults(perSeedResults);
            updateVarianceMetrics(perSeedResults);
            const failed = perSeedResults.filter((r) => r.error).length;
            if (failed > 0) {
                setAggregateError(`${failed} of ${perSeedResults.length} previews failed`);
            }
            // Calculate performance stats
            const totalTime = Date.now() - startTime;
            const executionTimes = perSeedResults
                .map(r => r.executionTimeMs)
                .filter((t) => typeof t === 'number');
            if (executionTimes.length > 0) {
                const averageTime = Math.round(executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length);
                setPerformanceStats({
                    totalTime,
                    averageTime
                });
                // Log performance for Epic 8.5 monitoring
                console.log(`Preview performance: ${totalTime}ms total, ${averageTime}ms avg execution`);
            }
        }
        catch (err) {
            if (err?.name !== 'AbortError') {
                setError(err?.message ?? 'Unknown error');
            }
        }
        finally {
            setLoading(false);
        }
    }, [results]);
    const cancelPreview = useCallback(() => {
        abortRef.current?.abort();
        setLoading(false);
        setResults([]);
        setPerformanceStats(null);
    }, []);
    // Epic 8.5 Task 3: Regenerate specific result while maintaining others
    const regenerateSpecificResult = useCallback(async (graph, seed, resultIndex) => {
        // Check if result is locked
        if (results[resultIndex]?.locked) {
            console.warn('Cannot regenerate locked result');
            return;
        }
        setRegeneratingResults(prev => [...prev, resultIndex]);
        setError(null);
        const controller = new AbortController();
        try {
            const response = await fetch('/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    graph,
                    runs: 1,
                    seedStart: Math.floor(Math.random() * 10000) // Use new random seed
                }),
                signal: controller.signal
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const newResult = data.results[0];
                const transformedResult = {
                    seed: newResult.seed,
                    output: newResult.output?.startsWith('Error:') ? undefined : newResult.output,
                    error: newResult.output?.startsWith('Error:') ? newResult.output : undefined,
                    executionTimeMs: newResult.executionTimeMs,
                    executionPath: newResult.executionPath,
                    weightChoices: newResult.weightChoices || [],
                    usedNodeIds: newResult.executionPath ? newResult.executionPath.nodeExecutionOrder :
                        (newResult.output && !newResult.output.startsWith('Error:') ? [`node_${newResult.seed}`] : []),
                    usedEdgeIds: newResult.executionPath ? [] :
                        (newResult.output && !newResult.output.startsWith('Error:') ? [`edge_${newResult.seed}`] : []),
                    debugInfo: newResult.executionPath ? generateDebugInfo(newResult.executionPath) : undefined
                };
                // Update only the specific result
                setResults(prev => {
                    const updated = [...prev];
                    updated[resultIndex] = transformedResult;
                    updateVarianceMetrics(updated);
                    return updated;
                });
            }
        }
        catch (err) {
            if (err?.name !== 'AbortError') {
                setError(`Failed to regenerate result: ${err?.message ?? 'Unknown error'}`);
            }
        }
        finally {
            setRegeneratingResults(prev => prev.filter(i => i !== resultIndex));
        }
    }, [results]);
    // Epic 8.5 Task 3: Result management actions
    const lockResult = useCallback((index, note) => {
        setResults(prev => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index] = {
                    ...updated[index],
                    locked: true,
                    lockedAt: Date.now(),
                    lockedNote: note
                };
            }
            updateVarianceMetrics(updated);
            return updated;
        });
        setLockedResults(prev => [...prev, index]);
    }, []);
    const unlockResult = useCallback((index) => {
        setResults(prev => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index] = {
                    ...updated[index],
                    locked: false,
                    lockedAt: undefined,
                    lockedNote: undefined
                };
            }
            updateVarianceMetrics(updated);
            return updated;
        });
        setLockedResults(prev => prev.filter(i => i !== index));
    }, []);
    const regenerateResult = useCallback(async (index) => {
        if (!lastGraphRef.current || results[index]?.locked) {
            return;
        }
        await regenerateSpecificResult(lastGraphRef.current, results[index].seed, index);
    }, [results, regenerateSpecificResult]);
    return {
        loading,
        error,
        results,
        runPreview,
        cancelPreview,
        performanceStats,
        aggregateError,
        // Epic 8.5 Task 3: Individual result management
        lockedResults,
        regeneratingResults,
        lockResult,
        unlockResult,
        regenerateResult,
        // Epic 8.5 Task 5: Creative variance analysis
        varianceMetrics
    };
}
;
/**
 * Generate debug info from execution path for visualization
 */
function generateDebugInfo(executionPath) {
    const debugInfo = ExecutionPathAnalyzer.generateDebugInfo(executionPath);
    return {
        nodeExecutionOrder: executionPath.nodeExecutionOrder,
        randomChoices: executionPath.randomizationPoints,
        performanceBreakdown: debugInfo.performanceBreakdown,
        memoryUsage: undefined // Could be added in future
    };
}

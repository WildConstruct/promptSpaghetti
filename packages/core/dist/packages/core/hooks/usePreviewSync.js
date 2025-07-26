/**
 * Real-Time Preview Synchronization Hook
 * Epic 8.5: Story 8.5 - Real-Time Multi-Seed Preview - Task 2
 *
 * Advanced hook for managing real-time preview synchronization with graph changes,
 * intelligent caching, and performance optimization.
 */
import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useGraphStore } from '../graphStore';
import { usePreviewStateStore } from '../stores/previewStateStore';
import { debounce } from 'lodash';
// Generate hash for graph objects for change detection
const generateGraphHash = (graph) => {
    try {
        // Create a stable hash by sorting keys and handling nested objects
        const stableStringify = (obj) => {
            if (obj === null || obj === undefined)
                return 'null';
            if (typeof obj !== 'object')
                return String(obj);
            if (Array.isArray(obj))
                return `[${obj.map(stableStringify).join(',')}]`;
            const sortedKeys = Object.keys(obj).sort();
            const pairs = sortedKeys.map(key => `"${key}":${stableStringify(obj[key])}`);
            return `{${pairs.join(',')}}`;
        };
        return btoa(stableStringify(graph)).slice(0, 16);
    }
    catch {
        return `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
// Analyze graph changes to determine significance
const analyzeGraphChanges = (oldGraph, newGraph, oldHash, newHash) => {
    if (oldHash === newHash) {
        return {
            changeType: 'cosmetic',
            affectedNodes: [],
            affectedEdges: [],
            significance: 0,
            shouldTriggerPreview: false
        };
    }
    if (!oldGraph || !newGraph) {
        return {
            changeType: 'structural',
            affectedNodes: [],
            affectedEdges: [],
            significance: 1,
            shouldTriggerPreview: true
        };
    }
    const oldNodes = new Set((oldGraph.nodes || []).map((n) => n.id));
    const newNodes = new Set((newGraph.nodes || []).map((n) => n.id));
    const oldEdges = new Set((oldGraph.edges || []).map((e) => e.id));
    const newEdges = new Set((newGraph.edges || []).map((e) => e.id));
    // Check for structural changes
    const nodesAdded = [...newNodes].filter(id => !oldNodes.has(id));
    const nodesRemoved = [...oldNodes].filter(id => !newNodes.has(id));
    const edgesAdded = [...newEdges].filter(id => !oldEdges.has(id));
    const edgesRemoved = [...oldEdges].filter(id => !newEdges.has(id));
    const structuralChanges = nodesAdded.length + nodesRemoved.length +
        edgesAdded.length + edgesRemoved.length;
    if (structuralChanges > 0) {
        return {
            changeType: 'structural',
            affectedNodes: [...nodesAdded, ...nodesRemoved],
            affectedEdges: [...edgesAdded, ...edgesRemoved],
            significance: Math.min(1, structuralChanges / 10), // Cap at 1.0
            shouldTriggerPreview: true
        };
    }
    // Check for content changes in existing nodes
    const changedNodes = [];
    const commonNodes = [...oldNodes].filter(id => newNodes.has(id));
    for (const nodeId of commonNodes) {
        const oldNode = (oldGraph.nodes || []).find((n) => n.id === nodeId);
        const newNode = (newGraph.nodes || []).find((n) => n.id === nodeId);
        if (oldNode && newNode) {
            // Compare node data (excluding position for performance)
            const oldData = { ...oldNode.data };
            const newData = { ...newNode.data };
            if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
                changedNodes.push(nodeId);
            }
        }
    }
    if (changedNodes.length > 0) {
        return {
            changeType: 'content',
            affectedNodes: changedNodes,
            affectedEdges: [],
            significance: Math.min(0.8, changedNodes.length / 5), // Content changes are less significant
            shouldTriggerPreview: changedNodes.length > 0
        };
    }
    // If we reach here, it's likely a cosmetic change
    return {
        changeType: 'cosmetic',
        affectedNodes: [],
        affectedEdges: [],
        significance: 0.1,
        shouldTriggerPreview: false
    };
};
export const usePreviewSync = (options = {}) => {
    const { enabled = true, debounceMs = 500, significanceThreshold = 0.1, maxAutoRefreshRate = 2000, // 2 seconds minimum between auto refreshes
    enablePerformanceTracking = true } = options;
    // Graph store state
    const { nodes, edges, getGraphData } = useGraphStore();
    // Preview state store
    const { isRealTimeEnabled, enableRealTimeSync, updateGraphHash, lastGraphHash, shouldAutoRefresh, getCachedResults, setCachedResults, updatePerformanceMetrics, performanceMetrics } = usePreviewStateStore();
    // Local state
    const lastGraphRef = useRef(null);
    const lastSyncTimeRef = useRef(null);
    const syncCountRef = useRef(0);
    const isSyncingRef = useRef(false);
    const performanceDataRef = useRef({
        syncTimes: [],
        successCount: 0,
        totalAttempts: 0
    });
    const lastChangeAnalysisRef = useRef(null);
    // Get current graph data
    const currentGraph = useMemo(() => ({ nodes, edges }), [nodes, edges]);
    const currentGraphHash = useMemo(() => generateGraphHash(currentGraph), [currentGraph]);
    // Performance metrics calculation
    const performanceMetricsCalc = useMemo(() => {
        const data = performanceDataRef.current;
        return {
            avgSyncTime: data.syncTimes.length > 0
                ? data.syncTimes.reduce((sum, time) => sum + time, 0) / data.syncTimes.length
                : 0,
            successRate: data.totalAttempts > 0 ? data.successCount / data.totalAttempts : 1,
            cacheHitRate: performanceMetrics.cacheHitRate
        };
    }, [performanceMetrics.cacheHitRate, performanceDataRef.current]);
    // Import usePreviewSeeds for actual preview execution
    // Initialize preview runner
    useEffect(() => {
        const initializePreviewRunner = async () => {
            try {
                const { usePreviewSeeds } = await import('../usePreviewSeeds');
                // We can't use the hook here, so we'll need to handle this differently
                // For now, we'll create a simpler API call function
            }
            catch (error) {
                console.warn('Failed to initialize preview runner:', error);
            }
        };
        initializePreviewRunner();
    }, []);
    // Execute preview with caching and performance tracking
    const executePreview = useCallback(async (graph, forceRefresh = false) => {
        if (isSyncingRef.current)
            return false;
        isSyncingRef.current = true;
        const startTime = Date.now();
        performanceDataRef.current.totalAttempts++;
        try {
            const graphHash = generateGraphHash(graph);
            // Check cache first (unless forced refresh)
            if (!forceRefresh) {
                const cached = getCachedResults(graphHash);
                if (cached && cached.results.length > 0) {
                    // Use cached results
                    usePreviewStateStore.setState({
                        results: cached.results,
                        performanceStats: cached.performanceStats,
                        lastUpdateTimestamp: Date.now()
                    });
                    performanceDataRef.current.successCount++;
                    return true;
                }
            }
            // Execute actual preview
            const response = await fetch('/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    graph,
                    runs: 5,
                    seedStart: Math.floor(Math.random() * 10000)
                })
            });
            if (!response.ok) {
                throw new Error(`Preview API error: ${response.status}`);
            }
            const data = await response.json();
            // Transform results
            const results = data.results.map((result) => ({
                seed: result.seed,
                output: result.output?.startsWith('Error:') ? undefined : result.output,
                error: result.output?.startsWith('Error:') ? result.output : undefined,
                executionTimeMs: result.executionTimeMs,
                executionPath: result.executionPath,
                weightChoices: result.weightChoices || [],
                usedNodeIds: result.executionPath?.nodeExecutionOrder || [],
                usedEdgeIds: []
            }));
            // Calculate performance stats
            const executionTimes = results
                .map((r) => r.executionTimeMs)
                .filter((t) => typeof t === 'number');
            const performanceStats = executionTimes.length > 0 ? {
                totalTime: Date.now() - startTime,
                averageTime: Math.round(executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length)
            } : null;
            // Update store
            usePreviewStateStore.setState({
                results,
                performanceStats,
                error: null,
                aggregateError: null,
                lastUpdateTimestamp: Date.now()
            });
            // Cache results
            setCachedResults(graphHash, results, performanceStats);
            // Update performance tracking
            if (enablePerformanceTracking) {
                const syncTime = Date.now() - startTime;
                performanceDataRef.current.syncTimes.push(syncTime);
                performanceDataRef.current.syncTimes = performanceDataRef.current.syncTimes.slice(-50); // Keep last 50
                updatePerformanceMetrics({
                    totalExecutionTime: performanceMetrics.totalExecutionTime + syncTime,
                    averageExecutionTime: performanceMetricsCalc.avgSyncTime,
                    lastExecutionCount: performanceMetrics.lastExecutionCount + 1
                });
            }
            performanceDataRef.current.successCount++;
            lastSyncTimeRef.current = Date.now();
            syncCountRef.current++;
            return true;
        }
        catch (error) {
            console.error('Preview sync failed:', error);
            usePreviewStateStore.setState({
                error: error instanceof Error ? error.message : 'Preview sync failed'
            });
            return false;
        }
        finally {
            isSyncingRef.current = false;
        }
    }, [
        getCachedResults,
        setCachedResults,
        updatePerformanceMetrics,
        performanceMetrics,
        performanceMetricsCalc,
        enablePerformanceTracking
    ]);
    // Debounced sync function
    const debouncedSync = useMemo(() => debounce((graph, analysis) => {
        if (analysis.shouldTriggerPreview && analysis.significance >= significanceThreshold) {
            executePreview(graph);
        }
    }, debounceMs), [debounceMs, significanceThreshold, executePreview]);
    // Handle graph changes
    useEffect(() => {
        if (!isRealTimeEnabled || !enabled)
            return;
        const oldGraph = lastGraphRef.current;
        const oldHash = lastGraphHash;
        // Analyze changes
        const analysis = analyzeGraphChanges(oldGraph, currentGraph, oldHash || '', currentGraphHash);
        lastChangeAnalysisRef.current = analysis;
        // Update graph hash
        updateGraphHash(currentGraphHash);
        lastGraphRef.current = currentGraph;
        // Check rate limiting
        const timeSinceLastSync = lastSyncTimeRef.current
            ? Date.now() - lastSyncTimeRef.current
            : maxAutoRefreshRate;
        if (timeSinceLastSync < maxAutoRefreshRate) {
            console.log('Preview sync rate limited');
            return;
        }
        // Check if auto refresh should trigger
        if (shouldAutoRefresh(analysis.significance)) {
            debouncedSync(currentGraph, analysis);
        }
    }, [
        currentGraph,
        currentGraphHash,
        isRealTimeEnabled,
        enabled,
        lastGraphHash,
        updateGraphHash,
        shouldAutoRefresh,
        debouncedSync,
        maxAutoRefreshRate
    ]);
    // Force sync function
    const forceSyncNow = useCallback(async () => {
        if (isSyncingRef.current)
            return;
        await executePreview(currentGraph, true);
    }, [currentGraph, executePreview]);
    // Enable/disable sync
    const enableSync = useCallback((syncEnabled) => {
        enableRealTimeSync(syncEnabled);
    }, [enableRealTimeSync]);
    // Get current change analysis
    const getChangeAnalysis = useCallback(() => {
        return lastChangeAnalysisRef.current;
    }, []);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            debouncedSync.cancel();
        };
    }, [debouncedSync]);
    return {
        isEnabled: isRealTimeEnabled && enabled,
        isSyncing: isSyncingRef.current,
        lastSyncTime: lastSyncTimeRef.current,
        syncCount: syncCountRef.current,
        enableSync,
        forceSyncNow,
        getChangeAnalysis,
        performanceMetrics: performanceMetricsCalc
    };
};

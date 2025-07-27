/**
 * State Dev Tools
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools
 *
 * Advanced state inspection with time-travel debugging and performance analysis
 */
import { EventEmitter } from 'events';
// Main DevTools class
export class StateDevTools extends EventEmitter {
    config;
    stateHistory = [];
    performanceData = new Map();
    dependencyGraph;
    replayEnvironments = new Map();
    performanceMetrics = new Map();
    isRecording = false;
    isReplaying = false;
    memoryTracker;
    networkTracker;
    constructor(config = {}) {
        super();
        this.config = {
            enableTimeTravel: true,
            enablePerformanceTracking: true,
            enableDependencyVisualization: true,
            maxHistorySize: 1000,
            trackingInterval: 100,
            enableStateValidation: true,
            enableMemoryTracking: true,
            enableNetworkTracking: true,
            ...config
        };
        this.dependencyGraph = {
            nodes: [],
            edges: [],
            metadata: {
                totalNodes: 0,
                totalEdges: 0,
                circularDependencies: [],
                criticalPaths: [],
                lastUpdated: Date.now(),
                complexity: 0
            }
        };
        this.memoryTracker = new MemoryTracker();
        this.networkTracker = new NetworkTracker();
        this.setupTracking();
    }
    // Time-travel debugging
    recordStateChange(snapshot, domain) {
        if (!this.isRecording)
            return;
        const enhancedSnapshot = {
            ...snapshot,
            metadata: {
                ...snapshot.metadata,
                domain,
                memoryUsage: this.memoryTracker.getCurrentUsage(),
                networkActivity: this.networkTracker.getCurrentActivity(),
                dependencyCount: this.getDependencyCount(domain)
            }
        };
        this.stateHistory.push(enhancedSnapshot);
        // Limit history size
        if (this.stateHistory.length > this.config.maxHistorySize) {
            this.stateHistory = this.stateHistory.slice(-this.config.maxHistorySize);
        }
        this.emit('stateRecorded', { snapshot: enhancedSnapshot, domain });
    }
    replayStateChanges(fromTimestamp, toTimestamp, options = {}) {
        const { stepDelay = 100, highlightChanges = true, showDiff = true, domains, speed = 1 } = options;
        const relevantChanges = this.getStateChangesBetween(fromTimestamp, toTimestamp, domains);
        if (relevantChanges.length === 0) {
            throw new Error('No state changes found in the specified time range');
        }
        // Create isolated environment for replay
        const replayEnvironment = this.createReplayEnvironment(relevantChanges);
        this.isReplaying = true;
        this.emit('replayStarted', { environment: replayEnvironment, options });
        // Start replay process
        this.executeReplay(replayEnvironment, {
            stepDelay: stepDelay / speed,
            highlightChanges,
            showDiff
        });
        return replayEnvironment;
    }
    async executeReplay(environment, options) {
        const { stepDelay, highlightChanges, showDiff } = options;
        for (let i = 0; i < environment.changes.length; i++) {
            if (!this.isReplaying)
                break;
            const change = environment.changes[i];
            environment.currentIndex = i;
            // Apply change in replay environment
            const prevState = this.getReplayState(environment, i - 1);
            const newState = this.applyChangeToReplayState(prevState, change);
            // Emit replay events
            this.emit('replayStep', {
                environment,
                step: i,
                change,
                prevState: prevState,
                newState: newState,
                diff: showDiff ? this.calculateStateDiff(prevState, newState) : undefined
            });
            if (highlightChanges) {
                this.highlightStateChanges(change, newState);
            }
            // Wait before next step
            if (stepDelay > 0) {
                await this.delay(stepDelay);
            }
        }
        this.isReplaying = false;
        this.emit('replayCompleted', { environment });
    }
    stopReplay() {
        this.isReplaying = false;
        this.emit('replayStopped');
    }
    // State dependency visualization
    visualizeStateDependencies(options = {}) {
        const { domains, includeComponents = true, includeSelectors = true, includeCrossDomainLinks = true, layout = 'hierarchical', depth = 5 } = options;
        const graph = this.buildDependencyGraph({
            domains,
            includeComponents,
            includeSelectors,
            includeCrossDomainLinks,
            depth
        });
        const layoutGraph = this.applyLayout(graph, layout);
        this.analyzeGraphComplexity(layoutGraph);
        this.detectCircularDependencies(layoutGraph);
        this.identifyCriticalPaths(layoutGraph);
        this.dependencyGraph = layoutGraph;
        this.emit('dependencyGraphUpdated', { graph: layoutGraph });
        return layoutGraph;
    }
    // Performance bottleneck detection
    detectStateBottlenecks(timeRange) {
        const analysisTimeRange = timeRange || {
            start: Date.now() - (24 * 60 * 60 * 1000), // Last 24 hours
            end: Date.now()
        };
        const report = {
            summary: this.generatePerformanceSummary(analysisTimeRange),
            bottlenecks: this.identifyBottlenecks(analysisTimeRange),
            recommendations: this.generateRecommendations(analysisTimeRange),
            trends: this.analyzeTrends(analysisTimeRange),
            domainAnalysis: this.analyzeDomainPerformance(analysisTimeRange)
        };
        this.emit('performanceReportGenerated', { report, timeRange: analysisTimeRange });
        return report;
    }
    // State validation
    validateStateIntegrity(state, domain, options = {}) {
        const startTime = performance.now();
        const memoryBefore = this.memoryTracker.getCurrentUsage();
        const { deep = true, checkReferences = true, validateSchema = true, checkMemoryLeaks = true } = options;
        const errors = [];
        const warnings = [];
        try {
            // Basic structure validation
            if (state === null || state === undefined) {
                errors.push({
                    path: 'root',
                    message: 'State is null or undefined',
                    value: state,
                    expected: 'valid object',
                    severity: 'error',
                    code: 'NULL_STATE'
                });
            }
            // Deep validation
            if (deep && typeof state === 'object') {
                this.validateStateStructure(state, 'root', errors, warnings);
            }
            // Reference validation
            if (checkReferences) {
                this.validateStateReferences(state, errors, warnings);
            }
            // Schema validation
            if (validateSchema) {
                this.validateStateSchema(state, domain, errors, warnings);
            }
            // Memory leak detection
            if (checkMemoryLeaks) {
                this.detectMemoryLeaks(state, domain, warnings);
            }
        }
        catch (error) {
            errors.push({
                path: 'validation',
                message: `Validation error: ${error.message}`,
                value: state,
                expected: 'valid state',
                severity: 'error',
                code: 'VALIDATION_ERROR'
            });
        }
        const validationTime = performance.now() - startTime;
        const memoryAfter = this.memoryTracker.getCurrentUsage();
        const result = {
            valid: errors.length === 0,
            errors,
            warnings,
            performance: {
                validationTime,
                memoryImpact: memoryAfter - memoryBefore
            }
        };
        this.emit('stateValidated', { domain, result });
        return result;
    }
    // Memory and performance tracking
    startRecording() {
        this.isRecording = true;
        this.memoryTracker.start();
        this.networkTracker.start();
        this.emit('recordingStarted');
    }
    stopRecording() {
        this.isRecording = false;
        this.memoryTracker.stop();
        this.networkTracker.stop();
        this.emit('recordingStopped');
    }
    getRecordingStatus() {
        return {
            isRecording: this.isRecording,
            isReplaying: this.isReplaying,
            historySize: this.stateHistory.length,
            memoryUsage: this.memoryTracker.getCurrentUsage(),
            uptime: Date.now() - (this.stateHistory[0]?.timestamp || Date.now())
        };
    }
    // Utility methods
    getStateChangesBetween(fromTimestamp, toTimestamp, domains) {
        return this.stateHistory
            .filter(snapshot => {
            const inTimeRange = snapshot.timestamp >= fromTimestamp && snapshot.timestamp <= toTimestamp;
            const inDomain = !domains || domains.includes(snapshot.metadata?.domain || '');
            return inTimeRange && inDomain && snapshot.change;
        })
            .map(snapshot => snapshot.change)
            .sort((a, b) => a.timestamp - b.timestamp);
    }
    createReplayEnvironment(changes) {
        const environmentId = this.generateEnvironmentId();
        const domains = [...new Set(changes.map(c => c.source))];
        const environment = {
            id: environmentId,
            baseState: this.getBaseStateForReplay(changes[0]?.timestamp || Date.now()),
            changes,
            currentIndex: -1,
            metadata: {
                created: Date.now(),
                totalChanges: changes.length,
                timespan: changes.length > 0 ? changes[changes.length - 1].timestamp - changes[0].timestamp : 0,
                domains
            }
        };
        this.replayEnvironments.set(environmentId, environment);
        return environment;
    }
    getBaseStateForReplay(timestamp) {
        // Find the closest snapshot before the timestamp
        const snapshot = this.stateHistory
            .filter(s => s.timestamp <= timestamp)
            .sort((a, b) => b.timestamp - a.timestamp)[0];
        return snapshot?.state || {};
    }
    getReplayState(environment, index) {
        if (index < 0)
            return environment.baseState;
        let state = { ...environment.baseState };
        for (let i = 0; i <= index && i < environment.changes.length; i++) {
            state = this.applyChangeToReplayState(state, environment.changes[i]);
        }
        return state;
    }
    applyChangeToReplayState(state, change) {
        // Apply the change to the state
        return {
            ...state,
            ...change.payload
        };
    }
    calculateStateDiff(prevState, newState) {
        const diff = {};
        for (const key in newState) {
            if (newState[key] !== prevState[key]) {
                diff[key] = {
                    from: prevState[key],
                    to: newState[key]
                };
            }
        }
        return diff;
    }
    highlightStateChanges(change, state) {
        // Emit highlighting events for UI
        this.emit('highlightChanges', {
            change,
            state,
            paths: Object.keys(change.payload)
        });
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    buildDependencyGraph(options) {
        // This would integrate with the actual state management system
        // For now, return a basic structure
        return {
            nodes: [],
            edges: [],
            metadata: {
                totalNodes: 0,
                totalEdges: 0,
                circularDependencies: [],
                criticalPaths: [],
                lastUpdated: Date.now(),
                complexity: 0
            }
        };
    }
    applyLayout(graph, layout) {
        // Apply the specified layout algorithm
        // This would use a graph layout library like d3-force or dagre
        return graph;
    }
    analyzeGraphComplexity(graph) {
        // Calculate graph complexity metrics
        const nodeCount = graph.nodes.length;
        const edgeCount = graph.edges.length;
        // Cyclomatic complexity for state dependencies
        graph.metadata.complexity = edgeCount - nodeCount + 2;
    }
    detectCircularDependencies(graph) {
        // Detect circular dependencies using DFS
        const visited = new Set();
        const recursionStack = new Set();
        const circularPaths = [];
        for (const node of graph.nodes) {
            if (!visited.has(node.id)) {
                this.dfsCircularDetection(node.id, graph, visited, recursionStack, circularPaths);
            }
        }
        graph.metadata.circularDependencies = circularPaths;
    }
    dfsCircularDetection(nodeId, graph, visited, recursionStack, circularPaths) {
        visited.add(nodeId);
        recursionStack.add(nodeId);
        const edges = graph.edges.filter(edge => edge.from === nodeId);
        for (const edge of edges) {
            if (!visited.has(edge.to)) {
                if (this.dfsCircularDetection(edge.to, graph, visited, recursionStack, circularPaths)) {
                    circularPaths.push(`${nodeId} -> ${edge.to}`);
                    return true;
                }
            }
            else if (recursionStack.has(edge.to)) {
                circularPaths.push(`${nodeId} -> ${edge.to}`);
                return true;
            }
        }
        recursionStack.delete(nodeId);
        return false;
    }
    identifyCriticalPaths(graph) {
        // Identify critical paths using longest path algorithm
        graph.metadata.criticalPaths = [];
    }
    generatePerformanceSummary(timeRange) {
        return {
            totalStateUpdates: 0,
            averageUpdateLatency: 0,
            memoryUsage: this.memoryTracker.getCurrentUsage(),
            renderSkipRate: 0,
            cacheEfficiency: 0,
            networkLatency: 0
        };
    }
    identifyBottlenecks(timeRange) {
        return [];
    }
    generateRecommendations(timeRange) {
        return [];
    }
    analyzeTrends(timeRange) {
        return [];
    }
    analyzeDomainPerformance(timeRange) {
        return new Map();
    }
    validateStateStructure(obj, path, errors, warnings) {
        // Validate object structure recursively
        if (obj === null || obj === undefined)
            return;
        try {
            JSON.stringify(obj);
        }
        catch (error) {
            errors.push({
                path,
                message: 'Object contains circular references',
                value: obj,
                expected: 'serializable object',
                severity: 'error',
                code: 'CIRCULAR_REFERENCE'
            });
        }
    }
    validateStateReferences(state, errors, warnings) {
        // Validate references within state
    }
    validateStateSchema(state, domain, errors, warnings) {
        // Validate against domain schema
    }
    detectMemoryLeaks(state, domain, warnings) {
        // Detect potential memory leaks
        const size = JSON.stringify(state).length;
        if (size > 1024 * 1024) { // 1MB threshold
            warnings.push({
                path: 'root',
                message: `Large state object detected in ${domain}`,
                suggestion: 'Consider breaking down large state objects or implementing pagination',
                impact: 'high'
            });
        }
    }
    getDependencyCount(domain) {
        return this.dependencyGraph.nodes.filter(node => node.domain === domain).length;
    }
    setupTracking() {
        if (this.config.enablePerformanceTracking) {
            setInterval(() => {
                this.collectPerformanceMetrics();
            }, this.config.trackingInterval);
        }
    }
    collectPerformanceMetrics() {
        const timestamp = Date.now();
        const metrics = {
            memory: this.memoryTracker.getCurrentUsage(),
            historySize: this.stateHistory.length,
            dependencyCount: this.dependencyGraph.nodes.length
        };
        for (const [key, value] of Object.entries(metrics)) {
            if (!this.performanceMetrics.has(key)) {
                this.performanceMetrics.set(key, []);
            }
            this.performanceMetrics.get(key).push(value);
        }
        this.emit('metricsCollected', { timestamp, metrics });
    }
    generateEnvironmentId() {
        return `replay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Public API methods
    getStateHistory() {
        return [...this.stateHistory];
    }
    getDependencyGraph() {
        return { ...this.dependencyGraph };
    }
    getPerformanceMetrics() {
        return new Map(this.performanceMetrics);
    }
    clearHistory() {
        this.stateHistory = [];
        this.performanceMetrics.clear();
        this.emit('historyCleared');
    }
    exportSession() {
        return {
            config: this.config,
            history: this.stateHistory,
            metrics: Object.fromEntries(this.performanceMetrics),
            dependencyGraph: this.dependencyGraph
        };
    }
    importSession(sessionData) {
        this.config = { ...this.config, ...sessionData.config };
        this.stateHistory = sessionData.history || [];
        this.performanceMetrics = new Map(Object.entries(sessionData.metrics || {}));
        this.dependencyGraph = sessionData.dependencyGraph || this.dependencyGraph;
        this.emit('sessionImported', { sessionData });
    }
}
// Helper classes
class MemoryTracker {
    startTime = 0;
    isTracking = false;
    start() {
        this.startTime = Date.now();
        this.isTracking = true;
    }
    stop() {
        this.isTracking = false;
    }
    getCurrentUsage() {
        if (typeof performance !== 'undefined' && performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return 0;
    }
}
class NetworkTracker {
    isTracking = false;
    networkActivity = 0;
    start() {
        this.isTracking = true;
    }
    stop() {
        this.isTracking = false;
    }
    getCurrentActivity() {
        return this.networkActivity;
    }
}
// Global DevTools instance
export const globalStateDevTools = new StateDevTools();

/**
 * Execution Path Tracking Types
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 2: Execution Path Visualization
 */
export interface NodeExecutionStep {
    nodeId: string;
    nodeType: string;
    stepIndex: number;
    timestamp: number;
    executionTimeMs: number;
    inputs: ExecutionInput;
    output: unknown;
    randomChoice?: RandomChoiceInfo;
    error?: string;
}
export interface ExecutionInput {
    sourceNodeId?: string;
    value: unknown;
    inputIndex: number;
}
export interface RandomChoiceInfo {
    choiceType: 'weighted' | 'uniform' | 'conditional' | 'sequential' | 'markov';
    availableOptions: string;
    selectedOption: string;
    selectionReason: string;
    probability?: number;
    weight?: number;
    conditionMet?: boolean;
}
export interface ExecutionPath {
    id: string;
    seed: number;
    startTime: number;
    endTime: number;
    totalExecutionTime: number;
    steps: NodeExecutionStep;
    finalOutput: string;
    nodeExecutionOrder: string;
    randomizationPoints: RandomChoiceInfo;
    error?: string;
}
export interface PathVisualizationData {
    executionPath: ExecutionPath;
    pathColor: string;
    highlightedNodes: string;
    executionFlow: ExecutionFlowEdge;
    variance: number;
    creativityScore: number;
}
export interface ExecutionFlowEdge {
    from: string;
    to: string;
    stepIndex: number;
    dataFlow: unknown;
    executionTimeMs: number;
    isRandomChoice: boolean;
}
export interface PreviewResultWithPath {
    seed: number;
    output: string;
    error?: string;
    usedNodeIds?: string;
    usedEdgeIds?: string;
    executionTimeMs?: number;
    executionPath?: ExecutionPath;
    pathVisualization?: PathVisualizationData;
    debugInfo?: {
        nodeExecutionOrder: string;
        randomChoices: RandomChoiceInfo;
        performanceBreakdown: Record<string, number>;
        memoryUsage?: number;
    };
}
export interface MultiSeedPreviewResult {
    results: PreviewResultWithPath;
    aggregateStats: {
        totalTime: number;
        averageTime: number;
        variance: number;
        uniquePaths: number;
        commonNodes: string;
        divergencePoints: string;
    };
    pathComparison: PathComparisonData;
}
export interface PathComparisonData {
    sharedSteps: NodeExecutionStep;
    divergentPaths: {
        resultId: string;
        divergencePoint: string;
        uniqueSteps: NodeExecutionStep;
    }[];
    varianceAnalysis: {
        highVarianceNodes: string;
        consistentNodes: string;
        randomizationImpact: number;
    };
}
export interface ExecutionTracker {
    startTracking(seed: number): string;
    recordNodeExecution(executionId: string, step: NodeExecutionStep): void;
    recordRandomChoice(executionId: string, choice: RandomChoiceInfo): void;
    finishTracking(executionId: string, output: string): ExecutionPath;
    getExecutionPath(executionId: string): ExecutionPath | null;
    clearTracker(executionId: string): void;
}
export declare const EXECUTION_PATH_COLORS: readonly ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#F97316", "#06B6D4", "#84CC16", "#EC4899", "#6B7280"];
export type ExecutionPathColor = typeof EXECUTION_PATH_COLORS[number];
export interface NodeHighlightStyle {
    color: ExecutionPathColor;
    opacity: number;
    strokeWidth: number;
    animation?: 'pulse' | 'glow' | 'none';
    order: number;
}
export interface ExecutionVisualizationConfig {
    showExecutionOrder: boolean;
    showRandomChoices: boolean;
    showPerformanceMetrics: boolean;
    animateExecution: boolean;
    highlightCommonPaths: boolean;
    colorByVariance: boolean;
    showDebugInfo: boolean;
}
//# sourceMappingURL=ExecutionPath.d.ts.map
/**
 * Epic 14 - A/B Testing Framework
 * Core experiment types and interfaces
 */
export interface ExperimentId {
    value: string;
}
export interface ExperimentVariant {
    id: string;
    name: string;
    description?: string;
    prompt?: string;
    graphData?: unknown;
    claudeModel?: string;
    temperature?: number;
    maxTokens?: number;
    properties?: Record<string, unknown>;
    promptHash?: string;
}
export interface TrafficAllocation {
    [variantId: string]: number;
}
export interface ExperimentMetric {
    id: string;
    name: string;
    type: 'conversion' | 'latency' | 'cost' | 'custom';
    query?: string;
    isPrimary: boolean;
    isGuardrail: boolean;
    expectedDirection: 'increase' | 'decrease';
    minimumDetectableEffect?: number;
}
export type ExperimentType = 'prompt' | 'graph' | 'feature_flag';
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed' | 'archived';
export interface ExperimentSchedule {
    startAt?: Date;
    endAt?: Date;
    autoStop?: {
        minSampleSize?: number;
        maxPValue?: number;
        budgetCap?: number;
        confidenceThreshold?: number;
    };
}
export interface Experiment {
    id: string;
    organizationId: string;
    name: string;
    type: ExperimentType;
    hypothesis: string;
    description?: string;
    variants: ExperimentVariant[];
    trafficAllocation: TrafficAllocation;
    metrics: ExperimentMetric[];
    status: ExperimentStatus;
    schedule: ExperimentSchedule;
    tags: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    targetSegments?: ExperimentSegment[];
    exclusionRules?: ExperimentExclusion[];
    factorialDesign?: FactorialDesign;
    rolloutStrategy?: RolloutStrategy;
}
export interface ExperimentSegment {
    id: string;
    name: string;
    filters: SegmentFilter[];
    operator: 'AND' | 'OR';
}
export interface SegmentFilter {
    property: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: unknown;
}
export interface ExperimentExclusion {
    type: 'user' | 'session' | 'segment';
    identifiers: string[];
    reason: string;
}
export interface FactorialDesign {
    factors: Factor[];
    designMatrix: DesignCell[];
}
export interface Factor {
    name: string;
    levels: string[];
}
export interface DesignCell {
    id: string;
    factors: Record<string, string>;
    allocation: number;
}
export interface RolloutStrategy {
    type: 'immediate' | 'gradual';
    stages?: RolloutStage[];
}
export interface RolloutStage {
    percentage: number;
    duration: number;
    triggerConditions?: {
        successRate?: number;
        errorRate?: number;
        latencyThreshold?: number;
    };
}
export interface UserAssignment {
    userId: string;
    experimentId: string;
    variantId: string;
    assignedAt: Date;
    sessionId?: string;
    sticky: boolean;
    salt: string;
}
export interface AssignmentRequest {
    userId: string;
    sessionId?: string;
    experimentId: string;
    overrideVariant?: string;
    debugMode?: boolean;
}
export interface AssignmentResponse {
    variantId: string;
    variant: ExperimentVariant;
    assigned: boolean;
    reason?: string;
    debugInfo?: {
        hash: string;
        bucket: number;
        allocation: TrafficAllocation;
    };
}
export interface ExperimentResults {
    experimentId: string;
    calculatedAt: Date;
    variants: VariantResults[];
    statistical: StatisticalResults;
    segments: SegmentResults[];
    insights: ExperimentInsight[];
}
export interface VariantResults {
    variantId: string;
    metrics: MetricResult[];
    sampleSize: number;
    conversionRate?: number;
    averageLatency?: number;
    totalCost?: number;
    errorRate?: number;
}
export interface MetricResult {
    metricId: string;
    value: number;
    confidenceInterval: [number, number];
    standardError: number;
    trend: 'up' | 'down' | 'stable';
}
export interface StatisticalResults {
    primaryMetric: {
        winningVariant?: string;
        pValue: number;
        statisticalSignificance: boolean;
        practicalSignificance: boolean;
        confidenceLevel: number;
    };
    guardrailMetrics: {
        metricId: string;
        passed: boolean;
        threshold: number;
        actualValue: number;
    }[];
}
export interface SegmentResults {
    segment: ExperimentSegment;
    variants: VariantResults[];
    sampleSize: number;
    significance: boolean;
}
export interface ExperimentInsight {
    type: 'winner_detected' | 'segment_opportunity' | 'cost_anomaly' | 'performance_degradation';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    actionable: boolean;
    recommendations?: string[];
    data?: Record<string, unknown>;
}
export interface ExperimentTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    type: ExperimentType;
    variants: Partial<ExperimentVariant>[];
    metrics: ExperimentMetric[];
    defaultAllocation: TrafficAllocation;
    tags: string[];
    successRate: number;
    averageUplift: number;
    timesUsed: number;
    createdBy: string;
    createdAt: Date;
}
export interface KnowledgeBaseEntry {
    id: string;
    experimentId: string;
    title: string;
    summary: string;
    insights: string[];
    learnings: string[];
    recommendations: string[];
    category: string;
    tags: string[];
    impact: 'low' | 'medium' | 'high';
    confidence: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface ABTestingConfig {
    maxVariants: number;
    defaultConfidenceLevel: number;
    defaultMinSampleSize: number;
    saltRotationInterval: number;
    maxExperimentDuration: number;
    enableBayesian: boolean;
    enableBandits: boolean;
    enableFactorial: boolean;
}
export interface AllocationServiceConfig {
    redisUrl: string;
    cacheTtl: number;
    maxAssignmentLatency: number;
    enableDebugMode: boolean;
    saltStorage: {
        currentSalt: string;
        previousSalts: {
            salt: string;
            rotatedAt: Date;
        }[];
    };
}
export declare class ExperimentError extends Error {
    code: string;
    experimentId?: string | undefined;
    details?: Record<string, unknown> | undefined;
    constructor(
      message: string,
      code: string,
      experimentId?: string | undefined,
      details?: Record<string,
      unknown> | undefined
    );
}
export declare class AllocationError extends Error {
    code: string;
    userId?: string | undefined;
    experimentId?: string | undefined;
    constructor(message: string, code: string, userId?: string | undefined, experimentId?: string | undefined);
}
export type ExperimentEventType = 'experiment_created' | 'experiment_started' | 'experiment_paused' | 'experiment_resumed' | 'experiment_completed' | 'variant_assigned' | 'winner_detected' | 'rollout_stage_completed';
export interface ExperimentEvent {
    type: ExperimentEventType;
    experimentId: string;
    timestamp: Date;
    data: Record<string, unknown>;
    userId?: string;
    variantId?: string;
}
//# sourceMappingURL=experiment.d.ts.map
/**
 * Targeting Domain Types
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Type definitions for the advanced targeting domain (Epic 17)
 */
export interface Audience {
    id: string;
    name: string;
    description: string;
    segments: AudienceSegment[];
    conditions: TargetingCondition[];
    size: number;
    estimatedReach: number;
    status: AudienceStatus;
    metadata: AudienceMetadata;
}
export type AudienceStatus = 'active' | 'draft' | 'archived' | 'inactive';
export interface AudienceSegment {
    id: string;
    name: string;
    description: string;
    criteria: SegmentCriteria[];
    size: number;
    overlap: SegmentOverlap[];
    performance: SegmentPerformance;
}
export interface SegmentCriteria {
    type: CriteriaType;
    operator: CriteriaOperator;
    value: any;
    weight: number;
    description: string;
}
export type CriteriaType = 'demographic' | 'behavioral' | 'geographic' | 'psychographic' | 'technographic' | 'contextual' | 'temporal' | 'custom';
export type CriteriaOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
export interface SegmentOverlap {
    segmentId: string;
    overlapSize: number;
    overlapPercentage: number;
}
export interface SegmentPerformance {
    conversionRate: number;
    engagementRate: number;
    retentionRate: number;
    averageValue: number;
    lastUpdated: Date;
}
export interface AudienceMetadata {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
    version: number;
    tags: string[];
}
export interface TargetingCondition {
    id: string;
    name: string;
    type: ConditionType;
    rules: TargetingRule[];
    logic: LogicOperator;
    priority: number;
    enabled: boolean;
}
export type ConditionType = 'inclusion' | 'exclusion' | 'requirement' | 'preference';
export type LogicOperator = 'AND' | 'OR' | 'NOT' | 'XOR';
export interface TargetingRule {
    id: string;
    attribute: string;
    operator: RuleOperator;
    value: any;
    valueType: ValueType;
    caseSensitive: boolean;
    negated: boolean;
}
export type RuleOperator = 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between' | 'in_list' | 'regex' | 'exists' | 'is_empty' | 'is_null';
export type ValueType = 'string' | 'number' | 'boolean' | 'date' | 'list' | 'regex';
export interface TargetingPreview {
    audienceId: string;
    previewData: PreviewResult[];
    sampleSize: number;
    confidence: number;
    estimatedReach: number;
    generatedAt: Date;
}
export interface PreviewResult {
    userId: string;
    matched: boolean;
    matchedSegments: string[];
    matchedConditions: string[];
    score: number;
    reasoning: MatchReasoning[];
}
export interface MatchReasoning {
    rule: string;
    condition: string;
    result: boolean;
    score: number;
    explanation: string;
}
export interface TargetingAnalytics {
    audienceId: string;
    period: AnalyticsPeriod;
    metrics: TargetingMetrics;
    performance: PerformanceData;
    trends: TrendData[];
    insights: AnalyticsInsight[];
}
export interface AnalyticsPeriod {
    start: Date;
    end: Date;
    granularity: 'hour' | 'day' | 'week' | 'month';
}
export interface TargetingMetrics {
    totalReach: number;
    uniqueReach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
    clickThroughRate: number;
    cost: number;
    costPerClick: number;
    costPerConversion: number;
    returnOnAdSpend: number;
}
export interface PerformanceData {
    bySegment: Map<string, TargetingMetrics>;
    byCondition: Map<string, TargetingMetrics>;
    byTimeOfDay: Map<string, TargetingMetrics>;
    byDayOfWeek: Map<string, TargetingMetrics>;
    byDevice: Map<string, TargetingMetrics>;
    byLocation: Map<string, TargetingMetrics>;
}
export interface TrendData {
    metric: string;
    values: {
        timestamp: Date;
        value: number;
    }[];
    trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    changeRate: number;
}
export interface AnalyticsInsight {
    type: InsightType;
    title: string;
    description: string;
    impact: InsightImpact;
    confidence: number;
    recommendation: string;
    data: any;
}
export type InsightType = 'performance_anomaly' | 'segment_opportunity' | 'cost_optimization' | 'audience_fatigue' | 'timing_optimization' | 'demographic_shift';
export type InsightImpact = 'low' | 'medium' | 'high' | 'critical';
export interface TargetingDomainState {
    audiences: Audience[];
    selectedAudience: Audience | null;
    previewResults: TargetingPreview | null;
    analytics: TargetingAnalytics | null;
    loading: boolean;
    error: string | null;
}
export interface TargetingDomainEvents {
    onAudienceCreated: (audience: Audience) => void;
    onAudienceUpdated: (audience: Audience) => void;
    onAudienceDeleted: (audienceId: string) => void;
    onPreviewGenerated: (preview: TargetingPreview) => void;
    onAnalyticsUpdated: (analytics: TargetingAnalytics) => void;
    onSegmentPerformanceChanged: (segmentId: string, performance: SegmentPerformance) => void;
}
export interface AudienceBuilderProps {
    audienceId?: string;
    onAudienceChange?: (audience: Audience) => void;
    onSave?: (audience: Audience) => void;
    readOnly?: boolean;
    className?: string;
}
export interface ConditionEditorProps {
    conditions: TargetingCondition[];
    onChange: (conditions: TargetingCondition[]) => void;
    availableAttributes: string[];
    className?: string;
}
export interface TargetingPreviewProps {
    audience: Audience;
    onPreviewUpdate?: (preview: TargetingPreview) => void;
    sampleSize?: number;
    className?: string;
}
//# sourceMappingURL=TargetingTypes.d.ts.map
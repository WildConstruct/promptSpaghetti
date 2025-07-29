/**
 * Conversion Drop-off Analysis and Heatmaps - Story 30.2 Task 6
 *
 * Advanced drop-off analysis with visual heatmaps, root cause analysis,
 * and recovery opportunity identification.
 *
 * Features:
 * - Interactive drop-off heatmaps
 * - Root cause analysis with confidence scores
 * - Recovery opportunity assessment
 * - Time-based drop-off patterns
 * - User behavior flow analysis
 * - Segmented drop-off analysis
 * - Actionable recommendations
 * - Export capabilities
 */
import React from 'react';
import { ConversionFunnelDefinition, UserSegment, ConversionCohort } from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

export interface DropoffHeatmapProps {
    funnelDefinition: ConversionFunnelDefinition;
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    timeRange: {
        start: number;
        end: number;
    };
    segments?: UserSegment[];
    cohorts?: ConversionCohort[];
    heatmapMode?: HeatmapMode;
    showRecoveryAnalysis?: boolean;
    realTimeUpdates?: boolean;
    onDropoffPointClick?: (analysis: DropoffPointAnalysis) => void;
    onExport?: (data: DropoffExportData) => void;

export type HeatmapMode = 'absolute' | 'relative' | 'severity' | 'opportunity' | 'temporal';

export interface DropoffAnalysisData {
    stepAnalysis: StepDropoffAnalysis[];
    transitionAnalysis: TransitionDropoffAnalysis[];
    temporalPatterns: TemporalDropoffPattern[];
    segmentAnalysis: SegmentDropoffAnalysis[];
    rootCauseAnalysis: RootCauseAnalysis[];
    recoveryOpportunities: RecoveryOpportunity[];
    overallInsights: DropoffInsight[];

export interface StepDropoffAnalysis {
    stepId: string;
    stepName: string;
    stepOrder: number;
    totalEntries: number;
    dropOffCount: number;
    dropOffRate: number;
    dropOffSeverity: 'critical' | 'high' | 'medium' | 'low';
    benchmarkComparison: BenchmarkComparison;
    userBehaviorAnalysis: UserBehaviorAnalysis;
    technicalAnalysis: TechnicalAnalysis;
    contentAnalysis: ContentAnalysis;
    recoveryPotential: number;

export interface TransitionDropoffAnalysis {
    fromStepId: string;
    toStepId: string;
    fromStepName: string;
    toStepName: string;
    transitionRate: number;
    dropOffCount: number;
    dropOffRate: number;
    averageTransitionTime: number;
    commonDropOffReasons: DropoffReason[];
    recoveryActions: string[];

export interface TemporalDropoffPattern {
    period: 'hour' | 'day' | 'week' | 'month';
    periodValue: number;
    dropOffRates: Array<{,
        stepId: string;
        stepName: string;
        dropOffRate: number;
        trend: 'increasing' | 'decreasing' | 'stable'
  }>;
    insights: string[];

export interface SegmentDropoffAnalysis {
    segmentId: string;
    segmentName: string;
    overallDropOffRate: number;
    stepDropOffRates: Array<{,
        stepId: string;
        stepName: string;
        dropOffRate: number;
        relativePerformance: number;
    }>;
    uniqueDropOffReasons: DropoffReason[];
    segmentInsights: string[];

export interface RootCauseAnalysis {
    stepId: string;
    stepName: string;
    primaryCauses: DropoffCause[];
    contributingFactors: ContributingFactor[];
    confidence: number;
    evidenceQuality: 'high' | 'medium' | 'low';
    recommendations: CauseRecommendation[];

export interface DropoffCause {
    category: 'technical' | 'user_experience' | 'content' | 'external' | 'design';
    subcategory: string;
    description: string;
    impact: number;
    confidence: number;
    evidence: Evidence[];
    mitigationComplexity: 'low' | 'medium' | 'high';
    expectedImprovement: number;

export interface ContributingFactor {
    factor: string;
    weight: number;
    description: string;
    measurable: boolean;
    currentValue?: number;
    targetValue?: number;

export interface Evidence {
    type: 'user_feedback' | 'analytics' | 'technical_logs' | 'usability_testing';
    description: string;
    strength: 'strong' | 'moderate' | 'weak';
    source: string;
    timestamp: number;

export interface CauseRecommendation {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    expectedImpact: number;
    implementationSteps: string[];
    successMetrics: string[];

export interface RecoveryOpportunity {
    stepId: string;
    stepName: string;
    recoveryPotential: number;
    recoveryValue: number;
    quickWins: QuickWin[];
    strategicInitiatives: StrategicInitiative[];
    timeToImpact: number;
    confidenceLevel: number;

export interface QuickWin {
    title: string;
    description: string;
    effort: 'low' | 'medium';
    expectedImpact: number;
    implementationTime: number;
    requirements: string[];

export interface StrategicInitiative {
    title: string;
    description: string;
    effort: 'medium' | 'high';
    expectedImpact: number;
    implementationTime: number;
    dependencies: string[];
    successMetrics: string[];

export interface DropoffReason {
    reason: string;
    category: string;
    percentage: number;
    count: number;
    confidence: number;
    severity: 'critical' | 'high' | 'medium' | 'low';

export interface BenchmarkComparison {
    industryAverage: number;
    topPerformers: number;
    yourPerformance: number;
    percentile: number;
    improvementPotential: number;

export interface UserBehaviorAnalysis {
    averageTimeOnStep: number;
    interactionPatterns: InteractionPattern[];
    exitBehaviors: ExitBehavior[];
    recoveryAttempts: number;

export interface InteractionPattern {
    pattern: string;
    frequency: number;
    conversionImpact: number;
    description: string;

export interface ExitBehavior {
    behavior: string;
    percentage: number;
    description: string;
    preventable: boolean;

export interface TechnicalAnalysis {
    pageLoadTime: number;
    errorRate: number;
    performanceScore: number;
    accessibilityIssues: AccessibilityIssue[];
    mobileCompatibility: number;

export interface AccessibilityIssue {
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    impact: string;
    fixComplexity: 'low' | 'medium' | 'high';

export interface ContentAnalysis {
    clarityScore: number;
    complexityScore: number;
    engagementScore: number;
    completionRate: number;
    commonConfusionPoints: string[];
    improvementSuggestions: string[];

export interface DropoffInsight {
    type: 'pattern' | 'anomaly' | 'opportunity' | 'risk';
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    affectedSteps: string[];
    impact: number;
    confidence: number;
    recommendations: string[];
    timeframe: string;

export interface DropoffPointAnalysis {
    stepId: string;
    analysis: StepDropoffAnalysis;
    rootCause: RootCauseAnalysis;
    recovery: RecoveryOpportunity;

export interface DropoffExportData {
    heatmapMode: HeatmapMode;
    data: DropoffAnalysisData;
    visualizations: {
        heatmap: string;
        flowDiagram: string;
        trends: string;
    };
    recommendations: {
        quick: QuickWin[];
        strategic: StrategicInitiative[];
    };
    metadata: {
        exportedAt: number;
        timeRange: {
            start: number;
            end: number;
        };
        analysisDepth: 'basic' | 'detailed' | 'comprehensive'
  };
/**
 * Main Drop-off Heatmap Component
 */
export declare const DropoffHeatmap: React.FC<DropoffHeatmapProps>;
export default DropoffHeatmap;
//# sourceMappingURL=DropoffHeatmap.d.ts.map
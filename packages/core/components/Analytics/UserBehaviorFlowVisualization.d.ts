/**
 * User Behavior Flow Visualization and Analysis Tools - Story 30.2 Task 10
 *
 * Interactive visualization system for analyzing user behavior flows, navigation patterns,
 * and conversion pathways through the marketplace and application interfaces.
 */
import React from 'react';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';
export interface UserBehaviorFlowVisualizationProps {
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    flowConfig: FlowVisualizationConfig;
    behaviorData: BehaviorFlowData[];
    onFlowAnalysis?: (analysis: FlowAnalysis) => void;
    onPathwayOptimization?: (optimization: PathwayOptimization) => void;
    onExport?: (data: FlowVisualizationExportData) => void;
}
export interface FlowVisualizationConfig {
    visualizationType: VisualizationType;
    timeRange: {,
        start: number;
        end: number;
    };
    segmentFilters: SegmentFilter[];
    pathwayAnalysis: PathwayAnalysisSettings;
    interactionFilters: InteractionFilter[];
    performanceSettings: VisualizationPerformanceSettings;
}
export type VisualizationType = 'sankey' | 'node_link' | 'flow_map' | 'journey_map' | 'heatmap';
export interface BehaviorFlowData {
    userId: string;
    sessionId: string;
    flowPath: FlowStep[];
    metadata: FlowMetadata;
    outcomes: FlowOutcome[];
}
export interface FlowStep {
    stepId: string;
    page: string;
    action: string;
    timestamp: number;
    duration: number;
    context: StepContext;
}
export interface FlowAnalysis {
    popularPaths: PopularPath[];
    dropoffPoints: DropoffPoint[];
    conversionPaths: ConversionPath[];
    optimizationOpportunities: OptimizationOpportunity[];
}
export declare const UserBehaviorFlowVisualization: React.FC<UserBehaviorFlowVisualizationProps>;
export interface SegmentFilter {
    segment: string;
    enabled: boolean;
}
export interface PathwayAnalysisSettings {
    minPathLength: number;
    maxPathLength: number;
    includeLoops: boolean;
}
export interface InteractionFilter {
    actionType: string;
    enabled: boolean;
}
export interface VisualizationPerformanceSettings {
    maxNodes: number;
    aggregationLevel: 'high' | 'medium' | 'low';
    renderingMode: 'fast' | 'detailed';
}
export interface FlowMetadata {
    totalDuration: number;
    deviceType: string;
    userType: string;
}
export interface FlowOutcome {
    type: string;
    value: number;
    timestamp: number;
}
export interface StepContext {
    device: string;
    referrer?: string;
    exitType: string;
}
export interface PopularPath {
    path: string;
    count: number;
    percentage: number;
    avgDuration: number;
    conversionRate: number;
}
export interface DropoffPoint {
    page: string;
    entries: number;
    exits: number;
    dropoffRate: number;
    impactScore: number;
}
export interface ConversionPath {
    path: string;
    conversionRate: number;
    value: number;
}
export interface OptimizationOpportunity {
    type: string;
    description: string;
    impact: number;
    effort: string;
}
export interface PathwayOptimization {
    recommendations: OptimizationRecommendation[];
    projectedImpact: ProjectedImpact;
}
export interface OptimizationRecommendation {
    action: string;
    rationale: string;
    priority: string;
}
export interface ProjectedImpact {
    conversionIncrease: number;
    engagementIncrease: number;
    dropoffReduction: number;
}
export interface FlowVisualizationExportData {
    flowData: BehaviorFlowData[];
    analysis: FlowAnalysis | null;
    visualizationConfig: FlowVisualizationConfig;
    metadata: {,
        exportTimestamp: number;
        totalFlows: number;
        timeRange: {,
            start: number;
            end: number;
        };
        version: string;
    };
}
export default UserBehaviorFlowVisualization;
//# sourceMappingURL=UserBehaviorFlowVisualization.d.ts.map
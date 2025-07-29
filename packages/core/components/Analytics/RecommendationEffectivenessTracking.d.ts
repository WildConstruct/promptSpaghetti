/**
 * Recommendation System Effectiveness Tracking - Story 30.2 Task 11
 *
 * Comprehensive tracking and analysis system for measuring recommendation system
 * performance, effectiveness, and business impact across multiple algorithms and contexts.
 */
import React from 'react';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

export interface RecommendationEffectivenessTrackingProps {
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    trackingConfig: EffectivenessTrackingConfig;
    onEffectivenessAlert?: (alert: EffectivenessAlert) => void;
    onPerformanceInsight?: (insight: PerformanceInsight) => void;
    onExport?: (data: EffectivenessTrackingExportData) => void;

export interface EffectivenessTrackingConfig {
    algorithms: TrackedAlgorithm[];
    metrics: EffectivenessMetric[];
    benchmarks: PerformanceBenchmark[];
    reporting: ReportingConfig;
    alerting: AlertingConfig;

export interface RecommendationSystemMetrics {
    algorithmId: string;
    algorithmName: string;
    version: string;
    timestamp: number;
    metrics: MetricValue[];
    contextualMetrics: ContextualMetric[];
    businessImpact: BusinessImpactMetrics;
    userSegmentPerformance: SegmentPerformance[];

export interface MetricValue {
    metricId: string;
    name: string;
    value: number;
    benchmark: number;
    variance: number;
    trend: TrendData;
    confidence: number;

export interface ContextualMetric {
    context: RecommendationContext;
    metrics: MetricValue[];
    sampleSize: number;
    significance: number;

export interface RecommendationContext {
    deviceType: 'desktop' | 'mobile' | 'tablet';
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    userType: 'new' | 'returning' | 'premium';
    contentCategory: string;
    sessionType: 'browsing' | 'searching' | 'purchasing';

export interface BusinessImpactMetrics {
    revenueImpact: number;
    conversionLift: number;
    engagementIncrease: number;
    retentionImprovement: number;
    costEfficiency: number;
    customerSatisfaction: number;

export declare const RecommendationEffectivenessTracking: React.FC<RecommendationEffectivenessTrackingProps>;

export interface TrackedAlgorithm {
    algorithmId: string;
    name: string;
    version: string;
    enabled: boolean;

export interface EffectivenessMetric {
    metricId: string;
    name: string;
    type: 'accuracy' | 'business' | 'user_experience';
    weight: number;
    target: number;

export interface PerformanceBenchmark {
    metricId: string;
    benchmark: number;
    source: 'internal' | 'industry' | 'target';

export interface ReportingConfig {
    frequency: 'hourly' | 'daily' | 'weekly';
    recipients: string[];
    includeInsights: boolean;

export interface AlertingConfig {
    enabled: boolean;
    thresholds: AlertThreshold[];
    channels: string[];

export interface AlertThreshold {
    metricId: string;
    condition: 'above' | 'below' | 'change';
    value: number;
    severity: 'low' | 'medium' | 'high';

export interface TrendData {
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number;
    duration: number;

export interface SegmentPerformance {
    segment: string;
    metrics: MetricValue[];
    sampleSize: number;

export interface EffectivenessAlert {
    alertId: string;
    algorithmId: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    metrics: string[];
    threshold: number;
    actualValue: number;
    timestamp: number;
    actionRequired: boolean;

export interface PerformanceInsight {
    insightId: string;
    type: string;
    message: string;
    algorithms: string[];
    impact: 'low' | 'medium' | 'high';
    confidence: number;
    recommendations: string[];

export interface EffectivenessTrackingExportData {
    algorithmMetrics: RecommendationSystemMetrics[];
    timeRange: {
        start: number;
        end: number;
    };
    summary: {
        totalAlgorithms: number;
        bestPerforming: string;
        averageCTR: number;
        totalRevenueImpact: number;
    };
    exportTimestamp: number;

export default RecommendationEffectivenessTracking;
//# sourceMappingURL=RecommendationEffectivenessTracking.d.ts.map
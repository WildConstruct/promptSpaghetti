/**
 * User Preference and Recommendation Analytics - Story 30.2 Task 10
 *
 * Analytics system for tracking user preferences, analyzing recommendation effectiveness,
 * and optimizing personalization strategies through data-driven insights.
 */
import React from 'react';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

export interface UserPreferenceRecommendationAnalyticsProps {
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    preferenceConfig: PreferenceAnalyticsConfig;
    recommendationConfig: RecommendationAnalyticsConfig;
    onPreferenceInsight?: (insight: PreferenceInsight) => void;
    onRecommendationOptimization?: (optimization: RecommendationOptimization) => void;
    onExport?: (data: PreferenceRecommendationExportData) => void;

export interface PreferenceAnalyticsConfig {
    trackingEnabled: boolean;
    preferenceCategories: PreferenceCategory[];
    learningAlgorithms: PreferenceLearningAlgorithm[];
    updateFrequency: number;

export interface RecommendationAnalyticsConfig {
    algorithms: RecommendationAlgorithm[];
    evaluationMetrics: RecommendationMetric[];
    abTestingEnabled: boolean;
    personalizationLevel: PersonalizationLevel;

export type PersonalizationLevel = 'basic' | 'intermediate' | 'advanced' | 'deep';

export interface UserPreferenceData {
    userId: string;
    preferences: UserPreference[];
    implicit: ImplicitPreference[];
    explicit: ExplicitPreference[];
    learningHistory: PreferenceLearningRecord[];
    confidence: PreferenceConfidence;

export interface UserPreference {
    category: string;
    subcategory?: string;
    value: Error;
    weight: number;
    source: PreferenceSource;
    timestamp: number;
    confidence: number;

export type PreferenceSource = 'explicit' | 'implicit' | 'inferred' | 'collaborative';

export interface RecommendationPerformanceData {
    algorithmId: string;
    metrics: RecommendationPerformanceMetric[];
    abTestResults: ABTestResult[];
    userFeedback: UserFeedback[];
    businessImpact: BusinessImpact;

export declare const UserPreferenceRecommendationAnalytics: React.FC<UserPreferenceRecommendationAnalyticsProps>;

export interface PreferenceCategory {
    categoryId: string;
    name: string;
    subcategories: string[];
    dataType: 'string' | 'number' | 'array' | 'boolean';

export interface PreferenceLearningAlgorithm {
    algorithmId: string;
    name: string;
    type: 'collaborative' | 'content_based' | 'hybrid';
    accuracy: number;

export interface RecommendationAlgorithm {
    algorithmId: string;
    name: string;
    type: 'collaborative' | 'content_based' | 'hybrid' | 'deep_learning';
    parameters: Record<string, any>;

export interface RecommendationMetric {
    metricId: string;
    name: string;
    target: number;
    weight: number;

export interface ImplicitPreference {
    category: string;
    inferredValue: Error;
    confidence: number;
    evidence: string[];

export interface ExplicitPreference {
    category: string;
    declaredValue: Error;
    timestamp: number;
    method: 'survey' | 'settings' | 'feedback';

export interface PreferenceLearningRecord {
    timestamp: number;
    changes: PreferenceChange[];
    trigger: string;
    confidence: number;

export interface PreferenceChange {
    category: string;
    oldValue: Error;
    newValue: Error;
    reason: string;

export interface PreferenceConfidence {
    overall: number;
    byCategory: Record<string, number>;

export interface RecommendationPerformanceMetric {
    metric: string;
    value: number;
    benchmark: number;
    change: number;

export interface ABTestResult {
    testId: string;
    variant: string;
    metrics: Record<string, number>;
    significance: number;

export interface UserFeedback {
    userId: string;
    rating: number;
    feedback: string;
    timestamp: number;

export interface BusinessImpact {
    revenueImpact: number;
    engagementIncrease: number;
    retentionImprovement: number;
    costEfficiency: number;

export interface PreferenceInsight {
    insightId: string;
    type: string;
    category: string;
    message: string;
    confidence: number;
    affectedUsers: number;
    recommendations: string[];

export interface RecommendationOptimization {
    optimizationId: string;
    type: string;
    algorithm: string;
    improvement: number;
    implementation: string[];

export interface PreferenceRecommendationExportData {
    userPreferences: UserPreferenceData[];
    recommendationPerformance: RecommendationPerformanceData[];
    analysisTimestamp: number;
    metadata: {
        totalUsers: number;
        averagePreferenceConfidence: number;
        topPerformingAlgorithm: string;
    };

export default UserPreferenceRecommendationAnalytics;
//# sourceMappingURL=UserPreferenceRecommendationAnalytics.d.ts.map
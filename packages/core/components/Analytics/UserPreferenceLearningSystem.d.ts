/**
 * User Preference Learning and Modeling Systems - Story 30.2 Task 11
 *
 * Advanced ML-based system for learning user preferences, building predictive models,
 * and continuously adapting personalization strategies based on user behavior patterns.
 */
import React from 'react';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';
export interface UserPreferenceLearningSystemProps {
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    learningConfig: PreferenceLearningConfig;
    modelingConfig: PreferenceModelingConfig;
    onModelUpdate?: (model: PreferenceModel) => void;
    onLearningInsight?: (insight: LearningInsight) => void;
    onExport?: (data: PreferenceLearningExportData) => void;
}
export interface PreferenceLearningConfig {
    algorithms: LearningAlgorithm[];
    dataCollection: DataCollectionSettings;
    realTimeUpdates: boolean;
    privacySettings: PrivacySettings;
    modelValidation: ValidationSettings;
}
export interface PreferenceModelingConfig {
    modelTypes: ModelType[];
    features: ModelFeature[];
    training: TrainingSettings;
    deployment: ModelDeploymentSettings;
    monitoring: ModelMonitoringSettings;
}
export interface UserPreferenceProfile {
    userId: string;
    preferenceVector: PreferenceVector;
    learningHistory: LearningEvent[];
    modelPredictions: ModelPrediction[];
    confidenceMetrics: ConfidenceMetrics;
    lastUpdated: number;
}
export interface PreferenceVector {
    dimensions: PreferenceDimension[];
    embeddings: number[];
    weights: number[];
    uncertainty: number[];
}
export interface PreferenceDimension {
    dimension: string;
    value: number;
    confidence: number;
    evidence: Evidence[];
    temporal: TemporalPattern;
}
export interface LearningEvent {
    eventId: string;
    timestamp: number;
    type: LearningEventType;
    data: Record<string, unknown>;
    impact: LearningImpact;
    modelVersion: string;
}
export type LearningEventType = 'explicit_feedback' | 'implicit_signal' | 'behavior_pattern' | 'contextual_cue' | 'social_signal';
export interface PreferenceModel {
    modelId: string;
    version: string;
    type: ModelType;
    architecture: ModelArchitecture;
    performance: ModelPerformance;
    features: ModelFeature[];
    training: TrainingMetadata;
}
export type ModelType = 'collaborative_filtering' | 'content_based' | 'deep_learning' | 'hybrid' | 'reinforcement_learning';
export declare const UserPreferenceLearningSystem: React.FC<UserPreferenceLearningSystemProps>;
export interface LearningAlgorithm {
    algorithmId: string;
    name: string;
    type: 'supervised' | 'unsupervised' | 'reinforcement';
    parameters: Record<string, any>;
}
export interface DataCollectionSettings {
    sources: string[];
    frequency: number;
    batchSize: number;
    qualityThreshold: number;
}
export interface PrivacySettings {
    anonymization: boolean;
    consentRequired: boolean;
    dataRetention: number;
    rightToForgotten: boolean;
}
export interface ValidationSettings {
    crossValidation: boolean;
    testSplit: number;
    validationMetrics: string[];
    minimumAccuracy: number;
}
export interface ModelFeature {
    featureId: string;
    name: string;
    type: 'numerical' | 'categorical' | 'embedding';
    importance: number;
}
export interface TrainingSettings {
    batchSize: number;
    epochs: number;
    learningRate: number;
    optimizer: string;
    regularization: number;
}
export interface ModelDeploymentSettings {
    environment: 'staging' | 'production';
    rolloutStrategy: 'blue_green' | 'canary' | 'rolling';
    monitoringEnabled: boolean;
}
export interface ModelMonitoringSettings {
    metrics: string[];
    alertThresholds: Record<string, number>;
    reportingFrequency: number;
}
export interface Evidence {
    type: string;
    value: Error;
    timestamp: number;
    weight: number;
}
export interface TemporalPattern {
    trend: 'increasing' | 'decreasing' | 'stable';
    seasonality: boolean;
    changePoints: number[];
}
export interface LearningImpact {
    magnitude: number;
    direction: 'positive' | 'negative';
    confidence: number;
    duration: number;
}
export interface ModelArchitecture {
    layers: number;
    parameters: number;
    inputDimensions: number;
    outputDimensions: number;
}
export interface ModelPerformance {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    ndcg: number;
    auc: number;
}
export interface TrainingMetadata {
    trainingTime: number;
    datasetSize: number;
    epochs: number;
    convergence: boolean;
    lastTrained: number;
}
export interface ModelPrediction {
    predictionId: string;
    timestamp: number;
    prediction: unknown;
    confidence: number;
    actual?: unknown;
}
export interface ConfidenceMetrics {
    overall: number;
    byDimension: Record<string, number>;
    temporal: number;
}
export interface LearningInsight {
    insightId: string;
    type: string;
    message: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    recommendations: string[];
}
export interface PreferenceLearningExportData {
    userProfiles: UserPreferenceProfile[];
    models: PreferenceModel[];
    learningMetrics: {,
        totalUsers: number;
        averageConfidence: number;
        bestModel: PreferenceModel;
        learningRate: number;
    };
    exportTimestamp: number;
}
export default UserPreferenceLearningSystem;
//# sourceMappingURL=UserPreferenceLearningSystem.d.ts.map
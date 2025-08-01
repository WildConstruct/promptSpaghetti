/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * User Session Recording and Analysis - Story 30.2 Task 9
 *
 * Comprehensive system for recording and analyzing user sessions to understand
 * behavior patterns, track user journeys, and identify optimization opportunities.
 *
 * Features:
 * - Real-time session recording and playback
 * - User interaction tracking and analysis
 * - Page flow and navigation pattern analysis
 * - Session replay with timeline controls
 * - Heat map generation for user interactions
 * - Privacy-compliant recording with consent management
 * - Session analytics and performance metrics
 * - Automated pattern recognition and insights
 */
import React from 'react';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

}
}
export interface UserSessionRecordingProps { sessionConfig: SessionRecordingConfig;
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    privacySettings: SessionPrivacySettings;
    replayEnabled?: boolean;
    analyticsEnabled?: boolean;
    onSessionAnalyzed?: (analysis: SessionAnalysis) => void;
    onPatternDetected?: (pattern: BehaviorPattern) => void;
    onExport?: (data: SessionRecordingExportData) => void }
}
}
export interface SessionRecordingConfig { enabledFeatures: SessionFeature[];
    recordingSettings: RecordingSettings;
    analysisSettings: AnalysisSettings;
    storageSettings: StorageSettings;
    replaySettings: ReplaySettings;
    privacySettings: SessionPrivacySettings;
    performanceSettings: PerformanceSettings;

export type SessionFeature = 'mouse_tracking' | 'click_recording' | 'scroll_tracking' | 'form_interactions' | 'page_transitions' | 'keyboard_input' | 'viewport_changes' | 'network_requests' | 'console_logs' | 'error_tracking' }
}
}
export interface RecordingSettings { maxSessionDuration: number;
    samplingRate: number;
    captureInterval: number;
    bufferSize: number;
    compressionEnabled: boolean;
    maskSensitiveData: boolean;
    captureThreshold: CaptureThreshold }
}
}
export interface CaptureThreshold { minInteractionGap: number;
    maxIdleTime: number;
    minSessionLength: number;
    qualityThreshold: number }
}
}
export interface AnalysisSettings { enableRealTimeAnalysis: boolean;
    patternRecognition: PatternRecognitionSettings;
    heatmapGeneration: HeatmapSettings;
    anomalyDetection: AnomalyDetectionSettings;
    performanceAnalysis: PerformanceAnalysisSettings }
}
}
export interface PatternRecognitionSettings { enableMousePatterns: boolean;
    enableNavigationPatterns: boolean;
    enableInteractionPatterns: boolean;
    enableTemporalPatterns: boolean;
    confidenceThreshold: number;
    patternCategories: PatternCategory[];

export type PatternCategory = 'navigation' | 'engagement' | 'abandonment' | 'conversion' | 'confusion' | 'efficiency' | 'exploration' | 'decision_making' }
}
}
export interface HeatmapSettings { enableClickHeatmaps: boolean;
    enableScrollHeatmaps: boolean;
    enableHoverHeatmaps: boolean;
    enableAttentionHeatmaps: boolean;
    resolution: HeatmapResolution;
    aggregationPeriod: number;

export type HeatmapResolution = 'low' | 'medium' | 'high' | 'ultra' }
}
}
export interface AnomalyDetectionSettings { enableBehaviorAnomalies: boolean;
    enablePerformanceAnomalies: boolean;
    enableNavigationAnomalies: boolean;
    sensitivityLevel: 'low' | 'medium' | 'high';
    alertThresholds: AnomalyThreshold[] }
}
}
export interface AnomalyThreshold { metric: string;
    threshold: number;
    timeWindow: number;
    severity: 'low' | 'medium' | 'high' | 'critical' }
}
}
export interface PerformanceAnalysisSettings { trackPageLoadTimes: boolean;
    trackInteractionLatency: boolean;
    trackRenderPerformance: boolean;
    trackMemoryUsage: boolean;
    performanceThresholds: PerformanceThreshold[] }
}
}
export interface PerformanceThreshold { metric: 'load_time' | 'interaction_delay' | 'render_time' | 'memory_usage';
    warningThreshold: number;
    criticalThreshold: number }
}
}
export interface StorageSettings { retentionPeriod: number;
    compressionLevel: 'none' | 'low' | 'medium' | 'high';
    encryptionEnabled: boolean;
    localStorageEnabled: boolean;
    cloudStorageEnabled: boolean;
    storageQuota: StorageQuota }
}
}
export interface StorageQuota { maxSessionSize: number;
    maxTotalSize: number;
    cleanupPolicy: 'oldest_first' | 'largest_first' | 'least_accessed' }
}
}
export interface ReplaySettings { enableSessionReplay: boolean;
    replaySpeed: number;
    skipInactivity: boolean;
    maxInactivitySkip: number;
    replayQuality: 'low' | 'medium' | 'high';
    enableControls: boolean }
}
}
export interface SessionPrivacySettings { consentRequired: boolean;
    maskPersonalData: boolean;
    maskFormInputs: boolean;
    maskPasswords: boolean;
    maskCreditCards: boolean;
    excludedSelectors: string[];
    dataRetentionDays: number;
    anonymizeUserData: boolean;
    gdprCompliant: boolean }
}
}
export interface PerformanceSettings { maxCpuUsage: number;
    maxMemoryUsage: number;
    throttleOnSlowDevice: boolean;
    batchProcessing: boolean;
    workerThreads: boolean }
}
}
export interface UserSession { sessionId: string;
    userId?: string;
    deviceId: string;
    startTime: number;
    endTime?: number;
    duration: number;
    pageViews: SessionPageView[];
    interactions: SessionInteraction[];
    navigationFlow: NavigationEvent[];
    performance: SessionPerformance;
    metadata: SessionMetadata;
    analysis?: SessionAnalysis }
}
}
export interface SessionPageView { pageId: string;
    url: string;
    title: string;
    timestamp: number;
    loadTime: number;
    timeOnPage: number;
    scrollDepth: number;
    interactions: number;
    exitType: 'navigation' | 'close' | 'refresh' | 'timeout' }
}
}
export interface SessionInteraction { interactionId: string;
    type: InteractionType;
    element: InteractionElement;
    timestamp: number;
    coordinates?: {
        x: number;
        y: number }
}
    };
    value?: string;
    context: InteractionContext;

export type InteractionType = 'click' | 'double_click' | 'right_click' | 'hover' | 'scroll' | 'keypress' | 'form_input' | 'form_submit' | 'drag' | 'resize' | 'focus' | 'blur';

}
}
export interface InteractionElement { tagName: string;
    id?: string;
    className?: string;
    text?: string;
    xpath: string;
    selector: string;
    attributes: Record<string, string> }
}
}
export interface InteractionContext { pageUrl: string;
    viewportSize: {
        width: number;
        height: number }
}
    };
    scrollPosition: { x: number;
        y: number };
    timestamp: number;
    userAgent: string;

}
}
export interface NavigationEvent { eventId: string;
    type: NavigationType;
    fromUrl: string;
    toUrl: string;
    timestamp: number;
    loadTime: number;
    method: 'link' | 'button' | 'form' | 'direct' | 'back' | 'forward';

export type NavigationType = 'page_load' | 'navigation' | 'redirect' | 'back' | 'forward' | 'refresh' }
}
}
export interface SessionPerformance { totalLoadTime: number;
    averageResponseTime: number;
    slowestPage: string;
    fastestPage: string;
    memoryUsage: MemoryUsage;
    networkRequests: NetworkRequest[];
    errors: SessionError[] }
}
}
export interface MemoryUsage { peak: number;
    average: number;
    finalUsage: number;
    gcEvents: number }
}
}
export interface NetworkRequest { url: string;
    method: string;
    status: number;
    duration: number;
    size: number;
    timestamp: number }
}
}
export interface SessionError { type: 'javascript' | 'network' | 'console' | 'crash';
    message: string;
    stack?: string;
    timestamp: number;
    url: string;
    line?: number;
    column?: number }
}
}
export interface SessionMetadata { userAgent: string;
    platform: string;
    screenResolution: {
        width: number;
        height: number }
}
    };
    viewportSize: { width: number;
        height: number };
    timezone: string;
    language: string;
    referrer?: string;
    sessionSource: string;
    deviceType: 'desktop' | 'tablet' | 'mobile';
    browserVersion: string;

}
}
export interface SessionAnalysis { sessionId: string;
    analysisTimestamp: number;
    overallScore: SessionScore;
    behaviorPatterns: BehaviorPattern[];
    navigationAnalysis: NavigationAnalysis;
    engagementMetrics: EngagementMetrics;
    conversionIndicators: ConversionIndicator[];
    anomalies: SessionAnomaly[];
    recommendations: SessionRecommendation[];
    heatmapData: HeatmapData }
}
}
export interface SessionScore { overall: number;
    engagement: number;
    navigation: number;
    conversion: number;
    performance: number;
    quality: number }
}
}
export interface BehaviorPattern { patternId: string;
    type: PatternCategory;
    confidence: number;
    description: string;
    frequency: number;
    duration: number;
    significance: 'low' | 'medium' | 'high';
    examples: PatternExample[];
    insights: string[] }
}
}
export interface PatternExample { sessionId: string;
    timestamp: number;
    description: string;
    context: string }
}
}
export interface NavigationAnalysis { totalPages: number;
    uniquePages: number;
    averageTimePerPage: number;
    bounceRate: number;
    exitPages: PageExit[];
    navigationFlow: FlowPath[];
    backtrackingRate: number;
    directNavigationRate: number }
}
}
export interface PageExit { url: string;
    exitRate: number;
    averageTimeOnPage: number;
    exitType: 'navigation' | 'close' | 'timeout' }
}
}
export interface FlowPath { fromPage: string;
    toPage: string;
    frequency: number;
    averageTime: number;
    conversionRate?: number }
}
}
export interface EngagementMetrics { totalInteractions: number;
    interactionRate: number;
    scrollDepthAverage: number;
    activeTime: number;
    passiveTime: number;
    engagementScore: number;
    attentionSpan: number;
    focusedTime: number }
}
}
export interface ConversionIndicator { indicatorType: 'positive' | 'negative' | 'neutral';
    strength: number;
    description: string;
    relatedActions: string[];
    timestamp: number }
}
}
export interface SessionAnomaly { anomalyId: string;
    type: 'behavior' | 'performance' | 'navigation' | 'technical';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    timestamp: number;
    context: string;
    impact: AnomalyImpact }
}
}
export interface AnomalyImpact { userExperience: 'positive' | 'negative' | 'neutral';
    performance: 'improved' | 'degraded' | 'unchanged';
    conversion: 'helpful' | 'harmful' | 'neutral' }
}
}
export interface SessionRecommendation { recommendationId: string;
    type: RecommendationType;
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    implementation: ImplementationGuide;
    expectedImpact: ImpactEstimate;

export type RecommendationType = 'ui_improvement' | 'performance_optimization' | 'navigation_enhancement' | 'content_optimization' | 'technical_fix' | 'user_experience' }
}
}
export interface ImplementationGuide { steps: string[];
    complexity: 'low' | 'medium' | 'high';
    estimatedEffort: string;
    requiredSkills: string[] }
}
}
export interface ImpactEstimate { conversionImprovement: number;
    engagementImprovement: number;
    performanceImprovement: number;
    confidenceLevel: number }
}
}
export interface HeatmapData { clickHeatmap: HeatmapPoint[];
    scrollHeatmap: ScrollHeatmapData[];
    hoverHeatmap: HeatmapPoint[];
    attentionHeatmap: AttentionHeatmapData[] }
}
}
export interface HeatmapPoint { x: number;
    y: number;
    intensity: number;
    count: number }
}
}
export interface ScrollHeatmapData { depth: number;
    frequency: number;
    averageTime: number }
}
}
export interface AttentionHeatmapData { element: string;
    selector: string;
    attentionTime: number;
    viewCount: number;
    interactionRate: number }
}
}
export interface SessionRecordingExportData { sessions: UserSession[];
    analysis: SessionAnalysis[];
    patterns: BehaviorPattern[];
    heatmaps: HeatmapData[];
    recommendations: SessionRecommendation[];
    metadata: {
        exportTimestamp: number;
        totalSessions: number;
        dateRange: {
            start: number;
            end: number }
}
        };
        analysisVersion: string;
    };

export declare const UserSessionRecording: React.FC<UserSessionRecordingProps>;
export default UserSessionRecording;
//# sourceMappingURL=UserSessionRecording.d.ts.map
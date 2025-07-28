/**
 * Epic 16 Share Tracking Manager - E16-1753114247031-54ED13
 *
 * Comprehensive share tracking and analytics system for monitoring template
 * distribution, engagement metrics, and conversion analytics across all platforms.
 */
import React from 'react';
import { ShareRecord } from './SocialPlatformIntegration';
import { Template } from './TemplatePreviewModal';

export interface ShareTrackingManagerProps {
    templateId: string;
    template?: Template;
    shares?: ShareRecord[];
    onShareUpdate?: (share: ShareRecord) => void;
    onAnalyticsRefresh?: () => void;
    className?: string;
    realTimeUpdates?: boolean;
    showAdvancedMetrics?: boolean;

export interface ShareTrackingData {
    totalShares: number;
    platformBreakdown: Record<string, PlatformShareData>;
    timeSeriesData: TimeSeriesPoint[];
    conversionFunnel: ConversionFunnelData;
    demographicInsights: DemographicAnalysis;
    performanceMetrics: AggregatedMetrics;
    alerts: ShareAlert[];
    recommendations: ShareRecommendation[];

export interface PlatformShareData {
    platform: string;
    totalShares: number;
    successRate: number;
    averageEngagement: number;
    revenueGenerated: number;
    topPerformingContent: string;
    trends: TrendData;

export interface TimeSeriesPoint {
    timestamp: Date;
    shares: number;
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    platform?: string;

export interface ConversionFunnelData {
    awareness: FunnelStage;
    interest: FunnelStage;
    consideration: FunnelStage;
    purchase: FunnelStage;
    advocacy: FunnelStage;

export interface FunnelStage {
    stage: string;
    count: number;
    percentage: number;
    dropOffRate: number;
    averageTime: number;

export interface DemographicAnalysis {
    topAgeGroups: {,
        group: string;
        percentage: number;
        engagement: number;
    }[];
    topLocations: {,
        location: string;
        shares: number;
        revenue: number;
    }[];
    topInterests: {,
        interest: string;
        affinity: number;
        conversion: number;
    }[];
    devicePreferences: {,
        device: string;
        usage: number;
        performance: number;
    }[];

export interface AggregatedMetrics {
    totalReach: number;
    engagementRate: number;
    clickThroughRate: number;
    conversionRate: number;
    viralCoefficient: number;
    customerAcquisitionCost: number;
    lifetimeValue: number;
    returnOnInvestment: number;

export interface TrendData {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    significance: 'high' | 'medium' | 'low';
    period: string;

export interface ShareAlert {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    platform?: string;
    actionRequired: boolean;
    dismissed: boolean;

export interface ShareRecommendation {
    id: string;
    type: 'content' | 'timing' | 'platform' | 'targeting';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    confidence: number;

export interface ShareTrackingFilters {
    dateRange: {,
        start: Date;
        end: Date;
    };
    platforms: string[];
    shareTypes: string[];
    minEngagement: number;
    regions: string[];
    devices: string[];

export declare const ShareTrackingUtils: {
    calculateTrend: (current: number, previous: number) => TrendData;
    aggregateShareData: (shares: ShareRecord[]) => ShareTrackingData;
    formatMetric: (value: number, type: "currency" | "percentage" | "number") => string;
};
export declare const ShareTrackingManager: React.FC<ShareTrackingManagerProps>;
export default ShareTrackingManager;
//# sourceMappingURL=ShareTrackingManager.d.ts.map
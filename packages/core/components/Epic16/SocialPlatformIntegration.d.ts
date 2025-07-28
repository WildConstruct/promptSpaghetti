/**
 * Epic 16 Social Platform Integration - E16-1753114247029-1A29A4
 *
 * Comprehensive social platform integration for template sharing and cross-platform
 * promotion. Integrates with major social platforms and provides unified sharing
 * interface with analytics tracking.
 */
import React from 'react';
import { Template } from './TemplatePreviewModal';

export interface SocialPlatformIntegrationProps {
    template: Template;
    platforms?: SocialPlatform[];
    trackingEnabled?: boolean;
    onShareComplete?: (share: ShareRecord) => void;
    onAnalyticsUpdate?: (analytics: ShareAnalytics) => void;
    className?: string;
    showAnalytics?: boolean;
    customizations?: SocialCustomizations;


export interface SocialPlatform {
    id: string;
    name: string;
    displayName: string;
    icon: React.ComponentType<unknown>;
    color: string;
    description: string;
    enabled: boolean;
    requiresAuth: boolean;
    config: PlatformConfig;
    features: PlatformFeatures;
    limits: PlatformLimits;
    analytics: PlatformAnalytics;


export interface PlatformConfig {
    apiEndpoint?: string;
    clientId?: string;
    redirectUri?: string;
    scopes: string[];
    customFields: Record<string, any>;
    webhookUrl?: string;
    rateLimit: RateLimitConfig;


export interface RateLimitConfig {
    requestsPerMinute: number;
    requestsPerHour: number;
    burstLimit: number;
    retryAfter: number;


export interface PlatformFeatures {
    directPosting: boolean;
    scheduledPosting: boolean;
    mediaUpload: boolean;
    hashtags: boolean;
    mentions: boolean;
    geotagging: boolean;
    crossPosting: boolean;
    analytics: boolean;
    engagement: boolean;


export interface PlatformLimits {
    maxTextLength: number;
    maxImages: number;
    maxVideos: number;
    maxHashtags: number;
    maxMentions: number;
    fileSize: number;
    videoLength: number;


export interface PlatformAnalytics {
    impressions: number;
    engagements: number;
    clicks: number;
    shares: number;
    reach: number;
    lastUpdated: Date;


export interface ShareRecord {
    id: string;
    templateId: string;
    platform: string;
    shareType: ShareType;
    content: ShareContent;
    timestamp: Date;
    userId: string;
    success: boolean;
    analytics: ShareAnalytics;
    metadata: ShareMetadata;

export type ShareType = 'direct' | 'link' | 'embed' | 'download' | 'preview';

export interface ShareContent {
    title: string;
    description: string;
    url: string;
    imageUrl?: string;
    videoUrl?: string;
    hashtags: string[];
    mentions: string[];
    customText?: string;


export interface ShareAnalytics {
    views: number;
    clicks: number;
    engagements: number;
    conversions: number;
    revenue: number;
    demographics: DemographicData;
    performance: PerformanceMetrics;


export interface DemographicData {
    ageGroups: Record<string, number>;
    geoLocations: Record<string, number>;
    interests: Record<string, number>;
    devices: Record<string, number>;


export interface PerformanceMetrics {
    clickThroughRate: number;
    conversionRate: number;
    engagementRate: number;
    viralCoefficient: number;
    timeToConversion: number;


export interface ShareMetadata {
    userAgent?: string;
    referrer?: string;
    location?: string;
    deviceType?: string;
    campaignId?: string;
    source?: string;
    medium?: string;


export interface SocialCustomizations {
    autoHashtags: boolean;
    customBranding: boolean;
    trackingParameters: boolean;
    crossPlatformSync: boolean;
    schedulingEnabled: boolean;
    analyticsIntegration: boolean;

export declare const ShareContentGenerator: {
    generateTitle: (template: Template, platform: string) => string;
    generateDescription: (template: Template, platform: string) => string;
    generateHashtags: (template: Template, platform: string) => string[];
};
export declare const SocialPlatformIntegration: React.FC<SocialPlatformIntegrationProps>;
export default SocialPlatformIntegration;
//# sourceMappingURL=SocialPlatformIntegration.d.ts.map
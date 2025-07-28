/**
 * Epic 16 Referral Detection Service
 * 
 * Comprehensive referral tracking and detection system for the marketplace platform.
 * Tracks user referrals, affiliate links, organic growth, and referral fraud prevention.
 * 
 * Features:
 * - Multi-channel referral tracking (direct links, social media, search, etc.)
 * - Real-time fraud detection and prevention
 * - Advanced attribution modeling with first-touch, last-touch, and multi-touch
 * - Comprehensive analytics and performance metrics
 * - Automated reward calculation and distribution
 * - Deep-link and UTM parameter tracking
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import { z } from 'zod';

// =============================================================================
// Referral Detection Types and Schemas
// =============================================================================

export enum ReferralSource {
  DIRECT_LINK = 'direct_link',
  SOCIAL_MEDIA = 'social_media',
  EMAIL_CAMPAIGN = 'email_campaign',
  SEARCH_ENGINE = 'search_engine',
  AFFILIATE_NETWORK = 'affiliate_network',
  WORD_OF_MOUTH = 'word_of_mouth',
  ORGANIC_DISCOVERY = 'organic_discovery',
  PAID_ADVERTISING = 'paid_advertising',
  INFLUENCER = 'influencer',
  PARTNERSHIP = 'partnership',
  CONTENT_MARKETING = 'content_marketing',
  UNKNOWN = 'unknown'
}

export enum ReferralStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  CREDITED = 'credited',
  REJECTED = 'rejected',
  FRAUDULENT = 'fraudulent',
  EXPIRED = 'expired'
}

export enum FraudRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AttributionModel {
  FIRST_TOUCH = 'first_touch',
  LAST_TOUCH = 'last_touch',
  LINEAR = 'linear',
  TIME_DECAY = 'time_decay',
  POSITION_BASED = 'position_based',
  DATA_DRIVEN = 'data_driven'
}

const ReferralTrackingDataSchema = z.object({
  id: z.string().uuid(),
  referralCode: z.string().min(1).max(50),
  referrerId: z.string().uuid(),
  referredUserId: z.string().uuid().optional(),
  
  // Source and attribution
  source: z.nativeEnum(ReferralSource),
  sourceUrl: z.string().url().optional(),
  landingPage: z.string().url(),
  
  // UTM and tracking parameters
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  utmTerm: z.string().max(100).optional(),
  utmContent: z.string().max(100).optional(),
  
  // Device and session information
  userAgent: z.string().max(500).optional(),
  ipAddress: z.string().ip(),
  deviceFingerprint: z.string().max(100).optional(),
  sessionId: z.string().uuid(),
  
  // Geolocation data
  country: z.string().length(2).optional(),
  region: z.string().max(50).optional(),
  city: z.string().max(50).optional(),
  timezone: z.string().max(50).optional(),
  
  // Referral lifecycle
  status: z.nativeEnum(ReferralStatus),
  conversionEvent: z.string().max(100).optional(), // signup, purchase, etc.
  conversionValue: z.number().min(0).optional(), // monetary value
  conversionDate: z.date().optional(),
  
  // Fraud detection
  fraudRiskLevel: z.nativeEnum(FraudRiskLevel),
  fraudReasons: z.array(z.string().max(200)).default([]),
  verificationScore: z.number().min(0).max(1),
  
  // Attribution data
  attributionModel: z.nativeEnum(AttributionModel),
  touchpointSequence: z.array(z.object({
    source: z.nativeEnum(ReferralSource),
    timestamp: z.date(),
    weight: z.number().min(0).max(1)
  })).default([]),
  
  // Reward information
  rewardEligible: z.boolean().default(false),
  rewardAmount: z.number().min(0).optional(),
  rewardCurrency: z.string().length(3).default('USD'),
  rewardType: z.enum(['cash', 'credit', 'discount', 'free_template']).optional(),
  
  // Metadata and tracking
  customParameters: z.record(z.string()).default({}),
  tags: z.array(z.string().max(50)).max(20).default([]),
  
  // Timestamps
  firstSeen: z.date(),
  lastSeen: z.date(),
  expiresAt: z.date().optional(),
  verifiedAt: z.date().optional(),
  rewardedAt: z.date().optional()
});

const ReferralCampaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  
  // Campaign configuration
  referrerId: z.string().uuid(),
  campaignCode: z.string().min(1).max(50),
  isActive: z.boolean().default(true),
  
  // Targeting and rules
  targetAudience: z.object({
    countries: z.array(z.string().length(2)).optional(),
    languages: z.array(z.string().length(2)).optional(),
    platforms: z.array(z.string()).optional(),
    demographics: z.record(z.string()).optional()
  }).optional(),
  
  // Reward structure
  rewardStructure: z.object({
    baseReward: z.number().min(0),
    bonusRewards: z.array(z.object({
      condition: z.string().max(200),
      amount: z.number().min(0),
      maxOccurrences: z.number().int().min(0).optional()
    })).default([]),
    tierMultipliers: z.record(z.number().min(0)).default({})
  }),
  
  // Performance limits
  maxReferrals: z.number().int().min(0).optional(),
  dailyLimit: z.number().int().min(0).optional(),
  budgetLimit: z.number().min(0).optional(),
  
  // Attribution settings
  attributionWindow: z.number().int().min(0).default(2592000), // 30 days in seconds
  cookieLifetime: z.number().int().min(0).default(7776000), // 90 days in seconds
  
  // Campaign lifecycle
  startDate: z.date(),
  endDate: z.date().optional(),
  
  // Performance tracking
  stats: z.object({
    totalClicks: z.number().int().min(0).default(0),
    totalConversions: z.number().int().min(0).default(0),
    totalRewardsPaid: z.number().min(0).default(0),
    conversionRate: z.number().min(0).max(100).default(0),
    avgOrderValue: z.number().min(0).default(0),
    roi: z.number().default(0)
  }).default({}),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date()
});

export type ReferralTrackingData = z.infer<typeof ReferralTrackingDataSchema>;
export type ReferralCampaign = z.infer<typeof ReferralCampaignSchema>;

// =============================================================================
// Fraud Detection Configuration
// =============================================================================

}
export interface FraudDetectionConfig {
  enableRealTimeDetection: boolean;
  maxClicksPerIp: number;
  maxClicksPerDevice: number;
  suspiciousVelocityThreshold: number;
  geolocationValidation: boolean;
  deviceFingerprintValidation: boolean;
  referrerPatternAnalysis: boolean;
  mlFraudDetectionEnabled: boolean;
  quarantinePeriod: number; // hours
  autoRejectThreshold: number; // risk score 0-1
}
}

// =============================================================================
// Main Referral Detection Service
// =============================================================================

}
export interface ReferralDetectionConfig {
  enableTracking: boolean;
  cookieDomain: string;
  defaultAttributionWindow: number; // seconds
  enableFraudDetection: boolean;
  fraudDetection: FraudDetectionConfig;
  enableRealtimeAnalytics: boolean;
  enableDeepLinking: boolean;
  enableCrossPlatformTracking: boolean;
  
  // Performance settings
  batchSize: number;
  processingInterval: number; // milliseconds
  cacheTimeout: number; // seconds
  
  // Integration endpoints
  analyticsEndpoint: string;
  rewardService: string;
  fraudDetectionService: string;
  notificationService: string;
}
}

export class ReferralDetectionService extends EventEmitter {
  private config: ReferralDetectionConfig;
  private referralCache: Map<string, ReferralTrackingData> = new Map();
  private campaignCache: Map<string, ReferralCampaign> = new Map();
  private fraudDetectionRules: Map<string, (data: ReferralTrackingData) => number> = new Map();
  private processingQueue: ReferralTrackingData[] = [];
  private performanceMetrics = {
    totalReferrals: 0,
    totalConversions: 0,
    totalFraudDetected: 0,
    averageProcessingTime: 0,
    conversionRate: 0,
    fraudRate: 0
  };

  constructor(config: ReferralDetectionConfig) {
    super();
    this.config = config;
    this.initializeFraudDetection();
    this.startPeriodicProcessing();
  }

  // =========================================================================
  // Core Referral Tracking Methods
  // =========================================================================

  async trackReferral(
    referralCode: string,
    request: {
      url: string;
      headers: Record<string, string>;
      query: Record<string, string>;
      ip: string;
      sessionId: string;
    }
  ): Promise<ReferralTrackingData> {

    const startTime = Date.now();

    try {
      // Parse UTM parameters and tracking data
      const trackingData = await this.parseTrackingParameters(request);
      
      // Detect referral source
      const source = await this.detectReferralSource(trackingData, request);
      
      // Generate device fingerprint
      const deviceFingerprint = await this.generateDeviceFingerprint(request);
      
      // Get geolocation data
      const geoData = await this.getGeolocationData(request.ip);
      
      // Look up referrer information
      const referrer = await this.lookupReferrer(referralCode);
      if (!referrer) {
        throw new Error(`Invalid referral code: ${referralCode}`);
      }

      // Create referral tracking record
      const referralData: ReferralTrackingData = {
        id: crypto.randomUUID(),
        referralCode,
        referrerId: referrer.id,
        referredUserId: undefined, // Set when user signs up
        
        source,
        sourceUrl: request.headers.referer,
        landingPage: request.url,
        
        utmSource: request.query.utm_source,
        utmMedium: request.query.utm_medium,
        utmCampaign: request.query.utm_campaign,
        utmTerm: request.query.utm_term,
        utmContent: request.query.utm_content,
        
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
        deviceFingerprint,
        sessionId: request.sessionId,
        
        country: geoData.country,
        region: geoData.region,
        city: geoData.city,
        timezone: geoData.timezone,
        
        status: ReferralStatus.PENDING,
        fraudRiskLevel: FraudRiskLevel.LOW,
        fraudReasons: [],
        verificationScore: 1.0,
        
        attributionModel: AttributionModel.LAST_TOUCH,
        touchpointSequence: [{
          source,
          timestamp: new Date(),
          weight: 1.0
        }],
        
        rewardEligible: false,
        
        customParameters: this.extractCustomParameters(request.query),
        tags: this.generateTrackingTags(source, trackingData),
        
        firstSeen: new Date(),
        lastSeen: new Date(),
        expiresAt: this.calculateExpirationDate()
      };

      // Validate referral data
      const validatedData = ReferralTrackingDataSchema.parse(referralData);

      // Run fraud detection
      if (this.config.enableFraudDetection) {
        await this.runFraudDetection(validatedData);
      }

      // Store referral data
      await this.storeReferralData(validatedData);
      
      // Update cache
      this.referralCache.set(validatedData.id, validatedData);

      // Emit tracking event
      this.emit('referralTracked', {
        referralId: validatedData.id,
        referralCode,
        source,
        fraudRiskLevel: validatedData.fraudRiskLevel,
        processingTime: Date.now() - startTime
      });

      // Update performance metrics
      this.updatePerformanceMetrics('tracked', Date.now() - startTime);

      return validatedData;

    } catch (error) {
      this.emit('trackingError', {
        referralCode,
        error: error.message,
        processingTime: Date.now() - startTime
      });
      
      throw new Error(`Referral tracking failed: ${error.message}`);
    }
  }

  async recordConversion(
    referralId: string,
    conversion: {
      userId?: string;
      event: string;
      value?: number;
      currency?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {

    try {
      const referralData = await this.getReferralData(referralId);
      if (!referralData) {
        throw new Error(`Referral ${referralId} not found`);
      }

      // Update referral with conversion data
      const updatedData = {
        ...referralData,
        referredUserId: conversion.userId || referralData.referredUserId,
        status: ReferralStatus.VERIFIED,
        conversionEvent: conversion.event,
        conversionValue: conversion.value,
        conversionDate: new Date(),
        verifiedAt: new Date(),
        lastSeen: new Date()
      };

      // Validate conversion eligibility
      const eligibleForReward = await this.validateRewardEligibility(updatedData);
      updatedData.rewardEligible = eligibleForReward;

      // Calculate reward if eligible
      if (eligibleForReward) {
        const reward = await this.calculateReward(updatedData);
        updatedData.rewardAmount = reward.amount;
        updatedData.rewardType = reward.type;
        updatedData.rewardCurrency = reward.currency;
      }

      // Update stored data
      await this.updateReferralData(referralId, updatedData);
      
      // Update cache
      this.referralCache.set(referralId, updatedData);

      // Emit conversion event
      this.emit('conversionRecorded', {
        referralId,
        userId: conversion.userId,
        event: conversion.event,
        value: conversion.value,
        rewardEligible: eligibleForReward,
        rewardAmount: updatedData.rewardAmount
      });

      // Process reward if eligible
      if (eligibleForReward && updatedData.rewardAmount && updatedData.rewardAmount > 0) {
        await this.processReward(updatedData);
      }

      // Update performance metrics
      this.updatePerformanceMetrics('converted');

    } catch (error) {
      this.emit('conversionError', {
        referralId,
        error: error.message
      });
      
      throw new Error(`Conversion recording failed: ${error.message}`);
    }
  }

  // =========================================================================
  // Fraud Detection Methods
  // =========================================================================

  private async runFraudDetection(referralData: ReferralTrackingData): Promise<void> {

    const fraudScore = await this.calculateFraudScore(referralData);
    
    // Update fraud risk level based on score
    if (fraudScore >= 0.8) {
      referralData.fraudRiskLevel = FraudRiskLevel.CRITICAL;
    } else if (fraudScore >= 0.6) {
      referralData.fraudRiskLevel = FraudRiskLevel.HIGH;
    } else if (fraudScore >= 0.3) {
      referralData.fraudRiskLevel = FraudRiskLevel.MEDIUM;
    } else {
      referralData.fraudRiskLevel = FraudRiskLevel.LOW;
    }

    referralData.verificationScore = 1 - fraudScore;

    // Auto-reject if above threshold
    if (fraudScore >= this.config.fraudDetection.autoRejectThreshold) {
      referralData.status = ReferralStatus.FRAUDULENT;
      
      this.emit('fraudDetected', {
        referralId: referralData.id,
        fraudScore,
        reasons: referralData.fraudReasons
      });
    }
  }

  private async calculateFraudScore(referralData: ReferralTrackingData): Promise<number> {

    let totalScore = 0;
    let ruleCount = 0;

    // Run all fraud detection rules
    for (const [ruleName, ruleFunction] of this.fraudDetectionRules.entries()) {
      try {
        const score = ruleFunction(referralData);
        totalScore += score;
        ruleCount++;

        if (score > 0.5) {
          referralData.fraudReasons.push(`High risk detected by rule: ${ruleName}`);
        }
      } catch (error) {
        console.warn(`Fraud detection rule ${ruleName} failed:`, error.message);
      }
    }

    return ruleCount > 0 ? totalScore / ruleCount : 0;
  }

  private initializeFraudDetection(): void {
    // IP velocity check
    this.fraudDetectionRules.set('ip_velocity', (data) => {
      const recentCount = this.getRecentReferralsByIP(data.ipAddress, 3600); // 1 hour
      return Math.min(recentCount / this.config.fraudDetection.maxClicksPerIp, 1);
    });

    // Device fingerprint check
    this.fraudDetectionRules.set('device_velocity', (data) => {
      if (!data.deviceFingerprint) return 0;
      const recentCount = this.getRecentReferralsByDevice(data.deviceFingerprint, 3600);
      return Math.min(recentCount / this.config.fraudDetection.maxClicksPerDevice, 1);
    });

    // Geographic anomaly detection
    this.fraudDetectionRules.set('geo_anomaly', (data) => {
      const referrer = this.getReferrerInfo(data.referrerId);
      if (!referrer || !referrer.typicalCountries) return 0;
      
      if (data.country && !referrer.typicalCountries.includes(data.country)) {
        return 0.3; // Moderate risk for unusual geography
      }
      return 0;
    });

    // User agent validation
    this.fraudDetectionRules.set('user_agent_validation', (data) => {
      if (!data.userAgent) return 0.7; // High risk for missing user agent
      
      // Check for bot patterns
      const botPatterns = [
        /bot/i, /crawler/i, /spider/i, /scraper/i,
        /curl/i, /wget/i, /python/i, /java/i
      ];
      
      if (botPatterns.some(pattern => pattern.test(data.userAgent))) {
        return 0.9; // Very high risk for bot traffic
      }
      
      return 0;
    });

    // Referrer consistency check
    this.fraudDetectionRules.set('referrer_consistency', (data) => {
      if (!data.sourceUrl) return 0.2; // Slight risk for missing referrer
      
      // Check if referrer matches expected patterns for the source
      const expectedDomains = this.getExpectedDomainsForSource(data.source);
      if (expectedDomains.length > 0) {
        const referrerDomain = this.extractDomain(data.sourceUrl);
        if (!expectedDomains.includes(referrerDomain)) {
          return 0.4; // Moderate risk for unexpected referrer
        }
      }
      
      return 0;
    });
  }

  // =========================================================================
  // Attribution and Analytics Methods
  // =========================================================================

  async updateTouchpoint(
    sessionId: string,
    source: ReferralSource,
    timestamp: Date = new Date( ): Promise<void> {

    const existingReferrals = await this.getReferralsBySession(sessionId);
    
    for (const referral of existingReferrals) {
      // Add new touchpoint to sequence
      referral.touchpointSequence.push({
        source,
        timestamp,
        weight: this.calculateTouchpointWeight(source, timestamp, referral.firstSeen)
      });

      // Recalculate attribution based on model
      await this.recalculateAttribution(referral);
      
      // Update stored data
      await this.updateReferralData(referral.id, referral);
    }
  }

  private async recalculateAttribution(referral: ReferralTrackingData): Promise<void> {

    const touchpoints = referral.touchpointSequence;
    
    switch (referral.attributionModel) {
    case AttributionModel.FIRST_TOUCH:
      touchpoints.forEach((tp, index) => {
        tp.weight = index === 0 ? 1.0 : 0.0;
      });
      break;
        
    case AttributionModel.LAST_TOUCH:
      touchpoints.forEach((tp, index) => {
        tp.weight = index === touchpoints.length - 1 ? 1.0 : 0.0;
      });
      break;
        
    case AttributionModel.LINEAR:
      const linearWeight = 1.0 / touchpoints.length;
      touchpoints.forEach(tp => {
        tp.weight = linearWeight;
      });
      break;
        
    case AttributionModel.TIME_DECAY:
      const halfLife = 604800; // 7 days in seconds
      const now = Date.now();
      touchpoints.forEach(tp => {
        const ageSeconds = (now - tp.timestamp.getTime()) / 1000;
        tp.weight = Math.pow(0.5, ageSeconds / halfLife);
      });
      // Normalize weights
      const totalWeight = touchpoints.reduce((sum, tp) => sum + tp.weight, 0);
      touchpoints.forEach(tp => {
        tp.weight = tp.weight / totalWeight;
      });
      break;
        
    case AttributionModel.POSITION_BASED:
      // 40% first, 40% last, 20% middle
      if (touchpoints.length === 1) {
        touchpoints[0].weight = 1.0;
      } else if (touchpoints.length === 2) {
        touchpoints[0].weight = 0.5;
        touchpoints[1].weight = 0.5;
      } else {
        touchpoints[0].weight = 0.4;
        touchpoints[touchpoints.length - 1].weight = 0.4;
        const middleWeight = 0.2 / (touchpoints.length - 2);
        for (let i = 1; i < touchpoints.length - 1; i++) {
          touchpoints[i].weight = middleWeight;
        }
      }
      break;
    }
  }

  // =========================================================================
  // Campaign Management Methods
  // =========================================================================

  async createReferralCampaign(campaign: Omit<ReferralCampaign, 'id' | 'stats' | 'createdAt' | 'updatedAt'>): Promise<ReferralCampaign> {

    const fullCampaign: ReferralCampaign = {
      ...campaign,
      id: crypto.randomUUID(),
      stats: {
        totalClicks: 0,
        totalConversions: 0,
        totalRewardsPaid: 0,
        conversionRate: 0,
        avgOrderValue: 0,
        roi: 0
  }
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const validatedCampaign = ReferralCampaignSchema.parse(fullCampaign);
    
    await this.storeCampaignData(validatedCampaign);
    this.campaignCache.set(validatedCampaign.id, validatedCampaign);

    this.emit('campaignCreated', {
      campaignId: validatedCampaign.id,
      name: validatedCampaign.name,
      referrerId: validatedCampaign.referrerId
    });

    return validatedCampaign;
  }

  async updateCampaignStats(campaignId: string, stats: Partial<ReferralCampaign['stats']>): Promise<void> {

    const campaign = await this.getCampaignData(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    campaign.stats = { ...campaign.stats, ...stats };
    campaign.updatedAt = new Date();

    await this.updateCampaignData(campaignId, campaign);
    this.campaignCache.set(campaignId, campaign);
  }

  // =========================================================================
  // Analytics and Reporting Methods
  // =========================================================================

  async generateReferralReport(
    criteria: {
      referrerId?: string;
      campaignId?: string;
      dateRange?: { start: Date; end: Date };
      source?: ReferralSource;
      status?: ReferralStatus;
    }
  ): Promise<{
    summary: {
      totalReferrals: number;
      totalConversions: number;
      conversionRate: number;
      totalRevenue: number;
      totalRewardsPaid: number;
      roi: number;
      topSources: Array<{ source: ReferralSource; count: number; conversionRate: number }>;
    };
    details: ReferralTrackingData[];
  }> {
    const referrals = await this.searchReferrals(criteria);
    
    const totalReferrals = referrals.length;
    const conversions = referrals.filter(r => r.status === ReferralStatus.VERIFIED);
    const totalConversions = conversions.length;
    const conversionRate = totalReferrals > 0 ? (totalConversions / totalReferrals) * 100 : 0;
    
    const totalRevenue = conversions.reduce((sum, r) => sum + (r.conversionValue || 0), 0);
    const totalRewardsPaid = referrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0);
    const roi = totalRewardsPaid > 0 ? ((totalRevenue - totalRewardsPaid) / totalRewardsPaid) * 100 : 0;

    // Calculate top sources
    const sourceStats = new Map<ReferralSource, { count: number; conversions: number }>();
    referrals.forEach(r => {
      const existing = sourceStats.get(r.source) || { count: 0, conversions: 0 };
      existing.count++;
      if (r.status === ReferralStatus.VERIFIED) {
        existing.conversions++;
      }
      sourceStats.set(r.source, existing);
    });

    const topSources = Array.from(sourceStats.entries())
      .map(([source, stats]) => ({
        source,
        count: stats.count,
        conversionRate: stats.count > 0 ? (stats.conversions / stats.count) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      summary: {
        totalReferrals,
        totalConversions,
        conversionRate,
        totalRevenue,
        totalRewardsPaid,
        roi,
        topSources
  }
      details: referrals
    };
  }

  getPerformanceMetrics(): typeof this.performanceMetrics {
    return { ...this.performanceMetrics };
  }

  // =========================================================================
  // Private Helper Methods
  // =========================================================================

  private async parseTrackingParameters(request: { url: string; query: Record<string, string> }): Promise<Record<string, string>> {
    // Extract and normalize tracking parameters
    const params: Record<string, string> = {};
    
    // Standard UTM parameters
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utmParams.forEach(param => {
      if (request.query[param]) {
        params[param] = request.query[param];
      }
    });

    // Custom tracking parameters
    Object.entries(request.query).forEach(([key, value]) => {
      if (key.startsWith('ref_') || key.startsWith('track_')) {
        params[key] = value;
      }
    });

    return params;
  }

  private async detectReferralSource(
    trackingData: Record<string, string>,
    request: { headers: Record<string, string> }
  ): Promise<ReferralSource> {

    // Check UTM source first
    if (trackingData.utm_source) {
      const source = trackingData.utm_source.toLowerCase();
      
      if (source.includes('facebook') || source.includes('twitter') || source.includes('instagram') || 
          source.includes('linkedin') || source.includes('tiktok') || source.includes('youtube')) {
        return ReferralSource.SOCIAL_MEDIA;
      }
      
      if (source.includes('google') || source.includes('bing') || source.includes('yahoo')) {
        return ReferralSource.SEARCH_ENGINE;
      }
      
      if (source.includes('email') || source.includes('newsletter')) {
        return ReferralSource.EMAIL_CAMPAIGN;
      }
      
      if (source.includes('affiliate') || source.includes('partner')) {
        return ReferralSource.AFFILIATE_NETWORK;
      }
    }

    // Check referrer header
    const referrer = request.headers.referer;
    if (referrer) {
      const domain = this.extractDomain(referrer);
      
      const socialDomains = ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'tiktok.com', 'youtube.com'];
      if (socialDomains.some(d => domain.includes(d))) {
        return ReferralSource.SOCIAL_MEDIA;
      }
      
      const searchDomains = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com'];
      if (searchDomains.some(d => domain.includes(d))) {
        return ReferralSource.SEARCH_ENGINE;
      }
      
      return ReferralSource.DIRECT_LINK;
    }

    return ReferralSource.UNKNOWN;
  }

  private async generateDeviceFingerprint(request: { headers: Record<string, string> }): Promise<string> {

    const components = [
      request.headers['user-agent'] || '',
      request.headers['accept-language'] || '',
      request.headers['accept-encoding'] || '',
      request.headers['accept'] || ''
    ];
    
    return crypto.createHash('sha256').update(components.join('|')).digest('hex').substring(0, 32);
  }

  private async getGeolocationData(ipAddress: string): Promise<{
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  }> {

    // In a real implementation, this would call a geolocation service
    // For now, return mock data
    return {
      country: 'US',
      region: 'CA',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles'
    };
  }

  private async lookupReferrer(referralCode: string): Promise<{ id: string } | null> {

    // In a real implementation, this would query the database
    // For now, return mock data
    return { id: crypto.randomUUID() };
  }

  private extractCustomParameters(query: Record<string, string>): Record<string, string> {
    const custom: Record<string, string> = {};
    
    Object.entries(query).forEach(([key, value]) => {
      if (!key.startsWith('utm_') && key !== 'ref') {
        custom[key] = value;
      }
    });
    
    return custom;
  }

  private generateTrackingTags(source: ReferralSource, trackingData: Record<string, string>): string[] {
    const tags = [source];
    
    if (trackingData.utm_campaign) {
      tags.push(`campaign:${trackingData.utm_campaign}`);
    }
    
    if (trackingData.utm_medium) {
      tags.push(`medium:${trackingData.utm_medium}`);
    }
    
    return tags;
  }

  private calculateExpirationDate(): Date {
    return new Date(Date.now() + this.config.defaultAttributionWindow * 1000);
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return '';
    }
  }

  private calculateTouchpointWeight(source: ReferralSource, timestamp: Date, firstSeen: Date): number {
    // Simple time-based weight calculation
    const ageMs = timestamp.getTime() - firstSeen.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    
    // Decay weight over time (half-life of 7 days)
    return Math.pow(0.5, ageDays / 7);
  }

  // Mock database methods (would be replaced with actual database calls)
  private async storeReferralData(_data: ReferralTrackingData): Promise<void> {

    // Implementation would store in database
  }

  private async getReferralData(_id: string): Promise<ReferralTrackingData | null> {

    // Implementation would query database
    return null;
  }

  private async updateReferralData(_id: string, _data: ReferralTrackingData): Promise<void> {

    // Implementation would update database
  }

  private async storeCampaignData(_data: ReferralCampaign): Promise<void> {

    // Implementation would store in database
  }

  private async getCampaignData(_id: string): Promise<ReferralCampaign | null> {

    // Implementation would query database
    return null;
  }

  private async updateCampaignData(_id: string, _data: ReferralCampaign): Promise<void> {

    // Implementation would update database
  }

  private async searchReferrals(_criteria: Record<string, unknown>): Promise<ReferralTrackingData[]> {

    // Implementation would search database
    return [];
  }

  private async getReferralsBySession(_sessionId: string): Promise<ReferralTrackingData[]> {

    // Implementation would query database
    return [];
  }

  private getRecentReferralsByIP(_ip: string, _windowSeconds: number): number {
    // Implementation would count recent referrals by IP
    return 0;
  }

  private getRecentReferralsByDevice(_fingerprint: string, _windowSeconds: number): number {
    // Implementation would count recent referrals by device
    return 0;
  }

  private getReferrerInfo(_referrerId: string): { typicalCountries?: string[] } | null {
    // Implementation would get referrer profile
    return null;
  }

  private getExpectedDomainsForSource(_source: ReferralSource): string[] {
    // Implementation would return expected domains for source type
    return [];
  }

  private async validateRewardEligibility(_data: ReferralTrackingData): Promise<boolean> {

    // Implementation would validate reward eligibility
    return true;
  }

  private async calculateReward(_data: ReferralTrackingData): Promise<{
    amount: number;
    type: 'cash' | 'credit' | 'discount' | 'free_template';
    currency: string;
  }> {

    // Implementation would calculate reward based on campaign rules
    return {
      amount: 10.00,
      type: 'credit',
      currency: 'USD'
    };
  }

  private async processReward(_data: ReferralTrackingData): Promise<void> {

    // Implementation would process reward payment
    this.emit('rewardProcessed', {
      referralId: _data.id,
      referrerId: _data.referrerId,
      amount: _data.rewardAmount,
      type: _data.rewardType
    });
  }

  private updatePerformanceMetrics(operation: string, processingTime?: number): void {
    switch (operation) {
    case 'tracked':
      this.performanceMetrics.totalReferrals++;
      break;
    case 'converted':
      this.performanceMetrics.totalConversions++;
      this.performanceMetrics.conversionRate = 
          this.performanceMetrics.totalReferrals > 0 ? 
            (this.performanceMetrics.totalConversions / this.performanceMetrics.totalReferrals) * 100 : 0;
      break;
    case 'fraud_detected':
      this.performanceMetrics.totalFraudDetected++;
      this.performanceMetrics.fraudRate = 
          this.performanceMetrics.totalReferrals > 0 ? 
            (this.performanceMetrics.totalFraudDetected / this.performanceMetrics.totalReferrals) * 100 : 0;
      break;
    }

    if (processingTime) {
      // Update average processing time using exponential moving average
      this.performanceMetrics.averageProcessingTime = 
        (this.performanceMetrics.averageProcessingTime * 0.9) + (processingTime * 0.1);
    }
  }

  private startPeriodicProcessing(): void {
    setInterval(() => {
      if (this.processingQueue.length > 0) {
        this.processBatch();
      }
    }, this.config.processingInterval);
  }

  private async processBatch(): Promise<void> {

    const batchSize = Math.min(this.config.batchSize, this.processingQueue.length);
    const batch = this.processingQueue.splice(0, batchSize);

    await Promise.all(batch.map(async (referral) => {
      try {
        // Process any pending operations for the referral
        if (this.config.enableRealtimeAnalytics) {
          await this.updateTouchpoint(referral.sessionId, referral.source);
        }
      } catch (error) {
        console.error('Error processing referral batch:', error);
      }
    }));
  }
}

export default ReferralDetectionService;
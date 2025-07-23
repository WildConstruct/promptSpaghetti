#!/usr/bin/env node

/**
 * Epic 16 Referral Detection Management CLI
 * 
 * Command-line interface for managing referral tracking, fraud detection,
 * campaign management, and analytics reporting.
 * 
 * Usage:
 *   node scripts/epic16-referral-detection.js [command] [options]
 * 
 * Commands:
 *   track       - Track referral clicks and conversions
 *   campaign    - Manage referral campaigns
 *   fraud       - Analyze fraud detection and risk assessment
 *   rewards     - Calculate and process referral rewards
 *   analytics   - Generate referral performance analytics
 *   health      - Check system health and performance
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// =============================================================================
// Configuration and Setup
// =============================================================================

const config = {
  // Database connection (would use actual DB in production)
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME || 'marketplace',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || ''
  },
  
  // Referral tracking settings
  referral: {
    defaultCampaignId: process.env.DEFAULT_CAMPAIGN_ID || 'default-campaign',
    maxFraudRiskScore: parseInt(process.env.MAX_FRAUD_RISK_SCORE) || 70,
    attributionModel: process.env.ATTRIBUTION_MODEL || 'last_touch',
    rewardType: process.env.REWARD_TYPE || 'percentage'
  },
  
  // Fraud detection settings
  fraudDetection: {
    ipVelocityThreshold: parseInt(process.env.IP_VELOCITY_THRESHOLD) || 10,
    deviceReuseThreshold: parseInt(process.env.DEVICE_REUSE_THRESHOLD) || 5,
    geoAnomalyRiskIncrease: parseInt(process.env.GEO_ANOMALY_RISK) || 5
  },
  
  // Output formatting
  output: {
    colors: process.stdout.isTTY && process.env.NO_COLOR !== '1',
    verbose: false,
    format: 'console' // console, json, html, csv
  }
};

// Color utilities for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  if (!config.output.colors) return text;
  return `${colors[color]}${text}${colors.reset}`;
}

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: colorize('ℹ️', 'blue'),
    success: colorize('✅', 'green'),
    warning: colorize('⚠️', 'yellow'),
    error: colorize('❌', 'red'),
    debug: colorize('🔍', 'cyan')
  }[level] || 'ℹ️';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
  
  if (config.output.verbose && data) {
    console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
  }
}

// =============================================================================
// Mock Referral Detection Service
// =============================================================================

class MockReferralDetectionService {
  constructor(config) {
    this.config = config;
    this.referrals = new Map();
    this.campaigns = new Map();
    this.fraudRules = new Map();
    this.rewards = new Map();
    this.analytics = {
      dailyStats: new Map(),
      campaignPerformance: new Map()
    };
    
    this.initializeDefaultData();
  }

  async trackReferral(referralCode, referrerId, options = {}) {
    const startTime = Date.now();
    
    try {
      const referralId = crypto.randomUUID();
      const sessionId = crypto.randomUUID();
      
      // Calculate fraud risk
      const fraudAnalysis = await this.calculateFraudRisk(options);
      
      const referral = {
        id: referralId,
        referralCode,
        campaignId: options.campaignId || this.config.referral.defaultCampaignId,
        referrerId,
        referredUserId: options.referredUserId,
        
        // Source and attribution
        source: options.source || 'direct_link',
        sourceUrl: options.sourceUrl,
        landingPage: options.landingPage || 'https://marketplace.com',
        
        // UTM parameters
        utmSource: options.utmSource,
        utmMedium: options.utmMedium,
        utmCampaign: options.utmCampaign,
        utmTerm: options.utmTerm,
        utmContent: options.utmContent,
        
        // Device and session
        userAgent: options.userAgent,
        ipAddress: options.ipAddress || '192.168.1.1',
        deviceFingerprint: options.deviceFingerprint,
        sessionId,
        
        // Geolocation
        country: options.country || 'US',
        region: options.region,
        city: options.city,
        timezone: options.timezone,
        
        // Status and fraud detection
        status: fraudAnalysis.riskLevel === 'critical' ? 'pending' : 'verified',
        fraudRiskLevel: fraudAnalysis.riskLevel,
        fraudRiskScore: fraudAnalysis.riskScore,
        fraudIndicators: fraudAnalysis.indicators,
        
        // Conversion tracking
        conversionEvent: options.conversionEvent,
        conversionValue: options.conversionValue,
        conversionDate: options.conversionDate,
        attributionModel: options.attributionModel || this.config.referral.attributionModel,
        
        // Analytics
        visitCount: 1,
        pageViews: 1,
        timeOnSite: 0,
        bounceRate: 0,
        
        // Timestamps
        clickedAt: new Date(),
        firstVisitAt: new Date(),
        lastActivityAt: new Date(),
        expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days
        
        // Metadata
        tags: options.tags || [],
        customData: options.customData || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.referrals.set(referralId, referral);
      
      // Update campaign metrics
      await this.updateCampaignMetrics(referral.campaignId);
      
      // Record analytics event
      await this.recordAnalyticsEvent(referralId, 'track', { processingTime: Date.now() - startTime });
      
      return referral;
      
    } catch (error) {
      throw new Error(`Referral tracking failed: ${error.message}`);
    }
  }

  async calculateFraudRisk(options) {
    let riskScore = 0;
    const indicators = {};
    
    // IP velocity check
    if (options.ipAddress) {
      const recentFromIp = Array.from(this.referrals.values()).filter(r => 
        r.ipAddress === options.ipAddress &&
        r.clickedAt > new Date(Date.now() - 60 * 60 * 1000) // Last hour
      ).length;
      
      if (recentFromIp > this.config.fraudDetection.ipVelocityThreshold) {
        riskScore += 30;
        indicators.ipVelocity = recentFromIp;
      } else if (recentFromIp > this.config.fraudDetection.ipVelocityThreshold / 2) {
        riskScore += 15;
      }
    }
    
    // Device fingerprint check
    if (options.deviceFingerprint) {
      const recentFromDevice = Array.from(this.referrals.values()).filter(r => 
        r.deviceFingerprint === options.deviceFingerprint &&
        r.clickedAt > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      ).length;
      
      if (recentFromDevice > this.config.fraudDetection.deviceReuseThreshold) {
        riskScore += 25;
        indicators.deviceReuse = recentFromDevice;
      } else if (recentFromDevice > 2) {
        riskScore += 10;
      }
    }
    
    // Geographic anomaly check
    if (options.country && !['US', 'CA', 'GB', 'DE', 'FR'].includes(options.country)) {
      riskScore += this.config.fraudDetection.geoAnomalyRiskIncrease;
      indicators.geographicAnomaly = options.country;
    }
    
    // Time pattern analysis (simplified)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      riskScore += 5;
      indicators.unusualTime = hour;
    }
    
    // Determine risk level
    let riskLevel = 'low';
    if (riskScore >= 70) {
      riskLevel = 'critical';
    } else if (riskScore >= 40) {
      riskLevel = 'high';
    } else if (riskScore >= 20) {
      riskLevel = 'medium';
    }
    
    return {
      riskScore: Math.min(100, riskScore),
      riskLevel,
      indicators
    };
  }

  async createCampaign(campaignData) {
    const campaignId = crypto.randomUUID();
    
    const campaign = {
      id: campaignId,
      name: campaignData.name,
      description: campaignData.description,
      campaignType: campaignData.campaignType || 'affiliate',
      status: campaignData.status || 'active',
      
      // Campaign lifecycle
      startDate: campaignData.startDate || new Date(),
      endDate: campaignData.endDate,
      
      // Reward configuration
      rewardType: campaignData.rewardType || 'percentage',
      rewardValue: campaignData.rewardValue || 10.0,
      rewardCurrency: campaignData.rewardCurrency || 'USD',
      maxRewardPerReferrer: campaignData.maxRewardPerReferrer,
      
      // Targeting
      targetAudience: campaignData.targetAudience || {},
      geographicRestrictions: campaignData.geographicRestrictions || {},
      minimumConversionValue: campaignData.minimumConversionValue || 0,
      
      // Performance metrics
      totalReferrals: 0,
      successfulConversions: 0,
      totalRewardPaid: 0,
      
      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: campaignData.createdBy || 'system',
      metadata: campaignData.metadata || {}
    };

    this.campaigns.set(campaignId, campaign);
    return campaign;
  }

  async calculateReward(referralId) {
    const referral = this.referrals.get(referralId);
    if (!referral || referral.status !== 'verified' || !referral.conversionValue) {
      return null;
    }

    const campaign = this.campaigns.get(referral.campaignId);
    if (!campaign || campaign.status !== 'active') {
      return null;
    }

    let rewardAmount = 0;
    const rewardId = crypto.randomUUID();
    
    switch (campaign.rewardType) {
      case 'percentage':
        rewardAmount = (referral.conversionValue * campaign.rewardValue) / 100;
        break;
      case 'fixed_amount':
        rewardAmount = campaign.rewardValue;
        break;
      case 'tiered':
        // Simplified tiered calculation
        if (referral.conversionValue >= 100) {
          rewardAmount = 50;
        } else if (referral.conversionValue >= 50) {
          rewardAmount = 25;
        } else {
          rewardAmount = 10;
        }
        break;
      default:
        rewardAmount = 0;
    }

    // Apply attribution model weight
    const attributionWeight = await this.calculateAttributionWeight(referralId, referral.attributionModel);
    rewardAmount *= attributionWeight;

    // Apply maximum reward cap
    if (campaign.maxRewardPerReferrer) {
      const existingRewards = Array.from(this.rewards.values())
        .filter(r => r.referrerId === referral.referrerId && r.campaignId === referral.campaignId)
        .reduce((sum, r) => sum + r.finalAmount, 0);
      
      rewardAmount = Math.min(rewardAmount, campaign.maxRewardPerReferrer - existingRewards);
    }

    const reward = {
      id: rewardId,
      referralId,
      campaignId: referral.campaignId,
      referrerId: referral.referrerId,
      rewardType: campaign.rewardType,
      baseAmount: referral.conversionValue,
      multiplier: campaign.rewardValue,
      finalAmount: Math.max(0, rewardAmount),
      currency: campaign.rewardCurrency,
      status: 'pending',
      calculationMethod: `${campaign.rewardType}_${referral.attributionModel}`,
      calculationDetails: {
        baseValue: referral.conversionValue,
        rewardRate: campaign.rewardValue,
        attributionWeight,
        maxRewardCap: campaign.maxRewardPerReferrer
      },
      earnedAt: new Date(),
      expiresAt: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)), // 90 days
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.rewards.set(rewardId, reward);
    return reward;
  }

  async calculateAttributionWeight(referralId, model) {
    // Simplified attribution calculation
    switch (model) {
      case 'first_touch':
      case 'last_touch':
        return 1.0;
      case 'linear':
        return 1.0; // Would divide by number of touchpoints in real implementation
      case 'time_decay':
        return 0.8; // Mock decay factor
      case 'position_based':
        return 1.0; // Simplified for single touchpoint
      default:
        return 1.0;
    }
  }

  async generateAnalytics(options = {}) {
    const dateRange = {
      start: options.startDate || new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)),
      end: options.endDate || new Date()
    };

    const relevantReferrals = Array.from(this.referrals.values()).filter(r => 
      r.clickedAt >= dateRange.start && r.clickedAt <= dateRange.end
    );

    const analytics = {
      dateRange,
      summary: {
        totalReferrals: relevantReferrals.length,
        uniqueReferrers: new Set(relevantReferrals.map(r => r.referrerId)).size,
        totalConversions: relevantReferrals.filter(r => r.status === 'verified' && r.conversionValue).length,
        conversionRate: relevantReferrals.length > 0 ? 
          Math.round((relevantReferrals.filter(r => r.status === 'verified').length / relevantReferrals.length) * 100) : 0,
        totalConversionValue: relevantReferrals
          .filter(r => r.status === 'verified' && r.conversionValue)
          .reduce((sum, r) => sum + r.conversionValue, 0),
        averageConversionValue: 0,
        fraudAttempts: relevantReferrals.filter(r => r.fraudRiskLevel === 'high' || r.fraudRiskLevel === 'critical').length,
        averageFraudRiskScore: relevantReferrals.reduce((sum, r) => sum + r.fraudRiskScore, 0) / relevantReferrals.length || 0
      },
      
      // Source breakdown
      sourceBreakdown: this.aggregateByField(relevantReferrals, 'source'),
      
      // Geographic breakdown
      countryBreakdown: this.aggregateByField(relevantReferrals, 'country'),
      
      // Campaign performance
      campaignPerformance: this.aggregateByCampaign(relevantReferrals),
      
      // Fraud analysis
      fraudAnalysis: {
        riskLevelBreakdown: this.aggregateByField(relevantReferrals, 'fraudRiskLevel'),
        topFraudIndicators: this.analyzeFraudIndicators(relevantReferrals)
      },
      
      // Time series data (daily aggregation)
      timeSeriesData: this.generateTimeSeriesData(relevantReferrals, dateRange)
    };

    // Calculate average conversion value
    const conversions = relevantReferrals.filter(r => r.status === 'verified' && r.conversionValue);
    analytics.summary.averageConversionValue = conversions.length > 0 ?
      analytics.summary.totalConversionValue / conversions.length : 0;

    return analytics;
  }

  aggregateByField(referrals, field) {
    const breakdown = {};
    referrals.forEach(r => {
      const value = r[field] || 'unknown';
      breakdown[value] = (breakdown[value] || 0) + 1;
    });
    return breakdown;
  }

  aggregateByCampaign(referrals) {
    const campaignStats = {};
    
    referrals.forEach(r => {
      if (!campaignStats[r.campaignId]) {
        const campaign = this.campaigns.get(r.campaignId);
        campaignStats[r.campaignId] = {
          campaignName: campaign?.name || 'Unknown Campaign',
          totalReferrals: 0,
          conversions: 0,
          conversionValue: 0,
          fraudAttempts: 0
        };
      }
      
      campaignStats[r.campaignId].totalReferrals++;
      if (r.status === 'verified' && r.conversionValue) {
        campaignStats[r.campaignId].conversions++;
        campaignStats[r.campaignId].conversionValue += r.conversionValue;
      }
      if (r.fraudRiskLevel === 'high' || r.fraudRiskLevel === 'critical') {
        campaignStats[r.campaignId].fraudAttempts++;
      }
    });
    
    // Calculate conversion rates
    Object.values(campaignStats).forEach(stats => {
      stats.conversionRate = stats.totalReferrals > 0 ? 
        Math.round((stats.conversions / stats.totalReferrals) * 100) : 0;
    });
    
    return campaignStats;
  }

  analyzeFraudIndicators(referrals) {
    const indicators = {};
    
    referrals.forEach(r => {
      if (r.fraudIndicators) {
        Object.keys(r.fraudIndicators).forEach(indicator => {
          indicators[indicator] = (indicators[indicator] || 0) + 1;
        });
      }
    });
    
    return Object.entries(indicators)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  }

  generateTimeSeriesData(referrals, dateRange) {
    const dailyData = {};
    const days = Math.ceil((dateRange.end - dateRange.start) / (24 * 60 * 60 * 1000));
    
    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(dateRange.start.getTime() + (i * 24 * 60 * 60 * 1000));
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = {
        date: dateKey,
        referrals: 0,
        conversions: 0,
        conversionValue: 0,
        fraudAttempts: 0
      };
    }
    
    // Aggregate referral data by day
    referrals.forEach(r => {
      const dateKey = r.clickedAt.toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].referrals++;
        if (r.status === 'verified' && r.conversionValue) {
          dailyData[dateKey].conversions++;
          dailyData[dateKey].conversionValue += r.conversionValue;
        }
        if (r.fraudRiskLevel === 'high' || r.fraudRiskLevel === 'critical') {
          dailyData[dateKey].fraudAttempts++;
        }
      }
    });
    
    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  }

  async updateCampaignMetrics(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return;

    const campaignReferrals = Array.from(this.referrals.values()).filter(r => r.campaignId === campaignId);
    
    campaign.totalReferrals = campaignReferrals.length;
    campaign.successfulConversions = campaignReferrals.filter(r => r.status === 'verified' && r.conversionValue).length;
    
    const campaignRewards = Array.from(this.rewards.values()).filter(r => r.campaignId === campaignId);
    campaign.totalRewardPaid = campaignRewards
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + r.finalAmount, 0);
    
    campaign.updatedAt = new Date();
  }

  async recordAnalyticsEvent(referralId, eventType, eventData) {
    // Record analytics event for monitoring and debugging
    const event = {
      id: crypto.randomUUID(),
      referralId,
      eventType,
      eventData,
      occurredAt: new Date(),
      processedAt: new Date()
    };
    
    // In a real implementation, this would be stored in the database
    return event;
  }

  async getHealthCheck() {
    const totalReferrals = this.referrals.size;
    const last24Hours = Array.from(this.referrals.values()).filter(r => 
      r.clickedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    const highRiskCount = last24Hours.filter(r => r.fraudRiskLevel === 'high' || r.fraudRiskLevel === 'critical').length;
    const pendingReviews = Array.from(this.referrals.values()).filter(r => r.status === 'pending').length;
    
    let status = 'healthy';
    if (pendingReviews > 100 || highRiskCount > 50) {
      status = 'critical';
    } else if (pendingReviews > 50 || highRiskCount > 20) {
      status = 'degraded';
    }
    
    return {
      status,
      services: {
        referralTracking: { status: 'healthy', responseTime: 25 },
        fraudDetection: { status: 'healthy', responseTime: 15 },
        rewardCalculation: { status: 'healthy', responseTime: 30 },
        analytics: { status: 'healthy', responseTime: 45 }
      },
      metrics: {
        totalReferrals,
        referrals24h: last24Hours.length,
        highRisk24h: highRiskCount,
        pendingReviews,
        activeCampaigns: Array.from(this.campaigns.values()).filter(c => c.status === 'active').length,
        averageFraudRiskScore: last24Hours.reduce((sum, r) => sum + r.fraudRiskScore, 0) / last24Hours.length || 0
      }
    };
  }

  initializeDefaultData() {
    // Create default campaign
    this.createCampaign({
      name: 'Default Marketplace Referral Program',
      description: 'Standard referral program with 10% commission',
      campaignType: 'affiliate',
      rewardType: 'percentage',
      rewardValue: 10.0,
      status: 'active'
    });
  }
}

// =============================================================================
// Command Implementations
// =============================================================================

class ReferralDetectionCLI {
  constructor() {
    this.service = new MockReferralDetectionService(config);
  }

  async executeCommand(command, args, options) {
    const startTime = Date.now();
    log('info', `Starting Epic 16 referral detection: ${command}`);

    try {
      let result;
      
      switch (command) {
        case 'track':
          result = await this.trackCommand(args, options);
          break;
        case 'campaign':
          result = await this.campaignCommand(args, options);
          break;
        case 'fraud':
          result = await this.fraudCommand(args, options);
          break;
        case 'rewards':
          result = await this.rewardsCommand(args, options);
          break;
        case 'analytics':
          result = await this.analyticsCommand(args, options);
          break;
        case 'health':
          result = await this.healthCommand(args, options);
          break;
        default:
          throw new Error(`Unknown command: ${command}`);
      }

      const duration = Date.now() - startTime;
      log('success', `Epic 16 referral detection completed (${duration}ms)`);
      
      if (options.output) {
        await this.writeOutput(result, options.output, options.format);
      }

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      log('error', `Epic 16 referral detection failed (${duration}ms): ${error.message}`);
      process.exit(1);
    }
  }

  async trackCommand(args, options) {
    const referralCode = options.code || `REF-${Date.now()}`;
    const referrerId = options.referrerId || crypto.randomUUID();
    const count = parseInt(options.count) || 1;
    
    log('info', `Tracking ${count} referral(s) with code: ${referralCode}`);
    
    const results = [];
    
    for (let i = 0; i < count; i++) {
      const trackingData = {
        campaignId: options.campaignId,
        referredUserId: options.referredUserId,
        source: options.source || 'direct_link',
        sourceUrl: options.sourceUrl,
        landingPage: options.landingPage,
        utmSource: options.utmSource,
        utmMedium: options.utmMedium,
        utmCampaign: options.utmCampaign,
        ipAddress: options.ipAddress || `192.168.1.${Math.floor(Math.random() * 255)}`,
        deviceFingerprint: options.deviceFingerprint || `device-${Math.random().toString(36).substr(2, 9)}`,
        country: options.country || 'US',
        conversionValue: options.conversionValue ? parseFloat(options.conversionValue) : undefined,
        conversionEvent: options.conversionEvent,
        tags: options.tags ? options.tags.split(',') : []
      };

      const referral = await this.service.trackReferral(`${referralCode}-${i + 1}`, referrerId, trackingData);
      
      results.push({
        referralId: referral.id,
        referralCode: referral.referralCode,
        status: referral.status,
        fraudRiskLevel: referral.fraudRiskLevel,
        fraudRiskScore: referral.fraudRiskScore,
        clickedAt: referral.clickedAt
      });

      log('success', `Referral tracked: ${referral.id} (Risk: ${referral.fraudRiskLevel}, Score: ${referral.fraudRiskScore})`);
    }

    return {
      command: 'track',
      summary: {
        tracked: results.length,
        referralCode,
        referrerId
      },
      results
    };
  }

  async campaignCommand(args, options) {
    const action = args[0] || 'list';
    
    switch (action) {
      case 'create':
        log('info', `Creating new referral campaign: ${options.name}`);
        
        const campaign = await this.service.createCampaign({
          name: options.name || 'New Campaign',
          description: options.description,
          campaignType: options.type || 'affiliate',
          rewardType: options.rewardType || 'percentage',
          rewardValue: parseFloat(options.rewardValue) || 10.0,
          rewardCurrency: options.currency || 'USD',
          maxRewardPerReferrer: options.maxReward ? parseFloat(options.maxReward) : undefined,
          minimumConversionValue: options.minConversion ? parseFloat(options.minConversion) : 0
        });
        
        log('success', `Campaign created: ${campaign.id}`);
        
        return {
          command: 'campaign',
          action: 'create',
          campaign
        };
        
      case 'list':
        log('info', 'Listing all referral campaigns');
        
        const campaigns = Array.from(this.service.campaigns.values());
        
        console.log('\n' + colorize('📊 Referral Campaigns', 'bright'));
        console.log('======================');
        
        if (campaigns.length === 0) {
          console.log('No campaigns found.');
        } else {
          campaigns.forEach(campaign => {
            console.log(`\n${colorize(campaign.name, 'cyan')} (${campaign.id})`);
            console.log(`  Type: ${campaign.campaignType}`);
            console.log(`  Status: ${colorize(campaign.status, campaign.status === 'active' ? 'green' : 'yellow')}`);
            console.log(`  Reward: ${campaign.rewardValue}${campaign.rewardType === 'percentage' ? '%' : ` ${campaign.rewardCurrency}`}`);
            console.log(`  Referrals: ${campaign.totalReferrals}`);
            console.log(`  Conversions: ${campaign.successfulConversions}`);
            console.log(`  Rewards Paid: ${campaign.totalRewardPaid} ${campaign.rewardCurrency}`);
          });
        }
        
        return {
          command: 'campaign',
          action: 'list',
          campaigns
        };
        
      default:
        throw new Error(`Unknown campaign action: ${action}`);
    }
  }

  async fraudCommand(args, options) {
    log('info', 'Analyzing fraud detection and risk assessment');
    
    const referrals = Array.from(this.service.referrals.values());
    const highRiskReferrals = referrals.filter(r => r.fraudRiskLevel === 'high' || r.fraudRiskLevel === 'critical');
    
    // Risk level distribution
    const riskDistribution = {
      low: referrals.filter(r => r.fraudRiskLevel === 'low').length,
      medium: referrals.filter(r => r.fraudRiskLevel === 'medium').length,
      high: referrals.filter(r => r.fraudRiskLevel === 'high').length,
      critical: referrals.filter(r => r.fraudRiskLevel === 'critical').length
    };
    
    // Top fraud indicators
    const fraudIndicators = {};
    referrals.forEach(r => {
      if (r.fraudIndicators) {
        Object.keys(r.fraudIndicators).forEach(indicator => {
          fraudIndicators[indicator] = (fraudIndicators[indicator] || 0) + 1;
        });
      }
    });
    
    console.log('\n' + colorize('🛡️ Fraud Detection Analysis', 'bright'));
    console.log('==============================');
    console.log(`Total Referrals: ${colorize(referrals.length.toString(), 'white')}`);
    console.log(`High Risk: ${colorize(highRiskReferrals.length.toString(), 'red')}`);
    console.log(`Average Risk Score: ${colorize(Math.round(referrals.reduce((sum, r) => sum + r.fraudRiskScore, 0) / referrals.length || 0).toString(), 'yellow')}`);
    
    console.log('\nRisk Level Distribution:');
    Object.entries(riskDistribution).forEach(([level, count]) => {
      const color = level === 'critical' ? 'red' : level === 'high' ? 'yellow' : 'green';
      console.log(`  ${level}: ${colorize(count.toString(), color)}`);
    });
    
    if (Object.keys(fraudIndicators).length > 0) {
      console.log('\nTop Fraud Indicators:');
      Object.entries(fraudIndicators)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([indicator, count]) => {
          console.log(`  ${indicator}: ${colorize(count.toString(), 'red')}`);
        });
    }
    
    if (highRiskReferrals.length > 0) {
      console.log('\n' + colorize('Recent High-Risk Referrals:', 'red'));
      highRiskReferrals.slice(0, 10).forEach(r => {
        console.log(`  ${r.id} - ${r.fraudRiskLevel} (${r.fraudRiskScore}) - ${r.ipAddress}`);
      });
    }

    return {
      command: 'fraud',
      analysis: {
        totalReferrals: referrals.length,
        highRiskCount: highRiskReferrals.length,
        averageRiskScore: Math.round(referrals.reduce((sum, r) => sum + r.fraudRiskScore, 0) / referrals.length || 0),
        riskDistribution,
        fraudIndicators,
        highRiskReferrals: highRiskReferrals.slice(0, 10).map(r => ({
          id: r.id,
          riskLevel: r.fraudRiskLevel,
          riskScore: r.fraudRiskScore,
          ipAddress: r.ipAddress,
          indicators: r.fraudIndicators
        }))
      }
    };
  }

  async rewardsCommand(args, options) {
    const action = args[0] || 'calculate';
    
    switch (action) {
      case 'calculate':
        log('info', 'Calculating referral rewards');
        
        const eligibleReferrals = Array.from(this.service.referrals.values()).filter(r => 
          r.status === 'verified' && r.conversionValue && !Array.from(this.service.rewards.values()).find(reward => reward.referralId === r.id)
        );
        
        const rewardResults = [];
        
        for (const referral of eligibleReferrals) {
          const reward = await this.service.calculateReward(referral.id);
          if (reward) {
            rewardResults.push({
              referralId: referral.id,
              rewardId: reward.id,
              referrerId: reward.referrerId,
              amount: reward.finalAmount,
              currency: reward.currency,
              status: reward.status
            });
            
            log('success', `Reward calculated: ${reward.finalAmount} ${reward.currency} for referral ${referral.id}`);
          }
        }
        
        return {
          command: 'rewards',
          action: 'calculate',
          summary: {
            eligible: eligibleReferrals.length,
            calculated: rewardResults.length,
            totalAmount: rewardResults.reduce((sum, r) => sum + r.amount, 0)
          },
          results: rewardResults
        };
        
      case 'list':
        log('info', 'Listing all referral rewards');
        
        const rewards = Array.from(this.service.rewards.values());
        
        console.log('\n' + colorize('💰 Referral Rewards', 'bright'));
        console.log('===================');
        
        if (rewards.length === 0) {
          console.log('No rewards found.');
        } else {
          rewards.forEach(reward => {
            const statusColor = reward.status === 'paid' ? 'green' : reward.status === 'pending' ? 'yellow' : 'red';
            console.log(`${reward.id}: ${colorize(reward.finalAmount.toString(), 'green')} ${reward.currency} - ${colorize(reward.status, statusColor)}`);
            console.log(`  Referral: ${reward.referralId}`);
            console.log(`  Referrer: ${reward.referrerId}`);
            console.log(`  Earned: ${reward.earnedAt.toISOString()}`);
          });
        }
        
        return {
          command: 'rewards',
          action: 'list',
          rewards
        };
        
      default:
        throw new Error(`Unknown rewards action: ${action}`);
    }
  }

  async analyticsCommand(args, options) {
    const days = parseInt(options.days) || 30;
    const campaignId = options.campaignId;
    
    log('info', `Generating referral analytics for last ${days} days`);
    
    const analytics = await this.service.generateAnalytics({
      startDate: new Date(Date.now() - (days * 24 * 60 * 60 * 1000)),
      endDate: new Date(),
      campaignId
    });
    
    console.log('\n' + colorize('📈 Referral Analytics', 'bright'));
    console.log('=====================');
    console.log(`Period: ${analytics.dateRange.start.toISOString().split('T')[0]} to ${analytics.dateRange.end.toISOString().split('T')[0]}`);
    
    console.log('\nSummary:');
    console.log(`  Total Referrals: ${colorize(analytics.summary.totalReferrals.toString(), 'green')}`);
    console.log(`  Unique Referrers: ${colorize(analytics.summary.uniqueReferrers.toString(), 'blue')}`);
    console.log(`  Conversions: ${colorize(analytics.summary.totalConversions.toString(), 'green')}`);
    console.log(`  Conversion Rate: ${colorize(analytics.summary.conversionRate + '%', 'yellow')}`);
    console.log(`  Total Value: ${colorize('$' + analytics.summary.totalConversionValue.toFixed(2), 'green')}`);
    console.log(`  Average Value: ${colorize('$' + analytics.summary.averageConversionValue.toFixed(2), 'blue')}`);
    console.log(`  Fraud Attempts: ${colorize(analytics.summary.fraudAttempts.toString(), 'red')}`);
    console.log(`  Avg Risk Score: ${colorize(analytics.summary.averageFraudRiskScore.toFixed(1), 'yellow')}`);
    
    if (Object.keys(analytics.sourceBreakdown).length > 0) {
      console.log('\nTop Sources:');
      Object.entries(analytics.sourceBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([source, count]) => {
          console.log(`  ${source}: ${colorize(count.toString(), 'cyan')}`);
        });
    }
    
    if (Object.keys(analytics.countryBreakdown).length > 0) {
      console.log('\nTop Countries:');
      Object.entries(analytics.countryBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([country, count]) => {
          console.log(`  ${country}: ${colorize(count.toString(), 'cyan')}`);
        });
    }

    return {
      command: 'analytics',
      analytics
    };
  }

  async healthCommand(args, options) {
    log('info', 'Checking Epic 16 referral detection system health');
    
    const health = await this.service.getHealthCheck();
    
    const statusColor = {
      'healthy': 'green',
      'degraded': 'yellow',
      'unhealthy': 'red'
    }[health.status] || 'white';
    
    console.log('\n' + colorize('🏥 System Health Check', 'bright'));
    console.log('=======================');
    console.log(`Overall Status: ${colorize(health.status.toUpperCase(), statusColor)}`);
    
    console.log('\nService Status:');
    for (const [service, status] of Object.entries(health.services)) {
      const serviceStatusColor = status.status === 'healthy' ? 'green' : 'red';
      const responseTime = status.responseTime ? ` (${status.responseTime}ms)` : '';
      console.log(`  ${service}: ${colorize(status.status, serviceStatusColor)}${responseTime}`);
    }
    
    console.log('\nSystem Metrics:');
    console.log(`  Total Referrals: ${colorize(health.metrics.totalReferrals.toString(), 'green')}`);
    console.log(`  24h Referrals: ${colorize(health.metrics.referrals24h.toString(), 'blue')}`);
    console.log(`  High Risk (24h): ${colorize(health.metrics.highRisk24h.toString(), 'red')}`);
    console.log(`  Pending Reviews: ${colorize(health.metrics.pendingReviews.toString(), 'yellow')}`);
    console.log(`  Active Campaigns: ${colorize(health.metrics.activeCampaigns.toString(), 'green')}`);
    console.log(`  Avg Risk Score: ${colorize(health.metrics.averageFraudRiskScore.toFixed(1), 'yellow')}`);

    // Exit with appropriate code for monitoring
    if (health.status === 'healthy') {
      process.exit(0);
    } else if (health.status === 'degraded') {
      process.exit(1);
    } else {
      process.exit(2);
    }
  }

  async writeOutput(data, outputFile, format) {
    let content;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        break;
      case 'csv':
        content = this.convertToCSV(data);
        break;
      case 'html':
        content = this.convertToHTML(data);
        break;
      default:
        content = JSON.stringify(data, null, 2);
    }
    
    fs.writeFileSync(outputFile, content, 'utf8');
    log('success', `Output written to: ${outputFile}`);
  }

  convertToCSV(data) {
    // Simple CSV conversion for referral data
    if (data.results && Array.isArray(data.results)) {
      const headers = Object.keys(data.results[0] || {});
      const rows = data.results.map(row => 
        headers.map(header => JSON.stringify(row[header] || '')).join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    }
    return JSON.stringify(data);
  }

  convertToHTML(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Epic 16 Referral Detection Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #f3f4f6; border-radius: 5px; }
        .success { color: #10b981; }
        .warning { color: #f59e0b; }
        .error { color: #ef4444; }
        .chart { background: #f9fafb; padding: 15px; border-radius: 5px; margin: 10px 0; }
        pre { background: #f9fafb; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1 class="header">Epic 16 Referral Detection Report</h1>
    <p>Generated: ${new Date().toISOString()}</p>
    
    <h2>Summary</h2>
    <div class="metric">
        <strong>Command:</strong> ${data.command || 'N/A'}
    </div>
    
    <h2>Data</h2>
    <pre>${JSON.stringify(data, null, 2)}</pre>
</body>
</html>`;
  }
}

// =============================================================================
// Argument Parsing and Main Entry Point
// =============================================================================

function parseArguments() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = {};
  const positionalArgs = [];
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      if (value !== undefined) {
        options[key] = value;
      } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options[key] = args[++i];
      } else {
        options[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const flags = arg.substring(1);
      for (const flag of flags) {
        const flagMap = {
          'v': 'verbose',
          'h': 'help'
        };
        options[flagMap[flag] || flag] = true;
      }
    } else {
      positionalArgs.push(arg);
    }
  }
  
  return { command, args: positionalArgs, options };
}

function showHelp() {
  console.log(`
${colorize('Epic 16 Referral Detection Management CLI', 'bright')}

${colorize('USAGE:', 'cyan')}
  node scripts/epic16-referral-detection.js [command] [options]

${colorize('COMMANDS:', 'cyan')}
  track       Track referral clicks and conversions
  campaign    Manage referral campaigns
  fraud       Analyze fraud detection and risk assessment  
  rewards     Calculate and process referral rewards
  analytics   Generate referral performance analytics
  health      Check system health and performance

${colorize('TRACK OPTIONS:', 'cyan')}
  --code <code>           Referral code (default: auto-generated)
  --referrer-id <uuid>    Referrer user ID
  --count <number>        Number of referrals to track (default: 1)
  --campaign-id <uuid>    Campaign ID
  --source <source>       Traffic source (default: direct_link)
  --utm-source <source>   UTM source parameter
  --utm-medium <medium>   UTM medium parameter
  --utm-campaign <name>   UTM campaign parameter
  --ip-address <ip>       IP address for tracking
  --country <code>        Country code (e.g., US, CA)
  --conversion-value <$>  Conversion value for reward calculation
  --conversion-event <event> Conversion event type

${colorize('CAMPAIGN OPTIONS:', 'cyan')}
  create                  Create new campaign
    --name <name>         Campaign name
    --description <desc>  Campaign description
    --type <type>         Campaign type (affiliate, influencer, etc.)
    --reward-type <type>  Reward type (percentage, fixed_amount, tiered)
    --reward-value <val>  Reward value/percentage
    --currency <code>     Currency code (default: USD)
    --max-reward <amount> Maximum reward per referrer

  list                    List all campaigns

${colorize('FRAUD OPTIONS:', 'cyan')}
  (No additional options - analyzes all referral data)

${colorize('REWARDS OPTIONS:', 'cyan')}
  calculate              Calculate pending rewards
  list                   List all rewards

${colorize('ANALYTICS OPTIONS:', 'cyan')}
  --days <number>        Days to include in analytics (default: 30)
  --campaign-id <uuid>   Filter by specific campaign

${colorize('GLOBAL OPTIONS:', 'cyan')}
  --output <file>        Write output to file
  --format <format>      Output format (console|json|html|csv)
  --verbose              Enable verbose logging
  -v                     Same as --verbose
  --help                 Show this help message
  -h                     Same as --help

${colorize('EXAMPLES:', 'cyan')}
  # Track test referrals
  node scripts/epic16-referral-detection.js track --code TEST123 --count 5 --source social_media

  # Create new campaign
  node scripts/epic16-referral-detection.js campaign create --name "Holiday Campaign" --reward-value 15

  # Analyze fraud patterns
  node scripts/epic16-referral-detection.js fraud --verbose

  # Calculate rewards for verified referrals
  node scripts/epic16-referral-detection.js rewards calculate

  # Generate 30-day analytics report
  node scripts/epic16-referral-detection.js analytics --days 30 --output report.json --format json

  # Health check for monitoring
  node scripts/epic16-referral-detection.js health

${colorize('EXIT CODES:', 'cyan')}
  0    Success
  1    Non-critical issues (health check: degraded)
  2    Critical issues (health check: unhealthy)  
  3    Error during execution
`);
}

async function main() {
  const { command, args, options } = parseArguments();
  
  // Handle help and configuration
  if (options.help || !command) {
    showHelp();
    return;
  }
  
  if (options.verbose) {
    config.output.verbose = true;
  }
  
  if (options.format) {
    config.output.format = options.format;
  }

  // Initialize and execute CLI
  const cli = new ReferralDetectionCLI();
  await cli.executeCommand(command, args, options);
}

// Run the CLI
if (require.main === module) {
  main().catch(error => {
    log('error', `Unexpected error: ${error.message}`);
    if (config.output.verbose) {
      console.error(error.stack);
    }
    process.exit(3);
  });
}

module.exports = {
  ReferralDetectionCLI,
  MockReferralDetectionService,
  config
};
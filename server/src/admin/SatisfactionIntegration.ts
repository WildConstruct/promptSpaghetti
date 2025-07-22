/**
 * User Satisfaction Tracking Integration
 * 
 * Integration layer that connects user satisfaction tracking with the main
 * application server, providing unified access to satisfaction metrics,
 * survey management, and administrative controls across the system.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 * Task: E17-1753114397430-2D9B2A - Implement user satisfaction tracking
 */

import { FastifyInstance } from 'fastify';
import { UserSatisfactionTracker } from './UserSatisfactionTracker';
import { SatisfactionDashboardAPI } from './SatisfactionDashboardAPI';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';

export interface SatisfactionIntegrationConfig {
  enabled: boolean;
  enableSurveyCollection: boolean;
  enableRealtimeTracking: boolean;
  enableAdminDashboard: boolean;
  enableAutomatedSurveys: boolean;
  surveyResponseTimeout: number; // minutes
  metricsUpdateInterval: number; // minutes
  alertingEnabled: boolean;
  
  // Survey Configuration
  defaultSurveyTypes: string[];
  minResponsesForMetrics: number;
  satisfactionThresholds: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  
  // NPS Configuration
  npsThresholds: {
    worldClass: number;
    excellent: number;
    good: number;
    needsImprovement: number;
  };
}

/**
 * User Satisfaction Integration Service
 * 
 * Coordinates all user satisfaction tracking components and integrates
 * them with the main application infrastructure
 */
export class SatisfactionIntegration {
  private config: SatisfactionIntegrationConfig;
  private satisfactionTracker: UserSatisfactionTracker;
  private dashboardAPI: SatisfactionDashboardAPI;
  
  // Service Dependencies
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private auditService: AuditService;
  
  // Integration State
  private integrationActive: boolean = false;
  private surveyTriggers: Map<string, any> = new Map();
  private automatedSurveyInterval?: NodeJS.Timeout;

  constructor(
    config: SatisfactionIntegrationConfig,
    dependencies: {
      databaseService: DatabaseService;
      redisService: RedisService;
      auditService: AuditService;
    }
  ) {
    this.config = config;
    this.databaseService = dependencies.databaseService;
    this.redisService = dependencies.redisService;
    this.auditService = dependencies.auditService;
  }

  /**
   * Initialize satisfaction tracking integration
   */
  public async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('⏭️  User satisfaction tracking disabled in configuration');
      return;
    }

    console.log('📊 Initializing User Satisfaction Tracking Integration...');

    try {
      // Initialize satisfaction tracker
      await this.initializeSatisfactionTracker();
      
      // Initialize dashboard API
      await this.initializeDashboardAPI();
      
      // Setup automated survey triggers
      if (this.config.enableAutomatedSurveys) {
        await this.setupAutomatedSurveys();
      }
      
      // Setup real-time tracking
      if (this.config.enableRealtimeTracking) {
        await this.setupRealtimeTracking();
      }
      
      // Setup integration monitoring
      await this.setupIntegrationMonitoring();
      
      this.integrationActive = true;
      
      console.log('✅ User Satisfaction Tracking Integration initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize User Satisfaction Tracking Integration:', error);
      throw error;
    }
  }

  /**
   * Register satisfaction tracking routes with Fastify server
   */
  public registerRoutes(server: FastifyInstance): void {
    if (!this.config.enabled) return;

    // Register dashboard API routes
    if (this.dashboardAPI) {
      this.dashboardAPI.registerRoutes(server);
    }

    // Register integration status endpoints
    server.get('/api/admin/satisfaction/integration/status', async (request, reply) => {
      try {
        const status = await this.getIntegrationStatus();
        return reply.code(200).send({
          success: true,
          data: status
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error.message
        });
      }
    });

    // Register integration configuration endpoint
    server.get('/api/admin/satisfaction/integration/config', async (request, reply) => {
      return reply.code(200).send({
        success: true,
        data: {
          enabled: this.config.enabled,
          surveyCollection: this.config.enableSurveyCollection,
          realtimeTracking: this.config.enableRealtimeTracking,
          adminDashboard: this.config.enableAdminDashboard,
          automatedSurveys: this.config.enableAutomatedSurveys,
          thresholds: {
            satisfaction: this.config.satisfactionThresholds,
            nps: this.config.npsThresholds
          }
        }
      });
    });

    // Register webhook endpoint for external survey integrations
    server.post('/api/satisfaction/webhooks/survey-response', async (request, reply) => {
      try {
        const webhookData = request.body as any;
        await this.handleSurveyWebhook(webhookData);
        
        return reply.code(200).send({
          success: true,
          message: 'Webhook processed successfully'
        });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error.message
        });
      }
    });

    // Register trigger endpoints for automatic survey invitations
    server.post('/api/satisfaction/triggers/post-purchase', this.handlePostPurchaseTrigger.bind(this));
    server.post('/api/satisfaction/triggers/feature-usage', this.handleFeatureUsageTrigger.bind(this));
    server.post('/api/satisfaction/triggers/support-resolution', this.handleSupportResolutionTrigger.bind(this));

    console.log('🔗 Satisfaction tracking integration routes registered');
  }

  /**
   * Trigger satisfaction survey for user
   */
  public async triggerSatisfactionSurvey(
    userId: string,
    surveyType: string,
    context: any,
    immediate: boolean = false
  ): Promise<{ surveyId: string; invitationSent: boolean }> {
    if (!this.integrationActive || !this.config.enableSurveyCollection) {
      throw new Error('Survey collection is disabled');
    }

    try {
      // Create satisfaction survey
      const survey = await this.satisfactionTracker.createSatisfactionSurvey(
        userId,
        surveyType as any,
        context
      );

      // Send survey invitation
      let invitationSent = false;
      if (immediate) {
        invitationSent = await this.sendSurveyInvitation(userId, survey.surveyId, surveyType);
      } else {
        // Schedule survey invitation
        await this.scheduleSurveyInvitation(userId, survey.surveyId, surveyType, context);
        invitationSent = true;
      }

      // Audit survey trigger
      await this.auditService.logActivity({
        userId: 'system',
        action: 'satisfaction_survey_triggered',
        details: {
          targetUserId: userId,
          surveyId: survey.surveyId,
          surveyType,
          immediate,
          invitationSent
        },
        timestamp: new Date()
      } as any);

      return {
        surveyId: survey.surveyId,
        invitationSent
      };

    } catch (error) {
      console.error('Error triggering satisfaction survey:', error);
      throw error;
    }
  }

  /**
   * Get satisfaction tracking integration status
   */
  public async getIntegrationStatus(): Promise<any> {
    const dashboard = await this.satisfactionTracker.getSatisfactionDashboard();
    
    return {
      integration: {
        active: this.integrationActive,
        enabled: this.config.enabled,
        services: {
          satisfactionTracker: 'active',
          dashboardAPI: this.dashboardAPI ? 'active' : 'disabled',
          automatedSurveys: this.config.enableAutomatedSurveys ? 'active' : 'disabled',
          realtimeTracking: this.config.enableRealtimeTracking ? 'active' : 'disabled'
        },
        lastUpdate: new Date()
      },
      metrics: {
        overallSatisfaction: dashboard.summary.overallScore,
        npsScore: dashboard.summary.npsScore,
        responseRate: dashboard.summary.responseRate,
        totalResponses: dashboard.summary.totalResponses,
        activeAlerts: dashboard.alerts.length,
        criticalAlerts: dashboard.alerts.filter(a => a.severity === 'critical').length
      },
      performance: {
        todayResponses: dashboard.realtime.todayResponses,
        averageToday: dashboard.realtime.averageToday,
        dataFreshness: dashboard.dataFreshness,
        trendDirection: dashboard.summary.trendDirection
      },
      configuration: {
        surveyTimeout: this.config.surveyResponseTimeout,
        updateInterval: this.config.metricsUpdateInterval,
        alertingEnabled: this.config.alertingEnabled,
        minResponsesForMetrics: this.config.minResponsesForMetrics
      }
    };
  }

  /**
   * Shutdown satisfaction tracking integration
   */
  public async shutdown(): Promise<void> {
    console.log('⏹️  Shutting down User Satisfaction Tracking Integration...');
    
    // Stop automated survey scheduling
    if (this.automatedSurveyInterval) {
      clearInterval(this.automatedSurveyInterval);
    }
    
    // Clear survey triggers
    this.surveyTriggers.clear();
    
    this.integrationActive = false;
    
    console.log('✅ User Satisfaction Tracking Integration shut down successfully');
  }

  // Private initialization methods

  /**
   * Initialize satisfaction tracker service
   */
  private async initializeSatisfactionTracker(): Promise<void> {
    console.log('📊 Initializing Satisfaction Tracker...');
    
    this.satisfactionTracker = new UserSatisfactionTracker({
      databaseService: this.databaseService,
      redisService: this.redisService,
      auditService: this.auditService
    });
    
    await this.satisfactionTracker.initialize();
    
    // Listen for satisfaction events
    this.setupSatisfactionEventListeners();
    
    console.log('✅ Satisfaction Tracker initialized');
  }

  /**
   * Initialize dashboard API
   */
  private async initializeDashboardAPI(): Promise<void> {
    if (!this.config.enableAdminDashboard) {
      console.log('⏭️  Admin dashboard disabled in configuration');
      return;
    }

    console.log('📊 Initializing Dashboard API...');
    
    this.dashboardAPI = new SatisfactionDashboardAPI(
      this.satisfactionTracker,
      {
        databaseService: this.databaseService,
        auditService: this.auditService
      }
    );
    
    console.log('✅ Dashboard API initialized');
  }

  /**
   * Setup automated survey triggers
   */
  private async setupAutomatedSurveys(): Promise<void> {
    console.log('🤖 Setting up automated survey triggers...');
    
    // Setup trigger conditions
    const triggers = [
      {
        name: 'post_purchase_7_day',
        condition: 'purchase_completed',
        delay: 7 * 24 * 60 * 60 * 1000, // 7 days
        surveyType: 'post_purchase'
      },
      {
        name: 'feature_usage_heavy',
        condition: 'heavy_feature_usage',
        delay: 0, // immediate
        surveyType: 'feature_feedback'
      },
      {
        name: 'support_resolution',
        condition: 'support_ticket_resolved',
        delay: 24 * 60 * 60 * 1000, // 1 day
        surveyType: 'support_followup'
      },
      {
        name: 'periodic_checkin',
        condition: 'periodic_schedule',
        delay: 30 * 24 * 60 * 60 * 1000, // 30 days
        surveyType: 'periodic_checkin'
      }
    ];
    
    triggers.forEach(trigger => {
      this.surveyTriggers.set(trigger.name, trigger);
    });
    
    // Setup periodic trigger evaluation
    this.automatedSurveyInterval = setInterval(async () => {
      await this.evaluateAutomatedSurveyTriggers();
    }, this.config.metricsUpdateInterval * 60 * 1000);
    
    console.log('✅ Automated survey triggers configured');
  }

  /**
   * Setup real-time tracking
   */
  private async setupRealtimeTracking(): Promise<void> {
    console.log('⚡ Setting up real-time satisfaction tracking...');
    
    // Listen for real-time events
    this.satisfactionTracker.on('survey_recorded', (survey) => {
      this.handleRealtimeSurveyResponse(survey);
    });
    
    this.satisfactionTracker.on('alert_triggered', (alert) => {
      this.handleRealtimeSatisfactionAlert(alert);
    });
    
    console.log('✅ Real-time tracking configured');
  }

  /**
   * Setup integration monitoring
   */
  private async setupIntegrationMonitoring(): Promise<void> {
    console.log('📈 Setting up integration monitoring...');
    
    // Monitor integration health
    setInterval(async () => {
      await this.checkIntegrationHealth();
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    console.log('✅ Integration monitoring configured');
  }

  /**
   * Setup satisfaction event listeners
   */
  private setupSatisfactionEventListeners(): void {
    this.satisfactionTracker.on('survey_recorded', (survey) => {
      console.log(
        `📝 Survey recorded: ${survey.surveyId} (NPS: ${survey.npsScore},
        Satisfaction: ${survey.satisfactionRating}
      )`);
    });
    
    this.satisfactionTracker.on('alert_acknowledged', (alert) => {
      console.log(`✅ Satisfaction alert acknowledged: ${alert.alertId}`);
    });
  }

  // Event handlers

  /**
   * Handle post-purchase survey trigger
   */
  private async handlePostPurchaseTrigger(request: any, reply: any): Promise<any> {
    try {
      const { userId, purchaseId, templateId } = request.body;
      
      const surveyResult = await this.triggerSatisfactionSurvey(
        userId,
        'post_purchase',
        {
          templateId,
          purchaseId,
          userJourneyStage: 'purchase',
          featureUsed: 'marketplace_purchase'
        }
      );
      
      return reply.code(200).send({
        success: true,
        data: surveyResult
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Handle feature usage survey trigger
   */
  private async handleFeatureUsageTrigger(request: any, reply: any): Promise<any> {
    try {
      const { userId, featureName, usageCount } = request.body;
      
      // Only trigger survey for heavy usage
      if (usageCount >= 10) {
        const surveyResult = await this.triggerSatisfactionSurvey(
          userId,
          'feature_feedback',
          {
            featureUsed: featureName,
            usageCount,
            userJourneyStage: 'active_use'
          }
        );
        
        return reply.code(200).send({
          success: true,
          data: surveyResult
        });
      } else {
        return reply.code(200).send({
          success: true,
          message: 'Usage threshold not met for survey trigger'
        });
      }
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Handle support resolution survey trigger
   */
  private async handleSupportResolutionTrigger(request: any, reply: any): Promise<any> {
    try {
      const { userId, ticketId, resolutionType } = request.body;
      
      const surveyResult = await this.triggerSatisfactionSurvey(
        userId,
        'support_followup',
        {
          supportTicketId: ticketId,
          resolutionType,
          userJourneyStage: 'support',
          featureUsed: 'support_system'
        }
      );
      
      return reply.code(200).send({
        success: true,
        data: surveyResult
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Handle survey webhook from external systems
   */
  private async handleSurveyWebhook(webhookData: any): Promise<void> {
    // Process external survey data
    const { userId, responses, source, timestamp } = webhookData;
    
    if (!userId || !responses) {
      throw new Error('Invalid webhook data: missing userId or responses');
    }
    
    // Convert external format to internal satisfaction survey format
    const satisfactionData = {
      surveyType: 'external_integration' as any,
      npsScore: responses.nps || 0,
      satisfactionRating: responses.satisfaction || 0,
      usabilityRating: responses.usability || 0,
      valueRating: responses.value || 0,
      feedback: {
        positiveAspects: responses.positiveAspects || [],
        negativeAspects: responses.negativeAspects || [],
        suggestions: responses.suggestions || [],
        openFeedback: responses.openFeedback
      },
      source: source || 'external_webhook',
      context: {
        featureUsed: responses.feature || 'external_system',
        userJourneyStage: 'active_use' as any,
        sessionDuration: 0,
        userTenure: 0,
        purchaseHistory: 0,
        supportHistory: 0,
        userRole: 'buyer' as any
      }
    };
    
    await this.satisfactionTracker.recordSatisfactionSurvey(userId, satisfactionData);
  }

  /**
   * Handle real-time survey response
   */
  private handleRealtimeSurveyResponse(survey: any): void {
    // Emit real-time event for dashboard updates
    if (this.config.enableRealtimeTracking) {
      // This could integrate with WebSocket or Server-Sent Events
      console.log(`⚡ Real-time satisfaction update: ${survey.satisfactionRating}/5`);
    }
  }

  /**
   * Handle real-time satisfaction alert
   */
  private handleRealtimeSatisfactionAlert(alert: any): void {
    if (this.config.alertingEnabled) {
      console.log(`🚨 Satisfaction alert triggered: ${alert.title} (${alert.severity})`);
      
      // This could integrate with notification systems
      // - Send email alerts
      // - Post to Slack
      // - Trigger webhooks
      // - Update dashboard
    }
  }

  /**
   * Evaluate automated survey triggers
   */
  private async evaluateAutomatedSurveyTriggers(): Promise<void> {
    try {
      // This would contain logic to evaluate trigger conditions
      // and automatically send survey invitations based on user behavior
      
      console.log('🔍 Evaluating automated survey triggers...');
      
      // Example: Check for users who completed purchases 7 days ago
      // Example: Check for users with high feature usage
      // Example: Check for periodic survey scheduling
      
    } catch (error) {
      console.error('Error evaluating automated survey triggers:', error);
    }
  }

  /**
   * Check integration health
   */
  private async checkIntegrationHealth(): Promise<void> {
    try {
      const status = await this.getIntegrationStatus();
      
      // Check for critical issues
      if (status.metrics.criticalAlerts > 0) {
        console.warn(`⚠️  ${status.metrics.criticalAlerts} critical satisfaction alerts active`);
      }
      
      // Check response rates
      if (status.metrics.responseRate < 10) {
        console.warn('⚠️  Low satisfaction survey response rate detected');
      }
      
      // Check overall satisfaction
      if (status.metrics.overallSatisfaction < 70) {
        console.warn(`⚠️  Low overall satisfaction score: ${status.metrics.overallSatisfaction}`);
      }
      
    } catch (error) {
      console.error('Error checking integration health:', error);
    }
  }

  /**
   * Send survey invitation to user
   */
  private async sendSurveyInvitation(
    userId: string,
    surveyId: string,
    surveyType: string
  ): Promise<boolean> {
    try {
      // This would integrate with email/notification systems
      console.log(`📧 Sending survey invitation: ${surveyId} to user ${userId}`);
      
      // For now, just log the invitation
      await this.auditService.logActivity({
        userId: 'system',
        action: 'survey_invitation_sent',
        details: {
          targetUserId: userId,
          surveyId,
          surveyType,
          method: 'email'
        },
        timestamp: new Date()
      } as any);
      
      return true;
    } catch (error) {
      console.error('Error sending survey invitation:', error);
      return false;
    }
  }

  /**
   * Schedule survey invitation
   */
  private async scheduleSurveyInvitation(
    userId: string,
    surveyId: string,
    surveyType: string,
    context: any
  ): Promise<void> {
    // This would integrate with a job queue system to schedule invitations
    console.log(`⏰ Scheduling survey invitation: ${surveyId} for user ${userId}`);
    
    await this.auditService.logActivity({
      userId: 'system',
      action: 'survey_invitation_scheduled',
      details: {
        targetUserId: userId,
        surveyId,
        surveyType,
        context
      },
      timestamp: new Date()
    } as any);
  }
}

/**
 * Factory function to create and initialize satisfaction integration
 */
export async function createSatisfactionIntegration(
  config: SatisfactionIntegrationConfig,
  dependencies: {
    databaseService: DatabaseService;
    redisService: RedisService;
    auditService: AuditService;
  }
): Promise<SatisfactionIntegration> {
  const integration = new SatisfactionIntegration(config, dependencies);
  await integration.initialize();
  return integration;
}

/**
 * Default configuration for satisfaction integration
 */
export };
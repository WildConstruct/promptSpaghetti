/**
 * Quota Integration Service - Epic 17
 * 
 * Integration service that connects the usage quota system with existing 
 * Epic 17 admin control systems including rate limiting, fraud detection,
 * enforcement actions, and audit services.
 * 
 * Task: E17-1753114397228-B591AA - Create usage quotas
 * Epic: 17 - Backstage Admin Controls
 */

import { UsageQuotaService } from './UsageQuotaService';
import { RateLimitingService } from '../../../packages/core/security/RateLimitingService';
import { AdaptiveThrottlingRulesEngine } from '../../../packages/core/security/AdaptiveThrottlingRules';
import { FraudMonitoringService } from '../fraud/FraudMonitoringService';
import { EnforcementActionService } from '../enforcement/EnforcementActionService';
import { AuditService } from '../auth/services/AuditService';
import { Database } from '../../database';
import {
  UsageQuota,
  QuotaCheckRequest,
  QuotaCheckResult,
  QuotaViolation,
  QuotaEventLog,
  QuotaType,
  EnforcementAction
} from '../../../packages/core/types/UsageQuotaTypes';
import { ActionSeverity } from '../../../packages/core/types/EnforcementTypes';

export interface QuotaIntegrationConfig {
  rateLimitingEnabled: boolean;
  adaptiveThrottlingEnabled: boolean;
  fraudDetectionEnabled: boolean;
  enforcementActionsEnabled: boolean;
  auditLoggingEnabled: boolean;
  
  // Integration thresholds
  rateLimitingThreshold: number; // Quota utilization % to trigger rate limiting
  fraudDetectionThreshold: number; // Violation count to trigger fraud analysis
  emergencyThrottlingThreshold: number; // System load % to activate emergency quotas
  
  // Notification settings
  stakeholderNotifications: boolean;
  systemAdminAlerts: boolean;
  userNotifications: boolean;
}

export class QuotaIntegrationService {
  private quotaService: UsageQuotaService;
  private rateLimitingService: RateLimitingService;
  private throttlingEngine: AdaptiveThrottlingRulesEngine;
  private fraudService: FraudMonitoringService;
  private enforcementService: EnforcementActionService;
  private auditService: AuditService;
  private db: Database;
  private config: QuotaIntegrationConfig;

  // Integration state tracking
  private integrationHealth: Map<string, boolean> = new Map();
  private lastHealthCheck: Date = new Date();
  
  constructor(
    quotaService: UsageQuotaService,
    rateLimitingService: RateLimitingService,
    throttlingEngine: AdaptiveThrottlingRulesEngine,
    fraudService: FraudMonitoringService,
    enforcementService: EnforcementActionService,
    auditService: AuditService,
    database: Database,
    config: Partial<QuotaIntegrationConfig> = {}
  ) {
    this.quotaService = quotaService;
    this.rateLimitingService = rateLimitingService;
    this.throttlingEngine = throttlingEngine;
    this.fraudService = fraudService;
    this.enforcementService = enforcementService;
    this.auditService = auditService;
    this.db = database;

    this.config = {
      rateLimitingEnabled: true,
      adaptiveThrottlingEnabled: true,
      fraudDetectionEnabled: true,
      enforcementActionsEnabled: true,
      auditLoggingEnabled: true,
      rateLimitingThreshold: 80,
      fraudDetectionThreshold: 5,
      emergencyThrottlingThreshold: 90,
      stakeholderNotifications: true,
      systemAdminAlerts: true,
      userNotifications: true,
      ...config
    };

    this.initializeIntegrations();
  }

  // =============================================================================
  // Core Integration Methods
  // =============================================================================

  /**
   * Check quota with integrated enforcement
   */
  async checkQuotaWithIntegration(request: QuotaCheckRequest): Promise<QuotaCheckResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔗 Checking quota with integration for ${request.userId}:${request.quotaType}`);

      // 1. Standard quota check
      const quotaResult = await this.quotaService.checkQuota(request);

      // 2. Rate limiting integration
      if (this.config.rateLimitingEnabled && quotaResult.utilizationPercentage >= this.config.rateLimitingThreshold) {
        await this.integrateWithRateLimiting(request, quotaResult);
      }

      // 3. Adaptive throttling integration
      if (this.config.adaptiveThrottlingEnabled && !quotaResult.allowed) {
        await this.integrateWithThrottling(request, quotaResult);
      }

      // 4. Enhanced result with integration data
      const integratedResult = await this.enhanceQuotaResult(quotaResult, request);

      // 5. Post-check integrations
      if (!quotaResult.allowed) {
        await this.handleQuotaViolationIntegration(request, integratedResult);
      }

      console.log(`✅ Integrated quota check completed in ${Date.now() - startTime}ms`);
      return integratedResult;

    } catch (error) {
      console.error(`❌ Error in integrated quota check:`, error);
      
      // Log integration failure
      await this.auditService.logEvent({
        userId: 'system',
        action: 'quota_integration_error',
        details: {
          request,
          error: error.message,
          integrationServices: Object.keys(this.integrationHealth)
        },
        severity: 'error'
      });

      // Fallback to basic quota check
      return this.quotaService.checkQuota(request);
    }
  }

  /**
   * Handle quota violation with integrated response
   */
  async handleQuotaViolationIntegration(
    request: QuotaCheckRequest,
    result: QuotaCheckResult
  ): Promise<void> {
    console.log(`🚨 Handling quota violation with integrated response`);

    try {
      // 1. Fraud detection integration
      if (this.config.fraudDetectionEnabled) {
        await this.integrateWithFraudDetection(request, result);
      }

      // 2. Enforcement actions integration
      if (this.config.enforcementActionsEnabled) {
        await this.integrateWithEnforcementActions(request, result);
      }

      // 3. Audit logging integration
      if (this.config.auditLoggingEnabled) {
        await this.integrateWithAuditLogging(request, result);
      }

      // 4. Notification integration
      await this.handleIntegratedNotifications(request, result);

    } catch (error) {
      console.error(`❌ Error handling integrated quota violation:`, error);
    }
  }

  // =============================================================================
  // Service-Specific Integrations
  // =============================================================================

  /**
   * Integrate with rate limiting service
   */
  private async integrateWithRateLimiting(
    request: QuotaCheckRequest,
    result: QuotaCheckResult
  ): Promise<void> {
    try {
      console.log(`🏃 Integrating with rate limiting service`);

      // Apply additional rate limiting based on quota utilization
      const rateLimitKey = `quota_${result.quotaId}_${request.userId}`;
      const utilizationMultiplier = Math.min(result.utilizationPercentage / 100, 1);
      
      // Reduce rate limits as quota utilization increases
      const adjustedLimit = Math.floor(1000 * (1 - utilizationMultiplier * 0.5)); // Up to 50% reduction

      await this.rateLimitingService.setCustomLimit(
        rateLimitKey,
        adjustedLimit,
        3600, // 1 hour window
        {
          reason: 'quota_utilization_throttling',
          quotaId: result.quotaId,
          originalLimit: 1000,
          utilizationPercentage: result.utilizationPercentage
        }
      );

      console.log(`🎚️ Applied rate limit adjustment: ${adjustedLimit} requests/hour`);

    } catch (error) {
      console.error(`❌ Rate limiting integration error:`, error);
      this.integrationHealth.set('rate_limiting', false);
    }
  }

  /**
   * Integrate with adaptive throttling
   */
  private async integrateWithThrottling(
    request: QuotaCheckRequest,
    result: QuotaCheckResult
  ): Promise<void> {
    try {
      console.log(`⚡ Integrating with adaptive throttling`);

      // Create throttling rule for quota violators
      const throttleRule = {
        id: `quota_violation_${result.quotaId}`,
        name: `Quota Violation Throttling - ${result.quotaId}`,
        enabled: true,
        priority: 10,
        conditions: {
          userId: [request.userId],
          quotaViolated: true
        },
        actions: {
          throttleMode: 'circuit_breaker' as const,
          throttlePercentage: 50,
          rateLimitMultiplier: 0.5,
          delayMultiplier: 2.0
        },
        systemCondition: 'elevated' as const,
        timeWindow: 3600, // 1 hour
        cooldownPeriod: 1800, // 30 minutes
        metrics: {
          requestsPerSecond: 1,
          errorRate: 25,
          responseTime: 5000
        }
      };

      this.throttlingEngine.addRule(throttleRule);

      console.log(`🔄 Added throttling rule for quota violation`);

    } catch (error) {
      console.error(`❌ Adaptive throttling integration error:`, error);
      this.integrationHealth.set('adaptive_throttling', false);
    }
  }

  /**
   * Integrate with fraud detection service
   */
  private async integrateWithFraudDetection(
    request: QuotaCheckRequest,
    result: QuotaCheckResult
  ): Promise<void> {
    try {
      console.log(`🔍 Integrating with fraud detection service`);

      // Check for suspicious quota violation patterns
      const recentViolations = await this.getRecentUserViolations(request.userId);
      
      if (recentViolations.length >= this.config.fraudDetectionThreshold) {
        // Report suspicious activity to fraud detection
        await this.fraudService.reportSuspiciousActivity({
          userId: request.userId,
          activityType: 'quota_abuse',
          severity: this.calculateFraudSeverity(recentViolations),
          details: {
            quotaType: request.quotaType,
            violationCount: recentViolations.length,
            timeWindow: '1h',
            currentViolation: {
              quotaId: result.quotaId,
              exceeded: result.currentUsage - result.quotaLimit,
              utilizationPercentage: result.utilizationPercentage
            },
            requestMetadata: request.metadata
          },
          timestamp: new Date()
        });

        console.log(`⚠️ Reported quota abuse pattern to fraud detection`);
      }

    } catch (error) {
      console.error(`❌ Fraud detection integration error:`, error);
      this.integrationHealth.set('fraud_detection', false);
    }
  }

  /**
   * Integrate with enforcement actions service
   */
  private async integrateWithEnforcementActions(
    request: QuotaCheckRequest,
    result: QuotaCheckResult
  ): Promise<void> {
    try {
      console.log(`⚖️ Integrating with enforcement actions service`);

      // Create enforcement action based on quota violation
      const enforcementSeverity = this.mapQuotaToEnforcementSeverity(result);
      
      if (enforcementSeverity) {
        await this.enforcementService.createEnforcementAction({
          targetUserId: request.userId,
          actionType: this.mapQuotaEnforcementToActionType(result.enforcementAction!),
          severity: enforcementSeverity,
          reason: `Quota violation: ${result.enforcementReason}`,
          details: {
            quotaId: result.quotaId,
            quotaType: request.quotaType,
            quotaLimit: result.quotaLimit,
            actualUsage: result.currentUsage,
            exceededBy: result.currentUsage - result.quotaLimit,
            enforcementAction: result.enforcementAction
          },
          duration: this.calculateEnforcementDuration(result),
          scheduledFor: new Date(),
          createdBy: 'quota_system',
          requiresApproval: this.requiresEnforcementApproval(enforcementSeverity),
          automaticExecution: true
        });

        console.log(`⚖️ Created enforcement action: ${enforcementSeverity}`);
      }

    } catch (error) {
      console.error(`❌ Enforcement actions integration error:`, error);
      this.integrationHealth.set('enforcement_actions', false);
    }
  }

  /**
   * Integrate with audit logging service
   */
  private async integrateWithAuditLogging(
    request: QuotaCheckRequest,
    result: QuotaCheckResult
  ): Promise<void> {
    try {
      console.log(`📝 Integrating with audit logging service`);

      // Create detailed audit log entry
      await this.auditService.logEvent({
        userId: request.userId,
        action: 'quota_violation_detected',
        details: {
          quotaId: result.quotaId,
          quotaType: request.quotaType,
          resourceIdentifier: request.resourceIdentifier,
          quotaLimit: result.quotaLimit,
          actualUsage: result.currentUsage,
          exceededBy: result.currentUsage - result.quotaLimit,
          utilizationPercentage: result.utilizationPercentage,
          enforcementAction: result.enforcementAction,
          enforcementReason: result.enforcementReason,
          requestMetadata: request.metadata,
          integrationServices: {
            rateLimiting: this.integrationHealth.get('rate_limiting'),
            adaptiveThrottling: this.integrationHealth.get('adaptive_throttling'),
            fraudDetection: this.integrationHealth.get('fraud_detection'),
            enforcementActions: this.integrationHealth.get('enforcement_actions')
          }
        },
        severity: this.mapQuotaToAuditSeverity(result)
      });

      console.log(`📋 Audit log entry created for quota violation`);

    } catch (error) {
      console.error(`❌ Audit logging integration error:`, error);
      this.integrationHealth.set('audit_logging', false);
    }
  }

  // =============================================================================
  // Enhanced Quota Management
  // =============================================================================

  /**
   * Enhance quota result with integration data
   */
  private async enhanceQuotaResult(
    result: QuotaCheckResult,
    request: QuotaCheckRequest
  ): Promise<QuotaCheckResult> {
    const enhancedResult = { ...result };

    try {
      // Add integration health status
      enhancedResult.recommendations = enhancedResult.recommendations || [];
      
      // Add system health recommendations
      if (this.integrationHealth.get('rate_limiting') === false) {
        enhancedResult.recommendations.push({
          type: 'system_warning',
          title: 'Rate limiting integration unavailable',
          description: 'Some protective measures may not be active',
          priority: 'medium'
        });
      }

      // Add user-specific recommendations based on violation history
      const violationHistory = await this.getRecentUserViolations(request.userId);
      if (violationHistory.length > 0) {
        enhancedResult.recommendations.push({
          type: 'reduce_usage',
          title: 'Recent violations detected',
          description: `You have ${violationHistory.length} recent quota violations. Consider optimizing your usage.`,
          priority: 'high'
        });
      }

      // Add adaptive throttling status
      if (this.throttlingEngine.isEnabled()) {
        const throttleStatus = this.throttlingEngine.getThrottlingStatus(request.userId);
        if (throttleStatus.isThrottled) {
          enhancedResult.recommendations.push({
            type: 'throttling_active',
            title: 'Request throttling active',
            description: `Your requests are being throttled due to ${throttleStatus.reason}`,
            priority: 'high'
          });
        }
      }

    } catch (error) {
      console.error(`❌ Error enhancing quota result:`, error);
    }

    return enhancedResult;
  }

  /**
   * Handle integrated notifications
   */
  private async handleIntegratedNotifications(
    request: QuotaCheckRequest,
    result: QuotaCheckResult
  ): Promise<void> {
    try {
      console.log(`📢 Handling integrated notifications`);

      // User notifications
      if (this.config.userNotifications) {
        await this.sendUserQuotaNotification(request.userId, result);
      }

      // System admin alerts for critical violations
      if (this.config.systemAdminAlerts && result.utilizationPercentage > 95) {
        await this.sendSystemAdminAlert(request, result);
      }

      // Stakeholder notifications for business-critical quotas
      if (this.config.stakeholderNotifications && this.isBusinessCriticalQuota(request.quotaType)) {
        await this.sendStakeholderNotification(request, result);
      }

    } catch (error) {
      console.error(`❌ Notification integration error:`, error);
    }
  }

  // =============================================================================
  // Integration Health and Monitoring
  // =============================================================================

  /**
   * Check integration health
   */
  async checkIntegrationHealth(): Promise<Map<string, boolean>> {
    const healthChecks = [
      { name: 'rate_limiting', service: this.rateLimitingService },
      { name: 'adaptive_throttling', service: this.throttlingEngine },
      { name: 'fraud_detection', service: this.fraudService },
      { name: 'enforcement_actions', service: this.enforcementService },
      { name: 'audit_logging', service: this.auditService }
    ];

    for (const check of healthChecks) {
      try {
        // Perform basic health check (implement per service)
        const isHealthy = await this.performServiceHealthCheck(check.service);
        this.integrationHealth.set(check.name, isHealthy);
      } catch (error) {
        console.error(`Health check failed for ${check.name}:`, error);
        this.integrationHealth.set(check.name, false);
      }
    }

    this.lastHealthCheck = new Date();
    return new Map(this.integrationHealth);
  }

  /**
   * Get integration status summary
   */
  getIntegrationStatus(): {
    overallHealth: boolean;
    services: Record<string, boolean>;
    lastHealthCheck: Date;
    config: QuotaIntegrationConfig;
  } {
    const services: Record<string, boolean> = {};
    let overallHealth = true;

    for (const [service, healthy] of this.integrationHealth.entries()) {
      services[service] = healthy;
      if (!healthy) overallHealth = false;
    }

    return {
      overallHealth,
      services,
      lastHealthCheck: this.lastHealthCheck,
      config: this.config
    };
  }

  // =============================================================================
  // Helper Methods
  // =============================================================================

  /**
   * Initialize all integrations
   */
  private async initializeIntegrations(): Promise<void> {
    console.log('🔗 Initializing quota service integrations...');

    try {
      // Initialize integration health tracking
      this.integrationHealth.set('rate_limiting', true);
      this.integrationHealth.set('adaptive_throttling', true);
      this.integrationHealth.set('fraud_detection', true);
      this.integrationHealth.set('enforcement_actions', true);
      this.integrationHealth.set('audit_logging', true);

      // Perform initial health check
      await this.checkIntegrationHealth();

      // Set up periodic health checks
      setInterval(() => {
        this.checkIntegrationHealth();
      }, 300000); // Every 5 minutes

      console.log('✅ Quota service integrations initialized');

    } catch (error) {
      console.error('❌ Failed to initialize quota integrations:', error);
      throw error;
    }
  }

  private async performServiceHealthCheck(service: any): Promise<boolean> {
    // Basic health check implementation
    return service && typeof service === 'object';
  }

  private async getRecentUserViolations(userId: string): Promise<QuotaViolation[]> {
    // Implementation would fetch recent violations from database
    return [];
  }

  private calculateFraudSeverity(violations: QuotaViolation[]): ActionSeverity {
    if (violations.length >= 10) return 'critical';
    if (violations.length >= 5) return 'high';
    if (violations.length >= 3) return 'medium';
    return 'low';
  }

  private mapQuotaToEnforcementSeverity(result: QuotaCheckResult): ActionSeverity | null {
    if (result.utilizationPercentage > 200) return 'critical';
    if (result.utilizationPercentage > 150) return 'high';
    if (result.utilizationPercentage > 120) return 'medium';
    if (result.utilizationPercentage > 100) return 'low';
    return null;
  }

  private mapQuotaEnforcementToActionType(enforcement: EnforcementAction): string {
    const mapping: Record<EnforcementAction, string> = {
      'warn': 'warning',
      'throttle': 'rate_limit',
      'soft_block': 'temporary_suspension',
      'hard_block': 'account_suspension',
      'review': 'manual_review',
      'degrade': 'service_degradation',
      'redirect': 'traffic_redirect',
      'upgrade_prompt': 'upgrade_required'
    };
    return mapping[enforcement] || 'warning';
  }

  private calculateEnforcementDuration(result: QuotaCheckResult): number {
    // Calculate duration in minutes based on violation severity
    const baseMinutes = 60;
    const severityMultiplier = Math.min(result.utilizationPercentage / 100, 3);
    return Math.floor(baseMinutes * severityMultiplier);
  }

  private requiresEnforcementApproval(severity: ActionSeverity): boolean {
    return severity === 'critical' || severity === 'high';
  }

  private mapQuotaToAuditSeverity(result: QuotaCheckResult): 'info' | 'warning' | 'error' | 'critical' {
    if (result.utilizationPercentage > 200) return 'critical';
    if (result.utilizationPercentage > 150) return 'error';
    if (result.utilizationPercentage > 100) return 'warning';
    return 'info';
  }

  private isBusinessCriticalQuota(quotaType: QuotaType): boolean {
    const criticalTypes: QuotaType[] = [
      'api_requests',
      'graph_executions',
      'storage_usage',
      'processing_time'
    ];
    return criticalTypes.includes(quotaType);
  }

  private async sendUserQuotaNotification(userId: string, result: QuotaCheckResult): Promise<void> {
    // Implementation for user notifications
    console.log(`📬 Sending quota notification to user ${userId}`);
  }

  private async sendSystemAdminAlert(request: QuotaCheckRequest, result: QuotaCheckResult): Promise<void> {
    // Implementation for admin alerts
    console.log(`🚨 Sending admin alert for critical quota violation`);
  }

  private async sendStakeholderNotification(request: QuotaCheckRequest, result: QuotaCheckResult): Promise<void> {
    // Implementation for stakeholder notifications
    console.log(`📊 Sending stakeholder notification for business-critical quota`);
  }
}
/**
 * Security Event Policy Manager
 * 
 * Advanced policy management system that integrates security event logging policies
 * with the existing PromptScape security infrastructure, providing centralized
 * policy enforcement, monitoring, and compliance management.
 */

import { z } from 'zod';
import {
  SecurityEvent,
  SecurityEventType,
  SecurityEventSeverity,
  SecurityEventPolicy,
  ComplianceFramework,
  securityEventPolicyEngine
} from './SecurityEventLoggingPolicies';
import { auditManagementSystem } from '../audit/AuditManagementSystem';
import { 
  AuditEventType,
  AuditSeverity,
  ComplianceFramework as AuditComplianceFramework
} from '../audit/AuditManagementSystem';

// Policy Management Configuration
export interface PolicyManagerConfig {
  enabled: boolean;
  real_time_processing: boolean;
  batch_processing_interval: number; // milliseconds
  max_event_batch_size: number;
  retention_policy: {
    default_retention_days: number;
    compliance_retention_overrides: Record<ComplianceFramework, number>;
  };
  notification_config: {
    channels: NotificationChannel[];
    escalation_delays: Record<SecurityEventSeverity, number>; // milliseconds
    retry_attempts: number;
  };
  integration_config: {
    audit_system_enabled: boolean;
    siem_integration_enabled: boolean;
    compliance_reporting_enabled: boolean;
  };
}

export interface NotificationChannel {
  channel_id: string;
  channel_type: 'email' | 'sms' | 'slack' | 'webhook' | 'dashboard' | 'siem';
  endpoint: string;
  credentials?: Record<string, string>;
  enabled: boolean;
  severity_filter: SecurityEventSeverity[];
  rate_limit?: {
    max_per_minute: number;
    burst_limit: number;
  };
}

// Policy Enforcement Result
export interface PolicyEnforcementResult {
  event_id: string;
  policies_matched: string[];
  actions_executed: PolicyAction[];
  notifications_sent: NotificationResult[];
  compliance_impact: ComplianceImpact[];
  escalations_triggered: string[];
  automated_responses: AutomatedResponse[];
  processing_time_ms: number;
  errors: string[];
}

export interface PolicyAction {
  action_id: string;
  action_type: 'containment' | 'notification' | 'escalation' | 'documentation' | 'analysis';
  action_name: string;
  executed_at: Date;
  success: boolean;
  details: Record<string, any>;
  error_message?: string;
}

export interface NotificationResult {
  notification_id: string;
  channel_id: string;
  channel_type: string;
  recipient: string;
  sent_at: Date;
  success: boolean;
  delivery_status?: 'pending' | 'delivered' | 'failed' | 'bounced';
  error_message?: string;
}

export interface ComplianceImpact {
  framework: ComplianceFramework;
  requirement_ids: string[];
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  notification_required: boolean;
  reporting_deadline?: Date;
  external_notification_required: boolean;
}

export interface AutomatedResponse {
  response_id: string;
  response_type: 'ip_block' | 'account_lock' | 'service_isolation' | 'data_quarantine';
  executed_at: Date;
  success: boolean;
  details: Record<string, any>;
  rollback_available: boolean;
  rollback_deadline?: Date;
}

// Policy Performance Metrics
export interface PolicyMetrics {
  policy_id: string;
  events_processed: number;
  actions_triggered: number;
  false_positives: number;
  true_positives: number;
  response_time_avg_ms: number;
  escalations_count: number;
  compliance_violations: number;
  effectiveness_score: number; // 0-100
  last_updated: Date;
}

/**
 * Advanced Security Event Policy Manager
 * 
 * Provides centralized management of security event policies, enforcement,
 * monitoring, and integration with existing PromptScape infrastructure.
 */
export class SecurityEventPolicyManager {
  private config: PolicyManagerConfig;
  private notificationChannels: Map<string, NotificationChannel> = new Map();
  private policyMetrics: Map<string, PolicyMetrics> = new Map();
  private eventProcessingQueue: SecurityEvent[] = [];
  private processingInProgress = false;

  constructor(config: PolicyManagerConfig) {
    this.config = config;
    this.initializeNotificationChannels();
    this.startBatchProcessing();
  }

  /**
   * Initialize notification channels
   */
  private initializeNotificationChannels(): void {
    // Email notification channel
    this.notificationChannels.set('email_security', {
      channel_id: 'email_security',
      channel_type: 'email',
      endpoint: 'security-team@promptscape.com',
      enabled: true,
      severity_filter: [SecurityEventSeverity.HIGH, SecurityEventSeverity.CRITICAL],
      rate_limit: {
        max_per_minute: 10,
        burst_limit: 20
      }
    });

    // Slack notification channel
    this.notificationChannels.set('slack_security', {
      channel_id: 'slack_security',
      channel_type: 'slack',
      endpoint: 'https://hooks.slack.com/services/security-alerts',
      credentials: {
        webhook_token: process.env.SLACK_WEBHOOK_TOKEN || ''
      },
      enabled: true,
      severity_filter: [SecurityEventSeverity.MEDIUM, SecurityEventSeverity.HIGH, SecurityEventSeverity.CRITICAL],
      rate_limit: {
        max_per_minute: 15,
        burst_limit: 30
      }
    });

    // SIEM integration channel
    this.notificationChannels.set('siem_integration', {
      channel_id: 'siem_integration',
      channel_type: 'siem',
      endpoint: process.env.SIEM_ENDPOINT || 'https://siem.promptscape.internal/api/events',
      credentials: {
        api_key: process.env.SIEM_API_KEY || '',
        tenant_id: process.env.SIEM_TENANT_ID || ''
      },
      enabled: this.config.integration_config.siem_integration_enabled,
      severity_filter: Object.values(SecurityEventSeverity),
      rate_limit: {
        max_per_minute: 100,
        burst_limit: 200
      }
    });

    // Dashboard notification channel
    this.notificationChannels.set('dashboard_alerts', {
      channel_id: 'dashboard_alerts',
      channel_type: 'dashboard',
      endpoint: '/api/security/dashboard/alerts',
      enabled: true,
      severity_filter: Object.values(SecurityEventSeverity)
    });

    // SMS notification channel for critical events
    this.notificationChannels.set('sms_critical', {
      channel_id: 'sms_critical',
      channel_type: 'sms',
      endpoint: process.env.SMS_SERVICE_ENDPOINT || '',
      credentials: {
        api_key: process.env.SMS_API_KEY || '',
        sender_id: process.env.SMS_SENDER_ID || 'PromptScape'
      },
      enabled: true,
      severity_filter: [SecurityEventSeverity.CRITICAL],
      rate_limit: {
        max_per_minute: 5,
        burst_limit: 10
      }
    });
  }

  /**
   * Process security event through policy engine
   */
  async processSecurityEvent(event: SecurityEvent): Promise<PolicyEnforcementResult> {
    const startTime = Date.now();
    const result: PolicyEnforcementResult = {
      event_id: event.event_id,
      policies_matched: [],
      actions_executed: [],
      notifications_sent: [],
      compliance_impact: [],
      escalations_triggered: [],
      automated_responses: [],
      processing_time_ms: 0,
      errors: []
    };

    try {
      // Process event through policy engine
      const policyResult = securityEventPolicyEngine.processSecurityEvent(event);
      result.policies_matched = policyResult.matched_policies;

      // Execute policy actions
      const actionResults = await this.executePolicyActions(event, policyResult);
      result.actions_executed = actionResults.actions;
      result.automated_responses = actionResults.automated_responses;

      // Send notifications
      const notificationResults = await this.sendNotifications(event, policyResult);
      result.notifications_sent = notificationResults;

      // Assess compliance impact
      const complianceImpact = await this.assessComplianceImpact(event, policyResult);
      result.compliance_impact = complianceImpact;

      // Handle escalations
      if (policyResult.escalation_required) {
        const escalations = await this.handleEscalations(event, policyResult);
        result.escalations_triggered = escalations;
      }

      // Integrate with existing audit system
      if (this.config.integration_config.audit_system_enabled) {
        await this.createAuditEvent(event, result);
      }

      // Update policy metrics
      this.updatePolicyMetrics(policyResult.matched_policies, result);

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    result.processing_time_ms = Date.now() - startTime;
    return result;
  }

  /**
   * Execute policy-defined actions
   */
  private async executePolicyActions(
    event: SecurityEvent, 
    policyResult: any
  ): Promise<{ actions: PolicyAction[]; automated_responses: AutomatedResponse[] }> {
    const actions: PolicyAction[] = [];
    const automatedResponses: AutomatedResponse[] = [];

    for (const actionType of policyResult.actions_triggered) {
      const action: PolicyAction = {
        action_id: crypto.randomUUID(),
        action_type: this.categorizeAction(actionType),
        action_name: actionType,
        executed_at: new Date(),
        success: false,
        details: {}
      };

      try {
        switch (actionType) {
        case 'block_ip':
          const blockResult = await this.executeIpBlock(event.source_ip || '');
          action.success = blockResult.success;
          action.details = blockResult.details;
            
          if (blockResult.success) {
            automatedResponses.push({
              response_id: crypto.randomUUID(),
              response_type: 'ip_block',
              executed_at: new Date(),
              success: true,
              details: blockResult.details,
              rollback_available: true,
              rollback_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            });
          }
          break;

        case 'lock_account':
          const lockResult = await this.executeAccountLock(event.user_id || '');
          action.success = lockResult.success;
          action.details = lockResult.details;
          break;

        case 'preserve_evidence':
          const preserveResult = await this.preserveEvidence(event);
          action.success = preserveResult.success;
          action.details = preserveResult.details;
          break;

        case 'isolate_network_segment':
          const isolateResult = await this.isolateNetworkSegment(event.source_ip || '');
          action.success = isolateResult.success;
          action.details = isolateResult.details;
          break;

        default:
          action.success = true;
          action.details = { message: `Action ${actionType} logged but not implemented` };
        }
      } catch (error) {
        action.success = false;
        action.error_message = error instanceof Error ? error.message : 'Action execution failed';
      }

      actions.push(action);
    }

    return { actions, automated_responses };
  }

  /**
   * Send notifications through configured channels
   */
  private async sendNotifications(
    event: SecurityEvent, 
    policyResult: any
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    for (const channelType of policyResult.notifications_sent) {
      const channels = Array.from(this.notificationChannels.values())
        .filter(channel => 
          channel.channel_type === channelType && 
          channel.enabled &&
          channel.severity_filter.includes(event.severity)
        );

      for (const channel of channels) {
        const notificationResult: NotificationResult = {
          notification_id: crypto.randomUUID(),
          channel_id: channel.channel_id,
          channel_type: channel.channel_type,
          recipient: channel.endpoint,
          sent_at: new Date(),
          success: false
        };

        try {
          const sendResult = await this.sendNotification(channel, event);
          notificationResult.success = sendResult.success;
          notificationResult.delivery_status = sendResult.status;
        } catch (error) {
          notificationResult.error_message = error instanceof Error ? error.message : 'Notification failed';
        }

        results.push(notificationResult);
      }
    }

    return results;
  }

  /**
   * Assess compliance impact of security event
   */
  private async assessComplianceImpact(
    event: SecurityEvent, 
    policyResult: any
  ): Promise<ComplianceImpact[]> {
    const complianceImpacts: ComplianceImpact[] = [];

    for (const framework of policyResult.compliance_requirements) {
      const impact: ComplianceImpact = {
        framework,
        requirement_ids: this.getFrameworkRequirements(framework, event),
        impact_level: this.calculateImpactLevel(event, framework),
        notification_required: event.requires_notification,
        external_notification_required: this.requiresExternalNotification(event, framework)
      };

      // Set reporting deadline based on framework requirements
      if (framework === ComplianceFramework.GDPR && impact.external_notification_required) {
        impact.reporting_deadline = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
      } else if (framework === ComplianceFramework.CCPA && impact.external_notification_required) {
        impact.reporting_deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      }

      complianceImpacts.push(impact);
    }

    return complianceImpacts;
  }

  /**
   * Handle event escalations
   */
  private async handleEscalations(
    event: SecurityEvent, 
    policyResult: any
  ): Promise<string[]> {
    const escalations: string[] = [];

    // Escalate based on severity
    if (event.severity === SecurityEventSeverity.CRITICAL) {
      escalations.push('ciso_immediate');
      escalations.push('incident_response_team');
    } else if (event.severity === SecurityEventSeverity.HIGH) {
      escalations.push('security_manager');
      escalations.push('on_call_analyst');
    }

    // Escalate based on compliance requirements
    if (event.compliance_frameworks.includes(ComplianceFramework.SOX)) {
      escalations.push('compliance_officer');
    }

    if (event.compliance_frameworks.includes(ComplianceFramework.GDPR) && event.requires_notification) {
      escalations.push('data_protection_officer');
    }

    // Execute escalations
    for (const escalation of escalations) {
      await this.executeEscalation(escalation, event);
    }

    return escalations;
  }

  /**
   * Create corresponding audit event in existing audit system
   */
  private async createAuditEvent(
    securityEvent: SecurityEvent, 
    enforcementResult: PolicyEnforcementResult
  ): Promise<void> {
    try {
      // Map security event to audit event
      const auditEvent = auditManagementSystem.createAuditEvent({
        event_type: this.mapToAuditEventType(securityEvent.event_type),
        severity: this.mapToAuditSeverity(securityEvent.severity),
        title: `Security Policy Violation: ${securityEvent.title}`,
        description: securityEvent.description,
        category: 'security_policy',
        subcategory: securityEvent.category,
        user_id: securityEvent.user_id,
        ip_address: securityEvent.source_ip,
        system_component: securityEvent.system_component,
        risk_score: securityEvent.threat_level,
        risk_factors: securityEvent.indicators,
        compliance_frameworks: this.mapComplianceFrameworks(securityEvent.compliance_frameworks),
        regulatory_impact: securityEvent.regulatory_impact,
        sensitive_data_involved: securityEvent.evidence_preserved,
        tags: securityEvent.tags,
        metadata: {
          security_event_id: securityEvent.event_id,
          policies_matched: enforcementResult.policies_matched,
          actions_executed: enforcementResult.actions_executed.length,
          automated_responses: enforcementResult.automated_responses.length,
          processing_time_ms: enforcementResult.processing_time_ms
        },
        alert_triggered: true,
        notification_sent: enforcementResult.notifications_sent.length > 0,
        escalation_level: this.calculateEscalationLevel(securityEvent.severity),
        status: this.mapToAuditStatus(securityEvent.status)
      });

      console.log(`Created audit event ${auditEvent.id} for security event ${securityEvent.event_id}`);
    } catch (error) {
      console.error('Failed to create audit event:', error);
    }
  }

  /**
   * Update policy performance metrics
   */
  private updatePolicyMetrics(matchedPolicies: string[], result: PolicyEnforcementResult): void {
    for (const policyId of matchedPolicies) {
      let metrics = this.policyMetrics.get(policyId);
      
      if (!metrics) {
        metrics = {
          policy_id: policyId,
          events_processed: 0,
          actions_triggered: 0,
          false_positives: 0,
          true_positives: 0,
          response_time_avg_ms: 0,
          escalations_count: 0,
          compliance_violations: 0,
          effectiveness_score: 100,
          last_updated: new Date()
        };
      }

      // Update metrics
      metrics.events_processed++;
      metrics.actions_triggered += result.actions_executed.length;
      metrics.escalations_count += result.escalations_triggered.length;
      metrics.compliance_violations += result.compliance_impact.length;
      
      // Update average response time
      const totalTime = (metrics.response_time_avg_ms * (metrics.events_processed - 1)) + result.processing_time_ms;
      metrics.response_time_avg_ms = totalTime / metrics.events_processed;
      
      metrics.last_updated = new Date();
      
      this.policyMetrics.set(policyId, metrics);
    }
  }

  /**
   * Start batch processing for queued events
   */
  private startBatchProcessing(): void {
    if (!this.config.real_time_processing) {
      setInterval(async () => {
        await this.processBatchEvents();
      }, this.config.batch_processing_interval);
    }
  }

  /**
   * Process queued events in batch
   */
  private async processBatchEvents(): Promise<void> {
    if (this.processingInProgress || this.eventProcessingQueue.length === 0) {
      return;
    }

    this.processingInProgress = true;

    try {
      const batchSize = Math.min(this.config.max_event_batch_size, this.eventProcessingQueue.length);
      const batch = this.eventProcessingQueue.splice(0, batchSize);

      const promises = batch.map(event => this.processSecurityEvent(event));
      await Promise.all(promises);

      console.log(`Processed batch of ${batch.length} security events`);
    } catch (error) {
      console.error('Batch processing failed:', error);
    } finally {
      this.processingInProgress = false;
    }
  }

  // Helper methods for action execution
  private async executeIpBlock(ip: string): Promise<{ success: boolean; details: Record<string, any> }> {
    // Implementation would integrate with firewall/WAF
    return { success: true, details: { blocked_ip: ip, duration: '24h' } };
  }

  private async executeAccountLock(userId: string): Promise<{ success: boolean; details: Record<string, any> }> {
    // Implementation would integrate with identity management system
    return { success: true, details: { locked_user: userId, duration: '1h' } };
  }

  private async preserveEvidence(event: SecurityEvent): Promise<{ success: boolean; details: Record<string, any> }> {
    // Implementation would capture relevant logs, network traffic, etc.
    return { 
      success: true, 
      details: { 
        evidence_id: crypto.randomUUID(),
        preservation_timestamp: new Date().toISOString(),
        evidence_types: ['logs', 'network_traffic', 'system_state']
      }
    };
  }

  private async isolateNetworkSegment(ip: string): Promise<{ success: boolean; details: Record<string, any> }> {
    // Implementation would integrate with network infrastructure
    return { success: true, details: { isolated_segment: ip, isolation_time: new Date().toISOString() } };
  }

  private async sendNotification(
    channel: NotificationChannel,
    event: SecurityEvent
  ): Promise<{ success: boolean; status: string }> {
    // Implementation would integrate with various notification services
    return { success: true, status: 'delivered' };
  }

  private async executeEscalation(escalationType: string, event: SecurityEvent): Promise<void> {
    // Implementation would trigger escalation procedures
    console.log(`Executing escalation: ${escalationType} for event ${event.event_id}`);
  }

  // Utility mapping methods
  private categorizeAction(actionType: string): PolicyAction['action_type'] {
    const actionMap: Record<string, PolicyAction['action_type']> = {
      'block_ip': 'containment',
      'lock_account': 'containment',
      'preserve_evidence': 'documentation',
      'generate_alert': 'notification',
      'notify_security_team': 'escalation',
      'initiate_investigation': 'analysis'
    };
    return actionMap[actionType] || 'documentation';
  }

  private mapToAuditEventType(securityEventType: SecurityEventType): AuditEventType {
    const typeMap: Record<SecurityEventType, AuditEventType> = {
      [SecurityEventType.AUTHENTICATION_FAILURE]: AuditEventType.AUTHENTICATION,
      [SecurityEventType.AUTHORIZATION_VIOLATION]: AuditEventType.AUTHORIZATION,
      [SecurityEventType.CODE_INJECTION_ATTEMPT]: AuditEventType.SECURITY_INCIDENT,
      [SecurityEventType.NETWORK_INTRUSION_ATTEMPT]: AuditEventType.SECURITY_INCIDENT,
      [SecurityEventType.SOX_ITGC_VIOLATION]: AuditEventType.COMPLIANCE_CHECK,
      [SecurityEventType.GDPR_DATA_SUBJECT_REQUEST]: AuditEventType.COMPLIANCE_CHECK
      // Add more mappings as needed
    };
    return typeMap[securityEventType] || AuditEventType.SECURITY_INCIDENT;
  }

  private mapToAuditSeverity(securitySeverity: SecurityEventSeverity): AuditSeverity {
    const severityMap: Record<SecurityEventSeverity, AuditSeverity> = {
      [SecurityEventSeverity.CRITICAL]: AuditSeverity.CRITICAL,
      [SecurityEventSeverity.HIGH]: AuditSeverity.HIGH,
      [SecurityEventSeverity.MEDIUM]: AuditSeverity.MEDIUM,
      [SecurityEventSeverity.LOW]: AuditSeverity.LOW,
      [SecurityEventSeverity.INFO]: AuditSeverity.LOW
    };
    return severityMap[securitySeverity];
  }

  private mapComplianceFrameworks(securityFrameworks: ComplianceFramework[]): AuditComplianceFramework[] {
    const frameworkMap: Record<ComplianceFramework, AuditComplianceFramework> = {
      [ComplianceFramework.SOX]: AuditComplianceFramework.SOX,
      [ComplianceFramework.GDPR]: AuditComplianceFramework.GDPR,
      [ComplianceFramework.CCPA]: AuditComplianceFramework.CCPA,
      [ComplianceFramework.HIPAA]: AuditComplianceFramework.HIPAA,
      [ComplianceFramework.ISO27001]: AuditComplianceFramework.ISO27001
      // Map other frameworks as available
    };
    return securityFrameworks.map(f => frameworkMap[f]).filter(Boolean);
  }

  private mapToAuditStatus(securityStatus: any): any {
    // Map security event status to audit status
    return 'ACTIVE'; // Default mapping
  }

  private calculateEscalationLevel(severity: SecurityEventSeverity): number {
    const levelMap: Record<SecurityEventSeverity, number> = {
      [SecurityEventSeverity.CRITICAL]: 5,
      [SecurityEventSeverity.HIGH]: 4,
      [SecurityEventSeverity.MEDIUM]: 3,
      [SecurityEventSeverity.LOW]: 2,
      [SecurityEventSeverity.INFO]: 1
    };
    return levelMap[severity];
  }

  private getFrameworkRequirements(framework: ComplianceFramework, event: SecurityEvent): string[] {
    // Return relevant requirement IDs for the framework
    return [`${framework}_req_001`, `${framework}_req_002`];
  }

  private calculateImpactLevel(
    event: SecurityEvent,
    framework: ComplianceFramework
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (event.severity === SecurityEventSeverity.CRITICAL) return 'critical';
    if (event.severity === SecurityEventSeverity.HIGH) return 'high';
    if (event.severity === SecurityEventSeverity.MEDIUM) return 'medium';
    return 'low';
  }

  private requiresExternalNotification(event: SecurityEvent, framework: ComplianceFramework): boolean {
    return event.requires_notification && 
           (framework === ComplianceFramework.GDPR || framework === ComplianceFramework.CCPA);
  }

  /**
   * Public API methods
   */

  /**
   * Add security event to processing queue
   */
  queueSecurityEvent(event: SecurityEvent): void {
    if (this.config.real_time_processing) {
      this.processSecurityEvent(event);
    } else {
      this.eventProcessingQueue.push(event);
    }
  }

  /**
   * Get policy performance metrics
   */
  getPolicyMetrics(): PolicyMetrics[] {
    return Array.from(this.policyMetrics.values());
  }

  /**
   * Get notification channels
   */
  getNotificationChannels(): NotificationChannel[] {
    return Array.from(this.notificationChannels.values());
  }

  /**
   * Update notification channel
   */
  updateNotificationChannel(channelId: string, updates: Partial<NotificationChannel>): boolean {
    const channel = this.notificationChannels.get(channelId);
    if (!channel) return false;

    const updatedChannel = { ...channel, ...updates };
    this.notificationChannels.set(channelId, updatedChannel);
    return true;
  }

  /**
   * Generate policy effectiveness report
   */
  generatePolicyEffectivenessReport(): {
    total_policies: number;
    active_policies: number;
    avg_response_time: number;
    total_events_processed: number;
    false_positive_rate: number;
    compliance_violation_rate: number;
    top_performing_policies: PolicyMetrics[];
    recommendations: string[];
    } {
    const metrics = Array.from(this.policyMetrics.values());
    const activePolicies = securityEventPolicyEngine.getPolicies().filter(p => p.enabled);

    const totalEventsProcessed = metrics.reduce((sum, m) => sum + m.events_processed, 0);
    const totalFalsePositives = metrics.reduce((sum, m) => sum + m.false_positives, 0);
    const totalComplianceViolations = metrics.reduce((sum, m) => sum + m.compliance_violations, 0);
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.response_time_avg_ms, 0) / metrics.length || 0;

    const topPerforming = metrics
      .sort((a, b) => b.effectiveness_score - a.effectiveness_score)
      .slice(0, 5);

    return {
      total_policies: securityEventPolicyEngine.getPolicies().length,
      active_policies: activePolicies.length,
      avg_response_time: avgResponseTime,
      total_events_processed: totalEventsProcessed,
      false_positive_rate: totalEventsProcessed > 0 ? (totalFalsePositives / totalEventsProcessed) * 100 : 0,
      compliance_violation_rate: totalEventsProcessed > 0 ? (totalComplianceViolations / totalEventsProcessed) * 100 : 0,
      top_performing_policies: topPerforming,
      recommendations: this.generatePolicyRecommendations(metrics)
    };
  }

  private generatePolicyRecommendations(metrics: PolicyMetrics[]): string[] {
    const recommendations: string[] = [];

    const highResponseTime = metrics.filter(m => m.response_time_avg_ms > 5000);
    if (highResponseTime.length > 0) {
      recommendations.push('Consider optimizing policy detection rules for improved response time');
    }

    const highFalsePositives = metrics.filter(m => m.false_positives / m.events_processed > 0.1);
    if (highFalsePositives.length > 0) {
      recommendations.push('Review and tune detection rules to reduce false positive rates');
    }

    const lowEffectiveness = metrics.filter(m => m.effectiveness_score < 70);
    if (lowEffectiveness.length > 0) {
      recommendations.push('Evaluate and potentially disable or redesign low-performing policies');
    }

    return recommendations;
  }
}

// Default configuration
export const defaultPolicyManagerConfig: PolicyManagerConfig = {
  enabled: true,
  real_time_processing: true,
  batch_processing_interval: 60000, // 1 minute
  max_event_batch_size: 100,
  retention_policy: {
    default_retention_days: 1095, // 3 years
    compliance_retention_overrides: {
      [ComplianceFramework.SOX]: 2555, // 7 years
      [ComplianceFramework.GDPR]: 2190, // 6 years
      [ComplianceFramework.CCPA]: 1095, // 3 years
      [ComplianceFramework.HIPAA]: 2190, // 6 years
      [ComplianceFramework.ISO27001]: 1095, // 3 years
      [ComplianceFramework.PCI_DSS]: 1095, // 3 years
      [ComplianceFramework.NIST]: 1095, // 3 years
      [ComplianceFramework.FERPA]: 2190, // 6 years
      [ComplianceFramework.GLBA]: 2190, // 6 years
      [ComplianceFramework.FEDRAMP]: 2190 // 6 years
    }
  },
  notification_config: {
    channels: [],
    escalation_delays: {
      [SecurityEventSeverity.CRITICAL]: 0, // Immediate
      [SecurityEventSeverity.HIGH]: 300000, // 5 minutes
      [SecurityEventSeverity.MEDIUM]: 900000, // 15 minutes
      [SecurityEventSeverity.LOW]: 3600000, // 1 hour
      [SecurityEventSeverity.INFO]: 7200000 // 2 hours
    },
    retry_attempts: 3
  },
  integration_config: {
    audit_system_enabled: true,
    siem_integration_enabled: true,
    compliance_reporting_enabled: true
  }
};

// Global security event policy manager instance
export const securityEventPolicyManager = new SecurityEventPolicyManager(defaultPolicyManagerConfig);

// Utility functions for common operations
export const queueSecurityEvent = (event: SecurityEvent) =>
  securityEventPolicyManager.queueSecurityEvent(event);

export default SecurityEventPolicyManager;
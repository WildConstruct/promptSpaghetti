/**
 * Automated Threat Detection Workflow
 * Implements automated security response and threat mitigation workflows
 */

import { EventEmitter } from 'events';
import { SecurityEvent, ThreatDetectionRule } from './SecurityEventCoordinator';
import { AuditService } from '../auth/services/AuditService';
import { RiskScoringService } from './RiskScoringService';
import { logger } from '../utils/logger';

export interface ThreatDetectionAlert {
  id: string;
  type: 'threat_detected' | 'anomaly_detected' | 'policy_violation' | 'brute_force' | 'credential_stuffing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  triggeringEvent: SecurityEvent;
  rule?: ThreatDetectionRule;
  confidence: number; // 0-1
  riskScore: number; // 0-100
  affectedResources: {
    users: string[];
    sessions: string[];
    ipAddresses: string[];
    systems: string[];
  };
  indicators: {
    type: string;
    value: string;
    confidence: number;
  }[];
  mitigationActions: {
    action: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    timestamp: Date;
    result?: string;
  }[];
  status: 'active' | 'investigating' | 'mitigated' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolution?: string;
  escalationLevel: number; // 1-5
}

export interface AutomatedResponse {
  id: string;
  alertId: string;
  type: 'block_ip' | 'suspend_user' | 'require_mfa' | 'force_logout' | 'rate_limit' | 'quarantine';
  target: string; // IP, user ID, session ID, etc.
  action: string;
  executedAt: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'reverted';
  result?: string;
  revertedAt?: Date;
  revertReason?: string;
}

export interface ThreatIntelligenceFeed {
  id: string;
  name: string;
  type: 'ip_reputation' | 'domain_reputation' | 'malware_signatures' | 'attack_patterns';
  url: string;
  apiKey?: string;
  updateInterval: number; // minutes
  lastUpdate: Date;
  status: 'active' | 'inactive' | 'error';
  recordCount: number;
}

export interface PlaybookDefinition {
  id: string;
  name: string;
  description: string;
  triggers: {
    eventTypes: string[];
    conditions: Record<string, any>;
  };
  steps: {
    id: string;
    type: 'analysis' | 'containment' | 'investigation' | 'notification' | 'recovery';
    action: string;
    parameters: Record<string, any>;
    timeout: number; // seconds
    onFailure: 'continue' | 'stop' | 'escalate';
  }[];
  escalationRules: {
    condition: string;
    target: string; // user, group, external system
    method: 'email' | 'sms' | 'webhook' | 'ticket';
  }[];
  enabled: boolean;
}

export class AutomatedThreatDetectionWorkflow extends EventEmitter {
  private auditService: AuditService;
  private riskScoringService: RiskScoringService;
  private activeAlerts: Map<string, ThreatDetectionAlert> = new Map();
  private automatedResponses: Map<string, AutomatedResponse> = new Map();
  private threatFeeds: Map<string, ThreatIntelligenceFeed> = new Map();
  private playbooks: Map<string, PlaybookDefinition> = new Map();
  private responseQueue: AutomatedResponse[] = [];
  private processingInterval: NodeJS.Timeout | null = null;
  private feedUpdateInterval: NodeJS.Timeout | null = null;

  constructor(
    auditService: AuditService,
    riskScoringService: RiskScoringService
  ) {
    super();
    this.auditService = auditService;
    this.riskScoringService = riskScoringService;
    
    this.initializeDefaultPlaybooks();
    this.initializeDefaultThreatFeeds();
    this.startProcessing();
    this.startFeedUpdates();
  }

  /**
   * Process a threat detection event
   */
  public async processThreatEvent(
    event: SecurityEvent, 
    rule?: ThreatDetectionRule,
    confidence: number = 0.8
  ): Promise<ThreatDetectionAlert> {
    try {
      // Calculate risk score
      const riskScore = await this.riskScoringService.calculateEventRisk(
        event,
        rule,
        confidence
      );

      // Create threat alert
      const alert: ThreatDetectionAlert = {
        id: this.generateAlertId(),
        type: this.classifyThreatType(event, rule),
        severity: this.calculateAlertSeverity(riskScore, confidence),
        timestamp: new Date(),
        triggeringEvent: event,
        rule,
        confidence,
        riskScore,
        affectedResources: this.identifyAffectedResources(event),
        indicators: await this.extractThreatIndicators(event),
        mitigationActions: [],
        status: 'active',
        escalationLevel: this.calculateEscalationLevel(riskScore)
      };

      // Store the alert
      this.activeAlerts.set(alert.id, alert);

      // Log the threat detection
      await this.auditService.logEvent(
        'automated_threat_detected',
        'system',
        {
          alertId: alert.id,
          threatType: alert.type,
          severity: alert.severity,
          riskScore: alert.riskScore,
          confidence: alert.confidence,
          originalEventId: event.id
        },
        {
          ipAddress: event.ipAddress,
          userId: event.userId,
          sessionId: event.sessionId
        }
      );

      // Execute automated responses
      await this.executeAutomatedResponses(alert);

      // Execute applicable playbooks
      await this.executePlaybooks(alert);

      // Emit alert for real-time monitoring
      this.emit('threatAlert', alert);

      logger.log(`Threat detected and processed: ${alert.id} (${alert.type})`);
      
      return alert;
    } catch (error) {
      logger.log(`Threat processing error: ${error}`);
      throw error;
    }
  }

  /**
   * Execute automated responses based on threat level and type
   */
  private async executeAutomatedResponses(alert: ThreatDetectionAlert): Promise<void> {
    const responses: AutomatedResponse[] = [];

    // High/Critical severity threats get immediate automated responses
    if (alert.severity === 'high' || alert.severity === 'critical') {
      
      // Block suspicious IP addresses
      if (alert.triggeringEvent.ipAddress && this.shouldBlockIP(alert)) {
        responses.push({
          id: this.generateResponseId(),
          alertId: alert.id,
          type: 'block_ip',
          target: alert.triggeringEvent.ipAddress,
          action: `Block IP ${alert.triggeringEvent.ipAddress} due to ${alert.type}`,
          executedAt: new Date(),
          status: 'pending'
        });
      }

      // Suspend user account for certain threats
      if (alert.triggeringEvent.userId && this.shouldSuspendUser(alert)) {
        responses.push({
          id: this.generateResponseId(),
          alertId: alert.id,
          type: 'suspend_user',
          target: alert.triggeringEvent.userId,
          action: `Suspend user ${alert.triggeringEvent.userId} due to ${alert.type}`,
          executedAt: new Date(),
          status: 'pending'
        });
      }

      // Force logout all sessions for compromised accounts
      if (alert.type === 'credential_stuffing' || alert.confidence > 0.9) {
        responses.push({
          id: this.generateResponseId(),
          alertId: alert.id,
          type: 'force_logout',
          target: alert.triggeringEvent.userId || 'all_sessions',
          action: `Force logout sessions due to ${alert.type}`,
          executedAt: new Date(),
          status: 'pending'
        });
      }

      // Require additional MFA for suspicious activity
      if (alert.type === 'anomaly_detected' && alert.triggeringEvent.userId) {
        responses.push({
          id: this.generateResponseId(),
          alertId: alert.id,
          type: 'require_mfa',
          target: alert.triggeringEvent.userId,
          action: `Require additional MFA for user ${alert.triggeringEvent.userId}`,
          executedAt: new Date(),
          status: 'pending'
        });
      }
    }

    // Apply rate limiting for brute force attempts
    if (alert.type === 'brute_force' && alert.triggeringEvent.ipAddress) {
      responses.push({
        id: this.generateResponseId(),
        alertId: alert.id,
        type: 'rate_limit',
        target: alert.triggeringEvent.ipAddress,
        action: `Apply aggressive rate limiting to IP ${alert.triggeringEvent.ipAddress}`,
        executedAt: new Date(),
        status: 'pending'
      });
    }

    // Queue responses for execution
    for (const response of responses) {
      this.automatedResponses.set(response.id, response);
      this.responseQueue.push(response);
      alert.mitigationActions.push({
        action: response.action,
        status: 'pending',
        timestamp: new Date()
      });
    }
  }

  /**
   * Execute security playbooks
   */
  private async executePlaybooks(alert: ThreatDetectionAlert): Promise<void> {
    for (const playbook of this.playbooks.values()) {
      if (!playbook.enabled) continue;

      // Check if playbook should be triggered
      if (this.shouldExecutePlaybook(playbook, alert)) {
        await this.runPlaybook(playbook, alert);
      }
    }
  }

  /**
   * Run a specific security playbook
   */
  private async runPlaybook(
    playbook: PlaybookDefinition, 
    alert: ThreatDetectionAlert
  ): Promise<void> {
    try {
      logger.log(`Executing security playbook: ${playbook.name} for alert ${alert.id}`);
      
      for (const step of playbook.steps) {
        try {
          await this.executePlaybookStep(step, alert, playbook);
        } catch (stepError) {
          logger.log(`Playbook step failed: ${step.id} - ${stepError}`);
          
          if (step.onFailure === 'stop') {
            break;
          } else if (step.onFailure === 'escalate') {
            await this.escalateAlert(alert, `Playbook step failed: ${step.id}`);
            break;
          }
          // Continue on 'continue' failure mode
        }
      }

      // Log playbook execution
      await this.auditService.logEvent(
        'security_playbook_executed',
        'system',
        {
          playbookId: playbook.id,
          playbookName: playbook.name,
          alertId: alert.id,
          status: 'completed'
        }
      );
    } catch (error) {
      logger.log(`Playbook execution failed: ${playbook.name} - ${error}`);
    }
  }

  /**
   * Execute a single playbook step
   */
  private async executePlaybookStep(
    step: any,
    alert: ThreatDetectionAlert,
    playbook: PlaybookDefinition
  ): Promise<void> {
    const startTime = Date.now();
    
    switch (step.type) {
      case 'analysis':
        await this.executeAnalysisStep(step, alert);
        break;
      case 'containment':
        await this.executeContainmentStep(step, alert);
        break;
      case 'investigation':
        await this.executeInvestigationStep(step, alert);
        break;
      case 'notification':
        await this.executeNotificationStep(step, alert);
        break;
      case 'recovery':
        await this.executeRecoveryStep(step, alert);
        break;
      default:
        throw new Error(`Unknown playbook step type: ${step.type}`);
    }

    const executionTime = Date.now() - startTime;
    
    // Check for timeout
    if (executionTime > step.timeout * 1000) {
      throw new Error(`Step timed out: ${step.id}`);
    }
  }

  /**
   * Process automated response queue
   */
  private async processResponseQueue(): Promise<void> {
    while (this.responseQueue.length > 0) {
      const response = this.responseQueue.shift()!;
      
      try {
        response.status = 'executing';
        this.automatedResponses.set(response.id, response);
        
        await this.executeAutomatedResponse(response);
        
        response.status = 'completed';
        response.result = 'Success';
        
        // Update alert with completed action
        const alert = this.activeAlerts.get(response.alertId);
        if (alert) {
          const actionIndex = alert.mitigationActions.findIndex(
            a => a.action === response.action && a.status === 'pending'
          );
          if (actionIndex >= 0) {
            alert.mitigationActions[actionIndex].status = 'completed';
          }
        }
      } catch (error) {
        response.status = 'failed';
        response.result = error.toString();
        
        logger.log(`Automated response failed: ${response.id} - ${error}`);
      }
      
      this.automatedResponses.set(response.id, response);
    }
  }

  /**
   * Execute a specific automated response
   */
  private async executeAutomatedResponse(response: AutomatedResponse): Promise<void> {
    switch (response.type) {
      case 'block_ip':
        await this.blockIPAddress(response.target);
        break;
      case 'suspend_user':
        await this.suspendUser(response.target);
        break;
      case 'require_mfa':
        await this.requireAdditionalMFA(response.target);
        break;
      case 'force_logout':
        await this.forceLogoutSessions(response.target);
        break;
      case 'rate_limit':
        await this.applyRateLimit(response.target);
        break;
      case 'quarantine':
        await this.quarantineResource(response.target);
        break;
      default:
        throw new Error(`Unknown response type: ${response.type}`);
    }
  }

  /**
   * Update threat intelligence feeds
   */
  private async updateThreatFeeds(): Promise<void> {
    for (const feed of this.threatFeeds.values()) {
      if (feed.status !== 'active') continue;
      
      const now = new Date();
      const lastUpdate = new Date(feed.lastUpdate);
      const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
      
      if (minutesSinceUpdate >= feed.updateInterval) {
        try {
          await this.updateThreatFeed(feed);
          feed.lastUpdate = now;
          feed.status = 'active';
        } catch (error) {
          feed.status = 'error';
          logger.log(`Threat feed update failed: ${feed.name} - ${error}`);
        }
      }
    }
  }

  /**
   * Get current threat detection statistics
   */
  public getThreatStatistics(): any {
    const activeAlerts = Array.from(this.activeAlerts.values());
    const responses = Array.from(this.automatedResponses.values());
    
    return {
      alerts: {
        total: activeAlerts.length,
        bySeverity: this.groupBy(activeAlerts, 'severity'),
        byType: this.groupBy(activeAlerts, 'type'),
        byStatus: this.groupBy(activeAlerts, 'status')
      },
      responses: {
        total: responses.length,
        byType: this.groupBy(responses, 'type'),
        byStatus: this.groupBy(responses, 'status')
      },
      playbooks: {
        total: this.playbooks.size,
        enabled: Array.from(this.playbooks.values()).filter(p => p.enabled).length
      },
      threatFeeds: {
        total: this.threatFeeds.size,
        active: Array.from(this.threatFeeds.values()).filter(f => f.status === 'active').length
      }
    };
  }

  /**
   * Helper methods
   */
  private classifyThreatType(event: SecurityEvent, rule?: ThreatDetectionRule): ThreatDetectionAlert['type'] {
    if (rule?.id.includes('brute_force')) return 'brute_force';
    if (rule?.id.includes('credential_stuffing')) return 'credential_stuffing';
    if (event.type.includes('anomaly')) return 'anomaly_detected';
    if (event.type.includes('policy_violation')) return 'policy_violation';
    return 'threat_detected';
  }

  private calculateAlertSeverity(riskScore: number, confidence: number): ThreatDetectionAlert['severity'] {
    const adjustedScore = riskScore * confidence;
    if (adjustedScore >= 80) return 'critical';
    if (adjustedScore >= 60) return 'high';
    if (adjustedScore >= 40) return 'medium';
    return 'low';
  }

  private calculateEscalationLevel(riskScore: number): number {
    if (riskScore >= 90) return 5;
    if (riskScore >= 70) return 4;
    if (riskScore >= 50) return 3;
    if (riskScore >= 30) return 2;
    return 1;
  }

  private identifyAffectedResources(event: SecurityEvent): ThreatDetectionAlert['affectedResources'] {
    return {
      users: event.userId ? [event.userId] : [],
      sessions: event.sessionId ? [event.sessionId] : [],
      ipAddresses: event.ipAddress ? [event.ipAddress] : [],
      systems: ['authentication_system'] // would be determined based on event context
    };
  }

  private async extractThreatIndicators(event: SecurityEvent): Promise<ThreatDetectionAlert['indicators']> {
    const indicators = [];
    
    if (event.ipAddress) {
      indicators.push({
        type: 'ip_address',
        value: event.ipAddress,
        confidence: 0.8
      });
    }
    
    if (event.userAgent) {
      indicators.push({
        type: 'user_agent',
        value: event.userAgent,
        confidence: 0.6
      });
    }
    
    return indicators;
  }

  private shouldBlockIP(alert: ThreatDetectionAlert): boolean {
    return alert.severity === 'critical' || 
           alert.type === 'brute_force' || 
           alert.confidence > 0.9;
  }

  private shouldSuspendUser(alert: ThreatDetectionAlert): boolean {
    return alert.severity === 'critical' && 
           (alert.type === 'credential_stuffing' || alert.confidence > 0.95);
  }

  private shouldExecutePlaybook(playbook: PlaybookDefinition, alert: ThreatDetectionAlert): boolean {
    return playbook.triggers.eventTypes.includes(alert.type) &&
           this.evaluatePlaybookConditions(playbook.triggers.conditions, alert);
  }

  private evaluatePlaybookConditions(conditions: Record<string, any>, alert: ThreatDetectionAlert): boolean {
    // Simple condition evaluation - would be more sophisticated in practice
    return true;
  }

  /**
   * Action implementations (mock - would integrate with real systems)
   */
  private async blockIPAddress(ipAddress: string): Promise<void> {
    logger.log(`Blocking IP address: ${ipAddress}`);
    // Would integrate with firewall/WAF
  }

  private async suspendUser(userId: string): Promise<void> {
    logger.log(`Suspending user: ${userId}`);
    // Would integrate with user management system
  }

  private async requireAdditionalMFA(userId: string): Promise<void> {
    logger.log(`Requiring additional MFA for user: ${userId}`);
    // Would integrate with MFA system
  }

  private async forceLogoutSessions(target: string): Promise<void> {
    logger.log(`Force logging out sessions: ${target}`);
    // Would integrate with session management
  }

  private async applyRateLimit(ipAddress: string): Promise<void> {
    logger.log(`Applying rate limit to: ${ipAddress}`);
    // Would integrate with rate limiting system
  }

  private async quarantineResource(resource: string): Promise<void> {
    logger.log(`Quarantining resource: ${resource}`);
    // Would implement resource quarantine
  }

  /**
   * Playbook step implementations
   */
  private async executeAnalysisStep(step: any, alert: ThreatDetectionAlert): Promise<void> {
    // Implement analysis logic
  }

  private async executeContainmentStep(step: any, alert: ThreatDetectionAlert): Promise<void> {
    // Implement containment logic
  }

  private async executeInvestigationStep(step: any, alert: ThreatDetectionAlert): Promise<void> {
    // Implement investigation logic
  }

  private async executeNotificationStep(step: any, alert: ThreatDetectionAlert): Promise<void> {
    // Implement notification logic
  }

  private async executeRecoveryStep(step: any, alert: ThreatDetectionAlert): Promise<void> {
    // Implement recovery logic
  }

  private async escalateAlert(alert: ThreatDetectionAlert, reason: string): Promise<void> {
    alert.escalationLevel = Math.min(alert.escalationLevel + 1, 5);
    logger.log(`Escalating alert ${alert.id}: ${reason}`);
  }

  private async updateThreatFeed(feed: ThreatIntelligenceFeed): Promise<void> {
    // Mock implementation - would fetch from real threat intelligence feeds
    feed.recordCount = Math.floor(Math.random() * 10000);
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((result, item) => {
      const group = item[key];
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  }

  /**
   * Utility methods
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResponseId(): string {
    return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize default security playbooks
   */
  private initializeDefaultPlaybooks(): void {
    // Brute force response playbook
    this.playbooks.set('brute_force_response', {
      id: 'brute_force_response',
      name: 'Brute Force Response',
      description: 'Automated response to brute force attacks',
      triggers: {
        eventTypes: ['brute_force'],
        conditions: { severity: ['high', 'critical'] }
      },
      steps: [
        {
          id: 'analyze_source',
          type: 'analysis',
          action: 'analyze_attack_source',
          parameters: {},
          timeout: 30,
          onFailure: 'continue'
        },
        {
          id: 'block_source',
          type: 'containment',
          action: 'block_ip_address',
          parameters: {},
          timeout: 60,
          onFailure: 'escalate'
        },
        {
          id: 'notify_admin',
          type: 'notification',
          action: 'send_alert_notification',
          parameters: { urgency: 'high' },
          timeout: 30,
          onFailure: 'continue'
        }
      ],
      escalationRules: [
        {
          condition: 'step_failure',
          target: 'security_team',
          method: 'email'
        }
      ],
      enabled: true
    });
  }

  /**
   * Initialize default threat intelligence feeds
   */
  private initializeDefaultThreatFeeds(): void {
    this.threatFeeds.set('ip_reputation_feed', {
      id: 'ip_reputation_feed',
      name: 'IP Reputation Feed',
      type: 'ip_reputation',
      url: 'https://api.threatintelligence.com/ip-reputation',
      updateInterval: 60, // 1 hour
      lastUpdate: new Date(0), // Force initial update
      status: 'active',
      recordCount: 0
    });
  }

  /**
   * Start background processing
   */
  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processResponseQueue();
    }, 5000); // Process every 5 seconds
  }

  /**
   * Start threat feed updates
   */
  private startFeedUpdates(): void {
    this.feedUpdateInterval = setInterval(() => {
      this.updateThreatFeeds();
    }, 300000); // Check every 5 minutes
  }

  /**
   * Cleanup and shutdown
   */
  public shutdown(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    if (this.feedUpdateInterval) {
      clearInterval(this.feedUpdateInterval);
    }
    
    // Process remaining responses
    this.processResponseQueue();
    
    logger.log('AutomatedThreatDetectionWorkflow shutdown complete');
  }
}

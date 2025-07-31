/**
 * Remote Session Termination Service - Epic 19 Implementation
 * Enables administrators and users to remotely terminate active sessions
 */

import { EventEmitter } from 'events';
import { EnhancedSessionService, Session } from './EnhancedSessionService';
import { AuditService } from './AuditService';
import { EmailService } from './EmailService';

}
}
export interface TerminationRequest {
  id: string;
  sessionId: string;
  targetUserId: string;
  requestedBy: string;
  requestedAt: Date;
  
  reason: {
    type: 'security_breach' | 'suspicious_activity' | 'user_request' | 
          'admin_action' | 'device_lost' | 'password_changed' | 
          'account_compromise' | 'policy_violation' | 'maintenance';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
}
  };
  
  context: {
    ipAddress: string;
    userAgent: string;
    deviceId?: string;
    location?: string;
    sessionInfo?: Partial<Session>;
  };
  
  authorization: {
    authorized: boolean;
    authorizedBy?: string;
    authorizedAt?: Date;
    authorizationMethod: 'self' | 'admin' | 'system' | 'policy';
    requiresElevation: boolean;
  };
  
  execution: {
    status: 'pending' | 'authorized' | 'executing' | 'completed' | 'failed' | 'cancelled';
    executedAt?: Date;
    attempts: number;
    lastAttempt?: Date;
    error?: string;
  };
  
  notification: {
    notifyUser: boolean;
    notificationSent: boolean;
    notificationMethod?: string;
    notificationTime?: Date;
  };
}

}
}
export interface BulkTerminationRequest {
  id: string;
  criteria: {
    userIds?: string[];
    deviceIds?: string[];
    ipAddresses?: string[];
    locations?: string[];
    sessionTypes?: string[];
    inactivityThreshold?: number; // seconds
    riskScoreThreshold?: number;
    excludeCurrentSession?: boolean;
}
}
  };
  
  metadata: {
    requestedBy: string;
    requestedAt: Date;
    reason: string;
    estimatedSessions: number;
    actualSessions?: number;
  };
  
  execution: {
    status: 'pending' | 'approved' | 'executing' | 'completed' | 'failed';
    approvedBy?: string;
    approvedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    successCount: number;
    failureCount: number;
    errors: Array<{ sessionId: string; error: string }>;
  };
}

}
}
export interface TerminationPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  conditions: {
    triggerOn: Array<'location_change' | 'device_change' | 'risk_increase' | 
                     'concurrent_limit' | 'time_based' | 'event_based'>;
    locationRadius?: number; // km
    riskScoreThreshold?: number;
    maxConcurrentSessions?: number;
    timeConditions?: {
}
}
      afterHours?: { start: string; end: string };
      weekends?: boolean;
      holidays?: boolean;
    };
    eventConditions?: {
      failedLogins?: number;
      suspiciousActivity?: boolean;
      securityAlerts?: boolean;
    };
  };
  
  actions: {
    terminateImmediately: boolean;
    graceMinutes?: number;
    notifyUser: boolean;
    requireReauth: boolean;
    lockAccount?: boolean;
  };
  
  exceptions: {
    userRoles?: string[];
    ipWhitelist?: string[];
    deviceWhitelist?: string[];
    locations?: string[];
  };
}

}
}
export interface TerminationEvent {
  id: string;
  timestamp: Date;
  sessionId: string;
  userId: string;
  terminationType: 'immediate' | 'graceful' | 'forced' | 'policy';
  
  details: {
    reason: string;
    initiatedBy: string;
    method: string;
    success: boolean;
    errorMessage?: string;
}
}
  };
  
  sessionDetails: {
    duration: number; // seconds
    lastActivity: Date;
    deviceInfo: any;
    location: any;
  };
  
  aftermath: {
    userNotified: boolean;
    dataPreserved: boolean;
    auditLogged: boolean;
    followUpRequired: boolean;
  };
}

export class RemoteSessionTerminationService extends EventEmitter {
  private sessionService: EnhancedSessionService;
  private auditService: AuditService;
  private emailService: EmailService;
  private terminationRequests: Map<string, TerminationRequest> = new Map();
  private bulkRequests: Map<string, BulkTerminationRequest> = new Map();
  private policies: Map<string, TerminationPolicy> = new Map();
  private terminationHistory: TerminationEvent[] = [];
  private config: {
    requireElevationForCritical: boolean;
    notificationDelay: number; // seconds
    maxBulkTerminations: number;
    graceperiodMinutes: number;
    preserveSessionData: boolean;
    allowSelfTermination: boolean;
  };

  constructor(
    sessionService: EnhancedSessionService,
    auditService: AuditService,
    emailService: EmailService,
    config?: Partial<RemoteSessionTerminationService['config']>
  ) {
    super();
    this.sessionService = sessionService;
    this.auditService = auditService;
    this.emailService = emailService;
    this.config = {
      requireElevationForCritical: true,
      notificationDelay: 5,
      maxBulkTerminations: 100,
      graceperiodMinutes: 5,
      preserveSessionData: true,
      allowSelfTermination: true,
      ...config
    };
    this.initializeDefaultPolicies();
  }

  /**
   * Request termination of a specific session
   */
  async requestSessionTermination(
    sessionId: string,
    requestedBy: string,
    reason: TerminationRequest['reason'],
    context: {
      ipAddress: string;
      userAgent: string;
      currentSessionId?: string;
    }
  ): Promise<{
    success: boolean;
    requestId?: string;
    requiresAuthorization?: boolean;
    message: string;
    estimatedTime?: number;
  }> {

    try {
      // Validate session exists
      const sessionValidation = await this.sessionService.validateSession(sessionId, {
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      });

      if (!sessionValidation.valid || !sessionValidation.session) {
        return {
          success: false,
          message: 'Session not found or already expired'
        };
      }

      const targetSession = sessionValidation.session;
      const isSelfTermination = targetSession.id === context.currentSessionId;

      // Check if self-termination is allowed
      if (isSelfTermination && !this.config.allowSelfTermination) {
        return {
          success: false,
          message: 'Self-termination is not allowed'
        };
      }

      // Create termination request
      const request: TerminationRequest = {
        id: this.generateRequestId(),
        sessionId,
        targetUserId: targetSession.userId,
        requestedBy,
        requestedAt: new Date(),
        reason,
        context: {
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionInfo: {
            deviceId: targetSession.deviceId,
            metadata: targetSession.metadata,
            security: targetSession.security
          }
  }
        authorization: {
          authorized: false,
          authorizationMethod: isSelfTermination ? 'self' : 'admin',
          requiresElevation: reason.severity === 'critical' && this.config.requireElevationForCritical
  }
        execution: {
          status: 'pending',
          attempts: 0
  }
        notification: {
          notifyUser: !isSelfTermination && reason.type !== 'maintenance',
          notificationSent: false
        }
      };

      // Check if authorization is required
      const requiresAuth = await this.requiresAuthorization(request);
      
      if (!requiresAuth) {
        // Auto-authorize for certain conditions
        request.authorization.authorized = true;
        request.authorization.authorizedBy = requestedBy;
        request.authorization.authorizedAt = new Date();
        request.execution.status = 'authorized';
      }

      // Store request
      this.terminationRequests.set(request.id, request);

      // Log request
      await this.logTerminationRequest(request);

      // If authorized, execute immediately or after delay
      if (request.authorization.authorized) {
        if (reason.severity === 'critical' || reason.type === 'security_breach') {
          // Execute immediately for critical cases
          setTimeout(() => this.executeTermination(request.id), 0);
        } else {
          // Execute after notification delay
          setTimeout(() => this.executeTermination(request.id), this.config.notificationDelay * 1000);
        }
      }

      return {
        success: true,
        requestId: request.id,
        requiresAuthorization: requiresAuth,
        message: requiresAuth 
          ? 'Termination request created, pending authorization'
          : `Session will be terminated in ${this.config.notificationDelay} seconds`,
        estimatedTime: requiresAuth ? undefined : this.config.notificationDelay
      };

    } catch (error) {
      console.error('Error requesting session termination:', error);
      return {
        success: false,
        message: 'Failed to create termination request'
      };
    }
  }

  /**
   * Authorize a pending termination request
   */
  async authorizeTermination(
    requestId: string,
    authorizedBy: string,
    elevatedCredentials?: {
      password?: string;
      mfaCode?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    executed?: boolean;
  }> {

    const request = this.terminationRequests.get(requestId);
    if (!request) {
      return {
        success: false,
        message: 'Termination request not found'
      };
    }

    if (request.authorization.authorized) {
      return {
        success: false,
        message: 'Request already authorized'
      };
    }

    if (request.execution.status !== 'pending') {
      return {
        success: false,
        message: `Request is in ${request.execution.status} state`
      };
    }

    // Verify elevated credentials if required
    if (request.authorization.requiresElevation && elevatedCredentials) {
      const verified = await this.verifyElevatedCredentials(authorizedBy, elevatedCredentials);
      if (!verified) {
        return {
          success: false,
          message: 'Invalid elevated credentials'
        };
      }
    }

    // Update authorization
    request.authorization.authorized = true;
    request.authorization.authorizedBy = authorizedBy;
    request.authorization.authorizedAt = new Date();
    request.execution.status = 'authorized';

    // Log authorization
    await this.auditService.logEvent({
      userId: authorizedBy,
      action: 'session_termination_authorized',
      details: {
        requestId,
        targetSessionId: request.sessionId,
        targetUserId: request.targetUserId,
        reason: request.reason
  }
      severity: 'info'
    });

    // Execute termination
    const executed = await this.executeTermination(requestId);

    return {
      success: true,
      message: 'Termination authorized',
      executed
    };
  }

  /**
   * Execute a bulk termination of sessions
   */
  async bulkTerminateSessions(
    criteria: BulkTerminationRequest['criteria'],
    requestedBy: string,
    reason: string
  ): Promise<{
    success: boolean;
    requestId?: string;
    estimatedSessions?: number;
    requiresApproval?: boolean;
    message: string;
  }> {

    try {
      // Estimate affected sessions
      const estimatedSessions = await this.estimateAffectedSessions(criteria);
      
      if (estimatedSessions === 0) {
        return {
          success: false,
          message: 'No sessions match the specified criteria'
        };
      }

      if (estimatedSessions > this.config.maxBulkTerminations) {
        return {
          success: false,
          message: `Too many sessions (${estimatedSessions}). Maximum allowed: ${this.config.maxBulkTerminations}`,
          estimatedSessions
        };
      }

      // Create bulk request
      const bulkRequest: BulkTerminationRequest = {
        id: this.generateBulkRequestId(),
        criteria,
        metadata: {
          requestedBy,
          requestedAt: new Date(),
          reason,
          estimatedSessions
  }
        execution: {
          status: 'pending',
          successCount: 0,
          failureCount: 0,
          errors: []
        }
      };

      // Check if approval is required
      const requiresApproval = estimatedSessions > 10 || 
                             criteria.userIds && criteria.userIds.length > 5;

      if (!requiresApproval) {
        bulkRequest.execution.status = 'approved';
        bulkRequest.execution.approvedBy = requestedBy;
        bulkRequest.execution.approvedAt = new Date();
      }

      // Store request
      this.bulkRequests.set(bulkRequest.id, bulkRequest);

      // Log bulk request
      await this.logBulkTerminationRequest(bulkRequest);

      // Execute if approved
      if (bulkRequest.execution.status === 'approved') {
        setTimeout(() => this.executeBulkTermination(bulkRequest.id), 0);
      }

      return {
        success: true,
        requestId: bulkRequest.id,
        estimatedSessions,
        requiresApproval,
        message: requiresApproval 
          ? `Bulk termination of ${estimatedSessions} sessions requires approval`
          : `Bulk termination of ${estimatedSessions} sessions initiated`
      };

    } catch (error) {
      console.error('Error creating bulk termination request:', error);
      return {
        success: false,
        message: 'Failed to create bulk termination request'
      };
    }
  }

  /**
   * Terminate sessions by policy
   */
  async applyTerminationPolicy(
    policyId: string,
    context: {
      triggeredBy: string;
      triggerReason: string;
    }
  ): Promise<{
    success: boolean;
    sessionsTerminated: number;
    errors: string[];
  }> {

    const policy = this.policies.get(policyId);
    if (!policy || !policy.enabled) {
      return {
        success: false,
        sessionsTerminated: 0,
        errors: ['Policy not found or disabled']
      };
    }

    const errors: string[] = [];
    let terminatedCount = 0;

    try {
      // Find sessions matching policy conditions
      const matchingSessions = await this.findSessionsMatchingPolicy(policy);
      
      for (const session of matchingSessions) {
        try {
          // Apply policy actions
          if (policy.actions.terminateImmediately) {
            await this.immediateTermination(session.id, 'policy', {
              policyId,
              policyName: policy.name,
              triggeredBy: context.triggeredBy,
              reason: context.triggerReason
            });
            terminatedCount++;
          } else if (policy.actions.graceMinutes) {
            // Schedule graceful termination
            await this.scheduleGracefulTermination(
              session.id,
              policy.actions.graceMinutes,
              'policy',
              {
                policyId,
                policyName: policy.name,
                triggeredBy: context.triggeredBy
              }
            );
            terminatedCount++;
          }

          // Additional policy actions
          if (policy.actions.requireReauth) {
            await this.flagSessionForReauth(session.id);
          }

          if (policy.actions.lockAccount) {
            await this.requestAccountLock(session.userId, policy.name);
          }

        } catch (error) {
          errors.push(`Failed to terminate session ${session.id}: ${error.message}`);
        }
      }

      // Log policy execution
      await this.logPolicyExecution(policy, terminatedCount, errors, context);

      return {
        success: terminatedCount > 0,
        sessionsTerminated: terminatedCount,
        errors
      };

    } catch (error) {
      console.error('Error applying termination policy:', error);
      return {
        success: false,
        sessionsTerminated: 0,
        errors: ['Failed to apply termination policy']
      };
    }
  }

  /**
   * Get termination history and analytics
   */
  async getTerminationAnalytics(
    filters: {
      userId?: string;
      dateRange?: { start: Date; end: Date };
      reasonType?: TerminationRequest['reason']['type'];
      initiatedBy?: string;
    } = {}
  ): Promise<{
    totalTerminations: number;
    byReason: Array<{ type: string; count: number }>;
    bySeverity: Array<{ severity: string; count: number }>;
    byInitiator: Array<{ initiator: string; count: number }>;
    averageSessionDuration: number;
    failureRate: number;
    timeline: Array<{ date: Date; count: number }>;
    topPolicies: Array<{ policyName: string; executions: number }>;
  }> {
    try {
      // Filter termination history
      let filteredHistory = [...this.terminationHistory];
      
      if (filters.userId) {
        filteredHistory = filteredHistory.filter(event => event.userId === filters.userId);
      }
      
      if (filters.dateRange) {
        filteredHistory = filteredHistory.filter(event => 
          event.timestamp >= filters.dateRange!.start &&
          event.timestamp <= filters.dateRange!.end
        );
      }
      
      if (filters.reasonType) {
        filteredHistory = filteredHistory.filter(event => 
          event.details.reason.includes(filters.reasonType!)
        );
      }
      
      if (filters.initiatedBy) {
        filteredHistory = filteredHistory.filter(event => 
          event.details.initiatedBy === filters.initiatedBy
        );
      }

      // Calculate analytics
      const analytics = {
        totalTerminations: filteredHistory.length,
        byReason: this.groupByProperty(filteredHistory, event => 
          event.details.reason.split(':')[0]
        ),
        bySeverity: this.groupByProperty(filteredHistory, event => 
          event.terminationType
        ),
        byInitiator: this.groupByProperty(filteredHistory, event => 
          event.details.initiatedBy
        ),
        averageSessionDuration: this.calculateAverageSessionDuration(filteredHistory),
        failureRate: this.calculateFailureRate(filteredHistory),
        timeline: this.generateTimeline(filteredHistory),
        topPolicies: this.getTopPolicies(filteredHistory)
      };

      return analytics;

    } catch (error) {
      console.error('Error generating termination analytics:', error);
      throw new Error('Failed to generate termination analytics');
    }
  }

  // Private helper methods

  private async executeTermination(requestId: string): Promise<boolean> {

    const request = this.terminationRequests.get(requestId);
    if (!request || request.execution.status === 'completed') {
      return false;
    }

    request.execution.status = 'executing';
    request.execution.attempts++;
    request.execution.lastAttempt = new Date();

    try {
      // Send notification if required
      if (request.notification.notifyUser && !request.notification.notificationSent) {
        await this.sendTerminationNotification(request);
      }

      // Preserve session data if configured
      if (this.config.preserveSessionData) {
        await this.preserveSessionData(request.sessionId);
      }

      // Execute termination
      const result = await this.sessionService.revokeSession(
        request.sessionId,
        `Remote termination: ${request.reason.type} - ${request.reason.description}`,
        request.requestedBy
      );

      if (result.success) {
        request.execution.status = 'completed';
        request.execution.executedAt = new Date();

        // Log termination event
        const event = await this.createTerminationEvent(request, true);
        this.terminationHistory.push(event);

        this.emit('sessionTerminated', {
          sessionId: request.sessionId,
          userId: request.targetUserId,
          reason: request.reason,
          terminatedBy: request.requestedBy
        });

        return true;
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      request.execution.status = 'failed';
      request.execution.error = error.message;

      // Log failure
      const event = await this.createTerminationEvent(request, false, error.message);
      this.terminationHistory.push(event);

      console.error('Failed to execute termination:', error);
      return false;
    }
  }

  private async executeBulkTermination(requestId: string): Promise<void> {

    const bulkRequest = this.bulkRequests.get(requestId);
    if (!bulkRequest || bulkRequest.execution.status !== 'approved') {
      return;
    }

    bulkRequest.execution.status = 'executing';
    bulkRequest.execution.startedAt = new Date();

    try {
      // Get sessions matching criteria
      const sessions = await this.getSessionsMatchingCriteria(bulkRequest.criteria);
      bulkRequest.metadata.actualSessions = sessions.length;

      // Execute terminations
      for (const session of sessions) {
        try {
          const result = await this.sessionService.revokeSession(
            session.sessionId,
            `Bulk termination: ${bulkRequest.metadata.reason}`,
            bulkRequest.metadata.requestedBy
          );

          if (result.success) {
            bulkRequest.execution.successCount++;
          } else {
            bulkRequest.execution.failureCount++;
            bulkRequest.execution.errors.push({
              sessionId: session.sessionId,
              error: result.message
            });
          }
        } catch (error) {
          bulkRequest.execution.failureCount++;
          bulkRequest.execution.errors.push({
            sessionId: session.sessionId,
            error: error.message
          });
        }
      }

      bulkRequest.execution.status = 'completed';
      bulkRequest.execution.completedAt = new Date();

      // Log bulk termination completion
      await this.logBulkTerminationCompletion(bulkRequest);

      this.emit('bulkTerminationCompleted', {
        requestId: bulkRequest.id,
        totalSessions: sessions.length,
        successCount: bulkRequest.execution.successCount,
        failureCount: bulkRequest.execution.failureCount
      });

    } catch (error) {
      bulkRequest.execution.status = 'failed';
      bulkRequest.execution.errors.push({
        sessionId: 'N/A',
        error: `Bulk execution failed: ${error.message}`
      });
      console.error('Bulk termination failed:', error);
    }
  }

  private async immediateTermination(
    sessionId: string,
    reason: string,
    metadata: any
  ): Promise<void> {

    await this.sessionService.revokeSession(sessionId, reason, 'system');
    
    // Log immediate termination
    await this.auditService.logEvent({
      userId: 'system',
      action: 'immediate_session_termination',
      details: {
        sessionId,
        reason,
        metadata
  }
      severity: 'warning'
    });
  }

  private async scheduleGracefulTermination(
    sessionId: string,
    graceMinutes: number,
    reason: string,
    metadata: any
  ): Promise<void> {

    setTimeout(async () => {
      await this.sessionService.revokeSession(sessionId, reason, 'system');
    }, graceMinutes * 60 * 1000);

    // Notify user about upcoming termination
    await this.sendGracefulTerminationNotice(sessionId, graceMinutes, reason);
  }

  private async requiresAuthorization(request: TerminationRequest): boolean {
    // Self-termination doesn't require authorization
    if (request.context.sessionInfo?.id === request.sessionId) {
      return false;
    }

    // Critical severity requires authorization
    if (request.reason.severity === 'critical') {
      return true;
    }

    // Check if requester has admin privileges
    // This would integrate with your role/permission system
    return false; // Simplified for now
  }

  private async verifyElevatedCredentials(
    userId: string,
    credentials: { password?: string; mfaCode?: string }
  ): Promise<boolean> {

    // Implementation would verify password and/or MFA
    return true; // Simplified for now
  }

  private async estimateAffectedSessions(criteria: BulkTerminationRequest['criteria']): Promise<number> {

    // Implementation would query session service/database
    // to count matching sessions
    return 5; // Mock value
  }

  private async getSessionsMatchingCriteria(
    criteria: BulkTerminationRequest['criteria']
  ): Promise<Array<{ sessionId: string; userId: string }>> {
    // Implementation would query session service
    return []; // Mock empty array
  }

  private async findSessionsMatchingPolicy(policy: TerminationPolicy): Promise<Session[]> {

    // Implementation would find sessions matching policy conditions
    return [];
  }

  private async preserveSessionData(sessionId: string): Promise<void> {

    // Implementation would backup session data before termination
    console.log(`Preserving data for session ${sessionId}`);
  }

  private async sendTerminationNotification(request: TerminationRequest): Promise<void> {

    if (request.notification.notifyUser) {
      await this.emailService.sendSessionTerminatedNotification(
        request.targetUserId,
        {
          sessionId: request.sessionId,
          reason: request.reason.description,
          terminatedBy: request.requestedBy,
          timestamp: new Date()
        }
      );
      request.notification.notificationSent = true;
      request.notification.notificationTime = new Date();
    }
  }

  private async sendGracefulTerminationNotice(
    sessionId: string,
    graceMinutes: number,
    reason: string
  ): Promise<void> {

    // Implementation would send notification about upcoming termination
    console.log(`Session ${sessionId} will be terminated in ${graceMinutes} minutes`);
  }

  private async flagSessionForReauth(sessionId: string): Promise<void> {

    // Implementation would flag session for reauthentication
    console.log(`Session ${sessionId} flagged for reauthentication`);
  }

  private async requestAccountLock(userId: string, reason: string): Promise<void> {

    // Implementation would request account lockout
    console.log(`Account lock requested for user ${userId}: ${reason}`);
  }

  private async createTerminationEvent(
    request: TerminationRequest,
    success: boolean,
    errorMessage?: string
  ): Promise<TerminationEvent> {

    return {
      id: this.generateEventId(),
      timestamp: new Date(),
      sessionId: request.sessionId,
      userId: request.targetUserId,
      terminationType: request.reason.severity === 'critical' ? 'forced' : 'graceful',
      details: {
        reason: `${request.reason.type}: ${request.reason.description}`,
        initiatedBy: request.requestedBy,
        method: request.authorization.authorizationMethod,
        success,
        errorMessage
  }
      sessionDetails: {
        duration: 0, // Would calculate from session data
        lastActivity: new Date(), // Would get from session
        deviceInfo: {},
        location: {}
  }
      aftermath: {
        userNotified: request.notification.notificationSent,
        dataPreserved: this.config.preserveSessionData,
        auditLogged: true,
        followUpRequired: !success || request.reason.severity === 'critical'
      }
    };
  }

  private groupByProperty<T>(
    items: T[],
    getProperty: (item: T) => string
  ): Array<{ type: string; count: number }> {
    const groups = items.reduce((acc, item) => {
      const key = getProperty(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groups)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateAverageSessionDuration(events: TerminationEvent[]): number {
    if (events.length === 0) return 0;
    const total = events.reduce((sum, event) => sum + event.sessionDetails.duration, 0);
    return Math.round(total / events.length);
  }

  private calculateFailureRate(events: TerminationEvent[]): number {
    if (events.length === 0) return 0;
    const failures = events.filter(event => !event.details.success).length;
    return Math.round((failures / events.length) * 100);
  }

  private generateTimeline(events: TerminationEvent[]): Array<{ date: Date; count: number }> {
    // Group events by day
    const timeline: Record<string, number> = {};
    
    events.forEach(event => {
      const dateKey = event.timestamp.toISOString().split('T')[0];
      timeline[dateKey] = (timeline[dateKey] || 0) + 1;
    });

    return Object.entries(timeline)
      .map(([date, count]) => ({ date: new Date(date), count }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private getTopPolicies(events: TerminationEvent[]): Array<{ policyName: string; executions: number }> {
    // Filter for policy-based terminations
    const policyEvents = events.filter(event => event.terminationType === 'policy');
    
    // Group by policy name (would extract from event details)
    const policyGroups: Record<string, number> = {};
    
    return Object.entries(policyGroups)
      .map(([policyName, executions]) => ({ policyName, executions }))
      .sort((a, b) => b.executions - a.executions)
      .slice(0, 5);
  }

  private initializeDefaultPolicies(): void {
    const defaultPolicies: Array<Omit<TerminationPolicy, 'id'>> = [
      {
        name: 'Concurrent Session Limit',
        description: 'Terminate oldest sessions when limit exceeded',
        enabled: true,
        conditions: {
          triggerOn: ['concurrent_limit'],
          maxConcurrentSessions: 3
  }
        actions: {
          terminateImmediately: false,
          graceMinutes: 5,
          notifyUser: true,
          requireReauth: false
  }
        exceptions: {
          userRoles: ['admin', 'service']
        }
  }
      {
        name: 'High Risk Location Change',
        description: 'Terminate session on suspicious location change',
        enabled: true,
        conditions: {
          triggerOn: ['location_change'],
          locationRadius: 1000, // 1000km
          riskScoreThreshold: 80
  }
        actions: {
          terminateImmediately: true,
          notifyUser: true,
          requireReauth: true,
          lockAccount: false
  }
        exceptions: {
          userRoles: ['admin']
        }
  }
      {
        name: 'After Hours Access',
        description: 'Terminate non-admin sessions after business hours',
        enabled: false,
        conditions: {
          triggerOn: ['time_based'],
          timeConditions: {
            afterHours: { start: '18:00', end: '08:00' },
            weekends: true
          }
  }
        actions: {
          terminateImmediately: false,
          graceMinutes: 15,
          notifyUser: true,
          requireReauth: false
  }
        exceptions: {
          userRoles: ['admin', 'security', 'oncall']
        }
      }
    ];

    defaultPolicies.forEach(policy => {
      const id = this.generatePolicyId();
      this.policies.set(id, { ...policy, id });
    });
  }

  private async logTerminationRequest(request: TerminationRequest): Promise<void> {

    await this.auditService.logEvent({
      userId: request.requestedBy,
      action: 'session_termination_requested',
      details: {
        requestId: request.id,
        targetSessionId: request.sessionId,
        targetUserId: request.targetUserId,
        reason: request.reason,
        requiresAuthorization: request.authorization.requiresElevation
  }
      severity: request.reason.severity === 'critical' ? 'warning' : 'info'
    });
  }

  private async logBulkTerminationRequest(request: BulkTerminationRequest): Promise<void> {

    await this.auditService.logEvent({
      userId: request.metadata.requestedBy,
      action: 'bulk_session_termination_requested',
      details: {
        requestId: request.id,
        criteria: request.criteria,
        estimatedSessions: request.metadata.estimatedSessions,
        reason: request.metadata.reason
  }
      severity: 'warning'
    });
  }

  private async logBulkTerminationCompletion(request: BulkTerminationRequest): Promise<void> {

    await this.auditService.logEvent({
      userId: request.metadata.requestedBy,
      action: 'bulk_session_termination_completed',
      details: {
        requestId: request.id,
        totalSessions: request.metadata.actualSessions,
        successCount: request.execution.successCount,
        failureCount: request.execution.failureCount,
        duration: request.execution.completedAt!.getTime() - request.execution.startedAt!.getTime()
  }
      severity: 'info'
    });
  }

  private async logPolicyExecution(
    policy: TerminationPolicy,
    terminatedCount: number,
    errors: string[],
    context: any
  ): Promise<void> {

    await this.auditService.logEvent({
      userId: context.triggeredBy,
      action: 'termination_policy_executed',
      details: {
        policyId: policy.id,
        policyName: policy.name,
        terminatedCount,
        errorCount: errors.length,
        triggerReason: context.triggerReason
  }
      severity: 'info'
    });
  }

  private generateRequestId(): string {
    return `TERM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBulkRequestId(): string {
    return `BULK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePolicyId(): string {
    return `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  destroy(): void {
    // Clean up resources
    this.terminationRequests.clear();
    this.bulkRequests.clear();
    this.policies.clear();
    this.terminationHistory = [];
  }
}
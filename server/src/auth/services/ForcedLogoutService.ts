/**
 * Forced Logout Service - Epic 19 Implementation
 * Handles immediate and scheduled forced logout of users across all sessions and devices
 */

import { EventEmitter } from 'events';
import { DatabaseService } from '../database/DatabaseService';
import { RedisService } from '../database/RedisService';
import { EnhancedSessionService } from './EnhancedSessionService';
import { AuditService } from './AuditService';
import { EmailService } from './EmailService';

}
export interface ForcedLogoutRequest {
  id: string;
  targetUserId: string;
  requestedBy: string;
  requestedAt: Date;
  
  reason: {
    type: 'security_breach' | 'policy_violation' | 'admin_action' | 'account_compromise' | 
          'suspicious_activity' | 'maintenance' | 'emergency' | 'compliance' | 'user_request';
    category: 'security' | 'administrative' | 'technical' | 'compliance';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    evidence?: string[];
}
  };
  
  scope: {
    allSessions: boolean;
    specificSessions?: string[];
    deviceTypes?: string[];
    locations?: string[];
    excludeDevices?: string[];
    includeDormantSessions: boolean;
  };
  
  execution: {
    immediate: boolean;
    scheduledAt?: Date;
    gracePeriod?: number; // seconds
    notifyUser: boolean;
    preserveData: boolean;
    blockReauth?: boolean;
    blockDuration?: number; // seconds
  };
  
  authorization: {
    approved: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    requiresElevation: boolean;
    emergencyOverride?: boolean;
  };
  
  status: {
    state: 'pending' | 'approved' | 'executing' | 'completed' | 'failed' | 'cancelled';
    executedAt?: Date;
    completedAt?: Date;
    error?: string;
    attempts: number;
  };
  
  impact: {
    estimatedSessions: number;
    actualSessions?: number;
    successfulLogouts: number;
    failedLogouts: number;
    affectedDevices: string[];
  };
}

}
export interface LogoutPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  
  triggers: {
    automated: boolean;
    conditions: Array<{
      event: string;
      operator: 'equals' | 'contains' | 'greater' | 'less' | 'matches';
      value: any;
      weight: number;
}
    }>;
    threshold: number; // Combined weight threshold for triggering
    cooldown: number; // seconds between automatic triggers
  };
  
  scope: {
    userRoles?: string[];
    sessionTypes?: string[];
    deviceTypes?: string[];
    riskLevels?: string[];
    timeConditions?: {
      businessHours?: boolean;
      weekends?: boolean;
      holidays?: boolean;
    };
  };
  
  actions: {
    logoutType: 'immediate' | 'graceful' | 'scheduled';
    gracePeriod?: number; // seconds
    notificationMethods: ('email' | 'sms' | 'push' | 'ui')[];
    blockReauth: boolean;
    blockDuration?: number; // seconds
    preserveData: boolean;
    escalationRequired: boolean;
  };
  
  exceptions: {
    adminBypass: boolean;
    emergencyAccess: boolean;
    trustedDevices?: string[];
    whitelistedIPs?: string[];
    excludeServiceAccounts: boolean;
  };
}

}
export interface LogoutEvent {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  
  trigger: {
    type: 'manual' | 'automated' | 'policy' | 'emergency';
    source: string;
    requestId?: string;
    policyId?: string;
}
  };
  
  execution: {
    method: 'immediate' | 'graceful' | 'forced';
    success: boolean;
    duration: number; // milliseconds
    error?: string;
    retries: number;
  };
  
  session: {
    deviceId: string;
    deviceType: string;
    ipAddress: string;
    location?: string;
    duration: number; // seconds
    lastActivity: Date;
    dataPreserved: boolean;
  };
  
  outcome: {
    userNotified: boolean;
    reauthBlocked: boolean;
    blockDuration?: number;
    followUpRequired: boolean;
    escalated: boolean;
  };
  
  metadata: {
    correlationId?: string;
    tags: string[];
    auditTrail: string[];
  };
}

}
export interface LogoutStatistics {
  timeRange: { start: Date; end: Date };
  
  overview: {
    totalLogouts: number;
    forcedLogouts: number;
    voluntaryLogouts: number;
    failedLogouts: number;
    averageExecutionTime: number;
  };
  
  triggers: {
    byType: Record<string, number>;
    byReason: Record<string, number>;
    bySeverity: Record<string, number>;
    automatedVsManual: { automated: number; manual: number };
  };
  
  patterns: {
    peakLogoutHours: Array<{ hour: number; count: number }>;
    deviceTypeBreakdown: Record<string, number>;
    locationBreakdown: Record<string, number>;
    frequentUsers: Array<{ userId: string; logouts: number }>;
  };
  
  effectiveness: {
    successRate: number;
    averageResponseTime: number;
    userCompliance: number;
    securityIncidentReduction: number;
  };
}

export class ForcedLogoutService extends EventEmitter {
  private db: DatabaseService;
  private redis: RedisService;
  private sessionService: EnhancedSessionService;
  private auditService: AuditService;
  private emailService: EmailService;
  private logoutRequests: Map<string, ForcedLogoutRequest> = new Map();
  private policies: Map<string, LogoutPolicy> = new Map();
  private logoutHistory: LogoutEvent[] = [];
  private activeBlocks: Map<string, Date> = new Map(); // userId -> block expiry
  private scheduledLogouts: Map<string, NodeJS.Timeout> = new Map();
  private config: {
    maxRetries: number;
    retryDelay: number; // milliseconds
    defaultGracePeriod: number; // seconds
    maxHistoryEntries: number;
    emergencyBypassEnabled: boolean;
    auditAllEvents: boolean;
  };

  constructor(
    db: DatabaseService,
    redis: RedisService,
    sessionService: EnhancedSessionService,
    auditService: AuditService,
    emailService: EmailService,
    config?: Partial<ForcedLogoutService['config']>
  ) {
    super();
    this.db = db;
    this.redis = redis;
    this.sessionService = sessionService;
    this.auditService = auditService;
    this.emailService = emailService;
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      defaultGracePeriod: 30,
      maxHistoryEntries: 10000,
      emergencyBypassEnabled: true,
      auditAllEvents: true,
      ...config
    };
    
    this.initializeDefaultPolicies();
    this.loadActiveBlocks();
  }

  /**
   * Request forced logout for a user
   */
  async requestForcedLogout(
    targetUserId: string,
    requestedBy: string,
    logoutConfig: {
      reason: ForcedLogoutRequest['reason'];
      scope?: Partial<ForcedLogoutRequest['scope']>;
      execution?: Partial<ForcedLogoutRequest['execution']>;
      emergency?: boolean;
    }
  ): Promise<{
    success: boolean;
    requestId?: string;
    requiresApproval?: boolean;
    estimatedSessions?: number;
    message: string;
  }> {

    try {
      // Validate target user exists and is not requesting themselves (unless allowed)
      if (targetUserId === requestedBy && logoutConfig.reason.type !== 'user_request') {
        return {
          success: false,
          message: 'Cannot force logout yourself unless it\'s a user request'
        };
      }

      // Estimate affected sessions
      const sessionEstimate = await this.estimateAffectedSessions(targetUserId, logoutConfig.scope);
      
      if (sessionEstimate === 0) {
        return {
          success: false,
          message: 'No active sessions found for the specified user and scope'
        };
      }

      // Create logout request
      const request: ForcedLogoutRequest = {
        id: this.generateRequestId(),
        targetUserId,
        requestedBy,
        requestedAt: new Date(),
        reason: logoutConfig.reason,
        scope: {
          allSessions: true,
          includeDormantSessions: false,
          ...logoutConfig.scope
  }
        execution: {
          immediate: logoutConfig.emergency || logoutConfig.reason.severity === 'critical',
          gracePeriod: this.config.defaultGracePeriod,
          notifyUser: true,
          preserveData: true,
          ...logoutConfig.execution
  }
        authorization: {
          approved: false,
          requiresElevation: this.requiresElevation(logoutConfig.reason),
          emergencyOverride: logoutConfig.emergency || false
  }
        status: {
          state: 'pending',
          attempts: 0
  }
        impact: {
          estimatedSessions: sessionEstimate,
          successfulLogouts: 0,
          failedLogouts: 0,
          affectedDevices: []
        }
      };

      // Check if approval is required
      const requiresApproval = this.requiresApproval(request);
      
      if (!requiresApproval || request.authorization.emergencyOverride) {
        // Auto-approve for certain conditions
        request.authorization.approved = true;
        request.authorization.approvedBy = requestedBy;
        request.authorization.approvedAt = new Date();
        request.status.state = 'approved';
      }

      // Store request
      this.logoutRequests.set(request.id, request);

      // Log the request
      await this.logForcedLogoutRequest(request);

      // Execute immediately if approved and immediate
      if (request.authorization.approved && request.execution.immediate) {
        setTimeout(() => this.executeForcedLogout(request.id), 0);
      } else if (request.authorization.approved && request.execution.scheduledAt) {
        // Schedule for later execution
        this.scheduleLogout(request.id, request.execution.scheduledAt);
      }

      return {
        success: true,
        requestId: request.id,
        requiresApproval,
        estimatedSessions: sessionEstimate,
        message: requiresApproval 
          ? 'Forced logout request created, pending approval'
          : request.execution.immediate 
            ? 'Forced logout initiated immediately'
            : 'Forced logout scheduled'
      };

    } catch (error) {
      console.error('Error requesting forced logout:', error);
      return {
        success: false,
        message: 'Failed to create forced logout request'
      };
    }
  }

  /**
   * Approve a pending forced logout request
   */
  async approveForcedLogout(
    requestId: string,
    approvedBy: string,
    elevatedCredentials?: {
      password?: string;
      mfaCode?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    executed?: boolean;
  }> {

    const request = this.logoutRequests.get(requestId);
    if (!request) {
      return {
        success: false,
        message: 'Forced logout request not found'
      };
    }

    if (request.authorization.approved) {
      return {
        success: false,
        message: 'Request already approved'
      };
    }

    if (request.status.state !== 'pending') {
      return {
        success: false,
        message: `Request is in ${request.status.state} state`
      };
    }

    // Verify elevated credentials if required
    if (request.authorization.requiresElevation && elevatedCredentials) {
      const verified = await this.verifyElevatedCredentials(approvedBy, elevatedCredentials);
      if (!verified) {
        return {
          success: false,
          message: 'Invalid elevated credentials'
        };
      }
    }

    // Approve the request
    request.authorization.approved = true;
    request.authorization.approvedBy = approvedBy;
    request.authorization.approvedAt = new Date();
    request.status.state = 'approved';

    // Log approval
    await this.auditService.logEvent({
      userId: approvedBy,
      action: 'forced_logout_approved',
      details: {
        requestId,
        targetUserId: request.targetUserId,
        reason: request.reason,
        scope: request.scope
  }
      severity: 'warning'
    });

    // Execute logout
    const executed = request.execution.immediate 
      ? await this.executeForcedLogout(requestId)
      : false;

    // Schedule if not immediate
    if (!request.execution.immediate && request.execution.scheduledAt) {
      this.scheduleLogout(requestId, request.execution.scheduledAt);
    }

    return {
      success: true,
      message: 'Forced logout approved',
      executed
    };
  }

  /**
   * Execute immediate forced logout for all active sessions of a user
   */
  async executeImmediateForcedLogout(
    userId: string,
    reason: string,
    executedBy: string,
    options: {
      preserveData?: boolean;
      notifyUser?: boolean;
      blockReauth?: boolean;
      blockDuration?: number;
    } = {}
  ): Promise<{
    success: boolean;
    sessionsTerminated: number;
    errors: string[];
    logoutEvents: LogoutEvent[];
  }> {

    const errors: string[] = [];
    const logoutEvents: LogoutEvent[] = [];
    let sessionsTerminated = 0;

    try {
      // Get all active sessions for the user
      const userSessions = await this.sessionService.getUserSessions(userId, {
        includeExpired: false,
        includeRevoked: false
      });

      if (userSessions.length === 0) {
        return {
          success: true,
          sessionsTerminated: 0,
          errors: ['No active sessions found'],
          logoutEvents: []
        };
      }

      // Process each session
      for (const session of userSessions) {
        try {
          const startTime = Date.now();
          
          // Preserve session data if requested
          if (options.preserveData) {
            await this.preserveSessionData(session.id, reason);
          }

          // Revoke the session
          const result = await this.sessionService.revokeSession(
            session.id,
            `Forced logout: ${reason}`,
            executedBy
          );

          const logoutEvent: LogoutEvent = {
            id: this.generateEventId(),
            userId,
            sessionId: session.id,
            timestamp: new Date(),
            trigger: {
              type: 'manual',
              source: executedBy
  }
            execution: {
              method: 'forced',
              success: result.success,
              duration: Date.now() - startTime,
              error: result.success ? undefined : result.message,
              retries: 0
  }
            session: {
              deviceId: session.deviceId,
              deviceType: session.metadata?.deviceType || 'unknown',
              ipAddress: session.ipAddress,
              location: session.metadata?.location,
              duration: Math.floor((Date.now() - session.createdAt.getTime()) / 1000),
              lastActivity: session.lastActivity,
              dataPreserved: options.preserveData || false
  }
            outcome: {
              userNotified: false,
              reauthBlocked: options.blockReauth || false,
              blockDuration: options.blockDuration,
              followUpRequired: false,
              escalated: false
  }
            metadata: {
              correlationId: this.generateCorrelationId(),
              tags: ['forced', 'immediate'],
              auditTrail: [`Executed by ${executedBy}`, `Reason: ${reason}`]
            }
          };

          if (result.success) {
            sessionsTerminated++;
            // Invalidate session in Redis
            await this.invalidateSessionCache(session.id);
          } else {
            errors.push(`Failed to terminate session ${session.id}: ${result.message}`);
          }

          logoutEvents.push(logoutEvent);
          this.logoutHistory.push(logoutEvent);

        } catch (error) {
          errors.push(`Error processing session ${session.id}: ${error.message}`);
        }
      }

      // Block reauthentication if requested
      if (options.blockReauth && options.blockDuration) {
        await this.blockUserReauth(userId, options.blockDuration, reason);
      }

      // Notify user if requested
      if (options.notifyUser && sessionsTerminated > 0) {
        await this.notifyUserOfForcedLogout(userId, reason, sessionsTerminated);
      }

      // Log the forced logout action
      await this.auditService.logEvent({
        userId: executedBy,
        action: 'immediate_forced_logout',
        details: {
          targetUserId: userId,
          reason,
          sessionsTerminated,
          totalSessions: userSessions.length,
          errors: errors.length,
          preserveData: options.preserveData,
          blockReauth: options.blockReauth,
          blockDuration: options.blockDuration
  }
        severity: 'warning'
      });

      this.emit('forcedLogoutCompleted', {
        userId,
        executedBy,
        sessionsTerminated,
        errors: errors.length,
        reason
      });

      return {
        success: sessionsTerminated > 0,
        sessionsTerminated,
        errors,
        logoutEvents
      };

    } catch (error) {
      console.error('Error executing immediate forced logout:', error);
      return {
        success: false,
        sessionsTerminated: 0,
        errors: ['Failed to execute forced logout'],
        logoutEvents: []
      };
    }
  }

  /**
   * Check if user is currently blocked from reauthentication
   */
  async isUserBlocked(userId: string): Promise<{
    blocked: boolean;
    reason?: string;
    expiresAt?: Date;
    remainingTime?: number;
  }> {

    const blockExpiry = this.activeBlocks.get(userId);
    if (!blockExpiry) {
      return { blocked: false };
    }

    const now = new Date();
    if (now >= blockExpiry) {
      // Block has expired
      this.activeBlocks.delete(userId);
      await this.redis.del(`logout_block:${userId}`);
      return { blocked: false };
    }

    const remainingTime = Math.floor((blockExpiry.getTime() - now.getTime()) / 1000);
    
    return {
      blocked: true,
      reason: 'User blocked due to forced logout',
      expiresAt: blockExpiry,
      remainingTime
    };
  }

  /**
   * Manually unblock a user from reauthentication
   */
  async unblockUser(
    userId: string,
    unblockedBy: string,
    reason: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {

    try {
      const wasBlocked = this.activeBlocks.has(userId);
      
      if (!wasBlocked) {
        return {
          success: false,
          message: 'User is not currently blocked'
        };
      }

      // Remove block
      this.activeBlocks.delete(userId);
      await this.redis.del(`logout_block:${userId}`);

      // Log unblock action
      await this.auditService.logEvent({
        userId: unblockedBy,
        action: 'user_unblocked',
        details: {
          targetUserId: userId,
          reason,
          unblockedBy
  }
        severity: 'info'
      });

      this.emit('userUnblocked', {
        userId,
        unblockedBy,
        reason
      });

      return {
        success: true,
        message: 'User successfully unblocked'
      };

    } catch (error) {
      console.error('Error unblocking user:', error);
      return {
        success: false,
        message: 'Failed to unblock user'
      };
    }
  }

  /**
   * Get forced logout statistics and analytics
   */
  async getLogoutStatistics(
    timeRange: { start: Date; end: Date },
    filters?: {
      userIds?: string[];
      executedBy?: string[];
      reasons?: string[];
      successful?: boolean;
    }
  ): Promise<LogoutStatistics> {

    try {
      // Filter logout history
      let filteredEvents = this.logoutHistory.filter(event => 
        event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
      );

      if (filters) {
        if (filters.userIds) {
          filteredEvents = filteredEvents.filter(e => filters.userIds!.includes(e.userId));
        }
        if (filters.executedBy) {
          filteredEvents = filteredEvents.filter(e => filters.executedBy!.includes(e.trigger.source));
        }
        if (filters.reasons) {
          // Implementation would check reason patterns
        }
        if (filters.successful !== undefined) {
          filteredEvents = filteredEvents.filter(e => e.execution.success === filters.successful);
        }
      }

      // Calculate statistics
      const statistics: LogoutStatistics = {
        timeRange,
        overview: {
          totalLogouts: filteredEvents.length,
          forcedLogouts: filteredEvents.filter(e => e.trigger.type !== 'manual').length,
          voluntaryLogouts: filteredEvents.filter(e => e.trigger.type === 'manual').length,
          failedLogouts: filteredEvents.filter(e => !e.execution.success).length,
          averageExecutionTime: this.calculateAverageExecutionTime(filteredEvents)
  }
        triggers: {
          byType: this.groupByProperty(filteredEvents, e => e.trigger.type),
          byReason: this.groupByMetadataTags(filteredEvents),
          bySeverity: this.groupBySeverity(filteredEvents),
          automatedVsManual: {
            automated: filteredEvents.filter(e => e.trigger.type === 'automated').length,
            manual: filteredEvents.filter(e => e.trigger.type === 'manual').length
          }
  }
        patterns: {
          peakLogoutHours: this.calculatePeakLogoutHours(filteredEvents),
          deviceTypeBreakdown: this.groupByProperty(filteredEvents, e => e.session.deviceType),
          locationBreakdown: this.groupByLocation(filteredEvents),
          frequentUsers: this.getFrequentUsers(filteredEvents)
  }
        effectiveness: {
          successRate: filteredEvents.length > 0 
            ? Math.round((filteredEvents.filter(e => e.execution.success).length / filteredEvents.length) * 100)
            : 100,
          averageResponseTime: this.calculateAverageExecutionTime(filteredEvents),
          userCompliance: this.calculateUserCompliance(filteredEvents),
          securityIncidentReduction: this.calculateSecurityImpact(filteredEvents)
        }
      };

      return statistics;

    } catch (error) {
      console.error('Error generating logout statistics:', error);
      throw new Error('Failed to generate logout statistics');
    }
  }

  // Private helper methods

  private async executeForcedLogout(requestId: string): Promise<boolean> {

    const request = this.logoutRequests.get(requestId);
    if (!request) {
      return false;
    }

    request.status.state = 'executing';
    request.status.attempts++;

    try {
      // Execute the logout based on scope
      const result = await this.executeImmediateForcedLogout(
        request.targetUserId,
        `${request.reason.type}: ${request.reason.description}`,
        request.requestedBy,
        {
          preserveData: request.execution.preserveData,
          notifyUser: request.execution.notifyUser,
          blockReauth: request.execution.blockReauth,
          blockDuration: request.execution.blockDuration
        }
      );

      // Update request status
      request.status.state = result.success ? 'completed' : 'failed';
      request.status.completedAt = new Date();
      request.impact.actualSessions = result.sessionsTerminated;
      request.impact.successfulLogouts = result.sessionsTerminated;
      request.impact.failedLogouts = result.errors.length;

      if (!result.success && request.status.attempts < this.config.maxRetries) {
        // Retry after delay
        setTimeout(() => this.executeForcedLogout(requestId), this.config.retryDelay);
        return false;
      }

      return result.success;

    } catch (error) {
      request.status.state = 'failed';
      request.status.error = error.message;
      console.error('Error executing forced logout request:', error);
      return false;
    }
  }

  private requiresElevation(reason: ForcedLogoutRequest['reason']): boolean {
    return reason.severity === 'critical' || reason.type === 'security_breach';
  }

  private requiresApproval(request: ForcedLogoutRequest): boolean {
    // Emergency override bypasses approval
    if (request.authorization.emergencyOverride) {
      return false;
    }

    // Self-requests don't require approval
    if (request.targetUserId === request.requestedBy && request.reason.type === 'user_request') {
      return false;
    }

    // Critical severity requires approval
    if (request.reason.severity === 'critical') {
      return true;
    }

    // Large scope requires approval
    if (request.impact.estimatedSessions > 5) {
      return true;
    }

    return false;
  }

  private async estimateAffectedSessions(
    userId: string,
    scope?: Partial<ForcedLogoutRequest['scope']>
  ): Promise<number> {

    try {
      const sessions = await this.sessionService.getUserSessions(userId, {
        includeExpired: false,
        includeRevoked: false
      });

      if (!scope || scope.allSessions) {
        return sessions.length;
      }

      let filtered = sessions;

      if (scope.specificSessions) {
        filtered = filtered.filter(s => scope.specificSessions!.includes(s.id));
      }

      if (scope.deviceTypes) {
        filtered = filtered.filter(s => 
          scope.deviceTypes!.includes(s.metadata?.deviceType || 'unknown')
        );
      }

      if (scope.excludeDevices) {
        filtered = filtered.filter(s => 
          !scope.excludeDevices!.includes(s.deviceId)
        );
      }

      return filtered.length;

    } catch (error) {
      console.error('Error estimating affected sessions:', error);
      return 0;
    }
  }

  private async verifyElevatedCredentials(
    userId: string,
    credentials: { password?: string; mfaCode?: string }
  ): Promise<boolean> {

    // Implementation would verify password and/or MFA
    // For now, return true if any credentials provided
    return !!(credentials.password || credentials.mfaCode);
  }

  private async preserveSessionData(sessionId: string, reason: string): Promise<void> {

    try {
      // Get session data
      const sessionData = await this.sessionService.getSessionDetails(sessionId);
      if (sessionData) {
        // Store preserved data
        const preservedData = {
          sessionId,
          preservedAt: new Date(),
          reason,
          data: {
            userId: sessionData.userId,
            deviceId: sessionData.deviceId,
            metadata: sessionData.metadata,
            lastActivity: sessionData.lastActivity,
            createdAt: sessionData.createdAt
          }
        };

        await this.redis.setex(
          `preserved_session:${sessionId}`,
          86400, // 24 hours
          JSON.stringify(preservedData)
        );
      }
    } catch (error) {
      console.error('Error preserving session data:', error);
    }
  }

  private async invalidateSessionCache(sessionId: string): Promise<void> {

    await this.redis.del(`session:${sessionId}`);
    await this.redis.del(`session_data:${sessionId}`);
  }

  private async blockUserReauth(userId: string, durationSeconds: number, reason: string): Promise<void> {

    const expiresAt = new Date(Date.now() + durationSeconds * 1000);
    
    this.activeBlocks.set(userId, expiresAt);
    await this.redis.setex(
      `logout_block:${userId}`,
      durationSeconds,
      JSON.stringify({ reason, expiresAt, blockedAt: new Date() })
    );

    this.emit('userBlocked', {
      userId,
      reason,
      duration: durationSeconds,
      expiresAt
    });
  }

  private async notifyUserOfForcedLogout(
    userId: string,
    reason: string,
    sessionsAffected: number
  ): Promise<void> {

    try {
      await this.emailService.sendForcedLogoutNotification(userId, {
        reason,
        sessionsAffected,
        timestamp: new Date(),
        supportContact: 'support@example.com'
      });
    } catch (error) {
      console.error('Error sending forced logout notification:', error);
    }
  }

  private scheduleLogout(requestId: string, scheduledTime: Date): void {
    const delay = scheduledTime.getTime() - Date.now();
    
    if (delay > 0) {
      const timeout = setTimeout(() => {
        this.executeForcedLogout(requestId);
        this.scheduledLogouts.delete(requestId);
      }, delay);
      
      this.scheduledLogouts.set(requestId, timeout);
    }
  }

  private async loadActiveBlocks(): Promise<void> {

    try {
      const blockKeys = await this.redis.keys('logout_block:*');
      
      for (const key of blockKeys) {
        const userId = key.replace('logout_block:', '');
        const blockData = await this.redis.get(key);
        
        if (blockData) {
          const { expiresAt } = JSON.parse(blockData);
          this.activeBlocks.set(userId, new Date(expiresAt));
        }
      }
    } catch (error) {
      console.error('Error loading active blocks:', error);
    }
  }

  private initializeDefaultPolicies(): void {
    const defaultPolicies: Array<Omit<LogoutPolicy, 'id'>> = [
      {
        name: 'Security Breach Response',
        description: 'Automatic logout on security breach detection',
        enabled: true,
        priority: 100,
        triggers: {
          automated: true,
          conditions: [
            { event: 'security_alert', operator: 'equals', value: 'high', weight: 100 },
            { event: 'failed_logins', operator: 'greater', value: 10, weight: 80 }
          ],
          threshold: 80,
          cooldown: 300
  }
        scope: {},
        actions: {
          logoutType: 'immediate',
          notificationMethods: ['email', 'sms'],
          blockReauth: true,
          blockDuration: 3600,
          preserveData: true,
          escalationRequired: true
  }
        exceptions: {
          adminBypass: false,
          emergencyAccess: true,
          excludeServiceAccounts: false
        }
      }
    ];

    defaultPolicies.forEach(policyData => {
      const id = this.generatePolicyId();
      this.policies.set(id, { ...policyData, id });
    });
  }

  private async logForcedLogoutRequest(request: ForcedLogoutRequest): Promise<void> {

    await this.auditService.logEvent({
      userId: request.requestedBy,
      action: 'forced_logout_requested',
      details: {
        requestId: request.id,
        targetUserId: request.targetUserId,
        reason: request.reason,
        scope: request.scope,
        execution: request.execution
  }
      severity: request.reason.severity === 'critical' ? 'error' : 'warning'
    });
  }

  private calculateAverageExecutionTime(events: LogoutEvent[]): number {
    if (events.length === 0) return 0;
    const total = events.reduce((sum, event) => sum + event.execution.duration, 0);
    return Math.round(total / events.length);
  }

  private groupByProperty<T>(items: T[], getProperty: (item: T) => string): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = getProperty(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByMetadataTags(events: LogoutEvent[]): Record<string, number> {
    const tagCounts: Record<string, number> = {};
    events.forEach(event => {
      event.metadata.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return tagCounts;
  }

  private groupBySeverity(events: LogoutEvent[]): Record<string, number> {
    // Would extract severity from event metadata or audit trail
    return {
      'low': events.filter(e => e.metadata.tags.includes('low')).length,
      'medium': events.filter(e => e.metadata.tags.includes('medium')).length,
      'high': events.filter(e => e.metadata.tags.includes('high')).length,
      'critical': events.filter(e => e.metadata.tags.includes('critical')).length
    };
  }

  private calculatePeakLogoutHours(events: LogoutEvent[]): Array<{ hour: number; count: number }> {
    const hourCounts: Record<number, number> = {};
    
    events.forEach(event => {
      const hour = event.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);
  }

  private groupByLocation(events: LogoutEvent[]): Record<string, number> {
    return this.groupByProperty(events, e => e.session.location || 'unknown');
  }

  private getFrequentUsers(events: LogoutEvent[]): Array<{ userId: string; logouts: number }> {
    const userCounts = this.groupByProperty(events, e => e.userId);
    return Object.entries(userCounts)
      .map(([userId, logouts]) => ({ userId, logouts }))
      .sort((a, b) => b.logouts - a.logouts)
      .slice(0, 10);
  }

  private calculateUserCompliance(events: LogoutEvent[]): number {
    // Calculate percentage of successful vs failed logouts
    const successful = events.filter(e => e.execution.success).length;
    return events.length > 0 ? Math.round((successful / events.length) * 100) : 100;
  }

  private calculateSecurityImpact(events: LogoutEvent[]): number {
    // Mock calculation - would use real security incident data
    const securityLogouts = events.filter(e => 
      e.metadata.tags.includes('security') || e.metadata.tags.includes('breach')
    ).length;
    return Math.round((securityLogouts / Math.max(events.length, 1)) * 100);
  }

  private generateRequestId(): string {
    return `FLR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `FLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePolicyId(): string {
    return `FLP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `FLC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  destroy(): void {
    // Clean up scheduled logouts
    for (const timeout of this.scheduledLogouts.values()) {
      clearTimeout(timeout);
    }
    
    // Clear data structures
    this.logoutRequests.clear();
    this.policies.clear();
    this.activeBlocks.clear();
    this.scheduledLogouts.clear();
    this.logoutHistory = [];
  }
}
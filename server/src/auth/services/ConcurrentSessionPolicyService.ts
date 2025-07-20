/**
 * Concurrent Session Policy Service - Epic 19 Implementation
 * Manages and enforces policies for concurrent user sessions
 */

import { EventEmitter } from 'events';
import { DatabaseService } from '../database/DatabaseService';
import { RedisService } from '../database/RedisService';
import { EnhancedSessionService, Session } from './EnhancedSessionService';
import { RemoteSessionTerminationService } from './RemoteSessionTerminationService';

export interface ConcurrentSessionPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  version: number;
  
  scope: {
    global: boolean;
    userRoles?: string[];
    organizationIds?: string[];
    sessionTypes?: string[];
    deviceTypes?: string[];
    environments?: string[];
  };
  
  limits: {
    maxConcurrentSessions: number;
    maxSessionsPerDevice?: number;
    maxSessionsPerLocation?: number;
    maxSessionsPerIP?: number;
    allowedDeviceTypes?: string[];
    excludeServiceAccounts?: boolean;
  };
  
  enforcement: {
    action: 'block_new' | 'terminate_oldest' | 'terminate_all' | 'require_approval' | 'degrade_oldest';
    gracePeriod?: number; // seconds before enforcement
    notifyUser: boolean;
    allowUserChoice?: boolean; // Let user choose which session to terminate
    preserveActiveSession?: boolean; // Keep the most recently active session
  };
  
  exceptions: {
    adminOverride: boolean;
    emergencyAccess: boolean;
    trustedDevices?: string[];
    whitelistedIPs?: string[];
    temporaryExemptions?: Array<{
      userId: string;
      reason: string;
      expiresAt: Date;
      grantedBy: string;
    }>;
  };
  
  detection: {
    realTimeChecking: boolean;
    checkInterval: number; // seconds for periodic checks
    locationRadius?: number; // km for same location detection
    deviceFingerprintSimilarity?: number; // 0-100 threshold
    ipSimilarityThreshold?: number; // For detecting same network
  };
  
  monitoring: {
    auditEvents: boolean;
    alertOnViolations: boolean;
    metricsCollection: boolean;
    reportingEnabled: boolean;
  };
  
  metadata: {
    createdBy: string;
    createdAt: Date;
    lastModifiedBy?: string;
    lastModifiedAt?: Date;
    tags: string[];
    businessJustification?: string;
  };
}

export interface SessionConflict {
  id: string;
  userId: string;
  policyId: string;
  detectedAt: Date;
  
  conflict: {
    type: 'max_sessions' | 'duplicate_device' | 'suspicious_location' | 'policy_violation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    currentSessionCount: number;
    allowedSessionCount: number;
  };
  
  sessions: Array<{
    sessionId: string;
    deviceId: string;
    location?: string;
    ipAddress: string;
    startTime: Date;
    lastActivity: Date;
    riskScore: number;
    trustLevel: string;
  }>;
  
  resolution: {
    status: 'pending' | 'resolved' | 'escalated' | 'ignored';
    resolvedAt?: Date;
    resolvedBy?: string;
    action?: string;
    userNotified: boolean;
    terminatedSessions?: string[];
  };
  
  context: {
    newSessionAttempt?: {
      deviceId: string;
      ipAddress: string;
      location?: string;
      userAgent: string;
    };
    triggeringEvent: string;
    automaticResolution: boolean;
  };
}

export interface SessionPolicyViolation {
  id: string;
  userId: string;
  policyId: string;
  violationType: string;
  timestamp: Date;
  
  details: {
    violationReason: string;
    sessionDetails: any;
    policyConstraints: any;
    actionTaken: string;
    success: boolean;
  };
  
  impact: {
    sessionsAffected: number;
    userImpact: 'none' | 'minimal' | 'moderate' | 'severe';
    businessImpact: string;
  };
  
  followUp: {
    escalationRequired: boolean;
    adminNotified: boolean;
    userEducationNeeded: boolean;
    policyReviewSuggested: boolean;
  };
}

export interface PolicyStatistics {
  policyId: string;
  timeRange: { start: Date; end: Date };
  
  enforcement: {
    totalViolations: number;
    resolvedViolations: number;
    blockedSessions: number;
    terminatedSessions: number;
    userNotifications: number;
  };
  
  patterns: {
    peakViolationHours: Array<{ hour: number; count: number }>;
    topViolatingUsers: Array<{ userId: string; violations: number }>;
    commonViolationTypes: Array<{ type: string; count: number }>;
    deviceTypeBreakdown: Record<string, number>;
  };
  
  effectiveness: {
    violationResolutionRate: number;
    averageResolutionTime: number;
    userComplianceRate: number;
    policyBypassAttempts: number;
  };
  
  recommendations: Array<{
    type: 'policy_adjustment' | 'limit_change' | 'exception_review';
    description: string;
    impact: string;
    confidence: number;
  }>;
}

export class ConcurrentSessionPolicyService extends EventEmitter {
  private db: DatabaseService;
  private redis: RedisService;
  private sessionService: EnhancedSessionService;
  private terminationService: RemoteSessionTerminationService;
  private policies: Map<string, ConcurrentSessionPolicy> = new Map();
  private activeConflicts: Map<string, SessionConflict> = new Map();
  private violations: SessionPolicyViolation[] = [];
  private userSessionCache: Map<string, string[]> = new Map(); // userId -> sessionIds
  private monitoringInterval: NodeJS.Timeout;
  
  private config: {
    enableRealTimeChecking: boolean;
    defaultCheckInterval: number; // seconds
    maxViolationHistory: number;
    cacheExpirySeconds: number;
    notificationDelay: number; // seconds
    gracePeriodDefault: number; // seconds
  };

  constructor(
    db: DatabaseService,
    redis: RedisService,
    sessionService: EnhancedSessionService,
    terminationService: RemoteSessionTerminationService,
    config?: Partial<ConcurrentSessionPolicyService['config']>
  ) {
    super();
    this.db = db;
    this.redis = redis;
    this.sessionService = sessionService;
    this.terminationService = terminationService;
    this.config = {
      enableRealTimeChecking: true,
      defaultCheckInterval: 60, // 1 minute
      maxViolationHistory: 1000,
      cacheExpirySeconds: 300, // 5 minutes
      notificationDelay: 5,
      gracePeriodDefault: 30,
      ...config
    };
    
    this.initializeDefaultPolicies();
    this.startPeriodicChecking();
    this.setupSessionEventListeners();
  }

  /**
   * Create a new concurrent session policy
   */
  async createPolicy(
    policyData: Omit<ConcurrentSessionPolicy, 'id' | 'version' | 'metadata'>,
    createdBy: string
  ): Promise<{
    success: boolean;
    policy?: ConcurrentSessionPolicy;
    errors?: string[];
  }> {
    try {
      // Validate policy configuration
      const validation = this.validatePolicyConfiguration(policyData);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Create policy
      const policy: ConcurrentSessionPolicy = {
        ...policyData,
        id: this.generatePolicyId(),
        version: 1,
        metadata: {
          createdBy,
          createdAt: new Date(),
          tags: policyData.metadata?.tags || []
        }
      };

      // Store policy
      this.policies.set(policy.id, policy);
      await this.savePolicyToDatabase(policy);

      // Log policy creation
      await this.logPolicyEvent('created', policy.id, createdBy, {
        policyName: policy.name,
        maxSessions: policy.limits.maxConcurrentSessions,
        scope: policy.scope
      });

      this.emit('policyCreated', {
        policyId: policy.id,
        name: policy.name,
        createdBy
      });

      return {
        success: true,
        policy
      };

    } catch (error) {
      console.error('Error creating concurrent session policy:', error);
      return {
        success: false,
        errors: ['Failed to create policy']
      };
    }
  }

  /**
   * Check session limits before allowing new session
   */
  async checkSessionLimits(
    userId: string,
    newSessionContext: {
      deviceId: string;
      ipAddress: string;
      userAgent: string;
      location?: string;
      sessionType: string;
      deviceType: string;
    }
  ): Promise<{
    allowed: boolean;
    conflict?: SessionConflict;
    suggestedActions?: string[];
    requiresUserChoice?: boolean;
    gracePeriod?: number;
  }> {
    try {
      // Get applicable policies for this user/context
      const applicablePolicies = await this.findApplicablePolicies(userId, newSessionContext);
      
      if (applicablePolicies.length === 0) {
        return { allowed: true };
      }

      // Get current user sessions
      const currentSessions = await this.getUserActiveSessions(userId);
      
      // Check each applicable policy
      for (const policy of applicablePolicies) {
        const violation = await this.checkPolicyViolation(policy, currentSessions, newSessionContext);
        
        if (violation) {
          // Create conflict record
          const conflict = await this.createSessionConflict(
            userId,
            policy,
            currentSessions,
            newSessionContext,
            violation
          );

          // Determine resolution
          const resolution = await this.determineConflictResolution(conflict, policy);
          
          return {
            allowed: resolution.allowSession,
            conflict,
            suggestedActions: resolution.suggestedActions,
            requiresUserChoice: resolution.requiresUserChoice,
            gracePeriod: policy.enforcement.gracePeriod || this.config.gracePeriodDefault
          };
        }
      }

      return { allowed: true };

    } catch (error) {
      console.error('Error checking session limits:', error);
      // Fail safe: allow session but log error
      return { allowed: true };
    }
  }

  /**
   * Enforce policy violation resolution
   */
  async enforcePolicy(
    conflictId: string,
    enforcedBy: string,
    userChoice?: {
      action: 'terminate_selected' | 'terminate_oldest' | 'block_new';
      selectedSessions?: string[];
    }
  ): Promise<{
    success: boolean;
    actionsPerformed: string[];
    errors?: string[];
  }> {
    const conflict = this.activeConflicts.get(conflictId);
    if (!conflict) {
      return {
        success: false,
        errors: ['Conflict not found'],
        actionsPerformed: []
      };
    }

    const policy = this.policies.get(conflict.policyId);
    if (!policy) {
      return {
        success: false,
        errors: ['Policy not found'],
        actionsPerformed: []
      };
    }

    const actionsPerformed: string[] = [];
    const errors: string[] = [];

    try {
      let resolutionAction = policy.enforcement.action;
      let sessionsToTerminate: string[] = [];

      // Handle user choice if provided and allowed
      if (userChoice && policy.enforcement.allowUserChoice) {
        switch (userChoice.action) {
          case 'terminate_selected':
            if (userChoice.selectedSessions) {
              sessionsToTerminate = userChoice.selectedSessions;
              resolutionAction = 'terminate_oldest'; // Use as base action
            }
            break;
          case 'terminate_oldest':
            resolutionAction = 'terminate_oldest';
            break;
          case 'block_new':
            resolutionAction = 'block_new';
            break;
        }
      }

      // Execute enforcement action
      switch (resolutionAction) {
        case 'terminate_oldest':
          if (sessionsToTerminate.length === 0) {
            // Find oldest sessions to terminate
            const sessionsNeeded = conflict.conflict.currentSessionCount - conflict.conflict.allowedSessionCount + 1;
            sessionsToTerminate = this.selectOldestSessions(conflict.sessions, sessionsNeeded);
          }
          
          for (const sessionId of sessionsToTerminate) {
            try {
              const result = await this.terminationService.requestSessionTermination(
                sessionId,
                enforcedBy,
                {
                  type: 'policy_violation',
                  description: `Concurrent session limit exceeded for policy: ${policy.name}`,
                  severity: conflict.conflict.severity
                },
                {
                  ipAddress: '127.0.0.1', // System IP
                  userAgent: 'ConcurrentSessionPolicyService'
                }
              );
              
              if (result.success) {
                actionsPerformed.push(`Terminated session ${sessionId}`);
              } else {
                errors.push(`Failed to terminate session ${sessionId}: ${result.message}`);
              }
            } catch (error) {
              errors.push(`Error terminating session ${sessionId}: ${error.message}`);
            }
          }
          break;

        case 'terminate_all':
          for (const session of conflict.sessions) {
            try {
              const result = await this.terminationService.requestSessionTermination(
                session.sessionId,
                enforcedBy,
                {
                  type: 'policy_violation',
                  description: `All sessions terminated due to policy violation: ${policy.name}`,
                  severity: 'high'
                },
                {
                  ipAddress: '127.0.0.1',
                  userAgent: 'ConcurrentSessionPolicyService'
                }
              );
              
              if (result.success) {
                actionsPerformed.push(`Terminated session ${session.sessionId}`);
              } else {
                errors.push(`Failed to terminate session ${session.sessionId}: ${result.message}`);
              }
            } catch (error) {
              errors.push(`Error terminating session ${session.sessionId}: ${error.message}`);
            }
          }
          break;

        case 'degrade_oldest':
          const oldestSession = this.selectOldestSessions(conflict.sessions, 1)[0];
          if (oldestSession) {
            await this.degradeSession(oldestSession, policy);
            actionsPerformed.push(`Degraded session ${oldestSession}`);
          }
          break;

        case 'block_new':
          // Blocking is handled at the session creation level
          actionsPerformed.push('Blocked new session creation');
          break;

        case 'require_approval':
          await this.escalateForApproval(conflict, policy);
          actionsPerformed.push('Escalated for manual approval');
          break;
      }

      // Update conflict resolution
      conflict.resolution.status = 'resolved';
      conflict.resolution.resolvedAt = new Date();
      conflict.resolution.resolvedBy = enforcedBy;
      conflict.resolution.action = resolutionAction;
      conflict.resolution.terminatedSessions = sessionsToTerminate;

      // Log violation and resolution
      await this.logPolicyViolation(conflict, policy, actionsPerformed);

      // Notify user if configured
      if (policy.enforcement.notifyUser) {
        await this.notifyUserOfPolicyEnforcement(conflict, policy, actionsPerformed);
      }

      // Update cache
      await this.invalidateUserSessionCache(conflict.userId);

      this.emit('policyEnforced', {
        conflictId,
        userId: conflict.userId,
        policyId: policy.id,
        actionsPerformed,
        enforcedBy
      });

      return {
        success: errors.length === 0,
        actionsPerformed,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('Error enforcing concurrent session policy:', error);
      return {
        success: false,
        errors: ['Policy enforcement failed'],
        actionsPerformed
      };
    }
  }

  /**
   * Get policy statistics and analytics
   */
  async getPolicyStatistics(
    policyId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<PolicyStatistics> {
    try {
      const policy = this.policies.get(policyId);
      if (!policy) {
        throw new Error('Policy not found');
      }

      // Filter violations by time range
      const policyViolations = this.violations.filter(v => 
        v.policyId === policyId &&
        v.timestamp >= timeRange.start &&
        v.timestamp <= timeRange.end
      );

      // Calculate enforcement statistics
      const enforcement = {
        totalViolations: policyViolations.length,
        resolvedViolations: policyViolations.filter(v => v.details.success).length,
        blockedSessions: policyViolations.filter(v => v.details.actionTaken === 'block_new').length,
        terminatedSessions: policyViolations.filter(v => v.details.actionTaken.includes('terminate')).length,
        userNotifications: policyViolations.filter(v => v.followUp.adminNotified).length
      };

      // Analyze patterns
      const patterns = {
        peakViolationHours: this.calculatePeakViolationHours(policyViolations),
        topViolatingUsers: this.getTopViolatingUsers(policyViolations),
        commonViolationTypes: this.getCommonViolationTypes(policyViolations),
        deviceTypeBreakdown: this.getDeviceTypeBreakdown(policyViolations)
      };

      // Calculate effectiveness metrics
      const effectiveness = {
        violationResolutionRate: enforcement.totalViolations > 0 
          ? Math.round((enforcement.resolvedViolations / enforcement.totalViolations) * 100)
          : 100,
        averageResolutionTime: this.calculateAverageResolutionTime(policyViolations),
        userComplianceRate: this.calculateUserComplianceRate(policyViolations),
        policyBypassAttempts: this.countPolicyBypassAttempts(policyViolations)
      };

      // Generate recommendations
      const recommendations = await this.generatePolicyRecommendations(policy, policyViolations);

      return {
        policyId,
        timeRange,
        enforcement,
        patterns,
        effectiveness,
        recommendations
      };

    } catch (error) {
      console.error('Error generating policy statistics:', error);
      throw new Error('Failed to generate policy statistics');
    }
  }

  /**
   * Grant temporary exemption from policy
   */
  async grantTemporaryExemption(
    userId: string,
    policyId: string,
    exemptionDetails: {
      reason: string;
      durationHours: number;
      grantedBy: string;
      additionalSessions?: number;
    }
  ): Promise<{
    success: boolean;
    exemptionId?: string;
    expiresAt?: Date;
    message: string;
  }> {
    try {
      const policy = this.policies.get(policyId);
      if (!policy) {
        return {
          success: false,
          message: 'Policy not found'
        };
      }

      const expiresAt = new Date(Date.now() + exemptionDetails.durationHours * 60 * 60 * 1000);
      
      // Add exemption to policy
      if (!policy.exceptions.temporaryExemptions) {
        policy.exceptions.temporaryExemptions = [];
      }

      const exemption = {
        userId,
        reason: exemptionDetails.reason,
        expiresAt,
        grantedBy: exemptionDetails.grantedBy
      };

      policy.exceptions.temporaryExemptions.push(exemption);

      // Update policy in storage
      await this.savePolicyToDatabase(policy);

      // Log exemption
      await this.logPolicyEvent('exemption_granted', policyId, exemptionDetails.grantedBy, {
        userId,
        reason: exemptionDetails.reason,
        durationHours: exemptionDetails.durationHours,
        expiresAt
      });

      this.emit('exemptionGranted', {
        userId,
        policyId,
        grantedBy: exemptionDetails.grantedBy,
        expiresAt
      });

      return {
        success: true,
        exemptionId: `${policyId}-${userId}-${Date.now()}`,
        expiresAt,
        message: `Temporary exemption granted until ${expiresAt.toISOString()}`
      };

    } catch (error) {
      console.error('Error granting temporary exemption:', error);
      return {
        success: false,
        message: 'Failed to grant exemption'
      };
    }
  }

  // Private helper methods

  private async findApplicablePolicies(
    userId: string,
    context: any
  ): Promise<ConcurrentSessionPolicy[]> {
    const applicablePolicies: ConcurrentSessionPolicy[] = [];

    for (const policy of this.policies.values()) {
      if (!policy.enabled) continue;

      if (await this.isPolicyApplicable(policy, userId, context)) {
        applicablePolicies.push(policy);
      }
    }

    // Sort by priority (higher priority first)
    return applicablePolicies.sort((a, b) => b.priority - a.priority);
  }

  private async isPolicyApplicable(
    policy: ConcurrentSessionPolicy,
    userId: string,
    context: any
  ): Promise<boolean> {
    // Check global scope
    if (policy.scope.global) {
      return true;
    }

    // Check user roles
    if (policy.scope.userRoles && context.userRoles) {
      const hasRole = policy.scope.userRoles.some(role => 
        context.userRoles.includes(role)
      );
      if (hasRole) return true;
    }

    // Check session type
    if (policy.scope.sessionTypes && 
        policy.scope.sessionTypes.includes(context.sessionType)) {
      return true;
    }

    // Check device type
    if (policy.scope.deviceTypes && 
        policy.scope.deviceTypes.includes(context.deviceType)) {
      return true;
    }

    return false;
  }

  private async getUserActiveSessions(userId: string): Promise<any[]> {
    // Check cache first
    const cached = this.userSessionCache.get(userId);
    if (cached) {
      // Get full session details
      const sessions = [];
      for (const sessionId of cached) {
        const session = await this.sessionService.getSessionDetails(sessionId);
        if (session && session.status === 'active') {
          sessions.push(session);
        }
      }
      return sessions;
    }

    // Get from session service
    const sessions = await this.sessionService.getUserSessions(userId, {
      includeExpired: false,
      includeRevoked: false
    });

    // Cache session IDs
    const sessionIds = sessions.map(s => s.id);
    this.userSessionCache.set(userId, sessionIds);

    // Set cache expiry
    setTimeout(() => {
      this.userSessionCache.delete(userId);
    }, this.config.cacheExpirySeconds * 1000);

    return sessions;
  }

  private async checkPolicyViolation(
    policy: ConcurrentSessionPolicy,
    currentSessions: any[],
    newSessionContext: any
  ): Promise<string | null> {
    // Check max concurrent sessions
    if (currentSessions.length >= policy.limits.maxConcurrentSessions) {
      return `Maximum concurrent sessions exceeded: ${currentSessions.length}/${policy.limits.maxConcurrentSessions}`;
    }

    // Check device-specific limits
    if (policy.limits.maxSessionsPerDevice) {
      const deviceSessions = currentSessions.filter(s => 
        s.deviceId === newSessionContext.deviceId
      );
      if (deviceSessions.length >= policy.limits.maxSessionsPerDevice) {
        return `Maximum sessions per device exceeded: ${deviceSessions.length}/${policy.limits.maxSessionsPerDevice}`;
      }
    }

    // Check IP-specific limits
    if (policy.limits.maxSessionsPerIP) {
      const ipSessions = currentSessions.filter(s => 
        s.ipAddress === newSessionContext.ipAddress
      );
      if (ipSessions.length >= policy.limits.maxSessionsPerIP) {
        return `Maximum sessions per IP exceeded: ${ipSessions.length}/${policy.limits.maxSessionsPerIP}`;
      }
    }

    // Check location-specific limits
    if (policy.limits.maxSessionsPerLocation && newSessionContext.location) {
      const locationSessions = currentSessions.filter(s => 
        this.isSameLocation(s.location, newSessionContext.location, policy.detection.locationRadius || 50)
      );
      if (locationSessions.length >= policy.limits.maxSessionsPerLocation) {
        return `Maximum sessions per location exceeded: ${locationSessions.length}/${policy.limits.maxSessionsPerLocation}`;
      }
    }

    return null;
  }

  private async createSessionConflict(
    userId: string,
    policy: ConcurrentSessionPolicy,
    currentSessions: any[],
    newSessionContext: any,
    violationReason: string
  ): Promise<SessionConflict> {
    const conflict: SessionConflict = {
      id: this.generateConflictId(),
      userId,
      policyId: policy.id,
      detectedAt: new Date(),
      conflict: {
        type: 'max_sessions',
        severity: currentSessions.length > policy.limits.maxConcurrentSessions * 1.5 ? 'high' : 'medium',
        description: violationReason,
        currentSessionCount: currentSessions.length,
        allowedSessionCount: policy.limits.maxConcurrentSessions
      },
      sessions: currentSessions.map(s => ({
        sessionId: s.id,
        deviceId: s.deviceId,
        location: s.location,
        ipAddress: s.ipAddress,
        startTime: s.createdAt,
        lastActivity: s.lastActivity,
        riskScore: s.security?.riskScore || 0,
        trustLevel: s.security?.trustLevel || 'unknown'
      })),
      resolution: {
        status: 'pending',
        userNotified: false
      },
      context: {
        newSessionAttempt: newSessionContext,
        triggeringEvent: 'session_creation',
        automaticResolution: policy.enforcement.action !== 'require_approval'
      }
    };

    this.activeConflicts.set(conflict.id, conflict);
    return conflict;
  }

  private async determineConflictResolution(
    conflict: SessionConflict,
    policy: ConcurrentSessionPolicy
  ): Promise<{
    allowSession: boolean;
    requiresUserChoice: boolean;
    suggestedActions: string[];
  }> {
    switch (policy.enforcement.action) {
      case 'block_new':
        return {
          allowSession: false,
          requiresUserChoice: false,
          suggestedActions: ['Session blocked due to concurrent session limit']
        };

      case 'terminate_oldest':
        return {
          allowSession: true,
          requiresUserChoice: policy.enforcement.allowUserChoice || false,
          suggestedActions: ['Oldest session will be terminated', 'New session will be allowed']
        };

      case 'terminate_all':
        return {
          allowSession: true,
          requiresUserChoice: false,
          suggestedActions: ['All existing sessions will be terminated', 'New session will be allowed']
        };

      case 'require_approval':
        return {
          allowSession: false,
          requiresUserChoice: true,
          suggestedActions: ['Admin approval required', 'Choose sessions to terminate or wait for approval']
        };

      case 'degrade_oldest':
        return {
          allowSession: true,
          requiresUserChoice: false,
          suggestedActions: ['Oldest session will be degraded', 'New session will be allowed']
        };

      default:
        return {
          allowSession: false,
          requiresUserChoice: false,
          suggestedActions: ['Unknown enforcement action']
        };
    }
  }

  private selectOldestSessions(sessions: any[], count: number): string[] {
    return sessions
      .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
      .slice(0, count)
      .map(s => s.sessionId);
  }

  private async degradeSession(sessionId: string, policy: ConcurrentSessionPolicy): Promise<void> {
    // Implementation would reduce session privileges/capabilities
    console.log(`Degrading session ${sessionId} due to policy ${policy.name}`);
  }

  private async escalateForApproval(conflict: SessionConflict, policy: ConcurrentSessionPolicy): Promise<void> {
    // Implementation would send notification to administrators
    console.log(`Escalating conflict ${conflict.id} for manual approval`);
  }

  private isSameLocation(loc1: any, loc2: any, radiusKm: number): boolean {
    if (!loc1 || !loc2) return false;
    
    // Simplified distance calculation
    const distance = Math.abs(loc1.lat - loc2.lat) + Math.abs(loc1.lon - loc2.lon);
    return distance * 111 < radiusKm; // Rough km conversion
  }

  private async invalidateUserSessionCache(userId: string): Promise<void> {
    this.userSessionCache.delete(userId);
    await this.redis.del(`user_sessions:${userId}`);
  }

  private validatePolicyConfiguration(policy: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!policy.name || policy.name.trim().length === 0) {
      errors.push('Policy name is required');
    }

    if (!policy.limits.maxConcurrentSessions || policy.limits.maxConcurrentSessions < 1) {
      errors.push('Maximum concurrent sessions must be at least 1');
    }

    if (policy.limits.maxSessionsPerDevice && policy.limits.maxSessionsPerDevice < 1) {
      errors.push('Maximum sessions per device must be at least 1');
    }

    if (!['block_new', 'terminate_oldest', 'terminate_all', 'require_approval', 'degrade_oldest'].includes(policy.enforcement.action)) {
      errors.push('Invalid enforcement action');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private initializeDefaultPolicies(): void {
    const defaultPolicies: Array<Omit<ConcurrentSessionPolicy, 'id' | 'version' | 'metadata'>> = [
      {
        name: 'Standard User Concurrent Sessions',
        description: 'Standard policy for regular users',
        enabled: true,
        priority: 100,
        scope: {
          global: true,
          sessionTypes: ['web', 'mobile']
        },
        limits: {
          maxConcurrentSessions: 3,
          maxSessionsPerDevice: 2,
          excludeServiceAccounts: true
        },
        enforcement: {
          action: 'terminate_oldest',
          gracePeriod: 30,
          notifyUser: true,
          allowUserChoice: true,
          preserveActiveSession: true
        },
        exceptions: {
          adminOverride: true,
          emergencyAccess: true
        },
        detection: {
          realTimeChecking: true,
          checkInterval: 60,
          locationRadius: 100
        },
        monitoring: {
          auditEvents: true,
          alertOnViolations: true,
          metricsCollection: true,
          reportingEnabled: true
        },
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          tags: ['default', 'standard']
        }
      },
      {
        name: 'High Security Sessions',
        description: 'Strict policy for administrative and privileged sessions',
        enabled: true,
        priority: 200,
        scope: {
          global: false,
          userRoles: ['admin', 'security'],
          sessionTypes: ['admin', 'api']
        },
        limits: {
          maxConcurrentSessions: 2,
          maxSessionsPerDevice: 1,
          maxSessionsPerIP: 2
        },
        enforcement: {
          action: 'block_new',
          gracePeriod: 15,
          notifyUser: true,
          allowUserChoice: false,
          preserveActiveSession: true
        },
        exceptions: {
          adminOverride: false,
          emergencyAccess: true
        },
        detection: {
          realTimeChecking: true,
          checkInterval: 30,
          locationRadius: 50
        },
        monitoring: {
          auditEvents: true,
          alertOnViolations: true,
          metricsCollection: true,
          reportingEnabled: true
        },
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          tags: ['security', 'admin']
        }
      }
    ];

    defaultPolicies.forEach(policyData => {
      const id = this.generatePolicyId();
      const policy: ConcurrentSessionPolicy = { ...policyData, id, version: 1 };
      this.policies.set(id, policy);
    });
  }

  private startPeriodicChecking(): void {
    if (this.config.enableRealTimeChecking) {
      this.monitoringInterval = setInterval(async () => {
        await this.performPeriodicCheck();
      }, this.config.defaultCheckInterval * 1000);
    }
  }

  private async performPeriodicCheck(): Promise<void> {
    // Check all active sessions against policies
    console.log('Performing periodic concurrent session policy check');
  }

  private setupSessionEventListeners(): void {
    this.sessionService.on('sessionCreated', (event) => {
      this.handleSessionCreated(event);
    });

    this.sessionService.on('sessionTerminated', (event) => {
      this.handleSessionTerminated(event);
    });
  }

  private async handleSessionCreated(event: any): Promise<void> {
    // Invalidate cache for the user
    await this.invalidateUserSessionCache(event.userId);
  }

  private async handleSessionTerminated(event: any): Promise<void> {
    // Invalidate cache for the user
    await this.invalidateUserSessionCache(event.userId);
  }

  private async savePolicyToDatabase(policy: ConcurrentSessionPolicy): Promise<void> {
    // Implementation would save to database
    console.log(`Saving policy ${policy.id} to database`);
  }

  private async logPolicyEvent(action: string, policyId: string, userId: string, details: any): Promise<void> {
    console.log(`Policy Event: ${action} - ${policyId} by ${userId}`, details);
  }

  private async logPolicyViolation(
    conflict: SessionConflict,
    policy: ConcurrentSessionPolicy,
    actionsPerformed: string[]
  ): Promise<void> {
    const violation: SessionPolicyViolation = {
      id: this.generateViolationId(),
      userId: conflict.userId,
      policyId: policy.id,
      violationType: conflict.conflict.type,
      timestamp: new Date(),
      details: {
        violationReason: conflict.conflict.description,
        sessionDetails: conflict.sessions,
        policyConstraints: policy.limits,
        actionTaken: actionsPerformed.join(', '),
        success: conflict.resolution.status === 'resolved'
      },
      impact: {
        sessionsAffected: conflict.sessions.length,
        userImpact: conflict.conflict.severity === 'high' ? 'severe' : 'moderate',
        businessImpact: 'Session management policy enforcement'
      },
      followUp: {
        escalationRequired: conflict.conflict.severity === 'critical',
        adminNotified: policy.monitoring.alertOnViolations,
        userEducationNeeded: true,
        policyReviewSuggested: false
      }
    };

    this.violations.push(violation);

    // Keep only recent violations
    if (this.violations.length > this.config.maxViolationHistory) {
      this.violations.shift();
    }
  }

  private async notifyUserOfPolicyEnforcement(
    conflict: SessionConflict,
    policy: ConcurrentSessionPolicy,
    actionsPerformed: string[]
  ): Promise<void> {
    // Implementation would send notification to user
    console.log(`Notifying user ${conflict.userId} of policy enforcement`, {
      policy: policy.name,
      actions: actionsPerformed
    });
  }

  private calculatePeakViolationHours(violations: SessionPolicyViolation[]): Array<{ hour: number; count: number }> {
    const hourCounts: Record<number, number> = {};
    
    violations.forEach(violation => {
      const hour = violation.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);
  }

  private getTopViolatingUsers(violations: SessionPolicyViolation[]): Array<{ userId: string; violations: number }> {
    const userCounts: Record<string, number> = {};
    
    violations.forEach(violation => {
      userCounts[violation.userId] = (userCounts[violation.userId] || 0) + 1;
    });

    return Object.entries(userCounts)
      .map(([userId, violations]) => ({ userId, violations }))
      .sort((a, b) => b.violations - a.violations)
      .slice(0, 10);
  }

  private getCommonViolationTypes(violations: SessionPolicyViolation[]): Array<{ type: string; count: number }> {
    const typeCounts: Record<string, number> = {};
    
    violations.forEach(violation => {
      typeCounts[violation.violationType] = (typeCounts[violation.violationType] || 0) + 1;
    });

    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  private getDeviceTypeBreakdown(violations: SessionPolicyViolation[]): Record<string, number> {
    // Implementation would extract device types from violation details
    return {
      'web': violations.filter(v => v.details.sessionDetails.some?.((s: any) => s.deviceType === 'web')).length,
      'mobile': violations.filter(v => v.details.sessionDetails.some?.((s: any) => s.deviceType === 'mobile')).length,
      'api': violations.filter(v => v.details.sessionDetails.some?.((s: any) => s.deviceType === 'api')).length
    };
  }

  private calculateAverageResolutionTime(violations: SessionPolicyViolation[]): number {
    // Implementation would calculate average time from violation to resolution
    return 300; // 5 minutes default
  }

  private calculateUserComplianceRate(violations: SessionPolicyViolation[]): number {
    const compliantViolations = violations.filter(v => v.details.success).length;
    return violations.length > 0 ? Math.round((compliantViolations / violations.length) * 100) : 100;
  }

  private countPolicyBypassAttempts(violations: SessionPolicyViolation[]): number {
    return violations.filter(v => v.details.actionTaken === 'bypass_attempted').length;
  }

  private async generatePolicyRecommendations(
    policy: ConcurrentSessionPolicy,
    violations: SessionPolicyViolation[]
  ): Promise<Array<{
    type: 'policy_adjustment' | 'limit_change' | 'exception_review';
    description: string;
    impact: string;
    confidence: number;
  }>> {
    const recommendations = [];

    // High violation rate suggests limits might be too restrictive
    if (violations.length > 10) {
      recommendations.push({
        type: 'limit_change' as const,
        description: `Consider increasing concurrent session limit from ${policy.limits.maxConcurrentSessions}`,
        impact: 'Reduced user friction, potentially increased security risk',
        confidence: 75
      });
    }

    // Many failed resolutions suggest enforcement action needs adjustment
    const failedResolutions = violations.filter(v => !v.details.success).length;
    if (failedResolutions > violations.length * 0.3) {
      recommendations.push({
        type: 'policy_adjustment' as const,
        description: 'Review enforcement action effectiveness',
        impact: 'Improved policy compliance',
        confidence: 85
      });
    }

    return recommendations;
  }

  private generatePolicyId(): string {
    return `CSP-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
  }

  private generateConflictId(): string {
    return `CSC-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
  }

  private generateViolationId(): string {
    return `CSV-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
  }

  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.policies.clear();
    this.activeConflicts.clear();
    this.violations = [];
    this.userSessionCache.clear();
  }
}
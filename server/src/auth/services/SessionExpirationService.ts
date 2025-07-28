/**
 * Session Expiration Service - Epic 19 Implementation
 * Comprehensive session expiration with configurable policies and automatic cleanup
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

}
export interface ExpirationPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  
  timing: {
    absoluteTimeout: number; // seconds - maximum session duration
    idleTimeout: number; // seconds - timeout after inactivity
    warningPeriod: number; // seconds - warning before expiration
    gracePeriod: number; // seconds - grace period after expiration
    slidingWindow: boolean; // extend on activity
}
  };
  
  applicability: {
    userRoles?: string[];
    sessionTypes?: string[];
    trustLevels?: string[];
    environments?: string[];
  };
  
  behavior: {
    autoExtend: boolean;
    maxExtensions: number;
    extensionDuration: number; // seconds
    requireReauth: boolean;
    preserveData: boolean;
  };
  
  notifications: {
    warningEnabled: boolean;
    expirationEnabled: boolean;
    methods: ('email' | 'push' | 'websocket' | 'ui')[];
    templates: {
      warning?: string;
      expiration?: string;
      expired?: string;
    };
  };
  
  cleanup: {
    immediateCleanup: boolean;
    retentionPeriod: number; // seconds after expiration
    archiveData: boolean;
    anonymizeData: boolean;
  };
}

}
export interface SessionExpiration {
  sessionId: string;
  userId: string;
  policyId: string;
  
  timestamps: {
    createdAt: Date;
    lastActivity: Date;
    willExpireAt: Date;
    warningAt?: Date;
    expiredAt?: Date;
    cleanupAt?: Date;
}
  };
  
  status: 'active' | 'warning' | 'expiring' | 'expired' | 'grace' | 'cleaned';
  
  counters: {
    extensionCount: number;
    warningsSent: number;
    activityCount: number;
    idleTime: number; // seconds
  };
  
  metadata: {
    sessionType: string;
    trustLevel: string;
    deviceId: string;
    ipAddress: string;
    userAgent: string;
    lastEndpoint?: string;
  };
  
  extensions: Array<{
    extendedAt: Date;
    extendedBy: string;
    duration: number;
    reason: string;
  }>;
  
  notifications: Array<{
    type: 'warning' | 'expiration' | 'extension';
    sentAt: Date;
    method: string;
    success: boolean;
    response?: string;
  }>;
}

}
export interface ExpirationEvent {
  id: string;
  sessionId: string;
  userId: string;
  eventType: 'created' | 'activity' | 'warning' | 'extended' | 'expired' | 'cleaned' | 'restored';
  timestamp: Date;
  details: Record<string, any>;
  triggeredBy: string;
}
}

export class SessionExpirationService extends EventEmitter {
  private policies: Map<string, ExpirationPolicy> = new Map();
  private sessionExpirations: Map<string, SessionExpiration> = new Map();
  private expirationTimers: Map<string, NodeJS.Timeout> = new Map();
  private warningTimers: Map<string, NodeJS.Timeout> = new Map();
  private cleanupTimers: Map<string, NodeJS.Timeout> = new Map();
  private events: ExpirationEvent[] = [];
  private maintenanceInterval: NodeJS.Timeout;

  constructor() {
    super();
    this.initializeDefaultPolicies();
    this.startMaintenanceTasks();
  }

  /**
   * Register a new expiration policy
   */
  async registerPolicy(
    policyData: Omit<ExpirationPolicy, 'id'>,
    createdBy: string
  ): Promise<ExpirationPolicy> {

    const policy: ExpirationPolicy = {
      ...policyData,
      id: this.generatePolicyId()
    };

    await this.validatePolicy(policy);
    this.policies.set(policy.id, policy);

    await this.logEvent('policy_registered', 'system', createdBy, {
      policyId: policy.id,
      policyName: policy.name
    });

    this.emit('policyRegistered', policy);
    return policy;
  }

  /**
   * Initialize session expiration tracking
   */
  async initializeSession(
    sessionId: string,
    userId: string,
    context: {
      sessionType: string;
      trustLevel: string;
      deviceId: string;
      ipAddress: string;
      userAgent: string;
      userRoles?: string[];
    }
  ): Promise<SessionExpiration> {

    // Find applicable policy
    const policy = await this.findApplicablePolicy(context);
    if (!policy) {
      throw new Error('No applicable expiration policy found');
    }

    const now = new Date();
    const willExpireAt = new Date(now.getTime() + policy.timing.absoluteTimeout * 1000);
    const warningAt = policy.notifications.warningEnabled
      ? new Date(willExpireAt.getTime() - policy.timing.warningPeriod * 1000)
      : undefined;

    const expiration: SessionExpiration = {
      sessionId,
      userId,
      policyId: policy.id,
      timestamps: {
        createdAt: now,
        lastActivity: now,
        willExpireAt,
        warningAt
  }
      status: 'active',
      counters: {
        extensionCount: 0,
        warningsSent: 0,
        activityCount: 0,
        idleTime: 0
  }
      metadata: {
        sessionType: context.sessionType,
        trustLevel: context.trustLevel,
        deviceId: context.deviceId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
  }
      extensions: [],
      notifications: []
    };

    // Store expiration data
    this.sessionExpirations.set(sessionId, expiration);

    // Set up timers
    this.scheduleExpirationTimers(sessionId, expiration, policy);

    await this.logEvent('session_initialized', sessionId, userId, {
      policyId: policy.id,
      absoluteTimeout: policy.timing.absoluteTimeout,
      idleTimeout: policy.timing.idleTimeout,
      willExpireAt
    });

    this.emit('sessionInitialized', { sessionId, expiration });
    return expiration;
  }

  /**
   * Update session activity and check expiration
   */
  async updateActivity(
    sessionId: string,
    context: {
      endpoint?: string;
      ipAddress?: string;
      timestamp?: Date;
    } = {}
  ): Promise<{
    status: SessionExpiration['status'];
    remainingTime: number;
    requiresAction?: string[];
    extended?: boolean;
  }> {

    const expiration = this.sessionExpirations.get(sessionId);
    if (!expiration) {
      return {
        status: 'expired',
        remainingTime: 0,
        requiresAction: ['reauthenticate']
      };
    }

    const policy = this.policies.get(expiration.policyId);
    if (!policy) {
      throw new Error('Policy not found');
    }

    const now = context.timestamp || new Date();
    const previousActivity = expiration.timestamps.lastActivity;
    const idleTime = (now.getTime() - previousActivity.getTime()) / 1000;

    // Update activity
    expiration.timestamps.lastActivity = now;
    expiration.counters.activityCount++;
    expiration.counters.idleTime = 0;
    
    if (context.endpoint) {
      expiration.metadata.lastEndpoint = context.endpoint;
    }

    // Check idle timeout
    if (idleTime > policy.timing.idleTimeout) {
      await this.expireSession(sessionId, 'idle_timeout');
      return {
        status: 'expired',
        remainingTime: 0,
        requiresAction: ['reauthenticate']
      };
    }

    // Extend session if sliding window is enabled
    let extended = false;
    if (policy.timing.slidingWindow && expiration.status === 'active') {
      const newExpiration = new Date(now.getTime() + policy.timing.absoluteTimeout * 1000);
      if (newExpiration > expiration.timestamps.willExpireAt) {
        expiration.timestamps.willExpireAt = newExpiration;
        extended = true;
        
        // Reschedule timers
        this.scheduleExpirationTimers(sessionId, expiration, policy);
      }
    }

    // Calculate remaining time
    const remainingTime = Math.max(0, 
      (expiration.timestamps.willExpireAt.getTime() - now.getTime()) / 1000
    );

    // Determine required actions
    const requiresAction = [];
    if (expiration.status === 'warning') {
      requiresAction.push('acknowledge_warning');
    }
    if (remainingTime < 300 && policy.behavior.requireReauth) { // 5 minutes
      requiresAction.push('prepare_reauthentication');
    }

    return {
      status: expiration.status,
      remainingTime,
      requiresAction: requiresAction.length > 0 ? requiresAction : undefined,
      extended
    };
  }

  /**
   * Extend session with policy validation
   */
  async extendSession(
    sessionId: string,
    requestedBy: string,
    reason: string,
    duration?: number
  ): Promise<{
    success: boolean;
    newExpiration?: Date;
    remainingExtensions?: number;
    message: string;
  }> {

    const expiration = this.sessionExpirations.get(sessionId);
    if (!expiration) {
      return {
        success: false,
        message: 'Session not found'
      };
    }

    const policy = this.policies.get(expiration.policyId);
    if (!policy) {
      return {
        success: false,
        message: 'Policy not found'
      };
    }

    // Check if extensions are allowed
    if (!policy.behavior.autoExtend) {
      return {
        success: false,
        message: 'Session extensions not allowed by policy'
      };
    }

    // Check extension limit
    if (expiration.counters.extensionCount >= policy.behavior.maxExtensions) {
      return {
        success: false,
        message: `Maximum extensions (${policy.behavior.maxExtensions}) reached`
      };
    }

    // Check if session is eligible for extension
    if (!['active', 'warning'].includes(expiration.status)) {
      return {
        success: false,
        message: `Cannot extend session in ${expiration.status} status`
      };
    }

    // Calculate extension duration
    const extensionDuration = duration || policy.behavior.extensionDuration;
    const now = new Date();
    const newExpiration = new Date(expiration.timestamps.willExpireAt.getTime() + extensionDuration * 1000);

    // Apply extension
    expiration.timestamps.willExpireAt = newExpiration;
    expiration.counters.extensionCount++;
    expiration.status = 'active'; // Reset to active if was in warning
    
    // Record extension
    expiration.extensions.push({
      extendedAt: now,
      extendedBy: requestedBy,
      duration: extensionDuration,
      reason
    });

    // Reschedule timers
    this.scheduleExpirationTimers(sessionId, expiration, policy);

    await this.logEvent('session_extended', sessionId, requestedBy, {
      duration: extensionDuration,
      newExpiration,
      extensionCount: expiration.counters.extensionCount,
      reason
    });

    this.emit('sessionExtended', {
      sessionId,
      userId: expiration.userId,
      newExpiration,
      extensionCount: expiration.counters.extensionCount
    });

    return {
      success: true,
      newExpiration,
      remainingExtensions: policy.behavior.maxExtensions - expiration.counters.extensionCount,
      message: 'Session extended successfully'
    };
  }

  /**
   * Handle session expiration with grace period
   */
  async expireSession(
    sessionId: string,
    reason: string
  ): Promise<void> {

    const expiration = this.sessionExpirations.get(sessionId);
    if (!expiration) return;

    const policy = this.policies.get(expiration.policyId);
    if (!policy) return;

    const now = new Date();
    
    // Update status based on grace period
    if (policy.timing.gracePeriod > 0 && expiration.status !== 'grace') {
      expiration.status = 'grace';
      expiration.timestamps.expiredAt = now;
      
      // Schedule final expiration after grace period
      const graceTimer = setTimeout(() => {
        this.finalizeExpiration(sessionId);
      }, policy.timing.gracePeriod * 1000);
      
      this.expirationTimers.set(`grace-${sessionId}`, graceTimer);
      
      // Send expiration notification
      await this.sendExpirationNotification(expiration, 'grace_period');
    } else {
      await this.finalizeExpiration(sessionId);
    }

    await this.logEvent('session_expired', sessionId, 'system', {
      reason,
      hadGracePeriod: policy.timing.gracePeriod > 0
    });

    this.emit('sessionExpired', {
      sessionId,
      userId: expiration.userId,
      reason,
      inGracePeriod: expiration.status === 'grace'
    });
  }

  /**
   * Get session expiration status and details
   */
  async getExpirationStatus(sessionId: string): Promise<{
    exists: boolean;
    status?: SessionExpiration['status'];
    remainingTime?: number;
    idleTime?: number;
    extensionsRemaining?: number;
    warningActive?: boolean;
    canExtend?: boolean;
    details?: {
      createdAt: Date;
      willExpireAt: Date;
      lastActivity: Date;
      extensionCount: number;
      policy: string;
    };
  }> {

    const expiration = this.sessionExpirations.get(sessionId);
    if (!expiration) {
      return { exists: false };
    }

    const policy = this.policies.get(expiration.policyId);
    const now = new Date();
    
    const remainingTime = Math.max(0, 
      (expiration.timestamps.willExpireAt.getTime() - now.getTime()) / 1000
    );
    
    const idleTime = (now.getTime() - expiration.timestamps.lastActivity.getTime()) / 1000;
    
    const extensionsRemaining = policy 
      ? policy.behavior.maxExtensions - expiration.counters.extensionCount
      : 0;

    return {
      exists: true,
      status: expiration.status,
      remainingTime,
      idleTime,
      extensionsRemaining,
      warningActive: expiration.status === 'warning',
      canExtend: policy?.behavior.autoExtend && extensionsRemaining > 0,
      details: {
        createdAt: expiration.timestamps.createdAt,
        willExpireAt: expiration.timestamps.willExpireAt,
        lastActivity: expiration.timestamps.lastActivity,
        extensionCount: expiration.counters.extensionCount,
        policy: policy?.name || 'Unknown'
      }
    };
  }

  /**
   * Bulk expire sessions (admin action)
   */
  async bulkExpireSessions(
    criteria: {
      userIds?: string[];
      sessionTypes?: string[];
      olderThan?: Date;
      idleFor?: number; // seconds
  }
    expiredBy: string,
    reason: string
  ): Promise<{
    expiredCount: number;
    sessionIds: string[];
  }> {

    const sessionsToExpire = [];
    const now = new Date();

    for (const [sessionId, expiration] of this.sessionExpirations.entries()) {
      let shouldExpire = false;

      if (criteria.userIds?.includes(expiration.userId)) {
        shouldExpire = true;
      }
      
      if (criteria.sessionTypes?.includes(expiration.metadata.sessionType)) {
        shouldExpire = true;
      }
      
      if (criteria.olderThan && expiration.timestamps.createdAt < criteria.olderThan) {
        shouldExpire = true;
      }
      
      if (criteria.idleFor) {
        const idleTime = (now.getTime() - expiration.timestamps.lastActivity.getTime()) / 1000;
        if (idleTime > criteria.idleFor) {
          shouldExpire = true;
        }
      }

      if (shouldExpire && expiration.status === 'active') {
        sessionsToExpire.push(sessionId);
      }
    }

    // Expire all matching sessions
    for (const sessionId of sessionsToExpire) {
      await this.expireSession(sessionId, `bulk_expire: ${reason}`);
    }

    await this.logEvent('bulk_expire', 'system', expiredBy, {
      criteria,
      expiredCount: sessionsToExpire.length,
      reason
    });

    return {
      expiredCount: sessionsToExpire.length,
      sessionIds: sessionsToExpire
    };
  }

  // Private helper methods

  private initializeDefaultPolicies(): void {
    const policies: Array<Omit<ExpirationPolicy, 'id'>> = [
      {
        name: 'Standard Session',
        description: 'Default expiration policy for standard user sessions',
        enabled: true,
        priority: 100,
        timing: {
          absoluteTimeout: 3600, // 1 hour
          idleTimeout: 1800, // 30 minutes
          warningPeriod: 300, // 5 minutes
          gracePeriod: 60, // 1 minute
          slidingWindow: true
  }
        applicability: {
          sessionTypes: ['web', 'mobile'],
          trustLevels: ['trusted', 'verified']
  }
        behavior: {
          autoExtend: true,
          maxExtensions: 3,
          extensionDuration: 1800, // 30 minutes
          requireReauth: false,
          preserveData: true
  }
        notifications: {
          warningEnabled: true,
          expirationEnabled: true,
          methods: ['websocket', 'ui'],
          templates: {}
  }
        cleanup: {
          immediateCleanup: false,
          retentionPeriod: 3600, // 1 hour
          archiveData: true,
          anonymizeData: false
        }
  }
      {
        name: 'High Security Session',
        description: 'Strict expiration for high-security operations',
        enabled: true,
        priority: 200,
        timing: {
          absoluteTimeout: 900, // 15 minutes
          idleTimeout: 300, // 5 minutes
          warningPeriod: 120, // 2 minutes
          gracePeriod: 0, // No grace period
          slidingWindow: false
  }
        applicability: {
          sessionTypes: ['admin', 'api'],
          trustLevels: ['verified']
  }
        behavior: {
          autoExtend: false,
          maxExtensions: 0,
          extensionDuration: 0,
          requireReauth: true,
          preserveData: false
  }
        notifications: {
          warningEnabled: true,
          expirationEnabled: true,
          methods: ['email', 'websocket', 'ui'],
          templates: {}
  }
        cleanup: {
          immediateCleanup: true,
          retentionPeriod: 0,
          archiveData: true,
          anonymizeData: true
        }
      }
    ];

    for (const policyData of policies) {
      this.registerPolicy(policyData, 'system');
    }
  }

  private async findApplicablePolicy(context: any): Promise<ExpirationPolicy | null> {

    const applicablePolicies = [];

    for (const policy of this.policies.values()) {
      if (!policy.enabled) continue;

      let isApplicable = true;

      // Check session type
      if (policy.applicability.sessionTypes && 
          !policy.applicability.sessionTypes.includes(context.sessionType)) {
        isApplicable = false;
      }

      // Check trust level
      if (policy.applicability.trustLevels && 
          !policy.applicability.trustLevels.includes(context.trustLevel)) {
        isApplicable = false;
      }

      // Check user roles
      if (policy.applicability.userRoles && context.userRoles) {
        const hasRole = policy.applicability.userRoles.some(role => 
          context.userRoles.includes(role)
        );
        if (!hasRole) isApplicable = false;
      }

      if (isApplicable) {
        applicablePolicies.push(policy);
      }
    }

    // Return highest priority policy
    return applicablePolicies.sort((a, b) => b.priority - a.priority)[0] || null;
  }

  private scheduleExpirationTimers(
    sessionId: string,
    expiration: SessionExpiration,
    policy: ExpirationPolicy
  ): void {
    // Clear existing timers
    this.clearTimers(sessionId);

    const now = Date.now();

    // Schedule warning timer
    if (policy.notifications.warningEnabled && expiration.timestamps.warningAt) {
      const warningDelay = expiration.timestamps.warningAt.getTime() - now;
      if (warningDelay > 0) {
        const warningTimer = setTimeout(() => {
          this.triggerWarning(sessionId);
        }, warningDelay);
        this.warningTimers.set(sessionId, warningTimer);
      }
    }

    // Schedule expiration timer
    const expirationDelay = expiration.timestamps.willExpireAt.getTime() - now;
    if (expirationDelay > 0) {
      const expirationTimer = setTimeout(() => {
        this.expireSession(sessionId, 'absolute_timeout');
      }, expirationDelay);
      this.expirationTimers.set(sessionId, expirationTimer);
    }

    // Schedule idle check
    if (policy.timing.idleTimeout > 0) {
      const idleTimer = setInterval(() => {
        this.checkIdleTimeout(sessionId);
      }, Math.min(policy.timing.idleTimeout * 1000 / 2, 60000)); // Check at half idle timeout or 1 minute
      this.expirationTimers.set(`idle-${sessionId}`, idleTimer);
    }
  }

  private clearTimers(sessionId: string): void {
    // Clear warning timer
    const warningTimer = this.warningTimers.get(sessionId);
    if (warningTimer) {
      clearTimeout(warningTimer);
      this.warningTimers.delete(sessionId);
    }

    // Clear expiration timers
    const expirationTimer = this.expirationTimers.get(sessionId);
    if (expirationTimer) {
      clearTimeout(expirationTimer);
      this.expirationTimers.delete(sessionId);
    }

    // Clear idle timer
    const idleTimer = this.expirationTimers.get(`idle-${sessionId}`);
    if (idleTimer) {
      clearInterval(idleTimer);
      this.expirationTimers.delete(`idle-${sessionId}`);
    }

    // Clear grace timer
    const graceTimer = this.expirationTimers.get(`grace-${sessionId}`);
    if (graceTimer) {
      clearTimeout(graceTimer);
      this.expirationTimers.delete(`grace-${sessionId}`);
    }

    // Clear cleanup timer
    const cleanupTimer = this.cleanupTimers.get(sessionId);
    if (cleanupTimer) {
      clearTimeout(cleanupTimer);
      this.cleanupTimers.delete(sessionId);
    }
  }

  private async triggerWarning(sessionId: string): Promise<void> {

    const expiration = this.sessionExpirations.get(sessionId);
    if (!expiration || expiration.status !== 'active') return;

    expiration.status = 'warning';
    await this.sendExpirationNotification(expiration, 'warning');

    this.emit('sessionWarning', {
      sessionId,
      userId: expiration.userId,
      expiresIn: (expiration.timestamps.willExpireAt.getTime() - Date.now()) / 1000
    });
  }

  private async checkIdleTimeout(sessionId: string): Promise<void> {

    const expiration = this.sessionExpirations.get(sessionId);
    if (!expiration) return;

    const policy = this.policies.get(expiration.policyId);
    if (!policy) return;

    const idleTime = (Date.now() - expiration.timestamps.lastActivity.getTime()) / 1000;
    
    if (idleTime > policy.timing.idleTimeout) {
      await this.expireSession(sessionId, 'idle_timeout');
    }
  }

  private async finalizeExpiration(sessionId: string): Promise<void> {

    const expiration = this.sessionExpirations.get(sessionId);
    if (!expiration) return;

    const policy = this.policies.get(expiration.policyId);
    
    expiration.status = 'expired';
    expiration.timestamps.expiredAt = expiration.timestamps.expiredAt || new Date();

    // Clear all timers
    this.clearTimers(sessionId);

    // Schedule cleanup if not immediate
    if (policy && !policy.cleanup.immediateCleanup) {
      const cleanupDelay = policy.cleanup.retentionPeriod * 1000;
      const cleanupTimer = setTimeout(() => {
        this.cleanupSession(sessionId);
      }, cleanupDelay);
      this.cleanupTimers.set(sessionId, cleanupTimer);
    } else {
      await this.cleanupSession(sessionId);
    }

    // Send final notification
    await this.sendExpirationNotification(expiration, 'expired');
  }

  private async cleanupSession(sessionId: string): Promise<void> {

    const expiration = this.sessionExpirations.get(sessionId);
    if (!expiration) return;

    const policy = this.policies.get(expiration.policyId);
    
    // Archive data if configured
    if (policy?.cleanup.archiveData) {
      await this.archiveSessionData(expiration, policy.cleanup.anonymizeData);
    }

    // Remove from active tracking
    this.sessionExpirations.delete(sessionId);
    this.clearTimers(sessionId);

    expiration.status = 'cleaned';
    expiration.timestamps.cleanupAt = new Date();

    await this.logEvent('session_cleaned', sessionId, 'system', {
      archived: policy?.cleanup.archiveData,
      anonymized: policy?.cleanup.anonymizeData
    });

    this.emit('sessionCleaned', {
      sessionId,
      userId: expiration.userId
    });
  }

  private async sendExpirationNotification(
    expiration: SessionExpiration,
    type: 'warning' | 'grace_period' | 'expired'
  ): Promise<void> {

    const policy = this.policies.get(expiration.policyId);
    if (!policy) return;

    const notification = {
      type: type as any,
      sentAt: new Date(),
      method: '',
      success: false
    };

    // Send notifications via configured methods
    for (const method of policy.notifications.methods) {
      try {
        await this.sendNotification(method, expiration, type);
        notification.method = method;
        notification.success = true;
        expiration.notifications.push({ ...notification });
      } catch (error) {
        console.error(`Failed to send ${type} notification via ${method}:`, error);
      }
    }

    expiration.counters.warningsSent++;
  }

  private async sendNotification(
    method: string,
    expiration: SessionExpiration,
    type: string
  ): Promise<void> {

    // Implementation would integrate with actual notification services
    console.log(`Sending ${type} notification via ${method} for session ${expiration.sessionId}`);
    
    this.emit('notificationSent', {
      sessionId: expiration.sessionId,
      userId: expiration.userId,
      type,
      method
    });
  }

  private async archiveSessionData(
    expiration: SessionExpiration,
    anonymize: boolean
  ): Promise<void> {

    const archiveData = { ...expiration };
    
    if (anonymize) {
      // Anonymize sensitive data
      archiveData.userId = crypto.createHash('sha256').update(archiveData.userId).digest('hex');
      archiveData.metadata.ipAddress = 'anonymized';
      archiveData.metadata.userAgent = 'anonymized';
    }
    
    // Implementation would store in archive system
    console.log(`Archiving session data for ${expiration.sessionId}`);
  }

  private startMaintenanceTasks(): void {
    this.maintenanceInterval = setInterval(() => {
      this.performMaintenance();
    }, 60 * 1000); // Every minute
  }

  private performMaintenance(): void {
    // Clean up old events
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp > oneWeekAgo);
    
    // Check for stuck sessions
    for (const [sessionId, expiration] of this.sessionExpirations.entries()) {
      if (expiration.status === 'expired' && !this.cleanupTimers.has(sessionId)) {
        // Session is expired but has no cleanup timer - clean it up
        this.cleanupSession(sessionId);
      }
    }
  }

  private async validatePolicy(policy: ExpirationPolicy): Promise<void> {

    if (policy.timing.absoluteTimeout <= 0) {
      throw new Error('Absolute timeout must be positive');
    }
    
    if (policy.timing.idleTimeout < 0) {
      throw new Error('Idle timeout cannot be negative');
    }
    
    if (policy.timing.warningPeriod >= policy.timing.absoluteTimeout) {
      throw new Error('Warning period must be less than absolute timeout');
    }
  }

  private generatePolicyId(): string {
    return `EXP-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  private async logEvent(
    eventType: string,
    sessionId: string,
    triggeredBy: string,
    details: Record<string, any>
  ): Promise<void> {

    const event: ExpirationEvent = {
      id: `EVT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      sessionId,
      userId: this.sessionExpirations.get(sessionId)?.userId || 'unknown',
      eventType: eventType as any,
      timestamp: new Date(),
      details,
      triggeredBy
    };
    
    this.events.push(event);
    
    console.log(`Session Expiration Event: ${eventType} for ${sessionId} by ${triggeredBy}`, details);
  }

  destroy(): void {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
    }
    
    // Clear all timers
    for (const timer of this.warningTimers.values()) {
      clearTimeout(timer);
    }
    for (const timer of this.expirationTimers.values()) {
      if (typeof timer === 'number') {
        clearInterval(timer);
      } else {
        clearTimeout(timer);
      }
    }
    for (const timer of this.cleanupTimers.values()) {
      clearTimeout(timer);
    }
  }
}
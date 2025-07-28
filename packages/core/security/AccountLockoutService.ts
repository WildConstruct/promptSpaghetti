/**
 * Account Lockout Management Service
 * 
 * Comprehensive account lockout system with administrator unlock capabilities,
 * secure audit trails, and user notification management for MFA systems.
 * 
 * Features:
 * - Automated account lockout detection
 * - Secure administrator unlock procedures
 * - Comprehensive audit logging
 * - User notification system
 * - Emergency unlock capabilities
 * - Compliance reporting
 */
import { EventEmitter } from 'events';
import crypto from 'crypto';

// Lockout Status Types
export enum LockoutStatus {
  ACTIVE = 'active',
  PENDING_REVIEW = 'pending_review',
  UNLOCKED = 'unlocked',
  EXPIRED = 'expired',
  ESCALATED = 'escalated'
}

// Lockout Reasons
export enum LockoutReason {
  EXCESSIVE_FAILED_ATTEMPTS = 'excessive_failed_attempts',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_POLICY_VIOLATION = 'security_policy_violation',
  ADMIN_MANUAL_LOCK = 'admin_manual_lock',
  SYSTEM_SECURITY_ALERT = 'system_security_alert',
  COMPLIANCE_REQUIREMENT = 'compliance_requirement'
}

// Unlock Methods
export enum UnlockMethod {
  ADMIN_OVERRIDE = 'admin_override',
  SELF_SERVICE_RESET = 'self_service_reset',
  AUTOMATIC_EXPIRY = 'automatic_expiry',
  SECURITY_REVIEW = 'security_review',
  EMERGENCY_UNLOCK = 'emergency_unlock'
}

// Administrator Roles
export enum AdminRole {
  SECURITY_ADMIN = 'security_admin',
  SYSTEM_ADMIN = 'system_admin',
  HELP_DESK = 'help_desk',
  SUPER_ADMIN = 'super_admin',
  COMPLIANCE_OFFICER = 'compliance_officer'
}

// Notification Types
export enum NotificationType {
  LOCKOUT_NOTIFICATION = 'lockout_notification',
  UNLOCK_NOTIFICATION = 'unlock_notification',
  SECURITY_ALERT = 'security_alert',
  ADMIN_ACTION_REQUIRED = 'admin_action_required',
  COMPLIANCE_REPORT = 'compliance_report'
}

export interface AccountLockout {
  id: string;
  userId: string;
  userEmail: string;
  status: LockoutStatus;
  reason: LockoutReason;
  lockoutTime: Date;
  expiryTime?: Date;
  unlockTime?: Date;
  failedAttempts: number;
  securityEvents: string[];
  metadata: {,
    ipAddress?: string;
    userAgent?: string;
    geolocation?: string;
    riskScore: number;
    threatLevel: string;
  };
  adminActions: AdminAction[];
  notifications: LockoutNotification[];
  auditTrail: AuditEntry[];
}

export interface AdminAction {
  id: string;
  adminId: string;
  adminEmail: string;
  adminRole: AdminRole;
  action: 'unlock' | 'extend_lockout' | 'escalate' | 'review' | 'approve';
  reason: string;
  timestamp: Date;
  ipAddress: string;
  authenticationMethod: string;
  approvalRequired: boolean;
  approvedBy?: string;
  approvalTime?: Date;
  metadata: Record<string, any>;
}

export interface LockoutNotification {
  id: string;
  type: NotificationType;
  recipient: string;
  channel: 'email' | 'sms' | 'push' | 'admin_console';
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  event: string;
  actor: string;
  actorType: 'user' | 'admin' | 'system';
  details: Record<string, any>;
  ipAddress?: string;
  sessionId?: string;
}

export interface UnlockRequest {
  lockoutId: string;
  adminId: string;
  reason: string;
  method: UnlockMethod;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  justification: string;
  approvalRequired: boolean;
  metadata?: Record<string, any>;
}

export interface UnlockPolicy {
  adminRole: AdminRole;
  canUnlock: boolean;
  requiresApproval: boolean;
  maxLockoutDuration: number; // hours
  approverRoles: AdminRole[];
  emergencyUnlock: boolean;
  auditRequired: boolean;
  notificationRequired: boolean;
}
/**
 * Comprehensive account lockout management service
 */
export class AccountLockoutService extends EventEmitter {
  private lockouts: Map<string, AccountLockout> = new Map();
  private unlockPolicies: Map<AdminRole, UnlockPolicy> = new Map();
  private emergencyOverrides: Set<string> = new Set();
  constructor() {
    super();
    this.initializeUnlockPolicies();
    this.startCleanupTimer();
  }
  /**
   * Create a new account lockout
   */
  public async createLockout()
    userId: string,
    userEmail: string,
    reason: LockoutReason,
    metadata: Partial<AccountLockout['metadata']> = {}
  ): Promise<string> {
    const lockout: AccountLockout = {
      id: this.generateLockoutId(),
      userId,
      userEmail,
      status: LockoutStatus.ACTIVE,
      reason,
      lockoutTime: new Date(),
      expiryTime: this.calculateExpiryTime(reason),
      failedAttempts: metadata.riskScore || 0,
      securityEvents: [],
      metadata: {,
        riskScore: 50,
        threatLevel: 'medium',
        ...metadata
      },
      adminActions: [],
      notifications: [],
      auditTrail: [{,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        event: 'Account locked',
        actor: 'system',
        actorType: 'system',
        details: { reason, metadata }
      }]
    };
    this.lockouts.set(lockout.id, lockout);
    // Send initial notification
    await this.sendLockoutNotification(lockout);
    // Log security event
    this.logSecurityEvent(lockout, 'account_locked');
    this.emit('accountLocked', lockout);
    return lockout.id;
  }
  /**
   * Administrator unlock capability with comprehensive security
   */
  public async adminUnlock()
    lockoutId: string,
    unlockRequest: UnlockRequest,
  ): Promise<{ success: boolean; message: string; requiresApproval?: boolean }> {
    const lockout = this.lockouts.get(lockoutId);
    if (!lockout) {
      throw new Error(`Lockout not found: ${lockoutId}`);}
    }
    if (lockout.status !== LockoutStatus.ACTIVE && lockout.status !== LockoutStatus.PENDING_REVIEW) {
      return {
        success: false,
        message: `Cannot unlock account with status: ${lockout.status}`}
      };
    }
    // Verify admin permissions
    const adminPolicy = this.unlockPolicies.get(unlockRequest.adminId as AdminRole);
    if (!adminPolicy || !adminPolicy.canUnlock) {
      return {
        success: false,
        message: 'Insufficient permissions to unlock account'
      };
    }
    // Check if approval is required
    if (adminPolicy.requiresApproval && unlockRequest.urgency !== 'emergency') {
      return await this.requestUnlockApproval(lockout, unlockRequest);
    }
    // Perform the unlock
    return await this.performUnlock(lockout, unlockRequest);
  }
  /**
   * Emergency unlock capability for critical situations
   */
  public async emergencyUnlock()
    lockoutId: string,
    adminId: string,
    emergencyCode: string,
    justification: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify emergency override code
    if (!this.emergencyOverrides.has(emergencyCode)) {
      this.logSecurityEvent(null, 'invalid_emergency_code', { adminId, lockoutId });
      return {
        success: false,
        message: 'Invalid emergency override code'
      };
    }
    const lockout = this.lockouts.get(lockoutId);
    if (!lockout) {
      throw new Error(`Lockout not found: ${lockoutId}`);}
    }
    const unlockRequest: UnlockRequest = {
      lockoutId,
      adminId,
      reason: `EMERGENCY UNLOCK: ${justification}`,}
      method: UnlockMethod.EMERGENCY_UNLOCK,
      urgency: 'emergency',
      justification,
      approvalRequired: false,
      metadata: { emergencyCode }
    };
    // Emergency unlocks bypass normal approval processes
    const result = await this.performUnlock(lockout, unlockRequest);
    // Consume the emergency code
    this.emergencyOverrides.delete(emergencyCode);
    // Alert security team
    this.emit('emergencyUnlockUsed', {)
      lockout,
      adminId,
      emergencyCode,
      justification
    });
    return result;
  }
  /**
   * Approve pending unlock request
   */
  public async approveUnlock()
    lockoutId: string,
    adminActionId: string,
    approverId: string,
    approved: boolean,
    comments?: string
  ): Promise<{ success: boolean; message: string }> {
    const lockout = this.lockouts.get(lockoutId);
    if (!lockout) {
      throw new Error(`Lockout not found: ${lockoutId}`);}
    }
    const adminAction = lockout.adminActions.find(a => a.id === adminActionId);
    if (!adminAction) {
      throw new Error(`Admin action not found: ${adminActionId}`);}
    }
    if (!adminAction.approvalRequired) {
      return {
        success: false,
        message: 'This action does not require approval'
      };
    }
    // Update admin action
    adminAction.approvedBy = approverId;
    adminAction.approvalTime = new Date();
    adminAction.metadata.approved = approved;
    adminAction.metadata.approverComments = comments;
    // Add audit entry
    lockout.auditTrail.push({)
      id: crypto.randomUUID(),
      timestamp: new Date(),
      event: approved ? 'Unlock approved' : 'Unlock denied',
      actor: approverId,
      actorType: 'admin',
      details: { adminActionId, comments }
    });
    if (approved) {
      // Perform the unlock
      const unlockRequest: UnlockRequest = {
        lockoutId,
        adminId: adminAction.adminId,
        reason: adminAction.reason,
        method: UnlockMethod.ADMIN_OVERRIDE,
        urgency: 'medium',
        justification: `Approved by ${approverId}`,}
        approvalRequired: false,
      };
      return await this.performUnlock(lockout, unlockRequest);
    } else {
      lockout.status = LockoutStatus.ACTIVE;
      // Notify original requestor of denial
      await this.sendNotification(lockout, {)
        type: NotificationType.ADMIN_ACTION_REQUIRED,
        recipient: adminAction.adminEmail,
        content: `Your unlock request for user ${lockout.userEmail} has been denied. Reason: ${comments || 'No reason provided'}`}
      });
      return {
        success: true,
        message: 'Unlock request denied'
      };
    }
  }
  /**
   * Get lockout status and details
   */
  public getLockout(lockoutId: string): AccountLockout | null {
    return this.lockouts.get(lockoutId) || null;
  }
  /**
   * Get all lockouts for a user
   */
  public getUserLockouts(userId: string): AccountLockout[] {
    return Array.from(this.lockouts.values())
      .filter(lockout => lockout.userId === userId)
      .sort((a, b) => b.lockoutTime.getTime() - a.lockoutTime.getTime());
  }
  /**
   * Get pending lockouts requiring admin attention
   */
  public getPendingLockouts(): AccountLockout[] {
    return Array.from(this.lockouts.values())
      .filter(lockout => lockout.status === LockoutStatus.PENDING_REVIEW)
      .sort((a, b) => b.lockoutTime.getTime() - a.lockoutTime.getTime());
  }
  /**
   * Check if user is currently locked out
   */
  public isUserLockedOut(userId: string): boolean {
    const userLockouts = this.getUserLockouts(userId);
    return userLockouts.some(lockout => )
      lockout.status === LockoutStatus.ACTIVE && 
      (!lockout.expiryTime || lockout.expiryTime > new Date())
    );
  }
  /**
   * Generate emergency override code
   */
  public generateEmergencyCode(adminId: string, expiryHours: number = 24): string {
    const code = crypto.randomBytes(16).toString('hex').toUpperCase();
    this.emergencyOverrides.add(code);
    // Set expiry
    setTimeout(() => {
      this.emergencyOverrides.delete(code);
    }, expiryHours * 60 * 60 * 1000);
    this.logSecurityEvent(null, 'emergency_code_generated', { adminId, code, expiryHours });
    return code;
  }
  /**
   * Get lockout statistics and reports
   */
  public getLockoutStatistics(dateRange?: { start: Date; end: Date }): {
    totalLockouts: number;
    activeLockouts: number;
    lockoutsByReason: Record<LockoutReason, number>;
    averageLockoutDuration: number;
    adminUnlocks: number;
    emergencyUnlocks: number;
    topAffectedUsers: Array<{ userId: string; count: number }>;
  } {
    let lockouts = Array.from(this.lockouts.values());
    if (dateRange) {
      lockouts = lockouts.filter(l => )
        l.lockoutTime >= dateRange.start && l.lockoutTime <= dateRange.end
      );
    }
    const lockoutsByReason: Record<LockoutReason, number> = {
      [LockoutReason.EXCESSIVE_FAILED_ATTEMPTS]: 0,
      [LockoutReason.SUSPICIOUS_ACTIVITY]: 0,
      [LockoutReason.SECURITY_POLICY_VIOLATION]: 0,
      [LockoutReason.ADMIN_MANUAL_LOCK]: 0,
      [LockoutReason.SYSTEM_SECURITY_ALERT]: 0,
      [LockoutReason.COMPLIANCE_REQUIREMENT]: 0
    };
    const userCounts: Record<string, number> = {};
    let totalDuration = 0;
    let adminUnlocks = 0;
    let emergencyUnlocks = 0;
    lockouts.forEach(lockout => {)
      lockoutsByReason[lockout.reason]++;
      userCounts[lockout.userId] = (userCounts[lockout.userId] || 0) + 1;
      if (lockout.unlockTime) {
        totalDuration += lockout.unlockTime.getTime() - lockout.lockoutTime.getTime();
      }
      lockout.adminActions.forEach(action => {)
        if (action.action === 'unlock') {
          if (action.metadata.emergencyCode) {
            emergencyUnlocks++;
          } else {
            adminUnlocks++;
          }
        }
      });
    });
    const topAffectedUsers = Object.entries(userCounts);
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));
    return {
      totalLockouts: lockouts.length,
      activeLockouts: lockouts.filter(l => l.status === LockoutStatus.ACTIVE).length,
      lockoutsByReason,
      averageLockoutDuration: lockouts.length > 0 ? totalDuration / lockouts.length : 0,
      adminUnlocks,
      emergencyUnlocks,
      topAffectedUsers
    };
  }
  // Private helper methods
  private async requestUnlockApproval()
    lockout: AccountLockout,
    unlockRequest: UnlockRequest,
  ): Promise<{ success: boolean; message: string; requiresApproval: boolean }> {
    const adminAction: AdminAction = {
      id: crypto.randomUUID(),
      adminId: unlockRequest.adminId,
      adminEmail: `admin-${unlockRequest.adminId}@company.com`, // Would be retrieved from admin service}
      adminRole: AdminRole.SECURITY_ADMIN, // Would be retrieved from admin service
      action: 'unlock',
      reason: unlockRequest.reason,
      timestamp: new Date(),
      ipAddress: unlockRequest.metadata?.ipAddress || 'unknown',
      authenticationMethod: 'mfa',
      approvalRequired: true,
      metadata: unlockRequest.metadata || {}
    };
    lockout.adminActions.push(adminAction);
    lockout.status = LockoutStatus.PENDING_REVIEW;
    // Add audit entry
    lockout.auditTrail.push({)
      id: crypto.randomUUID(),
      timestamp: new Date(),
      event: 'Unlock approval requested',
      actor: unlockRequest.adminId,
      actorType: 'admin',
      details: unlockRequest,
    });
    // Notify approvers
    const policy = this.unlockPolicies.get(unlockRequest.adminId as AdminRole);
    if (policy?.approverRoles) {
      for (const approverRole of policy.approverRoles) {
        await this.sendNotification(lockout, {)
          type: NotificationType.ADMIN_ACTION_REQUIRED,
          recipient: `${approverRole}-team@company.com`,}
          content: `Unlock approval required for user ${lockout.userEmail}. Reason: ${unlockRequest.reason}`}
        });
      }
    }
    this.emit('unlockApprovalRequested', { lockout, unlockRequest, adminAction });
    return {
      success: true,
      message: 'Unlock request submitted for approval',
      requiresApproval: true,
    };
  }
  private async performUnlock()
    lockout: AccountLockout,
    unlockRequest: UnlockRequest,
  ): Promise<{ success: boolean; message: string }> {
    // Update lockout status
    lockout.status = LockoutStatus.UNLOCKED;
    lockout.unlockTime = new Date();
    // Add admin action if not already present
    if (!lockout.adminActions.some(a => a.action === 'unlock' && a.adminId === unlockRequest.adminId)) {
      const adminAction: AdminAction = {
        id: crypto.randomUUID(),
        adminId: unlockRequest.adminId,
        adminEmail: `admin-${unlockRequest.adminId}@company.com`,}
        adminRole: AdminRole.SECURITY_ADMIN,
        action: 'unlock',
        reason: unlockRequest.reason,
        timestamp: new Date(),
        ipAddress: unlockRequest.metadata?.ipAddress || 'unknown',
        authenticationMethod: 'mfa',
        approvalRequired: false,
        metadata: unlockRequest.metadata || {}
      };
      lockout.adminActions.push(adminAction);
    }
    // Add audit entry
    lockout.auditTrail.push({)
      id: crypto.randomUUID(),
      timestamp: new Date(),
      event: 'Account unlocked',
      actor: unlockRequest.adminId,
      actorType: 'admin',
      details: unlockRequest,
    });
    // Send unlock notification to user
    await this.sendNotification(lockout, {)
      type: NotificationType.UNLOCK_NOTIFICATION,
      recipient: lockout.userEmail,
      content: 'Your account has been unlocked by an administrator. You may now log in normally.'
    });
    // Log security event
    this.logSecurityEvent(lockout, 'account_unlocked', {)
      adminId: unlockRequest.adminId,
      method: unlockRequest.method,
      reason: unlockRequest.reason,
    });
    this.emit('accountUnlocked', { lockout, unlockRequest });
    return {
      success: true,
      message: 'Account successfully unlocked'
    };
  }
  private async sendLockoutNotification(lockout: AccountLockout): Promise<void> {
    const content = this.generateLockoutNotificationContent(lockout);
    await this.sendNotification(lockout, {)
      type: NotificationType.LOCKOUT_NOTIFICATION,
      recipient: lockout.userEmail,
      content
    });
  }
  private async sendNotification()
    lockout: AccountLockout,
    notificationData: Partial<LockoutNotification>,
  ): Promise<void> {
    const notification: LockoutNotification = {
      id: crypto.randomUUID(),
      type: notificationData.type || NotificationType.LOCKOUT_NOTIFICATION,
      recipient: notificationData.recipient || lockout.userEmail,
      channel: 'email',
      sentAt: new Date(),
      content: notificationData.content || '',
      status: 'sent',
    };
    lockout.notifications.push(notification);
    // In production, integrate with actual notification service
    console.log(`Sending ${notification.type} to ${notification.recipient}`);}
    this.emit('notificationSent', notification);
  }
  private generateLockoutNotificationContent(lockout: AccountLockout): string {
    const reasonText = this.getLockoutReasonText(lockout.reason);
    const expiryText = lockout.expiryTime ;
      ? `Your account will be automatically unlocked at ${lockout.expiryTime.toLocaleString()}.`}
      : 'Please contact support to unlock your account.';
    return `Your account has been temporarily locked due to ${reasonText}. ${expiryText} If you believe this is an error, please contact our support team with reference ID: ${lockout.id}`;}
  }
  private getLockoutReasonText(reason: LockoutReason): string {
    switch (reason) {
    case LockoutReason.EXCESSIVE_FAILED_ATTEMPTS:
      return 'multiple failed login attempts';
    case LockoutReason.SUSPICIOUS_ACTIVITY:
      return 'suspicious account activity';
    case LockoutReason.SECURITY_POLICY_VIOLATION:
      return 'security policy violation';
    case LockoutReason.ADMIN_MANUAL_LOCK:
      return 'administrative action';
    case LockoutReason.SYSTEM_SECURITY_ALERT:
      return 'security system alert';
    case LockoutReason.COMPLIANCE_REQUIREMENT:
      return 'compliance requirement';
    default:
      return 'security concerns';
    }
  }
  private calculateExpiryTime(reason: LockoutReason): Date | undefined {
    const now = new Date();
    switch (reason) {
    case LockoutReason.EXCESSIVE_FAILED_ATTEMPTS:
      return new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
    case LockoutReason.SUSPICIOUS_ACTIVITY:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    case LockoutReason.SECURITY_POLICY_VIOLATION:
      return undefined; // Manual unlock required
    case LockoutReason.ADMIN_MANUAL_LOCK:
      return undefined; // Manual unlock required
    case LockoutReason.SYSTEM_SECURITY_ALERT:
      return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    case LockoutReason.COMPLIANCE_REQUIREMENT:
      return undefined; // Manual unlock required
    default:
      return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour default
    }
  }
  private initializeUnlockPolicies(): void {
    this.unlockPolicies.set(AdminRole.SUPER_ADMIN, {)
      adminRole: AdminRole.SUPER_ADMIN,
      canUnlock: true,
      requiresApproval: false,
      maxLockoutDuration: 0, // No limit
      approverRoles: [],
      emergencyUnlock: true,
      auditRequired: true,
      notificationRequired: true,
    });
    this.unlockPolicies.set(AdminRole.SECURITY_ADMIN, {)
      adminRole: AdminRole.SECURITY_ADMIN,
      canUnlock: true,
      requiresApproval: true,
      maxLockoutDuration: 168, // 1 week
      approverRoles: [AdminRole.SUPER_ADMIN],
      emergencyUnlock: true,
      auditRequired: true,
      notificationRequired: true,
    });
    this.unlockPolicies.set(AdminRole.SYSTEM_ADMIN, {)
      adminRole: AdminRole.SYSTEM_ADMIN,
      canUnlock: true,
      requiresApproval: true,
      maxLockoutDuration: 72, // 3 days
      approverRoles: [AdminRole.SECURITY_ADMIN, AdminRole.SUPER_ADMIN],
      emergencyUnlock: false,
      auditRequired: true,
      notificationRequired: true,
    });
    this.unlockPolicies.set(AdminRole.HELP_DESK, {)
      adminRole: AdminRole.HELP_DESK,
      canUnlock: true,
      requiresApproval: true,
      maxLockoutDuration: 24, // 1 day
      approverRoles: [AdminRole.SYSTEM_ADMIN, AdminRole.SECURITY_ADMIN],
      emergencyUnlock: false,
      auditRequired: true,
      notificationRequired: true,
    });
  }
  private logSecurityEvent()
    lockout: AccountLockout | null,
    event: string,
    details: Record<string, any> = {}
  ): void {
    const logEntry = {
      timestamp: new Date(),
      event,
      lockoutId: lockout?.id,
      userId: lockout?.userId,
      details
    };
    // In production, integrate with security logging system
    console.log('Security Event:', JSON.stringify(logEntry));
    this.emit('securityEvent', logEntry);
  }
  private generateLockoutId(): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `LOCK-${timestamp}-${random}`;}
  }
  private startCleanupTimer(): void {
    // Clean up expired lockouts every hour
    setInterval(() => {
      const now = new Date();
      for (const [id, lockout] of this.lockouts) {
        if (lockout.expiryTime && lockout.expiryTime < now && lockout.status === LockoutStatus.ACTIVE) {
          lockout.status = LockoutStatus.EXPIRED;
          lockout.unlockTime = now;
          lockout.auditTrail.push({)
            id: crypto.randomUUID(),
            timestamp: now,
            event: 'Lockout expired automatically',
            actor: 'system',
            actorType: 'system',
            details: {}
          });
          this.emit('lockoutExpired', lockout);
        }
        // Remove very old lockouts (older than 1 year)
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        if (lockout.lockoutTime < oneYearAgo) {
          this.lockouts.delete(id);
        }
      }
    }, 60 * 60 * 1000); // Every hour
  }
}

// Export default instance
export const accountLockoutService = new AccountLockoutService();

export default AccountLockoutService;
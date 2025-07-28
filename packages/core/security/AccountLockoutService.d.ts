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
export declare enum LockoutStatus {
    ACTIVE = "active",
    PENDING_REVIEW = "pending_review",
    UNLOCKED = "unlocked",
    EXPIRED = "expired",
    ESCALATED = "escalated"
}
export declare enum LockoutReason {
    EXCESSIVE_FAILED_ATTEMPTS = "excessive_failed_attempts",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    SECURITY_POLICY_VIOLATION = "security_policy_violation",
    ADMIN_MANUAL_LOCK = "admin_manual_lock",
    SYSTEM_SECURITY_ALERT = "system_security_alert",
    COMPLIANCE_REQUIREMENT = "compliance_requirement"
}
export declare enum UnlockMethod {
    ADMIN_OVERRIDE = "admin_override",
    SELF_SERVICE_RESET = "self_service_reset",
    AUTOMATIC_EXPIRY = "automatic_expiry",
    SECURITY_REVIEW = "security_review",
    EMERGENCY_UNLOCK = "emergency_unlock"
}
export declare enum AdminRole {
    SECURITY_ADMIN = "security_admin",
    SYSTEM_ADMIN = "system_admin",
    HELP_DESK = "help_desk",
    SUPER_ADMIN = "super_admin",
    COMPLIANCE_OFFICER = "compliance_officer"
}
export declare enum NotificationType {
    LOCKOUT_NOTIFICATION = "lockout_notification",
    UNLOCK_NOTIFICATION = "unlock_notification",
    SECURITY_ALERT = "security_alert",
    ADMIN_ACTION_REQUIRED = "admin_action_required",
    COMPLIANCE_REPORT = "compliance_report"
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
    maxLockoutDuration: number;
    approverRoles: AdminRole[];
    emergencyUnlock: boolean;
    auditRequired: boolean;
    notificationRequired: boolean;
}
/**
 * Comprehensive account lockout management service
 */
export declare class AccountLockoutService extends EventEmitter {
    private lockouts;
    private unlockPolicies;
    private emergencyOverrides;
    constructor();
    /**
     * Create a new account lockout
     */
    createLockout()
      userId: string,
      userEmail: string,
      reason: LockoutReason,
      metadata?: Partial<AccountLockout['metadata']>
    ): Promise<string>;
    /**
     * Administrator unlock capability with comprehensive security
     */
    adminUnlock(lockoutId: string, unlockRequest: UnlockRequest): Promise<{
        success: boolean;
        message: string;
        requiresApproval?: boolean;
    }>;
    /**
     * Emergency unlock capability for critical situations
     */
    emergencyUnlock(lockoutId: string, adminId: string, emergencyCode: string, justification: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Approve pending unlock request
     */
    approveUnlock()
      lockoutId: string,
      adminActionId: string,
      approverId: string,
      approved: boolean,
      comments?: string
    ): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get lockout status and details
     */
    getLockout(lockoutId: string): AccountLockout | null;
    /**
     * Get all lockouts for a user
     */
    getUserLockouts(userId: string): AccountLockout[];
    /**
     * Get pending lockouts requiring admin attention
     */
    getPendingLockouts(): AccountLockout[];
    /**
     * Check if user is currently locked out
     */
    isUserLockedOut(userId: string): boolean;
    /**
     * Generate emergency override code
     */
    generateEmergencyCode(adminId: string, expiryHours?: number): string;
    /**
     * Get lockout statistics and reports
     */
    getLockoutStatistics(dateRange?: {)
        start: Date;
        end: Date;
    }): {
        totalLockouts: number;
        activeLockouts: number;
        lockoutsByReason: Record<LockoutReason, number>;
        averageLockoutDuration: number;
        adminUnlocks: number;
        emergencyUnlocks: number;
        topAffectedUsers: Array<{,
            userId: string;
            count: number;
        }>;
    };
    private requestUnlockApproval;
    private performUnlock;
    private sendLockoutNotification;
    private sendNotification;
    private generateLockoutNotificationContent;
    private getLockoutReasonText;
    private calculateExpiryTime;
    private initializeUnlockPolicies;
    private logSecurityEvent;
    private generateLockoutId;
    private startCleanupTimer;
}
export declare const accountLockoutService: AccountLockoutService;
export default AccountLockoutService;
//# sourceMappingURL=AccountLockoutService.d.ts.map
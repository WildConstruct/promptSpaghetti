/**
 * Exemption Manager Service
 *
 * Comprehensive exemption management system for handling special cases in
 * security policies, rate limiting, lockouts, and authentication requirements.
 *
 * Features:
 * - Temporary and permanent exemptions
 * - Role-based exemption management
 * - Time-limited exemptions with auto-expiry
 * - Audit trail for all exemption activities
 * - Emergency exemption procedures
 * - Compliance tracking and reporting
 * - Automated exemption review workflows
 */
import { EventEmitter } from 'events';
import { AdminRole } from './AccountLockoutService';
export declare enum ExemptionType {
    RATE_LIMITING = "rate_limiting",
    ACCOUNT_LOCKOUT = "account_lockout",
    MFA_REQUIREMENT = "mfa_requirement",
    PASSWORD_POLICY = "password_policy",
    SESSION_TIMEOUT = "session_timeout",
    IP_RESTRICTION = "ip_restriction",
    GEO_BLOCKING = "geo_blocking",
    DEVICE_TRUST = "device_trust",
    SECURITY_HEADERS = "security_headers",
    CONTENT_SECURITY_POLICY = "content_security_policy"
}
export declare enum ExemptionScope {
    USER = "user",
    IP_ADDRESS = "ip_address",
    USER_AGENT = "user_agent",
    ENDPOINT = "endpoint",
    API_KEY = "api_key",
    ROLE = "role",
    DOMAIN = "domain",
    GLOBAL = "global"
}
export declare enum ExemptionStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    REVOKED = "revoked",
    PENDING_APPROVAL = "pending_approval",
    DENIED = "denied",
    SUSPENDED = "suspended"
}
export declare enum ExemptionPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical",
    EMERGENCY = "emergency"
}
export declare enum ExemptionReason {
    BUSINESS_CRITICAL = "business_critical",
    EMERGENCY_ACCESS = "emergency_access",
    SYSTEM_MAINTENANCE = "system_maintenance",
    TESTING = "testing",
    API_INTEGRATION = "api_integration",
    LEGACY_SYSTEM = "legacy_system",
    COMPLIANCE_REQUIRED = "compliance_required",
    ACCESSIBILITY = "accessibility",
    PERFORMANCE = "performance",
    USER_EXPERIENCE = "user_experience"
}
export interface SecurityExemption {
    id: string;
    type: ExemptionType;
    scope: ExemptionScope;
    target: string;
    status: ExemptionStatus;
    priority: ExemptionPriority;
    reason: ExemptionReason;
    description: string;
    requestedBy: {,
        userId: string;
        userEmail: string;
        role: AdminRole;
        timestamp: Date;
    };
    approvedBy?: {
        userId: string;
        userEmail: string;
        role: AdminRole;
        timestamp: Date;
        comments?: string;
    };
    revokedBy?: {
        userId: string;
        userEmail: string;
        role: AdminRole;
        timestamp: Date;
        reason?: string;
    };
    effectiveFrom: Date;
    expiresAt?: Date;
    autoRenew: boolean;
    renewalCriteria?: {
        reviewRequired: boolean;
        maxRenewals: number;
        renewalPeriodDays: number;
        currentRenewals: number;
    };
    conditions: {,
        ipWhitelist?: string[];
        timeRestrictions?: {
            allowedHours: {,
                start: string;
                end: string;
            }[];
            allowedDays: string[];
            timezone: string;
        };
        usageQuota?: {
            maxUsesPerDay?: number;
            maxUsesPerHour?: number;
            currentUsage: number;
            resetTime: Date;
        };
        securityContext?: {
            minimumTrustLevel?: string;
            requireMFA?: boolean;
            requireApproval?: boolean;
        };
    };
    metadata: {,
        businessJustification: string;
        riskAssessment: {,
            level: 'low' | 'medium' | 'high' | 'critical';
            mitigations: string[];
            reviewDate: Date;
        };
        complianceNotes?: string;
        relatedTickets?: string[];
        tags: string[];
    };
    auditTrail: ExemptionAuditEntry[];
    usage: {,
        timesUsed: number;
        lastUsed?: Date;
        usageHistory: Array<{,
            timestamp: Date;
            context: Record<string, any>;
            source: string;
        }>;
    };
}
export interface ExemptionAuditEntry {
    id: string;
    timestamp: Date;
    action: 'created' | 'approved' | 'denied' | 'revoked' | 'renewed' | 'used' | 'modified' | 'expired';
    actor: {,
        userId: string;
        userEmail: string;
        role?: AdminRole;
        type: 'user' | 'admin' | 'system';
    };
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export interface ExemptionRequest {
    type: ExemptionType;
    scope: ExemptionScope;
    target: string;
    reason: ExemptionReason;
    description: string;
    priority: ExemptionPriority;
    requestedDuration?: number;
    conditions?: Partial<SecurityExemption['conditions']>;
    businessJustification: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    mitigations: string[];
    autoRenew?: boolean;
    emergencyOverride?: boolean;
}
export interface ExemptionUsageContext {
    endpoint?: string;
    ipAddress?: string;
    userAgent?: string;
    operation?: string;
    requestId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
}
export interface ExemptionQuery {
    types?: ExemptionType[];
    scopes?: ExemptionScope[];
    statuses?: ExemptionStatus[];
    priorities?: ExemptionPriority[];
    targets?: string[];
    requestedBy?: string[];
    approvedBy?: string[];
    activeOnly?: boolean;
    expiringSoon?: boolean;
    startDate?: Date;
    endDate?: Date;
    tags?: string[];
    limit?: number;
    offset?: number;
}
export interface ExemptionPolicy {
    type: ExemptionType;
    scope: ExemptionScope;
    allowedRoles: AdminRole[];
    requiresApproval: boolean;
    approverRoles: AdminRole[];
    maxDuration: number;
    autoExpiry: boolean;
    emergencyOverrideAllowed: boolean;
    usageTracking: boolean;
    complianceRequired: boolean;
}
/**
 * Comprehensive exemption management service
 */
export declare class ExemptionManager extends EventEmitter {
    private exemptions;
    private policies;
    private pendingRequests;
    constructor();
    /**
     * Request a new security exemption
     */
    requestExemption();
      request: ExemptionRequest,
      requestorId: string,
      requestorEmail: string,
      requestorRole: AdminRole,
    ): Promise<string>;
    /**
     * Approve a pending exemption request
     */
    approveExemption();
      exemptionId: string,
      approverId: string,
      approverEmail: string,
      approverRole: AdminRole,
      comments?: string
    ): Promise<boolean>;
    /**
     * Deny a pending exemption request
     */
    denyExemption();
      exemptionId: string,
      approverId: string,
      approverEmail: string,
      approverRole: AdminRole,
      reason: string,
    ): Promise<boolean>;
    /**
     * Check if an exemption exists and is active
     */
    checkExemption(type: ExemptionType, scope: ExemptionScope, target: string, context?: ExemptionUsageContext): {
        granted: boolean;
        exemption?: SecurityExemption;
        reason?: string;
    };
    /**
     * Revoke an active exemption
     */
    revokeExemption();
      exemptionId: string,
      revokerId: string,
      revokerEmail: string,
      revokerRole: AdminRole,
      reason: string,
    ): boolean;
    /**
     * Create emergency exemption with bypass approval
     */
    createEmergencyExemption();
      request: ExemptionRequest,
      requestorId: string,
      requestorEmail: string,
      requestorRole: AdminRole,
      emergencyCode: string,
      justification: string,
    ): Promise<string>;
    /**
     * Query exemptions
     */
    queryExemptions(query: ExemptionQuery): {
        exemptions: SecurityExemption[];
        total: number;
        hasMore: boolean;
    };
    /**
     * Get exemption statistics
     */
    getExemptionStatistics(): {
        total: number;
        active: number;
        pending: number;
        expired: number;
        revoked: number;
        byType: Record<ExemptionType, number>;
        byScope: Record<ExemptionScope, number>;
        byPriority: Record<ExemptionPriority, number>;
        expiringSoon: number;
        emergencyCount: number;
        usageStats: {,
            totalUsage: number;
            averageUsagePerExemption: number;
            mostUsedExemptions: Array<{,
                id: string;
                usage: number;
            }>;
        };
    };
    private getPolicy;
    private checkExemptionConditions;
    private recordExemptionUsage;
    private validateEmergencyCode;
    private notifyApprovers;
    private initializeDefaultPolicies;
    private startMaintenanceTimer;
    private processAutoRenewal;
}
export declare const exemptionManager: ExemptionManager;
export default ExemptionManager;
//# sourceMappingURL=ExemptionManager.d.ts.map
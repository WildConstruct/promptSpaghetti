/**
 * System Access Management Service - Epic 17
 *
 * Comprehensive system access management service providing role-based access control,
 * permission management, system-level access controls, and administrative oversight.
 *
 * Features:
 * - Role-based access control (RBAC)
 * - Fine-grained permission management
 * - System-level access controls
 * - User lifecycle management
 * - Access audit and compliance
 * - Emergency access controls
 * - Session management
 * - Resource-based permissions
 */
export interface SystemUser {
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatar?: string;
    status: UserStatus;
    isActive: boolean;
    isVerified: boolean;
    lastLoginAt?: Date;
    lastActivityAt?: Date;
    profile: UserProfile;
    roles: UserRole[];
    permissions: DirectPermission[];
    systemAccess: SystemAccessLevel;
    mfaEnabled: boolean;
    securityClearance: SecurityClearance;
    accessRestrictions?: AccessRestriction[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy?: string;
    termsAccepted?: Date;
    privacyPolicyAccepted?: Date;
    dataRetentionConsent?: boolean;
}
export interface UserProfile {
    firstName?: string;
    lastName?: string;
    department?: string;
    jobTitle?: string;
    location?: string;
    timezone: string;
    language: string;
    phoneNumber?: string;
    organization?: string;
    manager?: string;
}
export interface UserRole {
    id: string;
    roleId: string;
    roleName: string;
    roleDescription?: string;
    assignedAt: Date;
    assignedBy: string;
    expiresAt?: Date;
    scope: RoleScope;
    context?: Record<string, any>;
}
export interface DirectPermission {
    id: string;
    permission: string;
    resource?: string;
    resourceId?: string;
    action: string;
    granted: boolean;
    grantedAt: Date;
    grantedBy: string;
    expiresAt?: Date;
    conditions?: PermissionCondition[];
}
export interface PermissionCondition {
    type: 'time' | 'location' | 'device' | 'mfa' | 'approval';
    constraint: Record<string, any>;
    description: string;
}
export interface SystemRole {
    id: string;
    name: string;
    displayName: string;
    description: string;
    type: RoleType;
    level: number;
    permissions: RolePermission[];
    systemAccess: SystemAccessLevel;
    maxUsers?: number;
    requiresApproval: boolean;
    canDelegate: boolean;
    isActive: boolean;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}
export interface RolePermission {
    permission: string;
    resource: string;
    actions: string[];
    scope: PermissionScope;
    conditions?: PermissionCondition[];
}
export interface AccessRequest {
    id: string;
    requesterId: string;
    requesterName: string;
    type: AccessRequestType;
    targetUserId?: string;
    roleId?: string;
    permissions?: string[];
    resource?: string;
    duration?: number;
    businessJustification: string;
    urgency: AccessUrgency;
    status: AccessRequestStatus;
    approvers: AccessApprover[];
    currentApprover?: string;
    approvedBy?: string[];
    rejectedBy?: string;
    rejectionReason?: string;
    requestedAt: Date;
    respondedAt?: Date;
    expiresAt?: Date;
    auditTrail: AccessAuditEntry[];
}
export interface AccessApprover {
    userId: string;
    displayName: string;
    order: number;
    required: boolean;
    status: ApprovalStatus;
    respondedAt?: Date;
    comments?: string;
}
export interface AccessAuditEntry {
    id: string;
    timestamp: Date;
    action: string;
    performedBy: string;
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export interface AccessRestriction {
    type: RestrictionType;
    description: string;
    startDate?: Date;
    endDate?: Date;
    conditions: Record<string, any>;
    appliedBy: string;
    appliedAt: Date;
}
export interface SystemAccess {
    id: string;
    userId: string;
    level: SystemAccessLevel;
    grantedAt: Date;
    grantedBy: string;
    lastUsed?: Date;
    restrictions: SystemRestriction[];
}
export interface SystemRestriction {
    type: 'ip_whitelist' | 'time_window' | 'mfa_required' | 'approval_required' | 'read_only';
    configuration: Record<string, any>;
    description: string;
}
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'locked' | 'pending' | 'deactivated';
export type SystemAccessLevel = 'none' | 'basic' | 'advanced' | 'admin' | 'super_admin' | 'system';
export type SecurityClearance = 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
export type RoleScope = 'global' | 'organization' | 'team' | 'project' | 'resource';
export type RoleType = 'system' | 'organizational' | 'project' | 'custom' | 'temporary';
export type PermissionScope = 'global' | 'organization' | 'project' | 'resource' | 'own';
export type AccessRequestType = 'role_assignment' | 'permission_grant' | 'access_elevation' | 'resource_access';
export type AccessUrgency = 'low' | 'medium' | 'high' | 'critical';
export type AccessRequestStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'withdrawn';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'delegated';
export type RestrictionType = 'time' | 'location' | 'device' | 'resource' | 'action' | 'network';
export interface AccessFilter {
    userIds?: string[];
    roles?: string[];
    statuses?: UserStatus[];
    accessLevels?: SystemAccessLevel[];
    departments?: string[];
    organizations?: string[];
    lastActivityBefore?: Date;
    lastActivityAfter?: Date;
    searchQuery?: string;
    includeInactive?: boolean;
    securityClearance?: SecurityClearance[];
}
export interface AccessStats {
    totalUsers: number;
    activeUsers: number;
    pendingRequests: number;
    expiredAccesses: number;
    byStatus: Record<UserStatus, number>;
    byAccessLevel: Record<SystemAccessLevel, number>;
    bySecurityClearance: Record<SecurityClearance, number>;
    recentActivity: {
        newUsers: number;
        accessGranted: number;
        accessRevoked: number;
        loginAttempts: number;
        failedLogins: number;
    };
    compliance: {
        mfaEnabled: number;
        termsAccepted: number;
        overdueCertifications: number;
        pendingReviews: number;
    };
}
/**
 * System Access Management Service
 */
export declare class SystemAccessManager {
    private static instance;
    private users;
    private roles;
    private accessRequests;
    private auditLog;
    private constructor();
    static getInstance(): SystemAccessManager;
    /**
     * User Management
     */
    createUser(userData: Omit<SystemUser, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string): Promise<SystemUser>;
    updateUser(userId: string, updates: Partial<SystemUser>, updatedBy: string): Promise<SystemUser | null>;
    deleteUser(userId: string, deletedBy: string): Promise<boolean>;
    /**
     * Role Management
     */
    assignRole(userId: string, roleId: string, assignedBy: string, options?: {
        expiresAt?: Date;
        scope?: RoleScope;
        context?: Record<string, any>;
    }): Promise<boolean>;
    revokeRole(userId: string, roleId: string, revokedBy: string): Promise<boolean>;
    /**
     * Permission Management
     */
    grantPermission(userId: string, permission: string, resource: string, action: string, grantedBy: string, options?: {
        resourceId?: string;
        expiresAt?: Date;
        conditions?: PermissionCondition[];
    }): Promise<boolean>;
    revokePermission(userId: string, permissionId: string, revokedBy: string): Promise<boolean>;
    /**
     * Access Request Management
     */
    createAccessRequest(
      requestData: Omit<AccessRequest,
      'id' | 'requestedAt' | 'status' | 'auditTrail'>
    ): Promise<AccessRequest>;
    approveAccessRequest(requestId: string, approverId: string, comments?: string): Promise<boolean>;
    /**
     * Access Control Queries
     */
    hasPermission(userId: string, permission: string, resource?: string, action?: string): boolean;
    hasSystemAccess(userId: string, requiredLevel: SystemAccessLevel): boolean;
    /**
     * Data Retrieval
     */
    getUsers(filter?: AccessFilter): SystemUser[];
    getAccessStats(): AccessStats;
    private validateUserData;
    private isValidEmail;
    private generateUserId;
    private generateId;
    private calculateChanges;
    private hasApprovalPermission;
    private determineApprovers;
    private notifyApprovers;
    private executeAccessRequest;
    private auditAction;
    private groupBy;
    private initializeSystemRoles;
    private startMaintenanceTasks;
    private cleanupExpiredAccess;
    private processExpiredRequests;
}
export declare export declare const assignRole: (
  userId: string,
  roleId: string,
  assignedBy: string,
  options?: any
) => Promise<boolean>;
export declare const hasPermission: (userId: string, permission: string, resource?: string, action?: string) => boolean;
export declare const getUsers: (filter?: AccessFilter) => SystemUser[];
export declare const getAccessStats: () => AccessStats;
//# sourceMappingURL=SystemAccessManager.d.ts.map
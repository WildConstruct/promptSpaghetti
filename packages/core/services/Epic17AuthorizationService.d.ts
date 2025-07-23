/**
 * Epic 17 Authorization Integration Service
 *
 * Comprehensive authorization service for Epic 17 Backstage Admin Controls providing:
 * - Role-based access control (RBAC) with hierarchical permissions
 * - Resource-level authorization with context-aware rules
 * - Integration with existing authentication system
 * - Audit logging for all authorization decisions
 * - Dynamic permission evaluation with caching
 */
import { EventEmitter } from 'events';
export interface AuthorizationContext {
    user: UserContext;
    resource?: ResourceContext;
    action: string;
    environment: EnvironmentContext;
    requestContext?: RequestMetadata;
    additionalData?: Record<string, any>;
}
export interface UserContext {
    id: string;
    email: string;
    roles: string[];
    groups: string[];
    permissions: Permission[];
    attributes: Record<string, any>;
    sessionId?: string;
    lastLogin?: Date;
}
export interface ResourceContext {
    type: ResourceType;
    id: string;
    owner?: string;
    attributes: Record<string, any>;
    tags: string[];
    namespace?: string;
    parentResource?: string;
}
export declare enum ResourceType {
    FEATURE_TOGGLE = "feature_toggle",
    USER_ACCOUNT = "user_account",
    CONTENT_ITEM = "content_item",
    API_KEY = "api_key",
    MARKETPLACE_ITEM = "marketplace_item",
    SYSTEM_CONFIG = "system_config",
    AUDIT_LOG = "audit_log",
    DASHBOARD = "dashboard",
    REPORT = "report",
    ORGANIZATION = "organization",
    WORKSPACE = "workspace"
}
export interface Permission {
    id: string;
    name: string;
    resource: ResourceType | '*';
    actions: string[];
    conditions?: PermissionCondition[];
    scope: PermissionScope;
    inherited?: boolean;
    grantedAt: Date;
    expiresAt?: Date;
}
export interface PermissionCondition {
    type: ConditionType;
    operator: ConditionOperator;
    value: any;
    attribute: string;
}
export declare enum ConditionType {
    USER_ATTRIBUTE = "user_attribute",
    RESOURCE_ATTRIBUTE = "resource_attribute",
    TIME_BASED = "time_based",
    IP_BASED = "ip_based",
    CONTEXT_BASED = "context_based"
}
export declare enum ConditionOperator {
    EQUALS = "equals",
    NOT_EQUALS = "not_equals",
    IN = "in",
    NOT_IN = "not_in",
    GREATER_THAN = "greater_than",
    LESS_THAN = "less_than",
    CONTAINS = "contains",
    MATCHES = "matches",
    EXISTS = "exists"
}
export declare enum PermissionScope {
    GLOBAL = "global",// System-wide permissions
    ORGANIZATION = "organization",// Organization-level
    WORKSPACE = "workspace",// Workspace-level
    RESOURCE = "resource",// Specific resource
    SELF = "self"
}
export interface EnvironmentContext {
    environment: 'development' | 'staging' | 'production';
    region: string;
    version: string;
    featureFlags: Record<string, boolean>;
    maintenanceMode?: boolean;
    debugMode?: boolean;
}
export interface RequestMetadata {
    ip: string;
    userAgent: string;
    timestamp: Date;
    requestId: string;
    method: string;
    path: string;
    headers: Record<string, string>;
}
export interface Role {
    id: string;
    name: string;
    description: string;
    level: number;
    permissions: Permission[];
    inheritedRoles: string[];
    conditions: RoleCondition[];
    active: boolean;
    metadata: RoleMetadata;
}
export interface RoleCondition {
    type: 'time_based' | 'attribute_based' | 'context_based';
    rule: string;
    parameters: Record<string, any>;
}
export interface RoleMetadata {
    category: 'system' | 'administrative' | 'functional' | 'custom';
    department?: string;
    epic?: string;
    story?: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    approvalRequired: boolean;
    auditLevel: 'basic' | 'detailed' | 'comprehensive';
    created: Date;
    createdBy: string;
    lastModified: Date;
    modifiedBy: string;
}
export interface AuthorizationResult {
    granted: boolean;
    reason: string;
    decision: AuthorizationDecision;
    appliedPolicies: string[];
    conditions: EvaluatedCondition[];
    metadata: AuthorizationMetadata;
}
export interface AuthorizationDecision {
    result: 'allow' | 'deny' | 'conditional';
    confidence: number;
    riskScore: number;
    recommendedActions: string[];
    alternatives: AlternativeAction[];
}
export interface EvaluatedCondition {
    conditionId: string;
    type: ConditionType;
    result: boolean;
    value: any;
    reason: string;
    evaluationTime: number;
}
export interface AlternativeAction {
    action: string;
    description: string;
    requiredConditions: string[];
    riskLevel: 'low' | 'medium' | 'high';
}
export interface AuthorizationMetadata {
    evaluationId: string;
    userId: string;
    resource?: string;
    action: string;
    timestamp: Date;
    executionTime: number;
    cacheHit: boolean;
    policyVersion: string;
    debugInfo?: Record<string, any>;
}
export interface AuthorizationPolicy {
    id: string;
    name: string;
    description: string;
    version: string;
    priority: number;
    target: PolicyTarget;
    conditions: PolicyCondition[];
    effect: 'allow' | 'deny';
    obligations: PolicyObligation[];
    active: boolean;
    metadata: PolicyMetadata;
}
export interface PolicyTarget {
    users: string[];
    roles: string[];
    resources: ResourceSelector[];
    actions: string[];
    environments: string[];
}
export interface ResourceSelector {
    type: ResourceType | '*';
    id?: string;
    attributes?: Record<string, any>;
    tags?: string[];
    namespace?: string;
}
export interface PolicyCondition {
    id: string;
    type: ConditionType;
    expression: string;
    parameters: Record<string, any>;
    required: boolean;
}
export interface PolicyObligation {
    type: 'log_access' | 'require_mfa' | 'limit_time' | 'require_approval';
    parameters: Record<string, any>;
    priority: number;
}
export interface PolicyMetadata {
    category: string;
    tags: string[];
    owner: string;
    reviewedBy?: string;
    reviewedAt?: Date;
    approvedBy?: string;
    approvedAt?: Date;
    effectiveDate: Date;
    expirationDate?: Date;
    created: Date;
    lastModified: Date;
}
export interface AuthorizationConfig {
    evaluation: {
        enableCaching: boolean;
        cacheTimeToLive: number;
        evaluationTimeout: number;
        maxPolicyDepth: number;
        strictMode: boolean;
    };
    audit: {
        enableAuditLogging: boolean;
        logLevel: 'basic' | 'detailed' | 'comprehensive';
        auditAllDecisions: boolean;
        sensitiveDataRedaction: boolean;
    };
    permissions: {
        defaultDenyMode: boolean;
        inheritanceEnabled: boolean;
        dynamicPermissions: boolean;
        permissionCascading: boolean;
    };
    security: {
        encryptSensitiveData: boolean;
        requireMfaForHighRisk: boolean;
        sessionValidation: boolean;
        ipWhitelisting: boolean;
    };
}
/**
 * Epic 17 Authorization Service
 *
 * Core authorization service providing comprehensive access control for
 * Epic 17 Backstage Admin Controls with role-based permissions, policy
 * evaluation, and audit logging.
 */
export declare class Epic17AuthorizationService extends EventEmitter {
    private roles;
    private permissions;
    private policies;
    private authorizationCache;
    private config;
    constructor(config?: Partial<AuthorizationConfig>);
    /**
     * Primary authorization check method
     */
    authorize(context: AuthorizationContext): Promise<AuthorizationResult>;
    /**
     * Check if user has specific permission
     */
    hasPermission(user: UserContext, resource: ResourceType, action: string, resourceId?: string): Promise<boolean>;
    /**
     * Get effective permissions for a user
     */
    getUserPermissions(userId: string): Promise<Permission[]>;
    /**
     * Bulk authorization check for multiple actions
     */
    bulkAuthorize(contexts: AuthorizationContext[]): Promise<Map<string, AuthorizationResult>>;
    /**
     * Add or update a role
     */
    addRole(role: Omit<Role, 'id'>): Promise<Role>;
    /**
     * Add or update a permission
     */
    addPermission(permission: Omit<Permission, 'id'>): Promise<Permission>;
    /**
     * Add or update an authorization policy
     */
    addPolicy(policy: Omit<AuthorizationPolicy, 'id'>): Promise<AuthorizationPolicy>;
    private evaluateAuthorization;
    private isPolicyApplicable;
    private matchesResourceSelector;
    private evaluatePolicyConditions;
    private evaluateUserAttributeCondition;
    private evaluateResourceAttributeCondition;
    private evaluateTimeBasedCondition;
    private evaluateIpBasedCondition;
    private evaluateContextBasedCondition;
    private checkDirectPermissions;
    private permissionMatches;
    private checkPermissionScope;
    private getUserRoles;
    private deduplicatePermissions;
    private generateDecisionReason;
    private generateRecommendations;
    private generateAlternatives;
    private auditAuthorizationDecision;
    private validateContext;
    private generateCacheKey;
    private isCacheValid;
    private cleanupCache;
    private clearUserCaches;
    private generateEvaluationId;
    private generateRoleId;
    private generatePermissionId;
    private generatePolicyId;
    private initializeDefaultRoles;
    private initializeDefaultPermissions;
    private initializeDefaultPolicies;
}
export default Epic17AuthorizationService;
//# sourceMappingURL=Epic17AuthorizationService.d.ts.map
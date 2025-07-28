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
    roles: string;
    groups: string;
    permissions: Permission;
    attributes: Record<string, any>;
    sessionId?: string;
    lastLogin?: Date;
}
export interface ResourceContext {
    type: ResourceType;
    id: string;
    owner?: string;
    attributes: Record<string, any>;
    tags: string;
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
    WORKSPACE = "workspace",
    export,
    interface,
    Permission
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
    CONTEXT_BASED = "context_based",
    export,
    enum,
    ConditionOperator
}
//# sourceMappingURL=Epic17AuthorizationService.d.ts.map
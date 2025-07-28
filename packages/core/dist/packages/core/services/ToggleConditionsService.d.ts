export interface ToggleCondition {
    id: string;
    toggleId: string;
    name: string;
    description: string;
    conditionType: ConditionType;
    expression: string;
    parameters: ConditionParameters;
    priority: number;
    active: boolean;
    metadata: ConditionMetadata;
    created: Date;
    lastModified: Date;
}
export declare enum ConditionType {
    USER_ATTRIBUTE = "user_attribute",// Based on user properties (id, email, role, etc.)
    USER_SEGMENT = "user_segment",// Based on predefined user segments
    PERCENTAGE = "percentage",// Percentage-based rollout
    TIME_WINDOW = "time_window",// Time-based activation
    AB_TEST = "ab_test",// A/B testing conditions
    MULTIVARIATE = "multivariate",// Multivariate testing
    CUSTOM_EXPRESSION = "custom_expression",// Custom JavaScript-like expressions
    DEPENDENCY = "dependency",// Based on other toggles
    GEOGRAPHIC = "geographic",// Geographic/location-based
    DEVICE_TYPE = "device_type",// Device/platform-based
    TRAFFIC_SPLIT = "traffic_split",// Traffic splitting conditions
    FEATURE_FLAG = "feature_flag",// Based on other feature flags
    export,
    interface,
    ConditionParameters
}
export interface UserAttributeParams {
    attributes: Array<{}, key>;
    string: any;
    operator: ComparisonOperator;
    value: any;
}
export declare enum ComparisonOperator {
    EQUALS = "equals",
    NOT_EQUALS = "not_equals",
    GREATER_THAN = "greater_than",
    LESS_THAN = "less_than",
    GREATER_EQUAL = "greater_equal",
    LESS_EQUAL = "less_equal",
    CONTAINS = "contains",
    NOT_CONTAINS = "not_contains",
    STARTS_WITH = "starts_with",
    ENDS_WITH = "ends_with",
    MATCHES_REGEX = "matches_regex",
    IN_LIST = "in_list",
    NOT_IN_LIST = "not_in_list",
    export,
    interface,
    ScheduleParams
}
export interface ExperimentParams {
    experimentId: string;
    variant: string;
    trafficAllocation: number;
    stickiness?: 'user' | 'session' | 'device';
}
export interface ConditionMetadata {
    category: string;
    tags: string;
    epic?: string;
    story?: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    businessImpact: string;
    technicalNotes: string;
    author: string;
    reviewedBy?: string;
    reviewedAt?: Date;
}
export interface EvaluationContext {
    user?: UserContext;
    request?: RequestContext;
    environment?: EnvironmentContext;
    toggles?: Record<string, boolean>;
    experiments?: Record<string, string>;
    timestamp?: Date;
    customData?: Record<string, any>;
}
export interface UserContext {
    id: string;
    email?: string;
    role?: string;
    segment?: string;
    attributes?: Record<string, any>;
    groups?: string;
    permissions?: string;
}
export interface RequestContext {
    ip?: string;
    userAgent?: string;
    country?: string;
    region?: string;
    city?: string;
    device?: DeviceInfo;
    session?: SessionInfo;
}
export interface DeviceInfo {
    type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
    platform: string;
    browser?: string;
    version?: string;
}
export interface SessionInfo {
    id: string;
    startTime: Date;
    duration: number;
    pageViews: number;
}
export interface EnvironmentContext {
    environment: 'development' | 'staging' | 'production';
    region: string;
    timezone: string;
    version: string;
}
export interface ConditionEvaluationResult {
    conditionId: string;
    result: boolean;
    score?: number;
    reason: string;
    executionTime: number;
    metadata: {
        evaluatedAt: Date;
        contextHash: string;
        intermediateValues?: Record<string, any>;
    };
}
export interface ToggleEvaluationResult {
    toggleId: string;
    enabled: boolean;
    variant?: string;
    conditions: ConditionEvaluationResult;
    fallbackReason?: string;
    confidence: number;
    metadata: {
        evaluatedAt: Date;
        totalExecutionTime: number;
        cacheHit: boolean;
    };
}
export interface ToggleConditionsConfig {
    evaluation: {
        enableCaching: boolean;
        cacheTimeToLive: number;
        maxConditionsPerToggle: number;
        evaluationTimeout: number;
        strictMode: boolean;
    };
    security: {
        allowCustomExpressions: boolean;
        maxExpressionComplexity: number;
        enableSecurityAudit: boolean;
        blockedPatterns: string;
    };
    rollout: {
        defaultSalt: string;
        stickinessDuration: number;
        enableGradualRollout: boolean;
        rolloutRateLimit: number;
    };
    experiments: {
        enableABTesting: boolean;
        defaultTrafficAllocation: number;
        maxVariants: number;
        stickinessStrategy: 'user' | 'session' | 'device';
    };
}
export declare class ToggleConditionsService {
    private conditions;
    private toggleConditions;
    private evaluationCache;
    private config;
    private expressionEvaluator;
    constructor(config?: Partial<ToggleConditionsConfig>);
    default: throw;
}
//# sourceMappingURL=ToggleConditionsService.d.ts.map
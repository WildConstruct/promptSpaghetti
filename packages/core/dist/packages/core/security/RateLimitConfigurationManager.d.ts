import { RateLimitScope } from './RateLimiter';
export interface DynamicRateLimitRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    priority: number;
    conditions: RateLimitCondition;
    windowMs: number;
    maxRequests: number;
    burstLimit?: number;
    cooldownMs?: number;
    progressiveDelay?: boolean;
    scope: RateLimitScope;
    keyGenerator?: string;
    action: RateLimitAction;
    customMessage?: string;
    statusCode?: number;
    schedule?: RateLimitSchedule;
    alertThreshold?: number;
    logViolations?: boolean;
}
export interface RateLimitCondition {
    type: 'ip' | 'user' | 'endpoint' | 'method' | 'header' | 'query' | 'body' | 'time' | 'geo' | 'custom';
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'in' | 'range' | 'exists';
    field?: string;
    value?: any;
    values?: any;
    caseSensitive?: boolean;
    negate?: boolean;
}
export interface RateLimitAction {
    type: 'block' | 'delay' | 'throttle' | 'captcha' | 'redirect' | 'custom';
    statusCode?: number;
    delayMs?: number;
    redirectUrl?: string;
    customHandler?: string;
    parameters?: Record<string, any>;
}
export interface RateLimitSchedule {
    timezone: string;
    rules: ScheduleRule;
}
export interface ScheduleRule {
    days: number;
    startTime: string;
    endTime: string;
    windowMs?: number;
    maxRequests?: number;
}
export interface RateLimitProfile {
    id: string;
    name: string;
    description: string;
    rules: DynamicRateLimitRule;
    defaultRule?: Partial<DynamicRateLimitRule>;
    metadata: {
        version: string;
        createdAt: Date;
        updatedAt: Date;
        author: string;
        tags: string;
    };
}
export interface ConfigurationContext {
    environment: 'development' | 'staging' | 'production';
    region?: string;
    organizationId?: string;
    features?: string;
}
export declare class ConditionEvaluator {
    /**
    * Evaluate if a condition matches the given context
    */
    static evaluate(condition: RateLimitCondition, context: any): boolean;
    private static evaluateIP;
    private static evaluateUser;
    private static evaluateEndpoint;
    private static evaluateMethod;
    private static evaluateHeader;
    private static evaluateQuery;
    private static evaluateBody;
    private static evaluateTime;
    switch(condition: any, operator: any): any;
    default: ;
}
//# sourceMappingURL=RateLimitConfigurationManager.d.ts.map
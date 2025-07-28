/**
 * Rate Limit Configuration Manager
 * Task: T-1752989143997-874 - Implement configurable thresholds and windows
 * Epic 19: Authentication Enhancement & Security Hardening
 */
import { RateLimitConfig, RateLimitScope } from './RateLimiter';

export interface DynamicRateLimitRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    priority: number;
    conditions: RateLimitCondition[];
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

export interface RateLimitCondition {
    type: 'ip' | 'user' | 'endpoint' | 'method' | 'header' | 'query' | 'body' | 'time' | 'geo' | 'custom';
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'in' | 'range' | 'exists';
    field?: string;
    value?: any;
    values?: any[];
    caseSensitive?: boolean;
    negate?: boolean;

export interface RateLimitAction {
    type: 'block' | 'delay' | 'throttle' | 'captcha' | 'redirect' | 'custom';
    statusCode?: number;
    delayMs?: number;
    redirectUrl?: string;
    customHandler?: string;
    parameters?: Record<string, any>;

export interface RateLimitSchedule {
    timezone: string;
    rules: ScheduleRule[];

export interface ScheduleRule {
    days: number[];
    startTime: string;
    endTime: string;
    windowMs?: number;
    maxRequests?: number;

export interface RateLimitProfile {
    id: string;
    name: string;
    description: string;
    rules: DynamicRateLimitRule[];
    defaultRule?: Partial<DynamicRateLimitRule>;
    metadata: {,
        version: string;
        createdAt: Date;
        updatedAt: Date;
        author: string;
        tags: string[];
    };

export interface ConfigurationContext {
    environment: 'development' | 'staging' | 'production';
    region?: string;
    organizationId?: string;
    features?: string[];

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
    private static evaluateGeo;
    private static evaluateCustom;
    private static evaluateStringValue;
    private static getNestedValue;
    private static isIPInRange;

export declare class RateLimitConfigurationManager {
    private profiles;
    private activeProfile;
    private context;
    constructor(context: ConfigurationContext);
    /**
     * Load default rate limit profiles
     */
    private loadDefaultProfiles;
    /**
     * Add a new rate limit profile
     */
    addProfile(profile: RateLimitProfile): void;
    /**
     * Get a profile by ID
     */
    getProfile(id: string): RateLimitProfile | null;
    /**
     * Get the active profile
     */
    getActiveProfile(): RateLimitProfile | null;
    /**
     * Set the active profile
     */
    setActiveProfile(profileId: string): boolean;
    /**
     * Get all profiles
     */
    getAllProfiles(): RateLimitProfile[];
    /**
     * Find matching rules for a request context
     */
    findMatchingRules(requestContext: any): DynamicRateLimitRule[];
    /**
     * Convert dynamic rule to standard rate limit config
     */
    createRateLimitConfig(rule: DynamicRateLimitRule): RateLimitConfig;
    /**
     * Update a rule in the active profile
     */
    updateRule(ruleId: string, updates: Partial<DynamicRateLimitRule>): boolean;
    /**
     * Add a rule to the active profile
     */
    addRule(rule: DynamicRateLimitRule): boolean;
    /**
     * Remove a rule from the active profile
     */
    removeRule(ruleId: string): boolean;
    /**
     * Export configuration as JSON
     */
    exportConfiguration(): string;
    /**
     * Import configuration from JSON
     */
    importConfiguration(json: string): void;
    private validateProfile;
    private isRuleScheduleActive;
    private getKeyGenerator;
    private createActionHandler;

export declare class RateLimitConfigurationPresets {
    /**
     * Create a basic web application profile
     */
    static createWebAppProfile(): RateLimitProfile;
    /**
     * Create an API-focused profile
     */
    static createAPIProfile(): RateLimitProfile;

export default RateLimitConfigurationManager;
//# sourceMappingURL=RateLimitConfigurationManager.d.ts.map
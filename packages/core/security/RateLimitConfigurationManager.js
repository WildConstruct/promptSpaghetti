/**
 * Rate Limit Configuration Manager
 * Task: T-1752989143997-874 - Implement configurable thresholds and windows
 * Epic 19: Authentication Enhancement & Security Hardening
 */
import { z } from 'zod';
import { RateLimitKeyGenerator, RateLimitScope } from './RateLimiter.js';
// ========================================
// Validation Schemas
// ========================================
const RateLimitConditionSchema = z.object({
    type: z.enum(['ip', 'user', 'endpoint', 'method', 'header', 'query', 'body', 'time', 'geo', 'custom']),
    operator: z.enum(['equals', 'contains', 'startsWith', 'endsWith', 'regex', 'in', 'range', 'exists']),
    field: z.string().optional(),
    value: z.any().optional(),
    values: z.array(z.any()).optional(),
    caseSensitive: z.boolean().optional(),
    negate: z.boolean().optional()
});
const RateLimitActionSchema = z.object({
    type: z.enum(['block', 'delay', 'throttle', 'captcha', 'redirect', 'custom']),
    delayMs: z.number().min(0).max(60000).optional(),
    redirectUrl: z.string().url().optional(),
    customHandler: z.string().optional(),
    parameters: z.record(z.any()).optional()
});
const ScheduleRuleSchema = z.object({
    days: z.array(z.number().min(0).max(6)),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    windowMs: z.number().min(1000).max(86400000).optional(),
    maxRequests: z.number().min(1).max(100000).optional()
});
const RateLimitScheduleSchema = z.object({
    timezone: z.string(),
    rules: z.array(ScheduleRuleSchema)
});
const DynamicRateLimitRuleSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    enabled: z.boolean(),
    priority: z.number().min(0).max(1000),
    conditions: z.array(RateLimitConditionSchema),
    windowMs: z.number().min(1000).max(86400000),
    maxRequests: z.number().min(1).max(100000),
    burstLimit: z.number().min(1).max(100000).optional(),
    cooldownMs: z.number().min(0).max(86400000).optional(),
    progressiveDelay: z.boolean().optional(),
    scope: z.nativeEnum(RateLimitScope),
    keyGenerator: z.string().optional(),
    action: RateLimitActionSchema,
    customMessage: z.string().optional(),
    statusCode: z.number().min(400).max(599).optional(),
    schedule: RateLimitScheduleSchema.optional(),
    alertThreshold: z.number().min(0).max(100).optional(),
    logViolations: z.boolean().optional()
});
// ========================================
// Condition Evaluators
// ========================================
export class ConditionEvaluator {
    /**
     * Evaluate if a condition matches the given context
     */
    static evaluate(condition, context) {
        let result = false;
        try {
            switch (condition.type) {
                case 'ip':
                    result = this.evaluateIP(condition, context.ip);
                    break;
                case 'user':
                    result = this.evaluateUser(condition, context.userId);
                    break;
                case 'endpoint':
                    result = this.evaluateEndpoint(condition, context.path);
                    break;
                case 'method':
                    result = this.evaluateMethod(condition, context.method);
                    break;
                case 'header':
                    result = this.evaluateHeader(condition, context.headers);
                    break;
                case 'query':
                    result = this.evaluateQuery(condition, context.query);
                    break;
                case 'body':
                    result = this.evaluateBody(condition, context.body);
                    break;
                case 'time':
                    result = this.evaluateTime(condition, new Date());
                    break;
                case 'geo':
                    result = this.evaluateGeo(condition, context.geo);
                    break;
                case 'custom':
                    result = this.evaluateCustom(condition, context);
                    break;
                default:
                    result = false;
            }
        }
        catch (error) {
            console.error('Condition evaluation error:', error);
            result = false;
        }
        return condition.negate ? !result : result;
    }
    static evaluateIP(condition, ip) {
        if (!ip)
            return false;
        switch (condition.operator) {
            case 'equals':
                return ip === condition.value;
            case 'contains':
                return ip.includes(condition.value);
            case 'startsWith':
                return ip.startsWith(condition.value);
            case 'in':
                return condition.values?.includes(ip) || false;
            case 'regex':
                return new RegExp(condition.value).test(ip);
            case 'range':
                return this.isIPInRange(ip, condition.value);
            default:
                return false;
        }
    }
    static evaluateUser(condition, userId) {
        if (!userId)
            return condition.operator === 'exists' ? false : true; // Anonymous user
        switch (condition.operator) {
            case 'equals':
                return userId === condition.value;
            case 'in':
                return condition.values?.includes(userId) || false;
            case 'exists':
                return true;
            default:
                return false;
        }
    }
    static evaluateEndpoint(condition, path) {
        if (!path)
            return false;
        switch (condition.operator) {
            case 'equals':
                return path === condition.value;
            case 'contains':
                return path.includes(condition.value);
            case 'startsWith':
                return path.startsWith(condition.value);
            case 'endsWith':
                return path.endsWith(condition.value);
            case 'regex':
                return new RegExp(condition.value).test(path);
            case 'in':
                return condition.values?.includes(path) || false;
            default:
                return false;
        }
    }
    static evaluateMethod(condition, method) {
        if (!method)
            return false;
        const normalizedMethod = method.toUpperCase();
        const conditionValue = condition.value?.toUpperCase();
        switch (condition.operator) {
            case 'equals':
                return normalizedMethod === conditionValue;
            case 'in':
                return condition.values?.map(v => v.toUpperCase()).includes(normalizedMethod) || false;
            default:
                return false;
        }
    }
    static evaluateHeader(condition, headers) {
        if (!headers || !condition.field)
            return false;
        const headerValue = headers[condition.field.toLowerCase()];
        if (!headerValue)
            return condition.operator === 'exists' ? false : true;
        return this.evaluateStringValue(condition, headerValue);
    }
    static evaluateQuery(condition, query) {
        if (!query || !condition.field)
            return false;
        const queryValue = query[condition.field];
        if (queryValue === undefined)
            return condition.operator === 'exists' ? false : true;
        return this.evaluateStringValue(condition, String(queryValue));
    }
    static evaluateBody(condition, body) {
        if (!body || !condition.field)
            return false;
        const bodyValue = this.getNestedValue(body, condition.field);
        if (bodyValue === undefined)
            return condition.operator === 'exists' ? false : true;
        return this.evaluateStringValue(condition, String(bodyValue));
    }
    static evaluateTime(condition, currentTime) {
        const hour = currentTime.getHours();
        const minute = currentTime.getMinutes();
        const day = currentTime.getDay();
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        switch (condition.operator) {
            case 'range':
                if (condition.value?.start && condition.value?.end) {
                    return timeString >= condition.value.start && timeString <= condition.value.end;
                }
                return false;
            case 'in':
                return condition.values?.includes(day) || false;
            default:
                return false;
        }
    }
    static evaluateGeo(condition, geo) {
        if (!geo)
            return false;
        const country = geo.country;
        const region = geo.region;
        const city = geo.city;
        switch (condition.operator) {
            case 'equals':
                return country === condition.value;
            case 'in':
                return condition.values?.includes(country) || false;
            default:
                return false;
        }
    }
    static evaluateCustom(condition, context) {
        // Placeholder for custom condition evaluation
        // This would be implemented based on specific business logic
        return false;
    }
    static evaluateStringValue(condition, value) {
        const compareValue = condition.caseSensitive ? value : value.toLowerCase();
        const conditionValue = condition.caseSensitive ? condition.value : condition.value?.toLowerCase();
        switch (condition.operator) {
            case 'equals':
                return compareValue === conditionValue;
            case 'contains':
                return compareValue.includes(conditionValue);
            case 'startsWith':
                return compareValue.startsWith(conditionValue);
            case 'endsWith':
                return compareValue.endsWith(conditionValue);
            case 'regex':
                return new RegExp(condition.value, condition.caseSensitive ? 'g' : 'gi').test(value);
            case 'in':
                return condition.values?.some(v => condition.caseSensitive ? v === value : v.toLowerCase() === compareValue) || false;
            case 'exists':
                return true;
            default:
                return false;
        }
    }
    static getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    static isIPInRange(ip, range) {
        // Simplified IP range check - in production, use a proper IP library
        if (range.includes('/')) {
            // CIDR notation
            const [network, prefix] = range.split('/');
            // Implement CIDR matching logic
            return ip.startsWith(network.split('.').slice(0, Math.floor(parseInt(prefix) / 8)).join('.'));
        }
        else if (range.includes('-')) {
            // Range notation (e.g., 192.168.1.1-192.168.1.100)
            const [start, end] = range.split('-');
            // Implement IP range matching logic
            return ip >= start && ip <= end;
        }
        return false;
    }
}
// ========================================
// Configuration Manager
// ========================================
export class RateLimitConfigurationManager {
    profiles = new Map();
    activeProfile = null;
    context;
    constructor(context) {
        this.context = context;
        this.loadDefaultProfiles();
    }
    /**
     * Load default rate limit profiles
     */
    loadDefaultProfiles() {
        // Development profile
        this.addProfile({
            id: 'development',
            name: 'Development Profile',
            description: 'Lenient rate limits for development environment',
            rules: [
                {
                    id: 'dev-api',
                    name: 'API Endpoints',
                    description: 'General API rate limit for development',
                    enabled: true,
                    priority: 100,
                    conditions: [
                        { type: 'endpoint', operator: 'startsWith', value: '/api' }
                    ],
                    windowMs: 60000, // 1 minute
                    maxRequests: 1000,
                    scope: RateLimitScope.IP,
                    action: { type: 'block' }
                }
            ],
            metadata: {
                version: '1.0.0',
                createdAt: new Date(),
                updatedAt: new Date(),
                author: 'system',
                tags: ['development', 'default']
            }
        });
        // Production profile
        this.addProfile({
            id: 'production',
            name: 'Production Profile',
            description: 'Strict rate limits for production environment',
            rules: [
                {
                    id: 'auth-strict',
                    name: 'Authentication Endpoints',
                    description: 'Strict limits for auth endpoints',
                    enabled: true,
                    priority: 1000,
                    conditions: [
                        { type: 'endpoint', operator: 'in', values: ['/api/auth/login', '/api/auth/register', '/api/auth/reset'] }
                    ],
                    windowMs: 900000, // 15 minutes
                    maxRequests: 5,
                    scope: RateLimitScope.IP,
                    action: { type: 'block' },
                    alertThreshold: 80,
                    logViolations: true
                },
                {
                    id: 'api-general',
                    name: 'General API',
                    description: 'General API rate limits',
                    enabled: true,
                    priority: 100,
                    conditions: [
                        { type: 'endpoint', operator: 'startsWith', value: '/api' }
                    ],
                    windowMs: 900000, // 15 minutes
                    maxRequests: 1000,
                    scope: RateLimitScope.USER,
                    action: { type: 'block' }
                }
            ],
            metadata: {
                version: '1.0.0',
                createdAt: new Date(),
                updatedAt: new Date(),
                author: 'system',
                tags: ['production', 'default']
            }
        });
        // Set active profile based on environment
        this.setActiveProfile(this.context.environment);
    }
    /**
     * Add a new rate limit profile
     */
    addProfile(profile) {
        // Validate profile
        this.validateProfile(profile);
        this.profiles.set(profile.id, {
            ...profile,
            metadata: {
                ...profile.metadata,
                updatedAt: new Date()
            }
        });
    }
    /**
     * Get a profile by ID
     */
    getProfile(id) {
        return this.profiles.get(id) || null;
    }
    /**
     * Get the active profile
     */
    getActiveProfile() {
        if (!this.activeProfile)
            return null;
        return this.getProfile(this.activeProfile);
    }
    /**
     * Set the active profile
     */
    setActiveProfile(profileId) {
        if (this.profiles.has(profileId)) {
            this.activeProfile = profileId;
            return true;
        }
        return false;
    }
    /**
     * Get all profiles
     */
    getAllProfiles() {
        return Array.from(this.profiles.values());
    }
    /**
     * Find matching rules for a request context
     */
    findMatchingRules(requestContext) {
        const activeProfile = this.getActiveProfile();
        if (!activeProfile)
            return [];
        const matchingRules = [];
        for (const rule of activeProfile.rules) {
            if (!rule.enabled)
                continue;
            // Check schedule if defined
            if (rule.schedule && !this.isRuleScheduleActive(rule.schedule)) {
                continue;
            }
            // Check all conditions
            const allConditionsMet = rule.conditions.every(condition => ConditionEvaluator.evaluate(condition, requestContext));
            if (allConditionsMet) {
                matchingRules.push(rule);
            }
        }
        // Sort by priority (highest first)
        return matchingRules.sort((a, b) => b.priority - a.priority);
    }
    /**
     * Convert dynamic rule to standard rate limit config
     */
    createRateLimitConfig(rule) {
        return {
            windowMs: rule.windowMs,
            maxRequests: rule.maxRequests,
            keyGenerator: this.getKeyGenerator(rule.scope, rule.keyGenerator),
            message: rule.customMessage,
            statusCode: rule.statusCode,
            standardHeaders: true,
            onLimitReached: this.createActionHandler(rule.action)
        };
    }
    /**
     * Update a rule in the active profile
     */
    updateRule(ruleId, updates) {
        const activeProfile = this.getActiveProfile();
        if (!activeProfile)
            return false;
        const ruleIndex = activeProfile.rules.findIndex(r => r.id === ruleId);
        if (ruleIndex === -1)
            return false;
        activeProfile.rules[ruleIndex] = {
            ...activeProfile.rules[ruleIndex],
            ...updates
        };
        activeProfile.metadata.updatedAt = new Date();
        return true;
    }
    /**
     * Add a rule to the active profile
     */
    addRule(rule) {
        const activeProfile = this.getActiveProfile();
        if (!activeProfile)
            return false;
        // Validate rule
        try {
            DynamicRateLimitRuleSchema.parse(rule);
        }
        catch (error) {
            throw new Error(`Invalid rule configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        activeProfile.rules.push(rule);
        activeProfile.metadata.updatedAt = new Date();
        return true;
    }
    /**
     * Remove a rule from the active profile
     */
    removeRule(ruleId) {
        const activeProfile = this.getActiveProfile();
        if (!activeProfile)
            return false;
        const initialLength = activeProfile.rules.length;
        activeProfile.rules = activeProfile.rules.filter(r => r.id !== ruleId);
        if (activeProfile.rules.length < initialLength) {
            activeProfile.metadata.updatedAt = new Date();
            return true;
        }
        return false;
    }
    /**
     * Export configuration as JSON
     */
    exportConfiguration() {
        return JSON.stringify({
            context: this.context,
            activeProfile: this.activeProfile,
            profiles: Array.from(this.profiles.values())
        }, null, 2);
    }
    /**
     * Import configuration from JSON
     */
    importConfiguration(json) {
        try {
            const config = JSON.parse(json);
            // Validate and import profiles
            for (const profile of config.profiles || []) {
                this.addProfile(profile);
            }
            // Set active profile if specified
            if (config.activeProfile && this.profiles.has(config.activeProfile)) {
                this.activeProfile = config.activeProfile;
            }
        }
        catch (error) {
            throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // ========================================
    // Private Helper Methods
    // ========================================
    validateProfile(profile) {
        if (!profile.id || !profile.name) {
            throw new Error('Profile must have ID and name');
        }
        for (const rule of profile.rules) {
            try {
                DynamicRateLimitRuleSchema.parse(rule);
            }
            catch (error) {
                throw new Error(`Invalid rule '${rule.id}': ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }
    isRuleScheduleActive(schedule) {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        return schedule.rules.some(rule => {
            const dayMatches = rule.days.includes(currentDay);
            const timeMatches = currentTime >= rule.startTime && currentTime <= rule.endTime;
            return dayMatches && timeMatches;
        });
    }
    getKeyGenerator(scope, customGenerator) {
        if (customGenerator) {
            // Return named generator if available
            const generators = {
                'byIP': RateLimitKeyGenerator.byIP,
                'byUser': RateLimitKeyGenerator.byUser,
                'byEndpoint': RateLimitKeyGenerator.byEndpoint,
                'byIPAndEndpoint': RateLimitKeyGenerator.byIPAndEndpoint,
                'byUserAndEndpoint': RateLimitKeyGenerator.byUserAndEndpoint,
                'bySession': RateLimitKeyGenerator.bySession,
                'byOrganization': RateLimitKeyGenerator.byOrganization
            };
            return generators[customGenerator] || RateLimitKeyGenerator.byIP;
        }
        // Default generators based on scope
        switch (scope) {
            case RateLimitScope.IP:
                return RateLimitKeyGenerator.byIP;
            case RateLimitScope.USER:
                return RateLimitKeyGenerator.byUser;
            case RateLimitScope.ENDPOINT:
                return RateLimitKeyGenerator.byEndpoint;
            case RateLimitScope.GLOBAL:
                return () => 'global';
            default:
                return RateLimitKeyGenerator.byIP;
        }
    }
    createActionHandler(action) {
        return (context, info) => {
            switch (action.type) {
                case 'block':
                    // Default blocking behavior
                    break;
                case 'delay':
                    // Implement delay logic
                    if (action.delayMs) {
                        setTimeout(() => { }, action.delayMs);
                    }
                    break;
                case 'throttle':
                    // Implement throttling logic
                    break;
                case 'captcha':
                    // Trigger CAPTCHA challenge
                    break;
                case 'redirect':
                    // Handle redirect
                    if (action.redirectUrl) {
                        context.redirect = action.redirectUrl;
                    }
                    break;
                case 'custom':
                    // Handle custom action
                    if (action.customHandler) {
                        // Execute custom handler
                    }
                    break;
            }
        };
    }
}
// ========================================
// Configuration Presets
// ========================================
export class RateLimitConfigurationPresets {
    /**
     * Create a basic web application profile
     */
    static createWebAppProfile() {
        return {
            id: 'web-app',
            name: 'Web Application',
            description: 'Standard rate limits for web applications',
            rules: [
                {
                    id: 'auth-endpoints',
                    name: 'Authentication',
                    description: 'Rate limit for login/register endpoints',
                    enabled: true,
                    priority: 1000,
                    conditions: [
                        { type: 'endpoint', operator: 'regex', value: '/(login|register|forgot-password)' }
                    ],
                    windowMs: 900000, // 15 minutes
                    maxRequests: 5,
                    scope: RateLimitScope.IP,
                    action: { type: 'block' },
                    alertThreshold: 80,
                    logViolations: true
                },
                {
                    id: 'api-endpoints',
                    name: 'API Endpoints',
                    description: 'General API rate limiting',
                    enabled: true,
                    priority: 500,
                    conditions: [
                        { type: 'endpoint', operator: 'startsWith', value: '/api' }
                    ],
                    windowMs: 900000, // 15 minutes
                    maxRequests: 1000,
                    scope: RateLimitScope.USER,
                    action: { type: 'block' }
                },
                {
                    id: 'static-assets',
                    name: 'Static Assets',
                    description: 'Lenient limits for static assets',
                    enabled: true,
                    priority: 100,
                    conditions: [
                        { type: 'endpoint', operator: 'regex', value: '\\.(css|js|png|jpg|gif|svg|ico)$' }
                    ],
                    windowMs: 60000, // 1 minute
                    maxRequests: 1000,
                    scope: RateLimitScope.IP,
                    action: { type: 'throttle', delayMs: 100 }
                }
            ],
            metadata: {
                version: '1.0.0',
                createdAt: new Date(),
                updatedAt: new Date(),
                author: 'system',
                tags: ['web-app', 'preset']
            }
        };
    }
    /**
     * Create an API-focused profile
     */
    static createAPIProfile() {
        return {
            id: 'api-service',
            name: 'API Service',
            description: 'Rate limits optimized for API services',
            rules: [
                {
                    id: 'free-tier',
                    name: 'Free Tier Users',
                    description: 'Limits for free tier users',
                    enabled: true,
                    priority: 1000,
                    conditions: [
                        { type: 'header', operator: 'equals', field: 'x-api-tier', value: 'free' }
                    ],
                    windowMs: 3600000, // 1 hour
                    maxRequests: 100,
                    scope: RateLimitScope.USER,
                    action: { type: 'block', statusCode: 402 },
                    customMessage: 'Free tier limit exceeded. Please upgrade your plan.'
                },
                {
                    id: 'premium-tier',
                    name: 'Premium Tier Users',
                    description: 'Limits for premium tier users',
                    enabled: true,
                    priority: 800,
                    conditions: [
                        { type: 'header', operator: 'equals', field: 'x-api-tier', value: 'premium' }
                    ],
                    windowMs: 3600000, // 1 hour
                    maxRequests: 10000,
                    scope: RateLimitScope.USER,
                    action: { type: 'block' }
                }
            ],
            metadata: {
                version: '1.0.0',
                createdAt: new Date(),
                updatedAt: new Date(),
                author: 'system',
                tags: ['api', 'preset']
            }
        };
    }
}
export default RateLimitConfigurationManager;

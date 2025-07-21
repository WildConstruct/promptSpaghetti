/**
 * Rate Limit Configuration Manager
 * Task: T-1752989143997-874 - Implement configurable thresholds and windows
 * Epic 19: Authentication Enhancement & Security Hardening
 */

import { z } from 'zod';
import { RateLimitConfig, RateLimitKeyGenerator, RateLimitScope } from './RateLimiter';

// ========================================
// Configuration Types
// ========================================

export interface DynamicRateLimitRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number; // Higher priority rules are checked first
  
  // Matching criteria
  conditions: RateLimitCondition[];
  
  // Rate limit parameters
  windowMs: number;
  maxRequests: number;
  
  // Optional advanced settings
  burstLimit?: number;        // Allow bursts up to this limit
  cooldownMs?: number;        // Cooldown period after limit exceeded
  progressiveDelay?: boolean; // Increase delay with each violation
  
  // Scope and targeting
  scope: RateLimitScope;
  keyGenerator?: string;      // Named key generator
  
  // Actions and responses
  action: RateLimitAction;
  customMessage?: string;
  statusCode?: number;
  
  // Scheduling
  schedule?: RateLimitSchedule;
  
  // Monitoring
  alertThreshold?: number;    // Alert when this percentage of limit is reached
  logViolations?: boolean;
}

export interface RateLimitCondition {
  type: 'ip' | 'user' | 'endpoint' | 'method' | 'header' | 'query' | 'body' | 'time' | 'geo' | 'custom';
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'in' | 'range' | 'exists';
  field?: string;             // Field name for header/query/body conditions
  value?: any;                // Value to compare against
  values?: any[];             // Multiple values for 'in' operator
  caseSensitive?: boolean;    // For string comparisons
  negate?: boolean;           // Invert the condition
}

export interface RateLimitAction {
  type: 'block' | 'delay' | 'throttle' | 'captcha' | 'redirect' | 'custom';
  delayMs?: number;           // For delay/throttle actions
  redirectUrl?: string;       // For redirect action
  customHandler?: string;     // For custom action
  parameters?: Record<string, any>;
}

export interface RateLimitSchedule {
  timezone: string;
  rules: ScheduleRule[];
}

export interface ScheduleRule {
  days: number[];             // 0-6 (Sunday-Saturday)
  startTime: string;          // HH:MM format
  endTime: string;            // HH:MM format
  windowMs?: number;          // Override window for this schedule
  maxRequests?: number;       // Override max requests for this schedule
}

export interface RateLimitProfile {
  id: string;
  name: string;
  description: string;
  rules: DynamicRateLimitRule[];
  defaultRule?: Partial<DynamicRateLimitRule>;
  metadata: {
    version: string;
    createdAt: Date;
    updatedAt: Date;
    author: string;
    tags: string[];
  };
}

export interface ConfigurationContext {
  environment: 'development' | 'staging' | 'production';
  region?: string;
  organizationId?: string;
  features?: string[];
}

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
  static evaluate(condition: RateLimitCondition, context: any): boolean {
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
    } catch (error) {
      console.error('Condition evaluation error:', error);
      result = false;
    }

    return condition.negate ? !result : result;
  }

  private static evaluateIP(condition: RateLimitCondition, ip: string): boolean {
    if (!ip) return false;

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

  private static evaluateUser(condition: RateLimitCondition, userId: string): boolean {
    if (!userId) return condition.operator === 'exists' ? false : true; // Anonymous user

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

  private static evaluateEndpoint(condition: RateLimitCondition, path: string): boolean {
    if (!path) return false;

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

  private static evaluateMethod(condition: RateLimitCondition, method: string): boolean {
    if (!method) return false;

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

  private static evaluateHeader(condition: RateLimitCondition, headers: Record<string, string>): boolean {
    if (!headers || !condition.field) return false;

    const headerValue = headers[condition.field.toLowerCase()];
    if (!headerValue) return condition.operator === 'exists' ? false : true;

    return this.evaluateStringValue(condition, headerValue);
  }

  private static evaluateQuery(condition: RateLimitCondition, query: Record<string, any>): boolean {
    if (!query || !condition.field) return false;

    const queryValue = query[condition.field];
    if (queryValue === undefined) return condition.operator === 'exists' ? false : true;

    return this.evaluateStringValue(condition, String(queryValue));
  }

  private static evaluateBody(condition: RateLimitCondition, body: any): boolean {
    if (!body || !condition.field) return false;

    const bodyValue = this.getNestedValue(body, condition.field);
    if (bodyValue === undefined) return condition.operator === 'exists' ? false : true;

    return this.evaluateStringValue(condition, String(bodyValue));
  }

  private static evaluateTime(condition: RateLimitCondition, currentTime: Date): boolean {
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

  private static evaluateGeo(condition: RateLimitCondition, geo: any): boolean {
    if (!geo) return false;

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

  private static evaluateCustom(condition: RateLimitCondition, context: any): boolean {
    // Placeholder for custom condition evaluation
    // This would be implemented based on specific business logic
    return false;
  }

  private static evaluateStringValue(condition: RateLimitCondition, value: string): boolean {
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
      return condition.values?.some(v => 
        condition.caseSensitive ? v === value : v.toLowerCase() === compareValue
      ) || false;
    case 'exists':
      return true;
    default:
      return false;
    }
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static isIPInRange(ip: string, range: string): boolean {
    // Simplified IP range check - in production, use a proper IP library
    if (range.includes('/')) {
      // CIDR notation
      const [network, prefix] = range.split('/');
      // Implement CIDR matching logic
      return ip.startsWith(network.split('.').slice(0, Math.floor(parseInt(prefix) / 8)).join('.'));
    } else if (range.includes('-')) {
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
  private profiles: Map<string, RateLimitProfile> = new Map();
  private activeProfile: string | null = null;
  private context: ConfigurationContext;

  constructor(context: ConfigurationContext) {
    this.context = context;
    this.loadDefaultProfiles();
  }

  /**
   * Load default rate limit profiles
   */
  private loadDefaultProfiles(): void {
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
  addProfile(profile: RateLimitProfile): void {
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
  getProfile(id: string): RateLimitProfile | null {
    return this.profiles.get(id) || null;
  }

  /**
   * Get the active profile
   */
  getActiveProfile(): RateLimitProfile | null {
    if (!this.activeProfile) return null;
    return this.getProfile(this.activeProfile);
  }

  /**
   * Set the active profile
   */
  setActiveProfile(profileId: string): boolean {
    if (this.profiles.has(profileId)) {
      this.activeProfile = profileId;
      return true;
    }
    return false;
  }

  /**
   * Get all profiles
   */
  getAllProfiles(): RateLimitProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Find matching rules for a request context
   */
  findMatchingRules(requestContext: any): DynamicRateLimitRule[] {
    const activeProfile = this.getActiveProfile();
    if (!activeProfile) return [];

    const matchingRules: DynamicRateLimitRule[] = [];

    for (const rule of activeProfile.rules) {
      if (!rule.enabled) continue;

      // Check schedule if defined
      if (rule.schedule && !this.isRuleScheduleActive(rule.schedule)) {
        continue;
      }

      // Check all conditions
      const allConditionsMet = rule.conditions.every(condition =>
        ConditionEvaluator.evaluate(condition, requestContext)
      );

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
  createRateLimitConfig(rule: DynamicRateLimitRule): RateLimitConfig {
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
  updateRule(ruleId: string, updates: Partial<DynamicRateLimitRule>): boolean {
    const activeProfile = this.getActiveProfile();
    if (!activeProfile) return false;

    const ruleIndex = activeProfile.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) return false;

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
  addRule(rule: DynamicRateLimitRule): boolean {
    const activeProfile = this.getActiveProfile();
    if (!activeProfile) return false;

    // Validate rule
    try {
      DynamicRateLimitRuleSchema.parse(rule);
    } catch (error) {
      throw new Error(`Invalid rule configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    activeProfile.rules.push(rule);
    activeProfile.metadata.updatedAt = new Date();
    return true;
  }

  /**
   * Remove a rule from the active profile
   */
  removeRule(ruleId: string): boolean {
    const activeProfile = this.getActiveProfile();
    if (!activeProfile) return false;

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
  exportConfiguration(): string {
    return JSON.stringify({
      context: this.context,
      activeProfile: this.activeProfile,
      profiles: Array.from(this.profiles.values())
    }, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfiguration(json: string): void {
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
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ========================================
  // Private Helper Methods
  // ========================================

  private validateProfile(profile: RateLimitProfile): void {
    if (!profile.id || !profile.name) {
      throw new Error('Profile must have ID and name');
    }

    for (const rule of profile.rules) {
      try {
        DynamicRateLimitRuleSchema.parse(rule);
      } catch (error) {
        throw new Error(`Invalid rule '${rule.id}': ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private isRuleScheduleActive(schedule: RateLimitSchedule): boolean {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    return schedule.rules.some(rule => {
      const dayMatches = rule.days.includes(currentDay);
      const timeMatches = currentTime >= rule.startTime && currentTime <= rule.endTime;
      return dayMatches && timeMatches;
    });
  }

  private getKeyGenerator(scope: RateLimitScope, customGenerator?: string): (context: any) => string {
    if (customGenerator) {
      // Return named generator if available
      const generators: Record<string, (context: any) => string> = {
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

  private createActionHandler(action: RateLimitAction): (context: any, info: any) => void {
    return (context, info) => {
      switch (action.type) {
      case 'block':
        // Default blocking behavior
        break;
      case 'delay':
        // Implement delay logic
        if (action.delayMs) {
          setTimeout(() => {}, action.delayMs);
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
  static createWebAppProfile(): RateLimitProfile {
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
  static createAPIProfile(): RateLimitProfile {
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
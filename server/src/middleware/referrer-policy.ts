/**
 * Referrer Policy Middleware - Epic 19 Implementation
 * Configures and manages Referrer-Policy headers for enhanced privacy and security
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';

export interface ReferrerPolicyConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  version: number;
  
  policy: {
    default: ReferrerPolicyValue;
    pathSpecific?: Array<{
      path: string;
      method?: string | string[];
      policy: ReferrerPolicyValue;
      exactMatch: boolean;
    }>;
    domainSpecific?: Array<{
      domain: string;
      policy: ReferrerPolicyValue;
      includeSubdomains: boolean;
    }>;
  };
  
  scope: {
    global: boolean;
    environments?: string[];
    userTypes?: string[];
    sensitiveRoutes?: string[];
    apiRoutes?: string[];
    adminRoutes?: string[];
  };
  
  security: {
    strictMode: boolean;
    preventDowngrade: boolean;
    logViolations: boolean;
    blockUnsafeReferrers: boolean;
    allowedOrigins?: string[];
    blockedOrigins?: string[];
  };
  
  reporting: {
    enabled: boolean;
    reportUri?: string;
    reportOnlyMode: boolean;
    sampleRate: number; // 0-100
    includeUserAgent: boolean;
  };
  
  metadata: {
    createdBy: string;
    createdAt: Date;
    lastModifiedBy?: string;
    lastModifiedAt?: Date;
    tags: string[];
    businessJustification?: string;
  };
}

export type ReferrerPolicyValue = 
  | 'no-referrer'
  | 'no-referrer-when-downgrade' 
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

export interface ReferrerViolation {
  id: string;
  timestamp: Date;
  
  request: {
    url: string;
    method: string;
    userAgent: string;
    ip: string;
    userId?: string;
  };
  
  referrer: {
    header: string;
    expectedPolicy: ReferrerPolicyValue;
    actualPolicy?: ReferrerPolicyValue;
    origin: string;
    isSecure: boolean;
  };
  
  violation: {
    type: 'unsafe_referrer' | 'policy_downgrade' | 'blocked_origin' | 'missing_policy' | 'policy_violation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    blocked: boolean;
    action: 'allow' | 'block' | 'warn' | 'redirect';
  };
  
  response: {
    status: number;
    headers: Record<string, string>;
    redirected: boolean;
    redirectUrl?: string;
  };
  
  metadata: {
    configId: string;
    environment: string;
    userType?: string;
    tags: string[];
  };
}

export interface ReferrerPolicyStatistics {
  timeRange: { start: Date; end: Date };
  
  overview: {
    totalRequests: number;
    policyApplied: number;
    violationsDetected: number;
    blockedRequests: number;
    averageResponseTime: number;
  };
  
  policies: {
    byValue: Record<ReferrerPolicyValue, number>;
    byPath: Record<string, { policy: ReferrerPolicyValue; count: number }>;
    byDomain: Record<string, { policy: ReferrerPolicyValue; count: number }>;
    effectiveness: Record<ReferrerPolicyValue, { applied: number; violations: number }>;
  };
  
  violations: {
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byOrigin: Record<string, number>;
    trends: Array<{ hour: number; violations: number; blocked: number }>;
  };
  
  compliance: {
    policyCompliance: number; // percentage
    securityScore: number; // 0-100
    privacyScore: number; // 0-100
    recommendedPolicies: Array<{
      path: string;
      currentPolicy: ReferrerPolicyValue;
      recommendedPolicy: ReferrerPolicyValue;
      reason: string;
    }>;
  };
}

export class ReferrerPolicyService {
  private db: DatabaseService;
  private redis: RedisService;
  private configs: Map<string, ReferrerPolicyConfig> = new Map();
  private violations: ReferrerViolation[] = [];
  private statistics: Map<string, number> = new Map();
  private config: {
    defaultPolicy: ReferrerPolicyValue;
    maxViolationHistory: number;
    cacheTimeout: number; // seconds
    enableReporting: boolean;
    strictModeDefault: boolean;
  };

  constructor(
    db: DatabaseService,
    redis: RedisService,
    config?: Partial<ReferrerPolicyService['config']>
  ) {
    this.db = db;
    this.redis = redis;
    this.config = {
      defaultPolicy: 'strict-origin-when-cross-origin',
      maxViolationHistory: 10000,
      cacheTimeout: 3600,
      enableReporting: true,
      strictModeDefault: true,
      ...config
    };
    
    this.initializeDefaultConfigs();
  }

  /**
   * Fastify middleware to apply referrer policy headers
   */
  middleware() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const startTime = Date.now();
        
        // Get applicable policy configuration
        const policyConfig = await this.getPolicyForRequest(request);
        
        // Determine the referrer policy to apply
        const policy = this.determinePolicyValue(request, policyConfig);
        
        // Validate incoming referrer if present
        const referrerHeader = (request.headers.referer || request.headers.referrer) as string;
        if (referrerHeader && policyConfig?.security.blockUnsafeReferrers) {
          const validation = await this.validateReferrer(request, referrerHeader, policy);
          
          if (!validation.valid && validation.shouldBlock) {
            await this.logViolation(request, referrerHeader, policy, validation);
            
            if (policyConfig?.security.strictMode) {
              reply.status(403).send({
                error: 'Referrer policy violation',
                message: 'Request blocked due to unsafe referrer'
              });
              return;
            }
          }
        }
        
        // Apply the referrer policy header
        reply.header('Referrer-Policy', policy);
        
        // Add additional security headers if configured
        if (policyConfig?.security.strictMode) {
          reply.header('X-Frame-Options', 'DENY');
          reply.header('X-Content-Type-Options', 'nosniff');
        }
        
        // Update statistics
        await this.updateStatistics(policy, Date.now() - startTime);
        
        // Log for monitoring
        if (policyConfig?.reporting.enabled) {
          await this.logPolicyApplication(request, policy, policyConfig);
        }

      } catch (error) {
        console.error('Error applying referrer policy:', error);
        // Apply default policy as fallback
        reply.header('Referrer-Policy', this.config.defaultPolicy);
      }
    };
  }

  /**
   * Create a new referrer policy configuration
   */
  async createPolicyConfig(
    configData: Omit<ReferrerPolicyConfig, 'id' | 'version' | 'metadata'> & {
      createdBy: string;
      tags?: string[];
      businessJustification?: string;
    }
  ): Promise<{
    success: boolean;
    configId?: string;
    message: string;
  }> {
    try {
      // Validate policy values
      const validation = this.validatePolicyConfig(configData);
      if (!validation.valid) {
        return {
          success: false,
          message: `Invalid policy configuration: ${validation.errors.join(', ')}`
        };
      }

      const config: ReferrerPolicyConfig = {
        ...configData,
        id: this.generateConfigId(),
        version: 1,
        metadata: {
          createdBy: configData.createdBy,
          createdAt: new Date(),
          tags: configData.tags || [],
          businessJustification: configData.businessJustification
        }
      };

      // Store configuration
      this.configs.set(config.id, config);
      await this.savePolicyConfig(config);

      // Clear cache to force reload
      await this.clearPolicyCache();

      return {
        success: true,
        configId: config.id,
        message: 'Referrer policy configuration created successfully'
      };

    } catch (error) {
      console.error('Error creating policy configuration:', error);
      return {
        success: false,
        message: 'Failed to create policy configuration'
      };
    }
  }

  /**
   * Update an existing policy configuration
   */
  async updatePolicyConfig(
    configId: string,
    updates: Partial<Omit<ReferrerPolicyConfig, 'id' | 'version' | 'metadata'>> & {
      lastModifiedBy: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const existingConfig = this.configs.get(configId);
      if (!existingConfig) {
        return {
          success: false,
          message: 'Policy configuration not found'
        };
      }

      // Create updated configuration
      const updatedConfig: ReferrerPolicyConfig = {
        ...existingConfig,
        ...updates,
        id: configId,
        version: existingConfig.version + 1,
        metadata: {
          ...existingConfig.metadata,
          lastModifiedBy: updates.lastModifiedBy,
          lastModifiedAt: new Date()
        }
      };

      // Validate updated configuration
      const validation = this.validatePolicyConfig(updatedConfig);
      if (!validation.valid) {
        return {
          success: false,
          message: `Invalid policy configuration: ${validation.errors.join(', ')}`
        };
      }

      // Store updated configuration
      this.configs.set(configId, updatedConfig);
      await this.savePolicyConfig(updatedConfig);

      // Clear cache
      await this.clearPolicyCache();

      return {
        success: true,
        message: 'Policy configuration updated successfully'
      };

    } catch (error) {
      console.error('Error updating policy configuration:', error);
      return {
        success: false,
        message: 'Failed to update policy configuration'
      };
    }
  }

  /**
   * Get policy recommendations based on current usage patterns
   */
  async getPolicyRecommendations(
    timeRange: { start: Date; end: Date }
  ): Promise<Array<{
    path: string;
    currentPolicy: ReferrerPolicyValue;
    recommendedPolicy: ReferrerPolicyValue;
    reason: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
  }>> {
    try {
      const recommendations: Array<{
        path: string;
        currentPolicy: ReferrerPolicyValue;
        recommendedPolicy: ReferrerPolicyValue;
        reason: string;
        confidence: number;
        impact: 'low' | 'medium' | 'high';
      }> = [];

      // Analyze violation patterns
      const violations = this.violations.filter(v => 
        v.timestamp >= timeRange.start && v.timestamp <= timeRange.end
      );

      // Group violations by path
      const violationsByPath = new Map<string, ReferrerViolation[]>();
      violations.forEach(violation => {
        const path = new URL(violation.request.url).pathname;
        if (!violationsByPath.has(path)) {
          violationsByPath.set(path, []);
        }
        violationsByPath.get(path)!.push(violation);
      });

      // Generate recommendations for paths with violations
      violationsByPath.forEach((pathViolations, path) => {
        const totalViolations = pathViolations.length;
        const criticalViolations = pathViolations.filter(v => v.violation.severity === 'critical').length;
        
        if (totalViolations > 10) {
          const currentPolicy = pathViolations[0]?.referrer.expectedPolicy || 'no-referrer-when-downgrade';
          
          if (criticalViolations > totalViolations * 0.3) {
            recommendations.push({
              path,
              currentPolicy,
              recommendedPolicy: 'strict-origin',
              reason: `High critical violation rate (${criticalViolations}/${totalViolations})`,
              confidence: 90,
              impact: 'high'
            });
          } else if (totalViolations > 50) {
            recommendations.push({
              path,
              currentPolicy,
              recommendedPolicy: 'strict-origin-when-cross-origin',
              reason: `Frequent violations detected (${totalViolations})`,
              confidence: 75,
              impact: 'medium'
            });
          }
        }
      });

      // Analyze sensitive routes
      const sensitiveRoutes = ['/admin', '/api/auth', '/api/payment', '/api/user'];
      sensitiveRoutes.forEach(route => {
        const config = Array.from(this.configs.values()).find(c => 
          c.policy.pathSpecific?.some(p => p.path.includes(route))
        );
        
        if (!config || config.policy.default !== 'no-referrer') {
          recommendations.push({
            path: route,
            currentPolicy: config?.policy.default || 'no-referrer-when-downgrade',
            recommendedPolicy: 'no-referrer',
            reason: 'Sensitive route should not send referrer information',
            confidence: 95,
            impact: 'high'
          });
        }
      });

      return recommendations.sort((a, b) => b.confidence - a.confidence);

    } catch (error) {
      console.error('Error generating policy recommendations:', error);
      return [];
    }
  }

  /**
   * Get comprehensive referrer policy statistics
   */
  async getStatistics(
    timeRange: { start: Date; end: Date },
    filters?: {
      configIds?: string[];
      paths?: string[];
      policies?: ReferrerPolicyValue[];
      severities?: string[];
    }
  ): Promise<ReferrerPolicyStatistics> {
    try {
      // Filter violations by time range and filters
      let filteredViolations = this.violations.filter(v => 
        v.timestamp >= timeRange.start && v.timestamp <= timeRange.end
      );

      if (filters) {
        if (filters.configIds) {
          filteredViolations = filteredViolations.filter(v => 
            filters.configIds!.includes(v.metadata.configId)
          );
        }
        if (filters.paths) {
          filteredViolations = filteredViolations.filter(v => 
            filters.paths!.some(path => v.request.url.includes(path))
          );
        }
        if (filters.policies) {
          filteredViolations = filteredViolations.filter(v => 
            filters.policies!.includes(v.referrer.expectedPolicy)
          );
        }
        if (filters.severities) {
          filteredViolations = filteredViolations.filter(v => 
            filters.severities!.includes(v.violation.severity)
          );
        }
      }

      // Calculate statistics
      const totalRequests = this.statistics.get('total_requests') || 0;
      const policyApplied = this.statistics.get('policies_applied') || 0;
      const averageResponseTime = this.statistics.get('avg_response_time') || 0;

      const statistics: ReferrerPolicyStatistics = {
        timeRange,
        overview: {
          totalRequests,
          policyApplied,
          violationsDetected: filteredViolations.length,
          blockedRequests: filteredViolations.filter(v => v.violation.blocked).length,
          averageResponseTime
        },
        policies: {
          byValue: this.groupByProperty(filteredViolations, v => v.referrer.expectedPolicy),
          byPath: this.calculatePolicyByPath(filteredViolations),
          byDomain: this.calculatePolicyByDomain(filteredViolations),
          effectiveness: this.calculatePolicyEffectiveness(filteredViolations)
        },
        violations: {
          byType: this.groupByProperty(filteredViolations, v => v.violation.type),
          bySeverity: this.groupByProperty(filteredViolations, v => v.violation.severity),
          byOrigin: this.groupByProperty(filteredViolations, v => v.referrer.origin),
          trends: this.calculateViolationTrends(filteredViolations)
        },
        compliance: {
          policyCompliance: this.calculatePolicyCompliance(filteredViolations),
          securityScore: this.calculateSecurityScore(filteredViolations),
          privacyScore: this.calculatePrivacyScore(filteredViolations),
          recommendedPolicies: await this.getPolicyRecommendations(timeRange)
        }
      };

      return statistics;

    } catch (error) {
      console.error('Error generating referrer policy statistics:', error);
      throw new Error('Failed to generate statistics');
    }
  }

  // Private helper methods

  private async getPolicyForRequest(request: FastifyRequest): Promise<ReferrerPolicyConfig | null> {
    try {
      const cacheKey = `referrer_policy:${request.url}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Find matching policy configuration
      const configs = Array.from(this.configs.values())
        .filter(c => c.enabled)
        .sort((a, b) => b.priority - a.priority);

      for (const config of configs) {
        if (this.matchesScope(request, config)) {
          await this.redis.setex(cacheKey, this.config.cacheTimeout, JSON.stringify(config));
          return config;
        }
      }

      return null;

    } catch (error) {
      console.error('Error getting policy for request:', error);
      return null;
    }
  }

  private determinePolicyValue(
    request: FastifyRequest, 
    config: ReferrerPolicyConfig | null
  ): ReferrerPolicyValue {
    if (!config) {
      return this.config.defaultPolicy;
    }

    // Check path-specific policies
    if (config.policy.pathSpecific) {
      for (const pathPolicy of config.policy.pathSpecific) {
        if (this.matchesPath(request.url, pathPolicy.path, pathPolicy.exactMatch)) {
          if (!pathPolicy.method || this.matchesMethod(request.method, pathPolicy.method)) {
            return pathPolicy.policy;
          }
        }
      }
    }

    // Check domain-specific policies
    if (config.policy.domainSpecific) {
      const host = request.headers.host;
      if (host) {
        for (const domainPolicy of config.policy.domainSpecific) {
          if (this.matchesDomain(host, domainPolicy.domain, domainPolicy.includeSubdomains)) {
            return domainPolicy.policy;
          }
        }
      }
    }

    return config.policy.default;
  }

  private async validateReferrer(
    request: FastifyRequest,
    referrerHeader: string,
    expectedPolicy: ReferrerPolicyValue
  ): Promise<{
    valid: boolean;
    shouldBlock: boolean;
    reason?: string;
  }> {
    try {
      const referrerUrl = new URL(referrerHeader);
      const requestUrl = new URL(request.url, `http://${request.headers.host}`);

      // Check if referrer is from blocked origin
      const config = await this.getPolicyForRequest(request);
      if (config?.security.blockedOrigins?.includes(referrerUrl.origin)) {
        return {
          valid: false,
          shouldBlock: true,
          reason: 'Referrer from blocked origin'
        };
      }

      // Check if referrer violates expected policy
      const violatesPolicy = this.checkPolicyViolation(referrerUrl, requestUrl, expectedPolicy);
      if (violatesPolicy) {
        return {
          valid: false,
          shouldBlock: config?.security.strictMode || false,
          reason: 'Referrer violates expected policy'
        };
      }

      return { valid: true, shouldBlock: false };

    } catch (error) {
      return {
        valid: false,
        shouldBlock: true,
        reason: 'Invalid referrer URL format'
      };
    }
  }

  private checkPolicyViolation(
    referrerUrl: URL,
    requestUrl: URL,
    policy: ReferrerPolicyValue
  ): boolean {
    switch (policy) {
    case 'no-referrer':
      return true; // Any referrer violates no-referrer policy
      
    case 'origin':
      return referrerUrl.pathname !== '/' || referrerUrl.search !== '';
      
    case 'same-origin':
      return referrerUrl.origin !== requestUrl.origin;
      
    case 'strict-origin':
      return referrerUrl.protocol === 'https:' && requestUrl.protocol === 'http:';
      
    case 'strict-origin-when-cross-origin':
      if (referrerUrl.origin !== requestUrl.origin) {
        return referrerUrl.protocol === 'https:' && requestUrl.protocol === 'http:';
      }
      return false;
      
    default:
      return false;
    }
  }

  private matchesScope(request: FastifyRequest, config: ReferrerPolicyConfig): boolean {
    if (!config.scope.global) {
      // Check environment
      if (config.scope.environments && !config.scope.environments.includes(process.env.NODE_ENV || 'development')) {
        return false;
      }
      
      // Check route types
      const url = request.url;
      if (config.scope.sensitiveRoutes && !config.scope.sensitiveRoutes.some(route => url.includes(route))) {
        return false;
      }
      if (config.scope.apiRoutes && !url.startsWith('/api/')) {
        return false;
      }
      if (config.scope.adminRoutes && !url.startsWith('/admin/')) {
        return false;
      }
    }

    return true;
  }

  private matchesPath(requestUrl: string, pattern: string, exactMatch: boolean): boolean {
    if (exactMatch) {
      return requestUrl === pattern;
    }
    return requestUrl.includes(pattern);
  }

  private matchesMethod(requestMethod: string, allowedMethods: string | string[]): boolean {
    const methods = Array.isArray(allowedMethods) ? allowedMethods : [allowedMethods];
    return methods.includes(requestMethod.toUpperCase());
  }

  private matchesDomain(host: string, pattern: string, includeSubdomains: boolean): boolean {
    if (includeSubdomains) {
      return host === pattern || host.endsWith(`.${pattern}`);
    }
    return host === pattern;
  }

  private validatePolicyConfig(config: Partial<ReferrerPolicyConfig>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.name) {
      errors.push('Name is required');
    }

    if (!config.policy?.default) {
      errors.push('Default policy is required');
    }

    const validPolicies: ReferrerPolicyValue[] = [
      'no-referrer', 'no-referrer-when-downgrade', 'origin',
      'origin-when-cross-origin', 'same-origin', 'strict-origin',
      'strict-origin-when-cross-origin', 'unsafe-url'
    ];

    if (config.policy?.default && !validPolicies.includes(config.policy.default)) {
      errors.push('Invalid default policy value');
    }

    if (config.policy?.pathSpecific) {
      config.policy.pathSpecific.forEach((pathPolicy, index) => {
        if (!pathPolicy.path) {
          errors.push(`Path-specific policy ${index}: path is required`);
        }
        if (!validPolicies.includes(pathPolicy.policy)) {
          errors.push(`Path-specific policy ${index}: invalid policy value`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async logViolation(
    request: FastifyRequest,
    referrerHeader: string,
    expectedPolicy: ReferrerPolicyValue,
    validation: { valid: boolean; shouldBlock: boolean; reason?: string }
  ): Promise<void> {
    try {
      const violation: ReferrerViolation = {
        id: this.generateViolationId(),
        timestamp: new Date(),
        request: {
          url: request.url,
          method: request.method,
          userAgent: (request.headers['user-agent'] as string) || 'unknown',
          ip: request.ip,
          userId: (request as any).user?.id
        },
        referrer: {
          header: referrerHeader,
          expectedPolicy,
          origin: new URL(referrerHeader).origin,
          isSecure: referrerHeader.startsWith('https:')
        },
        violation: {
          type: this.determineViolationType(validation.reason),
          severity: this.determineSeverity(validation.reason),
          description: validation.reason || 'Unknown violation',
          blocked: validation.shouldBlock,
          action: validation.shouldBlock ? 'block' : 'warn'
        },
        response: {
          status: validation.shouldBlock ? 403 : 200,
          headers: {},
          redirected: false
        },
        metadata: {
          configId: 'default',
          environment: process.env.NODE_ENV || 'development',
          tags: ['security', 'referrer-policy']
        }
      };

      this.violations.push(violation);

      // Trim violation history if needed
      if (this.violations.length > this.config.maxViolationHistory) {
        this.violations = this.violations.slice(-this.config.maxViolationHistory);
      }

    } catch (error) {
      console.error('Error logging referrer policy violation:', error);
    }
  }

  private async updateStatistics(policy: ReferrerPolicyValue, responseTime: number): Promise<void> {
    this.statistics.set('total_requests', (this.statistics.get('total_requests') || 0) + 1);
    this.statistics.set('policies_applied', (this.statistics.get('policies_applied') || 0) + 1);
    
    const avgResponseTime = this.statistics.get('avg_response_time') || 0;
    const totalRequests = this.statistics.get('total_requests') || 1;
    this.statistics.set('avg_response_time', (avgResponseTime * (totalRequests - 1) + responseTime) / totalRequests);
    
    this.statistics.set(`policy_${policy}`, (this.statistics.get(`policy_${policy}`) || 0) + 1);
  }

  private async logPolicyApplication(
    request: FastifyRequest,
    policy: ReferrerPolicyValue,
    config: ReferrerPolicyConfig
  ): Promise<void> {
    if (Math.random() * 100 < config.reporting.sampleRate) {
      console.log('Referrer policy applied:', {
        url: request.url,
        method: request.method,
        policy,
        configId: config.id,
        timestamp: new Date()
      });
    }
  }

  private async savePolicyConfig(config: ReferrerPolicyConfig): Promise<void> {
    await this.redis.setex(
      `referrer_policy_config:${config.id}`,
      86400,
      JSON.stringify(config)
    );
  }

  private async clearPolicyCache(): Promise<void> {
    // Note: RedisService might not have a keys method, implement cache clearing differently
    try {
      // For now, implement a simpler cache clearing approach
      await this.redis.del('referrer_policy_cache');
    } catch (error) {
      console.warn('Could not clear policy cache:', error);
    }
  }

  private initializeDefaultConfigs(): void {
    const defaultConfig: ReferrerPolicyConfig = {
      id: 'default-referrer-policy',
      name: 'Default Referrer Policy',
      description: 'Default referrer policy configuration for all requests',
      enabled: true,
      priority: 1,
      version: 1,
      policy: {
        default: 'strict-origin-when-cross-origin',
        pathSpecific: [
          {
            path: '/admin',
            policy: 'no-referrer',
            exactMatch: false
          },
          {
            path: '/api/auth',
            policy: 'no-referrer',
            exactMatch: false
          },
          {
            path: '/api/payment',
            policy: 'no-referrer',
            exactMatch: false
          }
        ]
      },
      scope: {
        global: true
      },
      security: {
        strictMode: true,
        preventDowngrade: true,
        logViolations: true,
        blockUnsafeReferrers: true,
        allowedOrigins: ['https://localhost:3000'],
        blockedOrigins: []
      },
      reporting: {
        enabled: true,
        reportOnlyMode: false,
        sampleRate: 10,
        includeUserAgent: true
      },
      metadata: {
        createdBy: 'system',
        createdAt: new Date(),
        tags: ['default', 'security', 'privacy']
      }
    };

    this.configs.set(defaultConfig.id, defaultConfig);
  }

  private determineViolationType(reason?: string): ReferrerViolation['violation']['type'] {
    if (!reason) return 'policy_violation';
    if (reason.includes('blocked origin')) return 'blocked_origin';
    if (reason.includes('downgrade')) return 'policy_downgrade';
    if (reason.includes('unsafe')) return 'unsafe_referrer';
    return 'policy_violation';
  }

  private determineSeverity(reason?: string): ReferrerViolation['violation']['severity'] {
    if (!reason) return 'medium';
    if (reason.includes('critical') || reason.includes('blocked')) return 'high';
    if (reason.includes('unsafe') || reason.includes('downgrade')) return 'medium';
    return 'low';
  }

  private groupByProperty<T>(items: T[], getProperty: (item: T) => string): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = getProperty(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculatePolicyByPath(violations: ReferrerViolation[]): Record<string, { policy: ReferrerPolicyValue; count: number }> {
    const pathPolicies: Record<string, { policy: ReferrerPolicyValue; count: number }> = {};
    
    violations.forEach(violation => {
      const path = new URL(violation.request.url).pathname;
      if (!pathPolicies[path]) {
        pathPolicies[path] = {
          policy: violation.referrer.expectedPolicy,
          count: 0
        };
      }
      pathPolicies[path].count++;
    });

    return pathPolicies;
  }

  private calculatePolicyByDomain(violations: ReferrerViolation[]): Record<string, { policy: ReferrerPolicyValue; count: number }> {
    const domainPolicies: Record<string, { policy: ReferrerPolicyValue; count: number }> = {};
    
    violations.forEach(violation => {
      const domain = violation.referrer.origin;
      if (!domainPolicies[domain]) {
        domainPolicies[domain] = {
          policy: violation.referrer.expectedPolicy,
          count: 0
        };
      }
      domainPolicies[domain].count++;
    });

    return domainPolicies;
  }

  private calculatePolicyEffectiveness(violations: ReferrerViolation[]): Record<ReferrerPolicyValue, { applied: number; violations: number }> {
    const effectiveness: Record<string, { applied: number; violations: number }> = {};
    
    violations.forEach(violation => {
      const policy = violation.referrer.expectedPolicy;
      if (!effectiveness[policy]) {
        effectiveness[policy] = { applied: 0, violations: 0 };
      }
      effectiveness[policy].violations++;
    });

    // Add applied counts from statistics
    this.statistics.forEach((count, key) => {
      if (key.startsWith('policy_')) {
        const policy = key.replace('policy_', '') as ReferrerPolicyValue;
        if (!effectiveness[policy]) {
          effectiveness[policy] = { applied: 0, violations: 0 };
        }
        effectiveness[policy].applied = count;
      }
    });

    return effectiveness as Record<ReferrerPolicyValue, { applied: number; violations: number }>;
  }

  private calculateViolationTrends(violations: ReferrerViolation[]): Array<{ hour: number; violations: number; blocked: number }> {
    const trends = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      violations: 0,
      blocked: 0
    }));

    violations.forEach(violation => {
      const hour = violation.timestamp.getHours();
      trends[hour].violations++;
      if (violation.violation.blocked) {
        trends[hour].blocked++;
      }
    });

    return trends;
  }

  private calculatePolicyCompliance(violations: ReferrerViolation[]): number {
    const totalRequests = this.statistics.get('total_requests') || 1;
    const violationRate = violations.length / totalRequests;
    return Math.max(0, Math.round((1 - violationRate) * 100));
  }

  private calculateSecurityScore(violations: ReferrerViolation[]): number {
    const securityViolations = violations.filter(v => 
      v.violation.severity === 'high' || v.violation.severity === 'critical'
    ).length;
    
    const totalRequests = this.statistics.get('total_requests') || 1;
    const securityViolationRate = securityViolations / totalRequests;
    return Math.max(0, Math.round((1 - securityViolationRate * 2) * 100));
  }

  private calculatePrivacyScore(violations: ReferrerViolation[]): number {
    const privacyViolations = violations.filter(v => 
      v.violation.type === 'unsafe_referrer' || v.referrer.expectedPolicy === 'unsafe-url'
    ).length;
    
    const totalRequests = this.statistics.get('total_requests') || 1;
    const privacyViolationRate = privacyViolations / totalRequests;
    return Math.max(0, Math.round((1 - privacyViolationRate * 1.5) * 100));
  }

  private generateConfigId(): string {
    return `RPC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateViolationId(): string {
    return `RPV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  destroy(): void {
    this.configs.clear();
    this.violations = [];
    this.statistics.clear();
  }
}
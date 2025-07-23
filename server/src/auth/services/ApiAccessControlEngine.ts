/**
 * API Access Control Engine - Epic 17 Implementation
 * Task: E17-1753114397036-8353CB - Create access control engine
 * 
 * Specialized access control engine for API Management System that integrates with
 * the ApiPermissionAssignmentService to provide fast, cached access control decisions
 * for API endpoints, rate limiting, usage control, and administrative operations.
 */

import { ApiPermissionAssignmentService, PermissionCheck, PermissionCheckResult } from './ApiPermissionAssignmentService';
import { RBACService } from './RBACService';
import { AuditService } from './AuditService';
import { EventEmitter } from 'events';

// =============================================================================
// API Access Control Types
// =============================================================================

export interface ApiAccessRequest {
  requestId: string;
  userId: string;
  apiKeyId?: string;
  endpoint: string;
  method: string;
  operation: string;
  resource: string;
  
  // Context
  ip: string;
  userAgent?: string;
  timestamp: Date;
  
  // API-specific context
  rateLimitBucket?: string;
  usageQuota?: {
    current: number;
    limit: number;
    period: string;
  };
  
  // Security context
  riskScore?: number;
  deviceFingerprint?: string;
  geoLocation?: string;
  
  // Request metadata
  headers: Record<string, string>;
  queryParams: Record<string, any>;
  body?: any;
  
  // Tenant/Organization context
  organizationId?: string;
  teamId?: string;
  
  // Custom attributes for extensibility
  customAttributes?: Record<string, any>;
}

export interface ApiAccessDecision {
  requestId: string;
  allowed: boolean;
  reason: string;
  
  // Decision metadata
  decisionTime: number; // milliseconds
  cached: boolean;
  evaluatedPolicies: string[];
  matchedPermissions: string[];
  
  // Rate limiting decisions
  rateLimitDecision?: {
    allowed: boolean;
    remainingRequests: number;
    resetTime: Date;
    bucketName: string;
  };
  
  // Usage control decisions
  usageControlDecision?: {
    allowed: boolean;
    remainingQuota: number;
    quotaPeriod: string;
    quotaResetTime: Date;
  };
  
  // Security recommendations
  securityFlags?: string[];
  riskAssessment?: {
    score: number;
    factors: string[];
    recommendations: string[];
  };
  
  // Conditional access requirements
  additionalRequirements?: {
    mfaRequired?: boolean;
    approvalRequired?: boolean;
    additionalScopes?: string[];
  };
  
  // Audit and compliance
  auditRequired: boolean;
  complianceFlags: string[];
}

export interface ApiAccessPolicy {
  policyId: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number; // Higher number = higher priority
  
  // Policy scope
  scope: {
    endpoints?: string[]; // Glob patterns
    methods?: string[];
    operations?: string[];
    resources?: string[];
    userGroups?: string[];
    organizations?: string[];
  };
  
  // Policy conditions
  conditions: ApiPolicyCondition[];
  
  // Policy actions
  actions: ApiPolicyAction[];
  
  // Policy metadata
  metadata: {
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
    version: number;
    tags: string[];
  };
}

export interface ApiPolicyCondition {
  type: 'user' | 'role' | 'permission' | 'time' | 'location' | 'rate_limit' | 'usage_quota' | 'risk_score' | 'device' | 'custom';
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'regex' | 'exists' | 'between';
  value: any;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
}

export interface ApiPolicyAction {
  type: 'allow' | 'deny' | 'rate_limit' | 'usage_control' | 'require_mfa' | 'require_approval' | 'log' | 'alert' | 'transform' | 'redirect';
  parameters: Record<string, any>;
}

export interface ApiAccessEngineConfig {
  // Core settings
  enabled: boolean;
  defaultDeny: boolean;
  
  // Performance settings
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
  maxCacheEntries: number;
  decisionTimeout: number; // milliseconds
  
  // Rate limiting integration
  rateLimitingEnabled: boolean;
  globalRateLimit: number; // requests per minute
  
  // Usage control integration
  usageControlEnabled: boolean;
  
  // Security features
  riskAssessmentEnabled: boolean;
  anomalyDetectionEnabled: boolean;
  
  // Audit settings
  auditAllDecisions: boolean;
  auditDeniedOnly: boolean;
  auditHighRiskOnly: boolean;
  
  // Policy evaluation
  maxPolicyEvaluationTime: number; // milliseconds
  policyEvaluationMode: 'fail_open' | 'fail_closed';
  
  // Integration settings
  permissionServiceEnabled: boolean;
  rbacIntegrationEnabled: boolean;
  externalPolicyProvidersEnabled: boolean;
}

// =============================================================================
// API Access Control Engine Implementation
// =============================================================================

export class ApiAccessControlEngine extends EventEmitter {
  private config: ApiAccessEngineConfig;
  private policies: Map<string, ApiAccessPolicy> = new Map();
  private decisionCache: Map<string, { decision: ApiAccessDecision; expiry: Date }> = new Map();
  private rateLimitBuckets: Map<string, { count: number; resetTime: Date }> = new Map();

  constructor(
    private permissionService: ApiPermissionAssignmentService,
    private rbacService: RBACService,
    private auditService: AuditService,
    config: Partial<ApiAccessEngineConfig> = {}
  ) {
    super();
    
    this.config = {
      enabled: true,
      defaultDeny: false,
      cacheEnabled: true,
      cacheTTL: 300, // 5 minutes
      maxCacheEntries: 10000,
      decisionTimeout: 1000, // 1 second
      rateLimitingEnabled: true,
      globalRateLimit: 1000,
      usageControlEnabled: true,
      riskAssessmentEnabled: true,
      anomalyDetectionEnabled: false,
      auditAllDecisions: false,
      auditDeniedOnly: true,
      auditHighRiskOnly: true,
      maxPolicyEvaluationTime: 500,
      policyEvaluationMode: 'fail_closed',
      permissionServiceEnabled: true,
      rbacIntegrationEnabled: true,
      externalPolicyProvidersEnabled: false,
      ...config
    };

    this.initializeEngine();
  }

  /**
   * Main access control decision method
   */
  async checkAccess(request: ApiAccessRequest): Promise<ApiAccessDecision> {
    const startTime = Date.now();
    
    if (!this.config.enabled) {
      return this.createAllowDecision(request.requestId, 'Access control disabled', startTime);
    }

    try {
      // Check cache first
      if (this.config.cacheEnabled) {
        const cached = this.getCachedDecision(request);
        if (cached) {
          return { ...cached, cached: true, decisionTime: Date.now() - startTime };
        }
      }

      // Execute access control evaluation pipeline
      const decision = await this.evaluateAccessRequest(request, startTime);
      
      // Cache the decision
      if (this.config.cacheEnabled && decision.allowed) {
        this.cacheDecision(request, decision);
      }
      
      // Emit events for monitoring
      this.emit('access_decision', { request, decision });
      
      // Audit if required
      if (this.shouldAuditDecision(decision)) {
        await this.auditAccessDecision(request, decision);
      }
      
      return decision;
      
    } catch (error) {
      const errorDecision = this.createErrorDecision(request.requestId, error as Error, startTime);
      
      // Always audit errors
      await this.auditAccessDecision(request, errorDecision);
      
      return errorDecision;
    }
  }

  /**
   * Core access evaluation pipeline
   */
  private async evaluateAccessRequest(request: ApiAccessRequest, startTime: number): Promise<ApiAccessDecision> {
    const decisionBuilder = new AccessDecisionBuilder(request.requestId, startTime);
    
    // 1. Permission-based access control
    if (this.config.permissionServiceEnabled) {
      const permissionResult = await this.evaluatePermissions(request);
      decisionBuilder.addPermissionResult(permissionResult);
      
      if (!permissionResult.allowed) {
        return decisionBuilder.buildDenyDecision(`Permission denied: ${permissionResult.reason}`);
      }
    }
    
    // 2. Policy-based access control
    const policyResults = await this.evaluatePolicies(request);
    decisionBuilder.addPolicyResults(policyResults);
    
    // Check if any policy explicitly denies access
    const denyPolicies = policyResults.filter(p => p.decision === 'deny');
    if (denyPolicies.length > 0) {
      return decisionBuilder.buildDenyDecision(`Policy denied: ${denyPolicies[0].reason}`);
    }
    
    // 3. Rate limiting evaluation
    if (this.config.rateLimitingEnabled) {
      const rateLimitResult = await this.evaluateRateLimit(request);
      decisionBuilder.addRateLimitResult(rateLimitResult);
      
      if (!rateLimitResult.allowed) {
        return decisionBuilder.buildDenyDecision(`Rate limit exceeded: ${rateLimitResult.bucketName}`);
      }
    }
    
    // 4. Usage control evaluation
    if (this.config.usageControlEnabled && request.usageQuota) {
      const usageResult = await this.evaluateUsageControl(request);
      decisionBuilder.addUsageControlResult(usageResult);
      
      if (!usageResult.allowed) {
        return decisionBuilder.buildDenyDecision('Usage quota exceeded');
      }
    }
    
    // 5. Risk assessment
    if (this.config.riskAssessmentEnabled) {
      const riskResult = await this.evaluateRiskScore(request);
      decisionBuilder.addRiskAssessment(riskResult);
      
      if (riskResult.score > 80) { // High risk threshold
        return decisionBuilder.buildDenyDecision(`High risk score: ${riskResult.score}`);
      }
    }
    
    // If we get here, access is allowed
    return decisionBuilder.buildAllowDecision('Access granted');
  }

  /**
   * Evaluate permissions using the permission assignment service
   */
  private async evaluatePermissions(request: ApiAccessRequest): Promise<PermissionCheckResult> {
    const permissionCheck: PermissionCheck = {
      userId: request.userId,
      type: this.mapEndpointToPermissionType(request.endpoint),
      action: this.mapOperationToPermissionAction(request.operation),
      resource: request.resource,
      context: {
        organizationId: request.organizationId,
        apiKeyId: request.apiKeyId,
        resourceId: request.resource,
        metadata: {
          endpoint: request.endpoint,
          method: request.method,
          ip: request.ip,
          userAgent: request.userAgent
        }
      }
    };
    
    return await this.permissionService.checkPermission(permissionCheck);
  }

  /**
   * Evaluate all applicable policies
   */
  private async evaluatePolicies(request: ApiAccessRequest): Promise<PolicyEvaluationResult[]> {
    const applicablePolicies = this.findApplicablePolicies(request);
    const results: PolicyEvaluationResult[] = [];
    
    // Sort policies by priority (highest first)
    const sortedPolicies = applicablePolicies.sort((a, b) => b.priority - a.priority);
    
    for (const policy of sortedPolicies) {
      const result = await this.evaluatePolicy(policy, request);
      results.push(result);
      
      // If this is a deny policy and it matches, we can short-circuit
      if (result.decision === 'deny' && result.conditionsMet) {
        break;
      }
    }
    
    return results;
  }

  /**
   * Evaluate rate limits
   */
  private async evaluateRateLimit(request: ApiAccessRequest): Promise<RateLimitResult> {
    const bucketName = request.rateLimitBucket || `${request.userId}:${request.endpoint}`;
    const bucket = this.rateLimitBuckets.get(bucketName) || { count: 0, resetTime: new Date(Date.now() + 60000) };
    
    // Reset bucket if time has passed
    if (new Date() > bucket.resetTime) {
      bucket.count = 0;
      bucket.resetTime = new Date(Date.now() + 60000); // 1 minute window
    }
    
    const allowed = bucket.count < this.config.globalRateLimit;
    
    if (allowed) {
      bucket.count++;
      this.rateLimitBuckets.set(bucketName, bucket);
    }
    
    return {
      allowed,
      remainingRequests: Math.max(0, this.config.globalRateLimit - bucket.count),
      resetTime: bucket.resetTime,
      bucketName
    };
  }

  /**
   * Evaluate usage quotas
   */
  private async evaluateUsageControl(request: ApiAccessRequest): Promise<UsageControlResult> {
    if (!request.usageQuota) {
      return { allowed: true, remainingQuota: -1, quotaPeriod: 'none', quotaResetTime: new Date() };
    }
    
    const allowed = request.usageQuota.current < request.usageQuota.limit;
    
    return {
      allowed,
      remainingQuota: Math.max(0, request.usageQuota.limit - request.usageQuota.current),
      quotaPeriod: request.usageQuota.period,
      quotaResetTime: new Date(Date.now() + 86400000) // Next day
    };
  }

  /**
   * Evaluate risk score
   */
  private async evaluateRiskScore(request: ApiAccessRequest): Promise<RiskAssessmentResult> {
    let score = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];
    
    // Basic risk factors
    if (request.riskScore) {
      score += request.riskScore;
      factors.push('provided_risk_score');
    }
    
    // IP-based risk
    if (this.isHighRiskIP(request.ip)) {
      score += 30;
      factors.push('high_risk_ip');
      recommendations.push('Consider requiring MFA for this IP');
    }
    
    // Time-based risk (outside business hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      score += 10;
      factors.push('off_hours_access');
    }
    
    // Device risk
    if (!request.deviceFingerprint) {
      score += 15;
      factors.push('unknown_device');
      recommendations.push('Device fingerprinting recommended');
    }
    
    return { score, factors, recommendations };
  }

  // =============================================================================
  // Helper Methods
  // =============================================================================

  private initializeEngine(): void {
    this.loadSystemPolicies();
    this.startCacheCleanup();
    
    console.log('✅ API Access Control Engine initialized');
  }

  private loadSystemPolicies(): void {
    // Load default system policies
    const defaultPolicies: Omit<ApiAccessPolicy, 'policyId' | 'metadata'>[] = [
      {
        name: 'Global Admin Access',
        description: 'Allow global administrators full access',
        enabled: true,
        priority: 100,
        scope: { endpoints: ['*'] },
        conditions: [
          { type: 'role', field: 'name', operator: 'eq', value: 'global_admin' }
        ],
        actions: [
          { type: 'allow', parameters: {} }
        ]
      },
      {
        name: 'Block High Risk IPs',
        description: 'Block access from known high-risk IP addresses',
        enabled: true,
        priority: 90,
        scope: { endpoints: ['*'] },
        conditions: [
          { type: 'custom', field: 'high_risk_ip', operator: 'eq', value: true }
        ],
        actions: [
          { type: 'deny', parameters: { reason: 'High risk IP address' } }
        ]
      }
    ];
    
    for (const policyData of defaultPolicies) {
      const policy: ApiAccessPolicy = {
        ...policyData,
        policyId: `sys_policy_${policyData.name.toLowerCase().replace(/\s+/g, '_')}`,
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date(),
          version: 1,
          tags: ['system', 'built-in']
        }
      };
      
      this.policies.set(policy.policyId, policy);
    }
  }

  private getCachedDecision(request: ApiAccessRequest): ApiAccessDecision | null {
    const cacheKey = this.generateCacheKey(request);
    const cached = this.decisionCache.get(cacheKey);
    
    if (cached && cached.expiry > new Date()) {
      return cached.decision;
    }
    
    if (cached) {
      this.decisionCache.delete(cacheKey);
    }
    
    return null;
  }

  private cacheDecision(request: ApiAccessRequest, decision: ApiAccessDecision): void {
    const cacheKey = this.generateCacheKey(request);
    const expiry = new Date(Date.now() + this.config.cacheTTL * 1000);
    
    this.decisionCache.set(cacheKey, { decision, expiry });
    
    // Clean up cache if too large
    if (this.decisionCache.size > this.config.maxCacheEntries) {
      const oldestKey = this.decisionCache.keys().next().value;
      this.decisionCache.delete(oldestKey);
    }
  }

  private generateCacheKey(request: ApiAccessRequest): string {
    return `${request.userId}:${request.endpoint}:${request.method}:${request.operation}`;
  }

  private findApplicablePolicies(request: ApiAccessRequest): ApiAccessPolicy[] {
    const applicable: ApiAccessPolicy[] = [];
    
    for (const policy of this.policies.values()) {
      if (!policy.enabled) continue;
      
      if (this.policyAppliesToRequest(policy, request)) {
        applicable.push(policy);
      }
    }
    
    return applicable;
  }

  private policyAppliesToRequest(policy: ApiAccessPolicy, request: ApiAccessRequest): boolean {
    const scope = policy.scope;
    
    // Check endpoint patterns
    if (scope.endpoints && !this.matchesPatterns(request.endpoint, scope.endpoints)) {
      return false;
    }
    
    // Check methods
    if (scope.methods && !scope.methods.includes(request.method)) {
      return false;
    }
    
    // Check operations
    if (scope.operations && !scope.operations.includes(request.operation)) {
      return false;
    }
    
    return true;
  }

  private async evaluatePolicy(policy: ApiAccessPolicy, request: ApiAccessRequest): Promise<PolicyEvaluationResult> {
    const conditionsMet = await this.evaluateConditions(policy.conditions, request);
    let decision: 'allow' | 'deny' | 'conditional' = 'conditional';
    
    if (conditionsMet) {
      const allowActions = policy.actions.filter(a => a.type === 'allow');
      const denyActions = policy.actions.filter(a => a.type === 'deny');
      
      if (denyActions.length > 0) {
        decision = 'deny';
      } else if (allowActions.length > 0) {
        decision = 'allow';
      }
    }
    
    return {
      policyId: policy.policyId,
      policyName: policy.name,
      decision,
      conditionsMet,
      reason: conditionsMet ? 'Policy conditions met' : 'Policy conditions not met'
    };
  }

  private async evaluateConditions(conditions: ApiPolicyCondition[], request: ApiAccessRequest): Promise<boolean> {
    if (!conditions || conditions.length === 0) return true;
    
    // Simple condition evaluation - in production this would be more sophisticated
    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, request);
      if (!result) return false;
    }
    
    return true;
  }

  private async evaluateCondition(condition: ApiPolicyCondition, request: ApiAccessRequest): Promise<boolean> {
    // Placeholder condition evaluation - would be expanded for each condition type
    switch (condition.type) {
    case 'user':
      return request.userId === condition.value;
    case 'time':
      return this.evaluateTimeCondition(condition);
    case 'custom':
      return this.evaluateCustomCondition(condition, request);
    default:
      return true;
    }
  }

  private evaluateTimeCondition(condition: ApiPolicyCondition): boolean {
    const now = new Date();
    const hour = now.getHours();
    
    if (condition.field === 'business_hours') {
      return hour >= 9 && hour <= 17;
    }
    
    return true;
  }

  private evaluateCustomCondition(condition: ApiPolicyCondition, request: ApiAccessRequest): boolean {
    if (condition.field === 'high_risk_ip') {
      return this.isHighRiskIP(request.ip);
    }
    
    return false;
  }

  private isHighRiskIP(ip: string): boolean {
    // Placeholder high-risk IP detection
    const highRiskRanges = ['192.168.1.', '10.0.0.'];
    return highRiskRanges.some(range => ip.startsWith(range));
  }

  private matchesPatterns(value: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      if (pattern === '*') return true;
      // Simple glob pattern matching
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(value);
    });
  }

  private mapEndpointToPermissionType(endpoint: string): any {
    // Map API endpoints to permission types
    if (endpoint.includes('/admin/')) return 'admin_override';
    if (endpoint.includes('/keys/')) return 'api_key_management';
    if (endpoint.includes('/usage/')) return 'usage_control';
    if (endpoint.includes('/monitor/')) return 'monitoring';
    return 'endpoint_access';
  }

  private mapOperationToPermissionAction(operation: string): any {
    const actionMap: Record<string, string> = {
      'create': 'create',
      'read': 'read',
      'update': 'update',
      'delete': 'delete',
      'list': 'read',
      'get': 'read',
      'post': 'create',
      'put': 'update',
      'patch': 'update',
      'delete': 'delete'
    };
    
    return actionMap[operation.toLowerCase()] || 'read';
  }

  private createAllowDecision(requestId: string, reason: string, startTime: number): ApiAccessDecision {
    return {
      requestId,
      allowed: true,
      reason,
      decisionTime: Date.now() - startTime,
      cached: false,
      evaluatedPolicies: [],
      matchedPermissions: [],
      auditRequired: false,
      complianceFlags: []
    };
  }

  private createErrorDecision(requestId: string, error: Error, startTime: number): ApiAccessDecision {
    const decision = this.config.policyEvaluationMode === 'fail_open';
    
    return {
      requestId,
      allowed: decision,
      reason: `Access control error: ${error.message}`,
      decisionTime: Date.now() - startTime,
      cached: false,
      evaluatedPolicies: [],
      matchedPermissions: [],
      securityFlags: ['access_control_error'],
      auditRequired: true,
      complianceFlags: ['error_occurred']
    };
  }

  private shouldAuditDecision(decision: ApiAccessDecision): boolean {
    if (this.config.auditAllDecisions) return true;
    if (this.config.auditDeniedOnly && !decision.allowed) return true;
    if (this.config.auditHighRiskOnly && decision.riskAssessment && decision.riskAssessment.score > 60) return true;
    return decision.auditRequired;
  }

  private async auditAccessDecision(request: ApiAccessRequest, decision: ApiAccessDecision): Promise<void> {
    await this.auditService.logAction({
      userId: request.userId,
      action: decision.allowed ? 'api_access_granted' : 'api_access_denied',
      resource: `${request.endpoint}:${request.method}`,
      details: {
        requestId: request.requestId,
        endpoint: request.endpoint,
        operation: request.operation,
        decision: decision.allowed,
        reason: decision.reason,
        decisionTime: decision.decisionTime,
        ip: request.ip,
        userAgent: request.userAgent
      }
    });
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = new Date();
      for (const [key, cached] of this.decisionCache.entries()) {
        if (cached.expiry <= now) {
          this.decisionCache.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  // Public management methods
  async addPolicy(policy: Omit<ApiAccessPolicy, 'policyId' | 'metadata'>): Promise<string> {
    const policyId = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullPolicy: ApiAccessPolicy = {
      ...policy,
      policyId,
      metadata: {
        createdBy: 'admin',
        createdAt: new Date(),
        lastModified: new Date(),
        version: 1,
        tags: []
      }
    };
    
    this.policies.set(policyId, fullPolicy);
    return policyId;
  }

  async removePolicy(policyId: string): Promise<boolean> {
    return this.policies.delete(policyId);
  }

  async clearCache(): Promise<void> {
    this.decisionCache.clear();
  }

  getEngineStats(): any {
    return {
      policiesLoaded: this.policies.size,
      cacheSize: this.decisionCache.size,
      rateLimitBuckets: this.rateLimitBuckets.size,
      config: this.config
    };
  }
}

// =============================================================================
// Helper Classes and Types
// =============================================================================

class AccessDecisionBuilder {
  private decision: Partial<ApiAccessDecision>;
  
  constructor(requestId: string, startTime: number) {
    this.decision = {
      requestId,
      decisionTime: 0,
      cached: false,
      evaluatedPolicies: [],
      matchedPermissions: [],
      auditRequired: false,
      complianceFlags: []
    };
  }
  
  addPermissionResult(result: PermissionCheckResult): void {
    this.decision.matchedPermissions = result.matchingPermissions.map(p => p.permissionId);
  }
  
  addPolicyResults(results: PolicyEvaluationResult[]): void {
    this.decision.evaluatedPolicies = results.map(r => r.policyId);
  }
  
  addRateLimitResult(result: RateLimitResult): void {
    this.decision.rateLimitDecision = result;
  }
  
  addUsageControlResult(result: UsageControlResult): void {
    this.decision.usageControlDecision = result;
  }
  
  addRiskAssessment(result: RiskAssessmentResult): void {
    this.decision.riskAssessment = result;
    if (result.score > 60) {
      this.decision.securityFlags = this.decision.securityFlags || [];
      this.decision.securityFlags.push('high_risk_score');
      this.decision.auditRequired = true;
    }
  }
  
  buildAllowDecision(reason: string): ApiAccessDecision {
    return {
      ...this.decision,
      allowed: true,
      reason,
      decisionTime: Date.now() - (this.decision.decisionTime || 0)
    } as ApiAccessDecision;
  }
  
  buildDenyDecision(reason: string): ApiAccessDecision {
    return {
      ...this.decision,
      allowed: false,
      reason,
      auditRequired: true,
      decisionTime: Date.now() - (this.decision.decisionTime || 0)
    } as ApiAccessDecision;
  }
}

interface PolicyEvaluationResult {
  policyId: string;
  policyName: string;
  decision: 'allow' | 'deny' | 'conditional';
  conditionsMet: boolean;
  reason: string;
}

interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: Date;
  bucketName: string;
}

interface UsageControlResult {
  allowed: boolean;
  remainingQuota: number;
  quotaPeriod: string;
  quotaResetTime: Date;
}

interface RiskAssessmentResult {
  score: number;
  factors: string[];
  recommendations: string[];
}

export default ApiAccessControlEngine;
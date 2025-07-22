/**
 * Admin Security Validation Service - Epic 17
 * 
 * Comprehensive security validation framework specifically designed for admin controls.
 * Provides security validation for administrative operations including privilege validation,
 * input sanitization, session security, and audit trail validation.
 * 
 * Task: E17-1753114397250-47CE63 - Add security validation
 * Epic: 17 - Backstage Admin Controls
 */

import { Pool, PoolClient } from 'pg';
import { Logger } from '@nestjs/common';
import { AccessControlFramework, Permission, Resource, Action, Context } from './AccessControlFramework.js';
import { SecurityScanningService } from './SecurityScanningService.js';
import crypto from 'crypto';
import validator from 'validator';

// =============================================================================
// Security Validation Types
// =============================================================================

export interface SecurityValidationContext {
  userId: string;
  sessionId: string;
  userAgent: string;
  ipAddress: string;
  timestamp: Date;
  operation: AdminOperation;
  resourceType: string;
  resourceId?: string;
  requestData?: any;
  metadata?: Record<string, any>;
}

export interface AdminOperation {
  type: AdminOperationType;
  category: AdminOperationCategory;
  severity: SecuritySeverity;
  description: string;
  requiresMFA?: boolean;
  privilegeLevel: PrivilegeLevel;
  auditLevel: AuditLevel;
}

export type AdminOperationType = 
  | 'feature_toggle'
  | 'user_management' 
  | 'content_moderation'
  | 'system_configuration'
  | 'data_management'
  | 'access_control'
  | 'security_settings'
  | 'audit_operations'
  | 'emergency_actions';

export type AdminOperationCategory = 
  | 'read'
  | 'create'
  | 'update' 
  | 'delete'
  | 'execute'
  | 'configure'
  | 'export'
  | 'import';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical' | 'emergency';
export type PrivilegeLevel = 'standard' | 'elevated' | 'admin' | 'super_admin' | 'system';
export type AuditLevel = 'basic' | 'detailed' | 'comprehensive' | 'forensic';

export interface SecurityValidationResult {
  isValid: boolean;
  securityLevel: SecuritySeverity;
  violations: SecurityViolation[];
  warnings: SecurityWarning[];
  recommendations: string[];
  requiresAdditionalAuth: boolean;
  additionalAuthMethods?: AuthMethod[];
  sessionExtensionRequired: boolean;
  auditingRequired: boolean;
  metadata: Record<string, any>;
}

export interface SecurityViolation {
  violationType: ViolationType;
  severity: SecuritySeverity;
  description: string;
  riskLevel: number; // 1-10
  affectedResource: string;
  detectionTime: Date;
  remediation: RemediationAction[];
  evidence: Record<string, any>;
}

export type ViolationType = 
  | 'privilege_escalation'
  | 'unauthorized_access'
  | 'input_validation_failure'
  | 'session_anomaly'
  | 'rate_limit_exceeded'
  | 'suspicious_pattern'
  | 'data_exfiltration_risk'
  | 'injection_attempt'
  | 'authentication_bypass'
  | 'audit_tampering';

export interface SecurityWarning {
  warningType: string;
  message: string;
  severity: SecuritySeverity;
  recommendations: string[];
}

export interface RemediationAction {
  action: string;
  priority: number;
  automated: boolean;
  description: string;
}

export type AuthMethod = 'mfa_totp' | 'mfa_sms' | 'hardware_key' | 'biometric' | 'admin_approval';

// =============================================================================
// Security Policy Configurations
// =============================================================================

export interface AdminSecurityPolicy {
  id: string;
  name: string;
  operationType: AdminOperationType;
  minPrivilegeLevel: PrivilegeLevel;
  requiresMFA: boolean;
  sessionTimeout: number; // minutes
  maxConcurrentSessions: number;
  ipWhitelist?: string[];
  timeRestrictions?: TimeRestriction[];
  dataValidationRules: ValidationRule[];
  rateLimits: RateLimit[];
  auditRequirements: AuditRequirement[];
  enabled: boolean;
}

export interface TimeRestriction {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  days: number[];    // 0-6 (Sunday-Saturday)
  timezone: string;
}

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'email' | 'url' | 'json' | 'custom';
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  allowedValues?: string[];
  sanitization: SanitizationType[];
  customValidator?: string;
}

export type SanitizationType = 'html_escape' | 'sql_escape' | 'json_escape' | 'trim' | 'lowercase' | 'uppercase';

export interface RateLimit {
  operation: string;
  maxRequests: number;
  timeWindow: number; // minutes
  penalty: 'warn' | 'block' | 'delay';
  penaltyDuration: number; // minutes
}

export interface AuditRequirement {
  level: AuditLevel;
  retention: number; // days
  fields: string[];
  realTimeAlerts: boolean;
  complianceFlags: string[];
}

// =============================================================================
// Main Service Implementation
// =============================================================================

export class AdminSecurityValidationService {
  private db: Pool;
  private logger: Logger;
  private accessControl: AccessControlFramework;
  private securityScanning: SecurityScanningService;
  
  private securityPolicies: Map<string, AdminSecurityPolicy> = new Map();
  private rateLimitCache: Map<string, RateLimitState> = new Map();
  private suspiciousPatterns: Map<string, SuspiciousActivity> = new Map();

  constructor(
    db: Pool,
    logger: Logger,
    accessControl: AccessControlFramework,
    securityScanning: SecurityScanningService
  ) {
    this.db = db;
    this.logger = logger;
    this.accessControl = accessControl;
    this.securityScanning = securityScanning;
  }

  async initialize(): Promise<void> {
    await this.loadSecurityPolicies();
    await this.initializeRateLimiting();
    await this.setupPatternDetection();
    this.logger.log('AdminSecurityValidationService initialized');
  }

  // =============================================================================
  // Core Validation Methods
  // =============================================================================

  async validateAdminOperation(context: SecurityValidationContext): Promise<SecurityValidationResult> {
    this.logger.debug(`Validating admin operation: ${context.operation.type}`, {
      userId: context.userId,
      operation: context.operation.type,
      resourceType: context.resourceType
    });

    const result: SecurityValidationResult = {
      isValid: true,
      securityLevel: context.operation.severity,
      violations: [],
      warnings: [],
      recommendations: [],
      requiresAdditionalAuth: false,
      sessionExtensionRequired: false,
      auditingRequired: true,
      metadata: {}
    };

    try {
      // 1. Validate session and authentication
      const sessionValidation = await this.validateSession(context);
      this.mergeValidationResults(result, sessionValidation);

      // 2. Validate privileges and permissions
      const privilegeValidation = await this.validatePrivileges(context);
      this.mergeValidationResults(result, privilegeValidation);

      // 3. Validate input data
      const inputValidation = await this.validateInputData(context);
      this.mergeValidationResults(result, inputValidation);

      // 4. Check rate limits
      const rateLimitValidation = await this.validateRateLimits(context);
      this.mergeValidationResults(result, rateLimitValidation);

      // 5. Detect suspicious patterns
      const patternValidation = await this.detectSuspiciousPatterns(context);
      this.mergeValidationResults(result, patternValidation);

      // 6. Apply security policies
      const policyValidation = await this.applySecurityPolicies(context);
      this.mergeValidationResults(result, policyValidation);

      // 7. Determine if additional authentication is required
      result.requiresAdditionalAuth = await this.requiresAdditionalAuth(context, result);
      if (result.requiresAdditionalAuth) {
        result.additionalAuthMethods = await this.getRequiredAuthMethods(context);
      }

      // 8. Log security event
      await this.logSecurityEvent(context, result);

      return result;

    } catch (error) {
      this.logger.error('Security validation failed', error, {
        userId: context.userId,
        operation: context.operation.type
      });

      result.isValid = false;
      result.violations.push({
        violationType: 'authentication_bypass',
        severity: 'critical',
        description: 'Security validation system failure',
        riskLevel: 10,
        affectedResource: context.resourceType,
        detectionTime: new Date(),
        remediation: [{
          action: 'Block operation and review security logs',
          priority: 1,
          automated: true,
          description: 'Automatic security system failure protection'
        }],
        evidence: { error: error instanceof Error ? error.message : 'Unknown error' }
      });

      return result;
    }
  }

  // =============================================================================
  // Session Validation
  // =============================================================================

  private async validateSession(context: SecurityValidationContext): Promise<Partial<SecurityValidationResult>> {
    const result: Partial<SecurityValidationResult> = {
      violations: [],
      warnings: [],
      recommendations: []
    };

    try {
      // Check session existence and validity
      const sessionResult = await this.db.query(`
        SELECT 
          s.*,
          u.role,
          u.status as user_status,
          u.last_activity,
          s.created_at,
          s.last_activity as session_last_activity,
          s.ip_address as session_ip,
          s.user_agent as session_user_agent
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = $1 AND s.user_id = $2 AND s.status = 'active'
      `, [context.sessionId, context.userId]);

      if (sessionResult.rows.length === 0) {
        result.violations!.push({
          violationType: 'session_anomaly',
          severity: 'high',
          description: 'Invalid or expired session',
          riskLevel: 8,
          affectedResource: 'session',
          detectionTime: new Date(),
          remediation: [{
            action: 'Force re-authentication',
            priority: 1,
            automated: true,
            description: 'Require fresh authentication for security'
          }],
          evidence: { sessionId: context.sessionId, userId: context.userId }
        });
        return result;
      }

      const session = sessionResult.rows[0];

      // Check session timeout
      const sessionAge = Date.now() - session.session_last_activity.getTime();
      const maxSessionAge = 8 * 60 * 60 * 1000; // 8 hours

      if (sessionAge > maxSessionAge) {
        result.violations!.push({
          violationType: 'session_anomaly',
          severity: 'medium',
          description: 'Session has exceeded maximum age',
          riskLevel: 6,
          affectedResource: 'session',
          detectionTime: new Date(),
          remediation: [{
            action: 'Extend session or require re-authentication',
            priority: 2,
            automated: false,
            description: 'Session timeout protection'
          }],
          evidence: { sessionAge, maxSessionAge }
        });
      }

      // Check IP address consistency
      if (session.session_ip !== context.ipAddress) {
        result.warnings!.push({
          warningType: 'ip_address_change',
          message: 'Session IP address has changed',
          severity: 'medium',
          recommendations: ['Verify user location and device']
        });
      }

      // Check user agent consistency
      if (session.session_user_agent !== context.userAgent) {
        result.warnings!.push({
          warningType: 'user_agent_change',
          message: 'Session user agent has changed',
          severity: 'low',
          recommendations: ['Monitor for session hijacking attempts']
        });
      }

      // Check concurrent sessions
      const concurrentSessionsResult = await this.db.query(`
        SELECT COUNT(*) as session_count 
        FROM user_sessions 
        WHERE user_id = $1 AND status = 'active'
      `, [context.userId]);

      const sessionCount = parseInt(concurrentSessionsResult.rows[0].session_count);
      if (sessionCount > 5) { // Configurable limit
        result.warnings!.push({
          warningType: 'excessive_sessions',
          message: `User has ${sessionCount} concurrent sessions`,
          severity: 'medium',
          recommendations: ['Review session management policies']
        });
      }

      return result;

    } catch (error) {
      this.logger.error('Session validation failed', error);
      result.violations!.push({
        violationType: 'session_anomaly',
        severity: 'high',
        description: 'Session validation system error',
        riskLevel: 7,
        affectedResource: 'session',
        detectionTime: new Date(),
        remediation: [{
          action: 'Block operation pending manual review',
          priority: 1,
          automated: true,
          description: 'Security system protection'
        }],
        evidence: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return result;
    }
  }

  // =============================================================================
  // Privilege Validation
  // =============================================================================

  private async validatePrivileges(context: SecurityValidationContext): Promise<Partial<SecurityValidationResult>> {
    const result: Partial<SecurityValidationResult> = {
      violations: [],
      warnings: [],
      recommendations: []
    };

    try {
      // Check if user has required privilege level
      const userResult = await this.db.query(`
        SELECT 
          u.role,
          u.privilege_level,
          u.permissions,
          u.status,
          u.is_admin,
          u.is_super_admin
        FROM users u
        WHERE u.id = $1
      `, [context.userId]);

      if (userResult.rows.length === 0) {
        result.violations!.push({
          violationType: 'unauthorized_access',
          severity: 'critical',
          description: 'User not found or invalid',
          riskLevel: 10,
          affectedResource: 'user',
          detectionTime: new Date(),
          remediation: [{
            action: 'Block operation immediately',
            priority: 1,
            automated: true,
            description: 'Invalid user protection'
          }],
          evidence: { userId: context.userId }
        });
        return result;
      }

      const user = userResult.rows[0];

      // Check if user is active
      if (user.status !== 'active') {
        result.violations!.push({
          violationType: 'unauthorized_access',
          severity: 'high',
          description: 'User account is not active',
          riskLevel: 9,
          affectedResource: 'user',
          detectionTime: new Date(),
          remediation: [{
            action: 'Block operation and notify security team',
            priority: 1,
            automated: true,
            description: 'Inactive user protection'
          }],
          evidence: { userId: context.userId, userStatus: user.status }
        });
        return result;
      }

      // Validate privilege level
      const requiredLevel = this.getNumericPrivilegeLevel(context.operation.privilegeLevel);
      const userLevel = this.getNumericPrivilegeLevel(user.privilege_level || 'standard');

      if (userLevel < requiredLevel) {
        result.violations!.push({
          violationType: 'privilege_escalation',
          severity: 'high',
          description: `Operation requires ${context.operation.privilegeLevel} privileges, user has ${user.privilege_level}`,
          riskLevel: 8,
          affectedResource: context.resourceType,
          detectionTime: new Date(),
          remediation: [{
            action: 'Block operation and require privilege escalation approval',
            priority: 1,
            automated: true,
            description: 'Privilege escalation protection'
          }],
          evidence: { 
            requiredPrivilege: context.operation.privilegeLevel,
            userPrivilege: user.privilege_level,
            operation: context.operation.type
          }
        });
      }

      // Use AccessControlFramework for detailed permission checking
      const accessContext: Context = {
        user: {
          id: context.userId,
          roles: [user.role],
          attributes: {
            privilege_level: user.privilege_level,
            is_admin: user.is_admin,
            is_super_admin: user.is_super_admin
          }
        },
        resource: {
          type: context.resourceType,
          id: context.resourceId || '',
          attributes: {}
        },
        environment: {
          ip_address: context.ipAddress,
          user_agent: context.userAgent,
          timestamp: context.timestamp.toISOString(),
          operation_type: context.operation.type
        }
      };

      const permission: Permission = {
        action: context.operation.category as Action,
        resource: context.resourceType as Resource,
        conditions: []
      };

      const hasPermission = await this.accessControl.hasPermission(
        context.userId,
        permission,
        accessContext
      );

      if (!hasPermission) {
        result.violations!.push({
          violationType: 'unauthorized_access',
          severity: 'high',
          description: 'User lacks required permissions for this operation',
          riskLevel: 7,
          affectedResource: context.resourceType,
          detectionTime: new Date(),
          remediation: [{
            action: 'Block operation and review user permissions',
            priority: 1,
            automated: true,
            description: 'Access control enforcement'
          }],
          evidence: {
            userId: context.userId,
            requiredPermission: permission,
            operation: context.operation.type
          }
        });
      }

      return result;

    } catch (error) {
      this.logger.error('Privilege validation failed', error);
      result.violations!.push({
        violationType: 'privilege_escalation',
        severity: 'critical',
        description: 'Privilege validation system error',
        riskLevel: 10,
        affectedResource: context.resourceType,
        detectionTime: new Date(),
        remediation: [{
          action: 'Block operation immediately',
          priority: 1,
          automated: true,
          description: 'Security system protection'
        }],
        evidence: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return result;
    }
  }

  // =============================================================================
  // Input Data Validation
  // =============================================================================

  private async validateInputData(context: SecurityValidationContext): Promise<Partial<SecurityValidationResult>> {
    const result: Partial<SecurityValidationResult> = {
      violations: [],
      warnings: [],
      recommendations: []
    };

    if (!context.requestData) {
      return result;
    }

    try {
      const policy = await this.getSecurityPolicy(context.operation.type);
      if (!policy || !policy.dataValidationRules) {
        return result;
      }

      for (const rule of policy.dataValidationRules) {
        const fieldValue = this.getFieldValue(context.requestData, rule.field);
        
        // Check required fields
        if (rule.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
          result.violations!.push({
            violationType: 'input_validation_failure',
            severity: 'medium',
            description: `Required field '${rule.field}' is missing`,
            riskLevel: 5,
            affectedResource: rule.field,
            detectionTime: new Date(),
            remediation: [{
              action: 'Reject request with validation error',
              priority: 2,
              automated: true,
              description: 'Input validation enforcement'
            }],
            evidence: { field: rule.field, value: fieldValue }
          });
          continue;
        }

        if (fieldValue === undefined || fieldValue === null) {
          continue;
        }

        // Validate field types and formats
        const validationError = await this.validateFieldValue(fieldValue, rule);
        if (validationError) {
          result.violations!.push({
            violationType: 'input_validation_failure',
            severity: 'medium',
            description: `Field '${rule.field}': ${validationError}`,
            riskLevel: 6,
            affectedResource: rule.field,
            detectionTime: new Date(),
            remediation: [{
              action: 'Sanitize input and retry validation',
              priority: 2,
              automated: true,
              description: 'Input sanitization'
            }],
            evidence: { field: rule.field, value: fieldValue, rule }
          });
        }

        // Check for injection attempts
        const injectionAttempt = this.detectInjectionAttempt(fieldValue.toString());
        if (injectionAttempt) {
          result.violations!.push({
            violationType: 'injection_attempt',
            severity: 'high',
            description: `Potential ${injectionAttempt} injection detected in field '${rule.field}'`,
            riskLevel: 9,
            affectedResource: rule.field,
            detectionTime: new Date(),
            remediation: [{
              action: 'Block request and alert security team',
              priority: 1,
              automated: true,
              description: 'Injection attack prevention'
            }],
            evidence: { 
              field: rule.field, 
              value: fieldValue, 
              injectionType: injectionAttempt,
              detectedPatterns: this.getInjectionPatterns(fieldValue.toString())
            }
          });
        }
      }

      return result;

    } catch (error) {
      this.logger.error('Input validation failed', error);
      result.violations!.push({
        violationType: 'input_validation_failure',
        severity: 'high',
        description: 'Input validation system error',
        riskLevel: 7,
        affectedResource: 'input_data',
        detectionTime: new Date(),
        remediation: [{
          action: 'Block operation pending manual review',
          priority: 1,
          automated: true,
          description: 'Security system protection'
        }],
        evidence: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return result;
    }
  }

  // =============================================================================
  // Rate Limiting Validation
  // =============================================================================

  private async validateRateLimits(context: SecurityValidationContext): Promise<Partial<SecurityValidationResult>> {
    const result: Partial<SecurityValidationResult> = {
      violations: [],
      warnings: [],
      recommendations: []
    };

    try {
      const policy = await this.getSecurityPolicy(context.operation.type);
      if (!policy?.rateLimits) {
        return result;
      }

      for (const rateLimit of policy.rateLimits) {
        const key = `${context.userId}:${rateLimit.operation}`;
        const now = Date.now();
        const windowStart = now - (rateLimit.timeWindow * 60 * 1000);

        // Get current rate limit state
        let rateLimitState = this.rateLimitCache.get(key);
        if (!rateLimitState) {
          rateLimitState = {
            requests: [],
            blocked: false,
            blockedUntil: 0
          };
          this.rateLimitCache.set(key, rateLimitState);
        }

        // Clean old requests
        rateLimitState.requests = rateLimitState.requests.filter(timestamp => timestamp > windowStart);

        // Check if currently blocked
        if (rateLimitState.blocked && now < rateLimitState.blockedUntil) {
          result.violations!.push({
            violationType: 'rate_limit_exceeded',
            severity: 'medium',
            description: `Rate limit exceeded for operation '${rateLimit.operation}'`,
            riskLevel: 5,
            affectedResource: rateLimit.operation,
            detectionTime: new Date(),
            remediation: [{
              action: `Block until ${new Date(rateLimitState.blockedUntil).toISOString()}`,
              priority: 2,
              automated: true,
              description: 'Rate limiting enforcement'
            }],
            evidence: { 
              operation: rateLimit.operation,
              requestCount: rateLimitState.requests.length,
              maxRequests: rateLimit.maxRequests,
              timeWindow: rateLimit.timeWindow,
              blockedUntil: rateLimitState.blockedUntil
            }
          });
          continue;
        }

        // Check rate limit
        if (rateLimitState.requests.length >= rateLimit.maxRequests) {
          // Apply penalty
          const penaltyDuration = rateLimit.penaltyDuration * 60 * 1000;
          
          switch (rateLimit.penalty) {
            case 'block':
              rateLimitState.blocked = true;
              rateLimitState.blockedUntil = now + penaltyDuration;
              result.violations!.push({
                violationType: 'rate_limit_exceeded',
                severity: 'medium',
                description: `Rate limit exceeded for operation '${rateLimit.operation}', blocking for ${rateLimit.penaltyDuration} minutes`,
                riskLevel: 6,
                affectedResource: rateLimit.operation,
                detectionTime: new Date(),
                remediation: [{
                  action: `Block until ${new Date(rateLimitState.blockedUntil).toISOString()}`,
                  priority: 2,
                  automated: true,
                  description: 'Rate limiting penalty'
                }],
                evidence: { 
                  operation: rateLimit.operation,
                  requestCount: rateLimitState.requests.length,
                  maxRequests: rateLimit.maxRequests,
                  penalty: rateLimit.penalty,
                  penaltyDuration: rateLimit.penaltyDuration
                }
              });
              break;

            case 'warn':
              result.warnings!.push({
                warningType: 'rate_limit_warning',
                message: `High request rate for operation '${rateLimit.operation}'`,
                severity: 'medium',
                recommendations: ['Monitor user activity for suspicious behavior']
              });
              break;

            case 'delay':
              result.recommendations!.push(`Implement ${rateLimit.penaltyDuration}s delay for operation '${rateLimit.operation}'`);
              break;
          }
        }

        // Record this request
        rateLimitState.requests.push(now);
      }

      return result;

    } catch (error) {
      this.logger.error('Rate limit validation failed', error);
      return result;
    }
  }

  // =============================================================================
  // Helper Methods
  // =============================================================================

  private async loadSecurityPolicies(): Promise<void> {
    try {
      const result = await this.db.query(`
        SELECT * FROM admin_security_policies WHERE enabled = true
      `);
      
      for (const row of result.rows) {
        const policy: AdminSecurityPolicy = {
          ...row,
          timeRestrictions: JSON.parse(row.time_restrictions || '[]'),
          dataValidationRules: JSON.parse(row.data_validation_rules || '[]'),
          rateLimits: JSON.parse(row.rate_limits || '[]'),
          auditRequirements: JSON.parse(row.audit_requirements || '[]')
        };
        
        this.securityPolicies.set(policy.operationType, policy);
      }
      
      this.logger.log(`Loaded ${this.securityPolicies.size} security policies`);
    } catch (error) {
      this.logger.error('Failed to load security policies', error);
    }
  }

  private async getSecurityPolicy(operationType: AdminOperationType): Promise<AdminSecurityPolicy | null> {
    return this.securityPolicies.get(operationType) || null;
  }

  private getNumericPrivilegeLevel(level: PrivilegeLevel): number {
    const levels: Record<PrivilegeLevel, number> = {
      standard: 1,
      elevated: 2,
      admin: 3,
      super_admin: 4,
      system: 5
    };
    return levels[level] || 0;
  }

  private getFieldValue(data: any, field: string): any {
    const path = field.split('.');
    let value = data;
    for (const key of path) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return undefined;
      }
    }
    return value;
  }

  private async validateFieldValue(value: any, rule: ValidationRule): Promise<string | null> {
    const stringValue = value.toString();

    // Type validation
    switch (rule.type) {
      case 'email':
        if (!validator.isEmail(stringValue)) {
          return 'Invalid email format';
        }
        break;
      case 'url':
        if (!validator.isURL(stringValue)) {
          return 'Invalid URL format';
        }
        break;
      case 'json':
        try {
          JSON.parse(stringValue);
        } catch {
          return 'Invalid JSON format';
        }
        break;
    }

    // Length validation
    if (rule.minLength && stringValue.length < rule.minLength) {
      return `Minimum length is ${rule.minLength}`;
    }
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return `Maximum length is ${rule.maxLength}`;
    }

    // Pattern validation
    if (rule.pattern && !new RegExp(rule.pattern).test(stringValue)) {
      return 'Does not match required pattern';
    }

    // Allowed values validation
    if (rule.allowedValues && !rule.allowedValues.includes(stringValue)) {
      return 'Value not in allowed list';
    }

    return null;
  }

  private detectInjectionAttempt(value: string): string | null {
    const patterns = {
      sql: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b|--|\/\*|\*\/|'|;)/i,
      xss: /(<script|javascript:|on\w+\s*=|<iframe|<object|<embed)/i,
      nosql: /(\$where|\$regex|\$ne|\$gt|\$lt)/i,
      command: /(&&|\|\||;|`|\$\(|\${)/,
      ldap: /(\*|\(|\)|&|\|)/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(value)) {
        return type;
      }
    }

    return null;
  }

  private getInjectionPatterns(value: string): string[] {
    const patterns = [];
    const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b|--|\/\*|\*\/|'|;)/gi;
    const xssPattern = /(<script|javascript:|on\w+\s*=|<iframe|<object|<embed)/gi;
    
    let match;
    while ((match = sqlPattern.exec(value)) !== null) {
      patterns.push(`SQL: ${match[0]}`);
    }
    while ((match = xssPattern.exec(value)) !== null) {
      patterns.push(`XSS: ${match[0]}`);
    }
    
    return patterns;
  }

  private mergeValidationResults(
    target: SecurityValidationResult, 
    source: Partial<SecurityValidationResult>
  ): void {
    if (source.violations) target.violations.push(...source.violations);
    if (source.warnings) target.warnings.push(...source.warnings);
    if (source.recommendations) target.recommendations.push(...source.recommendations);
    
    if (source.violations && source.violations.length > 0) {
      target.isValid = false;
    }
  }

  private async requiresAdditionalAuth(
    context: SecurityValidationContext, 
    result: SecurityValidationResult
  ): Promise<boolean> {
    // Check if operation explicitly requires MFA
    if (context.operation.requiresMFA) {
      return true;
    }

    // Check if there are high-severity violations
    const highSeverityViolations = result.violations.filter(v => 
      v.severity === 'high' || v.severity === 'critical'
    );
    if (highSeverityViolations.length > 0) {
      return true;
    }

    // Check privilege level requirements
    if (context.operation.privilegeLevel === 'super_admin' || context.operation.privilegeLevel === 'system') {
      return true;
    }

    return false;
  }

  private async getRequiredAuthMethods(context: SecurityValidationContext): Promise<AuthMethod[]> {
    const methods: AuthMethod[] = [];
    
    // Base MFA for high-privilege operations
    if (context.operation.privilegeLevel === 'admin' || context.operation.privilegeLevel === 'super_admin') {
      methods.push('mfa_totp');
    }

    // Hardware key for system-level operations
    if (context.operation.privilegeLevel === 'system') {
      methods.push('hardware_key');
    }

    // Admin approval for emergency actions
    if (context.operation.type === 'emergency_actions') {
      methods.push('admin_approval');
    }

    return methods.length > 0 ? methods : ['mfa_totp'];
  }

  private async logSecurityEvent(
    context: SecurityValidationContext, 
    result: SecurityValidationResult
  ): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO security_events (
          user_id, session_id, operation_type, resource_type, resource_id,
          ip_address, user_agent, validation_result, violations, warnings,
          security_level, requires_additional_auth, timestamp, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        context.userId,
        context.sessionId,
        context.operation.type,
        context.resourceType,
        context.resourceId,
        context.ipAddress,
        context.userAgent,
        result.isValid,
        JSON.stringify(result.violations),
        JSON.stringify(result.warnings),
        result.securityLevel,
        result.requiresAdditionalAuth,
        context.timestamp,
        JSON.stringify(result.metadata)
      ]);
    } catch (error) {
      this.logger.error('Failed to log security event', error);
    }
  }

  // Placeholder methods for full implementation
  private async initializeRateLimiting(): Promise<void> {
    // Initialize rate limiting cache cleanup
    setInterval(() => {
      const now = Date.now();
      const expiredKeys = [];
      
      for (const [key, state] of this.rateLimitCache.entries()) {
        // Clean up expired entries
        const windowStart = now - (60 * 60 * 1000); // 1 hour window
        state.requests = state.requests.filter(timestamp => timestamp > windowStart);
        
        if (state.requests.length === 0 && (!state.blocked || now > state.blockedUntil)) {
          expiredKeys.push(key);
        }
      }
      
      for (const key of expiredKeys) {
        this.rateLimitCache.delete(key);
      }
    }, 5 * 60 * 1000); // Clean every 5 minutes
  }

  private async setupPatternDetection(): Promise<void> {
    // Initialize suspicious pattern detection
    // This would include behavioral analysis, anomaly detection, etc.
  }

  private async detectSuspiciousPatterns(context: SecurityValidationContext): Promise<Partial<SecurityValidationResult>> {
    // Placeholder for suspicious pattern detection
    return {
      violations: [],
      warnings: [],
      recommendations: []
    };
  }

  private async applySecurityPolicies(context: SecurityValidationContext): Promise<Partial<SecurityValidationResult>> {
    // Placeholder for security policy application
    return {
      violations: [],
      warnings: [],
      recommendations: []
    };
  }
}

// =============================================================================
// Supporting Interfaces
// =============================================================================

interface RateLimitState {
  requests: number[];
  blocked: boolean;
  blockedUntil: number;
}

interface SuspiciousActivity {
  userId: string;
  patterns: string[];
  severity: SecuritySeverity;
  detectedAt: Date;
  count: number;
}
// Data Access Control Service - Epic 19 Implementation
// Centralized RBAC system with data classification integration

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { DataSensitivityLevel } from '../../packages/core/security/DataSensitivityLevels';
import { DataClassificationService } from '../../packages/core/security/DataClassificationHelpers';
import { AccessControlManager } from './AccessControlManager';

export interface DataAccessRequest {
  userId: string;
  resourceId: string;
  resourceType: string;
  operation: DataOperation;
  context?: Record<string, any>;
  requestedBy?: string;
  reason?: string;
  expiresAt?: Date;
}

export interface DataAccessResponse {
  allowed: boolean;
  reason: string;
  classification?: DataSensitivityLevel;
  requiredPermissions: string[];
  actualPermissions: string[];
  accessLevel: AccessLevel;
  restrictions?: AccessRestriction[];
  auditId: string;
}

export interface AccessGrant {
  id: string;
  userId: string;
  resourceId: string;
  resourceType: string;
  operations: DataOperation[];
  classification: DataSensitivityLevel;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  reason: string;
  active: boolean;
  restrictions?: AccessRestriction[];
}

export interface AccessRestriction {
  type: 'time' | 'location' | 'operation' | 'export' | 'share';
  value: string;
  description: string;
}

export type DataOperation = 
  | 'READ' 
  | 'WRITE' 
  | 'DELETE' 
  | 'EXPORT' 
  | 'SHARE' 
  | 'MODIFY' 
  | 'CREATE' 
  | 'LIST'
  | 'SEARCH';

export type AccessLevel = 
  | 'NONE' 
  | 'LIMITED' 
  | 'STANDARD' 
  | 'ELEVATED' 
  | 'FULL_ACCESS';

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  dataAccessLevels: Record<DataSensitivityLevel, DataOperation[]>;
  hierarchy: number; // 1=lowest, 10=highest
}

export interface AccessAuditEvent {
  id: string;
  userId: string;
  resourceId: string;
  operation: DataOperation;
  allowed: boolean;
  reason: string;
  classification: DataSensitivityLevel;
  accessLevel: AccessLevel;
  timestamp: Date;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  riskScore?: number;
}

export class DataAccessControlService {
  private db: DatabaseService;
  private redis: RedisService;
  private audit: AuditService;
  private classificationService: DataClassificationService;
  private accessControlManager: AccessControlManager;
  
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly ROLE_CACHE_PREFIX = 'user_roles:';
  private readonly ACCESS_CACHE_PREFIX = 'access_grant:';

  constructor(
    db: DatabaseService,
    audit: AuditService,
    redis?: RedisService,
    classificationService?: DataClassificationService,
    accessControlManager?: AccessControlManager
  ) {
    this.db = db;
    this.audit = audit;
    this.redis = redis || {} as RedisService; // Mock Redis if not provided
    this.classificationService = classificationService || {} as DataClassificationService;
    this.accessControlManager = accessControlManager || {} as AccessControlManager;
  }

  /**
   * Check if user has access to perform operation on resource
   */
  async checkAccess(request: DataAccessRequest): Promise<DataAccessResponse> {
    const auditId = await this.generateAuditId();
    
    try {
      // 1. Get resource classification
      const classification = await this.getResourceClassification(
        request.resourceId, 
        request.resourceType
      );

      // 2. Get user roles and permissions
      const userRoles = await this.getUserRoles(request.userId);
      const userPermissions = this.aggregatePermissions(userRoles);

      // 3. Determine required permissions for operation
      const requiredPermissions = this.getRequiredPermissions(
        classification, 
        request.operation,
        request.resourceType
      );

      // 4. Check access control policies
      const accessDecision = await this.evaluateAccess(
        request,
        classification,
        userPermissions,
        requiredPermissions
      );

      // 5. Apply additional restrictions
      const restrictions = await this.getAccessRestrictions(
        request.userId,
        classification,
        request.operation
      );

      // 6. Log access attempt
      await this.logAccessAttempt({
        id: auditId,
        userId: request.userId,
        resourceId: request.resourceId,
        operation: request.operation,
        allowed: accessDecision.allowed,
        reason: accessDecision.reason,
        classification,
        accessLevel: accessDecision.accessLevel,
        timestamp: new Date(),
        sessionId: request.context?.sessionId,
        ipAddress: request.context?.ipAddress,
        userAgent: request.context?.userAgent,
        riskScore: accessDecision.riskScore
      });

      return {
        allowed: accessDecision.allowed && restrictions.length === 0,
        reason: accessDecision.reason,
        classification,
        requiredPermissions,
        actualPermissions: userPermissions,
        accessLevel: accessDecision.accessLevel,
        restrictions: restrictions.length > 0 ? restrictions : undefined,
        auditId
      };

    } catch (error) {
      await this.audit.logSecurityEvent({
        type: 'DATA_ACCESS_ERROR',
        userId: request.userId,
        resourceId: request.resourceId,
        ipAddress: request.context?.ipAddress,
        userAgent: request.context?.userAgent,
        success: false,
        metadata: { 
          error: error instanceof Error ? error.message : String(error)
        }
      });

      return {
        allowed: false,
        reason: 'Access check failed due to system error',
        requiredPermissions: [],
        actualPermissions: [],
        accessLevel: 'NONE',
        auditId
      };
    }
  }

  /**
   * Request elevated access to a resource
   */
  async requestAccess(request: DataAccessRequest): Promise<{
    requestId: string;
    status: 'approved' | 'pending' | 'denied';
    message: string;
    expiresAt?: Date;
  }> {
    const requestId = await this.generateRequestId();
    
    try {
      // 1. Validate request
      const validation = await this.validateAccessRequest(request);
      if (!validation.valid) {
        return {
          requestId,
          status: 'denied',
          message: validation.reason
        };
      }

      // 2. Check if auto-approval is possible
      const autoApproval = await this.checkAutoApproval(request);
      
      if (autoApproval.canAutoApprove) {
        // Create access grant immediately
        const grant = await this.createAccessGrant({
          userId: request.userId,
          resourceId: request.resourceId,
          resourceType: request.resourceType,
          operations: [request.operation],
          classification: validation.classification!,
          grantedBy: 'system',
          reason: request.reason || 'Auto-approved access request',
          expiresAt: request.expiresAt || autoApproval.defaultExpiry
        });

        await this.audit.logSecurityEvent({
          type: 'DATA_ACCESS_REQUEST_APPROVED',
          userId: request.userId,
          resourceId: request.resourceId,
          ipAddress: request.context?.ipAddress,
          userAgent: request.context?.userAgent,
          success: true,
          metadata: {
            requestId,
            grantId: grant.id,
            operation: request.operation,
            autoApproved: true
          }
        });

        return {
          requestId,
          status: 'approved',
          message: 'Access granted automatically',
          expiresAt: grant.expiresAt
        };
      }

      // 3. Store pending request for manual approval
      await this.storePendingRequest(requestId, request);

      await this.audit.logSecurityEvent({
        type: 'DATA_ACCESS_REQUEST_PENDING',
        userId: request.userId,
        resourceId: request.resourceId,
        ipAddress: request.context?.ipAddress,
        userAgent: request.context?.userAgent,
        success: true,
        metadata: {
          requestId,
          operation: request.operation,
          requiresApproval: true
        }
      });

      return {
        requestId,
        status: 'pending',
        message: 'Access request submitted for approval'
      };

    } catch (error) {
      await this.audit.logSecurityEvent({
        type: 'DATA_ACCESS_REQUEST_ERROR',
        userId: request.userId,
        resourceId: request.resourceId,
        ipAddress: request.context?.ipAddress,
        userAgent: request.context?.userAgent,
        success: false,
        metadata: {
          requestId,
          error: error instanceof Error ? error.message : String(error)
        }
      });

      return {
        requestId,
        status: 'denied',
        message: 'Request failed due to system error'
      };
    }
  }

  /**
   * Get user's access history
   */
  async getUserAccessHistory(
    userId: string, 
    limit: number = 100, 
    offset: number = 0
  ): Promise<AccessAuditEvent[]> {
    const result = await this.db.query(`
      SELECT 
        id, user_id, resource_id, operation, allowed, reason,
        classification, access_level, timestamp, session_id,
        ip_address, user_agent, risk_score
      FROM data_access_audit 
      WHERE user_id = $1 
      ORDER BY timestamp DESC 
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    return result.rows.map(this.mapAccessAuditEvent);
  }

  /**
   * Revoke specific access grant
   */
  async revokeAccess(
    grantId: string, 
    revokedBy: string, 
    reason: string
  ): Promise<boolean> {
    try {
      const result = await this.db.query(`
        UPDATE access_grants 
        SET active = false, revoked_by = $1, revoked_at = NOW(), revoke_reason = $2
        WHERE id = $3 AND active = true
        RETURNING *
      `, [revokedBy, reason, grantId]);

      if (result.rowCount === 0) {
        return false;
      }

      const grant = result.rows[0];
      
      // Clear cache (if Redis is available)
      try {
        await this.redis?.del?.(`${this.ACCESS_CACHE_PREFIX}${grant.user_id}:${grant.resource_id}`);
      } catch (error) {
        // Redis unavailable, continue without caching
      }

      await this.audit.logSecurityEvent({
        type: 'DATA_ACCESS_REVOKED',
        userId: grant.user_id,
        resourceId: grant.resource_id,
        ipAddress: undefined,
        userAgent: undefined,
        success: true,
        metadata: {
          grantId,
          revokedBy,
          reason
        }
      });

      return true;

    } catch (error) {
      await this.audit.logSecurityEvent({
        type: 'DATA_ACCESS_REVOKE_ERROR',
        userId: undefined,
        resourceId: undefined,
        ipAddress: undefined,
        userAgent: undefined,
        success: false,
        metadata: {
          grantId,
          revokedBy,
          error: error instanceof Error ? error.message : String(error)
        }
      });
      return false;
    }
  }

  /**
   * Get active access grants for user
   */
  async getUserAccessGrants(userId: string): Promise<AccessGrant[]> {
    const result = await this.db.query(`
      SELECT 
        id, user_id, resource_id, resource_type, operations, 
        classification, granted_by, granted_at, expires_at,
        reason, active, restrictions
      FROM access_grants 
      WHERE user_id = $1 AND active = true 
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY granted_at DESC
    `, [userId]);

    return result.rows.map(this.mapAccessGrant);
  }

  // Private helper methods

  private async getResourceClassification(
    resourceId: string, 
    resourceType: string
  ): Promise<DataSensitivityLevel> {
    // Try cache first
    const cacheKey = `classification:${resourceType}:${resourceId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return cached as DataSensitivityLevel;
    }

    // Get classification from database or classify dynamically
    const result = await this.db.query(`
      SELECT classification 
      FROM resource_classifications 
      WHERE resource_id = $1 AND resource_type = $2
    `, [resourceId, resourceType]);

    let classification: DataSensitivityLevel;
    
    if (result.rows.length > 0) {
      classification = result.rows[0].classification;
    } else {
      // Use classification service to determine
      classification = await this.classificationService.classifyResource(
        resourceId, 
        resourceType
      );
      
      // Store for future use
      await this.db.query(`
        INSERT INTO resource_classifications (resource_id, resource_type, classification, classified_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (resource_id, resource_type) 
        DO UPDATE SET classification = $3, classified_at = NOW()
      `, [resourceId, resourceType, classification]);
    }

    // Cache result
    await this.redis.setex(cacheKey, this.CACHE_TTL, classification);
    
    return classification;
  }

  private async getUserRoles(userId: string): Promise<UserRole[]> {
    const cacheKey = `${this.ROLE_CACHE_PREFIX}${userId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await this.db.query(`
      SELECT r.id, r.name, r.permissions, r.data_access_levels, r.hierarchy
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1 AND ur.active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    `, [userId]);

    const roles = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      permissions: row.permissions,
      dataAccessLevels: row.data_access_levels,
      hierarchy: row.hierarchy
    }));

    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(roles));
    
    return roles;
  }

  private aggregatePermissions(roles: UserRole[]): string[] {
    const permissions = new Set<string>();
    
    roles.forEach(role => {
      role.permissions.forEach(permission => {
        permissions.add(permission);
      });
    });

    return Array.from(permissions);
  }

  private getRequiredPermissions(
    classification: DataSensitivityLevel,
    operation: DataOperation,
    resourceType: string
  ): string[] {
    const basePermissions = [`data:${operation.toLowerCase()}`];
    
    // Add classification-specific permissions
    if (classification === 'CONFIDENTIAL' || classification === 'RESTRICTED') {
      basePermissions.push(`data:${classification.toLowerCase()}:access`);
    }

    // Add operation-specific permissions
    if (operation === 'EXPORT') {
      basePermissions.push('data:export', `data:export:${classification.toLowerCase()}`);
    }
    
    if (operation === 'SHARE') {
      basePermissions.push('data:share', `data:share:${classification.toLowerCase()}`);
    }

    // Add resource-type specific permissions
    basePermissions.push(`${resourceType}:${operation.toLowerCase()}`);

    return basePermissions;
  }

  private async evaluateAccess(
    request: DataAccessRequest,
    classification: DataSensitivityLevel,
    userPermissions: string[],
    requiredPermissions: string[]
  ): Promise<{
    allowed: boolean;
    reason: string;
    accessLevel: AccessLevel;
    riskScore?: number;
  }> {
    // Check basic permission match
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      return {
        allowed: false,
        reason: 'Insufficient permissions',
        accessLevel: 'NONE'
      };
    }

    // Use existing access control manager for advanced policies
    const accessResult = await this.accessControlManager.checkAccess({
      userId: request.userId,
      resource: request.resourceId,
      action: request.operation.toLowerCase(),
      context: {
        classification,
        resourceType: request.resourceType,
        ...request.context
      }
    });

    return {
      allowed: accessResult.allowed,
      reason: accessResult.reason || 'Access granted',
      accessLevel: this.mapToAccessLevel(accessResult.accessLevel || 'standard'),
      riskScore: accessResult.riskScore
    };
  }

  private async getAccessRestrictions(
    userId: string,
    classification: DataSensitivityLevel,
    operation: DataOperation
  ): Promise<AccessRestriction[]> {
    const restrictions: AccessRestriction[] = [];

    // Time-based restrictions for sensitive data
    if (classification === 'RESTRICTED' && operation === 'EXPORT') {
      const currentHour = new Date().getHours();
      if (currentHour < 9 || currentHour > 17) {
        restrictions.push({
          type: 'time',
          value: '09:00-17:00',
          description: 'Restricted data export only allowed during business hours'
        });
      }
    }

    // Check user-specific restrictions
    const userRestrictions = await this.db.query(`
      SELECT restriction_type, restriction_value, description
      FROM user_access_restrictions
      WHERE user_id = $1 AND active = true
    `, [userId]);

    userRestrictions.rows.forEach(row => {
      restrictions.push({
        type: row.restriction_type,
        value: row.restriction_value,
        description: row.description
      });
    });

    return restrictions;
  }

  private async validateAccessRequest(request: DataAccessRequest): Promise<{
    valid: boolean;
    reason: string;
    classification?: DataSensitivityLevel;
  }> {
    // Check if resource exists and get classification
    let classification: DataSensitivityLevel;
    
    try {
      classification = await this.getResourceClassification(
        request.resourceId, 
        request.resourceType
      );
    } catch (error) {
      return {
        valid: false,
        reason: 'Resource not found or inaccessible'
      };
    }

    // Check if user exists and is active
    const userResult = await this.db.query(`
      SELECT status FROM users WHERE id = $1
    `, [request.userId]);

    if (userResult.rows.length === 0 || userResult.rows[0].status !== 'active') {
      return {
        valid: false,
        reason: 'User not found or inactive'
      };
    }

    return {
      valid: true,
      reason: 'Valid request',
      classification
    };
  }

  private async checkAutoApproval(request: DataAccessRequest): Promise<{
    canAutoApprove: boolean;
    defaultExpiry?: Date;
  }> {
    // Auto-approve READ operations for PUBLIC and INTERNAL data
    const classification = await this.getResourceClassification(
      request.resourceId, 
      request.resourceType
    );

    if (
      request.operation === 'READ' && 
      (classification === 'PUBLIC' || classification === 'INTERNAL')
    ) {
      return {
        canAutoApprove: true,
        defaultExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
    }

    return { canAutoApprove: false };
  }

  private async createAccessGrant(grant: Omit<AccessGrant, 'id' | 'grantedAt' | 'active'>): Promise<AccessGrant> {
    const id = require('crypto').randomUUID();
    const grantedAt = new Date();

    await this.db.query(`
      INSERT INTO access_grants (
        id, user_id, resource_id, resource_type, operations,
        classification, granted_by, granted_at, expires_at,
        reason, active, restrictions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11)
    `, [
      id, grant.userId, grant.resourceId, grant.resourceType,
      JSON.stringify(grant.operations), grant.classification,
      grant.grantedBy, grantedAt, grant.expiresAt,
      grant.reason, JSON.stringify(grant.restrictions || [])
    ]);

    return {
      ...grant,
      id,
      grantedAt,
      active: true
    };
  }

  private async storePendingRequest(requestId: string, request: DataAccessRequest): Promise<void> {
    await this.db.query(`
      INSERT INTO access_requests (
        id, user_id, resource_id, resource_type, operation,
        context, requested_by, reason, expires_at, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', NOW())
    `, [
      requestId, request.userId, request.resourceId, request.resourceType,
      request.operation, JSON.stringify(request.context || {}),
      request.requestedBy, request.reason, request.expiresAt
    ]);
  }

  private async logAccessAttempt(event: AccessAuditEvent): Promise<void> {
    await this.db.query(`
      INSERT INTO data_access_audit (
        id, user_id, resource_id, operation, allowed, reason,
        classification, access_level, timestamp, session_id,
        ip_address, user_agent, risk_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      event.id, event.userId, event.resourceId, event.operation,
      event.allowed, event.reason, event.classification,
      event.accessLevel, event.timestamp, event.sessionId,
      event.ipAddress, event.userAgent, event.riskScore
    ]);

    // Also log to main audit service
    await this.audit.logSecurityEvent({
      type: event.allowed ? 'DATA_ACCESS_GRANTED' : 'DATA_ACCESS_DENIED',
      userId: event.userId,
      resourceId: event.resourceId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      success: event.allowed,
      metadata: {
        operation: event.operation,
        classification: event.classification,
        accessLevel: event.accessLevel,
        riskScore: event.riskScore
      }
    });
  }

  private mapToAccessLevel(level: string): AccessLevel {
    switch (level.toLowerCase()) {
    case 'none': return 'NONE';
    case 'limited': return 'LIMITED';
    case 'standard': return 'STANDARD';
    case 'elevated': return 'ELEVATED';
    case 'full': return 'FULL_ACCESS';
    default: return 'STANDARD';
    }
  }

  private mapAccessAuditEvent(row: any): AccessAuditEvent {
    return {
      id: row.id,
      userId: row.user_id,
      resourceId: row.resource_id,
      operation: row.operation,
      allowed: row.allowed,
      reason: row.reason,
      classification: row.classification,
      accessLevel: row.access_level,
      timestamp: row.timestamp,
      sessionId: row.session_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      riskScore: row.risk_score
    };
  }

  private mapAccessGrant(row: any): AccessGrant {
    return {
      id: row.id,
      userId: row.user_id,
      resourceId: row.resource_id,
      resourceType: row.resource_type,
      operations: JSON.parse(row.operations),
      classification: row.classification,
      grantedBy: row.granted_by,
      grantedAt: row.granted_at,
      expiresAt: row.expires_at,
      reason: row.reason,
      active: row.active,
      restrictions: row.restrictions ? JSON.parse(row.restrictions) : undefined
    };
  }

  private async generateAuditId(): Promise<string> {
    return `audit_${Date.now()}_${require('crypto').randomBytes(8).toString('hex')}`;
  }

  private async generateRequestId(): Promise<string> {
    return `req_${Date.now()}_${require('crypto').randomBytes(8).toString('hex')}`;
  }

  /**
   * Initialize database schema
   */
  async initializeSchema(): Promise<void> {
    // Create data access audit table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS data_access_audit (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        resource_id VARCHAR(255) NOT NULL,
        operation VARCHAR(50) NOT NULL,
        allowed BOOLEAN NOT NULL,
        reason TEXT,
        classification VARCHAR(50) NOT NULL,
        access_level VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        session_id VARCHAR(255),
        ip_address INET,
        user_agent TEXT,
        risk_score DECIMAL(5,2)
      )
    `);

    // Create access grants table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS access_grants (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        resource_id VARCHAR(255) NOT NULL,
        resource_type VARCHAR(100) NOT NULL,
        operations JSONB NOT NULL,
        classification VARCHAR(50) NOT NULL,
        granted_by VARCHAR(255) NOT NULL,
        granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP,
        reason TEXT,
        active BOOLEAN NOT NULL DEFAULT true,
        restrictions JSONB,
        revoked_by VARCHAR(255),
        revoked_at TIMESTAMP,
        revoke_reason TEXT
      )
    `);

    // Create access requests table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS access_requests (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        resource_id VARCHAR(255) NOT NULL,
        resource_type VARCHAR(100) NOT NULL,
        operation VARCHAR(50) NOT NULL,
        context JSONB,
        requested_by VARCHAR(255),
        reason TEXT,
        expires_at TIMESTAMP,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        approved_by VARCHAR(255),
        approved_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create resource classifications table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS resource_classifications (
        resource_id VARCHAR(255) NOT NULL,
        resource_type VARCHAR(100) NOT NULL,
        classification VARCHAR(50) NOT NULL,
        classified_at TIMESTAMP NOT NULL DEFAULT NOW(),
        classified_by VARCHAR(255) DEFAULT 'system',
        PRIMARY KEY (resource_id, resource_type)
      )
    `);

    // Create user access restrictions table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS user_access_restrictions (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        restriction_type VARCHAR(50) NOT NULL,
        restriction_value TEXT NOT NULL,
        description TEXT,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_data_access_audit_user_time 
      ON data_access_audit(user_id, timestamp DESC)
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_access_grants_user_active 
      ON access_grants(user_id, active, expires_at)
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_access_requests_status 
      ON access_requests(status, created_at DESC)
    `);
  }
}
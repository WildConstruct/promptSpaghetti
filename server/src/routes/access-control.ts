// Access Control Management API Routes
// RESTful endpoints for managing encryption key access controls

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AccessControlManager, Role, AccessRequest, AccessPolicy } from '../services/AccessControlManager';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';

}
}
interface RouteContext {
  db: DatabaseService;
  redis: RedisService;
  auditService: AuditService;
  accessControlManager: AccessControlManager;
}
}
}

// Request type definitions
}
}
interface CreateRoleRequest {
  Body: {
    name: string;
    description: string;
    permissions: Array<{
      action: string;
      resource: string;
      scope: string;
      constraints?: any[];
}
}
    }>;
    parentRoles?: string[];
  };
}

}
}
interface AssignRoleRequest {
  Body: {
    userId: string;
    roleId: string;
    expiresAt?: string;
    conditions?: any[];
}
}
  };
  Params: {
    userId: string;
  };
}

}
}
interface CreatePolicyRequest {
  Body: {
    name: string;
    description: string;
    rules: Array<{
      condition: any;
      action: string;
}
}
    }>;
    priority: number;
  };
}

}
}
interface AccessRequestSubmission {
  Body: {
    keyId: string;
    operation: string;
    justification: string;
    requestedDuration?: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
}
}
  };
}

}
}
interface ApproveAccessRequest {
  Body: {
    approved: boolean;
    comments?: string;
    conditions?: any[];
}
}
  };
  Params: {
    requestId: string;
  };
}

export async function accessControlRoutes(
  fastify: FastifyInstance,
  context: RouteContext
): Promise<void> {

  const { accessControlManager, auditService } = context;

  // Middleware for authentication and authorization
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Extract user from session/token
    const userId = (request as any).user?.id;
    if (!userId) {
      reply.code(401).send({ error: 'Authentication required' });
      return;
    }
    
    // Add user to request context
    (request as any).userId = userId;
  });

  /**
   * Role Management Endpoints
   */

  // GET /api/access-control/roles
  // List all roles with optional filtering
  fastify.get('/roles', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          active: { type: 'boolean' },
          systemRole: { type: 'boolean' },
          limit: { type: 'integer', minimum: 1, maximum: 100 },
          offset: { type: 'integer', minimum: 0 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      
      // Check if user has permission to view roles
      const userCanViewRoles = await checkPermission(
        (request as any).userId,
        'read',
        'role',
        accessControlManager
      );
      
      if (!userCanViewRoles) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }
      
      const roles = await getRoles(query, context.db);
      
      reply.send({
        roles,
        total: roles.length,
        filters: query
      });
      
    } catch (error) {
      console.error('Error fetching roles:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/access-control/roles
  // Create a new role
  fastify.post<CreateRoleRequest>('/roles', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'description', 'permissions'],
        properties: {
          name: { type: 'string', pattern: '^[a-z][a-z0-9_]*$' },
          description: { type: 'string', minLength: 1 },
          permissions: {
            type: 'array',
            items: {
              type: 'object',
              required: ['action', 'resource', 'scope'],
              properties: {
                action: { type: 'string' },
                resource: { type: 'string' },
                scope: { type: 'string', enum: ['global', 'organizational', 'project', 'personal'] },
                constraints: { type: 'array' }
              }
            }
  }
          parentRoles: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<CreateRoleRequest>, reply: FastifyReply) => {
    try {
      const userId = (request as any).userId;
      
      // Check permissions
      const canCreateRoles = await checkPermission(userId, 'create', 'role', accessControlManager);
      if (!canCreateRoles) {
        return reply.code(403).send({ error: 'Insufficient permissions to create roles' });
      }
      
      const { name, description, permissions, parentRoles } = request.body;
      
      // Convert permissions to proper format
      const formattedPermissions = permissions.map(p => ({
        id: `${p.action}_${p.resource}_${Date.now()}`,
        action: p.action as any,
        resource: p.resource as any,
        scope: p.scope as any,
        constraints: p.constraints
      }));
      
      const role = await accessControlManager.createRole({
        name,
        description,
        permissions: formattedPermissions,
        parentRoles: parentRoles || [],
        isSystemRole: false,
        isActive: true
      });
      
      await auditService.logEvent({
        userId,
        action: 'role_created',
        details: { roleId: role.id, roleName: role.name },
        severity: 'info'
      });
      
      reply.code(201).send(role);
      
    } catch (error) {
      console.error('Error creating role:', error);
      reply.code(500).send({ error: 'Failed to create role' });
    }
  });

  // PUT /api/access-control/users/:userId/roles
  // Assign role to user
  fastify.put<AssignRoleRequest>('/users/:userId/roles', {
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
  }
      body: {
        type: 'object',
        required: ['roleId'],
        properties: {
          roleId: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time' },
          conditions: { type: 'array' }
        }
      }
    }
  }, async (request: FastifyRequest<AssignRoleRequest>, reply: FastifyReply) => {
    try {
      const assignerId = (request as any).userId;
      const { userId } = request.params;
      const { roleId, expiresAt, conditions } = request.body;
      
      // Check permissions
      const canAssignRoles = await checkPermission(assignerId, 'assign', 'role', accessControlManager);
      if (!canAssignRoles) {
        return reply.code(403).send({ error: 'Insufficient permissions to assign roles' });
      }
      
      const userRole = await accessControlManager.assignRoleToUser(
        userId,
        roleId,
        assignerId,
        expiresAt ? new Date(expiresAt) : undefined,
        conditions
      );
      
      reply.send(userRole);
      
    } catch (error) {
      console.error('Error assigning role:', error);
      reply.code(500).send({ error: 'Failed to assign role' });
    }
  });

  /**
   * Policy Management Endpoints
   */

  // GET /api/access-control/policies
  // List access control policies
  fastify.get('/policies', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).userId;
      
      const canViewPolicies = await checkPermission(userId, 'read', 'policy', accessControlManager);
      if (!canViewPolicies) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }
      
      const policies = await getPolicies(context.db);
      reply.send({ policies });
      
    } catch (error) {
      console.error('Error fetching policies:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/access-control/policies
  // Create new access control policy
  fastify.post<CreatePolicyRequest>('/policies', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'description', 'rules', 'priority'],
        properties: {
          name: { type: 'string', pattern: '^[a-z][a-z0-9_]*$' },
          description: { type: 'string', minLength: 1 },
          priority: { type: 'integer', minimum: 0, maximum: 1000 },
          rules: {
            type: 'array',
            items: {
              type: 'object',
              required: ['condition', 'action'],
              properties: {
                condition: { type: 'object' },
                action: { type: 'string', enum: ['allow', 'deny', 'require_approval', 'require_mfa', 'log_warning'] }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<CreatePolicyRequest>, reply: FastifyReply) => {
    try {
      const userId = (request as any).userId;
      
      const canCreatePolicies = await checkPermission(userId, 'create', 'policy', accessControlManager);
      if (!canCreatePolicies) {
        return reply.code(403).send({ error: 'Insufficient permissions to create policies' });
      }
      
      const { name, description, rules, priority } = request.body;
      
      const policy = await accessControlManager.createPolicy({
        name,
        description,
        rules: rules.map(r => ({
          id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          condition: r.condition,
          action: r.action as any
        })),
        priority,
        isEnabled: true,
        createdBy: userId
      });
      
      reply.code(201).send(policy);
      
    } catch (error) {
      console.error('Error creating policy:', error);
      reply.code(500).send({ error: 'Failed to create policy' });
    }
  });

  /**
   * Access Request Management
   */

  // POST /api/access-control/access-requests
  // Submit access request
  fastify.post<AccessRequestSubmission>('/access-requests', {
    schema: {
      body: {
        type: 'object',
        required: ['keyId', 'operation', 'justification'],
        properties: {
          keyId: { type: 'string' },
          operation: { type: 'string' },
          justification: { type: 'string', minLength: 10 },
          requestedDuration: { type: 'integer', minimum: 1, maximum: 168 }, // Max 1 week
          urgency: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
        }
      }
    }
  }, async (request: FastifyRequest<AccessRequestSubmission>, reply: FastifyReply) => {
    try {
      const userId = (request as any).userId;
      const { keyId, operation, justification, requestedDuration, urgency } = request.body;
      
      const accessRequest = await accessControlManager.submitAccessRequest({
        userId,
        keyId,
        operation: operation as any,
        justification,
        requestedDuration,
        urgency: urgency || 'medium'
      });
      
      reply.code(201).send(accessRequest);
      
    } catch (error) {
      console.error('Error submitting access request:', error);
      reply.code(500).send({ error: 'Failed to submit access request' });
    }
  });

  // GET /api/access-control/access-requests
  // List access requests (filtered by user permissions)
  fastify.get('/access-requests', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).userId;
      const query = request.query as any;
      
      // Users can see their own requests, approvers can see all pending requests
      const canViewAllRequests = await checkPermission(userId, 'approve', 'access_request', accessControlManager);
      
      const accessRequests = await getAccessRequests(
        userId,
        canViewAllRequests,
        query,
        context.db
      );
      
      reply.send({ accessRequests });
      
    } catch (error) {
      console.error('Error fetching access requests:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/access-control/access-requests/:requestId/approve
  // Approve or deny access request
  fastify.post<ApproveAccessRequest>('/access-requests/:requestId/approve', {
    schema: {
      params: {
        type: 'object',
        required: ['requestId'],
        properties: {
          requestId: { type: 'string' }
        }
  }
      body: {
        type: 'object',
        required: ['approved'],
        properties: {
          approved: { type: 'boolean' },
          comments: { type: 'string' },
          conditions: { type: 'array' }
        }
      }
    }
  }, async (request: FastifyRequest<ApproveAccessRequest>, reply: FastifyReply) => {
    try {
      const reviewerId = (request as any).userId;
      const { requestId } = request.params;
      const { approved, comments, conditions } = request.body;
      
      // Check approval permissions
      const canApprove = await checkPermission(reviewerId, 'approve', 'access_request', accessControlManager);
      if (!canApprove) {
        return reply.code(403).send({ error: 'Insufficient permissions to approve requests' });
      }
      
      const result = await processAccessRequestApproval(
        requestId,
        reviewerId,
        approved,
        comments,
        conditions,
        context
      );
      
      reply.send(result);
      
    } catch (error) {
      console.error('Error processing approval:', error);
      reply.code(500).send({ error: 'Failed to process approval' });
    }
  });

  /**
   * Access Control Analytics
   */

  // GET /api/access-control/analytics/access-patterns
  // Get access pattern analytics
  fastify.get('/analytics/access-patterns', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).userId;
      
      const canViewAnalytics = await checkPermission(userId, 'read', 'audit_log', accessControlManager);
      if (!canViewAnalytics) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }
      
      const analytics = await getAccessPatternAnalytics(request.query as any, context.db);
      reply.send(analytics);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

// Helper functions

async function checkPermission(
  userId: string,
  action: string,
  resource: string,
  accessControlManager: AccessControlManager
): Promise<boolean> {

  try {
    // This would integrate with the access control manager
    // For now, simplified check
    return true; // Would implement proper permission checking
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

async function getRoles(query: any, db: DatabaseService): Promise<Role[]> {

  let whereClause = 'WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;
  
  if (query.active !== undefined) {
    whereClause += ` AND is_active = $${paramIndex}`;
    params.push(query.active);
    paramIndex++;
  }
  
  if (query.systemRole !== undefined) {
    whereClause += ` AND is_system_role = $${paramIndex}`;
    params.push(query.systemRole);
    paramIndex++;
  }
  
  const sql = `
    SELECT * FROM access_control_roles 
    ${whereClause}
    ORDER BY name
    ${query.limit ? `LIMIT $${paramIndex}` : ''}
    ${query.offset ? `OFFSET $${paramIndex + (query.limit ? 1 : 0)}` : ''}
  `;
  
  if (query.limit) {
    params.push(query.limit);
    paramIndex++;
  }
  
  if (query.offset) {
    params.push(query.offset);
  }
  
  const result = await db.query(sql, params);
  
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    permissions: JSON.parse(row.permissions),
    parentRoles: JSON.parse(row.parent_roles || '[]'),
    isSystemRole: row.is_system_role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isActive: row.is_active
  }));
}

async function getPolicies(db: DatabaseService): Promise<AccessPolicy[]> {

  const result = await db.query(`
    SELECT * FROM access_control_policies 
    ORDER BY priority DESC, name
  `);
  
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    rules: JSON.parse(row.rules),
    priority: row.priority,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by
  }));
}

async function getAccessRequests(
  userId: string,
  canViewAll: boolean,
  query: any,
  db: DatabaseService
): Promise<AccessRequest[]> {

  let whereClause = 'WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;
  
  if (!canViewAll) {
    whereClause += ` AND user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }
  
  if (query.status) {
    whereClause += ` AND status = $${paramIndex}`;
    params.push(query.status);
    paramIndex++;
  }
  
  const result = await db.query(`
    SELECT * FROM access_requests 
    ${whereClause}
    ORDER BY requested_at DESC
    LIMIT 50
  `, params);
  
  return result.rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    keyId: row.key_id,
    operation: row.operation,
    justification: row.justification,
    requestedDuration: row.requested_duration,
    urgency: row.urgency,
    status: row.status,
    requestedAt: row.requested_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    reviewComments: row.review_comments,
    expiresAt: row.expires_at
  }));
}

async function processAccessRequestApproval(
  requestId: string,
  reviewerId: string,
  approved: boolean,
  comments?: string,
  conditions?: any[],
  context?: RouteContext
): Promise<any> {

  if (!context) throw new Error('Context required');
  
  const { db, accessControlManager, auditService } = context;
  
  // Update access request
  await db.query(`
    UPDATE access_requests 
    SET status = $1, reviewed_at = NOW(), reviewed_by = $2, review_comments = $3
    WHERE id = $4
  `, [approved ? 'approved' : 'denied', reviewerId, comments, requestId]);
  
  if (approved) {
    // Get request details
    const requestResult = await db.query(`
      SELECT * FROM access_requests WHERE id = $1
    `, [requestId]);
    
    if (requestResult.rows.length > 0) {
      const request = requestResult.rows[0];
      
      // Create temporary access grant
      await db.query(`
        INSERT INTO temporary_access_grants (
          access_request_id, user_id, key_id, operation,
          expires_at, granted_by, conditions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        requestId,
        request.user_id,
        request.key_id,
        request.operation,
        request.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24 hours
        reviewerId,
        JSON.stringify(conditions || [])
      ]);
    }
  }
  
  // Log the approval decision
  await auditService.logEvent({
    userId: reviewerId,
    action: approved ? 'access_request_approved' : 'access_request_denied',
    details: { requestId, comments },
    severity: 'info'
  });
  
  return { success: true, approved, requestId };
}

async function getAccessPatternAnalytics(query: any, db: DatabaseService): Promise<any> {

  // This would generate analytics from the access control audit log
  const result = await db.query(`
    SELECT 
      event_type,
      COUNT(*) as count,
      DATE_TRUNC('day', created_at) as day
    FROM access_control_audit_log 
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY event_type, DATE_TRUNC('day', created_at)
    ORDER BY day DESC
  `);
  
  return {
    accessPatterns: result.rows,
    summary: {
      totalEvents: result.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
      timeRange: '30 days'
    }
  };
}

export default accessControlRoutes;
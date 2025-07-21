/**
 * Authentication Middleware for Workspace System
 * Integrates JWT authentication with workspace RBAC
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth-service';
import { WorkspaceDAO } from '../database/workspace-dao';
import { PERMISSIONS } from '../database/workspace-models';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    sessionId: string;
  };
  workspace?: {
    id: string;
    permissions: number;
    roles: string[];
  };
}

export class AuthMiddleware {
  constructor(
    private authService: AuthService,
    private workspaceDAO: WorkspaceDAO
  ) {}

  /**
   * Verify JWT token and populate user information
   */
  authenticate = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ 
          error: 'Missing or invalid authorization header' 
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const verification = await this.authService.verifyJWT(token);
      
      if (!verification) {
        return reply.status(401).send({ 
          error: 'Invalid or expired token' 
        });
      }

      // Get user from database
      const user = await this.workspaceDAO.findUserById(verification.userId);
      if (!user || user.deactivated_at) {
        return reply.status(401).send({ 
          error: 'User not found or deactivated' 
        });
      }

      // Attach user to request
      request.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        sessionId: verification.sessionId
      };

    } catch (error) {
      return reply.status(401).send({ 
        error: 'Authentication failed' 
      });
    }
  };

  /**
   * Verify workspace access and populate workspace permissions
   */
  authorizeWorkspace = (requiredPermission?: number) => {
    return async (request: AuthenticatedRequest, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send({ 
          error: 'Authentication required' 
        });
      }

      // Extract workspace ID from URL params or body
      const workspaceId = (request.params as any)?.workspaceId || 
                         (request.body as any)?.workspace_id || 
                         (request.query as any)?.workspaceId;

      if (!workspaceId) {
        return reply.status(400).send({ 
          error: 'Workspace ID required' 
        });
      }

      try {
        // Get user permissions for this workspace
        const permissions = await this.workspaceDAO.getUserPermissions(
          request.user.id, 
          workspaceId as string
        );

        if (!permissions) {
          return reply.status(403).send({ 
            error: 'Access denied to workspace' 
          });
        }

        // Check required permission if specified
        if (requiredPermission && !(permissions.permissions & requiredPermission)) {
          return reply.status(403).send({ 
            error: 'Insufficient permissions for this operation' 
          });
        }

        // Attach workspace info to request
        request.workspace = {
          id: workspaceId as string,
          permissions: permissions.permissions,
          roles: permissions.roles.map(r => r.name)
        };

      } catch (error) {
        return reply.status(500).send({ 
          error: 'Failed to verify workspace permissions' 
        });
      }
    };
  };

  /**
   * Check if user is workspace owner or admin
   */
  requireWorkspaceAdmin = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user || !request.workspace) {
      return reply.status(403).send({ 
        error: 'Authentication and workspace context required' 
      });
    }

    const workspace = await this.workspaceDAO.getWorkspace(request.workspace.id);
    if (!workspace) {
      return reply.status(404).send({ 
        error: 'Workspace not found' 
      });
    }

    // Check if user is owner or has admin permission
    const isOwner = workspace.owner_id === request.user.id;
    const isAdmin = !!(request.workspace.permissions & PERMISSIONS.WORKSPACE_ADMIN);

    if (!isOwner && !isAdmin) {
      return reply.status(403).send({ 
        error: 'Workspace admin privileges required' 
      });
    }
  };
}

// Legacy function for backward compatibility
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Authentication required' });
  }
  
  // Mock user for testing - in production this would use JWT verification
  (request as any).user = {
    id: 'user123',
    roles: ['user']
  };
}

// Middleware factory
export const createAuthMiddleware = (authService: AuthService, workspaceDAO: WorkspaceDAO) => {
  return new AuthMiddleware(authService, workspaceDAO);
};

// Permission constants for easy access
export const WORKSPACE_PERMISSIONS = {
  READ: PERMISSIONS.WORKSPACE_READ,
  WRITE: PERMISSIONS.WORKSPACE_WRITE,
  ADMIN: PERMISSIONS.WORKSPACE_ADMIN,
  DELETE: PERMISSIONS.WORKSPACE_DELETE
} as const;
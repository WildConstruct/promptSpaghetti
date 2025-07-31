/**
 * Admin Authentication Guard - Epic 17.5.4
 * 
 * Secures Epic 17 admin endpoints with role-based access control,
 * integrating with existing authentication system.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Pool } from 'pg';
import { AuthService } from '../../auth/services/AuthService';

}
}
export interface AdminUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  adminGroups: string[];
  isActive: boolean;
}
}
}

}
}
export interface AdminPermissionCheck {
  userId: string;
  requiredPermissions: string[];
  userPermissions: string[];
  hasAccess: boolean;
  deniedPermissions: string[];
}
}
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly logger = new Logger(AdminAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private pool: Pool
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    
    try {
      // Extract and validate JWT token
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('Admin access requires authentication');
      }

      // Validate token and get user info
      const userInfo = await this.authService.validateToken(token);
      if (!userInfo || !userInfo.userId) {
        throw new UnauthorizedException('Invalid authentication token');
      }

      // Get admin user details with permissions
      const adminUser = await this.getAdminUserDetails(userInfo.userId);
      if (!adminUser) {
        throw new ForbiddenException('Admin access not authorized for this user');
      }

      if (!adminUser.isActive) {
        throw new ForbiddenException('Admin account is inactive');
      }

      // Check required permissions if specified
      const requiredPermissions = this.reflector.get<string[]>(
        'permissions', 
        context.getHandler()
      );

      if (requiredPermissions && requiredPermissions.length > 0) {
        const permissionCheck = this.checkPermissions(adminUser, requiredPermissions);
        if (!permissionCheck.hasAccess) {
          await this.logAccessDenied(adminUser.id, requiredPermissions, request);
          throw new ForbiddenException(
            `Insufficient permissions. Missing: ${permissionCheck.deniedPermissions.join(', ')}`
          );
        }
      }

      // Attach admin user to request for use in controllers
      request.adminUser = adminUser;

      // Log successful admin access
      await this.logAdminAccess(adminUser.id, request);

      return true;

    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error('Admin authentication error:', error);
      throw new UnauthorizedException('Admin authentication failed');
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  private async getAdminUserDetails(userId: string): Promise<AdminUser | null> {

    const query = `
      SELECT 
        u.id,
        u.email,
        u.is_active,
        COALESCE(array_agg(DISTINCT ur.role_name), '{}') as roles,
        COALESCE(array_agg(DISTINCT apg.name), '{}') as admin_groups,
        COALESCE(
          jsonb_agg(DISTINCT perm.value) FILTER (WHERE perm.value IS NOT NULL),
          '[]'::jsonb
        ) as permissions_json
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN admin_user_group_assignments auga ON auga.user_id = u.id AND auga.active = TRUE
      LEFT JOIN admin_permission_groups apg ON apg.id = auga.group_id
      LEFT JOIN LATERAL jsonb_array_elements_text(apg.permissions) as perm(value) ON TRUE
      WHERE u.id = $1 AND u.is_active = TRUE
      GROUP BY u.id, u.email, u.is_active
    `;

    try {
      const result = await this.pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      // Check if user has any admin groups assigned
      if (!row.admin_groups || row.admin_groups.length === 0 || 
          (row.admin_groups.length === 1 && row.admin_groups[0] === null)) {
        return null; // User has no admin access
      }

      return {
        id: row.id,
        email: row.email,
        roles: row.roles || [],
        permissions: this.parsePermissions(row.permissions_json),
        adminGroups: row.admin_groups || [],
        isActive: row.is_active
      };

    } catch (error) {
      this.logger.error('Error fetching admin user details:', error);
      return null;
    }
  }

  private parsePermissions(permissionsJson: any): string[] {
    try {
      if (!permissionsJson) return [];
      
      const permissions = typeof permissionsJson === 'string' 
        ? JSON.parse(permissionsJson)
        : permissionsJson;

      if (Array.isArray(permissions)) {
        return permissions.filter(p => p && typeof p === 'string');
      }
      
      return [];
    } catch (error) {
      this.logger.warn('Error parsing user permissions:', error);
      return [];
    }
  }

  private checkPermissions(
    adminUser: AdminUser, 
    requiredPermissions: string[]
  ): AdminPermissionCheck {
    const userPermissions = adminUser.permissions;
    const deniedPermissions: string[] = [];

    for (const required of requiredPermissions) {
      if (!this.hasPermission(userPermissions, required)) {
        deniedPermissions.push(required);
      }
    }

    return {
      userId: adminUser.id,
      requiredPermissions,
      userPermissions,
      hasAccess: deniedPermissions.length === 0,
      deniedPermissions
    };
  }

  private hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    // Direct permission match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Wildcard permission matching (e.g., "admin:*" grants all admin permissions)
    for (const userPerm of userPermissions) {
      if (userPerm.endsWith(':*')) {
        const prefix = userPerm.slice(0, -1); // Remove the '*'
        if (requiredPermission.startsWith(prefix)) {
          return true;
        }
      }
    }

    // Super admin permission
    if (userPermissions.includes('admin:*:*') || userPermissions.includes('super_admin')) {
      return true;
    }

    return false;
  }

  private async logAdminAccess(userId: string, request: any): Promise<void> {

    try {
      const logQuery = `
        INSERT INTO admin_activity_log (
          user_id, action, resource_type, resource_id, metadata, 
          ip_address, user_agent, session_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      const metadata = {
        method: request.method,
        url: request.url,
        query: request.query,
        success: true
      };

      await this.pool.query(logQuery, [
        userId,
        'ADMIN_ACCESS',
        'admin_endpoint',
        request.url,
        JSON.stringify(metadata),
        request.ip || request.connection?.remoteAddress,
        request.get('User-Agent'),
        request.sessionID || null
      ]);

    } catch (error) {
      // Log error but don't fail the request
      this.logger.error('Failed to log admin access:', error);
    }
  }

  private async logAccessDenied(
    userId: string, 
    requiredPermissions: string[], 
    request: any
  ): Promise<void> {

    try {
      const logQuery = `
        INSERT INTO admin_activity_log (
          user_id, action, resource_type, resource_id, metadata, 
          ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      const metadata = {
        method: request.method,
        url: request.url,
        required_permissions: requiredPermissions,
        reason: 'insufficient_permissions',
        success: false
      };

      await this.pool.query(logQuery, [
        userId,
        'ADMIN_ACCESS_DENIED',
        'admin_endpoint',
        request.url,
        JSON.stringify(metadata),
        request.ip || request.connection?.remoteAddress,
        request.get('User-Agent')
      ]);

    } catch (error) {
      this.logger.error('Failed to log access denied:', error);
    }
  }

  /**
   * Check if user has specific admin permission (utility method for services)
   */
  static async checkUserPermission(
    pool: Pool,
    userId: string, 
    permission: string
  ): Promise<boolean> {

    const query = `
      SELECT 1
      FROM admin_user_group_assignments auga
      JOIN admin_permission_groups apg ON apg.id = auga.group_id
      WHERE auga.user_id = $1 
        AND auga.active = TRUE 
        AND (
          apg.permissions ? $2 
          OR apg.permissions ? 'admin:*'
          OR apg.permissions ? 'super_admin'

      LIMIT 1
    `;

    try {
      const result = await pool.query(query, [userId, permission]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a user (utility method)
   */
  static async getUserPermissions(pool: Pool, userId: string): Promise<string[]> {

    const query = `
      SELECT DISTINCT perm.value as permission
      FROM admin_user_group_assignments auga
      JOIN admin_permission_groups apg ON apg.id = auga.group_id
      JOIN LATERAL jsonb_array_elements_text(apg.permissions) as perm(value) ON TRUE
      WHERE auga.user_id = $1 AND auga.active = TRUE
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => row.permission);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
  }
}
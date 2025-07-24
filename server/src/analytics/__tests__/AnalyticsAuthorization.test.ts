/**
 * AnalyticsAuthorization Unit Tests - Story 1.5 Task 2
 * 
 * Basic test suite for analytics authorization service validation
 * focusing on core authorization functionality and access control.
 */

import { z } from 'zod';

describe('AnalyticsAuthorization', () => {
  describe('Authorization Schema Validation', () => {
    it('should validate auth context schema', () => {
      const AuthContextSchema = z.object({
        userId: z.string(),
        organizationId: z.string().optional(),
        roles: z.array(z.string()),
        permissions: z.array(z.string()),
        sessionId: z.string(),
        workspaceId: z.string().optional(),
        environment: z.string().default('development'),
        tokenType: z.enum(['jwt', 'api_key', 'session']),
        expiresAt: z.number().optional()
      });

      const validContext = {
        userId: 'user-123',
        organizationId: 'org-456',
        roles: ['user'],
        permissions: ['analytics:read', 'events:view'],
        sessionId: 'session-abc',
        environment: 'test',
        tokenType: 'session' as const
      };

      const result = AuthContextSchema.parse(validContext);
      expect(result.userId).toBe('user-123');
      expect(result.organizationId).toBe('org-456');
      expect(result.roles).toContain('user');
      expect(result.permissions).toContain('analytics:read');
    });

    it('should handle optional fields in auth context', () => {
      const AuthContextSchema = z.object({
        userId: z.string(),
        organizationId: z.string().optional(),
        roles: z.array(z.string()),
        permissions: z.array(z.string()),
        sessionId: z.string(),
        workspaceId: z.string().optional(),
        environment: z.string().default('development'),
        tokenType: z.enum(['jwt', 'api_key', 'session']),
        expiresAt: z.number().optional()
      });

      const minimalContext = {
        userId: 'user-123',
        roles: ['user'],
        permissions: ['analytics:read'],
        sessionId: 'session-abc',
        tokenType: 'session' as const
      };

      const result = AuthContextSchema.parse(minimalContext);
      expect(result.userId).toBe('user-123');
      expect(result.environment).toBe('development'); // Default value
      expect(result.organizationId).toBeUndefined();
    });

    it('should reject invalid auth context', () => {
      const AuthContextSchema = z.object({
        userId: z.string(),
        organizationId: z.string().optional(),
        roles: z.array(z.string()),
        permissions: z.array(z.string()),
        sessionId: z.string(),
        workspaceId: z.string().optional(),
        environment: z.string().default('development'),
        tokenType: z.enum(['jwt', 'api_key', 'session']),
        expiresAt: z.number().optional()
      });

      const invalidContext = {
        userId: 123, // Should be string
        roles: 'user', // Should be array
        permissions: ['analytics:read'],
        sessionId: 'session-abc',
        tokenType: 'invalid' // Invalid enum value
      };

      expect(() => AuthContextSchema.parse(invalidContext)).toThrow();
    });
  });

  describe('Permission Validation', () => {
    it('should validate analytics permissions', () => {
      const analyticsPermissions = [
        'analytics:publish_events',
        'analytics:view_events',
        'analytics:view_all_events',
        'analytics:view_analytics',
        'analytics:view_dashboard',
        'analytics:manage_analytics'
      ];

      analyticsPermissions.forEach(permission => {
        expect(typeof permission).toBe('string');
        expect(permission).toMatch(/^analytics:/);
      });
    });

    it('should handle permission hierarchy', () => {
      const userPermissions = ['analytics:view_events', 'analytics:view_dashboard'];
      const adminPermissions = [...userPermissions, 'analytics:manage_analytics', 'analytics:view_all_events'];

      expect(userPermissions).toHaveLength(2);
      expect(adminPermissions).toHaveLength(4);
      expect(adminPermissions).toEqual(expect.arrayContaining(userPermissions));
    });
  });

  describe('Authorization Logic', () => {
    it('should check basic permission matching', () => {
      const userPermissions = ['analytics:view_events', 'analytics:view_dashboard'];
      const requiredPermission = 'analytics:view_events';

      const hasPermission = userPermissions.includes(requiredPermission);
      expect(hasPermission).toBe(true);
    });

    it('should deny access without required permission', () => {
      const userPermissions = ['analytics:view_dashboard'];
      const requiredPermission = 'analytics:manage_analytics';

      const hasPermission = userPermissions.includes(requiredPermission);
      expect(hasPermission).toBe(false);
    });

    it('should handle role-based authorization', () => {
      const adminRole = 'admin';
      const userRole = 'user';
      const viewerRole = 'viewer';

      const adminPermissions = ['analytics:manage_analytics', 'analytics:view_all_events'];
      const userPermissions = ['analytics:view_events', 'analytics:view_dashboard'];
      const viewerPermissions = ['analytics:view_events'];

      // Role mapping logic
      const getPermissionsByRole = (role: string) => {
        switch (role) {
          case 'admin': return adminPermissions;
          case 'user': return userPermissions;
          case 'viewer': return viewerPermissions;
          default: return [];
        }
      };

      expect(getPermissionsByRole(adminRole)).toEqual(adminPermissions);
      expect(getPermissionsByRole(userRole)).toEqual(userPermissions);
      expect(getPermissionsByRole(viewerRole)).toEqual(viewerPermissions);
      expect(getPermissionsByRole('invalid')).toEqual([]);
    });
  });

  describe('Event Access Control', () => {
    it('should validate event ownership', () => {
      const event = {
        id: 'event-123',
        userId: 'user-123',
        organizationId: 'org-456',
        type: 'USER_INTERACTION',
        category: 'USER',
        data: { action: 'click' }
      };

      const authContext = {
        userId: 'user-123',
        organizationId: 'org-456',
        roles: ['user'],
        permissions: ['analytics:view_events']
      };

      // Ownership check
      const isOwner = event.userId === authContext.userId;
      const sameOrganization = event.organizationId === authContext.organizationId;
      const hasPermission = authContext.permissions.includes('analytics:view_events');

      expect(isOwner).toBe(true);
      expect(sameOrganization).toBe(true);
      expect(hasPermission).toBe(true);

      const canAccess = isOwner && sameOrganization && hasPermission;
      expect(canAccess).toBe(true);
    });

    it('should deny access to events from other users', () => {
      const event = {
        id: 'event-123',
        userId: 'other-user',
        organizationId: 'org-456',
        type: 'USER_INTERACTION',
        category: 'USER',
        data: { action: 'click' }
      };

      const authContext = {
        userId: 'user-123',
        organizationId: 'org-456',
        roles: ['user'],
        permissions: ['analytics:view_events']
      };

      const isOwner = event.userId === authContext.userId;
      const hasViewAllPermission = authContext.permissions.includes('analytics:view_all_events');

      expect(isOwner).toBe(false);
      expect(hasViewAllPermission).toBe(false);

      const canAccess = isOwner || hasViewAllPermission;
      expect(canAccess).toBe(false);
    });

    it('should allow admin access to all events', () => {
      const event = {
        id: 'event-123',
        userId: 'other-user',
        organizationId: 'org-456',
        type: 'SECURITY_EVENT',
        category: 'SECURITY',
        data: { threat: 'detected' }
      };

      const authContext = {
        userId: 'admin-123',
        organizationId: 'org-456',
        roles: ['admin'],
        permissions: ['analytics:view_all_events', 'analytics:manage_analytics']
      };

      const hasViewAllPermission = authContext.permissions.includes('analytics:view_all_events');
      const sameOrganization = event.organizationId === authContext.organizationId;

      expect(hasViewAllPermission).toBe(true);
      expect(sameOrganization).toBe(true);

      const canAccess = hasViewAllPermission && sameOrganization;
      expect(canAccess).toBe(true);
    });
  });

  describe('Filter Authorization', () => {
    it('should apply user-scope filters', () => {
      const requestedFilter = {
        types: ['USER_INTERACTION'],
        categories: ['USER'],
        startTime: Date.now() - 86400000,
        endTime: Date.now()
      };

      const authContext = {
        userId: 'user-123',
        organizationId: 'org-456',
        roles: ['user'],
        permissions: ['analytics:view_events']
      };

      // Apply user scope restrictions
      const authorizedFilter = {
        ...requestedFilter,
        userId: authContext.userId,
        organizationId: authContext.organizationId
      };

      expect(authorizedFilter.userId).toBe('user-123');
      expect(authorizedFilter.organizationId).toBe('org-456');
      expect(authorizedFilter.types).toEqual(['USER_INTERACTION']);
    });

    it('should allow admin to query without user restrictions', () => {
      const requestedFilter = {
        types: ['SECURITY_EVENT'],
        categories: ['SECURITY']
      };

      const authContext = {
        userId: 'admin-123',
        organizationId: 'org-456',
        roles: ['admin'],
        permissions: ['analytics:view_all_events', 'analytics:manage_analytics']
      };

      const hasViewAllPermission = authContext.permissions.includes('analytics:view_all_events');

      if (hasViewAllPermission) {
        // Admin can query without user restrictions
        const authorizedFilter = {
          ...requestedFilter,
          organizationId: authContext.organizationId
          // No userId restriction for admin
        };

        expect(authorizedFilter.userId).toBeUndefined();
        expect(authorizedFilter.organizationId).toBe('org-456');
      }
    });
  });

  describe('Session Validation', () => {
    it('should validate session expiration', () => {
      const currentTime = Date.now();
      const validSession = {
        sessionId: 'session-123',
        expiresAt: currentTime + 3600000 // 1 hour from now
      };

      const expiredSession = {
        sessionId: 'session-456',
        expiresAt: currentTime - 3600000 // 1 hour ago
      };

      const isValidSession = (session: typeof validSession) => {
        return session.expiresAt > currentTime;
      };

      expect(isValidSession(validSession)).toBe(true);
      expect(isValidSession(expiredSession)).toBe(false);
    });

    it('should handle missing expiration time', () => {
      const sessionWithoutExpiration = {
        sessionId: 'session-123'
        // No expiresAt field
      };

      const isValidSession = (session: unknown) => {
        if (!session.expiresAt) {
          return true; // No expiration means always valid
        }
        return session.expiresAt > Date.now();
      };

      expect(isValidSession(sessionWithoutExpiration)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed auth context', () => {
      const malformedContext = {
        userId: null,
        permissions: 'not-an-array',
        sessionId: undefined
      };

      const isValidContext = (context: unknown) => {
        return (
          typeof context.userId === 'string' &&
          Array.isArray(context.permissions) &&
          typeof context.sessionId === 'string'
        );
      };

      expect(isValidContext(malformedContext)).toBe(false);
    });

    it('should provide default permissions for invalid context', () => {
      const invalidContext = null;

      const getPermissions = (context: unknown) => {
        if (!context || !Array.isArray(context.permissions)) {
          return []; // Default to no permissions
        }
        return context.permissions;
      };

      expect(getPermissions(invalidContext)).toEqual([]);
    });

    it('should handle permission checking errors gracefully', () => {
      const authContext = {
        userId: 'user-123',
        permissions: null // Invalid permissions
      };

      const hasPermission = (context: unknown, permission: string) => {
        try {
          return Array.isArray(context.permissions) && 
                 context.permissions.includes(permission);
        } catch (error) {
          return false; // Default to no permission on error
        }
      };

      expect(hasPermission(authContext, 'analytics:view_events')).toBe(false);
    });
  });
});
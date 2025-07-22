/**
 * Require Permissions Decorator - Epic 17.5.4
 * 
 * Decorator for specifying required admin permissions on controller methods.
 * Works with AdminAuthGuard to enforce role-based access control.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to specify required permissions for admin endpoints
 * 
 * @param permissions Array of permission strings required to access the endpoint
 * 
 * @example
 * ```typescript
 * @RequirePermissions(['admin:policy:read'])
 * async getPolicies() {
 *   // Only users with admin:policy:read permission can access this
 * }
 * 
 * @RequirePermissions(['admin:policy:create', 'admin:policy:update'])
 * async createPolicy() {
 *   // User needs BOTH permissions to access this
 * }
 * ```
 */
export const RequirePermissions = (permissions: string[]) => 
  SetMetadata('permissions', permissions);

/**
 * Common permission constants for Epic 17 admin system
 */
export const AdminPermissions = {
  // Policy Management
  POLICY_READ: 'admin:policy:read',
  POLICY_CREATE: 'admin:policy:create',
  POLICY_UPDATE: 'admin:policy:update',
  POLICY_DELETE: 'admin:policy:delete',
  POLICY_PUBLISH: 'admin:policy:publish',
  POLICY_ARCHIVE: 'admin:policy:archive',
  POLICY_ROLLBACK: 'admin:policy:rollback',

  // Enforcement Management
  ENFORCEMENT_READ: 'admin:enforcement:read',
  ENFORCEMENT_REVIEW: 'admin:enforcement:review',
  ENFORCEMENT_CREATE: 'admin:enforcement:create',
  ENFORCEMENT_UPDATE: 'admin:enforcement:update',
  ENFORCEMENT_BULK_RESOLVE: 'admin:enforcement:bulk-resolve',

  // Analytics and Reporting
  ANALYTICS_READ: 'admin:analytics:read',
  ANALYTICS_EXPORT: 'admin:analytics:export',

  // System Administration
  ADMIN_USER_MANAGEMENT: 'admin:users:manage',
  ADMIN_SYSTEM_SETTINGS: 'admin:system:settings',
  ADMIN_AUDIT_LOG: 'admin:audit:read',

  // Super Admin (grants all permissions)
  SUPER_ADMIN: 'super_admin',

  // Wildcard permissions
  ALL_POLICY_PERMISSIONS: 'admin:policy:*',
  ALL_ENFORCEMENT_PERMISSIONS: 'admin:enforcement:*',
  ALL_ADMIN_PERMISSIONS: 'admin:*'
} as const;

/**
 * Permission groups for common role combinations
 */
export const PermissionGroups = {
  POLICY_ADMINISTRATOR: [
    AdminPermissions.POLICY_READ,
    AdminPermissions.POLICY_CREATE,
    AdminPermissions.POLICY_UPDATE,
    AdminPermissions.POLICY_DELETE,
    AdminPermissions.POLICY_PUBLISH,
    AdminPermissions.POLICY_ARCHIVE,
    AdminPermissions.POLICY_ROLLBACK,
    AdminPermissions.ANALYTICS_READ
  ],

  POLICY_REVIEWER: [
    AdminPermissions.POLICY_READ,
    AdminPermissions.POLICY_UPDATE,
    AdminPermissions.ENFORCEMENT_READ,
    AdminPermissions.ENFORCEMENT_REVIEW
  ],

  ENFORCEMENT_MANAGER: [
    AdminPermissions.ENFORCEMENT_READ,
    AdminPermissions.ENFORCEMENT_REVIEW,
    AdminPermissions.ENFORCEMENT_CREATE,
    AdminPermissions.ENFORCEMENT_UPDATE,
    AdminPermissions.ENFORCEMENT_BULK_RESOLVE,
    AdminPermissions.ANALYTICS_READ
  ],

  ANALYTICS_VIEWER: [
    AdminPermissions.POLICY_READ,
    AdminPermissions.ENFORCEMENT_READ,
    AdminPermissions.ANALYTICS_READ,
    AdminPermissions.ANALYTICS_EXPORT
  ],

  SYSTEM_ADMINISTRATOR: [
    AdminPermissions.ALL_ADMIN_PERMISSIONS
  ]
} as const;

/**
 * Helper decorator for common permission combinations
 */
export export export export export 
/**
 * Decorator for endpoints that require any admin access (any permission)
 */
export 
/**
 * Type definitions for TypeScript support
 */
export type AdminPermissionType = typeof AdminPermissions[keyof typeof AdminPermissions];
export type PermissionGroup = typeof PermissionGroups[keyof typeof PermissionGroups];

/**
 * Utility function to check if a permission is valid
 */
export function isValidPermission(permission: string): boolean {
  const allPermissions = Object.values(AdminPermissions);
  return allPermissions.includes(permission as AdminPermissionType) || 
         permission.match(/^admin:[a-z]+(\:[a-z\*]+)*$/);
}

/**
 * Utility function to expand wildcard permissions
 */
export function expandWildcardPermissions(permissions: string[]): string[] {
  const expanded = new Set<string>();
  const allSpecificPermissions = Object.values(AdminPermissions).filter(p => !p.includes('*'));

  for (const permission of permissions) {
    if (permission === AdminPermissions.SUPER_ADMIN || permission === AdminPermissions.ALL_ADMIN_PERMISSIONS) {
      allSpecificPermissions.forEach(p => expanded.add(p));
    } else if (permission.endsWith(':*')) {
      const prefix = permission.slice(0, -1);
      allSpecificPermissions
        .filter(p => p.startsWith(prefix))
        .forEach(p => expanded.add(p));
    } else {
      expanded.add(permission);
    }
  }

  return Array.from(expanded);
}
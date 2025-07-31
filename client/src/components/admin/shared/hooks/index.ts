/**
 * Shared Hooks Index
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 *
 * Centralized exports for all shared admin hooks
 */

export { default as useAdminApi, useAdminUserApi, useAdminFeatureToggleApi } from './useAdminApi';
export { default as usePermissions, PermissionGate, RoleGate, PERMISSIONS, ROLES } from './usePermissions';
export type { Permission, Role, User } from './usePermissions';

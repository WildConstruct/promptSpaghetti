/**
 * Security Domain - Main Export
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Main entry point for the security domain
 */

// Domain interface and types
export * from './SecurityDomain';
export * from './types/SecurityTypes';

// Re-export existing security components (to be migrated)
export { default as PrivateRoute } from '../../components/auth/PrivateRoute';
export { default as RoleProtectedRoute } from '../../components/auth/RoleProtectedRoute';

// Re-export hooks
export { useAuth } from '../../hooks/useAuth';

// Domain factory (to be implemented)
export const createSecurityDomain = (config?: any) => {
  // TODO: Implement domain factory
  return {
    components: {},
    hooks: {},
    services: {},
    events: {},
    utils: {},
  };
};

/**
 * Security Domain - Main Export
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Main entry point for the security domain
 */
export * from './SecurityDomain';
export * from './types/SecurityTypes';
export { default as PrivateRoute } from '../../components/auth/PrivateRoute';
export { default as RoleProtectedRoute } from '../../components/auth/RoleProtectedRoute';
export { useAuth } from '../../hooks/useAuth';
export declare const createSecurityDomain: (config?: any) => {
    components: {};
    hooks: {};
    services: {};
    events: {};
    utils: {};
};
//# sourceMappingURL=index.d.ts.map
/**
 * Authentication Components and Utilities Index
 *
 * Centralized exports for all authentication and route protection components
 */

// Route Protection Components
export { PrivateRoute } from './PrivateRoute';
export { RoleProtectedRoute } from './RoleProtectedRoute';

// Higher-Order Components
export { withRouteProtection, withAuthRequired, withRoleRequired, withAdminRequired } from './withRouteProtection';

// Form Components
export { LoginForm } from './LoginForm';
export { RegistrationForm } from './RegistrationForm';
export { PasswordResetForm } from './PasswordResetForm';

// Re-export the auth store for convenience
export { useAuthStore, getAuthHeaders, authenticatedFetch, setupTokenRefresh } from '../../stores/authStore';

// Re-export the route guard hook
export { useRouteGuard } from '../../hooks/useRouteGuard';

export type { User, AuthState } from '../../stores/authStore';

export type { RouteGuardOptions } from '../../hooks/useRouteGuard';

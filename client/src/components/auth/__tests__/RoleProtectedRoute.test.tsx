/**
 * RoleProtectedRoute Tests - Testing role-based access control
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RoleProtectedRoute } from '../RoleProtectedRoute';
import { useAuthStore } from '../../../stores/authStore';

// Mock the auth store
jest.mock('../../../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, state }: { to: string; state?: any }) => (
    <div data-testid="navigate" data-to={to} data-state={JSON.stringify(state)}>
      Navigate to {to}
    </div>
  ),
  useLocation: () => ({ pathname: '/admin', search: '' })
}));

const TestComponent = () => <div data-testid="role-protected-content">Admin Content</div>;
const FallbackComponent = () => <div data-testid="fallback-content">Access Denied</div>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('RoleProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      checkAuthStatus: jest.fn<unknown[], unknown>(),
      setReturnUrl: jest.fn<unknown[], unknown>(),
      accessToken: null,
      refreshToken: null,
      tokenExpiration: null,
      error: null,
      returnUrl: null,
      login: jest.fn<unknown[], unknown>(),
      register: jest.fn<unknown[], unknown>(),
      logout: jest.fn<unknown[], unknown>(),
      refreshTokens: jest.fn<unknown[], unknown>(),
      clearError: jest.fn<unknown[], unknown>(),
      updateUser: jest.fn<unknown[], unknown>()
    });

    renderWithRouter(
      <RoleProtectedRoute requiredRoles={['admin']}>
        <TestComponent />
      </RoleProtectedRoute>
    );

    // Should redirect to login via PrivateRoute
    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', '/login');
  });

  it('renders content when user has required role', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { 
        id: '1', 
        email: 'admin@example.com', 
        firstName: 'Admin', 
        lastName: 'User',
        isEmailVerified: true,
        roles: ['admin', 'user'] 
      },
      checkAuthStatus: jest.fn<unknown[], unknown>(),
      setReturnUrl: jest.fn<unknown[], unknown>(),
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiration: Date.now() + 3600000,
      error: null,
      returnUrl: null,
      login: jest.fn<unknown[], unknown>(),
      register: jest.fn<unknown[], unknown>(),
      logout: jest.fn<unknown[], unknown>(),
      refreshTokens: jest.fn<unknown[], unknown>(),
      clearError: jest.fn<unknown[], unknown>(),
      updateUser: jest.fn<unknown[], unknown>()
    });

    renderWithRouter(
      <RoleProtectedRoute requiredRoles={['admin']}>
        <TestComponent />
      </RoleProtectedRoute>
    );

    expect(screen.getByTestId('role-protected-content')).toBeInTheDocument();
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects when user lacks required role', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { 
        id: '1', 
        email: 'user@example.com', 
        firstName: 'Regular', 
        lastName: 'User',
        isEmailVerified: true,
        roles: ['user'] // Missing 'admin' role
      },
      checkAuthStatus: jest.fn<unknown[], unknown>(),
      setReturnUrl: jest.fn<unknown[], unknown>(),
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiration: Date.now() + 3600000,
      error: null,
      returnUrl: null,
      login: jest.fn<unknown[], unknown>(),
      register: jest.fn<unknown[], unknown>(),
      logout: jest.fn<unknown[], unknown>(),
      refreshTokens: jest.fn<unknown[], unknown>(),
      clearError: jest.fn<unknown[], unknown>(),
      updateUser: jest.fn<unknown[], unknown>()
    });

    renderWithRouter(
      <RoleProtectedRoute requiredRoles={['admin']}>
        <TestComponent />
      </RoleProtectedRoute>
    );

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', '/unauthorized');
    const state = JSON.parse(navigate.getAttribute('data-state') || '{}');
    expect(state.reason).toBe('insufficient_permissions');
  });

  it('shows fallback component when user lacks required role', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { 
        id: '1', 
        email: 'user@example.com', 
        firstName: 'Regular', 
        lastName: 'User',
        isEmailVerified: true,
        roles: ['user'] 
      },
      checkAuthStatus: jest.fn<unknown[], unknown>(),
      setReturnUrl: jest.fn<unknown[], unknown>(),
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiration: Date.now() + 3600000,
      error: null,
      returnUrl: null,
      login: jest.fn<unknown[], unknown>(),
      register: jest.fn<unknown[], unknown>(),
      logout: jest.fn<unknown[], unknown>(),
      refreshTokens: jest.fn<unknown[], unknown>(),
      clearError: jest.fn<unknown[], unknown>(),
      updateUser: jest.fn<unknown[], unknown>()
    });

    renderWithRouter(
      <RoleProtectedRoute requiredRoles={['admin']} fallback={<FallbackComponent />}>
        <TestComponent />
      </RoleProtectedRoute>
    );

    expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('handles requireAll=true correctly', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { 
        id: '1', 
        email: 'user@example.com', 
        firstName: 'User', 
        lastName: 'Name',
        isEmailVerified: true,
        roles: ['admin'] // Has admin but not 'moderator'
      },
      checkAuthStatus: jest.fn<unknown[], unknown>(),
      setReturnUrl: jest.fn<unknown[], unknown>(),
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiration: Date.now() + 3600000,
      error: null,
      returnUrl: null,
      login: jest.fn<unknown[], unknown>(),
      register: jest.fn<unknown[], unknown>(),
      logout: jest.fn<unknown[], unknown>(),
      refreshTokens: jest.fn<unknown[], unknown>(),
      clearError: jest.fn<unknown[], unknown>(),
      updateUser: jest.fn<unknown[], unknown>()
    });

    renderWithRouter(
      <RoleProtectedRoute requiredRoles={['admin', 'moderator']} requireAll={true}>
        <TestComponent />
      </RoleProtectedRoute>
    );

    // Should redirect because user doesn't have ALL required roles
    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', '/unauthorized');
  });

  it('handles requireAll=false correctly (default)', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { 
        id: '1', 
        email: 'user@example.com', 
        firstName: 'User', 
        lastName: 'Name',
        isEmailVerified: true,
        roles: ['admin'] // Has admin, missing 'moderator', but requireAll=false
      },
      checkAuthStatus: jest.fn<unknown[], unknown>(),
      setReturnUrl: jest.fn<unknown[], unknown>(),
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiration: Date.now() + 3600000,
      error: null,
      returnUrl: null,
      login: jest.fn<unknown[], unknown>(),
      register: jest.fn<unknown[], unknown>(),
      logout: jest.fn<unknown[], unknown>(),
      refreshTokens: jest.fn<unknown[], unknown>(),
      clearError: jest.fn<unknown[], unknown>(),
      updateUser: jest.fn<unknown[], unknown>()
    });

    renderWithRouter(
      <RoleProtectedRoute requiredRoles={['admin', 'moderator']} requireAll={false}>
        <TestComponent />
      </RoleProtectedRoute>
    );

    // Should render content because user has at least one required role
    expect(screen.getByTestId('role-protected-content')).toBeInTheDocument();
  });

  it('handles empty roles array', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { 
        id: '1', 
        email: 'user@example.com', 
        firstName: 'User', 
        lastName: 'Name',
        isEmailVerified: true,
        roles: ['user'] // User has basic role
      },
      checkAuthStatus: jest.fn<unknown[], unknown>(),
      setReturnUrl: jest.fn<unknown[], unknown>(),
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiration: Date.now() + 3600000,
      error: null,
      returnUrl: null,
      login: jest.fn<unknown[], unknown>(),
      register: jest.fn<unknown[], unknown>(),
      logout: jest.fn<unknown[], unknown>(),
      refreshTokens: jest.fn<unknown[], unknown>(),
      clearError: jest.fn<unknown[], unknown>(),
      updateUser: jest.fn<unknown[], unknown>()
    });

    renderWithRouter(
      <RoleProtectedRoute requiredRoles={[]}>
        <TestComponent />
      </RoleProtectedRoute>
    );

    // Should render content when no specific roles are required
    expect(screen.getByTestId('role-protected-content')).toBeInTheDocument();
  });
});
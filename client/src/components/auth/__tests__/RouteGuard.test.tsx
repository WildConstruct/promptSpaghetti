/**
 * RouteGuard Component Tests
 * 
 * Comprehensive test suite for route protection and role-based access control
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RouteGuard, AdminRoute, ModeratorRoute, usePermissions, useRouteAccess } from '../RouteGuard';
import { useAuthStore } from '../../../stores/authStore';

// Mock the auth store
jest.mock('../../../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Type for mock auth store data
interface MockAuthStore {
  isAuthenticated?: boolean;
  user?: { id: string; email: string; roles: string[] } | null;
  checkAuthStatus?: jest.Mock;
  setReturnUrl?: jest.Mock;
}

// Mock navigation
const mockNavigate = jest.fn<unknown[], unknown>();
jest.mock('react-router-dom', () => ({)
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Test components
const TestComponent = () => <div>Protected Content</div>;
const LoadingComponent = () => <div>Custom Loading</div>;
const UnauthorizedComponent = () => <div>Custom Unauthorized</div>;
describe('RouteGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Basic Authentication', () => {
    it('renders loading state while checking authentication', () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: false,
        isLoading: true,
        user: null,
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <RouteGuard>
            <TestComponent />
          </RouteGuard>
        </BrowserRouter>
      );
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('Checking access permissions...')).toBeInTheDocument();
    });
    it('renders custom loading component', () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: false,
        isLoading: true,
        user: null,
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <RouteGuard loadingComponent={<LoadingComponent />}>
            <TestComponent />
          </RouteGuard>
        </BrowserRouter>
      );
      expect(screen.getByText('Custom Loading')).toBeInTheDocument();
    });
    it('redirects unauthenticated user to login', async () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: false,
        isLoading: false,
        user: null,
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/protected" element={
              <RouteGuard>
                <TestComponent />
              </RouteGuard>
            } />
          </Routes>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });
    it('renders protected content for authenticated user', async () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com', roles: ['user'] },
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <RouteGuard>
            <TestComponent />
          </RouteGuard>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });
  describe('Role-Based Access Control', () => {
    it('grants access to user with required role', async () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'admin@example.com', roles: ['admin'] },
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <RouteGuard access={{ requireAuth: true, requiredRoles: ['admin'] }}>
            <TestComponent />
          </RouteGuard>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
    it('denies access to user without required role', async () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'user@example.com', roles: ['user'] },
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <RouteGuard access={{ requireAuth: true, requiredRoles: ['admin'] }}>
            <TestComponent />
          </RouteGuard>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
        expect(screen.getByText('Required roles: admin')).toBeInTheDocument();
      });
    });
    it('grants access to user with any of multiple required roles', async () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'moderator@example.com', roles: ['moderator'] },
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <RouteGuard access={{ requireAuth: true, requiredRoles: ['admin', 'moderator'] }}>
            <TestComponent />
          </RouteGuard>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });
  describe('Permission-Based Access Control', () => {
    it('grants access to user with required permissions', async () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'user@example.com', roles: ['user'] },
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <RouteGuard access={{ 
            requireAuth: true, 
            requiredPermissions: ['graphs:read', 'graphs:write'] 
          }}>
            <TestComponent />
          </RouteGuard>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
    it('denies access to user without required permissions', async () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'viewer@example.com', roles: ['viewer'] },
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <RouteGuard access={{ 
            requireAuth: true, 
            requiredPermissions: ['admin:users'] ,
          }}>
            <TestComponent />
          </RouteGuard>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
        expect(screen.getByText('Required permissions: admin:users')).toBeInTheDocument();
      });
    });
  });
  describe('Custom Access Checks', () => {
    it('grants access when custom check returns true', async () => {
      const customCheck = jest.fn<unknown[], unknown>().mockResolvedValue(true as unknown as unknown as unknown);
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'user@example.com', roles: ['user'] },
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <RouteGuard access={{ 
            requireAuth: true, 
            customCheck 
          }}>
            <TestComponent />
          </RouteGuard>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(customCheck).toHaveBeenCalledWith({ )
          id: '1', 
          email: 'user@example.com', 
          roles: ['user'] ,
        });
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
    it('denies access when custom check returns false', async () => {
      const customCheck = jest.fn<unknown[], unknown>().mockResolvedValue(false as unknown as unknown as unknown);
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'user@example.com', roles: ['user'] },
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <RouteGuard access={{ 
            requireAuth: true, 
            customCheck 
          }}>
            <TestComponent />
          </RouteGuard>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(customCheck).toHaveBeenCalled();
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });
    });
  });
  describe('Custom Components', () => {
    it('renders custom unauthorized component', async () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'user@example.com', roles: ['user'] },
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <RouteGuard 
            access={{ requireAuth: true, requiredRoles: ['admin'] }}
            unauthorizedComponent={<UnauthorizedComponent />}
          >
            <TestComponent />
          </RouteGuard>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Custom Unauthorized')).toBeInTheDocument();
      });
    });
    it('redirects to custom unauthorized route', async () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'user@example.com', roles: ['user'] },
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <Routes>
            <Route path="/forbidden" element={<div>Forbidden Page</div>} />
            <Route path="/protected" element={
              <RouteGuard 
                access={{ 
                  requireAuth: true, 
                  requiredRoles: ['admin'],
                  unauthorizedRedirect: '/forbidden',
                }}
              >
                <TestComponent />
              </RouteGuard>
            } />
          </Routes>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Forbidden Page')).toBeInTheDocument();
      });
    });
  });
  describe('Convenience Components', () => {
    it('AdminRoute allows admin access', async () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'admin@example.com', roles: ['admin'] },
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <AdminRoute>
            <TestComponent />
          </AdminRoute>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
    it('AdminRoute denies non-admin access', async () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'user@example.com', roles: ['user'] },
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <Routes>
            <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
            <Route path="/admin" element={
              <AdminRoute>
                <TestComponent />
              </AdminRoute>
            } />
          </Routes>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
      });
    });
    it('ModeratorRoute allows moderator and admin access', async () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'moderator@example.com', roles: ['moderator'] },
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <ModeratorRoute>
            <TestComponent />
          </ModeratorRoute>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });
  describe('Public Routes', () => {
    it('allows access to public routes without authentication', async () => {
      mockUseAuthStore.mockReturnValue({)
        isAuthenticated: false,
        isLoading: false,
        user: null,
        checkAuthStatus: jest.fn<unknown[], unknown>( as unknown as unknown),
        setReturnUrl: jest.fn<unknown[], unknown>()
      } as MockAuthStore);
      render()
        <BrowserRouter>
          <RouteGuard access={{ requireAuth: false }}>
            <TestComponent />
          </RouteGuard>
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });
});

// Hook Tests
describe('usePermissions Hook', () => {
  const TestHookComponent = () => {
    const { hasPermission, hasRole, userRoles, userPermissions } = usePermissions();
    return ()
      <div>
        <div>Has graphs:read: {hasPermission('graphs:read').toString()}</div>
        <div>Has admin role: {hasRole('admin').toString()}</div>
        <div>Roles: {userRoles.join(', ')}</div>
        <div>Permissions: {userPermissions.join(', ')}</div>
      </div>
    );
  };
  it('correctly identifies user permissions', () => {
    mockUseAuthStore.mockReturnValue({)
      user: { roles: ['user'] }
    } as any as unknown as unknown as unknown);
    render(<TestHookComponent />);
    expect(screen.getByText('Has graphs:read: true')).toBeInTheDocument();
    expect(screen.getByText('Has admin role: false')).toBeInTheDocument();
    expect(screen.getByText('Roles: user')).toBeInTheDocument();
  });
  it('handles admin permissions', () => {
    mockUseAuthStore.mockReturnValue({)
      user: { roles: ['admin'] }
    } as any as unknown as unknown as unknown);
    render(<TestHookComponent />);
    expect(screen.getByText('Has admin role: true')).toBeInTheDocument();
    expect(screen.getByText(/admin:users/)).toBeInTheDocument();
  });
});
describe('useRouteAccess Hook', () => {
  const TestRouteAccessComponent = ({ pathname }: { pathname?: string }) => {
    const { isAccessible, isLoading, requiresAuth } = useRouteAccess(pathname);
    return ()
      <div>
        <div>Accessible: {isAccessible.toString()}</div>
        <div>Loading: {isLoading.toString()}</div>
        <div>Requires Auth: {requiresAuth.toString()}</div>
      </div>
    );
  };
  it('correctly identifies public route access', () => {
    mockUseAuthStore.mockReturnValue({)
      isAuthenticated: false,
      user: null,
    } as any as unknown as unknown as unknown);
    render(<TestRouteAccessComponent pathname="/login" />);
    expect(screen.getByText('Accessible: true')).toBeInTheDocument();
    expect(screen.getByText('Requires Auth: false')).toBeInTheDocument();
  });
  it('correctly identifies protected route access for authenticated user', () => {
    mockUseAuthStore.mockReturnValue({)
      isAuthenticated: true,
      user: { roles: ['user'] }
    } as any as unknown as unknown as unknown);
    render(<TestRouteAccessComponent pathname="/" />);
    expect(screen.getByText('Accessible: true')).toBeInTheDocument();
    expect(screen.getByText('Requires Auth: true')).toBeInTheDocument();
  });
  it('correctly identifies access denial for unauthenticated user', () => {
    mockUseAuthStore.mockReturnValue({)
      isAuthenticated: false,
      user: null,
    } as any as unknown as unknown as unknown);
    render(<TestRouteAccessComponent pathname="/" />);
    expect(screen.getByText('Accessible: false')).toBeInTheDocument();
    expect(screen.getByText('Requires Auth: true')).toBeInTheDocument();
  });
});
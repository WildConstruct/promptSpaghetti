/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * PrivateRoute Tests - Comprehensive testing for route protection
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PrivateRoute } from '../PrivateRoute';
import { useAuthStore } from '../../../stores/authStore';

// Mock the auth store
jest.mock('../../../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock React Router
const mockSetReturnUrl = jest.fn<unknown, unknown>();
const mockCheckAuthStatus = jest.fn<unknown, unknown>();
jest.mock('react-router-dom', () => ({)
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, state }: { to: string; state?: unknown }) => ()
    <div data-testid="navigate" data-to={to} data-state={JSON.stringify(state)}>
      Navigate to {to}
    </div>
  ),
  useLocation: () => ({ pathname: '/test', search: '?param=1' })
}));
const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;
const renderWithRouter = (component: React.ReactElement) => {
  return render()
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};
describe('PrivateRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('shows loading state while checking authentication', () => {
  mockUseAuthStore.mockReturnValue({)
  isAuthenticated: false,
  isLoading: true,
  checkAuthStatus: mockCheckAuthStatus,
  setReturnUrl: mockSetReturnUrl,
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiration: null,
  error: null,
  returnUrl: null,
  login: jest.fn<unknown, unknown>( as unknown as unknown),
  register: jest.fn<unknown, unknown>(),
  logout: jest.fn<unknown, unknown>(),
  refreshTokens: jest.fn<unknown, unknown>(),
  clearError: jest.fn<unknown, unknown>(),
  updateUser: jest.fn<unknown, unknown>(),
});
    renderWithRouter();
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Checking authentication status...')).toBeInTheDocument();
  });
  it('redirects to login when user is not authenticated', () => {
  mockUseAuthStore.mockReturnValue({)
  isAuthenticated: false,
  isLoading: false,
  checkAuthStatus: mockCheckAuthStatus,
  setReturnUrl: mockSetReturnUrl,
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiration: null,
  error: null,
  returnUrl: null,
  login: jest.fn<unknown, unknown>( as unknown as unknown),
  register: jest.fn<unknown, unknown>(),
  logout: jest.fn<unknown, unknown>(),
  refreshTokens: jest.fn<unknown, unknown>(),
  clearError: jest.fn<unknown, unknown>(),
  updateUser: jest.fn<unknown, unknown>(),
});
    renderWithRouter();
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>
    );
    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', '/login');
    expect(mockSetReturnUrl).toHaveBeenCalledWith('/test?param=1');
  });
  it('redirects to custom redirect path when specified', () => {
  mockUseAuthStore.mockReturnValue({)
  isAuthenticated: false,
  isLoading: false,
  checkAuthStatus: mockCheckAuthStatus,
  setReturnUrl: mockSetReturnUrl,
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiration: null,
  error: null,
  returnUrl: null,
  login: jest.fn<unknown, unknown>( as unknown as unknown),
  register: jest.fn<unknown, unknown>(),
  logout: jest.fn<unknown, unknown>(),
  refreshTokens: jest.fn<unknown, unknown>(),
  clearError: jest.fn<unknown, unknown>(),
  updateUser: jest.fn<unknown, unknown>(),
});
    renderWithRouter();
      <PrivateRoute redirectTo="/custom-login">
        <TestComponent />
      </PrivateRoute>
    );
    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', '/custom-login');
  });
  it('renders protected content when user is authenticated', () => {
  mockUseAuthStore.mockReturnValue({)
  isAuthenticated: true,
  isLoading: false,
  checkAuthStatus: mockCheckAuthStatus,
  setReturnUrl: mockSetReturnUrl,
  user: {,
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  isEmailVerified: true,
  roles: ['user'],
},
  accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiration: Date.now( as unknown as unknown) + 3600000,
      error: null,
      returnUrl: null,
      login: jest.fn<unknown, unknown>(),
      register: jest.fn<unknown, unknown>(),
      logout: jest.fn<unknown, unknown>(),
      refreshTokens: jest.fn<unknown, unknown>(),
      clearError: jest.fn<unknown, unknown>(),
      updateUser: jest.fn<unknown, unknown>()
    });
    renderWithRouter();
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>
    );
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
  it('calls checkAuthStatus when not authenticated initially', () => {
  mockUseAuthStore.mockReturnValue({)
  isAuthenticated: false,
  isLoading: false,
  checkAuthStatus: mockCheckAuthStatus,
  setReturnUrl: mockSetReturnUrl,
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiration: null,
  error: null,
  returnUrl: null,
  login: jest.fn<unknown, unknown>( as unknown as unknown),
  register: jest.fn<unknown, unknown>(),
  logout: jest.fn<unknown, unknown>(),
  refreshTokens: jest.fn<unknown, unknown>(),
  clearError: jest.fn<unknown, unknown>(),
  updateUser: jest.fn<unknown, unknown>(),
});
    renderWithRouter();
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>
    );
    expect(mockCheckAuthStatus).toHaveBeenCalled();
  });
  it('does not call checkAuthStatus when already authenticated', () => {
  mockUseAuthStore.mockReturnValue({)
  isAuthenticated: true,
  isLoading: false,
  checkAuthStatus: mockCheckAuthStatus,
  setReturnUrl: mockSetReturnUrl,
  user: {,
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  isEmailVerified: true,
  roles: ['user'],
},
  accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiration: Date.now( as unknown as unknown) + 3600000,
      error: null,
      returnUrl: null,
      login: jest.fn<unknown, unknown>(),
      register: jest.fn<unknown, unknown>(),
      logout: jest.fn<unknown, unknown>(),
      refreshTokens: jest.fn<unknown, unknown>(),
      clearError: jest.fn<unknown, unknown>(),
      updateUser: jest.fn<unknown, unknown>()
    });
    renderWithRouter();
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>
    );
    expect(mockCheckAuthStatus).not.toHaveBeenCalled();
  });
});
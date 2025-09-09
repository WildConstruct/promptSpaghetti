import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AuthModal } from '../AuthModal';

// Mock the auth service
const mockAuthService = {
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn(),
  verifySession: jest.fn(),
  refreshToken: jest.fn()
};

// Mock child components
jest.mock('../LoginForm', () => ({
  LoginForm: ({ onSuccess, onError }: any) => (
    <div data-testid="login-form">
      <button onClick={() => onSuccess({ user: 'test' })}>Login</button>
      <button onClick={() => onError(new Error('Login failed'))}>Fail</button>
    </div>
  )
}));

jest.mock('../SignupForm', () => ({
  SignupForm: ({ onSuccess, onError }: any) => (
    <div data-testid="signup-form">
      <button onClick={() => onSuccess({ user: 'newuser' })}>Signup</button>
      <button onClick={() => onError(new Error('Signup failed'))}>Fail</button>
    </div>
  )
}));

jest.mock('../PasswordReset', () => ({
  PasswordReset: ({ onSuccess, onCancel }: any) => (
    <div data-testid="password-reset">
      <button onClick={() => onSuccess()}>Reset</button>
      <button onClick={() => onCancel()}>Cancel</button>
    </div>
  )
}));

describe('AuthModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    authService: mockAuthService,
    onAuthSuccess: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      render(<AuthModal {...defaultProps} />);
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<AuthModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });

    it('should show login form by default', () => {
      render(<AuthModal {...defaultProps} />);
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('should show title based on mode', () => {
      render(<AuthModal {...defaultProps} initialMode="signup" />);
      expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    });
  });

  describe('Mode Switching', () => {
    it('should switch to signup mode', () => {
      render(<AuthModal {...defaultProps} />);

      const signupLink = screen.getByText(/don't have an account/i);
      fireEvent.click(signupLink);

      expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    });

    it('should switch to password reset mode', () => {
      render(<AuthModal {...defaultProps} />);

      const resetLink = screen.getByText(/forgot password/i);
      fireEvent.click(resetLink);

      expect(screen.getByTestId('password-reset')).toBeInTheDocument();
    });

    it('should switch back to login from signup', () => {
      render(<AuthModal {...defaultProps} initialMode="signup" />);

      const loginLink = screen.getByText(/already have an account/i);
      fireEvent.click(loginLink);

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });

  describe('Authentication Flow', () => {
    it('should handle successful login', async () => {
      render(<AuthModal {...defaultProps} />);

      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(defaultProps.onAuthSuccess).toHaveBeenCalledWith({
          user: 'test'
        });
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it('should handle login failure', async () => {
      render(<AuthModal {...defaultProps} />);

      const failButton = screen.getByText('Fail');
      fireEvent.click(failButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      });

      expect(defaultProps.onAuthSuccess).not.toHaveBeenCalled();
    });

    it('should handle successful signup', async () => {
      render(<AuthModal {...defaultProps} initialMode="signup" />);

      const signupButton = screen.getByText('Signup');
      fireEvent.click(signupButton);

      await waitFor(() => {
        expect(defaultProps.onAuthSuccess).toHaveBeenCalledWith({
          user: 'newuser'
        });
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it('should handle password reset success', async () => {
      render(<AuthModal {...defaultProps} initialMode="reset" />);

      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password reset email sent/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Modal Behavior', () => {
    it('should close on escape key', () => {
      render(<AuthModal {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should close on overlay click', () => {
      render(<AuthModal {...defaultProps} />);

      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should not close on modal content click', () => {
      render(<AuthModal {...defaultProps} />);

      const modalContent = screen.getByTestId('modal-content');
      fireEvent.click(modalContent);

      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should show close button', () => {
      render(<AuthModal {...defaultProps} />);

      const closeButton = screen.getByLabelText(/close/i);
      fireEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner during authentication', async () => {
      mockAuthService.login.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<AuthModal {...defaultProps} />);

      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('should disable form during loading', async () => {
      mockAuthService.login.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<AuthModal {...defaultProps} />);

      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      expect(loginButton).toBeDisabled();

      await waitFor(() => {
        expect(loginButton).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error messages', () => {
      render(<AuthModal {...defaultProps} error="Invalid credentials" />);
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('should clear errors on mode switch', () => {
      const { rerender } = render(
        <AuthModal {...defaultProps} error="Login error" />
      );

      expect(screen.getByText('Login error')).toBeInTheDocument();

      const signupLink = screen.getByText(/don't have an account/i);
      fireEvent.click(signupLink);

      expect(screen.queryByText('Login error')).not.toBeInTheDocument();
    });

    it('should show network error message', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Network error'));

      render(<AuthModal {...defaultProps} />);

      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<AuthModal {...defaultProps} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });

    it('should trap focus within modal', () => {
      render(<AuthModal {...defaultProps} />);

      const modal = screen.getByTestId('auth-modal');
      const focusableElements = modal.querySelectorAll(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should restore focus on close', () => {
      const buttonRef = { current: document.createElement('button') };
      document.body.appendChild(buttonRef.current);
      buttonRef.current.focus();

      const { rerender } = render(<AuthModal {...defaultProps} />);

      rerender(<AuthModal {...defaultProps} isOpen={false} />);

      expect(document.activeElement).toBe(buttonRef.current);

      document.body.removeChild(buttonRef.current);
    });
  });

  describe('Session Management', () => {
    it('should verify session on mount', async () => {
      mockAuthService.verifySession.mockResolvedValue({ valid: true });

      render(<AuthModal {...defaultProps} />);

      await waitFor(() => {
        expect(mockAuthService.verifySession).toHaveBeenCalled();
      });
    });

    it('should handle session expiry', async () => {
      mockAuthService.verifySession.mockResolvedValue({ valid: false });

      render(<AuthModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/session expired/i)).toBeInTheDocument();
      });
    });

    it('should refresh token on expiry', async () => {
      mockAuthService.refreshToken.mockResolvedValue({ token: 'new-token' });

      render(<AuthModal {...defaultProps} />);

      const refreshButton = screen.getByText(/refresh session/i);
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockAuthService.refreshToken).toHaveBeenCalled();
      });
    });
  });
});

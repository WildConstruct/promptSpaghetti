/**
 * Test Suite for Password Reset Flow Component
 * 
 * Tests the complete password reset flow including UI interactions,
 * validation, error handling, and security features.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordResetFlow, ResetStep, PasswordStrength } from '../components/PasswordResetFlow';

// Mock the password reset managers
jest.mock('../PasswordResetTokenManager', () => ({ )
  passwordResetTokenManager: {,
  generateToken: jest.fn<unknown, unknown>()
  validateToken: jest.fn<unknown, unknown>()
  useToken: jest.fn<unknown, unknown>() }
}));
jest.mock('../VerificationCodeManager', () => ({ )
  verificationCodeManager: {
  generateCode: jest.fn<unknown, unknown>()
  validateCode: jest.fn<unknown, unknown>()
  useCode: jest.fn<unknown, unknown>() }
}));
describe('PasswordResetFlow', () => { const defaultProps = {
  onResetComplete: jest.fn<unknown, unknown>()
  onStepChange: jest.fn<unknown, unknown>()
  onSecurityEvent: jest.fn<unknown, unknown>()
  brandName: 'Test App'
  supportEmail: 'support@test.com' }
};
  beforeEach(() => { jest.clearAllMocks();
    jest.useFakeTimers() });
  afterEach(() => { jest.useRealTimers() });
  describe('Step 1: Request Reset', () => {
    test('should render initial request form', () => {
      render(<PasswordResetFlow {...defaultProps} />);
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByText('Enter your email to get started')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset code/i })).toBeInTheDocument();
    });
    test('should validate email format', async () => {
      render(<PasswordResetFlow {...defaultProps} />);
      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', { name: /send reset code/i });
      // Test invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      expect(submitButton).toBeEnabled();
      fireEvent.click(submitButton);
      await waitFor(() => { expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument() });
    });
    test('should handle successful reset request', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', { name: /send reset code/i });
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      // Advance timers to resolve the promise
      act(() => { jest.advanceTimersByTime(2000) });
      await waitFor(() => { expect(screen.getByText(/reset code sent to test@example.com/i)).toBeInTheDocument();
  expect(defaultProps.onStepChange).toHaveBeenCalledWith(ResetStep.VERIFY);
  expect(defaultProps.onSecurityEvent).toHaveBeenCalledWith()
  'password_reset_requested'
  expect.objectContaining({)
  email: 'test@example.com' }

        );
      });
    });
    test('should handle rate limiting error', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', { name: /send reset code/i });
      await user.type(emailInput, 'blocked@example.com');
      await user.click(submitButton);
      act(() => { jest.advanceTimersByTime(2000) });
      await waitFor(() => { expect(screen.getByText(/too many reset requests/i)).toBeInTheDocument() });
    });
    test('should disable submit button when loading', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', { name: /send reset code/i });
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);
      expect(screen.getByRole('button', { name: /sending code/i })).toBeDisabled();
    });
  });
  describe('Step 2: Verify Token', () => {
    test('should render verification form after successful request', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      // Complete step 1
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset code/i }));
      act(() => { jest.advanceTimersByTime(2000) });
      await waitFor(() => {
        expect(screen.getByText(/we sent a 6-digit code to/i)).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByLabelText('Reset Code')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /verify code/i })).toBeInTheDocument();
      });
    });
    test('should format token input to numbers only', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      // Navigate to verification step
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset code/i }));
      act(() => { jest.advanceTimersByTime(2000) });
      await waitFor(() => { const tokenInput = screen.getByLabelText('Reset Code');
        expect(tokenInput).toBeInTheDocument() });
      const tokenInput = screen.getByLabelText('Reset Code');
      // Type mixed characters
      await user.type(tokenInput, 'abc123def456');
      // Should only contain numbers and be limited to 6 digits
      expect(tokenInput).toHaveValue('123456');
    });
    test('should handle successful token verification', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      // Navigate to verification step
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset code/i }));
      act(() => { jest.advanceTimersByTime(2000) });
      await waitFor(() => { expect(screen.getByLabelText('Reset Code')).toBeInTheDocument() });
      const tokenInput = screen.getByLabelText('Reset Code');
      const verifyButton = screen.getByRole('button', { name: /verify code/i });
      await user.type(tokenInput, '123456');
      await user.click(verifyButton);
      act(() => { jest.advanceTimersByTime(1500) });
      await waitFor(() => { expect(screen.getByText(/code verified successfully/i)).toBeInTheDocument();
        expect(defaultProps.onStepChange).toHaveBeenCalledWith(ResetStep.RESET) });
    });
    test('should handle invalid token error', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      // Navigate to verification step
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset code/i }));
      act(() => { jest.advanceTimersByTime(2000) });
      await waitFor(() => { expect(screen.getByLabelText('Reset Code')).toBeInTheDocument() });
      const tokenInput = screen.getByLabelText('Reset Code');
      const verifyButton = screen.getByRole('button', { name: /verify code/i });
      await user.type(tokenInput, '000000');
      await user.click(verifyButton);
      act(() => { jest.advanceTimersByTime(1500) });
      await waitFor(() => { expect(screen.getByText(/invalid or expired reset code/i)).toBeInTheDocument() });
    });
    test('should show resend timer and allow resend after cooldown', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      // Navigate to verification step
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset code/i }));
      act(() => { jest.advanceTimersByTime(2000) });
      await waitFor(() => { expect(screen.getByText(/resend in \d+s/i)).toBeInTheDocument() });
      // Advance timer to end cooldown
      act(() => { jest.advanceTimersByTime(60000) });
      await waitFor(() => { const resendButton = screen.getByText('Resend Code');
        expect(resendButton).toBeInTheDocument();
        expect(resendButton).not.toBeDisabled() });
    });
    test('should allow going back to email step', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      // Navigate to verification step
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset code/i }));
      act(() => { jest.advanceTimersByTime(2000) });
      await waitFor(() => { expect(screen.getByText(/back to email/i)).toBeInTheDocument() });
      const backButton = screen.getByText(/back to email/i);
      await user.click(backButton);
      expect(screen.getByText('Enter your email to get started')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toHaveValue('test@example.com');
    });
  });
  describe('Step 3: Reset Password', () => {
    const navigateToResetStep = async (user: unknown) => {
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset code/i }));
      act(() => { jest.advanceTimersByTime(2000) });
      await waitFor(() => { expect(screen.getByLabelText('Reset Code')).toBeInTheDocument() });
      const tokenInput = screen.getByLabelText('Reset Code');
      const verifyButton = screen.getByRole('button', { name: /verify code/i });
      await user.type(tokenInput, '123456');
      await user.click(verifyButton);
      act(() => { jest.advanceTimersByTime(1500) });
      await waitFor(() => { expect(screen.getByLabelText('New Password')).toBeInTheDocument() });
    };
    test('should render password reset form', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      await navigateToResetStep(user);
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
    test('should show password strength indicator', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      await navigateToResetStep(user);
      const passwordInput = screen.getByLabelText('New Password');
      await user.type(passwordInput, 'weak');
      await waitFor(() => { expect(screen.getByText('Password Strength')).toBeInTheDocument();
        expect(screen.getByText('WEAK')).toBeInTheDocument() });
      await user.clear(passwordInput);
      await user.type(passwordInput, 'StrongP@ssw0rd123');
      await waitFor(() => { expect(screen.getByText('STRONG')).toBeInTheDocument() });
    });
    test('should show password requirements checklist', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      await navigateToResetStep(user);
      const passwordInput = screen.getByLabelText('New Password');
      await user.type(passwordInput, 'Abc123!');
      await waitFor(() => { expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
        expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
        expect(screen.getByText('One lowercase letter')).toBeInTheDocument();
        expect(screen.getByText('One number')).toBeInTheDocument();
        expect(screen.getByText('One special character')).toBeInTheDocument() });
    });
    test('should validate password confirmation match', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      await navigateToResetStep(user);
      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      await user.type(passwordInput, 'StrongP@ssw0rd123');
      await user.type(confirmInput, 'DifferentPassword');
      await waitFor(() => { expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument() });
    });
    test('should toggle password visibility', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      await navigateToResetStep(user);
      const passwordInput = screen.getByLabelText('New Password');
      const toggleButton = passwordInput.parentElement?.querySelector('button');
      expect(passwordInput).toHaveAttribute('type', 'password');
      if (toggleButton) { await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password') });
    test('should handle successful password reset', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      await navigateToResetStep(user);
      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const resetButton = screen.getByRole('button', { name: /reset password/i });
      const strongPassword = 'StrongP@ssw0rd123';
      await user.type(passwordInput, strongPassword);
      await user.type(confirmInput, strongPassword);
      await user.click(resetButton);
      act(() => { jest.advanceTimersByTime(2500) });
      await waitFor(() => { expect(screen.getByText(/password reset successful/i)).toBeInTheDocument();
        expect(defaultProps.onResetComplete).toHaveBeenCalledWith(true, 'test@example.com');
        expect(defaultProps.onStepChange).toHaveBeenCalledWith(ResetStep.SUCCESS) });
    });
    test('should prevent submission with weak password', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      await navigateToResetStep(user);
      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const resetButton = screen.getByRole('button', { name: /reset password/i });
      await user.type(passwordInput, 'weak');
      await user.type(confirmInput, 'weak');
      expect(resetButton).toBeDisabled();
    });
    test('should allow going back to verification step', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      await navigateToResetStep(user);
      const backButton = screen.getByText(/back to verification/i);
      await user.click(backButton);
      await waitFor(() => { expect(screen.getByText(/enter the code sent to your email/i)).toBeInTheDocument() });
    });
  });
  describe('Step 4: Success', () => {
    test('should render success message', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      // Navigate through all steps
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset code/i }));
      act(() => { jest.advanceTimersByTime(2000) });
      await waitFor(() => { expect(screen.getByLabelText('Reset Code')).toBeInTheDocument() });
      const tokenInput = screen.getByLabelText('Reset Code');
      await user.type(tokenInput, '123456');
      await user.click(screen.getByRole('button', { name: /verify code/i }));
      act(() => { jest.advanceTimersByTime(1500) });
      await waitFor(() => { expect(screen.getByLabelText('New Password')).toBeInTheDocument() });
      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const strongPassword = 'StrongP@ssw0rd123';
      await user.type(passwordInput, strongPassword);
      await user.type(confirmInput, strongPassword);
      await user.click(screen.getByRole('button', { name: /reset password/i }));
      act(() => { jest.advanceTimersByTime(2500) });
      await waitFor(() => {
        expect(screen.getByText(/password reset successful/i)).toBeInTheDocument();
        expect(screen.getByText(/you can now sign in with your new password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /go to sign in/i })).toBeInTheDocument();
      });
    });
  });
  describe('Progress Indicator', () => {
    test('should show correct progress states', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      // Step 1 - Request should be active
      expect(screen.getByText('Request').closest('div')).toHaveClass('text-blue-600');
      expect(screen.getByText('Verify').closest('div')).toHaveClass('text-gray-400');
      expect(screen.getByText('Reset').closest('div')).toHaveClass('text-gray-400');
      // Move to Step 2
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset code/i }));
      act(() => { jest.advanceTimersByTime(2000) });
      await waitFor(() => { expect(screen.getByText('Request').closest('div')).toHaveClass('text-green-600');
        expect(screen.getByText('Verify').closest('div')).toHaveClass('text-blue-600');
        expect(screen.getByText('Reset').closest('div')).toHaveClass('text-gray-400') });
    });
  });
  describe('Custom Validation', () => { test('should use custom password validation when provided', async () => {
  const customValidation = jest.fn(() => ({)
  isValid: false
  strength: PasswordStrength.WEAK
  score: 0
  feedback: ['Custom validation failed']
  requirements: {
  length: false
  uppercase: false
  lowercase: false
  numbers: false
  symbols: false }
}));
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} customValidation={customValidation} />);
      // Navigate to password reset step
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset code/i }));
      act(() => { jest.advanceTimersByTime(2000) });
      await waitFor(() => { expect(screen.getByLabelText('Reset Code')).toBeInTheDocument() });
      const tokenInput = screen.getByLabelText('Reset Code');
      await user.type(tokenInput, '123456');
      await user.click(screen.getByRole('button', { name: /verify code/i }));
      act(() => { jest.advanceTimersByTime(1500) });
      await waitFor(() => { expect(screen.getByLabelText('New Password')).toBeInTheDocument() });
      const passwordInput = screen.getByLabelText('New Password');
      await user.type(passwordInput, 'testpassword');
      expect(customValidation).toHaveBeenCalledWith('testpassword');
    });
  });
  describe('Security Events', () => {
    test('should emit security events for all major actions', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<PasswordResetFlow {...defaultProps} />);
      // Request reset
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send reset code/i }));
      act(() => { jest.advanceTimersByTime(2000) });
      expect(defaultProps.onSecurityEvent).toHaveBeenCalledWith()
        'password_reset_requested'
        expect.objectContaining({ )
  email: 'test@example.com' }

      );
    });
  });
  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      render(<PasswordResetFlow {...defaultProps} />);
      const emailInput = screen.getByLabelText('Email Address');
      await user.type(emailInput, 'error@example.com');
      await user.click(screen.getByRole('button', { name: /send reset code/i }));
      act(() => { jest.advanceTimersByTime(2000) });
      // Should show some kind of error message
      await waitFor(() => { expect(screen.getByRole('alert') || screen.getByText(/error/i)).toBeInTheDocument() }, { timeout: 3000 });
      consoleSpy.mockRestore();
    });
  });
});
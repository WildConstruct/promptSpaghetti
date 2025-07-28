/**
 * VerificationRequestForm Tests - E17-1753114397395-B624E7
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VerificationRequestForm } from '../VerificationRequestForm';
// import { IdentityValidationType } from '../../../auth/IdentityValidation'; // Unused import

// Mock the onSubmit function
const mockOnSubmit = jest.fn<unknown, unknown>();
const mockOnCancel = jest.fn<unknown, unknown>();
const defaultProps = {
  userId: 'test-user-123',
  onSubmit: mockOnSubmit,
  onCancel: mockOnCancel,
};
describe('VerificationRequestForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
    mockOnSubmit.mockResolvedValue()
      { requestId: 'req_123',
      status: 'pending' } as unknown as unknown);
  });
  describe('Form Rendering', () => {
    test('renders verification form with header and progress steps', () => {
      render(<VerificationRequestForm {...defaultProps} />);
      expect(screen.getByText('Account Verification')).toBeInTheDocument();
      expect(screen.getByText('Complete verification to build trust and unlock marketplace features')).toBeInTheDocument();
      // Check if all verification steps are rendered
      expect(screen.getByText('Email Verification')).toBeInTheDocument();
      expect(screen.getByText('Phone Verification')).toBeInTheDocument();
      expect(screen.getByText('Government ID')).toBeInTheDocument();
      expect(screen.getByText('Professional Credentials')).toBeInTheDocument();
      expect(screen.getByText('Social Media')).toBeInTheDocument();
    });
    test('shows required indicators for mandatory steps', () => {
      render(<VerificationRequestForm {...defaultProps} />);
      // Email verification should be marked as required
      const requiredBadges = screen.getAllByText('Required');
      expect(requiredBadges.length).toBeGreaterThan(0);
    });
    test('starts with email verification step active', () => {
      render(<VerificationRequestForm {...defaultProps} />);
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toBeInTheDocument();
      expect(screen.getByText('Send Verification Email')).toBeInTheDocument();
    });
  });
  describe('Email Verification Step', () => {
    test('requires email input for submission', async () => {
      const user = userEvent.setup();
      render(<VerificationRequestForm {...defaultProps} />);
      const submitButton = screen.getByText('Send Verification Email');
      expect(submitButton).toBeDisabled();
      // Enter email
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      expect(submitButton).not.toBeDisabled();
    });
    test('validates email format', async () => {
      const user = userEvent.setup();
      render(<VerificationRequestForm {...defaultProps} />);
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');
      const submitButton = screen.getByText('Send Verification Email');
      fireEvent.click(submitButton);
      // The form should not submit with invalid email
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    test('submits email verification successfully', async () => {
      const user = userEvent.setup();
      render(<VerificationRequestForm {...defaultProps} />);
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      const submitButton = screen.getByText('Send Verification Email');
      fireEvent.click(submitButton);
      await waitFor(() => {
  expect(mockOnSubmit).toHaveBeenCalledWith('email_verification', {)
  email: 'test@example.com',
});
      });
    });
    test('shows loading state during submission', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      render(<VerificationRequestForm {...defaultProps} />);
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      const submitButton = screen.getByText('Send Verification Email');
      fireEvent.click(submitButton);
      expect(screen.getByText('Sending...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });
  describe('Phone Verification Step', () => {
    beforeEach(async () => {
      // Navigate to phone step by completing email first
      const user = userEvent.setup();
      render(<VerificationRequestForm {...defaultProps} />);
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      const submitButton = screen.getByText('Send Verification Email');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Phone Verification')).toBeInTheDocument();
        expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      });
    });
    test('renders phone verification form', async () => {
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByText('Send Verification SMS')).toBeInTheDocument();
      expect(screen.getByText('Include country code. We\'ll send a verification SMS')).toBeInTheDocument();
    });
    test('requires phone number for submission', async () => {
      const submitButton = screen.getByText('Send Verification SMS');
      expect(submitButton).toBeDisabled();
      const user = userEvent.setup();
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '+1234567890');
      expect(submitButton).not.toBeDisabled();
    });
  });
  describe('Step Navigation', () => {
    test('allows clicking on step headers to navigate', async () => {
      const user = userEvent.setup();
      render(<VerificationRequestForm {...defaultProps} />);
      // Click on Phone Verification step
      const phoneStepHeader = screen.getByText('Phone Verification');
      fireEvent.click(phoneStepHeader);
      // Should navigate to phone verification step
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    });
    test('shows step progress correctly', () => {
      render(<VerificationRequestForm {...defaultProps} />);
      const progressInfo = screen.getByText('Step 1 of 5');
      expect(progressInfo).toBeInTheDocument();
    });
  });
  describe('Error Handling', () => {
    test('displays error messages when submission fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Network error occurred';
      mockOnSubmit.mockRejectedValue(new Error(errorMessage));
      render(<VerificationRequestForm {...defaultProps} />);
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      const submitButton = screen.getByText('Send Verification Email');
      fireEvent.click(submitButton);
      await waitFor(() => {
  expect(screen.getByText(/Failed to submit Email Verification: Network error occurred/)).toBeInTheDocument();
});
    });
    test('clears errors when switching steps', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockRejectedValue(new Error('Test error'));
      render(<VerificationRequestForm {...defaultProps} />);
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      const submitButton = screen.getByText('Send Verification Email');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/Failed to submit/)).toBeInTheDocument();
      });
      // Switch to phone step
      const phoneStepHeader = screen.getByText('Phone Verification');
      fireEvent.click(phoneStepHeader);
      // Error should be cleared
      expect(screen.queryByText(/Failed to submit/)).not.toBeInTheDocument();
    });
  });
  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      render(<VerificationRequestForm {...defaultProps} />);
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      const form = emailInput.closest('form');
      expect(form).toBeInTheDocument();
    });
    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<VerificationRequestForm {...defaultProps} />);
      const emailInput = screen.getByLabelText(/email address/i);
      // Tab navigation should work
      await user.tab();
      expect(emailInput).toHaveFocus();
      await user.tab();
      const submitButton = screen.getByText('Send Verification Email');
      expect(submitButton).toHaveFocus();
    });
  });
  describe('Cancel Functionality', () => {
    test('calls onCancel when cancel button is clicked', () => {
      render(<VerificationRequestForm {...defaultProps} />);
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
    test('disables cancel button during submission', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      render(<VerificationRequestForm {...defaultProps} />);
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      const submitButton = screen.getByText('Send Verification Email');
      fireEvent.click(submitButton);
      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeDisabled();
    });
    test('does not render cancel button when onCancel is not provided', () => {
      render(<VerificationRequestForm userId="test-user" onSubmit={mockOnSubmit} />);
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });
  });
  describe('Responsive Design', () => {
  test('renders properly on mobile viewport', () => {
  // Mock mobile viewport
  Object.defineProperty(window, 'innerWidth', {)
  writable: true,
  configurable: true,
  value: 375,
});
      render(<VerificationRequestForm {...defaultProps} />);
      // Form should still be functional
      expect(screen.getByText('Account Verification')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });
  });
});
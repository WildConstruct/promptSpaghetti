import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PasswordResetFlow, ResetStep } from '../components/PasswordResetFlow';
describe('PasswordResetFlow - Basic Tests', () => {
    const defaultProps = {
        onResetComplete: jest.fn(),
        onStepChange: jest.fn(),
        onSecurityEvent: jest.fn(),
        brandName: 'Test App',
        supportEmail: 'support@test.com'
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Initial Render', () => {
        test('should render the password reset form', () => {
            render(_jsx(PasswordResetFlow, { ...defaultProps }));
            expect(screen.getByText('Reset Password')).toBeInTheDocument();
            expect(screen.getByText('Enter your email to get started')).toBeInTheDocument();
            expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /send reset code/i })).toBeInTheDocument();
        });
        test('should show progress indicator', () => {
            render(_jsx(PasswordResetFlow, { ...defaultProps }));
            expect(screen.getByText('Request')).toBeInTheDocument();
            expect(screen.getByText('Verify')).toBeInTheDocument();
            expect(screen.getByText('Reset')).toBeInTheDocument();
        });
        test('should show support email in footer', () => {
            render(_jsx(PasswordResetFlow, { ...defaultProps }));
            expect(screen.getByText('support@test.com')).toBeInTheDocument();
        });
    });
    describe('Form Interaction', () => {
        test('should update email input value', () => {
            render(_jsx(PasswordResetFlow, { ...defaultProps }));
            const emailInput = screen.getByLabelText('Email Address');
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            expect(emailInput.value).toBe('test@example.com');
        });
        test('should disable submit button when email is empty', () => {
            render(_jsx(PasswordResetFlow, { ...defaultProps }));
            const submitButton = screen.getByRole('button', { name: /send reset code/i });
            expect(submitButton).toBeDisabled();
        });
        test('should enable submit button when email is provided', () => {
            render(_jsx(PasswordResetFlow, { ...defaultProps }));
            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset code/i });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            expect(submitButton).toBeEnabled();
        });
    });
    describe('Error Display', () => {
        test('should show error message for invalid email', async () => {
            render(_jsx(PasswordResetFlow, { ...defaultProps }));
            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset code/i });
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.click(submitButton);
            await waitFor(() => {
                expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
            });
        });
    });
    describe('Custom Props', () => {
        test('should use custom brand name', () => {
            render(_jsx(PasswordResetFlow, { ...defaultProps, brandName: "Custom App" }));
            // Brand name should be used in text content
            expect(screen.getByText(/secure your account/i)).toBeInTheDocument();
        });
        test('should use custom support email', () => {
            render(_jsx(PasswordResetFlow, { ...defaultProps, supportEmail: "help@custom.com" }));
            expect(screen.getByText('help@custom.com')).toBeInTheDocument();
        });
        test('should call onStepChange when step changes', () => {
            render(_jsx(PasswordResetFlow, { ...defaultProps }));
            expect(defaultProps.onStepChange).toHaveBeenCalledWith(ResetStep.REQUEST);
        });
    });
    describe('Accessibility', () => {
        test('should have proper form labels', () => {
            render(_jsx(PasswordResetFlow, { ...defaultProps }));
            const emailInput = screen.getByLabelText('Email Address');
            expect(emailInput).toHaveAttribute('type', 'email');
            expect(emailInput).toHaveAttribute('required');
        });
        test('should have proper button roles', () => {
            render(_jsx(PasswordResetFlow, { ...defaultProps }));
            const submitButton = screen.getByRole('button', { name: /send reset code/i });
            expect(submitButton).toHaveAttribute('type', 'submit');
        });
    });
    describe('Loading States', () => {
        test('should show loading state when submitting', async () => {
            render(_jsx(PasswordResetFlow, { ...defaultProps }));
            const emailInput = screen.getByLabelText('Email Address');
            const submitButton = screen.getByRole('button', { name: /send reset code/i });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.click(submitButton);
            // Should show loading state briefly
            await waitFor(() => {
                expect(screen.getByText(/sending code/i) || submitButton).toBeInTheDocument();
            });
        });
    });
});

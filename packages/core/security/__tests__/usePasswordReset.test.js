/**
 * Test Suite for usePasswordReset Hook
 *
 * Tests the password reset hook functionality including state management,
 * validation, API integration, and error handling.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePasswordReset, ResetStep, PasswordStrength } from '../hooks/usePasswordReset';
import { passwordResetTokenManager } from '../PasswordResetTokenManager';
// Mock the password reset managers
jest.mock('../PasswordResetTokenManager', () => ({
    passwordResetTokenManager: {
        generateToken: jest.fn(),
        validateToken: jest.fn(),
        useToken: jest.fn()
    }
}));
jest.mock('../VerificationCodeManager', () => ({
    verificationCodeManager: {
        generateCode: jest.fn(),
        validateCode: jest.fn(),
        useCode: jest.fn()
    }
}));
const mockPasswordResetTokenManager = passwordResetTokenManager;
describe('usePasswordReset', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    describe('Initial State', () => {
        test('should initialize with correct default values', () => {
            const { result } = renderHook(() => usePasswordReset());
            expect(result.current.currentStep).toBe(ResetStep.REQUEST);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(result.current.success).toBeNull();
            expect(result.current.email).toBe('');
            expect(result.current.token).toBe('');
            expect(result.current.newPassword).toBe('');
            expect(result.current.confirmPassword).toBe('');
            expect(result.current.resendTimer).toBe(0);
            expect(result.current.canResend).toBe(true);
        });
        test('should call onStepChange when step changes', () => {
            const onStepChange = jest.fn();
            const { result } = renderHook(() => usePasswordReset({ onStepChange }));
            expect(onStepChange).toHaveBeenCalledWith(ResetStep.REQUEST);
            act(() => {
                result.current.setEmail('test@example.com');
            });
            expect(result.current.email).toBe('test@example.com');
        });
    });
    describe('Email Validation', () => {
        test('should validate email format correctly', () => {
            const { result } = renderHook(() => usePasswordReset());
            act(() => {
                result.current.setEmail('invalid-email');
            });
            expect(result.current.emailValid).toBe(false);
            act(() => {
                result.current.setEmail('valid@example.com');
            });
            expect(result.current.emailValid).toBe(true);
        });
        test('should handle various email formats', () => {
            const { result } = renderHook(() => usePasswordReset());
            const testCases = [
                { email: 'test@example.com', valid: true },
                { email: 'user.name@domain.co.uk', valid: true },
                { email: 'invalid-email', valid: false },
                { email: 'missing@', valid: false },
                { email: '@missing.com', valid: false },
                { email: 'spaces @example.com', valid: false },
                { email: '', valid: false }
            ];
            testCases.forEach(({ email, valid }) => {
                act(() => {
                    result.current.setEmail(email);
                });
                expect(result.current.emailValid).toBe(valid);
            });
        });
    });
    describe('Password Validation', () => {
        test('should validate password strength correctly', () => {
            const { result } = renderHook(() => usePasswordReset());
            // Test weak password
            act(() => {
                result.current.setNewPassword('weak');
            });
            expect(result.current.passwordValidation.strength).toBe(PasswordStrength.WEAK);
            expect(result.current.passwordValidation.isValid).toBe(false);
            // Test strong password
            act(() => {
                result.current.setNewPassword('StrongP@ssw0rd123');
            });
            expect(result.current.passwordValidation.strength).toBe(PasswordStrength.STRONG);
            expect(result.current.passwordValidation.isValid).toBe(true);
        });
        test('should check password requirements', () => {
            const { result } = renderHook(() => usePasswordReset());
            act(() => {
                result.current.setNewPassword('Abc123!@');
            });
            const requirements = result.current.passwordValidation.requirements;
            expect(requirements.length).toBe(true);
            expect(requirements.uppercase).toBe(true);
            expect(requirements.lowercase).toBe(true);
            expect(requirements.numbers).toBe(true);
            expect(requirements.symbols).toBe(true);
        });
        test('should detect password matching', () => {
            const { result } = renderHook(() => usePasswordReset());
            act(() => {
                result.current.setNewPassword('password123');
                result.current.setConfirmPassword('password123');
            });
            expect(result.current.passwordsMatch).toBe(true);
            act(() => {
                result.current.setConfirmPassword('different');
            });
            expect(result.current.passwordsMatch).toBe(false);
        });
        test('should use custom validation when provided', () => {
            const customValidation = jest.fn(() => ({
                isValid: true,
                strength: PasswordStrength.STRONG,
                score: 100,
                feedback: ['Custom validation passed'],
                requirements: {
                    length: true,
                    uppercase: true,
                    lowercase: true,
                    numbers: true,
                    symbols: true
                }
            }));
            const { result } = renderHook(() => usePasswordReset({ customValidation }));
            act(() => {
                result.current.setNewPassword('test');
            });
            expect(customValidation).toHaveBeenCalledWith('test');
            expect(result.current.passwordValidation.strength).toBe(PasswordStrength.STRONG);
        });
        test('should detect common password patterns', () => {
            const { result } = renderHook(() => usePasswordReset());
            // Test repeating characters
            act(() => {
                result.current.setNewPassword('aaaaaaaa');
            });
            expect(result.current.passwordValidation.feedback).toContain('Avoid repeating characters');
            // Test sequential characters
            act(() => {
                result.current.setNewPassword('12345678');
            });
            expect(result.current.passwordValidation.feedback).toContain('Avoid sequential characters');
        });
    });
    describe('Token Validation', () => {
        test('should validate token format', () => {
            const { result } = renderHook(() => usePasswordReset());
            act(() => {
                result.current.setToken('123');
            });
            expect(result.current.tokenValid).toBe(false);
            act(() => {
                result.current.setToken('123456');
            });
            expect(result.current.tokenValid).toBe(true);
        });
    });
    describe('Reset Flow - Request Step', () => {
        test('should handle successful reset request', async () => {
            mockPasswordResetTokenManager.generateToken.mockResolvedValue({
                token: 'mock-token',
                tokenId: 'mock-token-id'
            });
            const onSecurityEvent = jest.fn();
            const { result } = renderHook(() => usePasswordReset({ onSecurityEvent }));
            act(() => {
                result.current.setEmail('test@example.com');
            });
            let requestPromise;
            act(() => {
                requestPromise = result.current.requestReset();
            });
            expect(result.current.loading).toBe(true);
            await act(async () => {
                const success = await requestPromise;
                expect(success).toBe(true);
            });
            expect(result.current.loading).toBe(false);
            expect(result.current.success).toContain('Reset code sent to test@example.com');
            expect(result.current.currentStep).toBe(ResetStep.VERIFY);
            expect(result.current.resendTimer).toBeGreaterThan(0);
            expect(onSecurityEvent).toHaveBeenCalledWith('password_reset_requested', expect.objectContaining({
                email: 'test@example.com'
            }));
        });
        test('should handle request failure', async () => {
            mockPasswordResetTokenManager.generateToken.mockResolvedValue(null);
            const onError = jest.fn();
            const { result } = renderHook(() => usePasswordReset({ onError }));
            act(() => {
                result.current.setEmail('test@example.com');
            });
            let requestPromise;
            act(() => {
                requestPromise = result.current.requestReset();
            });
            await act(async () => {
                const success = await requestPromise;
                expect(success).toBe(false);
            });
            expect(result.current.error).toBeTruthy();
            expect(onError).toHaveBeenCalled();
        });
        test('should reject invalid email', async () => {
            const { result } = renderHook(() => usePasswordReset());
            act(() => {
                result.current.setEmail('invalid-email');
            });
            let requestPromise;
            act(() => {
                requestPromise = result.current.requestReset();
            });
            await act(async () => {
                const success = await requestPromise;
                expect(success).toBe(false);
            });
            expect(result.current.error).toContain('valid email address');
        });
    });
    describe('Reset Flow - Verify Step', () => {
        test('should handle successful token verification', async () => {
            mockPasswordResetTokenManager.generateToken.mockResolvedValue({
                token: 'mock-token',
                tokenId: 'mock-token-id'
            });
            mockPasswordResetTokenManager.validateToken.mockResolvedValue({
                valid: true,
                token: {
                    id: 'mock-token-id',
                    userId: 'user-123',
                    email: 'test@example.com'
                },
                riskScore: 10
            });
            const { result } = renderHook(() => usePasswordReset());
            // First request reset
            act(() => {
                result.current.setEmail('test@example.com');
            });
            await act(async () => {
                await result.current.requestReset();
            });
            // Then verify token
            act(() => {
                result.current.setToken('123456');
            });
            let verifyPromise;
            act(() => {
                verifyPromise = result.current.verifyToken();
            });
            await act(async () => {
                const success = await verifyPromise;
                expect(success).toBe(true);
            });
            expect(result.current.success).toContain('Code verified successfully');
            expect(result.current.currentStep).toBe(ResetStep.RESET);
        });
        test('should handle token verification failure', async () => {
            mockPasswordResetTokenManager.generateToken.mockResolvedValue({
                token: 'mock-token',
                tokenId: 'mock-token-id'
            });
            mockPasswordResetTokenManager.validateToken.mockResolvedValue({
                valid: false,
                reason: 'token_expired'
            });
            const { result } = renderHook(() => usePasswordReset());
            // First request reset
            act(() => {
                result.current.setEmail('test@example.com');
            });
            await act(async () => {
                await result.current.requestReset();
            });
            // Then try to verify invalid token
            act(() => {
                result.current.setToken('000000');
            });
            let verifyPromise;
            act(() => {
                verifyPromise = result.current.verifyToken();
            });
            await act(async () => {
                const success = await verifyPromise;
                expect(success).toBe(false);
            });
            expect(result.current.error).toBeTruthy();
        });
        test('should reject invalid token format', async () => {
            const { result } = renderHook(() => usePasswordReset());
            act(() => {
                result.current.setToken('123');
            });
            let verifyPromise;
            act(() => {
                verifyPromise = result.current.verifyToken();
            });
            await act(async () => {
                const success = await verifyPromise;
                expect(success).toBe(false);
            });
            expect(result.current.error).toContain('valid reset code');
        });
    });
    describe('Reset Flow - Password Reset Step', () => {
        const setupForPasswordReset = async (result) => {
            mockPasswordResetTokenManager.generateToken.mockResolvedValue({
                token: 'mock-token',
                tokenId: 'mock-token-id'
            });
            mockPasswordResetTokenManager.validateToken.mockResolvedValue({
                valid: true,
                token: { id: 'mock-token-id' },
                riskScore: 10
            });
            act(() => {
                result.current.setEmail('test@example.com');
            });
            await act(async () => {
                await result.current.requestReset();
            });
            act(() => {
                result.current.setToken('123456');
            });
            await act(async () => {
                await result.current.verifyToken();
            });
        };
        test('should handle successful password reset', async () => {
            mockPasswordResetTokenManager.useToken.mockResolvedValue({
                success: true,
                token: { id: 'mock-token-id' }
            });
            const { result } = renderHook(() => usePasswordReset());
            await setupForPasswordReset(result);
            const strongPassword = 'StrongP@ssw0rd123';
            act(() => {
                result.current.setNewPassword(strongPassword);
                result.current.setConfirmPassword(strongPassword);
            });
            let resetPromise;
            act(() => {
                resetPromise = result.current.resetPassword();
            });
            await act(async () => {
                const success = await resetPromise;
                expect(success).toBe(true);
            });
            expect(result.current.success).toContain('Password reset successfully');
            expect(result.current.currentStep).toBe(ResetStep.SUCCESS);
        });
        test('should reject weak password', async () => {
            const { result } = renderHook(() => usePasswordReset());
            await setupForPasswordReset(result);
            act(() => {
                result.current.setNewPassword('weak');
                result.current.setConfirmPassword('weak');
            });
            let resetPromise;
            act(() => {
                resetPromise = result.current.resetPassword();
            });
            await act(async () => {
                const success = await resetPromise;
                expect(success).toBe(false);
            });
            expect(result.current.error).toContain('security requirements');
        });
        test('should reject mismatched passwords', async () => {
            const { result } = renderHook(() => usePasswordReset());
            await setupForPasswordReset(result);
            act(() => {
                result.current.setNewPassword('StrongP@ssw0rd123');
                result.current.setConfirmPassword('DifferentPassword');
            });
            let resetPromise;
            act(() => {
                resetPromise = result.current.resetPassword();
            });
            await act(async () => {
                const success = await resetPromise;
                expect(success).toBe(false);
            });
            expect(result.current.error).toContain('do not match');
        });
        test('should handle token usage failure', async () => {
            mockPasswordResetTokenManager.useToken.mockResolvedValue({
                success: false,
                reason: 'token_already_used'
            });
            const { result } = renderHook(() => usePasswordReset());
            await setupForPasswordReset(result);
            const strongPassword = 'StrongP@ssw0rd123';
            act(() => {
                result.current.setNewPassword(strongPassword);
                result.current.setConfirmPassword(strongPassword);
            });
            let resetPromise;
            act(() => {
                resetPromise = result.current.resetPassword();
            });
            await act(async () => {
                const success = await resetPromise;
                expect(success).toBe(false);
            });
            expect(result.current.error).toBeTruthy();
        });
    });
    describe('Resend Functionality', () => {
        test('should handle successful code resend', async () => {
            mockPasswordResetTokenManager.generateToken.mockResolvedValue({
                token: 'new-mock-token',
                tokenId: 'new-mock-token-id'
            });
            const { result } = renderHook(() => usePasswordReset());
            act(() => {
                result.current.setEmail('test@example.com');
            });
            await act(async () => {
                await result.current.requestReset();
            });
            // Wait for resend timer to expire
            act(() => {
                jest.advanceTimersByTime(60000);
            });
            await waitFor(() => {
                expect(result.current.canResend).toBe(true);
            });
            let resendPromise;
            act(() => {
                resendPromise = result.current.resendCode();
            });
            await act(async () => {
                const success = await resendPromise;
                expect(success).toBe(true);
            });
            expect(result.current.success).toContain('New reset code sent');
            expect(result.current.resendTimer).toBeGreaterThan(0);
        });
        test('should prevent resend during cooldown', async () => {
            const { result } = renderHook(() => usePasswordReset());
            act(() => {
                result.current.setEmail('test@example.com');
            });
            await act(async () => {
                await result.current.requestReset();
            });
            expect(result.current.canResend).toBe(false);
            let resendPromise;
            act(() => {
                resendPromise = result.current.resendCode();
            });
            await act(async () => {
                const success = await resendPromise;
                expect(success).toBe(false);
            });
        });
    });
    describe('Timer Management', () => {
        test('should countdown resend timer correctly', async () => {
            const { result } = renderHook(() => usePasswordReset({ resendCooldown: 5 }));
            act(() => {
                result.current.setEmail('test@example.com');
            });
            await act(async () => {
                await result.current.requestReset();
            });
            expect(result.current.resendTimer).toBe(5);
            act(() => {
                jest.advanceTimersByTime(1000);
            });
            await waitFor(() => {
                expect(result.current.resendTimer).toBe(4);
            });
            act(() => {
                jest.advanceTimersByTime(4000);
            });
            await waitFor(() => {
                expect(result.current.resendTimer).toBe(0);
                expect(result.current.canResend).toBe(true);
            });
        });
    });
    describe('Navigation', () => {
        test('should allow going back between steps', async () => {
            const { result } = renderHook(() => usePasswordReset());
            // Move to verify step
            act(() => {
                result.current.setEmail('test@example.com');
            });
            await act(async () => {
                await result.current.requestReset();
            });
            expect(result.current.currentStep).toBe(ResetStep.VERIFY);
            // Go back to request
            act(() => {
                result.current.goBack();
            });
            expect(result.current.currentStep).toBe(ResetStep.REQUEST);
        });
        test('should clear messages when going back', async () => {
            const { result } = renderHook(() => usePasswordReset());
            act(() => {
                result.current.setEmail('test@example.com');
            });
            await act(async () => {
                await result.current.requestReset();
            });
            expect(result.current.success).toBeTruthy();
            act(() => {
                result.current.goBack();
            });
            expect(result.current.success).toBeNull();
            expect(result.current.error).toBeNull();
        });
    });
    describe('Reset Functionality', () => {
        test('should reset all state', async () => {
            const { result } = renderHook(() => usePasswordReset());
            // Set some state
            act(() => {
                result.current.setEmail('test@example.com');
                result.current.setToken('123456');
                result.current.setNewPassword('password');
                result.current.setConfirmPassword('password');
            });
            await act(async () => {
                await result.current.requestReset();
            });
            // Reset everything
            act(() => {
                result.current.reset();
            });
            expect(result.current.currentStep).toBe(ResetStep.REQUEST);
            expect(result.current.email).toBe('');
            expect(result.current.token).toBe('');
            expect(result.current.newPassword).toBe('');
            expect(result.current.confirmPassword).toBe('');
            expect(result.current.resendTimer).toBe(0);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(result.current.success).toBeNull();
        });
    });
    describe('Utility Functions', () => {
        test('should provide password strength colors', () => {
            const { result } = renderHook(() => usePasswordReset());
            expect(result.current.getPasswordStrengthColor(PasswordStrength.WEAK)).toContain('red');
            expect(result.current.getPasswordStrengthColor(PasswordStrength.FAIR)).toContain('orange');
            expect(result.current.getPasswordStrengthColor(PasswordStrength.GOOD)).toContain('blue');
            expect(result.current.getPasswordStrengthColor(PasswordStrength.STRONG)).toContain('green');
        });
        test('should provide password strength width', () => {
            const { result } = renderHook(() => usePasswordReset());
            expect(result.current.getPasswordStrengthWidth(0)).toBe('10%');
            expect(result.current.getPasswordStrengthWidth(50)).toBe('50%');
            expect(result.current.getPasswordStrengthWidth(100)).toBe('100%');
        });
    });
    describe('Auto-advance Configuration', () => {
        test('should not auto-advance when disabled', async () => {
            mockPasswordResetTokenManager.generateToken.mockResolvedValue({
                token: 'mock-token',
                tokenId: 'mock-token-id'
            });
            const { result } = renderHook(() => usePasswordReset({ autoAdvance: false }));
            act(() => {
                result.current.setEmail('test@example.com');
            });
            await act(async () => {
                await result.current.requestReset();
            });
            // Should stay on request step
            expect(result.current.currentStep).toBe(ResetStep.REQUEST);
        });
    });
    describe('Cleanup', () => {
        test('should cleanup timers on unmount', () => {
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            const { unmount } = renderHook(() => usePasswordReset());
            unmount();
            expect(clearIntervalSpy).toHaveBeenCalled();
            clearIntervalSpy.mockRestore();
        });
    });
});

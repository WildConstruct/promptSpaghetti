/**
 * Password Reset Hook
 *
 * Custom React hook for managing password reset state and operations.
 * Integrates with PasswordResetTokenManager and VerificationCodeManager
 * to provide a complete password reset flow.
 *
 * Features:
 * - Token request and validation
 * - Password strength validation
 * - Rate limiting and security monitoring
 * - Error handling and user feedback
 * - Integration with existing security services
 */
export declare enum ResetStep {
    REQUEST = "request",
    VERIFY = "verify",
    RESET = "reset",
    SUCCESS = "success"

export declare enum PasswordStrength {
    WEAK = "weak",
    FAIR = "fair",
    GOOD = "good",
    STRONG = "strong"

export interface PasswordValidation {
    isValid: boolean;
    strength: PasswordStrength;
    score: number;
    feedback: string[];
    requirements: {,
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        numbers: boolean;
        symbols: boolean;
    };

export interface ResetToken {
    token: string;
    tokenId: string;
    expiresAt: Date;

export interface UsePasswordResetOptions {
    onStepChange?: (step: ResetStep) => void;
    onSecurityEvent?: (event: string, details: any) => void;
    onError?: (error: Error) => void;
    customValidation?: (password: string) => PasswordValidation;
    autoAdvance?: boolean;
    resendCooldown?: number;

export interface UsePasswordResetReturn {
    currentStep: ResetStep;
    loading: boolean;
    error: string | null;
    success: string | null;
    email: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
    passwordValidation: PasswordValidation;
    emailValid: boolean;
    tokenValid: boolean;
    passwordsMatch: boolean;
    resendTimer: number;
    canResend: boolean;
    setEmail: (email: string) => void;
    setToken: (token: string) => void;
    setNewPassword: (password: string) => void;
    setConfirmPassword: (password: string) => void;
    requestReset: () => Promise<boolean>;
    verifyToken: () => Promise<boolean>;
    resetPassword: () => Promise<boolean>;
    resendCode: () => Promise<boolean>;
    goBack: () => void;
    reset: () => void;
    validatePassword: (password: string) => PasswordValidation;
    getPasswordStrengthColor: (strength: PasswordStrength) => string;
    getPasswordStrengthWidth: (score: number) => string;

export declare const usePasswordReset: (options?: UsePasswordResetOptions) => UsePasswordResetReturn;
export default usePasswordReset;
//# sourceMappingURL=usePasswordReset.d.ts.map
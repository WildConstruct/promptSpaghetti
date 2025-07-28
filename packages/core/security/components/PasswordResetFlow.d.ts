/**
 * Password Reset Flow Component
 *
 * Comprehensive password reset UI that integrates with PasswordResetTokenManager
 * and VerificationCodeManager. Provides a secure multi-step flow for password recovery.
 *
 * Features:
 * - Email-based token request
 * - Token validation and verification
 * - Secure password reset with strength validation
 * - Rate limiting and security warnings
 * - Progress tracking and user feedback
 * - Integration with existing security managers
 */
import React from 'react';
export declare enum PasswordStrength {
    WEAK = "weak",
    FAIR = "fair",
    GOOD = "good",
    STRONG = "strong"

export declare enum ResetStep {
    REQUEST = "request",
    VERIFY = "verify",
    RESET = "reset",
    SUCCESS = "success"

export interface PasswordResetRequest {
    email: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;

export interface TokenVerification {
    token: string;
    email: string;

export interface PasswordResetData {
    token: string;
    newPassword: string;
    confirmPassword: string;

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

export interface PasswordResetFlowProps {
    onResetComplete?: (success: boolean, email: string) => void;
    onStepChange?: (step: ResetStep) => void;
    onSecurityEvent?: (event: string, details: any) => void;
    className?: string;
    brandName?: string;
    supportEmail?: string;
    customValidation?: (password: string) => PasswordValidation;

export declare const PasswordResetFlow: React.FC<PasswordResetFlowProps>;
export declare enum SecurityEvent {
    RESET_REQUESTED = "password_reset_requested",
    RESET_REQUEST_FAILED = "password_reset_request_failed",
    TOKEN_VERIFIED = "reset_token_verified",
    TOKEN_VERIFICATION_FAILED = "reset_token_verification_failed",
    PASSWORD_RESET_COMPLETED = "password_reset_completed",
    PASSWORD_RESET_FAILED = "password_reset_failed",
    RESET_CODE_RESENT = "reset_code_resent"

export default PasswordResetFlow;
//# sourceMappingURL=PasswordResetFlow.d.ts.map
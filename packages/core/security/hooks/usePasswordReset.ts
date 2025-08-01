/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

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
import { useState, useCallback, useRef, useEffect } from 'react';
import { passwordResetTokenManager } from '../PasswordResetTokenManager';
import { verificationCodeManager } from '../VerificationCodeManager';

// Types
export enum ResetStep { REQUEST = 'request',
  VERIFY = 'verify',
  RESET = 'reset',
  SUCCESS = 'success'
  export enum PasswordStrength {
  WEAK = 'weak',
  FAIR = 'fair',
  GOOD = 'good',
  STRONG = 'strong'
  export interface PasswordValidation {
  isValid: boolean;
  strength: PasswordStrength;
  score: number;
  feedback: string;
  requirements: { }
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;


};


export interface ResetToken { token: string;
  tokenId: string;
  expiresAt: Date }



export interface UsePasswordResetOptions { onStepChange?: (step: ResetStep) => void;
  onSecurityEvent?: (event: string, details: any) => void;
  onError?: (error: Error) => void;
  customValidation?: (password: string) => PasswordValidation;
  autoAdvance?: boolean;
  resendCooldown?: number; // seconds }




export interface UsePasswordResetReturn { // State
  currentStep: ResetStep;
  loading: boolean;
  error: string | null;
  success: string | null;
  // Form data
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
  // Validation
  passwordValidation: PasswordValidation;
  emailValid: boolean;
  tokenValid: boolean;
  passwordsMatch: boolean;
  // Timer state
  resendTimer: number;
  canResend: boolean;
  // Actions
  setEmail: (email: string) => void
  setToken: (token: string) => void
  setNewPassword: (password: string) => void
  setConfirmPassword: (password: string) => void;
  // Flow control
  requestReset: () => Promise<boolean>
  verifyToken: () => Promise<boolean>;
  resetPassword: () => Promise<boolean>
  resendCode: () => Promise<boolean>;
  goBack: () => void
  reset: () => void;
  // Utilities
  validatePassword: (password: string) => PasswordValidation
  getPasswordStrengthColor: (strength: PasswordStrength) => string }
  getPasswordStrengthWidth: (score: number) => string;


export const usePasswordReset = (options: UsePasswordResetOptions = {}): UsePasswordResetReturn => { const {
    onStepChange
    onSecurityEvent
    onError
    customValidation
    autoAdvance = true }
    resendCooldown = 60
 = options;
  // State
  const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.REQUEST);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Form data
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Internal state
  const [currentToken, setCurrentToken] = useState<ResetToken | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  // Refs
  const isMountedRef = useRef(true);
  const timerRef = useRef<NodeJS.Timeout>();
  // Cleanup
  useEffect(() => { return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current) };
  }, []);
  // Timer management
  useEffect(() => { if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer(prev => {)
  const newValue = prev - 1;
          if (newValue <= 0 && timerRef.current) {
            clearInterval(timerRef.current);
          return Math.max(0, newValue) });
      }, 1000);
    return () => { if (timerRef.current) {
        clearInterval(timerRef.current) };
  }, [resendTimer]);
  // Step change notification
  useEffect(() => { onStepChange?.(currentStep) }, [currentStep, onStepChange]);
  // Password validation function
  const validatePassword = useCallback((password: string): PasswordValidation => { if (customValidation) {
      return customValidation(password);
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password) }
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    const score = Object.values(requirements).filter(Boolean).length;
    const feedback: string = [];
    if (!requirements.length) feedback.push('Password must be at least 8 characters long');
    if (!requirements.uppercase) feedback.push('Add at least one uppercase letter');
    if (!requirements.lowercase) feedback.push('Add at least one lowercase letter');
    if (!requirements.numbers) feedback.push('Add at least one number');
    if (!requirements.symbols) feedback.push('Add at least one special character');
    let strength: PasswordStrength;
    if (score <= 2) strength = PasswordStrength.WEAK;
    else if (score === 3) strength = PasswordStrength.FAIR;
    else if (score === 4) strength = PasswordStrength.GOOD;
    else strength = PasswordStrength.STRONG;
    // Additional security checks
    if (password.length >= 12 && score >= 4) { strength = PasswordStrength.STRONG;
  // Check for common patterns
  if (/^(.)\1+$/.test(password)) {
  feedback.push('Avoid repeating characters');
  strength = PasswordStrength.WEAK;
  if (/^(012|123|234|345|456|567|678|789|890|abc|def|ghi|jkl|mno|pqr|stu|vwx|yza)/i.test(password)) {
  feedback.push('Avoid sequential characters');
  strength = PasswordStrength.WEAK;
  if (/^(password|123456|qwerty|abc123|admin|letmein|welcome|monkey|dragon)/i.test(password)) {
  feedback.push('Avoid common passwords');
  strength = PasswordStrength.WEAK;
  return {
  isValid: score >= 4 && password.length >= 8,
  strength,
  score: (score / 5) * 100,
  feedback }
  requirements
};
  }, [customValidation]);
  // Computed values
  const passwordValidation = validatePassword(newPassword);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const tokenValid = token.length >= 6;
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const canResend = resendTimer === 0 && !loading;
  // Helper functions
  const handleError = useCallback((err: Error | string) => { const errorObj = err instanceof Error ? err : new Error(err);
  if (isMountedRef.current) {
  setError(errorObj.message);
  onError?.(errorObj) }, [onError]);
  const clearMessages = useCallback(() => { setError(null);
    setSuccess(null) }, []);
  const logSecurityEvent = useCallback((event: string, details: any) => { onSecurityEvent?.(event, {)
  ...details,
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  ipAddress: '192.168.1.100' // Would be detected from client }
});
  }, [onSecurityEvent]);
  // Main actions
  const requestReset = useCallback(async (): Promise<boolean> => {
    if (!emailValid) {
      handleError('Please enter a valid email address');
      return false;
    setLoading(true);
    clearMessages();
    try {
      const result = await passwordResetTokenManager.generateToken({)
  userId: `user_${email.replace('@', '_').replace('.', '_')}`, // Mock user ID}
        email
        type: 'password_reset' as any
        ipAddress: '192.168.1.100'
        userAgent: navigator.userAgent
        expirationMinutes: 30;
  });
      if (!result) { throw new Error('Failed to send reset code. Please try again later.');
  setCurrentToken({)
  token: result.token
  tokenId: result.tokenId
  expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes }
});
      setSuccess(`Reset code sent to ${email}`);}
      setResendTimer(resendCooldown);
      logSecurityEvent('password_reset_requested', { )
  email
  tokenId: result.tokenId }
});
      if (autoAdvance) { setCurrentStep(ResetStep.VERIFY);
      return true } catch (err) { handleError(err instanceof Error ? err : new Error('Failed to send reset code'));
  logSecurityEvent('password_reset_request_failed', {)
  email
  error: err instanceof Error ? err.message : 'Unknown error' }
});
      return false;
 finally { if (isMountedRef.current) {
        setLoading(false) }, [email, emailValid, handleError, clearMessages, logSecurityEvent, autoAdvance, resendCooldown]);
  const verifyToken = useCallback(async (): Promise<boolean> => { if (!tokenValid) {
  handleError('Please enter a valid reset code');
  return false;
  if (!currentToken) {
  handleError('No active reset request found');
  return false;
  setLoading(true);
  clearMessages();
  try {
  const validation = await passwordResetTokenManager.validateToken(;);
  currentToken.token
  '192.168.1.100'
  navigator.userAgent
  );
  if (!validation.valid) {
  throw new Error(validation.reason || 'Invalid or expired reset code');
  setSuccess('Code verified successfully');
  logSecurityEvent('reset_token_verified', {)
  email
  tokenId: currentToken.tokenId
  riskScore: validation.riskScore }
});
      if (autoAdvance) { setCurrentStep(ResetStep.RESET);
      return true } catch (err) { handleError(err instanceof Error ? err : new Error('Failed to verify code'));
  logSecurityEvent('reset_token_verification_failed', {)
  email
  error: err instanceof Error ? err.message : 'Unknown error' }
});
      return false;
 finally { if (isMountedRef.current) {
        setLoading(false) }, [token, tokenValid, currentToken, handleError, clearMessages, logSecurityEvent, email, autoAdvance]);
  const resetPassword = useCallback(async (): Promise<boolean> => { if (!passwordValidation.isValid) {
  handleError('Password does not meet security requirements');
  return false;
  if (!passwordsMatch) {
  handleError('Passwords do not match');
  return false;
  if (!currentToken) {
  handleError('No active reset session found');
  return false;
  setLoading(true);
  clearMessages();
  try {
  const usage = await passwordResetTokenManager.useToken(;);
  currentToken.token
  '192.168.1.100'
  navigator.userAgent
  );
  if (!usage.success) {
  throw new Error(usage.reason || 'Failed to validate reset token');
  // In a real implementation, this would call a password update API
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
  setSuccess('Password reset successfully');
  logSecurityEvent('password_reset_completed', {)
  email
  tokenId: currentToken.tokenId
  passwordStrength: passwordValidation.strength }
});
      if (autoAdvance) { setCurrentStep(ResetStep.SUCCESS);
      return true } catch (err) { handleError(err instanceof Error ? err : new Error('Failed to reset password'));
  logSecurityEvent('password_reset_failed', {)
  email
  error: err instanceof Error ? err.message : 'Unknown error' }
});
      return false;
 finally { if (isMountedRef.current) {
        setLoading(false) }, [passwordValidation, passwordsMatch, currentToken, handleError, clearMessages, logSecurityEvent, email, autoAdvance, newPassword]);
  const resendCode = useCallback(async (): Promise<boolean> => {
    if (!canResend) {
      return false;
    setLoading(true);
    clearMessages();
    try {
      const result = await passwordResetTokenManager.generateToken({)
  userId: `user_${email.replace('@', '_').replace('.', '_')}`}

        email
        type: 'password_reset' as any
        ipAddress: '192.168.1.100'
        userAgent: navigator.userAgent
        expirationMinutes: 30;
  });
      if (!result) { throw new Error('Failed to resend reset code');
  setCurrentToken({)
  token: result.token
  tokenId: result.tokenId
  expiresAt: new Date(Date.now() + 30 * 60 * 1000) }
});
      setSuccess('New reset code sent');
      setResendTimer(resendCooldown);
      logSecurityEvent('reset_code_resent', { )
  email
  tokenId: result.tokenId }
});
      return true;
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to resend code'));
  return false } finally { if (isMountedRef.current) {
        setLoading(false) }, [canResend, email, handleError, clearMessages, logSecurityEvent, resendCooldown]);
  const goBack = useCallback(() => { clearMessages();
    if (currentStep === ResetStep.VERIFY) {
      setCurrentStep(ResetStep.REQUEST) } else if (currentStep === ResetStep.RESET) { setCurrentStep(ResetStep.VERIFY) }, [currentStep, clearMessages]);
  const reset = useCallback(() => { setCurrentStep(ResetStep.REQUEST);
    setEmail('');
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentToken(null);
    setResendTimer(0);
    clearMessages();
    setLoading(false) }, [clearMessages]);
  // Utility functions
  const getPasswordStrengthColor = useCallback((strength: PasswordStrength): string => { switch (strength) {
  case PasswordStrength.WEAK: return 'text-red-600 bg-red-100';
  case PasswordStrength.FAIR: return 'text-orange-600 bg-orange-100';
  case PasswordStrength.GOOD: return 'text-blue-600 bg-blue-100';
  case PasswordStrength.STRONG: return 'text-green-600 bg-green-100' }
  default: return 'text-gray-600 bg-gray-100';
}, []);
  const getPasswordStrengthWidth = useCallback((score: number): string => {
    return `${Math.max(score, 10)}%`;}
  }, []);
  return { // State
    currentStep
    loading
    error
    success
    // Form data
    email
    token
    newPassword
    confirmPassword
    // Validation
    passwordValidation
    emailValid
    tokenValid
    passwordsMatch
    // Timer state
    resendTimer
    canResend
    // Actions
    setEmail
    setToken
    setNewPassword
    setConfirmPassword
    // Flow control
    requestReset
    verifyToken
    resetPassword
    resendCode
    goBack
    reset
    // Utilities
    validatePassword
    getPasswordStrengthColor }
    getPasswordStrengthWidth
  };
};

export default usePasswordReset;
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
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, 
  Key, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Clock, 
  RefreshCw, 
  ArrowLeft,
  Lock,
  UserCheck,
  AlertCircle
} from 'lucide-react';

// Password strength levels
export enum PasswordStrength {
  WEAK = 'weak',
  FAIR = 'fair',
  GOOD = 'good',
  STRONG = 'strong'
  // Reset flow steps
  export enum ResetStep {
  REQUEST = 'request',
  VERIFY = 'verify',
  RESET = 'reset',
  SUCCESS = 'success'
  // Component interfaces
  export interface PasswordResetRequest {
  email: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}
export interface TokenVerification {
  token: string;,
  email: string;
}
export interface PasswordResetData {
  token: string;,
  newPassword: string;
  confirmPassword: string;
}
export interface PasswordValidation {
  isValid: boolean;,
  strength: PasswordStrength;
  score: number;,
  feedback: string;
  requirements: {,
  length: boolean;,
  uppercase: boolean;
  lowercase: boolean;,
  numbers: boolean;
  symbols: boolean;
};
}
export interface PasswordResetFlowProps {
  onResetComplete?: (success: boolean, email: string) => void;
  onStepChange?: (step: ResetStep) => void;
  onSecurityEvent?: (event: string, details: any) => void;
  className?: string;
  brandName?: string;
  supportEmail?: string;
  customValidation?: (password: string) => PasswordValidation;
}
export const PasswordResetFlow: React.FC<PasswordResetFlowProps> = ({)
  onResetComplete,
  onStepChange,
  onSecurityEvent,
  className = '',
  brandName = 'Your App',
  supportEmail = 'support@example.com',
  customValidation
}) => {
  // State management
  const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.REQUEST);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [tokenSent, setTokenSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  // Password validation
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({)
  isValid: false,
  strength: PasswordStrength.WEAK,
  score: 0,
  feedback: [],
  requirements: {,
  length: false,
  uppercase: false,
  lowercase: false,
  numbers: false,
  symbols: false,
});
  // Timer for resend cooldown
  useEffect(() => {
  let interval: NodeJS.Timeout;
  if (resendTimer > 0) {
  interval = setInterval(() => {
  setResendTimer(prev => prev - 1);
}, 1000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);
  // Step change notification
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);
  // Password validation
  useEffect(() => {
  if (newPassword) {
  const validation = customValidation ? ;
  customValidation(newPassword) :,
  validatePassword(newPassword);
  setPasswordValidation(validation);
}, [newPassword, customValidation]);
  // Default password validation
  const validatePassword = (password: string): PasswordValidation => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
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
    if (password.length >= 12 && score >= 4) {
  strength = PasswordStrength.STRONG;
  // Check for common patterns
  if (/^(.)\1+$/.test(password)) {
  feedback.push('Avoid repeating characters');
  strength = PasswordStrength.WEAK;
  if (/^(012|123|234|345|456|567|678|789|890|abc|def|ghi|jkl|mno|pqr|stu|vwx|yza)/i.test(password)) {
  feedback.push('Avoid sequential characters');
  strength = PasswordStrength.WEAK;
  return {
  isValid: score >= 4 && password.length >= 8,
  strength,
  score: (score / 5) * 100,
  feedback,
  requirements
};
  };
  // API simulation helpers (replace with actual API calls)
  const requestPasswordReset = async (requestData: PasswordResetRequest): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    // Mock validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.email)) {
      throw new Error('Please enter a valid email address');
    // Mock rate limiting
    if (requestData.email === 'blocked@example.com') {
      throw new Error('Too many reset requests. Please try again later.');
    return true;
  };
  const verifyResetToken = async (verification: TokenVerification): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock token validation
    if (verification.token.length < 6) {
      throw new Error('Please enter a valid reset code');
    if (verification.token === '000000') {
      throw new Error('Invalid or expired reset code');
    return true;
  };
  const resetPassword = async (resetData: PasswordResetData): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  // Validate passwords match
  if (resetData.newPassword !== resetData.confirmPassword) {
  throw new Error('Passwords do not match');
  // Validate password strength
  const validation = customValidation ? ;
  customValidation(resetData.newPassword) :,
  validatePassword(resetData.newPassword);
  if (!validation.isValid) {
  throw new Error('Password does not meet security requirements');
  return true;
};
  // Event handlers
  const handleRequestReset = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
  const requestData: PasswordResetRequest = {,
  email,
  ipAddress: '192.168.1.100', // Would be detected from client,
  userAgent: navigator.userAgent,
  metadata: {,
  timestamp: new Date().toISOString(),
  referrer: document.referrer,
};
      await requestPasswordReset(requestData);
      setTokenSent(true);
      setSuccess(`Reset code sent to ${email}`);}
      setResendTimer(60); // 60 second cooldown
      setCurrentStep(ResetStep.VERIFY);
      onSecurityEvent?.(SecurityEvent.RESET_REQUESTED, {)
  email,
  timestamp: new Date(),
});
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to send reset code');
  onSecurityEvent?.(SecurityEvent.RESET_REQUEST_FAILED, {)
  email,
  error: err instanceof Error ? err.message : 'Unknown error',
});
    } finally {
      setLoading(false);
  };
  const handleVerifyToken = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
  const verification: TokenVerification = {,
  token,
  email
};
      await verifyResetToken(verification);
      setSuccess('Code verified successfully');
      setCurrentStep(ResetStep.RESET);
      onSecurityEvent?.(SecurityEvent.TOKEN_VERIFIED, {)
  email,
  timestamp: new Date(),
});
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to verify code');
  onSecurityEvent?.(SecurityEvent.TOKEN_VERIFICATION_FAILED, {)
  email,
  error: err instanceof Error ? err.message : 'Unknown error',
});
    } finally {
      setLoading(false);
  };
  const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
  const resetData: PasswordResetData = {,
  token,
  newPassword,
  confirmPassword
};
      await resetPassword(resetData);
      setCurrentStep(ResetStep.SUCCESS);
      onResetComplete?.(true, email);
      onSecurityEvent?.(SecurityEvent.PASSWORD_RESET_COMPLETED, {)
  email,
  timestamp: new Date(),
});
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to reset password');
  onSecurityEvent?.(SecurityEvent.PASSWORD_RESET_FAILED, {)
  email,
  error: err instanceof Error ? err.message : 'Unknown error',
});
    } finally {
      setLoading(false);
  };
  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      await requestPasswordReset({ email });
      setSuccess('New reset code sent');
      setResendTimer(60);
      onSecurityEvent?.(SecurityEvent.RESET_CODE_RESENT, {)
  email,
  timestamp: new Date(),
});
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to resend code');
} finally {
      setLoading(false);
  };
  const handleGoBack = () => {
    setError('');
    setSuccess('');
    if (currentStep === ResetStep.VERIFY) {
      setCurrentStep(ResetStep.REQUEST);
    } else if (currentStep === ResetStep.RESET) {
      setCurrentStep(ResetStep.VERIFY);
  };
  const getPasswordStrengthColor = (strength: PasswordStrength) => {
  switch (strength) {
  case PasswordStrength.WEAK: return 'text-red-600 bg-red-100';
  case PasswordStrength.FAIR: return 'text-orange-600 bg-orange-100';
  case PasswordStrength.GOOD: return 'text-blue-600 bg-blue-100';
  case PasswordStrength.STRONG: return 'text-green-600 bg-green-100';,
  default: return 'text-gray-600 bg-gray-100';
};
  const getPasswordStrengthWidth = (score: number) => {
    return `${Math.max(score, 10)}%`;}
  };
  return;
    <div className={`max-w-md mx-auto bg-white rounded-lg shadow-lg ${className}`}>}
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Key className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
            <p className="text-sm text-gray-600">
              {currentStep === ResetStep.REQUEST && 'Enter your email to get started'}
              {currentStep === ResetStep.VERIFY && 'Enter the code sent to your email'}
              {currentStep === ResetStep.RESET && 'Create your new password'}
              {currentStep === ResetStep.SUCCESS && 'Password reset successful'}
            </p>
          </div>
        </div>
      </div>
      {/* Progress Indicator */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className={`flex items-center space-x-2 ${
  currentStep === ResetStep.REQUEST ? 'text-blue-600' :,
  ['verify', 'reset', 'success'].includes(currentStep) ? 'text-green-600' : 'text-gray-400',
}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
  currentStep === ResetStep.REQUEST ? 'bg-blue-600 text-white' :,
  ['verify', 'reset', 'success'].includes(currentStep) ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600',
}`}>
              {['verify', 'reset', 'success'].includes(currentStep) ? '✓' : '1'}
            </div>
            <span>Request</span>
          </div>
          <div className={`w-8 h-0.5 ${
  ['verify', 'reset', 'success'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-300',
}`} />
          <div className={`flex items-center space-x-2 ${
  currentStep === ResetStep.VERIFY ? 'text-blue-600' :,
  ['reset', 'success'].includes(currentStep) ? 'text-green-600' : 'text-gray-400',
}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
  currentStep === ResetStep.VERIFY ? 'bg-blue-600 text-white' :,
  ['reset', 'success'].includes(currentStep) ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600',
}`}>
              {['reset', 'success'].includes(currentStep) ? '✓' : '2'}
            </div>
            <span>Verify</span>
          </div>
          <div className={`w-8 h-0.5 ${
  ['reset', 'success'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-300',
}`} />
          <div className={`flex items-center space-x-2 ${
  currentStep === ResetStep.RESET ? 'text-blue-600' :,
  currentStep === ResetStep.SUCCESS ? 'text-green-600' : 'text-gray-400',
}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
  currentStep === ResetStep.RESET ? 'bg-blue-600 text-white' :,
  currentStep === ResetStep.SUCCESS ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600',
}`}>
              {currentStep === ResetStep.SUCCESS ? '✓' : '3'}
            </div>
            <span>Reset</span>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="p-6">
        {/* Error Message */}
        {error && ()
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}
        {/* Success Message */}
        {success && ()
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}
        {/* Step 1: Request Reset */}
        {currentStep === ResetStep.REQUEST && ()
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                We'll send a reset code to this email address
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? ()
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending Code...
                </>
              ) : ()
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reset Code
                </>
              )}
            </button>
          </form>
        )}
        {/* Step 2: Verify Token */}
        {currentStep === ResetStep.VERIFY && ()
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">
                We sent a 6-digit code to<br />
                <span className="font-medium text-gray-900">{email}</span>
              </p>
            </div>
            <form onSubmit={handleVerifyToken} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                  Reset Code
                </label>
                <input
                  type="text"
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the 6-digit code from your email
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || token.length !== 6}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? ()
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : ()
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Code
                  </>
                )}
              </button>
            </form>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading || resendTimer > 0}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? ()
                  <>
                    <Clock className="w-4 h-4 inline mr-1" />
                    Resend in {resendTimer}s
                  </>
                ) : ()
                  'Resend Code'
                )}
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Email
              </button>
            </div>
          </div>
        )}
        {/* Step 3: Reset Password */}
        {currentStep === ResetStep.RESET && ()
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {/* Password Strength Indicator */}
            {newPassword && ()
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Password Strength</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPasswordStrengthColor(passwordValidation.strength)}`}>}
                    {passwordValidation.strength.toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
  passwordValidation.strength === PasswordStrength.WEAK ? 'bg-red-500' :,
  passwordValidation.strength === PasswordStrength.FAIR ? 'bg-orange-500' :,
  passwordValidation.strength === PasswordStrength.GOOD ? 'bg-blue-500' : 'bg-green-500',
}`}
                    style={{ width: getPasswordStrengthWidth(passwordValidation.score) }}
                  />
                </div>
                {/* Password Requirements */}
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {Object.entries(passwordValidation.requirements).map(([requirement, met]) => ()
                    <div key={requirement} className={`flex items-center space-x-2 ${met ? 'text-green-600' : 'text-gray-400'}`}>}
                      {met ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>
                        {requirement === 'length' && 'At least 8 characters'}
                        {requirement === 'uppercase' && 'One uppercase letter'}
                        {requirement === 'lowercase' && 'One lowercase letter'}
                        {requirement === 'numbers' && 'One number'}
                        {requirement === 'symbols' && 'One special character'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && ()
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !passwordValidation.isValid || newPassword !== confirmPassword}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? ()
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resetting Password...
                </>
              ) : ()
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </>
              )}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Verification
              </button>
            </div>
          </form>
        )}
        {/* Step 4: Success */}
        {currentStep === ResetStep.SUCCESS && ()
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Password Reset Successful</h3>
              <p className="text-sm text-gray-600 mt-2">
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Go to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Need help? Contact{' '}
          <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:text-blue-700">}
            {supportEmail}
          </a>
        </p>
      </div>
    </div>
  );
};

// Security events for logging
export enum SecurityEvent {
  RESET_REQUESTED = 'password_reset_requested',
  RESET_REQUEST_FAILED = 'password_reset_request_failed',
  TOKEN_VERIFIED = 'reset_token_verified',
  TOKEN_VERIFICATION_FAILED = 'reset_token_verification_failed',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',
  PASSWORD_RESET_FAILED = 'password_reset_failed',
  RESET_CODE_RESENT = 'reset_code_resent'

export default PasswordResetFlow;
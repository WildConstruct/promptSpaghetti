import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { useState, useEffect } from 'react';
import { Mail, Key, Shield, AlertTriangle, CheckCircle, Eye, EyeOff, Clock, RefreshCw, ArrowLeft, Lock, UserCheck, AlertCircle } from 'lucide-react';
// Password strength levels
export var PasswordStrength;
(function (PasswordStrength) {
    PasswordStrength["WEAK"] = "weak";
    PasswordStrength["FAIR"] = "fair";
    PasswordStrength["GOOD"] = "good";
    PasswordStrength["STRONG"] = "strong";
})(PasswordStrength || (PasswordStrength = {}));
// Reset flow steps
export var ResetStep;
(function (ResetStep) {
    ResetStep["REQUEST"] = "request";
    ResetStep["VERIFY"] = "verify";
    ResetStep["RESET"] = "reset";
    ResetStep["SUCCESS"] = "success";
})(ResetStep || (ResetStep = {}));
export const PasswordResetFlow = ({ onResetComplete, onStepChange, onSecurityEvent, className = '', brandName = 'Your App', supportEmail = 'support@example.com', customValidation }) => {
    // State management
    const [currentStep, setCurrentStep] = useState(ResetStep.REQUEST);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tokenSent, setTokenSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    // Password validation
    const [passwordValidation, setPasswordValidation] = useState({
        isValid: false,
        strength: PasswordStrength.WEAK,
        score: 0,
        feedback: [],
        requirements: {
            length: false,
            uppercase: false,
            lowercase: false,
            numbers: false,
            symbols: false
        }
    });
    // Timer for resend cooldown
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [resendTimer]);
    // Step change notification
    useEffect(() => {
        onStepChange?.(currentStep);
    }, [currentStep, onStepChange]);
    // Password validation
    useEffect(() => {
        if (newPassword) {
            const validation = customValidation ?
                customValidation(newPassword) :
                validatePassword(newPassword);
            setPasswordValidation(validation);
        }
    }, [newPassword, customValidation]);
    // Default password validation
    const validatePassword = (password) => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /\d/.test(password),
            symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        const score = Object.values(requirements).filter(Boolean).length;
        const feedback = [];
        if (!requirements.length)
            feedback.push('Password must be at least 8 characters long');
        if (!requirements.uppercase)
            feedback.push('Add at least one uppercase letter');
        if (!requirements.lowercase)
            feedback.push('Add at least one lowercase letter');
        if (!requirements.numbers)
            feedback.push('Add at least one number');
        if (!requirements.symbols)
            feedback.push('Add at least one special character');
        let strength;
        if (score <= 2)
            strength = PasswordStrength.WEAK;
        else if (score === 3)
            strength = PasswordStrength.FAIR;
        else if (score === 4)
            strength = PasswordStrength.GOOD;
        else
            strength = PasswordStrength.STRONG;
        // Additional security checks
        if (password.length >= 12 && score >= 4) {
            strength = PasswordStrength.STRONG;
        }
        // Check for common patterns
        if (/^(.)\1+$/.test(password)) {
            feedback.push('Avoid repeating characters');
            strength = PasswordStrength.WEAK;
        }
        if (/^(012|123|234|345|456|567|678|789|890|abc|def|ghi|jkl|mno|pqr|stu|vwx|yza)/i.test(password)) {
            feedback.push('Avoid sequential characters');
            strength = PasswordStrength.WEAK;
        }
        return {
            isValid: score >= 4 && password.length >= 8,
            strength,
            score: (score / 5) * 100,
            feedback,
            requirements
        };
    };
    // API simulation helpers (replace with actual API calls)
    const requestPasswordReset = async (requestData) => {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        // Mock validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(requestData.email)) {
            throw new Error('Please enter a valid email address');
        }
        // Mock rate limiting
        if (requestData.email === 'blocked@example.com') {
            throw new Error('Too many reset requests. Please try again later.');
        }
        return true;
    };
    const verifyResetToken = async (verification) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock token validation
        if (verification.token.length < 6) {
            throw new Error('Please enter a valid reset code');
        }
        if (verification.token === '000000') {
            throw new Error('Invalid or expired reset code');
        }
        return true;
    };
    const resetPassword = async (resetData) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Validate passwords match
        if (resetData.newPassword !== resetData.confirmPassword) {
            throw new Error('Passwords do not match');
        }
        // Validate password strength
        const validation = customValidation ?
            customValidation(resetData.newPassword) :
            validatePassword(resetData.newPassword);
        if (!validation.isValid) {
            throw new Error('Password does not meet security requirements');
        }
        return true;
    };
    // Event handlers
    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const requestData = {
                email,
                ipAddress: '192.168.1.100', // Would be detected from client
                userAgent: navigator.userAgent,
                metadata: {
                    timestamp: new Date().toISOString(),
                    referrer: document.referrer
                }
            };
            await requestPasswordReset(requestData);
            setTokenSent(true);
            setSuccess(`Reset code sent to ${email}`);
            setResendTimer(60); // 60 second cooldown
            setCurrentStep(ResetStep.VERIFY);
            onSecurityEvent?.(SecurityEvent.RESET_REQUESTED, {
                email,
                timestamp: new Date()
            });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reset code');
            onSecurityEvent?.(SecurityEvent.RESET_REQUEST_FAILED, {
                email,
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleVerifyToken = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const verification = {
                token,
                email
            };
            await verifyResetToken(verification);
            setSuccess('Code verified successfully');
            setCurrentStep(ResetStep.RESET);
            onSecurityEvent?.(SecurityEvent.TOKEN_VERIFIED, {
                email,
                timestamp: new Date()
            });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to verify code');
            onSecurityEvent?.(SecurityEvent.TOKEN_VERIFICATION_FAILED, {
                email,
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const resetData = {
                token,
                newPassword,
                confirmPassword
            };
            await resetPassword(resetData);
            setCurrentStep(ResetStep.SUCCESS);
            onResetComplete?.(true, email);
            onSecurityEvent?.(SecurityEvent.PASSWORD_RESET_COMPLETED, {
                email,
                timestamp: new Date()
            });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password');
            onSecurityEvent?.(SecurityEvent.PASSWORD_RESET_FAILED, {
                email,
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleResendCode = async () => {
        if (resendTimer > 0)
            return;
        setError('');
        setLoading(true);
        try {
            await requestPasswordReset({ email });
            setSuccess('New reset code sent');
            setResendTimer(60);
            onSecurityEvent?.(SecurityEvent.RESET_CODE_RESENT, {
                email,
                timestamp: new Date()
            });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resend code');
        }
        finally {
            setLoading(false);
        }
    };
    const handleGoBack = () => {
        setError('');
        setSuccess('');
        if (currentStep === ResetStep.VERIFY) {
            setCurrentStep(ResetStep.REQUEST);
        }
        else if (currentStep === ResetStep.RESET) {
            setCurrentStep(ResetStep.VERIFY);
        }
    };
    const getPasswordStrengthColor = (strength) => {
        switch (strength) {
            case PasswordStrength.WEAK: return 'text-red-600 bg-red-100';
            case PasswordStrength.FAIR: return 'text-orange-600 bg-orange-100';
            case PasswordStrength.GOOD: return 'text-blue-600 bg-blue-100';
            case PasswordStrength.STRONG: return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getPasswordStrengthWidth = (score) => {
        return `${Math.max(score, 10)}%`;
    };
    return (_jsxs("div", { className: `max-w-md mx-auto bg-white rounded-lg shadow-lg ${className}`, children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Key, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Reset Password" }), _jsxs("p", { className: "text-sm text-gray-600", children: [currentStep === ResetStep.REQUEST && 'Enter your email to get started', currentStep === ResetStep.VERIFY && 'Enter the code sent to your email', currentStep === ResetStep.RESET && 'Create your new password', currentStep === ResetStep.SUCCESS && 'Password reset successful'] })] })] }) }), _jsx("div", { className: "px-6 py-4 bg-gray-50", children: _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("div", { className: `flex items-center space-x-2 ${currentStep === ResetStep.REQUEST ? 'text-blue-600' :
                                ['verify', 'reset', 'success'].includes(currentStep) ? 'text-green-600' : 'text-gray-400'}`, children: [_jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep === ResetStep.REQUEST ? 'bg-blue-600 text-white' :
                                        ['verify', 'reset', 'success'].includes(currentStep) ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`, children: ['verify', 'reset', 'success'].includes(currentStep) ? '✓' : '1' }), _jsx("span", { children: "Request" })] }), _jsx("div", { className: `w-8 h-0.5 ${['verify', 'reset', 'success'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-300'}` }), _jsxs("div", { className: `flex items-center space-x-2 ${currentStep === ResetStep.VERIFY ? 'text-blue-600' :
                                ['reset', 'success'].includes(currentStep) ? 'text-green-600' : 'text-gray-400'}`, children: [_jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep === ResetStep.VERIFY ? 'bg-blue-600 text-white' :
                                        ['reset', 'success'].includes(currentStep) ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`, children: ['reset', 'success'].includes(currentStep) ? '✓' : '2' }), _jsx("span", { children: "Verify" })] }), _jsx("div", { className: `w-8 h-0.5 ${['reset', 'success'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-300'}` }), _jsxs("div", { className: `flex items-center space-x-2 ${currentStep === ResetStep.RESET ? 'text-blue-600' :
                                currentStep === ResetStep.SUCCESS ? 'text-green-600' : 'text-gray-400'}`, children: [_jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep === ResetStep.RESET ? 'bg-blue-600 text-white' :
                                        currentStep === ResetStep.SUCCESS ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`, children: currentStep === ResetStep.SUCCESS ? '✓' : '3' }), _jsx("span", { children: "Reset" })] })] }) }), _jsxs("div", { className: "p-6", children: [error && (_jsxs("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" }), _jsx("div", { children: _jsx("p", { className: "text-sm text-red-800", children: error }) })] })), success && (_jsxs("div", { className: "mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" }), _jsx("div", { children: _jsx("p", { className: "text-sm text-green-800", children: success }) })] })), currentStep === ResetStep.REQUEST && (_jsxs("form", { onSubmit: handleRequestReset, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-2", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { type: "email", id: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500", placeholder: "Enter your email", required: true, disabled: loading })] }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "We'll send a reset code to this email address" })] }), _jsx("button", { type: "submit", disabled: loading || !email, className: "w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Sending Code..."] })) : (_jsxs(_Fragment, { children: [_jsx(Mail, { className: "w-4 h-4 mr-2" }), "Send Reset Code"] })) })] })), currentStep === ResetStep.VERIFY && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(Mail, { className: "w-8 h-8 text-blue-600" }) }), _jsxs("p", { className: "text-sm text-gray-600", children: ["We sent a 6-digit code to", _jsx("br", {}), _jsx("span", { className: "font-medium text-gray-900", children: email })] })] }), _jsxs("form", { onSubmit: handleVerifyToken, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "token", className: "block text-sm font-medium text-gray-700 mb-2", children: "Reset Code" }), _jsx("input", { type: "text", id: "token", value: token, onChange: (e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6)), className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono", placeholder: "000000", maxLength: 6, required: true, disabled: loading }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Enter the 6-digit code from your email" })] }), _jsx("button", { type: "submit", disabled: loading || token.length !== 6, className: "w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Verifying..."] })) : (_jsxs(_Fragment, { children: [_jsx(Shield, { className: "w-4 h-4 mr-2" }), "Verify Code"] })) })] }), _jsx("div", { className: "text-center", children: _jsx("button", { type: "button", onClick: handleResendCode, disabled: loading || resendTimer > 0, className: "text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed", children: resendTimer > 0 ? (_jsxs(_Fragment, { children: [_jsx(Clock, { className: "w-4 h-4 inline mr-1" }), "Resend in ", resendTimer, "s"] })) : ('Resend Code') }) }), _jsx("div", { className: "text-center", children: _jsxs("button", { type: "button", onClick: handleGoBack, className: "inline-flex items-center text-sm text-gray-600 hover:text-gray-700", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-1" }), "Back to Email"] }) })] })), currentStep === ResetStep.RESET && (_jsxs("form", { onSubmit: handleResetPassword, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "newPassword", className: "block text-sm font-medium text-gray-700 mb-2", children: "New Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { type: showPassword ? 'text' : 'password', id: "newPassword", value: newPassword, onChange: (e) => setNewPassword(e.target.value), className: "pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500", placeholder: "Enter new password", required: true, disabled: loading }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600", children: showPassword ? _jsx(EyeOff, { className: "w-5 h-5" }) : _jsx(Eye, { className: "w-5 h-5" }) })] })] }), newPassword && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-gray-600", children: "Password Strength" }), _jsx("span", { className: `text-xs px-2 py-1 rounded-full font-medium ${getPasswordStrengthColor(passwordValidation.strength)}`, children: passwordValidation.strength.toUpperCase() })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all duration-300 ${passwordValidation.strength === PasswordStrength.WEAK ? 'bg-red-500' :
                                                passwordValidation.strength === PasswordStrength.FAIR ? 'bg-orange-500' :
                                                    passwordValidation.strength === PasswordStrength.GOOD ? 'bg-blue-500' : 'bg-green-500'}`, style: { width: getPasswordStrengthWidth(passwordValidation.score) } }) }), _jsx("div", { className: "grid grid-cols-1 gap-1 text-xs", children: Object.entries(passwordValidation.requirements).map(([requirement, met]) => (_jsxs("div", { className: `flex items-center space-x-2 ${met ? 'text-green-600' : 'text-gray-400'}`, children: [met ? _jsx(CheckCircle, { className: "w-3 h-3" }) : _jsx(AlertCircle, { className: "w-3 h-3" }), _jsxs("span", { children: [requirement === 'length' && 'At least 8 characters', requirement === 'uppercase' && 'One uppercase letter', requirement === 'lowercase' && 'One lowercase letter', requirement === 'numbers' && 'One number', requirement === 'symbols' && 'One special character'] })] }, requirement))) })] })), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium text-gray-700 mb-2", children: "Confirm Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { type: showConfirmPassword ? 'text' : 'password', id: "confirmPassword", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500", placeholder: "Confirm new password", required: true, disabled: loading }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600", children: showConfirmPassword ? _jsx(EyeOff, { className: "w-5 h-5" }) : _jsx(Eye, { className: "w-5 h-5" }) })] }), confirmPassword && newPassword !== confirmPassword && (_jsx("p", { className: "mt-1 text-xs text-red-600", children: "Passwords do not match" }))] }), _jsx("button", { type: "submit", disabled: loading || !passwordValidation.isValid || newPassword !== confirmPassword, className: "w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Resetting Password..."] })) : (_jsxs(_Fragment, { children: [_jsx(Key, { className: "w-4 h-4 mr-2" }), "Reset Password"] })) }), _jsx("div", { className: "text-center", children: _jsxs("button", { type: "button", onClick: handleGoBack, className: "inline-flex items-center text-sm text-gray-600 hover:text-gray-700", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-1" }), "Back to Verification"] }) })] })), currentStep === ResetStep.SUCCESS && (_jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto", children: _jsx(CheckCircle, { className: "w-8 h-8 text-green-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Password Reset Successful" }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: "Your password has been updated successfully. You can now sign in with your new password." })] }), _jsx("div", { className: "pt-4", children: _jsxs("button", { onClick: () => window.location.href = '/login', className: "w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500", children: [_jsx(UserCheck, { className: "w-4 h-4 mr-2" }), "Go to Sign In"] }) })] }))] }), _jsx("div", { className: "px-6 py-4 bg-gray-50 border-t border-gray-200", children: _jsxs("p", { className: "text-xs text-gray-500 text-center", children: ["Need help? Contact", ' ', _jsx("a", { href: `mailto:${supportEmail}`, className: "text-blue-600 hover:text-blue-700", children: supportEmail })] }) })] }));
};
// Security events for logging
export var SecurityEvent;
(function (SecurityEvent) {
    SecurityEvent["RESET_REQUESTED"] = "password_reset_requested";
    SecurityEvent["RESET_REQUEST_FAILED"] = "password_reset_request_failed";
    SecurityEvent["TOKEN_VERIFIED"] = "reset_token_verified";
    SecurityEvent["TOKEN_VERIFICATION_FAILED"] = "reset_token_verification_failed";
    SecurityEvent["PASSWORD_RESET_COMPLETED"] = "password_reset_completed";
    SecurityEvent["PASSWORD_RESET_FAILED"] = "password_reset_failed";
    SecurityEvent["RESET_CODE_RESENT"] = "reset_code_resent";
})(SecurityEvent || (SecurityEvent = {}));
export default PasswordResetFlow;

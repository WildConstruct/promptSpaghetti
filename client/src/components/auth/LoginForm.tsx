// Epic 11 Login Form Component
// React frontend for the login system with comprehensive error handling

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useLoginAnalytics } from '../../hooks/useLoginAnalytics';

// Login form validation schema
const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  rememberMe: z.boolean()
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  showRegistrationLink?: boolean;
  showForgotPasswordLink?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  redirectTo = '/dashboard',
  showRegistrationLink = true,
  showForgotPasswordLink = true
}) => {
  const { login, isLoading, error: authError } = useAuth();
  const { trackFormInteraction, trackLoginAttempt } = useLoginAnalytics();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  // Track form focus events
  useEffect(() => {
    trackFormInteraction('login_form_viewed');
  }, [trackFormInteraction]);

  // Handle lockout timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutTimeRemaining > 0) {
      timer = setTimeout(() => {
        setLockoutTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [lockoutTimeRemaining]);

  const validateField = (field: keyof LoginFormData, value: any): string | undefined => {
    try {
      const fieldSchema = loginSchema.shape[field];
      fieldSchema.parse(value);
      return undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message;
      }
      return 'Invalid value';
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Track field interactions
    trackFormInteraction(`login_${field}_changed`);
  };

  const handleInputBlur = (field: keyof LoginFormData) => {
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
    trackFormInteraction(`login_${field}_blurred`);
  };

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      onError?.('Account is temporarily locked. Please try again later.');
      return;
    }

    if (!validateForm()) {
      trackFormInteraction('login_validation_failed');
      return;
    }

    setIsSubmitting(true);
    const startTime = Date.now();

    try {
      // Generate device fingerprint
      const deviceFingerprint = await generateDeviceFingerprint();
      
      // Get geolocation if available
      const geoLocation = await getCurrentLocation();

      const loginResult = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
        deviceInfo: {
          fingerprint: deviceFingerprint,
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }, {
        geoLocation
      });

      // Track successful login
      await trackLoginAttempt({
        email: formData.email,
        success: true,
        duration: Date.now() - startTime,
        rememberMe: formData.rememberMe
      });

      // Reset form state
      setLoginAttempts(0);
      setFormData({ email: '', password: '', rememberMe: false });
      
      onSuccess?.(loginResult.user);
      
      // Redirect or notify success
      if (redirectTo) {
        window.location.href = redirectTo;
      }
      
    } catch (error: any) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      // Track failed login
      await trackLoginAttempt({
        email: formData.email,
        success: false,
        duration: Date.now() - startTime,
        failureReason: error.message,
        attemptNumber: newAttempts
      });

      // Handle lockout after 5 failed attempts
      if (newAttempts >= 5) {
        setIsLocked(true);
        setLockoutTimeRemaining(300); // 5 minutes
        onError?.('Too many failed attempts. Account locked for 5 minutes.');
      } else {
        onError?.(error.message || 'Login failed. Please try again.');
      }
      
      // Clear password on failed attempt
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateDeviceFingerprint = async (): Promise<string> => {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.platform,
      navigator.cookieEnabled.toString()
    ];
    
    const fingerprint = components.join('|');
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const getCurrentLocation = (): Promise<{ country?: string; city?: string; timezone?: string }> => {
    return new Promise((resolve) => {
      // Try to get timezone from browser
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // In a real implementation, you might use a geolocation service
      // For now, just return timezone
      resolve({ timezone });
    });
  };

  const getPasswordStrengthColor = (password: string): string => {
    if (password.length < 8) return 'bg-red-500';
    if (password.length < 12) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatLockoutTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      {isLocked && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Account Temporarily Locked</h3>
              <p className="text-sm text-red-700 mt-1">
                Too many failed attempts. Try again in {formatLockoutTime(lockoutTimeRemaining)}.
              </p>
            </div>
          </div>
        </div>
      )}

      {authError && !isLocked && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{authError}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleInputBlur('email')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
            disabled={isSubmitting || isLocked}
            autoComplete="email"
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleInputBlur('password')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              disabled={isSubmitting || isLocked}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isSubmitting || isLocked}
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          
          {/* Password strength indicator (only show when typing) */}
          {formData.password && !errors.password && (
            <div className="mt-1">
              <div className="h-1 w-full bg-gray-200 rounded">
                <div
                  className={`h-1 rounded transition-all duration-300 ${getPasswordStrengthColor(formData.password)}`}
                  style={{ width: `${Math.min((formData.password.length / 12) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={formData.rememberMe}
            onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isSubmitting || isLocked}
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
            Remember me for 30 days
          </label>
        </div>

        {/* Login Attempts Warning */}
        {loginAttempts > 2 && loginAttempts < 5 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700">
              Warning: {5 - loginAttempts} attempt{5 - loginAttempts !== 1 ? 's' : ''} remaining before account lockout.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLocked || isLoading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting || isLocked || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting || isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Footer Links */}
      <div className="mt-6 text-center space-y-2">
        {showForgotPasswordLink && (
          <div>
            <a
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </a>
          </div>
        )}
        
        {showRegistrationLink && (
          <div className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a
              href="/auth/register"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign up here
            </a>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-xs text-gray-600 text-center">
          🔒 Your login is secured with industry-standard encryption and monitoring.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
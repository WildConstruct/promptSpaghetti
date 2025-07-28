// Epic 11 Registration Hook
// React hook for user registration with validation and analytics
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  invitationToken?: string;
}

export interface RegistrationResponse {
  user: {,
    id: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
    roles: string[];
    permissions: string[];
  };
  emailVerificationRequired: boolean;
  nextSteps?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{,
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{,
    field: string;
    message: string;
    code: string;
  }>;
  suggestions: Array<{,
    field: string;
    suggestion: string;
  }>;
}

export const useRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const { login } = useAuth();
  const register = useCallback(async (data: RegistrationData): Promise<RegistrationResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/auth/register', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        // Handle validation errors
        if (response.status === 400 && errorData.validation) {
          setValidationResult(errorData.validation);
          throw new Error('Please fix the validation errors');
        }
        throw new Error(errorData.error || 'Registration failed');
      }
      const result: RegistrationResponse = await response.json();
      // Track successful registration
      if (window.gtag) {
        window.gtag('event', 'sign_up', {)
          method: 'email',
          user_id: result.user.id,
        });
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      // Track registration failure
      if (window.gtag) {
        window.gtag('event', 'registration_failed', {)
          error: errorMessage,
        });
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  const validateField = useCallback(async (field: string, value: any): Promise<void> => {
    if (!value) return;
    try {
      const response = await fetch('/auth/validate-field', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ field, value })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.validation) {
          setValidationResult(result.validation);
        }
      }
    } catch (err) {
      console.error('Field validation error:', err);
    }
  }, []);
  const resendEmailVerification = useCallback(async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/auth/resend-verification', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resend verification email');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification email';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  const verifyEmail = useCallback(async (token: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/auth/verify-email', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token }),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Email verification failed');
      }
      // Track email verification
      if (window.gtag) {
        window.gtag('event', 'email_verified');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email verification failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);
  return {
    register,
    validateField,
    resendEmailVerification,
    verifyEmail,
    isLoading,
    error,
    validationResult,
    clearError,
    clearValidation
  };
};

// Helper hook for password strength calculation
export const usePasswordStrength = (password: string) => {
  const calculateStrength = useCallback((password: string): {
    score: number;
    feedback: string[];
    strength: 'weak' | 'fair' | 'good' | 'strong';
  } => {
    if (!password) {
      return { score: 0, feedback: [], strength: 'weak' };
    }
    let score = 0;
    const feedback: string[] = [];
    // Length check
    if (password.length >= 12) {
      score += 25;
    } else {
      feedback.push('Use at least 12 characters');
    }
    // Character variety
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push('Add lowercase letters');
    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push('Add uppercase letters');
    if (/\d/.test(password)) score += 15;
    else feedback.push('Add numbers');
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    else feedback.push('Add special characters');
    // Bonus points
    if (password.length >= 16) score += 10;
    if (/[A-Z].*[A-Z]/.test(password)) score += 5;
    if (/\d.*\d/.test(password)) score += 5;
    if (/[^A-Za-z0-9].*[^A-Za-z0-9]/.test(password)) score += 5;
    // Penalties
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      feedback.push('Avoid repeating characters');
    }
    if (/123|abc|qwe|password/i.test(password)) {
      score -= 15;
      feedback.push('Avoid common patterns');
    }
    let strength: 'weak' | 'fair' | 'good' | 'strong';
    if (score < 30) strength = 'weak';
    else if (score < 60) strength = 'fair';
    else if (score < 80) strength = 'good';
    else strength = 'strong';
    return {
      score: Math.min(100, Math.max(0, score)),
      feedback,
      strength
    };
  }, []);
  return calculateStrength(password);
};
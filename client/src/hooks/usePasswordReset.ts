// Epic 11 usePasswordReset Hook
// React hook for password reset functionality

import { useState, useCallback } from 'react';

interface PasswordResetRequestResponse {
  success: boolean;
  message: string;
  estimatedDelivery?: string;
}

interface PasswordResetValidationResponse {
  valid: boolean;
  error?: string;
  canRetry?: boolean;
  email?: string;
  tokenExpiresAt?: string;
}

interface PasswordResetConfirmResponse {
  success: boolean;
  message: string;
}

export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tokenValidation, setTokenValidation] = useState<PasswordResetValidationResponse | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data: PasswordResetRequestResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request password reset');
      }

      setSuccess(data.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateToken = useCallback(async (token: string): Promise<PasswordResetValidationResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/auth/password-reset/validate/${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: PasswordResetValidationResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate token');
      }

      setTokenValidation(data);

      if (!data.valid) {
        setError(data.error || 'Invalid or expired token');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate token';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmPasswordReset = useCallback(async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data: PasswordResetConfirmResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(data.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTokenExpirationInfo = useCallback(() => {
    if (!tokenValidation?.tokenExpiresAt) {
      return null;
    }

    const expiresAt = new Date(tokenValidation.tokenExpiresAt);
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();

    if (timeLeft <= 0) {
      return { expired: true, timeLeft: 0, formatted: 'Expired' };
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    let formatted = '';
    if (hours > 0) {
      formatted = `${hours}h ${minutes}m`;
    } else {
      formatted = `${minutes}m`;
    }

    return {
      expired: false,
      timeLeft,
      formatted,
      expiresAt,
    };
  }, [tokenValidation]);

  const retryPasswordReset = useCallback(async (email?: string): Promise<void> => {
    if (!email && !tokenValidation?.email) {
      throw new Error('Email address is required to retry password reset');
    }

    const emailToUse = email || tokenValidation!.email!;
    return requestPasswordReset(emailToUse);
  }, [requestPasswordReset, tokenValidation]);

  return {
    // State
    loading,
    error,
    success,
    tokenValidation,

    // Actions
    requestPasswordReset,
    validateToken,
    confirmPasswordReset,
    retryPasswordReset,
    clearMessages,

    // Utilities
    getTokenExpirationInfo,

    // Computed values
    isTokenValid: tokenValidation?.valid === true,
    canRetry: tokenValidation?.canRetry === true,
    userEmail: tokenValidation?.email,
  };
};

export default usePasswordReset;
// Epic 11 Account Recovery Component
// Handles account unlock and password reset workflows
import React, { useState, useEffect } from 'react';
import { z } from 'zod';

// Recovery form validation schemas
const unlockAccountSchema = z.object({)
  email: z.string().email('Please enter a valid email address'),
  unlockToken: z.string().min(1, 'Unlock token is required')
});
const requestUnlockSchema = z.object({)
  email: z.string().email('Please enter a valid email address'),
});
type UnlockAccountData = z.infer<typeof unlockAccountSchema>;
type RequestUnlockData = z.infer<typeof requestUnlockSchema>;
interface AccountRecoveryProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  initialEmail?: string;
  unlockToken?: string;
}
type RecoveryMode = 'request' | 'unlock' | 'success';

export const AccountRecovery: React.FC<AccountRecoveryProps> = ({)
  onSuccess,
  onError,
  initialEmail = '',
  unlockToken = ''
}) => {
  const [mode, setMode] = useState<RecoveryMode>(unlockToken ? 'unlock' : 'request');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [requestData, setRequestData] = useState<RequestUnlockData>({)
    email: initialEmail,
  });
  const [unlockData, setUnlockData] = useState<UnlockAccountData>({)
    email: initialEmail,
    unlockToken: unlockToken,
  });
  const [errors, setErrors] = useState<{
    request?: Partial<Record<keyof RequestUnlockData, string>>;
    unlock?: Partial<Record<keyof UnlockAccountData, string>>;
  }>({});
  // Handle countdown for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);
  const validateRequestForm = (): boolean => {
    try {
      requestUnlockSchema.parse(requestData);
      setErrors(prev => ({ ...prev, request: {} }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof RequestUnlockData, string>> = {};
        error.errors.forEach(err => {)
          if (err.path[0]) {
            newErrors[err.path[0] as keyof RequestUnlockData] = err.message;
          }
        });
        setErrors(prev => ({ ...prev, request: newErrors }));
      }
      return false;
    }
  };
  const validateUnlockForm = (): boolean => {
    try {
      unlockAccountSchema.parse(unlockData);
      setErrors(prev => ({ ...prev, unlock: {} }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof UnlockAccountData, string>> = {};
        error.errors.forEach(err => {)
          if (err.path[0]) {
            newErrors[err.path[0] as keyof UnlockAccountData] = err.message;
          }
        });
        setErrors(prev => ({ ...prev, unlock: newErrors }));
      }
      return false;
    }
  };
  const handleRequestUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRequestForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/request-unlock', {)
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to request account unlock');
      }
      setCountdown(300); // 5 minutes before allowing resend
      setMode('success');
      onSuccess?.('Account unlock instructions have been sent to your email address.');
    } catch (error: Error) {
      onError?.(error.message || 'Failed to request account unlock');
    } finally {
      setIsLoading(false);
    }
  };
  const handleUnlockAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUnlockForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/unlock-account', {)
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unlockData),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to unlock account');
      }
      setMode('success');
      onSuccess?.('Your account has been successfully unlocked. You can now sign in.');
    } catch (error: Error) {
      onError?.(error.message || 'Failed to unlock account');
    } finally {
      setIsLoading(false);
    }
  };
  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;}
  };
  if (mode === 'success') {
    return ()
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Request Sent</h2>
          <p className="mt-2 text-gray-600">
            We&apos;ve sent account recovery instructions to your email address.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Check your email and follow the instructions to unlock your account.
            If you don&apos;t see the email, check your spam folder.
          </p>
          {countdown > 0 && ()
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                You can request another unlock email in {formatCountdown(countdown)}
              </p>
            </div>
          )}
          <div className="mt-6 space-y-3">
            {countdown === 0 && ()
              <button
                onClick={() => setMode('request')}
                className="w-full py-2 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send Another Email
              </button>
            )}
            <a
              href="/auth/login"
              className="block w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    );
  }
  if (mode === 'unlock') {
    return ()
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Unlock Account</h2>
          <p className="text-gray-600 mt-2">Enter your unlock token to restore access</p>
        </div>
        <form onSubmit={handleUnlockAccount} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="unlock-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="unlock-email"
              value={unlockData.email}
              onChange={(e) => setUnlockData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.unlock?.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
              disabled={isLoading}
              required
            />
            {errors.unlock?.email && ()
              <p className="mt-1 text-sm text-red-600">{errors.unlock.email}</p>
            )}
          </div>
          {/* Unlock Token Field */}
          <div>
            <label htmlFor="unlock-token" className="block text-sm font-medium text-gray-700 mb-1">
              Unlock Token
            </label>
            <input
              type="text"
              id="unlock-token"
              value={unlockData.unlockToken}
              onChange={(e) => setUnlockData(prev => ({ ...prev, unlockToken: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.unlock?.unlockToken ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter the unlock token from your email"
              disabled={isLoading}
              required
            />
            {errors.unlock?.unlockToken && ()
              <p className="mt-1 text-sm text-red-600">{errors.unlock.unlockToken}</p>
            )}
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? ()
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Unlocking Account...
              </div>
            ) : ()
              'Unlock Account'
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => setMode('request')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Don&apos;t have an unlock token? Request one
          </button>
        </div>
      </div>
    );
  }
  // Request unlock mode
  return ()
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Account Recovery</h2>
        <p className="text-gray-600 mt-2">Request an unlock token for your account</p>
      </div>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Account Locked?</h3>
            <p className="text-sm text-blue-700 mt-1">
              If your account is locked due to multiple failed login attempts, 
              we can send you instructions to unlock it safely.
            </p>
          </div>
        </div>
      </div>
      <form onSubmit={handleRequestUnlock} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="request-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="request-email"
            value={requestData.email}
            onChange={(e) => setRequestData(prev => ({ ...prev, email: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.request?.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
            disabled={isLoading}
            required
          />
          {errors.request?.email && ()
            <p className="mt-1 text-sm text-red-600">{errors.request.email}</p>
          )}
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || countdown > 0}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading || countdown > 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? ()
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending Request...
            </div>
          ) : countdown > 0 ? ()
            `Wait ${formatCountdown(countdown)} to resend`}
          ) : ()
            'Send Unlock Instructions'
          )}
        </button>
      </form>
      <div className="mt-6 text-center space-y-2">
        <div>
          <a
            href="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </a>
        </div>
        <div className="text-sm text-gray-600">
          Remember your password?{' '}
          <a
            href="/auth/forgot-password"
            className="text-blue-600 hover:text-blue-500"
          >
            Reset it instead
          </a>
        </div>
      </div>
      {/* Security Notice */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-xs text-gray-600 text-center">
          🔒 Account unlock requests are securely processed and logged for your protection.
        </p>
      </div>
    </div>
  );
};

export default AccountRecovery;
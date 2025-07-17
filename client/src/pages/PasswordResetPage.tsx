// Epic 11 Password Reset Page
// Main page component for password reset functionality

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PasswordResetForm } from '../components/auth/PasswordResetForm';
import { usePasswordReset } from '../hooks/usePasswordReset';

const PasswordResetPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [mode, setMode] = useState<'request' | 'confirm' | 'success' | 'error'>('request');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    loading,
    error,
    success,
    tokenValidation,
    validateToken,
    getTokenExpirationInfo,
    isTokenValid,
    canRetry,
    userEmail,
  } = usePasswordReset();

  // Determine mode based on token presence and validation
  useEffect(() => {
    if (token) {
      // Token provided - validate it
      validateToken(token);
    } else {
      // No token - show request form
      setMode('request');
    }
  }, [token, validateToken]);

  // Update mode based on token validation results
  useEffect(() => {
    if (tokenValidation) {
      if (tokenValidation.valid) {
        setMode('confirm');
      } else {
        setMode('error');
        setErrorMessage(tokenValidation.error || 'Invalid token');
      }
    }
  }, [tokenValidation]);

  // Handle success from password reset request
  useEffect(() => {
    if (success && mode === 'request') {
      setMode('success');
      setSuccessMessage(success);
    } else if (success && mode === 'confirm') {
      setMode('success');
      setSuccessMessage(success);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    }
  }, [success, mode, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      if (mode === 'confirm') {
        // Stay in confirm mode but show error
        setErrorMessage(error);
      } else {
        setMode('error');
        setErrorMessage(error);
      }
    }
  }, [error, mode]);

  const handleSuccess = () => {
    if (mode === 'request') {
      setMode('success');
      setSuccessMessage('Password reset link sent! Check your email.');
    } else if (mode === 'confirm') {
      setMode('success');
      setSuccessMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    }
  };

  const handleCancel = () => {
    navigate('/auth/login');
  };

  const handleRetryRequest = () => {
    setMode('request');
    setErrorMessage('');
  };

  const tokenExpiration = getTokenExpirationInfo();

  if (loading && !tokenValidation) {
    return (
      <div className="password-reset-page">
        <div className="loading-container">
          <div className="spinner large"></div>
          <p>Validating reset token...</p>
        </div>
        
        <style jsx>{`
          .password-reset-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 1rem;
          }

          .loading-container {
            text-align: center;
            color: white;
          }

          .spinner {
            width: 2rem;
            height: 2rem;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem auto;
          }

          .spinner.large {
            width: 3rem;
            height: 3rem;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="password-reset-page">
      <div className="container">
        {mode === 'request' && (
          <PasswordResetForm
            mode="request"
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}

        {mode === 'confirm' && (
          <>
            {tokenExpiration && !tokenExpiration.expired && (
              <div className="token-info">
                <p>Reset link expires in: <strong>{tokenExpiration.formatted}</strong></p>
                {userEmail && <p>Resetting password for: <strong>{userEmail}</strong></p>}
              </div>
            )}
            
            <PasswordResetForm
              mode="confirm"
              token={token || undefined}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />

            {errorMessage && (
              <div className="error-banner">
                <p>{errorMessage}</p>
              </div>
            )}
          </>
        )}

        {mode === 'success' && (
          <div className="success-container">
            <div className="success-card">
              <div className="success-icon">✅</div>
              <h2>Success!</h2>
              <p>{successMessage}</p>
              
              {mode === 'success' && !token && (
                <div className="success-actions">
                  <button
                    onClick={handleCancel}
                    className="btn btn-primary"
                  >
                    Back to Login
                  </button>
                </div>
              )}

              {mode === 'success' && token && (
                <div className="success-actions">
                  <p className="redirect-notice">
                    You'll be redirected to login automatically...
                  </p>
                  <button
                    onClick={() => navigate('/auth/login')}
                    className="btn btn-link"
                  >
                    Go to Login Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === 'error' && (
          <div className="error-container">
            <div className="error-card">
              <div className="error-icon">❌</div>
              <h2>Reset Link Invalid</h2>
              <p>{errorMessage}</p>
              
              <div className="error-actions">
                {canRetry && userEmail && (
                  <button
                    onClick={handleRetryRequest}
                    className="btn btn-primary"
                  >
                    Request New Reset Link
                  </button>
                )}
                
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .password-reset-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .container {
          width: 100%;
          max-width: 480px;
        }

        .token-info {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          text-align: center;
          font-size: 0.875rem;
          color: #374151;
          border: 1px solid #e2e8f0;
        }

        .token-info p {
          margin: 0.25rem 0;
        }

        .success-container,
        .error-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .success-card,
        .error-card {
          background: white;
          border-radius: 8px;
          padding: 3rem 2rem;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          max-width: 400px;
          width: 100%;
        }

        .success-icon,
        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .success-card h2,
        .error-card h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1a202c;
        }

        .success-card p,
        .error-card p {
          color: #718096;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .success-actions,
        .error-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }

        .redirect-notice {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem !important;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          min-width: 140px;
        }

        .btn-primary {
          background: #4f46e5;
          color: white;
        }

        .btn-primary:hover {
          background: #4338ca;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #5b6471;
        }

        .btn-link {
          background: none;
          color: #4f46e5;
          padding: 0.5rem;
          text-decoration: underline;
        }

        .btn-link:hover {
          color: #4338ca;
        }

        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          text-align: center;
        }

        .error-banner p {
          color: #ef4444;
          margin: 0;
          font-size: 0.875rem;
        }

        @media (max-width: 640px) {
          .password-reset-page {
            padding: 0.5rem;
          }

          .success-card,
          .error-card {
            padding: 2rem 1.5rem;
          }

          .success-actions,
          .error-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default PasswordResetPage;
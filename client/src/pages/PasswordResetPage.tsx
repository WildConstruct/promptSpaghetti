/**
 * PasswordResetPage - Password reset page wrapper for existing PasswordResetForm component
 * 
 * Integrates with React Router and authentication store
 */
import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PasswordResetForm } from '../components/auth/PasswordResetForm';
import { useAuthStore } from '../stores/authStore';

export const PasswordResetPage: React.FC = () => {
  const { isAuthenticated, isLoading, error, clearError } = useAuthStore();
  // Clear any existing errors when page loads
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [clearError, error]);
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return ()
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        padding: '40px',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '8px',
          }}>
            Reset Password
          </h1>
          <p style={{
            color: '#666',
            fontSize: '16px',
          }}>
            Enter your email address to receive a password reset link
          </p>
        </div>
        {/* Display global error if any */}
        {error && ()
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            color: '#c33',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}
        {/* Loading indicator */}
        {isLoading && ()
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#666',
          }}>
            Sending reset email...
          </div>
        )}
        {/* Password Reset Form */}
        <PasswordResetForm />
        {/* Navigation Links */}
        <div style={{
          marginTop: '30px',
          textAlign: 'center',
          fontSize: '14px',
        }}>
          <div style={{ marginBottom: '10px' }}>
            <Link
              to="/login"
              style={{
                color: '#007bff',
                textDecoration: 'none',
              }}
            >
              Remember your password? Sign in
            </Link>
          </div>
          <div>
            <Link
              to="/register"
              style={{
                color: '#666',
                textDecoration: 'none',
              }}
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
        {/* Return to app link */}
        <div style={{
          marginTop: '30px',
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #eee',
        }}>
          <Link
            to="/"
            style={{
              color: '#666',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            ← Back to Graph Editor
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
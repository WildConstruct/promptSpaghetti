/**
 * RegistrationPage - Registration page wrapper for existing RegistrationForm component
 * 
 * Integrates with React Router and authentication store
 */
import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { RegistrationForm } from '../components/auth/RegistrationForm';
import { useAuthStore } from '../stores/authStore';

export const RegistrationPage: React.FC = () => {
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
            Create Account
          </h1>
          <p style={{
            color: '#666',
            fontSize: '16px',
          }}>
            Join Prompt Spaghetti to save your projects
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
            Creating account...
          </div>
        )}
        {/* Registration Form */}
        <RegistrationForm />
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
              Already have an account? Sign in
            </Link>
          </div>
        </div>
        {/* Terms and Privacy */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#666',
          lineHeight: '1.4',
        }}>
          By creating an account, you agree to our{' '}
          <Link to="/terms" style={{ color: '#007bff', textDecoration: 'none' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" style={{ color: '#007bff', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
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

export default RegistrationPage;
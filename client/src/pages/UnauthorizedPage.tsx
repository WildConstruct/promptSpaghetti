/**
 * UnauthorizedPage - Page shown when user lacks permissions for a resource
 * 
 * Handles role-based access denials with appropriate messaging
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const from = location.state?.from?.pathname || '/';
  const reason = location.state?.reason;

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        textAlign: 'center'
      }}>
        {/* Error Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#fee',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px',
          fontSize: '40px',
          color: '#dc3545'
        }}>
          🚫
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '16px'
        }}>
          Access Denied
        </h1>

        <div style={{
          color: '#666',
          fontSize: '16px',
          lineHeight: '1.5',
          marginBottom: '30px'
        }}>
          {reason === 'insufficient_permissions' ? (
            <>
              <p>You don't have the required permissions to access this page.</p>
              {user && (
                <p style={{ marginTop: '10px', fontSize: '14px' }}>
                  Logged in as: <strong>{user.email}</strong>
                </p>
              )}
            </>
          ) : (
            <p>You are not authorized to view this resource.</p>
          )}
          
          {from !== '/' && (
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#999' }}>
              Attempted to access: {from}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleGoBack}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '100px'
            }}
          >
            Go Back
          </button>
          
          <button
            onClick={handleGoHome}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '100px'
            }}
          >
            Go Home
          </button>
        </div>

        {/* Additional Options */}
        <div style={{
          marginTop: '40px',
          paddingTop: '30px',
          borderTop: '1px solid #eee',
          fontSize: '14px'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <Link
              to="/support"
              style={{
                color: '#007bff',
                textDecoration: 'none'
              }}
            >
              Contact support if you believe this is an error
            </Link>
          </div>
          
          {user && (
            <div>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Sign out and use a different account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
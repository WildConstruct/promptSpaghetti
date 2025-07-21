/**
 * AuthLayout - Consistent layout wrapper for authentication pages
 * 
 * Provides unified styling, navigation, and branding for all auth pages
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showNavigation?: boolean;
  showBranding?: boolean;
  maxWidth?: string;
  backgroundPattern?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showNavigation = true,
  showBranding = true,
  maxWidth = '450px',
  backgroundPattern = true
}) => {
  const location = useLocation();
  const { error, clearError, isLoading } = useAuthStore();

  // Clear errors when location changes
  React.useEffect(() => {
    if (error) {
      clearError();
    }
  }, [location.pathname, error, clearError]);

  const getNavigationLinks = () => {
    const currentPath = location.pathname;
    
    const links = [
      {
        path: '/login',
        label: 'Sign In',
        description: 'Access your account'
      },
      {
        path: '/register', 
        label: 'Create Account',
        description: 'Join Prompt Spaghetti'
      },
      {
        path: '/reset-password',
        label: 'Reset Password',
        description: 'Recover your account'
      }
    ];

    return links.filter(link => link.path !== currentPath);
  };

  const backgroundStyle = backgroundPattern ? {
    backgroundImage: `
      radial-gradient(circle at 1px 1px, rgba(0,123,255,0.15) 1px, transparent 0)
    `,
    backgroundSize: '20px 20px'
  } : {};

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      ...backgroundStyle
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="1"%3E%3Ccircle cx="7" cy="7" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        padding: '48px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Branding Header */}
        {showBranding && (
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <Link 
              to="/" 
              style={{ 
                textDecoration: 'none',
                color: 'inherit',
                display: 'inline-block'
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#007bff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                🧠
              </div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#333',
                margin: '0 0 4px 0'
              }}>
                Prompt Spaghetti
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: 0
              }}>
                Visual Prompt Engineering
              </p>
            </Link>
          </div>
        )}

        {/* Page Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '8px'
          }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.5',
              margin: 0
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Global Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            color: '#c33',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={clearError}
              style={{
                background: 'none',
                border: 'none',
                color: '#c33',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0',
                lineHeight: '1',
                flexShrink: 0
              }}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div style={{
            backgroundColor: '#e7f3ff',
            border: '1px solid #bee5eb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'center',
            color: '#0c5460',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #0c5460',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Processing...
          </div>
        )}

        {/* Main Content */}
        <div style={{ marginBottom: showNavigation ? '32px' : '24px' }}>
          {children}
        </div>

        {/* Navigation Links */}
        {showNavigation && (
          <div style={{
            textAlign: 'center',
            fontSize: '14px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {getNavigationLinks().map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    color: '#007bff',
                    textDecoration: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s',
                    display: 'block'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ fontWeight: '500' }}>{link.label}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {link.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #eee',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            By continuing, you agree to our{' '}
            <Link to="/terms" style={{ color: '#007bff', textDecoration: 'none' }}>
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" style={{ color: '#007bff', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
          </div>
          
          <Link
            to="/"
            style={{
              color: '#999',
              textDecoration: 'none',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ← Back to Editor
          </Link>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
/**
 * OAuth Callback Handler Component
 * 
 * Handles OAuth callbacks from providers (Google, GitHub, Microsoft)
 * Processes authorization codes and completes authentication flow
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface OAuthCallbackState {
  status: 'loading' | 'success' | 'error';
  message: string;
  provider?: string;
}

export const OAuthCallback: React.FC = () => {
  const [state, setState] = useState<OAuthCallbackState>({
    status: 'loading',
    message: 'Processing authentication...'
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const authStore = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get callback parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for OAuth errors
        if (error) {
          throw new Error(errorDescription || error);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Get stored OAuth state
        const storedProvider = sessionStorage.getItem('oauth_provider');
        const storedReturnUrl = sessionStorage.getItem('oauth_return_url');

        if (!storedProvider) {
          throw new Error('Invalid OAuth state: missing provider information');
        }

        setState({
          status: 'loading',
          message: `Completing ${storedProvider} authentication...`,
          provider: storedProvider
        });

        // Exchange authorization code for tokens via backend
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE_URL}/auth/oauth/callback/${storedProvider}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Authentication failed');
        }

        const authData = await response.json();

        // Update auth store with user data and tokens
        authStore.user = authData.user;
        authStore.isAuthenticated = true;
        authStore.accessToken = authData.tokens.accessToken;
        authStore.refreshToken = authData.tokens.refreshToken;
        authStore.tokenExpiration = new Date(authData.tokens.expiresAt).getTime();
        authStore.error = null;

        // Clear OAuth state from session storage
        sessionStorage.removeItem('oauth_provider');
        sessionStorage.removeItem('oauth_mode');
        sessionStorage.removeItem('oauth_return_url');

        setState({
          status: 'success',
          message: `Successfully authenticated with ${storedProvider}!`,
          provider: storedProvider
        });

        // Redirect after success
        setTimeout(() => {
          const redirectUrl = storedReturnUrl || '/';
          navigate(redirectUrl, { replace: true });
        }, 2000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Authentication failed',
          provider: sessionStorage.getItem('oauth_provider') || undefined
        });

        // Clean up session storage
        sessionStorage.removeItem('oauth_provider');
        sessionStorage.removeItem('oauth_mode');
        sessionStorage.removeItem('oauth_return_url');

        // Redirect to login after error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, authStore]);

  const getProviderDisplayName = (provider?: string) => {
    switch (provider) {
    case 'google': return 'Google';
    case 'github': return 'GitHub';
    case 'microsoft': return 'Microsoft';
    default: return 'OAuth Provider';
    }
  };

  const getStatusIcon = () => {
    switch (state.status) {
    case 'loading':
      return (
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #007bff',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      );
    case 'success':
      return (
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#28a745',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '20px'
        }}>
            ✓
        </div>
      );
    case 'error':
      return (
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#dc3545',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '20px'
        }}>
            ✕
        </div>
      );
    }
  };

  const getStatusColor = () => {
    switch (state.status) {
    case 'loading': return '#007bff';
    case 'success': return '#28a745';
    case 'error': return '#dc3545';
    }
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
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '20px' }}>
          {getStatusIcon()}
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '16px'
        }}>
          {state.status === 'loading' && 'Authenticating...'}
          {state.status === 'success' && 'Authentication Successful!'}
          {state.status === 'error' && 'Authentication Failed'}
        </h2>

        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '20px',
          lineHeight: '1.5'
        }}>
          {state.message}
        </p>

        {state.provider && (
          <p style={{
            fontSize: '14px',
            color: '#888',
            marginBottom: '20px'
          }}>
            Provider: {getProviderDisplayName(state.provider)}
          </p>
        )}

        {state.status === 'loading' && (
          <div style={{
            fontSize: '14px',
            color: '#666'
          }}>
            Please wait while we complete your authentication...
          </div>
        )}

        {state.status === 'success' && (
          <div style={{
            fontSize: '14px',
            color: getStatusColor()
          }}>
            Redirecting you to the application...
          </div>
        )}

        {state.status === 'error' && (
          <div style={{
            fontSize: '14px',
            color: '#666'
          }}>
            You will be redirected to the login page in a few seconds...
          </div>
        )}
      </div>

      {/* CSS animation for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OAuthCallback;
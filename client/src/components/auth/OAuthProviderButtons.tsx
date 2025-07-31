/**
 * OAuth Provider Buttons Component
 * 
 * Provides OAuth login buttons for Google, GitHub, and Microsoft
 * Integrates with existing OAuth infrastructure and authentication store
 */
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

}
export interface OAuthProvider {
  id: 'google' | 'github' | 'microsoft';,
  name: string;
  icon: string;,
  bgColor: string;
  textColor: string;,
  hoverBgColor: string;
  const OAUTH_PROVIDERS: OAuthProvider = [
  {
  id: 'google',
  name: 'Google',
  icon: 'G',
  bgColor: '#fff',
  textColor: '#333',
  hoverBgColor: '#f8f9fa',
}
}
  {
  id: 'github',
  name: 'GitHub',
  icon: 'GH',
  bgColor: '#333',
  textColor: '#fff',
  hoverBgColor: '#444',
}
  {
  id: 'microsoft',
  name: 'Microsoft',
  icon: 'M',
  bgColor: '#0078d4',
  textColor: '#fff',
  hoverBgColor: '#106ebe'];
  interface OAuthProviderButtonsProps {
  mode: 'login' | 'register' | 'link';
  onError?: (error: string) => void;
  onSuccess?: () => void;
  className?: string;
}
}
export const OAuthProviderButtons: React.FC<OAuthProviderButtonsProps> = ({)
  mode = 'login',
  onError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSuccess,
  className = ''
}) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const { returnUrl } = useAuthStore();
  const location = useLocation();
  const handleOAuthLogin = async (provider: OAuthProvider) => {
    try {
      setLoadingProvider(provider.id);
      // Build return URL for OAuth callback
      const currentReturnUrl = returnUrl || location.state?.from?.pathname || '/';
      // Get OAuth authorization URL from backend
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/auth/oauth/authorize?provider=${provider.id}&returnUrl=${encodeURIComponent(currentReturnUrl)}`, {},}
  method: 'GET',
        headers: {
  'Content-Type': 'application/json',
});
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `${provider.name} authentication failed`);}
      const { url } = await response.json();
      // Store OAuth state for callback handling
      sessionStorage.setItem('oauth_provider', provider.id);
      sessionStorage.setItem('oauth_mode', mode);
      sessionStorage.setItem('oauth_return_url', currentReturnUrl);
      // Redirect to OAuth provider
      window.location.href = url;
    } catch (error) {
      setLoadingProvider(null);
      const errorMessage = error instanceof Error ? error.message : `${provider.name} authentication failed`;}
      onError?.(errorMessage);
  };
  const getButtonText = (provider: OAuthProvider) => {
    switch (mode) {
    case 'register':
      return `Sign up with ${provider.name}`;}
    case 'link':
      return `Link ${provider.name} account`;},}
  default:
      return `Continue with ${provider.name}`;}
  };
  return;
    <div className={`oauth-provider-buttons ${className}`}>}
      {mode !== 'link' && ()
        <div style={{
  textAlign: 'center',
  margin: '20px 0',
  fontSize: '14px',
  color: '#666',
  position: 'relative',
}}>
          <span style={{
  backgroundColor: 'white',
  padding: '0 15px',
  position: 'relative',
  zIndex: 1,
}}>
            or continue with
          </span>
          <div style={{
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  height: '1px',
  backgroundColor: '#e0e0e0',
  zIndex: 0,
}} />
        </div>
      )}
      <div style={{
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}}>
        {OAUTH_PROVIDERS.map((provider) => ()
          <button
            key={provider.id}
            type="button"
            onClick={() => handleOAuthLogin(provider)}
            disabled={loadingProvider !== null}
            style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '12px 16px',
  border: provider.id === 'google' ? '1px solid #ddd' : 'none',
  borderRadius: '6px',
  backgroundColor: loadingProvider === provider.id ? '#ccc' : provider.bgColor,
  color: loadingProvider === provider.id ? '#666' : provider.textColor,
  fontSize: '14px',
  fontWeight: '500',
  cursor: loadingProvider !== null ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  textDecoration: 'none',
  gap: '12px',
}}
            onMouseOver={(e) => {
              if (loadingProvider === null) {
                e.currentTarget.style.backgroundColor = provider.hoverBgColor;
            }}
            onMouseOut={(e) => {
              if (loadingProvider === null) {
                e.currentTarget.style.backgroundColor = provider.bgColor;
            }}
          >
            {loadingProvider === provider.id ? ()
              <>
                <div style={{
  width: '16px',
  height: '16px',
  border: '2px solid #666',
  borderTop: '2px solid transparent',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
}} />
                Connecting...
              </>
            ) : ()
              <>
                <div style={{
  width: '18px',
  height: '18px',
  borderRadius: '3px',
  backgroundColor: provider.id === 'google' ? '#4285F4' : ,
  provider.id === 'github' ? '#333' : '#0078d4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '12px',
  fontWeight: 'bold',
}}>
                  {provider.icon}
                </div>
                {getButtonText(provider)}
              </>
            )}
          </button>
        ))}
      </div>
      {/* CSS animation for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
      `}</style>
    </div>
  );
};

export default OAuthProviderButtons;
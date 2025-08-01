/**
 * OAuth Account Manager Component
 * 
 * Allows users to link/unlink OAuth accounts in their profile settings
 * Integrates with existing OAuth infrastructure
 */
import React, { useState, useEffect } from 'react';
import { useAuthStore, authenticatedFetch } from '../../stores/authStore';
import { OAuthProviderButtons } from './OAuthProviderButtons';


interface LinkedAccount {
  provider: 'google' | 'github' | 'microsoft';,
  providerId: string;,
  email: string;,
  displayName: string;,
  linkedAt: string;
  lastUsed?: string;
  interface OAuthAccountManagerProps {
  className?: string;
  export const OAuthAccountManager: React.FC<OAuthAccountManagerProps> = ({),
  className = ''


}) => {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);
  const { user } = useAuthStore();
  // Load linked accounts on component mount
  useEffect(() => {
    loadLinkedAccounts();
  }, []);
  const loadLinkedAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authenticatedFetch('/auth/oauth/linked-accounts');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load linked accounts');
      const data = await response.json();
      setLinkedAccounts(data.linkedAccounts || []);
 catch (error) {
  console.error('Failed to load linked accounts:', error);
  setError(error instanceof Error ? error.message : 'Failed to load linked accounts');
 finally {
      setIsLoading(false);
  };
  const handleUnlinkAccount = async (provider: string) => {
    if (!confirm(`Are you sure you want to unlink your ${provider} account? You won't be able to use it to sign in.`)) {}
      return;
    try {
      setUnlinkingProvider(provider);
      setError(null);
      const response = await authenticatedFetch(`/auth/oauth/unlink/${provider}`, {)}
  },
  method: 'POST';
  });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unlink account');
      // Reload linked accounts after successful unlink
      await loadLinkedAccounts();
 catch (error) {
  console.error('Failed to unlink account:', error);
  setError(error instanceof Error ? error.message : 'Failed to unlink account');
 finally {
      setUnlinkingProvider(null);
  };
  const handleLinkSuccess = () => {
    // Reload linked accounts after successful linking
    loadLinkedAccounts();
  };
  const handleLinkError = (error: string) => {
    setError(error);
  };
  const getProviderDisplayName = (provider: string) => {
  switch (provider) {
  case 'google': return 'Google';
  case 'github': return 'GitHub';
  case 'microsoft': return 'Microsoft';
  default: return provider;
};
  const getProviderIcon = (provider: string) => {
  switch (provider) {
  case 'google': return 'G';
  case 'github': return 'GH';
  case 'microsoft': return 'M';
  default: return '?';
};
  const getProviderColor = (provider: string) => {
  switch (provider) {
  case 'google': return '#4285F4';
  case 'github': return '#333';
  case 'microsoft': return '#0078d4';
  default: return '#666';
};
  const getUnlinkedProviders = () => {
    const allProviders = ['google', 'github', 'microsoft'];
    const linkedProviderIds = linkedAccounts.map(account => account.provider);
    return allProviders.filter(provider => !linkedProviderIds.includes(provider as 'google' | 'github' | 'microsoft'));
  };
  if (!user) {
    return;
      <div className={`oauth-account-manager ${className}`}>}
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          Please sign in to manage OAuth accounts.
        </p>
      </div>
    );
  return;
    <div className={`oauth-account-manager ${className}`} style={{},},
  backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px';
}>
      <h3 style={{
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '16px',
  color: '#333',
}>
        Connected Accounts
      </h3>
      <p style={{
  fontSize: '14px',
  color: '#666',
  marginBottom: '20px',
  lineHeight: '1.4',
}>
        Link your social accounts to sign in with one click. You can unlink accounts at any time.
      </p>
      {error && ()
        <div style={{
  backgroundColor: '#fee',
  border: '1px solid #fcc',
  color: '#c33',
  padding: '12px',
  borderRadius: '4px',
  marginBottom: '20px',
  fontSize: '14px',
}>
          {error}
        </div>
      )}
      {isLoading ? ()
        <div style={{
  textAlign: 'center',
  padding: '20px',
  color: '#666',
}>
          Loading connected accounts...
        </div>
      ) : ()
        <>
          {/* Linked Accounts Section */}
          {linkedAccounts.length > 0 && ()
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{
  fontSize: '16px',
  fontWeight: '600',
  marginBottom: '12px',
  color: '#333',
}>
                Linked Accounts ({linkedAccounts.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {linkedAccounts.map((account) => ()
                  <div
                    key={`${account.provider}-${account.providerId}`}
                    style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
  backgroundColor: '#f9f9f9',
}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: getProviderColor(account.provider),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '14px',
  fontWeight: 'bold',
}>
                        {getProviderIcon(account.provider)}
                      </div>
                      <div>
                        <div style={{
  fontSize: '14px',
  fontWeight: '600',
  color: '#333',
}>
                          {getProviderDisplayName(account.provider)}
                        </div>
                        <div style={{
  fontSize: '12px',
  color: '#666',
}>
                          {account.email || account.displayName}
                        </div>
                        <div style={{
  fontSize: '11px',
  color: '#888',
}>
                          Linked {new Date(account.linkedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnlinkAccount(account.provider)}
                      disabled={unlinkingProvider === account.provider}
                      style={{
  padding: '6px 12px',
  border: '1px solid #dc3545',
  backgroundColor: 'transparent',
  color: '#dc3545',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: unlinkingProvider === account.provider ? 'not-allowed' : 'pointer',
  opacity: unlinkingProvider === account.provider ? 0.6 : 1,

                    >
                      {unlinkingProvider === account.provider ? 'Unlinking...' : 'Unlink'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Available Providers Section */}
          {getUnlinkedProviders().length > 0 && ()
            <div>
              <h4 style={{
  fontSize: '16px',
  fontWeight: '600',
  marginBottom: '12px',
  color: '#333',
}>
                Link Additional Accounts
              </h4>
              <div style={{ maxWidth: '300px' }}>
                <OAuthProviderButtons
                  mode="link"
                  onSuccess={handleLinkSuccess}
                  onError={handleLinkError}
                />
              </div>
            </div>
          )}
          {linkedAccounts.length === 0 && getUnlinkedProviders().length === 0 && ()
            <div style={{
  textAlign: 'center',
  padding: '40px',
  color: '#666',
}>
              <p>No OAuth providers are available for linking.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OAuthAccountManager;
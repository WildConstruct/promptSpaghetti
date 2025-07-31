// Epic 11.2 Account Linking Component
// Interface for linking and unlinking OAuth provider accounts
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
}
interface LinkedAccount {
  provider: string;,
  email: string;
  name?: string;
  picture?: string;
  createdAt: string;,
  updatedAt: string;
  interface OAuthProvider {
  name: string;,
  displayName: string;
  icon: string;,
  color: string;
  interface AccountLinkingProps {
  onAccountLinked?: (provider: string) => void;
  onAccountUnlinked?: (provider: string) => void;
  export const AccountLinking: React.FC<AccountLinkingProps> = ({,)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAccountLinked,
  onAccountUnlinked
}
}) => {
  const { user } = useAuth();
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount>([]);
  const [availableProviders, setAvailableProviders] = useState<OAuthProvider>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (user) {
      fetchLinkedAccounts();
      fetchAvailableProviders();
  }, [user]);
  const fetchLinkedAccounts = async () => {
    try {
      const response = await fetch('/api/auth/oauth/accounts', {)
  headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
      });
      if (!response.ok) {
        throw new Error('Failed to fetch linked accounts');
      const data = await response.json();
      setLinkedAccounts(data.accounts);
    } catch (error) {
  console.error('Error fetching linked accounts:', error);
  setError('Failed to load linked accounts');
};
  const fetchAvailableProviders = async () => {
    try {
      const response = await fetch('/api/auth/oauth/providers');
      if (!response.ok) {
        throw new Error('Failed to fetch available providers');
      const data = await response.json();
      setAvailableProviders(data.providers);
    } catch (error) {
  console.error('Error fetching available providers:', error);
} finally {
      setLoading(false);
  };
  const linkAccount = async (provider: string) => {
    try {
      setLinking(provider);
      setError(null);
      // Generate OAuth authorization URL
      const authResponse = await fetch(`/api/auth/oauth/authorize?provider=${provider}`, {)}
  },
  headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
      });
      if (!authResponse.ok) {
        throw new Error('Failed to initialize OAuth flow');
      const authData = await authResponse.json();
      // Redirect to OAuth provider
      window.location.href = authData.url;
    } catch (error) {
      console.error('Error linking account:', error);
      setError(`Failed to link ${provider} account`);}
      setLinking(null);
  };
  const unlinkAccount = async (provider: string) => {
    try {
      setUnlinking(provider);
      setError(null);
      const response = await fetch('/api/auth/oauth/unlink', {)
  method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
  },
  body: JSON.stringify({ provider })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unlink account');
      // Remove from local state
      setLinkedAccounts(prev => prev.filter(acc => acc.provider !== provider));
      onAccountUnlinked?.(provider);
    } catch (error) {
      console.error('Error unlinking account:', error);
      setError(error.message || `Failed to unlink ${provider} account`);}
    } finally {
      setUnlinking(null);
  };
  const getProviderIcon = (provider: string) => {
  const icons = {
  google: '🔍',
  github: '🐙',
  microsoft: '🏢',
};
    return icons[provider as keyof typeof icons] || '🔗';
  };
  const getProviderColor = (provider: string) => {
  const colors = {
  google: 'bg-red-50 border-red-200 text-red-700',
  github: 'bg-gray-50 border-gray-200 text-gray-700',
  microsoft: 'bg-blue-50 border-blue-200 text-blue-700',
};
    return colors[provider as keyof typeof colors] || 'bg-gray-50 border-gray-200 text-gray-700';
  };
  const isLinked = (provider: string) => {
    return linkedAccounts.some(acc => acc.provider === provider);
  };
  const getLinkedAccount = (provider: string) => {
    return linkedAccounts.find(acc => acc.provider === provider);
  };
  if (loading) {
    return;
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  return;
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connected Accounts</h2>
        <p className="text-gray-600">
          Link your accounts from other services to enable single sign-on and sync your data.
        </p>
      </div>
      {/* Error Message */}
      {error && ()
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-700">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}
      {/* OAuth Providers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">OAuth Providers</h3>
        <div className="space-y-4">
          {availableProviders.map((provider) => {
            const linked = isLinked(provider.name);
            const linkedAccount = getLinkedAccount(provider.name);
            return;
              <div
                key={provider.name}
                className={`border rounded-lg p-4 ${
  linked
  ? 'border-green-200 bg-green-50'
  : 'border-gray-200 bg-white',
}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getProviderColor(provider.name)}`}>}
                      <span className="text-lg">{getProviderIcon(provider.name)}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{provider.displayName}</h4>
                      {linked && linkedAccount ? ()
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            {linkedAccount.picture && ()
                              <img
                                src={linkedAccount.picture}
                                alt={linkedAccount.name}
                                className="w-4 h-4 rounded-full"
                              />
                            )}
                            <span>{linkedAccount.name || linkedAccount.email}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Connected {new Date(linkedAccount.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ) : ()
                        <p className="text-sm text-gray-600">
                          Link your {provider.displayName} account for easy sign-in
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {linked ? ()
                      <>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Connected
                        </span>
                        <button
                          onClick={() => unlinkAccount(provider.name)}
                          disabled={unlinking === provider.name}
                          className={`px-3 py-1 text-sm font-medium rounded-md ${
  unlinking === provider.name
  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
  : 'bg-red-50 text-red-700 hover:bg-red-100',
}`}
                        >
                          {unlinking === provider.name ? 'Unlinking...' : 'Unlink'}
                        </button>
                      </>
                    ) : ()
                      <button
                        onClick={() => linkAccount(provider.name)}
                        disabled={linking === provider.name}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
  linking === provider.name
  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
  : 'bg-blue-600 text-white hover:bg-blue-700',
}`}
                      >
                        {linking === provider.name ? 'Linking...' : 'Link Account'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-blue-600 text-lg">🔒</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">Security Information</h3>
            <div className="text-sm text-blue-700 mt-1">
              <ul className="list-disc list-inside space-y-1">
                <li>Linked accounts allow you to sign in using those services</li>
                <li>We only access basic profile information from linked accounts</li>
                <li>You can unlink accounts at any time</li>
                <li>Make sure you have another authentication method before unlinking all accounts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Account Statistics */}
      {linkedAccounts.length > 0 && ()
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{linkedAccounts.length}</div>
              <div className="text-sm text-gray-600">Connected Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {availableProviders.length - linkedAccounts.length}
              </div>
              <div className="text-sm text-gray-600">Available to Link</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {linkedAccounts.length > 0 ? 
                  Math.round((linkedAccounts.length / availableProviders.length) * 100) : 0
                }%
              </div>
              <div className="text-sm text-gray-600">Integration Level</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountLinking;
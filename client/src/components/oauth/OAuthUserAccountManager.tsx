/**
 * OAuth User Account Manager - Epic 19.5
 * 
 * User-facing OAuth account management interface for linking/unlinking
 * OAuth providers and managing account permissions with enterprise security.
 * 
 * Task: T-1752989143998-560 - Build OAuth configuration UI
 * Part of Epic 19.5 - OAuth Implementation & Framework
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';

// Types and interfaces
}
interface LinkedOAuthAccount {
  id: string;,
  providerId: string;
  providerName: string;,
  providerDisplayName: string;
  accountId: string;,
  accountEmail: string;
  accountName: string;
  avatarUrl?: string;
  scopes: string;,
  permissions: Permission;
  status: 'active' | 'inactive' | 'error' | 'expired';,
  linkedAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
  metadata: AccountMetadata;
  interface Permission {
  scope: string;,
  description: string;
  granted: boolean;,
  required: boolean;
  category: 'profile' | 'email' | 'calendar' | 'files' | 'repositories' | 'custom';
  interface AccountMetadata {
  tokenType: string;,
  hasRefreshToken: boolean;
  loginCount: number;,
  securityLevel: 'basic' | 'standard' | 'high';
  complianceFlags: {
  gdprConsent: boolean;,
  ccpaConsent: boolean;
  dataProcessingConsent: boolean;
}
};
}
interface AvailableProvider {
  id: string;,
  name: string;
  displayName: string;,
  description: string;
  iconUrl: string;,
  scopes: ProviderScope;
  features: string;,
  status: 'available' | 'configured' | 'maintenance';
  complianceLevel: 'basic' | 'standard' | 'enterprise';
}
interface ProviderScope {
  scope: string;,
  displayName: string;
  description: string;,
  required: boolean;
  sensitive: boolean;,
  category: 'profile' | 'email' | 'calendar' | 'files' | 'repositories' | 'custom';
/* interface LinkingResult {
   success: boolean;
   accountId?: string; */
//   error?: string;
//   warnings?: string;
//   requiresConsent?: boolean;
//   consentUrl?: string;

}
// }

export const OAuthUserAccountManager: React.FC = () => {
  // State management
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedOAuthAccount>([]);
  const [availableProviders, setAvailableProviders] = useState<AvailableProvider>([]);
  const [selectedAccount, setSelectedAccount] = useState<LinkedOAuthAccount | null>(null);
  const [showLinkProvider, setShowLinkProvider] = useState(false);
  const [linking, setLinking] = useState<Record<string, boolean>>({});
  const [unlinking, setUnlinking] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Auth store for API calls
  const { authenticatedFetch, user: _user } = useAuthStore(); // eslint-disable-line @typescript-eslint/no-unused-vars
  // Load data on mount
  useEffect(() => {
    loadLinkedAccounts();
    loadAvailableProviders();
  }, [loadLinkedAccounts, loadAvailableProviders]);
  // API functions
  const loadLinkedAccounts = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/auth/oauth/accounts');
      const data = await response.json();
      if (data.success) {
        setLinkedAccounts(data.data.accounts || []);
      } else {
        setError('Failed to load linked accounts');
    } catch (err) {
  setError('Failed to load linked accounts');
  console.error('Failed to load linked accounts:', err);
} finally {
      setLoading(false);
  }, [authenticatedFetch]);
  const loadAvailableProviders = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/auth/oauth/providers');
      const data = await response.json();
      if (data.success) {
        setAvailableProviders(data.data.providers || []);
    } catch (err) {
  console.error('Failed to load available providers:', err);
}, [authenticatedFetch]);
  const initiateOAuthLink = async (providerId: string) => {
    setLinking(prev => ({ ...prev, [providerId]: true }));
    setError(null);
    try {
      const response = await authenticatedFetch('/auth/oauth/link', {)
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ),
          provider: providerId,
          returnUrl: window.location.href;
  }
      });
      const data = await response.json();
      if (data.success && data.data.authorizationUrl) {
        // Redirect to OAuth provider
        window.location.href = data.data.authorizationUrl;
      } else {
        setError(`Failed to initiate OAuth linking: ${data.message}`);}
    } catch (err) {
      setError(`Failed to initiate OAuth linking: ${err.message}`);}
    } finally {
      setLinking(prev => ({ ...prev, [providerId]: false }));
  };
  const unlinkAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to unlink this OAuth account? This will revoke access to your data from this provider.')) {
      return;
    setUnlinking(prev => ({ ...prev, [accountId]: true }));
    setError(null);
    try {
      const response = await authenticatedFetch('/auth/oauth/unlink', {)
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      const data = await response.json();
      if (data.success) {
        await loadLinkedAccounts(); // Reload accounts
        if (selectedAccount?.id === accountId) {
          setSelectedAccount(null);
      } else {
        setError(`Failed to unlink account: ${data.message}`);}
    } catch (err) {
      setError(`Failed to unlink account: ${err.message}`);}
    } finally {
      setUnlinking(prev => ({ ...prev, [accountId]: false }));
  };
  const refreshAccount = async (accountId: string) => {
    setRefreshing(prev => ({ ...prev, [accountId]: true }));
    setError(null);
    try {
      const response = await authenticatedFetch(`/auth/oauth/refresh/${accountId}`, {)}
  },
  method: 'POST';
  });
      const data = await response.json();
      if (data.success) {
        await loadLinkedAccounts(); // Reload accounts
      } else {
        setError(`Failed to refresh account: ${data.message}`);}
    } catch (err) {
      setError(`Failed to refresh account: ${err.message}`);}
    } finally {
      setRefreshing(prev => ({ ...prev, [accountId]: false }));
  };
  // Utility functions
  const getStatusColor = (status: string): string => {
  switch (status) {
  case 'active': return 'text-green-600 bg-green-100';
  case 'inactive': return 'text-gray-600 bg-gray-100';
  case 'error': return 'text-red-600 bg-red-100';
  case 'expired': return 'text-orange-600 bg-orange-100';
  default: return 'text-gray-600 bg-gray-100';
};
  const getScopeIcon = (category: string): string => {
  switch (category) {
  case 'profile': return '👤';
  case 'email': return '📧';
  case 'calendar': return '📅';
  case 'files': return '📁';
  case 'repositories': return '🔀';
  default: return '⚙️';
};
  const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {)
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(date);
  };
  const isAccountLinked = (providerId: string): boolean => {
    return linkedAccounts.some(account => account.providerId === providerId);
  };
  if (loading) {
    return;
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading OAuth accounts...</span>
      </div>
    );
  return;
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Connected Accounts</h1>
        <p className="text-gray-600">
          Manage your OAuth provider connections and account permissions
        </p>
      </div>
      {/* Error Display */}
      {error && ()
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linked Accounts */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Linked Accounts</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    OAuth providers connected to your account
                  </p>
                </div>
                <button
                  onClick={() => setShowLinkProvider(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Link Account
                </button>
              </div>
            </div>
            <div className="p-6">
              {linkedAccounts.length === 0 ? ()
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts linked</h3>
                  <p className="text-gray-600 mb-4">
                    Connect OAuth providers to enable single sign-on and access your data securely
                  </p>
                  <button
                    onClick={() => setShowLinkProvider(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Link Your First Account
                  </button>
                </div>
              ) : ()
                <div className="space-y-4">
                  {linkedAccounts.map((account) => ()
                    <div
                      key={account.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
  selectedAccount?.id === account.id
  ? 'border-blue-500 bg-blue-50'
  : 'border-gray-200 hover:border-gray-300',
}`}
                      onClick={() => setSelectedAccount(account)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="relative">
                            <img
                              src={account.avatarUrl || '/icons/default-avatar.svg'}
                              alt={account.accountName}
                              className="w-10 h-10 rounded-full"
                              onError={(e) => {
                                e.currentTarget.src = '/icons/default-avatar.svg';
                              }}
                            />
                            <img
                              src={availableProviders.find(p => p.id === account.providerId)?.iconUrl || '/icons/oauth-default.svg'}
                              alt={account.providerDisplayName}
                              className="w-4 h-4 absolute -bottom-1 -right-1 rounded border border-white"
                              onError={(e) => {
                                e.currentTarget.src = '/icons/oauth-default.svg';
                              }}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="flex items-center">
                              <h3 className="font-semibold text-gray-900">{account.accountName}</h3>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>}
                                {account.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {account.accountEmail} • {account.providerDisplayName}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <span>{account.scopes.length} permissions</span>
                              <span className="mx-2">•</span>
                              <span>Linked {formatDate(account.linkedAt)}</span>
                              {account.lastUsedAt && ()
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Used {formatDate(account.lastUsedAt)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              refreshAccount(account.id);
                            }}
                            disabled={refreshing[account.id]}
                            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                            title="Refresh connection"
                          >
                            {refreshing[account.id] ? ()
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : ()
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              unlinkAccount(account.id);
                            }}
                            disabled={unlinking[account.id]}
                            className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                            title="Unlink account"
                          >
                            {unlinking[account.id] ? ()
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : ()
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      {/* Permissions preview */}
                      {account.permissions.length > 0 && ()
                        <div className="mt-3 flex flex-wrap gap-2">
                          {account.permissions.slice(0, 4).map((permission) => ()
                            <span
                              key={permission.scope}
                              className="inline-flex items-center text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                            >
                              <span className="mr-1">{getScopeIcon(permission.category)}</span>
                              {permission.description}
                            </span>
                          ))}
                          {account.permissions.length > 4 && ()
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{account.permissions.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Account Details */}
        <div className="lg:col-span-1">
          {selectedAccount ? ()
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center mb-3">
                  <img
                    src={selectedAccount.avatarUrl || '/icons/default-avatar.svg'}
                    alt={selectedAccount.accountName}
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) => {
                      e.currentTarget.src = '/icons/default-avatar.svg';
                    }}
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedAccount.accountName}</h2>
                    <p className="text-sm text-gray-600">{selectedAccount.providerDisplayName}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAccount.status)}`}>}
                  {selectedAccount.status.toUpperCase()}
                </span>
              </div>
              <div className="p-6 space-y-4">
                {/* Account Information */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Account Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-900">{selectedAccount.accountEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Provider:</span>
                      <span className="text-gray-900">{selectedAccount.providerDisplayName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account ID:</span>
                      <span className="text-gray-900 font-mono text-xs">{selectedAccount.accountId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Linked:</span>
                      <span className="text-gray-900">{formatDate(selectedAccount.linkedAt)}</span>
                    </div>
                    {selectedAccount.lastUsedAt && ()
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Used:</span>
                        <span className="text-gray-900">{formatDate(selectedAccount.lastUsedAt)}</span>
                      </div>
                    )}
                    {selectedAccount.expiresAt && ()
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expires:</span>
                        <span className="text-gray-900">{formatDate(selectedAccount.expiresAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Permissions */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Permissions</h3>
                  <div className="space-y-2">
                    {selectedAccount.permissions.map((permission) => ()
                      <div key={permission.scope} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2">{getScopeIcon(permission.category)}</span>
                          <div>
                            <div className="text-sm text-gray-900">{permission.description}</div>
                            <div className="text-xs text-gray-500">{permission.scope}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {permission.required && ()
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                          )}
                          <span className={`w-2 h-2 rounded-full ${
  permission.granted ? 'bg-green-400' : 'bg-red-400',
}`}></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Security Information */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Security</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Security Level:</span>
                      <span className={`font-medium ${
  selectedAccount.metadata.securityLevel === 'high' ? 'text-green-600' :,
  selectedAccount.metadata.securityLevel === 'standard' ? 'text-blue-600' :,
  'text-gray-600'
}`}>
                        {selectedAccount.metadata.securityLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Token Type:</span>
                      <span className="text-gray-900">{selectedAccount.metadata.tokenType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Refresh Token:</span>
                      <span className={selectedAccount.metadata.hasRefreshToken ? 'text-green-600' : 'text-red-600'}>
                        {selectedAccount.metadata.hasRefreshToken ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Login Count:</span>
                      <span className="text-gray-900">{selectedAccount.metadata.loginCount}</span>
                    </div>
                  </div>
                </div>
                {/* Compliance */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Compliance</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">GDPR Consent:</span>
                      <span className={selectedAccount.metadata.complianceFlags.gdprConsent ? 'text-green-600' : 'text-red-600'}>
                        {selectedAccount.metadata.complianceFlags.gdprConsent ? 'Granted' : 'Not Granted'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">CCPA Consent:</span>
                      <span className={selectedAccount.metadata.complianceFlags.ccpaConsent ? 'text-green-600' : 'text-red-600'}>
                        {selectedAccount.metadata.complianceFlags.ccpaConsent ? 'Granted' : 'Not Granted'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Data Processing:</span>
                      <span className={selectedAccount.metadata.complianceFlags.dataProcessingConsent ? 'text-green-600' : 'text-red-600'}>
                        {selectedAccount.metadata.complianceFlags.dataProcessingConsent ? 'Consented' : 'Not Consented'}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => refreshAccount(selectedAccount.id)}
                    disabled={refreshing[selectedAccount.id]}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center"
                  >
                    {refreshing[selectedAccount.id] ? ()
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Refreshing...
                      </>
                    ) : ()
                      'Refresh Connection'
                    )}
                  </button>
                  <button
                    onClick={() => unlinkAccount(selectedAccount.id)}
                    disabled={unlinking[selectedAccount.id]}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-300 flex items-center justify-center"
                  >
                    {unlinking[selectedAccount.id] ? ()
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Unlinking...
                      </>
                    ) : ()
                      'Unlink Account'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : ()
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p>Select an account to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Link Provider Modal */}
      {showLinkProvider && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Link OAuth Account</h3>
                <button
                  onClick={() => setShowLinkProvider(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Choose an OAuth provider to link to your account
              </p>
              <div className="space-y-3">
                {availableProviders
                  .filter(provider => provider.status === 'available' || provider.status === 'configured')
                  .map((provider) => {
                    const isLinked = isAccountLinked(provider.id);
                    return;
                      <button
                        key={provider.id}
                        onClick={() => {
                          if (!isLinked) {
                            initiateOAuthLink(provider.id);
                        }}
                        disabled={linking[provider.id] || isLinked}
                        className={`w-full p-3 border rounded-lg flex items-center transition-all ${
  isLinked
  ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
  : linking[provider.id],
  ? 'bg-gray-50 border-gray-200 cursor-wait'
  : 'hover:bg-gray-50 border-gray-200',
}`}
                      >
                        <img
                          src={provider.iconUrl}
                          alt={provider.displayName}
                          className="w-6 h-6 mr-3"
                          onError={(e) => {
                            e.currentTarget.src = '/icons/oauth-default.svg';
                          }}
                        />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">{provider.displayName}</div>
                          <div className="text-sm text-gray-600">{provider.description}</div>
                        </div>
                        <div className="ml-2">
                          {linking[provider.id] ? ()
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : isLinked ? ()
                            <span className="text-xs text-green-600 font-medium">LINKED</span>
                          ) : ()
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
              {availableProviders.filter(p => p.status === 'available' || p.status === 'configured').length === 0 && ()
                <div className="text-center py-4">
                  <p className="text-gray-500">No OAuth providers available</p>
                  <p className="text-sm text-gray-400 mt-1">Contact your administrator to configure OAuth providers</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuthUserAccountManager;
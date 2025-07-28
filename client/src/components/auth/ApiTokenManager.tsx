// Epic 11 API Token Manager Component
// React component for managing API tokens with scope-based authorization
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
interface ApiToken {
  id: string;,
  name: string;
  scopes: string;,
  expiresAt: string;
  createdAt: string;
  lastUsedAt?: string;
  revoked: boolean;
  interface ApiTokenStats {
  totalTokens: number;,
  activeTokens: number;
  revokedTokens: number;,
  expiredTokens: number;
  recentlyUsed: unknown;
  interface Scope {
  name: string;,
  description: string;
  category: string;
  interface ApiTokenManagerProps {
  onTokenCreated?: (token: ApiToken) => void;
  onTokenRevoked?: (tokenId: string) => void;
  export const ApiTokenManager: React.FC<ApiTokenManagerProps> = ({,)
  onTokenCreated,
  onTokenRevoked
}) => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<ApiToken>([]);
  const [stats, setStats] = useState<ApiTokenStats | null>(null);
  const [availableScopes, setAvailableScopes] = useState<Scope>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newToken, setNewToken] = useState<{ token: string; tokenId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Form state
  const [tokenName, setTokenName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string>([]);
  const [expiresIn, setExpiresIn] = useState('90d');
  useEffect(() => {
    if (user) {
      fetchTokens();
      fetchStats();
      fetchAvailableScopes();
  }, [user]);
  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/auth/api-tokens', {)
  headers: {,
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      const data = await response.json();
      setTokens(data.tokens);
    } catch (error) {
  console.error('Error fetching tokens:', error);
  setError('Failed to load API tokens');
} finally {
      setLoading(false);
  };
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/auth/api-tokens/stats', {)
  headers: {,
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
    } catch (error) {
  console.error('Error fetching stats:', error);
};
  const fetchAvailableScopes = async () => {
    try {
      const response = await fetch('/api/auth/api-tokens/scopes');
      if (response.ok) {
        const data = await response.json();
        setAvailableScopes(data.scopes);
    } catch (error) {
  console.error('Error fetching scopes:', error);
};
  const createToken = async () => {
    if (!tokenName.trim() || selectedScopes.length === 0) {
      setError('Please provide a token name and select at least one scope');
      return;
    try {
      setCreating(true);
      setError(null);
      const response = await fetch('/api/auth/api-tokens', {)
  method: 'POST',
        headers: {,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
  },
  body: JSON.stringify({,)
  name: tokenName,
  scopes: selectedScopes,
  expiresIn
}
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create token');
      const data = await response.json();
      setNewToken({ token: data.token, tokenId: data.tokenId });
      // Refresh token list
      await fetchTokens();
      await fetchStats();
      // Reset form
      setTokenName('');
      setSelectedScopes([]);
      setExpiresIn('90d');
      onTokenCreated?.(data);
    } catch (error) {
  console.error('Error creating token:', error);
  setError(error.message || 'Failed to create token');
} finally {
      setCreating(false);
  };
  const revokeToken = async (tokenId: string) => {
    try {
      setRevoking(tokenId);
      const response = await fetch('/api/auth/api-tokens/revoke', {)
  method: 'POST',
        headers: {,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
  },
  body: JSON.stringify({ tokenId })
      });
      if (!response.ok) {
        throw new Error('Failed to revoke token');
      // Update local state
      setTokens(tokens.map(token => )
        token.id === tokenId ? { ...token, revoked: true } : token
      ));
      await fetchStats();
      onTokenRevoked?.(tokenId);
    } catch (error) {
  console.error('Error revoking token:', error);
  setError('Failed to revoke token');
} finally {
      setRevoking(null);
  };
  const handleScopeToggle = (scope: string) => {
  setSelectedScopes(prev => )
  prev.includes(scope)
  ? prev.filter(s => s !== scope)
  : [...prev, scope]);
};
  const formatExpiresAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isExpired = date < now;
    const formatted = date.toLocaleDateString();
    return isExpired ? `${formatted} (Expired)` : formatted;}
  };
  const formatLastUsed = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;}
    return date.toLocaleDateString();
  };
  const getScopesByCategory = () => {
    const categories = availableScopes.reduce((acc, scope) => {
      if (!acc[scope.category]) {
        acc[scope.category] = [];
      acc[scope.category].push(scope);
      return acc;
    }, {} as Record<string, Scope>);
    return categories;
  };
  const getScopeBadgeColor = (scope: string) => {
  if (scope === '*') return 'bg-red-100 text-red-800';
  if (scope.startsWith('admin:')) return 'bg-purple-100 text-purple-800';
  if (scope.startsWith('graphs:')) return 'bg-blue-100 text-blue-800';
  if (scope.startsWith('user:')) return 'bg-green-100 text-green-800';
  if (scope.startsWith('organizations:')) return 'bg-yellow-100 text-yellow-800';
  if (scope.startsWith('teams:')) return 'bg-indigo-100 text-indigo-800';
  return 'bg-gray-100 text-gray-800';
};
  if (loading) {
    return;
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  return;
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">API Tokens</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          {showCreateForm ? 'Cancel' : 'Create Token'}
        </button>
      </div>
      {/* Statistics */}
      {stats && ()
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.activeTokens}</div>
            <div className="text-sm text-blue-600">Active</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.totalTokens}</div>
            <div className="text-sm text-green-600">Total</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.revokedTokens}</div>
            <div className="text-sm text-red-600">Revoked</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.expiredTokens}</div>
            <div className="text-sm text-yellow-600">Expired</div>
          </div>
        </div>
      )}
      {/* New Token Display */}
      {newToken && ()
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-green-800">Token Created Successfully</h4>
            <button
              onClick={() => setNewToken(null)}
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
          <div className="bg-white p-3 rounded border font-mono text-sm break-all">
            {newToken.token}
          </div>
          <p className="text-sm text-green-700 mt-2">
            ⚠️ Store this token securely. It will not be shown again.
          </p>
        </div>
      )}
      {/* Create Token Form */}
      {showCreateForm && ()
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">Create New API Token</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Name
              </label>
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., My Integration Token"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires In
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="30d">30 days</option>
                <option value="90d">90 days</option>
                <option value="1y">1 year</option>
                <option value="2y">2 years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scopes
              </label>
              <div className="space-y-3">
                {Object.entries(getScopesByCategory()).map(([category, scopes]) => ()
                  <div key={category} className="border border-gray-200 rounded-lg p-3">
                    <h5 className="font-medium text-gray-900 mb-2 capitalize">{category}</h5>
                    <div className="space-y-2">
                      {scopes.map((scope) => ()
                        <label key={scope.name} className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedScopes.includes(scope.name)}
                            onChange={() => handleScopeToggle(scope.name)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm text-gray-900">{scope.name}</div>
                            <div className="text-xs text-gray-500">{scope.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createToken}
                disabled={creating || !tokenName.trim() || selectedScopes.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {creating ? 'Creating...' : 'Create Token'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Error Message */}
      {error && ()
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-700">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}
      {/* Tokens List */}
      <div className="space-y-4">
        {tokens.map((token) => ()
          <div
            key={token.id}
            className={`border rounded-lg p-4 ${
  token.revoked
  ? 'border-red-200 bg-red-50'
  : new Date(token.expiresAt) < new Date(),
  ? 'border-yellow-200 bg-yellow-50'
  : 'border-gray-200 bg-white',
}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{token.name}</h4>
                  {token.revoked && ()
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Revoked
                    </span>
                  )}
                  {new Date(token.expiresAt) < new Date() && !token.revoked && ()
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Expired
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Created: {new Date(token.createdAt).toLocaleDateString()} • 
                  Expires: {formatExpiresAt(token.expiresAt)} • 
                  Last used: {formatLastUsed(token.lastUsedAt)}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {token.scopes.map((scope) => ()
                    <span
                      key={scope}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScopeBadgeColor(scope)}`}
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
              {!token.revoked && ()
                <button
                  onClick={() => revokeToken(token.id)}
                  disabled={revoking === token.id}
                  className={`ml-4 px-3 py-1 text-sm font-medium rounded-md ${
  revoking === token.id
  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
  : 'bg-red-50 text-red-700 hover:bg-red-100',
}`}
                >
                  {revoking === token.id ? 'Revoking...' : 'Revoke'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {tokens.length === 0 && ()
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">🔑</div>
          <div className="text-gray-600">No API tokens found</div>
          <div className="text-sm text-gray-500">Create a token to get started with the API</div>
        </div>
      )}
    </div>
  );
};

export default ApiTokenManager;
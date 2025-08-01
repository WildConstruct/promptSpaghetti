/**
 * OAuth Provider Manager - Epic 19.5
 * 
 * Advanced OAuth provider management interface for adding, configuring,
 * and monitoring OAuth providers with enterprise-grade features.
 * 
 * Task: T-1752989143998-560 - Build OAuth configuration UI
 * Part of Epic 19.5 - OAuth Implementation & Framework
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';

// Types and interfaces


interface OAuthProvider {
  id: string;,
  name: string;,
  displayName: string;,
  description: string;,
  iconUrl: string;,
  status: 'active' | 'inactive' | 'testing' | 'error';
  configuration?: OAuthProviderConfiguration;
  statistics?: ProviderStatistics;
  lastTested?: Date;
  createdAt: Date;,
  updatedAt: Date;
  interface OAuthProviderConfiguration {
  clientId: string;,
  clientSecret: string;,
  scopes: string;,
  endpoints: {,
  authorization: string;,
  token: string;,
  userInfo: string;
  revocation?: string;


};
  redirectUri: string;,
  additionalParams: Record<string, string>;
  securitySettings: {,
  enablePKCE: boolean;
  enableCertificatePinning: boolean;,
  enableMTLS: boolean;,
  stateParameterLength: number;,
  tokenBindingRequired: boolean;
};
  complianceSettings: {,
  gdprCompliant: boolean;
  ccpaCompliant: boolean;,
  dataRetentionDays: number;,
  auditLevel: 'basic' | 'standard' | 'enhanced';
};


interface ProviderStatistics {
  totalLogins: number;,
  successfulLogins: number;,
  failedLogins: number;
  lastLoginAt?: Date;
  averageResponseTime: number;,
  uptime: number;,
  errorRate: number;
  interface ProviderTestResult {
  success: boolean;,
  responseTime: number;,
  errors: string;,
  warnings: string;,
  endpoints: {,
  authorization: boolean;,
  token: boolean;,
  userInfo: boolean;


};
  securityChecks: {,
  tlsVersion: string;
  certificateValid: boolean;,
  pkceSupported: boolean;
};

export const OAuthProviderManager = () => { return null; },
  method: 'POST';
  });
      const data = await response.json();
      if (data.success) {
        setTestResults(prev => ({ ...prev, [providerId]: data.data.testResult }));
        setShowTestResults(true);
 else {
        setError(`Failed to test provider: ${data.message}`);}
 catch (err) {
      setError(`Failed to test provider: ${err.message}`);}
 finally {
      setTesting(prev => ({ ...prev, [providerId]: false }));
  };
  const toggleProviderStatus = async (providerId: string, newStatus: 'active' | 'inactive') => {
    try {
      const response = await authenticatedFetch(`/api/oauth-guidance/provider/${providerId}/status`, {)}
  },
  method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        await loadProviders(); // Reload providers to reflect changes
 else {
        setError(`Failed to update provider status: ${data.message}`);}
 catch (err) {
      setError(`Failed to update provider status: ${err.message}`);}
  };
  const deleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this OAuth provider? This action cannot be undone.')) {
      return;
    try {
      const response = await authenticatedFetch(`/api/oauth-guidance/provider/${providerId}`, {)}
  },
  method: 'DELETE';
  });
      const data = await response.json();
      if (data.success) {
        await loadProviders();
        if (selectedProvider?.id === providerId) {
          setSelectedProvider(null);
 else {
        setError(`Failed to delete provider: ${data.message}`);}
 catch (err) {
      setError(`Failed to delete provider: ${err.message}`);}
  };
  // Utility functions
  const getStatusColor = (status: string): string => {
  switch (status) {
  case 'active': return 'text-green-600 bg-green-100';
  case 'inactive': return 'text-red-600 bg-red-100';
  case 'testing': return 'text-blue-600 bg-blue-100';
  case 'error': return 'text-red-600 bg-red-100';
  default: return 'text-gray-600 bg-gray-100';
};
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };
  const formatPercentage = (num: number): string => {
    return `${(num * 100).toFixed(1)}%`;}
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
  if (loading) {
    return;
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading OAuth providers...</span>
      </div>
    );
  return;
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">OAuth Provider Management</h1>
            <p className="text-gray-600">Manage and monitor OAuth 2.1 providers with enterprise security features</p>
          </div>
          <button
            onClick={() => setShowAddProvider(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Provider
          </button>
        </div>
      </div>
      {/* Error Display */}
      {error && ()
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">OAuth Providers</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your OAuth 2.1 provider configurations</p>
            </div>
            <div className="p-6">
              {providers.length === 0 ? ()
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No OAuth providers configured</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first OAuth provider</p>
                  <button
                    onClick={() => setShowAddProvider(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Your First Provider
                  </button>
                </div>
              ) : ()
                <div className="space-y-4">
                  {providers.map((provider) => ()
                    <div
                      key={provider.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
  selectedProvider?.id === provider.id
  ? 'border-blue-500 bg-blue-50'
  : 'border-gray-200 hover:border-gray-300',
`}
                      onClick={() => setSelectedProvider(provider)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={provider.iconUrl}
                            alt={provider.displayName}
                            className="w-8 h-8 mr-3 rounded"
                            onError={(e) => {
                              e.currentTarget.src = '/icons/oauth-default.svg';
}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{provider.displayName}</h3>
                            <p className="text-sm text-gray-600">{provider.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>}
                            {provider.status.toUpperCase()}
                          </span>
                          {/* Action buttons */}
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                testProvider(provider.id);
}
                              disabled={testing[provider.id]}
                              className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                              title="Test provider"
                            >
                              {testing[provider.id] ? ()
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              ) : ()
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={(e) => {
  e.stopPropagation();
  toggleProviderStatus(provider.id, provider.status === 'active' ? 'inactive' : 'active');
}
                              className="text-gray-600 hover:text-gray-800"
                              title={provider.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProvider(provider.id);
}
                              className="text-red-600 hover:text-red-800"
                              title="Delete provider"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Provider statistics */}
                      {provider.statistics && ()
                        <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Total Logins:</span>
                            <div className="font-semibold">{formatNumber(provider.statistics.totalLogins)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Success Rate:</span>
                            <div className="font-semibold text-green-600">
                              {formatPercentage(provider.statistics.successfulLogins / provider.statistics.totalLogins)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Uptime:</span>
                            <div className="font-semibold">{formatPercentage(provider.statistics.uptime)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Avg Response:</span>
                            <div className="font-semibold">{provider.statistics.averageResponseTime}ms</div>
                          </div>
                        </div>
                      )}
                      {provider.lastTested && ()
                        <div className="mt-2 text-xs text-gray-500">
                          Last tested: {formatDate(provider.lastTested)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Provider Details */}
        <div className="lg:col-span-1">
          {selectedProvider ? ()
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center mb-2">
                  <img
                    src={selectedProvider.iconUrl}
                    alt={selectedProvider.displayName}
                    className="w-8 h-8 mr-3 rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/icons/oauth-default.svg';
}
                  />
                  <h2 className="text-lg font-semibold text-gray-900">{selectedProvider.displayName}</h2>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProvider.status)}`}>}
                  {selectedProvider.status.toUpperCase()}
                </span>
              </div>
              <div className="p-6 space-y-4">
                {/* Provider Information */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Provider Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Provider ID:</span>
                      <div className="font-mono text-gray-900">{selectedProvider.id}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <div className="text-gray-900">{formatDate(selectedProvider.createdAt)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Updated:</span>
                      <div className="text-gray-900">{formatDate(selectedProvider.updatedAt)}</div>
                    </div>
                  </div>
                </div>
                {/* Configuration Summary */}
                {selectedProvider.configuration && ()
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Configuration Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Scopes:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedProvider.configuration.scopes.map((scope) => ()
                            <span key={scope} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {scope}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Security Features:</span>
                        <div className="space-y-1 mt-1">
                          {selectedProvider.configuration.securitySettings.enablePKCE && ()
                            <div className="text-xs text-green-600">✓ PKCE Enabled</div>
                          )}
                          {selectedProvider.configuration.securitySettings.enableCertificatePinning && ()
                            <div className="text-xs text-green-600">✓ Certificate Pinning</div>
                          )}
                          {selectedProvider.configuration.securitySettings.enableMTLS && ()
                            <div className="text-xs text-green-600">✓ Mutual TLS</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Statistics */}
                {selectedProvider.statistics && ()
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Usage Statistics</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Logins:</span>
                        <span className="font-semibold">{formatNumber(selectedProvider.statistics.totalLogins)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Success Rate:</span>
                        <span className="font-semibold text-green-600">
                          {formatPercentage(selectedProvider.statistics.successfulLogins / selectedProvider.statistics.totalLogins)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Error Rate:</span>
                        <span className="font-semibold text-red-600">
                          {formatPercentage(selectedProvider.statistics.errorRate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Uptime:</span>
                        <span className="font-semibold">{formatPercentage(selectedProvider.statistics.uptime)}</span>
                      </div>
                      {selectedProvider.statistics.lastLoginAt && ()
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Login:</span>
                          <span className="font-semibold">{formatDate(selectedProvider.statistics.lastLoginAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => testProvider(selectedProvider.id)}
                    disabled={testing[selectedProvider.id]}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center"
                  >
                    {testing[selectedProvider.id] ? ()
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Testing...
                      </>
                    ) : ()
                      'Test Provider'
                    )}
                  </button>
                  <button
                    onClick={() => toggleProviderStatus(selectedProvider.id, selectedProvider.status === 'active' ? 'inactive' : 'active')}
                    className={`w-full px-4 py-2 rounded-md ${
  selectedProvider.status === 'active'
  ? 'bg-red-600 text-white hover:bg-red-700',
  : 'bg-green-600 text-white hover:bg-green-700',
`}
                  >
                    {selectedProvider.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ) : ()
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Select a provider to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Test Results Modal */}
      {showTestResults && Object.keys(testResults).length > 0 && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Provider Test Results</h3>
                <button
                  onClick={() => setShowTestResults(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              {Object.entries(testResults).map(([providerId, result]) => {
                const provider = providers.find(p => p.id === providerId);
                if (!provider) return null;
                return;
                  <div key={providerId} className="mb-6 last:mb-0">
                    <div className="flex items-center mb-4">
                      <img
                        src={provider.iconUrl}
                        alt={provider.displayName}
                        className="w-6 h-6 mr-2 rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/icons/oauth-default.svg';
}
                      />
                      <h4 className="font-semibold text-gray-900">{provider.displayName}</h4>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
`}>
                        {result.success ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Endpoint Tests</h5>
                        <div className="space-y-1">
                          {Object.entries(result.endpoints).map(([endpoint, passed]) => ()
                            <div key={endpoint} className="flex items-center text-sm">
                              <span className={`mr-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>}
                                {passed ? '✓' : '✗'}
                              </span>
                              <span className="capitalize">{endpoint}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Security Checks</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>TLS Version:</span>
                            <span className="font-mono">{result.securityChecks.tlsVersion}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Certificate:</span>
                            <span className={result.securityChecks.certificateValid ? 'text-green-600' : 'text-red-600'}>
                              {result.securityChecks.certificateValid ? 'Valid' : 'Invalid'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>PKCE Support:</span>
                            <span className={result.securityChecks.pkceSupported ? 'text-green-600' : 'text-red-600'}>
                              {result.securityChecks.pkceSupported ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Response time: <span className="font-semibold">{result.responseTime}ms</span>
                    </div>
                    {result.errors.length > 0 && ()
                      <div className="mt-3">
                        <h5 className="font-medium text-red-900 mb-1">Errors:</h5>
                        <div className="space-y-1">
                          {result.errors.map((error, index) => ()
                            <div key={index} className="bg-red-50 text-red-700 p-2 rounded text-sm">
                              {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.warnings.length > 0 && ()
                      <div className="mt-3">
                        <h5 className="font-medium text-yellow-900 mb-1">Warnings:</h5>
                        <div className="space-y-1">
                          {result.warnings.map((warning, index) => ()
                            <div key={index} className="bg-yellow-50 text-yellow-700 p-2 rounded text-sm">
                              {warning}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuthProviderManager;
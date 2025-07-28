/**
 * OAuth Configuration Interface - Epic 19.5
 * 
 * Comprehensive OAuth provider configuration and management interface.
 * Integrates with existing OAuthGuidanceService for enterprise-grade OAuth setup.
 * 
 * Task: T-1752989143998-560 - Build OAuth configuration UI
 * Part of Epic 19.5 - OAuth Implementation & Framework
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';

// Types and interfaces
interface OAuthProvider {
  id: string;,
  name: string;
  displayName: string;,
  description: string;
  iconUrl: string;,
  supportedScopes: string;
  requiredScopes: string;,
  endpoints: {,
  authorization: string;,
  token: string;
  userInfo: string;
};
  configuration?: OAuthConfiguration;
interface OAuthConfiguration {
  id: string;,
  providerId: string;
  clientId: string;,
  clientSecret: string;
  scopes: string;,
  redirectUri: string;
  additionalParams: Record<string, string>;
  securitySettings: SecuritySettings;,
  complianceSettings: ComplianceSettings;
  status: 'draft' | 'active' | 'inactive' | 'testing';,
  createdAt: Date;
  updatedAt: Date;
  interface SecuritySettings {
  enablePKCE: boolean;,
  enableCertificatePinning: boolean;
  enableMTLS: boolean;,
  stateParameterLength: number;
  tokenBindingRequired: boolean;,
  allowedRedirectDomains: string;
  sessionTimeout: number;
  interface ComplianceSettings {
  gdprCompliant: boolean;,
  ccpaCompliant: boolean;
  soxCompliant: boolean;,
  hipaaCompliant: boolean;
  retentionPeriodDays: number;,
  auditLevel: 'basic' | 'standard' | 'enhanced';
  interface SecurityAssessment {
  score: number;,
  level: 'low' | 'medium' | 'high' | 'maximum';
  findings: SecurityFinding;,
  recommendations: string;
  complianceStatus: ComplianceStatus;
  interface SecurityFinding {
  severity: 'info' | 'warning' | 'error' | 'critical';,
  category: string;
  message: string;,
  recommendation: string;
  interface ComplianceStatus {
  overall: boolean;,
  frameworks: {,
  gdpr: boolean;,
  ccpa: boolean;
  sox: boolean;,
  hipaa: boolean;
};
  issues: ComplianceIssue;
interface ComplianceIssue {
  framework: string;,
  issue: string;
  severity: 'low' | 'medium' | 'high';,
  remediation: string;
interface ValidationResult {
  valid: boolean;,
  errors: ValidationError;
  warnings: ValidationWarning;
interface ValidationError {
  field: string;,
  message: string;
  code: string;
interface ValidationWarning {
  field: string;,
  message: string;
  recommendation: string;

// OAuth Configuration Interface Component
export const OAuthConfigurationInterface: React.FC = () => {
  // State management
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [configuration, setConfiguration] = useState<Partial<OAuthConfiguration>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_providers, _setProviders] = useState<OAuthProvider>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_configurations, setConfigurations] = useState<OAuthConfiguration>([]);
  const [securityAssessment, setSecurityAssessment] = useState<SecurityAssessment | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'security' | 'compliance' | 'testing'>('basic');
  // Auth store for API calls
  const { authenticatedFetch } = useAuthStore();
  // Available OAuth providers
  const availableProviders: OAuthProvider = useMemo(() => [
    {
  id: 'google',
  name: 'google',
  displayName: 'Google',
  description: 'Google OAuth 2.0 with OpenID Connect',
  iconUrl: '/icons/google.svg',
  supportedScopes: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive.readonly'],
  requiredScopes: ['openid', 'email', 'profile'],
  endpoints: {,
  authorization: 'https://accounts.google.com/o/oauth2/v2/auth',
  token: 'https://oauth2.googleapis.com/token',
  userInfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
}
    {
  id: 'github',
  name: 'github',
  displayName: 'GitHub',
  description: 'GitHub OAuth 2.0 for developer workflows',
  iconUrl: '/icons/github.svg',
  supportedScopes: ['read:user', 'user:email', 'repo', 'admin:org'],
  requiredScopes: ['read:user', 'user:email'],
  endpoints: {,
  authorization: 'https://github.com/login/oauth/authorize',
  token: 'https://github.com/login/oauth/access_token',
  userInfo: 'https://api.github.com/user',
}
    {
  id: 'microsoft',
  name: 'microsoft',
  displayName: 'Microsoft',
  description: 'Microsoft OAuth 2.0 with Azure AD integration',
  iconUrl: '/icons/microsoft.svg',
  supportedScopes: ['openid', 'email', 'profile', 'offline_access', 'https://graph.microsoft.com/User.Read'],
  requiredScopes: ['openid', 'email', 'profile'],
  endpoints: {,
  authorization: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  userInfo: 'https://graph.microsoft.com/v1.0/me'], []);
  // Load existing configurations on mount
  useEffect(() => {
  loadConfigurations();
}, [loadConfigurations]);
  // Initialize default configuration when provider is selected
  useEffect(() => {
    if (selectedProvider) {
      const provider = availableProviders.find(p => p.id === selectedProvider);
      if (provider) {
        initializeConfiguration(provider);
  }, [selectedProvider, availableProviders]);
  // API functions
  const loadConfigurations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch('/api/oauth-guidance/configurations');
      const data = await response.json();
      if (data.success) {
        setConfigurations(data.data.configurations || []);
    } catch (error) {
  console.error('Failed to load OAuth configurations:', error);
} finally {
      setLoading(false);
  }, [authenticatedFetch]);
  const initializeConfiguration = (provider: OAuthProvider) => {
    const defaultConfig: Partial<OAuthConfiguration> = {,
  providerId: provider.id,
      scopes: provider.requiredScopes,
      redirectUri: `${window.location.origin}/auth/oauth/callback/${provider.id}`}
},
  additionalParams: {},
      securitySettings: {,
  enablePKCE: true,
  enableCertificatePinning: true,
  enableMTLS: false,
  stateParameterLength: 32,
  tokenBindingRequired: false,
  allowedRedirectDomains: [window.location.hostname],
  sessionTimeout: 3600 // 1 hour,
},
  complianceSettings: {,
  gdprCompliant: true,
  ccpaCompliant: true,
  soxCompliant: false,
  hipaaCompliant: false,
  retentionPeriodDays: 90,
  auditLevel: 'standard',
},
  status: 'draft';
  };
    setConfiguration(defaultConfig);
  };
  const validateConfiguration = async (config: Partial<OAuthConfiguration>): Promise<ValidationResult> => {
    try {
      const response = await authenticatedFetch('/api/oauth-guidance/validate-configuration', {)
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configuration: config })
      });
      const data = await response.json();
      return data.data.validation;
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      return {
        valid: false,
        errors: [{ field: 'general', message: 'Validation failed', code: 'VALIDATION_ERROR' }],
        warnings: [];
  };
  };
  const runSecurityAssessment = async (config: Partial<OAuthConfiguration>): Promise<SecurityAssessment> => {
    try {
      const response = await authenticatedFetch('/api/oauth-guidance/security-assessment', {)
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configuration: config })
      });
      const data = await response.json();
      return data.data.assessment;
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      return {
        score: 0,
        level: 'low',
        findings: [{ severity: 'error', category: 'Assessment', message: 'Security assessment failed', recommendation: 'Check configuration and try again' }],
        recommendations: ['Review configuration and try again'],
        complianceStatus: {,
  overall: false,
          frameworks: { gdpr: false, ccpa: false, sox: false, hipaa: false },
          issues: [];
  };
  };
  const testConfiguration = async (config: Partial<OAuthConfiguration>): Promise<boolean> => {
    setTesting(true);
    try {
      const response = await authenticatedFetch('/api/oauth-guidance/test-configuration', {)
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configuration: config })
      });
      const data = await response.json();
      return data.success;
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      return false;
    } finally {
      setTesting(false);
  };
  const saveConfiguration = async () => {
    setSaving(true);
    try {
      // Validate before saving
      const validationResult = await validateConfiguration(configuration);
      setValidation(validationResult);
      if (!validationResult.valid) {
        setSaving(false);
        return;
      // Run security assessment
      const assessment = await runSecurityAssessment(configuration);
      setSecurityAssessment(assessment);
      // Save configuration
      const method = configuration.id ? 'PUT' : 'POST';
      const url = configuration.id ;
        ? `/api/oauth-guidance/configuration/${configuration.id}`}
        : '/api/oauth-guidance/generate-configuration';
      const response = await authenticatedFetch(url, {)
  method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({,)
  provider: selectedProvider,
  configuration,
  requirements: {,
  security_level: 'high',
  compliance_frameworks: getSelectedFrameworks(),
  custom_requirements: [],
}
      });
      const data = await response.json();
      if (data.success) {
        await loadConfigurations();
        // Update current configuration with saved data
        if (data.data.configuration) {
          setConfiguration(data.data.configuration);
    } catch (error) {
  console.error('Failed to save OAuth configuration:', error);
} finally {
      setSaving(false);
  };
  const getSelectedFrameworks = (): string => {
  const frameworks: string = [];
  if (configuration.complianceSettings?.gdprCompliant) frameworks.push('GDPR');
  if (configuration.complianceSettings?.ccpaCompliant) frameworks.push('CCPA');
  if (configuration.complianceSettings?.soxCompliant) frameworks.push('SOX');
  if (configuration.complianceSettings?.hipaaCompliant) frameworks.push('HIPAA');
  return frameworks;
};
  // Update configuration helper
  const updateConfiguration = (updates: Partial<OAuthConfiguration>) => {
    setConfiguration(prev => ({ ...prev, ...updates }));
  };
  const updateSecuritySettings = (updates: Partial<SecuritySettings>) => {
    setConfiguration(prev => ({)
  ...prev,
      securitySettings: { ...prev.securitySettings!, ...updates }
    }));
  };
  const updateComplianceSettings = (updates: Partial<ComplianceSettings>) => {
    setConfiguration(prev => ({)
  ...prev,
      complianceSettings: { ...prev.complianceSettings!, ...updates }
    }));
  };
  // Get security level color
  const getSecurityLevelColor = (level: string): string => {
  switch (level) {
  case 'low': return 'text-red-600';
  case 'medium': return 'text-yellow-600';
  case 'high': return 'text-blue-600';
  case 'maximum': return 'text-green-600';
  default: return 'text-gray-600';
};
  // Get compliance status color
  const getComplianceColor = (compliant: boolean): string => {
  return compliant ? 'text-green-600' : 'text-red-600';
};
  if (loading) {
    return;
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading OAuth configurations...</span>
      </div>
    );
  return;
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">OAuth Configuration</h1>
        <p className="text-gray-600">Configure OAuth 2.1 providers with enterprise security and compliance features</p>
      </div>
      {/* Provider Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select OAuth Provider
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableProviders.map((provider) => ()
            <div
              key={provider.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
  selectedProvider === provider.id
  ? 'border-blue-500 bg-blue-50'
  : 'border-gray-200 hover:border-gray-300',
}`}
              onClick={() => setSelectedProvider(provider.id)}
            >
              <div className="flex items-center mb-2">
                <img
                  src={provider.iconUrl}
                  alt={provider.displayName}
                  className="w-6 h-6 mr-2"
                  onError={(e) => {
                    e.currentTarget.src = '/icons/oauth-default.svg';
                  }}
                />
                <h3 className="font-semibold text-gray-900">{provider.displayName}</h3>
              </div>
              <p className="text-sm text-gray-600">{provider.description}</p>
              <div className="mt-2">
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {provider.supportedScopes.length} scopes available
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Configuration Tabs */}
      {selectedProvider && ()
        <div className="border rounded-lg">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'basic', label: 'Basic Configuration', icon: '⚙️' },
                { id: 'security', label: 'Security Settings', icon: '🔒' },
                { id: 'compliance', label: 'Compliance', icon: '📋' },
                { id: 'testing', label: 'Test & Deploy', icon: '🧪' }
              ].map((tab) => ()
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
  activeTab === tab.id
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
}`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {/* Basic Configuration Tab */}
            {activeTab === 'basic' && ()
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID *
                    </label>
                    <input
                      type="text"
                      value={configuration.clientId || ''}
                      onChange={(e) => updateConfiguration({ clientId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter OAuth client ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Secret *
                    </label>
                    <input
                      type="password"
                      value={configuration.clientSecret || ''}
                      onChange={(e) => updateConfiguration({ clientSecret: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter OAuth client secret"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Redirect URI *
                  </label>
                  <input
                    type="url"
                    value={configuration.redirectUri || ''}
                    onChange={(e) => updateConfiguration({ redirectUri: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourapp.com/auth/oauth/callback/provider"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OAuth Scopes
                  </label>
                  <div className="space-y-2">
                    {availableProviders
                      .find(p => p.id === selectedProvider)
                      ?.supportedScopes.map((scope) => ()
                        <label key={scope} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={configuration.scopes?.includes(scope) || false}
                            onChange={(e) => {
                              const currentScopes = configuration.scopes || [];
                              const newScopes = e.target.checked;
                                ? [...currentScopes, scope]
                                : currentScopes.filter(s => s !== scope);
                              updateConfiguration({ scopes: newScopes });
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{scope}</span>
                          {availableProviders
                            .find(p => p.id === selectedProvider)
                            ?.requiredScopes.includes(scope) && ()
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </label>
                      ))}
                  </div>
                </div>
              </div>
            )}
            {/* Security Settings Tab */}
            {activeTab === 'security' && ()
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">🔒 Security Features</h3>
                  <p className="text-blue-800 text-sm">
                    Configure advanced security settings for OAuth 2.1 compliance and enterprise protection.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Authentication Security</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={configuration.securitySettings?.enablePKCE || false}
                        onChange={(e) => updateSecuritySettings({ enablePKCE: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Enable PKCE (Proof Key for Code Exchange)
                      </span>
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Recommended
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={configuration.securitySettings?.enableCertificatePinning || false}
                        onChange={(e) => updateSecuritySettings({ enableCertificatePinning: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Certificate Pinning</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={configuration.securitySettings?.enableMTLS || false}
                        onChange={(e) => updateSecuritySettings({ enableMTLS: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Mutual TLS (mTLS)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={configuration.securitySettings?.tokenBindingRequired || false}
                        onChange={(e) => updateSecuritySettings({ tokenBindingRequired: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Token Binding Required</span>
                    </label>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Session & Timeout Settings</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State Parameter Length
                      </label>
                      <select
                        value={configuration.securitySettings?.stateParameterLength || 32}
                        onChange={(e) => updateSecuritySettings({ stateParameterLength: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={16}>16 characters</option>
                        <option value={32}>32 characters (recommended)</option>
                        <option value={64}>64 characters</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session Timeout (seconds)
                      </label>
                      <input
                        type="number"
                        value={configuration.securitySettings?.sessionTimeout || 3600}
                        onChange={(e) => updateSecuritySettings({ sessionTimeout: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="300"
                        max="86400"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Redirect Domains
                  </label>
                  <textarea
                    value={configuration.securitySettings?.allowedRedirectDomains?.join('\n') || ''}
                    onChange={(e) => {
                      const domains = e.target.value.split('\n').filter(d => d.trim());
                      updateSecuritySettings({ allowedRedirectDomains: domains });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="yourapp.com&#10;api.yourapp.com&#10;admin.yourapp.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">One domain per line</p>
                </div>
                {/* Security Assessment Display */}
                {securityAssessment && ()
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Security Assessment</h4>
                    <div className="flex items-center mb-3">
                      <span className="text-2xl font-bold mr-2">{securityAssessment.score}</span>
                      <span className={`font-medium ${getSecurityLevelColor(securityAssessment.level)}`}>}
                        {securityAssessment.level.toUpperCase()} SECURITY
                      </span>
                    </div>
                    {securityAssessment.findings.length > 0 && ()
                      <div className="space-y-2">
                        {securityAssessment.findings.map((finding, index) => ()
                          <div key={index} className={`p-2 rounded text-sm ${
  finding.severity === 'critical' ? 'bg-red-100 text-red-800' :,
  finding.severity === 'error' ? 'bg-orange-100 text-orange-800' :,
  finding.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :,
  'bg-blue-100 text-blue-800'
}`}>
                            <div className="font-medium">{finding.category}: {finding.message}</div>
                            <div className="text-xs mt-1">{finding.recommendation}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Compliance Tab */}
            {activeTab === 'compliance' && ()
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-green-900 mb-2">📋 Compliance Frameworks</h3>
                  <p className="text-green-800 text-sm">
                    Configure compliance settings for regulatory requirements and data protection.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Regulatory Compliance</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={configuration.complianceSettings?.gdprCompliant || false}
                        onChange={(e) => updateComplianceSettings({ gdprCompliant: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">GDPR Compliant</span>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">EU</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={configuration.complianceSettings?.ccpaCompliant || false}
                        onChange={(e) => updateComplianceSettings({ ccpaCompliant: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">CCPA Compliant</span>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">CA</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={configuration.complianceSettings?.soxCompliant || false}
                        onChange={(e) => updateComplianceSettings({ soxCompliant: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">SOX Compliant</span>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Financial</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={configuration.complianceSettings?.hipaaCompliant || false}
                        onChange={(e) => updateComplianceSettings({ hipaaCompliant: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">HIPAA Compliant</span>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Healthcare</span>
                    </label>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Data Management</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Retention Period (days)
                      </label>
                      <select
                        value={configuration.complianceSettings?.retentionPeriodDays || 90}
                        onChange={(e) => updateComplianceSettings({ retentionPeriodDays: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={30}>30 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>6 months</option>
                        <option value={365}>1 year</option>
                        <option value={1095}>3 years</option>
                        <option value={2555}>7 years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Audit Level
                      </label>
                      <select
                        value={configuration.complianceSettings?.auditLevel || 'standard'}
                        onChange={(e) => updateComplianceSettings({ auditLevel: e.target.value as 'basic' | 'standard' | 'enhanced' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="basic">Basic</option>
                        <option value="standard">Standard</option>
                        <option value="enhanced">Enhanced</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Compliance Status Display */}
                {securityAssessment?.complianceStatus && ()
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Compliance Status</h4>
                    <div className={`mb-3 ${getComplianceColor(securityAssessment.complianceStatus.overall)}`}>}
                      <span className="font-medium">
                        Overall Compliance: {securityAssessment.complianceStatus.overall ? 'COMPLIANT' : 'NON-COMPLIANT'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(securityAssessment.complianceStatus.frameworks).map(([framework, compliant]) => ()
                        <div key={framework} className="text-center">
                          <div className={`text-lg font-bold ${getComplianceColor(compliant)}`}>}
                            {compliant ? '✓' : '✗'}
                          </div>
                          <div className="text-xs text-gray-600">{framework.toUpperCase()}</div>
                        </div>
                      ))}
                    </div>
                    {securityAssessment.complianceStatus.issues.length > 0 && ()
                      <div className="mt-4 space-y-2">
                        <h5 className="font-medium text-gray-900">Compliance Issues:</h5>
                        {securityAssessment.complianceStatus.issues.map((issue, index) => ()
                          <div key={index} className={`p-2 rounded text-sm ${
  issue.severity === 'high' ? 'bg-red-100 text-red-800' :,
  issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :,
  'bg-blue-100 text-blue-800'
}`}>
                            <div className="font-medium">{issue.framework}: {issue.issue}</div>
                            <div className="text-xs mt-1">{issue.remediation}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Testing & Deployment Tab */}
            {activeTab === 'testing' && ()
              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-purple-900 mb-2">🧪 Test & Deploy</h3>
                  <p className="text-purple-800 text-sm">
                    Test your OAuth configuration and deploy it to production.
                  </p>
                </div>
                {/* Validation Results */}
                {validation && ()
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Configuration Validation</h4>
                    <div className={`mb-3 ${validation.valid ? 'text-green-600' : 'text-red-600'}`}>}
                      <span className="font-medium">
                        Status: {validation.valid ? 'VALID' : 'INVALID'}
                      </span>
                    </div>
                    {validation.errors.length > 0 && ()
                      <div className="space-y-2 mb-4">
                        <h5 className="font-medium text-red-900">Errors:</h5>
                        {validation.errors.map((error, index) => ()
                          <div key={index} className="bg-red-100 text-red-800 p-2 rounded text-sm">
                            <div className="font-medium">{error.field}: {error.message}</div>
                            <div className="text-xs">Code: {error.code}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {validation.warnings.length > 0 && ()
                      <div className="space-y-2">
                        <h5 className="font-medium text-yellow-900">Warnings:</h5>
                        {validation.warnings.map((warning, index) => ()
                          <div key={index} className="bg-yellow-100 text-yellow-800 p-2 rounded text-sm">
                            <div className="font-medium">{warning.field}: {warning.message}</div>
                            <div className="text-xs">{warning.recommendation}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* Test Configuration */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Test OAuth Flow</h4>
                  <p className="text-gray-600 mb-4">
                    Test the OAuth configuration by simulating the authorization flow.
                  </p>
                  <button
                    onClick={() => testConfiguration(configuration)}
                    disabled={testing || !configuration.clientId || !configuration.clientSecret}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    {testing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                    {testing ? 'Testing...' : 'Test Configuration'}
                  </button>
                </div>
                {/* Deploy Configuration */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Deploy Configuration</h4>
                  <p className="text-gray-600 mb-4">
                    Deploy the OAuth configuration to your selected environment.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        updateConfiguration({ status: 'active' });
                        saveConfiguration();
                      }}
                      disabled={!validation?.valid || saving}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Deploy to Production
                    </button>
                    <button
                      onClick={() => {
                        updateConfiguration({ status: 'testing' });
                        saveConfiguration();
                      }}
                      disabled={saving}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Deploy to Staging
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
            <div className="flex space-x-3">
              <button
                onClick={saveConfiguration}
                disabled={saving || !selectedProvider || !configuration.clientId}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
              <button
                onClick={() => {
                  setSelectedProvider('');
                  setConfiguration({});
                  setValidation(null);
                  setSecurityAssessment(null);
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {configuration.status && ()
                <span className={`px-2 py-1 rounded text-xs font-medium ${
  configuration.status === 'active' ? 'bg-green-100 text-green-800' :,
  configuration.status === 'testing' ? 'bg-blue-100 text-blue-800' :,
  configuration.status === 'inactive' ? 'bg-red-100 text-red-800' :,
  'bg-gray-100 text-gray-800'
}`}>
                  {configuration.status.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuthConfigurationInterface;
// Epic 9.4.5 - API Integration Manager Component
// UI component for managing external API integrations, keys, and webhooks

import React, { useState, useEffect, useMemo } from 'react';
import { 
  KeyIcon,
  GlobeAltIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentDuplicateIcon,
  CogIcon,
  BellIcon,
  ClockIcon,
  ChartBarIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
// import { useWorkflowStore } from '../stores/workflowStore';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created_at: Date;
  last_used?: Date;
  usage_count: number;
  rate_limit: number;
  expires_at?: Date;
  is_active: boolean;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  created_at: Date;
  last_triggered?: Date;
  success_count: number;
  failure_count: number;
  is_active: boolean;
}

interface ApiIntegrationManagerProps {
  workspaceId: string;
  onClose?: () => void;
}

type TabType = 'api_keys' | 'webhooks' | 'usage' | 'documentation';

export const ApiIntegrationManager: React.FC<ApiIntegrationManagerProps> = ({
  workspaceId,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('api_keys');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateApiKey, setShowCreateApiKey] = useState(false);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Load API keys and webhooks
  useEffect(() => {
    loadApiKeys();
    loadWebhooks();
  }, [workspaceId]);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      const mockApiKeys: ApiKey[] = [
        {
          id: '1',
          name: 'Production API Key',
          key: 'pk_live_abcd1234efgh5678',
          permissions: ['read', 'write', 'admin'],
          created_at: new Date('2024-01-15'),
          last_used: new Date('2024-01-20'),
          usage_count: 1250,
          rate_limit: 1000,
          is_active: true
        },
        {
          id: '2',
          name: 'Development API Key',
          key: 'pk_test_wxyz9876stuv5432',
          permissions: ['read', 'write'],
          created_at: new Date('2024-01-10'),
          last_used: new Date('2024-01-19'),
          usage_count: 45,
          rate_limit: 100,
          expires_at: new Date('2024-12-31'),
          is_active: true
        }
      ];
      setApiKeys(mockApiKeys);
    } catch (error) {
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const loadWebhooks = async () => {
    try {
      // Mock API call - replace with actual API
      const mockWebhooks: Webhook[] = [
        {
          id: '1',
          name: 'Slack Notifications',
          url: 'https://hooks.slack.com/services/...',
          events: ['approval_requested', 'state_changed', 'workflow_completed'],
          secret: 'whsec_abcd1234',
          created_at: new Date('2024-01-12'),
          last_triggered: new Date('2024-01-20'),
          success_count: 89,
          failure_count: 2,
          is_active: true
        },
        {
          id: '2',
          name: 'External System Integration',
          url: 'https://api.example.com/webhook',
          events: ['approval_completed', 'resource_locked'],
          secret: 'whsec_wxyz5678',
          created_at: new Date('2024-01-15'),
          last_triggered: new Date('2024-01-19'),
          success_count: 156,
          failure_count: 8,
          is_active: false
        }
      ];
      setWebhooks(mockWebhooks);
    } catch (error) {
      setError('Failed to load webhooks');
    }
  };

  const handleCreateApiKey = async (keyData: Partial<ApiKey>) => {
    try {
      // Mock API call - replace with actual API
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: keyData.name || 'New API Key',
        key: `pk_${Date.now().toString(36)}`,
        permissions: keyData.permissions || ['read'],
        created_at: new Date(),
        usage_count: 0,
        rate_limit: keyData.rate_limit || 1000,
        expires_at: keyData.expires_at,
        is_active: true
      };
      setApiKeys(prev => [...prev, newKey]);
      setShowCreateApiKey(false);
    } catch (error) {
      setError('Failed to create API key');
    }
  };

  const handleCreateWebhook = async (webhookData: Partial<Webhook>) => {
    try {
      // Mock API call - replace with actual API
      const newWebhook: Webhook = {
        id: Date.now().toString(),
        name: webhookData.name || 'New Webhook',
        url: webhookData.url || '',
        events: webhookData.events || [],
        secret: `whsec_${Date.now().toString(36)}`,
        created_at: new Date(),
        success_count: 0,
        failure_count: 0,
        is_active: true
      };
      setWebhooks(prev => [...prev, newWebhook]);
      setShowCreateWebhook(false);
    } catch (error) {
      setError('Failed to create webhook');
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      // Mock API call - replace with actual API
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      setShowDeleteConfirm(null);
    } catch (error) {
      setError('Failed to delete API key');
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      // Mock API call - replace with actual API
      setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
      setShowDeleteConfirm(null);
    } catch (error) {
      setError('Failed to delete webhook');
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
  };

  const formatKey = (key: string, isVisible: boolean) => {
    if (isVisible) return key;
    return key.slice(0, 8) + '••••••••' + key.slice(-4);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const _____getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircleIcon className="h-4 w-4 text-green-600" />
    ) : (
      <XCircleIcon className="h-4 w-4 text-gray-600" />
    );
  };

  const totalApiUsage = useMemo(() => {
    return apiKeys.reduce((sum, key) => sum + key.usage_count, 0);
  }, [apiKeys]);

  const totalWebhookCalls = useMemo(() => {
    return webhooks.reduce((sum, webhook) => sum + webhook.success_count + webhook.failure_count, 0);
  }, [webhooks]);

  const webhookSuccessRate = useMemo(() => {
    const total = totalWebhookCalls;
    const successful = webhooks.reduce((sum, webhook) => sum + webhook.success_count, 0);
    return total > 0 ? (successful / total * 100).toFixed(1) : '0';
  }, [webhooks, totalWebhookCalls]);

  const availableEvents = [
    'approval_requested',
    'approval_completed',
    'state_changed',
    'resource_locked',
    'resource_unlocked',
    'workflow_completed',
    'schedule_executed'
  ];

  const renderApiKeysTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">API Keys</h3>
        <button
          onClick={() => setShowCreateApiKey(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create API Key</span>
        </button>
      </div>

      <div className="space-y-3">
        {apiKeys.map(key => (
          <div key={key.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{key.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(key.is_active)}`}>
                    {key.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <KeyIcon className="h-4 w-4" />
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {formatKey(key.key, visibleKeys.has(key.id))}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(key.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {visibleKeys.has(key.id) ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.key)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                  <span>Usage: {key.usage_count.toLocaleString()}</span>
                  <span>Rate limit: {key.rate_limit}/hour</span>
                  <span>Last used: {key.last_used?.toLocaleDateString() || 'Never'}</span>
                  {key.expires_at && (
                    <span>Expires: {key.expires_at.toLocaleDateString()}</span>
                  )}
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  {key.permissions.map(permission => (
                    <span
                      key={permission}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(key.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {apiKeys.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <KeyIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No API keys found. Create your first API key to get started.</p>
        </div>
      )}
    </div>
  );

  const renderWebhooksTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Webhooks</h3>
        <button
          onClick={() => setShowCreateWebhook(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Webhook</span>
        </button>
      </div>

      <div className="space-y-3">
        {webhooks.map(webhook => (
          <div key={webhook.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(webhook.is_active)}`}>
                    {webhook.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                  <GlobeAltIcon className="h-4 w-4" />
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {webhook.url}
                  </code>
                </div>
                <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                  <span>Success: {webhook.success_count.toLocaleString()}</span>
                  <span>Failures: {webhook.failure_count.toLocaleString()}</span>
                  <span>Last triggered: {webhook.last_triggered?.toLocaleDateString() || 'Never'}</span>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  {webhook.events.map(event => (
                    <span
                      key={event}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(webhook.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {webhooks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No webhooks configured. Create your first webhook to receive notifications.</p>
        </div>
      )}
    </div>
  );

  const renderUsageTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Usage Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <KeyIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total API Calls</div>
              <div className="text-2xl font-bold text-gray-900">{totalApiUsage.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BellIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Webhook Calls</div>
              <div className="text-2xl font-bold text-gray-900">{totalWebhookCalls.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Success Rate</div>
              <div className="text-2xl font-bold text-gray-900">{webhookSuccessRate}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium mb-4">Recent Activity</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span>API Key "Production" used</span>
            <span className="text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span>Webhook "Slack Notifications" triggered</span>
            <span className="text-gray-500">5 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span>API Key "Development" created</span>
            <span className="text-gray-500">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocumentationTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">API Documentation</h3>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium mb-4">Authentication</h4>
        <p className="text-sm text-gray-600 mb-4">
          Include your API key in the Authorization header:
        </p>
        <code className="block bg-gray-100 p-3 rounded text-sm">
          Authorization: Bearer YOUR_API_KEY
        </code>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium mb-4">Workflow Operations</h4>
        <div className="space-y-4">
          <div>
            <h5 className="font-medium text-sm">Get Workflow States</h5>
            <code className="block bg-gray-100 p-3 rounded text-sm mt-2">
              GET /api/workflow/states/:workspaceId
            </code>
          </div>
          <div>
            <h5 className="font-medium text-sm">Transition State</h5>
            <code className="block bg-gray-100 p-3 rounded text-sm mt-2">
              POST /api/workflow/transition
              {JSON.stringify({
                resource_id: 'resource_uuid',
                to_state_id: 'state_uuid',
                comment: 'Transition comment'
              }, null, 2)}
            </code>
          </div>
          <div>
            <h5 className="font-medium text-sm">Create Approval</h5>
            <code className="block bg-gray-100 p-3 rounded text-sm mt-2">
              POST /api/workflow/approvals
              {JSON.stringify({
                resource_id: 'resource_uuid',
                transition_id: 'transition_uuid',
                requester_id: 'user_id'
              }, null, 2)}
            </code>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium mb-4">Webhook Events</h4>
        <p className="text-sm text-gray-600 mb-4">
          Your webhook endpoint will receive POST requests with the following structure:
        </p>
        <code className="block bg-gray-100 p-3 rounded text-sm">
          {JSON.stringify({
            event: 'state_changed',
            timestamp: '2024-01-20T10:30:00Z',
            workspace_id: 'workspace_uuid',
            resource_id: 'resource_uuid',
            data: {
              previous_state: 'draft',
              new_state: 'approved',
              actor_id: 'user_id'
            }
          }, null, 2)}
        </code>
      </div>
    </div>
  );

  const tabs = [
    { id: 'api_keys', label: 'API Keys', icon: KeyIcon },
    { id: 'webhooks', label: 'Webhooks', icon: BellIcon },
    { id: 'usage', label: 'Usage', icon: ChartBarIcon },
    { id: 'documentation', label: 'Documentation', icon: GlobeAltIcon }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GlobeAltIcon className="h-6 w-6 text-gray-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">API Integration</h2>
              <p className="text-sm text-gray-500">
                Manage API keys, webhooks, and external integrations
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="p-4">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'api_keys' && renderApiKeysTab()}
            {activeTab === 'webhooks' && renderWebhooksTab()}
            {activeTab === 'usage' && renderUsageTab()}
            {activeTab === 'documentation' && renderDocumentationTab()}
          </>
        )}
      </div>

      {/* Create API Key Modal */}
      {showCreateApiKey && (
        <CreateApiKeyModal
          onClose={() => setShowCreateApiKey(false)}
          onSubmit={handleCreateApiKey}
        />
      )}

      {/* Create Webhook Modal */}
      {showCreateWebhook && (
        <CreateWebhookModal
          onClose={() => setShowCreateWebhook(false)}
          onSubmit={handleCreateWebhook}
          availableEvents={availableEvents}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => {
            const isApiKey = apiKeys.some(key => key.id === showDeleteConfirm);
            if (isApiKey) {
              handleDeleteApiKey(showDeleteConfirm);
            } else {
              handleDeleteWebhook(showDeleteConfirm);
            }
          }}
          itemType={apiKeys.some(key => key.id === showDeleteConfirm) ? 'API Key' : 'Webhook'}
        />
      )}
    </div>
  );
};

// Sub-components for modals
const CreateApiKeyModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: Partial<ApiKey>) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    permissions: ['read'],
    rate_limit: 1000,
    expires_at: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      expires_at: formData.expires_at ? new Date(formData.expires_at) : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create API Key</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permissions
            </label>
            <div className="space-y-2">
              {['read', 'write', 'admin'].map(permission => (
                <label key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          permissions: [...prev.permissions, permission]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          permissions: prev.permissions.filter(p => p !== permission)
                        }));
                      }
                    }}
                    className="mr-2"
                  />
                  {permission}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate Limit (per hour)
            </label>
            <input
              type="number"
              value={formData.rate_limit}
              onChange={(e) => setFormData(prev => ({ ...prev, rate_limit: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires At (optional)
            </label>
            <input
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateWebhookModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: Partial<Webhook>) => void;
  availableEvents: string[];
}> = ({ onClose, onSubmit, availableEvents }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create Webhook</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Events
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableEvents.map(event => (
                <label key={event} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          events: [...prev.events, event]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          events: prev.events.filter(e => e !== event)
                        }));
                      }
                    }}
                    className="mr-2"
                  />
                  {event}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Webhook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<{
  onClose: () => void;
  onConfirm: () => void;
  itemType: string;
}> = ({ onClose, onConfirm, itemType }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Delete {itemType}</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this {itemType.toLowerCase()}? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiIntegrationManager;
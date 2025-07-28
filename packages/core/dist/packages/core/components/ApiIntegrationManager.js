import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4.5 - API Integration Manager Component
// UI component for managing external API integrations, keys, and webhooks
import { useState, useEffect, useMemo } from 'react';
import { KeyIcon, GlobeAltIcon, PlusIcon, TrashIcon, EyeIcon, EyeSlashIcon, DocumentDuplicateIcon, BellIcon, ChartBarIcon, XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
export const ApiIntegrationManager = ({
    workspaceId,
    onClose
});
{
    const [activeTab, setActiveTab] = useState('api_keys');
    const [apiKeys, setApiKeys] = useState([]);
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateApiKey, setShowCreateApiKey] = useState(false);
    const [showCreateWebhook, setShowCreateWebhook] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [visibleKeys, setVisibleKeys] = useState(new Set());
    // Load API keys and webhooks
    useEffect(() => {
        loadApiKeys();
        loadWebhooks();
    }, [workspaceId]);
    const loadApiKeys = async () => {
        setLoading(true);
        try {
            // Mock API call - replace with actual API
            const mockApiKeys = [
                {
                    id: '1',
                    name: 'Production API Key',
                    key: 'pk_live_abcd1234efgh5678',
                    permissions: ['read', 'write', 'admin'],
                    created_at: new Date('2024-01-15'),
                    last_used: new Date('2024-01-20'),
                    usage_count: 1250,
                    rate_limit: 1000,
                    is_active: true,
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
        }
        catch (error) {
            setError('Failed to load API keys');
        }
        finally {
            setLoading(false);
        }
        ;
        const loadWebhooks = async () => {
            try {
                // Mock API call - replace with actual API
                const mockWebhooks = [
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
                        is_active: true,
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
            }
            catch (error) {
                setError('Failed to load webhooks');
            }
            ;
            const handleCreateApiKey = async (keyData) => {
                try {
                    // Mock API call - replace with actual API
                    const newKey = {
                        id: Date.now().toString(),
                        name: keyData.name || 'New API Key',
                        key: `pk_${Date.now().toString(36)}` };
                }
                finally { }
                permissions: keyData.permissions || ['read'],
                    created_at;
                new Date(),
                    usage_count;
                0,
                    rate_limit;
                keyData.rate_limit || 1000,
                    expires_at;
                keyData.expires_at,
                    is_active;
                true;
            };
            setApiKeys(prev => [...prev, newKey]);
            setShowCreateApiKey(false);
        };
        try { }
        catch (error) {
            setError('Failed to create API key');
        }
        ;
        const handleCreateWebhook = async (webhookData) => {
            try {
                // Mock API call - replace with actual API
                const newWebhook = {
                    id: Date.now().toString(),
                    name: webhookData.name || 'New Webhook',
                    url: webhookData.url || '',
                    events: webhookData.events || [],
                    secret: `whsec_${Date.now().toString(36)}` };
            }
            finally { }
            created_at: new Date(),
                success_count;
            0,
                failure_count;
            0,
                is_active;
            true;
        };
        setWebhooks(prev => [...prev, newWebhook]);
        setShowCreateWebhook(false);
    };
    try { }
    catch (error) {
        setError('Failed to create webhook');
    }
    ;
    const handleDeleteApiKey = async (keyId) => {
        try {
            // Mock API call - replace with actual API
            setApiKeys(prev => prev.filter(key => key.id !== keyId));
            setShowDeleteConfirm(null);
        }
        catch (error) {
            setError('Failed to delete API key');
        }
        ;
        const handleDeleteWebhook = async (webhookId) => {
            try {
                // Mock API call - replace with actual API
                setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
                setShowDeleteConfirm(null);
            }
            catch (error) {
                setError('Failed to delete webhook');
            }
            ;
            const toggleKeyVisibility = (keyId) => {
                setVisibleKeys(prev => { });
                const newSet = new Set(prev);
                if (newSet.has(keyId)) {
                    newSet.delete(keyId);
                }
                else {
                    newSet.add(keyId);
                    return newSet;
                }
                ;
            };
            const copyToClipboard = (text) => {
                navigator.clipboard.writeText(text);
                // Show toast notification
            };
            const formatKey = (key, isVisible) => {
                if (isVisible)
                    return key;
                return key.slice(0, 8) + '••••••••' + key.slice(-4);
            };
            const getStatusColor = (isActive) => {
                return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
            };
            const _____getStatusIcon = (isActive) => {
                return isActive ? ()
                    < CheckCircleIcon : ;
                className = "h-4 w-4 text-green-600" /  >
                ;
            };
        };
    };
    (),
        _jsx(XCircleIcon, { className: "h-4 w-4 text-gray-600" });
    ;
}
;
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
const availableEvents = [];
'approval_requested',
    'approval_completed',
    'state_changed',
    'resource_locked',
    'resource_unlocked',
    'workflow_completed',
    'schedule_executed';
;
const renderApiKeysTab = () => ();
;
_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold", children: "API Keys" }), _jsxs("button", { onClick: () => setShowCreateApiKey(true), className: "flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors", children: [_jsx(PlusIcon, { className: "h-4 w-4" }), _jsx("span", { children: "Create API Key" })] })] }), _jsx("div", { className: "space-y-3", children: apiKeys.map(key => ()
                < div, key = { key, : .id }, className = "bg-white border border-gray-200 rounded-lg p-4" >
                _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("h4", { className: "font-medium text-gray-900", children: key.name }), _jsxs("span", { className: `px-2 py-1 text-xs rounded-full ${getStatusColor(key.is_active)}`, children: ["}", key.is_active ? 'Active' : 'Inactive'] })] }), _jsx("div", { className: "mt-2 flex items-center space-x-4 text-sm text-gray-600", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(KeyIcon, { className: "h-4 w-4" }), _jsx("code", { className: "bg-gray-100 px-2 py-1 rounded", children: formatKey(key.key, visibleKeys.has(key.id)) }), _jsxs("button", { onClick: () => toggleKeyVisibility(key.id), className: "text-gray-400 hover:text-gray-600", children: [visibleKeys.has(key.id) ? ()
                                                        < EyeSlashIcon : , " className=\"h-4 w-4\" /> ) : ()", _jsx(EyeIcon, { className: "h-4 w-4" }), ")}"] }), _jsx("button", { onClick: () => copyToClipboard(key.key), className: "text-gray-400 hover:text-gray-600", children: _jsx(DocumentDuplicateIcon, { className: "h-4 w-4" }) })] }) }), _jsxs("div", { className: "mt-2 flex items-center space-x-6 text-sm text-gray-500", children: [_jsxs("span", { children: ["Usage: ", key.usage_count.toLocaleString()] }), _jsxs("span", { children: ["Rate limit: ", key.rate_limit, "/hour"] }), _jsxs("span", { children: ["Last used: ", key.last_used?.toLocaleDateString() || 'Never'] }), key.expires_at && ()
                                            < span > Expires, ": ", key.expires_at.toLocaleDateString()] }), ")}"] }), _jsx("div", { className: "mt-2 flex items-center space-x-2", children: key.permissions.map(permission => ()
                                < span, key = { permission }, className = "px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                >
                                    { permission }) }), "))}"] })) }), _jsx("div", { className: "flex items-center space-x-2", children: _jsx("button", { onClick: () => setShowDeleteConfirm(key.id), className: "p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors", children: _jsx(TrashIcon, { className: "h-4 w-4" }) }) })] });
div >
;
div >
    { apiKeys, : .length === 0 && ()
            < div, className = "text-center py-8 text-gray-500" >
            (_jsx(KeyIcon, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" })
                ,
                    _jsx("p", { children: "No API keys found. Create your first API key to get started." })),
        div } >
;
div >
;
;
const renderWebhooksTab = () => ();
;
_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Webhooks" }), _jsxs("button", { onClick: () => setShowCreateWebhook(true), className: "flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors", children: [_jsx(PlusIcon, { className: "h-4 w-4" }), _jsx("span", { children: "Create Webhook" })] })] }), _jsx("div", { className: "space-y-3", children: webhooks.map(webhook => ()
                < div, key = { webhook, : .id }, className = "bg-white border border-gray-200 rounded-lg p-4" >
                (_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("h4", { className: "font-medium text-gray-900", children: webhook.name }), _jsxs("span", { className: `px-2 py-1 text-xs rounded-full ${getStatusColor(webhook.is_active)}`, children: ["}", webhook.is_active ? 'Active' : 'Inactive'] })] }), _jsxs("div", { className: "mt-2 flex items-center space-x-2 text-sm text-gray-600", children: [_jsx(GlobeAltIcon, { className: "h-4 w-4" }), _jsx("code", { className: "bg-gray-100 px-2 py-1 rounded text-xs", children: webhook.url })] }), _jsxs("div", { className: "mt-2 flex items-center space-x-6 text-sm text-gray-500", children: [_jsxs("span", { children: ["Success: ", webhook.success_count.toLocaleString()] }), _jsxs("span", { children: ["Failures: ", webhook.failure_count.toLocaleString()] }), _jsxs("span", { children: ["Last triggered: ", webhook.last_triggered?.toLocaleDateString() || 'Never'] })] }), _jsx("div", { className: "mt-2 flex items-center space-x-2", children: webhook.events.map(event => ()
                                    < span, key = { event }, className = "px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                                    >
                                        { event }) }), "))}"] }) })
                    ,
                        _jsx("div", { className: "flex items-center space-x-2", children: _jsx("button", { onClick: () => setShowDeleteConfirm(webhook.id), className: "p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors", children: _jsx(TrashIcon, { className: "h-4 w-4" }) }) }))) })] });
div >
    { webhooks, : .length === 0 && ()
            < div, className = "text-center py-8 text-gray-500" >
            (_jsx(BellIcon, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" })
                ,
                    _jsx("p", { children: "No webhooks configured. Create your first webhook to receive notifications." })),
        div } >
;
div >
;
;
const renderUsageTab = () => ();
;
_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Usage Statistics" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(KeyIcon, { className: "h-8 w-8 text-blue-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500", children: "Total API Calls" }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: totalApiUsage.toLocaleString() })] })] }) }), _jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(BellIcon, { className: "h-8 w-8 text-green-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500", children: "Webhook Calls" }), _jsx("div", { className: "text-2xl font-bold text-gray-900", children: totalWebhookCalls.toLocaleString() })] })] }) }), _jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(ChartBarIcon, { className: "h-8 w-8 text-purple-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-500", children: "Success Rate" }), _jsxs("div", { className: "text-2xl font-bold text-gray-900", children: [webhookSuccessRate, "%"] })] })] }) })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium mb-4", children: "Recent Activity" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-100", children: [_jsx("span", { children: "API Key \"Production\" used" }), _jsx("span", { className: "text-gray-500", children: "2 minutes ago" })] }), _jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-100", children: [_jsx("span", { children: "Webhook \"Slack Notifications\" triggered" }), _jsx("span", { className: "text-gray-500", children: "5 minutes ago" })] }), _jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-100", children: [_jsx("span", { children: "API Key \"Development\" created" }), _jsx("span", { className: "text-gray-500", children: "1 hour ago" })] })] })] })] });
;
const renderDocumentationTab = () => ();
;
_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-semibold", children: "API Documentation" }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h4", { className: "font-medium mb-4", children: "Authentication" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Include your API key in the Authorization header:" }), _jsx("code", { className: "block bg-gray-100 p-3 rounded text-sm", children: "Authorization: Bearer YOUR_API_KEY," })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h4", { className: "font-medium mb-4", children: "Workflow Operations" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-medium text-sm", children: "Get Workflow States" }), _jsx("code", { className: "block bg-gray-100 p-3 rounded text-sm mt-2", children: "GET /api/workflow/states/:workspaceId" })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-sm", children: "Transition State" }), _jsxs("code", { className: "block bg-gray-100 p-3 rounded text-sm mt-2", children: ["POST /api/workflow/transition", JSON.stringify({}), "resource_id: 'resource_uuid', to_state_id: 'state_uuid', comment: 'Transition comment', }, null, 2)}"] })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-sm", children: "Create Approval" }), _jsxs("code", { className: "block bg-gray-100 p-3 rounded text-sm mt-2", children: ["POST /api/workflow/approvals", JSON.stringify({}), "resource_id: 'resource_uuid', transition_id: 'transition_uuid', requester_id: 'user_id', }, null, 2)}"] })] })] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h4", { className: "font-medium mb-4", children: "Webhook Events" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Your webhook endpoint will receive POST requests with the following structure:" }), _jsxs("code", { className: "block bg-gray-100 p-3 rounded text-sm", children: [JSON.stringify({}), "event: 'state_changed', timestamp: '2024-01-20T10:30:00Z', workspace_id: 'workspace_uuid', resource_id: 'resource_uuid', data: ", (,
                            previous_state), ": 'draft', new_state: 'approved', actor_id: 'user_id', }, null, 2)}"] })] })] });
;
const tabs = [];
{
    id: 'api_keys', label;
    'API Keys', icon;
    KeyIcon;
}
{
    id: 'webhooks', label;
    'Webhooks', icon;
    BellIcon;
}
{
    id: 'usage', label;
    'Usage', icon;
    ChartBarIcon;
}
{
    id: 'documentation', label;
    'Documentation', icon;
    GlobeAltIcon;
}
;
return;
_jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200", children: _jsxs("div", { className: "border-b border-gray-200 p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(GlobeAltIcon, { className: "h-6 w-6 text-gray-600" }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "API Integration" }), _jsx("p", { className: "text-sm text-gray-500", children: "Manage API keys, webhooks, and external integrations" })] })] }), onClose && ()
                        < button, "onClick=", onClose, "className=\"text-gray-400 hover:text-gray-600 transition-colors\" >", _jsx(XCircleIcon, { className: "h-5 w-5" })] }), ")}"] }) });
{ /* Tab navigation */ }
_jsxs("div", { className: "border-b border-gray-200", children: [_jsxs("nav", { className: "flex space-x-8 px-4", children: [tabs.map(tab => ()
                    < button, key = { tab, : .id }, onClick = {}()), " => setActiveTab(tab.id as TabType)} className=", `flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                }`, ">", _jsx(tab.icon, { className: "h-4 w-4" }), _jsx("span", { children: tab.label })] }), "))}"] });
div >
    { /* Tab content */}
    < div;
className = "p-4" >
    { error } && ()
    < div;
className = "mb-4 bg-red-50 border border-red-200 rounded-lg p-4" >
    _jsxs("div", { className: "flex items-center", children: [_jsx(ExclamationTriangleIcon, { className: "h-5 w-5 text-red-600 mr-2" }), _jsx("span", { className: "text-red-800", children: error })] });
div >
;
{
    loading ? ()
        < div : ;
    className = "flex items-center justify-center h-64" >
        _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" });
    div >
    ;
    ();
    {
        activeTab === 'api_keys' && renderApiKeysTab();
    }
    {
        activeTab === 'webhooks' && renderWebhooksTab();
    }
    {
        activeTab === 'usage' && renderUsageTab();
    }
    {
        activeTab === 'documentation' && renderDocumentationTab();
    }
     >
    ;
}
div >
    { /* Create API Key Modal */};
{
    showCreateApiKey && ()
        < CreateApiKeyModal;
    onClose = {}();
    setShowCreateApiKey(false);
}
onSubmit = { handleCreateApiKey }
    /  >
;
{ /* Create Webhook Modal */ }
{
    showCreateWebhook && ()
        < CreateWebhookModal;
    onClose = {}();
    setShowCreateWebhook(false);
}
onSubmit = { handleCreateWebhook };
availableEvents = { availableEvents }
    /  >
;
{ /* Delete Confirmation Modal */ }
{
    showDeleteConfirm && ()
        < DeleteConfirmationModal;
    onClose = {}();
    setShowDeleteConfirm(null);
}
onConfirm = {}();
{
    const isApiKey = apiKeys.some(key => key.id === showDeleteConfirm);
    if (isApiKey) {
        handleDeleteApiKey(showDeleteConfirm);
    }
    else {
        handleDeleteWebhook(showDeleteConfirm);
    }
}
itemType = { apiKeys, : .some(key => key.id === showDeleteConfirm) ? 'API Key' : 'Webhook' }
    /  >
;
div >
;
;
;
// Sub-components for modals
const CreateApiKeyModal;
() => void ;
onSubmit: (data) => void ;
 > ;
({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({});
    name: '',
        permissions;
    ['read'],
        rate_limit;
    1000,
        expires_at;
    '',
    ;
};
;
const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({});
};
formData,
    expires_at;
formData.expires_at ? new Date(formData.expires_at) : undefined,
;
;
;
return;
_jsxs("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: [_jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Create API Key" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Name" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Permissions" }), _jsxs("div", { className: "space-y-2", children: [['read', 'write', 'admin'].map(permission => ()
                                            < label, key = { permission }, className = "flex items-center" >
                                            _jsx("input", { type: "checkbox", checked: formData.permissions.includes(permission), onChange: (e) => {
                                                    if (e.target.checked) {
                                                        setFormData(prev => ({}), ...prev, permissions);
                                                    }
                                                } })), ": [...prev.permissions, permission], })); } else ", setFormData(prev => ({}), ...prev, permissions), ": prev.permissions.filter(p => p !== permission), })); }} className=\"mr-2\" />", permission] }), "))}"] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Rate Limit (per hour)" }), _jsx("input", { type: "number", value: formData.rate_limit, onChange: (e) => setFormData(prev => ({ ...prev, rate_limit: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", min: "1", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Expires At (optional)" }), _jsx("input", { type: "date", value: formData.expires_at, onChange: (e) => setFormData(prev => ({ ...prev, expires_at: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors", children: "Create Key" })] })] });
div >
;
div >
;
;
;
const CreateWebhookModal;
() => void ;
onSubmit: (data) => void ;
availableEvents: string;
 > ;
({ onClose, onSubmit, availableEvents }) => {
    const [formData, setFormData] = useState({});
    name: '',
        url;
    '',
        events;
    [],
    ;
};
;
const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
};
return;
_jsxs("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: [_jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Create Webhook" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Name" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "URL" }), _jsx("input", { type: "url", value: formData.url, onChange: (e) => setFormData(prev => ({ ...prev, url: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Events" }), _jsxs("div", { className: "space-y-2 max-h-40 overflow-y-auto", children: [availableEvents.map(event => ()
                                            < label, key = { event }, className = "flex items-center" >
                                            _jsx("input", { type: "checkbox", checked: formData.events.includes(event), onChange: (e) => {
                                                    if (e.target.checked) {
                                                        setFormData(prev => ({}), ...prev, events);
                                                    }
                                                } })), ": [...prev.events, event], })); } else ", setFormData(prev => ({}), ...prev, events), ": prev.events.filter(e => e !== event), })); }} className=\"mr-2\" />", event] }), "))}"] })] })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors", children: "Create Webhook" })] })] });
div >
;
div >
;
;
;
const DeleteConfirmationModal;
() => void ;
onConfirm: () => void ;
itemType: string;
 > ;
({ onClose, onConfirm, itemType }) => {
    return;
    _jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md", children: [_jsxs("h3", { className: "text-lg font-semibold mb-4", children: ["Delete ", itemType] }), _jsxs("p", { className: "text-gray-600 mb-4", children: ["Are you sure you want to delete this ", itemType.toLowerCase(), "? This action cannot be undone."] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", children: "Cancel" }), _jsx("button", { onClick: onConfirm, className: "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors", children: "Delete" })] })] }) });
    ;
};
export default ApiIntegrationManager;

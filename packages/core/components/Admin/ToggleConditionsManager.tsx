/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Epic 17 Toggle Conditions Manager
 * 
 * Comprehensive UI for managing complex feature toggle conditions including:
 * - Condition creation and editing with visual builders
 * - Real-time condition testing and validation
 * - Advanced targeting and rollout configuration
 * - A/B testing and multivariate setup
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ToggleCondition,
  ConditionType,
  ConditionParameters,
  EvaluationContext,
  ToggleEvaluationResult,
  ComparisonOperator,
  UserAttributeParams,
  ScheduleParams,
  ExperimentParams }
  ToggleConditionsService
 from '../../services/ToggleConditionsService';


interface ToggleConditionsManagerProps { conditionsService: ToggleConditionsService;
  toggleId: string;
  onConditionsChange?: (conditions: ToggleCondition) => void;
  onClose?: () => void;
  interface ConditionFormData {
  name: string;
  description: string;
  conditionType: ConditionType;
  expression: string;
  parameters: ConditionParameters;
  priority: number;
  active: boolean;
  metadata: {;
  category: string;
  tags: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical' }
  businessImpact: string;


};

export const ToggleConditionsManager: React.FC<ToggleConditionsManagerProps> = ({ )
  conditionsService
  toggleId
  onConditionsChange }
  onClose
}) => { // State management
  const [conditions, setConditions] = useState<ToggleCondition>([]);
  const [editingCondition, setEditingCondition] = useState<ToggleCondition | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ConditionFormData>({)
  name: ''
    description: ''
    conditionType: ConditionType.PERCENTAGE
    expression: '' }
    parameters: {}
    priority: 100
    active: true
    metadata: { 
  category: 'feature_rollout'
  tags: []
  riskLevel: 'medium'
  businessImpact: '' }
});
  // Testing state
  const [testContext, setTestContext] = useState<EvaluationContext>({ )
  user: {
  id: 'test-user-123'
      email: 'test@example.com'
      role: 'user'
      segment: 'beta_users' }
      attributes: {}
      groups: []
      permissions: []

  request: { 
  ip: '192.168.1.100'
  country: 'US'
  region: 'CA'
  device: {
  type: 'desktop'
  platform: 'Windows'
  browser: 'Chrome' }

  environment: { 
  environment: 'staging'
  region: 'us-west-2'
  timezone: 'America/Los_Angeles'
  version: '1.0.0' }

  timestamp: new Date();
  });
  const [testResults, setTestResults] = useState<ToggleEvaluationResult | null>(null);
  const [testing, setTesting] = useState(false);
  // Load conditions on mount
  useEffect(() => { loadConditions() }, [toggleId]);
  const loadConditions = useCallback(async () => { setLoading(true);
    setError(null);
    try {
      const toggleConditions = conditionsService.getToggleConditions(toggleId);
      setConditions(toggleConditions);
      onConditionsChange?.(toggleConditions) } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load conditions') } finally { setLoading(false) }, [conditionsService, toggleId, onConditionsChange]);
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();
    setError(null);
    try {
      if (editingCondition) {
        // Update existing condition (simplified - would need update API)
        await handleDelete(editingCondition.id);
      await conditionsService.addCondition({)
  toggleId }
        ...formData
      });
      await loadConditions();
      resetForm();
 catch (err) { setError(err instanceof Error ? err.message : 'Failed to save condition') };
  // Handle condition deletion
  const handleDelete = async (conditionId: string) => { try {
      await conditionsService.removeCondition(conditionId);
      await loadConditions() } catch (err) { setError(err instanceof Error ? err.message : 'Failed to delete condition') };
  // Handle condition testing
  const handleTest = async () => { setTesting(true);
    setError(null);
    try {
      const result = await conditionsService.evaluateToggle(toggleId, testContext);
      setTestResults(result) } catch (err) { setError(err instanceof Error ? err.message : 'Failed to test conditions') } finally { setTesting(false) };
  // Reset form
  const resetForm = () => { setFormData({)
  name: ''
      description: ''
      conditionType: ConditionType.PERCENTAGE
      expression: '' }
      parameters: {}
      priority: 100
      active: true
      metadata: { 
  category: 'feature_rollout'
  tags: []
  riskLevel: 'medium'
  businessImpact: '' }
});
    setEditingCondition(null);
    setShowCreateForm(false);
  };
  // Start editing a condition
  const startEdit = (condition: ToggleCondition) => { setFormData({)
  name: condition.name
  description: condition.description
  conditionType: condition.conditionType
  expression: condition.expression
  parameters: condition.parameters
  priority: condition.priority
  active: condition.active
  metadata: {
  category: condition.metadata.category
  tags: condition.metadata.tags
  riskLevel: condition.metadata.riskLevel
  businessImpact: condition.metadata.businessImpact }
});
    setEditingCondition(condition);
    setShowCreateForm(true);
  };
  // Render condition type badge
  const renderConditionTypeBadge = (type: ConditionType) => { const colors = {
  [ConditionType.USER_ATTRIBUTE]: 'bg-blue-100 text-blue-800'
  [ConditionType.USER_SEGMENT]: 'bg-purple-100 text-purple-800'
  [ConditionType.PERCENTAGE]: 'bg-green-100 text-green-800'
  [ConditionType.TIME_WINDOW]: 'bg-yellow-100 text-yellow-800'
  [ConditionType.AB_TEST]: 'bg-pink-100 text-pink-800'
  [ConditionType.MULTIVARIATE]: 'bg-indigo-100 text-indigo-800'
  [ConditionType.CUSTOM_EXPRESSION]: 'bg-gray-100 text-gray-800'
  [ConditionType.DEPENDENCY]: 'bg-red-100 text-red-800'
  [ConditionType.GEOGRAPHIC]: 'bg-orange-100 text-orange-800'
  [ConditionType.DEVICE_TYPE]: 'bg-teal-100 text-teal-800'
  [ConditionType.TRAFFIC_SPLIT]: 'bg-cyan-100 text-cyan-800'
  [ConditionType.FEATURE_FLAG]: 'bg-lime-100 text-lime-800' }
};
    return;
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type]}`}>}
        {type.replace('_', ' ').toUpperCase()}
      </span>
    );
  };
  if (loading) {
    return;
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading conditions...</span>
        </div>
      </div>
    );
  return;
    <div className="conditions-manager max-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Toggle Conditions</h2>
            <p className="text-sm text-gray-600">
              Manage complex conditions for toggle: {toggleId}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test Conditions'}
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Add Condition
            </button>
            {onClose && ()
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {error && ()
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 flex">
        {/* Conditions List */}
        <div className="flex-1 p-6">
          {conditions.length === 0 ? ()
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No conditions</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first condition.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Condition
                </button>
              </div>
            </div>
          ) : ()
            <div className="space-y-4">
              {conditions.map((condition) => ()
                <div key={condition.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{condition.name}</h3>
                        {renderConditionTypeBadge(condition.conditionType)}
                        <span className={ `px-2 py-1 rounded-full text-xs font-medium ${
  condition.active
  ? 'bg-green-100 text-green-800'
  : 'bg-gray-100 text-gray-800' }
`}>
                          {condition.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        <span className={ `px-2 py-1 rounded-full text-xs font-medium ${
  condition.metadata.riskLevel === 'critical' ? 'bg-red-500 text-white' :
  condition.metadata.riskLevel === 'high' ? 'bg-red-400 text-white' :
  condition.metadata.riskLevel === 'medium' ? 'bg-yellow-400 text-gray-800' : }
  'bg-gray-400 text-white'
`}>
                          {condition.metadata.riskLevel.toUpperCase()} RISK
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{condition.description}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>Priority: {condition.priority}</span>
                        <span>Category: {condition.metadata.category}</span>
                        <span>Created: {condition.created.toLocaleDateString()}</span>
                      </div>
                      {condition.metadata.tags.length > 0 && ()
                        <div className="mt-2 flex flex-wrap gap-1">
                          {condition.metadata.tags.map((tag) => ()
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Condition Details */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <ConditionDetails condition={condition} />
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(condition)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Edit condition"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(condition.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete condition"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-gray-50">
          {/* Test Results */}
          { testResults && ()
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Test Results</h3>
              <div className="bg-white rounded-lg border p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Toggle Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
  testResults.enabled
  ? 'bg-green-100 text-green-800'
  : 'bg-red-100 text-red-800' }
`}>
                    {testResults.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                {testResults.variant && ()
                  <div className="mb-3">
                    <span className="text-sm font-medium">Variant: </span>
                    <span className="text-sm text-gray-600">{testResults.variant}</span>
                  </div>
                )}
                <div className="mb-3">
                  <span className="text-sm font-medium">Confidence: </span>
                  <span className="text-sm text-gray-600">{(testResults.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="text-xs text-gray-500">
                  Execution Time: {testResults.metadata.totalExecutionTime}ms
                </div>
              </div>
              {/* Condition Results */}
              <div className="space-y-2">
                {testResults.conditions.map((result) => ()
                  <div key={result.conditionId} className="bg-white rounded border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        Condition {result.conditionId.slice(-8)}
                      </span>
                      <span className={ `px-2 py-1 rounded-full text-xs font-medium ${
  result.result
  ? 'bg-green-100 text-green-800'
  : 'bg-gray-100 text-gray-800' }
`}>
                        {result.result ? 'MATCH' : 'NO MATCH'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{result.reason}</p>
                    <div className="text-xs text-gray-400 mt-1">
                      {result.executionTime}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Test Context Editor */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Test Context</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <input
                  type="text"
                  value={testContext.user?.id || ''}
                  onChange={ (e) => setTestContext({)
  ...testContext }
                    user: { ...testContext.user!, id: e.target.value }
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User Segment</label>
                <select
                  value={testContext.user?.segment || ''}
                  onChange={ (e) => setTestContext({)
  ...testContext }
                    user: { ...testContext.user!, segment: e.target.value }
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">None</option>
                  <option value="beta_users">Beta Users</option>
                  <option value="premium_users">Premium Users</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <select
                  value={testContext.request?.country || ''}
                  onChange={ (e) => setTestContext({)
  ...testContext }
                    request: { ...testContext.request!, country: e.target.value }
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Unknown</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Device Type</label>
                <select
                  value={testContext.request?.device?.type || ''}
                  onChange={ (e) => setTestContext({)
  ...testContext
                    request: {
                      ...testContext.request! }
                      device: { ...testContext.request!.device!, type: e.target.value as any }
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Create/Edit Form Modal */}
      {showCreateForm && ()
        <ConditionFormModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isEditing={!!editingCondition}
        />
      )}
    </div>
  );
};

// Sub-components


interface ConditionDetailsProps { condition: ToggleCondition }

const ConditionDetails: React.FC<ConditionDetailsProps> = ({ condition }) => {
  const renderParameters = () => {
    const params = condition.parameters;
    switch (condition.conditionType) {
    case ConditionType.PERCENTAGE:
      return;
        <div className="text-sm">
          <span className="font-medium">Rollout: </span>
          <span>{params.percentage}%</span>
          {params.salt && <span className="text-gray-500 ml-2">(Salt: {params.salt})</span>}
        </div>
      );
    case ConditionType.USER_SEGMENT:
      return;
        <div className="text-sm">
          <span className="font-medium">Segments: </span>
          <span>{params.userSegments?.join(', ') || 'None'}</span>
        </div>
      );
    case ConditionType.TIME_WINDOW:
      return;
        <div className="text-sm space-y-1">
          {params.startTime && ()
            <div>
              <span className="font-medium">Start: </span>
              <span>{params.startTime.toLocaleString()}</span>
            </div>
          )}
          {params.endTime && ()
            <div>
              <span className="font-medium">End: </span>
              <span>{params.endTime.toLocaleString()}</span>
            </div>
          )}
        </div>
      );
    case ConditionType.CUSTOM_EXPRESSION:
      return;
        <div className="text-sm">
          <span className="font-medium">Expression: </span>
          <code className="bg-gray-100 px-2 py-1 rounded text-xs">{condition.expression}</code>
        </div>
      );
    default:
      return;
        <div className="text-sm text-gray-500">
            Configuration details for {condition.conditionType}
        </div>
      );
  };
  return;
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">Configuration</h4>
      {renderParameters()}
    </div>
  );
};

// Condition Form Modal (simplified implementation)


interface ConditionFormModalProps { formData: ConditionFormData;
  setFormData: (data: ConditionFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void;
  isEditing: boolean;
  const ConditionFormModal: React.FC<ConditionFormModalProps> = ({);
  formData;
  setFormData;
  onSubmit;
  onCancel }
  isEditing


}) => {
  return;
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Condition' : 'Create New Condition'}
          </h3>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Condition Type</label>
            <select
              value={formData.conditionType}
              onChange={(e) => setFormData({ ...formData, conditionType: e.target.value as ConditionType })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {Object.values(ConditionType).map((type) => ()
                <option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          {formData.conditionType === ConditionType.PERCENTAGE && ()
            <div>
              <label className="block text-sm font-medium text-gray-700">Rollout Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.parameters.percentage || 0}
                onChange={ (e) => setFormData({)
  ...formData }
                  parameters: { ...formData.parameters, percentage: Number(e.target.value) }
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}
          {formData.conditionType === ConditionType.CUSTOM_EXPRESSION && ()
            <div>
              <label className="block text-sm font-medium text-gray-700">Expression</label>
              <textarea
                value={formData.expression}
                onChange={(e) => setFormData({ ...formData, expression: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                rows={3}
                placeholder="user.segment === 'beta' && user.attributes.tier === 'premium'"
              />
            </div>
          )}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              {isEditing ? 'Update' : 'Create'} Condition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToggleConditionsManager;
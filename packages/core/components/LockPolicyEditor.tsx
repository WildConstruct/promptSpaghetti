// Epic 9.4.3 - Lock Policy Editor Component
// Editor for workspace lock policies
import React, { useState, useEffect } from 'react';
import { Save, Settings, AlertTriangle, Info, Clock, Users, Shield } from 'lucide-react';
import { LockPolicy } from '../types/locking';
import { useLockingStore } from '../stores/lockingStore';
interface LockPolicyEditorProps {
  workspaceId: string;
  onPolicyUpdate: () => void;
  export const LockPolicyEditor: React.FC<LockPolicyEditorProps> = ({,)
  workspaceId,
  onPolicyUpdate
}) => {
  const { policy, fetchPolicy, updatePolicy, isLoading, error } = useLockingStore();
  const [editingPolicy, setEditingPolicy] = useState<Partial<LockPolicy> | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    fetchPolicy(workspaceId);
  }, [workspaceId]);
  useEffect(() => {
    if (policy) {
      setEditingPolicy(policy);
  }, [policy]);
  const validatePolicy = (policyData: Partial<LockPolicy>): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!policyData.name?.trim()) {
      errors.name = 'Policy name is required';
    if (policyData.max_locks_per_user && policyData.max_locks_per_user < 1) {
      errors.max_locks_per_user = 'Must be at least 1';
    if (policyData.max_locks_per_resource && policyData.max_locks_per_resource < 1) {
      errors.max_locks_per_resource = 'Must be at least 1';
    if (policyData.default_duration_minutes && policyData.default_duration_minutes < 1) {
      errors.default_duration_minutes = 'Must be at least 1 minute';
    if (policyData.max_duration_minutes && policyData.max_duration_minutes < 1) {
      errors.max_duration_minutes = 'Must be at least 1 minute';
    if ();
      policyData.default_duration_minutes &&
      policyData.max_duration_minutes &&
      policyData.default_duration_minutes > policyData.max_duration_minutes
      errors.default_duration_minutes = 'Cannot exceed maximum duration';
    return errors;
  };
  const handleInputChange = (field: keyof LockPolicy, value: Error) => {
    if (!editingPolicy) return;
    const updatedPolicy = { ...editingPolicy, [field]: value };
    setEditingPolicy(updatedPolicy);
    setHasChanges(true);
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };
  const handleSave = async () => {
    if (!editingPolicy) return;
    const errors = validatePolicy(editingPolicy);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    try {
      const result = await updatePolicy(workspaceId, editingPolicy);
      if (result.success) {
        setHasChanges(false);
        onPolicyUpdate();
    } catch (error) {
  console.error('Failed to save policy:', error);
};
  const handleReset = () => {
    setEditingPolicy(policy);
    setHasChanges(false);
    setValidationErrors({});
  };
  if (isLoading) {
    return;
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading policy...</span>
      </div>
    );
  if (!editingPolicy) {
    return;
      <div className="text-center py-8">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Policy Found</h3>
        <p className="text-gray-500">
          No lock policy exists for this workspace.
        </p>
      </div>
    );
  return;
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Lock Policy Configuration</h3>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && ()
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <Save className="h-4 w-4" />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
      {/* Error Display */}
      {error && ()
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
      {/* Basic Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Basic Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Policy Name
            </label>
            <input
              type="text"
              value={editingPolicy.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
  validationErrors.name ? 'border-red-300' : 'border-gray-300',
}`}
            />
            {validationErrors.name && ()
              <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={editingPolicy.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      {/* Lock Limits */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-gray-500" />
          <h4 className="text-md font-medium text-gray-900">Lock Limits</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Locks Per User
            </label>
            <input
              type="number"
              min="1"
              value={editingPolicy.max_locks_per_user || ''}
              onChange={(e) => handleInputChange('max_locks_per_user', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
  validationErrors.max_locks_per_user ? 'border-red-300' : 'border-gray-300',
}`}
            />
            {validationErrors.max_locks_per_user && ()
              <p className="text-sm text-red-600 mt-1">{validationErrors.max_locks_per_user}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Locks Per Resource
            </label>
            <input
              type="number"
              min="1"
              value={editingPolicy.max_locks_per_resource || ''}
              onChange={(e) => handleInputChange('max_locks_per_resource', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
  validationErrors.max_locks_per_resource ? 'border-red-300' : 'border-gray-300',
}`}
            />
            {validationErrors.max_locks_per_resource && ()
              <p className="text-sm text-red-600 mt-1">{validationErrors.max_locks_per_resource}</p>
            )}
          </div>
        </div>
      </div>
      {/* Duration Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-gray-500" />
          <h4 className="text-md font-medium text-gray-900">Duration Settings</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={editingPolicy.default_duration_minutes || ''}
              onChange={(e) => handleInputChange('default_duration_minutes', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
  validationErrors.default_duration_minutes ? 'border-red-300' : 'border-gray-300',
}`}
            />
            {validationErrors.default_duration_minutes && ()
              <p className="text-sm text-red-600 mt-1">{validationErrors.default_duration_minutes}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={editingPolicy.max_duration_minutes || ''}
              onChange={(e) => handleInputChange('max_duration_minutes', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
  validationErrors.max_duration_minutes ? 'border-red-300' : 'border-gray-300',
}`}
            />
            {validationErrors.max_duration_minutes && ()
              <p className="text-sm text-red-600 mt-1">{validationErrors.max_duration_minutes}</p>
            )}
          </div>
        </div>
      </div>
      {/* Auto-Lock Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-gray-500" />
          <h4 className="text-md font-medium text-gray-900">Auto-Lock Settings</h4>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={editingPolicy.auto_lock_on_edit || false}
              onChange={(e) => handleInputChange('auto_lock_on_edit', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label className="text-sm text-gray-700">
              Automatically lock resources when editing
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={editingPolicy.auto_lock_on_state_change || false}
              onChange={(e) => handleInputChange('auto_lock_on_state_change', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label className="text-sm text-gray-700">
              Automatically lock resources during state changes
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auto-Lock Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={editingPolicy.auto_lock_duration_minutes || ''}
              onChange={(e) => handleInputChange('auto_lock_duration_minutes', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      {/* Lock Breaking Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-gray-500" />
          <h4 className="text-md font-medium text-gray-900">Lock Breaking Settings</h4>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={editingPolicy.allow_lock_breaking || false}
              onChange={(e) => handleInputChange('allow_lock_breaking', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label className="text-sm text-gray-700">
              Allow lock breaking
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={editingPolicy.require_justification || false}
              onChange={(e) => handleInputChange('require_justification', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label className="text-sm text-gray-700">
              Require justification for lock breaking
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roles that can break locks (comma-separated)
            </label>
            <input
              type="text"
              value={editingPolicy.lock_breaking_roles?.join(', ') || ''}
              onChange={(e) => handleInputChange('lock_breaking_roles', e.target.value.split(',').map(s => s.trim()))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin, manager, supervisor"
            />
          </div>
        </div>
      </div>
      {/* Conflict Resolution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="h-5 w-5 text-gray-500" />
          <h4 className="text-md font-medium text-gray-900">Conflict Resolution</h4>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strategy
            </label>
            <select
              value={editingPolicy.conflict_resolution_strategy || 'reject'}
              onChange={(e) => handleInputChange('conflict_resolution_strategy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="reject">Reject conflicting requests</option>
              <option value="queue">Queue conflicting requests</option>
              <option value="notify">Notify lock owner</option>
              <option value="escalate">Escalate to administrators</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Escalation Timeout (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={editingPolicy.escalation_timeout_minutes || ''}
              onChange={(e) => handleInputChange('escalation_timeout_minutes', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
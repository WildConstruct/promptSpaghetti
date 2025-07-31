/**
 * Toggle Status Override Panel Component
 * 
 * Epic 17.1.3 - Toggle Controls
 * Task: E17-1753114396765-6CF13D - Develop toggle status controls
 * 
 * Provides administrative controls for overriding normal toggle behavior,
 * including emergency overrides, testing scenarios, and manual interventions.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Shield, AlertTriangle, Settings, X, Check,
  RefreshCw, Eye, Edit,
  Lock, Unlock, Zap, Target, Percent
} from 'lucide-react';

// Types for status overrides
}
interface StatusOverride {
  id: string;,
  toggleId: string;
  toggleKey: string;,
  toggleName: string;
  overrideType: 'FORCE_ENABLE' | 'FORCE_DISABLE' | 'PERCENTAGE_OVERRIDE' | 'TARGETING_OVERRIDE' | 'EMERGENCY_DISABLE';,
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SCHEDULED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';
  // Override configuration
  overrideValue?: unknown;
  percentageOverride?: number;
  targetingOverride?: string;
  // Override metadata
  reason: string;,
  justification: string;
  createdByUserId: string;,
  createdByUserName: string;
  createdAt: string;
  // Expiration and scheduling
  expiresAt?: string;
  scheduledStartAt?: string;
  isTemporary: boolean;
  // Impact and approval
  impactAssessment: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';,
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  // Monitoring
  affectedUserCount?: number;
  performanceImpact?: string;
  monitoringEnabled: boolean;
  interface ToggleStatusOverridePanelProps {
  toggleId?: string;
  isOpen: boolean;,
  onClose: () => void;
  onOverrideCreated?: (override: StatusOverride) => void;
  const ToggleStatusOverridePanel: React.FC<ToggleStatusOverridePanelProps> = ({,)
  toggleId,
  isOpen,
  onClose,
  onOverrideCreated
}
}) => {
  const [activeOverrides, setActiveOverrides] = useState<StatusOverride>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedOverrideType, _setSelectedOverrideType] = useState<string>('FORCE_ENABLE');
  // Form state for creating new overrides
  const [newOverride, setNewOverride] = useState({)
  overrideType: 'FORCE_ENABLE',
  reason: '',
  justification: '',
  isTemporary: true,
  expirationHours: 24,
  percentageOverride: 50,
  priority: 'NORMAL',
  requiresApproval: false,
  monitoringEnabled: true,
});
  // Mock data for demonstration - wrapped in useMemo to prevent recreation on every render
  const mockOverrides: StatusOverride = useMemo(() => [
    {
  id: 'override-1',
  toggleId: 'toggle-123',
  toggleKey: 'advanced_search_v2',
  toggleName: 'Advanced Search V2',
  overrideType: 'EMERGENCY_DISABLE',
  status: 'ACTIVE',
  priority: 'EMERGENCY',
  reason: 'Performance degradation detected',
  justification: 'Search response times increased by 300% after deployment',
  createdByUserId: 'user-admin-1',
  createdByUserName: 'Sarah Johnson',
  createdAt: '2024-07-22T18:30:00Z',
  expiresAt: '2024-07-22T22:30:00Z',
  isTemporary: true,
  impactAssessment: 'HIGH',
  requiresApproval: false,
  affectedUserCount: 1247,
  performanceImpact: 'Search latency reduced by 85%',
  monitoringEnabled: true,
}
    {
  id: 'override-2',
  toggleId: 'toggle-456',
  toggleKey: 'new_ui_components',
  toggleName: 'New UI Components',
  overrideType: 'PERCENTAGE_OVERRIDE',
  status: 'ACTIVE',
  priority: 'NORMAL',
  percentageOverride: 25,
  reason: 'Gradual rollout for A/B testing',
  justification: 'Limiting exposure while monitoring user feedback',
  createdByUserId: 'user-admin-2',
  createdByUserName: 'Mike Chen',
  createdAt: '2024-07-22T14:00:00Z',
  isTemporary: false,
  impactAssessment: 'MEDIUM',
  requiresApproval: true,
  approvedBy: 'Sarah Johnson',
  approvedAt: '2024-07-22T14:15:00Z',
  affectedUserCount: 312,
  performanceImpact: 'No significant impact detected',
  monitoringEnabled: true], []); // Empty dependency array since this is static mock data
  const fetchActiveOverrides = useCallback(async () => {
  setLoading(true);
  try {
  // Simulate API call
  setTimeout(() => {
  const filteredOverrides = toggleId ;
  ? mockOverrides.filter(override => override.toggleId === toggleId)
  : mockOverrides;
  setActiveOverrides(filteredOverrides);
  setLoading(false);
}, 1000);
    } catch (error) {
  console.error('Failed to fetch overrides:', error);
  setLoading(false);
}, [toggleId, mockOverrides]);
  useEffect(() => {
    if (isOpen) {
      fetchActiveOverrides();
  }, [isOpen, fetchActiveOverrides]);
  const handleCreateOverride = async () => {
  try {
  const override: StatusOverride = {,
  id: crypto.randomUUID(),
  toggleId: toggleId || 'selected-toggle',
  toggleKey: 'example_toggle',
  toggleName: 'Example Toggle',
  overrideType: newOverride.overrideType as 'FORCE_ENABLE' | 'FORCE_DISABLE' | 'PERCENTAGE_OVERRIDE' | 'TARGETING_OVERRIDE' | 'EMERGENCY_DISABLE',
  status: 'ACTIVE',
  priority: newOverride.priority as 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY',
  reason: newOverride.reason,
  justification: newOverride.justification,
  createdByUserId: 'current-user',
  createdByUserName: 'Current User',
  createdAt: new Date().toISOString(),
  expiresAt: newOverride.isTemporary ,
  ? new Date(Date.now() + newOverride.expirationHours * 60 * 60 * 1000).toISOString()
  : undefined,
  isTemporary: newOverride.isTemporary,
  impactAssessment: 'MEDIUM',
  requiresApproval: newOverride.requiresApproval,
  monitoringEnabled: newOverride.monitoringEnabled,
  percentageOverride: newOverride.overrideType === 'PERCENTAGE_OVERRIDE' ,
  ? newOverride.percentageOverride
  : undefined,
};
      // Simulate API call
      setActiveOverrides(prev => [override, ...prev]);
      setShowCreateForm(false);
      setNewOverride({)
  overrideType: 'FORCE_ENABLE',
  reason: '',
  justification: '',
  isTemporary: true,
  expirationHours: 24,
  percentageOverride: 50,
  priority: 'NORMAL',
  requiresApproval: false,
  monitoringEnabled: true,
});
      onOverrideCreated?.(override);
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      alert('Failed to create override');
  };
  const handleCancelOverride = async (overrideId: string) => {
    try {
      // Simulate API call
      setActiveOverrides(prev => )
        prev.map(override => )
          override.id === overrideId 
            ? { ...override, status: 'CANCELLED' as const }
            : override
      );
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      alert('Failed to cancel override');
  };
  const getOverrideTypeIcon = (type: string) => {
  switch (type) {
  case 'EMERGENCY_DISABLE': return <Zap className="text-red-500" />;
  case 'FORCE_ENABLE': return <Unlock className="text-green-500" />;
  case 'FORCE_DISABLE': return <Lock className="text-red-500" />;
  case 'PERCENTAGE_OVERRIDE': return <Percent className="text-blue-500" />;
  case 'TARGETING_OVERRIDE': return <Target className="text-purple-500" />;
  default: return <Settings className="text-gray-500" />;
};
  const getPriorityColor = (priority: string): string => {
  switch (priority) {
  case 'EMERGENCY': return 'text-red-600 bg-red-50 border-red-200';
  case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
  case 'NORMAL': return 'text-blue-600 bg-blue-50 border-blue-200';
  case 'LOW': return 'text-gray-600 bg-gray-50 border-gray-200';
  default: return 'text-gray-600 bg-gray-50 border-gray-200';
};
  const getStatusColor = (status: string): string => {
  switch (status) {
  case 'ACTIVE': return 'text-green-600 bg-green-50 border-green-200';
  case 'EXPIRED': return 'text-gray-600 bg-gray-50 border-gray-200';
  case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-200';
  case 'SCHEDULED': return 'text-blue-600 bg-blue-50 border-blue-200';
  default: return 'text-gray-600 bg-gray-50 border-gray-200';
};
  const formatTimeRemaining = (expiresAt?: string): string => {
    if (!expiresAt) return 'No expiration';
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    if (diffMs <= 0) return 'Expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m remaining`;}
    return `${minutes}m remaining`;}
  };
  if (!isOpen) return null;
  return;
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Toggle Status Override Controls
            </h2>
            {toggleId && <span className="text-sm text-gray-500">({toggleId})</span>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Create Override
              </button>
              <button
                onClick={fetchActiveOverrides}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Refresh
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4" />
              <span>{activeOverrides.filter(o => o.status === 'ACTIVE').length} active overrides</span>
            </div>
          </div>
          {/* Create Override Form */}
          {showCreateForm && ()
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Status Override</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Override Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Override Type
                  </label>
                  <select
                    value={newOverride.overrideType}
                    onChange={(e) => setNewOverride(prev => ({ ...prev, overrideType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="FORCE_ENABLE">Force Enable</option>
                    <option value="FORCE_DISABLE">Force Disable</option>
                    <option value="PERCENTAGE_OVERRIDE">Percentage Override</option>
                    <option value="TARGETING_OVERRIDE">Targeting Override</option>
                    <option value="EMERGENCY_DISABLE">Emergency Disable</option>
                  </select>
                </div>
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={newOverride.priority}
                    onChange={(e) => setNewOverride(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                {/* Percentage Override (conditional) */}
                {newOverride.overrideType === 'PERCENTAGE_OVERRIDE' && ()
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Override Percentage
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newOverride.percentageOverride}
                      onChange={(e) => setNewOverride(prev => ({ ...prev, percentageOverride: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                {/* Expiration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={newOverride.isTemporary}
                      onChange={(e) => setNewOverride(prev => ({ ...prev, isTemporary: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">Temporary</span>
                    {newOverride.isTemporary && ()
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={newOverride.expirationHours}
                        onChange={(e) => setNewOverride(prev => ({ ...prev, expirationHours: parseInt(e.target.value) }))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Hours"
                      />
                    )}
                  </div>
                </div>
              </div>
              {/* Reason and Justification */}
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Required)
                  </label>
                  <input
                    type="text"
                    value={newOverride.reason}
                    onChange={(e) => setNewOverride(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Brief reason for this override..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Justification
                  </label>
                  <textarea
                    value={newOverride.justification}
                    onChange={(e) => setNewOverride(prev => ({ ...prev, justification: e.target.value }))}
                    placeholder="Detailed explanation and business justification..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              {/* Options */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={newOverride.requiresApproval}
                    onChange={(e) => setNewOverride(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Requires management approval</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={newOverride.monitoringEnabled}
                    onChange={(e) => setNewOverride(prev => ({ ...prev, monitoringEnabled: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Enable enhanced monitoring</span>
                </div>
              </div>
              {/* Form Actions */}
              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOverride}
                  disabled={!newOverride.reason.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Create Override
                </button>
              </div>
            </div>
          )}
          {/* Active Overrides List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {loading ? 'Loading overrides...' : `Active Overrides (${activeOverrides.length})`}
            </h3>
            {loading ? ()
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
                <p className="text-gray-600">Loading status overrides...</p>
              </div>
            ) : activeOverrides.length === 0 ? ()
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No active overrides found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Create an override to manually control toggle behavior
                </p>
              </div>
            ) : ()
              activeOverrides.map((override) => ()
                <div key={override.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Override Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        {getOverrideTypeIcon(override.overrideType)}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {override.toggleName} ({override.toggleKey})
                          </h4>
                          <p className="text-sm text-gray-600">{override.overrideType.replace()
                            '_',
                            ' '
                          ).toLowerCase()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(override.priority)}`}>}
                            {override.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(override.status)}`}>}
                            {override.status}
                          </span>
                        </div>
                      </div>
                      {/* Override Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Created by:</span>
                          <p className="font-medium text-gray-900">{override.createdByUserName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Time remaining:</span>
                          <p className="font-medium text-gray-900">{formatTimeRemaining(override.expiresAt)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Affected users:</span>
                          <p className="font-medium text-gray-900">{override.affectedUserCount?.toLocaleString() || 'Unknown'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Impact level:</span>
                          <p className="font-medium text-gray-900">{override.impactAssessment}</p>
                        </div>
                      </div>
                      {/* Override Value */}
                      {override.percentageOverride && ()
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <Percent className="w-4 h-4 inline mr-1" />
                            Override percentage: <strong>{override.percentageOverride}%</strong>
                          </p>
                        </div>
                      )}
                      {/* Reason and Justification */}
                      <div className="mt-3 space-y-2">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Reason:</span>
                          <p className="text-sm text-gray-900">{override.reason}</p>
                        </div>
                        {override.justification && ()
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Justification:</span>
                            <p className="text-sm text-gray-700">{override.justification}</p>
                          </div>
                        )}
                      </div>
                      {/* Performance Impact */}
                      {override.performanceImpact && ()
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            <Check className="w-4 h-4 inline mr-1" />
                            {override.performanceImpact}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit Override"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {override.status === 'ACTIVE' && ()
                        <button
                          onClick={() => handleCancelOverride(override.id)}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                          title="Cancel Override"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToggleStatusOverridePanel;
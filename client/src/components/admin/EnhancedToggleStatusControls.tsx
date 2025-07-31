/**
 * Enhanced Toggle Status Controls Component
 * 
 * Epic 17.1.3 - Toggle Controls  
 * Task: E17-1753114396765-6CF13D - Develop toggle status controls
 * 
 * Provides comprehensive toggle status management including basic controls,
 * percentage rollouts, emergency controls, and status overrides.
 */
import React, { useState } from 'react';
import { 
  ToggleLeft, ToggleRight, Percent, Shield, AlertTriangle, 
  Settings, Zap, TrendingUp, Activity,
  RefreshCw, Pause, Play, CheckCircle
} from 'lucide-react';
}
interface FeatureToggle {
  id: string;,
  key: string,
  name: string;,
  enabled: boolean,
  type: 'BOOLEAN' | 'PERCENTAGE' | 'MULTIVARIATE' | 'SCHEDULED' | 'SEGMENTATION';
  value?: unknown;
  percentage?: number;
  hasActiveOverride?: boolean;
  overrideType?: string;
  rolloutStatus?: 'PAUSED' | 'ACTIVE' | 'COMPLETED' | 'ROLLING_BACK';
  targetPercentage?: number;
  currentPercentage?: number;
  claudeImpact?: string;
  interface EnhancedToggleStatusControlsProps {
  toggle: FeatureToggle;,
  onToggleChange: (toggle: FeatureToggle) => void;
  onPercentageChange?: (toggleId: string, percentage: number) => void;
  onOverrideClick?: (toggleId: string) => void;
  onEmergencyDisable?: (toggleId: string, reason: string) => void;
  compact?: boolean;
  }

const EnhancedToggleStatusControls: React.FC<EnhancedToggleStatusControlsProps> = ({
  toggle,
  onToggleChange,
  onPercentageChange,
  onOverrideClick,
  onEmergencyDisable,
  compact = false
}
}) => {
  const [showPercentageSlider, setShowPercentageSlider] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [tempPercentage, setTempPercentage] = useState(toggle.percentage || 0);
  // Handle basic toggle activation/deactivation
  const handleBasicToggle = () => {
    const updatedToggle = { ...toggle, enabled: !toggle.enabled };
    onToggleChange(updatedToggle);
  };
  // Handle percentage rollout changes
  const handlePercentageUpdate = () => {
    onPercentageChange?.(toggle.id, tempPercentage);
    setShowPercentageSlider(false);
  };
  // Handle emergency disable
  const handleEmergencyDisable = () => {
    if (!emergencyReason.trim()) {
      alert('Please provide a reason for emergency disable');
      return;
    onEmergencyDisable?.(toggle.id, emergencyReason);
    setShowEmergencyConfirm(false);
    setEmergencyReason('');
  };
  // Handle rollout status controls
  const handleRolloutControl = (action: 'pause' | 'resume' | 'rollback') => {
    // Implementation would depend on specific rollout management system
    console.log(`Rollout ${action} for toggle ${toggle.id}`);}
  };
  // Get status indicator based on toggle state and overrides
  const getStatusIndicator = () => {
    if (toggle.hasActiveOverride) {
      return;
        <div className="flex items-center space-x-1">
          <Shield className="w-4 h-4 text-orange-500" />
          <span className="text-xs text-orange-600 font-medium">OVERRIDE</span>
        </div>
      );
    if (toggle.type === 'PERCENTAGE' && toggle.rolloutStatus) {
      const statusConfig = {
        'PAUSED': { icon: Pause, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        'ACTIVE': { icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
        'COMPLETED': { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
        'ROLLING_BACK': { icon: RefreshCw, color: 'text-red-600', bg: 'bg-red-50' }
      };
      const config = statusConfig[toggle.rolloutStatus];
      const Icon = config.icon;
      return;
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${config.bg}`}>}
          <Icon className={`w-3 h-3 ${config.color}`} />}
          <span className={`text-xs font-medium ${config.color}`}>}
            {toggle.rolloutStatus.replace('_', ' ')}
          </span>
        </div>
      );
    return toggle.enabled ? ()
      <span className="text-xs text-green-600 font-medium">ACTIVE</span>
    ) : ()
      <span className="text-xs text-gray-500 font-medium">DISABLED</span>
    );
  };
  // Get percentage display for rollout toggles
  const getPercentageDisplay = () => {
    if (toggle.type !== 'PERCENTAGE') return null;
    const current = toggle.currentPercentage || toggle.percentage || 0;
    const target = toggle.targetPercentage || toggle.percentage || 0;
    return;
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Percent className="w-3 h-3 text-blue-500" />
          <span className="text-sm font-medium">{current}%</span>
        </div>
        {target !== current && ()
          <div className="flex items-center space-x-1 text-gray-500">
            <TrendingUp className="w-3 h-3" />
            <span className="text-xs">→ {target}%</span>
          </div>
        )}
      </div>
    );
  };
  if (compact) {
    return;
      <div className="flex items-center space-x-2">
        {/* Basic Toggle */}
        <button
          onClick={handleBasicToggle}
          className="toggle-status-btn"
          title={toggle.enabled ? 'Click to disable' : 'Click to enable'}
          disabled={toggle.hasActiveOverride}
        >
          {toggle.enabled ? ()
            <ToggleRight className="toggle-enabled" size={16} />
          ) : ()
            <ToggleLeft className="toggle-disabled" size={16} />
          )}
        </button>
        {/* Status Indicator */}
        {getStatusIndicator()}
        {/* Percentage Display (for percentage toggles) */}
        {getPercentageDisplay()}
        {/* Override Indicator */}
        {toggle.hasActiveOverride && ()
          <button
            onClick={() => onOverrideClick?.(toggle.id)}
            className="p-1 text-orange-500 hover:text-orange-700 transition-colors"
            title="Manage overrides"
          >
            <Shield className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  return;
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Status Controls</h3>
        {getStatusIndicator()}
      </div>
      {/* Primary Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Basic Enable/Disable */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Primary Status
          </label>
          <button
            onClick={handleBasicToggle}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
  toggle.enabled
  ? 'bg-green-100 text-green-700 hover:bg-green-200',
  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
}`}
            disabled={toggle.hasActiveOverride}
          >
            {toggle.enabled ? ()
              <ToggleRight className="w-5 h-5" />
            ) : ()
              <ToggleLeft className="w-5 h-5" />
            )}
            <span className="font-medium">
              {toggle.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </button>
        </div>
        {/* Percentage Control (for percentage toggles) */}
        {toggle.type === 'PERCENTAGE' && ()
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Rollout Percentage
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                {getPercentageDisplay()}
              </div>
              <button
                onClick={() => setShowPercentageSlider(!showPercentageSlider)}
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                title="Adjust percentage"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            {showPercentageSlider && ()
              <div className="space-y-3 p-3 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={tempPercentage}
                    onChange={(e) => setTempPercentage(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-center">
                    {tempPercentage}%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPercentageSlider(false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePercentageUpdate}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Override Controls */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Advanced Controls
          </label>
          <button
            onClick={() => onOverrideClick?.(toggle.id)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">
              {toggle.hasActiveOverride ? 'Manage Override' : 'Create Override'}
            </span>
          </button>
        </div>
      </div>
      {/* Rollout Controls (for percentage toggles) */}
      {toggle.type === 'PERCENTAGE' && toggle.rolloutStatus && ()
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Rollout Management
            </label>
            <div className="text-xs text-gray-500">
              Current: {toggle.currentPercentage || 0}% → Target: {toggle.targetPercentage || 0}%
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {toggle.rolloutStatus === 'ACTIVE' && ()
              <button
                onClick={() => handleRolloutControl('pause')}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              >
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </button>
            )}
            {toggle.rolloutStatus === 'PAUSED' && ()
              <button
                onClick={() => handleRolloutControl('resume')}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>Resume</span>
              </button>
            )}
            <button
              onClick={() => handleRolloutControl('rollback')}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Rollback</span>
            </button>
          </div>
        </div>
      )}
      {/* Emergency Controls */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Emergency Controls
            </label>
            <p className="text-xs text-gray-500">
              Immediately disable for critical issues
            </p>
          </div>
          <button
            onClick={() => setShowEmergencyConfirm(true)}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            disabled={!toggle.enabled}
          >
            <Zap className="w-3 h-3" />
            <span>Emergency Disable</span>
          </button>
        </div>
        {/* Emergency Confirmation */}
        {showEmergencyConfirm && ()
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">
                Emergency Disable Confirmation
              </span>
            </div>
            <textarea
              value={emergencyReason}
              onChange={(e) => setEmergencyReason(e.target.value)}
              placeholder="Explain the emergency situation requiring immediate disable..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            <div className="flex items-center space-x-2 mt-2">
              <button
                onClick={() => setShowEmergencyConfirm(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencyDisable}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                disabled={!emergencyReason.trim()}
              >
                Confirm Emergency Disable
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Claude Impact Warning */}
      {toggle.claudeImpact && toggle.claudeImpact !== 'NONE' && ()
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">
              Claude Impact: {toggle.claudeImpact.replace('_', ' ').toLowerCase()}
            </span>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            Changes to this toggle may affect Claude AI model behavior
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedToggleStatusControls;
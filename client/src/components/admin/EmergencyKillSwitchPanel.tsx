/**
 * Emergency Kill Switch Panel - Epic 17
 * Task: E17-1753114396769-A130B3 - Implement emergency kill switch
 * 
 * Provides emergency controls to rapidly disable feature toggles in crisis situations.
 * Critical safety interface for preventing system-wide issues.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Shield,
  Power,
  RotateCcw,
  Clock,
  Activity,
  Eye,
  Plus,
  Settings,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './EmergencyKillSwitchPanel.css';

interface EmergencyKillSwitch {
  id: string;
  name: string;
  description: string;
  scope: 'ALL' | 'CLAUDE_IMPACT' | 'CRITICAL_FEATURES' | 'CUSTOM';
  targetToggles?: string[];
  claudeImpactLevels?: string[];
  enabled: boolean;
  createdAt: string;
  createdBy: string;
  lastActivated?: string;
  lastActivatedBy?: string;
  activationCount: number;
}

interface KillSwitchActivation {
  id: string;
  killSwitchId: string;
  activatedBy: string;
  activatedAt: string;
  reason: string;
  affectedToggles: string[];
  status: 'ACTIVE' | 'ROLLED_BACK' | 'EXPIRED';
  autoRollbackAt?: string;
}

interface EmergencyMetrics {
  totalKillSwitches: number;
  activeKillSwitches: number;
  activeActivations: number;
  togglesCurrentlyDisabled: number;
  totalActivations: number;
  lastActivation?: string;
}

export const EmergencyKillSwitchPanel: React.FC = () => {
  const [killSwitches, setKillSwitches] = useState<EmergencyKillSwitch[]>([]);
  const [activeActivations, setActiveActivations] = useState<KillSwitchActivation[]>([]);
  const [metrics, setMetrics] = useState<EmergencyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showActivateModal, setShowActivateModal] = useState<string | null>(null);
  const [showRollbackModal, setShowRollbackModal] = useState<string | null>(null);
  const [activationReason, setActivationReason] = useState('');
  const [rollbackReason, setRollbackReason] = useState('');
  const [autoRollbackMinutes, setAutoRollbackMinutes] = useState<number | undefined>(undefined);

  // Load emergency data
  const loadEmergencyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load kill switches, activations, and metrics in parallel
      const [killSwitchesRes, activationsRes, metricsRes] = await Promise.all([
        fetch('/api/emergency/kill-switches', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/emergency/activations/active', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/emergency/metrics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (!killSwitchesRes.ok || !activationsRes.ok || !metricsRes.ok) {
        throw new Error('Failed to load emergency data');
      }

      const [killSwitchesData, activationsData, metricsData] = await Promise.all([
        killSwitchesRes.json(),
        activationsRes.json(),
        metricsRes.json()
      ]);

      setKillSwitches(killSwitchesData.killSwitches || []);
      setActiveActivations(activationsData.activations || []);
      setMetrics(metricsData.metrics || null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emergency data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmergencyData();
    // Refresh every 30 seconds for emergency monitoring
    const interval = setInterval(loadEmergencyData, 30000);
    return () => clearInterval(interval);
  }, [loadEmergencyData]);

  // Emergency action handlers
  const handleEmergencyAll = async () => {
    if (!confirm('🚨 EMERGENCY: This will disable ALL feature toggles! Are you absolutely sure?')) {
      return;
    }

    const reason = prompt('Emergency reason (required):');
    if (!reason) return;

    try {
      const response = await fetch('/api/emergency/disable-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) throw new Error('Emergency action failed');

      alert('🚨 EMERGENCY: All toggles have been disabled!');
      loadEmergencyData();
    } catch (err) {
      alert(`Emergency action failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEmergencyClaudeImpact = async () => {
    if (!confirm('🚨 EMERGENCY: This will disable all Claude-impacting toggles! Continue?')) {
      return;
    }

    const reason = prompt('Emergency reason (required):');
    if (!reason) return;

    try {
      const response = await fetch('/api/emergency/disable-claude-impact', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) throw new Error('Emergency action failed');

      alert('🚨 EMERGENCY: Claude-impacting toggles have been disabled!');
      loadEmergencyData();
    } catch (err) {
      alert(`Emergency action failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleActivateKillSwitch = async (killSwitchId: string) => {
    if (!activationReason.trim()) {
      alert('Activation reason is required');
      return;
    }

    try {
      const response = await fetch(`/api/emergency/kill-switches/${killSwitchId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          reason: activationReason,
          autoRollbackMinutes 
        })
      });

      if (!response.ok) throw new Error('Kill switch activation failed');

      setShowActivateModal(null);
      setActivationReason('');
      setAutoRollbackMinutes(undefined);
      loadEmergencyData();
    } catch (err) {
      alert(`Activation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleRollbackActivation = async (activationId: string) => {
    if (!rollbackReason.trim()) {
      alert('Rollback reason is required');
      return;
    }

    try {
      const response = await fetch(`/api/emergency/activations/${activationId}/rollback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rollbackReason })
      });

      if (!response.ok) throw new Error('Rollback failed');

      setShowRollbackModal(null);
      setRollbackReason('');
      loadEmergencyData();
    } catch (err) {
      alert(`Rollback failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const getScopeDisplay = (scope: string) => {
    switch (scope) {
      case 'ALL':
        return { text: 'All Toggles', color: 'red', icon: <Power size={14} /> };
      case 'CLAUDE_IMPACT':
        return { text: 'Claude Impact', color: 'orange', icon: <Zap size={14} /> };
      case 'CRITICAL_FEATURES':
        return { text: 'Critical Features', color: 'yellow', icon: <Shield size={14} /> };
      case 'CUSTOM':
        return { text: 'Custom', color: 'blue', icon: <Settings size={14} /> };
      default:
        return { text: scope, color: 'gray', icon: null };
    }
  };

  const getActivationStatusDisplay = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { text: 'Active', color: 'red', icon: <AlertCircle size={14} /> };
      case 'ROLLED_BACK':
        return { text: 'Rolled Back', color: 'green', icon: <CheckCircle size={14} /> };
      case 'EXPIRED':
        return { text: 'Expired', color: 'gray', icon: <XCircle size={14} /> };
      default:
        return { text: status, color: 'gray', icon: null };
    }
  };

  if (loading) {
    return (
      <div className="emergency-panel loading">
        <LoadingSpinner />
        <p>Loading emergency controls...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emergency-panel error">
        <AlertTriangle size={24} />
        <p>Error: {error}</p>
        <button className="btn btn-secondary" onClick={loadEmergencyData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="emergency-kill-switch-panel">
      {/* Emergency Alert Header */}
      <div className="emergency-header">
        <div className="emergency-title">
          <AlertTriangle size={24} className="emergency-icon" />
          <h2>Emergency Kill Switch Controls</h2>
        </div>
        <div className="emergency-warning">
          ⚠️ These controls can rapidly disable feature toggles system-wide. Use only in emergency situations.
        </div>
      </div>

      {/* System Status */}
      {metrics && (
        <div className="emergency-metrics">
          <div className="metric-card">
            <Activity size={20} />
            <div className="metric-info">
              <div className="metric-value">{metrics.activeActivations}</div>
              <div className="metric-label">Active Emergencies</div>
            </div>
          </div>
          
          <div className="metric-card">
            <Shield size={20} />
            <div className="metric-info">
              <div className="metric-value">{metrics.activeKillSwitches}</div>
              <div className="metric-label">Available Kill Switches</div>
            </div>
          </div>
          
          <div className="metric-card">
            <Power size={20} />
            <div className="metric-info">
              <div className="metric-value">{metrics.togglesCurrentlyDisabled}</div>
              <div className="metric-label">Disabled Toggles</div>
            </div>
          </div>
          
          <div className="metric-card">
            <Clock size={20} />
            <div className="metric-info">
              <div className="metric-value">{metrics.totalActivations}</div>
              <div className="metric-label">Total Activations</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Emergency Actions */}
      <div className="emergency-quick-actions">
        <h3>🚨 Quick Emergency Actions</h3>
        <div className="quick-actions-grid">
          <button 
            className="emergency-btn emergency-all"
            onClick={handleEmergencyAll}
          >
            <Power size={20} />
            <div>
              <div className="action-title">DISABLE ALL TOGGLES</div>
              <div className="action-subtitle">Nuclear option - disables everything</div>
            </div>
          </button>

          <button 
            className="emergency-btn emergency-claude"
            onClick={handleEmergencyClaudeImpact}
          >
            <Zap size={20} />
            <div>
              <div className="action-title">DISABLE CLAUDE IMPACT</div>
              <div className="action-subtitle">Disables toggles affecting Claude behavior</div>
            </div>
          </button>
        </div>
      </div>

      {/* Active Activations */}
      {activeActivations.length > 0 && (
        <div className="active-activations-section">
          <h3>🔴 Active Emergency Activations</h3>
          <div className="activations-list">
            {activeActivations.map((activation) => {
              const killSwitch = killSwitches.find(ks => ks.id === activation.killSwitchId);
              const statusDisplay = getActivationStatusDisplay(activation.status);
              
              return (
                <div key={activation.id} className="activation-card active">
                  <div className="activation-header">
                    <div className="activation-title">
                      <AlertCircle size={16} className="status-icon active" />
                      {killSwitch?.name || 'Unknown Kill Switch'}
                    </div>
                    <Badge color={statusDisplay.color}>
                      {statusDisplay.icon}
                      {statusDisplay.text}
                    </Badge>
                  </div>
                  
                  <div className="activation-details">
                    <div className="activation-reason">
                      <strong>Reason:</strong> {activation.reason}
                    </div>
                    <div className="activation-meta">
                      <span>Activated by: {activation.activatedBy}</span>
                      <span>Time: {new Date(activation.activatedAt).toLocaleString()}</span>
                      <span>Affected: {activation.affectedToggles.length} toggles</span>
                    </div>
                    {activation.autoRollbackAt && (
                      <div className="auto-rollback-info">
                        ⏰ Auto-rollback at: {new Date(activation.autoRollbackAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="activation-actions">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setShowRollbackModal(activation.id)}
                    >
                      <RotateCcw size={14} />
                      Rollback
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Kill Switches List */}
      <div className="kill-switches-section">
        <h3>⚡ Available Kill Switches</h3>
        <div className="kill-switches-grid">
          {killSwitches.map((killSwitch) => {
            const scopeDisplay = getScopeDisplay(killSwitch.scope);
            const isActive = activeActivations.some(a => a.killSwitchId === killSwitch.id);
            
            return (
              <div key={killSwitch.id} className={`kill-switch-card ${isActive ? 'active' : ''}`}>
                <div className="kill-switch-header">
                  <div className="kill-switch-title">
                    <Badge color={scopeDisplay.color}>
                      {scopeDisplay.icon}
                      {scopeDisplay.text}
                    </Badge>
                    <span className="kill-switch-name">{killSwitch.name}</span>
                  </div>
                  {isActive && (
                    <div className="active-indicator">
                      <AlertCircle size={16} />
                      ACTIVE
                    </div>
                  )}
                </div>
                
                <div className="kill-switch-description">
                  {killSwitch.description}
                </div>
                
                <div className="kill-switch-stats">
                  <span>Activations: {killSwitch.activationCount}</span>
                  {killSwitch.lastActivated && (
                    <span>Last: {new Date(killSwitch.lastActivated).toLocaleDateString()}</span>
                  )}
                </div>
                
                <div className="kill-switch-actions">
                  {killSwitch.enabled ? (
                    isActive ? (
                      <button className="btn btn-secondary btn-sm" disabled>
                        Currently Active
                      </button>
                    ) : (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setShowActivateModal(killSwitch.id)}
                      >
                        <Power size={14} />
                        Activate
                      </button>
                    )
                  ) : (
                    <button className="btn btn-secondary btn-sm" disabled>
                      Disabled
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activate Kill Switch Modal */}
      {showActivateModal && (
        <div className="modal-overlay" onClick={() => setShowActivateModal(null)}>
          <div className="modal emergency-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚨 Activate Emergency Kill Switch</h3>
              <button className="btn-icon" onClick={() => setShowActivateModal(null)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="warning-box">
                <AlertTriangle size={20} />
                <div>
                  <strong>Warning:</strong> This action will immediately disable multiple feature toggles.
                  Only proceed if you understand the consequences.
                </div>
              </div>
              
              <div className="form-group">
                <label>Emergency Reason (Required):</label>
                <textarea
                  value={activationReason}
                  onChange={(e) => setActivationReason(e.target.value)}
                  placeholder="Describe the emergency situation requiring this action..."
                  rows={3}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>Auto-Rollback (Optional):</label>
                <input
                  type="number"
                  value={autoRollbackMinutes || ''}
                  onChange={(e) => setAutoRollbackMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Minutes until automatic rollback"
                  className="form-control"
                  min={1}
                  max={1440}
                />
                <div className="form-help">
                  If specified, the kill switch will automatically rollback after this time
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowActivateModal(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleActivateKillSwitch(showActivateModal)}
                disabled={!activationReason.trim()}
              >
                🚨 Activate Emergency Kill Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Modal */}
      {showRollbackModal && (
        <div className="modal-overlay" onClick={() => setShowRollbackModal(null)}>
          <div className="modal rollback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔄 Rollback Emergency Kill Switch</h3>
              <button className="btn-icon" onClick={() => setShowRollbackModal(null)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="info-box">
                <CheckCircle size={20} />
                <div>
                  <strong>Rollback:</strong> This will restore the previous state of all affected toggles.
                </div>
              </div>
              
              <div className="form-group">
                <label>Rollback Reason (Required):</label>
                <textarea
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                  placeholder="Explain why you are rolling back this emergency action..."
                  rows={3}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowRollbackModal(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleRollbackActivation(showRollbackModal)}
                disabled={!rollbackReason.trim()}
              >
                <RotateCcw size={14} />
                Rollback Kill Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
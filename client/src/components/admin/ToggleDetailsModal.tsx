// Epic 17.1.3 - Toggle Details Modal Component

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Clock, 
  User, 
  Edit, 
  History, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Shield,
  Eye,
  Code,
  Settings,
  Users,
  Target
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { UserPreviewTool } from './targeting/UserPreviewTool';
import './targeting/UserPreviewTool.css';
import './targeting/TargetingModalExtensions.css';

interface ToggleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  toggleId: string;
  onEdit: (toggleId: string) => void;
}

interface ToggleDetails {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: string;
  value: unknown;
  enabled: boolean;
  claudeImpact: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  createdBy?: string;
  updatedBy?: string;
  scopes: Array<{
    id: string;
    rule: unknown;
    priority: number;
    createdAt: string;
  }>;
  recentAudit: Array<{
    id: string;
    action: string;
    actorId?: string;
    reason?: string;
    createdAt: string;
    isEmergency: boolean;
  }>;
  dependencies: {
    dependencies: {
      requires: string[];
      conflicts: string[];
      suggests: string[];
    };
    dependents: {
      requiredBy: string[];
      conflictsWith: string[];
      suggestedBy: string[];
    };
    impactRadius: number;
  };
}

export const ToggleDetailsModal: React.FC<ToggleDetailsModalProps> = ({
  isOpen,
  onClose,
  toggleId,
  onEdit
}) => {
  const [toggle, setToggle] = useState<ToggleDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'config' | 'audit' | 'dependencies' | 'targeting'
  >('overview');
  const [showUserPreview, setShowUserPreview] = useState(false);

  const fetchToggleDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/feature-toggles/toggles/${toggleId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setToggle(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load toggle details');
    } finally {
      setLoading(false);
    }
  }, [toggleId]);

  useEffect(() => {
    if (isOpen && toggleId) {
      fetchToggleDetails();
    }
  }, [isOpen, toggleId, fetchToggleDetails]);

  const getClaudeImpactDisplay = (impact: string) => {
    switch (impact) {
    case 'NONE':
      return { color: 'gray', icon: <Info size={14} />, text: 'No Impact' };
    case 'PROMPT_COST':
      return { color: 'yellow', icon: <Shield size={14} />, text: 'Prompt Cost Impact' };
    case 'MODEL_VERSION':
      return { color: 'blue', icon: <Zap size={14} />, text: 'Model Version Change' };
    case 'OUTPUT_QUALITY':
      return { color: 'green', icon: <Eye size={14} />, text: 'Output Quality Impact' };
    case 'HALLUCINATION_RISK':
      return { color: 'red', icon: <AlertTriangle size={14} />, text: 'Hallucination Risk' };
    default:
      return { color: 'gray', icon: <Info size={14} />, text: impact };
    }
  };

  const formatToggleValue = (toggle: ToggleDetails): JSX.Element => {
    switch (toggle.type) {
    case 'boolean':
      return (
        <div className="toggle-value-display">
          <span className={`boolean-indicator ${toggle.value.enabled ? 'enabled' : 'disabled'}`}>
            {toggle.value.enabled ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {toggle.value.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      );
        
    case 'percentage_rollout':
      return (
        <div className="toggle-value-display">
          <div className="percentage-display">
            <div className="percentage-bar">
              <div 
                className="percentage-fill" 
                style={{ width: `${toggle.value.percentage}%` }}
              />
            </div>
            <span className="percentage-text">{toggle.value.percentage}%</span>
          </div>
        </div>
      );
        
    case 'multivariate':
      return (
        <div className="toggle-value-display">
          <div className="variants-display">
            {toggle.value.variants?.map((
              variant: { key?: string; value?: unknown; percentage?: number }, 
              index: number
            ) => (
              <div key={index} className="variant-item">
                <span className="variant-key">{variant.key}</span>
                <span className="variant-percentage">{variant.percentage}%</span>
                <span className="variant-value">{JSON.stringify(variant.value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
        
    default:
      return (
        <div className="toggle-value-display">
          <code className="raw-value">{JSON.stringify(toggle.value, null, 2)}</code>
        </div>
      );
    }
  };

  const formatAuditAction = (action: string) => {
    const actionMap: Record<string, { label: string; color: string; icon: JSX.Element }> = {
      'created': { label: 'Created', color: 'blue', icon: <CheckCircle size={14} /> },
      'updated': { label: 'Updated', color: 'yellow', icon: <Edit size={14} /> },
      'activated': { label: 'Activated', color: 'green', icon: <CheckCircle size={14} /> },
      'deactivated': { label: 'Deactivated', color: 'red', icon: <XCircle size={14} /> },
      'archived': { label: 'Archived', color: 'gray', icon: <XCircle size={14} /> },
      'override': { label: 'Emergency Override', color: 'red', icon: <AlertTriangle size={14} /> },
      'rollback': { label: 'Rollback', color: 'orange', icon: <History size={14} /> }
    };
    
    return actionMap[action] || { label: action, color: 'gray', icon: <Info size={14} /> };
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content toggle-details-modal">
        <div className="modal-header">
          <div className="header-left">
            <h2>Toggle Details</h2>
            {toggle && (
              <div className="header-meta">
                <code className="toggle-key">{toggle.key}</code>
                <span className="version">v{toggle.version}</span>
              </div>
            )}
          </div>
          
          <div className="header-actions">
            {toggle && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onEdit(toggle.id)}
              >
                <Edit size={16} />
                Edit
              </button>
            )}
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <LoadingSpinner />
              <p>Loading toggle details...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <AlertTriangle size={24} />
              <p>Error: {error}</p>
              <button className="btn btn-secondary" onClick={fetchToggleDetails}>
                Try Again
              </button>
            </div>
          ) : toggle ? (
            <>
              {/* Tabs */}
              <div className="details-tabs">
                <button
                  className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <Info size={16} />
                  Overview
                </button>
                <button
                  className={`tab ${activeTab === 'config' ? 'active' : ''}`}
                  onClick={() => setActiveTab('config')}
                >
                  <Settings size={16} />
                  Configuration
                </button>
                <button
                  className={`tab ${activeTab === 'audit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('audit')}
                >
                  <History size={16} />
                  Audit Log
                </button>
                <button
                  className={`tab ${activeTab === 'dependencies' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dependencies')}
                >
                  <Code size={16} />
                  Dependencies
                </button>
                <button
                  className={`tab ${activeTab === 'targeting' ? 'active' : ''}`}
                  onClick={() => setActiveTab('targeting')}
                >
                  <Target size={16} />
                  Targeting
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'overview' && (
                  <div className="overview-tab">
                    {/* Basic Info */}
                    <div className="info-section">
                      <h3>Basic Information</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Name</label>
                          <span>{toggle.name}</span>
                        </div>
                        
                        <div className="info-item">
                          <label>Type</label>
                          <Badge color="blue">{toggle.type.replace('_', ' ')}</Badge>
                        </div>
                        
                        <div className="info-item">
                          <label>Status</label>
                          <Badge color={toggle.enabled ? 'green' : 'gray'}>
                            {toggle.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        
                        <div className="info-item">
                          <label>Claude Impact</label>
                          {(() => {
                            const claudeDisplay = getClaudeImpactDisplay(toggle.claudeImpact);
                            return (
                              <Badge color={claudeDisplay.color}>
                                {claudeDisplay.icon}
                                {claudeDisplay.text}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>
                      
                      {toggle.description && (
                        <div className="info-item description">
                          <label>Description</label>
                          <p>{toggle.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Current Value */}
                    <div className="info-section">
                      <h3>Current Value</h3>
                      {formatToggleValue(toggle)}
                    </div>

                    {/* Timestamps */}
                    <div className="info-section">
                      <h3>Timeline</h3>
                      <div className="timeline-grid">
                        <div className="timeline-item">
                          <Clock size={16} />
                          <div>
                            <label>Created</label>
                            <span>{new Date(toggle.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="timeline-item">
                          <Clock size={16} />
                          <div>
                            <label>Last Updated</label>
                            <span>{new Date(toggle.updatedAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'config' && (
                  <div className="config-tab">
                    <div className="info-section">
                      <h3>Scoping Rules</h3>
                      {toggle.scopes.length > 0 ? (
                        <div className="scopes-list">
                          {toggle.scopes.map((scope) => (
                            <div key={scope.id} className="scope-item">
                              <div className="scope-header">
                                <span className="scope-priority">Priority {scope.priority}</span>
                                <span className="scope-date">
                                  {new Date(scope.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <code className="scope-rule">
                                {JSON.stringify(scope.rule, null, 2)}
                              </code>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="empty-state">No scoping rules configured</p>
                      )}
                    </div>

                    <div className="info-section">
                      <h3>Raw Configuration</h3>
                      <code className="raw-config">
                        {JSON.stringify({
                          type: toggle.type,
                          value: toggle.value,
                          enabled: toggle.enabled,
                          claudeImpact: toggle.claudeImpact
                        }, null, 2)}
                      </code>
                    </div>
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="audit-tab">
                    <div className="info-section">
                      <h3>Recent Activity</h3>
                      {toggle.recentAudit.length > 0 ? (
                        <div className="audit-list">
                          {toggle.recentAudit.map((audit) => {
                            const actionDisplay = formatAuditAction(audit.action);
                            return (
                              <div key={audit.id} className="audit-item">
                                <div className="audit-icon">
                                  {actionDisplay.icon}
                                </div>
                                <div className="audit-content">
                                  <div className="audit-header">
                                    <Badge color={actionDisplay.color}>
                                      {actionDisplay.label}
                                    </Badge>
                                    {audit.isEmergency && (
                                      <Badge color="red">Emergency</Badge>
                                    )}
                                    <span className="audit-time">
                                      {new Date(audit.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  {audit.reason && (
                                    <p className="audit-reason">{audit.reason}</p>
                                  )}
                                  {audit.actorId && (
                                    <span className="audit-actor">
                                      <User size={12} />
                                      {audit.actorId}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="empty-state">No audit history available</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'dependencies' && (
                  <div className="dependencies-tab">
                    <div className="dependencies-overview">
                      <div className="impact-radius">
                        <h4>Impact Radius</h4>
                        <div className="radius-score">
                          {toggle.dependencies.impactRadius}
                        </div>
                        <p>Estimated number of toggles affected by changes</p>
                      </div>
                    </div>

                    <div className="dependencies-grid">
                      <div className="dependency-section">
                        <h4>Dependencies</h4>
                        <p className="section-description">Toggles this toggle depends on</p>
                        
                        {Object.entries(toggle.dependencies.dependencies).map(([type, toggles]) => (
                          <div key={type} className="dependency-group">
                            <h5>{type.charAt(0).toUpperCase() + type.slice(1)}</h5>
                            {toggles.length > 0 ? (
                              <ul>
                                {toggles.map((toggleKey) => (
                                  <li key={toggleKey}>
                                    <code>{toggleKey}</code>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="empty-state">None</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="dependency-section">
                        <h4>Dependents</h4>
                        <p className="section-description">Toggles that depend on this toggle</p>
                        
                        {Object.entries(toggle.dependencies.dependents).map(([type, toggles]) => (
                          <div key={type} className="dependency-group">
                            <h5>{type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}</h5>
                            {toggles.length > 0 ? (
                              <ul>
                                {toggles.map((toggleKey) => (
                                  <li key={toggleKey}>
                                    <code>{toggleKey}</code>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="empty-state">None</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'targeting' && (
                  <div className="targeting-tab">
                    <div className="targeting-overview">
                      <div className="targeting-stats">
                        <div className="stat-card">
                          <h4>Targeting Rules</h4>
                          <div className="stat-value">{toggle.scopes.length}</div>
                          <p>Active scoping rules</p>
                        </div>
                        
                        <div className="stat-card">
                          <h4>Estimated Reach</h4>
                          <div className="stat-value">~2.5K</div>
                          <p>Users affected</p>
                        </div>
                      </div>
                      
                      <div className="targeting-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setShowUserPreview(true)}
                        >
                          <Users size={16} />
                          Preview User Experience
                        </button>
                      </div>
                    </div>

                    <div className="targeting-rules-section">
                      <h4>Targeting Rules</h4>
                      {toggle.scopes.length > 0 ? (
                        <div className="targeting-rules-list">
                          {toggle.scopes.map((scope, index) => (
                            <div key={scope.id} className="targeting-rule-item">
                              <div className="rule-header">
                                <div className="rule-priority">
                                  <Badge color="blue">Priority {scope.priority}</Badge>
                                </div>
                                <div className="rule-date">
                                  Added {new Date(scope.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className="rule-content">
                                <h5>Rule {index + 1}</h5>
                                <div className="rule-description">
                                  {scope.rule.description || 'No description provided'}
                                </div>
                                
                                <div className="rule-conditions">
                                  <h6>Conditions:</h6>
                                  <pre className="rule-json">
                                    {JSON.stringify(scope.rule, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-targeting">
                          <Target size={32} />
                          <h5>No Targeting Rules</h5>
                          <p>This toggle applies to all users without any targeting restrictions.</p>
                        </div>
                      )}
                    </div>

                    <div className="targeting-segments-section">
                      <h4>Related Segments</h4>
                      <p className="section-description">
                        User segments that might be relevant for this toggle
                      </p>
                      
                      <div className="segments-grid">
                        {/* Mock segments - replace with actual data */}
                        <div className="segment-card">
                          <div className="segment-info">
                            <h5>Beta Users</h5>
                            <p>Users who opted into beta testing</p>
                            <div className="segment-stats">
                              <span>~1,250 users</span>
                              <Badge color="green">Active</Badge>
                            </div>
                          </div>
                          <button className="btn btn-secondary btn-sm">
                            Apply Segment
                          </button>
                        </div>
                        
                        <div className="segment-card">
                          <div className="segment-info">
                            <h5>Premium Users</h5>
                            <p>Users with premium subscriptions</p>
                            <div className="segment-stats">
                              <span>~5,680 users</span>
                              <Badge color="green">Active</Badge>
                            </div>
                          </div>
                          <button className="btn btn-secondary btn-sm">
                            Apply Segment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* User Preview Tool */}
        <UserPreviewTool
          isOpen={showUserPreview}
          onClose={() => setShowUserPreview(false)}
          toggleId={toggleId}
          rules={toggle?.scopes.map(scope => scope.rule).flat() || []}
        />
      </div>
    </div>
  );
};

export default ToggleDetailsModal;
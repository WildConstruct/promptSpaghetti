// Epic 17.1.2 - Feature Toggle Admin Dashboard

import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  AlertTriangle,
  Clock,
  Shield,
  Eye,
  Edit,
  Trash2,
  History,
  Zap
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { CreateToggleModal } from './CreateToggleModal';
import { ToggleDetailsModal } from './ToggleDetailsModal';
import { EditToggleModal } from './EditToggleModal';
import { BulkOperationsModal } from './BulkOperationsModal';
import ToggleStatusOverridePanel from './ToggleStatusOverridePanel';
import EnhancedToggleStatusControls from './EnhancedToggleStatusControls';
import { ToggleParametersManager } from './ToggleParametersManager';
import './FeatureToggleDashboard.css';
import './CreateToggleModal.css';
import './ToggleDetailsModal.css';

interface FeatureToggle {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: 'boolean' | 'percentage_rollout' | 'multivariate' | 'scheduled' | 'segmentation';
  value: boolean | number | string | Record<string, unknown>;
  enabled: boolean;
  claudeImpact: 'NONE' | 'PROMPT_COST' | 'MODEL_VERSION' | 'OUTPUT_QUALITY' | 'HALLUCINATION_RISK';
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface DashboardFilters {
  search: string;
  enabled?: boolean;
  type?: string;
  claudeImpact?: string;
}

interface DashboardState {
  toggles: FeatureToggle[];
  total: number;
  loading: boolean;
  error?: string;
  filters: DashboardFilters;
  currentPage: number;
  pageSize: number;
}

export const FeatureToggleDashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    toggles: [],
    total: 0,
    loading: true,
    filters: { search: '' },
    currentPage: 1,
    pageSize: 20
  });

  const [selectedToggles, setSelectedToggles] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [detailsToggleId, setDetailsToggleId] = useState<string | null>(null);
  const [editToggleId, setEditToggleId] = useState<string | null>(null);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [auditHistoryToggleId, setAuditHistoryToggleId] = useState<string | null>(null);
  const [archiveConfirmToggleId, setArchiveConfirmToggleId] = useState<string | null>(null);
  const [showStatusOverridePanel, setShowStatusOverridePanel] = useState(false);
  const [selectedToggleForOverride, setSelectedToggleForOverride] = useState<string | null>(null);
  const [showParametersManager, setShowParametersManager] = useState(false);
  const [parametersToggleId, setParametersToggleId] = useState<string | null>(null);

  // Fetch toggles data
  const fetchToggles = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      const params = new URLSearchParams();
      
      if (state.filters.search) params.append('search', state.filters.search);
      if (state.filters.enabled !== undefined) params.append('enabled', state.filters.enabled.toString());
      if (state.filters.type) params.append('type', state.filters.type);
      if (state.filters.claudeImpact) params.append('claudeImpact', state.filters.claudeImpact);
      
      params.append('limit', state.pageSize.toString());
      params.append('offset', ((state.currentPage - 1) * state.pageSize).toString());

      const response = await fetch(`/api/feature-toggles/toggles?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        toggles: data.toggles,
        total: data.total,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load toggles'
      }));
    }
  }, [state.filters, state.currentPage, state.pageSize]);

  useEffect(() => {
    fetchToggles();
  }, [fetchToggles]);

  // Toggle activation/deactivation using symmetric endpoints
  const handleToggleStatus = async (toggle: FeatureToggle) => {
    try {
      const endpoint = toggle.enabled 
        ? `/api/feature-toggles/toggles/${toggle.id}/deactivate`
        : `/api/feature-toggles/toggles/${toggle.id}/activate`;
      
      const body = toggle.enabled 
        ? { reason: 'Manual deactivation from dashboard' }
        : { reason: 'Manual activation from dashboard' };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${toggle.enabled ? 'deactivate' : 'activate'} toggle`);
      }

      // Refresh data
      fetchToggles();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Operation failed');
    }
  };

  // Handle percentage rollout changes
  const handlePercentageChange = async (toggleId: string, percentage: number) => {
    try {
      const response = await fetch(`/api/feature-toggles/toggles/${toggleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          percentage,
          reason: `Percentage updated to ${percentage}% from dashboard`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update percentage');
      }

      fetchToggles();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Operation failed');
    }
  };

  // Handle override panel opening
  const handleOverrideClick = (toggleId: string) => {
    setSelectedToggleForOverride(toggleId);
    setShowStatusOverridePanel(true);
  };

  // Handle emergency disable
  const handleEmergencyDisable = async (toggleId: string, reason: string) => {
    try {
      const response = await fetch(`/api/feature-toggles/toggles/${toggleId}/deactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          reason: `EMERGENCY DISABLE: ${reason}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to emergency disable toggle');
      }

      fetchToggles();
      alert('Toggle emergency disabled successfully');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Emergency disable failed');
    }
  };

  // Handle override creation
  const handleOverrideCreated = () => {
    fetchToggles(); // Refresh to show override status
  };

  // Handle parameters management
  const handleParametersClick = (toggleId: string) => {
    setParametersToggleId(toggleId);
    setShowParametersManager(true);
  };

  const handleParametersChange = async (toggleId: string, parameters: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/toggle-parameters/toggles/${toggleId}/parameters`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          parameters,
          reason: 'Parameters updated from dashboard'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update toggle parameters');
      }

      fetchToggles(); // Refresh to show updated toggle
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update parameters');
    }
  };

  const handleParametersSave = async () => {
    // This will be called by the ToggleParametersManager when save is clicked
    setShowParametersManager(false);
    setParametersToggleId(null);
    fetchToggles();
  };

  // Handle archive toggle
  const handleArchiveToggle = async (toggleId: string) => {
    try {
      const response = await fetch(`/api/feature-toggles/toggles/${toggleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to archive toggle');
      }

      fetchToggles();
      setArchiveConfirmToggleId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Archive failed');
    }
  };

  // Get toggle type badge color
  const getTypeColor = (type: string): string => {
    switch (type) {
    case 'boolean': return 'blue';
    case 'percentage_rollout': return 'green';
    case 'multivariate': return 'purple';
    case 'scheduled': return 'orange';
    case 'segmentation': return 'pink';
    default: return 'gray';
    }
  };

  // Get Claude impact badge color and icon
  const getClaudeImpactDisplay = (impact: string) => {
    switch (impact) {
    case 'NONE':
      return { color: 'gray', icon: null, text: 'None' };
    case 'PROMPT_COST':
      return { color: 'yellow', icon: <Shield size={12} />, text: 'Cost' };
    case 'MODEL_VERSION':
      return { color: 'blue', icon: <Zap size={12} />, text: 'Model' };
    case 'OUTPUT_QUALITY':
      return { color: 'green', icon: <Eye size={12} />, text: 'Quality' };
    case 'HALLUCINATION_RISK':
      return { color: 'red', icon: <AlertTriangle size={12} />, text: 'Risk' };
    default:
      return { color: 'gray', icon: null, text: impact };
    }
  };

  // Format toggle value for display
  const formatToggleValue = (toggle: FeatureToggle): string => {
    switch (toggle.type) {
    case 'boolean':
      return toggle.value.enabled ? 'Enabled' : 'Disabled';
    case 'percentage_rollout':
      return `${toggle.value.percentage}%`;
    case 'multivariate':
      return `${toggle.value.variants?.length || 0} variants`;
    case 'scheduled':
      return toggle.value.enabled ? 'Active schedule' : 'Inactive';
    case 'segmentation':
      return `${toggle.value.rules?.length || 0} rules`;
    default:
      return 'Unknown';
    }
  };

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      currentPage: 1 // Reset to first page on filter change
    }));
  };

  const handleSelectToggle = (toggleId: string) => {
    setSelectedToggles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toggleId)) {
        newSet.delete(toggleId);
      } else {
        newSet.add(toggleId);
      }
      return newSet;
    });
  };

  const handleArchiveToggle = async (toggleId: string) => {
    try {
      const response = await fetch(`/api/feature-toggles/toggles/${toggleId}/archive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to archive toggle');
      }

      // Refresh toggles list
      await fetchToggles();
      setArchiveConfirmToggleId(null);
    } catch (error) {
      console.error('Error archiving toggle:', error);
      setState(prev => ({ ...prev, error: 'Failed to archive toggle' }));
    }
  };

  const handleSelectAll = () => {
    if (selectedToggles.size === state.toggles.length) {
      setSelectedToggles(new Set());
    } else {
      setSelectedToggles(new Set(state.toggles.map(t => t.id)));
    }
  };

  const handleCreateToggle = async (toggleData: {
    key: string;
    name: string;
    description?: string;
    type: string;
    value: boolean | number | string | Record<string, unknown>;
    claudeImpact: string;
  }) => {
    const response = await fetch('/api/feature-toggles/toggles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(toggleData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create toggle');
    }

    // Refresh the toggles list
    fetchToggles();
    setShowCreateModal(false);
  };

  return (
    <div className="feature-toggle-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Feature Toggles</h1>
          <p className="dashboard-subtitle">
            Manage feature flags, rollouts, and experiments
          </p>
        </div>
        
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={fetchToggles}
            disabled={state.loading}
          >
            <RefreshCw size={16} className={state.loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            Create Toggle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-label">Total Toggles</div>
          <div className="stat-value">{state.total}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value">
            {state.toggles.filter(t => t.enabled).length}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Claude Impact</div>
          <div className="stat-value">
            {state.toggles.filter(t => t.claudeImpact !== 'NONE').length}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Selected</div>
          <div className="stat-value">{selectedToggles.size}</div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Search</label>
            <div className="search-input">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search toggles..."
                value={state.filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={state.filters.enabled?.toString() || ''}
              onChange={(e) => handleFilterChange({ 
                enabled: e.target.value === '' ? undefined : e.target.value === 'true' 
              })}
            >
              <option value="">All</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Type</label>
            <select
              value={state.filters.type || ''}
              onChange={(e) => handleFilterChange({ type: e.target.value || undefined })}
            >
              <option value="">All Types</option>
              <option value="boolean">Boolean</option>
              <option value="percentage_rollout">Percentage Rollout</option>
              <option value="multivariate">Multivariate</option>
              <option value="scheduled">Scheduled</option>
              <option value="segmentation">Segmentation</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Claude Impact</label>
            <select
              value={state.filters.claudeImpact || ''}
              onChange={(e) => handleFilterChange({ claudeImpact: e.target.value || undefined })}
            >
              <option value="">All Impact Levels</option>
              <option value="NONE">None</option>
              <option value="PROMPT_COST">Prompt Cost</option>
              <option value="MODEL_VERSION">Model Version</option>
              <option value="OUTPUT_QUALITY">Output Quality</option>
              <option value="HALLUCINATION_RISK">Hallucination Risk</option>
            </select>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedToggles.size > 0 && (
        <div className="bulk-actions">
          <span>{selectedToggles.size} toggle(s) selected</span>
          <div className="bulk-buttons">
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowBulkOperations(true)}
            >
              Bulk Actions
            </button>
          </div>
        </div>
      )}

      {/* Toggles Table */}
      <div className="toggles-table-container">
        {state.loading ? (
          <div className="loading-state">
            <LoadingSpinner />
            <p>Loading feature toggles...</p>
          </div>
        ) : state.error ? (
          <div className="error-state">
            <AlertTriangle size={24} />
            <p>Error: {state.error}</p>
            <button className="btn btn-secondary" onClick={fetchToggles}>
              Try Again
            </button>
          </div>
        ) : (
          <table className="toggles-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedToggles.size === state.toggles.length && state.toggles.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Status</th>
                <th>Key</th>
                <th>Name</th>
                <th>Type</th>
                <th>Value</th>
                <th>Claude Impact</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.toggles.map((toggle) => {
                const claudeDisplay = getClaudeImpactDisplay(toggle.claudeImpact);
                
                return (
                  <tr key={toggle.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedToggles.has(toggle.id)}
                        onChange={() => handleSelectToggle(toggle.id)}
                      />
                    </td>
                    
                    <td>
                      <EnhancedToggleStatusControls
                        toggle={{
                          ...toggle,
                          type: toggle.type.toUpperCase().replace('_', '_') as 'BOOLEAN' | 'PERCENTAGE' | 'MULTIVARIATE' | 'SCHEDULED' | 'SEGMENTATION',
                          hasActiveOverride: false, // TODO: Add override detection logic
                          percentage: toggle.type === 'percentage_rollout' ? 50 : undefined,
                          rolloutStatus: toggle.type === 'percentage_rollout' ? 'ACTIVE' : undefined
                        }}
                        onToggleChange={handleToggleStatus}
                        onPercentageChange={handlePercentageChange}
                        onOverrideClick={handleOverrideClick}
                        onEmergencyDisable={handleEmergencyDisable}
                        compact={true}
                      />
                    </td>
                    
                    <td>
                      <code className="toggle-key">{toggle.key}</code>
                    </td>
                    
                    <td>
                      <div className="toggle-name-col">
                        <div className="toggle-name">{toggle.name}</div>
                        {toggle.description && (
                          <div className="toggle-description">{toggle.description}</div>
                        )}
                      </div>
                    </td>
                    
                    <td>
                      <Badge color={getTypeColor(toggle.type)}>
                        {toggle.type.replace('_', ' ')}
                      </Badge>
                    </td>
                    
                    <td>
                      <span className="toggle-value">
                        {formatToggleValue(toggle)}
                      </span>
                    </td>
                    
                    <td>
                      <Badge color={claudeDisplay.color}>
                        {claudeDisplay.icon}
                        {claudeDisplay.text}
                      </Badge>
                    </td>
                    
                    <td>
                      <div className="timestamp">
                        <Clock size={12} />
                        {new Date(toggle.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="version">v{toggle.version}</div>
                    </td>
                    
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          title="View Details"
                          onClick={() => setDetailsToggleId(toggle.id)}
                        >
                          <Eye size={14} />
                        </button>
                        
                        <button 
                          className="btn-icon" 
                          title="Edit Toggle"
                          onClick={() => setEditToggleId(toggle.id)}
                        >
                          <Edit size={14} />
                        </button>
                        
                        <button 
                          className="btn-icon" 
                          title="Manage Parameters"
                          onClick={() => handleParametersClick(toggle.id)}
                        >
                          <Settings size={14} />
                        </button>
                        
                        <button 
                          className="btn-icon" 
                          title="View Audit History"
                          onClick={() => setAuditHistoryToggleId(toggle.id)}
                        >
                          <History size={14} />
                        </button>
                        
                        <button 
                          className="btn-icon btn-danger" 
                          title="Archive Toggle"
                          onClick={() => setArchiveConfirmToggleId(toggle.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {state.total > state.pageSize && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={state.currentPage === 1}
            onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {state.currentPage} of {Math.ceil(state.total / state.pageSize)}
          </span>
          
          <button
            className="btn btn-secondary"
            disabled={state.currentPage >= Math.ceil(state.total / state.pageSize)}
            onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          >
            Next
          </button>
        </div>
      )}

      {/* Create Toggle Modal */}
      <CreateToggleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateToggle}
      />

      {/* Details Modal */}
      {detailsToggleId && (
        <ToggleDetailsModal
          isOpen={!!detailsToggleId}
          onClose={() => setDetailsToggleId(null)}
          toggleId={detailsToggleId}
          onEdit={(id) => {
            setDetailsToggleId(null);
            setEditToggleId(id);
          }}
        />
      )}

      {/* Edit Modal */}
      {editToggleId && (
        <EditToggleModal
          isOpen={!!editToggleId}
          onClose={() => setEditToggleId(null)}
          toggleId={editToggleId}
          onSave={() => {
            setEditToggleId(null);
            fetchToggles();
          }}
        />
      )}

      {/* Bulk Operations Modal */}
      <BulkOperationsModal
        isOpen={showBulkOperations}
        onClose={() => setShowBulkOperations(false)}
        selectedToggleIds={Array.from(selectedToggles)}
        onComplete={() => {
          setSelectedToggles(new Set());
          fetchToggles();
        }}
      />

      {/* Audit History Modal */}
      {auditHistoryToggleId && (
        <div className="modal-overlay" onClick={() => setAuditHistoryToggleId(null)}>
          <div className="modal audit-history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Audit History</h2>
              <button className="btn-icon" onClick={() => setAuditHistoryToggleId(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Audit history for toggle: {auditHistoryToggleId}</p>
              <div className="audit-list">
                {/* Audit entries would be loaded here */}
                <div className="audit-entry">
                  <div className="audit-timestamp">2024-01-15 10:30:45</div>
                  <div className="audit-action">Toggle enabled</div>
                  <div className="audit-user">user@example.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {archiveConfirmToggleId && (
        <div className="modal-overlay" onClick={() => setArchiveConfirmToggleId(null)}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Archive</h2>
              <button className="btn-icon" onClick={() => setArchiveConfirmToggleId(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to archive this feature toggle?</p>
              <p className="text-muted">This action can be reversed by restoring the toggle from the archive.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setArchiveConfirmToggleId(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => handleArchiveToggle(archiveConfirmToggleId)}
              >
                Archive Toggle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Override Panel */}
      <ToggleStatusOverridePanel
        toggleId={selectedToggleForOverride}
        isOpen={showStatusOverridePanel}
        onClose={() => {
          setShowStatusOverridePanel(false);
          setSelectedToggleForOverride(null);
        }}
        onOverrideCreated={handleOverrideCreated}
      />

      {/* Parameters Manager Modal */}
      {showParametersManager && parametersToggleId && (
        <div className="modal-overlay" onClick={() => {
          setShowParametersManager(false);
          setParametersToggleId(null);
        }}>
          <div className="modal parameters-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Toggle Parameters</h2>
              <button 
                className="btn-icon" 
                onClick={() => {
                  setShowParametersManager(false);
                  setParametersToggleId(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {(() => {
                const toggle = state.toggles.find(t => t.id === parametersToggleId);
                if (!toggle) return <p>Toggle not found</p>;

                return (
                  <ToggleParametersManager
                    toggleId={toggle.id}
                    toggleType={toggle.type.toUpperCase() as 'BOOLEAN' | 'PERCENTAGE_ROLLOUT' | 'MULTIVARIATE' | 'SCHEDULED' | 'SEGMENTATION'}
                    currentValue={toggle.value || {}}
                    onParametersChange={(parameters) => handleParametersChange(toggle.id, parameters)}
                    onSave={handleParametersSave}
                    readonly={false}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
/**
 * Enhanced Toggle Filters Component
 * Epic 17.1.2 - Admin Dashboard UI
 * Task: E17-1753114396752-C9492A
 * 
 * Advanced filtering and sorting functionality for feature toggles
 * with date ranges, dependencies, performance metrics, and saved filters.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  X,
  Calendar,
  ChevronDown,
  SortAsc,
  SortDesc,
  Bookmark,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  Activity,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { Badge } from '../common/Badge';
import './EnhancedToggleFilters.css';

export interface ToggleFilters {
  // Basic filters
  search: string;
  enabled?: boolean;
  type?: string;
  claudeImpact?: string;
  
  // Advanced filters
  organizationId?: string;
  createdBy?: string;
  dateRange?: {
    start: string;
    end: string;
    field: 'created' | 'updated' | 'lastEvaluated';
  };
  
  // Performance filters
  evaluationCount?: {
    min?: number;
    max?: number;
    period: '24h' | '7d' | '30d';
  };
  successRate?: {
    min: number;
    max: number;
  };
  responseTime?: {
    max: number; // milliseconds
  };
  
  // Relationship filters
  hasDependencies?: boolean;
  dependsOn?: string[]; // Toggle IDs
  usedBy?: string[]; // Organization IDs
  
  // Status filters
  hasAlerts?: boolean;
  hasOverrides?: boolean;
  isScheduled?: boolean;
  isRollingOut?: boolean;
  
  // Version and audit
  version?: {
    min?: number;
    max?: number;
  };
  lastModifiedBy?: string;
  
  // Tags and metadata
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface SortConfig {
  field: SortField;
  direction: 'asc' | 'desc';
  secondary?: {
    field: SortField;
    direction: 'asc' | 'desc';
  };
}

export type SortField = 
  | 'name' | 'key' | 'type' | 'enabled' | 'createdAt' | 'updatedAt'
  | 'claudeImpact' | 'version' | 'evaluationCount' | 'successRate' 
  | 'responseTime' | 'lastEvaluated' | 'dependencyCount' | 'organizationCount';

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: ToggleFilters;
  sort: SortConfig;
  isDefault?: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

interface EnhancedToggleFiltersProps {
  filters: ToggleFilters;
  sort: SortConfig;
  onFiltersChange: (filters: ToggleFilters) => void;
  onSortChange: (sort: SortConfig) => void;
  onReset: () => void;
  
  // Data for dropdowns
  availableTypes: string[];
  availableOrganizations: Array<{ id: string; name: string }>;
  availableUsers: Array<{ id: string; name: string }>;
  availableToggles: Array<{ id: string; name: string }>;
  
  // Loading states
  loading?: boolean;
  filtersLoading?: boolean;
  
  // Result info
  totalResults?: number;
  filteredResults?: number;
  
  // Advanced features
  showAdvanced?: boolean;
  allowSavedFilters?: boolean;
}

export const EnhancedToggleFilters: React.FC<EnhancedToggleFiltersProps> = ({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  onReset,
  availableTypes,
  availableOrganizations,
  availableUsers,
  availableToggles,
  loading = false,
  filtersLoading = false,
  totalResults = 0,
  filteredResults = 0,
  showAdvanced = true,
  allowSavedFilters = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [selectedSavedFilter, setSelectedSavedFilter] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load saved filters
  useEffect(() => {
    loadSavedFilters();
  }, []);

  const loadSavedFilters = async () => {
    try {
      // In real implementation, fetch from API
      const mockFilters: SavedFilter[] = [
        {
          id: '1',
          name: 'Active Claude Toggles',
          description: 'Toggles that impact Claude operations',
          filters: {
            search: '',
            enabled: true,
            claudeImpact: 'PROMPT_COST,MODEL_VERSION,OUTPUT_QUALITY,HALLUCINATION_RISK'
          },
          sort: { field: 'updatedAt', direction: 'desc' },
          createdBy: 'admin',
          createdAt: '2024-01-01T00:00:00Z',
          usageCount: 23
        },
        {
          id: '2',
          name: 'High Performance Issues',
          description: 'Toggles with performance problems',
          filters: {
            search: '',
            hasAlerts: true,
            responseTime: { max: 100 },
            successRate: { min: 0, max: 95 }
          },
          sort: { field: 'responseTime', direction: 'desc' },
          createdBy: 'admin',
          createdAt: '2024-01-01T00:00:00Z',
          usageCount: 15
        },
        {
          id: '3',
          name: 'Recently Created',
          description: 'Toggles created in the last 7 days',
          filters: {
            search: '',
            dateRange: {
              start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end: new Date().toISOString().split('T')[0],
              field: 'created'
            }
          },
          sort: { field: 'createdAt', direction: 'desc' },
          createdBy: 'admin',
          createdAt: '2024-01-01T00:00:00Z',
          usageCount: 8
        }
      ];
      setSavedFilters(mockFilters);
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    }
  };

  // Handle filter changes with debouncing
  const debouncedFilterChange = useCallback(
    debounce((newFilters: Partial<ToggleFilters>) => {
      onFiltersChange({ ...filters, ...newFilters });
    }, 300),
    [filters, onFiltersChange]
  );

  const handleFilterChange = (newFilters: Partial<ToggleFilters>) => {
    debouncedFilterChange(newFilters);
  };

  const handleSortChange = (field: SortField) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ field, direction: newDirection });
  };

  const handleSavedFilterSelect = (savedFilter: SavedFilter) => {
    onFiltersChange(savedFilter.filters);
    onSortChange(savedFilter.sort);
    setSelectedSavedFilter(savedFilter.id);
    
    // Update usage count
    setSavedFilters(prev => prev.map(f => 
      f.id === savedFilter.id ? { ...f, usageCount: f.usageCount + 1 } : f
    ));
  };

  const handleSaveCurrentFilter = async (name: string, description?: string) => {
    try {
      const newFilter: SavedFilter = {
        id: Date.now().toString(),
        name,
        description,
        filters,
        sort,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        usageCount: 0
      };
      
      setSavedFilters(prev => [...prev, newFilter]);
      setShowSaveModal(false);
      setSelectedSavedFilter(newFilter.id);
      
      // In real implementation, save to API
      console.log('Saved filter:', newFilter);
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.enabled !== undefined) count++;
    if (filters.type) count++;
    if (filters.claudeImpact) count++;
    if (filters.organizationId) count++;
    if (filters.dateRange) count++;
    if (filters.evaluationCount) count++;
    if (filters.successRate) count++;
    if (filters.hasAlerts) count++;
    if (filters.hasOverrides) count++;
    if (filters.tags?.length) count++;
    return count;
  };

  const renderSortIcon = (field: SortField) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />;
  };

  return (
    <div className="enhanced-toggle-filters">
      {/* Filter Header */}
      <div className="filters-header">
        <div className="filters-summary">
          <button 
            className={`filters-toggle ${isExpanded ? 'expanded' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter size={16} />
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <Badge variant="primary">{getActiveFilterCount()}</Badge>
            )}
            <ChevronDown size={16} className="chevron" />
          </button>
          
          {filteredResults !== totalResults && (
            <div className="results-info">
              <span className="filtered-count">{filteredResults.toLocaleString()}</span>
              <span className="total-count">of {totalResults.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="filters-actions">
          {allowSavedFilters && (
            <>
              <div className="saved-filters-dropdown">
                <select 
                  value={selectedSavedFilter || ''}
                  onChange={(e) => {
                    const savedFilter = savedFilters.find(f => f.id === e.target.value);
                    if (savedFilter) handleSavedFilterSelect(savedFilter);
                  }}
                >
                  <option value="">Saved Filters</option>
                  {savedFilters.map(filter => (
                    <option key={filter.id} value={filter.id}>
                      {filter.name} ({filter.usageCount})
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setShowSaveModal(true)}
                title="Save current filters"
              >
                <Bookmark size={14} />
              </button>
            </>
          )}

          {getActiveFilterCount() > 0 && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={onReset}
              title="Clear all filters"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {isExpanded && (
        <div className="filters-panel expanded">
          {/* Basic Filters Row */}
          <div className="filter-row basic-filters">
            <div className="filter-group">
              <label>Search</label>
              <div className="search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by name, key, or description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.enabled?.toString() || ''}
                onChange={(e) => handleFilterChange({ 
                  enabled: e.target.value === '' ? undefined : e.target.value === 'true' 
                })}
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange({ type: e.target.value || undefined })}
              >
                <option value="">All Types</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Claude Impact</label>
              <select
                value={filters.claudeImpact || ''}
                onChange={(e) => handleFilterChange({ claudeImpact: e.target.value || undefined })}
              >
                <option value="">All</option>
                <option value="NONE">None</option>
                <option value="PROMPT_COST">Prompt Cost</option>
                <option value="MODEL_VERSION">Model Version</option>
                <option value="OUTPUT_QUALITY">Output Quality</option>
                <option value="HALLUCINATION_RISK">Hallucination Risk</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="advanced-filters">
              <div className="filter-row">
                <div className="filter-group">
                  <label>Organization</label>
                  <select
                    value={filters.organizationId || ''}
                    onChange={(e) => handleFilterChange({ organizationId: e.target.value || undefined })}
                  >
                    <option value="">All Organizations</option>
                    {availableOrganizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Created By</label>
                  <select
                    value={filters.createdBy || ''}
                    onChange={(e) => handleFilterChange({ createdBy: e.target.value || undefined })}
                  >
                    <option value="">All Users</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Date Range</label>
                  <div className="date-range-input">
                    <button 
                      className="date-picker-btn"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                    >
                      <Calendar size={16} />
                      {filters.dateRange ? 
                        `${filters.dateRange.start} - ${filters.dateRange.end}` : 
                        'Select dates'
                      }
                    </button>
                    {filters.dateRange && (
                      <button 
                        className="clear-date-btn"
                        onClick={() => handleFilterChange({ dateRange: undefined })}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="filter-group">
                  <label>Evaluation Count</label>
                  <div className="range-input">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.evaluationCount?.min || ''}
                      onChange={(e) => handleFilterChange({
                        evaluationCount: {
                          ...filters.evaluationCount,
                          min: e.target.value ? parseInt(e.target.value) : undefined,
                          period: filters.evaluationCount?.period || '24h'
                        }
                      })}
                    />
                    <span>to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.evaluationCount?.max || ''}
                      onChange={(e) => handleFilterChange({
                        evaluationCount: {
                          ...filters.evaluationCount,
                          max: e.target.value ? parseInt(e.target.value) : undefined,
                          period: filters.evaluationCount?.period || '24h'
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="filter-row">
                <div className="filter-group">
                  <label>Success Rate (%)</label>
                  <div className="range-input">
                    <input
                      type="number"
                      placeholder="Min"
                      min="0"
                      max="100"
                      value={filters.successRate?.min || ''}
                      onChange={(e) => handleFilterChange({
                        successRate: {
                          min: e.target.value ? parseInt(e.target.value) : 0,
                          max: filters.successRate?.max || 100
                        }
                      })}
                    />
                    <span>to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      min="0"
                      max="100"
                      value={filters.successRate?.max || ''}
                      onChange={(e) => handleFilterChange({
                        successRate: {
                          min: filters.successRate?.min || 0,
                          max: e.target.value ? parseInt(e.target.value) : 100
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label>Max Response Time (ms)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={filters.responseTime?.max || ''}
                    onChange={(e) => handleFilterChange({
                      responseTime: e.target.value ? { max: parseInt(e.target.value) } : undefined
                    })}
                  />
                </div>

                <div className="filter-group checkbox-filters">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasAlerts || false}
                      onChange={(e) => handleFilterChange({ hasAlerts: e.target.checked || undefined })}
                    />
                    <AlertTriangle size={16} />
                    Has Alerts
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.hasOverrides || false}
                      onChange={(e) => handleFilterChange({ hasOverrides: e.target.checked || undefined })}
                    />
                    <Zap size={16} />
                    Has Overrides
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.isScheduled || false}
                      onChange={(e) => handleFilterChange({ isScheduled: e.target.checked || undefined })}
                    />
                    <Clock size={16} />
                    Scheduled
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="sort-section">
            <label>Sort by:</label>
            <div className="sort-options">
              {[
                { field: 'name' as SortField, label: 'Name', icon: <SortAsc size={14} /> },
                { field: 'updatedAt' as SortField, label: 'Last Updated', icon: <Clock size={14} /> },
                { field: 'createdAt' as SortField, label: 'Created', icon: <Plus size={14} /> },
                { field: 'evaluationCount' as SortField, label: 'Usage', icon: <Activity size={14} /> },
                { field: 'successRate' as SortField, label: 'Success Rate', icon: <TrendingUp size={14} /> },
                { field: 'responseTime' as SortField, label: 'Performance', icon: <Zap size={14} /> }
              ].map(option => (
                <button
                  key={option.field}
                  className={`sort-btn ${sort.field === option.field ? 'active' : ''}`}
                  onClick={() => handleSortChange(option.field)}
                >
                  {option.icon}
                  {option.label}
                  {renderSortIcon(option.field)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="date-picker-modal">
          <div className="date-picker-content">
            <h3>Select Date Range</h3>
            <div className="date-inputs">
              <div className="date-input">
                <label>From</label>
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => handleFilterChange({
                    dateRange: {
                      ...filters.dateRange,
                      start: e.target.value,
                      end: filters.dateRange?.end || e.target.value,
                      field: filters.dateRange?.field || 'created'
                    }
                  })}
                />
              </div>
              <div className="date-input">
                <label>To</label>
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => handleFilterChange({
                    dateRange: {
                      ...filters.dateRange,
                      start: filters.dateRange?.start || e.target.value,
                      end: e.target.value,
                      field: filters.dateRange?.field || 'created'
                    }
                  })}
                />
              </div>
              <div className="date-field">
                <label>Field</label>
                <select
                  value={filters.dateRange?.field || 'created'}
                  onChange={(e) => handleFilterChange({
                    dateRange: {
                      ...filters.dateRange,
                      start: filters.dateRange?.start || '',
                      end: filters.dateRange?.end || '',
                      field: e.target.value as 'created' | 'updated' | 'lastEvaluated'
                    }
                  })}
                >
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="lastEvaluated">Last Evaluated</option>
                </select>
              </div>
            </div>
            <div className="date-picker-actions">
              <button onClick={() => setShowDatePicker(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Save Filter Modal */}
      {showSaveModal && (
        <SaveFilterModal
          onSave={handleSaveCurrentFilter}
          onCancel={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
};

// Save Filter Modal Component
interface SaveFilterModalProps {
  onSave: (name: string, description?: string) => void;
  onCancel: () => void;
}

const SaveFilterModal: React.FC<SaveFilterModalProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), description.trim() || undefined);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal save-filter-modal">
        <div className="modal-header">
          <h3>Save Filter</h3>
          <button className="modal-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-group">
            <label htmlFor="filter-name">Name *</label>
            <input
              id="filter-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Custom Filter"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="filter-description">Description</label>
            <textarea
              id="filter-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this filter..."
              rows={3}
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export default EnhancedToggleFilters;
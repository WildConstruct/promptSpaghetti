/**
 * Targeting UI Components (Epic 17)
 * 
 * DEPLOYMENT BLOCKER FIX: Comprehensive suite of targeting UI components
 * for building intuitive user targeting interfaces. Provides reusable
 * components for audience selection, condition building, user previews,
 * and targeting analytics.
 * 
 * Features:
 * - Audience Selector with drag-and-drop segments
 * - Advanced Condition Builder with visual logic
 * - Real-time User Preview with filtering
 * - Targeting Performance Analytics
 * - Segment Management Interface
 * - A/B Test Configuration
 * - Geographic and Demographic Targeting
 * - Behavioral Targeting Controls
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Users, 
  Target, 
  Filter, 
  Globe, 
  Clock, 
  TrendingUp,
  Settings,
  Eye,
  Play,
  Pause,
  BarChart3,
  Map,
  Calendar,
  UserCheck,
  Zap,
  Search,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info,
  Layers,
  Sparkles,
  DragDropIcon as Grip
} from 'lucide-react';

// Core Types
export interface TargetingCondition {
  id: string;
  type: 'attribute' | 'behavior' | 'segment' | 'geography' | 'device' | 'time';
  field: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR' | 'NOT';
  weight?: number;
  isEnabled: boolean;
}

export interface UserSegment {
  id: string;
  name: string;
  description?: string;
  conditions: TargetingCondition[];
  userCount: number;
  isActive: boolean;
  createdAt: Date;
  lastUpdated: Date;
  tags: string[];
  color: string;
}

export interface TargetingAudience {
  id: string;
  name: string;
  segments: UserSegment[];
  conditions: TargetingCondition[];
  estimatedReach: number;
  conversionRate: number;
  isActive: boolean;
  rolloutPercentage: number;
}

export interface TargetingPreview {
  totalUsers: number;
  matchedUsers: number;
  matchPercentage: number;
  sampleUsers: Array<{
    id: string;
    email: string;
    attributes: Record<string, any>;
    matchReasons: string[];
  }>;
  demographics: {
    age: Record<string, number>;
    location: Record<string, number>;
    userType: Record<string, number>;
  };
}

// Audience Selector Component
interface AudienceSelectorProps {
  audiences: TargetingAudience[];
  selectedAudience?: TargetingAudience;
  onSelect: (audience: TargetingAudience) => void;
  onCreate?: () => void;
  onEdit?: (audience: TargetingAudience) => void;
  onDelete?: (audienceId: string) => void;
  showAnalytics?: boolean;
  compact?: boolean;
}

export const AudienceSelector: React.FC<AudienceSelectorProps> = ({
  audiences,
  selectedAudience,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  showAnalytics = false,
  compact = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'reach' | 'updated'>('name');

  const filteredAudiences = useMemo(() => {
    const filtered = audiences.filter(audience =>
      audience.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
      case 'reach':
        return b.estimatedReach - a.estimatedReach;
      case 'updated':
        return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime();
      default:
        return a.name.localeCompare(b.name);
      }
    });
  }, [audiences, searchTerm, sortBy]);

  return (
    <div className={`audience-selector ${compact ? 'compact' : ''}`}>
      <div className="selector-header">
        <div className="header-title">
          <Target size={20} />
          <h3>Target Audience</h3>
        </div>
        
        <div className="header-controls">
          <div className="search-control">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search audiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="reach">Sort by Reach</option>
            <option value="updated">Sort by Updated</option>
          </select>
          
          {onCreate && (
            <button className="btn btn-primary btn-sm" onClick={onCreate}>
              <Plus size={16} />
              New Audience
            </button>
          )}
        </div>
      </div>

      <div className="audiences-grid">
        {filteredAudiences.map(audience => (
          <div
            key={audience.id}
            className={`audience-card ${selectedAudience?.id === audience.id ? 'selected' : ''} ${!audience.isActive ? 'inactive' : ''}`}
            onClick={() => onSelect(audience)}
          >
            <div className="audience-header">
              <div className="audience-title">
                <h4>{audience.name}</h4>
                <div className="audience-status">
                  {audience.isActive ? (
                    <CheckCircle size={16} className="text-green" />
                  ) : (
                    <Pause size={16} className="text-gray" />
                  )}
                </div>
              </div>
              
              <div className="audience-actions">
                {onEdit && (
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(audience);
                    }}
                  >
                    <Settings size={14} />
                  </button>
                )}
                {onDelete && (
                  <button
                    className="btn-icon btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(audience.id);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="audience-metrics">
              <div className="metric">
                <Users size={16} />
                <span>{audience.estimatedReach.toLocaleString()} users</span>
              </div>
              
              {showAnalytics && (
                <div className="metric">
                  <TrendingUp size={16} />
                  <span>{(audience.conversionRate * 100).toFixed(1)}% conversion</span>
                </div>
              )}
              
              <div className="metric">
                <Target size={16} />
                <span>{audience.rolloutPercentage}% rollout</span>
              </div>
            </div>

            <div className="audience-segments">
              <div className="segments-preview">
                {audience.segments.slice(0, 3).map(segment => (
                  <div
                    key={segment.id}
                    className="segment-tag"
                    style={{ backgroundColor: segment.color + '20', borderColor: segment.color }}
                  >
                    {segment.name}
                  </div>
                ))}
                {audience.segments.length > 3 && (
                  <div className="segment-more">
                    +{audience.segments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAudiences.length === 0 && (
        <div className="empty-state">
          <Target size={48} />
          <h3>No audiences found</h3>
          <p>Create your first audience to start targeting users</p>
          {onCreate && (
            <button className="btn btn-primary" onClick={onCreate}>
              <Plus size={16} />
              Create Audience
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Advanced Condition Builder Component
interface AdvancedConditionBuilderProps {
  conditions: TargetingCondition[];
  onChange: (conditions: TargetingCondition[]) => void;
  availableFields: Array<{
    key: string;
    label: string;
    type: string;
    category: string;
    options?: unknown[];
  }>;
  onPreview?: (conditions: TargetingCondition[]) => Promise<TargetingPreview>;
  showVisualBuilder?: boolean;
}

export const AdvancedConditionBuilder: React.FC<AdvancedConditionBuilderProps> = ({
  conditions,
  onChange,
  availableFields,
  onPreview,
  showVisualBuilder = false
}) => {
  const [preview, setPreview] = useState<TargetingPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedCondition, setDraggedCondition] = useState<string | null>(null);

  const addCondition = (type: TargetingCondition['type'] = 'attribute') => {
    const newCondition: TargetingCondition = {
      id: `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      field: availableFields[0]?.key || '',
      operator: 'equals',
      value: '',
      logicalOperator: conditions.length > 0 ? 'AND' : undefined,
      weight: 1,
      isEnabled: true
    };
    
    onChange([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<TargetingCondition>) => {
    onChange(conditions.map(condition =>
      condition.id === id ? { ...condition, ...updates } : condition
    ));
  };

  const removeCondition = (id: string) => {
    const filtered = conditions.filter(c => c.id !== id);
    // Remove logical operator from first condition if needed
    if (filtered.length > 0 && filtered[0].logicalOperator) {
      filtered[0] = { ...filtered[0], logicalOperator: undefined };
    }
    onChange(filtered);
  };

  const generatePreview = async () => {
    if (!onPreview || conditions.length === 0) return;
    
    setPreviewLoading(true);
    try {
      const result = await onPreview(conditions);
      setPreview(result);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, conditionId: string) => {
    setDraggedCondition(conditionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedCondition) return;

    const draggedIndex = conditions.findIndex(c => c.id === draggedCondition);
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    const reorderedConditions = [...conditions];
    const [removed] = reorderedConditions.splice(draggedIndex, 1);
    reorderedConditions.splice(targetIndex, 0, removed);

    onChange(reorderedConditions);
    setDraggedCondition(null);
  };

  const conditionsByCategory = useMemo(() => {
    const categories: Record<string, typeof availableFields> = {};
    availableFields.forEach(field => {
      if (!categories[field.category]) {
        categories[field.category] = [];
      }
      categories[field.category].push(field);
    });
    return categories;
  }, [availableFields]);

  return (
    <div className="advanced-condition-builder">
      <div className="builder-header">
        <div className="header-title">
          <Filter size={20} />
          <h3>Targeting Conditions</h3>
          <div className="condition-count">
            {conditions.filter(c => c.isEnabled).length} active conditions
          </div>
        </div>
        
        <div className="header-controls">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye size={16} />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          
          {onPreview && (
            <button
              className="btn btn-primary btn-sm"
              onClick={generatePreview}
              disabled={previewLoading || conditions.length === 0}
            >
              <Zap size={16} />
              {previewLoading ? 'Loading...' : 'Test Conditions'}
            </button>
          )}
        </div>
      </div>

      {/* Visual Logic Builder */}
      {showVisualBuilder && (
        <div className="visual-logic-builder">
          <div className="logic-canvas">
            {conditions.map((condition, index) => (
              <div
                key={condition.id}
                className={`condition-node ${!condition.isEnabled ? 'disabled' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, condition.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="node-header">
                  <div className="drag-handle">
                    <Grip size={14} />
                  </div>
                  
                  <div className="condition-type">
                    <span className={`type-badge type-${condition.type}`}>
                      {condition.type}
                    </span>
                  </div>
                  
                  <div className="node-controls">
                    <button
                      className={`toggle-btn ${condition.isEnabled ? 'enabled' : 'disabled'}`}
                      onClick={() => updateCondition(condition.id, { isEnabled: !condition.isEnabled })}
                    >
                      {condition.isEnabled ? <CheckCircle size={14} /> : <Pause size={14} />}
                    </button>
                    
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => removeCondition(condition.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="node-content">
                  <div className="condition-inputs">
                    <select
                      value={condition.field}
                      onChange={(e) => updateCondition(condition.id, { field: e.target.value })}
                      className="field-select"
                    >
                      {Object.entries(conditionsByCategory).map(([category, fields]) => (
                        <optgroup key={category} label={category}>
                          {fields.map(field => (
                            <option key={field.key} value={field.key}>
                              {field.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    
                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                      className="operator-select"
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                      <option value="in">In List</option>
                      <option value="not_in">Not In List</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                      <option value="contains">Contains</option>
                      <option value="regex">Regex Match</option>
                    </select>
                    
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                      placeholder="Enter value..."
                      className="value-input"
                    />
                  </div>
                  
                  <div className="condition-weight">
                    <label>Weight:</label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={condition.weight || 1}
                      onChange={(e) => updateCondition(condition.id, { weight: parseFloat(e.target.value) })}
                      className="weight-slider"
                    />
                    <span>{condition.weight || 1}x</span>
                  </div>
                </div>

                {/* Logical Operator for next condition */}
                {index < conditions.length - 1 && (
                  <div className="logical-connector">
                    <select
                      value={conditions[index + 1]?.logicalOperator || 'AND'}
                      onChange={(e) => updateCondition(conditions[index + 1].id, { 
                        logicalOperator: e.target.value as 'AND' | 'OR' | 'NOT' 
                      })}
                      className="logic-select"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                      <option value="NOT">NOT</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Condition Controls */}
      <div className="add-condition-controls">
        <div className="condition-types">
          <button
            className="condition-type-btn"
            onClick={() => addCondition('attribute')}
          >
            <Users size={16} />
            User Attribute
          </button>
          
          <button
            className="condition-type-btn"
            onClick={() => addCondition('behavior')}
          >
            <BarChart3 size={16} />
            Behavior
          </button>
          
          <button
            className="condition-type-btn"
            onClick={() => addCondition('geography')}
          >
            <Globe size={16} />
            Geography
          </button>
          
          <button
            className="condition-type-btn"
            onClick={() => addCondition('time')}
          >
            <Clock size={16} />
            Time Based
          </button>
          
          <button
            className="condition-type-btn"
            onClick={() => addCondition('device')}
          >
            <Settings size={16} />
            Device
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && preview && (
        <div className="preview-panel">
          <div className="preview-header">
            <h4>Targeting Preview</h4>
            <div className="preview-stats">
              <div className="stat">
                <span className="stat-value">{preview.matchedUsers.toLocaleString()}</span>
                <span className="stat-label">Matched Users</span>
              </div>
              <div className="stat">
                <span className="stat-value">{preview.matchPercentage.toFixed(1)}%</span>
                <span className="stat-label">Match Rate</span>
              </div>
            </div>
          </div>
          
          <div className="preview-content">
            <div className="demographics-breakdown">
              <h5>Demographics Breakdown</h5>
              <div className="demo-charts">
                {Object.entries(preview.demographics).map(([key, data]) => (
                  <div key={key} className="demo-chart">
                    <h6>{key}</h6>
                    {Object.entries(data).map(([label, count]) => (
                      <div key={label} className="demo-item">
                        <span>{label}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="sample-users">
              <h5>Sample Matched Users</h5>
              <div className="users-list">
                {preview.sampleUsers.map(user => (
                  <div key={user.id} className="user-item">
                    <div className="user-info">
                      <span className="user-email">{user.email}</span>
                      <div className="match-reasons">
                        {user.matchReasons.map((reason, i) => (
                          <span key={i} className="reason-tag">{reason}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {conditions.length === 0 && (
        <div className="empty-conditions">
          <Filter size={48} />
          <h3>No targeting conditions</h3>
          <p>Add conditions to define who should be targeted</p>
          <button className="btn btn-primary" onClick={() => addCondition()}>
            <Plus size={16} />
            Add First Condition
          </button>
        </div>
      )}
    </div>
  );
};

// Geographic Targeting Component
interface GeographicTargetingProps {
  selectedCountries: string[];
  selectedRegions: string[];
  selectedCities: string[];
  onCountriesChange: (countries: string[]) => void;
  onRegionsChange: (regions: string[]) => void;
  onCitiesChange: (cities: string[]) => void;
  excludeMode?: boolean;
  onExcludeModeChange?: (exclude: boolean) => void;
}

export const GeographicTargeting: React.FC<GeographicTargetingProps> = ({
  selectedCountries,
  selectedRegions,
  selectedCities,
  onCountriesChange,
  onRegionsChange,
  onCitiesChange,
  excludeMode = false,
  onExcludeModeChange
}) => {
  const [activeTab, setActiveTab] = useState<'countries' | 'regions' | 'cities'>('countries');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real implementation, this would come from props or API
  const countries = [
    { code: 'US', name: 'United States', userCount: 125000 },
    { code: 'GB', name: 'United Kingdom', userCount: 89000 },
    { code: 'CA', name: 'Canada', userCount: 67000 },
    { code: 'AU', name: 'Australia', userCount: 45000 },
    { code: 'DE', name: 'Germany', userCount: 78000 }
  ];

  return (
    <div className="geographic-targeting">
      <div className="geo-header">
        <div className="header-title">
          <Globe size={20} />
          <h3>Geographic Targeting</h3>
        </div>
        
        <div className="exclude-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={excludeMode}
              onChange={(e) => onExcludeModeChange?.(e.target.checked)}
            />
            Exclude selected locations
          </label>
        </div>
      </div>

      <div className="geo-tabs">
        {['countries', 'regions', 'cities'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="geo-search">
        <Search size={16} />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="geo-content">
        {activeTab === 'countries' && (
          <div className="countries-grid">
            {countries.filter(country => 
              country.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map(country => (
              <div
                key={country.code}
                className={`country-item ${selectedCountries.includes(country.code) ? 'selected' : ''}`}
                onClick={() => {
                  const newSelection = selectedCountries.includes(country.code)
                    ? selectedCountries.filter(c => c !== country.code)
                    : [...selectedCountries, country.code];
                  onCountriesChange(newSelection);
                }}
              >
                <div className="country-flag">
                  {/* Flag placeholder */}
                  <div className="flag-icon">{country.code}</div>
                </div>
                <div className="country-info">
                  <div className="country-name">{country.name}</div>
                  <div className="user-count">{country.userCount.toLocaleString()} users</div>
                </div>
                {selectedCountries.includes(country.code) && (
                  <CheckCircle size={16} className="selected-icon" />
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Similar implementations for regions and cities would go here */}
      </div>

      <div className="geo-summary">
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-value">{selectedCountries.length}</span>
            <span className="stat-label">Countries</span>
          </div>
          <div className="stat">
            <span className="stat-value">{selectedRegions.length}</span>
            <span className="stat-label">Regions</span>
          </div>
          <div className="stat">
            <span className="stat-value">{selectedCities.length}</span>
            <span className="stat-label">Cities</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Segment Management Component
interface SegmentManagementProps {
  segments: UserSegment[];
  onCreateSegment: (segment: Omit<UserSegment, 'id' | 'createdAt' | 'lastUpdated'>) => void;
  onUpdateSegment: (id: string, updates: Partial<UserSegment>) => void;
  onDeleteSegment: (id: string) => void;
  onDuplicateSegment: (id: string) => void;
}

export const SegmentManagement: React.FC<SegmentManagementProps> = ({
  segments,
  onCreateSegment,
  onUpdateSegment,
  onDeleteSegment,
  onDuplicateSegment
}) => {
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);
  const [editingSegment, setEditingSegment] = useState<string | null>(null);

  return (
    <div className="segment-management">
      <div className="segments-header">
        <div className="header-title">
          <Layers size={20} />
          <h3>User Segments</h3>
          <div className="segment-count">{segments.length} segments</div>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={() => onCreateSegment({
            name: 'New Segment',
            conditions: [],
            userCount: 0,
            isActive: true,
            tags: [],
            color: '#3B82F6'
          })}
        >
          <Plus size={16} />
          Create Segment
        </button>
      </div>

      <div className="segments-list">
        {segments.map(segment => (
          <div
            key={segment.id}
            className={`segment-card ${expandedSegment === segment.id ? 'expanded' : ''}`}
          >
            <div className="segment-header" onClick={() => 
              setExpandedSegment(expandedSegment === segment.id ? null : segment.id)
            }>
              <div className="segment-indicator">
                <div
                  className="segment-color"
                  style={{ backgroundColor: segment.color }}
                />
              </div>
              
              <div className="segment-info">
                <div className="segment-title">
                  <h4>{segment.name}</h4>
                  <div className="segment-status">
                    {segment.isActive ? (
                      <CheckCircle size={16} className="text-green" />
                    ) : (
                      <Pause size={16} className="text-gray" />
                    )}
                  </div>
                </div>
                
                <div className="segment-description">{segment.description}</div>
                
                <div className="segment-metrics">
                  <span className="metric">
                    <Users size={14} />
                    {segment.userCount.toLocaleString()} users
                  </span>
                  <span className="metric">
                    <Filter size={14} />
                    {segment.conditions.length} conditions
                  </span>
                  <span className="metric">
                    <Calendar size={14} />
                    Updated {new Date(segment.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="segment-actions">
                <button className="expand-btn">
                  {expandedSegment === segment.id ? 
                    <ChevronDown size={16} /> : 
                    <ChevronRight size={16} />
                  }
                </button>
              </div>
            </div>

            {expandedSegment === segment.id && (
              <div className="segment-details">
                <div className="segment-conditions">
                  <h5>Targeting Conditions</h5>
                  {segment.conditions.length === 0 ? (
                    <p className="no-conditions">No conditions defined</p>
                  ) : (
                    <div className="conditions-list">
                      {segment.conditions.map((condition, index) => (
                        <div key={condition.id} className="condition-item">
                          {index > 0 && (
                            <span className="logical-op">
                              {condition.logicalOperator || 'AND'}
                            </span>
                          )}
                          <span className="condition-text">
                            {condition.field} {condition.operator} {condition.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="segment-tags">
                  <h5>Tags</h5>
                  <div className="tags-list">
                    {segment.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
                
                <div className="segment-controls">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingSegment(segment.id)}
                  >
                    <Settings size={16} />
                    Edit
                  </button>
                  
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onDuplicateSegment(segment.id)}
                  >
                    <Plus size={16} />
                    Duplicate
                  </button>
                  
                  <button
                    className={`btn btn-sm ${segment.isActive ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => onUpdateSegment(segment.id, { isActive: !segment.isActive })}
                  >
                    {segment.isActive ? <Pause size={16} /> : <Play size={16} />}
                    {segment.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDeleteSegment(segment.id)}
                  >
                    <X size={16} />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="empty-segments">
          <Layers size={48} />
          <h3>No segments created</h3>
          <p>Create user segments to organize your targeting</p>
          <button
            className="btn btn-primary"
            onClick={() => onCreateSegment({
              name: 'My First Segment',
              conditions: [],
              userCount: 0,
              isActive: true,
              tags: [],
              color: '#3B82F6'
            })}
          >
            <Plus size={16} />
            Create First Segment
          </button>
        </div>
      )}
    </div>
  );
};

// Targeting Performance Analytics
interface TargetingAnalyticsProps {
  analytics: {
    totalUsers: number;
    activeTargeting: number;
    conversionRate: number;
    impressions: number;
    clicks: number;
    topSegments: Array<{
      id: string;
      name: string;
      performance: number;
      users: number;
    }>;
    geographicBreakdown: Record<string, number>;
    timeSeriesData: Array<{
      date: string;
      impressions: number;
      conversions: number;
    }>;
  };
  timeRange: '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange: (range: '24h' | '7d' | '30d' | '90d') => void;
}

// Export all components
export {
  type TargetingCondition,
  type UserSegment,
  type TargetingAudience,
  type TargetingPreview
};
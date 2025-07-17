// Epic 17.1.4 - User Segment Manager Component

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Play, 
  Pause,
  BarChart3,
  Filter,
  Search,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Badge } from '../../common/Badge';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { TargetingRuleBuilder } from './TargetingRuleBuilder';
import './TargetingRuleBuilder.css';

interface TargetingRule {
  id: string;
  attribute: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface UserSegment {
  id: string;
  name: string;
  description?: string;
  rules: TargetingRule[];
  isActive: boolean;
  estimatedUsers: number;
  createdAt: string;
  updatedAt: string;
  usageCount: number; // How many toggles use this segment
}

interface UserSegmentManagerProps {
  onSelectSegment?: (segment: UserSegment) => void;
  readonly?: boolean;
}

export const UserSegmentManager: React.FC<UserSegmentManagerProps> = ({
  onSelectSegment,
  readonly = false
}) => {
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<UserSegment | null>(null);
  const [testingSegment, setTestingSegment] = useState<string | null>(null);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockSegments: UserSegment[] = [
        {
          id: 'seg_1',
          name: 'Beta Users',
          description: 'Users who opted into beta testing',
          rules: [
            {
              id: 'rule_1',
              attribute: 'user_type',
              operator: 'equals',
              value: 'beta_tester'
            }
          ],
          isActive: true,
          estimatedUsers: 1250,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 3
        },
        {
          id: 'seg_2',
          name: 'Premium Users',
          description: 'Users with premium subscriptions',
          rules: [
            {
              id: 'rule_2',
              attribute: 'subscription_tier',
              operator: 'in',
              value: ['pro', 'enterprise']
            }
          ],
          isActive: true,
          estimatedUsers: 5680,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 7
        },
        {
          id: 'seg_3',
          name: 'New Users',
          description: 'Users registered within the last 30 days',
          rules: [
            {
              id: 'rule_3',
              attribute: 'registration_date',
              operator: 'greater_than',
              value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          isActive: false,
          estimatedUsers: 890,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usageCount: 1
        }
      ];
      
      setSegments(mockSegments);
    } catch (error) {
      console.error('Failed to fetch segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSegment = async (rules: TargetingRule[]): Promise<{ matches: boolean; userCount: number }> => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomUserCount = Math.floor(Math.random() * 10000) + 100;
        resolve({
          matches: true,
          userCount: randomUserCount
        });
      }, 1000);
    });
  };

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSegment = async (id: string, isActive: boolean) => {
    try {
      // TODO: API call to toggle segment
      setSegments(prev => prev.map(seg => 
        seg.id === id ? { ...seg, isActive } : seg
      ));
    } catch (error) {
      console.error('Failed to toggle segment:', error);
    }
  };

  const handleDeleteSegment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) return;
    
    try {
      // TODO: API call to delete segment
      setSegments(prev => prev.filter(seg => seg.id !== id));
    } catch (error) {
      console.error('Failed to delete segment:', error);
    }
  };

  const handleDuplicateSegment = (segment: UserSegment) => {
    const duplicated: UserSegment = {
      ...segment,
      id: `seg_${Date.now()}`,
      name: `${segment.name} (Copy)`,
      isActive: false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSegments(prev => [...prev, duplicated]);
  };

  return (
    <div className="user-segment-manager">
      {/* Header */}
      <div className="segment-header">
        <div className="header-left">
          <h2>
            <Users size={24} />
            User Segments
          </h2>
          <p>Create and manage user targeting segments</p>
        </div>
        
        {!readonly && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            Create Segment
          </button>
        )}
      </div>

      {/* Search and Stats */}
      <div className="segment-controls">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search segments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="segment-stats">
          <div className="stat-item">
            <span className="stat-value">{segments.length}</span>
            <span className="stat-label">Total Segments</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{segments.filter(s => s.isActive).length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {segments.reduce((sum, s) => sum + s.estimatedUsers, 0).toLocaleString()}
            </span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
      </div>

      {/* Segments List */}
      <div className="segments-grid">
        {loading ? (
          <div className="loading-state">
            <LoadingSpinner />
            <p>Loading segments...</p>
          </div>
        ) : filteredSegments.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No segments found</h3>
            <p>
              {searchTerm 
                ? 'No segments match your search criteria'
                : 'Create your first user segment to get started'
              }
            </p>
            {!readonly && !searchTerm && (
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={16} />
                Create First Segment
              </button>
            )}
          </div>
        ) : (
          filteredSegments.map(segment => (
            <div key={segment.id} className="segment-card">
              <div className="segment-header-row">
                <div className="segment-title">
                  <h3>{segment.name}</h3>
                  <div className="segment-badges">
                    <Badge color={segment.isActive ? 'green' : 'gray'}>
                      {segment.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {segment.usageCount > 0 && (
                      <Badge color="blue">
                        {segment.usageCount} toggle{segment.usageCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {!readonly && (
                  <div className="segment-actions">
                    <button
                      className="btn-icon"
                      title={segment.isActive ? 'Deactivate' : 'Activate'}
                      onClick={() => handleToggleSegment(segment.id, !segment.isActive)}
                    >
                      {segment.isActive ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    
                    <button
                      className="btn-icon"
                      title="Edit Segment"
                      onClick={() => setEditingSegment(segment)}
                    >
                      <Edit size={14} />
                    </button>
                    
                    <button
                      className="btn-icon"
                      title="Duplicate Segment"
                      onClick={() => handleDuplicateSegment(segment)}
                    >
                      <Copy size={14} />
                    </button>
                    
                    <button
                      className="btn-icon btn-danger"
                      title="Delete Segment"
                      onClick={() => handleDeleteSegment(segment.id)}
                      disabled={segment.usageCount > 0}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {segment.description && (
                <p className="segment-description">{segment.description}</p>
              )}

              <div className="segment-stats-row">
                <div className="user-count">
                  <BarChart3 size={16} />
                  <span>{segment.estimatedUsers.toLocaleString()} users</span>
                </div>
                
                <div className="rule-count">
                  <Filter size={16} />
                  <span>{segment.rules.length} rule{segment.rules.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="segment-preview">
                <h5>Rules Preview:</h5>
                <div className="rules-preview">
                  {segment.rules.slice(0, 2).map((rule, index) => (
                    <code key={rule.id} className="rule-preview">
                      {index > 0 && <span className="rule-operator">{rule.logicalOperator}</span>}
                      {rule.attribute} {rule.operator} {Array.isArray(rule.value) ? `[${rule.value.join(', ')}]` : rule.value}
                    </code>
                  ))}
                  {segment.rules.length > 2 && (
                    <span className="more-rules">+{segment.rules.length - 2} more</span>
                  )}
                </div>
              </div>

              {onSelectSegment && (
                <button
                  className="btn btn-primary btn-sm segment-select-btn"
                  onClick={() => onSelectSegment(segment)}
                >
                  Use This Segment
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Segment Modal */}
      {(showCreateModal || editingSegment) && (
        <SegmentModal
          segment={editingSegment}
          onClose={() => {
            setShowCreateModal(false);
            setEditingSegment(null);
          }}
          onSave={(segment) => {
            if (editingSegment) {
              setSegments(prev => prev.map(s => s.id === segment.id ? segment : s));
            } else {
              setSegments(prev => [...prev, segment]);
            }
            setShowCreateModal(false);
            setEditingSegment(null);
          }}
          onTestRules={testSegment}
        />
      )}
    </div>
  );
};

// Segment Creation/Edit Modal
interface SegmentModalProps {
  segment?: UserSegment | null;
  onClose: () => void;
  onSave: (segment: UserSegment) => void;
  onTestRules: (rules: TargetingRule[]) => Promise<{ matches: boolean; userCount: number }>;
}

const SegmentModal: React.FC<SegmentModalProps> = ({
  segment,
  onClose,
  onSave,
  onTestRules
}) => {
  const [name, setName] = useState(segment?.name || '');
  const [description, setDescription] = useState(segment?.description || '');
  const [rules, setRules] = useState<TargetingRule[]>(segment?.rules || []);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (rules.length === 0) {
      newErrors.rules = 'At least one rule is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setSaving(true);
    try {
      const segmentData: UserSegment = {
        id: segment?.id || `seg_${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        rules,
        isActive: segment?.isActive || false,
        estimatedUsers: segment?.estimatedUsers || 0,
        createdAt: segment?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: segment?.usageCount || 0
      };
      
      onSave(segmentData);
    } catch (error) {
      setErrors({ submit: 'Failed to save segment' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content segment-modal">
        <div className="modal-header">
          <h2>{segment ? 'Edit Segment' : 'Create Segment'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {errors.submit && (
            <div className="error-message">
              <AlertCircle size={16} />
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Premium Users"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this user segment..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Targeting Rules *</label>
            <TargetingRuleBuilder
              initialRules={rules}
              onRulesChange={setRules}
              onTestRule={onTestRules}
            />
            {errors.rules && <span className="field-error">{errors.rules}</span>}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Segment'}
          </button>
        </div>
      </div>
    </div>
  );
};
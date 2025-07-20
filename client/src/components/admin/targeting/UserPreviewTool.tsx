// Epic 17.1.4 - User Preview Tool Component

import React, { useState } from 'react';
import { 
  User, 
  Search, 
  Eye, 
  Shield, 
  Clock, 
  MapPin, 
  Mail,
  Zap,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { Badge } from '../../common/Badge';
import { LoadingSpinner } from '../../common/LoadingSpinner';

interface UserPreview {
  id: string;
  email: string;
  name?: string;
  userType: 'admin' | 'user' | 'beta_tester' | 'premium';
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  country: string;
  language: string;
  registrationDate: string;
  lastLogin: string;
  loginCount: number;
  featureUsage: number;
  experimentGroup?: string;
  customAttributes: Record<string, any>;
  orgId?: string;
}

interface TogglePreview {
  key: string;
  name: string;
  enabled: boolean;
  value: any;
  reason: string;
  segmentMatched?: string;
}

interface UserPreviewToolProps {
  isOpen: boolean;
  onClose: () => void;
  toggleId?: string;
  rules?: Array<{
    attribute: string;
    operator: string;
    value: any;
    logicalOperator?: 'AND' | 'OR';
  }>;
}

export const UserPreviewTool: React.FC<UserPreviewToolProps> = ({
  isOpen,
  onClose,
  toggleId,
  rules = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserPreview | null>(null);
  const [userToggles, setUserToggles] = useState<TogglePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  if (!isOpen) return null;

  const searchUsers = async (query: string) => {
    if (!query.trim()) return;

    setSearching(true);
    try {
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockUser: UserPreview = {
        id: 'user_123',
        email: query.includes('@') ? query : `${query}@example.com`,
        name: 'John Doe',
        userType: 'beta_tester',
        subscriptionTier: 'pro',
        country: 'US',
        language: 'en',
        registrationDate: '2024-01-15T10:30:00Z',
        lastLogin: '2024-07-16T15:45:00Z',
        loginCount: 142,
        featureUsage: 89,
        experimentGroup: 'variant_a',
        customAttributes: {
          department: 'engineering',
          seniority: 'senior',
          team_size: 8
        },
        orgId: 'org_456'
      };
      
      setSelectedUser(mockUser);
      await evaluateUserToggles(mockUser);
    } catch (error) {
      console.error('Failed to search user:', error);
    } finally {
      setSearching(false);
    }
  };

  const evaluateUserToggles = async (user: UserPreview) => {
    setEvaluating(true);
    try {
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockToggles: TogglePreview[] = [
        {
          key: 'new_ui_design',
          name: 'New UI Design',
          enabled: true,
          value: true,
          reason: 'User is in beta_tester segment',
          segmentMatched: 'Beta Users'
        },
        {
          key: 'advanced_features',
          name: 'Advanced Features',
          enabled: true,
          value: true,
          reason: 'User has pro subscription',
          segmentMatched: 'Premium Users'
        },
        {
          key: 'experimental_ai',
          name: 'Experimental AI Features',
          enabled: false,
          value: false,
          reason: 'Feature disabled for user type'
        },
        {
          key: 'claude_model_v2',
          name: 'Claude Model V2',
          enabled: true,
          value: 'sonnet-4',
          reason: 'Percentage rollout (user in 25%)'
        }
      ];
      
      setUserToggles(mockToggles);
    } catch (error) {
      console.error('Failed to evaluate toggles:', error);
    } finally {
      setEvaluating(false);
    }
  };

  const refreshUserData = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await evaluateUserToggles(selectedUser);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAttributeValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getUserTypeColor = (userType: string): string => {
    switch (userType) {
    case 'admin': return 'red';
    case 'beta_tester': return 'purple';
    case 'premium': return 'gold';
    default: return 'blue';
    }
  };

  const getSubscriptionColor = (tier: string): string => {
    switch (tier) {
    case 'enterprise': return 'purple';
    case 'pro': return 'blue';
    default: return 'gray';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content user-preview-modal">
        <div className="modal-header">
          <h2>
            <Eye size={20} />
            User Feature Preview
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* User Search */}
          <div className="user-search-section">
            <h3>Search User</h3>
            <div className="search-form">
              <div className="search-input-group">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Enter user ID or email address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers(searchQuery)}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={() => searchUsers(searchQuery)}
                disabled={searching || !searchQuery.trim()}
              >
                {searching ? <LoadingSpinner size={16} /> : <Search size={16} />}
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* User Details */}
          {selectedUser && (
            <div className="user-details-section">
              <div className="section-header">
                <h3>
                  <User size={18} />
                  User Details
                </h3>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={refreshUserData}
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size={14} /> : <RefreshCw size={14} />}
                  Refresh
                </button>
              </div>

              <div className="user-info-grid">
                <div className="user-basic-info">
                  <div className="user-avatar">
                    <User size={24} />
                  </div>
                  <div className="user-identity">
                    <h4>{selectedUser.name || 'Unknown User'}</h4>
                    <p>{selectedUser.email}</p>
                    <div className="user-badges">
                      <Badge color={getUserTypeColor(selectedUser.userType)}>
                        {selectedUser.userType.replace('_', ' ')}
                      </Badge>
                      <Badge color={getSubscriptionColor(selectedUser.subscriptionTier)}>
                        {selectedUser.subscriptionTier}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="user-attributes">
                  <div className="attribute-group">
                    <h5>Account Information</h5>
                    <div className="attribute-list">
                      <div className="attribute-item">
                        <Mail size={14} />
                        <span className="label">Email:</span>
                        <span className="value">{selectedUser.email}</span>
                      </div>
                      <div className="attribute-item">
                        <Shield size={14} />
                        <span className="label">User Type:</span>
                        <span className="value">{selectedUser.userType}</span>
                      </div>
                      <div className="attribute-item">
                        <Zap size={14} />
                        <span className="label">Subscription:</span>
                        <span className="value">{selectedUser.subscriptionTier}</span>
                      </div>
                    </div>
                  </div>

                  <div className="attribute-group">
                    <h5>Location & Language</h5>
                    <div className="attribute-list">
                      <div className="attribute-item">
                        <MapPin size={14} />
                        <span className="label">Country:</span>
                        <span className="value">{selectedUser.country}</span>
                      </div>
                      <div className="attribute-item">
                        <span className="label">Language:</span>
                        <span className="value">{selectedUser.language}</span>
                      </div>
                    </div>
                  </div>

                  <div className="attribute-group">
                    <h5>Activity</h5>
                    <div className="attribute-list">
                      <div className="attribute-item">
                        <Clock size={14} />
                        <span className="label">Registered:</span>
                        <span className="value">
                          {new Date(selectedUser.registrationDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="attribute-item">
                        <Clock size={14} />
                        <span className="label">Last Login:</span>
                        <span className="value">
                          {new Date(selectedUser.lastLogin).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="attribute-item">
                        <span className="label">Login Count:</span>
                        <span className="value">{selectedUser.loginCount}</span>
                      </div>
                      <div className="attribute-item">
                        <span className="label">Feature Usage:</span>
                        <span className="value">{selectedUser.featureUsage}</span>
                      </div>
                    </div>
                  </div>

                  {Object.keys(selectedUser.customAttributes).length > 0 && (
                    <div className="attribute-group">
                      <h5>Custom Attributes</h5>
                      <div className="attribute-list">
                        {Object.entries(selectedUser.customAttributes).map(([key, value]) => (
                          <div key={key} className="attribute-item">
                            <span className="label">{key}:</span>
                            <span className="value">{formatAttributeValue(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Feature Toggle Evaluation */}
          {selectedUser && (
            <div className="toggle-evaluation-section">
              <div className="section-header">
                <h3>
                  <Shield size={18} />
                  Feature Toggle Evaluation
                </h3>
                {evaluating && <LoadingSpinner size={16} />}
              </div>

              {toggleId && rules.length > 0 && (
                <div className="current-toggle-eval">
                  <h4>Current Toggle Rules</h4>
                  <div className="rules-preview">
                    {rules.map((rule, index) => (
                      <div key={index} className="rule-item">
                        {index > 0 && (
                          <span className="rule-operator">{rule.logicalOperator}</span>
                        )}
                        <code>
                          {rule.attribute} {rule.operator} {formatAttributeValue(rule.value)}
                        </code>
                      </div>
                    ))}
                  </div>
                  
                  {/* TODO: Evaluate current rules against user */}
                  <div className="evaluation-result">
                    <CheckCircle size={16} />
                    <span>Rules would match this user</span>
                  </div>
                </div>
              )}

              <div className="toggles-list">
                {userToggles.map(toggle => (
                  <div key={toggle.key} className="toggle-result">
                    <div className="toggle-header">
                      <div className="toggle-info">
                        <h5>{toggle.name}</h5>
                        <code className="toggle-key">{toggle.key}</code>
                      </div>
                      <div className="toggle-status">
                        <Badge color={toggle.enabled ? 'green' : 'gray'}>
                          {toggle.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="toggle-details">
                      <div className="toggle-value">
                        <span className="label">Value:</span>
                        <code>{formatAttributeValue(toggle.value)}</code>
                      </div>
                      
                      <div className="toggle-reason">
                        <span className="label">Reason:</span>
                        <span>{toggle.reason}</span>
                      </div>
                      
                      {toggle.segmentMatched && (
                        <div className="toggle-segment">
                          <span className="label">Segment:</span>
                          <Badge color="blue">{toggle.segmentMatched}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!selectedUser && (
            <div className="empty-state">
              <User size={48} />
              <h3>Search for a User</h3>
              <p>Enter a user ID or email address to preview their feature toggle experience</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
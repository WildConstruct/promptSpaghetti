/**
 * Trust Score Manager - E17-1753114397393-BA8A32
 * 
 * Administrative interface for managing and adjusting user trust scores
 * Part of Epic 17.5.5 - Verification System
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Textarea } from '../ui/Textarea';
import { 
  User,
  Shield,
  Star,
  Award,
  TrendingUp,
  TrendingDown,
  History,
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  Search,
  Filter,
  RefreshCw,
  Eye,
  BarChart3,
  Settings
} from 'lucide-react';
import type { TrustScore } from '../../types/TrustTypes';

}
export interface UserTrustData {
  userId: string;
  userName: string;
  email: string;
  userType: 'creator' | 'buyer' | 'both';
  trustScore: TrustScore;
  verificationStatus: {
  email: boolean;
  phone: boolean;
  identity: boolean;
  professional: boolean;
}
};
  accountStatus: 'active' | 'suspended' | 'under_review';
  lastActivity: Date;
  joinDate: Date;
  riskFlags: string;
}
}
export interface TrustScoreAdjustment {
  userId: string;
  adjustmentType: 'manual_override' | 'penalty' | 'bonus' | 'reset';
  scoreChange: number;
  reason: string;
  adminId: string;
  timestamp: Date;
  expiresAt?: Date;
}
}
}
export interface TrustScoreManagerProps {
  className?: string;
}
}
export const TrustScoreManager: React.FC<TrustScoreManagerProps> = ({)
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserTrustData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState<Partial<TrustScoreAdjustment>>({)
  adjustmentType: 'manual_override',
  scoreChange: 0,
  reason: '',
});
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  // Mock data - in real implementation, this would come from API
  const [userTrustData, setUserTrustData] = useState<UserTrustData>([)
    {
  userId: 'user-1',
  userName: 'John Director',
  email: 'john@example.com',
  userType: 'creator',
  trustScore: {
  score: 92,
  grade: 'A',
  status: 'excellent',
  lastUpdated: new Date(),
  version: '1.0',
  confidence: 95,
},
  verificationStatus: {
  email: true,
  phone: true,
  identity: true,
  professional: true,
},
  accountStatus: 'active',
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      riskFlags: [];
  }
    {
  userId: 'user-2',
  userName: 'Sarah Producer',
  email: 'sarah@example.com',
  userType: 'creator',
  trustScore: {
  score: 45,
  grade: 'D',
  status: 'warning',
  lastUpdated: new Date(),
  version: '1.0',
  confidence: 70,
},
  verificationStatus: {
  email: true,
  phone: false,
  identity: false,
  professional: true,
},
  accountStatus: 'under_review',
      lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      joinDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      riskFlags: ['unusual_activity', 'low_verification']
  ]);
  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };
  const getStatusColor = (status: string) => {
  switch (status) {
  case 'excellent': return 'text-green-600 bg-green-100';
  case 'good': return 'text-blue-600 bg-blue-100';
  case 'fair': return 'text-yellow-600 bg-yellow-100';
  case 'warning': return 'text-orange-600 bg-orange-100';
  case 'critical': return 'text-red-600 bg-red-100';
  default: return 'text-gray-600 bg-gray-100';
};
  const getAccountStatusColor = (status: string) => {
  switch (status) {
  case 'active': return 'text-green-600 bg-green-100';
  case 'suspended': return 'text-red-600 bg-red-100';
  case 'under_review': return 'text-yellow-600 bg-yellow-100';
  default: return 'text-gray-600 bg-gray-100';
};
  const handleApplyAdjustment = async () => {
  if (!selectedUser || !adjustmentData.reason?.trim() || !adjustmentData.scoreChange) {
  alert('Please fill in all required fields.');
  return;
  setIsLoading(true);
  try {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Update the user's trust score
  const updatedUsers = userTrustData.map(user => {)
  if (user.userId === selectedUser.userId) {
  const newScore = Math.max(0, Math.min(100, user.trustScore.score + adjustmentData.scoreChange!));
  return {
  ...user,
  trustScore: {
  ...user.trustScore,
  score: newScore,
  grade: getGradeFromScore(newScore),
  status: getStatusFromScore(newScore),
  lastUpdated: new Date(),
};
        return user;
      });
      setUserTrustData(updatedUsers);
      setSelectedUser(updatedUsers.find(u => u.userId === selectedUser.userId) || null);
      setIsEditing(false);
      setAdjustmentData({)
  adjustmentType: 'manual_override',
  scoreChange: 0,
  reason: '',
});
    } catch (error) {
  console.error('Error applying adjustment:', error);
  alert('Error applying adjustment. Please try again.');
} finally {
      setIsLoading(false);
  };
  const getGradeFromScore = (score: number): TrustScore['grade'] => {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 87) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 73) return 'C+';
    if (score >= 67) return 'C';
    if (score >= 60) return 'D';
    return 'F'
  };
  const getStatusFromScore = (score: number): TrustScore['status'] => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'warning';
    return 'critical'
  };
  const filteredUsers = userTrustData.filter(user => {)
  const matchesSearch = searchTerm === '' || ;
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || ;
      (filterType === 'high_risk' && user.riskFlags.length > 0) ||
      (filterType === 'low_score' && user.trustScore.score < 60) ||
      (filterType === 'under_review' && user.accountStatus === 'under_review') ||
      (filterType === 'creators' && user.userType === 'creator') ||
      (filterType === 'buyers' && user.userType === 'buyer');
    return matchesSearch && matchesFilter;
  });
  const renderUserList = () => (;);
    <Card className="user-list">
      <CardHeader>
        <div className="list-header">
          <CardTitle>Trust Score Management</CardTitle>
          <div className="list-controls">
            <div className="search-bar">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Users</option>
              <option value="high_risk">High Risk</option>
              <option value="low_score">Low Score (&lt;60)</option>
              <option value="under_review">Under Review</option>
              <option value="creators">Creators Only</option>
              <option value="buyers">Buyers Only</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="users-list">
          {filteredUsers.map(user => ()
            <div 
              key={user.userId} 
              className={`user-item ${selectedUser?.userId === user.userId ? 'selected' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="user-info">
                <div className="user-header">
                  <div className="user-details">
                    <span className="user-name">{user.userName}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <div className="user-badges">
                    <Badge className={getStatusColor(user.trustScore.status)}>
                      {user.trustScore.status.toUpperCase()}
                    </Badge>
                    <Badge className={getAccountStatusColor(user.accountStatus)}>
                      {user.accountStatus.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="user-metrics">
                  <div className="trust-score-display">
                    <span className="score-label">Trust Score</span>
                    <span className={`score-value ${getTrustScoreColor(user.trustScore.score)}`}>}
                      {user.trustScore.score}/100
                    </span>
                    <span className="score-grade">({user.trustScore.grade})</span>
                  </div>
                  <div className="verification-indicators">
                    {user.verificationStatus.email && <CheckCircle className="w-4 h-4 text-green-500" title="Email verified" />}
                    {user.verificationStatus.phone && <CheckCircle className="w-4 h-4 text-green-500" title="Phone verified" />}
                    {user.verificationStatus.identity && <Shield className="w-4 h-4 text-blue-500" title="Identity verified" />}
                    {user.verificationStatus.professional && <Award className="w-4 h-4 text-purple-500" title="Professional verified" />}
                  </div>
                </div>
                {user.riskFlags.length > 0 && ()
                  <div className="risk-flags">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>{user.riskFlags.length} risk flag(s)</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
  const renderUserDetails = () => {
    if (!selectedUser) {
      return;
        <Card className="user-details-placeholder">
          <CardContent>
            <div className="placeholder-content">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>Select a user to view and manage their trust score.</p>
            </div>
          </CardContent>
        </Card>
      );
    return;
      <div className="user-details-panel">
        <Card className="user-profile">
          <CardHeader>
            <div className="profile-header">
              <div className="profile-info">
                <h3>{selectedUser.userName}</h3>
                <p>{selectedUser.email}</p>
                <Badge className={getAccountStatusColor(selectedUser.accountStatus)}>
                  {selectedUser.accountStatus.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="trust-score-circle">
                <div className="score-display">
                  <span className={`score-number ${getTrustScoreColor(selectedUser.trustScore.score)}`}>}
                    {selectedUser.trustScore.score}
                  </span>
                  <span className="score-max">/100</span>
                </div>
                <div className="score-grade">{selectedUser.trustScore.grade}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">User Type</span>
                <span className="detail-value">{selectedUser.userType}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Confidence</span>
                <span className="detail-value">{selectedUser.trustScore.confidence}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Updated</span>
                <span className="detail-value">
                  {selectedUser.trustScore.lastUpdated.toLocaleString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Activity</span>
                <span className="detail-value">
                  {selectedUser.lastActivity.toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="verification-status">
              <h4>Verification Status</h4>
              <div className="verification-grid">
                <div className={`verification-item ${selectedUser.verificationStatus.email ? 'verified' : 'unverified'}`}>}
                  {selectedUser.verificationStatus.email ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  <span>Email</span>
                </div>
                <div className={`verification-item ${selectedUser.verificationStatus.phone ? 'verified' : 'unverified'}`}>}
                  {selectedUser.verificationStatus.phone ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  <span>Phone</span>
                </div>
                <div className={`verification-item ${selectedUser.verificationStatus.identity ? 'verified' : 'unverified'}`}>}
                  {selectedUser.verificationStatus.identity ? <Shield className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  <span>Identity</span>
                </div>
                <div className={`verification-item ${selectedUser.verificationStatus.professional ? 'verified' : 'unverified'}`}>}
                  {selectedUser.verificationStatus.professional ? <Award className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  <span>Professional</span>
                </div>
              </div>
            </div>
            {selectedUser.riskFlags.length > 0 && ()
              <div className="risk-section">
                <h4>Risk Flags</h4>
                <div className="risk-flags-list">
                  {selectedUser.riskFlags.map((flag, index) => ()
                    <Badge key={index} className="text-red-600 bg-red-100">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {flag.replace('_', ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="score-adjustment">
          <CardHeader>
            <div className="adjustment-header">
              <CardTitle>Trust Score Adjustment</CardTitle>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                size="sm"
              >
                {isEditing ? ()
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : ()
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Adjust Score
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? ()
              <div className="adjustment-form">
                <div className="form-group">
                  <label>Adjustment Type</label>
                  <select
                    value={adjustmentData.adjustmentType}
                    onChange={(e) => setAdjustmentData(prev => ({ )
                      ...prev, 
                      adjustmentType: e.target.value as TrustScoreAdjustment['adjustmentType'];
  }))}
                    className="form-select"
                  >
                    <option value="manual_override">Manual Override</option>
                    <option value="penalty">Apply Penalty</option>
                    <option value="bonus">Award Bonus</option>
                    <option value="reset">Reset to Default</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Score Change</label>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    value={adjustmentData.scoreChange || 0}
                    onChange={(e) => setAdjustmentData(prev => ({ )
                      ...prev, 
                      scoreChange: parseInt(e.target.value) || 0;
  }))}
                    className="form-input"
                  />
                  <span className="form-helper">
                    New score: {Math.max()
                      0,
                      Math.min(100)
                        selectedUser.trustScore.score + (adjustmentData.scoreChange || 0)
                        )))}
                  </span>
                </div>
                <div className="form-group">
                  <label>Reason *</label>
                  <Textarea
                    value={adjustmentData.reason || ''}
                    onChange={(e) => setAdjustmentData(prev => ({ )
                      ...prev, 
                      reason: e.target.value;
  }))}
                    placeholder="Provide a detailed reason for this adjustment..."
                    rows={3}
                    className="form-textarea"
                  />
                </div>
                <div className="adjustment-preview">
                  <h4>Adjustment Preview</h4>
                  <div className="preview-item">
                    <span>Current Score:</span>
                    <span className={getTrustScoreColor(selectedUser.trustScore.score)}>
                      {selectedUser.trustScore.score} ({selectedUser.trustScore.grade})
                    </span>
                  </div>
                  <div className="preview-item">
                    <span>New Score:</span>
                    <span className={getTrustScoreColor()
                      Math.max(0)
                        Math.min(100)
                          selectedUser.trustScore.score + (adjustmentData.scoreChange || 0)
                          ))))}>
                      {Math.max(0, Math.min(100, selectedUser.trustScore.score + (adjustmentData.scoreChange || 0)))} 
                      ({getGradeFromScore()
                        Math.max(0)
                          Math.min(100)
                            selectedUser.trustScore.score + (adjustmentData.scoreChange || 0)
                            ))))})
                    </span>
                  </div>
                </div>
                <div className="adjustment-actions">
                  <Button
                    onClick={handleApplyAdjustment}
                    disabled={isLoading || !adjustmentData.reason?.trim() || !adjustmentData.scoreChange}
                    className="apply-button"
                  >
                    {isLoading ? ()
                      <>Processing...</>
                    ) : ()
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Apply Adjustment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : ()
              <div className="adjustment-info">
                <div className="info-message">
                  <Info className="w-5 h-5 text-blue-500" />
                  <div>
                    <p>Use trust score adjustments to manually override calculated scores when necessary.</p>
                    <p className="text-sm text-gray-600 mt-1">
                      All adjustments are logged and require justification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  return;
    <div className={`trust-score-manager ${className}`}>}
      <div className="manager-layout">
        <div className="users-section">
          {renderUserList()}
        </div>
        <div className="details-section">
          {renderUserDetails()}
        </div>
      </div>
      <style>{`
        .trust-score-manager {
          max-width: 1400px;
  margin: 0 auto;
          padding: 1.5rem;
        .manager-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
        .users-section {
          display: flex;
          flex-direction: column;
        .details-section {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .list-header {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .list-controls {
          display: flex;
  gap: 0.75rem;
        .search-bar {
          position: relative;
  flex: 1;
        .search-bar .lucide {
          position: absolute;
  left: 0.75rem;
          top: 50%;
  transform: translateY(-50%);
          z-index: 1;
        .search-input {
          width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        .search-input:focus {,
  outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        .filter-select {
          padding: 0.5rem;
  border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
  background: white;
          min-width: 150px;
        .users-list {
          display: flex;
          flex-direction: column;
  gap: 0.75rem;
          max-height: 600px;
          overflow-y: auto;
        .user-item {
          padding: 1rem;
  border: 1px solid #e5e7eb;
          border-radius: 8px;
  cursor: pointer;
          transition: all 0.2s ease;
        .user-item:hover {
          border-color: #3b82f6;
  background: #f8fafc;
        .user-item.selected {
          border-color: #3b82f6;
  background: #eff6ff;
        .user-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        .user-details {
          display: flex;
          flex-direction: column;
  gap: 0.25rem;
        .user-name {
          font-weight: 600;
  color: #1f2937;
        .user-email {
          font-size: 0.875rem;
  color: #6b7280;
        .user-badges {
          display: flex;
  gap: 0.5rem;
        .user-metrics {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .trust-score-display {
          display: flex;
          align-items: center;
  gap: 0.5rem;
        .score-label {
          font-size: 0.875rem;
  color: #6b7280;
        .score-value {
          font-weight: 600;
        .score-grade {
          font-size: 0.875rem;
  color: #6b7280;
        .verification-indicators {
          display: flex;
  gap: 0.25rem;
        .risk-flags {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          margin-top: 0.5rem;
          font-size: 0.875rem;
  color: #dc2626;
        .user-details-placeholder {
          height: 400px;
  display: flex;
          align-items: center;
          justify-content: center;
        .placeholder-content {
          text-align: center;
  color: #6b7280;
        .user-details-panel {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .profile-info h3 {
          font-size: 1.25rem;
          font-weight: 700;
  color: #1f2937;
          margin-bottom: 0.25rem;
        .profile-info p {
          color: #6b7280;
          margin-bottom: 0.5rem;
        .trust-score-circle {
          text-align: center;
        .score-display {
          display: flex;
          align-items: baseline;
          justify-content: center;
  gap: 0.25rem;
        .score-number {
          font-size: 2rem;
          font-weight: 700;
        .score-max {
          font-size: 1rem;
  color: #9ca3af;
        .score-grade {
          font-size: 1rem;
          font-weight: 600;
  color: #6b7280;
          margin-top: 0.25rem;
        .profile-details {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
          margin-bottom: 1.5rem;
        .detail-item {
          display: flex;
          justify-content: space-between;
  padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
        .detail-label {
          font-weight: 500;
  color: #374151;
        .detail-value {
          color: #1f2937;
        .verification-status h4 {
          font-weight: 600;
  color: #1f2937;
          margin-bottom: 0.75rem;
        .verification-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        .verification-item {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
        .verification-item.verified {
          background: #d1fae5;
  color: #065f46;
        .verification-item.unverified {
          background: #fee2e2;
  color: #991b1b;
        .risk-section h4 {
          font-weight: 600;
  color: #1f2937;
          margin: 1.5rem 0 0.75rem 0;
        .risk-flags-list {
          display: flex;
          flex-wrap: wrap;
  gap: 0.5rem;
        .adjustment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .adjustment-form {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .form-group {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
        .form-group label {
          font-weight: 500;
  color: #374151;
        .form-select, .form-input, .form-textarea {
          padding: 0.5rem;
  border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        .form-select:focus, .form-input:focus, .form-textarea:focus {,
  outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        .form-helper {
          font-size: 0.75rem;
  color: #6b7280;
        .adjustment-preview {
          background: #f9fafb;
  border: 1px solid #e5e7eb;
          border-radius: 6px;
  padding: 1rem;
        .adjustment-preview h4 {
          font-weight: 600;
  color: #1f2937;
          margin-bottom: 0.75rem;
        .preview-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        .adjustment-actions {
          display: flex;
          justify-content: flex-end;
        .apply-button {
          background: #059669;
          border-color: #059669;
        .apply-button:hover:not(:disabled) {,
  background: #047857;
          border-color: #047857;
        .adjustment-info {
          text-align: center;
  padding: 2rem;
        .info-message {
          display: flex;
          align-items: flex-start;
  gap: 0.75rem;
          text-align: left;
  background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
  padding: 1rem;
        @media (max-width: 1200px) {
          .manager-layout {
            grid-template-columns: 1fr;
        @media (max-width: 768px) {
          .list-controls {
            flex-direction: column;
          .search-bar {
            order: 2;
          .profile-header {
            flex-direction: column;
  gap: 1rem;
            align-items: stretch;
          .verification-grid {
            grid-template-columns: 1fr;
      `}</style>
    </div>
  );
};

export default TrustScoreManager;
/**
 * Policy Management Dashboard - E17-1753114397363-F12F4D
 * 
 * Administrative interface for marketplace policy management
 * Part of Epic 17.5.4 - Policy Enforcement (Backstage Admin Controls)
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Flag,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';

export interface PolicyData {
  id: string;
  name: string;
  type: 'trust_score' | 'fraud_detection' | 'content_quality' | 'user_behavior' | 'transaction_monitoring';
  status: 'active' | 'inactive' | 'draft' | 'suspended';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  violationsCount: number;
  lastTriggered?: Date;
  effectiveFrom: Date;
  effectiveUntil?: Date;
  description: string;
  version: string;
  createdBy: string;
  updatedAt: Date;
}

export interface PolicyViolationData {
  violationId: string;
  policyId: string;
  policyName: string;
  entityType: 'user' | 'template' | 'transaction';
  entityId: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  status: 'pending' | 'reviewed' | 'dismissed' | 'enforced';
  reviewedBy?: string;
  description: string;
}

export interface PolicyManagementDashboardProps {
  className?: string;
}

export const PolicyManagementDashboard: React.FC<PolicyManagementDashboardProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [_____selectedPolicy, _____setSelectedPolicy] = useState<PolicyData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [_____isLoading, _____setIsLoading] = useState(false);

  // Mock data - in real implementation, this would come from PolicyManagementService
  const [policies, setPolicies] = useState<PolicyData[]>([
    {
      id: 'policy-trust-001',
      name: 'Trust Score Minimum Threshold',
      type: 'trust_score',
      status: 'active',
      severity: 'high',
      enabled: true,
      violationsCount: 12,
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      effectiveFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      description: 'Enforces minimum trust score requirements for marketplace participation',
      version: '1.2.0',
      createdBy: 'admin-jane',
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'policy-fraud-001',
      name: 'Suspicious Transaction Detection',
      type: 'fraud_detection',
      status: 'active',
      severity: 'critical',
      enabled: true,
      violationsCount: 3,
      lastTriggered: new Date(Date.now() - 4 * 60 * 60 * 1000),
      effectiveFrom: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      description: 'Detects and flags potentially fraudulent transaction patterns',
      version: '2.1.0',
      createdBy: 'admin-security',
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'policy-content-001',
      name: 'Template Quality Standards',
      type: 'content_quality',
      status: 'active',
      severity: 'medium',
      enabled: true,
      violationsCount: 45,
      lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
      effectiveFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      description: 'Enforces quality standards for marketplace templates',
      version: '1.0.0',
      createdBy: 'admin-content',
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [violations, _____setViolations] = useState<PolicyViolationData[]>([
    {
      violationId: 'violation-001',
      policyId: 'policy-trust-001',
      policyName: 'Trust Score Minimum Threshold',
      entityType: 'user',
      entityId: 'user-123',
      violationType: 'trust_score_below_threshold',
      severity: 'high',
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'pending',
      description: 'User trust score (45) below minimum threshold (60)'
    },
    {
      violationId: 'violation-002',
      policyId: 'policy-fraud-001',
      policyName: 'Suspicious Transaction Detection',
      entityType: 'transaction',
      entityId: 'txn-456',
      violationType: 'suspicious_payment_pattern',
      severity: 'critical',
      detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'reviewed',
      reviewedBy: 'admin-security',
      description: 'Multiple failed payment attempts from different cards'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'active': return 'text-green-600 bg-green-100';
    case 'inactive': return 'text-gray-600 bg-gray-100';
    case 'draft': return 'text-blue-600 bg-blue-100';
    case 'suspended': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case 'critical': return 'text-red-600 bg-red-100';
    case 'high': return 'text-orange-600 bg-orange-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'low': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getViolationStatusColor = (status: string) => {
    switch (status) {
    case 'pending': return 'text-yellow-600 bg-yellow-100';
    case 'reviewed': return 'text-blue-600 bg-blue-100';
    case 'dismissed': return 'text-gray-600 bg-gray-100';
    case 'enforced': return 'text-green-600 bg-green-100';
    default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handlePolicyToggle = (policyId: string) => {
    setPolicies(prev => 
      prev.map(policy => 
        policy.id === policyId 
          ? { ...policy, enabled: !policy.enabled }
          : policy
      )
    );
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = searchTerm === '' || 
      policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    const matchesType = typeFilter === 'all' || policy.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const renderOverview = () => {
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(p => p.enabled).length;
    const totalViolations = violations.length;
    const pendingViolations = violations.filter(v => v.status === 'pending').length;

    return (
      <div className="overview-section">
        <div className="metrics-grid">
          <Card className="metric-card">
            <CardContent>
              <div className="metric-header">
                <Shield className="w-6 h-6 text-blue-500" />
                <span className="metric-trend positive">
                  <TrendingUp className="w-4 h-4" />
                  +2
                </span>
              </div>
              <div className="metric-content">
                <div className="metric-value">{totalPolicies}</div>
                <div className="metric-label">Total Policies</div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent>
              <div className="metric-header">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="metric-percentage">{Math.round((activePolicies / totalPolicies) * 100)}%</span>
              </div>
              <div className="metric-content">
                <div className="metric-value">{activePolicies}</div>
                <div className="metric-label">Active Policies</div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent>
              <div className="metric-header">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <span className="metric-trend negative">
                  <TrendingUp className="w-4 h-4" />
                  +5
                </span>
              </div>
              <div className="metric-content">
                <div className="metric-value">{totalViolations}</div>
                <div className="metric-label">Total Violations</div>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent>
              <div className="metric-header">
                <Clock className="w-6 h-6 text-yellow-500" />
                <Badge className="text-red-600 bg-red-100">URGENT</Badge>
              </div>
              <div className="metric-content">
                <div className="metric-value">{pendingViolations}</div>
                <div className="metric-label">Pending Review</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="recent-activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Policy Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="activity-list">
                {violations.slice(0, 5).map(violation => (
                  <div key={violation.violationId} className="activity-item">
                    <div className="activity-icon">
                      <Flag className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{violation.policyName} violation</div>
                      <div className="activity-description">
                        {violation.entityType} {violation.entityId}: {violation.description}
                      </div>
                      <div className="activity-time">
                        {violation.detectedAt.toLocaleString()}
                      </div>
                    </div>
                    <Badge className={getViolationStatusColor(violation.status)}>
                      {violation.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderPolicies = () => (
    <div className="policies-section">
      <div className="policies-controls">
        <div className="search-filters">
          <div className="search-bar">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="trust_score">Trust Score</option>
            <option value="fraud_detection">Fraud Detection</option>
            <option value="content_quality">Content Quality</option>
            <option value="user_behavior">User Behavior</option>
            <option value="transaction_monitoring">Transaction</option>
          </select>
        </div>

        <div className="action-buttons">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Policy
          </Button>
        </div>
      </div>

      <div className="policies-list">
        {filteredPolicies.map(policy => (
          <Card key={policy.id} className="policy-card">
            <CardContent>
              <div className="policy-header">
                <div className="policy-info">
                  <div className="policy-title">
                    <h4>{policy.name}</h4>
                    <div className="policy-badges">
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status.toUpperCase()}
                      </Badge>
                      <Badge className={getSeverityColor(policy.severity)}>
                        {policy.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <p className="policy-description">{policy.description}</p>
                </div>

                <div className="policy-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={policy.enabled}
                      onChange={() => handlePolicyToggle(policy.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="policy-stats">
                <div className="stat-item">
                  <span className="stat-label">Violations</span>
                  <span className="stat-value">{policy.violationsCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Version</span>
                  <span className="stat-value">{policy.version}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Last Triggered</span>
                  <span className="stat-value">
                    {policy.lastTriggered ? policy.lastTriggered.toLocaleDateString() : 'Never'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Updated</span>
                  <span className="stat-value">{policy.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="policy-actions">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderViolations = () => (
    <div className="violations-section">
      <Card>
        <CardHeader>
          <div className="violations-header">
            <CardTitle>Policy Violations</CardTitle>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="violations-list">
            {violations.map(violation => (
              <div key={violation.violationId} className="violation-item">
                <div className="violation-main">
                  <div className="violation-info">
                    <div className="violation-title">
                      {violation.policyName}
                      <Badge className={getSeverityColor(violation.severity)}>
                        {violation.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="violation-description">
                      {violation.description}
                    </div>
                    <div className="violation-meta">
                      <span>{violation.entityType}: {violation.entityId}</span>
                      <span>•</span>
                      <span>Detected: {violation.detectedAt.toLocaleString()}</span>
                      {violation.reviewedBy && (
                        <>
                          <span>•</span>
                          <span>Reviewed by: {violation.reviewedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="violation-status">
                    <Badge className={getViolationStatusColor(violation.status)}>
                      {violation.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {violation.status === 'pending' && (
                  <div className="violation-actions">
                    <Button size="sm" className="approve-btn">
                      Dismiss
                    </Button>
                    <Button size="sm" variant="outline" className="enforce-btn">
                      Enforce
                    </Button>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`policy-management-dashboard ${className}`}>
      <div className="dashboard-header">
        <div className="header-info">
          <h2>Policy Management</h2>
          <p>Configure and monitor marketplace policies and enforcement</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="dashboard-tabs">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">
            Policies
            <Badge className="ml-2 text-xs">{policies.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="violations">
            Violations
            <Badge className="ml-2 text-xs bg-orange-100 text-orange-600">
              {violations.filter(v => v.status === 'pending').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="tab-content">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="policies" className="tab-content">
          {renderPolicies()}
        </TabsContent>

        <TabsContent value="violations" className="tab-content">
          {renderViolations()}
        </TabsContent>

        <TabsContent value="analytics" className="tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Policy Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Policy performance analytics and trends coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx>{`
        .policy-management-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        }

        .overview-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .metric-card .card-content {
          padding: 1.5rem;
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .metric-trend.positive {
          color: #059669;
          background: #d1fae5;
        }

        .metric-trend.negative {
          color: #dc2626;
          background: #fee2e2;
        }

        .metric-percentage {
          font-size: 0.875rem;
          font-weight: 600;
          color: #059669;
        }

        .metric-content {
          text-align: center;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .activity-icon {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .activity-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .activity-time {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .policies-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .policies-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .search-filters {
          display: flex;
          gap: 0.75rem;
          flex: 1;
        }

        .search-bar {
          position: relative;
          flex: 1;
          max-width: 300px;
        }

        .search-bar .lucide {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 0.5rem 0.75rem 0.5rem 2.25rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .filter-select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
          min-width: 120px;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .policies-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .policy-card .card-content {
          padding: 1.5rem;
        }

        .policy-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .policy-info {
          flex: 1;
        }

        .policy-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .policy-title h4 {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .policy-badges {
          display: flex;
          gap: 0.5rem;
        }

        .policy-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }

        .policy-toggle {
          margin-left: 1rem;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.3s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: #3b82f6;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .policy-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem 0;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-align: center;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 600;
        }

        .policy-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .violations-section {
          display: flex;
          flex-direction: column;
        }

        .violations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .violations-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .violation-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
        }

        .violation-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .violation-info {
          flex: 1;
        }

        .violation-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .violation-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .violation-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .violation-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .approve-btn {
          background: #059669;
          border-color: #059669;
        }

        .approve-btn:hover {
          background: #047857;
          border-color: #047857;
        }

        .enforce-btn {
          color: #dc2626;
          border-color: #dc2626;
        }

        .enforce-btn:hover {
          background: #dc2626;
          color: white;
        }

        @media (max-width: 1200px) {
          .policy-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .policies-controls {
            flex-direction: column;
            align-items: stretch;
          }
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .search-filters {
            flex-direction: column;
          }
          
          .search-bar {
            max-width: none;
          }
          
          .policy-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .policy-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .violation-main {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .policy-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PolicyManagementDashboard;
/**
 * Admin Verification Dashboard - E17-1753114397393-BA8A32
 * 
 * Administrative interface for managing identity verification requests
 * Part of Epic 17.5.5 - Verification System
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  FileText, 
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { identityValidationService } from '../../auth/IdentityValidation';
import type { 
  IdentityValidationRequest, 
  ValidationResult, 
  TrustScore,
  ValidationStatus,
  IdentityValidationType 
} from '../../auth/IdentityValidation';

export interface VerificationDashboardProps {
  className?: string;
  onRequestSelect?: (request: IdentityValidationRequest) => void;
}

export interface AdminVerificationMetrics {
  totalRequests: number;
  pendingRequests: number;
  approvedToday: number;
  rejectedToday: number;
  averageProcessingTime: number; // hours
  queueBacklog: number;
  priorityRequests: number;
}

export interface VerificationQueueItem extends IdentityValidationRequest {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeInQueue: number; // hours
  assignedReviewer?: string;
  complexity: 'simple' | 'moderate' | 'complex';
  flagged: boolean;
}

export const VerificationDashboard: React.FC<VerificationDashboardProps> = ({
  className = '',
  onRequestSelect
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ValidationStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<IdentityValidationType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock admin metrics - in real implementation, this would come from an admin service
  const [metrics, setMetrics] = useState<AdminVerificationMetrics>({
    totalRequests: 1247,
    pendingRequests: 23,
    approvedToday: 18,
    rejectedToday: 3,
    averageProcessingTime: 4.2,
    queueBacklog: 23,
    priorityRequests: 8
  });

  // Mock queue data - in real implementation, this would come from admin service
  const [verificationQueue, setVerificationQueue] = useState<VerificationQueueItem[]>([
    {
      userId: 'user-1',
      requestId: 'val_1738457234_abc123',
      timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
      type: 'government_id',
      data: { fullName: 'John Director', governmentId: { type: 'passport', number: 'P1234567', expirationDate: '2026-12-31', issuingAuthority: 'US State Dept', documentImages: [] }},
      status: 'pending',
      metadata: { ipAddress: '192.168.1.1', userAgent: 'Chrome', sessionId: 'sess123', requestSource: 'profile_setup' },
      priority: 'high',
      timeInQueue: 2.5,
      complexity: 'moderate',
      flagged: false
    },
    {
      userId: 'user-2',
      requestId: 'val_1738457235_def456',
      timestamp: Date.now() - (6 * 60 * 60 * 1000), // 6 hours ago
      type: 'professional_credentials',
      data: { fullName: 'Sarah Producer', professionalCredentials: { role: 'producer', experience: 'professional', credentials: [], portfolio: [] }},
      status: 'in_review',
      metadata: { ipAddress: '192.168.1.2', userAgent: 'Safari', sessionId: 'sess456', requestSource: 'manual_request' },
      priority: 'medium',
      timeInQueue: 6.2,
      assignedReviewer: 'admin-jane',
      complexity: 'complex',
      flagged: true
    }
  ]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      // In real implementation, refresh data from API
      setIsLoading(false);
    }, 1000);
  };

  const handleStatusUpdate = (requestId: string, newStatus: ValidationStatus) => {
    setVerificationQueue(prev => 
      prev.map(item => 
        item.requestId === requestId 
          ? { ...item, status: newStatus }
          : item
      )
    );
  };

    };

  const getStatusColor = (status: ValidationStatus) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in_review': return 'text-blue-600 bg-blue-100';
      case 'requires_update': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredQueue = verificationQueue.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.data.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const renderOverview = () => (
    <div className="overview-section">
      <div className="metrics-grid">
        <Card className="metric-card">
          <CardContent>
            <div className="metric-header">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="metric-label">Total Requests</span>
            </div>
            <div className="metric-value">{metrics.totalRequests}</div>
            <div className="metric-change positive">
              <TrendingUp className="w-4 h-4" />
              +12% this month
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent>
            <div className="metric-header">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="metric-label">Pending Queue</span>
            </div>
            <div className="metric-value">{metrics.pendingRequests}</div>
            <div className="metric-change neutral">
              <TrendingDown className="w-4 h-4" />
              -3 since yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent>
            <div className="metric-header">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="metric-label">Approved Today</span>
            </div>
            <div className="metric-value">{metrics.approvedToday}</div>
            <div className="metric-change positive">
              <TrendingUp className="w-4 h-4" />
              +5 vs yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent>
            <div className="metric-header">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="metric-label">Rejected Today</span>
            </div>
            <div className="metric-value">{metrics.rejectedToday}</div>
            <div className="metric-change neutral">
              Same as yesterday
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="performance-cards">
        <Card className="performance-card">
          <CardHeader>
            <CardTitle>Processing Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="performance-metrics">
              <div className="performance-item">
                <span>Average Processing Time</span>
                <span className="performance-value">{metrics.averageProcessingTime}h</span>
              </div>
              <div className="performance-item">
                <span>Queue Backlog</span>
                <span className="performance-value">{metrics.queueBacklog}</span>
              </div>
              <div className="performance-item">
                <span>Priority Requests</span>
                <span className="performance-value priority">{metrics.priorityRequests}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="alerts-card">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="alerts-list">
              <div className="alert-item warning">
                <AlertCircle className="w-4 h-4" />
                <span>8 requests approaching SLA deadline</span>
              </div>
              <div className="alert-item info">
                <FileText className="w-4 h-4" />
                <span>2 flagged requests need senior review</span>
              </div>
              <div className="alert-item success">
                <TrendingUp className="w-4 h-4" />
                <span>Processing efficiency up 15%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderQueue = () => (
    <div className="queue-section">
      <div className="queue-controls">
        <div className="search-bar">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user ID, request ID, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ValidationStatus | 'all')}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="requires_update">Requires Update</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as IdentityValidationType | 'all')}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="email_verification">Email</option>
            <option value="phone_verification">Phone</option>
            <option value="government_id">Government ID</option>
            <option value="professional_credentials">Professional</option>
            <option value="social_media_verification">Social Media</option>
            <option value="portfolio_verification">Portfolio</option>
          </select>

          <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="queue-list">
        {filteredQueue.map((item) => (
          <Card key={item.requestId} className="queue-item">
            <CardContent>
              <div className="queue-item-header">
                <div className="item-info">
                  <div className="item-title">
                    <span className="user-name">{item.data.fullName || 'Unknown'}</span>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority.toUpperCase()}
                    </Badge>
                    {item.flagged && (
                      <Badge className="text-red-600 bg-red-100">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        FLAGGED
                      </Badge>
                    )}
                  </div>
                  <div className="item-details">
                    <span>ID: {item.requestId}</span>
                    <span>Type: {item.type.replace('_', ' ')}</span>
                    <span>In Queue: {item.timeInQueue.toFixed(1)}h</span>
                    <span>Complexity: {item.complexity}</span>
                  </div>
                </div>

                <div className="item-actions">
                  <Button
                    onClick={() => onRequestSelect?.(item)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Review
                  </Button>
                  
                  {item.status === 'pending' && (
                    <Button
                      onClick={() => handleStatusUpdate(item.requestId, 'in_review')}
                      size="sm"
                    >
                      Start Review
                    </Button>
                  )}
                  
                  {item.status === 'in_review' && (
                    <div className="review-actions">
                      <Button
                        onClick={() => handleStatusUpdate(item.requestId, 'approved')}
                        size="sm"
                        className="approve-btn"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(item.requestId, 'rejected')}
                        size="sm"
                        variant="outline"
                        className="reject-btn"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {item.assignedReviewer && (
                <div className="assigned-reviewer">
                  <span>Assigned to: {item.assignedReviewer}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQueue.length === 0 && (
        <div className="empty-state">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p>No verification requests match your current filters.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`verification-dashboard ${className}`}>
      <div className="dashboard-header">
        <div className="header-info">
          <h2>Verification Management</h2>
          <p>Manage identity verification requests and maintain marketplace trust</p>
        </div>
        
        <div className="header-actions">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="dashboard-tabs">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="queue">
            Verification Queue
            {metrics.pendingRequests > 0 && (
              <Badge className="ml-2 text-xs">{metrics.pendingRequests}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="tab-content">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="queue" className="tab-content">
          {renderQueue()}
        </TabsContent>

        <TabsContent value="analytics" className="tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Verification Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Verification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configuration settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx>{`
        .verification-dashboard {
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
          gap: 1rem;
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

        .header-actions {
          display: flex;
          gap: 0.5rem;
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
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .metric-change {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .metric-change.positive {
          color: #059669;
        }

        .metric-change.negative {
          color: #dc2626;
        }

        .metric-change.neutral {
          color: #6b7280;
        }

        .performance-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .performance-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .performance-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .performance-item:last-child {
          border-bottom: none;
        }

        .performance-value {
          font-weight: 600;
          color: #1f2937;
        }

        .performance-value.priority {
          color: #dc2626;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .alert-item.warning {
          background: #fef3c7;
          color: #92400e;
        }

        .alert-item.info {
          background: #dbeafe;
          color: #1e40af;
        }

        .alert-item.success {
          background: #d1fae5;
          color: #065f46;
        }

        .queue-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .queue-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          max-width: 400px;
          position: relative;
        }

        .search-bar .lucide {
          position: absolute;
          left: 0.75rem;
          z-index: 1;
        }

        .search-input {
          flex: 1;
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

        .filters {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
        }

        .queue-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .queue-item .card-content {
          padding: 1rem;
        }

        .queue-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .item-info {
          flex: 1;
        }

        .item-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .user-name {
          font-weight: 600;
          color: #1f2937;
        }

        .item-details {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .item-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .review-actions {
          display: flex;
          gap: 0.5rem;
        }

        .approve-btn {
          background: #059669;
          border-color: #059669;
        }

        .approve-btn:hover {
          background: #047857;
          border-color: #047857;
        }

        .reject-btn {
          color: #dc2626;
          border-color: #dc2626;
        }

        .reject-btn:hover {
          background: #dc2626;
          color: white;
        }

        .assigned-reviewer {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .queue-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .search-bar {
            max-width: none;
          }

          .filters {
            flex-wrap: wrap;
          }

          .queue-item-header {
            flex-direction: column;
            gap: 0.75rem;
          }

          .performance-cards {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default VerificationDashboard;
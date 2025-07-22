/**
 * Submission Queue Dashboard - E17-1753114397296-8AA0B5
 * 
 * Administrative interface for managing the marketplace submission review queue
 * Part of Epic 17.5.1 - Review Workflow (Backstage Admin Controls)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Queue,
  Clock,
  User,
  FileText,
  Star,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  RefreshCw,
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Target,
  Settings,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  MoreHorizontal,
  Flag
} from 'lucide-react';

// Types extending existing submission system
export interface QueueSubmission {
  id: string;
  template_id: string;
  submitter_id: string;
  submitter_name: string;
  submitter_email: string;
  status: 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'rejected';
  version_number: number;
  submission_data: {
    title: string;
    description: string;
    tags: string[];
    categories: string[];
    price_cents: number;
    is_ai_generated?: boolean;
    intended_use_cases: string[];
  };
  validation_results: ValidationResult[];
  submitted_at: Date;
  updated_at: Date;
  assigned_reviewer?: string;
  review_priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_review_time?: number; // minutes
  complexity_score?: number; // 1-10
}

export interface ValidationResult {
  rule_id: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  field?: string;
  auto_fixable: boolean;
}

export interface QueueMetrics {
  total_pending: number;
  total_under_review: number;
  total_changes_requested: number;
  average_wait_time_hours: number;
  average_review_time_hours: number;
  reviews_completed_today: number;
  queue_velocity: number; // submissions/day
  reviewer_workload: Array<{
    reviewer_id: string;
    reviewer_name: string;
    active_reviews: number;
    completed_today: number;
    average_review_time: number;
  }>;
}

export interface QueueFilters {
  status?: string[];
  priority?: string[];
  categories?: string[];
  submitter?: string;
  assigned_reviewer?: string;
  submitted_after?: Date;
  submitted_before?: Date;
  has_validation_errors?: boolean;
  complexity_min?: number;
  complexity_max?: number;
  sort_by: 'submitted_at' | 'priority' | 'estimated_time' | 'complexity';
  sort_order: 'asc' | 'desc';
  page: number;
  limit: number;
}

const SubmissionQueueDashboard: React.FC = () => {
  // State management
  const [submissions, setSubmissions] = useState<QueueSubmission[]>([]);
  const [metrics, setMetrics] = useState<QueueMetrics | null>(null);
  const [filters, setFilters] = useState<QueueFilters>({
    sort_by: 'submitted_at',
    sort_order: 'desc',
    page: 1,
    limit: 50
  });
  const [loading, setLoading] = useState(true);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load queue data
  useEffect(() => {
    loadSubmissionQueue();
    loadQueueMetrics();
    const interval = setInterval(loadQueueMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [filters]);

  const loadSubmissionQueue = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
        ),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/submissions/review-queue?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Failed to load submission queue:', error);
    }
    setLoading(false);
  };

  const loadQueueMetrics = async () => {
    try {
      const response = await fetch('/api/submissions/queue-metrics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to load queue metrics:', error);
    }
  };

  const handleAssignReviewer = async (submissionId: string, reviewerId: string) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ reviewer_id: reviewerId })
      });

      if (response.ok) {
        loadSubmissionQueue();
      }
    } catch (error) {
      console.error('Failed to assign reviewer:', error);
    }
  };

  const handleBulkAssign = async (reviewerId: string) => {
    try {
      const response = await fetch('/api/submissions/bulk-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ 
          submission_ids: selectedSubmissions,
          reviewer_id: reviewerId 
        })
      });

      if (response.ok) {
        setSelectedSubmissions([]);
        loadSubmissionQueue();
      }
    } catch (error) {
      console.error('Failed to bulk assign submissions:', error);
    }
  };

  const handleUpdatePriority = async (submissionId: string, priority: string) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}/priority`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ priority })
      });

      if (response.ok) {
        loadSubmissionQueue();
      }
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-purple-100 text-purple-800',
      changes_requested: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.submitted;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="submission-queue-dashboard">
      <div className="queue-header">
        <div className="header-content">
          <div className="title-section">
            <Queue className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Submission Queue</h1>
              <p className="text-gray-600 mt-1">Manage and review marketplace template submissions</p>
            </div>
          </div>
          
          <div className="header-actions">
            <Button 
              onClick={loadSubmissionQueue} 
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => {/* Export functionality */}} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Queue Metrics Summary */}
        {metrics && (
          <div className="metrics-grid">
            <Card className="metric-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics.total_pending}</p>
                  </div>
                  <Queue className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Under Review</p>
                    <p className="text-2xl font-bold text-purple-600">{metrics.total_under_review}</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Wait Time</p>
                    <p className="text-2xl font-bold text-orange-600">{metrics.average_wait_time_hours.toFixed(1)}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Today's Reviews</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.reviews_completed_today}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Tabs defaultValue="queue" className="queue-tabs">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue">Review Queue</TabsTrigger>
          <TabsTrigger value="reviewers">Reviewer Workload</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="queue-content">
          {/* Search and Filters */}
          <Card className="filter-card">
            <CardContent className="p-4">
              <div className="filter-section">
                <div className="search-bar">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search submissions by title, submitter, or template ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none border-0 bg-transparent"
                  />
                </div>

                <div className="filter-controls">
                  <select 
                    value={filters.status?.join(',') || ''} 
                    onChange={(e) => setFilters({...filters, status: e.target.value ? e.target.value.split(',') : undefined})}
                    className="filter-select"
                  >
                    <option value="">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="changes_requested">Changes Requested</option>
                  </select>

                  <select 
                    value={filters.priority?.join(',') || ''} 
                    onChange={(e) => setFilters({...filters, priority: e.target.value ? e.target.value.split(',') : undefined})}
                    className="filter-select"
                  >
                    <option value="">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <select 
                    value={`${filters.sort_by}_${filters.sort_order}`} 
                    onChange={(e) => {
                      const [sort_by, sort_order] = e.target.value.split('_') as [typeof filters.sort_by, typeof filters.sort_order];
                      setFilters({...filters, sort_by, sort_order});
                    }}
                    className="filter-select"
                  >
                    <option value="submitted_at_desc">Newest First</option>
                    <option value="submitted_at_asc">Oldest First</option>
                    <option value="priority_desc">Priority High-Low</option>
                    <option value="priority_asc">Priority Low-High</option>
                    <option value="complexity_desc">Complex First</option>
                    <option value="estimated_time_desc">Longest Review Time</option>
                  </select>
                </div>

                {selectedSubmissions.length > 0 && (
                  <div className="bulk-actions">
                    <Badge variant="outline" className="mr-2">
                      {selectedSubmissions.length} selected
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => setSelectedSubmissions([])}>
                      Clear Selection
                    </Button>
                    <select 
                      onChange={(e) => e.target.value && handleBulkAssign(e.target.value)}
                      className="filter-select ml-2"
                      defaultValue=""
                    >
                      <option value="">Bulk Assign to Reviewer</option>
                      {metrics?.reviewer_workload.map(reviewer => (
                        <option key={reviewer.reviewer_id} value={reviewer.reviewer_id}>
                          {reviewer.reviewer_name} ({reviewer.active_reviews} active)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submission Queue Table */}
          <Card className="submissions-table">
            <CardContent className="p-0">
              {loading ? (
                <div className="loading-state">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  <p className="text-gray-600 mt-2">Loading submissions...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="empty-state">
                  <Queue className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">No submissions in queue</h3>
                  <p className="text-gray-500">All caught up! No submissions match your current filters.</p>
                </div>
              ) : (
                <div className="submissions-list">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="submission-row">
                      <div className="row-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.includes(submission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubmissions([...selectedSubmissions, submission.id]);
                            } else {
                              setSelectedSubmissions(selectedSubmissions.filter(id => id !== submission.id));
                            }
                          }}
                          className="checkbox"
                        />
                      </div>

                      <div className="submission-info">
                        <div className="submission-header">
                          <h4 className="submission-title">{submission.submission_data.title}</h4>
                          <div className="submission-badges">
                            <Badge className={getPriorityColor(submission.review_priority)}>
                              {submission.review_priority}
                            </Badge>
                            <Badge className={getStatusColor(submission.status)}>
                              {submission.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        <div className="submission-details">
                          <div className="detail-item">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{submission.submitter_name}</span>
                          </div>
                          <div className="detail-item">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatTimeAgo(submission.submitted_at)}</span>
                          </div>
                          <div className="detail-item">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span>v{submission.version_number}</span>
                          </div>
                          {submission.complexity_score && (
                            <div className="detail-item">
                              <BarChart3 className="w-4 h-4 text-gray-400" />
                              <span>Complexity: {submission.complexity_score}/10</span>
                            </div>
                          )}
                          {submission.estimated_review_time && (
                            <div className="detail-item">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>Est. {submission.estimated_review_time}m</span>
                            </div>
                          )}
                        </div>

                        {submission.validation_results.some(r => r.severity === 'error') && (
                          <div className="validation-warnings">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-red-600">
                              {submission.validation_results.filter(r => r.severity === 'error').length} validation errors
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="submission-actions">
                        <select 
                          value={submission.review_priority}
                          onChange={(e) => handleUpdatePriority(submission.id, e.target.value)}
                          className="priority-select"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                          <option value="urgent">Urgent</option>
                        </select>

                        <select 
                          value={submission.assigned_reviewer || ''}
                          onChange={(e) => e.target.value && handleAssignReviewer(submission.id, e.target.value)}
                          className="reviewer-select"
                          disabled={submission.status === 'approved' || submission.status === 'rejected'}
                        >
                          <option value="">Assign Reviewer</option>
                          {metrics?.reviewer_workload.map(reviewer => (
                            <option key={reviewer.reviewer_id} value={reviewer.reviewer_id}>
                              {reviewer.reviewer_name} ({reviewer.active_reviews} active)
                            </option>
                          ))}
                        </select>

                        <Button
                          size="sm"
                          onClick={() => window.open(`/admin/submissions/${submission.id}`, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewers" className="reviewers-content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Reviewer Workload
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics?.reviewer_workload.map(reviewer => (
                <div key={reviewer.reviewer_id} className="reviewer-card">
                  <div className="reviewer-info">
                    <h4 className="reviewer-name">{reviewer.reviewer_name}</h4>
                    <div className="reviewer-stats">
                      <span>{reviewer.active_reviews} active reviews</span>
                      <span>•</span>
                      <span>{reviewer.completed_today} completed today</span>
                      <span>•</span>
                      <span>Avg: {reviewer.average_review_time.toFixed(1)}h</span>
                    </div>
                  </div>
                  <div className="workload-bar">
                    <div 
                      className="workload-fill" 
                      style={{width: `${Math.min(reviewer.active_reviews * 10, 100)}%`}}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="analytics-content">
          <div className="analytics-grid">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Queue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="trend-metrics">
                  <div className="trend-item">
                    <span className="trend-label">Queue Velocity</span>
                    <span className="trend-value">{metrics?.queue_velocity.toFixed(1)} sub/day</span>
                  </div>
                  <div className="trend-item">
                    <span className="trend-label">Avg Review Time</span>
                    <span className="trend-value">{metrics?.average_review_time_hours.toFixed(1)}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <style jsx>{`
        .submission-queue-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .queue-header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        .metric-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .queue-tabs {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .filter-card {
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }

        .filter-controls {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          min-width: 150px;
        }

        .bulk-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px;
          background: #f1f5f9;
          border-radius: 8px;
        }

        .submissions-table {
          border: 1px solid #e2e8f0;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px;
          text-align: center;
        }

        .submissions-list {
          divide-y: 1px solid #e2e8f0;
        }

        .submission-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          transition: background-color 0.2s;
        }

        .submission-row:hover {
          background: #f8fafc;
        }

        .row-checkbox {
          flex-shrink: 0;
        }

        .checkbox {
          width: 16px;
          height: 16px;
          accent-color: #3b82f6;
        }

        .submission-info {
          flex: 1;
          min-width: 0;
        }

        .submission-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .submission-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          line-height: 1.4;
        }

        .submission-badges {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .submission-details {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 8px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: #6b7280;
        }

        .validation-warnings {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }

        .submission-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
        }

        .priority-select, .reviewer-select {
          padding: 6px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: white;
          font-size: 14px;
          min-width: 120px;
        }

        .reviewer-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .reviewer-info {
          flex: 1;
        }

        .reviewer-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .reviewer-stats {
          font-size: 14px;
          color: #6b7280;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .workload-bar {
          width: 100px;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .workload-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
          transition: width 0.3s;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .trend-metrics {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .trend-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8fafc;
          border-radius: 6px;
        }

        .trend-label {
          font-size: 14px;
          color: #6b7280;
        }

        .trend-value {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .submission-queue-dashboard {
            padding: 16px;
          }

          .header-content {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .filter-controls {
            flex-direction: column;
          }

          .filter-select {
            min-width: auto;
          }

          .submission-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .submission-header {
            flex-direction: column;
            gap: 8px;
          }

          .submission-badges {
            flex-wrap: wrap;
          }

          .submission-actions {
            justify-content: stretch;
          }

          .priority-select, .reviewer-select {
            flex: 1;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default SubmissionQueueDashboard;
/**
 * Review Dashboard - Epic 17
 * 
 * Central dashboard for managing all review workflows across the platform.
 * Provides unified interface for review assignment, monitoring, and analytics.
 * 
 * Task: E17-1753114397301-5C1461 - Develop review tools
 * Epic: 17 - Backstage Admin Controls
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Users, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Settings,
  RefreshCw,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  ReviewItem,
  ReviewType,
  ReviewStatus,
  ReviewPriority,
  ReviewAssignment,
  ReviewDecision,
  AssignmentRecommendation
} from '../../types/ReviewTools';

interface ReviewDashboardProps {
  onReviewSelect?: (review: ReviewItem) => void;
  onAssignmentAction?: (action: AssignmentAction) => void;
  className?: string;
}

interface AssignmentAction {
  type: 'assign' | 'reassign' | 'escalate' | 'approve' | 'reject';
  reviewId: string;
  reviewerId?: string;
  data?: unknown;
}

interface DashboardSummary {
  totalActiveReviews: number;
  pendingAssignments: number;
  overdueReviews: number;
  escalatedReviews: number;
  averageCompletionTime: number;
  reviewerUtilization: number;
  qualityScore: number;
  throughput: number;
}

interface DashboardFilters {
  reviewType?: ReviewType[];
  status?: ReviewStatus[];
  priority?: ReviewPriority[];
  assignedTo?: string[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  searchQuery?: string;
}

export const ReviewDashboard: React.FC<ReviewDashboardProps> = ({
  onReviewSelect,
  onAssignmentAction,
  className = ''
}) => {
  // State management
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activeReviews, setActiveReviews] = useState<ReviewItem[]>([]);
  const [pendingAssignments, _____setPendingAssignments] = useState<ReviewAssignment[]>([]);
  const [escalatedReviews, _____setEscalatedReviews] = useState<ReviewItem[]>([]);
  const [overdueReviews, _____setOverdueReviews] = useState<ReviewItem[]>([]);
  const [recentDecisions, _____setRecentDecisions] = useState<ReviewDecision[]>([]);
  
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [selectedTab, setSelectedTab] = useState<'overview' | 'queue' | 'assignments' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate API calls - would be replaced with actual service calls
      const mockSummary: DashboardSummary = {
        totalActiveReviews: 156,
        pendingAssignments: 23,
        overdueReviews: 8,
        escalatedReviews: 5,
        averageCompletionTime: 18.5, // hours
        reviewerUtilization: 78,
        qualityScore: 92,
        throughput: 45 // reviews per day
      };

      const mockActiveReviews: ReviewItem[] = [
        {
          reviewId: 'FR-12345',
          reviewType: 'fraud_case',
          sourceSystem: 'fraud_monitoring',
          sourceId: 'fraud-case-001',
          priority: 'urgent',
          status: 'in_review',
          title: 'High-risk payment fraud detected',
          description: 'Suspicious payment pattern detected for user account',
          data: { fraudScore: 87, transactionAmount: 2500 },
          metadata: {
            sourceData: {},
            businessContext: 'Payment fraud investigation',
            riskLevel: 'high',
            tags: ['payment', 'fraud', 'high-value'],
            flagged: true,
            estimatedReviewTime: 45,
            complexity: 'complex'
          },
          assignedTo: 'reviewer-001',
          assignedAt: new Date('2025-01-20T10:00:00Z'),
          reviewCriteria: [],
          decisions: [],
          notes: [],
          evidence: [],
          createdAt: new Date('2025-01-20T09:30:00Z'),
          updatedAt: new Date('2025-01-20T11:15:00Z'),
          dueDate: new Date('2025-01-20T17:30:00Z'),
          childReviewIds: [],
          relatedReviewIds: [],
          dependencies: [],
          requiresConsensus: false,
          autoEscalationEnabled: true
        }
        // More mock reviews would be added here
      ];

      setSummary(mockSummary);
      setActiveReviews(mockActiveReviews);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Filter and search logic
  const filteredReviews = useMemo(() => {
    let filtered = activeReviews;

    if (filters.reviewType?.length) {
      filtered = filtered.filter(review => filters.reviewType!.includes(review.reviewType));
    }

    if (filters.status?.length) {
      filtered = filtered.filter(review => filters.status!.includes(review.status));
    }

    if (filters.priority?.length) {
      filtered = filtered.filter(review => filters.priority!.includes(review.priority));
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(review =>
        review.title.toLowerCase().includes(query) ||
        review.description.toLowerCase().includes(query) ||
        review.reviewId.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeReviews, filters]);

  // Event handlers
  const handleReviewClick = (review: ReviewItem) => {
    onReviewSelect?.(review);
  };

  const handleAssignmentAction = (action: AssignmentAction) => {
    onAssignmentAction?.(action);
  };

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className={`review-dashboard loading ${className}`}>
        <div className="loading-spinner">
          <RefreshCw className="animate-spin" size={24} />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`review-dashboard ${className}`}>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Review Dashboard</h1>
          <div className="header-actions">
            <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className="refresh-button"
            >
              <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
              Refresh
            </button>
            <button className="settings-button">
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${selectedTab === 'queue' ? 'active' : ''}`}
            onClick={() => setSelectedTab('queue')}
          >
            Review Queue
          </button>
          <button
            className={`tab ${selectedTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setSelectedTab('assignments')}
          >
            Assignments
          </button>
          <button
            className={`tab ${selectedTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setSelectedTab('analytics')}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {selectedTab === 'overview' && (
          <OverviewTab
            summary={summary}
            escalatedReviews={escalatedReviews}
            overdueReviews={overdueReviews}
            recentDecisions={recentDecisions}
            onReviewSelect={handleReviewClick}
          />
        )}

        {selectedTab === 'queue' && (
          <QueueTab
            reviews={filteredReviews}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReviewSelect={handleReviewClick}
            onAssignmentAction={handleAssignmentAction}
          />
        )}

        {selectedTab === 'assignments' && (
          <AssignmentsTab
            pendingAssignments={pendingAssignments}
            onAssignmentAction={handleAssignmentAction}
          />
        )}

        {selectedTab === 'analytics' && (
          <AnalyticsTab
            summary={summary}
          />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  summary: DashboardSummary | null;
  escalatedReviews: ReviewItem[];
  overdueReviews: ReviewItem[];
  recentDecisions: ReviewDecision[];
  onReviewSelect: (review: ReviewItem) => void;
}> = ({ summary, escalatedReviews, overdueReviews, recentDecisions, onReviewSelect }) => {
  if (!summary) return <div>Loading...</div>;

  return (
    <div className="overview-tab">
      {/* Summary Cards */}
      <div className="summary-cards">
        <SummaryCard
          title="Active Reviews"
          value={summary.totalActiveReviews}
          icon={<Clock size={20} />}
          trend={{ value: 12, direction: 'up' }}
          className="active-reviews"
        />
        <SummaryCard
          title="Pending Assignments"
          value={summary.pendingAssignments}
          icon={<Users size={20} />}
          trend={{ value: -3, direction: 'down' }}
          className="pending-assignments"
        />
        <SummaryCard
          title="Overdue Reviews"
          value={summary.overdueReviews}
          icon={<AlertTriangle size={20} />}
          trend={{ value: 2, direction: 'up' }}
          className="overdue-reviews alert"
        />
        <SummaryCard
          title="Quality Score"
          value={`${summary.qualityScore}%`}
          icon={<CheckCircle size={20} />}
          trend={{ value: 1.5, direction: 'up' }}
          className="quality-score"
        />
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className="metric-row">
          <div className="metric">
            <span className="metric-label">Avg Completion Time</span>
            <span className="metric-value">{summary.averageCompletionTime}h</span>
          </div>
          <div className="metric">
            <span className="metric-label">Reviewer Utilization</span>
            <span className="metric-value">{summary.reviewerUtilization}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Daily Throughput</span>
            <span className="metric-value">{summary.throughput}</span>
          </div>
        </div>
      </div>

      {/* Priority Sections */}
      <div className="priority-sections">
        {escalatedReviews.length > 0 && (
          <PrioritySection
            title="Escalated Reviews"
            icon={<ArrowUp className="text-red-500" size={16} />}
            reviews={escalatedReviews}
            onReviewSelect={onReviewSelect}
            className="escalated-section"
          />
        )}

        {overdueReviews.length > 0 && (
          <PrioritySection
            title="Overdue Reviews"
            icon={<Clock className="text-orange-500" size={16} />}
            reviews={overdueReviews}
            onReviewSelect={onReviewSelect}
            className="overdue-section"
          />
        )}
      </div>
    </div>
  );
};

// Queue Tab Component
const QueueTab: React.FC<{
  reviews: ReviewItem[];
  filters: DashboardFilters;
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
  onReviewSelect: (review: ReviewItem) => void;
  onAssignmentAction: (action: AssignmentAction) => void;
}> = ({ reviews, filters, onFilterChange, onReviewSelect, onAssignmentAction }) => {
  return (
    <div className="queue-tab">
      {/* Filters */}
      <ReviewFilters
        filters={filters}
        onFilterChange={onFilterChange}
      />

      {/* Review List */}
      <ReviewList
        reviews={reviews}
        onReviewSelect={onReviewSelect}
        onAssignmentAction={onAssignmentAction}
      />
    </div>
  );
};

// Supporting Components
const SummaryCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
  className?: string;
}> = ({ title, value, icon, trend, className = '' }) => {
  return (
    <div className={`summary-card ${className}`}>
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <span className="card-title">{title}</span>
      </div>
      <div className="card-value">{value}</div>
      {trend && (
        <div className={`card-trend ${trend.direction}`}>
          {trend.direction === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          <span>{Math.abs(trend.value)}</span>
        </div>
      )}
    </div>
  );
};

const PrioritySection: React.FC<{
  title: string;
  icon: React.ReactNode;
  reviews: ReviewItem[];
  onReviewSelect: (review: ReviewItem) => void;
  className?: string;
}> = ({ title, icon, reviews, onReviewSelect, className = '' }) => {
  return (
    <div className={`priority-section ${className}`}>
      <div className="section-header">
        {icon}
        <h3>{title}</h3>
        <span className="count">({reviews.length})</span>
      </div>
      <div className="section-content">
        {reviews.map(review => (
          <ReviewSummaryCard
            key={review.reviewId}
            review={review}
            onClick={() => onReviewSelect(review)}
          />
        ))}
      </div>
    </div>
  );
};

const ReviewSummaryCard: React.FC<{
  review: ReviewItem;
  onClick: () => void;
}> = ({ review, onClick }) => {
  const priorityColors = {
    emergency: 'bg-red-500',
    urgent: 'bg-orange-500',
    high: 'bg-yellow-500',
    medium: 'bg-blue-500',
    low: 'bg-gray-500'
  };

  return (
    <div className="review-summary-card" onClick={onClick}>
      <div className="card-content">
        <div className="review-header">
          <span className="review-id">{review.reviewId}</span>
          <span className={`priority-badge ${priorityColors[review.priority]}`}>
            {review.priority}
          </span>
        </div>
        <h4 className="review-title">{review.title}</h4>
        <p className="review-description">{review.description}</p>
        <div className="review-meta">
          <span className="review-type">{review.reviewType}</span>
          <span className="review-status">{review.status}</span>
          {review.assignedTo && (
            <span className="assigned-to">Assigned to: {review.assignedTo}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other tabs
const AssignmentsTab: React.FC<{
  pendingAssignments: ReviewAssignment[];
  onAssignmentAction: (action: AssignmentAction) => void;
}> = ({ pendingAssignments, onAssignmentAction }) => {
  return (
    <div className="assignments-tab">
      <h2>Pending Assignments</h2>
      {/* Assignment management interface would go here */}
    </div>
  );
};

const AnalyticsTab: React.FC<{
  summary: DashboardSummary | null;
}> = ({ summary }) => {
  return (
    <div className="analytics-tab">
      <h2>Review Analytics</h2>
      {/* Analytics charts and reports would go here */}
    </div>
  );
};

const ReviewFilters: React.FC<{
  filters: DashboardFilters;
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
}> = ({ filters, onFilterChange }) => {
  return (
    <div className="review-filters">
      <div className="filter-row">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search reviews..."
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          />
        </div>
        <button className="filter-button">
          <Filter size={16} />
          Filters
        </button>
      </div>
    </div>
  );
};

const ReviewList: React.FC<{
  reviews: ReviewItem[];
  onReviewSelect: (review: ReviewItem) => void;
  onAssignmentAction: (action: AssignmentAction) => void;
}> = ({ reviews, onReviewSelect, onAssignmentAction }) => {
  return (
    <div className="review-list">
      {reviews.map(review => (
        <ReviewListItem
          key={review.reviewId}
          review={review}
          onSelect={() => onReviewSelect(review)}
          onAssignmentAction={onAssignmentAction}
        />
      ))}
    </div>
  );
};

const ReviewListItem: React.FC<{
  review: ReviewItem;
  onSelect: () => void;
  onAssignmentAction: (action: AssignmentAction) => void;
}> = ({ review, onSelect, onAssignmentAction }) => {
  return (
    <div className="review-list-item" onClick={onSelect}>
      {/* Review item content would go here */}
      <div className="review-summary">
        <h4>{review.title}</h4>
        <p>{review.description}</p>
      </div>
    </div>
  );
};

export default ReviewDashboard;
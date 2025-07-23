// Epic 9.4.2 - Approval Statistics Component
// Comprehensive statistics and analytics for approval workflows

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ApprovalStatistics {
  total_requests: number;
  pending_requests: number;
  overdue_requests: number;
  avg_approval_time_hours: number;
  approval_rate: number;
  by_urgency: Record<string, number>;
  by_status: Record<string, number>;
  top_reviewers: Array<{ reviewer_id: string; count: number }>;
}

interface PerformanceMetrics {
  avg_completion_time: number;
  avg_first_review_time: number;
  avg_criteria_pass_rate: number;
  avg_satisfaction_score: number;
  total_approvals: number;
  approved_count: number;
  rejected_count: number;
  escalated_count: number;
}

interface ApprovalStatisticsProps {
  workspaceId: string;
  period?: '7d' | '30d' | '90d' | '1y';
  refreshInterval?: number;
}

export const ApprovalStatistics: React.FC<ApprovalStatisticsProps> = ({
  workspaceId,
  period = '30d',
  refreshInterval = 30000 // 30 seconds
}) => {
  const [statistics, setStatistics] = useState<ApprovalStatistics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchStatistics();
    
    const interval = setInterval(fetchStatistics, refreshInterval);
    return () => clearInterval(interval);
  }, [workspaceId, period, refreshInterval]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch general statistics
      const [statsResponse, performanceResponse] = await Promise.all([
        fetch(`/api/approval/statistics/${workspaceId}`),
        fetch(`/api/approval/statistics/${workspaceId}/performance?period=${period}`)
      ]);

      if (!statsResponse.ok || !performanceResponse.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const stats = await statsResponse.json();
      const performance = await performanceResponse.json();

      setStatistics(stats);
      setPerformanceMetrics(performance);
      setLastUpdated(new Date());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const _____getStatusColor = (status: string) => {
    switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'in_review': return 'bg-blue-100 text-blue-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'expired': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
    }
  };

  const _____getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
    }
    return <div className="h-4 w-4" />;
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: React.ReactNode;
    subtitle?: string;
  }> = ({ title, value, icon, color, trend, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-md ${color}`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            {trend}
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  const ChartCard: React.FC<{
    title: string;
    data: Record<string, number>;
    type: 'bar' | 'pie';
    colorMap?: (key: string) => string;
  }> = ({ title, data, type, colorMap }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {type === 'bar' ? (
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">{key}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${colorMap ? colorMap(key) : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((value / Math.max(...Object.values(data))) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{value}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${colorMap ? colorMap(key) : 'bg-blue-500'}`} />
                <span className="text-sm text-gray-600 capitalize">{key}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <XCircleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approval Statistics</h2>
          <p className="mt-1 text-sm text-gray-600">
            Overview of approval workflows and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={fetchStatistics}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Requests"
            value={statistics.total_requests}
            icon={<DocumentTextIcon className="h-6 w-6 text-white" />}
            color="bg-blue-500"
            subtitle="All time"
          />
          
          <StatCard
            title="Pending Reviews"
            value={statistics.pending_requests}
            icon={<ClockIcon className="h-6 w-6 text-white" />}
            color="bg-yellow-500"
            subtitle="Awaiting action"
          />
          
          <StatCard
            title="Approval Rate"
            value={formatPercentage(statistics.approval_rate)}
            icon={<CheckCircleIcon className="h-6 w-6 text-white" />}
            color="bg-green-500"
            subtitle="Success rate"
          />
          
          <StatCard
            title="Avg. Review Time"
            value={formatDuration(statistics.avg_approval_time_hours)}
            icon={<ChartBarIcon className="h-6 w-6 text-white" />}
            color="bg-purple-500"
            subtitle="Time to completion"
          />
        </div>
      )}

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="First Review Time"
            value={formatDuration(performanceMetrics.avg_first_review_time)}
            icon={<ClockIcon className="h-6 w-6 text-white" />}
            color="bg-indigo-500"
            subtitle="Time to first review"
          />
          
          <StatCard
            title="Criteria Pass Rate"
            value={formatPercentage(performanceMetrics.avg_criteria_pass_rate)}
            icon={<CheckCircleIcon className="h-6 w-6 text-white" />}
            color="bg-green-500"
            subtitle="Quality metric"
          />
          
          <StatCard
            title="Satisfaction Score"
            value={`${Math.round(performanceMetrics.avg_satisfaction_score * 10) / 10}/5`}
            icon={<DocumentTextIcon className="h-6 w-6 text-white" />}
            color="bg-pink-500"
            subtitle="User satisfaction"
          />
          
          <StatCard
            title="Escalations"
            value={performanceMetrics.escalated_count}
            icon={<ExclamationTriangleIcon className="h-6 w-6 text-white" />}
            color="bg-orange-500"
            subtitle="Escalated reviews"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        {statistics && (
          <ChartCard
            title="Requests by Status"
            data={statistics.by_status}
            type="bar"
            colorMap={(status) => {
              switch (status) {
              case 'pending': return 'bg-yellow-500';
              case 'in_review': return 'bg-blue-500';
              case 'approved': return 'bg-green-500';
              case 'rejected': return 'bg-red-500';
              case 'expired': return 'bg-gray-500';
              default: return 'bg-gray-500';
              }
            }}
          />
        )}

        {/* Urgency Distribution */}
        {statistics && (
          <ChartCard
            title="Requests by Urgency"
            data={statistics.by_urgency}
            type="pie"
            colorMap={(urgency) => getUrgencyColor(urgency).replace('bg-', '')}
          />
        )}
      </div>

      {/* Top Reviewers */}
      {statistics && statistics.top_reviewers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Reviewers</h3>
          <div className="space-y-3">
            {statistics.top_reviewers.slice(0, 10).map((reviewer, index) => (
              <div key={reviewer.reviewer_id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-800">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{reviewer.reviewer_id}</p>
                    <p className="text-xs text-gray-600">Active reviewer</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{reviewer.count}</span>
                  <span className="text-xs text-gray-600">reviews</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Performance Summary ({period})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {performanceMetrics?.approved_count || 0}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {performanceMetrics?.rejected_count || 0}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {performanceMetrics?.total_approvals || 0}
            </div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
        </div>
      </div>

      {/* Health Indicators */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              statistics && statistics.overdue_requests === 0 ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <div>
              <p className="text-sm font-medium text-gray-900">Overdue Requests</p>
              <p className="text-xs text-gray-600">{statistics?.overdue_requests || 0} overdue</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              statistics && statistics.avg_approval_time_hours < 48 ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <div>
              <p className="text-sm font-medium text-gray-900">Response Time</p>
              <p className="text-xs text-gray-600">
                {statistics ? formatDuration(statistics.avg_approval_time_hours) : 'N/A'} average
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              statistics && statistics.approval_rate > 80 ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <div>
              <p className="text-sm font-medium text-gray-900">Approval Rate</p>
              <p className="text-xs text-gray-600">{statistics ? formatPercentage(statistics.approval_rate) : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

import React from 'react';
import { CreatorDashboard, AnalyticsInsight } from '../../../types/analytics';
import { MetricCard } from './MetricCard';
import { QuickInsights } from './QuickInsights';
import { TopPerformingTemplate } from './TopPerformingTemplate';
import { TrendChart } from './TrendChart';
import { formatNumber, formatCurrency, formatPercentage } from '../../../utils/formatters';
import './DashboardOverview.css';


interface DashboardOverviewProps {
  dashboard: CreatorDashboard;,
  insights: AnalyticsInsight;,
  onRefresh: () => void;
  export const DashboardOverview: React.FC<DashboardOverviewProps> = ({),
  dashboard,
  insights,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRefresh


}) => {
  const { overview, performance_summary } = dashboard;
  // Calculate trend indicators
  const getTrendIcon = (value: number) => {
    if (value > 5) return { icon: '📈', color: '#10b981', label: 'Strong Growth' };
    if (value > 0) return { icon: '📊', color: '#3b82f6', label: 'Growing' };
    if (value > -5) return { icon: '📉', color: '#f59e0b', label: 'Stable' };
    return { icon: '⚠️', color: '#ef4444', label: 'Declining' };
  };
  const viewsTrend = getTrendIcon(performance_summary.views_trend);
  const downloadsTrend = getTrendIcon(performance_summary.downloads_trend);
  const revenueTrend = getTrendIcon(performance_summary.revenue_trend);
  const ratingTrend = getTrendIcon(performance_summary.rating_trend);
  return;
    <div className="dashboard-overview">
      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Views"
          value={formatNumber(overview.total_views)}
          trend={performance_summary.views_trend}
          trendLabel={viewsTrend.label}
          icon="👁️"
          color="#3b82f6"
          subtitle="30-day period"
        />
        <MetricCard
          title="Downloads"
          value={formatNumber(overview.total_downloads)}
          trend={performance_summary.downloads_trend}
          trendLabel={downloadsTrend.label}
          icon="📥"
          color="#10b981"
          subtitle="30-day period"
        />
        <MetricCard
          title="Revenue"
          value={formatCurrency(overview.total_revenue)}
          trend={performance_summary.revenue_trend}
          trendLabel={revenueTrend.label}
          icon="💰"
          color="#f59e0b"
          subtitle="30-day period"
        />
        <MetricCard
          title="Avg Rating"
          value={overview.average_rating.toFixed(1)}
          trend={performance_summary.rating_trend}
          trendLabel={ratingTrend.label}
          icon="⭐"
          color="#8b5cf6"
          subtitle="All templates"
        />
      </div>
      {/* Secondary Metrics */}
      <div className="secondary-metrics">
        <div className="metric-item">
          <span className="metric-label">Active Templates</span>
          <span className="metric-value">
            {overview.active_templates} / {overview.total_templates}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Market Ranking</span>
          <span className="metric-value">
            #{formatNumber(performance_summary.ranking_position)}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Market Share</span>
          <span className="metric-value">
            {formatPercentage(performance_summary.market_share)}
          </span>
        </div>
      </div>
      {/* Content Grid */}
      <div className="content-grid">
        {/* Top Performing Template */}
        <div className="content-section">
          <TopPerformingTemplate template={overview.top_performing_template} />
        </div>
        {/* Quick Insights */}
        <div className="content-section">
          <QuickInsights insights={insights.slice(0, 3)} />
        </div>
      </div>
      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h3>Performance Trends</h3>
            <div className="chart-controls">
              <button className="chart-control-button active">Views</button>
              <button className="chart-control-button">Downloads</button>
              <button className="chart-control-button">Revenue</button>
            </div>
          </div>
          <TrendChart
            data={[
              // Mock data - replace with real trend data
              { date: '2024-01-01', views: 120, downloads: 45, revenue: 180 },
              { date: '2024-01-02', views: 135, downloads: 52, revenue: 220 },
              { date: '2024-01-03', views: 142, downloads: 48, revenue: 195 },
              { date: '2024-01-04', views: 158, downloads: 61, revenue: 285 },
              { date: '2024-01-05', views: 171, downloads: 67, revenue: 320 },
              { date: '2024-01-06', views: 165, downloads: 59, revenue: 275 },
              { date: '2024-01-07', views: 189, downloads: 73, revenue: 380 }
            ]}
            metric="views"
            timeRange={dashboard.period}
          />
        </div>
      </div>
      {/* Performance Summary Cards */}
      <div className="performance-cards">
        <div className="performance-card">
          <div className="performance-card-header">
            <span className="performance-icon">🎯</span>
            <h4>Conversion Rate</h4>
          </div>
          <div className="performance-value">
            {((overview.total_downloads / overview.total_views) * 100).toFixed(1)}%
          </div>
          <div className="performance-subtitle">
            Views to downloads
          </div>
        </div>
        <div className="performance-card">
          <div className="performance-card-header">
            <span className="performance-icon">🏆</span>
            <h4>Success Score</h4>
          </div>
          <div className="performance-value">
            {Math.round((overview.average_rating / 5) * 100)}
          </div>
          <div className="performance-subtitle">
            Based on ratings
          </div>
        </div>
        <div className="performance-card">
          <div className="performance-card-header">
            <span className="performance-icon">📊</span>
            <h4>Engagement</h4>
          </div>
          <div className="performance-value">
            {Math.round(overview.total_downloads / overview.active_templates)}
          </div>
          <div className="performance-subtitle">
            Avg downloads per template
          </div>
        </div>
        <div className="performance-card">
          <div className="performance-card-header">
            <span className="performance-icon">💡</span>
            <h4>Growth Rate</h4>
          </div>
          <div className="performance-value">
            {performance_summary.views_trend > 0 ? '+' : ''}{performance_summary.views_trend.toFixed(1)}%
          </div>
          <div className="performance-subtitle">
            30-day change
          </div>
        </div>
      </div>
      {/* Action Items */}
      <div className="action-items">
        <h3>Recommended Actions</h3>
        <div className="action-list">
          {performance_summary.views_trend < 0 && ()
            <div className="action-item">
              <span className="action-icon">📈</span>
              <div className="action-content">
                <h4>Boost Template Visibility</h4>
                <p>Your views are declining. Consider updating template descriptions and tags.</p>
              </div>
            </div>
          )}
          {overview.average_rating < 4.0 && ()
            <div className="action-item">
              <span className="action-icon">⭐</span>
              <div className="action-content">
                <h4>Improve Template Quality</h4>
                <p>Focus on templates with lower ratings to improve overall score.</p>
              </div>
            </div>
          )}
          {((overview.total_downloads / overview.total_views) * 100) < 10 && ()
            <div className="action-item">
              <span className="action-icon">🎯</span>
              <div className="action-content">
                <h4>Optimize Conversion</h4>
                <p>Low conversion rate detected. Review template previews and descriptions.</p>
              </div>
            </div>
          )}
          {overview.active_templates < 5 && ()
            <div className="action-item">
              <span className="action-icon">📝</span>
              <div className="action-content">
                <h4>Create More Templates</h4>
                <p>Expand your template portfolio to increase visibility and revenue.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
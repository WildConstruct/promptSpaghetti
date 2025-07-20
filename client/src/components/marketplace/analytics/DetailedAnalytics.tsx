import React, { useState, useEffect } from 'react';
import { TemplateMetrics, TimeRange } from '../../../types/analytics';
import { TemplateMetricsCard } from './TemplateMetricsCard';
import { DemographicsChart } from './DemographicsChart';
import { TrendChart } from './TrendChart';
import { MetricSelector } from './MetricSelector';
import { TemplateSelector } from './TemplateSelector';
import { analyticsService } from '../../../services/analyticsService';
import './DetailedAnalytics.css';

interface DetailedAnalyticsProps {
  creatorId: string;
  timeRange: TimeRange;
  startDate?: Date;
  endDate?: Date;
}

interface Template {
  id: string;
  title: string;
  status: string;
  created_at: Date;
}

export const DetailedAnalytics: React.FC<DetailedAnalyticsProps> = ({
  creatorId,
  timeRange,
  startDate,
  endDate
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [templateMetrics, setTemplateMetrics] = useState<TemplateMetrics | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['views', 'downloads', 'revenue']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'demographics' | 'trends'>('overview');

  // Load creator's templates
  const loadTemplates = async () => {
    try {
      // This would be replaced with actual API call to get creator's templates
      const response = await fetch(`/api/templates?creator_id=${creatorId}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const templatesData = await response.json();
      setTemplates(templatesData);
      
      if (templatesData.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(templatesData[0].id);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  // Load template metrics
  const loadTemplateMetrics = async (templateId: string) => {
    if (!templateId) return;

    try {
      setLoading(true);
      setError(null);
      
      const metrics = await analyticsService.getTemplateMetrics(
        templateId,
        timeRange,
        startDate,
        endDate
      );
      
      setTemplateMetrics(metrics);
    } catch (err) {
      console.error('Failed to load template metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load template metrics');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadTemplates();
  }, [creatorId]);

  useEffect(() => {
    if (selectedTemplateId) {
      loadTemplateMetrics(selectedTemplateId);
    }
  }, [selectedTemplateId, timeRange, startDate, endDate]);

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  // Handle metric selection
  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  if (loading) {
    return (
      <div className="detailed-analytics loading">
        <div className="loading-header">
          <div className="skeleton-title"></div>
          <div className="skeleton-controls"></div>
        </div>
        <div className="loading-content">
          <div className="skeleton-cards">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
          <div className="skeleton-chart"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detailed-analytics error">
        <div className="error-message">
          <h3>Failed to Load Analytics</h3>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => selectedTemplateId && loadTemplateMetrics(selectedTemplateId)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="detailed-analytics empty">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No Templates Found</h3>
          <p>Create some templates to see detailed analytics.</p>
        </div>
      </div>
    );
  }

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="detailed-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <div className="title-section">
            <h2>Detailed Analytics</h2>
            <p>Deep dive into template performance and user behavior</p>
          </div>
          
          <div className="header-controls">
            <TemplateSelector
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              onTemplateChange={handleTemplateChange}
            />
          </div>
        </div>

        <div className="view-mode-tabs">
          <button
            className={`tab-button ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            <span className="tab-icon">📊</span>
            Overview
          </button>
          <button
            className={`tab-button ${viewMode === 'demographics' ? 'active' : ''}`}
            onClick={() => setViewMode('demographics')}
          >
            <span className="tab-icon">👥</span>
            Demographics
          </button>
          <button
            className={`tab-button ${viewMode === 'trends' ? 'active' : ''}`}
            onClick={() => setViewMode('trends')}
          >
            <span className="tab-icon">📈</span>
            Trends
          </button>
        </div>
      </div>

      <div className="analytics-content">
        {viewMode === 'overview' && templateMetrics && (
          <div className="overview-content">
            {/* Template Performance Cards */}
            <div className="metrics-grid">
              <TemplateMetricsCard
                title="Views"
                value={templateMetrics.metrics.views}
                uniqueValue={templateMetrics.metrics.unique_views}
                icon="👁️"
                color="#3b82f6"
                subtitle="Total / Unique"
              />
              
              <TemplateMetricsCard
                title="Downloads"
                value={templateMetrics.metrics.downloads}
                conversionRate={templateMetrics.metrics.conversion_rate}
                icon="📥"
                color="#10b981"
                subtitle="Conversion Rate"
              />
              
              <TemplateMetricsCard
                title="Rating"
                value={templateMetrics.metrics.average_rating}
                totalRatings={templateMetrics.metrics.total_ratings}
                icon="⭐"
                color="#f59e0b"
                subtitle="Reviews"
              />
              
              <TemplateMetricsCard
                title="Revenue"
                value={templateMetrics.metrics.revenue}
                successRate={templateMetrics.metrics.success_rate}
                icon="💰"
                color="#8b5cf6"
                subtitle="Success Rate"
                isRevenue
              />
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-label">Usage Time</span>
                <span className="stat-value">
                  {Math.round(templateMetrics.metrics.usage_minutes)} min
                </span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Error Rate</span>
                <span className="stat-value">
                  {((templateMetrics.metrics.error_count / (templateMetrics.metrics.views || 1)) * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Likes</span>
                <span className="stat-value">
                  {templateMetrics.metrics.likes}
                </span>
              </div>
            </div>

            {/* Performance Trends Chart */}
            <div className="trends-section">
              <div className="section-header">
                <h3>Performance Trends</h3>
                <MetricSelector
                  availableMetrics={['views', 'downloads', 'revenue', 'ratings']}
                  selectedMetrics={selectedMetrics}
                  onMetricToggle={handleMetricToggle}
                />
              </div>
              
              <div className="chart-container">
                <TrendChart
                  data={templateMetrics.trends.daily_metrics}
                  selectedMetrics={selectedMetrics}
                  timeRange={timeRange}
                />
              </div>
            </div>
          </div>
        )}

        {viewMode === 'demographics' && templateMetrics && (
          <div className="demographics-content">
            <div className="demographics-grid">
              {/* Geographic Distribution */}
              <div className="demographics-section">
                <h3>Geographic Distribution</h3>
                <DemographicsChart
                  data={templateMetrics.demographics.top_countries}
                  type="country"
                  title="Top Countries"
                />
              </div>

              {/* Device Breakdown */}
              <div className="demographics-section">
                <h3>Device Breakdown</h3>
                <DemographicsChart
                  data={templateMetrics.demographics.device_breakdown}
                  type="device"
                  title="Devices Used"
                />
              </div>

              {/* User Segments */}
              <div className="demographics-section">
                <h3>User Segments</h3>
                <DemographicsChart
                  data={templateMetrics.demographics.user_segments}
                  type="segment"
                  title="User Types"
                />
              </div>

              {/* Demographics Summary */}
              <div className="demographics-summary">
                <h3>Key Insights</h3>
                <div className="insights-list">
                  <div className="insight-item">
                    <span className="insight-icon">🌍</span>
                    <div className="insight-content">
                      <strong>Top Market:</strong> {
                        templateMetrics.demographics.top_countries[0]?.country || 'Unknown'
                      } ({
                        templateMetrics.demographics.top_countries[0]?.percentage.toFixed(1) || '0'
                      }%)
                    </div>
                  </div>
                  
                  <div className="insight-item">
                    <span className="insight-icon">📱</span>
                    <div className="insight-content">
                      <strong>Primary Device:</strong> {
                        templateMetrics.demographics.device_breakdown[0]?.device || 'Unknown'
                      } ({
                        templateMetrics.demographics.device_breakdown[0]?.percentage.toFixed(1) || '0'
                      }%)
                    </div>
                  </div>
                  
                  <div className="insight-item">
                    <span className="insight-icon">👤</span>
                    <div className="insight-content">
                      <strong>User Diversity:</strong> {
                        templateMetrics.demographics.top_countries.length
                      } countries represented
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'trends' && templateMetrics && (
          <div className="trends-content">
            {/* Growth Metrics */}
            <div className="growth-metrics">
              <div className="growth-card">
                <h4>Views Growth</h4>
                <div className="growth-value">
                  {templateMetrics.trends.growth_rates.views_growth > 0 ? '+' : ''}
                  {templateMetrics.trends.growth_rates.views_growth.toFixed(1)}%
                </div>
                <div className="growth-indicator">
                  {templateMetrics.trends.growth_rates.views_growth > 0 ? '📈' : '📉'}
                </div>
              </div>
              
              <div className="growth-card">
                <h4>Downloads Growth</h4>
                <div className="growth-value">
                  {templateMetrics.trends.growth_rates.downloads_growth > 0 ? '+' : ''}
                  {templateMetrics.trends.growth_rates.downloads_growth.toFixed(1)}%
                </div>
                <div className="growth-indicator">
                  {templateMetrics.trends.growth_rates.downloads_growth > 0 ? '📈' : '📉'}
                </div>
              </div>
              
              <div className="growth-card">
                <h4>Revenue Growth</h4>
                <div className="growth-value">
                  {templateMetrics.trends.growth_rates.revenue_growth > 0 ? '+' : ''}
                  {templateMetrics.trends.growth_rates.revenue_growth.toFixed(1)}%
                </div>
                <div className="growth-indicator">
                  {templateMetrics.trends.growth_rates.revenue_growth > 0 ? '📈' : '📉'}
                </div>
              </div>
            </div>

            {/* Detailed Trends Chart */}
            <div className="detailed-trends-chart">
              <div className="chart-header">
                <h3>Daily Performance Trends</h3>
                <MetricSelector
                  availableMetrics={['views', 'downloads', 'revenue']}
                  selectedMetrics={selectedMetrics}
                  onMetricToggle={handleMetricToggle}
                />
              </div>
              
              <div className="chart-container large">
                <TrendChart
                  data={templateMetrics.trends.daily_metrics}
                  selectedMetrics={selectedMetrics}
                  timeRange={timeRange}
                  showGridLines
                  showTooltips
                  height={400}
                />
              </div>
            </div>

            {/* Performance Analysis */}
            <div className="performance-analysis">
              <h3>Performance Analysis</h3>
              <div className="analysis-grid">
                <div className="analysis-card">
                  <h4>Best Performing Day</h4>
                  <div className="analysis-content">
                    {(() => {
                      const bestDay = templateMetrics.trends.daily_metrics.reduce(
                        (best, current) => current.views > best.views ? current : best,
                        templateMetrics.trends.daily_metrics[0] || { date: new Date(), views: 0 }
                      );
                      return (
                        <>
                          <div className="metric-date">
                            {bestDay.date.toLocaleDateString()}
                          </div>
                          <div className="metric-values">
                            {bestDay.views} views, {bestDay.downloads} downloads
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="analysis-card">
                  <h4>Average Daily Performance</h4>
                  <div className="analysis-content">
                    <div className="metric-values">
                      {Math.round(
                        templateMetrics.trends.daily_metrics.reduce(
                          (sum, day) => sum + day.views, 0
                        ) / templateMetrics.trends.daily_metrics.length
                      )} avg views/day
                    </div>
                    <div className="metric-values">
                      {Math.round(
                        templateMetrics.trends.daily_metrics.reduce(
                          (sum, day) => sum + day.downloads, 0
                        ) / templateMetrics.trends.daily_metrics.length
                      )} avg downloads/day
                    </div>
                  </div>
                </div>

                <div className="analysis-card">
                  <h4>Total Period Performance</h4>
                  <div className="analysis-content">
                    <div className="metric-values">
                      {templateMetrics.trends.daily_metrics.reduce(
                        (sum, day) => sum + day.views, 0
                      )} total views
                    </div>
                    <div className="metric-values">
                      ${templateMetrics.trends.daily_metrics.reduce(
                        (sum, day) => sum + day.revenue, 0
                      ).toFixed(2)} total revenue
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import './ModerationAnalytics.css';

interface ModeratorStats {
  id: string;
  name: string;
  reviewsToday: number;
  averageTime: number;
  accuracy: number;
  specializations: string[];
  status: 'online' | 'away' | 'offline';
  totalReviews: number;
  completionRate: number;
}

interface ModerationMetrics {
  totalItems: number;
  pendingItems: number;
  completedToday: number;
  averageProcessingTime: number;
  accuracyRate: number;
  escalationRate: number;
  automationRate: number;
  userSatisfactionScore: number;
}

interface ContentTrends {
  category: string;
  volume: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ViolationPatterns {
  type: string;
  count: number;
  severity: 'minor' | 'major' | 'critical';
  source: string;
  trend: number;
}

export const ModerationAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'quarter'>('week');
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'trends' | 'violations'>('overview');
  const [metrics, setMetrics] = useState<ModerationMetrics>({
    totalItems: 0,
    pendingItems: 0,
    completedToday: 0,
    averageProcessingTime: 0,
    accuracyRate: 0,
    escalationRate: 0,
    automationRate: 0,
    userSatisfactionScore: 0
  });
  const [moderatorStats, setModeratorStats] = useState<ModeratorStats[]>([]);
  const [contentTrends, setContentTrends] = useState<ContentTrends[]>([]);
  const [violationPatterns, setViolationPatterns] = useState<ViolationPatterns[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock data
      setMetrics({
        totalItems: 2847,
        pendingItems: 23,
        completedToday: 156,
        averageProcessingTime: 11.3,
        accuracyRate: 94.2,
        escalationRate: 3.8,
        automationRate: 67.5,
        userSatisfactionScore: 4.6
      });

      setModeratorStats([
        {
          id: '1',
          name: 'Alice Chen',
          reviewsToday: 45,
          averageTime: 9.2,
          accuracy: 96.8,
          specializations: ['Content', 'Templates'],
          status: 'online',
          totalReviews: 1247,
          completionRate: 98.5
        },
        {
          id: '2',
          name: 'Bob Wilson',
          reviewsToday: 38,
          averageTime: 12.1,
          accuracy: 92.4,
          specializations: ['User Reports', 'Comments'],
          status: 'online',
          totalReviews: 893,
          completionRate: 94.2
        },
        {
          id: '3',
          name: 'Carol Martinez',
          reviewsToday: 52,
          averageTime: 8.7,
          accuracy: 97.9,
          specializations: ['High Risk', 'Escalations'],
          status: 'away',
          totalReviews: 1689,
          completionRate: 99.1
        }
      ]);

      setContentTrends([
        { category: 'User Generated Content', volume: 1245, trend: 'up', percentage: 12.3, riskLevel: 'medium' },
        { category: 'Template Submissions', volume: 356, trend: 'stable', percentage: 2.1, riskLevel: 'low' },
        { category: 'User Comments', volume: 789, trend: 'down', percentage: -5.7, riskLevel: 'medium' },
        { category: 'Reported Content', volume: 234, trend: 'up', percentage: 18.9, riskLevel: 'high' },
        { category: 'Automated Flags', volume: 456, trend: 'up', percentage: 8.4, riskLevel: 'medium' }
      ]);

      setViolationPatterns([
        { type: 'Spam/Promotional', count: 89, severity: 'minor', source: 'automated', trend: 15.2 },
        { type: 'Inappropriate Language', count: 45, severity: 'major', source: 'user_report', trend: -8.3 },
        { type: 'Harassment', count: 12, severity: 'critical', source: 'user_report', trend: 22.1 },
        { type: 'Copyright Violation', count: 18, severity: 'major', source: 'automated', trend: 5.4 },
        { type: 'Hate Speech', count: 6, severity: 'critical', source: 'user_report', trend: -12.5 }
      ]);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'major': return '#fd7e14';
      case 'minor': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (isLoading) {
    return (
      <div className="moderation-analytics loading">
        <div className="loading-spinner">Loading analytics data...</div>
      </div>
    );
  }

  return (
    <div className="moderation-analytics">
      <div className="analytics-header">
        <h3>Moderation Analytics & Reporting</h3>
        <div className="analytics-controls">
          <div className="time-range-selector">
            <button 
              className={timeRange === 'today' ? 'active' : ''}
              onClick={() => setTimeRange('today')}
            >
              Today
            </button>
            <button 
              className={timeRange === 'week' ? 'active' : ''}
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button 
              className={timeRange === 'month' ? 'active' : ''}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
            <button 
              className={timeRange === 'quarter' ? 'active' : ''}
              onClick={() => setTimeRange('quarter')}
            >
              Quarter
            </button>
          </div>
          <button className="export-btn">Export Report</button>
        </div>
      </div>

      <div className="view-tabs">
        <button 
          className={selectedView === 'overview' ? 'active' : ''}
          onClick={() => setSelectedView('overview')}
        >
          Overview
        </button>
        <button 
          className={selectedView === 'performance' ? 'active' : ''}
          onClick={() => setSelectedView('performance')}
        >
          Team Performance
        </button>
        <button 
          className={selectedView === 'trends' ? 'active' : ''}
          onClick={() => setSelectedView('trends')}
        >
          Content Trends
        </button>
        <button 
          className={selectedView === 'violations' ? 'active' : ''}
          onClick={() => setSelectedView('violations')}
        >
          Violation Patterns
        </button>
      </div>

      {selectedView === 'overview' && (
        <div className="overview-section">
          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-value">{formatNumber(metrics.totalItems)}</div>
                <div className="metric-label">Total Items Processed</div>
                <div className="metric-change positive">+12.3% vs last period</div>
              </div>
            </div>
            
            <div className="metric-card warning">
              <div className="metric-icon">⏳</div>
              <div className="metric-content">
                <div className="metric-value">{metrics.pendingItems}</div>
                <div className="metric-label">Pending Review</div>
                <div className="metric-change negative">+5 vs yesterday</div>
              </div>
            </div>
            
            <div className="metric-card success">
              <div className="metric-icon">✅</div>
              <div className="metric-content">
                <div className="metric-value">{metrics.completedToday}</div>
                <div className="metric-label">Completed Today</div>
                <div className="metric-change positive">+8.7% vs yesterday</div>
              </div>
            </div>
            
            <div className="metric-card info">
              <div className="metric-icon">⏱️</div>
              <div className="metric-content">
                <div className="metric-value">{metrics.averageProcessingTime}min</div>
                <div className="metric-label">Avg Processing Time</div>
                <div className="metric-change positive">-2.1min vs target</div>
              </div>
            </div>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <h4>Accuracy Rate</h4>
              <div className="kpi-value">{metrics.accuracyRate}%</div>
              <div className="kpi-progress">
                <div className="progress-bar" style={{ width: `${metrics.accuracyRate}%` }}></div>
              </div>
              <div className="kpi-target">Target: 95%</div>
            </div>
            
            <div className="kpi-card">
              <h4>Escalation Rate</h4>
              <div className="kpi-value">{metrics.escalationRate}%</div>
              <div className="kpi-progress">
                <div className="progress-bar warning" style={{ width: `${metrics.escalationRate * 10}%` }}></div>
              </div>
              <div className="kpi-target">Target: <5%</div>
            </div>
            
            <div className="kpi-card">
              <h4>Automation Rate</h4>
              <div className="kpi-value">{metrics.automationRate}%</div>
              <div className="kpi-progress">
                <div className="progress-bar success" style={{ width: `${metrics.automationRate}%` }}></div>
              </div>
              <div className="kpi-target">Target: 70%</div>
            </div>
            
            <div className="kpi-card">
              <h4>User Satisfaction</h4>
              <div className="kpi-value">{metrics.userSatisfactionScore}/5</div>
              <div className="star-rating">
                {[1,2,3,4,5].map(star => (
                  <span 
                    key={star} 
                    className={`star ${star <= metrics.userSatisfactionScore ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="kpi-target">Target: 4.5/5</div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'performance' && (
        <div className="performance-section">
          <div className="team-overview">
            <h4>Team Performance Overview</h4>
            <div className="team-stats">
              <div className="team-stat">
                <span className="stat-label">Active Moderators</span>
                <span className="stat-value">{moderatorStats.filter(m => m.status === 'online').length}</span>
              </div>
              <div className="team-stat">
                <span className="stat-label">Total Reviews Today</span>
                <span className="stat-value">{moderatorStats.reduce((sum, m) => sum + m.reviewsToday, 0)}</span>
              </div>
              <div className="team-stat">
                <span className="stat-label">Average Accuracy</span>
                <span className="stat-value">{(moderatorStats.reduce((sum, m) => sum + m.accuracy, 0) / moderatorStats.length).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="moderator-cards">
            {moderatorStats.map(moderator => (
              <div key={moderator.id} className="moderator-card">
                <div className="moderator-header">
                  <div className="moderator-info">
                    <h5>{moderator.name}</h5>
                    <span className={`status-indicator ${moderator.status}`}>
                      {moderator.status}
                    </span>
                  </div>
                  <div className="moderator-specializations">
                    {moderator.specializations.map(spec => (
                      <span key={spec} className="specialization-tag">{spec}</span>
                    ))}
                  </div>
                </div>
                
                <div className="moderator-metrics">
                  <div className="metric">
                    <span className="metric-label">Reviews Today</span>
                    <span className="metric-value">{moderator.reviewsToday}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Avg Time</span>
                    <span className="metric-value">{moderator.averageTime}min</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Accuracy</span>
                    <span className="metric-value">{moderator.accuracy}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Completion Rate</span>
                    <span className="metric-value">{moderator.completionRate}%</span>
                  </div>
                </div>

                <div className="performance-chart">
                  <div className="chart-bars">
                    <div className="chart-bar">
                      <div 
                        className="bar-fill accuracy"
                        style={{ height: `${moderator.accuracy}%` }}
                      ></div>
                      <span className="bar-label">Accuracy</span>
                    </div>
                    <div className="chart-bar">
                      <div 
                        className="bar-fill speed"
                        style={{ height: `${100 - (moderator.averageTime / 20) * 100}%` }}
                      ></div>
                      <span className="bar-label">Speed</span>
                    </div>
                    <div className="chart-bar">
                      <div 
                        className="bar-fill completion"
                        style={{ height: `${moderator.completionRate}%` }}
                      ></div>
                      <span className="bar-label">Completion</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedView === 'trends' && (
        <div className="trends-section">
          <h4>Content Volume Trends</h4>
          <div className="trends-cards">
            {contentTrends.map((trend, index) => (
              <div key={index} className="trend-card">
                <div className="trend-header">
                  <h5>{trend.category}</h5>
                  <span className="trend-icon">{getTrendIcon(trend.trend)}</span>
                </div>
                
                <div className="trend-metrics">
                  <div className="volume-metric">
                    <span className="volume-number">{formatNumber(trend.volume)}</span>
                    <span className="volume-label">items</span>
                  </div>
                  
                  <div className="trend-change">
                    <span className={`change-value ${trend.percentage > 0 ? 'positive' : 'negative'}`}>
                      {trend.percentage > 0 ? '+' : ''}{trend.percentage}%
                    </span>
                    <span className="change-period">vs last {timeRange}</span>
                  </div>
                </div>
                
                <div className="risk-indicator">
                  <span className="risk-label">Risk Level:</span>
                  <span 
                    className="risk-badge"
                    style={{ backgroundColor: getRiskLevelColor(trend.riskLevel) }}
                  >
                    {trend.riskLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedView === 'violations' && (
        <div className="violations-section">
          <h4>Violation Patterns & Analysis</h4>
          <div className="violations-table">
            <table>
              <thead>
                <tr>
                  <th>Violation Type</th>
                  <th>Count</th>
                  <th>Severity</th>
                  <th>Detection Source</th>
                  <th>Trend</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {violationPatterns.map((violation, index) => (
                  <tr key={index}>
                    <td className="violation-type">{violation.type}</td>
                    <td className="violation-count">{violation.count}</td>
                    <td>
                      <span 
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(violation.severity) }}
                      >
                        {violation.severity}
                      </span>
                    </td>
                    <td className="detection-source">
                      {violation.source.replace('_', ' ')}
                    </td>
                    <td>
                      <span className={`trend-indicator ${violation.trend > 0 ? 'increasing' : 'decreasing'}`}>
                        {violation.trend > 0 ? '↗' : '↘'} {Math.abs(violation.trend)}%
                      </span>
                    </td>
                    <td>
                      <button className="action-btn">View Details</button>
                      <button className="action-btn">Update Rules</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="violation-insights">
            <h5>Key Insights</h5>
            <div className="insights-list">
              <div className="insight-item">
                <span className="insight-icon">⚠️</span>
                <span className="insight-text">Harassment reports increased by 22% this week</span>
              </div>
              <div className="insight-item">
                <span className="insight-icon">✅</span>
                <span className="insight-text">Automated spam detection improved efficiency by 15%</span>
              </div>
              <div className="insight-item">
                <span className="insight-icon">📊</span>
                <span className="insight-text">Peak violation times: 2-4 PM and 8-10 PM</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationAnalytics;
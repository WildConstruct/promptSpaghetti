/**
 * Assignment Analytics
 * 
 * Analytics dashboard for policy assignment statistics, trends,
 * and performance metrics with charts and insights
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  AssignmentTargetType,
  AssignmentStatus,
  RiskLevel
} from '../../types/PolicyAssignmentTypes';
import './AssignmentAnalytics.css';

interface AnalyticsData {
  totalAssignments: number;
  assignmentsByStatus: Record<AssignmentStatus, number>;
  assignmentsByTargetType: Record<AssignmentTargetType, number>;
  assignmentsByRiskLevel: Record<RiskLevel, number>;
  assignmentsByPolicyType: Record<string, number>;
  trendsOverTime: {
    date: string;
    created: number;
    revoked: number;
    expired: number;
  }[];
  topPolicies: {
    policyType: string;
    count: number;
    riskDistribution: Record<RiskLevel, number>;
  }[];
  conflictsDetected: {
    conflictId: string;
    type: string;
    severity: string;
    affectedAssignments: number;
  }[];
  inheritanceChains: {
    rootTargetType: AssignmentTargetType;
    rootTargetId: string;
    depth: number;
    totalAssignments: number;
  }[];
  complianceMetrics: {
    averageApprovalTime: number;
    pendingApprovals: number;
    expiredAssignments: number;
    reviewOverdue: number;
  };
  performanceMetrics: {
    averageProcessingTime: number;
    successRate: number;
    errorRate: number;
    systemLoad: number;
  };
}

interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

export const AssignmentAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedMetric, setSelectedMetric] = useState<'assignments' | 'conflicts' | 'performance' | 'compliance'>('assignments');

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await fetch(`/api/policy-assignments/assignments/analytics?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Mock data for development
      setAnalyticsData(createMockAnalytics());
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, loadAnalytics]);

  const createMockAnalytics = (): AnalyticsData => ({
    totalAssignments: 1247,
    assignmentsByStatus: {
      [AssignmentStatus.ACTIVE]: 892,
      [AssignmentStatus.PENDING_APPROVAL]: 45,
      [AssignmentStatus.DRAFT]: 23,
      [AssignmentStatus.SUSPENDED]: 12,
      [AssignmentStatus.EXPIRED]: 189,
      [AssignmentStatus.REVOKED]: 86
    },
    assignmentsByTargetType: {
      [AssignmentTargetType.USER]: 456,
      [AssignmentTargetType.ROLE]: 234,
      [AssignmentTargetType.TEAM]: 189,
      [AssignmentTargetType.ORG_UNIT]: 123,
      [AssignmentTargetType.DEPARTMENT]: 89,
      [AssignmentTargetType.LOCATION]: 67,
      [AssignmentTargetType.DATA_TYPE]: 56,
      [AssignmentTargetType.SYSTEM]: 33
    },
    assignmentsByRiskLevel: {
      [RiskLevel.LOW]: 567,
      [RiskLevel.MEDIUM]: 445,
      [RiskLevel.HIGH]: 189,
      [RiskLevel.CRITICAL]: 46
    },
    assignmentsByPolicyType: {
      'ACCESS_CONTROL': 345,
      'DATA_FILTERING': 289,
      'ENCRYPTION': 234,
      'RETENTION': 178,
      'ANONYMIZATION': 123,
      'AUDIT_LOGGING': 78
    },
    trendsOverTime: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created: Math.floor(Math.random() * 20) + 5,
      revoked: Math.floor(Math.random() * 8) + 1,
      expired: Math.floor(Math.random() * 12) + 2
    })),
    topPolicies: [
      {
        policyType: 'ACCESS_CONTROL',
        count: 345,
        riskDistribution: {
          [RiskLevel.LOW]: 123,
          [RiskLevel.MEDIUM]: 134,
          [RiskLevel.HIGH]: 67,
          [RiskLevel.CRITICAL]: 21
        }
      },
      {
        policyType: 'DATA_FILTERING',
        count: 289,
        riskDistribution: {
          [RiskLevel.LOW]: 145,
          [RiskLevel.MEDIUM]: 89,
          [RiskLevel.HIGH]: 45,
          [RiskLevel.CRITICAL]: 10
        }
      }
    ],
    conflictsDetected: [
      { conflictId: 'C001', type: 'POLICY_OVERLAP', severity: 'HIGH', affectedAssignments: 12 },
      { conflictId: 'C002', type: 'INHERITANCE_CONFLICT', severity: 'MEDIUM', affectedAssignments: 8 },
      { conflictId: 'C003', type: 'PRIORITY_CONFLICT', severity: 'LOW', affectedAssignments: 15 }
    ],
    inheritanceChains: [
      { rootTargetType: AssignmentTargetType.ORG_UNIT, rootTargetId: 'OU001', depth: 4, totalAssignments: 67 },
      { rootTargetType: AssignmentTargetType.DEPARTMENT, rootTargetId: 'DEPT001', depth: 3, totalAssignments: 45 }
    ],
    complianceMetrics: {
      averageApprovalTime: 2.3,
      pendingApprovals: 45,
      expiredAssignments: 189,
      reviewOverdue: 23
    },
    performanceMetrics: {
      averageProcessingTime: 1.2,
      successRate: 97.8,
      errorRate: 2.2,
      systemLoad: 68.5
    }
  });

  const createChartFromRecord = (data: Record<string, number>, colors?: string[]): ChartData => ({
    labels: Object.keys(data),
    values: Object.values(data),
    colors
  });

  const renderChart = (chartData: ChartData, title: string, type: 'bar' | 'pie' | 'line' = 'bar') => {
    const maxValue = Math.max(...chartData.values);
    const colors = chartData.colors || ['#3182ce', '#38a169', '#ed8936', '#e53e3e', '#9f7aea'];

    if (type === 'pie') {
      const total = chartData.values.reduce((sum, value) => sum + value, 0);
      let currentAngle = 0;

      return (
        <div className="chart-container">
          <h3 className="chart-title">{title}</h3>
          <div className="pie-chart">
            <svg viewBox="0 0 200 200" className="pie-svg">
              {chartData.values.map((value, index) => {
                const angle = (value / total) * 360;
                const x1 = 100 + 80 * Math.cos((currentAngle - 90) * Math.PI / 180);
                const y1 = 100 + 80 * Math.sin((currentAngle - 90) * Math.PI / 180);
                const x2 = 100 + 80 * Math.cos((currentAngle + angle - 90) * Math.PI / 180);
                const y2 = 100 + 80 * Math.sin((currentAngle + angle - 90) * Math.PI / 180);
                const largeArc = angle > 180 ? 1 : 0;
                
                const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
                currentAngle += angle;
                
                return (
                  <path
                    key={index}
                    d={path}
                    fill={colors[index % colors.length]}
                    className="pie-slice"
                  />
                );
              })}
            </svg>
            <div className="pie-legend">
              {chartData.labels.map((label, index) => (
                <div key={index} className="legend-item">
                  <span 
                    className="legend-color" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="legend-label">{label}</span>
                  <span className="legend-value">{chartData.values[index]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
        <div className="bar-chart">
          {chartData.labels.map((label, index) => (
            <div key={index} className="bar-item">
              <div className="bar-label">{label}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ 
                    width: `${(chartData.values[index] / maxValue) * 100}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                />
                <span className="bar-value">{chartData.values[index]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    trend?: 'up' | 'down' | 'neutral'
  ) => (
    <div className="metric-card">
      <div className="metric-header">
        <h4>{title}</h4>
        {trend && <span className={`trend-indicator trend-${trend}`}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
        </span>}
      </div>
      <div className="metric-value">{value}</div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
    </div>
  );

  const renderTrendsChart = () => {
    if (!analyticsData?.trendsOverTime) return null;

    return (
      <div className="chart-container trends-chart">
        <h3 className="chart-title">Assignment Trends (30 Days)</h3>
        <div className="trend-lines">
          <div className="trend-legend">
            <div className="legend-item">
              <span className="legend-color created" />
              <span>Created</span>
            </div>
            <div className="legend-item">
              <span className="legend-color revoked" />
              <span>Revoked</span>
            </div>
            <div className="legend-item">
              <span className="legend-color expired" />
              <span>Expired</span>
            </div>
          </div>
          <div className="trend-data">
            {analyticsData.trendsOverTime.map((point, index) => (
              <div key={index} className="trend-point">
                <div className="trend-values">
                  <div className="trend-bar created" style={{ height: `${point.created * 3}px` }} />
                  <div className="trend-bar revoked" style={{ height: `${point.revoked * 3}px` }} />
                  <div className="trend-bar expired" style={{ height: `${point.expired * 3}px` }} />
                </div>
                <div className="trend-date">{new Date(point.date).getDate()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="analytics-error">
        <p>Failed to load analytics data. Please try again.</p>
        <button onClick={loadAnalytics} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="assignment-analytics">
      <div className="analytics-header">
        <h2>Assignment Analytics</h2>
        <div className="date-range-selector">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="analytics-tabs">
        <button 
          className={`analytics-tab ${selectedMetric === 'assignments' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('assignments')}
        >
          Assignments
        </button>
        <button 
          className={`analytics-tab ${selectedMetric === 'conflicts' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('conflicts')}
        >
          Conflicts
        </button>
        <button 
          className={`analytics-tab ${selectedMetric === 'performance' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('performance')}
        >
          Performance
        </button>
        <button 
          className={`analytics-tab ${selectedMetric === 'compliance' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('compliance')}
        >
          Compliance
        </button>
      </div>

      <div className="analytics-content">
        {selectedMetric === 'assignments' && (
          <>
            <div className="metrics-grid">
              {renderMetricCard('Total Assignments', analyticsData.totalAssignments.toLocaleString(), undefined, 'up')}
              {renderMetricCard(
                'Active Assignments',
                analyticsData.assignmentsByStatus[AssignmentStatus.ACTIVE].toLocaleString(
                ), undefined, 'up')}
              {renderMetricCard(
                'Pending Approvals',
                analyticsData.assignmentsByStatus[AssignmentStatus.PENDING_APPROVAL].toLocaleString(
                ), undefined, 'neutral')}
              {renderMetricCard(
                'Expired Assignments',
                analyticsData.assignmentsByStatus[AssignmentStatus.EXPIRED].toLocaleString(
                ), undefined, 'down')}
            </div>

            <div className="charts-grid">
              {renderChart(
                createChartFromRecord(analyticsData.assignmentsByStatus), 
                'Assignments by Status',
                'bar'
              )}
              {renderChart(
                createChartFromRecord(analyticsData.assignmentsByTargetType), 
                'Assignments by Target Type',
                'pie'
              )}
              {renderChart(
                createChartFromRecord(
                  analyticsData.assignmentsByRiskLevel,
                  ['#22543d',
                    '#ed8936',
                    '#e53e3e',
                    '#c53030']
                ), 
                'Assignments by Risk Level',
                'bar'
              )}
              {renderTrendsChart()}
            </div>
          </>
        )}

        {selectedMetric === 'conflicts' && (
          <>
            <div className="metrics-grid">
              {renderMetricCard(
                'Total Conflicts',
                analyticsData.conflictsDetected.length.toString(
                ), undefined, 'down')}
              {renderMetricCard(
                'High Severity',
                analyticsData.conflictsDetected.filter(c => c.severity === 'HIGH'
                ).length.toString(), undefined, 'down')}
              {renderMetricCard(
                'Affected Assignments',
                analyticsData.conflictsDetected.reduce((sum,
                  c
                ) => sum + c.affectedAssignments, 0).toString(), undefined, 'neutral')}
              {renderMetricCard(
                'Inheritance Chains',
                analyticsData.inheritanceChains.length.toString(
                ), undefined, 'up')}
            </div>

            <div className="conflicts-list">
              <h3>Active Conflicts</h3>
              {analyticsData.conflictsDetected.map(conflict => (
                <div key={conflict.conflictId} className="conflict-summary">
                  <div className="conflict-id">{conflict.conflictId}</div>
                  <div className="conflict-info">
                    <div className="conflict-type">{conflict.type}</div>
                    <div className={`conflict-severity severity-${conflict.severity.toLowerCase()}`}>
                      {conflict.severity}
                    </div>
                  </div>
                  <div className="affected-count">{conflict.affectedAssignments} assignments affected</div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedMetric === 'performance' && (
          <>
            <div className="metrics-grid">
              {renderMetricCard(
                'Processing Time',
                `${analyticsData.performanceMetrics.averageProcessingTime}s`,
                'average',
                'up'
              )}
              {renderMetricCard('Success Rate', `${analyticsData.performanceMetrics.successRate}%`, undefined, 'up')}
              {renderMetricCard('Error Rate', `${analyticsData.performanceMetrics.errorRate}%`, undefined, 'down')}
              {renderMetricCard('System Load', `${analyticsData.performanceMetrics.systemLoad}%`, undefined, 'neutral')}
            </div>
          </>
        )}

        {selectedMetric === 'compliance' && (
          <>
            <div className="metrics-grid">
              {renderMetricCard(
                'Approval Time',
                `${analyticsData.complianceMetrics.averageApprovalTime} days`,
                'average',
                'down'
              )}
              {renderMetricCard(
                'Pending Approvals',
                analyticsData.complianceMetrics.pendingApprovals.toString(
                ), undefined, 'neutral')}
              {renderMetricCard(
                'Expired Assignments',
                analyticsData.complianceMetrics.expiredAssignments.toString(
                ), undefined, 'down')}
              {renderMetricCard(
                'Overdue Reviews',
                analyticsData.complianceMetrics.reviewOverdue.toString(
                ), undefined, 'down')}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
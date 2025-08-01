/**
 * Policy Analytics Dashboard - E17-1753114397363-F12F4D
 * 
 * Analytics and monitoring interface for policy enforcement
 * Part of Epic 17.5.4 - Policy Enforcement (Backstage Admin Controls)
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  AlertTriangle,
  Users,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  PieChart,
  LineChart,
  Target,
  Zap }
  Eye
 from 'lucide-react';


export interface PolicyAnalyticsMetrics { totalPolicies: number;
  activePolicies: number;
  totalViolations: number;
  violationTrend: 'up' | 'down' | 'stable';
  violationTrendPercentage: number;
  enforcementActions: number;
  actionSuccessRate: number;
  avgResponseTime: number; // hours;
  topViolatedCategories: Array<{ }
  category: string;
  count: number;
  percentage: number;


>;
  enforcementEffectiveness: Array<{ ,
  actionType: string;
  successRate: number;
  count: number }>;
  timeSeriesData: Array<{ ,
  date: string;
  violations: number;
  enforcements: number;
  preventions: number }>;


export interface PolicyAnalyticsDashboardProps { className?: string }

export const PolicyAnalyticsDashboard: React.FC<PolicyAnalyticsDashboardProps> = ({)
  className = ''
}) => { const [timeRange, setTimeRange] = useState<string>('7d');
  const [_____selectedCategory, _____setSelectedCategory] = useState<string>('all');
  const [_____isLoading, _____setIsLoading] = useState(false);
  // Mock analytics data - in real implementation, this would come from PolicyManagementService
  const [analyticsData] = useState<PolicyAnalyticsMetrics>({)
  totalPolicies: 12
    activePolicies: 9
    totalViolations: 147
    violationTrend: 'down'
    violationTrendPercentage: 12.5
    enforcementActions: 89
    actionSuccessRate: 92.3
    avgResponseTime: 2.4 }
    topViolatedCategories: [
      { category: 'Trust Score', count: 45, percentage: 30.6 }
      { category: 'Content Quality', count: 38, percentage: 25.9 }
      { category: 'Transaction', count: 32, percentage: 21.8 }
      { category: 'User Behavior', count: 24, percentage: 16.3 }
      { category: 'Fraud Detection', count: 8, percentage: 5.4 }
    ]
    enforcementEffectiveness: [
      { actionType: 'Warning Notification', successRate: 95.2, count: 34 }
      { actionType: 'Access Restriction', successRate: 88.7, count: 23 }
      { actionType: 'Account Suspension', successRate: 100, count: 15 }
      { actionType: 'Transaction Block', successRate: 96.4, count: 17 }
    ]
    timeSeriesData: [
      { date: '2024-01-15', violations: 18, enforcements: 12, preventions: 4 }
      { date: '2024-01-16', violations: 22, enforcements: 15, preventions: 6 }
      { date: '2024-01-17', violations: 15, enforcements: 11, preventions: 8 }
      { date: '2024-01-18', violations: 28, enforcements: 19, preventions: 5 }
      { date: '2024-01-19', violations: 31, enforcements: 24, preventions: 7 }
      { date: '2024-01-20', violations: 19, enforcements: 14, preventions: 9 }
      { date: '2024-01-21', violations: 14, enforcements: 10, preventions: 12 }
    ]
  });
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => { switch (trend) {
  case 'up': return TrendingUp;
  case 'down': return TrendingDown;
  default: return Activity };
  const getTrendColor = (trend: 'up' | 'down' | 'stable') => { switch (trend) {
  case 'up': return 'text-red-500';
  case 'down': return 'text-green-500';
  default: return 'text-gray-500' };
  const getCategoryColor = (category: string) => { switch (category.toLowerCase()) {
  case 'trust score': return 'bg-blue-500';
  case 'content quality': return 'bg-purple-500';
  case 'transaction': return 'bg-orange-500';
  case 'user behavior': return 'bg-green-500';
  case 'fraud detection': return 'bg-red-500';
  default: return 'bg-gray-500' };
  const renderKPIMetrics = () => (;);
    <div className="kpi-metrics">
      <div className="metrics-grid">
        <Card className="metric-card">
          <CardContent>
            <div className="metric-header">
              <Shield className="w-6 h-6 text-blue-500" />
              <span className="policy-coverage">
                {Math.round((analyticsData.activePolicies / analyticsData.totalPolicies) * 100)}%
              </span>
            </div>
            <div className="metric-content">
              <div className="metric-value">{analyticsData.activePolicies}</div>
              <div className="metric-label">Active Policies</div>
              <div className="metric-sublabel">of {analyticsData.totalPolicies} total</div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent>
            <div className="metric-header">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <div className="trend-indicator">
                {React.createElement(getTrendIcon(analyticsData.violationTrend), {
                  className: `w-4 h-4 ${getTrendColor(analyticsData.violationTrend)}`}
                })}
                <span className={getTrendColor(analyticsData.violationTrend)}>
                  {analyticsData.violationTrendPercentage}%
                </span>
              </div>
            </div>
            <div className="metric-content">
              <div className="metric-value">{analyticsData.totalViolations}</div>
              <div className="metric-label">Total Violations</div>
              <div className="metric-sublabel">Past {timeRange}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent>
            <div className="metric-header">
              <Target className="w-6 h-6 text-green-500" />
              <Badge className="text-green-600 bg-green-100">
                {analyticsData.actionSuccessRate}%
              </Badge>
            </div>
            <div className="metric-content">
              <div className="metric-value">{analyticsData.enforcementActions}</div>
              <div className="metric-label">Enforcement Actions</div>
              <div className="metric-sublabel">Success Rate</div>
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card">
          <CardContent>
            <div className="metric-header">
              <Clock className="w-6 h-6 text-blue-500" />
              <Badge className="text-blue-600 bg-blue-100">
                FAST
              </Badge>
            </div>
            <div className="metric-content">
              <div className="metric-value">{analyticsData.avgResponseTime}h</div>
              <div className="metric-label">Avg Response Time</div>
              <div className="metric-sublabel">Detection to Action</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  const renderViolationBreakdown = () => (;);
    <Card className="violation-breakdown">
      <CardHeader>
        <CardTitle>Violation Breakdown by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="breakdown-chart">
          {analyticsData.topViolatedCategories.map((item, index) => ()
            <div key={item.category} className="breakdown-item">
              <div className="breakdown-header">
                <div className="category-info">
                  <div className={`category-indicator ${getCategoryColor(item.category)}`}></div>}
                  <span className="category-name">{item.category}</span>
                </div>
                <div className="category-stats">
                  <span className="category-count">{item.count}</span>
                  <span className="category-percentage">({item.percentage}%)</span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${getCategoryColor(item.category)}`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
  const renderEnforcementEffectiveness = () => (;);
    <Card className="enforcement-effectiveness">
      <CardHeader>
        <CardTitle>Enforcement Action Effectiveness</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="effectiveness-list">
          {analyticsData.enforcementEffectiveness.map(action => ()
            <div key={action.actionType} className="effectiveness-item">
              <div className="action-info">
                <div className="action-header">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="action-name">{action.actionType}</span>
                </div>
                <div className="action-stats">
                  <span className="action-count">{action.count} actions</span>
                </div>
              </div>
              <div className="success-indicator">
                <div className="success-rate">
                  <span className="rate-value">{action.successRate}%</span>
                  <div className="rate-bar">
                    <div 
                      className="rate-fill"
                      style={{ 
                        width: `${action.successRate}%`}

  backgroundColor: action.successRate >= 90 ? '#10b981' : 
                          action.successRate >= 75 ? '#f59e0b' : '#ef4444'
}
                    ></div>
                  </div>
                </div>
                {action.successRate >= 95 ? ()
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : action.successRate >= 85 ? ()
                  <Activity className="w-5 h-5 text-yellow-500" />
                ) : ()
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
  const renderTimeSeriesChart = () => (;);
    <Card className="time-series-chart">
      <CardHeader>
        <div className="chart-header">
          <CardTitle>Policy Activity Timeline</CardTitle>
          <div className="chart-controls">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-select"
            >
              <option value="1d">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">3 Months</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-indicator violations"></div>
            <span>Violations Detected</span>
          </div>
          <div className="legend-item">
            <div className="legend-indicator enforcements"></div>
            <span>Actions Taken</span>
          </div>
          <div className="legend-item">
            <div className="legend-indicator preventions"></div>
            <span>Preventions</span>
          </div>
        </div>
        <div className="chart-container">
          <div className="chart-grid">
            {analyticsData.timeSeriesData.map((dataPoint, index) => {
              const maxValue = Math.max(;);
                ...analyticsData.timeSeriesData.map(d => Math.max(d.violations, d.enforcements, d.preventions))
              );
              return;
                <div key={dataPoint.date} className="chart-column">
                  <div className="data-bars">
                    <div 
                      className="data-bar violations"
                      style={{ height: `${(dataPoint.violations / maxValue) * 100}%` }}
                      title={`${dataPoint.violations} violations`}
                    ></div>
                    <div 
                      className="data-bar enforcements"
                      style={{ height: `${(dataPoint.enforcements / maxValue) * 100}%` }}
                      title={`${dataPoint.enforcements} enforcements`}
                    ></div>
                    <div 
                      className="data-bar preventions"
                      style={{ height: `${(dataPoint.preventions / maxValue) * 100}%` }}
                      title={`${dataPoint.preventions} preventions`}
                    ></div>
                  </div>
                  <div className="date-label">
                    { new Date(dataPoint.date).toLocaleDateString('en-US', { )
                      month: 'short' }
                      day: 'numeric' ;
  })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  const renderInsightsPanel = () => (;);
    <Card className="insights-panel">
      <CardHeader>
        <CardTitle>Policy Insights & Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="insights-list">
          <div className="insight-item positive">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div className="insight-content">
              <h4>Improved Trust Score Compliance</h4>
              <p>Trust score violations decreased by 12.5% this week, indicating improved user behavior.</p>
            </div>
          </div>
          <div className="insight-item warning">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div className="insight-content">
              <h4>Content Quality Violations Rising</h4>
              <p>Consider adjusting quality thresholds or providing clearer guidelines to creators.</p>
            </div>
          </div>
          <div className="insight-item info">
            <Activity className="w-5 h-5 text-blue-500" />
            <div className="insight-content">
              <h4>Fast Response Times</h4>
              <p>Average response time of 2.4 hours meets SLA requirements. Great work!</p>
            </div>
          </div>
          <div className="insight-item suggestion">
            <Target className="w-5 h-5 text-purple-500" />
            <div className="insight-content">
              <h4>Optimization Opportunity</h4>
              <p>Transaction monitoring policies could benefit from machine learning enhancements.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  return;
    <div className={`policy-analytics-dashboard ${className}`}>}
      <div className="analytics-header">
        <div className="header-info">
          <h2>Policy Analytics</h2>
          <p>Monitor policy enforcement performance and trends</p>
        </div>
        <div className="header-actions">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Eye className="w-4 h-4 mr-2" />
            Live Monitor
          </Button>
        </div>
      </div>
      <div className="analytics-content">
        {renderKPIMetrics()}
        <div className="analytics-grid">
          <div className="left-column">
            {renderViolationBreakdown()}
            {renderEnforcementEffectiveness()}
          </div>
          <div className="right-column">
            {renderTimeSeriesChart()}
            {renderInsightsPanel()}
          </div>
        </div>
      </div>
      <style>{ `
        .policy-analytics-dashboard {
          max-width: 1400px;
  margin: 0 auto;
          padding: 1.5rem
  display: flex;
          flex-direction: column;
  gap: 1.5rem;
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;
  color: #1f2937;
          margin-bottom: 0.5rem;
        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        .header-actions {
          display: flex;
  gap: 0.75rem;
        .analytics-content {
          display: flex;
          flex-direction: column;
  gap: 1.5rem;
        .kpi-metrics {
          width: 100%;
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        .metric-card .card-content {
          padding: 1.5rem;
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        .policy-coverage {
          font-weight: 600;
  color: #3b82f6;
          background: #eff6ff
  padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
        .trend-indicator {
          display: flex;
          align-items: center;
  gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
        .metric-content {
          text-align: center;
        .metric-value {
          font-size: 2rem;
          font-weight: 700;
  color: #1f2937;
          line-height: 1;
        .metric-label {
          font-size: 0.875rem
  color: #6b7280;
          margin-top: 0.5rem;
          font-weight: 500;
        .metric-sublabel {
          font-size: 0.75rem
  color: #9ca3af;
          margin-top: 0.25rem;
        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr
  gap: 1.5rem;
        .left-column, .right-column {
          display: flex;
          flex-direction: column;
  gap: 1.5rem;
        .breakdown-chart {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .breakdown-item {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
        .breakdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .category-info {
          display: flex;
          align-items: center;
  gap: 0.5rem;
        .category-indicator {
          width: 12px;
  height: 12px;
          border-radius: 2px;
        .category-name {
          font-weight: 500;
  color: #1f2937;
        .category-stats {
          display: flex;
          align-items: center;
  gap: 0.5rem;
        .category-count {
          font-weight: 600;
  color: #1f2937;
        .category-percentage {
          font-size: 0.875rem
  color: #6b7280;
        .progress-bar {
          width: 100%
  height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
  overflow: hidden;
        .progress-fill {
          height: 100%
  transition: width 0.3s ease;
        .effectiveness-list {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .effectiveness-item {
          display: flex;
          align-items: center;
  gap: 1rem;
          padding: 0.75rem
  border: 1px solid #e5e7eb;
          border-radius: 6px;
        .action-info {
          flex: 1;
        .action-header {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          margin-bottom: 0.25rem;
        .action-name {
          font-weight: 500;
  color: #1f2937;
        .action-stats {
          font-size: 0.875rem
  color: #6b7280;
        .success-indicator {
          display: flex;
          align-items: center;
  gap: 0.75rem;
        .success-rate {
          display: flex;
          flex-direction: column;
          align-items: center;
  gap: 0.25rem;
        .rate-value {
          font-weight: 600;
  color: #1f2937;
          font-size: 0.875rem;
        .rate-bar {
          width: 60px;
  height: 4px;
          background: #f3f4f6;
          border-radius: 2px;
  overflow: hidden;
        .rate-fill {
          height: 100%
  transition: width 0.3s ease;
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .time-range-select {
          padding: 0.375rem 0.5rem
  border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.875rem
  background: white;
        .chart-legend {
          display: flex;
  gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        .legend-item {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          font-size: 0.875rem
  color: #6b7280;
        .legend-indicator {
          width: 12px;
  height: 12px;
          border-radius: 2px;
        .legend-indicator.violations {
          background: #ef4444;
        .legend-indicator.enforcements {
          background: #3b82f6;
        .legend-indicator.preventions {
          background: #10b981;
        .chart-container {
          height: 200px;
  position: relative;
        .chart-grid {
          display: flex;
          align-items: end;
          justify-content: space-between
  height: 180px;
          gap: 0.5rem
  padding: 1rem 0;
        .chart-column {
          flex: 1;
  display: flex;
          flex-direction: column;
          align-items: center;
  gap: 0.5rem;
          height: 100%;
        .data-bars {
          display: flex;
          align-items: end;
  gap: 2px;
          height: 140px;
        .data-bar {
          width: 8px;
          min-height: 2px;
          border-radius: 2px 2px 0 0;
        .data-bar.violations {
          background: #ef4444;
        .data-bar.enforcements {
          background: #3b82f6;
        .data-bar.preventions {
          background: #10b981;
        .date-label {
          font-size: 0.75rem
  color: #6b7280;
          text-align: center;
        .insights-list {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .insight-item {
          display: flex;
          align-items: flex-start
  gap: 0.75rem;
          padding: 1rem;
          border-radius: 8px;
  border: 1px solid #e5e7eb;
        .insight-item.positive {
          background: #f0fdf4;
          border-color: #bbf7d0;
        .insight-item.warning {
          background: #fffbeb;
          border-color: #fed7aa;
        .insight-item.info {
          background: #eff6ff;
          border-color: #bfdbfe;
        .insight-item.suggestion {
          background: #faf5ff;
          border-color: #e9d5ff;
        .insight-content h4 {
          font-weight: 600;
  color: #1f2937;
          margin: 0 0 0.5rem 0;
        .insight-content p {
          font-size: 0.875rem }
  color: #6b7280;
          margin: 0;
          line-height: 1.5;
        @media (max-width: 1200px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          .analytics-grid {
            grid-template-columns: 1fr;
        @media (max-width: 768px) {
          .analytics-header {
            flex-direction: column;
            align-items: stretch;
  gap: 1rem;
          .metrics-grid {
            grid-template-columns: 1fr;
          .chart-legend {
            flex-direction: column;
  gap: 0.5rem;
          .chart-grid {
            gap: 0.25rem;
          .data-bars {
            gap: 1px;
          .data-bar {
            width: 6px;
      `}</style>
    </div>
  );
};

export default PolicyAnalyticsDashboard;
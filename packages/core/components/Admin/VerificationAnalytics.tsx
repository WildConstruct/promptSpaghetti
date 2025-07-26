/**
 * Verification Analytics Interface - E17-1753114397393-BA8A32
 * 
 * Analytics and reporting interface for verification system performance
 * Part of Epic 17.5.5 - Verification System
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  PieChart,
  LineChart,
  Target
} from 'lucide-react';

export interface VerificationAnalyticsData {
  period: {
    start: Date;
    end: Date;
    label: string;
  };
  
  overview: {
    totalRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    pendingRequests: number;
    averageProcessingTime: number; // hours
    approvalRate: number; // percentage
  };
  
  requestsByType: Array<{
    type: string;
    count: number;
    approvalRate: number;
    averageProcessingTime: number;
  }>;
  
  processingTrends: Array<{
    date: Date;
    requests: number;
    approved: number;
    rejected: number;
    averageTime: number;
  }>;
  
  trustScoreDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  
  riskAnalysis: {
    highRiskUsers: number;
    flaggedDocuments: number;
    fraudAttempts: number;
    suspendedAccounts: number;
  };
  
  performanceMetrics: {
    slaCompliance: number; // percentage
    qualityScore: number; // 0-100
    reviewerProductivity: number; // requests per hour
    systemUptime: number; // percentage
  };
}

export interface VerificationAnalyticsProps {
  className?: string;
}

export const VerificationAnalytics: React.FC<VerificationAnalyticsProps> = ({
  className = ''
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
  const [_____selectedMetricType, _____setSelectedMetricType] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Mock analytics data - in real implementation, this would come from API
  const [analyticsData] = useState<VerificationAnalyticsData>({
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Last 30 Days'
    },
    
    overview: {
      totalRequests: 1247,
      approvedRequests: 987,
      rejectedRequests: 203,
      pendingRequests: 57,
      averageProcessingTime: 4.2,
      approvalRate: 79.2
    },
    
    requestsByType: [
      { type: 'Email Verification', count: 523, approvalRate: 94.3, averageProcessingTime: 1.2 },
      { type: 'Phone Verification', count: 456, approvalRate: 91.7, averageProcessingTime: 2.1 },
      { type: 'Government ID', count: 134, approvalRate: 67.9, averageProcessingTime: 8.4 },
      { type: 'Professional Credentials', count: 89, approvalRate: 71.9, averageProcessingTime: 12.7 },
      { type: 'Social Media', count: 45, approvalRate: 82.2, averageProcessingTime: 3.8 }
    ],
    
    processingTrends: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      requests: Math.floor(Math.random() * 50) + 20,
      approved: Math.floor(Math.random() * 35) + 15,
      rejected: Math.floor(Math.random() * 10) + 2,
      averageTime: Math.random() * 6 + 2
    })),
    
    trustScoreDistribution: [
      { range: '90-100', count: 287, percentage: 23.0 },
      { range: '80-89', count: 402, percentage: 32.2 },
      { range: '70-79', count: 298, percentage: 23.9 },
      { range: '60-69', count: 156, percentage: 12.5 },
      { range: '0-59', count: 104, percentage: 8.3 }
    ],
    
    riskAnalysis: {
      highRiskUsers: 23,
      flaggedDocuments: 45,
      fraudAttempts: 12,
      suspendedAccounts: 8
    },
    
    performanceMetrics: {
      slaCompliance: 94.7,
      qualityScore: 87.3,
      reviewerProductivity: 2.8,
      systemUptime: 99.9
    }
  });

  const handleRefreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const renderOverviewMetrics = () => (
    <div className="overview-metrics">
      <div className="metrics-grid">
        <Card className="metric-card">
          <CardContent>
            <div className="metric-header">
              <Users className="w-6 h-6 text-blue-500" />
              <span className="metric-trend positive">
                <TrendingUp className="w-4 h-4" />
                +12%
              </span>
            </div>
            <div className="metric-content">
              <div className="metric-value">{analyticsData.overview.totalRequests.toLocaleString()}</div>
              <div className="metric-label">Total Requests</div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent>
            <div className="metric-header">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="metric-trend positive">
                <TrendingUp className="w-4 h-4" />
                +3.2%
              </span>
            </div>
            <div className="metric-content">
              <div className="metric-value">{analyticsData.overview.approvalRate}%</div>
              <div className="metric-label">Approval Rate</div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent>
            <div className="metric-header">
              <Clock className="w-6 h-6 text-orange-500" />
              <span className="metric-trend negative">
                <TrendingDown className="w-4 h-4" />
                -8%
              </span>
            </div>
            <div className="metric-content">
              <div className="metric-value">{analyticsData.overview.averageProcessingTime}h</div>
              <div className="metric-label">Avg Processing Time</div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent>
            <div className="metric-header">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <span className="metric-trend neutral">
                Same
              </span>
            </div>
            <div className="metric-content">
              <div className="metric-value">{analyticsData.overview.pendingRequests}</div>
              <div className="metric-label">Pending Queue</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="status-breakdown">
        <Card className="breakdown-card">
          <CardHeader>
            <CardTitle>Request Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="status-chart">
              <div className="chart-legend">
                <div className="legend-item approved">
                  <div className="legend-color"></div>
                  <span>Approved ({analyticsData.overview.approvedRequests})</span>
                </div>
                <div className="legend-item rejected">
                  <div className="legend-color"></div>
                  <span>Rejected ({analyticsData.overview.rejectedRequests})</span>
                </div>
                <div className="legend-item pending">
                  <div className="legend-color"></div>
                  <span>Pending ({analyticsData.overview.pendingRequests})</span>
                </div>
              </div>
              
              <div className="chart-visual">
                <div className="pie-chart">
                  <div 
                    className="pie-slice approved" 
                    style={{
                      '--percentage': (analyticsData.overview.approvedRequests / analyticsData.overview.totalRequests * 100)
                    } as React.CSSProperties}
                  ></div>
                  <div 
                    className="pie-slice rejected" 
                    style={{
                      '--percentage': (analyticsData.overview.rejectedRequests / analyticsData.overview.totalRequests * 100)
                    } as React.CSSProperties}
                  ></div>
                  <div 
                    className="pie-slice pending" 
                    style={{
                      '--percentage': (analyticsData.overview.pendingRequests / analyticsData.overview.totalRequests * 100)
                    } as React.CSSProperties}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="performance-card">
          <CardHeader>
            <CardTitle>Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="performance-metrics">
              <div className="performance-item">
                <span className="performance-label">SLA Compliance</span>
                <div className="performance-bar">
                  <div 
                    className="performance-fill sla" 
                    style={{ width: `${analyticsData.performanceMetrics.slaCompliance}%` }}
                  ></div>
                </div>
                <span className="performance-value">{analyticsData.performanceMetrics.slaCompliance}%</span>
              </div>
              
              <div className="performance-item">
                <span className="performance-label">Quality Score</span>
                <div className="performance-bar">
                  <div 
                    className="performance-fill quality" 
                    style={{ width: `${analyticsData.performanceMetrics.qualityScore}%` }}
                  ></div>
                </div>
                <span className="performance-value">{analyticsData.performanceMetrics.qualityScore}/100</span>
              </div>
              
              <div className="performance-item">
                <span className="performance-label">Productivity</span>
                <div className="performance-bar">
                  <div 
                    className="performance-fill productivity" 
                    style={{ width: `${(analyticsData.performanceMetrics.reviewerProductivity / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="performance-value">{analyticsData.performanceMetrics.reviewerProductivity} req/hr</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRequestTypeAnalysis = () => (
    <Card className="request-type-analysis">
      <CardHeader>
        <CardTitle>Verification Type Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="type-analysis-table">
          <div className="table-header">
            <div className="header-cell">Type</div>
            <div className="header-cell">Requests</div>
            <div className="header-cell">Approval Rate</div>
            <div className="header-cell">Avg Time</div>
            <div className="header-cell">Trend</div>
          </div>
          
          {analyticsData.requestsByType.map((type, index) => (
            <div key={index} className="table-row">
              <div className="table-cell type-name">{type.type}</div>
              <div className="table-cell">{type.count.toLocaleString()}</div>
              <div className="table-cell">
                <span className={`approval-rate ${type.approvalRate >= 85 ? 'high' : type.approvalRate >= 70 ? 'medium' : 'low'}`}>
                  {type.approvalRate}%
                </span>
              </div>
              <div className="table-cell">{type.averageProcessingTime}h</div>
              <div className="table-cell">
                {Math.random() > 0.5 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderTrustScoreDistribution = () => (
    <Card className="trust-score-distribution">
      <CardHeader>
        <CardTitle>Trust Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="distribution-chart">
          {analyticsData.trustScoreDistribution.map((range, index) => (
            <div key={index} className="distribution-item">
              <div className="range-label">{range.range}</div>
              <div className="range-bar">
                <div 
                  className={`range-fill range-${index}`}
                  style={{ width: `${range.percentage}%` }}
                ></div>
              </div>
              <div className="range-stats">
                <span className="range-count">{range.count}</span>
                <span className="range-percentage">({range.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderRiskAnalysis = () => (
    <Card className="risk-analysis">
      <CardHeader>
        <CardTitle>Risk & Security Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="risk-metrics">
          <div className="risk-item">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div className="risk-content">
              <div className="risk-value">{analyticsData.riskAnalysis.highRiskUsers}</div>
              <div className="risk-label">High Risk Users</div>
            </div>
          </div>
          
          <div className="risk-item">
            <Eye className="w-5 h-5 text-orange-500" />
            <div className="risk-content">
              <div className="risk-value">{analyticsData.riskAnalysis.flaggedDocuments}</div>
              <div className="risk-label">Flagged Documents</div>
            </div>
          </div>
          
          <div className="risk-item">
            <XCircle className="w-5 h-5 text-red-600" />
            <div className="risk-content">
              <div className="risk-value">{analyticsData.riskAnalysis.fraudAttempts}</div>
              <div className="risk-label">Fraud Attempts</div>
            </div>
          </div>
          
          <div className="risk-item">
            <Users className="w-5 h-5 text-gray-500" />
            <div className="risk-content">
              <div className="risk-value">{analyticsData.riskAnalysis.suspendedAccounts}</div>
              <div className="risk-label">Suspended Accounts</div>
            </div>
          </div>
        </div>
        
        <div className="risk-alerts">
          <div className="alert-item warning">
            <AlertTriangle className="w-4 h-4" />
            <span>23 users require immediate attention</span>
          </div>
          
          <div className="alert-item info">
            <Eye className="w-4 h-4" />
            <span>12 documents pending senior review</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`verification-analytics ${className}`}>
      <div className="analytics-header">
        <div className="header-info">
          <h2>Verification Analytics</h2>
          <p>System performance and verification insights</p>
        </div>
        
        <div className="header-controls">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="last_year">Last Year</option>
          </select>
          
          <Button onClick={handleRefreshData} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="analytics-content">
        {renderOverviewMetrics()}
        
        <div className="analytics-grid">
          {renderRequestTypeAnalysis()}
          {renderTrustScoreDistribution()}
        </div>
        
        {renderRiskAnalysis()}
      </div>

      <style>{`
        .verification-analytics {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .analytics-header {
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

        .header-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .period-select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
        }

        .analytics-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .overview-metrics {
          display: flex;
          flex-direction: column;
          gap: 1rem;
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

        .metric-trend.neutral {
          color: #6b7280;
          background: #f3f4f6;
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

        .status-breakdown {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .legend-item.approved .legend-color {
          background: #10b981;
        }

        .legend-item.rejected .legend-color {
          background: #ef4444;
        }

        .legend-item.pending .legend-color {
          background: #f59e0b;
        }

        .chart-visual {
          display: flex;
          justify-content: center;
        }

        .pie-chart {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: conic-gradient(
            #10b981 0deg calc(var(--approved-percentage, 0) * 3.6deg),
            #ef4444 calc(
              var(--approved-percentage,
              0
            ) * 3.6deg) calc((var(--approved-percentage, 0) + var(--rejected-percentage, 0)) * 3.6deg),
            #f59e0b calc((var(--approved-percentage, 0) + var(--rejected-percentage, 0)) * 3.6deg) 360deg
          );
        }

        .performance-metrics {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .performance-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .performance-label {
          min-width: 120px;
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
        }

        .performance-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .performance-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .performance-fill.sla {
          background: #10b981;
        }

        .performance-fill.quality {
          background: #3b82f6;
        }

        .performance-fill.productivity {
          background: #8b5cf6;
        }

        .performance-value {
          min-width: 60px;
          text-align: right;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
        }

        .type-analysis-table {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 1rem;
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          align-items: center;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-cell {
          font-size: 0.875rem;
          color: #1f2937;
        }

        .type-name {
          font-weight: 500;
        }

        .approval-rate.high {
          color: #059669;
          font-weight: 600;
        }

        .approval-rate.medium {
          color: #d97706;
          font-weight: 600;
        }

        .approval-rate.low {
          color: #dc2626;
          font-weight: 600;
        }

        .distribution-chart {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .distribution-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .range-label {
          min-width: 60px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .range-bar {
          flex: 1;
          height: 20px;
          background: #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
        }

        .range-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .range-fill.range-0 { background: #10b981; }
        .range-fill.range-1 { background: #3b82f6; }
        .range-fill.range-2 { background: #f59e0b; }
        .range-fill.range-3 { background: #ef4444; }
        .range-fill.range-4 { background: #6b7280; }

        .range-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          min-width: 80px;
        }

        .range-count {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
        }

        .range-percentage {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .risk-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .risk-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .risk-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .risk-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        .risk-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .risk-alerts {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .alert-item.warning {
          color: #92400e;
        }

        .alert-item.info {
          color: #1e40af;
        }

        @media (max-width: 1200px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
          
          .status-breakdown {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .analytics-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .header-controls {
            justify-content: stretch;
            flex-wrap: wrap;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .table-header,
          .table-row {
            grid-template-columns: 2fr 1fr 1fr;
            gap: 0.5rem;
          }

          .table-header .header-cell:nth-child(4),
          .table-header .header-cell:nth-child(5),
          .table-row .table-cell:nth-child(4),
          .table-row .table-cell:nth-child(5) {
            display: none;
          }

          .risk-metrics {
            grid-template-columns: 1fr;
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

export default VerificationAnalytics;
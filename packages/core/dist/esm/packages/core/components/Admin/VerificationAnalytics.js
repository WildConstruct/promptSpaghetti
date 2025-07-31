import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Verification Analytics Interface - E17-1753114397393-BA8A32
 *
 * Analytics and reporting interface for verification system performance
 * Part of Epic 17.5.5 - Verification System
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle, XCircle, AlertTriangle, Download, RefreshCw, Eye } from 'lucide-react';
;
overview: {
    totalRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    pendingRequests: number;
    averageProcessingTime: number; // hours,
    approvalRate: number; // percentage,
}
;
requestsByType: Array;
processingTrends: Array;
trustScoreDistribution: Array;
riskAnalysis: {
    highRiskUsers: number;
    flaggedDocuments: number;
    fraudAttempts: number;
    suspendedAccounts: number;
}
;
performanceMetrics: {
    slaCompliance: number; // percentage,
    qualityScore: number; // 0-100,
    reviewerProductivity: number; // requests per hour,
    systemUptime: number; // percentage,
}
;
export const VerificationAnalytics = ({
    className = ''
});
{
    const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
    const [_____selectedMetricType, _____setSelectedMetricType] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);
    // Mock analytics data - in real implementation, this would come from API
    const [analyticsData] = useState({});
    period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end;
        new Date(),
            label;
        'Last 30 Days',
        ;
    }
    overview: {
        totalRequests: 1247,
            approvedRequests;
        987,
            rejectedRequests;
        203,
            pendingRequests;
        57,
            averageProcessingTime;
        4.2,
            approvalRate;
        79.2,
        ;
    }
    requestsByType: [,
        { type: 'Email Verification', count: 523, approvalRate: 94.3, averageProcessingTime: 1.2 },
        { type: 'Phone Verification', count: 456, approvalRate: 91.7, averageProcessingTime: 2.1 },
        { type: 'Government ID', count: 134, approvalRate: 67.9, averageProcessingTime: 8.4 },
        { type: 'Professional Credentials', count: 89, approvalRate: 71.9, averageProcessingTime: 12.7 },
        { type: 'Social Media', count: 45, approvalRate: 82.2, averageProcessingTime: 3.8 }
    ],
        processingTrends;
    Array.from({ length: 30 }, (_, i) => ({}), date, new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000), requests, Math.floor(Math.random() * 50) + 20, approved, Math.floor(Math.random() * 35) + 15, rejected, Math.floor(Math.random() * 10) + 2, averageTime, Math.random() * 6 + 2);
}
trustScoreDistribution: [,
    { range: '90-100', count: 287, percentage: 23.0 },
    { range: '80-89', count: 402, percentage: 32.2 },
    { range: '70-79', count: 298, percentage: 23.9 },
    { range: '60-69', count: 156, percentage: 12.5 },
    { range: '0-59', count: 104, percentage: 8.3 }
],
    riskAnalysis;
{
    highRiskUsers: 23,
        flaggedDocuments;
    45,
        fraudAttempts;
    12,
        suspendedAccounts;
    8,
    ;
}
performanceMetrics: {
    slaCompliance: 94.7,
        qualityScore;
    87.3,
        reviewerProductivity;
    2.8,
        systemUptime;
    99.9,
    ;
}
;
const handleRefreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
    }, 1000);
};
const renderOverviewMetrics = () => ();
;
_jsxs("div", { className: "overview-metrics", children: [_jsxs("div", { className: "metrics-grid", children: [_jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(Users, { className: "w-6 h-6 text-blue-500" }), _jsxs("span", { className: "metric-trend positive", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "+12%"] })] }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: analyticsData.overview.totalRequests.toLocaleString() }), _jsx("div", { className: "metric-label", children: "Total Requests" })] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(CheckCircle, { className: "w-6 h-6 text-green-500" }), _jsxs("span", { className: "metric-trend positive", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "+3.2%"] })] }), _jsxs("div", { className: "metric-content", children: [_jsxs("div", { className: "metric-value", children: [analyticsData.overview.approvalRate, "%"] }), _jsx("div", { className: "metric-label", children: "Approval Rate" })] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(Clock, { className: "w-6 h-6 text-orange-500" }), _jsxs("span", { className: "metric-trend negative", children: [_jsx(TrendingDown, { className: "w-4 h-4" }), "-8%"] })] }), _jsxs("div", { className: "metric-content", children: [_jsxs("div", { className: "metric-value", children: [analyticsData.overview.averageProcessingTime, "h"] }), _jsx("div", { className: "metric-label", children: "Avg Processing Time" })] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(AlertTriangle, { className: "w-6 h-6 text-yellow-500" }), _jsx("span", { className: "metric-trend neutral", children: "Same" })] }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: analyticsData.overview.pendingRequests }), _jsx("div", { className: "metric-label", children: "Pending Queue" })] })] }) })] }), _jsxs("div", { className: "status-breakdown", children: [_jsxs(Card, { className: "breakdown-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Request Status Breakdown" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "status-chart", children: [_jsxs("div", { className: "chart-legend", children: [_jsxs("div", { className: "legend-item approved", children: [_jsx("div", { className: "legend-color" }), _jsxs("span", { children: ["Approved (", analyticsData.overview.approvedRequests, ")"] })] }), _jsxs("div", { className: "legend-item rejected", children: [_jsx("div", { className: "legend-color" }), _jsxs("span", { children: ["Rejected (", analyticsData.overview.rejectedRequests, ")"] })] }), _jsxs("div", { className: "legend-item pending", children: [_jsx("div", { className: "legend-color" }), _jsxs("span", { children: ["Pending (", analyticsData.overview.pendingRequests, ")"] })] })] }), _jsx("div", { className: "chart-visual", children: _jsxs("div", { className: "pie-chart", children: [_jsx("div", { className: "pie-slice approved", style: {
                                                        '--percentage': (analyticsData.overview.approvedRequests / analyticsData.overview.totalRequests * 100),
                                                    } }), _jsx("div", { className: "pie-slice rejected", style: {
                                                        '--percentage': (analyticsData.overview.rejectedRequests / analyticsData.overview.totalRequests * 100),
                                                    } }), _jsx("div", { className: "pie-slice pending", style: {
                                                        '--percentage': (analyticsData.overview.pendingRequests / analyticsData.overview.totalRequests * 100),
                                                    } })] }) })] }) })] }), _jsxs(Card, { className: "performance-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Performance Indicators" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "performance-metrics", children: [_jsxs("div", { className: "performance-item", children: [_jsx("span", { className: "performance-label", children: "SLA Compliance" }), _jsx("div", { className: "performance-bar", children: _jsx("div", { className: "performance-fill sla", style: { width: `${analyticsData.performanceMetrics.slaCompliance}%` } }) }), _jsxs("span", { className: "performance-value", children: [analyticsData.performanceMetrics.slaCompliance, "%"] })] }), _jsxs("div", { className: "performance-item", children: [_jsx("span", { className: "performance-label", children: "Quality Score" }), _jsx("div", { className: "performance-bar", children: _jsx("div", { className: "performance-fill quality", style: { width: `${analyticsData.performanceMetrics.qualityScore}%` } }) }), _jsxs("span", { className: "performance-value", children: [analyticsData.performanceMetrics.qualityScore, "/100"] })] }), _jsxs("div", { className: "performance-item", children: [_jsx("span", { className: "performance-label", children: "Productivity" }), _jsx("div", { className: "performance-bar", children: _jsx("div", { className: "performance-fill productivity", style: { width: `${(analyticsData.performanceMetrics.reviewerProductivity / 5) * 100}%` } }) }), _jsxs("span", { className: "performance-value", children: [analyticsData.performanceMetrics.reviewerProductivity, " req/hr"] })] })] }) })] })] })] });
;
const renderRequestTypeAnalysis = () => ();
;
_jsxs(Card, { className: "request-type-analysis", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Verification Type Analysis" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "type-analysis-table", children: [_jsxs("div", { className: "table-header", children: [_jsx("div", { className: "header-cell", children: "Type" }), _jsx("div", { className: "header-cell", children: "Requests" }), _jsx("div", { className: "header-cell", children: "Approval Rate" }), _jsx("div", { className: "header-cell", children: "Avg Time" }), _jsx("div", { className: "header-cell", children: "Trend" })] }), analyticsData.requestsByType.map((type, index) => ()
                            < div, key = { index }, className = "table-row" >
                            (_jsx("div", { className: "table-cell type-name", children: type.type })
                                ,
                                    _jsx("div", { className: "table-cell", children: type.count.toLocaleString() })
                                        ,
                                            _jsx("div", { className: "table-cell", children: _jsxs("span", { className: `approval-rate ${type.approvalRate >= 85 ? 'high' : type.approvalRate >= 70 ? 'medium' : 'low'}`, children: ["}", type.approvalRate, "%"] }) })
                                                ,
                                                    _jsxs("div", { className: "table-cell", children: [type.averageProcessingTime, "h"] })
                                                        ,
                                                            _jsxs("div", { className: "table-cell", children: [Math.random() > 0.5 ? ()
                                                                        < TrendingUp : , " className=\"w-4 h-4 text-green-500\" /> ) : ()", _jsx(TrendingDown, { className: "w-4 h-4 text-red-500" }), ")}"] })))] }), "))}"] })] });
Card >
;
;
const renderTrustScoreDistribution = () => ();
;
_jsxs(Card, { className: "trust-score-distribution", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Trust Score Distribution" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "distribution-chart", children: analyticsData.trustScoreDistribution.map((range, index) => ()
                        < div, key = { index }, className = "distribution-item" >
                        (_jsx("div", { className: "range-label", children: range.range })
                            ,
                                _jsx("div", { className: "range-bar", children: _jsx("div", { className: `range-fill range-${index}`, style: { width: `${range.percentage}%` } }) })
                                    ,
                                        _jsxs("div", { className: "range-stats", children: [_jsx("span", { className: "range-count", children: range.count }), _jsxs("span", { className: "range-percentage", children: ["(", range.percentage, "%)"] })] }))) }), "))}"] })] });
Card >
;
;
const renderRiskAnalysis = () => ();
;
_jsxs(Card, { className: "risk-analysis", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Risk & Security Analysis" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "risk-metrics", children: [_jsxs("div", { className: "risk-item", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-red-500" }), _jsxs("div", { className: "risk-content", children: [_jsx("div", { className: "risk-value", children: analyticsData.riskAnalysis.highRiskUsers }), _jsx("div", { className: "risk-label", children: "High Risk Users" })] })] }), _jsxs("div", { className: "risk-item", children: [_jsx(Eye, { className: "w-5 h-5 text-orange-500" }), _jsxs("div", { className: "risk-content", children: [_jsx("div", { className: "risk-value", children: analyticsData.riskAnalysis.flaggedDocuments }), _jsx("div", { className: "risk-label", children: "Flagged Documents" })] })] }), _jsxs("div", { className: "risk-item", children: [_jsx(XCircle, { className: "w-5 h-5 text-red-600" }), _jsxs("div", { className: "risk-content", children: [_jsx("div", { className: "risk-value", children: analyticsData.riskAnalysis.fraudAttempts }), _jsx("div", { className: "risk-label", children: "Fraud Attempts" })] })] }), _jsxs("div", { className: "risk-item", children: [_jsx(Users, { className: "w-5 h-5 text-gray-500" }), _jsxs("div", { className: "risk-content", children: [_jsx("div", { className: "risk-value", children: analyticsData.riskAnalysis.suspendedAccounts }), _jsx("div", { className: "risk-label", children: "Suspended Accounts" })] })] })] }), _jsxs("div", { className: "risk-alerts", children: [_jsxs("div", { className: "alert-item warning", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), _jsx("span", { children: "23 users require immediate attention" })] }), _jsxs("div", { className: "alert-item info", children: [_jsx(Eye, { className: "w-4 h-4" }), _jsx("span", { children: "12 documents pending senior review" })] })] })] })] });
;
return;
_jsxs("div", { className: `verification-analytics ${className}`, children: ["}", _jsxs("div", { className: "analytics-header", children: [_jsxs("div", { className: "header-info", children: [_jsx("h2", { children: "Verification Analytics" }), _jsx("p", { children: "System performance and verification insights" })] }), _jsxs("div", { className: "header-controls", children: [_jsxs("select", { value: selectedPeriod, onChange: (e) => setSelectedPeriod(e.target.value), className: "period-select", children: [_jsx("option", { value: "last_7_days", children: "Last 7 Days" }), _jsx("option", { value: "last_30_days", children: "Last 30 Days" }), _jsx("option", { value: "last_90_days", children: "Last 90 Days" }), _jsx("option", { value: "last_year", children: "Last Year" })] }), _jsxs(Button, { onClick: handleRefreshData, disabled: isLoading, variant: "outline", children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}` }), "} Refresh"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Report"] })] })] }), _jsxs("div", { className: "analytics-content", children: [renderOverviewMetrics(), _jsxs("div", { className: "analytics-grid", children: [renderRequestTypeAnalysis(), renderTrustScoreDistribution()] }), renderRiskAnalysis()] }), _jsx("style", { children: `
        .verification-analytics {
          max-width: 1400px;
  margin: 0 auto;
          padding: 1.5rem;
  display: flex;
          flex-direction: column;
  gap: 1.5rem;
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
  gap: 1rem;
        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;
  color: #1f2937;
          margin-bottom: 0.5rem;
        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        .header-controls {
          display: flex;
  gap: 0.5rem;
          align-items: center;
        .period-select {
          padding: 0.5rem;
  border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
  background: white;
        .analytics-content {
          display: flex;
          flex-direction: column;
  gap: 1.5rem;
        .overview-metrics {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        .metric-card .card-content {
          padding: 1.5rem;
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        .metric-trend {
          display: flex;
          align-items: center;
  gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
  padding: 0.25rem 0.5rem;
          border-radius: 4px;
        .metric-trend.positive {
          color: #059669;
  background: #d1fae5;
        .metric-trend.negative {
          color: #dc2626;
  background: #fee2e2;
        .metric-trend.neutral {
          color: #6b7280;
  background: #f3f4f6;
        .metric-content {
          text-align: center;
        .metric-value {
          font-size: 2rem;
          font-weight: 700;
  color: #1f2937;
          line-height: 1;
        .metric-label {
          font-size: 0.875rem;
  color: #6b7280;
          margin-top: 0.5rem;
        .status-breakdown {
          display: grid;
          grid-template-columns: 1fr 1fr;
  gap: 1rem;
        .chart-legend {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
          margin-bottom: 1rem;
        .legend-item {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          font-size: 0.875rem;
        .legend-color {
          width: 12px;
  height: 12px;
          border-radius: 2px;
        .legend-item.approved .legend-color {
          background: #10b981;
        .legend-item.rejected .legend-color {
          background: #ef4444;
        .legend-item.pending .legend-color {
          background: #f59e0b;
        .chart-visual {
          display: flex;
          justify-content: center;
        .pie-chart {
          width: 120px;
  height: 120px;
          border-radius: 50%;
  background: conic-gradient(),
            #10b981 0deg calc(var(--approved-percentage, 0) * 3.6deg),
            #ef4444 calc()
              var(--approved-percentage)
              0
            ) * 3.6deg) calc((var(--approved-percentage, 0) + var(--rejected-percentage, 0)) * 3.6deg),
            #f59e0b calc((var(--approved-percentage, 0) + var(--rejected-percentage, 0)) * 3.6deg) 360deg
          );
        .performance-metrics {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .performance-item {
          display: flex;
          align-items: center;
  gap: 1rem;
        .performance-label {
          min-width: 120px;
          font-size: 0.875rem;
  color: #374151;
          font-weight: 500;
        .performance-bar {
          flex: 1;
  height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
  overflow: hidden;
        .performance-fill {
          height: 100%;
  transition: width 0.3s ease;
        .performance-fill.sla {
          background: #10b981;
        .performance-fill.quality {
          background: #3b82f6;
        .performance-fill.productivity {
          background: #8b5cf6;
        .performance-value {
          min-width: 60px;
          text-align: right;
          font-size: 0.875rem;
          font-weight: 600;
  color: #1f2937;
        .analytics-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
  gap: 1rem;
        .type-analysis-table {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
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
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          align-items: center;
        .table-row:last-child {
          border-bottom: none;
        .table-cell {
          font-size: 0.875rem;
  color: #1f2937;
        .type-name {
          font-weight: 500;
        .approval-rate.high {
          color: #059669;
          font-weight: 600;
        .approval-rate.medium {
          color: #d97706;
          font-weight: 600;
        .approval-rate.low {
          color: #dc2626;
          font-weight: 600;
        .distribution-chart {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .distribution-item {
          display: flex;
          align-items: center;
  gap: 1rem;
        .range-label {
          min-width: 60px;
          font-size: 0.875rem;
          font-weight: 500;
  color: #374151;
        .range-bar {
          flex: 1;
  height: 20px;
          background: #e5e7eb;
          border-radius: 10px;
  overflow: hidden;
        .range-fill {
          height: 100%;
  transition: width 0.3s ease;
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
        .range-count {
          font-size: 0.875rem;
          font-weight: 600;
  color: #1f2937;
        .range-percentage {
          font-size: 0.75rem;
  color: #6b7280;
        .risk-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        .risk-item {
          display: flex;
          align-items: center;
  gap: 0.75rem;
          padding: 1rem;
  border: 1px solid #e5e7eb;
          border-radius: 8px;
        .risk-content {
          display: flex;
          flex-direction: column;
  gap: 0.25rem;
        .risk-value {
          font-size: 1.25rem;
          font-weight: 700;
  color: #1f2937;
        .risk-label {
          font-size: 0.875rem;
  color: #6b7280;
        .risk-alerts {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
          padding: 1rem;
  background: #f9fafb;
          border-radius: 8px;
        .alert-item {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          font-size: 0.875rem;
        .alert-item.warning {
          color: #92400e;
        .alert-item.info {
          color: #1e40af;
        @media (max-width: 1200px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          .status-breakdown {
            grid-template-columns: 1fr;
        @media (max-width: 768px) {
          .analytics-header {
            flex-direction: column;
            align-items: stretch;
  gap: 1rem;
          .header-controls {
            justify-content: stretch;
            flex-wrap: wrap;
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          .table-header,
          .table-row {
            grid-template-columns: 2fr 1fr 1fr;
  gap: 0.5rem;
          .table-header .header-cell:nth-child(4),
          .table-header .header-cell:nth-child(5),
          .table-row .table-cell:nth-child(4),
          .table-row .table-cell:nth-child(5) {,
  display: none;
          .risk-metrics {
            grid-template-columns: 1fr;
        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
      ` })] });
;
;
export default VerificationAnalytics;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { TrendingUp, TrendingDown, Activity, Shield, AlertTriangle, Clock, CheckCircle, RefreshCw, Download, Target, Zap, Eye } from 'lucide-react';
 > ;
enforcementEffectiveness: Array < {
    actionType: string,
    successRate: number,
    count: number
} > ;
timeSeriesData: Array < {
    date: string,
    violations: number,
    enforcements: number,
    preventions: number
} > ;
export const PolicyAnalyticsDashboard = ({
    className = ''
});
{
    const [timeRange, setTimeRange] = useState('7d');
    const [_____selectedCategory, _____setSelectedCategory] = useState('all');
    const [_____isLoading, _____setIsLoading] = useState(false);
    // Mock analytics data - in real implementation, this would come from PolicyManagementService
    const [analyticsData] = useState({});
    totalPolicies: 12,
        activePolicies;
    9,
        totalViolations;
    147,
        violationTrend;
    'down',
        violationTrendPercentage;
    12.5,
        enforcementActions;
    89,
        actionSuccessRate;
    92.3,
        avgResponseTime;
    2.4,
        topViolatedCategories;
    [
        { category: 'Trust Score', count: 45, percentage: 30.6 },
        { category: 'Content Quality', count: 38, percentage: 25.9 },
        { category: 'Transaction', count: 32, percentage: 21.8 },
        { category: 'User Behavior', count: 24, percentage: 16.3 },
        { category: 'Fraud Detection', count: 8, percentage: 5.4 }
    ],
        enforcementEffectiveness;
    [
        { actionType: 'Warning Notification', successRate: 95.2, count: 34 },
        { actionType: 'Access Restriction', successRate: 88.7, count: 23 },
        { actionType: 'Account Suspension', successRate: 100, count: 15 },
        { actionType: 'Transaction Block', successRate: 96.4, count: 17 }
    ],
        timeSeriesData;
    [
        { date: '2024-01-15', violations: 18, enforcements: 12, preventions: 4 },
        { date: '2024-01-16', violations: 22, enforcements: 15, preventions: 6 },
        { date: '2024-01-17', violations: 15, enforcements: 11, preventions: 8 },
        { date: '2024-01-18', violations: 28, enforcements: 19, preventions: 5 },
        { date: '2024-01-19', violations: 31, enforcements: 24, preventions: 7 },
        { date: '2024-01-20', violations: 19, enforcements: 14, preventions: 9 },
        { date: '2024-01-21', violations: 14, enforcements: 10, preventions: 12 }
    ];
}
;
const getTrendIcon = (trend) => {
    switch (trend) {
        case 'up': return TrendingUp;
        case 'down': return TrendingDown;
        default: return Activity;
    }
    ;
    const getTrendColor = (trend) => {
        switch (trend) {
            case 'up': return 'text-red-500';
            case 'down': return 'text-green-500';
            default: return 'text-gray-500';
        }
        ;
        const getCategoryColor = (category) => {
            switch (category.toLowerCase()) {
                case 'trust score': return 'bg-blue-500';
                case 'content quality': return 'bg-purple-500';
                case 'transaction': return 'bg-orange-500';
                case 'user behavior': return 'bg-green-500';
                case 'fraud detection': return 'bg-red-500';
                default: return 'bg-gray-500';
            }
            ;
            const renderKPIMetrics = () => ();
            ;
            _jsx("div", { className: "kpi-metrics", children: _jsxs("div", { className: "metrics-grid", children: [_jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(Shield, { className: "w-6 h-6 text-blue-500" }), _jsxs("span", { className: "policy-coverage", children: [Math.round((analyticsData.activePolicies / analyticsData.totalPolicies) * 100), "%"] })] }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: analyticsData.activePolicies }), _jsx("div", { className: "metric-label", children: "Active Policies" }), _jsxs("div", { className: "metric-sublabel", children: ["of ", analyticsData.totalPolicies, " total"] })] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(AlertTriangle, { className: "w-6 h-6 text-orange-500" }), _jsxs("div", { className: "trend-indicator", children: [React.createElement(getTrendIcon(analyticsData.violationTrend), {
                                                        className: `w-4 h-4 ${getTrendColor(analyticsData.violationTrend)}`
                                                    }), ")}", _jsxs("span", { className: getTrendColor(analyticsData.violationTrend), children: [analyticsData.violationTrendPercentage, "%"] })] })] }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: analyticsData.totalViolations }), _jsx("div", { className: "metric-label", children: "Total Violations" }), _jsxs("div", { className: "metric-sublabel", children: ["Past ", timeRange] })] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(Target, { className: "w-6 h-6 text-green-500" }), _jsxs(Badge, { className: "text-green-600 bg-green-100", children: [analyticsData.actionSuccessRate, "%"] })] }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: analyticsData.enforcementActions }), _jsx("div", { className: "metric-label", children: "Enforcement Actions" }), _jsx("div", { className: "metric-sublabel", children: "Success Rate" })] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(Clock, { className: "w-6 h-6 text-blue-500" }), _jsx(Badge, { className: "text-blue-600 bg-blue-100", children: "FAST" })] }), _jsxs("div", { className: "metric-content", children: [_jsxs("div", { className: "metric-value", children: [analyticsData.avgResponseTime, "h"] }), _jsx("div", { className: "metric-label", children: "Avg Response Time" }), _jsx("div", { className: "metric-sublabel", children: "Detection to Action" })] })] }) })] }) });
        };
    };
};
;
const renderViolationBreakdown = () => ();
;
_jsxs(Card, { className: "violation-breakdown", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Violation Breakdown by Category" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "breakdown-chart", children: analyticsData.topViolatedCategories.map((item, index) => ()
                        < div, key = { item, : .category }, className = "breakdown-item" >
                        (_jsxs("div", { className: "breakdown-header", children: [_jsxs("div", { className: "category-info", children: [_jsx("div", { className: `category-indicator ${getCategoryColor(item.category)}` }), "}", _jsx("span", { className: "category-name", children: item.category })] }), _jsxs("div", { className: "category-stats", children: [_jsx("span", { className: "category-count", children: item.count }), _jsxs("span", { className: "category-percentage", children: ["(", item.percentage, "%)"] })] })] })
                            ,
                                _jsx("div", { className: "progress-bar", children: _jsx("div", { className: `progress-fill ${getCategoryColor(item.category)}`, style: { width: `${item.percentage}%` } }) }))) }), "))}"] })] });
Card >
;
;
const renderEnforcementEffectiveness = () => ();
;
_jsxs(Card, { className: "enforcement-effectiveness", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Enforcement Action Effectiveness" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "effectiveness-list", children: [analyticsData.enforcementEffectiveness.map(action => ()
                        < div, key = { action, : .actionType }, className = "effectiveness-item" >
                        (_jsxs("div", { className: "action-info", children: [_jsxs("div", { className: "action-header", children: [_jsx(Zap, { className: "w-4 h-4 text-orange-500" }), _jsx("span", { className: "action-name", children: action.actionType })] }), _jsx("div", { className: "action-stats", children: _jsxs("span", { className: "action-count", children: [action.count, " actions"] }) })] })
                            ,
                                _jsx("div", { className: "success-indicator", children: _jsxs("div", { className: "success-rate", children: [_jsxs("span", { className: "rate-value", children: [action.successRate, "%"] }), _jsxs("div", { className: "rate-bar", children: [_jsx("div", { className: "rate-fill", style: {
                                                            width: `${action.successRate}%`
                                                        } }), ", backgroundColor: action.successRate >= 90 ? '#10b981' : , action.successRate >= 75 ? '#f59e0b' : '#ef4444' }} >"] })] }) })), { action, : .successRate >= 95 ? ()
                            < CheckCircle : , className = "w-5 h-5 text-green-500" /  >
                     }), " : action.successRate >= 85 ? ()", _jsx(Activity, { className: "w-5 h-5 text-yellow-500" }), ") : ()", _jsx(AlertTriangle, { className: "w-5 h-5 text-red-500" }), ")}"] }) }), "))}"] });
CardContent >
;
Card >
;
;
const renderTimeSeriesChart = () => ();
;
_jsxs(Card, { className: "time-series-chart", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "chart-header", children: [_jsx(CardTitle, { children: "Policy Activity Timeline" }), _jsx("div", { className: "chart-controls", children: _jsxs("select", { value: timeRange, onChange: (e) => setTimeRange(e.target.value), className: "time-range-select", children: [_jsx("option", { value: "1d", children: "24 Hours" }), _jsx("option", { value: "7d", children: "7 Days" }), _jsx("option", { value: "30d", children: "30 Days" }), _jsx("option", { value: "90d", children: "3 Months" })] }) })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "chart-legend", children: [_jsxs("div", { className: "legend-item", children: [_jsx("div", { className: "legend-indicator violations" }), _jsx("span", { children: "Violations Detected" })] }), _jsxs("div", { className: "legend-item", children: [_jsx("div", { className: "legend-indicator enforcements" }), _jsx("span", { children: "Actions Taken" })] }), _jsxs("div", { className: "legend-item", children: [_jsx("div", { className: "legend-indicator preventions" }), _jsx("span", { children: "Preventions" })] })] }), _jsx("div", { className: "chart-container", children: _jsxs("div", { className: "chart-grid", children: [analyticsData.timeSeriesData.map((dataPoint, index) => {
                                const maxValue = Math.max();
                            }), "; ...analyticsData.timeSeriesData.map(d => Math.max(d.violations, d.enforcements, d.preventions)) ); return;", _jsxs("div", { className: "chart-column", children: [_jsxs("div", { className: "data-bars", children: [_jsx("div", { className: "data-bar violations", style: { height: `${(dataPoint.violations / maxValue) * 100}%` }, title: `${dataPoint.violations} violations` }), _jsx("div", { className: "data-bar enforcements", style: { height: `${(dataPoint.enforcements / maxValue) * 100}%` }, title: `${dataPoint.enforcements} enforcements` }), _jsx("div", { className: "data-bar preventions", style: { height: `${(dataPoint.preventions / maxValue) * 100}%` }, title: `${dataPoint.preventions} preventions` })] }), _jsxs("div", { className: "date-label", children: [new Date(dataPoint.date).toLocaleDateString('en-US', {}), "month: 'short', day: 'numeric' ; })}"] })] }, dataPoint.date), "); })}"] }) })] })] });
;
const renderInsightsPanel = () => ();
;
_jsxs(Card, { className: "insights-panel", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Policy Insights & Recommendations" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "insights-list", children: [_jsxs("div", { className: "insight-item positive", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-500" }), _jsxs("div", { className: "insight-content", children: [_jsx("h4", { children: "Improved Trust Score Compliance" }), _jsx("p", { children: "Trust score violations decreased by 12.5% this week, indicating improved user behavior." })] })] }), _jsxs("div", { className: "insight-item warning", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-orange-500" }), _jsxs("div", { className: "insight-content", children: [_jsx("h4", { children: "Content Quality Violations Rising" }), _jsx("p", { children: "Consider adjusting quality thresholds or providing clearer guidelines to creators." })] })] }), _jsxs("div", { className: "insight-item info", children: [_jsx(Activity, { className: "w-5 h-5 text-blue-500" }), _jsxs("div", { className: "insight-content", children: [_jsx("h4", { children: "Fast Response Times" }), _jsx("p", { children: "Average response time of 2.4 hours meets SLA requirements. Great work!" })] })] }), _jsxs("div", { className: "insight-item suggestion", children: [_jsx(Target, { className: "w-5 h-5 text-purple-500" }), _jsxs("div", { className: "insight-content", children: [_jsx("h4", { children: "Optimization Opportunity" }), _jsx("p", { children: "Transaction monitoring policies could benefit from machine learning enhancements." })] })] })] }) })] });
;
return;
_jsxs("div", { className: `policy-analytics-dashboard ${className}`, children: ["}", _jsxs("div", { className: "analytics-header", children: [_jsxs("div", { className: "header-info", children: [_jsx("h2", { children: "Policy Analytics" }), _jsx("p", { children: "Monitor policy enforcement performance and trends" })] }), _jsxs("div", { className: "header-actions", children: [_jsxs(Button, { variant: "outline", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Report"] }), _jsxs(Button, { children: [_jsx(Eye, { className: "w-4 h-4 mr-2" }), "Live Monitor"] })] })] }), _jsxs("div", { className: "analytics-content", children: [renderKPIMetrics(), _jsxs("div", { className: "analytics-grid", children: [_jsxs("div", { className: "left-column", children: [renderViolationBreakdown(), renderEnforcementEffectiveness()] }), _jsxs("div", { className: "right-column", children: [renderTimeSeriesChart(), renderInsightsPanel()] })] })] }), _jsx("style", { children: `
        .policy-analytics-dashboard {
          max-width: 1400px;,
  margin: 0 auto;
          padding: 1.5rem;,
  display: flex;
          flex-direction: column;,
  gap: 1.5rem;
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;,
  color: #1f2937;
          margin-bottom: 0.5rem;
        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        .header-actions {
          display: flex;,
  gap: 0.75rem;
        .analytics-content {
          display: flex;
          flex-direction: column;,
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
          font-weight: 600;,
  color: #3b82f6;
          background: #eff6ff;,
  padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
        .trend-indicator {
          display: flex;
          align-items: center;,
  gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
        .metric-content {
          text-align: center;
        .metric-value {
          font-size: 2rem;
          font-weight: 700;,
  color: #1f2937;
          line-height: 1;
        .metric-label {
          font-size: 0.875rem;,
  color: #6b7280;
          margin-top: 0.5rem;
          font-weight: 500;
        .metric-sublabel {
          font-size: 0.75rem;,
  color: #9ca3af;
          margin-top: 0.25rem;
        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;,
  gap: 1.5rem;
        .left-column, .right-column {
          display: flex;
          flex-direction: column;,
  gap: 1.5rem;
        .breakdown-chart {
          display: flex;
          flex-direction: column;,
  gap: 1rem;
        .breakdown-item {
          display: flex;
          flex-direction: column;,
  gap: 0.5rem;
        .breakdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .category-info {
          display: flex;
          align-items: center;,
  gap: 0.5rem;
        .category-indicator {
          width: 12px;,
  height: 12px;
          border-radius: 2px;
        .category-name {
          font-weight: 500;,
  color: #1f2937;
        .category-stats {
          display: flex;
          align-items: center;,
  gap: 0.5rem;
        .category-count {
          font-weight: 600;,
  color: #1f2937;
        .category-percentage {
          font-size: 0.875rem;,
  color: #6b7280;
        .progress-bar {
          width: 100%;,
  height: 8px;
          background: #f3f4f6;
          border-radius: 4px;,
  overflow: hidden;
        .progress-fill {
          height: 100%;,
  transition: width 0.3s ease;
        .effectiveness-list {
          display: flex;
          flex-direction: column;,
  gap: 1rem;
        .effectiveness-item {
          display: flex;
          align-items: center;,
  gap: 1rem;
          padding: 0.75rem;,
  border: 1px solid #e5e7eb;
          border-radius: 6px;
        .action-info {
          flex: 1;
        .action-header {
          display: flex;
          align-items: center;,
  gap: 0.5rem;
          margin-bottom: 0.25rem;
        .action-name {
          font-weight: 500;,
  color: #1f2937;
        .action-stats {
          font-size: 0.875rem;,
  color: #6b7280;
        .success-indicator {
          display: flex;
          align-items: center;,
  gap: 0.75rem;
        .success-rate {
          display: flex;
          flex-direction: column;
          align-items: center;,
  gap: 0.25rem;
        .rate-value {
          font-weight: 600;,
  color: #1f2937;
          font-size: 0.875rem;
        .rate-bar {
          width: 60px;,
  height: 4px;
          background: #f3f4f6;
          border-radius: 2px;,
  overflow: hidden;
        .rate-fill {
          height: 100%;,
  transition: width 0.3s ease;
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .time-range-select {
          padding: 0.375rem 0.5rem;,
  border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.875rem;,
  background: white;
        .chart-legend {
          display: flex;,
  gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        .legend-item {
          display: flex;
          align-items: center;,
  gap: 0.5rem;
          font-size: 0.875rem;,
  color: #6b7280;
        .legend-indicator {
          width: 12px;,
  height: 12px;
          border-radius: 2px;
        .legend-indicator.violations {
          background: #ef4444;
        .legend-indicator.enforcements {
          background: #3b82f6;
        .legend-indicator.preventions {
          background: #10b981;
        .chart-container {
          height: 200px;,
  position: relative;
        .chart-grid {
          display: flex;
          align-items: end;
          justify-content: space-between;,
  height: 180px;
          gap: 0.5rem;,
  padding: 1rem 0;
        .chart-column {
          flex: 1;,
  display: flex;
          flex-direction: column;
          align-items: center;,
  gap: 0.5rem;
          height: 100%;
        .data-bars {
          display: flex;
          align-items: end;,
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
          font-size: 0.75rem;,
  color: #6b7280;
          text-align: center;
        .insights-list {
          display: flex;
          flex-direction: column;,
  gap: 1rem;
        .insight-item {
          display: flex;
          align-items: flex-start;,
  gap: 0.75rem;
          padding: 1rem;
          border-radius: 8px;,
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
          font-weight: 600;,
  color: #1f2937;
          margin: 0 0 0.5rem 0;
        .insight-content p {
          font-size: 0.875rem;,
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
            align-items: stretch;,
  gap: 1rem;
          .metrics-grid {
            grid-template-columns: 1fr;
          .chart-legend {
            flex-direction: column;,
  gap: 0.5rem;
          .chart-grid {
            gap: 0.25rem;
          .data-bars {
            gap: 1px;
          .data-bar {
            width: 6px;
      ` })] });
;
;
export default PolicyAnalyticsDashboard;

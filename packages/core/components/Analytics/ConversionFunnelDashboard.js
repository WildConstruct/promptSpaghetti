import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Conversion Funnel Dashboard - E17-1753114397418-21317A
 *
 * Comprehensive funnel analysis and conversion tracking visualization
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { conversionTracker } from '../../analytics/ConversionTracker';
export const ConversionFunnelDashboard = ({ _____conversionData, timeRange, loading }) => {
    const [selectedFunnel, setSelectedFunnel] = useState('director-onboarding');
    const [funnelMetrics, setFunnelMetrics] = useState(null);
    const [availableFunnels] = useState([
        { id: 'director-onboarding', name: 'Director Onboarding', category: 'activation' },
        { id: 'creative-workflow', name: 'Creative Workflow', category: 'activation' },
        { id: 'subscription-conversion', name: 'Trial to Paid', category: 'revenue' }
    ]);
    useEffect(() => {
        if (timeRange && selectedFunnel) {
            const metrics = conversionTracker.getFunnelMetrics(selectedFunnel, timeRange.startTime, timeRange.endTime);
            setFunnelMetrics(metrics);
        }
    }, [selectedFunnel, timeRange]);
    const renderFunnelVisualization = (metrics) => {
        if (!metrics || !metrics.metrics.dropoffPoints)
            return null;
        const steps = metrics.metrics.dropoffPoints;
        const maxUsers = Math.max(...steps.map(s => s.users));
        return (_jsxs("div", { className: "funnel-visualization", children: [_jsx("h4", { children: "Funnel Flow" }), _jsx("div", { className: "funnel-steps", children: steps.map((step, index) => {
                        const widthPercent = (step.users / maxUsers) * 100;
                        const conversionRate = index > 0
                            ? ((step.users / steps[0].users) * 100).toFixed(1)
                            : '100.0';
                        return (_jsxs("div", { className: "funnel-step", children: [_jsxs("div", { className: "step-info", children: [_jsx("div", { className: "step-name", children: step.step }), _jsxs("div", { className: "step-stats", children: [_jsxs("span", { className: "step-users", children: [step.users, " users"] }), _jsxs("span", { className: "step-rate", children: [conversionRate, "%"] })] })] }), _jsx("div", { className: "step-bar", children: _jsx("div", { className: "step-fill", style: { width: `${widthPercent}%` } }) }), step.dropoffRate > 0 && (_jsx("div", { className: "dropoff-indicator", children: _jsxs(Badge, { variant: "destructive", children: ["-", step.dropoffRate.toFixed(1), "% dropoff"] }) }))] }, step.step));
                    }) })] }));
    };
    const renderSegmentBreakdown = (metrics) => {
        if (!metrics || !metrics.segmentBreakdown)
            return null;
        return (_jsxs("div", { className: "segment-breakdown", children: [_jsx("h4", { children: "Conversion by Segment" }), _jsx("div", { className: "segment-grid", children: Object.entries(metrics.segmentBreakdown).map(([segment, data]) => (_jsxs("div", { className: "segment-card", children: [_jsx("div", { className: "segment-name", children: segment.replace('_', ' ') }), _jsxs("div", { className: "segment-metrics", children: [_jsxs("div", { className: "segment-rate", children: [data.rate.toFixed(1), "%"] }), _jsxs("div", { className: "segment-details", children: [data.conversions, "/", data.users, " converted"] })] })] }, segment))) })] }));
    };
    if (loading) {
        return (_jsxs("div", { className: "conversion-dashboard loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading conversion data..." })] }));
    }
    return (_jsxs("div", { className: "conversion-funnel-dashboard", children: [_jsx("div", { className: "dashboard-header", children: _jsx("div", { className: "header-controls", children: _jsxs(Select, { value: selectedFunnel, onValueChange: setSelectedFunnel, children: [_jsx(SelectTrigger, { className: "w-64", children: _jsx(SelectValue, { placeholder: "Select funnel" }) }), _jsx(SelectContent, { children: availableFunnels.map(funnel => (_jsx(SelectItem, { value: funnel.id, children: _jsxs("div", { className: "funnel-option", children: [_jsx("span", { children: funnel.name }), _jsx(Badge, { variant: "outline", children: funnel.category })] }) }, funnel.id))) })] }) }) }), funnelMetrics && (_jsxs("div", { className: "funnel-content", children: [_jsxs("div", { className: "summary-grid", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Total Users" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "summary-value", children: funnelMetrics.metrics.totalUsers }), _jsx("div", { className: "summary-subtitle", children: "Entered funnel" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Conversions" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "summary-value", children: funnelMetrics.metrics.conversions }), _jsx("div", { className: "summary-subtitle", children: "Completed funnel" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Conversion Rate" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "summary-value", children: [funnelMetrics.metrics.conversionRate.toFixed(1), "%"] }), _jsx("div", { className: "summary-subtitle", children: "Overall success rate" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Avg Time to Convert" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "summary-value", children: [Math.round(funnelMetrics.metrics.averageTimeToConvert / 60000), "min"] }), _jsx("div", { className: "summary-subtitle", children: "Completion time" })] })] })] }), _jsxs(Card, { className: "funnel-visualization-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Funnel Analysis" }) }), _jsx(CardContent, { children: renderFunnelVisualization(funnelMetrics) })] }), _jsxs(Card, { className: "segment-breakdown-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Segment Performance" }) }), _jsx(CardContent, { children: renderSegmentBreakdown(funnelMetrics) })] })] })), _jsx("style", { jsx: true, children: `
        .conversion-funnel-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .funnel-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .summary-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
        }

        .summary-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .funnel-visualization h4 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
        }

        .funnel-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .funnel-step {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .step-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .step-name {
          font-weight: 500;
          color: #374151;
        }

        .step-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .step-bar {
          height: 24px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .step-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          transition: width 0.3s ease;
        }

        .dropoff-indicator {
          align-self: flex-end;
          margin-top: 0.25rem;
        }

        .segment-breakdown h4 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
        }

        .segment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .segment-card {
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          text-align: center;
        }

        .segment-name {
          font-weight: 500;
          color: #374151;
          text-transform: capitalize;
          margin-bottom: 0.5rem;
        }

        .segment-rate {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .segment-details {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem;
          gap: 1rem;
        }

        .loading-spinner {
          width: 2rem;
          height: 2rem;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      ` })] }));
};
export default ConversionFunnelDashboard;

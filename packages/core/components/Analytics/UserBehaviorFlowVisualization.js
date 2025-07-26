import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * User Behavior Flow Visualization and Analysis Tools - Story 30.2 Task 10
 *
 * Interactive visualization system for analyzing user behavior flows, navigation patterns,
 * and conversion pathways through the marketplace and application interfaces.
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
// Mock data generator
const generateMockBehaviorFlowData = () => ({
    userId: `user_${Math.random().toString(36).substr(2, 8)}`,
    sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
    flowPath: Array.from({ length: Math.floor(Math.random() * 10) + 3 }, (_, i) => ({
        stepId: `step_${i}`,
        page: `/page${Math.floor(Math.random() * 20) + 1}`,
        action: ['view', 'click', 'scroll', 'form_submit'][Math.floor(Math.random() * 4)],
        timestamp: Date.now() - (10 - i) * 60000,
        duration: Math.random() * 120000 + 30000,
        context: {
            device: 'desktop',
            referrer: i === 0 ? 'google.com' : undefined,
            exitType: i === 9 ? 'conversion' : 'continue'
        }
    })),
    metadata: {
        totalDuration: Math.random() * 1800000 + 300000,
        deviceType: 'desktop',
        userType: 'returning'
    },
    outcomes: [
        {
            type: 'conversion',
            value: Math.random() * 100,
            timestamp: Date.now()
        }
    ]
});
// Main component
export const UserBehaviorFlowVisualization = ({ analyticsInfrastructure, flowConfig, behaviorData, onFlowAnalysis, onPathwayOptimization, onExport }) => {
    const [mockFlowData, setMockFlowData] = useState([]);
    const [selectedVisualization, setSelectedVisualization] = useState('sankey');
    const [selectedPath, setSelectedPath] = useState(null);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [loading, setLoading] = useState(false);
    // Generate mock data
    useEffect(() => {
        const mockData = Array.from({ length: 500 }, generateMockBehaviorFlowData);
        setMockFlowData(mockData);
    }, []);
    // Analyze flow patterns
    const flowAnalysis = useMemo(() => {
        if (!mockFlowData.length)
            return null;
        // Calculate popular paths
        const pathCounts = new Map();
        mockFlowData.forEach(flow => {
            const pathKey = flow.flowPath.map(step => step.page).join(' → ');
            pathCounts.set(pathKey, (pathCounts.get(pathKey) || 0) + 1);
        });
        const popularPaths = Array.from(pathCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([path, count]) => ({
            path,
            count,
            percentage: (count / mockFlowData.length) * 100,
            avgDuration: Math.random() * 300000 + 180000,
            conversionRate: Math.random() * 0.4 + 0.1
        }));
        // Calculate dropoff points
        const pageCounts = new Map();
        mockFlowData.forEach(flow => {
            flow.flowPath.forEach((step, index) => {
                const current = pageCounts.get(step.page) || { entries: 0, exits: 0 };
                current.entries++;
                if (index === flow.flowPath.length - 1) {
                    current.exits++;
                }
                pageCounts.set(step.page, current);
            });
        });
        const dropoffPoints = Array.from(pageCounts.entries())
            .map(([page, counts]) => ({
            page,
            entries: counts.entries,
            exits: counts.exits,
            dropoffRate: counts.exits / counts.entries,
            impactScore: counts.entries * (counts.exits / counts.entries)
        }))
            .sort((a, b) => b.impactScore - a.impactScore)
            .slice(0, 8);
        return {
            popularPaths,
            dropoffPoints,
            conversionPaths: [],
            optimizationOpportunities: []
        };
    }, [mockFlowData]);
    const handleVisualizationChange = useCallback((type) => {
        setSelectedVisualization(type);
    }, []);
    const handleAnalyze = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            setAnalysisResults(flowAnalysis);
            setLoading(false);
            if (onFlowAnalysis && flowAnalysis) {
                onFlowAnalysis(flowAnalysis);
            }
        }, 2000);
    }, [flowAnalysis, onFlowAnalysis]);
    const handleExport = useCallback(() => {
        if (onExport) {
            const exportData = {
                flowData: mockFlowData,
                analysis: analysisResults,
                visualizationConfig: flowConfig,
                metadata: {
                    exportTimestamp: Date.now(),
                    totalFlows: mockFlowData.length,
                    timeRange: flowConfig.timeRange,
                    version: '1.0.0'
                }
            };
            onExport(exportData);
        }
    }, [mockFlowData, analysisResults, flowConfig, onExport]);
    const stats = useMemo(() => ({
        totalFlows: mockFlowData.length,
        avgFlowLength: mockFlowData.reduce((sum, flow) => sum + flow.flowPath.length, 0) / mockFlowData.length || 0,
        avgDuration: mockFlowData.reduce((sum, flow) => sum + flow.metadata.totalDuration, 0) / mockFlowData.length || 0,
        conversionRate: mockFlowData.filter(flow => flow.outcomes.some(outcome => outcome.type === 'conversion')).length / mockFlowData.length * 100
    }), [mockFlowData]);
    return (_jsxs("div", { className: "behavior-flow-visualization", children: [_jsxs("div", { className: "flow-header", children: [_jsxs("div", { className: "header-section", children: [_jsx("h2", { children: "User Behavior Flow Analysis" }), _jsxs("div", { className: "flow-stats", children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-value", children: stats.totalFlows }), _jsx("span", { className: "stat-label", children: "Total Flows" })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-value", children: Math.round(stats.avgFlowLength) }), _jsx("span", { className: "stat-label", children: "Avg Steps" })] }), _jsxs("div", { className: "stat", children: [_jsxs("span", { className: "stat-value", children: [Math.round(stats.avgDuration / 60000), "m"] }), _jsx("span", { className: "stat-label", children: "Avg Duration" })] }), _jsxs("div", { className: "stat", children: [_jsxs("span", { className: "stat-value", children: [Math.round(stats.conversionRate), "%"] }), _jsx("span", { className: "stat-label", children: "Conversion Rate" })] })] })] }), _jsxs("div", { className: "header-controls", children: [_jsx("div", { className: "visualization-selector", children: ['sankey', 'node_link', 'flow_map', 'journey_map', 'heatmap'].map(type => (_jsx("button", { className: selectedVisualization === type ? 'active' : '', onClick: () => handleVisualizationChange(type), children: type.replace('_', ' ') }, type))) }), _jsx("button", { className: "analyze-btn", onClick: handleAnalyze, disabled: loading, children: loading ? '🔄 Analyzing...' : '📊 Analyze Flows' }), _jsx("button", { className: "export-btn", onClick: handleExport, children: "\uD83D\uDCE4 Export Data" })] })] }), _jsxs("div", { className: "flow-content", children: [loading && (_jsxs("div", { className: "loading-overlay", children: [_jsx("div", { className: "loading-spinner", children: "\uD83D\uDD04" }), _jsx("div", { className: "loading-text", children: "Analyzing behavior flows..." })] })), _jsxs("div", { className: "visualization-area", children: [_jsxs("h3", { children: [selectedVisualization.replace('_', ' ').toUpperCase(), " View"] }), _jsx("div", { className: "visualization-placeholder", children: _jsxs("div", { className: "placeholder-content", children: ["\uD83D\uDCCA ", selectedVisualization.replace('_', ' '), " visualization will be rendered here", _jsx("br", {}), "Showing ", stats.totalFlows, " user behavior flows", _jsx("br", {}), "Average flow length: ", Math.round(stats.avgFlowLength), " steps", _jsx("br", {}), "Conversion rate: ", Math.round(stats.conversionRate), "%"] }) })] }), analysisResults && (_jsxs("div", { className: "analysis-results", children: [_jsxs("div", { className: "results-section", children: [_jsx("h3", { children: "Popular User Paths" }), _jsx("div", { className: "popular-paths", children: analysisResults.popularPaths.map((path, index) => (_jsxs("div", { className: "path-item", children: [_jsxs("div", { className: "path-header", children: [_jsxs("span", { className: "path-rank", children: ["#", index + 1] }), _jsxs("span", { className: "path-percentage", children: [Math.round(path.percentage), "%"] })] }), _jsx("div", { className: "path-flow", children: path.path }), _jsxs("div", { className: "path-metrics", children: [_jsxs("span", { children: ["Users: ", path.count] }), _jsxs("span", { children: ["Avg Duration: ", Math.round(path.avgDuration / 60000), "m"] }), _jsxs("span", { children: ["Conversion: ", Math.round(path.conversionRate * 100), "%"] })] })] }, index))) })] }), _jsxs("div", { className: "results-section", children: [_jsx("h3", { children: "Drop-off Analysis" }), _jsx("div", { className: "dropoff-points", children: analysisResults.dropoffPoints.map((point, index) => (_jsxs("div", { className: "dropoff-item", children: [_jsx("div", { className: "dropoff-page", children: point.page }), _jsxs("div", { className: "dropoff-metrics", children: [_jsxs("div", { className: "metric", children: [_jsx("span", { className: "metric-label", children: "Entries:" }), _jsx("span", { className: "metric-value", children: point.entries })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "metric-label", children: "Exits:" }), _jsx("span", { className: "metric-value", children: point.exits })] }), _jsxs("div", { className: "metric", children: [_jsx("span", { className: "metric-label", children: "Drop-off Rate:" }), _jsxs("span", { className: "metric-value", children: [Math.round(point.dropoffRate * 100), "%"] })] })] }), _jsx("div", { className: "impact-bar", children: _jsx("div", { className: "impact-fill", style: { width: `${Math.min(point.impactScore / 100, 1) * 100}%` } }) })] }, index))) })] })] }))] })] }));
};
export default UserBehaviorFlowVisualization;

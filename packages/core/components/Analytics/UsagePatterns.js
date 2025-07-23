import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Alert, AlertDescription } from '../ui/Alert';
import { Activity, Calendar, Clock, MousePointer, Route, Eye, Map } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
/**
 * Canvas heat map component
 */
const CanvasHeatMap = ({ data, width = 600, height = 400 }) => {
    const canvasRef = React.useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data.length)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        // Find max intensity for normalization
        const maxIntensity = Math.max(...data.map(d => d.intensity));
        const minIntensity = Math.min(...data.map(d => d.intensity));
        // Draw heat map points
        data.forEach(point => {
            const normalized = (point.intensity - minIntensity) / (maxIntensity - minIntensity);
            const alpha = Math.max(0.1, normalized);
            // Create radial gradient for each point
            const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 20);
            gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha})`);
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 20, 0, 2 * Math.PI);
            ctx.fill();
        });
    }, [data, width, height]);
    return (_jsxs("div", { className: "heat-map-container", children: [_jsx("canvas", { ref: canvasRef, width: width, height: height, className: "border border-gray-200 rounded" }), _jsx("div", { className: "heat-map-legend", children: _jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600 mt-2", children: [_jsx("span", { children: "Less Activity" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-4 h-4 bg-blue-200 rounded" }), _jsx("div", { className: "w-4 h-4 bg-blue-400 rounded" }), _jsx("div", { className: "w-4 h-4 bg-blue-600 rounded" })] }), _jsx("span", { children: "More Activity" })] }) })] }));
};
/**
 * User journey flow component
 */
const UserJourneyFlow = ({ journeyData }) => {
    if (!journeyData || journeyData.length === 0) {
        return (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No journey data available" }));
    }
    return (_jsx("div", { className: "journey-flow", children: _jsx("div", { className: "space-y-4", children: journeyData.slice(0, 10).map((flow, index) => (_jsx("div", { className: "flow-item", children: _jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: "outline", children: index + 1 }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium", children: flow.sourceStep }), _jsx(Route, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "font-medium", children: flow.targetStep })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-semibold", children: [flow.userCount, " users"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [flow.percentage.toFixed(1), "%"] })] })] }) }, index))) }) }));
};
/**
 * Usage patterns component
 */
export const UsagePatterns = ({ analyticsClient, timeRange, _____userId, _____organizationId }) => {
    const [state, setState] = useState({
        loading: true,
        error: null,
        heatMapData: [],
        hourlyPattern: null,
        dailyPattern: null,
        weeklyPattern: null,
        journeyFlows: [],
        selectedPattern: 'hourly'
    });
    /**
     * Load usage patterns data
     */
    const loadUsageData = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const [heatMapResponse, hourlyResponse, dailyResponse, weeklyResponse] = await Promise.all([
                analyticsClient.getHeatMap(timeRange),
                analyticsClient.getUsagePatterns('hourly'),
                analyticsClient.getUsagePatterns('daily'),
                analyticsClient.getUsagePatterns('weekly')
            ]);
            if (!heatMapResponse.success) {
                throw new Error('Failed to load heat map data');
            }
            // Generate mock journey flows data
            const mockJourneyFlows = [
                { sourceStep: 'Landing', targetStep: 'Node Creation', userCount: 150, percentage: 25.5, averageTime: 30000, successRate: 0.85 },
                { sourceStep: 'Node Creation', targetStep: 'Connection', userCount: 120, percentage: 20.4, averageTime: 45000, successRate: 0.92 },
                { sourceStep: 'Connection', targetStep: 'Execution', userCount: 110, percentage: 18.7, averageTime: 60000, successRate: 0.88 },
                { sourceStep: 'Execution', targetStep: 'Results', userCount: 95, percentage: 16.2, averageTime: 15000, successRate: 0.95 },
                { sourceStep: 'Results', targetStep: 'Export', userCount: 40, percentage: 6.8, averageTime: 20000, successRate: 0.98 },
                { sourceStep: 'Node Creation', targetStep: 'Template', userCount: 35, percentage: 5.9, averageTime: 25000, successRate: 0.90 },
                { sourceStep: 'Template', targetStep: 'Execution', userCount: 30, percentage: 5.1, averageTime: 35000, successRate: 0.87 },
                { sourceStep: 'Execution', targetStep: 'Save', userCount: 25, percentage: 4.3, averageTime: 12000, successRate: 0.96 }
            ];
            setState(prev => ({
                ...prev,
                loading: false,
                heatMapData: heatMapResponse.data || [],
                hourlyPattern: hourlyResponse.success ? hourlyResponse.data : null,
                dailyPattern: dailyResponse.success ? dailyResponse.data : null,
                weeklyPattern: weeklyResponse.success ? weeklyResponse.data : null,
                journeyFlows: mockJourneyFlows
            }));
        }
        catch (error) {
            console.error('Failed to load usage data:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to load usage data'
            }));
        }
    }, [analyticsClient, timeRange]);
    /**
     * Handle pattern selection change
     */
    const handlePatternChange = useCallback((pattern) => {
        setState(prev => ({ ...prev, selectedPattern: pattern }));
    }, []);
    /**
     * Get current pattern data
     */
    const getCurrentPatternData = useCallback(() => {
        switch (state.selectedPattern) {
            case 'hourly':
                return state.hourlyPattern;
            case 'daily':
                return state.dailyPattern;
            case 'weekly':
                return state.weeklyPattern;
            default:
                return null;
        }
    }, [state.selectedPattern, state.hourlyPattern, state.dailyPattern, state.weeklyPattern]);
    /**
     * Format pattern data for charts
     */
    const formatPatternData = useCallback((patternData) => {
        if (!patternData || !patternData.data)
            return [];
        return patternData.data.map((item) => ({
            period: new Date(item.period).toLocaleDateString(),
            value: item.value,
            timestamp: new Date(item.period).getTime()
        }));
    }, []);
    /**
     * Generate hourly distribution data
     */
    const generateHourlyDistribution = useCallback(() => {
        if (!state.hourlyPattern || !state.hourlyPattern.data)
            return [];
        const hourlyData = new Array(24).fill(0);
        state.hourlyPattern.data.forEach((item) => {
            const hour = new Date(item.period).getHours();
            hourlyData[hour] += item.value;
        });
        return hourlyData.map((value, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            value,
            percentage: (value / Math.max(...hourlyData)) * 100
        }));
    }, [state.hourlyPattern]);
    /**
     * Load data on mount
     */
    useEffect(() => {
        loadUsageData();
    }, [loadUsageData]);
    if (state.loading) {
        return (_jsx("div", { className: "usage-patterns", children: _jsxs("div", { className: "loading-container", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading usage patterns..." })] }) }));
    }
    if (state.error) {
        return (_jsx("div", { className: "usage-patterns", children: _jsx(Alert, { variant: "destructive", children: _jsxs(AlertDescription, { children: [state.error, _jsx(Button, { variant: "outline", size: "sm", onClick: loadUsageData, className: "ml-2", children: "Retry" })] }) }) }));
    }
    const currentPattern = getCurrentPatternData();
    const patternChartData = formatPatternData(currentPattern);
    const hourlyDistribution = generateHourlyDistribution();
    return (_jsx("div", { className: "usage-patterns", children: _jsxs(Tabs, { defaultValue: "patterns", className: "w-full", children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-full", children: [_jsx(TabsTrigger, { value: "patterns", children: "Time Patterns" }), _jsx(TabsTrigger, { value: "heatmap", children: "Heat Map" }), _jsx(TabsTrigger, { value: "journeys", children: "User Journeys" }), _jsx(TabsTrigger, { value: "insights", children: "Insights" })] }), _jsxs(TabsContent, { value: "patterns", className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Usage Time Patterns" }), _jsxs(Select, { value: state.selectedPattern, onValueChange: handlePatternChange, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "hourly", children: "Hourly Pattern" }), _jsx(SelectItem, { value: "daily", children: "Daily Pattern" }), _jsx(SelectItem, { value: "weekly", children: "Weekly Pattern" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: "Trend Direction" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-5 h-5 text-blue-600" }), _jsx("span", { className: "text-lg font-semibold", children: currentPattern?.trend || 'stable' })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: "Change Rate" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-2xl font-bold text-green-600", children: [currentPattern?.changePercent?.toFixed(1) || 0, "%"] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: "Data Points" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-purple-600", children: patternChartData.length }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5" }), state.selectedPattern.charAt(0).toUpperCase() + state.selectedPattern.slice(1), " Usage"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: patternChartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "period" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Area, { type: "monotone", dataKey: "value", stroke: "#3B82F6", fill: "#3B82F6", fillOpacity: 0.6 })] }) }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-5 h-5" }), "Hourly Distribution"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: hourlyDistribution, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "hour" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "value", fill: "#10B981" })] }) }) }) })] })] })] }), _jsx(TabsContent, { value: "heatmap", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(MousePointer, { className: "w-5 h-5" }), "Canvas Interaction Heat Map"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Heat map shows areas of high user interaction on the canvas. Brighter areas indicate more frequent interactions." }), state.heatMapData.length > 0 ? (_jsx(CanvasHeatMap, { data: state.heatMapData })) : (_jsx("div", { className: "h-64 flex items-center justify-center text-gray-500 border border-gray-200 rounded", children: "No interaction data available for heat map" })), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: state.heatMapData.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Hot Spots" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: state.heatMapData.reduce((sum, point) => sum + point.intensity, 0) }), _jsx("div", { className: "text-sm text-gray-600", children: "Total Interactions" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: state.heatMapData.length > 0 ?
                                                                (state.heatMapData.reduce((sum, point) => sum + point.intensity, 0) / state.heatMapData.length).toFixed(1) :
                                                                '0' }), _jsx("div", { className: "text-sm text-gray-600", children: "Avg Intensity" })] })] })] }) })] }) }), _jsxs(TabsContent, { value: "journeys", className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Route, { className: "w-5 h-5" }), "User Journey Flows"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Most common user flows through the application, showing how users navigate between different actions." }), _jsx(UserJourneyFlow, { journeyData: state.journeyFlows })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: "Total Flows" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-blue-600", children: state.journeyFlows.length }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: "Most Common" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-sm font-medium", children: [state.journeyFlows[0]?.sourceStep || 'N/A', " \u2192 ", state.journeyFlows[0]?.targetStep || 'N/A'] }), _jsxs("div", { className: "text-xs text-gray-600", children: [state.journeyFlows[0]?.userCount || 0, " users"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: "Avg Success Rate" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-2xl font-bold text-green-600", children: [state.journeyFlows.length > 0 ?
                                                        (state.journeyFlows.reduce((sum, flow) => sum + flow.successRate, 0) / state.journeyFlows.length * 100).toFixed(1) :
                                                        '0', "%"] }) })] })] })] }), _jsx(TabsContent, { value: "insights", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Eye, { className: "w-5 h-5" }), "Usage Insights"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-3 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "font-medium text-blue-900", children: "Peak Usage Hours" }), _jsx("div", { className: "text-sm text-blue-700", children: "Most activity occurs between 9 AM - 11 AM and 2 PM - 4 PM" })] }), _jsxs("div", { className: "p-3 bg-green-50 rounded-lg", children: [_jsx("div", { className: "font-medium text-green-900", children: "User Flow Optimization" }), _jsx("div", { className: "text-sm text-green-700", children: "85% of users follow the standard creation \u2192 connection \u2192 execution flow" })] }), _jsxs("div", { className: "p-3 bg-yellow-50 rounded-lg", children: [_jsx("div", { className: "font-medium text-yellow-900", children: "Attention Needed" }), _jsx("div", { className: "text-sm text-yellow-700", children: "15% drop-off rate between execution and results viewing" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Map, { className: "w-5 h-5" }), "Improvement Opportunities"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "border-l-4 border-blue-500 pl-4", children: [_jsx("div", { className: "font-medium", children: "Reduce Canvas Complexity" }), _jsx("div", { className: "text-sm text-gray-600", children: "High interaction density in center areas suggests UI overcrowding" })] }), _jsxs("div", { className: "border-l-4 border-green-500 pl-4", children: [_jsx("div", { className: "font-medium", children: "Optimize for Peak Hours" }), _jsx("div", { className: "text-sm text-gray-600", children: "Scale resources during 9-11 AM and 2-4 PM peak periods" })] }), _jsxs("div", { className: "border-l-4 border-orange-500 pl-4", children: [_jsx("div", { className: "font-medium", children: "Improve Results Display" }), _jsx("div", { className: "text-sm text-gray-600", children: "Add better visual feedback for execution completion" })] })] }) })] })] }) })] }) }));
};
export default UsagePatterns;

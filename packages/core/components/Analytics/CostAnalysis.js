import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Input } from '../ui/Input.js';
import { Label } from '../ui/Label.js';
import { Progress } from '../ui/Progress.js';
import { Alert, AlertDescription } from '../ui/Alert.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs.js';
import { DollarSign, TrendingUp, AlertCircle, PieChart, BarChart3 } from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
/**
 * Budget card component
 */
const BudgetCard = ({ budget, usage, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        amount: budget.amount,
        alertThresholds: budget.alertThresholds || [75, 90]
    });
    const handleSave = () => {
        onUpdate(budget.id, editForm);
        setIsEditing(false);
    };
    const getStatusColor = (percentage) => {
        if (percentage >= 90)
            return 'bg-red-500';
        if (percentage >= 75)
            return 'bg-yellow-500';
        return 'bg-green-500';
    };
    const getStatusText = (percentage) => {
        if (percentage >= 100)
            return 'Exceeded';
        if (percentage >= 90)
            return 'Critical';
        if (percentage >= 75)
            return 'Warning';
        return 'On Track';
    };
    return (_jsxs(Card, { className: "budget-card", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: budget.name }), _jsxs("div", { className: "text-sm text-gray-500", children: [budget.period, " budget"] })] }), _jsx(Badge, { variant: usage?.percentageUsed >= 90 ? 'destructive' : usage?.percentageUsed >= 75 ? 'warning' : 'secondary', children: getStatusText(usage?.percentageUsed || 0) })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Used" }), _jsxs("span", { children: [usage?.percentageUsed?.toFixed(1) || 0, "%"] })] }), _jsx(Progress, { value: usage?.percentageUsed || 0, className: `h-2 ${getStatusColor(usage?.percentageUsed || 0)}` }), _jsxs("div", { className: "flex justify-between text-sm text-gray-600", children: [_jsxs("span", { children: ["$", usage?.amountUsed?.toFixed(2) || '0.00'] }), _jsxs("span", { children: ["$", budget.amount.toFixed(2)] })] })] }), isEditing ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "amount", children: "Budget Amount" }), _jsx(Input, { id: "amount", type: "number", value: editForm.amount, onChange: (e) => setEditForm(prev => ({ ...prev, amount: parseFloat(e.target.value) })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "thresholds", children: "Alert Thresholds (%)" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { type: "number", value: editForm.alertThresholds[0], onChange: (e) => setEditForm(prev => ({
                                                        ...prev,
                                                        alertThresholds: [parseFloat(e.target.value), prev.alertThresholds[1]]
                                                    })), placeholder: "Warning" }), _jsx(Input, { type: "number", value: editForm.alertThresholds[1], onChange: (e) => setEditForm(prev => ({
                                                        ...prev,
                                                        alertThresholds: [prev.alertThresholds[0], parseFloat(e.target.value)]
                                                    })), placeholder: "Critical" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", onClick: handleSave, children: "Save" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => setIsEditing(false), children: "Cancel" })] })] })) : (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Remaining" }), _jsxs("span", { className: "text-sm font-medium", children: ["$", usage?.amountRemaining?.toFixed(2) || budget.amount.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Transactions" }), _jsx("span", { className: "text-sm", children: usage?.transactionCount || 0 })] }), _jsx(Button, { size: "sm", variant: "outline", className: "w-full", onClick: () => setIsEditing(true), children: "Edit Budget" })] }))] }) })] }));
};
/**
 * Cost forecast chart component
 */
const CostForecastChart = ({ forecastData, loading }) => {
    if (loading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Cost Forecast" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }) }) })] }));
    }
    if (!forecastData) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Cost Forecast" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center text-gray-500", children: "No forecast data available" }) })] }));
    }
    const chartData = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        projected: forecastData.forecastedDailyCost * (i + 1),
        lower: forecastData.confidenceInterval.lower * (i + 1) / 30,
        upper: forecastData.confidenceInterval.upper * (i + 1) / 30
    }));
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5" }), "Cost Forecast (30 days)"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: ["$", forecastData.forecastedTotalCost.toFixed(2)] }), _jsx("div", { className: "text-sm text-gray-600", children: "Projected Total" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: ["$", forecastData.forecastedDailyCost.toFixed(2)] }), _jsx("div", { className: "text-sm text-gray-600", children: "Daily Average" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: forecastData.basedOnDays }), _jsx("div", { className: "text-sm text-gray-600", children: "Days of Data" })] })] }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "day" }), _jsx(YAxis, { tickFormatter: (value) => `$${value.toFixed(0)}` }), _jsx(Tooltip, { formatter: (value) => [`$${value.toFixed(2)}`, 'Cost'] }), _jsx(Line, { type: "monotone", dataKey: "projected", stroke: "#3B82F6", strokeWidth: 2, name: "Projected" }), _jsx(Line, { type: "monotone", dataKey: "lower", stroke: "#10B981", strokeWidth: 1, strokeDasharray: "5 5", name: "Lower Bound" }), _jsx(Line, { type: "monotone", dataKey: "upper", stroke: "#EF4444", strokeWidth: 1, strokeDasharray: "5 5", name: "Upper Bound" })] }) }) })] }) })] }));
};
/**
 * Cost analysis component
 */
export const CostAnalysis = ({ analyticsClient, timeRange, userId, organizationId }) => {
    const [state, setState] = useState({
        loading: true,
        costSummary: null,
        forecast: null,
        budgets: [],
        budgetUsage: new Map(),
        recommendations: [],
        error: null
    });
    /**
     * Load cost data
     */
    const loadCostData = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const [costResponse, forecastResponse, budgetsResponse, recommendationsResponse] = await Promise.all([
                analyticsClient.getCostSummary(timeRange, userId, organizationId),
                analyticsClient.getCostForecast(30, userId, organizationId),
                analyticsClient.getBudgets(userId, organizationId),
                analyticsClient.getRecommendations(userId, organizationId)
            ]);
            if (!costResponse.success) {
                throw new Error(costResponse.error || 'Failed to load cost summary');
            }
            // Load budget usage for each budget
            const budgetUsageMap = new Map();
            if (budgetsResponse.success && budgetsResponse.data) {
                for (const budget of budgetsResponse.data) {
                    try {
                        const usageResponse = await analyticsClient.getBudgetUsage(budget.id);
                        if (usageResponse.success) {
                            budgetUsageMap.set(budget.id, usageResponse.data);
                        }
                    }
                    catch (error) {
                        console.warn(`Failed to load usage for budget ${budget.id}:`, error);
                    }
                }
            }
            setState(prev => ({
                ...prev,
                loading: false,
                costSummary: costResponse.data,
                forecast: forecastResponse.success ? forecastResponse.data : null,
                budgets: budgetsResponse.success ? budgetsResponse.data : [],
                budgetUsage: budgetUsageMap,
                recommendations: recommendationsResponse.success ? recommendationsResponse.data : []
            }));
        }
        catch (error) {
            console.error('Failed to load cost data:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to load cost data'
            }));
        }
    }, [analyticsClient, timeRange, userId, organizationId]);
    /**
     * Create new budget
     */
    const handleCreateBudget = useCallback(async (budgetData) => {
        try {
            const response = await analyticsClient.createBudget(budgetData);
            if (response.success) {
                loadCostData(); // Refresh data
            }
        }
        catch (error) {
            console.error('Failed to create budget:', error);
        }
    }, [analyticsClient, loadCostData]);
    /**
     * Update budget
     */
    const handleUpdateBudget = useCallback(async (budgetId, updates) => {
        try {
            const response = await analyticsClient.updateBudget(budgetId, updates);
            if (response.success) {
                loadCostData(); // Refresh data
            }
        }
        catch (error) {
            console.error('Failed to update budget:', error);
        }
    }, [analyticsClient, loadCostData]);
    /**
     * Load data on mount
     */
    useEffect(() => {
        loadCostData();
    }, [loadCostData]);
    if (state.loading) {
        return (_jsx("div", { className: "cost-analysis", children: _jsxs("div", { className: "loading-container", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading cost analysis..." })] }) }));
    }
    if (state.error) {
        return (_jsx("div", { className: "cost-analysis", children: _jsxs(Alert, { variant: "destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [state.error, _jsx(Button, { variant: "outline", size: "sm", onClick: loadCostData, className: "ml-2", children: "Retry" })] })] }) }));
    }
    const costSummary = state.costSummary || {};
    const providerData = Array.from(costSummary.costByProvider || []).map(([provider, cost]) => ({
        name: provider,
        value: cost
    }));
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    return (_jsx("div", { className: "cost-analysis", children: _jsxs(Tabs, { defaultValue: "overview", className: "w-full", children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-full", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "budgets", children: "Budgets" }), _jsx(TabsTrigger, { value: "forecast", children: "Forecast" }), _jsx(TabsTrigger, { value: "recommendations", children: "Recommendations" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: "Total Cost" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: ["$", costSummary.totalCost?.toFixed(2) || '0.00'] }), _jsx("div", { className: "text-sm text-gray-500", children: "This period" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: "Total Tokens" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: (costSummary.totalTokens || 0).toLocaleString() }), _jsx("div", { className: "text-sm text-gray-500", children: "Tokens consumed" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: "Avg Cost/Transaction" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-orange-600", children: ["$", costSummary.averageCostPerTransaction?.toFixed(3) || '0.000'] }), _jsx("div", { className: "text-sm text-gray-500", children: "Per execution" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm text-gray-600", children: "Transactions" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: costSummary.transactionCount || 0 }), _jsx("div", { className: "text-sm text-gray-500", children: "Total executions" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(PieChart, { className: "w-5 h-5" }), "Cost by Provider"] }) }), _jsx(CardContent, { children: providerData.length > 0 ? (_jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(RechartsPieChart, { children: [_jsx(Pie, { data: providerData, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: providerData.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => `$${value.toFixed(2)}` })] }) }) })) : (_jsx("div", { className: "h-64 flex items-center justify-center text-gray-500", children: "No provider data available" })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5" }), "Top Models"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: (costSummary.topModels || []).slice(0, 5).map((model, index) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", children: index + 1 }), _jsx("span", { className: "font-medium", children: model.model })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-semibold", children: ["$", model.cost.toFixed(2)] }), _jsxs("div", { className: "text-sm text-gray-600", children: [model.tokens.toLocaleString(), " tokens"] })] })] }, model.model))) }) })] })] })] }), _jsxs(TabsContent, { value: "budgets", className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Budget Management" }), _jsx(Button, { onClick: () => {
                                        const name = prompt('Budget name:');
                                        const amount = prompt('Budget amount:');
                                        const period = prompt('Budget period (daily/weekly/monthly/yearly):');
                                        if (name && amount && period) {
                                            handleCreateBudget({
                                                name,
                                                amount: parseFloat(amount),
                                                period,
                                                userId,
                                                organizationId
                                            });
                                        }
                                    }, children: "Create Budget" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: state.budgets.map((budget) => (_jsx(BudgetCard, { budget: budget, usage: state.budgetUsage.get(budget.id), onUpdate: handleUpdateBudget }, budget.id))) }), state.budgets.length === 0 && (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No budgets configured. Create your first budget to start tracking costs." }))] }), _jsx(TabsContent, { value: "forecast", className: "space-y-6", children: _jsx(CostForecastChart, { forecastData: state.forecast, loading: state.loading }) }), _jsxs(TabsContent, { value: "recommendations", className: "space-y-6", children: [_jsx("div", { className: "space-y-4", children: state.recommendations.map((rec, index) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: rec.title }), _jsx(Badge, { variant: rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'warning' : 'secondary', children: rec.priority })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-gray-600", children: rec.description }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-4 h-4 text-green-600" }), _jsxs("span", { className: "text-sm font-medium", children: ["Potential savings: $", rec.estimatedSavings?.toFixed(2) || '0.00'] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "text-sm font-medium", children: "Action Items:" }), _jsx("ul", { className: "text-sm text-gray-600 space-y-1", children: rec.actionItems?.map((item, i) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-blue-600", children: "\u2022" }), item] }, i))) })] })] }) })] }, index))) }), state.recommendations.length === 0 && (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No recommendations available at this time." }))] })] }) }));
};
export default CostAnalysis;

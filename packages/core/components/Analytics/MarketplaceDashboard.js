import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Marketplace Dashboard - E17-1753114397415-AFF06F
 *
 * Comprehensive marketplace analytics dashboard for business intelligence
 * and template performance tracking
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useMarketplaceMetrics } from '../../hooks/useMarketplaceMetrics';
import { TrendingUp, DollarSign, Download, Search, Users, Star, Target } from 'lucide-react';
export const MarketplaceDashboard = ({ userId, userRole = 'director', timeRange = '30d', className = '' }) => {
    const { dashboardData, insights, isLoading, getTopPerformingTemplates, getSearchAnalytics, refreshData } = useMarketplaceMetrics({ userRole });
    const [selectedMetric, setSelectedMetric] = useState('revenue');
    const [topTemplates, setTopTemplates] = useState([]);
    const [searchData, setSearchData] = useState(null);
    useEffect(() => {
        if (!isLoading && dashboardData) {
            const templates = getTopPerformingTemplates(selectedMetric, 10);
            const search = getSearchAnalytics();
            setTopTemplates(templates);
            setSearchData(search);
        }
    }, [isLoading, dashboardData, selectedMetric, getTopPerformingTemplates, getSearchAnalytics]);
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };
    const renderOverviewMetrics = () => {
        if (!dashboardData)
            return null;
        const { overview, trends } = dashboardData;
        return (_jsx("div", { className: "overview-metrics", children: _jsxs("div", { className: "metrics-grid", children: [_jsxs(Card, { className: "metric-card revenue", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "metric-title", children: [_jsx(DollarSign, { className: "w-5 h-5" }), "Total Revenue"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "metric-value", children: formatCurrency(overview.totalRevenue) }), _jsxs("div", { className: "metric-trend", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-green-500" }), _jsxs("span", { className: "trend-value", children: ["+", trends.revenueGrowth.toFixed(1), "%"] }), _jsx("span", { className: "trend-period", children: "vs last period" })] })] })] }), _jsxs(Card, { className: "metric-card transactions", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "metric-title", children: [_jsx(Download, { className: "w-5 h-5" }), "Transactions"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "metric-value", children: formatNumber(overview.totalTransactions) }), _jsxs("div", { className: "metric-trend", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-green-500" }), _jsxs("span", { className: "trend-value", children: ["+", trends.transactionGrowth.toFixed(1), "%"] }), _jsx("span", { className: "trend-period", children: "vs last period" })] })] })] }), _jsxs(Card, { className: "metric-card templates", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "metric-title", children: [_jsx(Target, { className: "w-5 h-5" }), "Active Templates"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "metric-value", children: overview.activeTemplates }), _jsx("div", { className: "metric-subtitle", children: "Live in marketplace" })] })] }), _jsxs(Card, { className: "metric-card creators", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "metric-title", children: [_jsx(Users, { className: "w-5 h-5" }), "Active Creators"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "metric-value", children: overview.activeCreators }), _jsxs("div", { className: "metric-trend", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-green-500" }), _jsxs("span", { className: "trend-value", children: ["+", trends.userGrowth.toFixed(1), "%"] }), _jsx("span", { className: "trend-period", children: "growth rate" })] })] })] }), _jsxs(Card, { className: "metric-card rating", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "metric-title", children: [_jsx(Star, { className: "w-5 h-5" }), "Average Rating"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "metric-value", children: overview.averageRating.toFixed(1) }), _jsx("div", { className: "rating-stars", children: [...Array(5)].map((_, i) => (_jsx(Star, { className: `w-4 h-4 ${i < Math.floor(overview.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}` }, i))) })] })] }), _jsxs(Card, { className: "metric-card conversion", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "metric-title", children: [_jsx(Target, { className: "w-5 h-5" }), "Conversion Rate"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-value", children: [overview.conversionRate.toFixed(1), "%"] }), _jsx("div", { className: "metric-subtitle", children: "View to purchase" })] })] })] }) }));
    };
    const renderTopCategories = () => {
        if (!dashboardData?.trends.topCategories)
            return null;
        return (_jsxs(Card, { className: "top-categories-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Top Performing Categories" }) }), _jsx(CardContent, { children: _jsx("div", { className: "categories-list", children: dashboardData.trends.topCategories.map((category, index) => (_jsxs("div", { className: "category-item", children: [_jsxs("div", { className: "category-info", children: [_jsxs("div", { className: "category-rank", children: ["#", index + 1] }), _jsxs("div", { className: "category-details", children: [_jsx("div", { className: "category-name", children: category.category }), _jsx("div", { className: "category-revenue", children: formatCurrency(category.revenue) })] })] }), _jsx("div", { className: "category-growth", children: _jsxs(Badge, { variant: category.growth > 0 ? 'default' : 'secondary', children: [category.growth > 0 ? '+' : '', category.growth.toFixed(1), "%"] }) })] }, category.category))) }) })] }));
    };
    const renderTopTemplates = () => {
        return (_jsxs(Card, { className: "top-templates-card", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "templates-header", children: [_jsx(CardTitle, { children: "Top Performing Templates" }), _jsxs(Select, { value: selectedMetric, onValueChange: (value) => setSelectedMetric(value), children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "revenue", children: "By Revenue" }), _jsx(SelectItem, { value: "downloads", children: "By Downloads" }), _jsx(SelectItem, { value: "rating", children: "By Rating" })] })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "templates-list", children: topTemplates.map((template, index) => (_jsxs("div", { className: "template-item", children: [_jsxs("div", { className: "template-rank", children: ["#", index + 1] }), _jsxs("div", { className: "template-info", children: [_jsx("div", { className: "template-name", children: template.name }), _jsx("div", { className: "template-category", children: _jsx(Badge, { variant: "outline", children: template.category }) })] }), _jsxs("div", { className: "template-metrics", children: [selectedMetric === 'revenue' && (_jsx("div", { className: "metric-primary", children: formatCurrency(template.metrics.revenue.total) })), selectedMetric === 'downloads' && (_jsx("div", { className: "metric-primary", children: formatNumber(template.metrics.downloads) })), selectedMetric === 'rating' && (_jsxs("div", { className: "metric-primary", children: [template.metrics.ratings.average.toFixed(1), " \u2605"] })), _jsxs("div", { className: "metric-secondary", children: [_jsxs("span", { children: [formatNumber(template.metrics.views), " views"] }), _jsxs("span", { children: [template.metrics.favorites, " \u2665"] })] })] })] }, template.templateId))) }) })] }));
    };
    const renderSearchAnalytics = () => {
        if (!searchData)
            return null;
        return (_jsxs("div", { className: "search-analytics", children: [_jsxs(Card, { className: "search-overview", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: [_jsx(Search, { className: "w-5 h-5" }), "Search Analytics"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "search-metrics", children: [_jsxs("div", { className: "search-stat", children: [_jsx("div", { className: "stat-value", children: formatNumber(searchData.totalSearches || 0) }), _jsx("div", { className: "stat-label", children: "Total Searches" })] }), _jsxs("div", { className: "search-stat", children: [_jsxs("div", { className: "stat-value", children: [searchData.averageCTR?.toFixed(1) || 0, "%"] }), _jsx("div", { className: "stat-label", children: "Average CTR" })] })] }) })] }), _jsxs(Card, { className: "top-queries", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Top Search Queries" }) }), _jsx(CardContent, { children: _jsx("div", { className: "queries-list", children: searchData.topQueries?.slice(0, 8).map((query, index) => (_jsxs("div", { className: "query-item", children: [_jsxs("div", { className: "query-rank", children: ["#", index + 1] }), _jsxs("div", { className: "query-info", children: [_jsxs("div", { className: "query-text", children: ["\"", query.query, "\""] }), _jsxs("div", { className: "query-stats", children: [_jsxs("span", { children: [query.count, " searches"] }), _jsxs("span", { children: [query.ctr.toFixed(1), "% CTR"] })] })] })] }, query.query))) }) })] })] }));
    };
    const renderInsights = () => {
        return (_jsxs(Card, { className: "insights-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Marketplace Insights" }) }), _jsx(CardContent, { children: _jsx("div", { className: "insights-list", children: insights.map((insight, index) => (_jsxs("div", { className: `insight-item ${insight.impact}`, children: [_jsxs("div", { className: "insight-icon", children: [insight.type === 'opportunity' && _jsx(TrendingUp, { className: "w-5 h-5" }), insight.type === 'trend' && _jsx(Target, { className: "w-5 h-5" }), insight.type === 'optimization' && _jsx(Users, { className: "w-5 h-5" })] }), _jsxs("div", { className: "insight-content", children: [_jsxs("div", { className: "insight-header", children: [_jsx("div", { className: "insight-title", children: insight.title }), _jsxs(Badge, { variant: insight.impact === 'high' ? 'default' : insight.impact === 'medium' ? 'secondary' : 'outline', children: [insight.impact, " impact"] })] }), _jsx("div", { className: "insight-description", children: insight.description }), _jsx("div", { className: "insight-action", children: _jsx(Button, { variant: "outline", size: "sm", children: insight.action }) })] })] }, index))) }) })] }));
    };
    if (isLoading) {
        return (_jsxs("div", { className: "marketplace-dashboard loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading marketplace analytics..." })] }));
    }
    return (_jsxs("div", { className: `marketplace-dashboard ${className}`, children: [_jsxs("div", { className: "dashboard-header", children: [_jsx("h2", { children: "Marketplace Analytics" }), _jsx(Button, { onClick: refreshData, variant: "outline", children: "Refresh Data" })] }), _jsxs(Tabs, { defaultValue: "overview", className: "dashboard-tabs", children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-full", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "templates", children: "Templates" }), _jsx(TabsTrigger, { value: "search", children: "Search" }), _jsx(TabsTrigger, { value: "insights", children: "Insights" })] }), _jsx(TabsContent, { value: "overview", className: "tab-content", children: _jsxs("div", { className: "overview-content", children: [renderOverviewMetrics(), renderTopCategories()] }) }), _jsx(TabsContent, { value: "templates", className: "tab-content", children: renderTopTemplates() }), _jsx(TabsContent, { value: "search", className: "tab-content", children: renderSearchAnalytics() }), _jsx(TabsContent, { value: "insights", className: "tab-content", children: renderInsights() })] }), _jsx("style", { jsx: true, children: `
        .marketplace-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dashboard-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          transition: transform 0.2s ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
        }

        .metric-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0.5rem 0;
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
        }

        .trend-value {
          font-weight: 600;
          color: #059669;
        }

        .trend-period {
          color: #9ca3af;
        }

        .metric-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .rating-stars {
          display: flex;
          gap: 0.125rem;
          margin-top: 0.25rem;
        }

        .categories-list, .templates-list, .queries-list, .insights-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .category-item, .template-item, .query-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .category-info, .template-info, .query-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .category-rank, .template-rank, .query-rank {
          font-weight: 600;
          color: #6b7280;
          min-width: 2rem;
        }

        .category-name, .template-name, .query-text {
          font-weight: 600;
          color: #1f2937;
        }

        .category-revenue, .metric-primary {
          font-size: 1.1rem;
          font-weight: 600;
          color: #059669;
        }

        .metric-secondary {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .query-stats {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .templates-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .search-analytics {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1rem;
        }

        .search-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .search-stat {
          text-align: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .insight-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .insight-item.high {
          border-left-color: #dc2626;
        }

        .insight-item.medium {
          border-left-color: #f59e0b;
        }

        .insight-item.low {
          border-left-color: #10b981;
        }

        .insight-icon {
          flex-shrink: 0;
          padding: 0.5rem;
          background: #f3f4f6;
          border-radius: 8px;
        }

        .insight-content {
          flex: 1;
        }

        .insight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .insight-title {
          font-weight: 600;
          color: #1f2937;
        }

        .insight-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.75rem;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4rem;
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

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .search-analytics {
            grid-template-columns: 1fr;
          }

          .templates-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
        }
      ` })] }));
};
export default MarketplaceDashboard;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Creator Attribution Dashboard
 * Task: E16-1753114247138-03634F - Add attribution system
 *
 * Comprehensive dashboard for template creators to manage their attribution,
 * revenue sharing, collaborations, and attribution claims.
 */
import { useState, useEffect, useCallback } from 'react';
import { Users, DollarSign, FileText, Award, TrendingUp, Settings, AlertTriangle, CheckCircle, Clock, ExternalLink, Eye } from 'lucide-react';
// =============================================================================
// Creator Attribution Dashboard Component
// =============================================================================
export const CreatorAttributionDashboard = ({ userId, onTemplateClick, onCollaborationClick, onSettingsClick, className = '' }) => {
    // State management
    const [dashboard, setDashboard] = useState(null);
    const [stats, setStats] = useState(null);
    const [topPerformers, setTopPerformers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    // =============================================================================
    // Data Loading
    // =============================================================================
    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/marketplace-attribution/creators/${userId}/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to load creator dashboard');
            }
            const data = await response.json();
            if (data.success) {
                setDashboard(data);
                // Calculate stats
                const calculatedStats = {
                    totalTemplates: data.templates.length,
                    totalRevenue: data.templates.reduce((sum, t) => sum + t.revenue.total, 0),
                    pendingRevenue: data.templates.reduce((sum, t) => sum + t.revenue.pending, 0),
                    collaborations: data.collaborations.length,
                    activeClaims: 0, // Would be calculated from claims data
                    verificationRate: data.profile.attributionReputation.accuracyScore
                };
                setStats(calculatedStats);
                // Calculate top performers
                const performers = data.templates
                    .map((template) => ({
                    templateId: template.templateId,
                    title: template.title,
                    views: template.performance.views,
                    purchases: template.performance.purchases,
                    revenue: template.revenue.total,
                    rating: template.performance.rating,
                    trend: template.performance.purchases > 10 ? 'up' : 'stable'
                }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5);
                setTopPerformers(performers);
            }
            else {
                throw new Error(data.error || 'Failed to load dashboard');
            }
        }
        catch (error) {
            console.error('Failed to fetch creator dashboard:', error);
            setError(error instanceof Error ? error.message : 'Unknown error occurred');
        }
        finally {
            setLoading(false);
        }
    }, [userId]);
    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);
    // =============================================================================
    // UI Rendering Methods
    // =============================================================================
    const renderStatsCards = () => {
        if (!stats)
            return null;
        const statCards = [
            {
                icon: FileText,
                label: 'Templates Created',
                value: stats.totalTemplates.toString(),
                subtext: 'Active templates',
                color: 'blue'
            },
            {
                icon: DollarSign,
                label: 'Total Revenue',
                value: `$${(stats.totalRevenue / 100).toFixed(2)}`,
                subtext: `$${(stats.pendingRevenue / 100).toFixed(2)} pending`,
                color: 'green'
            },
            {
                icon: Users,
                label: 'Collaborations',
                value: stats.collaborations.toString(),
                subtext: 'Active partnerships',
                color: 'purple'
            },
            {
                icon: Award,
                label: 'Verification Rate',
                value: `${stats.verificationRate.toFixed(1)}%`,
                subtext: 'Attribution accuracy',
                color: 'orange'
            }
        ];
        return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: statCards.map((card, index) => (_jsx("div", { className: "bg-white rounded-lg border border-gray-200 p-6 shadow-sm", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: card.label }), _jsx("p", { className: "text-2xl font-bold text-gray-900 mt-1", children: card.value }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: card.subtext })] }), _jsx("div", { className: `p-3 rounded-lg bg-${card.color}-50`, children: _jsx(card.icon, { className: `w-6 h-6 text-${card.color}-600` }) })] }) }, index))) }));
    };
    const renderTemplatesList = () => {
        if (!dashboard?.templates)
            return null;
        return (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm", children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-200", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Your Templates" }), _jsx("p", { className: "text-sm text-gray-500", children: "Manage your template attributions and performance" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Template" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Performance" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Revenue" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Rating" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: dashboard.templates.map((template) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "flex items-center", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: template.title }), _jsxs("div", { className: "text-sm text-gray-500", children: ["ID: ", template.templateId.slice(0, 8), "..."] })] }) }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [_jsxs("div", { className: "text-sm text-gray-900", children: [template.performance.views, " views"] }), _jsxs("div", { className: "text-sm text-gray-500", children: [template.performance.purchases, " purchases"] })] }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [_jsxs("div", { className: "text-sm font-medium text-gray-900", children: ["$", (template.revenue.total / 100).toFixed(2)] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["$", (template.revenue.pending / 100).toFixed(2), " pending"] })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "text-sm text-gray-900", children: template.performance.rating.toFixed(1) }), _jsx("div", { className: "ml-1", children: Array.from({ length: 5 }, (_, i) => (_jsx("span", { className: `text-xs ${i < Math.floor(template.performance.rating)
                                                                ? 'text-yellow-400'
                                                                : 'text-gray-300'}`, children: "\u2605" }, i))) })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => onTemplateClick?.(template.templateId), className: "text-blue-600 hover:text-blue-900", title: "View Details", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => window.open(`/marketplace/templates/${template.templateId}`, '_blank'), className: "text-gray-600 hover:text-gray-900", title: "View in Marketplace", children: _jsx(ExternalLink, { className: "w-4 h-4" }) })] }) })] }, template.templateId))) })] }) })] }));
    };
    const renderCollaborationsList = () => {
        if (!dashboard?.collaborations)
            return null;
        return (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm", children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-200", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Active Collaborations" }), _jsx("p", { className: "text-sm text-gray-500", children: "Templates you're collaborating on" })] }), _jsx("div", { className: "divide-y divide-gray-200", children: dashboard.collaborations.map((collaboration, index) => (_jsx("div", { className: "px-6 py-4 hover:bg-gray-50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: collaboration.title }), _jsx("span", { className: `ml-2 px-2 py-1 text-xs rounded-full ${collaboration.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : collaboration.status === 'completed'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-yellow-100 text-yellow-800'}`, children: collaboration.status })] }), _jsxs("div", { className: "mt-1 flex items-center text-sm text-gray-500", children: [_jsxs("span", { children: ["Role: ", collaboration.role] }), _jsx("span", { className: "mx-2", children: "\u2022" }), _jsxs("span", { children: ["Contribution: ", collaboration.contribution, "%"] }), _jsx("span", { className: "mx-2", children: "\u2022" }), _jsxs("span", { children: ["Revenue: $", (collaboration.revenue / 100).toFixed(2)] })] })] }), _jsx("button", { onClick: () => onCollaborationClick?.(collaboration.templateId), className: "ml-4 text-blue-600 hover:text-blue-900", children: _jsx(ExternalLink, { className: "w-4 h-4" }) })] }) }, index))) }), dashboard.collaborations.length === 0 && (_jsxs("div", { className: "px-6 py-8 text-center", children: [_jsx(Users, { className: "mx-auto w-12 h-12 text-gray-400" }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No collaborations yet" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Start collaborating with other creators to expand your reach." })] }))] }));
    };
    const renderTopPerformers = () => {
        if (topPerformers.length === 0)
            return null;
        return (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm", children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-200", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Top Performing Templates" }), _jsx("p", { className: "text-sm text-gray-500", children: "Your highest revenue generating templates" })] }), _jsx("div", { className: "p-6", children: _jsx("div", { className: "space-y-4", children: topPerformers.map((template, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: _jsxs("span", { className: "text-sm font-medium text-blue-600", children: ["#", index + 1] }) }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: template.title }), _jsxs("p", { className: "text-sm text-gray-500", children: [template.views, " views \u2022 ", template.purchases, " purchases"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm font-medium text-gray-900", children: ["$", (template.revenue / 100).toFixed(2)] }), _jsxs("div", { className: "flex items-center mt-1", children: [_jsx(TrendingUp, { className: `w-4 h-4 ${template.trend === 'up' ? 'text-green-500' : 'text-gray-400'}` }), _jsxs("span", { className: "text-xs text-gray-500 ml-1", children: [template.rating.toFixed(1), " \u2605"] })] })] })] }, template.templateId))) }) })] }));
    };
    const renderProfile = () => {
        if (!dashboard?.profile)
            return null;
        return (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm", children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-200 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Creator Profile" }), _jsx("p", { className: "text-sm text-gray-500", children: "Your marketplace identity and settings" })] }), _jsx("button", { onClick: onSettingsClick, className: "text-gray-400 hover:text-gray-600", children: _jsx(Settings, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "p-6", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-xl font-medium text-blue-600", children: dashboard.profile.displayName.charAt(0).toUpperCase() }) }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-lg font-medium text-gray-900", children: dashboard.profile.displayName }), dashboard.profile.profileBio && (_jsx("p", { className: "text-sm text-gray-600 mt-1", children: dashboard.profile.profileBio })), _jsx("div", { className: "flex items-center mt-3 space-x-4", children: dashboard.profile.verificationBadges.map((badge, index) => (_jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), badge.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())] }, index))) }), _jsxs("div", { className: "mt-4 grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Collaboration Score:" }), _jsxs("span", { className: "ml-2 font-medium text-gray-900", children: [dashboard.profile.collaborationScore.toFixed(1), "/100"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Attribution Accuracy:" }), _jsxs("span", { className: "ml-2 font-medium text-gray-900", children: [dashboard.profile.attributionReputation.accuracyScore.toFixed(1), "%"] })] })] })] })] }) })] }));
    };
    // =============================================================================
    // Main Render
    // =============================================================================
    if (loading) {
        return (_jsx("div", { className: `creator-attribution-dashboard ${className}`, children: _jsxs("div", { className: "flex items-center justify-center h-64", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-3 text-gray-600", children: "Loading creator dashboard..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: `creator-attribution-dashboard ${className}`, children: _jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-red-600" }), _jsx("h3", { className: "ml-3 text-sm font-medium text-red-800", children: "Error Loading Dashboard" })] }), _jsx("p", { className: "mt-2 text-sm text-red-600", children: error }), _jsx("button", { onClick: fetchDashboard, className: "mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700", children: "Try Again" })] }) }));
    }
    return (_jsxs("div", { className: `creator-attribution-dashboard ${className}`, children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Creator Attribution Dashboard" }), _jsx("p", { className: "text-gray-600", children: "Manage your template attributions, collaborations, and revenue sharing" })] }), _jsx("div", { className: "border-b border-gray-200 mb-8", children: _jsx("nav", { className: "-mb-px flex space-x-8", children: [
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'templates', label: 'Templates', icon: FileText },
                        { id: 'collaborations', label: 'Collaborations', icon: Users },
                        { id: 'analytics', label: 'Analytics', icon: Award }
                    ].map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(tab.icon, { className: "w-4 h-4 mr-2" }), tab.label] }, tab.id))) }) }), activeTab === 'overview' && (_jsxs("div", { className: "space-y-8", children: [renderStatsCards(), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [renderProfile(), renderTopPerformers()] })] })), activeTab === 'templates' && renderTemplatesList(), activeTab === 'collaborations' && renderCollaborationsList(), activeTab === 'analytics' && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center", children: [_jsx(Clock, { className: "mx-auto w-12 h-12 text-gray-400" }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "Analytics Coming Soon" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Detailed analytics and insights will be available soon." })] }))] }));
};
// =============================================================================
// Helper Functions
// =============================================================================
function getAuthToken() {
    // Implementation would get JWT token from app state or localStorage
    return localStorage.getItem('authToken') || '';
}
export default CreatorAttributionDashboard;

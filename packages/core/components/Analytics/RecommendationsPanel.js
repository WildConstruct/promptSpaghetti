import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Lightbulb, TrendingUp, DollarSign, Zap, Settings, CheckCircle, XCircle, Target, ArrowRight, RefreshCw, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
/**
 * Recommendation priority colors
 */
const PRIORITY_COLORS = {
    high: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-green-600 bg-green-50 border-green-200'
};
/**
 * Recommendation type icons
 */
const RECOMMENDATION_TYPE_ICONS = {
    model_switch: Settings,
    usage_optimization: Zap,
    budget_adjustment: DollarSign,
    performance_improvement: TrendingUp,
    cost_reduction: DollarSign,
    feature_adoption: Star
};
/**
 * Recommendation item component
 */
const RecommendationItem = ({ recommendation, onApply, onDismiss, onFeedback }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const handleApply = useCallback(async () => {
        if (onApply) {
            setIsProcessing(true);
            try {
                await onApply(recommendation.id || 'unknown');
            }
            finally {
                setIsProcessing(false);
            }
        }
    }, [recommendation.id, onApply]);
    const handleDismiss = useCallback(async () => {
        if (onDismiss) {
            setIsProcessing(true);
            try {
                await onDismiss(recommendation.id || 'unknown');
            }
            finally {
                setIsProcessing(false);
            }
        }
    }, [recommendation.id, onDismiss]);
    const handleFeedback = useCallback(async (feedbackType) => {
        if (onFeedback) {
            setFeedback(feedbackType);
            await onFeedback(recommendation.id || 'unknown', feedbackType);
        }
    }, [recommendation.id, onFeedback]);
    const IconComponent = RECOMMENDATION_TYPE_ICONS[recommendation.type] || Lightbulb;
    const priorityClass = PRIORITY_COLORS[recommendation.priority] || PRIORITY_COLORS.medium;
    const getImpactIcon = (impact) => {
        switch (impact) {
            case 'high':
                return _jsx(TrendingUp, { className: "w-4 h-4 text-red-600" });
            case 'medium':
                return _jsx(TrendingUp, { className: "w-4 h-4 text-yellow-600" });
            case 'low':
                return _jsx(TrendingUp, { className: "w-4 h-4 text-green-600" });
            default:
                return _jsx(TrendingUp, { className: "w-4 h-4 text-gray-600" });
        }
    };
    return (_jsxs(Card, { className: `recommendation-item ${priorityClass} border-l-4`, children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(IconComponent, { className: "w-5 h-5 mt-1 flex-shrink-0" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Badge, { variant: recommendation.priority === 'high' ? 'destructive' : recommendation.priority === 'medium' ? 'warning' : 'secondary', children: recommendation.priority }), _jsx("span", { className: "text-sm text-gray-600", children: recommendation.type.replace('_', ' ') })] }), _jsx("div", { className: "font-medium", children: recommendation.title }), _jsx("div", { className: "text-sm text-gray-600 mt-1", children: recommendation.description })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getImpactIcon(recommendation.impact), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => setIsExpanded(!isExpanded), children: isExpanded ? 'Less' : 'More' })] })] }) }), isExpanded && (_jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: ["$", recommendation.estimatedSavings?.toFixed(2) || '0.00'] }), _jsx("div", { className: "text-sm text-gray-600", children: "Estimated Savings" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: recommendation.affectedUsers || 0 }), _jsx("div", { className: "text-sm text-gray-600", children: "Affected Users" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: recommendation.impact }), _jsx("div", { className: "text-sm text-gray-600", children: "Impact Level" })] })] }), recommendation.actionItems && recommendation.actionItems.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "font-medium", children: "Action Items:" }), _jsx("ul", { className: "space-y-1", children: recommendation.actionItems.map((item, index) => (_jsxs("li", { className: "flex items-start gap-2 text-sm", children: [_jsx(ArrowRight, { className: "w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" }), _jsx("span", { children: item })] }, index))) })] })), recommendation.implementationProgress && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Implementation Progress" }), _jsxs("span", { className: "text-sm text-gray-600", children: [recommendation.implementationProgress, "%"] })] }), _jsx(Progress, { value: recommendation.implementationProgress, className: "h-2" })] })), _jsxs("div", { className: "flex justify-between items-center pt-2", children: [_jsxs("div", { className: "flex gap-2", children: [onApply && (_jsxs(Button, { size: "sm", onClick: handleApply, disabled: isProcessing, className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), isProcessing ? 'Applying...' : 'Apply'] })), onDismiss && (_jsxs(Button, { size: "sm", variant: "outline", onClick: handleDismiss, disabled: isProcessing, className: "flex items-center gap-2", children: [_jsx(XCircle, { className: "w-4 h-4" }), "Dismiss"] }))] }), onFeedback && (_jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "ghost", onClick: () => handleFeedback('positive'), className: `flex items-center gap-1 ${feedback === 'positive' ? 'text-green-600' : ''}`, children: [_jsx(ThumbsUp, { className: "w-4 h-4" }), "Helpful"] }), _jsxs(Button, { size: "sm", variant: "ghost", onClick: () => handleFeedback('negative'), className: `flex items-center gap-1 ${feedback === 'negative' ? 'text-red-600' : ''}`, children: [_jsx(ThumbsDown, { className: "w-4 h-4" }), "Not Helpful"] })] }))] })] }) }))] }));
};
/**
 * Recommendation summary component
 */
const RecommendationSummary = ({ recommendations, onRefresh }) => {
    const totalSavings = recommendations.reduce((sum, rec) => sum + (rec.estimatedSavings || 0), 0);
    const highPriorityCount = recommendations.filter(rec => rec.priority === 'high').length;
    const implementedCount = recommendations.filter(rec => rec.implementationProgress === 100).length;
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Lightbulb, { className: "w-5 h-5 text-yellow-600" }), _jsx(CardTitle, { className: "text-sm text-gray-600", children: "Total Recommendations" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-blue-600", children: recommendations.length }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-5 h-5 text-green-600" }), _jsx(CardTitle, { className: "text-sm text-gray-600", children: "Potential Savings" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-2xl font-bold text-green-600", children: ["$", totalSavings.toFixed(2)] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Target, { className: "w-5 h-5 text-red-600" }), _jsx(CardTitle, { className: "text-sm text-gray-600", children: "High Priority" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-red-600", children: highPriorityCount }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }), _jsx(CardTitle, { className: "text-sm text-gray-600", children: "Implemented" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: implementedCount }), onRefresh && (_jsx(Button, { size: "sm", variant: "ghost", onClick: onRefresh, children: _jsx(RefreshCw, { className: "w-4 h-4" }) }))] }) })] })] }));
};
/**
 * Recommendations panel component
 */
export const RecommendationsPanel = ({ recommendations, analyticsClient, userId, organizationId, onRefresh, className = '' }) => {
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('priority');
    /**
     * Filter recommendations
     */
    const filteredRecommendations = recommendations.filter(rec => {
        if (filter === 'all')
            return true;
        return rec.priority === filter;
    });
    /**
     * Sort recommendations
     */
    const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
        if (sortBy === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return (priorityOrder[b.priority] || 0) -
                (priorityOrder[a.priority] || 0);
        }
        if (sortBy === 'savings') {
            return (b.estimatedSavings || 0) - (a.estimatedSavings || 0);
        }
        if (sortBy === 'impact') {
            const impactOrder = { high: 3, medium: 2, low: 1 };
            return (impactOrder[b.impact] || 0) -
                (impactOrder[a.impact] || 0);
        }
        return 0;
    });
    /**
     * Handle apply recommendation
     */
    const handleApplyRecommendation = useCallback(async (recommendationId) => {
        // This would implement the actual recommendation application logic
        console.log('Applying recommendation:', recommendationId);
        // You could call specific APIs based on the recommendation type
    }, []);
    /**
     * Handle dismiss recommendation
     */
    const handleDismissRecommendation = useCallback(async (recommendationId) => {
        // This would implement the recommendation dismissal logic
        console.log('Dismissing recommendation:', recommendationId);
    }, []);
    /**
     * Handle recommendation feedback
     */
    const handleRecommendationFeedback = useCallback(async (recommendationId, feedback) => {
        // This would send feedback to the analytics system
        console.log('Recommendation feedback:', recommendationId, feedback);
    }, []);
    /**
     * Group recommendations by type
     */
    const getRecommendationsByType = () => {
        const types = {
            cost_reduction: recommendations.filter(r => r.type === 'model_switch' || r.type === 'usage_optimization' || r.type === 'budget_adjustment'),
            performance: recommendations.filter(r => r.type === 'performance_improvement'),
            feature_adoption: recommendations.filter(r => r.type === 'feature_adoption')
        };
        return types;
    };
    if (recommendations.length === 0) {
        return (_jsx("div", { className: `recommendations-panel ${className}`, children: _jsx(Card, { children: _jsxs(CardContent, { className: "text-center py-8", children: [_jsx(Lightbulb, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("div", { className: "text-lg font-medium text-gray-600", children: "No Recommendations Available" }), _jsx("div", { className: "text-sm text-gray-500", children: "We'll analyze your usage and provide recommendations to optimize your experience" }), onRefresh && (_jsxs(Button, { className: "mt-4", onClick: onRefresh, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }))] }) }) }));
    }
    const recommendationsByType = getRecommendationsByType();
    return (_jsxs("div", { className: `recommendations-panel ${className}`, children: [_jsx(RecommendationSummary, { recommendations: recommendations, onRefresh: onRefresh }), _jsxs(Tabs, { defaultValue: "all", className: "w-full", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-fit", children: [_jsxs(TabsTrigger, { value: "all", onClick: () => setFilter('all'), children: ["All (", recommendations.length, ")"] }), _jsxs(TabsTrigger, { value: "high", onClick: () => setFilter('high'), children: ["High (", recommendations.filter(r => r.priority === 'high').length, ")"] }), _jsxs(TabsTrigger, { value: "medium", onClick: () => setFilter('medium'), children: ["Medium (", recommendations.filter(r => r.priority === 'medium').length, ")"] }), _jsxs(TabsTrigger, { value: "low", onClick: () => setFilter('low'), children: ["Low (", recommendations.filter(r => r.priority === 'low').length, ")"] })] }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "text-sm border border-gray-300 rounded px-2 py-1", children: [_jsx("option", { value: "priority", children: "Sort by Priority" }), _jsx("option", { value: "savings", children: "Sort by Savings" }), _jsx("option", { value: "impact", children: "Sort by Impact" })] })] }), _jsx(TabsContent, { value: "all", className: "space-y-4", children: sortedRecommendations.map((recommendation, index) => (_jsx(RecommendationItem, { recommendation: recommendation, onApply: handleApplyRecommendation, onDismiss: handleDismissRecommendation, onFeedback: handleRecommendationFeedback }, index))) }), _jsx(TabsContent, { value: "high", className: "space-y-4", children: sortedRecommendations.filter(r => r.priority === 'high').map((recommendation, index) => (_jsx(RecommendationItem, { recommendation: recommendation, onApply: handleApplyRecommendation, onDismiss: handleDismissRecommendation, onFeedback: handleRecommendationFeedback }, index))) }), _jsx(TabsContent, { value: "medium", className: "space-y-4", children: sortedRecommendations.filter(r => r.priority === 'medium').map((recommendation, index) => (_jsx(RecommendationItem, { recommendation: recommendation, onApply: handleApplyRecommendation, onDismiss: handleDismissRecommendation, onFeedback: handleRecommendationFeedback }, index))) }), _jsx(TabsContent, { value: "low", className: "space-y-4", children: sortedRecommendations.filter(r => r.priority === 'low').map((recommendation, index) => (_jsx(RecommendationItem, { recommendation: recommendation, onApply: handleApplyRecommendation, onDismiss: handleDismissRecommendation, onFeedback: handleRecommendationFeedback }, index))) })] }), _jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("div", { className: "text-sm font-medium", children: "Quick Actions" }), _jsx(Button, { size: "sm", variant: "outline", children: "Apply All High Priority" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-bold text-blue-600", children: recommendationsByType.cost_reduction.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Cost Reduction" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-bold text-green-600", children: recommendationsByType.performance.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Performance" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-bold text-purple-600", children: recommendationsByType.feature_adoption.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Feature Adoption" })] })] })] })] }));
};
export default RecommendationsPanel;

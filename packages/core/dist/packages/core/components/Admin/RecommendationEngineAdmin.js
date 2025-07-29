import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Recommendation Engine Admin - E17-1753114397324-2FB112
 *
 * Administrative interface for configuring and monitoring the recommendation engine
 * Part of Epic 17.5.2 - Featured Content Tools (Backstage Admin Controls)
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Settings, Brain, Target, TrendingUp, BarChart3, Zap, Users, Star, Eye, RefreshCw, Save, Activity, Database, Cpu, Network } from 'lucide-react';
 > ;
;
real_time_stats: {
    current_recommendations_per_minute: number;
    active_users: number;
    cache_utilization: number;
    model_accuracy: number;
}
;
export const RecommendationEngineAdmin = ({
    className = ''
});
{
    const [activeTab, setActiveTab] = useState('algorithms');
    const [featuredConfig, setFeaturedConfig] = useState({});
    algorithm_weights: {
        trending_boost: 1.2,
            quality_boost;
        1.5,
            diversity_boost;
        0.8,
            recency_boost;
        1.1,
            creator_tier_boost;
        1.3,
        ;
    }
    content_filters: {
        min_quality_score: 80,
            exclude_categories;
        ['nsfw', 'inappropriate'],
            featured_categories_boost;
        {
            'business';
            1.2,
                'creative';
            1.1,
                'technology';
            1.15,
            ;
        }
        creator_tier_weights: {
            'premium';
            1.5,
                'verified';
            1.2,
                'community';
            1.0,
            ;
        }
        rotation_settings: {
            rotation_frequency: 60,
                max_consecutive_shows;
            3,
                cooldown_period;
            24,
                randomization_factor;
            0.2,
            ;
        }
        ab_testing: {
            enabled: true,
                variants;
            [,
                {
                    id: 'variant-quality',
                    name: 'Quality Focused',
                    config_override: {
                        algorithm_weights: {
                            trending_boost: 1.0,
                            quality_boost: 2.0,
                            diversity_boost: 0.8,
                            recency_boost: 0.9,
                            creator_tier_boost: 1.4,
                        },
                        allocation_percentage: 40,
                        performance_metrics: {
                            ctr: 4.2,
                            conversion_rate: 14.8,
                            engagement_score: 87.5,
                            revenue_per_view: 0.24,
                        }
                    }
                },
                {
                    id: 'variant-trending',
                    name: 'Trending Focused',
                    config_override: {
                        algorithm_weights: {
                            trending_boost: 2.0,
                            quality_boost: 1.2,
                            diversity_boost: 1.1,
                            recency_boost: 1.5,
                            creator_tier_boost: 1.0,
                        },
                        allocation_percentage: 40,
                        performance_metrics: {
                            ctr: 5.1,
                            conversion_rate: 11.2,
                            engagement_score: 92.1,
                            revenue_per_view: 0.19
                        }
                    }
                }],
                traffic_allocation;
            80,
            ;
        }
        ;
        const [algorithms] = useState([]);
        {
            id: 'collaborative-filtering',
                name;
            'Collaborative Filtering',
                type;
            'collaborative_filtering',
                description;
            'User-based collaborative filtering using matrix factorization',
                enabled;
            true,
                weight;
            0.4,
                parameters;
            {
                n_factors: 100,
                    learning_rate;
                0.005,
                    regularization;
                0.02,
                    min_user_interactions;
                5,
                ;
            }
            performance_metrics: {
                precision: 0.78,
                    recall;
                0.65,
                    ndcg;
                0.82,
                    click_through_rate;
                4.2,
                    conversion_rate;
                12.8,
                ;
            }
            last_trained: new Date(Date.now() - 6 * 60 * 60 * 1000),
                training_status;
            'completed';
        }
        {
            id: 'content-based',
                name;
            'Content-Based Filtering',
                type;
            'content_based',
                description;
            'Content similarity using TF-IDF and metadata features',
                enabled;
            true,
                weight;
            0.3,
                parameters;
            {
                tfidf_max_features: 5000,
                    similarity_threshold;
                0.1,
                    metadata_weights;
                {
                    category: 0.3,
                        tags;
                    0.4,
                        creator;
                    0.2,
                        style;
                    0.1,
                    ;
                }
                performance_metrics: {
                    precision: 0.71,
                        recall;
                    0.58,
                        ndcg;
                    0.75,
                        click_through_rate;
                    3.8,
                        conversion_rate;
                    10.5,
                    ;
                }
                last_trained: new Date(Date.now() - 12 * 60 * 60 * 1000),
                    training_status;
                'completed';
            }
            {
                id: 'deep-learning',
                    name;
                'Neural Network Model',
                    type;
                'deep_learning',
                    description;
                'Deep learning model with user and item embeddings',
                    enabled;
                false,
                    weight;
                0.2,
                    parameters;
                {
                    embedding_dim: 128,
                        hidden_layers;
                    [256, 128, 64],
                        dropout_rate;
                    0.3,
                        learning_rate;
                    0.001,
                        batch_size;
                    512,
                    ;
                }
                performance_metrics: {
                    precision: 0.85,
                        recall;
                    0.72,
                        ndcg;
                    0.88,
                        click_through_rate;
                    5.1,
                        conversion_rate;
                    15.2,
                    ;
                }
                last_trained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    training_status;
                'idle';
            }
            {
                id: 'performance-based',
                    name;
                'Performance Optimizer',
                    type;
                'performance_based',
                    description;
                'Featured content optimization for promotional performance',
                    enabled;
                true,
                    weight;
                0.1,
                    parameters;
                {
                    performance_window_days: 30,
                        conversion_weight;
                    0.6,
                        engagement_weight;
                    0.4,
                        trending_decay;
                    0.95,
                        quality_threshold;
                    4.0,
                    ;
                }
                performance_metrics: {
                    precision: 0.82,
                        recall;
                    0.69,
                        ndcg;
                    0.84,
                        click_through_rate;
                    4.7,
                        conversion_rate;
                    14.1,
                    ;
                }
                last_trained: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    training_status;
                'completed';
                ;
                const [metrics] = useState({});
                overall_performance: {
                    total_recommendations_served: 2847392,
                        click_through_rate;
                    4.35,
                        conversion_rate;
                    13.2,
                        avg_engagement_time;
                    127,
                        revenue_impact;
                    284750,
                    ;
                }
                algorithm_performance: {
                    'collaborative-filtering';
                    {
                        precision: 0.78,
                            recall;
                        0.65,
                            f1_score;
                        0.71,
                            latency_ms;
                        45,
                            cache_hit_rate;
                        0.89,
                        ;
                    }
                    'content-based';
                    {
                        precision: 0.71,
                            recall;
                        0.58,
                            f1_score;
                        0.64,
                            latency_ms;
                        32,
                            cache_hit_rate;
                        0.92,
                        ;
                    }
                    'deep-learning';
                    {
                        precision: 0.85,
                            recall;
                        0.72,
                            f1_score;
                        0.78,
                            latency_ms;
                        125,
                            cache_hit_rate;
                        0.76,
                        ;
                    }
                    'performance-based';
                    {
                        precision: 0.82,
                            recall;
                        0.69,
                            f1_score;
                        0.75,
                            latency_ms;
                        28,
                            cache_hit_rate;
                        0.95,
                        ;
                    }
                    featured_content_performance: {
                        impressions: 1247893,
                            clicks;
                        54287,
                            conversions;
                        7165,
                            revenue;
                        71650,
                            top_performing_content;
                        [,
                            { id: 'content-1', title: 'Business Card Pro Template', performance_score: 95.2 },
                            { id: 'content-2', title: 'Wedding Invitation Suite', performance_score: 92.7 },
                            { id: 'content-3', title: 'Marketing Flyer Pack', performance_score: 89.4 }
                        ];
                    }
                    real_time_stats: {
                        current_recommendations_per_minute: 1250,
                            active_users;
                        8374,
                            cache_utilization;
                        87.5,
                            model_accuracy;
                        84.2,
                        ;
                    }
                    ;
                    const getStatusColor = (status) => {
                        switch (status) {
                            case 'completed': return 'text-green-600 bg-green-100';
                            case 'training': return 'text-blue-600 bg-blue-100';
                            case 'failed': return 'text-red-600 bg-red-100';
                            case 'idle': return 'text-gray-600 bg-gray-100';
                            default: return 'text-gray-600 bg-gray-100';
                        }
                        ;
                        const getAlgorithmTypeIcon = (type) => {
                            switch (type) {
                                case 'collaborative_filtering': return Users;
                                case 'content_based': return Database;
                                case 'deep_learning': return Brain;
                                case 'performance_based': return Target;
                                case 'hybrid': return Network;
                                default: return Cpu;
                            }
                            ;
                            const renderAlgorithmManagement = () => ();
                            ;
                            _jsxs("div", { className: "algorithms-section", children: [_jsxs("div", { className: "algorithms-header", children: [_jsx("h3", { children: "Recommendation Algorithms" }), _jsxs("div", { className: "header-actions", children: [_jsxs(Button, { variant: "outline", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Retrain All"] }), _jsxs(Button, { children: [_jsx(Brain, { className: "w-4 h-4 mr-2" }), "Add Algorithm"] })] })] }), _jsxs("div", { className: "algorithms-list", children: [algorithms.map(algorithm => { }), "const IconComponent = getAlgorithmTypeIcon(algorithm.type); return;", _jsxs(Card, { className: "algorithm-card", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "algorithm-header", children: [_jsxs("div", { className: "algorithm-info", children: [_jsxs("div", { className: "algorithm-title", children: [_jsx(IconComponent, { className: "w-5 h-5 text-blue-500" }), _jsx("h4", { children: algorithm.name }), _jsx(Badge, { className: getStatusColor(algorithm.training_status), children: algorithm.training_status.toUpperCase() })] }), _jsx("p", { children: algorithm.description })] }), _jsxs("div", { className: "algorithm-controls", children: [_jsxs("div", { className: "weight-control", children: [_jsxs("label", { children: ["Weight: ", algorithm.weight] }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: algorithm.weight, className: "weight-slider" })] }), _jsxs("label", { className: "enable-switch", children: [_jsx("input", { type: "checkbox", checked: algorithm.enabled }), _jsx("span", { children: "Enabled" })] })] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "algorithm-metrics", children: _jsxs("div", { className: "metrics-grid", children: [_jsxs("div", { className: "metric-item", children: [_jsx("span", { className: "metric-label", children: "Precision" }), _jsxs("span", { className: "metric-value", children: [(algorithm.performance_metrics.precision * 100).toFixed(1), "%"] })] }), _jsxs("div", { className: "metric-item", children: [_jsx("span", { className: "metric-label", children: "Recall" }), _jsxs("span", { className: "metric-value", children: [(algorithm.performance_metrics.recall * 100).toFixed(1), "%"] })] }), _jsxs("div", { className: "metric-item", children: [_jsx("span", { className: "metric-label", children: "CTR" }), _jsxs("span", { className: "metric-value", children: [algorithm.performance_metrics.click_through_rate.toFixed(1), "%"] })] }), _jsxs("div", { className: "metric-item", children: [_jsx("span", { className: "metric-label", children: "Conversion" }), _jsxs("span", { className: "metric-value", children: [algorithm.performance_metrics.conversion_rate.toFixed(1), "%"] })] })] }) }), _jsxs("div", { className: "algorithm-actions", children: [_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Settings, { className: "w-4 h-4 mr-1" }), "Configure"] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-1" }), "Retrain"] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Eye, { className: "w-4 h-4 mr-1" }), "View Details"] })] })] })] }, algorithm.id), "); })}"] })] });
                        };
                    };
                    ;
                    const renderFeaturedContentConfig = () => ();
                    ;
                    _jsxs("div", { className: "featured-config-section", children: [_jsxs("div", { className: "config-header", children: [_jsx("h3", { children: "Featured Content Configuration" }), _jsxs("div", { className: "header-actions", children: [_jsxs(Button, { variant: "outline", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Reset to Defaults"] }), _jsxs(Button, { className: "bg-green-600 hover:bg-green-700", children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save Configuration"] })] })] }), _jsx("div", { className: "config-sections", children: _jsxs(Card, { className: "config-section", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Algorithm Weights" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "weights-grid", children: Object.entries(featuredConfig.algorithm_weights).map(([key, value]) => ()
                                                        < div, key = { key }, className = "weight-control" >
                                                        (_jsx("label", { className: "weight-label", children: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) })
                                                            ,
                                                                _jsxs("div", { className: "weight-input-group", children: [_jsx("input", { type: "range", min: "0", max: "2", step: "0.1", value: value, onChange: (e) => setFeaturedConfig({}) }), "...featuredConfig, algorithm_weights: ", ...(featuredConfig.algorithm_weights,
                                                                            [key]), ": parseFloat(e.target.value), })} className=\"weight-slider\" />", _jsx("span", { className: "weight-value", children: value.toFixed(1) })] }))) }), "))}"] })] }) }), _jsxs(Card, { className: "config-section", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Content Filters" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "filters-grid", children: [_jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Min Quality Score" }), _jsx("input", { type: "number", min: "0", max: "100", value: featuredConfig.content_filters.min_quality_score, onChange: (e) => setFeaturedConfig({}) }), "...featuredConfig, content_filters: ", ...(featuredConfig.content_filters,
                                                            min_quality_score), ": parseInt(e.target.value), })} className=\"config-input\" />"] }), _jsxs("div", { className: "filter-item span-2", children: [_jsx("label", { children: "Category Boosts" }), _jsxs("div", { className: "category-boosts", children: [Object.entries(featuredConfig.content_filters.featured_categories_boost).map(([category, boost]) => ()
                                                                    < div, key = { category }, className = "category-boost-item" >
                                                                    (_jsx("span", { className: "category-name", children: category })
                                                                        ,
                                                                            _jsx("input", { type: "number", min: "0", max: "2", step: "0.1", value: boost, onChange: (e) => setFeaturedConfig({}) })), ...featuredConfig, content_filters), ": ", ...(featuredConfig.content_filters,
                                                                    featured_categories_boost), ": ", ...(featuredConfig.content_filters.featured_categories_boost,
                                                                    [category]), ": parseFloat(e.target.value), })} className=\"boost-input\" />"] }), "))}"] })] }) })] })] });
                    { /* A/B Testing */ }
                    _jsxs(Card, { className: "config-section", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "section-title", children: [_jsx(Target, { className: "w-5 h-5 text-purple-500" }), "A/B Testing Configuration"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "ab-testing-config", children: [_jsxs("div", { className: "ab-header", children: [_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: featuredConfig.ab_testing.enabled, onChange: (e) => setFeaturedConfig({}) }), "...featuredConfig, ab_testing: ", ...(featuredConfig.ab_testing,
                                                                enabled), ": e.target.checked, })} />", _jsx("span", { children: "Enable A/B Testing" })] }), _jsxs("div", { className: "traffic-allocation", children: [_jsxs("label", { children: ["Traffic Allocation: ", featuredConfig.ab_testing.traffic_allocation, "%"] }), _jsx("input", { type: "range", min: "0", max: "100", value: featuredConfig.ab_testing.traffic_allocation, onChange: (e) => setFeaturedConfig({}) }), "...featuredConfig, ab_testing: ", ...(featuredConfig.ab_testing,
                                                                traffic_allocation), ": parseInt(e.target.value), })} className=\"traffic-slider\" />"] })] }), featuredConfig.ab_testing.enabled && ()
                                                < div, " className=\"variants-list\">", _jsx("h5", { children: "Test Variants" }), featuredConfig.ab_testing.variants.map(variant => ()
                                                < div, key = { variant, : .id }, className = "variant-item" >
                                                _jsxs("div", { className: "variant-info", children: [_jsx("h6", { children: variant.name }), _jsxs("span", { className: "variant-allocation", children: [variant.allocation_percentage, "% allocation"] })] }), { variant, : .performance_metrics && ()
                                                    < div, className = "variant-metrics" >
                                                    (_jsx("div", { className: "variant-metric", children: _jsxs("span", { children: ["CTR: ", variant.performance_metrics.ctr, "%"] }) })
                                                        ,
                                                            _jsx("div", { className: "variant-metric", children: _jsxs("span", { children: ["Conv: ", variant.performance_metrics.conversion_rate, "%"] }) })
                                                                ,
                                                                    _jsxs("div", { className: "variant-metric", children: [_jsxs("span", { children: ["Rev/View: $", variant.performance_metrics.revenue_per_view] }), "}"] })) })] }), ")}"] }), "))}"] });
                }
                div >
                ;
                CardContent >
                ;
                Card >
                ;
                div >
                ;
                div >
                ;
                ;
                const renderPerformanceMetrics = () => ();
                ;
                _jsxs("div", { className: "metrics-section", children: [_jsxs("div", { className: "metrics-header", children: [_jsx("h3", { children: "Performance Metrics" }), _jsxs("div", { className: "header-actions", children: [_jsxs(Button, { variant: "outline", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }), _jsxs(Button, { variant: "outline", children: [_jsx(BarChart3, { className: "w-4 h-4 mr-2" }), "Export Report"] })] })] }), _jsx("div", { className: "metrics-overview", children: _jsxs("div", { className: "overview-cards", children: [_jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(Eye, { className: "w-6 h-6 text-blue-500" }), _jsxs("div", { className: "metric-trend positive", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "+12.5%"] })] }), _jsxs("div", { className: "metric-content", children: [_jsx("div", { className: "metric-value", children: metrics.overall_performance.total_recommendations_served.toLocaleString() }), _jsx("div", { className: "metric-label", children: "Total Recommendations" })] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(Target, { className: "w-6 h-6 text-green-500" }), _jsxs("div", { className: "metric-trend positive", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "+8.2%"] })] }), _jsxs("div", { className: "metric-content", children: [_jsxs("div", { className: "metric-value", children: [metrics.overall_performance.click_through_rate.toFixed(2), "%"] }), _jsx("div", { className: "metric-label", children: "Click-Through Rate" })] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(Zap, { className: "w-6 h-6 text-purple-500" }), _jsxs("div", { className: "metric-trend positive", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "+15.7%"] })] }), _jsxs("div", { className: "metric-content", children: [_jsxs("div", { className: "metric-value", children: [metrics.overall_performance.conversion_rate.toFixed(1), "%"] }), _jsx("div", { className: "metric-label", children: "Conversion Rate" })] })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-header", children: [_jsx(Activity, { className: "w-6 h-6 text-orange-500" }), _jsxs("div", { className: "metric-trend positive", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "+22.1%"] })] }), _jsxs("div", { className: "metric-content", children: [_jsxs("div", { className: "metric-value", children: ["$", metrics.overall_performance.revenue_impact.toLocaleString()] }), "}", _jsx("div", { className: "metric-label", children: "Revenue Impact" })] })] }) })] }) }), _jsxs("div", { className: "detailed-metrics", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Algorithm Performance Comparison" }) }), _jsx(CardContent, { children: _jsx("div", { className: "algorithm-comparison", children: _jsxs("div", { className: "comparison-table", children: [_jsxs("div", { className: "table-header", children: [_jsx("div", { className: "header-cell", children: "Algorithm" }), _jsx("div", { className: "header-cell", children: "Precision" }), _jsx("div", { className: "header-cell", children: "Recall" }), _jsx("div", { className: "header-cell", children: "F1 Score" }), _jsx("div", { className: "header-cell", children: "Latency" }), _jsx("div", { className: "header-cell", children: "Cache Hit" })] }), Object.entries(metrics.algorithm_performance).map(([algId, perf]) => {
                                                            const algorithm = algorithms.find(a => a.id === algId);
                                                            return;
                                                            _jsxs("div", { className: "table-row", children: [_jsxs("div", { className: "cell algorithm-name", children: [algorithm?.name || algId, algorithm?.enabled && _jsx(Badge, { className: "enabled-badge", children: "Active" })] }), _jsxs("div", { className: "cell metric-cell", children: [(perf.precision * 100).toFixed(1), "%"] }), _jsxs("div", { className: "cell metric-cell", children: [(perf.recall * 100).toFixed(1), "%"] }), _jsxs("div", { className: "cell metric-cell", children: [(perf.f1_score * 100).toFixed(1), "%"] }), _jsxs("div", { className: "cell metric-cell", children: [perf.latency_ms, "ms"] }), _jsxs("div", { className: "cell metric-cell", children: [(perf.cache_hit_rate * 100).toFixed(1), "%"] })] }, algId);
                                                        }), "; })}"] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Real-Time Performance" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "real-time-stats", children: [_jsxs("div", { className: "stat-item", children: [_jsx("div", { className: "stat-icon", children: _jsx(Activity, { className: "w-5 h-5 text-green-500" }) }), _jsxs("div", { className: "stat-content", children: [_jsx("div", { className: "stat-value", children: metrics.real_time_stats.current_recommendations_per_minute.toLocaleString() }), _jsx("div", { className: "stat-label", children: "Recommendations/Min" })] })] }), _jsxs("div", { className: "stat-item", children: [_jsx("div", { className: "stat-icon", children: _jsx(Users, { className: "w-5 h-5 text-blue-500" }) }), _jsxs("div", { className: "stat-content", children: [_jsx("div", { className: "stat-value", children: metrics.real_time_stats.active_users.toLocaleString() }), _jsx("div", { className: "stat-label", children: "Active Users" })] })] }), _jsxs("div", { className: "stat-item", children: [_jsx("div", { className: "stat-icon", children: _jsx(Database, { className: "w-5 h-5 text-purple-500" }) }), _jsxs("div", { className: "stat-content", children: [_jsxs("div", { className: "stat-value", children: [metrics.real_time_stats.cache_utilization.toFixed(1), "%"] }), _jsx("div", { className: "stat-label", children: "Cache Utilization" })] })] }), _jsxs("div", { className: "stat-item", children: [_jsx("div", { className: "stat-icon", children: _jsx(Target, { className: "w-5 h-5 text-orange-500" }) }), _jsxs("div", { className: "stat-content", children: [_jsxs("div", { className: "stat-value", children: [metrics.real_time_stats.model_accuracy.toFixed(1), "%"] }), _jsx("div", { className: "stat-label", children: "Model Accuracy" })] })] })] }) })] })] })] });
                ;
                return;
                _jsxs("div", { className: `recommendation-engine-admin ${className}`, children: ["}", _jsx("div", { className: "admin-header", children: _jsxs("div", { className: "header-info", children: [_jsx("h2", { children: "Recommendation Engine Administration" }), _jsx("p", { children: "Configure algorithms and monitor recommendation performance" })] }) }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "admin-tabs", children: [_jsxs(TabsList, { className: "grid grid-cols-3 w-full", children: [_jsxs(TabsTrigger, { value: "algorithms", children: [_jsx(Brain, { className: "w-4 h-4 mr-2" }), "Algorithms"] }), _jsxs(TabsTrigger, { value: "featured", children: [_jsx(Star, { className: "w-4 h-4 mr-2" }), "Featured Content"] }), _jsxs(TabsTrigger, { value: "metrics", children: [_jsx(BarChart3, { className: "w-4 h-4 mr-2" }), "Performance"] })] }), _jsx(TabsContent, { value: "algorithms", className: "tab-content", children: renderAlgorithmManagement() }), _jsx(TabsContent, { value: "featured", className: "tab-content", children: renderFeaturedContentConfig() }), _jsx(TabsContent, { value: "metrics", className: "tab-content", children: renderPerformanceMetrics() })] }), _jsx("style", { children: `
        .recommendation-engine-admin {
          max-width: 1400px;
  margin: 0 auto;
          padding: 1.5rem;
  display: flex;
          flex-direction: column;
  gap: 1.5rem;
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;
  color: #1f2937;
          margin-bottom: 0.5rem;
        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        .algorithms-section,
        .featured-config-section,
        .metrics-section {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .algorithms-header,
        .config-header,
        .metrics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .algorithms-header h3,
        .config-header h3,
        .metrics-header h3 {
          font-weight: 600;
  color: #1f2937;
          margin: 0;
        .header-actions {
          display: flex;
  gap: 0.5rem;
        .algorithms-list {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .algorithm-card .card-content {
          padding-top: 0;
        .algorithm-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
  gap: 1rem;
        .algorithm-info {
          flex: 1;
        .algorithm-title {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          margin-bottom: 0.5rem;
        .algorithm-title h4 {
          font-weight: 600;
  color: #1f2937;
          margin: 0;
        .algorithm-info p {
          color: #6b7280;
          font-size: 0.875rem;
  margin: 0;
        .algorithm-controls {
          display: flex;
          flex-direction: column;
  gap: 0.75rem;
          align-items: flex-end;
        .weight-control {
          display: flex;
          flex-direction: column;
  gap: 0.25rem;
          align-items: center;
        .weight-control label {
          font-size: 0.875rem;
  color: #374151;
        .weight-slider {
          width: 80px;
        .enable-switch {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          font-size: 0.875rem;
  color: #374151;
          cursor: pointer;
        .algorithm-metrics {
          margin-bottom: 1rem;
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        .metric-item {
          display: flex;
          flex-direction: column;
  gap: 0.25rem;
          text-align: center;
        .metric-label {
          font-size: 0.75rem;
  color: #6b7280;
          font-weight: 500;
        .metric-value {
          font-size: 0.875rem;
  color: #1f2937;
          font-weight: 600;
        .algorithm-actions {
          display: flex;
  gap: 0.5rem;
          justify-content: flex-end;
        .config-sections {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .config-section .card-title {
          display: flex;
          align-items: center;
  gap: 0.5rem;
        .weights-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        .weight-control {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
        .weight-label {
          font-weight: 500;
  color: #374151;
        .weight-input-group {
          display: flex;
          align-items: center;
  gap: 0.75rem;
        .weight-slider {
          flex: 1;
        .weight-value {
          font-weight: 600;
  color: #1f2937;
          min-width: 30px;
          text-align: right;
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        .filter-item {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
        .filter-item.span-2 {
          grid-column: span 2;
        .filter-item label {
          font-weight: 500;
  color: #374151;
        .config-input {
          padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        .category-boosts {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
        .category-boost-item {
          display: flex;
          align-items: center;
  gap: 0.75rem;
        .category-name {
          font-weight: 500;
  color: #374151;
          min-width: 100px;
          text-transform: capitalize;
        .boost-input {
          width: 80px;
  padding: 0.25rem 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.875rem;
        .ab-testing-config {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .ab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        .checkbox-label {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          font-weight: 500;
  color: #374151;
          cursor: pointer;
        .traffic-allocation {
          display: flex;
          flex-direction: column;
  gap: 0.25rem;
          align-items: center;
        .traffic-allocation label {
          font-size: 0.875rem;
  color: #374151;
        .traffic-slider {
          width: 120px;
        .variants-list h5 {
          font-weight: 600;
  color: #1f2937;
          margin: 0 0 0.75rem 0;
        .variant-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
  padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          margin-bottom: 0.5rem;
        .variant-info h6 {
          font-weight: 600;
  color: #1f2937;
          margin: 0 0 0.25rem 0;
        .variant-allocation {
          font-size: 0.875rem;
  color: #6b7280;
        .variant-metrics {
          display: flex;
  gap: 1rem;
        .variant-metric span {
          font-size: 0.875rem;
  color: #374151;
          font-weight: 500;
        .metrics-overview {
          margin-bottom: 1.5rem;
        .overview-cards {
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
        .detailed-metrics {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .algorithm-comparison {
          overflow-x: auto;
        .comparison-table {
          display: grid;
          grid-template-columns: 2fr repeat(5, 1fr);
          gap: 0;
          min-width: 600px;
        .table-header {
          display: contents;
        .header-cell {
          padding: 0.75rem;
  background: #f9fafb;
          font-weight: 600;
  color: #374151;
          border-bottom: 2px solid #e5e7eb;
        .table-row {
          display: contents;
        .table-row:nth-child(even) .cell {,
  background: #f9fafb;
        .cell {
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
  display: flex;
          align-items: center;
        .algorithm-name {
          font-weight: 500;
  color: #1f2937;
          gap: 0.5rem;
        .enabled-badge {
          font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
          background: #d1fae5;
  color: #059669;
        .metric-cell {
          justify-content: center;
          font-weight: 600;
  color: #374151;
        .real-time-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        .stat-item {
          display: flex;
          align-items: center;
  gap: 0.75rem;
          padding: 1rem;
  border: 1px solid #e5e7eb;
          border-radius: 6px;
        .stat-icon {
          flex-shrink: 0;
        .stat-content {
          flex: 1;
        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
  color: #1f2937;
          line-height: 1;
        .stat-label {
          font-size: 0.875rem;
  color: #6b7280;
          margin-top: 0.25rem;
        @media (max-width: 1200px) {
          .overview-cards {
            grid-template-columns: repeat(2, 1fr);
          .real-time-stats {
            grid-template-columns: repeat(2, 1fr);
          .weights-grid {
            grid-template-columns: 1fr;
          .filters-grid {
            grid-template-columns: 1fr;
          .filter-item.span-2 {
            grid-column: span 1;
        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
  gap: 1rem;
          .overview-cards {
            grid-template-columns: 1fr;
          .real-time-stats {
            grid-template-columns: 1fr;
          .algorithm-header {
            flex-direction: column;
  gap: 0.75rem;
          .ab-header {
            flex-direction: column;
            align-items: stretch;
  gap: 1rem;
          .variant-item {
            flex-direction: column;
            align-items: stretch;
  gap: 0.75rem;
      ` })] });
                ;
            }
            ;
            export default RecommendationEngineAdmin;
        }
    }
}

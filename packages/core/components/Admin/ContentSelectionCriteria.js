import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Content Selection Criteria - E17-1753114397323-A4BE50
 *
 * Administrative interface for creating and managing content selection criteria
 * Part of Epic 17.5.2 - Featured Content Tools (Backstage Admin Controls)
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs.js';
import { Settings, Filter, Users, TrendingUp, Star, Download, Tag, Plus, Trash2, Copy, Eye, Play, Save, RefreshCw, Target } from 'lucide-react';
export const ContentSelectionCriteria = ({ className = '' }) => {
    const [activeTab, setActiveTab] = useState('builder');
    const [currentCriteria, setCurrentCriteria] = useState({});
    const [templates] = useState([
        {
            id: 'template-trending',
            name: 'Trending Content',
            description: 'High-performing content with recent engagement',
            category: 'trending',
            criteria: {
                min_rating: 4.0,
                min_download_count: 100,
                published_after: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                min_engagement_score: 75,
                exclude_recently_promoted: true,
                max_content_count: 20
            },
            is_system_template: true,
            usage_count: 45,
            created_by: 'system',
            created_at: new Date('2024-01-15'),
            last_used: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
            id: 'template-quality',
            name: 'Premium Quality',
            description: 'Highest quality content from top creators',
            category: 'quality',
            criteria: {
                min_rating: 4.5,
                quality_score_threshold: 90,
                creator_tiers: ['premium', 'verified'],
                min_download_count: 500,
                exclude_current_promotions: true,
                diversification_rules: [
                    { attribute: 'creator', max_percentage: 30, enforce_uniqueness: true },
                    { attribute: 'category', max_percentage: 40, enforce_uniqueness: false }
                ]
            },
            is_system_template: true,
            usage_count: 78,
            created_by: 'system',
            created_at: new Date('2024-01-10'),
            last_used: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
    ]);
    const [previewData] = useState({
        total_matches: 187,
        sample_content: [
            {
                id: 'content-1',
                title: 'Professional Business Card Template',
                creator: 'DesignPro',
                rating: 4.8,
                downloads: 2450,
                category: 'Business',
                match_reasons: ['High rating', 'Popular downloads', 'Premium creator']
            },
            {
                id: 'content-2',
                title: 'Modern Wedding Invitation Suite',
                creator: 'EventDesigns',
                rating: 4.7,
                downloads: 1890,
                category: 'Events',
                match_reasons: ['Quality score', 'Recent engagement', 'Trending']
            }
        ],
        category_distribution: {
            'Business': 45,
            'Events': 32,
            'Marketing': 28,
            'Creative': 25,
            'Educational': 18
        },
        creator_distribution: {
            'Premium': 67,
            'Verified': 89,
            'Community': 31
        },
        quality_stats: {
            avg_rating: 4.6,
            avg_downloads: 1845,
            avg_engagement: 82.5
        },
        performance_prediction: {
            expected_ctr: 3.8,
            expected_conversion_rate: 12.4,
            confidence_level: 0.85
        }
    });
    const categories = ['Business', 'Events', 'Marketing', 'Creative', 'Educational', 'Technology'];
    const contentTypes = ['Template', 'Asset Pack', 'Component', 'Theme', 'Tool'];
    const _____languages = ['English', 'Spanish', 'French', 'German', 'Portuguese'];
    const creatorTiers = ['premium', 'verified', 'community'];
    const getCategoryColor = (category) => {
        const colors = {
            'trending': 'text-orange-600 bg-orange-100',
            'quality': 'text-purple-600 bg-purple-100',
            'performance': 'text-green-600 bg-green-100',
            'diversity': 'text-blue-600 bg-blue-100',
            'seasonal': 'text-pink-600 bg-pink-100',
            'custom': 'text-gray-600 bg-gray-100'
        };
        return colors[category] || 'text-gray-600 bg-gray-100';
    };
    const renderCriteriaBuilder = () => (_jsxs("div", { className: "criteria-builder", children: [_jsxs("div", { className: "builder-sections", children: [_jsxs(Card, { className: "builder-section", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "section-title", children: [_jsx(Star, { className: "w-5 h-5 text-yellow-500" }), "Quality Filters"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "filter-grid", children: [_jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Minimum Rating" }), _jsxs("div", { className: "input-with-unit", children: [_jsx("input", { type: "number", min: "1", max: "5", step: "0.1", value: currentCriteria.min_rating || '', onChange: (e) => setCurrentCriteria({
                                                                ...currentCriteria,
                                                                min_rating: parseFloat(e.target.value) || undefined
                                                            }), className: "criteria-input", placeholder: "4.0" }), _jsx("span", { className: "input-unit", children: "stars" })] })] }), _jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Minimum Downloads" }), _jsxs("div", { className: "input-with-unit", children: [_jsx("input", { type: "number", min: "0", value: currentCriteria.min_download_count || '', onChange: (e) => setCurrentCriteria({
                                                                ...currentCriteria,
                                                                min_download_count: parseInt(e.target.value) || undefined
                                                            }), className: "criteria-input", placeholder: "100" }), _jsx("span", { className: "input-unit", children: "downloads" })] })] }), _jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Quality Score Threshold" }), _jsxs("div", { className: "input-with-unit", children: [_jsx("input", { type: "number", min: "0", max: "100", value: currentCriteria.quality_score_threshold || '', onChange: (e) => setCurrentCriteria({
                                                                ...currentCriteria,
                                                                quality_score_threshold: parseInt(e.target.value) || undefined
                                                            }), className: "criteria-input", placeholder: "80" }), _jsx("span", { className: "input-unit", children: "%" })] })] })] }) })] }), _jsxs(Card, { className: "builder-section", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "section-title", children: [_jsx(Tag, { className: "w-5 h-5 text-blue-500" }), "Category & Content Filters"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "filter-grid", children: [_jsxs("div", { className: "filter-item span-2", children: [_jsx("label", { children: "Include Categories" }), _jsx("div", { className: "multi-select", children: categories.map(category => (_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: currentCriteria.categories?.includes(category) || false, onChange: (e) => {
                                                                    const categories = currentCriteria.categories || [];
                                                                    if (e.target.checked) {
                                                                        setCurrentCriteria({
                                                                            ...currentCriteria,
                                                                            categories: [...categories, category]
                                                                        });
                                                                    }
                                                                    else {
                                                                        setCurrentCriteria({
                                                                            ...currentCriteria,
                                                                            categories: categories.filter(c => c !== category)
                                                                        });
                                                                    }
                                                                } }), _jsx("span", { children: category })] }, category))) })] }), _jsxs("div", { className: "filter-item span-2", children: [_jsx("label", { children: "Content Types" }), _jsx("div", { className: "multi-select", children: contentTypes.map(type => (_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: currentCriteria.content_types?.includes(type) || false, onChange: (e) => {
                                                                    const types = currentCriteria.content_types || [];
                                                                    if (e.target.checked) {
                                                                        setCurrentCriteria({
                                                                            ...currentCriteria,
                                                                            content_types: [...types, type]
                                                                        });
                                                                    }
                                                                    else {
                                                                        setCurrentCriteria({
                                                                            ...currentCriteria,
                                                                            content_types: types.filter(t => t !== type)
                                                                        });
                                                                    }
                                                                } }), _jsx("span", { children: type })] }, type))) })] })] }) })] }), _jsxs(Card, { className: "builder-section", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "section-title", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-green-500" }), "Performance Filters"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "filter-grid", children: [_jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Min Conversion Rate" }), _jsxs("div", { className: "input-with-unit", children: [_jsx("input", { type: "number", min: "0", max: "100", step: "0.1", value: currentCriteria.min_conversion_rate || '', onChange: (e) => setCurrentCriteria({
                                                                ...currentCriteria,
                                                                min_conversion_rate: parseFloat(e.target.value) || undefined
                                                            }), className: "criteria-input", placeholder: "5.0" }), _jsx("span", { className: "input-unit", children: "%" })] })] }), _jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Min Engagement Score" }), _jsxs("div", { className: "input-with-unit", children: [_jsx("input", { type: "number", min: "0", max: "100", value: currentCriteria.min_engagement_score || '', onChange: (e) => setCurrentCriteria({
                                                                ...currentCriteria,
                                                                min_engagement_score: parseInt(e.target.value) || undefined
                                                            }), className: "criteria-input", placeholder: "70" }), _jsx("span", { className: "input-unit", children: "pts" })] })] })] }) })] }), _jsxs(Card, { className: "builder-section", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "section-title", children: [_jsx(Users, { className: "w-5 h-5 text-purple-500" }), "Creator & Time Filters"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "filter-grid", children: [_jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Creator Tiers" }), _jsx("div", { className: "multi-select", children: creatorTiers.map(tier => (_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: currentCriteria.creator_tiers?.includes(tier) || false, onChange: (e) => {
                                                                    const tiers = currentCriteria.creator_tiers || [];
                                                                    if (e.target.checked) {
                                                                        setCurrentCriteria({
                                                                            ...currentCriteria,
                                                                            creator_tiers: [...tiers, tier]
                                                                        });
                                                                    }
                                                                    else {
                                                                        setCurrentCriteria({
                                                                            ...currentCriteria,
                                                                            creator_tiers: tiers.filter(t => t !== tier)
                                                                        });
                                                                    }
                                                                } }), _jsx("span", { className: "capitalize", children: tier })] }, tier))) })] }), _jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Published After" }), _jsx("input", { type: "date", value: currentCriteria.published_after ?
                                                        currentCriteria.published_after.toISOString().split('T')[0] : '', onChange: (e) => setCurrentCriteria({
                                                        ...currentCriteria,
                                                        published_after: e.target.value ? new Date(e.target.value) : undefined
                                                    }), className: "criteria-input" })] })] }) })] }), _jsxs(Card, { className: "builder-section", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "section-title", children: [_jsx(Settings, { className: "w-5 h-5 text-gray-500" }), "Advanced Settings"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "filter-grid", children: [_jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Max Content Count" }), _jsx("input", { type: "number", min: "1", value: currentCriteria.max_content_count || '', onChange: (e) => setCurrentCriteria({
                                                        ...currentCriteria,
                                                        max_content_count: parseInt(e.target.value) || undefined
                                                    }), className: "criteria-input", placeholder: "50" })] }), _jsx("div", { className: "filter-item span-2", children: _jsxs("div", { className: "checkbox-group", children: [_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: currentCriteria.exclude_recently_promoted || false, onChange: (e) => setCurrentCriteria({
                                                                    ...currentCriteria,
                                                                    exclude_recently_promoted: e.target.checked
                                                                }) }), _jsx("span", { children: "Exclude recently promoted content" })] }), _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: currentCriteria.exclude_current_promotions || false, onChange: (e) => setCurrentCriteria({
                                                                    ...currentCriteria,
                                                                    exclude_current_promotions: e.target.checked
                                                                }) }), _jsx("span", { children: "Exclude currently promoted content" })] })] }) })] }) })] })] }), _jsxs("div", { className: "builder-actions", children: [_jsxs(Button, { variant: "outline", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Reset"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Copy, { className: "w-4 h-4 mr-2" }), "Copy from Template"] }), _jsxs(Button, { children: [_jsx(Eye, { className: "w-4 h-4 mr-2" }), "Preview Selection"] }), _jsxs(Button, { className: "bg-green-600 hover:bg-green-700", children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save Criteria"] })] })] }));
    const renderTemplates = () => (_jsxs("div", { className: "templates-section", children: [_jsxs("div", { className: "templates-header", children: [_jsx("h3", { children: "Selection Criteria Templates" }), _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Template"] })] }), _jsx("div", { className: "templates-grid", children: templates.map(template => (_jsxs(Card, { className: "template-card", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "template-header", children: [_jsxs("div", { className: "template-info", children: [_jsx("h4", { children: template.name }), _jsx("p", { children: template.description })] }), _jsx(Badge, { className: getCategoryColor(template.category), children: template.category.toUpperCase() })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "template-stats", children: [_jsxs("div", { className: "stat-group", children: [_jsx("span", { className: "stat-label", children: "Usage" }), _jsxs("span", { className: "stat-value", children: [template.usage_count, " times"] })] }), _jsxs("div", { className: "stat-group", children: [_jsx("span", { className: "stat-label", children: "Last Used" }), _jsx("span", { className: "stat-value", children: template.last_used ? template.last_used.toLocaleDateString() : 'Never' })] })] }), _jsxs("div", { className: "template-preview", children: [_jsx("h5", { children: "Criteria Overview" }), _jsxs("div", { className: "criteria-tags", children: [template.criteria.min_rating && (_jsxs(Badge, { className: "criteria-tag", children: [_jsx(Star, { className: "w-3 h-3 mr-1" }), template.criteria.min_rating, "+ rating"] })), template.criteria.min_download_count && (_jsxs(Badge, { className: "criteria-tag", children: [_jsx(Download, { className: "w-3 h-3 mr-1" }), template.criteria.min_download_count, "+ downloads"] })), template.criteria.creator_tiers && (_jsxs(Badge, { className: "criteria-tag", children: [_jsx(Users, { className: "w-3 h-3 mr-1" }), template.criteria.creator_tiers.join(', ')] }))] })] }), _jsxs("div", { className: "template-actions", children: [_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Eye, { className: "w-4 h-4 mr-1" }), "Preview"] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Copy, { className: "w-4 h-4 mr-1" }), "Use Template"] }), !template.is_system_template && (_jsxs(Button, { size: "sm", variant: "outline", className: "text-red-600", children: [_jsx(Trash2, { className: "w-4 h-4 mr-1" }), "Delete"] }))] })] })] }, template.id))) })] }));
    const renderPreview = () => (_jsxs("div", { className: "preview-section", children: [_jsxs("div", { className: "preview-header", children: [_jsx("h3", { children: "Selection Preview" }), _jsxs("div", { className: "preview-actions", children: [_jsxs(Button, { variant: "outline", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh Preview"] }), _jsxs(Button, { children: [_jsx(Play, { className: "w-4 h-4 mr-2" }), "Apply Selection"] })] })] }), _jsxs("div", { className: "preview-metrics", children: [_jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsx("div", { className: "metric-value", children: previewData.total_matches }), _jsx("div", { className: "metric-label", children: "Total Matches" })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsx("div", { className: "metric-value", children: previewData.quality_stats.avg_rating.toFixed(1) }), _jsx("div", { className: "metric-label", children: "Avg Rating" })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsx("div", { className: "metric-value", children: previewData.quality_stats.avg_downloads.toLocaleString() }), _jsx("div", { className: "metric-label", children: "Avg Downloads" })] }) }), _jsx(Card, { className: "metric-card", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "metric-value", children: [previewData.performance_prediction.expected_ctr.toFixed(1), "%"] }), _jsx("div", { className: "metric-label", children: "Expected CTR" })] }) })] }), _jsxs("div", { className: "preview-content", children: [_jsx("div", { className: "preview-left", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Sample Content" }) }), _jsx(CardContent, { children: _jsx("div", { className: "sample-content-list", children: previewData.sample_content.map(content => (_jsxs("div", { className: "sample-content-item", children: [_jsxs("div", { className: "content-info", children: [_jsx("h5", { children: content.title }), _jsxs("div", { className: "content-meta", children: [_jsxs("span", { children: ["by ", content.creator] }), _jsx(Badge, { className: "category-badge", children: content.category })] }), _jsxs("div", { className: "content-stats", children: [_jsxs("span", { children: ["\u2605 ", content.rating] }), _jsxs("span", { children: ["\u2193 ", content.downloads.toLocaleString()] })] })] }), _jsx("div", { className: "match-reasons", children: content.match_reasons.map(reason => (_jsx(Badge, { className: "reason-badge", children: reason }, reason))) })] }, content.id))) }) })] }) }), _jsx("div", { className: "preview-right", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Distribution Analysis" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "distribution-charts", children: [_jsxs("div", { className: "chart-section", children: [_jsx("h5", { children: "By Category" }), _jsx("div", { className: "distribution-bars", children: Object.entries(previewData.category_distribution).map(([category, count]) => (_jsxs("div", { className: "distribution-bar", children: [_jsx("span", { className: "bar-label", children: category }), _jsx("div", { className: "bar-container", children: _jsx("div", { className: "bar-fill", style: { width: `${(count / previewData.total_matches) * 100}%` } }) }), _jsx("span", { className: "bar-value", children: count })] }, category))) })] }), _jsxs("div", { className: "chart-section", children: [_jsx("h5", { children: "Performance Prediction" }), _jsxs("div", { className: "prediction-metrics", children: [_jsxs("div", { className: "prediction-item", children: [_jsx("span", { className: "prediction-label", children: "Expected CTR" }), _jsxs("span", { className: "prediction-value", children: [previewData.performance_prediction.expected_ctr.toFixed(1), "%"] })] }), _jsxs("div", { className: "prediction-item", children: [_jsx("span", { className: "prediction-label", children: "Expected Conversion" }), _jsxs("span", { className: "prediction-value", children: [previewData.performance_prediction.expected_conversion_rate.toFixed(1), "%"] })] }), _jsxs("div", { className: "prediction-item", children: [_jsx("span", { className: "prediction-label", children: "Confidence Level" }), _jsxs("span", { className: "prediction-value", children: [(previewData.performance_prediction.confidence_level * 100).toFixed(0), "%"] })] })] })] })] }) })] }) })] })] }));
    return (_jsxs("div", { className: `content-selection-criteria ${className}`, children: [_jsx("div", { className: "criteria-header", children: _jsxs("div", { className: "header-info", children: [_jsx("h2", { children: "Content Selection Criteria" }), _jsx("p", { children: "Create and manage criteria for featured content selection" })] }) }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "criteria-tabs", children: [_jsxs(TabsList, { className: "grid grid-cols-3 w-full", children: [_jsxs(TabsTrigger, { value: "builder", children: [_jsx(Filter, { className: "w-4 h-4 mr-2" }), "Criteria Builder"] }), _jsxs(TabsTrigger, { value: "templates", children: [_jsx(Target, { className: "w-4 h-4 mr-2" }), "Templates"] }), _jsxs(TabsTrigger, { value: "preview", children: [_jsx(Eye, { className: "w-4 h-4 mr-2" }), "Preview"] })] }), _jsx(TabsContent, { value: "builder", className: "tab-content", children: renderCriteriaBuilder() }), _jsx(TabsContent, { value: "templates", className: "tab-content", children: renderTemplates() }), _jsx(TabsContent, { value: "preview", className: "tab-content", children: renderPreview() })] }), _jsx("style", { jsx: true, children: `
        .content-selection-criteria {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .criteria-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-info h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .header-info p {
          color: #6b7280;
          font-size: 1rem;
        }

        .criteria-builder {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .builder-sections {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .builder-section .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-item.span-2 {
          grid-column: span 2;
        }

        .filter-item label {
          font-weight: 500;
          color: #374151;
        }

        .criteria-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .criteria-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .input-with-unit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .input-with-unit .criteria-input {
          flex: 1;
        }

        .input-unit {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .multi-select {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: #374151;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .builder-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .templates-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .templates-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .templates-header h3 {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1rem;
        }

        .template-card .card-content {
          padding-top: 0;
        }

        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .template-info h4 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .template-info p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }

        .template-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .stat-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 600;
        }

        .template-preview h5 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .criteria-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-bottom: 1rem;
        }

        .criteria-tag {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          color: #374151;
          display: flex;
          align-items: center;
        }

        .template-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .preview-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .preview-header h3 {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .preview-actions {
          display: flex;
          gap: 0.5rem;
        }

        .preview-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .metric-card .card-content {
          text-align: center;
          padding: 1.5rem;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }

        .preview-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .sample-content-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .sample-content-item {
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .content-info h5 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .content-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .content-meta span {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .category-badge {
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
        }

        .content-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .match-reasons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .reason-badge {
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          background: #eff6ff;
          color: #1e40af;
        }

        .distribution-charts {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .chart-section h5 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.75rem 0;
        }

        .distribution-bars {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .distribution-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .bar-label {
          font-size: 0.875rem;
          color: #374151;
          min-width: 80px;
        }

        .bar-container {
          flex: 1;
          height: 20px;
          background: #f3f4f6;
          border-radius: 10px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .bar-value {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 600;
          min-width: 30px;
          text-align: right;
        }

        .prediction-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .prediction-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .prediction-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .prediction-value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 600;
        }

        @media (max-width: 1200px) {
          .preview-content {
            grid-template-columns: 1fr;
          }
          
          .preview-metrics {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .filter-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-item.span-2 {
            grid-column: span 1;
          }
        }

        @media (max-width: 768px) {
          .criteria-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .preview-metrics {
            grid-template-columns: 1fr;
          }
          
          .templates-grid {
            grid-template-columns: 1fr;
          }
          
          .builder-actions {
            flex-wrap: wrap;
          }
          
          .multi-select {
            flex-direction: column;
          }
        }
      ` })] }));
};
export default ContentSelectionCriteria;

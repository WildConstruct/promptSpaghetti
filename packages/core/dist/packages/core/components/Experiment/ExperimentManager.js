import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 14 Story 14.4 - Experiment Management System
 * Comprehensive experiment lifecycle management
 */
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Progress } from '../ui/Progress';
import { Plus, Search, Play, Pause, Copy, Edit, Clock, Users, BarChart, Download, Upload, Star, Tag, Calendar, TrendingUp, CheckCircle, Eye, ExternalLink } from 'lucide-react';
export const ExperimentManager = ({ experiments, templates, knowledgeBase, onCreateExperiment, onEditExperiment, onViewResults, onDuplicateExperiment, onArchiveExperiment, onStartExperiment, onPauseExperiment, onStopExperiment, onExportExperiments, onImportTemplate, onCreateTemplate, className = '' }) => {
    const [state, setState] = useState({
        activeTab: 'experiments',
        searchQuery: '',
        statusFilter: 'all',
        typeFilter: 'all',
        tagFilter: '',
        sortBy: 'updated',
        sortOrder: 'desc',
        selectedExperiments: [],
        showArchived: false
    });
    /**
     * Filter and sort experiments
     */
    const filteredExperiments = React.useMemo(() => {
        const filtered = experiments.filter(experiment => {
            // Text search
            if (state.searchQuery) {
                const query = state.searchQuery.toLowerCase();
                if (!experiment.name.toLowerCase().includes(query) &&
                    !experiment.hypothesis.toLowerCase().includes(query) &&
                    !experiment.tags.some(tag => tag.toLowerCase().includes(query))) {
                    return false;
                }
            }
            // Status filter
            if (state.statusFilter !== 'all' && experiment.status !== state.statusFilter) {
                return false;
            }
            // Type filter
            if (state.typeFilter !== 'all' && experiment.type !== state.typeFilter) {
                return false;
            }
            // Tag filter
            if (state.tagFilter && !experiment.tags.includes(state.tagFilter)) {
                return false;
            }
            // Archive filter
            if (!state.showArchived && experiment.status === 'archived') {
                return false;
            }
            return true;
        });
        // Sort
        filtered.sort((a, b) => {
            let aValue, bValue;
            switch (state.sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'created':
                    aValue = a.createdAt.getTime();
                    bValue = b.createdAt.getTime();
                    break;
                case 'updated':
                default:
                    aValue = a.updatedAt.getTime();
                    bValue = b.updatedAt.getTime();
                    break;
            }
            if (aValue < bValue)
                return state.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue)
                return state.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [experiments, state]);
    /**
     * Get experiment statistics
     */
    const experimentStats = React.useMemo(() => {
        const stats = {
            total: experiments.length,
            running: experiments.filter(e => e.status === 'running').length,
            draft: experiments.filter(e => e.status === 'draft').length,
            completed: experiments.filter(e => e.status === 'completed').length,
            archived: experiments.filter(e => e.status === 'archived').length
        };
        return stats;
    }, [experiments]);
    /**
     * Get all unique tags
     */
    const allTags = React.useMemo(() => {
        const tags = new Set();
        experiments.forEach(exp => exp.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, [experiments]);
    /**
     * Handle bulk actions
     */
    const handleBulkAction = useCallback(async (action) => {
        if (state.selectedExperiments.length === 0)
            return;
        try {
            switch (action) {
                case 'archive':
                    for (const id of state.selectedExperiments) {
                        await onArchiveExperiment(id);
                    }
                    break;
                case 'export':
                    await onExportExperiments('json');
                    break;
            }
            setState(prev => ({ ...prev, selectedExperiments: [] }));
        }
        catch (error) {
            console.error('Bulk action failed:', error);
        }
    }, [state.selectedExperiments, onArchiveExperiment, onExportExperiments]);
    /**
     * Toggle experiment selection
     */
    const toggleExperimentSelection = useCallback((experimentId) => {
        setState(prev => ({
            ...prev,
            selectedExperiments: prev.selectedExperiments.includes(experimentId)
                ? prev.selectedExperiments.filter(id => id !== experimentId)
                : [...prev.selectedExperiments, experimentId]
        }));
    }, []);
    /**
     * Get status badge variant
     */
    const getStatusVariant = useCallback((status) => {
        switch (status) {
            case 'running': return 'default';
            case 'completed': return 'default';
            case 'paused': return 'secondary';
            case 'archived': return 'outline';
            default: return 'secondary';
        }
    }, []);
    /**
     * Format duration
     */
    const formatDuration = useCallback((startDate, endDate) => {
        const end = endDate || new Date();
        const diff = end.getTime() - startDate.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return `${days} day${days !== 1 ? 's' : ''}`;
    }, []);
    return (_jsxs("div", { className: `experiment-manager ${className}`, children: [_jsxs("div", { className: "manager-header", children: [_jsxs("div", { className: "header-info", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Experiment Management" }), _jsxs("div", { className: "stats-summary flex space-x-4 text-sm text-gray-600", children: [_jsxs("span", { children: [experimentStats.total, " Total"] }), _jsxs("span", { children: [experimentStats.running, " Running"] }), _jsxs("span", { children: [experimentStats.completed, " Completed"] })] })] }), _jsxs("div", { className: "header-actions", children: [_jsxs(Button, { variant: "outline", onClick: () => onExportExperiments('csv'), children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export"] }), _jsxs(Button, { onClick: () => onCreateExperiment(), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Experiment"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Running" }), _jsx("div", { className: "text-2xl font-bold", children: experimentStats.running })] }), _jsx(Play, { className: "w-8 h-8 text-green-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Draft" }), _jsx("div", { className: "text-2xl font-bold", children: experimentStats.draft })] }), _jsx(Edit, { className: "w-8 h-8 text-blue-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Completed" }), _jsx("div", { className: "text-2xl font-bold", children: experimentStats.completed })] }), _jsx(CheckCircle, { className: "w-8 h-8 text-green-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Success Rate" }), _jsxs("div", { className: "text-2xl font-bold", children: [experimentStats.completed > 0
                                                        ? Math.round((experimentStats.completed / (experimentStats.completed + experimentStats.archived)) * 100)
                                                        : 0, "%"] })] }), _jsx(TrendingUp, { className: "w-8 h-8 text-purple-500" })] }) }) })] }), _jsxs(Tabs, { value: state.activeTab, onValueChange: (tab) => setState(prev => ({ ...prev, activeTab: tab })), children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "experiments", children: "Experiments" }), _jsx(TabsTrigger, { value: "templates", children: "Templates" }), _jsx(TabsTrigger, { value: "knowledge", children: "Knowledge Base" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsxs(TabsContent, { value: "experiments", className: "space-y-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-6 gap-4", children: [_jsx("div", { className: "md:col-span-2", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" }), _jsx(Input, { value: state.searchQuery, onChange: (e) => setState(prev => ({ ...prev, searchQuery: e.target.value })), placeholder: "Search experiments...", className: "pl-10" })] }) }), _jsxs(Select, { value: state.statusFilter, onValueChange: (value) => setState(prev => ({ ...prev, statusFilter: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Status" }), _jsx(SelectItem, { value: "draft", children: "Draft" }), _jsx(SelectItem, { value: "running", children: "Running" }), _jsx(SelectItem, { value: "paused", children: "Paused" }), _jsx(SelectItem, { value: "completed", children: "Completed" }), _jsx(SelectItem, { value: "archived", children: "Archived" })] })] }), _jsxs(Select, { value: state.typeFilter, onValueChange: (value) => setState(prev => ({ ...prev, typeFilter: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), _jsx(SelectItem, { value: "prompt", children: "Prompt" }), _jsx(SelectItem, { value: "graph", children: "Graph" }), _jsx(SelectItem, { value: "feature_flag", children: "Feature Flag" })] })] }), _jsxs(Select, { value: state.tagFilter, onValueChange: (value) => setState(prev => ({ ...prev, tagFilter: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Tag" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "", children: "All Tags" }), allTags.map(tag => (_jsx(SelectItem, { value: tag, children: tag }, tag)))] })] }), _jsxs(Select, { value: `${state.sortBy}-${state.sortOrder}`, onValueChange: (value) => {
                                                        const [sortBy, sortOrder] = value.split('-');
                                                        setState(prev => ({ ...prev,
                                                            sortBy: sortBy,
                                                            sortOrder: sortOrder }));
                                                    }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Sort" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "updated-desc", children: "Latest Updated" }), _jsx(SelectItem, { value: "created-desc", children: "Latest Created" }), _jsx(SelectItem, { value: "name-asc", children: "Name A-Z" }), _jsx(SelectItem, { value: "status-asc", children: "Status" })] })] })] }), _jsxs("div", { className: "flex items-center justify-between mt-4", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("label", { className: "flex items-center text-sm", children: [_jsx("input", { type: "checkbox", checked: state.showArchived, onChange: (e) => setState(prev => ({ ...prev, showArchived: e.target.checked })), className: "mr-2" }), "Show Archived"] }), state.selectedExperiments.length > 0 && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-sm text-gray-600", children: [state.selectedExperiments.length, " selected"] }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleBulkAction('archive'), children: "Archive" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleBulkAction('export'), children: "Export" })] }))] }), _jsxs("div", { className: "text-sm text-gray-600", children: [filteredExperiments.length, " of ", experiments.length, " experiments"] })] })] }) }), _jsx("div", { className: "space-y-3", children: filteredExperiments.map((experiment) => (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "checkbox", checked: state.selectedExperiments.includes(experiment.id), onChange: () => toggleExperimentSelection(experiment.id), className: "rounded" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx("h3", { className: "font-semibold text-lg", children: experiment.name }), _jsx(Badge, { variant: getStatusVariant(experiment.status), children: experiment.status }), _jsx(Badge, { variant: "outline", children: experiment.type })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2 line-clamp-2", children: experiment.hypothesis }), _jsxs("div", { className: "flex items-center space-x-4 text-xs text-gray-500", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(Users, { className: "w-3 h-3 mr-1" }), experiment.variants.length, " variants"] }), _jsxs("span", { className: "flex items-center", children: [_jsx(BarChart, { className: "w-3 h-3 mr-1" }), experiment.metrics.length, " metrics"] }), _jsxs("span", { className: "flex items-center", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), formatDuration(experiment.createdAt, experiment.status === 'completed' ? experiment.schedule?.endAt : undefined)] }), _jsxs("span", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-3 h-3 mr-1" }), experiment.updatedAt.toLocaleDateString()] })] }), experiment.tags.length > 0 && (_jsxs("div", { className: "flex items-center space-x-1 mt-2", children: [_jsx(Tag, { className: "w-3 h-3 text-gray-400" }), experiment.tags.map(tag => (_jsx(Badge, { variant: "outline", className: "text-xs", children: tag }, tag)))] }))] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [experiment.status === 'completed' && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => onViewResults(experiment.id), children: [_jsx(Eye, { className: "w-4 h-4 mr-1" }), "Results"] })), experiment.status === 'draft' && (_jsxs(Button, { size: "sm", onClick: () => onStartExperiment(experiment.id), children: [_jsx(Play, { className: "w-4 h-4 mr-1" }), "Start"] })), experiment.status === 'running' && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => onPauseExperiment(experiment.id), children: [_jsx(Pause, { className: "w-4 h-4 mr-1" }), "Pause"] })), _jsx(Button, { size: "sm", variant: "outline", onClick: () => onEditExperiment(experiment.id), children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => onDuplicateExperiment(experiment.id), children: _jsx(Copy, { className: "w-4 h-4" }) })] })] }) }) }, experiment.id))) }), filteredExperiments.length === 0 && (_jsx(Card, { children: _jsxs(CardContent, { className: "text-center py-8", children: [_jsx("div", { className: "text-gray-500", children: "No experiments found matching your criteria" }), _jsxs(Button, { className: "mt-4", onClick: () => onCreateExperiment(), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Your First Experiment"] })] }) }))] }), _jsxs(TabsContent, { value: "templates", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Experiment Templates" }), _jsxs(Button, { variant: "outline", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), "Import Template"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: templates.map((template) => (_jsxs(Card, { className: "hover:shadow-md transition-shadow cursor-pointer", onClick: () => onCreateExperiment(template), children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsx(CardTitle, { className: "text-base", children: template.name }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Star, { className: "w-4 h-4 text-yellow-500" }), _jsxs("span", { className: "text-sm", children: [template.successRate.toFixed(1), "%"] })] })] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-gray-600 mb-3 line-clamp-2", children: template.description }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { children: [template.variants.length, " variants"] }), _jsxs("span", { children: [template.timesUsed, " uses"] }), _jsx(Badge, { variant: "outline", children: template.category })] }), _jsxs("div", { className: "mt-3", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "Avg Uplift" }), _jsx(Progress, { value: template.averageUplift, className: "h-2" }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["+", template.averageUplift.toFixed(1), "%"] })] })] })] }, template.id))) })] }), _jsxs(TabsContent, { value: "knowledge", className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Experiment Insights & Learnings" }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Select, { defaultValue: "all", children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "Category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), _jsx(SelectItem, { value: "prompt", children: "Prompt Optimization" }), _jsx(SelectItem, { value: "performance", children: "Performance" }), _jsx(SelectItem, { value: "cost", children: "Cost Optimization" })] })] }), _jsx(Input, { placeholder: "Search insights...", className: "w-64" })] })] }), _jsx("div", { className: "space-y-4", children: knowledgeBase.map((entry) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsx(CardTitle, { className: "text-base", children: entry.title }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Badge, { variant: entry.impact === 'high' ? 'default' : 'secondary', children: [entry.impact, " impact"] }), _jsx(Badge, { variant: "outline", children: entry.category })] })] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-gray-600 mb-3", children: entry.summary }), entry.insights.length > 0 && (_jsxs("div", { className: "mb-3", children: [_jsx("div", { className: "text-sm font-medium mb-1", children: "Key Insights:" }), _jsx("ul", { className: "text-sm text-gray-600 list-disc list-inside space-y-1", children: entry.insights.slice(0, 2).map((insight, index) => (_jsx("li", { children: insight }, index))) })] })), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { children: ["Confidence: ", (entry.confidence * 100).toFixed(0), "%"] }), _jsx("span", { children: entry.createdAt.toLocaleDateString() }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(ExternalLink, { className: "w-3 h-3 mr-1" }), "View Experiment"] })] })] })] }, entry.id))) })] }), _jsxs(TabsContent, { value: "analytics", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Experiments Over Time" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center text-gray-500", children: "Chart showing experiment creation and completion trends" }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Success Rate by Type" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: ['prompt', 'graph', 'feature_flag'].map(type => {
                                                        const typeExperiments = experiments.filter(e => e.type === type);
                                                        const successRate = typeExperiments.length > 0
                                                            ? (typeExperiments.filter(e => e.status === 'completed').length / typeExperiments.length) * 100
                                                            : 0;
                                                        return (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm capitalize", children: type }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: successRate, className: "w-20 h-2" }), _jsxs("span", { className: "text-sm text-gray-600 w-12", children: [successRate.toFixed(0), "%"] })] })] }, type));
                                                    }) }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: experiments.filter(e => e.status === 'completed').length }), _jsx("div", { className: "text-sm text-gray-600", children: "Successful Experiments" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: Math.round(experiments.reduce((acc, exp) => acc + exp.variants.length, 0) / experiments.length) || 0 }), _jsx("div", { className: "text-sm text-gray-600", children: "Avg Variants per Experiment" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: templates.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Available Templates" })] }) }) })] })] })] })] }));
};
export default ExperimentManager;

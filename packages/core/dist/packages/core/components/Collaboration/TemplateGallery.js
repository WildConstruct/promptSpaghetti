import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { FileText, Search, Filter, Download, Grid, List, SortAsc } from 'lucide-react';
import { TemplateCard } from './TemplateCard';
import { TemplatePreview } from './TemplatePreview';
import { TemplateCreationDialog } from './TemplateCreationDialog';
import { useTemplates } from '../../hooks/useTemplates';
const TemplateGallery = ({ workspaceId, onSelectTemplate, onCreateFromTemplate, className, showCreateButton = true, allowCreation = true, viewMode = 'grid' }) => {
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState(initialViewMode);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const { templates, categories, loading, error, stats, hasMore, favoriteTemplate, unfavoriteTemplate, loadMore, refreshTemplates } = useTemplates({
        workspaceId,
        searchTerm,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        difficulty: difficultyFilter === 'all' ? undefined : difficultyFilter,
        sortBy,
        limit: viewMode === 'grid' ? 12 : 20
    });
    const handleTemplateSelect = useCallback((template) => {
        if (onSelectTemplate) {
            onSelectTemplate(template);
        }
        else {
            setSelectedTemplate(template);
        }
    }, [onSelectTemplate]);
    const handleCreateFromTemplate = useCallback((template, customization) => {
        if (onCreateFromTemplate) {
            onCreateFromTemplate(template, customization);
        }
        setSelectedTemplate(null);
    }, [onCreateFromTemplate]);
    const handleToggleFavorite = useCallback(async (templateId, isFavorited) => {
        try {
            if (isFavorited) {
                await unfavoriteTemplate(templateId);
            }
            else {
                await favoriteTemplate(templateId);
            }
        }
        catch (err) {
            console.error('Failed to toggle favorite:', err);
        }
    }, [favoriteTemplate, unfavoriteTemplate]);
    const renderTemplateGrid = () => (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: templates.map(template => (_jsx(TemplateCard, { template: template, onSelect: handleTemplateSelect, onToggleFavorite: handleToggleFavorite, compact: false }, template.id))) }));
    const renderTemplateList = () => (_jsx("div", { className: "space-y-4", children: templates.map(template => (_jsx(TemplateCard, { template: template, onSelect: handleTemplateSelect, onToggleFavorite: handleToggleFavorite, compact: true }, template.id))) }));
    return (_jsxs("div", { className: `bg-white rounded-lg border border-gray-200 ${className}`, children: [_jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(FileText, { className: "w-6 h-6 text-blue-600" }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Template Gallery" }), stats && (_jsxs("p", { className: "text-sm text-gray-500", children: [stats.total, " templates available", workspaceId && ` • ${stats.workspace_templates || 0} workspace templates`] }))] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "flex items-center border border-gray-300 rounded-md", children: [_jsx("button", { onClick: () => setViewMode('grid'), className: `p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'} transition-colors`, title: "Grid view", children: _jsx(Grid, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setViewMode('list'), className: `p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'} transition-colors`, title: "List view", children: _jsx(List, { className: "w-4 h-4" }) })] }), showCreateButton && allowCreation && (_jsxs("button", { onClick: () => setShowCreateDialog(true), className: "inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors", children: [_jsx(FileText, { className: "w-4 h-4" }), _jsx("span", { children: "Create Template" })] }))] })] }), _jsxs("div", { className: "mt-4 space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search templates...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "inline-flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors", children: [_jsx(Filter, { className: "w-4 h-4" }), _jsx("span", { children: "Filters" })] }), (categoryFilter !== 'all' || difficultyFilter !== 'all') && (_jsxs("div", { className: "flex items-center space-x-2", children: [categoryFilter !== 'all' && (_jsxs("span", { className: "inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full", children: [categoryFilter, _jsx("button", { onClick: () => setCategoryFilter('all'), className: "ml-1 text-blue-600 hover:text-blue-800", children: "\u00D7" })] })), difficultyFilter !== 'all' && (_jsxs("span", { className: "inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full", children: [difficultyFilter, _jsx("button", { onClick: () => setDifficultyFilter('all'), className: "ml-1 text-green-600 hover:text-green-800", children: "\u00D7" })] }))] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(SortAsc, { className: "w-4 h-4 text-gray-400" }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "text-sm border border-gray-300 rounded px-2 py-1", children: [_jsx("option", { value: "popular", children: "Most Popular" }), _jsx("option", { value: "recent", children: "Recently Added" }), _jsx("option", { value: "name", children: "Name" }), _jsx("option", { value: "rating", children: "Highest Rated" })] })] })] }), showFilters && (_jsx("div", { className: "p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Category" }), _jsxs("select", { value: categoryFilter, onChange: (e) => setCategoryFilter(e.target.value), className: "w-full border border-gray-300 rounded-md px-3 py-2 text-sm", children: [_jsx("option", { value: "all", children: "All Categories" }), categories.map(category => (_jsx("option", { value: category, children: category.charAt(0).toUpperCase() + category.slice(1) }, category)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Difficulty" }), _jsxs("select", { value: difficultyFilter, onChange: (e) => setDifficultyFilter(e.target.value), className: "w-full border border-gray-300 rounded-md px-3 py-2 text-sm", children: [_jsx("option", { value: "all", children: "All Levels" }), _jsx("option", { value: "beginner", children: "Beginner" }), _jsx("option", { value: "intermediate", children: "Intermediate" }), _jsx("option", { value: "advanced", children: "Advanced" }), _jsx("option", { value: "expert", children: "Expert" })] })] })] }) }))] })] }), _jsxs("div", { className: "p-6", children: [loading && templates.length === 0 && (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx("div", { className: "animate-pulse space-y-4 w-full", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [...Array(6)].map((_, i) => (_jsx("div", { className: "bg-gray-200 rounded-lg h-48" }, i))) }) }) })), error && (_jsxs("div", { className: "text-center py-12", children: [_jsxs("p", { className: "text-red-600 mb-4", children: ["Error loading templates: ", error.message] }), _jsx("button", { onClick: refreshTemplates, className: "text-blue-600 hover:text-blue-800 transition-colors", children: "Try again" })] })), !loading && !error && templates.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { className: "w-16 h-16 mx-auto mb-4 text-gray-300" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No templates found" }), _jsx("p", { className: "text-gray-500 mb-6", children: searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all'
                                    ? 'Try adjusting your filters or search terms'
                                    : 'Get started by creating your first template' }), allowCreation && (_jsxs("button", { onClick: () => setShowCreateDialog(true), className: "inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors", children: [_jsx(FileText, { className: "w-4 h-4" }), _jsx("span", { children: "Create First Template" })] }))] })), !loading && !error && templates.length > 0 && (_jsxs(_Fragment, { children: [viewMode === 'grid' ? renderTemplateGrid() : renderTemplateList(), hasMore && (_jsx("div", { className: "text-center mt-8", children: _jsx("button", { onClick: loadMore, disabled: loading, className: "inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 transition-colors", children: loading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" }), _jsx("span", { children: "Loading..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "Load More Templates" })] })) }) }))] }))] }), selectedTemplate && (_jsx(TemplatePreview, { template: selectedTemplate, onClose: () => setSelectedTemplate(null), onCreateFromTemplate: handleCreateFromTemplate })), showCreateDialog && (_jsx(TemplateCreationDialog, { workspaceId: workspaceId, onClose: () => setShowCreateDialog(false), onSuccess: (template) => {
                    setShowCreateDialog(false);
                    refreshTemplates();
                } }))] }));
};
export default TemplateGallery;

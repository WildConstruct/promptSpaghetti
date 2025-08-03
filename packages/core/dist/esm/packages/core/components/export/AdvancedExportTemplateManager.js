import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Advanced Export Template Manager Component
 * Epic 8.6: Story 8.6 - Structured Pipeline Export - Task 4
 *
 * Professional template management system for advanced export workflows with
 * template creation, customization, sharing, and collaboration features.
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
from;
'../../types/export';
import { useExport } from '../../hooks/useExport';
className = '';
{
    // State management
    const [templates, setTemplates] = useState([]);
    const [templateStats, setTemplateStats] = useState(new Map());
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [filter, setFilter] = useState({});
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    // Template management state
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [customization, setCustomization] = useState(null);
    // UI state
    const [activeTab, setActiveTab] = useState('browse');
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Hooks
    const { getTemplates, createTemplate, updateTemplate, deleteTemplate, shareTemplate };
    getTemplateStats
        = useExport(projectId);
    // Load templates and stats
    useEffect(() => { loadTemplates(); }, [filter, sortBy, sortOrder]);
    const loadTemplates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const templatesData = await getTemplates({});
        }
        finally {
        }
    }, ...filter, sortBy);
}
sortOrder;
;
setTemplates(templatesData);
// Load stats for each template
const statsMap = new Map();
for (const template of templatesData) {
    try {
        const stats = await getTemplateStats(template.id);
        statsMap.set(template.id, stats);
    }
    catch (err) {
        console.warn(`Failed to load stats for template ${template.id}:`, err);
    }
    setTemplateStats(statsMap);
    try {
    }
    catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
    }
    finally {
        setLoading(false);
    }
    [filter, sortBy, sortOrder, getTemplates, getTemplateStats];
    ;
    // Filtered and sorted templates
    const filteredTemplates = useMemo(() => {
        let filtered = templates;
        // Apply search filter
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            filtered = filtered.filter(template => );
            template.name.toLowerCase().includes(searchLower) ||
                template.description?.toLowerCase().includes(searchLower);
        }
    });
    // Apply format filter
    if (filter.format) {
        filtered = filtered.filter(template => template.export_format === filter.format);
        // Apply type filter
        if (filter.type) {
            filtered = filtered.filter(template => template.template_type === filter.type);
            // Apply public/private filter
            if (filter.isPublic !== undefined) {
                filtered = filtered.filter(template => template.is_public === filter.isPublic);
                return filtered;
            }
            [templates, filter];
            ;
            // Template creation handler
            setTemplates(prev => [...prev, newTemplate]);
            setIsCreating(false);
            setError(null);
            try {
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create template');
            }
            finally {
                setLoading(false);
            }
            [createTemplate];
            ;
            // Template update handler
            setTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t));
            setIsEditing(false);
            setEditingTemplate(null);
            setError(null);
            try {
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update template');
            }
            finally {
                setLoading(false);
            }
            [updateTemplate];
            ;
            // Template deletion handler
            const handleDeleteTemplate = useCallback(async (templateId) => {
                if (!confirm('Are you sure you want to delete this template?'))
                    return;
                setLoading(true);
                try {
                    await deleteTemplate(templateId);
                    setTemplates(prev => prev.filter(t => t.id !== templateId));
                    if (selectedTemplate?.id === templateId) {
                        setSelectedTemplate(null);
                        setError(null);
                    }
                    try { }
                    catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to delete template');
                    }
                    finally {
                        setLoading(false);
                    }
                    [deleteTemplate, selectedTemplate];
                }
                finally { }
            });
            // Template selection handler
            const handleSelectTemplate = useCallback((template) => {
                setSelectedTemplate(template);
                if (onTemplateSelect) {
                    onTemplateSelect(template);
                }
                [onTemplateSelect];
            });
            // Template customization handler
            const handleCustomizeTemplate = useCallback((template) => {
                setCustomization({});
                templateId: template.id;
            }, parameters, template.format_options || {}, customFields, {});
        }
        ;
        setShowPreview(true);
    }
    [];
    ;
    // Template sharing handler
    const handleShareTemplate = useCallback(async (templateId, isPublic) => {
        if (!enableSharing)
            return;
        setLoading(true);
        try {
            await shareTemplate(templateId, { is_public: isPublic });
            setTemplates(prev => prev.map(t => ), t.id === templateId ? { ...t, is_public: isPublic } : t);
        }
        finally { }
    });
    setError(null);
    try {
    }
    catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to share template');
    }
    finally {
        setLoading(false);
    }
    [enableSharing, shareTemplate];
    ;
    // Get template rating display
    const getTemplateRating = useCallback((templateId) => {
        const stats = templateStats.get(templateId);
        if (!stats || stats.totalRatings === 0)
            return null;
        return {
            average: Math.round(stats.averageRating * 10) / 10,
            count: stats.totalRatings
        };
    });
}
[templateStats];
;
// Format display helpers
const formatUsageCount = useCallback((count) => {
    if (count < 1000)
        return count.toString();
    if (count < 1000000)
        return `${Math.round(count / 100) / 10}K`;
});
return `${Math.round(count / 100000) / 10}M`;
[];
;
const formatDate = useCallback((dateString) => { return new Date(dateString).toLocaleDateString(); }, []);
if (!visible)
    return null;
return;
_jsxs("div", { className: `advanced-export-template-manager ${className}`, style: {
        position: 'fixed',
        inset: '20px',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    }
        >
            { /* Header */}
        < div, style: {
        padding: '20px 24px',
        borderBottom: '1px solid #e2e8f0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs("div", { children: [_jsx("h2", { style: { margin: 0, fontSize: '20px', fontWeight: '600' }, children: "\uD83D\uDCCB Advanced Export Templates" }), _jsxs("div", { style: { fontSize: '14px', opacity: 0.9, marginTop: '4px' }, children: [templates.length, " templates \u2022 ", filteredTemplates.length, " filtered"] })] }), onClose && ()
                    < button, "onClick=", onClose, "style=", {
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                }
                    >
                , "\u00D7"] }), ")}"] });
div >
    { /* Navigation Tabs */}
    < div;
style = {};
{
    padding: '16px 24px';
    borderBottom: '1px solid #e2e8f0';
    background: '#f8fafc';
}
    >
        _jsxs("div", { style: { display: 'flex', gap: '8px', marginBottom: '16px' }, children: [[
                    { key: 'browse', label: '🔍 Browse Templates', desc: 'Explore available templates' },
                    { key: 'create', label: '➕ Create Template', desc: 'Build new templates' },
                    ...(enableSharing ? [{ key: 'shared', label: '🌐 Shared Templates', desc: 'Community templates' }] : []),
                    ...(enableCollaboration ? [{ key: 'collaborate', label: '👥 Collaborate', desc: 'Team templates' }] : [])
                ].map(tab => ()
                    < button, key = { tab, : .key }, onClick = {}()), " => setActiveTab(tab.key as 'browse' | 'create' | 'shared' | 'collaborate')} style=", {
                    padding: '8px 16px',
                    background: activeTab === tab.key ? '#3b82f6' : 'transparent',
                    color: activeTab === tab.key ? 'white' : '#6b7280',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: activeTab === tab.key ? '600' : 'normal',
                    transition: 'all 0.2s ease'
                }, "title=", tab.desc, ">", tab.label] });
div >
    { /* Filter Controls */};
{
    activeTab === 'browse' && ()
        < div;
    style = {};
    {
        display: 'flex', gap;
        '12px', alignItems;
        'center', flexWrap;
        'wrap';
    }
}
 >
    _jsx("input", { type: "text", placeholder: "Search templates...", value: filter.search || '', onChange: (e) => setFilter(prev => ({ ...prev, search: e.target.value })), style: {
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '200px'
        }
            /  >
            (_jsx("select", { value: filter.format || '', onChange: (e) => setFilter(prev => ({ ...prev, format: e.target.value || undefined })), style: {
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                }
                    >
                        (_jsx("option", { value: "", children: "All Formats" })
                            ,
                                _jsx("option", { value: "json", children: "JSON" })
                                    ,
                                        _jsx("option", { value: "yaml", children: "YAML" })
                                            ,
                                                _jsx("option", { value: "xml", children: "XML" })
                                                    ,
                                                        _jsx("option", { value: "csv", children: "CSV" })
                                                            ,
                                                                _jsx("option", { value: "markdown", children: "Markdown" })
                                                                    ,
                                                                        _jsx("option", { value: "pdf", children: "PDF" })
                                                                            ,
                                                                                _jsx("option", { value: "html", children: "HTML" })
                                                                                    ,
                                                                                        _jsx("option", { value: "zip", children: "ZIP" })
                                                                                            ,
                                                                                                _jsx("option", { value: "vfx", children: "VFX Pipeline" })), select: true, children: _jsx("select", { value: filter.type || '', onChange: (e) => setFilter(prev => ({ ...prev, type: e.target.value || undefined })), style: {
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                    }
                        >
                            (_jsx("option", { value: "", children: "All Types" })
                                ,
                                    _jsx("option", { value: "full", children: "Full Export" })
                                        ,
                                            _jsx("option", { value: "summary", children: "Summary" })
                                                ,
                                                    _jsx("option", { value: "diff", children: "Differential" })
                                                        ,
                                                            _jsx("option", { value: "custom", children: "Custom" })) }) })
                ,
                    _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("label", { style: { fontSize: '14px', color: '#6b7280' }, children: "View:" }), ['grid', 'list', 'table'].map(mode => ()
                                < button, key = { mode }, onClick = {}()), " => setViewMode(mode as 'grid' | 'list' | 'table')} style=", {
                                padding: '6px 10px',
                                background: viewMode === mode ? '#e2e8f0' : 'transparent',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                textTransform: 'capitalize'
                            }
                                >
                                    { mode }] })), div: true, children: _jsx("select", { value: `${sortBy}-${sortOrder}`, onChange: (e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by);
                setSortOrder(order);
            }, style: {
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
            }
                >
                    (_jsx("option", { value: "name-asc", children: "Name A-Z" })
                        ,
                            _jsx("option", { value: "name-desc", children: "Name Z-A" })
                                ,
                                    _jsx("option", { value: "created-desc", children: "Newest First" })
                                        ,
                                            _jsx("option", { value: "created-asc", children: "Oldest First" })
                                                ,
                                                    _jsx("option", { value: "usage-desc", children: "Most Used" })
                                                        ,
                                                            _jsx("option", { value: "usage-asc", children: "Least Used" })
                                                                ,
                                                                    _jsx("option", { value: "rating-desc", children: "Highest Rated" })
                                                                        ,
                                                                            _jsx("option", { value: "rating-asc", children: "Lowest Rated" })) }) });
div >
;
div >
    { /* Content Area */}
    < div;
style = {};
{
    flex: 1, overflow;
    'hidden', display;
    'flex';
}
 >
    { /* Main Content */}
    < div;
style = {};
{
    flex: 1, overflow;
    'auto', padding;
    '20px 24px';
}
 >
    { error } && ()
    < div;
style = {};
{
    padding: '12px 16px';
    background: '#fee2e2';
    border: '1px solid #fecaca';
    borderRadius: '8px';
    color: '#dc2626';
    marginBottom: '20px';
    fontSize: '14px';
}
    >
        _jsx("strong", { children: "Error:" });
{
    error;
}
div >
;
{
    loading && ()
        < div;
    style = {};
    {
        padding: '40px';
        textAlign: 'center';
        color: '#6b7280';
    }
}
    >
        (_jsx("div", { style: { fontSize: '24px', marginBottom: '12px' }, children: "\u23F3" })
            ,
                _jsx("div", { children: "Loading templates..." }));
div >
;
{ /* Browse Templates Tab */ }
{
    activeTab === 'browse' && !loading && (());
    {
        filteredTemplates.length === 0 ? ()
            < div
            :
        ;
        style = {};
        {
            padding: '60px 20px';
            textAlign: 'center';
            color: '#9ca3af';
        }
    }
        >
            (_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83D\uDCCB" })
                ,
                    _jsx("div", { style: { fontSize: '18px', marginBottom: '8px' }, children: "No templates found" })
                        ,
                            _jsx("div", { style: { fontSize: '14px' }, children: filter.search || filter.format || filter.type
                                    ? 'Try adjusting your filters or create a new template'
                                    : 'Create your first export template to get started' }));
    div >
    ;
    ()
        < div;
    style = {};
    {
        display: viewMode === 'grid' ? 'grid' : 'flex';
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))';
        flexDirection: viewMode === 'list' ? 'column' : undefined;
        gap: '16px';
    }
}
    >
        { filteredTemplates, : .map(template => { }),
            const: stats = templateStats.get(template.id),
            const: rating = getTemplateRating(template.id),
            return:  }
    < div;
key = { template, : .id };
style = {};
{
    background: selectedTemplate?.id === template.id ? '#f0f9ff' : 'white';
}
border: `2px solid ${selectedTemplate?.id === template.id ? '#0ea5e9' : '#e2e8f0'}`;
borderRadius: '8px';
padding: '16px';
cursor: 'pointer';
transition: 'all 0.2s ease';
position: 'relative';
onClick = {}();
handleSelectTemplate(template);
    >
        { /* Template Header */}
    < div;
style = {};
{
    display: 'flex', alignItems;
    'center', justifyContent;
    'space-between', marginBottom;
    '12px';
}
 >
    _jsxs("div", { children: [_jsx("h4", { style: { margin: 0, fontSize: '16px', fontWeight: '600', color: '#374151' }, children: template.name }), _jsxs("div", { style: { fontSize: '12px', color: '#6b7280', marginTop: '2px' }, children: [template.export_format.toUpperCase(), " \u2022 ", template.template_type, template.is_public && _jsx("span", { children: " \u2022 Public" })] })] });
{
    template.is_system_template && ()
        < span;
    style = {};
    {
        background: '#dbeafe';
        color: '#1e40af';
        padding: '2px 6px';
        borderRadius: '4px';
        fontSize: '10px';
        fontWeight: '600';
    }
}
    >
        SYSTEM;
span >
;
div >
    { /* Template Description */};
{
    template.description && ()
        < p;
    style = {};
    {
        margin: '0 0 12px';
        fontSize: '14px';
        color: '#6b7280';
        lineHeight: '1.4';
        display: '-webkit-box';
        WebkitLineClamp: 2;
        WebkitBoxOrient: 'vertical';
        overflow: 'hidden';
    }
}
 >
    { template, : .description };
p >
;
{ /* Template Stats */ }
_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '12px', color: '#6b7280' }, children: [stats && ()
            <  >
            _jsxs("span", { children: ["\uD83D\uDCCA ", formatUsageCount(stats.usageCount), " uses"] }), rating && (()), "\u2B50 ", rating.average, " (", rating.count, ")"] });
_jsxs("span", { children: ["\u2705 ", Math.round(stats.successRate * 100), "% success"] });
 >
;
_jsxs("span", { children: ["\uD83D\uDCC5 ", formatDate(template.created_at)] });
div >
    { /* Template Actions */}
    < div;
style = {};
{
    display: 'flex', gap;
    '8px';
}
 >
    _jsxs("button", { onClick: (e) => {
            e.stopPropagation();
            handleCustomizeTemplate(template);
        }, style: {
            padding: '6px 12px',
            background: '#f3f4f6',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#374151'
        }
            >
        , Customize: true, button: true, children: [enableSharing && ()
                < button, "onClick=", (e) => {
                e.stopPropagation();
                handleShareTemplate(template.id, !template.is_public);
            }, "style=", {
                padding: '6px 12px',
                background: template.is_public ? '#fee2e2' : '#f0fdf4',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                color: template.is_public ? '#dc2626' : '#16a34a'
            }
                >
                    { template, : .is_public ? '🔒 Make Private' : '🌐 Make Public' }] });
{
    !template.is_system_template && ()
        < button;
    onClick = {}(e);
    {
        e.stopPropagation();
        handleDeleteTemplate(template.id);
    }
}
style = {};
{
    padding: '6px 12px';
    background: '#fee2e2';
    border: '1px solid #fecaca';
    borderRadius: '4px';
    cursor: 'pointer';
    fontSize: '12px';
    color: '#dc2626';
}
    >
;
Delete;
button >
;
div >
;
div >
;
;
div >
;
div >
;
{ /* Create Template Tab */ }
{
    activeTab === 'create' && ()
        < div >
        _jsxs("div", { style: {
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280'
            }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83D\uDEE0\uFE0F" }), _jsx("div", { style: { fontSize: '18px', marginBottom: '8px' }, children: "Template Creation" }), _jsx("div", { style: { fontSize: '14px', marginBottom: '20px' }, children: "Create custom export templates with advanced options and parameterization" }), _jsx("button", { onClick: () => setIsCreating(true), style: {
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600'
                    }
                        >
                 }), "\u2795 Create New Template"] });
    div >
    ;
    div >
    ;
}
{ /* Shared Templates Tab */ }
{
    activeTab === 'shared' && ()
        < div;
    style = {};
    {
        padding: '40px';
        textAlign: 'center';
        color: '#6b7280';
    }
}
    >
        (_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83C\uDF10" })
            ,
                _jsx("div", { style: { fontSize: '18px', marginBottom: '8px' }, children: "Community Templates" })
                    ,
                        _jsx("div", { style: { fontSize: '14px' }, children: "Discover and share templates with the community" }));
div >
;
{ /* Collaborate Tab */ }
{
    activeTab === 'collaborate' && ()
        < div;
    style = {};
    {
        padding: '40px';
        textAlign: 'center';
        color: '#6b7280';
    }
}
    >
        (_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83D\uDC65" })
            ,
                _jsx("div", { style: { fontSize: '18px', marginBottom: '8px' }, children: "Team Collaboration" })
                    ,
                        _jsx("div", { style: { fontSize: '14px' }, children: "Collaborate on templates with your team members" }));
div >
;
div >
    { /* Side Panel */};
{
    selectedTemplate && ()
        < div;
    style = {};
    {
        width: '350px';
        borderLeft: '1px solid #e2e8f0';
        background: '#f8fafc';
        overflow: 'auto';
    }
}
    >
        _jsxs("div", { style: { padding: '20px' }, children: [_jsx("h3", { style: { margin: '0 0 16px', fontSize: '18px', fontWeight: '600' }, children: "Template Details" }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h4", { style: { margin: '0 0 8px', fontSize: '16px', color: '#374151' }, children: selectedTemplate.name }), _jsxs("div", { style: { fontSize: '12px', color: '#6b7280', marginBottom: '8px' }, children: [selectedTemplate.export_format.toUpperCase(), " \u2022 ", selectedTemplate.template_type, selectedTemplate.is_public && _jsx("span", { children: " \u2022 Public" })] }), selectedTemplate.description && ()
                            < p, " style=", { margin: '0', fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }, ">", selectedTemplate.description] }), ")}"] });
{ /* Template Statistics */ }
{
    templateStats.has(selectedTemplate.id) && ()
        < div;
    style = {};
    {
        marginBottom: '20px';
    }
}
 >
    (_jsx("h5", { style: { margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }, children: "Usage Statistics" })
        ,
            _jsxs("div", { style: { fontSize: '12px', color: '#6b7280', lineHeight: '1.6' }, children: [(() => {
                        const stats = templateStats.get(selectedTemplate.id);
                        const rating = getTemplateRating(selectedTemplate.id);
                        return;
                        _jsxs(_Fragment, { children: [_jsxs("div", { children: ["\uD83D\uDCCA ", formatUsageCount(stats.usageCount), " total uses"] }), rating && _jsxs("div", { children: ["\u2B50 ", rating.average, "/5.0 (", rating.count, " ratings)"] }), _jsxs("div", { children: ["\u2705 ", Math.round(stats.successRate * 100), "% success rate"] }), stats.lastUsed && _jsxs("div", { children: ["\uD83D\uDD52 Last used: ", formatDate(stats.lastUsed)] })] });
                    }), "; })()}"] }));
div >
;
{ /* Template Metadata */ }
_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h5", { style: { margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }, children: "Metadata" }), _jsxs("div", { style: { fontSize: '12px', color: '#6b7280', lineHeight: '1.6' }, children: [_jsxs("div", { children: ["\uD83D\uDCC5 Created: ", formatDate(selectedTemplate.created_at)] }), _jsxs("div", { children: ["\uD83D\uDD04 Updated: ", formatDate(selectedTemplate.updated_at)] }), _jsxs("div", { children: ["\uD83D\uDC64 Author: ", selectedTemplate.created_by] }), selectedTemplate.is_system_template && _jsx("div", { children: "\uD83D\uDD27 System Template" })] })] });
{ /* Template Options Preview */ }
{
    Object.keys(selectedTemplate.format_options || {}).length > 0 && ()
        < div;
    style = {};
    {
        marginBottom: '20px';
    }
}
 >
    (_jsx("h5", { style: { margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }, children: "Format Options" })
        ,
            _jsx("div", { style: {
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    padding: '8px',
                    fontSize: '11px',
                    color: '#374151',
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    maxHeight: '150px'
                }
                    >
                        _jsx("pre", { style: { margin: 0 }, children: JSON.stringify(selectedTemplate.format_options, null, 2) }), div: true }));
{ /* Actions */ }
_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [_jsx("button", { onClick: () => handleSelectTemplate(selectedTemplate), style: {
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
            }
                >
         }), "\uD83D\uDCE4 Use This Template"] })
    ,
        _jsxs("button", { onClick: () => handleCustomizeTemplate(selectedTemplate), style: {
                padding: '10px 16px',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
            }
                >
            , Customize: true, Template: true, button: true, children: [!selectedTemplate.is_system_template && ()
                    < button, "onClick=", () => {
                    setEditingTemplate(selectedTemplate);
                    setIsEditing(true);
                }, "style=", {
                    padding: '10px 16px',
                    background: '#fffbeb',
                    color: '#d97706',
                    border: '1px solid #fed7aa',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                }
                    >
                , "\u270F\uFE0F Edit Template"] });
div >
;
div >
;
div >
;
div >
;
div >
;
;
;
export default AdvancedExportTemplateManager;

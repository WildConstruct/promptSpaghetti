import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/TemplateDialogs/TemplateBrowser.tsx
// Epic 8.7 Task 6: Template Library - Template Browser Component
import { useState, useEffect, useCallback, useMemo } from 'react';
import { templateService } from '../../services/TemplateService';
const TEMPLATE_CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'character', label: 'Character' },
    { value: 'setting', label: 'Setting' },
    { value: 'mood', label: 'Mood' },
    { value: 'action', label: 'Action' },
    { value: 'dialogue', label: 'Dialogue' },
    { value: 'world-building', label: 'World Building' },
    { value: 'narrative', label: 'Narrative' },
    { value: 'technical', label: 'Technical' },
    { value: 'vfx', label: 'VFX' },
    { value: 'general', label: 'General' }
];
export const TemplateBrowser = ({ isOpen, onClose, onApplyTemplate, currentAuthor = 'current-user' }) => {
    const [browserState, setBrowserState] = useState({
        isOpen: false,
        viewMode: 'grid',
        selectedCategory: 'all',
        searchQuery: '',
        sortBy: 'modified',
        showOnlyMyTemplates: false,
        previewTemplate: null
    });
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Instantiation options state
    const [instantiationOptions, setInstantiationOptions] = useState({
        preservePositions: false,
        mergeWithCurrent: false,
        offsetX: 100,
        offsetY: 100
    });
    // Load templates
    const loadTemplates = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filter = {
                category: browserState.selectedCategory === 'all' ? undefined : browserState.selectedCategory,
                searchTerm: browserState.searchQuery || undefined,
                sortBy: browserState.sortBy,
                sortOrder: 'desc',
                author: browserState.showOnlyMyTemplates ? currentAuthor : undefined
            };
            const loadedTemplates = await templateService.searchTemplates(filter);
            setTemplates(loadedTemplates);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load templates');
        }
        finally {
            setIsLoading(false);
        }
    }, [browserState, currentAuthor]);
    // Load templates when browser state changes
    useEffect(() => {
        if (isOpen) {
            loadTemplates();
        }
    }, [isOpen, loadTemplates]);
    const handleStateChange = useCallback((updates) => {
        setBrowserState(prev => ({ ...prev, ...updates }));
    }, []);
    const handlePreviewTemplate = useCallback((template) => {
        setBrowserState(prev => ({ ...prev, previewTemplate: template }));
    }, []);
    const handleApplyTemplate = useCallback(async (template) => {
        try {
            await onApplyTemplate(template.id, instantiationOptions);
            onClose();
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to apply template');
        }
    }, [instantiationOptions, onApplyTemplate, onClose]);
    const handleDeleteTemplate = useCallback(async (templateId) => {
        if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
            return;
        }
        try {
            await templateService.deleteTemplate(templateId);
            setTemplates(prev => prev.filter(t => t.id !== templateId));
            setBrowserState(prev => ({ ...prev, previewTemplate: null }));
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete template');
        }
    }, []);
    // Filter templates by search query for client-side filtering
    const filteredTemplates = useMemo(() => {
        return templates; // Server-side filtering already applied
    }, [templates]);
    if (!isOpen)
        return null;
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }, children: [_jsxs("div", { style: {
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    width: '90vw',
                    height: '90vh',
                    maxWidth: '1200px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }, children: [_jsxs("div", { style: {
                            padding: '20px 24px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }, children: [_jsx("h2", { style: { margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }, children: "Template Library" }), _jsx("button", { onClick: onClose, style: {
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }, children: "\u00D7" })] }), _jsxs("div", { style: { display: 'flex', flex: 1, overflow: 'hidden' }, children: [_jsxs("div", { style: {
                                    width: '250px',
                                    borderRight: '1px solid #e5e7eb',
                                    padding: '16px',
                                    overflow: 'auto'
                                }, children: [_jsx("div", { style: { marginBottom: '16px' }, children: _jsx("input", { type: "text", placeholder: "Search templates...", value: browserState.searchQuery, onChange: (e) => handleStateChange({ searchQuery: e.target.value }), style: {
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            } }) }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: {
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: '#374151'
                                                }, children: "Category" }), _jsx("select", { value: browserState.selectedCategory, onChange: (e) => handleStateChange({ selectedCategory: e.target.value }), style: {
                                                    width: '100%',
                                                    padding: '6px 8px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '4px',
                                                    fontSize: '13px',
                                                    backgroundColor: 'white',
                                                    boxSizing: 'border-box'
                                                }, children: TEMPLATE_CATEGORIES.map(cat => (_jsx("option", { value: cat.value, children: cat.label }, cat.value))) })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: {
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: '#374151'
                                                }, children: "Sort By" }), _jsxs("select", { value: browserState.sortBy, onChange: (e) => handleStateChange({ sortBy: e.target.value }), style: {
                                                    width: '100%',
                                                    padding: '6px 8px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '4px',
                                                    fontSize: '13px',
                                                    backgroundColor: 'white',
                                                    boxSizing: 'border-box'
                                                }, children: [_jsx("option", { value: "modified", children: "Recently Modified" }), _jsx("option", { value: "created", children: "Recently Created" }), _jsx("option", { value: "name", children: "Name (A-Z)" }), _jsx("option", { value: "rating", children: "Highest Rated" }), _jsx("option", { value: "usage", children: "Most Used" })] })] }), _jsx("div", { style: { marginBottom: '16px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", checked: browserState.showOnlyMyTemplates, onChange: (e) => handleStateChange({ showOnlyMyTemplates: e.target.checked }), style: { margin: 0 } }), _jsx("span", { style: { fontSize: '13px', color: '#374151' }, children: "Show only my templates" })] }) }), _jsx("div", { style: { marginBottom: '16px' }, children: _jsxs("div", { style: { display: 'flex', gap: '4px' }, children: [_jsx("button", { onClick: () => handleStateChange({ viewMode: 'grid' }), style: {
                                                        padding: '4px 8px',
                                                        border: '1px solid #d1d5db',
                                                        backgroundColor: browserState.viewMode === 'grid' ? '#3b82f6' : 'white',
                                                        color: browserState.viewMode === 'grid' ? 'white' : '#374151',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }, children: "Grid" }), _jsx("button", { onClick: () => handleStateChange({ viewMode: 'list' }), style: {
                                                        padding: '4px 8px',
                                                        border: '1px solid #d1d5db',
                                                        backgroundColor: browserState.viewMode === 'list' ? '#3b82f6' : 'white',
                                                        color: browserState.viewMode === 'list' ? 'white' : '#374151',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }, children: "List" })] }) }), _jsxs("div", { style: {
                                            padding: '12px',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '6px',
                                            borderTop: '1px solid #e5e7eb'
                                        }, children: [_jsx("h4", { style: { margin: '0 0 8px 0', fontSize: '13px', fontWeight: '500' }, children: "Apply Options" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '6px' }, children: [_jsx("input", { type: "checkbox", checked: instantiationOptions.preservePositions, onChange: (e) => setInstantiationOptions(prev => ({
                                                                    ...prev,
                                                                    preservePositions: e.target.checked
                                                                })), style: { margin: 0 } }), _jsx("span", { style: { fontSize: '12px' }, children: "Preserve positions" })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '6px' }, children: [_jsx("input", { type: "checkbox", checked: instantiationOptions.mergeWithCurrent, onChange: (e) => setInstantiationOptions(prev => ({
                                                                    ...prev,
                                                                    mergeWithCurrent: e.target.checked
                                                                })), style: { margin: 0 } }), _jsx("span", { style: { fontSize: '12px' }, children: "Merge with current" })] }), !instantiationOptions.preservePositions && (_jsx("div", { style: { paddingLeft: '18px', marginTop: '4px' }, children: _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("span", { style: { fontSize: '11px', color: '#6b7280' }, children: "Offset:" }), _jsx("input", { type: "number", value: instantiationOptions.offsetX, onChange: (e) => setInstantiationOptions(prev => ({
                                                                        ...prev,
                                                                        offsetX: Number(e.target.value)
                                                                    })), style: {
                                                                        width: '50px',
                                                                        padding: '2px 4px',
                                                                        border: '1px solid #d1d5db',
                                                                        borderRadius: '2px',
                                                                        fontSize: '11px'
                                                                    } }), _jsx("input", { type: "number", value: instantiationOptions.offsetY, onChange: (e) => setInstantiationOptions(prev => ({
                                                                        ...prev,
                                                                        offsetY: Number(e.target.value)
                                                                    })), style: {
                                                                        width: '50px',
                                                                        padding: '2px 4px',
                                                                        border: '1px solid #d1d5db',
                                                                        borderRadius: '2px',
                                                                        fontSize: '11px'
                                                                    } })] }) }))] })] })] }), _jsxs("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }, children: [error && (_jsx("div", { style: {
                                            margin: '16px',
                                            padding: '12px',
                                            backgroundColor: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            borderRadius: '6px',
                                            color: '#dc2626',
                                            fontSize: '14px'
                                        }, children: error })), isLoading ? (_jsx("div", { style: {
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            color: '#6b7280'
                                        }, children: "Loading templates..." })) : filteredTemplates.length === 0 ? (_jsxs("div", { style: {
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            color: '#6b7280'
                                        }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83D\uDCC1" }), _jsx("div", { style: { fontSize: '14px', marginBottom: '8px' }, children: "No templates found" }), _jsx("div", { style: { fontSize: '12px' }, children: "Try adjusting your search criteria or create a new template" })] })) : (_jsx("div", { style: {
                                            flex: 1,
                                            overflow: 'auto',
                                            padding: '16px'
                                        }, children: browserState.viewMode === 'grid' ? (_jsx("div", { style: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                                gap: '16px'
                                            }, children: filteredTemplates.map(template => (_jsx(TemplateCard, { template: template, onPreview: () => handlePreviewTemplate(template), onApply: () => handleApplyTemplate(template), onDelete: () => handleDeleteTemplate(template.id), showDelete: template.author === currentAuthor }, template.id))) })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: filteredTemplates.map(template => (_jsx(TemplateListItem, { template: template, onPreview: () => handlePreviewTemplate(template), onApply: () => handleApplyTemplate(template), onDelete: () => handleDeleteTemplate(template.id), showDelete: template.author === currentAuthor }, template.id))) })) }))] })] })] }), browserState.previewTemplate && (_jsx(TemplatePreview, { template: browserState.previewTemplate, onClose: () => setBrowserState(prev => ({ ...prev, previewTemplate: null })), onApply: () => handleApplyTemplate(browserState.previewTemplate) }))] }));
};
// Template Card Component for Grid View
const TemplateCard = ({ template, onPreview, onApply, onDelete, showDelete }) => {
    return (_jsxs("div", { style: {
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
            position: 'relative'
        }, onMouseEnter: (e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }, onMouseLeave: (e) => {
            e.currentTarget.style.boxShadow = 'none';
        }, onClick: onPreview, children: [showDelete && (_jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    onDelete();
                }, style: {
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px'
                }, title: "Delete template", children: "\uD83D\uDDD1\uFE0F" })), _jsxs("div", { style: { marginBottom: '12px' }, children: [_jsx("h3", { style: {
                            margin: '0 0 4px 0',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1f2937',
                            lineHeight: '1.2'
                        }, children: template.name }), _jsx("p", { style: {
                            margin: 0,
                            fontSize: '13px',
                            color: '#6b7280',
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }, children: template.description })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }, children: [_jsx("span", { style: {
                            padding: '2px 6px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '10px',
                            fontSize: '11px',
                            color: '#374151',
                            textTransform: 'capitalize'
                        }, children: template.category.replace('-', ' ') }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [_jsx("span", { style: { fontSize: '12px', color: '#f59e0b' }, children: "\u2605" }), _jsx("span", { style: { fontSize: '12px', color: '#6b7280' }, children: template.rating.toFixed(1) })] })] }), _jsxs("div", { style: {
                    fontSize: '11px',
                    color: '#9ca3af',
                    marginBottom: '12px'
                }, children: ["by ", template.author, " \u2022 ", template.metadata.nodeCount, " nodes"] }), _jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    onApply();
                }, style: {
                    width: '100%',
                    padding: '6px 12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: '500'
                }, children: "Apply Template" })] }));
};
// Template List Item Component for List View
const TemplateListItem = ({ template, onPreview, onApply, onDelete, showDelete }) => {
    return (_jsxs("div", { style: {
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '12px 16px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        }, onMouseEnter: (e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
        }, onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = 'white';
        }, onClick: onPreview, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }, children: [_jsx("h4", { style: { margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }, children: template.name }), _jsx("span", { style: {
                                    padding: '1px 4px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '10px',
                                    color: '#374151',
                                    textTransform: 'capitalize'
                                }, children: template.category.replace('-', ' ') }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '2px' }, children: [_jsx("span", { style: { fontSize: '10px', color: '#f59e0b' }, children: "\u2605" }), _jsx("span", { style: { fontSize: '10px', color: '#6b7280' }, children: template.rating.toFixed(1) })] })] }), _jsx("p", { style: {
                            margin: 0,
                            fontSize: '12px',
                            color: '#6b7280',
                            lineHeight: '1.3'
                        }, children: template.description }), _jsxs("div", { style: {
                            fontSize: '10px',
                            color: '#9ca3af',
                            marginTop: '4px'
                        }, children: ["by ", template.author, " \u2022 ", template.metadata.nodeCount, " nodes \u2022 ", new Date(template.metadata.lastModified).toLocaleDateString()] })] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: (e) => {
                            e.stopPropagation();
                            onApply();
                        }, style: {
                            padding: '4px 8px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                        }, children: "Apply" }), showDelete && (_jsx("button", { onClick: (e) => {
                            e.stopPropagation();
                            onDelete();
                        }, style: {
                            padding: '4px 8px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                        }, children: "Delete" }))] })] }));
};
// Template Preview Modal
const TemplatePreview = ({ template, onClose, onApply }) => {
    return (_jsx("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
        }, children: _jsxs("div", { style: {
                backgroundColor: 'white',
                borderRadius: '8px',
                maxWidth: '600px',
                width: '90vw',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '24px'
            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }, children: [_jsx("h3", { style: { margin: 0, fontSize: '1.25rem', fontWeight: '600' }, children: template.name }), _jsx("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                fontSize: '20px',
                                color: '#6b7280',
                                cursor: 'pointer'
                            }, children: "\u00D7" })] }), _jsx("div", { style: { marginBottom: '16px' }, children: _jsx("p", { style: { fontSize: '14px', color: '#374151', lineHeight: '1.5' }, children: template.description }) }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }, children: [_jsxs("div", { children: [_jsx("strong", { style: { fontSize: '12px', color: '#6b7280' }, children: "Category:" }), _jsx("div", { style: { fontSize: '14px', textTransform: 'capitalize' }, children: template.category.replace('-', ' ') })] }), _jsxs("div", { children: [_jsx("strong", { style: { fontSize: '12px', color: '#6b7280' }, children: "Author:" }), _jsx("div", { style: { fontSize: '14px' }, children: template.author })] }), _jsxs("div", { children: [_jsx("strong", { style: { fontSize: '12px', color: '#6b7280' }, children: "Nodes:" }), _jsx("div", { style: { fontSize: '14px' }, children: template.metadata.nodeCount })] }), _jsxs("div", { children: [_jsx("strong", { style: { fontSize: '12px', color: '#6b7280' }, children: "Rating:" }), _jsxs("div", { style: { fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }, children: [_jsx("span", { style: { color: '#f59e0b' }, children: "\u2605" }), template.rating.toFixed(1), " (", template.reviews.length, " reviews)"] })] })] }), template.metadata.tags.length > 0 && (_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("strong", { style: { fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }, children: "Tags:" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' }, children: template.metadata.tags.map(tag => (_jsx("span", { style: {
                                    padding: '2px 6px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    color: '#374151'
                                }, children: tag }, tag))) })] })), _jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        paddingTop: '16px',
                        borderTop: '1px solid #e5e7eb'
                    }, children: [_jsx("button", { onClick: onClose, style: {
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                color: '#6b7280',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }, children: "Cancel" }), _jsx("button", { onClick: onApply, style: {
                                padding: '8px 16px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }, children: "Apply Template" })] })] }) }));
};

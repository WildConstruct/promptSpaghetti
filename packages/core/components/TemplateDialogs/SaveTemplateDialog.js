import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/TemplateDialogs/SaveTemplateDialog.tsx
// Epic 8.7 Task 6: Template Library - Save Template Dialog
import { useState, useCallback } from 'react';
const TEMPLATE_CATEGORIES = [
    { value: 'character', label: 'Character Generation' },
    { value: 'setting', label: 'Setting & Environment' },
    { value: 'mood', label: 'Mood & Atmosphere' },
    { value: 'action', label: 'Action & Events' },
    { value: 'dialogue', label: 'Dialogue & Speech' },
    { value: 'world-building', label: 'World Building' },
    { value: 'narrative', label: 'Narrative Structure' },
    { value: 'technical', label: 'Technical/VFX' },
    { value: 'vfx', label: 'VFX & ControlNet' },
    { value: 'general', label: 'General Purpose' }
];
export const SaveTemplateDialog = ({ isOpen, onClose, onSave, initialData = {} }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || 'general',
        tags: initialData.tags || [],
        isPublic: initialData.isPublic || false,
        includeAnnotations: initialData.includeAnnotations ?? true
    });
    const [tagInput, setTagInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    }, []);
    const handleAddTag = useCallback(() => {
        const trimmedTag = tagInput.trim().toLowerCase();
        if (trimmedTag && !formData.tags.includes(trimmedTag)) {
            handleInputChange('tags', [...formData.tags, trimmedTag]);
            setTagInput('');
        }
    }, [tagInput, formData.tags, handleInputChange]);
    const handleRemoveTag = useCallback((tagToRemove) => {
        handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
    }, [formData.tags, handleInputChange]);
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    }, [handleAddTag]);
    const handleSave = useCallback(async () => {
        // Validation
        if (!formData.name.trim()) {
            setError('Template name is required');
            return;
        }
        if (!formData.description.trim()) {
            setError('Template description is required');
            return;
        }
        if (formData.name.trim().length < 3) {
            setError('Template name must be at least 3 characters');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await onSave(formData);
            if (result.success) {
                onClose();
                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    category: 'general',
                    tags: [],
                    isPublic: false,
                    includeAnnotations: true
                });
                setTagInput('');
            }
            else {
                setError(result.error || 'Failed to save template');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
        finally {
            setIsLoading(false);
        }
    }, [formData, onSave, onClose]);
    const handleCancel = useCallback(() => {
        if (!isLoading) {
            onClose();
        }
    }, [isLoading, onClose]);
    if (!isOpen)
        return null;
    return (_jsx("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }, children: _jsxs("div", { style: {
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '500px',
                width: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }, children: [_jsx("h2", { style: {
                        margin: '0 0 20px 0',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#1f2937'
                    }, children: "Save Template" }), _jsxs("form", { onSubmit: (e) => { e.preventDefault(); handleSave(); }, children: [_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        marginBottom: '4px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#374151'
                                    }, children: "Template Name *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => handleInputChange('name', e.target.value), placeholder: "e.g., Character Description Generator", style: {
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }, disabled: isLoading })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        marginBottom: '4px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#374151'
                                    }, children: "Description *" }), _jsx("textarea", { value: formData.description, onChange: (e) => handleInputChange('description', e.target.value), placeholder: "Describe what this template does and how to use it...", rows: 3, style: {
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        resize: 'vertical',
                                        boxSizing: 'border-box'
                                    }, disabled: isLoading })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        marginBottom: '4px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#374151'
                                    }, children: "Category" }), _jsx("select", { value: formData.category, onChange: (e) => handleInputChange('category', e.target.value), style: {
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        backgroundColor: 'white',
                                        boxSizing: 'border-box'
                                    }, disabled: isLoading, children: TEMPLATE_CATEGORIES.map(cat => (_jsx("option", { value: cat.value, children: cat.label }, cat.value))) })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        marginBottom: '4px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#374151'
                                    }, children: "Tags" }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsxs("div", { style: { display: 'flex', gap: '8px', marginBottom: '8px' }, children: [_jsx("input", { type: "text", value: tagInput, onChange: (e) => setTagInput(e.target.value), onKeyDown: handleKeyPress, placeholder: "Add tags (press Enter)", style: {
                                                        flex: 1,
                                                        padding: '6px 10px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '4px',
                                                        fontSize: '13px',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }, disabled: isLoading }), _jsx("button", { type: "button", onClick: handleAddTag, disabled: !tagInput.trim() || isLoading, style: {
                                                        padding: '6px 12px',
                                                        backgroundColor: '#3b82f6',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '13px',
                                                        cursor: isLoading || !tagInput.trim() ? 'not-allowed' : 'pointer',
                                                        opacity: isLoading || !tagInput.trim() ? 0.5 : 1
                                                    }, children: "Add" })] }), formData.tags.length > 0 && (_jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' }, children: formData.tags.map(tag => (_jsxs("span", { style: {
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    padding: '4px 8px',
                                                    backgroundColor: '#e5e7eb',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    color: '#374151'
                                                }, children: [tag, _jsx("button", { type: "button", onClick: () => handleRemoveTag(tag), disabled: isLoading, style: {
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#6b7280',
                                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                                            padding: '0',
                                                            marginLeft: '2px',
                                                            fontSize: '14px',
                                                            lineHeight: 1
                                                        }, children: "\u00D7" })] }, tag))) }))] })] }), _jsx("div", { style: { marginBottom: '20px' }, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", checked: formData.includeAnnotations, onChange: (e) => handleInputChange('includeAnnotations', e.target.checked), disabled: isLoading, style: { margin: 0 } }), _jsx("span", { style: { fontSize: '14px', color: '#374151' }, children: "Include annotations (sticky notes, labels, regions)" })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", checked: formData.isPublic, onChange: (e) => handleInputChange('isPublic', e.target.checked), disabled: isLoading, style: { margin: 0 } }), _jsx("span", { style: { fontSize: '14px', color: '#374151' }, children: "Make template public (visible to other users)" })] })] }) }), error && (_jsx("div", { style: {
                                marginBottom: '16px',
                                padding: '8px 12px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                color: '#dc2626',
                                fontSize: '14px'
                            }, children: error })), _jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                paddingTop: '16px',
                                borderTop: '1px solid #e5e7eb'
                            }, children: [_jsx("button", { type: "button", onClick: handleCancel, disabled: isLoading, style: {
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        opacity: isLoading ? 0.5 : 1
                                    }, children: "Cancel" }), _jsx("button", { type: "submit", disabled: isLoading || !formData.name.trim() || !formData.description.trim(), style: {
                                        padding: '8px 16px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: (isLoading || !formData.name.trim() || !formData.description.trim())
                                            ? 'not-allowed' : 'pointer',
                                        opacity: (isLoading || !formData.name.trim() || !formData.description.trim())
                                            ? 0.5 : 1
                                    }, children: isLoading ? 'Saving...' : 'Save Template' })] })] })] }) }));
};

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * SaveProjectDialog - Dialog for saving projects to .psg files
 */
import { useState } from 'react';
import { useGraphStore } from '../../graphStore';
export const SaveProjectDialog = ({ isOpen, onClose, onSave }) => {
    const { saveProject, currentProject } = useGraphStore();
    const [formData, setFormData] = useState({
        name: currentProject?.name || '',
        description: currentProject?.description || '',
        author: currentProject?.author || '',
        tags: currentProject?.tags?.join(', ') || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (error)
            setError(null);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('Project name is required');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await saveProject({
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                author: formData.author.trim() || undefined,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            });
            onSave?.(result);
            if (result.success) {
                onClose();
            }
            else {
                setError(result.error || 'Failed to save project');
            }
        }
        catch (err) {
            setError('An unexpected error occurred');
        }
        finally {
            setIsLoading(false);
        }
    };
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
            zIndex: 1000,
        }, children: _jsxs("div", { style: {
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                width: '90%',
                maxWidth: '500px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                    }, children: [_jsx("h2", { style: {
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#333',
                            }, children: "Save Project" }), _jsx("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '0',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }, disabled: isLoading, children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#333',
                                    }, children: "Project Name *" }), _jsx("input", { type: "text", value: formData.name, onChange: handleInputChange('name'), placeholder: "Enter project name...", required: true, disabled: isLoading, style: {
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                    } })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#333',
                                    }, children: "Description" }), _jsx("textarea", { value: formData.description, onChange: handleInputChange('description'), placeholder: "Optional project description...", disabled: isLoading, rows: 3, style: {
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        resize: 'vertical',
                                        boxSizing: 'border-box',
                                    } })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#333',
                                    }, children: "Author" }), _jsx("input", { type: "text", value: formData.author, onChange: handleInputChange('author'), placeholder: "Your name...", disabled: isLoading, style: {
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                    } })] }), _jsxs("div", { style: { marginBottom: '24px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#333',
                                    }, children: "Tags" }), _jsx("input", { type: "text", value: formData.tags, onChange: handleInputChange('tags'), placeholder: "Enter tags separated by commas...", disabled: isLoading, style: {
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                    } }), _jsx("div", { style: {
                                        fontSize: '12px',
                                        color: '#666',
                                        marginTop: '4px',
                                    }, children: "Example: prompt-engineering, workflow, automation" })] }), error && (_jsx("div", { style: {
                                backgroundColor: '#fee',
                                border: '1px solid #fcc',
                                color: '#c33',
                                padding: '10px',
                                borderRadius: '4px',
                                marginBottom: '16px',
                                fontSize: '14px',
                            }, children: error })), _jsxs("div", { style: {
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end',
                            }, children: [_jsx("button", { type: "button", onClick: onClose, disabled: isLoading, style: {
                                        padding: '10px 20px',
                                        border: '1px solid #ddd',
                                        backgroundColor: 'white',
                                        color: '#666',
                                        borderRadius: '4px',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                    }, children: "Cancel" }), _jsx("button", { type: "submit", disabled: isLoading, style: {
                                        padding: '10px 20px',
                                        border: 'none',
                                        backgroundColor: isLoading ? '#ccc' : '#007bff',
                                        color: 'white',
                                        borderRadius: '4px',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                    }, children: isLoading ? 'Saving...' : 'Save Project' })] })] })] }) }));
};
export default SaveProjectDialog;

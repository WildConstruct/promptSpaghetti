import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.1 - Create Workspace Modal Component
 * Modal for creating new workspaces
 */
import { useState } from 'react';
export const CreateWorkspaceModal = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Workspace name is required';
        }
        else if (formData.name.length < 3) {
            newErrors.name = 'Workspace name must be at least 3 characters';
        }
        else if (formData.name.length > 50) {
            newErrors.name = 'Workspace name must be less than 50 characters';
        }
        if (formData.description && formData.description.length > 200) {
            newErrors.description = 'Description must be less than 200 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({
                name: formData.name.trim(),
                description: formData.description.trim() || undefined
            });
        }
        catch (error) {
            // Handle error (could set form-level error state)
            console.error('Failed to create workspace:', error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    return (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal modal--medium", children: [_jsxs("div", { className: "modal__header", children: [_jsx("h2", { children: "Create New Workspace" }), _jsx("button", { className: "modal__close", onClick: onCancel, type: "button", children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "modal__content", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "workspace-name", className: "form-label", children: "Workspace Name *" }), _jsx("input", { id: "workspace-name", type: "text", value: formData.name, onChange: (e) => handleChange('name', e.target.value), className: `form-input ${errors.name ? 'form-input--error' : ''}`, placeholder: "Enter workspace name", maxLength: 50, disabled: isSubmitting }), errors.name && (_jsx("div", { className: "form-error", children: errors.name })), _jsx("div", { className: "form-hint", children: "Choose a descriptive name for your workspace" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "workspace-description", className: "form-label", children: "Description (Optional)" }), _jsx("textarea", { id: "workspace-description", value: formData.description, onChange: (e) => handleChange('description', e.target.value), className: `form-textarea ${errors.description ? 'form-textarea--error' : ''}`, placeholder: "Describe what this workspace is for...", rows: 3, maxLength: 200, disabled: isSubmitting }), errors.description && (_jsx("div", { className: "form-error", children: errors.description })), _jsxs("div", { className: "form-hint", children: [formData.description.length, "/200 characters"] })] }), _jsxs("div", { className: "workspace-preview", children: [_jsx("h3", { children: "Preview" }), _jsxs("div", { className: "workspace-item workspace-item--preview", children: [_jsx("div", { className: "workspace-item__avatar", children: formData.name ? formData.name.charAt(0).toUpperCase() : '?' }), _jsxs("div", { className: "workspace-item__content", children: [_jsx("h4", { className: "workspace-item__name", children: formData.name || 'Workspace Name' }), formData.description && (_jsx("p", { className: "workspace-item__description", children: formData.description })), _jsx("div", { className: "workspace-item__meta", children: _jsx("span", { className: "badge badge--owner", children: "Owner" }) })] })] })] })] }), _jsxs("div", { className: "modal__footer", children: [_jsx("button", { type: "button", className: "btn btn--secondary", onClick: onCancel, disabled: isSubmitting, children: "Cancel" }), _jsx("button", { type: "submit", className: "btn btn--primary", onClick: handleSubmit, disabled: isSubmitting || !formData.name.trim(), children: isSubmitting ? 'Creating...' : 'Create Workspace' })] })] }) }));
};
export default CreateWorkspaceModal;

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 9.2.1 - Invite User Modal Component
 * Modal for inviting users to workspaces
 */
import { useState } from 'react';
const ROLES = [
    { value: 'admin', label: 'Admin', description: 'Full workspace access and management' },
    { value: 'editor', label: 'Editor', description: 'Can create and edit projects and resources' },
    { value: 'commenter', label: 'Commenter', description: 'Can view content and add comments' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access to content' }
];
export const InviteUserModal = ({ workspaceId, workspaceName, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        userId: '',
        role: 'editor'
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const validateForm = () => {
        const newErrors = {};
        if (!formData.userId.trim()) {
            newErrors.userId = 'User ID or email is required';
        }
        else if (formData.userId.length < 3) {
            newErrors.userId = 'User ID must be at least 3 characters';
        }
        if (!formData.role) {
            newErrors.role = 'Role selection is required';
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
                userId: formData.userId.trim(),
                role: formData.role
            });
        }
        catch (error) {
            console.error('Failed to invite user:', error);
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
    const selectedRole = ROLES.find(role => role.value === formData.role);
    return (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal modal--medium", children: [_jsxs("div", { className: "modal__header", children: [_jsx("h2", { children: "Invite User to Workspace" }), _jsx("button", { className: "modal__close", onClick: onCancel, type: "button", children: "\u00D7" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "modal__content", children: [_jsxs("div", { className: "invite-modal__workspace-info", children: [_jsxs("h3", { children: ["Inviting to: ", workspaceName] }), _jsx("p", { children: "The user will receive a notification and can start collaborating immediately." })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "user-id", className: "form-label", children: "User ID or Email *" }), _jsx("input", { id: "user-id", type: "text", value: formData.userId, onChange: (e) => handleChange('userId', e.target.value), className: `form-input ${errors.userId ? 'form-input--error' : ''}`, placeholder: "Enter user ID or email address", disabled: isSubmitting }), errors.userId && (_jsx("div", { className: "form-error", children: errors.userId })), _jsx("div", { className: "form-hint", children: "Enter the user's ID or email address to send them an invitation" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Role *" }), _jsx("div", { className: "role-selection", children: ROLES.map(role => (_jsxs("label", { className: `role-option ${formData.role === role.value ? 'role-option--selected' : ''}`, children: [_jsx("input", { type: "radio", name: "role", value: role.value, checked: formData.role === role.value, onChange: (e) => handleChange('role', e.target.value), disabled: isSubmitting }), _jsxs("div", { className: "role-option__content", children: [_jsx("div", { className: "role-option__name", children: role.label }), _jsx("div", { className: "role-option__description", children: role.description })] })] }, role.value))) }), errors.role && (_jsx("div", { className: "form-error", children: errors.role }))] }), selectedRole && (_jsxs("div", { className: "invite-preview", children: [_jsx("h3", { children: "Permission Summary" }), _jsxs("div", { className: "permission-summary", children: [_jsx("div", { className: "permission-summary__role", children: _jsx("strong", { children: selectedRole.label }) }), _jsx("div", { className: "permission-summary__description", children: selectedRole.description }), _jsxs("div", { className: "permission-summary__details", children: [_jsx("h4", { children: "This role will be able to:" }), _jsxs("ul", { children: [formData.role === 'admin' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "Manage workspace settings and members" }), _jsx("li", { children: "Create, edit, and delete projects" }), _jsx("li", { children: "Invite and remove users" }), _jsx("li", { children: "Access all workspace content" })] })), formData.role === 'editor' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "Create and edit projects and resources" }), _jsx("li", { children: "Comment on content" }), _jsx("li", { children: "View workspace activity" })] })), formData.role === 'commenter' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "View all workspace content" }), _jsx("li", { children: "Add comments and discussions" }), _jsx("li", { children: "View workspace activity" })] })), formData.role === 'viewer' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "View all workspace content" }), _jsx("li", { children: "View workspace activity" })] }))] })] })] })] }))] }), _jsxs("div", { className: "modal__footer", children: [_jsx("button", { type: "button", className: "btn btn--secondary", onClick: onCancel, disabled: isSubmitting, children: "Cancel" }), _jsx("button", { type: "submit", className: "btn btn--primary", onClick: handleSubmit, disabled: isSubmitting || !formData.userId.trim(), children: isSubmitting ? 'Sending Invitation...' : 'Send Invitation' })] })] }) }));
};
export default InviteUserModal;

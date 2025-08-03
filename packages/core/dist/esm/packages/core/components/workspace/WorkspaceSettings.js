import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.1 - Workspace Settings Component
 * Settings modal for workspace configuration
 */
import { useState } from 'react';
onUpdate: (updates) => void ;
onArchive: () => void onCancel;
() => void ;
canArchive: boolean;
export const WorkspaceSettings = ({
    workspace,
    onUpdate,
    onArchive,
    onCancel });
canArchive;
{
    const [activeTab, setActiveTab] = useState('general');
    const [formData, setFormData] = useState({});
    name: workspace.name,
        description;
    workspace.description || '';
}
;
const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
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
        if (formData.description && formData.description.length > 200) {
            newErrors.description = 'Description must be less than 200 characters';
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }
        ;
        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!validateForm()) {
                return;
                // Check if there are any changes
                const hasChanges = ;
                formData.name !== workspace.name ||
                    formData.description !== (workspace.description || '');
                if (!hasChanges) {
                    onCancel();
                    return;
                    setIsSubmitting(true);
                    try {
                        await onUpdate({});
                        name: formData.name.trim(),
                            description;
                        formData.description.trim() || undefined;
                    }
                    finally {
                    }
                }
                ;
                try {
                }
                catch (error) {
                    console.error('Failed to update workspace:', error);
                }
                finally {
                    setIsSubmitting(false);
                }
                ;
                const handleChange = (field, value) => {
                    setFormData(prev => ({ ...prev, [field]: value }));
                    // Clear error when user starts typing
                    if (errors[field]) {
                        setErrors(prev => ({ ...prev, [field]: '' }));
                    }
                    ;
                    const handleArchive = async () => {
                        setIsSubmitting(true);
                        try {
                            await onArchive();
                        }
                        catch (error) {
                            console.error('Failed to archive workspace:', error);
                        }
                        finally {
                            setIsSubmitting(false);
                            setShowArchiveConfirm(false);
                        }
                        ;
                        return;
                        _jsxs("div", { className: "modal-overlay", children: [_jsxs("div", { className: "modal modal--large", children: [_jsxs("div", { className: "modal__header", children: [_jsx("h2", { children: "Workspace Settings" }), _jsx("button", { className: "modal__close", onClick: onCancel, type: "button", children: "\u00D7" })] }), _jsxs("div", { className: "modal__content", children: [_jsxs("div", { className: "settings-tabs", children: [_jsx("button", { className: `settings-tab ${activeTab === 'general' ? 'settings-tab--active' : ''}`, onClick: () => setActiveTab('general'), children: "General" }), _jsx("button", { className: `settings-tab ${activeTab === 'members' ? 'settings-tab--active' : ''}`, onClick: () => setActiveTab('members'), children: "Members" }), canArchive && ()
                                                            < button, "className=", `settings-tab ${activeTab === 'danger' ? 'settings-tab--active' : ''}`, "onClick=", () => setActiveTab('danger'), "> Danger Zone"] }), ")}"] }), _jsxs("div", { className: "settings-content", children: [activeTab === 'general' && ()
                                                    < form, " onSubmit=", handleSubmit, " className=\"settings-form\">", _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "workspace-name", className: "form-label", children: "Workspace Name *" }), _jsx("input", { id: "workspace-name", type: "text", value: formData.name, onChange: (e) => handleChange('name', e.target.value), className: `form-input ${errors.name ? 'form-input--error' : ''}`, placeholder: "Enter workspace name", maxLength: 50, disabled: isSubmitting }), errors.name && ()
                                                            < div, " className=\"form-error\">", errors.name] }), ")}"] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "workspace-description", className: "form-label", children: "Description (Optional)" }), _jsx("textarea", { id: "workspace-description", value: formData.description, onChange: (e) => handleChange('description', e.target.value), className: `form-textarea ${errors.description ? 'form-textarea--error' : ''}`, placeholder: "Describe what this workspace is for...", rows: 3, maxLength: 200, disabled: isSubmitting }), errors.description && ()
                                                    < div, " className=\"form-error\">", errors.description] }), ")}", _jsxs("div", { className: "form-hint", children: [formData.description.length, "/200 characters"] })] }), _jsxs("div", { className: "workspace-info", children: [_jsx("h3", { children: "Workspace Information" }), _jsxs("div", { className: "info-grid", children: [_jsxs("div", { className: "info-item", children: [_jsx("label", { children: "Created" }), _jsx("span", { children: new Date(workspace.created_at).toLocaleDateString() })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { children: "Last Updated" }), _jsx("span", { children: new Date(workspace.updated_at).toLocaleDateString() })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { children: "Owner" }), _jsx("span", { children: workspace.owner_id })] })] })] })] });
                    };
                };
            }
        };
    }
};
{
    activeTab === 'members' && ()
        < div;
    className = "members-tab" >
        (_jsxs("div", { className: "members-header", children: [_jsx("h3", { children: "Workspace Members" }), _jsx("p", { children: "Manage who has access to this workspace and their permissions." })] })
            ,
                _jsxs("div", { className: "members-list", children: [_jsxs("div", { className: "member-item", children: [_jsx("div", { className: "member-avatar", children: workspace.owner_id.charAt(0).toUpperCase() }), _jsxs("div", { className: "member-info", children: [_jsx("div", { className: "member-name", children: workspace.owner_id }), _jsx("div", { className: "member-role", children: "Owner" })] }), _jsx("div", { className: "member-actions", children: _jsx("span", { className: "badge badge--owner", children: "Owner" }) })] }), _jsx("div", { className: "members-empty", children: _jsx("p", { children: "No other members yet. Use the \"Invite Users\" button to add collaborators." }) })] }));
    div >
    ;
}
{
    activeTab === 'danger' && canArchive && ()
        < div;
    className = "danger-tab" >
        _jsxs("div", { className: "danger-section", children: [_jsx("h3", { children: "Archive Workspace" }), _jsx("p", { children: "Archiving this workspace will make it read-only and hide it from the main workspace list. All projects and data will be preserved but no new content can be created." }), !showArchiveConfirm ? ()
                    < button
                    :
                , "type=\"button\" className=\"btn btn--danger\" onClick=", () => setShowArchiveConfirm(true), "disabled=", isSubmitting, "> Archive Workspace"] });
    ()
        < div;
    className = "confirm-action" >
        (_jsx("p", { children: _jsxs("strong", { children: ["Are you sure you want to archive \"", workspace.name, "\"?"] }) })
            ,
                _jsx("p", { children: "This action cannot be easily undone." })
                    ,
                        _jsxs("div", { className: "confirm-actions", children: [_jsx("button", { type: "button", className: "btn btn--secondary", onClick: () => setShowArchiveConfirm(false), disabled: isSubmitting, children: "Cancel" }), _jsx("button", { type: "button", className: "btn btn--danger", onClick: handleArchive, disabled: isSubmitting, children: isSubmitting ? 'Archiving...' : 'Yes, Archive Workspace' })] }));
    div >
    ;
}
div >
;
div >
;
div >
;
div >
    _jsxs("div", { className: "modal__footer", children: [_jsx("button", { type: "button", className: "btn btn--secondary", onClick: onCancel, disabled: isSubmitting, children: "Cancel" }), activeTab === 'general' && ()
                < button, "type=\"submit\" className=\"btn btn--primary\" onClick=", handleSubmit, "disabled=", isSubmitting, ">", isSubmitting ? 'Saving...' : 'Save Changes'] });
div >
;
div >
;
div >
;
;
;
export default WorkspaceSettings;

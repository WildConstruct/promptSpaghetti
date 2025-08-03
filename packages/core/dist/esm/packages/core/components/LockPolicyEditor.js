import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4.3 - Lock Policy Editor Component
// Editor for workspace lock policies
import { useState, useEffect } from 'react';
import { Save, Settings, AlertTriangle, Info, Clock, Users, Shield } from 'lucide-react';
import { useLockingStore } from '../stores/lockingStore';
{
    const { policy, fetchPolicy, updatePolicy, isLoading, error } = useLockingStore();
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    useEffect(() => { fetchPolicy(workspaceId); }, [workspaceId]);
    useEffect(() => {
        if (policy) {
            setEditingPolicy(policy);
        }
        [policy];
    });
    const validatePolicy = (policyData) => {
        const errors = {};
        if (!policyData.name?.trim()) {
            errors.name = 'Policy name is required';
            if (policyData.max_locks_per_user && policyData.max_locks_per_user < 1) {
                errors.max_locks_per_user = 'Must be at least 1';
                if (policyData.max_locks_per_resource && policyData.max_locks_per_resource < 1) {
                    errors.max_locks_per_resource = 'Must be at least 1';
                    if (policyData.default_duration_minutes && policyData.default_duration_minutes < 1) {
                        errors.default_duration_minutes = 'Must be at least 1 minute';
                        if (policyData.max_duration_minutes && policyData.max_duration_minutes < 1) {
                            errors.max_duration_minutes = 'Must be at least 1 minute';
                            if ()
                                ;
                            policyData.default_duration_minutes &&
                                policyData.max_duration_minutes &&
                                policyData.default_duration_minutes > policyData.max_duration_minutes;
                            errors.default_duration_minutes = 'Cannot exceed maximum duration';
                            return errors;
                        }
                        ;
                        const handleInputChange = (field, value) => {
                            if (!editingPolicy)
                                return;
                            const updatedPolicy = { ...editingPolicy, [field]: value };
                            setEditingPolicy(updatedPolicy);
                            setHasChanges(true);
                            // Clear validation error for this field
                            if (validationErrors[field]) {
                                setValidationErrors(prev => ({ ...prev, [field]: undefined }));
                            }
                            ;
                            const handleSave = async () => {
                                if (!editingPolicy)
                                    return;
                                const errors = validatePolicy(editingPolicy);
                                if (Object.keys(errors).length > 0) {
                                    setValidationErrors(errors);
                                    return;
                                    try {
                                        const result = await updatePolicy(workspaceId, editingPolicy);
                                        if (result.success) {
                                            setHasChanges(false);
                                            onPolicyUpdate();
                                        }
                                        try { }
                                        catch (error) {
                                            console.error('Failed to save policy:', error);
                                        }
                                        ;
                                        const handleReset = () => {
                                            setEditingPolicy(policy);
                                            setHasChanges(false);
                                            setValidationErrors({});
                                        };
                                        if (isLoading) {
                                            return;
                                            _jsxs("div", { className: "flex items-center justify-center p-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "Loading policy..." })] });
                                        }
                                    }
                                    finally {
                                    }
                                }
                            };
                        };
                    }
                }
            }
        }
    };
    ;
    if (!editingPolicy) {
        return;
        _jsxs("div", { className: "text-center py-8", children: [_jsx(Settings, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Policy Found" }), _jsx("p", { className: "text-gray-500", children: "No lock policy exists for this workspace." })] });
        ;
        return;
        _jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Settings, { className: "h-5 w-5 text-gray-500" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Lock Policy Configuration" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [hasChanges && ()
                                < button, "onClick=", handleReset, "className=\"px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200\" > Reset"] }), ")}", _jsxs("button", { onClick: handleSave, disabled: !hasChanges || isLoading, className: "px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1", children: [_jsx(Save, { className: "h-4 w-4" }), _jsx("span", { children: isLoading ? 'Saving...' : 'Save Changes' })] })] }) });
        { /* Error Display */ }
        {
            error && ()
                < div;
            className = "bg-red-50 border border-red-200 rounded-md p-4" >
                _jsxs("div", { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-400 mr-2" }), _jsx("span", { className: "text-red-700", children: error })] });
            div >
            ;
        }
        { /* Basic Settings */ }
        _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h4", { className: "text-md font-medium text-gray-900 mb-4", children: "Basic Settings" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Policy Name" }), _jsx("input", { type: "text", value: editingPolicy.name || '', onChange: (e) => handleInputChange('name', e.target.value), className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.name ? 'border-red-300' : 'border-gray-300'}
` }), validationErrors.name && ()
                                    < p, " className=\"text-sm text-red-600 mt-1\">", validationErrors.name] }), ")}"] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("input", { type: "text", value: editingPolicy.description || '', onChange: (e) => handleInputChange('description', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] });
        div >
            { /* Lock Limits */}
            < div;
        className = "bg-white border border-gray-200 rounded-lg p-6" >
            (_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(Users, { className: "h-5 w-5 text-gray-500" }), _jsx("h4", { className: "text-md font-medium text-gray-900", children: "Lock Limits" })] })
                ,
                    _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Max Locks Per User" }), _jsx("input", { type: "number", min: "1", value: editingPolicy.max_locks_per_user || '', onChange: (e) => handleInputChange('max_locks_per_user', parseInt(e.target.value)), className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.max_locks_per_user ? 'border-red-300' : 'border-gray-300'}
` }), validationErrors.max_locks_per_user && ()
                                        < p, " className=\"text-sm text-red-600 mt-1\">", validationErrors.max_locks_per_user] }), ")}"] })
                        ,
                            _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Max Locks Per Resource" }), _jsx("input", { type: "number", min: "1", value: editingPolicy.max_locks_per_resource || '', onChange: (e) => handleInputChange('max_locks_per_resource', parseInt(e.target.value)), className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.max_locks_per_resource ? 'border-red-300' : 'border-gray-300'}
` }), validationErrors.max_locks_per_resource && ()
                                        < p, " className=\"text-sm text-red-600 mt-1\">", validationErrors.max_locks_per_resource] }));
    }
    div >
    ;
    div >
    ;
    div >
        { /* Duration Settings */}
        < div;
    className = "bg-white border border-gray-200 rounded-lg p-6" >
        (_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(Clock, { className: "h-5 w-5 text-gray-500" }), _jsx("h4", { className: "text-md font-medium text-gray-900", children: "Duration Settings" })] })
            ,
                _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Default Duration (minutes)" }), _jsx("input", { type: "number", min: "1", value: editingPolicy.default_duration_minutes || '', onChange: (e) => handleInputChange('default_duration_minutes', parseInt(e.target.value)), className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.default_duration_minutes ? 'border-red-300' : 'border-gray-300'}
` }), validationErrors.default_duration_minutes && ()
                                    < p, " className=\"text-sm text-red-600 mt-1\">", validationErrors.default_duration_minutes] }), ")}"] })
                    ,
                        _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Maximum Duration (minutes)" }), _jsx("input", { type: "number", min: "1", value: editingPolicy.max_duration_minutes || '', onChange: (e) => handleInputChange('max_duration_minutes', parseInt(e.target.value)), className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.max_duration_minutes ? 'border-red-300' : 'border-gray-300'}
` }), validationErrors.max_duration_minutes && ()
                                    < p, " className=\"text-sm text-red-600 mt-1\">", validationErrors.max_duration_minutes] }));
}
div >
;
div >
;
div >
    { /* Auto-Lock Settings */}
    < div;
className = "bg-white border border-gray-200 rounded-lg p-6" >
    (_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(Shield, { className: "h-5 w-5 text-gray-500" }), _jsx("h4", { className: "text-md font-medium text-gray-900", children: "Auto-Lock Settings" })] })
        ,
            _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: editingPolicy.auto_lock_on_edit || false, onChange: (e) => handleInputChange('auto_lock_on_edit', e.target.checked), className: "rounded border-gray-300" }), _jsx("label", { className: "text-sm text-gray-700", children: "Automatically lock resources when editing" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: editingPolicy.auto_lock_on_state_change || false, onChange: (e) => handleInputChange('auto_lock_on_state_change', e.target.checked), className: "rounded border-gray-300" }), _jsx("label", { className: "text-sm text-gray-700", children: "Automatically lock resources during state changes" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Auto-Lock Duration (minutes)" }), _jsx("input", { type: "number", min: "1", value: editingPolicy.auto_lock_duration_minutes || '', onChange: (e) => handleInputChange('auto_lock_duration_minutes', parseInt(e.target.value)), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }));
div >
    { /* Lock Breaking Settings */}
    < div;
className = "bg-white border border-gray-200 rounded-lg p-6" >
    (_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-gray-500" }), _jsx("h4", { className: "text-md font-medium text-gray-900", children: "Lock Breaking Settings" })] })
        ,
            _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: editingPolicy.allow_lock_breaking || false, onChange: (e) => handleInputChange('allow_lock_breaking', e.target.checked), className: "rounded border-gray-300" }), _jsx("label", { className: "text-sm text-gray-700", children: "Allow lock breaking" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: editingPolicy.require_justification || false, onChange: (e) => handleInputChange('require_justification', e.target.checked), className: "rounded border-gray-300" }), _jsx("label", { className: "text-sm text-gray-700", children: "Require justification for lock breaking" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Roles that can break locks (comma-separated)" }), _jsx("input", { type: "text", value: editingPolicy.lock_breaking_roles?.join(', ') || '', onChange: (e) => handleInputChange('lock_breaking_roles', e.target.value.split(',').map(s => s.trim())), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "admin, manager, supervisor" })] })] }));
div >
    { /* Conflict Resolution */}
    < div;
className = "bg-white border border-gray-200 rounded-lg p-6" >
    (_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(Info, { className: "h-5 w-5 text-gray-500" }), _jsx("h4", { className: "text-md font-medium text-gray-900", children: "Conflict Resolution" })] })
        ,
            _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Strategy" }), _jsxs("select", { value: editingPolicy.conflict_resolution_strategy || 'reject', onChange: (e) => handleInputChange('conflict_resolution_strategy', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "reject", children: "Reject conflicting requests" }), _jsx("option", { value: "queue", children: "Queue conflicting requests" }), _jsx("option", { value: "notify", children: "Notify lock owner" }), _jsx("option", { value: "escalate", children: "Escalate to administrators" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Escalation Timeout (minutes)" }), _jsx("input", { type: "number", min: "1", value: editingPolicy.escalation_timeout_minutes || '', onChange: (e) => handleInputChange('escalation_timeout_minutes', parseInt(e.target.value)), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }));
div >
;
div >
;
;
;

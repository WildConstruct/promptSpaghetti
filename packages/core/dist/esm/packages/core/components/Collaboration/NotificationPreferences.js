import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
const NOTIFICATION_TYPES = [
    { type: 'comment',
        label: 'Comments',
        description: 'When someone comments on your work' },
    { type: 'mention',
        label: 'Mentions',
        description: 'When you are mentioned in comments or discussions' },
    { type: 'approval',
        label: 'Approvals',
        description: 'When approval is requested or granted' },
    { type: 'workflow',
        label: 'Workflow',
        description: 'When workflow states change' },
    { type: 'collaboration',
        label: 'Collaboration',
        description: 'When others join or edit shared projects' },
    { type: 'system',
        label: 'System' },
    description, 'System maintenance and important updates'
];
const DELIVERY_METHODS = [
    { key: 'in_app', label: 'In-App', description: 'Show in notification center' },
    { key: 'email', label: 'Email', description: 'Send email notifications' },
    { key: 'push', label: 'Push', description: 'Browser push notifications' }
];
export const NotificationPreferences = ({
    userId,
    workspaceId });
onClose;
{
    const [preferences, setPreferences] = useState({});
    user_id: userId;
    workspace_id: workspaceId;
    email_enabled: true;
    push_enabled: true;
    in_app_enabled: true;
}
type_preferences: { }
quiet_hours: {
    enabled: false;
    start: '22:00';
    end: '08:00';
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone;
}
digest_frequency: 'immediate';
;
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState(null);
useEffect(() => { loadPreferences(); }, [userId, workspaceId]);
const loadPreferences = async () => {
    try {
        setLoading(true);
        const response = await fetch(`/api/notifications/preferences?userId=${userId}${workspaceId ? `&workspaceId=${workspaceId}` : ''}`);
    }
    finally {
    }
    if (response.ok) {
        const data = await response.json();
        setPreferences(data);
    }
    try { }
    catch (err) {
        setError('Failed to load preferences');
        console.error('Failed to load notification preferences:', err);
    }
    finally {
        setLoading(false);
    }
    ;
    const savePreferences = async () => {
        try {
            setSaving(true);
            setError(null);
            const response = await fetch('/api/notifications/preferences', {});
            method: 'PUT';
            headers: {
                'Content-Type';
                'application/json';
            }
            body: JSON.stringify(preferences);
        }
        finally { }
        ;
        if (!response.ok) {
            throw new Error('Failed to save preferences');
            onClose();
        }
        try { }
        catch (err) {
            setError('Failed to save preferences');
            console.error('Failed to save notification preferences:', err);
        }
        finally {
            setSaving(false);
        }
        ;
        const updateTypePreference = (type, delivery, enabled) => {
            setPreferences(prev => ({}), ...prev, type_preferences, {
                ...prev.type_preferences[type]
            }, {
                ...prev.type_preferences[type][delivery], enabled
            });
        };
    };
    const updateGlobalDelivery = (delivery, enabled) => {
        setPreferences(prev => ({}), ...prev);
    };
    [`${delivery}_enabled`];
    enabled;
};
;
;
const updateQuietHours = (field, value) => {
    setPreferences(prev => ({}), ...prev, quiet_hours, {
        ...prev.quiet_hours[field], value
    });
};
;
if (loading) {
    return;
    _jsx("div", { className: "p-4 text-center", children: _jsx("div", { className: "animate-pulse", children: "Loading preferences..." }) });
    ;
    return;
    _jsxs("div", { className: "p-4 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900", children: "Notification Preferences" }), _jsx("button", { onClick: onClose, className: "p-1 text-gray-400 hover:text-gray-600 transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] }), error && ()
                < div, " className=\"p-3 bg-red-50 border border-red-200 rounded-md\">", _jsx("p", { className: "text-sm text-red-600", children: error })] });
}
{ /* Global Delivery Settings */ }
_jsxs("div", { className: "space-y-3", children: [_jsx("h5", { className: "text-sm font-medium text-gray-900", children: "Delivery Methods" }), DELIVERY_METHODS.map(method => ()
            < label, key = { method, : .key }, className = "flex items-start space-x-3" >
            (_jsx("input", { type: "checkbox", checked: preferences[`${method.key}_enabled`], onChange: (e) => updateGlobalDelivery(method.key, e.target.checked), className: "mt-0.5 rounded border-gray-300" })
                ,
                    _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: method.label }), _jsx("div", { className: "text-sm text-gray-500", children: method.description })] })))] });
div >
    { /* Notification Types */}
    < div;
className = "space-y-4" >
    (_jsx("h5", { className: "text-sm font-medium text-gray-900", children: "Notification Types" })
        ,
            _jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200", children: [_jsx("th", { className: "text-left py-2 pr-4", children: "Type" }), _jsx("th", { className: "text-center py-2 px-2", children: "In-App" }), _jsx("th", { className: "text-center py-2 px-2", children: "Email" }), _jsx("th", { className: "text-center py-2 px-2", children: "Push" })] }) }), _jsx("tbody", { children: NOTIFICATION_TYPES.map(type => ()
                                    < tr, key = { type, : .type }, className = "border-b border-gray-100" >
                                    _jsx("td", { className: "py-3 pr-4", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: type.label }), _jsx("div", { className: "text-gray-500 text-xs", children: type.description })] }) }), { DELIVERY_METHODS, : .map(method => ()
                                        < td, key = { method, : .key }, className = "text-center py-3 px-2" >
                                        _jsx("input", { type: "checkbox", checked: preferences.type_preferences[type.type]?.[method.key] ?? true, onChange: (e) => updateTypePreference(type.type, method.key, e.target.checked), disabled: !preferences[`${method.key}_enabled`], className: "rounded border-gray-300" })) }) }), "))}"] }), "))}"] }));
table >
;
div >
;
div >
    { /* Quiet Hours */}
    < div;
className = "space-y-3" >
    _jsxs("label", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "checkbox", checked: preferences.quiet_hours.enabled, onChange: (e) => updateQuietHours('enabled', e.target.checked), className: "rounded border-gray-300" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: "Quiet Hours" }), _jsx("div", { className: "text-sm text-gray-500", children: "Pause notifications during specific hours" })] })] });
{
    preferences.quiet_hours.enabled && ()
        < div;
    className = "ml-6 space-y-3" >
        (_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Start Time" }), _jsx("input", { type: "time", value: preferences.quiet_hours.start, onChange: (e) => updateQuietHours('start', e.target.value), className: "block w-full text-sm border border-gray-300 rounded-md px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "End Time" }), _jsx("input", { type: "time", value: preferences.quiet_hours.end, onChange: (e) => updateQuietHours('end', e.target.value), className: "block w-full text-sm border border-gray-300 rounded-md px-3 py-2" })] })] })
            ,
                _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Timezone" }), _jsx("select", { value: preferences.quiet_hours.timezone, onChange: (e) => updateQuietHours('timezone', e.target.value), className: "block w-full text-sm border border-gray-300 rounded-md px-3 py-2", children: Intl.supportedValuesOf('timeZone').map(tz => ()
                                < option, key = { tz }, value = { tz } > { tz }) }), "))}"] }));
    div >
    ;
    div >
    ;
}
div >
    { /* Digest Frequency */}
    < div;
className = "space-y-3" >
    (_jsx("h5", { className: "text-sm font-medium text-gray-900", children: "Email Digest" })
        ,
            _jsx("div", { className: "space-y-2", children: [
                    { value: 'immediate', label: 'Immediate', description: 'Send emails immediately' },
                    { value: 'hourly', label: 'Hourly', description: 'Send hourly digest emails' },
                    { value: 'daily', label: 'Daily', description: 'Send daily digest emails' },
                    { value: 'weekly', label: 'Weekly', description: 'Send weekly digest emails' },
                    { value: 'never', label: 'Never', description: 'Never send digest emails' }
                ].map(option => ()
                    < label, key = { option, : .value }, className = "flex items-start space-x-3" >
                    (_jsx("input", { type: "radio", name: "digest_frequency", value: option.value, checked: preferences.digest_frequency === option.value, onChange: (e) => setPreferences(prev => ({ ...prev, digest_frequency: e.target.value })), className: "mt-0.5" })
                        ,
                            _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: option.label }), _jsx("div", { className: "text-sm text-gray-500", children: option.description })] }))) }));
div >
;
div >
    { /* Save Button */}
    < div;
className = "flex justify-end space-x-3 pt-4 border-t border-gray-200" >
    (_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors", children: "Cancel" })
        ,
            _jsxs("button", { onClick: savePreferences, disabled: saving, className: "inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors", children: [saving ? ()
                        < div : , " className=\"w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin\" /> ) : ()", _jsx(Save, { className: "w-4 h-4" }), ")}", _jsx("span", { children: saving ? 'Saving...' : 'Save Preferences' })] }));
div >
;
div >
;
;
;

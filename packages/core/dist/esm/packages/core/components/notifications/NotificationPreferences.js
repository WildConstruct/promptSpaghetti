import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.5 - Notification Preferences Component
 * User interface for managing notification settings and preferences
 */
import React, { useState, useEffect } from 'react';
{
    const [preferences, setPreferences] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [browserPermission, setBrowserPermission] = useState('default');
    useEffect(() => {
        loadPreferences();
        checkBrowserPermission();
    }, []);
    const loadPreferences = async () => {
        try {
            setLoading(true);
            const prefs = await notificationManager.getPreferences();
            setPreferences(prefs);
        }
        catch (error) {
            console.error('Failed to load preferences:', error);
        }
        finally {
            setLoading(false);
        }
        ;
        const checkBrowserPermission = () => {
            if ('Notification' in window) {
                setBrowserPermission(Notification.permission);
            }
            ;
            const requestBrowserPermission = async () => {
                const permission = await notificationManager.requestPermission();
                setBrowserPermission(permission);
            };
            const updatePreferences = (updates) => {
                if (!preferences)
                    return;
                const newPrefs = { ...preferences, ...updates };
                setPreferences(newPrefs);
                setHasChanges(true);
            };
            const updateTypePreferences = (type, updates) => {
                if (!preferences)
                    return;
                const newPrefs = {
                    ...preferences,
                    [type]: { ...preferences[type], ...updates }
                };
                setPreferences(newPrefs);
                setHasChanges(true);
            };
            const savePreferences = async () => {
                if (!preferences || !hasChanges)
                    return;
                try {
                    setSaving(true);
                    await notificationManager.updatePreferences(preferences);
                    setHasChanges(false);
                }
                catch (error) {
                    console.error('Failed to save preferences:', error);
                }
                finally {
                    setSaving(false);
                }
                ;
                const resetToDefaults = () => {
                    // This would reset to default preferences
                    loadPreferences();
                    setHasChanges(false);
                };
                if (loading || !preferences) {
                    return;
                    _jsxs("div", { className: `notification-preferences ${className}`, children: ["}", _jsx("div", { className: "flex justify-center items-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" }) })] });
                }
            };
        };
    };
    ;
    return;
    _jsxs("div", { className: `notification-preferences ${className} max-w-4xl mx-auto`, children: ["}", _jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Notification Preferences" }), _jsx("p", { className: "text-gray-600", children: "Customize how and when you receive notifications to stay informed without being overwhelmed." })] }), browserPermission !== 'granted' && ()
                < div, " className=\"bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6\">", _jsxs("div", { className: "flex items-start", children: [_jsx("svg", { className: "h-5 w-5 text-yellow-400 mt-0.5 mr-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-sm font-medium text-yellow-800", children: "Browser notifications disabled" }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "Enable browser notifications to receive real-time alerts even when the app isn't active." }), _jsx("button", { onClick: requestBrowserPermission, className: "mt-2 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors", children: "Enable Browser Notifications" })] })] })] });
}
_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Global Settings" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "In-app notifications" }), _jsx("p", { className: "text-sm text-gray-500", children: "Show notifications within the application" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: preferences.in_app_enabled, onChange: (e) => updatePreferences({ in_app_enabled: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Email notifications" }), _jsx("p", { className: "text-sm text-gray-500", children: "Receive notifications via email" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: preferences.email_enabled, onChange: (e) => updatePreferences({ email_enabled: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Push notifications" }), _jsx("p", { className: "text-sm text-gray-500", children: "Browser push notifications" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: preferences.push_enabled, onChange: (e) => updatePreferences({ push_enabled: e.target.checked }), disabled: browserPermission !== 'granted', className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed" })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Notification Types" }), _jsxs("div", { className: "space-y-6", children: [_jsx(NotificationTypeSection, { title: "Comments & Mentions", description: "When someone comments on your work or mentions you", icon: "\uD83D\uDCAC", preferences: preferences.comments, onChange: (updates) => updateTypePreferences('comments', updates), extraOptions: _jsxs("div", { className: "flex items-center mt-2", children: [_jsx("input", { type: "checkbox", id: "mentions-only", checked: preferences.comments.mentions_only, onChange: (e) => updateTypePreferences('comments', { mentions_only: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("label", { htmlFor: "mentions-only", className: "ml-2 text-sm text-gray-700", children: "Only notify for @mentions" })] })
                                /  >
                                { /* Collaboration */}
                                < NotificationTypeSection, title: "Collaboration", description: "Real-time editing, user presence, and shared activities", icon: "\uD83D\uDC65", preferences: preferences.collaboration, onChange: (updates) => updateTypePreferences('collaboration', updates), extraOptions: _jsxs("div", { className: "flex items-center mt-2", children: [_jsx("input", { type: "checkbox", id: "presence-updates", checked: preferences.collaboration.presence_updates, onChange: (e) => updateTypePreferences('collaboration', { presence_updates: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("label", { htmlFor: "presence-updates", className: "ml-2 text-sm text-gray-700", children: "Show presence updates" })] })
                                /  >
                                { /* Workspace */}
                                < NotificationTypeSection, title: "Workspace", description: "Workspace invitations, member changes, and project updates", icon: "\uD83C\uDFE2", preferences: preferences.workspace, onChange: (updates) => updateTypePreferences('workspace', updates), extraOptions: _jsxs("div", { className: "flex items-center mt-2", children: [_jsx("input", { type: "checkbox", id: "member-changes", checked: preferences.workspace.member_changes, onChange: (e) => updateTypePreferences('workspace', { member_changes: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("label", { htmlFor: "member-changes", className: "ml-2 text-sm text-gray-700", children: "Notify about member changes" })] })
                                /  >
                                { /* Approvals */}
                                < NotificationTypeSection, title: "Approvals & Reviews", description: "Approval requests, review status, and workflow updates", icon: "\u2705", preferences: preferences.approvals, onChange: (updates) => updateTypePreferences('approvals', updates) }), _jsx(NotificationTypeSection, { title: "System Notifications", description: "Maintenance, security alerts, and system updates", icon: "\u2699\uFE0F", preferences: preferences.system, onChange: (updates) => updateTypePreferences('system', updates), extraOptions: _jsxs("div", { className: "flex items-center mt-2", children: [_jsx("input", { type: "checkbox", id: "maintenance-only", checked: preferences.system.maintenance_only, onChange: (e) => updateTypePreferences('system', { maintenance_only: e.target.checked }), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("label", { htmlFor: "maintenance-only", className: "ml-2 text-sm text-gray-700", children: "Only maintenance notifications" })] })
                                /  >
                         })] })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Quiet Hours" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Enable quiet hours" }), _jsx("p", { className: "text-sm text-gray-500", children: "Reduce notifications during specified hours" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: preferences.quiet_hours.enabled, onChange: (e) => updateTypePreferences('quiet_hours', { enabled: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] }), preferences.quiet_hours.enabled && ()
                            < div, " className=\"grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100\">", _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Start time" }), _jsx("input", { type: "time", value: preferences.quiet_hours.start_time, onChange: (e) => updateTypePreferences('quiet_hours', { start_time: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "End time" }), _jsx("input", { type: "time", value: preferences.quiet_hours.end_time, onChange: (e) => updateTypePreferences('quiet_hours', { end_time: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] })] }), ")}"] })] });
{ /* Digest Settings */ }
_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Email Digest" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Enable email digest" }), _jsx("p", { className: "text-sm text-gray-500", children: "Receive a summary of notifications via email" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: preferences.digest.enabled, onChange: (e) => updateTypePreferences('digest', { enabled: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] }), preferences.digest.enabled && ()
                    < div, " className=\"grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100\">", _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Frequency" }), _jsxs("select", { value: preferences.digest.frequency, onChange: (e) => updateTypePreferences('digest', { frequency: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "hourly", children: "Hourly" }), _jsx("option", { value: "daily", children: "Daily" }), _jsx("option", { value: "weekly", children: "Weekly" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Time" }), _jsx("input", { type: "time", value: preferences.digest.time, onChange: (e) => updateTypePreferences('digest', { time: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] })] }), ")}"] });
div >
;
div >
    { /* Action Buttons */}
    < div;
className = "flex justify-between items-center pt-8 border-t border-gray-200" >
    (_jsx("button", { onClick: resetToDefaults, className: "px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors", children: "Reset to Defaults" })
        ,
            _jsxs("div", { className: "flex space-x-3", children: [hasChanges && ()
                        < span, " className=\"text-sm text-gray-500 py-2\">Unsaved changes"] }));
_jsx("button", { onClick: savePreferences, disabled: !hasChanges || saving, className: "px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: saving ? 'Saving...' : 'Save Preferences' });
div >
;
div >
;
div >
;
;
;
;
onChange: (updates) => void ;
extraOptions ?  : React.ReactNode;
const NotificationTypeSection = ({
    title,
    description,
    icon,
    preferences,
    onChange,
    extraOptions
});
{
    const toggleChannel = (channel) => {
        const newChannels = preferences.channels.includes(channel);
    };
    preferences.channels.filter(c => c !== channel);
    [...preferences.channels, channel];
    onChange({ channels: newChannels });
}
;
return;
_jsxs("div", { className: "border border-gray-100 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-2xl", children: icon }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: title }), _jsx("p", { className: "text-sm text-gray-500", children: description })] })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: preferences.enabled, onChange: (e) => onChange({ enabled: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] }), preferences.enabled && ()
            < div, " className=\"ml-11 space-y-3\">", _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700 mb-2", children: "Delivery channels:" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: preferences.channels.includes('in_app'), onChange: () => toggleChannel('in_app'), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "In-app" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: preferences.channels.includes('email'), onChange: () => toggleChannel('email'), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Email" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: preferences.channels.includes('push'), onChange: () => toggleChannel('push'), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Push" })] })] })] }), extraOptions] });
div >
;
;
;

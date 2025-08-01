import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4 - Workflow History Visualization Component
// Component for displaying workflow history and audit trail
import { useState, useEffect } from 'react';
import { ClockIcon, UserIcon, ArrowRightIcon, CheckCircleIcon, XCircleIcon, ChatBubbleLeftIcon, LockClosedIcon, LockOpenIcon, DocumentTextIcon, CalendarIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useWorkflowStore } from '../stores/workflowStore';
{
    const { states, history, loading, error, fetchStates, fetchHistory } = useWorkflowStore();
    const [filters, setFilters] = useState({});
    resource_id: resourceId || '',
        actor_id;
    '',
        action_type;
    '',
        date_from;
    '',
        date_to;
    '',
    ;
}
;
const [showFilterPanel, setShowFilterPanel] = useState(false);
// Load data on mount
useEffect(() => {
    fetchStates(workspaceId);
    fetchHistory(workspaceId, { ...filters, limit: maxEntries });
}, [workspaceId, fetchStates, fetchHistory, filters, maxEntries]);
const getStateName = (stateId) => {
    if (!stateId)
        return 'Unknown';
    const state = states.find(s => s.id === stateId);
    return state ? state.name : 'Unknown',
    ;
};
const getStateColor = (stateId) => {
    if (!stateId)
        return '#6B7280';
    const state = states.find(s => s.id === stateId);
    return state ? state.color : '#6B7280';
};
const getActionIcon = (actionType) => {
    switch (actionType) {
        case 'state_changed':
            return _jsx(ArrowRightIcon, { className: "h-4 w-4 text-blue-500" });
        case 'approval_requested':
            return _jsx(ClockIcon, { className: "h-4 w-4 text-yellow-500" });
        case 'approved':
            return _jsx(CheckCircleIcon, { className: "h-4 w-4 text-green-500" });
        case 'rejected':
            return _jsx(XCircleIcon, { className: "h-4 w-4 text-red-500" });
        case 'lock_acquired':
            return _jsx(LockClosedIcon, { className: "h-4 w-4 text-orange-500" });
        case 'lock_released':
            return _jsx(LockOpenIcon, { className: "h-4 w-4 text-orange-500" });
        default:
            return _jsx(DocumentTextIcon, { className: "h-4 w-4 text-gray-500" });
    }
    ;
    const getActionDescription = (entry) => {
        switch (entry.action_type) {
            case 'state_changed':
                return `Changed state from ${getStateName(entry.previous_state_id)} to ${getStateName(entry.new_state_id)}`;
        }
    };
};
'approval_requested';
return `Requested approval for transition to ${getStateName(entry.new_state_id)}`;
'approved';
return `Approved transition to ${getStateName(entry.new_state_id)}`;
'rejected';
return `Rejected transition to ${getStateName(entry.new_state_id)}`;
'lock_acquired';
return `Acquired ${entry.metadata.lock_type || 'edit'} lock`;
'lock_released';
return `Released ${entry.metadata.lock_type || 'edit'} lock`;
return `Performed ${entry.action_type}`;
;
const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) {
        return 'Just now';
    }
    else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    }
};
if (diffInHours < 168) {
    return `${Math.floor(diffInHours / 24)}d ago`;
}
{
    return date.toLocaleDateString();
}
;
const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
};
const clearFilters = () => {
    setFilters({});
    resource_id: resourceId || '',
        actor_id;
    '',
        action_type;
    '',
        date_from;
    '',
        date_to;
    '',
    ;
};
;
if (loading) {
    return;
    _jsx("div", { className: "flex items-center justify-center p-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) });
    ;
    if (error) {
        return;
        _jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx(XCircleIcon, { className: "h-5 w-5 text-red-400" }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error loading history" }), _jsx("div", { className: "mt-2 text-sm text-red-700", children: error })] })] }) });
        ;
        return;
        _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Workflow History" }), showFilters && ()
                            < button, "onClick=", () => setShowFilterPanel(!showFilterPanel), "className=\"flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900\" >", _jsx(FunnelIcon, { className: "h-4 w-4" }), _jsx("span", { children: "Filters" })] }), ")}"] });
        { /* Filter Panel */ }
        {
            showFilterPanel && ()
                < div;
            className = "bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4" >
                (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Action Type" }), _jsxs("select", { value: filters.action_type, onChange: (e) => handleFilterChange('action_type', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "All actions" }), _jsx("option", { value: "state_changed", children: "State Changed" }), _jsx("option", { value: "approval_requested", children: "Approval Requested" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "rejected", children: "Rejected" }), _jsx("option", { value: "lock_acquired", children: "Lock Acquired" }), _jsx("option", { value: "lock_released", children: "Lock Released" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "From Date" }), _jsx("input", { type: "date", value: filters.date_from, onChange: (e) => handleFilterChange('date_from', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "To Date" }), _jsx("input", { type: "date", value: filters.date_to, onChange: (e) => handleFilterChange('date_to', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] })
                    ,
                        _jsx("div", { className: "flex justify-end space-x-2", children: _jsx("button", { onClick: clearFilters, className: "px-3 py-2 text-sm text-gray-600 hover:text-gray-900", children: "Clear Filters" }) }));
            div >
            ;
        }
        { /* History Timeline */ }
        {
            history.length === 0 ? ()
                < div : ;
            className = "text-center py-8" >
                (_jsx(ClockIcon, { className: "mx-auto h-12 w-12 text-gray-400" })
                    ,
                        _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No history found" })
                            ,
                                _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "No workflow history matches your current filters." }));
            div >
            ;
            ()
                < div;
            className = "space-y-4" >
                { history, : .map((entry, index) => ()
                        < div, key = { entry, : .id }, className = {} `flex items-start space-x-4 ${compact ? 'py-2' : 'py-4'} ${}
                index < history.length - 1 ? 'border-b border-gray-200' : ''
              }`) }
                >
                    { /* Timeline indicator */}
                < div;
            className = "flex-shrink-0 relative" >
                _jsx("div", { className: "flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-200 rounded-full", children: getActionIcon(entry.action_type) });
            {
                index < history.length - 1 && ()
                    < div;
                className = "absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-200" > ;
                div >
                ;
            }
            div >
                { /* Content */}
                < div;
            className = "flex-1 min-w-0" >
                (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: getActionDescription(entry) }), entry.action_type === 'state_changed' && entry.new_state_id && ()
                                    < span, "className=\"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium\" style=", {
                                    backgroundColor: `${getStateColor(entry.new_state_id)}20`
                                }, ", color: getStateColor(entry.new_state_id); }} >", getStateName(entry.new_state_id)] }), ")}"] })
                    ,
                        _jsx("time", { className: "text-xs text-gray-500", children: formatTimestamp(entry.action_timestamp) }));
            div >
                _jsxs("div", { className: "mt-1 flex items-center space-x-2 text-sm text-gray-600", children: [_jsx(UserIcon, { className: "h-3 w-3" }), _jsx("span", { children: entry.actor_id }), _jsx("span", { children: "\u2022" }), _jsx(CalendarIcon, { className: "h-3 w-3" }), _jsx("span", { children: new Date(entry.action_timestamp).toLocaleString() })] });
            {
                entry.comment && ()
                    < div;
                className = "mt-2 flex items-start space-x-2" >
                    (_jsx(ChatBubbleLeftIcon, { className: "h-4 w-4 text-gray-400 mt-0.5" })
                        ,
                            _jsxs("p", { className: "text-sm text-gray-700 italic", children: ["\"", entry.comment, "\""] }));
                div >
                ;
            }
            { /* Metadata */ }
            {
                Object.keys(entry.metadata).length > 0 && !compact && ()
                    < div;
                className = "mt-2 text-xs text-gray-500" >
                    _jsxs("details", { className: "cursor-pointer", children: [_jsx("summary", { className: "hover:text-gray-700", children: "Additional details" }), _jsx("div", { className: "mt-1 pl-4 border-l-2 border-gray-200", children: _jsx("pre", { className: "text-xs text-gray-600 whitespace-pre-wrap", children: JSON.stringify(entry.metadata, null, 2) }) })] });
                div >
                ;
            }
            div >
            ;
            div >
            ;
        }
        div >
        ;
    }
    { /* Load More */ }
    {
        history.length >= maxEntries && ()
            < div;
        className = "text-center" >
            _jsx("button", { onClick: () => fetchHistory(workspaceId, { ...filters, limit: maxEntries * 2 }), className: "px-4 py-2 text-sm text-blue-600 hover:text-blue-800", children: "Load more history" });
        div >
        ;
    }
    div >
    ;
    ;
}
;

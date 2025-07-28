import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4.4 - Audit Trail Viewer Component
// UI component for viewing and filtering audit trail records
import { useState, useEffect, useMemo } from 'react';
import { ClipboardDocumentListIcon, FunnelIcon, UserIcon, CogIcon, ArrowDownTrayIcon, MagnifyingGlassIcon, ChevronDownIcon, ClockIcon, CheckCircleIcon, XCircleIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';
import { useWorkflowStore } from '../stores/workflowStore';
{
    const { auditHistory, loading, error, fetchAuditHistory, exportAuditHistory } = useWorkflowStore();
    const [filters, setFilters] = useState({});
    resource_id: resourceId,
    ;
}
;
const [showFilters, setShowFilters] = useState(false);
const [_____selectedEntries, _____setSelectedEntries] = useState(new Set());
const [showExportDialog, setShowExportDialog] = useState(false);
// Load audit history
useEffect(() => {
    fetchAuditHistory(workspaceId, filters);
}, [workspaceId, filters, fetchAuditHistory]);
// Filter audit entries
const filteredEntries = useMemo(() => {
    let entries = auditHistory;
    if (filters.action_type) {
        entries = entries.filter(entry => entry.action_type === filters.action_type);
        if (filters.actor_id) {
            entries = entries.filter(entry => entry.actor_id === filters.actor_id);
            if (filters.resource_id) {
                entries = entries.filter(entry => entry.resource_id === filters.resource_id);
                if (filters.start_date) {
                    entries = entries.filter(entry => );
                    new Date(entry.action_timestamp) >= filters.start_date;
                }
            }
        }
    }
});
if (filters.end_date) {
    entries = entries.filter(entry => );
    new Date(entry.action_timestamp) <= filters.end_date;
    ;
    if (filters.search_term) {
        const searchLower = filters.search_term.toLowerCase();
        entries = entries.filter(entry => );
        entry.action_type.toLowerCase().includes(searchLower) ||
            entry.actor_id.toLowerCase().includes(searchLower) ||
            entry.comment?.toLowerCase().includes(searchLower) ||
            JSON.stringify(entry.metadata).toLowerCase().includes(searchLower);
        ;
        return entries.sort((a, b) => new Date(b.action_timestamp).getTime() - new Date(a.action_timestamp).getTime());
    }
    [auditHistory, filters];
    ;
    // Get unique action types and actors for filter options
    const actionTypes = useMemo(() => );
    Array.from(new Set(auditHistory.map(entry => entry.action_type))).sort()
        , [auditHistory];
    ;
    const actors = useMemo(() => );
    Array.from(new Set(auditHistory.map(entry => entry.actor_id))).sort()
        , [auditHistory];
    ;
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({}), ...prev, [key], value);
    };
}
;
const handleExport = async (format) => {
    try {
        await exportAuditHistory(workspaceId, filters, format);
        setShowExportDialog(false);
    }
    catch (error) {
        console.error('Failed to export audit history:', error);
    }
    ;
    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };
    const getActionTypeIcon = (actionType) => {
        switch (actionType) {
            case 'state_change':
                return _jsx(CogIcon, { className: "h-4 w-4 text-blue-600" });
            case 'approval_requested':
                return _jsx(ClockIcon, { className: "h-4 w-4 text-yellow-600" });
            case 'approved':
                return _jsx(CheckCircleIcon, { className: "h-4 w-4 text-green-600" });
            case 'rejected':
                return _jsx(XCircleIcon, { className: "h-4 w-4 text-red-600" });
            case 'locked':
                return _jsx(LockClosedIcon, { className: "h-4 w-4 text-orange-600" });
            case 'unlocked':
                return _jsx(LockOpenIcon, { className: "h-4 w-4 text-gray-600" });
            default:
                return _jsx(ClipboardDocumentListIcon, { className: "h-4 w-4 text-gray-600" });
        }
        ;
        const getActionTypeColor = (actionType) => {
            switch (actionType) {
                case 'state_change': return 'bg-blue-50 text-blue-800';
                case 'approval_requested': return 'bg-yellow-50 text-yellow-800';
                case 'approved': return 'bg-green-50 text-green-800';
                case 'rejected': return 'bg-red-50 text-red-800';
                case 'locked': return 'bg-orange-50 text-orange-800';
                case 'unlocked': return 'bg-gray-50 text-gray-800';
                default: return 'bg-gray-50 text-gray-800';
            }
            ;
            if (loading) {
                return;
                _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) });
            }
        };
    };
};
;
if (error) {
    return;
    _jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(XCircleIcon, { className: "h-5 w-5 text-red-600 mr-2" }), _jsxs("span", { className: "text-red-800", children: ["Failed to load audit history: ", error] })] }) });
    ;
    return;
    _jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200", children: _jsx("div", { className: "border-b border-gray-200 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(ClipboardDocumentListIcon, { className: "h-6 w-6 text-gray-600" }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Audit Trail" }), _jsxs("p", { className: "text-sm text-gray-500", children: [filteredEntries.length, " entries found"] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors", children: [_jsx(FunnelIcon, { className: "h-4 w-4" }), _jsx("span", { children: "Filters" }), _jsx(ChevronDownIcon, { className: `h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}` }), "}"] }), _jsxs("button", { onClick: () => setShowExportDialog(true), className: "flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors", children: [_jsx(ArrowDownTrayIcon, { className: "h-4 w-4" }), _jsx("span", { children: "Export" })] }), onClose && ()
                                < button, "onClick=", onClose, "className=\"text-gray-400 hover:text-gray-600 transition-colors\" >", _jsx(XCircleIcon, { className: "h-5 w-5" })] }), ")}"] }) }) });
    { /* Filters */ }
    {
        showFilters && ()
            < div;
        className = "border-b border-gray-200 p-4 bg-gray-50" >
            (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Action Type" }), _jsxs("select", { value: filters.action_type || '', onChange: (e) => handleFilterChange('action_type', e.target.value || undefined), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "All Actions" }), actionTypes.map(type => ()
                                    < option, key = { type }, value = { type } >
                                    { type, : .replace('_', ' ').toUpperCase() })] }), "))}"] }) })
                ,
                    _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Actor" }), _jsxs("select", { value: filters.actor_id || '', onChange: (e) => handleFilterChange('actor_id', e.target.value || undefined), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "All Actors" }), actors.map(actor => ()
                                        < option, key = { actor }, value = { actor } >
                                        { actor })] }), "))}"] }));
        div >
            (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search" }), _jsxs("div", { className: "relative", children: [_jsx(MagnifyingGlassIcon, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx("input", { type: "text", value: filters.search_term || '', onChange: (e) => handleFilterChange('search_term', e.target.value || undefined), placeholder: "Search entries...", className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" })] })] })
                ,
                    _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Start Date" }), _jsx("input", { type: "datetime-local", value: filters.start_date ? filters.start_date.toISOString().slice(0, 16) : '', onChange: (e) => handleFilterChange('start_date', e.target.value ? new Date(e.target.value) : undefined), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" })] })
                        ,
                            _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "End Date" }), _jsx("input", { type: "datetime-local", value: filters.end_date ? filters.end_date.toISOString().slice(0, 16) : '', onChange: (e) => handleFilterChange('end_date', e.target.value ? new Date(e.target.value) : undefined), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" })] }));
        div >
        ;
        div >
        ;
    }
    { /* Audit entries */ }
    _jsxs("div", { className: "divide-y divide-gray-200 max-h-96 overflow-y-auto", children: [filteredEntries.length === 0 ? ()
                < div : , " className=\"p-8 text-center text-gray-500\">", _jsx(ClipboardDocumentListIcon, { className: "h-12 w-12 mx-auto mb-4 text-gray-300" }), _jsx("p", { children: "No audit entries found matching your criteria." })] });
    ();
    filteredEntries.map((entry) => ()
        < div, key = { entry, : .id }, className = "p-4 hover:bg-gray-50 transition-colors" >
        _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "flex-shrink-0 mt-1", children: getActionTypeIcon(entry.action_type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${getActionTypeColor(entry.action_type)}`, children: ["}", entry.action_type.replace('_', ' ').toUpperCase()] }), _jsx("span", { className: "text-sm text-gray-500", children: formatTimestamp(entry.action_timestamp) })] }), _jsxs("div", { className: "mt-1 flex items-center space-x-4 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(UserIcon, { className: "h-4 w-4" }), _jsx("span", { children: entry.actor_id })] }), _jsx("div", { className: "flex items-center space-x-1", children: _jsxs("span", { children: ["Resource: ", entry.resource_id] }) })] }), entry.comment && ()
                            < p, " className=\"mt-2 text-sm text-gray-700\">", entry.comment] }), ")}", entry.metadata && Object.keys(entry.metadata).length > 0 && ()
                    < div, " className=\"mt-2 text-xs text-gray-500\">", _jsxs("details", { className: "cursor-pointer", children: [_jsxs("summary", { className: "hover:text-gray-700", children: ["Additional metadata (", Object.keys(entry.metadata).length, " items)"] }), _jsx("pre", { className: "mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto", children: JSON.stringify(entry.metadata, null, 2) })] })] }));
}
div >
;
div >
;
div >
;
div >
    { /* Export dialog */};
{
    showExportDialog && ()
        < div;
    className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >
        _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Export Audit History" }), _jsxs("div", { className: "space-y-3", children: [_jsx("button", { onClick: () => handleExport('csv'), className: "w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors", children: "CSV Format" }), _jsx("button", { onClick: () => handleExport('json'), className: "w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors", children: "JSON Format" }), _jsx("button", { onClick: () => handleExport('pdf'), className: "w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors", children: "PDF Report" })] }), _jsx("div", { className: "mt-4 flex justify-end space-x-2", children: _jsx("button", { onClick: () => setShowExportDialog(false), className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", children: "Cancel" }) })] });
    div >
    ;
}
div >
;
;
;
export default AuditTrailViewer;

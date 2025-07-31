import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Epic 16 Ticket Management Dashboard
 *
 * Comprehensive React UI for managing marketplace and community tickets.
 * Provides full CRUD operations, filtering, status management, and real-time updates.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { MarketplaceTicketType, TicketStatus, TicketPriority } from '../../services/Epic16TicketIntegrationService';
dateRange ?  : { start: Date, end: Date };
searchQuery: string;
export const TicketManagementDashboard = ({
    ticketService,
    userId,
    userRole,
    onTicketSelect
});
{
    // State management
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});
    status: [],
        type;
    [],
        priority;
    [],
        category;
    [],
        searchQuery;
    '',
    ;
}
;
const [pagination, setPagination] = useState({});
page: 0,
    limit;
25,
    total;
0,
    hasMore;
false,
;
;
const [_____showCreateModal, setShowCreateModal] = useState(false);
const [metrics, setMetrics] = useState(null);
// Load tickets
const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const filterCriteria = {
            status: filters.status.length > 0 ? filters.status : undefined,
            type: filters.type.length > 0 ? filters.type : undefined,
            priority: filters.priority.length > 0 ? filters.priority : undefined,
            category: filters.category.length > 0 ? filters.category[0] : undefined,
            assignedTo: filters.assignedTo,
            dateRange: filters.dateRange,
            limit: pagination.limit,
            offset: pagination.page * pagination.limit,
        };
        const result = await ticketService.getTickets(filterCriteria);
        setTickets(result.tickets);
        setPagination(prev => ({}), ...prev, total, result.total, hasMore, result.hasMore);
    }
    finally { }
});
try { }
catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load tickets');
}
finally {
    setLoading(false);
}
[ticketService, filters, pagination.page, pagination.limit];
;
// Load metrics
const loadMetrics = useCallback(async () => {
    try {
        const timeRange = {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days,
            end: new Date(),
        };
        const metricsData = await ticketService.getTicketMetrics(timeRange);
        setMetrics(metricsData);
    }
    catch (err) {
        console.error('Failed to load metrics:', err);
    }
    [ticketService];
});
// Effects
useEffect(() => {
    loadTickets();
}, [loadTickets]);
useEffect(() => {
    loadMetrics();
}, [loadMetrics]);
// Filter tickets based on search query
const filteredTickets = useMemo(() => {
    if (!filters.searchQuery)
        return tickets;
    const query = filters.searchQuery.toLowerCase();
    return tickets.filter(ticket => );
    ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.id.toLowerCase().includes(query) ||
        ticket.labels.some(label => label.toLowerCase().includes(query));
});
[tickets, filters.searchQuery];
;
// Handle ticket status update
const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
        await ticketService.updateTicketStatus(ticketId, newStatus, userId);
        await loadTickets();
        if (selectedTicket?.id === ticketId) {
            const updatedTicket = tickets.find(t => t.id === ticketId);
            if (updatedTicket) {
                setSelectedTicket({ ...updatedTicket, status: newStatus });
            }
            try { }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update ticket status');
            }
            ;
            // Handle ticket assignment
            const handleAssignment = async (ticketId, assigneeId) => {
                try {
                    await ticketService.assignTicket(ticketId, assigneeId, userId);
                    await loadTickets();
                }
                catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to assign ticket');
                }
                ;
                // Handle ticket escalation
                const handleEscalation = async (ticketId, reason) => {
                    try {
                        await ticketService.escalateTicket(ticketId, reason, userId);
                        await loadTickets();
                    }
                    catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to escalate ticket');
                    }
                    ;
                    // Reset filters
                    const resetFilters = () => {
                        setFilters({});
                        status: [],
                            type;
                        [],
                            priority;
                        [],
                            category;
                        [],
                            searchQuery;
                        '',
                        ;
                    };
                    setPagination(prev => ({ ...prev, page: 0 }));
                };
                // Render status badge
                const renderStatusBadge = (status) => {
                    const colors = {
                        [TicketStatus.NEW]: 'bg-blue-100 text-blue-800',
                        [TicketStatus.OPEN]: 'bg-green-100 text-green-800',
                        [TicketStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
                        [TicketStatus.PENDING_USER]: 'bg-orange-100 text-orange-800',
                        [TicketStatus.PENDING_REVIEW]: 'bg-purple-100 text-purple-800',
                        [TicketStatus.PENDING_APPROVAL]: 'bg-indigo-100 text-indigo-800',
                        [TicketStatus.RESOLVED]: 'bg-emerald-100 text-emerald-800',
                        [TicketStatus.CLOSED]: 'bg-gray-100 text-gray-800',
                        [TicketStatus.REOPENED]: 'bg-red-100 text-red-800',
                        [TicketStatus.ESCALATED]: 'bg-red-500 text-white',
                        [TicketStatus.ON_HOLD]: 'bg-gray-300 text-gray-700',
                    };
                    return;
                    _jsxs("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`, children: ["}", status.replace('_', ' ').toUpperCase()] });
                };
            };
        }
    }
    finally {
    }
};
;
;
// Render priority badge
const renderPriorityBadge = (priority) => {
    const colors = {
        [TicketPriority.LOW]: 'bg-gray-100 text-gray-800',
        [TicketPriority.MEDIUM]: 'bg-blue-100 text-blue-800',
        [TicketPriority.HIGH]: 'bg-yellow-100 text-yellow-800',
        [TicketPriority.URGENT]: 'bg-orange-100 text-orange-800',
        [TicketPriority.CRITICAL]: 'bg-red-500 text-white',
    };
    return;
    _jsxs("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`, children: ["}", priority.toUpperCase()] });
};
;
;
if (loading && tickets.length === 0) {
    return;
    _jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" }), _jsx("span", { className: "text-gray-600", children: "Loading tickets..." })] }) });
    ;
    return;
    _jsxs("div", { className: "ticket-management-dashboard h-full flex flex-col", children: [_jsx("div", { className: "bg-white border-b border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Ticket Management" }), _jsx("p", { className: "text-sm text-gray-600", children: "Epic 16 Marketplace & Community Support System" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [userRole === 'admin' && ()
                                    < button, "onClick=", () => setShowCreateModal(true), "className=\"px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700\" > Create Ticket"] }), ")}", _jsx("button", { onClick: resetFilters, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200", children: "Clear Filters" })] }) }), error && ()
                < div, " className=\"mt-4 bg-red-50 border border-red-200 rounded-md p-4\">", _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-red-700", children: error }) })] })] });
}
div >
    (_jsxs("div", { className: "flex-1 flex", children: [_jsxs("div", { className: "w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto", children: [metrics && ()
                        < div, " className=\"mb-6\">", _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Metrics (30 days)" }), _jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [_jsxs("div", { className: "bg-white rounded-lg p-3 border", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: metrics.totalTickets }), _jsx("div", { className: "text-xs text-gray-600", children: "Total Tickets" })] }), _jsxs("div", { className: "bg-white rounded-lg p-3 border", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [(100 - metrics.slaBreachRate).toFixed(1), "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "SLA Compliance" })] }), _jsxs("div", { className: "bg-white rounded-lg p-3 border", children: [_jsxs("div", { className: "text-2xl font-bold text-yellow-600", children: [Math.round(metrics.averageResponseTime), "m"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Avg Response" })] }), _jsxs("div", { className: "bg-white rounded-lg p-3 border", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [metrics.customerSatisfaction, "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: "Satisfaction" })] })] })] }), ")}", _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Search" }), _jsx("input", { type: "text", value: filters.searchQuery, onChange: (e) => setFilters({ ...filters, searchQuery: e.target.value }), placeholder: "Search tickets...", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Status" }), _jsxs("div", { className: "space-y-1 max-h-32 overflow-y-auto", children: [Object.values(TicketStatus).map((status) => ()
                                        < label, key = { status }, className = "flex items-center" >
                                        _jsx("input", { type: "checkbox", checked: filters.status.includes(status), onChange: (e) => {
                                                const newStatus = e.target.checked;
                                            } })
                                        ? [...filters.status, status]
                                        : filters.status.filter(s => s !== status)), "; setFilters(", ...(filters, status), ": newStatus }); }} className=\"rounded border-gray-300 text-blue-600 focus:ring-blue-500\" />", _jsx("span", { className: "ml-2 text-sm text-gray-600", children: status.replace('_', ' ') })] }), "))}"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Priority" }), _jsxs("div", { className: "space-y-1", children: [Object.values(TicketPriority).map((priority) => ()
                                < label, key = { priority }, className = "flex items-center" >
                                _jsx("input", { type: "checkbox", checked: filters.priority.includes(priority), onChange: (e) => {
                                        const newPriority = e.target.checked;
                                    } })
                                ? [...filters.priority, priority]
                                : filters.priority.filter(p => p !== priority)), "; setFilters(", ...(filters, priority), ": newPriority }); }} className=\"rounded border-gray-300 text-blue-600 focus:ring-blue-500\" />", _jsx("span", { className: "ml-2 text-sm text-gray-600 capitalize", children: priority })] }), "))}"] })] })
        ,
            _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Type" }), _jsxs("div", { className: "space-y-1 max-h-32 overflow-y-auto", children: [Object.values(MarketplaceTicketType).map((type) => ()
                                < label, key = { type }, className = "flex items-center" >
                                _jsx("input", { type: "checkbox", checked: filters.type.includes(type), onChange: (e) => {
                                        const newType = e.target.checked;
                                    } })
                                ? [...filters.type, type]
                                : filters.type.filter(t => t !== type)), "; setFilters(", ...(filters, type), ": newType }); }} className=\"rounded border-gray-300 text-blue-600 focus:ring-blue-500\" />", _jsx("span", { className: "ml-2 text-sm text-gray-600", children: type.replace('_', ' ') })] }), "))}"] }));
div >
;
div >
;
div >
    { /* Main Content - Ticket List */}
    < div;
className = "flex-1 flex flex-col" >
    { /* Ticket List Header */}
    < div;
className = "bg-white border-b border-gray-200 px-4 py-3" >
    _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Showing ", filteredTickets.length, " of ", pagination.total, " tickets"] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs("select", { value: pagination.limit, onChange: (e) => setPagination({ ...pagination, limit: Number(e.target.value), page: 0 }), className: "px-3 py-1 border border-gray-300 rounded-md text-sm", children: [_jsx("option", { value: 25, children: "25 per page" }), _jsx("option", { value: 50, children: "50 per page" }), _jsx("option", { value: 100, children: "100 per page" })] }) })] });
div >
    { /* Ticket List */}
    < div;
className = "flex-1 overflow-y-auto" >
    { filteredTickets, : .length === 0 ? ()
            < div : , className = "text-center py-12" >
            (_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) })
                ,
                    _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No tickets found" })
                        ,
                            _jsx("p", { className: "mt-1 text-sm text-gray-500", children: filters.status.length || filters.type.length || filters.searchQuery
                                    ? 'Try adjusting your filters.'
                                    : 'Get started by creating your first ticket.' })),
        div } >
;
()
    < div;
className = "divide-y divide-gray-200" >
    { filteredTickets, : .map((ticket) => ()
            < TicketListItem, key = { ticket, : .id }, ticket = { ticket }, onSelect = {}(), {
            onTicketSelect
        }(ticket))
    };
onStatusUpdate = { handleStatusUpdate };
onAssign = { handleAssignment };
onEscalate = { handleEscalation };
currentUserId = { userId };
userRole = { userRole };
selected = { selectedTicket, id } === ticket.id;
renderStatusBadge = { renderStatusBadge };
renderPriorityBadge = { renderPriorityBadge }
    /  >
;
div >
;
div >
    { /* Pagination */};
{
    pagination.total > pagination.limit && ()
        < div;
    className = "bg-white border-t border-gray-200 px-4 py-3" >
        _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { onClick: () => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) })), disabled: pagination.page === 0, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50", children: "Previous" }), _jsxs("span", { className: "text-sm text-gray-700", children: ["Page ", pagination.page + 1, " of ", Math.ceil(pagination.total / pagination.limit)] }), _jsx("button", { onClick: () => setPagination(prev => ({ ...prev, page: prev.page + 1 })), disabled: !pagination.hasMore, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50", children: "Next" })] });
    div >
    ;
}
div >
;
div >
;
div >
;
;
;
{
    const [showActions, setShowActions] = useState(false);
    const canModify = userRole === 'admin' || (userRole === 'agent' && ticket.assignedTo === currentUserId);
    const isOverdue = ticket.sla.responseTime.deadline < new Date() && !ticket.sla.responseTime.actual;
    const isSLAWarning = ticket.sla.responseTime.deadline.getTime() - Date.now() < (ticket.sla.responseTime.warningThreshold * 60 * 1000);
    return;
    _jsxs("div", { className: `relative p-4 hover:bg-gray-50 cursor-pointer ${selected ? 'bg-blue-50 border-l-4 border-blue-500' : ''} ${isOverdue ? 'bg-red-50' : isSLAWarning ? 'bg-yellow-50' : ''}`, onClick: onSelect, children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsxs("span", { className: "text-sm font-medium text-blue-600", children: ["#", ticket.id.split('-').pop()] }), renderStatusBadge(ticket.status), renderPriorityBadge(ticket.priority), isOverdue && ()
                                        < span, " className=\"px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full\"> OVERDUE"] }), ")}", isSLAWarning && !isOverdue && ()
                                < span, " className=\"px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full\"> SLA WARNING"] }), ")}"] }), _jsx("h3", { className: "text-sm font-medium text-gray-900 truncate", children: ticket.title }), _jsx("p", { className: "text-sm text-gray-600 line-clamp-2 mt-1", children: ticket.description }), _jsxs("div", { className: "flex items-center space-x-4 mt-3 text-xs text-gray-500", children: [_jsxs("span", { children: ["Type: ", ticket.type.replace('_', ' ')] }), ticket.assignedTo && _jsxs("span", { children: ["Assigned: ", ticket.assignedTo] }), _jsxs("span", { children: ["Created: ", ticket.createdAt.toLocaleDateString()] }), ticket.comments.length > 0 && ()
                        < span > { ticket, : .comments.length }, " comment", ticket.comments.length !== 1 ? 's' : ''] }), ")}"] });
    div >
        { canModify } && ()
        < div;
    className = "flex items-center space-x-1" >
        _jsx("button", { onClick: (e) => {
                e.stopPropagation();
                setShowActions(!showActions);
            }, className: "p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100", children: _jsx("svg", { className: "h-4 w-4", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" }) }) });
    {
        showActions && ()
            < div;
        className = "absolute right-4 top-12 z-10 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-32" >
            (_jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    onStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS);
                    setShowActions(false);
                }, className: "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100", children: "Start Progress" })
                ,
                    _jsx("button", { onClick: (e) => {
                            e.stopPropagation();
                            onStatusUpdate(ticket.id, TicketStatus.RESOLVED);
                            setShowActions(false);
                        }, className: "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100", children: "Mark Resolved" })
                        ,
                            _jsx("button", { onClick: (e) => {
                                    e.stopPropagation();
                                    onEscalate(ticket.id, 'Manual escalation');
                                    setShowActions(false);
                                }, className: "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100", children: "Escalate" }));
        div >
        ;
    }
    div >
    ;
}
div >
;
div >
;
;
;
export default TicketManagementDashboard;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4.2 - Approval Dashboard Component
// Comprehensive dashboard for managing approval requests and reviews
import { useState, useEffect } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, UserGroupIcon, DocumentTextIcon, MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon, CalendarIcon, ArrowPathIcon, BellIcon, EyeIcon } from '@heroicons/react/24/outline';
export const ApprovalDashboard = ({ workspaceId, currentUserId, mode = 'reviewer' }) => {
    const [approvalRequests, setApprovalRequests] = useState([]);
    const [reviewerAssignments, setReviewerAssignments] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [expandedRequests, setExpandedRequests] = useState(new Set());
    const [filters, setFilters] = useState({
        status: '',
        urgency: '',
        overdue: false,
        search: ''
    });
    const [sortBy, setSortBy] = useState('requested_at');
    const [sortDirection, setSortDirection] = useState('desc');
    // Load approval requests
    useEffect(() => {
        fetchApprovalRequests();
    }, [workspaceId, currentUserId, mode, filters, activeTab]);
    const fetchApprovalRequests = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (mode === 'reviewer') {
                queryParams.append('reviewer_id', currentUserId);
            }
            else if (mode === 'requester') {
                queryParams.append('requester_id', currentUserId);
            }
            if (activeTab === 'pending') {
                queryParams.append('status', 'pending,in_review');
            }
            else if (activeTab === 'completed') {
                queryParams.append('status', 'approved,rejected,cancelled,expired');
            }
            if (filters.status)
                queryParams.append('status', filters.status);
            if (filters.urgency)
                queryParams.append('urgency', filters.urgency);
            if (filters.overdue)
                queryParams.append('overdue', 'true');
            const response = await fetch(`/api/approval/requests/${workspaceId}?${queryParams}`);
            if (!response.ok) {
                throw new Error('Failed to fetch approval requests');
            }
            const requests = await response.json();
            setApprovalRequests(requests);
            // Load reviewer assignments for each request
            const assignments = {};
            for (const request of requests) {
                const reviewersResponse = await fetch(`/api/approval/requests/${request.id}/reviewers`);
                if (reviewersResponse.ok) {
                    assignments[request.id] = await reviewersResponse.json();
                }
            }
            setReviewerAssignments(assignments);
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch approval requests');
        }
        finally {
            setLoading(false);
        }
    };
    const handleReviewSubmission = async (requestId, decision, comment) => {
        try {
            const response = await fetch(`/api/approval/requests/${requestId}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': currentUserId
                },
                body: JSON.stringify({
                    decision,
                    comment
                })
            });
            if (!response.ok) {
                throw new Error('Failed to submit review');
            }
            // Refresh the data
            await fetchApprovalRequests();
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to submit review');
        }
    };
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_review': return 'bg-blue-100 text-blue-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            case 'expired': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return _jsx(ClockIcon, { className: "h-4 w-4" });
            case 'in_review': return _jsx(EyeIcon, { className: "h-4 w-4" });
            case 'approved': return _jsx(CheckCircleIcon, { className: "h-4 w-4" });
            case 'rejected': return _jsx(XCircleIcon, { className: "h-4 w-4" });
            case 'cancelled': return _jsx(XCircleIcon, { className: "h-4 w-4" });
            case 'expired': return _jsx(ExclamationTriangleIcon, { className: "h-4 w-4" });
            default: return _jsx(ClockIcon, { className: "h-4 w-4" });
        }
    };
    const isOverdue = (request) => {
        return request.due_date && new Date(request.due_date) < new Date() &&
            ['pending', 'in_review'].includes(request.status);
    };
    const canReview = (request) => {
        const assignment = reviewerAssignments[request.id]?.find(a => a.reviewer_id === currentUserId);
        return assignment && assignment.status === 'pending' &&
            ['pending', 'in_review'].includes(request.status);
    };
    const toggleRequestExpansion = (requestId) => {
        const newExpanded = new Set(expandedRequests);
        if (newExpanded.has(requestId)) {
            newExpanded.delete(requestId);
        }
        else {
            newExpanded.add(requestId);
        }
        setExpandedRequests(newExpanded);
    };
    const filteredAndSortedRequests = approvalRequests
        .filter(request => {
        if (filters.search && !request.title.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }
        return true;
    })
        .sort((a, b) => {
        const multiplier = sortDirection === 'asc' ? 1 : -1;
        switch (sortBy) {
            case 'requested_at':
                return (new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime()) * multiplier;
            case 'due_date':
                const aDate = a.due_date ? new Date(a.due_date).getTime() : 0;
                const bDate = b.due_date ? new Date(b.due_date).getTime() : 0;
                return (aDate - bDate) * multiplier;
            case 'urgency':
                const urgencyOrder = { low: 1, medium: 2, high: 3, critical: 4 };
                return (urgencyOrder[a.urgency] - urgencyOrder[b.urgency]) * multiplier;
            case 'approval_percentage':
                return (a.approval_percentage - b.approval_percentage) * multiplier;
            default:
                return 0;
        }
    });
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }));
    }
    if (error) {
        return (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx(XCircleIcon, { className: "h-5 w-5 text-red-400" }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error" }), _jsx("div", { className: "mt-2 text-sm text-red-700", children: error })] })] }) }));
    }
    return (_jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsxs("div", { className: "border-b border-gray-200", children: [_jsx("div", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-medium text-gray-900", children: mode === 'reviewer' ? 'Review Dashboard' :
                                                mode === 'requester' ? 'My Requests' : 'Approval Management' }), _jsx("p", { className: "mt-1 text-sm text-gray-600", children: mode === 'reviewer' ? 'Approval requests requiring your review' :
                                                mode === 'requester' ? 'Your approval requests and their status' :
                                                    'Manage all approval requests in this workspace' })] }), _jsx("div", { className: "flex items-center space-x-3", children: _jsxs("button", { onClick: fetchApprovalRequests, className: "inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50", children: [_jsx(ArrowPathIcon, { className: "h-4 w-4 mr-2" }), "Refresh"] }) })] }) }), _jsx("div", { className: "flex space-x-8 px-6", children: [
                            { id: 'pending', label: 'Pending', count: approvalRequests.filter(r => ['pending', 'in_review'].includes(r.status)).length },
                            { id: 'completed', label: 'Completed', count: approvalRequests.filter(r => ['approved', 'rejected', 'cancelled', 'expired'].includes(r.status)).length },
                            { id: 'all', label: 'All', count: approvalRequests.length }
                        ].map(tab => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [tab.label, _jsx("span", { className: `ml-2 px-2 py-1 rounded-full text-xs ${activeTab === tab.id
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-gray-100 text-gray-600'}`, children: tab.count })] }, tab.id))) })] }), _jsx("div", { className: "border-b border-gray-200 p-4", children: _jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(MagnifyingGlassIcon, { className: "h-4 w-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search requests...", value: filters.search, onChange: (e) => setFilters(prev => ({ ...prev, search: e.target.value })), className: "border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("select", { value: filters.urgency, onChange: (e) => setFilters(prev => ({ ...prev, urgency: e.target.value })), className: "border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "All Urgency" }), _jsx("option", { value: "critical", children: "Critical" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "low", children: "Low" })] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: filters.overdue, onChange: (e) => setFilters(prev => ({ ...prev, overdue: e.target.checked })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "Overdue only" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-700", children: "Sort by:" }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "requested_at", children: "Requested Date" }), _jsx("option", { value: "due_date", children: "Due Date" }), _jsx("option", { value: "urgency", children: "Urgency" }), _jsx("option", { value: "approval_percentage", children: "Progress" })] }), _jsx("button", { onClick: () => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'), className: "p-1 rounded hover:bg-gray-100", children: sortDirection === 'asc' ? _jsx(ChevronUpIcon, { className: "h-4 w-4" }) : _jsx(ChevronDownIcon, { className: "h-4 w-4" }) })] })] }) }), _jsx("div", { className: "divide-y divide-gray-200", children: filteredAndSortedRequests.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(DocumentTextIcon, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No approval requests" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: activeTab === 'pending' ? 'No pending approvals at this time.' :
                                activeTab === 'completed' ? 'No completed approvals found.' :
                                    'No approval requests match your current filters.' })] })) : (filteredAndSortedRequests.map((request) => (_jsxs("div", { className: "p-6 hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: () => toggleRequestExpansion(request.id), className: "text-gray-400 hover:text-gray-600", children: expandedRequests.has(request.id) ? (_jsx(ChevronDownIcon, { className: "h-4 w-4" })) : (_jsx(ChevronUpIcon, { className: "h-4 w-4" })) }), _jsx("h3", { className: "text-lg font-medium text-gray-900", children: request.title }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`, children: [getStatusIcon(request.status), _jsx("span", { className: "ml-1", children: request.status })] }), _jsx("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`, children: request.urgency }), isOverdue(request) && (_jsxs("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800", children: [_jsx(ExclamationTriangleIcon, { className: "h-3 w-3 mr-1" }), "Overdue"] })), request.escalated_at && (_jsxs("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800", children: [_jsx(BellIcon, { className: "h-3 w-3 mr-1" }), "Escalated"] }))] })] }), _jsxs("div", { className: "mt-2 flex items-center space-x-6 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(CalendarIcon, { className: "h-4 w-4" }), _jsxs("span", { children: ["Requested ", new Date(request.requested_at).toLocaleDateString()] })] }), request.due_date && (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(ClockIcon, { className: "h-4 w-4" }), _jsxs("span", { children: ["Due ", new Date(request.due_date).toLocaleDateString()] })] })), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(UserGroupIcon, { className: "h-4 w-4" }), _jsxs("span", { children: ["By ", request.requester_id] })] })] }), _jsxs("div", { className: "mt-3", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("span", { className: "text-gray-600", children: ["Approval Progress: ", request.current_approvals, " of ", request.required_approvals] }), _jsxs("span", { className: "text-gray-600", children: [Math.round(request.approval_percentage), "%"] })] }), _jsx("div", { className: "mt-1 w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${request.approval_percentage}%` } }) })] })] }), _jsxs("div", { className: "flex items-center space-x-2 ml-4", children: [canReview(request) && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("button", { onClick: () => handleReviewSubmission(request.id, 'approve'), className: "px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700", children: [_jsx(CheckCircleIcon, { className: "h-4 w-4 mr-1 inline" }), "Approve"] }), _jsxs("button", { onClick: () => handleReviewSubmission(request.id, 'reject'), className: "px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700", children: [_jsx(XCircleIcon, { className: "h-4 w-4 mr-1 inline" }), "Reject"] })] })), _jsxs("button", { onClick: () => setSelectedRequest(request), className: "px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700", children: [_jsx(EyeIcon, { className: "h-4 w-4 mr-1 inline" }), "View Details"] })] })] }), expandedRequests.has(request.id) && (_jsxs("div", { className: "mt-4 space-y-4", children: [request.description && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Description" }), _jsx("p", { className: "text-sm text-gray-700", children: request.description })] })), request.business_justification && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Business Justification" }), _jsx("p", { className: "text-sm text-gray-700", children: request.business_justification })] })), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Reviewers" }), _jsx("div", { className: "space-y-2", children: reviewerAssignments[request.id]?.map((assignment) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-sm font-medium", children: assignment.reviewer_id }), _jsx("span", { className: `px-2 py-1 rounded text-xs ${getStatusColor(assignment.status)}`, children: assignment.status }), _jsx("span", { className: `px-2 py-1 rounded text-xs ${assignment.assignment_type === 'escalated' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`, children: assignment.assignment_type })] }), assignment.reviewed_at && (_jsxs("span", { className: "text-xs text-gray-500", children: ["Reviewed ", new Date(assignment.reviewed_at).toLocaleDateString()] }))] }, assignment.id))) })] })] }))] }, request.id)))) })] }));
};

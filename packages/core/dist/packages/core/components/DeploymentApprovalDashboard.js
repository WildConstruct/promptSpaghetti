import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Deployment Approval Dashboard
 * Extension of the approval dashboard specifically for deployment approvals
 */
import { useState, useEffect } from 'react';
import { RocketLaunchIcon, ShieldCheckIcon, BoltIcon, BuildingOfficeIcon, CodeBracketIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, EyeIcon, ComputerDesktopIcon, ServerStackIcon, GlobeAltIcon, ChevronRightIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
export const DeploymentApprovalDashboard = ({ workspaceId, currentUserId, mode = 'reviewer', environment }) => {
    const [deploymentRequests, setDeploymentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [filters, setFilters] = useState({
        environment: environment || '',
        status: '',
        urgency: '',
        auto_approved: false,
        search: ''
    });
    useEffect(() => {
        fetchDeploymentRequests();
        // Set up polling for real-time updates
        const interval = setInterval(fetchDeploymentRequests, 30000);
        return () => clearInterval(interval);
    }, [workspaceId, currentUserId, mode, filters, activeTab]);
    const fetchDeploymentRequests = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            queryParams.append('workspace_id', workspaceId);
            queryParams.append('deployment_type', 'true');
            if (filters.environment)
                queryParams.append('environment', filters.environment);
            if (filters.status)
                queryParams.append('status', filters.status);
            if (filters.urgency)
                queryParams.append('urgency', filters.urgency);
            if (filters.auto_approved)
                queryParams.append('auto_approved', 'true');
            if (filters.search)
                queryParams.append('search', filters.search);
            const response = await fetch(`/api/approval/deployment-requests?${queryParams}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch deployment requests');
            }
            setDeploymentRequests(data.requests || []);
            setError(null);
        }
        catch (err) {
            console.error('Error fetching deployment requests:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
        finally {
            setLoading(false);
        }
    };
    const _____getEnvironmentIcon = (env) => {
        switch (env) {
            case 'production': return _jsx(ServerStackIcon, { className: "h-4 w-4 text-red-500" });
            case 'staging': return _jsx(ComputerDesktopIcon, { className: "h-4 w-4 text-yellow-500" });
            case 'preview': return _jsx(EyeIcon, { className: "h-4 w-4 text-blue-500" });
            case 'development': return _jsx(CodeBracketIcon, { className: "h-4 w-4 text-green-500" });
            default: return _jsx(GlobeAltIcon, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const _____getEnvironmentBadgeColor = (env) => {
        switch (env) {
            case 'production': return 'bg-red-100 text-red-800 border-red-200';
            case 'staging': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'preview': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'development': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const _____getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
            case 'auto_approved':
                return _jsx(CheckCircleIcon, { className: "h-5 w-5 text-green-500" });
            case 'rejected':
                return _jsx(XCircleIcon, { className: "h-5 w-5 text-red-500" });
            case 'pending':
            case 'in_review':
                return _jsx(ClockIcon, { className: "h-5 w-5 text-yellow-500" });
            default:
                return _jsx(ExclamationTriangleIcon, { className: "h-5 w-5 text-gray-500" });
        }
    };
    const _____getCriterionIcon = (type) => {
        switch (type) {
            case 'security-review': return _jsx(ShieldCheckIcon, { className: "h-4 w-4 text-blue-500" });
            case 'performance-impact': return _jsx(BoltIcon, { className: "h-4 w-4 text-yellow-500" });
            case 'business-approval': return _jsx(BuildingOfficeIcon, { className: "h-4 w-4 text-purple-500" });
            default: return _jsx(CheckCircleIcon, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const filteredRequests = deploymentRequests.filter(request => {
        if (activeTab === 'pending' && !['pending', 'in_review'].includes(request.status))
            return false;
        if (activeTab === 'approved' && !['approved', 'auto_approved'].includes(request.status))
            return false;
        if (activeTab === 'rejected' && request.status !== 'rejected')
            return false;
        if (filters.search && !request.title.toLowerCase().includes(filters.search.toLowerCase()) &&
            !request.deployment_id.includes(filters.search))
            return false;
        return true;
    });
    if (loading && deploymentRequests.length === 0) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center space-x-2 text-gray-600", children: [_jsx(ArrowTopRightOnSquareIcon, { className: "h-5 w-5 animate-spin" }), _jsx("span", { children: "Loading deployment approvals..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(XCircleIcon, { className: "h-5 w-5 text-red-500 mr-2" }), _jsxs("span", { className: "text-red-700", children: ["Error loading deployment approvals: ", error] })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(RocketLaunchIcon, { className: "h-6 w-6 text-blue-600" }), _jsx("h2", { className: "text-2xl font-semibold text-gray-900", children: "Deployment Approvals" }), loading && (_jsx(ArrowTopRightOnSquareIcon, { className: "h-4 w-4 text-gray-400 animate-spin" }))] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("span", { className: "text-sm text-gray-600", children: [filteredRequests.length, " requests"] }), _jsx("button", { onClick: fetchDeploymentRequests, className: "p-2 hover:bg-gray-100 rounded-full transition-colors", title: "Refresh", children: _jsx(ArrowTopRightOnSquareIcon, { className: "h-4 w-4 text-gray-600" }) })] })] }), _jsx("div", { className: "border-b border-gray-200", children: _jsx("nav", { className: "-mb-px flex space-x-8", children: [
                        { id: 'pending', label: 'Pending', icon: ClockIcon },
                        { id: 'approved', label: 'Approved', icon: CheckCircleIcon },
                        { id: 'rejected', label: 'Rejected', icon: XCircleIcon },
                        { id: 'all', label: 'All', icon: EyeIcon }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const count = deploymentRequests.filter(req => {
                            if (tab.id === 'pending')
                                return ['pending', 'in_review'].includes(req.status);
                            if (tab.id === 'approved')
                                return ['approved', 'auto_approved'].includes(req.status);
                            if (tab.id === 'rejected')
                                return req.status === 'rejected';
                            return true;
                        }).length;
                        return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 transition-colors ${isActive
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "h-4 w-4" }), _jsx("span", { children: tab.label }), _jsx("span", { className: `ml-2 py-0.5 px-2 rounded-full text-xs ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`, children: count })] }, tab.id));
                    }) }) }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Environment" }), _jsxs("select", { value: filters.environment, onChange: (e) => setFilters(prev => ({ ...prev, environment: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "All Environments" }), _jsx("option", { value: "production", children: "Production" }), _jsx("option", { value: "staging", children: "Staging" }), _jsx("option", { value: "preview", children: "Preview" }), _jsx("option", { value: "development", children: "Development" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: filters.status, onChange: (e) => setFilters(prev => ({ ...prev, status: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "in_review", children: "In Review" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "auto_approved", children: "Auto Approved" }), _jsx("option", { value: "rejected", children: "Rejected" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Urgency" }), _jsxs("select", { value: filters.urgency, onChange: (e) => setFilters(prev => ({ ...prev, urgency: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "", children: "All Urgencies" }), _jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "critical", children: "Critical" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search" }), _jsx("input", { type: "text", placeholder: "Search deployments...", value: filters.search, onChange: (e) => setFilters(prev => ({ ...prev, search: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })] }) }), _jsx("div", { className: "space-y-4", children: filteredRequests.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(RocketLaunchIcon, { className: "h-12 w-12 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No deployment requests" }), _jsx("p", { className: "text-gray-600", children: activeTab === 'pending'
                                ? 'No pending deployments require approval at this time.'
                                : `No ${activeTab} deployment requests found.` })] })) : (filteredRequests.map(request => (_jsx(DeploymentRequestCard, { request: request, onSelect: setSelectedRequest, currentUserId: currentUserId }, request.id)))) }), selectedRequest && (_jsx(DeploymentRequestDetail, { request: selectedRequest, onClose: () => setSelectedRequest(null), currentUserId: currentUserId, onUpdate: fetchDeploymentRequests }))] }));
};
// Component for individual deployment request cards
const DeploymentRequestCard = ({ request, onSelect, currentUserId }) => {
    const getEnvironmentIcon = (env) => {
        switch (env) {
            case 'production': return _jsx(ServerStackIcon, { className: "h-4 w-4 text-red-500" });
            case 'staging': return _jsx(ComputerDesktopIcon, { className: "h-4 w-4 text-yellow-500" });
            case 'preview': return _jsx(EyeIcon, { className: "h-4 w-4 text-blue-500" });
            case 'development': return _jsx(CodeBracketIcon, { className: "h-4 w-4 text-green-500" });
            default: return _jsx(GlobeAltIcon, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const getEnvironmentBadgeColor = (env) => {
        switch (env) {
            case 'production': return 'bg-red-100 text-red-800 border-red-200';
            case 'staging': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'preview': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'development': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
            case 'auto_approved':
                return _jsx(CheckCircleIcon, { className: "h-5 w-5 text-green-500" });
            case 'rejected':
                return _jsx(XCircleIcon, { className: "h-5 w-5 text-red-500" });
            case 'pending':
            case 'in_review':
                return _jsx(ClockIcon, { className: "h-5 w-5 text-yellow-500" });
            default:
                return _jsx(ExclamationTriangleIcon, { className: "h-5 w-5 text-gray-500" });
        }
    };
    const getCriterionIcon = (type) => {
        switch (type) {
            case 'security-review': return _jsx(ShieldCheckIcon, { className: "h-4 w-4 text-blue-500" });
            case 'performance-impact': return _jsx(BoltIcon, { className: "h-4 w-4 text-yellow-500" });
            case 'business-approval': return _jsx(BuildingOfficeIcon, { className: "h-4 w-4 text-purple-500" });
            default: return _jsx(CheckCircleIcon, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const urgencyColors = {
        low: 'bg-blue-100 text-blue-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800'
    };
    return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors cursor-pointer", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [getStatusIcon(request.status), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: request.title }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Deployment ", request.deployment_id.substring(0, 8)] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full border ${urgencyColors[request.urgency]}`, children: request.urgency.toUpperCase() }), _jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full border ${getEnvironmentBadgeColor(request.environment)}`, children: _jsxs("div", { className: "flex items-center space-x-1", children: [getEnvironmentIcon(request.environment), _jsx("span", { children: request.environment.toUpperCase() })] }) }), request.auto_approved && (_jsx("span", { className: "px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200", children: "AUTO" }))] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-gray-700 mb-2", children: request.description }), _jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-600", children: [_jsxs("span", { children: ["By ", request.requested_by] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: new Date(request.requested_at).toLocaleString() }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [request.metadata.changed_files, " files, ", request.metadata.lines_changed, " lines"] })] })] }), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Approval Progress" }), _jsxs("span", { className: "text-sm text-gray-600", children: [request.current_approvals, "/", request.required_approvals] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all", style: {
                                width: `${Math.min(100, (request.current_approvals / request.required_approvals) * 100)}%`
                            } }) })] }), _jsx("div", { className: "mb-4", children: _jsx("div", { className: "flex flex-wrap gap-2", children: request.criteria.map(criterion => (_jsxs("div", { className: `flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${criterion.status === 'approved'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : criterion.status === 'rejected'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'}`, children: [getCriterionIcon(criterion.type), _jsx("span", { children: criterion.type.replace('-', ' ').toUpperCase() }), criterion.status === 'approved' && _jsx(CheckCircleIcon, { className: "h-3 w-3" }), criterion.status === 'rejected' && _jsx(XCircleIcon, { className: "h-3 w-3" })] }, criterion.type))) }) }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-600 border-t pt-3", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("span", { children: ["Coverage: ", request.metadata.test_coverage, "%"] }), _jsxs("span", { children: ["Security: ", request.metadata.security_scan_status] }), request.metadata.breaking_changes && (_jsx("span", { className: "text-orange-600", children: "\u26A0 Breaking Changes" }))] }), _jsxs("button", { onClick: () => onSelect(request), className: "flex items-center space-x-1 text-blue-600 hover:text-blue-800", children: [_jsx("span", { children: "View Details" }), _jsx(ChevronRightIcon, { className: "h-3 w-3" })] })] })] }));
};
// Detailed view component (placeholder - would be expanded with full details)
const DeploymentRequestDetail = ({ request, onClose, currentUserId, onUpdate }) => {
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Deployment Details" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(XCircleIcon, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "p-6", children: [_jsx("p", { className: "text-gray-600", children: "Detailed deployment approval interface would be implemented here with:" }), _jsxs("ul", { className: "mt-4 list-disc list-inside space-y-2 text-gray-600", children: [_jsx("li", { children: "Full deployment metadata and change details" }), _jsx("li", { children: "Approval workflow progress and history" }), _jsx("li", { children: "Individual reviewer assignments and status" }), _jsx("li", { children: "Validation step results and automated checks" }), _jsx("li", { children: "Comments and discussion thread" }), _jsx("li", { children: "Action buttons for approve/reject/escalate" }), _jsx("li", { children: "Real-time updates and notifications" })] })] })] }) }));
};
export default DeploymentApprovalDashboard;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4 - Workflow State Manager Component
// Main UI component for managing workflow states and transitions
import { useState, useEffect, useCallback } from 'react';
import { CheckCircleIcon, ClockIcon, XCircleIcon, DocumentTextIcon, EyeIcon, GlobeAltIcon, ArchiveBoxIcon, PlusIcon, PencilIcon, ChevronDownIcon, ChevronRightIcon, LockClosedIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useWorkflowStore } from '../stores/workflowStore';
export const WorkflowStateManager = ({ workspaceId, resourceId, currentUserId, onStateChange, onLockAcquired, onLockReleased }) => {
    const { states, transitions, approvals, locks, statistics, loading, error, fetchStates, fetchTransitions, fetchApprovals, fetchLocks, fetchStatistics, transitionResourceState, approveWorkflow, rejectWorkflow, acquireLock, releaseLock, createState, updateState, deleteState, createTransition, deleteTransition } = useWorkflowStore();
    const [activeTab, setActiveTab] = useState('states');
    const [showCreateState, setShowCreateState] = useState(false);
    const [showCreateTransition, setShowCreateTransition] = useState(false);
    const [selectedState, setSelectedState] = useState(null);
    const [expandedStates, setExpandedStates] = useState(new Set());
    // Load initial data
    useEffect(() => {
        fetchStates(workspaceId);
        fetchTransitions(workspaceId);
        fetchApprovals(workspaceId);
        fetchLocks(workspaceId);
        fetchStatistics(workspaceId);
    }, [workspaceId]);
    // Get current resource state
    const currentResourceState = resourceId
        ? states.find(state => state.id === resourceId) // This would need to be fetched from resource data
        : null;
    // Get available transitions for current state
    const availableTransitions = currentResourceState
        ? transitions.filter(t => t.from_state_id === currentResourceState.id)
        : [];
    // Get resource locks
    const resourceLocks = resourceId
        ? locks.filter(lock => lock.resource_id === resourceId)
        : [];
    // Get pending approvals for current user
    const pendingApprovals = approvals.filter(approval => approval.status === 'pending' &&
        (approval.requester_id === currentUserId || approval.approved_by === currentUserId));
    const handleStateTransition = useCallback(async (toStateId, comment) => {
        if (!resourceId)
            return;
        try {
            const result = await transitionResourceState(resourceId, toStateId, currentUserId, {
                comment,
                force: false
            });
            if (result.success) {
                if (result.approval_required) {
                    // Show approval request confirmation
                    alert(`Approval request submitted for state transition.`);
                }
                else {
                    onStateChange?.(result.new_state_id);
                }
            }
        }
        catch (error) {
            console.error('Failed to transition state:', error);
        }
    }, [resourceId, currentUserId, transitionResourceState, onStateChange]);
    const handleApprovalAction = useCallback(async (approvalId, action, comment) => {
        try {
            if (action === 'approve') {
                await approveWorkflow(approvalId, currentUserId, comment);
            }
            else {
                await rejectWorkflow(approvalId, currentUserId, comment || 'Rejected');
            }
            // Refresh data
            fetchApprovals(workspaceId);
            fetchStates(workspaceId);
        }
        catch (error) {
            console.error(`Failed to ${action} workflow:`, error);
        }
    }, [currentUserId, approveWorkflow, rejectWorkflow, fetchApprovals, fetchStates, workspaceId]);
    const handleLockAction = useCallback(async (action, lockId, lockType) => {
        if (!resourceId)
            return;
        try {
            if (action === 'acquire') {
                const lock = await acquireLock(resourceId, currentUserId, lockType || 'edit', {
                    reason: 'Manual lock acquisition'
                });
                onLockAcquired?.(lock.id);
            }
            else if (lockId) {
                await releaseLock(lockId, currentUserId);
                onLockReleased?.(lockId);
            }
            // Refresh locks
            fetchLocks(workspaceId);
        }
        catch (error) {
            console.error(`Failed to ${action} lock:`, error);
        }
    }, [resourceId, currentUserId, acquireLock, releaseLock, onLockAcquired, onLockReleased, fetchLocks, workspaceId]);
    const toggleStateExpansion = (stateId) => {
        const newExpanded = new Set(expandedStates);
        if (newExpanded.has(stateId)) {
            newExpanded.delete(stateId);
        }
        else {
            newExpanded.add(stateId);
        }
        setExpandedStates(newExpanded);
    };
    const getStateIcon = (state) => {
        switch (state.icon) {
            case 'CheckCircleIcon': return _jsx(CheckCircleIcon, { className: "h-4 w-4" });
            case 'EyeIcon': return _jsx(EyeIcon, { className: "h-4 w-4" });
            case 'GlobeAltIcon': return _jsx(GlobeAltIcon, { className: "h-4 w-4" });
            case 'ArchiveBoxIcon': return _jsx(ArchiveBoxIcon, { className: "h-4 w-4" });
            case 'DocumentTextIcon':
            default: return _jsx(DocumentTextIcon, { className: "h-4 w-4" });
        }
    };
    const getStateTransitions = (stateId) => {
        return transitions.filter(t => t.from_state_id === stateId);
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }));
    }
    if (error) {
        return (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx(XCircleIcon, { className: "h-5 w-5 text-red-400" }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error loading workflow data" }), _jsx("div", { className: "mt-2 text-sm text-red-700", children: error })] })] }) }));
    }
    return (_jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsxs("div", { className: "border-b border-gray-200", children: [_jsx("div", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-medium text-gray-900", children: "Workflow Management" }), _jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Manage workflow states, approvals, and transitions" })] }), resourceId && currentResourceState && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium", style: { backgroundColor: `${currentResourceState.color}20`, color: currentResourceState.color }, children: [getStateIcon(currentResourceState), _jsx("span", { children: currentResourceState.name })] }), resourceLocks.length > 0 && (_jsxs("div", { className: "flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs", children: [_jsx(LockClosedIcon, { className: "h-3 w-3" }), _jsxs("span", { children: [resourceLocks.length, " lock(s)"] })] }))] }))] }) }), _jsx("div", { className: "flex space-x-8 px-6", children: [
                            { id: 'states', label: 'States', count: states.length },
                            { id: 'approvals', label: 'Approvals', count: pendingApprovals.length },
                            { id: 'locks', label: 'Locks', count: resourceLocks.length },
                            { id: 'statistics', label: 'Statistics', count: null }
                        ].map(tab => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [tab.label, tab.count !== null && (_jsx("span", { className: `ml-2 px-2 py-1 rounded-full text-xs ${activeTab === tab.id
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-gray-100 text-gray-600'}`, children: tab.count }))] }, tab.id))) })] }), _jsxs("div", { className: "p-6", children: [activeTab === 'states' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Workflow States" }), _jsxs("button", { onClick: () => setShowCreateState(true), className: "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700", children: [_jsx(PlusIcon, { className: "h-4 w-4 mr-2" }), "Add State"] })] }), _jsx("div", { className: "space-y-3", children: states.map(state => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: () => toggleStateExpansion(state.id), className: "text-gray-400 hover:text-gray-600", children: expandedStates.has(state.id) ? (_jsx(ChevronDownIcon, { className: "h-4 w-4" })) : (_jsx(ChevronRightIcon, { className: "h-4 w-4" })) }), _jsxs("div", { className: "flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium", style: { backgroundColor: `${state.color}20`, color: state.color }, children: [getStateIcon(state), _jsx("span", { children: state.name })] }), state.is_initial && (_jsx("span", { className: "px-2 py-1 bg-green-100 text-green-800 text-xs rounded", children: "Initial" })), state.is_final && (_jsx("span", { className: "px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded", children: "Final" })), state.is_locked && (_jsx("span", { className: "px-2 py-1 bg-red-100 text-red-800 text-xs rounded", children: "Locked" }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [resourceId && currentResourceState?.id === state.id && (_jsx("div", { className: "flex items-center space-x-2", children: availableTransitions.map(transition => (_jsxs("button", { onClick: () => handleStateTransition(transition.to_state_id), className: "px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200", disabled: transition.requires_approval, children: [transition.name, transition.requires_approval && _jsx("span", { className: "ml-1", children: "*" })] }, transition.id))) })), _jsx("button", { onClick: () => setSelectedState(state), className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx(PencilIcon, { className: "h-4 w-4" }) })] })] }), state.description && (_jsx("p", { className: "mt-2 text-sm text-gray-600", children: state.description })), expandedStates.has(state.id) && (_jsx("div", { className: "mt-4 space-y-3", children: _jsxs("div", { className: "border-t pt-3", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Available Transitions" }), _jsxs("div", { className: "space-y-2", children: [getStateTransitions(state.id).map(transition => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm font-medium", children: transition.name }), transition.requires_approval && (_jsx("span", { className: "px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded", children: "Requires Approval" }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-sm text-gray-600", children: ["\u2192 ", states.find(s => s.id === transition.to_state_id)?.name] }), resourceId && currentResourceState?.id === state.id && (_jsx("button", { onClick: () => handleStateTransition(transition.to_state_id), className: "px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700", children: "Transition" }))] })] }, transition.id))), getStateTransitions(state.id).length === 0 && (_jsx("p", { className: "text-sm text-gray-500 italic", children: "No transitions available" }))] })] }) }))] }, state.id))) })] })), activeTab === 'approvals' && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Pending Approvals" }), pendingApprovals.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(ClipboardDocumentListIcon, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No pending approvals" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "All workflow approvals are up to date." })] })) : (_jsx("div", { className: "space-y-3", children: pendingApprovals.map(approval => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(ClockIcon, { className: "h-4 w-4 text-yellow-500" }), _jsx("span", { className: "text-sm font-medium", children: "Approval Required" })] }), _jsx("span", { className: `px-2 py-1 rounded text-xs ${approval.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                                approval.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'}`, children: approval.priority })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => handleApprovalAction(approval.id, 'approve'), className: "px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700", children: "Approve" }), _jsx("button", { onClick: () => handleApprovalAction(approval.id, 'reject'), className: "px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700", children: "Reject" })] })] }), _jsxs("div", { className: "mt-2 text-sm text-gray-600", children: [_jsxs("p", { children: ["Requested by: ", approval.requester_id] }), _jsxs("p", { children: ["Resource: ", approval.resource_id] }), approval.due_date && (_jsxs("p", { children: ["Due: ", new Date(approval.due_date).toLocaleDateString()] }))] })] }, approval.id))) }))] })), activeTab === 'locks' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Resource Locks" }), resourceId && (_jsxs("button", { onClick: () => handleLockAction('acquire'), className: "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700", children: [_jsx(LockClosedIcon, { className: "h-4 w-4 mr-2" }), "Acquire Lock"] }))] }), resourceLocks.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(LockClosedIcon, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No active locks" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "This resource is not currently locked." })] })) : (_jsx("div", { className: "space-y-3", children: resourceLocks.map(lock => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(LockClosedIcon, { className: "h-4 w-4 text-yellow-500" }), _jsxs("div", { children: [_jsxs("span", { className: "text-sm font-medium", children: [lock.lock_type, " Lock"] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Locked by ", lock.locked_by, " on ", new Date(lock.locked_at).toLocaleString()] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [lock.expires_at && (_jsxs("span", { className: "text-xs text-gray-500", children: ["Expires: ", new Date(lock.expires_at).toLocaleString()] })), lock.locked_by === currentUserId && (_jsx("button", { onClick: () => handleLockAction('release', lock.id), className: "px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700", children: "Release" }))] })] }), lock.lock_reason && (_jsx("p", { className: "mt-2 text-sm text-gray-600", children: lock.lock_reason }))] }, lock.id))) }))] })), activeTab === 'statistics' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Workflow Statistics" }), statistics && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-blue-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex items-center", children: [_jsx(DocumentTextIcon, { className: "h-8 w-8 text-blue-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-blue-900", children: "Total States" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: statistics.total_states })] })] }) }), _jsx("div", { className: "bg-green-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircleIcon, { className: "h-8 w-8 text-green-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-green-900", children: "Approved" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: statistics.approval_stats.approved })] })] }) }), _jsx("div", { className: "bg-yellow-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex items-center", children: [_jsx(ClockIcon, { className: "h-8 w-8 text-yellow-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-yellow-900", children: "Pending" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: statistics.pending_approvals })] })] }) }), _jsx("div", { className: "bg-red-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex items-center", children: [_jsx(LockClosedIcon, { className: "h-8 w-8 text-red-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-red-900", children: "Active Locks" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: statistics.active_locks })] })] }) })] }))] }))] })] }));
};

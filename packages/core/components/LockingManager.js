import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4.3 - Locking Manager Component
// Main UI component for managing locks in the workspace
import { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, AlertTriangle, X, Filter, Search } from 'lucide-react';
import { useLockingStore } from '../stores/lockingStore.js';
import { LockIndicator } from './LockIndicator.js';
import { LockRequestDialog } from './LockRequestDialog.js';
import { LockBreakingWorkflow } from './LockBreakingWorkflow.js';
import { LockStatusOverview } from './LockStatusOverview.js';
import { LockQueueVisualization } from './LockQueueVisualization.js';
import { LockNotifications } from './LockNotifications.js';
import { LockPolicyEditor } from './LockPolicyEditor.js';
export const LockingManager = ({ workspaceId, userId, onLockStateChange }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedResource, setSelectedResource] = useState(null);
    const [showRequestDialog, setShowRequestDialog] = useState(false);
    const [showBreakingWorkflow, setShowBreakingWorkflow] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [lockTypeFilter, setLockTypeFilter] = useState('all');
    const [showExpiredLocks, setShowExpiredLocks] = useState(false);
    const { locks, conflicts, queue, notifications, statistics, isLoading, error, fetchLocks, fetchConflicts, fetchQueue, fetchNotifications, fetchStatistics, acquireLock, releaseLock, breakLock, clearError } = useLockingStore();
    // Load data on component mount
    useEffect(() => {
        fetchLocks(workspaceId);
        fetchConflicts(workspaceId);
        fetchQueue(workspaceId);
        fetchNotifications(userId);
        fetchStatistics(workspaceId);
    }, [workspaceId, userId]);
    // Auto-refresh data every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLocks(workspaceId);
            fetchConflicts(workspaceId);
            fetchQueue(workspaceId);
            fetchNotifications(userId);
            fetchStatistics(workspaceId);
        }, 30000);
        return () => clearInterval(interval);
    }, [workspaceId, userId]);
    const handleLockRequest = useCallback(async (resourceId, lockType, reason) => {
        try {
            const result = await acquireLock({
                resource_id: resourceId,
                user_id: userId,
                lock_type: lockType,
                scope: 'resource',
                reason
            });
            if (result.success) {
                onLockStateChange?.(resourceId, true);
                setShowRequestDialog(false);
                setSelectedResource(null);
            }
        }
        catch (error) {
            console.error('Failed to acquire lock:', error);
        }
    }, [userId, acquireLock, onLockStateChange]);
    const handleLockRelease = useCallback(async (lockId, resourceId) => {
        try {
            const result = await releaseLock(lockId, userId);
            if (result.success) {
                onLockStateChange?.(resourceId, false);
            }
        }
        catch (error) {
            console.error('Failed to release lock:', error);
        }
    }, [userId, releaseLock, onLockStateChange]);
    const handleLockBreak = useCallback(async (lockId, resourceId, justification) => {
        try {
            const result = await breakLock(lockId, userId, justification);
            if (result.success) {
                onLockStateChange?.(resourceId, false);
                setShowBreakingWorkflow(false);
            }
        }
        catch (error) {
            console.error('Failed to break lock:', error);
        }
    }, [userId, breakLock, onLockStateChange]);
    const filteredLocks = locks.filter(lock => {
        const matchesSearch = !searchTerm ||
            lock.resource_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lock.lock_reason?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = lockTypeFilter === 'all' || lock.lock_type === lockTypeFilter;
        const matchesExpired = showExpiredLocks || !lock.expires_at || new Date(lock.expires_at) > new Date();
        return matchesSearch && matchesType && matchesExpired;
    });
    const unreadNotifications = notifications.filter(n => !n.read_at).length;
    if (isLoading) {
        return (_jsxs("div", { className: "flex items-center justify-center p-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "Loading lock information..." })] }));
    }
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-lg", children: [_jsxs("div", { className: "border-b border-gray-200 px-6 py-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Lock, { className: "h-5 w-5 text-gray-500" }), _jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Lock Management" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => setShowRequestDialog(true), className: "px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700", children: "Request Lock" }), _jsx("button", { onClick: () => fetchLocks(workspaceId), className: "px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200", children: "Refresh" })] })] }), _jsxs("div", { className: "flex space-x-4 mt-4", children: [_jsx("button", { onClick: () => setActiveTab('overview'), className: `pb-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: "Overview" }), _jsxs("button", { onClick: () => setActiveTab('locks'), className: `pb-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'locks'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: ["Active Locks (", filteredLocks.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('queue'), className: `pb-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'queue'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: ["Queue (", queue.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('notifications'), className: `pb-2 px-1 border-b-2 font-medium text-sm relative ${activeTab === 'notifications'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: ["Notifications", unreadNotifications > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center", children: unreadNotifications }))] }), _jsx("button", { onClick: () => setActiveTab('policy'), className: `pb-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'policy'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`, children: "Policy" })] })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-4 m-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-400 mr-2" }), _jsx("span", { className: "text-red-700", children: error }), _jsx("button", { onClick: clearError, className: "ml-auto text-red-400 hover:text-red-600", children: _jsx(X, { className: "h-4 w-4" }) })] }) })), _jsxs("div", { className: "p-6", children: [activeTab === 'overview' && (_jsx(LockStatusOverview, { statistics: statistics, conflicts: conflicts, onConflictClick: (conflict) => {
                            setSelectedResource(conflict.resource_id);
                            setShowBreakingWorkflow(true);
                        } })), activeTab === 'locks' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-4 bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Search, { className: "h-4 w-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search locks...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "border border-gray-300 rounded px-3 py-1 text-sm" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Filter, { className: "h-4 w-4 text-gray-400" }), _jsxs("select", { value: lockTypeFilter, onChange: (e) => setLockTypeFilter(e.target.value), className: "border border-gray-300 rounded px-3 py-1 text-sm", children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "edit", children: "Edit" }), _jsx("option", { value: "state_change", children: "State Change" }), _jsx("option", { value: "delete", children: "Delete" }), _jsx("option", { value: "admin", children: "Admin" })] })] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: showExpiredLocks, onChange: (e) => setShowExpiredLocks(e.target.checked), className: "rounded border-gray-300" }), _jsx("span", { className: "text-sm text-gray-700", children: "Show expired" })] })] }), _jsxs("div", { className: "space-y-2", children: [filteredLocks.map((lock) => (_jsx("div", { className: "border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(LockIndicator, { lock: lock, size: "small", showTooltip: false }), _jsxs("div", { children: [_jsxs("p", { className: "font-medium text-gray-900", children: ["Resource: ", lock.resource_id.substring(0, 8), "..."] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Type: ", lock.lock_type, " \u2022 By: ", lock.locked_by] }), lock.lock_reason && (_jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Reason: ", lock.lock_reason] }))] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [lock.expires_at && (_jsxs("span", { className: "text-xs text-gray-500", children: ["Expires: ", new Date(lock.expires_at).toLocaleString()] })), lock.locked_by === userId ? (_jsxs("button", { onClick: () => handleLockRelease(lock.id, lock.resource_id), className: "px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200", children: [_jsx(Unlock, { className: "h-3 w-3" }), "Release"] })) : (_jsxs("button", { onClick: () => {
                                                                setSelectedResource(lock.resource_id);
                                                                setShowBreakingWorkflow(true);
                                                            }, className: "px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200", children: [_jsx(AlertTriangle, { className: "h-3 w-3" }), "Break"] }))] })] }) }, lock.id))), filteredLocks.length === 0 && (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No locks found matching your criteria." }))] })] })), activeTab === 'queue' && (_jsx(LockQueueVisualization, { queue: queue, onRemoveFromQueue: (queueId) => {
                            // Implementation for removing from queue
                            console.log('Remove from queue:', queueId);
                        } })), activeTab === 'notifications' && (_jsx(LockNotifications, { notifications: notifications, onMarkAsRead: (notificationId) => {
                            // Implementation for marking as read
                            console.log('Mark as read:', notificationId);
                        } })), activeTab === 'policy' && (_jsx(LockPolicyEditor, { workspaceId: workspaceId, onPolicyUpdate: () => {
                            // Refresh data after policy update
                            fetchLocks(workspaceId);
                            fetchStatistics(workspaceId);
                        } }))] }), showRequestDialog && (_jsx(LockRequestDialog, { isOpen: showRequestDialog, onClose: () => setShowRequestDialog(false), onRequest: handleLockRequest, resourceId: selectedResource, userId: userId })), showBreakingWorkflow && selectedResource && (_jsx(LockBreakingWorkflow, { isOpen: showBreakingWorkflow, onClose: () => setShowBreakingWorkflow(false), resourceId: selectedResource, onBreakLock: handleLockBreak, userId: userId }))] }));
};

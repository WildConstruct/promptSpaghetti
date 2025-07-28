// Epic 9.4.3 - Locking Manager Component
// Main UI component for managing locks in the workspace
import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, AlertTriangle, X, Filter, Search } from 'lucide-react';
import { useLockingStore } from '../stores/lockingStore';
import { LockIndicator } from './LockIndicator';
import { LockRequestDialog } from './LockRequestDialog';
import { LockBreakingWorkflow } from './LockBreakingWorkflow';
import { LockStatusOverview } from './LockStatusOverview';
import { LockQueueVisualization } from './LockQueueVisualization';
import { LockNotifications } from './LockNotifications';
import { LockPolicyEditor } from './LockPolicyEditor';
interface LockingManagerProps {
  workspaceId: string;,
  userId: string;
  onLockStateChange?: (resourceId: string, isLocked: boolean) => void;
  export const LockingManager: React.FC<LockingManagerProps> = ({,)
  workspaceId,
  userId,
  onLockStateChange
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'locks' | 'queue' | 'notifications' | 'policy'>('overview');
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showBreakingWorkflow, setShowBreakingWorkflow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lockTypeFilter, setLockTypeFilter] = useState<string>('all');
  const [showExpiredLocks, setShowExpiredLocks] = useState(false);
  const {
    locks,
    conflicts,
    queue,
    notifications,
    statistics,
    isLoading,
    error,
    fetchLocks,
    fetchConflicts,
    fetchQueue,
    fetchNotifications,
    fetchStatistics,
    acquireLock,
    releaseLock,
    breakLock,
    clearError
  } = useLockingStore();
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
  const handleLockRequest = useCallback(async (resourceId: string, lockType: string, reason?: string) => {
  try {
  const result = await acquireLock({)
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
    } catch (error) {
  console.error('Failed to acquire lock:', error);
}, [userId, acquireLock, onLockStateChange]);
  const handleLockRelease = useCallback(async (lockId: string, resourceId: string) => {
    try {
      const result = await releaseLock(lockId, userId);
      if (result.success) {
        onLockStateChange?.(resourceId, false);
    } catch (error) {
  console.error('Failed to release lock:', error);
}, [userId, releaseLock, onLockStateChange]);
  const handleLockBreak = useCallback(async (lockId: string, resourceId: string, justification: string) => {
    try {
      const result = await breakLock(lockId, userId, justification);
      if (result.success) {
        onLockStateChange?.(resourceId, false);
        setShowBreakingWorkflow(false);
    } catch (error) {
  console.error('Failed to break lock:', error);
}, [userId, breakLock, onLockStateChange]);
  const filteredLocks = locks.filter(lock => {)
  const matchesSearch = !searchTerm || ;
      lock.resource_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lock.lock_reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = lockTypeFilter === 'all' || lock.lock_type === lockTypeFilter;
    const matchesExpired = showExpiredLocks || !lock.expires_at || new Date(lock.expires_at) > new Date();
    return matchesSearch && matchesType && matchesExpired;
  });
  const unreadNotifications = notifications.filter(n => !n.read_at).length;
  if (isLoading) {
    return;
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading lock information...</span>
      </div>
    );
  return;
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Lock Management</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRequestDialog(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Request Lock
            </button>
            <button
              onClick={() => fetchLocks(workspaceId)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
  activeTab === 'overview'
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700',
}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('locks')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
  activeTab === 'locks'
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700',
}`}
          >
            Active Locks ({filteredLocks.length})
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
  activeTab === 'queue'
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700',
}`}
          >
            Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm relative ${
  activeTab === 'notifications'
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700',
}`}
          >
            Notifications
            {unreadNotifications > 0 && ()
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
  activeTab === 'policy'
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700',
}`}
          >
            Policy
          </button>
        </div>
      </div>
      {/* Error Display */}
      {error && ()
        <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && ()
          <LockStatusOverview
            statistics={statistics}
            conflicts={conflicts}
            onConflictClick={(conflict) => {
              setSelectedResource(conflict.resource_id);
              setShowBreakingWorkflow(true);
            }}
          />
        )}
        {activeTab === 'locks' && ()
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search locks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={lockTypeFilter}
                  onChange={(e) => setLockTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="edit">Edit</option>
                  <option value="state_change">State Change</option>
                  <option value="delete">Delete</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showExpiredLocks}
                  onChange={(e) => setShowExpiredLocks(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show expired</span>
              </label>
            </div>
            {/* Lock List */}
            <div className="space-y-2">
              {filteredLocks.map((lock) => ()
                <div key={lock.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <LockIndicator
                        lock={lock}
                        size="small"
                        showTooltip={false}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          Resource: {lock.resource_id.substring(0, 8)}...
                        </p>
                        <p className="text-sm text-gray-500">
                          Type: {lock.lock_type} • By: {lock.locked_by}
                        </p>
                        {lock.lock_reason && ()
                          <p className="text-sm text-gray-600 mt-1">
                            Reason: {lock.lock_reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {lock.expires_at && ()
                        <span className="text-xs text-gray-500">
                          Expires: {new Date(lock.expires_at).toLocaleString()}
                        </span>
                      )}
                      {lock.locked_by === userId ? ()
                        <button
                          onClick={() => handleLockRelease(lock.id, lock.resource_id)}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                        >
                          <Unlock className="h-3 w-3" />
                          Release
                        </button>
                      ) : ()
                        <button
                          onClick={() => {
                            setSelectedResource(lock.resource_id);
                            setShowBreakingWorkflow(true);
                          }}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          Break
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredLocks.length === 0 && ()
                <div className="text-center py-8 text-gray-500">
                  No locks found matching your criteria.
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'queue' && ()
          <LockQueueVisualization
            queue={queue}
            onRemoveFromQueue={(queueId) => {
  // Implementation for removing from queue
  console.log('Remove from queue:', queueId);
}}
          />
        )}
        {activeTab === 'notifications' && ()
          <LockNotifications
            notifications={notifications}
            onMarkAsRead={(notificationId) => {
  // Implementation for marking as read
  console.log('Mark as read:', notificationId);
}}
          />
        )}
        {activeTab === 'policy' && ()
          <LockPolicyEditor
            workspaceId={workspaceId}
            onPolicyUpdate={() => {
              // Refresh data after policy update
              fetchLocks(workspaceId);
              fetchStatistics(workspaceId);
            }}
          />
        )}
      </div>
      {/* Dialogs */}
      {showRequestDialog && ()
        <LockRequestDialog
          isOpen={showRequestDialog}
          onClose={() => setShowRequestDialog(false)}
          onRequest={handleLockRequest}
          resourceId={selectedResource}
          userId={userId}
        />
      )}
      {showBreakingWorkflow && selectedResource && ()
        <LockBreakingWorkflow
          isOpen={showBreakingWorkflow}
          onClose={() => setShowBreakingWorkflow(false)}
          resourceId={selectedResource}
          onBreakLock={handleLockBreak}
          userId={userId}
        />
      )}
    </div>
  );
};
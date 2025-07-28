// Epic 9.4 - Workflow State Manager Component
// Main UI component for managing workflow states and transitions
import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  DocumentTextIcon,
  EyeIcon,
  GlobeAltIcon,
  ArchiveBoxIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserGroupIcon,
  LockClosedIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useWorkflowStore } from '../stores/workflowStore';
import { WorkflowState, WorkflowTransition, WorkflowApproval, WorkflowLock, WorkflowStatistics } from '../types/workflow';
interface WorkflowStateManagerProps {
  workspaceId: string;
  resourceId?: string;
  currentUserId: string;
  onStateChange?: (newStateId: string) => void;
  onLockAcquired?: (lockId: string) => void;
  onLockReleased?: (lockId: string) => void;
}

export const WorkflowStateManager: React.FC<WorkflowStateManagerProps> = ({)
  workspaceId,
  resourceId,
  currentUserId,
  onStateChange,
  onLockAcquired,
  onLockReleased
}) => {
  const {
    states,
    transitions,
    approvals,
    locks,
    statistics,
    loading,
    error,
    fetchStates,
    fetchTransitions,
    fetchApprovals,
    fetchLocks,
    fetchStatistics,
    transitionResourceState,
    approveWorkflow,
    rejectWorkflow,
    acquireLock,
    releaseLock,
    createState,
    updateState,
    deleteState,
    createTransition,
    deleteTransition
  } = useWorkflowStore();
  const [activeTab, setActiveTab] = useState<'states' | 'approvals' | 'locks' | 'history' | 'statistics'>('states');
  const [__showCreateState, setShowCreateState] = useState(false);
  const [__showCreateTransition, __setShowCreateTransition] = useState(false);
  const [__selectedState, setSelectedState] = useState<WorkflowState | null>(null);
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());
  // Load initial data
  useEffect(() => {
    fetchStates(workspaceId);
    fetchTransitions(workspaceId);
    fetchApprovals(workspaceId);
    fetchLocks(workspaceId);
    fetchStatistics(workspaceId);
  }, [workspaceId]);
  // Get current resource state
  const currentResourceState = resourceId ;
    ? states.find(state => state.id === resourceId) // This would need to be fetched from resource data
    : null;
  // Get available transitions for current state
  const availableTransitions = currentResourceState ;
    ? transitions.filter(t => t.from_state_id === currentResourceState.id)
    : [];
  // Get resource locks
  const resourceLocks = resourceId ;
    ? locks.filter(lock => lock.resource_id === resourceId)
    : [];
  // Get pending approvals for current user
  const pendingApprovals = approvals.filter(approval => ;)
    approval.status === 'pending' && 
    (approval.requester_id === currentUserId || approval.approved_by === currentUserId)
  );
  const handleStateTransition = useCallback(async (toStateId: string, comment?: string) => {
    if (!resourceId) return;
    try {
      const result = await transitionResourceState(resourceId, toStateId, currentUserId, {)
        comment,
        force: false,
      });
      if (result.success) {
        if (result.approval_required) {
          // Show approval request confirmation
          alert('Approval request submitted for state transition.');
        } else {
          onStateChange?.(result.new_state_id!);
        }
      }
    } catch (error) {
      console.error('Failed to transition state:', error);
    }
  }, [resourceId, currentUserId, transitionResourceState, onStateChange]);
  const handleApprovalAction = useCallback(async (;)
    approvalId: string, 
    action: 'approve' | 'reject', 
    comment?: string
  ) => {
    try {
      if (action === 'approve') {
        await approveWorkflow(approvalId, currentUserId, comment);
      } else {
        await rejectWorkflow(approvalId, currentUserId, comment || 'Rejected');
      }
      // Refresh data
      fetchApprovals(workspaceId);
      fetchStates(workspaceId);
    } catch (error) {
      console.error(`Failed to ${action} workflow:`, error);}
    }
  }, [currentUserId, approveWorkflow, rejectWorkflow, fetchApprovals, fetchStates, workspaceId]);
  const handleLockAction = useCallback(async (;)
    action: 'acquire' | 'release',
    lockId?: string,
    lockType?: 'edit' | 'state_change' | 'delete' | 'custom'
  ) => {
    if (!resourceId) return;
    try {
      if (action === 'acquire') {
        const lock = await acquireLock(resourceId, currentUserId, lockType || 'edit', {)
          reason: 'Manual lock acquisition'
        });
        onLockAcquired?.(lock.id);
      } else if (lockId) {
        await releaseLock(lockId, currentUserId);
        onLockReleased?.(lockId);
      }
      // Refresh locks
      fetchLocks(workspaceId);
    } catch (error) {
      console.error(`Failed to ${action} lock:`, error);}
    }
  }, [resourceId, currentUserId, acquireLock, releaseLock, onLockAcquired, onLockReleased, fetchLocks, workspaceId]);
  const toggleStateExpansion = (stateId: string) => {
    const newExpanded = new Set(expandedStates);
    if (newExpanded.has(stateId)) {
      newExpanded.delete(stateId);
    } else {
      newExpanded.add(stateId);
    }
    setExpandedStates(newExpanded);
  };
  const getStateIcon = (state: WorkflowState) => {
    switch (state.icon) {
    case 'CheckCircleIcon': return <CheckCircleIcon className="h-4 w-4" />;
    case 'EyeIcon': return <EyeIcon className="h-4 w-4" />;
    case 'GlobeAltIcon': return <GlobeAltIcon className="h-4 w-4" />;
    case 'ArchiveBoxIcon': return <ArchiveBoxIcon className="h-4 w-4" />;
    case 'DocumentTextIcon': 
    default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };
  const getStateTransitions = (stateId: string) => {
    return transitions.filter(t => t.from_state_id === stateId);
  };
  if (loading) {
    return ()
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (error) {
    return ()
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <XCircleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading workflow data</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }
  return ()
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Workflow Management</h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage workflow states, approvals, and transitions
              </p>
            </div>
            {resourceId && currentResourceState && ()
              <div className="flex items-center space-x-2">
                <div 
                  className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${currentResourceState.color}20`, color: currentResourceState.color }}
                >
                  {getStateIcon(currentResourceState)}
                  <span>{currentResourceState.name}</span>
                </div>
                {resourceLocks.length > 0 && ()
                  <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    <LockClosedIcon className="h-3 w-3" />
                    <span>{resourceLocks.length} lock(s)</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="flex space-x-8 px-6">
          {[
            { id: 'states', label: 'States', count: states.length },
            { id: 'approvals', label: 'Approvals', count: pendingApprovals.length },
            { id: 'locks', label: 'Locks', count: resourceLocks.length },
            { id: 'statistics', label: 'Statistics', count: null }
          ].map(tab => ()
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && ()
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'states' && ()
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Workflow States</h3>
              <button
                onClick={() => setShowCreateState(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add State
              </button>
            </div>
            {/* States List */}
            <div className="space-y-3">
              {states.map(state => ()
                <div
                  key={state.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleStateExpansion(state.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedStates.has(state.id) ? ()
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : ()
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </button>
                      <div 
                        className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: `${state.color}20`, color: state.color }}
                      >
                        {getStateIcon(state)}
                        <span>{state.name}</span>
                      </div>
                      {state.is_initial && ()
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Initial
                        </span>
                      )}
                      {state.is_final && ()
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          Final
                        </span>
                      )}
                      {state.is_locked && ()
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          Locked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {resourceId && currentResourceState?.id === state.id && ()
                        <div className="flex items-center space-x-2">
                          {availableTransitions.map(transition => ()
                            <button
                              key={transition.id}
                              onClick={() => handleStateTransition(transition.to_state_id)}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200"
                              disabled={transition.requires_approval}
                            >
                              {transition.name}
                              {transition.requires_approval && <span className="ml-1">*</span>}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedState(state)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {state.description && ()
                    <p className="mt-2 text-sm text-gray-600">{state.description}</p>
                  )}
                  {/* Expanded State Details */}
                  {expandedStates.has(state.id) && ()
                    <div className="mt-4 space-y-3">
                      <div className="border-t pt-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Available Transitions</h4>
                        <div className="space-y-2">
                          {getStateTransitions(state.id).map(transition => ()
                            <div
                              key={transition.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{transition.name}</span>
                                {transition.requires_approval && ()
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                    Requires Approval
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                  → {states.find(s => s.id === transition.to_state_id)?.name}
                                </span>
                                {resourceId && currentResourceState?.id === state.id && ()
                                  <button
                                    onClick={() => handleStateTransition(transition.to_state_id)}
                                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                  >
                                    Transition
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          {getStateTransitions(state.id).length === 0 && ()
                            <p className="text-sm text-gray-500 italic">No transitions available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'approvals' && ()
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
            {pendingApprovals.length === 0 ? ()
              <div className="text-center py-8">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
                <p className="mt-1 text-sm text-gray-500">
                  All workflow approvals are up to date.
                </p>
              </div>
            ) : ()
              <div className="space-y-3">
                {pendingApprovals.map(approval => ()
                  <div
                    key={approval.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            Approval Required
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          approval.priority === 'high' ? 'bg-red-100 text-red-800' :
                            approval.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                        }`}>
                          {approval.priority}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApprovalAction(approval.id, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApprovalAction(approval.id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Requested by: {approval.requester_id}</p>
                      <p>Resource: {approval.resource_id}</p>
                      {approval.due_date && ()
                        <p>Due: {new Date(approval.due_date).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'locks' && ()
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Resource Locks</h3>
              {resourceId && ()
                <button
                  onClick={() => handleLockAction('acquire')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <LockClosedIcon className="h-4 w-4 mr-2" />
                  Acquire Lock
                </button>
              )}
            </div>
            {resourceLocks.length === 0 ? ()
              <div className="text-center py-8">
                <LockClosedIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No active locks</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This resource is not currently locked.
                </p>
              </div>
            ) : ()
              <div className="space-y-3">
                {resourceLocks.map(lock => ()
                  <div
                    key={lock.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <LockClosedIcon className="h-4 w-4 text-yellow-500" />
                        <div>
                          <span className="text-sm font-medium">{lock.lock_type} Lock</span>
                          <p className="text-xs text-gray-500">
                            Locked by {lock.locked_by} on {new Date(lock.locked_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {lock.expires_at && ()
                          <span className="text-xs text-gray-500">
                            Expires: {new Date(lock.expires_at).toLocaleString()}
                          </span>
                        )}
                        {lock.locked_by === currentUserId && ()
                          <button
                            onClick={() => handleLockAction('release', lock.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Release
                          </button>
                        )}
                      </div>
                    </div>
                    {lock.lock_reason && ()
                      <p className="mt-2 text-sm text-gray-600">{lock.lock_reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'statistics' && ()
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Workflow Statistics</h3>
            {statistics && ()
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-900">Total States</p>
                      <p className="text-2xl font-bold text-blue-600">{statistics.total_states}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-900">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{statistics.approval_stats.approved}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-900">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{statistics.pending_approvals}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <LockClosedIcon className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-red-900">Active Locks</p>
                      <p className="text-2xl font-bold text-red-600">{statistics.active_locks}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
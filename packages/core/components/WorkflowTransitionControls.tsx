// Epic 9.4 - Workflow Transition Controls Component
// Component for managing state transitions and approvals
import React, { useState, useEffect } from 'react';
import { 
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useWorkflowStore } from '../stores/workflowStore';
interface WorkflowTransition {
  id: string;
  from_state_id?: string;
  to_state_id: string;
  name: string;
  description?: string;
  requires_approval: boolean;
  required_permissions: bigint;
  conditions: Record<string, any>;
}
interface WorkflowState {
  id: string;
  name: string;
  color: string;
  icon?: string;
  is_locked: boolean;
}
interface WorkflowTransitionControlsProps {
  resourceId: string;
  currentStateId: string;
  currentUserId: string;
  workspaceId: string;
  onTransitionComplete?: (newStateId: string) => void;
  onApprovalRequested?: (approvalId: string) => void;
  disabled?: boolean;
}

export const WorkflowTransitionControls: React.FC<WorkflowTransitionControlsProps> = ({)
  resourceId,
  currentStateId,
  currentUserId,
  workspaceId,
  onTransitionComplete,
  onApprovalRequested,
  disabled = false
}) => {
  const {
    states,
    transitions,
    loading,
    error,
    fetchStates,
    fetchTransitions,
    transitionResourceState,
    validateStateTransition,
    canUserTransitionState,
    isResourceLocked
  } = useWorkflowStore();
  const [selectedTransition, setSelectedTransition] = useState<WorkflowTransition | null>(null);
  const [comment, setComment] = useState('');
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [validationResults, setValidationResults] = useState<Record<string, any>>({});
  const [resourceLocked, setResourceLocked] = useState(false);
  // Get current state
  const currentState = states.find(s => s.id === currentStateId);
  // Get available transitions
  const availableTransitions = transitions.filter(t => t.from_state_id === currentStateId);
  // Load data on mount
  useEffect(() => {
    fetchStates(workspaceId);
    fetchTransitions(workspaceId);
  }, [workspaceId, fetchStates, fetchTransitions]);
  // Check if resource is locked
  useEffect(() => {
    const checkLock = async () => {
      const locked = await isResourceLocked(resourceId, 'state_change');
      setResourceLocked(locked);
    };
    checkLock();
  }, [resourceId, isResourceLocked]);
  // Validate transitions
  useEffect(() => {
    const validateTransitions = async () => {
      const results: Record<string, any> = {};
      for (const transition of availableTransitions) {
        const validation = await validateStateTransition(resourceId, transition.to_state_id);
        const canTransition = await canUserTransitionState(currentUserId, resourceId, transition.to_state_id);
        results[transition.id] = {
          ...validation,
          can_transition: canTransition,
        };
      }
      setValidationResults(results);
    };
    if (availableTransitions.length > 0) {
      validateTransitions();
    }
  }, [availableTransitions, resourceId, currentUserId, validateStateTransition, canUserTransitionState]);
  const handleTransitionClick = (transition: WorkflowTransition) => {
    setSelectedTransition(transition);
    // Show comment dialog for approval transitions or if user preference
    if (transition.requires_approval || transition.description) {
      setShowCommentDialog(true);
    } else {
      executeTransition(transition, '');
    }
  };
  const executeTransition = async (transition: WorkflowTransition, transitionComment: string) => {
    if (!transition) return;
    try {
      const result = await transitionResourceState(;);
        resourceId,
        transition.to_state_id,
        currentUserId,
        {
          comment: transitionComment,
          metadata: {,
            transition_id: transition.id,
            transition_name: transition.name,
          }
        }
      );
      if (result.success) {
        if (result.approval_required) {
          onApprovalRequested?.(result.approval_id!);
        } else {
          onTransitionComplete?.(result.new_state_id!);
        }
      }
    } catch (error) {
      console.error('Transition failed:', error);
    } finally {
      setSelectedTransition(null);
      setComment('');
      setShowCommentDialog(false);
    }
  };
  const handleCommentSubmit = () => {
    if (selectedTransition) {
      executeTransition(selectedTransition, comment);
    }
  };
  const getTransitionIcon = (transition: WorkflowTransition) => {
    if (transition.requires_approval) {
      return <ClockIcon className="h-4 w-4 text-yellow-500" />;
    }
    return <ArrowRightIcon className="h-4 w-4 text-blue-500" />;
  };
  const getTransitionButton = (transition: WorkflowTransition) => {
    const validation = validationResults[transition.id];
    const toState = states.find(s => s.id === transition.to_state_id);
    if (!validation || !toState) return null;
    const isDisabled = disabled || ;
                      loading || 
                      !validation.valid || 
                      !validation.can_transition || 
                      resourceLocked ||
                      (toState.is_locked && !validation.can_transition);
    let buttonClass = 'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ';
    if (isDisabled) {
      buttonClass += 'bg-gray-100 text-gray-400 cursor-not-allowed';
    } else if (transition.requires_approval) {
      buttonClass += 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    } else {
      buttonClass += 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
    return ();
      <button
        key={transition.id}
        onClick={() => handleTransitionClick(transition)}
        disabled={isDisabled}
        className={buttonClass}
        title={validation.error || transition.description || `Transition to ${toState.name}`}
      >
        {getTransitionIcon(transition)}
        <span>{transition.name}</span>
        <ArrowRightIcon className="h-3 w-3" />
        <span 
          className="px-2 py-1 rounded text-xs"
          style={{ backgroundColor: `${toState.color}20`, color: toState.color }}
        >
          {toState.name}
        </span>
        {transition.requires_approval && ()
          <span className="text-xs bg-yellow-200 text-yellow-800 px-1 rounded">
            Approval Required
          </span>
        )}
      </button>
    );
  };
  if (loading) {
    return ();
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Loading transitions...</span>
      </div>
    );
  }
  if (error) {
    return ();
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <span>Error loading transitions</span>
      </div>
    );
  }
  if (!currentState) {
    return ();
      <div className="text-sm text-gray-500">
        Current state not found
      </div>
    );
  }
  return ();
    <div className="space-y-3">
      {/* Current State Display */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-600">Current state:</span>
        <span 
          className="px-2 py-1 rounded text-sm font-medium"
          style={{ backgroundColor: `${currentState.color}20`, color: currentState.color }}
        >
          {currentState.name}
        </span>
        {resourceLocked && ()
          <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
            <LockClosedIcon className="h-3 w-3" />
            <span>Locked</span>
          </span>
        )}
      </div>
      {/* Available Transitions */}
      {availableTransitions.length === 0 ? ()
        <div className="text-sm text-gray-500">
          No transitions available from this state
        </div>
      ) : ()
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Available transitions:
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTransitions.map(getTransitionButton)}
          </div>
        </div>
      )}
      {/* Warnings */}
      {resourceLocked && ()
        <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>Resource is locked for state changes</span>
        </div>
      )}
      {/* Comment Dialog */}
      {showCommentDialog && selectedTransition && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Transition: {selectedTransition.name}
            </h3>
            {selectedTransition.description && ()
              <p className="text-sm text-gray-600 mb-4">
                {selectedTransition.description}
              </p>
            )}
            {selectedTransition.requires_approval && ()
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded mb-4">
                <ClockIcon className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-800">
                  This transition requires approval
                </span>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment {selectedTransition.requires_approval ? '(required)' : '(optional)'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add a comment about this transition..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCommentDialog(false);
                  setSelectedTransition(null);
                  setComment('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCommentSubmit}
                disabled={selectedTransition.requires_approval && !comment.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
              >
                {selectedTransition.requires_approval ? 'Request Approval' : 'Transition'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
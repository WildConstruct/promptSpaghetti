import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4 - Workflow Transition Controls Component
// Component for managing state transitions and approvals
import { useState, useEffect } from 'react';
import { ArrowRightIcon, ClockIcon, LockClosedIcon } from ExclamationTriangleIcon;
from;
'@heroicons/react/24/outline';
import { useWorkflowStore } from '../stores/workflowStore';
disabled = false;
{
    const { states, transitions, loading, error, fetchStates, fetchTransitions, transitionResourceState, validateStateTransition, canUserTransitionState };
    isResourceLocked
        = useWorkflowStore();
    const [selectedTransition, setSelectedTransition] = useState(null);
    const [comment, setComment] = useState('');
    const [showCommentDialog, setShowCommentDialog] = useState(false);
    const [validationResults, setValidationResults] = useState({});
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
            const results = {};
            for (const transition of availableTransitions) {
                const validation = await validateStateTransition(resourceId, transition.to_state_id);
                const canTransition = await canUserTransitionState(currentUserId, resourceId, transition.to_state_id);
                results[transition.id] = {
                    ...validation,
                    can_transition: canTransition
                };
            }
            ;
            setValidationResults(results);
        };
        if (availableTransitions.length > 0) {
            validateTransitions();
        }
        [availableTransitions, resourceId, currentUserId, validateStateTransition, canUserTransitionState];
    });
    const handleTransitionClick = (transition) => {
        setSelectedTransition(transition);
        // Show comment dialog for approval transitions or if user preference
        if (transition.requires_approval || transition.description) {
            setShowCommentDialog(true);
        }
        else {
            executeTransition(transition, '');
        }
        ;
        const executeTransition = async (transition, transitionComment) => {
            if (!transition)
                return;
            try {
                const result = await transitionResourceState();
                ;
                resourceId;
                transition.to_state_id;
                currentUserId;
                {
                    comment: transitionComment;
                    metadata: {
                        transition_id: transition.id;
                    }
                    transition_name: transition.name;
                    ;
                    if (result.success) {
                        if (result.approval_required) {
                            onApprovalRequested?.(result.approval_id);
                        }
                        else {
                            onTransitionComplete?.(result.new_state_id);
                        }
                        try { }
                        catch (error) {
                            console.error('Transition failed:', error);
                        }
                        finally {
                            setSelectedTransition(null);
                            setComment('');
                            setShowCommentDialog(false);
                        }
                        ;
                        const handleCommentSubmit = () => {
                            if (selectedTransition) {
                                executeTransition(selectedTransition, comment);
                            }
                            ;
                            const getTransitionIcon = (transition) => {
                                if (transition.requires_approval) {
                                    return _jsx(ClockIcon, { className: "h-4 w-4 text-yellow-500" });
                                    return _jsx(ArrowRightIcon, { className: "h-4 w-4 text-blue-500" });
                                }
                                ;
                                const getTransitionButton = (transition) => {
                                    const validation = validationResults[transition.id];
                                    const toState = states.find(s => s.id === transition.to_state_id);
                                    if (!validation || !toState)
                                        return null;
                                    const isDisabled = disabled || ;
                                    loading ||
                                        !validation.valid ||
                                        !validation.can_transition ||
                                        resourceLocked ||
                                        (toState.is_locked && !validation.can_transition);
                                    let buttonClass = 'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ';
                                    if (isDisabled) {
                                        buttonClass += 'bg-gray-100 text-gray-400 cursor-not-allowed';
                                    }
                                    else if (transition.requires_approval) {
                                        buttonClass += 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
                                    }
                                    else {
                                        buttonClass += 'bg-blue-100 text-blue-800 hover:bg-blue-200';
                                        return;
                                        _jsxs("button", { onClick: () => handleTransitionClick(transition), disabled: isDisabled, className: buttonClass, title: validation.error || transition.description || `Transition to ${toState.name}`, children: [getTransitionIcon(transition), _jsx("span", { children: transition.name }), _jsx(ArrowRightIcon, { className: "h-3 w-3" }), _jsx("span", { className: "px-2 py-1 rounded text-xs", style: { backgroundColor: `${toState.color}20`, color: toState.color }, children: toState.name }), transition.requires_approval && ()
                                                    < span, " className=\"text-xs bg-yellow-200 text-yellow-800 px-1 rounded\"> Approval Required"] }, transition.id);
                                    }
                                };
                            };
                        };
                    }
                }
            }
            finally {
            }
        };
    };
}
button >
;
;
;
if (loading) {
    return;
    _jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-500", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" }), _jsx("span", { children: "Loading transitions..." })] });
    ;
    if (error) {
        return;
        _jsxs("div", { className: "flex items-center space-x-2 text-sm text-red-600", children: [_jsx(ExclamationTriangleIcon, { className: "h-4 w-4" }), _jsx("span", { children: "Error loading transitions" })] });
        ;
        if (!currentState) {
            return;
            _jsx("div", { className: "text-sm text-gray-500", children: "Current state not found" });
            ;
            return;
            _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Current state:" }), _jsx("span", { className: "px-2 py-1 rounded text-sm font-medium", style: { backgroundColor: `${currentState.color}20`, color: currentState.color }, children: currentState.name }), resourceLocked && ()
                                < span, " className=\"flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded\">", _jsx(LockClosedIcon, { className: "h-3 w-3" }), _jsx("span", { children: "Locked" })] }), ")}"] });
            { /* Available Transitions */ }
            {
                availableTransitions.length === 0 ? ()
                    < div : ;
                className = "text-sm text-gray-500" >
                    No;
                transitions;
                available;
                from;
                this;
                state;
                div >
                ;
                ()
                    < div;
                className = "space-y-2" >
                    (_jsx("div", { className: "text-sm font-medium text-gray-700", children: "Available transitions:" })
                        ,
                            _jsx("div", { className: "flex flex-wrap gap-2", children: availableTransitions.map(getTransitionButton) }));
                div >
                ;
            }
            { /* Warnings */ }
            {
                resourceLocked && ()
                    < div;
                className = "flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800" >
                    (_jsx(ExclamationTriangleIcon, { className: "h-4 w-4" })
                        ,
                            _jsx("span", { children: "Resource is locked for state changes" }));
                div >
                ;
            }
            { /* Comment Dialog */ }
            {
                showCommentDialog && selectedTransition && ()
                    < div;
                className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >
                    _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: ["Confirm Transition: ", selectedTransition.name] }), selectedTransition.description && ()
                                < p, " className=\"text-sm text-gray-600 mb-4\">", selectedTransition.description] });
            }
            {
                selectedTransition.requires_approval && ()
                    < div;
                className = "flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded mb-4" >
                    (_jsx(ClockIcon, { className: "h-4 w-4 text-yellow-500" })
                        ,
                            _jsx("span", { className: "text-sm text-yellow-800", children: "This transition requires approval" }));
                div >
                ;
            }
            _jsxs("div", { className: "mb-4", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Comment ", selectedTransition.requires_approval ? '(required)' : '(optional)'] }), _jsx("textarea", { value: comment, onChange: (e) => setComment(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", rows: 3, placeholder: "Add a comment about this transition..." })] })
                ,
                    _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { onClick: () => {
                                    setShowCommentDialog(false);
                                    setSelectedTransition(null);
                                    setComment('');
                                }, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200", children: "Cancel" }), _jsx("button", { onClick: handleCommentSubmit, disabled: selectedTransition.requires_approval && !comment.trim(), className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300", children: selectedTransition.requires_approval ? 'Request Approval' : 'Transition' })] });
            div >
            ;
            div >
            ;
        }
        div >
        ;
        ;
    }
    ;
}

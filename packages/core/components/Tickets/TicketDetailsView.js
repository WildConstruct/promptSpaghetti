import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 16 Ticket Details View
 *
 * Comprehensive ticket detail view with comments, attachments, status updates,
 * and SLA tracking. Provides full ticket management capabilities.
 */
import { useState, useMemo } from 'react';
import { TicketStatus, TicketPriority } from '../../services/Epic16TicketIntegrationService';
export const TicketDetailsView = ({ ticket, ticketService, userId, userRole, onClose, onTicketUpdate }) => {
    const [currentTicket, setCurrentTicket] = useState(ticket);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [commentForm, setCommentForm] = useState({
        content: '',
        visibility: 'public',
        attachments: []
    });
    const [showStatusUpdate, setShowStatusUpdate] = useState(false);
    const [showAssignment, setShowAssignment] = useState(false);
    const [showEscalation, setShowEscalation] = useState(false);
    // Permissions
    const canModify = useMemo(() => {
        return userRole === 'admin' ||
            (userRole === 'agent' && currentTicket.assignedTo === userId) ||
            (currentTicket.metadata.userId === userId);
    }, [userRole, currentTicket.assignedTo, currentTicket.metadata.userId, userId]);
    const canViewInternal = useMemo(() => {
        return userRole === 'admin' || userRole === 'agent';
    }, [userRole]);
    // SLA calculations
    const slaStatus = useMemo(() => {
        const now = new Date();
        const responseDeadline = currentTicket.sla.responseTime.deadline;
        const resolutionDeadline = currentTicket.sla.resolutionTime.deadline;
        const responseTimeRemaining = responseDeadline.getTime() - now.getTime();
        const resolutionTimeRemaining = resolutionDeadline.getTime() - now.getTime();
        return {
            responseOverdue: responseTimeRemaining < 0 && !currentTicket.sla.responseTime.actual,
            resolutionOverdue: resolutionTimeRemaining < 0 && !currentTicket.sla.resolutionTime.actual,
            responseWarning: responseTimeRemaining > 0 && responseTimeRemaining < (currentTicket.sla.responseTime.warningThreshold * 60 * 1000),
            resolutionWarning: resolutionTimeRemaining > 0 && resolutionTimeRemaining < (currentTicket.sla.resolutionTime.warningThreshold * 60 * 1000),
            responseTimeRemaining: Math.max(0, responseTimeRemaining),
            resolutionTimeRemaining: Math.max(0, resolutionTimeRemaining)
        };
    }, [currentTicket]);
    // Format time remaining
    const formatTimeRemaining = (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        else {
            return `${minutes}m`;
        }
    };
    // Handle comment submission
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentForm.content.trim())
            return;
        setLoading(true);
        setError(null);
        try {
            const newComment = await ticketService.addComment(currentTicket.id, {
                content: commentForm.content,
                author: userId,
                authorType: userRole === 'user' ? 'user' : 'agent',
                visibility: commentForm.visibility,
                attachments: [], // Simplified - would handle file uploads
                mentions: []
            });
            if (newComment) {
                const updatedTicket = {
                    ...currentTicket,
                    comments: [...currentTicket.comments, newComment],
                    updatedAt: new Date()
                };
                setCurrentTicket(updatedTicket);
                onTicketUpdate?.(updatedTicket);
                // Reset form
                setCommentForm({
                    content: '',
                    visibility: 'public',
                    attachments: []
                });
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add comment');
        }
        finally {
            setLoading(false);
        }
    };
    // Handle status update
    const handleStatusUpdate = async (newStatus) => {
        setLoading(true);
        setError(null);
        try {
            const updatedTicket = await ticketService.updateTicketStatus(currentTicket.id, newStatus, userId);
            if (updatedTicket) {
                setCurrentTicket(updatedTicket);
                onTicketUpdate?.(updatedTicket);
                setShowStatusUpdate(false);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update status');
        }
        finally {
            setLoading(false);
        }
    };
    // Handle assignment
    const handleAssignment = async (assigneeId) => {
        setLoading(true);
        setError(null);
        try {
            const updatedTicket = await ticketService.assignTicket(currentTicket.id, assigneeId, userId);
            if (updatedTicket) {
                setCurrentTicket(updatedTicket);
                onTicketUpdate?.(updatedTicket);
                setShowAssignment(false);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign ticket');
        }
        finally {
            setLoading(false);
        }
    };
    // Handle escalation
    const handleEscalation = async (reason) => {
        setLoading(true);
        setError(null);
        try {
            const updatedTicket = await ticketService.escalateTicket(currentTicket.id, reason, userId);
            if (updatedTicket) {
                setCurrentTicket(updatedTicket);
                onTicketUpdate?.(updatedTicket);
                setShowEscalation(false);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to escalate ticket');
        }
        finally {
            setLoading(false);
        }
    };
    // Filter comments based on visibility permissions
    const visibleComments = useMemo(() => {
        return currentTicket.comments.filter(comment => {
            if (comment.visibility === 'public')
                return true;
            if (comment.visibility === 'internal' && canViewInternal)
                return true;
            if (comment.visibility === 'private' && (comment.author === userId || userRole === 'admin'))
                return true;
            return false;
        });
    }, [currentTicket.comments, canViewInternal, userId, userRole]);
    return (_jsxs("div", { className: "ticket-details-view h-full flex flex-col bg-white", children: [_jsxs("div", { className: "border-b border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [_jsxs("span", { className: "text-sm font-medium text-blue-600", children: ["#", currentTicket.id.split('-').pop()] }), _jsx(StatusBadge, { status: currentTicket.status }), _jsx(PriorityBadge, { priority: currentTicket.priority }), slaStatus.responseOverdue && (_jsx("span", { className: "px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full", children: "RESPONSE OVERDUE" })), slaStatus.resolutionOverdue && (_jsx("span", { className: "px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full", children: "RESOLUTION OVERDUE" }))] }), _jsx("h1", { className: "text-xl font-bold text-gray-900 mb-2", children: currentTicket.title }), _jsx("p", { className: "text-gray-600", children: currentTicket.description }), _jsxs("div", { className: "flex items-center space-x-6 mt-4 text-sm text-gray-500", children: [_jsxs("span", { children: ["Type: ", currentTicket.type.replace('_', ' ')] }), _jsxs("span", { children: ["Category: ", currentTicket.category] }), currentTicket.assignedTo && _jsxs("span", { children: ["Assigned: ", currentTicket.assignedTo] }), _jsxs("span", { children: ["Created: ", currentTicket.createdAt.toLocaleDateString()] }), _jsxs("span", { children: ["Updated: ", currentTicket.updatedAt.toLocaleDateString()] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [canModify && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowStatusUpdate(true), className: "px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200", children: "Update Status" }), _jsx("button", { onClick: () => setShowAssignment(true), className: "px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200", children: "Assign" }), _jsx("button", { onClick: () => setShowEscalation(true), className: "px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700", children: "Escalate" })] })), onClose && (_jsx("button", { onClick: onClose, className: "p-2 text-gray-400 hover:text-gray-600", children: _jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] })] }), _jsxs("div", { className: "mt-4 grid grid-cols-2 gap-4", children: [_jsx("div", { className: "bg-gray-50 rounded-lg p-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Response SLA" }), _jsx("span", { className: `text-xs font-medium ${slaStatus.responseOverdue ? 'text-red-600' :
                                                slaStatus.responseWarning ? 'text-yellow-600' : 'text-green-600'}`, children: currentTicket.sla.responseTime.actual
                                                ? `Responded in ${currentTicket.sla.responseTime.actual}m`
                                                : slaStatus.responseOverdue
                                                    ? 'OVERDUE'
                                                    : formatTimeRemaining(slaStatus.responseTimeRemaining) })] }) }), _jsx("div", { className: "bg-gray-50 rounded-lg p-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Resolution SLA" }), _jsx("span", { className: `text-xs font-medium ${slaStatus.resolutionOverdue ? 'text-red-600' :
                                                slaStatus.resolutionWarning ? 'text-yellow-600' : 'text-green-600'}`, children: currentTicket.sla.resolutionTime.actual
                                                ? `Resolved in ${Math.round(currentTicket.sla.resolutionTime.actual / 60)}h`
                                                : slaStatus.resolutionOverdue
                                                    ? 'OVERDUE'
                                                    : formatTimeRemaining(slaStatus.resolutionTimeRemaining) })] }) })] }), error && (_jsx("div", { className: "mt-4 bg-red-50 border border-red-200 rounded-md p-4", children: _jsx("p", { className: "text-sm text-red-700", children: error }) }))] }), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsxs("div", { className: "flex-1 overflow-y-auto p-6", children: [_jsxs("h2", { className: "text-lg font-medium text-gray-900 mb-4", children: ["Comments (", visibleComments.length, ")"] }), _jsxs("div", { className: "space-y-4", children: [visibleComments.map((comment) => (_jsx(CommentItem, { comment: comment, canViewInternal: canViewInternal }, comment.id))), visibleComments.length === 0 && (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-300", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }), _jsx("p", { className: "mt-2 text-sm", children: "No comments yet" })] }))] })] }), _jsx("div", { className: "border-t border-gray-200 p-6", children: _jsxs("form", { onSubmit: handleCommentSubmit, className: "space-y-4", children: [_jsx("div", { children: _jsx("textarea", { value: commentForm.content, onChange: (e) => setCommentForm({ ...commentForm, content: e.target.value }), placeholder: "Add a comment...", className: "w-full px-3 py-2 border border-gray-300 rounded-md resize-none", rows: 3, required: true }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center space-x-4", children: canViewInternal && (_jsx("div", { children: _jsxs("select", { value: commentForm.visibility, onChange: (e) => setCommentForm({ ...commentForm, visibility: e.target.value }), className: "px-3 py-1 border border-gray-300 rounded-md text-sm", children: [_jsx("option", { value: "public", children: "Public" }), _jsx("option", { value: "internal", children: "Internal" }), _jsx("option", { value: "private", children: "Private" })] }) })) }), _jsx("button", { type: "submit", disabled: loading || !commentForm.content.trim(), className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50", children: loading ? 'Adding...' : 'Add Comment' })] })] }) })] }), _jsxs("div", { className: "w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto", children: [currentTicket.labels.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Labels" }), _jsx("div", { className: "flex flex-wrap gap-2", children: currentTicket.labels.map((label) => (_jsx("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full", children: label }, label))) })] })), currentTicket.attachments.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Attachments" }), _jsx("div", { className: "space-y-2", children: currentTicket.attachments.map((attachment) => (_jsx(AttachmentItem, { attachment: attachment }, attachment.id))) })] })), currentTicket.externalIntegrations.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "External Links" }), _jsx("div", { className: "space-y-2", children: currentTicket.externalIntegrations.map((integration) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-white rounded border", children: [_jsx("span", { className: "text-sm font-medium", children: integration.system }), _jsx("span", { className: `px-2 py-1 text-xs rounded ${integration.status === 'synced' ? 'bg-green-100 text-green-800' :
                                                        integration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`, children: integration.status })] }, integration.system))) })] }))] })] }), showStatusUpdate && (_jsx(StatusUpdateModal, { currentStatus: currentTicket.status, onStatusUpdate: handleStatusUpdate, onClose: () => setShowStatusUpdate(false) })), showAssignment && (_jsx(AssignmentModal, { currentAssignee: currentTicket.assignedTo, onAssign: handleAssignment, onClose: () => setShowAssignment(false) })), showEscalation && (_jsx(EscalationModal, { onEscalate: handleEscalation, onClose: () => setShowEscalation(false) }))] }));
};
// Helper Components
const StatusBadge = ({ status }) => {
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
        [TicketStatus.ON_HOLD]: 'bg-gray-300 text-gray-700'
    };
    return (_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`, children: status.replace('_', ' ').toUpperCase() }));
};
const PriorityBadge = ({ priority }) => {
    const colors = {
        [TicketPriority.LOW]: 'bg-gray-100 text-gray-800',
        [TicketPriority.MEDIUM]: 'bg-blue-100 text-blue-800',
        [TicketPriority.HIGH]: 'bg-yellow-100 text-yellow-800',
        [TicketPriority.URGENT]: 'bg-orange-100 text-orange-800',
        [TicketPriority.CRITICAL]: 'bg-red-500 text-white'
    };
    return (_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`, children: priority.toUpperCase() }));
};
const CommentItem = ({ comment, _____canViewInternal }) => {
    const visibilityColors = {
        public: 'bg-green-100 text-green-800',
        internal: 'bg-yellow-100 text-yellow-800',
        private: 'bg-red-100 text-red-800'
    };
    return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "font-medium text-gray-900", children: comment.author }), _jsx("span", { className: "text-sm text-gray-500", children: comment.authorType }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${visibilityColors[comment.visibility]}`, children: comment.visibility.toUpperCase() })] }), _jsx("span", { className: "text-sm text-gray-500", children: comment.createdAt.toLocaleString() })] }), _jsx("p", { className: "text-gray-700 whitespace-pre-wrap", children: comment.content }), comment.attachments.length > 0 && (_jsxs("div", { className: "mt-2 text-sm text-blue-600", children: [comment.attachments.length, " attachment", comment.attachments.length !== 1 ? 's' : ''] }))] }));
};
const AttachmentItem = ({ attachment }) => {
    return (_jsxs("div", { className: "flex items-center justify-between p-2 bg-white rounded border", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("svg", { className: "h-4 w-4 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" }) }), _jsx("span", { className: "text-sm font-medium truncate", children: attachment.filename })] }), _jsxs("span", { className: "text-xs text-gray-500", children: [Math.round(attachment.size / 1024), "KB"] })] }));
};
// Modal Components (simplified implementations)
const StatusUpdateModal = ({ currentStatus, onStatusUpdate, onClose }) => {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-md", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Update Status" }) }), _jsx("div", { className: "p-6", children: _jsx("select", { value: selectedStatus, onChange: (e) => setSelectedStatus(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md", children: Object.values(TicketStatus).map((status) => (_jsx("option", { value: status, children: status.replace('_', ' ').toUpperCase() }, status))) }) }), _jsxs("div", { className: "px-6 py-4 border-t border-gray-200 flex justify-end space-x-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200", children: "Cancel" }), _jsx("button", { onClick: () => onStatusUpdate(selectedStatus), className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700", children: "Update Status" })] })] }) }));
};
const AssignmentModal = ({ currentAssignee, onAssign, onClose }) => {
    const [selectedAssignee, setSelectedAssignee] = useState(currentAssignee || '');
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-md", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Assign Ticket" }) }), _jsx("div", { className: "p-6", children: _jsxs("select", { value: selectedAssignee, onChange: (e) => setSelectedAssignee(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md", children: [_jsx("option", { value: "", children: "Unassigned" }), _jsx("option", { value: "agent-1", children: "Agent 1" }), _jsx("option", { value: "agent-2", children: "Agent 2" }), _jsx("option", { value: "agent-3", children: "Agent 3" }), _jsx("option", { value: "agent-4", children: "Agent 4" })] }) }), _jsxs("div", { className: "px-6 py-4 border-t border-gray-200 flex justify-end space-x-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200", children: "Cancel" }), _jsx("button", { onClick: () => onAssign(selectedAssignee), className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700", children: "Assign" })] })] }) }));
};
const EscalationModal = ({ onEscalate, onClose }) => {
    const [reason, setReason] = useState('');
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-md", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Escalate Ticket" }) }), _jsx("div", { className: "p-6", children: _jsx("textarea", { value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Reason for escalation...", className: "w-full px-3 py-2 border border-gray-300 rounded-md resize-none", rows: 3, required: true }) }), _jsxs("div", { className: "px-6 py-4 border-t border-gray-200 flex justify-end space-x-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200", children: "Cancel" }), _jsx("button", { onClick: () => reason.trim() && onEscalate(reason), disabled: !reason.trim(), className: "px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50", children: "Escalate" })] })] }) }));
};
export default TicketDetailsView;

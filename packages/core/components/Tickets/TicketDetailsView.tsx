/**
 * Epic 16 Ticket Details View
 * 
 * Comprehensive ticket detail view with comments, attachments, status updates,
 * and SLA tracking. Provides full ticket management capabilities.
 */
import React, { useState, useMemo } from 'react';
import {
  MarketplaceTicket,
  TicketComment,
  TicketStatus,
  TicketPriority,
  TicketAttachment,
  Epic16TicketIntegrationService
} from '../../services/Epic16TicketIntegrationService';
}
interface TicketDetailsViewProps {
  ticket: MarketplaceTicket;
  ticketService: Epic16TicketIntegrationService;
  userId: string;
  userRole: 'user' | 'agent' | 'admin';
  onClose?: () => void;
  onTicketUpdate?: (ticket: MarketplaceTicket) => void;
  interface CommentFormData {
  content: string;
  visibility: 'public' | 'internal' | 'private';
  attachments: File;
  export const TicketDetailsView: React.FC<TicketDetailsViewProps> = ({,)
  ticket,
  ticketService,
  userId,
  userRole,
  onClose,
  onTicketUpdate
}
}) => {
  const [currentTicket, setCurrentTicket] = useState<MarketplaceTicket>(ticket);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentForm, setCommentForm] = useState<CommentFormData>({)
  content: '',
  visibility: 'public',
  attachments: [],
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
    return userRole === 'admin' || userRole === 'agent'
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
  resolutionTimeRemaining: Math.max(0, resolutionTimeRemaining),
};
  }, [currentTicket]);
  // Format time remaining
  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;}
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;}
    } else {
      return `${minutes}m`;}
  };
  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!commentForm.content.trim()) return;
  setLoading(true);
  setError(null);
  try {
  const newComment = await ticketService.addComment(currentTicket.id, {)
  content: commentForm.content,
  author: userId,
  authorType: userRole === 'user' ? 'user' : 'agent',
  visibility: commentForm.visibility,
  attachments: [], // Simplified - would handle file uploads,
  mentions: [],
});
      if (newComment) {
  const updatedTicket = {
  ...currentTicket,
  comments: [...currentTicket.comments, newComment],
  updatedAt: new Date(),
};
        setCurrentTicket(updatedTicket);
        onTicketUpdate?.(updatedTicket);
        // Reset form
        setCommentForm({)
  content: '',
  visibility: 'public',
  attachments: [],
});
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to add comment');
} finally {
      setLoading(false);
  };
  // Handle status update
  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTicket = await ticketService.updateTicketStatus(currentTicket.id, newStatus, userId);
      if (updatedTicket) {
        setCurrentTicket(updatedTicket);
        onTicketUpdate?.(updatedTicket);
        setShowStatusUpdate(false);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to update status');
} finally {
      setLoading(false);
  };
  // Handle assignment
  const handleAssignment = async (assigneeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTicket = await ticketService.assignTicket(currentTicket.id, assigneeId, userId);
      if (updatedTicket) {
        setCurrentTicket(updatedTicket);
        onTicketUpdate?.(updatedTicket);
        setShowAssignment(false);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to assign ticket');
} finally {
      setLoading(false);
  };
  // Handle escalation
  const handleEscalation = async (reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTicket = await ticketService.escalateTicket(currentTicket.id, reason, userId);
      if (updatedTicket) {
        setCurrentTicket(updatedTicket);
        onTicketUpdate?.(updatedTicket);
        setShowEscalation(false);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to escalate ticket');
} finally {
      setLoading(false);
  };
  // Filter comments based on visibility permissions
  const visibleComments = useMemo(() => {
    return currentTicket.comments.filter(comment => {)
  if (comment.visibility === 'public') return true;
      if (comment.visibility === 'internal' && canViewInternal) return true;
      if (comment.visibility === 'private' && (comment.author === userId || userRole === 'admin')) return true;
      return false;
    });
  }, [currentTicket.comments, canViewInternal, userId, userRole]);
  return;
    <div className="ticket-details-view h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-sm font-medium text-blue-600">#{currentTicket.id.split('-').pop()}</span>
              <StatusBadge status={currentTicket.status} />
              <PriorityBadge priority={currentTicket.priority} />
              {slaStatus.responseOverdue && ()
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                  RESPONSE OVERDUE
                </span>
              )}
              {slaStatus.resolutionOverdue && ()
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                  RESOLUTION OVERDUE
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{currentTicket.title}</h1>
            <p className="text-gray-600">{currentTicket.description}</p>
            <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
              <span>Type: {currentTicket.type.replace('_', ' ')}</span>
              <span>Category: {currentTicket.category}</span>
              {currentTicket.assignedTo && <span>Assigned: {currentTicket.assignedTo}</span>}
              <span>Created: {currentTicket.createdAt.toLocaleDateString()}</span>
              <span>Updated: {currentTicket.updatedAt.toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {canModify && ()
              <>
                <button
                  onClick={() => setShowStatusUpdate(true)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Update Status
                </button>
                <button
                  onClick={() => setShowAssignment(true)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Assign
                </button>
                <button
                  onClick={() => setShowEscalation(true)}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Escalate
                </button>
              </>
            )}
            {onClose && ()
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* SLA Status */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Response SLA</span>
              <span className={`text-xs font-medium ${
  slaStatus.responseOverdue ? 'text-red-600' :,
  slaStatus.responseWarning ? 'text-yellow-600' : 'text-green-600',
}`}>
                {currentTicket.sla.responseTime.actual 
                  ? `Responded in ${currentTicket.sla.responseTime.actual}m`}
                  : slaStatus.responseOverdue 
                    ? 'OVERDUE' 
                    : formatTimeRemaining(slaStatus.responseTimeRemaining)
              </span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Resolution SLA</span>
              <span className={`text-xs font-medium ${
  slaStatus.resolutionOverdue ? 'text-red-600' :,
  slaStatus.resolutionWarning ? 'text-yellow-600' : 'text-green-600',
}`}>
                {currentTicket.sla.resolutionTime.actual 
                  ? `Resolved in ${Math.round(currentTicket.sla.resolutionTime.actual / 60)}h`}
                  : slaStatus.resolutionOverdue 
                    ? 'OVERDUE' 
                    : formatTimeRemaining(slaStatus.resolutionTimeRemaining)
              </span>
            </div>
          </div>
        </div>
        {error && ()
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content - Comments */}
        <div className="flex-1 flex flex-col">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Comments ({visibleComments.length})
            </h2>
            <div className="space-y-4">
              {visibleComments.map((comment) => ()
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  canViewInternal={canViewInternal}
                />
              ))}
              {visibleComments.length === 0 && ()
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="mt-2 text-sm">No comments yet</p>
                </div>
              )}
            </div>
          </div>
          {/* Comment Form */}
          <div className="border-t border-gray-200 p-6">
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div>
                <textarea
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {canViewInternal && ()
                    <div>
                      <select
                        value={commentForm.visibility}
                        onChange={(e) => setCommentForm({ ...commentForm, visibility: e.target.value as any })}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="public">Public</option>
                        <option value="internal">Internal</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || !commentForm.content.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>
        {/* Sidebar - Metadata and Actions */}
        <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
          {/* Labels */}
          {currentTicket.labels.length > 0 && ()
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Labels</h3>
              <div className="flex flex-wrap gap-2">
                {currentTicket.labels.map((label) => ()
                  <span key={label} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Attachments */}
          {currentTicket.attachments.length > 0 && ()
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
              <div className="space-y-2">
                {currentTicket.attachments.map((attachment) => ()
                  <AttachmentItem key={attachment.id} attachment={attachment} />
                ))}
              </div>
            </div>
          )}
          {/* External Integrations */}
          {currentTicket.externalIntegrations.length > 0 && ()
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">External Links</h3>
              <div className="space-y-2">
                {currentTicket.externalIntegrations.map((integration) => ()
                  <div key={integration.system} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-sm font-medium">{integration.system}</span>
                    <span className={`px-2 py-1 text-xs rounded ${
  integration.status === 'synced' ? 'bg-green-100 text-green-800' :,
  integration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :,
  'bg-red-100 text-red-800'
}`}>
                      {integration.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Status Update Modal */}
      {showStatusUpdate && ()
        <StatusUpdateModal
          currentStatus={currentTicket.status}
          onStatusUpdate={handleStatusUpdate}
          onClose={() => setShowStatusUpdate(false)}
        />
      )}
      {/* Assignment Modal */}
      {showAssignment && ()
        <AssignmentModal
          currentAssignee={currentTicket.assignedTo}
          onAssign={handleAssignment}
          onClose={() => setShowAssignment(false)}
        />
      )}
      {/* Escalation Modal */}
      {showEscalation && ()
        <EscalationModal
          onEscalate={handleEscalation}
          onClose={() => setShowEscalation(false)}
        />
      )}
    </div>
  );
};

// Helper Components
const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
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
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>}
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};
const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  const colors = {
  [TicketPriority.LOW]: 'bg-gray-100 text-gray-800',
  [TicketPriority.MEDIUM]: 'bg-blue-100 text-blue-800',
  [TicketPriority.HIGH]: 'bg-yellow-100 text-yellow-800',
  [TicketPriority.URGENT]: 'bg-orange-100 text-orange-800',
  [TicketPriority.CRITICAL]: 'bg-red-500 text-white',
};
  return;
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>}
      {priority.toUpperCase()}
    </span>
  );
};
const CommentItem: React.FC<{ comment: TicketComment; _canViewInternal: boolean }> = ({ comment, canViewInternal }) => {
  const visibilityColors = {
  public: 'bg-green-100 text-green-800',
  internal: 'bg-yellow-100 text-yellow-800',
  private: 'bg-red-100 text-red-800',
};
  return;
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{comment.author}</span>
          <span className="text-sm text-gray-500">{comment.authorType}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${visibilityColors[comment.visibility]}`}>}
            {comment.visibility.toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-gray-500">{comment.createdAt.toLocaleString()}</span>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
      {comment.attachments.length > 0 && ()
        <div className="mt-2 text-sm text-blue-600">
          {comment.attachments.length} attachment{comment.attachments.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
const AttachmentItem: React.FC<{ attachment: TicketAttachment }> = ({ attachment }) => {
  return;
    <div className="flex items-center justify-between p-2 bg-white rounded border">
      <div className="flex items-center space-x-2">
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
        <span className="text-sm font-medium truncate">{attachment.filename}</span>
      </div>
      <span className="text-xs text-gray-500">{Math.round(attachment.size / 1024)}KB</span>
    </div>
  );
};

// Modal Components (simplified implementations)
const StatusUpdateModal: React.FC<{,
  currentStatus: TicketStatus;
  onStatusUpdate: (status: TicketStatus) => void;
  onClose: () => void;
}> = ({ currentStatus, onStatusUpdate, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  return;
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Update Status</h3>
        </div>
        <div className="p-6">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {Object.values(TicketStatus).map((status) => ()
              <option key={status} value={status}>
                {status.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onStatusUpdate(selectedStatus)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};
const AssignmentModal: React.FC<{
  currentAssignee?: string;
  onAssign: (assigneeId: string) => void;
  onClose: () => void;
}> = ({ currentAssignee, onAssign, onClose }) => {
  const [selectedAssignee, setSelectedAssignee] = useState(currentAssignee || '');
  return;
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Assign Ticket</h3>
        </div>
        <div className="p-6">
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Unassigned</option>
            <option value="agent-1">Agent 1</option>
            <option value="agent-2">Agent 2</option>
            <option value="agent-3">Agent 3</option>
            <option value="agent-4">Agent 4</option>
          </select>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onAssign(selectedAssignee)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};
const EscalationModal: React.FC<{,
  onEscalate: (reason: string) => void;
  onClose: () => void;
}> = ({ onEscalate, onClose }) => {
  const [reason, setReason] = useState('');
  return;
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Escalate Ticket</h3>
        </div>
        <div className="p-6">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for escalation..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
            rows={3}
            required
          />
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onEscalate(reason)}
            disabled={!reason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Escalate
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsView;
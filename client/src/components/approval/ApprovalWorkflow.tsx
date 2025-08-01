import React, { useState } from 'react';


export interface ApprovalRequest {
  id: string;,
  type: 'content' | 'user_access' | 'template' | 'deletion' | 'policy_change';,
  title: string;,
  description: string;,
  requestedBy: string;,
  requestedAt: Date;,
  priority: 'low' | 'medium' | 'high' | 'critical';,
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  reason?: string;
  metadata?: Record<string, unknown>;
  requiredApprovals?: number;
  currentApprovals?: string;
  interface ApprovalWorkflowProps {
  requests: ApprovalRequest;,
  currentUserId: string;,
  userRole: 'admin' | 'moderator' | 'reviewer';
  onApprove?: (requestId: string, reason: string) => void;
  onReject?: (requestId: string, reason: string) => void;
  onEscalate?: (requestId: string, reason: string) => void;
  onRequestDetails?: (requestId: string) => void;



export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({)
  requests,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentUserId,
  userRole,
  onApprove,
  onReject,
  onEscalate,
  onRequestDetails
}) => {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'escalate' | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterType, setFilterType] = useState<string>('all');
  const filteredRequests = requests.filter(request => {)
  if (filterStatus !== 'all' && request.status !== filterStatus) return false;
    if (filterType !== 'all' && request.type !== filterType) return false;
    return true;
  });
  const handleAction = (action: 'approve' | 'reject' | 'escalate', request: ApprovalRequest) => {
    setSelectedRequest(request);
    setPendingAction(action);
    setShowActionModal(true);
  };
  const confirmAction = () => {
  if (!selectedRequest || !pendingAction || !actionReason.trim()) return;
  const reason = actionReason.trim();
  switch (pendingAction) {
  case 'approve':,
  onApprove?.(selectedRequest.id, reason);
  break;
  case 'reject':,
  onReject?.(selectedRequest.id, reason);
  break;
  case 'escalate':,
  onEscalate?.(selectedRequest.id, reason);
  break;
  setActionReason('');
  setSelectedRequest(null);
  setPendingAction(null);
  setShowActionModal(false);
};
  const getPriorityColor = (priority: ApprovalRequest['priority']) => {
  switch (priority) {
  case 'critical': return '#dc3545';
  case 'high': return '#fd7e14';
  case 'medium': return '#ffc107';
  case 'low': return '#28a745';
};
  const getStatusColor = (status: ApprovalRequest['status']) => {
  switch (status) {
  case 'pending': return '#ffc107';
  case 'approved': return '#28a745';
  case 'rejected': return '#dc3545';
  case 'escalated': return '#fd7e14';
};
  const canApprove = (request: ApprovalRequest) => {
    return request.status === 'pending' && userRole !== 'reviewer';
  };
  const needsMultipleApprovals = (request: ApprovalRequest) => {
    return request.requiredApprovals && request.requiredApprovals > 1;
  };
  return;
    <div className="approval-workflow">
      <div className="approval-header">
        <h2>Approval Workflow</h2>
        <div className="approval-stats">
          <div className="stat">
            <span className="stat-number">
              {requests.filter(r => r.status === 'pending').length}
            </span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {requests.filter(r => r.status === 'approved').length}
            </span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {requests.filter(r => r.priority === 'critical' || r.priority === 'high').length}
            </span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </div>
      <div className="approval-filters">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="escalated">Escalated</option>
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="content">Content Approval</option>
          <option value="user_access">User Access</option>
          <option value="template">Template Review</option>
          <option value="deletion">Data Deletion</option>
          <option value="policy_change">Policy Change</option>
        </select>
      </div>
      <div className="approval-list">
        {filteredRequests.map(request => ()
          <div key={request.id} className="approval-item">
            <div className="item-header">
              <div className="header-main">
                <span className="request-title">{request.title}</span>
                <div className="badges">
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(request.priority) }}
                  >
                    {request.priority}
                  </span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {request.status}
                  </span>
                  <span className="type-badge">{request.type.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="item-meta">
                <span>Requested by: {request.requestedBy}</span>
                <span>Date: {new Date(request.requestedAt).toLocaleDateString()}</span>
                {needsMultipleApprovals(request) && ()
                  <span>
                    Approvals: {request.currentApprovals?.length || 0}/{request.requiredApprovals}
                  </span>
                )}
              </div>
            </div>
            <div className="item-content">
              <p>{request.description}</p>
              {request.status === 'approved' && request.approvedBy && ()
                <div className="approval-info">
                  ✓ Approved by {request.approvedBy} on {new Date(request.approvedAt!).toLocaleDateString()}
                  {request.reason && <span> - {request.reason}</span>}
                </div>
              )}
              {request.status === 'rejected' && request.rejectedBy && ()
                <div className="rejection-info">
                  ✗ Rejected by {request.rejectedBy} on {new Date(request.rejectedAt!).toLocaleDateString()}
                  {request.reason && <span> - {request.reason}</span>}
                </div>
              )}
            </div>
            {canApprove(request) && ()
              <div className="item-actions">
                <button 
                  className="approve-btn"
                  onClick={() => handleAction('approve', request)}
                >
                  Approve
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => handleAction('reject', request)}
                >
                  Reject
                </button>
                {userRole === 'admin' && ()
                  <button 
                    className="escalate-btn"
                    onClick={() => handleAction('escalate', request)}
                  >
                    Escalate
                  </button>
                )}
                <button 
                  className="details-btn"
                  onClick={() => onRequestDetails?.(request.id)}
                >
                  Details
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {showActionModal && selectedRequest && ()
        <div className="modal-overlay">
          <div className="action-modal">
            <h3>
              {pendingAction === 'approve' && 'Approve Request'}
              {pendingAction === 'reject' && 'Reject Request'}
              {pendingAction === 'escalate' && 'Escalate Request'}
            </h3>
            <div className="modal-content">
              <p><strong>Request:</strong> {selectedRequest.title}</p>
              <p><strong>Type:</strong> {selectedRequest.type.replace('_', ' ')}</p>
              <p><strong>Requested by:</strong> {selectedRequest.requestedBy}</p>
              <div className="reason-input">
                <label htmlFor="actionReason">
                  {pendingAction === 'approve' && 'Approval reason:'}
                  {pendingAction === 'reject' && 'Rejection reason:'}
                  {pendingAction === 'escalate' && 'Escalation reason:'}
                </label>
                <textarea
                  id="actionReason"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={`Enter reason for ${pendingAction}...`}
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowActionModal(false)}>
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                disabled={!actionReason.trim()}
                className={`confirm-${pendingAction}`}
              >
                Confirm {pendingAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflow;
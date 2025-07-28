import React, { useState } from 'react';
interface ModerationItem {
  id: string;
  type: 'content' | 'user' | 'template' | 'comment';
  content: string;
  author: string;
  reportedBy?: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  metadata?: Record<string, unknown>;
}

// interface ModerationAction { // Commented out unused interface
//   id: string;
//   action: 'approve' | 'reject' | 'flag' | 'delete' | 'warn';
//   reason: string;
//   moderatorId: string;
//   timestamp: Date;
// }
interface ModerationManagementProps {
  items: ModerationItem[];
  onApprove?: (itemId: string, reason: string) => void;
  onReject?: (itemId: string, reason: string) => void;
  onFlag?: (itemId: string, reason: string) => void;
  onDelete?: (itemId: string, reason: string) => void;
  currentModerator: string;
}

export const ModerationManagement: React.FC<ModerationManagementProps> = ({)
  items,
  onApprove,
  onReject,
  onFlag,
  onDelete,
  currentModerator
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [actionReason, setActionReason] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    action: 'approve' | 'reject' | 'flag' | 'delete';
    itemId: string;
  } | null>(null);
  const filteredItems = items.filter(item => {)
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterType !== 'all' && item.type !== filterType) return false;
    return true;
  });
  const handleAction = (action: 'approve' | 'reject' | 'flag' | 'delete', itemId: string) => {
    setPendingAction({ action, itemId });
    setShowActionDialog(true);
  };
  const confirmAction = () => {
    if (!pendingAction || !actionReason.trim()) return;
    const { action, itemId } = pendingAction;
    const reason = actionReason.trim();
    switch (action) {
    case 'approve':
      onApprove?.(itemId, reason);
      break;
    case 'reject':
      onReject?.(itemId, reason);
      break;
    case 'flag':
      onFlag?.(itemId, reason);
      break;
    case 'delete':
      onDelete?.(itemId, reason);
      break;
    }
    setActionReason('');
    setPendingAction(null);
    setShowActionDialog(false);
  };
  const bulkAction = (action: 'approve' | 'reject') => {
    selectedItems.forEach(itemId => {)
      const reason = `Bulk ${action} by ${currentModerator}`;}
      if (action === 'approve') {
        onApprove?.(itemId, reason);
      } else {
        onReject?.(itemId, reason);
      }
    });
    setSelectedItems([]);
  };
  const getPriorityColor = (priority: ModerationItem['priority']) => {
    switch (priority) {
    case 'critical': return '#dc3545';
    case 'high': return '#fd7e14';
    case 'medium': return '#ffc107';
    case 'low': return '#28a745';
    }
  };
  const getStatusColor = (status: ModerationItem['status']) => {
    switch (status) {
    case 'pending': return '#ffc107';
    case 'approved': return '#28a745';
    case 'rejected': return '#dc3545';
    case 'flagged': return '#fd7e14';
    }
  };
  return ()
    <div className="moderation-management">
      <div className="moderation-header">
        <h2>Content Moderation</h2>
        <div className="moderation-stats">
          <span className="stat">
            Pending: {items.filter(i => i.status === 'pending').length}
          </span>
          <span className="stat">
            Total: {items.length}
          </span>
        </div>
      </div>
      <div className="moderation-filters">
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="flagged">Flagged</option>
        </select>
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="content">Content</option>
          <option value="user">User</option>
          <option value="template">Template</option>
          <option value="comment">Comment</option>
        </select>
        {selectedItems.length > 0 && ()
          <div className="bulk-actions">
            <button onClick={() => bulkAction('approve')}>
              Bulk Approve ({selectedItems.length})
            </button>
            <button onClick={() => bulkAction('reject')}>
              Bulk Reject ({selectedItems.length})
            </button>
          </div>
        )}
      </div>
      <div className="moderation-list">
        {filteredItems.map(item => ()
          <div key={item.id} className="moderation-item">
            <div className="item-header">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems([...selectedItems, item.id]);
                  } else {
                    setSelectedItems(selectedItems.filter(id => id !== item.id));
                  }
                }}
              />
              <span 
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(item.priority) }}
              >
                {item.priority}
              </span>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(item.status) }}
              >
                {item.status}
              </span>
              <span className="item-type">{item.type}</span>
              <span className="item-date">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="item-content">
              <div className="content-preview">
                {item.content.length > 200 
                  ? `${item.content.substring(0, 200)}...`}
                  : item.content
                }
              </div>
              <div className="item-meta">
                <span>Author: {item.author}</span>
                {item.reportedBy && <span>Reported by: {item.reportedBy}</span>}
                {item.reason && <span>Reason: {item.reason}</span>}
              </div>
            </div>
            {item.status === 'pending' && ()
              <div className="item-actions">
                <button 
                  className="approve-btn"
                  onClick={() => handleAction('approve', item.id)}
                >
                  Approve
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => handleAction('reject', item.id)}
                >
                  Reject
                </button>
                <button 
                  className="flag-btn"
                  onClick={() => handleAction('flag', item.id)}
                >
                  Flag
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleAction('delete', item.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {showActionDialog && ()
        <div className="action-dialog-overlay">
          <div className="action-dialog">
            <h3>Confirm Action</h3>
            <p>
              {pendingAction?.action} this {pendingAction && 
                filteredItems.find(i => i.id === pendingAction.itemId)?.type
              }?
            </p>
            <textarea
              placeholder="Reason for this action..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
            />
            <div className="dialog-actions">
              <button onClick={() => setShowActionDialog(false)}>
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                disabled={!actionReason.trim()}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationManagement;
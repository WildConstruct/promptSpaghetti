import React, { useState, useMemo } from 'react';
import './ModerationQueueManager.css';
interface ModerationItem {
  id: string;
  type: 'content' | 'user' | 'template' | 'comment' | 'report';
  content: string;
  author: string;
  reportedBy?: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  tags: string[];
  category: string;
  riskScore: number;
  automatedFlags: string[];
  source: 'user_report' | 'automated_detection' | 'proactive_review';
  metadata?: Record<string, unknown>;
}
interface QueueFilters {
  status: string;
  type: string;
  priority: string;
  source: string;
  assignee: string;
  dateRange: string;
  riskLevel: string;
  searchTerm: string;
}
interface ModerationQueueManagerProps {
  items: ModerationItem[];
  moderators: Array<{ id: string; name: string; online: boolean }>;
  onItemAction: (itemId: string, action: string, data: Record<string, unknown>) => void;
  onBulkAction: (itemIds: string[], action: string, data: Record<string, unknown>) => void;
  currentUserId: string;
}

export const ModerationQueueManager: React.FC<ModerationQueueManagerProps> = ({)
  items,
  moderators,
  onItemAction,
  onBulkAction,
  currentUserId
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filters, setFilters] = useState<QueueFilters>({)
    status: 'pending',
    type: 'all',
    priority: 'all',
    source: 'all',
    assignee: 'unassigned',
    dateRange: 'today',
    riskLevel: 'all',
    searchTerm: '',
  });
  const [sortBy, setSortBy] = useState<string>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'detailed'>('list');
  const [/*_showBulkActions*/, setShowBulkActions] = useState(false); // Commented out unused variable
  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter(item => {)
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.type !== 'all' && item.type !== filters.type) return false;
      if (filters.priority !== 'all' && item.priority !== filters.priority) return false;
      if (filters.source !== 'all' && item.source !== filters.source) return false;
      if (filters.riskLevel !== 'all') {
        const riskThreshold = filters.riskLevel === 'high' ? 70 : ;
          filters.riskLevel === 'medium' ? 40 : 10;
        if (item.riskScore < riskThreshold) return false;
      }
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return item.content.toLowerCase().includes(searchLower) ||
               item.author.toLowerCase().includes(searchLower) ||
               item.tags.some(tag => tag.toLowerCase().includes(searchLower));
      }
      return true;
    });
    return filtered.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
      case 'priority': {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      }
      case 'date':
        compareValue = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case 'risk':
        compareValue = a.riskScore - b.riskScore;
        break;
      case 'type':
        compareValue = a.type.localeCompare(b.type);
        break;
      default:
        return 0;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  }, [items, filters, sortBy, sortOrder]);
  const handleSelectAll = () => {
    if (selectedItems.length === filteredAndSortedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredAndSortedItems.map(item => item.id));
    }
  };
  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev =>)
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  const handleBulkAction = (action: string, data?: unknown) => {
    if (selectedItems.length === 0) return;
    onBulkAction(selectedItems, action, data);
    setSelectedItems([]);
    setShowBulkActions(false);
  };
  const getRiskColor = (score: number) => {
    if (score >= 70) return '#dc3545';
    if (score >= 40) return '#ffc107';
    return '#28a745';
  };
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
    case 'critical': return '🔥';
    case 'high': return '⚡';
    case 'medium': return '⚠️';
    case 'low': return '🔵';
    default: return '';
    }
  };
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;}
    return `${Math.floor(diffHours / 24)}d ago`;}
  };
  return ()
    <div className="moderation-queue-manager">
      <div className="queue-header">
        <div className="queue-title">
          <h3>Moderation Queue</h3>
          <span className="queue-count">{filteredAndSortedItems.length} items</span>
        </div>
        <div className="queue-controls">
          <div className="view-modes">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button 
              className={`view-btn ${viewMode === 'detailed' ? 'active' : ''}`}
              onClick={() => setViewMode('detailed')}
            >
              Detailed
            </button>
          </div>
          <div className="sort-controls">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="priority">Priority</option>
              <option value="date">Date</option>
              <option value="risk">Risk Score</option>
              <option value="type">Type</option>
            </select>
            <button 
              className="sort-order-btn"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
      <div className="queue-filters">
        <div className="filter-row">
          <select 
            value={filters.status} 
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="escalated">Escalated</option>
            <option value="flagged">Flagged</option>
          </select>
          <select 
            value={filters.type} 
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="all">All Types</option>
            <option value="content">Content</option>
            <option value="user">User</option>
            <option value="template">Template</option>
            <option value="comment">Comment</option>
            <option value="report">Report</option>
          </select>
          <select 
            value={filters.priority} 
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select 
            value={filters.source} 
            onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
          >
            <option value="all">All Sources</option>
            <option value="user_report">User Report</option>
            <option value="automated_detection">Auto-detected</option>
            <option value="proactive_review">Proactive Review</option>
          </select>
          <input
            type="text"
            placeholder="Search content, author, tags..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="search-input"
          />
        </div>
        <div className="filter-row">
          <select 
            value={filters.riskLevel} 
            onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk (70+)</option>
            <option value="medium">Medium Risk (40-69)</option>
            <option value="low">Low Risk (&lt;40)</option>
          </select>
          <select 
            value={filters.assignee} 
            onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
          >
            <option value="all">All Assignments</option>
            <option value="unassigned">Unassigned</option>
            <option value="me">Assigned to Me</option>
            {moderators.map(mod => ()
              <option key={mod.id} value={mod.id}>{mod.name}</option>
            ))}
          </select>
          <select 
            value={filters.dateRange} 
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button className="clear-filters-btn" onClick={() => setFilters({)
            status: 'pending', type: 'all', priority: 'all', source: 'all',
            assignee: 'unassigned', dateRange: 'today', riskLevel: 'all', searchTerm: ''
          })}>
            Clear Filters
          </button>
        </div>
      </div>
      {selectedItems.length > 0 && ()
        <div className="bulk-actions-bar">
          <div className="selection-info">
            <input
              type="checkbox"
              checked={selectedItems.length === filteredAndSortedItems.length}
              onChange={handleSelectAll}
            />
            <span>{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected</span>
          </div>
          <div className="bulk-actions">
            <button onClick={() => handleBulkAction('approve')}>
              Bulk Approve
            </button>
            <button onClick={() => handleBulkAction('reject')}>
              Bulk Reject
            </button>
            <button onClick={() => handleBulkAction('assign')}>
              Bulk Assign
            </button>
            <button onClick={() => handleBulkAction('escalate')}>
              Bulk Escalate
            </button>
            <button onClick={() => setSelectedItems([])}>
              Clear Selection
            </button>
          </div>
        </div>
      )}
      <div className={`queue-items ${viewMode}`}>}
        {filteredAndSortedItems.map(item => ()
          <div key={item.id} className={`queue-item ${item.priority}`}>}
            <div className="item-select">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleItemSelect(item.id)}
              />
            </div>
            <div className="item-priority">
              <span className="priority-icon">{getPriorityIcon(item.priority)}</span>
              <span className="priority-text">{item.priority}</span>
            </div>
            <div className="item-risk">
              <div 
                className="risk-score"
                style={{ backgroundColor: getRiskColor(item.riskScore) }}
              >
                {item.riskScore}
              </div>
            </div>
            <div className="item-content">
              <div className="content-header">
                <span className="item-type">{item.type}</span>
                <span className="item-source">{item.source.replace('_', ' ')}</span>
                <span className="item-time">{formatTimeAgo(item.createdAt)}</span>
              </div>
              <div className="content-preview">
                {item.content.length > 150 
                  ? `${item.content.substring(0, 150)}...`}
                  : item.content
                }
              </div>
              <div className="content-meta">
                <span className="author">by {item.author}</span>
                {item.reportedBy && <span className="reporter">reported by {item.reportedBy}</span>}
                {item.automatedFlags.length > 0 && ()
                  <span className="flags">
                    Flags: {item.automatedFlags.join(', ')}
                  </span>
                )}
              </div>
              {item.tags.length > 0 && ()
                <div className="item-tags">
                  {item.tags.map(tag => ()
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="item-actions">
              <button 
                className="action-btn approve"
                onClick={() => onItemAction(item.id, 'approve', { reason: 'Quick approve' })}
              >
                ✓
              </button>
              <button 
                className="action-btn reject"
                onClick={() => onItemAction(item.id, 'reject', { reason: 'Quick reject' })}
              >
                ✗
              </button>
              <button 
                className="action-btn escalate"
                onClick={() => onItemAction(item.id, 'escalate', {})}
              >
                ↑
              </button>
              <button 
                className="action-btn assign"
                onClick={() => onItemAction(item.id, 'assign', { assignee: currentUserId })}
              >
                @
              </button>
              <button 
                className="action-btn details"
                onClick={() => onItemAction(item.id, 'details', {})}
              >
                ···
              </button>
            </div>
          </div>
        ))}
      </div>
      {filteredAndSortedItems.length === 0 && ()
        <div className="empty-queue">
          <div className="empty-icon">📭</div>
          <h3>Queue is empty</h3>
          <p>No items match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default ModerationQueueManager;
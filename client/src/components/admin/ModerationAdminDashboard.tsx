import React, { useState, useEffect } from 'react';
import { ModerationManagement } from '../moderation/ModerationManagement';
import { ApprovalWorkflow } from '../approval/ApprovalWorkflow';
import './ModerationAdminDashboard.css';
interface ModerationStats {
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
  totalToday: number;
  averageProcessingTime: number;
  moderatorCount: number;
  queueBacklog: number;
}
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
interface ApprovalRequest {
  id: string;
  type: 'content' | 'user_access' | 'template' | 'deletion' | 'policy_change';
  title: string;
  description: string;
  requestedBy: string;
  requestedAt: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  reason?: string;
  metadata?: Record<string, unknown>;
  requiredApprovals?: number;
  currentApprovals?: string[];
}

export const ModerationAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'approvals' | 'reports'>('overview');
  const [stats, setStats] = useState<ModerationStats>({)
    pending: 0,
    approved: 0,
    rejected: 0,
    flagged: 0,
    totalToday: 0,
    averageProcessingTime: 0,
    moderatorCount: 0,
    queueBacklog: 0,
  });
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchModerationData();
  }, []);
  const fetchModerationData = async () => {
    try {
      setIsLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock data for demonstration
      setStats({)
        pending: 23,
        approved: 156,
        rejected: 12,
        flagged: 8,
        totalToday: 45,
        averageProcessingTime: 12.5,
        moderatorCount: 6,
        queueBacklog: 31,
      });
      setModerationItems([)
        {
          id: '1',
          type: 'content',
          content: 'This is a sample content that needs moderation review',
          author: 'user123',
          reportedBy: 'reporter456',
          status: 'pending',
          priority: 'high',
          createdAt: new Date(),
          metadata: { category: 'user_generated' }
        },
        {
          id: '2',
          type: 'comment',
          content: 'Sample comment for moderation',
          author: 'commenter789',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date(),
          metadata: { post_id: 'post123' }
        }
      ]);
      setApprovalRequests([)
        {
          id: '1',
          type: 'content',
          title: 'New Template Submission',
          description: 'Review new template submission for marketplace',
          requestedBy: 'creator123',
          requestedAt: new Date(),
          priority: 'medium',
          status: 'pending',
          requiredApprovals: 2,
          currentApprovals: ['moderator1'],
        },
        {
          id: '2',
          type: 'user_access',
          title: 'Premium Access Request',
          description: 'User requesting premium access privileges',
          requestedBy: 'user456',
          requestedAt: new Date(),
          priority: 'low',
          status: 'pending',
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch moderation data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleModerationAction = (itemId: string, action: 'approve' | 'reject' | 'flag' | 'delete', reason: string) => {
    setModerationItems(prev => )
      prev.map(item => )
        item.id === itemId 
          ? { 
            ...item, 
            status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged',
            reviewedBy: 'current-moderator',
            reviewedAt: new Date(),
            reason
          }
          : item
    );
  };
  const handleApprovalAction = (requestId: string, action: 'approve' | 'reject' | 'escalate', reason: string) => {
    setApprovalRequests(prev =>)
      prev.map(request =>)
        request.id === requestId
          ? {
            ...request,
            status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'escalated',
            approvedBy: action === 'approve' ? 'current-moderator' : undefined,
            approvedAt: action === 'approve' ? new Date() : undefined,
            rejectedBy: action === 'reject' ? 'current-moderator' : undefined,
            rejectedAt: action === 'reject' ? new Date() : undefined,
            reason
          }
          : request
    );
  };
  if (isLoading) {
    return ()
      <div className="moderation-admin-dashboard loading">
        <div className="loading-spinner">Loading moderation dashboard...</div>
      </div>
    );
  }
  return ()
    <div className="moderation-admin-dashboard">
      <div className="dashboard-header">
        <h2>Moderation & Content Review Dashboard</h2>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchModerationData}>
            Refresh Data
          </button>
        </div>
      </div>
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          Moderation Queue ({stats.pending})
        </button>
        <button 
          className={`tab ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          Approval Workflow
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports & Analytics
        </button>
      </div>
      <div className="dashboard-content">
        {activeTab === 'overview' && ()
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card pending">
                <div className="stat-number">{stats.pending}</div>
                <div className="stat-label">Pending Review</div>
              </div>
              <div className="stat-card approved">
                <div className="stat-number">{stats.approved}</div>
                <div className="stat-label">Approved Today</div>
              </div>
              <div className="stat-card rejected">
                <div className="stat-number">{stats.rejected}</div>
                <div className="stat-label">Rejected Today</div>
              </div>
              <div className="stat-card flagged">
                <div className="stat-number">{stats.flagged}</div>
                <div className="stat-label">Flagged Items</div>
              </div>
            </div>
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Queue Performance</h3>
                <div className="metric-value">
                  <span className="number">{stats.averageProcessingTime}</span>
                  <span className="unit">min avg</span>
                </div>
                <div className="metric-description">Average processing time</div>
              </div>
              <div className="metric-card">
                <h3>Team Status</h3>
                <div className="metric-value">
                  <span className="number">{stats.moderatorCount}</span>
                  <span className="unit">active</span>
                </div>
                <div className="metric-description">Moderators online</div>
              </div>
              <div className="metric-card">
                <h3>Queue Backlog</h3>
                <div className="metric-value">
                  <span className="number">{stats.queueBacklog}</span>
                  <span className="unit">items</span>
                </div>
                <div className="metric-description">Items awaiting review</div>
              </div>
            </div>
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-time">2 min ago</div>
                  <div className="activity-description">Content approved by moderator_alice</div>
                </div>
                <div className="activity-item">
                  <div className="activity-time">5 min ago</div>
                  <div className="activity-description">User comment flagged for review</div>
                </div>
                <div className="activity-item">
                  <div className="activity-time">12 min ago</div>
                  <div className="activity-description">Template submission rejected with feedback</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'queue' && ()
          <div className="queue-tab">
            <ModerationManagement
              items={moderationItems}
              onApprove={handleModerationAction}
              onReject={handleModerationAction}
              onFlag={handleModerationAction}
              onDelete={handleModerationAction}
              currentModerator="current-moderator"
            />
          </div>
        )}
        {activeTab === 'approvals' && ()
          <div className="approvals-tab">
            <ApprovalWorkflow
              requests={approvalRequests}
              currentUserId="current-moderator"
              userRole="admin"
              onApprove={handleApprovalAction}
              onReject={handleApprovalAction}
              onEscalate={handleApprovalAction}
              onRequestDetails={(id) => console.log('View details for:', id)}
            />
          </div>
        )}
        {activeTab === 'reports' && ()
          <div className="reports-tab">
            <div className="reports-grid">
              <div className="report-card">
                <h3>Moderation Metrics</h3>
                <div className="report-chart">
                  {/* Chart placeholder */}
                  <div className="chart-placeholder">
                    <div className="bar" style={{ height: '60%', backgroundColor: '#28a745' }}></div>
                    <div className="bar" style={{ height: '40%', backgroundColor: '#dc3545' }}></div>
                    <div className="bar" style={{ height: '20%', backgroundColor: '#ffc107' }}></div>
                    <div className="bar" style={{ height: '80%', backgroundColor: '#007bff' }}></div>
                  </div>
                  <div className="chart-labels">
                    <span>Approved</span>
                    <span>Rejected</span>
                    <span>Flagged</span>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
              <div className="report-card">
                <h3>Processing Time Trends</h3>
                <div className="trend-metrics">
                  <div className="trend-item">
                    <span className="trend-label">This Week:</span>
                    <span className="trend-value">11.2 min</span>
                    <span className="trend-change positive">-8%</span>
                  </div>
                  <div className="trend-item">
                    <span className="trend-label">Last Week:</span>
                    <span className="trend-value">12.2 min</span>
                  </div>
                  <div className="trend-item">
                    <span className="trend-label">Target:</span>
                    <span className="trend-value">10 min</span>
                  </div>
                </div>
              </div>
              <div className="report-card">
                <h3>Content Categories</h3>
                <div className="category-breakdown">
                  <div className="category-item">
                    <span className="category-name">User Content</span>
                    <div className="category-bar">
                      <div className="category-fill" style={{ width: '65%' }}></div>
                    </div>
                    <span className="category-count">65%</span>
                  </div>
                  <div className="category-item">
                    <span className="category-name">Comments</span>
                    <div className="category-bar">
                      <div className="category-fill" style={{ width: '25%' }}></div>
                    </div>
                    <span className="category-count">25%</span>
                  </div>
                  <div className="category-item">
                    <span className="category-name">Templates</span>
                    <div className="category-bar">
                      <div className="category-fill" style={{ width: '10%' }}></div>
                    </div>
                    <span className="category-count">10%</span>
                  </div>
                </div>
              </div>
              <div className="report-card full-width">
                <h3>Moderator Performance</h3>
                <div className="performance-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Moderator</th>
                        <th>Reviews Today</th>
                        <th>Avg Time</th>
                        <th>Accuracy</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>alice_mod</td>
                        <td>28</td>
                        <td>9.2 min</td>
                        <td>94%</td>
                        <td><span className="status online">Online</span></td>
                      </tr>
                      <tr>
                        <td>bob_reviewer</td>
                        <td>22</td>
                        <td>11.8 min</td>
                        <td>91%</td>
                        <td><span className="status online">Online</span></td>
                      </tr>
                      <tr>
                        <td>carol_admin</td>
                        <td>15</td>
                        <td>8.5 min</td>
                        <td>97%</td>
                        <td><span className="status away">Away</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationAdminDashboard;
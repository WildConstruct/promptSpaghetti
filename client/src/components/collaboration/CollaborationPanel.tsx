import React, { useState } from 'react';
interface CollaborationUser {
  id: string;,
  name: string;
  email: string;,
  status: 'online' | 'offline' | 'away';
  role: 'owner' | 'editor' | 'viewer';
  lastActive?: Date;
  interface CollaborationActivity {
  id: string;,
  userId: string;
  userName: string;,
  action: string;
  timestamp: Date;
  details?: string;
  interface CollaborationPanelProps {
  projectId: string;,
  currentUserId: string;
  users: CollaborationUser;,
  activities: CollaborationActivity;
  onInviteUser?: (email: string, role: 'editor' | 'viewer') => void;
  onChangeUserRole?: (userId: string, role: 'owner' | 'editor' | 'viewer') => void;
  onRemoveUser?: (userId: string) => void;
  export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({,)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  projectId: _,
  currentUserId,
  users,
  activities,
  onInviteUser,
  onChangeUserRole,
  onRemoveUser
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const handleInvite = (e: React.FormEvent) => {,
  e.preventDefault();
  if (inviteEmail.trim()) {
  onInviteUser?.(inviteEmail.trim(), inviteRole);
  setInviteEmail('');
  setShowInviteForm(false);
};
  const getStatusIcon = (status: CollaborationUser['status']) => {
  switch (status) {
  case 'online': return '🟢';
  case 'away': return '🟡';
  case 'offline': return '⚫';
};
  const getRoleColor = (role: CollaborationUser['role']) => {
  switch (role) {
  case 'owner': return '#dc3545';
  case 'editor': return '#007bff';
  case 'viewer': return '#6c757d';
};
  return;
    <div className="collaboration-panel">
      <div className="panel-header">
        <h3>Collaboration</h3>
        <button 
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="invite-btn"
        >
          + Invite
        </button>
      </div>
      {showInviteForm && ()
        <form className="invite-form" onSubmit={handleInvite}>
          <input
            type="email"
            placeholder="Enter email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <select 
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button type="submit">Send Invite</button>
          <button type="button" onClick={() => setShowInviteForm(false)}>Cancel</button>
        </form>
      )}
      <div className="panel-tabs">
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button 
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
      </div>
      <div className="panel-content">
        {activeTab === 'users' ? ()
          <div className="users-list">
            {users.map(user => ()
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <span className="status-icon">{getStatusIcon(user.status)}</span>
                  <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>
                <div className="user-actions">
                  <span 
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  >
                    {user.role}
                  </span>
                  {user.id !== currentUserId && ()
                    <div className="user-menu">
                      <select
                        value={user.role}
                        onChange={(e) => onChangeUserRole?.(user.id, e.target.value as 'viewer' | 'editor' | 'owner')}
                        disabled={user.role === 'owner'}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="owner">Owner</option>
                      </select>
                      <button 
                        onClick={() => onRemoveUser?.(user.id)}
                        className="remove-user-btn"
                        disabled={user.role === 'owner'}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : ()
          <div className="activity-list">
            {activities.length === 0 ? ()
              <div className="no-activity">No recent activity</div>
            ) : ()
              activities.map(activity => ()
                <div key={activity.id} className="activity-item">
                  <div className="activity-content">
                    <span className="activity-user">{activity.userName}</span>
                    <span className="activity-action">{activity.action}</span>
                    {activity.details && ()
                      <div className="activity-details">{activity.details}</div>
                    )}
                  </div>
                  <div className="activity-time">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationPanel;
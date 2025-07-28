/**
 * Epic 9.2.1 - Workspace Manager Component
 * Main workspace management interface
 */
import React, { useState, useEffect } from 'react';
import { WorkspaceList } from './WorkspaceList';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { InviteUserModal } from './InviteUserModal';
import { WorkspaceSettings } from './WorkspaceSettings';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { Workspace, WorkspaceWithMembership } from '../../types/workspace';
interface WorkspaceManagerProps {
  userId: string;
  onWorkspaceSelect?: (workspace: Workspace) => void;
  export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({,)
  userId,
  onWorkspaceSelect
}) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceWithMembership | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const {
    workspaces,
    loading,
    error,
    createWorkspace,
    updateWorkspace,
    archiveWorkspace,
    inviteUser,
    refreshWorkspaces
  } = useWorkspaces(userId);
  const handleWorkspaceSelect = (workspace: WorkspaceWithMembership) => {
    setSelectedWorkspace(workspace);
    onWorkspaceSelect?.(workspace);
  };
  const handleCreateWorkspace = async (data: { name: string; description?: string }) => {
    try {
      const newWorkspace = await createWorkspace(data);
      setSelectedWorkspace(newWorkspace);
      setShowCreateModal(false);
      onWorkspaceSelect?.(newWorkspace);
    } catch (error) {
  console.error('Failed to create workspace:', error);
};
  const handleInviteUser = async (data: { userId: string; role: string }) => {
    if (!selectedWorkspace) return;
    try {
      await inviteUser(selectedWorkspace.id, data.userId, data.role);
      setShowInviteModal(false);
      // Optionally refresh or show success message
    } catch (error) {
  console.error('Failed to invite user:', error);
};
  const handleWorkspaceUpdate = async (updates: { name?: string; description?: string }) => {
    if (!selectedWorkspace) return;
    try {
      const updatedWorkspace = await updateWorkspace(selectedWorkspace.id, updates);
      setSelectedWorkspace(updatedWorkspace);
      setShowSettings(false);
    } catch (error) {
  console.error('Failed to update workspace:', error);
};
  const handleWorkspaceArchive = async () => {
    if (!selectedWorkspace) return;
    try {
      await archiveWorkspace(selectedWorkspace.id);
      setSelectedWorkspace(null);
      setShowSettings(false);
      refreshWorkspaces();
    } catch (error) {
  console.error('Failed to archive workspace:', error);
};
  const canManageWorkspace = selectedWorkspace?.role_permissions && ;
    (selectedWorkspace.role_permissions & (1 << 2)) !== 0; // WORKSPACE_ADMIN
  const canInviteUsers = selectedWorkspace?.role_permissions && ;
    (selectedWorkspace.role_permissions & (1 << 15)) !== 0; // USER_INVITE
  return;
    <div className="workspace-manager">
      <div className="workspace-manager__header">
        <h2>Workspaces</h2>
        <button
          className="btn btn--primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Workspace
        </button>
      </div>
      {error && ()
        <div className="alert alert--error">
          <p>Error loading workspaces: {error}</p>
          <button onClick={refreshWorkspaces}>Retry</button>
        </div>
      )}
      <div className="workspace-manager__content">
        <div className="workspace-manager__sidebar">
          <WorkspaceList
            workspaces={workspaces}
            selectedWorkspace={selectedWorkspace}
            onWorkspaceSelect={handleWorkspaceSelect}
            loading={loading}
          />
        </div>
        <div className="workspace-manager__main">
          {selectedWorkspace ? ()
            <div className="workspace-detail">
              <div className="workspace-detail__header">
                <div className="workspace-detail__info">
                  <h3>{selectedWorkspace.name}</h3>
                  {selectedWorkspace.description && ()
                    <p className="workspace-detail__description">
                      {selectedWorkspace.description}
                    </p>
                  )}
                </div>
                <div className="workspace-detail__actions">
                  {canInviteUsers && ()
                    <button
                      className="btn btn--secondary"
                      onClick={() => setShowInviteModal(true)}
                    >
                      Invite Users
                    </button>
                  )}
                  {canManageWorkspace && ()
                    <button
                      className="btn btn--secondary"
                      onClick={() => setShowSettings(true)}
                    >
                      Settings
                    </button>
                  )}
                </div>
              </div>
              <div className="workspace-detail__stats">
                <div className="stat">
                  <span className="stat__label">Role</span>
                  <span className="stat__value">
                    {selectedWorkspace.owner_id === userId ? 'Owner' : 'Member'}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat__label">Joined</span>
                  <span className="stat__value">
                    {selectedWorkspace.membership?.joined_at 
                      ? new Date(selectedWorkspace.membership.joined_at).toLocaleDateString()
                      : 'N/A'
                  </span>
                </div>
              </div>
            </div>
          ) : ()
            <div className="workspace-detail--empty">
              <h3>Select a workspace</h3>
              <p>Choose a workspace from the list to view details and manage projects.</p>
            </div>
          )}
        </div>
      </div>
      {/* Modals */}
      {showCreateModal && ()
        <CreateWorkspaceModal
          onSubmit={handleCreateWorkspace}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
      {showInviteModal && selectedWorkspace && ()
        <InviteUserModal
          workspaceId={selectedWorkspace.id}
          workspaceName={selectedWorkspace.name}
          onSubmit={handleInviteUser}
          onCancel={() => setShowInviteModal(false)}
        />
      )}
      {showSettings && selectedWorkspace && ()
        <WorkspaceSettings
          workspace={selectedWorkspace}
          onUpdate={handleWorkspaceUpdate}
          onArchive={handleWorkspaceArchive}
          onCancel={() => setShowSettings(false)}
          canArchive={canManageWorkspace}
        />
      )}
    </div>
  );
};

export default WorkspaceManager;
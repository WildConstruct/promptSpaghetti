import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.1 - Workspace Manager Component
 * Main workspace management interface
 */
import { useState } from 'react';
import { WorkspaceList } from './WorkspaceList';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { InviteUserModal } from './InviteUserModal';
import { WorkspaceSettings } from './WorkspaceSettings';
import { useWorkspaces } from '../../hooks/useWorkspaces';
{
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const { workspaces, loading, error, createWorkspace, updateWorkspace, archiveWorkspace, inviteUser, refreshWorkspaces } = useWorkspaces(userId);
    const handleWorkspaceSelect = (workspace) => {
        setSelectedWorkspace(workspace);
        onWorkspaceSelect?.(workspace);
    };
    const handleCreateWorkspace = async (data) => {
        try {
            const newWorkspace = await createWorkspace(data);
            setSelectedWorkspace(newWorkspace);
            setShowCreateModal(false);
            onWorkspaceSelect?.(newWorkspace);
        }
        catch (error) {
            console.error('Failed to create workspace:', error);
        }
        ;
        const handleInviteUser = async (data) => {
            if (!selectedWorkspace)
                return;
            try {
                await inviteUser(selectedWorkspace.id, data.userId, data.role);
                setShowInviteModal(false);
                // Optionally refresh or show success message
            }
            catch (error) {
                console.error('Failed to invite user:', error);
            }
            ;
            const handleWorkspaceUpdate = async (updates) => {
                if (!selectedWorkspace)
                    return;
                try {
                    const updatedWorkspace = await updateWorkspace(selectedWorkspace.id, updates);
                    setSelectedWorkspace(updatedWorkspace);
                    setShowSettings(false);
                }
                catch (error) {
                    console.error('Failed to update workspace:', error);
                }
                ;
                const handleWorkspaceArchive = async () => {
                    if (!selectedWorkspace)
                        return;
                    try {
                        await archiveWorkspace(selectedWorkspace.id);
                        setSelectedWorkspace(null);
                        setShowSettings(false);
                        refreshWorkspaces();
                    }
                    catch (error) {
                        console.error('Failed to archive workspace:', error);
                    }
                    ;
                    const canManageWorkspace = selectedWorkspace?.role_permissions && ;
                    (selectedWorkspace.role_permissions & (1 << 2)) !== 0; // WORKSPACE_ADMIN
                    const canInviteUsers = selectedWorkspace?.role_permissions && ;
                    (selectedWorkspace.role_permissions & (1 << 15)) !== 0; // USER_INVITE
                    return;
                    _jsxs("div", { className: "workspace-manager", children: [_jsxs("div", { className: "workspace-manager__header", children: [_jsx("h2", { children: "Workspaces" }), _jsx("button", { className: "btn btn--primary", onClick: () => setShowCreateModal(true), children: "Create Workspace" })] }), error && ()
                                < div, " className=\"alert alert--error\">", _jsxs("p", { children: ["Error loading workspaces: ", error] }), _jsx("button", { onClick: refreshWorkspaces, children: "Retry" })] });
                };
            };
        };
    };
}
_jsxs("div", { className: "workspace-manager__content", children: [_jsx("div", { className: "workspace-manager__sidebar", children: _jsx(WorkspaceList, { workspaces: workspaces, selectedWorkspace: selectedWorkspace, onWorkspaceSelect: handleWorkspaceSelect, loading: loading }) }), _jsxs("div", { className: "workspace-manager__main", children: [selectedWorkspace ? ()
                    < div : , " className=\"workspace-detail\">", _jsxs("div", { className: "workspace-detail__header", children: [_jsxs("div", { className: "workspace-detail__info", children: [_jsx("h3", { children: selectedWorkspace.name }), selectedWorkspace.description && ()
                                    < p, " className=\"workspace-detail__description\">", selectedWorkspace.description] }), ")}"] }), _jsxs("div", { className: "workspace-detail__actions", children: [canInviteUsers && ()
                            < button, "className=\"btn btn--secondary\" onClick=", () => setShowInviteModal(true), "> Invite Users"] }), ")}", canManageWorkspace && ()
                    < button, "className=\"btn btn--secondary\" onClick=", () => setShowSettings(true), "> Settings"] }), ")}"] });
div >
    _jsxs("div", { className: "workspace-detail__stats", children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat__label", children: "Role" }), _jsx("span", { className: "stat__value", children: selectedWorkspace.owner_id === userId ? 'Owner' : 'Member' })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat__label", children: "Joined" }), _jsx("span", { className: "stat__value", children: selectedWorkspace.membership?.joined_at
                            ? new Date(selectedWorkspace.membership.joined_at).toLocaleDateString()
                            : 'N/A' })] })] });
div >
;
()
    < div;
className = "workspace-detail--empty" >
    (_jsx("h3", { children: "Select a workspace" })
        ,
            _jsx("p", { children: "Choose a workspace from the list to view details and manage projects." }));
div >
;
div >
;
div >
    { /* Modals */};
{
    showCreateModal && ()
        < CreateWorkspaceModal;
    onSubmit = { handleCreateWorkspace };
    onCancel = {}();
    setShowCreateModal(false);
}
/>;
{
    showInviteModal && selectedWorkspace && ()
        < InviteUserModal;
    workspaceId = { selectedWorkspace, : .id };
    workspaceName = { selectedWorkspace, : .name };
    onSubmit = { handleInviteUser };
    onCancel = {}();
    setShowInviteModal(false);
}
/>;
{
    showSettings && selectedWorkspace && ()
        < WorkspaceSettings;
    workspace = { selectedWorkspace };
    onUpdate = { handleWorkspaceUpdate };
    onArchive = { handleWorkspaceArchive };
    onCancel = {}();
    setShowSettings(false);
}
canArchive = { canManageWorkspace }
    /  >
;
div >
;
;
;
export default WorkspaceManager;

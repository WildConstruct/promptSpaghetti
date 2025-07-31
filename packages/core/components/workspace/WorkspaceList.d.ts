/**
 * Epic 9.2.1 - Workspace List Component
 * Displays list of user's workspaces with search and filtering
 */
import React from 'react';
import { WorkspaceWithMembership } from '../../types/workspace';

}
interface WorkspaceListProps {
    workspaces: WorkspaceWithMembership[];
    selectedWorkspace: WorkspaceWithMembership | null;
    onWorkspaceSelect: (workspace: WorkspaceWithMembership) => void;
    loading?: boolean;

export declare const WorkspaceList: React.FC<WorkspaceListProps>;
export default WorkspaceList;
//# sourceMappingURL=WorkspaceList.d.ts.map
}
/**
 * Epic 9.2.1 - Workspace Manager Component
 * Main workspace management interface
 */
import React from 'react';
import { Workspace } from '../../types/workspace';
interface WorkspaceManagerProps {
    userId: string;
    onWorkspaceSelect?: (workspace: Workspace) => void;
}
export declare const WorkspaceManager: React.FC<WorkspaceManagerProps>;
export default WorkspaceManager;
//# sourceMappingURL=WorkspaceManager.d.ts.map
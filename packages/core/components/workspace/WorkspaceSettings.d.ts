/**
 * Epic 9.2.1 - Workspace Settings Component
 * Settings modal for workspace configuration
 */
import React from 'react';
import { WorkspaceWithMembership } from '../../types/workspace';

}
interface WorkspaceSettingsProps {
    workspace: WorkspaceWithMembership;
    onUpdate: (updates: {),
        name?: string;
        description?: string;

}
    }) => void;
    onArchive: () => void;
    onCancel: () => void;
    canArchive: boolean;

export declare const WorkspaceSettings: React.FC<WorkspaceSettingsProps>;
export default WorkspaceSettings;
//# sourceMappingURL=WorkspaceSettings.d.ts.map
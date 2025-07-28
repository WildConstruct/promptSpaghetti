/**
 * Epic 9.2.1 - useWorkspaces Hook
 * React hook for workspace management operations
 */
import { WorkspaceWithMembership, CreateWorkspace, UpdateWorkspace } from '../types/workspace';

interface UseWorkspacesOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;

export declare function useWorkspaces(userId: string, options?: UseWorkspacesOptions): {
    workspaces: WorkspaceWithMembership[];
    loading: boolean;
    error: string | null;
    createWorkspace: (data: CreateWorkspace) => Promise<WorkspaceWithMembership>;
    updateWorkspace: (workspaceId: string, data: UpdateWorkspace) => Promise<WorkspaceWithMembership>;
    archiveWorkspace: (workspaceId: string) => Promise<void>;
    inviteUser: (workspaceId: string, userIdToInvite: string, role: string) => Promise<void>;
    refreshWorkspaces: () => void;
};
export {};
//# sourceMappingURL=useWorkspaces.d.ts.map
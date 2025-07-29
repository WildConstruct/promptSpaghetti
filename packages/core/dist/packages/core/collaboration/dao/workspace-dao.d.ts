import { Workspace, WorkspaceOperations } from '../types/workspace';
import { DatabaseConnection } from '../database/connection';
export declare class WorkspaceDAO implements WorkspaceOperations {
    private db;
    constructor(db: DatabaseConnection);
    createWorkspace(data: Omit<Workspace, 'id' | 'created_at' | 'updated_at'>): Promise<Workspace>;
}
//# sourceMappingURL=workspace-dao.d.ts.map
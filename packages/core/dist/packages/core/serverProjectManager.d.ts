/**
 * Server Project Manager - API-based project management
 *
 * Complements the file-based ProjectManager with server-side storage
 */
import { Graph } from './graphSchema';
import { ProjectMetadata, PSGFile, SaveProjectOptions } from './projectManager';
export interface ServerProjectMetadata extends ProjectMetadata {
    id: string;
    userId?: number;
}
export interface ServerProject extends PSGFile {
    id: string;
    userId?: number;
}
export interface ProjectListResponse {
    projects: ServerProject;
    total: number;
    limit: number;
    offset: number;
}
export interface ProjectQuery {
    userId?: number;
    limit?: number;
    offset?: number;
    search?: string;
    tags?: string;
    sortBy?: 'createdAt' | 'lastModified' | 'name';
    sortOrder?: 'asc' | 'desc';
}
export declare class ServerProjectManager {
    private static readonly API_BASE;
    /**
     * Save project to server
     */
    static saveProjectToServer(graph: Graph): any;
    options: SaveProjectOptions;
    settings?: any;
    userId?: number;
    Promise<SaveProjectResult>(): any;
}
//# sourceMappingURL=serverProjectManager.d.ts.map
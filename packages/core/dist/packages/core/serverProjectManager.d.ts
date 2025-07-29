/**
 * Server Project Manager - API-based project management
 *
 * Complements the file-based ProjectManager with server-side storage
 */
import { Graph } from './graphSchema';
import { ProjectMetadata, PSGFile, SaveProjectOptions, LoadProjectResult, SaveProjectResult } from './projectManager';
export interface ServerProjectMetadata extends ProjectMetadata {
    id: string;
    userId?: number;
}
export interface ServerProject extends PSGFile {
    id: string;
    userId?: number;
}
export interface ProjectListResponse {
    projects: ServerProject[];
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
    static saveProjectToServer(graph: Graph, options: SaveProjectOptions, settings?: any, userId?: number): Promise<SaveProjectResult & {
        projectId?: string;
    }>;
    /**
     * Update existing project on server
     */
    static updateProjectOnServer(projectId: string, graph: Graph, options: SaveProjectOptions, settings?: any, userId?: number): Promise<SaveProjectResult>;
    /**
     * Load project from server by ID
     */
    static loadProjectFromServer(projectId: string, userId?: number): Promise<LoadProjectResult & {
        project?: ServerProject;
    }>;
    /**
     * Get list of user's projects with filtering and pagination
     */
    static getUserProjects(query?: ProjectQuery): Promise<ProjectListResponse | {
        error: string;
    }>;
    /**
     * Get recent projects for user
     */
    static getRecentProjects(userId?: number, limit?: number): Promise<{
        projects: ServerProject;
    } | {
        error: string;
    }>;
    /**
     * Delete project from server
     */
    static deleteProjectFromServer(projectId: string, userId?: number): Promise<{
        success: boolean;
        error?: string;
        message?: string;
    }>;
    /**
     * Search projects by name, description, author, or tags
     */
    static searchProjects(searchQuery: string, userId?: number, limit?: number, offset?: number): Promise<ProjectListResponse | {
        error: string;
    }>;
    /**
     * Get projects by tags
     */
    static getProjectsByTags(tags: string, userId?: number, limit?: number, offset?: number): Promise<ProjectListResponse | {
        error: string;
    }>;
}
//# sourceMappingURL=serverProjectManager.d.ts.map
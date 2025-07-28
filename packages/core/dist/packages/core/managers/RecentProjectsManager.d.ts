/**
 * Recent Projects Manager - Story 6.1 (AC: 4)
 * Manages localStorage-based storage for up to 5 recent projects with metadata
 */
import type { ProjectMetadata } from '../schemas/psgSchema';
export interface RecentProjectEntry {
    id: string;
    name: string;
    filePath?: string;
    lastAccessDate: string;
    thumbnail?: string;
    metadata: ProjectMetadata;
    fileSize?: number;
}
export interface RecentProjectsData {
    projects: RecentProjectEntry;
    version: string;
}
export declare class RecentProjectsManager {
    private static readonly STORAGE_KEY;
    private static readonly MAX_RECENT_PROJECTS;
    private static readonly STORAGE_VERSION;
    /**
    * Add a project to the recent projects list
    */
    static addRecentProject(entry: Omit<RecentProjectEntry, 'id' | 'lastAccessDate'>): void;
    /**
    * Get all recent projects, sorted by last access date (most recent first)
    */
    static getRecentProjects(): RecentProjectEntry;
    /**
    * Update the last access date for a project
    */
    static updateLastAccess(projectName: string): void;
    /**
    * Remove a specific project from recent projects
    */
    static removeRecentProject(projectName: string): void;
    /**
    * Clear all recent projects
    */
    static clearRecentProjects(): void;
    /**
    * Generate thumbnail for a project based on graph data
    */
    static generateThumbnail(nodes: any, edges: any): string;
    svg: any;
    '<rect width="100%" height="100%" fill="#f8f9fa"/>': any;
    edges: any;
    forEach(edge: any, {}: {}): any;
    const sourceIndex: any;
    const targetIndex: any;
    if(sourceIndex: any): any;
}
//# sourceMappingURL=RecentProjectsManager.d.ts.map
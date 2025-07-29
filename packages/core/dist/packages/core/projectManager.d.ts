/**
 * Project Manager - File and project management utilities
 * Provides interfaces and utilities for managing .psg files and projects
 * Extended for Story 6.1 with .psg serialization and file management
 */
import { Node, Edge } from 'reactflow';
import { ProjectMetadata, ProjectSettings } from './schemas/psgSchema';
export { ProjectMetadata, ProjectSettings } from './schemas/psgSchema';
export interface SaveProjectOptions {
    name: string;
    description?: string;
    author?: string;
    tags?: string;
    fileName?: string;
}
export interface LoadProjectResult {
    success: boolean;
    data?: {
        graph: {
            nodes: Node;
            edges: Edge;
        };
        metadata: ProjectMetadata;
        settings: ProjectSettings;
    };
    error?: string;
    warnings?: string;
}
export interface SaveProjectResult {
    success: boolean;
    fileName?: string;
    error?: string;
    warnings?: string;
}
export interface PSGFile {
    id: string;
    name: string;
    path: string;
    size: number;
    lastModified: Date;
    nodeCount: number;
    metadata: {
        title?: string;
        description?: string;
        tags: string;
        author?: string;
        version: string;
        created: Date;
        thumbnail?: string;
    };
    isFavorite: boolean;
}
export interface ProjectFolder {
    id: string;
    name: string;
    path: string;
    parentId?: string;
    children: (ProjectFolder | PSGFile)[];
    metadata: {
        description?: string;
        tags: string;
        created: Date;
        lastModified: Date;
    };
}
export interface Project {
    id: string;
    name: string;
    description?: string;
    rootFolder: ProjectFolder;
    settings: {
        autoSave: boolean;
        backupEnabled: boolean;
        collaborationEnabled: boolean;
        visibility: 'private' | 'shared' | 'public';
    };
    created: Date;
    lastModified: Date;
    owner: string;
}
export declare class ProjectManager {
    private static instance;
    private projects;
    private recentFiles;
    private favoriteFiles;
    static getInstance(): ProjectManager;
    private constructor();
    /**
     * Generate thumbnail for PSG file
     */
    generateThumbnail(file: PSGFile): Promise<string>;
    /**
     * Get recent files list
     */
    getRecentFiles(limit?: number): PSGFile[];
    /**
    * Add file to recent files
    */
    addToRecentFiles(file: PSGFile): void;
    /**
    * Toggle favorite status
    */
    toggleFavorite(fileId: string): boolean;
    /**
     * Check if file is favorite
     */
    isFavorite(fileId: string): boolean;
    /**
     * Get favorite files
     */
    getFavoriteFiles(): PSGFile[];
    /**
     * Mock file data for development
     */
    getMockFile(name: string): PSGFile;
    private loadUserData;
    private saveUserData;
    /**
     * Static method to save project to device (Story 6.1)
     */
    static saveProjectToDevice(graphData: {
        nodes: Node[];
        edges: Edge[];
    }, options: SaveProjectOptions, settings: ProjectSettings): Promise<SaveProjectResult>;
    /**
     * Static method to load project from device (Story 6.1)
     */
    static loadProjectFromDevice(): Promise<LoadProjectResult>;
    /**
     * Sanitize file name to prevent invalid characters
     */
    static sanitizeFileName(fileName: string): string;
}
export declare const projectManager: ProjectManager;
//# sourceMappingURL=projectManager.d.ts.map
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
    join(: any): any;
}
//# sourceMappingURL=projectManager.d.ts.map
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
  tags?: string[];
  sortBy?: 'createdAt' | 'lastModified' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Server-based Project Manager for API operations
 */
export class ServerProjectManager {
  private static readonly API_BASE = '/api';

  /**
   * Save project to server
   */
  static async saveProjectToServer(
    graph: Graph,
    options: SaveProjectOptions,
    settings?: any,
    userId?: number
  ): Promise<SaveProjectResult & { projectId?: string }> {
    try {
      const now = new Date().toISOString();
      
      const project: PSGFile = {
        metadata: {
          name: options.name,
          description: options.description,
          version: '1.0.0',
          createdAt: now,
          lastModified: now,
          author: options.author,
          tags: options.tags || [],
          fileFormatVersion: '1.0.0'
        },
        graph,
        settings: settings || {
          autoSave: true,
          autoSaveInterval: 5000,
          theme: 'light',
          gridVisible: true,
          snapToGrid: false,
          miniMapVisible: true
        }
      };

      const response = await fetch(`${this.API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project,
          userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}`
        };
      }

      const result = await response.json();
      return {
        success: true,
        fileName: `${options.name}.psg`,
        projectId: result.projectId
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save project: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Update existing project on server
   */
  static async updateProjectOnServer(
    projectId: string,
    graph: Graph,
    options: SaveProjectOptions,
    settings?: any,
    userId?: number
  ): Promise<SaveProjectResult> {
    try {
      const now = new Date().toISOString();
      
      const project: PSGFile = {
        metadata: {
          name: options.name,
          description: options.description,
          version: '1.0.0',
          createdAt: now, // This will be ignored by the server, using original creation date
          lastModified: now,
          author: options.author,
          tags: options.tags || [],
          fileFormatVersion: '1.0.0'
        },
        graph,
        settings: settings || {}
      };

      const response = await fetch(`${this.API_BASE}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project,
          userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}`
        };
      }

      return {
        success: true,
        fileName: `${options.name}.psg`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update project: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Load project from server by ID
   */
  static async loadProjectFromServer(
    projectId: string,
    userId?: number
  ): Promise<LoadProjectResult & { project?: ServerProject }> {
    try {
      const url = new URL(`${this.API_BASE}/projects/${projectId}`, window.location.origin);
      if (userId) {
        url.searchParams.set('userId', userId.toString());
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: 'Project not found or access denied'
          };
        }
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}`
        };
      }

      const project = await response.json();
      return {
        success: true,
        data: project,
        project
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to load project: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get list of user's projects with filtering and pagination
   */
  static async getUserProjects(query: ProjectQuery = {}): Promise<ProjectListResponse | { error: string }> {
    try {
      const url = new URL(`${this.API_BASE}/projects`, window.location.origin);
      
      // Add query parameters
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, v));
          } else {
            url.searchParams.set(key, value.toString());
          }
        }
      });

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        return {
          error: errorData.error || `HTTP ${response.status}`
        };
      }

      return await response.json();
    } catch (error) {
      return {
        error: `Failed to fetch projects: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get recent projects for user
   */
  static async getRecentProjects(
    userId?: number,
    limit: number = 10
  ): Promise<{ projects: ServerProject[] } | { error: string }> {
    try {
      const url = new URL(`${this.API_BASE}/projects/recent`, window.location.origin);
      if (userId) {
        url.searchParams.set('userId', userId.toString());
      }
      url.searchParams.set('limit', limit.toString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        return {
          error: errorData.error || `HTTP ${response.status}`
        };
      }

      return await response.json();
    } catch (error) {
      return {
        error: `Failed to fetch recent projects: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Delete project from server
   */
  static async deleteProjectFromServer(
    projectId: string,
    userId?: number
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const url = new URL(`${this.API_BASE}/projects/${projectId}`, window.location.origin);
      if (userId) {
        url.searchParams.set('userId', userId.toString());
      }

      const response = await fetch(url.toString(), {
        method: 'DELETE'
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: 'Project not found or access denied'
          };
        }
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}`
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete project: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Search projects by name, description, author, or tags
   */
  static async searchProjects(
    searchQuery: string,
    userId?: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<ProjectListResponse | { error: string }> {
    return this.getUserProjects({
      userId,
      search: searchQuery,
      limit,
      offset,
      sortBy: 'lastModified',
      sortOrder: 'desc'
    });
  }

  /**
   * Get projects by tags
   */
  static async getProjectsByTags(
    tags: string[],
    userId?: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<ProjectListResponse | { error: string }> {
    return this.getUserProjects({
      userId,
      tags,
      limit,
      offset,
      sortBy: 'lastModified',
      sortOrder: 'desc'
    });
  }
}
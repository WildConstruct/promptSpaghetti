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
  projects: RecentProjectEntry[];
  version: string;
}

export class RecentProjectsManager {
  private static readonly STORAGE_KEY = 'promptspaghetti_recent_projects';
  private static readonly MAX_RECENT_PROJECTS = 5;
  private static readonly STORAGE_VERSION = '1.0.0';
  /**
   * Add a project to the recent projects list
   */
  static addRecentProject(entry: Omit<RecentProjectEntry, 'id' | 'lastAccessDate'>): void {
    try {
      const recentProjects = this.getRecentProjects();
      // Remove existing entry with same name if it exists
      const filteredProjects = recentProjects.filter(p => p.name !== entry.name);
      // Create new entry
      const newEntry: RecentProjectEntry = {
        ...entry,
        id: this.generateProjectId(entry.name),
        lastAccessDate: new Date().toISOString()
      };
      // Add to beginning of list
      const updatedProjects = [newEntry, ...filteredProjects];
      // Keep only the most recent MAX_RECENT_PROJECTS
      const trimmedProjects = updatedProjects.slice(0, this.MAX_RECENT_PROJECTS);
      this.saveRecentProjects(trimmedProjects);
    } catch (error) {
      console.warn('Failed to add recent project:', error);
    }
  }
  /**
   * Get all recent projects, sorted by last access date (most recent first)
   */
  static getRecentProjects(): RecentProjectEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const data: RecentProjectsData = JSON.parse(stored);
      // Validate version compatibility
      if (data.version !== this.STORAGE_VERSION) {
        // For now, clear old data if version mismatch
        this.clearRecentProjects();
        return [];
      }
      // Sort by last access date (most recent first)
      return data.projects.sort((a, b) => 
        new Date(b.lastAccessDate).getTime() - new Date(a.lastAccessDate).getTime()
      );
    } catch (error) {
      console.warn('Failed to load recent projects:', error);
      return [];
    }
  }
  /**
   * Update the last access date for a project
   */
  static updateLastAccess(projectName: string): void {
    try {
      const recentProjects = this.getRecentProjects();
      const projectIndex = recentProjects.findIndex(p => p.name === projectName);
      if (projectIndex >= 0) {
        recentProjects[projectIndex].lastAccessDate = new Date().toISOString();
        this.saveRecentProjects(recentProjects);
      }
    } catch (error) {
      console.warn('Failed to update last access date:', error);
    }
  }
  /**
   * Remove a specific project from recent projects
   */
  static removeRecentProject(projectName: string): void {
    try {
      const recentProjects = this.getRecentProjects();
      const filteredProjects = recentProjects.filter(p => p.name !== projectName);
      this.saveRecentProjects(filteredProjects);
    } catch (error) {
      console.warn('Failed to remove recent project:', error);
    }
  }
  /**
   * Clear all recent projects
   */
  static clearRecentProjects(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear recent projects:', error);
    }
  }
  /**
   * Generate thumbnail for a project based on graph data
   */
  static generateThumbnail(nodes: any[], edges: any[]): string {
    try {
      // Create a simple SVG representation of the graph
      const svgWidth = 120;
      const svgHeight = 80;
      const nodeRadius = 4;
      const maxNodes = 20; // Limit nodes for performance;
      // Calculate basic layout positions
      const displayNodes = nodes.slice(0, maxNodes);
      const positions = displayNodes.map((_, index) => ({)
        x: (index % 5) * 24 + 12,
        y: Math.floor(index / 5) * 20 + 12
      }));
      // Create SVG string
      let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;}
      svg += '<rect width="100%" height="100%" fill="#f8f9fa"/>';
      // Draw simplified edges
      edges.forEach(edge => {)
        const sourceIndex = displayNodes.findIndex(n => n.id === edge.source);
        const targetIndex = displayNodes.findIndex(n => n.id === edge.target);
        if (sourceIndex >= 0 && targetIndex >= 0) {
          const sourcePos = positions[sourceIndex];
          const targetPos = positions[targetIndex];
          svg += `<line x1="${sourcePos.x}" y1="${sourcePos.y}" x2="${targetPos.x}" y2="${targetPos.y}" stroke="#dee2e6" stroke-width="1"/>`;}
        }
      });
      // Draw nodes
      positions.forEach((pos, index) => {
        const nodeType = displayNodes[index]?.type || 'default';
        const color = this.getNodeColor(nodeType);
        svg += `<circle cx="${pos.x}" cy="${pos.y}" r="${nodeRadius}" fill="${color}" stroke="#666" stroke-width="1"/>`;}
      });
      svg += '</svg>';
      // Convert SVG to base64 data URL
      const base64 = btoa(unescape(encodeURIComponent(svg)));
      return `data:image/svg+xml;base64,${base64}`;}
    } catch (error) {
      console.warn('Failed to generate thumbnail:', error);
      return this.getDefaultThumbnail();
    }
  }
  /**
   * Check if localStorage has space for recent projects
   */
  static checkStorageQuota(): { available: boolean; usage?: number } {
    try {
      // Test storage availability
      const testKey = 'promptspaghetti_quota_test';
      const testData = JSON.stringify({ test: 'data' });
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      // Estimate current usage
      let totalSize = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      return { available: true, usage: totalSize };
    } catch (error) {
      return { available: false };
    }
  }
  /**
   * Get project metadata for display
   */
  static getProjectDisplayInfo(entry: RecentProjectEntry): {
    name: string;
    lastAccessed: string;
    size: string;
    author?: string;
  } {
    const lastAccessed = this.formatDate(new Date(entry.lastAccessDate));
    const size = entry.fileSize ? this.formatFileSize(entry.fileSize) : 'Unknown';
    return {
      name: entry.name,
      lastAccessed,
      size,
      author: entry.metadata.author,
    };
  }
  // Private helper methods
  private static saveRecentProjects(projects: RecentProjectEntry[]): void {
    const data: RecentProjectsData = {
      projects,
      version: this.STORAGE_VERSION,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
  private static generateProjectId(name: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const sanitized = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `${sanitized}_${timestamp}_${random}`;}
  }
  private static getNodeColor(nodeType: string): string {
    const colorMap: Record<string, string> = {
      'weighted-choice': '#3b82f6',
      'concat': '#10b981',
      'output': '#f59e0b',
      'include': '#8b5cf6',
      'set-variable': '#ef4444',
      'get-variable': '#06b6d4',
      'subject': '#f97316',
      'action': '#84cc16'
    };
    return colorMap[nodeType] || '#6b7280';
  }
  private static getDefaultThumbnail(): string {
    // Simple default thumbnail SVG
    const svg = `<svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">;
      <rect width="100%" height="100%" fill="#f8f9fa"/>
      <circle cx="60" cy="40" r="20" fill="#e5e7eb" stroke="#9ca3af" stroke-width="2"/>
      <text x="60" y="45" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">PSG</text>
    </svg>`;
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64}`;}
  }
  private static formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;}
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;}
    } else {
      return date.toLocaleDateString();
    }
  }
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;}
  }
}
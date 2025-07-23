/**
 * Project Manager - File and project management utilities
 * Provides interfaces and utilities for managing .psg files and projects
 */
export class ProjectManager {
    static instance;
    projects = new Map();
    recentFiles = [];
    favoriteFiles = new Set();
    static getInstance() {
        if (!ProjectManager.instance) {
            ProjectManager.instance = new ProjectManager();
        }
        return ProjectManager.instance;
    }
    constructor() {
        // Load from localStorage or API
        this.loadUserData();
    }
    /**
     * Generate thumbnail for PSG file
     */
    async generateThumbnail(file) {
        // Mock implementation - in real scenario would generate actual thumbnail
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        const nodeCount = file.nodeCount || Math.floor(Math.random() * 20) + 5;
        // Simple SVG thumbnail generation
        const svg = `
      <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="80" fill="#f8fafc" stroke="#e2e8f0"/>
        <text x="60" y="25" text-anchor="middle" font-family="system-ui" font-size="12" fill="#64748b">
          ${file.name.split('.')[0]}
        </text>
        <text x="60" y="45" text-anchor="middle" font-family="system-ui" font-size="10" fill="#94a3b8">
          ${nodeCount} nodes
        </text>
        ${Array.from({ length: Math.min(nodeCount, 8) }, (_, i) => {
            const x = 15 + (i % 4) * 25;
            const y = 55 + Math.floor(i / 4) * 15;
            const color = colors[i % colors.length];
            return `<circle cx="${x}" cy="${y}" r="6" fill="${color}" opacity="0.7"/>`;
        }).join('')}
      </svg>
    `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }
    /**
     * Get recent files list
     */
    getRecentFiles(limit = 10) {
        return this.recentFiles.slice(0, limit);
    }
    /**
     * Add file to recent files
     */
    addToRecentFiles(file) {
        // Remove if already exists
        this.recentFiles = this.recentFiles.filter(f => f.id !== file.id);
        // Add to beginning
        this.recentFiles.unshift(file);
        // Keep only last 20
        this.recentFiles = this.recentFiles.slice(0, 20);
        this.saveUserData();
    }
    /**
     * Toggle favorite status
     */
    toggleFavorite(fileId) {
        if (this.favoriteFiles.has(fileId)) {
            this.favoriteFiles.delete(fileId);
            return false;
        }
        else {
            this.favoriteFiles.add(fileId);
            return true;
        }
    }
    /**
     * Check if file is favorite
     */
    isFavorite(fileId) {
        return this.favoriteFiles.has(fileId);
    }
    /**
     * Get favorite files
     */
    getFavoriteFiles() {
        return this.recentFiles.filter(file => this.favoriteFiles.has(file.id));
    }
    /**
     * Mock file data for development
     */
    getMockFile(name) {
        return {
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name.endsWith('.psg') ? name : `${name}.psg`,
            path: `/projects/default/${name}`,
            size: Math.floor(Math.random() * 1024 * 100), // 0-100KB
            lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
            nodeCount: Math.floor(Math.random() * 50) + 5,
            metadata: {
                title: name,
                description: `Generated PSG file: ${name}`,
                tags: ['generated', 'mock'],
                version: '1.0.0',
                created: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Last 60 days
                author: 'Mock User'
            },
            isFavorite: Math.random() > 0.7
        };
    }
    loadUserData() {
        try {
            const stored = localStorage.getItem('projectManager_userData');
            if (stored) {
                const data = JSON.parse(stored);
                this.recentFiles = data.recentFiles || [];
                this.favoriteFiles = new Set(data.favoriteFiles || []);
            }
        }
        catch (error) {
            console.warn('Failed to load user data from localStorage:', error);
        }
    }
    saveUserData() {
        try {
            const data = {
                recentFiles: this.recentFiles,
                favoriteFiles: Array.from(this.favoriteFiles)
            };
            localStorage.setItem('projectManager_userData', JSON.stringify(data));
        }
        catch (error) {
            console.warn('Failed to save user data to localStorage:', error);
        }
    }
}
// Export singleton instance
export const projectManager = ProjectManager.getInstance();

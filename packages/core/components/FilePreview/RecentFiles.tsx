/**
 * RecentFiles - Component for displaying and managing recently accessed files
 * 
 * Provides quick access to recently opened projects with chronological ordering
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { FilePreview, FilePreviewData } from './FilePreview';

export interface RecentFileEntry {
  filePath: string;
  fileName: string;
  lastAccessed: Date;
  projectName: string;
  description?: string;
  tags?: string[];
  nodeCount: number;
  edgeCount: number;
  fileSize: number;
  isFavorite?: boolean;
}

interface RecentFilesProps {
  /** Maximum number of recent files to display */
  maxItems?: number;
  
  /** Whether to show favorites section */
  showFavorites?: boolean;
  
  /** Callback when a file is selected */
  onFileSelect?: (filePath: string, fileData: FilePreviewData) => void;
  
  /** Callback when a file is favorited/unfavorited */
  onToggleFavorite?: (filePath: string) => void;
  
  /** Callback to clear all recent files */
  onClearRecent?: () => void;
  
  /** Custom styling */
  style?: React.CSSProperties;
  
  /** CSS class name */
  className?: string;
  
  /** Compact view mode */
  compact?: boolean;
}

// Local storage key for recent files
const RECENT_FILES_KEY = 'prompt-spaghetti-recent-files';
const FAVORITES_KEY = 'prompt-spaghetti-favorites';

export const RecentFiles: React.FC<RecentFilesProps> = ({
  maxItems = 10,
  showFavorites = true,
  onFileSelect,
  onToggleFavorite,
  onClearRecent,
  style,
  className,
  compact = false
}) => {
  const [recentFiles, setRecentFiles] = useState<RecentFileEntry[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load recent files and favorites from localStorage
  useEffect(() => {
    try {
      const recentData = localStorage.getItem(RECENT_FILES_KEY);
      if (recentData) {
        const parsed = JSON.parse(recentData);
        const recentEntries = parsed.map((entry: any) => ({
          ...entry,
          lastAccessed: new Date(entry.lastAccessed)
        }));
        setRecentFiles(recentEntries);
      }

      const favoritesData = localStorage.getItem(FAVORITES_KEY);
      if (favoritesData) {
        setFavorites(new Set(JSON.parse(favoritesData)));
      }
    } catch (error) {
      console.warn('Failed to load recent files from localStorage:', error);
    }
  }, []);

  // Save recent files to localStorage
  const saveRecentFiles = useCallback((files: RecentFileEntry[]) => {
    try {
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(files));
    } catch (error) {
      console.warn('Failed to save recent files to localStorage:', error);
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = useCallback((favs: Set<string>) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favs)));
    } catch (error) {
      console.warn('Failed to save favorites to localStorage:', error);
    }
  }, []);

  // Add a file to recent files
  const addRecentFile = useCallback((fileData: FilePreviewData) => {
    setRecentFiles(prev => {
      // Remove existing entry if present
      const filtered = prev.filter(f => f.filePath !== fileData.filePath);
      
      // Add new entry at the beginning
      const newEntry: RecentFileEntry = {
        filePath: fileData.filePath,
        fileName: fileData.fileName,
        lastAccessed: new Date(),
        projectName: fileData.metadata.name,
        description: fileData.metadata.description,
        tags: fileData.metadata.tags,
        nodeCount: fileData.graph.nodes?.length || 0,
        edgeCount: fileData.graph.edges?.length || 0,
        fileSize: fileData.fileSize,
        isFavorite: favorites.has(fileData.filePath)
      };
      
      const updated = [newEntry, ...filtered].slice(0, maxItems);
      saveRecentFiles(updated);
      return updated;
    });
  }, [favorites, maxItems, saveRecentFiles]);

  // Handle toggle favorite
  const handleToggleFavorite = useCallback((filePath: string) => {
    setFavorites(prev => {
      const updated = new Set(prev);
      if (updated.has(filePath)) {
        updated.delete(filePath);
      } else {
        updated.add(filePath);
      }
      saveFavorites(updated);
      
      // Update recent files to reflect favorite status
      setRecentFiles(prevRecent => {
        const updatedRecent = prevRecent.map(file => 
          file.filePath === filePath 
            ? { ...file, isFavorite: updated.has(filePath) }
            : file
        );
        saveRecentFiles(updatedRecent);
        return updatedRecent;
      });
      
      onToggleFavorite?.(filePath);
      return updated;
    });
  }, [onToggleFavorite, saveFavorites, saveRecentFiles]);

  // Handle clear all recent files
  const handleClearRecent = useCallback(() => {
    setRecentFiles([]);
    localStorage.removeItem(RECENT_FILES_KEY);
    onClearRecent?.();
  }, [onClearRecent]);

  // Convert RecentFileEntry to FilePreviewData
  const convertToFilePreviewData = useCallback((entry: RecentFileEntry): FilePreviewData => {
    return {
      fileName: entry.fileName,
      filePath: entry.filePath,
      metadata: {
        name: entry.projectName,
        description: entry.description,
        version: '1.0.0',
        createdAt: entry.lastAccessed.toISOString(),
        lastModified: entry.lastAccessed.toISOString(),
        author: undefined,
        tags: entry.tags || [],
        fileFormatVersion: '1.0.0'
      },
      graph: {
        nodes: new Array(entry.nodeCount).fill(null).map((_, i) => ({ id: `node-${i}`, data: {}, position: { x: 0, y: 0 } })),
        edges: new Array(entry.edgeCount).fill(null).map((_, i) => ({ id: `edge-${i}`, source: `node-${i}`, target: `node-${i+1}` }))
      },
      fileSize: entry.fileSize,
      lastModified: entry.lastAccessed,
      isFavorite: entry.isFavorite
    };
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((filePath: string, entry: RecentFileEntry) => {
    const filePreviewData = convertToFilePreviewData(entry);
    
    // Update last accessed time
    addRecentFile(filePreviewData);
    
    onFileSelect?.(filePath, filePreviewData);
  }, [convertToFilePreviewData, addRecentFile, onFileSelect]);

  // Get favorite files
  const favoriteFiles = useMemo(() => {
    return recentFiles.filter(file => favorites.has(file.filePath));
  }, [recentFiles, favorites]);

  // Get non-favorite recent files
  const nonFavoriteRecent = useMemo(() => {
    return recentFiles.filter(file => !favorites.has(file.filePath));
  }, [recentFiles, favorites]);

  // Format relative time
  const formatRelativeTime = useCallback((date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }, []);

  // Section component for rendering file lists
  const FileSection: React.FC<{
    title: string;
    files: RecentFileEntry[];
    emptyMessage: string;
  }> = ({ title, files, emptyMessage }) => (
    <div style={{ marginBottom: compact ? '16px' : '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid #e5e5e5'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: compact ? '14px' : '16px',
          fontWeight: '600',
          color: '#333'
        }}>
          {title}
        </h3>
        {files.length > 0 && title === 'Recent Files' && (
          <button
            onClick={handleClearRecent}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'underline'
            }}
            title="Clear all recent files"
          >
            Clear All
          </button>
        )}
      </div>

      {files.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: compact ? '16px' : '24px',
          color: '#999',
          fontSize: compact ? '12px' : '14px',
          fontStyle: 'italic'
        }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: compact ? '6px' : '8px'
        }}>
          {files.map(file => (
            <div
              key={file.filePath}
              style={{
                border: '1px solid #e5e5e5',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleFileSelect(file.filePath, file)}
            >
              <FilePreview
                file={convertToFilePreviewData(file)}
                mode="compact"
                onToggleFavorite={() => handleToggleFavorite(file.filePath)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!showFavorites && recentFiles.length === 0) {
    return (
      <div
        className={className}
        style={{
          padding: compact ? '16px' : '24px',
          textAlign: 'center',
          color: '#999',
          fontSize: compact ? '12px' : '14px',
          ...style
        }}
      >
        No recent files yet. Open some projects to see them here!
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        padding: compact ? '12px' : '16px',
        maxHeight: compact ? '400px' : '600px',
        overflowY: 'auto',
        ...style
      }}
    >
      {/* Favorites Section */}
      {showFavorites && (
        <FileSection
          title="★ Favorites"
          files={favoriteFiles}
          emptyMessage="No favorite files yet. Click the ★ button to add favorites!"
        />
      )}

      {/* Recent Files Section */}
      <FileSection
        title="Recent Files"
        files={nonFavoriteRecent}
        emptyMessage="No recent files yet. Open some projects to see them here!"
      />
    </div>
  );
};

// Export utility functions for external use
export const recentFilesUtils = {
  /**
   * Add a file to recent files from external components
   */
  addToRecent: (fileData: FilePreviewData) => {
    try {
      const recentData = localStorage.getItem(RECENT_FILES_KEY);
      const existing = recentData ? JSON.parse(recentData) : [];
      
      // Remove existing entry if present
      const filtered = existing.filter((f: RecentFileEntry) => f.filePath !== fileData.filePath);
      
      // Add new entry at the beginning
      const newEntry: RecentFileEntry = {
        filePath: fileData.filePath,
        fileName: fileData.fileName,
        lastAccessed: new Date(),
        projectName: fileData.metadata.name,
        description: fileData.metadata.description,
        tags: fileData.metadata.tags,
        nodeCount: fileData.graph.nodes?.length || 0,
        edgeCount: fileData.graph.edges?.length || 0,
        fileSize: fileData.fileSize
      };
      
      const updated = [newEntry, ...filtered].slice(0, 10);
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to add file to recent files:', error);
    }
  },

  /**
   * Get recent files list
   */
  getRecentFiles: (): RecentFileEntry[] => {
    try {
      const recentData = localStorage.getItem(RECENT_FILES_KEY);
      if (recentData) {
        const parsed = JSON.parse(recentData);
        return parsed.map((entry: any) => ({
          ...entry,
          lastAccessed: new Date(entry.lastAccessed)
        }));
      }
    } catch (error) {
      console.warn('Failed to get recent files:', error);
    }
    return [];
  },

  /**
   * Clear all recent files
   */
  clearRecentFiles: () => {
    try {
      localStorage.removeItem(RECENT_FILES_KEY);
    } catch (error) {
      console.warn('Failed to clear recent files:', error);
    }
  }
};

export default RecentFiles;
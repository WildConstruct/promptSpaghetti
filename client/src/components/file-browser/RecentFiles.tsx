/**
 * RecentFiles - Component for displaying recently accessed files
 * 
 * Features:
 * - Chronological list of recent files
 * - Quick access buttons
 * - File metadata display
 * - Favorites integration
 * - Search and filtering
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FileItem, FileNode } from './types';
import { useAuthStore } from '../../stores/authStore';

interface RecentFilesProps {
  maxItems?: number;
  onFileSelect?: (file: FileNode) => void;
  onFileDoubleClick?: (file: FileNode) => void;
  showFavorites?: boolean;
  className?: string;
}

interface RecentFileEntry extends FileItem {
  lastAccessed: Date;
  accessCount: number;
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const getFileIcon = (file: FileItem): string => {
  if (file.type === 'folder') return '📁';
  
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.psg')) return '🔗';
  if (fileName.endsWith('.json')) return '📄';
  if (fileName.endsWith('.md')) return '📝';
  return '📄';
};

export const RecentFiles: React.FC<RecentFilesProps> = ({
  maxItems = 20,
  onFileSelect,
  onFileDoubleClick,
  showFavorites = true,
  className = ''
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const [recentFiles, setRecentFiles] = useState<RecentFileEntry[]>([]);
  const [favoriteFiles, setFavoriteFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'recent' | 'favorites'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load recent files from localStorage and API
  const loadRecentFiles = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    
    try {
      // Load from localStorage first for immediate display
      const localRecent = localStorage.getItem('fileBrowserRecent');
      if (localRecent) {
        const parsed = JSON.parse(localRecent).map((item: any) => ({
          ...item,
          lastAccessed: new Date(item.lastAccessed),
          lastModified: new Date(item.lastModified),
          createdAt: new Date(item.createdAt)
        }));
        setRecentFiles(parsed.slice(0, maxItems));
      }

      // TODO: Replace with actual API call
      // const response = await fetch('/api/files/recent');
      // const recentData = await response.json();
      
      // Mock recent files for development
      const mockRecentFiles: RecentFileEntry[] = [
        {
          id: 'recent1',
          name: 'Customer Support Workflow.psg',
          type: 'file',
          path: '/projects/Customer Support Workflow.psg',
          lastModified: new Date('2024-01-15T14:30:00'),
          createdAt: new Date('2024-01-10T10:00:00'),
          lastAccessed: new Date('2024-01-15T16:45:00'),
          accessCount: 12,
          size: 15360,
          tags: ['customer-service', 'workflow'],
          extension: 'psg',
          mimeType: 'application/psg',
          metadata: {
            nodeCount: 18,
            edgeCount: 22,
            description: 'Automated customer support workflow with escalation paths',
            author: 'John Doe'
          }
        },
        {
          id: 'recent2',
          name: 'Content Generation Pipeline.psg',
          type: 'file',
          path: '/templates/Content Generation Pipeline.psg',
          lastModified: new Date('2024-01-14T09:15:00'),
          createdAt: new Date('2024-01-12T11:30:00'),
          lastAccessed: new Date('2024-01-14T15:20:00'),
          accessCount: 8,
          size: 12800,
          tags: ['content', 'generation', 'template'],
          extension: 'psg',
          mimeType: 'application/psg',
          metadata: {
            nodeCount: 14,
            edgeCount: 16,
            description: 'Multi-stage content generation with quality checks',
            author: 'Jane Smith'
          }
        },
        {
          id: 'recent3',
          name: 'Data Analysis Chain.psg',
          type: 'file',
          path: '/analytics/Data Analysis Chain.psg',
          lastModified: new Date('2024-01-13T16:45:00'),
          createdAt: new Date('2024-01-11T14:20:00'),
          lastAccessed: new Date('2024-01-13T17:10:00'),
          accessCount: 5,
          size: 9600,
          tags: ['analytics', 'data', 'reporting'],
          extension: 'psg',
          mimeType: 'application/psg',
          metadata: {
            nodeCount: 10,
            edgeCount: 12,
            description: 'Automated data analysis and reporting pipeline',
            author: 'Mike Wilson'
          }
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Merge with existing local data, prioritizing server data
      const mergedFiles = [...mockRecentFiles];
      setRecentFiles(mergedFiles.slice(0, maxItems));
      
      // Update localStorage
      localStorage.setItem('fileBrowserRecent', JSON.stringify(mergedFiles));
      
    } catch (error) {
      console.error('Failed to load recent files:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, maxItems]);

  // Load favorite files
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated || !showFavorites) return;
    
    try {
      const favoriteIds = JSON.parse(localStorage.getItem('fileBrowserFavorites') || '[]');
      
      // TODO: Replace with API call to get favorite file details
      // const response = await fetch(`/api/files/favorites?ids=${favoriteIds.join(',')}`);
      // const favoritesData = await response.json();
      
      // For now, filter from recent files that are marked as favorites
      const favorites = recentFiles.filter(file => favoriteIds.includes(file.id));
      setFavoriteFiles(favorites);
      
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }, [isAuthenticated, showFavorites, recentFiles]);

  // Add file to recent files
  const addToRecent = useCallback((file: FileItem) => {
    if (!isAuthenticated) return;

    const recentEntry: RecentFileEntry = {
      ...file,
      lastAccessed: new Date(),
      accessCount: 1
    };

    setRecentFiles(prev => {
      // Remove existing entry if present
      const filtered = prev.filter(item => item.id !== file.id);
      
      // Add to beginning and limit to maxItems
      const updated = [recentEntry, ...filtered].slice(0, maxItems);
      
      // Update localStorage
      localStorage.setItem('fileBrowserRecent', JSON.stringify(updated));
      
      return updated;
    });
  }, [isAuthenticated, maxItems]);

  // Initialize data
  useEffect(() => {
    loadRecentFiles();
  }, [loadRecentFiles]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Handle file selection
  const handleFileClick = useCallback((file: RecentFileEntry) => {
    addToRecent(file);
    onFileSelect?.(file as FileNode);
  }, [addToRecent, onFileSelect]);

  const handleFileDoubleClick = useCallback((file: RecentFileEntry) => {
    addToRecent(file);
    onFileDoubleClick?.(file as FileNode);
  }, [addToRecent, onFileDoubleClick]);

  // Filter files based on current filter and search term
  const filteredFiles = React.useMemo(() => {
    let files: RecentFileEntry[] = [];
    
    switch (filter) {
    case 'recent':
      files = recentFiles;
      break;
    case 'favorites':
      files = favoriteFiles as RecentFileEntry[];
      break;
    case 'all':
    default:
      files = recentFiles;
      break;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      files = files.filter(file =>
        file.name.toLowerCase().includes(term) ||
        file.tags.some(tag => tag.toLowerCase().includes(term)) ||
        (file.metadata?.description || '').toLowerCase().includes(term)
      );
    }

    return files;
  }, [recentFiles, favoriteFiles, filter, searchTerm]);

  if (!isAuthenticated) {
    return (
      <div className={`recent-files-empty ${className}`} style={{
        padding: '20px',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        Please log in to see your recent files.
      </div>
    );
  }

  return (
    <div className={`recent-files ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: '#212529'
          }}>
            Quick Access
          </h3>
          
          <div style={{ fontSize: '12px', color: '#6c757d' }}>
            {filteredFiles.length} items
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '13px',
            marginBottom: '12px'
          }}
        />

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '4px 12px',
              border: 'none',
              backgroundColor: filter === 'all' ? '#007bff' : 'transparent',
              color: filter === 'all' ? '#fff' : '#6c757d',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            All
          </button>
          
          <button
            onClick={() => setFilter('recent')}
            style={{
              padding: '4px 12px',
              border: 'none',
              backgroundColor: filter === 'recent' ? '#007bff' : 'transparent',
              color: filter === 'recent' ? '#fff' : '#6c757d',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Recent
          </button>
          
          {showFavorites && (
            <button
              onClick={() => setFilter('favorites')}
              style={{
                padding: '4px 12px',
                border: 'none',
                backgroundColor: filter === 'favorites' ? '#007bff' : 'transparent',
                color: filter === 'favorites' ? '#fff' : '#6c757d',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ⭐ Favorites
            </button>
          )}
        </div>
      </div>

      {/* File List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            Loading recent files...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            {searchTerm ? (
              <>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                <div>No files match your search</div>
              </>
            ) : filter === 'favorites' ? (
              <>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</div>
                <div>No favorite files yet</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  Star files to add them to favorites
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
                <div>No recent files</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  Open some files to see them here
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {filteredFiles.map((file, index) => (
              <div
                key={file.id}
                onClick={() => handleFileClick(file)}
                onDoubleClick={() => handleFileDoubleClick(file)}
                style={{
                  padding: '12px 20px',
                  borderBottom: index < filteredFiles.length - 1 ? '1px solid #f1f3f4' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* File Icon */}
                <div style={{ fontSize: '20px', flexShrink: 0 }}>
                  {getFileIcon(file)}
                </div>

                {/* File Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#212529',
                    marginBottom: '2px',
                    wordBreak: 'break-word'
                  }}>
                    {file.name}
                  </div>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#6c757d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>{formatTimeAgo(file.lastAccessed)}</span>
                    
                    {file.metadata?.nodeCount && (
                      <span>• {file.metadata.nodeCount} nodes</span>
                    )}
                    
                    {'accessCount' in file && file.accessCount > 1 && (
                      <span>• {file.accessCount} opens</span>
                    )}
                  </div>
                  
                  {file.tags.length > 0 && (
                    <div style={{
                      marginTop: '4px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px'
                    }}>
                      {file.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          style={{
                            padding: '1px 5px',
                            backgroundColor: '#e9ecef',
                            borderRadius: '2px',
                            fontSize: '10px',
                            color: '#495057'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {file.tags.length > 3 && (
                        <span style={{
                          fontSize: '10px',
                          color: '#6c757d'
                        }}>
                          +{file.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Export utility function for adding files to recent list
export const addFileToRecent = (file: FileItem): void => {
  try {
    const recentEntry = {
      ...file,
      lastAccessed: new Date(),
      accessCount: 1
    };

    const existing = localStorage.getItem('fileBrowserRecent');
    const recentFiles = existing ? JSON.parse(existing) : [];
    
    // Remove existing entry
    const filtered = recentFiles.filter((item: any) => item.id !== file.id);
    
    // Add to beginning and limit
    const updated = [recentEntry, ...filtered].slice(0, 20);
    
    localStorage.setItem('fileBrowserRecent', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to add file to recent:', error);
  }
};

export default RecentFiles;
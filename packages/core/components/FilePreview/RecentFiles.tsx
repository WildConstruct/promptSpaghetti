/**
 * RecentFiles - Component for displaying and managing recently accessed files
 * 
 * Provides quick access to recently opened projects with chronological ordering
 */
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { PSGFile, projectManager } from '../../projectManager';
interface RecentFilesProps {
  /** Maximum number of recent files to display */
  limit?: number;
  /** Callback when a file is clicked */
  onClick?: (file: PSGFile) => void;
  /** Custom styling */
  style?: React.CSSProperties;
  /** CSS class name */
  className?: string;
  export const RecentFiles: React.FC<RecentFilesProps> = ({,)
  limit = 10,
  onClick,
  style,
  className
}) => {
  const [currentView, setCurrentView] = useState<'recent' | 'favorites'>('recent');
  const [recentFiles, setRecentFiles] = useState<PSGFile>([]);
  const [favoriteFiles, setFavoriteFiles] = useState<PSGFile>([]);
  // Load files from projectManager
  const loadFiles = useCallback(() => {
    try {
      const recent = projectManager.getRecentFiles(limit);
      const favorites = projectManager.getFavoriteFiles();
      setRecentFiles(recent);
      setFavoriteFiles(favorites);
    } catch (error) {
  console.warn('Failed to load files from project manager:', error);
  setRecentFiles([]);
  setFavoriteFiles([]);
}, [limit]);
  // Load files on mount and when limit changes
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);
  // Handle file click
  const handleFileClick = useCallback((file: PSGFile) => {
    // Add to recent files
    projectManager.addToRecentFiles(file);
    // Reload files to update the list
    loadFiles();
    // Call the onClick handler
    onClick?.(file);
  }, [onClick, loadFiles]);
  // Handle favorite toggle
  const handleToggleFavorite = useCallback((file: PSGFile) => {
    const newStatus = projectManager.toggleFavorite(file.id);
    // Update the file's favorite status
    file.isFavorite = newStatus;
    // Reload files to update the lists
    loadFiles();
  }, [loadFiles]);
  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);
  // Format date
  const formatDate = useCallback((date: Date): string => {
    try {
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
  }, []);
  // Get files to display based on current view
  const filesToDisplay = useMemo(() => {
  return currentView === 'recent' ? recentFiles : favoriteFiles;
}, [currentView, recentFiles, favoriteFiles]);
  return;
    <div className={className} style={style}>
      {/* View Toggle */}
      <div style={{
  display: 'flex',
  marginBottom: '16px',
  borderRadius: '6px',
  overflow: 'hidden',
  border: '1px solid #e5e5e5',
}}>
        <button
          onClick={() => setCurrentView('recent')}
          style={{
  flex: 1,
  padding: '8px 16px',
  border: 'none',
  backgroundColor: currentView === 'recent' ? '#3B82F6' : '#f8f9fa',
  color: currentView === 'recent' ? 'white' : '#666',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
}}
        >
          Recent
        </button>
        <button
          onClick={() => setCurrentView('favorites')}
          style={{
  flex: 1,
  padding: '8px 16px',
  border: 'none',
  backgroundColor: currentView === 'favorites' ? '#3B82F6' : '#f8f9fa',
  color: currentView === 'favorites' ? 'white' : '#666',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
}}
        >
          Favorites
        </button>
      </div>
      {/* Files List */}
      <div style={{
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}}>
        {filesToDisplay.length === 0 ? ()
          <div style={{
  textAlign: 'center',
  padding: '32px 16px',
  color: '#999',
  fontSize: '14px',
}}>
            {currentView === 'recent' ? 'No recent files' : 'No favorite files'}
          </div>
        ) : ()
          filesToDisplay.map((file) => ()
            <div
              key={file.id}
              style={{
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  overflow: 'hidden',
  transition: 'border-color 0.2s ease',
}}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3B82F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e5e5';
              }}
            >
              <div
                style={{
  padding: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
}}
                onClick={() => handleFileClick(file)}
              >
                {/* File Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
  fontSize: '14px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '4px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}}>
                    {file.name}
                  </div>
                  <div style={{
  fontSize: '12px',
  color: '#666',
  marginBottom: '4px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}}>
                    {file.metadata.description || 'No description'}
                  </div>
                  <div style={{
  fontSize: '11px',
  color: '#999',
  display: 'flex',
  gap: '12px',
}}>
                    <span>{file.nodeCount} nodes</span>
                    <span>{formatFileSize(file.size)}</span>
                    <span>{formatDate(file.lastModified)}</span>
                  </div>
                </div>
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(file);
                  }}
                  style={{
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  color: projectManager.isFavorite(file.id) ? '#ffc107' : '#ccc',
  fontSize: '16px',
}}
                  title={projectManager.isFavorite(file.id) ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label={`${projectManager.isFavorite(file.id) ? 'Remove from' : 'Add to'} favorites`}
                >
                  {projectManager.isFavorite(file.id) ? '⭐' : '☆'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Memoized component for performance
const MemoizedRecentFiles = React.memo(RecentFiles, (prevProps, nextProps) => {
  return;
    prevProps.limit === nextProps.limit &&
    prevProps.onClick === nextProps.onClick
  );
});
MemoizedRecentFiles.displayName = 'RecentFiles';

export default MemoizedRecentFiles;
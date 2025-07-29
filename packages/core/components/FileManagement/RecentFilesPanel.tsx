/**
 * Recent Files Panel Component
 * Epic 3 Story 3.3: Recent Files & Workspace Management
 * 
 * Dedicated panel for managing recent files, favorites, and workspace state
 */
import React, { useState, useCallback, useEffect } from 'react';
import { ProjectManager, PSGFile } from '../../projectManager';

export interface RecentFilesPanelProps {
  onFileSelected?: (file: PSGFile) => void;
  onFileLoad?: (file: PSGFile) => void;
  onClearRecents?: () => void;
  theme?: 'light' | 'dark' | 'cinema';
  maxRecentFiles?: number;
  showFavorites?: boolean;
  showClearButton?: boolean;
}
export const RecentFilesPanel: React.FC<RecentFilesPanelProps> = ({
  onFileSelected,
  onFileLoad,
  onClearRecents,
  theme = 'cinema',
  maxRecentFiles = 10,
  showFavorites = true,
  showClearButton = true
}) => {
  const [recentFiles, setRecentFiles] = useState<PSGFile>([]);
  const [favoriteFiles, setFavoriteFiles] = useState<PSGFile>([]);
  const [selectedFile, setSelectedFile] = useState<PSGFile | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const projectManager = ProjectManager.getInstance();
  // Theme styles
  const getThemeStyles = () => {
  const themes = {
  light: {
  background: '#ffffff',
  secondary: '#f8fafc',
  tertiary: '#f1f5f9',
  border: '#e5e7eb',
  text: '#374151',
  textSecondary: '#6b7280',
  accent: '#3b82f6',
  hover: '#f3f4f6',
  selection: '#dbeafe',
},
  dark: {
  background: '#1f2937',
  secondary: '#111827',
  tertiary: '#0f172a',
  border: '#4b5563',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  accent: '#60a5fa',
  hover: '#374151',
  selection: '#1e3a8a',
},
  cinema: {
  background: 'var(--color-bg-primary, #1e1e1e)',
  secondary: 'var(--color-bg-secondary, #2a2a2a)',
  tertiary: 'var(--color-bg-tertiary, #353535)',
  border: 'var(--color-ui-border, #404040)',
  text: 'var(--color-text-primary, #e8e8e8)',
  textSecondary: 'var(--color-text-secondary, #b8b8b8)',
  accent: 'var(--color-accent-orange, #ff7c00)',
  hover: 'var(--color-ui-hover, #2d2d2d)',
  selection: 'var(--color-ui-selection, #ff7c0040)',
  }
};
    return themes[theme];
  };
  const styles = getThemeStyles();
  // Load recent and favorite files
  useEffect(() => {
    loadRecentFiles();
    loadFavoriteFiles();
  }, [maxRecentFiles]);
  const loadRecentFiles = useCallback(() => {
    setRecentFiles(projectManager.getRecentFiles(maxRecentFiles));
  }, [projectManager, maxRecentFiles]);
  const loadFavoriteFiles = useCallback(() => {
    setFavoriteFiles(projectManager.getFavoriteFiles());
  }, [projectManager]);
  // File actions
  const handleFileSelect = useCallback((file: PSGFile) => {
    setSelectedFile(file);
    onFileSelected?.(file);
  }, [onFileSelected]);
  const handleFileLoad = useCallback((file: PSGFile) => {
    projectManager.addToRecentFiles(file);
    loadRecentFiles();
    onFileLoad?.(file);
  }, [projectManager, loadRecentFiles, onFileLoad]);
  const handleToggleFavorite = useCallback((file: PSGFile) => {
    const isFavorite = projectManager.toggleFavorite(file.id);
    file.isFavorite = isFavorite;
    loadFavoriteFiles();
    loadRecentFiles(); // Refresh recent files to show updated favorite status
  }, [projectManager, loadFavoriteFiles, loadRecentFiles]);
  const handleClearRecents = useCallback(() => {
    if (confirm('Are you sure you want to clear all recent files? This action cannot be undone.')) {
      // Clear recent files in ProjectManager
      // For now, just refresh (in real implementation would clear the list)
      onClearRecents?.();
      loadRecentFiles();
    }
  }, [onClearRecents, loadRecentFiles]);
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return 'Today'
  } else if (diffDays === 1) {
      return 'Yesterday';
  } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
    return new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(new Date(date));
  };
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  const FileItem: React.FC<{ file: PSGFile; compact?: boolean }> = ({ file, compact = false }) => (
    <div
      onClick={() => handleFileSelect(file)}
      onDoubleClick={() => handleFileLoad(file)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? '8px' : '12px',
        padding: compact ? '8px 12px' : '12px 16px',
        backgroundColor: selectedFile?.id === file.id ? styles.selection : 'transparent',
        border: `1px solid ${selectedFile?.id === file.id ? styles.accent : 'transparent'}`,
  borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
  }}
      onMouseOver={(e) => {
        if (selectedFile?.id !== file.id) {
          e.currentTarget.style.backgroundColor = styles.hover;
        }
      }}
      onMouseOut={(e) => {
        if (selectedFile?.id !== file.id) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {/* File Icon */}
      <div style={{
  width: compact ? '24px' : '32px',
  height: compact ? '24px' : '32px',
  backgroundColor: styles.tertiary,
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: compact ? '12px' : '16px',
  flexShrink: 0,
}}>
        📄
      </div>
      {/* File Info */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{
  fontWeight: '500',
  fontSize: compact ? '13px' : '14px',
  marginBottom: '2px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
}}>
          {file.metadata.title || file.name.replace('.psg', '')}
          {file.isFavorite && <span style={{ fontSize: '12px' }}>⭐</span>}
        </div>
        {!compact && (
          <div style={{
  fontSize: '12px',
  color: styles.textSecondary,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}}>
            <span>{file.nodeCount} nodes</span>
            <span>•</span>
            <span>{formatFileSize(file.size)}</span>
            <span>•</span>
            <span>{formatDate(file.lastModified)}</span>
          </div>
        )}
      </div>
      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite(file);
          }}
          style={{
  background: 'transparent',
  border: 'none',
  color: file.isFavorite ? styles.accent : styles.textSecondary,
  fontSize: '14px',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '2px',
}}
          title={file.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {file.isFavorite ? '⭐' : '☆'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
  backgroundColor: styles.background,
  color: styles.text,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '14px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: `1px solid ${styles.border}`
      }}>
        <h2 style={{
  margin: 0,
  fontSize: '18px',
  fontWeight: '600',
  color: styles.text,
}}>
          Recent Files
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', backgroundColor: styles.tertiary, borderRadius: '4px', padding: '2px' }}>
            {(['list', 'grid'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
  padding: '4px 8px',
  backgroundColor: viewMode === mode ? styles.accent : 'transparent',
  border: 'none',
  borderRadius: '2px',
  color: viewMode === mode ? styles.background : styles.textSecondary,
  fontSize: '11px',
  cursor: 'pointer',
}}
              >
                {mode === 'list' ? '☰' : '⊞'}
              </button>
            ))}
          </div>
          {/* Clear Button */}
          {showClearButton && recentFiles.length > 0 && (
            <button
              onClick={handleClearRecents}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: `1px solid ${styles.border}`}
},
  borderRadius: '4px',
                color: styles.textSecondary,
                fontSize: '12px',
                cursor: 'pointer'
  }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {/* Favorites Section */}
        {showFavorites && favoriteFiles.length > 0 && ()
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
  margin: '0 0 12px 0',
  fontSize: '14px',
  fontWeight: '600',
  color: styles.accent,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}}>
              <span>⭐</span> Favorites ({favoriteFiles.length})
            </h3>
            <div style={{
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}}>
              {favoriteFiles.slice(0, 5).map(file => ()
                <FileItem key={file.id} file={file} compact={true} />
              ))}
            </div>
          </div>
        )}
        {/* Recent Files Section */}
        <div>
          <h3 style={{
  margin: '0 0 12px 0',
  fontSize: '14px',
  fontWeight: '600',
  color: styles.text,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}}>
            <span>🕐</span> Recent Files ({recentFiles.length})
          </h3>
          {recentFiles.length === 0 ? ()
            <div style={{
  textAlign: 'center',
  padding: '40px 20px',
  color: styles.textSecondary,
}}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>No recent files</div>
              <div style={{ fontSize: '14px' }}>
                Open some projects to see them here
              </div>
            </div>
          ) : ()
            <div style={{
  display: viewMode === 'grid' ? 'grid' : 'flex',
  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(200px, 1fr))' : undefined,
  flexDirection: viewMode === 'list' ? 'column' : undefined,
  gap: viewMode === 'grid' ? '12px' : '4px',
}}>
              {recentFiles.map(file => ()
                <FileItem key={file.id} file={file} compact={viewMode === 'list'} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentFilesPanel;
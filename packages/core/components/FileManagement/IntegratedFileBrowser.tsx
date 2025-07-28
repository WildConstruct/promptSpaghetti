/**
 * Integrated File Browser Component
 * Epic 3 Story 3.2: Integrated File Browser Implementation
 * 
 * Professional file browser with hierarchical navigation, project management,
 * and seamless integration with the Cinema 4D-inspired interface
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ProjectManager, PSGFile, ProjectFolder } from '../../projectManager';

export interface IntegratedFileBrowserProps {
  onFileSelected?: (file: PSGFile) => void;
  onProjectLoad?: (file: PSGFile) => void;
  onNewProject?: () => void;
  onFileAction?: (action: string, file: PSGFile) => void;
  theme?: 'light' | 'dark' | 'cinema';
  height?: string;
  showCreateControls?: boolean;
  currentProject?: string;
  interface FileContextMenuAction {
  id: string;,
  label: string;
  icon: string;,
  action: (file: PSGFile) => void;
  separator?: boolean;
  destructive?: boolean;
  interface FolderViewState {
  viewMode: 'list' | 'grid' | 'details';,
  sortBy: 'name' | 'modified' | 'size' | 'type';
  sortDirection: 'asc' | 'desc';,
  showHidden: boolean;
  filterText: string;
}
export const IntegratedFileBrowser: React.FC<IntegratedFileBrowserProps> = ({)
  onFileSelected,
  onProjectLoad,
  onNewProject,
  onFileAction,
  theme = 'cinema',
  height = '100%',
  showCreateControls = true,
  currentProject
}) => {
  const [files, setFiles] = useState<PSGFile>([]);
  const [recentFiles, setRecentFiles] = useState<PSGFile>([]);
  const [favoriteFiles, setFavoriteFiles] = useState<PSGFile>([]);
  const [selectedFile, setSelectedFile] = useState<PSGFile | null>(null);
  const [contextMenu, setContextMenu] = useState<{
  x: number;,
  y: number;
  file: PSGFile;
} | null>(null);
  const [viewState, setViewState] = useState<FolderViewState>({)
  viewMode: 'grid',
  sortBy: 'modified',
  sortDirection: 'desc',
  showHidden: false,
  filterText: '',
});
  const [currentFolder, setCurrentFolder] = useState<string>('/');
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ name: string; path: string }>>([)
    { name: 'Projects', path: '/' }
  ]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectManager = ProjectManager.getInstance();
  // Theme styles
  const getThemeStyles = () => {
  const themes = {
  light: {,
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
  dark: {,
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
  cinema: {,
  background: 'var(--color-bg-primary, #1e1e1e)',
  secondary: 'var(--color-bg-secondary, #2a2a2a)',
  tertiary: 'var(--color-bg-tertiary, #353535)',
  border: 'var(--color-ui-border, #404040)',
  text: 'var(--color-text-primary, #e8e8e8)',
  textSecondary: 'var(--color-text-secondary, #b8b8b8)',
  accent: 'var(--color-accent-orange, #ff7c00)',
  hover: 'var(--color-ui-hover, #2d2d2d)',
  selection: 'var(--color-ui-selection, #ff7c0040)',
};
    return themes[theme];
  };
  const styles = getThemeStyles();
  // Load files and recent data
  useEffect(() => {
    loadFiles();
    loadRecentFiles();
    loadFavoriteFiles();
  }, [currentFolder]);
  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      // Mock file loading - in real implementation would fetch from server/filesystem
      const mockFiles = [;
        projectManager.getMockFile('Character Development Graph'),
        projectManager.getMockFile('Story Structure Template'),
        projectManager.getMockFile('Dialogue Generation System'),
        projectManager.getMockFile('Worldbuilding Framework'),
        projectManager.getMockFile('Plot Twist Generator'),
        projectManager.getMockFile('NPC Personality System'),
        projectManager.getMockFile('Setting Description Engine'),
        projectManager.getMockFile('Conflict Resolution Tree')
      ];
      setFiles(mockFiles);
    } catch (error) {
  console.error('Failed to load files:', error);
} finally {
      setLoading(false);
  }, [currentFolder, projectManager]);
  const loadRecentFiles = useCallback(() => {
    setRecentFiles(projectManager.getRecentFiles(10));
  }, [projectManager]);
  const loadFavoriteFiles = useCallback(() => {
    setFavoriteFiles(projectManager.getFavoriteFiles());
  }, [projectManager]);
  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
  let filtered = files;
  // Apply text filter
  if (viewState.filterText) {
  const query = viewState.filterText.toLowerCase();
  filtered = files.filter(file => )
  file.name.toLowerCase().includes(query) ||
  file.metadata.description?.toLowerCase().includes(query) ||
  file.metadata.tags.some(tag => tag.toLowerCase().includes(query))
  );
  // Apply sorting
  filtered.sort((a, b) => {
  let comparison = 0;
  switch (viewState.sortBy) {
  case 'name':,
  comparison = a.name.localeCompare(b.name);
  break;
  case 'modified':,
  comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
  break;
  case 'size':,
  comparison = a.size - b.size;
  break;
  case 'type':,
  comparison = a.name.split('.').pop()?.localeCompare(b.name.split('.').pop() || '') || 0;
  break;
  return viewState.sortDirection === 'desc' ? -comparison : comparison;
});
    return filtered;
  }, [files, viewState]);
  // File actions
  const handleFileSelect = useCallback((file: PSGFile) => {
    setSelectedFile(file);
    onFileSelected?.(file);
  }, [onFileSelected]);
  const handleFileDoubleClick = useCallback((file: PSGFile) => {
    projectManager.addToRecentFiles(file);
    loadRecentFiles();
    onProjectLoad?.(file);
  }, [projectManager, loadRecentFiles, onProjectLoad]);
  const handleFileContextMenu = useCallback((e: React.MouseEvent, file: PSGFile) => {
  e.preventDefault();
  setContextMenu({)
  x: e.clientX,
  y: e.clientY,
  file
});
  }, []);
  const handleToggleFavorite = useCallback((file: PSGFile) => {
    const isFavorite = projectManager.toggleFavorite(file.id);
    file.isFavorite = isFavorite;
    loadFavoriteFiles();
    setContextMenu(null);
  }, [projectManager, loadFavoriteFiles]);
  const handleFileDelete = useCallback((file: PSGFile) => {
    if (confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {}
      // Mock deletion - in real implementation would delete from server/filesystem
      setFiles(prev => prev.filter(f => f.id !== file.id));
      if (selectedFile?.id === file.id) {
        setSelectedFile(null);
      onFileAction?.('delete', file);
    setContextMenu(null);
  }, [selectedFile, onFileAction]);
  const handleFileRename = useCallback((file: PSGFile) => {
    const newName = prompt('Enter new file name:', file.name.replace('.psg', ''));
    if (newName && newName !== file.name.replace('.psg', '')) {
      // Mock rename - in real implementation would rename on server/filesystem
      file.name = `${newName}.psg`;}
      file.metadata.title = newName;
      setFiles(prev => [...prev]);
      onFileAction?.('rename', file);
    setContextMenu(null);
  }, [onFileAction]);
  const handleFileDuplicate = useCallback((file: PSGFile) => {
    // Mock duplication - in real implementation would duplicate on server/filesystem
    const duplicatedFile = {
      ...file,
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}
},
  name: file.name.replace('.psg', ' Copy.psg'),
      metadata: {,
  ...file.metadata,
  title: file.metadata.title + ' Copy',
  created: new Date(),
};
    setFiles(prev => [duplicatedFile, ...prev]);
    onFileAction?.('duplicate', file);
    setContextMenu(null);
  }, [onFileAction]);
  // Context menu actions
  const contextMenuActions: FileContextMenuAction = [
    {
  id: 'open',
  label: 'Open',
  icon: '📂',
  action: handleFileDoubleClick,
}
    {
  id: 'favorite',
  label: contextMenu?.file.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
  icon: contextMenu?.file.isFavorite ? '⭐' : '☆',
  action: handleToggleFavorite,
}
    { id: 'sep1', label: '', icon: '', action: () => {}, separator: true },
    {
  id: 'rename',
  label: 'Rename',
  icon: '✏️',
  action: handleFileRename,
}
    {
  id: 'duplicate',
  label: 'Duplicate',
  icon: '📄',
  action: handleFileDuplicate,
}
    { id: 'sep2', label: '', icon: '', action: () => {}, separator: true },
    {
  id: 'delete',
  label: 'Delete',
  icon: '🗑️',
  action: handleFileDelete,
  destructive: true];
  // Close context menu on click outside
  useEffect(() => {
  const handleClickOutside = () => setContextMenu(null);
  if (contextMenu) {
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, [contextMenu]);
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {)
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(date));
  };
  return;
    <div style={{
  display: 'flex',
  flexDirection: 'column',
  height,
  backgroundColor: styles.background,
  color: styles.text,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '14px',
}}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: styles.secondary,
        borderBottom: `1px solid ${styles.border}`}
},
  gap: '12px';
  }}>
        {/* Search */}
        <div style={{ flex: 1, maxWidth: '300px' }}>
          <input
            type="text"
            placeholder="Search projects..."
            value={viewState.filterText}
            onChange={(e) => setViewState(prev => ({ ...prev, filterText: e.target.value }))}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: styles.tertiary,
              border: `1px solid ${styles.border}`}
},
  borderRadius: '6px',
              color: styles.text,
              fontSize: '13px',
              outline: 'none';
  }}
          />
        </div>
        {/* View Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Sort */}
          <select
            value={`${viewState.sortBy}-${viewState.sortDirection}`}
            onChange={(e) => {
              const [sortBy, sortDirection] = e.target.value.split('-') as [typeof viewState.sortBy, typeof viewState.sortDirection];
              setViewState(prev => ({ ...prev, sortBy, sortDirection }));
            }}
            style={{
              padding: '6px 8px',
              backgroundColor: styles.tertiary,
              border: `1px solid ${styles.border}`}
},
  borderRadius: '4px',
              color: styles.text,
              fontSize: '12px';
  }}
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="modified-desc">Recent First</option>
            <option value="modified-asc">Oldest First</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>
          {/* View Mode */}
          <div style={{ display: 'flex', backgroundColor: styles.tertiary, borderRadius: '4px', padding: '2px' }}>
            {(['list', 'grid', 'details'] as const).map(mode => ()
              <button
                key={mode}
                onClick={() => setViewState(prev => ({ ...prev, viewMode: mode }))}
                style={{
  padding: '6px 8px',
  backgroundColor: viewState.viewMode === mode ? styles.accent : 'transparent',
  border: 'none',
  borderRadius: '2px',
  color: viewState.viewMode === mode ? styles.background : styles.textSecondary,
  fontSize: '11px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
}}
              >
                {mode === 'list' ? '☰' : mode === 'grid' ? '⊞' : '≡'}
              </button>
            ))}
          </div>
          {/* New Project Button */}
          {showCreateControls && ()
            <button
              onClick={onNewProject}
              style={{
  padding: '8px 12px',
  backgroundColor: styles.accent,
  border: 'none',
  borderRadius: '6px',
  color: styles.background,
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
}}
            >
              <span>➕</span> New Project
            </button>
          )}
        </div>
      </div>
      {/* Content Area */}
      <div style={{
  flex: 1,
  display: 'flex',
  overflow: 'hidden',
}}>
        {/* Sidebar */}
        <div style={{
          width: '200px',
          backgroundColor: styles.secondary,
          borderRight: `1px solid ${styles.border}`}
},
  padding: '16px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px';
  }}>
          {/* Quick Access */}
          <div style={{ padding: '0 16px' }}>
            <h3 style={{
  margin: '0 0 8px 0',
  fontSize: '12px',
  fontWeight: '600',
  color: styles.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}}>
              Quick Access
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                style={{
  padding: '8px 12px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '4px',
  color: styles.text,
  fontSize: '13px',
  textAlign: 'left',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.hover}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                📁 All Projects
              </button>
              <button
                style={{
  padding: '8px 12px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '4px',
  color: styles.text,
  fontSize: '13px',
  textAlign: 'left',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.hover}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ⭐ Favorites ({favoriteFiles.length})
              </button>
              <button
                style={{
  padding: '8px 12px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '4px',
  color: styles.text,
  fontSize: '13px',
  textAlign: 'left',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.hover}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                🕐 Recent ({recentFiles.length})
              </button>
            </div>
          </div>
          {/* Recent Files */}
          {recentFiles.length > 0 && ()
            <div style={{ padding: '0 16px', marginTop: '16px' }}>
              <h3 style={{
  margin: '0 0 8px 0',
  fontSize: '12px',
  fontWeight: '600',
  color: styles.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}}>
                Recent Files
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {recentFiles.slice(0, 5).map(file => ()
                  <button
                    key={file.id}
                    onClick={() => handleFileDoubleClick(file)}
                    style={{
  padding: '6px 8px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '4px',
  color: styles.text,
  fontSize: '12px',
  textAlign: 'left',
  cursor: 'pointer',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.hover}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title={file.name}
                  >
                    📄 {file.name.replace('.psg', '')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Main File Area */}
        <div style={{
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}}>
          {/* Breadcrumbs */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: styles.tertiary,
            borderBottom: `1px solid ${styles.border}`}
},
  display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: styles.textSecondary;
  }}>
            {breadcrumbs.map((crumb, index) => ()
              <React.Fragment key={crumb.path}>
                {index > 0 && <span>{'>'}</span>}
                <button
                  onClick={() => setCurrentFolder(crumb.path)}
                  style={{
  backgroundColor: 'transparent',
  border: 'none',
  color: index === breadcrumbs.length - 1 ? styles.text : styles.textSecondary,
  fontSize: '13px',
  cursor: index === breadcrumbs.length - 1 ? 'default' : 'pointer',
  textDecoration: 'none',
}}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
          {/* File Grid/List */}
          <div style={{
  flex: 1,
  padding: '16px',
  overflow: 'auto',
}}>
            {loading ? ()
              <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  color: styles.textSecondary,
}}>
                Loading projects...
              </div>
            ) : filteredAndSortedFiles.length === 0 ? ()
              <div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  color: styles.textSecondary,
  textAlign: 'center',
}}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>No projects found</div>
                <div style={{ fontSize: '14px' }}>
                  {viewState.filterText ? 'Try adjusting your search terms' : 'Create your first project to get started'}
                </div>
              </div>
            ) : ()
              <div style={{
  display: 'grid',
  gridTemplateColumns: viewState.viewMode === 'grid' ,
  ? 'repeat(auto-fill, minmax(200px, 1fr))'
  : '1fr',
  gap: viewState.viewMode === 'grid' ? '16px' : '4px',
}}>
                {filteredAndSortedFiles.map(file => ()
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    onDoubleClick={() => handleFileDoubleClick(file)}
                    onContextMenu={(e) => handleFileContextMenu(e, file)}
                    style={{
                      padding: viewState.viewMode === 'grid' ? '16px' : '8px 12px',
                      backgroundColor: selectedFile?.id === file.id ? styles.selection : 'transparent',
                      border: `1px solid ${selectedFile?.id === file.id ? styles.accent : 'transparent'}`}
},
  borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: viewState.viewMode === 'grid' ? 'column' : 'row',
                      alignItems: viewState.viewMode === 'grid' ? 'center' : 'center',
                      gap: viewState.viewMode === 'grid' ? '8px' : '12px';
  }}
                    onMouseOver={(e) => {
                      if (selectedFile?.id !== file.id) {
                        e.currentTarget.style.backgroundColor = styles.hover;
                    }}
                    onMouseOut={(e) => {
                      if (selectedFile?.id !== file.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* File Icon/Thumbnail */}
                    <div style={{
  width: viewState.viewMode === 'grid' ? '64px' : '32px',
  height: viewState.viewMode === 'grid' ? '64px' : '32px',
  backgroundColor: styles.tertiary,
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: viewState.viewMode === 'grid' ? '24px' : '16px',
  flexShrink: 0,
}}>
                      📄
                    </div>
                    {/* File Info */}
                    <div style={{
  flex: 1,
  textAlign: viewState.viewMode === 'grid' ? 'center' : 'left',
  overflow: 'hidden',
}}>
                      <div style={{
  fontWeight: '500',
  fontSize: viewState.viewMode === 'grid' ? '14px' : '13px',
  marginBottom: '2px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}}>
                        {file.metadata.title || file.name.replace('.psg', '')}
                        {file.isFavorite && <span style={{ marginLeft: '4px' }}>⭐</span>}
                      </div>
                      {viewState.viewMode !== 'list' && ()
                        <div style={{
  fontSize: '12px',
  color: styles.textSecondary,
  marginBottom: '4px',
}}>
                          {file.nodeCount} nodes • {formatFileSize(file.size)}
                        </div>
                      )}
                      <div style={{
  fontSize: '11px',
  color: styles.textSecondary,
}}>
                        {formatDate(file.lastModified)}
                      </div>
                    </div>
                    {/* List view additional info */}
                    {viewState.viewMode === 'list' && ()
                      <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  fontSize: '12px',
  color: styles.textSecondary,
  minWidth: '200px',
}}>
                        <span>{file.nodeCount} nodes</span>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Context Menu */}
      {contextMenu && ()
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: styles.secondary,
            border: `1px solid ${styles.border}`}
},
  borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            zIndex: 10000,
            padding: '4px 0',
            minWidth: '180px';
  }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenuActions.map(action => ()
            action.separator ? ()
              <div
                key={action.id}
                style={{
  height: '1px',
  backgroundColor: styles.border,
  margin: '4px 0',
}}
              />
            ) : ()
              <button
                key={action.id}
                onClick={() => action.action(contextMenu.file)}
                style={{
  width: '100%',
  padding: '8px 16px',
  backgroundColor: 'transparent',
  border: 'none',
  color: action.destructive ? '#ef4444' : styles.text,
  fontSize: '13px',
  textAlign: 'left',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.hover}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
          ))}
        </div>
      )}
      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".psg"
        style={{ display: 'none' }}
        onChange={(e) => {
  // Handle file upload
  const file = e.target.files?.[0];
  if (file) {
  // Process uploaded file
  console.log('File uploaded:', file);
}}
      />
    </div>
  );
};

export default IntegratedFileBrowser;
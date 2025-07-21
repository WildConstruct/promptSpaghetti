/**
 * FileBrowser - Main file browser component with tree view and file operations
 * 
 * Provides comprehensive file management interface with:
 * - Tree-structured navigation
 * - Drag-and-drop file operations
 * - Context menus for file actions
 * - Search and filtering
 * - Multi-selection support
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useFileOperationTracking } from '../../hooks/useFileBrowserAnalytics';
import { FolderTree } from './FolderTree';
import { ContextMenu } from './ContextMenu';
import { FileSearchBar } from './FileSearchBar';
import { FileOperationToast } from './FileOperationToast';
import { 
  FileBrowserProps, 
  FileBrowserState, 
  TreeNode, 
  FileItem,
  ContextMenuOptions,
  DragDropData,
  FileOperation
} from './types';

// Mock data for development - will be replaced with API calls
const mockFiles: TreeNode[] = [
  {
    id: 'root',
    name: 'My Projects',
    type: 'folder',
    path: '/',
    lastModified: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    tags: [],
    children: [
      {
        id: 'f1',
        name: 'Workflows',
        type: 'folder',
        path: '/workflows',
        lastModified: new Date('2024-01-10'),
        createdAt: new Date('2024-01-05'),
        tags: ['category'],
        children: [
          {
            id: 'file1',
            name: 'Customer Service Bot.psg',
            type: 'file',
            path: '/workflows/Customer Service Bot.psg',
            lastModified: new Date('2024-01-12'),
            createdAt: new Date('2024-01-10'),
            size: 1024 * 12,
            tags: ['chatbot', 'customer-service'],
            extension: 'psg',
            mimeType: 'application/psg',
            metadata: {
              nodeCount: 15,
              edgeCount: 18,
              description: 'Automated customer service workflow',
              author: 'John Doe'
            }
          }
        ],
        isExpanded: false,
        childCount: 1
      },
      {
        id: 'f2',
        name: 'Templates',
        type: 'folder',
        path: '/templates',
        lastModified: new Date('2024-01-14'),
        createdAt: new Date('2024-01-02'),
        tags: ['templates'],
        children: [
          {
            id: 'file2',
            name: 'Basic Prompt Chain.psg',
            type: 'file',
            path: '/templates/Basic Prompt Chain.psg',
            lastModified: new Date('2024-01-14'),
            createdAt: new Date('2024-01-12'),
            size: 1024 * 8,
            tags: ['template', 'basic'],
            extension: 'psg',
            mimeType: 'application/psg',
            metadata: {
              nodeCount: 8,
              edgeCount: 7,
              description: 'Simple prompt chaining template',
              author: 'Jane Smith'
            }
          }
        ],
        isExpanded: false,
        childCount: 1
      }
    ],
    isExpanded: true,
    childCount: 2
  }
];

const initialState: FileBrowserState = {
  rootPath: '/',
  currentPath: '/',
  selectedItems: [],
  expandedFolders: new Set(['/root']),
  viewMode: 'tree',
  sortBy: 'name',
  sortOrder: 'asc',
  searchTerm: '',
  filterTags: [],
  isLoading: false,
  error: null
};

export const FileBrowser: React.FC<FileBrowserProps> = ({
  initialPath = '/',
  onFileSelect,
  onFileDoubleClick,
  onSelectionChange,
  showCreateFolder = true,
  showUpload = true,
  allowMultiSelect = true,
  height = 400,
  className = ''
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const analytics = useFileOperationTracking();
  const [state, setState] = useState<FileBrowserState>({
    ...initialState,
    currentPath: initialPath
  });
  const [treeData, setTreeData] = useState<TreeNode[]>(mockFiles);
  const [contextMenu, setContextMenu] = useState<ContextMenuOptions | null>(null);
  const [operations, setOperations] = useState<FileOperation[]>([]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadDirectory(state.currentPath);
    }
  }, [isAuthenticated, state.currentPath]);

  // File operations
  const loadDirectory = useCallback(async (path: string) => {
    const stopTimer = analytics.startTimer('directory_load');
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // TODO: Replace with API call
      // const response = await fetch(`/api/files/list?path=${encodeURIComponent(path)}`);
      // const data = await response.json();
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setTreeData(mockFiles);
      
      // Track successful directory load
      await analytics.trackDirectoryLoad(path, mockFiles.length);
      stopTimer();
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      stopTimer();
      
      // Track failed directory load
      await analytics.trackFileOperation('directory_load', '', path, false, {
        errorMessage: error instanceof Error ? error.message : 'Failed to load directory'
      });
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load directory'
      }));
    }
  }, [analytics]);

  const handleItemSelect = useCallback((itemId: string, multiSelect = false) => {
    setState(prev => {
      let newSelection: string[];
      
      if (multiSelect && allowMultiSelect) {
        newSelection = prev.selectedItems.includes(itemId)
          ? prev.selectedItems.filter(id => id !== itemId)
          : [...prev.selectedItems, itemId];
      } else {
        newSelection = [itemId];
      }

      // Track file selection
      analytics.trackFileOperation('select', itemId, itemId, true, {
        multiSelect,
        selectionCount: newSelection.length
      });

      onSelectionChange?.(newSelection);
      return { ...prev, selectedItems: newSelection };
    });
  }, [allowMultiSelect, onSelectionChange, analytics]);

  const handleFolderExpand = useCallback((folderId: string) => {
    // Track folder expansion
    analytics.trackFileOperation('expand_folder', '', folderId, true);
    
    setState(prev => ({
      ...prev,
      expandedFolders: new Set([...prev.expandedFolders, folderId])
    }));
  }, [analytics]);

  const handleFolderCollapse = useCallback((folderId: string) => {
    // Track folder collapse
    analytics.trackFileOperation('collapse_folder', '', folderId, true);
    
    setState(prev => {
      const newExpanded = new Set(prev.expandedFolders);
      newExpanded.delete(folderId);
      return { ...prev, expandedFolders: newExpanded };
    });
  }, [analytics]);

  const handleContextMenu = useCallback((item: FileItem, x: number, y: number) => {
    // Track context menu usage
    analytics.trackFileOperation('context_menu', item.name, item.path, true);
    
    const menuItems = [
      {
        id: 'open',
        label: item.type === 'folder' ? 'Open Folder' : 'Open File',
        icon: '📂',
        onClick: () => {
          if (item.type === 'file') {
            const fileNode = item as any; // Type assertion for file node
            analytics.trackFileOperation('open', item.name, item.path, true);
            onFileDoubleClick?.(fileNode);
          }
        }
      },
      { id: 'sep1', label: '', separator: true },
      {
        id: 'rename',
        label: 'Rename',
        icon: '✏️',
        onClick: () => handleRename(item)
      },
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: '📋',
        disabled: item.type === 'folder',
        onClick: () => handleDuplicate(item)
      },
      { id: 'sep2', label: '', separator: true },
      {
        id: 'delete',
        label: 'Delete',
        icon: '🗑️',
        onClick: () => handleDelete(item)
      },
      { id: 'sep3', label: '', separator: true },
      {
        id: 'properties',
        label: 'Properties',
        icon: 'ℹ️',
        onClick: () => handleShowProperties(item)
      }
    ];

    setContextMenu({ x, y, items: menuItems, targetItem: item });
  }, [onFileDoubleClick]);

  const handleDrop = useCallback((dragData: DragDropData) => {
    // TODO: Implement drag and drop operations
    const operation: FileOperation = {
      id: `op-${Date.now()}`,
      type: dragData.operation === 'copy' ? 'copy' : 'move',
      sourcePath: dragData.sourceItems[0]?.path || '',
      targetPath: dragData.targetPath,
      timestamp: new Date(),
      status: 'pending'
    };

    setOperations(prev => [...prev, operation]);
    
    // Simulate operation
    setTimeout(() => {
      setOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'success' as const }
          : op
      ));
    }, 1000);
  }, []);

  // File operation handlers
  const handleRename = (item: FileItem) => {
    const newName = prompt('Enter new name:', item.name);
    if (newName && newName !== item.name) {
      // TODO: Implement rename operation
      console.log('Rename:', item.path, '->', newName);
    }
  };

  const handleDuplicate = (item: FileItem) => {
    // TODO: Implement duplicate operation
    console.log('Duplicate:', item.path);
  };

  const handleDelete = (item: FileItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      // TODO: Implement delete operation
      console.log('Delete:', item.path);
    }
  };

  const handleShowProperties = (item: FileItem) => {
    // TODO: Show properties modal
    console.log('Properties for:', item.path);
  };

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:');
    if (name) {
      // TODO: Implement create folder operation
      console.log('Create folder:', name);
    }
  };

  const handleUpload = () => {
    // TODO: Implement file upload
    console.log('Upload files');
  };

  // Search and filter handlers
  const handleSearch = useCallback((searchTerm: string) => {
    // Track search operation
    if (searchTerm.trim()) {
      // Simulate search results for analytics
      const mockResults = treeData.flatMap(node => 
        node.children?.filter(child => 
          child.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || []
      );
      
      analytics.trackSearchWithResults(searchTerm, mockResults);
    }
    
    setState(prev => ({ ...prev, searchTerm }));
  }, [analytics, treeData]);

  const filteredAndSortedData = React.useMemo(() => {
    // TODO: Implement proper filtering and sorting
    return treeData;
  }, [treeData, state.searchTerm, state.sortBy, state.sortOrder]);

  if (!isAuthenticated) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#666',
        height: typeof height === 'number' ? height : '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Please log in to access your files.
      </div>
    );
  }

  return (
    <div 
      className={`file-browser ${className}`}
      style={{ 
        height, 
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header with search and actions */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <FileSearchBar
          value={state.searchTerm}
          onChange={handleSearch}
          placeholder="Search files..."
        />
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {showCreateFolder && (
            <button
              onClick={handleCreateFolder}
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                backgroundColor: '#fff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Create Folder"
            >
              📁+
            </button>
          )}
          
          {showUpload && (
            <button
              onClick={handleUpload}
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                backgroundColor: '#fff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              title="Upload Files"
            >
              ⬆️
            </button>
          )}
        </div>
      </div>

      {/* Tree view */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {state.isLoading ? (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#666'
          }}>
            Loading files...
          </div>
        ) : state.error ? (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#dc3545',
            textAlign: 'center'
          }}>
            <div>Error loading files:</div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>{state.error}</div>
          </div>
        ) : (
          <FolderTree
            nodes={filteredAndSortedData}
            selectedItems={state.selectedItems}
            expandedFolders={state.expandedFolders}
            onSelect={handleItemSelect}
            onExpand={handleFolderExpand}
            onCollapse={handleFolderCollapse}
            onContextMenu={handleContextMenu}
            onDrop={handleDrop}
          />
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          options={contextMenu}
          onClose={() => setContextMenu(null)}
          onItemClick={(item) => {
            item.onClick?.();
            setContextMenu(null);
          }}
        />
      )}

      {/* File Operations Toast */}
      {operations.length > 0 && (
        <FileOperationToast
          operations={operations.filter(op => op.status === 'pending')}
          onClose={(operationId) => {
            setOperations(prev => prev.filter(op => op.id !== operationId));
          }}
        />
      )}
    </div>
  );
};

export default FileBrowser;
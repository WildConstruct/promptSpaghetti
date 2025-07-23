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
import { fileService } from '../../services/fileService';
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
  const [searchOptions, setSearchOptions] = useState({
    includeContents: false,
    caseSensitive: false,
    useRegex: false,
    includeFolders: true,
    fileTypes: ['.psg', '.txt', '.md', '.json']
  });

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

  const handleDrop = useCallback(async (dragData: DragDropData) => {
    // Create operation record for tracking
    const operation: FileOperation = {
      id: `op-${Date.now()}`,
      type: dragData.operation === 'copy' ? 'copy' : 'move',
      sourcePath: dragData.sourceItems[0]?.path || '',
      targetPath: dragData.targetPath,
      timestamp: new Date(),
      status: 'pending'
    };

    setOperations(prev => [...prev, operation]);
    
    try {
      // Process each source item
      const results = await Promise.all(
        dragData.sourceItems.map(async (item) => {
          const targetItemPath = `${dragData.targetPath}/${item.name}`;
          
          if (dragData.operation === 'copy') {
            return await fileService.copyFile(item.path, targetItemPath);
          } else {
            return await fileService.moveFile(item.path, targetItemPath);
          }
        })
      );

      // Check if all operations succeeded
      const allSucceeded = results.every(result => result.success);
      
      if (allSucceeded) {
        setOperations(prev => prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'success' as const }
            : op
        ));

        // Track successful operation
        analytics.trackFileOperation({
          operation: dragData.operation,
          itemCount: dragData.sourceItems.length,
          success: true
        });

        // Refresh the directory view
        const updatedData = await fileService.listDirectory(state.currentPath);
        setTreeData(updatedData);
        
      } else {
        // Handle partial failures
        const failedResults = results.filter(result => !result.success);
        const errorMessage = failedResults.map(result => result.error || result.message).join(', ');
        
        setOperations(prev => prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'error' as const, error: errorMessage }
            : op
        ));

        analytics.trackFileOperation({
          operation: dragData.operation,
          itemCount: dragData.sourceItems.length,
          success: false,
          error: errorMessage
        });
      }
    } catch (error) {
      // Handle operation failure
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'error' as const, error: errorMessage }
          : op
      ));

      analytics.trackFileOperation({
        operation: dragData.operation,
        itemCount: dragData.sourceItems.length,
        success: false,
        error: errorMessage
      });

      console.error('Drag and drop operation failed:', error);
    }
  }, [analytics, state.currentPath]);

  // File operation handlers
  const handleRename = async (item: FileItem) => {
    const newName = prompt('Enter new name:', item.name);
    if (newName && newName !== item.name) {
      try {
        const result = await fileService.renameFile(item.path, newName);
        if (result.success) {
          // Refresh the directory view
          const updatedData = await fileService.listDirectory(state.currentPath);
          setTreeData(updatedData);
          
          analytics.trackFileOperation({
            operation: 'rename',
            itemCount: 1,
            success: true
          });
        } else {
          alert(`Failed to rename file: ${result.error || result.message}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Failed to rename file: ${errorMessage}`);
        console.error('Rename operation failed:', error);
      }
    }
  };

  const handleDuplicate = async (item: FileItem) => {
    try {
      // Generate a unique name for the duplicate
      const fileExtension = item.name.includes('.') ? `.${item.name.split('.').pop()}` : '';
      const baseName = item.name.replace(fileExtension, '');
      const duplicateName = `${baseName} - Copy${fileExtension}`;
      const duplicatePath = `${item.path.split('/').slice(0, -1).join('/')}/${duplicateName}`;
      
      const result = await fileService.copyFile(item.path, duplicatePath);
      if (result.success) {
        // Refresh the directory view
        const updatedData = await fileService.listDirectory(state.currentPath);
        setTreeData(updatedData);
        
        analytics.trackFileOperation({
          operation: 'copy',
          itemCount: 1,
          success: true
        });
      } else {
        alert(`Failed to duplicate file: ${result.error || result.message}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to duplicate file: ${errorMessage}`);
      console.error('Duplicate operation failed:', error);
    }
  };

  const handleDelete = async (item: FileItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        const result = await fileService.deleteFile(item.path);
        if (result.success) {
          // Refresh the directory view
          const updatedData = await fileService.listDirectory(state.currentPath);
          setTreeData(updatedData);
          
          analytics.trackFileOperation({
            operation: 'delete',
            itemCount: 1,
            success: true
          });
        } else {
          alert(`Failed to delete file: ${result.error || result.message}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Failed to delete file: ${errorMessage}`);
        console.error('Delete operation failed:', error);
      }
    }
  };

  const handleShowProperties = async (item: FileItem) => {
    try {
      const properties = await fileService.getProperties(item.path);
      if (properties) {
        // For now, show properties in an alert - later this would be a proper modal
        const info = [
          `Name: ${properties.name}`,
          `Type: ${properties.type}`,
          `Path: ${properties.path}`,
          `Size: ${properties.size ? Math.round(properties.size / 1024) + ' KB' : 'N/A'}`,
          `Created: ${properties.createdAt.toLocaleDateString()}`,
          `Modified: ${properties.lastModified.toLocaleDateString()}`,
          `Tags: ${properties.tags.join(', ') || 'None'}`
        ];
        
        if (properties.metadata) {
          if (properties.metadata.nodeCount) info.push(`Nodes: ${properties.metadata.nodeCount}`);
          if (properties.metadata.edgeCount) info.push(`Connections: ${properties.metadata.edgeCount}`);
          if (properties.metadata.author) info.push(`Author: ${properties.metadata.author}`);
          if (properties.metadata.version) info.push(`Version: ${properties.metadata.version}`);
          if (properties.metadata.description) info.push(`Description: ${properties.metadata.description}`);
        }
        
        alert(`Properties for ${item.name}:\n\n${info.join('\n')}`);
      } else {
        alert('Unable to load file properties');
      }
    } catch (error) {
      console.error('Failed to get properties:', error);
      alert('Failed to load file properties');
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (name) {
      try {
        const result = await fileService.createFolder(state.currentPath, name);
        if (result.success) {
          // Refresh the directory view
          const updatedData = await fileService.listDirectory(state.currentPath);
          setTreeData(updatedData);
          
          analytics.trackFileOperation({
            operation: 'create',
            itemCount: 1,
            success: true
          });
        } else {
          alert(`Failed to create folder: ${result.error || result.message}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Failed to create folder: ${errorMessage}`);
        console.error('Create folder operation failed:', error);
      }
    }
  };

  const handleUpload = async () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.psg,application/json,.json'; // Accept project files and JSON
    
    input.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        try {
          // Upload files one by one
          const results = await Promise.all(
            Array.from(files).map(file => fileService.uploadFile(state.currentPath, file))
          );
          
          const successCount = results.filter(result => result.success).length;
          const failCount = results.length - successCount;
          
          if (successCount > 0) {
            // Refresh the directory view
            const updatedData = await fileService.listDirectory(state.currentPath);
            setTreeData(updatedData);
            
            analytics.trackFileOperation({
              operation: 'upload',
              itemCount: successCount,
              success: true
            });
            
            if (failCount === 0) {
              alert(`Successfully uploaded ${successCount} file(s)`);
            } else {
              alert(`Uploaded ${successCount} file(s), ${failCount} failed`);
            }
          } else {
            alert('All uploads failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          alert(`Failed to upload files: ${errorMessage}`);
          console.error('Upload operation failed:', error);
        }
      }
    };
    
    // Trigger file selection dialog
    input.click();
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

  const handleAdvancedSearch = useCallback((options: any) => {
    setSearchOptions(options);
  }, []);

  const handleTagFilter = useCallback((tag: string) => {
    setState(prev => ({
      ...prev,
      filterTags: prev.filterTags.includes(tag) 
        ? prev.filterTags.filter(t => t !== tag)
        : [...prev.filterTags, tag]
    }));
  }, []);

  const filteredAndSortedData = React.useMemo(() => {
    // Deep clone to avoid mutating original data
    const cloneTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => ({
        ...node,
        children: node.children ? cloneTree(node.children) : undefined
      }));
    };

    let processedData = cloneTree(treeData);

    // Apply search filter if search term exists
    if (state.searchTerm.trim()) {
      let searchTerm = state.searchTerm.trim();
      if (!searchOptions.caseSensitive) {
        searchTerm = searchTerm.toLowerCase();
      }
      
      const filterTree = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.reduce((acc: TreeNode[], node) => {
          // Skip folders if not included in search options
          if (node.type === 'folder' && !searchOptions.includeFolders) {
            // Still process children
            const filteredChildren = node.children ? filterTree(node.children) : [];
            if (filteredChildren.length > 0) {
              acc.push({
                ...node,
                children: filteredChildren,
                isExpanded: true
              });
            }
            return acc;
          }

          // Filter by file type if it's a file
          if (node.type === 'file' && node.extension) {
            const hasAllowedExtension = searchOptions.fileTypes.includes(node.extension);
            if (!hasAllowedExtension) return acc;
          }

          const getValue = (text: string) => searchOptions.caseSensitive ? text : text.toLowerCase();
          
          let matchesName = false;
          let matchesTags = false;
          let matchesPath = false;
          let matchesMetadata = false;

          if (searchOptions.useRegex) {
            try {
              const regex = new RegExp(searchTerm, searchOptions.caseSensitive ? 'g' : 'gi');
              matchesName = regex.test(node.name);
              matchesTags = node.tags?.some(tag => regex.test(tag)) || false;
              matchesPath = regex.test(node.path);
              matchesMetadata = node.type === 'file' && node.metadata && (
                regex.test(node.metadata.description || '') ||
                regex.test(node.metadata.author || '')
              );
            } catch (e) {
              // Fall back to simple string matching on regex error
              matchesName = getValue(node.name).includes(searchTerm);
              matchesTags = node.tags?.some(tag => getValue(tag).includes(searchTerm)) || false;
              matchesPath = getValue(node.path).includes(searchTerm);
              matchesMetadata = node.type === 'file' && node.metadata && (
                getValue(node.metadata.description || '').includes(searchTerm) ||
                getValue(node.metadata.author || '').includes(searchTerm)
              );
            }
          } else {
            matchesName = getValue(node.name).includes(searchTerm);
            matchesTags = node.tags?.some(tag => getValue(tag).includes(searchTerm)) || false;
            matchesPath = getValue(node.path).includes(searchTerm);
            matchesMetadata = node.type === 'file' && node.metadata && (
              getValue(node.metadata.description || '').includes(searchTerm) ||
              getValue(node.metadata.author || '').includes(searchTerm)
            );
          }

          // Check if this node matches
          const nodeMatches = matchesName || matchesTags || matchesPath || matchesMetadata;

          // Process children recursively
          const filteredChildren = node.children ? filterTree(node.children) : [];
          const hasMatchingChildren = filteredChildren.length > 0;

          // Include node if it matches or has matching children
          if (nodeMatches || hasMatchingChildren) {
            acc.push({
              ...node,
              children: filteredChildren.length > 0 ? filteredChildren : node.children,
              // Auto-expand folders with matches during search
              isExpanded: hasMatchingChildren || node.isExpanded
            });
          }

          return acc;
        }, []);
      };

      processedData = filterTree(processedData);
    }

    // Apply tag filters
    if (state.filterTags.length > 0) {
      const filterByTags = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.reduce((acc: TreeNode[], node) => {
          const hasRequiredTags = state.filterTags.every(tag => 
            node.tags?.some(nodeTag => nodeTag.toLowerCase() === tag.toLowerCase())
          );

          const filteredChildren = node.children ? filterByTags(node.children) : [];
          const hasMatchingChildren = filteredChildren.length > 0;

          if (hasRequiredTags || hasMatchingChildren) {
            acc.push({
              ...node,
              children: filteredChildren.length > 0 ? filteredChildren : node.children
            });
          }

          return acc;
        }, []);
      };

      processedData = filterByTags(processedData);
    }

    // Apply sorting
    const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => ({
        ...node,
        children: node.children ? sortNodes(node.children) : undefined
      })).sort((a, b) => {
        // Always sort folders before files
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;

        let comparison = 0;
        const isAscending = state.sortOrder === 'asc';

        switch (state.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'lastModified':
          comparison = a.lastModified.getTime() - b.lastModified.getTime();
          break;
        case 'size':
          const sizeA = a.type === 'file' ? a.size || 0 : 0;
          const sizeB = b.type === 'file' ? b.size || 0 : 0;
          comparison = sizeA - sizeB;
          break;
        case 'type':
          const extA = a.type === 'file' ? a.extension || '' : '';
          const extB = b.type === 'file' ? b.extension || '' : '';
          comparison = extA.localeCompare(extB);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
        }

        return isAscending ? comparison : -comparison;
      });
    };

    return sortNodes(processedData);
  }, [treeData, state.searchTerm, state.filterTags, state.sortBy, state.sortOrder, searchOptions]);

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
          showAdvanced={true}
          onAdvancedSearch={handleAdvancedSearch}
          onTagFilter={handleTagFilter}
        />

        {/* Sort and filter controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={state.sortBy}
            onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value as any }))}
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: '#fff'
            }}
            title="Sort by"
          >
            <option value="name">Name</option>
            <option value="lastModified">Date Modified</option>
            <option value="size">Size</option>
            <option value="type">Type</option>
          </select>

          <button
            onClick={() => setState(prev => ({ 
              ...prev, 
              sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
            }))}
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              backgroundColor: '#fff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title={`Sort ${state.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {state.sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          {/* Filter badges for active tags */}
          {state.filterTags.map(tag => (
            <span
              key={tag}
              style={{
                padding: '2px 6px',
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                borderRadius: '4px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {tag}
              <button
                onClick={() => setState(prev => ({
                  ...prev,
                  filterTags: prev.filterTags.filter(t => t !== tag)
                }))}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#1976d2',
                  cursor: 'pointer',
                  fontSize: '10px',
                  padding: '0'
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        
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
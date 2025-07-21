/**
 * FileItem - Individual file/folder item component with interaction support
 * 
 * Renders individual tree items with:
 * - Icon display based on file type
 * - Expand/collapse controls for folders
 * - Selection highlighting
 * - Context menu support
 * - Drag and drop functionality
 */

import React from 'react';
import { FileItemProps, DragDropData } from './types';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const getFileIcon = (item: any) => {
  if (item.type === 'folder') {
    return item.isExpanded ? '📂' : '📁';
  }
  
  const extension = item.extension?.toLowerCase();
  switch (extension) {
    case 'psg':
      return '🔗'; // Prompt graph file
    case 'txt':
      return '📄';
    case 'md':
      return '📝';
    case 'json':
      return '📋';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return '🖼️';
    default:
      return '📄';
  }
};

export const FileItem: React.FC<FileItemProps> = ({
  item,
  isSelected,
  isExpanded,
  level,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onToggleExpand,
  onDragStart,
  onDragOver,
  onDrop,
  className = ''
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onSelect(item.id, isMultiSelect);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick(item);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(item, e.clientX, e.clientY);
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'folder' && onToggleExpand) {
      onToggleExpand(item.id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart?.(item);
    
    // Set drag data
    const dragData: DragDropData = {
      sourceItems: [item],
      targetPath: '',
      operation: 'move'
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (item.type === 'folder') {
      onDragOver?.(item, e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const dragDataStr = e.dataTransfer.getData('application/json');
      if (dragDataStr) {
        const dragData: DragDropData = JSON.parse(dragDataStr);
        onDrop?.(item, dragData);
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  };

  const paddingLeft = level * 20 + 8;

  return (
    <div
      className={`file-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px 4px 0',
        paddingLeft: `${paddingLeft}px`,
        cursor: 'pointer',
        borderRadius: '4px',
        margin: '1px 4px',
        minHeight: '24px',
        opacity: isDragging ? 0.5 : 1
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Expand/Collapse Toggle */}
      {item.type === 'folder' ? (
        <div
          className="expand-toggle"
          onClick={handleExpandToggle}
          style={{
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#666',
            userSelect: 'none'
          }}
        >
          {isExpanded ? '▼' : '▶'}
        </div>
      ) : (
        <div style={{ width: '16px', marginRight: '4px' }} />
      )}

      {/* File Icon */}
      <div
        className="file-item-icon"
        style={{
          fontSize: '16px',
          marginRight: '6px',
          userSelect: 'none'
        }}
      >
        {getFileIcon(item)}
      </div>

      {/* File Name */}
      <div className="file-item-text" style={{
        flex: 1,
        fontSize: '14px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {item.name}
      </div>

      {/* Metadata */}
      <div className="file-item-metadata" style={{
        display: 'flex',
        gap: '12px',
        fontSize: '12px',
        color: '#666',
        marginLeft: '8px'
      }}>
        {/* Node count for .psg files */}
        {item.type === 'file' && item.metadata?.nodeCount && (
          <div style={{ minWidth: '40px', textAlign: 'right' }}>
            {item.metadata.nodeCount}n
          </div>
        )}
        
        {/* File size */}
        {item.type === 'file' && item.size && (
          <div className="file-size" style={{ minWidth: '60px', textAlign: 'right' }}>
            {formatFileSize(item.size)}
          </div>
        )}
        
        {/* Child count for folders */}
        {item.type === 'folder' && 'childCount' in item && (
          <div style={{ minWidth: '40px', textAlign: 'right', color: '#888' }}>
            {item.childCount} {item.childCount === 1 ? 'item' : 'items'}
          </div>
        )}

        {/* Last modified date */}
        <div className="file-date" style={{ minWidth: '100px', textAlign: 'right' }}>
          {formatDate(item.lastModified)}
        </div>
      </div>

      {/* Tags indicator */}
      {item.tags && item.tags.length > 0 && (
        <div style={{ 
          marginLeft: '8px',
          fontSize: '10px',
          color: '#007bff',
          opacity: 0.7
        }}>
          {item.tags.length}🏷️
        </div>
      )}

      {/* Shared indicator */}
      {item.isShared && (
        <div style={{
          marginLeft: '4px',
          fontSize: '12px',
          color: '#28a745'
        }}>
          👥
        </div>
      )}
    </div>
  );
};

export default FileItem;
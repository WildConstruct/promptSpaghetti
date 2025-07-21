/**
 * FilePreview - Component for displaying .psg file previews with metadata and thumbnails
 * 
 * Shows graph thumbnails, node counts, metadata, and last modified information
 */

import React, { useCallback, useMemo } from 'react';
import { ProjectMetadata, PSGFile } from '../../projectManager';
import { Graph } from '../../graphSchema';

export interface FilePreviewData {
  fileName: string;
  filePath: string;
  metadata: ProjectMetadata;
  graph: Graph;
  fileSize: number;
  lastModified: Date;
  isFavorite?: boolean;
}

interface FilePreviewProps {
  /** File data for preview */
  file: FilePreviewData;
  
  /** Preview mode - compact for lists, full for modals */
  mode?: 'compact' | 'full';
  
  /** Whether this is a hover preview */
  isHover?: boolean;
  
  /** Click handler for file selection */
  onFileClick?: (file: FilePreviewData) => void;
  
  /** Handler for favoriting files */
  onToggleFavorite?: (file: FilePreviewData) => void;
  
  /** Custom styling */
  style?: React.CSSProperties;
  
  /** CSS class name */
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  mode = 'compact',
  isHover = false,
  onFileClick,
  onToggleFavorite,
  style,
  className
}) => {
  // Calculate graph statistics
  const graphStats = useMemo(() => {
    const nodes = file.graph.nodes || [];
    const edges = file.graph.edges || [];
    
    // Count node types
    const nodeTypes: Record<string, number> = {};
    nodes.forEach(node => {
      const type = node.type || 'unknown';
      nodeTypes[type] = (nodeTypes[type] || 0) + 1;
    });

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodeTypes,
      hasContent: nodes.length > 0 || edges.length > 0
    };
  }, [file.graph]);

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

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

  // Generate simple thumbnail representation
  const generateThumbnail = useCallback(() => {
    const { hasContent, totalNodes, nodeTypes } = graphStats;
    
    if (!hasContent) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          color: '#6c757d',
          fontSize: mode === 'full' ? '14px' : '12px',
          border: '2px dashed #dee2e6',
          borderRadius: '4px'
        }}>
          Empty Graph
        </div>
      );
    }

    // Create a simple visual representation
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Node type indicators */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2px'
        }}>
          {Object.entries(nodeTypes).slice(0, 8).map(([type, count], index) => (
            <div
              key={type}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
                opacity: Math.min(1, count / 5)
              }}
              title={`${type}: ${count}`}
            />
          ))}
        </div>
        
        {/* Connection lines representation */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: '#6c757d'
        }}>
          {totalNodes} nodes
        </div>
      </div>
    );
  }, [graphStats, mode]);

  const handleClick = useCallback(() => {
    onFileClick?.(file);
  }, [onFileClick, file]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(file);
  }, [onToggleFavorite, file]);

  const baseStyles: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: onFileClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    ...(isHover && {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transform: 'translateY(-2px)'
    }),
    ...style
  };

  if (mode === 'compact') {
    return (
      <div
        className={className}
        style={{
          ...baseStyles,
          padding: '12px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          minHeight: '80px'
        }}
        onClick={handleClick}
      >
        {/* Thumbnail */}
        <div style={{ width: '60px', height: '45px', flexShrink: 0 }}>
          {generateThumbnail()}
        </div>

        {/* File info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {file.metadata.name}
          </div>
          
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {file.metadata.description || 'No description'}
          </div>

          <div style={{
            fontSize: '11px',
            color: '#999',
            display: 'flex',
            gap: '12px'
          }}>
            <span>{graphStats.totalNodes} nodes</span>
            <span>{formatFileSize(file.fileSize)}</span>
            <span>{formatRelativeTime(file.lastModified)}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ flexShrink: 0, display: 'flex', gap: '8px' }}>
          {onToggleFavorite && (
            <button
              onClick={handleFavoriteClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: file.isFavorite ? '#ffc107' : '#ccc',
                fontSize: '16px'
              }}
              title={file.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              ★
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full mode for detailed previews/modals
  return (
    <div
      className={className}
      style={{
        ...baseStyles,
        padding: '20px',
        maxWidth: '500px'
      }}
      onClick={handleClick}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {file.metadata.name}
          </h3>
          
          {file.metadata.description && (
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.4'
            }}>
              {file.metadata.description}
            </p>
          )}
        </div>

        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: file.isFavorite ? '#ffc107' : '#ccc',
              fontSize: '18px',
              marginLeft: '12px'
            }}
            title={file.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            ★
          </button>
        )}
      </div>

      {/* Thumbnail */}
      <div style={{
        width: '100%',
        height: '120px',
        marginBottom: '16px'
      }}>
        {generateThumbnail()}
      </div>

      {/* Metadata */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
        <div>
          <strong style={{ color: '#333' }}>Nodes:</strong> {graphStats.totalNodes}
        </div>
        <div>
          <strong style={{ color: '#333' }}>Connections:</strong> {graphStats.totalEdges}
        </div>
        <div>
          <strong style={{ color: '#333' }}>Size:</strong> {formatFileSize(file.fileSize)}
        </div>
        <div>
          <strong style={{ color: '#333' }}>Modified:</strong> {formatRelativeTime(file.lastModified)}
        </div>
        {file.metadata.author && (
          <div style={{ gridColumn: 'span 2' }}>
            <strong style={{ color: '#333' }}>Author:</strong> {file.metadata.author}
          </div>
        )}
        {file.metadata.tags && file.metadata.tags.length > 0 && (
          <div style={{ gridColumn: 'span 2' }}>
            <strong style={{ color: '#333' }}>Tags:</strong> {file.metadata.tags.join(', ')}
          </div>
        )}
      </div>

      {/* Node types breakdown */}
      {Object.keys(graphStats.nodeTypes).length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <strong style={{ color: '#333', fontSize: '12px', marginBottom: '8px', display: 'block' }}>
            Node Types:
          </strong>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px'
          }}>
            {Object.entries(graphStats.nodeTypes).map(([type, count], index) => (
              <span
                key={type}
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 95%)`,
                  color: `hsl(${(index * 137.5) % 360}, 70%, 30%)`,
                  borderRadius: '10px',
                  border: `1px solid hsl(${(index * 137.5) % 360}, 70%, 80%)`
                }}
              >
                {type} ({count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
/**
 * FilePreview - Component for displaying .psg file previews with metadata and thumbnails
 * 
 * Shows graph thumbnails, node counts, metadata, and last modified information
 */
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { PSGFile, projectManager } from '../../projectManager';
}
interface FilePreviewProps {
  /** File data for preview */
  file: PSGFile;
  /** Preview mode - compact for lists, full for modals */
  mode?: 'compact' | 'full';
  /** Whether this is a hover preview */
  isHover?: boolean;
  /** Click handler for file selection */
  onClick?: (file: PSGFile) => void;
  /** Handler for favoriting files */
  onToggleFavorite?: (file: PSGFile) => void;
  /** Custom styling */
  style?: React.CSSProperties;
  /** CSS class name */
  className?: string;
  export const FilePreview: React.FC<FilePreviewProps> = ({,)
  file,
  mode = 'compact',
  isHover = false,
  onClick,
  onToggleFavorite,
  style,
  className
}
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(file.metadata.thumbnail || null);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);
  // Generate thumbnail if not cached
  useEffect(() => {
  if (!thumbnail && !isLoadingThumbnail) {
  setIsLoadingThumbnail(true);
  projectManager.generateThumbnail(file)
  .then(setThumbnail)
  .catch((error) => {
  console.warn('Failed to generate thumbnail:', error);
}
        .finally(() => setIsLoadingThumbnail(false));
  }, [file, thumbnail, isLoadingThumbnail]);
  // Memoized stats calculation
  const fileStats = useMemo(() => {
  const nodeCount = file.nodeCount;
  return {
  totalNodes: nodeCount,
  hasContent: nodeCount > 0,
};
  }, [file.nodeCount]);
  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }, []);
  // Format relative time
  const formatRelativeTime = useCallback((date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;}
    if (diffHours < 24) return `${diffHours}h ago`;}
    if (diffDays < 7) return `${diffDays}d ago`;}
    return date.toLocaleString();
  }, []);
  // Render thumbnail
  const renderThumbnail = useCallback(() => {
    if (thumbnail) {
      return;
        <img
          src={thumbnail}
          alt={`${file.name} preview`}
          style={{
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '4px',
}}
        />
      );
    if (isLoadingThumbnail) {
  return;
  <div style={{
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8f9fa',
  color: '#6c757d',
  fontSize: '12px',
  border: '1px solid #dee2e6',
  borderRadius: '4px',
}}>
          Loading...
        </div>
      );
    const { hasContent, totalNodes } = fileStats;
    if (!hasContent) {
  return;
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
  borderRadius: '4px',
}}>
          Empty Graph
        </div>
      );
    // Fallback visual representation
    return;
      <div style={{
  width: '100%',
  height: '100%',
  backgroundColor: '#fff',
  border: '1px solid #dee2e6',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  color: '#6c757d',
}}>
{totalNodes} nodes
      </div>
    );
  }, [thumbnail, isLoadingThumbnail, fileStats, file.name, mode]);
  const handleClick = useCallback(() => {
    onClick?.(file);
  }, [onClick, file]);
  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(file);
  }, [onToggleFavorite, file]);
  const baseStyles: React.CSSProperties = {,
  backgroundColor: '#fff',
  border: '1px solid #dee2e6',
  borderRadius: '8px',
  cursor: onClick ? 'pointer' : 'default',
  transition: 'all 0.2s ease',
  ...(isHover && {)
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transform: 'translateY(-2px)',
}),
    ...style
  };
  if (mode === 'compact') {
    return;
      <div
        className={className}
        style={{
  ...baseStyles,
  padding: '12px',
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  minHeight: '80px',
}}
        onClick={handleClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `Open ${file.metadata?.title || file.name}` : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        } : undefined}
      >
        {/* Thumbnail */}
        <div style={{ width: '60px', height: '45px', flexShrink: 0 }}>
          {renderThumbnail()}
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
  whiteSpace: 'nowrap',
}}>
{file.metadata?.title || file.name}
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
            <span>{fileStats.totalNodes} nodes</span>
            <span>{formatFileSize(file.size)}</span>
            <span>{formatRelativeTime(file.lastModified)}</span>
          </div>
        </div>
        {/* Actions */}
        <div style={{ flexShrink: 0, display: 'flex', gap: '8px' }}>
          {onToggleFavorite && ()
            <button
              onClick={handleFavoriteClick}
              style={{
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  color: file.isFavorite ? '#ffc107' : '#ccc',
  fontSize: '16px',
}}
              title={file.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              ⭐
            </button>
          )}
        </div>
      </div>
    );
  // Full mode for detailed previews/modals
  return;
    <div
      className={className}
      style={{
  ...baseStyles,
  padding: '20px',
  maxWidth: '500px',
}}
      onClick={handleClick}
    >
      {/* Header */}
      <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px',
}}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
  margin: '0 0 8px 0',
  fontSize: '18px',
  fontWeight: '600',
  color: '#333',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}}>
            {file.metadata?.title || file.name}
          </h3>
          {file.metadata.description && ()
            <p style={{
  margin: '0 0 8px 0',
  fontSize: '14px',
  color: '#666',
  lineHeight: '1.4',
}}>
              {file.metadata.description}
            </p>
          )}
        </div>
        {onToggleFavorite && ()
          <button
            onClick={handleFavoriteClick}
            style={{
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  color: file.isFavorite ? '#ffc107' : '#ccc',
  fontSize: '18px',
  marginLeft: '12px',
}}
            title={file.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            ⭐
          </button>
        )}
      </div>
      {/* Thumbnail */}
      <div style={{
  width: '100%',
  height: '120px',
  marginBottom: '16px',
}}>
        {renderThumbnail()}
      </div>
      {/* Metadata */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
        <div>
          <strong style={{ color: '#333' }}>Nodes:</strong> {fileStats.totalNodes}
        </div>
        <div>
          <strong style={{ color: '#333' }}>Size:</strong> {formatFileSize(file.size)}
        </div>
        <div>
          <strong style={{ color: '#333' }}>Modified:</strong> {formatRelativeTime(file.lastModified)}
        </div>
        <div>
          <strong style={{ color: '#333' }}>Created:</strong> {file.metadata.created?.toLocaleDateString()}
        </div>
        {file.metadata.author && ()
          <div style={{ gridColumn: 'span 2' }}>
            <strong style={{ color: '#333' }}>Author:</strong> {file.metadata.author}
          </div>
        )}
        {file.metadata.version && ()
          <div style={{ gridColumn: 'span 2' }}>
            <strong style={{ color: '#333' }}>Version:</strong> v{file.metadata.version}
          </div>
        )}
        {file.metadata.tags && file.metadata.tags.length > 0 && ()
          <div style={{ gridColumn: 'span 2' }}>
            <strong style={{ color: '#333' }}>Tags:</strong> {file.metadata.tags.map((tag, index) => ()
              <span key={tag}>
                {index > 0 && ', '}
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Memoized component for performance
const MemoizedFilePreview = React.memo(FilePreview, (prevProps, nextProps) => {
  // Only re-render if file properties change
  return;
    prevProps.file.id === nextProps.file.id &&
    prevProps.file.lastModified.getTime() === nextProps.file.lastModified.getTime() &&
    prevProps.file.isFavorite === nextProps.file.isFavorite &&
    prevProps.mode === nextProps.mode &&
    prevProps.isHover === nextProps.isHover
  );
});
MemoizedFilePreview.displayName = 'FilePreview';

export default MemoizedFilePreview;
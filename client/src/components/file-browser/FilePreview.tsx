/**
 * FilePreview - Component for displaying file previews with graph thumbnails
 * 
 * Features:
 * - Graph thumbnail generation and display
 * - File metadata preview
 * - Quick actions (open, favorite, etc.)
 * - Loading states and error handling
 */
import React, { useState, useEffect, useCallback } from 'react';
import { FileItem, FileMetadata } from './types';
import { useAuthStore } from '../../stores/authStore';


interface FilePreviewProps {
  file: FileItem | null;
  onOpen?: (file: FileItem) => void;
  onFavorite?: (file: FileItem, isFavorite: boolean) => void;
  onClose?: () => void;
  className?: string;
  interface PreviewData {
  thumbnail?: string;
  metadata?: FileMetadata;
  content?: {,
  nodeCount: number;,
  edgeCount: number;,
  lastModified: Date;,
  size: number;


};
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
    return 'Today ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 else if (diffDays === 1) {
    return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 else if (diffDays < 7) {
    return `${diffDays} days ago`;}
 else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const FilePreview: React.FC<FilePreviewProps> = ({)
  file,
  onOpen,
  onFavorite,
  onClose,
  className = ''
}) => {
  const { isAuthenticated } = useAuthStore();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  // Load preview data for file
  const loadPreviewData = useCallback(async (fileItem: FileItem) => {
    if (!isAuthenticated || fileItem.type !== 'file') return;
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/files/preview/${fileItem.id}`);}
      // const data = await response.json();
      // Mock preview data for development
      const mockData: PreviewData = {,
  thumbnail: generateMockThumbnail(fileItem),
  metadata: fileItem.metadata,
  content: {,
  nodeCount: fileItem.metadata?.nodeCount || 0,
  edgeCount: fileItem.metadata?.edgeCount || 0,
  lastModified: fileItem.lastModified,
  size: fileItem.size || 0,
};
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setPreviewData(mockData);
 catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load preview');
 finally {
      setIsLoading(false);
  }, [isAuthenticated]);
  // Generate mock thumbnail for development
  const generateMockThumbnail = (fileItem: FileItem): string => {
    // Create a simple SVG thumbnail based on file properties
    const nodeCount = fileItem.metadata?.nodeCount || 3;
    const edgeCount = fileItem.metadata?.edgeCount || 2;
    const svg = `;
      <svg width="200" height="120" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="120" fill="#f8f9fa" stroke="#dee2e6"/>
        <circle cx="40" cy="40" r="15" fill="#007bff" stroke="#0056b3"/>
        <circle cx="120" cy="40" r="15" fill="#28a745" stroke="#1e7e34"/>
        <circle cx="80" cy="80" r="15" fill="#ffc107" stroke="#e0a800"/>
        ${nodeCount > 3 ? '<circle cx="160" cy="80" r="15" fill="#dc3545" stroke="#c82333"/>' : ''}
        <line x1="55" y1="40" x2="105" y2="40" stroke="#6c757d" stroke-width="2"/>
        <line x1="95" y1="55" x2="65" y2="75" stroke="#6c757d" stroke-width="2"/>
        ${edgeCount > 2 ? '<line x1="95" y1="80" x2="145" y2="80" stroke="#6c757d" stroke-width="2"/>' : ''}
        <text x="10" y="110" font-family="Arial, sans-serif" font-size="10" fill="#6c757d">
          ${nodeCount} nodes, ${edgeCount} edges}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;}
  };
  // Load favorites status
  useEffect(() => {
  if (file) {
  // TODO: Load from API or localStorage,
  const favorites = JSON.parse(localStorage.getItem('fileBrowserFavorites') || '[]');
  setIsFavorited(favorites.includes(file.id));
  loadPreviewData(file);
}, [file, loadPreviewData]);
  const handleFavoriteToggle = useCallback(() => {
  if (!file) return;
  const newFavoriteState = !isFavorited;
  setIsFavorited(newFavoriteState);
  // Update localStorage
  const favorites = JSON.parse(localStorage.getItem('fileBrowserFavorites') || '[]');
  const updatedFavorites = newFavoriteState;
  ? [...favorites, file.id]
  : favorites.filter((id: string) => id !== file.id);
  localStorage.setItem('fileBrowserFavorites', JSON.stringify(updatedFavorites));
  onFavorite?.(file, newFavoriteState);
}, [file, isFavorited, onFavorite]);
  const handleOpen = useCallback(() => {
    if (file) {
      onOpen?.(file);
  }, [file, onOpen]);
  if (!file) {
    return;
      <div className={`file-preview-empty ${className}`} style={{},},
  padding: '40px 20px',
        textAlign: 'center',
        color: '#6c757d',
        borderLeft: '1px solid #dee2e6',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa';
}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <div style={{ fontSize: '16px', fontWeight: 500 }}>No file selected</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Select a file to see its preview
          </div>
        </div>
      </div>
    );
  return;
    <div className={`file-preview ${className}`} style={{},},
  borderLeft: '1px solid #dee2e6',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '400px';
}>
      {/* Header */}
      <div style={{
  padding: '16px 20px',
  borderBottom: '1px solid #eee',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
  margin: 0,
  fontSize: '16px',
  fontWeight: 600,
  color: '#212529',
  wordBreak: 'break-word',
}>
            {file.name}
          </h3>
          <div style={{
  fontSize: '12px',
  color: '#6c757d',
  marginTop: '2px',
}>
            Modified {formatDate(file.lastModified)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
          <button
            onClick={handleFavoriteToggle}
            style={{
  padding: '6px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '16px',
  borderRadius: '4px',
}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? '⭐' : '☆'}
          </button>
          {onClose && ()
            <button
              onClick={onClose}
              style={{
  padding: '6px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '16px',
  borderRadius: '4px',
}
              title="Close preview"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, padding: '20px' }}>
        {isLoading ? ()
          <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  color: '#6c757d',
}>
            <div>Loading preview...</div>
          </div>
        ) : error ? ()
          <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  color: '#dc3545',
  textAlign: 'center',
}>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
              <div>Failed to load preview</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>{error}</div>
            </div>
          </div>
        ) : previewData ? ()
          <>
            {/* Thumbnail */}
            {previewData.thumbnail && ()
              <div style={{
  marginBottom: '20px',
  textAlign: 'center',
}>
                <img
                  src={previewData.thumbnail}
                  alt={`Preview of ${file.name}`}
                  style={{
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid #dee2e6',
  borderRadius: '4px',
  backgroundColor: '#f8f9fa',
}
                />
              </div>
            )}
            {/* File Information */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
  fontSize: '14px',
  fontWeight: 600,
  margin: '0 0 12px 0',
  color: '#495057',
}>
                File Information
              </h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6c757d', fontSize: '13px' }}>Size:</span>
                  <span style={{ fontSize: '13px' }}>
                    {formatFileSize(previewData.content?.size || 0)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6c757d', fontSize: '13px' }}>Nodes:</span>
                  <span style={{ fontSize: '13px' }}>
                    {previewData.content?.nodeCount || 0}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6c757d', fontSize: '13px' }}>Connections:</span>
                  <span style={{ fontSize: '13px' }}>
                    {previewData.content?.edgeCount || 0}
                  </span>
                </div>
                {file.tags && file.tags.length > 0 && ()
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ color: '#6c757d', fontSize: '13px', marginBottom: '4px' }}>
                      Tags:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {file.tags.map((tag, index) => ()
                        <span
                          key={index}
                          style={{
  padding: '2px 6px',
  backgroundColor: '#e9ecef',
  borderRadius: '3px',
  fontSize: '11px',
  color: '#495057',
}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Metadata */}
            {previewData.metadata && ()
              <div>
                <h4 style={{
  fontSize: '14px',
  fontWeight: 600,
  margin: '0 0 12px 0',
  color: '#495057',
}>
                  Details
                </h4>
                {previewData.metadata.description && ()
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ color: '#6c757d', fontSize: '13px', marginBottom: '4px' }}>
                      Description:
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                      {previewData.metadata.description}
                    </div>
                  </div>
                )}
                {previewData.metadata.author && ()
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ color: '#6c757d', fontSize: '13px', marginBottom: '4px' }}>
                      Author:
                    </div>
                    <div style={{ fontSize: '13px' }}>
                      {previewData.metadata.author}
                    </div>
                  </div>
                )}
                {previewData.metadata.version && ()
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ color: '#6c757d', fontSize: '13px', marginBottom: '4px' }}>
                      Version:
                    </div>
                    <div style={{ fontSize: '13px' }}>
                      {previewData.metadata.version}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
      {/* Actions */}
      <div style={{
  padding: '16px 20px',
  borderTop: '1px solid #eee',
  backgroundColor: '#f8f9fa',
}>
        <button
          onClick={handleOpen}
          style={{
  width: '100%',
  padding: '10px 16px',
  border: 'none',
  backgroundColor: '#007bff',
  color: '#fff',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
}
        >
          Open File
        </button>
      </div>
    </div>
  );
};

export default FilePreview;
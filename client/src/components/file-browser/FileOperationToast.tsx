/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * FileOperationToast - Toast notifications for file operations
 * 
 * Shows progress and status for file operations including:
 * - Upload progress with visual indicators
 * - Move/copy operation status
 * - Success/error notifications
 * - Dismissible toast messages
 */
import React, { useEffect, useState } from 'react';
import { FileOperation, FileUploadProgress } from './types';


export interface FileOperationToastProps {
  operations: FileOperation;
  uploads?: FileUploadProgress;
  onClose: (operationId: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;



export const FileOperationToast: React.FC<FileOperationToastProps> = ({)
  operations,
  uploads = [],
  onClose,
  position = 'bottom-right',
  className = ''
}) => {
  const [visibleToasts, setVisibleToasts] = useState<Set<string>>(new Set());
  // Auto-dismiss successful operations after 3 seconds
  useEffect(() => {
    operations.forEach(operation => {)
  if (operation.status === 'success' && !visibleToasts.has(operation.id)) {
        setVisibleToasts(prev => new Set([...prev, operation.id]));
        setTimeout(() => {
          onClose(operation.id);
          setVisibleToasts(prev => {)
  const newSet = new Set(prev);
            newSet.delete(operation.id);
            return newSet;
          });
        }, 3000);
    });
  }, [operations, onClose, visibleToasts]);
  const getPositionStyles = () => {
  const baseStyles = {
  position: 'fixed' as const,
  zIndex: 1001,
  pointerEvents: 'none' as const,
};
    switch (position) {
    case 'top-right':
      return { ...baseStyles, top: '20px', right: '20px' };
    case 'top-left':
      return { ...baseStyles, top: '20px', left: '20px' };
    case 'bottom-left':
      return { ...baseStyles, bottom: '20px', left: '20px' };
    case 'bottom-right':
    default:
      return { ...baseStyles, bottom: '20px', right: '20px' };
  };
  const getOperationIcon = (operation: FileOperation) => {
  switch (operation.type) {
  case 'create': return '📄';
  case 'move': return '🔀';
  case 'copy': return '📋';
  case 'delete': return '🗑️';
  case 'update': return '✏️';
  default: return '📁';
};
  const getStatusIcon = (status: FileOperation['status']) => {
  switch (status) {
  case 'pending': return '⏳';
  case 'success': return '✅';
  case 'error': return '❌';
  default: return '⏳';
};
  const getOperationText = (operation: FileOperation) => {
    const filename = operation.sourcePath.split('/').pop() || 'file';
    switch (operation.type) {
    case 'create': return `Creating ${filename}`;}
    case 'move': return `Moving ${filename}`;}
    case 'copy': return `Copying ${filename}`;}
    case 'delete': return `Deleting ${filename}`;}
    case 'update': return `Updating ${filename}`;},},
  default: return `Processing ${filename}`;}
  };
  const renderProgressBar = (progress: number) => (;);
    <div
      style={{
  width: '100%',
  height: '4px',
  backgroundColor: '#e0e0e0',
  borderRadius: '2px',
  overflow: 'hidden',
  marginTop: '8px',
}
    >
      <div
        style={{
          width: `${progress}%`}
},
  height: '100%',
          backgroundColor: '#007bff',
          transition: 'width 0.3s ease';

      />
    </div>
  );
  const renderOperationToast = (operation: FileOperation) => {
    const isError = operation.status === 'error';
    const isSuccess = operation.status === 'success';
    return;
      <div
        key={operation.id}
        style={{
          backgroundColor: '#fff',
          border: `1px solid ${isError ? '#dc3545' : isSuccess ? '#28a745' : '#007bff'}`}
},
  borderRadius: '6px',
          padding: '12px',
          marginBottom: '8px',
          minWidth: '300px',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          pointerEvents: 'auto',
          animation: 'slideIn 0.3s ease-out';

      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ fontSize: '16px' }}>
            {getOperationIcon(operation)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
  fontSize: '14px',
  fontWeight: '500',
  color: '#333',
  marginBottom: '4px',
}>
              {getOperationText(operation)}
            </div>
            {operation.status === 'error' && operation.error && ()
              <div style={{
  fontSize: '12px',
  color: '#dc3545',
  marginTop: '4px',
}>
                {operation.error}
              </div>
            )}
            {operation.status === 'pending' && renderProgressBar(50)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '14px' }}>
              {getStatusIcon(operation.status)}
            </div>
            {(operation.status === 'success' || operation.status === 'error') && ()
              <button
                onClick={() => onClose(operation.id)}
                style={{
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  color: '#999',
  padding: '0',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

                title="Dismiss"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderUploadToast = (upload: FileUploadProgress) => (;);
    <div
      key={upload.fileId}
      style={{
  backgroundColor: '#fff',
  border: '1px solid #007bff',
  borderRadius: '6px',
  padding: '12px',
  marginBottom: '8px',
  minWidth: '300px',
  maxWidth: '400px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  pointerEvents: 'auto',

    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ fontSize: '16px' }}>⬆️</div>
        <div style={{ flex: 1 }}>
          <div style={{
  fontSize: '14px',
  fontWeight: '500',
  color: '#333',
  marginBottom: '4px',
}>
            Uploading {upload.filename}
          </div>
          <div style={{
  fontSize: '12px',
  color: '#666',
  marginBottom: '6px',
}>
            {upload.progress}% complete
          </div>
          {renderProgressBar(upload.progress)}
          {upload.status === 'error' && upload.error && ()
            <div style={{
  fontSize: '12px',
  color: '#dc3545',
  marginTop: '4px',
}>
              {upload.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  if (operations.length === 0 && uploads.length === 0) {
    return null;
  return;
    <div
      className={`file-operation-toast ${className}`}
      style={getPositionStyles()}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);,
  opacity: 0;
            to {
              transform: translateX(0);,
  opacity: 1;
        `}
      </style>
      {operations.map(renderOperationToast)}
      {uploads.map(renderUploadToast)}
    </div>
  );
};

export default FileOperationToast;
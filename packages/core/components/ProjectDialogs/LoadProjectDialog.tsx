/**
 * LoadProjectDialog - Dialog for loading projects from .psg files
 */

import React, { useState } from 'react';
import { useGraphStore } from '../../graphStore';

interface LoadProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad?: (result: { success: boolean; error?: string; warnings?: string[] }) => void;
}

export const LoadProjectDialog: React.FC<LoadProjectDialogProps> = ({
  isOpen,
  onClose,
  onLoad
}) => {
  const { loadProject, hasUnsavedChanges } = useGraphStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const handleLoadClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      performLoad();
    }
  };

  const performLoad = async () => {
    setIsLoading(true);
    setError(null);
    setShowUnsavedWarning(false);

    try {
      const result = await loadProject();
      onLoad?.(result);
      
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to load project');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmLoad = () => {
    performLoad();
  };

  const handleCancelWarning = () => {
    setShowUnsavedWarning(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#333'
          }}>
            Load Project
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Unsaved Changes Warning */}
        {showUnsavedWarning && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            color: '#856404',
            padding: '16px',
            borderRadius: '4px',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
              ⚠️ Unsaved Changes
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px' }}>
              You have unsaved changes in your current project. Loading a new project will discard these changes.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelWarning}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  color: '#666',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLoad}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Discard Changes & Load
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!showUnsavedWarning && (
          <>
            <div style={{
              textAlign: 'center',
              padding: '32px 16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                opacity: 0.5
              }}>
                📁
              </div>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '18px',
                color: '#333'
              }}>
                Choose Project File
              </h3>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#666',
                lineHeight: 1.5
              }}>
                Select a .psg project file from your device to load into the editor.
              </p>
            </div>

            {/* File Format Info */}
            <div style={{
              backgroundColor: '#e7f3ff',
              border: '1px solid #b3d9ff',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '24px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0066cc' }}>
                📋 Supported File Format
              </h4>
              <ul style={{
                margin: '0',
                paddingLeft: '16px',
                fontSize: '13px',
                color: '#0066cc',
                lineHeight: 1.4
              }}>
                <li>.psg files created by this application</li>
                <li>Contains graph nodes, connections, and project metadata</li>
                <li>Automatically validates file format and compatibility</li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                color: '#c33',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '24px',
                fontSize: '14px'
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={onClose}
                disabled={isLoading}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  color: '#666',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLoadClick}
                disabled={isLoading}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: isLoading ? '#ccc' : '#007bff',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {isLoading ? 'Loading...' : 'Browse & Load Project'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoadProjectDialog;
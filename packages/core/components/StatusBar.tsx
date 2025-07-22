import React, { useState, useRef, useEffect } from 'react';
import { Edge, Node } from 'reactflow';
import { ValidationError } from '../validation';
import { WebSocketStatusIcon, WebSocketDetails } from './WebSocketStatus';
import { EncryptionStatusIcon, EncryptionDetails, EncryptionState } from './EncryptionStatus';
import { ConnectionState } from '../websocket/WebSocketClient';

interface StatusBarProps {
  statusMessage: string;
  errors: ValidationError[];
  onPreview: () => void;
  onSaveJson: () => void;
  onExportBundle?: () => void;
  onSaveProject?: () => void;
  onLoadProject?: () => void;
  onNewProject?: () => void;
  hasUnsavedChanges?: boolean;
  currentProjectName?: string;
  onCorrections?: () => void;
  correctionsEnabled?: boolean;
  correctionsOpen?: boolean;
  onStats?: () => void;
  statsOpen?: boolean;
  onExtensions?: () => void;
  extensionsOpen?: boolean;
  // WebSocket props
  connectionState?: ConnectionState;
  queuedMessages?: number;
  onClearQueue?: () => void;
  onReconnect?: () => void;
  onDisconnect?: () => void;
  // Encryption props
  encryptionState?: EncryptionState;
  onEncrypt?: () => void;
  onDecrypt?: () => void;
  onChangeAlgorithm?: (algorithm: string) => void;
  // Optimization props
  onOptimization?: () => void;
  optimizationEnabled?: boolean;
  // Template props
  onSaveTemplate?: () => void;
  onBrowseTemplates?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  statusMessage,
  errors,
  onPreview,
  onSaveJson,
  onExportBundle,
  onSaveProject,
  onLoadProject,
  onNewProject,
  hasUnsavedChanges,
  currentProjectName,
  onCorrections,
  correctionsEnabled,
  correctionsOpen,
  onStats,
  statsOpen,
  onExtensions,
  extensionsOpen,
  connectionState,
  queuedMessages,
  onClearQueue,
  onReconnect,
  onDisconnect,
  encryptionState,
  onEncrypt,
  onDecrypt,
  onChangeAlgorithm,
  onOptimization,
  optimizationEnabled,
  onSaveTemplate,
  onBrowseTemplates
}) => {
  const [showWebSocketDetails, setShowWebSocketDetails] = useState(false);
  const [showEncryptionDetails, setShowEncryptionDetails] = useState(false);
  const wsDetailsRef = useRef<HTMLDivElement>(null);
  const encryptionDetailsRef = useRef<HTMLDivElement>(null);
  
  const errorCount = errors.length;

  // Close details when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wsDetailsRef.current && !wsDetailsRef.current.contains(event.target as Node)) {
        setShowWebSocketDetails(false);
      }
      if (encryptionDetailsRef.current && !encryptionDetailsRef.current.contains(event.target as Node)) {
        setShowEncryptionDetails(false);
      }
    };

    if (showWebSocketDetails || showEncryptionDetails) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showWebSocketDetails, showEncryptionDetails]);

  return (
    <div style={{ 
      position: 'absolute', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      background: '#fff', 
      borderTop: '1px solid #eee', 
      padding: 8, 
      fontSize: 14, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between' 
    }}>
      <div aria-live="polite">
        {statusMessage && <span style={{ marginRight: 16 }}>{statusMessage}</span>}
        
        {/* Current Project Indicator */}
        {currentProjectName && (
          <span style={{ 
            marginRight: 16, 
            padding: '4px 8px',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: 3,
            fontSize: '13px',
            color: '#495057'
          }}>
            📁 {currentProjectName}{hasUnsavedChanges ? ' •' : ''}
          </span>
        )}
        
        <button
          onClick={onPreview}
          style={{ 
            marginRight: 16, 
            padding: '6px 16px', 
            background: '#eee', 
            color: '#23272f', 
            border: '1px solid #ccc', 
            borderRadius: 4, 
            fontWeight: 500, 
            cursor: 'pointer' 
          }}
        >
          Preview
        </button>
        
        {/* Project Management Buttons */}
        {onNewProject && (
          <button
            onClick={onNewProject}
            title="Create a new project"
            style={{ 
              marginRight: 16, 
              padding: '6px 16px', 
              background: '#eee', 
              color: '#23272f', 
              border: '1px solid #ccc', 
              borderRadius: 4, 
              fontWeight: 500, 
              cursor: 'pointer' 
            }}
          >
            📄 New
          </button>
        )}
        
        {onSaveProject && (
          <button
            onClick={onSaveProject}
            title="Save project as .psg file"
            style={{ 
              marginRight: 16, 
              padding: '6px 16px', 
              background: hasUnsavedChanges ? '#4CAF50' : '#eee', 
              color: hasUnsavedChanges ? 'white' : '#23272f', 
              border: hasUnsavedChanges ? '1px solid #45a049' : '1px solid #ccc', 
              borderRadius: 4, 
              fontWeight: 500, 
              cursor: 'pointer' 
            }}
          >
            💾 Save Project{hasUnsavedChanges ? ' *' : ''}
          </button>
        )}
        
        {onLoadProject && (
          <button
            onClick={onLoadProject}
            title="Load project from .psg file"
            style={{ 
              marginRight: 16, 
              padding: '6px 16px', 
              background: '#eee', 
              color: '#23272f', 
              border: '1px solid #ccc', 
              borderRadius: 4, 
              fontWeight: 500, 
              cursor: 'pointer' 
            }}
          >
            📂 Load Project
          </button>
        )}

        <button
          onClick={onSaveJson}
          style={{ 
            marginRight: 16, 
            padding: '6px 16px', 
            background: '#eee', 
            color: '#23272f', 
            border: '1px solid #ccc', 
            borderRadius: 4, 
            fontWeight: 500, 
            cursor: 'pointer' 
          }}
        >
          📋 Share Template
        </button>

        {onExportBundle && (
          <button
            onClick={onExportBundle}
            title="Export for use in production pipeline"
            style={{ 
              marginRight: 16, 
              padding: '6px 16px', 
              background: '#4CAF50', 
              color: 'white', 
              border: '1px solid #45a049', 
              borderRadius: 4, 
              fontWeight: 500, 
              cursor: 'pointer' 
            }}
          >
            📦 Export for Pipeline
          </button>
        )}

        {/* Template Buttons */}
        {onSaveTemplate && (
          <button
            onClick={onSaveTemplate}
            title="Save current workflow as reusable template"
            style={{ 
              marginRight: 16, 
              padding: '6px 16px', 
              background: '#8b5cf6', 
              color: 'white', 
              border: '1px solid #7c3aed', 
              borderRadius: 4, 
              fontWeight: 500, 
              cursor: 'pointer' 
            }}
          >
            💾 Save Template
          </button>
        )}

        {onBrowseTemplates && (
          <button
            onClick={onBrowseTemplates}
            title="Browse and apply workflow templates"
            style={{ 
              marginRight: 16, 
              padding: '6px 16px', 
              background: '#06b6d4', 
              color: 'white', 
              border: '1px solid #0891b2', 
              borderRadius: 4, 
              fontWeight: 500, 
              cursor: 'pointer' 
            }}
          >
            📚 Templates
          </button>
        )}
        
        {correctionsEnabled && onCorrections && (
          <button
            onClick={onCorrections}
            style={{ 
              marginRight: 16, 
              padding: '6px 16px', 
              background: correctionsOpen ? '#4a5568' : '#eee', 
              color: correctionsOpen ? '#fff' : '#23272f', 
              border: '1px solid #ccc', 
              borderRadius: 4, 
              fontWeight: 500, 
              cursor: 'pointer' 
            }}
          >
            Corrections
          </button>
        )}
        
        {correctionsEnabled && onStats && (
          <button
            onClick={onStats}
            style={{ 
              marginRight: 16, 
              padding: '6px 16px', 
              background: statsOpen ? '#4a5568' : '#eee', 
              color: statsOpen ? '#fff' : '#23272f', 
              border: '1px solid #ccc', 
              borderRadius: 4, 
              fontWeight: 500, 
              cursor: 'pointer' 
            }}
          >
            📊 Stats
          </button>
        )}
        
        {onExtensions && (
          <button
            onClick={onExtensions}
            style={{ 
              marginRight: 16, 
              padding: '6px 16px', 
              background: extensionsOpen ? '#4a5568' : '#eee', 
              color: extensionsOpen ? '#fff' : '#23272f', 
              border: '1px solid #ccc', 
              borderRadius: 4, 
              fontWeight: 500, 
              cursor: 'pointer' 
            }}
          >
            🧩 Extensions
          </button>
        )}
        
        {onOptimization && (
          <button
            data-optimization-button
            onClick={onOptimization}
            title="Open workflow optimization and performance tools"
            style={{ 
              marginRight: 16, 
              padding: '6px 16px', 
              background: optimizationEnabled ? '#17a2b8' : '#eee', 
              color: optimizationEnabled ? 'white' : '#23272f', 
              border: optimizationEnabled ? '1px solid #138496' : '1px solid #ccc', 
              borderRadius: 4, 
              fontWeight: 500, 
              cursor: 'pointer' 
            }}
          >
            ⚡ Optimize
          </button>
        )}
        
        {errorCount === 0 ? 'No errors' : `${errorCount} error${errorCount > 1 ? 's' : ''}`}
        
        {errorCount > 0 && (
          <span style={{ marginLeft: 16 }}>
            {errors.map((err) => (
              <span 
                key={err.edgeId} 
                style={{ color: '#f00', marginRight: 8 }} 
                title={err.message}
              >
                {err.message}
              </span>
            ))}
          </span>
        )}
      </div>

      {/* Right side - Status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
        {/* Encryption status */}
        {encryptionState && (
          <>
            <EncryptionStatusIcon 
              encryptionState={encryptionState}
              onClick={() => setShowEncryptionDetails(!showEncryptionDetails)}
            />
            
            {showEncryptionDetails && (
              <div 
                ref={encryptionDetailsRef}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: '50%',
                  marginBottom: 8,
                  zIndex: 1000
                }}
              >
                <EncryptionDetails
                  encryptionState={encryptionState}
                  onEncrypt={onEncrypt}
                  onDecrypt={onDecrypt}
                  onChangeAlgorithm={onChangeAlgorithm}
                />
              </div>
            )}
          </>
        )}

        {/* WebSocket status */}
        {connectionState && (
          <>
            <WebSocketStatusIcon 
              connectionState={connectionState}
              onClick={() => setShowWebSocketDetails(!showWebSocketDetails)}
            />
            
            {showWebSocketDetails && (
              <div 
                ref={wsDetailsRef}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  marginBottom: 8,
                  zIndex: 1000
                }}
              >
                <WebSocketDetails
                  connectionState={connectionState}
                  queuedMessages={queuedMessages}
                  onClearQueue={onClearQueue}
                  onReconnect={onReconnect}
                  onDisconnect={onDisconnect}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
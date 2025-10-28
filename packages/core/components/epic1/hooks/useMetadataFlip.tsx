import { useState, useEffect } from 'react';
import React from 'react';

/**
 * Hook for adding metadata flip functionality to any node
 */
export const useMetadataFlip = (props: any) => {
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);

  // Keyboard handler for metadata toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only toggle if THIS node is selected
      if (e.key === 'm' && (e.metaKey || e.ctrlKey) && props.selected) {
        e.preventDefault();
        setShowMetadata(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [props.selected]);

  // Extract some basic metadata from the node content
  useEffect(() => {
    if (showMetadata && props.data?.value) {
      // Simple metadata extraction
      const text = props.data.value || '';
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const charCount = text.length;
      
      setMetadata({
        wordCount,
        charCount,
        nodeType: props.data.nodeType,
        lastModified: new Date().toLocaleString(),
      });
    }
  }, [showMetadata, props.data]);

  return {
    showMetadata,
    setShowMetadata,
    metadata,
    flipClassName: `flippable ${showMetadata ? 'node-flipped' : ''}`,
  };
};

/**
 * Reusable metadata display component
 */
export const MetadataDisplay: React.FC<{
  metadata: any;
  onClose: () => void;
}> = ({ metadata, onClose }) => {
  return (
    <div className="card-face metadata-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
          Metadata Analysis
        </h3>
        <button
          className="metadata-close-btn nodrag"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            background: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '4px',
            color: '#e5e7eb',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#374151'}
        >
          ✕ Close
        </button>
      </div>
      
      {metadata ? (
        <div style={{ fontSize: '12px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Node Type:</strong> {metadata.nodeType}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Word Count:</strong> {metadata.wordCount}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Character Count:</strong> {metadata.charCount}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Last Modified:</strong> {metadata.lastModified}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
          No metadata available
        </div>
      )}
    </div>
  );
};

/**
 * Metadata toggle button component
 */
export const MetadataToggleButton: React.FC<{
  showMetadata: boolean;
  onClick: () => void;
}> = ({ showMetadata, onClick }) => {
  return (
    <button
      className="metadata-toggle-btn nodrag"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: showMetadata ? '#10b981' : '#374151',
        border: '1px solid #4b5563',
        padding: '6px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'all 0.2s',
        zIndex: 10,
      }}
      title="Toggle metadata view (Ctrl+M)"
    >
      {showMetadata ? '📝' : '🔍'}
    </button>
  );
};
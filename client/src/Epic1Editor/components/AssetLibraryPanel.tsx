import React from 'react';

interface AssetLibraryPanelProps {
  onClose?: () => void;
  position?: 'left' | 'right';
}

export const AssetLibraryPanel: React.FC<AssetLibraryPanelProps> = ({ 
  onClose,
  position = 'right' 
}) => {

  return (
    <div 
      className={`asset-library-panel ${position}`}
      style={{
        position: 'absolute',
        top: 0,
        [position]: 0,
        bottom: 0,
        width: '320px',
        background: 'var(--bg-primary, #1a1a1a)',
        borderLeft: position === 'right' ? '1px solid var(--border-color, #333)' : undefined,
        borderRight: position === 'left' ? '1px solid var(--border-color, #333)' : undefined,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10
      }}
    >
      {/* Header */}
      <div 
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color, #333)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
          Asset Library
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary, #999)',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '18px'
            }}
            aria-label="Close asset library"
          >
            ×
          </button>
        )}
      </div>

      {/* Asset Browser - Placeholder for now */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        padding: '16px',
        color: 'var(--text-secondary, #999)'
      }}>
        <div style={{
          textAlign: 'center',
          marginTop: '32px'
        }}>
          <p style={{ marginBottom: '16px' }}>🎨 Asset Library</p>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>
            Browse and insert presets, templates, and saved graphs.
          </p>
          <div style={{
            marginTop: '32px',
            padding: '12px',
            background: 'var(--bg-secondary, #2a2a2a)',
            borderRadius: '4px'
          }}>
            <p style={{ fontSize: '11px', marginBottom: '8px' }}>Coming Soon:</p>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              fontSize: '11px',
              textAlign: 'left'
            }}>
              <li>• Character name generators</li>
              <li>• Story templates</li>
              <li>• Dialogue patterns</li>
              <li>• Saved graphs</li>
              <li>• Community presets</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
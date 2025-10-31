import React from 'react';

import type { ThemeConfig } from './types';

interface LivePreviewComponentProps {
  theme: ThemeConfig;
}

const LivePreviewComponent: React.FC<LivePreviewComponentProps> = ({
  theme
}) => {
  const headerStyle = {
    color: theme.colors.text || '#000',
    fontFamily: theme.typography.fontFamily || 'Arial',
    fontSize: theme.typography.fontSize || '24px',
    fontWeight: theme.typography.fontWeight || '700',
    backgroundColor: theme.colors.background || '#fff'
  };

  const bodyStyle = {
    color: theme.colors.text || '#000',
    fontFamily: theme.typography.fontFamily || 'Arial',
    fontSize: theme.typography.fontSize || '16px',
    fontWeight: theme.typography.fontWeight || '400',
    backgroundColor: theme.colors.background || '#fff',
    lineHeight: theme.typography.lineHeight || '1.5'
  };

  return (
    <div
      className="live-preview"
      style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}
    >
      <h3>Live Preview</h3>
      <div style={headerStyle}>
        {theme.branding.defaultText || 'Prompt Spaghetti'}
      </div>
      <p style={bodyStyle}>
        This is a sample paragraph to preview your typography and color
        settings.
      </p>
      <button
        style={{
          backgroundColor: theme.colors.primary || '#007bff',
          color: '#fff',
          border: 'none',
          padding: '10px 20px'
        }}
      >
        Sample Button
      </button>
    </div>
  );
};

export default LivePreviewComponent;

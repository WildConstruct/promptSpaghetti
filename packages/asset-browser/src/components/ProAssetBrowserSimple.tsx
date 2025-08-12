import React from 'react';
import type { Preset } from '../types';

interface ProAssetBrowserSimpleProps {
  onInsert?: (preset: Preset) => void;
}

export function ProAssetBrowserSimple({
  onInsert
}: ProAssetBrowserSimpleProps) {
  console.log('[ProAssetBrowserSimple] Rendering');

  return (
    <div
      style={{
        padding: '20px',
        background: '#1a1a1a',
        color: 'white',
        height: '100%'
      }}
    >
      <h3>Asset Browser (Simple Test)</h3>
      <p>This is a minimal test component to debug the React error.</p>
      <button
        onClick={() => {
          console.log('[ProAssetBrowserSimple] Insert clicked');
          onInsert?.({
            id: 'test',
            name: 'Test Preset',
            tags: ['test']
          });
        }}
        style={{
          padding: '8px 16px',
          background: '#4a4a4a',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Insert
      </button>
    </div>
  );
}

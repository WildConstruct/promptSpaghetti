import React from 'react';
import type { Node, Edge } from 'reactflow';

export interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
  timestamp?: number;
}

interface HistoryPaletteProps {
  entries: HistoryEntry[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export const HistoryPalette: React.FC<HistoryPaletteProps> = ({ entries, currentIndex, onSelect, onClose }) => {
  return (
    <div style={{ position: 'absolute', top: 80, right: 16, zIndex: 2000, width: 260 }}>
      <div style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', borderRadius: 8, padding: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <strong>History (last {entries.length})</strong>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ maxHeight: 240, overflowY: 'auto' }}>
          {entries.length === 0 && <div style={{ opacity: 0.8, fontSize: 12 }}>No history yet</div>}
          {entries.map((e, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: idx === currentIndex ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 6,
                padding: '6px 8px',
                marginBottom: 6,
                cursor: 'pointer'
              }}
              title={new Date(e.timestamp).toLocaleString()}
            >
              <div style={{ fontSize: 12, opacity: 0.85 }}>{new Date(e.timestamp).toLocaleTimeString()}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Nodes: {e.nodes.length} · Edges: {e.edges.length}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import './HistoryPalette.css';
import './HistoryPalette.css';
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
    <div className="history-palette-container">
      <div className="history-card">
        <div className="history-header">
          <strong>History (last {entries.length})</strong>
          <button onClick={onClose} className="history-close">✕</button>
        </div>
        <div className="history-list">
          {entries.length === 0 && <div className="history-empty">No history yet</div>}
          {entries.map((e, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`history-item ${idx === currentIndex ? 'selected' : ''}`}
              title={new Date(e.timestamp).toLocaleString()}
            >
              <div className="history-item-time">{new Date(e.timestamp).toLocaleTimeString()}</div>
              <div className="history-item-meta">Nodes: {e.nodes.length} · Edges: {e.edges.length}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

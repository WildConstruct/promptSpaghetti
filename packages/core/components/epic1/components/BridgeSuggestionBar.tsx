import React from 'react';

export const BridgeSuggestionBar: React.FC<{
  count: number;
  onAdd: () => void;
  onDismiss: () => void;
}> = ({ count, onAdd, onDismiss }) => {
  return (
    <div style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: '#0b0b0b', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 12px', boxShadow: '0 6px 18px rgba(0,0,0,0.35)', zIndex: 9999 }}>
      <span>Bridge suggestion: consider adding Concat between {count} pruned connection(s)</span>
      <button onClick={onAdd} style={{ marginLeft: 12 }}>Add Bridges</button>
      <button onClick={onDismiss} style={{ marginLeft: 6 }}>Dismiss</button>
    </div>
  );
};

export default BridgeSuggestionBar;


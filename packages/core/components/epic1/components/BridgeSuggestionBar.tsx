import React from 'react';
import './BridgeSuggestionBar.css';

export const BridgeSuggestionBar: React.FC<{
  count: number;
  onAdd: () => void;
  onDismiss: () => void;
}> = ({ count, onAdd, onDismiss }) => {
  return (
    <div className="bridge-suggestion-bar">
      <span>Bridge suggestion: consider adding Concat between {count} pruned connection(s)</span>
      <button className="ml-12" onClick={onAdd}>Add Bridges</button>
      <button className="ml-6" onClick={onDismiss}>Dismiss</button>
    </div>
  );
};

export default BridgeSuggestionBar;

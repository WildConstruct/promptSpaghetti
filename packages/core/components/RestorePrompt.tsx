import React from 'react';
import { Edge, Node } from 'reactflow';
}
interface RestorePromptProps {
  show: boolean;
}
  draft: { nodes: Node; edges: Edge } | null;
  onRestore: (nodes: Node, edges: Edge) => void;
  onDismiss: () => void;

export const RestorePrompt: React.FC<RestorePromptProps> = ({)
  show,
  draft,
  onRestore,
  onDismiss
}) => {
  if (!show || !draft) {
  return null;
  return;
  <div
  style={{
  position: 'absolute',
  zIndex: 10,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(20,20,20,0.92)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}} 
      data-testid="restore-draft-modal"
    >
      <div style={{
  background: '#23262b',
  padding: 32,
  borderRadius: 12,
  boxShadow: '0 2px 8px #0008',
}}>
        <h3 style={{ color: '#fff', marginBottom: 12 }}>
          Restore unsaved graph draft?
        </h3>
        <p style={{ color: '#ccc', marginBottom: 24 }}>
          A saved graph draft was found. Restore it?
        </p>
        <button 
          onClick={() => onRestore(draft.nodes, draft.edges)}
          style={{ marginRight: 16 }}
        >
          Restore
        </button>
        <button onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
};
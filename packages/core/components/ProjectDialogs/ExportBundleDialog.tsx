/**
 * Minimal stub for ExportBundleDialog to allow build completion
 */
import React from 'react';
import { Node, Edge } from 'reactflow';

interface ExportBundleDialogProps { isOpen: boolean;
  onClose: () => void;
  nodes: Node;
  edges: Edge }
  onExport?: (result: { success: boolean; error?: string }) => void;


export const ExportBundleDialog: React.FC<ExportBundleDialogProps> = ({ isOpen
  onClose
  nodes
  edges }
  onExport
}) => { if (!isOpen) return null;
  const handleExport = () => {
  // Simple export logic
  const bundle = {
  nodes
  edges
  timestamp: new Date().toISOString() }
};
    
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    onExport?.({ success: true });
    onClose();
  };

  return (
    <div style={ {
  position: 'fixed'
  top: 0
  left: 0
  right: 0
  bottom: 0
  backgroundColor: 'rgba(0, 0, 0, 0.5)'
  display: 'flex'
  alignItems: 'center'
  justifyContent: 'center'
  zIndex: 10000 }
}>
      <div style={ {
  backgroundColor: 'white'
  padding: '24px'
  borderRadius: '8px'
  minWidth: '400px'
  maxWidth: '90vw' }
}>
        <h2>Export Graph</h2>
        <p>Export your graph as a JSON bundle.</p>
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px' }}>
            Cancel
          </button>
          <button onClick={handleExport} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
            Export
          </button>
        </div>
      </div>
    </div>
  );
;
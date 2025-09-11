import React from 'react';
import { Node, Edge } from 'reactflow';
import { EditableNodeData } from '../nodes';
import { PromptWizard } from '../PromptWizard';
import { AuthModal } from '../AuthModal';
import { SaveAsPresetDialog } from '../asset-library/SaveAsPresetDialog';

interface GraphModalsProps {
  // Prompt Wizard Modal
  isPromptWizardOpen: boolean;
  onPromptWizardClose: () => void;
  onPromptWizardComplete: (nodes: Node<EditableNodeData>[], edges: Edge[]) => void;
  
  // Auth Modal
  isAuthModalOpen: boolean;
  onAuthModalClose: () => void;
  onAuthSuccess: (user: any) => void;
  currentUser: any;
  
  // Save as Preset Dialog
  saveAsPresetNodeId: string | null;
  onSaveAsPresetClose: () => void;
  onSaveAsPresetComplete: (name: string, description: string, tags: string[]) => void;
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
  
  // Pending Wizard Nodes (overlay)
  pendingWizardNodes: { nodes: Node<EditableNodeData>[], edges: Edge[] } | null;
  onPendingWizardCancel: () => void;
  onPendingWizardAdd: () => void;
  onPendingWizardReplace: () => void;
  
  // Toast function for feedback
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

/**
 * Container for all graph-related modals and dialogs
 */
export const GraphModals: React.FC<GraphModalsProps> = ({
  isPromptWizardOpen,
  onPromptWizardClose,
  onPromptWizardComplete,
  isAuthModalOpen,
  onAuthModalClose,
  onAuthSuccess,
  currentUser,
  saveAsPresetNodeId,
  onSaveAsPresetClose,
  onSaveAsPresetComplete,
  nodes,
  edges,
  pendingWizardNodes,
  onPendingWizardCancel,
  onPendingWizardAdd,
  onPendingWizardReplace,
  showToast
}) => {
  return (
    <>
      {/* Prompt Wizard Modal */}
      {isPromptWizardOpen && (
        <PromptWizard
          isOpen={isPromptWizardOpen}
          onClose={onPromptWizardClose}
          onComplete={onPromptWizardComplete}
        />
      )}
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={onAuthModalClose}
        onSuccess={(user) => {
          onAuthSuccess(user);
          showToast('success', `Welcome ${user.email}!`);
        }}
      />
      
      {/* Save as Preset Dialog */}
      {saveAsPresetNodeId && (
        <SaveAsPresetDialog
          isOpen={!!saveAsPresetNodeId}
          onClose={onSaveAsPresetClose}
          onSave={onSaveAsPresetComplete}
          nodes={nodes}
          edges={edges}
          selectedNodeId={saveAsPresetNodeId}
        />
      )}
      
      {/* Pending Wizard Nodes Overlay */}
      {pendingWizardNodes && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: '#1e293b',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            maxWidth: '500px'
          }}
        >
          <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
            🪄 Prompt Wizard created {pendingWizardNodes.nodes.length} nodes
          </div>
          <div style={{ marginBottom: '16px', fontSize: '14px', color: '#94a3b8' }}>
            Would you like to add these to your existing graph or replace everything?
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={onPendingWizardCancel}
              style={{
                padding: '8px 16px',
                background: '#475569',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={onPendingWizardAdd}
              style={{
                padding: '8px 16px',
                background: '#2563eb',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Add to Graph
            </button>
            <button
              onClick={onPendingWizardReplace}
              style={{
                padding: '8px 16px',
                background: '#dc2626',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Replace Graph
            </button>
          </div>
        </div>
      )}
    </>
  );
};
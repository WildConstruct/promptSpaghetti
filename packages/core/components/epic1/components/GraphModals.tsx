import React from 'react';
import { Node, Edge } from 'reactflow';
import { EditableNodeData } from '../nodes';
import { PromptWizard } from './PromptWizard';
import { AuthModal } from '../../auth/AuthModal';
import { SaveAsPresetDialog } from '../asset-library/SaveAsPresetDialog';
import type { Preset } from '../asset-library/types';

export interface WizardPreviewResult {
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
}

interface GraphModalsProps {
  // Prompt Wizard Modal
  isPromptWizardOpen: boolean;
  setIsPromptWizardOpen: (value: boolean) => void;
  
  // Auth Modal
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (value: boolean) => void;
  setCurrentUser: (user: unknown) => void;
  
  // Save as Preset Dialog
  saveAsPresetNodeId: string | null;
  setSaveAsPresetNodeId: (id: string | null) => void;
  
  // Graph data
  nodes: Node<EditableNodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<EditableNodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  
  // Pending Wizard Nodes
  pendingWizardNodes: WizardPreviewResult | null;
  setPendingWizardNodes: React.Dispatch<
    React.SetStateAction<WizardPreviewResult | null>
  >;

  // Custom presets
  setCustomPresets: React.Dispatch<React.SetStateAction<Preset[]>>;
}

/**
 * Container for all graph-related modals and dialogs
 */
export const GraphModals: React.FC<GraphModalsProps> = ({
  isPromptWizardOpen,
  setIsPromptWizardOpen,
  isAuthModalOpen,
  setIsAuthModalOpen,
  setCurrentUser,
  saveAsPresetNodeId,
  setSaveAsPresetNodeId,
  nodes,
  setNodes,
  setEdges,
  pendingWizardNodes,
  setPendingWizardNodes,
  setCustomPresets
}) => {
  const presetNode = saveAsPresetNodeId
    ? nodes.find(node => node.id === saveAsPresetNodeId) ?? null
    : null;
  const presetNodeData = presetNode?.data ?? null;
  const presetNodeType = presetNode?.type ?? 'textBlock';

  return (
    <>
      {/* Prompt Wizard Modal */}
      {isPromptWizardOpen && (
        <PromptWizard
          isOpen={isPromptWizardOpen}
          onClose={() => setIsPromptWizardOpen(false)}
          onComplete={(nodes: Node[], edges: Edge[]) => {
            setNodes(prevNodes => [...prevNodes, ...nodes]);
            setEdges(prevEdges => [...prevEdges, ...edges]);
            setIsPromptWizardOpen(false);
          }}
        />
      )}
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
      />
      
      {/* Save as Preset Dialog */}
      {presetNode && (
        <SaveAsPresetDialog
          isOpen={Boolean(presetNode)}
          nodeData={(presetNodeData as EditableNodeData) ?? null}
          nodeType={presetNodeType || 'textBlock'}
          onClose={() => setSaveAsPresetNodeId(null)}
          onSave={preset => {
            setCustomPresets(prev => [...prev, preset]);
            setSaveAsPresetNodeId(null);
          }}
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
            🪄 Prompt Wizard created {pendingWizardNodes.nodes?.length || 0} nodes
          </div>
          <div style={{ marginBottom: '16px', fontSize: '14px', color: '#94a3b8' }}>
            Would you like to add these to your existing graph or replace everything?
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setPendingWizardNodes(null)}
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
              onClick={() => {
                if (pendingWizardNodes) {
                  setNodes(prev => [...prev, ...pendingWizardNodes.nodes]);
                  setEdges(prev => [...prev, ...pendingWizardNodes.edges]);
                  setPendingWizardNodes(null);
                }
              }}
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
              onClick={() => {
                if (pendingWizardNodes) {
                  setNodes(pendingWizardNodes.nodes);
                  setEdges(pendingWizardNodes.edges);
                  setPendingWizardNodes(null);
                }
              }}
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

import React from 'react';
import { Node, Edge } from 'reactflow';
import { EditableNodeData } from '../nodes';
import {
  PromptWizard,
  type WizardFragmentLoadStatus
} from './PromptWizard';
import { AuthModal } from '../../auth/AuthModal';
import { SaveAsPresetDialog } from '../asset-library/SaveAsPresetDialog';
import type { Preset } from '../asset-library/types';
import type { ToastMessage } from '../ConnectionToast';

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

  /** Editor toast for fragment-load outcomes after wizard closes. */
  showToast?: (
    type: ToastMessage['type'],
    message: string,
    duration?: number
  ) => void;
}

/**
 * Container for all graph-related modals and dialogs
 */
function toastFromFragmentStatus(
  status: WizardFragmentLoadStatus | undefined,
  mode: 'add' | 'replace'
): { type: ToastMessage['type']; message: string; duration?: number } | null {
  if (!status) {
    return {
      type: 'success',
      message:
        mode === 'add' ? 'Added wizard graph to canvas.' : 'Created graph from wizard.'
    };
  }
  if (status.attempted === 0) {
    return {
      type: 'success',
      message:
        mode === 'add'
          ? 'Added graph to canvas (no library fragments selected).'
          : 'Created graph (no library fragments selected).'
    };
  }
  if (status.expandedCount > 0 && status.failedPaths.length === 0) {
    return {
      type: 'success',
      message: `Loaded ${status.expandedCount} library fragment${
        status.expandedCount === 1 ? '' : 's'
      } into the graph.`
    };
  }
  if (status.expandedCount > 0 && status.failedPaths.length > 0) {
    return {
      type: 'warning',
      message: `Loaded ${status.expandedCount} fragment(s); ${status.failedPaths.length} failed and stayed as text.`,
      duration: 6000
    };
  }
  return {
    type: 'error',
    message:
      'Selected fragments could not be loaded from the library. Text placeholders were used instead.',
    duration: 7000
  };
}

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
  setCustomPresets,
  showToast
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
          hasExistingGraph={nodes.length > 0}
          onComplete={(
            nextNodes: Node[],
            nextEdges: Edge[],
            mode: 'add' | 'replace',
            fragmentStatus
          ) => {
            if (mode === 'replace') {
              setNodes(nextNodes);
              setEdges(nextEdges);
            } else {
              setNodes(prevNodes => [...prevNodes, ...nextNodes]);
              setEdges(prevEdges => [...prevEdges, ...nextEdges]);
            }
            setIsPromptWizardOpen(false);
            const toast = toastFromFragmentStatus(fragmentStatus, mode);
            if (toast && showToast) {
              showToast(toast.type, toast.message, toast.duration);
            }
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
            background: '#242424',
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
                background: '#4a4a4a',
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

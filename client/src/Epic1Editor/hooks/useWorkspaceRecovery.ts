import { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { WorkspaceRecovery } from '@promptscape/core/services/WorkspaceRecovery';
import { validateEditorGraphPayload } from '../utils/graphValidation';

interface UseWorkspaceRecoveryProps {
  onRecover?: (nodes: Node[], edges: Edge[]) => void;
  autoCheckOnMount?: boolean;
}

export const useWorkspaceRecovery = ({
  onRecover,
  autoCheckOnMount = true
}: UseWorkspaceRecoveryProps = {}) => {
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [hasCheckedRecovery, setHasCheckedRecovery] = useState(false);
  const [recoveryData, setRecoveryData] = useState<{
    nodes: Node[];
    edges: Edge[];
    timestamp: number;
  } | null>(null);

  // Check for recoverable workspace on mount
  useEffect(() => {
    if (!autoCheckOnMount || hasCheckedRecovery) {
      return;
    }

    const checkRecovery = () => {
      const hasRecoverable = WorkspaceRecovery.hasRecoverableWorkspace();
      if (hasRecoverable) {
        const data = WorkspaceRecovery.recoverWorkspace();
        if (data) {
          setRecoveryData(data);
          setShowRecoveryDialog(true);
        }
      }
      setHasCheckedRecovery(true);
    };

    checkRecovery();
  }, [autoCheckOnMount, hasCheckedRecovery]);

  // Handle recovery acceptance
  const handleRecoveryAccept = useCallback(() => {
    if (!recoveryData) {
      return;
    }

    const validated = validateEditorGraphPayload(recoveryData);
    if (!validated.ok) {
      console.error(
        '[useWorkspaceRecovery] Rejecting invalid recovery payload:',
        validated.error
      );
      WorkspaceRecovery.clearWorkspace();
      setShowRecoveryDialog(false);
      setRecoveryData(null);
      return;
    }

    onRecover?.(validated.data.nodes, validated.data.edges);

    WorkspaceRecovery.clearWorkspace();
    setShowRecoveryDialog(false);
    setRecoveryData(null);
  }, [recoveryData, onRecover]);

  // Handle explicit "start fresh"
  const handleRecoveryDecline = useCallback(() => {
    WorkspaceRecovery.clearWorkspace();
    setShowRecoveryDialog(false);
    setRecoveryData(null);
  }, []);

  // Handle dismiss for this session without deleting stored workspace
  const handleRecoveryDismiss = useCallback(() => {
    WorkspaceRecovery.dismissRecovery();
    setShowRecoveryDialog(false);
    setRecoveryData(null);
  }, []);

  // Save workspace for recovery
  const saveForRecovery = useCallback(async (nodes: Node[], edges: Edge[]) => {
    await WorkspaceRecovery.saveWorkspace(nodes, edges);
  }, []);

  // Clear recovery data manually
  const clearRecovery = useCallback(() => {
    WorkspaceRecovery.clearWorkspace();
    setRecoveryData(null);
  }, []);

  return {
    showRecoveryDialog,
    recoveryData,
    hasCheckedRecovery,
    handleRecoveryAccept,
    handleRecoveryDecline,
    handleRecoveryDismiss,
    saveForRecovery,
    clearRecovery,
    setShowRecoveryDialog
  };
};

import { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { WorkspaceRecovery } from '@promptscape/core/services/WorkspaceRecovery';

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
    if (!autoCheckOnMount || hasCheckedRecovery) return;

    const checkRecovery = async () => {
      const hasRecoverable = await WorkspaceRecovery.hasRecoverableWorkspace();
      if (hasRecoverable) {
        const data = await WorkspaceRecovery.getRecoveryData();
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
  const handleRecoveryAccept = useCallback(async () => {
    if (!recoveryData) return;

    // Recover the workspace
    const { nodes, edges } = recoveryData;

    // Call the recovery callback
    onRecover?.(nodes, edges);

    // Clear recovery data
    await WorkspaceRecovery.clearRecoveryData();
    setShowRecoveryDialog(false);
    setRecoveryData(null);
  }, [recoveryData, onRecover]);

  // Handle recovery decline
  const handleRecoveryDecline = useCallback(async () => {
    // Clear recovery data
    await WorkspaceRecovery.clearRecoveryData();
    setShowRecoveryDialog(false);
    setRecoveryData(null);
  }, []);

  // Save workspace for recovery
  const saveForRecovery = useCallback(async (nodes: Node[], edges: Edge[]) => {
    await WorkspaceRecovery.saveWorkspace(nodes, edges);
  }, []);

  // Clear recovery data manually
  const clearRecovery = useCallback(async () => {
    await WorkspaceRecovery.clearRecoveryData();
    setRecoveryData(null);
  }, []);

  return {
    showRecoveryDialog,
    recoveryData,
    hasCheckedRecovery,
    handleRecoveryAccept,
    handleRecoveryDecline,
    saveForRecovery,
    clearRecovery,
    setShowRecoveryDialog
  };
};

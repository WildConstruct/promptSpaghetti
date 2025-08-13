import { useState, useCallback, useMemo } from 'react';
import { Node } from 'reactflow';
import type { EditableNodeData } from '../nodes';
import { ContextMenuPosition } from '../nodes/NodeContextMenu';
import { Preset } from '../asset-library';

interface UseContextMenuProps {
  nodes: Node<EditableNodeData>[];
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function useContextMenu({ nodes, showToast }: UseContextMenuProps) {
  const [contextMenuPosition, setContextMenuPosition] =
    useState<ContextMenuPosition | null>(null);
  const [contextMenuNodeId, setContextMenuNodeId] = useState<string | null>(
    null
  );
  const [saveAsPresetNodeId, setSaveAsPresetNodeId] = useState<string | null>(
    null
  );
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);

  const handleSaveAsPreset = useCallback(() => {
    if (contextMenuNodeId) {
      setSaveAsPresetNodeId(contextMenuNodeId);
      setContextMenuPosition(null);
    }
  }, [contextMenuNodeId]);

  const handleSavePreset = useCallback(
    (preset: Preset) => {
      setCustomPresets(prev => [...prev, preset]);
      showToast('Preset saved successfully!', 'success');
      setSaveAsPresetNodeId(null);
    },
    [showToast]
  );

  // Get node data for save-as-preset dialog
  const saveAsPresetNode = useMemo(() => {
    if (!saveAsPresetNodeId) return null;
    const node = nodes.find(n => n.id === saveAsPresetNodeId);
    return node ? { data: node.data, type: node.type || 'textBlock' } : null;
  }, [saveAsPresetNodeId, nodes]);

  const openContextMenu = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      setContextMenuPosition(position);
      setContextMenuNodeId(nodeId);
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null);
    setContextMenuNodeId(null);
  }, []);

  return {
    contextMenuPosition,
    contextMenuNodeId,
    saveAsPresetNodeId,
    customPresets,
    saveAsPresetNode,
    setContextMenuPosition,
    setSaveAsPresetNodeId,
    openContextMenu,
    closeContextMenu,
    handleSaveAsPreset,
    handleSavePreset
  };
}

import { useState, useCallback, useMemo } from 'react';
export function useContextMenu({ nodes, showToast }) {
    const [contextMenuPosition, setContextMenuPosition] = useState(null);
    const [contextMenuNodeId, setContextMenuNodeId] = useState(null);
    const [saveAsPresetNodeId, setSaveAsPresetNodeId] = useState(null);
    const [customPresets, setCustomPresets] = useState([]);
    const handleSaveAsPreset = useCallback(() => {
        if (contextMenuNodeId) {
            setSaveAsPresetNodeId(contextMenuNodeId);
            setContextMenuPosition(null);
        }
    }, [contextMenuNodeId]);
    const handleSavePreset = useCallback((preset) => {
        setCustomPresets(prev => [...prev, preset]);
        showToast('Preset saved successfully!', 'success');
        setSaveAsPresetNodeId(null);
    }, [showToast]);
    // Get node data for save-as-preset dialog
    const saveAsPresetNode = useMemo(() => {
        if (!saveAsPresetNodeId)
            return null;
        const node = nodes.find(n => n.id === saveAsPresetNodeId);
        return node ? { data: node.data, type: node.type || 'textBlock' } : null;
    }, [saveAsPresetNodeId, nodes]);
    const openContextMenu = useCallback((nodeId, position) => {
        setContextMenuPosition(position);
        setContextMenuNodeId(nodeId);
    }, []);
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

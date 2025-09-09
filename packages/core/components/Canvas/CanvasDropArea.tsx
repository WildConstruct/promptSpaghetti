// CanvasDropArea - integrates drop target, overlay, modal, and error toasts
// Story 2.5a: Asset Browser Integration MVP

import React, { useCallback, useMemo, useState } from 'react';
import { CanvasDropTarget, DraggedAsset } from '../AssetBrowser/DragDropHandler';
import { DropZoneOverlay, DropZoneState } from './DropZoneOverlay';
import { NodeReplacementModal, ConnectionValidator, ReplacementInfo } from './NodeReplacementModal';
import { ErrorRecoveryToast, DropError } from '../Toast/ErrorRecoveryToast';
import { ConsentService } from '../../services/consent';
import { TreeBuilder } from '../../services/TreeBuilder';
import TreePreviewModal from './TreePreviewModal';
import { mapAssetToNodeType, mapReactFlowTypeToCompat, canConnect } from '../../services/assetTypeMapping';

export interface CanvasDropAreaProps {\n  children: React.ReactNode;\n  nodes: Array<{ id: string; type: string; label?: string; selected?: boolean }>;\n  edges: Array<{ source: string; target: string; sourceHandle?: string; targetHandle?: string }>;\n  onCreateFromAsset: (asset: DraggedAsset, position: { x: number; y: number }) => void;\n  onReplaceNode: (targetNodeId: string, asset: DraggedAsset) => void;\n  onQuickAddChoice?: (weightedChoiceNodeId: string, asset: DraggedAsset, weight?: number) => void;\n  onInsertTree?: (nodes: any[], edges: any[]) => void;\n  onMergeChoices?: (targetNodeId: string, asset: DraggedAsset) => void;\n  onCreateVariant?: (targetNodeId: string) => void;\n  onSmartSwap?: (targetNodeId: string, asset: DraggedAsset) => void;\n  onReplaceAllSimilar?: (targetNodeId: string, asset: DraggedAsset) => void;\n  onReplaceAllSelected?: (targetIds: string[], asset: DraggedAsset, onProgress: (done: number, total: number) => boolean) => void;\n}\n
export const CanvasDropArea: React.FC<CanvasDropAreaProps> = ({
  children,
  nodes,
  edges,
  onCreateFromAsset,
  onReplaceNode,
  onQuickAddChoice,
  onInsertTree,
  onMergeChoices,
  onCreateVariant,
  onSmartSwap,
  onReplaceAllSimilar,
  onReplaceAllSelected
}) => {
  const [overlay, setOverlay] = useState<DropZoneState>({ isOver: false, canDrop: false });
  const [toast, setToast] = useState<DropError | null>(null);
  const [modal, setModal] = useState<{ visible: boolean; info?: ReplacementInfo }>({ visible: false });
  const [treePreview, setTreePreview] = useState<{ visible: boolean; result?: any }>({ visible: false });
  const [treeBuilder] = useState(() => new TreeBuilder());

  const nodeTypeById = useMemo(() => {
    const map = new Map<string, string>();
    nodes.forEach(n => map.set(n.id, n.type));
    return map;
  }, [nodes]);

  const handleHover = useCallback((isOver: boolean, canDrop: boolean) => {
    setOverlay(prev => ({ ...prev, isOver, canDrop }));
  }, []);

  const handleInvalidDrop = useCallback((error: DropError) => {
    setToast(error);
    // Also show overlay as invalid briefly
    setOverlay(prev => ({ ...prev, isOver: true, canDrop: false }));
    setTimeout(() => setOverlay(prev => ({ ...prev, isOver: false })), 2000);
  }, []);

  const handleDrop = useCallback((asset: DraggedAsset, position: { x: number; y: number }, targetNodeId?: string) => {
    // Consent validation (optional P2)
    const consent = ConsentService.check({ id: asset.id, name: asset.name, metadata: (asset as any).metadata });
    if (!consent.allowed) {
      setToast({
        type: 'general',
        message: consent.status === 'denied'
          ? 'Consent denied for this asset. Enable consent or choose a different asset. You can adjust this in File ? Settings.'
          : 'Consent unclear for this asset. Enable consent or choose a different asset. You can adjust this in File ? Settings.'
      });
      ConsentService.audit('asset_drop', { id: asset.id, name: asset.name }, false);
      return;
    }
    if (!targetNodeId) {
      // Build Tree mode?
      let buildTree = false;
      try { buildTree = window?.localStorage?.getItem('buildTree.enabled') === 'true'; } catch {}
      if (buildTree && onInsertTree) {
        treeBuilder.buildTreeFromAsset(asset, { position, graphState: { nodes, edges } }).then(res => {
          setTreePreview({ visible: true, result: res });
        }).catch(() => {
          // fallback to simple create
          onCreateFromAsset(asset, position);
          ConsentService.audit('asset_drop', { id: asset.id, name: asset.name }, true);
        });
      } else {
        onCreateFromAsset(asset, position);
        ConsentService.audit('asset_drop', { id: asset.id, name: asset.name }, true);
      }
      return;
    }
    const targetType = nodeTypeById.get(targetNodeId);
    if (targetType === 'WeightedChoice' && onQuickAddChoice) {
      onQuickAddChoice(targetNodeId, asset, 5);
      // Success toast is optional; rely on host app to show success message
      ConsentService.audit('asset_drop', { id: asset.id, name: asset.name }, true);
      return;
    }
    // Open replacement modal (MVP: assume connection preservation when replacing visuals)
    const currentNode = { id: targetNodeId, type: targetType || 'Unknown' } as any;
    // Preview impact using compat matrix
    const mapped = mapAssetToNodeType({ id: asset.id, name: asset.name, metadata: (asset as any).metadata } as any);
    const newCompat = mapped.compatType;
    const incompatible: string[] = [];
    const preservedCount = (edges || []).reduce((acc, e) => {
      if (e.source !== targetNodeId && e.target !== targetNodeId) return acc;
      const isOutgoing = e.source === targetNodeId;
      const neighborId = isOutgoing ? e.target : e.source;
      const neighbor = nodes.find(n => n.id === neighborId);
      const neighborType = String((neighbor as any)?.data?.type || neighbor?.type || 'Unknown');
      const neighborCompat = mapReactFlowTypeToCompat(neighborType);
      const keep = isOutgoing
        ? canConnect(newCompat, neighborCompat)
        : canConnect(neighborCompat, newCompat);
      if (!keep) {
        const label = nodes.find(n => n.id === neighborId)?.label || neighborId;
        incompatible.push(isOutgoing ? `Output to ${label}` : `Input from ${label}`);
        return acc;
      }
      return acc + 1;
    }, 0);
    const impact = { preserved: preservedCount, lost: incompatible.length, incompatible };
    const info: ReplacementInfo = {
      targetNode: { id: targetNodeId, type: targetType || 'Unknown', label: nodes.find(n => n.id === targetNodeId)?.label || targetNodeId },
      newAsset: { id: asset.id, name: asset.name, type: 'auto' },
      connectionImpact: impact
    };
    setModal({ visible: true, info });
  }, [edges, nodeTypeById, nodes, onCreateFromAsset, onQuickAddChoice]);

  const confirmReplace = useCallback(() => {
    if (!modal.info) return;
    // Remove incompatible edges if any
    const targetId = modal.info.targetNode.id;
    const incompatibleSet = new Set<string>();
    (modal.info.connectionImpact.incompatible || []).forEach((desc) => {
      // desc format: "Input from <nodeId>" or "Output to <nodeId>"
      const m = /\bfrom\s+(\S+)$/.exec(desc) || /\bto\s+(\S+)$/.exec(desc);
      if (m && m[1]) incompatibleSet.add(m[1]);
    });

    // Update edges: drop any edge connected between target and incompatible counterpart
    if (incompatibleSet.size > 0) {
      // This component doesn't own edges; host must remove via callback. For MVP, emit a toast.
      setToast({ type: 'connection_conflict', message: `This would break ${incompatibleSet.size} connections. Disconnect downstream nodes or use 'Replace All' (coming in 2.5b).` });
    }

    onReplaceNode(targetId, {
      id: modal.info.newAsset.id,
      name: modal.info.newAsset.name,
      type: modal.info.newAsset.type as any,
      content: undefined
    });
    setModal({ visible: false });
  }, [modal, onReplaceNode]);

  return (
    <div className="canvas-drop-area" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <CanvasDropTarget
        onDrop={handleDrop}
        onHover={handleHover}
        onInvalidDrop={handleInvalidDrop}
      >
        {children}
      </CanvasDropTarget>
      <DropZoneOverlay state={overlay} />
      {toast && (
        <ErrorRecoveryToast
          error={toast}
          onDismiss={() => setToast(null)}
          autoHideDelay={2000}
        />
      )}
      {modal.visible && modal.info && (
        <NodeReplacementModal
          info={modal.info}
          isVisible={modal.visible}
          onCancel={() => setModal({ visible: false })}
          onReplace={confirmReplace}
          advancedActions={{
            onMergeChoices: onMergeChoices ? () => { onMergeChoices(modal.info!.targetNode.id, { id: modal.info!.newAsset.id, name: modal.info!.newAsset.name, type: 'psglib', content: undefined } as any); setModal({ visible: false }); } : undefined,
            onCreateVariant: onCreateVariant ? () => { onCreateVariant(modal.info!.targetNode.id); setModal({ visible: false }); } : undefined,
            onSmartSwap: onSmartSwap ? () => { onSmartSwap(modal.info!.targetNode.id, { id: modal.info!.newAsset.id, name: modal.info!.newAsset.name, type: 'psglib', content: undefined } as any); setModal({ visible: false }); } : undefined,
            onReplaceAllSimilar: onReplaceAllSimilar ? () => { onReplaceAllSimilar(modal.info!.targetNode.id, { id: modal.info!.newAsset.id, name: modal.info!.newAsset.name, type: 'psglib', content: undefined } as any); setModal({ visible: false }); } : undefined
          }}
        />
      )}
      {treePreview.visible && treePreview.result && (
        <TreePreviewModal
          visible={treePreview.visible}
          result={treePreview.result}
          onCancel={() => setTreePreview({ visible: false })}
          onAccept={() => {
            if (onInsertTree && treePreview.result) {
              onInsertTree(treePreview.result.nodes, treePreview.result.edges);
              ConsentService.audit('asset_drop', { id: treePreview.result.template?.id || 'tree', name: treePreview.result.template?.name }, true);
            }
            setTreePreview({ visible: false });
          }}
        />
      )}
    </div>
  );
};








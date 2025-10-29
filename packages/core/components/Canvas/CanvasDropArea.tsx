// CanvasDropArea - integrates drop target, overlay, modal, and error toasts
// Story 2.5a: Asset Browser Integration MVP

import React, { useCallback, useMemo, useState } from 'react';
import {
  CanvasDropTarget,
  type DraggedAsset
} from '../AssetBrowser/DragDropHandler';
import {
  DropZoneOverlay,
  type DropZoneState
} from './DropZoneOverlay';
import {
  NodeReplacementModal,
  type ReplacementInfo
} from './NodeReplacementModal';
import {
  ErrorRecoveryToast,
  type DropError
} from '../Toast/ErrorRecoveryToast';
import { ConsentService } from '../../services/consent';
import {
  TreeBuilder,
  type BuildTreeResult
} from '../../services/TreeBuilder';
import TreePreviewModal from './TreePreviewModal';
import {
  mapAssetToNodeType,
  mapReactFlowTypeToCompat,
  canConnect
} from '../../services/assetTypeMapping';

interface CanvasNodeSummary {
  id: string;
  type: string;
  label?: string;
  data?: Record<string, unknown>;
  selected?: boolean;
}

interface CanvasEdgeSummary {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

type ProgressCallback = (done: number, total: number) => boolean;

interface CanvasDropAreaProps {
  children: React.ReactNode;
  nodes: CanvasNodeSummary[];
  edges: CanvasEdgeSummary[];
  onCreateFromAsset: (
    asset: DraggedAsset,
    position: { x: number; y: number }
  ) => void;
  onReplaceNode: (targetNodeId: string, asset: DraggedAsset) => void;
  onQuickAddChoice?: (
    weightedChoiceNodeId: string,
    asset: DraggedAsset,
    weight?: number
  ) => void;
  onInsertTree?: (
    nodes: BuildTreeResult['nodes'],
    edges: BuildTreeResult['edges']
  ) => void;
  onMergeChoices?: (targetNodeId: string, asset: DraggedAsset) => void;
  onCreateVariant?: (targetNodeId: string) => void;
  onSmartSwap?: (targetNodeId: string, asset: DraggedAsset) => void;
  onReplaceAllSimilar?: (targetNodeId: string, asset: DraggedAsset) => void;
  onReplaceAllSelected?: (
    targetIds: string[],
    asset: DraggedAsset,
    onProgress: ProgressCallback
  ) => void;
}

type ModalState = {
  visible: boolean;
  info: ReplacementInfo | null;
  asset: DraggedAsset | null;
};

type TreePreviewState = {
  visible: boolean;
  result: BuildTreeResult | null;
};

const CONNECTION_WARNING =
  "This would break {count} connections. Disconnect downstream nodes or use 'Replace All' (coming in 2.5b).";

const buildReplacementImpact = (
  targetNodeId: string,
  mappedType: ReturnType<typeof mapAssetToNodeType>,
  nodes: CanvasNodeSummary[],
  edges: CanvasEdgeSummary[]
): ReplacementInfo['connectionImpact'] => {
  let preserved = 0;
  const incompatible: string[] = [];

  edges.forEach(edge => {
    if (edge.source !== targetNodeId && edge.target !== targetNodeId) {
      return;
    }

    const isOutgoing = edge.source === targetNodeId;
    const neighborId = isOutgoing ? edge.target : edge.source;
    const neighbor =
      nodes.find(node => node.id === neighborId) ?? undefined;
    const neighborType =
      typeof neighbor?.data?.type === 'string'
        ? String(neighbor.data.type)
        : neighbor?.type ?? 'Unknown';
    const neighborCompat = mapReactFlowTypeToCompat(neighborType);
    const keepConnection = isOutgoing
      ? canConnect(mappedType.compatType, neighborCompat)
      : canConnect(neighborCompat, mappedType.compatType);

    if (keepConnection) {
      preserved += 1;
      return;
    }

    const label = neighbor?.label ?? neighborId;
    incompatible.push(
      isOutgoing ? `Output to ${label}` : `Input from ${label}`
    );
  });

  return {
    preserved,
    lost: incompatible.length,
    incompatible
  };
};

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
  const [overlay, setOverlay] = useState<DropZoneState>({
    isOver: false,
    canDrop: false
  });
  const [toast, setToast] = useState<DropError | null>(null);
  const [modal, setModal] = useState<ModalState>({
    visible: false,
    info: null,
    asset: null
  });
  const [treePreview, setTreePreview] = useState<TreePreviewState>({
    visible: false,
    result: null
  });
  const [treeBuilder] = useState(() => new TreeBuilder());

  const nodeTypeById = useMemo(() => {
    const map = new Map<string, string>();
    nodes.forEach(node => map.set(node.id, node.type));
    return map;
  }, [nodes]);

  const handleHover = useCallback((isOver: boolean, canDrop: boolean) => {
    setOverlay(prev => ({ ...prev, isOver, canDrop }));
  }, []);

  const handleInvalidDrop = useCallback((error: DropError) => {
    setToast(error);
    setOverlay(prev => ({ ...prev, isOver: true, canDrop: false }));
    setTimeout(
      () =>
        setOverlay(prev => ({
          ...prev,
          isOver: false,
          canDrop: false
        })),
      2000
    );
  }, []);

  const closeModal = useCallback(() => {
    setModal({ visible: false, info: null, asset: null });
  }, []);

  const handleDrop = useCallback(
    (
      asset: DraggedAsset,
      position: { x: number; y: number },
      targetNodeId?: string
    ) => {
      const consent = ConsentService.check({
        id: asset.id,
        name: asset.name,
        metadata: asset.metadata
      });
      if (!consent.allowed) {
        setToast({
          type: 'general',
          message:
            consent.status === 'denied'
              ? 'Consent denied for this asset. Enable consent or choose a different asset. You can adjust this in File -> Settings.'
              : 'Consent unclear for this asset. Enable consent or choose a different asset. You can adjust this in File -> Settings.'
        });
        ConsentService.audit(
          'asset_drop',
          { id: asset.id, name: asset.name },
          false
        );
        return;
      }

      if (!targetNodeId) {
        let buildTree = false;
        try {
          buildTree =
            window?.localStorage?.getItem('buildTree.enabled') === 'true';
        } catch {
          buildTree = false;
        }

        if (buildTree && onInsertTree) {
          treeBuilder
            .buildTreeFromAsset(asset, { position, graphState: { nodes, edges } })
            .then(result => {
              setTreePreview({ visible: true, result });
            })
            .catch(() => {
              onCreateFromAsset(asset, position);
              ConsentService.audit(
                'asset_drop',
                { id: asset.id, name: asset.name },
                true
              );
            });
        } else {
          onCreateFromAsset(asset, position);
          ConsentService.audit(
            'asset_drop',
            { id: asset.id, name: asset.name },
            true
          );
        }
        return;
      }

      const targetType = nodeTypeById.get(targetNodeId);
      if (targetType === 'WeightedChoice' && onQuickAddChoice) {
        onQuickAddChoice(targetNodeId, asset, 5);
        ConsentService.audit(
          'asset_drop',
          { id: asset.id, name: asset.name },
          true
        );
        return;
      }

      const mappedType = mapAssetToNodeType({
        id: asset.id,
        name: asset.name,
        metadata: asset.metadata
      });
      const impact = buildReplacementImpact(
        targetNodeId,
        mappedType,
        nodes,
        edges
      );
      const replacementInfo: ReplacementInfo = {
        targetNode: {
          id: targetNodeId,
          type: targetType ?? 'Unknown',
          label:
            nodes.find(node => node.id === targetNodeId)?.label ??
            targetNodeId
        },
        newAsset: {
          id: asset.id,
          name: asset.name,
          type: asset.type
        },
        connectionImpact: impact
      };

      setModal({
        visible: true,
        info: replacementInfo,
        asset
      });
    },
    [edges, nodeTypeById, nodes, onCreateFromAsset, onInsertTree, onQuickAddChoice, treeBuilder]
  );

  const confirmReplace = useCallback(() => {
    if (!modal.info || !modal.asset) {
      return;
    }

    const connectionLossCount = modal.info.connectionImpact.incompatible.length;
    if (connectionLossCount > 0) {
      setToast({
        type: 'connection_conflict',
        message: CONNECTION_WARNING.replace(
          '{count}',
          String(connectionLossCount)
        )
      });
    }

    onReplaceNode(modal.info.targetNode.id, modal.asset);
    ConsentService.audit(
      'asset_drop',
      { id: modal.asset.id, name: modal.asset.name },
      true
    );
    closeModal();
  }, [closeModal, modal, onReplaceNode]);

  return (
    <div
      className="canvas-drop-area"
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
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
      {modal.visible && modal.info && modal.asset && (
        <NodeReplacementModal
          info={modal.info}
          isVisible={modal.visible}
          onCancel={closeModal}
          onReplace={confirmReplace}
          advancedActions={{
            onMergeChoices: onMergeChoices
              ? () => {
                  onMergeChoices(modal.info.targetNode.id, modal.asset);
                  closeModal();
                }
              : undefined,
            onCreateVariant: onCreateVariant
              ? () => {
                  onCreateVariant(modal.info.targetNode.id);
                  closeModal();
                }
              : undefined,
            onSmartSwap: onSmartSwap
              ? () => {
                  onSmartSwap(modal.info.targetNode.id, modal.asset);
                  closeModal();
                }
              : undefined,
            onReplaceAllSimilar: onReplaceAllSimilar
              ? () => {
                  onReplaceAllSimilar(modal.info.targetNode.id, modal.asset);
                  closeModal();
                }
              : undefined,
            onReplaceAllSelected: onReplaceAllSelected
              ? () => {
                  onReplaceAllSelected(
                    nodes
                      .filter(node => node.selected)
                      .map(node => node.id),
                    modal.asset,
                    () => true
                  );
                  closeModal();
                }
              : undefined
          }}
        />
      )}
      {treePreview.visible && treePreview.result && (
        <TreePreviewModal
          visible={treePreview.visible}
          result={treePreview.result}
          onCancel={() =>
            setTreePreview({ visible: false, result: null })
          }
          onAccept={() => {
            if (onInsertTree && treePreview.result) {
              onInsertTree(
                treePreview.result.nodes,
                treePreview.result.edges
              );
              ConsentService.audit(
                'asset_drop',
                {
                  id: treePreview.result.template?.id ?? 'tree',
                  name: treePreview.result.template?.name
                },
                true
              );
            }
            setTreePreview({ visible: false, result: null });
          }}
        />
      )}
    </div>
  );
};

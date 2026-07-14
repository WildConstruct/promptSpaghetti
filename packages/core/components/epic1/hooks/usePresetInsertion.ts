/**
 * Preset / fragment insertion orchestration for Epic1GraphEditor (C3a).
 * Wraps pure helpers in services/presetAndFragmentInsertion.ts.
 */

import { useCallback } from 'react';
import type { Edge, Node, ReactFlowInstance } from 'reactflow';
import type { AgentFragmentRecord, Preset } from '@prompt/asset-browser';
import type { Asset } from '../../../services/assetMatcher';
import type { EditableNodeData } from '../nodes';
import type { FragmentDropTarget } from '../services/FragmentDropTargeting';
import { findFragmentDropTarget } from '../services/FragmentDropTargeting';
import { planFragmentInsertion } from '../services/FragmentInsertionPlanner';
import { AgentFragmentSuggestionService } from '../services/AgentFragmentSuggestionService';
import type { PresetDropPayload } from './useDragDropHandlers';
import {
  buildEdgeSpliceTarget,
  buildViewportFallbackInsertion,
  presetToAgentFragmentRecord
} from '../services/presetAndFragmentInsertion';

export type InsertPresetByMeta = (
  preset: Preset | PresetDropPayload,
  position: { x: number; y: number },
  edgeSpliceTarget?: ReturnType<typeof buildEdgeSpliceTarget>,
  nodeReplacementTarget?: { nodeId: string } | null
) => void | Promise<void>;

export type UsePresetInsertionArgs = {
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  reactFlowInstance: ReactFlowInstance | null;
  insertPresetByMeta: InsertPresetByMeta;
};

export function usePresetInsertion({
  nodes,
  edges,
  selectedNodeId,
  reactFlowInstance,
  insertPresetByMeta
}: UsePresetInsertionArgs) {
  const executePresetWithTarget = useCallback(
    (
      preset: Preset,
      options?: {
        dropTarget?: FragmentDropTarget | null;
        position?: { x: number; y: number } | null;
      }
    ) => {
      const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;
      const fragment = presetToAgentFragmentRecord(preset);
      let resolvedTarget = options?.dropTarget ?? null;

      if (!resolvedTarget && selectedNode) {
        const metadataPrefersReplacement =
          fragment.preferredInsertion === 'replace-node';
        if (metadataPrefersReplacement) {
          resolvedTarget = findFragmentDropTarget({
            pointer: {
              x: selectedNode.position.x + (selectedNode.width ?? 180) / 2,
              y: selectedNode.position.y + (selectedNode.height ?? 72) / 2
            },
            fragment,
            nodes,
            edges
          });
        }
      }

      const replacementTarget =
        resolvedTarget?.kind === 'replace-node' ? resolvedTarget : null;

      if (replacementTarget) {
        const targetNode = nodes.find(
          node => node.id === replacementTarget.nodeId
        );
        if (targetNode) {
          void insertPresetByMeta(preset, targetNode.position, null, {
            nodeId: targetNode.id
          });
          return;
        }
      }

      if (resolvedTarget?.kind === 'insert-edge') {
        void insertPresetByMeta(
          preset,
          resolvedTarget.midpoint,
          buildEdgeSpliceTarget(edges, resolvedTarget.edgeId)
        );
        return;
      }

      const insertionPlan = selectedNode
        ? planFragmentInsertion({
            fragment,
            selectedNode,
            nodes,
            edges
          })
        : buildViewportFallbackInsertion(reactFlowInstance);

      const edgeSpliceTarget = insertionPlan.targetEdgeId
        ? buildEdgeSpliceTarget(edges, insertionPlan.targetEdgeId)
        : null;

      void insertPresetByMeta(
        preset,
        options?.position ?? insertionPlan.position,
        edgeSpliceTarget
      );
    },
    [edges, insertPresetByMeta, nodes, reactFlowInstance, selectedNodeId]
  );

  const handleAssetInsert = useCallback(
    (item: Preset | Asset) => {
      const preset = item as Preset;
      if (!preset) {
        return;
      }
      executePresetWithTarget(preset);
    },
    [executePresetWithTarget]
  );

  const getFragmentSuggestions = useCallback(async () => {
    const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;
    return AgentFragmentSuggestionService.getSuggestions({
      selectedNode,
      nodes,
      edges
    });
  }, [edges, nodes, selectedNodeId]);

  /** Stable helper for drag-drop edge splice (same semantics as before). */
  const edgeSpliceFromId = useCallback(
    (edgeId?: string | null) => buildEdgeSpliceTarget(edges, edgeId),
    [edges]
  );

  return {
    executePresetWithTarget,
    handleAssetInsert,
    getFragmentSuggestions,
    edgeSpliceFromId,
    /** re-export pure helper for tests / window bridges if needed */
    presetToAgentFragmentRecord
  };
}

export type { AgentFragmentRecord };

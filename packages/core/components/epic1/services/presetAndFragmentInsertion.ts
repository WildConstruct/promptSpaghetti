/**
 * Pure helpers for preset → agent-fragment conversion and insertion targeting.
 * Extracted from Epic1GraphEditor (work-loop C3a). Behavior preserved.
 */

import type { Edge, ReactFlowInstance } from 'reactflow';
import type { AgentFragmentRecord, Preset } from '@prompt/asset-browser';
import type { InsertionPlan } from './FragmentInsertionPlanner';
import type { EdgeSpliceTarget } from './FragmentExecution';

export type { EdgeSpliceTarget };

/**
 * Map a library Preset into the AgentFragmentRecord shape used by
 * insertion planners and suggestion services.
 */
export function presetToAgentFragmentRecord(
  preset: Preset
): AgentFragmentRecord {
  const metadata = (preset.metadata ?? {}) as Record<string, unknown>;
  const roles = Array.isArray(metadata.roles)
    ? (metadata.roles.filter(
        (value): value is AgentFragmentRecord['roles'][number] =>
          typeof value === 'string'
      ) as AgentFragmentRecord['roles'])
    : [];
  const domains = Array.isArray(metadata.domains)
    ? (metadata.domains.filter(
        (value): value is AgentFragmentRecord['domains'][number] =>
          typeof value === 'string'
      ) as AgentFragmentRecord['domains'])
    : [];
  const placementHints = Array.isArray(metadata.placementHints)
    ? (metadata.placementHints.filter(
        (value): value is AgentFragmentRecord['placementHints'][number] =>
          typeof value === 'string'
      ) as AgentFragmentRecord['placementHints'])
    : [];
  const preferredInsertion =
    metadata.preferredInsertion === 'replace-node' ||
    metadata.preferredInsertion === 'insert-edge' ||
    metadata.preferredInsertion === 'free-place'
      ? metadata.preferredInsertion
      : 'free-place';
  const entryStrategy =
    metadata.entryStrategy === 'single-node' ||
    metadata.entryStrategy === 'auto-boundary' ||
    metadata.entryStrategy === 'manual'
      ? metadata.entryStrategy
      : 'auto-boundary';
  const exitStrategy =
    metadata.exitStrategy === 'single-node' ||
    metadata.exitStrategy === 'auto-boundary' ||
    metadata.exitStrategy === 'manual'
      ? metadata.exitStrategy
      : 'auto-boundary';
  const suggestionWeight =
    typeof metadata.suggestionWeight === 'number'
      ? metadata.suggestionWeight
      : 0;
  const requiresBranchLane = metadata.requiresBranchLane === true;

  const slotTypes = Array.isArray(metadata.slotTypes)
    ? (metadata.slotTypes.filter(
        (value): value is AgentFragmentRecord['slotTypes'][number] =>
          typeof value === 'string'
      ) as AgentFragmentRecord['slotTypes'])
    : (['subject'] as AgentFragmentRecord['slotTypes']);

  return {
    id: preset.id,
    name: preset.name,
    path:
      typeof preset.path === 'string'
        ? preset.path
        : typeof metadata.file === 'string'
          ? metadata.file
          : '',
    category: preset.category ?? 'uncategorized',
    description: preset.description,
    tags: preset.tags ?? [],
    roles,
    domains,
    slotTypes,
    nodeTypes: [],
    placementHints,
    tone: [],
    nodeCount: typeof preset.nodes === 'number' ? preset.nodes : 1,
    preferredInsertion,
    entryStrategy,
    exitStrategy,
    suggestionWeight,
    requiresBranchLane,
    priority: 0
  };
}

/** Snapshot edge fields needed to splice a fragment onto an existing edge. */
export function buildEdgeSpliceTarget(
  edges: Edge[],
  edgeId?: string | null
): EdgeSpliceTarget | null {
  if (!edgeId) {
    return null;
  }

  const originalEdge = edges.find(edge => edge.id === edgeId);
  if (!originalEdge) {
    return null;
  }

  return {
    edgeId: originalEdge.id,
    sourceId: originalEdge.source,
    targetId: originalEdge.target,
    edgeType: originalEdge.type,
    edgeClassName: (originalEdge as Edge & { className?: string }).className,
    edgeStyle: originalEdge.style as Record<string, unknown> | undefined,
    markerEnd: originalEdge.markerEnd,
    sourceHandle: originalEdge.sourceHandle ?? null,
    targetHandle: originalEdge.targetHandle ?? null
  };
}

/** Free-placement plan when nothing is selected. */
export function buildViewportFallbackInsertion(
  reactFlowInstance: ReactFlowInstance | null | undefined
): InsertionPlan {
  return reactFlowInstance
    ? {
        anchor: 'free-placement' as const,
        position: reactFlowInstance.screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        }),
        notes: ['No selection; using viewport center placement.']
      }
    : {
        anchor: 'free-placement' as const,
        position: { x: 250, y: 250 },
        notes: [
          'No selection or React Flow instance; using fallback position.'
        ]
      };
}

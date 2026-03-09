import type { Edge, Node } from 'reactflow';
import {
  AgentFragmentRetrievalService,
  type AgentFragmentRecord,
  type Preset
} from '@prompt/asset-browser';
import type { EditableNodeData } from '../nodes';
import { buildFragmentSuggestionContext } from './FragmentSuggestionContext';
import {
  planFragmentInsertion,
  type InsertionAnchor,
  type InsertionPlan
} from './FragmentInsertionPlanner';

type FlowNode = Node<EditableNodeData>;

export interface PlannedFragmentSuggestion {
  fragment: AgentFragmentRecord;
  plan: InsertionPlan | null;
  actionLabel: string;
  insertionLabel: string;
}

function getInsertionActionLabel(plan: InsertionPlan | null): string {
  if (!plan) {
    return 'Place';
  }

  if (plan.anchor === 'inside-region') {
    return 'Place in region';
  }

  if (plan.targetEdgeId) {
    return 'Insert on edge';
  }

  if (plan.sourceNodeId) {
    return 'Place from selection';
  }

  return 'Place';
}

function getInsertionLabel(anchor: InsertionAnchor | null): string {
  switch (anchor) {
    case 'branch-lane':
      return 'Branch lane';
    case 'before-output':
      return 'Before output';
    case 'inside-region':
      return 'Inside region';
    case 'downstream-node':
      return 'Downstream';
    case 'free-placement':
      return 'Free place';
    default:
      return 'Placement';
  }
}

function scoreSuggestion(params: {
  fragment: AgentFragmentRecord;
  context: NonNullable<ReturnType<typeof buildFragmentSuggestionContext>>;
  index: number;
}): number {
  const { fragment, context, index } = params;
  let score = 0;

  score += Math.max(20 - index, 0);
  score += fragment.priority ?? 0;

  if (context.selectedNodeType === 'weightedChoice') {
    if (fragment.placementHints.includes('downstream-of-choice')) {
      score += 8;
    }
    if (fragment.roles.includes('branch-extension')) {
      score += 6;
    }
  }

  if (context.isBranchLane) {
    if (fragment.placementHints.includes('branch-lane')) {
      score += 10;
    }
    if (fragment.roles.includes('branch-extension')) {
      score += 6;
    }
    score += Math.min(context.branchDepth ?? 0, 3);
  }

  if (context.needsMerge) {
    if (fragment.roles.includes('merge-helper')) {
      score += 10;
    }
    if (fragment.roles.includes('output-finisher')) {
      score += 4;
    }
  }

  if (context.leadsToOutput) {
    if (fragment.placementHints.includes('before-output')) {
      score += 8;
    }
    if (fragment.roles.includes('output-finisher')) {
      score += 6;
    }
  }

  if (context.hasNoOutgoing) {
    if (fragment.roles.includes('branch-extension')) {
      score += 8;
    }
    if (fragment.placementHints.includes(context.isBranchLane ? 'branch-lane' : 'downstream-of-choice')) {
      score += 5;
    }
  }

  if ((context.outputDistance ?? Infinity) <= 1) {
    if (fragment.roles.includes('output-finisher')) {
      score += 8;
    }
    if (fragment.placementHints.includes('before-output')) {
      score += 4;
    }
  }

  if ((context.outputDistance ?? Infinity) > 2 && fragment.roles.includes('modifier')) {
    score += 3;
  }

  if (context.selectedNodeType === 'enhancedBoundingBox' && fragment.placementHints.includes('inside-region')) {
    score += 12;
  }

  if (context.insideRegion && fragment.placementHints.includes('inside-region')) {
    score += 6;
  }

  if ((context.domainHints ?? []).some(domain => fragment.domains.includes(domain))) {
    score += 4;
  }

  if ((context.toneHints ?? []).some(tone => fragment.tone.includes(tone))) {
    score += 2;
  }

  return score;
}

export function agentFragmentRecordToPreset(
  record: AgentFragmentRecord
): Preset {
  return {
    id: record.id,
    name: record.name,
    path: record.path,
    type: 'graph',
    category: record.category,
    tags: [...record.tags, ...record.roles, ...record.domains],
    nodes: record.nodeCount,
    description: record.description,
    metadata: {
      file: record.path,
      roles: record.roles,
      domains: record.domains,
      placementHints: record.placementHints,
      preferredInsertion: record.preferredInsertion,
      entryStrategy: record.entryStrategy,
      exitStrategy: record.exitStrategy,
      suggestionWeight: record.suggestionWeight,
      requiresBranchLane: record.requiresBranchLane
    }
  };
}

export class AgentFragmentSuggestionService {
  static getPlannedSuggestions(params: {
    selectedNode?: FlowNode | null;
    nodes?: FlowNode[];
    edges?: Edge[];
    suggestions: AgentFragmentRecord[];
  }): PlannedFragmentSuggestion[] {
    const { selectedNode, nodes = [], edges = [], suggestions } = params;

    return suggestions.map(fragment => {
      const plan = selectedNode
        ? planFragmentInsertion({
            fragment,
            selectedNode,
            nodes,
            edges
          })
        : null;

      return {
        fragment,
        plan,
        actionLabel: getInsertionActionLabel(plan),
        insertionLabel: getInsertionLabel(plan?.anchor ?? null)
      };
    });
  }

  static async getSuggestions(params: {
    selectedNode?: FlowNode | null;
    nodes?: FlowNode[];
    edges?: Edge[];
  }): Promise<AgentFragmentRecord[]> {
    const context = buildFragmentSuggestionContext(params);
    if (!context) {
      return [];
    }

    const suggestions = await AgentFragmentRetrievalService.suggestFragmentsForSelection(context);

    return suggestions
      .map((fragment, index) => ({
        fragment,
        score: scoreSuggestion({
          fragment,
          context,
          index
        })
      }))
      .sort((left, right) => right.score - left.score)
      .map(entry => entry.fragment);
  }

  static async insertSuggestion(params: {
    suggestion: AgentFragmentRecord;
    insertPreset: (preset: Preset) => Promise<void> | void;
  }): Promise<void> {
    await params.insertPreset(agentFragmentRecordToPreset(params.suggestion));
  }

  static async insertTopSuggestion(params: {
    selectedNode?: FlowNode | null;
    nodes?: FlowNode[];
    edges?: Edge[];
    insertPreset: (preset: Preset) => Promise<void> | void;
  }): Promise<AgentFragmentRecord | null> {
    const suggestions = await this.getSuggestions({
      selectedNode: params.selectedNode,
      nodes: params.nodes,
      edges: params.edges
    });

    const topSuggestion = suggestions[0] ?? null;
    if (!topSuggestion) {
      return null;
    }

    await this.insertSuggestion({
      suggestion: topSuggestion,
      insertPreset: params.insertPreset
    });

    return topSuggestion;
  }
}

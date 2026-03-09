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
  insertionLabel: string;
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
      placementHints: record.placementHints
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

    return AgentFragmentRetrievalService.suggestFragmentsForSelection(context);
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

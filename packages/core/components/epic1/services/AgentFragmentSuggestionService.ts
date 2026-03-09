import type { Edge, Node } from 'reactflow';
import {
  AgentFragmentRetrievalService,
  type AgentFragmentRecord,
  type Preset
} from '@prompt/asset-browser';
import type { EditableNodeData } from '../nodes';
import { buildFragmentSuggestionContext } from './FragmentSuggestionContext';

type FlowNode = Node<EditableNodeData>;

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

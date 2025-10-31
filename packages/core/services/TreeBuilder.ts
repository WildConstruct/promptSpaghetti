// Context-Aware Tree Builder for Advanced Asset Browser
// Story 2.5b: Advanced Asset Browser Features

import { Node, Edge } from 'reactflow';
import { LLMService } from './llm/LLMService';

type TreeNodeData = {
  label?: string;
  [key: string]: unknown;
};

interface AssetMetadata extends Record<string, unknown> {
  category?: string;
  complexity?: 'simple' | 'medium' | 'complex';
  estimatedNodes?: number;
}

interface TreeAsset {
  id?: string;
  type?: string;
  name?: string;
  metadata?: AssetMetadata;
  [key: string]: unknown;
}

interface GraphStateSummary extends Record<string, unknown> {
  summary?: unknown;
}

interface TreeBuilderContext {
  graphState?: GraphStateSummary;
  userPreferences?: Record<string, unknown>;
  position: { x: number; y: number };
}

interface SuggestedPosition {
  x?: number;
  y?: number;
}

interface SuggestedNode {
  type: string;
  label?: string;
  position?: SuggestedPosition;
  data?: Record<string, unknown>;
}

interface SuggestedEdge {
  source?: string;
  target?: string;
  sourceIndex?: number;
  targetIndex?: number;
  sourceHandle?: string;
  targetHandle?: string;
}

interface TreeSuggestion {
  nodes: SuggestedNode[];
  edges: SuggestedEdge[];
}

type TreeBuilderNode = Node<TreeNodeData>;
type TreeBuilderEdge = Edge<Record<string, unknown> | undefined>;

export interface TreeTemplate {
  id: string;
  name: string;
  description: string;
  nodes: TreeNode[];
  edges: TreeEdge[];
  metadata?: {
    category?: string;
    complexity?: 'simple' | 'medium' | 'complex';
    estimatedNodes?: number;
  };
}

export interface TreeNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  data?: TreeNodeData;
}

export interface TreeEdge {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface BuildTreeResult {
  nodes: TreeBuilderNode[];
  edges: TreeBuilderEdge[];
  template: TreeTemplate;
  confidence: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export class TreeBuilder {
  private llmService: LLMService | null = null;

  // Predefined templates for offline fallback
  private static readonly TEMPLATES: TreeTemplate[] = [
    {
      id: 'character-basic',
      name: 'Basic Character',
      description: 'Simple character with name and action',
      nodes: [
        {
          id: 'var-name',
          type: 'Variable',
          label: 'Name',
          position: { x: 100, y: 100 }
        },
        {
          id: 'var-role',
          type: 'Variable',
          label: 'Role',
          position: { x: 300, y: 100 }
        },
        {
          id: 'choice-action',
          type: 'WeightedChoice',
          label: 'Action',
          position: { x: 200, y: 200 }
        },
        {
          id: 'concat',
          type: 'Concat',
          label: 'Combine',
          position: { x: 200, y: 300 }
        },
        {
          id: 'output',
          type: 'Output',
          label: 'Result',
          position: { x: 200, y: 400 }
        }
      ],
      edges: [
        { source: 'var-name', target: 'concat' },
        { source: 'var-role', target: 'concat' },
        { source: 'choice-action', target: 'concat' },
        { source: 'concat', target: 'output' }
      ],
      metadata: {
        category: 'character',
        complexity: 'simple',
        estimatedNodes: 5
      }
    },
    {
      id: 'character-complex',
      name: 'Complex Character',
      description: 'Character with personality, mood, and action variations',
      nodes: [
        {
          id: 'var-name',
          type: 'Variable',
          label: 'Name',
          position: { x: 100, y: 50 }
        },
        {
          id: 'var-role',
          type: 'Variable',
          label: 'Role',
          position: { x: 300, y: 50 }
        },
        {
          id: 'choice-personality',
          type: 'WeightedChoice',
          label: 'Personality',
          position: { x: 100, y: 150 }
        },
        {
          id: 'choice-mood',
          type: 'WeightedChoice',
          label: 'Mood',
          position: { x: 300, y: 150 }
        },
        {
          id: 'choice-action',
          type: 'WeightedChoice',
          label: 'Action',
          position: { x: 200, y: 250 }
        },
        {
          id: 'concat-traits',
          type: 'Concat',
          label: 'Traits',
          position: { x: 200, y: 350 }
        },
        {
          id: 'concat-final',
          type: 'Concat',
          label: 'Final',
          position: { x: 200, y: 450 }
        },
        {
          id: 'output',
          type: 'Output',
          label: 'Character',
          position: { x: 200, y: 550 }
        }
      ],
      edges: [
        { source: 'var-name', target: 'concat-final' },
        { source: 'var-role', target: 'concat-final' },
        { source: 'choice-personality', target: 'concat-traits' },
        { source: 'choice-mood', target: 'concat-traits' },
        { source: 'choice-action', target: 'concat-traits' },
        { source: 'concat-traits', target: 'concat-final' },
        { source: 'concat-final', target: 'output' }
      ],
      metadata: {
        category: 'character',
        complexity: 'complex',
        estimatedNodes: 8
      }
    },
    {
      id: 'scene-urban',
      name: 'Urban Scene',
      description: 'City environment with crowds and atmosphere',
      nodes: [
        {
          id: 'var-location',
          type: 'Variable',
          label: 'Location',
          position: { x: 200, y: 50 }
        },
        {
          id: 'choice-time',
          type: 'WeightedChoice',
          label: 'Time of Day',
          position: { x: 100, y: 150 }
        },
        {
          id: 'choice-weather',
          type: 'WeightedChoice',
          label: 'Weather',
          position: { x: 300, y: 150 }
        },
        {
          id: 'choice-crowd',
          type: 'WeightedChoice',
          label: 'Crowd Density',
          position: { x: 200, y: 250 }
        },
        {
          id: 'concat-env',
          type: 'Concat',
          label: 'Environment',
          position: { x: 200, y: 350 }
        },
        {
          id: 'output',
          type: 'Output',
          label: 'Scene',
          position: { x: 200, y: 450 }
        }
      ],
      edges: [
        { source: 'var-location', target: 'concat-env' },
        { source: 'choice-time', target: 'concat-env' },
        { source: 'choice-weather', target: 'concat-env' },
        { source: 'choice-crowd', target: 'concat-env' },
        { source: 'concat-env', target: 'output' }
      ],
      metadata: {
        category: 'environment',
        complexity: 'medium',
        estimatedNodes: 6
      }
    }
  ];

  constructor(llmService?: LLMService) {
    this.llmService = llmService || null;
  }

  async buildTreeFromAsset(
    asset: TreeAsset,
    context: TreeBuilderContext
  ): Promise<BuildTreeResult> {
    // Try intelligent tree building if LLM available
    if (this.llmService) {
      try {
        return await this.buildIntelligentTree(asset, context);
      } catch (error) {
        console.warn(
          'Intelligent tree building failed, falling back to templates',
          error
        );
      }
    }

    // Fallback to template matching
    return this.buildFromTemplate(asset, context);
  }

  private async buildIntelligentTree(
    asset: TreeAsset,
    context: TreeBuilderContext
  ): Promise<BuildTreeResult> {
    if (!this.llmService) {
      throw new Error('LLM service not available');
    }

    // Analyze asset and suggest optimal structure
    const prompt = `
      Given this asset: ${JSON.stringify(asset.metadata || asset)}
      And current graph context: ${JSON.stringify(context.graphState?.summary || {})}
      
      Suggest an optimal node tree structure with:
      1. Node types and connections
      2. Logical data flow
      3. Variable injection points
      
      Return as JSON with nodes and edges arrays.
    `;

    const response = await this.llmService.complete({
      prompt,
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 1000
    });

    try {
      const suggestion = this.parseSuggestion(JSON.parse(response.content));
      if (suggestion) {
        return this.createTreeFromSuggestion(suggestion, context.position);
      }
    } catch {
      // If parsing fails, use template fallback
      return this.buildFromTemplate(asset, context);
    }

    return this.buildFromTemplate(asset, context);
  }

  private buildFromTemplate(
    asset: TreeAsset,
    context: TreeBuilderContext
  ): BuildTreeResult {
    // Match asset to best template
    const template = this.selectBestTemplate(asset);

    // Position nodes relative to drop position
    const nodes = this.positionNodes(template.nodes, context.position);
    const edges = this.createEdges(template.edges, nodes);

    return {
      nodes,
      edges,
      template,
      confidence: 0.7 // Template matching confidence
    };
  }

  private selectBestTemplate(asset: TreeAsset): TreeTemplate {
    const assetType = asset.type?.toLowerCase() ?? '';
    const assetName = asset.name?.toLowerCase() ?? '';
    const metadata = asset.metadata ?? {};

    // Score each template based on relevance
    const scores = TreeBuilder.TEMPLATES.map(template => {
      let score = 0;

      // Check name/type match
      if (assetName.includes('character') || assetType.includes('character')) {
        if (template.id.includes('character')) {
          score += 50;
        }
      }
      if (assetName.includes('scene') || assetName.includes('environment')) {
        if (template.id.includes('scene')) {
          score += 50;
        }
      }

      // Check metadata match
      if (metadata.category === template.metadata?.category) {
        score += 30;
      }

      // Prefer complexity based on asset richness
      const assetComplexity =
        Object.keys(metadata).length > 5 ? 'complex' : 'simple';
      if (template.metadata?.complexity === assetComplexity) {
        score += 20;
      }

      return { template, score };
    });

    // Return highest scoring template
    const best = scores.sort((a, b) => b.score - a.score)[0];
    return best.template || TreeBuilder.TEMPLATES[0];
  }

  private positionNodes(
    templateNodes: TreeNode[],
    basePosition: { x: number; y: number }
  ): TreeBuilderNode[] {
    const timestamp = Date.now();
    return templateNodes.map(node => ({
      id: `${node.id}-${timestamp}`,
      type: node.type.toLowerCase(),
      position: {
        x: basePosition.x + node.position.x,
        y: basePosition.y + node.position.y
      },
      data: {
        label: node.label,
        ...node.data
      }
    }));
  }

  private createEdges(
    templateEdges: TreeEdge[],
    nodes: TreeBuilderNode[]
  ): TreeBuilderEdge[] {
    // Map template IDs to actual node IDs
    const idMap = new Map<string, string>();
    nodes.forEach(node => {
      const templateId = node.id.split('-')[0];
      idMap.set(templateId, node.id);
    });

    const timestamp = Date.now();
    return templateEdges.map((edge, index) => ({
      id: `edge-${index}-${timestamp}`,
      source: idMap.get(edge.source.split('-')[0]) || edge.source,
      target: idMap.get(edge.target.split('-')[0]) || edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle
    }));
  }

  private createTreeFromSuggestion(
    suggestion: TreeSuggestion,
    position: { x: number; y: number }
  ): BuildTreeResult {
    const timestamp = Date.now();
    const nodes = suggestion.nodes.map((node, index) => ({
      id: `${node.type}-${timestamp}-${index}`,
      type: node.type.toLowerCase(),
      position: {
        x: position.x + (node.position?.x ?? index * 150),
        y: position.y + (node.position?.y ?? index * 100)
      },
      data: {
        label: node.label ?? node.type,
        ...node.data
      }
    }));

    const edges = suggestion.edges.map((edge, index) => ({
      id: `edge-${timestamp}-${index}`,
      source:
        (typeof edge.sourceIndex === 'number'
          ? nodes[edge.sourceIndex]?.id
          : undefined) ??
        edge.source ??
        '',
      target:
        (typeof edge.targetIndex === 'number'
          ? nodes[edge.targetIndex]?.id
          : undefined) ??
        edge.target ??
        '',
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle
    }));

    return {
      nodes,
      edges,
      template: {
        id: 'ai-generated',
        name: 'AI Generated Structure',
        description: 'Intelligently generated node tree',
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.type,
          label: n.data.label,
          position: n.position
        })),
        edges
      },
      confidence: 0.85
    };
  }

  private parseSuggestion(raw: unknown): TreeSuggestion | null {
    if (!isRecord(raw)) {
      return null;
    }

    const nodes = Array.isArray(raw.nodes)
      ? raw.nodes
          .map(node => this.normalizeSuggestedNode(node))
          .filter((node): node is SuggestedNode => Boolean(node))
      : [];
    const edges = Array.isArray(raw.edges)
      ? raw.edges
          .map(edge => this.normalizeSuggestedEdge(edge))
          .filter((edge): edge is SuggestedEdge => Boolean(edge))
      : [];

    if (!nodes.length || !edges.length) {
      return null;
    }

    return { nodes, edges };
  }

  private normalizeSuggestedNode(node: unknown): SuggestedNode | null {
    if (!isRecord(node)) {
      return null;
    }

    const { type } = node;
    if (typeof type !== 'string' || !type.trim()) {
      return null;
    }

    const label =
      typeof node.label === 'string' && node.label.trim().length > 0
        ? node.label
        : undefined;
    const data = isRecord(node.data) ? node.data : undefined;

    const positionValue = isRecord(node.position) ? node.position : undefined;
    const position: SuggestedPosition | undefined = positionValue
      ? {
          x: typeof positionValue.x === 'number' ? positionValue.x : undefined,
          y: typeof positionValue.y === 'number' ? positionValue.y : undefined
        }
      : undefined;

    return {
      type,
      label,
      data,
      position
    };
  }

  private normalizeSuggestedEdge(edge: unknown): SuggestedEdge | null {
    if (!isRecord(edge)) {
      return null;
    }

    const source =
      typeof edge.source === 'string' && edge.source.trim().length > 0
        ? edge.source
        : undefined;
    const target =
      typeof edge.target === 'string' && edge.target.trim().length > 0
        ? edge.target
        : undefined;

    const sourceIndex =
      typeof edge.sourceIndex === 'number' ? edge.sourceIndex : undefined;
    const targetIndex =
      typeof edge.targetIndex === 'number' ? edge.targetIndex : undefined;

    if (source === undefined && sourceIndex === undefined) {
      return null;
    }

    if (target === undefined && targetIndex === undefined) {
      return null;
    }

    return {
      source,
      target,
      sourceIndex,
      targetIndex,
      sourceHandle:
        typeof edge.sourceHandle === 'string' ? edge.sourceHandle : undefined,
      targetHandle:
        typeof edge.targetHandle === 'string' ? edge.targetHandle : undefined
    };
  }

  // Get available templates
  getAvailableTemplates(): TreeTemplate[] {
    return TreeBuilder.TEMPLATES;
  }

  // Preview tree before committing
  previewTree(
    template: TreeTemplate,
    position: { x: number; y: number }
  ): BuildTreeResult {
    const nodes = this.positionNodes(template.nodes, position);
    const edges = this.createEdges(template.edges, nodes);

    return {
      nodes,
      edges,
      template,
      confidence: 1.0
    };
  }
}

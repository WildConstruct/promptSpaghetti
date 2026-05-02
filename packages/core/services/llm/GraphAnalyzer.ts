// Graph Analyzer for Story 2.2b
// Provides conflict detection, complexity analysis, and optimization suggestions

import { Node, Edge } from 'reactflow';
import { LLMService } from './LLMService';

export interface Conflict {
  type: 'semantic' | 'variable' | 'circular' | 'style';
  nodeIds: string[];
  description: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
  confidence: number;
}

export interface MergeSuggestion {
  nodeIds: string[];
  similarity: number;
  strategy: 'combine' | 'variable' | 'fragment';
  rationale: string;
}

export interface SplitSuggestion {
  text: string;
  strategies: Array<{
    segments: string[];
    rationale: string;
    confidence: number;
  }>;
}

export interface ComplexityReport {
  nodeCount: number;
  nodeTypeBreakdown: Map<string, number>;
  averageBranchingFactor: number;
  maxDepth: number;
  estimatedVariations: number;
  optimizationSuggestions: string[];
  score: number; // 0-100, lower is better
}

export interface PreviewVariation {
  seed: number;
  output: string;
  pathTaken: string[];
}

export class GraphAnalyzer {
  private llmService: LLMService | null;

  constructor(llmService?: LLMService) {
    this.llmService = llmService || null;
  }

  // Detect conflicts in the graph
  async detectConflicts(nodes: Node[], edges: Edge[]): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    // Check for circular dependencies
    const cycles = this.detectCycles(nodes, edges);
    conflicts.push(...cycles);

    // Check for variable conflicts
    const varConflicts = this.detectVariableConflicts(nodes);
    conflicts.push(...varConflicts);

    // Check for semantic conflicts (requires LLM)
    if (this.llmService) {
      const semanticConflicts = await this.detectSemanticConflicts(
        nodes,
        edges
      );
      conflicts.push(...semanticConflicts);
    }

    // Check for style inconsistencies
    const styleConflicts = this.detectStyleConflicts(nodes);
    conflicts.push(...styleConflicts);

    return conflicts;
  }

  // Detect circular dependencies
  private detectCycles(nodes: Node[], edges: Edge[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const adjacency = this.buildAdjacencyList(edges);
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string, path: string[] = []): string[] | null => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const neighbors = adjacency.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const cyclePath = hasCycle(neighbor, [...path]);
          if (cyclePath) {
            return cyclePath;
          }
        } else if (recursionStack.has(neighbor)) {
          // Found a cycle
          const cycleStart = path.indexOf(neighbor);
          return path.slice(cycleStart);
        }
      }

      recursionStack.delete(nodeId);
      return null;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        const cyclePath = hasCycle(node.id);
        if (cyclePath) {
          conflicts.push({
            type: 'circular',
            nodeIds: cyclePath,
            description: `Circular dependency detected: ${cyclePath.join(' → ')} → ${cyclePath[0]}`,
            severity: 'error',
            suggestion: 'Remove one of the connections to break the cycle',
            confidence: 1.0
          });
        }
      }
    }

    return conflicts;
  }

  // Detect variable conflicts
  private detectVariableConflicts(nodes: Node[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const variableMap = new Map<string, string[]>();

    // Collect all variable definitions
    for (const node of nodes) {
      if (node.type === 'variable' && node.data?.variableName) {
        const varName = node.data.variableName;
        const nodesForVariable = variableMap.get(varName);
        if (nodesForVariable) {
          nodesForVariable.push(node.id);
        } else {
          variableMap.set(varName, [node.id]);
        }
      }
    }

    // Check for duplicate variable names
    for (const [varName, nodeIds] of variableMap.entries()) {
      if (nodeIds.length > 1) {
        conflicts.push({
          type: 'variable',
          nodeIds,
          description: `Multiple nodes define variable "${varName}"`,
          severity: 'warning',
          suggestion: `Consider using unique variable names or merging the definitions`,
          confidence: 1.0
        });
      }
    }

    return conflicts;
  }

  // Detect semantic conflicts (requires LLM)
  private async detectSemanticConflicts(
    nodes: Node[],
    edges: Edge[]
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    if (!this.llmService) {
      return conflicts;
    }

    // Get connected node pairs
    const connectedPairs = this.getConnectedPairs(nodes, edges);

    for (const [node1, node2] of connectedPairs) {
      const text1 = this.getNodeText(node1);
      const text2 = this.getNodeText(node2);

      if (!text1 || !text2) {
        continue;
      }

      try {
        const prompt = `Analyze these two connected text segments for conflicts:
        
        Text 1: "${text1}"
        Text 2: "${text2}"
        
        Return JSON: {
          "hasConflict": boolean,
          "type": "contradiction" | "incompatible" | "inconsistent" | "none",
          "description": "...",
          "suggestion": "...",
          "confidence": 0.0-1.0
        }`;

        const response = await this.llmService.complete({
          prompt,
          responseFormat: 'json',
          taskType: 'general'
        });

        if (response?.content) {
          const analysis = JSON.parse(response.content);
          if (analysis.hasConflict) {
            conflicts.push({
              type: 'semantic',
              nodeIds: [node1.id, node2.id],
              description: analysis.description,
              severity: 'warning',
              suggestion: analysis.suggestion,
              confidence: analysis.confidence
            });
          }
        }
      } catch (error) {
        console.error('Failed to analyze semantic conflict:', error);
      }
    }

    return conflicts;
  }

  // Detect style inconsistencies
  private detectStyleConflicts(nodes: Node[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const styles = new Map<string, string[]>();

    for (const node of nodes) {
      const text = this.getNodeText(node);
      if (!text) {
        continue;
      }

      // Detect style (simplified)
      let style = 'neutral';
      if (text.includes('!') || text.length > 100) {
        style = 'dramatic';
      } else if (text.includes('please') || text.includes('would')) {
        style = 'formal';
      } else if (text.includes("n't") || text.includes("'re")) {
        style = 'casual';
      }

      const nodesForStyle = styles.get(style);
      if (nodesForStyle) {
        nodesForStyle.push(node.id);
      } else {
        styles.set(style, [node.id]);
      }
    }

    // If multiple styles are used, flag as potential inconsistency
    if (styles.size > 2) {
      const allNodes = Array.from(styles.values()).flat();
      conflicts.push({
        type: 'style',
        nodeIds: allNodes,
        description: 'Multiple writing styles detected across nodes',
        severity: 'info',
        suggestion: 'Consider maintaining consistent tone throughout',
        confidence: 0.7
      });
    }

    return conflicts;
  }

  // Analyze graph complexity
  analyzeComplexity(nodes: Node[], edges: Edge[]): ComplexityReport {
    const nodeTypeBreakdown = new Map<string, number>();

    // Count nodes by type
    for (const node of nodes) {
      const type = node.type || 'unknown';
      nodeTypeBreakdown.set(type, (nodeTypeBreakdown.get(type) || 0) + 1);
    }

    // Calculate branching factor
    const outDegrees = new Map<string, number>();
    for (const edge of edges) {
      outDegrees.set(edge.source, (outDegrees.get(edge.source) || 0) + 1);
    }

    const avgBranching =
      outDegrees.size > 0
        ? Array.from(outDegrees.values()).reduce((a, b) => a + b, 0) /
          outDegrees.size
        : 0;

    // Calculate max depth
    const maxDepth = this.calculateMaxDepth(nodes, edges);

    // Estimate variations
    const weightedChoiceNodes = nodes.filter(n => n.type === 'weightedChoice');
    const estimatedVariations = weightedChoiceNodes.reduce((total, node) => {
      const choices = node.data?.choices?.length || 2;
      return total * choices;
    }, 1);

    // Generate optimization suggestions
    const suggestions: string[] = [];

    if (avgBranching > 5) {
      suggestions.push(
        'High branching factor detected. Consider consolidating some paths.'
      );
    }

    if (maxDepth > 10) {
      suggestions.push(
        'Deep graph structure. Consider flattening or using fragments.'
      );
    }

    if (estimatedVariations > 1000) {
      suggestions.push('Very high variation count. May impact performance.');
    }

    const duplicateNodes = this.findDuplicateNodes(nodes);
    if (duplicateNodes.length > 0) {
      suggestions.push(
        `Found ${duplicateNodes.length} potentially duplicate nodes.`
      );
    }

    // Calculate complexity score (0-100)
    const score = Math.min(
      100,
      nodes.length * 0.5 +
        avgBranching * 5 +
        maxDepth * 2 +
        Math.log10(estimatedVariations) * 10
    );

    return {
      nodeCount: nodes.length,
      nodeTypeBreakdown,
      averageBranchingFactor: avgBranching,
      maxDepth,
      estimatedVariations,
      optimizationSuggestions: suggestions,
      score
    };
  }

  // Find merge suggestions
  async findMergeSuggestions(nodes: Node[]): Promise<MergeSuggestion[]> {
    const suggestions: MergeSuggestion[] = [];

    // Find nodes with similar text
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const text1 = this.getNodeText(nodes[i]);
        const text2 = this.getNodeText(nodes[j]);

        if (!text1 || !text2) {
          continue;
        }

        const similarity = this.calculateSimilarity(text1, text2);

        if (similarity > 0.7) {
          suggestions.push({
            nodeIds: [nodes[i].id, nodes[j].id],
            similarity,
            strategy: similarity > 0.9 ? 'combine' : 'variable',
            rationale: `Nodes have ${Math.round(similarity * 100)}% similar content`
          });
        }
      }
    }

    return suggestions;
  }

  // Generate split suggestions
  async generateSplitSuggestions(text: string): Promise<SplitSuggestion> {
    const suggestions: SplitSuggestion = {
      text,
      strategies: []
    };

    // Strategy 1: Split by conjunctions
    if (text.includes(' and ') || text.includes(' with ')) {
      const segments = text.split(/\s+(and|with)\s+/);
      suggestions.strategies.push({
        segments: segments.filter(s => s !== 'and' && s !== 'with'),
        rationale: 'Split at natural conjunctions',
        confidence: 0.8
      });
    }

    // Strategy 2: Split by punctuation
    if (text.includes(',') || text.includes(';')) {
      const segments = text.split(/[,;]\s*/);
      suggestions.strategies.push({
        segments,
        rationale: 'Split at punctuation boundaries',
        confidence: 0.7
      });
    }

    // Strategy 3: Split by sentence
    const sentences = text.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 1) {
      suggestions.strategies.push({
        segments: sentences.map(s => s.trim()),
        rationale: 'Split into separate sentences',
        confidence: 0.9
      });
    }

    // If LLM is available, get intelligent suggestions
    if (this.llmService) {
      try {
        const prompt = `Suggest ways to split this text into logical segments:
        "${text}"
        
        Return JSON: {
          "strategies": [
            {"segments": ["..."], "rationale": "...", "confidence": 0.0-1.0}
          ]
        }`;

        const response = await this.llmService.complete({
          prompt,
          responseFormat: 'json',
          taskType: 'general'
        });

        if (response?.content) {
          const parsed = JSON.parse(response.content);
          if (parsed.strategies) {
            suggestions.strategies.push(...parsed.strategies);
          }
        }
      } catch (error) {
        console.error('Failed to get split suggestions:', error);
      }
    }

    return suggestions;
  }

  // Generate preview variations
  async generatePreviews(
    nodes: Node[],
    edges: Edge[],
    count: number = 3
  ): Promise<PreviewVariation[]> {
    const previews: PreviewVariation[] = [];

    // Synthetic previews until this service is wired to the graph executor.
    for (let i = 0; i < count; i++) {
      const seed = Math.floor(Math.random() * 10000);
      previews.push({
        seed,
        output: `Preview output with seed ${seed}`,
        pathTaken: ['node1', 'node2', 'output']
      });
    }

    return previews;
  }

  // Helper methods

  private buildAdjacencyList(edges: Edge[]): Map<string, string[]> {
    const adjacency = new Map<string, string[]>();

    for (const edge of edges) {
      const targets = adjacency.get(edge.source);
      if (targets) {
        targets.push(edge.target);
      } else {
        adjacency.set(edge.source, [edge.target]);
      }
    }

    return adjacency;
  }

  private getConnectedPairs(nodes: Node[], edges: Edge[]): Array<[Node, Node]> {
    const pairs: Array<[Node, Node]> = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    for (const edge of edges) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);

      if (source && target) {
        pairs.push([source, target]);
      }
    }

    return pairs;
  }

  private getNodeText(node: Node): string | null {
    if (node.data?.value) {
      return node.data.value;
    }
    if (node.data?.text) {
      return node.data.text;
    }
    if (node.data?.content) {
      return node.data.content;
    }
    return null;
  }

  private calculateMaxDepth(nodes: Node[], edges: Edge[]): number {
    const adjacency = this.buildAdjacencyList(edges);
    const visited = new Set<string>();

    const dfs = (nodeId: string, depth: number): number => {
      visited.add(nodeId);
      const neighbors = adjacency.get(nodeId) || [];

      if (neighbors.length === 0) {
        return depth;
      }

      let maxChildDepth = depth;
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          maxChildDepth = Math.max(maxChildDepth, dfs(neighbor, depth + 1));
        }
      }

      return maxChildDepth;
    };

    let maxDepth = 0;
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        maxDepth = Math.max(maxDepth, dfs(node.id, 0));
      }
    }

    return maxDepth;
  }

  private findDuplicateNodes(nodes: Node[]): string[][] {
    const textMap = new Map<string, string[]>();

    for (const node of nodes) {
      const text = this.getNodeText(node);
      if (!text) {
        continue;
      }

      const normalized = text.toLowerCase().trim();
      const existing = textMap.get(normalized);
      if (existing) {
        existing.push(node.id);
      } else {
        textMap.set(normalized, [node.id]);
      }
    }

    return Array.from(textMap.values()).filter(ids => ids.length > 1);
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
}

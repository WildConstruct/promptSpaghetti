// Parser Fallback Handler - Story 2.6
// Handles graceful degradation when LLM parsing fails

import { promptParser as standardParser } from '../runtime/nodes/epic1/PromptParser';
import { ParserOptions, ParseResult } from './PromptParser';
import { Node, Edge } from 'reactflow';

export class ParserFallback {
  /**
   * Handle LLM parsing failure with fallback to standard parser
   */
  async handleLLMFailure(
    prompt: string,
    error: Error,
    options: ParserOptions
  ): Promise<ParseResult> {
    // Log error for monitoring
    console.error('LLM parsing failed:', error);

    // Notify user of fallback (non-blocking)
    this.notifyUser('Using standard parser due to LLM unavailability');

    // Use standard parser with enhanced heuristics
    const result = await this.parseWithEnhancedStandard(prompt, options);

    // Add metadata indicating fallback was used
    result.metadata = {
      ...result.metadata,
      parserMode: 'standard-fallback',
      fallbackReason: error.message,
      originalMode: 'llm-enhanced'
    };

    return result;
  }

  /**
   * Parse with enhanced standard parser
   */
  private async parseWithEnhancedStandard(
    prompt: string,
    options: ParserOptions
  ): Promise<ParseResult> {
    try {
      // Use the existing standard parser
      const analysis = standardParser.parse(prompt);

      // Apply enhanced heuristics
      const enhancedNodes = this.enhanceNodes(analysis.nodes);
      const enhancedEdges = this.enhanceEdges(enhancedNodes);

      // Convert to React Flow format
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      // Convert nodes
      enhancedNodes.forEach((genNode, index) => {
        const serialized = genNode.node.serialize();
        const nodeType = this.mapNodeType(serialized.type);

        nodes.push({
          id: serialized.id,
          type: nodeType,
          position: genNode.position || { x: index * 200, y: 100 },
          data: {
            ...serialized.data,
            label: this.extractLabel(serialized),
            // Add enhanced metadata
            confidence: genNode.confidence || 0.7,
            source: 'enhanced-standard'
          }
        });
      });

      // Convert edges
      enhancedEdges.forEach((edge, index) => {
        edges.push({
          id: `edge-${index}`,
          source: edge.source,
          target: edge.target,
          type: edge.type || 'default',
          data: edge.data || {}
        });
      });

      return {
        nodes,
        edges,
        metadata: {
          parserMode: 'enhanced-standard',
          segmentCount: analysis.segments.length,
          enhancementsApplied: true
        }
      };
    } catch (standardError) {
      console.error('Standard parser also failed:', standardError);

      // Last resort: create a single text block
      return this.createMinimalResult(prompt);
    }
  }

  /**
   * Enhance nodes with additional heuristics
   */
  private enhanceNodes(nodes: any[]): any[] {
    return nodes.map(node => {
      const enhanced = { ...node };
      const content = node.node.serialize().data?.text || '';

      // Detect patterns and adjust node types
      if (this.isVariablePattern(content)) {
        enhanced.suggestedType = 'Variable';
        enhanced.confidence = 0.9;
      } else if (this.isChoicePattern(content)) {
        enhanced.suggestedType = 'WeightedChoice';
        enhanced.confidence = 0.85;
      } else if (this.isSequentialPattern(content)) {
        enhanced.suggestedType = 'Sequential';
        enhanced.confidence = 0.8;
      }

      return enhanced;
    });
  }

  /**
   * Enhance edges with better connections
   */
  private enhanceEdges(nodes: any[]): any[] {
    const edges: any[] = [];

    // Create sequential connections by default
    for (let i = 0; i < nodes.length - 1; i++) {
      const source = nodes[i].node.serialize().id;
      const target = nodes[i + 1].node.serialize().id;

      edges.push({
        source,
        target,
        type: 'default',
        data: {
          enhanced: true
        }
      });
    }

    // Look for special connection patterns
    nodes.forEach((node, i) => {
      const content = node.node.serialize().data?.text || '';

      // If this node references a variable, connect to variable nodes
      const variables = this.extractVariableReferences(content);
      variables.forEach(varName => {
        const varNode = nodes.find(n => {
          const data = n.node.serialize().data;
          return data?.name === varName || data?.text?.includes(`{${varName}}`);
        });

        if (varNode && varNode !== node) {
          edges.push({
            source: varNode.node.serialize().id,
            target: node.node.serialize().id,
            type: 'variable',
            data: {
              variable: varName
            }
          });
        }
      });
    });

    return edges;
  }

  /**
   * Check if content matches variable pattern
   */
  private isVariablePattern(content: string): boolean {
    // Check for {variable} syntax
    if (/\{[^}]+\}/.test(content)) {
      return true;
    }

    // Check for common variable indicators
    const variableIndicators = [
      /^(name|title|role|character|player):/i,
      /\b(called|named|known as)\b/i,
      /^\$\w+/,
      /^@\w+/
    ];

    return variableIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Check if content matches choice pattern
   */
  private isChoicePattern(content: string): boolean {
    // Check for list separators
    const separators = /\b(or|and|,)\b/gi;
    const matches = content.match(separators);

    if (matches && matches.length >= 2) {
      return true;
    }

    // Check for bullet points or numbered lists
    if (/^[\d•\-*]\s+/m.test(content)) {
      return true;
    }

    // Check for choice keywords
    const choiceKeywords = /\b(choose|select|pick|either|option)\b/i;
    return choiceKeywords.test(content);
  }

  /**
   * Check if content matches sequential pattern
   */
  private isSequentialPattern(content: string): boolean {
    // Check for temporal markers
    const temporalMarkers =
      /\b(first|then|next|after|finally|lastly|subsequently)\b/i;

    if (temporalMarkers.test(content)) {
      return true;
    }

    // Check for step indicators
    const stepPattern = /\b(step\s+\d+|phase\s+\d+|\d+\.\s+)/i;
    return stepPattern.test(content);
  }

  /**
   * Extract variable references from content
   */
  private extractVariableReferences(content: string): string[] {
    const variables: string[] = [];
    const pattern = /\{([^}]+)\}/g;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      variables.push(match[1]);
    }

    return variables;
  }

  /**
   * Map node type from Epic1 to React Flow
   */
  private mapNodeType(epicType: string): string {
    const typeMap: Record<string, string> = {
      TextBlock: 'textBlock',
      WeightedChoice: 'weightedChoice',
      Variable: 'variable',
      Sequential: 'sequential',
      Output: 'output',
      Concat: 'concat'
    };

    return typeMap[epicType] || 'textBlock';
  }

  /**
   * Extract label from serialized node
   */
  private extractLabel(serialized: any): string {
    return (
      serialized.data?.text ||
      serialized.data?.content ||
      serialized.data?.name ||
      serialized.data?.label ||
      'Node'
    );
  }

  /**
   * Create minimal result when all parsers fail
   */
  private createMinimalResult(prompt: string): ParseResult {
    const nodeId = 'fallback-node-1';

    return {
      nodes: [
        {
          id: nodeId,
          type: 'textBlock',
          position: { x: 100, y: 100 },
          data: {
            label: prompt,
            content: prompt,
            source: 'minimal-fallback'
          }
        }
      ],
      edges: [],
      metadata: {
        parserMode: 'minimal-fallback',
        error: 'All parsing methods failed',
        fallbackReason: 'Emergency fallback to single node'
      }
    };
  }

  /**
   * Notify user about fallback (non-blocking)
   */
  private notifyUser(message: string): void {
    // In a real implementation, this would show a toast or notification
    // For now, we'll just log it
    console.info(`[Parser Notice] ${message}`);

    // If we have access to a notification system, use it
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification({
        type: 'info',
        message,
        duration: 3000
      });
    }
  }
}

/**
 * Prompt Parser for Epic 1 - Semantic Unit Analysis
 * 
 * Analyzes natural language prompts and intelligently generates
 * inline-editable nodes based on semantic understanding.
 */

import { TextBlockNode } from './TextBlockNode';
import { WeightedChoiceNode, WeightedOption } from './WeightedChoiceNode';
import { ConcatNode } from './ConcatNode';
import { VariableNode } from './VariableNode';
import { OutputNode } from './OutputNode';
import { BaseInlineEditableNode } from './BaseInlineEditableNode';
import { Epic1NodeType } from './nodeTypes';
import { smartNodePositioner, NodePosition } from './SmartNodePositioning';

/**
 * Represents a parsed segment of the prompt
 */
export interface PromptSegment {
  text: string;
  startIndex: number;
  endIndex: number;
  suggestedNodeType: Epic1NodeType;
  confidence: number;
  metadata?: {
    reason?: string;
    alternatives?: string[];
    isListItem?: boolean;
    parentList?: string;
  };
}

/**
 * Result of parsing a prompt
 */
export interface PromptAnalysis {
  originalText: string;
  segments: PromptSegment[];
  nodes: GeneratedNode[];
  mappings: NodeMapping[];
}

/**
 * Generated node with metadata about its source
 */
export interface GeneratedNode {
  node: BaseInlineEditableNode;
  sourceSegments: number[]; // indices into segments array
  position?: { x: number; y: number };
}

/**
 * Mapping between source text and generated nodes
 */
export interface NodeMapping {
  nodeId: string;
  startIndex: number;
  endIndex: number;
  highlightColor?: string;
}

/**
 * Token type for lexical analysis
 */
enum TokenType {
  WORD = 'WORD',
  PUNCTUATION = 'PUNCTUATION',
  WHITESPACE = 'WHITESPACE',
  SEPARATOR = 'SEPARATOR', // commas, 'or', 'and'
  NEWLINE = 'NEWLINE'
}

/**
 * Token for lexical analysis
 */
interface Token {
  type: TokenType;
  value: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Main prompt parser class
 */
export class PromptParser {
  private nodeCounter = 0;
  private readonly listSeparators = ['or', 'and', ','];
  private readonly descriptiveWords = ['with', 'in', 'wearing', 'holding', 'carrying'];
  
  /**
   * Parse a prompt into semantic segments and generate nodes
   */
  parse(prompt: string): PromptAnalysis {
    // Reset counter for consistent IDs
    this.nodeCounter = 0;
    
    // Tokenize the input
    const tokens = this.tokenize(prompt);
    
    // Identify semantic segments
    const segments = this.identifySegments(tokens, prompt);
    
    // Generate nodes from segments
    const { nodes, mappings } = this.generateNodes(segments);
    
    // Add an output node at the end
    const outputNode = new OutputNode(this.generateNodeId());
    outputNode.lock();
    nodes.push({
      node: outputNode,
      sourceSegments: [],
      position: { x: 0, y: 0 } // Will be calculated with smart positioning
    });
    
    // Apply smart positioning to all nodes
    const positions = smartNodePositioner.calculatePositions(nodes);
    const optimizedPositions = smartNodePositioner.optimizePositions(positions, nodes);
    
    // Update node positions
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].position = optimizedPositions[i];
    }
    
    return {
      originalText: prompt,
      segments,
      nodes,
      mappings
    };
  }
  
  /**
   * Tokenize the input prompt
   */
  private tokenize(prompt: string): Token[] {
    const tokens: Token[] = [];
    let currentIndex = 0;
    
    // Regular expression patterns
    const patterns = {
      word: /^[a-zA-Z0-9''-]+/,
      punctuation: /^[.!?;:()[\]{}'"]/,
      separator: /^[,]/,
      whitespace: /^[ \t]+/,
      newline: /^[\n\r]+/
    };
    
    while (currentIndex < prompt.length) {
      let matched = false;
      
      // Try each pattern
      for (const [type, pattern] of Object.entries(patterns)) {
        const match = prompt.slice(currentIndex).match(pattern);
        if (match) {
          const value = match[0];
          const token: Token = {
            type: this.getTokenType(type, value),
            value,
            startIndex: currentIndex,
            endIndex: currentIndex + value.length
          };
          
          tokens.push(token);
          currentIndex += value.length;
          matched = true;
          break;
        }
      }
      
      // If no pattern matched, skip character
      if (!matched) {
        currentIndex++;
      }
    }
    
    return tokens;
  }
  
  /**
   * Get token type from pattern name
   */
  private getTokenType(patternName: string, value: string): TokenType {
    if (patternName === 'word' && this.listSeparators.includes(value.toLowerCase())) {
      return TokenType.SEPARATOR;
    }
    
    switch (patternName) {
      case 'word': return TokenType.WORD;
      case 'punctuation': return TokenType.PUNCTUATION;
      case 'separator': return TokenType.SEPARATOR;
      case 'whitespace': return TokenType.WHITESPACE;
      case 'newline': return TokenType.NEWLINE;
      default: return TokenType.WORD;
    }
  }
  
  /**
   * Identify semantic segments from tokens
   */
  private identifySegments(tokens: Token[], originalText: string): PromptSegment[] {
    const segments: PromptSegment[] = [];
    let currentSegment: Token[] = [];
    let isInList = false;
    let listItems: string[] = [];
    let listStartIndex = -1;
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const prevToken = i > 0 ? tokens[i - 1] : null;
      const nextToken = i < tokens.length - 1 ? tokens[i + 1] : null;
      
      // Skip whitespace in analysis
      if (token.type === TokenType.WHITESPACE) {
        continue;
      }
      
      // Check for list detection
      if (token.type === TokenType.SEPARATOR) {
        // We found a list separator
        if (!isInList) {
          // Start of a list - convert current segment to list
          isInList = true;
          listStartIndex = currentSegment.length > 0 ? currentSegment[0].startIndex : token.startIndex;
          
          // Add current accumulated text as first list item
          if (currentSegment.length > 0) {
            const text = this.tokensToText(currentSegment, originalText);
            listItems.push(text.trim());
          }
          
          currentSegment = [];
        } else {
          // Continuing a list - add previous item
          if (currentSegment.length > 0) {
            const text = this.tokensToText(currentSegment, originalText);
            listItems.push(text.trim());
            currentSegment = [];
          }
        }
      } else if (token.type === TokenType.PUNCTUATION && 
                 (token.value === '.' || token.value === '!' || token.value === '?')) {
        // End of sentence - finalize current segment
        if (isInList && listItems.length > 0) {
          // Add last item to list
          if (currentSegment.length > 0) {
            const text = this.tokensToText(currentSegment, originalText);
            listItems.push(text.trim());
          }
          
          // Create weighted choice segment
          const endIndex = token.endIndex;
          segments.push({
            text: listItems.join(' | '),
            startIndex: listStartIndex,
            endIndex: endIndex,
            suggestedNodeType: Epic1NodeType.WeightedChoice,
            confidence: 0.9,
            metadata: {
              reason: 'List of alternatives detected',
              alternatives: listItems
            }
          });
          
          // Reset
          isInList = false;
          listItems = [];
          currentSegment = [];
        } else if (currentSegment.length > 0) {
          // Regular text segment
          const startIndex = currentSegment[0].startIndex;
          const endIndex = token.endIndex;
          const text = this.tokensToText([...currentSegment, token], originalText);
          
          segments.push({
            text: text.trim(),
            startIndex,
            endIndex,
            suggestedNodeType: Epic1NodeType.TextBlock,
            confidence: 0.8,
            metadata: {
              reason: 'Complete sentence or phrase'
            }
          });
          
          currentSegment = [];
        }
      } else if (token.type === TokenType.NEWLINE) {
        // Newline - might indicate segment boundary
        if (currentSegment.length > 0) {
          const startIndex = currentSegment[0].startIndex;
          const endIndex = currentSegment[currentSegment.length - 1].endIndex;
          const text = this.tokensToText(currentSegment, originalText);
          
          segments.push({
            text: text.trim(),
            startIndex,
            endIndex,
            suggestedNodeType: Epic1NodeType.TextBlock,
            confidence: 0.7,
            metadata: {
              reason: 'Line break separation'
            }
          });
          
          currentSegment = [];
        }
      } else {
        // Regular token - add to current segment
        currentSegment.push(token);
      }
    }
    
    // Handle remaining tokens
    if (isInList && listItems.length > 0) {
      // Finalize list
      if (currentSegment.length > 0) {
        const text = this.tokensToText(currentSegment, originalText);
        listItems.push(text.trim());
      }
      
      const endIndex = currentSegment.length > 0 
        ? currentSegment[currentSegment.length - 1].endIndex 
        : tokens[tokens.length - 1].endIndex;
        
      segments.push({
        text: listItems.join(' | '),
        startIndex: listStartIndex,
        endIndex: endIndex,
        suggestedNodeType: Epic1NodeType.WeightedChoice,
        confidence: 0.85,
        metadata: {
          reason: 'List of alternatives at end of prompt',
          alternatives: listItems
        }
      });
    } else if (currentSegment.length > 0) {
      // Regular text at end
      const startIndex = currentSegment[0].startIndex;
      const endIndex = currentSegment[currentSegment.length - 1].endIndex;
      const text = this.tokensToText(currentSegment, originalText);
      
      segments.push({
        text: text.trim(),
        startIndex,
        endIndex,
        suggestedNodeType: Epic1NodeType.TextBlock,
        confidence: 0.75,
        metadata: {
          reason: 'Remaining text at end of prompt'
        }
      });
    }
    
    return this.refineSegments(segments);
  }
  
  /**
   * Convert tokens back to text
   */
  private tokensToText(tokens: Token[], originalText: string): string {
    if (tokens.length === 0) return '';
    
    const startIndex = tokens[0].startIndex;
    const endIndex = tokens[tokens.length - 1].endIndex;
    return originalText.slice(startIndex, endIndex);
  }
  
  /**
   * Refine segments by detecting patterns and improving suggestions
   */
  private refineSegments(segments: PromptSegment[]): PromptSegment[] {
    const refined: PromptSegment[] = [];
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const prevSegment = i > 0 ? segments[i - 1] : null;
      const nextSegment = i < segments.length - 1 ? segments[i + 1] : null;
      
      // Check for concatenation patterns
      if (segment.text.toLowerCase().includes(' with ') ||
          segment.text.toLowerCase().includes(' and ') ||
          segment.text.toLowerCase().includes(' wearing ') ||
          segment.text.toLowerCase().includes(' carrying ')) {
        
        // This might be better as separate nodes with concatenation
        const parts = this.splitOnDescriptiveWords(segment.text);
        if (parts.length > 1) {
          // Create multiple segments
          let currentIndex = segment.startIndex;
          
          for (const part of parts) {
            refined.push({
              text: part.trim(),
              startIndex: currentIndex,
              endIndex: currentIndex + part.length,
              suggestedNodeType: Epic1NodeType.TextBlock,
              confidence: 0.85,
              metadata: {
                reason: 'Part of descriptive phrase',
                parentList: segment.text
              }
            });
            currentIndex += part.length;
          }
          
          continue;
        }
      }
      
      // Check for variables pattern (e.g., {{variableName}})
      if (segment.text.includes('{{') && segment.text.includes('}}')) {
        segment.suggestedNodeType = Epic1NodeType.TextBlock;
        segment.confidence = 0.95;
        segment.metadata = {
          ...segment.metadata,
          reason: 'Contains variable references'
        };
      }
      
      refined.push(segment);
    }
    
    return refined;
  }
  
  /**
   * Split text on descriptive words
   */
  private splitOnDescriptiveWords(text: string): string[] {
    const pattern = new RegExp(`\\s+(${this.descriptiveWords.join('|')})\\s+`, 'gi');
    const parts = text.split(pattern);
    
    // Filter out the separator words themselves and empty strings
    return parts.filter(part => 
      part && !this.descriptiveWords.includes(part.toLowerCase().trim())
    );
  }
  
  /**
   * Generate nodes from segments
   */
  private generateNodes(segments: PromptSegment[]): {
    nodes: GeneratedNode[];
    mappings: NodeMapping[];
  } {
    const nodes: GeneratedNode[] = [];
    const mappings: NodeMapping[] = [];
    const colors = ['#FFE5B4', '#E6E6FA', '#98FB98', '#FFB6C1', '#87CEEB'];
    let colorIndex = 0;
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const nodeId = this.generateNodeId();
      let node: BaseInlineEditableNode;
      
      switch (segment.suggestedNodeType) {
        case Epic1NodeType.WeightedChoice:
          // Create weighted choice from alternatives
          const options: WeightedOption[] = (segment.metadata?.alternatives || [segment.text])
            .map((alt, idx) => ({
              id: `opt-${idx}`,
              text: alt.trim(),
              weight: 100 / (segment.metadata?.alternatives?.length || 1)
            }));
          
          node = new WeightedChoiceNode(nodeId, options);
          break;
          
        case Epic1NodeType.TextBlock:
        default:
          node = new TextBlockNode(nodeId, segment.text);
          break;
      }
      
      // Set node to editing mode
      node.startEdit();
      
      // Add to nodes array
      nodes.push({
        node,
        sourceSegments: [i],
        position: { x: 0, y: 0 } // Will be calculated with smart positioning
      });
      
      // Add mapping
      mappings.push({
        nodeId,
        startIndex: segment.startIndex,
        endIndex: segment.endIndex,
        highlightColor: colors[colorIndex % colors.length]
      });
      
      colorIndex++;
    }
    
    // Check if we should add concatenation nodes
    if (segments.length > 1) {
      // Look for opportunities to add Concat nodes
      const concatOpportunities = this.identifyConcatOpportunities(segments);
      
      for (const opportunity of concatOpportunities) {
        const concatNode = new ConcatNode(this.generateNodeId(), {
          separator: opportunity.separator
        });
        concatNode.startEdit();
        
        // Insert at appropriate position
        const insertIndex = opportunity.afterIndex + 1;
        nodes.splice(insertIndex, 0, {
          node: concatNode,
          sourceSegments: opportunity.sourceSegments,
          position: { x: 0, y: 0 } // Will be calculated with smart positioning
        });
      }
    }
    
    return { nodes, mappings };
  }
  
  /**
   * Identify where to add concatenation nodes
   */
  private identifyConcatOpportunities(segments: PromptSegment[]): Array<{
    afterIndex: number;
    separator: string;
    sourceSegments: number[];
  }> {
    const opportunities: Array<{
      afterIndex: number;
      separator: string;
      sourceSegments: number[];
    }> = [];
    
    // For now, we'll keep this simple
    // In the future, this could be more sophisticated
    
    return opportunities;
  }
  
  
  /**
   * Generate unique node ID
   */
  private generateNodeId(): string {
    return `parsed-node-${++this.nodeCounter}`;
  }
  
  /**
   * Adjust segment boundaries manually
   */
  adjustBoundary(
    analysis: PromptAnalysis,
    segmentIndex: number,
    newStartIndex: number,
    newEndIndex: number
  ): PromptAnalysis {
    if (segmentIndex < 0 || segmentIndex >= analysis.segments.length) {
      throw new Error('Invalid segment index');
    }
    
    // Clone the analysis
    const updatedAnalysis = {
      ...analysis,
      segments: [...analysis.segments],
      mappings: [...analysis.mappings]
    };
    
    // Update segment
    updatedAnalysis.segments[segmentIndex] = {
      ...analysis.segments[segmentIndex],
      startIndex: newStartIndex,
      endIndex: newEndIndex,
      text: analysis.originalText.slice(newStartIndex, newEndIndex)
    };
    
    // Update corresponding mapping
    const nodeId = analysis.nodes[segmentIndex]?.node.serialize().id;
    const mappingIndex = updatedAnalysis.mappings.findIndex(m => m.nodeId === nodeId);
    if (mappingIndex >= 0) {
      updatedAnalysis.mappings[mappingIndex] = {
        ...updatedAnalysis.mappings[mappingIndex],
        startIndex: newStartIndex,
        endIndex: newEndIndex
      };
    }
    
    return updatedAnalysis;
  }
  
  /**
   * Merge adjacent segments
   */
  mergeSegments(
    analysis: PromptAnalysis,
    firstIndex: number,
    secondIndex: number
  ): PromptAnalysis {
    if (firstIndex >= secondIndex || 
        firstIndex < 0 || 
        secondIndex >= analysis.segments.length) {
      throw new Error('Invalid segment indices for merge');
    }
    
    const first = analysis.segments[firstIndex];
    const second = analysis.segments[secondIndex];
    
    // Create merged segment
    const mergedSegment: PromptSegment = {
      text: analysis.originalText.slice(first.startIndex, second.endIndex),
      startIndex: first.startIndex,
      endIndex: second.endIndex,
      suggestedNodeType: Epic1NodeType.TextBlock,
      confidence: (first.confidence + second.confidence) / 2,
      metadata: {
        reason: 'Manually merged segments'
      }
    };
    
    // Regenerate nodes with merged segments
    const updatedSegments = [
      ...analysis.segments.slice(0, firstIndex),
      mergedSegment,
      ...analysis.segments.slice(secondIndex + 1)
    ];
    
    const { nodes, mappings } = this.generateNodes(updatedSegments);
    
    return {
      originalText: analysis.originalText,
      segments: updatedSegments,
      nodes,
      mappings
    };
  }
}

// Export a singleton instance
export const promptParser = new PromptParser();
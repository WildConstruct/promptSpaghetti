// A minimal, local parser shim used only by the LaunchScreen UX.
// It avoids deep imports from @promptscape/core runtime and provides the minimal
// types/shape that the LaunchScreen components expect.
// Now enhanced with unified parsing logic for consistency across the app.

export interface PromptSegment {
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface GeneratedNodeInternal {
  id: string;
  // explicit node kinds for UI swapping on splash screen
  nodeType: 'Text' | 'Choice' | 'Variable' | 'Output';
  // optional variable metadata used when nodeType === 'Variable'
  variableName?: string;
  getPreviewText?: () => string;
}

export interface GeneratedNode {
  node: GeneratedNodeInternal;
}

export interface NodeMapping {
  nodeId: string;
  startIndex: number;
  endIndex: number;
  highlightColor?: string;
}

export interface PromptAnalysis {
  segments: PromptSegment[];
  nodes: GeneratedNode[];
  mappings: NodeMapping[];
  edges?: any[]; // Optional edges from LLM response
  llmMetadata?: any; // Optional metadata from LLM response
  rawPrompt?: string; // Optional original prompt text
}

// Very simple color palette for highlights (alpha will be applied by consumer)
const HIGHLIGHT_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#FFB347',
  '#B19CD9'
];

function tokenize(
  input: string
): Array<{
  text: string;
  start: number;
  end: number;
  isBracketChoice?: boolean;
}> {
  const tokens: Array<{
    text: string;
    start: number;
    end: number;
    isBracketChoice?: boolean;
  }> = [];

  // First, extract bracketed choices {option1|option2|option3}
  const bracketRegex = /\{([^}]+)\}/g;
  let lastEnd = 0;
  let match;

  while ((match = bracketRegex.exec(input)) !== null) {
    // Add any text before the bracket as a regular token
    if (match.index > lastEnd) {
      const beforeText = input.substring(lastEnd, match.index).trim();
      if (beforeText) {
        // Split the before text on commas
        const parts = beforeText
          .split(',')
          .map(p => p.trim())
          .filter(Boolean);
        parts.forEach(part => {
          const startIndex = input.indexOf(part, lastEnd);
          tokens.push({
            text: part,
            start: startIndex,
            end: startIndex + part.length
          });
        });
      }
    }

    // Add the bracketed content as a special token
    tokens.push({
      text: match[1], // Content inside brackets without the brackets
      start: match.index,
      end: match.index + match[0].length,
      isBracketChoice: true
    });

    lastEnd = match.index + match[0].length;
  }

  // Add any remaining text after the last bracket
  if (lastEnd < input.length) {
    const remainingText = input.substring(lastEnd).trim();
    if (remainingText) {
      // Split on commas
      const parts = remainingText
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);
      parts.forEach(part => {
        const startIndex = input.indexOf(part, lastEnd);
        tokens.push({
          text: part,
          start: startIndex,
          end: startIndex + part.length
        });
      });
    }
  }

  // If no brackets were found, fall back to comma-based splitting
  if (tokens.length === 0) {
    const parts = input
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    let currentPos = 0;
    parts.forEach(part => {
      const startIndex = input.indexOf(part, currentPos);
      tokens.push({
        text: part,
        start: startIndex,
        end: startIndex + part.length
      });
      currentPos = startIndex + part.length;
    });
  }

  return tokens;
}

function splitAlternatives(text: string, isBracketChoice?: boolean): string[] {
  // If it's a bracket choice, split on pipe
  if (isBracketChoice) {
    return text
      .split('|')
      .map(t => t.trim())
      .filter(Boolean);
  }

  // Otherwise split on ' or ' and ' and ' (very naive)
  // keep order; filter empties
  return text
    .split(/\s+(?:or|and)\s+/gi)
    .map(t => t.trim())
    .filter(Boolean);
}

function hashString(input: string): string {
  // lightweight deterministic hash -> base36 string
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

export const simplePromptParser = {
  /**
   * Enhanced parser with better choice detection and grammar understanding
   */
  parse(input: string): PromptAnalysis {
    const segments: PromptSegment[] = [];
    const nodes: GeneratedNode[] = [];
    const mappings: NodeMapping[] = [];

    if (!input || input.trim().length === 0) {
      return { segments, nodes, mappings };
    }

    const coarse = tokenize(input);
    const segmentNodeGroups: GeneratedNode[][] = [];

    coarse.forEach((seg, idx) => {
      segments.push({
        text: seg.text,
        startIndex: seg.start,
        endIndex: seg.end
      });

      // Enhanced alternative detection with bracket support
      const alts = splitAlternatives(seg.text, seg.isBracketChoice);
      const segmentNodes: GeneratedNode[] = [];

      // Smart detection: if we find patterns like "X or Y" or "X/Y" or "X|Y", or it's a bracket choice
      const hasExplicitChoice =
        seg.isBracketChoice || /\s+(or|and)\s+|[/|]/i.test(seg.text);

      // If it's a bracket choice with multiple options, create a single WeightedChoice node
      if (seg.isBracketChoice && alts.length > 1) {
        const nodeId = `weighted-${hashString(seg.text.toLowerCase())}`;
        const color = HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length];
        const node: GeneratedNodeInternal = {
          id: nodeId,
          nodeType: 'Choice',
          getPreviewText: () => alts.join(' | ')
        };

        // Store the options in the node's data for proper WeightedChoice creation
        (node as any).data = {
          options: alts.map(alt => ({ text: alt, weight: 1 }))
        };

        segmentNodes.push({ node });
        mappings.push({
          nodeId,
          startIndex: seg.start,
          endIndex: seg.end,
          highlightColor: color
        });
      } else {
        // Original logic for non-bracket choices
        alts.forEach((alt, altIdx) => {
          const nodeId = `node-${hashString(
            `${seg.text.toLowerCase()}|${alt.toLowerCase()}|${altIdx}`
          )}`;
          const color =
            HIGHLIGHT_COLORS[(idx + altIdx) % HIGHLIGHT_COLORS.length];
          const node: GeneratedNodeInternal = {
            id: nodeId,
            // Enhanced logic: detect choice based on alternatives or explicit patterns
            nodeType: alts.length > 1 || hasExplicitChoice ? 'Choice' : 'Text',
            getPreviewText: () => alt
          };
          segmentNodes.push({ node });

          // Map this node to the first occurrence of the alt inside the segment text
          const relStart = seg.text.toLowerCase().indexOf(alt.toLowerCase());
          const startIndex = relStart >= 0 ? seg.start + relStart : seg.start;
          const endIndex = startIndex + alt.length;
          mappings.push({
            nodeId,
            startIndex,
            endIndex,
            highlightColor: color
          });
        });
      }

      segmentNodeGroups.push(segmentNodes);
    });

    // Add all segment nodes without concat nodes
    // The commas will be preserved in the text content itself
    segmentNodeGroups.forEach(group => {
      nodes.push(...group);
    });

    // Always add a final Output node to mirror the expected shape in preview
    const outputId = 'output';
    nodes.push({
      node: {
        id: outputId,
        nodeType: 'Output',
        getPreviewText: () => 'Output'
      }
    });

    return { segments, nodes, mappings };
  }
};

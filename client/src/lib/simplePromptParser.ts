// A minimal, local parser shim used only by the LaunchScreen UX.
// It avoids deep imports from @promptscape/core runtime and provides the minimal
// types/shape that the LaunchScreen components expect.

export interface PromptSegment {
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface GeneratedNodeInternal {
  id: string;
  // explicit node kinds for UI swapping on splash screen
  nodeType: 'Text' | 'Choice' | 'Variable' | 'Output' | 'Concat';
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
  '#B19CD9',
];

function tokenize(input: string): Array<{ text: string; start: number; end: number }> {
  const tokens: Array<{ text: string; start: number; end: number }> = [];
  let i = 0;
  while (i < input.length) {
    // Split on commas first to form coarse segments
    const nextComma = input.indexOf(',', i);
    const end = nextComma === -1 ? input.length : nextComma;
    const raw = input.slice(i, end);
    const trimmed = raw.trim();
    if (trimmed.length > 0) {
      const startIndex = i + (raw.length - raw.trimStart().length);
      const endIndex = startIndex + trimmed.length;
      tokens.push({ text: trimmed, start: startIndex, end: endIndex });
    }
    if (nextComma === -1) break;
    i = nextComma + 1;
  }
  return tokens;
}

function splitAlternatives(text: string): string[] {
  // split on ' or ' and ' and ' (very naive)
  // keep order; filter empties
  return text
    .split(/\s+(?:or|and)\s+/gi)
    .map((t) => t.trim())
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
      segments.push({ text: seg.text, startIndex: seg.start, endIndex: seg.end });

      const alts = splitAlternatives(seg.text);
      const segmentNodes: GeneratedNode[] = [];
      
      alts.forEach((alt, altIdx) => {
        const nodeId = `node-${hashString(
          `${seg.text.toLowerCase()}|${alt.toLowerCase()}|${altIdx}`
        )}`;
        const color = HIGHLIGHT_COLORS[(idx + altIdx) % HIGHLIGHT_COLORS.length];
        const node: GeneratedNodeInternal = {
          id: nodeId,
          // If there are multiple alternatives, it's a choice
          nodeType: alts.length > 1 ? 'Choice' : 'Text',
          getPreviewText: () => alt,
        };
        segmentNodes.push({ node });

        // Map this node to the first occurrence of the alt inside the segment text
        const relStart = seg.text.toLowerCase().indexOf(alt.toLowerCase());
        const startIndex = relStart >= 0 ? seg.start + relStart : seg.start;
        const endIndex = startIndex + alt.length;
        mappings.push({ nodeId, startIndex, endIndex, highlightColor: color });
      });
      
      segmentNodeGroups.push(segmentNodes);
    });

    // If there are multiple segments (separated by commas), create concat nodes
    if (segmentNodeGroups.length > 1) {
      // Add concat nodes between segments
      segmentNodeGroups.forEach((group, groupIdx) => {
        nodes.push(...group);
        
        // Add concat node after each segment except the last
        if (groupIdx < segmentNodeGroups.length - 1) {
          const concatId = `concat-${groupIdx}`;
          nodes.push({
            node: {
              id: concatId,
              nodeType: 'Concat',
              getPreviewText: () => ', ',
            },
          });
        }
      });
    } else if (segmentNodeGroups.length === 1) {
      // Single segment, just add the nodes
      nodes.push(...segmentNodeGroups[0]);
    }

    // Always add a final Output node to mirror the expected shape in preview
    const outputId = 'output';
    nodes.push({
      node: {
        id: outputId,
        nodeType: 'Output',
        getPreviewText: () => 'Output',
      },
    });

    return { segments, nodes, mappings };
  },
};

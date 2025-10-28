// Lightweight reconciliation utility to preserve node IDs/types/colors where possible
// when the full prompt text changes.

import {
  PromptAnalysis,
  NodeMapping,
  GeneratedNode,
  GeneratedNodeInternal
} from './simplePromptParser';

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function lcsLength(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = new Array(n + 1).fill(0);
  let best = 0;
  for (let i = 1; i <= m; i++) {
    let prev = 0;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      if (a[i - 1] === b[j - 1]) {
        dp[j] = prev + 1;
        if (dp[j] > best) {
          best = dp[j];
        }
      } else {
        dp[j] = Math.max(dp[j], dp[j - 1]);
      }
      prev = tmp;
    }
  }
  return best;
}

function similarityScore(a: string, b: string): number {
  if (!a.length || !b.length) {
    return 0;
  }
  const lcs = lcsLength(a, b);
  const denom = Math.max(a.length, b.length);
  return lcs / denom;
}

export interface ReconcileOptions {
  similarityThreshold?: number; // default 0.7
}

export function reconcileAnalysis(
  prev: PromptAnalysis,
  prevText: string,
  newText: string,
  options: ReconcileOptions = {}
): PromptAnalysis {
  const threshold = options.similarityThreshold ?? 0.7;

  // Build candidate slices from previous analysis for matching
  const prevSlices = prev.mappings.map(m => {
    const text = prevText.slice(m.startIndex, m.endIndex);
    return { nodeId: m.nodeId, text, color: m.highlightColor };
  });

  // Naive new segmentation: use positions of existing strings if present; otherwise we'll map via best match window
  // For robustness, we will scan the newText for each prev slice and record best match windows
  const unmatchedPrev = new Set(prevSlices.map(s => s.nodeId));
  const nodes: GeneratedNode[] = [];
  const mappings: NodeMapping[] = [];

  // Helper to add or update a node by id
  const prevNodeMap = new Map(
    prev.nodes.map(g => [g.node.id, g.node] as const)
  );

  // Attempt to match previous slices in order to new text
  for (const slice of prevSlices) {
    const normPrev = normalize(slice.text);
    let bestStart = -1;
    let bestEnd = -1;
    let bestScore = 0;

    // Search for best window by sliding around occurrences of first word
    // Simple approach: check all occurrences of the first 8 chars
    const probe = normPrev.slice(0, Math.min(8, normPrev.length));
    const normNew = normalize(newText);
    let idx = normNew.indexOf(probe);
    const checked = new Set<number>();
    while (idx !== -1 && !checked.has(idx)) {
      checked.add(idx);
      // Recover approximate absolute indices in raw newText by mapping normalized positions
      // NOTE: This is a simplification suitable for MVP; exact mapping would require more bookkeeping.
      // We'll approximate by scanning the raw newText around the same ratio location.
      const approxStart = Math.floor(
        (idx / Math.max(1, normNew.length)) * newText.length
      );
      const window = newText.slice(
        approxStart,
        approxStart + slice.text.length + 50
      );
      const score = similarityScore(normalize(window), normPrev);
      if (score > bestScore) {
        bestScore = score;
        bestStart = approxStart;
        bestEnd = approxStart + Math.min(window.length, slice.text.length);
      }
      idx = normNew.indexOf(probe, idx + 1);
    }

    if (bestScore >= threshold && bestStart >= 0) {
      // Preserve node id, type, and color
      const prevNode = prevNodeMap.get(slice.nodeId) as
        | GeneratedNodeInternal
        | undefined;
      if (prevNode) {
        nodes.push({
          node: {
            id: prevNode.id,
            nodeType: prevNode.nodeType,
            getPreviewText: () => newText.slice(bestStart, bestEnd)
          }
        });
      } else {
        nodes.push({
          node: {
            id: slice.nodeId,
            nodeType: 'Text',
            getPreviewText: () => newText.slice(bestStart, bestEnd)
          }
        });
      }
      mappings.push({
        nodeId: slice.nodeId,
        startIndex: bestStart,
        endIndex: bestEnd,
        highlightColor: slice.color
      });
      unmatchedPrev.delete(slice.nodeId);
    }
  }

  // Add new nodes for unmatched parts by a simple gap fill using sorted mappings
  // Sort current mappings by start and fill gaps > 0 with new Text nodes
  mappings.sort((a, b) => a.startIndex - b.startIndex);
  const usedRanges: Array<[number, number]> = mappings.map(m => [
    m.startIndex,
    m.endIndex
  ]);

  function fillGap(start: number, end: number) {
    if (end - start <= 0) {
      return;
    }
    const id = `node-${Math.random().toString(36).slice(2, 9)}`;
    nodes.push({
      node: {
        id,
        nodeType: 'Text',
        getPreviewText: () => newText.slice(start, end)
      }
    });
    mappings.push({ nodeId: id, startIndex: start, endIndex: end });
  }

  let cursor = 0;
  for (const [s, e] of usedRanges) {
    if (s > cursor) {
      fillGap(cursor, s);
    }
    cursor = Math.max(cursor, e);
  }
  if (cursor < newText.length) {
    fillGap(cursor, newText.length);
  }

  // Keep Output node last
  nodes.push({
    node: { id: 'output', nodeType: 'Output', getPreviewText: () => 'Output' }
  });

  // Order nodes by mapping start (Output last)
  const startMap = new Map<string, number>();
  for (const m of mappings) {
    startMap.set(m.nodeId, m.startIndex);
  }
  const nonOutput = nodes.filter(n => n.node.nodeType !== 'Output');
  nonOutput.sort(
    (a, b) =>
      (startMap.get(a.node.id) ?? Number.MAX_SAFE_INTEGER) -
      (startMap.get(b.node.id) ?? Number.MAX_SAFE_INTEGER)
  );
  const output = nodes.find(n => n.node.nodeType === 'Output');
  const ordered = output ? [...nonOutput, output] : nonOutput;

  return { segments: [], nodes: ordered, mappings };
}

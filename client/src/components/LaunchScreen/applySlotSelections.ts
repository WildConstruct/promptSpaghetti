import type { PromptAnalysis } from '../../lib/simplePromptParser';
import type { SlotReviewRow } from './FragmentSlotReview';

/**
 * Apply fragment-review choices onto a PromptAnalysis before graph conversion.
 * Original slots keep analysis nodes; fragment swaps mark Text nodes with
 * fragmentPath for later enrichment; skipped slots drop their nodes.
 */
export function applySlotSelectionsToAnalysis(
  analysis: PromptAnalysis,
  rows: SlotReviewRow[]
): PromptAnalysis {
  if (!rows.length) {
    return analysis;
  }

  const contentNodes = analysis.nodes.filter(
    n => n.node.nodeType !== 'Output'
  );
  const nextNodes = analysis.nodes
    .map(wrapper => {
      const idx = contentNodes.findIndex(n => n.node.id === wrapper.node.id);
      if (idx < 0 || idx >= rows.length) {
        return wrapper;
      }
      const row = rows[idx];
      if (row.selection.kind === 'none') {
        return null;
      }
      if (row.selection.kind === 'original') {
        return wrapper;
      }
      const candidate = row.selection.candidate;
      const text = candidate.name;
      return {
        node: {
          ...wrapper.node,
          nodeType: 'Text' as const,
          getPreviewText: () => text,
          data: {
            ...(wrapper.node.data || {}),
            label: text,
            text,
            content: text,
            value: text,
            fragmentPath: candidate.path,
            fragmentId: candidate.fragmentId,
            fragmentSwap: true,
            originalSlotText: row.slot.sourceText
          }
        }
      };
    })
    .filter((n): n is NonNullable<typeof n> => n !== null);

  const ids = new Set(nextNodes.map(n => n.node.id));
  const edges = (analysis.edges || []).filter(
    e => ids.has(e.source) && ids.has(e.target)
  );

  return {
    ...analysis,
    nodes: nextNodes,
    edges,
    llmMetadata: {
      ...(analysis.llmMetadata || {}),
      slotReviewApplied: true,
      slotSelections: rows.map(r => ({
        slotId: r.slot.id,
        kind: r.selection.kind,
        fragmentId:
          r.selection.kind === 'fragment'
            ? r.selection.candidate.fragmentId
            : undefined
      }))
    }
  };
}

// Simple feature → documentation URL mapping
// Extend as needed; fallback should be global docs home
export const docsMap: Record<string, string> = {
  // Nodes
  WeightedChoiceNode: '/docs/nodes/weighted-choice.md',
  TextBlockNode: '/docs/nodes/text-block.md',
  ConcatNode: '/docs/nodes/concat.md',
  EnhancedBranchingNode: '/docs/nodes/weighted-choice.md',
  // Editor features
  Epic1GraphEditor: '/docs/editor/epic1-editor.md',
  AssetBrowser: '/docs/asset-browser/overview.md'
};

export function getDocUrl(key: string): string {
  return docsMap[key] || '/docs/index.md';
}

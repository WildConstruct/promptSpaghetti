// Minimal stable public API for @promptscape/core

// Re-export core graph/types that are used by stable utils
export type {
  ExportableGraph,
  ExportableGraphEdge,
  ExportableGraphNode,
  GraphNode,
  GraphEdge,
  Graph,
  PSGFile
} from './types/graph';

// Export both types and classes for Advanced runtime
export {
  AdvancedRuntimeNode,
  type AdvancedExecutionContext,
  type AdvancedNodeConfig,
  type ValidationResult
} from './runtime';

// Legacy graph-wrapper PSG codec.
// Keep exported for compatibility while active surfaces migrate away from it.
export {
  readPsg,
  writePsg,
  fromLegacyGraph,
  looksLikeLegacyGraphWrapper
} from './utils/psgCodec';

// Canonical flat PSG fragment/source helpers for the MVP surface.
export {
  parsePSG,
  parsePsgWithCompatibility,
  convertPSGToPSGLib,
  exportGraphToPSG,
  type PSGFile as FlatPSGFile,
  type PSGNode,
  type PSGEdge,
  type PSGRegion
} from './fileFormats/psg';

// Shared prompt segmentation helpers (used by splash-screen preview + runtime parser)
export {
  segmentPrompt,
  type SegmentedPrompt,
  type PromptSegment as SegmentedPromptSegment,
  type SegmentKind
} from './runtime/prompting/PromptSegmentation';

// Natural-language prompt assembly helpers (Concat join rules + Template/slot fill).
export {
  assemble,
  fillTemplate,
  templateSlots,
  indefiniteArticle,
  normalizePrompt,
  capitalizeFirst,
  oxfordJoin,
  type JoinStyle,
  type AssembleOptions,
  type FillTemplateOptions
} from './runtime/assembly';

// Canonical PSG API protocol contracts for validation/normalization/expansion.
export * from './services/psg';

// Local-only image sandbox contracts for batch generation demos.
export * from './services/localImage';

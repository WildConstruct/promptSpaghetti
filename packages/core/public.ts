// Minimal stable public API for @promptscape/core

// Re-export core graph/types that are used by stable utils
export type { GraphNode, GraphEdge, Graph, PSGFile } from './types/graph';

// Runtime system exports - commented out to fix Netlify build
// export type {
//   ExecutionContext,
//   RuntimeNode
// } from './runtime';

// Export both types and classes for Advanced runtime
export {
  AdvancedRuntimeNode,
  type AdvancedExecutionContext,
  type AdvancedNodeConfig,
  type ValidationResult
} from './runtime';

// Public Utils surface - temporarily disabled due to import issues
// export * from './utils/index';

// Legacy graph-wrapper PSG codec.
// Keep exported for compatibility while active surfaces migrate away from it.
export { readPsg, writePsg, fromLegacyGraph } from './utils/psgCodec';

// Canonical flat PSG fragment/source helpers for the MVP surface.
export {
  parsePSG,
  convertPSGToPSGLib,
  exportGraphToPSG,
  type PSGFile as FlatPSGFile,
  type PSGNode,
  type PSGEdge,
  type PSGRegion
} from './fileFormats/psg';

// Epic 2 LLM components and services - commented out to fix Netlify build
// export { LLMToggle } from './components/LLMToggle/LLMToggle';
// export { LLMConfigDialog } from './components/LLMConfigDialog/LLMConfigDialog';
// export { SimpleLLMService, getLLMService } from './services/SimpleLLMService';
// export type { LLMConfig, ParseOptions, ParseResult } from './services/SimpleLLMService';

// Shared prompt segmentation helpers (used by splash-screen preview + runtime parser)
export {
  segmentPrompt,
  type SegmentedPrompt,
  type PromptSegment as SegmentedPromptSegment,
  type SegmentKind
} from './runtime/prompting/PromptSegmentation';

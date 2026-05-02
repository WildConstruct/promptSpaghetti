# Shared Type-Definition Consolidation Report

Batch 1 / Agent 2 focused on TypeScript type/interface duplication in `client/src`, `packages/core`, `packages/asset-browser`, and `server/src`. The worktree was already heavily dirty, so changes were kept to high-confidence shared contracts and no files were deleted or reverted.

## Implemented Consolidations

- Consolidated the server exporter's local `Graph`, `GraphNode`, and `GraphEdge` interfaces onto shared aliases in `packages/core/types/graph.ts`.
  - Added `ExportableGraph`, `ExportableGraphNode`, and `ExportableGraphEdge` as extension types over the existing core graph primitives.
  - Kept the server exporter's public names as aliases for compatibility with current imports.
  - Tightened `GeneratorBundleSchema` node/edge schemas from open `z.any()` arrays to explicit object contracts with `catchall(z.unknown())`.
- Exported the shared graph types from `packages/core/types/index.ts` and `packages/core/public.ts`.
- Replaced the asset-browser `EnhancedAssetBrowserProps.onNodeReplace` callback's `any` preset parameter with the existing `Preset` type.

## High-Confidence Duplicate Found

### Export graph shape

`server/src/exporter-standalone.ts` had local `Graph`, `GraphNode`, and `GraphEdge` definitions that parallel `packages/core/types/graph.ts`. The server contract needs export-only fields (`inputs`, handles, `seed`, `metadata`) that the core PSG graph primitive does not require, so the safest consolidation is additive extension types in core rather than changing the existing `Graph` contract to be optional.

## Candidates Not Consolidated

### Prompt analysis types

`client/src/lib/simplePromptParser.ts` and `packages/core/runtime/nodes/epic1/PromptParser.ts` both define `PromptSegment`, `GeneratedNode`, `NodeMapping`, and `PromptAnalysis`, but they are not interchangeable:

- The client version is a plain serializable splash/editor analysis DTO with `edges`, `rawPrompt`, and display node types like `Text`/`Choice`.
- The core runtime version carries `BaseInlineEditableNode` instances, `sourceSegments`, smart positioning, `originalText`, confidence, and `Epic1NodeType`.

Recommendation: introduce a deliberately named DTO contract such as `PromptAnalysisDto` only if a follow-up task also separates runtime node instances from transport/UI data. A direct merge would blur runtime and client boundaries.

### Preset types

There are two similarly named preset families:

- `packages/asset-browser/src/types.ts` defines an asset-browser catalog `Preset`.
- `packages/core/components/epic1/asset-library/types.ts` defines an Epic 1 asset-library preset with `nodeType`, `value`, and Date-based metadata.

Recommendation: do not merge these without a migration plan. The safer next step is adding explicit adapter types/functions at the boundary where Epic 1 converts browser presets into agent fragments or local node presets.

### Graph-like state types

Several `GraphState`, `GraphData`, `GraphSnapshot`, and `GraphAnnotations` interfaces exist in store, serialization, template, collaboration, and history modules. These appear domain-specific rather than duplicated:

- Store/UI state includes React Flow nodes, editor preferences, metadata, and settings.
- Template/collaboration types model persisted or social metadata.
- History snapshots are generic undo/redo payloads.

Recommendation: leave them local unless a specific persistence API is being unified.

## Remaining Recommendations

- Prefer importing graph export contracts from `packages/core/types/graph.ts` instead of re-declaring graph primitives in server or browser features.
- Avoid adding new `PromptAnalysis` interfaces by name. Use names that encode the layer, such as `RuntimePromptAnalysis` or `PromptAnalysisDto`.
- For new asset-browser callbacks, use `Preset` from `packages/asset-browser/src/types.ts`; for Epic 1 local preset editing, keep using the asset-library domain preset until an adapter is formalized.

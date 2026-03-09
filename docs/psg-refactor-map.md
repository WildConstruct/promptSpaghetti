# PSG refactor map

This is a **no-code-change** refactor plan derived from `docs/psg-tier-boundaries.md`.

Goal:

- split the current PSG boundary into explicit canonical, library, and compatibility layers
- name the exact function splits and rename targets
- identify caller impact before implementation starts

## Refactor principles

- **Canonical functions** answer: "What is a valid new PSG source file?"
- **Library functions** answer: "What repo asset fragments do we support and insert today?"
- **Compatibility functions** answer: "What old or external variants will we still repair and accept?"
- new code should call canonical or library functions directly
- compatibility helpers should be explicit and opt-in

## Current caller snapshot

### `parsePSG(...)` current callers

- `packages/core/runtime/presetInsertion.ts`
- `client/src/Epic1Editor/utils/psgDocument.ts`
- `packages/asset-browser/src/components/OpenGraphDialog.tsx`
- `packages/core/tests/psgExportRoundtrip.test.ts`
- `packages/core/fileFormats/__tests__/psg-fragment-handling.test.ts`

### `insertPreset(...)` current callers

- `packages/core/components/epic1/hooks/useDragDropHandlers.ts`
- `packages/core/runtime/presetInsertion.ts` via `insertPresetFromDrop(...)`
- `packages/core/runtime/presetInsertion.ts` via `loadPresetFromPath(...)`
- `packages/core/runtime/__tests__/presetInsertion.test.ts`

### `validatePreset(...)` current callers

- `packages/core/components/epic1/hooks/useDragDropHandlers.ts`
- `packages/core/runtime/__tests__/presetInsertion.test.ts`

### `normalizePsgLikeData(...)` current callers

- `packages/core/fileFormats/psg.ts`
- `packages/core/runtime/presetInsertion.ts`
- `packages/core/fileFormats/psgRepair.ts`
- `packages/core/fileFormats/psgRepair.runtime.js`

### `normalizeImportedEdges(...)` current callers

- `packages/core/fileFormats/psg.ts`
- `packages/core/runtime/presetInsertion.ts`

## File-by-file refactor map

## `packages/core/fileFormats/psg.ts`

| Current function | New target functions | Caller impact | Risk | Recommended order |
| --- | --- | --- | --- | --- |
| `parsePSG(content)` | `parseCanonicalPsg(content)` + `parsePsgWithCompatibility(content)` + keep `parsePSG` temporarily as alias to one of them during migration | All current `parsePSG` callers must choose whether they want canonical-only or compatibility-backed parsing | High | 1 |
| `normalizePSGNode(node, index)` | rename/split to `normalizeLegacyPsgNodeShape(node, index)` | Internal callers in `psg.ts` only at first; later compatibility parser owns it | Medium | 2 |
| `normalizePSGRegion(region, index)` | rename/split to `normalizeLegacyPsgRegionShape(region, index)` | Internal callers in `psg.ts` only at first; later compatibility parser owns it | Medium | 2 |
| `convertPSGToPSGLib(psg)` | rename target: `convertLibraryPsgToPsglib(psg)` | Callers in `presetInsertion.ts`, `psgDocument.ts`, tests, and any import flows should switch to the library-specific name | Medium | 4 |
| `exportGraphToPSG(nodes, edges, options)` | rename target: `exportGraphToLibraryPsg(nodes, edges, options)` | Save/export callers and roundtrip tests need rename only; behavior stays library-oriented | Medium | 6 |
| `sanitizeNodeDataForPSG(nodeType, data)` | rename target: `sanitizeNodeDataForLibraryPsg(nodeType, data)` | Internal export callers only | Low | 5 |
| `normalizeExportEdgeHandle(nodeType, handle, direction)` | rename target: `normalizeLibraryExportEdgeHandle(...)` | Internal export callers only | Low | 5 |

### Detailed split recommendation for `parsePSG(...)`

Current problem:

- the name implies canonical parsing
- the implementation currently performs compatibility normalization first via `normalizePsgLikeData(...)`

Target split:

- **`parseCanonicalPsg(content)`**
  - canonical-only
  - parses flat PSG with no legacy repair
  - validates against `PSGFileSchema`
- **`parsePsgWithCompatibility(content)`**
  - compatibility-only wrapper
  - parses JSON
  - applies legacy flat-PSG normalization
  - then delegates to `parseCanonicalPsg(...)`
- **temporary migration alias**
  - keep `parsePSG(...)` only as a transitional export
  - deprecate once callers are split

Recommended caller destination:

- `useDragDropHandlers` library assets: **library/canonical intake, not compatibility by default**
- `psgDocument.ts`: **compatibility-backed**
- `OpenGraphDialog.tsx`: **compatibility-backed**
- roundtrip/export tests: **canonical-only**
- fragment handling tests for repaired corpus/library shape: **library/canonical depending on test intent**

## `packages/core/runtime/importGraphNormalization.ts`

| Current function | New target functions | Caller impact | Risk | Recommended order |
| --- | --- | --- | --- | --- |
| `normalizePsgLikeData(data)` | split into `normalizeLegacyFlatPsgShape(data)` + `normalizeLibraryPsgShape(data)` if needed, with the legacy function owning current alias repair | `psg.ts`, `presetInsertion.ts`, and `psgRepair` callers must stop treating this as a generic always-on normalizer | High | 2 |
| `canonicalizeImportedNodeType(type)` | keep but rename target: `canonicalizeLegacyImportedNodeType(type)` | `presetInsertion.ts` and `importGraphNormalization.ts` callers need explicit compatibility framing | Medium | 3 |
| `normalizeImportedEdges(edges, nodes)` | split into `repairLegacyImportEdgeHandles(edges, nodes)` + `normalizeLibraryImportEdges(edges, nodes)` | `psg.ts` and `presetInsertion.ts` must stage compatibility repair before normal library handle normalization | High | 3 |
| `getImportedFragmentWrapperPolicy(params)` | split into `getLibraryFragmentWrapperPolicy(params)` + optional precomputed compatibility flags passed in from compatibility intake | `insertPresetFromDrop(...)` and any import flows using wrapper policy must stop reading legacy `groups` directly as a normal signal | Medium | 4 |
| `repairImportedFragmentWrapperNodes(params)` | rename target: `repairLibraryFragmentWrapperNodes(params)` | Internal/runtime import callers only | Low | 5 |
| `prepareImportedGraphBatch(params)` | rename target: `prepareLibraryImportedGraphBatch(params)` | Main consumer is editor/runtime insert flow; call sites become clearer but logic stays library-only | Medium | 5 |

### Detailed split recommendation for `normalizeImportedEdges(...)`

Current problem:

- one function both repairs legacy handles and applies normal library handle defaults

Target split:

- **`repairLegacyImportEdgeHandles(edges, nodes)`**
  - compatibility-only
  - owns old handle fallback like `input`, `output`, `main-output`
- **`normalizeLibraryImportEdges(edges, nodes)`**
  - library-only
  - owns standard runtime handle defaults for weighted choice, concat, output, and generic nodes

Caller destination:

- compatibility intake path runs `repairLegacyImportEdgeHandles(...)` first if needed
- normal repo asset/library insertion path runs only `normalizeLibraryImportEdges(...)`

### Detailed split recommendation for `normalizePsgLikeData(...)`

Current problem:

- it repairs legacy flat-PSG aliases and also acts like a harmless general normalizer

Target split:

- **`normalizeLegacyFlatPsgShape(data)`**
  - compatibility-only
  - owns:
    - `region -> regions`
    - `groups -> regions`
    - metadata-derived name fallback
    - `position.x/y -> x/y`
    - `label -> name`
    - `nodeIds -> nodes`
- **optional `normalizeLibraryPsgShape(data)`**
  - library-only
  - only for non-legacy cleanup that is still intentionally supported
  - may end up unnecessary if the library path can rely on parsing + conversion without repair

Caller destination:

- `psgRepair` keeps using the legacy normalizer explicitly
- canonical parser stops using either helper
- compatibility wrapper parser becomes the main caller

## `packages/core/runtime/presetInsertion.ts`

| Current function | New target functions | Caller impact | Risk | Recommended order |
| --- | --- | --- | --- | --- |
| `insertPreset(presetContent, options)` | split into `insertLibraryPreset(presetContent, options)` + `insertCompatibilityNormalizedPreset(presetContent, options)` + small top-level format router if still needed | `useDragDropHandlers`, `insertPresetFromDrop`, `loadPresetFromPath`, and tests must choose intended intake path | High | 4 |
| `validatePreset(presetContent, options)` | split into `validateLibraryPreset(presetContent, options)` + `validateCompatibilityPreset(presetContent, options)` | `useDragDropHandlers` and tests must decide whether the content is expected to already be library-safe or may need legacy tolerance | High | 3 |
| `convertNodeData(type, data)` | split into `convertLibraryNodeData(type, data)` + `convertLegacyNodeDataAliases(type, data)` | Internal insertion callers only, but correctness-sensitive | High | 4 |
| `positionNodes(...)` | rename target: `positionLibraryPresetNodes(...)` | Internal runtime callers only | Low | 6 |
| `insertPresetFromDrop(...)` | retarget to call `insertLibraryPreset(...)` by default and compatibility intake only when explicitly requested | Main drag/drop flow in `useDragDropHandlers.ts` becomes more intentional | Medium | 5 |
| `loadPresetFromPath(...)` | retarget to `loadAndInsertLibraryPresetFromPath(...)` | Path-loading callers need naming update only | Low | 6 |

### Detailed split recommendation for `validatePreset(...)`

Current problem:

- it is positioned like a library validator
- it optionally performs compatibility normalization inline through `preferCanonicalPsg`

Target split:

- **`validateLibraryPreset(presetContent, options)`**
  - library-only
  - accepts PSGLib or already-library-safe PSG
  - no legacy flat-PSG repair inline
- **`validateCompatibilityPreset(presetContent)`**
  - compatibility-only
  - accepts older flat PSG variants and routes through compatibility normalization before delegating to `validateLibraryPreset(...)`

Caller destination:

- `useDragDropHandlers.ts` for `/assets/library/...` content should call `validateLibraryPreset(...)`
- open/import flows for user-provided or unknown PSG should call `validateCompatibilityPreset(...)`
- tests should split by intent instead of toggling options on one mixed validator

### Detailed split recommendation for `insertPreset(...)`

Current problem:

- it is the editor/library insertion entrypoint
- but it still performs raw format detection and compatibility intake inline

Target split:

- **`insertLibraryPreset(presetContent, options)`**
  - library-only
  - accepts PSGLib or already-library-safe PSG
  - converts PSG through library conversion path only
- **`insertCompatibilityNormalizedPreset(presetContent, options)`**
  - compatibility-only wrapper
  - repairs/normalizes legacy PSG first
  - then delegates to `insertLibraryPreset(...)`
- **optional `parsePresetSourceKind(presetContent)`**
  - tiny router/helper for PSGLib vs PSG vs unsupported content

Caller destination:

- `useDragDropHandlers.ts` for known asset-library content should call `insertLibraryPreset(...)`
- open/import flows for unknown or historical user content should call `insertCompatibilityNormalizedPreset(...)`
- `insertPresetFromDrop(...)` should remain library-default, with compatibility path only when the caller explicitly opts in

### Detailed split recommendation for `convertNodeData(...)`

Current problem:

- mixes current payload mapping and old payload aliases in one place

Target split:

- **`convertLegacyNodeDataAliases(type, data)`**
  - compatibility-only
  - handles:
    - `choices -> options`
    - `text -> value`
    - `label -> template/value`
    - separator/value aliasing
- **`convertLibraryNodeData(type, data)`**
  - library-only
  - assumes content already matches supported library profile

## Recommended implementation order

### Phase 1: create strict parser boundary

1. split `parsePSG(...)`
2. stop canonical parsing from calling `normalizePsgLikeData(...)`
3. update roundtrip/canonical tests to call the strict parser directly

Why first:

- everything else depends on having one unambiguous canonical parser name

### Phase 2: isolate compatibility normalization helpers

4. split `normalizePsgLikeData(...)`
5. rename `canonicalizeImportedNodeType(...)` to make compatibility ownership explicit
6. split `normalizeImportedEdges(...)`

Why second:

- these are the low-level repair helpers currently leaking across every intake path

### Phase 3: split library validation and insertion from compatibility intake

7. split `validatePreset(...)`
8. split `insertPreset(...)`
9. split `convertNodeData(...)`
10. split `getImportedFragmentWrapperPolicy(...)` away from legacy detection

Why third:

- once parser and compatibility helpers are separate, preset insertion can depend on clean boundaries instead of toggles and inline normalization

### Phase 4: rename library-owned functions for clarity

11. rename `convertPSGToPSGLib(...)`
12. rename `exportGraphToPSG(...)`
13. rename `repairImportedFragmentWrapperNodes(...)`
14. rename `prepareImportedGraphBatch(...)`
15. rename `positionNodes(...)`

Why last:

- these are mostly clarity improvements and should happen after boundary splits settle

## Highest-risk callers to watch

### `client/src/Epic1Editor/utils/psgDocument.ts`

Risk:

- currently expects `parsePSG(...)` to be tolerant enough for old content before conversion into ReactFlow

Refactor impact:

- likely needs the compatibility-backed parser path

### `packages/asset-browser/src/components/OpenGraphDialog.tsx`

Risk:

- already has layered fallback behavior
- should remain compatibility-oriented, not accidentally become canonical-only

Refactor impact:

- should move to explicit compatibility wrapper parsing rather than generic `parsePSG(...)`

### `packages/core/components/epic1/hooks/useDragDropHandlers.ts`

Risk:

- currently validates and inserts known library assets and unknown content through mixed entrypoints

Refactor impact:

- should become the clearest place where the app chooses:
  - library-only path for repo assets
  - compatibility path for unknown/user content

### `packages/core/fileFormats/psgRepair.ts`

Risk:

- intentionally relies on compatibility normalization during repair work

Refactor impact:

- should continue using explicit legacy normalizers, not canonical-only parsing

## Rename target summary

### `psg.ts`

- `parsePSG(...)` -> `parseCanonicalPsg(...)` plus `parsePsgWithCompatibility(...)`
- `convertPSGToPSGLib(...)` -> `convertLibraryPsgToPsglib(...)`
- `exportGraphToPSG(...)` -> `exportGraphToLibraryPsg(...)`
- `sanitizeNodeDataForPSG(...)` -> `sanitizeNodeDataForLibraryPsg(...)`
- `normalizePSGNode(...)` -> `normalizeLegacyPsgNodeShape(...)`
- `normalizePSGRegion(...)` -> `normalizeLegacyPsgRegionShape(...)`

### `importGraphNormalization.ts`

- `normalizePsgLikeData(...)` -> `normalizeLegacyFlatPsgShape(...)`
- `canonicalizeImportedNodeType(...)` -> `canonicalizeLegacyImportedNodeType(...)`
- `normalizeImportedEdges(...)` -> `repairLegacyImportEdgeHandles(...)` + `normalizeLibraryImportEdges(...)`
- `getImportedFragmentWrapperPolicy(...)` -> `getLibraryFragmentWrapperPolicy(...)`
- `repairImportedFragmentWrapperNodes(...)` -> `repairLibraryFragmentWrapperNodes(...)`
- `prepareImportedGraphBatch(...)` -> `prepareLibraryImportedGraphBatch(...)`

### `presetInsertion.ts`

- `insertPreset(...)` -> `insertLibraryPreset(...)` + `insertCompatibilityNormalizedPreset(...)`
- `validatePreset(...)` -> `validateLibraryPreset(...)` + `validateCompatibilityPreset(...)`
- `convertNodeData(...)` -> `convertLibraryNodeData(...)` + `convertLegacyNodeDataAliases(...)`
- `positionNodes(...)` -> `positionLibraryPresetNodes(...)`
- `loadPresetFromPath(...)` -> `loadAndInsertLibraryPresetFromPath(...)`

## Bottom line

The first real refactor should **not** be a rename sweep.

It should be:

1. split `parsePSG(...)`
2. isolate legacy flat-PSG normalization
3. split preset validation/insertion into library vs compatibility intake
4. only then rename the remaining library-owned functions for clarity

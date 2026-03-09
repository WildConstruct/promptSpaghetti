# PSG Phase 2 normalization split note

This is a **doc-only** Phase 2 plan derived from:

- `docs/psg-tier-boundaries.md`
- `docs/psg-refactor-map.md`

Goal:

- split the remaining mixed normalization helpers into explicit **library normalization** and **legacy repair** responsibilities
- identify which behaviors should never run for repaired library assets
- list current callers and risk before implementation

## Scope

Focus files:

- `packages/core/runtime/importGraphNormalization.ts`
- `packages/core/fileFormats/psg.ts`

Mixed helpers in scope:

- `normalizeImportedEdges(...)`
- `normalizePsgLikeData(...)`

## 1. `normalizeImportedEdges(...)`: what is library normalization vs legacy repair

Current caller set:

- `packages/core/runtime/presetInsertion.ts`
- `packages/core/fileFormats/psg.ts`

Current behavior is mixed in one function.

### Library normalization inside `normalizeImportedEdges(...)`

These behaviors look like true supported runtime/library normalization:

- building `branchConnections` from `branch-<n>` source handles for weighted-choice nodes
- marking `node.data.options[index].hasBranch = true` based on actual branch edges
- assigning default weighted-choice source handle:
  - `main` when the node has branch options
  - `source` when it does not
- forcing concat source handle to `source`
- clearing output source handle to `undefined`
- assigning concat target handles to `input1` / `input2`
- defaulting missing generic target handles to `target`

These behaviors are library/runtime-facing because they describe how supported imported graphs are made insertion-ready once the graph is already in the current supported shape.

### Legacy repair inside `normalizeImportedEdges(...)`

These behaviors look like true legacy compatibility repair:

- treating source handles `output`, `main`, and `main-output` as old aliases before coercing to `source`
- treating target handle `input` as an old alias before coercing weighted-choice targets to `target`
- applying legacy node-type canonicalization indirectly via `canonicalizeImportedNodeType(...)` before edge normalization

These are compatibility behaviors because they repair old handle names rather than expressing the intended modern library shape.

### Candidate split

Recommended split:

- `repairLegacyImportEdgeHandles(edges, nodes)`
  - compatibility-only
  - repair old handle names and any node-type alias assumptions needed for legacy inputs
- `annotateLibraryWeightedChoiceBranchUsage(edges, nodes)`
  - library-only helper
  - infer `option.hasBranch` from valid branch edges
- `normalizeLibraryImportEdges(edges, nodes)`
  - library-only
  - assign supported runtime defaults for source and target handles after any legacy repair is complete

If a smaller split is preferred, the minimum viable split is:

- `repairLegacyImportEdgeHandles(...)`
- `normalizeLibraryImportEdges(...)`

with the weighted-choice branch annotation living inside the library function.

### What should never run for repaired library assets

These behaviors should **not be required** for repaired `assets/library/**/*.psg` inputs:

- alias repair for source handles `output`, `main`, `main-output`
- alias repair for target handle `input`
- any dependence on legacy node-type aliases in order to normalize edge handles

For repaired library assets, the expected path is:

- supported node types already present
- supported handle names already present or omitted in ways the library normalizer intentionally defaults
- no legacy alias repair needed

### Caller impact

#### `packages/core/fileFormats/psg.ts`

Current usage:

- `convertPSGToPSGLib(...)` calls `normalizeImportedEdges(processedEdges, contentNodes)`

Impact of split:

- library PSG conversion should call only `normalizeLibraryImportEdges(...)`
- compatibility-backed parsing should happen before this point if legacy edge aliases are still supported

Risk:

- **medium**
- risk is mostly around preserving current branch-handle and concat-slot behavior for valid library assets

#### `packages/core/runtime/presetInsertion.ts`

Current usage:

- insert flow calls `normalizeImportedEdges(edges, positionedWithParent)` after node placement/parenting

Impact of split:

- known library assets should call only `normalizeLibraryImportEdges(...)`
- unknown or legacy user content should run `repairLegacyImportEdgeHandles(...)` before the library normalizer

Risk:

- **high**
- this is live editor insertion behavior, so regressions would show up as broken handles, wrong concat inputs, or missing weighted-choice branch state

## 2. `normalizePsgLikeData(...)`: what is still generic compatibility vs what should never run for repaired library assets

Current caller set:

- `packages/core/fileFormats/psg.ts`
- `packages/core/fileFormats/psgRepair.ts`
- `packages/core/fileFormats/psgRepair.runtime.js`

Current behavior is compatibility-heavy and should no longer read like a harmless general normalizer.

### Generic compatibility still owned by `normalizePsgLikeData(...)`

These behaviors are still true generic legacy flat-PSG compatibility:

- `region -> regions`
- `groups -> regions`
- filling synthetic region ids and names from old group/region fields
- `group.nodeIds -> region.nodes`
- `region.nodeIds -> region.nodes`
- `region.label -> region.name`
- top-level metadata-derived `name` fallback
- `node.position.x/y -> node.x/y`
- default empty `edges = []` when absent
- dropping top-level `type` when it is not `psglib`

These are compatibility behaviors because they repair older or non-canonical flat-PSG shapes into something parsable by current PSG schema logic.

### What should never run for repaired library assets

These behaviors should **not be needed** for repaired library assets:

- singular `region` promotion
- `groups -> regions`
- `label -> name` on regions
- `nodeIds -> nodes` on regions/groups
- metadata/title/description-derived top-level name fallback
- `position.x/y -> x/y`
- deleting an unexpected top-level `type` field as part of normal asset intake

For repaired library assets, the expected path is:

- top-level `name` already present
- `regions` already present when regions are used
- region entries already use `name` and `nodes`
- nodes already use top-level `x` / `y`
- the file already presents as flat PSG, not as a legacy wrapper-adjacent shape

### Candidate split

Recommended split:

- `normalizeLegacyFlatPsgShape(data)`
  - compatibility-only
  - owns all old field promotion and alias repair currently in `normalizePsgLikeData(...)`
- `normalizeLibraryPsgShape(data)`
  - library-only, optional
  - only keep if there is a real non-legacy cleanup still intentionally supported for repo assets

Current evidence suggests `normalizeLibraryPsgShape(...)` may be unnecessary.

A cleaner target may be:

- `normalizeLegacyFlatPsgShape(data)` only
- repaired library assets bypass normalization and go straight to canonical/library parsing

### Caller impact

#### `packages/core/fileFormats/psg.ts`

Current usage:

- `parseCompatiblePsgObject(...)` now calls `normalizePsgLikeData(data)` before legacy node/region shape normalization and canonical parsing

Impact of split:

- `parseCompatiblePsgObject(...)` should call `normalizeLegacyFlatPsgShape(...)`
- strict canonical parsing should continue to bypass compatibility normalization entirely

Risk:

- **medium**
- parser behavior is now better isolated, but this is still a parser entrypoint and could affect older flat-PSG content

#### `packages/core/fileFormats/psgRepair.ts`

Current usage:

- repair flow calls `normalizePsgLikeData(preNormalized)`

Impact of split:

- repair flow should keep calling the explicit legacy normalizer

Risk:

- **low**
- this tool is already a repair path and explicitly compatibility-oriented

#### `packages/core/fileFormats/psgRepair.runtime.js`

Current usage:

- runtime repair flow mirrors `psgRepair.ts`

Impact of split:

- same as TypeScript repair flow

Risk:

- **low**

## 3. Candidate Phase 2 function map

| Current function | Library-owned target | Compatibility-owned target | Notes |
| --- | --- | --- | --- |
| `normalizeImportedEdges(...)` | `normalizeLibraryImportEdges(...)` | `repairLegacyImportEdgeHandles(...)` | optional extra helper: `annotateLibraryWeightedChoiceBranchUsage(...)` |
| `normalizePsgLikeData(...)` | optional `normalizeLibraryPsgShape(...)` | `normalizeLegacyFlatPsgShape(...)` | current evidence suggests the library-side helper may be unnecessary |
| `canonicalizeImportedNodeType(...)` | none | future rename to `canonicalizeLegacyImportedNodeType(...)` | should stop being an implicit dependency of normal library edge normalization |

## 4. Recommended Phase 2 order

1. split `normalizePsgLikeData(...)` conceptually into explicit legacy flat-PSG repair
2. retarget compatibility-backed parsing in `psg.ts` to that explicit legacy normalizer
3. split `normalizeImportedEdges(...)` into legacy handle repair and library handle normalization
4. make `psg.ts` conversion and `presetInsertion.ts` insertion flows call the library edge normalizer by default
5. leave compatibility edge repair only on explicitly compatibility-backed intake paths

## 5. Bottom line

The core Phase 2 boundary is:

- **library normalization** should shape already-supported PSG/graph inputs for runtime insertion
- **legacy repair** should only repair old aliases and old flat-PSG fields

In practical terms:

- `normalizeImportedEdges(...)` currently mixes runtime handle defaults with old-handle repair
- `normalizePsgLikeData(...)` currently mixes required legacy field repair with behavior that repaired library assets should never need

The next implementation step should therefore isolate:

- `repairLegacyImportEdgeHandles(...)`
- `normalizeLibraryImportEdges(...)`
- `normalizeLegacyFlatPsgShape(...)`

and then remove those compatibility paths from default repaired-library intake.

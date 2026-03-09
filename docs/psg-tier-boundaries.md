# PSG tier boundaries

This note defines the contract boundary between three PSG tiers so future tightening work happens in the right place.

## The three tiers

### 1. Minimal canonical authoring format

Purpose:

- the smallest documented PSG source shape contributors should copy for new MVP-aligned fragments
- the contract described in `docs/psg-weekend-mvp-contract.md`
- the shape exemplified by `docs/examples/psg-weekend-mvp-canonical-example.psg`

Characteristics:

- flat top-level PSG document
- canonical PascalCase node types
- top-level `x` / `y`
- semantic `regions`
- no editor wrapper nodes
- no legacy aliases
- no implicit repair logic

### 2. Supported richer asset-library format

Purpose:

- the real profile accepted for `assets/library/**/*.psg`
- allows richer metadata and authoring conveniences beyond the minimal contract
- must remain runtime-safe and stable for asset-browser/editor insertion

Characteristics:

- still flat PSG
- may include richer top-level metadata
- may include region metadata and richer option payloads
- may include asset-library conventions not present in the minimal example
- should not require legacy shape repair

### 3. Legacy external-import compatibility

Purpose:

- controlled tolerance for old PSG variants and historical graph-shaped inputs
- migration boundary for files not produced by the current asset library or current authoring flow

Characteristics:

- accepts legacy field aliases and old wrapper-derived shapes
- may normalize old handles, old node type names, `groups`, singular `region`, `position.x/y`, and old node payload aliases
- should stay narrow and explicit
- should not define what authored PSG means

## Desired acceptance map

### Canonical-only acceptance

These paths should accept only minimal canonical authoring PSG:

- the contract and example docs
- any future template, lint, or CI check for new authored PSG
- any future explicit `strictParseCanonicalPsg(...)` entrypoint

Important current state:

- none of the requested runtime functions are currently canonical-only
- canonical semantics are currently documented, but not isolated in code

### Library-only acceptance

These paths should accept the richer asset-library PSG profile:

- asset-library validation
- asset-library loading/insertion
- editor and asset-browser flows that intentionally consume repo library fragments
- export/save flows that produce source PSG from live editor graphs

### Compatibility-only acceptance

These paths should continue accepting legacy imports:

- legacy graph-wrapper codec flows documented in `docs/legacy-psg-compat-audit.md`
- any explicit external-import helper for historical PSG variants
- narrowly named normalization helpers that convert legacy PSG into the library profile before normal runtime use

## Where the tiers are currently mixed together

### `docs/psg-weekend-mvp-contract.md`

Current mixing:

- correctly defines the canonical contract
- also embeds runtime tolerance details like `groups`, singular `region`, `position.x/y`, and node-type aliasing
- also mentions richer library examples in `assets/library/`

Boundary recommendation:

- this doc should remain primarily canonical-only
- keep only short references to richer-library and legacy compatibility tiers
- move detailed tolerance ownership to the new boundary model and to `docs/legacy-psg-compat-audit.md`

### `docs/psg-corpus-validation-note.md`

Current mixing:

- mostly a library-tier document already
- includes some compatibility-removal recommendations

Boundary recommendation:

- treat this as the authoritative note for the richer asset-library profile
- use it to justify tightening library ingest paths
- do not let it redefine the canonical contract

### `docs/legacy-psg-compat-audit.md`

Current mixing:

- correctly treats graph-wrapper parsing as compatibility-only
- does not yet cover flat-PSG legacy tolerance embedded in `importGraphNormalization.ts`, `psg.ts`, and `presetInsertion.ts`

Boundary recommendation:

- this doc should own both kinds of compatibility:
  - legacy graph-wrapper codec compatibility
  - legacy flat-PSG shape compatibility

### `packages/core/runtime/importGraphNormalization.ts`

Current mixing:

- contains true compatibility helpers
- also contains import-time library behavior
- both are consumed as if they were one normalization layer

Mixed responsibilities:

- `normalizePsgLikeData(...)`
  - compatibility-only behavior
  - normalizes `region`, `groups`, metadata-derived names, `position.x/y`, `label -> name`, `nodeIds -> nodes`
- `canonicalizeImportedNodeType(...)`
  - compatibility-only behavior
  - bridges legacy/editor node type names to live node types
- `normalizeImportedEdges(...)`
  - mixed
  - library-tier handle normalization is mixed with legacy handle fallback like `input`, `output`, `main-output`
- `getImportedFragmentWrapperPolicy(...)`
  - mixed
  - library-tier fragment-layout policy is mixed with legacy-shape detection like `groups`
- `repairImportedFragmentWrapperNodes(...)`
  - library-only behavior
- `prepareImportedGraphBatch(...)`
  - library-only behavior around wrapper repair, layout, and output dedupe

### `packages/core/fileFormats/psg.ts`

Current mixing:

- contains the closest thing to the canonical contract
- but `parsePSG(...)` still immediately routes through compatibility normalization
- export and conversion logic also serve library/editor insertion concerns

Mixed responsibilities:

- `PSGNodeSchema`, `PSGEdgeSchema`, `PSGRegionSchema`, `PSGFileSchema`
  - should represent canonical shape expectations
  - currently permissive enough to coexist with broader runtime behavior
- `parsePSG(...)`
  - mixed
  - acts like the canonical parser name, but currently accepts compatibility-normalized data
- `normalizePSGNode(...)`
  - compatibility-only because it tolerates nested `position`
- `normalizePSGRegion(...)`
  - compatibility-only because it tolerates `label` and `nodeIds`
- `convertPSGToPSGLib(...)`
  - library-only
  - converts flat PSG fragments into live insertion-ready graph structure with wrapper/layout policy
- `exportGraphToPSG(...)`
  - library-only
  - exports source PSG from live editor state, including region synthesis from wrapper boxes and richer node payload preservation
- `sanitizeNodeDataForPSG(...)`
  - library-only export shaping
  - not a canonical validator

### `packages/core/runtime/presetInsertion.ts`

Current mixing:

- intended as library/editor insertion logic
- still performs format detection and uses compatibility normalization inline
- `convertNodeData(...)` mixes canonical content mapping with legacy payload aliases

Mixed responsibilities:

- `insertPreset(...)`
  - mixed
  - library insertion entrypoint, but currently performs direct format detection and PSG acceptance rules inline
- `insertPresetFromDrop(...)`
  - library-only behavior, but depends on mixed policy helpers
- `loadPresetFromPath(...)`
  - library-only behavior, but inherits mixed parsing rules from `insertPreset(...)`
- `validatePreset(...)`
  - mixed
  - library validation entrypoint, but currently normalizes compatibility shapes inline before validation
- `convertNodeData(...)`
  - mixed
  - maps library payloads and legacy aliases in the same function
- `positionNodes(...)`
  - library-only insertion/layout behavior

## Recommended function classification

### Canonical-only

These should become canonical-only surfaces or remain canonical-only documentation:

- `docs/psg-weekend-mvp-contract.md`
- `docs/examples/psg-weekend-mvp-canonical-example.psg`
- `PSGNodeSchema`
- `PSGEdgeSchema`
- `PSGRegionSchema`
- `PSGFileSchema`

Recommendation:

- keep the schemas as the canonical source of truth
- stop making `parsePSG(...)` the place where compatibility is implicitly applied
- add a future strict parser around these schemas rather than widening them further

### Library-only

These should own the supported richer asset-library profile:

- `docs/psg-corpus-validation-note.md`
- `convertPSGToPSGLib(...)`
- `exportGraphToPSG(...)`
- `sanitizeNodeDataForPSG(...)`
- `repairImportedFragmentWrapperNodes(...)`
- `prepareImportedGraphBatch(...)`
- `positionNodes(...)`
- `insertPresetFromDrop(...)`
- `loadPresetFromPath(...)`

These functions may preserve richer metadata, region metadata, output nodes, and asset-library insertion behavior, but should assume legacy repair has already happened elsewhere.

### Compatibility-only

These should be explicitly treated as compatibility-layer code:

- `docs/legacy-psg-compat-audit.md`
- `normalizePsgLikeData(...)`
- `canonicalizeImportedNodeType(...)`
- `normalizePSGNode(...)`
- `normalizePSGRegion(...)`

These are the functions that should own:

- `groups -> regions`
- singular `region -> regions`
- `position.x/y -> x/y`
- `label -> name`
- `nodeIds -> nodes`
- legacy node-type aliases
- metadata-derived top-level name fallbacks

### Mixed today and should be split

These are the main contract-boundary problems:

- `parsePSG(...)`
  - should stop implying canonical-only parsing while performing compatibility normalization
- `normalizeImportedEdges(...)`
  - should split into:
    - library-tier handle normalization
    - compatibility-only old-handle repair
- `getImportedFragmentWrapperPolicy(...)`
  - should stop consulting legacy `groups` as a normal import signal once compatibility is staged earlier
- `insertPreset(...)`
  - should delegate format/compatibility intake before library insertion starts
- `validatePreset(...)`
  - should validate the library profile, not silently perform compatibility normalization inline
- `convertNodeData(...)`
  - should stop mixing library payload mapping with legacy aliases like `choices`, `text`, `label`, and separator/value fallbacks

## Tightening order

Recommended order for future cleanup:

1. Define a strict canonical parser boundary in `psg.ts`
2. Keep asset-library acceptance separate as the default repo-internal fragment path
3. Push all legacy flat-PSG repair into explicit compatibility helpers
4. Let preset insertion consume either:
   - already-canonical/library PSG
   - or a separately normalized compatibility result
5. Update docs so each of the three tiers has one obvious owner

## Practical rule

When a function answers the question, "what is a valid new PSG source file?", it belongs to the canonical tier.

When a function answers the question, "what repo asset fragments do we support and insert today?", it belongs to the library tier.

When a function answers the question, "what old or external variants will we still repair and accept for migration?", it belongs to the compatibility tier.

## Bottom line

Today the canonical contract, library profile, and compatibility logic are still co-located in `parsePSG(...)`, `normalizePsgLikeData(...)`, `normalizeImportedEdges(...)`, and preset insertion.

The next tightening step should therefore be a **function-boundary split**, not another corpus pass:

- canonical contract stays small and explicit
- library profile remains richer but intentional
- compatibility logic becomes named, narrow, and optional

# PSG Weekend MVP Contract

## Current truth

### Live PSG source shape

The current live parser in `packages/core/fileFormats/psg.ts` accepts a flat fragment document, not the editor-project wrapper described in `docs/psg-format-v2.md`.

```json
{
  "version": "1.0.0",
  "name": "Fragment Name",
  "description": "Optional",
  "metadata": { "type": "ASSET_FRAGMENT" },
  "nodes": [],
  "edges": [],
  "regions": []
}
```

Runtime tolerance today is broader than the canonical shape:

- `groups` is accepted and normalized to `regions`
- singular `region` is accepted and normalized to `regions`
- node positions may arrive as `x`/`y` or `position.x`/`position.y`
- node types are canonicalized across legacy/editor variants like `WeightedChoice`/`weightedChoice`, `Output`/`output`, `Concat`/`concat`, `TextBlock`/`textBlock`, `boundingBox`/`enhancedBoundingBox`

### What PSG means in the live runtime

For MVP, PSG is effectively a source/import format for reusable graph fragments.

- It stores source nodes and source edges
- It may store semantic fragment grouping via `regions`
- It does **not** need to store editor session state
- It does **not** need to store the imported wrapper node that the editor synthesizes on insertion

### Live fragment import behavior

When a PSG fragment is converted/imported:

- a single `enhancedBoundingBox` wrapper is synthesized for fragment imports
- child nodes are converted to editor node types and nested under that wrapper with `parentNode`, `extent: 'parent'`, and `expandParent: true`
- imported edges are normalized to live handle ids by the staged runtime normalization flow in `packages/core/runtime/importGraphNormalization.ts`
- if an existing output already exists in the destination graph, imported output nodes are removed and edges are retargeted by `prepareImportedGraphBatch(...)`
- imported fragment layout may be preserved and auto-layout skipped based on `regions`, `groups`, or already-parented imported wrapper structure

Current conversion split:

- canonical PSG parse/conversion paths should use `parseCanonicalPsg(...)` + `convertCanonicalPSGToPSGLib(...)`
- compatibility PSG parse/conversion paths should use `parsePsgWithCompatibility(...)` + compatibility-backed conversion
- transitional aliases like `parsePSG(...)` and `convertPSGToPSGLib(...)` still exist, but they are migration wrappers rather than the long-term contract

### Live handle contract

The current runtime contract in `packages/core/runtime/importGraphNormalization.ts` is:

- generic/default source handle: `source`
- generic/default target handle: `target`
- `weightedChoice`
  - main flow source handle: `source` or `main`
  - branch source handles: `branch-0`, `branch-1`, ...
  - target handle: `target`
- `concat`
  - source handle: `source`
  - target handles: `input1`, `input2`
- `output`
  - no handle ids on import edges after normalization

This is the live contract. Old `output`/`input` defaults in docs are stale.

Compatibility note:

- old source aliases like `output`, `main`, and `main-output` are still repaired on compatibility-backed paths
- old weighted-choice target alias `input` is still repaired on compatibility-backed paths
- canonical/library-safe paths should prefer the live handles directly and should not rely on alias repair

## Doc drift

### Stale assumption: fragment wrapper type

Outdated docs say fragments use `fragmentContainer` and manual regions use `enhancedBoundingBox`.

Current runtime truth:

- fragment imports also use `enhancedBoundingBox`
- there is no live PSG import contract centered on `fragmentContainer`

This affects:

- `docs/fragment-system-architecture.md`

### Stale assumption: fragments should exclude `Output`

Several historical docs say PSG fragments should not include `Output` nodes.

Current runtime truth:

- `convertPSGToPSGLib(...)` preserves output nodes during conversion
- later insertion/runtime logic deduplicates against an existing output node if needed

This affects:

- `docs/fragment-system-architecture.md`
- `docs/asset-creation-guide.md`
- `docs/_archive/technical/technical-specs/file-format-specification.md`

### Stale assumption: PSG uses editor-project wrapper/state

`docs/psg-format-v2.md` describes PSG as a full editor save format with:

- `fileType`
- `formatVersion`
- top-level `settings`
- `graph.nodes` / `graph.edges` / `graph.state`
- edit-state blobs
- execution metadata
- plugin/custom-node payloads
- demo/checksum/compression/encryption sections

Current runtime truth:

- `parsePSG(...)` does not use that shape as the canonical PSG contract
- the live parser expects flat top-level `nodes` and `edges`
- most of the described fields are editor-only bloat, not source-format essentials

### Stale assumption: edge handles default to `output` / `input`

Historical docs describe generic handle ids like:

- source: `output`
- target: `input`

Current runtime truth:

- default normalized handles are `source` and `target`
- `concat` uses `input1` / `input2`
- weighted branching uses `branch-N`
- output edges normalize to no target handle

This affects:

- `docs/asset-creation-guide.md`
- `docs/psg-format-v2.md`
- `docs/_archive/technical/technical-specs/file-format-specification.md`

### Stale assumption: regions are stored as editor boxes

Some older examples model regions like editor bounding boxes with `x`, `y`, `width`, `height`, nested `data`, and collapse state.

Current runtime truth:

- canonical source `regions` are semantic group descriptors
- the parser/runtime only depends on region identity, name, optional color/metadata, node membership, and optional ports
- the editor wrapper box is synthesized during import

This affects:

- `docs/asset-creation-guide.md`

## Recommended weekend PSG contract

### Goal

PSG should be the minimal source format for reusable fragments, not a dump of editor runtime state.

### Canonical top-level schema

```json
{
  "version": "1.0.0",
  "name": "Fragment Name",
  "description": "Optional",
  "metadata": {
    "type": "ASSET_FRAGMENT",
    "author": "Optional",
    "tags": ["optional"],
    "source": "optional/original/path.psg"
  },
  "nodes": [],
  "edges": [],
  "regions": []
}
```

### Canonical node types for weekend MVP

The runtime still tolerates a wider compatibility set, but weekend-MVP authoring guidance should be narrower.

Runtime-compatible set today:

- `WeightedChoice`
- `TextBlock`
- `Concat`
- `Output`
- `Variable`
- `SetVariable`
- `GetVariable`
- `Include`

Weekend-MVP authoring subset:

- `WeightedChoice`
- `TextBlock`
- `Concat`
- `Output`

Authoring rule:

- new MVP graphs, examples, and asset fragments should use only the four-node subset above unless there is a specific compatibility reason not to
- wider node support should be treated as compatibility/runtime tolerance, not primary authoring guidance

### Canonical node rules

- use PascalCase type names in PSG source
- use top-level `x` and `y`
- keep node payload to content needed for generation/import
- allow `data` only for node-specific generation content, not editor session state

### Fragment sizing principle

For MVP and near-term authoring, fragments should land at the semantic-chunk level.

Target units:

- archetype identity clauses
- wardrobe or material clauses
- silhouette modifiers
- environment clauses
- camera/style rules

Avoid:

- single-word fragments that stop reading as meaningful units
- whole-paragraph fragments that cannot be reused across families

Authoring rule:

- if a fragment is too large to recombine across archetype families, it is too large
- if a fragment is too small to read clearly on its own, it is too small
- if fragment recombination breaks grammar or readability, prefer future conditional resolution instead of forcing smaller fragments

Examples:

- `WeightedChoice`
  - prefer `options` as the source-of-truth list
  - optional mirrored `data.options` may be tolerated, but should not be the canonical recommendation
- `TextBlock`
  - store visible text as `value`
- `Output`
  - store template/text as `template` or `value`
- `Concat`
  - store only separator-like generation data that matters at runtime

### Canonical edge handle rules

For weekend MVP, document the live runtime contract explicitly:

- omit handles unless needed
- when omitted, import normalization applies runtime defaults
- preferred explicit handles are:
  - generic source: `source`
  - generic target: `target`
  - concat targets: `input1`, `input2`
  - weighted branches: `branch-N`
  - weighted main path: `main` when branching matters, otherwise `source`
- do not recommend `output` / `input` as canonical ids anymore

### Canonical fragment/wrapper representation

PSG source should represent fragments semantically, not as editor wrapper nodes.

- fragment grouping belongs in `regions`
- imported wrapper nodes do **not** belong in canonical PSG
- `enhancedBoundingBox`, `parentNode`, `extent`, `expandParent`, wrapper width/height, and wrapper visual styling are editor/runtime artifacts

Recommended region shape:

```json
{
  "id": "region-primary",
  "name": "Primary",
  "color": "#22d3ee",
  "nodes": ["node-a", "node-b"],
  "description": "Optional",
  "metadata": {},
  "ports": []
}
```

### What belongs in PSG vs editor-only state

Belongs in PSG:

- fragment identity: `version`, `name`, `description`
- minimal authoring metadata: `metadata.type`, `author`, `tags`, `source`
- source nodes
- source edges
- semantic regions and optional region ports
- node content needed for generation

Does not belong in PSG:

- editor viewport/state/selection
- undo history
- inline edit buffers or validation UI state
- usage analytics and popularity counters
- marketplace/license boilerplate for weekend MVP
- wrapper node geometry synthesized during import
- React Flow-only fields unless a compatibility bridge must temporarily tolerate them

## MVP recommendation

For the weekend roadmap, treat PSG as:

- the canonical fragment source format
- flat top-level JSON with `nodes`, `edges`, and optional `regions`
- minimal content model plus live handle semantics
- no editor-project scaffolding

And treat the following as compatibility-only, not canonical:

- `groups`
- singular `region`
- `position.x` / `position.y`
- mixed node type aliases
- editor wrapper nodes in source files
- old `input` / `output` handle ids

Copyable canonical example:

- `docs/examples/mvp-character-archetype-demo.psg`

Note on examples in `assets/library/`:

- many existing library assets are runtime-compatible but richer than the minimum recommended authoring contract
- contributors should copy from `docs/examples/mvp-character-archetype-demo.psg` when creating new MVP-aligned source files

# `importGraphNormalization.ts` Phase 2 implementation checklist

This is a **doc-only** implementation checklist for the next code pass in:

- `packages/core/runtime/importGraphNormalization.ts`

Source plan:

- `docs/psg-phase2-normalization-split-note.md`

Scope limit:

- only helper extraction and split planning inside `importGraphNormalization.ts`
- no implementation changes yet
- no planning for `psg.ts` or `presetInsertion.ts` beyond caller guidance

## 1. Exact helper extraction order

1. extract `normalizeLegacyFlatPsgShape(...)` from `normalizePsgLikeData(...)`
2. leave `normalizePsgLikeData(...)` in place temporarily as a compatibility alias to the extracted helper
3. extract `annotateLibraryWeightedChoiceBranchUsage(...)` from `normalizeImportedEdges(...)` if the helper remains small and readable
4. extract `normalizeLibraryImportEdges(...)` from the current `normalizeImportedEdges(...)` body
5. extract `repairLegacyImportEdgeHandles(...)` from the current `normalizeImportedEdges(...)` body
6. leave `normalizeImportedEdges(...)` in place temporarily as a compatibility-staged wrapper:
   - repair legacy handles first
   - then run library normalization
7. only after callers are updated in later phases, consider renaming `canonicalizeImportedNodeType(...)`

Why this order is safest:

- it preserves current exports first
- it allows behavior-preserving extraction before any caller changes
- it makes `normalizePsgLikeData(...)` low-risk to isolate before touching live edge behavior

## 2. Proposed function signatures

### Flat-PSG normalization

```ts
export function normalizeLegacyFlatPsgShape(data: any): any
```

Temporary compatibility alias during migration:

```ts
export function normalizePsgLikeData(data: any): any
```

### Edge normalization

```ts
export function repairLegacyImportEdgeHandles<
  TNode extends NodeLike,
  TEdge extends EdgeLike
>(edges: TEdge[], nodes: TNode[]): TEdge[]
```

```ts
export function annotateLibraryWeightedChoiceBranchUsage<
  TNode extends NodeLike,
  TEdge extends EdgeLike
>(edges: TEdge[], nodes: TNode[]): void
```

If mutating `nodes` in place feels too implicit, the alternative is:

```ts
export function annotateLibraryWeightedChoiceBranchUsage<
  TNode extends NodeLike,
  TEdge extends EdgeLike
>(edges: TEdge[], nodes: TNode[]): Map<string, Set<number>>
```

Preferred for lowest blast radius:

- keep the current in-place option annotation behavior
- return `void`

```ts
export function normalizeLibraryImportEdges<
  TNode extends NodeLike,
  TEdge extends EdgeLike
>(edges: TEdge[], nodes: TNode[]): TEdge[]
```

Temporary compatibility wrapper during migration:

```ts
export function normalizeImportedEdges<
  TNode extends NodeLike,
  TEdge extends EdgeLike
>(edges: TEdge[], nodes: TNode[]): TEdge[]
```

## 3. Exact block-to-helper mapping

## A. Move from `normalizePsgLikeData(...)` into `normalizeLegacyFlatPsgShape(...)`

Move the full current body of `normalizePsgLikeData(...)`, including:

- early return for non-object input
- shallow copy into `normalized`
- singular `region` promotion block
- `groups -> regions` mapping block
- top-level `name` fallback block
- default `edges = []` block
- node `position.x/y -> x/y` block
- region `label/nodeIds -> name/nodes` block
- top-level `type` cleanup block
- final `return normalized`

Temporary wrapper shape after extraction:

- `normalizePsgLikeData(...)` should just delegate to `normalizeLegacyFlatPsgShape(...)`

## B. Move from `normalizeImportedEdges(...)` into `annotateLibraryWeightedChoiceBranchUsage(...)`

Move these blocks together:

- `branchConnections` map initialization
- first `edges.forEach(...)` that collects `branch-<n>` usage for weighted-choice sources
- `nodes.forEach(...)` that sets `option.hasBranch = connections.has(index)`

Reason to keep together:

- these lines are one coherent library concern: infer branch usage from already-supported branch handles

Do **not** move `concatInputUsage` into this helper.

## C. Move from `normalizeImportedEdges(...)` into `normalizeLibraryImportEdges(...)`

Move these blocks into the library normalizer:

- `nodeTypeMap` creation, but only if the helper still needs current node-type lookup
- `concatInputUsage` map initialization
- second `edges.forEach(...)` that preloads used concat handles from `input1` / `input2`
- the `edges.map(...)` return block branches for:
  - weighted-choice default branch vs source logic
  - concat source handle -> `source`
  - output source handle -> `undefined`
  - concat target slot assignment to `input1` / `input2`
  - generic missing target handle -> `target`

Keep these rules out of the legacy repair helper:

- branch usage annotation
- default supported runtime handles
- concat slot assignment
- output handle clearing

## D. Move from `normalizeImportedEdges(...)` into `repairLegacyImportEdgeHandles(...)`

Move only the legacy alias-repair conditions:

- source-handle fallback when:
  - `sourceHandle === 'output'`
  - `sourceHandle === 'main'`
  - `sourceHandle === 'main-output'`
- weighted-choice target-handle alias when:
  - `targetHandle === 'input'`
- any dependence on legacy node-type canonicalization that exists only to recognize old imported types before repair

Important boundary:

- this helper should repair old aliases only
- it should not assign concat slots
- it should not infer weighted-choice branch state
- it should not decide normal default handles for already-supported assets

## 4. Temporary wrapper behavior during migration

## `normalizePsgLikeData(...)`

Temporary behavior:

- remain exported
- delegate directly to `normalizeLegacyFlatPsgShape(...)`

Reason:

- lowest blast radius for existing compatibility callers

## `normalizeImportedEdges(...)`

Temporary behavior:

- remain exported
- become a thin compatibility wrapper:
  1. run `repairLegacyImportEdgeHandles(...)`
  2. run `annotateLibraryWeightedChoiceBranchUsage(...)` if extracted separately
  3. run `normalizeLibraryImportEdges(...)`

Reason:

- preserves current behavior while allowing later caller-by-caller cutover

## 5. Current callers: who should keep compatibility vs who should switch later

This checklist does **not** change callers yet. It only records intended later routing.

## Callers that should keep using the compatibility path

- callers still handling unknown or historical imported graphs
- callers that still rely on old handle aliases or old flat-PSG shape repair

Current practical examples to preserve later:

- any future compatibility-backed intake path that feeds old flat PSG into parser/import flows
- current wrapper exports `normalizePsgLikeData(...)` and `normalizeImportedEdges(...)` during migration

## Callers that should switch to library-only normalization first

Later, once callers are updated outside this file, these usages should prefer library-only helpers:

- `packages/core/fileFormats/psg.ts`
  - should eventually call `normalizeLibraryImportEdges(...)` after compatibility parsing has already happened upstream
- `packages/core/runtime/presetInsertion.ts`
  - known repaired library assets should eventually call `normalizeLibraryImportEdges(...)` directly

## Callers that should keep explicit legacy flat-PSG normalization

Later, once callers are updated outside this file, these should use the explicit legacy helper:

- compatibility-backed PSG parse path
- repair-oriented tooling that intentionally accepts legacy flat PSG

## 6. Safest first code step with lowest blast radius

Safest first code step:

- extract **`normalizeLegacyFlatPsgShape(...)`** first
- keep `normalizePsgLikeData(...)` as a direct alias wrapper

Why this is the safest first step:

- it is a pure extraction from one self-contained function
- it does not immediately affect live edge mapping during editor insertion
- current callers can keep their existing import path unchanged
- it establishes the compatibility naming boundary before touching riskier edge-handle logic

## 7. Lowest-risk second step

After the first extraction, the next safest step is:

- extract `annotateLibraryWeightedChoiceBranchUsage(...)`
- leave `normalizeImportedEdges(...)` behavior unchanged by calling the new helper internally

Why this is the next safest step:

- it isolates a clearly library-owned subroutine
- it does not yet force a choice between compatibility and library edge paths
- it reduces complexity in `normalizeImportedEdges(...)` before splitting handle repair

## 8. Highest-risk step inside this file

Highest-risk local step:

- splitting `normalizeImportedEdges(...)` into separate legacy repair and library normalization helpers

Why it is highest risk:

- this helper affects live insert behavior
- it mixes source-handle repair, concat slot assignment, output special cases, and weighted-choice branching state
- ordering mistakes could silently alter graph wiring semantics

## 9. Practical implementation sequence for the next code pass

1. extract `normalizeLegacyFlatPsgShape(...)`
2. convert `normalizePsgLikeData(...)` into a delegating wrapper
3. extract `annotateLibraryWeightedChoiceBranchUsage(...)`
4. extract `normalizeLibraryImportEdges(...)` without changing `normalizeImportedEdges(...)` export shape
5. extract `repairLegacyImportEdgeHandles(...)`
6. convert `normalizeImportedEdges(...)` into an ordered wrapper around the new helpers
7. stop and verify that behavior is unchanged before any caller cutover in other files

## Bottom line

For `importGraphNormalization.ts` alone, the lowest-blast-radius path is:

- name legacy flat-PSG normalization explicitly first
- then peel library branch-annotation logic out of edge normalization
- then split legacy handle repair from library handle defaults
- keep current exported wrappers in place until later phases move callers intentionally

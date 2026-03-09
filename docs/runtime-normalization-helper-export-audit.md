# Runtime normalization helper export audit

This is a short **doc-only** audit for whether `packages/core/public.ts` should expose the new runtime normalization helpers.

Helpers in scope:

- `normalizeLegacyFlatPsgShape(...)`
- `repairLegacyImportEdgeHandles(...)`
- `annotateLibraryWeightedChoiceBranchUsage(...)`
- `normalizeLibraryImportEdges(...)`

## Current public surface

`packages/core/public.ts` currently exports:

- stable graph/types
- advanced runtime types/classes
- legacy graph-wrapper PSG codec helpers
- flat PSG helpers from `./fileFormats/psg`
- prompt segmentation helpers

It does **not** currently expose runtime normalization internals from `./runtime/importGraphNormalization`.

## Recommendation

**Do not expose these new helpers in `packages/core/public.ts` yet.**

## Why keep them internal for now

### `normalizeLegacyFlatPsgShape(...)`

Reason to keep internal:

- this is a compatibility-repair helper, not a stable external contract
- its exact behavior is still being clarified as the compatibility boundary is split

### `repairLegacyImportEdgeHandles(...)`

Reason to keep internal:

- this is a narrow migration helper for legacy edge aliases
- exporting it publicly would turn an implementation detail into an API commitment too early

### `annotateLibraryWeightedChoiceBranchUsage(...)`

Reason to keep internal:

- this is a low-level mutating helper used to prepare import state
- it is not a clear standalone public primitive yet

### `normalizeLibraryImportEdges(...)`

Reason to keep internal:

- this is a library-ingest helper for editor/runtime insertion behavior
- it should stabilize behind internal caller migrations before becoming public

## Suggested public-surface rule

Only export one of these from `public.ts` later if both are true:

- the helper is useful outside the internal editor/runtime import pipeline
- the helper's tier ownership and behavior are stable enough to support as API

## Practical conclusion

For now:

- keep the new helpers **exported from the file** for internal tests and internal call-site migration
- keep them **out of `packages/core/public.ts`**

That gives:

- direct regression coverage in internal tests
- flexibility to keep reshaping the helper boundaries
- no premature public API commitment

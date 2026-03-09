# Weekend MVP Launch Readiness

_Last updated: 2026-03-07_

## Current status

The PSG import/normalization lane is in good shape for the weekend MVP.

Verified green:

- `packages/core/runtime/__tests__/importGraphNormalization.test.ts`
- `packages/core/runtime/__tests__/presetInsertion.test.ts`
- `packages/core/fileFormats/__tests__/psg-fragment-handling.test.ts`

What is now materially true:

- canonical and compatibility PSG paths are explicitly split in code
- staged edge normalization is covered by helper-level and wrapper-level tests
- preset insertion follows the canonical-vs-compatibility split
- visible editor and asset-browser save/open flows are much closer to the real `.psg` MVP contract
- major fake/stub UI fallbacks have been removed from the asset browser

## Fixed in this pass

- incorrect cloud-open ownership labeling and delete affordances in `SupabaseOpenDialog`
- visible `.json` advertising in the active editor local-open picker
- asset-browser empty states that pointed to internal `/asset` or repo-doc recovery paths
- fabricated asset-browser sample outputs, branch previews, stub preset fallback, and synthetic thumbnails

## Remaining release-gating checks

These still need explicit verification before calling the MVP launch-ready:

- `pnpm run typecheck:active`
- `pnpm run build:netlify`
- `pnpm run build:vercel-api`
- fragment Playwright suite
- resize Playwright suite
- representative PSG round-trip in the active editor
- one polished golden-path graph
- one real `Prompt -> Graph Draft` workflow

## Acceptable MVP debt

These do not currently look like launch blockers:

- some dialog copy still uses broader “document” or “graph” wording in places
- compatibility loading still exists behind `.psg`-first paths for historical data
- broader preview/export polish remains incomplete

## Recommendation

Do not reopen the normalization/import lane unless a real regression appears.

The next work should be final release triage:

- run the remaining release-gating commands and browser checks
- confirm one honest AI bootstrap path
- confirm one polished end-to-end authoring/export demo

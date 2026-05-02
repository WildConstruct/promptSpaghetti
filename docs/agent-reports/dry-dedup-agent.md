# Batch 1 / Agent 1 DRY Deduplication Report

## Critical Assessment

The safest DRY opportunities in the owned surface are small helper duplications rather than broad architectural merges. The repo already has several cleanup lanes active in the working tree, so this pass avoided deleting files, reshaping package boundaries, or moving large component logic across packages.

The highest-confidence duplication was in two places:

- Core API clients repeated response JSON/error-message handling across PSG and local-image service clients.
- Asset-browser resize hooks and the pro browser component repeated localStorage read, parse, range-check, JSON parse, and write behavior.

Both areas are narrow helper/service surfaces with existing call sites and focused tests. They also do not require type-contract consolidation, circular dependency work, or broad unused-code removal, which are owned by other cleanup agents.

## Implemented Changes

1. Extended `packages/core/services/http.ts` with `getJsonErrorMessage` and reused it from:
   - `packages/core/services/psg/client.ts`
   - `packages/core/services/localImage/client.ts`

2. Added `packages/asset-browser/src/utils/storage.ts` with small localStorage helpers:
   - `readStoredString`
   - `writeStoredString`
   - `readStoredNumberInRange`
   - `readStoredJson`
   - `writeStoredJson`

3. Reused those storage helpers in asset-browser resize/persistence code:
   - `packages/asset-browser/src/hooks/useResizable.ts`
   - `packages/asset-browser/src/hooks/usePanelResize.ts`
   - `packages/asset-browser/src/hooks/useColumnResize.ts`
   - `packages/asset-browser/src/hooks/useSectionResize.ts`
   - `packages/asset-browser/src/components/ProAssetBrowser.tsx`

## Deferred Or Lower-Confidence Opportunities

- Preset/asset path normalization appears related between the asset browser and Epic 1 drag/drop handling, but the semantics differ enough that merging it should wait for a dedicated preset-source contract review.
- Resizing behavior could eventually be consolidated further, but the hooks currently expose different APIs and UI behavior. A shared low-level drag hook would be a larger UI refactor and was not justified for this pass.
- Broader localStorage consolidation in `client/src` and `packages/core/components/epic1` remains possible, but it would touch active editor flows and is better handled after the current cleanup batches settle.
- Server-side environment/runtime consolidation was intentionally left alone because this batch owns `client/src`, `packages/core`, and `packages/asset-browser`.

## Validation

- `npx.cmd tsc -p packages/core/tsconfig.json --noEmit --pretty false` passed.
- `npm.cmd run test -- usePanelResize --runInBand` in `packages/asset-browser` passed: 1 suite, 9 tests.
- `npm.cmd run typecheck` in `packages/asset-browser` is currently blocked by pre-existing package-resolution errors in `src/components/OpenGraphDialog.tsx` and `src/components/SaveGraphDialog.tsx` for `@promptscape/core/fileFormats/psg`.
- The first asset-browser Jest attempt without `--runInBand` was blocked by `spawn EPERM`; the in-band rerun passed.

# PSG corpus validation note

This note records a strict validation pass over `assets/library/**/*.psg` against the weekend MVP PSG contract in `docs/psg-weekend-mvp-contract.md` and the canonical example in `docs/examples/psg-weekend-mvp-canonical-example.psg`.

## Final corpus classification

- Total files scanned: `162`
- Canonical MVP PSG: `0` (`0%`)
- Compatible but richer than canonical: `162` (`100%`)
- Unsafe or ambiguous: `0` (`0%`)

Interpretation:

- The repaired corpus is fully runtime-safe under the current MVP parser expectations.
- None of the library files match the intentionally minimal canonical example exactly.
- Every file still carries richer library metadata, region metadata, option metadata, or editor-ish convenience fields beyond the strict authoring template.

## Top remaining deviations from the strict canonical line

Most common repeated deviations:

1. `metadata.category` in `162` files
2. `metadata.created` in `131` files
3. non-empty `region.metadata` in `119` files
4. `metadata.collapsible` in `119` files
5. `metadata.fragment_id` in `118` files
6. `node.data.label` in `41` files
7. `metadata.name` in `40` files
8. `metadata.description` in `40` files
9. `node.data.region` in `40` files
10. option-level `id` in `31` files
11. non-canonical `metadata.type === "SIMPLE"` in `31` files
12. `node.data.collapsed` in `30` files
13. option-level `mute` in `30` files
14. option-level `solo` in `30` files
15. `metadata.id` in `10` files

These are mostly richness and legacy authoring metadata, not parser-breaking defects.

## Unsafe files

No unsafe or ambiguous files were found in the repaired corpus.

## Manifest cleanup

The library manifest had stale metadata after repair normalization.

- `62` manifest entries were out of sync before cleanup.
- `assets/library/asset-fragments-manifest.json` was updated from the PSG files' current `name`, `description`, `nodeCount`, and `edgeCount`.
- `client/public/assets/library/asset-fragments-manifest.json` was updated to match.
- Post-sync validation confirms `0` remaining manifest mismatches.

## Compatibility branches that are probably removable next

The corpus no longer appears to need these legacy shape tolerances for library assets:

- `normalizePsgLikeData()` support for singular top-level `region`
- `normalizePsgLikeData()` support for top-level `groups -> regions`
- top-level name fallback from `metadata.name` or `metadata.title`
- node coordinate fallback from `node.position.x/y`
- region fallback from `label -> name`
- region fallback from `nodeIds -> nodes`
- legacy import/export value fallbacks for canonical node content:
  - WeightedChoice from `data.value` instead of `options`
  - TextBlock from `data.text` instead of `value`
  - Output from `data.value` or `data.label` instead of `template`
  - Concat from mixed `separator` / `value` aliases

Recommended scope for removal:

- Remove these first in corpus-validation and asset-ingest code paths.
- Keep them temporarily in generic user-import paths until non-library imports are audited.

## Compatibility that should remain for now

These richer shapes are common in the asset library and should not be treated as unsafe:

- top-level library metadata beyond the minimal contract
- non-empty `region.metadata`
- `option.meta`
- Output nodes inside fragments

## Practical conclusion

The repaired corpus is in a good state for runtime use, but it is **uniformly richer than the strict weekend MVP authoring example**. That means the next cleanup step is not another repair pass. It is separating:

- the **minimal canonical authoring template** used in docs/examples
- the **supported richer library profile** used by real asset fragments
- the **legacy import compatibility layer** that can now be narrowed for library assets

## Repro

Use the validator script added during this pass:

```bash
node scripts/validate-psg-corpus.js --compact
node scripts/validate-psg-corpus.js --summary
node scripts/validate-psg-corpus.js --sync-manifest
```

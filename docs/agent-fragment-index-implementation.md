# Agent Fragment Index Implementation

## Purpose

This note captures the first execution slice of the fragment-retrieval work:

- keep `.psg` files canonical
- add a normalized agent-facing manifest
- generate searchable index artifacts from that manifest
- expose a local retrieval service for UI and agent use

That initial slice has now expanded into:

- generated retrieval index
- deterministic suggestion service
- topology-aware insertion planner
- shared drop-target classifier
- retrieval commander
- first-pass graph-need scoring
- metadata-aware splice behavior

## Current Source Of Truth

Canonical content:

- `assets/library/**/*.psg`

Curated retrieval metadata:

- `assets/library/agent-fragment-manifest.json`

Generated retrieval artifacts:

- `assets/library/index/agent-fragments.json`
- `assets/library/index/agent-fragments.jsonl`
- `assets/library/index/shards/by-category/*.json`
- `assets/library/index/shards/by-role/*.json`

## Service Boundary

The retrieval seam lives in:

- `packages/asset-browser/src/services/AgentFragmentRetrieval.ts`

It provides:

- `queryFragments(query)`
- `suggestFragmentsForSelection(context)`

The higher-level editor seam now lives across:

- `FragmentSuggestionContext`
- `AgentFragmentSuggestionService`
- `FragmentInsertionPlanner`
- `FragmentDropTargeting`

This is intentionally local-first and deterministic.

## Build Step

Generate the index with:

```bash
pnpm run generate:agent-fragment-index
```

The generator:

- reads `assets/library/agent-fragment-manifest.json`
- writes normalized index artifacts under `assets/library/index`
- keeps the older asset-browser fragment manifest untouched
- now normalizes metadata fields like:
  - `preferredInsertion`
  - `entryStrategy`
  - `exitStrategy`
  - `suggestionWeight`
  - `requiresBranchLane`

## Why This Shape

This avoids turning one large hand-maintained JSON file into another.

Instead:

- fragment files remain the content source
- retrieval metadata is curated in one focused manifest
- index artifacts are generated and query-friendly
- UI and agent code can share the same retrieval contract

## Preserved Fragment Inventory Guidance

The historical fragment audit has been consolidated here so the standalone
audit note does not need to stay in the launch docs set.

Current useful inventory patterns:

- most usable fragments are single-node `WeightedChoice` vocabulary packs
- strong roles include `modifier`, `scenario`, `branch-extension`,
  `output-finisher`, `archetype-support`, and `archetype`
- useful domains include body/silhouette, emotion/mood, action/dynamics,
  setting/environment, facial features, and richer archetype/demo graphs
- weak signals remain inconsistent source metadata, generic region names, and
  mixed metadata richness

Retrieval policy:

- derive normalized retrieval fields in the manifest/index layer before writing
  metadata back into every PSG file
- treat fuller multi-node graphs as archetype or demo inventory rather than
  generic one-click insertion fragments
- prefer graph context plus manifest metadata over folder/category names alone
- keep placeholder or noisy fragments out of generated suggestion results

## Next Step

What now exists:

- `Suggested Fragments` in the asset side panel
- `C` commander with retrieval-backed structural actions
- edge `+` affordance and replacement outline during drag
- initial edge splice execution path
- metadata-aware gating for splice vs free placement
- explicit planner intent for:
  - `replace-node`
  - `insert-edge`
  - `inside-container`
  - `free-place`
- suggested-fragment click/top-insert execution passes the shared planner result
  into the editor insertion path
- `window.__EPIC1_INSERT_TOP_FRAGMENT_SUGGESTION__` now exercises the same
  retrieval/planner/editor seam intended for future agent execution

The next adjacent layer is richer boundary-guided execution:

- add explicit entry/exit metadata for multi-node fragments whose boundaries
  cannot be inferred from graph topology
- use those boundaries in splice and replacement execution
- attach the live agent consumer to the existing shared seam instead of adding a
  private insertion path

The preferred runtime model remains one shared targeting contract:

- `replace-node`
- `insert-edge`
- `inside-container`
- `free-place`

Both manual and future agent flows should continue to use that same contract.

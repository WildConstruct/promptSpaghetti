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

## Next Step

What now exists:

- `Suggested Fragments` in the asset side panel
- `C` commander with retrieval-backed structural actions
- edge `+` affordance and replacement outline during drag
- initial edge splice execution path
- metadata-aware gating for splice vs free placement

The next adjacent layer is richer metadata-guided execution:

- improve multi-node splice with explicit entry/exit semantics
- surface replace-vs-insert-edge intent more explicitly in command execution
- let the future agent path call the same suggestion/commander/insertion seam

The preferred runtime model remains one shared targeting contract:

- `replace-node`
- `insert-edge`
- `free-place`

Both manual and future agent flows should continue to use that same contract.

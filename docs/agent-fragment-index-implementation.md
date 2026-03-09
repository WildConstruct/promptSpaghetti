# Agent Fragment Index Implementation

## Purpose

This note captures the first execution slice of the fragment-retrieval work:

- keep `.psg` files canonical
- add a normalized agent-facing manifest
- generate searchable index artifacts from that manifest
- expose a local retrieval service for UI and agent use

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

## Why This Shape

This avoids turning one large hand-maintained JSON file into another.

Instead:

- fragment files remain the content source
- retrieval metadata is curated in one focused manifest
- index artifacts are generated and query-friendly
- UI and agent code can share the same retrieval contract

## Next Step

Use the retrieval service to power:

- deterministic `Suggested Fragments`
- selection-aware `Suggested Next Nodes`
- agent retrieval before freeform reasoning

The next adjacent layer is topology-aware insertion:

- place suggested fragments near the lane or node they extend
- show line-adjacent insertion affordances during drag
- prefer node replacement when a dragged fragment lands directly on a compatible
  node
- reuse the same insertion planner for future agent actions

The preferred model is one shared drop-target classifier:

- `replace-node`
- `insert-edge`
- `free-place`

That classifier should sit one layer above raw geometry helpers so both manual
and future agent flows can use the same deterministic targeting logic.

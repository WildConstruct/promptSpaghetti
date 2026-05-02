# MVP Recovery Backlog

_Last updated: 2026-04-12_

This backlog turns the brownfield architecture and risk review into an ordered
execution queue.

The order is strict. Later items should not start until the earlier
source-of-truth work is complete enough to keep implementation on the active
path.

## 1. Source-Of-Truth Hardening

### Goal

Make the repo legible enough that implementation lands in the supported launch
surface.

### Work

- keep `ACTIVE_SURFACE.md` aligned to the actual runtime path
- keep `packages/core/components/epic1/SOURCE_OF_TRUTH.md` aligned to the live
  shell-plus-canvas split
- keep brownfield architecture, deployment, and route policy docs consistent
- mark support-only and quarantined surfaces explicitly without deleting them

### Acceptance Criteria

- one canonical frontend entry is documented
- one canonical editor shell and one canonical graph canvas are documented
- one canonical server runtime is documented
- support-only and quarantined surfaces are called out explicitly

## 2. User-Visible MVP Wedge Cleanup

### Goal

Center the product on archetype-first, deterministic PSG authoring instead of a
grab bag of adjacent features.

### Work

- define the golden path as:
  launch -> prompt/template bootstrap -> editor -> deterministic preview ->
  save/open/import/export -> one downstream handoff
- review launch-screen copy and quick-start framing against the archetype-first
  MVP story
- review visible editor actions and tabs for mismatch with the golden path
- identify no-op, misleading, or premature actions that should be hidden,
  relabeled, or deferred

### Acceptance Criteria

- the golden path is explicit in docs and reflected in the product framing
- secondary flows are clearly labeled as non-MVP or hosted-only where needed
- at least one downstream handoff remains in scope and is described honestly

## 3. API / Runtime Narrowing

### Goal

Keep the backend and runtime story honest and bounded around the supported MVP
capabilities.

### Work

- keep route exposure documentation aligned with mounted Fastify behavior
- keep LLM and agent flows framed as bounded graph-aware helpers, not generic AI
  completion surfaces
- keep PSG capabilities, validation, normalization, and export as the durable
  protocol center
- identify any endpoints or runtime branches that should be labeled
  compatibility only, internal only, or non-MVP

### Acceptance Criteria

- route policy docs match the intended mounted behavior
- local-vs-cloud behavior is explained without fake claims
- compatibility-only backend paths are identified and not treated as canonical

## 4. Repo Trim Preparation

### Goal

Prepare later cleanup without introducing current-session deletion risk.

### Work

- keep a trim candidate list for stale docs, reports, backups, alternate mains,
  and non-core scripts
- separate active runtime files from recovery aids and historical artifacts
- mark trim work as post-stabilization unless a file is clearly dangerous or
  misleading

### Acceptance Criteria

- future trim candidates are listed and categorized
- no broad deletion is required to continue MVP recovery
- trim work can be executed later without rediscovering repo boundaries

## Explicit Deferrals

- Jest harness simplification and root test command rationalization
- build-path and deployment convergence work
- aggressive repo deletion or branch-wide pruning
- expansion of non-MVP orchestration, scene assembly, or generalized AI surfaces

## Default Rule

If a change helps stability but increases product ambiguity, do not take it.
If a change narrows ambiguity without deleting history, prefer that approach in
this phase.

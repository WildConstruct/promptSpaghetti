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

### Active Boundary Snapshot

- Canonical frontend path:
  `client/src/main.tsx` -> `client/src/App.tsx` -> launch screen -> Epic 1
  editor container.
- Canonical editor path:
  client editor shell plus `packages/core/components/epic1/Epic1GraphEditor.tsx`.
- Canonical backend path:
  `server/src/index.ts` with LLM, PSG, agent, file, health, and capability
  routes governed by the route-access policy.
- Canonical durable document path:
  flat PSG import/export helpers and shared PSG service contracts.
- Support-only or compatibility surfaces:
  CLI/SDK-adjacent packages, legacy `api/` deployment compatibility, broad
  performance/test infrastructure, and publish-compat output.
- Quarantined or historical surfaces:
  alternate server mains, exploratory editor variants, backup/original/cleaned
  files, and archived task/report material.

### Work

- keep `ACTIVE_SURFACE.md` aligned to the actual runtime path
- keep `packages/core/components/epic1/SOURCE_OF_TRUTH.md` aligned to the live
  shell-plus-canvas split
- keep deployment, route policy, and active validation docs consistent
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
- keep Character Archetype, Vehicle Family, and Building Family framed as the
  primary quick starts; keep Blank Canvas and richer examples framed as manual
  or advanced paths
- review launch-screen copy and quick-start framing against the archetype-first
  MVP story
- review visible editor actions and tabs for mismatch with the golden path:
  preview and fragment library are core, while scene assets, hosted crowd
  expansion, Comfy export, search, relationships, and components are advanced
  or downstream surfaces
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

## 5. Post-MVP Structural Cleanup

### Goal

Reduce drift in active-adjacent code only after launch paths are stable.

### Work

- reduce duplication between the client editor shell and core graph canvas
  where ownership is now clear
- narrow alternate deployment/runtime paths after deployment convergence chooses
  a single backend packaging model
- split advanced editor actions into clearer feature boundaries before hiding or
  deleting user-facing surfaces
- keep package-boundary work scoped so CLI, SDK, and Python-adjacent code do not
  distract from the active MVP app

### Acceptance Criteria

- cleanup lands against a documented source-of-truth owner
- active validation and MVP ship gates stay green after each batch
- compatibility behavior remains covered before historical paths are deleted

## Explicit Deferrals

- Jest harness simplification and root test command rationalization
- build-path and deployment convergence work
- aggressive repo deletion or branch-wide pruning
- expansion of non-MVP orchestration, scene assembly, or generalized AI surfaces

## Post-MVP Technical Backlog

These items preserve the actionable themes from the historical internal
agent-report notes without keeping those launch-irrelevant reports in the repo.

- Finish unused-code pruning after each candidate has a current owner/reference
  check.
- Continue legacy/fallback cleanup around orphaned Epic 1 node variants, but
  keep parser fallback and PSG repair paths until replacement coverage exists.
- Consolidate duplicate or fragmented shared types only where one canonical
  runtime contract is already clear.
- Keep reducing broad `any` usage in active editor, asset-browser, and local
  sandbox paths.
- Keep circular-dependency checks in the repo-quality lane and avoid new
  cross-package import cycles between Epic 1 UI, runtime helpers, and services.
- Narrow defensive `try/catch` blocks to real I/O and compatibility boundaries;
  avoid catch-and-hide behavior in pure product logic.
- Replace misleading comments and stale TODOs with either working behavior,
  tracked backlog items, or removal.
- Keep launch-facing docs focused on current handoff and route/product
  boundaries; consolidate historical architecture, risk, and cruft notes into
  this backlog before deletion.

## Default Rule

If a change helps stability but increases product ambiguity, do not take it.
If a change narrows ambiguity without deleting history, prefer that approach in
this phase.

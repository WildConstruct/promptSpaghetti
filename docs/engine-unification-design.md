# Phase 2 — Engine Unification & Schema Lock (design)

_Companion to `compact-readiness-review.md`. Read-only investigation; this is the design the
implementation commits will follow._

## Problem

Three execution code paths exist; two are live and diverge, one is dead:

1. **Server engine** — `server/src/engine-basic.ts` (`engine.ts` is a 7-line barrel). Handles only
   `Output, Concat, WeightedChoice, SetVariable, GetVariable, Include`; everything else hits
   `default` → returns `''`. Pull-based over `node.inputs` id arrays, single global PRNG. Invoked
   **only** by `POST /preview` (`server/src/index.ts`). No `/export` executes graphs. Cannot run the
   UI's node vocabulary (`TextBlock`, unified `Variable`).
2. **UI engine** — `packages/core/runtime/nodes/epic1/Epic1ExecutionEngine.ts`. Strictly more
   capable: topological sort + cycle detection, branch tracking (`branch-N` source handles,
   `selectedBranches`, inactive-edge short-circuit), per-node deterministic PRNG (`getNodePRNG`),
   `{var}` substitution, per-node timing, continue-on-error. Vocabulary: `TextBlock, WeightedChoice,
   Concat, Variable, Output`. Drives live preview via `PreviewEngine.ts` → `useGraphPreview.ts`.
   **Fully client-side** — the UI never calls the server engine.
3. **Base runtime** — `packages/core/runtime/index.ts` `RuntimeNode` subclasses. Imported by
   neither engine. Dead path.

**Dead hook:** `packages/core/usePreviewSeeds.ts` (the only caller of `POST /preview`) has zero
importers — removed in this phase.

## Schema/registry/engine mismatch

| Type | schema union | registry | engine-basic | Epic1 |
|---|---|---|---|---|
| WeightedChoice / Concat / Output | ✅ | ✅ | ✅ | ✅ |
| Include | ✅ | ✅ | ✅ | ❌ |
| SetVariable / GetVariable | ✅ | ❌ | ✅ | ❌ |
| Variable | ❌ | ✅ | ❌ | ✅ |
| TextBlock | ❌ | ✅ | ❌ | ✅ |
| Subject / Action | ❌ | ✅ | ❌ | ❌ |
| WeightedAdvanced / Conditional / Sequential / Markov | ✅ | ❌ | ❌ | ❌ |
| PythonTransform | ✅ | ❌ | ❌ | ❌ |

Three axes of disagreement: variable model (`SetVariable`/`GetVariable` vs unified `Variable`);
`TextBlock` (UI-only, missing from schema); the advanced/Python tier (schema-only, executed
nowhere).

## Decision

**Make the Epic1 engine canonical; extract a shared `executeGraph` core in `packages/core` that both
the browser `PreviewEngine` and the server import.** The Epic1 engine is what users see and is
strictly more capable; promoting the basic engine would mean re-implementing branch tracking, topo
sort, per-node PRNG, etc. "What you preview is what you ship" ⇒ the server runs Epic1 logic.

## Staged, low-risk plan

- **Stage 0 — Park the advanced tier + reconcile the schema** (own commit, no engine behavior
  change). Remove `WeightedAdvanced/Conditional/Sequential/Markov` (and `PythonTransform` unless Epic
  8 is shipping) from `NodeTypeEnum`, the four schema defs, and `AnyNodeSchema` in
  `graphSchema.ts`. Keep implementations parked (they're consumed by `custom-node-sdk` via
  `AdvancedExecutionContext`, so `advanced.ts` stays importable — only the *graph schema* surface is
  retired). Move/skip their tests. Add `TextBlock` + unified `Variable`; resolve
  `SetVariable`/`GetVariable`.
- **Stage 1 — Shared entrypoint.** New `packages/core/runtime/executeCanonicalGraph.ts`: JSON/PSG
  graph + seed → PSG→Epic1Graph conversion (reuse `nodeFactory` + the conversion currently inline in
  `useGraphPreview.ts`) → `Epic1ExecutionEngine.execute()` → normalized `{ outputs, executionPath,
  weightChoices }`. Must be DOM-free (audit `window.__PSG_PREVIEW_DEBUG__`, `debug.ts`, worker pool).
- **Stage 2 — Browser through it.** `PreviewEngine.ts` calls the shared entrypoint. Verify
  byte-identical preview via golden snapshots across seeds.
- **Stage 3 — Server through it.** `POST /preview` calls the shared entrypoint instead of
  `engine-basic`. Keep the `{ results: [{ seed, output }] }` response shape. Conversion must
  reconstruct edges incl. `sourceHandle`/`targetHandle` (basic engine ignores edges entirely — this
  is the highest-risk step). Re-point/retire `server/__tests__/engine-comprehensive.test.ts`.
- **Stage 4 — Retire `engine-basic.ts` + dead base runtime** once `/preview` runs on core.

## Risks

- **Branch tracking** — server uses `node.inputs` arrays, not edges; the conversion must rebuild edge
  topology + handles. Highest-risk part of Stage 3.
- **Variable model** — `SetVariable`/`GetVariable` vs unified `Variable`; conversion must map, or
  schema must migrate.
- **Isomorphism** — Epic1 engine/context must not touch browser APIs server-side.
- **Determinism re-baseline** — basic (global PRNG) vs Epic1 (per-node sub-seeds) produce different
  outputs for the same seed. Acceptable (UI already uses Epic1), but any golden files keyed to
  basic-engine output must be re-baselined.
- **PythonTransform** — running it server-side is a security/behavior change, not a refactor; park or
  scope explicitly.

## "Lock the schema" = concretely

1. `AnyNodeSchema` contains exactly the node types the canonical engine executes — no advanced/Python
   tier; add `TextBlock` + unified `Variable`.
2. A test asserts `NodeTypeEnum.options` === registry executable PSG types === engine-handled cases,
   so schema/registry/engine cannot silently re-diverge.
